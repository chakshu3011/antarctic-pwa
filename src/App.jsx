import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const PenguinAR = () => {
  const [currentScreen, setCurrentScreen] = useState('intro'); // 'intro', 'ar-mode', 'info', 'thankyou'
  const [activeFrame, setActiveFrame] = useState(null); // null, 'frame1', or 'frame2'

  useEffect(() => {
    if (currentScreen === 'thankyou') {
      const timer = setTimeout(() => {
        setCurrentScreen('intro');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  // Immersive Voice Audio Player - Works completely inside the camera screen now!
  const playIcyVoice = () => {
    const audio = new Audio('/audio/icy_voice.mp3'); 
    audio.play().catch(err => console.log("Audio waiting for user clearance:", err));
  };

  return (
    <div style={{ width: '100vw', height: '100dvh', margin: 0, padding: 0, overflow: 'hidden', backgroundColor: 'black', fontFamily: 'sans-serif', position: 'relative' }}>

      {/* =========================================================
          SCREEN 1: THE CLEAN INTRO WEB PREVIEW
          ========================================================= */}
      {currentScreen === 'intro' && (
        <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 10 }}>
          {/* Base 3D Preview */}
          <model-viewer
            src="/models/penguin1.glb"
            autoplay
            animation-name="idle"
            camera-controls
            interaction-prompt="none"
            style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
          />
          
          {/* Bottom Center Navigation Row */}
          <div style={{ position: 'absolute', bottom: '50px', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', zIndex: 15 }}>
            <button
              onClick={() => setCurrentScreen('ar-mode')}
              style={{
                padding: '14px 32px', backgroundColor: '#2B4BAA', color: 'white',
                border: '2px solid white', borderRadius: '30px', fontWeight: 'bold', fontSize: '16px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.4)', cursor: 'pointer'
              }}
            >
              See ICY in AR
            </button>

            <button
              onClick={() => setCurrentScreen('info')}
              style={{
                padding: '10px 25px', backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'white',
                border: '1px solid rgba(255,255,255,0.4)', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px',
                backdropFilter: 'blur(4px)', cursor: 'pointer'
              }}
            >
              Info
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          SCREEN 2: TRUE IN-BROWSER AR CAMERA MODE (THE PIVOT)
          ========================================================= */}
      {currentScreen === 'ar-mode' && (
        <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 20 }}>
          
          {/* 1. THE WEB CAMERA AR SCENE ENGINE */}
          {/* This injects the camera stream directly into the background of your webpage */}
          <a-scene 
            embedded 
            arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix;"
            vr-mode-ui="enabled: false"
            style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
          >
            {/* Asset Management System to pre-load ICY */}
            <a-assets>
              <a-asset-item id="icyModel" src="/models/penguin1.glb"></a-asset-item>
            </a-assets>

            {/* Markerless/Floor Anchor configuration */}
            {/* Positioned slightly forward (z: -2) so ICY spawns instantly in front of the camera view */}
            <a-entity 
              gltf-model="#icyModel" 
              position="0 -0.5 -2" 
              scale="0.8 0.8 0.8"
              animation-mixer="clip: idle;"
            ></a-entity>

            <a-entity camera></a-entity>
          </a-scene>

          {/* 2. LIVE INTERACTIVE HTML FRAMES (Renders flawlessly on top of the phone camera!) */}
          {activeFrame && (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 25 }}>
              <img 
                src={activeFrame === 'frame1' ? '/images/frame1.png' : '/images/frame2.png'} 
                alt="Active Border Frame"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
          )}

          {/* 3. INTERACTIVE HUD BUTTON ROW */}
          {/* TOP CENTER: Audio Controller Button */}
          <div style={{ position: 'absolute', top: '40px', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 30 }}>
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

          {/* BOTTOM CENTER: Frame Switcher Panel */}
          <div style={{ position: 'absolute', bottom: '40px', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', zIndex: 30 }}>
            <div style={{ display: 'flex', gap: '12px', backgroundColor: 'rgba(0,0,0,0.7)', padding: '10px 20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <button 
                onClick={() => setActiveFrame(activeFrame === 'frame1' ? null : 'frame1')}
                style={{
                  padding: '8px 16px', borderRadius: '12px', border: 'none',
                  backgroundColor: activeFrame === 'frame1' ? '#10b981' : '#374151',
                  color: 'white', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer'
                }}
              >
                {activeFrame === 'frame1' ? '✓ Frame 1' : 'Frame 1'}
              </button>
              <button 
                onClick={() => setActiveFrame(activeFrame === 'frame2' ? null : 'frame2')}
                style={{
                  padding: '8px 16px', borderRadius: '12px', border: 'none',
                  backgroundColor: activeFrame === 'frame2' ? '#10b981' : '#374151',
                  color: 'white', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer'
                }}
              >
                {activeFrame === 'frame2' ? '✓ Frame 2' : 'Frame 2'}
              </button>
            </div>

            {/* Back Button to exit AR cleanly */}
            <button 
              onClick={() => { setCurrentScreen('intro'); setActiveFrame(null); }}
              style={{ background: 'rgba(0,0,0,0.6)', border: 'none', color: '#cbd5e1', padding: '6px 12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
            >
              ← Back to Main
            </button>
          </div>

        </div>
      )}

      {/* =========================================================
          SCREEN 3: THE FACTS INFO OVERLAY SCREEN
          ========================================================= */}
      {currentScreen === 'info' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setCurrentScreen('intro')}
              style={{ position: 'absolute', top: '12px', right: '12px', width: '30px', height: '30px', borderRadius: '50%', border: '1.5px solid white', backgroundColor: '#2B4BAA', color: 'white', fontSize: '18px', fontWeight: '300', cursor: 'pointer', zIndex: 45, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
            >✕</button>
            <img src="/images/info.png" alt="Penguin Facts Card" style={{ width: '340px', borderRadius: '24px', display: 'block' }} />
            <img src="/images/try.png" alt="Action Trigger" onClick={() => { setCurrentScreen('thankyou')} } style={{ position: 'absolute', bottom: '45px', left: '50%', transform: 'translateX(-50%)', width: '120px', cursor: 'pointer' }} />
          </div>
        </div>
      )}

      {/* =========================================================
          SCREEN 4: THE THANK YOU APPRECIATION SCREEN
          ========================================================= */}
      {currentScreen === 'thankyou' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <img src="/images/thankyou.png" alt="Appreciation Graphic" style={{ width: '320px', display: 'block' }} />
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