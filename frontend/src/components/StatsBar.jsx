import React from 'react';
import { Lock, FileText, Cpu, ShieldCheck } from 'lucide-react';

export function StatsBar({ tasks = [] }) {
  const totalEscrow = tasks.reduce((sum, t) => sum + (Number(t.escrow_amount) || 0), 0);
  const activeBounties = tasks.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
  const awaitingPayout = tasks.filter(t => t.status === 'AWAITING_PAYOUT').length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Total Escrow */}
      <div className="glass-panel rounded-2xl p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-blue/5 rounded-full blur-2xl group-hover:bg-cyber-blue/10 transition-colors"></div>
        <div className="flex items-center justify-between relative z-10">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Vaulted Escrow</span>
          <div className="p-1.5 rounded-lg bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/20">
            <Lock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2 relative z-10">
          <span className="text-3xl font-display font-bold text-white tracking-tight">{totalEscrow.toLocaleString()}</span>
          <span className="text-xs text-cyber-blue font-mono font-bold">GEN</span>
        </div>
        <span className="text-[10px] text-slate-500 mt-2 block font-mono relative z-10">Multi-sig protected</span>
      </div>

      {/* Active Localization Tasks */}
      <div className="glass-panel rounded-2xl p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-green/5 rounded-full blur-2xl group-hover:bg-cyber-green/10 transition-colors"></div>
        <div className="flex items-center justify-between relative z-10">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Active Bounties</span>
          <div className="p-1.5 rounded-lg bg-cyber-green/10 text-cyber-green border border-cyber-green/20">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2 relative z-10">
          <span className="text-3xl font-display font-bold text-white tracking-tight">{activeBounties}</span>
          <span className="text-xs text-cyber-green font-mono font-bold">TASKS</span>
        </div>
        <span className="text-[10px] text-slate-500 mt-2 block font-mono relative z-10">Open & in-progress</span>
      </div>

      {/* Awaiting Payout / 24h Window */}
      <div className="glass-panel rounded-2xl p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors"></div>
        <div className="flex items-center justify-between relative z-10">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">24h Cooling-Off</span>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Cpu className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2 relative z-10">
          <span className="text-3xl font-display font-bold text-white tracking-tight">{awaitingPayout}</span>
          <span className="text-xs text-amber-400 font-mono font-bold">PENDING</span>
        </div>
        <span className="text-[10px] text-slate-500 mt-2 block font-mono relative z-10">Dispute window active</span>
      </div>

      {/* 20% Stake / Slashing Pool */}
      <div className="glass-panel rounded-2xl p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-purple/5 rounded-full blur-2xl group-hover:bg-cyber-purple/10 transition-colors"></div>
        <div className="flex items-center justify-between relative z-10">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Game-Theoretic</span>
          <div className="p-1.5 rounded-lg bg-cyber-purple/10 text-cyber-purple border border-cyber-purple/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2 relative z-10">
          <span className="text-3xl font-display font-bold text-white tracking-tight">20%</span>
          <span className="text-xs text-cyber-purple font-mono font-bold">STAKE</span>
        </div>
        <span className="text-[10px] text-slate-500 mt-2 block font-mono relative z-10">Slashing penalty defense</span>
      </div>
    </div>
  );
}
