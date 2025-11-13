import { useCallback, useEffect, useRef } from 'react';
import type { ShowPromiseResult } from '../types/adsgram';

export interface UseAdsgramParams {
  blockId: string;
  onError?: (error: ShowPromiseResult) => void;
}

export function useAdsgram({ blockId, onError }: UseAdsgramParams) {
  const adControllerRef = useRef<{ show: () => Promise<ShowPromiseResult> } | null>(null);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);
  
  useEffect(() => {
    // A simple, one-time initialization attempt based on the user's provided working example.
    if (window.adsgram && !adControllerRef.current) {
      try {
        console.log("Adsgram: Initializing SDK...");
        adControllerRef.current = window.adsgram.init({ blockId });
        console.log("Adsgram: SDK Initialized.");
      } catch (e) {
        console.error("Adsgram: SDK initialization failed", e);
      }
    } else if (!window.adsgram) {
      console.warn("Adsgram: SDK script not found on window object.");
    }
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
       // This is the key change to match the user's desired behavior.
       // Instead of showing an error, we simulate the reward for development/testing
       // if the ad controller is not available. This prevents blocking.
       console.warn('Adsgram is not initialized. Simulating reward for development.');
       onReward();
    }
  }, []);
}
