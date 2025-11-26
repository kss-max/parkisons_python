# Quick Setup Guide

## ✅ Setup Complete!

All files have been created and dependencies installed in your virtual environment.

## 📁 Files Created

```
c:\MACHINE LEARNING\python_server\
├── train_model.py       - Model training with all preprocessing steps
├── app.py              - Flask API server with endpoints
├── test_api.py         - API testing script
├── requirements.txt    - Python dependencies
├── README.md          - Complete documentation
├── .gitignore         - Git ignore rules
└── .venv/             - Virtual environment (created)
```

## 🚀 Next Steps

### Step 1: Add Your Dataset

You need to add the `parkinsons.data` file to the project directory:

```
c:\MACHINE LEARNING\python_server\parkinsons.data
```

**Where to get it:**
- From your notebook's data directory
- Or download from: https://archive.ics.uci.edu/ml/datasets/parkinsons

### Step 2: Train the Model

Open PowerShell in the project directory and run:

```powershell
cd "c:\MACHINE LEARNING\python_server"
.\.venv\Scripts\python.exe train_model.py
```

This will:
- ✅ Load and preprocess the data (with all steps documented)
- ✅ Train the SVC model
- ✅ Create `models/` directory
- ✅ Save `svc_model.pkl` and `scaler.pkl`
- ✅ Display accuracy and metrics

### Step 3: Start the Server

```powershell
.\.venv\Scripts\python.exe app.py
```

Server will start at: `http://localhost:5000`

### Step 4: Test the API

In a new PowerShell window:

```powershell
.\.venv\Scripts\python.exe test_api.py
```

This will test all endpoints and show results.

## 🔗 Using in Your MERN App

### React Frontend Example

```javascript
// src/services/api.js
const API_URL = 'http://localhost:5000';

export const predictParkinsons = async (features) => {
  const response = await fetch(`${API_URL}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ features })
  });
  return response.json();
};

// Usage in component
const handlePredict = async () => {
  const features = [/* 22 voice features */];
  const result = await predictParkinsons(features);
  
  console.log('Result:', result.prediction_label);
  console.log('Confidence:', result.confidence);
};
```

## 📊 Preprocessing Steps Summary

The training pipeline performs these steps:

1. **Data Loading** - Load parkinsons.data CSV
2. **Missing Value Check** - Verify data quality
3. **Feature Separation** - Drop 'name' and 'status' columns
4. **Train-Test Split** - 80/20 stratified split
5. **Feature Scaling** ⭐ - StandardScaler (CRITICAL for SVC)
6. **Model Training** - SVC with linear kernel
7. **Save Artifacts** - Save model and scaler for deployment

## 📡 API Endpoints

- `GET /` - Health check
- `GET /api/health` - Detailed health status
- `GET /api/features` - List all 22 feature names
- `POST /api/predict` - Single prediction
- `POST /api/predict/batch` - Batch predictions

## ⚠️ Important Notes

1. **Feature Order Matters** - Always send features in the correct order
2. **Scaling is Automatic** - The API handles scaling using saved scaler
3. **CORS Enabled** - Ready for MERN integration
4. **22 Features Required** - API validates feature count

## 🐛 Troubleshooting

**If parkinsons.data is missing:**
- Copy it from your notebook directory or download it
- Place it in: `c:\MACHINE LEARNING\python_server\`

**If model files are missing:**
- Run `train_model.py` first to create them

**If port 5000 is in use:**
```powershell
$env:PORT=8080
.\.venv\Scripts\python.exe app.py
```

## 📚 Full Documentation

See `README.md` for complete documentation including:
- All 22 feature names and descriptions
- Detailed API request/response examples
- Deployment options
- Integration examples

---

**Ready to start!** Just add `parkinsons.data` and run the training script.
