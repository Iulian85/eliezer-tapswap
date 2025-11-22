
import { CandyColor, LevelConfig, CandyType } from './types';

export const BOARD_SIZE = 8;
export const BOARD_WIDTH = 8;
export const TOTAL_CELLS = BOARD_SIZE * BOARD_WIDTH;

export const CANDY_COLORS = [
  CandyColor.Red,
  CandyColor.Blue,
  CandyColor.Green,
  CandyColor.Yellow,
  CandyColor.Purple,
  CandyColor.Orange,
];

// Visual mapping
export const COLOR_STYLES: Record<CandyColor, string> = {
  [CandyColor.Red]: 'bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/50',
  [CandyColor.Blue]: 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/50',
  [CandyColor.Green]: 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/50',
  [CandyColor.Yellow]: 'bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-yellow-500/50',
  [CandyColor.Purple]: 'bg-gradient-to-br from-purple-400 to-purple-600 shadow-purple-500/50',
  [CandyColor.Orange]: 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-orange-500/50',
  [CandyColor.Multi]: 'bg-gray-800 shadow-white/20 border border-white/20', // Dark background for Rainbow to pop
};

export const SCORE_PER_CANDY = 10;
export const SCORE_STRIPED = 60;
export const SCORE_BOMB = 200;
export const SCORE_RAINBOW = 500;
export const SCORE_CREATE_SPECIAL = 100;

// New Combo Scores
export const SCORE_COMBO_STRIPED_STRIPED = 500;
export const SCORE_COMBO_BOMB_STRIPED = 1500;
export const SCORE_COMBO_BOMB_BOMB = 5000;
export const SCORE_COMBO_RAINBOW_NORMAL = 2000;
export const SCORE_COMBO_RAINBOW_SPECIAL = 3500;
export const SCORE_COMBO_RAINBOW_RAINBOW = 10000;

export const SHOP_PRICES = {
  BOMB: 150,
  EXTRA_MOVES: 100,
  SHUFFLE: 50
};

export const LEVELS: LevelConfig[] = [
  {
    levelNumber: 1,
    moves: 15,
    timeLimit: 60,
    goals: [
      { id: 'l1g1', type: 'SCORE', target: 1000, description: 'Score 1,000 Points' }
    ]
  },
  {
    levelNumber: 2,
    moves: 20,
    timeLimit: 90,
    goals: [
      { id: 'l2g1', type: 'COLLECT', target: 12, targetColor: CandyColor.Red, description: 'Collect 12 Red Candies' }
    ]
  },
  {
    levelNumber: 3,
    moves: 25,
    timeLimit: 120,
    goals: [
       { id: 'l3g1', type: 'COLLECT', target: 10, targetColor: CandyColor.Blue, description: 'Collect 10 Blue' },
       { id: 'l3g2', type: 'COLLECT', target: 10, targetColor: CandyColor.Green, description: 'Collect 10 Green' }
    ]
  },
  {
    levelNumber: 4,
    moves: 30,
    timeLimit: 150,
    goals: [
       { id: 'l4g1', type: 'SCORE', target: 3000, description: 'Score 3,000' },
       { id: 'l4g2', type: 'COLLECT', target: 3, targetCandyType: CandyType.Bomb, description: 'Collect 3 Bombs' }
    ]
  },
  {
    levelNumber: 5,
    moves: 35,
    timeLimit: 180,
    goals: [
       { id: 'l5g1', type: 'COLLECT', target: 20, targetColor: CandyColor.Yellow, description: 'Collect 20 Yellow' },
       { id: 'l5g2', type: 'COLLECT', target: 5, targetCandyType: 'STRIPED_ANY', description: 'Collect 5 Striped Candies' },
       { id: 'l5g3', type: 'SCORE', target: 5000, description: 'Score 5,000' }
    ]
  },
  {
    levelNumber: 6,
    moves: 25,
    timeLimit: 140,
    goals: [
       { id: 'l6g1', type: 'SCORE', target: 8000, description: 'Score 8,000' },
       { id: 'l6g2', type: 'COLLECT', target: 30, targetColor: CandyColor.Purple, description: 'Collect 30 Purple' }
    ]
  },
  {
    levelNumber: 7,
    moves: 30,
    timeLimit: 160,
    goals: [
       { id: 'l7g1', type: 'COLLECT', target: 4, targetCandyType: CandyType.StripedVertical, description: 'Collect 4 V-Stripes' },
       { id: 'l7g2', type: 'COLLECT', target: 25, targetColor: CandyColor.Orange, description: 'Collect 25 Orange' }
    ]
  },
  {
    levelNumber: 8,
    moves: 35,
    timeLimit: 180,
    goals: [
       { id: 'l8g1', type: 'SCORE', target: 12000, description: 'Score 12,000' },
       { id: 'l8g2', type: 'COLLECT', target: 5, targetCandyType: CandyType.Bomb, description: 'Collect 5 Bombs' },
       { id: 'l8g3', type: 'COLLECT', target: 10, targetColor: CandyColor.Green, description: 'Collect 10 Green' }
    ]
  },
  {
    levelNumber: 9,
    moves: 30,
    timeLimit: 170,
    goals: [
       { id: 'l9g1', type: 'COLLECT', target: 25, targetColor: CandyColor.Red, description: 'Collect 25 Red' },
       { id: 'l9g2', type: 'COLLECT', target: 25, targetColor: CandyColor.Blue, description: 'Collect 25 Blue' },
       { id: 'l9g3', type: 'COLLECT', target: 3, targetCandyType: CandyType.StripedHorizontal, description: 'Collect 3 H-Stripes' }
    ]
  },
  {
    levelNumber: 10,
    moves: 45,
    timeLimit: 210,
    goals: [
       { id: 'l10g1', type: 'SCORE', target: 20000, description: 'Score 20,000' },
       { id: 'l10g2', type: 'COLLECT', target: 6, targetCandyType: CandyType.Bomb, description: 'Collect 6 Bombs' },
       { id: 'l10g3', type: 'COLLECT', target: 6, targetCandyType: CandyType.StripedVertical, description: 'Collect 6 V-Stripes' }
    ]
  },
  {
    levelNumber: 11,
    moves: 30,
    timeLimit: 160,
    goals: [
       { id: 'l11g1', type: 'SCORE', target: 25000, description: 'Score 25,000' },
       { id: 'l11g2', type: 'COLLECT', target: 5, targetCandyType: CandyType.StripedHorizontal, description: 'Collect 5 H-Stripes' },
       { id: 'l11g3', type: 'COLLECT', target: 5, targetCandyType: CandyType.StripedVertical, description: 'Collect 5 V-Stripes' }
    ]
  },
  {
    levelNumber: 12,
    moves: 40,
    timeLimit: 200,
    goals: [
       { id: 'l12g1', type: 'COLLECT', target: 40, targetColor: CandyColor.Red, description: 'Collect 40 Red' },
       { id: 'l12g2', type: 'COLLECT', target: 40, targetColor: CandyColor.Blue, description: 'Collect 40 Blue' },
       { id: 'l12g3', type: 'COLLECT', target: 40, targetColor: CandyColor.Green, description: 'Collect 40 Green' }
    ]
  },
  {
    levelNumber: 13,
    moves: 35,
    timeLimit: 180,
    goals: [
       { id: 'l13g1', type: 'SCORE', target: 35000, description: 'Score 35,000' },
       { id: 'l13g2', type: 'COLLECT', target: 8, targetCandyType: CandyType.Bomb, description: 'Collect 8 Bombs' }
    ]
  },
  {
    levelNumber: 14,
    moves: 25,
    timeLimit: 130,
    goals: [
       { id: 'l14g1', type: 'COLLECT', target: 6, targetCandyType: CandyType.StripedHorizontal, description: 'Collect 6 H-Stripes' },
       { id: 'l14g2', type: 'COLLECT', target: 25, targetColor: CandyColor.Yellow, description: 'Collect 25 Yellow' },
       { id: 'l14g3', type: 'SCORE', target: 15000, description: 'Score 15,000' }
    ]
  },
  {
    levelNumber: 15,
    moves: 50,
    timeLimit: 240,
    goals: [
       { id: 'l15g1', type: 'SCORE', target: 50000, description: 'Score 50,000' },
       { id: 'l15g2', type: 'COLLECT', target: 10, targetCandyType: CandyType.Bomb, description: 'Collect 10 Bombs' },
       { id: 'l15g3', type: 'COLLECT', target: 50, targetColor: CandyColor.Purple, description: 'Collect 50 Purple' }
    ]
  },
  {
    levelNumber: 16,
    moves: 35,
    timeLimit: 180,
    goals: [
       { id: 'l16g1', type: 'SCORE', target: 40000, description: 'Score 40,000' },
       { id: 'l16g2', type: 'COLLECT', target: 35, targetColor: CandyColor.Red, description: 'Collect 35 Red' },
       { id: 'l16g3', type: 'COLLECT', target: 35, targetColor: CandyColor.Green, description: 'Collect 35 Green' }
    ]
  },
  {
    levelNumber: 17,
    moves: 30,
    timeLimit: 160,
    goals: [
       { id: 'l17g1', type: 'COLLECT', target: 5, targetCandyType: CandyType.StripedHorizontal, description: 'Collect 5 H-Stripes' },
       { id: 'l17g2', type: 'COLLECT', target: 5, targetCandyType: CandyType.StripedVertical, description: 'Collect 5 V-Stripes' },
       { id: 'l17g3', type: 'SCORE', target: 25000, description: 'Score 25,000' }
    ]
  },
  {
    levelNumber: 18,
    moves: 40,
    timeLimit: 200,
    goals: [
       { id: 'l18g1', type: 'SCORE', target: 60000, description: 'Score 60,000' },
       { id: 'l18g2', type: 'COLLECT', target: 6, targetCandyType: CandyType.Bomb, description: 'Collect 6 Bombs' },
       { id: 'l18g3', type: 'COLLECT', target: 20, targetColor: CandyColor.Blue, description: 'Collect 20 Blue' }
    ]
  },
  {
    levelNumber: 19,
    moves: 45,
    timeLimit: 220,
    goals: [
       { id: 'l19g1', type: 'COLLECT', target: 40, targetColor: CandyColor.Yellow, description: 'Collect 40 Yellow' },
       { id: 'l19g2', type: 'COLLECT', target: 40, targetColor: CandyColor.Orange, description: 'Collect 40 Orange' },
       { id: 'l19g3', type: 'COLLECT', target: 6, targetCandyType: CandyType.StripedHorizontal, description: 'Collect 6 H-Stripes' }
    ]
  },
  {
    levelNumber: 20,
    moves: 50,
    timeLimit: 250,
    goals: [
       { id: 'l20g1', type: 'SCORE', target: 100000, description: 'Score 100,000' },
       { id: 'l20g2', type: 'COLLECT', target: 10, targetCandyType: CandyType.Bomb, description: 'Collect 10 Bombs' },
       { id: 'l20g3', type: 'COLLECT', target: 10, targetCandyType: CandyType.StripedVertical, description: 'Collect 10 V-Stripes' }
    ]
  },
  {
    levelNumber: 21,
    moves: 35,
    timeLimit: 180,
    goals: [
       { id: 'l21g1', type: 'COLLECT', target: 50, targetColor: CandyColor.Purple, description: 'Collect 50 Purple' },
       { id: 'l21g2', type: 'COLLECT', target: 50, targetColor: CandyColor.Orange, description: 'Collect 50 Orange' },
       { id: 'l21g3', type: 'COLLECT', target: 4, targetCandyType: CandyType.StripedHorizontal, description: 'Collect 4 H-Stripes' }
    ]
  },
  {
    levelNumber: 22,
    moves: 40,
    timeLimit: 200,
    goals: [
       { id: 'l22g1', type: 'SCORE', target: 120000, description: 'Score 120,000' },
       { id: 'l22g2', type: 'COLLECT', target: 12, targetCandyType: CandyType.Bomb, description: 'Collect 12 Bombs' }
    ]
  },
  {
    levelNumber: 23,
    moves: 45,
    timeLimit: 220,
    goals: [
       { id: 'l23g1', type: 'COLLECT', target: 8, targetCandyType: CandyType.StripedHorizontal, description: 'Collect 8 H-Stripes' },
       { id: 'l23g2', type: 'COLLECT', target: 8, targetCandyType: CandyType.StripedVertical, description: 'Collect 8 V-Stripes' },
       { id: 'l23g3', type: 'COLLECT', target: 40, targetColor: CandyColor.Red, description: 'Collect 40 Red' }
    ]
  },
  {
    levelNumber: 24,
    moves: 30,
    timeLimit: 160,
    goals: [
       { id: 'l24g1', type: 'SCORE', target: 150000, description: 'Score 150,000' },
       { id: 'l24g2', type: 'COLLECT', target: 60, targetColor: CandyColor.Blue, description: 'Collect 60 Blue' },
       { id: 'l24g3', type: 'COLLECT', target: 60, targetColor: CandyColor.Green, description: 'Collect 60 Green' }
    ]
  },
  {
    levelNumber: 25,
    moves: 55,
    timeLimit: 300,
    goals: [
       { id: 'l25g1', type: 'SCORE', target: 200000, description: 'Score 200,000' },
       { id: 'l25g2', type: 'COLLECT', target: 15, targetCandyType: CandyType.Bomb, description: 'Collect 15 Bombs' },
       { id: 'l25g3', type: 'COLLECT', target: 100, targetColor: CandyColor.Yellow, description: 'Collect 100 Yellow' }
    ]
  },
  {
    levelNumber: 26,
    moves: 35,
    timeLimit: 190,
    goals: [
       { id: 'l26g1', type: 'SCORE', target: 80000, description: 'Score 80,000' },
       { id: 'l26g2', type: 'COLLECT', target: 45, targetColor: CandyColor.Red, description: 'Collect 45 Red' },
       { id: 'l26g3', type: 'COLLECT', target: 45, targetColor: CandyColor.Green, description: 'Collect 45 Green' }
    ]
  },
  {
    levelNumber: 27,
    moves: 40,
    timeLimit: 210,
    goals: [
       { id: 'l27g1', type: 'COLLECT', target: 10, targetCandyType: CandyType.StripedHorizontal, description: 'Collect 10 H-Stripes' },
       { id: 'l27g2', type: 'COLLECT', target: 10, targetCandyType: CandyType.StripedVertical, description: 'Collect 10 V-Stripes' },
       { id: 'l27g3', type: 'SCORE', target: 100000, description: 'Score 100,000' }
    ]
  },
  {
    levelNumber: 28,
    moves: 45,
    timeLimit: 230,
    goals: [
       { id: 'l28g1', type: 'COLLECT', target: 12, targetCandyType: CandyType.Bomb, description: 'Collect 12 Bombs' },
       { id: 'l28g2', type: 'COLLECT', target: 50, targetColor: CandyColor.Purple, description: 'Collect 50 Purple' },
       { id: 'l28g3', type: 'SCORE', target: 150000, description: 'Score 150,000' }
    ]
  },
  {
    levelNumber: 29,
    moves: 50,
    timeLimit: 260,
    goals: [
       { id: 'l29g1', type: 'COLLECT', target: 60, targetColor: CandyColor.Blue, description: 'Collect 60 Blue' },
       { id: 'l29g2', type: 'COLLECT', target: 60, targetColor: CandyColor.Orange, description: 'Collect 60 Orange' },
       { id: 'l29g3', type: 'COLLECT', target: 60, targetColor: CandyColor.Yellow, description: 'Collect 60 Yellow' }
    ]
  },
  {
    levelNumber: 30,
    moves: 60,
    timeLimit: 320,
    goals: [
       { id: 'l30g1', type: 'SCORE', target: 250000, description: 'Score 250,000' },
       { id: 'l30g2', type: 'COLLECT', target: 15, targetCandyType: CandyType.StripedHorizontal, description: 'Collect 15 H-Stripes' },
       { id: 'l30g3', type: 'COLLECT', target: 15, targetCandyType: CandyType.Bomb, description: 'Collect 15 Bombs' }
    ]
  },
  {
    levelNumber: 31,
    moves: 40,
    timeLimit: 200,
    goals: [
       { id: 'l31g1', type: 'SCORE', target: 180000, description: 'Score 180,000' },
       { id: 'l31g2', type: 'COLLECT', target: 50, targetColor: CandyColor.Red, description: 'Collect 50 Red' },
       { id: 'l31g3', type: 'COLLECT', target: 8, targetCandyType: CandyType.StripedVertical, description: 'Collect 8 V-Stripes' }
    ]
  },
  {
    levelNumber: 32,
    moves: 45,
    timeLimit: 240,
    goals: [
       { id: 'l32g1', type: 'COLLECT', target: 12, targetCandyType: CandyType.Bomb, description: 'Collect 12 Bombs' },
       { id: 'l32g2', type: 'COLLECT', target: 60, targetColor: CandyColor.Green, description: 'Collect 60 Green' },
       { id: 'l32g3', type: 'SCORE', target: 220000, description: 'Score 220,000' }
    ]
  },
  {
    levelNumber: 33,
    moves: 50,
    timeLimit: 260,
    goals: [
       { id: 'l33g1', type: 'COLLECT', target: 15, targetCandyType: CandyType.StripedHorizontal, description: 'Collect 15 H-Stripes' },
       { id: 'l33g2', type: 'COLLECT', target: 15, targetCandyType: CandyType.StripedVertical, description: 'Collect 15 V-Stripes' },
       { id: 'l33g3', type: 'COLLECT', target: 70, targetColor: CandyColor.Yellow, description: 'Collect 70 Yellow' }
    ]
  },
  {
    levelNumber: 34,
    moves: 55,
    timeLimit: 280,
    goals: [
       { id: 'l34g1', type: 'SCORE', target: 300000, description: 'Score 300,000' },
       { id: 'l34g2', type: 'COLLECT', target: 10, targetCandyType: CandyType.Bomb, description: 'Collect 10 Bombs' },
       { id: 'l34g3', type: 'COLLECT', target: 10, targetCandyType: CandyType.StripedHorizontal, description: 'Collect 10 H-Stripes' }
    ]
  },
  {
    levelNumber: 35,
    moves: 60,
    timeLimit: 330,
    goals: [
       { id: 'l35g1', type: 'SCORE', target: 400000, description: 'Score 400,000' },
       { id: 'l35g2', type: 'COLLECT', target: 20, targetCandyType: CandyType.Bomb, description: 'Collect 20 Bombs' },
       { id: 'l35g3', type: 'COLLECT', target: 100, targetColor: CandyColor.Purple, description: 'Collect 100 Purple' }
    ]
  },
  {
    levelNumber: 36,
    moves: 45,
    timeLimit: 250,
    goals: [
       { id: 'l36g1', type: 'SCORE', target: 200000, description: 'Score 200,000' },
       { id: 'l36g2', type: 'COLLECT', target: 80, targetColor: CandyColor.Red, description: 'Collect 80 Red' },
       { id: 'l36g3', type: 'COLLECT', target: 10, targetCandyType: CandyType.StripedVertical, description: 'Collect 10 V-Stripes' }
    ]
  },
  {
    levelNumber: 37,
    moves: 50,
    timeLimit: 280,
    goals: [
       { id: 'l37g1', type: 'COLLECT', target: 20, targetCandyType: CandyType.StripedHorizontal, description: 'Collect 20 H-Stripes' },
       { id: 'l37g2', type: 'COLLECT', target: 12, targetCandyType: CandyType.Bomb, description: 'Collect 12 Bombs' },
       { id: 'l37g3', type: 'SCORE', target: 250000, description: 'Score 250,000' }
    ]
  },
  {
    levelNumber: 38,
    moves: 55,
    timeLimit: 300,
    goals: [
       { id: 'l38g1', type: 'SCORE', target: 500000, description: 'Score 500,000' },
       { id: 'l38g2', type: 'COLLECT', target: 50, targetColor: CandyColor.Yellow, description: 'Collect 50 Yellow' },
       { id: 'l38g3', type: 'COLLECT', target: 50, targetColor: CandyColor.Green, description: 'Collect 50 Green' }
    ]
  },
  {
    levelNumber: 39,
    moves: 60,
    timeLimit: 320,
    goals: [
       { id: 'l39g1', type: 'COLLECT', target: 15, targetCandyType: CandyType.Bomb, description: 'Collect 15 Bombs' },
       { id: 'l39g2', type: 'COLLECT', target: 15, targetCandyType: CandyType.StripedHorizontal, description: 'Collect 15 H-Stripes' },
       { id: 'l39g3', type: 'COLLECT', target: 15, targetCandyType: CandyType.StripedVertical, description: 'Collect 15 V-Stripes' }
    ]
  },
  {
    levelNumber: 40,
    moves: 65,
    timeLimit: 360,
    goals: [
       { id: 'l40g1', type: 'SCORE', target: 750000, description: 'Score 750,000' },
       { id: 'l40g2', type: 'COLLECT', target: 25, targetCandyType: CandyType.Bomb, description: 'Collect 25 Bombs' },
       { id: 'l40g3', type: 'COLLECT', target: 120, targetColor: CandyColor.Red, description: 'Collect 120 Red' }
    ]
  },
  {
    levelNumber: 41,
    moves: 45,
    timeLimit: 260,
    goals: [
       { id: 'l41g1', type: 'COLLECT', target: 100, targetColor: CandyColor.Blue, description: 'Collect 100 Blue' },
       { id: 'l41g2', type: 'COLLECT', target: 100, targetColor: CandyColor.Green, description: 'Collect 100 Green' },
       { id: 'l41g3', type: 'SCORE', target: 300000, description: 'Score 300,000' }
    ]
  },
  {
    levelNumber: 42,
    moves: 50,
    timeLimit: 280,
    goals: [
       { id: 'l42g1', type: 'COLLECT', target: 15, targetCandyType: CandyType.StripedHorizontal, description: 'Collect 15 H-Stripes' },
       { id: 'l42g2', type: 'COLLECT', target: 15, targetCandyType: CandyType.StripedVertical, description: 'Collect 15 V-Stripes' },
       { id: 'l42g3', type: 'SCORE', target: 350000, description: 'Score 350,000' }
    ]
  },
  {
    levelNumber: 43,
    moves: 55,
    timeLimit: 300,
    goals: [
       { id: 'l43g1', type: 'COLLECT', target: 20, targetCandyType: CandyType.Bomb, description: 'Collect 20 Bombs' },
       { id: 'l43g2', type: 'COLLECT', target: 80, targetColor: CandyColor.Purple, description: 'Collect 80 Purple' },
       { id: 'l43g3', type: 'COLLECT', target: 80, targetColor: CandyColor.Orange, description: 'Collect 80 Orange' }
    ]
  },
  {
    levelNumber: 44,
    moves: 40,
    timeLimit: 240,
    goals: [
       { id: 'l44g1', type: 'SCORE', target: 500000, description: 'Score 500,000' },
       { id: 'l44g2', type: 'COLLECT', target: 12, targetCandyType: CandyType.Bomb, description: 'Collect 12 Bombs' },
       { id: 'l44g3', type: 'COLLECT', target: 12, targetCandyType: CandyType.StripedHorizontal, description: 'Collect 12 H-Stripes' }
    ]
  },
  {
    levelNumber: 45,
    moves: 70,
    timeLimit: 400,
    goals: [
       { id: 'l45g1', type: 'SCORE', target: 1000000, description: 'Score 1,000,000' },
       { id: 'l45g2', type: 'COLLECT', target: 30, targetCandyType: CandyType.Bomb, description: 'Collect 30 Bombs' },
       { id: 'l45g3', type: 'COLLECT', target: 150, targetColor: CandyColor.Yellow, description: 'Collect 150 Yellow' }
    ]
  },
  {
    levelNumber: 46,
    moves: 50,
    timeLimit: 280,
    goals: [
       { id: 'l46g1', type: 'COLLECT', target: 100, targetColor: CandyColor.Red, description: 'Collect 100 Red' },
       { id: 'l46g2', type: 'COLLECT', target: 100, targetColor: CandyColor.Blue, description: 'Collect 100 Blue' },
       { id: 'l46g3', type: 'COLLECT', target: 100, targetColor: CandyColor.Green, description: 'Collect 100 Green' }
    ]
  },
  {
    levelNumber: 47,
    moves: 40,
    timeLimit: 240,
    goals: [
       { id: 'l47g1', type: 'COLLECT', target: 12, targetCandyType: CandyType.StripedHorizontal, description: 'Collect 12 H-Stripes' },
       { id: 'l47g2', type: 'COLLECT', target: 12, targetCandyType: CandyType.StripedVertical, description: 'Collect 12 V-Stripes' },
       { id: 'l47g3', type: 'SCORE', target: 400000, description: 'Score 400,000' }
    ]
  },
  {
    levelNumber: 48,
    moves: 45,
    timeLimit: 260,
    goals: [
       { id: 'l48g1', type: 'COLLECT', target: 20, targetCandyType: CandyType.Bomb, description: 'Collect 20 Bombs' },
       { id: 'l48g2', type: 'SCORE', target: 600000, description: 'Score 600,000' }
    ]
  },
  {
    levelNumber: 49,
    moves: 55,
    timeLimit: 300,
    goals: [
       { id: 'l49g1', type: 'COLLECT', target: 150, targetColor: CandyColor.Purple, description: 'Collect 150 Purple' },
       { id: 'l49g2', type: 'COLLECT', target: 15, targetCandyType: CandyType.Bomb, description: 'Collect 15 Bombs' },
       { id: 'l49g3', type: 'SCORE', target: 500000, description: 'Score 500,000' }
    ]
  },
  {
    levelNumber: 50,
    moves: 65,
    timeLimit: 400,
    goals: [
       { id: 'l50g1', type: 'SCORE', target: 1500000, description: 'Score 1,500,000' },
       { id: 'l50g2', type: 'COLLECT', target: 30, targetCandyType: CandyType.Bomb, description: 'Collect 30 Bombs' },
       { id: 'l50g3', type: 'COLLECT', target: 30, targetCandyType: CandyType.StripedHorizontal, description: 'Collect 30 H-Stripes' }
    ]
  },
  {
    levelNumber: 51,
    moves: 50,
    timeLimit: 280,
    goals: [
       { id: 'l51g1', type: 'SCORE', target: 600000, description: 'Score 600,000' },
       { id: 'l51g2', type: 'COLLECT', target: 150, targetColor: CandyColor.Red, description: 'Collect 150 Red' },
       { id: 'l51g3', type: 'COLLECT', target: 150, targetColor: CandyColor.Blue, description: 'Collect 150 Blue' }
    ]
  },
  {
    levelNumber: 52,
    moves: 45,
    timeLimit: 260,
    goals: [
       { id: 'l52g1', type: 'COLLECT', target: 20, targetCandyType: CandyType.StripedHorizontal, description: 'Collect 20 H-Stripes' },
       { id: 'l52g2', type: 'COLLECT', target: 20, targetCandyType: CandyType.StripedVertical, description: 'Collect 20 V-Stripes' },
       { id: 'l52g3', type: 'SCORE', target: 500000, description: 'Score 500,000' }
    ]
  },
  {
    levelNumber: 53,
    moves: 55,
    timeLimit: 300,
    goals: [
       { id: 'l53g1', type: 'COLLECT', target: 25, targetCandyType: CandyType.Bomb, description: 'Collect 25 Bombs' },
       { id: 'l53g2', type: 'COLLECT', target: 100, targetColor: CandyColor.Green, description: 'Collect 100 Green' },
       { id: 'l53g3', type: 'COLLECT', target: 100, targetColor: CandyColor.Yellow, description: 'Collect 100 Yellow' }
    ]
  },
  {
    levelNumber: 54,
    moves: 40,
    timeLimit: 240,
    goals: [
       { id: 'l54g1', type: 'SCORE', target: 800000, description: 'Score 800,000' },
       { id: 'l54g2', type: 'COLLECT', target: 15, targetCandyType: CandyType.Bomb, description: 'Collect 15 Bombs' },
       { id: 'l54g3', type: 'COLLECT', target: 15, targetCandyType: CandyType.StripedVertical, description: 'Collect 15 V-Stripes' }
    ]
  },
  {
    levelNumber: 55,
    moves: 70,
    timeLimit: 420,
    goals: [
       { id: 'l55g1', type: 'SCORE', target: 2000000, description: 'Score 2,000,000' },
       { id: 'l55g2', type: 'COLLECT', target: 35, targetCandyType: CandyType.Bomb, description: 'Collect 35 Bombs' },
       { id: 'l55g3', type: 'COLLECT', target: 200, targetColor: CandyColor.Purple, description: 'Collect 200 Purple' }
    ]
  },
  {
    levelNumber: 56,
    moves: 50,
    timeLimit: 280,
    goals: [
       { id: 'l56g1', type: 'SCORE', target: 700000, description: 'Score 700,000' },
       { id: 'l56g2', type: 'COLLECT', target: 120, targetColor: CandyColor.Red, description: 'Collect 120 Red' },
       { id: 'l56g3', type: 'COLLECT', target: 12, targetCandyType: CandyType.StripedVertical, description: 'Collect 12 V-Stripes' }
    ]
  },
  {
    levelNumber: 57,
    moves: 45,
    timeLimit: 260,
    goals: [
       { id: 'l57g1', type: 'COLLECT', target: 25, targetCandyType: CandyType.StripedHorizontal, description: 'Collect 25 H-Stripes' },
       { id: 'l57g2', type: 'COLLECT', target: 25, targetCandyType: CandyType.StripedVertical, description: 'Collect 25 V-Stripes' },
       { id: 'l57g3', type: 'SCORE', target: 600000, description: 'Score 600,000' }
    ]
  },
  {
    levelNumber: 58,
    moves: 55,
    timeLimit: 300,
    goals: [
       { id: 'l58g1', type: 'COLLECT', target: 20, targetCandyType: CandyType.Bomb, description: 'Collect 20 Bombs' },
       { id: 'l58g2', type: 'COLLECT', target: 150, targetColor: CandyColor.Orange, description: 'Collect 150 Orange' },
       { id: 'l58g3', type: 'COLLECT', target: 150, targetColor: CandyColor.Green, description: 'Collect 150 Green' }
    ]
  },
  {
    levelNumber: 59,
    moves: 40,
    timeLimit: 240,
    goals: [
       { id: 'l59g1', type: 'SCORE', target: 1000000, description: 'Score 1,000,000' },
       { id: 'l59g2', type: 'COLLECT', target: 200, targetColor: CandyColor.Blue, description: 'Collect 200 Blue' },
       { id: 'l59g3', type: 'COLLECT', target: 10, targetCandyType: CandyType.Bomb, description: 'Collect 10 Bombs' }
    ]
  },
  {
    levelNumber: 60,
    moves: 65,
    timeLimit: 400,
    goals: [
       { id: 'l60g1', type: 'SCORE', target: 2500000, description: 'Score 2,500,000' },
       { id: 'l60g2', type: 'COLLECT', target: 40, targetCandyType: CandyType.Bomb, description: 'Collect 40 Bombs' },
       { id: 'l60g3', type: 'COLLECT', target: 40, targetCandyType: CandyType.StripedHorizontal, description: 'Collect 40 H-Stripes' }
    ]
  },
  {
    levelNumber: 61,
    moves: 50,
    timeLimit: 280,
    goals: [
       { id: 'l61g1', type: 'SCORE', target: 1500000, description: 'Score 1,500,000' },
       { id: 'l61g2', type: 'COLLECT', target: 150, targetColor: CandyColor.Red, description: 'Collect 150 Red' },
       { id: 'l61g3', type: 'COLLECT', target: 20, targetCandyType: CandyType.StripedVertical, description: 'Collect 20 V-Stripes' }
    ]
  },
  {
    levelNumber: 62,
    moves: 45,
    timeLimit: 260,
    goals: [
       { id: 'l62g1', type: 'COLLECT', target: 25, targetCandyType: CandyType.StripedHorizontal, description: 'Collect 25 H-Stripes' },
       { id: 'l62g2', type: 'COLLECT', target: 25, targetCandyType: CandyType.StripedVertical, description: 'Collect 25 V-Stripes' },
       { id: 'l62g3', type: 'SCORE', target: 1800000, description: 'Score 1,800,000' }
    ]
  },
  {
    levelNumber: 63,
    moves: 55,
    timeLimit: 320,
    goals: [
       { id: 'l63g1', type: 'COLLECT', target: 30, targetCandyType: CandyType.Bomb, description: 'Collect 30 Bombs' },
       { id: 'l63g2', type: 'COLLECT', target: 200, targetColor: CandyColor.Yellow, description: 'Collect 200 Yellow' },
       { id: 'l63g3', type: 'SCORE', target: 2000000, description: 'Score 2,000,000' }
    ]
  },
  {
    levelNumber: 64,
    moves: 60,
    timeLimit: 350,
    goals: [
       { id: 'l64g1', type: 'COLLECT', target: 200, targetColor: CandyColor.Green, description: 'Collect 200 Green' },
       { id: 'l64g2', type: 'COLLECT', target: 200, targetColor: CandyColor.Orange, description: 'Collect 200 Orange' },
       { id: 'l64g3', type: 'COLLECT', target: 200, targetColor: CandyColor.Purple, description: 'Collect 200 Purple' }
    ]
  },
  {
    levelNumber: 65,
    moves: 70,
    timeLimit: 450,
    goals: [
       { id: 'l65g1', type: 'SCORE', target: 4000000, description: 'Score 4,000,000' },
       { id: 'l65g2', type: 'COLLECT', target: 50, targetCandyType: CandyType.Bomb, description: 'Collect 50 Bombs' },
       { id: 'l65g3', type: 'COLLECT', target: 50, targetCandyType: CandyType.StripedHorizontal, description: 'Collect 50 H-Stripes' }
    ]
  },
  {
    levelNumber: 66,
    moves: 50,
    timeLimit: 300,
    goals: [
       { id: 'l66g1', type: 'SCORE', target: 2500000, description: 'Score 2,500,000' },
       { id: 'l66g2', type: 'COLLECT', target: 30, targetCandyType: CandyType.StripedVertical, description: 'Collect 30 V-Stripes' },
       { id: 'l66g3', type: 'COLLECT', target: 150, targetColor: CandyColor.Blue, description: 'Collect 150 Blue' }
    ]
  },
  {
    levelNumber: 67,
    moves: 55,
    timeLimit: 320,
    goals: [
       { id: 'l67g1', type: 'COLLECT', target: 25, targetCandyType: CandyType.Bomb, description: 'Collect 25 Bombs' },
       { id: 'l67g2', type: 'COLLECT', target: 200, targetColor: CandyColor.Green, description: 'Collect 200 Green' },
       { id: 'l67g3', type: 'SCORE', target: 3000000, description: 'Score 3,000,000' }
    ]
  },
  {
    levelNumber: 68,
    moves: 60,
    timeLimit: 350,
    goals: [
       { id: 'l68g1', type: 'COLLECT', target: 20, targetCandyType: CandyType.StripedHorizontal, description: 'Collect 20 H-Stripes' },
       { id: 'l68g2', type: 'COLLECT', target: 20, targetCandyType: CandyType.StripedVertical, description: 'Collect 20 V-Stripes' },
       { id: 'l68g3', type: 'COLLECT', target: 20, targetCandyType: CandyType.Bomb, description: 'Collect 20 Bombs' }
    ]
  },
  {
    levelNumber: 69,
    moves: 65,
    timeLimit: 380,
    goals: [
       { id: 'l69g1', type: 'SCORE', target: 4000000, description: 'Score 4,000,000' },
       { id: 'l69g2', type: 'COLLECT', target: 250, targetColor: CandyColor.Red, description: 'Collect 250 Red' },
       { id: 'l69g3', type: 'COLLECT', target: 250, targetColor: CandyColor.Yellow, description: 'Collect 250 Yellow' }
    ]
  },
  {
    levelNumber: 70,
    moves: 75,
    timeLimit: 480,
    goals: [
       { id: 'l70g1', type: 'SCORE', target: 5000000, description: 'Score 5,000,000' },
       { id: 'l70g2', type: 'COLLECT', target: 50, targetCandyType: CandyType.Bomb, description: 'Collect 50 Bombs' },
       { id: 'l70g3', type: 'COLLECT', target: 50, targetCandyType: CandyType.StripedVertical, description: 'Collect 50 V-Stripes' }
    ]
  }
];
