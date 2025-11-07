


import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MineIcon, FriendsIcon, EarnIcon, BoostIcon, EnergyIcon, RocketLaunchIcon, PlusIcon, MultiTapIcon, AutoMineIcon, GiftIcon, CheckBadgeIcon, TargetIcon, ClipboardIcon, ArrowUpCircleIcon } from './components/Icons';

// Allow TypeScript to recognize the Telegram Web App object
declare global {
  interface Window {
    Telegram: any;
  }
}

// --- Type Definitions ---
type TapAnimation = {
  id: number;
  x: number;
  y: number;
};

type League = {
  name: string;
  minScore: number;
  icon: string;
};

type BoostId = 'turbo_tap' | 'full_energy' | 'multi_tap' | 'auto_mine';

type Boost = {
  id: BoostId;
  name: string;
  description: string;
  cost: number;
  duration?: number; // in seconds
  icon: React.FC<{ className?: string }>;
};

type ActiveBoost = {
    endTime: number;
};

type ActiveBoosts = {
    [key in BoostId]?: ActiveBoost;
}

type Friend = {
    id: number;
    name: string;
    score: number;
    avatar: string;
};

type TaskId = 'tap_1000' | 'invite_3' | 'reach_silver' | 'tap_50000' | 'invite_10' | 'reach_gold';

type Task = {
  id: TaskId;
  title: string;
  reward: number;
  goal: number;
  getProgress: (state: { totalTaps: number; friends: Friend[]; score: number }) => number;
  icon: React.FC<{ className?: string }>;
};

type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
};

// --- Constants ---
const ENERGY_REGEN_RATE = 2; // per second
const ENERGY_PER_TAP = 1;
const INVITE_BONUS = 1000;
const AUTO_MINE_RATE = 5; // coins per second
const DAILY_REWARD_COINS = 500;
const REFERRAL_BONUS = 2500;

// Sound Effect URLs
const TAP_SOUND_URL = 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_2770f4388b.mp3';
const CLAIM_SOUND_URL = 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_a1297b6a4a.mp3';
const PURCHASE_SOUND_URL = 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c9a8f26a1d.mp3';
const BONUS_SOUND_URL = 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_133a51feba.mp3';


const LEAGUES: League[] = [
    { name: "Bronze", minScore: 0, icon: "🥉" },
    { name: "Silver", minScore: 5000, icon: "🥈" },
    { name: "Gold", minScore: 25000, icon: "🥇" },
    { name: "Platinum", minScore: 100000, icon: "💎" },
    { name: "Diamond", minScore: 1000000, icon: "🏆" },
    { name: "Master", minScore: 5000000, icon: "🔮" },
];

const BOOSTS: Boost[] = [
    { id: 'turbo_tap', name: 'Turbo Tap', description: 'Doubles tap value for 30 seconds.', cost: 1000, duration: 30, icon: RocketLaunchIcon },
    { id: 'multi_tap', name: 'Multi Tap', description: '5x tap value for 20 seconds.', cost: 2500, duration: 20, icon: MultiTapIcon },
    { id: 'auto_mine', name: 'Auto Miner', description: `Passively earns ${AUTO_MINE_RATE} coins/sec for 1 hour.`, cost: 5000, duration: 3600, icon: AutoMineIcon },
    { id: 'full_energy', name: 'Full Energy', description: 'Instantly refills your energy.', cost: 500, icon: EnergyIcon }
];

const TASKS: Task[] = [
    {
        id: 'tap_1000',
        title: 'Tap 1,000 times',
        reward: 1000,
        goal: 1000,
        getProgress: ({ totalTaps }) => totalTaps,
        icon: MineIcon,
    },
    {
        id: 'invite_3',
        title: 'Invite 3 friends',
        reward: 3000,
        goal: 3,
        getProgress: ({ friends }) => friends.length,
        icon: FriendsIcon,
    },
    {
        id: 'reach_silver',
        title: 'Reach Silver League',
        reward: 5000,
        goal: LEAGUES.find(l => l.name === 'Silver')?.minScore || 5000,
        getProgress: ({ score }) => score,
        icon: BoostIcon
    },
    {
        id: 'tap_50000',
        title: 'Tap 50,000 times',
        reward: 7500,
        goal: 50000,
        getProgress: ({ totalTaps }) => totalTaps,
        icon: MineIcon,
    },
    {
        id: 'invite_10',
        title: 'Invite 10 friends',
        reward: 15000,
        goal: 10,
        getProgress: ({ friends }) => friends.length,
        icon: FriendsIcon,
    },
    {
        id: 'reach_gold',
        title: 'Reach Gold League',
        reward: 10000,
        goal: LEAGUES.find(l => l.name === 'Gold')?.minScore || 25000,
        getProgress: ({ score }) => score,
        icon: BoostIcon
    }
];


// --- Helper Functions ---
const getLeagueInfo = (score: number) => {
    let currentLeague = LEAGUES[0];
    let nextLeague: League | null = LEAGUES[1];

    for (let i = LEAGUES.length - 1; i >= 0; i--) {
        if (score >= LEAGUES[i].minScore) {
            currentLeague = LEAGUES[i];
            nextLeague = i < LEAGUES.length - 1 ? LEAGUES[i + 1] : null;
            break;
        }
    }

    const progress = nextLeague
        ? ((score - currentLeague.minScore) / (nextLeague.minScore - currentLeague.minScore)) * 100
        : 100;

    return { currentLeague, nextLeague, progress };
};

const playSound = (soundUrl: string) => {
    const audio = new Audio(soundUrl);
    audio.volume = 0.5;
    audio.play().catch(error => console.error("Error playing sound:", error));
};


// --- Components ---
const EarnModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    isDailyRewardAvailable: boolean;
    onClaimDailyReward: () => void;
    tasks: Task[];
    totalTaps: number;
    friends: Friend[];
    score: number;
    claimedTasks: TaskId[];
    onClaimTask: (taskId: TaskId) => void;
}> = ({
    isOpen, onClose, isDailyRewardAvailable, onClaimDailyReward, tasks,
    totalTaps, friends, score, claimedTasks, onClaimTask
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-gray-900 border border-yellow-500 rounded-2xl w-11/12 max-w-md p-6 text-center shadow-lg shadow-yellow-500/20 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <h2 className="text-3xl font-bold text-white mb-6 flex-shrink-0">Earn Coins</h2>

                <div className="overflow-y-auto pr-2 space-y-6">
                    {/* Daily Reward Section */}
                    <div className={`bg-gray-800 p-4 rounded-lg ${isDailyRewardAvailable ? 'animate-pulse-glow' : ''}`}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-yellow-400/20 p-3 rounded-full">
                                <GiftIcon className="w-8 h-8 text-yellow-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-left">Daily Reward</h3>
                                <p className="text-sm text-gray-400 text-left">{isDailyRewardAvailable ? "Your daily reward is ready!" : "Come back tomorrow!"}</p>
                            </div>
                        </div>
                        {isDailyRewardAvailable ? (
                            <>
                                <div className="bg-gray-700 p-3 rounded-lg mb-4 text-left text-sm">
                                    <p className="font-semibold text-yellow-300 flex items-center gap-2"><img src="https://picsum.photos/20/20?grayscale" className="w-5 h-5 rounded-full" /> +{DAILY_REWARD_COINS.toLocaleString()} Coins</p>
                                    <p className="font-semibold text-cyan-300 mt-2 flex items-center gap-2"><EnergyIcon className="w-5 h-5"/> Full Energy Refill</p>
                                </div>
                                <button
                                    onClick={onClaimDailyReward}
                                    className="w-full bg-yellow-500 text-black font-bold py-2.5 px-4 rounded-lg transition-transform duration-200 hover:scale-105"
                                >
                                    Claim Reward
                                </button>
                            </>
                        ) : (
                            <p className="text-gray-500">You have already claimed your reward for today.</p>
                        )}
                    </div>
                    
                    {/* Tasks Section */}
                    <div className="bg-gray-800 p-4 rounded-lg">
                         <div className="flex items-center gap-4 mb-4">
                            <div className="bg-cyan-400/20 p-3 rounded-full">
                                <TargetIcon className="w-8 h-8 text-cyan-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-left">Tasks</h3>
                                <p className="text-sm text-gray-400 text-left">Complete tasks for extra rewards.</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {tasks.map(task => {
                                const progress = task.getProgress({ totalTaps, friends, score });
                                const isCompleted = progress >= task.goal;
                                const isClaimed = claimedTasks.includes(task.id);
                                const progressPercentage = Math.min((progress / task.goal) * 100, 100);

                                return (
                                    <div key={task.id} className="bg-gray-700 p-3 rounded-lg flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-3 flex-grow">
                                            <task.icon className="w-8 h-8 text-gray-300 flex-shrink-0" />
                                            <div className="flex-grow">
                                                <p className="font-semibold text-sm">{task.title}</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-full bg-gray-600 rounded-full h-2 flex-grow">
                                                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                                                    </div>
                                                    <span className="text-xs text-gray-400 font-mono">{Math.floor(progress).toLocaleString()}/{task.goal.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => onClaimTask(task.id)}
                                            disabled={!isCompleted || isClaimed}
                                            className={`font-bold py-2 px-3 rounded-lg text-sm transition-colors duration-200 w-28 flex-shrink-0 flex items-center justify-center gap-1 ${
                                                isClaimed 
                                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                                                    : isCompleted 
                                                        ? 'bg-green-500 hover:bg-green-600 text-white animate-pulse-glow-green'
                                                        : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                                            }`}
                                        >
                                            {isClaimed ? (
                                                <><CheckBadgeIcon className="w-5 h-5"/> Claimed</>
                                            ) : (
                                                `+${task.reward.toLocaleString()}`
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const UpgradesModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onPurchaseBoost: (boost: Boost) => void;
    score: number;
    tapLevel: number;
    energyLevel: number;
    tapValue: number;
    maxEnergy: number;
    tapUpgradeCost: number;
    energyUpgradeCost: number;
    onUpgradeTap: () => void;
    onUpgradeEnergy: () => void;
}> = ({ 
    isOpen, onClose, onPurchaseBoost, score,
    tapLevel, energyLevel, tapValue, maxEnergy,
    tapUpgradeCost, energyUpgradeCost, onUpgradeTap, onUpgradeEnergy
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-11/12 max-w-md p-6 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <h2 className="text-3xl font-bold text-center mb-6 text-white flex-shrink-0">Upgrades & Boosts</h2>
                <div className="overflow-y-auto pr-2 space-y-6">
                    {/* Permanent Upgrades */}
                    <div className="bg-gray-800 p-4 rounded-lg">
                         <h3 className="font-bold text-lg text-left mb-4 text-cyan-300">Permanent Upgrades</h3>
                         <div className="space-y-3">
                            {/* Tap Power Upgrade */}
                            <div className="bg-gray-700 p-3 rounded-lg flex items-center justify-between gap-2">
                                <div className="flex items-center gap-3">
                                    <div className="bg-gray-600 p-2 rounded-full"><MultiTapIcon className="w-7 h-7 text-yellow-400" /></div>
                                    <div>
                                        <p className="font-bold">Tap Power</p>
                                        <p className="text-sm text-gray-400">Level {tapLevel} &bull; Value: {tapValue}/tap</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onUpgradeTap}
                                    disabled={score < tapUpgradeCost}
                                    className="bg-purple-600 text-white font-bold py-2 px-3 rounded-lg text-sm transition-colors duration-200 flex items-center gap-2 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-purple-700"
                                >
                                    <ArrowUpCircleIcon className="w-5 h-5"/>
                                    <span>{tapUpgradeCost.toLocaleString()}</span>
                                </button>
                            </div>
                             {/* Energy Tank Upgrade */}
                             <div className="bg-gray-700 p-3 rounded-lg flex items-center justify-between gap-2">
                                <div className="flex items-center gap-3">
                                    <div className="bg-gray-600 p-2 rounded-full"><EnergyIcon className="w-7 h-7 text-green-400" /></div>
                                    <div>
                                        <p className="font-bold">Energy Tank</p>
                                        <p className="text-sm text-gray-400">Level {energyLevel} &bull; Max: {maxEnergy}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onUpgradeEnergy}
                                    disabled={score < energyUpgradeCost}
                                    className="bg-purple-600 text-white font-bold py-2 px-3 rounded-lg text-sm transition-colors duration-200 flex items-center gap-2 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-purple-700"
                                >
                                    <ArrowUpCircleIcon className="w-5 h-5"/>
                                    <span>{energyUpgradeCost.toLocaleString()}</span>
                                </button>
                            </div>
                         </div>
                    </div>
                    {/* Temporary Boosts */}
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <h3 className="font-bold text-lg text-left mb-4 text-cyan-300">Temporary Boosts</h3>
                        <div className="space-y-4">
                            {BOOSTS.map(boost => {
                                const hasEnoughScore = score >= boost.cost;
                                return (
                                    <div key={boost.id} className="bg-gray-700 p-3 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-gray-600 p-2 rounded-full">
                                                <boost.icon className="w-7 h-7 text-cyan-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-md">{boost.name}</h3>
                                                <p className="text-xs text-gray-400">{boost.description}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => onPurchaseBoost(boost)}
                                            disabled={!hasEnoughScore}
                                            className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 text-sm disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-cyan-600"
                                        >
                                            {boost.cost.toLocaleString()}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ActiveBoostsDisplay: React.FC<{ activeBoosts: ActiveBoosts }> = ({ activeBoosts }) => {
    const activeBoostList = Object.entries(activeBoosts).filter(
        (entry): entry is [BoostId, ActiveBoost] => {
            const [, details] = entry;
            return !!details && (details as ActiveBoost).endTime > Date.now();
        }
    );

    if (activeBoostList.length === 0) return null;
    
    const formatTime = (seconds: number) => {
        if (seconds < 0) seconds = 0;
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        if (minutes < 60) {
             return `${minutes}m ${remainingSeconds > 0 ? `${remainingSeconds}s` : ''}`.trim();
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes > 0 ? `${remainingMinutes}m` : ''}`.trim();
    }

    return (
        <div className="absolute top-4 left-4 flex flex-col items-start gap-3 z-10">
            {activeBoostList.map(([id, details]) => {
                const boostInfo = BOOSTS.find(b => b.id === id);
                const timeLeft = Math.ceil((details.endTime - Date.now()) / 1000);

                if (!boostInfo || timeLeft <= 0) return null;

                return (
                    <div key={id} className="bg-black/40 backdrop-blur-sm text-white px-3 py-2 rounded-full flex items-center gap-2 text-sm font-semibold border border-cyan-500/50 shadow-lg">
                        <boostInfo.icon className="w-6 h-6 text-cyan-300" />
                        <span className="font-mono text-base">{formatTime(timeLeft)}</span>
                    </div>
                );
            })}
        </div>
    );
};

const LeagueDisplay: React.FC<{ score: number }> = ({ score }) => {
    const { currentLeague, nextLeague, progress } = getLeagueInfo(score);
    
    return (
        <div className="w-full bg-black/20 p-2 rounded-xl border border-gray-700">
            <div className="flex justify-between items-center text-sm mb-1">
                <div className="flex items-center gap-1 font-bold">
                    <span>{currentLeague.icon}</span>
                    <span>{currentLeague.name}</span>
                </div>
                {nextLeague && (
                    <div className="text-gray-400">
                        <span className="font-semibold text-white">{nextLeague.name}</span> &gt;
                    </div>
                )}
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-200"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
};

const TapView: React.FC<{
    activeBoosts: ActiveBoosts;
    handleTap: (e: React.MouseEvent<HTMLButtonElement>) => void;
    energy: number;
    maxEnergy: number;
    handleRefillEnergy: () => void;
    score: number;
}> = ({ activeBoosts, handleTap, energy, maxEnergy, handleRefillEnergy, score }) => {
    const energyPercentage = (energy / maxEnergy) * 100;
    const energyRefillCost = Math.floor(maxEnergy / 2);
    const isTurboActive = useMemo(() => {
        const turbo = activeBoosts.turbo_tap;
        return !!turbo && turbo.endTime > Date.now();
    }, [activeBoosts.turbo_tap]);

    return (
        <div className="relative flex flex-col items-center justify-between h-full w-full">
            <ActiveBoostsDisplay activeBoosts={activeBoosts} />
            <main className="flex flex-col items-center gap-2 flex-grow justify-center">
                <button
                    onClick={handleTap}
                    className={`w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-orange-600 active:scale-95 transition-transform duration-75 ease-in-out flex items-center justify-center focus:outline-none border-4 border-yellow-700/80 relative ${
                        isTurboActive 
                            ? 'animate-pulse-glow-turbo' 
                            : 'shadow-[0_0_60px_rgba(253,249,156,0.6)]'
                    }`}
                    aria-label="Tap to mine coin"
                >
                    <div className="absolute inset-0 rounded-full border-4 border-yellow-200/50 scale-90"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-yellow-100/30 scale-80"></div>
                    <EnergyIcon className="w-2/5 h-2/5 text-white drop-shadow-lg" />
                </button>
            </main>

            <footer className="w-full flex flex-col items-center gap-2">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 text-xl font-semibold">
                        <EnergyIcon className="w-6 h-6 text-yellow-400"/>
                        <span>{Math.floor(energy)} / {maxEnergy}</span>
                    </div>
                    <button
                        onClick={handleRefillEnergy}
                        disabled={score < energyRefillCost || energy >= maxEnergy}
                        className="flex items-center gap-1.5 bg-cyan-500/20 text-cyan-300 px-3 py-1.5 rounded-full text-sm font-bold border border-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-500/40 transition-colors"
                        aria-label={`Refill energy for ${energyRefillCost} coins`}
                    >
                        <EnergyIcon className="w-5 h-5" />
                        <span>Refill</span>
                    </button>
                </div>
                <div className="w-full bg-black/30 rounded-full h-4 border border-gray-700 overflow-hidden shadow-inner shadow-black/50">
                    <div 
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full transition-all duration-300 ease-linear animate-pulse-glow"
                        style={{ width: `${energyPercentage}%` }}
                    ></div>
                </div>
            </footer>
        </div>
    );
};

const FriendsView: React.FC<{
    friends: Friend[];
    onAddFriend: (name: string) => void;
    inviteCode: string;
    hasUsedReferral: boolean;
    onClaimReferral: (code: string) => void;
    showNotification: (message: string) => void;
}> = ({ friends, onAddFriend, inviteCode, hasUsedReferral, onClaimReferral, showNotification }) => {
    const [newFrenName, setNewFrenName] = useState('');
    const [referralCodeInput, setReferralCodeInput] = useState('');

    const handleAdd = () => {
        if (newFrenName.trim()) {
            onAddFriend(newFrenName.trim());
            setNewFrenName('');
        }
    };
    
    const handleCopyCode = () => {
        navigator.clipboard.writeText(inviteCode);
        showNotification("Invite code copied!");
    };
    
    const handleClaim = () => {
        if (referralCodeInput.trim()) {
            onClaimReferral(referralCodeInput.trim());
            setReferralCodeInput('');
        }
    };

    return (
        <div className="w-full flex flex-col h-full pt-4 flex-grow">
            <div className="bg-gray-800 p-4 rounded-lg mb-4">
                <h3 className="font-bold text-lg text-center mb-2">Invite Frens & Earn</h3>
                <p className="text-center text-sm text-gray-400 mb-4">You get {INVITE_BONUS.toLocaleString()} coins for each invite!</p>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inviteCode}
                        readOnly
                        className="flex-grow bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white font-mono text-center cursor-not-allowed"
                    />
                    <button
                        onClick={handleCopyCode}
                        className="bg-cyan-500 text-white font-bold py-2 px-3 rounded-lg transition-colors duration-200 hover:bg-cyan-600 flex items-center justify-center"
                        aria-label="Copy Invite Code"
                    >
                        <ClipboardIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
            
             <div className="bg-gray-800 p-4 rounded-lg mb-4">
                <h3 className="font-bold text-lg text-center mb-2">Got an Invite?</h3>
                 {hasUsedReferral ? (
                    <div className="flex items-center justify-center gap-2 text-center text-green-400 font-semibold py-2">
                        <CheckBadgeIcon className="w-6 h-6" />
                        <span>Referral bonus claimed!</span>
                    </div>
                 ) : (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={referralCodeInput}
                            onChange={(e) => setReferralCodeInput(e.target.value)}
                            placeholder="Enter friend's code"
                            className="flex-grow bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                        <button
                            onClick={handleClaim}
                            className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 hover:bg-green-600"
                        >
                            Claim
                        </button>
                    </div>
                 )}
            </div>

            <div className="space-y-3 overflow-y-auto pr-2 flex-grow">
                {friends.length > 0 ? (
                    friends
                        .sort((a, b) => b.score - a.score)
                        .map((friend, index) => {
                            const { currentLeague } = getLeagueInfo(friend.score);
                            return (
                                <div key={friend.id} className="bg-gray-800 p-3 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-bold text-gray-500 w-6 text-center">{index + 1}</span>
                                        <img src={friend.avatar} alt={friend.name} className="w-12 h-12 rounded-full border-2 border-gray-600" />
                                        <div>
                                            <h3 className="font-bold text-md">{friend.name}</h3>
                                            <div className="flex items-center gap-1.5 text-sm text-gray-400">
                                                <span>{currentLeague.icon}</span>
                                                <span>{currentLeague.name} &bull; {friend.score.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                ) : (
                    <div className="flex items-center justify-center h-full">
                         <p className="text-center text-gray-500 py-8">Invite your first fren to start building your squad!</p>
                    </div>
                )}
            </div>
        </div>
    );
};


const BottomNavBar: React.FC<{
    activeView: 'tap' | 'frens';
    setActiveView: (view: 'tap' | 'frens') => void;
    onBoostClick: () => void;
    isAnythingToClaim: boolean;
    onEarnClick: () => void;
}> = ({ activeView, setActiveView, onBoostClick, isAnythingToClaim, onEarnClick }) => (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/50 backdrop-blur-lg border-t border-gray-700">
        <div className="flex justify-around items-center max-w-lg mx-auto h-20">
            <button onClick={() => setActiveView('tap')} className={`flex flex-col items-center gap-1 ${activeView === 'tap' ? 'text-cyan-400' : 'text-gray-400 hover:text-white'} transition-colors duration-200`}>
                <div className={`p-3 rounded-lg ${activeView === 'tap' ? 'bg-cyan-400/20' : ''}`}>
                    <MineIcon className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold">Tap</span>
            </button>
            <button onClick={onBoostClick} className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors duration-200">
                <BoostIcon className="w-7 h-7" />
                <span className="text-xs font-bold">Boost</span>
            </button>
            <button
                onClick={onEarnClick}
                className={`relative flex flex-col items-center gap-1 ${isAnythingToClaim ? 'text-yellow-400' : 'text-gray-400'} transition-colors duration-200`}
            >
                 {isAnythingToClaim && (
                    <span className="absolute -top-0.5 right-3.5 flex h-3 w-3 z-10">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                    </span>
                )}
                <div className={`p-3 rounded-lg ${isAnythingToClaim ? 'bg-yellow-400/20 animate-pulse-glow' : ''}`}>
                    <EarnIcon className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold">Earn</span>
            </button>
            <button onClick={() => setActiveView('frens')} className={`flex flex-col items-center gap-1 ${activeView === 'frens' ? 'text-cyan-400' : 'text-gray-400 hover:text-white'} transition-colors duration-200`}>
                <div className={`p-3 rounded-lg ${activeView === 'frens' ? 'bg-cyan-400/20' : ''}`}>
                    <FriendsIcon className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold">Frens</span>
            </button>
        </div>
    </div>
);

const LoadingScreen: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-black text-white">
      <RocketLaunchIcon className="w-24 h-24 text-cyan-400 animate-pulse" />
      <p className="mt-4 text-xl font-semibold">Initializing...</p>
    </div>
);
  
const AccessDeniedScreen: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-black text-white text-center p-8">
      <img src="https://telegram.org/img/t_logo.svg" alt="Telegram Logo" className="w-24 h-24 mb-6" />
      <h1 className="text-3xl font-bold mb-2">Access Required</h1>
      <p className="text-lg text-gray-400">This is a Telegram Mini App.</p>
      <p className="text-lg text-gray-400">Please open it inside the Telegram app to play.</p>
    </div>
);


// --- Main App Component ---
export default function App() {
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const [score, setScore] = useState<number>(0);
  const [energy, setEnergy] = useState<number>(1000);
  const [tapAnimations, setTapAnimations] = useState<TapAnimation[]>([]);
  const [activeBoosts, setActiveBoosts] = useState<ActiveBoosts>({});
  const [isUpgradesModalOpen, setIsUpgradesModalOpen] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [activeView, setActiveView] = useState<'tap' | 'frens'>('tap');
  const [notification, setNotification] = useState<string | null>(null);
  const [lastClaimedDate, setLastClaimedDate] = useState<string | null>(null);
  const [isEarnModalOpen, setIsEarnModalOpen] = useState(false);
  const [totalTaps, setTotalTaps] = useState<number>(0);
  const [claimedTasks, setClaimedTasks] = useState<TaskId[]>([]);
  const [inviteCode, setInviteCode] = useState<string>('');
  const [hasUsedReferral, setHasUsedReferral] = useState<boolean>(false);

  // Permanent Upgrades State
  const [tapLevel, setTapLevel] = useState<number>(1);
  const [energyLevel, setEnergyLevel] = useState<number>(1);

  // Derived state for upgrades
  const tapValue = useMemo(() => 1 + tapLevel - 1, [tapLevel]);
  const maxEnergy = useMemo(() => 1000 + (energyLevel - 1) * 500, [energyLevel]);
  const tapUpgradeCost = useMemo(() => Math.floor(250 * Math.pow(1.25, tapLevel - 1)), [tapLevel]);
  const energyUpgradeCost = useMemo(() => Math.floor(400 * Math.pow(1.3, energyLevel - 1)), [energyLevel]);

  // Initialize Telegram Web App
  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        setTelegramUser(tg.initDataUnsafe.user);
      }
    }
    // Set a timeout to handle cases where the app is not in Telegram
    // after a short delay, to avoid showing loader indefinitely.
    const timer = setTimeout(() => {
        setIsInitializing(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Load state from localStorage, scoped to telegram user ID
  useEffect(() => {
    if (!telegramUser) return;
    const userId = telegramUser.id;

    const savedScore = localStorage.getItem(`tapScore_${userId}`);
    const savedEnergy = localStorage.getItem(`tapEnergy_${userId}`);
    const savedFriends = localStorage.getItem(`tapFriends_${userId}`);
    const savedLastClaimedDate = localStorage.getItem(`tapLastClaimedDate_${userId}`);
    const savedTotalTaps = localStorage.getItem(`tapTotalTaps_${userId}`);
    const savedClaimedTasks = localStorage.getItem(`tapClaimedTasks_${userId}`);
    const savedInviteCode = localStorage.getItem(`tapInviteCode_${userId}`);
    const savedHasUsedReferral = localStorage.getItem(`tapHasUsedReferral_${userId}`);
    const savedTapLevel = localStorage.getItem(`tapLevel_${userId}`);
    const savedEnergyLevel = localStorage.getItem(`tapEnergyLevel_${userId}`);


    if (savedScore) setScore(parseInt(savedScore, 10));
    if (savedEnergy) setEnergy(parseInt(savedEnergy, 10));
    if (savedFriends) setFriends(JSON.parse(savedFriends));
    if (savedLastClaimedDate) setLastClaimedDate(savedLastClaimedDate);
    if (savedTotalTaps) setTotalTaps(parseInt(savedTotalTaps, 10));
    if (savedClaimedTasks) setClaimedTasks(JSON.parse(savedClaimedTasks));
    if (savedHasUsedReferral) setHasUsedReferral(savedHasUsedReferral === 'true');
    if (savedTapLevel) setTapLevel(parseInt(savedTapLevel, 10));
    if (savedEnergyLevel) setEnergyLevel(parseInt(savedEnergyLevel, 10));
    
    if (savedInviteCode) {
        setInviteCode(savedInviteCode);
    } else {
        const newCode = `TCM-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        setInviteCode(newCode);
        localStorage.setItem(`tapInviteCode_${userId}`, newCode);
    }
  }, [telegramUser]);

  // Save state to localStorage, scoped to telegram user ID
  useEffect(() => {
    if (!telegramUser) return;
    const userId = telegramUser.id;
    localStorage.setItem(`tapScore_${userId}`, score.toString());
    localStorage.setItem(`tapEnergy_${userId}`, energy.toString());
    localStorage.setItem(`tapFriends_${userId}`, JSON.stringify(friends));
    if (lastClaimedDate) localStorage.setItem(`tapLastClaimedDate_${userId}`, lastClaimedDate);
    localStorage.setItem(`tapTotalTaps_${userId}`, totalTaps.toString());
    localStorage.setItem(`tapClaimedTasks_${userId}`, JSON.stringify(claimedTasks));
    localStorage.setItem(`tapHasUsedReferral_${userId}`, String(hasUsedReferral));
    localStorage.setItem(`tapLevel_${userId}`, tapLevel.toString());
    localStorage.setItem(`tapEnergyLevel_${userId}`, energyLevel.toString());
  }, [score, energy, friends, lastClaimedDate, totalTaps, claimedTasks, hasUsedReferral, tapLevel, energyLevel, telegramUser]);


  const isDailyRewardAvailable = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return lastClaimedDate !== today;
  }, [lastClaimedDate]);

  // Energy regeneration
  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy((prevEnergy) => Math.min(maxEnergy, prevEnergy + ENERGY_REGEN_RATE));
    }, 1000);
    return () => clearInterval(interval);
  }, [maxEnergy]);

  // Active boosts countdown & cleanup
  useEffect(() => {
    const interval = setInterval(() => {
        const now = Date.now();
        let boostsChanged = false;
        const newActiveBoosts: ActiveBoosts = {};
        
        Object.entries(activeBoosts).forEach(([key, value]) => {
            if (value && (value as ActiveBoost).endTime > now) {
                newActiveBoosts[key as BoostId] = value as ActiveBoost;
            } else {
                boostsChanged = true;
            }
        });

        if (boostsChanged) {
            setActiveBoosts(newActiveBoosts);
        }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeBoosts]);

  // Auto-miner passive income
  useEffect(() => {
      let autoMineInterval: number | undefined;
      const autoMineBoost = activeBoosts.auto_mine;

      if (autoMineBoost && autoMineBoost.endTime > Date.now()) {
          autoMineInterval = window.setInterval(() => {
              const currentAutoMineBoost = activeBoosts.auto_mine;
              if (currentAutoMineBoost && currentAutoMineBoost.endTime > Date.now()) {
                   setScore(prevScore => prevScore + AUTO_MINE_RATE);
              } else {
                  clearInterval(autoMineInterval);
              }
          }, 1000);
      }

      return () => {
          if (autoMineInterval) {
              clearInterval(autoMineInterval);
          }
      };
  }, [activeBoosts]);

  const effectiveTapValue = useMemo(() => {
    let value = tapValue;
    const now = Date.now();
    if (activeBoosts.turbo_tap?.endTime > now) {
        value *= 2;
    }
    if (activeBoosts.multi_tap?.endTime > now) {
        value *= 5;
    }
    return value;
  }, [tapValue, activeBoosts]);
  
  const showNotification = useCallback((message: string) => {
    setNotification(message);
    setTimeout(() => {
        setNotification(prev => (prev === message ? null : prev));
    }, 3000);
  }, []);

  const handleTap = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (energy >= ENERGY_PER_TAP) {
      playSound(TAP_SOUND_URL);
      setScore((prevScore) => prevScore + effectiveTapValue);
      setEnergy((prevEnergy) => prevEnergy - ENERGY_PER_TAP);
      setTotalTaps(prev => prev + 1);
      
      if (window.navigator.vibrate) window.navigator.vibrate(50);
      
      const newAnimation: TapAnimation = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
      };

      setTapAnimations((prev) => [...prev, newAnimation]);
      setTimeout(() => setTapAnimations((prev) => prev.filter(anim => anim.id !== newAnimation.id)), 1000);
    }
  }, [energy, effectiveTapValue]);

  const handlePurchaseBoost = (boost: Boost) => {
      if (score >= boost.cost) {
          playSound(PURCHASE_SOUND_URL);
          setScore(s => s - boost.cost);
          if (boost.id === 'full_energy') {
              setEnergy(maxEnergy);
          } else if (boost.duration) {
              setActiveBoosts(prev => ({
                  ...prev,
                  [boost.id]: { endTime: Date.now() + boost.duration! * 1000 }
              }));
          }
          setIsUpgradesModalOpen(false);
      }
  };
  
  const handleUpgradeTap = () => {
    if (score >= tapUpgradeCost) {
      playSound(PURCHASE_SOUND_URL);
      setScore(s => s - tapUpgradeCost);
      setTapLevel(l => l + 1);
    }
  };

  const handleUpgradeEnergy = () => {
    if (score >= energyUpgradeCost) {
      playSound(PURCHASE_SOUND_URL);
      setScore(s => s - energyUpgradeCost);
      setEnergyLevel(l => l + 1);
    }
  };

  const handleRefillEnergy = useCallback(() => {
    const energyRefillCost = Math.floor(maxEnergy / 2);
    if (score >= energyRefillCost && energy < maxEnergy) {
        playSound(PURCHASE_SOUND_URL);
        setScore(s => s - energyRefillCost);
        setEnergy(maxEnergy);
    }
  }, [score, energy, maxEnergy]);

  const handleAddFriend = (name: string) => {
    const newFriend: Friend = {
        id: Date.now(),
        name,
        score: Math.floor(Math.random() * (score + 5000)),
        avatar: `https://i.pravatar.cc/80?u=${Date.now()}`
    };
    setFriends(prev => [...prev, newFriend]);
    setScore(s => s + INVITE_BONUS);
    
    showNotification(`+${INVITE_BONUS.toLocaleString()} for inviting ${name}!`);
  };

  const handleClaimDailyReward = () => {
    if (!isDailyRewardAvailable) return;

    playSound(CLAIM_SOUND_URL);
    setScore(s => s + DAILY_REWARD_COINS);
    setEnergy(maxEnergy);

    const today = new Date().toISOString().split('T')[0];
    setLastClaimedDate(today);

    setIsEarnModalOpen(false);

    showNotification(`+${DAILY_REWARD_COINS.toLocaleString()} coins & full energy!`);
  };
  
  const handleClaimTask = (taskId: TaskId) => {
    const task = TASKS.find(t => t.id === taskId);
    if (!task) return;

    const progress = task.getProgress({ totalTaps, friends, score });
    const isCompleted = progress >= task.goal;
    const isClaimed = claimedTasks.includes(taskId);

    if (isCompleted && !isClaimed) {
        playSound(CLAIM_SOUND_URL);
        setScore(s => s + task.reward);
        setClaimedTasks(prev => [...prev, taskId]);
        showNotification(`+${task.reward.toLocaleString()} for completing task!`);
    }
  };
  
  const handleClaimReferral = (code: string) => {
    const trimmedCode = code.trim();

    if (hasUsedReferral) {
        showNotification("You've already used a referral code.");
        return;
    }

    if (!trimmedCode) {
        showNotification("Please enter a referral code.");
        return;
    }
    
    if (trimmedCode === inviteCode) {
        showNotification("You can't use your own code!");
        return;
    }

    // In a real app, you'd validate the code against a backend.
    // For this demo, any non-empty code that isn't the user's own works.
    playSound(BONUS_SOUND_URL);
    setScore(s => s + REFERRAL_BONUS);
    setHasUsedReferral(true);
    showNotification(`+${REFERRAL_BONUS.toLocaleString()} bonus claimed!`);
  };

  const isAnythingToClaim = useMemo(() => {
    if (isDailyRewardAvailable) return true;
    for (const task of TASKS) {
        const progress = task.getProgress({ totalTaps, friends, score });
        if (progress >= task.goal && !claimedTasks.includes(task.id)) {
            return true;
        }
    }
    return false;
  }, [isDailyRewardAvailable, totalTaps, friends, score, claimedTasks]);

  if (isInitializing) {
    return <LoadingScreen />;
  }

  if (!telegramUser) {
    return <AccessDeniedScreen />;
  }

  return (
    <>
      <EarnModal
        isOpen={isEarnModalOpen}
        onClose={() => setIsEarnModalOpen(false)}
        isDailyRewardAvailable={isDailyRewardAvailable}
        onClaimDailyReward={handleClaimDailyReward}
        tasks={TASKS}
        totalTaps={totalTaps}
        friends={friends}
        score={score}
        claimedTasks={claimedTasks}
        onClaimTask={handleClaimTask}
      />
      <UpgradesModal
        isOpen={isUpgradesModalOpen}
        onClose={() => setIsUpgradesModalOpen(false)}
        onPurchaseBoost={handlePurchaseBoost}
        score={score}
        tapLevel={tapLevel}
        energyLevel={energyLevel}
        tapValue={tapValue}
        maxEnergy={maxEnergy}
        tapUpgradeCost={tapUpgradeCost}
        energyUpgradeCost={energyUpgradeCost}
        onUpgradeTap={handleUpgradeTap}
        onUpgradeEnergy={handleUpgradeEnergy}
      />
      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-28 left-1/2 -translate-x-1/2 z-50 bg-green-600/90 backdrop-blur-sm text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-500 ease-in-out transform ${
            notification ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {notification}
      </div>
      <div className="bg-gradient-to-b from-gray-900 via-indigo-900 to-black h-screen w-screen text-white font-sans flex flex-col items-center select-none overflow-hidden">
          {tapAnimations.map((anim) => (
              <div
                  key={anim.id}
                  className="absolute text-5xl font-bold text-white opacity-100 pointer-events-none animate-fade-up"
                  style={{ 
                      left: anim.x, 
                      top: anim.y, 
                      transform: 'translate(-50%, -50%)',
                      textShadow: '0 0 10px rgba(255,255,255,0.5)' 
                  }}
              >
                  +{effectiveTapValue}
              </div>
          ))}
        
        <div className="w-full max-w-lg mx-auto flex flex-col h-full px-4 pt-8 pb-24">
            <header className="w-full flex flex-col items-center gap-4 flex-shrink-0">
                <div className="text-center">
                    <p className="text-lg font-semibold text-gray-300">Welcome, {telegramUser.first_name}!</p>
                </div>
                <div className="flex items-center gap-2">
                    <img src="https://picsum.photos/40/40?grayscale" alt="coin" className="w-12 h-12 rounded-full border-2 border-yellow-400" />
                    <span className="text-5xl font-bold">{score.toLocaleString()}</span>
                </div>
                <LeagueDisplay score={score} />
            </header>

            {activeView === 'tap' && (
                <TapView 
                    activeBoosts={activeBoosts}
                    handleTap={handleTap}
                    energy={energy}
                    maxEnergy={maxEnergy}
                    handleRefillEnergy={handleRefillEnergy}
                    score={score}
                />
            )}

            {activeView === 'frens' && (
                <FriendsView 
                    friends={friends} 
                    onAddFriend={handleAddFriend}
                    inviteCode={inviteCode}
                    hasUsedReferral={hasUsedReferral}
                    onClaimReferral={handleClaimReferral}
                    showNotification={showNotification}
                />
            )}
        </div>

        <BottomNavBar 
            activeView={activeView}
            setActiveView={setActiveView}
            onBoostClick={() => setIsUpgradesModalOpen(true)}
            isAnythingToClaim={isAnythingToClaim}
            onEarnClick={() => setIsEarnModalOpen(true)}
        />
      </div>
    </>
  );
}