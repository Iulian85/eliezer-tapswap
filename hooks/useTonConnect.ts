import { useEffect, useState, useMemo } from 'react';
import { THEME, TonConnectUI, Wallet } from '../types/ton';

// Hold a singleton instance of TonConnectUI
let tonConnectUI: TonConnectUI | null = null;

export function useTonConnect() {
  // We use state to trigger re-renders when the wallet state changes
  const [wallet, setWallet] = useState<Wallet | null>(null);

  // Initialize TonConnectUI only once
  useMemo(() => {
    if (typeof window !== 'undefined' && window.TonConnectUI && !tonConnectUI) {
      tonConnectUI = new window.TonConnectUI({
        manifestUrl: new URL('/tonconnect-manifest.json', window.location.origin).toString(),
        uiPreferences: {
          theme: THEME.DARK,
        },
      });
    }
  }, []);

  useEffect(() => {
    if (!tonConnectUI) {
      return;
    }

    // Subscribe to wallet connection status changes
    const unsubscribe = tonConnectUI.onStatusChange(
      (walletInfo) => {
        setWallet(walletInfo);
      }
    );
    
    // Check for an already connected wallet on mount
    if (tonConnectUI.wallet) {
      setWallet(tonConnectUI.wallet);
    }

    return () => {
      // Clean up subscription
      unsubscribe();
    };
  }, []);

  return {
    tonConnectUI,
    wallet,
    connected: !!wallet
  };
}