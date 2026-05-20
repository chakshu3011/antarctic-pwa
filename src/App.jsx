import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const PenguinAR = () => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isThankYouOpen, setIsThankYouOpen] = useState(false);
  const [isInArMode, setIsInArMode] = useState(false); 
  const [isFrameActive, setIsFrameActive] = useState(false); 

  // Persistent reference holder to manage active audio streams safely
  const audioRef = useRef(null);

  // Automatically closes the Thank You panel after 5 seconds
  useEffect(() => {
    if (isThankYouOpen) {
      const timer = setTimeout(() => {
        setIsThankYouOpen(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isThankYouOpen]);

  // Safely stops any active playing audio track
  const stopIcyVoice = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Rewind track to start
    }
  };

  // Audio Playback Engine
  const playIcyVoice = (e) => {
    e.stopPropagation(); 
    
    // Stop any existing playback track before starting a new one
    stopIcyVoice();

    const audio = new Audio('/audio/icy_voice.mp3'); 
    audioRef.current = audio;
    audio.play().catch(err => console.log("Audio track trace:", err));
  };

  const isBlurred = isInfoOpen || isThankYouOpen;

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100dvh', margin: 0, padding: 0, overflow: 'hidden', backgroundColor: 'black', fontFamily: 'sans-serif' }}>

      {/* 1. MASTER 3D RENDERING CANVAS */}
      <div style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '80%', 
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
          <button slot="ar-button" id="native-ar-system-trigger" style={{ display: 'none' }}></button>
        </model-viewer>
      </div>

      {/* 2. ICE CRYSTAL OVERLAY FRAME */}
      {isFrameActive && !isBlurred && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
          <img 
            src="/images/frame1.png" 
            alt="Ice Crystal Frame Overlay"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
      )}

      {/* FLOW SCREEN A: THE WEBPAGE VIEW INTERFACE */}
      {!isInArMode && !isBlurred && (
        <div style={{ position: 'absolute', bottom: '65px', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', zIndex: 20 }}>
          <button
            onClick={() => {
              setIsInArMode(true);
              setTimeout(() => {
                const trigger = document.getElementById('native-ar-system-trigger');
                if (trigger) trigger.click();
              }, 100);
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

      {/* FLOW SCREEN B: THE IMMERSIVE AR VIEW INTERFACE */}
      {isInArMode && !isBlurred && (
        <>
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

          <div style={{ position: 'absolute', bottom: '70px', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', zIndex: 25 }}>
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

            {/* Back Button explicitly kills any running audio streams when exiting */}
            <button
              onClick={() => { 
                setIsInArMode(false); 
                setIsFrameActive(false); 
                stopIcyVoice(); 
              }}
              style={{ background: 'none', border: 'none', color: '#9ca3af', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Back to Web View
            </button>
          </div>
        </>
      )}

      {/* OVERLAY: INFO POPUP CARD LAYOUT */}
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

      {/* OVERLAY: THANK YOU POPUP CARD LAYOUT */}
      {isThankYouOpen && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)' }}>
          <div style={{ position: 'relative', width: 'auto', height: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            
            {/* FIXED CLOSE BUTTON: Uniformly aligned, clean, and scaling safe */}
            <button
              onClick={() => {
                setIsThankYouOpen(false);
                stopIcyVoice(); // Ensures audio stops if they close the modal manually
              }}
              style={{ 
                position: 'absolute', 
                top: '20px', 
                right: '20px', 
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

            {/* FIXED CONTAINER IMAGE: Constraints prevent any screen edge clipping */}
            <img 
              src="/images/thankyou.png" 
              alt="Thank You Dialogue Panel" 
              style={{ 
                width: '90vw',
                maxWidth: '340px', 
                maxHeight: '80vh',
                borderRadius: '24px', 
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
        <Route path="/" element={<PenguinAR />} />
        <Route path="/penguin" element={<PenguinAR />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;