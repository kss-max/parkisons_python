import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MRIUpload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please upload an image file');
        setFile(null);
        setPreview(null);
        return;
      }

      setFile(selectedFile);
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select an MRI image');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/mri/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('MRI prediction response:', response.data);

      // Save to localStorage
      localStorage.setItem('mriResult', JSON.stringify(response.data));

      // Navigate to result page
      navigate('/result');
    } catch (err) {
      console.error('MRI upload error:', err);
      setError(err.response?.data?.message || 'Failed to process MRI image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">MRI Analysis</h2>
        <p className="text-gray-600 mt-2">Upload brain MRI scan image</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            MRI Image
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-green-50 file:text-green-700
                hover:file:bg-green-100
                cursor-pointer"
            />
          </div>
        </div>

        {preview && (
          <div className="mt-4">
            <p className="text-sm text-gray-700 mb-2">Preview:</p>
            <img 
              src={preview} 
              alt="MRI Preview" 
              className="w-full h-48 object-contain bg-gray-100 rounded-lg"
            />
            <p className="mt-2 text-sm text-green-600">
              ✓ {file.name}
            </p>
          </div>
        )}

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
              : 'bg-green-600 hover:bg-green-700'
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
            'Analyze MRI'
          )}
        </button>
      </form>

      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <h3 className="text-sm font-semibold text-green-900 mb-2">Supported Formats:</h3>
        <ul className="text-xs text-green-800 space-y-1">
          <li>• JPEG, PNG, GIF, BMP</li>
          <li>• Max file size: 10MB</li>
          <li>• Clear brain MRI scan recommended</li>
        </ul>
      </div>
    </div>
  );
};

export default MRIUpload;
