/**
 * Pre-warm the file cache by requesting intro, objectives, and full lesson for each entry
 * in lessons-to-warm.json. Run with the server up: npm run server (then npm run warm-cache).
 * Cache is written to ./cache (or CACHE_DIR); bundle that folder with your deploy so live users get fast responses.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const listPath = path.join(__dirname, "lessons-to-warm.json");
const baseUrl = process.env.API_BASE_URL || "http://localhost:3000";

async function post(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${url} ${res.status}: ${await res.text()}`);
  return res.json();
}

async function warmOne({ track, lessonTitle, lessonIndex }) {
  const params = { track, lessonTitle, lessonIndex };
  await post(`${baseUrl}/api/lessons/intro`, params);
  await post(`${baseUrl}/api/lessons/objectives`, params);
  await post(`${baseUrl}/api/lessons/generate`, params);
  console.log(`  warmed: ${track} / ${lessonTitle} (index ${lessonIndex})`);
}

async function main() {
  if (!fs.existsSync(listPath)) {
    console.log("Create scripts/lessons-to-warm.json with [{ track, lessonTitle, lessonIndex }, ...]");
    process.exit(1);
  }
  const list = JSON.parse(fs.readFileSync(listPath, "utf8"));
  if (!Array.isArray(list) || list.length === 0) {
    console.log("lessons-to-warm.json is empty or invalid.");
    process.exit(1);
  }
  console.log(`Warming cache at ${baseUrl} for ${list.length} lesson(s)...`);
  for (const item of list) {
    try {
      await warmOne(item);
    } catch (err) {
      console.error(`  failed: ${item.track} / ${item.lessonTitle}:`, err?.message || err);
    }
  }
  console.log("Done. Cache files are in ./cache (or CACHE_DIR). Bundle with deploy for fast load.");
}

main();
