/**
 * DeepSeek API client — OpenAI-compatible chat completions.
 * Used when AI_PROVIDER=deepseek. Economical alternative to Claude.
 */

const DEEPSEEK_BASE = "https://api.deepseek.com";
const DEFAULT_MODEL = "deepseek-chat";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// No timeout previously meant a stalled connection could hang a call indefinitely — with nothing
// to catch and nothing to retry, since the request never actually failed, it just never returned.
// Discovered live via a SpecForge publish sitting "pending" 4+ minutes with no error anywhere.
const REQUEST_TIMEOUT_MS = 100_000;

/**
 * Call DeepSeek chat completions API; return assistant message text.
 * @param {{ system: string, user: string, maxTokens?: number, model?: string, apiKey: string, temperature?: number }} opts
 * @returns {Promise<string>}
 */
export async function completeWithDeepSeek({
  system,
  user,
  maxTokens = 2048,
  model = DEFAULT_MODEL,
  apiKey,
  temperature,
}) {
  if (!apiKey) throw new Error("DeepSeek API key not configured");

  const url = `${DEEPSEEK_BASE}/v1/chat/completions`;
  const body = {
    model,
    max_tokens: maxTokens,
    // Omitted entirely (not defaulted here) for callers that don't specify it — DeepSeek's own
    // default (~1.0) is fine for open-ended generation (mentor chat, content authoring). Grading
    // calls (code validation, feedback-annotate) explicitly pass temperature: 0 — DeepSeek's own
    // docs recommend 0.0 for "Coding / Math" use cases. Found live 2026-09-07: the SAME unchanged
    // broken code (a typo'd generic type argument) failed one "Check my code" click and passed the
    // very next one with no edits in between — classic sampling variance on a borderline judgment,
    // not a logic bug in the guards. A false "correct" is worse than a false "wrong": it tells the
    // learner they're done when they are not.
    ...(temperature != null ? { temperature } : {}),
    messages: [
      ...(system ? [{ role: "system", content: system }] : []),
      { role: "user", content: user },
    ],
  };

  const maxRetries = 3;
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errText = await res.text();
        const err = new Error(`DeepSeek API ${res.status}: ${errText}`);
        err.status = res.status;
        throw err;
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content == null) throw new Error("No content in DeepSeek response");
      return content;
    } catch (err) {
      lastError =
        err?.name === "AbortError"
          ? new Error(`DeepSeek request timed out after ${REQUEST_TIMEOUT_MS / 1000}s — the connection stalled with no response.`)
          : err;
      const msg = (lastError?.message ?? "").toLowerCase();
      const is429 = err?.status === 429 || msg.includes("rate") || msg.includes("429");
      if (is429 && attempt < maxRetries) {
        const backoffMs = Math.min(60_000, 15_000 * Math.pow(2, attempt));
        await sleep(backoffMs);
        continue;
      }
      throw lastError;
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError;
}
