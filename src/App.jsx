import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const PenguinAR = () => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isThankYouOpen, setIsThankYouOpen] = useState(false);
  
  // FRAME CONTROLS FOR LIVE AR CAPTURE
  const [activeFrame, setActiveFrame] = useState(null); // null, 'frame1', or 'frame2'

  useEffect(() => {
    if (isThankYouOpen) {
      const timer = setTimeout(() => {
        setIsThankYouOpen(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isThankYouOpen]);

  // CAPTURES AR CANVAS AND MERGES ACTIVE PNG FRAME
  const captureArSnapshot = async () => {
    const viewer = document.querySelector('model-viewer');
    if (!viewer) return;

    // 1. Grab raw pixels from webxr canvas stream
    const rawSceneBase64 = viewer.toDataURL({ format: 'png' });

    const outputCanvas = document.createElement('canvas');
    const drawingContext = outputCanvas.getContext('2d');
    const underlyingSceneImg = new Image();

    underlyingSceneImg.onload = () => {
      outputCanvas.width = underlyingSceneImg.width;
      outputCanvas.height = underlyingSceneImg.height;
      
      // Draw base photo background
      drawingContext.drawImage(underlyingSceneImg, 0, 0);

      // 2. Composite frame graphic directly over the scene matrix
      if (activeFrame) {
        const structuralFrameOverlay = new Image();
        structuralFrameOverlay.src = activeFrame === 'frame1' ? '/images/frame1.png' : '/images/frame2.png';
        structuralFrameOverlay.onload = () => {
          drawingContext.drawImage(structuralFrameOverlay, 0, 0, outputCanvas.width, outputCanvas.height);
          commitImageToDisk(outputCanvas);
        };
      } else {
        commitImageToDisk(outputCanvas);
      }
    };
    underlyingSceneImg.src = rawSceneBase64;
  };

  const commitImageToDisk = (targetCanvas) => {
    const finalDataStream = targetCanvas.toDataURL('image/png');
    const localDownloaderAnchor = document.createElement('a');
    localDownloaderAnchor.download = `Meet_ICY_Antarctic_Centre_${Date.now()}.png`;
    localDownloaderAnchor.href = finalDataStream;
    localDownloaderAnchor.click();
  };

  return (
    <div style={{ width: '100vw', height: '100dvh', margin: 0, padding: 0, overflow: 'hidden', backgroundColor: 'black' }}>

      {/* 1. CORE ENGINE CONTAINER */}
      <div style={{
        width: '100%', height: '100%',
        transition: 'filter 0.5s ease',
        filter: isInfoOpen || isThankYouOpen ? 'blur(10px)' : 'none'
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
          
          {/* THE MASTER AR CAMERA SYSTEM LAYER */}
          <div slot="ar-button" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 100 }}>
            
            {/* Live Visual Frame Overlay in AR Mode */}
            {activeFrame && (
              <img 
                src={activeFrame === 'frame1' ? '/images/frame1.png' : '/images/frame2.png'} 
                alt="Active Frame Border"
                style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'absolute', inset: 0, pointerEvents: 'none' }}
              />
            )}

            {/* Custom AR Interactive HUD HUD Controls */}
            <div style={{
              position: 'absolute', bottom: '40px', left: 0, right: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px',
              pointerEvents: 'auto'
            }}>
              
              {/* Frame Selection Row inside AR space */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveFrame(activeFrame === 'frame1' ? null : 'frame1'); }}
                  style={{ padding: '8px 16px', borderRadius: '15px', border: '1.5px solid white', backgroundColor: activeFrame === 'frame1' ? '#10b981' : 'rgba(43,75,170,0.85)', color: 'white', fontWeight: 'bold', fontSize: '12px' }}
                >
                  {activeFrame === 'frame1' ? 'Frame 1 Enabled' : 'Use Frame 1'}
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveFrame(activeFrame === 'frame2' ? null : 'frame2'); }}
                  style={{ padding: '8px 16px', borderRadius: '15px', border: '1.5px solid white', backgroundColor: activeFrame === 'frame2' ? '#10b981' : 'rgba(43,75,170,0.85)', color: 'white', fontWeight: 'bold', fontSize: '12px' }}
                >
                  {activeFrame === 'frame2' ? 'Frame 2 Enabled' : 'Use Frame 2'}
                </button>
              </div>

              {/* Dynamic Capture Trigger */}
              <button
                onClick={(e) => { e.stopPropagation(); captureArSnapshot(); }}
                style={{
                  width: '70px', height: '70px', backgroundColor: 'white',
                  border: '5px solid #2B4BAA', borderRadius: '50%', boxShadow: '0 0 15px rgba(0,0,0,0.4)',
                  cursor: 'pointer'
                }}
              />
              
              <p style={{ color: 'white', margin: 0, fontSize: '12px', textShadow: '1px 1px 4px rgba(0,0,0,0.8)', fontWeight: 'bold' }}>
                Snap a photo with ICY!
              </p>
            </div>
          </div>

        </model-viewer>
      </div>

      {/* 2. CUTE CUSTOM BRANDED INTRODUCTION BUTTON */}
      {!isInfoOpen && !isThankYouOpen && (
        <button
          onClick={() => setIsInfoOpen(true)}
          style={{
            position: 'absolute', bottom: '30px', right: '30px',
            padding: '15px 30px', backgroundColor: '#2B4BAA', color: 'white',
            border: '2px solid white', borderRadius: '50px', fontWeight: 'bold', fontSize: '18px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.4)', zIndex: 20, cursor: 'pointer'
          }}
        >
          Meet ICY 🐧
        </button>
      )}

      {/* 3. INFO PANEL POPUP */}
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

      {/* 4. THANK YOU SCREEN MODAL */}
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