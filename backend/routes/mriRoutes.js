const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { uploadMRI } = require('../controllers/mriController');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'mri-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|bmp/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeType = allowedTypes.test(file.mimetype);
    const extName = allowedTypes.test(ext);

    if (mimeType && extName) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed (JPEG, PNG, GIF, BMP)'));
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Routes
router.post('/upload', upload.single('file'), uploadMRI);

module.exports = router;
