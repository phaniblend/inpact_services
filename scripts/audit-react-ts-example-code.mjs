/**
 * Audits `example_code` on every question step in React-TS engines (inpact_ts01–ts122).
 *
 * Pattern (import-from-React steps):
 *   - Task mentions bringing in React / hooks from 'react'
 *   - `example_code` must be real import syntax, include `from 'react'` or `from "react"`,
 *     and show an analogous named hook (e.g. `import React, { useEffect } from 'react'`)
 *     — not prose-only or comment-only placeholders.
 *
 * Usage:
 *   node scripts/audit-react-ts-example-code.mjs
 *   node scripts/audit-react-ts-example-code.mjs --ci           # same exit rules as default
 *   node scripts/audit-react-ts-example-code.mjs --strict       # exit 1 on warnings too
 *   node scripts/audit-react-ts-example-code.mjs --skip-unparseable  # ignore engines that fail to load
 *   node scripts/audit-react-ts-example-code.mjs --summary-only       # counts only, no per-step list
 *
 * @see src/engines/inpact_engine_shared.jsx — looksLikeCodeSnippet, resolveQuestionStepExample
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENGINES_DIR = path.join(__dirname, "../src/engines/react-ts");

const ci = process.argv.includes("--ci");
const strict = process.argv.includes("--strict");
/** Do not exit 1 when engine files fail to parse (e.g. placeholder lessons). */
const skipUnparseable = process.argv.includes("--skip-unparseable");
const summaryOnly = process.argv.includes("--summary-only");

/** Load engine config (NODES + metadata) without importing shared engine. */
function loadEngineConfig(absPath) {
  let raw = fs.readFileSync(absPath, "utf8").replace(/\r\n/g, "\n");
  raw = raw.replace(/^import\s+createINPACTEngine\s+from\s+['"][^'"]+['"];\s*/m, "");
  if (!/export\s+default\s+createINPACTEngine\s*\(/m.test(raw)) {
    throw new Error("missing export default createINPACTEngine(");
  }
  raw = raw.replace(/export\s+default\s+createINPACTEngine\s*\(/, "return createINPACTEngine(");
  const factory = new Function("createINPACTEngine", raw);
  return factory((cfg) => cfg);
}

function looksLikeCodeSnippet(t) {
  if (typeof t !== "string") return false;
  const s = t.trim();
  if (!s) return false;
  const lowered = s.toLowerCase();
  if (/^like\s+/i.test(s) || /^example[:\s]/i.test(lowered) || /^before\s+/i.test(lowered)) return false;
  return (
    /\bimport\b/.test(s) ||
    /\bconst\b/.test(s) ||
    /\bfunction\b/.test(s) ||
    /\blet\b/.test(s) ||
    /\bvar\b/.test(s) ||
    /\breturn\b/.test(s) ||
    /\buseState\b/.test(s) ||
    /\bonClick\b/.test(s) ||
    /\bonChange\b/.test(s) ||
    /\binterface\b/.test(s) ||
    /\bclass\b/.test(s) ||
    /\btype\s+[A-Za-z_$][\w$]*\s*=/.test(s) ||
    /=>/.test(s) ||
    /<\s*[A-Za-z]/.test(s) ||
    /\bexport\b/.test(s)
  );
}

/** Other packages whose name contains "react" — not `from 'react'`. */
const NON_REACT_CORE = /react-router|react-dom\/|@redux|@tanstack|next\/|@mui|emotion|zustand|axios|redux|createApi\b/i;

/** Step is about importing from the **react** package (`'react'`), not react-router etc. */
function isImportFromReactPackageStep(node) {
  const blob = `${node.paal || ""}\n${node.hint || ""}\n${node.expected || ""}`;
  if (!/\bimport\b/i.test(blob)) return false;
  if (NON_REACT_CORE.test(blob)) return false;
  if (/\brouter\b|\bBrowserRouter\b|\bRoutes\b|\bRoute\b|\bLink\b|\buseNavigate\b|\buseParams\b|\bNavigate\b/i.test(blob))
    return false;
  if (/\bfrom\s+['"]react['"]/.test(blob)) return true;
  const low = blob.toLowerCase();
  // "import useState from React" / hooks from react (lesson 1 style)
  if (
    /\busestate\b|\buseeffect\b|\buseref\b|\busememo\b|\busecallback\b/.test(low) &&
    /\breact\b/.test(low) &&
    !/react-router/.test(low)
  ) {
    return true;
  }
  return false;
}

/** example_code should demonstrate default + named from 'react' when task is import-from-react. */
function importExampleMatchesPattern(example) {
  const t = String(example || "").trim();
  if (!/^\s*import\s+/m.test(t)) return false;
  if (!/\bfrom\s+['"]react['"]\s*;?\s*$/m.test(t) && !/\bfrom\s+['"]react['"]\s*$/m.test(t.trim())) {
    // allow trailing comment
    if (!/\bfrom\s+['"]react['"]/.test(t)) return false;
  }
  // Prefer showing both default React and named binding (analogous hook), e.g. useEffect vs useState
  const hasNamedBrace = /\{\s*[A-Za-z_$][\w$]*/.test(t);
  const hasReactDefault = /\bimport\s+React\s*,/.test(t) || /\bimport\s+React\s+from/.test(t);
  return hasNamedBrace && hasReactDefault;
}

function onlyCommentsOrBlank(s) {
  const lines = String(s).split("\n").map((l) => l.trim());
  const nonEmpty = lines.filter(Boolean);
  if (nonEmpty.length === 0) return true;
  return nonEmpty.every((l) => l.startsWith("//") || l.startsWith("/*"));
}

function auditQuestionNode(lessonFile, lessonNum, node, stepLabel) {
  const issues = { errors: [], warnings: [] };
  const ex = node.example_code;
  const paal = node.paal || "";

  if (typeof ex !== "string" || !ex.trim()) {
    issues.errors.push(`${stepLabel}: missing or empty example_code`);
    return issues;
  }

  if (onlyCommentsOrBlank(ex)) {
    issues.errors.push(`${stepLabel}: example_code is only comments or whitespace`);
    return issues;
  }

  if (!looksLikeCodeSnippet(ex)) {
    issues.warnings.push(
      `${stepLabel}: example_code may not pass looksLikeCodeSnippet (add import/const/JSX/etc.)`
    );
  }

  if (isImportFromReactPackageStep(node)) {
    if (!/^\s*import\s+/m.test(ex.trim())) {
      issues.errors.push(
        `${stepLabel}: import-from-'react' step: example_code should start with an import statement`
      );
    }
    if (!/\bfrom\s+['"]react['"]/.test(ex)) {
      issues.errors.push(
        `${stepLabel}: import-from-'react' step: example_code must include from 'react' or from "react"`
      );
    }
    if (!importExampleMatchesPattern(ex)) {
      issues.warnings.push(
        `${stepLabel}: prefer analogous pattern: import React, { SomeHook } from 'react' (default React + named hook; use a different hook than the task when possible)`
      );
    }
  }

  return issues;
}

function main() {
  const files = fs
    .readdirSync(ENGINES_DIR)
    .filter((f) => /^inpact_ts\d+_engine\.jsx$/i.test(f))
    .sort((a, b) => {
      const na = parseInt(a.match(/ts(\d+)/i)[1], 10);
      const nb = parseInt(b.match(/ts(\d+)/i)[1], 10);
      return na - nb;
    });

  let totalSteps = 0;
  let errCount = 0;
  let warnCount = 0;
  const rows = [];

  for (const file of files) {
    const abs = path.join(ENGINES_DIR, file);
    const n = parseInt(file.match(/ts(\d+)/i)[1], 10);
    let cfg;
    try {
      cfg = loadEngineConfig(abs);
    } catch (e) {
      rows.push({ file, n, fatal: e.message });
      errCount++;
      continue;
    }

    const nodes = cfg.NODES || [];
    let q = 0;
    for (const node of nodes) {
      if (node.type !== "question") continue;
      q++;
      totalSteps++;
      const stepLabel = `${file} · ${node.id || `step${q}`} (${node.phase || `step ${q}`})`;
      const r = auditQuestionNode(file, n, node, stepLabel);
      if (r.errors.length || r.warnings.length) {
        rows.push({ file, n, stepLabel, ...r });
        errCount += r.errors.length;
        warnCount += r.warnings.length;
      }
    }
  }

  console.log(`React-TS example_code audit`);
  console.log(`Engines scanned: ${files.length}`);
  console.log(`Question steps checked: ${totalSteps}`);
  console.log(`Steps with issues: ${rows.filter((r) => !r.fatal && (r.errors?.length || r.warnings?.length)).length}`);
  console.log(`Fatal load errors: ${rows.filter((r) => r.fatal).length}`);
  console.log(`Error lines: ${errCount}`);
  console.log(`Warning lines: ${warnCount}\n`);

  if (!summaryOnly) {
    for (const r of rows) {
      if (r.fatal) {
        console.log(`--- ${r.file} (lesson ${r.n}) — FATAL: ${r.fatal}`);
        continue;
      }
      console.log(`--- ${r.stepLabel}`);
      r.errors?.forEach((m) => console.log(`  ERROR: ${m}`));
      r.warnings?.forEach((m) => console.log(`  WARN:  ${m}`));
    }
  }

  const fatalCount = rows.filter((r) => r.fatal).length;
  const exitFail =
    errCount > 0 ||
    (!skipUnparseable && fatalCount > 0) ||
    (strict && warnCount > 0);

  if (exitFail) {
    console.error("\nAudit failed.");
    if (fatalCount && !skipUnparseable) {
      console.error(`Fix ${fatalCount} engine file(s) that do not load, or run with --skip-unparseable.`);
    }
    process.exit(1);
  }
  console.log("\nAudit passed (no errors" + (strict ? "; no warnings" : "") + ").");
  if (fatalCount === 0 && warnCount > 0 && !strict) {
    console.log(`Note: ${warnCount} warning(s) above (use --strict to fail on warnings).`);
  }
}

main();
