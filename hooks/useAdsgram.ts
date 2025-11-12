

import { useCallback, useEffect, useRef } from 'react';
import type { ShowPromiseResult } from '../types/adsgram';

export interface UseAdsgramParams {
  blockId: string;
  onError?: (error: ShowPromiseResult) => void;
}

let adController: { show: () => Promise<ShowPromiseResult> } | null = null;

// Heuristic to check if the app is running inside the real Telegram environment.
const isTelegramEnv = !!(window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe);

export function useAdsgram({ blockId, onError }: UseAdsgramParams) {
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);
  
  useEffect(() => {
    if (adController) return;

    if (!isTelegramEnv) {
        console.warn('Adsgram: Not in Telegram environment. Using mock ad controller.');
        adController = {
            show: () => {
                console.log("Showing mock ad for development.");
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve({ isSuccess: true, description: "Mock ad shown successfully." });
                    }, 500); // Simulate a short delay
                });
            }
        };
        return;
    }

    // In Telegram env, poll for the SDK, as it loads its own scripts asynchronously.
    let attempts = 0;
    const maxAttempts = 50; // Poll for 5 seconds
    const intervalId = setInterval(() => {
        attempts++;
        if (window.adsgram) {
            clearInterval(intervalId);
            try {
                adController = window.adsgram.init({ blockId });
                console.log("Adsgram SDK initialized.");
            } catch (e) {
                console.error("Adsgram SDK initialization failed:", e);
            }
        } else if (attempts >= maxAttempts) {
            clearInterval(intervalId);
            console.error('Adsgram SDK not found on window object.');
        }
    }, 100);

    return () => {
        if (intervalId) {
            clearInterval(intervalId);
        }
    };
  }, [blockId]);

  return useCallback((onReward: () => void) => {
    if (adController) {
      adController.show().then(result => {
        if (result.isSuccess) {
          onReward();
        } else {
          console.error('Adsgram error:', result);
          onErrorRef.current?.(result);
        }
      }).catch(err => {
        const errorResult: ShowPromiseResult = {
          isSuccess: false,
          description: err.message || 'An unknown error occurred while showing the ad.'
        };
        console.error('Adsgram ad promise rejected:', errorResult);
        onErrorRef.current?.(errorResult);
      });
    } else {
       // This fallback will now primarily be hit if the SDK fails to initialize inside Telegram.
       // For local dev, adController will be mocked.
       console.warn('Adsgram is not initialized. Simulating reward as a fallback.');
       onReward();
    }
  }, []);
}
