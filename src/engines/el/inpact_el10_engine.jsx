import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "ENG LEADERSHIP #10", title: "Remote & async engineering", body: `Documentation culture, async decision-making, meeting reduction, timezone strategies.`, usecase: "Effective distributed teams." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Documentation culture", "Async decisions", "Meeting reduction", "Timezone strategies"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "How make decisions async? How reduce meetings? What helps with timezone overlap?", answer_keywords: ["async", "documentation", "meetings", "timezone", "remote"], seed_code: `// Async: RFCs, written proposals, default to open
// Meetings: agenda, async pre-read, record; reduce sync where possible
// Timezone: core hours overlap; rotate who gets late/early`, feedback_correct: "✅ Written proposals; agenda + pre-read; core hours and rotation.", feedback_wrong: "Async decision-making; meeting reduction; timezone strategies.", expected: "Remote & async" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "EL-10", title: "Remote & async engineering", shortName: "EL — REMOTE" });
