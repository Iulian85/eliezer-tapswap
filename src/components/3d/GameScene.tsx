
import { Suspense, useRef } from 'react';
import { Stars, Sparkles, Torus } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';
import Token3D from './Token3D';
import { getPos } from '../../utils/grid';
import * as THREE from 'three';

const ExplosionEffect = () => {
    const bombExplosionPosition = useGameStore(s => s.bombExplosionPosition);
    const meshRef = useRef<THREE.Mesh>(null);
    const scaleRef = useRef(0);

    useFrame((state, delta) => {
        if (bombExplosionPosition && meshRef.current) {
            scaleRef.current += delta * 25; // Fast expansion speed
            const scale = scaleRef.current;
            meshRef.current.scale.set(scale, scale, scale);
            
            // Fade out based on scale
            const material = meshRef.current.material as THREE.MeshBasicMaterial;
            material.opacity = Math.max(0, 1 - scale / 6);
        } else {
            scaleRef.current = 0;
        }
    });

    if (!bombExplosionPosition) return null;

    const [x, y] = getPos(bombExplosionPosition.x, bombExplosionPosition.y);

    return (
        <group position={[x, y, 0.5]}>
             {/* Dynamic Flash Light */}
             <pointLight distance={10} intensity={20} color="#ffaa00" decay={1} />
             
             {/* Expanding Shockwave Ring */}
             <Torus ref={meshRef} args={[0.8, 0.15, 16, 32]} rotation={[Math.PI/2, 0, 0]}>
                <meshBasicMaterial color="#FF4500" transparent opacity={1} toneMapped={false} />
             </Torus>
             
             {/* Explosion Particles */}
             <Sparkles count={80} scale={6} size={12} speed={4} color="#FFD700" />
        </group>
    );
};

export default function GameScene() {
  const grid = useGameStore(s => s.grid);
  const selectedId = useGameStore(s => s.selectedId);
  const selectTile = useGameStore(s => s.selectTile);
  const lastMatchedPositions = useGameStore(s => s.lastMatchedPositions);

  return (
    <>
      <color attach="background" args={['#1a0033']} />
      
      {/* Scene Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#d946ef" />

      {/* Environment Background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
      <Sparkles count={50} scale={10} size={2} speed={0.4} opacity={0.2} color="#FFD700" />

      {/* Game Board */}
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

      {/* Match Particle Effects */}
      {lastMatchedPositions.map((pos, i) => (
        <Sparkles
          key={`sparkle-${i}`}
          position={[...getPos(pos.x, pos.y).slice(0, 2) as [number, number], 0.2]}
          count={30}
          scale={1.5}
          size={6}
          speed={1.5}
          color="#F59E0B"
        />
      ))}

      {/* Bomb Booster Explosion Visuals */}
      <ExplosionEffect />

      {/* Post Processing Effects */}
      <Suspense fallback={null}>
        <EffectComposer enableNormalPass={false}>
          <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} radius={0.5} />
        </EffectComposer>
      </Suspense>
    </>
  );
}
