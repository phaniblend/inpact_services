/**
 * Anthropic API client — initialized from env only (no hardcoded secrets).
 * Used by the real AI lesson pipeline.
 */

import Anthropic from "@anthropic-ai/sdk";
import { AI_LESSONS_CONFIG } from "../config.js";

const DEFAULT_MAX_TOKENS = 4096;
const DEFAULT_MODEL = "claude-sonnet-4-20250514";

/**
 * Get configured Anthropic client or null if key is missing.
 * In the browser we must set dangerouslyAllowBrowser: true so the SDK sends the header
 * Anthropic requires for CORS (otherwise the request is blocked and we fall back to mock).
 * @returns {Anthropic | null}
 */
export function getAnthropicClient() {
  const key = AI_LESSONS_CONFIG.apiKey;
  if (!key) return null;
  const isBrowser = typeof window !== "undefined";
  return new Anthropic({
    apiKey: key,
    ...(isBrowser && { dangerouslyAllowBrowser: true }),
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Call Anthropic messages API with system + user prompt; return assistant text.
 * Retries on 429 (rate limit) with exponential backoff.
 * When apiKey is provided (e.g. from server), use it and do not require browser flag.
 * @param {{ system: string, user: string, maxTokens?: number, model?: string, apiKey?: string }} opts
 * @returns {Promise<string>} Assistant message content (text)
 */
export async function completeWithAnthropic({ system, user, maxTokens = DEFAULT_MAX_TOKENS, model = DEFAULT_MODEL, apiKey: apiKeyOverride }) {
  const key = apiKeyOverride ?? AI_LESSONS_CONFIG.apiKey;
  if (!key) throw new Error("Anthropic API key not configured");

  const isBrowser = typeof window !== "undefined";
  const client = new Anthropic({
    apiKey: key,
    ...(isBrowser && { dangerouslyAllowBrowser: true }),
  });

  const maxRetries = 3;
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.messages.create({
        model,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: user }],
      });

      const block = response.content?.find((b) => b.type === "text");
      if (!block || block.type !== "text") throw new Error("No text in Anthropic response");
      return block.text;
    } catch (err) {
      lastError = err;
      const msg = (err?.message ?? "").toLowerCase();
      const is429 = err?.status === 429 || msg.includes("rate_limit") || msg.includes("429");
      if (is429 && attempt < maxRetries) {
        const backoffMs = Math.min(60_000, 15_000 * Math.pow(2, attempt));
        await sleep(backoffMs);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}
