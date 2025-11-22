import React from 'react';
import { Inventory } from '../types';
import { SHOP_PRICES } from '../constants';
import { Target, Zap, Coins, X, ShoppingBag, Shuffle } from 'lucide-react';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: Inventory;
  onBuy: (item: 'bomb' | 'extraMoves' | 'shuffle', cost: number) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ isOpen, onClose, inventory, onBuy }) => {
  if (!isOpen) return null;

  const buyItem = (item: 'bomb' | 'extraMoves' | 'shuffle', cost: number) => {
    if (inventory.coins >= cost) {
      onBuy(item, cost);
    }
  };

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-game-bg border border-white/20 w-full max-w-xs rounded-3xl p-6 shadow-2xl relative transform scale-100 transition-all">
         <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">
            <X size={24} />
         </button>
         
         <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center p-3 bg-purple-600/30 rounded-full mb-2 ring-1 ring-purple-400/50 shadow-lg">
                <ShoppingBag size={24} className="text-purple-200" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-wide">Booster Shop</h2>
            <div className="flex items-center justify-center gap-2 mt-2 text-yellow-400 font-bold bg-black/40 py-1 px-4 rounded-full mx-auto w-fit border border-white/5">
                <Coins size={16} /> {inventory.coins}
            </div>
         </div>

         <div className="space-y-3">
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
                    disabled={inventory.coins < SHOP_PRICES.BOMB}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-all active:scale-95 shrink-0
                        ${inventory.coins >= SHOP_PRICES.BOMB 
                            ? 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.3)]' 
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                >
                    <Coins size={12} /> {SHOP_PRICES.BOMB}
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
                     disabled={inventory.coins < SHOP_PRICES.EXTRA_MOVES}
                     className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-all active:scale-95 shrink-0
                        ${inventory.coins >= SHOP_PRICES.EXTRA_MOVES
                            ? 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.3)]' 
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                >
                    <Coins size={12} /> {SHOP_PRICES.EXTRA_MOVES}
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
                     disabled={inventory.coins < SHOP_PRICES.SHUFFLE}
                     className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-all active:scale-95 shrink-0
                        ${inventory.coins >= SHOP_PRICES.SHUFFLE
                            ? 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.3)]' 
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                >
                    <Coins size={12} /> {SHOP_PRICES.SHUFFLE}
                </button>
            </div>
         </div>
      </div>
    </div>
  );
};