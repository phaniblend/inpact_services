import { useEffect, useState, useCallback } from "react";
import "../core-studio/CoreStudioConsole.css";

const COHORT_PROJECT_ID = 2;
const TEAM_OPS_PROJECT_ID = 3;
const MODULE_LIBRARY_PROJECT_ID = 4;
const RESERVED = new Set([COHORT_PROJECT_ID, TEAM_OPS_PROJECT_ID, MODULE_LIBRARY_PROJECT_ID, 1 /* product-backlog */]);

async function api(path) {
  const res = await fetch(`/api/onedev${path}`);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

function isBlocked(issue) {
  return /^NeedsTutorial:\s*true/im.test(issue.description || "");
}

function taskAssignable(issue) {
  const desc = issue.description || "";
  if (/^TutorialExempt:\s*true/im.test(desc)) return true;
  if (/^NeedsTutorial:\s*true/im.test(desc)) return false;
  return true;
}

function tradeOf(issue) {
  return (/^Trade:\s*(.+)$/im.exec(issue.description || "")?.[1] || "").trim();
}

export default function PmgtConsole() {
  const [projects, setProjects] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rematching, setRematching] = useState(false);
  const [rematchNote, setRematchNote] = useState("");

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

  async function runRematch() {
    setRematching(true);
    setRematchNote("");
    setError("");
    try {
      const res = await fetch("/api/recruit/rematch-queued", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Rematch failed (${res.status})`);
      const n = data.count ?? 0;
      setRematchNote(n === 0 ? "Rematch: nobody placeable." : `Rematch placed ${n}.`);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setRematching(false);
    }
  }

  const apps = issues.filter((i) => i.projectId === COHORT_PROJECT_ID && i.title.startsWith("Application:"));
  const matches = issues.filter((i) => i.projectId === COHORT_PROJECT_ID && i.title.startsWith("Matched:"));
  const matchedAppIds = new Set(
    matches.map((m) => Number(/ApplicationId:\s*(\d+)/.exec(m.description || "")?.[1])).filter(Boolean),
  );
  const pendingApps = apps.filter((a) => !matchedAppIds.has(a.id));

  const cohorts = issues.filter((i) => i.projectId === TEAM_OPS_PROJECT_ID && i.title.startsWith("Cohort:"));
  const orphanCohorts = cohorts.filter((c) => {
    const m = /DeliveryProject:.*\(#(\d+)\)/.exec(c.description || "");
    if (!m) return true;
    return !projects.some((p) => p.id === Number(m[1]));
  });

  const delivery = projects.filter((p) => !RESERVED.has(p.id));
  const openTasks = issues.filter((i) => !RESERVED.has(i.projectId) && i.state === "Open");
  const blocked = openTasks.filter(isBlocked);
  const assignable = openTasks.filter(taskAssignable);

  const byTrade = new Map();
  for (const t of assignable) {
    const trade = tradeOf(t) || "(unlabeled)";
    byTrade.set(trade, (byTrade.get(trade) || 0) + 1);
  }
  const lowTrades = [...byTrade.entries()].filter(([, n]) => n <= 3).sort((a, b) => a[1] - b[1]);

  const projectsMissingCohort = delivery.filter((p) => {
    const linked = cohorts.some((c) => {
      const m = /DeliveryProject:.*\(#(\d+)\)/.exec(c.description || "");
      return m && Number(m[1]) === p.id;
    });
    // Smoke / scaffold projects without tasks don't need a cohort row on the PMGT board.
    const hasOpen = openTasks.some((i) => i.projectId === p.id);
    return hasOpen && !linked;
  });

  return (
    <div className="csc">
      <header className="csc-header">
        <div className="csc-kicker">PMGT · Project management</div>
        <h1>Cohort hygiene &amp; open-task health</h1>
        <p className="csc-sub">
          Thin go-live console for PMGT-core: see who is waiting, which delivery projects lack a cohort link,
          which open work is still blocked on tutorials, and trigger the same rematch sweep SpecForge/ID already
          run after supply opens.
        </p>
        <div style={{ marginTop: 12 }}>
          <button type="button" disabled={rematching || loading} onClick={runRematch}>
            {rematching ? "Running rematch…" : "Rematch queued applicants"}
          </button>
          {rematchNote && (
            <span style={{ marginLeft: 12, color: "#475569", fontSize: 13 }}>{rematchNote}</span>
          )}
          <a href="#/matching-queue" style={{ marginLeft: 16, fontSize: 14 }}>
            Matching Queue →
          </a>
          <a href="#/core-studio" style={{ marginLeft: 12, fontSize: 14 }}>
            Core Studio →
          </a>
        </div>
      </header>

      {error && <div className="csc-error">{error}</div>}
      {loading && <div className="csc-loading">Loading…</div>}

      {!loading && (
        <>
          <section className="csc-tiles">
            <div className="csc-tile">
              <div className={`csc-tile-value ${pendingApps.length ? "csc-tile-attention" : ""}`}>
                {pendingApps.length}
              </div>
              <div className="csc-tile-label">Queued applicants</div>
            </div>
            <div className="csc-tile">
              <div className="csc-tile-value">{assignable.length}</div>
              <div className="csc-tile-label">Assignable open tasks</div>
            </div>
            <div className="csc-tile">
              <div className={`csc-tile-value ${blocked.length ? "csc-tile-attention" : ""}`}>{blocked.length}</div>
              <div className="csc-tile-label">Blocked on tutorial</div>
            </div>
            <div className="csc-tile">
              <div className={`csc-tile-value ${orphanCohorts.length || projectsMissingCohort.length ? "csc-tile-attention" : ""}`}>
                {orphanCohorts.length + projectsMissingCohort.length}
              </div>
              <div className="csc-tile-label">Cohort hygiene flags</div>
            </div>
          </section>

          <section className="csc-section">
            <h2>Trade supply (assignable)</h2>
            {lowTrades.length === 0 ? (
              <p className="csc-empty">No trade labels below the low-supply threshold (≤3).</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Trade</th>
                    <th>Assignable</th>
                  </tr>
                </thead>
                <tbody>
                  {lowTrades.map(([trade, n]) => (
                    <tr key={trade}>
                      <td>{trade}</td>
                      <td className={n === 0 ? "csc-blocked-cell" : ""}>{n}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section className="csc-section">
            <h2>Cohort hygiene</h2>
            {orphanCohorts.length === 0 && projectsMissingCohort.length === 0 && (
              <p className="csc-empty">No orphan cohorts and no open-task projects missing a Cohort: link.</p>
            )}
            {orphanCohorts.length > 0 && (
              <div className="csc-callout csc-callout-warn">
                {orphanCohorts.length} cohort issue{orphanCohorts.length === 1 ? "" : "s"} point at a missing
                delivery project: {orphanCohorts.map((c) => c.title.replace("Cohort:", "").trim()).join(", ")}.
              </div>
            )}
            {projectsMissingCohort.length > 0 && (
              <div className="csc-callout csc-callout-warn">
                Open work without a Cohort: link —{" "}
                {projectsMissingCohort.map((p) => p.name).join(", ")}. Publish or repair Cohort records in
                SpecForge / team-ops.
              </div>
            )}
          </section>

          <section className="csc-section">
            <h2>Blocked open tasks</h2>
            {blocked.length === 0 ? (
              <p className="csc-empty">Nothing waiting on ID tutorials.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Project</th>
                    <th>Trade</th>
                  </tr>
                </thead>
                <tbody>
                  {blocked.map((t) => (
                    <tr key={t.id}>
                      <td>
                        #{t.number} {t.title}
                      </td>
                      <td>{projects.find((p) => p.id === t.projectId)?.name || t.projectId}</td>
                      <td>{tradeOf(t) || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {blocked.length > 0 && (
              <div className="csc-callout">
                <a href="#/id-studio">Open ID Studio →</a> to clear NeedsTutorial blockers.
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
