import { PlayerProgress } from './types';

const TG = window.Telegram.WebApp;

export class TelegramService {
    static init() {
        TG.ready();
        TG.expand();
        TG.enableClosingConfirmation();
        
        // Set header color to match app
        TG.setHeaderColor('#2c3e50');
        TG.setBackgroundColor('#2c3e50');
    }

    static get user() {
        return TG.initDataUnsafe?.user;
    }

    static haptic(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') {
        TG.HapticFeedback.impactOccurred(style);
    }

    static notification(type: 'success' | 'warning' | 'error') {
        TG.HapticFeedback.notificationOccurred(type);
    }

    static async saveProgress(data: PlayerProgress) {
        if (!TG.CloudStorage) {
            localStorage.setItem('candy_save', JSON.stringify(data));
            return;
        }
        
        return new Promise<void>((resolve, reject) => {
            TG.CloudStorage.setItem('candy_save', JSON.stringify(data), (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    static async loadProgress(): Promise<PlayerProgress | null> {
        if (!TG.CloudStorage) {
            const local = localStorage.getItem('candy_save');
            return local ? JSON.parse(local) : null;
        }

        return new Promise((resolve) => {
            TG.CloudStorage.getItem('candy_save', (err, val) => {
                if (!err && val) {
                    try {
                        resolve(JSON.parse(val));
                    } catch {
                        resolve(null);
                    }
                } else {
                    resolve(null);
                }
            });
        });
    }
}