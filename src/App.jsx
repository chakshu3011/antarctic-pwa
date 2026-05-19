import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const PenguinAR = () => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isThankYouOpen, setIsThankYouOpen] = useState(false);
  
  // Frame Controls
  const [isFrameModeOpen, setIsFrameModeOpen] = useState(false);
  const [activeFrame, setActiveFrame] = useState(null); // null, 'frame1', or 'frame2'

  // Safety Timer for the Thank You screen
  useEffect(() => {
    if (isThankYouOpen) {
      const timer = setTimeout(() => {
        setIsThankYouOpen(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isThankYouOpen]);

  // Platform Check: Detects if the visitor is using an iPhone/iPad
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  // Audio Playback Function
  const playIcyVoice = () => {
    const audio = new Audio('/audio/icy_voice.mp3'); // File goes into public/audio/
    audio.play().catch(err => console.log("Audio waiting for user click:", err));
  };

  // If any major overlay is open, dim/blur the background AR space
  const isBlurred = isInfoOpen || isThankYouOpen;

  return (
    <div style={{ width: '100vw', height: '100dvh', margin: 0, padding: 0, overflow: 'hidden', backgroundColor: 'black', fontFamily: 'sans-serif' }}>

      {/* 1. IMMERSIVE 3D CANVAS */}
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
          {/* iOS will natively launch its camera view from this button */}
          <button
            slot="ar-button"
            style={{
              position: 'absolute', bottom: '120px', left: '50%', transform: 'translateX(-50%)',
              padding: '14px 28px', backgroundColor: '#2B4BAA', color: 'white',
              border: '2px solid white', borderRadius: '30px', fontWeight: 'bold', zIndex: 10,
              boxShadow: '0 4px 15px rgba(0,0,0,0.4)', cursor: 'pointer'
            }}
          >
            👋 View ICY in AR
          </button>
        </model-viewer>
      </div>

      {/* 2. DYNAMIC LIVE FRAME OVERLAY LAYER (Web Screen View) */}
      {isFrameModeOpen && activeFrame && !isBlurred && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 30 }}>
          <img 
            src={activeFrame === 'frame1' ? '/images/frame1.png' : '/images/frame2.png'} 
            alt="Active Overlay Frame"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
      )}

      {/* 3. PROFESSIONAL CLEAN HUDS (Hidden on Intro/Overlay states) */}
      {!isBlurred && (
        <>
          {/* TOP LEFT: ICY'S AUDIO SPEAKER BUTTON (Always Visible for Web/Android view) */}
          {!isFrameModeOpen && (
            <button
              onClick={playIcyVoice}
              style={{
                position: 'absolute', top: '30px', left: '30px',
                width: '65px', height: '65px', backgroundColor: '#2B4BAA',
                border: '2px solid white', borderRadius: '50%', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 25,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <span style={{ fontSize: '20px' }}>🔊</span>
              <span style={{ fontSize: '9px', color: 'white', fontWeight: 'bold', marginTop: '2px' }}>ICY'S VOICE</span>
            </button>
          )}

          {/* BOTTOM MAIN NAV CONTROLS */}
          <div style={{
            position: 'absolute', bottom: '30px', left: 0, right: 0,
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', zIndex: 25
          }}>
            
            {/* If Frame Selection Is Closed -> Show Base Navigation */}
            {!isFrameModeOpen ? (
              <>
                {/* ANDROID ONLY COMPONENT: Don't clutter iOS screen with frame logic */}
                {!isIOS && (
                  <button
                    onClick={() => setIsFrameModeOpen(true)}
                    style={{
                      padding: '12px 24px', backgroundColor: '#10b981', color: 'white',
                      border: '2px solid white', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}
                  >
                    🖼️ Choose Frame
                  </button>
                )}

                <button
                  onClick={() => setIsInfoOpen(true)}
                  style={{
                    padding: '15px 35px', backgroundColor: '#2B4BAA', color: 'white',
                    border: '2px solid white', borderRadius: '50px', fontWeight: 'bold', fontSize: '16px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.4)', cursor: 'pointer'
                  }}
                >
                  Meet ICY 🐧
                </button>
              </>
            ) : (
              /* If Frame Selection Is Active -> Show Frame Controls Instead */
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.75)', padding: '15px 25px',
                borderRadius: '24px', border: '1px solid rgba(255,255,255,0.2)', gap: '12px'
              }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => setActiveFrame(activeFrame === 'frame1' ? null : 'frame1')}
                    style={{
                      padding: '10px 20px', borderRadius: '15px', border: 'none',
                      backgroundColor: activeFrame === 'frame1' ? '#10b981' : '#374151',
                      color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px'
                    }}
                  >
                    {activeFrame === 'frame1' ? '✓ Frame 1' : 'Frame 1'}
                  </button>
                  <button 
                    onClick={() => setActiveFrame(activeFrame === 'frame2' ? null : 'frame2')}
                    style={{
                      padding: '10px 20px', borderRadius: '15px', border: 'none',
                      backgroundColor: activeFrame === 'frame2' ? '#10b981' : '#374151',
                      color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px'
                    }}
                  >
                    {activeFrame === 'frame2' ? '✓ Frame 2' : 'Frame 2'}
                  </button>
                </div>
                
                <button 
                  onClick={() => { setIsFrameModeOpen(false); setActiveFrame(null); }}
                  style={{ background: 'none', border: 'none', color: '#9ca3af', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                >
                  Back to Main
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* 4. DESIGN CARD INFO OVERLAY */}
      {isInfoOpen && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsInfoOpen(false)}
              style={{ position: 'absolute', top: '12px', right: '12px', width: '30px', height: '30px', borderRadius: '50%', border: '1.5px solid white', backgroundColor: '#2B4BAA', color: 'white', fontSize: '18px', fontWeight: '300', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
            >✕</button>
            <img src="/images/info.png" alt="Penguin Facts Card" style={{ width: '340px', borderRadius: '24px', display: 'block' }} />
            <img src="/images/try.png" alt="Action Trigger" onClick={() => { setIsInfoOpen(false); setIsThankYouOpen(true); }} style={{ position: 'absolute', bottom: '45px', left: '50%', transform: 'translateX(-50%)', width: '120px', cursor: 'pointer' }} />
          </div>
        </div>
      )}

      {/* 5. THANK YOU POST-GAME DIALOGUE PANEL */}
      {isThankYouOpen && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.65)' }}>
          <img src="/images/thankyou.png" alt="Appreciation Frame" style={{ width: '320px', display: 'block' }} />
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