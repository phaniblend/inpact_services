/**
 * Batch-send react-ts / react-js lesson JSON to DeepSeek for editorial review
 * (intro vs objectives, compounded steps, dependency order) and optionally merge
 * "cured" patches back into files.
 *
 * Requires: DEEPSEEK_API_KEY or VITE_DEEPSEEK_API_KEY in .env (project root).
 *
 * Usage:
 *   node scripts/lesson-pedagogy-deepseek.mjs --dry-run --limit 2
 *   node scripts/lesson-pedagogy-deepseek.mjs --apply --limit 5
 *   node scripts/lesson-pedagogy-deepseek.mjs --tracks react-ts --glob "*024*"
 *
 * Background: run in a separate terminal or `start /b` on Windows; logs to stdout
 * and writes cache under cache/lesson-pedagogy/.
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { completeWithDeepSeek } from "../src/ai-lessons/providers/deepseekClient.js";
import { validateLessonConfig } from "../src/ai-lessons/schema.js";
import { PEDAGOGY_SYSTEM, buildPedagogyUserPayload } from "./lib/lessonPedagogyPrompt.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(rootDir, ".env") });

const CACHE_DIR = path.join(rootDir, "cache", "lesson-pedagogy");

function parseArgs(argv) {
  const out = {
    dryRun: argv.includes("--dry-run"),
    apply: argv.includes("--apply"),
    skipCache: argv.includes("--skip-cache"),
    limit: null,
    tracks: ["react-ts", "react-js"],
    glob: null,
  };
  const li = argv.indexOf("--limit");
  if (li !== -1 && argv[li + 1]) out.limit = parseInt(argv[li + 1], 10);
  const ti = argv.indexOf("--tracks");
  if (ti !== -1 && argv[ti + 1]) out.tracks = argv[ti + 1].split(",").map((s) => s.trim());
  const gi = argv.indexOf("--glob");
  if (gi !== -1 && argv[gi + 1]) out.glob = argv[gi + 1];
  return out;
}

function walkLessons(contentDir) {
  const out = [];
  if (!fs.existsSync(contentDir)) return out;
  for (const name of fs.readdirSync(contentDir)) {
    const p = path.join(contentDir, name);
    if (fs.statSync(p).isDirectory()) out.push(...walkLessons(p));
    else if (name.endsWith("_lesson.json")) out.push(p);
  }
  return out;
}

function matchesGlob(filePath, pattern) {
  if (!pattern) return true;
  const base = path.basename(filePath);
  const re = new RegExp(
    "^" +
      pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".") +
      "$",
    "i"
  );
  return re.test(base);
}

function extractJsonObject(text) {
  const t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fence ? fence[1].trim() : t;
  return JSON.parse(raw);
}

function mergeCuredIntoConfig(config, cured) {
  if (!cured || typeof cured !== "object") return;
  if (cured.intro && typeof cured.intro === "object") {
    config.intro = { ...config.intro, ...cured.intro };
  }
  if (Array.isArray(cured.objectives)) {
    config.objectives = cured.objectives;
  }
  if (cured.steps && typeof cured.steps === "object") {
    const byId = new Map(config.steps.map((s) => [s.id, s]));
    for (const [stepId, patch] of Object.entries(cured.steps)) {
      if (!patch || typeof patch !== "object") continue;
      const step = byId.get(stepId);
      if (!step) {
        console.warn(`  warn: patch for unknown step id ${stepId}, skip`);
        continue;
      }
      const allowed = new Set([
        "title",
        "phase",
        "instruction",
        "hint",
        "analogousExample",
        "expectedOutcome",
        "successCriteria",
        "feedbackCorrect",
        "feedbackPartial",
        "feedbackWrong",
        "seedCode",
      ]);
      for (const [k, v] of Object.entries(patch)) {
        if (allowed.has(k)) step[k] = v;
      }
    }
  }
}

function sha256(s) {
  return crypto.createHash("sha256").update(s, "utf8").digest("hex").slice(0, 32);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error("Set DEEPSEEK_API_KEY or VITE_DEEPSEEK_API_KEY in .env");
    process.exit(1);
  }

  if (args.apply && args.dryRun) {
    console.error("Use either --apply or --dry-run, not both");
    process.exit(1);
  }

  fs.mkdirSync(CACHE_DIR, { recursive: true });

  let files = args.tracks.flatMap((t) => walkLessons(path.join(rootDir, "content", t)));
  files = files.filter((f) => matchesGlob(f, args.glob));
  files.sort();
  if (args.limit != null && !Number.isNaN(args.limit)) files = files.slice(0, args.limit);

  const delayMs = Number(process.env.LESSON_PEDAGOGY_DELAY_MS || 1200);
  const maxTokens = Number(process.env.LESSON_PEDAGOGY_MAX_TOKENS || 8192);

  console.log(`Lessons to process: ${files.length} (apply=${args.apply} dry-run=${args.dryRun})`);

  let ok = 0;
  let fail = 0;

  for (let i = 0; i < files.length; i++) {
    const filePath = files[i];
    const rel = path.relative(rootDir, filePath);
    let rawLesson;
    try {
      rawLesson = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (e) {
      console.error(`SKIP ${rel}: ${e.message}`);
      fail++;
      continue;
    }

    const config = rawLesson.config;
    if (!config) {
      console.error(`SKIP ${rel}: no config`);
      fail++;
      continue;
    }

    const userPayload = buildPedagogyUserPayload(rawLesson);
    const cacheKey = sha256(rel + "\n" + userPayload);
    const cachePath = path.join(CACHE_DIR, `${cacheKey}.json`);

    let modelJson = null;
    if (!args.skipCache && fs.existsSync(cachePath)) {
      try {
        const wrap = JSON.parse(fs.readFileSync(cachePath, "utf8"));
        modelJson = wrap.response ?? wrap;
        console.log(`[${i + 1}/${files.length}] CACHE ${rel}`);
      } catch {
        modelJson = null;
      }
    }

    if (!modelJson) {
      try {
        const text = await completeWithDeepSeek({
          apiKey,
          system: PEDAGOGY_SYSTEM,
          user: `Lesson JSON to analyze:\n\n${userPayload}`,
          maxTokens,
          model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
        });
        modelJson = extractJsonObject(text);
        fs.writeFileSync(
          cachePath,
          JSON.stringify(
            { rel, receivedAt: new Date().toISOString(), response: modelJson, rawLength: text.length },
            null,
            2
          ) + "\n"
        );
        console.log(`[${i + 1}/${files.length}] API ${rel}`);
      } catch (e) {
        console.error(`FAIL ${rel}:`, e.message);
        fail++;
        if (i < files.length - 1) await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }
    }

    const cured = modelJson?.cured;
    const summary = modelJson?.summary;

    if (args.dryRun || !args.apply) {
      console.log(`  summary: ${(summary || "").slice(0, 200)}${summary && summary.length > 200 ? "…" : ""}`);
      if (cured) {
        const hasIntro = cured.intro && Object.keys(cured.intro).length;
        const hasObj = Array.isArray(cured.objectives);
        const stepKeys = cured.steps && typeof cured.steps === "object" ? Object.keys(cured.steps) : [];
        console.log(`  cured: intro=${!!hasIntro} objectives=${hasObj} steps=${stepKeys.join(",") || "none"}`);
      }
      ok++;
      if (i < files.length - 1) await new Promise((r) => setTimeout(r, delayMs));
      continue;
    }

    // --apply
    const backup = JSON.stringify(rawLesson, null, 2);
    try {
      mergeCuredIntoConfig(config, cured);
      const check = validateLessonConfig(config);
      if (!check.success) {
        console.error(`VALIDATION ${rel}:`, check.error?.format?.() || check.error);
        fail++;
        if (i < files.length - 1) await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }
      rawLesson.config = check.data;
      fs.writeFileSync(filePath, JSON.stringify(rawLesson, null, 2) + "\n");
      const bakPath = filePath + ".pedagogy.bak";
      fs.writeFileSync(bakPath, backup);
      console.log(`  wrote ${rel} (backup ${path.basename(bakPath)})`);
      ok++;
    } catch (e) {
      console.error(`APPLY FAIL ${rel}:`, e.message);
      fail++;
    }

    if (i < files.length - 1) await new Promise((r) => setTimeout(r, delayMs));
  }

  console.log(`\nDone. ok=${ok} fail=${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
