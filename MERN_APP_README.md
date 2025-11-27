# 🧠 Parkinson's Disease Detection - Full Stack MERN + FastAPI

Complete full-stack application for Parkinson's disease detection using AI/ML with voice analysis and MRI scans.

## 📁 Project Structure

```
parkinsons-fullstack/
│
├── ml-server/              # FastAPI ML server (Python)
│   ├── app.py             # FastAPI endpoints
│   ├── models/            # ML model files (.h5, .joblib)
│   ├── requirements.txt
│   └── runtime.txt
│
├── backend/               # Express.js API (Node.js)
│   ├── server.js
│   ├── controllers/
│   ├── routes/
│   ├── utils/
│   └── uploads/
│
└── frontend/              # React UI (Tailwind CSS)
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── App.jsx
    └── public/
```

## 🚀 Quick Start

### 1. Start FastAPI ML Server (Port 8000)

```bash
cd ml-server
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac

pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Start Express Backend (Port 5000)

```bash
cd backend
npm install
npm start
```

### 3. Start React Frontend (Port 3000)

```bash
cd frontend
npm install
npm start
```

## 🎯 Application Flow

```
User (Browser)
    ↓
React Frontend (localhost:3000)
    ↓
Express Backend (localhost:5000)
    ↓
FastAPI ML Server (localhost:8000)
    ↓
ML Models (TensorFlow + scikit-learn)
```

## 📊 Features

### Voice Analysis
- Upload CSV file with 22 voice measurements
- SVC model prediction
- Confidence scores with probability distribution

### MRI Analysis
- Upload brain MRI scan image
- CNN model (EfficientNetB0) prediction
- Binary classification (parkinsons/normal)

### Combined Results
- **Voice priority logic**: Voice prediction takes precedence
- If voice = "parkinsons" → Final = "Parkinsons"
- Else if MRI = "parkinsons" → Final = "Parkinsons"
- Else → "Healthy"

## 🛠️ Technology Stack

**Frontend:**
- React 18
- React Router v6
- Tailwind CSS
- Axios

**Backend:**
- Express.js
- Multer (file uploads)
- Axios (HTTP client)
- CSV Parser

**ML Server:**
- FastAPI
- TensorFlow 2.16
- scikit-learn 1.5
- OpenCV (headless)

## 📡 API Endpoints

### Express Backend (Port 5000)

#### Voice
- `POST /api/voice/upload` - Upload CSV file
- `POST /api/voice/predict` - Send features JSON

#### MRI
- `POST /api/mri/upload` - Upload MRI image

#### Health
- `GET /api/health` - Backend status

### FastAPI ML Server (Port 8000)

#### Predictions
- `POST /predict/voice` - Voice features prediction
- `POST /predict/mri` - MRI image prediction

#### Health
- `GET /` - Fast health check
- `GET /health` - Detailed model status

## 📝 Usage Guide

### Voice Analysis

1. Prepare CSV file with 22 voice features:
   - MDVP:Fo(Hz), MDVP:Fhi(Hz), MDVP:Flo(Hz)... (22 total)
2. Upload via frontend
3. View results with confidence scores

### MRI Analysis

1. Prepare brain MRI scan image (PNG, JPEG, etc.)
2. Upload via frontend
3. View results with confidence scores

### Combined Analysis

- Perform both voice and MRI analysis
- System automatically combines results with voice priority
- View comprehensive analysis on result page

## 🔒 Security Notes

- File size limits: CSV (5MB), Images (10MB)
- File type validation
- Temporary uploads deleted after processing
- CORS enabled for localhost development

## 📚 Documentation

- **Frontend README**: `frontend/README.md`
- **Backend README**: `backend/README.md`
- **ML Server API Testing**: `ml-server/API_TESTING.md`
- **Deployment Guide**: `DEPLOYMENT_CHECKLIST.md`

## 🧪 Testing

### Test Voice Endpoint (Backend)
```bash
curl -X POST http://localhost:5000/api/voice/upload \
  -F "file=@sample_voice.csv"
```

### Test MRI Endpoint (Backend)
```bash
curl -X POST http://localhost:5000/api/mri/upload \
  -F "file=@sample_mri.png"
```

### Test ML Server Directly
```bash
# Voice
curl -X POST http://localhost:8000/predict/voice \
  -H "Content-Type: application/json" \
  -d '{"features": [119.992, ...]}'

# MRI
curl -X POST http://localhost:8000/predict/mri \
  -F "file=@mri_scan.png"
```

## 🐛 Troubleshooting

### Backend can't connect to ML server
- Ensure FastAPI server is running on port 8000
- Check `FASTAPI_URL` in controllers

### Frontend can't connect to backend
- Ensure Express server is running on port 5000
- Check proxy setting in `frontend/package.json`

### File upload fails
- Check file size limits
- Verify file type (CSV for voice, images for MRI)
- Ensure `uploads/` directory exists

### ML predictions fail
- Check model files exist in `ml-server/models/`
- Verify Python dependencies installed
- Check FastAPI logs for errors

## 📦 Production Deployment

### Deploy ML Server
- Railway or Render
- Use `Procfile`: `web: cd ml-server && uvicorn app:app --host 0.0.0.0 --port $PORT`
- Git LFS for model files

### Deploy Backend
- Heroku, Railway, or Render
- Update `FASTAPI_URL` to production ML server URL
- Set environment variables

### Deploy Frontend
- Vercel, Netlify, or similar
- Update API base URL to production backend
- Build with `npm run build`

## ⚠️ Disclaimer

This application is for educational and research purposes. It should NOT replace professional medical diagnosis. Always consult qualified healthcare providers for medical evaluation and treatment.

## 📄 License

MIT License

## 👥 Contributors

Your team information here

---

**Last Updated**: November 27, 2025
**Version**: 1.0.0
