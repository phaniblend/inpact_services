/**
 * Clear all cached AI lesson data for the react-ts track.
 * Use after changing track-aware prompts so react-ts lessons are regenerated with correct TypeScript context.
 *
 *   node scripts/clear-react-ts-cache.js
 *
 * Then re-warm: TRACK=react-ts LIMIT=10 npm run warm-cache-standalone (or full react-ts without LIMIT).
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { cacheDelete, getCacheDir } from "../server/cache.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const listPath = path.join(__dirname, "lessons-to-warm.json");

const NAMESPACES = ["intro", "objectives", "steps", "lesson"];

function main() {
  if (!fs.existsSync(listPath)) {
    console.error("lessons-to-warm.json not found. Run: node scripts/build-lessons-to-warm.js");
    process.exit(1);
  }
  const list = JSON.parse(fs.readFileSync(listPath, "utf8"));
  const reactTs = list.filter((item) => item.track === "react-ts");
  if (reactTs.length === 0) {
    console.log("No react-ts lessons in lessons-to-warm.json. Nothing to clear.");
    return;
  }
  console.log(`Clearing cache for ${reactTs.length} react-ts lesson(s) at ${getCacheDir()}...`);
  let deleted = 0;
  for (const item of reactTs) {
    const genKey = `${item.track}:${item.lessonTitle}:${item.lessonIndex}`;
    for (const ns of NAMESPACES) {
      if (cacheDelete(ns, genKey)) deleted++;
    }
  }
  console.log(`Done. Deleted ${deleted} cache entry(ies). Re-warm with: TRACK=react-ts npm run warm-cache-standalone`);
}

main();
