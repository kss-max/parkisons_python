# Backend - Express API

This directory contains the Express.js backend that bridges the React frontend and FastAPI ML server.

## Setup

```bash
cd backend
npm install
npm start
```

Server runs on http://localhost:5000

## Features

- Voice CSV file upload and processing
- MRI image file upload and forwarding
- CSV to JSON conversion
- Integration with FastAPI ML server at http://localhost:8000
- Error handling and validation

## Folder Structure

```
backend/
├── server.js                    # Main Express server
├── controllers/
│   ├── voiceController.js      # Voice prediction logic
│   └── mriController.js        # MRI prediction logic
├── routes/
│   ├── voiceRoutes.js          # Voice API routes
│   └── mriRoutes.js            # MRI API routes
├── utils/
│   ├── csvToJson.js            # CSV parser
│   └── combineResult.js        # Result combination logic
└── uploads/                     # Temporary file storage
```

## API Endpoints

### Voice Analysis
- POST /api/voice/upload - Upload CSV file
- POST /api/voice/predict - Send features JSON

### MRI Analysis
- POST /api/mri/upload - Upload MRI image

### Health
- GET /api/health - Backend server status
