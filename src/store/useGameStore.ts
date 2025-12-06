
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { storage, hapticFeedback, hapticNotify, tg } from '../utils/telegram';
import { GameStoreState, Tile, TOKEN_TYPES, GRID_W, GRID_H, TabType, BoosterType } from '../types';

// Helper: Check for matches in a flat grid array
const checkMatch = (grid: Tile[]) => {
  const matches = new Set<string>();
  const getTile = (x: number, y: number) => grid.find(t => t.x === x && t.y === y);

  // Horizontal matches
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W - 2; x++) {
      const t1 = getTile(x, y);
      const t2 = getTile(x + 1, y);
      const t3 = getTile(x + 2, y);
      if (t1 && t2 && t3 && t1.type !== 'EMPTY' && t1.type === t2.type && t1.type === t3.type) {
        matches.add(t1.id);
        matches.add(t2.id);
        matches.add(t3.id);
        for (let i = x + 3; i < GRID_W; i++) {
            const tNext = getTile(i, y);
            if (tNext && tNext.type === t1.type) matches.add(tNext.id);
            else break;
        }
      }
    }
  }

  // Vertical matches
  for (let x = 0; x < GRID_W; x++) {
    for (let y = 0; y < GRID_H - 2; y++) {
      const t1 = getTile(x, y);
      const t2 = getTile(x, y + 1);
      const t3 = getTile(x, y + 2);
      if (t1 && t2 && t3 && t1.type !== 'EMPTY' && t1.type === t2.type && t1.type === t3.type) {
        matches.add(t1.id);
        matches.add(t2.id);
        matches.add(t3.id);
        for (let i = y + 3; i < GRID_H; i++) {
            const tNext = getTile(x, i);
            if (tNext && tNext.type === t1.type) matches.add(tNext.id);
            else break;
        }
      }
    }
  }
  return matches;
};

export const useGameStore = create<GameStoreState>((set, get) => ({
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
  lastMatchedPositions: [],
  
  // Navigation
  activeTab: 'HOME',
  
  // User Data
  user: null,
  frens: [],

  // Boosters
  boosters: {
    bomb: 1,
    shuffle: 1,
    extraMoves: 1
  },
  activeBooster: null,
  bombExplosionPosition: null,
  
  lastRewardClaimedDate: null,

  setActiveTab: (tab: TabType) => {
    set({ activeTab: tab });
    hapticFeedback('light');
  },

  initUser: () => {
    const user = tg.initDataUnsafe?.user;
    if (user) {
        set({ 
            user: {
                id: user.id,
                username: user.username || 'Anon',
                firstName: user.first_name
            }
        });
    } else {
        // Fallback for dev
        set({
            user: {
                id: 123456,
                username: 'DevUser',
                firstName: 'Developer'
            }
        });
    }

    // Mock Frens
    set({
        frens: [
            { id: 1, name: 'Pavel Durov', score: 99999 },
            { id: 2, name: 'Elon Musk', score: 50000 },
            { id: 3, name: 'Satoshi', score: 21000 },
        ]
    });
  },

  initGame: (level = 1) => {
    let newGrid: Tile[] = [];
    const generate = () => {
      newGrid = [];
      for (let y = 0; y < GRID_H; y++) {
        for (let x = 0; x < GRID_W; x++) {
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
      moves: 25, 
      level, 
      gameState: 'PLAYING',
      isProcessing: false,
      selectedId: null,
      lastMatchedPositions: [],
      activeBooster: null,
      bombExplosionPosition: null
    });
  },

  startGame: (level: number) => {
    get().initGame(level);
  },

  quitGame: () => {
    set({ gameState: 'MENU', activeTab: 'HOME' });
  },

  activateBooster: (type: BoosterType) => {
    const { boosters, moves, activeBooster, grid } = get();
    
    // Toggle off if already active
    if (activeBooster === type) {
        set({ activeBooster: null });
        return;
    }

    if (boosters[type] > 0) {
        if (type === 'extraMoves') {
            // Instant effect
            set({ 
                moves: moves + 5,
                boosters: { ...boosters, extraMoves: boosters.extraMoves - 1 }
            });
            hapticNotify('success');
        } else if (type === 'shuffle') {
            // Instant effect
            set({ isProcessing: true });
            setTimeout(() => {
                let newGrid = [...grid];
                // Shuffle types but keep positions logic
                newGrid.forEach(t => {
                    t.type = TOKEN_TYPES[Math.floor(Math.random() * TOKEN_TYPES.length)];
                });
                // Ensure no matches initially after shuffle? Or allow them. allowing them is fun.
                set({ 
                    grid: newGrid, 
                    boosters: { ...boosters, shuffle: boosters.shuffle - 1 },
                    isProcessing: false 
                });
                hapticNotify('success');
            }, 500);
        } else {
            // Bomb needs a target selection
            set({ activeBooster: type });
            hapticFeedback('medium');
        }
    } else {
        hapticNotify('error');
    }
  },

  selectTile: async (id) => {
    const { isProcessing, selectedId, grid, level, activeBooster, boosters } = get();
    if (isProcessing) return;

    // --- Handle BOMB Booster ---
    if (activeBooster === 'bomb') {
        const targetTile = grid.find(t => t.id === id);
        if (!targetTile) return;

        set({ isProcessing: true, activeBooster: null });
        hapticFeedback('heavy');

        // Identify 3x3 area
        const matches = new Set<string>();
        const centerX = targetTile.x;
        const centerY = targetTile.y;

        grid.forEach(t => {
            if (Math.abs(t.x - centerX) <= 1 && Math.abs(t.y - centerY) <= 1) {
                matches.add(t.id);
            }
        });

        // Trigger Explosion Visuals
        set({ bombExplosionPosition: { x: centerX, y: centerY } });
        setTimeout(() => set({ bombExplosionPosition: null }), 800);

        // Deduct Booster
        set({ boosters: { ...boosters, bomb: boosters.bomb - 1 } });
        
        // Proceed to cascade logic similar to match
        // ... reuse match logic below ...
        // We'll insert the matches into the flow
        // Need to refactor flow slightly to handle 'matches' passed in
        // For simplicity, I'll copy the cascade logic here
        
        const matchScore = matches.size * 20; // Bonus points for bomb
        
        // Set matched for particle effects
        const matchedTiles = grid.filter(t => matches.has(t.id));
        set({ lastMatchedPositions: matchedTiles.map(t => ({ x: t.x, y: t.y })) });
        setTimeout(() => set({ lastMatchedPositions: [] }), 300);

        // Apply Cascade
        let currentGrid = grid;
        const nextGrid: Tile[] = [];
        for (let x = 0; x < GRID_W; x++) {
            const column = currentGrid.filter(t => t.x === x && !matches.has(t.id)).sort((a,b) => a.y - b.y);
            column.forEach((tile, newY) => nextGrid.push({ ...tile, y: newY }));
            for (let y = column.length; y < GRID_H; y++) {
                nextGrid.push({
                    id: uuidv4(),
                    type: TOKEN_TYPES[Math.floor(Math.random() * TOKEN_TYPES.length)],
                    x, y
                });
            }
        }
        
        set({ grid: nextGrid, score: get().score + matchScore });
        await new Promise(r => setTimeout(r, 400));
        
        // Check for new matches resulting from cascade
        // This is a simplified recursion - ideally refactor common cascade loop
        set({ isProcessing: false });
        // Trigger selectTile again? No, just end turn logic check
        return; 
    }
    // --- End Bomb Logic ---

    const tile2 = grid.find(t => t.id === id); // The newly clicked tile
    
    // First selection
    if (!selectedId) {
      set({ selectedId: id });
      hapticFeedback('light');
      return;
    }

    const tile1 = grid.find(t => t.id === selectedId);

    // Deselect if same tile is clicked
    if (tile1.id === id) {
      set({ selectedId: null });
      return;
    }

    // If a second tile is clicked but it's not adjacent, select the new tile
    const isAdjacent = Math.abs(tile1.x - tile2.x) + Math.abs(tile1.y - tile2.y) === 1;
    if (!isAdjacent) {
      set({ selectedId: id });
      hapticFeedback('light');
      return;
    }

    // --- Start Processing Swap ---
    set({ isProcessing: true, selectedId: null });

    // 1. Optimistic Swap for UI animation
    const swappedGrid = grid.map(t => {
      if (t.id === tile1.id) return { ...t, x: tile2.x, y: tile2.y };
      if (t.id === tile2.id) return { ...t, x: tile1.x, y: tile1.y };
      return t;
    });
    set({ grid: swappedGrid });
    await new Promise(r => setTimeout(r, 300));

    // 2. Check for matches
    let matches = checkMatch(swappedGrid);

    // 3. Handle Invalid Move (no matches)
    if (matches.size === 0) {
      hapticNotify('warning');
      set({ grid }); // Revert to original grid
      await new Promise(r => setTimeout(r, 300));
      set({ isProcessing: false });
      return;
    }

    // --- Handle Valid Move & Cascades ---
    set(state => ({ moves: state.moves - 1 }));
    hapticFeedback('medium');
    
    let currentGrid = swappedGrid;
    let combo = 1;
    let totalScoreThisTurn = 0;

    while (matches.size > 0) {
      // 4. Update score & trigger particle effects
      const matchScore = matches.size * 10 * combo;
      totalScoreThisTurn += matchScore;
      if (combo > 1) hapticFeedback('heavy');

      const matchedTiles = currentGrid.filter(t => matches.has(t.id));
      const matchedPositions = matchedTiles.map(t => ({ x: t.x, y: t.y }));
      set({ lastMatchedPositions: matchedPositions });
      setTimeout(() => set({ lastMatchedPositions: [] }), 300); // Clear particles after a moment
      
      // 5. Create a new grid with matched tiles removed and remaining tiles "falling"
      const nextGrid: Tile[] = [];
      for (let x = 0; x < GRID_W; x++) {
          const column = currentGrid.filter(t => t.x === x && !matches.has(t.id)).sort((a,b) => a.y - b.y);
          // Re-assign Y indices for fallen tiles
          column.forEach((tile, newY) => {
              nextGrid.push({ ...tile, y: newY });
          });
          // Add new tiles to fill the top
          for (let y = column.length; y < GRID_H; y++) {
              nextGrid.push({
                  id: uuidv4(),
                  type: TOKEN_TYPES[Math.floor(Math.random() * TOKEN_TYPES.length)],
                  x, y
              });
          }
      }
      
      currentGrid = nextGrid;
      set({ grid: currentGrid, score: get().score + matchScore });
      await new Promise(r => setTimeout(r, 400));
      
      matches = checkMatch(currentGrid);
      combo++;
    }

    // 9. End of Turn - Check Win/Loss
    const finalState = get();
    const targetScore = level * 500;
    if (finalState.score >= targetScore) {
        set({ gameState: 'WON', walletBalance: finalState.walletBalance + (level * 50) });
        hapticNotify('success');
    } else if (finalState.moves <= 0) {
        set({ gameState: 'GAMEOVER' });
        hapticNotify('error');
    }
    
    set({ isProcessing: false });
    get().loadProgress(); 
  },

  loadProgress: async () => {
    const saved = await storage.getItem('eliezer_data_v2');
    if (saved) {
      const data = JSON.parse(saved);
      if(data.walletBalance) set({ walletBalance: data.walletBalance });
      if(data.boosters) set({ boosters: data.boosters });
      if(data.lastRewardClaimedDate) set({ lastRewardClaimedDate: data.lastRewardClaimedDate });
    }
  },

  claimDailyReward: () => {
    const today = new Date().toDateString();
    const { lastRewardClaimedDate, walletBalance } = get();

    if (lastRewardClaimedDate !== today) {
        set({ 
            walletBalance: walletBalance + 100,
            lastRewardClaimedDate: today
        });
        hapticNotify('success');
        // Save logic
        storage.setItem('eliezer_data_v2', JSON.stringify({
            walletBalance: walletBalance + 100,
            boosters: get().boosters,
            lastRewardClaimedDate: today
        }));
    }
  },

  buyBooster: (type, price) => {
    const { walletBalance, boosters } = get();
    if (walletBalance >= price) {
        set({
            walletBalance: walletBalance - price,
            boosters: {
                ...boosters,
                [type]: boosters[type] + 1
            }
        });
        hapticNotify('success');
    } else {
        hapticNotify('error');
    }
  }
}));
