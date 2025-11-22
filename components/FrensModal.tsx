
import React, { useState } from 'react';
import { X, Copy, Users, Gift, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { UserStats, Friend } from '../types';

interface FrensModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
  onRedeemCode: (code: string) => { success: boolean; message: string; reward?: { coins: number; bomb: number } };
}

export const FrensModal: React.FC<FrensModalProps> = ({ isOpen, onClose, stats, onRedeemCode }) => {
  const [inputCode, setInputCode] = useState('');
  const [redeemStatus, setRedeemStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (stats.referralCode) {
      navigator.clipboard.writeText(`Join me on Eliezer Rush! Use my code: ${stats.referralCode}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = () => {
    if (!inputCode.trim()) return;
    
    const result = onRedeemCode(inputCode.trim());
    setRedeemStatus({
        type: result.success ? 'success' : 'error',
        message: result.message
    });
    
    if (result.success) {
        setInputCode('');
    }
  };

  return (
    <div className="absolute inset-0 z-[100] flex items-start justify-center bg-[#2c1b4e] animate-in fade-in duration-200 overflow-y-auto custom-scrollbar">
      <div className="w-full max-w-md p-6 flex flex-col gap-6 min-h-full pb-10">
         
         {/* Header */}
         <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                 <div className="p-2 bg-purple-500/20 rounded-xl border border-purple-500/30">
                    <Users size={24} className="text-purple-300" />
                 </div>
                 <div>
                     <h1 className="text-3xl font-black text-white drop-shadow-lg">Frens</h1>
                     <p className="text-white/60 text-xs font-bold uppercase tracking-wide">Invite & Earn</p>
                 </div>
             </div>
             <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors">
                 <X size={24} />
             </button>
         </div>

         {/* Your Code Section */}
         <div className="bg-gradient-to-br from-purple-900/50 to-black/40 rounded-2xl p-5 border border-white/10 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-2 opacity-10 transform translate-x-4 -translate-y-4">
                 <Gift size={100} />
             </div>
             
             <h3 className="text-white/80 text-sm font-bold mb-3">Your Referral Code</h3>
             <div className="flex items-center gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
                 <div className="flex-1 px-3 py-2 font-mono text-xl font-black text-white tracking-wider text-center uppercase">
                     {stats.referralCode || 'LOADING...'}
                 </div>
                 <button 
                    onClick={handleCopy}
                    className={`p-3 rounded-lg transition-all font-bold text-sm flex items-center gap-2
                        ${copied ? 'bg-green-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                 >
                     {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                 </button>
             </div>
             <p className="text-center text-white/40 text-xs mt-3">
                 Share this code. You get bonuses when friends join!
             </p>
         </div>

         {/* Redeem Code Section */}
         <div className="bg-black/20 rounded-2xl p-5 border border-white/10">
             <h3 className="text-white/80 text-sm font-bold mb-3 flex items-center gap-2">
                 <Gift size={16} className="text-yellow-400" /> 
                 Enter Friend's Code
             </h3>
             
             {stats.redeemedReferralCode ? (
                 <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
                     <CheckCircle className="text-green-400 shrink-0" size={24} />
                     <div>
                         <div className="text-green-200 font-bold text-sm">Code Redeemed!</div>
                         <div className="text-green-200/60 text-xs">You are referred by: <span className="font-mono text-white/80">{stats.redeemedReferralCode}</span></div>
                     </div>
                 </div>
             ) : (
                 <div className="flex flex-col gap-3">
                     <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={inputCode}
                            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                            placeholder="Ex: CANDY123"
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold placeholder:text-white/20 focus:outline-none focus:border-purple-500 transition-colors uppercase"
                        />
                        <button 
                            onClick={handleSubmit}
                            disabled={!inputCode}
                            className={`px-4 rounded-xl font-bold text-white transition-all flex items-center gap-2
                                ${inputCode ? 'bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-500/20' : 'bg-white/5 text-white/30 cursor-not-allowed'}`}
                        >
                            <Send size={18} />
                        </button>
                     </div>
                     
                     {redeemStatus.message && (
                         <div className={`text-xs font-bold flex items-center gap-1.5 animate-in slide-in-from-top-1
                             ${redeemStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                             {redeemStatus.type === 'success' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                             {redeemStatus.message}
                         </div>
                     )}
                     <p className="text-white/30 text-[10px]">Enter a code to receive <span className="text-yellow-400">500 Coins</span> & <span className="text-red-400">1 Bomb</span>.</p>
                 </div>
             )}
         </div>

         {/* Friends List */}
         <div className="flex-1 flex flex-col">
             <h3 className="text-white/80 text-sm font-bold mb-3">Your Frens ({stats.friends?.length || 0})</h3>
             
             <div className="flex-1 min-h-[150px] bg-black/20 rounded-2xl border border-white/10 overflow-hidden flex flex-col">
                 {!stats.friends || stats.friends.length === 0 ? (
                     <div className="flex-1 flex flex-col items-center justify-center text-center p-6 opacity-50">
                         <Users size={48} className="text-white/20 mb-3" />
                         <p className="text-white/60 font-medium text-sm">No frens yet.</p>
                         <p className="text-white/30 text-xs">Invite people to earn rewards!</p>
                     </div>
                 ) : (
                     <div className="overflow-y-auto p-2 space-y-2 custom-scrollbar">
                         {stats.friends.map((friend) => (
                             <div key={friend.id} className="bg-white/5 hover:bg-white/10 rounded-xl p-3 flex items-center justify-between transition-colors border border-white/5">
                                 <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                                         {friend.name.charAt(0)}
                                     </div>
                                     <div>
                                         <div className="text-sm font-bold text-white">{friend.name}</div>
                                         <div className="text-[10px] text-white/40">{friend.date}</div>
                                     </div>
                                 </div>
                                 <div className="flex items-center gap-1 bg-green-500/20 px-2 py-1 rounded-lg border border-green-500/30">
                                     <span className="text-[10px] font-bold text-green-300">+{friend.bonusEarned}</span>
                                     <Gift size={10} className="text-green-300" />
                                 </div>
                             </div>
                         ))}
                     </div>
                 )}
             </div>
         </div>

      </div>
    </div>
  );
};
