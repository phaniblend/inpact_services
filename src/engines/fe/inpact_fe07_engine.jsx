import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "FRONTEND ENG #7", title: "Design systems", body: `Token architecture, component API design, Storybook, versioning, consuming in multiple apps.`, usecase: "Consistent UI at scale." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Token architecture", "Component API", "Storybook and versioning"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "What are design tokens? How design a component API for a design system? How version and consume the library?", answer_keywords: ["tokens", "design system", "Storybook", "version", "API"], seed_code: `// Tokens: color, spacing, typography as variables
// API: props over slots; composable; clear defaults
// Version: semver; changelog; multiple apps consume`, feedback_correct: "✅ Tokens = design variables; clear API; version and document.", feedback_wrong: "Design tokens; component API; versioning.", expected: "Design systems" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "FE-07", title: "Design systems", shortName: "FE — DESIGN SYSTEM" });
