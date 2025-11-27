const axios = require('axios');
const csvToJson = require('../utils/csvToJson');
const fs = require('fs');

const FASTAPI_URL = 'http://127.0.0.1:8000/predict/voice';

/**
 * Handle voice CSV upload and prediction
 * POST /api/voice/upload
 */
exports.uploadVoice = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded' });
    }

    console.log('📄 Voice CSV file received:', req.file.originalname);

    // Convert CSV to JSON features array
    const features = await csvToJson(req.file.path);

    console.log('✅ Extracted features:', features.features.length, 'values');

    // Send to FastAPI ML server
    const response = await axios.post(FASTAPI_URL, {
      features: features.features
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('🤖 FastAPI voice prediction response:', response.data);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    // Return formatted response
    res.json({
      voicePrediction: response.data.prediction,
      voiceConfidence: response.data.confidence,
      probability: response.data.probability,
      inferenceTime: response.data.inference_time_seconds
    });

  } catch (error) {
    console.error('❌ Voice prediction error:', error.message);
    
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
      error: 'Voice prediction failed',
      message: error.message
    });
  }
};

/**
 * Handle voice JSON prediction (direct features)
 * POST /api/voice/predict
 */
exports.predictVoice = async (req, res) => {
  try {
    const { features } = req.body;

    if (!features || !Array.isArray(features)) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        message: 'Expected { features: [22 values] }' 
      });
    }

    if (features.length !== 22) {
      return res.status(400).json({ 
        error: 'Invalid feature count', 
        message: `Expected 22 features, got ${features.length}` 
      });
    }

    console.log('🎯 Direct voice prediction with features array');

    // Send to FastAPI ML server
    const response = await axios.post(FASTAPI_URL, {
      features: features
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('🤖 FastAPI voice prediction response:', response.data);

    res.json({
      voicePrediction: response.data.prediction,
      voiceConfidence: response.data.confidence,
      probability: response.data.probability,
      inferenceTime: response.data.inference_time_seconds
    });

  } catch (error) {
    console.error('❌ Voice prediction error:', error.message);

    if (error.response) {
      return res.status(error.response.status).json({
        error: 'FastAPI error',
        message: error.response.data.detail || error.message
      });
    }

    res.status(500).json({
      error: 'Voice prediction failed',
      message: error.message
    });
  }
};
