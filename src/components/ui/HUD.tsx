
import { useGameStore } from '../../store/useGameStore';

export default function HUD() {
  const { score, moves, level, gameState, quitGame } = useGameStore();

  if (gameState === 'MENU') return null;

  return (
    <div className="absolute top-0 left-0 w-full pointer-events-none z-10 flex flex-col p-4 pt-6">
      
      {/* Top Row: Back Button */}
      <div className="flex justify-start mb-4 pointer-events-auto">
        <button 
          onClick={quitGame}
          className="bg-white/50 backdrop-blur-xl px-4 py-2.5 rounded-2xl text-factory-ink font-black shadow-clay-card active:scale-95 transition-transform flex items-center gap-2 border border-white/60"
        >
          <span>⬅ MENU</span>
        </button>
      </div>

      {/* Status Bar - Frosted Glass Pill */}
      <div className="bg-white/60 backdrop-blur-2xl rounded-3xl p-3 flex justify-between items-center shadow-clay-card w-full border-2 border-white/60">
        
        <div className="flex flex-col items-center min-w-[70px]">
          <div className="text-[9px] text-factory-ink/50 uppercase tracking-widest font-black mb-0.5">Moves</div>
          <div className="text-3xl font-black text-factory-ink leading-none">{moves}</div>
        </div>

        <div className="flex-1 px-4 flex flex-col items-center">
            <div className="text-[10px] text-factory-ink font-bold mb-1 tracking-widest uppercase opacity-60">Level {level}</div>
            <div className="w-full h-3 bg-black/5 rounded-full overflow-hidden shadow-inner">
                <div 
                    className="h-full bg-gradient-to-r from-factory-peach to-orange-500 rounded-full transition-all duration-500 shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
                    style={{ width: `${Math.min(100, score / 50)}%` }} 
                />
            </div>
        </div>

        <div className="flex flex-col items-center min-w-[70px]">
          <div className="text-[9px] text-factory-ink/50 uppercase tracking-widest font-black mb-0.5">Score</div>
          <div className="text-3xl font-black text-factory-ink leading-none">{score}</div>
        </div>

      </div>
    </div>
  );
}
