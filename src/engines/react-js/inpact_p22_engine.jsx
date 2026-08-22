import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #22", title: "Inline Styles", body: `Build a progress bar with dynamic width via inline styles. Use state (e.g. progress 0–100) and set the bar's width to progress + '%'.`, usecase: "Inline styles are perfect for values that come from state or props." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Use useState for progress (number 0–100)", "Render a container div and an inner bar div", "Set the bar's width with style={{ width: `${progress}%` }}"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with const [progress, setProgress] = useState(0). Render a div that will hold the progress bar.", hint: "Outer div as track, inner div as fill.", answer_keywords: ["usestate", "progress", "setprogress", "div"], seed_code: `import { useState } from 'react'

export default function ProgressBar() {
  const [progress, setProgress] = useState(0)
  // Step 1: outer div (track)
}`, feedback_correct: "✅ State and container.", feedback_partial: "useState for progress and a wrapper div.", feedback_wrong: "const [progress, setProgress] = useState(0); return <div>...</div>", expected: "State and track div." },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add an inner div for the bar. Set its width with inline style: style={{ width: progress + '%' }} or style={{ width: \`${progress}%` }}. Add height and background so it's visible.", hint: "style={{ width: `${progress}%`, height: 20, background: '#3b82f6' }}", answer_keywords: ["style", "width", "progress", "percent", "height", "background"], seed_code: `import { useState } from 'react'

export default function ProgressBar() {
  const [progress, setProgress] = useState(0)
  return (
    <div style={{ width: '100%', height: 20, background: '#eee', borderRadius: 4 }}>
      {/* Step 2: inner bar with width: progress% */}
    </div>
  )
}`, feedback_correct: "✅ Dynamic width from state.", feedback_partial: "Inner div with style={{ width: progress + '%' }}.", feedback_wrong: "style={{ width: `${progress}%` }}", expected: "Bar div with width from progress." },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Add buttons to increase/decrease progress (e.g. +10, -10) so the bar moves. Clamp progress between 0 and 100. Export the component.", hint: "setProgress(p => Math.min(100, p + 10)); setProgress(p => Math.max(0, p - 10))", answer_keywords: ["button", "setprogress", "math.min", "math.max"], seed_code: `import { useState } from 'react'

export default function ProgressBar() {
  const [progress, setProgress] = useState(0)
  return (
    <div>
      <div style={{ width: '100%', height: 20, background: '#eee', borderRadius: 4 }}>
        <div style={{ width: progress + '%', height: 20, background: '#3b82f6', borderRadius: 4 }} />
      </div>
      {/* Step 3: buttons to change progress */}
    </div>
  )
}`, feedback_correct: "✅ Progress bar with controls complete.", feedback_partial: "Buttons that update progress, clamp 0-100.", feedback_wrong: "setProgress with Math.min/Math.max for bounds.", expected: "Buttons to add/subtract progress." },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];

export default createINPACTEngine({ NODES, sideItems, lessonNum: 22, title: "Inline Styles", shortName: "INLINE STYLES" });
