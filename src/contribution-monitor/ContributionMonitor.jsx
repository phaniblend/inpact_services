import { useEffect, useState, useCallback } from "react";
import { notifyTeam } from "../team-messaging/notify.js";
import "./ContributionMonitor.css";

const COHORT_PROJECT_ID = 2;
const TEAM_OPS_PROJECT_ID = 3;
const ABSENCE_THRESHOLD = 2; // flags at 2+ absences out of logged huddles
const WARNINGS_BEFORE_VOTE = 2; // per the design doc: "a few fair warnings" before a vote is eligible

async function api(path, opts) {
  const res = await fetch(`/api/onedev${path}`, {
    headers: { "Content-Type": "application/json", ...(opts?.headers || {}) },
    ...opts,
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

function parseAttendance(description) {
  const present = (/Present:\s*(.+)/.exec(description || "")?.[1] ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const absent = (/Absent:\s*(.+)/.exec(description || "")?.[1] ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return { present, absent };
}

export default function ContributionMonitor() {
  const [roster, setRoster] = useState([]); // [{name, taskTitle, project, absences, warnings, hasVote}]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [projects, cohortIssues, teamOpsIssues] = await Promise.all([
        api("/projects?offset=0&count=100"),
        api("/issues?offset=0&count=200"),
        api("/issues?offset=0&count=200"),
      ]);
      const projectName = (id) => projects.find((p) => p.id === id)?.name ?? `project ${id}`;

      const matches = cohortIssues.filter((i) => i.projectId === COHORT_PROJECT_ID && i.title.startsWith("Matched:"));
      const teamOps = teamOpsIssues.filter((i) => i.projectId === TEAM_OPS_PROJECT_ID);
      const huddles = teamOps.filter((i) => i.title.startsWith("Huddle:"));
      const warnings = teamOps.filter((i) => i.title.startsWith("Warning:"));
      const votes = teamOps.filter((i) => i.title.startsWith("Vote:"));

      const people = matches.map((m) => {
        const nameMatch = /Matched: (.+?) →/.exec(m.title);
        const taskMatch = /Task: #\d+ "(.+?)" in (.+)/.exec(m.description || "");
        const name = nameMatch?.[1] ?? "unknown";
        const absences = huddles.filter((h) => parseAttendance(h.description).absent.includes(name)).length;
        const loggedHuddles = huddles.filter(
          (h) =>
            parseAttendance(h.description).absent.includes(name) ||
            parseAttendance(h.description).present.includes(name)
        ).length;
        const warningCount = warnings.filter((w) => w.title === `Warning: ${name}`).length;
        const hasVote = votes.some((v) => v.title === `Vote: ${name}`);
        return {
          name,
          taskTitle: taskMatch?.[1] ?? "",
          project: taskMatch?.[2] ?? "",
          absences,
          loggedHuddles,
          warnings: warningCount,
          hasVote,
        };
      });

      setRoster(people);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function issueWarning(person) {
    setBusy(person.name + "-warn");
    setError("");
    try {
      await api("/issues", {
        method: "POST",
        body: JSON.stringify({
          projectId: TEAM_OPS_PROJECT_ID,
          title: `Warning: ${person.name}`,
          description: `Reason: ${person.absences} logged huddle absence(s) on ${person.project}.\nWarning ${person.warnings + 1} of ${WARNINGS_BEFORE_VOTE} before a vote becomes eligible.`,
        }),
      });
      await notifyTeam(
        `⚠️ **${person.name}** received a fair warning on **${person.project}** (${person.absences} logged absences). Warning ${person.warnings + 1}/${WARNINGS_BEFORE_VOTE}.`
      );
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  }

  async function callVote(person) {
    setBusy(person.name + "-vote");
    setError("");
    try {
      await api("/issues", {
        method: "POST",
        body: JSON.stringify({
          projectId: TEAM_OPS_PROJECT_ID,
          title: `Vote: ${person.name}`,
          description: `Team vote to remove ${person.name} from ${person.project}, called after ${person.warnings} fair warnings.\nEscalated to Core Studio for a fairness review — appeal window applies before this is final.`,
        }),
      });
      await notifyTeam(
        `🗳️ Team vote called on **${person.name}** (**${person.project}**) after ${person.warnings} fair warnings. Escalated to Core Studio for a fairness review before it's final.`
      );
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  }

  const flagged = roster.filter((p) => p.absences >= ABSENCE_THRESHOLD);
  const clear = roster.filter((p) => p.absences < ABSENCE_THRESHOLD);

  return (
    <div className="cmn">
      <header className="cmn-header">
        <div className="cmn-kicker">Contribution Monitor</div>
        <h1>Fair warnings, then a vote — never straight to removal</h1>
        <p className="cmn-sub">
          Baseline signal for v1 is huddle attendance (Huddle Calendar). {WARNINGS_BEFORE_VOTE} warnings are required
          before a vote is even eligible — matches the due-process agreed in the role-flow ledger.
        </p>
      </header>

      {error && <div className="cmn-error">{error}</div>}
      {loading && <div className="cmn-loading">Loading…</div>}

      {!loading && (
        <>
          <section className="cmn-section">
            <h2>Flagged ({flagged.length})</h2>
            {flagged.length === 0 && <p className="cmn-empty">Nobody below baseline right now.</p>}
            {flagged.map((p) => (
              <div className="cmn-card cmn-card-flagged" key={p.name}>
                <div className="cmn-card-info">
                  <div className="cmn-card-name">{p.name}</div>
                  <div className="cmn-card-meta">
                    {p.project} — {p.taskTitle}
                  </div>
                  <div className="cmn-card-stat">
                    {p.absences} absence{p.absences === 1 ? "" : "s"} of {p.loggedHuddles} logged huddles ·{" "}
                    {p.warnings} warning{p.warnings === 1 ? "" : "s"} issued
                  </div>
                </div>
                <div className="cmn-card-actions">
                  {!p.hasVote && (
                    <button type="button" disabled={busy === p.name + "-warn"} onClick={() => issueWarning(p)}>
                      {busy === p.name + "-warn" ? "…" : "Issue warning"}
                    </button>
                  )}
                  {p.warnings >= WARNINGS_BEFORE_VOTE && !p.hasVote && (
                    <button type="button" className="cmn-vote-btn" disabled={busy === p.name + "-vote"} onClick={() => callVote(p)}>
                      {busy === p.name + "-vote" ? "…" : "Call team vote"}
                    </button>
                  )}
                  {p.hasVote && <span className="cmn-vote-tag">Vote called — with Core Studio</span>}
                </div>
              </div>
            ))}
          </section>

          <section className="cmn-section">
            <h2>Clear ({clear.length})</h2>
            {clear.map((p) => (
              <div className="cmn-card" key={p.name}>
                <div className="cmn-card-info">
                  <div className="cmn-card-name">{p.name}</div>
                  <div className="cmn-card-meta">
                    {p.project} — {p.taskTitle}
                  </div>
                </div>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
