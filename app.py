# app.py
"""
Single FastAPI ML inference server for:
 - MRI model (.h5)  -> POST /predict/mri
 - Voice model (scikit-learn SVC) -> POST /predict/voice
"""

import io
import os
from typing import Optional, List

import numpy as np
import joblib
import cv2
import tensorflow as tf
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

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
app = FastAPI(title="Parkinsons-ML-Server", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# LOAD MODELS
# -------------------------
if not os.path.exists(MRI_MODEL_PATH):
    raise FileNotFoundError(f"MRI model not found at {MRI_MODEL_PATH}")

mri_model = tf.keras.models.load_model(MRI_MODEL_PATH)
print(f"✅ MRI model loaded from {MRI_MODEL_PATH}")

if not os.path.exists(VOICE_MODEL_PATH):
    raise FileNotFoundError(f"Voice model not found at {VOICE_MODEL_PATH}")

voice_model = joblib.load(VOICE_MODEL_PATH)
print(f"✅ Voice model loaded from {VOICE_MODEL_PATH}")

_voice_has_proba = hasattr(voice_model, "predict_proba")

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
    return {
        "status": "ok",
        "mri_model": True,
        "voice_model": True
    }

# ---------- MRI ----------
@app.post("/predict/mri")
async def predict_mri(file: UploadFile = File(...)):

    if not file or not file.content_type:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    if file.content_type.split("/")[0] != "image":
        raise HTTPException(status_code=400, detail="Upload an image file")

    try:
        bytes_data = await file.read()
        x = preprocess_mri_from_bytes(bytes_data)

        preds = mri_model.predict(x)
        prob = float(preds.ravel()[0])
        prob = float(np.clip(prob, 0, 1))

        label = "parkinsons" if prob > 0.5 else "normal"

        return {"prediction": label, "confidence": prob}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MRI prediction failed: {e}")

# ---------- VOICE ----------
@app.post("/predict/voice")
async def predict_voice(request: Request, file: Optional[UploadFile] = File(None)):

    try:
        # If uploaded file (.npy)
        if file is not None:
            arr = preprocess_voice_from_npy_bytes(await file.read())
        else:
            body = await request.json()
            if "features" in body:
                arr = preprocess_voice_from_list(body["features"])
            elif isinstance(body, list):
                arr = preprocess_voice_from_list(body)
            else:
                raise HTTPException(400, "Invalid voice input")

        # Check feature count (voice model expects 22 features)
        if arr.shape[1] != 22:
            raise HTTPException(
                400, f"Expected 22 features, got {arr.shape[1]}"
            )

        pred = int(voice_model.predict(arr)[0])
        label = VOICE_LABELS.get(pred, str(pred))

        # probability
        prob_dict = {}
        if _voice_has_proba:
            probs = voice_model.predict_proba(arr)[0]
            for cls, p in zip(voice_model.classes_, probs):
                prob_dict[VOICE_LABELS[int(cls)]] = float(p)
            confidence = float(max(probs))
        else:
            prob_dict[label] = 1.0
            confidence = 1.0

        return {
            "prediction": label,
            "confidence": confidence,
            "probability": prob_dict
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Voice prediction failed: {e}")

# -------------------------
# MAIN (for local dev)
# -------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
