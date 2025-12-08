import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { tg } from '../../utils/telegram';

interface PropsWithChildren {
    children: React.ReactNode;
}

interface CardProps extends PropsWithChildren {
    className?: string;
}

const SectionTitle: React.FC<PropsWithChildren> = ({ children }) => (
    <h2 className="text-4xl font-black text-factory-ink mb-8 text-center tracking-tight drop-shadow-sm">{children}</h2>
);

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
    <div className={`bg-white/60 backdrop-blur-xl border-2 border-white/70 rounded-3xl p-5 shadow-lg ${className}`}>
        {children}
    </div>
);

export const ShopTab = () => {
    const { walletBalance, buyBooster, boosters } = useGameStore();
    return (
        <div className="w-full max-w-sm pt-24 px-4 pb-32 overflow-y-auto">
            <SectionTitle>Shop</SectionTitle>
            
            <div className="space-y-4">
                {[
                    { id: 'bomb', label: 'Bomb', icon: '💣', price: 500, count: boosters.bomb, desc: 'Clear 3x3 area' },
                    { id: 'shuffle', label: 'Shuffle', icon: '🔀', price: 300, count: boosters.shuffle, desc: 'Mix all tokens' },
                    { id: 'extraMoves', label: '+5 Moves', icon: '⚡', price: 800, count: boosters.extraMoves, desc: 'Stay in the game' }
                ].map((item) => (
                    <Card key={item.id} className="flex flex-col gap-3 transform transition-all hover:scale-[1.02]">
                         <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-gray-100">
                                {item.icon}
                            </div>
                            <div className="flex-1">
                                <div className="font-black text-factory-ink text-lg leading-tight">{item.label}</div>
                                <div className="text-xs text-factory-ink/60 font-medium">{item.desc}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-bold text-factory-ink/40 uppercase">Owned</div>
                                <div className="text-xl font-black text-factory-peach">{item.count}</div>
                            </div>
                        </div>
                        <button 
                            onClick={() => buyBooster(item.id as any, item.price)}
                            className="w-full bg-factory-ink text-white py-3 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                        >
                            <span>Buy for</span>
                            <span className="text-factory-peach">{item.price}</span>
                        </button>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export const TasksTab = () => {
    return (
        <div className="w-full max-w-sm pt-24 px-4 pb-32">
            <SectionTitle>Tasks</SectionTitle>
            <div className="space-y-3">
                <Card className="flex justify-between items-center opacity-60">
                    <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-600">✈️</div>
                         <div>
                            <div className="font-bold text-factory-ink">Telegram Channel</div>
                            <div className="text-xs text-factory-ink/50">+500 ELZR</div>
                        </div>
                    </div>
                    <span className="text-[10px] font-black text-factory-ink/40 bg-black/5 px-2 py-1 rounded-full uppercase tracking-wide">Done</span>
                </Card>
                <Card className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center text-black">𝕏</div>
                         <div>
                            <div className="font-bold text-factory-ink">Follow on X</div>
                            <div className="text-xs text-factory-peach font-bold">+300 ELZR</div>
                        </div>
                    </div>
                    <button className="bg-factory-peach text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md active:scale-95 transition-transform">Go</button>
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
        <div className="w-full max-w-sm pt-24 px-4 h-full flex flex-col pb-32">
            <SectionTitle>Frens</SectionTitle>
            
            <div className="bg-gradient-to-br from-factory-peach to-orange-500 p-6 rounded-3xl mb-8 text-center shadow-xl text-white relative overflow-hidden">
                <div className="relative z-10">
                    <div className="text-3xl font-black mb-1">10%</div>
                    <div className="text-sm opacity-90 mb-4 font-medium">Earn commission from friends</div>
                    <button 
                        onClick={handleInvite}
                        className="w-full bg-white text-factory-peach-dark font-black py-3.5 rounded-xl shadow-lg active:scale-95 transition-all text-sm uppercase tracking-wide"
                    >
                        Invite Friend
                    </button>
                </div>
                {/* Decorative circle */}
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
            </div>

            <h3 className="font-bold mb-4 text-factory-ink/40 uppercase text-xs tracking-widest ml-1">Leaderboard</h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {frens.map((fren, i) => (
                    <div key={fren.id} className="bg-white/40 backdrop-blur-md rounded-2xl p-3 flex items-center justify-between border border-white/50">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${i < 3 ? 'bg-gradient-to-br from-factory-peach to-orange-500 text-white' : 'bg-white text-gray-400'}`}>
                                {i + 1}
                            </div>
                            <span className="font-bold text-factory-ink text-sm">{fren.name}</span>
                        </div>
                        <span className="font-black text-factory-blue-deep text-sm">{fren.score}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const WalletTab = () => {
    const { walletBalance } = useGameStore();
    return (
        <div className="w-full max-w-sm pt-24 px-4 pb-32">
            <SectionTitle>Wallet</SectionTitle>
            
            <div className="clay-panel p-8 text-center mb-8">
                <div className="text-factory-ink/50 font-bold uppercase tracking-widest text-xs mb-3">Total Assets</div>
                <div className="text-5xl font-black text-factory-ink tracking-tight mb-2">{walletBalance.toLocaleString()}</div>
                <div className="text-sm font-bold text-factory-peach">ELZR Tokens</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <button className="bg-white/60 p-5 rounded-3xl shadow-lg border-2 border-white/80 flex flex-col items-center gap-2 active:scale-95 transition-transform hover:bg-white/80">
                    <span className="text-2xl bg-blue-100 p-2 rounded-full">⬇️</span>
                    <span className="font-bold text-factory-ink text-sm">Deposit</span>
                </button>
                <button className="bg-white/60 p-5 rounded-3xl shadow-lg border-2 border-white/80 flex flex-col items-center gap-2 active:scale-95 transition-transform hover:bg-white/80">
                    <span className="text-2xl bg-orange-100 p-2 rounded-full">⬆️</span>
                    <span className="font-bold text-factory-ink text-sm">Withdraw</span>
                </button>
            </div>
        </div>
    );
};