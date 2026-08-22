/**
 * Angular merged TS: template (event) bindings vs class / field method arity.
 */

import { callsInExpression, extractQuotedEventBindingExpressions } from "./callArityCore.js";
import { collectCallableAritiesFromBlock } from "./collectCallableArities.js";

/**
 * First template: `...` content in merged Angular TS.
 * @param {string} ts
 * @returns {string|null}
 */
export function extractInlineTemplate(ts) {
  if (typeof ts !== "string") return null;
  const m = ts.match(/template\s*:\s*`/);
  if (!m || m.index === undefined) return null;
  let i = m.index + m[0].length;
  let out = "";
  while (i < ts.length) {
    const c = ts[i];
    const prev = i > 0 ? ts[i - 1] : "";
    if (c === "`" && prev !== "\\") break;
    if (c === "\\" && i + 1 < ts.length) {
      out += ts[i] + ts[i + 1];
      i += 2;
      continue;
    }
    out += c;
    i++;
  }
  if (i >= ts.length) return null;
  return out;
}

/**
 * @param {string} ts
 * @returns {string}
 */
function extractFirstExportClassBody(ts) {
  const m = ts.match(/export\s+class\s+[\w$]+[^{]*\{/);
  if (!m || m.index === undefined) return ts;
  const openBrace = m.index + m[0].length - 1;
  let depth = 0;
  for (let i = openBrace; i < ts.length; i++) {
    if (ts[i] === "{") depth++;
    else if (ts[i] === "}") {
      depth--;
      if (depth === 0) return ts.slice(openBrace + 1, i);
    }
  }
  return ts;
}

/**
 * @param {string} track
 * @returns {boolean}
 */
export function isAngularFamilyTrack(track) {
  if (!track || typeof track !== "string") return false;
  const t = track.toLowerCase().trim();
  return t === "angular" || t === "mobile-angular" || t.includes("angular");
}

/**
 * @param {string} userCode merged Angular TS (template + class)
 * @returns {{ ok: true } | { ok: false, feedback: string, errors: string[] }}
 */
export function checkAngularTemplateCallArity(userCode) {
  const ts = typeof userCode === "string" ? userCode : "";
  const template = extractInlineTemplate(ts);
  if (!template) return { ok: true };

  const classBody = extractFirstExportClassBody(ts);
  const arities = collectCallableAritiesFromBlock(classBody);
  if (arities.size === 0) return { ok: true };

  const bindingExprs = extractQuotedEventBindingExpressions(template);
  const violations = [];

  for (const expr of bindingExprs) {
    for (const { name, argCount } of callsInExpression(expr)) {
      const required = arities.get(name);
      if (required === undefined) continue;
      if (argCount < required) {
        violations.push({ name, argCount, required });
      }
    }
  }

  if (violations.length === 0) return { ok: true };

  const first = violations[0];
  const feedback =
    violations.length === 1
      ? `The template calls ${first.name}() with ${first.argCount} argument(s), but your component defines ${first.name} with ${first.required} required parameter(s). Pass that many values inside the binding (for example string literals or component properties).`
      : `One or more event bindings call methods with too few arguments (${violations.map((v) => `${v.name} needs ${v.required}, got ${v.argCount}`).join("; ")}). Match the template call to each method's parameters.`;

  return {
    ok: false,
    feedback,
    errors: violations.map(
      (v) => `${v.name} requires ${v.required} argument(s) in the template; the binding passes ${v.argCount}.`
    ),
  };
}
