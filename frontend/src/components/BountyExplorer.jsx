import React, { useState } from 'react';
import { Search, Filter, Globe, ArrowRight, ShieldCheck, Clock, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';

export function BountyExplorer({ tasks = [], onSelectTask }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [langFilter, setLangFilter] = useState('ALL');

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.target_lang.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.guidelines.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
    const matchesLang = langFilter === 'ALL' || task.target_lang.toLowerCase().includes(langFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesLang;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">OPEN</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">IN PROGRESS</span>;
      case 'AWAITING_PAYOUT':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">24H PAYOUT</span>;
      case 'NEEDS_REVISION':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/30">REVISION</span>;
      case 'ESCALATED':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">ESCALATED</span>;
      case 'CLOSED':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-slate-700 text-slate-300 border border-slate-600">CLOSED</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-slate-800 text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Header */}
      <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search language, task ID, keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto font-mono text-xs">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'AWAITING_PAYOUT', 'NEEDS_REVISION', 'ESCALATED', 'CLOSED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg transition ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bounty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => {
            const minStake = Math.floor(Number(task.escrow_amount) * 0.2);

            return (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className="bg-slate-850 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/40 rounded-xl p-5 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-indigo-950/20 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Meta */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-indigo-400 truncate max-w-[170px]">
                      {task.id}
                    </span>
                    {getStatusBadge(task.status)}
                  </div>

                  {/* Language Direction */}
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="font-bold text-sm text-slate-100">{task.target_lang}</span>
                  </div>

                  {/* Guidelines Snippet */}
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed font-sans">
                    {task.guidelines}
                  </p>

                  {/* Blacklist Warning */}
                  {task.blacklist_words && task.blacklist_words !== 'none' && (
                    <div className="text-[11px] font-mono text-rose-400/90 bg-rose-950/30 px-2 py-1 rounded border border-rose-900/40 mb-3 truncate">
                      Blacklist: {task.blacklist_words}
                    </div>
                  )}
                </div>

                {/* Bottom Financials & CTA */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold font-mono text-slate-100">{task.escrow_amount}</span>
                      <span className="text-xs font-semibold text-indigo-400 font-mono">GEN</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 block">Stake: {minStake} GEN (20%)</span>
                  </div>

                  <button className="px-3 py-1.5 rounded-lg bg-indigo-600/10 group-hover:bg-indigo-600 text-indigo-400 group-hover:text-white text-xs font-mono font-medium transition flex items-center gap-1 border border-indigo-500/20 group-hover:border-indigo-500">
                    <span>Task Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center bg-slate-850 rounded-xl border border-slate-850">
            <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm text-slate-300 font-medium">No localization bounties found</p>
            <p className="text-xs text-slate-500 font-mono mt-1">Try adjusting your search query or filter tags.</p>
          </div>
        )}
      </div>
    </div>
  );
}
