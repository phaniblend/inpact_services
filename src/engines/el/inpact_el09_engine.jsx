import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "ENG LEADERSHIP #9", title: "Legacy code & rewrites", body: `Strangler fig pattern, characterisation tests, rewrite vs refactor decision.`, usecase: "Evolving legacy systems." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Strangler fig", "Characterisation tests", "Rewrite vs refactor"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "What is the strangler fig pattern? What are characterisation tests? When rewrite vs refactor?", answer_keywords: ["strangler", "characterisation", "rewrite", "refactor", "legacy"], seed_code: `// Strangler: new system grows around old; route by route
// Characterisation tests: capture current behaviour before changing
// Refactor when possible; rewrite when cost of change > replacement`, feedback_correct: "✅ Strangler = incremental replace; char tests = lock behaviour; refactor first.", feedback_wrong: "Strangler fig; characterisation tests; rewrite vs refactor.", expected: "Legacy & rewrites" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "EL-09", title: "Legacy code & rewrites", shortName: "EL — LEGACY" });
