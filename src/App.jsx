import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const PenguinAR = () => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isThankYouOpen, setIsThankYouOpen] = useState(false);

  // Automatically closes the Thank You screen after 5 seconds
  useEffect(() => {
    if (isThankYouOpen) {
      const timer = setTimeout(() => {
        setIsThankYouOpen(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isThankYouOpen]);

  return (
    <div style={{ width: '100vw', height: '100dvh', margin: 0, padding: 0, overflow: 'hidden', backgroundColor: 'black' }}>

      {/* 1. THE AR VIEWER CONTAINER */}
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
          /* FIXED FOR ANDROID: Forces the penguin to sit securely on the actual floor */
          ar-placement="floor"
          ar-scale="fixed"
          style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
        >
          <button
            slot="ar-button"
            style={{
              position: 'absolute',
              bottom: '100px',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '12px 24px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '30px',
              fontWeight: 'bold',
              zIndex: 10
            }}
          >
            👋 View in AR
          </button>
        </model-viewer>
      </div>

      {/* 2. MAIN HUB INFO BUTTON */}
      {!isInfoOpen && !isThankYouOpen && (
        <button
          onClick={() => setIsInfoOpen(true)}
          style={{
            position: 'absolute',
            bottom: '30px',
            right: '30px',
            padding: '15px 30px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            fontWeight: 'bold',
            fontSize: '18px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            zIndex: 20
          }}
        >
          Info
        </button>
      )}

      {/* 3. NEW GRAPHIC INFO SCREEN OVERLAY */}
      {isInfoOpen && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{ position: 'relative' }}>

            {/* Custom Styled Close Button */}
            <button
              onClick={() => setIsInfoOpen(false)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                border: '1.5px solid white',
                backgroundColor: '#2B4BAA',
                color: 'white',
                fontSize: '18px',
                fontWeight: '300',
                cursor: 'pointer',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0
              }}
            >
              ✕
            </button>

            {/* Rendered Card Asset */}
            <img
              src="/images/info.png"
              alt="Penguin Facts"
              style={{
                width: '340px',
                borderRadius: '24px',
                display: 'block'
              }}
            />

            {/* Interactive Try Button Image */}
            <img
              src="/images/try.png"
              alt="Try Action Button"
              onClick={() => {
                setIsInfoOpen(false);
                setIsThankYouOpen(true);
              }}
              style={{
                position: 'absolute',
                bottom: '45px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '120px',
                cursor: 'pointer'
              }}
            />

          </div>
        </div>
      )}

      {/* 4. THANK YOU POPUP MODAL */}
      {isThankYouOpen && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.65)'
        }}>
          <img
            src="/images/thankyou.png"
            alt="Thank You Message"
            style={{
              width: '320px',
              display: 'block'
            }}
          />
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