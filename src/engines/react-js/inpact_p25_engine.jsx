import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #25", title: "Lifting State Up", body: `Build two sibling components that share state via a parent. The parent holds the state (e.g. count); one child displays it, the other has a button to increment it.`, usecase: "When two siblings need the same data, lift state to their common parent." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Parent holds state (useState)", "Pass value and setter (or handler) to both children", "One child displays, one child updates"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a parent component with const [count, setCount] = useState(0). Render two child components: Display and Controls. Pass count to Display and setCount (or a handler) to Controls.", hint: "<Display count={count} /><Controls onIncrement={() => setCount(c => c + 1)} />", answer_keywords: ["usestate", "count", "setcount", "display", "controls", "parent"], seed_code: `import { useState } from 'react'

function Display({ count }) { return <div>Count: {count}</div> }
function Controls({ onIncrement }) { return <button onClick={onIncrement}>+</button> }

export default function Parent() {
  const [count, setCount] = useState(0)
  // Step 1: render Display and Controls with props
}`, feedback_correct: "✅ State in parent, passed to children.", feedback_partial: "Parent has state and passes to both children.", feedback_wrong: "<Display count={count} /><Controls onIncrement={() => setCount(c => c + 1)} />", expected: "Parent with state, Display(count), Controls(onIncrement)." },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Display should show the count. Controls should have a button that calls onIncrement when clicked. State lives only in the parent.", hint: "Display: return <div>Count: {count}</div>; Controls: return <button onClick={onIncrement}>+</button>", answer_keywords: ["count", "onclick", "onincrement"], seed_code: `import { useState } from 'react'

function Display({ count }) { return <div>Count: {count}</div> }
function Controls({ onIncrement }) { return <button onClick={onIncrement}>+</button> }

export default function Parent() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <Display count={count} />
      <Controls onIncrement={() => setCount(c => c + 1)} />
    </div>
  )
}`, feedback_correct: "✅ Siblings share state via parent.", feedback_partial: "Display shows count, Controls calls onIncrement.", feedback_wrong: "Both children receive props from parent.", expected: "Display and Controls wired to parent state." },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Add a decrement button in Controls. Pass onDecrement from parent. Export the parent.", hint: "Controls({ onIncrement, onDecrement }); parent passes () => setCount(c => c - 1)", answer_keywords: ["ondecrement", "button", "export"], seed_code: `import { useState } from 'react'

function Display({ count }) { return <div>Count: {count}</div> }
function Controls({ onIncrement, onDecrement }) {
  return (
    <div>
      <button onClick={onIncrement}>+</button>
      <button onClick={onDecrement}>-</button>
    </div>
  )
}

export default function Parent() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <Display count={count} />
      <Controls onIncrement={() => setCount(c => c + 1)} onDecrement={() => setCount(c => c - 1)} />
    </div>
  )
}`, feedback_correct: "✅ Lifting state up complete.", feedback_partial: "Decrement and export.", feedback_wrong: "onDecrement from parent to Controls.", expected: "onDecrement from parent to Controls. Export the component." },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];

export default createINPACTEngine({ NODES, sideItems, lessonNum: 25, title: "Lifting State Up", shortName: "LIFTING STATE UP" });
