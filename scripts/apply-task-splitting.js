/**
 * Apply task-splitting conventions across all content/<track>/*_lesson.json.
 *
 * Conventions applied:
 * 1. Shorten feedbackCorrect: if longer than MAX_CORRECT_FEEDBACK_LEN, replace with brief phrase.
 * 2. Scope createApi micro-step: if step is "Create API using createApi" and next step is
 *    "Define baseQuery and endpoints", set analogousExample to createApi({}) only and
 *    evaluation.required to ["createApi", "="] so any variable name passes.
 * 3. Report (optional): steps that look like multi-package imports or compounded instructions.
 *
 * Run: node scripts/apply-task-splitting.js
 * Dry run: DRY_RUN=1 node scripts/apply-task-splitting.js
 * Limit: LIMIT=50 node scripts/apply-task-splitting.js
 * Track: FROM_TRACK=react-js node scripts/apply-task-splitting.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const CONTENT_DIR = process.env.CONTENT_DIR || path.join(rootDir, "content");

const DRY_RUN = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";
const FROM_TRACK = process.env.FROM_TRACK || null;
const FROM_INDEX = Number(process.env.FROM_INDEX) || 0;
const LIMIT = process.env.LIMIT ? Number(process.env.LIMIT) : null;

const MAX_CORRECT_FEEDBACK_LEN = 60;
const SHORT_CORRECT_FEEDBACK = "Nice! Proceed to the next step.";

const report = {
  processed: 0,
  modified: 0,
  feedbackShortened: 0,
  createApiExampleScoped: 0,
  createApiEvaluationFixed: 0,
  issues: [],
  multiPackageImportSteps: [],
};

function collectFiles() {
  const files = [];
  const dirs = fs.readdirSync(CONTENT_DIR, { withFileTypes: true }).filter((d) => d.isDirectory());
  const tracks = FROM_TRACK ? dirs.filter((d) => d.name === FROM_TRACK) : dirs;
  tracks.sort((a, b) => a.name.localeCompare(b.name));
  for (const dir of tracks) {
    const trackPath = path.join(CONTENT_DIR, dir.name);
    const list = fs.readdirSync(trackPath).filter((f) => f.endsWith("_lesson.json"));
    list.sort();
    for (const f of list) files.push(path.join(trackPath, f));
  }
  return files;
}

/** True if this step is "Create a new API service using createApi" (micro-step only). */
function isCreateApiOnlyStep(step, nextStep) {
  const title = (step.title || "").toLowerCase();
  const inst = (step.instruction || "").toLowerCase();
  const nextTitle = ((nextStep && nextStep.title) || "").toLowerCase();
  const createOnly =
    (title.includes("create") && title.includes("api") && title.includes("createapi")) ||
    inst.includes("create a new api service") ||
    (inst.includes("create") && inst.includes("api service") && inst.includes("createapi"));
  const nextIsConfig =
    nextTitle.includes("basequery") ||
    nextTitle.includes("base query") ||
    nextTitle.includes("endpoints");
  return createOnly && nextIsConfig;
}

/** Scope example to createApi({}) only and fix evaluation to allow any variable name. */
function applyCreateApiMicroStepScope(step, nextStep) {
  if (!isCreateApiOnlyStep(step, nextStep)) return step;
  let out = { ...step };
  const example = (step.analogousExample || "").trim();
  const hasFullConfig =
    example.includes("baseQuery") && (example.includes("endpoints") || example.includes("builder"));
  if (hasFullConfig) {
    out.analogousExample =
      "// Example: creating an API service (this step only — config comes next)\nconst api = createApi({});";
    report.createApiExampleScoped++;
  }
  const req = step.evaluation && step.evaluation.required;
  if (Array.isArray(req) && req.includes("api") && req.includes("createApi")) {
    out.evaluation = {
      ...step.evaluation,
      required: ["createApi", "="],
    };
    report.createApiEvaluationFixed++;
  }
  return out;
}

/** Shorten feedbackCorrect to one brief sentence. */
function shortenFeedbackCorrect(step) {
  const fb = step.feedbackCorrect;
  if (typeof fb !== "string" || fb.length <= MAX_CORRECT_FEEDBACK_LEN) return step;
  return {
    ...step,
    feedbackCorrect: SHORT_CORRECT_FEEDBACK,
  };
}

/** Detect multi-package import step for reporting. */
function detectMultiPackageImport(step) {
  const inst = (step.instruction || "").toLowerCase();
  const fromReact = /from\s+['"]react['"]/.test(inst);
  const fromRedux = /@reduxjs\/toolkit/.test(inst);
  const fromVue = /from\s+['"]vue['"]/.test(inst);
  const fromAngular = /@angular\/core/.test(inst);
  const packages = [fromReact, fromRedux, fromVue, fromAngular].filter(Boolean).length;
  if (packages >= 2) return true;
  // Single instruction mentioning two different import sources
  const matches = inst.match(/from\s+['"][^'"]+['"]/g);
  if (matches && matches.length >= 2) {
    const uniq = new Set(matches.map((m) => m.replace(/\s/g, "")));
    if (uniq.size >= 2) return true;
  }
  return false;
}

function applyTaskSplittingOne(filePath) {
  let raw;
  try {
    raw = fs.readFileSync(filePath, "utf8");
  } catch (e) {
    report.issues.push({ file: path.relative(rootDir, filePath), error: e.message });
    return false;
  }
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    report.issues.push({ file: path.relative(rootDir, filePath), error: "Invalid JSON: " + e.message });
    return false;
  }
  const config = data.config ?? data;
  if (!config || !Array.isArray(config.steps) || config.steps.length === 0) return false;

  let steps = config.steps;
  let modified = false;

  for (let i = 0; i < steps.length; i++) {
    let step = steps[i];
    if (step.type !== "question") continue;

    // 1) Shorten long feedbackCorrect
    const shortened = shortenFeedbackCorrect(step);
    if (shortened !== step) {
      step = shortened;
      report.feedbackShortened++;
      modified = true;
    }

    // 2) Scope createApi-only step: example and evaluation
    const nextStep = steps[i + 1] || null;
    const scoped = applyCreateApiMicroStepScope(step, nextStep);
    if (scoped !== step) {
      step = scoped;
      modified = true;
    }

    // 3) Report multi-package import steps
    if (detectMultiPackageImport(step)) {
      report.multiPackageImportSteps.push({
        file: path.relative(rootDir, filePath),
        stepId: step.id,
        title: step.title,
      });
    }

    steps[i] = step;
  }

  config.steps = steps;
  if (!modified) return true;

  report.modified++;
  if (DRY_RUN) return true;

  const newRaw = JSON.stringify(data, null, 2);
  try {
    fs.writeFileSync(filePath, newRaw, "utf8");
  } catch (e) {
    report.issues.push({ file: path.relative(rootDir, filePath), error: "Write: " + e.message });
    return false;
  }
  return true;
}

function main() {
  const allFiles = collectFiles();
  let files = allFiles;
  if (FROM_INDEX > 0 || LIMIT != null)
    files = allFiles.slice(FROM_INDEX, LIMIT != null ? FROM_INDEX + LIMIT : undefined);

  console.log("Apply task-splitting conventions (short feedbackCorrect, scope createApi micro-step)");
  if (DRY_RUN) console.log("DRY RUN — no files written");
  console.log(`Files: ${files.length}\n`);

  const start = Date.now();
  for (let i = 0; i < files.length; i++) {
    report.processed++;
    const ok = applyTaskSplittingOne(files[i]);
    if ((i + 1) % 200 === 0 || !ok)
      console.log(`[${i + 1}/${files.length}] ${ok ? "ok" : "FAIL"} ${path.relative(rootDir, files[i])}`);
  }
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\nDone in ${elapsed}s. Processed: ${report.processed}, Modified: ${report.modified}`);
  console.log(`feedbackCorrect shortened: ${report.feedbackShortened}`);
  console.log(`createApi example scoped: ${report.createApiExampleScoped}, evaluation fixed: ${report.createApiEvaluationFixed}`);
  console.log(`Multi-package import steps (review): ${report.multiPackageImportSteps.length}`);
  if (report.issues.length) {
    console.log(`Errors: ${report.issues.length}`);
    report.issues.slice(0, 20).forEach((i) => console.log(`  ${i.file}: ${i.error}`));
  }
  const reportPath = path.join(rootDir, "task-splitting-report.json");
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        ...report,
        elapsed: Number(elapsed),
        dryRun: DRY_RUN,
      },
      null,
      2
    ),
    "utf8"
  );
  console.log(`Report: ${reportPath}`);
}

main();
