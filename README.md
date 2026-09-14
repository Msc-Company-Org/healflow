# HealFlow ⚡

> **Autonomous CI/CD Failure Interceptor & Auto-Healer powered by IBM Bob 2.0**  
> Built for the **IBM Bob 2.0 Global AI Hackathon (LabLab.ai)** • September 2026

---

## 🎯 The Problem

Developers lose up to 25% of their working hours reading cryptic CI failure logs, attempting to reproduce environment-specific issues locally, and context-switching across repositories to hunt down why a build or test failed.

In fast-paced engineering teams, every red build blocks deployment pipelines and slows velocity.

---

## 💡 The Solution

**HealFlow** acts as an autonomous engineering teammate directly embedded in your GitHub pipeline:

1. **Failure Interception:** Intercepts `workflow_run.completed` webhook events from GitHub Actions when `conclusion === 'failure'`.
2. **Full-Repository Reasoning:** Passes the error log, failing step, and full repository structure to **IBM Bob 2.0**. Bob 2.0 uses its architectural awareness and multi-file reasoning to identify the root cause (e.g., breaking API payload, missing fallback guard, misconfigured dependency).
3. **Surgical Auto-Healing:** Generates a minimal, verified patch diff and automatically opens a branch `fix/ci-auto-heal-<commit>` and a pull request against `main` or comments directly on the affected PR.
4. **Real-time Incident Dashboard:** Provides team leads with an interactive view of intercepted failures, root cause explanations, patch diffs, and aggregate developer time saved.

---

## 🏗️ Architecture

```
[ GitHub Actions ] ──(webhook failure)──► [ HealFlow API (/api/webhooks/github) ]
                                                        │
                                                        ├── 1. Store incident (Drizzle / SQLite)
                                                        ├── 2. Query IBM Bob 2.0 (Full-Repo Context)
                                                        ├── 3. Synthesize surgical patch diff
                                                        ▼
[ GitHub REST API ] ◄──(open healing PR)── [ Auto-Heal Engine ]
         │
         ▼
[ HealFlow Web Dashboard ] (Next.js 15 + Tailwind CSS v4)
  ├── Live incident stream & status pills
  ├── Root cause explanation breakdown
  ├── Side-by-side patch diff viewer
  └── Turnkey demo failure simulator
```

---

## 🚀 Quick Start

### 1. Prerequisites
- [Bun](https://bun.sh) (v1.4+) or Node.js (v22+)
- GitHub Personal Access Token or GitHub App credentials

### 2. Installation
```bash
bun install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Configure your keys:
- `GITHUB_WEBHOOK_SECRET`: Secret configured in your GitHub repository webhooks.
- `GITHUB_TOKEN`: GitHub token with repo/pull-request permissions.
- `IBM_BOB_API_KEY`: Your IBM Bob 2.0 API key from LabLab.ai.

### 4. Run Development Server
```bash
bun dev
```
Open [http://localhost:3000](http://localhost:3000) to view the live dashboard.

---

## 📦 Submission Checklist (LabLab.ai)

- [x] Functional GitHub repository with complete source code.
- [x] Real-time interactive dashboard (Next.js 15 + Tailwind CSS v4).
- [x] Working webhook endpoint for GitHub Actions workflow runs (`/api/webhooks/github`).
- [x] IBM Bob 2.0 Integration engine (`src/lib/bob/engine.ts`).
- [x] One-click demo failure simulator for turnkey video recording.
- [ ] Record 2-minute demonstration video.
- [ ] Prepare 5-slide pitch presentation.
- [ ] Collect IBM Bob 2.0 session task screenshots.

---

## 📄 License
MIT © 2026 HealFlow Team
