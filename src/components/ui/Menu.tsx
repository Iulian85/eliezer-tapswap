import { useGameStore } from '../../store/useGameStore';

export default function Menu() {
  const { gameState, initGame, score } = useGameStore();

  if (gameState === 'PLAYING') return null;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
      <div className="bg-slate-900 border border-eliezer-purple/50 p-8 rounded-3xl w-80 text-center shadow-[0_0_50px_rgba(109,40,217,0.5)]">
        
        {gameState === 'GAMEOVER' && (
            <div className="mb-6">
                <div className="text-6xl mb-2">💀</div>
                <h2 className="text-3xl font-black text-white">GAME OVER</h2>
                <p className="text-gray-400">Final Score: {score}</p>
            </div>
        )}

        {gameState === 'MENU' && (
            <div className="mb-8">
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-eliezer-gold to-orange-500 mb-2">
                    ELIEZER RUSH
                </h1>
                <p className="text-gray-300 text-sm">Match the crypto to win the drop!</p>
            </div>
        )}

        <button
          onClick={() => initGame(1)}
          className="w-full py-4 bg-gradient-to-r from-eliezer-purple to-purple-800 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all hover:brightness-110"
        >
          {gameState === 'MENU' ? 'START GAME ▶' : 'TRY AGAIN ↻'}
        </button>

      </div>
    </div>
  );
}