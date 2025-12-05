
import { useGameStore } from '../../store/useGameStore';
import { initTelegram } from '../../utils/telegram';

export const ShopTab = () => {
    const { walletBalance, buyBooster, boosters } = useGameStore();
    return (
        <div className="w-full max-w-sm">
            <h2 className="text-2xl font-black text-white mb-4">Item Shop</h2>
            <div className="bg-slate-800 rounded-xl p-4 mb-4 flex justify-between items-center border border-white/10">
                <span>Balance:</span>
                <span className="text-eliezer-gold font-mono font-bold">{walletBalance} ELZR</span>
            </div>

            <div className="space-y-3">
                <div className="bg-slate-800/80 p-4 rounded-xl flex items-center justify-between border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="text-3xl">💣</div>
                        <div>
                            <div className="font-bold">Bomb</div>
                            <div className="text-xs text-gray-400">Owned: {boosters.bomb}</div>
                        </div>
                    </div>
                    <button 
                        onClick={() => buyBooster('bomb', 500)}
                        className="bg-eliezer-purple px-4 py-2 rounded-lg font-bold text-sm active:scale-95"
                    >
                        500 💎
                    </button>
                </div>

                <div className="bg-slate-800/80 p-4 rounded-xl flex items-center justify-between border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="text-3xl">🔀</div>
                        <div>
                            <div className="font-bold">Shuffle</div>
                            <div className="text-xs text-gray-400">Owned: {boosters.shuffle}</div>
                        </div>
                    </div>
                    <button 
                        onClick={() => buyBooster('shuffle', 300)}
                        className="bg-eliezer-purple px-4 py-2 rounded-lg font-bold text-sm active:scale-95"
                    >
                        300 💎
                    </button>
                </div>

                <div className="bg-slate-800/80 p-4 rounded-xl flex items-center justify-between border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="text-3xl">⚡</div>
                        <div>
                            <div className="font-bold">+5 Moves</div>
                            <div className="text-xs text-gray-400">Owned: {boosters.extraMoves}</div>
                        </div>
                    </div>
                    <button 
                        onClick={() => buyBooster('extraMoves', 800)}
                        className="bg-eliezer-purple px-4 py-2 rounded-lg font-bold text-sm active:scale-95"
                    >
                        800 💎
                    </button>
                </div>
            </div>
        </div>
    );
};

export const TasksTab = () => {
    return (
        <div className="w-full max-w-sm">
            <h2 className="text-2xl font-black text-white mb-4">Earn ELZR</h2>
            <div className="space-y-3">
                <div className="bg-slate-800 p-4 rounded-xl flex justify-between items-center opacity-75">
                    <div>
                        <div className="font-bold">Join Telegram Channel</div>
                        <div className="text-xs text-eliezer-gold">+500 ELZR</div>
                    </div>
                    <button className="bg-white/10 px-3 py-1 rounded text-xs" disabled>Joined</button>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl flex justify-between items-center">
                    <div>
                        <div className="font-bold">Follow X (Twitter)</div>
                        <div className="text-xs text-eliezer-gold">+300 ELZR</div>
                    </div>
                    <button className="bg-eliezer-purple px-3 py-1 rounded text-xs font-bold">Go</button>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl flex justify-between items-center">
                    <div>
                        <div className="font-bold">Connect Wallet</div>
                        <div className="text-xs text-eliezer-gold">+1000 ELZR</div>
                    </div>
                    <button className="bg-eliezer-purple px-3 py-1 rounded text-xs font-bold">Connect</button>
                </div>
            </div>
        </div>
    );
};

export const FrensTab = () => {
    const { user, frens } = useGameStore();
    const inviteLink = `https://t.me/EliezerRushBot?start=${user?.id}`;

    return (
        <div className="w-full max-w-sm h-[70vh] flex flex-col">
            <h2 className="text-2xl font-black text-white mb-4">Frens Zone</h2>
            
            <div className="bg-gradient-to-r from-purple-900 to-slate-900 p-6 rounded-2xl mb-6 text-center border border-white/10">
                <div className="text-sm text-gray-300 mb-2">Invite friends & earn 10%</div>
                <button 
                    onClick={() => {
                        const tg = (window as any).Telegram?.WebApp;
                        if(tg) tg.openTelegramLink(`https://t.me/share/url?url=${inviteLink}&text=Play Eliezer Rush with me!`);
                    }}
                    className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                >
                    Invite a Friend 🔗
                </button>
            </div>

            <h3 className="font-bold mb-2 text-gray-400 uppercase text-sm">Leaderboard</h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {frens.map((fren, i) => (
                    <div key={fren.id} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center font-bold text-xs">
                                {i + 1}
                            </div>
                            <span>{fren.name}</span>
                        </div>
                        <span className="font-mono text-eliezer-gold">{fren.score}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const WalletTab = () => {
    const { walletBalance } = useGameStore();
    return (
        <div className="w-full max-w-sm">
            <h2 className="text-2xl font-black text-white mb-6">Wallet</h2>
            
            <div className="bg-gradient-to-br from-eliezer-gold to-orange-600 p-8 rounded-3xl text-center shadow-lg shadow-orange-500/20 mb-8 transform hover:scale-[1.02] transition-transform">
                <div className="text-black/60 font-bold uppercase tracking-widest text-sm mb-1">Total Balance</div>
                <div className="text-5xl font-black text-white drop-shadow-md">{walletBalance.toLocaleString()}</div>
                <div className="text-white/80 font-bold mt-1">ELZR TOKENS</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <button className="bg-slate-800 p-4 rounded-xl border border-white/10 flex flex-col items-center gap-2 active:scale-95">
                    <span className="text-2xl">⬇️</span>
                    <span className="font-bold text-sm">Deposit</span>
                </button>
                <button className="bg-slate-800 p-4 rounded-xl border border-white/10 flex flex-col items-center gap-2 active:scale-95">
                    <span className="text-2xl">⬆️</span>
                    <span className="font-bold text-sm">Withdraw</span>
                </button>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Recent Transactions</h3>
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Daily Reward</span>
                        <span className="text-green-400">+100 ELZR</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Level 5 Win</span>
                        <span className="text-green-400">+250 ELZR</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
