import { useEffect, useState, useCallback } from "react";
import "./Cohorts.css";

const COHORT_APPLICATIONS_PROJECT_ID = 2;
const TEAM_OPS_PROJECT_ID = 3;

async function api(path) {
  const res = await fetch(`/api/onedev${path}`);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

function isBlocked(issue) {
  return /^NeedsTutorial:\s*true/m.test(issue.description || "");
}

/** Same "Key: value" line convention every IPF module parses OneDev descriptions with. */
function parseKV(description) {
  return Object.fromEntries(
    (description || "")
      .split("\n")
      .map((l) => l.split(": "))
      .filter((parts) => parts.length >= 2)
      .map(([k, ...rest]) => [k.trim(), rest.join(": ").trim()])
  );
}

/** A cohort's own record only stores "DeliveryProject: <name> (#<id>)" as text — this pulls both
 * back out. Roster is then joined the same way HuddleCalendar already does: by matching "in <name>"
 * inside a Matched: issue's description, since Matched: issues were never given a numeric project id
 * field (see src/cohort-matching/MatchingQueue.jsx). Kept consistent with that existing convention
 * rather than introducing a second way to make the same join. */
function parseDeliveryProject(cohortDescription) {
  const m = /DeliveryProject:\s*(.+?)\s*\(#(\d+)\)/.exec(cohortDescription || "");
  return m ? { name: m[1], id: Number(m[2]) } : { name: null, id: null };
}

export default function Cohorts() {
  const [cohorts, setCohorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [cohortOpsIssues, cohortAppIssues, allIssues] = await Promise.all([
        api(`/issues?offset=0&count=200`),
        api(`/issues?offset=0&count=200`),
        api(`/issues?offset=0&count=200`),
      ]);

      const cohortIssues = cohortOpsIssues.filter(
        (i) => i.projectId === TEAM_OPS_PROJECT_ID && i.title.startsWith("Cohort:")
      );
      const matches = cohortAppIssues.filter(
        (i) => i.projectId === COHORT_APPLICATIONS_PROJECT_ID && i.title.startsWith("Matched:")
      );

      const rows = cohortIssues
        .map((c) => {
          const fields = parseKV(c.description);
          const { name: projectName, id: projectId } = parseDeliveryProject(c.description);
          const projectIssues = projectId ? allIssues.filter((i) => i.projectId === projectId) : [];
          const roster = projectName
            ? matches
                .filter((m) => (m.description || "").includes(`in ${projectName}`))
                .map((m) => {
                  const nameMatch = /Matched: (.+?) →/.exec(m.title);
                  const info = parseKV(m.description);
                  return { name: nameMatch?.[1] ?? "unknown", trade: info.StatedTrade || "" };
                })
            : [];

          return {
            issueId: c.id,
            name: c.title.replace("Cohort:", "").trim(),
            product: fields.Product || "",
            projectName,
            projectId,
            createdAt: fields.CreatedAt || c.submitDate,
            plannedTaskCount: Number(fields.TaskCount || 0),
            openCount: projectIssues.filter((i) => i.state === "Open").length,
            closedCount: projectIssues.filter((i) => i.state !== "Open").length,
            blockedCount: projectIssues.filter((i) => i.state === "Open" && isBlocked(i)).length,
            roster,
          };
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setCohorts(rows);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="coh">
      <header className="coh-header">
        <div className="coh-kicker">Cohorts</div>
        <h1>Every sprint team, one roster</h1>
        <p className="coh-sub">
          A cohort is created once, by PD Studio publishing a spec — the roster below is whoever Matching
          Queue has placed onto that cohort's delivery project since.
        </p>
      </header>

      {error && <div className="coh-error">{error}</div>}
      {loading && <div className="coh-loading">Loading…</div>}

      {!loading && cohorts.length === 0 && (
        <p className="coh-empty">No cohorts yet — publish a spec from PD Studio to create the first one.</p>
      )}

      <div className="coh-grid">
        {cohorts.map((c) => (
          <section className="coh-card" key={c.issueId}>
            <div className="coh-card-head">
              <h2>{c.name}</h2>
              {c.blockedCount > 0 && <span className="coh-blocked-tag">{c.blockedCount} blocked</span>}
            </div>
            <p className="coh-product">{c.product}</p>
            <div className="coh-meta">
              <a href="#/workbench">{c.projectName || "unknown project"}</a> · created{" "}
              {c.createdAt ? new Date(c.createdAt).toISOString().slice(0, 10) : "—"}
            </div>

            <div className="coh-stats">
              <div className="coh-stat">
                <div className="coh-stat-value">{c.openCount}</div>
                <div className="coh-stat-label">Open</div>
              </div>
              <div className="coh-stat">
                <div className="coh-stat-value">{c.closedCount}</div>
                <div className="coh-stat-label">Closed</div>
              </div>
              <div className="coh-stat">
                <div className={`coh-stat-value ${c.blockedCount > 0 ? "coh-stat-attention" : ""}`}>{c.blockedCount}</div>
                <div className="coh-stat-label">Blocked</div>
              </div>
              <div className="coh-stat">
                <div className="coh-stat-value">{c.roster.length}</div>
                <div className="coh-stat-label">Placed</div>
              </div>
            </div>

            <div className="coh-roster">
              <h3>Roster</h3>
              {c.roster.length === 0 && <p className="coh-empty-small">Nobody placed on this cohort yet — see Matching Queue.</p>}
              {c.roster.map((r, i) => (
                <div className="coh-roster-row" key={i}>
                  <span className="coh-roster-name">{r.name}</span>
                  <span className="coh-roster-trade">{r.trade}</span>
                </div>
              ))}
            </div>

            <div className="coh-links">
              <a href="#/workbench">Workbench →</a>
              <a href="#/huddle-calendar">Huddle Calendar →</a>
              <a href="#/matching-queue">Matching Queue →</a>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
