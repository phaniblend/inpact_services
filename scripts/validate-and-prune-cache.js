/**
 * Validate cache against canonical lesson list and remove orphans/duplicates.
 * Keeps only cache files whose key matches a lesson in scripts/lessons-to-warm.json.
 * Run: node scripts/validate-and-prune-cache.js
 * Optional: DRY_RUN=1 to only report what would be removed (no deletes).
 *
 * Expected total: 1001 lessons (track × lesson). Cache namespaces: intro, objectives, steps, lesson.
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const CACHE_DIR = process.env.CACHE_DIR || path.join(rootDir, "cache");
const LIST_PATH = path.join(__dirname, "lessons-to-warm.json");
const DRY_RUN = process.argv.includes("--dry-run") || process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";

const LESSON_NAMESPACES = ["intro", "objectives", "steps", "lesson"];

function safeKey(key) {
  return crypto.createHash("sha256").update(String(key), "utf8").digest("hex");
}

function getValidHashes() {
  if (!fs.existsSync(LIST_PATH)) {
    console.error("Missing scripts/lessons-to-warm.json. Run: node scripts/build-lessons-to-warm.js");
    process.exit(1);
  }
  const list = JSON.parse(fs.readFileSync(LIST_PATH, "utf8"));
  if (!Array.isArray(list)) {
    console.error("lessons-to-warm.json must be an array.");
    process.exit(1);
  }
  const hashes = new Set();
  for (const item of list) {
    const { track, lessonTitle, lessonIndex } = item;
    if (track == null || lessonTitle == null || lessonIndex == null) continue;
    const genKey = `${String(track)}:${String(lessonTitle)}:${Number(lessonIndex)}`;
    hashes.add(safeKey(genKey));
  }
  return { count: list.length, hashes };
}

function pruneNamespace(namespace, validHashes) {
  const dir = path.join(CACHE_DIR, namespace);
  if (!fs.existsSync(dir)) return { total: 0, removed: 0, kept: 0 };
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  let removed = 0;
  for (const file of files) {
    const hash = file.slice(0, -5); // remove .json
    if (!validHashes.has(hash)) {
      const fp = path.join(dir, file);
      if (!DRY_RUN) fs.unlinkSync(fp);
      removed++;
    }
  }
  const kept = files.length - removed;
  return { total: files.length, removed, kept };
}

function main() {
  console.log("Cache dir:", CACHE_DIR);
  console.log("Canonical list:", LIST_PATH);
  if (DRY_RUN) console.log("DRY_RUN: no files will be deleted.\n");

  const { count: expectedLessons, hashes } = getValidHashes();
  console.log(`Expected lessons (track × lessons): ${expectedLessons}`);
  console.log(`Valid cache keys (hashes): ${hashes.size}\n`);

  let totalRemoved = 0;
  for (const ns of LESSON_NAMESPACES) {
    const { total, removed, kept } = pruneNamespace(ns, hashes);
    totalRemoved += removed;
    const action = DRY_RUN && removed ? " (would remove)" : "";
    console.log(`${ns}: ${total} files → keep ${kept}, remove ${removed}${action}`);
  }

  console.log("\nTotal orphan files " + (DRY_RUN ? "that would be removed" : "removed") + ": " + totalRemoved);
  if (!DRY_RUN && totalRemoved) console.log("Cache pruned. Server space freed.");
}

main();
