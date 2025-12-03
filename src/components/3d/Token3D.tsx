import { useRef, useMemo } from 'react';
import { useSpring, animated, config } from '@react-spring/three';
import { Text, Cylinder, Float, Outlines } from '@react-three/drei';
import { TokenType, Tile } from '../../store/useGameStore';
import * as THREE from 'three';

interface Props {
  data: Tile;
  selected: boolean;
  onClick: () => void;
}

const COLORS: Record<TokenType, string> = {
  HMSTR: '#D97706', // Orange
  USDT: '#10B981', // Green
  NOT: '#111827',  // Black
  DOGS: '#F3F4F6', // White
  TON: '#3B82F6',  // Blue
  ELZR: '#F59E0B', // Gold
};

const LABELS: Record<TokenType, string> = {
  HMSTR: '🐹',
  USDT: '$',
  NOT: 'NOT',
  DOGS: '🐶',
  TON: '💎',
  ELZR: '▲',
};

// Calculate 3D position from Grid X/Y
const getPos = (x: number, y: number): [number, number, number] => {
  const spacing = 1.1;
  const xOffset = (8 * spacing) / 2 - 0.5; // Centering
  const yOffset = (9 * spacing) / 2 - 0.5;
  return [(x * spacing) - xOffset, (y * spacing) - yOffset, 0];
};

export default function Token3D({ data, selected, onClick }: Props) {
  const [targetX, targetY, targetZ] = getPos(data.x, data.y);

  const { position, scale, rotation } = useSpring({
    position: [targetX, targetY, targetZ],
    scale: selected ? 1.2 : 1,
    rotation: selected ? [Math.PI / 2, Math.PI * 2, 0] : [Math.PI / 2, 0, 0],
    config: config.gentle
  });

  const color = COLORS[data.type];

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
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.1}>
        <Cylinder args={[0.45, 0.45, 0.15, 32]}>
          <meshStandardMaterial
            color={color}
            metalness={0.7}
            roughness={0.2}
            emissive={selected ? color : '#000'}
            emissiveIntensity={selected ? 0.5 : 0}
          />
          <Outlines thickness={0.02} color={selected ? 'white' : 'black'} />
        </Cylinder>
        
        {/* Face Detail (Rim) */}
        <Cylinder args={[0.4, 0.4, 0.16, 32]}>
           <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
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
      </Float>
    </animated.group>
  );
}