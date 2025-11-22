
import React from 'react';
import { CandyColor, CandyType } from '../types';
import { Heart, Hexagon, Star, Circle, Triangle, Square, Sparkles, Target, Disc } from 'lucide-react';

interface CandyIconProps {
  color: CandyColor;
  type?: CandyType;
  size?: number;
  className?: string;
}

const TINT_COLORS: Record<CandyColor, string> = {
    [CandyColor.Red]: 'text-red-100',
    [CandyColor.Blue]: 'text-blue-100',
    [CandyColor.Green]: 'text-emerald-100',
    [CandyColor.Yellow]: 'text-yellow-100',
    [CandyColor.Purple]: 'text-purple-100',
    [CandyColor.Orange]: 'text-orange-100',
    [CandyColor.Multi]: 'text-white', // Rainbow base
};

export const CandyIcon: React.FC<CandyIconProps> = ({ 
  color, 
  type = CandyType.Normal, 
  size = 28, 
  className = "" 
}) => {
  // Determine Shape Icon based on color
  let Icon = Circle;
  switch (color) {
    case CandyColor.Red: Icon = Heart; break;
    case CandyColor.Blue: Icon = Hexagon; break;
    case CandyColor.Green: Icon = Square; break; 
    case CandyColor.Yellow: Icon = Star; break;
    case CandyColor.Purple: Icon = Triangle; break;
    case CandyColor.Orange: Icon = Circle; break;
    case CandyColor.Multi: Icon = Disc; break; // Rainbow shape
  }

  const tintColor = TINT_COLORS[color];

  // Special Candy Renderers
  
  // 4. Rainbow Candy (Disco Ball)
  if (type === CandyType.Rainbow) {
    return (
      <div className="relative flex items-center justify-center w-full h-full">
         <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-full animate-spin-slow opacity-80" />
         <Icon size={size} className={`relative z-10 text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] ${className}`} fill="url(#rainbowGradient)" />
         
         {/* Speckles */}
         <div className="absolute inset-0 flex items-center justify-center">
             <div className="absolute w-full h-full rounded-full border-2 border-white/30 animate-pulse" />
             <div className="absolute w-1 h-1 bg-white rounded-full top-2 left-2 animate-ping" />
             <div className="absolute w-1 h-1 bg-yellow-300 rounded-full bottom-2 right-2 animate-ping delay-100" />
             <div className="absolute w-1 h-1 bg-cyan-300 rounded-full top-2 right-2 animate-ping delay-200" />
         </div>

         {/* SVG Gradient Definition for the Icon fill */}
         <svg width="0" height="0">
           <defs>
             <radialGradient id="rainbowGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
               <stop offset="0%" stopColor="#ffffff" />
               <stop offset="25%" stopColor="#facc15" />
               <stop offset="50%" stopColor="#f472b6" />
               <stop offset="75%" stopColor="#60a5fa" />
               <stop offset="100%" stopColor="#a78bfa" />
             </radialGradient>
           </defs>
         </svg>
      </div>
    );
  }

  // 1. Striped Horizontal
  if (type === CandyType.StripedHorizontal) {
    return (
      <div className="relative flex items-center justify-center w-full h-full">
        <Icon size={size} className={`drop-shadow-md ${tintColor} opacity-90 ${className}`} fill="currentColor" />
        <div className="absolute inset-0 flex flex-col justify-center items-center gap-1 opacity-80">
           <div className="w-full h-[15%] bg-white/80 shadow-sm blur-[0.5px]"></div>
           <div className="w-full h-[15%] bg-white/80 shadow-sm blur-[0.5px]"></div>
        </div>
      </div>
    );
  }

  // 2. Striped Vertical
  if (type === CandyType.StripedVertical) {
    return (
      <div className="relative flex items-center justify-center w-full h-full">
        <Icon size={size} className={`drop-shadow-md ${tintColor} opacity-90 ${className}`} fill="currentColor" />
        <div className="absolute inset-0 flex flex-row justify-center items-center gap-1 opacity-80">
           <div className="h-full w-[15%] bg-white/80 shadow-sm blur-[0.5px]"></div>
           <div className="h-full w-[15%] bg-white/80 shadow-sm blur-[0.5px]"></div>
        </div>
      </div>
    );
  }

  // 3. Bomb
  if (type === CandyType.Bomb) {
    return (
      <div className="relative flex items-center justify-center w-full h-full">
        {/* Base Shape behind - slightly larger and fully opaque tinted */}
        <Icon size={size} className={`drop-shadow-lg ${tintColor} opacity-100 scale-110 ${className}`} fill="currentColor" />
        
        {/* Bomb overlay effects */}
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute w-3/4 h-3/4 bg-black/20 rounded-full animate-pulse" />
            {/* Small Target Indicator overlay */}
            <Target size={size * 0.6} className="text-white/90 z-10 drop-shadow-md" strokeWidth={3} />
        </div>
        <Sparkles size={size * 0.5} className="absolute -top-1 -right-1 text-white animate-bounce-short drop-shadow-md" />
      </div>
    );
  }

  // Normal Candy
  // Uses a semi-transparent white to look like a watermark on the colored background
  return <Icon size={size} className={`drop-shadow-sm text-white/40 ${className}`} fill="currentColor" />;
};
