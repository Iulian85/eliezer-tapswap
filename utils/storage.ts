
import { Board, Inventory, HighScore, UserStats, LeaderboardEntry } from '../types';

const SAVE_KEY = 'candy_rush_save_v2';
const HIGHSCORES_KEY = 'candy_rush_highscores';

export interface GameSaveData {
  board: Board;
  score: number;
  moves: number;
  timeLeft: number;
  levelIndex: number;
  goalProgress: Record<string, number>;
  timestamp: number;
  inventory: Inventory;
  stats: UserStats;
  lastDailyCompleted: string | null; // YYYY-MM-DD
}

export const saveGame = (data: GameSaveData): boolean => {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save game:', error);
    return false;
  }
};

export const loadGame = (): GameSaveData | null => {
  try {
    const item = localStorage.getItem(SAVE_KEY);
    if (!item) return null;
    return JSON.parse(item);
  } catch (error) {
    console.error('Failed to load game:', error);
    return null;
  }
};

export const hasSavedGame = (): boolean => {
  return !!localStorage.getItem(SAVE_KEY);
};

export const getHighScores = (): HighScore[] => {
  try {
    const item = localStorage.getItem(HIGHSCORES_KEY);
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
};

export const saveHighScoreEntry = (entry: HighScore): HighScore[] => {
  const scores = getHighScores();
  scores.push(entry);
  // Sort descending by score
  scores.sort((a, b) => b.score - a.score);
  // Keep top 3
  const top3 = scores.slice(0, 3);
  localStorage.setItem(HIGHSCORES_KEY, JSON.stringify(top3));
  return top3;
};

// --- LEADERBOARD MOCK LOGIC ---

const MOCK_NAMES = [
  "CryptoWhale", "Pavel D.", "TonUser_99", "EliezerFan", "CandyKing",
  "Notcoin_OG", "DiamondHands", "ToTheMoon", "GemHunter", "Alex",
  "Satoshi", "Vitalik", "Gavin", "Elon", "DogeLover", "ShibaInu",
  "PepeTheFrog", "Wojak", "Bogdanoff", "CyberPunk"
];

// Deterministic random for stable leaderboard during session
const seededRandom = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
};

export const getLeaderboard = (userStats: UserStats, currentLevel: number, userName: string): { top10: LeaderboardEntry[], userEntry: LeaderboardEntry } => {
    // 1. Generate Fake Players
    const entries: LeaderboardEntry[] = [];
    
    // Generate 50 random players
    for (let i = 0; i < 50; i++) {
        const name = MOCK_NAMES[i % MOCK_NAMES.length] + (Math.floor(seededRandom(i) * 999));
        // Score roughly between 50,000 and 5,000,000
        const score = Math.floor(seededRandom(i * 13) * 5000000) + 50000; 
        // Level roughly proportional to score
        const level = Math.floor(score / 50000) + 1; 

        entries.push({
            rank: 0,
            name: name,
            score: score,
            level: level,
            isUser: false
        });
    }

    // 2. Add Current User
    const userEntry: LeaderboardEntry = {
        rank: 0,
        name: userName,
        score: userStats.totalScore,
        level: currentLevel,
        isUser: true
    };
    entries.push(userEntry);

    // 3. Sort Global List
    entries.sort((a, b) => b.score - a.score);

    // 4. Assign Ranks
    entries.forEach((entry, index) => {
        entry.rank = index + 1;
    });

    // 5. Extract Data
    const top10 = entries.slice(0, 10);
    const userRankedEntry = entries.find(e => e.isUser) || userEntry;

    return { top10, userEntry: userRankedEntry };
};
