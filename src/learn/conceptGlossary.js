import reactTs from "./glossary/react-ts.json";
import reactJs from "./glossary/react-js.json";
import reactTsExtendedDeepDives from "../../content/react-ts/000_deep_dives.json";

const PACKS = {
  "react-ts": reactTs,
  "react-js": reactJs,
};

/**
 * React · TS extended dives: `content/react-ts/000_deep_dives.json`. Keys like `001_Counter_App` → lessonNum 1.
 * Optional `introductionStepId` (default `step1`) registers the dive on that step; other steps get the
 * same dive via `byLesson` fallback — unless `showDeepDiveInIntro` is true (then only the Lesson intro shows it).
 * Per-step dives from the engine: pass `inlineStepConcept` from a question node with `deepDive` — that step uses
 * only that content (no extended JSON merge for that step), so the button does not repeat on every step.
 */
const { REACT_TS_EXTENDED_BY_LESSON_AND_STEP, REACT_TS_EXTENDED_BY_LESSON, REACT_TS_INTRO_DEEP_DIVE_BY_LESSON } =
  (() => {
    /** @type {Record<string, { id: string, label: string, deepDive: object }>} */
    const map = Object.create(null);
    /** @type {Record<number, { id: string, label: string, deepDive: object }>} */
    const byLesson = Object.create(null);
    /** @type {Record<number, { id: string, label: string, deepDive: object }>} */
    const introByLesson = Object.create(null);
    for (const [key, entry] of Object.entries(reactTsExtendedDeepDives || {})) {
      const m = String(key).match(/^0*(\d+)_/);
      if (!m || !entry?.deepDive) continue;
      const n = Number(m[1]);
      const item = {
        id: key,
        label: entry.label || key,
        deepDive: entry.deepDive,
      };
      if (entry.showDeepDiveInIntro === true) {
        introByLesson[n] = item;
        continue;
      }
      const stepId =
        typeof entry.introductionStepId === "string" && entry.introductionStepId.trim()
          ? entry.introductionStepId.trim()
          : "step1";
      map[`${n}::${stepId}`] = item;
      byLesson[n] = item;
    }
    return {
      REACT_TS_EXTENDED_BY_LESSON_AND_STEP: map,
      REACT_TS_EXTENDED_BY_LESSON: byLesson,
      REACT_TS_INTRO_DEEP_DIVE_BY_LESSON: introByLesson,
    };
  })();

/**
 * @param {string} track
 * @param {number} lessonNum
 * @param {string} stepId
 * @param {string[]|undefined} nodeIntroduces - from step JSON `introducesConcepts`, copied to node
 * @param {{ label?: string, deepDive: Record<string, string> }|null|undefined} inlineStepConcept - from engine question node `deepDive` (+ optional `deepDiveLabel` / `title` as label)
 * @returns {{ id: string, label: string, deepDive: Record<string, string> }[]}
 */
export function getDeepDiveConceptsForStep(track, lessonNum, stepId, nodeIntroduces, inlineStepConcept) {
  const chosenPack = PACKS[track];
  const packs = chosenPack ? [chosenPack] : Object.values(PACKS).filter(Boolean);
  if (!packs.length) return [];

  const pNum = lessonNum == null ? null : Number(lessonNum);
  const ids = new Set();
  for (const pack of packs) {
    for (const row of pack.introductions || []) {
      const rowP = row.lessonNum == null ? null : Number(row.lessonNum);
      if (pNum != null && rowP === pNum && row.stepId === stepId) {
        ids.add(row.conceptId);
      }
    }
  }
  for (const id of nodeIntroduces || []) {
    if (typeof id === "string" && id.trim()) ids.add(id.trim());
  }

  const inlineDd = inlineStepConcept?.deepDive ?? inlineStepConcept?.deep_dive;
  const hasInlineDeepDive = Boolean(
    inlineDd && typeof inlineDd === "object" && !Array.isArray(inlineDd)
  );

  const out = [];
  // When the engine defines `deepDive` on the step, use that as the single source — skip glossary
  // introductions for this step (they often duplicate the same concept, e.g. createAsyncThunk + JSON).
  if (!hasInlineDeepDive) {
    for (const id of ids) {
      const c = packs.map((p) => p?.concepts?.[id]).find(Boolean);
      if (!c?.deepDive) continue;
      out.push({
        id,
        label: c.label || id,
        deepDive: c.deepDive,
      });
    }
  }

  if (hasInlineDeepDive) {
    const id = `inline-${pNum != null && !Number.isNaN(Number(pNum)) ? pNum : "x"}-${stepId || "step"}`;
    if (!out.some((o) => o.id === id)) {
      out.push({
        id,
        label: inlineStepConcept.label || inlineStepConcept.deepDiveLabel || "Deep dive",
        deepDive: inlineDd,
      });
    }
  } else if (track === "react-ts" && pNum != null && stepId) {
    let ext = REACT_TS_EXTENDED_BY_LESSON_AND_STEP[`${pNum}::${stepId}`];
    if (!ext?.deepDive) ext = REACT_TS_EXTENDED_BY_LESSON[pNum];
    if (ext?.deepDive && !out.some((o) => o.id === ext.id)) {
      out.push(ext);
    }
  }

  return dedupeDeepDiveConceptsByContent(out);
}

/** Same conceptual guide attached twice (glossary + extended JSON, etc.) → one button. Prefer `inline-*` ids. */
function deepDiveContentKey(dd) {
  if (!dd || typeof dd !== "object") return null;
  try {
    return JSON.stringify(dd, Object.keys(dd).sort());
  } catch {
    return null;
  }
}

function dedupeDeepDiveConceptsByContent(items) {
  if (!Array.isArray(items) || items.length < 2) return items;
  const bestByKey = new Map();
  for (const item of items) {
    const k = deepDiveContentKey(item?.deepDive);
    if (k == null) continue;
    const prev = bestByKey.get(k);
    if (!prev) {
      bestByKey.set(k, item);
    } else {
      const prefer =
        String(item.id).startsWith("inline-") && !String(prev.id).startsWith("inline-") ? item : prev;
      bestByKey.set(k, prefer);
    }
  }
  const emitted = new Set();
  const result = [];
  for (const item of items) {
    const k = deepDiveContentKey(item?.deepDive);
    if (k == null) {
      result.push(item);
      continue;
    }
    if (emitted.has(k)) continue;
    emitted.add(k);
    result.push(bestByKey.get(k));
  }
  return result;
}

/** Lowercase alphanumerics only — compare lesson titles to extended JSON keys like `029_useDebounce`. */
function normalizedLessonTitleSlug(s) {
  return String(s ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

/**
 * Lesson-level deep dive (intro surfaces). Opt-in: `showDeepDiveInIntro: true` in `000_deep_dives.json`.
 * Resolves by `lessonNum` first, then by matching `lessonTitle` to the key suffix (e.g. useDebounce ↔ 029_useDebounce).
 *
 * @param {string} track
 * @param {number|null|undefined} lessonNum - from engine config when known
 * @param {string|null|undefined} lessonTitle - e.g. list title or intro.title (covers list index ≠ lessonNum)
 * @returns {{ id: string, label: string, deepDive: Record<string, string> } | null}
 */
export function getIntroDeepDiveConcept(track, lessonNum, lessonTitle) {
  if (track !== "react-ts") return null;
  const pNum = lessonNum == null || lessonNum === "" ? null : Number(lessonNum);
  if (pNum != null && !Number.isNaN(pNum)) {
    const byNum = REACT_TS_INTRO_DEEP_DIVE_BY_LESSON[pNum];
    if (byNum?.deepDive) return byNum;
  }
  const norm = normalizedLessonTitleSlug(lessonTitle);
  if (!norm) return null;
  for (const [key, entry] of Object.entries(reactTsExtendedDeepDives || {})) {
    if (entry.showDeepDiveInIntro !== true || !entry?.deepDive) continue;
    const km = String(key).match(/^0*\d+_(.+)$/);
    if (!km) continue;
    const slug = km[1].toLowerCase().replace(/[^a-z0-9]+/g, "");
    if (!slug) continue;
    if (slug === norm || norm.includes(slug) || slug.includes(norm)) {
      return {
        id: key,
        label: entry.label || key,
        deepDive: entry.deepDive,
      };
    }
  }
  return null;
}

export function glossarySupportsDeepDive(track) {
  return Boolean(PACKS[track]?.concepts && Object.keys(PACKS[track].concepts).length > 0);
}
