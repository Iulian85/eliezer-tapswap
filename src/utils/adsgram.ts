
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
 * Shows an Adsgram ad using the official integration.
 * Relying strictly on the blockId "int-17151" to handle ad serving logic.
 */
export const showAd = async (): Promise<boolean> => {
  // 1. Check if script is loaded
  if (typeof window === 'undefined' || !window.Adsgram) {
    console.error('Adsgram script not loaded. Make sure <script src="https://adsgram.ai/js/adsgram.js"> is in index.html');
    return true; // Fail safe: let user play
  }

  try {
    // 2. Initialize strictly with your Block ID
    const AdController = window.Adsgram.init({ 
        blockId: "int-17151"
    });
    
    // 3. Show Ad and handle native events
    return new Promise((resolve) => {
      AdController.show()
        .then((result: any) => {
          // Ad watched successfully (reward)
          console.log('Adsgram: Ad completed', result);
          resolve(true);
        })
        .catch((result: any) => {
          // Ad skipped, error, or no fill
          // We log the raw result from Adsgram so you can see exactly why it failed in console
          console.log('Adsgram result:', result);
          
          // We resolve true to ensure the game doesn't freeze even if ad fails
          resolve(true);
        });
    });
  } catch (e) {
    console.error('Adsgram critical error:', e);
    return true;
  }
};
