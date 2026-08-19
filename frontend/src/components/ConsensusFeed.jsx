import React from 'react';
import { CheckCircle2, Loader2, AlertCircle, Cpu, ArrowRight } from 'lucide-react';

export function ConsensusFeed({ steps = [], activeStepIndex = 0, isRunning = false }) {
  const pipelineSteps = [
    {
      num: '1/4',
      title: 'Web Extraction',
      method: 'gl.nondet.web.render',
      desc: 'Validating source media and subtitle endpoints on-chain...'
    },
    {
      num: '2/4',
      title: 'Polyglot AI Evaluation',
      method: 'gl.nondet.exec_prompt',
      desc: 'Checking timing offsets, translation accuracy, and blacklist terms...'
    },
    {
      num: '3/4',
      title: 'Validator Consensus',
      method: 'gl.vm.run_nondet',
      desc: 'Leader-Validator agreement calculation across GenLayer nodes...'
    },
    {
      num: '4/4',
      title: 'Settlement',
      method: 'State Transition',
      desc: 'State updates, 24h cooling-off locking, or stake slashing execution...'
    }
  ];

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs shadow-inner">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-850">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span className="font-bold text-slate-200 uppercase tracking-wider">Live GenVM Consensus Trace</span>
        </div>
        <span className="text-[11px] text-slate-500">Autonomous Dual-Agent Execution</span>
      </div>

      <div className="space-y-3">
        {pipelineSteps.map((s, idx) => {
          const stepLog = steps.find(item => item.step === idx + 1);
          const isCurrent = isRunning && activeStepIndex === idx + 1;
          const isDone = (stepLog && stepLog.status === 'complete') || (!isRunning && activeStepIndex > idx + 1);
          const isWarning = stepLog && stepLog.status === 'warning';

          return (
            <div
              key={s.num}
              className={`p-3 rounded-lg border transition-all ${
                isCurrent
                  ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-950/50'
                  : isDone
                  ? 'bg-slate-900/90 border-slate-800'
                  : 'bg-slate-900/30 border-slate-850 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-indigo-400 font-bold">[{s.num}]</span>
                  <span className="font-semibold text-slate-200">{s.title}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 border border-slate-700">
                    {s.method}
                  </span>
                </div>

                <div>
                  {isCurrent && (
                    <div className="flex items-center gap-1 text-indigo-400 font-medium">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Executing...</span>
                    </div>
                  )}
                  {isDone && !isWarning && (
                    <div className="flex items-center gap-1 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Passed</span>
                    </div>
                  )}
                  {isWarning && (
                    <div className="flex items-center gap-1 text-rose-400 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Flagged</span>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-1 pl-7">
                {stepLog ? stepLog.detail : s.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
