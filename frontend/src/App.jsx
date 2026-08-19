import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StatsBar } from './components/StatsBar';
import { BountyExplorer } from './components/BountyExplorer';
import { CreateTaskModal } from './components/CreateTaskModal';
import { TaskStudioModal } from './components/TaskStudioModal';
import { contractService } from './services/contractService';
import { Cpu, ShieldCheck, Sparkles, Terminal, BookOpen, Layers, CheckCircle2, Lock } from 'lucide-react';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState('translator'); // 'publisher' | 'translator' | 'admin'

  const refreshTasks = () => {
    setTasks(contractService.getTasks());
    if (selectedTask) {
      const updated = contractService.getTaskById(selectedTask.id);
      setSelectedTask(updated || null);
    }
  };

  useEffect(() => {
    refreshTasks();
  }, []);

  const handleCreateTask = async (taskData) => {
    const newTask = await contractService.createTask({
      ...taskData,
      senderAddress: currentRole === 'publisher' ? '0x71c...99a2' : '0x999...1111'
    });
    refreshTasks();
    setSelectedTask(newTask);
  };

  const handleUpdateTask = (updatedTask) => {
    refreshTasks();
    setSelectedTask(updatedTask);
  };

  const handleResetDemo = () => {
    contractService.resetDemo();
    refreshTasks();
    setSelectedTask(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        onOpenCreateModal={() => setIsCreateOpen(true)}
        onResetDemo={handleResetDemo}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        
        {/* Pitch Hero Card */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-850 to-slate-900 border border-indigo-500/20 p-6 md:p-8 shadow-xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-3xl space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Decentralized AI Adjudication & Localization Escrow</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight leading-snug">
              Autonomous Video Subtitle Escrow & Multi-Agent Quality Consensus
            </h1>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed font-sans">
              <strong>PolyglotVault</strong> eliminates centralized localization gatekeepers by running multi-agent linguistic and timing adjudication directly inside GenLayer consensus.
            </p>

            {/* GenLayer Value Pill Highlights */}
            <div className="pt-3 flex flex-wrap gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>On-Chain Web Rendering (gl.nondet.web.render)</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>20% Staking & Slashing Defense</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>24H Cooling-Off Window</span>
              </span>
            </div>
          </div>
        </section>

        {/* Global Statistics Bar */}
        <StatsBar tasks={tasks} />

        {/* Main Section Header */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>Bounty Explorer</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">Browse active localization bounties or accept with collateral</p>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold transition shadow-lg shadow-indigo-600/20"
          >
            <span>+ New Subtitle Bounty</span>
          </button>
        </div>

        {/* Bounty Explorer Component */}
        <BountyExplorer
          tasks={tasks}
          onSelectTask={(task) => setSelectedTask(task)}
        />

        {/* Deployment & Architecture Notes */}
        <section className="mt-12 p-6 rounded-2xl bg-slate-850 border border-slate-800 text-xs font-mono space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-slate-200 uppercase tracking-wider">GenLayer Architecture & Deployment Blueprint</span>
            </div>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Studionet Ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-400">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-indigo-400 font-bold block mb-1">1. Intelligent Contract</span>
              <p>Python contract at <code className="text-slate-200">contracts/PolyglotVault.py</code> executes non-deterministic LLM consensus and web renders without oracles.</p>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-emerald-400 font-bold block mb-1">2. Two-Way 404 Safeguard</span>
              <p>Dead publisher links trigger <code className="text-slate-200">ESCALATE</code> to protect translator stake. Dead subtitles trigger <code className="text-slate-200">REFUND</code> to protect publisher.</p>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-amber-400 font-bold block mb-1">3. Game-Theoretic Defense</span>
              <p>Translators stake 20% collateral. 2 consecutive machine-translation spam submissions trigger automated slashing.</p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 mt-12 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">PolyglotVault</span>
            <span>•</span>
            <span>Built for GenLayer Studionet</span>
          </div>
          <div>
            <span>Autonomous Linguistic Adjudication directly inside consensus</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isCreateOpen && (
        <CreateTaskModal
          onClose={() => setIsCreateOpen(false)}
          onCreateTask={handleCreateTask}
        />
      )}

      {selectedTask && (
        <TaskStudioModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          currentRole={currentRole}
          onUpdateTask={handleUpdateTask}
          contractService={contractService}
        />
      )}
    </div>
  );
}
