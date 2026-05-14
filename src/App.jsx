import React, { useState } from 'react';
/* ... existing imports ... */

const PenguinAR = () => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-gray-100">
      
      {/* 1. THE BACKGROUND (AR MODEL) */}
      <div className={`w-full h-full transition-all duration-500 ${isInfoOpen ? 'blur-md scale-110' : 'blur-0'}`}>
        <model-viewer
          src="/models/penguin.glb"
          ios-src="https://antarctic-pwa.vercel.app/models/penguin1.usdz"
          ar
          ar-modes="quick-look webxr scene-viewer"
          camera-controls
          scale="10 10 10"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* 2. THE INFO BUTTON (Only shows when info is closed) */}
      {!isInfoOpen && (
        <button 
          onClick={() => setIsInfoOpen(true)}
          className="absolute bottom-10 right-10 bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 transition-transform active:scale-95"
        >
          Info
        </button>
      )}

      {/* 3. THE INFORMATION OVERLAY (The next "screen") */}
      {isInfoOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/30 backdrop-blur-sm">
          <div className="bg-white/90 rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-300">
            
            {/* Close Button */}
            <button 
              onClick={() => setIsInfoOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-blue-900 mb-4">Emperor Penguins</h2>
            
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>📍 <strong>The Giant of Ice:</strong> Emperors are the tallest and heaviest of all living penguin species, reaching up to 1.3 meters!</p>
              <p>❄️ <strong>Extreme Survival:</strong> They are the only animals to breed during the harsh Antarctic winter, huddling together to stay warm in -60°C winds.</p>
              <hr className="border-blue-100" />
              <p className="font-semibold text-blue-800">How to save them:</p>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li><strong>Protect Sea Ice:</strong> Climate change melts the ice they need for breeding. Reducing carbon footprints helps keep the ice solid.</li>
                <li><strong>Sustainable Fishing:</strong> Overfishing of krill and silverfish starves penguin colonies. Look for MSC-certified seafood!</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default App;