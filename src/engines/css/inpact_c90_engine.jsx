import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "CSS — Senior Fullstack",
    content: {
      tag: "CSS C90",
      title: "mask and clip-path",
      body: `Senior fullstack devs need a solid grasp of mask and clip-path. This lesson covers the key concepts, common values, and patterns you'll use in production.`,
      usecase: "When implementing layouts, fixing bugs, or matching design specs, you'll often rely on mask and clip-path.",
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "What You'll Take Away",
    items: ["Understand how mask and clip-path works and when to use it","Apply mask and clip-path in a minimal example","Combine with related properties for real-world layouts"],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 2",
    paal: `Implement mask and clip-path: create a .demo element (or use the default HTML) and apply the main property. Get the visual or behavior described in the lesson.`,
    hint: "clip-path: circle(50%); or polygon(...); mask: url(...);",
    answer_keywords: ["demo","clip-path"],
    seed_code: `/* Step 1: mask and clip-path */
.demo {
}`,
    feedback_correct: "✅ You applied the main property. Well done.",
    feedback_partial: "Add the main property for this topic to .demo.",
    feedback_wrong: "Use .demo { } and apply the property shown in the hint.",
    expected: `clip-path`,
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 2",
    paal: `Extend your .demo with a second property or value related to mask and clip-path. Reinforce the pattern.`,
    hint: "mask-image: linear-gradient(...);",
    answer_keywords: ["demo","mask"],
    seed_code: `/* Step 2: extend mask and clip-path */
.demo {
}`,
    feedback_correct: "✅ You extended the demo. Topic covered.",
    feedback_partial: "Add a second property or value to .demo.",
    feedback_wrong: "Extend .demo with another property from the hint.",
    expected: `mask`,
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
  lessonNum: 90,
  title: "mask and clip-path",
  shortName: "C90",
  language: "css",
  answerShape: "css-tabs",
  defaultHtml: "<div class=\"demo\">Demo</div>",
  getOutputPreview,
});
