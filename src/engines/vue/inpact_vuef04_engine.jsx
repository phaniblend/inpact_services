import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "VUE.JS #4", title: "Composables", body: `useX pattern, reusing stateful logic, lifecycle hooks inside composables, VueUse.`, usecase: "Reusable logic without mixins." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["useX composable pattern", "Lifecycle in composables", "VueUse"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Write a useCounter() composable that returns count, increment, and decrement. Use onMounted inside it.", answer_keywords: ["composable", "useCounter", "ref", "onMounted", "return"], seed_code: `function useCounter(initial = 0) {
  const count = ref(initial)
  const increment = () => count.value++
  onMounted(() => console.log('mounted'))
  return { count, increment }
}`, feedback_correct: "✅ useX pattern; refs and functions; onMounted in composable; return object.", feedback_wrong: "Composable returns refs and methods; can use lifecycle inside.", expected: "Composables" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "VUE-F04", title: "Composables", shortName: "VUE — COMPOSABLES" });
