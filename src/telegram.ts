
import { PlayerProgress } from './types';

// Safe access to Telegram WebApp
const TG = window.Telegram?.WebApp;

export class TelegramService {
    static init() {
        if (!TG) return;
        
        TG.ready();
        try {
            TG.expand();
            TG.enableClosingConfirmation();
            // Set header color to match app
            TG.setHeaderColor('#2c3e50');
            TG.setBackgroundColor('#2c3e50');
        } catch (e) {
            console.warn('Telegram specific features failed:', e);
        }
    }

    static get user() {
        return TG?.initDataUnsafe?.user;
    }

    static haptic(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') {
        if (TG?.HapticFeedback) {
            TG.HapticFeedback.impactOccurred(style);
        }
    }

    static notification(type: 'success' | 'warning' | 'error') {
        if (TG?.HapticFeedback) {
            TG.HapticFeedback.notificationOccurred(type);
        }
    }

    static async saveProgress(data: PlayerProgress) {
        // Fallback to local storage immediately if not in Telegram or old version
        if (!TG?.CloudStorage || !TG.isVersionAtLeast('6.9')) {
            localStorage.setItem('candy_save', JSON.stringify(data));
            return;
        }
        
        return new Promise<void>((resolve, reject) => {
            TG.CloudStorage.setItem('candy_save', JSON.stringify(data), (err) => {
                if (err) {
                    console.error('Cloud save error:', err);
                    // Backup save to local
                    localStorage.setItem('candy_save', JSON.stringify(data));
                }
                resolve();
            });
        });
    }

    static async loadProgress(): Promise<PlayerProgress | null> {
        // 1. Check LocalStorage first (sync) for instant load capability or fallback
        const localData = localStorage.getItem('candy_save');
        let parsedLocal = null;
        if (localData) {
            try { parsedLocal = JSON.parse(localData); } catch {}
        }

        // 2. If not in Telegram or old version, return local data
        if (!TG?.CloudStorage || !TG.isVersionAtLeast('6.9')) {
            return parsedLocal;
        }

        // 3. Try CloudStorage with a timeout
        return new Promise((resolve) => {
            let isResolved = false;

            // Timeout safety: if Telegram doesn't answer in 1.5s, use local data
            const timeoutId = setTimeout(() => {
                if (!isResolved) {
                    console.warn('CloudStorage timed out, using local data');
                    isResolved = true;
                    resolve(parsedLocal);
                }
            }, 1500);

            TG.CloudStorage.getItem('candy_save', (err, val) => {
                if (isResolved) return; // Already handled by timeout
                
                clearTimeout(timeoutId);
                isResolved = true;

                if (!err && val) {
                    try {
                        resolve(JSON.parse(val));
                    } catch {
                        resolve(parsedLocal);
                    }
                } else {
                    // If error or empty, return local data (could be first run or offline)
                    resolve(parsedLocal);
                }
            });
        });
    }
}
