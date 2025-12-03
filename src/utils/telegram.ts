import WebApp from '@twa-dev/sdk';

declare global {
  interface Window {
    Telegram?: {
        WebApp: any;
    };
  }
}

export const tg = WebApp;

export const initTelegram = () => {
  // Safe check for browser environment
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    tg.ready();
    tg.expand();
    try {
      tg.setHeaderColor('#1a0033'); 
      tg.setBackgroundColor('#1a0033');
    } catch (e) {
      console.log('Theme params not supported in this version');
    }
  }
};

export const hapticFeedback = (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
  if (tg.HapticFeedback) {
    tg.HapticFeedback.impactOccurred(style);
  }
};

export const hapticNotify = (type: 'error' | 'success' | 'warning') => {
  if (tg.HapticFeedback) {
    tg.HapticFeedback.notificationOccurred(type);
  }
};

// Cloud Storage Wrapper
export const storage = {
  setItem: async (key: string, value: string) => {
    try {
      if (tg.CloudStorage) {
        return new Promise<void>((resolve, reject) => {
          tg.CloudStorage.setItem(key, value, (err, stored) => {
            if (err) reject(err);
            else resolve();
          });
        });
      } else {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn('Storage error', e);
    }
  },
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (tg.CloudStorage) {
        return new Promise((resolve, reject) => {
          tg.CloudStorage.getItem(key, (err, value) => {
            if (err) reject(err);
            else resolve(value || null);
          });
        });
      } else {
        return localStorage.getItem(key);
      }
    } catch (e) {
      return null;
    }
  }
};