import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "SYSTEM DESIGN #8", title: "Load balancing", body: `L4 vs L7, round-robin vs least-connections vs consistent hashing, health checks, sticky sessions.`, usecase: "Distributing traffic across instances." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["L4 vs L7 load balancing", "Algorithms: round-robin, least-conn", "Health checks and sticky sessions"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "When use L4 vs L7 load balancer? What is consistent hashing used for? Why health checks?", answer_keywords: ["L4", "L7", "consistent hashing", "health check", "sticky"], seed_code: `// L4: IP+port; L7: HTTP path, headers, TLS
// Consistent hashing: cache affinity, minimal reshuffle
// Health check: remove unhealthy from pool`, feedback_correct: "✅ L4 transport; L7 application; consistent hashing for caches; health checks remove bad nodes.", feedback_wrong: "L4 vs L7; consistent hashing; health checks.", expected: "Load balancing" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "SD-08", title: "Load balancing", shortName: "SD — LB" });
