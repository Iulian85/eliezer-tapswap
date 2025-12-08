
import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { tg } from '../../utils/telegram';

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-3xl font-black text-factory-ink mb-6 text-center tracking-tight">{children}</h2>
);

const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-white/60 backdrop-blur-lg border border-white/80 rounded-2xl p-4 shadow-sm ${className}`}>
        {children}
    </div>
);

export const ShopTab = () => {
    const { walletBalance, buyBooster, boosters } = useGameStore();
    return (
        <div className="w-full max-w-sm pt-20 px-4">
            <SectionTitle>Shop</SectionTitle>
            
            <div className="space-y-4">
                {[
                    { id: 'bomb', label: 'Bomb', icon: '💣', price: 500, count: boosters.bomb },
                    { id: 'shuffle', label: 'Shuffle', icon: '🔀', price: 300, count: boosters.shuffle },
                    { id: 'extraMoves', label: '+5 Moves', icon: '⚡', price: 800, count: boosters.extraMoves }
                ].map((item) => (
                    <Card key={item.id} className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-factory-blue-light/30 rounded-xl flex items-center justify-center text-2xl">
                                {item.icon}
                            </div>
                            <div>
                                <div className="font-bold text-factory-ink text-lg">{item.label}</div>
                                <div className="text-xs text-factory-ink/60 font-medium">Owned: {item.count}</div>
                            </div>
                        </div>
                        <button 
                            onClick={() => buyBooster(item.id as any, item.price)}
                            className="bg-factory-ink text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-transform"
                        >
                            {item.price}
                        </button>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export const TasksTab = () => {
    return (
        <div className="w-full max-w-sm pt-20 px-4">
            <SectionTitle>Tasks</SectionTitle>
            <div className="space-y-4">
                <Card className="flex justify-between items-center opacity-70">
                    <div>
                        <div className="font-bold text-factory-ink">Telegram Channel</div>
                        <div className="text-xs text-factory-peach font-bold">+500 ELZR</div>
                    </div>
                    <span className="text-xs font-bold text-factory-ink/50 bg-black/5 px-2 py-1 rounded">DONE</span>
                </Card>
                <Card className="flex justify-between items-center">
                    <div>
                        <div className="font-bold text-factory-ink">Follow on X</div>
                        <div className="text-xs text-factory-peach font-bold">+300 ELZR</div>
                    </div>
                    <button className="bg-factory-peach text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-md">Go</button>
                </Card>
            </div>
        </div>
    );
};

export const FrensTab = () => {
    const { user, frens } = useGameStore();
    const inviteLink = `https://t.me/EliezerRushBot?start=${user?.id || 'r'}`;

    const handleInvite = () => {
        const message = "Play Eliezer Rush with me! 🐹";
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(message)}`;
        tg.openTelegramLink(shareUrl);
    };

    return (
        <div className="w-full max-w-sm pt-20 px-4 h-[80vh] flex flex-col">
            <SectionTitle>Frens</SectionTitle>
            
            <div className="bg-gradient-to-br from-factory-peach to-orange-400 p-6 rounded-3xl mb-8 text-center shadow-lg text-white">
                <div className="text-sm opacity-90 mb-3 font-medium">Invite friends & earn 10%</div>
                <button 
                    onClick={handleInvite}
                    className="w-full bg-white text-factory-peach-dark font-black py-3 rounded-xl shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
                >
                    Invite Friend
                </button>
            </div>

            <h3 className="font-bold mb-3 text-factory-ink/50 uppercase text-xs tracking-wider ml-1">Leaderboard</h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 pb-20">
                {frens.map((fren, i) => (
                    <Card key={fren.id} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i < 3 ? 'bg-factory-peach text-white' : 'bg-gray-200 text-gray-500'}`}>
                                {i + 1}
                            </div>
                            <span className="font-bold text-factory-ink">{fren.name}</span>
                        </div>
                        <span className="font-mono font-bold text-factory-blue-deep">{fren.score}</span>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export const WalletTab = () => {
    const { walletBalance } = useGameStore();
    return (
        <div className="w-full max-w-sm pt-20 px-4">
            <SectionTitle>Wallet</SectionTitle>
            
            <div className="clay-panel p-8 text-center mb-8 bg-white/80">
                <div className="text-factory-ink/50 font-bold uppercase tracking-widest text-xs mb-2">Total Balance</div>
                <div className="text-5xl font-black text-factory-ink tracking-tighter">{walletBalance.toLocaleString()}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <button className="bg-white p-4 rounded-2xl shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-transform border border-gray-100">
                    <span className="text-2xl">⬇️</span>
                    <span className="font-bold text-factory-ink text-sm">Deposit</span>
                </button>
                <button className="bg-white p-4 rounded-2xl shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-transform border border-gray-100">
                    <span className="text-2xl">⬆️</span>
                    <span className="font-bold text-factory-ink text-sm">Withdraw</span>
                </button>
            </div>
        </div>
    );
};
