import assert from "node:assert";
import test, { describe } from "node:test";
import { BobAnalysisRequest, BobEngine } from "../../src/lib/bob/engine";

const sampleRequest: BobAnalysisRequest = {
  repository: "Msc-Company-Org/msc-core-api",
  branch: "feat/payment-webhook",
  commitSha: "8a2f1b4",
  workflowName: "CI / Build",
  failedStep: "Typecheck",
  errorLog: "TypeError: property not found",
  files: [{ path: "src/index.ts", content: "export const x = 1;" }],
};

describe("BobEngine Transparency & Execution Isolation", () => {
  test("returns disconnected error when API key is missing and simulation is not requested", async () => {
    const engine = new BobEngine({ apiKey: "", endpoint: "https://mock.bob.ibm.com" });
    assert.strictEqual(engine.isConfigured(), false);

    const result = await engine.analyzeAndHeal(sampleRequest);

    assert.strictEqual(result.success, false);
    if (!result.success) {
      assert.strictEqual(result.mode, "disconnected");
      assert.strictEqual(result.reason, "missing_api_key");
      assert.match(result.error, /IBM_BOB_API_KEY is not configured/);
    }
  });

  test("generates explicit simulated demo when forceSimulation is true, without fake token metrics", async () => {
    const engine = new BobEngine({ apiKey: "", endpoint: "https://mock.bob.ibm.com" });

    const result = await engine.analyzeAndHeal({
      ...sampleRequest,
      forceSimulation: true,
    });

    assert.strictEqual(result.success, true);
    if (result.success) {
      assert.strictEqual(result.mode, "simulated");
      assert.strictEqual(result.sessionSummary.mode, "simulated");
      assert.match(result.rootCause, /\[SIMULATED DEMO\]/);
      assert.match(result.explanation, /\[DEMO ONLY\]/);
      assert.match(result.sessionSummary.notice, /SIMULATION \/ DEMO ONLY/);
      // Ensures no fabricated tokens or false claim of live inference
      assert.strictEqual("tokensUsed" in result.sessionSummary, false);
    }
  });

  test("returns api_error when live endpoint responds with HTTP 500 without falling back to fake success", async () => {
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = async () => {
        return new Response("Internal Server Error", { status: 500 });
      };

      const engine = new BobEngine({ apiKey: "test-valid-key", endpoint: "https://mock.bob.ibm.com" });
      const result = await engine.analyzeAndHeal(sampleRequest);

      assert.strictEqual(result.success, false);
      if (!result.success) {
        assert.strictEqual(result.mode, "failed");
        assert.strictEqual(result.reason, "api_error");
        assert.strictEqual(result.statusCode, 500);
      }
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test("returns api_unreachable when network error occurs", async () => {
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = async () => {
        throw new Error("Connection refused (ECONNREFUSED)");
      };

      const engine = new BobEngine({ apiKey: "test-valid-key", endpoint: "https://mock.bob.ibm.com" });
      const result = await engine.analyzeAndHeal(sampleRequest);

      assert.strictEqual(result.success, false);
      if (!result.success) {
        assert.strictEqual(result.mode, "failed");
        assert.strictEqual(result.reason, "api_unreachable");
        assert.match(result.error, /Connection refused/);
      }
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test("returns live analysis result when endpoint responds successfully", async () => {
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = async () => {
        return new Response(
          JSON.stringify({
            rootCause: "Live root cause from Bob 2.0",
            explanation: "Detailed AST diagnosis from Bob",
            filesInspected: ["src/index.ts"],
            patches: [
              {
                path: "src/index.ts",
                oldContent: "a",
                newContent: "b",
                diff: "--- a\n+++ b",
              },
            ],
            sessionSummary: {
              sessionId: "live-session-123",
              model: "ibm-bob-2.0-granite-live",
              tokensUsed: 850,
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      };

      const engine = new BobEngine({ apiKey: "test-valid-key", endpoint: "https://mock.bob.ibm.com" });
      const result = await engine.analyzeAndHeal(sampleRequest);

      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.mode, "live");
        assert.strictEqual(result.sessionSummary.mode, "live");
        assert.strictEqual(result.rootCause, "Live root cause from Bob 2.0");
        if (result.sessionSummary.mode === "live") {
          assert.strictEqual(result.sessionSummary.model, "ibm-bob-2.0-granite-live");
          assert.strictEqual(result.sessionSummary.tokensUsed, 850);
        }
      }
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
