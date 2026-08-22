import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #26", title: "Controlled vs Uncontrolled", body: `Explain the difference with a working example of each. Build (1) a controlled input: value and onChange from state. (2) An uncontrolled input: useRef to read the value when needed (e.g. on button click).`, usecase: "Most forms are controlled; uncontrolled is useful for simple or legacy integration." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Controlled: value={state}, onChange updates state", "Uncontrolled: ref on input, read inputRef.current.value on submit", "Show both in one component or two"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Build a controlled input: useState for value, <input value={value} onChange={e => setValue(e.target.value)} />. Display the value below so you see it update as you type.", hint: "const [value, setValue] = useState(''); value and onChange on input.", answer_keywords: ["usestate", "value", "onchange", "input"], seed_code: `import { useState } from 'react'

export default function CompareInputs() {
  const [value, setValue] = useState('')
  // Step 1: controlled input
}`, feedback_correct: "✅ Controlled input.", feedback_partial: "value and onChange from state.", feedback_wrong: "input with value={value} onChange={e => setValue(e.target.value)}", expected: "Controlled input with state." },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Build an uncontrolled input: useRef, <input ref={inputRef} defaultValue=\"\" />. Add a button that reads inputRef.current.value and alerts or sets it to state when clicked.", hint: "const inputRef = useRef(null); onClick: alert(inputRef.current.value)", answer_keywords: ["useref", "ref", "defaultvalue", "current", "value"], seed_code: `import { useState, useRef } from 'react'

export default function CompareInputs() {
  const [value, setValue] = useState('')
  const inputRef = useRef(null)
  // Step 2: uncontrolled input and button to read value
}`, feedback_correct: "✅ Uncontrolled input with ref.", feedback_partial: "useRef and ref on input, read .current.value.", feedback_wrong: "input ref={inputRef}, button reads inputRef.current.value", expected: "Uncontrolled input + button to read value." },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Add a short comment above each: Controlled = React state is source of truth. Uncontrolled = DOM holds value, we read it when needed. Export the component.", hint: "Comment for each input type.", answer_keywords: ["//", "controlled", "uncontrolled", "export"], seed_code: `import { useState, useRef } from 'react'

// Controlled: state is source of truth. Uncontrolled: DOM holds value, read on demand.
export default function CompareInputs() {
  const [value, setValue] = useState('')
  const inputRef = useRef(null)
  return (
    <div>
      <div>Controlled: <input value={value} onChange={e => setValue(e.target.value)} /> → {value}</div>
      <div>Uncontrolled: <input ref={inputRef} defaultValue="" /> <button onClick={() => alert(inputRef.current?.value)}>Read</button></div>
    </div>
  )
}`, feedback_correct: "✅ Controlled vs uncontrolled complete.", feedback_partial: "Comment and both inputs.", feedback_wrong: "Comments explaining both patterns.", expected: "Comments explaining controlled vs uncontrolled. Both input patterns." },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];

export default createINPACTEngine({ NODES, sideItems, lessonNum: 26, title: "Controlled vs Uncontrolled", shortName: "CONTROLLED VS UNCONTROLLED" });
