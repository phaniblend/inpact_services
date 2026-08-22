import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "VUE.JS #2", title: "Template syntax", body: `v-bind, v-on, v-model, v-if/v-show/v-for, template refs, dynamic components.`, usecase: "Binding and control flow." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["v-bind, v-on, v-model", "v-if/v-show/v-for", "Template refs"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Use v-model on an input. Use ref on an element and access it in setup with template ref. When v-if vs v-show?", answer_keywords: ["v-model", "ref", "template ref", "v-if", "v-show"], seed_code: `v-model="text"  // :value + @input
const inputRef = ref(null)  // <input ref="inputRef">  useTemplateRef
// v-if: toggle DOM; v-show: display:none`, feedback_correct: "✅ v-model; ref for template ref; v-if removes from DOM, v-show toggles visibility.", feedback_wrong: "v-model; ref for DOM ref; v-if vs v-show trade-off.", expected: "Template syntax" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "VUE-F02", title: "Template syntax", shortName: "VUE — TEMPLATE" });
