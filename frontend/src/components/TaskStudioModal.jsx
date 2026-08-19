import React, { useState } from 'react';
import { 
  X, CheckCircle2, AlertTriangle, Clock, FileText, ArrowRight, 
  Send, ShieldAlert, DollarSign, ExternalLink, RefreshCw, Cpu, Check, AlertCircle, Info
} from 'lucide-react';
import { parseSubtitle } from '../utils/srtParser';
import { ConsensusFeed } from './ConsensusFeed';

export function TaskStudioModal({ task, onClose, currentRole, onUpdateTask, contractService }) {
  if (!task) return null;

  const [activeTab, setActiveTab] = useState('studio'); // 'studio' | 'consensus' | 'raw'
  const [subtitleInput, setSubtitleInput] = useState(task.sample_subtitles || '');
  const [subtitleUrlInput, setSubtitleUrlInput] = useState(task.subtitle_url || 'https://storage.polyglotvault.io/subs/translated.srt');
  const [isProcessing, setIsProcessing] = useState(false);
  const [consensusSteps, setConsensusSteps] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const parsedCues = parseSubtitle(subtitleInput || task.sample_subtitles);
  const minStake = Math.floor(Number(task.escrow_amount) * 0.2);

  // Status Styling Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
        return <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">OPEN FOR STAKING</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse">IN PROGRESS</span>;
      case 'AWAITING_PAYOUT':
        return <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">AWAITING PAYOUT (24H)</span>;
      case 'NEEDS_REVISION':
        return <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/30">NEEDS REVISION (ATTEMPT 1/2)</span>;
      case 'ESCALATED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">ESCALATED TO ARBITRATION</span>;
      case 'CLOSED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-slate-700 text-slate-300 border border-slate-600">CLOSED & SETTLED</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-slate-800 text-slate-400">{status}</span>;
    }
  };

  // Accept Task with 20% Stake
  const handleAcceptTask = async () => {
    setActionError('');
    setActionSuccess('');
    try {
      setIsProcessing(true);
      const updated = await contractService.acceptTask(task.id, '0x3f2...88cc', minStake);
      onUpdateTask(updated);
      setActionSuccess(`Successfully staked ${minStake} GEN (20%) and accepted task!`);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Submit Subtitles and Trigger GenVM Consensus Feed
  const handleSubmitSubtitles = async () => {
    setActionError('');
    setActionSuccess('');
    if (!subtitleInput.trim()) {
      setActionError('Please provide subtitle text or cues in the editor');
      return;
    }

    try {
      setIsProcessing(true);
      setActiveTab('consensus');
      setConsensusSteps([]);
      setActiveStep(1);

      const updated = await contractService.simulateConsensusPipeline(
        task.id,
        subtitleUrlInput,
        subtitleInput,
        (stepInfo) => {
          setActiveStep(stepInfo.step);
          setConsensusSteps(prev => {
            const filtered = prev.filter(p => p.step !== stepInfo.step);
            return [...filtered, stepInfo];
          });
        }
      );

      onUpdateTask(updated);
      setActionSuccess(`Consensus reached! Verdict: ${updated.verdict} (Confidence: ${updated.confidence}%)`);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Finalize Payout (24h Cooling-Off Disbursal)
  const handleFinalizePayout = async (forceBypass = false) => {
    setActionError('');
    setActionSuccess('');
    try {
      setIsProcessing(true);
      if (forceBypass) {
        task.payout_ready_at = String(Math.floor(Date.now() / 1000) - 100);
      }
      const updated = await contractService.finalizePayout(task.id, '0x3f2...88cc');
      onUpdateTask(updated);
      setActionSuccess('Vault payout successfully disbursed to translator!');
    } catch (err) {
      setActionError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Resolve Escalation
  const handleResolveEscalation = async (action) => {
    setActionError('');
    setActionSuccess('');
    try {
      setIsProcessing(true);
      const updated = await contractService.resolveEscalation(task.id, action, currentRole);
      onUpdateTask(updated);
      setActionSuccess(`Escalation resolved via ${action}!`);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-indigo-400 font-semibold">{task.id}</span>
                {getStatusBadge(task.status)}
              </div>
              <p className="text-sm font-semibold text-slate-100 mt-0.5">
                Language Direction: <span className="text-indigo-300">{task.target_lang}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-5 border-b border-slate-800 bg-slate-900 text-xs font-medium gap-2">
          <button
            onClick={() => setActiveTab('studio')}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === 'studio'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Dual-Pane Studio & Cues
          </button>
          <button
            onClick={() => setActiveTab('consensus')}
            className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'consensus'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            GenVM Consensus Engine
          </button>
          <button
            onClick={() => setActiveTab('guidelines')}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === 'guidelines'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Rules & Blacklist
          </button>
        </div>

        {/* Alerts Banner */}
        {actionError && (
          <div className="mx-5 mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{actionError}</span>
          </div>
        )}
        {actionSuccess && (
          <div className="mx-5 mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          
          {/* TAB 1: DUAL-PANE LIVE STUDIO */}
          {activeTab === 'studio' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* Left Pane: Source Video & Transcript Context */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col h-[400px]">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-850">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">Source Media & Transcript</span>
                  </div>
                  <a
                    href={task.media_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-mono text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <span>gl.nondet.web.render URL</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Source Transcript Area */}
                <div className="bg-slate-900/60 rounded-lg p-3 text-xs font-mono text-slate-300 overflow-y-auto flex-1 border border-slate-800 whitespace-pre-wrap">
                  {task.source_transcript_preview || '(No source transcript preview found)'}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-850 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Publisher: <span className="font-mono text-slate-300">{task.publisher}</span></span>
                  <span className="text-indigo-400 font-bold font-mono">Reward: {task.escrow_amount} GEN</span>
                </div>
              </div>

              {/* Right Pane: Subtitle SRT/VTT Live Parser */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col h-[400px]">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-850">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">Subtitle .SRT Cues Parser</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950/40 text-[10px] text-emerald-300 border border-emerald-800/40">
                      {parsedCues.length} Cues
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">Target: {task.target_lang}</span>
                </div>

                {/* Parsed Subtitle Timeline View or Raw Edit */}
                {task.status === 'IN_PROGRESS' || task.status === 'NEEDS_REVISION' ? (
                  <div className="flex-1 flex flex-col gap-2 overflow-hidden">
                    <textarea
                      value={subtitleInput}
                      onChange={(e) => setSubtitleInput(e.target.value)}
                      placeholder="Paste raw .srt format or translation subtitles here..."
                      className="w-full flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={subtitleUrlInput}
                        onChange={(e) => setSubtitleUrlInput(e.target.value)}
                        placeholder="Subtitle Endpoint URL (e.g. https://storage.com/subs.srt)"
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900/60 rounded-lg p-2 space-y-2 overflow-y-auto flex-1 border border-slate-800 font-mono text-xs">
                    {parsedCues.length > 0 ? (
                      parsedCues.map((cue) => (
                        <div key={cue.id} className="p-2 rounded bg-slate-850/80 border border-slate-800">
                          <div className="flex items-center justify-between text-[10px] text-indigo-400 mb-1">
                            <span className="font-bold">#{cue.id}</span>
                            <span>{cue.start} ➔ {cue.end}</span>
                          </div>
                          <p className="text-slate-200 text-xs">{cue.text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 text-center py-10">No subtitles submitted yet.</p>
                    )}
                  </div>
                )}

                <div className="mt-3 pt-2 border-t border-slate-850 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Translator: <span className="font-mono text-slate-300">{task.translator === '0x0000000000000000000000000000000000000000' ? 'None (Open)' : task.translator}</span></span>
                  <span>Required Stake: <span className="font-mono text-emerald-400 font-bold">{minStake} GEN (20%)</span></span>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: CONSENSUS FEED */}
          {activeTab === 'consensus' && (
            <div className="space-y-4">
              <ConsensusFeed 
                steps={consensusSteps} 
                activeStepIndex={activeStep} 
                isRunning={isProcessing} 
              />

              {/* Latest Verdict Report */}
              {task.verdict !== 'NONE' && (
                <div className="p-4 rounded-xl bg-slate-850 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">Adjudication Verdict</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-mono text-xs font-bold ${
                      task.verdict === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                      task.verdict === 'PARTIAL' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                      task.verdict === 'REFUND' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                      'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                    }`}>
                      {task.verdict} (Confidence: {task.confidence}%)
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono bg-slate-900 p-3 rounded-lg border border-slate-800">
                    {task.reason}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: GUIDELINES & BLACKLIST */}
          {activeTab === 'guidelines' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider mb-2">Style & Tone Constraints</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-900 p-3 rounded-lg border border-slate-800">
                  {task.guidelines}
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider mb-2">Blacklisted Words & MT Artifacts</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-900 p-3 rounded-lg border border-slate-800">
                  {task.blacklist_words}
                </p>
                <span className="text-[11px] text-slate-500 mt-2 block">
                  Any usage of these terms triggers on-chain REFUND verdict and stake penalty.
                </span>
              </div>
            </div>
          )}

          {/* ACTION HUBS BASED ON TASK STATE */}
          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                Available On-Chain Actions ({currentRole.toUpperCase()})
              </span>
              <span className="text-xs font-mono text-slate-400">Escrow: {task.escrow_amount} GEN | Stake: {task.translator_stake} GEN</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              
              {/* STATE: OPEN -> Accept Task */}
              {task.status === 'OPEN' && (
                <button
                  onClick={handleAcceptTask}
                  disabled={isProcessing}
                  className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-mono font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Deposit {minStake} GEN (20% Stake) & Accept Task</span>
                </button>
              )}

              {/* STATE: IN_PROGRESS or NEEDS_REVISION -> Submit Deliverables */}
              {(task.status === 'IN_PROGRESS' || task.status === 'NEEDS_REVISION') && (
                <button
                  onClick={handleSubmitSubtitles}
                  disabled={isProcessing}
                  className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-mono font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Subtitles & Run GenVM Consensus</span>
                </button>
              )}

              {/* STATE: AWAITING_PAYOUT -> 24h Cooling-Off and Finalize */}
              {task.status === 'AWAITING_PAYOUT' && (
                <div className="flex flex-wrap items-center gap-3 w-full">
                  <div className="flex items-center gap-2 text-xs font-mono text-amber-400 bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-500/30">
                    <Clock className="w-4 h-4" />
                    <span>24-Hour Cooling-Off Window Active (gl.message_raw trusted timestamp)</span>
                  </div>
                  
                  <button
                    onClick={() => handleFinalizePayout(false)}
                    disabled={isProcessing}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-mono font-bold transition flex items-center gap-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Finalize Payout (Check Timestamp)</span>
                  </button>

                  <button
                    onClick={() => handleFinalizePayout(true)}
                    disabled={isProcessing}
                    className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-mono transition"
                    title="Simulate 24h passage for demo"
                  >
                    [Demo] Fast-Forward 24h & Finalize
                  </button>
                </div>
              )}

              {/* STATE: ESCALATED -> Resolution */}
              {task.status === 'ESCALATED' && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-rose-400 font-mono mr-2">Arbitration Options:</span>
                  <button
                    onClick={() => handleResolveEscalation('RELEASE')}
                    disabled={isProcessing}
                    className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold"
                  >
                    RELEASE (Disburse to Translator)
                  </button>
                  {currentRole === 'admin' && (
                    <>
                      <button
                        onClick={() => handleResolveEscalation('REFUND')}
                        disabled={isProcessing}
                        className="px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold"
                      >
                        REFUND (Return to Publisher)
                      </button>
                      <button
                        onClick={() => handleResolveEscalation('SPLIT')}
                        disabled={isProcessing}
                        className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold"
                      >
                        SPLIT 50/50
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* STATE: CLOSED */}
              {task.status === 'CLOSED' && (
                <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>This bounty has been fully settled and closed on GenLayer.</span>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
