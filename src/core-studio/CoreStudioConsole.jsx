import { useEffect, useState, useCallback } from "react";
import "./CoreStudioConsole.css";

const COHORT_PROJECT_ID = 2;
const TEAM_OPS_PROJECT_ID = 3;

async function api(path) {
  const res = await fetch(`/api/onedev${path}`);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

function isBlocked(issue) {
  return /^NeedsTutorial:\s*true/m.test(issue.description || "");
}

/** Cohort issues (server/specforge-router.js) carry "DeliveryProject: <name> (#<id>)" — pull the id
 * back out so each delivery project can show which cohort(s) are working it. */
function cohortsByProjectId(cohortIssues) {
  const map = new Map();
  for (const c of cohortIssues) {
    const m = /DeliveryProject:.*\(#(\d+)\)/.exec(c.description || "");
    if (!m) continue;
    const pid = Number(m[1]);
    const name = c.title.replace("Cohort:", "").trim();
    if (!map.has(pid)) map.set(pid, []);
    map.get(pid).push(name);
  }
  return map;
}

export default function CoreStudioConsole() {
  const [projects, setProjects] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [allProjects, allIssues] = await Promise.all([
        api("/projects?offset=0&count=100"),
        api("/issues?offset=0&count=200"),
      ]);
      setProjects(allProjects);
      setIssues(allIssues);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const appIssues = issues.filter((i) => i.projectId === COHORT_PROJECT_ID);
  const applications = appIssues.filter((i) => i.title.startsWith("Application:"));
  const matches = appIssues.filter((i) => i.title.startsWith("Matched:"));
  const pendingCount = applications.length - matches.length;

  const cohortIssues = issues.filter((i) => i.projectId === TEAM_OPS_PROJECT_ID && i.title.startsWith("Cohort:"));
  const cohortMap = cohortsByProjectId(cohortIssues);

  const deliveryProjects = projects.filter((p) => p.id !== COHORT_PROJECT_ID && p.id !== TEAM_OPS_PROJECT_ID);
  const rows = deliveryProjects.map((p) => {
    const projIssues = issues.filter((i) => i.projectId === p.id);
    return {
      project: p,
      open: projIssues.filter((i) => i.state === "Open").length,
      closed: projIssues.filter((i) => i.state !== "Open").length,
      total: projIssues.length,
      blocked: projIssues.filter((i) => i.state === "Open" && isBlocked(i)).length,
      cohorts: cohortMap.get(p.id) || [],
    };
  });
  const totalBlocked = rows.reduce((s, r) => s + r.blocked, 0);

  return (
    <div className="csc">
      <header className="csc-header">
        <div className="csc-kicker">Core Studio Console</div>
        <h1>Every product project, one view</h1>
        <p className="csc-sub">
          The only cross-cutting screen in IPF — everyone else sees their own project. Owner-level visibility,
          provisioned automatically, not requested per project.
        </p>
      </header>

      {error && <div className="csc-error">{error}</div>}
      {loading && <div className="csc-loading">Loading…</div>}

      {!loading && (
        <>
          <section className="csc-tiles">
            <div className="csc-tile">
              <div className="csc-tile-value">{deliveryProjects.length}</div>
              <div className="csc-tile-label">Delivery projects</div>
            </div>
            <div className="csc-tile">
              <div className="csc-tile-value">{rows.reduce((s, r) => s + r.open, 0)}</div>
              <div className="csc-tile-label">Open tasks, all projects</div>
            </div>
            <div className="csc-tile">
              <div className={`csc-tile-value ${pendingCount > 0 ? "csc-tile-attention" : ""}`}>{pendingCount}</div>
              <div className="csc-tile-label">Applications awaiting placement</div>
            </div>
            <div className="csc-tile">
              <div className="csc-tile-value">{matches.length}</div>
              <div className="csc-tile-label">JS placed to date</div>
            </div>
            <div className="csc-tile">
              <div className={`csc-tile-value ${totalBlocked > 0 ? "csc-tile-attention" : ""}`}>{totalBlocked}</div>
              <div className="csc-tile-label">Tasks blocked on a tutorial</div>
            </div>
          </section>

          <section className="csc-section">
            <h2>Delivery projects</h2>
            <table>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Cohort</th>
                  <th>Open</th>
                  <th>Blocked</th>
                  <th>Closed</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.project.id}>
                    <td>
                      <a href={`#/workbench`}>{r.project.name}</a>
                    </td>
                    <td className="csc-cohort-cell">
                      {r.cohorts.length > 0 ? <a href="#/cohorts">{r.cohorts.join(", ")}</a> : "—"}
                    </td>
                    <td>{r.open}</td>
                    <td className={r.blocked > 0 ? "csc-blocked-cell" : ""}>{r.blocked || "—"}</td>
                    <td>{r.closed}</td>
                    <td>{r.total}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="csc-empty">
                      No delivery projects yet — only the cohort-applications project exists.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>

          {pendingCount > 0 && (
            <div className="csc-callout">
              {pendingCount} application{pendingCount === 1 ? "" : "s"} waiting —{" "}
              <a href="#/matching-queue">go to the Matching Queue</a>.
            </div>
          )}

          {totalBlocked > 0 && (
            <div className="csc-callout csc-callout-warn">
              {totalBlocked} task{totalBlocked === 1 ? "" : "s"} blocked on a tutorial —{" "}
              <a href="#/id-studio">review pending requests in ID Studio</a>.
            </div>
          )}
        </>
      )}
    </div>
  );
}
