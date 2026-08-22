/**
 * Clear all cached algorithm lessons for the "algorithms" track (110 lessons).
 * Use after updating algo prompts so lessons are re-generated with the new family-aware flow.
 *
 * Run: node scripts/clear-algo-cache.js
 *
 * Then recache with 24 workers:
 *   TRACK=algorithms TOTAL_PARTITIONS=24 node scripts/warm-cache-parallel.js
 */

import path from "path";
import { fileURLToPath } from "url";
import { cacheDelete, getCacheDir } from "../server/cache.js";
import { ALGO_FULL_LIST } from "../src/ai-lessons/algoCurriculumFull.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const TRACK = "algorithms";
const NAMESPACES = ["intro", "objectives", "steps", "lesson"];

let deleted = 0;
for (let lessonIndex = 0; lessonIndex < ALGO_FULL_LIST.length; lessonIndex++) {
  const lessonTitle = ALGO_FULL_LIST[lessonIndex].title;
  const genKey = `${TRACK}:${lessonTitle}:${lessonIndex}`;
  for (const ns of NAMESPACES) {
    if (cacheDelete(ns, genKey)) deleted++;
  }
}

console.log(`Cleared ${deleted} algorithm lesson cache entries at ${getCacheDir()}`);
console.log(`Track: ${TRACK}; ${ALGO_FULL_LIST.length} lessons.`);
console.log("Recache with: TRACK=algorithms TOTAL_PARTITIONS=24 node scripts/warm-cache-parallel.js");
