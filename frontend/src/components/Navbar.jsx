import React from 'react';
import { Globe, Cpu, Wallet, Layers, RefreshCw } from 'lucide-react';

export function Navbar({ currentRole, setCurrentRole, onOpenCreateModal, onResetDemo }) {
  const roles = [
    { id: 'publisher', label: 'Publisher', color: 'text-cyber-blue border-cyber-blue/30 bg-cyber-blue/10' },
    { id: 'translator', label: 'Translator', color: 'text-cyber-green border-cyber-green/30 bg-cyber-green/10' },
    { id: 'admin', label: 'Admin', color: 'text-cyber-purple border-cyber-purple/30 bg-cyber-purple/10' },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 pointer-events-none">
      <header className="pointer-events-auto glass-panel rounded-full px-4 sm:px-6 h-16 flex items-center justify-between w-full max-w-7xl cyber-border">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyber-purple to-cyber-blue flex items-center justify-center shadow-[0_0_15px_rgba(176,38,255,0.4)]">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-xl tracking-tight text-white glow-text hidden sm:block">PolyglotVault</span>
            <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-white/5 text-cyber-blue border border-cyber-blue/20 flex items-center gap-1 uppercase tracking-widest">
              <Cpu className="w-3 h-3 animate-pulse" />
              GenLayer
            </span>
          </div>
        </div>

        {/* Action Controls & Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Active Persona Switcher */}
          <div className="hidden md:flex items-center bg-black/40 p-1 rounded-full border border-white/5 text-xs font-medium">
            {roles.map(r => (
              <button
                key={r.id}
                onClick={() => setCurrentRole(r.id)}
                className={`px-4 py-1.5 rounded-full transition-all duration-300 font-mono text-[11px] uppercase tracking-wider ${
                  currentRole === r.id
                    ? `${r.color} shadow-[0_0_10px_currentColor]`
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-white/10 hidden sm:block"></div>

          <button
            onClick={onResetDemo}
            title="Reset Mock Tasks to Defaults"
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 rounded-full bg-white text-black hover:bg-slate-200 text-xs font-display font-bold transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          >
            <Layers className="w-4 h-4" />
            <span>Create Bounty</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/5 text-[10px] font-mono text-slate-300">
            <div className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
            <Wallet className="w-3 h-3 text-slate-400" />
            <span className="hidden sm:inline">
              {currentRole === 'publisher' && '0x71c...99a2'}
              {currentRole === 'translator' && '0x3f2...88cc'}
              {currentRole === 'admin' && '0xadmin...0001'}
            </span>
          </div>
        </div>
      </header>
    </div>
  );
}
