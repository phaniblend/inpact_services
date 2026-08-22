import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "FRONTEND ENG #6", title: "Animation & interaction design", body: `CSS transitions vs Web Animations API vs GSAP, reduced-motion, scroll-driven animations.`, usecase: "Polished, inclusive motion." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["CSS vs WAAPI vs GSAP", "prefers-reduced-motion", "Scroll-driven animations"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "When CSS transition vs Web Animations API? How respect prefers-reduced-motion? What are scroll-driven animations?", answer_keywords: ["transition", "WAAPI", "reduced-motion", "scroll", "animation"], seed_code: `// CSS: simple; WAAPI: control; GSAP: complex sequences
// @media (prefers-reduced-motion: reduce) { ... }
// animation-timeline: scroll()`, feedback_correct: "✅ CSS simple; WAAPI control; respect reduced-motion; scroll-driven timeline.", feedback_wrong: "CSS vs WAAPI; reduced-motion; scroll-driven.", expected: "Animation" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "FE-06", title: "Animation & interaction", shortName: "FE — ANIMATION" });
