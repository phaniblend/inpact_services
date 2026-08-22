/**
 * Recruit module — automatic trade/skill matching at application time. Previously matching was
 * "Manual by design" (MatchingQueue.jsx placed every applicant by hand, per the MVP scope call
 * documented in docs/IPF_DEVGUIDE.md §5a-1). Founder call 2026-08-09: matching should not be a
 * manual step — the moment someone applies, try to place them immediately using the same
 * trade/level rule Matching Queue already enforced by hand. Matching Queue stays in the app as the
 * fallback: whoever doesn't get an automatic match here (usually because nothing in their trade is
 * assignable yet) still shows up there for a human to place once something opens up.
 *
 * POST /apply — requires a signed-in session (Google OAuth for JS applicants — see auth-router.js).
 * body: { name, trade, skillLevel?, aspiration?, note? } — deliberately NO email in the body: the
 * whole point of requiring sign-in here is that email comes from the verified session, not
 * client-supplied text (Apply.jsx used to have a free-text Email field; founder call 2026-08-09 was
 * to replace it with "sign in with Google" so applying = authenticated, not just a form claim).
 *   1. Creates the Application issue (same shape Apply.jsx used to write directly via /onedev-api).
 *   2. Loads the current world (tasks/matches/aspirations) and runs the shared matching.js predicate.
 *   3. If a task fits: creates the Matched issue + Mattermost ping, same side effects
 *      MatchingQueue.jsx's handlePlace produces — this IS that action, just server-triggered.
 *   4. Responds { ok, matched, task? } either way — the application is always created, matched or not.
 */
import express from "express";
import { listIssues, listProjects, createIssue, updateIssueDescription, updateIssueTitle } from "./onedev-client.js";
import { notifyTeamServer } from "./notify-server.js";
import { requireSession, requireRole } from "./auth-session.js";
import {
  COHORT_PROJECT_ID,
  TEAM_OPS_PROJECT_ID,
  RESERVED_PROJECT_IDS,
  isAssignable,
  isCoreOnlyTrade,
  bestTaskMatch,
  taskMeta,
  parseApplication,
  extractApplicationId,
} from "../src/cohort-matching/matching.js";

const router = express.Router();

function projectNameOf(projects, id) {
  return projects.find((p) => p.id === id)?.name ?? `project ${id}`;
}

// Founder call 2026-08-09: rather than reacting when applicants outnumber tasks (which shouldn't
// really happen if PD keeps ahead of demand — "irrespective of applicant intake, PD should
// continuously and rigorously keep looking for new products"), proactively ping PD-core once a
// trade's assignable supply gets low, so there's real lead time before anyone's actually stuck
// waiting. 3 is the pick: low enough to be a real signal rather than routine noise from day-to-day
// matching, high enough to give PD a working session's worth of runway before the trade actually
// runs dry.
const LOW_SUPPLY_THRESHOLD = 3;
// Don't re-ping the same trade more than once a day while it stays low — PD can only spec so fast,
// and a ping every single application would just be noise they'd learn to ignore.
const LOW_SUPPLY_COOLDOWN_MS = 24 * 60 * 60 * 1000;

/** Checked after every application (matched or not) — what matters is trade-wide supply, not this
 * one applicant's personal outcome. Cooldown is time-based off the most recent LowSupplyAlert:
 * <trade> issue's timestamp, not an open/closed marker that needs closing on recovery — OneDev's
 * state-transition endpoint isn't used anywhere else in this codebase yet (only ever confirmed via
 * its Java source, never actually called), and a plain "don't re-alert within 24h" is simpler to
 * reason about than "did supply recover yet" without adding that risk here. */
async function checkLowSupplyAndNotify(trade, issues) {
  const remaining = issues.filter(
    (i) =>
      !RESERVED_PROJECT_IDS.has(i.projectId) &&
      i.state === "Open" &&
      isAssignable(i) &&
      (taskMeta(i.description).trade || "").toLowerCase() === trade.toLowerCase()
  ).length;

  if (remaining > LOW_SUPPLY_THRESHOLD) return;

  const alertTitle = `LowSupplyAlert: ${trade}`;
  const recentAlert = issues
    .filter((i) => i.projectId === TEAM_OPS_PROJECT_ID && i.title === alertTitle)
    .sort((a, b) => new Date(b.submitDate) - new Date(a.submitDate))[0];
  if (recentAlert && Date.now() - new Date(recentAlert.submitDate).getTime() < LOW_SUPPLY_COOLDOWN_MS) return;

  await createIssue({
    projectId: TEAM_OPS_PROJECT_ID,
    title: alertTitle,
    description: [`Trade: ${trade}`, `RemainingAssignableTasks: ${remaining}`, `RaisedAt: ${new Date().toISOString()}`].join(
      "\n"
    ),
  });
  await notifyTeamServer(
    `⚠️ **${trade}** is running low — only ${remaining} assignable task${remaining === 1 ? "" : "s"} left. PD-core: time to spec more ${trade} work before applicants start waiting.`
  );
}

router.post("/apply", requireSession, async (req, res) => {
  try {
    const email = req.session.email;
    const { name, trade, skillLevel, beSkillLevel, aspiration, beAspiration, codingFocus, note, ownershipAck } =
      req.body || {};
    if (!name || !trade) {
      return res.status(400).json({ error: "name and trade are required" });
    }
    // Affirmative consent at apply time (handoff §9) — must be a real checked box, not post-match
    // passive copy. Stored on the Application issue so there's an audit trail in OneDev.
    if (ownershipAck !== true) {
      return res.status(400).json({ error: "You must acknowledge the training / ownership terms before applying." });
    }
    // Apply.jsx's picker already hides core-only trades (matching.js's CORE_ONLY_TRADES) — this is
    // the defensive backstop in case anyone posts here directly instead of through the real form.
    if (isCoreOnlyTrade(trade)) {
      return res.status(400).json({ error: `${trade} isn't open to applicants yet — that work stays with the core team for now.` });
    }
    const isCoding = trade.toLowerCase() === "coding";
    const focus = ["frontend", "backend", "both"].includes(String(codingFocus || "").toLowerCase())
      ? String(codingFocus).toLowerCase()
      : "both";
    if (isCoding) {
      const needFe = focus === "frontend" || focus === "both";
      const needBe = focus === "backend" || focus === "both";
      if (needFe && !skillLevel) {
        return res.status(400).json({ error: "Frontend skill level is required for this coding focus." });
      }
      if (needBe && !beSkillLevel) {
        return res.status(400).json({ error: "Backend skill (HTTP APIs or CRUD) is required for this coding focus." });
      }
    }

    const applicationDescription = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Stated trade: ${trade}`,
      isCoding && skillLevel ? `SkillLevel: ${skillLevel}` : null,
      isCoding && beSkillLevel ? `BeSkillLevel: ${beSkillLevel}` : null,
      isCoding && aspiration ? `Aspiration: ${aspiration}` : null,
      isCoding && beAspiration ? `BeAspiration: ${beAspiration}` : null,
      isCoding ? `CodingFocus: ${focus}` : null,
      note ? `Note: ${note}` : null,
      `OwnershipAck: true`,
      `OwnershipAckAt: ${new Date().toISOString()}`,
    ]
      .filter(Boolean)
      .join("\n");

    const application = await createIssue({
      projectId: COHORT_PROJECT_ID,
      title: `Application: ${name} — ${trade}`,
      description: applicationDescription,
    });

    // Same data MatchingQueue.jsx's load() reads, straight from OneDev (server side has no Vite
    // proxy — onedev-client.js talks to OneDev directly).
    const [projects, issues] = await Promise.all([
      listProjects({ offset: 0, count: 100 }),
      listIssues({ offset: 0, count: 200 }),
    ]);

    const matches = issues.filter((i) => i.projectId === COHORT_PROJECT_ID && i.title.startsWith("Matched:"));
    const aspirationIssues = issues.filter((i) => i.projectId === TEAM_OPS_PROJECT_ID && i.title.startsWith("Aspiration:"));
    const openAssignableTasks = issues.filter(
      (i) => !RESERVED_PROJECT_IDS.has(i.projectId) && i.state === "Open" && isAssignable(i)
    );

    const info = {
      Name: name,
      "Stated trade": trade,
      SkillLevel: isCoding ? skillLevel : undefined,
      BeSkillLevel: isCoding ? beSkillLevel : undefined,
      Aspiration: isCoding ? aspiration : undefined,
      BeAspiration: isCoding ? beAspiration : undefined,
      CodingFocus: isCoding ? focus : undefined,
    };

    const task = bestTaskMatch(info, { tasks: openAssignableTasks, matches, allIssues: issues, aspirationIssues });

    // Proactive supply check, not reactive to this applicant's own outcome — fires whether or not
    // *they* got matched, since what it's really watching is the trade overall.
    await checkLowSupplyAndNotify(trade, issues);

    if (!task) {
      return res.json({ ok: true, matched: false, applicationId: application });
    }

    const matchedIssue = await createIssue({
      projectId: COHORT_PROJECT_ID,
      title: `Matched: ${name} → ${task.title}`,
      description: [
        `ApplicationId: ${application}`,
        `TaskId: ${task.id}`,
        `Task: #${task.number} "${task.title}" in ${projectNameOf(projects, task.projectId)}`,
        `StatedTrade: ${trade}`,
        `— matched automatically at application time (server/recruit-router.js)`,
      ].join("\n"),
    });

    await notifyTeamServer(
      `🎉 **${name}** joined **${projectNameOf(projects, task.projectId)}** — auto-matched to #${task.number} "${task.title}" (stated trade: ${trade})`
    );

    res.json({
      ok: true,
      matched: true,
      applicationId: application,
      matchedIssueId: matchedIssue,
      task: {
        id: task.id,
        number: task.number,
        title: task.title,
        project: projectNameOf(projects, task.projectId),
        projectId: task.projectId,
      },
    });
  } catch (err) {
    console.error("[recruit] /apply failed:", err.message);
    res.status(500).json({ error: "Something went wrong submitting your application — please try again." });
  }
});

/** GET /my-tasks — every task the signed-in JS is actually matched to, and nothing else. Workbench
 * used to show every JS the exact same admin-style board (full project switcher, every product's
 * tasks) that -core roles need — founder call 2026-08-09: a JS applicant should only ever see what
 * they're assigned to, unless they genuinely hold multiple tasks across products. Looked up by
 * verified session email (never trust a client-supplied id here): find this email's Application
 * issue(s) in cohort-applications, then the Matched: issues that reference one of those application
 * ids, then resolve each to its real task. Same OneDev data MatchingQueue.jsx already reads, just
 * filtered down to one person's slice of it instead of showing everything to everyone. */
router.get("/my-tasks", requireSession, async (req, res) => {
  try {
    const email = req.session.email;
    const [projects, issues] = await Promise.all([
      listProjects({ offset: 0, count: 100 }),
      listIssues({ offset: 0, count: 200 }),
    ]);

    const myApplicationIds = new Set(
      issues
        .filter(
          (i) =>
            i.projectId === COHORT_PROJECT_ID &&
            i.title.startsWith("Application:") &&
            (i.description || "").split("\n").some((line) => line.trim() === `Email: ${email}`)
        )
        .map((i) => i.id)
    );

    const myMatches = issues.filter((i) => {
      if (i.projectId !== COHORT_PROJECT_ID || !i.title.startsWith("Matched:")) return false;
      const applicationId = Number(/ApplicationId:\s*(\d+)/.exec(i.description || "")?.[1]);
      return myApplicationIds.has(applicationId);
    });

    const tasks = myMatches
      .map((m) => {
        const taskId = Number(/TaskId:\s*(\d+)/.exec(m.description || "")?.[1]);
        const task = issues.find((i) => i.id === taskId);
        if (!task) return null; // task since deleted/renumbered — skip rather than show a broken card
        return {
          id: task.id,
          number: task.number,
          title: task.title,
          description: task.description,
          state: task.state,
          projectId: task.projectId,
          project: projectNameOf(projects, task.projectId),
        };
      })
      .filter(Boolean);

    res.json({ tasks });
  } catch (err) {
    console.error("[recruit] /my-tasks failed:", err.message);
    res.status(500).json({ error: "Couldn't load your tasks — please try again." });
  }
});

/**
 * Human-action re-match sweep — called when assignable supply increases (ID publishes a tutorial
 * that unblocks tasks, or SpecForge publishes already-wired/exempt tasks). No cron: same pattern as
 * CD Review's one-time announce (handoff §9). Walks pending Application: issues (no Matched: yet)
 * oldest-first and places each with bestTaskMatch. In-sweep match list is updated as we place so
 * two queued applicants never claim the same newly-unblocked task.
 */
export async function tryRematchQueuedApplicants() {
  const [projects, issues] = await Promise.all([
    listProjects({ offset: 0, count: 100 }),
    listIssues({ offset: 0, count: 200 }),
  ]);

  const applications = issues
    .filter((i) => i.projectId === COHORT_PROJECT_ID && i.title.startsWith("Application:"))
    .sort((a, b) => a.id - b.id); // oldest applicant first — fair queue, not last-in-wins
  const matches = issues.filter((i) => i.projectId === COHORT_PROJECT_ID && i.title.startsWith("Matched:"));
  const matchedAppIds = new Set(matches.map((m) => extractApplicationId(m.description)).filter(Boolean));
  const pending = applications.filter((a) => !matchedAppIds.has(a.id));
  if (pending.length === 0) return { rematched: [] };

  const aspirationIssues = issues.filter(
    (i) => i.projectId === TEAM_OPS_PROJECT_ID && i.title.startsWith("Aspiration:")
  );
  const openAssignableTasks = issues.filter(
    (i) => !RESERVED_PROJECT_IDS.has(i.projectId) && i.state === "Open" && isAssignable(i)
  );

  // Mutable copy — each successful place is appended so subsequent bestTaskMatch calls see the
  // taken TaskId via matching.js's matchedTaskIds filter.
  const liveMatches = [...matches];
  const rematched = [];

  for (const app of pending) {
    const info = parseApplication(app);
    if (isCoreOnlyTrade(info["Stated trade"])) continue;

    const task = bestTaskMatch(info, {
      tasks: openAssignableTasks,
      matches: liveMatches,
      allIssues: issues,
      aspirationIssues,
    });
    if (!task) continue;

    const trade = info["Stated trade"] || "";
    const name = info.Name || "applicant";
    const matchedIssue = await createIssue({
      projectId: COHORT_PROJECT_ID,
      title: `Matched: ${name} → ${task.title}`,
      description: [
        `ApplicationId: ${app.id}`,
        `TaskId: ${task.id}`,
        `Task: #${task.number} "${task.title}" in ${projectNameOf(projects, task.projectId)}`,
        `StatedTrade: ${trade}`,
        `— rematched automatically when assignable supply opened up (server/recruit-router.js tryRematchQueuedApplicants)`,
      ].join("\n"),
    });

    liveMatches.push({
      id: matchedIssue,
      title: `Matched: ${name} → ${task.title}`,
      description: `ApplicationId: ${app.id}\nTaskId: ${task.id}`,
    });

    await notifyTeamServer(
      `🎉 **${name}** joined **${projectNameOf(projects, task.projectId)}** — rematched to #${task.number} "${task.title}" (stated trade: ${trade}) after a task became assignable`
    );

    rematched.push({
      applicationId: app.id,
      name,
      taskId: task.id,
      taskNumber: task.number,
      taskTitle: task.title,
      matchedIssueId: matchedIssue,
    });
  }

  return { rematched };
}

/**
 * Manual rematch trigger for Matching Queue / PMGT — same sweep SpecForge and ID publish already
 * run after assignable supply increases. Requires a signed-in session (any role); Matching Queue is
 * already gated to core roles in the SPA.
 */
router.post("/rematch-queued", requireSession, async (req, res) => {
  try {
    const result = await tryRematchQueuedApplicants();
    res.json({ ok: true, rematched: result.rematched, count: result.rematched.length });
  } catch (err) {
    console.error("[recruit] /rematch-queued failed:", err.message);
    res.status(500).json({ error: "Rematch sweep failed — please try again." });
  }
});

/**
 * POST /assign-by-email — core/admin places an open assignable task on a JS by verified email.
 * Finds or creates an Application for that email, then writes Matched: (same shape as Matching Queue).
 * Does not delete or reopen existing matches on other tasks; refuses if this task is already claimed.
 */
router.post("/assign-by-email", requireRole("PD", "PMGT", "ID", "CD"), async (req, res) => {
  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();
    const taskId = Number(req.body?.taskId);
    const nameIn = String(req.body?.name || "").trim();
    const tradeIn = String(req.body?.trade || "").trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "A valid email is required." });
    }
    if (!Number.isFinite(taskId) || taskId <= 0) {
      return res.status(400).json({ error: "taskId is required." });
    }

    const [projects, issues] = await Promise.all([
      listProjects({ offset: 0, count: 100 }),
      listIssues({ offset: 0, count: 300 }),
    ]);

    const task = issues.find((i) => i.id === taskId);
    if (!task) return res.status(404).json({ error: "Task not found." });
    if (RESERVED_PROJECT_IDS.has(task.projectId)) {
      return res.status(400).json({ error: "That id is not a delivery task." });
    }
    if (task.state !== "Open") return res.status(400).json({ error: "Task is not Open." });
    if (!isAssignable(task)) {
      return res.status(400).json({ error: "Task is not assignable yet (still waiting on a guided lesson)." });
    }

    const matches = issues.filter((i) => i.projectId === COHORT_PROJECT_ID && i.title.startsWith("Matched:"));
    const alreadyOnTask = matches.some((m) => Number(/TaskId:\s*(\d+)/.exec(m.description || "")?.[1]) === taskId);
    if (alreadyOnTask) {
      return res.status(409).json({ error: "That task is already assigned to someone." });
    }

    const apps = issues.filter((i) => i.projectId === COHORT_PROJECT_ID && i.title.startsWith("Application:"));
    const appsForEmail = apps.filter((a) =>
      (a.description || "").split("\n").some((line) => line.trim().toLowerCase() === `email: ${email}`)
    );
    // Same Gmail can have duplicate Application: rows from earlier tests — prefer one that is not
    // already Matched:, otherwise the newest by id. Never silently attach to a random older name.
    const alreadyMatchedAppIds = new Set(matches.map((m) => extractApplicationId(m.description)).filter(Boolean));
    let application =
      appsForEmail.find((a) => !alreadyMatchedAppIds.has(a.id)) ||
      [...appsForEmail].sort((a, b) => b.id - a.id)[0] ||
      null;

    const trade = tradeIn || taskMeta(task.description).trade || "Coding";
    const name = nameIn || application?.description?.match(/^Name:\s*(.+)$/m)?.[1]?.trim() || email.split("@")[0];

    if (!application) {
      const applicationId = await createIssue({
        projectId: COHORT_PROJECT_ID,
        title: `Application: ${name} — ${trade}`,
        description: [
          `Name: ${name}`,
          `Email: ${email}`,
          `Stated trade: ${trade}`,
          /^coding$/i.test(trade) ? `SkillLevel: js` : null,
          /^coding$/i.test(trade) ? `CodingFocus: both` : null,
          `OwnershipAck: true`,
          `OwnershipAckAt: ${new Date().toISOString()}`,
          `Note: created by core assign-by-email (${req.session?.email || "unknown"})`,
        ]
          .filter(Boolean)
          .join("\n"),
      });
      application = { id: applicationId, title: `Application: ${name} — ${trade}` };
    } else if (nameIn) {
      // Keep Placed list in sync with the name the matcher typed (e.g. "venky tenky" not stale "Phani").
      const nextDesc = String(application.description || "")
        .split("\n")
        .map((line) => (/^Name:\s*/i.test(line) ? `Name: ${nameIn}` : line))
        .join("\n");
      const hasName = /^Name:\s*/im.test(application.description || "");
      await updateIssueDescription(application.id, hasName ? nextDesc : `Name: ${nameIn}\n${application.description || ""}`);
      await updateIssueTitle(application.id, `Application: ${nameIn} — ${trade}`);
      application = { ...application, title: `Application: ${nameIn} — ${trade}`, description: hasName ? nextDesc : `Name: ${nameIn}\n${application.description || ""}` };
    }

    const matchedIssueId = await createIssue({
      projectId: COHORT_PROJECT_ID,
      title: `Matched: ${name} → ${task.title}`,
      description: [
        `ApplicationId: ${application.id}`,
        `TaskId: ${task.id}`,
        `Task: #${task.number} "${task.title}" in ${projectNameOf(projects, task.projectId)}`,
        `StatedTrade: ${trade}`,
        `AssignedByEmail: ${email}`,
        `— placed by core assign-by-email (${req.session?.email || "unknown"})`,
      ].join("\n"),
    });

    await notifyTeamServer(
      `🎉 **${name}** (<${email}>) assigned to **${projectNameOf(projects, task.projectId)}** #${task.number} "${task.title}" by core (${req.session?.email || "ops"})`
    );

    res.json({
      ok: true,
      email,
      name,
      applicationId: application.id,
      matchedIssueId,
      task: {
        id: task.id,
        number: task.number,
        title: task.title,
        project: projectNameOf(projects, task.projectId),
        projectId: task.projectId,
      },
    });
  } catch (err) {
    console.error("[recruit] /assign-by-email failed:", err.message);
    res.status(500).json({ error: "Couldn't assign by email — please try again." });
  }
});

export default router;
