/**
 * Global lesson counts per track/category — used for all lessons (language/track and algo/language).
 * Single source of truth so UI shows category-wise lesson counts.
 *
 * Use getLessonCount(track, options) for one track; use getCategoryCounts(options) for the full list.
 */

import { ALGO_AI_NAMES } from "./ai-lessons/algoAiNames.js";
import { JS_FUNDAMENTALS_CURRICULUM } from "./engines/javascript/inpact_jsf_index.js";
import { TS_FUNDAMENTALS_CURRICULUM } from "./engines/typescript/inpact_tsf_index.js";
import { NODE_FUNDAMENTALS_CURRICULUM } from "./engines/node/inpact_nodef_index.js";
import {
  JS_INTERVIEW_CURRICULUM,
  TS_INTERVIEW_CURRICULUM,
  NODE_INTERVIEW_CURRICULUM,
} from "./engines/interview/interviewEngines.jsx";
import { EXPRESS_FUNDAMENTALS_CURRICULUM } from "./engines/express/inpact_expf_index.js";
import { CSS_CURRICULUM } from "./engines/css/inpact_css_index.js";
import { FUNDA_LESSON_COUNT } from "./angularFundaLessons.js";
import { MOBILE_ANGULAR_LESSON_COUNT } from "./mobileAngularLessons.js";

const ANGULAR_EXTRA_LESSONS = 14; // QB01–QB05 (QuickBite) + ANG01–ANG09 before the shared React list

/** React · JS and React · TS share the blueprint length (must match LESSON_LIST.length in LandingPage). */
const REACT_TS_LESSON_COUNT = 151;

/** Fallback when reactListLength not provided (e.g. for category summary). */
const DEFAULT_REACT_LIST_LENGTH = REACT_TS_LESSON_COUNT;

/**
 * @param {string} track - Track id (e.g. 'react-js', 'algo-ts', 'algorithms')
 * @param {{ reactListLength?: number }} [options] - Pass LESSON_LIST.length to keep in sync with LandingPage
 * @returns {number}
 */
export function getLessonCount(track, options = {}) {
  const reactLen = options.reactListLength ?? DEFAULT_REACT_LIST_LENGTH;
  const reactCount = reactLen;

  switch (track) {
    case "react-js":
    case "react-ts":
    case "vue":
      return reactCount;
    case "angular":
      return ANGULAR_EXTRA_LESSONS + reactCount + FUNDA_LESSON_COUNT;
    case "mobile-angular":
      return MOBILE_ANGULAR_LESSON_COUNT;
    case "algorithms":
      return 0;
    case "algo-js":
    case "algo-ts":
    case "algo-python":
    case "algo-java":
      return ALGO_AI_NAMES.length;
    case "js":
      return JS_FUNDAMENTALS_CURRICULUM.length + JS_INTERVIEW_CURRICULUM.length;
    case "ts":
      return TS_FUNDAMENTALS_CURRICULUM.length + TS_INTERVIEW_CURRICULUM.length;
    case "node":
      return NODE_FUNDAMENTALS_CURRICULUM.length + NODE_INTERVIEW_CURRICULUM.length;
    case "express":
      return EXPRESS_FUNDAMENTALS_CURRICULUM.length;
    case "css":
      return CSS_CURRICULUM.length;
    default:
      return 0;
  }
}

/** Human-readable labels for each track (for category-wise display). */
export const TRACK_LABELS = {
  "react-js": "React · JS",
  "react-ts": "React · TS",
  angular: "Angular",
  "mobile-angular": "Mobile Angular",
  vue: "Vue",
  algorithms: "Algorithms",
  "algo-js": "Algo · JS",
  "algo-ts": "Algo · TS",
  "algo-python": "Algo · Python",
  "algo-java": "Algo · Java",
  js: "JavaScript",
  ts: "TypeScript",
  node: "Node",
  express: "Express",
  css: "CSS",
};

/** Order of tracks for category-wise summary — landing shows React · TS only (algorithms integrated but hidden). */
const CATEGORY_ORDER = ["react-ts"];

/**
 * Returns category-wise lesson counts for all tracks (including algos).
 * @param {{ reactListLength?: number }} [options]
 * @returns {{ id: string, label: string, count: number }[]}
 */
export function getCategoryCounts(options = {}) {
  return CATEGORY_ORDER.map((id) => ({
    id,
    label: TRACK_LABELS[id] ?? id,
    count: getLessonCount(id, options),
  }));
}
