import { Suspense } from 'react';
import { Text3D, Center, Float, Environment, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, TiltShift2 } from '@react-three/postprocessing';
import { useGameStore } from '../../store/useGameStore';
import Token3D from './Token3D';
import { getPos } from '../../utils/grid';

const FONT_URL = 'https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json';

const MenuScene = () => {
    return (
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

      {/* Gameplay Tokens */}
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

      {/* Post Processing for that "Soft Dreamy" Look */}
      <Suspense fallback={null}>
        <EffectComposer disableNormalPass>
          {/* Subtle Bloom for the white highlights */}
          <Bloom luminanceThreshold={0.95} mipmapBlur intensity={0.4} radius={0.5} />
          {/* TiltShift for the miniature feeling */}
          <TiltShift2 blur={0.05} /> 
        </EffectComposer>
      </Suspense>
    </>
  );
}