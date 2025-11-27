import React, { useState } from 'react';
import VoiceUpload from '../components/VoiceUpload';
import MRIUpload from '../components/MRIUpload';

const Home = ({ activeTab = 'voice' }) => {
  const [currentTab, setCurrentTab] = useState(activeTab);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Parkinson's Disease Detection
          </h1>
          <p className="text-white text-lg opacity-90">
            AI-powered analysis using voice features and MRI scans
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg p-1 shadow-lg inline-flex">
            <button
              onClick={() => setCurrentTab('voice')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                currentTab === 'voice'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Voice Analysis
              </div>
            </button>
            <button
              onClick={() => setCurrentTab('mri')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                currentTab === 'mri'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                MRI Analysis
              </div>
            </button>
          </div>
        </div>

        {/* Upload Component */}
        <div className="flex justify-center">
          {currentTab === 'voice' ? <VoiceUpload /> : <MRIUpload />}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6 text-white">
          <h3 className="text-xl font-semibold mb-4">How it works:</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <div className="bg-white bg-opacity-20 rounded-full p-2 mr-3 mt-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Voice Analysis</h4>
                <p className="text-sm opacity-90">
                  Upload a CSV file with 22 voice measurements extracted from speech recordings
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-white bg-opacity-20 rounded-full p-2 mr-3 mt-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold mb-1">MRI Scan</h4>
                <p className="text-sm opacity-90">
                  Upload a brain MRI scan image for automated analysis using deep learning
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white opacity-75">
          <p className="text-sm">
            Powered by FastAPI ML Server + MERN Stack
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
