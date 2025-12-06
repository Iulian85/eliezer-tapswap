
export interface AdController {
  show: () => Promise<void>;
}

declare global {
  interface Window {
    Adsgram?: {
        init: (params: { blockId: string; debug?: boolean }) => AdController;
    };
  }
}

/**
 * Shows an Adsgram ad.
 * Returns true if the ad was shown/completed/skipped (flow should continue).
 * Returns true even on error to prevent blocking the user flow.
 */
export const showAd = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !window.Adsgram) {
    console.warn('Adsgram script not loaded or running in non-browser env');
    return true; // Fail safe: let user proceed
  }

  try {
    const AdController = window.Adsgram.init({ blockId: "int-17151" });
    
    return new Promise((resolve) => {
      AdController.show()
        .then(() => {
          // Ad finished or skipped successfully
          resolve(true);
        })
        .catch((result: any) => {
          // Ad error (e.g. no fill, load error)
          // We log it but resolve true so the game doesn't hang
          console.warn('Adsgram error:', result);
          resolve(true);
        });
    });
  } catch (e) {
    console.error('Adsgram init error:', e);
    return true;
  }
};
