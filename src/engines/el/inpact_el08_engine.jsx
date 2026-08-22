import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "ENG LEADERSHIP #8", title: "Staff engineer patterns", body: `Glue work, tech strategy, influence without authority, writing engineering vision docs.`, usecase: "Senior impact beyond code." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Glue work", "Tech strategy", "Influence without authority", "Vision docs"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "What is glue work? How do staff engineers influence without authority? What goes in an engineering vision doc?", answer_keywords: ["glue work", "staff", "influence", "vision", "strategy"], seed_code: `// Glue work: unblocking, aligning, coordinating
// Influence: consensus, writing, leading by example; not org chart
// Vision doc: where we're going, why, principles`, feedback_correct: "✅ Glue = unblock/align; influence via consensus and writing; vision = direction + why.", feedback_wrong: "Glue work; influence without authority; vision docs.", expected: "Staff patterns" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "EL-08", title: "Staff engineer patterns", shortName: "EL — STAFF" });
