
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
                <div className="w-full max-w-sm text-center pt-56 flex flex-col items-center">
                    {/* Floating Balance Card - Clay Style */}
                    <div className="clay-panel px-8 py-4 mb-8 flex flex-col items-center">
                        <div className="text-xs text-factory-ink/60 uppercase tracking-widest font-bold mb-1">Balance</div>
                        <div className="text-3xl font-black text-factory-ink">{walletBalance}</div>
                        <div className="text-[10px] font-bold text-factory-peach uppercase">ELZR Tokens</div>
                    </div>

                    <div className="w-full space-y-5 px-4">
                        {/* 3D Main Button */}
                        <button
                            onClick={handleStartGame}
                            disabled={isLoadingAd}
                            className="w-full h-16 rounded-2xl bg-factory-peach font-black text-xl text-white shadow-clay-btn active:shadow-clay-btn-pressed active:translate-y-[4px] transition-all flex items-center justify-center gap-2 border-t border-white/30"
                        >
                            {isLoadingAd ? 'LOADING...' : 'PLAY NOW'}
                        </button>

                        <button
                            onClick={handleClaimReward}
                            disabled={!isRewardAvailable || isLoadingAd}
                            className={`w-full h-14 rounded-2xl font-bold text-lg shadow-clay-btn active:shadow-clay-btn-pressed active:translate-y-[4px] transition-all border-t border-white/30 flex items-center justify-center gap-2 ${
                                isRewardAvailable 
                                ? 'bg-factory-blue-deep text-white' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                            }`}
                        >
                             {isLoadingAd ? '...' : (isRewardAvailable ? 'CLAIM DAILY GIFT' : 'GIFT CLAIMED')}
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
                <div className="flex items-center gap-2 bg-white/40 px-4 py-2 rounded-full backdrop-blur-md border border-white/50 shadow-sm">
                    <div className="w-6 h-6 bg-gradient-to-br from-factory-peach to-orange-500 rounded-full box-shadow-md" />
                    <span className="font-bold text-sm text-factory-ink">{user?.username || 'Player'}</span>
                </div>
            </div>

            <div className="flex-1 w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-500">
                {renderContent()}
            </div>
            
            <Navigation />
        </div>
    </>
  );
}
