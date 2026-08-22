import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "ENG LEADERSHIP #5", title: "On-call & incident culture", body: `On-call rotation design, escalation paths, alert fatigue, sustainable reliability.`, usecase: "Sustainable ops." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["On-call rotation", "Escalation", "Alert fatigue", "Sustainable"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "How design on-call rotation? What causes alert fatigue? How make reliability sustainable?", answer_keywords: ["on-call", "rotation", "escalation", "alert fatigue", "sustainable"], seed_code: `// Rotation: primary + secondary; handoff doc
// Alert fatigue: too many, noisy; tune and consolidate
// Sustainable: error budget, blameless, reduce toil`, feedback_correct: "✅ Rotation with backup; reduce noise for fatigue; error budget + blameless.", feedback_wrong: "On-call design; alert fatigue; sustainable reliability.", expected: "On-call culture" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "EL-05", title: "On-call & incident culture", shortName: "EL — ONCALL" });
