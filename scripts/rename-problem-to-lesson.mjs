/**
 * One-off: rename product terminology "lesson" -> "lesson" (matching case).
 * Preserves CS/algo terms: subproblem(s), schema step type "lesson", scale-problem, z.literal("problem").
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "coverage",
]);
const EXT_OK = new Set([
  ".jsx",
  ".js",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".json",
  ".md",
  ".mdc",
  ".css",
  ".html",
]);

function walk(dir, out = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (EXT_OK.has(path.extname(e.name))) out.push(p);
  }
  return out;
}

function protect(s) {
  const tokens = [];
  let t = s;

  const stash = (re) => {
    t = t.replace(re, (m) => {
      const i = tokens.length;
      tokens.push(m);
      return `\0GUARD${i}\0`;
    });
  };

  // Algorithm / schema tokens (must not become "lesson")
  stash(/\bscale-lesson\b/g);
  stash(/z\.literal\(\s*["']lesson["']\s*\)/g);
  stash(/["']type["']\s*:\s*["']lesson["']/g);
  stash(/\btype:\s*["']lesson["']/g);
  // "lesson" as algo step key in JSON structures
  stash(/"lesson"\s*:\s*z\.object/g);
  stash(/lesson:\s*z\.object/g);

  // DP / algorithms vocabulary
  stash(/\bsubproblems\b/gi);
  stash(/\bsubproblem\b/gi);

  return { text: t, tokens };
}

function unstash(text, tokens) {
  let t = text;
  for (let i = 0; i < tokens.length; i++) {
    t = t.split(`\0GUARD${i}\0`).join(tokens[i]);
  }
  return t;
}

function transform(content) {
  let s = content;

  // 1. Identifiers (longest first)
  const idPairs = [
    ["setLessonIndex", "setLessonIndex"],
    ["getLessonList", "getLessonList"],
    ["onNextLesson", "onNextLesson"],
    ["onPrevLesson", "onPrevLesson"],
    ["pendingLesson", "pendingLesson"],
    ["selectedLesson", "selectedLesson"],
    ["lessonIndex", "lessonIndex"],
    ["lessonList", "lessonList"],
    ["lessonNum", "lessonNum"],
  ];
  for (const [a, b] of idPairs) {
    s = s.split(a).join(b);
  }

  const { text: p, tokens } = protect(s);
  s = p;

  // 2. Word-boundary case variants (after identifiers so lessonNum is gone)
  s = s.replace(/\bProblems\b/g, "Lessons");
  s = s.replace(/\bproblems\b/g, "lessons");
  s = s.replace(/\bProblem\b/g, "Lesson");
  s = s.replace(/\bproblem\b/g, "lesson");

  s = unstash(s, tokens);

  return s;
}

function main() {
  const files = walk(ROOT);
  let changed = 0;
  for (const file of files) {
    const before = fs.readFileSync(file, "utf8");
    const after = transform(before);
    if (after !== before) {
      fs.writeFileSync(file, after, "utf8");
      changed++;
      console.log(path.relative(ROOT, file));
    }
  }
  console.error(`Done. ${changed} files updated.`);
}

main();
