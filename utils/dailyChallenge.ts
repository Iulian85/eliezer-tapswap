import { LevelConfig, GoalType, CandyColor, LevelGoal } from '../types';
import { CANDY_COLORS } from '../constants';

// Simple Linear Congruential Generator for seeded randomness
class SeededRandom {
  seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  
  // Returns number between 0 and 1
  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  
  // Returns integer between min and max (inclusive)
  nextRange(min: number, max: number) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

export const getTodayDateString = (): string => {
  const date = new Date();
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

export const generateDailyLevel = (): LevelConfig => {
  const dateStr = getTodayDateString();
  
  // Generate seed from date string sum
  const seed = dateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rng = new SeededRandom(seed);

  const moves = rng.nextRange(25, 45);
  const timeLimit = rng.nextRange(90, 200);
  const numGoals = rng.nextRange(2, 3);
  
  const goals: LevelGoal[] = [];
  const goalTypes: GoalType[] = ['SCORE', 'COLLECT'];
  
  // Ensure at least one Score goal
  const scoreTarget = rng.nextRange(2000, 6000);
  goals.push({
    id: 'daily_score',
    type: 'SCORE',
    target: scoreTarget,
    description: `Score ${scoreTarget} pts`
  });

  // Additional goals
  for (let i = 1; i < numGoals; i++) {
    const type = goalTypes[rng.nextRange(0, 1)]; // 0 or 1
    
    if (type === 'SCORE') {
        // Already have score, maybe skip or add secondary check? 
        // Let's force collect for variety if we already have score
        const color = CANDY_COLORS[rng.nextRange(0, CANDY_COLORS.length - 1)];
        const amount = rng.nextRange(10, 25);
        goals.push({
            id: `daily_g_${i}`,
            type: 'COLLECT',
            target: amount,
            targetColor: color,
            description: `Collect ${amount} ${color.charAt(0).toUpperCase() + color.slice(1).toLowerCase()}`
        });
    } else {
        const color = CANDY_COLORS[rng.nextRange(0, CANDY_COLORS.length - 1)];
        const amount = rng.nextRange(15, 30);
        // Check if we already have this color to avoid duplicates
        const exists = goals.some(g => g.type === 'COLLECT' && g.targetColor === color);
        
        if (!exists) {
            goals.push({
                id: `daily_g_${i}`,
                type: 'COLLECT',
                target: amount,
                targetColor: color,
                description: `Collect ${amount} ${color.charAt(0).toUpperCase() + color.slice(1).toLowerCase()}`
            });
        } else {
            // Fallback to simple score add-on or just skip
            goals[0].target += 1000;
            goals[0].description = `Score ${goals[0].target} pts`;
        }
    }
  }

  return {
    levelNumber: 'Daily',
    moves,
    timeLimit,
    goals
  };
};