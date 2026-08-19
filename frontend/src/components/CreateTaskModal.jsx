import React, { useState } from 'react';
import { X, Sparkles, Layers, DollarSign, Globe, Shield, FileText } from 'lucide-react';

export function CreateTaskModal({ onClose, onCreateTask }) {
  const [taskId, setTaskId] = useState(`task_loc_${Math.floor(1000 + Math.random() * 9000)}`);
  const [mediaUrl, setMediaUrl] = useState('https://cdn.polyglotvault.io/transcripts/cooking_video_01.txt');
  const [targetLang, setTargetLang] = useState('English to Vietnamese');
  const [escrowAmount, setEscrowAmount] = useState('1000');
  const [guidelines, setGuidelines] = useState('Maintain soothing tone, precise culinary terms, and natural rhythm.');
  const [blacklistWords, setBlacklistWords] = useState('profanity, cheap, plastic, artificial flavor');
  const [sourceTranscript, setSourceTranscript] = useState(`[00:00:01] Welcome to our peaceful culinary kitchen.
[00:00:06] Today we gently simmer fragrant star anise, cinnamon, and ginger.
[00:00:14] Let the rich broth develop deep herbal clarity over low embers.`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Presets
  const applyPreset = (type) => {
    if (type === 'asmr') {
      setTaskId(`task_asmr_${Math.floor(1000 + Math.random() * 9000)}`);
      setMediaUrl('https://cdn.polyglotvault.io/transcripts/vietnamese_pho_asmr.txt');
      setTargetLang('English to Vietnamese');
      setEscrowAmount('1200');
      setGuidelines('Whisper / ASMR tone. Accurate Vietnamese spice names (hoa hồi, thảo quả, gừng nướng). Avoid literal robotic phrasing.');
      setBlacklistWords('plastic, fake, junk, synthetic');
      setSourceTranscript(`[00:00:02] Welcome back to the culinary sanctuary.
[00:00:08] Today we gently char fresh shallots and ginger over open embers.
[00:00:15] Listen to the subtle sizzle as natural oils release their herbal sweetness.`);
    } else if (type === 'web3') {
      setTaskId(`task_genlayer_${Math.floor(1000 + Math.random() * 9000)}`);
      setMediaUrl('https://cdn.polyglotvault.io/transcripts/genlayer_overview.txt');
      setTargetLang('English to Spanish');
      setEscrowAmount('2000');
      setGuidelines('Professional tech tone. Preserve key Web3 terminology: Intelligent Contracts, Subjective Consensus, Non-deterministic execution.');
      setBlacklistWords('pump, token dump, casino, moon');
      setSourceTranscript(`[00:00:01] Introducing GenLayer, the first AI-powered blockchain.
[00:00:08] Non-deterministic transactions allow validators to run LLMs natively.
[00:00:15] Contracts can inspect internet web data without centralized oracles.`);
    } else if (type === 'anime') {
      setTaskId(`task_anime_${Math.floor(1000 + Math.random() * 9000)}`);
      setMediaUrl('https://cdn.polyglotvault.io/transcripts/mecha_pilot_ep1.txt');
      setTargetLang('Japanese to English');
      setEscrowAmount('1500');
      setGuidelines('Cyberpunk sci-fi tone. Keep mech terminology consistent. Natural dramatic dialogue.');
      setBlacklistWords('google translate, broken machine, lorem ipsum');
      setSourceTranscript(`[00:00:03] All thrusters to maximum output!
[00:00:07] Target vector confirmed in sector 4. Sync rate at 94 percent!`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!taskId.trim()) return setError('Task ID is required');
    if (!mediaUrl.startsWith('http')) return setError('Valid HTTP/HTTPS media transcript URL required');
    if (Number(escrowAmount) <= 0) return setError('Escrow reward must be > 0 GEN');

    try {
      setIsSubmitting(true);
      await onCreateTask({
        taskId: taskId.trim(),
        mediaUrl: mediaUrl.trim(),
        targetLang: targetLang.trim(),
        escrowAmount: Number(escrowAmount),
        guidelines: guidelines.trim(),
        blacklistWords: blacklistWords.trim(),
        sourceTranscript: sourceTranscript.trim()
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100">Create Subtitle Localization Bounty</h3>
              <p className="text-xs text-slate-400 font-mono">Lock GEN escrow in GenLayer Intelligent Contract</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets Bar */}
        <div className="px-5 py-3 bg-slate-900/60 border-b border-slate-800 flex items-center gap-2 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
          <span className="text-slate-400">Quick Presets:</span>
          <button
            type="button"
            onClick={() => applyPreset('asmr')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-indigo-600/20 hover:text-indigo-400 border border-slate-700 transition"
          >
            ASMR Cooking (Vi)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('web3')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-indigo-600/20 hover:text-indigo-400 border border-slate-700 transition"
          >
            GenLayer Web3 (Es)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('anime')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-indigo-600/20 hover:text-indigo-400 border border-slate-700 transition"
          >
            Sci-Fi Anime (En)
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4 text-xs font-mono">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">TASK UNIQUE ID</label>
              <input
                type="text"
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">ESCROW REWARD (GEN)</label>
              <input
                type="number"
                min="100"
                step="50"
                value={escrowAmount}
                onChange={(e) => setEscrowAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                required
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Translators will stake 20% ({Math.floor(Number(escrowAmount || 0) * 0.2)} GEN)</span>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">SOURCE MEDIA / TRANSCRIPT URL</label>
            <input
              type="text"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://... (gl.nondet.web.render endpoint)"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">TARGET LANGUAGE DIRECTION</label>
            <input
              type="text"
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              placeholder="e.g. English to Vietnamese"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">SOURCE TRANSCRIPT CONTEXT</label>
            <textarea
              rows={3}
              value={sourceTranscript}
              onChange={(e) => setSourceTranscript(e.target.value)}
              placeholder="Paste raw transcript / dialogue timestamps for dual-pane viewer..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">STYLE & TONE GUIDELINES</label>
            <textarea
              rows={2}
              value={guidelines}
              onChange={(e) => setGuidelines(e.target.value)}
              placeholder="Tone, cultural nuances, target audience constraints..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold text-rose-400">FORBIDDEN BLACKLIST WORDS (COMMA SEPARATED)</label>
            <input
              type="text"
              value={blacklistWords}
              onChange={(e) => setBlacklistWords(e.target.value)}
              placeholder="badword1, cheap translation, machine error"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Locking Escrow on GenLayer...' : `Deposit ${escrowAmount} GEN & Launch Bounty`}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
