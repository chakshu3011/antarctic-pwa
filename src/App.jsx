import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const PenguinAR = () => {
  const [isCamActive, setIsCamActive] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isThankYouOpen, setIsThankYouOpen] = useState(false);
  const [activeFrame, setActiveFrame] = useState(null); // null, 'frame1', or 'frame2'

  useEffect(() => {
    if (isThankYouOpen) {
      const timer = setTimeout(() => {
        setIsThankYouOpen(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isThankYouOpen]);

  const playIcyVoice = (e) => {
    e.stopPropagation();
    const audio = new Audio('/audio/icy_voice.mp3'); 
    audio.play().catch(err => console.log("Audio waiting for user click:", err));
  };

  const isBlurred = isInfoOpen || isThankYouOpen;

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden', backgroundColor: '#000000', fontFamily: 'sans-serif' }}>

      {/* 1. THE 3D ENGINE VIEWPORT CONTAINER */}
      <div style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        transition: 'filter 0.5s ease',
        filter: isBlurred ? 'blur(10px)' : 'none',
        zIndex: 1
      }}>
        <model-viewer
          src="/models/penguin1.glb"
          ios-src="https://antarctic-pwa.vercel.app/models/penguin1.usdz"
          autoplay
          animation-name="idle"
          ar
          ar-modes="quick-look webxr scene-viewer"
          camera-controls
          
          /* FIXED SIZING: Lowering global scale from 10 to 1 prevents massive iOS rendering distortion */
          scale="1 1 1"
          
          /* FIXED TRACKING: Shadows and neutral lighting tell Android exactly where the floor plane is */
          ar-placement="floor"
          ar-scale="fixed"
          shadow-intensity="1.5"
          shadow-softness="0.5"
          environment-image="neutral"
          exposure="1.2"
          style={{ width: '100%', height: '100%', display: 'block', backgroundColor: 'transparent' }}
        >
          {/* Hidden link to launch tracking mode */}
          <button id="hidden-ar-trigger" slot="ar-button" style={{ display: 'none' }}></button>
        </model-viewer>
      </div>

      {/* 2. THE WEBPAGE INTRO VIEW (isCamActive === false) */}
      {!isCamActive && !isBlurred && (
        <div style={{ 
          position: 'absolute', 
          bottom: '10vh', // FIXED POSITIONING: Raised up to prevent buttons from sinking off screen
          left: 0, 
          right: 0, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '16px', 
          zIndex: 10 
        }}>
          
          <button
            onClick={() => {
              setIsCamActive(true);
              document.getElementById('hidden-ar-trigger')?.click();
            }}
            style={{
              padding: '14px 32px', backgroundColor: '#2B4BAA', color: 'white',
              border: '2px solid white', borderRadius: '30px', fontWeight: 'bold', fontSize: '16px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)', cursor: 'pointer'
            }}
          >
            See ICY in AR
          </button>

          <button
            onClick={() => setIsInfoOpen(true)}
            style={{
              padding: '12px 28px', backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'white',
              border: '1px solid rgba(255,255,255,0.4)', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px',
              backdropFilter: 'blur(6px)', cursor: 'pointer'
            }}
          >
            Info
          </button>
        </div>
      )}

      {/* 3. IMAGES / INTERACTIVE HUD LAYER (isCamActive === true) */}
      {isCamActive && !isBlurred && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none' }}>
          
          {activeFrame && (
            <img 
              src={activeFrame === 'frame1' ? '/images/frame1.png' : '/images/frame2.png'} 
              alt="Active Frame Border"
              style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'absolute', inset: 0 }}
            />
          )}

          {/* Top Audio Component */}
          <div style={{ position: 'absolute', top: '45px', left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'auto' }}>
            <button
              onClick={playIcyVoice}
              style={{
                padding: '12px 24px', backgroundColor: '#2B4BAA', color: 'white',
                border: '2px solid white', borderRadius: '30px', fontWeight: 'bold', fontSize: '14px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)', cursor: 'pointer'
              }}
            >
              🔊 Tap to hear ICY
            </button>
          </div>

          {/* Bottom Frames Picker Grid */}
          <div style={{ position: 'absolute', bottom: '8vh', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', pointerEvents: 'auto' }}>
            <div style={{ display: 'flex', gap: '12px', backgroundColor: 'rgba(0,0,0,0.85)', padding: '12px 20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <button 
                onClick={() => setActiveFrame(activeFrame === 'frame1' ? null : 'frame1')}
                style={{
                  padding: '10px 20px', borderRadius: '12px', border: 'none',
                  backgroundColor: activeFrame === 'frame1' ? '#10b981' : '#374151',
                  color: 'white', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer'
                }}
              >
                {activeFrame === 'frame1' ? '✓ Frame 1' : 'Frame 1'}
              </button>
              <button 
                onClick={() => setActiveFrame(activeFrame === 'frame2' ? null : 'frame2')}
                style={{
                  padding: '10px 20px', borderRadius: '12px', border: 'none',
                  backgroundColor: activeFrame === 'frame2' ? '#10b981' : '#374151',
                  color: 'white', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer'
                }}
              >
                {activeFrame === 'frame2' ? '✓ Frame 2' : 'Frame 2'}
              </button>
            </div>

            <button 
              onClick={() => { setIsCamActive(false); setActiveFrame(null); }}
              style={{ background: 'none', border: 'none', color: '#d1d5db', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}
            >
              Exit Camera View
            </button>
          </div>

        </div>
      )}

      {/* 4. FACTS GRAPHIC PANEL POPUP */}
      {isInfoOpen && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsInfoOpen(false)}
              style={{ position: 'absolute', top: '12px', right: '12px', width: '30px', height: '30px', borderRadius: '50%', border: '1.5px solid white', backgroundColor: '#2B4BAA', color: 'white', fontSize: '18px', fontWeight: '300', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
            >✕</button>
            <img src="/images/info.png" alt="Penguin Facts Card" style={{ width: '340px', borderRadius: '24px', display: 'block' }} />
            <img src="/images/try.png" alt="Dialogue Dismiss Button" onClick={() => { setIsInfoOpen(false); setIsThankYouOpen(true); }} style={{ position: 'absolute', bottom: '45px', left: '50%', transform: 'translateX(-50%)', width: '120px', cursor: 'pointer' }} />
          </div>
        </div>
      )}

      {/* 5. THANK YOU DIALOGUE PANEL */}
      {isThankYouOpen && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.65)' }}>
          <img src="/images/thankyou.png" alt="Thank You Feedback Card" style={{ width: '320px', display: 'block' }} />
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