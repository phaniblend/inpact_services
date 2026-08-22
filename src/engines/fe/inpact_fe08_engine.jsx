import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "FRONTEND ENG #8", title: "Browser compatibility", body: `Feature detection vs UA sniffing, polyfills, Baseline, caniuse, Browserslist.`, usecase: "Support matrix and progressive enhancement." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Feature detection", "Polyfills", "Browserslist and caniuse"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Feature detection vs UA sniffing — why prefer one? What is Browserslist for? How use caniuse?", answer_keywords: ["feature detection", "polyfill", "Browserslist", "caniuse", "UA"], seed_code: `// Feature: 'fetch' in window; UA: fragile, spoofable
// Browserslist: target browsers for babel/autoprefixer
// caniuse: check support; Baseline: minimal set`, feedback_correct: "✅ Feature detection over UA; Browserslist for tooling; caniuse for support.", feedback_wrong: "Feature detection; Browserslist; caniuse.", expected: "Browser compatibility" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "FE-08", title: "Browser compatibility", shortName: "FE — COMPAT" });
