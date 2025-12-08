
import { Suspense, useMemo } from 'react';
import { Text3D, Center, Float, RoundedBox, Sphere, Environment, Backdrop, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, TiltShift2 } from '@react-three/postprocessing';
import { useGameStore } from '../../store/useGameStore';
import Token3D from './Token3D';
import { getPos } from '../../utils/grid';
import * as THREE from 'three';

const FONT_URL = 'https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json';

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
        <group position={[0, 2.5, 0]}>
            {/* ELIEZER - Clean White Matte */}
            <Center top>
                <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
                    <Text3D
                        font={FONT_URL}
                        size={1.4}
                        height={0.4}
                        curveSegments={32}
                        bevelEnabled
                        bevelThickness={0.05}
                        bevelSize={0.04}
                        bevelOffset={0}
                        bevelSegments={8}
                        position={[0, 1.2, 0]}
                    >
                        ELIEZER
                        <meshPhysicalMaterial 
                            color="#FFFFFF"
                            roughness={0.3} 
                            metalness={0.1}
                            clearcoat={0.2}
                        />
                    </Text3D>
                </Float>
            </Center>
            
            {/* RUSH - Factory Peach Accent */}
            <Center top position={[0, -1.5, 0]}>
                <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.5} floatingRange={[-0.1, 0.1]}>
                     <Text3D
                        font={FONT_URL}
                        size={1.4}
                        height={0.4}
                        curveSegments={32}
                        bevelEnabled
                        bevelThickness={0.05}
                        bevelSize={0.04}
                        bevelOffset={0}
                        bevelSegments={8}
                    >
                        RUSH
                        <meshPhysicalMaterial 
                            color="#FF8A65" 
                            roughness={0.3}
                            metalness={0.1}
                            clearcoat={0.3}
                        />
                    </Text3D>
                </Float>
            </Center>

            {/* Decorative Floating Primitives (Reference: Cylinders, Spheres, Blocks) */}
            
            {/* The Cream Sphere */}
            <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1} position={[3.5, 3, -2]}>
                <Sphere args={[1.2, 64, 64]}>
                     <meshPhysicalMaterial 
                        color="#FFF9C4" 
                        roughness={0.2} 
                        metalness={0} 
                        clearcoat={0.5}
                    />
                </Sphere>
            </Float>

            {/* The Lavender Cylinder */}
            <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5} position={[-3.5, -2, -1]}>
                <mesh rotation={[0.4, 0.2, 0.5]}>
                    <cylinderGeometry args={[0.8, 0.8, 1.5, 64]} />
                    <meshPhysicalMaterial color="#B39DDB" roughness={0.3} metalness={0.1} />
                </mesh>
            </Float>
            
            {/* The Peach Block (Conveyor Belt Element) */}
            <Float speed={1.2} rotationIntensity={1} floatIntensity={1.5} position={[4, -4, 0]}>
                <RoundedBox args={[1.2, 1.2, 1.2]} radius={0.1} smoothness={8}>
                    <meshPhysicalMaterial color="#FF8A65" roughness={0.4} metalness={0.1} />
                </RoundedBox>
            </Float>

            {/* Small Blue Cube */}
             <Float speed={3} rotationIntensity={2} floatIntensity={1} position={[-4, 2, -3]}>
                <RoundedBox args={[0.8, 0.8, 0.8]} radius={0.1} smoothness={8}>
                    <meshPhysicalMaterial color="#4FC3F7" roughness={0.4} />
                </RoundedBox>
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
      {/* 
         Studio Lighting Setup 
         Soft, wrap-around lighting to mimic the "Polygon Runway" render style.
      */}
      <ambientLight intensity={0.7} color="#E3F2FD" />
      <directionalLight 
        position={[-5, 10, 5]} 
        intensity={1.2} 
        color="#FFF" 
        castShadow 
        shadow-bias={-0.0001}
      />
      <directionalLight position={[10, 5, 2]} intensity={0.8} color="#FFCCBC" /> {/* Warm rim light */}
      <spotLight position={[0, 10, 0]} intensity={0.5} penumbra={1} color="#E1F5FE" />

      {/* Infinite Studio Backdrop */}
      <Backdrop
        receiveShadow
        floorPlane={[0, -1, 0]}
        scale={[60, 20, 10]}
        position={[0, -4, -6]}
      >
        <meshPhysicalMaterial 
            color="#4FC3F7" // Factory Blue Main
            roughness={0.5}
            metalness={0.1}
            side={THREE.DoubleSide}
        />
      </Backdrop>
      
      {/* Environment for nice reflections on the "plastic" materials */}
      <Environment preset="city" blur={1} background={false} />

      {gameState === 'MENU' && (
          <Suspense fallback={null}>
              <MenuScene />
          </Suspense>
      )}

      <group position={[0, -0.5, 0]}>
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

      {/* Post Processing for the "Miniature/Toy" Look */}
      <Suspense fallback={null}>
        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.9} mipmapBlur intensity={0.3} radius={0.4} />
          <TiltShift2 blur={0.08} /> 
          <Vignette eskil={false} offset={0.1} darkness={0.3} />
        </EffectComposer>
      </Suspense>
    </>
  );
}
