import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const PenguinAR = () => {
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
    audio.play().catch(err => console.log("Audio play error:", err));
  };

  const isBlurred = isInfoOpen || isThankYouOpen;

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden', backgroundColor: 'black', fontFamily: 'sans-serif' }}>

      {/* 1. LAYER BLOCK: MAIN 3D DISPLAY CONTAINER */}
      <div style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
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
          scale="10 10 10"
          ar-placement="floor"
          ar-scale="fixed"
          style={{ width: '100%', height: '100%', display: 'block', backgroundColor: 'transparent' }}
        >
          
          {/* THE IMMERSIVE AR VIEW INTERFACE LAYER */}
          {/* Everything contained inside this single div block anchors onto the device camera view layout */}
          <div slot="ar-button" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            
            {/* Hidden baseline native trigger component node */}
            <button id="ar-trigger" style={{ display: 'none' }}></button>

            {/* Top Center: Audio Controller inside AR session */}
            <div style={{ position: 'absolute', top: '40px', left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'auto' }}>
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

            {/* Bottom Row: Interface Frame Selectors inside AR session */}
            <div style={{ position: 'absolute', bottom: '40px', left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'auto' }}>
              <div style={{ display: 'flex', gap: '12px', backgroundColor: 'rgba(0,0,0,0.75)', padding: '12px 20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)' }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveFrame(activeFrame === 'frame1' ? null : 'frame1'); }}
                  style={{
                    padding: '10px 20px', borderRadius: '12px', border: 'none',
                    backgroundColor: activeFrame === 'frame1' ? '#10b981' : '#374151',
                    color: 'white', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer'
                  }}
                >
                  {activeFrame === 'frame1' ? '✓ Frame 1' : 'Frame 1'}
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveFrame(activeFrame === 'frame2' ? null : 'frame2'); }}
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

        </model-viewer>
      </div>

      {/* SCREEN LAYER BOUNDARY OVERLAY FRAME */}
      {activeFrame && !isBlurred && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
          <img 
            src={activeFrame === 'frame1' ? '/images/frame1.png' : '/images/frame2.png'} 
            alt="Active Overlay Frame Graphic"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
      )}

      {/* 2. LAYER BLOCK: THE WEBPAGE INTRO SCREEN BUTTON CONTROLLERS */}
      {!isBlurred && (
        <div style={{ position: 'absolute', bottom: '50px', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', zIndex: 20 }}>
          
          {/* Main Action Trigger */}
          <button
            onClick={() => {
              const el = document.getElementById('ar-trigger');
              if (el) el.click();
            }}
            style={{
              padding: '14px 28px', backgroundColor: '#2B4BAA', color: 'white',
              border: '2px solid white', borderRadius: '30px', fontWeight: 'bold', fontSize: '16px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.4)', cursor: 'pointer'
            }}
          >
            See ICY in AR
          </button>

          {/* Secondary Info Popup Button */}
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

      {/* 3. POPUP MODAL: INFORMATION GRAPHIC OVERLAY CARD */}
      {isInfoOpen && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsInfoOpen(false)}
              style={{ position: 'absolute', top: '12px', right: '12px', width: '30px', height: '30px', borderRadius: '50%', border: '1.5px solid white', backgroundColor: '#2B4BAA', color: 'white', fontSize: '18px', fontWeight: '300', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
            >✕</button>
            <img src="/images/info.png" alt="Penguin Facts Informational Card" style={{ width: '340px', borderRadius: '24px', display: 'block' }} />
            <img src="/images/try.png" alt="Card Click Action Target" onClick={() => { setIsInfoOpen(false); setIsThankYouOpen(true); }} style={{ position: 'absolute', bottom: '45px', left: '50%', transform: 'translateX(-50%)', width: '120px', cursor: 'pointer' }} />
          </div>
        </div>
      )}

      {/* 4. POPUP MODAL: CONSERVATION APPRECIATION DIALOGUE CARD */}
      {isThankYouOpen && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.65)' }}>
          <img src="/images/thankyou.png" alt="Appreciation Message Graphic" style={{ width: '320px', display: 'block' }} />
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