import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "FRONTEND ENG #2", title: "Accessibility (a11y)", body: `WCAG 2.1, ARIA roles/labels, keyboard navigation, focus management, screen reader testing.`, usecase: "Inclusive UX." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["WCAG 2.1", "ARIA and keyboard", "Focus management", "Screen reader testing"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "What are WCAG levels? When use aria-label vs aria-labelledby? How test with a screen reader?", answer_keywords: ["WCAG", "ARIA", "aria-label", "keyboard", "screen reader"], seed_code: `// WCAG A/AA/AAA; aria-label for icon buttons
// aria-labelledby links to visible text
// Test: NVDA, VoiceOver; keyboard only`, feedback_correct: "✅ WCAG levels; aria-label for icons; screen reader testing.", feedback_wrong: "WCAG; ARIA; keyboard and screen reader testing.", expected: "Accessibility" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "FE-02", title: "Accessibility (a11y)", shortName: "FE — A11Y" });
