import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { storage, hapticFeedback, hapticNotify } from '../utils/telegram';

export type TokenType = 'HMSTR' | 'USDT' | 'NOT' | 'DOGS' | 'TON' | 'ELZR';

export interface Tile {
  id: string;
  type: TokenType;
  x: number;
  y: number;
}

interface GameState {
  grid: Tile[]; // Flat array, use x/y to position
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

const TOKEN_TYPES: TokenType[] = ['HMSTR', 'USDT', 'NOT', 'DOGS', 'TON', 'ELZR'];
const GRID_W = 8;
const GRID_H = 9;

// Helper: Check match at specific coords
const checkMatch = (grid: Tile[]) => {
  const matches = new Set<string>();

  // Helper to get tile at x,y
  const getTile = (x: number, y: number) => grid.find(t => t.x === x && t.y === y);

  // Horizontal
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W - 2; x++) {
      const t1 = getTile(x, y);
      const t2 = getTile(x + 1, y);
      const t3 = getTile(x + 2, y);
      if (t1 && t2 && t3 && t1.type === t2.type && t1.type === t3.type) {
        matches.add(t1.id);
        matches.add(t2.id);
        matches.add(t3.id);
      }
    }
  }

  // Vertical
  for (let x = 0; x < GRID_W; x++) {
    for (let y = 0; y < GRID_H - 2; y++) {
      const t1 = getTile(x, y);
      const t2 = getTile(x, y + 1);
      const t3 = getTile(x, y + 2);
      if (t1 && t2 && t3 && t1.type === t2.type && t1.type === t3.type) {
        matches.add(t1.id);
        matches.add(t2.id);
        matches.add(t3.id);
      }
    }
  }
  return matches;
};

export const useGameStore = create<GameState>((set, get) => ({
  grid: [],
  width: GRID_W,
  height: GRID_H,
  score: 0,
  moves: 20,
  level: 1,
  isProcessing: false,
  selectedId: null,
  gameState: 'MENU',
  walletBalance: 0,

  initGame: (level = 1) => {
    // Generate Grid ensuring no initial matches
    let newGrid: Tile[] = [];
    const generate = () => {
      newGrid = [];
      for (let x = 0; x < GRID_W; x++) {
        for (let y = 0; y < GRID_H; y++) {
          newGrid.push({
            id: uuidv4(),
            type: TOKEN_TYPES[Math.floor(Math.random() * TOKEN_TYPES.length)],
            x,
            y
          });
        }
      }
    };
    
    do {
      generate();
    } while (checkMatch(newGrid).size > 0);

    set({ 
      grid: newGrid, 
      score: 0, 
      moves: 15 + (level * 2), 
      level, 
      gameState: 'PLAYING',
      isProcessing: false,
      selectedId: null
    });
  },

  startGame: (level: number) => {
    get().initGame(level);
  },

  selectTile: async (id) => {
    const { isProcessing, selectedId, grid, moves, score } = get();
    if (isProcessing) return;

    // First selection
    if (!selectedId) {
      set({ selectedId: id });
      hapticFeedback('light');
      return;
    }

    // Deselect if same
    if (selectedId === id) {
      set({ selectedId: null });
      return;
    }

    const t1 = grid.find(t => t.id === selectedId);
    const t2 = grid.find(t => t.id === id);

    if (!t1 || !t2) return;

    // Check adjacency
    const dist = Math.abs(t1.x - t2.x) + Math.abs(t1.y - t2.y);
    if (dist !== 1) {
      set({ selectedId: id }); // Switch selection
      hapticFeedback('light');
      return;
    }

    // SWAP
    set({ isProcessing: true, selectedId: null });
    hapticFeedback('medium');

    // Optimistic Update for Animation
    const swappedGrid = grid.map(t => {
      if (t.id === t1.id) return { ...t, x: t2.x, y: t2.y };
      if (t.id === t2.id) return { ...t, x: t1.x, y: t1.y };
      return t;
    });
    set({ grid: swappedGrid });

    // Wait for animation
    await new Promise(r => setTimeout(r, 300));

    // Check Matches
    const matches = checkMatch(swappedGrid);

    if (matches.size > 0) {
      // Valid Move
      set({ moves: moves - 1 });
      
      let currentGrid = swappedGrid;
      let currentMatches = matches;
      let combo = 1;

      while (currentMatches.size > 0) {
        hapticFeedback('heavy');
        
        // Remove matches
        const remaining = currentGrid.filter(t => !currentMatches.has(t.id));
        set({ score: get().score + (currentMatches.size * 10 * combo) });
        
        // Wait for destroy
        await new Promise(r => setTimeout(r, 200));

        // Gravity: Move tiles down
        const cols: Tile[][] = Array.from({ length: GRID_W }, () => []);
        remaining.forEach(t => cols[t.x].push(t));
        
        // Sort by Y (ascending)
        cols.forEach(col => col.sort((a, b) => a.y - b.y));

        // Reassign Y and fill top
        const fallenGrid: Tile[] = [];
        for (let x = 0; x < GRID_W; x++) {
          let y = 0;
          // Existing tiles
          for (const tile of cols[x]) {
            fallenGrid.push({ ...tile, x, y });
            y++;
          }
          // New tiles
          while (y < GRID_H) {
            fallenGrid.push({
              id: uuidv4(),
              type: TOKEN_TYPES[Math.floor(Math.random() * TOKEN_TYPES.length)],
              x,
              y
            });
            y++;
          }
        }
        
        set({ grid: fallenGrid });
        currentGrid = fallenGrid;
        
        // Wait for fall
        await new Promise(r => setTimeout(r, 300));
        
        currentMatches = checkMatch(currentGrid);
        combo++;
      }

      // Check win/loss
      if (get().moves <= 0) {
        set({ gameState: 'GAMEOVER' });
        hapticNotify('error');
      }

    } else {
      // Invalid Move: Swap back
      hapticNotify('warning');
      const revertedGrid = swappedGrid.map(t => {
        if (t.id === t1.id) return { ...t, x: t1.x, y: t1.y };
        if (t.id === t2.id) return { ...t, x: t2.x, y: t2.y };
        return t;
      });
      set({ grid: revertedGrid });
    }

    set({ isProcessing: false });
  },

  loadProgress: async () => {
    const saved = await storage.getItem('eliezer_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      // restore level etc if needed
    }
  }
}));