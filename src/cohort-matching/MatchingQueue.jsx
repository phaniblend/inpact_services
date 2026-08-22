import { useEffect, useState, useCallback } from "react";
import { notifyTeam } from "../team-messaging/notify.js";
import { SKILL_LEVELS, skillLabel } from "./skillLevels.js";
import {
  RESERVED_PROJECT_IDS,
  COHORT_PROJECT_ID,
  TEAM_OPS_PROJECT_ID,
  extractApplicationId,
  isAssignable,
  matchedTaskIds,
  parseApplication,
  latestAspirationLevel,
  effectiveCeiling as sharedEffectiveCeiling,
  tasksForApplicant as sharedTasksForApplicant,
} from "./matching.js";
import "./CohortMatching.css";

const ASPIRATION_OPTIONS = SKILL_LEVELS.filter((l) => l.value !== "none");

/** Human label for Apply's SkillLevel / BeSkillLevel. */
function existingCodingSkillLabel(skillLevel) {
  if (!skillLevel) return null;
  return skillLabel(skillLevel);
}

function aspirationDisplayLabel(value) {
  if (!value) return null;
  return skillLabel(value);
}

async function api(path, opts) {
  const res = await fetch(`/api/onedev${path}`, {
    headers: { "Content-Type": "application/json", ...(opts?.headers || {}) },
    ...opts,
  });
  if (!res.ok) throw new Error(`Couldn't load matching data (${res.status})`);
  return res.json();
}

export default function MatchingQueue() {
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [matchedIds, setMatchedIds] = useState(new Set());
  const [matches, setMatches] = useState([]); // raw Matched: issues, needed for progression lookups
  const [aspirationIssues, setAspirationIssues] = useState([]); // Core Studio's later check-ins
  const [allIssues, setAllIssues] = useState([]); // every issue, unfiltered — for closed-task progression checks
  const [tasks, setTasks] = useState([]);
  const [blockedTaskCount, setBlockedTaskCount] = useState(0);
  const [picked, setPicked] = useState({}); // applicationId -> taskId
  const [aspirationDraft, setAspirationDraft] = useState({}); // name -> level being set right now
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(null); // applicationId currently being placed
  const [savingAspiration, setSavingAspiration] = useState(null); // name currently being saved
  const [rematching, setRematching] = useState(false);
  const [rematchNote, setRematchNote] = useState("");
  const [assignEmail, setAssignEmail] = useState("");
  const [assignName, setAssignName] = useState("");
  const [assignTaskId, setAssignTaskId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignNote, setAssignNote] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [allProjects, cohortIssues, issues] = await Promise.all([
        api("/projects?offset=0&count=100"),
        api("/issues?offset=0&count=200"),
        api("/issues?offset=0&count=200"),
      ]);
      setProjects(allProjects);
      setAllIssues(issues);

      const cohort = cohortIssues.filter((i) => i.projectId === COHORT_PROJECT_ID);
      const apps = cohort.filter((i) => i.title.startsWith("Application:"));
      const matchIssues = cohort.filter((i) => i.title.startsWith("Matched:"));
      setApplications(apps);
      setMatches(matchIssues);
      setMatchedIds(new Set(matchIssues.map((m) => extractApplicationId(m.description)).filter(Boolean)));
      setAspirationIssues(issues.filter((i) => i.projectId === TEAM_OPS_PROJECT_ID && i.title.startsWith("Aspiration:")));

      const openTasks = issues.filter((i) => !RESERVED_PROJECT_IDS.has(i.projectId) && i.state === "Open");
      setTasks(openTasks.filter(isAssignable));
      setBlockedTaskCount(openTasks.length - openTasks.filter(isAssignable).length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Drop a stale selection if that task got matched since the form was filled.
  useEffect(() => {
    if (!assignTaskId) return;
    const taken = matchedTaskIds(matches);
    if (taken.has(Number(assignTaskId))) setAssignTaskId("");
  }, [matches, assignTaskId]);

  function projectName(id) {
    return projects.find((p) => p.id === id)?.name ?? `project ${id}`;
  }

  // Thin wrappers over the shared predicate in matching.js (same logic server/recruit-router.js
  // uses for automatic matching at application time) — these just supply this component's loaded
  // state as context so call sites below don't change.
  function effectiveCeiling(app) {
    return sharedEffectiveCeiling(parseApplication(app), { matches, allIssues, aspirationIssues });
  }
  function tasksForApplicant(app) {
    return sharedTasksForApplicant(parseApplication(app), tasks, { matches, allIssues, aspirationIssues });
  }
  function aspirationFor(app) {
    const info = parseApplication(app);
    return latestAspirationLevel(info.Name, info.Aspiration, aspirationIssues);
  }

  function ApplicantSkillLines({ app }) {
    const info = parseApplication(app);
    const feLabel = existingCodingSkillLabel(info.SkillLevel);
    const beLabel = existingCodingSkillLabel(info.BeSkillLevel);
    const aspirationLabel = aspirationDisplayLabel(aspirationFor(app));
    const beAspirationLabel = aspirationDisplayLabel(info.BeAspiration);
    const ceiling = effectiveCeiling(app);
    const focus = info.CodingFocus || "";
    return (
      <>
        <div className="cm-app-trade">
          {info["Stated trade"]}
          {focus ? ` · ${focus}` : ""}
        </div>
        {feLabel && (
          <div className="cm-app-skill">
            Frontend skill: <strong>{feLabel}</strong>
          </div>
        )}
        {beLabel && (
          <div className="cm-app-skill">
            Backend skill: <strong>{beLabel}</strong>
          </div>
        )}
        {aspirationLabel && (
          <div className="cm-app-skill">
            FE aspiration: <strong>{aspirationLabel}</strong>
          </div>
        )}
        {beAspirationLabel && (
          <div className="cm-app-skill">
            BE aspiration: <strong>{beAspirationLabel}</strong>
          </div>
        )}
        {ceiling === "advanced" && (
          <div className="cm-app-skill">
            <span
              className="cm-unlocked-badge"
              title="Can be matched to TypeScript / advanced FE tasks (stated skill, aspiration, or finished a JS task)"
            >
              Eligible for TypeScript / advanced FE tasks
            </span>
          </div>
        )}
      </>
    );
  }

  async function handlePlace(app) {
    const taskId = picked[app.id];
    if (!taskId) return;
    const task = tasks.find((t) => t.id === Number(taskId));
    if (!task) return;
    setPlacing(app.id);
    setError("");
    try {
      const info = parseApplication(app);
      const res = await fetch("/api/onedev/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: COHORT_PROJECT_ID,
          title: `Matched: ${info.Name || "applicant"} → ${task.title}`,
          description: [
            `ApplicationId: ${app.id}`,
            `TaskId: ${task.id}`,
            `Task: #${task.number} "${task.title}" in ${projectName(task.projectId)}`,
            `StatedTrade: ${info["Stated trade"] || ""}`,
            `— placed manually from Matching Queue (no automatic match was available at application time)`,
          ].join("\n"),
        }),
      });
      if (!res.ok) throw new Error(`Couldn't place applicant (${res.status})`);
      await notifyTeam(
        `🎉 **${info.Name || "A new JS"}** joined **${projectName(task.projectId)}** — placed on #${task.number} "${task.title}" (stated trade: ${info["Stated trade"] || "unspecified"})`
      );
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(null);
    }
  }

  async function handleRematchSweep() {
    setRematching(true);
    setError("");
    setRematchNote("");
    try {
      const res = await fetch("/api/recruit/rematch-queued", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Rematch failed (${res.status})`);
      const n = data.count ?? data.rematched?.length ?? 0;
      setRematchNote(
        n === 0
          ? "Rematch sweep finished — nobody waiting could be placed (no assignable task fit)."
          : `Rematch sweep placed ${n} applicant${n === 1 ? "" : "s"}.`,
      );
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setRematching(false);
    }
  }

  async function handleAssignByEmail(e) {
    e.preventDefault();
    if (!assignEmail.trim() || !assignTaskId) return;
    setAssigning(true);
    setError("");
    setAssignNote("");
    try {
      const res = await fetch("/api/recruit/assign-by-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: assignEmail.trim(),
          taskId: Number(assignTaskId),
          name: assignName.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Assign failed (${res.status})`);
      setAssignNote(
        `Assigned ${data.name} (${data.email}) → #${data.task.number} ${data.task.title} in ${data.task.project}.`
      );
      setAssignEmail("");
      setAssignName("");
      setAssignTaskId("");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setAssigning(false);
    }
  }

  async function saveAspiration(name) {
    const level = aspirationDraft[name];
    if (!level) return;
    setSavingAspiration(name);
    setError("");
    try {
      await api("/issues", {
        method: "POST",
        body: JSON.stringify({
          projectId: TEAM_OPS_PROJECT_ID,
          title: `Aspiration: ${name}`,
          description: [`Level: ${level}`, `RecordedAt: ${new Date().toISOString()}`].join("\n"),
        }),
      });
      await notifyTeam(`🎯 **${name}**'s aspiration updated to **${level}** — this unlocks matching next placement.`);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingAspiration(null);
    }
  }

  const pending = applications.filter((a) => !matchedIds.has(a.id));
  const placed = applications.filter((a) => matchedIds.has(a.id));
  // Assign-by-email must only offer free tasks — same taken set as tasksForApplicant / auto-match.
  const takenTaskIds = matchedTaskIds(matches);
  const unassignedTasks = tasks.filter((t) => !takenTaskIds.has(t.id));

  return (
    <div className="cm-queue">
      <header className="cm-header">
        <div className="cm-kicker">Cohort &amp; Matching Engine · Core Studio view</div>
        <h1>Matching queue</h1>
        <p className="cm-sub">
          Most applicants are matched automatically the moment they apply — what&apos;s below is only whoever
          didn&apos;t get an automatic match yet, usually because nothing in their trade is assignable right now.
          Placing here is manual and immediate; the same trade/level rule applies either way — JS-tier by default,
          TS/advanced once they&apos;ve said they&apos;re ready or finished a JS task.
        </p>
        <div className="cm-header-actions" style={{ marginTop: 12 }}>
          <button type="button" disabled={rematching || loading} onClick={handleRematchSweep}>
            {rematching ? "Running rematch…" : "Rematch queued applicants"}
          </button>
          {rematchNote && <span className="cm-rematch-note" style={{ marginLeft: 12, color: "#475569", fontSize: 13 }}>{rematchNote}</span>}
        </div>
      </header>

      {error && <div className="cm-error">{error}</div>}
      {loading && <div className="cm-loading">Loading…</div>}

      {!loading && (
        <section className="cm-section cm-assign-email">
          <h2>Assign by email</h2>
          <p className="cm-sub" style={{ marginBottom: 12 }}>
            Place an unassigned open task on a JS by email. Creates an Application if they haven&apos;t applied yet.
            Does not remove existing assignments on other tasks.
          </p>
          <form className="cm-assign-form" onSubmit={handleAssignByEmail}>
            <label>
              Email
              <input
                type="email"
                required
                value={assignEmail}
                onChange={(e) => setAssignEmail(e.target.value)}
                placeholder="js.applicant@gmail.com"
              />
            </label>
            <label>
              Name <span className="cm-hint">(optional)</span>
              <input
                value={assignName}
                onChange={(e) => setAssignName(e.target.value)}
                placeholder="Display name"
              />
            </label>
            <label>
              Open task <span className="cm-hint">(unassigned only)</span>
              <select required value={assignTaskId} onChange={(e) => setAssignTaskId(e.target.value)}>
                <option value="">
                  {unassignedTasks.length === 0 ? "No unassigned open tasks…" : "Choose an open task…"}
                </option>
                {unassignedTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    #{t.number} {t.title} — {projectName(t.projectId)}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" disabled={assigning || !assignEmail.trim() || !assignTaskId}>
              {assigning ? "Assigning…" : "Assign task"}
            </button>
          </form>
          {assignNote && <p className="cm-assign-note">{assignNote}</p>}
        </section>
      )}

      {!loading && blockedTaskCount > 0 && (
        <div className="cm-blocked-note">
          {blockedTaskCount} open task{blockedTaskCount === 1 ? "" : "s"} hidden from every picker below — still
          waiting on a tutorial from ID Studio, so no one can be assigned to them yet.
        </div>
      )}

      {!loading && (
        <>
          <section className="cm-section">
            <h2>Pending ({pending.length})</h2>
            {pending.length === 0 && <p className="cm-empty">Nothing waiting on a match.</p>}
            {pending.map((app) => {
              const info = parseApplication(app);
              const visibleTasks = tasksForApplicant(app);
              const hiddenCount = tasks.length - visibleTasks.length;
              return (
                <div className="cm-app-card" key={app.id}>
                  <div className="cm-app-info">
                    <div className="cm-app-name">{info.Name}</div>
                    <ApplicantSkillLines app={app} />
                    <div className="cm-app-email">{info.Email}</div>
                    {info.Note && <div className="cm-app-note">{info.Note}</div>}
                  </div>
                  <div className="cm-app-match">
                    <select
                      value={picked[app.id] || ""}
                      onChange={(e) => setPicked((p) => ({ ...p, [app.id]: e.target.value }))}
                    >
                      <option value="">Choose an open task…</option>
                      {visibleTasks.map((t) => (
                        <option key={t.id} value={t.id}>
                          #{t.number} {t.title} — {projectName(t.projectId)}
                        </option>
                      ))}
                    </select>
                    {hiddenCount > 0 && (
                      <span className="cm-hidden-hint">{hiddenCount} task{hiddenCount === 1 ? "" : "s"} not shown — wrong trade or above their level</span>
                    )}
                    <button
                      type="button"
                      disabled={!picked[app.id] || placing === app.id}
                      onClick={() => handlePlace(app)}
                    >
                      {placing === app.id ? "Placing…" : "Place"}
                    </button>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="cm-section">
            <h2>Placed ({placed.length})</h2>
            {placed.map((app) => {
              const info = parseApplication(app);
              const theirMatches = matches.filter((m) => extractApplicationId(m.description) === app.id);
              return (
                <div className="cm-app-card cm-app-card-done" key={app.id}>
                  <div className="cm-app-info">
                    <div className="cm-app-name">{info.Name}</div>
                    <ApplicantSkillLines app={app} />
                    {info.Email && <div className="cm-app-email">{info.Email}</div>}
                    {theirMatches.map((m) => {
                      const taskLine = /^Task:\s*(.+)$/m.exec(m.description || "")?.[1]?.trim();
                      return (
                        <div className="cm-app-note" key={m.id}>
                          → {taskLine || m.title.replace(/^Matched:\s*/, "")}
                        </div>
                      );
                    })}
                  </div>
                  {info.SkillLevel && (
                    <div className="cm-aspiration-checkin">
                      <select
                        value={aspirationDraft[info.Name] ?? ""}
                        onChange={(e) => setAspirationDraft((d) => ({ ...d, [info.Name]: e.target.value }))}
                      >
                        <option value="">Update aspiration…</option>
                        {ASPIRATION_OPTIONS.map((a) => (
                          <option key={a.value} value={a.value}>
                            {a.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={!aspirationDraft[info.Name] || savingAspiration === info.Name}
                        onClick={() => saveAspiration(info.Name)}
                      >
                        {savingAspiration === info.Name ? "Saving…" : "Save"}
                      </button>
                    </div>
                  )}
                  <span className="cm-placed-tag">Placed</span>
                </div>
              );
            })}
          </section>
        </>
      )}
    </div>
  );
}
