import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #20", title: "Event Handling", body: `Build a form where pressing Enter submits and Escape clears, without using a submit button. Use onKeyDown on the form or inputs and check e.key.`, usecase: "Keyboard shortcuts improve accessibility and power-user experience." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Add onKeyDown to form or inputs", "If e.key === 'Enter', call submit handler (e.preventDefault first)", "If e.key === 'Escape', clear the form state"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a form with one or two inputs and state for their values. Add onSubmit that prevents default and logs or sets a submitted state.", hint: "onSubmit={e => { e.preventDefault(); handleSubmit(); }}", answer_keywords: ["form", "onsubmit", "preventdefault", "usestate"], seed_code: `import { useState } from 'react'

export default function KeyForm() {
  const [value, setValue] = useState('')
  // Step 1: form with onSubmit preventDefault
}`, feedback_correct: "✅ Form with submit handler.", feedback_partial: "form onSubmit with e.preventDefault().", feedback_wrong: "onSubmit={e => { e.preventDefault(); ... }}", expected: "Form with preventDefault and submit logic." },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add onKeyDown to the form (or input). When e.key === 'Enter', prevent default and call your submit logic. When e.key === 'Escape', clear the input state.", hint: "onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); } if (e.key === 'Escape') setValue(''); }}", answer_keywords: ["onkeydown", "enter", "escape", "key", "preventdefault"], seed_code: `import { useState } from 'react'

export default function KeyForm() {
  const [value, setValue] = useState('')
  const handleSubmit = () => { console.log(value) }
  return (
    <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
      <input value={value} onChange={e => setValue(e.target.value)} />
      {/* Step 2: onKeyDown for Enter and Escape */}
    </form>
  )
}`, feedback_correct: "✅ Enter submits, Escape clears.", feedback_partial: "Check e.key for Enter and Escape.", feedback_wrong: "onKeyDown: Enter -> submit, Escape -> setValue('').", expected: "onKeyDown with Enter and Escape handling." },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Ensure the form has no submit button. Users submit only via Enter. Export the component.", hint: "Remove <button type=\"submit\"> if you had one; Enter is enough.", answer_keywords: ["export", "default"], seed_code: `import { useState } from 'react'

export default function KeyForm() {
  const [value, setValue] = useState('')
  const handleSubmit = () => { console.log(value) }
  return (
    <form
      onSubmit={e => { e.preventDefault(); handleSubmit(); }}
      onKeyDown={e => {
        if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); }
        if (e.key === 'Escape') setValue('');
      }}
    >
      <input value={value} onChange={e => setValue(e.target.value)} placeholder="Type and press Enter or Esc" />
    </form>
  )
}`, feedback_correct: "✅ Event handling with Enter and Escape complete.", feedback_partial: "No submit button, Enter and Escape only.", feedback_wrong: "Form with keyboard submit and clear.", expected: "Form with keyboard submit (Enter) and clear (Escape)." },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];

export default createINPACTEngine({ NODES, sideItems, lessonNum: 20, title: "Event Handling", shortName: "EVENT HANDLING" });
