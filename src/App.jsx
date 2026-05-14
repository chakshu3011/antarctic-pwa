import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const PenguinAR = () => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  return (
  <div className="relative w-full h-[100dvh] overflow-hidden bg-transparent">
    
    {/* 1. THE BACKGROUND (AR MODEL) */}
    {/* Removed bg-gray-100 so the camera feed can show through */}
    <div className={w-full h-full transition-all duration-500 ${isInfoOpen ? 'blur-md scale-110' : 'blur-0'}}>
      <model-viewer
        src="/models/penguin1.glb"
        ios-src="https://antarctic-pwa.vercel.app/models/penguin1.usdz"
        ar
        ar-modes="quick-look webxr scene-viewer"
        camera-controls
        scale="10 10 10"
        style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
      />
    </div>

    {/* 2. THE INFO BUTTON - Fixed to Bottom Right */}
    {!isInfoOpen && (
      <button 
        onClick={() => setIsInfoOpen(true)}
        className="absolute bottom-10 right-10 z-20 bg-blue-600 text-white px-6 py-3 rounded-full shadow-2xl font-bold transition-transform active:scale-95"
      >
        Info
      </button>
    )}

    {/* 3. THE INFORMATION OVERLAY */}
    {isInfoOpen && (
      <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative text-gray-900">
          <button 
            onClick={() => setIsInfoOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-black text-2xl font-bold"
          >
            ✕
          </button>

          <h2 className="text-2xl font-bold text-blue-900 mb-4">Emperor Penguins</h2>
          
          <div className="space-y-4 leading-relaxed text-left">
            <p>📍 <strong>The Giant of Ice:</strong> Emperors are the tallest and heaviest species, reaching 1.3m!</p>
            <p>❄️ <strong>Extreme Survival:</strong> They breed during the harsh Antarctic winter in -60°C winds.</p>
            <hr className="border-gray-200" />
            <p className="font-semibold text-blue-800 italic">How to save them:</p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li><strong>Protect Sea Ice:</strong> Climate change melts their breeding grounds.</li>
              <li><strong>Sustainable Fishing:</strong> Overfishing starves penguin colonies.</li>
            </ul>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

// THIS WAS THE MISSING PIECE: The App function that uses the Routes
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PenguinAR />} />
        <Route path="/penguin" element={<PenguinAR />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;