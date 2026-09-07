/**
 * Unified AI completion — DeepSeek only.
 */

import { completeWithDeepSeek } from "./deepseekClient.js";

/**
 * Call DeepSeek; return assistant text.
 * @param {{ system: string, user: string, maxTokens?: number, model?: string, apiKey: string, provider?: string, temperature?: number }} opts
 * @returns {Promise<string>}
 */
export async function completeWithAI({ system, user, maxTokens, apiKey, temperature }) {
  return completeWithDeepSeek({ system, user, maxTokens, apiKey, temperature });
}
