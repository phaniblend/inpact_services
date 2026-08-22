/**
 * Shared coding skill-level taxonomy — Apply, SpecForge task tags, and Matching Queue agree here.
 * Only the Coding trade uses this; other trades stay ungated.
 *
 * Two parallel ladders:
 *   FE  — language/UI rungs (html-css → js → ts → framework)
 *   BE  — language-agnostic capability (http-api → crud)  [questionnaire 2026-08: both_tiers]
 *
 * Task-side TechLevel uses the same value strings. "advanced" remains an FE alias for framework rank.
 */
export const SKILL_LEVELS = [
  { value: "none", label: "None yet", blurb: "Never written code — you'd start with HTML/CSS fundamentals." },
  { value: "html-css", label: "HTML & CSS", blurb: "I can build a static page layout." },
  { value: "js", label: "JavaScript", blurb: "I can write functions, handle events, work with the DOM or basic React." },
  { value: "ts", label: "TypeScript", blurb: "I've used type annotations, interfaces, generics." },
  { value: "framework", label: "Framework-fluent", blurb: "Comfortable in React/Angular/Vue beyond the basics." },
];

/** Language-agnostic BE rungs — shown when CodingFocus is backend or both. */
export const BE_SKILL_LEVELS = [
  {
    value: "http-api",
    label: "HTTP APIs / REST",
    blurb: "I can design or call request/response endpoints (any language).",
  },
  {
    value: "crud",
    label: "CRUD + persistence",
    blurb: "I can build resource APIs with validation and a real store (memory/DB).",
  },
];

export const TASK_TECH_LEVELS = [
  { value: "html-css", label: "HTML/CSS", side: "frontend" },
  { value: "js", label: "JavaScript", side: "frontend" },
  { value: "ts", label: "TypeScript", side: "frontend" },
  { value: "advanced", label: "Advanced", side: "frontend" },
  { value: "http-api", label: "HTTP APIs / REST", side: "backend" },
  { value: "crud", label: "CRUD + persistence", side: "backend" },
];

/** Matching-floor tags stored as `TechLevel:` on tasks. SpecForge/publish set these —
 * PD Studio does not edit them (product designers are not asked to pick tech). */

const RANK = {
  none: 0,
  "html-css": 1,
  js: 2,
  "http-api": 2,
  ts: 3,
  advanced: 4,
  framework: 4,
  crud: 4,
};

/** Normalize human / legacy TechLevel strings into canonical values. */
export function normalizeTechLevel(raw) {
  const s = String(raw || "")
    .trim()
    .toLowerCase();
  if (!s) return null;
  if (s === "javascript" || s === "js") return "js";
  if (s === "typescript" || s === "ts") return "ts";
  if (s === "html/css" || s === "html-css" || s === "html & css") return "html-css";
  if (s === "http-api" || s === "http api" || s === "http apis" || s === "http apis / rest" || s === "rest")
    return "http-api";
  if (s === "crud" || s === "crud + persistence" || s === "crud-persistence") return "crud";
  if (s === "advanced" || s === "framework" || s === "framework-fluent") return s === "framework" ? "framework" : "advanced";
  return s;
}

export function isBackendTechLevel(level) {
  const n = normalizeTechLevel(level);
  return n === "http-api" || n === "crud";
}

export function isFrontendTechLevel(level) {
  const n = normalizeTechLevel(level);
  return n === "html-css" || n === "js" || n === "ts" || n === "advanced" || n === "framework";
}

export function levelRank(level) {
  const n = normalizeTechLevel(level);
  return RANK[n] ?? 0;
}

/** A task's tech_level is unlocked for an applicant at `effectiveLevel` if the applicant's rank
 * meets or exceeds the task's. Non-Coding tasks (no techLevel at all) are always unlocked. */
export function isUnlocked(taskTechLevel, effectiveLevel) {
  if (!taskTechLevel) return true;
  return levelRank(effectiveLevel) >= levelRank(taskTechLevel);
}

export function skillLabel(value) {
  const n = normalizeTechLevel(value) || value;
  return (
    SKILL_LEVELS.find((s) => s.value === n)?.label ||
    BE_SKILL_LEVELS.find((s) => s.value === n)?.label ||
    TASK_TECH_LEVELS.find((s) => s.value === n)?.label ||
    value
  );
}

/** Infer default TechLevel for a Coding task from title/description (PD never picks this). */
export function inferCodingTechLevel({ title = "", description = "", focus = "" } = {}) {
  const hay = `${title} ${description} ${focus}`.toLowerCase();
  const be =
    focus === "backend" ||
    /\b(api|endpoint|rest|sql|postgres|middleware|jwt|schema|crud|backend|server|persist)\b/.test(hay);
  if (!be) return "js";
  if (
    /\b(crud|persist|database|postgres|sqlite|overlap|conflict|derived|overdue|validat|held|applied|filled|stale|paid)\b/.test(
      hay,
    )
  ) {
    return "crud";
  }
  return "http-api";
}
