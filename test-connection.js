const axios = require('axios');

console.log('🧪 Testing Full Stack Connections...\n');

async function testConnections() {
  const tests = [];

  // Test 1: FastAPI ML Server
  console.log('1️⃣  Testing FastAPI ML Server (http://localhost:8000)...');
  try {
    const response = await axios.get('http://localhost:8000/health', { timeout: 5000 });
    console.log('   ✅ FastAPI ML Server: ONLINE');
    console.log('   📊 Status:', response.data.status);
    console.log('   🤖 Models:', response.data.models);
    tests.push({ service: 'FastAPI', status: 'PASS' });
  } catch (error) {
    console.log('   ❌ FastAPI ML Server: OFFLINE');
    console.log('   Error:', error.message);
    tests.push({ service: 'FastAPI', status: 'FAIL', error: error.message });
  }

  console.log('');

  // Test 2: Express Backend
  console.log('2️⃣  Testing Express Backend (http://localhost:5000)...');
  try {
    const response = await axios.get('http://localhost:5000/api/health', { timeout: 5000 });
    console.log('   ✅ Express Backend: ONLINE');
    console.log('   📊 Response:', response.data);
    tests.push({ service: 'Express', status: 'PASS' });
  } catch (error) {
    console.log('   ❌ Express Backend: OFFLINE');
    console.log('   Error:', error.message);
    tests.push({ service: 'Express', status: 'FAIL', error: error.message });
  }

  console.log('');

  // Test 3: Backend → FastAPI Connection
  console.log('3️⃣  Testing Backend → FastAPI Integration...');
  try {
    const testFeatures = {
      features: [
        119.992, 157.302, 74.997, 0.00784, 0.00007,
        0.00370, 0.00554, 0.01109, 0.04374, 0.426,
        0.02182, 0.03130, 0.02971, 0.06545, 0.02211,
        21.033, 0.414783, 0.815285, -4.813031, 0.266482,
        2.301442, 0.284654
      ]
    };

    const response = await axios.post('http://localhost:5000/api/voice/predict', testFeatures, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000
    });

    console.log('   ✅ Backend → FastAPI: CONNECTED');
    console.log('   🎯 Voice Prediction:', response.data.voicePrediction);
    console.log('   📈 Confidence:', (response.data.voiceConfidence * 100).toFixed(1) + '%');
    tests.push({ service: 'Integration', status: 'PASS' });
  } catch (error) {
    console.log('   ❌ Backend → FastAPI: FAILED');
    console.log('   Error:', error.response?.data || error.message);
    tests.push({ service: 'Integration', status: 'FAIL', error: error.message });
  }

  console.log('');
  console.log('========================================');
  console.log('📊 Test Summary:');
  console.log('========================================');

  tests.forEach(test => {
    const icon = test.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${test.service}: ${test.status}`);
    if (test.error) {
      console.log(`   Error: ${test.error}`);
    }
  });

  const passed = tests.filter(t => t.status === 'PASS').length;
  const total = tests.length;

  console.log('');
  console.log(`Result: ${passed}/${total} tests passed`);
  console.log('========================================');

  if (passed === total) {
    console.log('🎉 All systems operational!');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Install frontend: cd frontend && npm install');
    console.log('  2. Start frontend: npm start');
    console.log('  3. Open browser: http://localhost:3000');
  } else {
    console.log('⚠️  Some services are not running.');
    console.log('');
    console.log('To start all servers:');
    console.log('  Windows: start-all.bat');
    console.log('  Manual:');
    console.log('    Terminal 1: cd ml-server && ..\.venv\Scripts\python.exe -m uvicorn app:app --port 8000');
    console.log('    Terminal 2: cd backend && npm start');
    console.log('    Terminal 3: cd frontend && npm start');
  }
}

testConnections().catch(console.error);
