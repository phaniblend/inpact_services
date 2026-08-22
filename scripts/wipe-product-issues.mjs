/**
 * One-shot wipe of Workbench product Stories/Tasks in OneDev.
 * Keeps reserved projects (cohort-applications=2, team-ops=3, module-library=4) intact.
 * Project shells (product-backlog, Feedback-board, swap board, Restaurant Inventory Manager) stay.
 *
 * Run: node scripts/wipe-product-issues.mjs
 */
import dotenv from "dotenv";
dotenv.config();
import { listIssues, listProjects, onedevFetch } from "../server/onedev-client.js";

const RESERVED = new Set([2, 3, 4]);

async function deleteIssue(id) {
  return onedevFetch(`/issues/${id}`, { method: "DELETE" });
}

async function listAllIssues() {
  let all = [];
  for (let offset = 0; offset < 5000; offset += 200) {
    const batch = await listIssues({ offset, count: 200 });
    if (!Array.isArray(batch) || batch.length === 0) break;
    all = all.concat(batch);
    if (batch.length < 200) break;
  }
  return all;
}

const projects = await listProjects({ count: 100 });
const productProjects = projects.filter((p) => !RESERVED.has(p.id));
console.log(
  "Product projects kept (issues wiped):",
  productProjects.map((p) => `${p.id}:${p.name}`).join(", ") || "(none)",
);
console.log("Reserved projects untouched: 2, 3, 4");

const all = await listAllIssues();
const targets = all.filter((i) => !RESERVED.has(i.projectId));
console.log(`Total issues seen: ${all.length}; deleting product issues: ${targets.length}`);

let ok = 0;
let fail = 0;
const failures = [];
for (const issue of targets) {
  try {
    await deleteIssue(issue.id);
    ok += 1;
    process.stdout.write(".");
  } catch (err) {
    fail += 1;
    failures.push({ id: issue.id, title: issue.title, err: err.message });
    process.stdout.write("x");
  }
}
console.log(`\nDeleted: ${ok}; failed: ${fail}`);
if (failures.length) console.log(failures.slice(0, 20));

const remaining = await listAllIssues();
const leftProduct = remaining.filter((i) => !RESERVED.has(i.projectId));
const leftReserved = remaining.filter((i) => RESERVED.has(i.projectId));
console.log(`Verify — product issues left: ${leftProduct.length}; reserved issues left: ${leftReserved.length}`);
if (leftProduct.length) {
  console.log(
    "Still present:",
    leftProduct.slice(0, 10).map((i) => ({ id: i.id, projectId: i.projectId, title: i.title })),
  );
}
