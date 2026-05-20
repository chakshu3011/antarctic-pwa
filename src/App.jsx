import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const PenguinAR = () => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isThankYouOpen, setIsThankYouOpen] = useState(false);
  const [isInArMode, setIsInArMode] = useState(false); // Manages your flow step views
  const [isFrameActive, setIsFrameActive] = useState(false);

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
    audio.play().catch(err => console.log("Audio track trace:", err));
  };

  const isBlurred = isInfoOpen || isThankYouOpen;

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100dvh', margin: 0, padding: 0, overflow: 'hidden', backgroundColor: 'transparent', fontFamily: 'sans-serif' }}>

      {/* 1. THE 3D MODEL CANVAS VIEWPORT */}
      <div style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '75%', // Squeezes the viewport window up to guarantee lower button clearance
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
          ar-modes="webxr" // FORCES browser-based camera streaming instead of phone native apps
          camera-controls
          scale="10 10 10"
          ar-placement="floor"
          ar-scale="fixed"
          id="webxr-engine"
          style={{ width: '100%', height: '100%', display: 'block', backgroundColor: 'transparent' }}
        >
          {/* Native target anchor required to execute camera permissions */}
          <button slot="ar-button" id="native-ar-system-trigger" style={{ display: 'none' }}></button>
        </model-viewer>
      </div>

      {/* 2. THE SCREEN OVERLAY FRAME LAYER (Stays on screen globally if frame is turned on) */}
      {isFrameActive && !isBlurred && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
          <img 
            src="/images/frame1.png" 
            alt="Ice Crystal Frame Overlay"
            style={{ width: '100%', height: '100%', objectFit: 'fill' }} // 'fill' forces it to lock exactly to screen dimensions
          />
        </div>
      )}

      {/* =========================================================================
          FLOW STATE 1: THE WEB PAGE OVERLAY HUD
         ========================================================================= */}
      {!isInArMode && !isBlurred && (
        <div style={{ position: 'absolute', bottom: '65px', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', zIndex: 20 }}>
          
          <button
            onClick={() => {
              setIsInArMode(true);
              setTimeout(() => {
                const trigger = document.getElementById('native-ar-system-trigger');
                if (trigger) trigger.click();
              }, 150);
            }}
            style={{
              padding: '15px 35px', backgroundColor: '#2B4BAA', color: 'white',
              border: '2px solid white', borderRadius: '35px', fontWeight: 'bold', fontSize: '16px',
              boxShadow: '0 5px 20px rgba(0,0,0,0.4)', cursor: 'pointer'
            }}
          >
            See ICY in AR
          </button>

          <button
            onClick={() => setIsInfoOpen(true)}
            style={{
              padding: '10px 25px', backgroundColor: 'rgba(255, 255, 255, 0.15)', color: 'white',
              border: '1px solid rgba(255,255,255,0.3)', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px',
              backdropFilter: 'blur(4px)', cursor: 'pointer'
            }}
          >
            Info
          </button>

        </div>
      )}

      {/* =========================================================================
          FLOW STATE 2: THE IMMERSIVE AR MODE OVERLAY HUD
         ========================================================================= */}
      {isInArMode && !isBlurred && (
        <>
          {/* Top Center: Always accessible Audio button */}
          <div style={{ position: 'absolute', top: '35px', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 25 }}>
            <button
              onClick={playIcyVoice}
              style={{
                padding: '12px 26px', backgroundColor: '#2B4BAA', color: 'white',
                border: '2px solid white', borderRadius: '30px', fontWeight: 'bold', fontSize: '14px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.4)', cursor: 'pointer'
              }}
            >
              🔊 Tap to hear ICY
            </button>
          </div>

          {/* Bottom Controls: Frame Switcher and Exit Route */}
          <div style={{ position: 'absolute', bottom: '80px', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', zIndex: 25 }}>
            
            <button 
              onClick={() => setIsFrameActive(!isFrameActive)}
              style={{
                padding: '12px 28px', borderRadius: '25px', border: '2px solid white',
                backgroundColor: isFrameActive ? '#10b981' : '#2B4BAA',
                color: 'white', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0,0,0,0.4)'
              }}
            >
              {isFrameActive ? '✓ Frame Active' : 'Toggle Frame'}
            </button>

            <button
              onClick={() => { setIsInArMode(false); setIsFrameActive(false); }}
              style={{ background: 'none', border: 'none', color: '#9ca3af', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Back to Web View
            </button>

          </div>
        </>
      )}

      {/* =========================================================================
          FACTS DIALOGUE POPUPS
         ========================================================================= */}
      {isInfoOpen && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsInfoOpen(false)}
              style={{ position: 'absolute', top: '12px', right: '12px', width: '30px', height: '30px', borderRadius: '50%', border: '1.5px solid white', backgroundColor: '#2B4BAA', color: 'white', fontSize: '18px', fontWeight: '300', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
            >✕</button>
            <img src="/images/info.png" alt="Penguin Facts Card" style={{ width: '340px', borderRadius: '24px', display: 'block' }} />
            <img src="/images/try.png" alt="Card Panel Handler" onClick={() => { setIsInfoOpen(false); setIsThankYouOpen(true); }} style={{ position: 'absolute', bottom: '45px', left: '50%', transform: 'translateX(-50%)', width: '120px', cursor: 'pointer' }} />
          </div>
        </div>
      )}

      {isThankYouOpen && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)' }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsThankYouOpen(false)}
              style={{ position: 'absolute', top: '12px', right: '12px', width: '30px', height: '30px', borderRadius: '50%', border: '1.5px solid white', backgroundColor: '#2B4BAA', color: 'white', fontSize: '18px', fontWeight: '300', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
            >✕</button>
            <img src="/images/thankyou.png" alt="Thank You Feedback Card" style={{ width: '320px', borderRadius: '24px', display: 'block' }} />
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