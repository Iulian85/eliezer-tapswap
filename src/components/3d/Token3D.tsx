
import React from 'react';
import { useSpring, animated, config } from '@react-spring/three';
import { Text, Cylinder, Float, Outlines } from '@react-three/drei';
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
  NOT: 'NOT',
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
    scale: selected ? 1.2 : 1,
    rotation: selected ? [Math.PI / 2, Math.PI * 2, 0] : [Math.PI / 2, 0, 0],
    config: config.wobbly
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
          {/* Main Body - Matte Plastic */}
          <Cylinder args={[0.42, 0.42, 0.15, 32]}>
            <meshPhysicalMaterial
              color={color}
              metalness={0.1}
              roughness={0.4}
              clearcoat={0.3}
              clearcoatRoughness={0.2}
              emissive={selected ? color : '#000'}
              emissiveIntensity={selected ? 0.3 : 0}
            />
            {/* White outline for "cartoonish" premium look */}
            <Outlines thickness={0.02} color={selected ? '#FFF' : 'rgba(0,0,0,0.1)'} />
          </Cylinder>
          
          {/* Inner Face */}
          <Cylinder args={[0.36, 0.36, 0.16, 32]}>
             <meshPhysicalMaterial 
                color={color} 
                metalness={0.1} 
                roughness={0.6}
                // slightly darker or lighter to create rim effect
             />
          </Cylinder>

          {/* Text Symbol */}
          <Text
            position={[0, 0.1, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.35}
            fontWeight={900}
            // Using factory-ink (dark blue) for almost all tokens for high contrast
            color={'#1A237E'} 
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
