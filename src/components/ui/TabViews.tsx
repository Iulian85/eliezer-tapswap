
import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { tg } from '../../utils/telegram';

interface PropsWithChildren {
    children: React.ReactNode;
}

const SectionTitle: React.FC<PropsWithChildren> = ({ children }) => (
    <h2 className="text-3xl font-black text-white drop-shadow-md mb-6 text-center tracking-wide">{children}</h2>
);

const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`glass-panel p-5 ${className}`}>
        {children}
    </div>
);

// --- SHOP TAB ---
export const ShopTab = () => {
    const { walletBalance, buyBooster, boosters } = useGameStore();
    return (
        <div className="w-full h-full pt-20 px-6 pb-32 overflow-y-auto">
            <SectionTitle>Shop</SectionTitle>
            
            {/* Grid Layout matching reference */}
            <div className="grid grid-cols-2 gap-4">
                {[
                    { id: 'bomb', label: 'Bomb', icon: '💣', price: 500, count: boosters.bomb, color: 'bg-red-100 text-red-500' },
                    { id: 'shuffle', label: 'Shuffle', icon: '🔀', price: 300, count: boosters.shuffle, color: 'bg-blue-100 text-blue-500' },
                    { id: 'extraMoves', label: '+5 Moves', icon: '⚡', price: 800, count: boosters.extraMoves, color: 'bg-yellow-100 text-yellow-600' },
                    { id: 'shield', label: 'Shield', icon: '🛡️', price: 1000, count: 0, color: 'bg-green-100 text-green-500' },
                ].map((item) => (
                    <GlassCard key={item.id} className="flex flex-col items-center gap-3 active:scale-95 transition-transform duration-200">
                        {/* 3D-ish Icon Container */}
                        <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center text-2xl shadow-inner`}>
                            {item.icon}
                        </div>
                        
                        <div className="text-center">
                            <div className="font-bold text-ref-text">{item.label}</div>
                            <div className="text-xs text-ref-orange font-bold mt-1">
                                {item.price} 💰
                            </div>
                        </div>

                        <button 
                            onClick={() => buyBooster(item.id as any, item.price)}
                            className="w-full py-2 bg-white rounded-xl text-xs font-bold text-ref-text shadow-sm border border-white/50"
                        >
                            Buy
                        </button>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
};

// --- TASKS TAB ---
export const TasksTab = () => {
    return (
        <div className="w-full h-full pt-20 px-6 pb-32 overflow-y-auto">
            <SectionTitle>Tasks</SectionTitle>
            
            <div className="space-y-4">
                {[
                    { title: 'Join Channel', reward: '+500', icon: '📢', done: true, bg: 'bg-blue-50 text-blue-500' },
                    { title: 'Follow X', reward: '+300', icon: '✖️', done: false, bg: 'bg-gray-100 text-gray-800' },
                    { title: 'Connect Wallet', reward: '+1000', icon: '👛', done: false, bg: 'bg-purple-50 text-purple-500' },
                    { title: 'Invite 3 Frens', reward: '+2000', icon: '👥', done: false, bg: 'bg-yellow-50 text-yellow-600' },
                ].map((task, i) => (
                    <GlassCard key={i} className="flex items-center justify-between p-4 shadow-sm active:scale-[0.98] transition-transform">
                        <div className="flex items-center gap-4">
                            {/* Icon Box */}
                            <div className={`w-12 h-12 ${task.bg} rounded-2xl flex items-center justify-center text-xl shadow-inner border border-white/50`}>
                                {task.icon}
                            </div>
                            
                            <div className="flex flex-col">
                                <span className="font-black text-ref-text text-sm">{task.title}</span>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <span className="text-[10px] bg-ref-orange/10 text-ref-orange px-2 py-0.5 rounded-full font-bold">
                                        {task.reward} ELZR
                                    </span>
                                </div>
                            </div>
                        </div>

                        {task.done ? (
                             <div className="w-9 h-9 bg-green-100 text-green-500 rounded-full flex items-center justify-center shadow-inner border border-green-200">
                                 <span className="font-bold">✓</span>
                             </div>
                        ) : (
                             <button className="bg-ref-orange text-white px-4 py-2 rounded-xl text-xs font-black shadow-clay-btn transition-transform hover:scale-105">
                                 Start
                             </button>
                        )}
                    </GlassCard>
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
            
            {/* Big Invite Card */}
            <GlassCard className="mb-8 flex flex-col items-center text-center relative overflow-hidden group shadow-lg">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
                
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center text-4xl shadow-clay-btn mb-4 animate-float z-10 border-4 border-white/50">
                    💰
                </div>
                <h3 className="font-black text-xl text-ref-text mb-1 z-10">Invite Friends</h3>
                <p className="text-sm text-ref-text-light mb-6 z-10">Earn 10% from their play</p>
                
                <button 
                    onClick={handleInvite}
                    className="btn-primary-3d w-full py-3.5 text-lg font-bold shadow-clay-btn z-10"
                >
                    Invite Friend
                </button>
            </GlassCard>

            <div className="flex-1 overflow-y-auto space-y-3">
                <h4 className="text-xs font-black text-white/80 uppercase tracking-widest ml-2 mb-2">Your Squad</h4>
                {frens.map((fren, i) => (
                    <div key={fren.id} className="bg-white/40 backdrop-blur-md rounded-2xl p-3 flex items-center justify-between border border-white/40 shadow-sm">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-sm font-bold text-ref-text shadow-sm border border-gray-100">
                                {fren.name.charAt(0)}
                            </div>
                            <span className="font-bold text-ref-text text-sm">{fren.name}</span>
                         </div>
                         <div className="bg-white/50 px-3 py-1 rounded-full">
                            <span className="font-bold text-ref-orange text-xs">+{fren.score} ELZR</span>
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
            
            <GlassCard className="flex flex-col items-center py-10 mb-6 relative overflow-hidden shadow-glass-card">
                <div className="absolute top-0 right-0 w-32 h-32 bg-ref-orange/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                
                <div className="text-xs text-ref-text-light font-bold uppercase tracking-widest mb-2">Total Balance</div>
                <div className="text-5xl font-black text-ref-text mb-3 tracking-tighter drop-shadow-sm">
                    {walletBalance.toLocaleString()}
                </div>
                <div className="bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-xs font-black shadow-inner border border-orange-100">
                    $ELZR Token
                </div>
            </GlassCard>

            <div className="space-y-4">
                 {/* Connect Wallet Card */}
                 <div className="bg-white/40 backdrop-blur-md rounded-3xl p-4 flex items-center justify-between border border-white/60 shadow-sm">
                    <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-blue-100">
                            👛
                         </div>
                         <div className="flex flex-col">
                             <span className="font-black text-ref-text text-sm">Connect Wallet</span>
                             <span className="text-[10px] text-ref-text-light font-bold uppercase">TON Network</span>
                         </div>
                    </div>
                    <button className="bg-white px-5 py-2.5 rounded-2xl text-xs font-black text-ref-text shadow-sm border border-white/60 active:scale-95 transition-transform">
                        Connect
                    </button>
                 </div>

                 {/* History Placeholder */}
                 <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-4 flex items-center justify-between border border-white/30">
                    <div className="flex items-center gap-4 opacity-60">
                         <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                            📜
                         </div>
                         <div className="flex flex-col">
                             <span className="font-bold text-ref-text text-sm">History</span>
                             <span className="text-[10px] text-ref-text-light font-bold uppercase">No transactions</span>
                         </div>
                    </div>
                 </div>
            </div>
        </div>
    );
};
