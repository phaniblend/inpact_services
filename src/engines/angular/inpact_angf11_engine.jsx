import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "ANGULAR #11", title: "Angular animations", body: `@angular/animations, trigger/state/transition/animate, staggered list animations.`, usecase: "Polished UX." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["trigger, state, transition", "animate", "Staggered lists"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Define a trigger with two states (open/closed) and a transition. Use :enter and stagger for a list.", answer_keywords: ["trigger", "state", "transition", "animate", "stagger", ":enter"], seed_code: `trigger('openClose', [
  state('open', style({ height: '*' })),
  state('closed', style({ height: 0 })),
  transition('open <=> closed', animate(300))
])
// * => * with query(':enter', stagger(100, animate(...)))`, feedback_correct: "✅ trigger, state, transition, animate; query :enter stagger.", feedback_wrong: "trigger/state/transition/animate; stagger for list items.", expected: "Animations" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "ANG-F11", title: "Animations", shortName: "ANG — ANIMATIONS" });
