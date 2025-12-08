
import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import confetti from 'canvas-confetti';
import { tg } from '../../utils/telegram';
import { showAd } from '../../utils/adsgram';

const GameOverModal: React.FC = () => {
  const { gameState, score, level, startGame } = useGameStore();
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
                origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 },
                colors: ['#FF9F68', '#A5C9FF', '#FFFFFF'] // Updated confetti colors to match theme
            });
            confetti({
                particleCount,
                startVelocity: 30,
                spread: 360,
                origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 },
                colors: ['#FF9F68', '#A5C9FF', '#FFFFFF']
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
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-ref-blue-end/60 backdrop-blur-sm p-6 animate-fade-in perspective-1000">
      
      {/* Premium Glass Card */}
      <div className="glass-panel w-full max-w-sm p-8 text-center transform transition-transform hover:scale-[1.02] shadow-2xl relative overflow-hidden">
        
        {/* Decorative background glow inside card */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-ref-orange/20 blur-3xl rounded-full -z-10" />

        <div className="mb-6 text-7xl animate-bounce drop-shadow-md">
            {isWin ? '🏆' : '💔'}
        </div>
        
        <h2 className="text-4xl font-black mb-2 text-ref-text tracking-tight">
          {isWin ? 'LEVEL UP!' : 'GAME OVER'}
        </h2>
        
        <p className="text-ref-text-light font-bold mb-8">
          {isWin ? `You crushed Level ${level}!` : 'Don\'t give up! Try again.'}
        </p>

        {/* Stats Container - Soft White Inset */}
        <div className="bg-white/50 rounded-2xl p-5 mb-8 border border-white/60 shadow-inner">
          <div className="flex justify-between items-center mb-3">
            <span className="text-ref-text-light font-bold text-sm uppercase tracking-wider">Score</span>
            <span className="font-black text-ref-text text-2xl">{displayedScore}</span>
          </div>
          {isWin && (
              <div className="flex justify-between items-center">
                <span className="text-ref-text-light font-bold text-sm uppercase tracking-wider">Reward</span>
                <span className="font-black text-ref-orange text-2xl">+{displayedReward} ELZR</span>
              </div>
          )}
        </div>

        <button
          onClick={handleNextAction}
          disabled={isLoadingAd}
          className="btn-primary-3d w-full py-4 text-xl font-black tracking-wide shadow-clay-btn mb-4 flex items-center justify-center gap-2"
        >
          {isLoadingAd ? 'Loading...' : (isWin ? 'Next Level ➔' : 'Try Again ↻')}
        </button>

        {isWin && (
            <button
                onClick={handleShare}
                className="w-full py-3 bg-white/60 hover:bg-white/80 rounded-2xl font-bold text-ref-text shadow-sm active:scale-95 transition-all border border-white/50 flex items-center justify-center gap-2"
            >
                <span>✨</span> Share Reward
            </button>
        )}
        
        <button 
           onClick={() => useGameStore.setState({ gameState: 'MENU' })}
           className="mt-6 text-ref-text-light text-sm font-bold hover:text-ref-text transition-colors"
        >
            Back to Menu
        </button>
      </div>
    </div>
  );
};

export default GameOverModal;
