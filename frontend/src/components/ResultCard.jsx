import React from 'react';
import { useNavigate } from 'react-router-dom';

const ResultCard = () => {
  const navigate = useNavigate();

  // Retrieve results from localStorage
  const voiceResult = JSON.parse(localStorage.getItem('voiceResult') || '{}');
  const mriResult = JSON.parse(localStorage.getItem('mriResult') || '{}');

  // Calculate final decision with voice priority
  const calculateFinalDecision = () => {
    if (voiceResult.voicePrediction === 'parkinsons') {
      return {
        decision: 'Parkinson\'s Disease Detected',
        reason: 'Voice analysis indicates Parkinson\'s disease (priority)',
        color: 'red'
      };
    } else if (mriResult.mriPrediction === 'parkinsons') {
      return {
        decision: 'Parkinson\'s Disease Detected',
        reason: 'MRI analysis indicates Parkinson\'s disease',
        color: 'red'
      };
    } else if (voiceResult.voicePrediction === 'healthy' || mriResult.mriPrediction === 'normal') {
      return {
        decision: 'Healthy',
        reason: 'No Parkinson\'s indicators detected in available analyses',
        color: 'green'
      };
    } else {
      return {
        decision: 'Incomplete Analysis',
        reason: 'Please complete both voice and MRI analysis for accurate results',
        color: 'yellow'
      };
    }
  };

  const finalResult = calculateFinalDecision();

  const handleNewTest = () => {
    localStorage.removeItem('voiceResult');
    localStorage.removeItem('mriResult');
    navigate('/');
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBar = (confidence) => {
    const percentage = (confidence * 100).toFixed(1);
    return (
      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${
              confidence >= 0.8 ? 'bg-green-600' : 
              confidence >= 0.6 ? 'bg-yellow-600' : 'bg-red-600'
            }`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-600 mt-1">{percentage}% confidence</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Analysis Results</h1>
          <p className="text-gray-600">Parkinson's Disease Detection</p>
        </div>

        {/* Final Decision Card */}
        <div className={`p-6 rounded-lg mb-6 ${
          finalResult.color === 'green' ? 'bg-green-50 border-2 border-green-200' :
          finalResult.color === 'red' ? 'bg-red-50 border-2 border-red-200' :
          'bg-yellow-50 border-2 border-yellow-200'
        }`}>
          <div className="flex items-center justify-center mb-3">
            {finalResult.color === 'green' && (
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {finalResult.color === 'red' && (
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            {finalResult.color === 'yellow' && (
              <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <h2 className={`text-2xl font-bold text-center mb-2 ${
            finalResult.color === 'green' ? 'text-green-800' :
            finalResult.color === 'red' ? 'text-red-800' :
            'text-yellow-800'
          }`}>
            {finalResult.decision}
          </h2>
          <p className="text-center text-gray-700">{finalResult.reason}</p>
        </div>

        {/* Individual Results */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Voice Result */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center mb-3">
              <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-800">Voice Analysis</h3>
            </div>
            {voiceResult.voicePrediction ? (
              <>
                <p className="text-gray-700 mb-2">
                  Prediction: <span className="font-semibold capitalize">{voiceResult.voicePrediction}</span>
                </p>
                <p className={`text-sm font-semibold ${getConfidenceColor(voiceResult.voiceConfidence)}`}>
                  Confidence: {(voiceResult.voiceConfidence * 100).toFixed(1)}%
                </p>
                {getConfidenceBar(voiceResult.voiceConfidence)}
              </>
            ) : (
              <p className="text-gray-500 italic">Not performed</p>
            )}
          </div>

          {/* MRI Result */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center mb-3">
              <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-800">MRI Analysis</h3>
            </div>
            {mriResult.mriPrediction ? (
              <>
                <p className="text-gray-700 mb-2">
                  Prediction: <span className="font-semibold capitalize">{mriResult.mriPrediction}</span>
                </p>
                <p className={`text-sm font-semibold ${getConfidenceColor(mriResult.mriConfidence)}`}>
                  Confidence: {(mriResult.mriConfidence * 100).toFixed(1)}%
                </p>
                {getConfidenceBar(mriResult.mriConfidence)}
              </>
            ) : (
              <p className="text-gray-500 italic">Not performed</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleNewTest}
            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            New Analysis
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
          >
            Print Results
          </button>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            <strong>Disclaimer:</strong> This is an AI-assisted analysis tool and should not replace professional medical diagnosis. 
            Please consult with a qualified healthcare provider for proper evaluation and treatment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
