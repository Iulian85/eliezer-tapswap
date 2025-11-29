
import { Board, Candy, CandyColor, CandyType } from '../types';
import { BOARD_WIDTH, TOTAL_CELLS, CANDY_COLORS, SCORE_COMBO_BOMB_BOMB, SCORE_COMBO_BOMB_STRIPED, SCORE_COMBO_STRIPED_STRIPED, SCORE_STRIPED, SCORE_RAINBOW, SCORE_COMBO_RAINBOW_NORMAL, SCORE_COMBO_RAINBOW_SPECIAL, SCORE_COMBO_RAINBOW_RAINBOW } from '../constants';

export const generateRandomCandy = (): Candy => {
  const color = CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)];
  return {
    id: Math.random().toString(36).substr(2, 9),
    color,
    type: CandyType.Normal,
    isNew: true,
  };
};

export const createInitialBoard = (startWithBomb: boolean = false): Board => {
  const board: Board = [];
  for (let i = 0; i < TOTAL_CELLS; i++) {
    let randomCandy = generateRandomCandy();
    // Simple prevention of initial match-3
    while (
      (i % BOARD_WIDTH > 1 &&
        board[i - 1]?.color === randomCandy.color &&
        board[i - 2]?.color === randomCandy.color) ||
      (i >= BOARD_WIDTH * 2 &&
        board[i - BOARD_WIDTH]?.color === randomCandy.color &&
        board[i - BOARD_WIDTH * 2]?.color === randomCandy.color)
    ) {
      randomCandy = generateRandomCandy();
    }
    board.push(randomCandy);
  }

  if (startWithBomb) {
      const centerIndex = Math.floor(TOTAL_CELLS / 2) + Math.floor(BOARD_WIDTH / 2);
      if (board[centerIndex]) {
          board[centerIndex] = {
              ...board[centerIndex]!,
              type: CandyType.Bomb,
              isNew: true
          };
      }
  }

  return board;
};

export const isAdjacent = (index1: number, index2: number): boolean => {
  const diff = Math.abs(index1 - index2);
  const isRowNeighbor = diff === 1 && Math.floor(index1 / BOARD_WIDTH) === Math.floor(index2 / BOARD_WIDTH);
  const isColNeighbor = diff === BOARD_WIDTH;
  return isRowNeighbor || isColNeighbor;
};

// --- Advanced Matching Logic ---

// Basic check for ANY matches (used for valid move validation)
export const findMatches = (board: Board): number[] => {
  const matches = new Set<number>();

  // Horizontal
  for (let row = 0; row < BOARD_WIDTH; row++) {
    for (let col = 0; col < BOARD_WIDTH - 2; col++) {
      const i = row * BOARD_WIDTH + col;
      const c1 = board[i];
      const c2 = board[i + 1];
      const c3 = board[i + 2];
      // Rainbow candies do not match normally with colors
      if (c1 && c2 && c3 && c1.type !== CandyType.Rainbow && c2.type !== CandyType.Rainbow && c3.type !== CandyType.Rainbow && c1.color === c2.color && c1.color === c3.color) {
        matches.add(i);
        matches.add(i + 1);
        matches.add(i + 2);
      }
    }
  }

  // Vertical
  for (let col = 0; col < BOARD_WIDTH; col++) {
    for (let row = 0; row < BOARD_WIDTH - 2; row++) {
      const i = row * BOARD_WIDTH + col;
      const c1 = board[i];
      const c2 = board[i + BOARD_WIDTH];
      const c3 = board[i + BOARD_WIDTH * 2];
      // Rainbow candies do not match normally with colors
      if (c1 && c2 && c3 && c1.type !== CandyType.Rainbow && c2.type !== CandyType.Rainbow && c3.type !== CandyType.Rainbow && c1.color === c2.color && c1.color === c3.color) {
        matches.add(i);
        matches.add(i + BOARD_WIDTH);
        matches.add(i + BOARD_WIDTH * 2);
      }
    }
  }

  return Array.from(matches);
};

interface MatchGroup {
  indices: number[];
  color: CandyColor;
  isHorizontal: boolean;
  isVertical: boolean;
}

// Find grouped matches to detect shapes (4-in-row, L-shape, etc.)
const findMatchGroups = (board: Board): MatchGroup[] => {
  const visited = new Set<number>();
  const groups: MatchGroup[] = [];
  
  const horizontalLines: number[][] = [];
  const verticalLines: number[][] = [];

  // 1. Find all Horizontal Runs >= 3
  for (let row = 0; row < BOARD_WIDTH; row++) {
    let currentRun: number[] = [];
    for (let col = 0; col < BOARD_WIDTH; col++) {
      const idx = row * BOARD_WIDTH + col;
      const candy = board[idx];
      
      if (!candy || candy.type === CandyType.Rainbow) { // Rainbow doesn't form normal matches
        if (currentRun.length >= 3) horizontalLines.push([...currentRun]);
        currentRun = [];
        continue;
      }

      if (currentRun.length === 0) {
        currentRun.push(idx);
      } else {
        const prevIdx = currentRun[currentRun.length - 1];
        if (board[prevIdx]?.color === candy.color) {
          currentRun.push(idx);
        } else {
          if (currentRun.length >= 3) horizontalLines.push([...currentRun]);
          currentRun = [idx];
        }
      }
    }
    if (currentRun.length >= 3) horizontalLines.push([...currentRun]);
  }

  // 2. Find all Vertical Runs >= 3
  for (let col = 0; col < BOARD_WIDTH; col++) {
    let currentRun: number[] = [];
    for (let row = 0; row < BOARD_WIDTH; row++) {
      const idx = row * BOARD_WIDTH + col;
      const candy = board[idx];

      if (!candy || candy.type === CandyType.Rainbow) {
        if (currentRun.length >= 3) verticalLines.push([...currentRun]);
        currentRun = [];
        continue;
      }

      if (currentRun.length === 0) {
        currentRun.push(idx);
      } else {
        const prevIdx = currentRun[currentRun.length - 1];
        if (board[prevIdx]?.color === candy.color) {
          currentRun.push(idx);
        } else {
          if (currentRun.length >= 3) verticalLines.push([...currentRun]);
          currentRun = [idx];
        }
      }
    }
    if (currentRun.length >= 3) verticalLines.push([...currentRun]);
  }

  // 3. Merge intersecting lines into Groups
  const allLines = [...horizontalLines.map(l => ({ indices: l, type: 'H' })), ...verticalLines.map(l => ({ indices: l, type: 'V' }))];
  const lineMerged = new Array(allLines.length).fill(false);

  for (let i = 0; i < allLines.length; i++) {
    if (lineMerged[i]) continue;

    const currentGroupIndices = new Set<number>(allLines[i].indices);
    let isHorizontal = allLines[i].type === 'H';
    let isVertical = allLines[i].type === 'V';
    const color = board[allLines[i].indices[0]]!.color;

    const queue = [i];
    lineMerged[i] = true;

    while (queue.length > 0) {
      const currentLineIdx = queue.shift()!;
      
      // Check all other lines for intersection
      for (let j = 0; j < allLines.length; j++) {
        if (lineMerged[j]) continue;
        
        const otherLine = allLines[j];
        if (board[otherLine.indices[0]]?.color !== color) continue;

        const hasIntersection = otherLine.indices.some(idx => currentGroupIndices.has(idx));
        if (hasIntersection) {
          otherLine.indices.forEach(idx => currentGroupIndices.add(idx));
          if (otherLine.type === 'H') isHorizontal = true;
          if (otherLine.type === 'V') isVertical = true;
          lineMerged[j] = true;
          queue.push(j);
        }
      }
    }

    groups.push({
      indices: Array.from(currentGroupIndices),
      color,
      isHorizontal,
      isVertical
    });
  }

  return groups;
};

export type SpecialEventType = 'BOMB' | 'STRIPED_H' | 'STRIPED_V' | 'RAINBOW' | 'COMBO_BOMB_BOMB' | 'COMBO_BOMB_STRIPED' | 'COMBO_RAINBOW';
export interface SpecialEvent {
    type: SpecialEventType;
    index: number;
}

// Handle Special Candy Combinations (Logic for when two special candies are swapped)
export interface SpecialComboResult {
  triggered: boolean;
  clearedIndices: number[];
  score: number;
  type: SpecialEventType | null;
  transformations?: { index: number; type: CandyType }[]; // For Bomb+Striped visual effect
}

export const resolveSpecialCombination = (board: Board, index1: number, index2: number): SpecialComboResult => {
  const c1 = board[index1];
  const c2 = board[index2];
  
  if (!c1 || !c2) return { triggered: false, clearedIndices: [], score: 0, type: null };

  const type1 = c1.type;
  const type2 = c2.type;

  const isRainbow1 = type1 === CandyType.Rainbow;
  const isRainbow2 = type2 === CandyType.Rainbow;
  
  const isBomb1 = type1 === CandyType.Bomb;
  const isBomb2 = type2 === CandyType.Bomb;
  const isStriped1 = type1 === CandyType.StripedHorizontal || type1 === CandyType.StripedVertical;
  const isStriped2 = type2 === CandyType.StripedHorizontal || type2 === CandyType.StripedVertical;

  const isNormal1 = type1 === CandyType.Normal;
  const isNormal2 = type2 === CandyType.Normal;

  // --- RAINBOW COMBOS ---

  // 1. Rainbow + Rainbow (Clear Board)
  if (isRainbow1 && isRainbow2) {
      const allIndices = Array.from({ length: TOTAL_CELLS }, (_, i) => i);
      return {
          triggered: true,
          clearedIndices: allIndices,
          score: SCORE_COMBO_RAINBOW_RAINBOW,
          type: 'RAINBOW'
      };
  }

  // 2. Rainbow + Special (Turn all matching color to Special & Explode)
  if ((isRainbow1 && (isBomb2 || isStriped2)) || (isRainbow2 && (isBomb1 || isStriped1))) {
      const rainbow = isRainbow1 ? c1 : c2;
      const special = isRainbow1 ? c2 : c1;
      const targetColor = special.color;
      const newType = special.type; // Propagate the type (Bomb or Striped)

      const clearedIndices = new Set<number>();
      const transformations: { index: number; type: CandyType }[] = [];
      
      clearedIndices.add(index1);
      clearedIndices.add(index2);

      for (let i = 0; i < TOTAL_CELLS; i++) {
          const candy = board[i];
          if (candy && candy.color === targetColor) {
              transformations.push({ index: i, type: newType });
              // Logic to clear based on the new type propagated
              clearedIndices.add(i);
              
              if (newType === CandyType.Bomb) {
                // Approximate bomb blast area for score calculation mostly, 
                // typically bomb combos trigger recursive explosions in `processMatches`
                // but here we just clear the source candy and let the game loop handle the "creation" then "destruction"
                // Actually, for simplicity in this engine, we mark them for clearing.
                // A better approach for visual flare is to let the transformations happen, then on next tick they explode?
                // But `resolveSpecialCombination` executes immediately.
                // We will add the 3x3 area for each converted bomb to the cleared set.
                const r = Math.floor(i / BOARD_WIDTH);
                const c = i % BOARD_WIDTH;
                for (let rr = r - 1; rr <= r + 1; rr++) {
                    for (let cc = c - 1; cc <= c + 1; cc++) {
                        if (rr >= 0 && rr < BOARD_WIDTH && cc >= 0 && cc < BOARD_WIDTH) {
                            clearedIndices.add(rr * BOARD_WIDTH + cc);
                        }
                    }
                }
              } else if (newType === CandyType.StripedHorizontal) {
                  const r = Math.floor(i / BOARD_WIDTH);
                  for(let c=0; c<BOARD_WIDTH; c++) clearedIndices.add(r*BOARD_WIDTH + c);
              } else if (newType === CandyType.StripedVertical) {
                  const c = i % BOARD_WIDTH;
                  for(let r=0; r<BOARD_WIDTH; r++) clearedIndices.add(r*BOARD_WIDTH + c);
              }
          }
      }

      return {
          triggered: true,
          clearedIndices: Array.from(clearedIndices),
          score: SCORE_COMBO_RAINBOW_SPECIAL,
          type: 'COMBO_RAINBOW',
          transformations
      };
  }

  // 3. Rainbow + Normal (Clear all of that color)
  if ((isRainbow1 && isNormal2) || (isRainbow2 && isNormal1)) {
      const targetColor = isRainbow1 ? c2.color : c1.color;
      const clearedIndices = new Set<number>();
      clearedIndices.add(index1);
      clearedIndices.add(index2);
      
      for(let i=0; i<TOTAL_CELLS; i++) {
          if (board[i]?.color === targetColor) {
              clearedIndices.add(i);
          }
      }

      return {
          triggered: true,
          clearedIndices: Array.from(clearedIndices),
          score: SCORE_COMBO_RAINBOW_NORMAL,
          type: 'RAINBOW'
      };
  }


  // --- EXISTING COMBOS ---

  // 4. Bomb + Bomb (Massive Board Clear)
  if (isBomb1 && isBomb2) {
     const allIndices = Array.from({ length: TOTAL_CELLS }, (_, i) => i);
     return {
       triggered: true,
       clearedIndices: allIndices, // Clears EVERYTHING
       score: SCORE_COMBO_BOMB_BOMB,
       type: 'COMBO_BOMB_BOMB'
     };
  }

  // 5. Bomb + Striped (Super Striped / Color Transform)
  if ((isBomb1 && isStriped2) || (isStriped1 && isBomb2)) {
     const targetCandy = isStriped2 ? c2 : c1;
     const targetColor = targetCandy.color;
     
     const transformations: { index: number; type: CandyType }[] = [];
     const clearedIndices = new Set<number>();
     
     // The original pair is always part of the clear
     clearedIndices.add(index1);
     clearedIndices.add(index2);
     
     // Also clear the row/col of the original striped candy to ensure it feels like a blast
     const sIdx = isStriped2 ? index2 : index1;
     const sRow = Math.floor(sIdx / BOARD_WIDTH);
     const sCol = sIdx % BOARD_WIDTH;
     for(let i=0; i<BOARD_WIDTH; i++) {
        clearedIndices.add(sRow * BOARD_WIDTH + i);
        clearedIndices.add(i * BOARD_WIDTH + sCol);
     }

     // Find all Normal candies of matching color to transform
     for(let i=0; i<TOTAL_CELLS; i++) {
         if (board[i]?.color === targetColor && board[i]?.type === CandyType.Normal) {
             const newType = Math.random() < 0.5 ? CandyType.StripedHorizontal : CandyType.StripedVertical;
             transformations.push({ index: i, type: newType });
             
             // Add the strip clear area for this transformed candy
             if (newType === CandyType.StripedHorizontal) {
                 const r = Math.floor(i / BOARD_WIDTH);
                 for (let c = 0; c < BOARD_WIDTH; c++) clearedIndices.add(r * BOARD_WIDTH + c);
             } else {
                 const c = i % BOARD_WIDTH;
                 for (let r = 0; r < BOARD_WIDTH; r++) clearedIndices.add(r * BOARD_WIDTH + c);
             }
         }
     }

     return {
         triggered: true,
         clearedIndices: Array.from(clearedIndices),
         // Base score + points per transformed candy
         score: SCORE_COMBO_BOMB_STRIPED + (transformations.length * SCORE_STRIPED),
         type: 'COMBO_BOMB_STRIPED',
         transformations
     };
  }

  // 6. Striped + Striped (Cross Clear)
  if (isStriped1 && isStriped2) {
      const row = Math.floor(index2 / BOARD_WIDTH);
      const col = index2 % BOARD_WIDTH;
      const indices = new Set<number>();

      // Entire Row
      for(let c=0; c<BOARD_WIDTH; c++) indices.add(row * BOARD_WIDTH + c);
      // Entire Col
      for(let r=0; r<BOARD_WIDTH; r++) indices.add(r * BOARD_WIDTH + col);

      return {
          triggered: true,
          clearedIndices: Array.from(indices),
          score: SCORE_COMBO_STRIPED_STRIPED,
          type: 'STRIPED_H' // Reusing generic striped visual
      };
  }

  return { triggered: false, clearedIndices: [], score: 0, type: null };
};

// Main processing function
export const processMatches = (
  currentBoard: Board, 
  swapIndices: number[] | null = null 
): { board: Board; scoreDelta: number; clearedCandies: Candy[]; specialEvents: SpecialEvent[] } => {
  
  const newBoard = [...currentBoard];
  const matchGroups = findMatchGroups(newBoard);
  
  const markedForRemoval = new Set<number>();
  let scoreDelta = 0;
  const specialCandiesToCreate: { index: number; candy: Candy }[] = [];
  const specialEvents: SpecialEvent[] = [];

  // 1. Analyze Groups for Special Candy Creation
  matchGroups.forEach(group => {
    const count = group.indices.length;
    let specialType: CandyType | null = null;
    let specialColor = group.color;

    // Creation Logic Priority
    if (count >= 5) {
        if (group.isHorizontal && group.isVertical) {
             // L or T shape -> Bomb
             specialType = CandyType.Bomb;
        } else {
             // 5 in a row -> Rainbow
             specialType = CandyType.Rainbow;
             specialColor = CandyColor.Multi;
        }
    } else if (group.isHorizontal && group.isVertical) {
        // 3x3 or other intersection -> Bomb
        specialType = CandyType.Bomb; 
    } else if (count === 4) {
        specialType = group.isHorizontal ? CandyType.StripedVertical : CandyType.StripedHorizontal;
    }

    if (specialType) {
      scoreDelta += 100; 
      
      let targetIndex = group.indices[Math.floor(group.indices.length / 2)];
      
      if (swapIndices) {
        const swapIntersect = group.indices.find(idx => swapIndices.includes(idx));
        if (swapIntersect !== undefined) targetIndex = swapIntersect;
      }

      specialCandiesToCreate.push({
        index: targetIndex,
        candy: {
            id: Math.random().toString(36).substr(2, 9),
            color: specialColor,
            type: specialType,
            isNew: true
        }
      });
    }

    group.indices.forEach(idx => markedForRemoval.add(idx));
    scoreDelta += (count * 10);
  });

  // 2. Recursive Explosion Logic
  const processingQueue = Array.from(markedForRemoval);
  const processedForExplosion = new Set<number>();

  while (processingQueue.length > 0) {
    const index = processingQueue.shift()!;
    if (processedForExplosion.has(index)) continue;
    processedForExplosion.add(index);

    const candy = newBoard[index];
    if (!candy) continue;

    if (candy.type !== CandyType.Normal) {
      // Rainbow candies destroyed by matches (rare, usually by other bombs) trigger massive clear?
      // Standard match logic destroys them, but if they are caught in a blast, they should prob just give points or trigger random?
      // For simplicity, if a Rainbow is destroyed by a nearby blast, it just awards points. 
      // Real mechanic might trigger it, but that causes infinite loops easily without careful checking.
      
      scoreDelta += 60;
      let affectedIndices: number[] = [];
      
      // Record Event
      if (candy.type === CandyType.Bomb) {
          specialEvents.push({ type: 'BOMB', index });
      } else if (candy.type === CandyType.StripedHorizontal) {
          specialEvents.push({ type: 'STRIPED_H', index });
      } else if (candy.type === CandyType.StripedVertical) {
          specialEvents.push({ type: 'STRIPED_V', index });
      } else if (candy.type === CandyType.Rainbow) {
          specialEvents.push({ type: 'RAINBOW', index });
          scoreDelta += SCORE_RAINBOW;
      }

      if (candy.type === CandyType.StripedHorizontal) {
        const row = Math.floor(index / BOARD_WIDTH);
        for (let c = 0; c < BOARD_WIDTH; c++) affectedIndices.push(row * BOARD_WIDTH + c);
      } else if (candy.type === CandyType.StripedVertical) {
        const col = index % BOARD_WIDTH;
        for (let r = 0; r < BOARD_WIDTH; r++) affectedIndices.push(r * BOARD_WIDTH + col);
      } else if (candy.type === CandyType.Bomb) {
        const row = Math.floor(index / BOARD_WIDTH);
        const col = index % BOARD_WIDTH;
        for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
                if (r >= 0 && r < BOARD_WIDTH && c >= 0 && c < BOARD_WIDTH) {
                    affectedIndices.push(r * BOARD_WIDTH + c);
                }
            }
        }
      }

      affectedIndices.forEach(idx => {
        if (!markedForRemoval.has(idx)) {
          markedForRemoval.add(idx);
          processingQueue.push(idx);
        }
      });
    }
  }

  // 3. Apply Removal & Track Cleared
  const clearedCandies: Candy[] = [];
  markedForRemoval.forEach(idx => {
    if (newBoard[idx]) {
        clearedCandies.push(newBoard[idx]!);
    }
    newBoard[idx] = null;
  });

  // 4. Place Created Special Candies
  specialCandiesToCreate.forEach(({ index, candy }) => {
    newBoard[index] = candy;
  });

  return { board: newBoard, scoreDelta, clearedCandies, specialEvents };
};

export const moveCandiesDown = (board: Board): { board: Board; movesHappened: boolean } => {
  // Clear ephemeral flags to prevent repeat animations on stationary candies
  const newBoard: Board = board.map(c => c ? { ...c, isNew: false, isSettling: false } : null);
  let movesHappened = false;

  for (let col = 0; col < BOARD_WIDTH; col++) {
    let emptySlots = 0;
    for (let row = BOARD_WIDTH - 1; row >= 0; row--) {
      const index = row * BOARD_WIDTH + col;
      if (newBoard[index] === null) {
        emptySlots++;
      } else if (emptySlots > 0) {
        const targetIndex = (row + emptySlots) * BOARD_WIDTH + col;
        // Move candy and mark as settling for animation
        newBoard[targetIndex] = { ...newBoard[index]!, isSettling: true };
        newBoard[index] = null;
        movesHappened = true;
      }
    }
    for (let row = 0; row < emptySlots; row++) {
      const index = row * BOARD_WIDTH + col;
      newBoard[index] = generateRandomCandy();
      movesHappened = true;
    }
  }

  return { board: newBoard, movesHappened };
};

export const hasValidMoves = (board: Board): boolean => {
  for (let i = 0; i < TOTAL_CELLS; i++) {
    const c = board[i];
    if (!c) continue;

    // Rainbow always has a valid move if there's an adjacent candy
    if (c.type === CandyType.Rainbow) return true;

    // Check Right Swap
    if ((i + 1) % BOARD_WIDTH !== 0 && board[i + 1]) {
      const cRight = board[i+1];
      if (cRight && cRight.type === CandyType.Rainbow) return true;

      const tempBoard = [...board];
      [tempBoard[i], tempBoard[i+1]] = [tempBoard[i+1], tempBoard[i]];
      if (findMatches(tempBoard).length > 0) return true;
    }

    // Check Down Swap
    if (i + BOARD_WIDTH < TOTAL_CELLS && board[i + BOARD_WIDTH]) {
      const cDown = board[i + BOARD_WIDTH];
      if (cDown && cDown.type === CandyType.Rainbow) return true;

      const tempBoard = [...board];
      [tempBoard[i], tempBoard[i + BOARD_WIDTH]] = [tempBoard[i + BOARD_WIDTH], tempBoard[i]];
      if (findMatches(tempBoard).length > 0) return true;
    }
  }
  return false;
};

export const shuffleBoard = (board: Board): Board => {
    const candies = board.filter((c): c is Candy => c !== null);
    // Fisher-Yates Shuffle
    for (let i = candies.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candies[i], candies[j]] = [candies[j], candies[i]];
    }
    
    const newBoard: Board = [...board];
    let candyIdx = 0;
    for(let i=0; i<newBoard.length; i++) {
        if (newBoard[i] !== null) {
            // Re-assign shuffled candies, adding 'isNew' to trigger bounce-in animation
            const candy = candies[candyIdx];
            if (candy) {
                newBoard[i] = { ...candy, isNew: true, isSettling: false };
            }
            candyIdx++;
        }
    }
    return newBoard;
};
