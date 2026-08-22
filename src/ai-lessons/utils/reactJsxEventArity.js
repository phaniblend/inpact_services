/**
 * React / JSX: ensure inline event handlers do not call functions with too few arguments
 * (e.g. onClick={() => save()} when save requires two parameters). Also flags
 * onClick={handler} when handler requires 3+ parameters (React only passes one synthetic event).
 */

import { matchingCloseBrace, callsInExpression } from "./callArityCore.js";
import { collectCallableAritiesFromBlock } from "./collectCallableArities.js";

/**
 * @param {string} track
 * @returns {boolean}
 */
export function isReactTrack(track) {
  if (!track || typeof track !== "string") return false;
  const t = track.toLowerCase().trim();
  return t === "react-js" || t === "react-ts" || t === "react";
}

/**
 * @param {string} body JSX expression body inside outer `{ ... }`
 * @param {Map<string, number>} arities
 * @param {{ name: string, argCount: number, required: number }[]} violations
 */
function checkJsxExpressionBody(body, arities, violations) {
  const b = body.trim();

  const directRef = /^\s*([a-zA-Z_$][\w$]*)\s*$/.exec(b);
  if (directRef) {
    const name = directRef[1];
    const required = arities.get(name);
    if (required !== undefined && required > 1) {
      violations.push({ name, argCount: 1, required });
    }
    return;
  }

  const arrow = /^\s*\(([^)]*)\)\s*=>([\s\S]*)$/.exec(b);
  if (arrow) {
    const rhs = arrow[2].trim();
    const stripped = rhs.replace(/^\{/, "").replace(/\}\s*$/, "").trim();
    const exprBody = rhs.startsWith("{") ? stripped : rhs;
    for (const { name, argCount } of callsInExpression(exprBody)) {
      const required = arities.get(name);
      if (required === undefined) continue;
      if (argCount < required) violations.push({ name, argCount, required });
    }
    return;
  }

  const noParenArrow = /^\s*([a-zA-Z_$][\w$]*)\s*=>/.exec(b);
  if (noParenArrow) {
    for (const { name, argCount } of callsInExpression(b)) {
      const required = arities.get(name);
      if (required === undefined) continue;
      if (argCount < required) violations.push({ name, argCount, required });
    }
    return;
  }

  for (const { name, argCount } of callsInExpression(b)) {
    const required = arities.get(name);
    if (required === undefined) continue;
    if (argCount < required) violations.push({ name, argCount, required });
  }
}

/**
 * @param {string} code
 * @returns {{ ok: true } | { ok: false, feedback: string, errors: string[] }}
 */
export function checkReactJsxEventArity(code) {
  const src = typeof code === "string" ? code : "";
  if (!src.includes("on") || !src.includes("{")) return { ok: true };

  const arities = collectCallableAritiesFromBlock(src);
  if (arities.size === 0) return { ok: true };

  const violations = [];
  const re = /\bon([A-Z][a-zA-Z0-9]*)\s*=\s*\{/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const braceIdx = m.index + m[0].length - 1;
    if (src[braceIdx] !== "{") continue;
    const closeIdx = matchingCloseBrace(src, braceIdx);
    if (closeIdx === -1) continue;
    const inner = src.slice(braceIdx + 1, closeIdx);
    checkJsxExpressionBody(inner, arities, violations);
  }

  if (violations.length === 0) return { ok: true };

  const first = violations[0];
  const directRefCase = violations.length === 1 && first.argCount === 1 && first.required > 1;
  const feedback =
    violations.length === 1
      ? directRefCase
        ? `You passed ${first.name} directly as the handler, but it needs ${first.required} arguments. Wrap it in an arrow function and supply every required value, e.g. () => ${first.name}(arg1, arg2).`
        : `The event handler calls ${first.name}() with ${first.argCount} argument(s), but ${first.name} requires ${first.required} required parameter(s). Pass the missing values inside the handler.`
      : `One or more event handlers call functions with too few arguments (${violations.map((v) => `${v.name} needs ${v.required}, got ${v.argCount}`).join("; ")}).`;

  return {
    ok: false,
    feedback,
    errors: violations.map(
      (v) => `${v.name} requires ${v.required} argument(s); the JSX handler passes too few (${v.argCount}).`
    ),
  };
}
