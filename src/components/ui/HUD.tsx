import { useGameStore } from '../../store/useGameStore';

export default function HUD() {
  const { score, moves, level, gameState } = useGameStore();

  if (gameState === 'MENU') return null;

  return (
    <div className="absolute top-0 left-0 w-full p-4 pointer-events-none z-10">
      <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-4 flex justify-between items-center shadow-xl">
        
        <div className="text-center">
          <div className="text-xs text-gray-400 uppercase tracking-wider font-bold">Moves</div>
          <div className="text-3xl font-mono text-white drop-shadow-lg">{moves}</div>
        </div>

        <div className="text-center border-l border-r border-white/10 px-6">
            <div className="text-xs text-eliezer-gold uppercase font-bold mb-1">Level {level}</div>
            <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-eliezer-gold to-orange-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, score / 50)}%` }} 
                />
            </div>
        </div>

        <div className="text-center">
          <div className="text-xs text-gray-400 uppercase tracking-wider font-bold">Score</div>
          <div className="text-2xl font-mono text-white">{score}</div>
        </div>

      </div>
    </div>
  );
}