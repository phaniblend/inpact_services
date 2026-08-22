/**
 * Clear React-TS cache, re-warm with 24 workers, then export to content/react-ts/ (NNN_Title_lesson.json).
 * Use after updating prompts (e.g. dependency ordering, TypeScript examples).
 *
 *   node scripts/refresh-react-ts-and-export.js
 *
 * Requires: DEEPSEEK_API_KEY in .env. Ensures lessons-to-warm.json exists.
 */

import { spawnSync } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const listPath = path.join(__dirname, "lessons-to-warm.json");

function run(name, cmd, args, env = {}) {
  console.log(`\n--- ${name} ---\n`);
  const result = spawnSync(cmd, args, {
    env: { ...process.env, ...env },
    cwd: rootDir,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    console.error(`${name} failed with exit code ${result.status}`);
    process.exit(result.status);
  }
}

function main() {
  console.log("Refresh React-TS: clear cache → warm (24 workers) → export to content/react-ts/\n");

  if (!fs.existsSync(listPath)) {
    console.log("Building lessons-to-warm.json...");
    run("build-lessons-to-warm", process.execPath, ["scripts/build-lessons-to-warm.js"]);
  }

  run("clear-react-ts-cache", process.execPath, ["scripts/clear-react-ts-cache.js"]);

  run(
    "warm-cache-parallel (24 workers, react-ts)",
    process.execPath,
    ["scripts/warm-cache-parallel.js"],
    { TRACK: "react-ts", TOTAL_PARTITIONS: "24" }
  );

  run(
    "export-cache-to-content (react-ts)",
    process.execPath,
    ["scripts/export-cache-to-content.js"],
    { TRACK: "react-ts" }
  );

  console.log("\nDone. React-TS lessons are in content/react-ts/ (001_Counter_App_lesson.json, etc.).");
}

main();
