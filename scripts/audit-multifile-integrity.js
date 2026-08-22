/* global process */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const contentDir = path.join(rootDir, "content");
const strict = process.argv.includes("--strict");

function listLessons() {
  const out = [];
  const dirs = fs.readdirSync(contentDir, { withFileTypes: true }).filter((d) => d.isDirectory());
  for (const d of dirs) {
    const dir = path.join(contentDir, d.name);
    for (const f of fs.readdirSync(dir)) {
      if (f.endsWith("_lesson.json")) out.push({ track: d.name, file: path.join(dir, f) });
    }
  }
  return out;
}

function isFileMapSeed(seed) {
  return seed && typeof seed === "object" && !Array.isArray(seed) && Object.keys(seed).length > 0;
}

function hasAppFile(seedMap) {
  const names = Object.keys(seedMap || {});
  return names.some((n) => /^app\.(t|j)sx?$/i.test(n) || /^index\.(t|j)sx?$/i.test(n));
}

function auditOne(entry) {
  const rel = path.relative(rootDir, entry.file);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(entry.file, "utf8"));
  } catch (e) {
    return [{ type: "invalid_json", file: rel, message: String(e.message || e) }];
  }
  const config = data?.config || data;
  if (!config || !Array.isArray(config.steps) || config.answerShape !== "multi-file") return [];

  const issues = [];
  config.steps.forEach((s, idx) => {
    if (!s || (!s.type || s.type === "question")) {
      const seed = s?.seedCode;
      if (!isFileMapSeed(seed)) {
        issues.push({ type: "non_map_seed", file: rel, step: idx + 1, id: s?.id || null });
      } else {
        if (!hasAppFile(seed)) {
          issues.push({ type: "missing_app_file", file: rel, step: idx + 1, id: s?.id || null });
        }
        const emptyFiles = Object.entries(seed).filter(([, code]) => typeof code !== "string");
        if (emptyFiles.length) {
          issues.push({ type: "non_string_file_content", file: rel, step: idx + 1, id: s?.id || null, files: emptyFiles.map(([k]) => k) });
        }
      }
    }
  });
  return issues;
}

function main() {
  const entries = listLessons();
  const issues = [];
  for (const e of entries) issues.push(...auditOne(e));

  const report = {
    scanned: entries.length,
    multifileLessons: entries.filter((e) => {
      try {
        const d = JSON.parse(fs.readFileSync(e.file, "utf8"));
        const c = d?.config || d;
        return c?.answerShape === "multi-file";
      } catch {
        return false;
      }
    }).length,
    issueCount: issues.length,
    issues,
  };
  const outPath = path.join(rootDir, "audit-multifile-integrity-report.json");
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");
  console.log(`Multi-file audit: scanned ${report.scanned} lessons, multifile ${report.multifileLessons}, issues ${report.issueCount}`);
  console.log(`Report: ${outPath}`);
  if (issues.length && issues.length <= 50) {
    issues.forEach((i) => console.log(`  - ${JSON.stringify(i)}`));
  }
  if (strict && issues.length) process.exit(1);
}

main();

