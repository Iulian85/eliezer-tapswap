
import React, { useMemo } from 'react';
import { useSpring, animated, config } from '@react-spring/three';
import { Cylinder, Float, Outlines, useTexture, Circle } from '@react-three/drei';
import { Tile, TOKEN_COLORS } from '../../types';
import { getPos } from '../../utils/grid';
import * as THREE from 'three';

interface Props {
  data: Tile;
  selected: boolean;
  onClick: () => void;
}

// 1x1 Transparent PNG for fallback
const FALLBACK_IMG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const TEXTURE_URLS = {
  HMSTR: 'https://token.hamsterkombatgame.io/token/icon.png',
  USDT: 'https://tether.to/images/logoCircle.png',
  NOT: 'https://cdn.joincommunity.xyz/clicker/not_logo.png',
  DOGS: 'https://cdn.dogs.dev/dogs.png',
  TON: 'https://raw.githubusercontent.com/mingircioglu/minterjson/refs/heads/main/ton.svg',
  ELZR: 'https://raw.githubusercontent.com/Iulian85/eliezer-token/main/ELZR.png',
};

const Token3D: React.FC<Props> = ({ data, selected, onClick }) => {
  // 1. Determine URL securely. Always return a string.
  const typeKey = data.type as keyof typeof TEXTURE_URLS;
  const url = TEXTURE_URLS[typeKey] || FALLBACK_IMG;

  // 2. Call hooks unconditionally (Rules of Hooks)
  const texture = useTexture(url);
  const [targetX, targetY, targetZ] = getPos(data.x, data.y);

  const { position, scale, rotation } = useSpring({
    position: [targetX, targetY, targetZ],
    scale: selected ? 1.2 : 1,
    rotation: selected ? [Math.PI / 2, Math.PI * 2, 0] : [Math.PI / 2, 0, 0],
    config: config.wobbly
  });

  useMemo(() => {
    if (texture) {
        texture.anisotropy = 16;
        texture.colorSpace = THREE.SRGBColorSpace;
    }
  }, [texture]);

  // 3. Early return ONLY after hooks are initialized
  if (data.type === 'EMPTY') return null;

  const color = TOKEN_COLORS[data.type] || '#ffffff';

  return (
    <animated.group
      position={position as any}
      scale={scale as any}
      rotation={rotation as any}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <Float speed={2} rotationIntensity={0} floatIntensity={0.1}>
        <group>
          {/* Main Body */}
          <Cylinder args={[0.42, 0.42, 0.15, 32]}>
            <meshStandardMaterial
              color={color}
              metalness={0.8}
              roughness={0.3}
              emissive={selected ? color : '#000'}
              emissiveIntensity={selected ? 0.3 : 0}
            />
            <Outlines thickness={0.02} color={selected ? 'white' : 'black'} />
          </Cylinder>
          
          {/* Face Texture */}
          <Circle args={[0.35, 32]} position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
             <meshBasicMaterial 
                map={texture} 
                transparent 
                opacity={1} 
                color="white"
                // Handle transparent textures properly
                alphaTest={0.1}
             />
          </Circle>

          {/* Back Face */}
          <Circle args={[0.35, 32]} position={[0, -0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
             <meshStandardMaterial color={color} metalness={0.8} roughness={0.3} />
          </Circle>

        </group>
      </Float>
    </animated.group>
  );
};

export default Token3D;