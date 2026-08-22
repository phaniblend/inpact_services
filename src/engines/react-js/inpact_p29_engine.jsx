import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #29", title: "Accordion", body: `Build a single-open accordion with multiple panels. Only one panel is expanded at a time. Clicking a panel header opens it and closes the others. State: which index (or id) is open.`, usecase: "Accordions are used for FAQs, settings sections, and collapsible content." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["State: openIndex (number or null) for which panel is open", "Click header: set openIndex to that index (or toggle to null if same)", "Render panels: show content only when openIndex === index"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create state: const [openIndex, setOpenIndex] = useState(null). Define an array of panels (e.g. [{ title: 'Panel 1', content: '...' }, ...]). Render a list of panel titles that are clickable.", hint: "panels.map((p, i) => <div key={i} onClick={() => setOpenIndex(i)}>{p.title}</div>)", answer_keywords: ["usestate", "openindex", "setopenindex", "panel", "click"], seed_code: `import { useState } from 'react'

const panels = [{ title: 'Panel 1', content: 'Content 1' }, { title: 'Panel 2', content: 'Content 2' }, { title: 'Panel 3', content: 'Content 3' }]

export default function Accordion() {
  const [openIndex, setOpenIndex] = useState(null)
  // Step 1: clickable headers
}`, feedback_correct: "✅ Headers toggle openIndex.", feedback_partial: "Click handler sets openIndex to index.", feedback_wrong: "onClick={() => setOpenIndex(i)} on each header.", expected: "Headers that set openIndex." },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "For each panel, show content only when openIndex === index. So: {openIndex === i && <div>{panel.content}</div>}. Single-open: clicking another header closes the previous.", hint: "Content visible when openIndex === i", answer_keywords: ["openindex", "content", "==="], seed_code: `import { useState } from 'react'

const panels = [{ title: 'Panel 1', content: 'Content 1' }, { title: 'Panel 2', content: 'Content 2' }]

export default function Accordion() {
  const [openIndex, setOpenIndex] = useState(null)
  return (
    <div>
      {panels.map((p, i) => (
        <div key={i}>
          <div onClick={() => setOpenIndex(i)} style={{ cursor: 'pointer', padding: 8, border: '1px solid #333' }}>{p.title}</div>
          {/* Step 2: show content when openIndex === i */}
        </div>
      ))}
    </div>
  )
}`, feedback_correct: "✅ Single-open accordion.", feedback_partial: "Show content only when openIndex === i.", feedback_wrong: "openIndex === i && content", expected: "Conditional content by openIndex." },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Optional: clicking the open panel again closes it (setOpenIndex(openIndex === i ? null : i)). Export the component.", hint: "setOpenIndex(openIndex === i ? null : i)", answer_keywords: ["toggle", "null", "export"], seed_code: `import { useState } from 'react'

const panels = [{ title: 'Panel 1', content: 'Content 1' }, { title: 'Panel 2', content: 'Content 2' }, { title: 'Panel 3', content: 'Content 3' }]

export default function Accordion() {
  const [openIndex, setOpenIndex] = useState(null)
  return (
    <div>
      {panels.map((p, i) => (
        <div key={i}>
          <div onClick={() => setOpenIndex(openIndex === i ? null : i)} style={{ cursor: 'pointer', padding: 8, border: '1px solid #333' }}>{p.title}</div>
          {openIndex === i && <div style={{ padding: 8, border: '1px solid #333', borderTop: 'none' }}>{p.content}</div>}
        </div>
      ))}
    </div>
  )
}`, feedback_correct: "✅ Accordion complete.", feedback_partial: "Toggle close and export.", feedback_wrong: "Click same panel to close.", expected: "Click same panel to close. Export the accordion component." },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];

export default createINPACTEngine({ NODES, sideItems, lessonNum: 29, title: "Accordion", shortName: "ACCORDION" });
