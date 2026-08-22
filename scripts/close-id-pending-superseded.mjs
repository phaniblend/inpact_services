/**
 * Resolve remaining ID pending drafts as superseded by companion FE/BE mastery curriculum.
 * Dry-run by default; pass --apply to write.
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

const issues = ((await listIssues({ count: 200 })) || []).filter(
  (i) => i.projectId === MODULE_LIBRARY_PROJECT_ID && isPendingTitle(i.title),
);

console.log(`${apply ? "APPLY" : "DRY-RUN"} — resolving ${issues.length} pending drafts as superseded`);

for (const issue of issues) {
  const fields = parseKV(issue.description);
  const tag = (issue.title || "").replace(/^(Assistance|Tutorial) lesson needed:\s*/i, "").trim();
  const nextTitle = `Assistance lesson needed: ${tag} (resolved)`;
  const nextDescription = [
    ...Object.entries(fields).map(([k, v]) => `${k}: ${v}`),
    "TriageAction: superseded-by-companion-curriculum",
    `TriageAt: ${new Date().toISOString()}`,
    "TriageNote: Closed during ASAP go-live — covered by webapp-blocks / backend-blocks / fundas in companion lessons. Re-open via SpecForge if a product-specific draft is still required.",
  ].join("\n");
  console.log(`#${issue.id} → ${nextTitle}`);
  if (apply) {
    await updateIssueTitle(issue.id, nextTitle);
    await updateIssueDescription(issue.id, nextDescription);
  }
}

if (!apply) console.log("\nRe-run with --apply to write.");
else console.log(`\nResolved ${issues.length}.`);
