

import { Inventory, UserStats, Board } from '../types';

// Keys for storage
const KEY_STATE = 'ELZR_STATE_V2'; // Incremented version to ensure fresh start if structure changes

export interface CloudGameState {
    currentLevel: number;
    inventory: Inventory;
    stats: UserStats;
    lastDailyCompleted: string | null;
    boardState: {
        board: Board;
        score: number;
        moves: number;
        timeLeft: number;
        goalProgress: Record<string, number>;
    } | null;
    timestamp: number;
}

export const tgStorage = {
    // Generic Set
    setItem: (key: string, value: string): Promise<boolean> => {
        return new Promise((resolve) => {
            if (window.Telegram?.WebApp?.CloudStorage) {
                window.Telegram.WebApp.CloudStorage.setItem(key, value, (err: any, saved: boolean) => {
                    if (err) {
                        console.error('CloudStorage Save Error:', err);
                        resolve(false);
                    } else {
                        resolve(saved);
                    }
                });
            } else {
                // Fallback to LocalStorage for browser testing
                try {
                    localStorage.setItem(key, value);
                    resolve(true);
                } catch (e) {
                    resolve(false);
                }
            }
        });
    },

    // Generic Get
    getItem: (key: string): Promise<string | null> => {
        return new Promise((resolve) => {
            if (window.Telegram?.WebApp?.CloudStorage) {
                window.Telegram.WebApp.CloudStorage.getItem(key, (err: any, value: string | null) => {
                    if (err) {
                        console.error('CloudStorage Load Error:', err);
                        resolve(null);
                    } else {
                        resolve(value);
                    }
                });
            } else {
                // Fallback to LocalStorage for browser testing
                resolve(localStorage.getItem(key));
            }
        });
    },

    // Save Complete Game State
    saveGameState: async (data: CloudGameState) => {
        // Optimization: Remove 'friends' from stats if too large, but for now we keep it
        // CloudStorage has a limit of 4096 bytes per key in some contexts, but usually higher for keys.
        // If data gets too big, we might need to split keys.
        const payload = JSON.stringify(data);
        return await tgStorage.setItem(KEY_STATE, payload);
    },

    // Load Complete Game State
    loadGameState: async (): Promise<CloudGameState | null> => {
        const data = await tgStorage.getItem(KEY_STATE);
        if (!data) return null;
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error("Failed to parse game state", e);
            return null;
        }
    }
};
