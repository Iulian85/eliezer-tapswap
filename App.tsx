
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
import { api } from './utils/api'; 
import { generateDailyLevel, getTodayDateString } from './utils/dailyChallenge';
import { LEVELS, SHOP_PRICES, TREASURY_WALLET } from './constants';
import GameBoard, { ActiveEffect } from './components/GameBoard';
import { CandyIcon } from './components/CandyIcon';
import { CelebrationOverlay } from './components/CelebrationOverlay';
import { ShopModal } from './components/ShopModal';
import { WalletModal } from './components/WalletModal';
import { FrensModal } from './components/FrensModal';
import { RotateCcw, Trophy, Move, Play, ChevronRight, Lock, CheckCircle, Zap, Clock, Calendar, Coins, Target, Plus, ShoppingBag, Shuffle, BarChart3, Home, RefreshCw, X, Loader, HelpCircle, Info, Sparkles, Crosshair, Bomb, Disc, Wallet, Users, User, Smartphone, Cloud } from 'lucide-react';
import { TonConnectButton, useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';

const toNano = (amount: number): string => {
  return (amount * 1_000_000_000).toFixed(0);
};

const DEFAULT_INVENTORY: Inventory = {
    coins: 0,
    boosters: { bomb: 1, extraMoves: 1, shuffle: 1 }
};

const DEFAULT_STATS: UserStats = {
    totalScore: 0,
    totalTimePlayed: 0,
    referrals: 0,
    adsViewed: 15,
    tonPurchases: 0,
    purchaseHistory: [],
    friends: []
};

const playExplosionSound = (type: 'normal' | 'mega' | 'super' | 'rainbow' = 'normal') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    masterGain.gain.value = 0.5; 
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(masterGain);
    if (type === 'mega' || type === 'rainbow') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.5);
        gain.gain.setValueAtTime(1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
    } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    }
  } catch (e) {}
};

const applyDifficulty = (level: LevelConfig, diff: Difficulty): LevelConfig => {
    if (diff === 'MEDIUM') return level;
    const multipliers = {
        EASY: { moves: 1.5, time: 1.5, goal: 0.7 },
        HARD: { moves: 0.7, time: 0.8, goal: 1.3 }
    };
    const m = multipliers[diff];
    return {
        ...level,
        moves: Math.max(5, Math.floor(level.moves * m.moves)),
        timeLimit: Math.floor(level.timeLimit * m.time),
        goals: level.goals.map(g => {
            const newTarget = Math.ceil(g.target * m.goal);
            return { ...g, target: newTarget, description: g.description.replace(/[\d,]+/, newTarget.toLocaleString()) };
        })
    };
};

const App: React.FC = () => {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const [telegramName, setTelegramName] = useState<string>("Loading...");
  const [telegramId, setTelegramId] = useState<string | null>(null);
  const [isTelegramUser, setIsTelegramUser] = useState<boolean | null>(null);

  const [board, setBoard] = useState<Board>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedCandy, setSelectedCandy] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [playMode, setPlayMode] = useState<PlayMode>('CAMPAIGN');
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [activeLevel, setActiveLevel] = useState<LevelConfig>(LEVELS[0]);
  const [goalProgress, setGoalProgress] = useState<Record<string, number>>({});
  const [gameState, setGameState] = useState<'INTRO' | 'PLAYING' | 'WON' | 'LOST'>('INTRO');
  
  const [previewData, setPreviewData] = useState<{ levelConfig: LevelConfig; mode: PlayMode; index: number; } | null>(null);

  const [inventory, setInventory] = useState<Inventory>(DEFAULT_INVENTORY);
  const [userStats, setUserStats] = useState<UserStats>(DEFAULT_STATS);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isFrensOpen, setIsFrensOpen] = useState(false);
  const [lastDailyCompleted, setLastDailyCompleted] = useState<string | null>(null);

  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<{top10: LeaderboardEntry[], userEntry: LeaderboardEntry} | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const [preGameBoosters, setPreGameBoosters] = useState<{ bomb: boolean, extraMoves: boolean }>({ bomb: false, extraMoves: false });
  const [activeBooster, setActiveBooster] = useState<'BOMB' | null>(null);
  const [shuffleAvailable, setShuffleAvailable] = useState(true); 

  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [isShaking, setIsShaking] = useState(false);
  const [activeEffects, setActiveEffects] = useState<ActiveEffect[]>([]);
  const [collectingIndices, setCollectingIndices] = useState<number[]>([]);
  const [triggerMovesAnim, setTriggerMovesAnim] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [bombEffectIndex, setBombEffectIndex] = useState<number | null>(null);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [comboVisuals, setComboVisuals] = useState<{ type: 'MEGA_BOOM' | 'SUPER_STRIPES' | 'RAINBOW_BLAST', active: boolean } | null>(null);

  // hasSavedSession is true if the DB returned a non-empty board_state
  const [hasSavedSession, setHasSavedSession] = useState(false); 
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); 
  
  const lastSwapRef = useRef<number[] | null>(null);
  const winProcessed = useRef(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const persistData = async (data: any) => {
      if (!telegramId) return;
      setIsSaving(true);
      try {
          await api.saveGame(telegramId, data);
      } finally {
          setTimeout(() => setIsSaving(false), 1000);
      }
  };

  const showAd = useCallback((onComplete: () => void) => {
    const isTelegram = (window as any).Telegram?.WebApp?.initData;
    if (!isTelegram) {
        setUserStats(prev => ({...prev, adsViewed: prev.adsViewed + 1}));
        onComplete();
        return;
    }
    const Adsgram = (window as any).Adsgram;
    if (Adsgram) {
        try {
            const AdController = Adsgram.init({ blockId: "int-17151" });
            AdController.show().then((result: any) => {
                setUserStats(prev => ({...prev, adsViewed: prev.adsViewed + 1}));
                onComplete();
            }).catch((error: any) => {
                onComplete();
            });
        } catch (e) { onComplete(); }
    } else { onComplete(); }
  }, []);

  useEffect(() => {
    if (wallet && telegramId) {
        api.updateWallet(telegramId, wallet.account.address);
    }
  }, [wallet, telegramId]);

  useEffect(() => {
      const initApp = async () => {
          const tg = (window as any).Telegram?.WebApp;
          if (tg && tg.initData) {
              tg.ready(); tg.expand();
              const user = tg.initDataUnsafe?.user;
              if (user && user.id) {
                  setTelegramName(user.first_name || "Unknown");
                  const strId = String(user.id);
                  setTelegramId(strId);
                  setIsTelegramUser(true);
                  setIsLoading(true);

                  try {
                      const data = await api.initUser(strId, user.first_name || "Unknown", tg.initDataUnsafe.start_param);
                      if (data && data.success) {
                          if (data.gameState) {
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
                              
                              // Check for saved board state (Persistence)
                              if (data.gameState.board_state) {
                                  try {
                                      const savedBoard = JSON.parse(data.gameState.board_state);
                                      if (savedBoard && savedBoard.length > 0) {
                                          setBoard(savedBoard);
                                          setScore(data.gameState.level_score || 0);
                                          setMoves(data.gameState.moves_left || 0);
                                          setTimeLeft(data.gameState.time_left || 0);
                                          setHasSavedSession(true);
                                      }
                                  } catch(e) { console.error("Failed to parse saved board", e); }
                              }
                          }
                          setUserStats(prev => ({
                              ...prev,
                              totalScore: parseInt(data.gameState?.total_score || '0'),
                              totalTimePlayed: data.gameState?.total_time_played || 0,
                              adsViewed: data.gameState?.ads_viewed || 0,
                              tonPurchases: parseFloat(data.gameState?.ton_purchases_total || '0'),
                              referralCode: data.user.referral_code,
                              redeemedReferralCode: data.user.redeemed_code,
                              friends: data.friends ? data.friends.map((f: any) => ({
                                  id: f.id,
                                  name: f.friend_name,
                                  bonusEarned: f.bonus_earned,
                                  date: new Date().toLocaleDateString()
                              })) : [],
                              purchaseHistory: data.purchases ? data.purchases.map((p: any) => ({
                                  id: p.id,
                                  item: p.item_name,
                                  cost: parseFloat(p.cost),
                                  date: new Date(p.transaction_date).toLocaleDateString()
                              })) : []
                          }));
                          if (data.isNew) showToast(`Welcome, ${user.first_name}!`);
                      } 
                  } catch (e: any) {
                      alert(`Connection Failed:\n${e.message}\nPlease refresh.`); 
                  } finally { setIsLoading(false); }
                  return;
              }
          }
          setIsTelegramUser(false); setIsLoading(false);
      };
      initApp();
  }, []);

  useEffect(() => {
    if (!userStats.referralCode) setUserStats(prev => ({ ...prev, referralCode: 'R-' + Math.random().toString(36).substring(2, 8).toUpperCase() }));
  }, [userStats.referralCode]);

  useEffect(() => {
      if (showLeaderboard) {
          api.getLeaderboard().then(data => {
              // ... leaderboard logic can be refined later if needed
          });
      }
  }, [showLeaderboard, userStats.totalScore, currentLevelIndex, telegramName]);

  useEffect(() => {
      if (!wallet) { if (isShopOpen) setIsShopOpen(false); if (isWalletOpen) setIsWalletOpen(false); }
  }, [wallet, isShopOpen, isWalletOpen]);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    const timer = setInterval(() => {
        setUserStats(prev => ({ ...prev, totalTimePlayed: prev.totalTimePlayed + 1 }));
        setTimeLeft((prev) => {
            if (prev <= 1) { clearInterval(timer); setGameState('LOST'); return 0; }
            return prev - 1;
        });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

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
    } else { setIsCelebrating(false); }
  }, [gameState, playMode]);

  const openLevelPreview = (levelIndex: number) => {
    const baseLevel = LEVELS[levelIndex % LEVELS.length];
    const adjustedLevel = applyDifficulty(baseLevel, difficulty);
    setPreGameBoosters({ bomb: false, extraMoves: false });
    setPreviewData({ levelConfig: adjustedLevel, mode: 'CAMPAIGN', index: levelIndex });
  };

  const openDailyPreview = () => {
      const dailyLevel = generateDailyLevel();
      const adjustedLevel = applyDifficulty(dailyLevel, difficulty);
      setPreGameBoosters({ bomb: false, extraMoves: false });
      setPreviewData({ levelConfig: adjustedLevel, mode: 'DAILY', index: -1 });
  };

  const startPreviewGame = () => {
    if (!previewData) return;
    showAd(() => {
        setPlayMode(previewData.mode);
        if (previewData.mode === 'CAMPAIGN') setCurrentLevelIndex(previewData.index);
        setActiveLevel(previewData.levelConfig);
        initGame(previewData.levelConfig);
        setPreviewData(null);
    });
  };

  const resumeGame = () => {
      // Resume from loaded state
      setActiveLevel(LEVELS[currentLevelIndex % LEVELS.length]);
      // Goals progress needs to be re-calculated or persisted. 
      // For simplicity in this version, we reset goal progress or assume simple clear.
      // Ideally, goalProgress should also be in DB. 
      // For now, let's init goals to 0, which makes resuming slightly harder (must recollect), 
      // but board state is kept. 
      const levelConfig = LEVELS[currentLevelIndex % LEVELS.length];
      const initialProgress: Record<string, number> = {};
      levelConfig.goals.forEach(g => initialProgress[g.id] = 0);
      setGoalProgress(initialProgress);
      
      setPlayMode('CAMPAIGN');
      setGameState('PLAYING');
      setIsProcessing(false); setSelectedCandy(null); setComboMultiplier(1);
      setPreGameBoosters({ bomb: false, extraMoves: false });
      showToast("Game Resumed!");
  };

  const initGame = (levelConfig: LevelConfig) => {
    const startWithBomb = preGameBoosters.bomb && inventory.boosters.bomb > 0;
    const startMoves = (preGameBoosters.extraMoves && inventory.boosters.extraMoves > 0) ? levelConfig.moves + 5 : levelConfig.moves;
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
    setScore(0); setMoves(startMoves); setTimeLeft(levelConfig.timeLimit);
    if (startMoves > levelConfig.moves) { setTimeout(() => setTriggerMovesAnim(true), 500); setTimeout(() => setTriggerMovesAnim(false), 1500); }
    const initialProgress: Record<string, number> = {};
    levelConfig.goals.forEach(g => initialProgress[g.id] = 0);
    setGoalProgress(initialProgress);
    setGameState('PLAYING'); setIsProcessing(false); setSelectedCandy(null); setComboMultiplier(1);
    setIsShaking(false); setActiveEffects([]); setCollectingIndices([]); setActiveBooster(null); setBombEffectIndex(null);
    lastSwapRef.current = null; winProcessed.current = false; setIsShuffling(false); setComboVisuals(null);
    setShuffleAvailable(true); setPreGameBoosters({ bomb: false, extraMoves: false });
    
    // Clear saved session on new start
    setHasSavedSession(false);
  };

  const checkWinCondition = (currentScore: number, currentProgress: Record<string, number>) => {
    return activeLevel.goals.every(goal => {
        if (goal.type === 'SCORE') return currentScore >= goal.target;
        if (goal.type === 'COLLECT') return (currentProgress[goal.id] || 0) >= goal.target;
        return false;
    });
  };

  // Înlocuiește tot useEffect-ul ăsta vechi cu ăsta nou:
useEffect(() => {
    if (gameState === 'WON' && !winProcessed.current) {
        winProcessed.current = true;
        setIsCelebrating(true);

        // Nivelul următor (1-based pentru DB)
        const nextLevel1Based = currentLevelIndex + 2;  // ex: termin level 1 (index 0) → next = 2

        // Actualizăm local
        setCurrentLevelIndex(prev => prev + 1);
        const newStats = { ...userStats, totalScore: userStats.totalScore + score };
        setUserStats(newStats);

        // Daily reward dacă e cazul
        let newInv = inventory;
        if (playMode === 'DAILY') {
            const today = getTodayDateString();
            if (lastDailyCompleted !== today) {
                newInv = { ...inventory, coins: inventory.coins + 100, boosters: { ...inventory.boosters, bomb: inventory.boosters.bomb + 1 }};
                setInventory(newInv);
                setLastDailyCompleted(today);
                showToast("Daily Reward: +100 Coins & 1 Bomb!");
            }
        }
const saveData = { 
    board, 
    score, 
    moves, 
    timeLeft, 
    levelIndex: currentLevelIndex + 1,   // 1-based
    inventory, 
    stats: userStats, 
    lastDailyCompleted 
};
        // În useEffect-ul de WON, înlocuiește tot persistData cu:
persistData({
    levelIndex: currentLevelIndex + 2,  // 0-based + 2 = 1-based pentru nivelul următor
    stats: newStats,
    inventory: newInv,
    lastDailyCompleted: playMode === 'DAILY' ? getTodayDateString() : lastDailyCompleted
});

        setHasSavedSession(false);

        setTimeout(() => {
            setGameState('INTRO');
            setIsCelebrating(false);
        }, 4000);
    }
}, [gameState, currentLevelIndex, score, userStats, inventory, playMode, lastDailyCompleted, telegramId]);

  const handleRedeemReferral = (code: string) => {
      if (!telegramId) return { success: false, message: "Not connected" };
      api.redeemReferral(telegramId, code).then(res => {
          if (res.success && res.rewards) {
              const newInv = {
                  ...inventory,
                  coins: inventory.coins + res.rewards.coins,
                  boosters: { ...inventory.boosters, bomb: inventory.boosters.bomb + res.rewards.bomb }
              };
              setInventory(newInv);
              setUserStats(prev => ({ ...prev, redeemedReferralCode: code }));
              showToast(res.message);
          } else {
              showToast(res.message || "Failed to redeem");
          }
      });
      return { success: true, message: "Checking code..." };
  };

  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    let timeoutId: ReturnType<typeof setTimeout>;
    const checkBoard = async () => {
      const matches = findMatches(board);
      if (matches.length > 0) {
        setIsProcessing(true);
        const swapContext = comboMultiplier === 1 ? lastSwapRef.current : null;
        const { board: boardAfterClear, scoreDelta, clearedCandies, specialEvents } = processMatches(board, swapContext);
        const newScore = score + (scoreDelta * comboMultiplier);
        setScore(newScore);
        const newProgress = { ...goalProgress };
        let progressUpdated = false;
        activeLevel.goals.forEach(goal => {
            if (goal.type === 'COLLECT') {
                const count = clearedCandies.filter(c => {
                   if (goal.targetColor && c.color !== goal.targetColor) return false;
                   if (goal.targetCandyType === 'STRIPED_ANY') { if (c.type !== CandyType.StripedHorizontal && c.type !== CandyType.StripedVertical) return false; } 
                   else if (goal.targetCandyType && c.type !== goal.targetCandyType) return false;
                   return true;
                }).length;
                if (count > 0) {
                    const current = newProgress[goal.id] || 0;
                    if (current < goal.target) { newProgress[goal.id] = Math.min(goal.target, current + count); progressUpdated = true; }
                }
            }
        });
        if (progressUpdated) setGoalProgress(newProgress);
        setBoard(boardAfterClear); setComboMultiplier(c => c + 1);
        await new Promise(r => setTimeout(r, 300));
        const { board: boardAfterFall, movesHappened } = moveCandiesDown(boardAfterClear);
        setBoard(boardAfterFall);
        if (movesHappened) await new Promise(r => setTimeout(r, 450));
      } else {
        setIsProcessing(false); setComboMultiplier(1); lastSwapRef.current = null;
        if (checkWinCondition(score, goalProgress)) { setTimeout(() => setGameState('WON'), 500); } 
        else if (moves <= 0) { setTimeout(() => setGameState('LOST'), 500); } 
        else {
            if (!hasValidMoves(board)) {
                setIsProcessing(true); showToast("No Moves! Shuffling...");
                setTimeout(() => { setBoard(shuffleBoard(board)); setIsProcessing(false); }, 1500);
            } else {
                // AUTO-SAVE on Every Stable Move (debounced by API call nature)
                // We only save if we are NOT processing matches and it's a stable state
                // This ensures if user closes app, they lose at most 1 move
                // However, to avoid spamming API, we could just do it here
                const saveData = { board, score, moves, timeLeft, levelIndex: currentLevelIndex, goalProgress, timestamp: Date.now(), inventory, stats: userStats, lastDailyCompleted };
                persistData(saveData);
            }
        }
      }
    };
    if (!isProcessing || comboMultiplier > 1) timeoutId = setTimeout(checkBoard, 300);
    return () => clearTimeout(timeoutId);
  }, [board, gameState, moves, comboMultiplier, goalProgress, score, activeLevel]);

  const handleSwipe = useCallback((index1: number, index2: number) => {
    if (isProcessing || gameState !== 'PLAYING' || activeBooster) return;
    if (index2 < 0 || index2 >= board.length) return;
    if (!isAdjacent(index1, index2)) return;
    const c1 = board[index1]; const c2 = board[index2];
    const isSpecial1 = c1?.type !== CandyType.Normal; const isSpecial2 = c2?.type !== CandyType.Normal;
    if (c1 && c2 && (isSpecial1 || isSpecial2)) {
        const comboResult = resolveSpecialCombination(board, index1, index2);
        if (comboResult.triggered) {
            setIsProcessing(true); setSelectedCandy(null); setMoves(m => m - 1);
            const newBoard = [...board]; newBoard[index1] = c2; newBoard[index2] = c1; setBoard(newBoard);
            if (comboResult.type === 'COMBO_BOMB_BOMB') { setComboVisuals({ type: 'MEGA_BOOM', active: true }); setIsShaking(true); playExplosionSound('mega'); showToast("ULTIMATE BLAST! +5000"); } 
            else if (comboResult.type === 'COMBO_BOMB_STRIPED') { setComboVisuals({ type: 'SUPER_STRIPES', active: true }); setIsShaking(true); playExplosionSound('super'); showToast("SUPER STRIPES!"); if (comboResult.transformations) { const transBoard = [...newBoard]; comboResult.transformations.forEach(t => { if (transBoard[t.index]) transBoard[t.index] = { ...transBoard[t.index]!, type: t.type, isNew: true }; }); setBoard(transBoard); } } 
            else if (comboResult.type === 'RAINBOW' || comboResult.type === 'COMBO_RAINBOW') { setComboVisuals({ type: 'RAINBOW_BLAST', active: true }); setIsShaking(true); playExplosionSound('rainbow'); showToast("COLOR WIPE!"); if (comboResult.transformations) { const transBoard = [...newBoard]; comboResult.transformations.forEach(t => { if (transBoard[t.index]) transBoard[t.index] = { ...transBoard[t.index]!, type: t.type, isNew: true }; }); setBoard(transBoard); } } 
            else { playExplosionSound('normal'); }
            const delay = (comboResult.type === 'COMBO_BOMB_BOMB' || comboResult.type === 'COMBO_BOMB_STRIPED' || comboResult.type === 'RAINBOW' || comboResult.type === 'COMBO_RAINBOW') ? 1200 : 600;
            setTimeout(() => {
                 const clearBoard = [...newBoard]; comboResult.clearedIndices.forEach(idx => clearBoard[idx] = null);
                 setScore(s => s + comboResult.score); setBoard(clearBoard); setActiveEffects([]); setComboVisuals(null); setIsShaking(false);
                 setTimeout(() => setIsProcessing(false), 300);
            }, delay);
            return;
        }
    }
    const newBoard = [...board]; const temp = newBoard[index1]; newBoard[index1] = newBoard[index2]; newBoard[index2] = temp;
    const matches = findMatches(newBoard);
    if (matches.length > 0) { lastSwapRef.current = [index1, index2]; setBoard(newBoard); setMoves(m => m - 1); setSelectedCandy(null); } 
    else { setIsProcessing(true); setBoard(newBoard); setTimeout(() => { setBoard(board); setIsProcessing(false); setSelectedCandy(null); }, 300); }
  }, [board, isProcessing, gameState, activeBooster]);

  const handleTap = useCallback((index: number) => {
    if (isProcessing || gameState !== 'PLAYING') return;
    if (activeBooster === 'BOMB') {
        const targetCandy = board[index]; if (!targetCandy) return;
        setBombEffectIndex(index); setIsProcessing(true); 
        const newInv = { ...inventory, boosters: { ...inventory.boosters, bomb: Math.max(0, inventory.boosters.bomb - 1) } };
        setInventory(newInv);
        const saveData = { board, score, moves, timeLeft, levelIndex: currentLevelIndex, goalProgress, timestamp: Date.now(), inventory: newInv, stats: userStats, lastDailyCompleted };
        persistData(saveData);
        setTimeout(() => {
            const newBoard = [...board]; newBoard[index] = { ...targetCandy, type: CandyType.Bomb, isNew: true };
            setBoard(newBoard); setIsShaking(true); setTimeout(() => setIsShaking(false), 300);
            setActiveBooster(null); setBombEffectIndex(null); setIsProcessing(false); showToast("Bomb Placed!");
        }, 750);
        return;
    }
    if (selectedCandy === null) setSelectedCandy(index); else { if (selectedCandy === index) setSelectedCandy(null); else handleSwipe(selectedCandy, index); }
  }, [selectedCandy, handleSwipe, isProcessing, gameState, activeBooster, board, inventory, telegramId, userStats]);

  const handleBuyBooster = async (item: 'bomb' | 'extraMoves' | 'shuffle', cost: number) => {
    if (!wallet) { showToast("Connect Wallet first!"); return; }
    const transaction = { validUntil: Math.floor(Date.now() / 1000) + 60, messages: [{ address: TREASURY_WALLET, amount: toNano(cost) }] };
    try {
        await tonConnectUI.sendTransaction(transaction);
        const newInventory = { ...inventory, boosters: { ...inventory.boosters, [item]: inventory.boosters[item] + 1 } };
        setInventory(newInventory);
        const itemName = item === 'bomb' ? 'Bomb' : item === 'extraMoves' ? '+5 Moves' : 'Shuffle';
        if (telegramId) await api.recordPurchase(telegramId, itemName, cost);
        setUserStats(prev => {
            const newRecord: PurchaseRecord = { id: Date.now().toString(), item: itemName, cost: cost, date: new Date().toLocaleDateString() };
            const newStats = { ...prev, tonPurchases: prev.tonPurchases + cost, purchaseHistory: [newRecord, ...prev.purchaseHistory] };
            return newStats;
        });
        showToast("Purchase Successful!");
    } catch (e) { showToast("Transaction Failed"); }
  };

  const handleManualShuffle = () => {
    if (isProcessing || gameState !== 'PLAYING') return;
    const canShuffle = shuffleAvailable || inventory.boosters.shuffle > 0;
    if (!canShuffle) { showToast("No Shuffles left!"); return; }
    setIsProcessing(true); setIsShuffling(true);
    setTimeout(() => {
        setBoard(shuffleBoard(board)); setIsShuffling(false); setIsProcessing(false);
        if (shuffleAvailable) { setShuffleAvailable(false); showToast("Board Shuffled!"); } 
        else {
             const newInv = { ...inventory, boosters: { ...inventory.boosters, shuffle: Math.max(0, inventory.boosters.shuffle - 1) } };
             setInventory(newInv);
             showToast("Board Shuffled!");
        }
    }, 1200);
  };

  const handleUseInGameBooster = (type: 'extraMoves' | 'bomb') => {
      if (inventory.boosters[type] <= 0) { showToast("No boosters left!"); return; }
      if (type === 'extraMoves') {
          setMoves(m => m + 5);
          const newInv = { ...inventory, boosters: { ...inventory.boosters, extraMoves: inventory.boosters.extraMoves - 1 } };
          setInventory(newInv);
          setTriggerMovesAnim(true); setTimeout(() => setTriggerMovesAnim(false), 800); showToast("+5 Moves Added!");
          return;
      }
      if (type === 'bomb') { if (activeBooster === 'BOMB') { setActiveBooster(null); return; } setActiveBooster('BOMB'); showToast("Tap a candy to bomb!"); }
  };

  const handleOpenShop = () => { if (!wallet) { if (tonConnectUI) tonConnectUI.openModal(); showToast("Connect TON Wallet!"); } else { setIsShopOpen(true); } };
  const handleOpenWallet = () => { if (!wallet) { if (tonConnectUI) tonConnectUI.openModal(); showToast("Connect TON Wallet!"); } else { setIsWalletOpen(true); } };

  if (isLoading) return (<div className="w-full h-full flex flex-col items-center justify-center bg-game-bg text-white"><Loader size={48} className="animate-spin text-game-accent mb-4" /><div className="text-xl font-bold animate-pulse">Connecting...</div></div>);
  if (isTelegramUser === false) return (<div className="w-full h-full flex flex-col items-center justify-center bg-game-bg text-white p-8 text-center"><Smartphone size={64} className="mb-4 text-white/50" /><h1 className="text-2xl font-black mb-2">Telegram Only</h1><p className="text-white/60 mb-6">Open in Telegram to play.</p><a href="https://t.me/" className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl font-bold transition-colors">Open Telegram</a></div>);

  return (
    <div className="relative w-full h-full max-w-md mx-auto flex flex-col bg-game-bg overflow-hidden text-white font-sans select-none shadow-2xl">
      <div className={`absolute top-24 left-1/2 transform -translate-x-1/2 z-[100] transition-all duration-300 pointer-events-none ${toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}><div className="bg-black/80 text-white px-6 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-xl font-bold flex items-center gap-2 text-sm whitespace-nowrap"><Zap size={16} className="text-yellow-400 fill-yellow-400" />{toastMessage}</div></div>
      {isSaving && <div className="absolute top-4 right-4 z-[90] flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full text-xs font-bold text-white/80 animate-pulse border border-white/10"><Cloud size={12} /> Saving...</div>}
      
      {isShuffling && (<div className="absolute inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200"><div className="flex flex-col items-center gap-4"><div className="relative"><Shuffle size={64} className="text-white animate-spin duration-1000" /><div className="absolute top-0 left-0 w-full h-full animate-ping opacity-40 bg-white rounded-full" /></div><div className="text-2xl font-bold text-white tracking-widest uppercase animate-pulse">Shuffling...</div></div></div>)}
      <ComboVisualsOverlay active={comboVisuals?.active || false} type={comboVisuals?.type || null} />
      
      {gameState === 'INTRO' && (
          <div className="flex-1 flex flex-col h-full animate-in fade-in duration-500 relative">
             <div className="text-center shrink-0 py-6 px-6 flex flex-col items-center animate-in slide-in-from-top-4 duration-700">
                 <div className="mb-2 relative group cursor-pointer" onClick={() => setShowInfoModal(true)}><div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full animate-pulse-fast" /><img src="https://raw.githubusercontent.com/Iulian85/eliezer-token/main/ELZR.png" alt="Eliezer Logo" className="relative w-28 h-28 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:scale-110" /></div>
                 <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-purple-200 drop-shadow-lg tracking-tight leading-none">ELIEZER<br/><span className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-amber-600">RUSH</span></h1>
                 <div className="text-xs text-white/40 mt-1 font-mono">{telegramName}</div>
             </div>
             <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 custom-scrollbar flex flex-col gap-3">
                 <div className="bg-white/5 p-1 rounded-xl flex gap-1 shrink-0">{(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map((d) => (<button key={d} onClick={() => setDifficulty(d)} className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all ${difficulty === d ? 'bg-game-accent text-white shadow-lg' : 'text-white/40 hover:bg-white/10 hover:text-white'}`}>{d}</button>))}</div>
                 <button onClick={openDailyPreview} className="w-full p-3 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 font-bold shadow-lg shadow-orange-500/20 flex items-center justify-between hover:brightness-110 active:scale-95 transition-all shrink-0"><div className="flex items-center gap-3"><div className="p-2 bg-white/20 rounded-lg"><Calendar className="text-white" size={18} /></div><div className="text-left"><div className="text-[10px] uppercase opacity-80">Daily Challenge</div><div className="text-sm font-black">Play Today's Level</div></div></div>{lastDailyCompleted === getTodayDateString() ? <CheckCircle className="text-white/80" /> : <ChevronRight size={18} />}</button>
                 <div className="bg-game-panel rounded-2xl p-2 border border-white/5 space-y-1.5">
                     {LEVELS.map((lvl, idx) => {
                         // FIXED LOGIC: Strict progression check
                         const isLocked = idx > currentLevelIndex;
                         // Check if this is the current active level and we have a session
                         const canResume = idx === currentLevelIndex && hasSavedSession;
                         
                         return (
                            <button 
                                key={lvl.levelNumber} 
                                onClick={() => {
                                    if (!isLocked) {
                                        if (canResume) resumeGame();
                                        else openLevelPreview(idx);
                                    }
                                }} 
                                className={`w-full p-3 rounded-xl flex items-center justify-between group transition-all ${isLocked ? 'bg-white/5 opacity-50' : canResume ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-400/30' : 'bg-white/10 hover:bg-white/20 hover:scale-[1.01] active:scale-95'}`}
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
                                {!isLocked && (canResume ? <div className="text-[10px] font-bold text-cyan-300 flex items-center gap-1"><RotateCcw size={12}/> RESUME</div> : <Play size={16} className="text-white/50 group-hover:text-white" />)}
                            </button>
                         );
                     })}
                 </div>
             </div>
             <div className="p-4 pt-2 bg-gradient-to-t from-game-bg via-game-bg to-transparent shrink-0">
                 <div className="flex gap-3">
                    <button onClick={() => setShowLeaderboard(true)} className="flex-1 p-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 font-bold shadow-lg shadow-indigo-500/20 flex flex-col items-center justify-center gap-1 hover:brightness-110 active:scale-95 transition-all border border-white/10"><BarChart3 className="text-white" size={18} /><span className="text-[10px] uppercase tracking-wider font-bold">Rank</span></button>
                    <button onClick={() => setIsFrensOpen(true)} className="flex-1 p-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 font-bold shadow-lg shadow-green-500/20 flex flex-col items-center justify-center gap-1 hover:brightness-110 active:scale-95 transition-all border border-white/10"><Users className="text-white" size={18} /><span className="text-[10px] uppercase tracking-wider font-bold">Frens</span></button>
                    <button onClick={handleOpenWallet} className="flex-1 p-3 rounded-2xl bg-gradient-to-r from-gray-700 to-gray-800 font-bold shadow-lg flex flex-col items-center justify-center gap-1 hover:brightness-110 active:scale-95 transition-all border border-white/10">{wallet ? <Wallet className="text-cyan-400" size={18} /> : <Wallet className="text-white/50" size={18} />}<span className={`text-[10px] uppercase tracking-wider font-bold ${wallet ? "text-white" : "text-white/50"}`}>Wallet</span></button>
                 </div>
             </div>
          </div>
      )}
      {previewData && (
          <div className="absolute inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
              <div className="bg-[#2a1b3d] w-full max-w-sm rounded-[2rem] border border-white/10 p-6 shadow-2xl flex flex-col gap-6 relative">
                  <button onClick={() => setPreviewData(null)} className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"><X size={24} /></button>
                  <div className="text-center space-y-1 mt-2"><div className="text-white/50 text-xs font-bold uppercase tracking-wider">Target</div><h2 className="text-3xl font-black text-white">{previewData.mode === 'DAILY' ? 'Daily Challenge' : `Level ${previewData.index + 1}`}</h2><div className="flex flex-wrap justify-center gap-3 mt-4">{previewData.levelConfig.goals.map((g, idx) => (<div key={idx} className="flex flex-col items-center gap-1"><div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">{g.type === 'SCORE' ? <Target size={20} className="text-yellow-400" /> : <CandyIcon color={g.targetColor || CandyColor.Multi} type={g.targetCandyType === 'STRIPED_ANY' ? CandyType.StripedHorizontal : g.targetCandyType} size={20} />}</div><span className="text-[10px] text-white/60 font-medium max-w-[60px] leading-tight">{g.type === 'SCORE' ? g.target.toLocaleString() : `x${g.target}`}</span></div>))}</div></div>
                  <div className="space-y-3"><div className="flex items-center justify-between px-1"><h3 className="text-xs font-bold text-white/50 uppercase tracking-widest">Select Boosters</h3><div onClick={handleOpenShop} className="text-xs font-bold text-game-accent cursor-pointer hover:underline flex items-center gap-1"><Plus size={12} /> Get More</div></div><div className="grid grid-cols-2 gap-3"><div onClick={() => inventory.boosters.bomb > 0 && setPreGameBoosters(p => ({ ...p, bomb: !p.bomb }))} className={`relative p-3 rounded-2xl border transition-all flex flex-col items-center gap-2 cursor-pointer group ${preGameBoosters.bomb ? 'bg-red-500/20 border-red-500 ring-1 ring-red-500' : 'bg-white/5 border-white/10 hover:bg-white/10'} ${inventory.boosters.bomb === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}><div className="absolute top-2 right-2 bg-black/40 px-1.5 py-0.5 rounded-md text-[10px] font-bold text-white border border-white/10">x{inventory.boosters.bomb}</div><div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${preGameBoosters.bomb ? 'bg-red-500 shadow-red-500/50' : 'bg-white/10'}`}><Target size={20} className="text-white" /></div><div className="text-xs font-bold text-white">Bomb Candy</div></div><div onClick={() => inventory.boosters.extraMoves > 0 && setPreGameBoosters(p => ({ ...p, extraMoves: !p.extraMoves }))} className={`relative p-3 rounded-2xl border transition-all flex flex-col items-center gap-2 cursor-pointer group ${preGameBoosters.extraMoves ? 'bg-blue-500/20 border-blue-500 ring-1 ring-blue-500' : 'bg-white/5 border-white/10 hover:bg-white/10'} ${inventory.boosters.extraMoves === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}><div className="absolute top-2 right-2 bg-black/40 px-1.5 py-0.5 rounded-md text-[10px] font-bold text-white border border-white/10">x{inventory.boosters.extraMoves}</div><div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${preGameBoosters.extraMoves ? 'bg-blue-500 shadow-blue-500/50' : 'bg-white/10'}`}><Zap size={20} className="text-white fill-white" /></div><div className="text-xs font-bold text-white">+5 Moves</div></div></div></div>
                  <button onClick={startPreviewGame} className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 font-black text-white text-lg tracking-wide shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"><Play size={20} fill="currentColor" /> PLAY</button>
              </div>
          </div>
      )}
      {gameState === 'PLAYING' && (
          <>
            <div className="px-4 pt-4 flex items-center justify-between z-20 relative bg-gradient-to-b from-black/60 to-transparent pb-2">
                <button onClick={() => setGameState('INTRO')} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all"><Home size={16} /></button>
                <div className="flex flex-col items-center"><div className="text-xs font-bold text-white/60 uppercase tracking-widest shadow-black drop-shadow-md">{playMode === 'DAILY' ? 'Daily Challenge' : `Level ${currentLevelIndex + 1}`}</div>{difficulty !== 'MEDIUM' && (<div className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 shadow-sm border border-white/10 ${difficulty === 'EASY' ? 'bg-green-500/40 text-green-100' : 'bg-red-500/40 text-red-100'}`}>{difficulty}</div>)}</div>
                <div className="flex items-center gap-2"><button onClick={() => setShowInfoModal(true)} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all"><Info size={16} /></button></div>
            </div>
            <div className="px-4 pb-2 flex items-end justify-between z-10">
                <div className="flex flex-col items-center"><div className={`bg-game-panel px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2 shadow-lg transition-all duration-300 ${triggerMovesAnim ? 'scale-110 bg-yellow-500/20 text-yellow-300 ring-2 ring-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)]' : ''}`}><Move size={16} className={triggerMovesAnim ? 'text-yellow-300' : 'text-blue-300'} /><span className="font-black text-xl">{moves}</span></div><span className="text-[10px] font-bold text-white/50 mt-1 uppercase tracking-wider">Moves</span></div>
                <div className="flex gap-2">{activeLevel.goals.map((goal) => { const current = goalProgress[goal.id] || 0; const isMet = current >= goal.target; return (<div key={goal.id} className={`flex flex-col items-center transition-all duration-500 ${isMet ? 'opacity-50 scale-90 grayscale' : ''}`}><div className="w-12 h-12 rounded-2xl bg-game-panel border border-white/10 flex items-center justify-center relative overflow-hidden">{goal.type === 'SCORE' ? <Target size={20} className="text-yellow-400" /> : <CandyIcon color={goal.targetColor || CandyColor.Multi} type={goal.targetCandyType === 'STRIPED_ANY' ? CandyType.StripedHorizontal : goal.targetCandyType} size={20} />}<div className="absolute bottom-0 left-0 right-0 bg-green-500/50 transition-all duration-500" style={{ height: `${(current / goal.target) * 100}%` }} />{isMet && <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center"><CheckCircle size={20} className="text-white" /></div>}</div><span className="text-[10px] font-bold mt-1 text-white shadow-black drop-shadow-md">{current}/{goal.target}</span></div>); })}</div>
                <div className="flex flex-col items-center"><div className={`bg-game-panel px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2 shadow-lg ${timeLeft < 10 ? 'animate-pulse text-red-400 border-red-400/50' : ''}`}><Clock size={16} className={timeLeft < 10 ? 'text-red-400' : 'text-purple-300'} /><span className="font-black text-xl font-mono">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span></div><span className="text-[10px] font-bold text-white/50 mt-1 uppercase tracking-wider">Time</span></div>
            </div>
            <div className="px-6 py-2 relative z-10">
                 <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/5"><div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 transition-all duration-500 ease-out relative" style={{ width: `${Math.min(100, (score / (activeLevel.goals.find(g => g.type === 'SCORE')?.target || 1000)) * 100)}%` }}><div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-[2px]" /></div></div>
                 <div className="flex justify-between items-center mt-1"><span className="text-xs font-bold text-white/40">Score</span><span className="text-sm font-black text-white drop-shadow-md">{score.toLocaleString()}</span></div>
            </div>
            <div className="flex-1 flex items-center justify-center p-4 relative z-0"><GameBoard board={board} selectedCandyIndex={selectedCandy} onTap={handleTap} onSwipe={handleSwipe} isProcessing={isProcessing} isShaking={isShaking} activeEffects={activeEffects} bombEffectIndex={bombEffectIndex} collectingIndices={collectingIndices} /></div>
            <div className="px-4 pb-6 pt-2 flex items-center justify-between gap-4 z-10 bg-gradient-to-t from-game-bg via-game-bg to-transparent">
                <button onClick={() => initGame(activeLevel)} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors" title="Restart Level"><RefreshCw size={20} /></button>
                <div className="flex-1 bg-black/30 backdrop-blur-md rounded-2xl p-2 border border-white/10 flex justify-around shadow-xl"><BoosterButton icon={Target} count={inventory.boosters.bomb} onClick={() => handleUseInGameBooster('bomb')} isActive={activeBooster === 'BOMB'} color="red" /><BoosterButton icon={Zap} count={inventory.boosters.extraMoves} onClick={() => handleUseInGameBooster('extraMoves')} color="blue" /><BoosterButton icon={Shuffle} onClick={handleManualShuffle} color="green" disabled={!shuffleAvailable && inventory.boosters.shuffle === 0} label={shuffleAvailable ? "FREE" : undefined} count={!shuffleAvailable ? inventory.boosters.shuffle : undefined} /></div>
                <button onClick={handleOpenShop} className={`w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg transition-all border-2 border-white/20 ${wallet ? 'from-yellow-400 to-orange-500 shadow-orange-500/20 hover:scale-105' : 'from-gray-600 to-gray-700 grayscale'}`}><ShoppingBag size={20} /></button>
            </div>
          </>
      )}
      {showInfoModal && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 px-4">
          <div className="bg-game-bg border border-white/20 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative max-h-[80vh] overflow-y-auto">
            <button onClick={() => setShowInfoModal(false)} className="absolute top-4 right-4 text-white/50 hover:text-white"><X size={24} /></button>
            <div className="text-center mb-6"><div className="inline-flex items-center justify-center p-3 bg-blue-600/30 rounded-full mb-2 ring-1 ring-blue-400/50 shadow-lg"><Info size={24} className="text-blue-200" /></div><h2 className="text-2xl font-black text-white tracking-wide">Candy Combos</h2></div>
            <div className="space-y-4"><div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4 flex items-center gap-4 relative overflow-hidden"><div className="absolute top-0 right-0 p-1 bg-purple-500 text-[9px] font-bold text-white rounded-bl-lg">LEGENDARY</div><div className="flex flex-col items-center justify-center gap-1 shrink-0 bg-black/30 p-2 rounded-lg border border-white/10 z-10"><div className="flex gap-1"><div className="w-8 h-8"><CandyIcon color={CandyColor.Multi} type={CandyType.Rainbow} /></div><div className="w-8 h-8"><CandyIcon color={CandyColor.Red} type={CandyType.Normal} /></div></div><div className="text-[10px] font-bold text-white/40">SWAP</div></div><div className="min-w-0 flex-1 z-10"><div className="font-black text-base text-pink-300 mb-1 drop-shadow-md">Rainbow Blast</div><div className="text-xs text-white/80 leading-snug">Clear <span className="text-white font-bold underline">ALL</span> candies of that color! Created by matching 5 in a row.</div></div></div></div>
            <button onClick={() => setShowInfoModal(false)} className="w-full mt-6 py-3 rounded-xl bg-white/10 font-bold text-white hover:bg-white/20 transition-all">Close Guide</button>
          </div>
        </div>
      )}
      {showLeaderboard && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-game-bg border border-white/20 w-full max-w-xs rounded-[2rem] shadow-2xl relative flex flex-col max-h-[80vh] overflow-hidden">
            <div className="p-6 pb-4 relative bg-gradient-to-b from-indigo-900/50 to-transparent"><button onClick={() => setShowLeaderboard(false)} className="absolute top-4 right-4 text-white/50 hover:text-white"><X size={24} /></button><div className="text-center"><div className="inline-flex items-center justify-center p-3 bg-indigo-600/30 rounded-full mb-2 ring-1 ring-indigo-400/50 shadow-lg"><BarChart3 size={24} className="text-indigo-200" /></div><h2 className="text-2xl font-black text-white tracking-wide">Global Rank</h2><p className="text-xs text-white/50 mt-1">Top Players Worldwide</p></div></div>
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-24 space-y-2">{!leaderboardData ? (<div className="flex justify-center py-8"><Loader className="animate-spin text-white/30" /></div>) : (leaderboardData.top10.map((entry, index) => (<div key={index} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${entry.isUser ? 'bg-indigo-500/20 border-indigo-400/50' : 'bg-white/5 border-white/5'}`}><div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm relative shadow-md ${index === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 text-white border border-yellow-200' : index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white border border-gray-200' : index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-700 text-white border border-orange-300' : 'bg-white/10 text-white/50'}`}>{index + 1}</div><div className="text-left"><div className={`font-bold text-sm truncate max-w-[120px] ${entry.isUser ? 'text-indigo-200' : 'text-white'}`}>{entry.name} {entry.isUser && '(You)'}</div><div className="text-[10px] text-white/50 font-mono">Level {entry.level}</div></div></div><div className="font-black text-sm text-right tabular-nums text-white/90">{entry.score.toLocaleString()}</div></div>)))}</div>
            <div className="absolute bottom-0 left-0 right-0 bg-[#1a103c] p-4 border-t border-white/20 shadow-[0_-10px_20px_rgba(0,0,0,0.5)] flex items-center justify-center">{leaderboardData && (<div className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-3 flex items-center justify-between shadow-lg border border-white/20 relative overflow-hidden"><div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" /><div className="flex items-center gap-3 z-10"><div className="flex flex-col items-center justify-center w-10 h-10 bg-black/30 rounded-lg border border-white/10"><span className="text-[8px] text-white/50 uppercase font-bold">Rank</span><span className="text-lg font-black text-white leading-none">{leaderboardData.userEntry.rank}</span></div><div><div className="font-bold text-white text-sm flex items-center gap-1"><User size={14} /> {leaderboardData.userEntry.name}</div><div className="text-[10px] text-indigo-200">Level {leaderboardData.userEntry.level}</div></div></div><div className="z-10 text-right"><div className="text-[10px] text-white/50 uppercase font-bold">Total Score</div><div className="font-black text-lg text-white tabular-nums">{leaderboardData.userEntry.score.toLocaleString()}</div></div></div>)}</div>
          </div>
        </div>
      )}
      {isCelebrating && (<div className="absolute inset-0 z-[90] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-500 pointer-events-none"><CelebrationOverlay /><div className="animate-bounce-in flex flex-col items-center p-8 rounded-3xl bg-gradient-to-b from-white/10 to-transparent border border-white/20 backdrop-blur-md shadow-2xl"><div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(250,204,21,0.6)] mb-4 animate-pulse"><Trophy size={48} className="text-yellow-900" /></div><h2 className="text-4xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] tracking-wider text-center">LEVEL<br/>COMPLETE!</h2><div className="mt-2 text-yellow-300 font-bold text-xl drop-shadow-md">Score: {score.toLocaleString()}</div></div></div>)}
      {gameState === 'LOST' && (<div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-300"><div className="bg-[#2a1b3d] border border-white/10 p-8 rounded-[2rem] shadow-2xl text-center max-w-xs w-full"><div className="w-20 h-20 bg-white/10 rounded-full mx-auto flex items-center justify-center mb-4"><RotateCcw size={40} className="text-white/50" /></div><h2 className="text-3xl font-black text-white mb-2">Out of Moves!</h2><p className="text-white/50 mb-8 text-sm">Don't give up, try again!</p><div className="space-y-3"><button onClick={() => showAd(() => initGame(activeLevel))} className="w-full py-3.5 rounded-xl bg-white text-black font-bold hover:bg-gray-100 transition-colors">Try Again</button><button onClick={() => setGameState('INTRO')} className="w-full py-3.5 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-colors flex items-center justify-center gap-2"><Home size={16} /> Main Menu</button></div></div></div>)}
      <ShopModal isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} inventory={inventory} onBuy={handleBuyBooster} walletConnected={!!wallet} stats={userStats} />
      <WalletModal isOpen={isWalletOpen} onClose={() => setIsWalletOpen(false)} walletAddress={wallet?.account.address ? `${wallet.account.address.substring(0, 6)}...${wallet.account.address.substring(wallet.account.address.length - 4)}` : null} stats={userStats} />
      <FrensModal isOpen={isFrensOpen} onClose={() => setIsFrensOpen(false)} stats={userStats} onRedeemCode={handleRedeemReferral} />
    </div>
  );
};

const BoosterButton: React.FC<{ icon: React.FC<any>; count?: number; onClick: () => void; isActive?: boolean; color: 'red' | 'blue' | 'green'; label?: string; disabled?: boolean; }> = ({ icon: Icon, count, onClick, isActive, color, label, disabled }) => {
    const [isUsed, setIsUsed] = React.useState(false);
    const prevCountRef = React.useRef(count || 0);
    const colors = { red: 'bg-red-500 shadow-red-500/30', blue: 'bg-blue-500 shadow-blue-500/30', green: 'bg-green-500 shadow-green-500/30' };
    React.useEffect(() => { if (count !== undefined && count < prevCountRef.current) { setIsUsed(true); const timer = setTimeout(() => setIsUsed(false), 600); return () => clearTimeout(timer); } if (count !== undefined) prevCountRef.current = count; }, [count]);
    return (<button onClick={onClick} disabled={disabled} className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${isActive ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-black' : 'hover:scale-105 active:scale-95'} ${(!disabled && (count === undefined || count > 0 || label === 'FREE')) ? 'bg-white/10 text-white' : 'bg-white/5 text-white/20 cursor-not-allowed'} ${isUsed ? 'bg-white/20 ring-1 ring-white/50' : ''} ${disabled ? 'grayscale opacity-50' : ''}`}><Icon size={20} className={`${isActive ? 'animate-pulse' : ''} ${isUsed ? 'scale-125 duration-150' : ''}`} />{(count !== undefined && count > 0) && (<div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-white/20 shadow-lg transition-all duration-300 ${colors[color]} text-white ${isUsed ? 'scale-150 bg-yellow-400 text-black -translate-y-2' : 'scale-100'}`}>{count}</div>)}{label && (<div className={`absolute -top-2 -right-2 px-1.5 py-0.5 rounded-md flex items-center justify-center text-[9px] font-bold border border-white/20 shadow-lg transition-all duration-300 ${disabled ? 'bg-gray-600' : colors[color]} text-white`}>{label}</div>)}{isUsed && (<div className="absolute inset-0 rounded-xl bg-white/30 animate-ping" />)}{count === 0 && !label && !disabled && <div className="absolute inset-0 flex items-center justify-center text-white/20 font-black text-xl">+</div>}</button>);
}

const ComboVisualsOverlay: React.FC<{ active: boolean; type: 'MEGA_BOOM' | 'SUPER_STRIPES' | 'RAINBOW_BLAST' | null }> = ({ active, type }) => {
    if (!active || !type) return null;
    return (<div className="absolute inset-0 z-[85] flex items-center justify-center pointer-events-none overflow-hidden" />);
};

export default App;
