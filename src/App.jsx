import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const PenguinAR = () => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isThankYouOpen, setIsThankYouOpen] = useState(false);
  
  // Hard-tracks if the phone's camera is actively running
  const [isArActive, setIsArActive] = useState(false); 
  const [isFrameActive, setIsFrameActive] = useState(false);

  const modelRef = useRef(null);

  // Safely listens to the phone's native AR hardware status
  useEffect(() => {
    const model = modelRef.current;
    if (!model) return;

    const handleARStatus = (event) => {
      if (event.detail.status === 'session-started') {
        setIsArActive(true); // Camera turned on -> Switch to AR Menu
      } else if (event.detail.status === 'not-presenting') {
        setIsArActive(false); // Camera turned off -> Back to Web View
        setIsFrameActive(false); // Reset frame
      }
    };

    model.addEventListener('ar-status', handleARStatus);
    return () => model.removeEventListener('ar-status', handleARStatus);
  }, []);

  // Closes Thank You screen after 5 seconds
  useEffect(() => {
    if (isThankYouOpen) {
      const timer = setTimeout(() => setIsThankYouOpen(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isThankYouOpen]);

  const playIcyVoice = (e) => {
    e.stopPropagation(); 
    const audio = new Audio('/audio/icy_voice.mp3'); 
    audio.play().catch(err => console.log("Audio Error:", err));
  };

  const isBlurred = isInfoOpen || isThankYouOpen;

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100dvh', margin: 0, padding: 0, overflow: 'hidden', backgroundColor: 'black', fontFamily: 'sans-serif' }}>

      {/* 1. MASTER 3D RENDERING CANVAS */}
      <div style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        transition: 'filter 0.5s ease',
        filter: isBlurred ? 'blur(10px)' : 'none',
        zIndex: 1
      }}>
        <model-viewer
          ref={modelRef}
          src="/models/penguin1.glb"
          ios-src="https://antarctic-pwa.vercel.app/models/penguin1.usdz"
          autoplay
          animation-name="idle"
          ar
          ar-modes="webxr quick-look" // WebXR for Android overlay, Quick-look fallback for iOS
          camera-controls
          scale="10 10 10"
          ar-placement="floor"
          ar-scale="fixed"
          style={{ width: '100%', height: '100%', display: 'block', backgroundColor: 'transparent' }}
        >
          
          {/* =========================================================================
              THE REAL NATIVE AR LAUNCH BUTTON (Visible ONLY in Web View)
              This is the only way browsers allow the camera to turn on safely.
             ========================================================================= */}
          <button 
            slot="ar-button" 
            style={{ 
              position: 'absolute', bottom: '120px', left: '50%', transform: 'translateX(-50%)',
              padding: '15px 35px', backgroundColor: '#2B4BAA', color: 'white',
              border: '2px solid white', borderRadius: '35px', fontWeight: 'bold', fontSize: '16px',
              boxShadow: '0 5px 20px rgba(0,0,0,0.4)', cursor: 'pointer',
              display: isArActive ? 'none' : 'block' // Instantly hides itself when AR starts
            }}
          >
            See ICY in AR
          </button>

          {/* =========================================================================
              THE IMMERSIVE AR INTERFACE (Visible ONLY when Camera is on)
              These must live INSIDE model-viewer to project onto the AR camera feed.
             ========================================================================= */}
          {isArActive && (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              
              {/* TOP: Audio Button */}
              <div style={{ position: 'absolute', top: '40px', left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'auto' }}>
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

              {/* BOTTOM: Frame Button */}
              <div style={{ position: 'absolute', bottom: '40px', left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'auto' }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsFrameActive(!isFrameActive); }}
                  style={{
                    padding: '12px 28px', borderRadius: '25px', border: '2px solid white',
                    backgroundColor: isFrameActive ? '#10b981' : '#2B4BAA',
                    color: 'white', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.4)'
                  }}
                >
                  {isFrameActive ? '✓ Frame Active' : 'Toggle Frame'}
                </button>
              </div>

              {/* FRAME IMAGE OVERLAY */}
              {isFrameActive && (
                <img 
                  src="/images/frame1.png" 
                  alt="Ice Crystal Overlay"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'fill', pointerEvents: 'none' }}
                />
              )}

            </div>
          )}

        </model-viewer>
      </div>

      {/* =========================================================================
          THE WEB VIEW INFO BUTTON (Visible ONLY in Web View)
         ========================================================================= */}
      {!isArActive && !isBlurred && (
        <button
          onClick={() => setIsInfoOpen(true)}
          style={{
            position: 'absolute', bottom: '60px', left: '50%', transform: 'translateX(-50%)',
            padding: '10px 25px', backgroundColor: 'rgba(255, 255, 255, 0.15)', color: 'white',
            border: '1px solid rgba(255,255,255,0.3)', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px',
            backdropFilter: 'blur(4px)', cursor: 'pointer', zIndex: 20
          }}
        >
          Info
        </button>
      )}

      {/* =========================================================================
          FACTS DIALOGUE POPUPS (Web View Overlays)
         ========================================================================= */}
      {isInfoOpen && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' }}>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setIsInfoOpen(false)} style={{ position: 'absolute', top: '12px', right: '12px', width: '30px', height: '30px', borderRadius: '50%', border: '1.5px solid white', backgroundColor: '#2B4BAA', color: 'white', fontSize: '18px', fontWeight: '300', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>✕</button>
            <img src="/images/info.png" alt="Penguin Facts Card" style={{ width: '340px', borderRadius: '24px', display: 'block' }} />
            <img src="/images/try.png" alt="Next Action" onClick={() => { setIsInfoOpen(false); setIsThankYouOpen(true); }} style={{ position: 'absolute', bottom: '45px', left: '50%', transform: 'translateX(-50%)', width: '120px', cursor: 'pointer' }} />
          </div>
        </div>
      )}

      {isThankYouOpen && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)' }}>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setIsThankYouOpen(false)} style={{ position: 'absolute', top: '12px', right: '12px', width: '30px', height: '30px', borderRadius: '50%', border: '1.5px solid white', backgroundColor: '#2B4BAA', color: 'white', fontSize: '18px', fontWeight: '300', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>✕</button>
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