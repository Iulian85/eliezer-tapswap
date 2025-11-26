
const API_URL = '/api'; 

export const api = {
    initUser: async (telegramId: number | string, username: string, referralCode?: string) => {
        try {
            console.log(`Sending initUser request for ${username} (${telegramId})...`);
            const res = await fetch(`${API_URL}/user/init`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegramId, username, referralCode })
            });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Server Error (${res.status}): ${errText}`);
            }
            return await res.json();
        } catch (e: any) {
            console.error("API Error (Init):", e);
            throw e;
        }
    },

    updateWallet: async (telegramId: number | string, walletAddress: string) => {
        try {
            await fetch(`${API_URL}/user/wallet`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegramId, walletAddress })
            });
        } catch (e) {
            console.error("Wallet Update API Error:", e);
        }
    },

    redeemReferral: async (telegramId: number | string, code: string) => {
        try {
            const res = await fetch(`${API_URL}/user/redeem`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegramId, code })
            });
            return await res.json();
        } catch (e) {
            console.error("Redeem API Error:", e);
            return { success: false, message: "Connection Failed" };
        }
    },

    saveGame: async (telegramId: number | string, saveData: any) => {
    try {
        // Normalizăm datele – indiferent cum vin de la App.tsx
        const levelIndex = saveData.levelIndex ?? saveData.currentLevelIndex + 1;
        const totalScore = saveData.stats?.totalScore ?? saveData.totalScore ?? 0;
        const totalTimePlayed = saveData.stats?.totalTimePlayed ?? saveData.totalTimePlayed ?? 0;
        const adsViewed = saveData.stats?.adsViewed ?? saveData.adsViewed ?? 0;
        const tonPurchases = saveData.stats?.tonPurchases ?? saveData.tonPurchases ?? 0;
        const lastDaily = saveData.lastDailyCompleted ?? null;

        const payload: any = {
            telegramId,
            state: {
                levelIndex: Number(levelIndex),           // 1-based
                totalScore: Number(totalScore),
                totalTimePlayed: Number(totalTimePlayed),
                adsViewed: Number(adsViewed),
                lastDailyCompleted: lastDaily,
                tonPurchases: Number(tonPurchases)
            },
            inventory: saveData.inventory || {}
        };

        // Doar dacă avem board real
        if (saveData.board !== undefined) {
            payload.board = saveData.board;
            payload.state.score = saveData.score ?? 0;
            payload.state.moves = saveData.moves ?? 0;
            payload.state.timeLeft = saveData.timeLeft ?? 0;
        }

        console.log("Saving game state:", payload); // VEZI ÎN CONSOLĂ CE SE TRIMITE

        const res = await fetch(`${API_URL}/game/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("Save failed:", res.status, text);
        } else {
            console.log("Save successful");
        }
    } catch (e) {
        console.error("Save API Error:", e);
    }
},

    recordPurchase: async (telegramId: number | string, item: string, cost: number) => {
        try {
            const res = await fetch(`${API_URL}/shop/purchase`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegramId, item, cost })
            });
             if (!res.ok) console.error("Purchase failed:", await res.text());
        } catch (e) { console.error("Purchase Record API Error:", e); }
    },

    getLeaderboard: async () => {
        try {
            const res = await fetch(`${API_URL}/leaderboard`);
            if (!res.ok) return [];
            return await res.json();
        } catch (e) { return []; }
    }
};
