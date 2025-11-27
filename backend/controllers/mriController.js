const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const FASTAPI_URL = 'http://localhost:8000/predict/mri';

/**
 * Handle MRI image upload and prediction
 * POST /api/mri/upload
 */
exports.uploadMRI = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No MRI image uploaded' });
    }

    console.log('🖼️  MRI image received:', req.file.originalname);

    // Create form data to send to FastAPI
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    console.log('📤 Sending MRI image to FastAPI...');

    // Send to FastAPI ML server
    const response = await axios.post(FASTAPI_URL, formData, {
      headers: {
        ...formData.getHeaders()
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    console.log('🤖 FastAPI MRI prediction response:', response.data);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    // Return formatted response
    res.json({
      mriPrediction: response.data.prediction,
      mriConfidence: response.data.confidence,
      inferenceTime: response.data.inference_time_seconds
    });

  } catch (error) {
    console.error('❌ MRI prediction error:', error.message);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (error.response) {
      return res.status(error.response.status).json({
        error: 'FastAPI error',
        message: error.response.data.detail || error.message
      });
    }

    res.status(500).json({
      error: 'MRI prediction failed',
      message: error.message
    });
  }
};
