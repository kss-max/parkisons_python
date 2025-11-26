Parkinson's Multi-Model Inference Server
=========================================

This repository contains a single-file FastAPI server that loads TWO models at startup:

- `models/mri_model.h5`    — TensorFlow MRI classifier (EfficientNet, VGG, etc.)
- `models/voice_model.pkl` — scikit-learn SVC voice classifier
- `models/scaler.pkl`     — StandardScaler used during voice model training

Folder structure
----------------

ml-server/
  ├─ app.py            # Single FastAPI app with both endpoints
  ├─ requirements.txt  # Python dependencies
  └─ models/           # Place your models here
      ├─ mri_model.h5
      ├─ voice_model.pkl
      └─ scaler.pkl

Quick setup
-----------

1. Create (or copy) the `models/` directory and place the three model files there.
2. Create and activate a Python environment, then install dependencies:

```powershell
cd "c:\MACHINE LEARNING\python_server\ml-server"
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

3. Run the server locally with uvicorn:

```powershell
.\.venv\Scripts\python -m uvicorn app:app --host 0.0.0.0 --port 8000
```

Endpoints
---------

1) POST /predict/mri

- Purpose: Predict Parkinson's from an MRI image file
- Accepts: multipart file upload field `image` (png/jpg)
- Preprocessing (must match training EXACTLY):
  • Read raw bytes -> NumPy array using `cv2.imdecode`
  • Convert to grayscale
  • Resize to (128,128)
  • Convert grayscale -> 3-channel RGB
  • Normalize: `(img - 40.60) / (57.22 + 1e-6)`
  • Convert to `float32`
  • Expand dims -> shape `(1,128,128,3)`
  • Pass into `mri_model.predict()`
- Response JSON:

```json
{ "prediction": "parkinsons" | "normal", "confidence": 0.87 }
```

2) POST /predict/voice

- Purpose: Predict Parkinson's from 22 numerical voice features
- Input options:
  - Upload a `.npy` file (containing a 1-D array of 22 features)
  - OR send raw JSON body: `{ "features": [22 numbers] }`
- Preprocessing (must match training EXACTLY):
  • Load `voice_model.pkl` (scikit-learn SVC)
  • Load `scaler.pkl` (StandardScaler)
  • Convert values -> `numpy.float32`, reshape `(1,-1)`
  • Apply `scaler.transform()`
  • Compute `predict()` and `predict_proba()`
- Response JSON:

```json
{
  "prediction": "parkinsons" | "healthy",
  "confidence": 0.92,
  "probability": { "healthy": 0.08, "parkinsons": 0.92 }
}
```

Notes & Validation
------------------

- Both models are loaded once at startup for performance.
- The server validates inputs and returns helpful errors (400/500/503) when appropriate.
- Ensure the features array has exactly 22 values for the voice endpoint.
- The MRI image preprocessing is implemented exactly per your specification — do not change mean/std or size unless you update training accordingly.

Troubleshooting
---------------

- If you see `model not loaded` errors, confirm the model files exist at `./models/` and are readable.
- If predictions differ from expected, confirm preprocessing used here matches the one used in training (size, color conversion, normalization constants, ordering of voice features).

Security & Production
---------------------
- For production, run under a production ASGI server (Gunicorn + Uvicorn workers) or containerize.
- Consider adding request size limits for uploads and authentication for endpoints.

That's it — you now have a single-file FastAPI server that serves both MRI and voice models for inference.
