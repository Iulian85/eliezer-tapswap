export type TokenType = 'HMSTR' | 'USDT' | 'NOT' | 'DOGS' | 'TON' | 'ELZR' | 'EMPTY';

export interface Tile {
  id: string; // Unique ID for keying
  type: TokenType;
  x: number; // Grid X
  y: number; // Grid Y (0 is bottom)
  isMatched: boolean;
}

export interface LevelConfig {
  id: number;
  moves: number;
  targetScore: number;
  layout?: number[][]; // 0 for empty, 1 for active
}

export interface GameState {
  // Game Logic
  grid: Tile[][];
  width: number;
  height: number;
  score: number;
  movesLeft: number;
  level: number;
  gameState: 'MENU' | 'PLAYING' | 'WON' | 'LOST';
  selectedTile: { x: number; y: number } | null;
  isProcessing: boolean; // Animations running
  
  // User Data
  maxLevelReached: number;
  walletBalance: number; // In-game ELZR tokens
  
  // Methods
  startGame: (levelId: number) => void;
  selectTile: (x: number, y: number) => void;
  processBoard: () => Promise<void>;
  loadCloudData: () => Promise<void>;
}

export const TOKEN_COLORS: Record<TokenType, string> = {
  HMSTR: '#D97706', // Amber/Orange
  USDT: '#22C55E', // Green
  NOT: '#171717',  // Black
  DOGS: '#F3F4F6', // White
  TON: '#3B82F6',  // Blue
  ELZR: '#EAB308', // Gold
  EMPTY: 'transparent'
};

export const GRID_W = 8;
export const GRID_H = 9;