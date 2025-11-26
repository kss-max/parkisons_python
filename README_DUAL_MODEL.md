# Parkinson's Disease Prediction API - Dual Model System

A Flask-based REST API server supporting **two prediction models**:
1. **Voice Model** - SVC classifier using voice measurements
2. **MRI Model** - CNN classifier using brain MRI scans

## 📋 Complete Preprocessing Steps

### Voice Model Preprocessing

The voice model (`train_model.py`) performs these steps:

1. **Data Loading** - Load `parkinsons.data` CSV file
2. **Missing Value Check** - Verify data integrity
3. **Feature Separation**
   - Drop `name` column (identifier)
   - Drop `status` column (target)
   - 22 voice features remain
4. **Train-Test Split** - 80/20 stratified split
5. **Feature Scaling** ⭐ **CRITICAL**
   - StandardScaler (mean=0, std=1)
   - Fit on training data only
   - Transform both train and test
6. **Model Training** - SVC with linear kernel
7. **Save Artifacts** - `svc_model.pkl` + `scaler.pkl`

### MRI Model Preprocessing

The MRI model (`train_model_mri.py`) performs these steps:

1. **Image Loading**
   - Load from `mri_data/parkinsons/` and `mri_data/healthy/`
   - Support formats: PNG, JPG, JPEG, NIfTI (.nii, .nii.gz)
2. **Image Preprocessing** ⭐
   - **Resize**: 224x224 pixels
   - **Color conversion**: Grayscale → RGB
   - **Normalization**: Pixel values [0, 255] → [0, 1]
   - **Format standardization**: All images to RGB format
3. **Data Augmentation** (training only)
   - Rotation: ±15 degrees
   - Width/Height shift: ±10%
   - Zoom: ±10%
   - Horizontal flip: Yes
   - Brightness: 0.8-1.2x
4. **Train-Val-Test Split** - 70/15/15 stratified split
5. **Model Architecture**
   - **Option 1**: Transfer Learning (VGG16)
   - **Option 2**: Custom CNN (4 conv blocks)
6. **Training Callbacks**
   - Early stopping (patience=10)
   - Learning rate reduction
   - Model checkpointing
7. **Save Model** - `mri_cnn_model.h5`

## 🚀 Setup & Installation

### 1. Install Dependencies

```powershell
cd "c:\MACHINE LEARNING\python_server"
pip install -r requirements.txt
```

### 2. Prepare Data

#### For Voice Model:
```
c:\MACHINE LEARNING\python_server\
└── parkinsons.data
```

#### For MRI Model:
```
c:\MACHINE LEARNING\python_server\
└── mri_data\
    ├── parkinsons\    (MRI images of patients)
    │   ├── scan1.jpg
    │   ├── scan2.jpg
    │   └── ...
    └── healthy\       (MRI images of healthy subjects)
        ├── scan1.jpg
        ├── scan2.jpg
        └── ...
```

### 3. Train Models

#### Train Voice Model:
```powershell
.\.venv\Scripts\python.exe train_model.py
```
Creates: `models/svc_model.pkl` + `models/scaler.pkl`

#### Train MRI Model:
```powershell
.\.venv\Scripts\python.exe train_model_mri.py
```
Creates: `models/mri_cnn_model.h5`

### 4. Start Server

```powershell
.\.venv\Scripts\python.exe app.py
```
Server runs at: `http://localhost:5000`

### 5. Test APIs

```powershell
# Test voice model
.\.venv\Scripts\python.exe test_api.py

# Test MRI model
.\.venv\Scripts\python.exe test_api_mri.py
```

## 📡 API Endpoints

### General Endpoints

#### Health Check
```
GET /
GET /api/health
```

**Response:**
```json
{
  "status": "online",
  "models": {
    "voice": true,
    "mri": true
  },
  "timestamp": "2025-11-26T10:30:00"
}
```

### Voice Model Endpoints

#### Get Voice Features
```
GET /api/features
```

#### Single Voice Prediction
```
POST /api/predict
POST /api/predict/voice
```

**Request:**
```json
{
  "features": [119.992, 157.302, 74.997, ...]
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
  "status": "success"
}
```

#### Batch Voice Prediction
```
POST /api/predict/batch
```

### MRI Model Endpoints

#### Single MRI Prediction

```
POST /api/predict/mri
```

**Option 1: Base64 JSON**
```json
{
  "image": "base64_encoded_image_string"
}
```

**Option 2: File Upload (multipart/form-data)**
```
Form field: image (file)
```

**Response:**
```json
{
  "prediction": 1,
  "prediction_label": "Parkinson's Disease",
  "probability": {
    "healthy": 0.12,
    "parkinsons": 0.88
  },
  "confidence": 0.88,
  "status": "success"
}
```

#### Batch MRI Prediction
```
POST /api/predict/mri/batch
```

**Request:**
```json
{
  "images": [
    "base64_image_1",
    "base64_image_2"
  ]
}
```

## 🔗 MERN Integration Examples

### Voice Model (React)

```javascript
// Voice prediction
const predictVoice = async (features) => {
  const response = await fetch('http://localhost:5000/api/predict/voice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ features })
  });
  return response.json();
};

// Usage
const voiceFeatures = [119.992, 157.302, ...]; // 22 features
const result = await predictVoice(voiceFeatures);
console.log(result.prediction_label, result.confidence);
```

### MRI Model (React)

```javascript
// MRI prediction with file upload
const predictMRI = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  const response = await fetch('http://localhost:5000/api/predict/mri', {
    method: 'POST',
    body: formData
  });
  return response.json();
};

// Usage with file input
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  const result = await predictMRI(file);
  console.log(result.prediction_label, result.confidence);
};

// Or with base64
const predictMRIBase64 = async (base64Image) => {
  const response = await fetch('http://localhost:5000/api/predict/mri', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image })
  });
  return response.json();
};
```

## 📊 Preprocessing Summary Table

| Step | Voice Model | MRI Model |
|------|-------------|-----------|
| **Input** | CSV with 22 features | Brain MRI images |
| **Data Format** | Numeric values | Images (224x224 RGB) |
| **Missing Values** | Check for nulls | N/A |
| **Normalization** | StandardScaler | Pixel /255 |
| **Augmentation** | None | Rotation, flip, zoom |
| **Split** | 80/20 | 70/15/15 |
| **Model Type** | SVC (sklearn) | CNN (TensorFlow) |
| **Output** | 2 .pkl files | 1 .h5 file |

## 🎯 Voice Features (22 total)

1. MDVP:Fo(Hz) - Fundamental frequency
2. MDVP:Fhi(Hz) - Max frequency
3. MDVP:Flo(Hz) - Min frequency
4-8. Jitter measures
9-14. Shimmer measures
15-16. HNR/NHR ratios
17-22. Nonlinear dynamics

## 🧠 MRI Preprocessing Details

### Supported Image Formats
- PNG, JPG, JPEG (standard)
- NIfTI (.nii, .nii.gz) - requires `nibabel`

### Image Transformations
```python
# Automatic preprocessing in API:
1. Convert to RGB
2. Resize to 224x224
3. Normalize [0, 1]
4. Add batch dimension
```

### Data Augmentation (Training Only)
- Preserves brain anatomy
- No vertical flip (orientation matters)
- Small rotation angles (±15°)
- Improves generalization

## 📂 Project Structure

```
python_server/
├── app.py                      # Dual-model Flask API
├── train_model.py              # Voice model training
├── train_model_mri.py          # MRI model training
├── test_api.py                 # Voice API tests
├── test_api_mri.py             # MRI API tests
├── requirements.txt            # All dependencies
├── README.md                   # This file
├── models/                     # Model artifacts
│   ├── svc_model.pkl          # Voice model
│   ├── scaler.pkl             # Voice scaler
│   ├── mri_cnn_model.h5       # MRI model
│   └── mri_training_history.pkl
├── parkinsons.data            # Voice dataset (add this)
└── mri_data/                  # MRI dataset (add this)
    ├── parkinsons/
    └── healthy/
```

## ⚙️ Configuration Options

### Environment Variables
```powershell
# Change port
$env:PORT=8080; python app.py

# Enable debug mode
$env:DEBUG="true"; python app.py
```

### Model Selection in Training

#### Voice Model (train_model.py)
- Test size: Line 63 (`test_size=0.2`)
- Random state: Line 63 (`random_state=42`)
- SVC kernel: Line 79 (`kernel='linear'`)

#### MRI Model (train_model_mri.py)
- Image size: Lines 20-21 (`IMG_HEIGHT`, `IMG_WIDTH`)
- Batch size: Line 23 (`BATCH_SIZE = 32`)
- Epochs: Line 24 (`EPOCHS = 50`)
- Use pretrained: Line 305 (`use_pretrained=True`)
  - `True` → VGG16 transfer learning
  - `False` → Custom CNN

## 🐛 Troubleshooting

### Voice Model Issues
- **Missing parkinsons.data**: Download from UCI ML Repository
- **Scaling error**: Ensure scaler.pkl exists
- **Wrong feature count**: Must be exactly 22 features

### MRI Model Issues
- **No images found**: Check directory structure
- **Out of memory**: Reduce `BATCH_SIZE`
- **Poor accuracy**: Try `use_pretrained=True`
- **NIfTI error**: Install `nibabel` (`pip install nibabel`)

### API Issues
- **Model not loaded**: Run training scripts first
- **CORS error**: Already enabled via `flask-cors`
- **File too large**: Check server upload limits

## 🚀 Deployment

### Local Development
```powershell
python app.py
```

### Production (Gunicorn)
```powershell
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 --timeout 120 app:app
```

### Docker (Future)
Both models can be containerized together.

## 📈 Performance Tips

1. **Voice Model**: Very fast (~1ms per prediction)
2. **MRI Model**: Slower (~100-500ms per prediction)
   - Use batch endpoint for multiple images
   - Consider GPU for training
3. **API**: Enable caching for repeated requests

## 🔬 Model Accuracy

**Voice Model:**
- Typical: 90-95% accuracy
- Fast inference
- Requires exact voice measurements

**MRI Model:**
- Depends on dataset quality
- Transfer learning: Usually better
- Requires sufficient training data (100+ images per class)

---

**Version**: 2.0.0  
**Models**: Voice (SVC) + MRI (CNN)  
**License**: MIT
