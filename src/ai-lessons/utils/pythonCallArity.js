/**
 * Python: top-level `def name(...):` required parameter count vs `name(...)` call sites.
 */

import { matchingCloseParen, splitTopLevelComma } from "./callArityCore.js";

const PY_SKIP_CALLEE = new Set([
  "if",
  "while",
  "for",
  "with",
  "def",
  "class",
  "return",
  "print",
  "len",
  "range",
  "str",
  "int",
  "float",
  "bool",
  "list",
  "dict",
  "set",
  "tuple",
  "sum",
  "min",
  "max",
  "abs",
  "enumerate",
  "zip",
  "open",
  "sorted",
  "reversed",
  "round",
  "isinstance",
  "type",
  "input",
  "super",
  "property",
  "staticmethod",
  "classmethod",
  "import",
  "lambda",
  "yield",
  "assert",
  "except",
  "raise",
  "pass",
  "del",
]);

/**
 * @param {string} paramList
 */
function countPythonRequiredParams(paramList) {
  const t = paramList.trim();
  if (!t) return 0;
  let parts = splitTopLevelComma(t);
  if (parts.length && /^self\b/.test(parts[0].trim())) {
    parts = parts.slice(1);
  }
  let n = 0;
  for (const part of parts) {
    const s = part.trim();
    if (!s) continue;
    if (s === "*" || s.startsWith("*") || s.startsWith("**")) continue;
    if (/\s=\s/.test(s)) continue;
    n++;
  }
  return n;
}

/**
 * @param {string} code
 * @returns {Map<string, number>}
 */
export function collectPythonDefArities(code) {
  const map = new Map();
  if (typeof code !== "string") return map;
  const re = /\bdef\s+(\w+)\s*\(/g;
  let m;
  while ((m = re.exec(code)) !== null) {
    const name = m[1];
    const openIdx = m.index + m[0].length - 1;
    const closeIdx = matchingCloseParen(code, openIdx);
    if (closeIdx === -1) continue;
    const params = code.slice(openIdx + 1, closeIdx);
    map.set(name, countPythonRequiredParams(params));
  }
  return map;
}

/**
 * @param {string} track
 */
export function isPythonTrack(track) {
  if (!track || typeof track !== "string") return false;
  const t = track.toLowerCase().trim();
  return t === "python" || t === "algo-python" || t.includes("python");
}

/**
 * @param {string} userCode
 * @returns {{ ok: true } | { ok: false, feedback: string, errors: string[] }}
 */
export function checkPythonCallArity(userCode) {
  const code = typeof userCode === "string" ? userCode : "";
  if (!/\bdef\s+\w+\s*\(/.test(code)) return { ok: true };

  const arities = collectPythonDefArities(code);
  if (arities.size === 0) return { ok: true };

  const violations = [];
  const re = /\b([a-zA-Z_][\w]*)\s*\(/g;
  let m;
  while ((m = re.exec(code)) !== null) {
    const name = m[1];
    if (PY_SKIP_CALLEE.has(name)) continue;
    const lineStart = code.lastIndexOf("\n", m.index - 1) + 1;
    const beforeParen = code.slice(lineStart, m.index).trimEnd();
    if (/^\s*def\s+[a-zA-Z_]\w*$/.test(beforeParen)) continue;
    if (/^\s*class\s+[a-zA-Z_]\w*$/.test(beforeParen)) continue;
    const openIdx = m.index + m[0].length - 1;
    const closeIdx = matchingCloseParen(code, openIdx);
    if (closeIdx === -1) continue;
    const inner = code.slice(openIdx + 1, closeIdx);
    const argCount = inner.trim() === "" ? 0 : splitTopLevelComma(inner).length;
    const required = arities.get(name);
    if (required === undefined) continue;
    if (argCount < required) {
      violations.push({ name, argCount, required });
    }
  }

  if (violations.length === 0) return { ok: true };

  const first = violations[0];
  const feedback =
    violations.length === 1
      ? `The call ${first.name}() passes ${first.argCount} argument(s), but your def for ${first.name} requires ${first.required} positional argument(s) (excluding self and parameters with defaults). Add the missing arguments.`
      : `One or more calls use too few arguments (${violations.map((v) => `${v.name} needs ${v.required}, got ${v.argCount}`).join("; ")}).`;

  return {
    ok: false,
    feedback,
    errors: violations.map(
      (v) => `${v.name} defined with ${v.required} required parameter(s); call passes ${v.argCount}.`
    ),
  };
}
