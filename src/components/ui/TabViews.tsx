
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
                            className="w-full py-2 bg-white rounded-xl text-xs font-bold text-ref-text shadow-sm"
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
                    { title: 'Join Channel', reward: '+500', icon: '📢', done: true },
                    { title: 'Follow X', reward: '+300', icon: '✖️', done: false },
                    { title: 'Invite 3 Frens', reward: '+1000', icon: '👥', done: false },
                ].map((task, i) => (
                    <div key={i} className="glass-panel p-4 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm">
                                {task.icon}
                            </div>
                            <div>
                                <div className="font-bold text-ref-text">{task.title}</div>
                                <div className="text-xs text-ref-orange font-bold">{task.reward} ELZR</div>
                            </div>
                        </div>
                        {task.done ? (
                             <div className="w-8 h-8 bg-green-100 text-green-500 rounded-full flex items-center justify-center">✓</div>
                        ) : (
                             <button className="bg-ref-orange text-white px-4 py-2 rounded-xl text-xs font-bold shadow-clay-btn">
                                 Go
                             </button>
                        )}
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
            
            {/* Big Invite Card */}
            <GlassCard className="mb-8 flex flex-col items-center text-center relative overflow-hidden group">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center text-4xl shadow-clay-btn mb-4 animate-float">
                    💰
                </div>
                <h3 className="font-black text-xl text-ref-text mb-1">Invite Friends</h3>
                <p className="text-sm text-ref-text-light mb-6">Earn 10% from their play</p>
                
                <button 
                    onClick={handleInvite}
                    className="btn-primary-3d w-full py-4 text-lg font-bold shadow-clay-btn"
                >
                    Invite Friend
                </button>
            </GlassCard>

            <div className="flex-1 overflow-y-auto space-y-3">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider ml-2 opacity-80">Your Frens</h4>
                {frens.map((fren, i) => (
                    <div key={fren.id} className="bg-white/40 rounded-2xl p-3 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-sm font-bold text-ref-text shadow-sm">
                                {fren.name.charAt(0)}
                            </div>
                            <span className="font-bold text-ref-text text-sm">{fren.name}</span>
                         </div>
                         <span className="font-bold text-ref-orange text-sm">+{fren.score}</span>
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
            
            <GlassCard className="flex flex-col items-center py-10 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-ref-orange/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                
                <div className="text-sm text-ref-text-light font-bold uppercase tracking-widest mb-2">Total Balance</div>
                <div className="text-5xl font-black text-ref-text mb-2 tracking-tighter drop-shadow-sm">
                    {walletBalance.toLocaleString()}
                </div>
                <div className="bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-xs font-black shadow-sm">
                    $ELZR Token
                </div>
            </GlassCard>

            <div className="space-y-4">
                 {/* Connect Wallet Card */}
                 <div className="bg-white/40 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between border border-white/50 shadow-sm">
                    <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-blue-100">
                            👛
                         </div>
                         <div className="flex flex-col">
                             <span className="font-bold text-ref-text text-sm">Connect TON Wallet</span>
                             <span className="text-xs text-ref-text-light font-medium">Link your wallet for withdrawals</span>
                         </div>
                    </div>
                    <button className="bg-white px-4 py-2 rounded-xl text-xs font-bold text-ref-text shadow-sm border border-white/60 active:scale-95 transition-transform">
                        Connect
                    </button>
                 </div>

                 {/* History Placeholder */}
                 <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between border border-white/30">
                    <div className="flex items-center gap-4 opacity-60">
                         <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                            📜
                         </div>
                         <div className="flex flex-col">
                             <span className="font-bold text-ref-text text-sm">Transaction History</span>
                             <span className="text-xs text-ref-text-light font-medium">No transactions yet</span>
                         </div>
                    </div>
                 </div>
            </div>
        </div>
    );
};
