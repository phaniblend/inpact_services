import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "FRONTEND ENG #9", title: "Web security for frontend", body: `Content Security Policy, Subresource Integrity, iframe sandboxing, postMessage security.`, usecase: "Defence in depth on the client." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["CSP", "SRI", "iframe sandbox", "postMessage"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "What does Content-Security-Policy do? What is SRI? How use postMessage safely?", answer_keywords: ["CSP", "SRI", "integrity", "postMessage", "sandbox"], seed_code: `// CSP: whitelist sources; prevent XSS and inline
// SRI: integrity="sha384-..." on script/link
// postMessage: check event.origin; never trust data`, feedback_correct: "✅ CSP whitelist; SRI for integrity; postMessage validate origin.", feedback_wrong: "CSP; SRI; postMessage security.", expected: "Frontend security" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "FE-09", title: "Web security for frontend", shortName: "FE — SECURITY" });
