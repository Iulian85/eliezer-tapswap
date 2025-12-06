
import { useGameStore } from '../../store/useGameStore';

export default function HUD() {
  const { score, moves, level, gameState, quitGame } = useGameStore();

  if (gameState === 'MENU') return null;

  return (
    <div className="absolute top-0 left-0 w-full pointer-events-none z-10 flex flex-col p-4">
      
      {/* Top Row: Back Button */}
      <div className="flex justify-start mb-2 pointer-events-auto">
        <button 
          onClick={quitGame}
          className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 active:scale-95 transition-transform"
        >
          <span className="text-white text-lg font-bold">⬅</span>
          <span className="text-white text-xs font-bold uppercase tracking-wider">Back</span>
        </button>
      </div>

      {/* Second Row: Status Bar (Moves, Level, Score) */}
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-3 flex justify-between items-center shadow-2xl w-full">
        
        <div className="flex flex-col items-center min-w-[60px]">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Moves</div>
          <div className="text-2xl font-black text-white leading-none">{moves}</div>
        </div>

        <div className="flex-1 px-4 flex flex-col items-center">
            <div className="text-[10px] text-eliezer-gold uppercase font-bold mb-1 tracking-widest">Level {level}</div>
            <div className="w-full h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-eliezer-gold to-orange-500 transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                    style={{ width: `${Math.min(100, score / 50)}%` }} 
                />
            </div>
        </div>

        <div className="flex flex-col items-center min-w-[60px]">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Score</div>
          <div className="text-2xl font-black text-white leading-none">{score}</div>
        </div>

      </div>
    </div>
  );
}
