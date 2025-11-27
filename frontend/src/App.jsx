import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Result from './pages/Result';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/voice" element={<Home activeTab="voice" />} />
          <Route path="/mri" element={<Home activeTab="mri" />} />
          <Route path="/result" element={<Result />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
