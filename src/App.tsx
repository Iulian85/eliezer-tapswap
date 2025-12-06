
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
        // Zoomed in to Z: 14 since grid is now narrower (6 cols)
        camera={{ position: [0, 0, 14], fov: 40 }}
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
