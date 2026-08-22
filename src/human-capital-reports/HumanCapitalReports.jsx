import { useEffect, useState, useCallback } from "react";
import "./HumanCapitalReports.css";

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

function parseAttendance(description) {
  const present = (/Present:\s*(.+)/.exec(description || "")?.[1] ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const absent = (/Absent:\s*(.+)/.exec(description || "")?.[1] ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return { present, absent };
}

export default function HumanCapitalReports() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState({});
  const [saving, setSaving] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [cohortIssues, teamOpsIssues] = await Promise.all([
        api("/issues?offset=0&count=200"),
        api("/issues?offset=0&count=200"),
      ]);
      const matches = cohortIssues.filter((i) => i.projectId === COHORT_PROJECT_ID && i.title.startsWith("Matched:"));
      const teamOps = teamOpsIssues.filter((i) => i.projectId === TEAM_OPS_PROJECT_ID);
      const huddles = teamOps.filter((i) => i.title.startsWith("Huddle:"));
      const warnings = teamOps.filter((i) => i.title.startsWith("Warning:"));
      const votes = teamOps.filter((i) => i.title.startsWith("Vote:"));
      const savedNotes = teamOps.filter((i) => i.title.startsWith("Core Studio Note:"));

      const rows = matches.map((m) => {
        const nameMatch = /Matched: (.+?) →/.exec(m.title);
        const taskMatch = /Task: #\d+ "(.+?)" in (.+)/.exec(m.description || "");
        const name = nameMatch?.[1] ?? "unknown";
        const relevant = huddles.filter(
          (h) => parseAttendance(h.description).present.includes(name) || parseAttendance(h.description).absent.includes(name)
        );
        const present = relevant.filter((h) => parseAttendance(h.description).present.includes(name)).length;
        const note = savedNotes.find((n) => n.title === `Core Studio Note: ${name}`);
        return {
          name,
          project: taskMatch?.[2] ?? "",
          taskTitle: taskMatch?.[1] ?? "",
          placedOn: m.submitDate,
          huddlesLogged: relevant.length,
          huddlesPresent: present,
          warningCount: warnings.filter((w) => w.title === `Warning: ${name}`).length,
          voteCalled: votes.some((v) => v.title === `Vote: ${name}`),
          savedNote: note?.description ?? "",
        };
      });
      setPeople(rows);
      setNotes(Object.fromEntries(rows.map((r) => [r.name, r.savedNote])));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveNote(name) {
    setSaving(name);
    setError("");
    try {
      await api("/issues", {
        method: "POST",
        body: JSON.stringify({
          projectId: TEAM_OPS_PROJECT_ID,
          title: `Core Studio Note: ${name}`,
          description: notes[name] || "",
        }),
      });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="hcr">
      <header className="hcr-header">
        <div className="hcr-kicker">Human Capital Reports</div>
        <h1>Evidence, not a resume claim</h1>
        <p className="hcr-sub">
          Every figure below traces back to something that happened on the platform. Skill mastery is intentionally
          marked pending — the IPAAL Bridge wiring for mastery evidence is not live yet. Nothing here ships
          externally without the JS&apos;s opt-in, per report — that gate isn&apos;t built yet either, so treat this
          as internal-only for now.
        </p>
      </header>

      {error && <div className="hcr-error">{error}</div>}
      {loading && <div className="hcr-loading">Loading…</div>}

      {!loading &&
        people.map((p) => (
          <section className="hcr-card" key={p.name}>
            <div className="hcr-card-head">
              <h2>{p.name}</h2>
              <span className="hcr-project-tag">{p.project}</span>
            </div>
            <p className="hcr-role">{p.taskTitle}</p>

            <div className="hcr-grid">
              <div className="hcr-block">
                <h3>Delivery record</h3>
                <dl>
                  <dt>Placed</dt>
                  <dd>{new Date(p.placedOn).toISOString().slice(0, 10)}</dd>
                </dl>
                <p className="hcr-source">Source: placement history</p>
              </div>

              <div className="hcr-block">
                <h3>Collaboration signal</h3>
                <dl>
                  <dt>Huddle attendance</dt>
                  <dd>
                    {p.huddlesPresent} / {p.huddlesLogged} logged
                  </dd>
                  <dt>Contribution flags</dt>
                  <dd>
                    {p.warningCount} warning{p.warningCount === 1 ? "" : "s"}
                    {p.voteCalled ? " · vote called (with Core Studio)" : ""}
                  </dd>
                </dl>
                <p className="hcr-source">Source: Huddle Calendar + Contribution Monitor</p>
              </div>

              <div className="hcr-block hcr-block-pending">
                <h3>Skill mastery</h3>
                <p className="hcr-pending">Pending — requires IPAAL Bridge</p>
                <p className="hcr-source">Source: Inpact lesson_activity, once connected</p>
              </div>
            </div>

            <div className="hcr-note">
              <h3>Core Studio note</h3>
              <textarea
                rows={2}
                value={notes[p.name] ?? ""}
                onChange={(e) => setNotes((n) => ({ ...n, [p.name]: e.target.value }))}
                placeholder="Judgment and communication under ambiguity — what the metrics above can't show"
              />
              <button type="button" disabled={saving === p.name} onClick={() => saveNote(p.name)}>
                {saving === p.name ? "Saving…" : "Save note"}
              </button>
            </div>
          </section>
        ))}

      {!loading && people.length === 0 && <p className="hcr-empty">No placements yet — nothing to report on.</p>}
    </div>
  );
}
