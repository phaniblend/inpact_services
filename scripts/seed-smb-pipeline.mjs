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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSIST_DIR = path.resolve(__dirname, "../src/engines/assist");
const MODULE_LIBRARY_PROJECT_ID = 4;
const TEAM_OPS_PROJECT_ID = 3;
const JS_EMAIL = "senagasetty@gmail.com";
const JS_NAME = "Senaga";

/** Coding assist tags — must match write-smb-assist-engines.mjs */
const CODING_ASSISTS = {
  BookingDepositDesk: [
    {
      title: "Build the appointment calendar list and book form",
      assist: "idt-booking-appointment-list-form",
      focus: "frontend",
      story: "Client can request a slot",
      ac: "List upcoming appointments; form to request date/time/service; show confirmation state.",
    },
    {
      title: "Implement appointments API with slot conflict checks",
      assist: "idt-booking-appointments-api",
      focus: "backend",
      story: "Server owns availability",
      ac: "CRUD appointments; reject overlapping slots for the same provider; persist in memory/file store.",
    },
    {
      title: "Build deposit list and take-deposit form",
      assist: "idt-booking-deposit-list-form",
      focus: "frontend",
      story: "Money down protects the slot",
      ac: "List deposits; form for client/amount/appointmentId; empty state when none.",
    },
    {
      title: "Implement deposits API with held/applied status",
      assist: "idt-booking-deposits-api",
      focus: "backend",
      story: "Deposit state is derived",
      ac: "Validate amount > 0; derive held vs applied; GET/POST attach status.",
    },
    {
      title: "Build day board filtered by provider",
      assist: "idt-booking-day-board-filter",
      focus: "frontend",
      story: "Scan one stylist's day",
      ac: "Keep full list in state; filter display by provider; empty message when filter matches nothing.",
    },
  ],
  InvoiceFollowUpTracker: [
    {
      title: "Build invoice list and create-invoice form",
      assist: "idt-invoice-list-form",
      focus: "frontend",
      story: "See what is owed",
      ac: "List invoices with status; form to create client/amount/due date; empty state.",
    },
    {
      title: "Implement invoices API with overdue status",
      assist: "idt-invoice-overdue-api",
      focus: "backend",
      story: "Server computes status",
      ac: "CRUD invoices; derive overdue from due date; validate amount > 0.",
    },
    {
      title: "Build reminder log list and schedule form",
      assist: "idt-invoice-reminder-list-form",
      focus: "frontend",
      story: "Plan the nudge",
      ac: "List reminders; form for invoiceId/channel/sendAt; empty state.",
    },
    {
      title: "Implement reminders API — one pending per invoice channel",
      assist: "idt-invoice-reminder-api",
      focus: "backend",
      tech: "http-api",
      story: "No spam doubles",
      ac: "POST rejects duplicate pending reminder for same invoiceId+channel with 409.",
    },
    {
      title: "Build overdue board filtered by status",
      assist: "idt-invoice-overdue-board",
      focus: "frontend",
      story: "Chase what is late",
      ac: "Filter list to overdue for display; keep full invoices in state.",
    },
  ],
  LeadFollowUpInbox: [
    {
      title: "Build lead inbox list and capture form",
      assist: "idt-lead-list-form",
      focus: "frontend",
      story: "Catch the ask",
      ac: "List leads; form name/source/note; empty state.",
    },
    {
      title: "Implement leads API with fresh/stale status",
      assist: "idt-lead-stale-api",
      focus: "backend",
      story: "Stale is computed",
      ac: "Derive stale from capturedAt; do not trust client status.",
    },
    {
      title: "Build reply notes list and add-note form",
      assist: "idt-lead-reply-list-form",
      focus: "frontend",
      story: "Log what we said",
      ac: "List notes; form leadId/body/channel; empty state.",
    },
    {
      title: "Implement lead-notes API blocking duplicate body spam",
      assist: "idt-lead-notes-api",
      focus: "backend",
      tech: "http-api",
      story: "Timeline stays clean",
      ac: "409 when same leadId+body already exists.",
    },
    {
      title: "Build stale-lead board filtered by status",
      assist: "idt-lead-stale-board",
      focus: "frontend",
      story: "Who needs a nudge",
      ac: "Filter to stale for display; keep full lead list in state.",
    },
  ],
  ShiftCoverageBoard: [
    {
      title: "Build shift board list and publish form",
      assist: "idt-shift-list-form",
      focus: "frontend",
      story: "Publish who works",
      ac: "List shifts; form worker/role/startsAt; empty state.",
    },
    {
      title: "Implement shifts API with worker overlap conflicts",
      assist: "idt-shift-overlap-api",
      focus: "backend",
      story: "One body one place",
      ac: "409 when same worker+startsAt already booked.",
    },
    {
      title: "Build open coverage list and request form",
      assist: "idt-coverage-list-form",
      focus: "frontend",
      story: "Ask for cover",
      ac: "List coverage requests; form shiftId/reason/neededBy.",
    },
    {
      title: "Implement coverage API with open/filled status",
      assist: "idt-coverage-api",
      focus: "backend",
      story: "Filled is derived",
      ac: "Derive open vs filled from claimedBy; GET/POST attach status.",
    },
    {
      title: "Build open-shift board filtered to unfilled coverage",
      assist: "idt-open-shift-board",
      focus: "frontend",
      story: "See what still needs cover",
      ac: "Filter to open coverage for display; keep full requests in state.",
    },
  ],
  QuoteEstimateDesk: [
    {
      title: "Build quote list and create-estimate form",
      assist: "idt-quote-list-form",
      focus: "frontend",
      story: "Send a price",
      ac: "List quotes; form client/total/validUntil; empty state.",
    },
    {
      title: "Implement quotes API with open/expired/accepted status",
      assist: "idt-quote-expiry-api",
      focus: "backend",
      tech: "crud",
      story: "Expiry is computed",
      ac: "Derive expired from validUntil; accepted from flag; do not trust client status.",
    },
    {
      title: "Build quote line-items list and add-line form",
      assist: "idt-quote-line-list-form",
      focus: "frontend",
      story: "Break down the price",
      ac: "List lines; form quoteId/label/amount; empty state.",
    },
    {
      title: "Implement quote-lines API blocking duplicate labels",
      assist: "idt-quote-lines-api",
      focus: "backend",
      tech: "http-api",
      story: "No double Labor lines",
      ac: "409 when same quoteId+label already exists.",
    },
    {
      title: "Build accepted-quotes board filtered by status",
      assist: "idt-quote-accepted-board",
      focus: "frontend",
      story: "See won work",
      ac: "Filter to accepted for display; keep full quotes in state.",
    },
  ],
  ReviewReplyInbox: [
    {
      title: "Build review inbox list and log-review form",
      assist: "idt-review-list-form",
      focus: "frontend",
      story: "Catch the feedback",
      ac: "List reviews; form author/rating/body; empty state.",
    },
    {
      title: "Implement reviews API with needs-reply status",
      assist: "idt-review-needs-reply-api",
      focus: "backend",
      tech: "crud",
      story: "Unanswered is derived",
      ac: "Derive needs-reply vs answered from repliedAt; validate rating.",
    },
    {
      title: "Build review replies list and write-reply form",
      assist: "idt-review-reply-list-form",
      focus: "frontend",
      story: "Answer on the record",
      ac: "List replies; form reviewId/body/channel; empty state.",
    },
    {
      title: "Implement review-replies API — one reply per channel",
      assist: "idt-review-replies-api",
      focus: "backend",
      tech: "http-api",
      story: "No double posts",
      ac: "409 when same reviewId+channel already replied.",
    },
    {
      title: "Build unanswered-reviews board filtered by status",
      assist: "idt-review-unanswered-board",
      focus: "frontend",
      story: "Triage what still needs a reply",
      ac: "Filter to needs-reply for display; keep full review list in state.",
    },
  ],
  ClientReminderHub: [
    {
      title: "Build reminder schedule list and create form",
      assist: "idt-reminder-schedule-list-form",
      focus: "frontend",
      story: "Plan the nudge",
      ac: "List reminders; form client/channel/sendAt; empty state.",
    },
    {
      title: "Implement reminders API with due/sent status",
      assist: "idt-reminder-due-api",
      focus: "backend",
      tech: "crud",
      story: "Due is computed",
      ac: "Derive due/scheduled/sent from sendAt + sent flag.",
    },
    {
      title: "Build reminder templates list and save-template form",
      assist: "idt-reminder-template-list-form",
      focus: "frontend",
      story: "Reuse the wording",
      ac: "List templates; form name/body/channel; empty state.",
    },
    {
      title: "Implement reminder-templates API — unique name per channel",
      assist: "idt-reminder-templates-api",
      focus: "backend",
      tech: "http-api",
      story: "No duplicate names",
      ac: "409 when same name+channel already exists.",
    },
    {
      title: "Build due-reminders board filtered by status",
      assist: "idt-reminder-due-board",
      focus: "frontend",
      story: "See what should send now",
      ac: "Filter to due for display; keep full schedule in state.",
    },
  ],
  PackagePunchCard: [
    {
      title: "Build package punch-card list and sell form",
      assist: "idt-package-list-form",
      focus: "frontend",
      story: "Sell prepaid visits",
      ac: "List packages; form client/service/totalPunches; empty state.",
    },
    {
      title: "Implement packages API with remaining/empty status",
      assist: "idt-package-remaining-api",
      focus: "backend",
      tech: "crud",
      story: "Remaining is computed",
      ac: "Derive empty vs active from usedPunches vs totalPunches.",
    },
    {
      title: "Build punch log list and redeem form",
      assist: "idt-punch-log-list-form",
      focus: "frontend",
      story: "Record a visit",
      ac: "List punches; form packageId/note/at; empty state.",
    },
    {
      title: "Implement punches API rejecting redeem when empty",
      assist: "idt-punch-redeem-api",
      focus: "backend",
      tech: "http-api",
      story: "No free punches",
      ac: "409 when package already fully used.",
    },
    {
      title: "Build low-balance packages board filtered by status",
      assist: "idt-package-low-board",
      focus: "frontend",
      story: "Upsell almost-empty cards",
      ac: "Filter to low for display; keep full packages in state.",
    },
  ],
};

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
  const remote =
    "http://" +
    encodeURIComponent(user) +
    ":" +
    encodeURIComponent(pass) +
    `@localhost:6610/${projectName}.git`;
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

const booking = created.find((p) => p.name === "BookingDepositDesk");
const feTask = booking?.tasks.find((t) => t.trade === "Coding" && t.focus === "frontend" && t.assist?.includes("appointment-list"));
if (!feTask) throw new Error("Booking FE task missing");

await createIssue({
  projectId: TEAM_OPS_PROJECT_ID,
  title: `Application: ${JS_NAME} → ${feTask.title}`,
  description: [
    `ApplicantEmail: ${JS_EMAIL}`,
    `ApplicantName: ${JS_NAME}`,
    `Stated trade: Coding`,
    `TargetIssue: #${feTask.id}`,
    `Product: BookingDepositDesk`,
    `Status: Matched`,
    `Seed: scripts/seed-smb-pipeline.mjs`,
  ].join("\n"),
});

await createIssue({
  projectId: booking.projectId,
  title: `Match: ${JS_NAME} on #${feTask.id}`,
  description: [
    `AssigneeEmail: ${JS_EMAIL}`,
    `IssueId: ${feTask.id}`,
    `Trade: Coding`,
    `Status: Active`,
  ].join("\n"),
});

try {
  await notifyTeamServer(
    `🌱 Seeded **8 SMB products** (~40 tasks/trade, ${MODULES.length} Assist modules). Assigned **${JS_NAME}** (<${JS_EMAIL}>) to Booking FE. Journal: docs/SMB_PRODUCT_SELECTION_JOURNAL.md`,
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
