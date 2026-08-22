/**
 * Warm only the 5 Angular QuickBite lessons (Project Scaffold, App Shell & Navigation, ...).
 * Uses the same cache and pipeline as warm-cache-standalone.js.
 *
 *   1. Set DEEPSEEK_API_KEY in .env
 *   2. Run: npm run build-lessons-to-warm   (if not already done)
 *   3. Run: npm run warm-angular-quickbite
 *   4. Run: npm run export-angular-quickbite   (writes content/angular/001_... through 005_...)
 */

import path from "path";
import fs from "fs";
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

const ANGULAR_QUICKBITE_5 = [
  "Project Scaffold",
  "App Shell & Navigation",
  "Orders List Page",
  "Capacitor GPS + Nearby Restaurants",
  "Push Notifications",
];

function getAIOptions() {
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY;
  return { apiKey, provider: "deepseek" };
}

const { apiKey, provider } = getAIOptions();

async function warmOne(item) {
  const params = {
    track: "angular",
    lessonTitle: item.lessonTitle,
    lessonIndex: item.lessonIndex,
  };
  const genKey = `angular:${item.lessonTitle}:${item.lessonIndex}`;

  const fullCached = cacheGet("lesson", genKey);
  if (fullCached) {
    console.log(`  cached: angular / ${item.lessonTitle} (index ${item.lessonIndex})`);
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
  console.log(`  warmed: angular / ${item.lessonTitle} (index ${item.lessonIndex})`);
}

async function main() {
  if (!apiKey) {
    console.error("Set DEEPSEEK_API_KEY in .env or environment.");
    process.exit(1);
  }

  const list = ANGULAR_QUICKBITE_5.map((lessonTitle, lessonIndex) => ({
    track: "angular",
    lessonTitle,
    lessonIndex,
  }));

  console.log(`Warming ${list.length} Angular QuickBite lessons at ${getCacheDir()}\n`);
  for (const item of list) {
    try {
      await warmOne(item);
    } catch (err) {
      console.error(`  failed: ${item.lessonTitle}:`, err?.message || err);
    }
  }
  console.log("\nDone. Run: npm run export-angular-quickbite to write content/angular/*.json");
}

main();
