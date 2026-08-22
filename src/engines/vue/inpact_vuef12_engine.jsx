import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "VUE.JS #12", title: "TypeScript with Vue", body: `defineProps with generics, typed emits, useTemplateRef, typed Pinia stores.`, usecase: "Type-safe Vue 3." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Typed props and emits", "useTemplateRef", "Typed Pinia"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Type defineProps with an interface. Type defineEmits. Use useTemplateRef for a typed template ref.", answer_keywords: ["defineProps", "interface", "defineEmits", "useTemplateRef", "Generic"], seed_code: `interface Props { id: number; name?: string }
const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'update', v: number): void }>()
const inputRef = useTemplateRef<HTMLInputElement>('inputRef')`, feedback_correct: "✅ defineProps<Props>(); defineEmits<...>(); useTemplateRef<HTMLElement>().", feedback_wrong: "Generic defineProps/defineEmits; useTemplateRef for typed refs.", expected: "TypeScript with Vue" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "VUE-F12", title: "TypeScript with Vue", shortName: "VUE — TYPESCRIPT" });
