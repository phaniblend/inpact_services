/**
 * Close stale ID pending drafts that have NO draft file path (cannot publish as-is).
 * Marks them resolved in Module Library so the pending queue is actionable again.
 *
 * Default is dry-run. Pass --apply to write.
 */
import "dotenv/config";
import { listIssues, parseKV, updateIssueTitle, updateIssueDescription } from "../server/onedev-client.js";

const MODULE_LIBRARY_PROJECT_ID = Number(process.env.MODULE_LIBRARY_PROJECT_ID || 4);
const apply = process.argv.includes("--apply");

function isPendingTitle(title) {
  const t = String(title || "");
  return (
    (t.startsWith("Assistance lesson needed:") || t.startsWith("Tutorial needed:")) &&
    !/\(resolved\)\s*$/i.test(t)
  );
}

const issues = (await listIssues({ count: 200 })) || [];
const targets = issues.filter((i) => {
  if (i.projectId !== MODULE_LIBRARY_PROJECT_ID || !isPendingTitle(i.title)) return false;
  const fields = parseKV(i.description);
  const hasDraft = Boolean(fields.FilePath || fields.DraftPath || fields.filePath);
  return !hasDraft;
});

console.log(`${apply ? "APPLY" : "DRY-RUN"} — ${targets.length} pending with no draft file`);

for (const issue of targets) {
  const fields = parseKV(issue.description);
  const resolvedTitle = issue.title.includes("Assistance lesson needed:")
    ? `${issue.title.replace(/\s*$/, "")} (resolved)`
    : issue.title.replace(/^Tutorial needed:/, "Assistance lesson needed:") + " (resolved)";
  // Keep Tutorial→Assistance rename consistent when resolving legacy titles.
  const nextTitle = /Tutorial needed:/i.test(issue.title)
    ? `Assistance lesson needed: ${issue.title.replace(/^Tutorial needed:\s*/i, "")} (resolved)`
    : resolvedTitle.includes("(resolved)")
      ? resolvedTitle
      : `${issue.title} (resolved)`;

  const nextDescription = [
    ...Object.entries(fields).map(([k, v]) => `${k}: ${v}`),
    `TriageAction: close-no-draft`,
    `TriageAt: ${new Date().toISOString()}`,
    `TriageNote: Closed — no draft FilePath; regenerate from SpecForge/ID if still needed.`,
  ].join("\n");

  console.log(`#${issue.id} → ${nextTitle}`);
  if (apply) {
    await updateIssueTitle(issue.id, nextTitle);
    await updateIssueDescription(issue.id, nextDescription);
  }
}

if (!apply) {
  console.log("\nRe-run with --apply to write resolutions.");
} else {
  console.log(`\nResolved ${targets.length} issues.`);
}
