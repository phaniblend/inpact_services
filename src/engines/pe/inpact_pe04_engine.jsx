import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "PRODUCTION ENG #4", title: "Container orchestration", body: `Kubernetes pods/deployments/services, resource limits, liveness/readiness probes, HPA.`, usecase: "Running containers at scale." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Pods, Deployments, Services", "Resource limits", "Probes and HPA"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "What is the difference between liveness and readiness probe? When does HPA scale? Why set resource limits?", answer_keywords: ["liveness", "readiness", "HPA", "limits", "requests", "Kubernetes"], seed_code: `// Liveness: restart if fail; readiness: remove from service if fail
// HPA: scale on CPU/memory/custom metric
// Limits: prevent one pod from starving node`, feedback_correct: "✅ Liveness=restart; readiness=traffic; HPA on metrics; limits protect node.", feedback_wrong: "Liveness vs readiness; HPA; resource limits.", expected: "K8s orchestration" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "PE-04", title: "Container orchestration", shortName: "PE — K8S" });
