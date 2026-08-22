/**
 * Browser client for POST /api/lessons/validate (DeepSeek + deterministic guards on server).
 */

import { getLanguageForValidation } from "./trackContext.js";
import { lessonApiUrl } from "./lessonApiUrl.js";

function aiValidationDisabled() {
  if (typeof import.meta === "undefined" || !import.meta.env) return false;
  return String(import.meta.env.VITE_DISABLE_AI_VALIDATION || "").toLowerCase() === "true";
}

/**
 * @param {{ track: string, node: object, userCode: string, language?: string }} opts
 * @returns {Promise<{ result: "correct"|"partial"|"wrong", feedback: string, hint?: string, errors?: string[] }>}
 */
export async function fetchLessonCodeValidation({ track, node, userCode, language: languageOverride }) {
  if (aiValidationDisabled()) {
    throw new Error("AI validation disabled (VITE_DISABLE_AI_VALIDATION)");
  }
  const language = languageOverride || getLanguageForValidation(track);
  const instruction = node.paal ?? node.instruction;
  const expected = node.expected ?? node.expectedOutcome;
  const seed = node.seed_code ?? node.seedCode;
  const res = await fetch(lessonApiUrl("/api/lessons/validate"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      step: {
        id: node.id,
        phase: node.phase,
        title: node.title,
        instruction,
        paal: instruction,
        successCriteria: node.successCriteria,
        expectedOutcome: expected,
        expected,
        seedCode: seed,
        seed_code: seed,
        answer_keywords: node.answer_keywords,
      },
      userCode,
      language,
      track,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg =
      err?.error ||
      (res.status === 404
        ? "Validation service not available. Run the server (npm run server) and try again."
        : res.status === 429
          ? "Rate limit exceeded. Please try again in a moment."
          : res.statusText || "Validation request failed.");
    throw new Error(msg);
  }
  return res.json();
}
