/**
 * Publish all SMB IDT Assist modules and wire Coding tasks by title.
 * Run after: node scripts/write-smb-assist-engines.mjs
 *            node scripts/seed-smb-pipeline.mjs
 */
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import {
  listIssues,
  createIssue,
  updateIssueDescription,
} from "../server/onedev-client.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODULE_LIBRARY_PROJECT_ID = 4;

const MODULES = [
  { tag: "idt-booking-appointment-list-form", concept: "Appointment list + book form", taskTitle: "Build the appointment calendar list and book form" },
  { tag: "idt-booking-appointments-api", concept: "Appointments API + slot conflicts", taskTitle: "Implement appointments API with slot conflict checks" },
  { tag: "idt-booking-deposit-list-form", concept: "Deposit list + take-deposit form", taskTitle: "Build deposit list and take-deposit form" },
  { tag: "idt-booking-deposits-api", concept: "Deposits API held/applied", taskTitle: "Implement deposits API with held/applied status" },
  { tag: "idt-booking-day-board-filter", concept: "Day board filter by provider", taskTitle: "Build day board filtered by provider" },
  { tag: "idt-invoice-list-form", concept: "Invoice list + create form", taskTitle: "Build invoice list and create-invoice form" },
  { tag: "idt-invoice-overdue-api", concept: "Invoices API overdue status", taskTitle: "Implement invoices API with overdue status" },
  { tag: "idt-invoice-reminder-list-form", concept: "Reminder log list + schedule form", taskTitle: "Build reminder log list and schedule form" },
  { tag: "idt-invoice-reminder-api", concept: "Reminders API one pending", taskTitle: "Implement reminders API — one pending per invoice channel" },
  { tag: "idt-invoice-overdue-board", concept: "Overdue board filter", taskTitle: "Build overdue board filtered by status" },
  { tag: "idt-lead-list-form", concept: "Lead inbox list + capture form", taskTitle: "Build lead inbox list and capture form" },
  { tag: "idt-lead-stale-api", concept: "Leads API fresh/stale", taskTitle: "Implement leads API with fresh/stale status" },
  { tag: "idt-lead-reply-list-form", concept: "Reply notes list + form", taskTitle: "Build reply notes list and add-note form" },
  { tag: "idt-lead-notes-api", concept: "Lead notes API no duplicate spam", taskTitle: "Implement lead-notes API blocking duplicate body spam" },
  { tag: "idt-lead-stale-board", concept: "Stale lead board filter", taskTitle: "Build stale-lead board filtered by status" },
  { tag: "idt-shift-list-form", concept: "Shift board list + publish form", taskTitle: "Build shift board list and publish form" },
  { tag: "idt-shift-overlap-api", concept: "Shifts API worker overlap", taskTitle: "Implement shifts API with worker overlap conflicts" },
  { tag: "idt-coverage-list-form", concept: "Coverage list + request form", taskTitle: "Build open coverage list and request form" },
  { tag: "idt-coverage-api", concept: "Coverage API open/filled", taskTitle: "Implement coverage API with open/filled status" },
  { tag: "idt-open-shift-board", concept: "Open-shift board filter", taskTitle: "Build open-shift board filtered to unfilled coverage" },
  { tag: "idt-quote-list-form", concept: "Quote list + create form", taskTitle: "Build quote list and create-estimate form" },
  { tag: "idt-quote-expiry-api", concept: "Quotes API open/expired/accepted", taskTitle: "Implement quotes API with open/expired/accepted status" },
  { tag: "idt-quote-line-list-form", concept: "Quote line-items list + form", taskTitle: "Build quote line-items list and add-line form" },
  { tag: "idt-quote-lines-api", concept: "Quote lines API no duplicate labels", taskTitle: "Implement quote-lines API blocking duplicate labels" },
  { tag: "idt-quote-accepted-board", concept: "Accepted quotes board filter", taskTitle: "Build accepted-quotes board filtered by status" },
  { tag: "idt-review-list-form", concept: "Review inbox list + log form", taskTitle: "Build review inbox list and log-review form" },
  { tag: "idt-review-needs-reply-api", concept: "Reviews API needs-reply status", taskTitle: "Implement reviews API with needs-reply status" },
  { tag: "idt-review-reply-list-form", concept: "Review replies list + form", taskTitle: "Build review replies list and write-reply form" },
  { tag: "idt-review-replies-api", concept: "Review replies API one per channel", taskTitle: "Implement review-replies API — one reply per channel" },
  { tag: "idt-review-unanswered-board", concept: "Unanswered reviews board filter", taskTitle: "Build unanswered-reviews board filtered by status" },
  { tag: "idt-reminder-schedule-list-form", concept: "Reminder schedule list + form", taskTitle: "Build reminder schedule list and create form" },
  { tag: "idt-reminder-due-api", concept: "Reminders API due/sent status", taskTitle: "Implement reminders API with due/sent status" },
  { tag: "idt-reminder-template-list-form", concept: "Reminder templates list + form", taskTitle: "Build reminder templates list and save-template form" },
  { tag: "idt-reminder-templates-api", concept: "Reminder templates unique name", taskTitle: "Implement reminder-templates API — unique name per channel" },
  { tag: "idt-reminder-due-board", concept: "Due reminders board filter", taskTitle: "Build due-reminders board filtered by status" },
  { tag: "idt-package-list-form", concept: "Package punch-card list + sell form", taskTitle: "Build package punch-card list and sell form" },
  { tag: "idt-package-remaining-api", concept: "Packages API remaining/empty", taskTitle: "Implement packages API with remaining/empty status" },
  { tag: "idt-punch-log-list-form", concept: "Punch log list + redeem form", taskTitle: "Build punch log list and redeem form" },
  { tag: "idt-punch-redeem-api", concept: "Punches API reject when empty", taskTitle: "Implement punches API rejecting redeem when empty" },
  { tag: "idt-package-low-board", concept: "Low-balance packages board", taskTitle: "Build low-balance packages board filtered by status" },
];

function engineRel(tag) {
  return `src/engines/assist/inpact_assist_${tag}_engine.tsx`;
}

function wireAssist(desc, tag) {
  const lines = String(desc || "")
    .split("\n")
    .map((line) => {
      if (/^AssistModule:/.test(line)) return `AssistModule: ${tag}`;
      if (/^NeedsTutorial:/.test(line)) return `AssistModule: ${tag}`;
      if (/^DraftModule:/.test(line)) return null;
      return line;
    })
    .filter((l) => l !== null);
  if (!lines.some((l) => /^AssistModule:/.test(l))) {
    lines.push(`AssistModule: ${tag}`);
  }
  return lines.join("\n");
}

const issues = await listIssues({ count: 800 });

for (const m of MODULES) {
  const title = `Module: ${m.tag}`;
  const existing = issues.find((i) => i.projectId === MODULE_LIBRARY_PROJECT_ID && i.title === title);
  if (existing) {
    console.log(`✓ ${title} already published`);
  } else {
    await createIssue({
      projectId: MODULE_LIBRARY_PROJECT_ID,
      title,
      description: [
        `Concept: ${m.concept}`,
        `FilePath: ${path.resolve(__dirname, "..", engineRel(m.tag)).replace(/\\/g, "/")}`,
        `Pedagogy: Inverse Dependency Tracing (IDT)`,
        `PublishedAt: ${new Date().toISOString()}`,
        `PublishedBy: scripts/publish-idt-assist-modules.mjs`,
      ].join("\n"),
    });
    console.log(`+ published ${title}`);
  }

  const task = issues.find((i) => i.title === m.taskTitle);
  if (!task) {
    console.warn(`! no issue titled "${m.taskTitle}" — seed first`);
    continue;
  }
  const next = wireAssist(task.description, m.tag);
  if (next !== task.description) {
    await updateIssueDescription(task.id, next);
    console.log(`→ wired #${task.id} AssistModule: ${m.tag}`);
  } else {
    console.log(`✓ #${task.id} already wired ${m.tag}`);
  }
}

console.log(`\nDone. ${MODULES.length} modules.`);
