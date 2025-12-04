import React from 'react';
import { useSpring, animated, config } from '@react-spring/three';
import { Text, Cylinder, Float, Outlines } from '@react-three/drei';
import { TokenType, Tile, TOKEN_COLORS } from '../../types';
import * as THREE from 'three';

interface Props {
  data: Tile;
  selected: boolean;
  onClick: () => void;
}

const LABELS: Record<TokenType, string> = {
  HMSTR: '🐹',
  USDT: '$',
  NOT: 'NOT',
  DOGS: '🐶',
  TON: '💎',
  ELZR: '▲',
  EMPTY: ''
};

// Calculate 3D position from Grid X/Y
const getPos = (x: number, y: number): [number, number, number] => {
  const spacing = 1.1;
  const xOffset = (8 * spacing) / 2 - 0.5; // Centering
  const yOffset = (9 * spacing) / 2 - 0.5;
  return [(x * spacing) - xOffset, (y * spacing) - yOffset, 0];
};

const Token3D: React.FC<Props> = ({ data, selected, onClick }) => {
  // Guard clause for empty tiles (destroyed)
  if (data.type === 'EMPTY') return null;

  const [targetX, targetY, targetZ] = getPos(data.x, data.y);

  const { position, scale, rotation } = useSpring({
    position: [targetX, targetY, targetZ],
    scale: selected ? 1.2 : 1,
    rotation: selected ? [Math.PI / 2, Math.PI * 2, 0] : [Math.PI / 2, 0, 0],
    config: config.gentle
  });

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
          <Cylinder args={[0.45, 0.45, 0.15, 32]}>
            <meshStandardMaterial
              color={color}
              metalness={0.9}
              roughness={0.4}
              emissive={selected ? color : '#000'}
              emissiveIntensity={selected ? 0.5 : 0}
            />
            <Outlines thickness={0.02} color={selected ? 'white' : 'black'} />
          </Cylinder>
          
          {/* Face Detail (Rim) */}
          <Cylinder args={[0.4, 0.4, 0.16, 32]}>
             <meshStandardMaterial color={color} metalness={0.6} roughness={0.6} />
          </Cylinder>

          {/* Text Symbol */}
          <Text
            position={[0, 0.1, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.4}
            fontWeight={800}
            color={data.type === 'DOGS' || data.type === 'USDT' ? 'black' : 'white'}
            anchorX="center"
            anchorY="middle"
          >
            {LABELS[data.type]}
          </Text>
        </group>
      </Float>
    </animated.group>
  );
};

export default Token3D;