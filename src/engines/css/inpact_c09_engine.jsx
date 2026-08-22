import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "CSS — Senior Fullstack",
    content: {
      tag: "CSS C09",
      title: "Flex: container and direction",
      body: `Senior fullstack devs need a solid grasp of Flex: container and direction. This lesson covers the key concepts, common values, and patterns you'll use in production.`,
      usecase: "When implementing layouts, fixing bugs, or matching design specs, you'll often rely on Flex: container and direction.",
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "What You'll Take Away",
    items: ["Understand how Flex: container and direction works and when to use it","Apply Flex: container and direction in a minimal example","Combine with related properties for real-world layouts"],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 2",
    paal: `Implement Flex: container and direction: create a .demo element (or use the default HTML) and apply the main property. Get the visual or behavior described in the lesson.`,
    hint: ".row { display: flex; flex-direction: row; }",
    answer_keywords: ["demo","display","flex"],
    seed_code: `/* Step 1: Flex: container and direction */
.demo {
}`,
    feedback_correct: "✅ You applied the main property. Well done.",
    feedback_partial: "Add the main property for this topic to .demo.",
    feedback_wrong: "Use .demo { } and apply the property shown in the hint.",
    expected: `display: flex;`,
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 2",
    paal: `Extend your .demo with a second property or value related to Flex: container and direction. Reinforce the pattern.`,
    hint: "flex-direction: column; or row-reverse",
    answer_keywords: ["demo","flex-direction","column"],
    seed_code: `/* Step 2: extend Flex: container and direction */
.demo {
}`,
    feedback_correct: "✅ You extended the demo. Topic covered.",
    feedback_partial: "Add a second property or value to .demo.",
    feedback_wrong: "Extend .demo with another property from the hint.",
    expected: `flex-direction: column;`,
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
  lessonNum: 9,
  title: "Flex: container and direction",
  shortName: "C09",
  language: "css",
  answerShape: "css-tabs",
  defaultHtml: "<div class=\"demo\">Demo</div>",
  getOutputPreview,
});
