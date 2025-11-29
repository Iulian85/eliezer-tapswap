export interface LevelConfig {
    id: number;
    rows: number;
    cols: number;
    moves: number;
    targetScore: number;
    colors: number; // How many candy colors (4-7)
    special?: 'jelly' | 'ingredients'; 
}

export interface PlayerProgress {
    highScores: Record<number, number>;
    stars: Record<number, number>; // 0-3
    unlockedLevel: number;
    totalStars: number;
    soundEnabled: boolean;
}

export enum CandyType {
    Red = 0,
    Orange = 1,
    Yellow = 2,
    Green = 3,
    Blue = 4,
    Purple = 5,
    White = 6, // Special
    Empty = -1
}

export enum GameState {
    Idle,
    Selecting,
    Swapping,
    Matching,
    Falling,
    Refilling,
    GameOver
}

export interface Cell {
    r: number;
    c: number;
    type: CandyType;
    prevR?: number; // For animation
    prevC?: number; // For animation
    dx: number; // visual offset x
    dy: number; // visual offset y
    scale: number;
    alpha: number;
    isSpecial?: boolean; // simple special flag for Color Bomb visuals
}

declare global {
    interface Window {
        Telegram?: any;
    }
}