
import { CandyColor, LevelConfig, CandyType } from './types';

export const BOARD_SIZE = 8;
export const BOARD_WIDTH = 8;
export const TOTAL_CELLS = BOARD_SIZE * BOARD_WIDTH;

// Replace this with your actual wallet address to receive payments
export const TREASURY_WALLET = "UQCpvC9nskdZ9hqMths4jifCMKganQX05CZrCXSyWuyNkOwp"; 

export const CANDY_COLORS = [
  CandyColor.Red,
  CandyColor.Blue,
  CandyColor.Green,
  CandyColor.Yellow,
  CandyColor.Purple,
  CandyColor.Orange,
];

// Visual mapping - CRYPTO THEME
// Red: ELZR (Metallic Gold/Amber)
// Blue: TON (Blue)
// Green: USDT on TON (Green) - Replaced CATI
// Yellow: HMSTR (Metallic Grey) - Changed from Gold
// Purple: NOT (Black/Dark) 
// Orange: DOGS (White/Grey)
export const COLOR_STYLES: Record<CandyColor, string> = {
  [CandyColor.Red]: 'bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700 shadow-yellow-500/50 border border-yellow-200/30', // ELZR - Metallic Gold
  [CandyColor.Blue]: 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-blue-500/50', // TON
  [CandyColor.Green]: 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-teal-500/50', // USDT (Teal/Green)
  [CandyColor.Yellow]: 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 shadow-gray-500/50 border border-white/20', // HMSTR - Metallic Grey
  [CandyColor.Purple]: 'bg-gradient-to-br from-gray-900 to-black shadow-black/50 border border-white/10', // NOT
  [CandyColor.Orange]: 'bg-gradient-to-br from-gray-100 to-white shadow-white/30 text-black', // DOGS
  [CandyColor.Multi]: 'bg-gray-800 shadow-white/20 border border-white/20', // Rainbow
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
  BOMB: 0.2,      // TON
  EXTRA_MOVES: 0.15, // TON
  SHUFFLE: 0.05   // TON
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
      { id: 'l2g1', type: 'COLLECT', target: 12, targetColor: CandyColor.Red, description: 'Collect 12 ELZR' }
    ]
  },
  {
    levelNumber: 3,
    moves: 25,
    timeLimit: 120,
    goals: [
       { id: 'l3g1', type: 'COLLECT', target: 10, targetColor: CandyColor.Blue, description: 'Collect 10 TON' },
       { id: 'l3g2', type: 'COLLECT', target: 10, targetColor: CandyColor.Green, description: 'Collect 10 USDT' }
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
       { id: 'l5g1', type: 'COLLECT', target: 20, targetColor: CandyColor.Yellow, description: 'Collect 20 HMSTR' },
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
       { id: 'l6g2', type: 'COLLECT', target: 30, targetColor: CandyColor.Purple, description: 'Collect 30 NOT' }
    ]
  },
  {
    levelNumber: 7,
    moves: 30,
    timeLimit: 160,
    goals: [
       { id: 'l7g1', type: 'COLLECT', target: 4, targetCandyType: CandyType.StripedVertical, description: 'Collect 4 V-Stripes' },
       { id: 'l7g2', type: 'COLLECT', target: 25, targetColor: CandyColor.Orange, description: 'Collect 25 DOGS' }
    ]
  },
  {
    levelNumber: 8,
    moves: 35,
    timeLimit: 180,
    goals: [
       { id: 'l8g1', type: 'SCORE', target: 12000, description: 'Score 12,000' },
       { id: 'l8g2', type: 'COLLECT', target: 5, targetCandyType: CandyType.Bomb, description: 'Collect 5 Bombs' },
       { id: 'l8g3', type: 'COLLECT', target: 10, targetColor: CandyColor.Green, description: 'Collect 10 USDT' }
    ]
  },
  {
    levelNumber: 9,
    moves: 30,
    timeLimit: 170,
    goals: [
       { id: 'l9g1', type: 'COLLECT', target: 25, targetColor: CandyColor.Red, description: 'Collect 25 ELZR' },
       { id: 'l9g2', type: 'COLLECT', target: 25, targetColor: CandyColor.Blue, description: 'Collect 25 TON' },
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
       { id: 'l12g1', type: 'COLLECT', target: 40, targetColor: CandyColor.Red, description: 'Collect 40 ELZR' },
       { id: 'l12g2', type: 'COLLECT', target: 40, targetColor: CandyColor.Blue, description: 'Collect 40 TON' },
       { id: 'l12g3', type: 'COLLECT', target: 40, targetColor: CandyColor.Green, description: 'Collect 40 USDT' }
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
       { id: 'l14g2', type: 'COLLECT', target: 25, targetColor: CandyColor.Yellow, description: 'Collect 25 HMSTR' },
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
       { id: 'l15g3', type: 'COLLECT', target: 50, targetColor: CandyColor.Purple, description: 'Collect 50 NOT' }
    ]
  },
  {
    levelNumber: 16,
    moves: 35,
    timeLimit: 180,
    goals: [
       { id: 'l16g1', type: 'SCORE', target: 40000, description: 'Score 40,000' },
       { id: 'l16g2', type: 'COLLECT', target: 35, targetColor: CandyColor.Red, description: 'Collect 35 ELZR' },
       { id: 'l16g3', type: 'COLLECT', target: 35, targetColor: CandyColor.Green, description: 'Collect 35 USDT' }
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
       { id: 'l18g3', type: 'COLLECT', target: 20, targetColor: CandyColor.Blue, description: 'Collect 20 TON' }
    ]
  },
  {
    levelNumber: 19,
    moves: 45,
    timeLimit: 220,
    goals: [
       { id: 'l19g1', type: 'COLLECT', target: 40, targetColor: CandyColor.Yellow, description: 'Collect 40 HMSTR' },
       { id: 'l19g2', type: 'COLLECT', target: 40, targetColor: CandyColor.Orange, description: 'Collect 40 DOGS' },
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
       { id: 'l21g1', type: 'COLLECT', target: 50, targetColor: CandyColor.Purple, description: 'Collect 50 NOT' },
       { id: 'l21g2', type: 'COLLECT', target: 50, targetColor: CandyColor.Orange, description: 'Collect 50 DOGS' },
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
       { id: 'l23g3', type: 'COLLECT', target: 40, targetColor: CandyColor.Red, description: 'Collect 40 ELZR' }
    ]
  },
  {
    levelNumber: 24,
    moves: 30,
    timeLimit: 160,
    goals: [
       { id: 'l24g1', type: 'SCORE', target: 150000, description: 'Score 150,000' },
       { id: 'l24g2', type: 'COLLECT', target: 60, targetColor: CandyColor.Blue, description: 'Collect 60 TON' },
       { id: 'l24g3', type: 'COLLECT', target: 60, targetColor: CandyColor.Green, description: 'Collect 60 USDT' }
    ]
  },
  {
    levelNumber: 25,
    moves: 55,
    timeLimit: 300,
    goals: [
       { id: 'l25g1', type: 'SCORE', target: 200000, description: 'Score 200,000' },
       { id: 'l25g2', type: 'COLLECT', target: 15, targetCandyType: CandyType.Bomb, description: 'Collect 15 Bombs' },
       { id: 'l25g3', type: 'COLLECT', target: 100, targetColor: CandyColor.Yellow, description: 'Collect 100 HMSTR' }
    ]
  },
  {
    levelNumber: 26,
    moves: 35,
    timeLimit: 190,
    goals: [
       { id: 'l26g1', type: 'SCORE', target: 80000, description: 'Score 80,000' },
       { id: 'l26g2', type: 'COLLECT', target: 45, targetColor: CandyColor.Red, description: 'Collect 45 ELZR' },
       { id: 'l26g3', type: 'COLLECT', target: 45, targetColor: CandyColor.Green, description: 'Collect 45 USDT' }
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
       { id: 'l28g2', type: 'COLLECT', target: 50, targetColor: CandyColor.Purple, description: 'Collect 50 NOT' },
       { id: 'l28g3', type: 'SCORE', target: 150000, description: 'Score 150,000' }
    ]
  },
  {
    levelNumber: 29,
    moves: 50,
    timeLimit: 260,
    goals: [
       { id: 'l29g1', type: 'COLLECT', target: 60, targetColor: CandyColor.Blue, description: 'Collect 60 TON' },
       { id: 'l29g2', type: 'COLLECT', target: 60, targetColor: CandyColor.Orange, description: 'Collect 60 DOGS' },
       { id: 'l29g3', type: 'COLLECT', target: 60, targetColor: CandyColor.Yellow, description: 'Collect 60 HMSTR' }
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
       { id: 'l31g2', type: 'COLLECT', target: 50, targetColor: CandyColor.Red, description: 'Collect 50 ELZR' },
       { id: 'l31g3', type: 'COLLECT', target: 8, targetCandyType: CandyType.StripedVertical, description: 'Collect 8 V-Stripes' }
    ]
  },
  {
    levelNumber: 32,
    moves: 45,
    timeLimit: 240,
    goals: [
       { id: 'l32g1', type: 'COLLECT', target: 12, targetCandyType: CandyType.Bomb, description: 'Collect 12 Bombs' },
       { id: 'l32g2', type: 'COLLECT', target: 60, targetColor: CandyColor.Green, description: 'Collect 60 USDT' },
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
       { id: 'l33g3', type: 'COLLECT', target: 70, targetColor: CandyColor.Yellow, description: 'Collect 70 HMSTR' }
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
       { id: 'l35g3', type: 'COLLECT', target: 100, targetColor: CandyColor.Purple, description: 'Collect 100 NOT' }
    ]
  },
  {
    levelNumber: 36,
    moves: 45,
    timeLimit: 250,
    goals: [
       { id: 'l36g1', type: 'SCORE', target: 200000, description: 'Score 200,000' },
       { id: 'l36g2', type: 'COLLECT', target: 80, targetColor: CandyColor.Red, description: 'Collect 80 ELZR' },
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
       { id: 'l38g2', type: 'COLLECT', target: 50, targetColor: CandyColor.Yellow, description: 'Collect 50 HMSTR' },
       { id: 'l38g3', type: 'COLLECT', target: 50, targetColor: CandyColor.Green, description: 'Collect 50 USDT' }
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
       { id: 'l40g3', type: 'COLLECT', target: 120, targetColor: CandyColor.Red, description: 'Collect 120 ELZR' }
    ]
  },
  {
    levelNumber: 41,
    moves: 45,
    timeLimit: 260,
    goals: [
       { id: 'l41g1', type: 'COLLECT', target: 100, targetColor: CandyColor.Blue, description: 'Collect 100 TON' },
       { id: 'l41g2', type: 'COLLECT', target: 100, targetColor: CandyColor.Green, description: 'Collect 100 USDT' },
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
       { id: 'l43g2', type: 'COLLECT', target: 80, targetColor: CandyColor.Purple, description: 'Collect 80 NOT' },
       { id: 'l43g3', type: 'COLLECT', target: 80, targetColor: CandyColor.Orange, description: 'Collect 80 DOGS' }
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
       { id: 'l45g3', type: 'COLLECT', target: 150, targetColor: CandyColor.Yellow, description: 'Collect 150 HMSTR' }
    ]
  },
  {
    levelNumber: 46,
    moves: 50,
    timeLimit: 280,
    goals: [
       { id: 'l46g1', type: 'COLLECT', target: 100, targetColor: CandyColor.Red, description: 'Collect 100 ELZR' },
       { id: 'l46g2', type: 'COLLECT', target: 100, targetColor: CandyColor.Blue, description: 'Collect 100 TON' },
       { id: 'l46g3', type: 'COLLECT', target: 100, targetColor: CandyColor.Green, description: 'Collect 100 USDT' }
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
       { id: 'l49g1', type: 'COLLECT', target: 150, targetColor: CandyColor.Purple, description: 'Collect 150 NOT' },
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
       { id: 'l51g2', type: 'COLLECT', target: 150, targetColor: CandyColor.Red, description: 'Collect 150 ELZR' },
       { id: 'l51g3', type: 'COLLECT', target: 150, targetColor: CandyColor.Blue, description: 'Collect 150 TON' }
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
       { id: 'l53g2', type: 'COLLECT', target: 100, targetColor: CandyColor.Green, description: 'Collect 100 USDT' },
       { id: 'l53g3', type: 'COLLECT', target: 100, targetColor: CandyColor.Yellow, description: 'Collect 100 HMSTR' }
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
       { id: 'l55g3', type: 'COLLECT', target: 200, targetColor: CandyColor.Purple, description: 'Collect 200 NOT' }
    ]
  },
  {
    levelNumber: 56,
    moves: 50,
    timeLimit: 280,
    goals: [
       { id: 'l56g1', type: 'SCORE', target: 700000, description: 'Score 700,000' },
       { id: 'l56g2', type: 'COLLECT', target: 120, targetColor: CandyColor.Red, description: 'Collect 120 ELZR' },
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
       { id: 'l58g2', type: 'COLLECT', target: 150, targetColor: CandyColor.Orange, description: 'Collect 150 DOGS' },
       { id: 'l58g3', type: 'COLLECT', target: 150, targetColor: CandyColor.Green, description: 'Collect 150 USDT' }
    ]
  },
  {
    levelNumber: 59,
    moves: 40,
    timeLimit: 240,
    goals: [
       { id: 'l59g1', type: 'SCORE', target: 1000000, description: 'Score 1,000,000' },
       { id: 'l59g2', type: 'COLLECT', target: 200, targetColor: CandyColor.Blue, description: 'Collect 200 TON' },
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
       { id: 'l61g2', type: 'COLLECT', target: 150, targetColor: CandyColor.Red, description: 'Collect 150 ELZR' },
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
       { id: 'l63g2', type: 'COLLECT', target: 200, targetColor: CandyColor.Yellow, description: 'Collect 200 HMSTR' },
       { id: 'l63g3', type: 'SCORE', target: 2000000, description: 'Score 2,000,000' }
    ]
  },
  {
    levelNumber: 64,
    moves: 60,
    timeLimit: 350,
    goals: [
       { id: 'l64g1', type: 'COLLECT', target: 200, targetColor: CandyColor.Green, description: 'Collect 200 USDT' },
       { id: 'l64g2', type: 'COLLECT', target: 200, targetColor: CandyColor.Orange, description: 'Collect 200 DOGS' },
       { id: 'l64g3', type: 'COLLECT', target: 200, targetColor: CandyColor.Purple, description: 'Collect 200 NOT' }
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
       { id: 'l66g3', type: 'COLLECT', target: 150, targetColor: CandyColor.Blue, description: 'Collect 150 TON' }
    ]
  },
  {
    levelNumber: 67,
    moves: 55,
    timeLimit: 320,
    goals: [
       { id: 'l67g1', type: 'COLLECT', target: 25, targetCandyType: CandyType.Bomb, description: 'Collect 25 Bombs' },
       { id: 'l67g2', type: 'COLLECT', target: 200, targetColor: CandyColor.Green, description: 'Collect 200 USDT' },
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
       { id: 'l69g2', type: 'COLLECT', target: 250, targetColor: CandyColor.Red, description: 'Collect 250 ELZR' },
       { id: 'l69g3', type: 'COLLECT', target: 250, targetColor: CandyColor.Yellow, description: 'Collect 250 HMSTR' }
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
  },
  {
    levelNumber: 71,
    moves: 50,
    timeLimit: 300,
    goals: [
       { id: 'l71g1', type: 'SCORE', target: 6000000, description: 'Score 6,000,000' },
       { id: 'l71g2', type: 'COLLECT', target: 30, targetCandyType: CandyType.Bomb, description: 'Collect 30 Bombs' }
    ]
  },
  {
    levelNumber: 72,
    moves: 45,
    timeLimit: 280,
    goals: [
       { id: 'l72g1', type: 'COLLECT', target: 300, targetColor: CandyColor.Red, description: 'Collect 300 ELZR' },
       { id: 'l72g2', type: 'COLLECT', target: 300, targetColor: CandyColor.Blue, description: 'Collect 300 TON' }
    ]
  },
  {
    levelNumber: 73,
    moves: 55,
    timeLimit: 320,
    goals: [
       { id: 'l73g1', type: 'COLLECT', target: 25, targetCandyType: CandyType.StripedHorizontal, description: 'Collect 25 H-Stripes' },
       { id: 'l73g2', type: 'COLLECT', target: 25, targetCandyType: CandyType.StripedVertical, description: 'Collect 25 V-Stripes' },
       { id: 'l73g3', type: 'SCORE', target: 3500000, description: 'Score 3,500,000' }
    ]
  },
  {
    levelNumber: 74,
    moves: 40,
    timeLimit: 240,
    goals: [
       { id: 'l74g1', type: 'SCORE', target: 7000000, description: 'Score 7,000,000' },
       { id: 'l74g2', type: 'COLLECT', target: 300, targetColor: CandyColor.Green, description: 'Collect 300 USDT' }
    ]
  },
  {
    levelNumber: 75,
    moves: 60,
    timeLimit: 400,
    goals: [
       { id: 'l75g1', type: 'COLLECT', target: 40, targetCandyType: CandyType.Bomb, description: 'Collect 40 Bombs' },
       { id: 'l75g2', type: 'COLLECT', target: 300, targetColor: CandyColor.Orange, description: 'Collect 300 DOGS' },
       { id: 'l75g3', type: 'COLLECT', target: 300, targetColor: CandyColor.Green, description: 'Collect 300 USDT' }
    ]
  },
  {
    levelNumber: 76,
    moves: 50,
    timeLimit: 300,
    goals: [
       { id: 'l76g1', type: 'COLLECT', target: 300, targetColor: CandyColor.Purple, description: 'Collect 300 NOT' },
       { id: 'l76g2', type: 'COLLECT', target: 300, targetColor: CandyColor.Orange, description: 'Collect 300 DOGS' },
       { id: 'l76g3', type: 'SCORE', target: 4000000, description: 'Score 4,000,000' }
    ]
  },
  {
    levelNumber: 77,
    moves: 45,
    timeLimit: 270,
    goals: [
       { id: 'l77g1', type: 'SCORE', target: 8000000, description: 'Score 8,000,000' },
       { id: 'l77g2', type: 'COLLECT', target: 20, targetCandyType: CandyType.StripedVertical, description: 'Collect 20 V-Stripes' }
    ]
  },
  {
    levelNumber: 78,
    moves: 55,
    timeLimit: 330,
    goals: [
       { id: 'l78g1', type: 'COLLECT', target: 300, targetColor: CandyColor.Yellow, description: 'Collect 300 HMSTR' },
       { id: 'l78g2', type: 'COLLECT', target: 30, targetCandyType: CandyType.Bomb, description: 'Collect 30 Bombs' }
    ]
  },
  {
    levelNumber: 79,
    moves: 50,
    timeLimit: 300,
    goals: [
       { id: 'l79g1', type: 'COLLECT', target: 30, targetCandyType: CandyType.StripedHorizontal, description: 'Collect 30 H-Stripes' },
       { id: 'l79g2', type: 'COLLECT', target: 30, targetCandyType: CandyType.StripedVertical, description: 'Collect 30 V-Stripes' },
       { id: 'l79g3', type: 'SCORE', target: 5000000, description: 'Score 5,000,000' }
    ]
  },
  {
    levelNumber: 80,
    moves: 65,
    timeLimit: 450,
    goals: [
       { id: 'l80g1', type: 'SCORE', target: 10000000, description: 'Score 10,000,000' },
       { id: 'l80g2', type: 'COLLECT', target: 50, targetCandyType: CandyType.Bomb, description: 'Collect 50 Bombs' }
    ]
  },
  {
    levelNumber: 81,
    moves: 45,
    timeLimit: 280,
    goals: [
       { id: 'l81g1', type: 'COLLECT', target: 350, targetColor: CandyColor.Red, description: 'Collect 350 ELZR' },
       { id: 'l81g2', type: 'COLLECT', target: 15, targetCandyType: CandyType.StripedHorizontal, description: 'Collect 15 H-Stripes' }
    ]
  },
  {
    levelNumber: 82,
    moves: 50,
    timeLimit: 300,
    goals: [
       { id: 'l82g1', type: 'COLLECT', target: 350, targetColor: CandyColor.Blue, description: 'Collect 350 TON' },
       { id: 'l82g2', type: 'COLLECT', target: 20, targetCandyType: CandyType.Bomb, description: 'Collect 20 Bombs' },
       { id: 'l82g3', type: 'SCORE', target: 6000000, description: 'Score 6,000,000' }
    ]
  },
  {
    levelNumber: 83,
    moves: 55,
    timeLimit: 320,
    goals: [
       { id: 'l83g1', type: 'COLLECT', target: 350, targetColor: CandyColor.Green, description: 'Collect 350 USDT' },
       { id: 'l83g2', type: 'COLLECT', target: 30, targetCandyType: CandyType.StripedVertical, description: 'Collect 30 V-Stripes' }
    ]
  },
  {
    levelNumber: 84,
    moves: 40,
    timeLimit: 250,
    goals: [
       { id: 'l84g1', type: 'SCORE', target: 12000000, description: 'Score 12,000,000' },
       { id: 'l84g2', type: 'COLLECT', target: 25, targetCandyType: CandyType.Bomb, description: 'Collect 25 Bombs' }
    ]
  },
  {
    levelNumber: 85,
    moves: 60,
    timeLimit: 400,
    goals: [
       { id: 'l85g1', type: 'COLLECT', target: 40, targetCandyType: CandyType.Bomb, description: 'Collect 40 Bombs' },
       { id: 'l85g2', type: 'COLLECT', target: 40, targetCandyType: 'STRIPED_ANY', description: 'Collect 40 Striped Candies' }
    ]
  },
  {
    levelNumber: 86,
    moves: 50,
    timeLimit: 300,
    goals: [
       { id: 'l86g1', type: 'COLLECT', target: 350, targetColor: CandyColor.Purple, description: 'Collect 350 NOT' },
       { id: 'l86g2', type: 'COLLECT', target: 350, targetColor: CandyColor.Orange, description: 'Collect 350 DOGS' },
       { id: 'l86g3', type: 'SCORE', target: 7000000, description: 'Score 7,000,000' }
    ]
  },
  {
    levelNumber: 87,
    moves: 55,
    timeLimit: 330,
    goals: [
       { id: 'l87g1', type: 'COLLECT', target: 400, targetColor: CandyColor.Yellow, description: 'Collect 400 HMSTR' },
       { id: 'l87g2', type: 'COLLECT', target: 20, targetCandyType: CandyType.StripedHorizontal, description: 'Collect 20 H-Stripes' }
    ]
  },
  {
    levelNumber: 88,
    moves: 45,
    timeLimit: 280,
    goals: [
       { id: 'l88g1', type: 'SCORE', target: 14000000, description: 'Score 14,000,000' },
       { id: 'l88g2', type: 'COLLECT', target: 25, targetCandyType: CandyType.Bomb, description: 'Collect 25 Bombs' }
    ]
  },
  {
    levelNumber: 89,
    moves: 50,
    timeLimit: 310,
    goals: [
       { id: 'l89g1', type: 'COLLECT', target: 35, targetCandyType: CandyType.StripedHorizontal, description: 'Collect 35 H-Stripes' },
       { id: 'l89g2', type: 'COLLECT', target: 35, targetCandyType: CandyType.StripedVertical, description: 'Collect 35 V-Stripes' },
       { id: 'l89g3', type: 'SCORE', target: 8000000, description: 'Score 8,000,000' }
    ]
  },
  {
    levelNumber: 90,
    moves: 70,
    timeLimit: 480,
    goals: [
       { id: 'l90g1', type: 'SCORE', target: 15000000, description: 'Score 15,000,000' },
       { id: 'l90g2', type: 'COLLECT', target: 60, targetCandyType: CandyType.Bomb, description: 'Collect 60 Bombs' }
    ]
  },
  {
    levelNumber: 91,
    moves: 50,
    timeLimit: 300,
    goals: [
       { id: 'l91g1', type: 'COLLECT', target: 500, targetColor: CandyColor.Red, description: 'Collect 500 ELZR' },
       { id: 'l91g2', type: 'SCORE', target: 9000000, description: 'Score 9,000,000' }
    ]
  },
  {
    levelNumber: 92,
    moves: 50,
    timeLimit: 300,
    goals: [
       { id: 'l92g1', type: 'COLLECT', target: 500, targetColor: CandyColor.Blue, description: 'Collect 500 TON' },
       { id: 'l92g2', type: 'COLLECT', target: 20, targetCandyType: CandyType.Bomb, description: 'Collect 20 Bombs' }
    ]
  },
  {
    levelNumber: 93,
    moves: 55,
    timeLimit: 330,
    goals: [
       { id: 'l93g1', type: 'COLLECT', target: 500, targetColor: CandyColor.Green, description: 'Collect 500 USDT' },
       { id: 'l93g2', type: 'COLLECT', target: 30, targetCandyType: CandyType.StripedVertical, description: 'Collect 30 V-Stripes' }
    ]
  },
  {
    levelNumber: 94,
    moves: 45,
    timeLimit: 280,
    goals: [
       { id: 'l94g1', type: 'SCORE', target: 18000000, description: 'Score 18,000,000' },
       { id: 'l94g2', type: 'COLLECT', target: 30, targetCandyType: CandyType.Bomb, description: 'Collect 30 Bombs' }
    ]
  },
  {
    levelNumber: 95,
    moves: 65,
    timeLimit: 450,
    goals: [
       { id: 'l95g1', type: 'COLLECT', target: 50, targetCandyType: CandyType.Bomb, description: 'Collect 50 Bombs' },
       { id: 'l95g2', type: 'COLLECT', target: 50, targetCandyType: CandyType.StripedVertical, description: 'Collect 50 V-Stripes' },
       { id: 'l95g3', type: 'SCORE', target: 10000000, description: 'Score 10,000,000' }
    ]
  },
  {
    levelNumber: 96,
    moves: 55,
    timeLimit: 340,
    goals: [
       { id: 'l96g1', type: 'COLLECT', target: 500, targetColor: CandyColor.Purple, description: 'Collect 500 NOT' },
       { id: 'l96g2', type: 'COLLECT', target: 500, targetColor: CandyColor.Orange, description: 'Collect 500 DOGS' }
    ]
  },
  {
    levelNumber: 97,
    moves: 60,
    timeLimit: 360,
    goals: [
       { id: 'l97g1', type: 'COLLECT', target: 500, targetColor: CandyColor.Yellow, description: 'Collect 500 HMSTR' },
       { id: 'l97g2', type: 'COLLECT', target: 40, targetCandyType: CandyType.StripedHorizontal, description: 'Collect 40 H-Stripes' }
    ]
  },
  {
    levelNumber: 98,
    moves: 50,
    timeLimit: 300,
    goals: [
       { id: 'l98g1', type: 'SCORE', target: 20000000, description: 'Score 20,000,000' },
       { id: 'l98g2', type: 'COLLECT', target: 40, targetCandyType: CandyType.Bomb, description: 'Collect 40 Bombs' }
    ]
  },
  {
    levelNumber: 99,
    moves: 70,
    timeLimit: 500,
    goals: [
       { id: 'l99g1', type: 'COLLECT', target: 50, targetCandyType: CandyType.StripedHorizontal, description: 'Collect 50 H-Stripes' },
       { id: 'l99g2', type: 'COLLECT', target: 50, targetCandyType: CandyType.StripedVertical, description: 'Collect 50 V-Stripes' },
       { id: 'l99g3', type: 'COLLECT', target: 50, targetCandyType: CandyType.Bomb, description: 'Collect 50 Bombs' }
    ]
  },
  {
    levelNumber: 100,
    moves: 75,
    timeLimit: 600,
    goals: [
       { id: 'l100g1', type: 'SCORE', target: 25000000, description: 'Score 25,000,000' },
       { id: 'l100g2', type: 'COLLECT', target: 100, targetCandyType: CandyType.Bomb, description: 'Collect 100 Bombs' },
       { id: 'l100g3', type: 'COLLECT', target: 500, targetColor: CandyColor.Red, description: 'Collect 500 ELZR' }
    ]
  }
];
