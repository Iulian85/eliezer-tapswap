
import React, { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import GameScene from './components/3d/GameScene';
import HUD from './components/ui/HUD';
import Menu from './components/ui/Menu';
import GameOverModal from './components/ui/GameOverModal';
import BoosterPanel from './components/ui/BoosterPanel';
import { initTelegram } from './utils/telegram';

function App() {
  useEffect(() => {
    initTelegram();
  }, []);

  return (
    <div className="relative w-full h-screen bg-eliezer-bg overflow-hidden">
      <Canvas 
        shadows 
        // Moved camera back to Z: 22 to fit 9 rows vertically on mobile portrait
        camera={{ position: [0, 0, 22], fov: 38 }}
        dpr={[1, 2]} 
        className="touch-none"
      >
        <GameScene />
      </Canvas>
      
      {/* UI Overlay */}
      <HUD />
      <BoosterPanel />
      <Menu />
      <GameOverModal />
    </div>
  );
}

export default App;
