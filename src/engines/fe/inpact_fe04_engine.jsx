import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "FRONTEND ENG #4", title: "Micro-frontends", body: `Module Federation, iframe approach, web components, shared dependencies, team autonomy.`, usecase: "Multiple teams, one product." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Module Federation", "Iframe vs MF", "Shared deps and versioning"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "What is Module Federation? When iframe vs MF? How handle shared React version?", answer_keywords: ["Module Federation", "iframe", "shared", "version", "micro-frontend"], seed_code: `// MF: runtime integration; shared singleton deps
// Iframe: isolation, but comms and layout cost
// Shared: single version or compatible range`, feedback_correct: "✅ MF = runtime share; iframe = isolation; shared deps strategy.", feedback_wrong: "Module Federation; iframe; shared dependencies.", expected: "Micro-frontends" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "FE-04", title: "Micro-frontends", shortName: "FE — MICRO" });
