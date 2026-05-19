import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const PenguinAR = () => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isThankYouOpen, setIsThankYouOpen] = useState(false);
  
  // NEW STATES FOR PHOTO FEATURE
  const [isFrameUiOpen, setIsFrameUiOpen] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState(null); // null, 'frame1', or 'frame2'

  useEffect(() => {
    if (isThankYouOpen) {
      const timer = setTimeout(() => {
        setIsThankYouOpen(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isThankYouOpen]);

  // CORE CAPTURE FUNCTION FOR ANDROID
  const takePhotoWithFrame = async () => {
    const viewer = document.querySelector('model-viewer');
    if (!viewer) return;

    // 1. Capture the raw AR background and 3D model canvas
    const base64Image = viewer.toDataURL({ format: 'png' });

    // 2. Setup an HTML Canvas to merge the photo and the frame
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const mainImg = new Image();

    mainImg.onload = () => {
      canvas.width = mainImg.width;
      canvas.height = mainImg.height;
      
      // Draw the AR scene
      ctx.drawImage(mainImg, 0, 0);

      // 3. Overlay the chosen frame PNG if one is selected
      if (selectedFrame) {
        const frameImg = new Image();
        frameImg.src = selectedFrame === 'frame1' ? '/images/frame1.png' : '/images/frame2.png';
        frameImg.onload = () => {
          ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
          saveFinalImage(canvas);
        };
      } else {
        saveFinalImage(canvas);
      }
    };
    mainImg.src = base64Image;
  };

  // Helper to trigger mobile browser download file prompt
  const saveFinalImage = (canvas) => {
    const finalUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.download = `antarctic_centre_photo_${Date.now()}.png`;
    downloadLink.href = finalUrl;
    downloadLink.click();
  };

  // Hide main control buttons when any overlay screen is open
  const areControlsHidden = isInfoOpen || isThankYouOpen || isFrameUiOpen;

  return (
    <div style={{ width: '100vw', height: '100dvh', margin: 0, padding: 0, overflow: 'hidden', backgroundColor: 'black' }}>

      {/* 1. AR VIEWER CONTROLLER */}
      <div style={{
        width: '100%',
        height: '100%',
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
          <button
            slot="ar-button"
            style={{
              position: 'absolute', bottom: '100px', left: '50%', transform: 'translateX(-50%)',
              padding: '12px 24px', backgroundColor: '#2563eb', color: 'white',
              border: 'none', borderRadius: '30px', fontWeight: 'bold', zIndex: 10
            }}
          >
            👋 View in AR
          </button>
        </model-viewer>
      </div>

      {/* 2. FLOATING PASSIVE ACTION BUTTONS */}
      {!areControlsHidden && (
        <>
          {/* Main Info Button */}
          <button
            onClick={() => setIsInfoOpen(true)}
            style={{
              position: 'absolute', bottom: '30px', right: '30px',
              padding: '15px 30px', backgroundColor: '#2563eb', color: 'white',
              border: 'none', borderRadius: '50px', fontWeight: 'bold', fontSize: '18px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)', zIndex: 20
            }}
          >
            Info
          </button>

          {/* New Camera / Frame Screen Button */}
          <button
            onClick={() => setIsFrameUiOpen(true)}
            style={{
              position: 'absolute', bottom: '30px', left: '30px',
              width: '60px', height: '60px', backgroundColor: '#10b981', color: 'white',
              border: 'none', borderRadius: '50%', fontSize: '24px', cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)', zIndex: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            📷
          </button>
        </>
      )}

      {/* 3. TRANSPARENT FRAME LIVE VIEW OVERLAY */}
      {isFrameUiOpen && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 40, pointerEvents: 'none' }}>
          
          {/* Active Frame Layer (Only captures if selected) */}
          {selectedFrame && (
            <img 
              src={selectedFrame === 'frame1' ? '/images/frame1.png' : '/images/frame2.png'} 
              alt="Active Overlay Frame"
              style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'absolute', inset: 0 }}
            />
          )}

          {/* Interactive Frame UI Sub-Panel Controllers */}
          <div style={{
            position: 'absolute', bottom: '40px', left: 0, right: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
            pointerEvents: 'auto' // Re-enables clicking for this sub-section
          }}>
            
            {/* Frame Selector Toggles */}
            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                onClick={() => setSelectedFrame(selectedFrame === 'frame1' ? null : 'frame1')}
                style={{
                  padding: '10px 20px', borderRadius: '20px', border: '2px solid white',
                  backgroundColor: selectedFrame === 'frame1' ? '#10b981' : 'rgba(0,0,0,0.6)',
                  color: 'white', fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                {selectedFrame === 'frame1' ? 'Frame 1 Active' : 'Select Frame 1'}
              </button>
              
              <button 
                onClick={() => setSelectedFrame(selectedFrame === 'frame2' ? null : 'frame2')}
                style={{
                  padding: '10px 20px', borderRadius: '20px', border: '2px solid white',
                  backgroundColor: selectedFrame === 'frame2' ? '#10b981' : 'rgba(0,0,0,0.6)',
                  color: 'white', fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                {selectedFrame === 'frame2' ? 'Frame 2 Active' : 'Select Frame 2'}
              </button>
            </div>

            {/* Shutter Shapshot Button & Exit Control Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
              
              {/* Close Frame Mode */}
              <button 
                onClick={() => { setIsFrameUiOpen(false); setSelectedFrame(null); }}
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Exit
              </button>

              {/* Central Shutter Action Button */}
              <button 
                onClick={takePhotoWithFrame}
                style={{
                  width: '75px', height: '75px', backgroundColor: 'white',
                  border: '5px solid #10b981', borderRadius: '50%', cursor: 'pointer',
                  boxShadow: '0 0 15px rgba(0,0,0,0.5)'
                }}
              />
              
              {/* Invisible spacer to keep shutter centered balanced */}
              <div style={{ width: '60px' }} />
            </div>

          </div>
        </div>
      )}

      {/* 4. GRAPHIC INFO OVERLAY */}
      {isInfoOpen && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsInfoOpen(false)}
              style={{ position: 'absolute', top: '12px', right: '12px', width: '30px', height: '30px', borderRadius: '50%', border: '1.5px solid white', backgroundColor: '#2B4BAA', color: 'white', fontSize: '18px', fontWeight: '300', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
            >✕</button>
            <img src="/images/info.png" alt="Penguin Facts" style={{ width: '340px', borderRadius: '24px', display: 'block' }} />
            <img src="/images/try.png" alt="Try Action Button" onClick={() => { setIsInfoOpen(false); setIsThankYouOpen(true); }} style={{ position: 'absolute', bottom: '45px', left: '50%', transform: 'translateX(-50%)', width: '120px', cursor: 'pointer' }} />
          </div>
        </div>
      )}

      {/* 5. THANK YOU POPUP MODAL */}
      {isThankYouOpen && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.65)' }}>
          <img src="/images/thankyou.png" alt="Thank You Message" style={{ width: '320px', display: 'block' }} />
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