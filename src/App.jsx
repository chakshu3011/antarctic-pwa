import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const PenguinAR = () => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  return (
    <div style={{ width: '100vw', height: '100dvh', margin: 0, padding: 0, overflow: 'hidden', backgroundColor: 'black' }}>
      
      {/* 1. THE AR MODEL */}
      <div style={{ 
        width: '100%', 
        height: '100%', 
        transition: 'filter 0.5s ease',
        filter: isInfoOpen ? 'blur(10px)' : 'none' 
      }}>
        <model-viewer
          src="/models/penguin1.glb"
          ios-src="https://antarctic-pwa.vercel.app/models/penguin1.usdz"
          /* Add these two lines */
          autoplay
          animation-name="idle" 
          ar
          ar-modes="quick-look webxr scene-viewer"
          camera-controls
          scale="10 10 10"
          style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
        >
          {/* Custom AR Button to ensure it shows up */}
          <button slot="ar-button" style={{
            position: 'absolute', bottom: '100px', left: '50%', transform: 'translateX(-50%)',
            padding: '12px 24px', backgroundColor: '#2563eb', color: 'white', 
            border: 'none', borderRadius: '30px', fontWeight: 'bold', zIndex: 10
          }}>
            👋 View in AR
          </button>
        </model-viewer>
      </div>

      {/* 2. THE INFO BUTTON */}
      {!isInfoOpen && (
        <button 
          onClick={() => setIsInfoOpen(true)}
          style={{
            position: 'absolute', bottom: '30px', right: '30px',
            padding: '15px 30px', backgroundColor: '#2563eb', color: 'white',
            border: 'none', borderRadius: '50px', fontWeight: 'bold', fontSize: '18px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)', zIndex: 20
          }}
        >
          Info
        </button>
      )}

      {/* 3. THE INFO OVERLAY */}
      {isInfoOpen && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white', padding: '30px', borderRadius: '24px',
            maxWidth: '400px', width: '100%', position: 'relative', color: '#1a1a1a'
          }}>
            <button onClick={() => setIsInfoOpen(false)} style={{
              position: 'absolute', top: '-15px', right: '-15px', border: '2px solid white', borderRadius: '50%',
              width: '30px', height: '30px', color: "white", display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: '#1e3a8a', fontSize: '20px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
              zIndex: 60
            }}>✕</button>

            <h2 style={{ color: '#1e3a8a', marginBottom: '15px' }}>Emperor Penguins</h2>
            <div style={{ textAlign: 'left', lineHeight: '1.6' }}>
              <p>📍 <strong>The Giant of Ice:</strong> Tallest penguin species, reaching 1.3m!</p>
              <p>❄️ <strong>Extreme Survival:</strong> They breed in -60°C Antarctic winds.</p>
              <hr style={{ margin: '15px 0', opacity: 0.2 }} />
              <p style={{ color: '#1e40af', fontWeight: 'bold' }}>How to save them:</p>
              <ul style={{ paddingLeft: '20px' }}>
                <li>Reduce carbon to save sea ice.</li>
                <li>Choose sustainable seafood.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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