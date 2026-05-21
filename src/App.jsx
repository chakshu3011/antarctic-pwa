import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ARGame from "./Pages/ARGame";

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

  // Combined trigger function: Plays audio track AND opens AR view natively
  const handleAudioAndAR = (e) => {
    e.stopPropagation(); 
    
    // 1. Play the audio track safely
    const audio = new Audio('/audio/icy_voice.mp3'); 
    audio.play().catch(err => console.log("Audio waiting for hardware clearance:", err));

    // 2. Programmatically trigger the hidden native AR button
    const nativeArButton = document.getElementById('hidden-native-ar-trigger');
    if (nativeArButton) nativeArButton.click();
  };

  // Combined trigger function: Sets frame state AND opens AR view natively
  const handleFrameAndAR = (frameName) => {
    setActiveFrame(activeFrame === frameName ? null : frameName);
    
    // Programmatically trigger the hidden native AR button
    const nativeArButton = document.getElementById('hidden-native-ar-trigger');
    if (nativeArButton) nativeArButton.click();
  };

  const isBlurred = isInfoOpen || isThankYouOpen;

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100dvh', margin: 0, padding: 0, overflow: 'hidden', backgroundColor: 'black', fontFamily: 'sans-serif' }}>

      {/* 1. MAIN DISPLAY MATRIX */}
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
          
          {/* CRITICAL FIXED CODE: Hidden native gatekeeper trigger required by model-viewer engine */}
          <button 
            slot="ar-button" 
            id="hidden-native-ar-trigger" 
            style={{ display: 'none' }}
          ></button>

        </model-viewer>
      </div>

      {/* 2. DYNAMIC CAMERA VIEW OVERLAY FRAME LAYER */}
      {activeFrame && !isBlurred && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }}>
          <img 
            src={activeFrame === 'frame1' ? '/images/frame1.png' : '/images/frame2.png'} 
            alt="Active Overlay Frame Graphic"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
      )}

      {/* 3. BOTTOM UI CONTROLS STACK */}
      {!isBlurred && (
        <>
          {/* TOP CENTER PANEL: Tapping this plays audio AND activates native camera mode instantly */}
          <div style={{ position: 'absolute', top: '30px', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 20 }}>
            <button
              onClick={handleAudioAndAR}
              style={{
                padding: '12px 24px', backgroundColor: '#2B4BAA', color: 'white',
                border: '2px solid white', borderRadius: '30px', fontWeight: 'bold', fontSize: '14px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)', cursor: 'pointer'
              }}
            >
              🔊 Tap to hear ICY
            </button>
          </div>

          {/* BOTTOM COLUMN ROW PANELS */}
          <div style={{ 
            position: 'absolute', 
            bottom: '80px', 
            left: 0, 
            right: 0, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '16px', 
            zIndex: 20 
          }}>
            
            {/* ROW 1: Tapping either frame applies the layout state AND activates camera mode instantly */}
            <div style={{ display: 'flex', gap: '12px', backgroundColor: 'rgba(0,0,0,0.6)', padding: '10px 18px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <button 
                onClick={() => handleFrameAndAR('frame1')}
                style={{
                  padding: '10px 20px', borderRadius: '12px', border: 'none',
                  backgroundColor: activeFrame === 'frame1' ? '#10b981' : '#374151',
                  color: 'white', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer'
                }}
              >
                {activeFrame === 'frame1' ? '✓ Frame 1' : 'Frame 1'}
              </button>
              <button 
                onClick={() => handleFrameAndAR('frame2')}
                style={{
                  padding: '10px 20px', borderRadius: '12px', border: 'none',
                  backgroundColor: activeFrame === 'frame2' ? '#10b981' : '#374151',
                  color: 'white', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer'
                }}
              >
                {activeFrame === 'frame2' ? '✓ Frame 2' : 'Frame 2'}
              </button>
            </div>

            {/* ROW 2: Minimalist Info Action Button */}
            <button
              onClick={() => setIsInfoOpen(true)}
              style={{
                padding: '10px 30px', 
                backgroundColor: 'rgba(255, 255, 255, 0.15)', 
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)', 
                borderRadius: '20px', 
                fontWeight: 'bold', 
                fontSize: '14px',
                backdropFilter: 'blur(4px)', 
                cursor: 'pointer'
              }}
            >
              Info
            </button>

          </div>
        </>
      )}

      {/* 4. GRAPHIC INFO MODAL CARD */}
      {isInfoOpen && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsInfoOpen(false)}
              style={{ position: 'absolute', top: '12px', right: '12px', width: '30px', height: '30px', borderRadius: '50%', border: '1.5px solid white', backgroundColor: '#2B4BAA', color: 'white', fontSize: '18px', fontWeight: '300', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
            >✕</button>
            <img src="/images/info.png" alt="Penguin Facts Informational Card" style={{ width: '340px', borderRadius: '24px', display: 'block' }} />
            <img src="/images/try.png" alt="Card Interaction Target" onClick={() => { setIsInfoOpen(false); setIsThankYouOpen(true); }} style={{ position: 'absolute', bottom: '45px', left: '50%', transform: 'translateX(-50%)', width: '120px', cursor: 'pointer' }} />
          </div>
        </div>
      )}

      {/* 5. THANK YOU DIALOGUE Note */}
      {isThankYouOpen && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.65)' }}>
          <img src="/images/thankyou.png" alt="Appreciation Frame Graphic" style={{ width: '320px', display: 'block' }} />
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