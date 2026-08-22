/**
 * Prove Apply match + Assist Me wiring for RIM after Module Library publish.
 * Does not need Google — simulates recruit matching and verifies engines on disk.
 *
 * Usage: node scripts/smoke-prove-rim-apply.mjs
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { listIssues, listProjects, createIssue } from "../server/onedev-client.js";
import {
  COHORT_PROJECT_ID,
  RESERVED_PROJECT_IDS,
  isAssignable,
  bestTaskMatch,
  taskMeta,
} from "../src/cohort-matching/matching.js";
import { assertValidModule } from "../src/id-module/generateModule.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSIST_DIR = path.resolve(__dirname, "../src/engines/assist");
const RIM_NAME = /restaurant inventory manager/i;
const SMOKE_EMAIL = "smoke-rim-fe@ipf.local";
const SMOKE_NAME = "Smoke RIM FE";

function enginePath(tag) {
  return path.join(ASSIST_DIR, `inpact_assist_${tag}_engine.tsx`);
}

function projectNameOf(projects, id) {
  return projects.find((p) => p.id === id)?.name || `project-${id}`;
}

const [projects, issues] = await Promise.all([
  listProjects({ offset: 0, count: 100 }),
  listIssues({ offset: 0, count: 300 }),
]);

const rim = projects.find((p) => RIM_NAME.test(p.name || ""));
if (!rim) {
  console.error("FAIL: Restaurant Inventory Manager project not found");
  process.exit(1);
}

const openAssignable = issues.filter(
  (i) => !RESERVED_PROJECT_IDS.has(i.projectId) && i.state === "Open" && isAssignable(i)
);
const rimAssignable = openAssignable.filter((i) => i.projectId === rim.id);
console.log(`RIM assignable: ${rimAssignable.length}`);
if (rimAssignable.length === 0) {
  console.error("FAIL: no assignable RIM tasks");
  process.exit(1);
}

const matches = issues.filter((i) => i.projectId === COHORT_PROJECT_ID && i.title.startsWith("Matched:"));
const aspirationIssues = issues.filter((i) => i.title.startsWith("Aspiration:"));
const ctx = { tasks: openAssignable, matches, allIssues: issues, aspirationIssues };

const feInfo = {
  Name: SMOKE_NAME,
  "Stated trade": "Coding",
  SkillLevel: "js",
  CodingFocus: "frontend",
};
const feTask = bestTaskMatch(feInfo, ctx);
if (!feTask || feTask.projectId !== rim.id) {
  console.error("FAIL: Coding+frontend did not match a RIM task", feTask?.title);
  process.exit(1);
}
const feAssist = /^AssistModule:\s*(.+)$/m.exec(feTask.description || "")?.[1]?.trim();
console.log(`✓ Coding+frontend → #${feTask.number} ${feTask.title}`);
console.log(`  AssistModule: ${feAssist || "(missing)"}`);
if (!feAssist) {
  console.error("FAIL: matched FE task has no AssistModule");
  process.exit(1);
}

const beTask = bestTaskMatch(
  { Name: "Smoke RIM BE", "Stated trade": "Coding", SkillLevel: "js", CodingFocus: "backend" },
  ctx
);
console.log(
  beTask
    ? `✓ Coding+backend → #${beTask.number} ${beTask.title.slice(0, 50)}`
    : "✗ Coding+backend → none"
);

const frontTrade = bestTaskMatch({ Name: "Smoke Front", "Stated trade": "Frontend" }, ctx);
console.log(
  frontTrade
    ? `✓ Trade Frontend → #${frontTrade.number} ${frontTrade.title.slice(0, 50)}`
    : "✗ Trade Frontend → none (ok if only Coding-tagged supply left untaken)"
);

// Engines for every AssistModule on RIM
const tags = [
  ...new Set(
    rimAssignable
      .map((t) => /^AssistModule:\s*(.+)$/m.exec(t.description || "")?.[1]?.trim())
      .filter(Boolean)
  ),
];
for (const tag of tags) {
  const abs = enginePath(tag);
  if (!fs.existsSync(abs)) {
    console.error(`FAIL: missing engine for ${tag}`);
    process.exit(1);
  }
  assertValidModule(fs.readFileSync(abs, "utf8"));
  console.log(`✓ engine ok: ${path.basename(abs)}`);
}

// Simulate Apply: Application + Matched (idempotent if smoke already exists)
const existingApp = issues.find(
  (i) =>
    i.projectId === COHORT_PROJECT_ID &&
    i.title.startsWith("Application:") &&
    (i.description || "").includes(`Email: ${SMOKE_EMAIL}`)
);
let applicationId = existingApp?.id;
if (!applicationId) {
  applicationId = await createIssue({
    projectId: COHORT_PROJECT_ID,
    title: `Application: ${SMOKE_NAME} — Coding`,
    description: [
      `Name: ${SMOKE_NAME}`,
      `Email: ${SMOKE_EMAIL}`,
      `Stated trade: Coding`,
      `SkillLevel: js`,
      `Aspiration: ts`,
      `CodingFocus: frontend`,
      `Note: smoke-prove-rim-apply.mjs`,
      `OwnershipAck: true`,
      `OwnershipAckAt: ${new Date().toISOString()}`,
    ].join("\n"),
  });
  console.log(`✓ created Application id=${applicationId}`);
} else {
  console.log(`✓ reuse Application id=${applicationId}`);
}

const existingMatch = issues.find(
  (i) =>
    i.projectId === COHORT_PROJECT_ID &&
    i.title.startsWith("Matched:") &&
    (i.description || "").includes(`ApplicationId: ${applicationId}`)
);
if (!existingMatch) {
  const matchedIssue = await createIssue({
    projectId: COHORT_PROJECT_ID,
    title: `Matched: ${SMOKE_NAME} → ${feTask.title}`,
    description: [
      `ApplicationId: ${applicationId}`,
      `TaskId: ${feTask.id}`,
      `Task: #${feTask.number} "${feTask.title}" in ${projectNameOf(projects, feTask.projectId)}`,
      `StatedTrade: Coding`,
      `— matched by scripts/smoke-prove-rim-apply.mjs`,
    ].join("\n"),
  });
  console.log(`✓ created Matched id=${matchedIssue} → task #${feTask.number}`);
} else {
  console.log(`✓ reuse Matched → task from ApplicationId ${applicationId}`);
}

console.log("\nPASS: Apply match proved for Coding+frontend → RIM FE with AssistModule");
console.log("NOTE: live Google Apply UI still needs a non-ops JS account (session dep).");
console.log(
  "Trades on RIM:",
  [...new Set(rimAssignable.map((t) => taskMeta(t.description).trade))].join(", ")
);
