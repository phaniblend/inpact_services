/**
 * Vue SFC: @click / v-on / (click) bindings vs script arity.
 */

import {
  callsInExpression,
  extractQuotedEventBindingExpressions,
  extractVueDirectiveExpressions,
} from "./callArityCore.js";
import { collectCallableAritiesFromBlock } from "./collectCallableArities.js";

/**
 * @param {string} track
 * @returns {boolean}
 */
export function isVueTrack(track) {
  if (!track || typeof track !== "string") return false;
  return track.toLowerCase().trim() === "vue";
}

/**
 * @param {string} code
 * @returns {string|null}
 */
function extractVueTemplateSection(code) {
  if (typeof code !== "string") return null;
  const m = code.match(/<template[\s\S]*?>([\s\S]*?)<\/template>/i);
  return m ? m[1] : null;
}

/**
 * @param {string} code
 * @returns {string}
 */
function extractVueScriptBlock(code) {
  if (typeof code !== "string") return "";
  const setup = code.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
  if (setup) return setup[1];
  return code;
}

/**
 * @param {string} userCode
 * @returns {{ ok: true } | { ok: false, feedback: string, errors: string[] }}
 */
export function checkVueTemplateCallArity(userCode) {
  const tpl = extractVueTemplateSection(userCode);
  if (!tpl) return { ok: true };

  const script = extractVueScriptBlock(userCode);
  const arities = collectCallableAritiesFromBlock(script);
  if (arities.size === 0) return { ok: true };

  const bindingExprs = [
    ...extractQuotedEventBindingExpressions(tpl),
    ...extractVueDirectiveExpressions(tpl),
  ];
  if (bindingExprs.length === 0) return { ok: true };

  const violations = [];
  for (const expr of bindingExprs) {
    for (const { name, argCount } of callsInExpression(expr)) {
      const required = arities.get(name);
      if (required === undefined) continue;
      if (argCount < required) violations.push({ name, argCount, required });
    }
  }

  if (violations.length === 0) return { ok: true };

  const first = violations[0];
  const feedback =
    violations.length === 1
      ? `The template calls ${first.name}() with ${first.argCount} argument(s), but your script defines ${first.name} with ${first.required} required parameter(s). Pass every required value in the template expression.`
      : `One or more template event bindings pass too few arguments (${violations.map((v) => `${v.name} needs ${v.required}, got ${v.argCount}`).join("; ")}).`;

  return {
    ok: false,
    feedback,
    errors: violations.map(
      (v) => `${v.name} requires ${v.required} argument(s) in the template; the binding passes ${v.argCount}.`
    ),
  };
}
