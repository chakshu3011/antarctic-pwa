import { BrowserRouter, Routes, Route } from 'react-router-dom';

// These are placeholders for your screens
const PenguinAR = () => (
  <div style={{ width: '100%', height: '100dvh', background: '#f0f0f0' }}>
    <model-viewer
  src="/models/penguin1.glb"
  ios-src="https://antarctic-pwa.vercel.app/models/penguin1.usdz"
  ar
  ar-modes="quick-look webxr scene-viewer"
  camera-controls
  interaction-prompt="auto"
  style={{ width: '100%', height: '100%' }}
>
  <button slot="ar-button" style={{
    backgroundColor: 'white', borderRadius: '8px', border: 'none', 
    position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
    padding: '10px 20px', boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
  }}>
    👋 Activate AR
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
