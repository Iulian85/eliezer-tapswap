
import React from 'react';
import { Inventory, UserStats } from '../types';
import { SHOP_PRICES } from '../constants';
import { Target, Zap, Coins, X, ShoppingBag, Shuffle, Wallet, History, Clock } from 'lucide-react';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: Inventory;
  onBuy: (item: 'bomb' | 'extraMoves' | 'shuffle', cost: number) => void;
  walletConnected: boolean;
  stats: UserStats;
}

export const ShopModal: React.FC<ShopModalProps> = ({ isOpen, onClose, inventory, onBuy, walletConnected, stats }) => {
  if (!isOpen) return null;

  const buyItem = (item: 'bomb' | 'extraMoves' | 'shuffle', cost: number) => {
    // Coins check removed, now we proceed to trigger TON transaction
    onBuy(item, cost);
  };

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-game-bg border border-white/20 w-full max-w-xs rounded-3xl p-6 shadow-2xl relative transform scale-100 transition-all max-h-[90vh] flex flex-col">
         <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">
            <X size={24} />
         </button>
         
         <div className="text-center mb-6 shrink-0">
            <div className="inline-flex items-center justify-center p-3 bg-blue-600/30 rounded-full mb-2 ring-1 ring-blue-400/50 shadow-lg">
                <ShoppingBag size={24} className="text-blue-200" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-wide">Booster Shop</h2>
            <div className="flex items-center justify-center gap-2 mt-2 text-cyan-300 font-bold bg-black/40 py-1 px-4 rounded-full mx-auto w-fit border border-cyan-500/30">
                <Wallet size={16} /> {walletConnected ? "Wallet Connected" : "Connect Wallet"}
            </div>
         </div>

         <div className="space-y-3 mb-6 shrink-0">
            {/* Bomb Item */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 rounded-full bg-red-600/80 flex items-center justify-center border border-red-400 shadow-lg shrink-0">
                    <Target className="text-white" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-sm">Bomb Booster</div>
                    <div className="text-xs text-gray-400 truncate">Start level with a bomb</div>
                </div>
                <button 
                    onClick={() => buyItem('bomb', SHOP_PRICES.BOMB)}
                    disabled={!walletConnected}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-all active:scale-95 shrink-0
                        ${walletConnected 
                            ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]' 
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                >
                    {SHOP_PRICES.BOMB} TON
                </button>
            </div>

            {/* Moves Item */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 rounded-full bg-blue-600/80 flex items-center justify-center border border-blue-400 shadow-lg shrink-0">
                    <Zap className="text-yellow-300 fill-yellow-300" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-sm">+5 Moves</div>
                    <div className="text-xs text-gray-400 truncate">Extend game time</div>
                </div>
                <button 
                     onClick={() => buyItem('extraMoves', SHOP_PRICES.EXTRA_MOVES)}
                     disabled={!walletConnected}
                     className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-all active:scale-95 shrink-0
                        ${walletConnected
                            ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]' 
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                >
                    {SHOP_PRICES.EXTRA_MOVES} TON
                </button>
            </div>

            {/* Shuffle Item */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 rounded-full bg-green-600/80 flex items-center justify-center border border-green-400 shadow-lg shrink-0">
                    <Shuffle className="text-white" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-sm">Shuffle</div>
                    <div className="text-xs text-gray-400 truncate">Rearrange board</div>
                </div>
                <button 
                     onClick={() => buyItem('shuffle', SHOP_PRICES.SHUFFLE)}
                     disabled={!walletConnected}
                     className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-all active:scale-95 shrink-0
                        ${walletConnected
                            ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]' 
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                >
                    {SHOP_PRICES.SHUFFLE} TON
                </button>
            </div>
         </div>
         
         {/* Purchase History Section */}
         <div className="flex-1 min-h-0 flex flex-col border-t border-white/10 pt-4">
             <div className="flex items-center gap-2 mb-3 px-1">
                 <History size={14} className="text-white/50" />
                 <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Recent Purchases</span>
             </div>
             
             <div className="overflow-y-auto custom-scrollbar flex-1 pr-1">
                 {!stats.purchaseHistory || stats.purchaseHistory.length === 0 ? (
                     <div className="text-center text-white/30 text-xs py-4 italic">No purchases yet.</div>
                 ) : (
                     <div className="space-y-2">
                         {stats.purchaseHistory.map((record) => (
                             <div key={record.id} className="bg-black/20 rounded-lg p-2.5 flex items-center justify-between border border-white/5">
                                 <div>
                                     <div className="text-sm font-bold text-white">{record.item}</div>
                                     <div className="text-[10px] text-white/40 flex items-center gap-1">
                                         <Clock size={8} /> {record.date}
                                     </div>
                                 </div>
                                 <div className="text-xs font-bold text-cyan-300 bg-cyan-900/30 px-2 py-1 rounded border border-cyan-500/20">
                                     {record.cost} TON
                                 </div>
                             </div>
                         ))}
                     </div>
                 )}
             </div>
         </div>

         {!walletConnected && (
             <p className="text-center text-white/40 text-[10px] mt-2 shrink-0">Connect Wallet to purchase boosters.</p>
         )}
      </div>
    </div>
  );
};
