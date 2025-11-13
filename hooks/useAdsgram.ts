

import { useCallback, useEffect, useRef } from 'react';
import type { ShowPromiseResult } from '../types/adsgram';

export interface UseAdsgramParams {
  blockId: string;
  onError?: (error: ShowPromiseResult) => void;
}

// Heuristic to check if the app is running inside the real Telegram environment.
const isTelegramEnv = !!(window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe);

export function useAdsgram({ blockId, onError }: UseAdsgramParams) {
  const adControllerRef = useRef<{ show: () => Promise<ShowPromiseResult> } | null>(null);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);
  
  useEffect(() => {
    // Prevent re-initialization
    if (adControllerRef.current) return;

    if (!isTelegramEnv) {
        console.warn('Adsgram: Not in Telegram environment. Using mock ad controller.');
        adControllerRef.current = {
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
                adControllerRef.current = window.adsgram.init({ blockId });
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
    if (adControllerRef.current) {
      adControllerRef.current.show().then(result => {
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
       // If the ad controller isn't initialized, do not grant the reward.
       // Instead, inform the user that the ad service is unavailable.
       const errorResult: ShowPromiseResult = {
           isSuccess: false,
           description: 'Ad service is not available. Please try again later.'
       };
       console.error('Adsgram is not initialized. Cannot show ad.');
       onErrorRef.current?.(errorResult);
    }
  }, []);
}