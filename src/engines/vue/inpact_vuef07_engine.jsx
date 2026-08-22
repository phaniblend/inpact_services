import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "VUE.JS #7", title: "Async patterns", body: `Async components, Suspense, async setup, error boundaries.`, usecase: "Loading and error states." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Async component", "Suspense", "async setup", "Error boundary"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Define an async component with defineAsyncComponent. Wrap it in Suspense with #default and #fallback. What does async setup() do?", answer_keywords: ["defineAsyncComponent", "Suspense", "fallback", "async setup"], seed_code: `const AsyncComp = defineAsyncComponent(() => import('./Heavy.vue'))
<Suspense><AsyncComp /> <template #fallback>Loading...</template></Suspense>
// async setup() allows await before return`, feedback_correct: "✅ defineAsyncComponent; Suspense with default and fallback; async setup can await.", feedback_wrong: "defineAsyncComponent for lazy; Suspense for loading state; async setup.", expected: "Async patterns" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "VUE-F07", title: "Async patterns", shortName: "VUE — ASYNC" });
