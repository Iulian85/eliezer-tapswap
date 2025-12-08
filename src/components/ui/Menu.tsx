import { useGameStore } from '../../store/useGameStore';
import Navigation from './Navigation';
import { ShopTab, TasksTab, FrensTab, WalletTab } from './TabViews';
import { showAd } from '../../utils/adsgram';
import { useState } from 'react';

export default function Menu() {
  const { gameState, initGame, activeTab, walletBalance, user } = useGameStore();
  const [isLoadingAd, setIsLoadingAd] = useState(false);

  if (gameState === 'PLAYING') return null;

  const handleStartGame = async () => {
    if (isLoadingAd) return;
    setIsLoadingAd(true);
    await showAd();
    setIsLoadingAd(false);
    initGame(1);
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
                <div className="w-full h-full flex flex-col items-center justify-between pb-32 pt-10 px-6 animate-in fade-in duration-700">
                    
                    {/* The 3D Scene is behind this, showing the Logo */}
                    <div className="flex-1 w-full" /> 

                    {/* Bottom Action Area */}
                    <div className="w-full max-w-sm flex flex-col gap-4">
                        
                        {/* Play Button - Big Orange Pill */}
                        <button
                            onClick={handleStartGame}
                            disabled={isLoadingAd}
                            className="btn-primary-3d w-full h-16 text-xl font-black tracking-wide shadow-clay-btn flex items-center justify-center gap-2 group"
                        >
                            {isLoadingAd ? (
                                <span className="animate-pulse">LOADING...</span>
                            ) : (
                                <>
                                    <span className="text-2xl group-hover:scale-110 transition-transform">▶</span>
                                    <span>PLAY</span>
                                </>
                            )}
                        </button>
                        
                        {/* Balance Pill */}
                        <div className="glass-pill px-6 py-3 flex justify-between items-center w-full">
                             <div className="flex items-center gap-2">
                                <span className="text-xl">🐹</span>
                                <span className="font-bold text-ref-text text-sm">Balance</span>
                             </div>
                             <span className="font-black text-xl text-ref-text tracking-tight">
                                {walletBalance.toLocaleString()}
                             </span>
                        </div>

                    </div>
                </div>
            );
    }
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center overflow-hidden">
        {/* Top Header Row */}
        <div className="absolute top-0 left-0 w-full p-6 z-50 flex justify-between items-center">
            {activeTab !== 'HOME' && (
                <button 
                    onClick={() => useGameStore.getState().setActiveTab('HOME')}
                    className="w-10 h-10 glass-pill flex items-center justify-center text-lg active:scale-95 transition-transform"
                >
                    ⬅
                </button>
            )}
            
            {activeTab === 'HOME' && <div />} {/* Spacer */}

            <button className="w-10 h-10 glass-pill flex items-center justify-center text-lg active:scale-95 transition-transform">
                ⋮
            </button>
        </div>

        <div className="w-full h-full relative">
            {renderContent()}
        </div>
        
        {/* Navigation is only shown on HOME technically in the reference, but we keep it for usability or hide it if viewing sub-tabs? 
            Reference implies sub-screens are full screen overlays. Let's keep Nav for easy access but style it soft.
        */}
        <Navigation />
    </div>
  );
}