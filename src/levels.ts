import { LevelConfig } from './types';

export const LEVELS: LevelConfig[] = Array.from({ length: 15 }, (_, i) => {
    const id = i + 1;
    // Difficulty curve
    const moves = Math.max(10, 30 - i); 
    const targetScore = 1000 + (i * 1500);
    const colors = i < 2 ? 4 : i < 6 ? 5 : 6;
    
    return {
        id,
        rows: 9,
        cols: 9,
        moves,
        targetScore,
        colors
    };
});