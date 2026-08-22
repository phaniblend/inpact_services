import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "SYSTEM DESIGN #14", title: "Rate limiting at scale", body: `Token bucket, leaky bucket, fixed window vs sliding window, distributed rate limiting.`, usecase: "Fair use and abuse prevention." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Token bucket and leaky bucket", "Fixed vs sliding window", "Distributed rate limiting"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Compare token bucket vs leaky bucket. Why is fixed window prone to burst? How do you rate limit across many nodes (distributed)?", answer_keywords: ["token bucket", "leaky bucket", "sliding window", "fixed window", "Redis", "distributed"], seed_code: `// Token bucket: refill rate, burst; leaky: drain rate
// Fixed window: 2x at boundary; sliding: smooth
// Distributed: Redis INCR + TTL or sliding window in Redis`, feedback_correct: "✅ Token/leaky bucket; sliding window avoids burst; Redis for distributed.", feedback_wrong: "Token bucket; sliding window; Redis for distributed limiting.", expected: "Rate limiting" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "SD-14", title: "Rate limiting at scale", shortName: "SD — RATE LIMIT" });
