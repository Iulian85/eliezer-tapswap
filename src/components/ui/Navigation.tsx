
import { useGameStore } from '../../store/useGameStore';
import { TabType } from '../../types';

export default function Navigation() {
  const { activeTab, setActiveTab, gameState } = useGameStore();

  // Hide navigation while playing
  if (gameState === 'PLAYING') return null;

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'HOME', label: 'Home', icon: '🏠' },
    { id: 'TASKS', label: 'Tasks', icon: '📋' },
    { id: 'SHOP', label: 'Shop', icon: '🛒' },
    { id: 'FRENS', label: 'Frens', icon: '👥' },
    { id: 'WALLET', label: 'Wallet', icon: '👛' },
  ];

  return (
    <div className="absolute bottom-0 left-0 w-full bg-slate-900/90 backdrop-blur-md border-t border-white/10 pb-6 pt-2 z-50">
      <div className="flex justify-around items-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center w-full py-1 transition-all active:scale-95 ${
              activeTab === tab.id ? 'text-eliezer-gold' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="text-2xl mb-1">{tab.icon}</span>
            <span className="text-[10px] font-bold tracking-wider">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
