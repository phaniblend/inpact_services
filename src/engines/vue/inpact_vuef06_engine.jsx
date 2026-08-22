import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "VUE.JS #6", title: "Pinia (state management)", body: `defineStore, state/getters/actions, composable stores, devtools.`, usecase: "Global state in Vue 3." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["defineStore", "state, getters, actions", "Use store in components"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a Pinia store with defineStore: state (count), getter (doubled), action (increment). Use it in a component.", answer_keywords: ["defineStore", "state", "getters", "actions", "store"], seed_code: `export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  getters: { doubled: (s) => s.count * 2 },
  actions: { increment() { this.count++ } }
})
const store = useCounterStore(); store.increment()`, feedback_correct: "✅ defineStore with state/getters/actions; useStore() in component.", feedback_wrong: "defineStore; state, getters, actions; useStore() to access.", expected: "Pinia" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "VUE-F06", title: "Pinia", shortName: "VUE — PINIA" });
