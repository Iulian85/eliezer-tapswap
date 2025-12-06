
import { useGameStore } from '../../store/useGameStore';

export default function HUD() {
  const { score, moves, level, gameState } = useGameStore();

  if (gameState === 'MENU') return null;

  return (
    <div className="absolute top-0 left-0 w-full p-2 pt-4 pointer-events-auto z-10">
      <div className="flex items-center gap-2 mx-2">
          
          {/* Back / Quit Button */}
          <button 
            onClick={() => useGameStore.setState({ gameState: 'MENU' })}
            className="w-10 h-10 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"
          >
            ⬅
          </button>

          {/* Main Stats Bar */}
          <div className="flex-1 bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-2 flex justify-between items-center shadow-2xl">
            
            <div className="flex flex-col items-center min-w-[50px]">
              <div className="text-[9px] text-gray-400 uppercase tracking-wider font-bold">Moves</div>
              <div className="text-xl font-black text-white leading-none">{moves}</div>
            </div>

            <div className="flex-1 px-3 flex flex-col items-center">
                <div className="text-[9px] text-eliezer-gold uppercase font-bold mb-1 tracking-widest">Level {level}</div>
                <div className="w-full h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-eliezer-gold to-orange-500 transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                        style={{ width: `${Math.min(100, score / 50)}%` }} 
                    />
                </div>
            </div>

            <div className="flex flex-col items-center min-w-[50px]">
              <div className="text-[9px] text-gray-400 uppercase tracking-wider font-bold">Score</div>
              <div className="text-xl font-black text-white leading-none">{score}</div>
            </div>

          </div>
      </div>
    </div>
  );
}
