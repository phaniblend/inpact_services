import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "VUE.JS #3", title: "Component communication", body: `props/emits, defineProps/defineEmits, provide/inject, v-model on components.`, usecase: "Parent-child and cross-tree data." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["defineProps, defineEmits", "provide/inject", "v-model on component"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Define props and emits with defineProps and defineEmits. Implement v-model on a custom component (modelValue + update:modelValue).", answer_keywords: ["defineProps", "defineEmits", "v-model", "modelValue", "update:modelValue"], seed_code: `defineProps<{ msg: string }>()
defineEmits<{ (e: 'update'): void }>()
// v-model: prop modelValue + emit('update:modelValue', value)`, feedback_correct: "✅ defineProps/defineEmits; v-model = modelValue + update:modelValue.", feedback_wrong: "defineProps/defineEmits; v-model on component needs modelValue and emit.", expected: "Component communication" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "VUE-F03", title: "Component communication", shortName: "VUE — PROPS EMIT" });
