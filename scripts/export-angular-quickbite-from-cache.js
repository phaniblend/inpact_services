/**
 * Export the 5 Angular QuickBite lessons from cache to content/angular/*.json.
 * Run after warming the cache for these lessons (e.g. warm-cache-standalone for angular, or warm the first 5).
 *
 *   node scripts/export-angular-quickbite-from-cache.js
 *
 * Reads cache/lesson (by key angular:Title:index), writes content/angular/001_Title_lesson.json etc.
 */

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { cacheGet } from "../server/cache.js";
import { getContentFilePath } from "../server/contentLoader.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const ANGULAR_QUICKBITE_5 = [
  "Project Scaffold",
  "App Shell & Navigation",
  "Orders List Page",
  "Capacitor GPS + Nearby Restaurants",
  "Push Notifications",
];

function main() {
  let exported = 0;
  for (let i = 0; i < ANGULAR_QUICKBITE_5.length; i++) {
    const title = ANGULAR_QUICKBITE_5[i];
    const genKey = `angular:${title}:${i}`;
    const payload = cacheGet("lesson", genKey);
    if (!payload?.config) {
      console.warn(`  [skip] no cache for ${genKey}`);
      continue;
    }
    const outPath = getContentFilePath("angular", i, title);
    const dir = path.dirname(outPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const toWrite = { success: true, config: payload.config };
    fs.writeFileSync(outPath, JSON.stringify(toWrite, null, 2), "utf8");
    console.log(`  wrote ${path.relative(rootDir, outPath)}`);
    exported++;
  }
  console.log(`Exported ${exported} Angular QuickBite lessons to content/angular/`);
}

main();
