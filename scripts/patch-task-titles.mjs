/**
 * Patch already-seeded live Coding tasks' title + AcceptanceCriteria in place, matched by their
 * AssistModule: tag — without touching anything else on the issue (id, state, comments, existing
 * Matched:/Application: records that reference it by id). Content source is codingTasks.data.mjs,
 * the same data seed-smb-pipeline.mjs seeds fresh from.
 *
 * Why this exists instead of a wipe + reseed: real applicants may already be matched to these
 * exact tasks (by OneDev issue id) — wiping and recreating would silently orphan those matches
 * (found live once already this session, from an unrelated stray-record bug). Idempotent: safe to
 * re-run, it only ever writes the same target title/AC that's already in codingTasks.data.mjs.
 *
 * Dry-run by default — prints every change it *would* make. Pass --apply to actually write.
 *
 *   node scripts/patch-task-titles.mjs            # preview
 *   node scripts/patch-task-titles.mjs --apply     # write
 */
import "dotenv/config";
import { listIssues, updateIssueTitle, updateIssueDescription } from "../server/onedev-client.js";
import { CODING_ASSISTS } from "./codingTasks.data.mjs";

const APPLY = process.argv.includes("--apply");

// tag -> { title, ac } — flatten codingTasks.data.mjs's per-product arrays into one lookup.
const byTag = {};
for (const tasks of Object.values(CODING_ASSISTS)) {
  for (const t of tasks) byTag[t.assist] = { title: t.title, ac: t.ac };
}

function replaceAcceptanceCriteria(description, newAc) {
  const lines = String(description || "").split("\n");
  let found = false;
  const next = lines.map((line) => {
    if (/^AcceptanceCriteria:\s*/.test(line)) {
      found = true;
      return `AcceptanceCriteria: ${newAc}`;
    }
    return line;
  });
  if (!found) next.push(`AcceptanceCriteria: ${newAc}`);
  return next.join("\n");
}

const issues = await listIssues({ offset: 0, count: 200 });

let matched = 0;
let changed = 0;
for (const issue of issues) {
  const tagMatch = /^AssistModule:\s*(.+)$/m.exec(issue.description || "");
  const tag = tagMatch?.[1]?.trim();
  if (!tag || !byTag[tag]) continue;
  matched += 1;

  const target = byTag[tag];
  const acMatch = /^AcceptanceCriteria:\s*(.+)$/m.exec(issue.description || "");
  const currentAc = acMatch?.[1]?.trim() || "";
  const titleChanged = issue.title !== target.title;
  const acChanged = currentAc !== target.ac;
  if (!titleChanged && !acChanged) continue;

  changed += 1;
  console.log(`\n#${issue.id} [${tag}]`);
  if (titleChanged) console.log(`  title: "${issue.title}"\n      -> "${target.title}"`);
  if (acChanged) console.log(`  ac:    "${currentAc}"\n      -> "${target.ac}"`);

  if (APPLY) {
    if (titleChanged) await updateIssueTitle(issue.id, target.title);
    if (acChanged) await updateIssueDescription(issue.id, replaceAcceptanceCriteria(issue.description, target.ac));
  }
}

console.log(
  `\n${matched} wired Coding task(s) found, ${changed} need${changed === 1 ? "s" : ""} a title/AC update.` +
    (APPLY ? " Applied." : " Dry run — pass --apply to write these changes."),
);
