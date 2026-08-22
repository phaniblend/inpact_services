import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "SECURITY ENG #3", title: "Input validation & data integrity", body: `Schema validation, file upload security, ReDoS, prototype pollution.`, usecase: "Stopping bad input from breaking the app." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Schema validation", "File upload security", "ReDoS and prototype pollution"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "How prevent ReDoS? What is prototype pollution? How validate file uploads safely?", answer_keywords: ["ReDoS", "regex", "prototype pollution", "validation", "upload"], seed_code: `// ReDoS: avoid nested quantifiers; limit regex input length
// Prototype pollution: avoid merging user obj into {}; use Map/sanitise keys
// Upload: type check, size limit, virus scan, store outside webroot`, feedback_correct: "✅ ReDoS: safe regex; prototype: sanitise; upload: validate and isolate.", feedback_wrong: "ReDoS; prototype pollution; file upload validation.", expected: "Input validation" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "SEC-03", title: "Input validation & data integrity", shortName: "SEC — VALIDATION" });
