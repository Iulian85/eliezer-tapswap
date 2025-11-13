import { useCallback, useEffect, useRef } from 'react';
import type { AdController, ShowPromiseResult } from '../types/adsgram';

export interface useAdsgramParams {
  blockId: string;
  onError?: (result: ShowPromiseResult) => void;
}

export function useAdsgram({ blockId, onError }: useAdsgramParams) {
  const AdControllerRef = useRef<AdController | undefined>(undefined);

  useEffect(() => {
    if (window.Adsgram) {
      AdControllerRef.current = window.Adsgram.init({ blockId });
    }
  }, [blockId]);

  return useCallback((onReward: () => void) => {
    if (AdControllerRef.current) {
      AdControllerRef.current
        .show()
        .then(() => {
          onReward();
        })
        .catch((result: ShowPromiseResult) => {
          console.error('Adsgram error:', result);
          onError?.(result);
        });
    } else {
      console.warn('Adsgram script not loaded. Simulating reward for development.');
      onReward();
    }
  }, [onError]);
}

