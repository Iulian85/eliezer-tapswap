
import { Suspense, useRef, useMemo } from 'react';
import { Stars, Sparkles, Torus, Text3D, Center, Float, RoundedBox, Sphere } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';
import Token3D from './Token3D';
import { getPos } from '../../utils/grid';
import * as THREE from 'three';

// Font URL for 3D Text
const FONT_URL = 'https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json';

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
             <pointLight ref={lightRef} distance={10} intensity={20} color="#FFCC80" decay={1} />
             <Torus ref={meshRef} args={[0.8, 0.15, 16, 32]} rotation={[Math.PI/2, 0, 0]}>
                <meshBasicMaterial color="#FFAB91" transparent opacity={1} toneMapped={false} />
             </Torus>
             <Sparkles count={80} scale={6} size={12} speed={4} color="#FFE0B2" />
        </group>
    );
};

// 3D Menu Decoration Component
const MenuScene = () => {
    return (
        <group position={[0, 2.5, 0]}>
            {/* Title Text */}
            <Center top>
                <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                    <Text3D
                        font={FONT_URL}
                        size={1.5}
                        height={0.4}
                        curveSegments={12}
                        bevelEnabled
                        bevelThickness={0.1}
                        bevelSize={0.04}
                        bevelOffset={0}
                        bevelSegments={5}
                        position={[0, 1, 0]}
                    >
                        ELIEZER
                        <meshStandardMaterial 
                            color="white" 
                            roughness={0.4} 
                            metalness={0.1} 
                        />
                    </Text3D>
                </Float>
            </Center>
            
            <Center top position={[0, -1.8, 0]}>
                <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.5} floatingRange={[-0.1, 0.1]}>
                     <Text3D
                        font={FONT_URL}
                        size={1.5}
                        height={0.4}
                        curveSegments={12}
                        bevelEnabled
                        bevelThickness={0.1}
                        bevelSize={0.04}
                        bevelOffset={0}
                        bevelSegments={5}
                    >
                        RUSH
                        <meshStandardMaterial 
                            color="white" 
                            roughness={0.4} 
                            metalness={0.1} 
                        />
                        {/* Extrusion sides in Peach */}
                         <meshStandardMaterial 
                            attach="material-1"
                            color="#FFAB91" 
                            roughness={0.4}
                        />
                    </Text3D>
                </Float>
            </Center>

            {/* Floating Decorative Shapes (Polygon Runway Style) */}
            <Float speed={1} rotationIntensity={1} floatIntensity={1} position={[-4, 2, -2]}>
                <RoundedBox args={[1.5, 1.5, 1.5]} radius={0.2} smoothness={4}>
                    <meshStandardMaterial color="#FFAB91" roughness={0.3} metalness={0.2} />
                </RoundedBox>
            </Float>
            <Float speed={1.5} rotationIntensity={1} floatIntensity={1.5} position={[4, -3, -3]}>
                <Sphere args={[1, 32, 32]}>
                     <meshStandardMaterial color="#90CAF9" roughness={0.2} metalness={0.1} />
                </Sphere>
            </Float>
             <Float speed={0.8} rotationIntensity={0.5} floatIntensity={0.5} position={[-3, -5, -1]}>
                <RoundedBox args={[1, 1, 1]} radius={0.1} smoothness={4} rotation={[0.5, 0.5, 0]}>
                     <meshStandardMaterial color="white" roughness={0.1} metalness={0.1} />
                </RoundedBox>
            </Float>
            <Float speed={1.2} rotationIntensity={2} floatIntensity={1} position={[4, 4, -4]}>
                <Torus args={[1, 0.4, 16, 32]}>
                    <meshStandardMaterial color="#FFCC80" roughness={0.3} />
                </Torus>
            </Float>

        </group>
    );
};

export default function GameScene() {
  const grid = useGameStore(s => s.grid);
  const selectedId = useGameStore(s => s.selectedId);
  const selectTile = useGameStore(s => s.selectTile);
  const lastMatchedPositions = useGameStore(s => s.lastMatchedPositions);
  const gameState = useGameStore(s => s.gameState);

  return (
    <>
      {/* Soft Blue Gradient Background via Color */}
      <color attach="background" args={['#90CAF9']} />
      
      {/* Soft Lighting Setup */}
      <ambientLight intensity={0.8} color="#ffffff" />
      <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow color="#FFF3E0" />
      <directionalLight position={[-10, 5, 10]} intensity={0.5} color="#E3F2FD" />
      <pointLight position={[0, -10, 5]} intensity={0.5} color="#FFAB91" />

      {/* Subtle Environment reflections */}
      <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade opacity={0.3} />
      <Sparkles count={50} scale={10} size={2} speed={0.4} opacity={0.4} color="#FFF" />

      {gameState === 'MENU' && (
          <Suspense fallback={null}>
              <MenuScene />
          </Suspense>
      )}

      {/* Y=0.1 centers the grid vertically between the Level Bar and Bottom Menu */}
      <group position={[0, 0.1, 0]}>
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
            color="#FFAB91"
            />
        ))}

        <ExplosionEffect />
      </group>

      <Suspense fallback={null}>
        <EffectComposer enableNormalPass={false}>
          <Bloom luminanceThreshold={0.9} mipmapBlur intensity={0.4} radius={0.4} />
          <Vignette eskil={false} offset={0.1} darkness={0.3} />
        </EffectComposer>
      </Suspense>
    </>
  );
}
