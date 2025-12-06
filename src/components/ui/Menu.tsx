
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
                <div className="w-full max-w-sm text-center">
                    <div className="mb-8">
                        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-eliezer-gold to-orange-500 mb-2 drop-shadow-sm">
                            ELIEZER<br/>RUSH
                        </h1>
                        <p className="text-gray-400 text-sm">The Premium Match-3 Crypto Game</p>
                    </div>

                    <div className="bg-slate-800/80 rounded-2xl p-4 mb-6 border border-white/10">
                        <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Current Balance</div>
                        <div className="text-3xl font-mono text-white font-bold">{walletBalance} ELZR</div>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={handleStartGame}
                            disabled={isLoadingAd}
                            className="w-full py-5 bg-gradient-to-r from-eliezer-purple to-purple-700 rounded-2xl font-black text-xl text-white shadow-xl shadow-purple-900/30 active:scale-95 transition-all hover:brightness-110 flex items-center justify-center gap-2"
                        >
                            {isLoadingAd ? (
                                <span>⌛ Loading Ad...</span>
                            ) : (
                                <><span>▶</span> START GAME</>
                            )}
                        </button>

                        <button
                            onClick={handleClaimReward}
                            disabled={!isRewardAvailable || isLoadingAd}
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                                isRewardAvailable 
                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 active:scale-95 hover:brightness-110' 
                                : 'bg-slate-700 opacity-50 cursor-not-allowed'
                            }`}
                        >
                             {isLoadingAd ? (
                                <span>⌛ Loading Ad...</span>
                            ) : (
                                <><span>🎁</span> {isRewardAvailable ? 'CLAIM DAILY REWARD (+100)' : 'REWARD CLAIMED'}</>
                            )}
                        </button>
                    </div>
                </div>
            );
    }
  };

  return (
    <>
        <div className="absolute inset-0 z-40 flex flex-col items-center pt-16 bg-slate-950 text-white overflow-hidden pb-24">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-eliezer-purple/20 to-transparent pointer-events-none" />
            
            {/* Header (User Info) */}
            <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-50">
                <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                    <div className="w-6 h-6 bg-gradient-to-br from-eliezer-gold to-orange-500 rounded-full" />
                    <span className="font-bold text-sm">{user?.username || 'Player'}</span>
                </div>
            </div>

            {/* Dynamic Content Area */}
            <div className="flex-1 w-full px-6 overflow-y-auto flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-300">
                {renderContent()}
            </div>
            
            {/* Bottom Navigation */}
            <Navigation />
        </div>
    </>
  );
}
