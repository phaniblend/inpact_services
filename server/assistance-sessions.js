/**
 * Server-owned assistance sessions — the security layer the thin-slice core-lesson routing
 * (docs/IPF_DEVGUIDE.md §5a-4) deliberately skipped. A session ties one task to one matched
 * lesson to one learner, with a one-time completion token, so the return-to-task flow can't be
 * spoofed by a client-supplied task id or a guessed URL. Sessions are OneDev issues in team-ops
 * (project 3) — same system-of-record everything else in this app uses, same auditability, no
 * separate database to stand up.
 */
import crypto from "crypto";
import { createIssue, listIssues, updateIssueDescription, parseKV } from "./onedev-client.js";

const TEAM_OPS_PROJECT_ID = 3;
// 2 hours — long enough to actually work through a real lesson (10-30 min typical, generous
// buffer for interruption), short enough that a leaked/old link stops being usable on its own.
const TOKEN_TTL_MS = 2 * 60 * 60 * 1000;

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/** Creates a new assistance session for one task->lesson pairing. Returns { sessionId,
 * completionToken } — the raw token is handed back exactly once, here, and never stored; only its
 * SHA-256 hash is persisted, so a leaked OneDev issue description alone can't be used to forge a
 * completion. */
export async function createAssistanceSession({ taskId, taskTitle, lessonKey, lessonUrl }) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString();
  const created = await createIssue({
    projectId: TEAM_OPS_PROJECT_ID,
    title: `AssistSession: ${lessonKey} for task #${taskId}`,
    description: [
      `TaskId: ${taskId}`,
      `TaskTitle: ${taskTitle}`,
      `LessonKey: ${lessonKey}`,
      `LessonUrl: ${lessonUrl}`,
      `Status: created`,
      `TokenHash: ${tokenHash}`,
      `TokenExpiresAt: ${expiresAt}`,
      `CreatedAt: ${new Date().toISOString()}`,
      `LaunchedAt: `,
      `CompletedAt: `,
    ].join("\n"),
  });
  const sessionId = created;
  if (!sessionId) throw new Error("Session service did not return a session id after creation");
  return { sessionId, completionToken: token };
}

async function findSession(sessionId) {
  // count:250 matches the ceiling every other listIssues() call in this codebase uses — team-ops
  // holds cohorts/aspirations/CD-review/huddles too, not just sessions, so this is a real scan,
  // not a targeted lookup; OneDev's query syntax could narrow this later if volume ever justifies it.
  const issues = await listIssues({ count: 250 });
  return issues.find(
    (i) => i.id === Number(sessionId) && i.projectId === TEAM_OPS_PROJECT_ID && i.title.startsWith("AssistSession:")
  );
}

/** Best-effort, non-blocking: marks a session launched the moment the learner's browser actually
 * lands on the lesson. Purely informational — a session stuck on "created" is a visible signal
 * something didn't open, not a state anything else depends on. Never regresses launched/completed
 * back to an earlier status. */
export async function markSessionLaunched(sessionId) {
  const issue = await findSession(sessionId);
  if (!issue) return;
  const fields = parseKV(issue.description);
  if (fields.Status !== "created") return;
  const newDescription = issue.description
    .split("\n")
    .map((line) => (/^Status:/.test(line) ? "Status: launched" : /^LaunchedAt:/.test(line) ? `LaunchedAt: ${new Date().toISOString()}` : line))
    .join("\n");
  await updateIssueDescription(issue.id, newDescription);
}

/** Validates a completion token against its session and marks the session completed —
 * idempotently: a second call with the same (now-consumed) token returns the same taskId rather
 * than erroring, since a learner's browser retrying the completion redirect is a real, expected
 * case, not an attack. A *wrong* token, an *expired* token, or a session that doesn't exist all
 * throw — completion is never granted on anything but an exact, live match. Returns { taskId,
 * alreadyCompleted } so the caller can redirect either way without needing to know which case fired. */
export async function completeAssistanceSession(sessionId, token) {
  const issue = await findSession(sessionId);
  if (!issue) throw new Error("Assistance session not found");
  const fields = parseKV(issue.description);
  const taskId = Number(fields.TaskId);

  if (fields.Status === "completed") return { taskId, alreadyCompleted: true };
  if (!token || hashToken(token) !== fields.TokenHash) throw new Error("Invalid completion token");
  if (!fields.TokenExpiresAt || new Date(fields.TokenExpiresAt).getTime() < Date.now()) {
    throw new Error("Completion token expired");
  }

  const newDescription = issue.description
    .split("\n")
    .map((line) => (/^Status:/.test(line) ? "Status: completed" : /^CompletedAt:/.test(line) ? `CompletedAt: ${new Date().toISOString()}` : line))
    .join("\n");
  await updateIssueDescription(issue.id, newDescription);
  return { taskId, alreadyCompleted: false };
}
