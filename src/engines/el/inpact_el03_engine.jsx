import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "ENG LEADERSHIP #3", title: "Technical roadmapping", body: `OKRs for engineering, now/next/later framework, dependency mapping, stakeholder alignment.`, usecase: "Direction and prioritisation." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["OKRs for engineering", "Now/next/later", "Dependency mapping"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "How do you write good engineering OKRs? What is now/next/later? How map dependencies?", answer_keywords: ["OKR", "roadmap", "now next later", "dependency", "stakeholder"], seed_code: `// OKRs: outcome-focused; measurable; 3-5 per quarter
// Now: current sprint; next: backlog; later: pipeline
// Dependency map: who blocks whom; critical path`, feedback_correct: "✅ OKRs outcome + measurable; now/next/later; dependency map.", feedback_wrong: "OKRs; now/next/later; dependency mapping.", expected: "Technical roadmapping" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "EL-03", title: "Technical roadmapping", shortName: "EL — ROADMAP" });
