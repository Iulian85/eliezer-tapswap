import React from 'react';
import { Candy, CandyType } from '../types';
import { COLOR_STYLES } from '../constants';
import { CandyIcon } from './CandyIcon';

interface CandyItemProps {
  candy: Candy | null;
  isSelected: boolean;
  isCollecting?: boolean;
  style?: React.CSSProperties;
  onPointerDown?: (e: React.PointerEvent) => void;
  onPointerMove?: (e: React.PointerEvent) => void;
  onPointerUp?: (e: React.PointerEvent) => void;
  className?: string;
}

const CandyItem: React.FC<CandyItemProps> = ({
  candy,
  isSelected,
  isCollecting,
  style,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  className
}) => {
  if (!candy) return <div className="w-full h-full" />;

  const colorClass = COLOR_STYLES[candy.color];
  const isSpecial = candy.type !== CandyType.Normal;
  
  // Special candies pulsate or shimmer
  const specialAnim = isSpecial ? 'animate-pulse-fast ring-2 ring-white/50' : '';
  
  // Animations
  const entranceAnim = candy.isNew ? 'animate-bounce-in' : '';
  
  // Swirl Settle Animation: Deterministically choose CW or CCW based on candy ID
  const isEven = candy.id.split('').reduce((a,c) => a + c.charCodeAt(0), 0) % 2 === 0;
  const settleAnim = candy.isSettling 
    ? (isEven ? 'animate-settle-cw' : 'animate-settle-ccw') 
    : '';
  
  // Match Animation: 
  // If collecting, use the specialized 'animate-collect-pop' (defined in index.html)
  // Otherwise use standard pop
  const matchAnim = candy.isMatched 
    ? (isCollecting 
        ? 'animate-collect-pop z-50' 
        : 'scale-150 opacity-0 brightness-200 saturate-200 !duration-250 ease-out z-50')
    : '';
  
  // Only apply scale-95 (default idle) if not selected and not matching
  const selectClasses = isSelected 
    ? 'brightness-125 ring-4 ring-white z-10 scale-105' 
    : (candy.isMatched ? '' : 'scale-95');

  return (
    <div
      className={`
        relative w-full h-full rounded-xl 
        flex items-center justify-center 
        shadow-inner border border-white/10
        transition-transform duration-75
        touch-none select-none cursor-grab active:cursor-grabbing
        overflow-hidden
        ${colorClass} ${selectClasses} ${entranceAnim} ${settleAnim} ${specialAnim} ${matchAnim} ${className || ''}
      `}
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
        <CandyIcon color={candy.color} type={candy.type} />
        
        {/* Glossy effect */}
        <div className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full opacity-30 blur-[2px]" />
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />

        {/* Entrance Shimmer Effect (only for new items) */}
        {candy.isNew && (
            <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none z-20">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer-sweep" />
            </div>
        )}
    </div>
  );
};

export default React.memo(CandyItem);