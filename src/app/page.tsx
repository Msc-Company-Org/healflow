"use client";

import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock,
  Code2,
  ExternalLink,
  GitBranch,
  GitPullRequest,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface IncidentCard {
  id: string;
  repository: string;
  branch: string;
  commitSha: string;
  workflow: string;
  status: "healed" | "analyzing" | "failed" | "requires_human";
  errorMessage: string;
  rootCause: string;
  patchDiff: string;
  timeSaved: string;
  timestamp: string;
  bobSessionId: string;
  executionMode?: "live" | "simulated";
}

const INITIAL_INCIDENTS: IncidentCard[] = [
  {
    id: "inc_9841_live",
    repository: "Msc-Company-Org/msc-core-api",
    branch: "feat/payment-webhook",
    commitSha: "8a2f1b4",
    workflow: "CI / Production Build & Unit Tests",
    status: "healed",
    executionMode: "simulated",
    errorMessage: "TypeError: Cannot read property 'clientSecret' of undefined in payment.resolver.ts:42",
    rootCause:
      "[DEMO FIXTURE] Stripe API payload structure updated in v2026.1. Optional chaining guard missing on customer confirmation payload.",
    patchDiff: `--- a/src/services/payment.resolver.ts
+++ b/src/services/payment.resolver.ts
@@ -41,3 +41,3 @@
- const secret = intent.latest_charge.clientSecret;
+ const secret = intent.latest_charge?.clientSecret ?? intent.client_secret;
  return { secret };`,
    timeSaved: "25 min",
    timestamp: "2 mins ago",
    bobSessionId: "demo-sim-1726301",
  },
  {
    id: "inc_9840_live",
    repository: "Msc-Company-Org/msc-site",
    branch: "refactor/tailwind-v4",
    commitSha: "4c9d7e1",
    workflow: "Build & Typecheck",
    status: "healed",
    executionMode: "simulated",
    errorMessage: "Module not found: Can't resolve '@tailwindcss/postcss' in postcss.config.mjs",
    rootCause:
      "[DEMO FIXTURE] Legacy postcss config syntax present after Tailwind CSS v4 upgrade. Missing directive alignment in bundle config.",
    patchDiff: `--- a/postcss.config.mjs
+++ b/postcss.config.mjs
@@ -1,4 +1,4 @@
 export default {
   plugins: {
-    "tailwindcss": {},
+    "@tailwindcss/postcss": {},
   }
 };`,
    timeSaved: "15 min",
    timestamp: "18 mins ago",
    bobSessionId: "demo-sim-1726284",
  },
];

export default function DashboardPage() {
  const [incidents, setIncidents] = useState<IncidentCard[]>(INITIAL_INCIDENTS);
  const [selectedIncident, setSelectedIncident] = useState<IncidentCard>(INITIAL_INCIDENTS[0]);
  const [isSimulating, setIsSimulating] = useState(false);

  const simulateFailure = () => {
    setIsSimulating(true);
    const newId = `inc_${Math.floor(1000 + Math.random() * 9000)}_live`;
    const newIncident: IncidentCard = {
      id: newId,
      repository: "Msc-Company-Org/cendar-lab",
      branch: "fix/agent-memory-sync",
      commitSha: "7b8e3a2",
      workflow: "CI / Automated Vitest Suite",
      status: "analyzing",
      executionMode: "simulated",
      errorMessage: "AssertionError: Expected status 'active' but received 'quarantined' in agent.test.ts:18",
      rootCause: "[DEMO] Simulating IBM Bob 2.0 full-repository analysis...",
      patchDiff: "// Demo simulation in progress across repository files...",
      timeSaved: "Calculating...",
      timestamp: "Just now",
      bobSessionId: `demo-sim-${Date.now()}`,
    };

    setIncidents((prev) => [newIncident, ...prev]);
    setSelectedIncident(newIncident);

    // Simulate IBM Bob 2.0 processing and healing after 2.5s (Demo fixture)
    setTimeout(() => {
      const healedIncident: IncidentCard = {
        ...newIncident,
        status: "healed",
        executionMode: "simulated",
        rootCause:
          "[DEMO FIXTURE] Race condition detected in memory synchronization lifecycle. State transitions from pending to active before lease renewal.",
        patchDiff: `--- a/src/agents/memory-lease.ts
+++ b/src/agents/memory-lease.ts
@@ -29,2 +29,3 @@
+ await this.renewLease(session.id);
  session.status = 'active';`,
        timeSaved: "20 min",
      };
      setIncidents((prev) => prev.map((inc) => (inc.id === newId ? healedIncident : inc)));
      setSelectedIncident(healedIncident);
      setIsSimulating(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Activity className="size-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-tight">HealFlow</h1>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                IBM Bob 2.0 Agent
              </span>
            </div>
            <p className="text-xs text-slate-400">Autonomous CI/CD Failure Interceptor & Auto-Healer</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={simulateFailure}
            disabled={isSimulating}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 transition shadow-md shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
          >
            {isSimulating ? (
              <>
                <RefreshCw className="size-3.5 animate-spin" />
                Bob 2.0 Reasoning...
              </>
            ) : (
              <>
                <Sparkles className="size-3.5" />
                Simulate CI Failure (Demo)
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* KPI Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
            <div className="size-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Auto-Heal Rate</p>
              <p className="text-2xl font-bold tracking-tight text-emerald-400">94.2%</p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
            <div className="size-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Dev Time Saved</p>
              <p className="text-2xl font-bold tracking-tight text-cyan-400">18.5h</p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
            <div className="size-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <GitPullRequest className="size-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Surgical PRs Opened</p>
              <p className="text-2xl font-bold tracking-tight text-white">47</p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
            <div className="size-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Bot className="size-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">AI Engine Context</p>
              <p className="text-sm font-bold tracking-tight text-indigo-300">IBM Bob 2.0 (Repo)</p>
            </div>
          </div>
        </div>

        {/* Workspace Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Incidents Feed (Left Column) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-400" />
                Intercepted Failures
              </h2>
              <span className="text-xs text-slate-500">{incidents.length} events logged</span>
            </div>

            <div className="space-y-2.5">
              {incidents.map((incident) => {
                const isSelected = selectedIncident.id === incident.id;
                return (
                  <div
                    key={incident.id}
                    onClick={() => setSelectedIncident(incident)}
                    className={`p-4 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? "bg-slate-800/90 border-cyan-500 shadow-md shadow-cyan-500/10"
                        : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-slate-200">
                          {incident.repository}
                        </span>
                        {incident.executionMode === "simulated" && (
                          <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            Demo
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          incident.status === "healed"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
                        }`}
                      >
                        {incident.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 font-mono bg-slate-950/60 p-2 rounded border border-slate-800/60 mb-2.5">
                      {incident.errorMessage}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <GitBranch className="size-3 text-slate-400" />
                        <span>{incident.branch}</span>
                        <span className="font-mono text-slate-400">@{incident.commitSha}</span>
                      </div>
                      <span>{incident.timestamp}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deep Inspection Panel (Right Column) */}
          <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-bold text-cyan-400">
                    {selectedIncident.repository}
                  </span>
                  <span className="text-xs text-slate-500">• {selectedIncident.workflow}</span>
                </div>
                <p className="text-xs text-slate-400">Incident ID: {selectedIncident.id}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                  <ShieldCheck className="size-3.5" />
                  Saved {selectedIncident.timeSaved}
                </span>
              </div>
            </div>

            {/* Root Cause Analysis */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Bot className="size-4 text-cyan-400" />
                  Root Cause Analysis
                </h3>
                {selectedIncident.executionMode === "simulated" ? (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-amber-500/30">
                    Offline Simulation
                  </span>
                ) : (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                    Live IBM Bob 2.0
                  </span>
                )}
              </div>
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-4 text-xs text-slate-300 leading-relaxed font-sans">
                {selectedIncident.rootCause}
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Task Session Evidence: #{selectedIncident.bobSessionId} •{" "}
                {selectedIncident.executionMode === "live"
                  ? "Live Engine: IBM Bob 2.0 (Granite)"
                  : "Mode: Synthetic Demo Fixture (Offline Heuristic)"}
              </p>
            </div>

            {/* Patch Diff Viewer */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Code2 className="size-4 text-indigo-400" />
                  Synthesized Patch Diff
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">Ready for PR merge</span>
              </div>
              <pre className="bg-slate-950 border border-slate-800/90 rounded-lg p-4 font-mono text-xs text-emerald-400 overflow-x-auto leading-normal">
                {selectedIncident.patchDiff}
              </pre>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">PR Branch:</span>
                <code className="text-xs bg-slate-800 text-cyan-300 px-2 py-0.5 rounded font-mono">
                  fix/ci-auto-heal-{selectedIncident.commitSha}
                </code>
              </div>

              <a
                href={`https://github.com/${selectedIncident.repository}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition"
              >
                View in GitHub <ExternalLink className="size-3.5" />
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-4 text-center text-xs text-slate-500">
        HealFlow • Built for IBM Bob 2.0 Global AI Hackathon (LabLab.ai) • September 2026
      </footer>
    </div>
  );
}
