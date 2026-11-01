/**
 * Ensure every open FE Coding task on LIVE products (MiniERP / SentinelPOS / RouteMatrix /
 * BatchCraft) is Matched: to the given aspirant email. Talks to the sibling OneDev service
 * through onedev-client (ONEDEV_INTERNAL_URL on Railway).
 */
import { listAllIssues, listProjects, createIssue } from "./onedev-client.js";
import {
  COHORT_PROJECT_ID,
  LIVE_PRODUCT_IDS,
  isAssignable,
  taskMeta,
  extractApplicationId,
} from "../src/cohort-matching/matching.js";

function projectNameOf(projects, id) {
  return projects.find((p) => p.id === id)?.name || `project-${id}`;
}

function matchCountForEmail(issues, email) {
  const needle = String(email || "").trim().toLowerCase();
  const appIds = new Set(
    issues
      .filter(
        (i) =>
          i.projectId === COHORT_PROJECT_ID &&
          i.title.startsWith("Application:") &&
          (i.description || "")
            .split("\n")
            .some((line) => line.trim().toLowerCase() === `email: ${needle}`)
      )
      .map((i) => i.id)
  );
  return issues.filter((i) => {
    if (i.projectId !== COHORT_PROJECT_ID || !i.title.startsWith("Matched:")) return false;
    return appIds.has(Number(/ApplicationId:\s*(\d+)/.exec(i.description || "")?.[1]));
  }).length;
}

function isFrontendCoding(task) {
  const meta = taskMeta(task.description);
  if ((meta.trade || "").toLowerCase() !== "coding") return false;
  const focus = (meta.codingFocus || "").toLowerCase();
  // Live FE board: explicit frontend, or "both", or unset CodingFocus on a Coding task
  // that already passed isAssignable (older MiniERP rows).
  return !focus || focus === "frontend" || focus === "both" || focus.includes("front");
}

async function assignLiveFeToEmail({ email, name, projects, issues, log, force }) {
  const needle = String(email).trim().toLowerCase();

  const matches = issues.filter(
    (i) => i.projectId === COHORT_PROJECT_ID && i.title.startsWith("Matched:")
  );
  const claimedTaskIds = new Set(
    matches
      .map((m) => Number(/TaskId:\s*(\d+)/.exec(m.description || "")?.[1]))
      .filter((n) => Number.isFinite(n) && n > 0)
  );

  const feTasks = issues.filter((i) => {
    if (!LIVE_PRODUCT_IDS.has(i.projectId)) return false;
    if (i.state && i.state !== "Open") return false;
    if (!isAssignable(i)) return false;
    return isFrontendCoding(i);
  });

  log.push(
    `LIVE FE Coding open assignable: ${feTasks.length} across ${[...LIVE_PRODUCT_IDS].join(",")}`
  );

  const apps = issues.filter(
    (i) => i.projectId === COHORT_PROJECT_ID && i.title.startsWith("Application:")
  );
  const appsForEmail = apps.filter((a) =>
    (a.description || "")
      .split("\n")
      .some((line) => line.trim().toLowerCase() === `email: ${needle}`)
  );
  const alreadyMatchedAppIds = new Set(
    matches.map((m) => extractApplicationId(m.description)).filter(Boolean)
  );
  let application =
    appsForEmail.find((a) => !alreadyMatchedAppIds.has(a.id)) ||
    [...appsForEmail].sort((a, b) => b.id - a.id)[0] ||
    null;

  if (!application) {
    const applicationId = await createIssue({
      projectId: COHORT_PROJECT_ID,
      title: `Application: ${name} — Coding`,
      description: [
        `Name: ${name}`,
        `Email: ${needle}`,
        `Stated trade: Coding`,
        `SkillLevel: js`,
        `CodingFocus: frontend`,
        `OwnershipAck: true`,
        `OwnershipAckAt: ${new Date().toISOString()}`,
        `Note: bulk LIVE FE assign via server/ensure-fe-board.js`,
      ].join("\n"),
    });
    application = { id: applicationId, title: `Application: ${name} — Coding` };
    log.push(`Created Application #${applicationId}`);
  } else {
    log.push(`Reusing Application #${application.id}`);
  }

  let assigned = 0;
  let skipped = 0;
  for (const task of feTasks) {
    if (claimedTaskIds.has(task.id) && !force) {
      // Already on this email? Count as skip. On someone else? skip unless force.
      skipped++;
      continue;
    }
    // If force and already claimed by us, don't double-match.
    const alreadyOurs = matches.some((m) => {
      const tid = Number(/TaskId:\s*(\d+)/.exec(m.description || "")?.[1]);
      const appId = Number(/ApplicationId:\s*(\d+)/.exec(m.description || "")?.[1]);
      return tid === task.id && appId === application.id;
    });
    if (alreadyOurs) {
      skipped++;
      continue;
    }

    await createIssue({
      projectId: COHORT_PROJECT_ID,
      title: `Matched: ${name} → ${task.title}`,
      description: [
        `ApplicationId: ${application.id}`,
        `TaskId: ${task.id}`,
        `Task: #${task.number || task.id} "${task.title}" in ${projectNameOf(projects, task.projectId)}`,
        `StatedTrade: Coding`,
        `AssignedByEmail: ${needle}`,
        `— placed by server/ensure-fe-board.js (LIVE products)`,
      ].join("\n"),
    });
    claimedTaskIds.add(task.id);
    assigned++;
    log.push(`  ✓ #${task.number || task.id} [${projectNameOf(projects, task.projectId)}] ${task.title}`);
  }
  log.push(`Assigned ${assigned}, skipped ${skipped}`);
  return { assigned, skipped, applicationId: application.id, feTaskCount: feTasks.length };
}

/**
 * @param {{ email?: string, name?: string, minMatches?: number, force?: boolean }} opts
 */
export async function ensureFeBoard(opts = {}) {
  const email = String(opts.email || process.env.ENSURE_FE_ASSIGN_EMAIL || "bsit.setty@gmail.com")
    .trim()
    .toLowerCase();
  const name = opts.name || 'Venkat "Phani" Bhushan';
  // Default low so a single BatchCraft match never blocks filling the rest of the live FE board.
  const minMatches = Number(
    opts.minMatches != null ? opts.minMatches : process.env.ENSURE_FE_MIN_MATCHES || 1
  );
  const force = Boolean(opts.force);
  const log = [];

  const [projects, issues] = await Promise.all([
    listProjects({ offset: 0, count: 100 }),
    listAllIssues(),
  ]);

  const before = matchCountForEmail(issues, email);
  log.push(`${email} had ${before} Matched: row(s)`);

  // Always try to fill unclaimed LIVE FE tasks; only skip when already at/above a high bar
  // AND every LIVE FE task is already claimed (handled inside assign via skipped).
  const target = Math.max(minMatches, 12);
  if (before >= target && !force) {
    // Still run assign — it will no-op on already-claimed rows and pick up any new open FE tasks.
    log.push(`have ${before} (≥ soft target ${target}) — still sweeping unclaimed LIVE FE`);
  }

  const assignResult = await assignLiveFeToEmail({
    email,
    name,
    projects,
    issues,
    log,
    force,
  });

  const afterIssues = await listAllIssues();
  const after = matchCountForEmail(afterIssues, email);
  log.push(`${email} now has ${after} Matched: row(s)`);

  return {
    ok: true,
    email,
    matches: after,
    matchesBefore: before,
    createdTasks: 0,
    ...assignResult,
    log,
  };
}
