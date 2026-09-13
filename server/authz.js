/**
 * Authorization for the two raw pass-through surfaces — /api/onedev (server/index.js) and
 * /api/git (git-proxy-router.js) — added 2026-09-11. Both proxy to OneDev using the one shared
 * service-account credential and, until now, only checked "is there *some* valid session at all"
 * (requireSession) before forwarding — meaning any signed-in JS applicant could read or write
 * anything in the entire OneDev instance, or push to any project's git repo, as platform admin.
 * That gap was already documented in both files' own comments rather than hidden; this closes it.
 *
 * Design:
 *  - Core (`-core`) accounts stay unrestricted here, exactly as before. PD Studio, Cohorts,
 *    ModuleLibrary, ContributionMonitor, HuddleCalendar, CD Review, HumanCapitalReports, and
 *    MatchingQueue all legitimately need cross-project OneDev access for their actual job, and
 *    none of those screens are reachable by a JS session (every route that renders them is already
 *    behind requireRole). Restricting core accounts here would break real, in-use workflows for no
 *    security benefit — they're already the trusted operators this whole system defers to.
 *  - JS accounts are scoped to the project(s) holding a task they're currently Matched to, resolved
 *    from their *verified session email* (never a client-supplied id) through the same
 *    Application -> Matched -> task chain recruit-router.js's own GET /my-tasks already walks.
 *    The two aren't merged into one shared function today — /my-tasks needs the full task objects
 *    (title/description/state/project name) for its response, this only needs project ids — but
 *    both independently implement the same email -> Application -> Matched -> task chain, so a
 *    future change to that convention needs updating both places. Noted rather than silently risked.
 *  - A JS account with no live match yet is authorized for nothing (empty set), which is correct:
 *    there's no legitimate project for them to read or write through either proxy until placed.
 *
 * Known limitation, not solved here: this only gates *write* access on /api/onedev (no legitimate
 * JS-facing UI flow ever POSTs through it — confirmed by reading every caller — so a hard core-only
 * block on writes there is a complete fix with zero real breakage). It does NOT scope down *read*
 * access on /api/onedev to a JS's own project(s) — that proxy takes an arbitrary OneDev query
 * string, and safely rewriting/validating arbitrary OneDev query syntax per-caller is a materially
 * bigger job than this pass. A signed-in JS can still read issue data outside their own project
 * through /api/onedev today. Flagged, not fixed — see the technical-diligence audit this responds
 * to for the full writeup.
 */
import { listIssues, listProjects } from "./onedev-client.js";

const COHORT_PROJECT_ID = 2;

export function isCoreSession(session) {
  return session?.accountType === "core";
}

/** Project ids a JS session may act on through /api/onedev or /api/git. Returns a Set (possibly
 * empty) for a JS session; callers should check isCoreSession() separately before calling this,
 * since a core session has no meaningful "authorized project ids" — it's unrestricted. */
export async function authorizedProjectIdsForJsSession(session) {
  const authorized = new Set();
  if (!session?.email) return authorized;

  const issues = await listIssues({ offset: 0, count: 200 });

  const myApplicationIds = new Set(
    issues
      .filter(
        (i) =>
          i.projectId === COHORT_PROJECT_ID &&
          i.title.startsWith("Application:") &&
          (i.description || "").split("\n").some((line) => line.trim() === `Email: ${session.email}`),
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
 * project id, matching on either `path` (the URL-safe slug OneDev serves git over) or `name`
 * (falls back for simple names where the two are identical) since only `name` is confirmed used
 * elsewhere in this codebase (onedev-client.js's findProjectByName) and the git-serving `path`
 * field hasn't been separately confirmed live. */
export async function resolveProjectIdByGitPath(projectPath) {
  const projects = await listProjects({ offset: 0, count: 200 });
  const want = String(projectPath || "").trim().toLowerCase();
  if (!want) return null;
  const hit = projects.find(
    (p) => String(p?.path || "").toLowerCase() === want || String(p?.name || "").toLowerCase() === want,
  );
  return hit?.id ?? null;
}
