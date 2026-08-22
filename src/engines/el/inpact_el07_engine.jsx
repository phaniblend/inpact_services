import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "ENG LEADERSHIP #7", title: "Cross-functional collaboration", body: `Working with PM/Design/Data, RFC process, decision frameworks (RACI, DACI).`, usecase: "Alignment across functions." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["PM/Design/Data collaboration", "RFC process", "RACI/DACI"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "What is an RFC? When use RACI vs DACI? How align with PM on scope?", answer_keywords: ["RFC", "RACI", "DACI", "PM", "collaboration"], seed_code: `// RFC: Request for Comments; design doc with feedback loop
// RACI: Responsible, Accountable, Consulted, Informed
// DACI: Driver, Approver, Contributors, Informed`, feedback_correct: "✅ RFC = design doc + feedback; RACI/DACI for roles; align with PM on outcomes.", feedback_wrong: "RFC; RACI/DACI; cross-functional alignment.", expected: "Cross-functional" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "EL-07", title: "Cross-functional collaboration", shortName: "EL — COLLAB" });
