
// This file is deprecated.
// The application now runs 100% client-side using Telegram CloudStorage.
// No backend API calls are required.

export const api = {
    // Legacy placeholders to prevent crashes if imported by mistake
    initUser: async () => ({ success: false }),
    updateWallet: async () => {},
    redeemReferral: async () => ({ success: false }),
    saveGame: async () => {},
    recordPurchase: async () => {},
    getLeaderboard: async () => []
};
