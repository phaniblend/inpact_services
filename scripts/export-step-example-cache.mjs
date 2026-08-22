/**
 * Lists DeepSeek-backed step examples from server disk cache (cache/step-example/)
 * for merging into lesson JSON as ai_example_code + ai_example_meta
 * { "exampleOrigin": "deepseek", "fetchedAfter": "2026-03-28" }.
 *
 * Usage: node scripts/export-step-example-cache.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dir = process.env.CACHE_DIR || path.join(root, "cache", "step-example");

if (!fs.existsSync(dir)) {
  console.log("No cache dir:", dir);
  process.exit(0);
}

const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
console.log(JSON.stringify({ dir, count: files.length, note: "Filenames are sha256 of cache keys; open JSON for code + meta." }, null, 2));
