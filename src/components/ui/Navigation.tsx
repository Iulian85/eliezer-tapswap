
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
    <div className="absolute bottom-8 left-0 w-full px-4 z-50 pointer-events-none">
      <div className="bg-white/50 backdrop-blur-2xl rounded-[3rem] p-2.5 flex justify-between items-center shadow-clay-card pointer-events-auto border-2 border-white/60 mx-auto max-w-sm">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-300
                ${isActive 
                    ? 'bg-factory-peach text-white shadow-clay-btn -translate-y-2' 
                    : 'bg-transparent text-factory-ink hover:bg-white/40'
                }
              `}
            >
              <span className={`text-2xl drop-shadow-sm transition-transform ${isActive ? 'scale-100' : 'scale-90 opacity-60'}`}>
                {tab.icon}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
