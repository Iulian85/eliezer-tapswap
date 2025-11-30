
export enum CandyColor {
  Red = 'RED',
  Blue = 'BLUE',
  Green = 'GREEN',
  Yellow = 'YELLOW',
  Purple = 'PURPLE',
  Orange = 'ORANGE',
  Multi = 'MULTI', // For Rainbow
}

export enum CandyType {
  Normal = 'NORMAL',
  StripedHorizontal = 'STRIPED_H',
  StripedVertical = 'STRIPED_V',
  Bomb = 'BOMB',
  Rainbow = 'RAINBOW',
}

export interface Candy {
  id: string;
  color: CandyColor;
  type: CandyType;
  isMatched?: boolean;
  isNew?: boolean; // For animation
  isSettling?: boolean; // For fall/settle animation
}

export type Board = (Candy | null)[];

export interface DragState {
  active: boolean;
  startIndex: number | null;
}

// Level System Types
export type GoalType = 'SCORE' | 'COLLECT';

export interface LevelGoal {
  id: string;
  type: GoalType;
  target: number;
  description: string;
  targetColor?: CandyColor; // For COLLECT goals
  targetCandyType?: CandyType | 'STRIPED_ANY'; // For specific candy type collection
}

export interface LevelConfig {
  levelNumber: number | string; // String for 'Daily'
  moves: number;
  timeLimit: number; // Time limit in seconds
  goals: LevelGoal[];
}

export interface Inventory {
  coins: number;
  boosters: {
    bomb: number;
    extraMoves: number;
    shuffle: number;
  };
}

export interface Friend {
  id: string;
  name: string;
  bonusEarned: number;
  date: string;
}

export interface PurchaseRecord {
  id: string;
  item: string;
  cost: number;
  date: string;
}

export interface UserStats {
  totalScore: number;
  totalTimePlayed: number; // in seconds
  referrals: number;
  adsViewed: number;
  tonPurchases: number;
  purchaseHistory: PurchaseRecord[];
  referralCode?: string;
  redeemedReferralCode?: string;
  friends?: Friend[];
  lastLoginRewardDate?: string; // YYYY-MM-DD
}

export type PlayMode = 'CAMPAIGN' | 'DAILY';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface HighScore {
  score: number;
  level: string | number;
  date: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  level: number;
  isUser: boolean;
}

export interface AdsgramShowResult {
    done: boolean; // true if ad was watched to the end
    description: string; // event description
    state: 'load' | 'render' | 'playing' | 'destroy';
    error: boolean; // true if error
}

declare global {
    interface Window {
        Telegram?: any;
        Adsgram?: {
            init: (params: { blockId: string; debug?: boolean }) => {
                show: () => Promise<AdsgramShowResult>;
            };
        };
    }
}