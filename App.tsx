


import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import type { Wallet } from '@tonconnect/ui-react';
import { HomeIcon, MineIcon, FriendsIcon, EarnIcon, BoostIcon, EnergyIcon, RocketLaunchIcon, PlusIcon, MultiTapIcon, AutoMineIcon, GiftIcon, CheckBadgeIcon, TargetIcon, ClipboardIcon, ArrowUpCircleIcon, StarIcon, WalletIcon } from './components/Icons';
import { useAdsgram } from './hooks/useAdsgram';
import { TonConnectButton } from './components/TonConnectButton';
import type { ShowPromiseResult } from './types/adsgram';


// --- Type Definitions ---
type TapAnimation = {
  id: number;
  x: number;
  y: number;
  value: number;
  isBonus: boolean;
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
    name:string;
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

type SpinRewardType = 'coins' | 'energy' | 'boost_turbo_tap' | 'boost_multi_tap';

type SpinReward = {
    type: SpinRewardType;
    value: number; // For coins, the amount. For energy, 1=full. For boosts, duration.
    label: string;
};

type GiftBoxReward = {
    type: 'coins' | 'energy' | 'boost_turbo_tap';
    value: number;
    label: string;
};

type ActiveView = 'tap' | 'frens' | 'wallet';

type SavedState = {
    score: number;
    energy: number;
    lastEnergyUpdate: number;
    tapLevel: number;
    energyLevel: number;
    lastDailyReward: string | null;
    claimedTasks: TaskId[];
    totalTaps: number;
    lastSpin: string | null;
    lastGiftBoxOpen: string | null;
    claimedStreakMilestones: number[];
    lastStreakClaimDate: string | null;
    adsViewed: number;
    timeSpent: number;
    tonPurchases: number;
    activeBoosts: ActiveBoosts;
};

// --- TypeScript Declarations for Telegram Web App ---
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initDataUnsafe?: {
          start_param?: string;
        };
        openTelegramLink: (url: string) => void;
        ready: () => void;
      }
    };
  }
}


// --- Constants ---
const ENERGY_REGEN_RATE = 2; // per second
const ENERGY_PER_TAP = 1;
const INVITE_BONUS = 1000;
const AUTO_MINE_RATE = 5; // coins per second
const DAILY_REWARD_COINS = 500;
const STREAK_TIMEOUT = 1500; // ms to keep streak alive
const STREAK_MILESTONES: { [key: number]: number } = {
  10: 2, // At 10 taps, get 2x bonus
  25: 3,
  50: 5,
  100: 10,
};

const STREAK_REWARDS: { [key: number]: number } = {
  10: 100,
  25: 300,
  50: 750,
  100: 2000,
};


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

const WHEEL_REWARDS: SpinReward[] = [
    { type: 'coins', value: 500, label: '500' },
    { type: 'energy', value: 1, label: '⚡️' },
    { type: 'coins', value: 2500, label: '2.5k' },
    { type: 'boost_turbo_tap', value: 30, label: 'Turbo' },
    { type: 'coins', value: 1000, label: '1k' },
    { type: 'coins', value: 100, label: '100' },
    { type: 'coins', value: 5000, label: '5k' },
    { type: 'boost_multi_tap', value: 20, label: 'Multi' },
];

const GIFT_BOX_REWARDS: GiftBoxReward[] = [
    { type: 'coins', value: 250, label: '250 Coins' },
    { type: 'coins', value: 1000, label: '1,000 Coins' },
    { type: 'coins', value: 5000, label: '5,000 Coins' },
    { type: 'energy', value: 500, label: '500 Energy' },
    { type: 'boost_turbo_tap', value: 15, label: '15s Turbo Tap Boost' },
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

const getInitialState = (): SavedState => {
    try {
        const savedStateJSON = localStorage.getItem('tapCoinMinerState');
        if (savedStateJSON) {
            const savedState: Partial<SavedState> = JSON.parse(savedStateJSON);
            const energyLevel = savedState.energyLevel || 1;
            const maxEnergyValue = 500 + energyLevel * 500;
            const now = Date.now();
            const lastUpdate = savedState.lastEnergyUpdate || now;
            const timeDiffSeconds = Math.max(0, Math.floor((now - lastUpdate) / 1000));
            const energyToRegen = timeDiffSeconds * ENERGY_REGEN_RATE;
            const energy = Math.min(maxEnergyValue, (savedState.energy || 1000) + energyToRegen);

            return {
                score: savedState.score || 0,
                energy: energy,
                lastEnergyUpdate: now,
                tapLevel: savedState.tapLevel || 1,
                energyLevel: energyLevel,
                lastDailyReward: savedState.lastDailyReward || null,
                claimedTasks: savedState.claimedTasks || [],
                totalTaps: savedState.totalTaps || 0,
                lastSpin: savedState.lastSpin || null,
                lastGiftBoxOpen: savedState.lastGiftBoxOpen || null,
                claimedStreakMilestones: savedState.claimedStreakMilestones || [],
                lastStreakClaimDate: savedState.lastStreakClaimDate || null,
                adsViewed: savedState.adsViewed || 0,
                timeSpent: savedState.timeSpent || 0,
                tonPurchases: savedState.tonPurchases || 0,
                activeBoosts: savedState.activeBoosts || {},
            };
        }
    } catch (error) {
        console.error("Could not load game state, using defaults.", error);
    }
    return {
        score: 0,
        energy: 1000,
        lastEnergyUpdate: Date.now(),
        tapLevel: 1,
        energyLevel: 1,
        lastDailyReward: null,
        claimedTasks: [],
        totalTaps: 0,
        lastSpin: null,
        lastGiftBoxOpen: null,
        claimedStreakMilestones: [],
        lastStreakClaimDate: null,
        adsViewed: 0,
        timeSpent: 0,
        tonPurchases: 0,
        activeBoosts: {},
    };
};


// --- Components ---
const Notification: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => (
    <div className="fixed top-5 right-5 bg-green-500/90 backdrop-blur-sm border border-green-400 text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-fade-in flex items-center gap-4">
        <span>{message}</span>
        <button onClick={onClose} className="text-lg font-bold opacity-70 hover:opacity-100">&times;</button>
    </div>
);

const GiftBoxModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    reward: GiftBoxReward | null;
}> = ({ isOpen, onClose, reward }) => {
    if (!isOpen || !reward) return null;

    const getRewardIcon = () => {
        switch(reward.type) {
            case 'coins': return <img src="https://picsum.photos/24/24?grayscale" className="w-12 h-12 rounded-full" alt="Coins icon" />;
            case 'energy': return <EnergyIcon className="w-12 h-12 text-yellow-400" />;
            case 'boost_turbo_tap': return <RocketLaunchIcon className="w-12 h-12 text-cyan-400" />;
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-gray-900 border border-yellow-500 rounded-2xl w-11/12 max-w-sm p-8 text-center shadow-lg shadow-yellow-500/20 flex flex-col items-center" onClick={e => e.stopPropagation()}>
                <GiftIcon className="w-24 h-24 text-yellow-400 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Daily Gift!</h2>
                <p className="text-gray-400 mb-6">You've received a special reward!</p>
                <div className="bg-gray-800 rounded-lg p-4 w-full flex flex-col items-center gap-2 mb-6">
                    {getRewardIcon()}
                    <p className="text-xl font-bold text-white">{reward.label}</p>
                </div>
                <button
                    onClick={onClose}
                    className="w-full bg-yellow-500 text-black font-bold py-3 px-4 rounded-lg transition-transform duration-200 hover:scale-105"
                >
                    Awesome!
                </button>
            </div>
        </div>
    );
};

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
    isSpinAvailable: boolean;
    onSpin: () => void;
    isSpinning: boolean;
    wheelRotation: number;
    showAdAndDo: (action: () => void) => void;
}> = ({
    isOpen, onClose, isDailyRewardAvailable, onClaimDailyReward, tasks,
    totalTaps, friends, score, claimedTasks, onClaimTask,
    isSpinAvailable, onSpin, isSpinning, wheelRotation, showAdAndDo
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-gray-900 border border-yellow-500 rounded-2xl w-11/12 max-w-md p-6 text-center shadow-lg shadow-yellow-500/20 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <h2 className="text-3xl font-bold text-white mb-6 flex-shrink-0">Earn Coins</h2>

                <div className="overflow-y-auto pr-2 space-y-6">
                    {/* Daily Spin Section */}
                    <div className={`bg-gray-800 p-4 rounded-lg ${isSpinAvailable ? 'animate-pulse-glow' : ''}`}>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="bg-purple-400/20 p-3 rounded-full">
                                <StarIcon className="w-8 h-8 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-left">Daily Spin</h3>
                                <p className="text-sm text-gray-400 text-left">{isSpinAvailable ? "Feeling lucky? Spin the wheel!" : "Come back tomorrow for another spin."}</p>
                            </div>
                        </div>
                        <div className="wheel-container">
                            <div className="wheel-pointer"></div>
                            <div className="wheel-center"></div>
                            <div className="wheel" style={{ transform: `rotate(${wheelRotation}deg)` }}></div>
                            {WHEEL_REWARDS.map((reward, index) => {
                                const angle = (index * 45) + (45 / 2); // Center the label in the segment
                                const radius = 95;
                                const x = 125 + radius * Math.cos(angle * Math.PI / 180);
                                const y = 125 + radius * Math.sin(angle * Math.PI / 180);
                                return <div key={index} className="wheel-label" style={{ left: `${x}px`, top: `${y}px` }}>{reward.label}</div>
                            })}
                        </div>
                        <button
                            onClick={() => showAdAndDo(onSpin)}
                            disabled={!isSpinAvailable || isSpinning}
                            className="w-full bg-purple-500 text-white font-bold py-2.5 px-4 rounded-lg transition-transform duration-200 hover:scale-105 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isSpinning ? 'Spinning...' : 'Spin'}
                        </button>
                    </div>

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
                                    onClick={() => showAdAndDo(onClaimDailyReward)}
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
                                            onClick={() => showAdAndDo(() => onClaimTask(task.id))}
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
    onPurchaseWithTon: () => void;
    showAdAndDo: (action: () => void) => void;
}> = ({ 
    isOpen, onClose, onPurchaseBoost, score,
    tapLevel, energyLevel, tapValue, maxEnergy,
    tapUpgradeCost, energyUpgradeCost, onUpgradeTap, onUpgradeEnergy,
    onPurchaseWithTon, showAdAndDo
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
                                    onClick={() => showAdAndDo(onUpgradeTap)}
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
                                    onClick={() => showAdAndDo(onUpgradeEnergy)}
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
                                            onClick={() => showAdAndDo(() => onPurchaseBoost(boost))}
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
                     {/* TON Specials */}
                    <div className="bg-gray-800 p-4 rounded-lg border border-green-500/50">
                        <h3 className="font-bold text-lg text-left mb-4 text-green-300">TON Specials</h3>
                        <div className="bg-gray-700 p-3 rounded-lg flex items-center justify-between gap-2">
                            <div className="flex items-center gap-3">
                                <div className="bg-gray-600 p-2 rounded-full"><AutoMineIcon className="w-7 h-7 text-green-400" /></div>
                                <div>
                                    <p className="font-bold">Super Auto Miner</p>
                                    <p className="text-sm text-gray-400">Mine automatically for 24 hours!</p>
                                </div>
                            </div>
                            <button
                                onClick={onPurchaseWithTon}
                                className="bg-green-600 text-white font-bold py-2 px-3 rounded-lg text-sm transition-colors duration-200 flex items-center gap-2 hover:bg-green-700 animate-pulse-glow-green"
                            >
                                <WalletIcon className="w-5 h-5"/>
                                <span>Buy with TON</span>
                            </button>
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

const StreakRewardsDisplay: React.FC<{
    currentStreak: number;
    onClaimReward: (milestone: number) => void;
    claimedMilestones: number[];
}> = ({ currentStreak, onClaimReward, claimedMilestones }) => {
    return (
        <div className="flex justify-center items-center gap-2 w-full my-4">
            {Object.entries(STREAK_REWARDS).map(([milestoneStr, reward]) => {
                const milestone = parseInt(milestoneStr, 10);
                const isClaimed = claimedMilestones.includes(milestone);
                const isReachable = currentStreak >= milestone;
                const isClaimable = isReachable && !isClaimed;

                return (
                    <button
                        key={milestone}
                        onClick={() => onClaimReward(milestone)}
                        disabled={!isReachable || isClaimed}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg w-16 h-20 text-xs font-bold transition-all duration-200 border-2 ${
                            isClaimed
                                ? 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed'
                                : isReachable
                                ? 'bg-cyan-500/20 border-cyan-500 text-white'
                                : 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed'
                        } ${isClaimable ? 'animate-pulse-glow-cyan' : ''}`}
                    >
                        {isClaimed ? (
                             <CheckBadgeIcon className="w-6 h-6 mb-1 text-green-400" />
                        ) : (
                            <span className="text-xl">🔥</span>
                        )}
                        <span className="text-sm font-bold">{milestone}</span>
                        {!isClaimed && (
                             <span className="text-yellow-400 mt-1">+{reward.toLocaleString()}</span>
                        )}
                    </button>
                );
            })}
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
    tapStreak: number;
    isGiftBoxAvailable: boolean;
    onOpenGiftBox: () => void;
    claimedStreakMilestones: number[];
    onClaimStreakReward: (milestone: number) => void;
}> = ({ activeBoosts, handleTap, energy, maxEnergy, handleRefillEnergy, score, tapStreak, isGiftBoxAvailable, onOpenGiftBox, claimedStreakMilestones, onClaimStreakReward }) => {
    const energyPercentage = (energy / maxEnergy) * 100;
    const energyRefillCost = Math.floor(maxEnergy / 2);
    const [isTapped, setIsTapped] = useState(false);

    const isTurboActive = useMemo(() => {
        const turbo = activeBoosts.turbo_tap;
        return !!turbo && turbo.endTime > Date.now();
    }, [activeBoosts.turbo_tap]);

    const onCoinTap = (e: React.MouseEvent<HTMLButtonElement>) => {
        handleTap(e);
        if (energy >= ENERGY_PER_TAP) { // Only animate if tap is successful
          setIsTapped(true);
          setTimeout(() => setIsTapped(false), 100);
        }
    };


    return (
        <div className="relative flex flex-col items-center justify-between h-full w-full animate-fade-in">
            <ActiveBoostsDisplay activeBoosts={activeBoosts} />
            
            <div className="absolute top-4 right-4 z-10">
                <button
                    onClick={onOpenGiftBox}
                    disabled={!isGiftBoxAvailable}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                        isGiftBoxAvailable
                            ? 'bg-yellow-500 animate-pulse-glow'
                            : 'bg-gray-700'
                    }`}
                    aria-label="Open daily gift box"
                >
                    <GiftIcon className={`w-9 h-9 ${isGiftBoxAvailable ? 'text-black' : 'text-gray-400'}`} />
                </button>
            </div>

            {/* Streak Counter */}
            <div className={`absolute top-0 z-10 transition-all duration-300 ease-in-out ${tapStreak > 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
                <div className="bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full flex items-center gap-2 text-lg font-bold border border-orange-500/50 shadow-lg animate-pulse-glow">
                    <span className="text-orange-400 text-2xl">🔥</span>
                    <span>{tapStreak}</span>
                </div>
            </div>

            <main className="flex flex-col items-center gap-2 flex-grow justify-center">
                <button
                    onClick={onCoinTap}
                    className={`w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-orange-600 flex items-center justify-center focus:outline-none border-4 border-yellow-700/80 relative ${isTapped ? 'animate-coin-tap' : ''} ${
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
                <StreakRewardsDisplay
                    currentStreak={tapStreak}
                    onClaimReward={onClaimStreakReward}
                    claimedMilestones={claimedStreakMilestones}
                />
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
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full transition-all duration-500 ease-out animate-pulse-glow"
                        style={{ width: `${energyPercentage}%` }}
                    ></div>
                </div>
            </footer>
        </div>
    );
};

const FriendsView: React.FC<{
    friends: Friend[];
    referralCode: string;
    onCopyReferralCode: () => void;
    onClaimInvite: () => void;
    inviteCodeInput: string;
    setInviteCodeInput: (value: string) => void;
    tasks: Task[];
    totalTaps: number;
    score: number;
    claimedTasks: TaskId[];
    onClaimTask: (taskId: TaskId) => void;
    showAdAndDo: (action: () => void) => void;
}> = ({ friends, referralCode, onCopyReferralCode, onClaimInvite, inviteCodeInput, setInviteCodeInput, tasks, totalTaps, score, claimedTasks, onClaimTask, showAdAndDo }) => {
    return (
        <div className="flex flex-col items-center justify-start h-full w-full text-white p-4 pt-2 animate-fade-in overflow-y-auto">
            <div className="w-full max-w-sm space-y-6">
                {/* Invite Frens & Earn card */}
                <div className="w-full bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                    <h3 className="text-xl font-bold text-center mb-1">Invite Frens & Earn</h3>
                    <p className="text-sm text-gray-400 text-center mb-4">You get {INVITE_BONUS.toLocaleString()} coins for each invite!</p>
                    <div className="flex items-center gap-2 bg-gray-900/50 p-2 rounded-lg">
                        <span className="flex-grow text-center font-mono text-lg">{referralCode}</span>
                        <button onClick={onCopyReferralCode} className="bg-cyan-500 text-white p-3 rounded-lg hover:bg-cyan-600 transition-colors duration-200" aria-label="Copy referral code">
                            <ClipboardIcon className="w-6 h-6"/>
                        </button>
                    </div>
                </div>

                {/* Got an Invite? card */}
                <div className="w-full bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                    <h3 className="text-xl font-bold text-center mb-3">Got an Invite?</h3>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={inviteCodeInput}
                            onChange={(e) => setInviteCodeInput(e.target.value)}
                            placeholder="Enter friend's code"
                            className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                        <button onClick={onClaimInvite} className="bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-colors duration-200">
                            Claim
                        </button>
                    </div>
                </div>
                
                {/* Referral Tasks Section */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                     <h3 className="text-xl font-bold text-center mb-4">Referral Tasks</h3>
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
                                        onClick={() => showAdAndDo(() => onClaimTask(task.id))}
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
            
            {/* Friends list */}
            <div className="w-full max-w-sm bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 mt-6">
                <h3 className="text-lg font-bold mb-3">Your Squad ({friends.length})</h3>
                <div className="space-y-2">
                    {friends.length > 0 ? friends.map(friend => (
                        <div key={friend.id} className="bg-gray-700 p-2.5 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img src={friend.avatar} alt={friend.name} className="w-10 h-10 rounded-full" />
                                <div>
                                    <p className="font-semibold">{friend.name}</p>
                                    <p className="text-xs text-gray-400">{friend.score.toLocaleString()} points</p>
                                </div>
                            </div>
                            <span className="text-yellow-400 font-bold">+{INVITE_BONUS.toLocaleString()}</span>
                        </div>
                    )) : (
                        <p className="text-gray-500 text-center py-4">Your squad is empty. Invite your first fren!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const WalletView: React.FC<{
    score: number;
    adsViewed: number;
    referrals: number;
    timeSpent: number;
    tonPurchases: number;
    connected: boolean;
    onConnect: () => void;
    wallet: Wallet | null;
    showNotification: (message: string) => void;
}> = ({ score, adsViewed, referrals, timeSpent, tonPurchases, connected, onConnect, wallet, showNotification }) => {
    
    const handleCopyAddress = useCallback((address: string) => {
        navigator.clipboard.writeText(address).then(() => {
            showNotification('Address copied to clipboard!');
        });
    }, [showNotification]);

    if (!connected) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full text-white p-4 animate-fade-in">
                <div className="w-full max-w-sm text-center bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 shadow-lg">
                    <WalletIcon className="w-16 h-16 mx-auto mb-4 text-cyan-400" />
                    <h3 className="text-2xl font-bold mb-2">Connect Your Wallet</h3>
                    <p className="text-gray-400 mb-6">
                        Connect your TON wallet to see your airdrop estimations and manage your assets.
                    </p>
                    <button
                        onClick={onConnect}
                        className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg transition-transform duration-200 hover:scale-105"
                    >
                        Connect Wallet
                    </button>
                </div>
            </div>
        );
    }
    
    const AIRDROP_POOL = 17_000_000;
    const TEAM_POOL = 4_000_000;
    const TOTAL_SUPPLY = 21_000_000;
    // This is a fictional number representing the estimated total shares of all users in the future
    // over a 10-year period. It's used to give the user a rough estimate of their potential reward.
    const ESTIMATED_TOTAL_COMMUNITY_SHARES = 50_000_000_000_000;

    // Define weights for each factor contributing to the airdrop
    const WEIGHTS = {
        SCORE: 1,
        REFERRAL: 10000, // Each friend is worth 10,000 points
        AD_VIEW: 500,     // Each ad view is worth 500 points
        TIME_SPENT: 1/10, // 1 share point for every 10 seconds
        TON_PURCHASE: 100000 // Each TON purchase is worth 100,000 points
    };

    const scoreShares = score * WEIGHTS.SCORE;
    const referralShares = referrals * WEIGHTS.REFERRAL;
    const adShares = adsViewed * WEIGHTS.AD_VIEW;
    const timeShares = Math.floor(timeSpent * WEIGHTS.TIME_SPENT);
    const purchaseShares = tonPurchases * WEIGHTS.TON_PURCHASE;

    const totalUserShares = scoreShares + referralShares + adShares + timeShares + purchaseShares;

    const estimatedTokens = (totalUserShares / ESTIMATED_TOTAL_COMMUNITY_SHARES) * AIRDROP_POOL;
    
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    return (
        <div className="flex flex-col items-center justify-start h-full w-full text-white p-4 pt-2 animate-fade-in overflow-y-auto">
            <div className="w-full max-w-sm">
                <h2 className="text-3xl font-bold mb-2 text-center">Wallet</h2>
                <p className="text-gray-400 mb-6 text-center">Your in-game assets and token information.</p>

                {wallet && (
                    <div className="w-full bg-gray-800 rounded-xl p-4 space-y-2 border border-gray-700 shadow-lg mb-6">
                        <div className="flex justify-between items-center text-sm text-gray-400">
                            <span>Connected Wallet</span>
                            <span className="font-bold text-cyan-400">TON</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-md text-white flex-grow truncate" title={wallet.account.address}>
                                {wallet.account.address}
                            </span>
                            <button
                                onClick={() => handleCopyAddress(wallet.account.address)}
                                className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors flex-shrink-0"
                                aria-label="Copy wallet address"
                            >
                                <ClipboardIcon className="w-5 h-5 text-gray-300" />
                            </button>
                        </div>
                    </div>
                )}

                <div className="w-full bg-gray-800 rounded-xl p-6 space-y-4 border border-gray-700 shadow-lg shadow-yellow-500/10 mb-6">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-300">Your Balance</span>
                        <div className="flex items-center gap-2 text-2xl font-bold text-yellow-400">
                            <EnergyIcon className="w-6 h-6" />
                            <span>{Math.floor(score).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="w-full bg-gray-800 rounded-xl p-6 space-y-3 border border-cyan-500/50 shadow-lg shadow-cyan-500/10 mb-6">
                    <h3 className="font-bold text-cyan-300 text-left text-xl flex items-center gap-2 mb-4">
                        <GiftIcon className="w-6 h-6"/>
                        <span>Airdrop Estimation</span>
                    </h3>
                    
                    <div className="bg-gray-900/50 p-4 rounded-lg text-center">
                        <p className="text-gray-400 text-sm">You will receive an estimated</p>
                        <p className="text-3xl font-bold text-white my-2">{estimatedTokens.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ELZR</p>
                        <p className="text-gray-500 text-xs">Based on your {totalUserShares.toLocaleString()} shares</p>
                    </div>

                    <div className="!my-4 border-t border-gray-700"></div>

                    <p className="text-sm text-gray-400">Your total shares are calculated based on:</p>
                    <div className="text-left text-sm space-y-2 text-gray-300">
                        <div className="flex justify-between items-center bg-gray-700/50 p-2 rounded-md"><span>Score ({score.toLocaleString()})</span><span className="font-bold text-white font-mono">{scoreShares.toLocaleString()} shares</span></div>
                        <div className="flex justify-between items-center bg-gray-700/50 p-2 rounded-md"><span>Referrals ({referrals})</span><span className="font-bold text-white font-mono">{referralShares.toLocaleString()} shares</span></div>
                        <div className="flex justify-between items-center bg-gray-700/50 p-2 rounded-md"><span>Ads Viewed ({adsViewed})</span><span className="font-bold text-white font-mono">{adShares.toLocaleString()} shares</span></div>
                        <div className="flex justify-between items-center bg-gray-700/50 p-2 rounded-md"><span>Time Spent ({formatTime(timeSpent)})</span><span className="font-bold text-white font-mono">{timeShares.toLocaleString()} shares</span></div>
                        <div className="flex justify-between items-center bg-gray-700/50 p-2 rounded-md"><span>TON Purchases ({tonPurchases})</span><span className="font-bold text-white font-mono">{purchaseShares.toLocaleString()} shares</span></div>
                    </div>

                    <p className="text-center mt-4 text-xs text-gray-500">This is an estimate. The airdrop pool will be distributed over 10 years. Your final amount depends on your activity relative to the entire community's participation.</p>
                </div>

                <div className="w-full bg-gray-800 rounded-xl p-6 space-y-4 border border-gray-700">
                    <h3 className="font-semibold text-cyan-300 text-left mb-3 flex items-center gap-2"><StarIcon className="w-5 h-5" /><span>Eliezer (ELZR) Tokenomics</span></h3>
                    <div className="text-left text-sm space-y-2 text-gray-400">
                        <div className="flex justify-between items-center bg-gray-900/50 p-2 rounded-md"><span>Total Supply:</span><span className="font-bold text-white font-mono">{TOTAL_SUPPLY.toLocaleString()} ELZR</span></div>
                        <div className="flex justify-between items-center bg-gray-900/50 p-2 rounded-md"><span>Airdrop Pool:</span><span className="font-bold text-white font-mono">{AIRDROP_POOL.toLocaleString()} ELZR</span></div>
                        <div className="flex justify-between items-center bg-gray-900/50 p-2 rounded-md"><span>Team & Development:</span><span className="font-bold text-white font-mono">{TEAM_POOL.toLocaleString()} ELZR</span></div>
                        <div className="flex justify-between items-center bg-gray-900/50 p-2 rounded-md"><span>Generation Date:</span><span className="font-bold text-white font-mono">11.07.2025</span></div>
                        <div className="flex justify-between items-center bg-gray-900/50 p-2 rounded-md"><span>Blockchain:</span><span className="font-bold text-white font-mono">TON Network</span></div>
                    </div>
                </div>
                
                 <div className="text-center mt-6 text-xs text-gray-500">
                    <p>Connect a real TON wallet for future airdrops.</p>
                </div>
            </div>
        </div>
    );
};


const App: React.FC = () => {
    const [initialState] = useState(getInitialState);

    const [score, setScore] = useState(initialState.score);
    const [energy, setEnergy] = useState(initialState.energy);
    const [tapAnimations, setTapAnimations] = useState<TapAnimation[]>([]);
    const [activeBoosts, setActiveBoosts] = useState<ActiveBoosts>(initialState.activeBoosts);
    const [tapStreak, setTapStreak] = useState(0);
    const [streakTimeoutId, setStreakTimeoutId] = useState<number | null>(null);
    const [isScoreAnimating, setIsScoreAnimating] = useState(false);
    const scoreRef = useRef(score);

    const [friends, setFriends] = useState<Friend[]>([]);
    
    // Upgrade levels
    const [tapLevel, setTapLevel] = useState(initialState.tapLevel);
    const [energyLevel, setEnergyLevel] = useState(initialState.energyLevel);

    // Modals
    const [earnModalOpen, setEarnModalOpen] = useState(false);
    const [upgradesModalOpen, setUpgradesModalOpen] = useState(false);
    const [isGiftBoxModalOpen, setIsGiftBoxModalOpen] = useState(false);
    
    // Earn tab state
    const [lastDailyReward, setLastDailyReward] = useState<string | null>(initialState.lastDailyReward);
    const [claimedTasks, setClaimedTasks] = useState<TaskId[]>(initialState.claimedTasks);
    const [totalTaps, setTotalTaps] = useState(initialState.totalTaps);

    // Spin Wheel state
    const [lastSpin, setLastSpin] = useState<string | null>(initialState.lastSpin);
    const [isSpinning, setIsSpinning] = useState(false);
    const [wheelRotation, setWheelRotation] = useState(0);

    // Daily Gift Box state
    const [lastGiftBoxOpen, setLastGiftBoxOpen] = useState<string | null>(initialState.lastGiftBoxOpen);
    const [giftBoxReward, setGiftBoxReward] = useState<GiftBoxReward | null>(null);

    // Streak Rewards state
    const [claimedStreakMilestones, setClaimedStreakMilestones] = useState<number[]>(initialState.claimedStreakMilestones);
    const [lastStreakClaimDate, setLastStreakClaimDate] = useState<string | null>(initialState.lastStreakClaimDate);

    // Airdrop calculation state
    const [adsViewed, setAdsViewed] = useState(initialState.adsViewed);
    const [timeSpent, setTimeSpent] = useState(initialState.timeSpent); // in seconds
    const [tonPurchases, setTonPurchases] = useState(initialState.tonPurchases);

    const [activeView, setActiveView] = useState<ActiveView>('tap');
    const [notification, setNotification] = useState<string | null>(null);

    // Frens state
    const [referralCode, setReferralCode] = useState('');
    const [inviteCodeInput, setInviteCodeInput] = useState('');

    // TON Connect state
    const [tonConnectUI] = useTonConnectUI();
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const connected = !!wallet;

    // --- Derived State ---
    const tapValue = useMemo(() => {
        let baseValue = tapLevel;
        if (activeBoosts.turbo_tap && activeBoosts.turbo_tap.endTime > Date.now()) baseValue *= 2;
        if (activeBoosts.multi_tap && activeBoosts.multi_tap.endTime > Date.now()) baseValue *= 5;
        return baseValue;
    }, [tapLevel, activeBoosts]);
    
    const maxEnergy = useMemo(() => 500 + energyLevel * 500, [energyLevel]);
    const tapUpgradeCost = useMemo(() => 200 * Math.pow(tapLevel, 2), [tapLevel]);
    const energyUpgradeCost = useMemo(() => Math.floor(300 * Math.pow(energyLevel, 2.2)), [energyLevel]);

    const isDailyRewardAvailable = useMemo(() => {
        if (!lastDailyReward) return true;
        const lastDate = new Date(lastDailyReward);
        const today = new Date();
        return lastDate.getFullYear() !== today.getFullYear() ||
               lastDate.getMonth() !== today.getMonth() ||
               lastDate.getDate() !== today.getDate();
    }, [lastDailyReward]);

    const isGiftBoxAvailable = useMemo(() => {
        if (!lastGiftBoxOpen) return true;
        const lastDate = new Date(lastGiftBoxOpen);
        const today = new Date();
        return lastDate.getFullYear() !== today.getFullYear() ||
               lastDate.getMonth() !== today.getMonth() ||
               lastDate.getDate() !== today.getDate();
    }, [lastGiftBoxOpen]);

    const isSpinAvailable = useMemo(() => {
        if (!lastSpin) return true;
        const lastDate = new Date(lastSpin);
        const today = new Date();
        return lastDate.getFullYear() !== today.getFullYear() ||
               lastDate.getMonth() !== today.getMonth() ||
               lastDate.getDate() !== today.getDate();
    }, [lastSpin]);

    const earnTasks = useMemo(() => TASKS.filter(task => !task.id.startsWith('invite_')), []);
    const frensTasks = useMemo(() => TASKS.filter(task => task.id.startsWith('invite_')), []);

    const showNotification = useCallback((message: string, duration: number = 4000) => {
        setNotification(message);
        setTimeout(() => setNotification(null), duration);
    }, []);

    const showAd = useAdsgram({
        blockId: 'int-17151',
        onError: (error: ShowPromiseResult) => {
            console.error("Ad error:", error);
            showNotification(error.description || "Ad failed to load.");
        },
    });

    const showAdAndDo = (action: () => void) => {
        const onReward = () => {
            setAdsViewed(prev => prev + 1);
            action();
        };
        showAd(onReward);
    };

    // --- Effects ---

    // Inform Telegram that the app is ready
    useEffect(() => {
        window.Telegram?.WebApp?.ready();
    }, []);

     // Subscribe to wallet connection status changes
    useEffect(() => {
        const unsubscribe = tonConnectUI.onStatusChange(walletInfo => {
            setWallet(walletInfo);
        });

        // Set initial wallet state in case it's already connected
        if (tonConnectUI.wallet) {
            setWallet(tonConnectUI.wallet);
        }

        return () => {
            unsubscribe();
        };
    }, [tonConnectUI]);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        const stateToSave: SavedState = {
            score,
            energy,
            lastEnergyUpdate: Date.now(),
            tapLevel,
            energyLevel,
            lastDailyReward,
            claimedTasks,
            totalTaps,
            lastSpin,
            lastGiftBoxOpen,
            claimedStreakMilestones,
            lastStreakClaimDate,
            adsViewed,
            timeSpent,
            tonPurchases,
            activeBoosts
        };
        localStorage.setItem('tapCoinMinerState', JSON.stringify(stateToSave));
    }, [
        score, energy, tapLevel, energyLevel, lastDailyReward, claimedTasks,
        totalTaps, lastSpin, lastGiftBoxOpen, claimedStreakMilestones,
        lastStreakClaimDate, adsViewed, timeSpent, tonPurchases, activeBoosts
    ]);

    // Score animation effect
    useEffect(() => {
        if (score > scoreRef.current) {
            setIsScoreAnimating(true);
            const timer = setTimeout(() => setIsScoreAnimating(false), 200); // Animation duration
            return () => clearTimeout(timer);
        }
        scoreRef.current = score;
    }, [score]);


    // Time spent tracking
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeSpent(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Energy regeneration
    useEffect(() => {
        const interval = setInterval(() => {
            setEnergy(prev => Math.min(maxEnergy, prev + ENERGY_REGEN_RATE));
        }, 1000);
        return () => clearInterval(interval);
    }, [maxEnergy]);

    // Auto-miner
    useEffect(() => {
        let interval: number | undefined;
        if (activeBoosts.auto_mine && activeBoosts.auto_mine.endTime > Date.now()) {
            interval = setInterval(() => {
                setScore(prev => prev + AUTO_MINE_RATE);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [activeBoosts.auto_mine]);

    // Boost timer cleanup
     useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            let hasChanged = false;
            const newBoosts: ActiveBoosts = {};
            for (const key in activeBoosts) {
                const boost = activeBoosts[key as BoostId];
                if (boost && boost.endTime > now) {
                    newBoosts[key as BoostId] = boost;
                } else {
                    hasChanged = true;
                }
            }
            if (hasChanged) {
                setActiveBoosts(newBoosts);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [activeBoosts]);

    // Mock friends data and generate referral code
    useEffect(() => {
        setFriends([
            { id: 1, name: "Alice", score: 12500, avatar: "https://picsum.photos/40/40?random=1" },
            { id: 2, name: "Bob", score: 8200, avatar: "https://picsum.photos/40/40?random=2" },
        ]);
        
        // Generate a mock referral code on mount
        setReferralCode('TCM-' + Math.random().toString(36).substr(2, 8).toUpperCase());

    }, []);
    
    // Referral check on app load
    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (tg && tg.initDataUnsafe?.start_param) {
            const startParam = tg.initDataUnsafe.start_param;
            const bonusAwarded = localStorage.getItem('referralBonusAwarded');

            if (startParam.startsWith('ref_') && !bonusAwarded) {
                setScore(s => s + INVITE_BONUS);
                showNotification(`Welcome! You got ${INVITE_BONUS.toLocaleString()} bonus coins!`);
                localStorage.setItem('referralBonusAwarded', 'true');
            }
        }
    }, [showNotification]);

    // Daily reset for streak rewards
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        if (lastStreakClaimDate !== today) {
            setClaimedStreakMilestones([]);
            setLastStreakClaimDate(today);
        }
    }, [lastStreakClaimDate]);

    const handleTap = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        if (energy >= ENERGY_PER_TAP) {
            setEnergy(prev => prev - ENERGY_PER_TAP);
            
            if (streakTimeoutId) clearTimeout(streakTimeoutId);
            const newStreak = tapStreak + 1;
            setTapStreak(newStreak);
            const newTimeoutId = window.setTimeout(() => setTapStreak(0), STREAK_TIMEOUT);
            setStreakTimeoutId(newTimeoutId);

            const streakBonusMultiplier = STREAK_MILESTONES[newStreak] || 1;
            const finalTapValue = tapValue * streakBonusMultiplier;
            const isBonus = streakBonusMultiplier > 1;

            setScore(prev => prev + finalTapValue);
            setTotalTaps(prev => prev + 1);

            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const newAnimation: TapAnimation = { id: Date.now() + Math.random(), x, y, value: finalTapValue, isBonus };
            setTapAnimations(prev => [...prev, newAnimation]);

            setTimeout(() => {
                setTapAnimations(prev => prev.filter(anim => anim.id !== newAnimation.id));
            }, 1000);
        }
    }, [energy, tapValue, tapStreak, streakTimeoutId]);

    const handleRefillEnergy = useCallback(() => {
        const cost = Math.floor(maxEnergy / 2);
        if (score >= cost && energy < maxEnergy) {
            setScore(prev => prev - cost);
            setEnergy(maxEnergy);
        }
    }, [score, energy, maxEnergy]);

    const purchaseBoost = (boost: Boost) => {
        if (score >= boost.cost) {
            setScore(prev => prev - boost.cost);
            if (boost.id === 'full_energy') {
                setEnergy(maxEnergy);
            } else {
                 setActiveBoosts(prev => ({
                    ...prev,
                    [boost.id]: { endTime: Date.now() + (boost.duration || 0) * 1000 }
                }));
            }
        }
    };
    
    const onUpgradeTap = () => {
        if (score >= tapUpgradeCost) {
            setScore(s => s - tapUpgradeCost);
            setTapLevel(l => l + 1);
        }
    }

    const onUpgradeEnergy = () => {
        if (score >= energyUpgradeCost) {
            setScore(s => s - energyUpgradeCost);
            setEnergyLevel(l => l + 1);
        }
    }

    const claimDailyReward = () => {
        if (isDailyRewardAvailable) {
            setScore(s => s + DAILY_REWARD_COINS);
            setEnergy(maxEnergy);
            setLastDailyReward(new Date().toISOString());
        }
    };
    
    const claimTask = (taskId: TaskId) => {
        const task = TASKS.find(t => t.id === taskId);
        if (task && !claimedTasks.includes(taskId)) {
            const progress = task.getProgress({ totalTaps, friends, score });
            if (progress >= task.goal) {
                setScore(s => s + task.reward);
                setClaimedTasks(prev => [...prev, taskId]);
            }
        }
    };

    const handleCopyReferralCode = () => {
        navigator.clipboard.writeText(referralCode).then(() => {
            showNotification('Referral code copied!');
        }).catch(err => {
            console.error('Failed to copy code: ', err);
            showNotification('Failed to copy code.');
        });
    };

    const handleClaimInvite = () => {
        if (inviteCodeInput.trim()) {
            // Mock logic: pretend it's a valid code
            setScore(s => s + INVITE_BONUS);
            showNotification(`Success! You got ${INVITE_BONUS.toLocaleString()} bonus coins!`);
            setInviteCodeInput('');
            // Add a new friend to the list to simulate joining a squad
            const newFriendId = friends.length + 3; // a mock id
            setFriends(f => [...f, {
                id: newFriendId,
                name: `Friend ${newFriendId - 2}`,
                score: 0,
                avatar: `https://picsum.photos/40/40?random=${newFriendId}`
            }]);
        } else {
            showNotification('Please enter a valid code.');
        }
    };

    const handleOpenGiftBox = () => {
        if (!isGiftBoxAvailable) return;

        const reward = GIFT_BOX_REWARDS[Math.floor(Math.random() * GIFT_BOX_REWARDS.length)];
        setGiftBoxReward(reward);

        switch (reward.type) {
            case 'coins':
                setScore(s => s + reward.value);
                break;
            case 'energy':
                setEnergy(e => Math.min(maxEnergy, e + reward.value));
                break;
            case 'boost_turbo_tap':
                setActiveBoosts(prev => ({ ...prev, turbo_tap: { endTime: Date.now() + reward.value * 1000 }}));
                break;
        }

        setLastGiftBoxOpen(new Date().toISOString());
        setIsGiftBoxModalOpen(true);
        showNotification(`You received: ${reward.label}!`);
    };

    const spinWheel = () => {
        if (!isSpinning && isSpinAvailable) {
            setIsSpinning(true);
            setLastSpin(new Date().toISOString());

            const spinDuration = 5000; // 5 seconds
            const randomSpins = 5 + Math.floor(Math.random() * 5); // 5 to 9 full spins
            const prizeIndex = Math.floor(Math.random() * WHEEL_REWARDS.length);
            const prize = WHEEL_REWARDS[prizeIndex];
            const segmentAngle = 360 / WHEEL_REWARDS.length;
            const stopAngle = (randomSpins * 360) + (prizeIndex * segmentAngle) - (segmentAngle / 2);

            setWheelRotation(stopAngle);

            setTimeout(() => {
                setIsSpinning(false);
                switch (prize.type) {
                    case 'coins':
                        setScore(s => s + prize.value);
                        showNotification(`You won ${prize.value.toLocaleString()} coins!`);
                        break;
                    case 'energy':
                        setEnergy(maxEnergy);
                         showNotification(`You won a full energy refill!`);
                        break;
                    case 'boost_turbo_tap':
                        setActiveBoosts(prev => ({ ...prev, turbo_tap: { endTime: Date.now() + prize.value * 1000 }}));
                         showNotification(`You won a Turbo Tap boost!`);
                        break;
                    case 'boost_multi_tap':
                        setActiveBoosts(prev => ({ ...prev, multi_tap: { endTime: Date.now() + prize.value * 1000 }}));
                         showNotification(`You won a Multi Tap boost!`);
                        break;
                }
            }, spinDuration);
        }
    };

    const handleConnectWallet = () => {
        if (tonConnectUI) {
            tonConnectUI.openModal();
        }
    };

    const handleTonPurchase = async () => {
        if (!connected || !tonConnectUI) {
          showNotification('Please connect your TON wallet first.');
          if (tonConnectUI) {
              tonConnectUI.openModal();
          }
          return;
        }
      
        const transaction = {
          validUntil: Math.floor(Date.now() / 1000) + 60, // 60 seconds
          messages: [
            {
              address: "UQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABADR", // destination address, bounceable for testing
              amount: "10000000", // 0.01 TON in nano-tons
            },
          ],
        };
      
        try {
          showNotification('Please approve the transaction in your wallet.');
          const result = await tonConnectUI.sendTransaction(transaction);
          
          showNotification('Transaction sent successfully!');
          console.log('Transaction result:', result);
          
          // On success, update state
          setTonPurchases(p => p + 1);
          const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
          setActiveBoosts(prev => ({
            ...prev,
            auto_mine: { endTime: Date.now() + twentyFourHoursInMs }
          }));
          setUpgradesModalOpen(false);
      
        } catch (error) {
          showNotification('Transaction was cancelled or failed.');
          console.error('Transaction error:', error);
        }
    };

    const handleClaimStreakReward = useCallback((milestone: number) => {
        if (tapStreak >= milestone && !claimedStreakMilestones.includes(milestone)) {
            const reward = STREAK_REWARDS[milestone];
            if (reward) {
                setScore(s => s + reward);
                setClaimedStreakMilestones(prev => [...prev, milestone]);
                showNotification(`+${reward.toLocaleString()} coins for ${milestone} tap streak!`);
            }
        }
    }, [tapStreak, claimedStreakMilestones, showNotification]);


    return (
        <div className="bg-gradient-to-b from-gray-900 via-black to-black text-white h-screen flex flex-col font-sans overflow-hidden">
             {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
            <header className="w-full p-4 flex-shrink-0">
                <div className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <img src="https://picsum.photos/40/40?grayscale" className="w-10 h-10 rounded-full border-2 border-yellow-500" />
                        <div>
                            <p className="font-semibold text-gray-400 text-sm">Player</p>
                            <p className="font-bold text-lg">Miner01</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-2xl font-bold bg-black/20 px-4 py-2 rounded-full border border-gray-700">
                            <img src="https://picsum.photos/24/24?grayscale" className="w-6 h-6 rounded-full" />
                            <span className={`text-yellow-400 ${isScoreAnimating ? 'animate-score-pulse' : ''}`}>{Math.floor(score).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                <div className="mt-4">
                     <LeagueDisplay score={score} />
                </div>
            </header>

            <div className="flex-grow w-full p-4 overflow-hidden relative">
                {activeView === 'tap' && (
                    <>
                        <TapView 
                            activeBoosts={activeBoosts}
                            handleTap={handleTap}
                            energy={energy}
                            maxEnergy={maxEnergy}
                            handleRefillEnergy={handleRefillEnergy}
                            score={score}
                            tapStreak={tapStreak}
                            isGiftBoxAvailable={isGiftBoxAvailable}
                            onOpenGiftBox={handleOpenGiftBox}
                            claimedStreakMilestones={claimedStreakMilestones}
                            onClaimStreakReward={handleClaimStreakReward}
                        />
                        {tapAnimations.map(anim => (
                            <div key={anim.id} className="absolute text-4xl font-bold text-white pointer-events-none animate-fade-up" style={{ left: anim.x, top: anim.y, color: anim.isBonus ? '#fde047' : 'white' }}>
                                +{anim.value}
                            </div>
                        ))}
                    </>
                )}
                {activeView === 'frens' && <FriendsView 
                    friends={friends} 
                    referralCode={referralCode} 
                    onCopyReferralCode={handleCopyReferralCode} 
                    onClaimInvite={handleClaimInvite} 
                    inviteCodeInput={inviteCodeInput} 
                    setInviteCodeInput={setInviteCodeInput} 
                    tasks={frensTasks}
                    totalTaps={totalTaps}
                    score={score}
                    claimedTasks={claimedTasks}
                    onClaimTask={claimTask}
                    showAdAndDo={showAdAndDo}
                />}
                {activeView === 'wallet' && <WalletView 
                    score={score} 
                    adsViewed={adsViewed}
                    referrals={friends.length}
                    timeSpent={timeSpent}
                    tonPurchases={tonPurchases}
                    connected={connected}
                    onConnect={handleConnectWallet}
                    wallet={wallet}
                    showNotification={showNotification}
                />}
            </div>

            <nav className="w-full bg-black/30 backdrop-blur-md border-t border-gray-800 grid grid-cols-5 gap-1 p-1 rounded-t-2xl">
                <button onClick={() => setActiveView('tap')} className={`flex flex-col items-center justify-center text-center p-2 rounded-lg ${activeView === 'tap' ? 'bg-yellow-500/20 text-yellow-300' : 'text-gray-400'}`}>
                    <HomeIcon className="w-7 h-7 mb-1" />
                    <span className="text-xs font-bold">Tap</span>
                </button>
                <button onClick={() => setUpgradesModalOpen(true)} className="flex flex-col items-center justify-center text-center p-2 rounded-lg text-gray-400">
                    <BoostIcon className="w-7 h-7 mb-1" />
                    <span className="text-xs font-bold">Boost</span>
                </button>
                <button onClick={() => setEarnModalOpen(true)} className="flex flex-col items-center justify-center text-center p-2 rounded-lg text-gray-400">
                    <EarnIcon className="w-7 h-7 mb-1" />
                    <span className="text-xs font-bold">Earn</span>
                </button>
                <button onClick={() => setActiveView('frens')} className={`flex flex-col items-center justify-center text-center p-2 rounded-lg ${activeView === 'frens' ? 'bg-yellow-500/20 text-yellow-300' : 'text-gray-400'}`}>
                    <FriendsIcon className="w-7 h-7 mb-1" />
                    <span className="text-xs font-bold">Frens</span>
                </button>
                 <button onClick={() => setActiveView('wallet')} className={`flex flex-col items-center justify-center text-center p-2 rounded-lg ${activeView === 'wallet' ? 'bg-yellow-500/20 text-yellow-300' : 'text-gray-400'}`}>
                    <WalletIcon className="w-7 h-7 mb-1" />
                    <span className="text-xs font-bold">Wallet</span>
                </button>
            </nav>

            <GiftBoxModal
                isOpen={isGiftBoxModalOpen}
                onClose={() => setIsGiftBoxModalOpen(false)}
                reward={giftBoxReward}
            />

            <EarnModal 
                isOpen={earnModalOpen}
                onClose={() => setEarnModalOpen(false)}
                isDailyRewardAvailable={isDailyRewardAvailable}
                onClaimDailyReward={claimDailyReward}
                tasks={earnTasks}
                totalTaps={totalTaps}
                friends={friends}
                score={score}
                claimedTasks={claimedTasks}
                onClaimTask={claimTask}
                isSpinAvailable={isSpinAvailable}
                onSpin={spinWheel}
                isSpinning={isSpinning}
                wheelRotation={wheelRotation}
                showAdAndDo={showAdAndDo}
            />

            <UpgradesModal
                isOpen={upgradesModalOpen}
                onClose={() => setUpgradesModalOpen(false)}
                onPurchaseBoost={purchaseBoost}
                score={score}
                tapLevel={tapLevel}
                energyLevel={energyLevel}
                tapValue={tapValue}
                maxEnergy={maxEnergy}
                tapUpgradeCost={tapUpgradeCost}
                energyUpgradeCost={energyUpgradeCost}
                onUpgradeTap={onUpgradeTap}
                onUpgradeEnergy={onUpgradeEnergy}
                onPurchaseWithTon={handleTonPurchase}
                showAdAndDo={showAdAndDo}
            />
        </div>
    );
};

export default App;