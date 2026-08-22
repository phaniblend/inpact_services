import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "PRODUCTION ENG #8", title: "Cost optimisation", body: `Right-sizing, spot instances, reserved capacity, storage tiering, idle resource detection.`, usecase: "Lower cloud spend." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Right-sizing", "Spot and reserved", "Storage tiering"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "What is right-sizing? When use spot instances? How detect idle resources?", answer_keywords: ["right-sizing", "spot", "reserved", "idle", "cost"], seed_code: `// Right-size: match instance to actual usage
// Spot: fault-tolerant workloads; cheap, can be interrupted
// Idle: CloudWatch, tags, scheduled shutdown`, feedback_correct: "✅ Right-size to usage; spot for interruptible; monitor and tag for idle.", feedback_wrong: "Right-sizing; spot instances; idle detection.", expected: "Cost optimisation" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "PE-08", title: "Cost optimisation", shortName: "PE — COST" });
