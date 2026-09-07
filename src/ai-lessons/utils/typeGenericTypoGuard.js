/**
 * TypeScript: catch a typo'd generic type argument on a React hook — useState<Finanials> when the
 * learner actually defined `type Financials` two lines above. Complements AI validation, which
 * proved non-deterministic on this exact pattern (found live 2026-09-07: the identical broken code,
 * unchanged, failed on one "Check my code" click and passed on the next — the AI's own judgment on
 * a subtle single-letter typo isn't reliable enough to be the only line of defense).
 *
 * Deliberately narrow to avoid false positives: only flags a generic type argument that is NOT
 * defined anywhere in the code AND is a near-miss (edit distance 1-2, scaled to name length) of a
 * type the learner DID define in this same file. A generic referencing a real global type
 * (HTMLInputElement, Event, etc.) or an intentionally different name is left alone — this only
 * fires when there's a strong, near-certain signal of "you meant the type right there.”
 */
const HOOK_NAMES = [
  "useState",
  "useReducer",
  "useRef",
  "useContext",
  "useMemo",
  "useCallback",
];

function stripComments(code) {
  return String(code)
    .replace(/\/\/[^\n]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
}

/** Collect `type X = ...` / `interface X ...` / `class X ...` names defined in this submission. */
function collectLocalTypeNames(clean) {
  const names = new Set();
  const patterns = [
    /\btype\s+([A-Za-z_$][\w$]*)\s*(?:<[^=]*>)?\s*=/g,
    /\binterface\s+([A-Za-z_$][\w$]*)/g,
    /\bclass\s+([A-Za-z_$][\w$]*)/g,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(clean))) names.add(m[1]);
  }
  return names;
}

/** Bare hook<TypeArg>( usages where TypeArg is a single identifier (optionally array-suffixed) —
 * the common, simple case; complex generics (unions, nested generics) are intentionally skipped
 * rather than risk a false flag on something this regex can't parse confidently. */
function collectHookGenericUsages(clean) {
  const usages = [];
  for (const hook of HOOK_NAMES) {
    const re = new RegExp(`(?:^|[^\\w.])${hook}\\s*<\\s*([A-Za-z_$][\\w$]*)(?:\\[\\])?\\s*>`, "g");
    let m;
    while ((m = re.exec(clean))) usages.push({ hook, typeArg: m[1] });
  }
  return usages;
}

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/** How many edits still count as "clearly the same word, typo'd" — scales gently with length so a
 * 3-letter name isn't matched against everything, but a longer name allows a bit more slack. */
function typoThreshold(len) {
  if (len <= 5) return 1;
  if (len <= 9) return 2;
  return 3;
}

/**
 * @param {string} userCode
 * @returns {{ ok: true } | { ok: false, feedback: string, errors: string[], hint?: string }}
 */
export function checkGenericTypeTypos(userCode) {
  const code = String(userCode || "");
  const clean = stripComments(code);
  if (!clean.trim()) return { ok: true };

  const localTypes = collectLocalTypeNames(clean);
  if (localTypes.size === 0) return { ok: true };
  const usages = collectHookGenericUsages(clean);

  for (const { hook, typeArg } of usages) {
    if (localTypes.has(typeArg)) continue; // exact match — genuinely fine
    let bestMatch = null;
    let bestDist = Infinity;
    for (const defined of localTypes) {
      if (defined === typeArg) continue;
      const dist = levenshtein(typeArg, defined);
      if (dist < bestDist) {
        bestDist = dist;
        bestMatch = defined;
      }
    }
    if (bestMatch && bestDist <= typoThreshold(Math.max(typeArg.length, bestMatch.length))) {
      return {
        ok: false,
        feedback: `\`${hook}<${typeArg}>\` doesn't match the type you defined. You wrote \`${typeArg}\`, but the type in this file is \`${bestMatch}\` — that's almost certainly a typo. Fix it to:

\`\`\`
${hook}<${bestMatch}>
\`\`\``,
        errors: [`\`${typeArg}\` does not match the defined type \`${bestMatch}\` (likely a typo).`],
        hint: `Change \`${typeArg}\` to \`${bestMatch}\` in the ${hook}<...> generic.`,
      };
    }
  }
  return { ok: true };
}
