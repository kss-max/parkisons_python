/**
 * Combine voice and MRI predictions with priority logic
 * 
 * PRIORITY LOGIC:
 * 1. If voice prediction = "parkinsons" → final = "parkinsons"
 * 2. Else if MRI prediction = "parkinsons" → final = "parkinsons"
 * 3. Else → final = "healthy"
 * 
 * @param {Object} voiceResult - { voicePrediction, voiceConfidence }
 * @param {Object} mriResult - { mriPrediction, mriConfidence }
 * @returns {Object} - Combined result with final decision
 */
function combineResults(voiceResult, mriResult) {
  const voice = {
    prediction: voiceResult?.voicePrediction || 'unknown',
    confidence: voiceResult?.voiceConfidence || 0
  };

  const mri = {
    prediction: mriResult?.mriPrediction || 'unknown',
    confidence: mriResult?.mriConfidence || 0
  };

  let finalDecision = 'healthy';
  let reasoning = '';

  // Priority logic: Voice gets priority
  if (voice.prediction === 'parkinsons') {
    finalDecision = 'parkinsons';
    reasoning = 'Voice analysis detected Parkinson\'s disease (priority)';
  } else if (mri.prediction === 'parkinsons') {
    finalDecision = 'parkinsons';
    reasoning = 'MRI analysis detected Parkinson\'s disease';
  } else if (voice.prediction === 'healthy' && mri.prediction === 'healthy') {
    finalDecision = 'healthy';
    reasoning = 'Both voice and MRI analysis indicate healthy status';
  } else if (voice.prediction === 'healthy' && mri.prediction === 'normal') {
    finalDecision = 'healthy';
    reasoning = 'Both voice and MRI analysis indicate healthy status';
  } else {
    finalDecision = 'healthy';
    reasoning = 'Default to healthy (no Parkinson\'s indicators detected)';
  }

  return {
    voice,
    mri,
    finalDecision,
    reasoning,
    combinedConfidence: (voice.confidence + mri.confidence) / 2
  };
}

module.exports = combineResults;
