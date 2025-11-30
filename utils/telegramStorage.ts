
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
    // Helper to check support
    isCloudStorageSupported: (): boolean => {
        const tg = window.Telegram?.WebApp;
        // CloudStorage was introduced in version 6.9
        return tg && tg.isVersionAtLeast && tg.isVersionAtLeast('6.9');
    },

    // Generic Set
    setItem: (key: string, value: string): Promise<boolean> => {
        return new Promise((resolve) => {
            // Check support first
            if (tgStorage.isCloudStorageSupported()) {
                const tg = window.Telegram?.WebApp;
                
                try {
                    tg.CloudStorage.setItem(key, value, (err: any, saved: boolean) => {
                        if (err) {
                            console.warn('CloudStorage Save Error (Fallback to Local):', err);
                            try { localStorage.setItem(key, value); } catch(e){}
                            resolve(false);
                        } else {
                            resolve(saved);
                        }
                    });
                } catch (e) {
                    console.warn('CloudStorage Exception (Fallback to Local):', e);
                    try { localStorage.setItem(key, value); } catch(err){}
                    resolve(false);
                }
            } else {
                // Fallback to LocalStorage for older Telegram versions or browser testing
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
            if (tgStorage.isCloudStorageSupported()) {
                const tg = window.Telegram?.WebApp;
                try {
                    tg.CloudStorage.getItem(key, (err: any, value: string | null) => {
                        if (err) {
                            console.warn('CloudStorage Load Error (Fallback to Local):', err);
                            resolve(localStorage.getItem(key));
                        } else {
                            // If cloud returns empty, try local (migration scenario)
                            if (!value) {
                                const local = localStorage.getItem(key);
                                if (local) resolve(local);
                                else resolve(null);
                            } else {
                                resolve(value);
                            }
                        }
                    });
                } catch (e) {
                    console.warn('CloudStorage Exception (Fallback to Local):', e);
                    resolve(localStorage.getItem(key));
                }
            } else {
                // Fallback to LocalStorage
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
