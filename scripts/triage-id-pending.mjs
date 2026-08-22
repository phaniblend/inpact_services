/**
 * List ID Studio pending assistance drafts with a suggested triage action.
 * Requires OneDev up + env credentials.
 *
 * Usage:
 *   node scripts/triage-id-pending.mjs
 *   node scripts/triage-id-pending.mjs --json
 */
import "dotenv/config";
import { listIssues, parseKV } from "../server/onedev-client.js";

const MODULE_LIBRARY_PROJECT_ID = Number(process.env.MODULE_LIBRARY_PROJECT_ID || 4);
const asJson = process.argv.includes("--json");

function isPendingTitle(title) {
  const t = String(title || "");
  return (
    (t.startsWith("Assistance lesson needed:") || t.startsWith("Tutorial needed:")) &&
    !/\(resolved\)\s*$/i.test(t)
  );
}

function suggestAction(issue, fields) {
  const ageMs = Date.now() - new Date(issue.submitDate || issue.lastActivityDate || 0).getTime();
  const ageDays = Number.isFinite(ageMs) ? ageMs / (1000 * 60 * 60 * 24) : null;
  const kind = (fields.Kind || "core").toLowerCase();
  const hasDraft = Boolean(fields.FilePath || fields.DraftPath || fields.filePath);
  const generationFailed = /true/i.test(String(fields.GenerationFailed || ""));

  if (generationFailed) return { action: "REGENERATE", reason: "generationFailed flag set" };
  if (!hasDraft) return { action: "REGENERATE", reason: "no draft file path on the issue" };
  if (ageDays != null && ageDays > 21) {
    return { action: "CLOSE_OR_REGENERATE", reason: `stale (~${ageDays.toFixed(0)}d) — confirm still needed` };
  }
  if (kind === "funda") return { action: "REVIEW", reason: "funda draft awaiting ID decide/publish" };
  return { action: "REVIEW", reason: "core assistance draft awaiting ID publish" };
}

const issues = (await listIssues({ count: 200 })) || [];
const pending = issues
  .filter((i) => i.projectId === MODULE_LIBRARY_PROJECT_ID && isPendingTitle(i.title))
  .map((i) => {
    const fields = parseKV(i.description);
    const triage = suggestAction(i, fields);
    return {
      id: i.id,
      title: i.title,
      kind: fields.Kind || "core",
      moduleTag: fields.ModuleTag || fields.moduleTag || "",
      filePath: fields.FilePath || fields.DraftPath || "",
      ...triage,
    };
  });

const summary = pending.reduce((acc, row) => {
  acc[row.action] = (acc[row.action] || 0) + 1;
  return acc;
}, {});

if (asJson) {
  console.log(JSON.stringify({ count: pending.length, summary, pending }, null, 2));
} else {
  console.log(`Pending assistance drafts: ${pending.length}`);
  console.log("Suggested actions:", summary);
  console.log("");
  for (const row of pending) {
    console.log(`#${row.id}  [${row.action}]  ${row.title}`);
    console.log(`         ${row.reason}${row.moduleTag ? ` · tag=${row.moduleTag}` : ""}`);
  }
  console.log("");
  console.log("Next: open ID Studio → Pending, act on REGENERATE / REVIEW / CLOSE_OR_REGENERATE.");
}
