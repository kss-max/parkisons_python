const express = require('express');
const cors = require('cors');
const voiceRoutes = require('./routes/voiceRoutes');
const mriRoutes = require('./routes/mriRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/voice', voiceRoutes);
app.use('/api/mri', mriRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend server running', port: PORT });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Express backend server running on http://localhost:${PORT}`);
  console.log(`📡 Connecting to FastAPI ML server at http://localhost:8000`);
});
