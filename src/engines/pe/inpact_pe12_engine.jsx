import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "PRODUCTION ENG #12", title: "Observability at scale", body: `Distributed tracing sampling, log aggregation, metric cardinality, alerting fatigue.`, usecase: "Understanding production at scale." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Tracing and sampling", "Log aggregation", "Cardinality and alerting"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Why sample traces? What causes metric cardinality explosion? How reduce alert fatigue?", answer_keywords: ["sampling", "trace", "cardinality", "alert", "fatigue"], seed_code: `// Sampling: 1% or tail-based; control cost
// Cardinality: unique label combos; avoid user_id in labels
// Alert fatigue: fewer, actionable, runbooks`, feedback_correct: "✅ Sampling for cost; cardinality from high-card labels; fewer actionable alerts.", feedback_wrong: "Trace sampling; cardinality; alert fatigue.", expected: "Observability" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "PE-12", title: "Observability at scale", shortName: "PE — OBSERVABILITY" });
