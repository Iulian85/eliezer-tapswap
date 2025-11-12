import React from 'react';
import { useTonConnect } from '../hooks/useTonConnect';
import { WalletIcon } from './Icons';

// Helper to shorten address
const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export const TonConnectButton: React.FC = () => {
  const { tonConnectUI, wallet, connected } = useTonConnect();

  const handleConnect = async () => {
    if (tonConnectUI && !connected) {
      await tonConnectUI.connectWallet();
    }
  };

  const handleDisconnect = async () => {
    if (tonConnectUI && connected) {
      await tonConnectUI.disconnect();
    }
  };

  if (connected && wallet) {
    return (
      <button 
        onClick={handleDisconnect}
        className="flex items-center gap-2 bg-green-500/20 text-green-300 px-3 py-2 rounded-full text-sm font-bold border border-green-500/50 hover:bg-green-500/40 transition-colors"
      >
        <WalletIcon className="w-5 h-5" />
        <span>{shortenAddress(wallet.account.address)}</span>
      </button>
    );
  }

  return (
    <button 
      onClick={handleConnect}
      className="flex items-center gap-2 bg-cyan-500/20 text-cyan-300 px-3 py-2 rounded-full text-sm font-bold border border-cyan-500/50 hover:bg-cyan-500/40 transition-colors"
    >
      <WalletIcon className="w-5 h-5" />
      <span>Connect Wallet</span>
    </button>
  );
};