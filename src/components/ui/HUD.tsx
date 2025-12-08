
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
          className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl text-factory-ink font-black shadow-lg active:scale-95 transition-transform flex items-center gap-2"
        >
          <span>⬅</span>
        </button>
      </div>

      {/* Status Bar */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 flex justify-between items-center shadow-clay-card w-full border border-white/60">
        
        <div className="flex flex-col items-center min-w-[60px]">
          <div className="text-[10px] text-factory-ink/60 uppercase tracking-wider font-bold">Moves</div>
          <div className="text-3xl font-black text-factory-ink leading-none">{moves}</div>
        </div>

        <div className="flex-1 px-6 flex flex-col items-center">
            <div className="text-xs text-factory-ink font-bold mb-1.5 tracking-widest uppercase opacity-70">Level {level}</div>
            <div className="w-full h-3 bg-black/5 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-factory-peach to-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, score / 50)}%` }} 
                />
            </div>
        </div>

        <div className="flex flex-col items-center min-w-[60px]">
          <div className="text-[10px] text-factory-ink/60 uppercase tracking-wider font-bold">Score</div>
          <div className="text-3xl font-black text-factory-ink leading-none">{score}</div>
        </div>

      </div>
    </div>
  );
}
