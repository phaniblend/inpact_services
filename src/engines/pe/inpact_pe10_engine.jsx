import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "PRODUCTION ENG #10", title: "SRE practices", body: `Error budgets, toil reduction, runbook automation, game days, chaos experiments.`, usecase: "Reliability as a discipline." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Error budgets", "Toil reduction", "Runbooks and game days"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "What is an error budget? How reduce toil? What is a game day?", answer_keywords: ["error budget", "SLO", "toil", "runbook", "game day", "chaos"], seed_code: `// Error budget: 100% - SLO; exhaust = no new features, fix reliability
// Toil: manual, repetitive; automate or eliminate
// Game day: planned failure injection, practice response`, feedback_correct: "✅ Error budget = 1 - SLO; toil = automate; game day = planned chaos.", feedback_wrong: "Error budgets; reduce toil; game days.", expected: "SRE" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "PE-10", title: "SRE practices", shortName: "PE — SRE" });
