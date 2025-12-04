import React, { useRef, useMemo } from 'react';
import { useSpring, animated, config } from '@react-spring/three';
import { Text, Cylinder, Float, Sparkles } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
// FIX: TOKEN_COLORS is now exported from src/types.ts
import { Tile, TOKEN_COLORS } from '../../types';
import * as THREE from 'three';

interface TokenProps {
  data: Tile;
  isSelected: boolean;
  onClick: () => void;
}

const Token: React.FC<TokenProps> = ({ data, isSelected, onClick }) => {
  const meshRef = useRef<THREE.Group>(null);

  // Position spring based on grid coordinates
  // Grid: X (0..7), Y (0..8). Map to world coordinates.
  // Center grid at 0,0
  const targetX = (data.x - 3.5) * 1.1;
  const targetY = (data.y - 4.0) * 1.1;

  const { position, scale, rotation } = useSpring({
    position: [targetX, targetY, 0],
    // FIX: TokenType now includes 'EMPTY'
    scale: data.type === 'EMPTY' ? 0 : isSelected ? 1.2 : 1,
    rotation: isSelected ? [0, Math.PI * 2, 0] : [Math.PI / 2, 0, 0],
    config: config.gentle,
  });

  const color = TOKEN_COLORS[data.type];

  // Visual text for the token
  const label = useMemo(() => {
    switch(data.type) {
        case 'HMSTR': return '🐹';
        case 'USDT': return '$';
        case 'NOT': return 'N';
        case 'DOGS': return '🐶';
        case 'TON': return '💎';
        case 'ELZR': return '▲';
        default: return '';
    }
  }, [data.type]);

  // FIX: TokenType now includes 'EMPTY'
  if (data.type === 'EMPTY') return null;

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
        <group rotation={[Math.PI/2, 0, 0]}>
            {/* Main Coin Body */}
            <Cylinder args={[0.45, 0.45, 0.2, 32]}>
            <meshStandardMaterial 
                color={color} 
                metalness={0.6} 
                roughness={0.2} 
                emissive={isSelected ? color : '#000'}
                emissiveIntensity={isSelected ? 0.5 : 0}
            />
            </Cylinder>
            
            {/* Edge Detail */}
            <Cylinder args={[0.48, 0.48, 0.15, 32]}>
                <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.1} transparent opacity={0.3} />
            </Cylinder>

            {/* Label */}
            <Text
            position={[0, 0.11, 0]}
            rotation={[-Math.PI/2, 0, 0]}
            fontSize={0.5}
            color={data.type === 'NOT' || data.type === 'DOGS' ? '#000' : '#fff'}
            anchorX="center"
            anchorY="middle"
            >
            {label}
            </Text>
        </group>
      </Float>

      {/* Selected Effect */}
      {isSelected && (
          <Sparkles count={20} scale={1.5} size={2} speed={0.4} opacity={1} color="#ffff00" />
      )}
    </animated.group>
  );
};

export default Token;
