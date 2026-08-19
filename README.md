# 🌐 PolyglotVault: Autonomous AI-Adjudicated Subtitle & Localization Escrow on GenLayer

> **"PolyglotVault eliminates centralized localization gatekeepers by running multi-agent linguistic and timing adjudication directly inside GenLayer consensus."**

[![GenLayer](https://img.shields.io/badge/GenLayer-Studionet-6366f1.svg)](https://studio.genlayer.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-GenVM%20v0.2.18-blue.svg)](contracts/PolyglotVault.py)

---

## 📌 Project Overview & Key Value Proposition

**PolyglotVault** is a decentralized, AI-adjudicated subtitle and video localization escrow platform built natively on **GenLayer**. It allows content publishers to lock escrow bounties for multi-language video localization, while GenLayer's on-chain AI consensus autonomously evaluates the source media context against submitted `.srt` / `.vtt` subtitle deliverables to settle payouts, enforce tone/style guidelines, or slash malicious spam without human intermediaries.

### 🌟 GenLayer Fit & Score 5 Rubric Alignment

1. **Subjective Consensus on Complex Media**: Evaluating whether a translated subtitle captures cultural nuance, humor, culinary vocabulary, or timing constraints while avoiding blacklisted terms is inherently non-deterministic—impossible on standard EVM.
2. **On-Chain Web Rendering (`gl.nondet.web.render`)**: Reads raw media transcripts and subtitle files directly on-chain without centralized oracles or bridges.
3. **Two-Way Anti-Tamper & 404 Safeguards**:
   - If the publisher's media link returns 404 / dead, the escrow automatically transitions to `ESCALATED` to protect the translator's collateral against rug-pulls.
   - If the submitted subtitle link is dead/404, the claim is rejected (`REFUND`) to protect the publisher.
4. **Game-Theoretic Stake & Slashing (20%)**: Translators must stake at least 20% of the bounty value to accept a task. Two consecutive failed submissions result in full slashing of the stake to the publisher.
5. **24-Hour Cooling-Off Window**: Payout finalization enforces a mandatory 24-hour dispute delay derived strictly from trusted on-chain execution context (`gl.message_raw`).

---

## 🏛️ System Architecture

```
                                +-------------------------------------------+
                                |             Content Publisher             |
                                |     (Locks Bounty + Style Guidelines)     |
                                +---------------------+---------------------+
                                                      |
                                                      v [create_task]
+-------------------------+     [accept_task (20%)]   +---------------------+
|       Translator        | ------------------------> |    PolyglotVault    |
| (Stakes 20% Collateral) | <------------------------ | Intelligent Contract|
+------------+------------+      [Disburse Escrow]    +----------+----------+
             |                                                   |
             | [submit_subtitles]                                |
             +--------------------+                              |
                                  |                              |
                                  v                              v
           +-------------------------------------------------------------+
           |               GenLayer Dual-Agent Consensus                 |
           |                                                             |
           |  [1/4] gl.nondet.web.render (Fetch Transcript & .SRT)       |
           |  [2/4] gl.nondet.exec_prompt (Evaluate Timing & Nuance)     |
           |  [3/4] gl.vm.run_nondet (Leader-Validator Agreement)       |
           |  [4/4] State Transition (APPROVED / REFUND / ESCALATED)     |
           +-------------------------------------------------------------+
```

---

## 📁 Repository Structure

```
PolyglotVault/
├── contracts/
│   └── PolyglotVault.py         # Intelligent Contract (GenLayer v0.2.18)
├── tests/
│   └── test_polyglot_vault.py   # Adversarial unit & consensus test suite
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Studio navigation & role selector
│   │   │   ├── StatsBar.jsx     # Escrow TVL & game-theoretic metrics
│   │   │   ├── BountyExplorer.jsx # Filterable task list & cards
│   │   │   ├── CreateTaskModal.jsx# Publisher bounty creation + presets
│   │   │   ├── TaskStudioModal.jsx# Dual-pane live preview + cue parser
│   │   │   └── ConsensusFeed.jsx# 4-Step GenVM verification visualizer
│   │   ├── services/
│   │   │   └── contractService.js# Studionet contract RPC client & state
│   │   ├── utils/
│   │   │   └── srtParser.js     # SRT/VTT parser & timestamp engine
│   │   ├── App.jsx              # Main application hub
│   │   └── index.css            # Dark Studio styling (#0f172a theme)
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🧪 Adversarial Test Suite

The test suite covers full adversarial edge cases:
- **Under-staking reverts**: Rejecting accepts with `< 20%` stake.
- **Cooling-off delay**: Enforcing strict 24h delay before `finalize_payout`.
- **Double-failure slashing**: Two consecutive failed submissions slash 20% stake to the publisher.
- **404 Anti-tampering**: Dead media URL automatically forces `ESCALATED` status.
- **Partial settlements**: Splitting bounties on `PARTIAL` verdict.
- **Access control**: Unauthorized callers cannot submit deliverables or finalize early.

Run unit tests:
```bash
python -m unittest discover -s tests -p "test_*.py" -v
```

---

## 🚀 Deployment to GenLayer Studionet

1. **Deploy Contract**:
   - Open [GenLayer Studio](https://studio.genlayer.com).
   - Create a new contract file and paste `contracts/PolyglotVault.py`.
   - Select **studionet** environment.
   - Click **Deploy** and confirm the transaction receipt is `Result: SUCCESS`.
   - Copy the deployed contract address.

2. **Configure Frontend**:
   - Copy `.env.example` to `.env`:
     ```bash
     cd frontend
     cp .env.example .env
     ```
   - Update `VITE_CONTRACT_ADDRESS` with your deployed contract address.

3. **Run Frontend Locally**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 📝 Submission Checklist

- [x] Intelligent Contract: `contracts/PolyglotVault.py`
- [x] Adversarial Test Suite: `tests/test_polyglot_vault.py`
- [x] Modern Dark Studio Frontend: `frontend/`
- [x] Dual-Pane SRT Live Parser & 4-Step GenVM Consensus Feed
- [x] Submission track: **GenLayer Portal -> Builders Track** (`portal.genlayer.foundation`)
