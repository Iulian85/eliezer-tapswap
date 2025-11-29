
// Keys for storage
const KEY_STATE = 'ELZR_STATE_V1';
const KEY_FRIENDS = 'ELZR_FRENS_V1';

export const tgStorage = {
    // Save generic value
    setItem: (key: string, value: string): Promise<boolean> => {
        return new Promise((resolve) => {
            if (!window.Telegram?.WebApp?.CloudStorage) {
                // Fallback to localStorage for testing in browser
                localStorage.setItem(key, value);
                resolve(true);
                return;
            }

            window.Telegram.WebApp.CloudStorage.setItem(key, value, (err, saved) => {
                if (err) {
                    console.error('CloudStorage Save Error:', err);
                    resolve(false);
                } else {
                    resolve(saved);
                }
            });
        });
    },

    // Get generic value
    getItem: (key: string): Promise<string | null> => {
        return new Promise((resolve) => {
            if (!window.Telegram?.WebApp?.CloudStorage) {
                // Fallback to localStorage for testing in browser
                resolve(localStorage.getItem(key));
                return;
            }

            window.Telegram.WebApp.CloudStorage.getItem(key, (err, value) => {
                if (err) {
                    console.error('CloudStorage Load Error:', err);
                    resolve(null);
                } else {
                    resolve(value);
                }
            });
        });
    },

    // Save Main Game State (Level, Score, Inventory, Stats)
    saveGameState: async (data: any) => {
        const payload = JSON.stringify(data);
        return await tgStorage.setItem(KEY_STATE, payload);
    },

    // Load Main Game State
    loadGameState: async () => {
        const data = await tgStorage.getItem(KEY_STATE);
        return data ? JSON.parse(data) : null;
    },

    // Save Friends List (Separate key to avoid size limits)
    saveFriends: async (friends: any[]) => {
        const payload = JSON.stringify(friends);
        return await tgStorage.setItem(KEY_FRIENDS, payload);
    },

    // Load Friends List
    loadFriends: async () => {
        const data = await tgStorage.getItem(KEY_FRIENDS);
        return data ? JSON.parse(data) : [];
    }
};
