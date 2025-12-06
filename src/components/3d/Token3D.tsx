
import React, { useMemo } from 'react';
import { useSpring, animated, config } from '@react-spring/three';
import { Cylinder, Float, Outlines, useTexture, Circle } from '@react-three/drei';
import { TokenType, Tile, TOKEN_COLORS } from '../../types';
import { getPos } from '../../utils/grid';
import * as THREE from 'three';

interface Props {
  data: Tile;
  selected: boolean;
  onClick: () => void;
}

// URL-urile furnizate pentru texturi
const TEXTURE_URLS = {
  HMSTR: 'https://token.hamsterkombatgame.io/token/icon.png',
  USDT: 'https://tether.to/images/logoCircle.png',
  NOT: 'https://cdn.joincommunity.xyz/clicker/not_logo.png',
  DOGS: 'https://cdn.dogs.dev/dogs.png',
  TON: 'https://raw.githubusercontent.com/mingircioglu/minterjson/refs/heads/main/ton.svg',
  ELZR: 'https://raw.githubusercontent.com/Iulian85/eliezer-token/main/ELZR.png',
  // Fallback transparent pentru EMPTY sau tipuri necunoscute
  EMPTY: '', 
};

const Token3D: React.FC<Props> = ({ data, selected, onClick }) => {
  if (data.type === 'EMPTY') return null;

  const [targetX, targetY, targetZ] = getPos(data.x, data.y);

  const { position, scale, rotation } = useSpring({
    position: [targetX, targetY, targetZ],
    scale: selected ? 1.2 : 1,
    rotation: selected ? [Math.PI / 2, Math.PI * 2, 0] : [Math.PI / 2, 0, 0],
    config: config.wobbly
  });

  const color = TOKEN_COLORS[data.type] || '#ffffff';

  // Încărcăm textura specifică acestui token
  // Nota: useTexture cacheuiește automat, deci nu se descarcă de 100 de ori
  const texture = useTexture(TEXTURE_URLS[data.type as keyof typeof TEXTURE_URLS]);
  
  // Optimizare textură
  useMemo(() => {
    if (texture) {
        texture.anisotropy = 16;
        texture.colorSpace = THREE.SRGBColorSpace;
    }
  }, [texture]);

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
          {/* Corpul Monezii */}
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
          
          {/* Imaginea (Decal/Texture) pe fața monezii */}
          {/* Plasăm un cerc puțin deasupra (y=0.08) pentru a evita Z-fighting */}
          <Circle args={[0.35, 32]} position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
             <meshBasicMaterial 
                map={texture} 
                transparent 
                opacity={1} 
                color="white"
             />
          </Circle>

          {/* Spate Monedă (pentru când se rotește la selecție) */}
          <Circle args={[0.35, 32]} position={[0, -0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
             <meshStandardMaterial color={color} metalness={0.8} roughness={0.3} />
          </Circle>

        </group>
      </Float>
    </animated.group>
  );
};

export default Token3D;
