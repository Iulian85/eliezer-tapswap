
import { Inventory, UserStats, Board } from '../types';

// Keys for storage
const KEY_STATE = 'ELZR_STATE_V3'; // Incremented version

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
            // Check if Telegram WebApp is available
            const tg = window.Telegram?.WebApp;
            
            if (tg && tg.CloudStorage && typeof tg.CloudStorage.setItem === 'function') {
                tg.CloudStorage.setItem(key, value, (err: any, saved: boolean) => {
                    if (err) {
                        console.error('CloudStorage Save Error:', err);
                        // Fallback to local storage if cloud fails
                        try { localStorage.setItem(key, value); } catch(e){}
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
                    console.error('LocalStorage Save Error:', e);
                    resolve(false);
                }
            }
        });
    },

    // Generic Get
    getItem: (key: string): Promise<string | null> => {
        return new Promise((resolve) => {
            const tg = window.Telegram?.WebApp;

            if (tg && tg.CloudStorage && typeof tg.CloudStorage.getItem === 'function') {
                tg.CloudStorage.getItem(key, (err: any, value: string | null) => {
                    if (err) {
                        console.error('CloudStorage Load Error:', err);
                        // Fallback to local storage
                        resolve(localStorage.getItem(key));
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
