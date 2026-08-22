/**
 * Export cache lesson JSONs to human-readable content files (same shape as content/react-js/*, content/angular/*):
 *   content/<track>/001_Title_lesson.json
 * Run: node scripts/export-cache-to-content.js
 * Optional: TRACK=algorithms  — export only that track (e.g. algo cache → content/algorithms/).
 * Requires: lessons-to-warm.json and cache/ populated (from warm-cache-standalone or parallel).
 * After export, server serves from content/ before cache/API.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { cacheGet } from "../server/cache.js";
import { getContentFilePath, getContentDir } from "../server/contentLoader.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LIST_PATH = path.join(__dirname, "lessons-to-warm.json");

function genKey(item) {
  const { track, lessonTitle, lessonIndex } = item;
  return `${String(track)}:${String(lessonTitle)}:${Number(lessonIndex)}`;
}

function main() {
  if (!fs.existsSync(LIST_PATH)) {
    console.error("Run first: node scripts/build-lessons-to-warm.js");
    process.exit(1);
  }
  let list = JSON.parse(fs.readFileSync(LIST_PATH, "utf8"));
  if (!Array.isArray(list) || list.length === 0) {
    console.error("lessons-to-warm.json is empty.");
    process.exit(1);
  }

  const trackFilter = process.env.TRACK;
  if (trackFilter) {
    list = list.filter((item) => item.track === trackFilter);
    if (list.length === 0) {
      console.error(`No lessons found for track "${trackFilter}".`);
      process.exit(1);
    }
    console.log(`Filtered to track "${trackFilter}": ${list.length} lesson(s).`);
  }

  console.log("Content dir:", getContentDir());
  console.log("Exporting", list.length, "lessons from cache to content/<track>/NNN_Title_lesson.json\n");

  let exported = 0;
  let skipped = 0;
  for (const item of list) {
    const { track, lessonTitle, lessonIndex } = item;
    const key = genKey(item);
    const payload = cacheGet("lesson", key);
    if (!payload?.config) {
      skipped++;
      continue;
    }
    const outPath = getContentFilePath(track, lessonIndex, lessonTitle);
    const toWrite = { success: true, config: payload.config, source: "content" };
    fs.writeFileSync(outPath, JSON.stringify(toWrite, null, 2), "utf8");
    exported++;
  }

  console.log("Exported:", exported);
  console.log("Skipped (no cache):", skipped);
  console.log("\nEdit files under content/<track>/ then run server; content is used before cache/API.");
}

main();
