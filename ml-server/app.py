# app.py
"""
Single FastAPI ML inference server for:
 - MRI model (.h5)  -> POST /predict/mri
 - Voice model (scikit-learn SVC) -> POST /predict/voice
"""

import io
import os
import time
import logging
from typing import Optional, List

import numpy as np
import joblib
import cv2
import tensorflow as tf
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

# -------------------------
# LOGGING SETUP
# -------------------------
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# -------------------------
# CONFIG / PATHS
# -------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")
MRI_MODEL_PATH = os.path.join(MODEL_DIR, "model_bestmri.h5")
VOICE_MODEL_PATH = os.path.join(MODEL_DIR, "voice_model.joblib")

IMG_SIZE = (128, 128)

VOICE_LABELS = {0: "healthy", 1: "parkinsons"}

# -------------------------
# FASTAPI + CORS
# -------------------------
app = FastAPI(
    title="Parkinsons-ML-Server",
    version="2.0",
    description="FastAPI ML inference server for Parkinson's disease prediction using MRI and voice data"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# LAZY MODEL LOADING
# -------------------------
mri_model = None
voice_model = None
_voice_has_proba = False

def load_mri_model():
    """Lazy load MRI model with timing and error handling."""
    global mri_model
    if mri_model is not None:
        return mri_model
    
    logger.info(f"Loading MRI model from {MRI_MODEL_PATH}...")
    start_time = time.time()
    
    if not os.path.exists(MRI_MODEL_PATH):
        logger.error(f"MRI model file not found at {MRI_MODEL_PATH}")
        raise FileNotFoundError(f"MRI model not found at {MRI_MODEL_PATH}")
    
    try:
        mri_model = tf.keras.models.load_model(MRI_MODEL_PATH)
        load_time = time.time() - start_time
        logger.info(f"✅ MRI model loaded successfully in {load_time:.2f}s")
        return mri_model
    except Exception as e:
        logger.error(f"Failed to load MRI model: {e}")
        raise

def load_voice_model():
    """Lazy load Voice model with timing and error handling."""
    global voice_model, _voice_has_proba
    if voice_model is not None:
        return voice_model
    
    logger.info(f"Loading Voice model from {VOICE_MODEL_PATH}...")
    start_time = time.time()
    
    if not os.path.exists(VOICE_MODEL_PATH):
        logger.error(f"Voice model file not found at {VOICE_MODEL_PATH}")
        raise FileNotFoundError(f"Voice model not found at {VOICE_MODEL_PATH}")
    
    try:
        voice_model = joblib.load(VOICE_MODEL_PATH)
        _voice_has_proba = hasattr(voice_model, "predict_proba")
        load_time = time.time() - start_time
        logger.info(f"✅ Voice model loaded successfully in {load_time:.2f}s")
        return voice_model
    except Exception as e:
        logger.error(f"Failed to load Voice model: {e}")
        raise

# -------------------------
# MRI PREPROCESSING (NEW)
# -------------------------
def preprocess_mri_from_bytes(img_bytes: bytes) -> np.ndarray:
    """
    NEW CORRECT PREPROCESS:
      - decode image
      - convert to BGR → RGB
      - resize to 128x128
      - DO NOT NORMALIZE (model has preprocessing inside)
      - return float32 (1,128,128,3)
    """
    nparr = np.frombuffer(img_bytes, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img_bgr is None:
        raise ValueError("Invalid image")

    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    img_resized = cv2.resize(img_rgb, IMG_SIZE)

    img_f = img_resized.astype(np.float32)
    img_batch = np.expand_dims(img_f, axis=0)   # (1,128,128,3)

    return img_batch

# -------------------------
# VOICE PREPROCESSING
# -------------------------
def preprocess_voice_from_npy_bytes(npy_bytes: bytes) -> np.ndarray:
    try:
        arr = np.load(io.BytesIO(npy_bytes), allow_pickle=False)
    except Exception as e:
        raise ValueError(f"Could not load .npy: {e}")

    arr = np.array(arr).astype(np.float32)

    if arr.ndim == 1:
        arr = arr.reshape(1, -1)
    elif arr.ndim == 2 and arr.shape[0] != 1:
        arr = arr.reshape(1, -1)

    return arr

def preprocess_voice_from_list(features: List[float]) -> np.ndarray:
    return np.array(features, dtype=np.float32).reshape(1, -1)

# -------------------------
# ROUTES
# -------------------------
@app.get("/")
async def root():
    """Health check endpoint - returns immediately without loading models."""
    return {
        "status": "ok",
        "service": "Parkinsons ML Server",
        "version": "2.0",
        "endpoints": {
            "mri": "/predict/mri",
            "voice": "/predict/voice",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    """Detailed health check - loads models to verify they're accessible."""
    try:
        mri_loaded = os.path.exists(MRI_MODEL_PATH)
        voice_loaded = os.path.exists(VOICE_MODEL_PATH)
        
        return {
            "status": "healthy" if (mri_loaded and voice_loaded) else "degraded",
            "models": {
                "mri": "available" if mri_loaded else "missing",
                "voice": "available" if voice_loaded else "missing"
            },
            "model_paths": {
                "mri": MRI_MODEL_PATH,
                "voice": VOICE_MODEL_PATH
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=500,
            content={"status": "unhealthy", "error": str(e)}
        )

# ---------- MRI ----------
@app.post("/predict/mri")
async def predict_mri(file: UploadFile = File(...)):
    """
    MRI image prediction endpoint.
    
    Expects: form-data with key 'file' containing an image (PNG, JPEG, etc.)
    Returns: prediction label and confidence score
    """
    # Load model on first request
    model = load_mri_model()
    
    # Validate file upload
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded. Use form-data key 'file'")
    
    if not file.content_type or file.content_type.split("/")[0] != "image":
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {file.content_type}. Expected image file (PNG, JPEG, etc.)"
        )
    
    logger.info(f"Processing MRI image: {file.filename}, type: {file.content_type}")

    try:
        start_time = time.time()
        bytes_data = await file.read()
        x = preprocess_mri_from_bytes(bytes_data)

        preds = model.predict(x)
        prob = float(preds.ravel()[0])
        prob = float(np.clip(prob, 0, 1))

        label = "parkinsons" if prob > 0.5 else "normal"
        
        inference_time = time.time() - start_time
        logger.info(f"MRI prediction complete: {label} ({prob:.4f}) in {inference_time:.3f}s")

        return {
            "prediction": label,
            "confidence": prob,
            "inference_time_seconds": round(inference_time, 3)
        }

    except ValueError as ve:
        logger.error(f"MRI preprocessing error: {ve}")
        raise HTTPException(status_code=400, detail=f"Image processing failed: {ve}")
    except Exception as e:
        logger.error(f"MRI prediction failed: {e}")
        raise HTTPException(status_code=500, detail=f"MRI prediction failed: {e}")

# ---------- VOICE ----------
@app.post("/predict/voice")
async def predict_voice(request: Request, file: Optional[UploadFile] = File(None)):
    """
    Voice features prediction endpoint.
    
    Accepts either:
    1. JSON body: {"features": [22 float values]}
    2. File upload (.npy format)
    
    Returns: prediction label, confidence, and probability distribution
    """
    # Load model on first request
    model = load_voice_model()
    
    logger.info(f"Processing voice prediction request")

    try:
        start_time = time.time()
        
        # If uploaded file (.npy)
        if file is not None:
            logger.info(f"Reading voice features from file: {file.filename}")
            arr = preprocess_voice_from_npy_bytes(await file.read())
        else:
            # Try to read JSON body
            try:
                body = await request.json()
            except Exception as e:
                raise HTTPException(
                    400,
                    detail="No input provided. Send either JSON body {'features': [...]} or upload .npy file"
                )
            
            if "features" in body:
                arr = preprocess_voice_from_list(body["features"])
            elif isinstance(body, list):
                arr = preprocess_voice_from_list(body)
            else:
                raise HTTPException(
                    400,
                    detail="Invalid JSON format. Expected {'features': [22 values]} or direct array"
                )

        # Check feature count (voice model expects 22 features)
        if arr.shape[1] != 22:
            raise HTTPException(
                400,
                detail=f"Expected 22 features, got {arr.shape[1]}. Please provide all required voice measurements."
            )

        pred = int(model.predict(arr)[0])
        label = VOICE_LABELS.get(pred, str(pred))

        # probability
        prob_dict = {}
        if _voice_has_proba:
            probs = model.predict_proba(arr)[0]
            for cls, p in zip(model.classes_, probs):
                prob_dict[VOICE_LABELS[int(cls)]] = float(p)
            confidence = float(max(probs))
        else:
            prob_dict[label] = 1.0
            confidence = 1.0
        
        inference_time = time.time() - start_time
        logger.info(f"Voice prediction complete: {label} ({confidence:.4f}) in {inference_time:.3f}s")

        return {
            "prediction": label,
            "confidence": confidence,
            "probability": prob_dict,
            "inference_time_seconds": round(inference_time, 3)
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Voice prediction failed: {e}")
        raise HTTPException(500, f"Voice prediction failed: {e}")

# -------------------------
# MAIN (for local dev)
# -------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
