import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "PRODUCTION ENG #6", title: "CI/CD pipelines", body: `GitHub Actions workflows, build caching, matrix builds, deployment gates, rollback automation.`, usecase: "Safe, repeatable deployments." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["GitHub Actions workflows", "Caching and matrix", "Gates and rollback"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "How do you cache dependencies in GitHub Actions? What are deployment gates? How automate rollback?", answer_keywords: ["cache", "actions/cache", "matrix", "gate", "rollback"], seed_code: `// actions/cache with key: hash of lockfile
// Gates: manual approval, smoke tests, canary
// Rollback: revert deploy or blue-green switch`, feedback_correct: "✅ actions/cache; gates = approval/tests; rollback = revert or traffic switch.", feedback_wrong: "Cache with key; gates; rollback strategy.", expected: "CI/CD" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "PE-06", title: "CI/CD pipelines", shortName: "PE — CICD" });
