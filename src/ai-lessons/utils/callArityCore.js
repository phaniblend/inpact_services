/**
 * Shared parsing for “call site argument count vs required parameters” checks
 * (Angular templates, Vue templates, JSX event handlers, etc.).
 */

export const RESERVED_CALLEE = new Set([
  "if",
  "for",
  "while",
  "switch",
  "catch",
  "function",
  "return",
  "new",
  "typeof",
  "instanceof",
  "void",
  "delete",
  "import",
  "export",
  "class",
  "extends",
  "super",
  "this",
  "null",
  "undefined",
  "true",
  "false",
  "constructor",
  "async",
  "await",
  "yield",
  "get",
  "set",
  "ngOnInit",
  "ngOnDestroy",
  "ngOnChanges",
]);

/**
 * @param {string} s
 * @returns {string[]}
 */
export function splitTopLevelComma(s) {
  const parts = [];
  let start = 0;
  let depthParen = 0;
  let depthBracket = 0;
  let depthBrace = 0;
  let inSingle = false;
  let inDouble = false;
  let inBack = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    const prev = i > 0 ? s[i - 1] : "";
    if (inBack) {
      if (c === "`" && prev !== "\\") inBack = false;
      continue;
    }
    if (inSingle) {
      if (c === "'" && prev !== "\\") inSingle = false;
      continue;
    }
    if (inDouble) {
      if (c === '"' && prev !== "\\") inDouble = false;
      continue;
    }
    if (c === "'" && !inDouble) inSingle = true;
    else if (c === '"' && !inSingle) inDouble = true;
    else if (c === "`") inBack = true;
    else if (c === "(") depthParen++;
    else if (c === ")") depthParen--;
    else if (c === "[") depthBracket++;
    else if (c === "]") depthBracket--;
    else if (c === "{") depthBrace++;
    else if (c === "}") depthBrace--;
    else if (
      c === "," &&
      depthParen === 0 &&
      depthBracket === 0 &&
      depthBrace === 0 &&
      !inSingle &&
      !inDouble &&
      !inBack
    ) {
      parts.push(s.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(s.slice(start));
  return parts.map((p) => p.trim()).filter(Boolean);
}

/**
 * @param {string} paramList
 * @returns {number}
 */
export function countRequiredParams(paramList) {
  const trimmed = paramList.trim();
  if (!trimmed) return 0;
  const parts = splitTopLevelComma(trimmed);
  let n = 0;
  for (const p of parts) {
    const s = p.trim();
    if (!s || s === "...") continue;
    const optionalName =
      /^(?:readonly\s+)?(?:public\s+|private\s+|protected\s+)?([\w$]+)\s*\?(\s*[:,]|$)/.exec(s);
    if (optionalName) continue;
    n++;
  }
  return n;
}

/**
 * @param {string} str
 * @param {number} openIdx index of '('
 * @returns {number}
 */
export function matchingCloseParen(str, openIdx) {
  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  let inBack = false;
  for (let i = openIdx; i < str.length; i++) {
    const c = str[i];
    const prev = i > 0 ? str[i - 1] : "";
    if (inBack) {
      if (c === "`" && prev !== "\\") inBack = false;
      continue;
    }
    if (inSingle) {
      if (c === "'" && prev !== "\\") inSingle = false;
      continue;
    }
    if (inDouble) {
      if (c === '"' && prev !== "\\") inDouble = false;
      continue;
    }
    if (c === "'" && !inDouble) inSingle = true;
    else if (c === '"' && !inSingle) inDouble = true;
    else if (c === "`") inBack = true;
    else if (c === "(") depth++;
    else if (c === ")") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * @param {string} str
 * @param {number} openIdx index of '{'
 * @returns {number} matching '}' or -1
 */
export function matchingCloseBrace(str, openIdx) {
  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  let inBack = false;
  for (let i = openIdx; i < str.length; i++) {
    const c = str[i];
    const prev = i > 0 ? str[i - 1] : "";
    if (inBack) {
      if (c === "`" && prev !== "\\") inBack = false;
      continue;
    }
    if (inSingle) {
      if (c === "'" && prev !== "\\") inSingle = false;
      continue;
    }
    if (inDouble) {
      if (c === '"' && prev !== "\\") inDouble = false;
      continue;
    }
    if (c === "'" && !inDouble) inSingle = true;
    else if (c === '"' && !inSingle) inDouble = true;
    else if (c === "`") inBack = true;
    else if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * @param {string} expr
 * @returns {{ name: string, argCount: number }[]}
 */
export function callsInExpression(expr) {
  const out = [];
  const re = /\b([a-zA-Z_$][\w$]*)\s*\(/g;
  let m;
  while ((m = re.exec(expr)) !== null) {
    const name = m[1];
    if (RESERVED_CALLEE.has(name)) continue;
    const openIdx = m.index + m[0].length - 1;
    const closeIdx = matchingCloseParen(expr, openIdx);
    if (closeIdx === -1) continue;
    const inner = expr.slice(openIdx + 1, closeIdx);
    const argCount = inner.trim() === "" ? 0 : splitTopLevelComma(inner).length;
    out.push({ name, argCount });
  }
  return out;
}

/**
 * Angular/Vue-style (event)="expr" in double quotes.
 * @param {string} templateHtml
 * @returns {string[]}
 */
export function extractQuotedEventBindingExpressions(templateHtml) {
  const exprs = [];
  if (!templateHtml) return exprs;
  const re = /\([^)]+\)\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(templateHtml)) !== null) {
    exprs.push(m[1]);
  }
  return exprs;
}

/**
 * Vue @evt="expr" and v-on:evt="expr"
 * @param {string} templateHtml
 * @returns {string[]}
 */
export function extractVueDirectiveExpressions(templateHtml) {
  const exprs = [];
  if (!templateHtml) return exprs;
  const re1 = /@[\w.:-]+\s*=\s*"([^"]*)"/g;
  const re2 = /v-on:[\w.:-]+\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = re1.exec(templateHtml)) !== null) exprs.push(m[1]);
  while ((m = re2.exec(templateHtml)) !== null) exprs.push(m[1]);
  return exprs;
}
