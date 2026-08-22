/**
 * Clear file cache for ONE lesson so you can re-fetch from AI (e.g. after changing prompts).
 * Uses same key format and hash as server/cache.js.
 *
 * Usage (from project root):
 *   node scripts/clear-lesson-cache.js <track> <lessonTitle> <lessonIndex>
 *
 * Example:
 *   node scripts/clear-lesson-cache.js "react-js" "Conditional Rendering with Ternary" 4
 *
 * Lesson title must match exactly what the app sends (e.g. from the track's lesson list).
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const CACHE_DIR = process.env.CACHE_DIR || path.join(rootDir, "cache");

function safeKey(key) {
  return crypto.createHash("sha256").update(String(key), "utf8").digest("hex");
}

function clearLesson(track, lessonTitle, lessonIndex) {
  const genKey = `${String(track)}:${String(lessonTitle)}:${Number(lessonIndex)}`;
  const hash = safeKey(genKey);
  const namespaces = ["intro", "objectives", "steps", "lesson"];
  let removed = 0;
  for (const ns of namespaces) {
    const fp = path.join(CACHE_DIR, ns, `${hash}.json`);
    if (fs.existsSync(fp)) {
      fs.unlinkSync(fp);
      removed++;
      console.log(`  removed ${ns}/${hash}.json`);
    }
  }
  return removed;
}

const [,, track, lessonTitle, lessonIndex] = process.argv;
if (!track || lessonTitle == null || lessonIndex == null) {
  console.log("Usage: node scripts/clear-lesson-cache.js <track> <lessonTitle> <lessonIndex>");
  console.log('Example: node scripts/clear-lesson-cache.js "react-js" "Conditional Rendering with Ternary" 4');
  process.exit(1);
}

console.log(`Clearing cache for: ${track} / "${lessonTitle}" / index ${lessonIndex}`);
const n = clearLesson(track, lessonTitle, lessonIndex);
console.log(`Done. Removed ${n} file(s). Restart the server (or rely on file cache) and open the lesson again to regenerate.`);
