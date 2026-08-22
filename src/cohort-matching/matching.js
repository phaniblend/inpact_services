/**
 * The one trade/skill matching predicate — used by MatchingQueue.jsx (Core Studio's manual
 * override/fallback view) AND server/recruit-router.js (automatic matching at application time).
 * Pure data-in/data-out, no React, no browser APIs — safe to import from server code directly.
 */
import {
  levelRank,
  isUnlocked,
  normalizeTechLevel,
  isBackendTechLevel,
} from "./skillLevels.js";

export const COHORT_PROJECT_ID = 2;
export const TEAM_OPS_PROJECT_ID = 3;
export const MODULE_LIBRARY_PROJECT_ID = 4;
export const RESERVED_PROJECT_IDS = new Set([COHORT_PROJECT_ID, TEAM_OPS_PROJECT_ID, MODULE_LIBRARY_PROJECT_ID]);

export const CORE_ONLY_TRADES = new Set(["product design"]);

export function isCoreOnlyTrade(trade) {
  return CORE_ONLY_TRADES.has((trade || "").toLowerCase());
}

export function extractApplicationId(description) {
  const m = /ApplicationId:\s*(\d+)/.exec(description || "");
  return m ? Number(m[1]) : null;
}

export function isAssignable(task) {
  return !/^NeedsTutorial:\s*true/m.test(task.description || "");
}

export function taskMeta(description) {
  const trade = /^Trade:\s*(.+)$/m.exec(description || "")?.[1]?.trim() || null;
  const techLevelRaw = /^TechLevel:\s*(.+)$/m.exec(description || "")?.[1]?.trim() || null;
  const techLevel = normalizeTechLevel(techLevelRaw) || techLevelRaw;
  const codingFocus = /^CodingFocus:\s*(.+)$/m.exec(description || "")?.[1]?.trim()?.toLowerCase() || null;
  return { trade, techLevel, codingFocus };
}

export function parseApplication(app) {
  return Object.fromEntries(
    (app.description || "")
      .split("\n")
      .map((l) => l.split(": "))
      .filter((parts) => parts.length >= 2)
      .map(([k, ...rest]) => [k.trim(), rest.join(": ").trim()]),
  );
}

function hasCompletedTechTask(name, matches, allIssues, techValue) {
  const want = normalizeTechLevel(techValue);
  return matches.some((m) => {
    const matchedName = /Matched: (.+?) →/.exec(m.title)?.[1];
    if (matchedName !== name) return false;
    const taskId = Number(/TaskId:\s*(\d+)/.exec(m.description || "")?.[1]);
    if (!taskId) return false;
    const task = allIssues.find((i) => i.id === taskId);
    if (!task || task.state === "Open") return false;
    return normalizeTechLevel(taskMeta(task.description).techLevel) === want;
  });
}

export function hasCompletedJsTask(name, matches, allIssues) {
  return hasCompletedTechTask(name, matches, allIssues, "js");
}

export function hasCompletedHttpApiTask(name, matches, allIssues) {
  return hasCompletedTechTask(name, matches, allIssues, "http-api");
}

export function latestAspirationLevel(name, appAspiration, aspirationIssues) {
  const forName = aspirationIssues
    .filter((i) => i.title === `Aspiration: ${name}`)
    .sort((a, b) => new Date(b.submitDate) - new Date(a.submitDate));
  const fromCheckIn = forName[0] ? /^Level:\s*(.+)$/m.exec(forName[0].description || "")?.[1]?.trim() : null;
  return fromCheckIn || appAspiration || null;
}

/**
 * FE ceiling: js-tier until TS/framework stated/aspired or a js task completed.
 * Kept for Matching Queue display / legacy callers.
 */
export function effectiveCeiling(info, { matches, allIssues, aspirationIssues }) {
  const name = info.Name;
  const statedLevel = info.SkillLevel;
  if (!statedLevel && !info.BeSkillLevel) return null;
  if (isBackendTechLevel(statedLevel) && !info.BeSkillLevel) {
    return effectiveBeCeiling(info, { matches, allIssues, aspirationIssues });
  }
  if (!statedLevel) return null;
  const aspiration = latestAspirationLevel(name, info.Aspiration, aspirationIssues);
  const unlocked =
    levelRank(statedLevel) >= levelRank("ts") ||
    levelRank(aspiration) >= levelRank("ts") ||
    hasCompletedJsTask(name, matches, allIssues);
  return unlocked ? "advanced" : "js";
}

/** BE ceiling: http-api until crud stated or an http-api task completed. */
export function effectiveBeCeiling(info, { matches, allIssues, aspirationIssues }) {
  const name = info.Name;
  const stated = info.BeSkillLevel || (isBackendTechLevel(info.SkillLevel) ? info.SkillLevel : null);
  if (!stated) return null;
  const aspiration = latestAspirationLevel(name, info.BeAspiration || info.Aspiration, aspirationIssues);
  const unlocked =
    levelRank(stated) >= levelRank("crud") ||
    levelRank(aspiration) >= levelRank("crud") ||
    hasCompletedHttpApiTask(name, matches, allIssues);
  return unlocked ? "crud" : "http-api";
}

/** Ceiling to use against a specific task's TechLevel. */
export function ceilingForTask(info, taskTechLevel, ctx) {
  if (isBackendTechLevel(taskTechLevel)) {
    return effectiveBeCeiling(info, ctx) || "http-api";
  }
  return effectiveCeiling(info, ctx) || "js";
}

export function matchedTaskIds(matches) {
  return new Set(
    (matches || [])
      .map((m) => Number(/TaskId:\s*(\d+)/.exec(m.description || "")?.[1]))
      .filter(Boolean),
  );
}

function looksBackendTask(t) {
  const meta = taskMeta(t.description);
  if (meta.codingFocus === "backend") return true;
  if (meta.codingFocus === "frontend") return false;
  if (isBackendTechLevel(meta.techLevel)) return true;
  const hay = `${t.title} ${t.description || ""}`.toLowerCase();
  return /\b(api|endpoint|rest|sql|postgres|middleware|jwt|schema|crud|backend|server)\b/.test(hay);
}

export function tasksForApplicant(info, assignableTasks, { matches, allIssues, aspirationIssues }) {
  const trade = info["Stated trade"];
  const focus = String(info.CodingFocus || info["Coding focus"] || "both").toLowerCase();
  const ctx = { matches, allIssues, aspirationIssues };
  const taken = matchedTaskIds(matches);
  return assignableTasks.filter((t) => {
    if (taken.has(t.id)) return false;
    const meta = taskMeta(t.description);
    if (!meta.trade) return true;
    if (trade && meta.trade.toLowerCase() !== trade.toLowerCase()) return false;

    const be = looksBackendTask(t);
    if (focus === "frontend" && be) return false;
    if (focus === "backend" && !be) return false;

    if (meta.techLevel) {
      const ceiling = ceilingForTask(info, meta.techLevel, ctx);
      // Backend applicants with only BeSkillLevel and no FE SkillLevel can't take FE-gated tasks
      if (!isBackendTechLevel(meta.techLevel) && !info.SkillLevel && info.BeSkillLevel) return false;
      if (isBackendTechLevel(meta.techLevel) && !info.BeSkillLevel && !isBackendTechLevel(info.SkillLevel)) {
        // frontend-only applicant (FE SkillLevel, no BE) — skip BE tasks
        if (focus === "frontend") return false;
        // both without BE skill: treat as http-api floor only if they said both but forgot BE —
        // require BeSkillLevel when focus is backend/both for BE tasks
        if (focus === "backend" || focus === "both") return false;
      }
      return isUnlocked(meta.techLevel, ceiling);
    }
    return true;
  });
}

export function bestTaskMatch(info, { tasks, matches, allIssues, aspirationIssues }) {
  const eligible = tasksForApplicant(info, tasks, { matches, allIssues, aspirationIssues });
  if (eligible.length === 0) return null;
  const focus = String(info.CodingFocus || info["Coding focus"] || "").toLowerCase();
  if (focus !== "frontend" && focus !== "backend") return eligible[0];

  const preferred =
    focus === "backend" ? eligible.find(looksBackendTask) : eligible.find((t) => !looksBackendTask(t));
  return preferred || eligible[0];
}
