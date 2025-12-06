
import React from 'react';
import { useGameStore } from '../../store/useGameStore';

export default function BoosterPanel() {
  const { boosters, activateBooster, activeBooster, gameState } = useGameStore();

  if (gameState !== 'PLAYING') return null;

  return (
    <div className="absolute bottom-6 left-0 w-full flex justify-center items-end z-20 pointer-events-auto px-4">
      
      {/* Glass Dock Container */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-2 flex gap-3 shadow-2xl">
          
          {/* Bomb Booster */}
          <button
            onClick={() => activateBooster('bomb')}
            className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl border transition-all active:scale-95 ${
              activeBooster === 'bomb' 
                ? 'bg-red-500/20 border-red-400 shadow-[0_0_15px_rgba(248,113,113,0.4)]' 
                : 'bg-white/5 border-white/5 hover:bg-white/10'
            }`}
          >
            <div className="text-xl mb-0.5">💣</div>
            <div className="text-[9px] font-bold text-white uppercase tracking-wide">Bomb</div>
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-eliezer-gold text-black font-black text-[10px] rounded-full flex items-center justify-center border border-white shadow-sm">
                {boosters.bomb}
            </div>
          </button>

          {/* Shuffle Booster */}
          <button
            onClick={() => activateBooster('shuffle')}
            className="relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all active:scale-95"
          >
            <div className="text-xl mb-0.5">🔀</div>
            <div className="text-[9px] font-bold text-white uppercase tracking-wide">Shuffle</div>
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-eliezer-gold text-black font-black text-[10px] rounded-full flex items-center justify-center border border-white shadow-sm">
                {boosters.shuffle}
            </div>
          </button>

          {/* Extra Moves Booster */}
          <button
            onClick={() => activateBooster('extraMoves')}
            className="relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all active:scale-95"
          >
            <div className="text-xl mb-0.5">⚡</div>
            <div className="text-[9px] font-bold text-white uppercase tracking-wide">+5 Move</div>
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-eliezer-gold text-black font-black text-[10px] rounded-full flex items-center justify-center border border-white shadow-sm">
                {boosters.extraMoves}
            </div>
          </button>
      </div>

    </div>
  );
}
