/**
 * Code validation via AI (DeepSeek) — judge learner code against step context.
 * Track-aware: when track is provided, validation uses language/framework/validation rules for that track
 * (e.g. React TypeScript vs React JavaScript). Used by POST /api/lessons/validate on the server.
 */

import { z } from "zod";
import { completeWithAI } from "../providers/aiProvider.js";
import { buildCodeValidationUserPrompt, CODE_VALIDATION_SYSTEM } from "../prompt-templates/codeValidation.js";
import { parseAndValidate } from "../utils/parseJson.js";
import { getTrackContext, getLanguageForValidation } from "../trackContext.js";
import { applyExecutionCorrectnessGuards } from "../utils/postValidationGuards.js";

const validationResponseSchema = z.object({
  result: z.enum(["correct", "partial", "wrong"]),
  feedback: z.string(),
  hint: z.string().optional().nullable(),
  errors: z.array(z.string()).optional().nullable(),
});

/**
 * Validate user code against a lesson step using AI (DeepSeek).
 * When track is provided, validation is track-aware (language, framework, validation rules from getTrackContext).
 * @param {{ instruction?: string, paal?: string, successCriteria?: string[], expectedOutcome?: string, expected?: string, seedCode?: string, seed_code?: string }} step - Step context
 * @param {string} userCode - Learner's code
 * @param {{ apiKey?: string, language?: string, provider?: 'deepseek', track?: string }} options - Pass track so validation uses correct language/rules (e.g. react-ts vs react-js)
 * @returns {Promise<{ result: "correct"|"partial"|"wrong", feedback: string, hint?: string, errors?: string[] }>}
 */
export async function validateCodeWithAI(step, userCode, options = {}) {
  const { apiKey, language: optionLanguage, provider = "deepseek", track } = options;
  const ctx = track ? getTrackContext(track) : null;
  const languageOrContext = ctx
    ? { language: getLanguageForValidation(track), framework: ctx.framework, validationRules: ctx.validationRules }
    : optionLanguage ?? "javascript";
  const userPrompt = buildCodeValidationUserPrompt(step, userCode, languageOrContext);
  const raw = await completeWithAI({
    system: CODE_VALIDATION_SYSTEM,
    user: userPrompt,
    maxTokens: 1024,
    apiKey,
    provider,
  });
  const parsed = parseAndValidate(raw, validationResponseSchema);
  if (!parsed.success) {
    throw new Error("Validation response invalid: " + parsed.error);
  }
  const data = parsed.data;
  let result = {
    result: data.result,
    feedback: data.feedback,
    ...(data.hint != null && { hint: data.hint }),
    ...(data.errors != null && { errors: data.errors }),
  };

  result = applyExecutionCorrectnessGuards(track, String(userCode), result);
  return result;
}
