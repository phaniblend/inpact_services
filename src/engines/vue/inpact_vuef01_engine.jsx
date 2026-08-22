import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "VUE.JS #1", title: "Composition API fundamentals", body: `setup(), ref(), reactive(), computed(), watch(), watchEffect().`, usecase: "Vue 3 reactive primitives." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["ref and reactive", "computed and watch", "watchEffect"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "In setup(), create a ref and a computed that depends on it. Use watchEffect to log when the ref changes.", answer_keywords: ["ref", "computed", "watchEffect", "setup", ".value"], seed_code: `const count = ref(0); const doubled = computed(() => count.value * 2)
watchEffect(() => console.log(count.value))  // runs immediately and on change`, feedback_correct: "✅ ref(), computed(), watchEffect(); .value in script.", feedback_wrong: "ref/computed/watchEffect; refs need .value in script.", expected: "Composition API" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "VUE-F01", title: "Composition API", shortName: "VUE — COMPOSITION" });
