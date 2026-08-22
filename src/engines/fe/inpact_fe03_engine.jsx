import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "FRONTEND ENG #3", title: "CSS architecture", body: `BEM, CSS modules, CSS-in-JS trade-offs, custom properties, container queries, has().`, usecase: "Scalable styling." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["BEM and CSS modules", "CSS-in-JS trade-offs", "Container queries and has()"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "When BEM vs CSS modules? Trade-offs of CSS-in-JS? What are container queries?", answer_keywords: ["BEM", "CSS modules", "CSS-in-JS", "container query", "has()"], seed_code: `// BEM: block__element--modifier; flat specificity
// CSS modules: scoped by default
// Container queries: @container; style by parent size`, feedback_correct: "✅ BEM for naming; CSS modules scope; container queries for component-driven layout.", feedback_wrong: "BEM; CSS modules; container queries.", expected: "CSS architecture" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "FE-03", title: "CSS architecture", shortName: "FE — CSS" });
