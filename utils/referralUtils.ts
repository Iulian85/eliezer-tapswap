// Rate Limiting to prevent spamming Telegram API
let lastRequestTime = 0;
const RATE_LIMIT_MS = 2000; // 2 seconds between requests

// 1. Secure Code Generation (Base64 Obfuscation)
// Format: ELZR-<Base64(UserID|RandomString)>
export const generateSecureReferralCode = (userId: string): string => {
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const rawString = `${userId}|${randomSuffix}`;
    // Use btoa for Base64 encoding
    const encoded = btoa(rawString).replace(/=/g, ''); // Remove padding for cleaner look
    return `ELZR-${encoded}`;
};

// 2. Decode Referral Code to extract Referrer ID
export const decodeReferralCode = (code: string): string | null => {
    try {
        if (!code.startsWith('ELZR-')) return null;
        const encoded = code.replace('ELZR-', '');
        // Restore padding if necessary (though usually browser handles it)
        const rawString = atob(encoded);
        const [userId] = rawString.split('|');
        return userId || null;
    } catch (e) {
        console.error("Invalid Referral Code", e);
        return null;
    }
};

// 3. Safe Send Message via Bot API (Client-Side Transport)
export const safeSendReferralNotification = async (
    referrerId: string,
    newUserName: string,
    newUserid: string,
    botToken: string,
    webAppUrl: string
): Promise<{ success: boolean; message: string }> => {
    const now = Date.now();
    if (now - lastRequestTime < RATE_LIMIT_MS) {
        return { success: false, message: "Please wait a moment before retrying." };
    }
    lastRequestTime = now;

    if (!botToken) {
        console.error("Bot Token is missing! Set VITE_BOT_TOKEN in Railway Variables.");
        return { success: false, message: "Configuration Error: Missing Bot Token" };
    }

    try {
        // We construct a specific start param that contains the NEW user's details
        // Format: confirm_NEWUSERID_NEWUSERNAME (URL encoded)
        // Note: start_param size is limited, so we keep it minimal.
        const safeName = newUserName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
        const startParam = `confirm_${newUserid}_${safeName}`;
        
        const text = `🎉 *New Fren Alert!*\n\n${newUserName} just joined using your link!\n\nTap below to claim your *500 Coins* reward and add them to your squad. 👇`;
        
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: referrerId,
                text: text,
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[{
                        text: "💰 Claim Reward & Add Fren",
                        url: `${webAppUrl}?startapp=${startParam}`
                    }]]
                }
            })
        });

        const data = await response.json();
        
        if (!data.ok) {
            console.error("Telegram API Error:", data);
            return { success: false, message: "Could not notify friend (Bot may be blocked)." };
        }

        return { success: true, message: "Notification sent to friend!" };

    } catch (e) {
        console.error("Network Error:", e);
        return { success: false, message: "Network connection failed." };
    }
};