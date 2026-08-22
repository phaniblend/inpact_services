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
    const files = fs.readdirSync(dir).filter((f) => f.endsWith("_lesson.json"));
    for (const f of files) out.push(path.join(dir, f));
  }
  return out;
}

function inferMultiFile(config) {
  const title = String(config?.title || "").toLowerCase();
  const stepsText = Array.isArray(config?.steps)
    ? config.steps
        .map((s) => `${s?.title || ""}\n${s?.instruction || ""}\n${s?.expectedOutcome || ""}\n${s?.seedCode || ""}`)
        .join("\n")
        .toLowerCase()
    : "";
  const combined = `${title}\n${stepsText}`;

  if (/(redux toolkit|rtk query|createslice|createasyncthunk|configurestore)/i.test(combined)) return true;

  const fileHints = (combined.match(/\b(store|selector|slice|component)\.(ts|tsx|js|jsx)\b/g) || []).length;
  const architectureHints = [
    /\bstore\b/,
    /\bselector(s)?\b/,
    /\bcomponent\b/,
    /\bprovider\b/,
  ].filter((re) => re.test(combined)).length;

  return fileHints >= 2 || architectureHints >= 3;
}

function main() {
  const files = listLessonFiles();
  let touched = 0;
  let marked = 0;
  for (const file of files) {
    let data;
    try {
      data = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch {
      continue;
    }
    const config = data?.config || data;
    if (!config || !Array.isArray(config.steps)) continue;
    if (!inferMultiFile(config)) continue;
    if (config.answerShape === "multi-file") continue;
    config.answerShape = "multi-file";
    marked++;
    const next = JSON.stringify(data, null, 2);
    const prev = fs.readFileSync(file, "utf8");
    if (next !== prev) {
      touched++;
      if (!dryRun) fs.writeFileSync(file, next, "utf8");
    }
  }
  const mode = dryRun ? "DRY-RUN" : "WRITE";
  console.log(`[${mode}] multi-file answerShape marked: ${marked}, files changed: ${touched}`);
}

main();
