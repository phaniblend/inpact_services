/**
 * Warm cache for ALGORITHM lessons only (correct flow: lesson → example → flowchart → reasoning → dry run → code from scratch).
 * Use after clear-algo-cache.js to test a few lessons before warming all algos.
 *
 *   ALGO_LIMIT=5           — warm only first 5 lessons (default: 5 for testing); 0 = all
 *   TRACK=algo-js         — warm only one track (default: all 4 algo tracks)
 *   ONLY_PENDING=true     — skip lessons already in cache
 *   WORKERS=24            — run up to 24 lessons in parallel (default: 1)
 *
 * Examples:
 *   node scripts/warm-cache-algo.js
 *   ALGO_LIMIT=0 WORKERS=24 node scripts/warm-cache-algo.js   # all algo lessons, 24 parallel
 *   ALGO_LIMIT=3 TRACK=algo-js node scripts/warm-cache-algo.js
 *
 * Requires: DEEPSEEK_API_KEY in .env.
 */

import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { cacheGet, cacheSet, getCacheDir } from "../server/cache.js";
import {
  generateLessonIntro,
  generateLessonObjectives,
  generateLessonStepsOnly,
  assembleLessonConfig,
} from "../src/ai-lessons/services/realLessonService.js";
import { validateLessonConfig } from "../src/ai-lessons/schema.js";
import { ALGO_AI_NAMES } from "../src/ai-lessons/algoAiNames.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(rootDir, ".env") });

const ALGO_TRACKS = ["algo-js", "algo-ts", "algo-python", "algo-java"];

function getAIOptions() {
  const provider = (process.env.AI_PROVIDER || process.env.VITE_AI_PROVIDER || "deepseek").toLowerCase();
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY;
  return { apiKey, provider };
}

const { apiKey, provider } = getAIOptions();

function buildAlgoList() {
  const limit = process.env.ALGO_LIMIT ? parseInt(process.env.ALGO_LIMIT, 10) : 5;
  const trackFilter = process.env.TRACK || process.env.VITE_WARM_TRACK;
  const tracks = trackFilter && ALGO_TRACKS.includes(trackFilter) ? [trackFilter] : ALGO_TRACKS;
  const names = limit > 0 ? ALGO_AI_NAMES.slice(0, limit) : ALGO_AI_NAMES;
  const list = [];
  for (const track of tracks) {
    names.forEach((lessonTitle, lessonIndex) => {
      list.push({ track, lessonTitle, lessonIndex });
    });
  }
  return list;
}

async function warmOne(item) {
  const { track, lessonTitle, lessonIndex } = item;
  const params = { track, lessonTitle, lessonIndex };
  const genKey = `${track}:${lessonTitle}:${lessonIndex}`;

  const fullCached = cacheGet("lesson", genKey);
  if (fullCached) {
    console.log(`  cached: ${track} / ${lessonTitle} (index ${lessonIndex})`);
    return;
  }

  const opts = { apiKey, provider };
  let introPayload = cacheGet("intro", genKey);
  if (!introPayload) {
    const r = await generateLessonIntro(params, opts);
    introPayload = { success: true, ...r };
    cacheSet("intro", genKey, introPayload);
  }
  let objectivesPayload = cacheGet("objectives", genKey);
  if (!objectivesPayload) {
    const r = await generateLessonObjectives(params, opts);
    objectivesPayload = { success: true, ...r };
    cacheSet("objectives", genKey, objectivesPayload);
  }
  let stepsPayload = cacheGet("steps", genKey);
  if (!stepsPayload) {
    const r = await generateLessonStepsOnly(params, opts);
    stepsPayload = { success: true, ...r };
    cacheSet("steps", genKey, stepsPayload);
  }

  const config = assembleLessonConfig(
    introPayload.intro,
    objectivesPayload.objectives,
    stepsPayload,
    params
  );
  const validated = validateLessonConfig(config);
  if (!validated.success) {
    throw new Error("Validation failed: " + validated.error.message);
  }
  const payload = { success: true, config: validated.data, source: "real" };
  cacheSet("lesson", genKey, payload);
  console.log(`  warmed: ${track} / ${lessonTitle} (index ${lessonIndex})`);
}

async function main() {
  if (!apiKey) {
    console.error("Set DEEPSEEK_API_KEY in .env or environment.");
    process.exit(1);
  }

  let list = buildAlgoList();
  const onlyPending = process.env.ONLY_PENDING === "true" || process.env.ONLY_PENDING === "1";
  if (onlyPending) {
    const before = list.length;
    list = list.filter((item) => !cacheGet("lesson", `${item.track}:${item.lessonTitle}:${item.lessonIndex}`));
    console.log(`Only pending: ${list.length} of ${before} lesson(s).`);
    if (list.length === 0) {
      console.log("Nothing to warm. Exiting.");
      return;
    }
  }

  const limit = process.env.ALGO_LIMIT ? parseInt(process.env.ALGO_LIMIT, 10) : 5;
  const trackFilter = process.env.TRACK || process.env.VITE_WARM_TRACK;
  console.log(`Warming ALGO cache at ${getCacheDir()}`);
  console.log(`Tracks: ${trackFilter || ALGO_TRACKS.join(", ")} | Lessons: first ${limit > 0 ? limit : ALGO_AI_NAMES.length} | Total: ${list.length} lesson(s)\n`);

  const workers = Math.max(1, parseInt(process.env.WORKERS, 10) || 1);
  console.log(`Workers: ${workers}\n`);

  let index = 0;
  const runNext = async () => {
    const item = list[index++];
    if (!item) return;
    try {
      await warmOne(item);
    } catch (err) {
      console.error(`  failed: ${item.track} / ${item.lessonTitle}:`, err?.message || err);
    }
    await runNext();
  };
  const pool = Array.from({ length: Math.min(workers, list.length) }, () => runNext());
  await Promise.all(pool);

  console.log("\nDone.");
}

main();
