# 🧪 FastAPI ML Server - Testing Guide

Complete guide for testing the Parkinson's ML prediction endpoints using Postman, cURL, and Python.

## 📋 Table of Contents
- [Quick Start](#quick-start)
- [API Endpoints Overview](#api-endpoints-overview)
- [Postman Testing](#postman-testing)
- [cURL Testing](#curl-testing)
- [Python Testing](#python-testing)
- [Expected Responses](#expected-responses)

---

## 🚀 Quick Start

**Local Server:**
```bash
cd ml-server
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

**Base URL:** `http://localhost:8000`

---

## 📡 API Endpoints Overview

| Endpoint | Method | Purpose | Input |
|----------|--------|---------|-------|
| `/` | GET | Health check (fast) | None |
| `/health` | GET | Detailed health status | None |
| `/predict/mri` | POST | MRI image prediction | Image file (form-data) |
| `/predict/voice` | POST | Voice features prediction | JSON or .npy file |

---

## 🔵 Postman Testing

### 1️⃣ Health Check Endpoints

#### **GET /** (Fast Health Check)
```
Method: GET
URL: http://localhost:8000/
```

**Expected Response:**
```json
{
  "status": "ok",
  "service": "Parkinsons ML Server",
  "version": "2.0",
  "endpoints": {
    "mri": "/predict/mri",
    "voice": "/predict/voice",
    "health": "/health"
  }
}
```

#### **GET /health** (Detailed Check)
```
Method: GET
URL: http://localhost:8000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "models": {
    "mri": "available",
    "voice": "available"
  },
  "model_paths": {
    "mri": "c:\\MACHINE LEARNING\\python_server\\ml-server\\models\\model_bestmri.h5",
    "voice": "c:\\MACHINE LEARNING\\python_server\\ml-server\\models\\voice_model.joblib"
  }
}
```

---

### 2️⃣ MRI Image Prediction

#### **POST /predict/mri**

**Postman Setup:**
1. Method: `POST`
2. URL: `http://localhost:8000/predict/mri`
3. Go to **Body** tab
4. Select **form-data**
5. Add key-value pair:
   - **Key:** `file` (change type to **File** using dropdown)
   - **Value:** Select an MRI image file (PNG, JPEG, etc.)

**Visual Guide:**
```
┌─────────────────────────────────────────┐
│ POST /predict/mri                       │
├─────────────────────────────────────────┤
│ Body: form-data                         │
│                                         │
│ KEY          TYPE      VALUE            │
│ file         File      [Select Image]   │
└─────────────────────────────────────────┘
```

**Expected Response:**
```json
{
  "prediction": "parkinsons",  // or "normal"
  "confidence": 0.8532,
  "inference_time_seconds": 0.234
}
```

**Common Errors:**
- `400: Invalid file type` → Ensure you uploaded an image file
- `400: No file uploaded` → Check key name is exactly `file`
- `500: Image processing failed` → Image might be corrupted

---

### 3️⃣ Voice Features Prediction

#### **Option A: JSON Body (Recommended)**

**Postman Setup:**
1. Method: `POST`
2. URL: `http://localhost:8000/predict/voice`
3. Go to **Body** tab
4. Select **raw**
5. Change dropdown from **Text** to **JSON**
6. Paste the JSON below:

```json
{
  "features": [
    119.992, 157.302, 74.997, 0.00784, 0.00007,
    0.00370, 0.00554, 0.01109, 0.04374, 0.426,
    0.02182, 0.03130, 0.02971, 0.06545, 0.02211,
    21.033, 0.414783, 0.815285, -4.813031, 0.266482,
    2.301442, 0.284654
  ]
}
```

**Visual Guide:**
```
┌─────────────────────────────────────────┐
│ POST /predict/voice                     │
├─────────────────────────────────────────┤
│ Body: raw (JSON)                        │
│                                         │
│ {                                       │
│   "features": [119.992, 157.302, ...]   │
│ }                                       │
└─────────────────────────────────────────┘
```

**Expected Response:**
```json
{
  "prediction": "parkinsons",  // or "healthy"
  "confidence": 0.8532,
  "probability": {
    "healthy": 0.1468,
    "parkinsons": 0.8532
  },
  "inference_time_seconds": 0.012
}
```

#### **Option B: .npy File Upload**

**Postman Setup:**
1. Method: `POST`
2. URL: `http://localhost:8000/predict/voice`
3. Go to **Body** tab
4. Select **form-data**
5. Add key-value pair:
   - **Key:** `file` (change type to **File**)
   - **Value:** Select a `.npy` file containing 22 features

**Common Errors:**
- `400: Expected 22 features, got X` → Check your feature array length
- `400: No input provided` → Ensure JSON body or file is sent
- `400: Invalid JSON format` → Check JSON syntax

---

## 💻 cURL Testing

### Windows PowerShell

#### Health Check
```powershell
curl http://localhost:8000/
curl http://localhost:8000/health
```

#### MRI Prediction
```powershell
curl -X POST http://localhost:8000/predict/mri `
  -F "file=@path/to/mri_image.png"
```

#### Voice Prediction (JSON)
```powershell
$body = @{
  features = @(
    119.992, 157.302, 74.997, 0.00784, 0.00007,
    0.00370, 0.00554, 0.01109, 0.04374, 0.426,
    0.02182, 0.03130, 0.02971, 0.06545, 0.02211,
    21.033, 0.414783, 0.815285, -4.813031, 0.266482,
    2.301442, 0.284654
  )
} | ConvertTo-Json

curl -X POST http://localhost:8000/predict/voice `
  -H "Content-Type: application/json" `
  -d $body
```

### Linux/macOS

#### Health Check
```bash
curl http://localhost:8000/
curl http://localhost:8000/health
```

#### MRI Prediction
```bash
curl -X POST http://localhost:8000/predict/mri \
  -F "file=@path/to/mri_image.png"
```

#### Voice Prediction (JSON)
```bash
curl -X POST http://localhost:8000/predict/voice \
  -H "Content-Type: application/json" \
  -d '{
    "features": [
      119.992, 157.302, 74.997, 0.00784, 0.00007,
      0.00370, 0.00554, 0.01109, 0.04374, 0.426,
      0.02182, 0.03130, 0.02971, 0.06545, 0.02211,
      21.033, 0.414783, 0.815285, -4.813031, 0.266482,
      2.301442, 0.284654
    ]
  }'
```

---

## 🐍 Python Testing

### Using `requests` library

```python
import requests
import json

# Base URL
BASE_URL = "http://localhost:8000"

# 1. Health Check
def test_health():
    response = requests.get(f"{BASE_URL}/")
    print("Health Check:", response.json())

# 2. MRI Prediction
def test_mri_prediction(image_path):
    with open(image_path, 'rb') as f:
        files = {'file': ('mri_scan.png', f, 'image/png')}
        response = requests.post(f"{BASE_URL}/predict/mri", files=files)
    
    print("MRI Prediction:", response.json())
    return response.json()

# 3. Voice Prediction (JSON)
def test_voice_prediction():
    features = {
        "features": [
            119.992, 157.302, 74.997, 0.00784, 0.00007,
            0.00370, 0.00554, 0.01109, 0.04374, 0.426,
            0.02182, 0.03130, 0.02971, 0.06545, 0.02211,
            21.033, 0.414783, 0.815285, -4.813031, 0.266482,
            2.301442, 0.284654
        ]
    }
    
    response = requests.post(
        f"{BASE_URL}/predict/voice",
        json=features,
        headers={"Content-Type": "application/json"}
    )
    
    print("Voice Prediction:", response.json())
    return response.json()

# 4. Voice Prediction (.npy file)
def test_voice_prediction_npy(npy_path):
    with open(npy_path, 'rb') as f:
        files = {'file': ('features.npy', f, 'application/octet-stream')}
        response = requests.post(f"{BASE_URL}/predict/voice", files=files)
    
    print("Voice Prediction (NPY):", response.json())
    return response.json()

# Run tests
if __name__ == "__main__":
    test_health()
    # test_mri_prediction("path/to/mri_image.png")
    test_voice_prediction()
```

### Using `httpx` (async)

```python
import httpx
import asyncio

async def test_async():
    async with httpx.AsyncClient() as client:
        # Health check
        response = await client.get("http://localhost:8000/")
        print("Health:", response.json())
        
        # Voice prediction
        features = {"features": [119.992, 157.302, ...]}  # 22 values
        response = await client.post(
            "http://localhost:8000/predict/voice",
            json=features
        )
        print("Prediction:", response.json())

asyncio.run(test_async())
```

---

## ✅ Expected Responses

### Success Responses

#### MRI Prediction Success
```json
{
  "prediction": "parkinsons",
  "confidence": 0.8532,
  "inference_time_seconds": 0.234
}
```

#### Voice Prediction Success
```json
{
  "prediction": "healthy",
  "confidence": 0.9234,
  "probability": {
    "healthy": 0.9234,
    "parkinsons": 0.0766
  },
  "inference_time_seconds": 0.012
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "detail": "Expected 22 features, got 20. Please provide all required voice measurements."
}
```

#### 500 Internal Server Error
```json
{
  "detail": "MRI prediction failed: Invalid image"
}
```

---

## 📊 Voice Features Reference

The voice prediction requires exactly **22 features** in this order:

1. `MDVP:Fo(Hz)` - Average vocal fundamental frequency
2. `MDVP:Fhi(Hz)` - Maximum vocal fundamental frequency
3. `MDVP:Flo(Hz)` - Minimum vocal fundamental frequency
4. `MDVP:Jitter(%)` - Jitter percentage
5. `MDVP:Jitter(Abs)` - Absolute jitter
6. `MDVP:RAP` - Relative amplitude perturbation
7. `MDVP:PPQ` - Five-point period perturbation quotient
8. `Jitter:DDP` - Average absolute difference of differences
9. `MDVP:Shimmer` - Shimmer
10. `MDVP:Shimmer(dB)` - Shimmer in dB
11. `Shimmer:APQ3` - Three-point amplitude perturbation quotient
12. `Shimmer:APQ5` - Five-point amplitude perturbation quotient
13. `MDVP:APQ` - Amplitude perturbation quotient
14. `Shimmer:DDA` - Average absolute difference
15. `NHR` - Noise-to-harmonics ratio
16. `HNR` - Harmonics-to-noise ratio
17. `RPDE` - Recurrence period density entropy
18. `DFA` - Detrended fluctuation analysis
19. `spread1` - Nonlinear measure of fundamental frequency variation
20. `spread2` - Nonlinear measure of fundamental frequency variation
21. `D2` - Correlation dimension
22. `PPE` - Pitch period entropy

---

## 🔍 Troubleshooting

### Issue: "Connection refused"
- ✅ Ensure server is running: `uvicorn app:app --host 0.0.0.0 --port 8000`
- ✅ Check correct port (default: 8000)

### Issue: "Model not found"
- ✅ Verify models exist in `ml-server/models/` directory
- ✅ Check file names: `model_bestmri.h5`, `voice_model.joblib`

### Issue: First request is slow (~5-10 seconds)
- ✅ **Expected behavior** - TensorFlow compiles the computation graph on first request
- ✅ Subsequent requests will be instant (~0.01-0.5s)

### Issue: "Expected 22 features, got X"
- ✅ Count your feature array - must be exactly 22 values
- ✅ Check for missing values or extra commas in JSON

---

## 🌐 Production Testing

When deployed to **Railway/Render**, replace `localhost:8000` with your deployment URL:

```
https://your-app-name.railway.app/
https://your-app-name.onrender.com/
```

**Example:**
```bash
curl https://your-app-name.railway.app/health
```

---

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Postman Documentation](https://learning.postman.com/)
- [cURL Manual](https://curl.se/docs/manual.html)
- [Python requests library](https://requests.readthedocs.io/)

---

**Last Updated:** November 2025
