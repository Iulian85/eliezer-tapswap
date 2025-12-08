
import { Suspense, useMemo } from 'react';
import { Text3D, Center, Float, Environment, Sparkles, Sphere, Torus, Icosahedron } from '@react-three/drei';
import { EffectComposer, Bloom, TiltShift2 } from '@react-three/postprocessing';
import { useGameStore } from '../../store/useGameStore';
import Token3D from './Token3D';
import { getPos } from '../../utils/grid';
import * as THREE from 'three';

const FONT_URL = 'https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json';

// --- COMPONENTS FOR BACKGROUND ---

const FloatingShape = ({ position, color, geometry: Geometry, scale = 1, speed = 1, rotationIntensity = 1 }: any) => (
  <Float speed={speed} rotationIntensity={rotationIntensity} floatIntensity={0.5}>
    <Geometry args={[scale]} position={position}>
       <meshPhysicalMaterial 
          color={color}
          roughness={0.2}
          metalness={0.1}
          clearcoat={0.5}
          clearcoatRoughness={0.1}
       />
    </Geometry>
  </Float>
);

const GlassShape = ({ position, scale = 1 }: any) => (
  <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.8}>
    <Sphere args={[scale, 32, 32]} position={position}>
      <meshPhysicalMaterial 
        color="#ffffff"
        transmission={0.9} // Glass
        opacity={1}
        metalness={0}
        roughness={0}
        ior={1.5}
        thickness={2}
      />
    </Sphere>
  </Float>
);

const BackgroundDecor = () => {
    return (
        <group position={[0, 0, -2]}> 
            {/* Soft Peach Sphere (Candy) */}
            <FloatingShape 
                geometry={Sphere} 
                scale={0.8} 
                position={[-2.5, 3, -2]} 
                color="#FF9F68" 
                speed={2} 
            />
            
            {/* Blue Matte Torus */}
            <Float speed={1.5} rotationIntensity={2}>
                <Torus args={[0.6, 0.25, 16, 32]} position={[2.5, 2, -1]}>
                    <meshPhysicalMaterial color="#A5C9FF" roughness={0.4} />
                </Torus>
            </Float>

            {/* Glass Sphere (Blurry bubble) */}
            <GlassShape scale={0.9} position={[0, -2, -1]} />

            {/* Cream Icosahedron (Abstract candy) */}
            <FloatingShape 
                geometry={Icosahedron} 
                scale={0.7} 
                position={[2, -3, -1]} 
                color="#FFF59D" 
                rotationIntensity={3}
            />

             {/* Small scattered particles */}
             <Sparkles count={30} scale={8} size={4} speed={0.4} opacity={0.5} color="#FFF" />
        </group>
    );
};

const Title3D = () => (
    <group position={[0, 1.5, 0]}>
        {/* ELIEZER - Soft White 3D Text */}
        <Center top>
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                <Text3D
                    font={FONT_URL}
                    size={1.2}
                    height={0.4}
                    curveSegments={32}
                    bevelEnabled
                    bevelThickness={0.1}
                    bevelSize={0.06}
                    bevelOffset={0}
                    bevelSegments={12}
                >
                    ELIEZER
                    <meshPhysicalMaterial 
                        color="#FFFFFF"
                        roughness={0.2} 
                        metalness={0.1}
                        clearcoat={1}
                        clearcoatRoughness={0.1}
                    />
                </Text3D>
            </Float>
        </Center>
        
        {/* RUSH - Warm Peach/Orange 3D Text */}
        <Center top position={[0, -1.5, 0]}>
            <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.5} floatingRange={[-0.1, 0.1]}>
                    <Text3D
                    font={FONT_URL}
                    size={1.2}
                    height={0.4}
                    curveSegments={32}
                    bevelEnabled
                    bevelThickness={0.1}
                    bevelSize={0.06}
                    bevelOffset={0}
                    bevelSegments={12}
                >
                    RUSH
                    <meshPhysicalMaterial 
                        color="#FF9F68" 
                        roughness={0.2}
                        metalness={0.1}
                        clearcoat={0.5}
                    />
                </Text3D>
            </Float>
        </Center>
    </group>
);

const MenuScene = () => {
    const activeTab = useGameStore(s => s.activeTab);
    
    return (
        <>
            {/* Show Text ONLY on Home, Show Decor on others */}
            {activeTab === 'HOME' ? <Title3D /> : <BackgroundDecor />}
        </>
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
         Soft Ambient Lighting (Daylight Studio)
         No harsh shadows, just soft global illumination
      */}
      <ambientLight intensity={0.8} color="#ffffff" />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={1.2} 
        color="#ffffff" 
      />
      <directionalLight position={[-5, 5, 2]} intensity={0.5} color="#A5C9FF" />
      
      {/* Soft Environment for reflections */}
      <Environment preset="city" blur={1} />

      {gameState === 'MENU' && (
          <Suspense fallback={null}>
              <MenuScene />
          </Suspense>
      )}

      {/* Gameplay Tokens - Only show when PLAYING or GAMEOVER/WON (to keep background interesting) */}
      {(gameState === 'PLAYING' || gameState === 'WON' || gameState === 'GAMEOVER') && (
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
                count={15}
                scale={2}
                size={6}
                speed={1}
                color="#FFD700"
                />
            ))}
        </group>
      )}

      {/* Post Processing for that "Soft Dreamy" Look */}
      <Suspense fallback={null}>
        <EffectComposer enableNormalPass={false}>
          {/* Subtle Bloom for the white highlights */}
          <Bloom luminanceThreshold={0.95} mipmapBlur intensity={0.4} radius={0.5} />
          {/* TiltShift for the miniature feeling - makes background elements look nice and blurred */}
          <TiltShift2 blur={0.08} /> 
        </EffectComposer>
      </Suspense>
    </>
  );
}
