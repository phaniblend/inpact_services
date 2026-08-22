/**
 * Critical path: publish FE/BE assist modules for RIM from on-disk engines, wire tasks.
 * Engines: scripts/write-lean-assist-engines.mjs (no Gemini — Gemini timeouts blocked the path).
 * Usage: node scripts/publish-rim-assist-modules.mjs
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  listIssues,
  createIssue,
  updateIssueDescription,
  updateIssueTitle,
} from "../server/onedev-client.js";
import { tryRematchQueuedApplicants } from "../server/recruit-router.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSIST_DIR = path.resolve(__dirname, "../src/engines/assist");
const MODULE_LIBRARY_PROJECT_ID = 4;
const RIM_PROJECT_ID = 12;

const SPECS = [
  {
    tag: "resource-list-and-form-ui",
    concept:
      "Build frontend screens to list, create, edit, and delete a resource with forms wired to a CRUD API.",
  },
  {
    tag: "resource-list-and-detail-frontend",
    concept: "Browse a resource list and open a detail view with related activity.",
  },
  {
    tag: "form-submit-and-adjustment",
    concept: "Submit a form that adjusts a numeric quantity with validation and confirmation feedback.",
  },
  {
    tag: "resource-crud-api",
    concept: "Implement a REST CRUD API for a resource with persistence and validation.",
  },
];

/** RIM open tasks missing DraftModule — stamp so sync-wiring / publish can attach AssistModule. */
const RIM_DRAFT_BY_NUMBER = {
  1: "resource-list-and-form-ui",
  2: "resource-crud-api",
  3: "resource-list-and-detail-frontend",
  4: "resource-crud-api",
  5: "resource-list-and-form-ui",
  6: "resource-crud-api",
};

function enginePath(tag) {
  const slug = String(tag)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return path.join(ASSIST_DIR, `inpact_assist_${slug}_engine.tsx`);
}

function wireDescription(desc, moduleTag) {
  return (desc || "")
    .split("\n")
    .map((line) => {
      if (/^NeedsTutorial:/.test(line)) return `AssistModule: ${moduleTag}`;
      if (/^DraftModule:/.test(line)) return null;
      return line;
    })
    .filter((l) => l !== null)
    .join("\n");
}

function ensureEngineOnDisk(tag) {
  const abs = enginePath(tag);
  if (!fs.existsSync(abs)) {
    throw new Error(
      `Missing engine ${path.basename(abs)} — run: node scripts/write-lean-assist-engines.mjs`
    );
  }
  console.log(`✓ engine on disk: ${path.basename(abs)}`);
  return abs;
}

async function stampRimDraftModules() {
  const issues = await listIssues({ count: 300 });
  for (const task of issues) {
    if (task.projectId !== RIM_PROJECT_ID || task.state !== "Open") continue;
    const want = RIM_DRAFT_BY_NUMBER[task.number];
    if (!want) continue;
    const d = task.description || "";
    if (!/^NeedsTutorial:\s*true/m.test(d)) continue;
    if (/^AssistModule:/m.test(d)) continue;
    const existing = /^DraftModule:\s*(.+)$/m.exec(d)?.[1]?.trim();
    if (existing) continue;
    const next = d.trimEnd() + `\nDraftModule: ${want}`;
    await updateIssueDescription(task.id, next);
    console.log(`  stamped #${task.number} DraftModule: ${want}`);
  }
}

async function ensurePublished(tag, concept, filePath) {
  const issues = await listIssues({ count: 300 });
  const existing = issues.find(
    (i) => i.projectId === MODULE_LIBRARY_PROJECT_ID && i.title === `Module: ${tag}`
  );
  if (existing) {
    console.log(`✓ Module: ${tag} already in library`);
    return;
  }
  await createIssue({
    projectId: MODULE_LIBRARY_PROJECT_ID,
    title: `Module: ${tag}`,
    description: [
      `Concept: ${concept}`,
      `FilePath: ${String(filePath).replace(/\\/g, "/")}`,
      `PublishedAt: ${new Date().toISOString()}`,
      `PublishedBy: scripts/publish-rim-assist-modules.mjs`,
    ].join("\n"),
  });
  console.log(`✓ published Module: ${tag}`);
}

async function wireByDraftTag(tag) {
  const issues = await listIssues({ count: 300 });
  let n = 0;
  for (const task of issues) {
    if (task.state !== "Open") continue;
    const d = task.description || "";
    if (!/^NeedsTutorial:\s*true/m.test(d)) continue;
    const draft = /^DraftModule:\s*(.+)$/m.exec(d)?.[1]?.trim();
    if (!draft || draft.toLowerCase() !== tag.toLowerCase()) continue;
    await updateIssueDescription(task.id, wireDescription(d, tag));
    console.log(`  wired #${task.number} → AssistModule: ${tag}`);
    n++;
  }
  return n;
}

async function resolvePending(tag) {
  const issues = await listIssues({ count: 300 });
  for (const r of issues) {
    if (r.projectId !== MODULE_LIBRARY_PROJECT_ID) continue;
    if (/\(resolved\)/i.test(r.title)) continue;
    if (r.title !== `Assistance lesson needed: ${tag}` && r.title !== `Tutorial needed: ${tag}`) continue;
    await updateIssueTitle(r.id, `${r.title} (resolved)`);
    console.log(`  resolved ${r.title}`);
  }
}

async function publishFundasOnDisk() {
  const issues = await listIssues({ count: 300 });
  const files = fs.readdirSync(ASSIST_DIR).filter((f) => f.startsWith("inpact_assist_funda-") && f.endsWith(".tsx"));
  for (const file of files) {
    const slug = file.replace(/^inpact_assist_/, "").replace(/_engine\.tsx$/, "");
    const tag = slug;
    const existing = issues.find(
      (i) => i.projectId === MODULE_LIBRARY_PROJECT_ID && i.title === `Module: ${tag}`
    );
    if (existing) {
      console.log(`✓ funda Module: ${tag} already published`);
      continue;
    }
    const abs = path.join(ASSIST_DIR, file).replace(/\\/g, "/");
    await createIssue({
      projectId: MODULE_LIBRARY_PROJECT_ID,
      title: `Module: ${tag}`,
      description: [
        `Concept: Fundamental prerequisite lesson (${tag})`,
        `FilePath: ${abs}`,
        `Kind: funda`,
        `PublishedAt: ${new Date().toISOString()}`,
        `PublishedBy: scripts/publish-rim-assist-modules.mjs`,
      ].join("\n"),
    });
    console.log(`✓ published funda Module: ${tag}`);
    await resolvePending(tag);
  }
}

async function closeAssistStubs() {
  const issues = await listIssues({ count: 300 });
  for (const i of issues) {
    if (i.projectId !== MODULE_LIBRARY_PROJECT_ID) continue;
    if (!/^Assistance lesson needed:/i.test(i.title) && !/^Tutorial needed:/i.test(i.title)) continue;
    if (/\(resolved\)/i.test(i.title)) continue;
    await updateIssueTitle(i.id, `${i.title} (resolved)`);
    console.log(`  closed pending ${i.title}`);
  }
}

async function main() {
  fs.mkdirSync(ASSIST_DIR, { recursive: true });

  console.log("=== stamp DraftModule on RIM ===");
  await stampRimDraftModules();

  for (const spec of SPECS) {
    console.log(`\n=== ${spec.tag} ===`);
    try {
      const fp = ensureEngineOnDisk(spec.tag);
      await ensurePublished(spec.tag, spec.concept, fp);
      await wireByDraftTag(spec.tag);
      await resolvePending(spec.tag);
    } catch (err) {
      console.error(`✗ ${spec.tag}:`, err.message);
    }
  }

  console.log("\n=== fundas on disk ===");
  await publishFundasOnDisk();
  console.log("\n=== close leftover pendings ===");
  await closeAssistStubs();

  try {
    const rematch = await tryRematchQueuedApplicants();
    console.log(`\nrematch: ${rematch.rematched?.length ?? 0}`);
  } catch (err) {
    console.warn("rematch:", err.message);
  }

  const after = await listIssues({ count: 300 });
  const rim = after.filter((i) => i.projectId === RIM_PROJECT_ID && i.state === "Open");
  console.log("\n=== RIM open ===");
  for (const t of rim.sort((a, b) => a.number - b.number)) {
    const d = t.description || "";
    const status = /^AssistModule:/m.test(d)
      ? "ASSIGNABLE"
      : /^NeedsTutorial:\s*true/m.test(d)
        ? "BLOCKED"
        : "OTHER";
    const mod = /^AssistModule:\s*(.+)$/m.exec(d)?.[1] || /^DraftModule:\s*(.+)$/m.exec(d)?.[1] || "";
    console.log(`  #${t.number} [${status}] ${mod} | ${t.title}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
