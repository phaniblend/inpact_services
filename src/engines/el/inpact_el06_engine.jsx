import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "ENG LEADERSHIP #6", title: "Engineering metrics", body: `DORA metrics (deploy frequency, lead time, MTTR, change failure rate), velocity traps.`, usecase: "Measuring what matters." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["DORA metrics", "Lead time, MTTR", "Velocity traps"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "What are the four DORA metrics? Why is raw velocity a trap? What is change failure rate?", answer_keywords: ["DORA", "deploy frequency", "lead time", "MTTR", "velocity"], seed_code: `// DORA: deploy freq, lead time, MTTR, change failure rate
// Velocity trap: story points gamified; focus outcomes
// Change failure rate: % deploys causing incidents`, feedback_correct: "✅ DORA four; velocity trap = points not outcomes; change failure rate.", feedback_wrong: "DORA metrics; velocity traps; change failure rate.", expected: "Engineering metrics" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "EL-06", title: "Engineering metrics", shortName: "EL — METRICS" });
