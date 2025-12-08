
import { useGameStore } from '../../store/useGameStore';
import { TabType } from '../../types';

export default function Navigation() {
  const { activeTab, setActiveTab, gameState } = useGameStore();

  if (gameState === 'PLAYING') return null;

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'HOME', label: 'Play', icon: '🏠' },
    { id: 'TASKS', label: 'Tasks', icon: '📋' },
    { id: 'SHOP', label: 'Shop', icon: '🛍️' },
    { id: 'FRENS', label: 'Frens', icon: '👥' },
    { id: 'WALLET', label: 'Wallet', icon: '👛' },
  ];

  return (
    <div className="absolute bottom-6 left-0 w-full px-4 z-50 pointer-events-none">
      <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-2 flex justify-between items-center shadow-lg pointer-events-auto max-w-sm mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl transition-all duration-300
                ${isActive 
                    ? 'bg-ref-orange text-white shadow-clay-btn scale-105' 
                    : 'text-ref-text hover:bg-white/40'
                }
              `}
            >
              <span className="text-xl mb-0.5">{tab.icon}</span>
              {isActive && <span className="text-[9px] font-bold uppercase">{tab.label}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
