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
  
  // Actions
  initGame: (level?: number) => void;
  startGame: (level: number) => void;
  selectTile: (id: string) => void;
  loadProgress: () => Promise<void>;
}

export const TOKEN_TYPES: TokenType[] = ['HMSTR', 'USDT', 'NOT', 'DOGS', 'TON', 'ELZR'];

// FIX: Exported TOKEN_COLORS to be used in components like Token.tsx.
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
