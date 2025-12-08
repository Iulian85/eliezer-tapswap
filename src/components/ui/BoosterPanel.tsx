
import React from 'react';
import { useGameStore } from '../../store/useGameStore';

export default function BoosterPanel() {
  const { boosters, activateBooster, activeBooster, gameState } = useGameStore();

  if (gameState !== 'PLAYING') return null;

  return (
    <div className="absolute bottom-6 left-0 w-full flex justify-center items-end z-20 pointer-events-auto px-4">
      
      {/* Glass Dock Container */}
      <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-2 flex gap-3 shadow-xl">
          
          {/* Bomb Booster */}
          <button
            onClick={() => activateBooster('bomb')}
            className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl border transition-all active:scale-95 ${
              activeBooster === 'bomb' 
                ? 'bg-red-500/40 border-red-300 shadow-[0_0_15px_rgba(248,113,113,0.6)]' 
                : 'bg-white/10 border-white/20 hover:bg-white/20'
            }`}
          >
            <div className="text-xl mb-0.5 drop-shadow-md">💣</div>
            <div className="text-[9px] font-bold text-white uppercase tracking-wide drop-shadow-sm">Bomb</div>
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-eliezer-peach text-white font-black text-[10px] rounded-full flex items-center justify-center border border-white shadow-sm">
                {boosters.bomb}
            </div>
          </button>

          {/* Shuffle Booster */}
          <button
            onClick={() => activateBooster('shuffle')}
            className="relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 transition-all active:scale-95"
          >
            <div className="text-xl mb-0.5 drop-shadow-md">🔀</div>
            <div className="text-[9px] font-bold text-white uppercase tracking-wide drop-shadow-sm">Shuffle</div>
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-eliezer-peach text-white font-black text-[10px] rounded-full flex items-center justify-center border border-white shadow-sm">
                {boosters.shuffle}
            </div>
          </button>

          {/* Extra Moves Booster */}
          <button
            onClick={() => activateBooster('extraMoves')}
            className="relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 transition-all active:scale-95"
          >
            <div className="text-xl mb-0.5 drop-shadow-md">⚡</div>
            <div className="text-[9px] font-bold text-white uppercase tracking-wide drop-shadow-sm">+5 Move</div>
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-eliezer-peach text-white font-black text-[10px] rounded-full flex items-center justify-center border border-white shadow-sm">
                {boosters.extraMoves}
            </div>
          </button>
      </div>

    </div>
  );
}
