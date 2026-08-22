/**
 * Pre-warm the AI lesson cache by calling the same generators the server uses,
 * writing directly to the same file cache. No HTTP server needed.
 *
 * Runs in batches of one track at a time: if the script aborts, at least completed
 * track batches are fully cached (e.g. all of "sec" or "express").
 *
 *   1. Set API key in env or .env:
 *      - DeepSeek: DEEPSEEK_API_KEY=sk-... (default)
 *   2. Build list: node scripts/build-lessons-to-warm.js
 *   3. Run: npm run warm-cache-standalone
 *   4. Deploy with the cache/ folder.
 *
 * Parallel warming (same cache dir, disjoint lessons per worker):
 *   TOTAL_PARTITIONS=8 node scripts/warm-cache-parallel.js
 * Or run this script with PARTITION_INDEX and TOTAL_PARTITIONS to warm one partition only.
 *
 * Pending only (skip already-cached lessons; fill gaps after balance top-up):
 *   ONLY_PENDING=true npm run warm-cache-standalone
 *   ONLY_PENDING=true TOTAL_PARTITIONS=24 npm run warm-cache-parallel
 *
 * Cache dir: ./cache (or CACHE_DIR). Same layout as server.
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(rootDir, ".env") });

const listPath = path.join(__dirname, "lessons-to-warm.json");

function getAIOptions() {
  const provider = (process.env.AI_PROVIDER || process.env.VITE_AI_PROVIDER || "deepseek").toLowerCase();
  const apiKey =
    process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY;
  return { apiKey, provider };
}

const { apiKey, provider } = getAIOptions();

function getLessonParams(item) {
  const { track, lessonTitle, lessonIndex } = item;
  if (track == null || lessonTitle == null || lessonIndex == null) {
    return { error: "Missing track, lessonTitle, or lessonIndex" };
  }
  return {
    params: {
      track: String(track),
      lessonTitle: String(lessonTitle),
      lessonIndex: Number(lessonIndex),
    },
    genKey: `${String(track)}:${String(lessonTitle)}:${Number(lessonIndex)}`,
  };
}

async function warmOne(item) {
  const { params, genKey, error } = getLessonParams(item);
  if (error) {
    console.error("  skip (invalid):", item, error);
    return;
  }

  const fullCached = cacheGet("lesson", genKey);
  if (fullCached) {
    console.log(`  cached: ${params.track} / ${params.lessonTitle} (index ${params.lessonIndex})`);
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
  console.log(`  warmed: ${params.track} / ${params.lessonTitle} (index ${params.lessonIndex})`);
}

async function main() {
  const fs = await import("fs");
  if (!apiKey) {
    console.error("Set DEEPSEEK_API_KEY in .env or environment.");
    process.exit(1);
  }
  if (!fs.existsSync(listPath)) {
    console.error("Create scripts/lessons-to-warm.json first: node scripts/build-lessons-to-warm.js");
    process.exit(1);
  }
  let list = JSON.parse(fs.readFileSync(listPath, "utf8"));
  if (!Array.isArray(list) || list.length === 0) {
    console.error("lessons-to-warm.json is empty or invalid.");
    process.exit(1);
  }

  const trackFilter = process.env.TRACK || process.env.VITE_WARM_TRACK;
  const limitNum = process.env.LIMIT ? parseInt(process.env.LIMIT, 10) : NaN;
  if (trackFilter) {
    list = list.filter((item) => item.track === trackFilter);
    if (list.length === 0) {
      console.error(`No lessons found for track "${trackFilter}".`);
      process.exit(1);
    }
    console.log(`Filtered to track "${trackFilter}": ${list.length} lesson(s).`);
  }
  if (Number.isInteger(limitNum) && limitNum > 0) {
    list = list.slice(0, limitNum);
    console.log(`Limited to first ${limitNum} lesson(s).`);
  }

  const totalPartitions = process.env.TOTAL_PARTITIONS ? parseInt(process.env.TOTAL_PARTITIONS, 10) : 1;
  const partitionIndex = process.env.PARTITION_INDEX != null ? parseInt(process.env.PARTITION_INDEX, 10) : 0;
  if (Number.isInteger(totalPartitions) && totalPartitions > 1 && Number.isInteger(partitionIndex) && partitionIndex >= 0 && partitionIndex < totalPartitions) {
    list = list.filter((_, i) => i % totalPartitions === partitionIndex);
    console.log(`Partition ${partitionIndex + 1}/${totalPartitions}: ${list.length} lesson(s).`);
  }

  const onlyPending = process.env.ONLY_PENDING === "true" || process.env.ONLY_PENDING === "1" || process.env.PENDING_ONLY === "true" || process.env.PENDING_ONLY === "1";
  if (onlyPending) {
    const before = list.length;
    list = list.filter((item) => {
      const genKey = `${item.track}:${item.lessonTitle}:${item.lessonIndex}`;
      return !cacheGet("lesson", genKey);
    });
    console.log(`Only pending (not cached): ${list.length} of ${before} lesson(s). Skipping ${before - list.length} already cached.`);
    if (list.length === 0) {
      console.log("Nothing to warm. Exiting.");
      return;
    }
  }

  const byTrack = new Map();
  for (const item of list) {
    const t = item.track;
    if (!byTrack.has(t)) byTrack.set(t, []);
    byTrack.get(t).push(item);
  }
  // Preferred order: react-ts first, then react-js, then the rest alphabetically
  const preferredFirst = ["react-ts", "react-js"];
  const rest = [...byTrack.keys()].filter((t) => !preferredFirst.includes(t)).sort();
  const trackOrder = [...preferredFirst.filter((t) => byTrack.has(t)), ...rest];

  console.log(`Warming cache at ${getCacheDir()} for ${list.length} lesson(s) in ${trackOrder.length} track batches (order: react-ts → react-js → others).`);
  for (const track of trackOrder) {
    const items = byTrack.get(track);
    console.log(`\n--- Batch: ${track} (${items.length} lessons) ---`);
    for (const item of items) {
      try {
        await warmOne(item);
      } catch (err) {
        console.error(`  failed: ${item.track} / ${item.lessonTitle}:`, err?.message || err);
      }
    }
    console.log(`--- Batch ${track} complete ---`);
  }
  console.log("\nDone. Bundle cache/ with deploy so users get fast responses.");
}

main();
