import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "SYSTEM DESIGN #7", title: "Designing for failure", body: `Chaos engineering, bulkheads, timeouts, fallbacks, graceful degradation.`, usecase: "Systems that survive failures." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Timeouts and fallbacks", "Bulkheads and isolation", "Graceful degradation"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Explain bulkhead pattern. Why timeouts on every outbound call? What is graceful degradation?", answer_keywords: ["bulkhead", "timeout", "fallback", "graceful", "chaos"], seed_code: `// Bulkhead: isolate pool so one failure doesn't exhaust all
// Timeout: never wait forever; fail fast
// Fallback: cache, default, or reduced feature`, feedback_correct: "✅ Bulkhead isolates; timeouts prevent cascade; graceful = reduce features, don't crash.", feedback_wrong: "Bulkheads isolate; timeouts everywhere; graceful degradation.", expected: "Designing for failure" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "SD-07", title: "Designing for failure", shortName: "SD — FAILURE" });
