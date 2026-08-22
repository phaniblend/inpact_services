/**
 * Sanitize all content/<track>/*_lesson.json files: one lesson at a time.
 * - Remove duplicate/redundant steps (same or near-same instruction)
 * - Renumber step ids and phase strings; sync sideItems
 * - Trim redundant wording in instruction, feedback, successCriteria
 * - Log issues for manual review (e.g. inconsistent values)
 *
 * Run: node scripts/sanitize-content-lessons.js
 * Optional: FROM_TRACK=react-js FROM_INDEX=0 LIMIT=50 (process a subset)
 * Progress: logs each file and writes a sanitize-lessons-report.json when done.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const CONTENT_DIR = process.env.CONTENT_DIR || path.join(rootDir, "content");

const FROM_TRACK = process.env.FROM_TRACK || null;
const FROM_INDEX = Number(process.env.FROM_INDEX) || 0;
const LIMIT = process.env.LIMIT ? Number(process.env.LIMIT) : null;

const report = { processed: 0, modified: 0, stepsRemoved: 0, issues: [] };

function normalizeForCompare(s) {
  if (typeof s !== "string") return "";
  return s
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.,!?;:'"]/g, "")
    .trim();
}

function trimRedundant(text) {
  if (typeof text !== "string") return text;
  let t = text.trim();
  const prefixes = [
    "Let's try again. ",
    "Let's try again. ",
    "Remember to ",
    "You need to ",
    "Make sure to ",
    "Don't forget to ",
  ];
  for (const p of prefixes) {
    if (t.startsWith(p)) t = t.slice(p.length).trim();
  }
  return t.replace(/\s+/g, " ").trim();
}

function trimSuccessCriteria(items) {
  if (!Array.isArray(items)) return items;
  return items.map((s) => (typeof s === "string" ? trimRedundant(s) : s)).filter(Boolean);
}

function isDuplicateStep(step, seenInstructions) {
  const norm = normalizeForCompare(step.instruction || "");
  if (!norm || norm.length < 10) return false;
  for (const seen of seenInstructions) {
    if (norm === seen) return true;
    if (norm.length > 30 && seen.length > 30 && norm.includes(seen.slice(0, 40))) return true;
    if (seen.length > 30 && norm.length > 30 && seen.includes(norm.slice(0, 40))) return true;
  }
  return false;
}

function isRedundantStep(step, prevStep) {
  if (!prevStep) return false;
  const cur = normalizeForCompare(step.instruction || "");
  const prev = normalizeForCompare(prevStep.instruction || "");
  if (cur.length < 15) return false;
  if (cur === prev) return true;
  if (cur.startsWith(prev) || prev.startsWith(cur)) return true;
  return false;
}

function sanitizeSteps(steps) {
  if (!Array.isArray(steps) || steps.length === 0) return steps;
  const seen = [];
  const kept = [];
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    const id = s?.id;
    const instruction = (s?.instruction || "").trim();
    const seedCode = (s?.seedCode || "").trim();
    if (!instruction && !seedCode && !s?.title) continue;
    const norm = normalizeForCompare(instruction);
    if (isDuplicateStep(s, seen)) {
      report.stepsRemoved++;
      continue;
    }
    if (i > 0 && isRedundantStep(s, steps[i - 1])) {
      report.stepsRemoved++;
      continue;
    }
    seen.push(norm);
    kept.push({
      ...s,
      instruction: trimRedundant(instruction) || instruction,
      feedbackCorrect: trimRedundant(s?.feedbackCorrect || "") || s?.feedbackCorrect,
      feedbackPartial: trimRedundant(s?.feedbackPartial || "") || s?.feedbackPartial,
      feedbackWrong: trimRedundant(s?.feedbackWrong || "") || s?.feedbackWrong,
      successCriteria: trimSuccessCriteria(s?.successCriteria) || s?.successCriteria,
    });
  }
  return kept;
}

function renumberSteps(steps) {
  const n = steps.length;
  return steps.map((s, i) => ({
    ...s,
    id: `step${i + 1}`,
    phase: `Step ${i + 1} of ${n}`,
  }));
}

function buildSideItems(config) {
  const steps = config?.steps || [];
  const items = [
    { label: "Intro", id: "intro" },
    { label: "Objectives", id: "objectives" },
  ];
  steps.forEach((s) => {
    items.push({ label: s.title || s.id, id: s.id });
  });
  return items;
}

function sanitizeOne(filePath) {
  let raw;
  try {
    raw = fs.readFileSync(filePath, "utf8");
  } catch (e) {
    report.issues.push({ file: filePath, error: e.message });
    return false;
  }
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    report.issues.push({ file: filePath, error: "Invalid JSON: " + e.message });
    return false;
  }
  const config = data.config ?? data;
  if (!config || !Array.isArray(config.steps)) {
    report.issues.push({ file: filePath, error: "Missing config.steps" });
    return false;
  }
  const originalCount = config.steps.length;
  let steps = sanitizeSteps(config.steps);
  steps = renumberSteps(steps);
  if (steps.length === 0) {
    report.issues.push({ file: filePath, error: "No steps left after sanitize" });
    return false;
  }
  config.steps = steps;
  config.sideItems = buildSideItems(config);
  const modified = steps.length !== originalCount || JSON.stringify(data) !== raw;
  if (modified) report.modified++;
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    report.issues.push({ file: filePath, error: "Write failed: " + e.message });
    return false;
  }
  return true;
}

function collectFiles() {
  const files = [];
  const dirs = fs.readdirSync(CONTENT_DIR, { withFileTypes: true }).filter((d) => d.isDirectory());
  const tracks = FROM_TRACK ? dirs.filter((d) => d.name === FROM_TRACK) : dirs;
  tracks.sort((a, b) => a.name.localeCompare(b.name));
  for (const dir of tracks) {
    const trackPath = path.join(CONTENT_DIR, dir.name);
    const list = fs.readdirSync(trackPath).filter((f) => f.endsWith("_lesson.json"));
    list.sort();
    for (const f of list) {
      files.push(path.join(trackPath, f));
    }
  }
  return files;
}

function main() {
  const allFiles = collectFiles();
  let files = allFiles;
  if (FROM_INDEX > 0 || LIMIT != null) {
    files = allFiles.slice(FROM_INDEX, LIMIT != null ? FROM_INDEX + LIMIT : undefined);
  }
  console.log(`Content dir: ${CONTENT_DIR}`);
  console.log(`Total lesson files: ${allFiles.length}`);
  console.log(`Processing: ${files.length} (FROM_INDEX=${FROM_INDEX}, LIMIT=${LIMIT ?? "all"})\n`);

  const start = Date.now();
  for (let i = 0; i < files.length; i++) {
    const fp = files[i];
    const rel = path.relative(rootDir, fp);
    report.processed++;
    const ok = sanitizeOne(fp);
    if ((i + 1) % 50 === 0 || !ok) {
      console.log(`[${i + 1}/${files.length}] ${ok ? "ok" : "FAIL"} ${rel}`);
    }
  }
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\nDone in ${elapsed}s. Processed: ${report.processed}, Modified: ${report.modified}, Steps removed: ${report.stepsRemoved}`);
  if (report.issues.length) {
    console.log(`Issues: ${report.issues.length}`);
    report.issues.forEach((i) => console.log(`  ${i.file}: ${i.error}`));
  }
  const reportPath = path.join(rootDir, "sanitize-lessons-report.json");
  fs.writeFileSync(reportPath, JSON.stringify({ ...report, elapsed: Number(elapsed) }, null, 2), "utf8");
  console.log(`Report: ${reportPath}`);
}

main();
