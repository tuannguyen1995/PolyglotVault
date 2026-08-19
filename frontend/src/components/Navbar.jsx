import React from 'react';
import { Globe, ShieldCheck, Cpu, Wallet, Layers, RefreshCw } from 'lucide-react';

export function Navbar({ currentRole, setCurrentRole, onOpenCreateModal, onResetDemo }) {
  const roles = [
    { id: 'publisher', label: 'Publisher', color: 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30' },
    { id: 'translator', label: 'Translator (20% Stake)', color: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30' },
    { id: 'admin', label: 'Platform Admin', color: 'bg-purple-600/20 text-purple-400 border-purple-500/30' },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-indigo-400/30">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-100 tracking-tight">PolyglotVault</span>
              <span className="px-2 py-0.5 text-xs font-mono font-medium rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                <Cpu className="w-3 h-3 animate-pulse text-indigo-400" />
                GenLayer Studionet
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono hidden sm:block">AI-Adjudicated Localization Escrow</p>
          </div>
        </div>

        {/* Action Controls & Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Active Persona Switcher */}
          <div className="hidden md:flex items-center bg-slate-850 p-1 rounded-lg border border-slate-800 text-xs font-medium">
            <span className="px-2 text-slate-400 text-[11px] uppercase tracking-wider font-mono">Role:</span>
            {roles.map(r => (
              <button
                key={r.id}
                onClick={() => setCurrentRole(r.id)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  currentRole === r.id
                    ? `${r.color} font-semibold border shadow-sm`
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={onResetDemo}
            title="Reset Mock Tasks to Defaults"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Create Task Button */}
          <button
            onClick={onOpenCreateModal}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition shadow-lg shadow-indigo-600/20 border border-indigo-400/30 flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4" />
            <span>Create Bounty</span>
          </button>

          {/* Mock Connected Wallet */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-850 border border-slate-700 text-xs font-mono text-slate-300">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <Wallet className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {currentRole === 'publisher' && '0x71c...99a2 (Pub)'}
              {currentRole === 'translator' && '0x3f2...88cc (Trans)'}
              {currentRole === 'admin' && '0xadmin...0001 (Admin)'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
