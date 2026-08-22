import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "VUE.JS #8", title: "Vue performance", body: `v-once, v-memo, shallowRef, shallowReactive, virtual lists, KeepAlive.`, usecase: "Rendering less, faster." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["v-once, v-memo", "shallowRef, shallowReactive", "KeepAlive"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "When use v-memo? What is shallowRef for? How does KeepAlive help with tab switching?", answer_keywords: ["v-memo", "shallowRef", "KeepAlive", "performance", "cache"], seed_code: `// v-memo: skip update if deps unchanged
// shallowRef: no deep reactivity (big object/array)
<KeepAlive><component :is="current" /></KeepAlive>  // cache inactive instances`, feedback_correct: "✅ v-memo for list item stability; shallowRef for non-deep; KeepAlive caches components.", feedback_wrong: "v-memo; shallowRef for shallow reactivity; KeepAlive for caching.", expected: "Performance" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "VUE-F08", title: "Vue performance", shortName: "VUE — PERF" });
