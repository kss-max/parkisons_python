# Parkinson's Disease Prediction API Server

A Flask-based REST API server for Parkinson's disease prediction using Support Vector Classification (SVC).

## 📋 Preprocessing Steps Performed

The model training pipeline (`train_model.py`) performs the following preprocessing steps:

### 1. **Data Loading**
   - Loads the `parkinsons.data` CSV file
   - Dataset contains voice measurements from patients

### 2. **Missing Value Check**
   - Verifies there are no missing values in the dataset

### 3. **Feature and Target Separation**
   - **Dropped columns**: `name` (patient identifier), `status` (target variable)
   - **Features (X)**: 22 voice measurement features
   - **Target (y)**: `status` column (0 = Healthy, 1 = Parkinson's)

### 4. **Train-Test Split**
   - **Split ratio**: 80% training, 20% testing
   - **Stratified split**: Maintains class distribution in both sets
   - **Random state**: 42 (for reproducibility)

### 5. **Feature Scaling** ⭐ **CRITICAL STEP**
   - **Method**: StandardScaler from scikit-learn
   - **Why needed**: SVC is sensitive to feature scales
   - **Process**:
     - Fit scaler on training data only
     - Transform both training and testing data
     - Each feature scaled to mean=0, std=1
   - **Saved**: Scaler saved as `scaler.pkl` for inference

### 6. **Model Training**
   - **Algorithm**: Support Vector Classification (SVC)
   - **Kernel**: Linear
   - **Probability**: Enabled for confidence scores

### 7. **Model Artifacts Saved**
   - `models/svc_model.pkl` - Trained SVC model
   - `models/scaler.pkl` - Fitted StandardScaler

## 🚀 Quick Start

### 1. Install Dependencies

```powershell
pip install -r requirements.txt
```

### 2. Train the Model

First, ensure you have `parkinsons.data` in the project directory, then run:

```powershell
python train_model.py
```

This will:
- Load and preprocess the data
- Train the SVC model
- Save model artifacts to `models/` directory
- Display training metrics and accuracy

### 3. Start the Server

```powershell
python app.py
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### 1. Health Check
```
GET /
GET /api/health
```

**Response:**
```json
{
  "status": "online",
  "service": "Parkinson's Disease Prediction API",
  "model_loaded": true,
  "timestamp": "2025-11-26T10:30:00"
}
```

### 2. Get Expected Features
```
GET /api/features
```

**Response:**
```json
{
  "features": [
    "MDVP:Fo(Hz)", "MDVP:Fhi(Hz)", "MDVP:Flo(Hz)", 
    "MDVP:Jitter(%)", "MDVP:Jitter(Abs)", ...
  ],
  "count": 22
}
```

### 3. Single Prediction
```
POST /api/predict
```

**Request (Array Format):**
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

**Request (Dictionary Format):**
```json
{
  "MDVP:Fo(Hz)": 119.992,
  "MDVP:Fhi(Hz)": 157.302,
  "MDVP:Flo(Hz)": 74.997,
  ...
}
```

**Response:**
```json
{
  "prediction": 1,
  "prediction_label": "Parkinson's Disease",
  "probability": {
    "healthy": 0.15,
    "parkinsons": 0.85
  },
  "confidence": 0.85,
  "timestamp": "2025-11-26T10:30:00",
  "status": "success"
}
```

### 4. Batch Prediction
```
POST /api/predict/batch
```

**Request:**
```json
{
  "data": [
    [119.992, 157.302, 74.997, ...],
    [122.400, 148.650, 113.819, ...]
  ]
}
```

**Response:**
```json
{
  "results": [
    {
      "sample_id": 0,
      "prediction": 1,
      "prediction_label": "Parkinson's Disease",
      "probability": {"healthy": 0.15, "parkinsons": 0.85},
      "confidence": 0.85
    },
    ...
  ],
  "total_samples": 2,
  "status": "success"
}
```

## 🔗 Integration with MERN App

### React/Node.js Example

```javascript
// API configuration
const API_URL = 'http://localhost:5000';

// Prediction function
async function predictParkinsons(features) {
  try {
    const response = await fetch(`${API_URL}/api/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ features })
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      console.log('Prediction:', data.prediction_label);
      console.log('Confidence:', (data.confidence * 100).toFixed(2) + '%');
      return data;
    } else {
      console.error('Error:', data.error);
      return null;
    }
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
}

// Example usage
const voiceFeatures = [
  119.992, 157.302, 74.997, 0.00784, 0.00007,
  0.00370, 0.00554, 0.01109, 0.04374, 0.426,
  0.02182, 0.03130, 0.02971, 0.06545, 0.02211,
  21.033, 0.414783, 0.815285, -4.813031, 0.266482,
  2.301442, 0.284654
];

predictParkinsons(voiceFeatures);
```

## 📊 Feature Names (22 total)

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

## 🌐 Deployment Options

### Option 1: Local Deployment
```powershell
python app.py
```
Access at: `http://localhost:5000`

### Option 2: Production Deployment (Gunicorn)
```powershell
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Option 3: Environment Variables
```powershell
$env:PORT=8080; python app.py
$env:DEBUG="true"; python app.py
```

## 🧪 Testing the API

### Using PowerShell (curl)
```powershell
# Health check
curl http://localhost:5000/api/health

# Get features
curl http://localhost:5000/api/features

# Make prediction
curl -X POST http://localhost:5000/api/predict `
  -H "Content-Type: application/json" `
  -d '{\"features\": [119.992, 157.302, 74.997, 0.00784, 0.00007, 0.00370, 0.00554, 0.01109, 0.04374, 0.426, 0.02182, 0.03130, 0.02971, 0.06545, 0.02211, 21.033, 0.414783, 0.815285, -4.813031, 0.266482, 2.301442, 0.284654]}'
```

### Using Python requests
```python
import requests

# Make prediction
response = requests.post(
    'http://localhost:5000/api/predict',
    json={
        'features': [
            119.992, 157.302, 74.997, 0.00784, 0.00007,
            0.00370, 0.00554, 0.01109, 0.04374, 0.426,
            0.02182, 0.03130, 0.02971, 0.06545, 0.02211,
            21.033, 0.414783, 0.815285, -4.813031, 0.266482,
            2.301442, 0.284654
        ]
    }
)
print(response.json())
```

## 📁 Project Structure

```
python_server/
├── app.py                  # Flask API server
├── train_model.py          # Model training script
├── requirements.txt        # Python dependencies
├── README.md              # This file
├── models/                # Model artifacts (created after training)
│   ├── svc_model.pkl
│   └── scaler.pkl
└── parkinsons.data        # Dataset (you need to add this)
```

## ⚠️ Important Notes

1. **Scaling is Critical**: Always use the saved `scaler.pkl` for inference. The API automatically handles this.
2. **Feature Order**: Features must be in the exact order specified in the feature list.
3. **CORS Enabled**: The API allows cross-origin requests for MERN integration.
4. **Error Handling**: The API returns appropriate error messages for invalid inputs.

## 📝 Model Performance

After training, you'll see metrics like:
- **Accuracy**: ~90-95% (typical for this dataset)
- **Precision/Recall**: For both Healthy and Parkinson's classes
- **Confusion Matrix**: Shows true/false positives and negatives

## 🔧 Troubleshooting

**Model not loading?**
- Ensure you've run `train_model.py` first
- Check that `models/` directory contains both `.pkl` files

**CORS errors in MERN app?**
- CORS is already enabled via `flask-cors`
- Update `API_URL` in your React app

**Port already in use?**
- Change port: `$env:PORT=8080; python app.py`

## 📚 Next Steps

1. Train the model: `python train_model.py`
2. Start the server: `python app.py`
3. Integrate with your MERN app using the endpoints above
4. Deploy to a cloud platform (Heroku, AWS, GCP, etc.)

---

**Built with**: Python, Flask, scikit-learn, pandas
**License**: MIT
