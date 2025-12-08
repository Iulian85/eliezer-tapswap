
import { Suspense, useRef, useMemo } from 'react';
import { Stars, Sparkles, Text3D, Center, Float, RoundedBox, Sphere, Environment, Backdrop, AccumulativeShadows, RandomizedLight } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, TiltShift2 } from '@react-three/postprocessing';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';
import Token3D from './Token3D';
import { getPos } from '../../utils/grid';
import * as THREE from 'three';

const FONT_URL = 'https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json';

// Reuse material settings for consistency (Matte Plastic)
const matteMaterial = new THREE.MeshPhysicalMaterial({
    roughness: 0.5,
    metalness: 0.1,
    clearcoat: 0.1,
    clearcoatRoughness: 0.4,
});

const ExplosionEffect = () => {
    const bombExplosionPosition = useGameStore(s => s.bombExplosionPosition);
    if (!bombExplosionPosition) return null;

    const [x, y] = getPos(bombExplosionPosition.x, bombExplosionPosition.y);

    return (
        <group position={[x, y, 1]}>
             <pointLight distance={8} intensity={10} color="#FF8A65" decay={1} />
             <Sparkles count={50} scale={4} size={8} speed={2} color="#FF8A65" />
        </group>
    );
};

const MenuScene = () => {
    return (
        <group position={[0, 2.8, 0]}>
            <Center top>
                <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                    <Text3D
                        font={FONT_URL}
                        size={1.4}
                        height={0.4}
                        curveSegments={20}
                        bevelEnabled
                        bevelThickness={0.05}
                        bevelSize={0.04}
                        bevelOffset={0}
                        bevelSegments={5}
                        position={[0, 1, 0]}
                    >
                        ELIEZER
                        <meshPhysicalMaterial 
                            color="#FFFFFF" // Clean White
                            roughness={0.2} 
                            metalness={0.1}
                            clearcoat={0.5} 
                        />
                    </Text3D>
                </Float>
            </Center>
            
            <Center top position={[0, -1.8, 0]}>
                <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.5} floatingRange={[-0.1, 0.1]}>
                     <Text3D
                        font={FONT_URL}
                        size={1.4}
                        height={0.4}
                        curveSegments={20}
                        bevelEnabled
                        bevelThickness={0.05}
                        bevelSize={0.04}
                        bevelOffset={0}
                        bevelSegments={5}
                    >
                        RUSH
                        <meshPhysicalMaterial 
                            color="#FFFFFF"
                            roughness={0.2} 
                        />
                        {/* The iconic Orange accent from the reference */}
                         <meshPhysicalMaterial 
                            attach="material-1"
                            color="#FF8A65" 
                            roughness={0.4}
                        />
                    </Text3D>
                </Float>
            </Center>

            {/* Decorative "Factory" Elements */}
            {/* The Cream Sphere Light */}
            <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1} position={[3.5, 3, -2]}>
                <Sphere args={[1.2, 32, 32]}>
                     <meshPhysicalMaterial 
                        color="#FFF9C4" 
                        emissive="#FFF9C4"
                        emissiveIntensity={0.5}
                        roughness={0.2} 
                        metalness={0} 
                    />
                </Sphere>
            </Float>

            {/* The Lavender Cylinder */}
            <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5} position={[-3.5, -2, -1]}>
                <CylinderShape />
            </Float>
            
            {/* The Orange Block */}
            <Float speed={1.2} rotationIntensity={1} floatIntensity={1.5} position={[4, -4, 0]}>
                <RoundedBox args={[1.2, 1.2, 1.2]} radius={0.1} smoothness={4}>
                    <meshPhysicalMaterial color="#FF8A65" roughness={0.3} metalness={0.1} />
                </RoundedBox>
            </Float>
        </group>
    );
};

const CylinderShape = () => (
    <mesh rotation={[0.4, 0.2, 0.5]}>
        <cylinderGeometry args={[0.8, 0.8, 1.5, 32]} />
        <meshPhysicalMaterial color="#B39DDB" roughness={0.3} metalness={0.2} />
    </mesh>
);

export default function GameScene() {
  const grid = useGameStore(s => s.grid);
  const selectedId = useGameStore(s => s.selectedId);
  const selectTile = useGameStore(s => s.selectTile);
  const lastMatchedPositions = useGameStore(s => s.lastMatchedPositions);
  const gameState = useGameStore(s => s.gameState);

  return (
    <>
      {/* 
         Studio Lighting Setup 
         Mimicking the soft "Polygon Runway" render style.
         Main soft warm light from left, cool fill from right.
      */}
      <ambientLight intensity={0.6} color="#E3F2FD" />
      <directionalLight position={[-10, 10, 5]} intensity={1.5} color="#FFF3E0" castShadow />
      <directionalLight position={[10, 5, 5]} intensity={0.8} color="#E1F5FE" />
      
      {/* The Reference Background: A curved studio backdrop */}
      <Backdrop
        receiveShadow
        floorPlane={[0, -1, 0]} // Floor normal
        scale={[50, 20, 10]}
        position={[0, -2, -5]}
      >
        <meshPhysicalMaterial 
            color="#4FC3F7" // Factory Blue Main
            roughness={0.6}
            metalness={0.1}
            side={THREE.DoubleSide}
        />
      </Backdrop>
      
      {/* Subtle Environment for reflections */}
      <Environment preset="city" blur={1} />

      {gameState === 'MENU' && (
          <Suspense fallback={null}>
              <MenuScene />
          </Suspense>
      )}

      <group position={[0, 0, 0]}>
        {grid.map((tile) => (
          <Token3D
            key={tile.id}
            data={tile}
            selected={selectedId === tile.id}
            onClick={() => selectTile(tile.id)}
          />
        ))}
        
        {lastMatchedPositions.map((pos, i) => (
            <Sparkles
            key={`sparkle-${i}`}
            position={[...getPos(pos.x, pos.y).slice(0, 2) as [number, number], 0.5]}
            count={20}
            scale={2}
            size={5}
            speed={2}
            color="#FFF"
            />
        ))}
        <ExplosionEffect />
      </group>

      {/* Post Processing for that "Rendered" look */}
      <Suspense fallback={null}>
        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.95} mipmapBlur intensity={0.5} radius={0.5} />
          {/* TiltShift makes it look like a miniature toy set */}
          <TiltShift2 blur={0.1} /> 
          <Vignette eskil={false} offset={0.1} darkness={0.4} />
        </EffectComposer>
      </Suspense>
    </>
  );
}
