
export type TokenType = 'HMSTR' | 'USDT' | 'NOT' | 'DOGS' | 'TON' | 'ELZR' | 'EMPTY';

export interface Tile {
  id: string;
  type: TokenType;
  x: number;
  y: number;
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
  grid: Tile[]; 
  width: number;
  height: number;
  score: number;
  moves: number;
  level: number;
  isProcessing: boolean;
  selectedId: string | null;
  gameState: 'MENU' | 'PLAYING' | 'GAMEOVER' | 'WON';
  walletBalance: number;
  lastMatchedPositions: { x: number, y: number }[];
  
  activeTab: TabType;
  
  boosters: {
    bomb: number;
    shuffle: number;
    extraMoves: number;
  };
  activeBooster: BoosterType | null;
  bombExplosionPosition: { x: number, y: number } | null;

  user: User | null;
  frens: Fren[];
  
  initGame: (level?: number) => void;
  startGame: (level: number) => void;
  quitGame: () => void;
  selectTile: (id: string) => void;
  loadProgress: () => Promise<void>;
  setActiveTab: (tab: TabType) => void;
  initUser: () => void;
  claimDailyReward: () => void;
  lastRewardClaimedDate: string | null;
  
  activateBooster: (type: BoosterType) => void;
  buyBooster: (type: BoosterType, price: number) => void;
}

export const TOKEN_TYPES: TokenType[] = ['HMSTR', 'USDT', 'NOT', 'DOGS', 'TON', 'ELZR'];

// Reference-based "Factory" Palette
export const TOKEN_COLORS: Record<TokenType, string> = {
  HMSTR: '#FF8A65', // Factory Peach (The Accent)
  USDT: '#C5E1A5', // Soft Green (Pastel)
  NOT: '#CFD8DC',  // Matte Grey/Blue
  DOGS: '#FFF59D', // Soft Cream/Yellow
  TON: '#81D4FA',  // Sky Blue
  ELZR: '#FFCC80', // Soft Orange
  EMPTY: 'transparent'
};

export const GRID_W = 6;
export const GRID_H = 9;
