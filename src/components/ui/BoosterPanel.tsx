
import React from 'react';
import { useGameStore } from '../../store/useGameStore';

export default function BoosterPanel() {
  const { boosters, activateBooster, activeBooster, gameState } = useGameStore();

  if (gameState !== 'PLAYING') return null;

  return (
    <div className="absolute bottom-4 left-0 w-full flex justify-center items-center gap-4 z-20 pointer-events-auto px-4">
      
      {/* Bomb Booster */}
      <button
        onClick={() => activateBooster('bomb')}
        className={`relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl border-2 transition-all active:scale-95 shadow-xl ${
          activeBooster === 'bomb' 
            ? 'bg-red-900/90 border-red-400 shadow-[0_0_20px_rgba(248,113,113,0.6)]' 
            : 'bg-slate-900/80 border-white/10 hover:border-white/30'
        }`}
      >
        <div className="text-2xl mb-1">💣</div>
        <div className="text-[10px] font-bold text-white uppercase">Bomb</div>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-eliezer-gold text-black font-black text-xs rounded-full flex items-center justify-center border border-white">
            {boosters.bomb}
        </div>
      </button>

      {/* Shuffle Booster */}
      <button
        onClick={() => activateBooster('shuffle')}
        className="relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl border-2 border-white/10 bg-slate-900/80 hover:border-white/30 transition-all active:scale-95 shadow-xl"
      >
        <div className="text-2xl mb-1">🔀</div>
        <div className="text-[10px] font-bold text-white uppercase">Shuffle</div>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-eliezer-gold text-black font-black text-xs rounded-full flex items-center justify-center border border-white">
            {boosters.shuffle}
        </div>
      </button>

      {/* Extra Moves Booster */}
      <button
        onClick={() => activateBooster('extraMoves')}
        className="relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl border-2 border-white/10 bg-slate-900/80 hover:border-white/30 transition-all active:scale-95 shadow-xl"
      >
        <div className="text-2xl mb-1">⚡</div>
        <div className="text-[10px] font-bold text-white uppercase">+5 Moves</div>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-eliezer-gold text-black font-black text-xs rounded-full flex items-center justify-center border border-white">
            {boosters.extraMoves}
        </div>
      </button>

    </div>
  );
}
