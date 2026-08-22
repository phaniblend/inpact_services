import { useEffect, useState, useCallback } from "react";
import "./HuddleCalendar.css";

const COHORT_PROJECT_ID = 2;
const TEAM_OPS_PROJECT_ID = 3;

async function api(path, opts) {
  const res = await fetch(`/api/onedev${path}`, {
    headers: { "Content-Type": "application/json", ...(opts?.headers || {}) },
    ...opts,
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function HuddleCalendar() {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState(null);
  const [roster, setRoster] = useState([]); // [{name, taskTitle}]
  const [attended, setAttended] = useState({}); // name -> bool
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [allProjects, cohortIssues, teamOpsIssues] = await Promise.all([
        api("/projects?offset=0&count=100"),
        api("/issues?offset=0&count=200"),
        api("/issues?offset=0&count=200"),
      ]);
      const delivery = allProjects.filter((p) => p.id !== COHORT_PROJECT_ID && p.id !== TEAM_OPS_PROJECT_ID);
      setProjects(delivery);

      const pid = projectId ?? delivery[0]?.id ?? null;
      setProjectId(pid);

      if (pid) {
        const projName = delivery.find((p) => p.id === pid)?.name;
        const matches = cohortIssues.filter((i) => i.projectId === COHORT_PROJECT_ID && i.title.startsWith("Matched:"));
        const rosterForProject = matches
          .filter((m) => (m.description || "").includes(`in ${projName}`))
          .map((m) => {
            const nameMatch = /Matched: (.+?) →/.exec(m.title);
            const taskMatch = /Task: #\d+ "(.+?)"/.exec(m.description || "");
            return { name: nameMatch?.[1] ?? "unknown", taskTitle: taskMatch?.[1] ?? "" };
          });
        setRoster(rosterForProject);
        setAttended(Object.fromEntries(rosterForProject.map((r) => [r.name, true])));

        const huddleLogs = (teamOpsIssues || [])
          .filter((i) => i.projectId === TEAM_OPS_PROJECT_ID && i.title.startsWith(`Huddle: ${projName}`))
          .sort((a, b) => new Date(b.submitDate) - new Date(a.submitDate));
        setLogs(huddleLogs);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLog() {
    setSaving(true);
    setError("");
    try {
      const projName = projects.find((p) => p.id === projectId)?.name;
      const present = roster.filter((r) => attended[r.name]).map((r) => r.name);
      const absent = roster.filter((r) => !attended[r.name]).map((r) => r.name);
      await api("/issues", {
        method: "POST",
        body: JSON.stringify({
          projectId: TEAM_OPS_PROJECT_ID,
          title: `Huddle: ${projName} — ${todayISO()}`,
          description: [
            `Present: ${present.join(", ") || "none"}`,
            `Absent: ${absent.join(", ") || "none"}`,
          ].join("\n"),
        }),
      });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const alreadyLoggedToday = logs.some((l) => l.title.endsWith(todayISO()));

  return (
    <div className="hc">
      <header className="hc-header">
        <div className="hc-kicker">Huddle Calendar</div>
        <h1>Daily standup, logged</h1>
        <p className="hc-sub">
          Attendance here feeds Contribution Monitor and the collaboration signal in Human Capital Reports.
        </p>
      </header>

      {projects.length > 0 && (
        <div className="hc-project-select">
          <label>
            Project
            <select value={projectId ?? ""} onChange={(e) => setProjectId(Number(e.target.value))}>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {error && <div className="hc-error">{error}</div>}
      {loading && <div className="hc-loading">Loading…</div>}

      {!loading && projectId && (
        <>
          <section className="hc-panel">
            <h2>Today — {todayISO()}</h2>
            {roster.length === 0 && <p className="hc-empty">No one placed on this project yet.</p>}
            {roster.map((r) => (
              <label className="hc-roster-row" key={r.name}>
                <input
                  type="checkbox"
                  checked={!!attended[r.name]}
                  onChange={(e) => setAttended((a) => ({ ...a, [r.name]: e.target.checked }))}
                />
                <span className="hc-roster-name">{r.name}</span>
                <span className="hc-roster-task">{r.taskTitle}</span>
              </label>
            ))}
            {roster.length > 0 && (
              <button type="button" onClick={handleLog} disabled={saving}>
                {saving ? "Logging…" : alreadyLoggedToday ? "Log again for today" : "Log today's huddle"}
              </button>
            )}
          </section>

          <section className="hc-panel">
            <h2>Recent huddles</h2>
            {logs.length === 0 && <p className="hc-empty">Nothing logged yet.</p>}
            {logs.slice(0, 10).map((l) => (
              <div className="hc-log-row" key={l.id}>
                <div className="hc-log-date">{l.title.split("— ")[1]}</div>
                <div className="hc-log-desc">{l.description}</div>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
