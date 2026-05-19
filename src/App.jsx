import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const PenguinAR = () => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isThankYouOpen, setIsThankYouOpen] = useState(false);
  
  // Frame state utilized inside the AR environment layer
  const [activeFrame, setActiveFrame] = useState(null); // null, 'frame1', or 'frame2'

  useEffect(() => {
    if (isThankYouOpen) {
      const timer = setTimeout(() => {
        setIsThankYouOpen(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isThankYouOpen]);

  // Audio Handler triggered inside the AR Interface
  const playIcyVoice = (e) => {
    e.stopPropagation(); // Stops interaction from breaking the AR tracking plane
    const audio = new Audio('/audio/icy_voice.mp3'); 
    audio.play().catch(err => console.log("Audio awaiting hardware clearance:", err));
  };

  const isBlurred = isInfoOpen || isThankYouOpen;

  return (
    <div style={{ width: '100vw', height: '100dvh', margin: 0, padding: 0, overflow: 'hidden', backgroundColor: 'black', fontFamily: 'sans-serif' }}>

      {/* 1. IMMERSIVE AR VIEWER FRAMEWORK */}
      <div style={{
        width: '100%', height: '100%',
        transition: 'filter 0.5s ease',
        filter: isBlurred ? 'blur(10px)' : 'none'
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
          style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
        >
          
          {/* ====== THE IMMERSIVE AR CAMERA SCREEN HUD INTERFACE ====== */}
          {/* Everything inside this slot ONLY appears AFTER the user triggers the AR view camera */}
          <div slot="ar-button" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 100 }}>
            
            {/* Live Transparent PNG Frame Overlay (Appears pinned to the screen boundary in AR mode) */}
            {activeFrame && (
              <img 
                src={activeFrame === 'frame1' ? '/images/frame1.png' : '/images/frame2.png'} 
                alt="Active Frame Border"
                style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'absolute', inset: 0, pointerEvents: 'none' }}
              />
            )}

            {/* Top Center Layout: The Audio Track Controller */}
            <div style={{ position: 'absolute', top: '40px', left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'auto' }}>
              <button
                onClick={playIcyVoice}
                style={{
                  padding: '10px 20px', backgroundColor: '#2B4BAA', color: 'white',
                  border: '2px solid white', borderRadius: '30px', fontWeight: 'bold', fontSize: '13px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                <span>🔊</span> Tap to hear ICY
              </button>
            </div>

            {/* Bottom Row Layout: Interactive Frame Selectors */}
            <div style={{
              position: 'absolute', bottom: '40px', left: 0, right: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
              pointerEvents: 'auto'
            }}>
              <div style={{ display: 'flex', gap: '10px', backgroundColor: 'rgba(0,0,0,0.6)', padding: '10px 18px', borderRadius: '20px' }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveFrame(activeFrame === 'frame1' ? null : 'frame1'); }}
                  style={{
                    padding: '8px 16px', borderRadius: '12px', border: 'none',
                    backgroundColor: activeFrame === 'frame1' ? '#10b981' : '#374151',
                    color: 'white', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer'
                  }}
                >
                  {activeFrame === 'frame1' ? '✓ Frame 1' : 'Frame 1'}
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveFrame(activeFrame === 'frame2' ? null : 'frame2'); }}
                  style={{
                    padding: '8px 16px', borderRadius: '12px', border: 'none',
                    backgroundColor: activeFrame === 'frame2' ? '#10b981' : '#374151',
                    color: 'white', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer'
                  }}
                >
                  {activeFrame === 'frame2' ? '✓ Frame 2' : 'Frame 2'}
                </button>
              </div>
            </div>

          </div>

          {/* ====== THE BASE RE-BRANDED ENTRY OVERLAY SYSTEM VIEW ====== */}
          {/* Spawns cleanly positioned on the initial web view loader interface */}
          {!isBlurred && (
            <div style={{ position: 'absolute', bottom: '40px', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', zIndex: 20 }}>
              
              {/* Primary Action Call: Intuitively Launches Immersive Component */}
              <button
                style={{
                  padding: '14px 28px', backgroundColor: '#2B4BAA', color: 'white',
                  border: '2px solid white', borderRadius: '30px', fontWeight: 'bold', fontSize: '16px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.4)', cursor: 'pointer'
                }}
              >
                See ICY in AR
              </button>

              {/* Minimalist Sub-Action Trigger */}
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

        </model-viewer>
      </div>

      {/* 2. GRAPHIC INFORMATION POPUP PANEL */}
      {isInfoOpen && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsInfoOpen(false)}
              style={{ position: 'absolute', top: '12px', right: '12px', width: '30px', height: '30px', borderRadius: '50%', border: '1.5px solid white', backgroundColor: '#2B4BAA', color: 'white', fontSize: '18px', fontWeight: '300', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
            >✕</button>
            <img src="/images/info.png" alt="Penguin Facts Panel" style={{ width: '340px', borderRadius: '24px', display: 'block' }} />
            <img src="/images/try.png" alt="Card Interaction Handler" onClick={() => { setIsInfoOpen(false); setIsThankYouOpen(true); }} style={{ position: 'absolute', bottom: '45px', left: '50%', transform: 'translateX(-50%)', width: '120px', cursor: 'pointer' }} />
          </div>
        </div>
      )}

      {/* 3. CONSERVATION ACKNOWLEDGEMENT PANEL */}
      {isThankYouOpen && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.65)' }}>
          <img src="/images/thankyou.png" alt="Thank You Dialogue Panel" style={{ width: '320px', display: 'block' }} />
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