
import React from 'react';
import { useSpring, animated, config } from '@react-spring/three';
import { Text, Cylinder, Float, Outlines, RoundedBox } from '@react-three/drei';
import { TokenType, Tile, TOKEN_COLORS } from '../../types';
import * as THREE from 'three';
import { getPos } from '../../utils/grid';

interface Props {
  data: Tile;
  selected: boolean;
  onClick: () => void;
}

const LABELS: Record<TokenType, string> = {
  HMSTR: '🐹',
  USDT: '$',
  NOT: 'N',
  DOGS: '🐶',
  TON: '💎',
  ELZR: '▲',
  EMPTY: ''
};

const Token3D: React.FC<Props> = ({ data, selected, onClick }) => {
  if (data.type === 'EMPTY') return null;

  const [targetX, targetY, targetZ] = getPos(data.x, data.y);

  const { position, scale, rotation } = useSpring({
    position: [targetX, targetY, targetZ],
    scale: selected ? 1.15 : 1,
    rotation: selected ? [Math.PI / 2, Math.PI * 2, 0] : [Math.PI / 2, 0, 0],
    config: { tension: 200, friction: 15 } // Snappy but soft spring
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
          {/* Main Body - Soft Matte Plastic / Clay Material */}
          <Cylinder args={[0.42, 0.42, 0.15, 64]}>
            <meshPhysicalMaterial
              color={color}
              metalness={0.1}
              roughness={0.4}
              clearcoat={0.3}
              clearcoatRoughness={0.2}
              emissive={selected ? color : '#000'}
              emissiveIntensity={selected ? 0.2 : 0}
            />
          </Cylinder>
          
          {/* Inner Bevel - Subtle detail */}
          <Cylinder args={[0.35, 0.35, 0.16, 64]}>
             <meshPhysicalMaterial 
                color={color} 
                metalness={0.1} 
                roughness={0.5}
                clearcoat={0}
             />
          </Cylinder>

          {/* Text Symbol - High Contrast */}
          <Text
            position={[0, 0.09, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.35}
            fontWeight={900}
            color={'#1A237E'} // Factory Ink for everything
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
