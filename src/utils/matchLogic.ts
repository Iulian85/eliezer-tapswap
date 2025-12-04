import { Tile, TokenType, GRID_W, GRID_H } from '../types';
import { v4 as uuidv4 } from 'uuid';

const TYPES: TokenType[] = ['HMSTR', 'USDT', 'NOT', 'DOGS', 'TON', 'ELZR'];

export const generateRandomTile = (x: number, y: number): Tile => ({
  id: uuidv4(),
  type: TYPES[Math.floor(Math.random() * TYPES.length)],
  x,
  y,
});

export const createInitialGrid = (): Tile[][] => {
  const grid: Tile[][] = [];
  for (let x = 0; x < GRID_W; x++) {
    const col: Tile[] = [];
    for (let y = 0; y < GRID_H; y++) {
      let tile = generateRandomTile(x, y);
      // Simple prevention of initial match-3
      while (
        (x >= 2 && tile.type === grid[x - 1][y].type && tile.type === grid[x - 2][y].type) ||
        (y >= 2 && tile.type === col[y - 1].type && tile.type === col[y - 2].type)
      ) {
        tile = generateRandomTile(x, y);
      }
      col.push(tile);
    }
    grid.push(col);
  }
  return grid;
};

export const findMatches = (grid: Tile[][]): Tile[] => {
  const matches = new Set<Tile>();

  // Horizontal
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W - 2; x++) {
      const t1 = grid[x][y];
      const t2 = grid[x + 1][y];
      const t3 = grid[x + 2][y];
      if (t1.type !== 'EMPTY' && t1.type === t2.type && t1.type === t3.type) {
        matches.add(t1);
        matches.add(t2);
        matches.add(t3);
      }
    }
  }

  // Vertical
  for (let x = 0; x < GRID_W; x++) {
    for (let y = 0; y < GRID_H - 2; y++) {
      const t1 = grid[x][y];
      const t2 = grid[x][y + 1];
      const t3 = grid[x][y + 2];
      if (t1.type !== 'EMPTY' && t1.type === t2.type && t1.type === t3.type) {
        matches.add(t1);
        matches.add(t2);
        matches.add(t3);
      }
    }
  }

  return Array.from(matches);
};

// Returns new grid and animated changes
export const applyGravity = (grid: Tile[][]): Tile[][] => {
  const newGrid = grid.map(col => [...col]);

  for (let x = 0; x < GRID_W; x++) {
    let writeIndex = 0;
    // Compress column
    for (let y = 0; y < GRID_H; y++) {
      if (newGrid[x][y].type !== 'EMPTY') {
        newGrid[x][writeIndex] = { ...newGrid[x][y], y: writeIndex };
        writeIndex++;
      }
    }
    // Fill top with new
    while (writeIndex < GRID_H) {
      newGrid[x][writeIndex] = generateRandomTile(x, writeIndex);
      writeIndex++;
    }
  }
  return newGrid;
};
