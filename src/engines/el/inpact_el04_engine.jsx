import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "ENG LEADERSHIP #4", title: "Hiring & interviews", body: `Writing job descriptions, structured interviews, take-home vs live coding, calibration.`, usecase: "Building the team." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Job descriptions", "Structured interviews", "Take-home vs live", "Calibration"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "What makes a good job description? Why structured interviews? When take-home vs live coding?", answer_keywords: ["JD", "structured", "interview", "take-home", "calibration"], seed_code: `// JD: role, impact, must-have vs nice-to-have
// Structured: same questions, rubric, reduce bias
// Take-home: signal on real work; live: signal on pressure`, feedback_correct: "✅ JD with impact; structured = same Q + rubric; take-home vs live trade-offs.", feedback_wrong: "Job descriptions; structured interviews; take-home vs live.", expected: "Hiring" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "EL-04", title: "Hiring & interviews", shortName: "EL — HIRING" });
