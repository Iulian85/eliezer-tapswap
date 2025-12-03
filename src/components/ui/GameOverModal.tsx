import React from 'react';
import { useGameStore } from '../../store/useGameStore';

const GameOverModal: React.FC = () => {
  const { gameState, score, level, startGame, walletBalance } = useGameStore();

  if (gameState === 'PLAYING' || gameState === 'MENU') return null;

  const isWin = gameState === 'WON';

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 animate-fade-in">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/20 p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl transform transition-all scale-100">
        <div className="mb-4 text-6xl">
            {isWin ? '🎉' : '💀'}
        </div>
        
        <h2 className={`text-4xl font-black mb-2 ${isWin ? 'text-eliezer-gold' : 'text-red-500'}`}>
          {isWin ? 'LEVEL UP!' : 'GAME OVER'}
        </h2>
        
        <p className="text-gray-300 mb-6">
          {isWin ? `You crushed Level ${level}!` : 'Out of moves, fam.'}
        </p>

        <div className="bg-black/30 rounded-xl p-4 mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Score</span>
            <span className="font-mono font-bold">{score}</span>
          </div>
          {isWin && (
              <div className="flex justify-between text-green-400">
                <span>Reward</span>
                <span className="font-bold">+{level * 50} ELZR</span>
              </div>
          )}
        </div>

        <button
          onClick={() => {
              if (isWin) startGame(level + 1);
              else startGame(level);
          }}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform"
        >
          {isWin ? 'Next Level ➔' : 'Try Again ↻'}
        </button>
        
        <button 
           onClick={() => useGameStore.setState({ gameState: 'MENU' })}
           className="mt-4 text-gray-500 text-sm underline"
        >
            Back to Menu
        </button>
      </div>
    </div>
  );
};

export default GameOverModal;