import { Suspense } from 'react';
import { Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useGameStore } from '../../store/useGameStore';
import Token3D from './Token3D';

export default function GameScene() {
  const grid = useGameStore(s => s.grid);
  const selectedId = useGameStore(s => s.selectedId);
  const selectTile = useGameStore(s => s.selectTile);

  return (
    <>
      <color attach="background" args={['#1a0033']} />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#d946ef" />

      {/* Environment */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
      <Sparkles count={50} scale={10} size={2} speed={0.4} opacity={0.2} color="#FFD700" />

      {/* Board */}
      <group position={[0, -0.5, 0]}>
        {grid.map((tile) => (
          <Token3D
            key={tile.id}
            data={tile}
            selected={selectedId === tile.id}
            onClick={() => selectTile(tile.id)}
          />
        ))}
      </group>

      {/* Post Processing */}
      <Suspense fallback={null}>
        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} radius={0.4} />
        </EffectComposer>
      </Suspense>
    </>
  );
}