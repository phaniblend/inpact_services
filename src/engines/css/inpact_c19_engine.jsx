import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "CSS — Senior Fullstack",
    content: {
      tag: "CSS C19",
      title: "rem and em",
      body: `Senior fullstack devs need a solid grasp of rem and em. This lesson covers the key concepts, common values, and patterns you'll use in production.`,
      usecase: "When implementing layouts, fixing bugs, or matching design specs, you'll often rely on rem and em.",
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "What You'll Take Away",
    items: ["Understand how rem and em works and when to use it","Apply rem and em in a minimal example","Combine with related properties for real-world layouts"],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 2",
    paal: `Implement rem and em: create a .demo element (or use the default HTML) and apply the main property. Get the visual or behavior described in the lesson.`,
    hint: "font-size: 1rem; or 16px; line-height: 1.5em;",
    answer_keywords: ["demo","rem"],
    seed_code: `/* Step 1: rem and em */
.demo {
}`,
    feedback_correct: "✅ You applied the main property. Well done.",
    feedback_partial: "Add the main property for this topic to .demo.",
    feedback_wrong: "Use .demo { } and apply the property shown in the hint.",
    expected: `rem`,
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 2",
    paal: `Extend your .demo with a second property or value related to rem and em. Reinforce the pattern.`,
    hint: "padding: 0.5em; (relative to font-size)",
    answer_keywords: ["demo","em"],
    seed_code: `/* Step 2: extend rem and em */
.demo {
}`,
    feedback_correct: "✅ You extended the demo. Topic covered.",
    feedback_partial: "Add a second property or value to .demo.",
    feedback_wrong: "Extend .demo with another property from the hint.",
    expected: `em;`,
  },
];

const sideItems = [
  { id: "intro", label: "Lesson" },
  { id: "objectives", label: "Objectives" },
  { id: "step1", label: "Step 1" },
  { id: "step2", label: "Step 2" },
];

function getOutputPreview(answer) {
  let html = "";
  let css = "";
  try {
    const p = JSON.parse(answer || "{}");
    html = p.html ?? "";
    css = p.css ?? "";
  } catch (_) {
    css = answer || "";
  }
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${html || "<div class=\"demo\">Demo</div>"}</body></html>`;
}

export default createINPACTEngine({
  NODES,
  sideItems,
  lessonNum: 19,
  title: "rem and em",
  shortName: "C19",
  language: "css",
  answerShape: "css-tabs",
  defaultHtml: "<div class=\"demo\">Demo</div>",
  getOutputPreview,
});
