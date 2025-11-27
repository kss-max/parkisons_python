const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { uploadVoice, predictVoice } = require('../controllers/voiceController');

// Configure multer for CSV uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'voice-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.csv') {
      return cb(new Error('Only CSV files are allowed'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Routes
router.post('/upload', upload.single('file'), uploadVoice);
router.post('/predict', predictVoice);

module.exports = router;
