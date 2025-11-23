
import React from 'react';
import { CandyColor, CandyType } from '../types';
import { Target, Sparkles, Disc } from 'lucide-react';

interface CandyIconProps {
  color: CandyColor;
  type?: CandyType;
  size?: number;
  className?: string;
}

const TINT_COLORS: Record<CandyColor, string> = {
    [CandyColor.Red]: 'text-yellow-100', // Metallic Gold
    [CandyColor.Blue]: 'text-blue-100',
    [CandyColor.Green]: 'text-emerald-100', // USDT Green
    [CandyColor.Yellow]: 'text-gray-100', // Metallic Grey
    [CandyColor.Purple]: 'text-white', 
    [CandyColor.Orange]: 'text-black', 
    [CandyColor.Multi]: 'text-white',
};

// IMAGE RENDERERS FOR TOKENS

const TonIcon = ({ size, className }: { size: number, className: string }) => (
    <img 
        src="https://ton.org/download/ton_symbol.png" 
        alt="TON"
        className={`${className} object-contain`}
        style={{ width: size, height: size }}
    />
);

const NotIcon = ({ size, className }: { size: number, className: string }) => (
    <img 
        src="https://cdn.joincommunity.xyz/clicker/not_logo.png" 
        alt="NOT"
        className={`${className} object-contain rounded-full bg-black`}
        style={{ width: size, height: size }}
    />
);

const HamsterIcon = ({ size, className }: { size: number, className: string }) => (
    <img 
        src="https://token.hamsterkombatgame.io/token/icon.png" 
        alt="HMSTR"
        className={`${className} object-contain rounded-full`}
        style={{ width: size, height: size }}
    />
);

const UsdtIcon = ({ size, className }: { size: number, className: string }) => (
    <img 
        src="https://tether.to/images/logoCircle.png" 
        alt="USDT"
        className={`${className} object-contain rounded-full`}
        style={{ width: size, height: size }}
    />
);

const DogIcon = ({ size, className }: { size: number, className: string }) => (
    <img 
        src="https://cdn.dogs.dev/dogs.png" 
        alt="DOGS"
        className={`${className} object-contain rounded-full`}
        style={{ width: size, height: size }}
    />
);

const ElzrImage = ({ size, className }: { size: number, className: string }) => (
    <img 
        src="https://raw.githubusercontent.com/Iulian85/eliezer-token/main/ELZR.png" 
        alt="ELZR" 
        style={{ width: size, height: size }} 
        className={`${className} object-contain drop-shadow-md`}
    />
);

export const CandyIcon: React.FC<CandyIconProps> = ({ 
  color, 
  type = CandyType.Normal, 
  size = 28, 
  className = "" 
}) => {
  const tintColor = TINT_COLORS[color];

  // Map Colors to Token Components
  let TokenComponent: React.FC<any>;
  switch (color) {
    case CandyColor.Red: TokenComponent = ElzrImage; break; // ELZR
    case CandyColor.Blue: TokenComponent = TonIcon; break; // TON
    case CandyColor.Green: TokenComponent = UsdtIcon; break; // USDT
    case CandyColor.Yellow: TokenComponent = HamsterIcon; break; // HMSTR
    case CandyColor.Purple: TokenComponent = NotIcon; break; // NOT
    case CandyColor.Orange: TokenComponent = DogIcon; break; // DOGS
    case CandyColor.Multi: TokenComponent = Disc; break;
  }

  // 1. Rainbow Candy (Disco Ball)
  if (type === CandyType.Rainbow) {
    return (
      <div className="relative flex items-center justify-center w-full h-full">
         <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-full animate-spin-slow opacity-80" />
         <Disc size={size} className={`relative z-10 text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] ${className}`} fill="url(#rainbowGradient)" />
         
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

  // 2. Bomb (Overlay on top of Token)
  if (type === CandyType.Bomb) {
    return (
      <div className="relative flex items-center justify-center w-full h-full">
        {/* Token Behind */}
        <TokenComponent size={size} className={`drop-shadow-lg ${tintColor} opacity-100 scale-110 ${className}`} />
        
        {/* Bomb overlay effects */}
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute w-3/4 h-3/4 bg-black/40 rounded-full animate-pulse" />
            <Target size={size * 0.7} className="text-white/90 z-10 drop-shadow-md" strokeWidth={2.5} />
        </div>
        <Sparkles size={size * 0.5} className="absolute -top-1 -right-1 text-white animate-bounce-short drop-shadow-md" />
      </div>
    );
  }

  // 3. Striped (Overlay on top of Token)
  if (type === CandyType.StripedHorizontal || type === CandyType.StripedVertical) {
      const isVertical = type === CandyType.StripedVertical;
      return (
        <div className="relative flex items-center justify-center w-full h-full">
            <TokenComponent size={size} className={`drop-shadow-md ${tintColor} opacity-90 ${className}`} />
            <div className={`absolute inset-0 flex ${isVertical ? 'flex-row' : 'flex-col'} justify-center items-center gap-1 opacity-90`}>
                <div className={`${isVertical ? 'h-full w-[20%]' : 'w-full h-[20%]'} bg-white/70 shadow-sm blur-[0.5px] rounded-full`}></div>
                <div className={`${isVertical ? 'h-full w-[20%]' : 'w-full h-[20%]'} bg-white/70 shadow-sm blur-[0.5px] rounded-full`}></div>
            </div>
        </div>
      );
  }

  // Normal Candy (Just the Token)
  return <TokenComponent size={size} className={`drop-shadow-sm ${tintColor} ${className}`} />;
};
