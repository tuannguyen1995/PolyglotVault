import React, { useState } from 'react';
import { Search, Globe, ArrowRight, AlertCircle, Plus } from 'lucide-react';

export function BountyExplorer({ tasks = [], onSelectTask, onOpenCreateModal }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.target_lang.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.guidelines.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/30 shadow-[0_0_10px_rgba(0,240,255,0.2)]">OPEN</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse">IN PROGRESS</span>;
      case 'AWAITING_PAYOUT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-cyber-green/10 text-cyber-green border border-cyber-green/30 shadow-[0_0_10px_rgba(0,255,102,0.2)]">24H PAYOUT</span>;
      case 'NEEDS_REVISION':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30">REVISION</span>;
      case 'ESCALATED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-cyber-pink/10 text-cyber-pink border border-cyber-pink/30 shadow-[0_0_10px_rgba(255,0,85,0.2)]">ESCALATED</span>;
      case 'CLOSED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-slate-800 text-slate-400 border border-slate-700">CLOSED</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-slate-800 text-slate-400 border border-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="glass-panel p-2 rounded-2xl flex flex-col md:flex-row gap-2 items-center justify-between">
        <div className="relative w-full md:w-96 flex-shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search language, task ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyber-blue/50 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto font-mono text-[10px] uppercase tracking-wider overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'AWAITING_PAYOUT', 'ESCALATED', 'CLOSED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                  : 'bg-black/40 text-slate-400 hover:text-white border border-white/5 hover:border-white/20'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Bounty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => {
            const minStake = Math.floor(Number(task.escrow_amount) * 0.2);

            return (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className="glass-panel hover:bg-slate-900/80 border border-white/5 hover:border-cyber-blue/40 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,240,255,0.1)] flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Decorative corner accents */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-white/10 group-hover:border-cyber-blue/40 rounded-tl-2xl transition-colors"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-white/10 group-hover:border-cyber-blue/40 rounded-br-2xl transition-colors"></div>

                <div>
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-cyber-blue transition-colors truncate max-w-[170px]">
                      {task.id}
                    </span>
                    {getStatusBadge(task.status)}
                  </div>

                  <div className="flex items-center gap-2 mb-4 relative z-10">
                    <Globe className="w-5 h-5 text-cyber-purple flex-shrink-0" />
                    <span className="font-display font-bold text-lg text-white tracking-tight leading-tight">{task.target_lang}</span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed relative z-10 font-sans">
                    {task.guidelines}
                  </p>

                  {task.blacklist_words && task.blacklist_words !== 'none' && (
                    <div className="text-[10px] font-mono text-cyber-pink bg-cyber-pink/5 px-2.5 py-1.5 rounded border border-cyber-pink/20 mb-4 truncate relative z-10">
                      BLK: {task.blacklist_words}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-display font-bold text-white tracking-tight">{task.escrow_amount}</span>
                      <span className="text-[10px] font-bold text-cyber-blue font-mono">GEN</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 block">Stake: {minStake} GEN</span>
                  </div>

                  <button className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-cyber-blue text-slate-300 group-hover:text-black flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center glass-panel rounded-2xl border border-white/5 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-lg font-display text-white font-bold mb-1">No bounties found</p>
            <p className="text-xs text-slate-400 font-mono mb-6">Adjust your filters or create a new localization task.</p>
            <button
              onClick={onOpenCreateModal}
              className="px-6 py-2.5 rounded-full bg-cyber-blue text-black hover:bg-white text-xs font-display font-bold transition flex items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Bounty</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
