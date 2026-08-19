# 🌐 PolyglotVault: Autonomous AI-Adjudicated Subtitle & Localization Escrow on GenLayer

> **"PolyglotVault eliminates centralized localization gatekeepers by running multi-agent linguistic and timing adjudication directly inside GenLayer consensus."**

[![GenLayer](https://img.shields.io/badge/GenLayer-Studionet-6366f1.svg)](https://studio.genlayer.com)
[![Live dApp](https://img.shields.io/badge/Live_dApp-Vercel-emerald.svg)](https://frontend-six-olive-69.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-PolyglotVault-100000?logo=github&logoColor=white)](https://github.com/tuannguyenvan95/PolyglotVault)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🔗 Live Deployments & Links

- **Live Production dApp**: [https://frontend-six-olive-69.vercel.app](https://frontend-six-olive-69.vercel.app)
- **GitHub Repository**: [https://github.com/tuannguyenvan95/PolyglotVault](https://github.com/tuannguyenvan95/PolyglotVault)
- **GenLayer Studio**: [https://studio.genlayer.com](https://studio.genlayer.com)

---

## 📌 Project Overview & Key Value Proposition

**PolyglotVault** is a decentralized, AI-adjudicated subtitle and video localization escrow platform built natively on **GenLayer**. It enables content creators and global publishers to lock escrow bounties for multi-language video localization, while GenLayer's on-chain AI consensus autonomously parses source video transcripts against submitted `.srt` / `.vtt` subtitle files to settle payouts, enforce quality guidelines, or slash malicious spam without human intermediaries.

### 🌟 Key Value Proposition & GenLayer Fit (Score 5 Rubric Alignment)

1. **Subjective Consensus on Complex Media**: Evaluating whether a translated subtitle captures cultural nuance, humor, culinary tone, or timing constraints while avoiding blacklisted terms is inherently non-deterministic—impossible on standard EVM.
2. **On-Chain Web Rendering (`gl.nondet.web.render`)**: Reads raw media transcripts and subtitle files directly on-chain without centralized oracles.
3. **Two-Way Anti-Tamper & 404 Safeguards**:
   - If the publisher's media link dies or returns 404, escrow automatically moves to `ESCALATED` to prevent rug-pulling the translator.
   - If the submitted subtitle link is dead/404, the claim is rejected (`REFUND`) to protect the publisher.
4. **Game-Theoretic Stake & Slashing (20%)**: Translators must stake at least 20% of the bounty value to accept a task. Two consecutive failed submissions result in full slashing of the stake to the publisher.
5. **24-Hour Cooling-Off Window**: Payout finalization enforces a mandatory 24-hour dispute delay calculated from trusted on-chain execution context (`gl.message_raw`).

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
           |  [4/4] Settlement (APPROVED / REFUND / ESCALATED)           |
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
│   │   │   ├── Navbar.jsx       # Studio navigation & role switcher
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
│   ├── vite.config.js
│   └── vercel.json
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

## 🚀 Deployment & Portal Submission Checklist

1. **Deploy Contract**: Open [GenLayer Studio](https://studio.genlayer.com), paste `contracts/PolyglotVault.py`, deploy on `studionet`, and confirm transaction state is `Result: SUCCESS`.
2. **Configure Frontend**: Update `VITE_CONTRACT_ADDRESS` on your Vercel deployment with the newly generated contract address.
3. **Repository Setup**: GitHub repo contains `contracts/PolyglotVault.py`, `tests/test_polyglot_vault.py`, and `frontend/`.
4. **Portal Submission**: Submit via **Portal -> Builders track** (`portal.genlayer.foundation`).
