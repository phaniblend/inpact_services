/* global process */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const contentDir = path.join(rootDir, "content");
const dryRun = process.argv.includes("--dry-run");

function listLessonFiles() {
  const out = [];
  const dirs = fs.readdirSync(contentDir, { withFileTypes: true }).filter((d) => d.isDirectory());
  for (const d of dirs) {
    const dir = path.join(contentDir, d.name);
    for (const f of fs.readdirSync(dir)) {
      if (f.endsWith("_lesson.json")) out.push(path.join(dir, f));
    }
  }
  return out;
}

function isTsLike(track, text) {
  const t = String(track || "").toLowerCase();
  if (t.includes("ts") || t.includes("angular")) return true;
  return /interface\s+\w+|:\s*\w+(\[\])?|<\w+>/.test(String(text || ""));
}

function scaffoldFiles(lessonText, appExt) {
  const lower = String(lessonText || "").toLowerCase();
  const files = {};
  if (/\bstore\b|configurestore/.test(lower)) files[`store.${appExt === "tsx" ? "ts" : "js"}`] = "// store setup";
  if (/\bselector/.test(lower)) files[`selectors.${appExt === "tsx" ? "ts" : "js"}`] = "// selectors";
  if (/\bslice\b|create(slice|asyncthunk)/.test(lower)) files[`slice.${appExt === "tsx" ? "ts" : "js"}`] = "// slice";
  if (/\bapi\b|rtk query/.test(lower)) files[`api.${appExt === "tsx" ? "ts" : "js"}`] = "// api";
  return files;
}

function main() {
  const files = listLessonFiles();
  let lessonsTouched = 0;
  let stepsConverted = 0;
  for (const file of files) {
    let raw;
    let data;
    try {
      raw = fs.readFileSync(file, "utf8");
      data = JSON.parse(raw);
    } catch {
      continue;
    }
    const config = data?.config || data;
    if (!config || config.answerShape !== "multi-file" || !Array.isArray(config.steps)) continue;

    const lessonText = `${config.title || ""}\n${config.steps.map((s) => `${s?.title || ""}\n${s?.instruction || ""}`).join("\n")}`;
    let changed = false;
    for (const step of config.steps) {
      if (!step || typeof step.seedCode !== "string") continue;
      const seed = step.seedCode;
      if (!seed.trim()) continue;
      const ext = isTsLike(config.track, seed) ? "tsx" : "jsx";
      const appFile = `App.${ext}`;
      const scaffolds = scaffoldFiles(`${lessonText}\n${step.instruction || ""}\n${step.title || ""}`, ext);
      step.seedCode = { [appFile]: seed, ...scaffolds };
      stepsConverted++;
      changed = true;
    }

    if (!changed) continue;
    lessonsTouched++;
    if (!dryRun) fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
  }
  console.log(`[${dryRun ? "DRY-RUN" : "WRITE"}] multi-file seed bootstrap: lessons=${lessonsTouched}, steps=${stepsConverted}`);
}

main();

