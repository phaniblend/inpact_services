import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "FRONTEND ENG #10", title: "React advanced patterns", body: `Compound components, render props, portals, error boundaries, concurrent features (Suspense, useTransition).`, usecase: "Flexible and resilient React." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Compound components", "Render props", "Portals and error boundaries", "Suspense and useTransition"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "What are compound components? When use a portal? What do error boundaries catch? useTransition for what?", answer_keywords: ["compound", "render props", "portal", "error boundary", "Suspense", "useTransition"], seed_code: `// Compound: parent + children share state via context
// Portal: render outside DOM hierarchy (modals)
// Error boundary: catch render errors; useTransition: non-urgent updates`, feedback_correct: "✅ Compound = context shared; portal = render elsewhere; error boundary; useTransition for deferring.", feedback_wrong: "Compound components; portals; error boundaries; useTransition.", expected: "React advanced" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "FE-10", title: "React advanced patterns", shortName: "FE — REACT ADV" });
