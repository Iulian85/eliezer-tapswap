
import React, { useState } from 'react';
import { X, Copy, Zap, Star, ChevronLeft } from 'lucide-react';
import { UserStats } from '../types';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string | null;
  stats: UserStats;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, walletAddress, stats }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Helper to format seconds into 5h 21m
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  // Calculate Shares
  const sharesFromScore = stats.totalScore; // 1 score = 1 share
  const sharesFromReferrals = stats.referrals * 10000;
  const sharesFromAds = stats.adsViewed * 500;
  const sharesFromTime = Math.floor(stats.totalTimePlayed / 60) * 10; // 10 shares per minute
  
  // High impact multiplier for paid contributions
  const sharesFromPurchase = Math.floor(stats.tonPurchases * 100000); 
  
  const totalShares = sharesFromScore + sharesFromReferrals + sharesFromAds + sharesFromTime + sharesFromPurchase;
  
  // Mock Estimate
  const estimatedELZR = (totalShares * 0.00000023).toFixed(2);

  return (
    <div className="absolute inset-0 z-[100] flex items-start justify-center bg-[#2c1b4e] animate-in fade-in duration-200 overflow-y-auto custom-scrollbar">
      <div className="w-full max-w-md p-6 flex flex-col gap-6 min-h-full pb-10">
         
         {/* Header with Back Button */}
         <div className="flex items-start gap-4">
             <button onClick={onClose} className="mt-1 p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors shrink-0">
                 <ChevronLeft size={24} />
             </button>
             <div className="flex-1">
                 <h1 className="text-3xl font-black text-white drop-shadow-lg">Wallet</h1>
                 <p className="text-white/60 text-sm font-medium">Your in-game assets and token information.</p>
             </div>
         </div>

         {/* Connected Wallet Card */}
         <div className="bg-black/30 rounded-2xl p-5 border border-white/10 shadow-xl">
             <div className="flex justify-between items-center mb-2">
                 <span className="text-white/60 text-sm font-bold uppercase tracking-wider">Connected Wallet</span>
                 <span className="text-cyan-200 font-bold text-xs bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30 uppercase">TON</span>
             </div>
             <div className="flex items-center gap-3">
                 <div className="flex-1 font-mono text-white font-bold truncate tracking-tight text-lg">
                     {walletAddress ? walletAddress : 'Not Connected'}
                 </div>
                 {walletAddress && (
                     <button onClick={handleCopy} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-white/80">
                         <Copy size={16} className={copied ? "text-green-400" : ""} />
                     </button>
                 )}
             </div>
         </div>

         {/* Balance Card */}
         <div className="bg-gradient-to-r from-black/40 to-black/20 rounded-2xl p-6 border border-white/10 shadow-xl flex items-center justify-between">
             <span className="text-white/80 font-bold text-lg">Your Balance</span>
             <div className="flex items-center gap-2">
                 <Zap className="text-yellow-400 fill-yellow-400 animate-pulse drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" size={24} />
                 <span className="text-3xl font-black text-white tracking-tight drop-shadow-md">{stats.totalScore.toLocaleString()}</span>
             </div>
         </div>

         {/* Airdrop Estimation */}
         <div className="bg-black/40 rounded-2xl p-1 border border-cyan-500/30 shadow-xl overflow-hidden">
            <div className="p-5 bg-gradient-to-b from-cyan-900/40 to-transparent">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-cyan-400/20 border border-cyan-400/30 flex items-center justify-center text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22v-9" />
                            <path d="M9 13.2l3-3 3 3" />
                            <path d="m12 2 2.4 7h4.8l-3.6 3.6 1.2 6.4-4.8-3.6L7.2 19l1.2-6.4-3.6-3.6h4.8z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-black text-cyan-100 tracking-wide drop-shadow-md">Airdrop Estimation</h3>
                </div>

                <div className="bg-black/50 rounded-xl p-6 text-center mb-6 border border-white/5 shadow-inner">
                    <div className="text-cyan-100/50 text-sm mb-1 font-medium uppercase tracking-wide">You will receive an estimated</div>
                    <div className="text-4xl font-black text-white mb-1 drop-shadow-lg">{estimatedELZR} <span className="text-cyan-400">ELZR</span></div>
                    <div className="text-white/40 text-xs font-medium">Based on your {totalShares.toLocaleString()} shares</div>
                </div>

                <div className="space-y-3 mb-4">
                    <p className="text-white/60 text-xs font-bold uppercase tracking-wider pl-1">Your total shares are calculated based on:</p>
                    
                    <StatRow label={`Score (${stats.totalScore.toLocaleString()})`} value={`${sharesFromScore.toLocaleString()} shares`} />
                    <StatRow label={`Referrals (${stats.referrals})`} value={`${sharesFromReferrals.toLocaleString()} shares`} />
                    <StatRow label={`Ads Viewed (${stats.adsViewed})`} value={`${sharesFromAds.toLocaleString()} shares`} />
                    <StatRow label={`Time Spent (${formatTime(stats.totalTimePlayed)})`} value={`${sharesFromTime.toLocaleString()} shares`} />
                    <StatRow label={`TON Purchases (${stats.tonPurchases.toFixed(2)})`} value={`${sharesFromPurchase.toLocaleString()} shares`} />
                </div>
                
                <p className="text-[10px] text-cyan-200/40 text-center leading-relaxed px-4 font-medium">
                    This is an estimate. The airdrop pool will be distributed over 10 years. Your final amount depends on your activity relative to the entire community's participation.
                </p>
            </div>
         </div>

         {/* Tokenomics */}
         <div className="bg-black/30 rounded-2xl p-5 border border-white/10 shadow-xl">
             <div className="flex items-center gap-2 mb-4">
                 <Star className="text-yellow-400 fill-yellow-400 drop-shadow-md" size={20} />
                 <h3 className="text-lg font-black text-white tracking-wide">Eliezer (ELZR) Tokenomics</h3>
             </div>

             <div className="space-y-2 bg-black/20 p-3 rounded-xl border border-white/5">
                 <TokenRow label="Total Supply:" value="21,000,000 ELZR" />
                 <TokenRow label="Airdrop Pool:" value="17,000,000 ELZR" highlight />
                 <TokenRow label="Team & Development:" value="4,000,000 ELZR" />
                 <div className="h-px bg-white/10 my-2" />
                 <TokenRow label="Generation Date:" value="11.07.2025" />
                 <TokenRow label="Blockchain:" value="TON Network" />
             </div>
         </div>

         <p className="text-center text-white/30 text-xs font-medium mt-2">Connect a real TON wallet for future airdrops.</p>
      </div>
    </div>
  );
};

const StatRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg border border-white/5 hover:bg-black/40 transition-colors">
        <span className="text-white/70 text-sm font-medium">{label}</span>
        <span className="text-white font-bold text-sm tabular-nums">{value}</span>
    </div>
);

const TokenRow: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
    <div className="flex justify-between items-center p-2 rounded hover:bg-white/5 transition-colors">
        <span className="text-white/60 text-sm font-medium">{label}</span>
        <span className={`text-sm font-bold tabular-nums ${highlight ? 'text-cyan-300' : 'text-white/90'}`}>{value}</span>
    </div>
);
