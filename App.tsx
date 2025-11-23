
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Board, LevelConfig, PlayMode, Inventory, CandyType, Difficulty, CandyColor, HighScore, UserStats, Friend, LeaderboardEntry, PurchaseRecord } from './types';
import { 
  createInitialBoard, 
  findMatches, 
  processMatches, 
  moveCandiesDown, 
  isAdjacent,
  shuffleBoard,
  hasValidMoves,
  resolveSpecialCombination,
  SpecialEventType
} from './utils/boardUtils';
import { saveGame, loadGame, hasSavedGame, getHighScores, saveHighScoreEntry, getLeaderboard } from './utils/storage';
import { api } from './utils/api'; // IMPORT API
import { generateDailyLevel, getTodayDateString } from './utils/dailyChallenge';
import { LEVELS, SHOP_PRICES, TREASURY_WALLET } from './constants';
import GameBoard, { ActiveEffect } from './components/GameBoard';
import { CandyIcon } from './components/CandyIcon';
import { CelebrationOverlay } from './components/CelebrationOverlay';
import { ShopModal } from './components/ShopModal';
import { WalletModal } from './components/WalletModal';
import { FrensModal } from './components/FrensModal';
import { RotateCcw, Trophy, Move, Play, ChevronRight, Lock, CheckCircle, Zap, Save, Download, Clock, Calendar, Coins, Target, Plus, ShoppingBag, Shuffle, BarChart3, Home, RefreshCw, X, Loader, HelpCircle, Info, Sparkles, Crosshair, Bomb, Disc, Wallet, Users, User } from 'lucide-react';
import { TonConnectButton, useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';

// Utility to convert TON to Nanotons (1 TON = 1,000,000,000 nanotons)
// Defined locally to avoid import errors from SDK
const toNano = (amount: number): string => {
  return (amount * 1_000_000_000).toFixed(0);
};

const DEFAULT_INVENTORY: Inventory = {
    coins: 0,
    boosters: {
        bomb: 1,
        extraMoves: 1,
        shuffle: 1
    }
};

const DEFAULT_STATS: UserStats = {
    totalScore: 0,
    totalTimePlayed: 0,
    referrals: 0,
    adsViewed: 15, // Mock data for demo
    tonPurchases: 0,
    purchaseHistory: [],
    friends: []
};

// Sound Utility
const playExplosionSound = (type: 'normal' | 'mega' | 'super' | 'rainbow' = 'normal') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    masterGain.gain.value = 0.5; // Master volume to prevent clipping
    
    const now = ctx.currentTime;

    if (type === 'mega' || type === 'rainbow') {
        // Deep, rumbling explosion for Bomb+Bomb OR Rainbow Effects
        
        // Layer 1: Sub-bass Drop
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(type === 'rainbow' ? 200 : 150, now);
        osc1.frequency.exponentialRampToValueAtTime(0.01, now + 3.0);
        gain1.gain.setValueAtTime(1, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 3.0);
        osc1.connect(gain1);
        gain1.connect(masterGain);
        osc1.start(now);
        osc1.stop(now + 3.0);

        // Layer 2: Magical Chime (Rainbow specific)
        if (type === 'rainbow') {
            const oscChim = ctx.createOscillator();
            const gainChim = ctx.createGain();
            oscChim.type = 'triangle';
            oscChim.frequency.setValueAtTime(600, now);
            oscChim.frequency.linearRampToValueAtTime(1200, now + 0.5);
            gainChim.gain.setValueAtTime(0.3, now);
            gainChim.gain.linearRampToValueAtTime(0, now + 1.0);
            oscChim.connect(gainChim);
            gainChim.connect(masterGain);
            oscChim.start(now);
            oscChim.stop(now + 1.0);
        }

        // Layer 3: Noise Burst
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.type = 'square';
        osc3.frequency.setValueAtTime(50, now);
        osc3.frequency.linearRampToValueAtTime(10, now + 0.8);
        gain3.gain.setValueAtTime(0.5, now);
        gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        osc3.connect(gain3);
        gain3.connect(masterGain);
        osc3.start(now);
        osc3.stop(now + 0.8);

    } else if (type === 'super') {
        // Laser-like zap for Bomb+Striped
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 1.2);
        
        // Tremolo
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 20;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.5;
        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);
        lfo.start(now);
        lfo.stop(now + 1.2);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
        
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 1.2);
    } else {
        // Normal pop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.3);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.3);
    }
  } catch (e) {
    // Audio not supported or blocked
  }
};

// Helper to adjust level difficulty
const applyDifficulty = (level: LevelConfig, diff: Difficulty): LevelConfig => {
    if (diff === 'MEDIUM') return level;

    const multipliers = {
        EASY: { moves: 1.5, time: 1.5, goal: 0.7 },
        HARD: { moves: 0.7, time: 0.8, goal: 1.3 }
    };

    const m = multipliers[diff];

    return {
        ...level,
        moves: Math.max(5, Math.floor(level.moves * m.moves)), // Ensure at least 5 moves
        timeLimit: Math.floor(level.timeLimit * m.time),
        goals: level.goals.map(g => {
            const newTarget = Math.ceil(g.target * m.goal);
            return {
                ...g,
                target: newTarget,
                description: g.description.replace(/[\d,]+/, newTarget.toLocaleString())
            };
        })
    };
};

const App: React.FC = () => {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const [telegramName, setTelegramName] = useState<string>("You");
  const [telegramId, setTelegramId] = useState<number | null>(null); // New ID state

  const [board, setBoard] = useState<Board>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedCandy, setSelectedCandy] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Level & Mode State
  const [playMode, setPlayMode] = useState<PlayMode>('CAMPAIGN');
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [activeLevel, setActiveLevel] = useState<LevelConfig>(LEVELS[0]);
  const [goalProgress, setGoalProgress] = useState<Record<string, number>>({});
  const [gameState, setGameState] = useState<'INTRO' | 'PLAYING' | 'WON' | 'LOST'>('INTRO');
  
  // Pre-Game Modal State
  const [previewData, setPreviewData] = useState<{
      levelConfig: LevelConfig;
      mode: PlayMode;
      index: number;
  } | null>(null);

  // Inventory, Stats & Shop State
  const [inventory, setInventory] = useState<Inventory>(DEFAULT_INVENTORY);
  const [userStats, setUserStats] = useState<UserStats>(DEFAULT_STATS);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isFrensOpen, setIsFrensOpen] = useState(false);
  const [lastDailyCompleted, setLastDailyCompleted] = useState<string | null>(null);

  // High Score & Leaderboard State
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<{top10: LeaderboardEntry[], userEntry: LeaderboardEntry} | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Booster State
  const [preGameBoosters, setPreGameBoosters] = useState<{ bomb: boolean, extraMoves: boolean }>({ bomb: false, extraMoves: false });
  const [activeBooster, setActiveBooster] = useState<'BOMB' | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null); 
  const [shuffleAvailable, setShuffleAvailable] = useState(true); 

  // Visual Effects State
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [isShaking, setIsShaking] = useState(false);
  const [activeEffects, setActiveEffects] = useState<ActiveEffect[]>([]);
  const [collectingIndices, setCollectingIndices] = useState<number[]>([]);
  const [triggerMovesAnim, setTriggerMovesAnim] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [bombEffectIndex, setBombEffectIndex] = useState<number | null>(null);
  const [isCelebrating, setIsCelebrating] = useState(false);
  
  // New Combo Visuals
  const [comboVisuals, setComboVisuals] = useState<{ type: 'MEGA_BOOM' | 'SUPER_STRIPES' | 'RAINBOW_BLAST', active: boolean } | null>(null);

  // Storage & UI State
  const [hasSave, setHasSave] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const lastSwapRef = useRef<number[] | null>(null);
  const winProcessed = useRef(false);

  // ADSGRAM Integration Helper
  const showAd = useCallback((onComplete: () => void) => {
    // CRITICAL FIX: Check if we are in Telegram environment before initializing ads
    const isTelegram = (window as any).Telegram?.WebApp?.initData;

    if (!isTelegram) {
        console.log('Not in Telegram environment, skipping ad show.');
        // Mock success for browser testing
        setUserStats(prev => ({...prev, adsViewed: prev.adsViewed + 1}));
        onComplete();
        return;
    }

    const Adsgram = (window as any).Adsgram;
    if (Adsgram) {
        try {
            // Attempt init inside a try block
            const AdController = Adsgram.init({ blockId: "int-17151" });
            AdController.show().then((result: any) => {
                // Ad finished or skipped, proceed with game
                setUserStats(prev => ({...prev, adsViewed: prev.adsViewed + 1}));
                onComplete();
            }).catch((error: any) => {
                // Ad failed to load or show, proceed anyway so user isn't blocked
                console.warn("Ad show failed:", error);
                onComplete();
            });
        } catch (e) {
             // Ad init failed (e.g. missing launch params because not in Telegram)
             console.warn("Adsgram init failed - likely not in Telegram:", e);
             onComplete();
        }
    } else {
        // Adsgram not loaded or not available, proceed
        console.warn("Adsgram script not loaded.");
        onComplete();
    }
  }, []);

  // Initialize Telegram User and Sync with Database
  useEffect(() => {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
          tg.ready();
          tg.expand();
          if (tg.initDataUnsafe?.user) {
              const user = tg.initDataUnsafe.user;
              setTelegramName(user.first_name);
              setTelegramId(user.id);
              
              // SYNC WITH SERVER
              // We grab launch params to see if there is a start param (referral)
              const startParam = tg.initDataUnsafe.start_param;

              api.initUser(user.id, user.first_name, startParam).then(data => {
                  if (data && data.success) {
                      if (data.gameState) {
                          // Load state from DB
                          setUserStats(prev => ({
                              ...prev,
                              totalScore: parseInt(data.gameState.total_score || '0'),
                              totalTimePlayed: data.gameState.total_time_played || 0,
                              adsViewed: data.gameState.ads_viewed || 0
                          }));
                          setInventory(prev => ({
                              ...prev,
                              coins: data.gameState.coins || 0,
                              boosters: {
                                  bomb: data.gameState.bomb_boosters || 1,
                                  extraMoves: data.gameState.extra_moves_boosters || 1,
                                  shuffle: data.gameState.shuffle_boosters || 1
                              }
                          }));
                          setCurrentLevelIndex(Math.max(0, (data.gameState.current_level || 1) - 1));
                          setLastDailyCompleted(data.gameState.last_daily_completed);
                      }
                      
                      if (data.user && data.user.referral_code) {
                           setUserStats(prev => ({ ...prev, referralCode: data.user.referral_code }));
                      }
                  }
              });
          }
      }
  }, []);

  // Initialize Referral Code if missing (Local Fallback)
  useEffect(() => {
    if (!userStats.referralCode) {
        const randomCode = 'R-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        setUserStats(prev => ({ ...prev, referralCode: randomCode }));
    }
  }, [userStats.referralCode]);

  // Load initial persistence data (Local Fallback)
  useEffect(() => {
    const saved = loadGame();
    if (saved) {
        if (saved.board && saved.board.length > 0) {
            setHasSave(true);
        }
        // Only load inventory/stats from local if we didn't get them from DB sync yet
        // (Simplified logic: always load local, DB sync overwrites if successful later)
        setInventory(saved.inventory || DEFAULT_INVENTORY);
        setUserStats(prev => {
           return { ...DEFAULT_STATS, ...(saved.stats || {}) };
        });
        setLastDailyCompleted(saved.lastDailyCompleted || null);
        if (saved.levelIndex >= 0) {
            setCurrentLevelIndex(saved.levelIndex);
        }
    }
    setHighScores(getHighScores());
  }, []);

  // Update Leaderboard when opened (Fetch from API)
  useEffect(() => {
      if (showLeaderboard) {
          // Try API first
          api.getLeaderboard().then(data => {
              if (data && data.length > 0) {
                   // Map API data to UI format
                   const entries: LeaderboardEntry[] = data.map((d: any, i: number) => ({
                       rank: i + 1,
                       name: d.username,
                       score: parseInt(d.total_score),
                       level: d.current_level,
                       isUser: d.username === telegramName
                   }));
                   
                   const userEntry = entries.find(e => e.isUser) || {
                       rank: 999,
                       name: telegramName,
                       score: userStats.totalScore,
                       level: currentLevelIndex + 1,
                       isUser: true
                   };
                   
                   setLeaderboardData({ top10: entries, userEntry });
              } else {
                   // Fallback to Mock
                   const data = getLeaderboard(userStats, currentLevelIndex + 1, telegramName);
                   setLeaderboardData(data);
              }
          });
      }
  }, [showLeaderboard, userStats.totalScore, currentLevelIndex, telegramName]);

  // Listen for wallet disconnect to close shop/wallet
  useEffect(() => {
      if (!wallet) {
          if (isShopOpen) setIsShopOpen(false);
          if (isWalletOpen) setIsWalletOpen(false);
      }
  }, [wallet, isShopOpen, isWalletOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  // Timer Logic & Stats Tracking
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const timer = setInterval(() => {
        // Track total time played
        setUserStats(prev => ({ ...prev, totalTimePlayed: prev.totalTimePlayed + 1 }));
        
        setTimeLeft((prev) => {
            if (prev <= 1) {
                clearInterval(timer);
                setGameState('LOST');
                return 0;
            }
            return prev - 1;
        });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Handle Win State Transition & Celebration
  useEffect(() => {
    if (gameState === 'WON') {
        setIsCelebrating(true);
        const timer = setTimeout(() => {
            setGameState('INTRO');
            setIsCelebrating(false);
            if (playMode === 'CAMPAIGN') {
                setCurrentLevelIndex(prev => prev + 1);
            }
        }, 4000);
        return () => clearTimeout(timer);
    } else {
        setIsCelebrating(false);
    }
  }, [gameState, playMode]);

  const handleSaveGame = () => {
    if (isProcessing || gameState !== 'PLAYING') return;
    
    // Save Local
    const gameData = {
      board,
      score,
      moves,
      timeLeft,
      levelIndex: playMode === 'CAMPAIGN' ? currentLevelIndex : -1,
      goalProgress,
      timestamp: Date.now(),
      inventory,
      stats: userStats,
      lastDailyCompleted
    };
    
    saveGame(gameData);
    setHasSave(true);
    
    // Save Cloud
    if (telegramId) {
        api.saveGame(telegramId, gameData);
    }

    showToast("Game Saved!");
  };

  const handleLoadGame = () => {
    const data = loadGame();
    if (data && data.board && data.board.length > 0) {
      setBoard(data.board);
      setScore(data.score);
      setMoves(data.moves);
      setTimeLeft(data.timeLeft);
      setGoalProgress(data.goalProgress);
      setInventory(data.inventory || DEFAULT_INVENTORY);
      setUserStats({ ...DEFAULT_STATS, ...(data.stats || {}) });
      setLastDailyCompleted(data.lastDailyCompleted || null);
      
      if (data.levelIndex === -1) {
          setPlayMode('CAMPAIGN'); 
          setActiveLevel(LEVELS[data.levelIndex > -1 ? data.levelIndex : 0]);
      } else {
          setPlayMode('CAMPAIGN');
          setCurrentLevelIndex(data.levelIndex);
          setActiveLevel(LEVELS[data.levelIndex]);
      }
      
      setComboMultiplier(1);
      setIsProcessing(false);
      setSelectedCandy(null);
      setActiveEffects([]);
      setCollectingIndices([]);
      setIsShaking(false);
      lastSwapRef.current = null;
      setActiveBooster(null);
      setShuffleAvailable(true);
      
      setGameState('PLAYING');
      showToast("Game Loaded!");
    } else {
        showToast("No valid save found.");
        setHasSave(false);
    }
  };

  const openLevelPreview = (levelIndex: number) => {
    const baseLevel = LEVELS[levelIndex % LEVELS.length];
    const adjustedLevel = applyDifficulty(baseLevel, difficulty);
    setPreGameBoosters({ bomb: false, extraMoves: false });
    setPreviewData({
        levelConfig: adjustedLevel,
        mode: 'CAMPAIGN',
        index: levelIndex
    });
  };

  const openDailyPreview = () => {
      const dailyLevel = generateDailyLevel();
      const adjustedLevel = applyDifficulty(dailyLevel, difficulty);
      setPreGameBoosters({ bomb: false, extraMoves: false });
      setPreviewData({
          levelConfig: adjustedLevel,
          mode: 'DAILY',
          index: -1
      });
  };

  const startPreviewGame = () => {
    if (!previewData) return;

    // Show ad before starting
    showAd(() => {
        setPlayMode(previewData.mode);
        if (previewData.mode === 'CAMPAIGN') {
            setCurrentLevelIndex(previewData.index);
        }
        setActiveLevel(previewData.levelConfig);
        
        initGame(previewData.levelConfig);
        setPreviewData(null);
    });
  };

  const initGame = (levelConfig: LevelConfig) => {
    const startWithBomb = preGameBoosters.bomb && inventory.boosters.bomb > 0;
    const startMoves = (preGameBoosters.extraMoves && inventory.boosters.extraMoves > 0) 
                       ? levelConfig.moves + 5 
                       : levelConfig.moves;
    
    if (startWithBomb || (startMoves !== levelConfig.moves)) {
        const newInventory = {
            ...inventory,
            boosters: {
                ...inventory.boosters,
                bomb: startWithBomb ? inventory.boosters.bomb - 1 : inventory.boosters.bomb,
                extraMoves: (startMoves !== levelConfig.moves) ? inventory.boosters.extraMoves - 1 : inventory.boosters.extraMoves
            }
        };
        setInventory(newInventory);
    }

    setBoard(createInitialBoard(startWithBomb));
    setScore(0);
    setMoves(startMoves);
    setTimeLeft(levelConfig.timeLimit);
    
    if (startMoves > levelConfig.moves) {
        setTimeout(() => setTriggerMovesAnim(true), 500);
        setTimeout(() => setTriggerMovesAnim(false), 1500);
    }
    
    const initialProgress: Record<string, number> = {};
    levelConfig.goals.forEach(g => initialProgress[g.id] = 0);
    setGoalProgress(initialProgress);
    
    setGameState('PLAYING'); 
    setIsProcessing(false);
    setSelectedCandy(null);
    setComboMultiplier(1);
    setIsShaking(false);
    setActiveEffects([]);
    setCollectingIndices([]);
    setActiveBooster(null);
    setBombEffectIndex(null);
    lastSwapRef.current = null;
    winProcessed.current = false;
    setIsShuffling(false);
    setComboVisuals(null);
    setShuffleAvailable(true); 
    
    setPreGameBoosters({ bomb: false, extraMoves: false });
  };

  const checkWinCondition = (currentScore: number, currentProgress: Record<string, number>) => {
    return activeLevel.goals.every(goal => {
        if (goal.type === 'SCORE') return currentScore >= goal.target;
        if (goal.type === 'COLLECT') return (currentProgress[goal.id] || 0) >= goal.target;
        return false;
    });
  };

  useEffect(() => {
      if (gameState === 'WON' && !winProcessed.current) {
          winProcessed.current = true;
          const entry: HighScore = {
              score,
              level: playMode === 'DAILY' ? 'Daily' : `Level ${currentLevelIndex + 1}`,
              date: new Date().toLocaleDateString()
          };
          const updated = saveHighScoreEntry(entry);
          setHighScores(updated);

          // Update Stats
          const newStats = {
              ...userStats,
              totalScore: userStats.totalScore + score
          };
          setUserStats(newStats);

          let newInv = inventory;

          if (playMode === 'DAILY') {
              const today = getTodayDateString();
              if (lastDailyCompleted !== today) {
                  newInv = {
                      ...inventory,
                      coins: inventory.coins + 100,
                      boosters: {
                          ...inventory.boosters,
                          bomb: inventory.boosters.bomb + 1
                      }
                  };
                  setInventory(newInv);
                  setLastDailyCompleted(today);
                  showToast("Daily Reward: +100 Coins & 1 Bomb!");
              }
          }
          
          // Save Full State (Local + Cloud)
          const saveData = {
                board: [],
                score: 0,
                moves: 0,
                timeLeft: 0,
                levelIndex: playMode === 'CAMPAIGN' ? currentLevelIndex + 1 : currentLevelIndex,
                goalProgress: {},
                timestamp: Date.now(),
                inventory: newInv,
                stats: newStats,
                lastDailyCompleted: playMode === 'DAILY' ? getTodayDateString() : lastDailyCompleted
          };
          
          saveGame(saveData);
          if (telegramId) {
              api.saveGame(telegramId, saveData);
          }
      }
  }, [gameState, playMode, score, inventory, currentLevelIndex, lastDailyCompleted, telegramId]);

  const handleRedeemReferral = (code: string) => {
      if (code === userStats.referralCode) {
          return { success: false, message: "Cannot use your own code" };
      }
      if (userStats.redeemedReferralCode) {
          return { success: false, message: "Already redeemed a code" };
      }
      
      // Simulate Verification (In real app, check backend)
      if (code.length >= 5) {
          const bonusCoins = 500;
          const bonusBomb = 1;

          // Update Inventory
          setInventory(prev => ({
              ...prev,
              coins: prev.coins + bonusCoins,
              boosters: {
                  ...prev.boosters,
                  bomb: prev.boosters.bomb + bonusBomb
              }
          }));

          // Update Stats
          setUserStats(prev => ({
              ...prev,
              redeemedReferralCode: code
          }));
          
          // Trigger save to lock it in
          const saveData = {
             board: [], score: 0, moves: 0, timeLeft: 0, levelIndex: currentLevelIndex, goalProgress: {}, timestamp: Date.now(),
             inventory: { ...inventory, coins: inventory.coins + bonusCoins, boosters: { ...inventory.boosters, bomb: inventory.boosters.bomb + bonusBomb } },
             stats: { ...userStats, redeemedReferralCode: code }, lastDailyCompleted
          };
          saveGame(saveData);
          if (telegramId) api.saveGame(telegramId, saveData);

          return { success: true, message: `Redeemed! +${bonusCoins} Coins` };
      }

      return { success: false, message: "Invalid Code" };
  };

  // Game Loop
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const checkBoard = async () => {
      const matches = findMatches(board);
      
      if (matches.length > 0) {
        setIsProcessing(true);
        
        // Process matches to know the outcome
        const swapContext = comboMultiplier === 1 ? lastSwapRef.current : null;
        const { board: boardAfterClear, scoreDelta, clearedCandies, specialEvents } = processMatches(board, swapContext);

        // 1. Identify Goal Matches Immediately
        const goalCandyIds = new Set<string>();
        activeLevel.goals.forEach(goal => {
            if (goal.type === 'COLLECT') {
                clearedCandies.forEach(c => {
                    if (goal.targetColor && c.color !== goal.targetColor) return;
                    if (goal.targetCandyType === 'STRIPED_ANY') {
                         if (c.type !== CandyType.StripedHorizontal && c.type !== CandyType.StripedVertical) return;
                    } else if (goal.targetCandyType && c.type !== goal.targetCandyType) {
                        return;
                    }
                    goalCandyIds.add(c.id);
                });
            }
        });

        // 2. Prepare Visual Feedback & Collecting Indices
        const animBoard = [...board];
        let hasMatchesToAnimate = false;
        const indicesToAnimate: number[] = [];

        for (let i = 0; i < board.length; i++) {
            if (board[i] && boardAfterClear[i] === null) {
                // Mark for match animation
                animBoard[i] = { ...board[i]!, isMatched: true };
                hasMatchesToAnimate = true;
                
                // If it is also a goal candy, track index for special collection effect
                if (board[i] && goalCandyIds.has(board[i]!.id)) {
                    indicesToAnimate.push(i);
                }
            }
        }

        // 3. Trigger Collection Effect concurrently with Match Animation
        if (indicesToAnimate.length > 0) {
            setCollectingIndices(indicesToAnimate);
        }

        if (hasMatchesToAnimate) {
            setBoard(animBoard);
            playExplosionSound('normal');
            
            // If we are collecting goal candies, extend delay to let the effect play out
            const delay = indicesToAnimate.length > 0 ? 550 : 250;
            await new Promise(r => setTimeout(r, delay)); 
            
            setCollectingIndices([]);
        } else {
            await new Promise(r => setTimeout(r, 250));
        }
        
        if (specialEvents.length > 0) {
            const newEffects = specialEvents.map(e => ({ index: e.index, type: e.type }));
            setActiveEffects(prev => [...prev, ...newEffects]);

            if (specialEvents.some(e => e.type === 'BOMB' || e.type === 'RAINBOW')) {
                setIsShaking(true);
                setTimeout(() => setIsShaking(false), 500);
            }

            setTimeout(() => {
                setActiveEffects(prev => prev.filter(e => !newEffects.includes(e)));
            }, 600);
        }

        const newScore = score + (scoreDelta * comboMultiplier);
        setScore(newScore);
        
        const newProgress = { ...goalProgress };
        let progressUpdated = false;

        activeLevel.goals.forEach(goal => {
            if (goal.type === 'COLLECT') {
                const count = clearedCandies.filter(c => {
                   if (goal.targetColor && c.color !== goal.targetColor) return false;
                   if (goal.targetCandyType === 'STRIPED_ANY') {
                        if (c.type !== CandyType.StripedHorizontal && c.type !== CandyType.StripedVertical) return false;
                   } else if (goal.targetCandyType && c.type !== goal.targetCandyType) {
                       return false;
                   }
                   return true;
                }).length;
                
                if (count > 0) {
                    const current = newProgress[goal.id] || 0;
                    if (current < goal.target) {
                        newProgress[goal.id] = Math.min(goal.target, current + count);
                        progressUpdated = true;
                    }
                }
            }
        });

        if (progressUpdated) setGoalProgress(newProgress);
        setBoard(boardAfterClear);
        setComboMultiplier(c => c + 1);

        await new Promise(r => setTimeout(r, 300));

        const { board: boardAfterFall, movesHappened } = moveCandiesDown(boardAfterClear);
        setBoard(boardAfterFall);
        
        // Wait for settle animation (increased from 200 to 450 for swirl effect)
        if (movesHappened) await new Promise(r => setTimeout(r, 450));
        
      } else {
        setIsProcessing(false);
        setComboMultiplier(1);
        lastSwapRef.current = null;
        
        if (checkWinCondition(score, goalProgress)) {
            setTimeout(() => setGameState('WON'), 500);
        } else if (moves <= 0) {
            setTimeout(() => setGameState('LOST'), 500);
        } else {
            if (!hasValidMoves(board)) {
                setIsProcessing(true);
                showToast("No Moves! Shuffling...");
                setTimeout(() => {
                    setBoard(shuffleBoard(board));
                    setIsProcessing(false);
                }, 1500);
            }
        }
      }
    };

    if (!isProcessing || comboMultiplier > 1) {
        timeoutId = setTimeout(checkBoard, 300);
    }

    return () => clearTimeout(timeoutId);
  }, [board, gameState, moves, comboMultiplier, goalProgress, score, activeLevel]);

  const handleSwipe = useCallback((index1: number, index2: number) => {
    if (isProcessing || gameState !== 'PLAYING' || activeBooster) return;
    if (index2 < 0 || index2 >= board.length) return;
    if (!isAdjacent(index1, index2)) return;

    const c1 = board[index1];
    const c2 = board[index2];
    
    const isSpecial1 = c1?.type !== CandyType.Normal;
    const isSpecial2 = c2?.type !== CandyType.Normal;

    if (c1 && c2 && (isSpecial1 || isSpecial2)) {
        const comboResult = resolveSpecialCombination(board, index1, index2);
        
        if (comboResult.triggered) {
            setIsProcessing(true);
            setSelectedCandy(null);
            setMoves(m => m - 1);

            const newBoard = [...board];
            newBoard[index1] = c2;
            newBoard[index2] = c1;
            setBoard(newBoard);

            if (comboResult.type === 'COMBO_BOMB_BOMB') {
                setComboVisuals({ type: 'MEGA_BOOM', active: true });
                setIsShaking(true);
                playExplosionSound('mega');
                showToast("ULTIMATE BLAST! +5000");
            } else if (comboResult.type === 'COMBO_BOMB_STRIPED') {
                setComboVisuals({ type: 'SUPER_STRIPES', active: true });
                setIsShaking(true);
                playExplosionSound('super');
                showToast("SUPER STRIPES! Massive Clear!");

                if (comboResult.transformations) {
                     const transBoard = [...newBoard];
                     comboResult.transformations.forEach(t => {
                         if (transBoard[t.index]) {
                             transBoard[t.index] = { ...transBoard[t.index]!, type: t.type, isNew: true };
                         }
                     });
                     setBoard(transBoard);
                }
            } else if (comboResult.type === 'RAINBOW' || comboResult.type === 'COMBO_RAINBOW') {
                setComboVisuals({ type: 'RAINBOW_BLAST', active: true });
                setIsShaking(true);
                playExplosionSound('rainbow');
                showToast(comboResult.type === 'COMBO_RAINBOW' ? "RAINBOW SURGE!" : "COLOR WIPE!");
                
                if (comboResult.transformations) {
                     const transBoard = [...newBoard];
                     comboResult.transformations.forEach(t => {
                         if (transBoard[t.index]) {
                             transBoard[t.index] = { ...transBoard[t.index]!, type: t.type, isNew: true };
                         }
                     });
                     setBoard(transBoard);
                }
            } else {
                 playExplosionSound('normal');
            }

            const delay = (
                comboResult.type === 'COMBO_BOMB_BOMB' || 
                comboResult.type === 'COMBO_BOMB_STRIPED' ||
                comboResult.type === 'RAINBOW' || 
                comboResult.type === 'COMBO_RAINBOW'
            ) ? 1200 : 600;

            setTimeout(() => {
                 const clearBoard = [...newBoard];
                 comboResult.clearedIndices.forEach(idx => {
                     clearBoard[idx] = null;
                 });
                 
                 setScore(s => s + comboResult.score);
                 setBoard(clearBoard);
                 setActiveEffects([]);
                 setComboVisuals(null);
                 setIsShaking(false);
                 
                 setTimeout(() => setIsProcessing(false), 300);

            }, delay);

            return;
        }
    }

    const newBoard = [...board];
    const temp = newBoard[index1];
    newBoard[index1] = newBoard[index2];
    newBoard[index2] = temp;

    const matches = findMatches(newBoard);
    
    if (matches.length > 0) {
        lastSwapRef.current = [index1, index2];
        setBoard(newBoard);
        setMoves(m => m - 1);
        setSelectedCandy(null);
    } else {
        setIsProcessing(true);
        setBoard(newBoard);
        setTimeout(() => {
            setBoard(board);
            setIsProcessing(false);
            setSelectedCandy(null);
        }, 300);
    }
  }, [board, isProcessing, gameState, activeBooster]);

  const handleTap = useCallback((index: number) => {
    if (isProcessing || gameState !== 'PLAYING') return;

    if (activeBooster === 'BOMB') {
        const targetCandy = board[index];
        if (!targetCandy) return;

        setBombEffectIndex(index);
        setIsProcessing(true); 
        
        setInventory(prev => ({
            ...prev,
            boosters: { ...prev.boosters, bomb: Math.max(0, prev.boosters.bomb - 1) }
        }));
        
        // Save usage
        const newInv = {
            ...inventory,
            boosters: { ...inventory.boosters, bomb: Math.max(0, inventory.boosters.bomb - 1) }
        };
        const saveData = {
            board, score, moves, timeLeft, levelIndex: currentLevelIndex, goalProgress, timestamp: Date.now(),
            inventory: newInv, stats: userStats, lastDailyCompleted
        };
        saveGame(saveData);
        if (telegramId) api.saveGame(telegramId, saveData);
        
        setTimeout(() => {
            const newBoard = [...board];
            newBoard[index] = { ...targetCandy, type: CandyType.Bomb, isNew: true };
            setBoard(newBoard);
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 300);
            setActiveBooster(null);
            setBombEffectIndex(null);
            setIsProcessing(false); 
            showToast("Bomb Placed!");
        }, 750);
        
        return;
    }

    if (selectedCandy === null) {
      setSelectedCandy(index);
    } else {
      if (selectedCandy === index) {
        setSelectedCandy(null);
      } else {
        handleSwipe(selectedCandy, index);
      }
    }
  }, [selectedCandy, handleSwipe, isProcessing, gameState, activeBooster, board, inventory, telegramId, userStats]);

  const handleBuyBooster = async (item: 'bomb' | 'extraMoves' | 'shuffle', cost: number) => {
    if (!wallet) {
        showToast("Connect Wallet first!");
        return;
    }

    // Prepare transaction
    const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec validity
        messages: [
            {
                address: TREASURY_WALLET,
                amount: toNano(cost),
            },
        ],
    };

    try {
        await tonConnectUI.sendTransaction(transaction);
        
        // If successful
        const newInventory = {
          ...inventory,
          boosters: {
            ...inventory.boosters,
            [item]: inventory.boosters[item] + 1
          },
        };
        setInventory(newInventory);

        setUserStats(prev => {
            const itemName = item === 'bomb' ? 'Bomb' : item === 'extraMoves' ? '+5 Moves' : 'Shuffle';
            const newRecord: PurchaseRecord = {
                id: Date.now().toString(),
                item: itemName,
                cost: cost,
                date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            };

            const newStats = {
                ...prev,
                tonPurchases: prev.tonPurchases + cost, // Add TON amount to purchases
                purchaseHistory: [newRecord, ...prev.purchaseHistory] // Add to history
            };
            
            const saveData = {
                board,
                score,
                moves,
                timeLeft,
                levelIndex: currentLevelIndex,
                goalProgress,
                timestamp: Date.now(),
                inventory: newInventory,
                stats: newStats,
                lastDailyCompleted
            };
            
            saveGame(saveData);
            if (telegramId) api.saveGame(telegramId, saveData);
            
            return newStats;
        });

        showToast("Purchase Successful!");
        
    } catch (e) {
        console.error("Transaction failed", e);
        showToast("Transaction Failed or Cancelled");
    }
  };

  const handleManualShuffle = () => {
    if (isProcessing || gameState !== 'PLAYING') return;
    
    // Logic priority: Free -> Inventory
    const canShuffle = shuffleAvailable || inventory.boosters.shuffle > 0;
    if (!canShuffle) {
         showToast("No Shuffles left!");
         return;
    }

    setIsProcessing(true);
    setIsShuffling(true);
    
    setTimeout(() => {
        setBoard(shuffleBoard(board));
        setIsShuffling(false);
        setIsProcessing(false);
        
        if (shuffleAvailable) {
            setShuffleAvailable(false);
            showToast("Board Shuffled!");
        } else {
             const newInv = {
                ...inventory,
                boosters: {
                    ...inventory.boosters,
                    shuffle: Math.max(0, inventory.boosters.shuffle - 1)
                }
            };
            setInventory(newInv);
            // Save state
            const saveData = {
                board, score, moves, timeLeft, levelIndex: currentLevelIndex, goalProgress, timestamp: Date.now(),
                inventory: newInv, stats: userStats, lastDailyCompleted
            };
            saveGame(saveData);
            if (telegramId) api.saveGame(telegramId, saveData);
            
            showToast("Board Shuffled!");
        }
    }, 1200);
  };

  const handleUseInGameBooster = (type: 'extraMoves' | 'bomb') => {
      if (inventory.boosters[type] <= 0) {
          showToast("No boosters left!");
          return;
      }

      if (type === 'extraMoves') {
          setMoves(m => m + 5);
          const newInv = {
              ...inventory,
              boosters: { ...inventory.boosters, extraMoves: inventory.boosters.extraMoves - 1 }
          };
          setInventory(newInv);
          setTriggerMovesAnim(true);
          setTimeout(() => setTriggerMovesAnim(false), 800);
          showToast("+5 Moves Added!");
          
          const saveData = {
                board, score, moves: moves + 5, timeLeft, levelIndex: currentLevelIndex, goalProgress, timestamp: Date.now(),
                inventory: newInv, stats: userStats, lastDailyCompleted
          };
          saveGame(saveData);
          if (telegramId) api.saveGame(telegramId, saveData);
          return;
      }
      
      if (type === 'bomb') {
          if (activeBooster === 'BOMB') {
            setActiveBooster(null);
            return;
          }
          setActiveBooster('BOMB');
          showToast("Tap a candy to bomb!");
      }
  };

  const handleOpenShop = () => {
      if (!wallet) {
          if (tonConnectUI) {
             tonConnectUI.openModal();
          }
          showToast("Connect TON Wallet to access Shop!");
      } else {
          setIsShopOpen(true);
      }
  };

  const handleOpenWallet = () => {
      if (!wallet) {
          if (tonConnectUI) {
             tonConnectUI.openModal();
          }
          showToast("Connect TON Wallet to view assets!");
      } else {
          setIsWalletOpen(true);
      }
  };

  return (
    <div className="relative w-full h-full max-w-md mx-auto flex flex-col bg-game-bg overflow-hidden text-white font-sans select-none shadow-2xl">
      
      {/* TOAST */}
      <div className={`absolute top-24 left-1/2 transform -translate-x-1/2 z-[100] transition-all duration-300 pointer-events-none ${toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="bg-black/80 text-white px-6 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-xl font-bold flex items-center gap-2 text-sm sm:text-base whitespace-nowrap">
           <Zap size={16} className="text-yellow-400 fill-yellow-400" />
           {toastMessage}
        </div>
      </div>

      {/* SHUFFLE OVERLAY */}
      {isShuffling && (
        <div className="absolute inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
             <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <Shuffle size={64} className="text-white animate-spin duration-1000" />
                    <div className="absolute top-0 left-0 w-full h-full animate-ping opacity-40 bg-white rounded-full" />
                </div>
                <div className="text-2xl font-bold text-white tracking-widest uppercase animate-pulse">
                    Shuffling...
                </div>
             </div>
        </div>
      )}

      {/* FULL SCREEN COMBO VISUALS OVERLAY */}
      <ComboVisualsOverlay 
        active={comboVisuals?.active || false} 
        type={comboVisuals?.type || null} 
      />

      {/* --- INTRO SCREEN --- */}
      {gameState === 'INTRO' && (
          <div className="flex-1 flex flex-col h-full animate-in fade-in duration-500 relative">
             
             {/* Logo Section - Static at top */}
             <div className="text-center shrink-0 py-6 px-6 flex flex-col items-center animate-in slide-in-from-top-4 duration-700">
                 <div className="mb-2 relative group cursor-pointer" onClick={() => setShowInfoModal(true)}>
                    <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full animate-pulse-fast" />
                    <img 
                        src="https://raw.githubusercontent.com/Iulian85/eliezer-token/main/ELZR.png" 
                        alt="Eliezer Logo" 
                        className="relative w-28 h-28 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:scale-110"
                    />
                 </div>
                 <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-purple-200 drop-shadow-lg tracking-tight leading-none">
                    ELIEZER<br/><span className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-amber-600">RUSH</span>
                 </h1>
             </div>

             {/* Main Content Area - Scrollable */}
             <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 custom-scrollbar flex flex-col gap-3">
                 
                 {/* Difficulty Toggle */}
                 <div className="bg-white/5 p-1 rounded-xl flex gap-1 shrink-0">
                    {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map((d) => (
                        <button
                            key={d}
                            onClick={() => setDifficulty(d)}
                            className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all ${
                                difficulty === d 
                                ? 'bg-game-accent text-white shadow-lg' 
                                : 'text-white/40 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            {d}
                        </button>
                    ))}
                 </div>

                 {/* Daily Challenge */}
                 <button 
                    onClick={openDailyPreview}
                    className="w-full p-3 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 font-bold shadow-lg shadow-orange-500/20 flex items-center justify-between hover:brightness-110 active:scale-95 transition-all shrink-0"
                 >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg"><Calendar className="text-white" size={18} /></div>
                        <div className="text-left">
                            <div className="text-[10px] uppercase opacity-80">Daily Challenge</div>
                            <div className="text-sm font-black">Play Today's Level</div>
                        </div>
                    </div>
                    {lastDailyCompleted === getTodayDateString() ? <CheckCircle className="text-white/80" /> : <ChevronRight size={18} />}
                 </button>

                 {/* Level List */}
                 <div className="bg-game-panel rounded-2xl p-2 border border-white/5 space-y-1.5">
                     {LEVELS.map((lvl, idx) => {
                         const isLocked = idx > 0 && idx > currentLevelIndex && !hasSave; 
                         return (
                             <button 
                                key={lvl.levelNumber}
                                onClick={() => !isLocked && openLevelPreview(idx)}
                                className={`w-full p-3 rounded-xl flex items-center justify-between group transition-all
                                    ${isLocked ? 'bg-white/5 opacity-50' : 'bg-white/10 hover:bg-white/20 hover:scale-[1.01] active:scale-95'}
                                `}
                             >
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-inner ${isLocked ? 'bg-white/10' : 'bg-gradient-to-br from-blue-400 to-blue-600 border border-white/20'}`}>
                                        {isLocked ? <Lock size={12} /> : idx + 1}
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-sm">Level {idx + 1}</div>
                                        <div className="text-[10px] text-white/50">{lvl.goals.length} Goals</div>
                                    </div>
                                </div>
                                {!isLocked && <Play size={16} className="text-white/50 group-hover:text-white" />}
                             </button>
                         );
                     })}
                 </div>

                 {hasSave && (
                     <button 
                        onClick={handleLoadGame}
                        className="w-full py-3 rounded-xl bg-white/10 font-bold text-xs flex items-center justify-center gap-2 hover:bg-white/20 transition-all shrink-0 border border-white/10"
                    >
                        <RotateCcw size={14} /> Resume Saved Game
                     </button>
                 )}
             </div>

             {/* Bottom Menu - Fixed at bottom */}
             <div className="p-4 pt-2 bg-gradient-to-t from-game-bg via-game-bg to-transparent shrink-0">
                 <div className="flex gap-3">
                    <button 
                        onClick={() => setShowLeaderboard(true)}
                        className="flex-1 p-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 font-bold shadow-lg shadow-indigo-500/20 flex flex-col items-center justify-center gap-1 hover:brightness-110 active:scale-95 transition-all border border-white/10"
                    >
                        <BarChart3 className="text-white" size={18} />
                        <span className="text-[10px] uppercase tracking-wider font-bold">Rank</span>
                    </button>
                    
                    <button 
                        onClick={() => setIsFrensOpen(true)}
                        className="flex-1 p-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 font-bold shadow-lg shadow-green-500/20 flex flex-col items-center justify-center gap-1 hover:brightness-110 active:scale-95 transition-all border border-white/10"
                    >
                        <Users className="text-white" size={18} />
                        <span className="text-[10px] uppercase tracking-wider font-bold">Frens</span>
                    </button>

                    <button 
                        onClick={handleOpenWallet}
                        className="flex-1 p-3 rounded-2xl bg-gradient-to-r from-gray-700 to-gray-800 font-bold shadow-lg flex flex-col items-center justify-center gap-1 hover:brightness-110 active:scale-95 transition-all border border-white/10"
                    >
                        {wallet ? <Wallet className="text-cyan-400" size={18} /> : <Wallet className="text-white/50" size={18} />}
                        <span className={`text-[10px] uppercase tracking-wider font-bold ${wallet ? "text-white" : "text-white/50"}`}>Wallet</span>
                    </button>
                 </div>
             </div>
          </div>
      )}

      {/* PRE-GAME LEVEL PREVIEW MODAL */}
      {previewData && (
          <div className="absolute inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
              <div className="bg-[#2a1b3d] w-full max-w-sm rounded-[2rem] border border-white/10 p-6 shadow-2xl flex flex-col gap-6 relative">
                  <button onClick={() => setPreviewData(null)} className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors">
                      <X size={24} />
                  </button>
                  <div className="text-center space-y-1 mt-2">
                      <div className="text-white/50 text-xs font-bold uppercase tracking-wider">Target</div>
                      <h2 className="text-3xl font-black text-white">
                          {previewData.mode === 'DAILY' ? 'Daily Challenge' : `Level ${previewData.index + 1}`}
                      </h2>
                      <div className="flex flex-wrap justify-center gap-3 mt-4">
                          {previewData.levelConfig.goals.map((g, idx) => (
                              <div key={idx} className="flex flex-col items-center gap-1">
                                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                      {g.type === 'SCORE' ? (
                                          <Target size={20} className="text-yellow-400" />
                                      ) : (
                                          <CandyIcon 
                                            color={g.targetColor || CandyColor.Multi} 
                                            type={g.targetCandyType === 'STRIPED_ANY' ? CandyType.StripedHorizontal : g.targetCandyType} 
                                            size={20} 
                                          />
                                      )}
                                  </div>
                                  <span className="text-[10px] text-white/60 font-medium max-w-[60px] leading-tight">
                                      {g.type === 'SCORE' ? g.target.toLocaleString() : `x${g.target}`}
                                  </span>
                              </div>
                          ))}
                      </div>
                  </div>
                  <div className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                          <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest">Select Boosters</h3>
                          <div onClick={handleOpenShop} className="text-xs font-bold text-game-accent cursor-pointer hover:underline flex items-center gap-1">
                              <Plus size={12} /> Get More
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                          <div 
                              onClick={() => inventory.boosters.bomb > 0 && setPreGameBoosters(p => ({ ...p, bomb: !p.bomb }))}
                              className={`relative p-3 rounded-2xl border transition-all flex flex-col items-center gap-2 cursor-pointer group
                                  ${preGameBoosters.bomb 
                                      ? 'bg-red-500/20 border-red-500 ring-1 ring-red-500' 
                                      : 'bg-white/5 border-white/10 hover:bg-white/10'}
                                  ${inventory.boosters.bomb === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                              `}
                          >
                              <div className="absolute top-2 right-2 bg-black/40 px-1.5 py-0.5 rounded-md text-[10px] font-bold text-white border border-white/10">
                                  x{inventory.boosters.bomb}
                              </div>
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${preGameBoosters.bomb ? 'bg-red-500 shadow-red-500/50' : 'bg-white/10'}`}>
                                  <Target size={20} className="text-white" />
                              </div>
                              <div className="text-xs font-bold text-white">Bomb Candy</div>
                          </div>

                          <div 
                              onClick={() => inventory.boosters.extraMoves > 0 && setPreGameBoosters(p => ({ ...p, extraMoves: !p.extraMoves }))}
                              className={`relative p-3 rounded-2xl border transition-all flex flex-col items-center gap-2 cursor-pointer group
                                  ${preGameBoosters.extraMoves 
                                      ? 'bg-blue-500/20 border-blue-500 ring-1 ring-blue-500' 
                                      : 'bg-white/5 border-white/10 hover:bg-white/10'}
                                  ${inventory.boosters.extraMoves === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                              `}
                          >
                               <div className="absolute top-2 right-2 bg-black/40 px-1.5 py-0.5 rounded-md text-[10px] font-bold text-white border border-white/10">
                                  x{inventory.boosters.extraMoves}
                              </div>
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${preGameBoosters.extraMoves ? 'bg-blue-500 shadow-blue-500/50' : 'bg-white/10'}`}>
                                  <Zap size={20} className="text-white fill-white" />
                              </div>
                              <div className="text-xs font-bold text-white">+5 Moves</div>
                          </div>
                      </div>
                  </div>
                  <button 
                      onClick={startPreviewGame}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 font-black text-white text-lg tracking-wide shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                      <Play size={20} fill="currentColor" /> PLAY
                  </button>
              </div>
          </div>
      )}

      {/* --- GAME HUD --- */}
      {gameState === 'PLAYING' && (
          <>
            {/* Top Navigation Bar */}
            <div className="px-4 pt-4 flex items-center justify-between z-20 relative bg-gradient-to-b from-black/60 to-transparent pb-2">
                <button 
                    onClick={() => setGameState('INTRO')}
                    className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all"
                >
                    <Home size={16} />
                </button>
                <div className="flex flex-col items-center">
                    <div className="text-xs font-bold text-white/60 uppercase tracking-widest shadow-black drop-shadow-md">
                        {playMode === 'DAILY' ? 'Daily Challenge' : `Level ${currentLevelIndex + 1}`}
                    </div>
                    {difficulty !== 'MEDIUM' && (
                        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 shadow-sm border border-white/10 ${
                            difficulty === 'EASY' ? 'bg-green-500/40 text-green-100' : 'bg-red-500/40 text-red-100'
                        }`}>
                            {difficulty}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setShowInfoModal(true)}
                        className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all"
                    >
                        <Info size={16} />
                    </button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="px-4 pb-2 flex items-end justify-between z-10">
                <div className="flex flex-col items-center">
                    <div className={`bg-game-panel px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2 shadow-lg transition-all duration-300 ${
                        triggerMovesAnim 
                            ? 'scale-110 bg-yellow-500/20 text-yellow-300 ring-2 ring-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)]' 
                            : ''
                        }`}>
                        <Move size={16} className={triggerMovesAnim ? 'text-yellow-300' : 'text-blue-300'} />
                        <span className="font-black text-xl">{moves}</span>
                    </div>
                    <span className="text-[10px] font-bold text-white/50 mt-1 uppercase tracking-wider">Moves</span>
                </div>

                {/* Goals */}
                <div className="flex gap-2">
                    {activeLevel.goals.map((goal) => {
                        const current = goalProgress[goal.id] || 0;
                        const isMet = current >= goal.target;
                        return (
                            <div key={goal.id} className={`flex flex-col items-center transition-all duration-500 ${isMet ? 'opacity-50 scale-90 grayscale' : ''}`}>
                                <div className="w-12 h-12 rounded-2xl bg-game-panel border border-white/10 flex items-center justify-center relative overflow-hidden">
                                    {goal.type === 'SCORE' ? (
                                        <Target size={20} className="text-yellow-400" />
                                    ) : (
                                        <CandyIcon 
                                            color={goal.targetColor || CandyColor.Multi} 
                                            type={goal.targetCandyType === 'STRIPED_ANY' ? CandyType.StripedHorizontal : goal.targetCandyType} 
                                            size={20} 
                                        />
                                    )}
                                    <div 
                                        className="absolute bottom-0 left-0 right-0 bg-green-500/50 transition-all duration-500"
                                        style={{ height: `${(current / goal.target) * 100}%` }}
                                    />
                                    {isMet && <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center"><CheckCircle size={20} className="text-white" /></div>}
                                </div>
                                <span className="text-[10px] font-bold mt-1 text-white shadow-black drop-shadow-md">
                                    {current}/{goal.target}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="flex flex-col items-center">
                    <div className={`bg-game-panel px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2 shadow-lg ${timeLeft < 10 ? 'animate-pulse text-red-400 border-red-400/50' : ''}`}>
                        <Clock size={16} className={timeLeft < 10 ? 'text-red-400' : 'text-purple-300'} />
                        <span className="font-black text-xl font-mono">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                    </div>
                     <span className="text-[10px] font-bold text-white/50 mt-1 uppercase tracking-wider">Time</span>
                </div>
            </div>

            {/* Score Bar */}
            <div className="px-6 py-2 relative z-10">
                 <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
                     <div 
                        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 transition-all duration-500 ease-out relative"
                        style={{ width: `${Math.min(100, (score / (activeLevel.goals.find(g => g.type === 'SCORE')?.target || 1000)) * 100)}%` }}
                     >
                        <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-[2px]" />
                     </div>
                 </div>
                 <div className="flex justify-between items-center mt-1">
                    <span className="text-xs font-bold text-white/40">Score</span>
                    <span className="text-sm font-black text-white drop-shadow-md">{score.toLocaleString()}</span>
                 </div>
            </div>

            {/* Main Board */}
            <div className="flex-1 flex items-center justify-center p-4 relative z-0">
                <GameBoard 
                    board={board}
                    selectedCandyIndex={selectedCandy}
                    onTap={handleTap}
                    onSwipe={handleSwipe}
                    isProcessing={isProcessing}
                    isShaking={isShaking}
                    activeEffects={activeEffects}
                    bombEffectIndex={bombEffectIndex}
                    collectingIndices={collectingIndices}
                />
            </div>

            {/* Bottom Controls */}
            <div className="px-4 pb-6 pt-2 flex items-center justify-between gap-4 z-10 bg-gradient-to-t from-game-bg via-game-bg to-transparent">
                <button 
                    onClick={() => initGame(activeLevel)}
                    className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors"
                    title="Restart Level"
                >
                    <RefreshCw size={20} />
                </button>

                <div className="flex-1 bg-black/30 backdrop-blur-md rounded-2xl p-2 border border-white/10 flex justify-around shadow-xl">
                    <BoosterButton 
                        icon={Target} 
                        count={inventory.boosters.bomb} 
                        onClick={() => handleUseInGameBooster('bomb')} 
                        isActive={activeBooster === 'BOMB'}
                        color="red"
                    />
                    <BoosterButton 
                        icon={Zap} 
                        count={inventory.boosters.extraMoves} 
                        onClick={() => handleUseInGameBooster('extraMoves')} 
                        color="blue"
                    />
                    {/* Dedicated Shuffle Button */}
                    <BoosterButton 
                        icon={Shuffle} 
                        onClick={handleManualShuffle} 
                        color="green"
                        disabled={!shuffleAvailable && inventory.boosters.shuffle === 0}
                        label={shuffleAvailable ? "FREE" : undefined}
                        count={!shuffleAvailable ? inventory.boosters.shuffle : undefined}
                    />
                </div>
                
                <button 
                    onClick={handleOpenShop}
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg transition-all border-2 border-white/20
                        ${wallet ? 'from-yellow-400 to-orange-500 shadow-orange-500/20 hover:scale-105' : 'from-gray-600 to-gray-700 grayscale'}`}
                >
                    <ShoppingBag size={20} />
                </button>
            </div>
          </>
      )}

      {/* --- MODALS --- */}
      
      {/* Info / Combos Modal */}
      {showInfoModal && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 px-4">
          <div className="bg-game-bg border border-white/20 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative max-h-[80vh] overflow-y-auto">
            <button onClick={() => setShowInfoModal(false)} className="absolute top-4 right-4 text-white/50 hover:text-white">
              <X size={24} />
            </button>
            
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center p-3 bg-blue-600/30 rounded-full mb-2 ring-1 ring-blue-400/50 shadow-lg">
                    <Info size={24} className="text-blue-200" />
                </div>
                <h2 className="text-2xl font-black text-white tracking-wide">Candy Combos</h2>
            </div>

            <div className="space-y-4">
                {/* Rainbow */}
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4 flex items-center gap-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-1 bg-purple-500 text-[9px] font-bold text-white rounded-bl-lg">LEGENDARY</div>
                    <div className="flex flex-col items-center justify-center gap-1 shrink-0 bg-black/30 p-2 rounded-lg border border-white/10 z-10">
                       <div className="flex gap-1">
                           <div className="w-8 h-8"><CandyIcon color={CandyColor.Multi} type={CandyType.Rainbow} /></div>
                           <div className="w-8 h-8"><CandyIcon color={CandyColor.Red} type={CandyType.Normal} /></div>
                       </div>
                       <div className="text-[10px] font-bold text-white/40">SWAP</div>
                   </div>
                   <div className="min-w-0 flex-1 z-10">
                       <div className="font-black text-base text-pink-300 mb-1 drop-shadow-md">Rainbow Blast</div>
                       <div className="text-xs text-white/80 leading-snug">Clear <span className="text-white font-bold underline">ALL</span> candies of that color! Created by matching 5 in a row.</div>
                   </div>
                </div>

                {/* Striped + Striped */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                   <div className="flex flex-col items-center justify-center gap-1 shrink-0 bg-black/30 p-2 rounded-lg border border-white/10">
                       <div className="flex gap-1">
                           <div className="w-8 h-8"><CandyIcon color={CandyColor.Blue} type={CandyType.StripedHorizontal} /></div>
                           <div className="w-8 h-8"><CandyIcon color={CandyColor.Red} type={CandyType.StripedVertical} /></div>
                       </div>
                       <div className="text-[10px] font-bold text-white/40">COMBINE</div>
                   </div>
                   <div className="min-w-0 flex-1">
                       <div className="font-black text-base text-blue-300 mb-1">Cross Blast</div>
                       <div className="text-xs text-white/70 leading-snug">Clears a whole Row and Column instantly! +500 Pts</div>
                   </div>
                </div>

                {/* Bomb + Striped */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                   <div className="flex flex-col items-center justify-center gap-1 shrink-0 bg-black/30 p-2 rounded-lg border border-white/10">
                       <div className="flex gap-1">
                           <div className="w-8 h-8"><CandyIcon color={CandyColor.Purple} type={CandyType.Bomb} /></div>
                           <div className="w-8 h-8"><CandyIcon color={CandyColor.Green} type={CandyType.StripedHorizontal} /></div>
                       </div>
                       <div className="text-[10px] font-bold text-white/40">COMBINE</div>
                   </div>
                   <div className="min-w-0 flex-1">
                       <div className="font-black text-base text-purple-300 mb-1">Super Stripes</div>
                       <div className="text-xs text-white/70 leading-snug">Transforms candies into Stripes & blasts 3 Rows/Cols! +1500 Pts</div>
                   </div>
                </div>

                {/* Bomb + Bomb */}
                <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-4 flex items-center gap-4 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-1 bg-orange-500 text-[9px] font-bold text-black rounded-bl-lg">EPIC</div>
                   <div className="flex flex-col items-center justify-center gap-1 shrink-0 bg-black/30 p-2 rounded-lg border border-white/10 z-10">
                       <div className="flex gap-1">
                           <div className="w-8 h-8"><CandyIcon color={CandyColor.Orange} type={CandyType.Bomb} /></div>
                           <div className="w-8 h-8"><CandyIcon color={CandyColor.Red} type={CandyType.Bomb} /></div>
                       </div>
                       <div className="text-[10px] font-bold text-white/40">COMBINE</div>
                   </div>
                   <div className="min-w-0 flex-1 z-10">
                       <div className="font-black text-base text-yellow-300 mb-1 drop-shadow-md">Mega Boom</div>
                       <div className="text-xs text-white/80 leading-snug">Massive shockwave that clears the <span className="text-white font-bold underline decoration-yellow-500">ENTIRE</span> board! +5000 Pts</div>
                   </div>
                </div>
            </div>
            
            <button 
                onClick={() => setShowInfoModal(false)}
                className="w-full mt-6 py-3 rounded-xl bg-white/10 font-bold text-white hover:bg-white/20 transition-all"
            >
                Close Guide
            </button>
          </div>
        </div>
      )}
      
      {/* --- LEADERBOARD MODAL --- */}
      {showLeaderboard && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-game-bg border border-white/20 w-full max-w-xs rounded-[2rem] shadow-2xl relative flex flex-col max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 pb-4 relative bg-gradient-to-b from-indigo-900/50 to-transparent">
                <button onClick={() => setShowLeaderboard(false)} className="absolute top-4 right-4 text-white/50 hover:text-white">
                    <X size={24} />
                </button>
                <div className="text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-indigo-600/30 rounded-full mb-2 ring-1 ring-indigo-400/50 shadow-lg">
                        <BarChart3 size={24} className="text-indigo-200" />
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-wide">Global Rank</h2>
                    <p className="text-xs text-white/50 mt-1">Top Players Worldwide</p>
                </div>
            </div>

            {/* Top 10 List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-24 space-y-2">
              {!leaderboardData ? (
                  <div className="flex justify-center py-8"><Loader className="animate-spin text-white/30" /></div>
              ) : (
                leaderboardData.top10.map((entry, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all
                        ${entry.isUser ? 'bg-indigo-500/20 border-indigo-400/50' : 'bg-white/5 border-white/5'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm relative shadow-md
                        ${index === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 text-white border border-yellow-200' : 
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white border border-gray-200' : 
                          index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-700 text-white border border-orange-300' : 
                          'bg-white/10 text-white/50'}`}>
                        {index + 1}
                        {index < 3 && <div className="absolute -top-1 -right-1"><Trophy size={10} className="text-white fill-white" /></div>}
                      </div>
                      <div className="text-left">
                         <div className={`font-bold text-sm truncate max-w-[120px] ${entry.isUser ? 'text-indigo-200' : 'text-white'}`}>
                             {entry.name} {entry.isUser && '(You)'}
                         </div>
                         <div className="text-[10px] text-white/50 font-mono">Level {entry.level}</div>
                      </div>
                    </div>
                    <div className="font-black text-sm text-right tabular-nums text-white/90">
                        {entry.score.toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* User Docked Rank */}
            <div className="absolute bottom-0 left-0 right-0 bg-[#1a103c] p-4 border-t border-white/20 shadow-[0_-10px_20px_rgba(0,0,0,0.5)] flex items-center justify-center">
                {leaderboardData && (
                    <div className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-3 flex items-center justify-between shadow-lg border border-white/20 relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />
                        <div className="flex items-center gap-3 z-10">
                            <div className="flex flex-col items-center justify-center w-10 h-10 bg-black/30 rounded-lg border border-white/10">
                                <span className="text-[8px] text-white/50 uppercase font-bold">Rank</span>
                                <span className="text-lg font-black text-white leading-none">{leaderboardData.userEntry.rank}</span>
                            </div>
                            <div>
                                <div className="font-bold text-white text-sm flex items-center gap-1">
                                    <User size={14} /> {leaderboardData.userEntry.name}
                                </div>
                                <div className="text-[10px] text-indigo-200">Level {leaderboardData.userEntry.level}</div>
                            </div>
                        </div>
                        <div className="z-10 text-right">
                            <div className="text-[10px] text-white/50 uppercase font-bold">Total Score</div>
                            <div className="font-black text-lg text-white tabular-nums">{leaderboardData.userEntry.score.toLocaleString()}</div>
                        </div>
                    </div>
                )}
            </div>
          </div>
        </div>
      )}

      {isCelebrating && (
        <div className="absolute inset-0 z-[90] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-500 pointer-events-none">
            <CelebrationOverlay />
            <div className="animate-bounce-in flex flex-col items-center p-8 rounded-3xl bg-gradient-to-b from-white/10 to-transparent border border-white/20 backdrop-blur-md shadow-2xl">
                <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(250,204,21,0.6)] mb-4 animate-pulse">
                    <Trophy size={48} className="text-yellow-900" />
                </div>
                <h2 className="text-4xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] tracking-wider text-center">
                    LEVEL<br/>COMPLETE!
                </h2>
                <div className="mt-2 text-yellow-300 font-bold text-xl drop-shadow-md">
                    Score: {score.toLocaleString()}
                </div>
            </div>
        </div>
      )}

      {gameState === 'LOST' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#2a1b3d] border border-white/10 p-8 rounded-[2rem] shadow-2xl text-center max-w-xs w-full">
                <div className="w-20 h-20 bg-white/10 rounded-full mx-auto flex items-center justify-center mb-4">
                    <RotateCcw size={40} className="text-white/50" />
                </div>
                <h2 className="text-3xl font-black text-white mb-2">Out of Moves!</h2>
                <p className="text-white/50 mb-8 text-sm">Don't give up, try again!</p>

                <div className="space-y-3">
                    <button 
                        onClick={() => showAd(() => initGame(activeLevel))}
                        className="w-full py-3.5 rounded-xl bg-white text-black font-bold hover:bg-gray-100 transition-colors"
                    >
                        Try Again
                    </button>
                    <button 
                        onClick={() => setGameState('INTRO')}
                        className="w-full py-3.5 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                    >
                        <Home size={16} /> Main Menu
                    </button>
                </div>
            </div>
        </div>
      )}

      <ShopModal 
        isOpen={isShopOpen} 
        onClose={() => setIsShopOpen(false)} 
        inventory={inventory}
        onBuy={handleBuyBooster}
        walletConnected={!!wallet}
        stats={userStats}
      />

      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        walletAddress={wallet?.account.address ? `${wallet.account.address.substring(0, 6)}...${wallet.account.address.substring(wallet.account.address.length - 4)}` : null}
        stats={userStats}
      />

      <FrensModal
        isOpen={isFrensOpen}
        onClose={() => setIsFrensOpen(false)}
        stats={userStats}
        onRedeemCode={handleRedeemReferral}
      />

    </div>
  );
};

const BoosterButton: React.FC<{ 
    icon: React.FC<any>; 
    count?: number; 
    onClick: () => void; 
    isActive?: boolean;
    color: 'red' | 'blue' | 'green';
    label?: string;
    disabled?: boolean;
}> = ({ icon: Icon, count, onClick, isActive, color, label, disabled }) => {
    const [isUsed, setIsUsed] = React.useState(false);
    const prevCountRef = React.useRef(count || 0);
    
    const colors = {
        red: 'bg-red-500 shadow-red-500/30',
        blue: 'bg-blue-500 shadow-blue-500/30',
        green: 'bg-green-500 shadow-green-500/30'
    };

    React.useEffect(() => {
        if (count !== undefined && count < prevCountRef.current) {
            setIsUsed(true);
            const timer = setTimeout(() => setIsUsed(false), 600);
            return () => clearTimeout(timer);
        }
        if (count !== undefined) prevCountRef.current = count;
    }, [count]);
    
    return (
        <button 
            onClick={onClick}
            disabled={disabled}
            className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200
                ${isActive ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-black' : 'hover:scale-105 active:scale-95'}
                ${(!disabled && (count === undefined || count > 0 || label === 'FREE')) ? 'bg-white/10 text-white' : 'bg-white/5 text-white/20 cursor-not-allowed'}
                ${isUsed ? 'bg-white/20 ring-1 ring-white/50' : ''}
                ${disabled ? 'grayscale opacity-50' : ''}
            `}
        >
            <Icon size={20} className={`${isActive ? 'animate-pulse' : ''} ${isUsed ? 'scale-125 duration-150' : ''}`} />
            
            {(count !== undefined && count > 0) && (
                <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-white/20 shadow-lg transition-all duration-300
                    ${colors[color]} text-white
                    ${isUsed ? 'scale-150 bg-yellow-400 text-black -translate-y-2' : 'scale-100'}
                `}>
                    {count}
                </div>
            )}

            {label && (
                <div className={`absolute -top-2 -right-2 px-1.5 py-0.5 rounded-md flex items-center justify-center text-[9px] font-bold border border-white/20 shadow-lg transition-all duration-300
                    ${disabled ? 'bg-gray-600' : colors[color]} text-white
                `}>
                    {label}
                </div>
            )}

            {isUsed && (
                <div className="absolute inset-0 rounded-xl bg-white/30 animate-ping" />
            )}
            
            {count === 0 && !label && !disabled && <div className="absolute inset-0 flex items-center justify-center text-white/20 font-black text-xl">+</div>}
        </button>
    );
}

const ComboVisualsOverlay: React.FC<{ active: boolean; type: 'MEGA_BOOM' | 'SUPER_STRIPES' | 'RAINBOW_BLAST' | null }> = ({ active, type }) => {
    if (!active || !type) return null;
    
    return (
        <div className="absolute inset-0 z-[85] flex items-center justify-center pointer-events-none overflow-hidden">
            {type === 'MEGA_BOOM' && (
                <>
                    {/* Blinding White Flash */}
                    <div className="absolute inset-0 bg-white animate-[pop_0.5s_ease-out_forwards]" />
                    {/* Red Tint Overlay */}
                    <div className="absolute inset-0 bg-red-500/30 animate-pulse" />
                    
                    {/* Multiple Shockwaves */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full border-[60px] border-white opacity-60 animate-[ping_1s_cubic-bezier(0,0,0.2,1)_forwards]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full border-[40px] border-orange-400 opacity-60 animate-[ping_1.2s_cubic-bezier(0,0,0.2,1)_0.1s_forwards]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full border-[20px] border-yellow-400 opacity-60 animate-[ping_1.4s_cubic-bezier(0,0,0.2,1)_0.2s_forwards]" />
                    
                    {/* Massive Core Explosion */}
                    <div className="relative flex flex-col items-center justify-center">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 rounded-full blur-[100px] animate-[pop_0.8s_ease-out_forwards]" />
                        <div className="relative z-10 animate-[spin_0.5s_linear_infinite]">
                             <Target size={180} className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,1)]" />
                        </div>
                        <div className="relative z-20 mt-8 text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-yellow-200 drop-shadow-xl tracking-tighter animate-[bounce-in_0.6s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards] text-center leading-none">
                            ULTIMATE<br/>BLAST!
                        </div>
                    </div>
                </>
            )}

            {type === 'SUPER_STRIPES' && (
                <>
                    <div className="absolute inset-0 bg-black/40 animate-[fade-in_0.2s_ease-out]" />
                    {/* Vertical Beam */}
                    <div className="absolute top-0 bottom-0 w-16 bg-white/80 blur-xl left-1/2 -translate-x-1/2 animate-[pulse_0.2s_infinite]" />
                    <div className="absolute top-0 bottom-0 w-2 bg-white left-1/2 -translate-x-1/2 shadow-[0_0_30px_white]" />
                    
                    {/* Horizontal Beam */}
                    <div className="absolute left-0 right-0 h-16 bg-white/80 blur-xl top-1/2 -translate-y-1/2 animate-[pulse_0.2s_infinite]" />
                    <div className="absolute left-0 right-0 h-2 bg-white top-1/2 -translate-y-1/2 shadow-[0_0_30px_white]" />
                    
                    {/* Targeting Reticle */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-[spin_1s_linear_infinite]">
                        <Crosshair size={200} className="text-white/80" strokeWidth={1} />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border-2 border-white/50 rounded-full animate-ping" />
                </>
            )}

            {type === 'RAINBOW_BLAST' && (
                <>
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 animate-[fade-in_0.3s_ease-out]" />
                    {/* Spectrum Ring */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border-[40px] border-transparent"
                        style={{ background: 'conic-gradient(from 0deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #a855f7, #ef4444)', mask: 'radial-gradient(transparent 60%, black 70%)', WebkitMask: 'radial-gradient(transparent 60%, black 70%)', animation: 'spin 1s linear infinite' }} 
                    />
                    
                    {/* Center Core */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white rounded-full blur-[20px] animate-pulse" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[2px] bg-white shadow-[0_0_20px_white] animate-[spin_0.5s_linear_infinite_reverse]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-full bg-white shadow-[0_0_20px_white] animate-[spin_0.5s_linear_infinite]" />

                    {/* Text */}
                    <div className="relative z-20 flex flex-col items-center justify-center h-full">
                         <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-green-400 to-blue-500 animate-bounce-short drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)]">
                             COLOR WIPE!
                         </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default App;
