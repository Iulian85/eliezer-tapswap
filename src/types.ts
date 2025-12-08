
// FIX: Added 'EMPTY' to allow for empty tiles after matches.
export type TokenType = 'HMSTR' | 'USDT' | 'NOT' | 'DOGS' | 'TON' | 'ELZR' | 'EMPTY';

export interface Tile {
  id: string;
  type: TokenType;
  x: number;
  y: number;
  // FIX: Added optional isMatched property to align with its usage in matchLogic.ts without breaking other components.
  isMatched?: boolean; 
}

export type TabType = 'HOME' | 'TASKS' | 'SHOP' | 'FRENS' | 'WALLET';
export type BoosterType = 'bomb' | 'shuffle' | 'extraMoves';

export interface User {
  id: number;
  username: string;
  firstName: string;
}

export interface Fren {
  id: number;
  name: string;
  score: number;
}

export interface GameStoreState {
  grid: Tile[]; // Flat array for easier manipulation
  width: number;
  height: number;
  score: number;
  moves: number;
  level: number;
  isProcessing: boolean;
  selectedId: string | null;
  gameState: 'MENU' | 'PLAYING' | 'GAMEOVER' | 'WON';
  walletBalance: number;
  lastMatchedPositions: { x: number, y: number }[]; // For particle effects
  
  // Navigation
  activeTab: TabType;
  
  // Boosters
  boosters: {
    bomb: number;
    shuffle: number;
    extraMoves: number;
  };
  activeBooster: BoosterType | null;
  bombExplosionPosition: { x: number, y: number } | null;

  // User Data
  user: User | null;
  frens: Fren[];
  
  // Actions
  initGame: (level?: number) => void;
  startGame: (level: number) => void;
  quitGame: () => void;
  selectTile: (id: string) => void;
  loadProgress: () => Promise<void>;
  setActiveTab: (tab: TabType) => void;
  initUser: () => void;
  claimDailyReward: () => void;
  lastRewardClaimedDate: string | null;
  
  // Booster Actions
  activateBooster: (type: BoosterType) => void;
  buyBooster: (type: BoosterType, price: number) => void;
}

export const TOKEN_TYPES: TokenType[] = ['HMSTR', 'USDT', 'NOT', 'DOGS', 'TON', 'ELZR'];

// FIX: Exported TOKEN_COLORS to be used in components like Token.tsx.
// UPDATED: New "Premium Soft" Palette to match the logo redesign
export const TOKEN_COLORS: Record<TokenType, string> = {
  HMSTR: '#FFAB91', // Soft Peach
  USDT: '#A5D6A7', // Soft Mint
  NOT: '#546E7A',  // Blue Grey (Matte)
  DOGS: '#F5F5F5', // Soft White
  TON: '#90CAF9',  // Soft Blue
  ELZR: '#FFCC80', // Soft Gold
  EMPTY: 'transparent'
};

// STRICT REQUIREMENT: 6 Columns, 9 Rows
export const GRID_W = 6;
export const GRID_H = 9;
