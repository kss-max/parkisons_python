# Frontend - React Application

This directory contains the React frontend for the Parkinson's Disease Detection application.

## Setup

```bash
cd frontend
npm install
npm start
```

Server runs on http://localhost:3000

## Features

- Voice analysis upload (CSV files)
- MRI scan upload (image files)
- Real-time prediction results
- Combined decision logic with voice priority
- Responsive Tailwind UI

## Folder Structure

```
src/
├── components/
│   ├── VoiceUpload.jsx    # Voice CSV upload component
│   ├── MRIUpload.jsx      # MRI image upload component
│   └── ResultCard.jsx     # Results display component
├── pages/
│   ├── Home.jsx           # Main page with tabs
│   └── Result.jsx         # Results page
├── App.jsx                # Main app with routing
└── index.css              # Tailwind styles
```

## API Integration

Frontend connects to Express backend at http://localhost:5000

- POST /api/voice/upload - Voice CSV analysis
- POST /api/mri/upload - MRI image analysis
