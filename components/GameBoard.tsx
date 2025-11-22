
import React, { useState } from 'react';
import { Board } from '../types';
import CandyItem from './CandyItem';
import { Target, Sparkles, Star } from 'lucide-react';
import { SpecialEventType } from '../utils/boardUtils';

export interface ActiveEffect {
    index: number;
    type: SpecialEventType;
}

interface GameBoardProps {
  board: Board;
  selectedCandyIndex: number | null;
  onTap: (index: number) => void;
  onSwipe: (fromIndex: number, toIndex: number) => void;
  isProcessing: boolean;
  isShaking?: boolean;
  activeEffects?: ActiveEffect[];
  bombEffectIndex?: number | null;
  collectingIndices?: number[];
}

const GameBoard: React.FC<GameBoardProps> = ({
  board,
  selectedCandyIndex,
  onTap,
  onSwipe,
  isProcessing,
  isShaking = false,
  activeEffects = [],
  bombEffectIndex = null,
  collectingIndices = []
}) => {
    const [dragState, setDragState] = useState<{
        index: number;
        startX: number;
        startY: number;
        currentX: number;
        currentY: number;
    } | null>(null);

    const handlePointerDown = (e: React.PointerEvent, index: number) => {
        if (isProcessing) return;
        e.preventDefault();
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        
        setDragState({
            index,
            startX: e.clientX,
            startY: e.clientY,
            currentX: e.clientX,
            currentY: e.clientY
        });
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!dragState) return;
        setDragState(prev => prev ? ({
            ...prev,
            currentX: e.clientX,
            currentY: e.clientY
        }) : null);
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (!dragState) return;
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);

        const dx = dragState.currentX - dragState.startX;
        const dy = dragState.currentY - dragState.startY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const SWIPE_THRESHOLD = 30; // px

        if (dist < SWIPE_THRESHOLD) {
            onTap(dragState.index);
        } else {
            let targetIndex = -1;
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);

            if (absDx > absDy) {
                targetIndex = dx > 0 ? dragState.index + 1 : dragState.index - 1;
            } else {
                targetIndex = dy > 0 ? dragState.index + 8 : dragState.index - 8;
            }
            
            onSwipe(dragState.index, targetIndex);
        }

        setDragState(null);
    };

    return (
        <div className={`candy-grid p-2 bg-black/20 rounded-xl border border-white/10 backdrop-blur-sm shadow-2xl touch-none ${isShaking ? 'animate-shake' : ''}`}>
            {board.map((candy, index) => {
                const isDragging = dragState?.index === index;
                let style: React.CSSProperties = {};
                
                if (isDragging) {
                    const x = dragState.currentX - dragState.startX;
                    const y = dragState.currentY - dragState.startY;
                    style = { 
                        transform: `translate(${x}px, ${y}px)`, 
                        zIndex: 50,
                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                        transition: 'none' 
                    };
                }
                
                const effect = activeEffects.find(e => e.index === index);
                const isBombEffect = bombEffectIndex === index;
                const isCollecting = collectingIndices.includes(index);

                return (
                    <div 
                        key={`${index}-${candy?.id || 'empty'}`} 
                        className={`aspect-square relative p-0.5 transition-all duration-300 
                            ${isBombEffect ? 'scale-[0.85] brightness-150 rotate-3' : ''}
                            ${isCollecting ? 'scale-125 z-[100] brightness-110 ease-out' : ''}
                        `}
                    >
                        <CandyItem 
                            candy={candy}
                            isSelected={selectedCandyIndex === index}
                            style={style}
                            onPointerDown={(e) => handlePointerDown(e, index)}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                        />
                        
                        {/* Goal Collection Effect */}
                        {isCollecting && (
                            <div className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none">
                                {/* Stronger Golden Glow Background */}
                                <div className="absolute inset-[-40%] bg-yellow-400/50 blur-md rounded-full animate-pulse" />
                                
                                {/* Expanding Ring - More distinct */}
                                <div className="absolute inset-0 border-[3px] border-white/90 rounded-full animate-[ping_0.6s_cubic-bezier(0,0,0.2,1)_forwards]" />
                                
                                {/* Sparkles - Larger and more of them */}
                                <div className="absolute -top-4 -right-4 animate-[bounce_0.4s_infinite]">
                                    <Sparkles className="text-yellow-100 drop-shadow-[0_0_5px_rgba(255,255,255,1)]" size={26} fill="white" />
                                </div>
                                <div className="absolute -bottom-3 -left-3 animate-[bounce_0.5s_infinite_0.2s]">
                                    <Star className="text-white fill-yellow-300 drop-shadow-md" size={18} />
                                </div>
                                {/* Extra particle */}
                                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-6 animate-[bounce_0.6s_infinite_0.1s]">
                                    <div className="w-2 h-2 bg-yellow-200 rotate-45 shadow-[0_0_5px_white]" />
                                </div>
                                
                                {/* Center Flash */}
                                <div className="absolute inset-0 bg-white/40 animate-pulse rounded-xl mix-blend-overlay" />
                            </div>
                        )}

                        {/* Booster Application Effect */}
                        {isBombEffect && (
                            <div className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none">
                                <div className="absolute inset-0 border-4 border-red-500 rounded-full animate-ping opacity-60" />
                                <div className="relative bg-gradient-to-br from-red-500 to-red-700 rounded-full p-2 shadow-[0_0_30px_rgba(220,38,38,0.8)] animate-bounce-in border-2 border-white/50">
                                    <Target className="text-white w-8 h-8 animate-pulse" />
                                </div>
                            </div>
                        )}
                        
                        {/* Local Cell Effects */}
                        {effect && (
                            <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                                {effect.type === 'BOMB' && (
                                    <>
                                        <div className="absolute w-[250%] h-[250%] rounded-full bg-gradient-to-r from-orange-400/60 to-red-600/60 animate-pop blur-md" />
                                        <div className="absolute w-[200%] h-[200%] rounded-full border-4 border-white animate-ping opacity-60" />
                                    </>
                                )}

                                {(effect.type === 'STRIPED_H' || effect.type === 'STRIPED_V') && (
                                    <>
                                        <div className="absolute inset-0 bg-white animate-ping rounded-full opacity-80" />
                                        <div className={`absolute bg-white shadow-[0_0_15px_white] z-40 
                                            ${effect.type === 'STRIPED_H' ? 'w-[300%] h-2' : 'h-[300%] w-2'}`} 
                                        />
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default GameBoard;
