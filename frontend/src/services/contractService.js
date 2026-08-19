// PolyglotVault Contract Service (Studionet & Live GenLayer State Management)

const STORAGE_KEY = 'polyglot_vault_tasks_v1';

const INITIAL_TASKS = [
  {
    id: 'task_asmr_cooking_01',
    publisher: '0x71c...99a2',
    translator: '0x0000000000000000000000000000000000000000',
    escrow_amount: '1200',
    translator_stake: '0',
    status: 'OPEN',
    media_url: 'https://cdn.polyglotvault.io/transcripts/vietnamese_pho_asmr.txt',
    subtitle_url: '',
    target_lang: 'English to Vietnamese',
    guidelines: 'Maintain soothing whisper tone, accurately translate culinary spices (star anise, cardamom, charred ginger) and avoid awkward literal phrasing.',
    blacklist_words: 'plastic, synthetic, garbage, junk food, cheap flavor',
    verdict: 'NONE',
    reason: 'Awaiting translator acceptance with 20% stake deposit',
    confidence: '0',
    attempts: '0',
    payout_ready_at: '0',
    disputed_at: '0',
    source_transcript_preview: `[00:00:02] Welcome back to the culinary sanctuary.
[00:00:08] Today we gently char fresh shallots and ginger over open embers.
[00:00:15] Listen to the subtle sizzle as natural oils release their herbal sweetness.
[00:00:24] We simmer marrow beef bones for 12 slow hours with whole star anise.
[00:00:32] The broth must remain crystal clear, fragrant, and deeply comforting.`,
    sample_subtitles: `1
00:00:02,000 --> 00:00:07,000
Chào mừng bạn quay trở lại với không gian ẩm thực yên bình.

2
00:00:08,000 --> 00:00:14,000
Hôm nay chúng ta sẽ nướng nhẹ hành tím và gừng tươi trên than hồng.

3
00:00:15,000 --> 00:00:23,000
Lắng nghe tiếng xèo xèo êm dịu khi tinh dầu tự nhiên tỏa ngát vị ngọt thảo mộc.

4
00:00:24,000 --> 00:00:31,000
Chúng ta ninh xương bò tủy suốt 12 giờ chậm rãi cùng hoa hồi nguyên nhánh.

5
00:00:32,000 --> 00:00:38,000
Nước dùng phải giữ được độ trong vắt, thơm nồng và ấm áp vỗ về.`
  },
  {
    id: 'task_genlayer_developer_keynote',
    publisher: '0x9a3...4e1b',
    translator: '0x3f2...88cc',
    escrow_amount: '2500',
    translator_stake: '500',
    status: 'AWAITING_PAYOUT',
    media_url: 'https://cdn.polyglotvault.io/transcripts/genlayer_ai_consensus.txt',
    subtitle_url: 'https://storage.polyglotvault.io/subs/genlayer_keynote_es.srt',
    target_lang: 'English to Spanish',
    guidelines: 'Preserve Web3 and consensus terminology accurately (Intelligent Contracts, subjective consensus, slashing). Formal developer-conference tone.',
    blacklist_words: 'crypto scam, pump, casino, token mill',
    verdict: 'APPROVED',
    reason: 'Excellent Spanish terminology for GenLayer Intelligent Contracts and non-deterministic consensus. Zero blacklist infractions.',
    confidence: '98',
    attempts: '1',
    payout_ready_at: String(Math.floor(Date.now() / 1000) - 3600), // Ready to finalize
    disputed_at: '0',
    source_transcript_preview: `[00:00:01] Welcome to the GenLayer Intelligent Contract demonstration.
[00:00:06] Unlike standard EVM chains, GenLayer integrates LLMs directly into consensus.
[00:00:14] Translators stake collateral and AI validators inspect translation quality on-chain.`,
    sample_subtitles: `1
00:00:01,000 --> 00:00:05,000
Bienvenidos a la demostración de Contratos Inteligentes de GenLayer.

2
00:00:06,000 --> 00:00:13,000
A diferencia de las cadenas EVM estándar, GenLayer integra LLMs directamente en el consenso.

3
00:00:14,000 --> 00:00:20,000
Los traductores depositan garantías y los validadores de IA evalúan la calidad en la cadena.`
  },
  {
    id: 'task_anime_sci_fi_dubbing',
    publisher: '0x12c...8811',
    translator: '0x55a...0099',
    escrow_amount: '800',
    translator_stake: '160',
    status: 'NEEDS_REVISION',
    media_url: 'https://cdn.polyglotvault.io/transcripts/cyberpunk_episode_4.txt',
    subtitle_url: 'https://storage.polyglotvault.io/subs/cyberpunk_jp_attempt1.srt',
    target_lang: 'Japanese to English',
    guidelines: 'Maintain sci-fi cyberpunk grit and retro synth aesthetic. Avoid overly literal machine translations.',
    blacklist_words: 'broken translation, google translate, lorem ipsum',
    verdict: 'REFUND',
    reason: 'Attempt 1 failed: Detected literal machine translation hallucination on line 4 ("Hyper-quantum reactor" translated into generic nonsense). Revision permitted.',
    confidence: '91',
    attempts: '1',
    payout_ready_at: '0',
    disputed_at: '0',
    source_transcript_preview: `[00:00:05] Target acquired in Sector 7 sub-grid.
[00:00:11] Emergency overrides failed. The neural core is melting down!`,
    sample_subtitles: `1
00:00:05,000 --> 00:00:10,000
Target acquired in Sector 7 sub-grid.

2
00:00:11,000 --> 00:00:16,000
Emergency cancel broken machine thing neural core is hot!`
  }
];

class ContractService {
  constructor() {
    this.contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || '0xPolyglotVaultStudionet123456789abcdef';
    this.network = 'GenLayer Studionet';
    this.loadTasks();
  }

  loadTasks() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        this.tasks = JSON.parse(saved);
      } catch (e) {
        this.tasks = INITIAL_TASKS;
      }
    } else {
      this.tasks = INITIAL_TASKS;
      this.saveTasks();
    }
  }

  saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks));
  }

  getTasks() {
    this.loadTasks();
    return [...this.tasks];
  }

  getTaskById(id) {
    this.loadTasks();
    return this.tasks.find(t => t.id === id);
  }

  async createTask({ taskId, mediaUrl, targetLang, guidelines, blacklistWords, escrowAmount, senderAddress, sourceTranscript }) {
    this.loadTasks();
    if (this.tasks.some(t => t.id === taskId)) {
      throw new Error('Task ID already exists on-chain');
    }

    const newTask = {
      id: taskId,
      publisher: senderAddress || '0x71c...99a2',
      translator: '0x0000000000000000000000000000000000000000',
      escrow_amount: String(escrowAmount),
      translator_stake: '0',
      status: 'OPEN',
      media_url: mediaUrl,
      subtitle_url: '',
      target_lang: targetLang,
      guidelines: guidelines || 'Standard high-fidelity localization',
      blacklist_words: blacklistWords || 'none',
      verdict: 'NONE',
      reason: 'Awaiting translator acceptance with 20% stake deposit',
      confidence: '0',
      attempts: '0',
      payout_ready_at: '0',
      disputed_at: '0',
      source_transcript_preview: sourceTranscript || `[00:00:00] Source video transcript for ${taskId}\n[00:00:05] Audio content verified on-chain via GenLayer web render.`,
      sample_subtitles: ''
    };

    this.tasks.unshift(newTask);
    this.saveTasks();
    return newTask;
  }

  async acceptTask(taskId, senderAddress, stakeAmount) {
    this.loadTasks();
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');
    if (task.status !== 'OPEN') throw new Error('Task is not in OPEN status');

    const minStake = Math.floor(Number(task.escrow_amount) * 0.2);
    if (Number(stakeAmount) < minStake) {
      throw new Error(`Insufficient stake: Minimum 20% required (${minStake} GEN)`);
    }

    task.translator = senderAddress || '0x3f2...88cc';
    task.translator_stake = String(stakeAmount);
    task.status = 'IN_PROGRESS';
    task.reason = 'Translator staked 20% collateral. In progress.';

    this.saveTasks();
    return task;
  }

  async simulateConsensusPipeline(taskId, subtitleUrl, subtitleContent, onStep) {
    this.loadTasks();
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    // [1/4] Web Extraction
    onStep?.({
      step: 1,
      title: 'Web Extraction (gl.nondet.web.render)',
      detail: `Fetching media transcript from ${task.media_url} and subtitle payload from ${subtitleUrl || 'provided SRT'}...`,
      status: 'running'
    });
    await new Promise(r => setTimeout(r, 1200));

    // Check 404 anti-tamper simulation
    if (task.media_url.includes('404') || task.media_url.includes('dead')) {
      onStep?.({
        step: 1,
        title: 'Web Extraction - 404 Detected',
        detail: 'Publisher media URL returned HTTP 404 Not Found. Halting to safeguard translator stake.',
        status: 'warning'
      });
      task.status = 'ESCALATED';
      task.verdict = 'ESCALATE';
      task.reason = 'Publisher source URL returned 404. Escrow locked for arbitration.';
      task.confidence = '100';
      this.saveTasks();
      return task;
    }

    onStep?.({
      step: 1,
      title: 'Web Extraction - Success',
      detail: 'Media transcript & subtitle cues extracted successfully.',
      status: 'complete'
    });

    // [2/4] Polyglot AI Evaluation
    onStep?.({
      step: 2,
      title: 'Polyglot AI Evaluation (gl.nondet.exec_prompt)',
      detail: `Evaluating translation into [${task.target_lang}] against style guidelines and blacklist terms...`,
      status: 'running'
    });
    await new Promise(r => setTimeout(r, 1500));

    const contentLower = (subtitleContent || '').toLowerCase();
    const blacklistedFound = task.blacklist_words
      .split(',')
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length > 2 && contentLower.includes(w));

    let verdict = 'APPROVED';
    let confidence = 96;
    let reason = 'High translation fidelity, timing alignment validated, cultural tone preserved.';

    if (blacklistedFound.length > 0) {
      verdict = 'REFUND';
      confidence = 99;
      reason = `Violation: Detected forbidden blacklist terms: "${blacklistedFound.join(', ')}"`;
    } else if (contentLower.includes('hallucination') || contentLower.includes('broken machine')) {
      verdict = 'REFUND';
      confidence = 94;
      reason = 'Poor linguistic fidelity: Machine-translation artifacts & incorrect grammatical phrasing.';
    } else if (contentLower.includes('typo') || contentLower.includes('slight')) {
      verdict = 'PARTIAL';
      confidence = 88;
      reason = 'Minor phrasing discrepancies detected, but output is fully legible and usable.';
    }

    onStep?.({
      step: 2,
      title: 'Polyglot AI Evaluation - Done',
      detail: `Leader Verdict: ${verdict} (Confidence: ${confidence}%)`,
      status: 'complete'
    });

    // [3/4] Validator Consensus
    onStep?.({
      step: 3,
      title: 'Validator Consensus (gl.vm.run_nondet)',
      detail: 'Replicating prompt on validator nodes and computing leader-validator agreement...',
      status: 'running'
    });
    await new Promise(r => setTimeout(r, 1200));

    onStep?.({
      step: 3,
      title: 'Validator Consensus - Reached',
      detail: 'Consensus Agreement: 100% agreement on effective verdict.',
      status: 'complete'
    });

    // [4/4] Settlement
    onStep?.({
      step: 4,
      title: 'Settlement & State Transition',
      detail: 'Writing state changes into GenLayer ledger...',
      status: 'running'
    });
    await new Promise(r => setTimeout(r, 1000));

    task.subtitle_url = subtitleUrl || 'https://storage.polyglotvault.io/subs/submitted.srt';
    task.sample_subtitles = subtitleContent || task.sample_subtitles;
    task.attempts = String(Number(task.attempts || 0) + 1);
    task.verdict = verdict;
    task.confidence = String(confidence);
    task.reason = reason;

    if (verdict === 'APPROVED' || verdict === 'PARTIAL') {
      task.status = 'AWAITING_PAYOUT';
      // Set cooling off: ready in 24 hours (for demo convenience, we will show remaining time)
      task.payout_ready_at = String(Math.floor(Date.now() / 1000) + 86400);
    } else if (verdict === 'REFUND') {
      if (Number(task.attempts) < 2) {
        task.status = 'NEEDS_REVISION';
      } else {
        // Two consecutive failures -> Slash 20% translator stake to publisher
        task.status = 'CLOSED';
        task.reason = 'Two consecutive evaluation failures. Slashed 20% stake to publisher.';
        task.escrow_amount = '0';
        task.translator_stake = '0';
      }
    } else {
      task.status = 'ESCALATED';
    }

    this.saveTasks();

    onStep?.({
      step: 4,
      title: 'Settlement Finalized',
      detail: `Task status transitioned to [${task.status}].`,
      status: 'complete'
    });

    return task;
  }

  async finalizePayout(taskId, callerAddress) {
    this.loadTasks();
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');
    if (task.status !== 'AWAITING_PAYOUT') {
      throw new Error('Task is not awaiting payout');
    }

    const now = Math.floor(Date.now() / 1000);
    const readyAt = Number(task.payout_ready_at);
    if (now < readyAt) {
      const remainingHrs = ((readyAt - now) / 3600).toFixed(1);
      throw new Error(`24-hour cooling-off period has not elapsed yet (${remainingHrs} hours remaining)`);
    }

    task.status = 'CLOSED';
    task.escrow_amount = '0';
    task.translator_stake = '0';
    task.reason = `Vault disbursed successfully according to verdict [${task.verdict}].`;

    this.saveTasks();
    return task;
  }

  async resolveEscalation(taskId, action, callerRole) {
    this.loadTasks();
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    const act = action.toUpperCase().trim();
    if (callerRole === 'publisher' && act !== 'RELEASE') {
      throw new Error('Publishers can only voluntarily RELEASE funds. Only admin can REFUND or SPLIT.');
    }

    task.status = 'CLOSED';
    task.escrow_amount = '0';
    task.translator_stake = '0';
    task.reason = `Escalation resolved via ${act} by ${callerRole.toUpperCase()}.`;

    this.saveTasks();
    return task;
  }

  // Reset to initial demo dataset
  resetDemo() {
    this.tasks = INITIAL_TASKS;
    this.saveTasks();
    return this.tasks;
  }
}

export const contractService = new ContractService();
