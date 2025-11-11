import { useCallback, useEffect, useRef } from 'react';
import type { ShowPromiseResult } from '../types/adsgram';

export interface UseAdsgramParams {
  blockId: string;
  onError?: (error: ShowPromiseResult) => void;
}

// Keep a global reference to the initialized ad controller
// to avoid re-initializing on every component mount.
let adController: { show: () => Promise<ShowPromiseResult> } | null = null;

export function useAdsgram({ blockId, onError }: UseAdsgramParams) {
  const onErrorRef = useRef(onError);
  
  // Keep onError callback up-to-date
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);
  
  // Initialize the SDK once
  useEffect(() => {
    if (adController) return;

    let attempts = 0;
    const maxAttempts = 10;
    const interval = setInterval(() => {
      attempts++;
      if (window.adsgram) {
        clearInterval(interval);
        try {
          adController = window.adsgram.init({ blockId });
        } catch (e) {
          console.error("Adsgram initialization failed", e);
        }
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        console.error('Adsgram SDK could not be found on window object.');
      }
    }, 200);

    return () => clearInterval(interval);
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
        console.error('Ad error:', err);
        const errorResult: ShowPromiseResult = {
          isSuccess: false,
          description: err.message || 'An unknown error occurred while showing the ad.'
        };
        onErrorRef.current?.(errorResult);
      });
    } else {
      console.warn('Adsgram is not initialized. Simulating reward for development.');
      // Fallback for development outside of Telegram or if SDK fails to init
      onReward();
    }
  }, []);
}
