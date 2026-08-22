import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "SYSTEM DESIGN #9", title: "CDN & edge computing", body: `Cache hierarchy, cache invalidation, edge workers, geo-routing, origin shield.`, usecase: "Low-latency static and dynamic at edge." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["CDN cache hierarchy", "Cache invalidation strategies", "Edge workers and geo-routing"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "How does cache invalidation work for a CDN? What are edge workers? What is origin shield?", answer_keywords: ["invalidation", "purge", "edge", "worker", "origin shield", "geo"], seed_code: `// Invalidation: purge by URL or tag; TTL as fallback
// Edge workers: run code at edge (e.g. transform, auth)
// Origin shield: single hop to origin, reduces load`, feedback_correct: "✅ Purge/TTL; edge workers run at POP; origin shield protects origin.", feedback_wrong: "Cache invalidation; edge workers; origin shield.", expected: "CDN & edge" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "SD-09", title: "CDN & edge computing", shortName: "SD — CDN" });
