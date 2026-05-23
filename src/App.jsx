import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ARGame from "./Pages/ARGame";

const PenguinAR = () => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isThankYouOpen, setIsThankYouOpen] = useState(false);
  
  const [isArActive, setIsArActive] = useState(false); 
  const [isFrameActive, setIsFrameActive] = useState(false);

  const modelRef = useRef(null);
  
  // Audio references for the iOS background loop
  const audioRef = useRef(new Audio('/audio/icy_voice.mp3'));
  const loopTimeoutRef = useRef(null);

  // Reliable iOS detector
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  // Safely listens to the phone's native AR hardware status
  useEffect(() => {
    const model = modelRef.current;
    if (!model) return;

    const handleARStatus = (event) => {
      if (event.detail.status === 'session-started') {
        // ONLY trigger the custom HTML menu if it is Android (WebXR)
        if (!isIOS) {
          setIsArActive(true); 
        }
      } else if (event.detail.status === 'not-presenting') {
        setIsArActive(false); 
        setIsFrameActive(false); 
        // If it's iOS, kill the background audio loop when they close Quick Look
        if (isIOS) {
          stopIOSAudioLoop();
        }
      }
    };

    model.addEventListener('ar-status', handleARStatus);
    return () => model.removeEventListener('ar-status', handleARStatus);
  }, [isIOS]);

  // Closes Thank You screen automatically
  useEffect(() => {
    if (isThankYouOpen) {
      const timer = setTimeout(() => setIsThankYouOpen(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isThankYouOpen]);

  // Manual Play for Android (Unchanged)
  const playIcyVoice = (e) => {
    e.stopPropagation(); 
    const audio = new Audio('/audio/icy_voice.mp3'); 
    audio.play().catch(err => console.log("Audio Error:", err));
  };

  // =========================================================================
  // THE IOS CUSTOM BACKGROUND AUDIO ENGINE
  // =========================================================================
  const startIOSAudioLoop = () => {
    // 1. UNLOCK TRICK: Play and instantly pause to bypass Apple's autoplay block
    audioRef.current.play().then(() => {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;

      // 2. The Looping Function
      const playWithDelay = () => {
        loopTimeoutRef.current = setTimeout(() => {
          audioRef.current.play().catch(e => console.log("iOS Play blocked:", e));
        }, 5000); // 5 second delay before playing
      };

      // 3. When audio finishes naturally, trigger the delay loop again
      audioRef.current.onended = playWithDelay;

      // Start the very first 5-second countdown
      playWithDelay();
    }).catch(e => console.log("Audio unlock failed:", e));
  };

  const stopIOSAudioLoop = () => {
    if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    audioRef.current.onended = null;
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
          ar-modes="webxr quick-look" 
          camera-controls
          // scale="10 10 10"
          ar-placement="floor"
          ar-scale="fixed"
          style={{ width: '100%', height: '100%', display: 'block', backgroundColor: 'transparent' }}
        >
          
          <button 
            slot="ar-button" 
            id="native-ar-system-trigger" 
            style={{ display: 'none' }}
          ></button>

          {/* =========================================================================
              THE IMMERSIVE AR INTERFACE (ANDROID ONLY)
             ========================================================================= */}
          {isArActive && !isIOS && (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              
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
          THE WEB VIEW MAIN BUTTONS
         ========================================================================= */}
      {!isArActive && !isBlurred && (
        <div style={{ position: 'absolute', bottom: '60px', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', zIndex: 20 }}>
          
          <button
            onClick={() => {
              if (isIOS) {
                // iOS Flow: Start background loop, trigger native Quick Look
                startIOSAudioLoop();
                const trigger = document.getElementById('native-ar-system-trigger');
                if (trigger) trigger.click();
              } else {
                // Android Flow: Trigger standard WebXR setup
                const trigger = document.getElementById('native-ar-system-trigger');
                if (trigger) trigger.click();
              }
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
          FACTS DIALOGUE POPUPS
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

      {/* OVERLAY: THANK YOU POPUP CARD LAYOUT */}
      {isThankYouOpen && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)' }}>
          <div style={{ position: 'relative', width: 'auto', height: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            
            {/* FIXED CLOSE BUTTON: Pulled outwards using negative values */}
            <button
              onClick={() => {
                setIsThankYouOpen(false);
              }}
              style={{ 
                position: 'absolute', 
                top: '-20px',   // Changed from 20px
                right: '-20px', // Changed from 20px
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                border: '1.5px solid white', 
                backgroundColor: 'rgba(43, 75, 170, 0.9)', 
                color: 'white', 
                fontSize: '16px', 
                fontWeight: 'bold', 
                cursor: 'pointer', 
                zIndex: 70, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                padding: 0,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
            >
              ✕
            </button>

            {/* FIXED CONTAINER IMAGE: Removed border-radius to prevent clipping */}
            <img 
              src="/images/thankyou.png" 
              alt="Thank You Dialogue Panel" 
              style={{ 
                width: '90vw',
                maxWidth: '340px', 
                maxHeight: '80vh',
                display: 'block',
                objectFit: 'contain'
              }}
            />
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
        <Route path="/"          element={<PenguinAR />} />
        <Route path="/penguin"   element={<PenguinAR />} />
        <Route path="/ARpenguin" element={<PenguinAR />} />
        <Route path="/game"      element={<ARGame />} />
        <Route path="/ARgame"    element={<ARGame />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;