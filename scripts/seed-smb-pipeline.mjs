/**
 * Clean-slate SMB seed for Apply → Assist Me → PR testing.
 *
 * Products (see docs/SMB_PRODUCT_SELECTION_JOURNAL.md):
 *   1. BookingDepositDesk — appointments + deposits
 *   2. InvoiceFollowUpTracker — invoices + overdue nudges
 *   3. LeadFollowUpInbox — capture + stale follow-up (CRM cliff)
 *   4. ShiftCoverageBoard — shifts + open coverage
 *   5. QuoteEstimateDesk — quotes + expiry / accepted
 *   6. ReviewReplyInbox — reviews + unanswered replies
 *   7. ClientReminderHub — scheduled reminders + due board
 *   8. PackagePunchCard — prepaid packages + punch redeem
 *
 * Volume: ~5 tasks × 5 trades × 8 products = ~40 tasks per trade.
 * Coding tasks (~40) are AssistModule-wired via write-smb-assist-engines.mjs.
 *
 *   node scripts/wipe-clean-slate.mjs
 *   node scripts/write-smb-assist-engines.mjs
 *   node scripts/seed-smb-pipeline.mjs
 *   node scripts/publish-idt-assist-modules.mjs
 */
import "dotenv/config";
import { spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import {
  listIssues,
  createIssue,
  ensureDeliveryProject,
} from "../server/onedev-client.js";
import { notifyTeamServer } from "../server/notify-server.js";
import { CODING_ASSISTS } from "./codingTasks.data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSIST_DIR = path.resolve(__dirname, "../src/engines/assist");
const MODULE_LIBRARY_PROJECT_ID = 4;
const TEAM_OPS_PROJECT_ID = 3;


function nonCodingPack(epic, productKey) {
  const packs = {
    QA: [
      {
        title: `Write a manual test plan for ${epic} happy path`,
        story: "Quality gate for v1",
        ac: "Happy path steps with expected UI/API outcomes; include one negative case.",
      },
      {
        title: `Document edge cases for ${epic}`,
        story: "Catch the ugly paths",
        ac: "At least 5 edge cases (empty, duplicate, invalid, conflict/stale, cancel) with expected results.",
      },
      {
        title: `Regression checklist after ${epic} coding merge`,
        story: "Do not break yesterday",
        ac: "10-item smoke checklist a non-dev can run in under 15 minutes.",
      },
      {
        title: `Acceptance table for ${epic} API errors`,
        story: "Status codes matter",
        ac: "Table of 400/409/201 (or equivalent) inputs and expected bodies.",
      },
      {
        title: `Usability pass notes for ${epic} empty states`,
        story: "Empty is not broken",
        ac: "Notes on empty/error copy clarity; list of unclear labels to fix.",
      },
    ],
    Content: [
      {
        title: `Draft client-facing confirmation copy for ${epic}`,
        story: "Words users read",
        ac: "Confirmation body in plain language; variables for name/time/amount as needed.",
      },
      {
        title: `Write reminder / nudge templates for ${epic}`,
        story: "Tone that works",
        ac: "Friendly first + firmer second template; no jargon.",
      },
      {
        title: `Error-message style guide for ${epic}`,
        story: "Errors humans can fix",
        ac: "10 sample error strings mapped from API codes; consistent voice.",
      },
      {
        title: `Onboarding blurb for ${epic} first-run`,
        story: "First minute clarity",
        ac: "80–120 word first-run explanation of what the desk does.",
      },
      {
        title: `Help-center FAQ (5 Qs) for ${epic}`,
        story: "Deflect repeat questions",
        ac: "Five FAQ pairs covering booking/pay/status/cancel/contact.",
      },
    ],
    PM: [
      {
        title: `Cut MVP scope for ${epic} v1`,
        story: "Ship something small",
        ac: "Must-have vs later list; one-page delivery checklist.",
      },
      {
        title: `Acceptance criteria polish for ${epic} Coding tasks`,
        story: "No ambiguous done",
        ac: "Rewrite AC for all Coding tasks in this product as testable bullets.",
      },
      {
        title: `Risk register for ${epic}`,
        story: "Name the landmines",
        ac: "Top 5 risks with mitigation owner (tech, scope, copy, data).",
      },
      {
        title: `Release checklist for ${epic} demo day`,
        story: "Demo without chaos",
        ac: "Ordered checklist: seed data, happy path, known bugs, rollback note.",
      },
      {
        title: `Stakeholder update template for ${epic}`,
        story: "Status in one screen",
        ac: "Weekly update template: done / next / blocked with owners.",
      },
    ],
    "Product design": [
      {
        title: `Define ${epic} lifecycle statuses for handoff`,
        story: "Statuses users understand",
        ac: "Status list with plain labels; empty states; primary CTAs named.",
      },
      {
        title: `Wireframe notes for ${epic} list + form`,
        story: "Layout before pixels",
        ac: "Annotated list/form/empty regions; note what is interactive.",
      },
      {
        title: `Mobile pass for ${epic} primary screen`,
        story: "Thumbs first",
        ac: "Notes on stacking, tap targets, and what collapses on small screens.",
      },
      {
        title: `Empty + error state copy map for ${epic}`,
        story: "Design the dead ends",
        ac: "Pair each empty/error with recommended copy and recovery CTA.",
      },
      {
        title: `Accessibility checklist for ${epic} forms`,
        story: "Labels that work",
        ac: "Checklist: labels, focus order, error association, contrast notes.",
      },
    ],
  };

  const out = [];
  for (const [trade, items] of Object.entries(packs)) {
    for (const item of items) {
      out.push({ ...item, trade, epic, tech: undefined });
    }
  }
  return out;
}

function buildProduct(name, blurb, epic) {
  const coding = (CODING_ASSISTS[name] || []).map((t) => ({
    ...t,
    trade: "Coding",
    // FE ladder: js; BE ladder (language-agnostic): http-api | crud
    tech: t.tech || (t.focus === "backend" ? "crud" : "js"),
    epic,
  }));
  const rest = nonCodingPack(epic, name);
  return { name, blurb, tasks: [...coding, ...rest] };
}

const PRODUCTS = [
  buildProduct(
    "BookingDepositDesk",
    "Appointments + deposits for salons/clinics — SMBs pay for Calendly+Square+spreadsheets; this is one desk.",
    "Booking desk",
  ),
  buildProduct(
    "InvoiceFollowUpTracker",
    "Quote → invoice → overdue nudge for solo trades — replaces sticky notes + unpaid PDF chaos.",
    "Collections desk",
  ),
  buildProduct(
    "LeadFollowUpInbox",
    "Capture + stale follow-up for micro SMBs who bounce off HubSpot Pro pricing — a light lead inbox.",
    "Lead desk",
  ),
  buildProduct(
    "ShiftCoverageBoard",
    "Publish shifts + open coverage for cafes/salons — without an HR/workforce suite seat tax.",
    "Shift desk",
  ),
  buildProduct(
    "QuoteEstimateDesk",
    "Estimates → expiry → accepted for solo trades — without a full Jobber/Housecall stack.",
    "Quote desk",
  ),
  buildProduct(
    "ReviewReplyInbox",
    "Log reviews + reply + unanswered triage — without Birdeye/Podium-class reputation spend.",
    "Review desk",
  ),
  buildProduct(
    "ClientReminderHub",
    "Schedule reminders + due board — without SMS-suite / Pro-tier reminder upsells.",
    "Reminder desk",
  ),
  buildProduct(
    "PackagePunchCard",
    "Prepaid punch cards + redeem — without POS loyalty / per-staff package add-ons.",
    "Package desk",
  ),
];

const MODULES = Object.values(CODING_ASSISTS)
  .flat()
  .map((t) => ({
    tag: t.assist,
    concept: `Assist Me module for Coding task: ${t.title}`,
  }));

function engineRel(tag) {
  const slug = tag.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|$)/g, "");
  return path.join("src/engines/assist", `inpact_assist_${slug}_engine.tsx`).replace(/\\/g, "/");
}

function taskDescription(productName, t) {
  const lines = [
    `Epic: ${t.epic}`,
    `Story: ${t.story}`,
    `Trade: ${t.trade}`,
    t.tech ? `TechLevel: ${t.tech}` : null,
    `Cohort: ${productName}`,
    `AcceptanceCriteria: ${t.ac}`,
  ];
  if (t.assist) {
    lines.push(`AssistModule: ${t.assist}`);
  } else {
    lines.push("TutorialExempt: true");
  }
  if (t.focus) lines.push(`CodingFocus: ${t.focus}`);
  return lines.filter(Boolean).join("\n");
}

function gitIn(dir, ...args) {
  const r = spawnSync("git", args, { cwd: dir, encoding: "utf8" });
  if (r.status !== 0) {
    throw new Error(`git ${args.join(" ")}\n${r.stderr || ""}${r.stdout || ""}`);
  }
  return r.stdout.trim();
}

function pushInitialMain(projectName, readmeBody) {
  const user = process.env.ONEDEV_API_USER;
  const pass = process.env.ONEDEV_API_PASS;
  if (!user || !pass) {
    console.warn("  skip git seed — ONEDEV_API_USER/PASS missing");
    return false;
  }
  // Local dev: OneDev's Docker container on localhost. Point ONEDEV_INTERNAL_URL at a real
  // instance (e.g. its Railway public domain, when running this script against a remote
  // instance) to seed git history there instead.
  const base = new URL(process.env.ONEDEV_INTERNAL_URL || "http://localhost:6610");
  const remote =
    `${base.protocol}//` +
    encodeURIComponent(user) +
    ":" +
    encodeURIComponent(pass) +
    `@${base.host}/${projectName}.git`;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `${projectName}-`));
  gitIn(dir, "init");
  gitIn(dir, "config", "user.email", "seed@inpact.live");
  gitIn(dir, "config", "user.name", "IPF Seed");
  fs.writeFileSync(path.join(dir, "README.md"), readmeBody);
  fs.writeFileSync(
    path.join(dir, "CONTRIBUTING.md"),
    [
      "# How to submit work",
      "",
      "1. Clone this repo from OneDev.",
      "2. Create a branch named `js/<your-name>/<short-task>`.",
      "3. Implement the Workbench task acceptance criteria.",
      "4. Push the branch and open a Pull Request into `main`.",
      "5. CD Review picks up the PR for human review.",
      "",
    ].join("\n"),
  );
  gitIn(dir, "add", ".");
  gitIn(dir, "commit", "-m", `chore: seed ${projectName} main for JS submissions`);
  gitIn(dir, "branch", "-M", "main");
  gitIn(dir, "remote", "add", "origin", remote);
  const push = spawnSync("git", ["push", "-u", "origin", "main"], { cwd: dir, encoding: "utf8" });
  if (push.status !== 0) {
    console.warn(`  git push failed for ${projectName}:`, (push.stderr || push.stdout || "").slice(0, 400));
    return false;
  }
  console.log(`  ✓ git main pushed → ${projectName}.git`);
  return true;
}

async function ensureModulesPublished() {
  const issues = await listIssues({ count: 500 });
  for (const m of MODULES) {
    const abs = path.resolve(ASSIST_DIR, `inpact_assist_${m.tag.replace(/[^a-z0-9]+/g, "-")}_engine.tsx`);
    if (!fs.existsSync(abs)) {
      throw new Error(`Missing ${abs} — run: node scripts/write-smb-assist-engines.mjs`);
    }
    const title = `Module: ${m.tag}`;
    if (issues.some((i) => i.projectId === MODULE_LIBRARY_PROJECT_ID && i.title === title)) {
      console.log(`✓ ${title} already published`);
      continue;
    }
    await createIssue({
      projectId: MODULE_LIBRARY_PROJECT_ID,
      title,
      description: [
        `Concept: ${m.concept}`,
        `FilePath: ${engineRel(m.tag)}`,
        `PublishedAt: ${new Date().toISOString()}`,
        `PublishedBy: scripts/seed-smb-pipeline.mjs`,
      ].join("\n"),
    });
    console.log(`✓ published ${title}`);
  }
}

const tradeCounts = {};
for (const p of PRODUCTS) {
  for (const t of p.tasks) {
    tradeCounts[t.trade] = (tradeCounts[t.trade] || 0) + 1;
  }
}

console.log("=== Seed SMB pipeline (8 products) ===");
console.log("Tasks per trade:", tradeCounts);
console.log("Assist modules:", MODULES.length);
console.log("");

await ensureModulesPublished();

const created = [];

for (const product of PRODUCTS) {
  const ensured = await ensureDeliveryProject({
    name: product.name,
    description: product.blurb,
  });
  const projectId = ensured.projectId;
  console.log(`\nProject ${product.name} #${projectId} ${ensured.reused ? "(reused)" : "(created)"}`);

  await createIssue({
    projectId: TEAM_OPS_PROJECT_ID,
    title: `Cohort: ${product.name}`,
    description: [
      `Product: ${product.name}`,
      `DeliveryProject: ${product.name} (#${projectId})`,
      `TaskCount: ${product.tasks.length}`,
      `CreatedAt: ${new Date().toISOString()}`,
      `Seed: scripts/seed-smb-pipeline.mjs`,
      `Journal: docs/SMB_PRODUCT_SELECTION_JOURNAL.md`,
    ].join("\n"),
  });

  const taskIds = [];
  for (const t of product.tasks) {
    const id = await createIssue({
      projectId,
      title: t.title,
      description: taskDescription(product.name, t),
    });
    taskIds.push({ id, ...t });
    console.log(`  #${id} [${t.trade}] ${t.title}${t.assist ? ` → ${t.assist}` : ""}`);
  }

  pushInitialMain(
    product.name,
    `# ${product.name}\n\n${product.blurb}\n\nSeeded for IPF Apply → Assist Me → PR testing.\nSee docs/SMB_PRODUCT_SELECTION_JOURNAL.md\n`,
  );

  created.push({ projectId, name: product.name, tasks: taskIds });
}

// Previously seeded a fake "Application"/"Match" pair here for a hardcoded smoke-test identity
// (senagasetty@gmail.com) to have something to look at post-seed. Removed: the "Match: <name> on
// #<id>" issue got written straight into the real delivery project (BookingDepositDesk) with its
// own Trade: Coding line, which is indistinguishable from a real task to tasksForApplicant's
// matching filter (matching.js) — found live, a real applicant (bsit.setty@gmail.com) got matched
// to this smoke-test record instead of an actual task. matching.js's isAssignable() now also
// rejects any "Match:"/"Matched:" titled issue defensively, but don't reintroduce the source: use
// the real Apply flow (or MatchingQueue's manual placement) to verify a fresh seed, not fixture
// data planted directly in a delivery project.

try {
  await notifyTeamServer(
    `🌱 Seeded **8 SMB products** (~40 tasks/trade, ${MODULES.length} Assist modules). Journal: docs/SMB_PRODUCT_SELECTION_JOURNAL.md`,
  );
} catch {
  /* optional */
}

const outPath = path.join(__dirname, "seed-smb-pipeline.last.json");
fs.writeFileSync(
  outPath,
  JSON.stringify(
    {
      products: created.map((p) => ({
        projectId: p.projectId,
        name: p.name,
        tasks: p.tasks.map((t) => ({
          id: t.id,
          trade: t.trade,
          title: t.title,
          assist: t.assist || null,
        })),
      })),
      tradeCounts,
      assistCount: MODULES.length,
      journal: "docs/SMB_PRODUCT_SELECTION_JOURNAL.md",
    },
    null,
    2,
  ),
);

console.log(`\nWrote ${outPath}`);
console.log("Next: node scripts/publish-idt-assist-modules.mjs");
console.log("Preview: #/assist-preview");
console.log("3. Clone http://localhost:6610/BookingDepositDesk.git");
