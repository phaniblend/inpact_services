/**
 * Authorization for the two raw pass-through surfaces — /api/onedev (server/index.js) and
 * /api/git (git-proxy-router.js) — added 2026-09-11. Both proxy to OneDev using the one shared
 * service-account credential and, until now, only checked "is there *some* valid session at all"
 * (requireSession) before forwarding — meaning any signed-in JS applicant could read or write
 * anything in the entire OneDev instance, or push to any project's git repo, as platform admin.
 * That gap was already documented in both files' own comments rather than hidden; this closes it.
 *
 * Design:
 *  - Core (`-core`) accounts stay unrestricted here, exactly as before.
 *  - JS accounts are scoped to the project(s) holding a task they're currently Matched to, resolved
 *    from their *verified session email* through the same Application -> Matched -> task chain as
 *    GET /my-tasks — and using the **full** issue corpus (listAllIssues), not a single page of 200
 *    (audit P01, 2026-11-01: after a full desk seed, Matched rows for BookingDepositDesk /
 *    InvoiceFollowUpTracker / LeadFollowUpInbox fell past offset 200 so git returned 403 while
 *    My tasks still listed them).
 */
import { listAllIssues, listProjects } from "./onedev-client.js";

const COHORT_PROJECT_ID = 2;

export function isCoreSession(session) {
  return session?.accountType === "core";
}

/** Project ids a JS session may act on through /api/onedev or /api/git. */
export async function authorizedProjectIdsForJsSession(session) {
  const authorized = new Set();
  if (!session?.email) return authorized;

  // Same corpus as GET /api/recruit/my-tasks — a single page of 200 misses Application:/Matched:
  // after a full desk seed (see recruit-router.js).
  const issues = await listAllIssues();
  const email = String(session.email).trim().toLowerCase();

  const myApplicationIds = new Set(
    issues
      .filter(
        (i) =>
          i.projectId === COHORT_PROJECT_ID &&
          i.title.startsWith("Application:") &&
          (i.description || "")
            .split("\n")
            .some((line) => line.trim().toLowerCase() === `email: ${email}`),
      )
      .map((i) => i.id),
  );

  const myMatches = issues.filter((i) => {
    if (i.projectId !== COHORT_PROJECT_ID || !i.title.startsWith("Matched:")) return false;
    const applicationId = Number(/ApplicationId:\s*(\d+)/.exec(i.description || "")?.[1]);
    return myApplicationIds.has(applicationId);
  });

  for (const m of myMatches) {
    const taskId = Number(/TaskId:\s*(\d+)/.exec(m.description || "")?.[1]);
    const task = issues.find((i) => i.id === taskId);
    if (task) authorized.add(task.projectId);
  }
  return authorized;
}

/** Resolves a git URL path segment (e.g. "OneInbox" from "/OneInbox.git/...") to OneDev's numeric
 * project id, matching on either `path` or `name`. Pages the full project list — a single page of
 * 200 misses the oldest desks, and git then 403s even when the aspirant is matched (audit P01). */
export async function resolveProjectIdByGitPath(projectPath) {
  const want = String(projectPath || "").trim().toLowerCase();
  if (!want) return null;
  const alias = /^project-(\d+)$/.exec(want);
  if (alias) return Number(alias[1]);
  let offset = 0;
  const count = 100;
  for (;;) {
    const projects = (await listProjects({ offset, count })) || [];
    const hit = projects.find(
      (p) => String(p?.path || "").toLowerCase() === want || String(p?.name || "").toLowerCase() === want,
    );
    if (hit) return hit.id ?? null;
    if (projects.length < count) return null;
    offset += count;
    if (offset > 2000) return null;
  }
}
