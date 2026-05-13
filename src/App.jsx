import { BrowserRouter, Routes, Route } from 'react-router-dom';

// These are placeholders for your screens
const PenguinAR = () => (
  <div style={{ width: '100%', height: '100dvh', background: '#f0f0f0' }}>
    <model-viewer
      src="/models/penguin.glb"
      ios-src="https://antarctic-pwa.vercel.app/models/penguin.usdz"
      alt="A 3D Emperor Penguin"
      ar
      // ar-modes="webxr scene-viewer quick-look"
      ar-modes= "quick-look webxr scene-viewer"
      camera-controls
      auto-rotate
      shadow-intensity="1"
      style={{ width: '100%', height: '100%' }}
    >
      {/* This is the Info button mentioned in your wireframes */}
      <button 
        className="absolute bottom-8 right-8 bg-blue-500 text-white p-4 rounded-full shadow-lg"
        onClick={() => alert("Penguin Info coming soon!")}
      >
        Info
      </button>
    </model-viewer>
  </div>
);

const EnvironmentAR = () => <div>Scan worked! This is the AR Environment page.</div>;
const IceGame = () => <div>Scan worked! This is the Ice Puzzle Game.</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/penguin" element={<PenguinAR />} />
        <Route path="/environment" element={<EnvironmentAR />} />
        <Route path="/game" element={<IceGame />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
