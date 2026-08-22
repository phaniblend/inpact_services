/**
 * Global execution-correctness layer after AI validation.
 * Deterministic checks across tracks (template/JSX call arity, etc.).
 */

import { checkAngularTemplateCallArity, isAngularFamilyTrack } from "./angularTemplateCallArity.js";
import { checkReactJsxEventArity, isReactTrack } from "./reactJsxEventArity.js";
import { checkVueTemplateCallArity, isVueTrack } from "./vueTemplateCallArity.js";

/**
 * @param {{ result: string, feedback?: string, hint?: string, errors?: string[] }} aiResult
 * @param {{ feedback: string, errors?: string[], hint?: string }} guard
 * @param {string} [hint]
 */
function downgradeToWrong(aiResult, guard, hint) {
  return {
    result: "wrong",
    feedback: guard.feedback,
    ...(guard.errors != null && { errors: guard.errors }),
    hint: hint ?? guard.hint,
  };
}

/**
 * @param {string} [track]
 * @param {string} userCode
 * @param {{ result: "correct"|"partial"|"wrong", feedback: string, hint?: string, errors?: string[] }} aiResult
 */
export function applyExecutionCorrectnessGuards(track, userCode, aiResult) {
  const code = String(userCode || "").trim();
  if (!code) return aiResult;
  if (aiResult.result !== "correct" && aiResult.result !== "partial") return aiResult;

  if (isAngularFamilyTrack(track)) {
    const r = checkAngularTemplateCallArity(code);
    if (!r.ok) {
      return downgradeToWrong(
        aiResult,
        r,
        "Each required method parameter needs a matching argument in the template binding."
      );
    }
  }

  if (isReactTrack(track)) {
    const r = checkReactJsxEventArity(code);
    if (!r.ok) {
      return downgradeToWrong(
        aiResult,
        r,
        "Event handlers must pass enough arguments for every function they call."
      );
    }
  }

  if (isVueTrack(track)) {
    const r = checkVueTemplateCallArity(code);
    if (!r.ok) return downgradeToWrong(aiResult, r);
  }

  // Mis-tagged or legacy content that still looks like an Angular component merge
  const looksLikeAngularMerge = /template\s*:\s*`/.test(code) && /export\s+class\s+/.test(code);
  if (track && !isAngularFamilyTrack(track) && looksLikeAngularMerge) {
    const r = checkAngularTemplateCallArity(code);
    if (!r.ok) {
      return downgradeToWrong(
        aiResult,
        r,
        "Each required method parameter needs a matching argument in the template binding."
      );
    }
  }

  return aiResult;
}
