import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "VUE.JS #10", title: "Testing Vue", body: `Vitest + Vue Test Utils, mountComponent, findBy*, emit testing, stub components.`, usecase: "Unit testing components." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["mount and findBy", "Trigger events", "Assert emits", "Stub components"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Mount a component with Vue Test Utils. Find a button, trigger click, assert an emit was called with the right payload.", answer_keywords: ["mount", "findBy", "trigger", "emitted", "wrapper"], seed_code: `const wrapper = mount(MyComponent, { props: { msg: 'hi' } })
await wrapper.find('button').trigger('click')
expect(wrapper.emitted('submit')).toEqual([[{ id: 1 }]])`, feedback_correct: "✅ mount; find + trigger; wrapper.emitted('event').", feedback_wrong: "mount component; find element, trigger; emitted() for events.", expected: "Testing Vue" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "VUE-F10", title: "Testing Vue", shortName: "VUE — TESTING" });
