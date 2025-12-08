
import { useGameStore } from '../../store/useGameStore';
import Navigation from './Navigation';
import { ShopTab, TasksTab, FrensTab, WalletTab } from './TabViews';
import { showAd } from '../../utils/adsgram';
import { useState } from 'react';

export default function Menu() {
  const { gameState, initGame, activeTab, claimDailyReward, lastRewardClaimedDate, walletBalance, user } = useGameStore();
  const today = new Date().toDateString();
  const isRewardAvailable = lastRewardClaimedDate !== today;
  const [isLoadingAd, setIsLoadingAd] = useState(false);

  // Don't show menu overlay when playing
  if (gameState === 'PLAYING') return null;

  const handleStartGame = async () => {
    if (isLoadingAd) return;
    setIsLoadingAd(true);
    // Show Ad before starting game
    await showAd();
    setIsLoadingAd(false);
    initGame(1);
  };

  const handleClaimReward = async () => {
    if (isLoadingAd || !isRewardAvailable) return;
    setIsLoadingAd(true);
    // Show Ad before claiming reward
    await showAd();
    setIsLoadingAd(false);
    claimDailyReward();
  };

  // Content Renderer based on Active Tab
  const renderContent = () => {
    switch(activeTab) {
        case 'TASKS': return <TasksTab />;
        case 'SHOP': return <ShopTab />;
        case 'FRENS': return <FrensTab />;
        case 'WALLET': return <WalletTab />;
        case 'HOME':
        default:
            return (
                <div className="w-full max-w-sm text-center pt-52">
                    {/* Title is now rendered in 3D, so we leave space for it */}
                    
                    <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 mb-6 border border-white/30 shadow-lg">
                        <div className="text-xs text-white/80 uppercase tracking-widest mb-1 font-bold">Current Balance</div>
                        <div className="text-3xl font-mono text-white font-black drop-shadow-md">{walletBalance} ELZR</div>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={handleStartGame}
                            disabled={isLoadingAd}
                            className="w-full py-5 bg-gradient-to-r from-eliezer-purple to-blue-600 rounded-2xl font-black text-xl text-white shadow-xl active:scale-95 transition-all hover:brightness-110 flex items-center justify-center gap-2 border border-white/20"
                        >
                            {isLoadingAd ? (
                                <span>⌛ Loading...</span>
                            ) : (
                                <><span>▶</span> START GAME</>
                            )}
                        </button>

                        <button
                            onClick={handleClaimReward}
                            disabled={!isRewardAvailable || isLoadingAd}
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 border border-white/10 ${
                                isRewardAvailable 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 active:scale-95 hover:brightness-110' 
                                : 'bg-white/10 opacity-70 cursor-not-allowed'
                            }`}
                        >
                             {isLoadingAd ? (
                                <span>⌛ Loading...</span>
                            ) : (
                                <><span>🎁</span> {isRewardAvailable ? 'CLAIM REWARD' : 'CLAIMED'}</>
                            )}
                        </button>
                    </div>
                </div>
            );
    }
  };

  return (
    <>
        {/* Updated Background: Transparent to show 3D Scene, but with a slight gradient overlay for readability at bottom */}
        <div className="absolute inset-0 z-40 flex flex-col items-center pt-16 overflow-hidden pb-24 bg-gradient-to-b from-transparent via-transparent to-blue-900/30">
            
            {/* Header (User Info) */}
            <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-50">
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-md border border-white/30 shadow-sm">
                    <div className="w-6 h-6 bg-gradient-to-br from-eliezer-peach to-orange-400 rounded-full" />
                    <span className="font-bold text-sm text-white drop-shadow-sm">{user?.username || 'Player'}</span>
                </div>
            </div>

            {/* Dynamic Content Area */}
            <div className="flex-1 w-full px-6 overflow-y-auto flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-300 scrollbar-hide">
                {renderContent()}
            </div>
            
            {/* Bottom Navigation */}
            <Navigation />
        </div>
    </>
  );
}
