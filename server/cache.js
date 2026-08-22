/**
 * File-based cache for AI lesson responses. Persists across server restarts and can be
 * bundled with the app (e.g. commit cache/ or copy into Docker) so live users get fast responses.
 * Keys are hashed for safe filenames; namespaces: intro, objectives, steps, lesson, validation, mentor, step-example.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

/** Base directory for cache files. Set CACHE_DIR to override (e.g. /data/cache on Railway). */
const CACHE_DIR = process.env.CACHE_DIR || path.join(rootDir, "cache");

function safeKey(key) {
  return crypto.createHash("sha256").update(String(key), "utf8").digest("hex");
}

function dirFor(namespace) {
  const dir = path.join(CACHE_DIR, namespace);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function filePath(namespace, key) {
  return path.join(dirFor(namespace), `${safeKey(key)}.json`);
}

/**
 * @param {string} namespace - One of: intro, objectives, steps, lesson, validation
 * @param {string} key - Cache key (e.g. "track:title:index" or validation hash)
 * @returns {Promise<object|null>} Parsed JSON or null if missing/invalid
 */
export function cacheGet(namespace, key) {
  try {
    const fp = filePath(namespace, key);
    if (!fs.existsSync(fp)) return null;
    const raw = fs.readFileSync(fp, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * @param {string} namespace - One of: intro, objectives, steps, lesson, validation
 * @param {string} key - Cache key
 * @param {object} value - Serializable object to store
 */
export function cacheSet(namespace, key, value) {
  try {
    const fp = filePath(namespace, key);
    fs.writeFileSync(fp, JSON.stringify(value), "utf8");
  } catch (err) {
    console.error("[cache] write failed:", err?.message);
  }
}

/**
 * Delete one cache entry. Used when invalidating by track (e.g. clear react-ts after prompt changes).
 * @param {string} namespace - One of: intro, objectives, steps, lesson, validation
 * @param {string} key - Cache key (e.g. genKey "track:lessonTitle:lessonIndex")
 */
export function cacheDelete(namespace, key) {
  try {
    const fp = filePath(namespace, key);
    if (fs.existsSync(fp)) {
      fs.unlinkSync(fp);
      return true;
    }
  } catch (err) {
    console.error("[cache] delete failed:", err?.message);
  }
  return false;
}

export function getCacheDir() {
  return CACHE_DIR;
}
