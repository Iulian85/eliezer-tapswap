
import { useGameStore } from '../../store/useGameStore';
import { TabType } from '../../types';

export default function Navigation() {
  const { activeTab, setActiveTab, gameState } = useGameStore();

  if (gameState === 'PLAYING') return null;

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'HOME', label: 'Home', icon: '🏠' },
    { id: 'TASKS', label: 'Tasks', icon: '📋' },
    { id: 'SHOP', label: 'Shop', icon: '🛒' },
    { id: 'FRENS', label: 'Frens', icon: '👥' },
    { id: 'WALLET', label: 'Wallet', icon: '👛' },
  ];

  return (
    <div className="absolute bottom-6 left-0 w-full px-6 z-50 pointer-events-none">
      <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] p-2 flex justify-between items-center shadow-clay-card pointer-events-auto border border-white/50">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300
                ${isActive 
                    ? 'bg-factory-peach shadow-clay-btn translate-y-[-4px]' 
                    : 'bg-transparent text-factory-ink hover:bg-white/30'
                }
              `}
            >
              <span className={`text-2xl drop-shadow-sm transition-transform ${isActive ? 'scale-110' : 'scale-100 opacity-70'}`}>
                {tab.icon}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
