import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "SECURITY ENG #4", title: "Network security", body: `TLS/mTLS, certificate pinning, HSTS, WAF rules, DDoS mitigation.`, usecase: "Secure transport and edge protection." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["TLS and mTLS", "HSTS and pinning", "WAF and DDoS"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "What is mTLS? Why HSTS? How does a WAF help? DDoS mitigation layers?", answer_keywords: ["mTLS", "HSTS", "WAF", "DDoS", "TLS"], seed_code: `// mTLS: client certs; both sides authenticated
// HSTS: Strict-Transport-Security; no HTTP downgrade
// WAF: rule-based; DDoS: rate limit, absorb, scrub`, feedback_correct: "✅ mTLS = mutual TLS; HSTS enforces HTTPS; WAF rules; DDoS = absorb + scrub.", feedback_wrong: "mTLS; HSTS; WAF; DDoS mitigation.", expected: "Network security" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "SEC-04", title: "Network security", shortName: "SEC — NETWORK" });
