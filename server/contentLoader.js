/**
 * Human-readable content files: content/<track>/NNN_Title_lesson.json
 * Checked before cache/API so edited content is delivered as designed.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { FUNDA_ANGULAR_LESSONS, FUNDA_START_INDEX } from "../src/angularFundaLessons.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

/** Base directory for editable lesson content. Set CONTENT_DIR to override. */
const CONTENT_DIR = process.env.CONTENT_DIR || path.join(rootDir, "content");

export function getContentDir() {
  return CONTENT_DIR;
}

/**
 * List lesson JSON files in a track folder and sort by leading index (001_, 002_, ...).
 * @param {string} track - e.g. "react-js", "angular"
 * @returns {string[]} Sorted filenames (basenames)
 */
function listLessonFiles(track) {
  const dir = path.join(CONTENT_DIR, track);
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith("_lesson.json"));
  return files.sort((a, b) => {
    const numA = parseInt(a.replace(/^(\d+).*/, "$1"), 10) || 0;
    const numB = parseInt(b.replace(/^(\d+).*/, "$1"), 10) || 0;
    return numA - numB;
  });
}

/**
 * Load full lesson from content file by track and lesson index (0-based).
 * Same shape as cache/API: { success: true, config: {...}, source: "content" }.
 * @param {string} track
 * @param {number} lessonIndex - 0-based index in the track
 * @returns {object|null} Payload or null if not found
 */
export function getContentLesson(track, lessonIndex) {
  // FUNDA Angular lessons use filenames 129–150 but sit at lesson indices 133–154 (after QB+ANG+React list).
  if (track === "angular" && lessonIndex >= FUNDA_START_INDEX) {
    const offset = lessonIndex - FUNDA_START_INDEX;
    const entry = FUNDA_ANGULAR_LESSONS[offset];
    if (!entry?.file) return null;
    const fp = path.join(CONTENT_DIR, track, entry.file);
    try {
      const raw = fs.readFileSync(fp, "utf8");
      const data = JSON.parse(raw);
      const config = data.config ?? data;
      if (!config || typeof config !== "object") return null;
      return { success: true, config, source: "content" };
    } catch {
      return null;
    }
  }
  const files = listLessonFiles(track);
  const file = files[lessonIndex];
  if (!file) return null;
  const fp = path.join(CONTENT_DIR, track, file);
  try {
    const raw = fs.readFileSync(fp, "utf8");
    const data = JSON.parse(raw);
    // Accept either { success, config } or bare { config } / full config at top level
    const config = data.config ?? data;
    if (!config || typeof config !== "object") return null;
    return { success: true, config, source: "content" };
  } catch {
    return null;
  }
}

/**
 * Build content file path for a lesson (for export/write). Filename: NNN_SanitizedTitle_lesson.json
 * @param {string} track
 * @param {number} lessonIndex - 0-based
 * @param {string} lessonTitle
 * @returns {string} Full path
 */
export function getContentFilePath(track, lessonIndex, lessonTitle) {
  const dir = path.join(CONTENT_DIR, track);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const n = String(lessonIndex + 1).padStart(3, "0");
  const safe = lessonTitle.replace(/[\s\/\\:*?"<>|]+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "") || "lesson";
  const name = `${n}_${safe}_lesson.json`;
  return path.join(dir, name);
}
