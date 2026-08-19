import React from 'react';
import { Lock, FileText, Cpu, AlertTriangle, ShieldCheck } from 'lucide-react';

export function StatsBar({ tasks = [] }) {
  const totalEscrow = tasks.reduce((sum, t) => sum + (Number(t.escrow_amount) || 0), 0);
  const activeBounties = tasks.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
  const awaitingPayout = tasks.filter(t => t.status === 'AWAITING_PAYOUT').length;
  const slashedOrDisputed = tasks.filter(t => t.status === 'ESCALATED' || (t.status === 'CLOSED' && t.verdict === 'REFUND')).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 my-6">
      {/* Total Escrow */}
      <div className="bg-slate-850/80 rounded-xl p-4 border border-slate-800 backdrop-blur-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Vaulted Escrow</span>
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Lock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-100 tracking-tight font-mono">{totalEscrow.toLocaleString()}</span>
          <span className="text-xs text-indigo-400 font-semibold">GEN</span>
        </div>
        <span className="text-[11px] text-slate-500 mt-1 block">Smart contract multi-sig protection</span>
      </div>

      {/* Active Localization Tasks */}
      <div className="bg-slate-850/80 rounded-xl p-4 border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Active Bounties</span>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-100 tracking-tight font-mono">{activeBounties}</span>
          <span className="text-xs text-emerald-400 font-medium">tasks active</span>
        </div>
        <span className="text-[11px] text-slate-500 mt-1 block">Open & in-progress subtitles</span>
      </div>

      {/* Awaiting Payout / 24h Window */}
      <div className="bg-slate-850/80 rounded-xl p-4 border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">24h Cooling-Off</span>
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <Cpu className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-100 tracking-tight font-mono">{awaitingPayout}</span>
          <span className="text-xs text-amber-400 font-medium">pending finalization</span>
        </div>
        <span className="text-[11px] text-slate-500 mt-1 block">AI-approved, dispute window active</span>
      </div>

      {/* 20% Stake / Slashing Pool */}
      <div className="bg-slate-850/80 rounded-xl p-4 border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Game-Theoretic Stake</span>
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-100 tracking-tight font-mono">20% Collateral</span>
        </div>
        <span className="text-[11px] text-slate-500 mt-1 block">2 consecutive fails slash stake</span>
      </div>
    </div>
  );
}
