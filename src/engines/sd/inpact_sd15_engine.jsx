import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "SYSTEM DESIGN #15", title: "Designing data-intensive apps", body: `Batch vs stream processing, Lambda architecture, Kappa architecture, Flink/Spark.`, usecase: "Big data pipelines." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Batch vs stream", "Lambda vs Kappa", "Flink/Spark concepts"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Batch vs stream processing — when each? What is Lambda vs Kappa architecture? What is Flink good for?", answer_keywords: ["batch", "stream", "Lambda", "Kappa", "Flink", "Spark"], seed_code: `// Batch: bounded, high throughput; stream: unbounded, low latency
// Lambda: batch + speed layer; Kappa: single stream layer
// Flink: true stream processing; Spark: micro-batch`, feedback_correct: "✅ Batch bounded; stream unbounded; Lambda two-tier; Kappa stream-only; Flink streaming.", feedback_wrong: "Batch vs stream; Lambda/Kappa; Flink for streaming.", expected: "Data-intensive" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "SD-15", title: "Designing data-intensive apps", shortName: "SD — DATA" });
