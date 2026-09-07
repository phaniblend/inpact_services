/**
 * React: ensure hooks used as bare identifiers (useState, useEffect, …) are imported from 'react'.
 * Complements AI validation when the model marks incomplete submissions as correct.
 */

/** Hooks learners typically use in INPACT React lessons (extend if needed). */
const HOOK_NAMES = [
  "useState",
  "useEffect",
  "useRef",
  "useContext",
  "useReducer",
  "useMemo",
  "useCallback",
  "useLayoutEffect",
  "useImperativeHandle",
  "useDeferredValue",
  "useTransition",
  "useId",
  "useSyncExternalStore",
];

function stripComments(code) {
  return String(code)
    .replace(/\/\/[^\n]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
}

// Real TypeScript hook calls almost always carry a generic type argument between the hook name
// and its opening paren — useState<Financials>(...), useState<DriverEarnings>(...), etc. The
// original regex required the hook name to sit immediately against '(' and never matched these,
// so the guard silently thought useState/useEffect weren't being called at all (found live
// 2026-09-07: this is why the guard kept passing code with useState<Financials>(...) and no
// import, even after isReactTrack itself was fixed). `(<[^()]*>)?` optionally allows one
// non-nested generic clause — doesn't handle deeply nested generics like useState<Array<T>>, but
// that's a reasonable bound and strictly better than matching nothing at all.
function usesBareHook(clean, hook) {
  return new RegExp(`(^|[^\\w.])${hook}\\s*(<[^()]*>)?\\s*\\(`).test(clean);
}

function usesNamespacedHook(clean, hook) {
  return new RegExp(`(^|[^\\w.])React\\.${hook}\\s*(<[^()]*>)?\\s*\\(`).test(clean);
}

/** Collect identifiers inside `{ a, b as c }` from all `import … from 'react'` lines. */
function collectNamedImportsFromReact(code) {
  const set = new Set();
  const re = /import\s+([^;]+?)\s+from\s+['"]react['"]/g;
  let m;
  while ((m = re.exec(code))) {
    const clause = m[1];
    const br = clause.match(/\{([^}]+)\}/);
    if (!br) continue;
    br[1].split(",").forEach((p) => {
      const name = p.trim().split(/\s+as\s+/)[0].trim();
      if (name) set.add(name);
    });
  }
  return set;
}

function hasReactNamespaceImport(code) {
  return /import\s*\*\s*as\s+React\s+from\s+['"]react['"]/.test(code);
}

/**
 * @param {string} userCode
 * @returns {{ ok: true } | { ok: false, feedback: string, errors: string[], hint?: string }}
 */
export function checkReactHookImports(userCode) {
  const code = String(userCode || "");
  const clean = stripComments(code);
  if (!clean.trim()) return { ok: true };

  const named = collectNamedImportsFromReact(code);
  const ns = hasReactNamespaceImport(code);

  for (const hook of HOOK_NAMES) {
    if (!usesBareHook(clean, hook)) continue;
    if (named.has(hook)) continue;
    if (ns && usesNamespacedHook(clean, hook)) continue;
    return {
      ok: false,
      feedback: `This step uses ${hook}(), but it is not imported from 'react'. Add it to your import line (e.g. import { ${hook} } from 'react') or call it as React.${hook} with import * as React from 'react'.`,
      errors: [`Hook ${hook} is used before being imported from 'react'.`],
      hint: `Import ${hook} from 'react' in the same file before using it.`,
    };
  }
  return { ok: true };
}
