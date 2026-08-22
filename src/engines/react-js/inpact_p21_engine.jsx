import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #21", title: "Conditional Classes", body: `Apply different CSS classes based on component state. Build a button or div that toggles an 'active' class (or multiple classes) when state is true/false.`, usecase: "Conditional classes are the standard way to style by state (active, disabled, error)." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Use state (e.g. isActive) to drive class names", "Build className as a string: active ? 'btn active' : 'btn' or template literal", "Apply the result to className={...}"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with state: const [isActive, setIsActive] = useState(false). Render a button that toggles isActive on click.", hint: "onClick={() => setIsActive(!isActive)}", answer_keywords: ["usestate", "isactive", "setisactive", "onclick", "button"], seed_code: `import { useState } from 'react'

export default function ToggleButton() {
  const [isActive, setIsActive] = useState(false)
  // Step 1: button that toggles isActive
}`, feedback_correct: "✅ Toggle state on click.", feedback_partial: "useState and onClick to toggle.", feedback_wrong: "onClick={() => setIsActive(!isActive)}", expected: "Button that toggles isActive." },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add a className to the button that includes 'active' when isActive is true. Use template literal or ternary: className={`btn ${isActive ? 'active' : ''}`}.", hint: "className={\`btn ${isActive ? 'active' : ''}\`} or className={'btn ' + (isActive ? 'active' : '')}", answer_keywords: ["classname", "active", "isactive", "?"], seed_code: `import { useState } from 'react'

export default function ToggleButton() {
  const [isActive, setIsActive] = useState(false)
  return (
    <button onClick={() => setIsActive(!isActive)}>
      Toggle
    </button>
  )
}`, feedback_correct: "✅ Conditional class applied.", feedback_partial: "className with isActive ? 'active' : ''.", feedback_wrong: "className={\`btn ${isActive ? 'active' : ''}\`}", expected: "className that includes 'active' when isActive." },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Add inline styles or a style tag so .active has a distinct look (e.g. background blue). Export the component.", hint: "style={{ backgroundColor: isActive ? '#3b82f6' : '#ccc' }} or use a class and define .active in style.", answer_keywords: ["style", "background", "export"], seed_code: `import { useState } from 'react'

export default function ToggleButton() {
  const [isActive, setIsActive] = useState(false)
  return (
    <button
      onClick={() => setIsActive(!isActive)}
      className={\`btn \${isActive ? 'active' : ''}\`}
      style={{ backgroundColor: isActive ? '#3b82f6' : '#ccc', color: isActive ? '#fff' : '#333' }}
    >
      Toggle
    </button>
  )
}`, feedback_correct: "✅ Conditional classes and styles complete.", feedback_partial: "Visual difference when active.", feedback_wrong: "Apply style or class so active state is visible.", expected: "Apply style or class so active state is visible." },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];

export default createINPACTEngine({ NODES, sideItems, lessonNum: 21, title: "Conditional Classes", shortName: "CONDITIONAL CLASSES" });
