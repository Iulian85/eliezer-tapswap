
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
    const lightRef = useRef<THREE.PointLight>(null);

    useFrame((state, delta) => {
        if (bombExplosionPosition && meshRef.current) {
            scaleRef.current += delta * 25; 
            const scale = scaleRef.current;
            meshRef.current.scale.set(scale, scale, scale);
            
            const material = meshRef.current.material as THREE.MeshBasicMaterial;
            material.opacity = Math.max(0, 1 - scale / 6);

            // Flash light
            if (lightRef.current) {
                lightRef.current.intensity = Math.max(0, 20 - scale * 3);
            }

        } else {
            scaleRef.current = 0;
        }
    });

    if (!bombExplosionPosition) return null;

    const [x, y] = getPos(bombExplosionPosition.x, bombExplosionPosition.y);

    return (
        <group position={[x, y, 0.5]}>
             <pointLight ref={lightRef} distance={10} intensity={20} color="#ffaa00" decay={1} />
             <Torus ref={meshRef} args={[0.8, 0.15, 16, 32]} rotation={[Math.PI/2, 0, 0]}>
                <meshBasicMaterial color="#FF4500" transparent opacity={1} toneMapped={false} />
             </Torus>
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
      
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#d946ef" />

      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
      <Sparkles count={50} scale={10} size={2} speed={0.4} opacity={0.2} color="#FFD700" />

      {/* Y=0.1 centers the grid vertically between the Level Bar and Bottom Menu */}
      <group position={[0, 0.9, 0]}>
        {grid.map((tile) => (
          <Token3D
            key={tile.id}
            data={tile}
            selected={selectedId === tile.id}
            onClick={() => selectTile(tile.id)}
          />
        ))}
        
        {/* Helper sparkles for matches inside the grid group to maintain relative position */}
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

        <ExplosionEffect />
      </group>

      <Suspense fallback={null}>
        <EffectComposer enableNormalPass={false}>
          <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} radius={0.5} />
        </EffectComposer>
      </Suspense>
    </>
  );
}
