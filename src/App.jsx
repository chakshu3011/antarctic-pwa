import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const PenguinAR = () => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isThankYouOpen, setIsThankYouOpen] = useState(false);
  const [isFrameActive, setIsFrameActive] = useState(false); // Clean Boolean Toggle

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
    audio.play().catch(err => console.log("Audio track initialized:", err));
  };

  const isBlurred = isInfoOpen || isThankYouOpen;

  // PASSES THE AUDIO & FRAME TRACK DIRECTLY INTO THE AR LAUNCH URLS
  const iosArUrl = `https://antarctic-pwa.vercel.app/models/penguin1.usdz#sound=/audio/icy_voice.mp3&allowsContentPausing=false${isFrameActive ? '&custom_overlay=/images/frame1.png' : ''}`;

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100dvh', margin: 0, padding: 0, overflow: 'hidden', backgroundColor: 'black', fontFamily: 'sans-serif' }}>

      {/* 1. LAYER 1: MAIN DISPLAY WINDOW */}
      <div style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '78%', // Perfect spacing to prevent penguin feet collision
        transition: 'filter 0.5s ease',
        filter: isBlurred ? 'blur(10px)' : 'none',
        zIndex: 1
      }}>
        <model-viewer
          src="/models/penguin1.glb"
          ios-src={iosArUrl} // Injects Audio & Frame into iOS Quick Look
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
          {/* Native AR Gatekeeper Trigger */}
          <button slot="ar-button" id="native-ar-gatekeeper" style={{ display: 'none' }}></button>
        </model-viewer>
      </div>

      {/* 2. LAYER 2: SYSTEM VIEW FRAME OVERLAY */}
      {isFrameActive && !isBlurred && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
          <img 
            src="/images/frame1.png" 
            alt="Ice Crystal Frame Overlay"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
      )}

      {/* 3. LAYER 3: PERFECTLY BALANCED HUD CONTROL BLOCK */}
      {!isBlurred && (
        <>
          {/* TOP CENTER ROW: Audio Track Controller */}
          <div style={{ position: 'absolute', top: '35px', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 20 }}>
            <button
              onClick={playIcyVoice}
              style={{
                padding: '12px 26px', backgroundColor: '#2B4BAA', color: 'white',
                border: '2px solid white', borderRadius: '30px', fontWeight: 'bold', fontSize: '14px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              🔊 Tap to hear ICY
            </button>
          </div>

          {/* BOTTOM COLUMN ROW PANELS */}
          <div style={{ 
            position: 'absolute', 
            bottom: '75px', // Pinned securely above iOS Safari's bottom address bar navigation
            left: 0, 
            right: 0, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '14px', 
            zIndex: 20 
          }}>
            
            {/* Primary Action Call: Intuitively launches AR mode with state settings preserved */}
            <button
              onClick={() => document.getElementById('native-ar-gatekeeper')?.click()}
              style={{
                padding: '15px 35px', backgroundColor: '#2B4BAA', color: 'white',
                border: '2px solid white', borderRadius: '35px', fontWeight: 'bold', fontSize: '16px',
                boxShadow: '0 5px 20px rgba(0,0,0,0.4)', cursor: 'pointer'
              }}
            >
              See ICY in AR 🐧
            </button>

            {/* Sub-Action Row: Toggle Frame & Info Row Side-by-Side */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setIsFrameActive(!isFrameActive)}
                style={{
                  padding: '10px 22px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.3)',
                  backgroundColor: isFrameActive ? '#10b981' : 'rgba(255,255,255,0.15)',
                  color: 'white', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', backdropFilter: 'blur(4px)'
                }}
              >
                {isFrameActive ? '✓ Frame On' : 'Toggle Frame'}
              </button>

              <button
                onClick={() => setIsInfoOpen(true)}
                style={{
                  padding: '10px 22px', backgroundColor: 'rgba(255, 255, 255, 0.15)', color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)', borderRadius: '20px', fontWeight: 'bold', fontSize: '13px',
                  backdropFilter: 'blur(4px)', cursor: 'pointer'
                }}
              >
                Info
              </button>
            </div>

          </div>
        </>
      )}

      {/* 4. LAYER 4: FACTS SHEET POPUP */}
      {isInfoOpen && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsInfoOpen(false)}
              style={{ position: 'absolute', top: '12px', right: '12px', width: '30px', height: '30px', borderRadius: '50%', border: '1.5px solid white', backgroundColor: '#2B4BAA', color: 'white', fontSize: '18px', fontWeight: '300', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
            >✕</button>
            <img src="/images/info.png" alt="Penguin Facts Informational Card" style={{ width: '340px', borderRadius: '24px', display: 'block' }} />
            <img src="/images/try.png" alt="Card Panel Handler" onClick={() => { setIsInfoOpen(false); setIsThankYouOpen(true); }} style={{ position: 'absolute', bottom: '45px', left: '50%', transform: 'translateX(-50%)', width: '120px', cursor: 'pointer' }} />
          </div>
        </div>
      )}

      {/* 5. LAYER 5: ACKNOWLEDGEMENT PANEL */}
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