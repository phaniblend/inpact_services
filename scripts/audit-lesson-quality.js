/**
 * Read-only audit of content/<track>/*_lesson.json:
 * - Non-empty instructions, unique step ids, phase matches step count
 * - React tracks: hooks used in seed must have import in prior-or-same step (dependency order)
 * - Optional: seed length regression between consecutive steps (warning)
 *
 * Run: node scripts/audit-lesson-quality.js
 * Strict (exit 1 on any issue): AUDIT_STRICT=1 node scripts/audit-lesson-quality.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const CONTENT_DIR = process.env.CONTENT_DIR || path.join(rootDir, "content");
const STRICT = String(process.env.AUDIT_STRICT || "").toLowerCase() === "1" || process.env.AUDIT_STRICT === "true";

const REACT_TRACKS = new Set(["react-js", "react-ts"]);

/** Tracks where phase is not globally "Step k of n" (nested phases, algo flow). */
const SKIP_GLOBAL_PHASE = new Set(["algorithms", "algo-js", "algo-ts", "algo-python", "algo-java"]);

const HOOKS = ["useState", "useEffect", "useRef", "useContext", "useReducer", "useMemo", "useCallback"];

function hasInstructionLike(s) {
  if ((s.instruction || s.paal || "").trim()) return true;
  if (s.content && typeof s.content.prompt === "string" && s.content.prompt.trim()) return true;
  const body = s.content && s.content.body;
  if (typeof body === "string" && body.trim() && body !== "(No content)") return true;
  return false;
}

function isQuestionLikeStep(s) {
  const t = s.type;
  return !t || t === "question";
}

function collectFiles() {
  const files = [];
  const dirs = fs.readdirSync(CONTENT_DIR, { withFileTypes: true }).filter((d) => d.isDirectory());
  dirs.sort((a, b) => a.name.localeCompare(b.name));
  for (const dir of dirs) {
    const trackPath = path.join(CONTENT_DIR, dir.name);
    const list = fs.readdirSync(trackPath).filter((f) => f.endsWith("_lesson.json"));
    list.sort();
    for (const f of list) files.push({ track: dir.name, path: path.join(trackPath, f) });
  }
  return files;
}

function stripComments(s) {
  return String(s || "")
    .replace(/\/\/[^\n]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
}

function hooksUsedInSeed(seed) {
  const clean = stripComments(seed);
  return HOOKS.filter((h) => new RegExp(`(^|[^\\w.])${h}\\s*\\(`).test(clean));
}

function importCoversHook(seed, hook) {
  const s = seed || "";
  if (!s.includes("import")) return false;
  const named = /\{([^}]+)\}\s*from\s+['"]react['"]/.exec(s);
  if (named && named[1].includes(hook)) return true;
  if (/import\s*\*\s*as\s+React\s+from\s+['"]react['"]/.test(s) && new RegExp(`React\\.${hook}\\s*\\(`).test(stripComments(s)))
    return true;
  return false;
}

function auditReactDependencies(steps, fileRel) {
  const issues = [];
  for (let i = 0; i < steps.length; i++) {
    const seed = steps[i].seedCode || "";
    const used = hooksUsedInSeed(seed);
    if (used.length === 0) continue;
    const priorAndCurrent = steps.slice(0, i + 1);
    for (const hook of used) {
      const ok = priorAndCurrent.some((st) => importCoversHook(st.seedCode || "", hook));
      if (!ok) issues.push({ type: "react_hook_import", file: fileRel, step: i + 1, hook });
    }
  }
  return issues;
}

function auditOne(entry) {
  const { track, path: filePath } = entry;
  const rel = path.relative(rootDir, filePath);
  const issues = [];
  let raw;
  try {
    raw = fs.readFileSync(filePath, "utf8");
  } catch (e) {
    return { rel, error: e.message, issues: [] };
  }
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    return { rel, error: `Invalid JSON: ${e.message}`, issues: [] };
  }
  const config = data.config ?? data;
  const steps = config?.steps;
  if (!Array.isArray(steps) || steps.length === 0) {
    issues.push({ type: "no_steps", file: rel });
    return { rel, issues };
  }

  const n = steps.length;
  const seenIds = new Set();
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    if (isQuestionLikeStep(s) && !hasInstructionLike(s)) {
      issues.push({ type: "empty_instruction", file: rel, step: i + 1, id: s.id });
    }
    const id = s.id;
    if (id) {
      if (seenIds.has(id)) issues.push({ type: "duplicate_step_id", file: rel, id });
      seenIds.add(id);
    }
    const phase = s.phase || "";
    const m = phase.match(/Step\s+(\d+)\s+of\s+(\d+)/i);
    if (m && !SKIP_GLOBAL_PHASE.has(track) && isQuestionLikeStep(s)) {
      const a = parseInt(m[1], 10);
      const b = parseInt(m[2], 10);
      if (b !== n || a !== i + 1) issues.push({ type: "phase_mismatch", file: rel, step: i + 1, phase, expected: `Step ${i + 1} of ${n}` });
    }
    if (i > 0 && isQuestionLikeStep(s) && REACT_TRACKS.has(track)) {
      const prevLen = (steps[i - 1].seedCode || "").length;
      const curLen = (s.seedCode || "").length;
      if (prevLen > 200 && curLen < prevLen * 0.35) {
        issues.push({ type: "seed_regression_warning", file: rel, step: i + 1, prevLen, curLen });
      }
    }
  }

  if (REACT_TRACKS.has(track)) {
    issues.push(...auditReactDependencies(steps, rel));
  }

  return { rel, issues };
}

function main() {
  const entries = collectFiles();
  const report = { scanned: 0, filesWithIssues: 0, issues: [], strict: STRICT };
  for (const entry of entries) {
    report.scanned++;
    const r = auditOne(entry);
    if (r.error) {
      report.issues.push({ type: "file_error", file: r.rel, message: r.error });
      report.filesWithIssues++;
      continue;
    }
    if (r.issues.length) {
      report.filesWithIssues++;
      report.issues.push(...r.issues.map((x) => ({ ...x, file: x.file || r.rel })));
    }
  }

  const outPath = path.join(rootDir, "audit-lesson-quality-report.json");
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");

  const critical = report.issues.filter((x) => x.type !== "seed_regression_warning");
  const warnings = report.issues.filter((x) => x.type === "seed_regression_warning");

  console.log(`Audit: ${report.scanned} files, ${report.filesWithIssues} with issues`);
  console.log(`  Critical: ${critical.length}, Warnings (seed regression): ${warnings.length}`);
  console.log(`Report: ${outPath}`);

  if (critical.length && critical.length <= 40) {
    critical.forEach((x) => console.log(`  - ${JSON.stringify(x)}`));
  } else if (critical.length) {
    console.log(`  (${critical.length} critical issues — see JSON report)`);
  }

  if (STRICT && critical.length) {
    console.error("AUDIT_STRICT: failing due to critical issues.");
    process.exit(1);
  }
}

main();
