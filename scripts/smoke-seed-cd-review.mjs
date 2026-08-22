/**
 * Seed a CD Review queue item for Desk Notes dry-run without needing git clone/PR.
 * Creates a synthetic open-looking review record + optional Mattermost notify path via team-ops issue.
 * Also posts a "CD Notified" marker compatible with CDReview.jsx.
 */
import "dotenv/config";
import { createIssue, listIssues, listProjects } from "../server/onedev-client.js";
import { notifyTeamServer } from "../server/notify-server.js";

const TEAM_OPS = 3;
const DESK = "Desk Notes Sprint";

const projects = await listProjects({ count: 100 });
const desk = projects.find((p) => p.name === DESK);
if (!desk) throw new Error("Desk Notes Sprint project missing — run smoke-seed-desk-notes first");

const fakePrId = 900001;
const fakePrNumber = 1;
const title = `CD Review: Desk Notes dry-run Assist Me submission`;

const existing = ((await listIssues({ count: 200 })) || []).find(
  (i) => i.projectId === TEAM_OPS && i.title === title,
);
if (existing) {
  console.log("already exists", existing.id);
  process.exit(0);
}

const reviewId = await createIssue({
  projectId: TEAM_OPS,
  title,
  description: [
    `PullRequestId: ${fakePrId}`,
    `PullRequestNumber: ${fakePrNumber}`,
    `ProjectId: ${desk.id}`,
    `ProjectName: ${DESK}`,
    `TaskId: 131`,
    `MatchId: 134`,
    `Submitter: bsit.setty@gmail.com`,
    `Outcome: pending`,
    `Source: asap-dry-run-seed`,
    `Note: Synthetic CD queue item — OneDev git HTTP clone needed auth; real PR can replace this. Open CD Review and record Approved / Changes requested.`,
    `CreatedAt: ${new Date().toISOString()}`,
  ].join("\n"),
});

const notifiedId = await createIssue({
  projectId: TEAM_OPS,
  title: `CD Notified: ${fakePrId}`,
  description: `PR #${fakePrNumber} "${title}" in ${DESK}, from dry-run Assist Me path (Match #134 / Task #131).`,
});

console.log({ reviewId, notifiedId, deskProjectId: desk.id, fakePrId });

try {
  await notifyTeamServer(
    `🧪 CD dry-run: seeded review for **${DESK}** task #131 (Assist Me match #134). Open CD Review to record an outcome.`,
  );
} catch (err) {
  console.warn("notify skipped:", err.message);
}
