
import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { tg } from '../../utils/telegram';

interface PropsWithChildren {
    children: React.ReactNode;
}

const SectionTitle: React.FC<PropsWithChildren> = ({ children }) => (
    <h2 className="text-3xl font-black text-ref-text drop-shadow-sm mb-6 text-center tracking-wide">{children}</h2>
);

// --- 3D CLAY ICONS ---
// These SVGs are hand-coded to simulate 3D matte plastic objects with lighting
const ClayIcon: React.FC<{ type: string; className?: string }> = ({ type, className = "w-20 h-20" }) => {
    
    // Common Definitions for 3D Clay Effect (Gradients & Filters)
    const defs = (
        <defs>
            {/* Soft Top-Left Light Source */}
            <linearGradient id="highlight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="white" stopOpacity="0.6" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            
            {/* Deep Bottom-Right Shadow for Volume */}
            <linearGradient id="shadow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="black" stopOpacity="0" />
                <stop offset="100%" stopColor="black" stopOpacity="0.3" />
            </linearGradient>
            
            {/* Specific Material Gradients */}
            <radialGradient id="grad-bomb" cx="30%" cy="30%" r="80%">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="100%" stopColor="#1e293b" />
            </radialGradient>
            
            <linearGradient id="grad-shuffle" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFB085" />
                <stop offset="100%" stopColor="#FF844B" />
            </linearGradient>
            
            <linearGradient id="grad-bolt" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FCD34D" />
                <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>

            <linearGradient id="grad-shield" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6EE7B7" />
                <stop offset="100%" stopColor="#10B981" />
            </linearGradient>

            {/* Drop Shadow Filter */}
            <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                <feOffset dx="2" dy="4" result="offsetblur" />
                <feComponentTransfer>
                    <feFuncA type="linear" slope="0.3" />
                </feComponentTransfer>
                <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>
    );

    const renderIcon = () => {
        switch(type) {
            case 'bomb':
                return (
                    <g filter="url(#dropShadow)">
                        {/* Bomb Body */}
                        <circle cx="50" cy="55" r="35" fill="url(#grad-bomb)" />
                        {/* Highlight */}
                        <circle cx="50" cy="55" r="35" fill="url(#highlight)" />
                        {/* Wick Cap */}
                        <rect x="42" y="15" width="16" height="10" rx="2" fill="#94A3B8" />
                        {/* Wick */}
                        <path d="M50 15 Q50 5 60 5" stroke="#475569" strokeWidth="3" fill="none" />
                        {/* Spark */}
                        <path d="M60 5 L62 2 M60 5 L64 5 M60 5 L62 8" stroke="#FCD34D" strokeWidth="2" />
                    </g>
                );
            case 'shuffle':
                return (
                    <g filter="url(#dropShadow)">
                        {/* Top Arrow */}
                        <path d="M20 40 C30 40, 50 40, 60 25 L55 20 M60 25 L55 30" stroke="url(#grad-shuffle)" strokeWidth="12" strokeLinecap="round" fill="none" />
                        {/* Bottom Arrow */}
                        <path d="M20 60 C30 60, 50 60, 60 75 L55 70 M60 75 L55 80" stroke="url(#grad-shuffle)" strokeWidth="12" strokeLinecap="round" fill="none" />
                        {/* Crossing Lines (Simulated) */}
                        <path d="M25 40 Q40 40 45 50" stroke="url(#grad-shuffle)" strokeWidth="12" strokeLinecap="round" fill="none" />
                         <path d="M25 60 Q40 60 45 50" stroke="url(#grad-shuffle)" strokeWidth="12" strokeLinecap="round" fill="none" />
                    </g>
                );
            case 'extraMoves':
                return (
                    <g filter="url(#dropShadow)">
                         <path 
                            d="M55 10 L30 50 L50 50 L45 90 L70 50 L50 50 L55 10 Z" 
                            fill="url(#grad-bolt)" 
                            strokeLinejoin="round"
                        />
                         <path 
                            d="M55 10 L30 50 L50 50 L45 90 L70 50 L50 50 L55 10 Z" 
                            fill="url(#highlight)" 
                        />
                    </g>
                );
             case 'shield':
                return (
                    <g filter="url(#dropShadow)">
                        <path 
                            d="M50 10 C20 10, 20 35, 20 35 C20 65, 50 90, 50 90 C50 90, 80 65, 80 35 C80 35, 80 10, 50 10 Z" 
                            fill="url(#grad-shield)" 
                        />
                        <path 
                            d="M50 15 C25 15, 25 38, 25 38 C25 62, 50 82, 50 82" 
                            fill="none" 
                            stroke="white" 
                            strokeWidth="3" 
                            strokeOpacity="0.3"
                        />
                         <path 
                            d="M50 10 C20 10, 20 35, 20 35 C20 65, 50 90, 50 90 C50 90, 80 65, 80 35 C80 35, 80 10, 50 10 Z" 
                            fill="url(#highlight)" 
                        />
                    </g>
                );
            default: return null;
        }
    }

    return (
        <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
            {defs}
            {renderIcon()}
        </svg>
    );
};

// --- SHOP TAB ---
export const ShopTab = () => {
    const { buyBooster, boosters } = useGameStore();

    // Configuration for the 3D items
    const shopItems = [
        { 
            id: 'bomb', 
            label: 'Bomb', 
            type: 'bomb', // Mapped to ClayIcon
            price: 500, 
            count: boosters.bomb,
            bg: 'bg-white/60'
        },
        { 
            id: 'shuffle', 
            label: 'Shuffle', 
            type: 'shuffle',
            price: 300, 
            count: boosters.shuffle,
            bg: 'bg-white/60'
        },
        { 
            id: 'extraMoves', 
            label: '+5 Moves', 
            type: 'extraMoves',
            price: 800, 
            count: boosters.extraMoves,
            bg: 'bg-white/60'
        },
        { 
            id: 'shield', 
            label: 'Shield', 
            type: 'shield',
            price: 1000, 
            count: 0,
            bg: 'bg-white/60'
        },
    ];

    return (
        <div className="w-full h-full pt-20 px-6 pb-32 overflow-y-auto">
            <SectionTitle>Shop</SectionTitle>
            
            <div className="grid grid-cols-2 gap-4">
                {shopItems.map((item) => (
                    <div 
                        key={item.id} 
                        className={`group relative clay-model ${item.bg} backdrop-blur-md p-4 flex flex-col items-center gap-3 transition-transform hover:scale-[1.02]`}
                    >
                        {/* 3D Icon Area */}
                        <div className="w-full flex items-center justify-center py-2 filter drop-shadow-md transition-transform group-hover:-translate-y-1">
                            <ClayIcon type={item.type} className="w-24 h-24" />
                        </div>
                        
                        <div className="text-center w-full z-10">
                            <div className="font-black text-lg text-ref-text mb-1">{item.label}</div>
                            <div className="text-xs font-bold text-ref-text-light uppercase tracking-wider mb-3">
                                {item.price} ELZR
                            </div>
                            
                            <button 
                                onClick={() => buyBooster(item.id as any, item.price)}
                                className="w-full py-3 bg-white rounded-xl text-sm font-black text-ref-text shadow-clay-btn active:scale-95 transition-all flex items-center justify-center gap-1"
                            >
                                <span className="text-ref-orange">●</span> BUY
                            </button>
                        </div>

                        {/* Inventory Badge */}
                        {item.count !== undefined && item.count > 0 && (
                            <div className="absolute top-3 right-3 w-7 h-7 bg-ref-orange text-white rounded-full flex items-center justify-center text-xs font-black shadow-lg border-2 border-white">
                                {item.count}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- TASKS TAB ---
export const TasksTab = () => {
    const tasks = [
        { title: 'Join Channel', reward: 500, icon: '📢', done: true, color: 'from-blue-400 to-blue-500' },
        { title: 'Follow X', reward: 300, icon: '✖️', done: false, color: 'from-gray-700 to-gray-900' },
        { title: 'Invite 3 Frens', reward: 1000, icon: '👥', done: false, color: 'from-indigo-400 to-indigo-500' },
        { title: 'Connect Wallet', reward: 2000, icon: '👛', done: false, color: 'from-orange-400 to-orange-500' },
    ];

    return (
        <div className="w-full h-full pt-20 px-6 pb-32 overflow-y-auto">
            <SectionTitle>Tasks</SectionTitle>
            <div className="space-y-4">
                {tasks.map((task, i) => (
                    <div key={i} className="group relative">
                        {/* The "Slab" Background */}
                        <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[2rem] p-4 flex items-center justify-between shadow-clay-card transform transition-transform active:scale-[0.98]">
                            
                            <div className="flex items-center gap-4">
                                {/* 3D Sphere Icon */}
                                <div className={`clay-sphere w-14 h-14 bg-gradient-to-br ${task.color} flex items-center justify-center text-2xl text-white shadow-lg`}>
                                    <span className="drop-shadow-md">{task.icon}</span>
                                </div>
                                
                                <div className="flex flex-col">
                                    <div className="font-black text-ref-text text-lg leading-tight">{task.title}</div>
                                    <div className="inline-flex items-center gap-1 mt-1">
                                        <div className="w-4 h-4 bg-ref-orange rounded-full flex items-center justify-center text-[8px] text-white font-bold">●</div>
                                        <span className="text-sm font-bold text-ref-text-light">+{task.reward}</span>
                                    </div>
                                </div>
                            </div>

                            {task.done ? (
                                 <div className="w-10 h-10 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-xl shadow-inner border border-green-200">
                                    ✓
                                 </div>
                            ) : (
                                 <button className="bg-white text-ref-text w-12 h-10 rounded-xl flex items-center justify-center font-black shadow-sm border border-gray-100 group-hover:bg-gray-50 transition-colors">
                                     GO
                                 </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- FRENS TAB ---
export const FrensTab = () => {
    const { user, frens } = useGameStore();
    const inviteLink = `https://t.me/EliezerRushBot?start=${user?.id || 'r'}`;

    const handleInvite = () => {
        const message = "Play Eliezer Rush with me! 🐹";
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(message)}`;
        tg.openTelegramLink(shareUrl);
    };

    return (
        <div className="w-full h-full pt-20 px-6 pb-32 flex flex-col">
            <SectionTitle>Friends</SectionTitle>
            
            {/* 3D Invite Card */}
            <div className="clay-model bg-gradient-to-br from-white to-blue-50 p-6 flex flex-col items-center text-center relative overflow-hidden mb-6">
                
                {/* 3D Coin Floating */}
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center text-5xl shadow-[0_15px_30px_rgba(234,179,8,0.4),inset_0_-5px_10px_rgba(0,0,0,0.1),inset_0_5px_10px_rgba(255,255,255,0.5)] mb-4 animate-float border-4 border-yellow-200">
                    💰
                </div>
                
                <h3 className="font-black text-2xl text-ref-text mb-1">Invite Friends</h3>
                <p className="text-sm text-ref-text-light font-bold mb-6">Earn 10% from their play forever</p>
                
                <button 
                    onClick={handleInvite}
                    className="btn-primary-3d w-full py-4 text-lg font-black tracking-wide shadow-clay-btn"
                >
                    INVITE FRIEND
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
                <h4 className="text-xs font-black text-ref-text uppercase tracking-widest ml-2 opacity-50 mb-2">Your Squad</h4>
                {frens.map((fren, i) => (
                    <div key={fren.id} className="bg-white/60 border border-white rounded-2xl p-3 flex items-center justify-between shadow-sm">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center text-sm font-black text-indigo-500 shadow-inner">
                                {fren.name.charAt(0)}
                            </div>
                            <span className="font-bold text-ref-text text-sm">{fren.name}</span>
                         </div>
                         <div className="bg-orange-50 px-3 py-1 rounded-lg border border-orange-100">
                            <span className="font-bold text-ref-orange text-sm">+{fren.score}</span>
                         </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- WALLET TAB ---
export const WalletTab = () => {
    const { walletBalance } = useGameStore();
    return (
        <div className="w-full h-full pt-20 px-6 pb-32">
            <SectionTitle>Wallet</SectionTitle>
            
            {/* 3D Wallet Card */}
            <div className="clay-model bg-[#1e293b] p-8 flex flex-col items-center justify-center text-white mb-8 shadow-2xl relative overflow-hidden">
                {/* Abstract geometric BG */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
                
                <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-3 z-10">Total Balance</div>
                <div className="text-5xl font-black mb-4 tracking-tighter text-white z-10 drop-shadow-lg">
                    {walletBalance.toLocaleString()}
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full flex items-center gap-2 z-10">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_#4ade80]" />
                    <span className="text-xs font-bold text-gray-200">$ELZR Token</span>
                </div>
            </div>

            <div className="space-y-4">
                 <div className="bg-white/60 border border-white rounded-3xl p-5 flex items-center justify-between shadow-sm hover:bg-white/80 transition-colors">
                    <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-2xl shadow-inner text-green-600">
                            🔗
                         </div>
                         <div className="flex flex-col">
                             <span className="font-black text-ref-text text-sm">Connect Wallet</span>
                             <span className="text-xs text-ref-text-light font-bold">TON Network</span>
                         </div>
                    </div>
                    <button className="bg-ref-text text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-clay-btn active:scale-95 transition-transform">
                        Connect
                    </button>
                 </div>
                 
                 <div className="bg-white/60 border border-white rounded-3xl p-5 flex items-center justify-between shadow-sm opacity-70">
                    <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl shadow-inner text-blue-500">
                            🏦
                         </div>
                         <div className="flex flex-col">
                             <span className="font-black text-ref-text text-sm">Withdraw</span>
                             <span className="text-xs text-ref-text-light font-bold">Coming Soon</span>
                         </div>
                    </div>
                    <button className="bg-gray-100 text-gray-400 px-5 py-2.5 rounded-xl text-xs font-bold cursor-not-allowed border border-gray-200">
                        Wait
                    </button>
                 </div>
            </div>
        </div>
    );
};
