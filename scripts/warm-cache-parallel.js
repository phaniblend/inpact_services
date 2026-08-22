/**
 * Run multiple cache-warming workers in parallel, each warming a disjoint partition of the lesson list.
 * Uses PARTITION_INDEX and TOTAL_PARTITIONS so no two workers touch the same lesson (same cache dir, no conflicts).
 * Good for high-RAM systems: e.g. 8–16 workers to saturate API rate limits.
 *
 *   TOTAL_PARTITIONS=8 node scripts/warm-cache-parallel.js
 *
 * Optional: TRACK=react-ts or LIMIT=100 to restrict the list before partitioning.
 * Optional: ONLY_PENDING=true to warm only lessons not yet in cache (fill gaps after top-up).
 * Each worker inherits current env (AI_PROVIDER, DEEPSEEK_API_KEY, ONLY_PENDING, etc.) and adds PARTITION_INDEX / TOTAL_PARTITIONS.
 */

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scriptPath = path.join(__dirname, "warm-cache-standalone.js");

const totalPartitions = Math.max(1, parseInt(process.env.TOTAL_PARTITIONS || "8", 10));

console.log(`Starting ${totalPartitions} parallel warm workers (partition 0..${totalPartitions - 1}). Same cache dir; each worker owns a disjoint set of lessons.\n`);

const workers = [];
for (let i = 0; i < totalPartitions; i++) {
  const env = { ...process.env, PARTITION_INDEX: String(i), TOTAL_PARTITIONS: String(totalPartitions) };
  const child = spawn(process.execPath, [scriptPath], {
    env,
    stdio: ["ignore", "pipe", "pipe"],
    cwd: path.resolve(__dirname, ".."),
  });
  workers.push({ index: i, child });

  let out = "";
  let err = "";
  child.stdout.on("data", (chunk) => {
    out += chunk;
    process.stdout.write(`[${i}] ${chunk}`);
  });
  child.stderr.on("data", (chunk) => {
    err += chunk;
    process.stderr.write(`[${i}] ${chunk}`);
  });
  child.on("error", (e) => {
    console.error(`[${i}] spawn error:`, e.message);
  });
}

const codes = await Promise.all(
  workers.map(
    ({ child }) =>
      new Promise((resolve) => {
        child.on("exit", (code) => resolve(code ?? 1));
      })
  )
);

const failed = codes.filter((c) => c !== 0);
if (failed.length) {
  console.error(`\n${failed.length} worker(s) exited non-zero.`);
  process.exit(1);
}
console.log(`\nAll ${totalPartitions} workers finished. Cache ready.`);
