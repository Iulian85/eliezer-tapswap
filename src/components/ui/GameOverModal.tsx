
import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import confetti from 'canvas-confetti';
import { tg } from '../../utils/telegram';
import { showAd } from '../../utils/adsgram';

const GameOverModal: React.FC = () => {
  const { gameState, score, level, startGame, walletBalance } = useGameStore();
  const [displayedScore, setDisplayedScore] = useState(0);
  const [displayedReward, setDisplayedReward] = useState(0);
  const [isLoadingAd, setIsLoadingAd] = useState(false);

  const isWin = gameState === 'WON';
  const reward = level * 50;

  useEffect(() => {
    if (isWin) {
        // Trigger confetti
        const duration = 1500;
        const animationEnd = Date.now() + duration;
        const random = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function() {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 50 * (timeLeft / duration);
            confetti({
                particleCount,
                startVelocity: 30,
                spread: 360,
                origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                particleCount,
                startVelocity: 30,
                spread: 360,
                origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);
    }

    // Animate numbers
    if (gameState === 'WON' || gameState === 'GAMEOVER') {
        let start = 0;
        const duration = 1000;
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out quart
            const ease = 1 - Math.pow(1 - progress, 4);
            
            setDisplayedScore(Math.floor(score * ease));
            if (isWin) setDisplayedReward(Math.floor(reward * ease));

            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }
  }, [gameState, score, isWin, reward]);

  if (gameState === 'PLAYING' || gameState === 'MENU') return null;

  const handleShare = () => {
     const message = `I just scored ${score} on Level ${level} in Eliezer Rush! Can you beat me? 🐹💎`;
     const shareUrl = `https://t.me/share/url?url=${encodeURIComponent('https://t.me/EliezerRushBot')}&text=${encodeURIComponent(message)}`;
     tg.openTelegramLink(shareUrl);
  };

  const handleNextAction = async () => {
      if (isLoadingAd) return;
      setIsLoadingAd(true);
      // Show ad before next level or retry
      await showAd();
      setIsLoadingAd(false);
      
      if (isWin) startGame(level + 1);
      else startGame(level);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 animate-fade-in perspective-1000">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/20 p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl transform transition-transform hover:rotate-x-2">
        <div className="mb-4 text-6xl animate-bounce">
            {isWin ? '🎉' : '💀'}
        </div>
        
        <h2 className={`text-4xl font-black mb-2 ${isWin ? 'text-eliezer-gold' : 'text-red-500'}`}>
          {isWin ? 'LEVEL UP!' : 'GAME OVER'}
        </h2>
        
        <p className="text-gray-300 mb-6">
          {isWin ? `You crushed Level ${level}!` : 'Out of moves, fam.'}
        </p>

        <div className="bg-black/30 rounded-xl p-4 mb-6 backdrop-blur-md">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Score</span>
            <span className="font-mono font-bold text-white text-xl">{displayedScore}</span>
          </div>
          {isWin && (
              <div className="flex justify-between text-green-400">
                <span>Reward</span>
                <span className="font-bold text-xl">+{displayedReward} ELZR</span>
              </div>
          )}
        </div>

        <button
          onClick={handleNextAction}
          disabled={isLoadingAd}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform mb-3"
        >
          {isLoadingAd ? 'Loading Ad...' : (isWin ? 'Next Level ➔' : 'Try Again ↻')}
        </button>

        {isWin && (
            <button
                onClick={handleShare}
                className="w-full py-3 bg-white/10 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-transform border border-white/10 hover:bg-white/20"
            >
                ✨ Share Reward
            </button>
        )}
        
        <button 
           onClick={() => useGameStore.setState({ gameState: 'MENU' })}
           className="mt-6 text-gray-500 text-sm underline hover:text-white transition-colors"
        >
            Back to Menu
        </button>
      </div>
    </div>
  );
};

export default GameOverModal;
