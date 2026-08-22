/**
 * Nuclear clean-slate for ID→JS testing.
 * Keeps reserved system projects (empty them of issues):
 *   1 product-backlog, 2 cohort-applications, 3 team-ops, 4 module-library
 * Deletes every other delivery/smoke project and ALL issues/PRs in OneDev.
 * Does NOT touch companion FE/BE core + fundamentals lesson code under IPAAL-main.
 *
 * Run: node scripts/wipe-clean-slate.mjs
 */
import "dotenv/config";
import { listIssues, listProjects, onedevFetch } from "../server/onedev-client.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const RESERVED_PROJECT_IDS = new Set([1, 2, 3, 4]);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSIST_DIR = path.resolve(__dirname, "../src/engines/assist");

async function listAllIssues() {
  let all = [];
  for (let offset = 0; offset < 10000; offset += 200) {
    const batch = await listIssues({ offset, count: 200 });
    if (!Array.isArray(batch) || batch.length === 0) break;
    all = all.concat(batch);
    if (batch.length < 200) break;
  }
  return all;
}

async function listAllPulls() {
  let all = [];
  for (let offset = 0; offset < 2000; offset += 100) {
    const batch = await onedevFetch(`/pulls?offset=${offset}&count=100`);
    if (!Array.isArray(batch) || batch.length === 0) break;
    all = all.concat(batch);
    if (batch.length < 100) break;
  }
  return all;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

console.log("=== IPF clean slate wipe ===");
console.log("Keeping curriculum: FE/BE core + fundamentals (companion lessons repo).");
console.log("Wiping: delivery projects, apps/matches/cohorts, module-library drafts.");
console.log("Keeping: src/engines/assist/* (regenerate with write-smb-assist-engines.mjs if missing).\n");

// 1) Close/delete pulls first (DeskNotesSprint etc.)
const pulls = await listAllPulls();
console.log(`Pulls to delete: ${pulls.length}`);
for (const pr of pulls) {
  try {
    await onedevFetch(`/pulls/${pr.id}`, { method: "DELETE" });
    process.stdout.write("p");
  } catch (err) {
    console.log(`\n pull #${pr.id} failed: ${err.message}`);
  }
}
console.log("");

// 2) Delete ALL issues (including reserved-project noise)
const issues = await listAllIssues();
console.log(`Issues to delete: ${issues.length}`);
let ok = 0;
let fail = 0;
for (const issue of issues) {
  try {
    await onedevFetch(`/issues/${issue.id}`, { method: "DELETE" });
    ok += 1;
    process.stdout.write(".");
  } catch (err) {
    fail += 1;
    process.stdout.write("x");
    console.log(`\n issue #${issue.id} ${issue.title}: ${err.message}`);
  }
}
console.log(`\nIssues deleted: ${ok}; failed: ${fail}`);

// 3) Delete non-reserved projects
const projects = await listProjects({ count: 100 });
const doomed = projects.filter((p) => !RESERVED_PROJECT_IDS.has(p.id));
console.log(
  `Projects to delete: ${doomed.map((p) => `${p.id}:${p.name}`).join(", ") || "(none)"}`,
);
for (const p of doomed) {
  try {
    await onedevFetch(`/projects/${p.id}`, { method: "DELETE" });
    console.log(`  deleted project #${p.id} ${p.name}`);
    await sleep(200);
  } catch (err) {
    console.log(`  FAILED project #${p.id} ${p.name}: ${err.message}`);
  }
}

// 4) Verify — keep Assist engines (curriculum); regenerate if missing
const leftProjects = await listProjects({ count: 100 });
const leftIssues = await listAllIssues();
const leftPulls = await listAllPulls();
const assistLeft = fs.existsSync(ASSIST_DIR)
  ? fs.readdirSync(ASSIST_DIR).filter((f) => /\.(jsx|tsx)$/.test(f)).length
  : 0;
console.log("\n=== VERIFY ===");
console.log(
  "Projects left:",
  leftProjects.map((p) => `${p.id}:${p.name}`).join(", "),
);
console.log("Issues left:", leftIssues.length);
console.log("Pulls left:", leftPulls.length);
console.log("Assist engines kept:", assistLeft);
console.log("\nClean slate ready. Then:");
console.log("  node scripts/write-smb-assist-engines.mjs");
console.log("  node scripts/seed-smb-pipeline.mjs");
console.log("  node scripts/publish-idt-assist-modules.mjs");
