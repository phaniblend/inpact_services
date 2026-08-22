import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "SYSTEM DESIGN #10", title: "Microservices patterns", body: `Service mesh, sidecar, API gateway, BFF, sagas, 2-phase commit vs eventual consistency.`, usecase: "Distributed service design." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Service mesh and sidecar", "API gateway vs BFF", "Sagas and eventual consistency"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "What does a service mesh provide? When use saga vs 2PC? API gateway vs BFF?", answer_keywords: ["service mesh", "sidecar", "saga", "2PC", "BFF", "gateway"], seed_code: `// Mesh: observability, retry, TLS, discovery
// Saga: local tx + compensating; 2PC: coordinator, blocks
// BFF: one per client; gateway: single entry`, feedback_correct: "✅ Mesh = sidecar observability/retry; saga for distributed tx; BFF per client.", feedback_wrong: "Service mesh; saga vs 2PC; BFF vs gateway.", expected: "Microservices" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "SD-10", title: "Microservices patterns", shortName: "SD — MICROSERVICES" });
