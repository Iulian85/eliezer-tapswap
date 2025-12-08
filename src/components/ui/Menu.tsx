
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

  if (gameState === 'PLAYING') return null;

  const handleStartGame = async () => {
    if (isLoadingAd) return;
    setIsLoadingAd(true);
    await showAd();
    setIsLoadingAd(false);
    initGame(1);
  };

  const handleClaimReward = async () => {
    if (isLoadingAd || !isRewardAvailable) return;
    setIsLoadingAd(true);
    await showAd();
    setIsLoadingAd(false);
    claimDailyReward();
  };

  const renderContent = () => {
    switch(activeTab) {
        case 'TASKS': return <TasksTab />;
        case 'SHOP': return <ShopTab />;
        case 'FRENS': return <FrensTab />;
        case 'WALLET': return <WalletTab />;
        case 'HOME':
        default:
            return (
                <div className="w-full max-w-sm text-center pt-56 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Floating Balance Card - Clay Style */}
                    <div className="clay-panel px-10 py-5 mb-10 flex flex-col items-center transform hover:scale-105 transition-transform duration-300">
                        <div className="text-[10px] text-factory-ink/50 uppercase tracking-[0.2em] font-black mb-1">Total Balance</div>
                        <div className="text-4xl font-black text-factory-ink tracking-tight drop-shadow-sm">{walletBalance.toLocaleString()}</div>
                        <div className="text-[10px] font-bold text-factory-peach uppercase tracking-wider mt-1">ELZR Tokens</div>
                    </div>

                    <div className="w-full space-y-4 px-6">
                        {/* 3D Main Button - The "Big Peach Button" */}
                        <button
                            onClick={handleStartGame}
                            disabled={isLoadingAd}
                            className="w-full h-18 py-5 rounded-3xl bg-factory-peach font-black text-2xl text-white shadow-clay-btn active:shadow-clay-btn-pressed active:translate-y-[6px] transition-all flex items-center justify-center gap-3 border-t-2 border-white/20 relative overflow-hidden group"
                        >
                            <span className="relative z-10">{isLoadingAd ? 'LOADING...' : 'PLAY NOW'}</span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </button>

                        <button
                            onClick={handleClaimReward}
                            disabled={!isRewardAvailable || isLoadingAd}
                            className={`w-full h-14 rounded-2xl font-bold text-lg shadow-clay-btn active:shadow-clay-btn-pressed active:translate-y-[4px] transition-all border-t border-white/20 flex items-center justify-center gap-2 ${
                                isRewardAvailable 
                                ? 'bg-factory-blue-deep text-white' 
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                            }`}
                        >
                             {isLoadingAd ? '...' : (isRewardAvailable ? '🎁 CLAIM GIFT' : '✅ GIFT CLAIMED')}
                        </button>
                    </div>
                </div>
            );
    }
  };

  return (
    <>
        <div className="absolute inset-0 z-40 flex flex-col items-center overflow-hidden pb-32">
            
            {/* Header */}
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
                <div className="flex items-center gap-2 bg-white/60 px-5 py-2.5 rounded-full backdrop-blur-xl border border-white/60 shadow-lg">
                    <div className="w-6 h-6 bg-gradient-to-br from-factory-peach to-orange-500 rounded-full shadow-inner" />
                    <span className="font-bold text-sm text-factory-ink">{user?.username || 'Player'}</span>
                </div>
            </div>

            <div className="flex-1 w-full flex flex-col items-center">
                {renderContent()}
            </div>
            
            <Navigation />
        </div>
    </>
  );
}
