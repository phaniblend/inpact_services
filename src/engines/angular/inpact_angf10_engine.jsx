import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "ANGULAR #10", title: "Signals (Angular 17+)", body: `signal(), computed(), effect(), signal-based components, migration from observables.`, usecase: "Modern reactive primitives." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["signal() and computed()", "effect()", "Signal-based components"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a signal and a computed that doubles it. Use effect() to log when the signal changes. Why prefer signals over BehaviorSubject for component state?", answer_keywords: ["signal", "computed", "effect", "set", "update"], seed_code: `const count = signal(0); count.set(1); count.update(n => n+1)
const doubled = computed(() => count() * 2)
effect(() => console.log(count()))  // runs when count changes`, feedback_correct: "✅ signal(), computed(), effect(); signals are synchronous and simpler for local state.", feedback_wrong: "signal/computed/effect; signals avoid subscription management.", expected: "Signals" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "ANG-F10", title: "Signals", shortName: "ANG — SIGNALS" });
