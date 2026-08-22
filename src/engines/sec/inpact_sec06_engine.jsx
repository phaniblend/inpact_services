import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "SECURITY ENG #6", title: "Penetration testing mindset", body: `Threat modelling, STRIDE, security review checklist, bug bounty basics.`, usecase: "Thinking like an attacker." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Threat modelling", "STRIDE", "Security checklist", "Bug bounty"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "What is STRIDE? How do you threat model a new feature? What goes on a security review checklist?", answer_keywords: ["STRIDE", "threat", "modelling", "checklist", "bug bounty"], seed_code: `// STRIDE: Spoofing, Tampering, Repudiation, Info disclosure, DoS, Elevation
// Threat model: assets, attackers, boundaries, data flows
// Checklist: auth, input, crypto, secrets, deps`, feedback_correct: "✅ STRIDE categories; threat model assets/attackers; checklist for reviews.", feedback_wrong: "STRIDE; threat modelling; security checklist.", expected: "Pen testing mindset" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "SEC-06", title: "Penetration testing mindset", shortName: "SEC — PENTEST" });
