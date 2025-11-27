import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const VoiceUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please upload a CSV file');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a CSV file');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/voice/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Voice prediction response:', response.data);

      // Save to localStorage
      localStorage.setItem('voiceResult', JSON.stringify(response.data));

      // Navigate to result page
      navigate('/result');
    } catch (err) {
      console.error('Voice upload error:', err);
      setError(err.response?.data?.message || 'Failed to process voice data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Voice Analysis</h2>
        <p className="text-gray-600 mt-2">Upload voice features CSV file</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CSV File (22 voice features)
          </label>
          <div className="relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                cursor-pointer"
            />
          </div>
          {file && (
            <p className="mt-2 text-sm text-green-600">
              ✓ {file.name} selected
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !file}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors
            ${loading || !file 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </span>
          ) : (
            'Analyze Voice'
          )}
        </button>
      </form>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Required Format:</h3>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• CSV file with 22 voice measurements</li>
          <li>• First row should contain feature values</li>
          <li>• Features: MDVP:Fo(Hz), MDVP:Fhi(Hz), etc.</li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceUpload;
