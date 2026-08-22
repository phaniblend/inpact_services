import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "ANGULAR #1", title: "Components & templates", body: `@Component, interpolation, property binding, event binding, template reference vars.`, usecase: "Core Angular building blocks." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Use interpolation and bindings", "Property and event binding", "Template refs"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Write a component with interpolation {{ title }}, property binding [disabled]=\"loading\", and event binding (click)=\"submit()\".", answer_keywords: ["interpolation", "property binding", "event binding", "Component", "template"], seed_code: `// {{ value }} [prop]="expr" (event)="handler()" #ref`, feedback_correct: "✅ {{ }}, [prop], (event), #ref.", feedback_wrong: "Interpolation {{ }}, [prop] binding, (event) binding.", expected: "Component template syntax" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "ANG-F01", title: "Components & templates", shortName: "ANG — TEMPLATES" });
