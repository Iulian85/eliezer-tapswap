import React, { useState, useEffect } from 'react';
import { Wrench, X, Coins, Zap, Unlock, Trash2 } from 'lucide-react';
import { Inventory, UserStats } from '../src/types';
import { LEVELS } from '../constants';

interface AdminPanelProps {
  telegramId: string | null;
  inventory: Inventory;
  setInventory: React.Dispatch<React.SetStateAction<Inventory>>;
  userStats: UserStats;
  setUserStats: React.Dispatch<React.SetStateAction<UserStats>>;
  currentLevelIndex: number;
  setCurrentLevelIndex: React.Dispatch<React.SetStateAction<number>>;
  setGameState: (state: 'INTRO' | 'PLAYING' | 'WON' | 'LOST') => void;
  persistData: (inv?: Inventory, stats?: UserStats, level?: number) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  telegramId,
  inventory,
  setInventory,
  userStats,
  setUserStats,
  currentLevelIndex,
  setCurrentLevelIndex,
  setGameState,
  persistData
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. Get IDs from Env
    const envIds = import.meta.env.VITE_ADMIN_IDS || "";
    // 2. Parse allowed IDs
    const allowedIds = envIds.split(',').map((id: string) => id.trim());
    
    // 3. Check if current user is admin
    // Also allow 'local_tester' for development
    if (telegramId && (allowedIds.includes(telegramId) || telegramId === 'local_tester')) {
      setIsVisible(true);
    }
  }, [telegramId]);

  if (!isVisible) return null;

  const addResources = () => {
    const newInv = {
      ...inventory,
      coins: inventory.coins + 10000,
      boosters: {
        bomb: inventory.boosters.bomb + 50,
        extraMoves: inventory.boosters.extraMoves + 50,
        shuffle: inventory.boosters.shuffle + 50
      }
    };
    setInventory(newInv);
    persistData(newInv, userStats);
    alert("Added 10k Coins & 50 Boosters");
  };

  const skipLevel = () => {
    const nextLvl = Math.min(currentLevelIndex + 1, LEVELS.length - 1);
    setCurrentLevelIndex(nextLvl);
    setGameState('INTRO');
    persistData(inventory, userStats, nextLvl);
  };

  const unlockAll = () => {
    setCurrentLevelIndex(LEVELS.length - 1);
    const newStats = { ...userStats, totalScore: userStats.totalScore + 1000000 };
    setUserStats(newStats);
    setGameState('INTRO');
    persistData(inventory, newStats, LEVELS.length - 1);
    alert("Unlocked all levels!");
  };

  const winInstant = () => {
    setGameState('WON');
  };

  const resetData = () => {
    if (confirm("ARE YOU SURE? This will wipe all data.")) {
        // Clear both storages to be sure
        localStorage.clear();
        const tg = (window as any).Telegram?.WebApp;
        if (tg && tg.CloudStorage) {
             tg.CloudStorage.removeItems(['ELZR_STATE_V3'], () => {
                 window.location.reload();
             });
        } else {
            window.location.reload();
        }
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="absolute top-2 left-2 z-[100] p-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500 hover:text-white border border-red-500/50 backdrop-blur-md transition-all shadow-[0_0_15px_rgba(239,68,68,0.5)]"
        title="Admin Panel"
      >
        <Wrench size={16} />
      </button>
    );
  }

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-gray-900 border border-red-500/30 w-full max-w-xs rounded-2xl p-4 shadow-2xl relative">
        <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-3 right-3 text-gray-500 hover:text-white"
        >
            <X size={24} />
        </button>

        <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-red-900/30 rounded-lg">
                <Wrench className="text-red-500" size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">Admin Console</h2>
        </div>

        <div className="space-y-2">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Economy</div>
            <button onClick={addResources} className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-3 transition-colors border border-gray-700 group">
                <Coins size={18} className="text-yellow-400 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-white">Add 10k Coins & Boosters</span>
            </button>

            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 mt-4">Progression</div>
            <button onClick={winInstant} className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-3 transition-colors border border-gray-700">
                <Zap size={18} className="text-blue-400" />
                <span className="text-sm font-medium text-white">Win Level Instantly</span>
            </button>
            <button onClick={skipLevel} className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-3 transition-colors border border-gray-700">
                <Unlock size={18} className="text-green-400" />
                <span className="text-sm font-medium text-white">Skip Level</span>
            </button>
            <button onClick={unlockAll} className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-3 transition-colors border border-gray-700">
                <Unlock size={18} className="text-purple-400" />
                <span className="text-sm font-medium text-white">Unlock All Levels</span>
            </button>

            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 mt-4">Danger Zone</div>
            <button onClick={resetData} className="w-full p-3 bg-red-900/20 hover:bg-red-900/40 rounded-lg flex items-center gap-3 transition-colors border border-red-900/50">
                <Trash2 size={18} className="text-red-500" />
                <span className="text-sm font-medium text-red-200">Wipe All Data</span>
            </button>
        </div>
        
        <div className="mt-4 text-center border-t border-white/5 pt-2">
            <div className="text-[10px] text-gray-600 font-mono">User ID: {telegramId}</div>
        </div>
      </div>
    </div>
  );
};
