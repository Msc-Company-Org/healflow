/**
 * IBM Bob 2.0 Integration Engine for HealFlow.
 * Leverages Bob 2.0 full-repository context to analyze CI failures and generate surgical patches.
 */

export type BobExecutionMode = "live" | "simulated";

export interface BobContextFile {
  path: string;
  content: string;
}

export interface BobAnalysisRequest {
  repository: string;
  branch: string;
  commitSha: string;
  workflowName: string;
  failedStep: string;
  errorLog: string;
  files: BobContextFile[];
  /** If explicitly set to true, produces an isolated, explicitly marked synthetic fixture (for local UX demo/offline testing) */
  forceSimulation?: boolean;
}

export interface BobPatchFile {
  path: string;
  oldContent: string;
  newContent: string;
  diff: string;
}

export interface BobLiveSessionSummary {
  mode: "live";
  sessionId: string;
  model: string;
  tokensUsed?: number;
  durationMs: number;
  timestamp: string;
}

export interface BobSimulatedSessionSummary {
  mode: "simulated";
  sessionId: string;
  notice: string;
  durationMs: number;
  timestamp: string;
}

export type BobSessionSummary = BobLiveSessionSummary | BobSimulatedSessionSummary;

export interface BobAnalysisSuccess {
  success: true;
  mode: BobExecutionMode;
  rootCause: string;
  explanation: string;
  filesInspected: string[];
  patches: BobPatchFile[];
  sessionSummary: BobSessionSummary;
}

export interface BobAnalysisError {
  success: false;
  mode: "disconnected" | "failed";
  error: string;
  reason: "missing_api_key" | "api_unreachable" | "api_error";
  statusCode?: number;
  details?: unknown;
}

export type BobAnalysisResult = BobAnalysisSuccess | BobAnalysisError;

export class BobEngine {
  private apiKey: string;
  private endpoint: string;

  constructor(options?: { apiKey?: string; endpoint?: string }) {
    this.apiKey = options?.apiKey ?? process.env.IBM_BOB_API_KEY ?? "";
    this.endpoint = options?.endpoint ?? process.env.IBM_BOB_ENDPOINT ?? "https://api.ibm.com/bob/v2";
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  /**
   * Performs root cause analysis and patch synthesis.
   * If live credentials are missing and simulation is NOT requested, returns an explicit error
   * rather than fabricating live results.
   */
  async analyzeAndHeal(request: BobAnalysisRequest): Promise<BobAnalysisResult> {
    const startTime = Date.now();

    // 1. If simulation is explicitly requested (e.g., in UI demo mode or local tests)
    if (request.forceSimulation) {
      return this.generateSimulatedDemo(request, startTime);
    }

    // 2. Validate API configuration
    if (!this.isConfigured()) {
      return {
        success: false,
        mode: "disconnected",
        reason: "missing_api_key",
        error: "IBM_BOB_API_KEY is not configured. Live IBM Bob 2.0 analysis cannot be performed without valid credentials.",
      };
    }

    // 3. Invoke live IBM Bob 2.0 service
    try {
      const response = await fetch(`${this.endpoint}/repo-analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          context: {
            repo: request.repository,
            ref: request.commitSha,
            workflow: request.workflowName,
          },
          failure: {
            step: request.failedStep,
            logs: request.errorLog,
          },
          files: request.files,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unable to read error body");
        return {
          success: false,
          mode: "failed",
          reason: "api_error",
          statusCode: response.status,
          error: `IBM Bob 2.0 API returned error status ${response.status}: ${errorText}`,
        };
      }

      const data = (await response.json()) as Partial<BobAnalysisSuccess> & {
        rootCause?: string;
        explanation?: string;
        filesInspected?: string[];
        patches?: BobPatchFile[];
        sessionSummary?: Partial<BobLiveSessionSummary>;
      };

      return {
        success: true,
        mode: "live",
        rootCause: data.rootCause || "Root cause identified by IBM Bob 2.0",
        explanation: data.explanation || "Analysis completed by live IBM Bob 2.0 engine.",
        filesInspected: data.filesInspected || request.files.map((f) => f.path),
        patches: data.patches || [],
        sessionSummary: {
          mode: "live",
          sessionId: data.sessionSummary?.sessionId || `bob-live-${Date.now()}`,
          model: data.sessionSummary?.model || "ibm-bob-2.0",
          tokensUsed: data.sessionSummary?.tokensUsed,
          durationMs: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        mode: "failed",
        reason: "api_unreachable",
        error:
          error instanceof Error
            ? `Network error calling IBM Bob 2.0 API: ${error.message}`
            : "Network error calling IBM Bob 2.0 API",
        details: error,
      };
    }
  }

  /**
   * Generates an isolated, explicitly marked synthetic demonstration fixture.
   * Clearly marked as SIMULATION / DEMO ONLY — does NOT fabricate token usage or claim live inference.
   */
  generateSimulatedDemo(
    request: BobAnalysisRequest,
    startTime: number = Date.now()
  ): BobAnalysisSuccess {
    const inspected = request.files.map((f) => f.path);
    const primaryFile = inspected[0] || "src/index.ts";

    return {
      success: true,
      mode: "simulated",
      rootCause: `[SIMULATED DEMO] Synthetic root cause for '${request.failedStep}' failure: suspected type or lifecycle regression.`,
      explanation: `[DEMO ONLY] Simulated offline heuristic across ${inspected.length || 1} file(s). Notice: This is an offline mock fixture for testing/dashboard preview, not an actual IBM Bob 2.0 live inference.`,
      filesInspected: inspected.length > 0 ? inspected : [primaryFile],
      patches: [
        {
          path: primaryFile,
          oldContent: "// [Demo] Original failing code",
          newContent: "// [Demo] Heuristic patch for demonstration",
          diff: `--- a/${primaryFile}\n+++ b/${primaryFile}\n@@ -1,3 +1,3 @@\n- // [Demo] Failing logic\n+ // [Demo] Synthetic patch`,
        },
      ],
      sessionSummary: {
        mode: "simulated",
        sessionId: `demo-sim-${Date.now()}`,
        notice: "SIMULATION / DEMO ONLY — Not an actual IBM Bob 2.0 inference. No tokens consumed.",
        durationMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
    };
  }
}

export const bobEngine = new BobEngine();
