import { useEffect, useState, useCallback } from "react";
import { notifyTeam } from "../team-messaging/notify.js";
import "./CDReview.css";

const COHORT_PROJECT_ID = 2;
const TEAM_OPS_PROJECT_ID = 3;
const MODULE_LIBRARY_PROJECT_ID = 4;
const RESERVED_PROJECT_IDS = new Set([COHORT_PROJECT_ID, TEAM_OPS_PROJECT_ID, MODULE_LIBRARY_PROJECT_ID]);

const OUTCOMES = [
  { value: "approved", label: "Approved" },
  { value: "changes-requested", label: "Changes requested" },
  { value: "blocked", label: "Blocked" },
];

async function api(path, opts) {
  const res = await fetch(`/api/onedev${path}`, {
    headers: { "Content-Type": "application/json", ...(opts?.headers || {}) },
    ...opts,
  });
  if (!res.ok) throw new Error(`Couldn't load review data (${res.status})`);
  return res.json();
}

/** OneDev's own field names, confirmed against its Java source (PullRequest.java) rather than
 * guessed — but never fired against a real submitted PR yet, so treat the nested submitter/project
 * shapes as best-effort until the first live one shows up. Fallback chains cover that gap. */
function prMeta(pr) {
  return {
    submitterName: pr.submitter?.fullName || pr.submitter?.name || pr.submitterName || "unknown",
    targetProjectId: pr.targetProject?.id ?? pr.targetProjectId ?? null,
    targetProjectPath: pr.targetProject?.path || pr.targetProject?.name || null,
    targetBranch: pr.targetBranch || "",
    sourceBranch: pr.sourceBranch || "",
  };
}

function onedevPrUrl(projectPath, number) {
  return projectPath ? `http://localhost:6610/${projectPath}/~pulls/${number}` : null;
}

export default function CDReview() {
  const [prs, setPrs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [cohortByProject, setCohortByProject] = useState(new Map());
  const [reviewedByPrId, setReviewedByPrId] = useState(new Map()); // prId -> {outcome, note, reviewedAt}
  const [draft, setDraft] = useState({}); // prId -> {outcome, note}
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [allProjects, allPrs, teamOpsIssues] = await Promise.all([
        api("/projects?offset=0&count=100"),
        api("/pulls?offset=0&count=100"),
        api("/issues?offset=0&count=200"),
      ]);
      setProjects(allProjects);

      const teamOps = teamOpsIssues.filter((i) => i.projectId === TEAM_OPS_PROJECT_ID);
      const cohorts = teamOps.filter((i) => i.title.startsWith("Cohort:"));
      const cohortMap = new Map();
      for (const c of cohorts) {
        const m = /DeliveryProject:.*\(#(\d+)\)/.exec(c.description || "");
        if (m) cohortMap.set(Number(m[1]), c.title.replace("Cohort:", "").trim());
      }
      setCohortByProject(cohortMap);

      const outcomeValues = new Set(OUTCOMES.map((o) => o.value));
      const reviews = teamOps.filter((i) => i.title.startsWith("CD Review:"));
      const reviewMap = new Map();
      for (const r of reviews) {
        const prId = Number(/PullRequestId:\s*(\d+)/.exec(r.description || "")?.[1]);
        if (!prId) continue;
        const outcome = /Outcome:\s*(.+)/.exec(r.description || "")?.[1]?.trim();
        const note = /Note:\s*(.+)/.exec(r.description || "")?.[1]?.trim();
        // "pending" / missing means still awaiting CD — do not count as reviewed.
        if (outcome && outcomeValues.has(outcome)) {
          reviewMap.set(prId, { outcome, note, reviewedAt: r.submitDate });
        }
      }
      setReviewedByPrId(reviewMap);

      const openPrs = (allPrs || []).filter((p) => (p.status || "OPEN") === "OPEN");
      // Dry-run / Assist Me seeds: when OneDev git auth blocks a real PR, CD Review still shows a
      // queue card from team-ops so the human review path can be exercised end-to-end.
      const knownPrIds = new Set(openPrs.map((p) => p.id));
      const syntheticPrs = [];
      for (const r of reviews) {
        const desc = r.description || "";
        if (!/Source:\s*asap-dry-run-seed/i.test(desc) && !/Source:\s*dry-run/i.test(desc)) continue;
        const prId = Number(/PullRequestId:\s*(\d+)/.exec(desc)?.[1]);
        if (!prId || knownPrIds.has(prId) || reviewMap.has(prId)) continue;
        const outcome = /Outcome:\s*(.+)/.exec(desc)?.[1]?.trim();
        if (outcome && outcomeValues.has(outcome)) continue; // already finalized
        syntheticPrs.push({
          id: prId,
          number: Number(/PullRequestNumber:\s*(\d+)/.exec(desc)?.[1] || 0) || prId,
          title: r.title.replace(/^CD Review:\s*/, ""),
          status: "OPEN",
          submitterName: /Submitter:\s*(.+)/.exec(desc)?.[1]?.trim() || "dry-run",
          targetProjectId: Number(/ProjectId:\s*(\d+)/.exec(desc)?.[1]) || null,
          targetProject: {
            id: Number(/ProjectId:\s*(\d+)/.exec(desc)?.[1]) || null,
            name: /ProjectName:\s*(.+)/.exec(desc)?.[1]?.trim() || null,
            path: /ProjectName:\s*(.+)/.exec(desc)?.[1]?.trim() || null,
          },
          sourceBranch: "assist-me-dry-run",
          targetBranch: "main",
          _synthetic: true,
          _seedIssueId: r.id,
        });
      }
      setPrs([...openPrs, ...syntheticPrs]);

      // Auto-notify once per PR the first time this screen sees it — no background jobs exist in
      // this app, so "informing CD about a new PR" happens the next time anyone loads this queue,
      // not the instant a JS opens one. Marker issues (CD Notified: <id>) make it idempotent.
      const alreadyNotified = new Set(
        teamOps.filter((i) => i.title.startsWith("CD Notified:")).map((i) => i.title.replace("CD Notified:", "").trim())
      );
      const unnotified = openPrs.filter((p) => !alreadyNotified.has(String(p.id)));
      for (const pr of unnotified) {
        const meta = prMeta(pr);
        const projName = allProjects.find((proj) => proj.id === meta.targetProjectId)?.name || meta.targetProjectPath || "a project";
        await api("/issues", {
          method: "POST",
          body: JSON.stringify({
            projectId: TEAM_OPS_PROJECT_ID,
            title: `CD Notified: ${pr.id}`,
            description: `PR #${pr.number} "${pr.title}" in ${projName}, from ${meta.submitterName}.`,
          }),
        });
        await notifyTeam(
          `🔍 **New PR for CD review**: #${pr.number} "${pr.title}" in **${projName}** — submitted by ${meta.submitterName}. Review it at [CD Review](#/cd-review).`
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveReview(pr) {
    const d = draft[pr.id];
    if (!d?.outcome) return;
    setSaving(pr.id);
    setError("");
    try {
      const meta = prMeta(pr);
      await api("/issues", {
        method: "POST",
        body: JSON.stringify({
          projectId: TEAM_OPS_PROJECT_ID,
          title: `CD Review: ${pr.title} (#${pr.number})`,
          description: [
            `PullRequestId: ${pr.id}`,
            `PullRequestNumber: ${pr.number}`,
            meta.targetProjectId ? `ProjectId: ${meta.targetProjectId}` : null,
            `Outcome: ${d.outcome}`,
            d.note ? `Note: ${d.note}` : null,
            pr._synthetic ? `Source: asap-dry-run-seed` : null,
            `ReviewedAt: ${new Date().toISOString()}`,
          ]
            .filter(Boolean)
            .join("\n"),
        }),
      });
      await notifyTeam(
        `✅ CD review logged on #${pr.number} "${pr.title}" (${meta.submitterName}): **${OUTCOMES.find((o) => o.value === d.outcome)?.label}**.`
      );
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(null);
    }
  }

  const deliveryProjects = projects.filter((p) => !RESERVED_PROJECT_IDS.has(p.id));
  const grouped = deliveryProjects
    .map((proj) => ({
      project: proj,
      cohort: cohortByProject.get(proj.id) || null,
      prs: prs.filter((p) => prMeta(p).targetProjectId === proj.id),
    }))
    .filter((g) => g.prs.length > 0);
  const reviewedCount = prs.filter((p) => reviewedByPrId.has(p.id)).length;
  const awaitingCount = prs.length - reviewedCount;

  return (
    <div className="cdr">
      <header className="cdr-header">
        <div className="cdr-kicker">CD · Core Dev Review</div>
        <h1>Every open PR, one queue</h1>
        <p className="cdr-sub">
          Interim manual gate — every JS&apos;s PR gets a real human dev/devops look before merge, until the JS
          community itself is strong enough to review and manage this. Open the real diff, then log the outcome
          here so nothing slips past the queue.
        </p>
      </header>

      {error && <div className="cdr-error">{error}</div>}
      {loading && <div className="cdr-loading">Loading…</div>}

      {!loading && (
        <>
          <section className="cdr-tiles">
            <div className="cdr-tile">
              <div className="cdr-tile-value">{prs.length}</div>
              <div className="cdr-tile-label">Open PRs</div>
            </div>
            <div className={`cdr-tile ${awaitingCount > 0 ? "cdr-tile-attention" : ""}`}>
              <div className="cdr-tile-value">{awaitingCount}</div>
              <div className="cdr-tile-label">Awaiting review</div>
            </div>
            <div className="cdr-tile">
              <div className="cdr-tile-value">{reviewedCount}</div>
              <div className="cdr-tile-label">Reviewed</div>
            </div>
          </section>

          {grouped.length === 0 && <p className="cdr-empty">No open PRs right now — nothing waiting on CD.</p>}

          {grouped.map((g) => (
            <section className="cdr-group" key={g.project.id}>
              <h2>
                {g.project.name}
                {g.cohort && <span className="cdr-cohort-tag">{g.cohort}</span>}
              </h2>
              {g.prs.map((pr) => {
                const meta = prMeta(pr);
                const reviewed = reviewedByPrId.get(pr.id);
                const url = onedevPrUrl(meta.targetProjectPath, pr.number);
                return (
                  <div className="cdr-pr-card" key={pr.id}>
                    <div className="cdr-pr-top">
                      <span className="cdr-pr-number">#{pr.number}</span>
                      <span className="cdr-pr-title">{pr.title}</span>
                      {pr._synthetic && <span className="cdr-cohort-tag">dry-run seed</span>}
                      {reviewed && (
                        <span className={`cdr-outcome-tag cdr-outcome-${reviewed.outcome}`}>
                          {OUTCOMES.find((o) => o.value === reviewed.outcome)?.label || reviewed.outcome}
                        </span>
                      )}
                    </div>
                    <div className="cdr-pr-meta">
                      {meta.submitterName} · {meta.sourceBranch} → {meta.targetBranch}
                      {url && !pr._synthetic && (
                        <a href={url} target="_blank" rel="noreferrer noopener">
                          Open PR →
                        </a>
                      )}
                      {pr._synthetic && (
                        <span title="No live PR URL for this queue exercise">
                          (queue exercise — no live PR URL)
                        </span>
                      )}
                    </div>
                    {!reviewed ? (
                      <div className="cdr-review-form">
                        <select
                          value={draft[pr.id]?.outcome || ""}
                          onChange={(e) => setDraft((d) => ({ ...d, [pr.id]: { ...d[pr.id], outcome: e.target.value } }))}
                        >
                          <option value="">Log outcome…</option>
                          {OUTCOMES.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        <input
                          value={draft[pr.id]?.note || ""}
                          onChange={(e) => setDraft((d) => ({ ...d, [pr.id]: { ...d[pr.id], note: e.target.value } }))}
                          placeholder="Note (optional)"
                        />
                        <button
                          type="button"
                          disabled={!draft[pr.id]?.outcome || saving === pr.id}
                          onClick={() => saveReview(pr)}
                        >
                          {saving === pr.id ? "Saving…" : "Save"}
                        </button>
                      </div>
                    ) : (
                      reviewed.note && <p className="cdr-reviewed-note">{reviewed.note}</p>
                    )}
                  </div>
                );
              })}
            </section>
          ))}
        </>
      )}
    </div>
  );
}
