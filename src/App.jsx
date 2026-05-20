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
    audio.play().catch(err => console.log("Audio activation trace:", err));
  };

  const isBlurred = isInfoOpen || isThankYouOpen;

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden', backgroundColor: '#000000', fontFamily: 'sans-serif' }}>

      {/* 1. THE WEB-BASED AR VIEWPORT */}
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
          camera-controls
          scale="1 1 1"
          
          {/* WebXR mode runs directly inside your browser layout, keeping your custom HTML frames active */}
          ar
          ar-modes="webxr" 
          ar-placement="floor"
          ar-scale="fixed"
          shadow-intensity="1.5"
          environment-image="neutral"
          exposure="1.2"
          style={{ width: '100%', height: '100%', display: 'block', backgroundColor: 'transparent' }}
        >
          {/* Hidden activation gatekeeper fallback */}
          <button id="hidden-ar-trigger" slot="ar-button" style={{ display: 'none' }}></button>
        </model-viewer>
      </div>

      {/* 2. LIVE TRANSPARENT OVERLAY FRAME LAYER */}
      {/* This renders directly on top of the web camera view so users can snap a clean screenshot */}
      {activeFrame && !isBlurred && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
          <img 
            src={activeFrame === 'frame1' ? '/images/frame1.png' : '/images/frame2.png'} 
            alt="Active Framing Matrix"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
      )}

      {/* 3. STATIC WEB INTRO HUD (isCamActive === false) */}
      {!isCamActive && !isBlurred && (
        <div style={{ position: 'absolute', bottom: '10vh', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', zIndex: 20 }}>
          <button
            onClick={() => setIsCamActive(true)}
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

      {/* 4. ACTIVE WEBAR CAMERA HUD COMPONENTS (isCamActive === true) */}
      {isCamActive && !isBlurred && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none' }}>
          
          {/* Top Audio Layer Component */}
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

          {/* Bottom Interactive Frame Picker Triggers */}
          <div style={{ position: 'absolute', bottom: '8vh', left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'auto' }}>
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
          </div>

        </div>
      )}

      {/* 5. AR FACTS GRAPHIC OVERLAY CARD */}
      {isInfoOpen && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsInfoOpen(false)}
              style={{ position: 'absolute', top: '12px', right: '12px', width: '30px', height: '30px', borderRadius: '50%', border: '1.5px solid white', backgroundColor: '#2B4BAA', color: 'white', fontSize: '18px', fontWeight: '300', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
            >✕</button>
            <img src="/images/info.png" alt="Penguin Facts Card" style={{ width: '340px', borderRadius: '24px', display: 'block' }} />
            <img src="/images/try.png" alt="Dismiss Dialogue Target" onClick={() => { setIsInfoOpen(false); setIsThankYouOpen(true); }} style={{ position: 'absolute', bottom: '45px', left: '50%', transform: 'translateX(-50%)', width: '120px', cursor: 'pointer' }} />
          </div>
        </div>
      )}

      {/* 6. THANK YOU POST-INTERACTION MODAL CARD */}
      {isThankYouOpen && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.65)' }}>
          <img src="/images/thankyou.png" alt="Thank You Feedback Graphic" style={{ width: '320px', display: 'block' }} />
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