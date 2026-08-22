import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "LESSON #1",
      title: "Counter App",
      body: `Build a simple screen that displays a number starting at 0 and lets the user change it using buttons:

  [ + ]     increases the number by 1
  [ - ]     decreases the number by 1
  [ Reset ] brings the number back to 0

Example:
  Start       →  0
  Click +     →  1
  Click +     →  2
  Click -     →  1
  Click Reset →  0`,
      usecase: "You'll use this exact pattern in a shopping cart — the [ + ] and [ - ] buttons that change item quantity, and a Reset button that clears it.",
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Use the useState hook to store and manage a changing value inside a React component",
      "Destructure the return value of useState into a state variable and a setter function",
      "Update state by calling the setter (e.g. setCount) instead of reassigning a variable",
      "Define named callback functions (increment, decrement, reset) inside a React component",
      "Assign a callback function to a button's onClick event handler",
      "Use the functional update form setCount(prev => prev + 1) when new state depends on old state",
      "Use setCount(0) for reset and setCount(prev => prev ± 1) when the new value depends on the previous state",
      "Structure a complete React component: import → state → handlers → return JSX",
      "Export a React component using the export default function syntax",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 5",
    paal: "Initialise a state variable to hold the counter value. It should start at 0.",
    hint: "You'll need to import something from React first. Then use array destructuring.",
    answer_keywords: ["usestate", "count", "setcount", "0"],
    seed_code: `import { useState } from 'react'

export default function Counter() {
  // Step 1: declare your state variable here

}`,
    example_code: `const [score, setScore] = useState(0)`,
    feedback_correct: "✅ Correct. useState(0) gives you back two things — count (the current value) and setCount (the function to change it). Calling setCount does two things: updates the value AND tells React to re-render the screen. A regular variable only does the first.",
    feedback_partial: "Almost — make sure you're destructuring both the value and the setter from useState, and passing 0 as the initial value.",
    feedback_wrong: "Think about this: React needs to remember values between re-renders. A regular variable resets every render. Try: const [count, setCount] = useState(0)",
    expected: `const [count, setCount] = useState(0)`,
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 5",
    paal: "Write the JSX that displays count on screen and renders three buttons: +, -, and Reset. Don't wire them up yet.",
    hint: "Display the number in an element (e.g. <h1>{count}</h1> or <span>{count}</span>). Three <button> elements: +, -, and Reset.",
    answer_keywords: ["return", "button", "count", "+", "-", "reset"],
    seed_code: `import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  // Step 2: write your return JSX here

}`,
    example_code: `const [username, setUsername] = useState("guest")

return (
  <div>
    <h2>{username}</h2>
    <button>Change</button>
  </div>
)`,
    feedback_correct: "✅ Perfect. Your UI is on screen. count in curly braces tells React to display the live value — whenever count changes, React updates just that part of the DOM.",
    feedback_partial: "You're close — make sure you have all three buttons and you're displaying {count} in your JSX.",
    feedback_wrong: "Start with a return statement wrapping a div. Inside: display {count} in an element (e.g. <h1> or <span>) and three <button> elements: +, -, Reset.",
    expected: `return (
  <div>
    <h1>{count}</h1>
    <button>+</button>
    <button>-</button>
    <button>Reset</button>
  </div>
)`,
  },
  {
    id: "step3a",
    type: "question",
    phase: "Step 3 of 6",
    paal: "Define the increment function. It should increase count by 1 when called.",
    hint: "prev inside setCount is not the same as a parameter of the function. Keep the arrow function empty: () => ...",
    example_code: `const addPoint = () => setScore(prev => prev + 1)`,
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      const hasFunc = a.includes("constincrement") || a.includes("increment=()=>");
      const hasFunctionalUpdate = a.includes("setcount(prev=>") || a.includes("setcount((prev)=>");
      const hasWrongPrev = /\(prev\)=>setcount/.test(a) || /prev=>setcount/.test(a);
      if (hasFunc && hasFunctionalUpdate) return "correct";
      if (hasWrongPrev) return "partial";
      if (a.includes("setcount") && a.includes("prev")) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. increment is a zero-argument function. prev lives inside setCount — React gives it the latest value automatically.",
    feedback_partial: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      if (/\(prev\)=>setcount/.test(a)) return "Close — but (prev) here would receive the click event, not the count. The fix: const increment = () => setCount(prev => prev + 1)";
      return "Almost — make sure the shape is: const increment = () => setCount(prev => prev + 1)";
    },
    feedback_wrong: "const increment = () => setCount(prev => prev + 1)\n\nincrement takes no params. prev goes inside setCount, not outside.",
    seed_code: `import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  // Step 3a: define the increment function here
  

  return (
    <div>
      <h1>{count}</h1>
      <button>+</button>
      <button>-</button>
      <button>Reset</button>
    </div>
  )
}
`,
    expected: `const increment = () => setCount(prev => prev + 1)`,
  },
  {
    id: "step3b",
    type: "question",
    phase: "Step 4 of 6",
    paal: "In the JSX, wire increment to the + button using onClick.",
    hint: "onClick takes a reference to the function — no parentheses. onClick={increment} not onClick={increment()}",
    example_code: `const save = () => console.log("saved")
<button onClick={save}>Save</button>`,
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      const hasOnClick = a.includes("onclick={increment}");
      const badOnClick = a.includes("onclick={increment()}");
      if (hasOnClick && !badOnClick) return "correct";
      if (badOnClick) return "partial";
      if (a.includes("onclick") && a.includes("increment")) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ onClick={increment} — passing the reference, not calling it. That's the correct pattern for all event handlers.",
    feedback_partial: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      if (a.includes("onclick={increment()}")) return "Close — but onClick={increment()} calls it immediately on render. Remove the () — just onClick={increment}";
      return "Almost — make sure it's onClick={increment} on the + button.";
    },
    feedback_wrong: `<button onClick={increment}>+</button>\n\nNote: no () after increment. You're passing the function, not calling it.`,
    seed_code: `import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  const increment = () => setCount(prev => prev + 1)

  // Step 3b: wire increment to the + button with onClick
  return (
    <div>
      <h1>{count}</h1>
      <button>+</button>
      <button>-</button>
      <button>Reset</button>
    </div>
  )
}
`,
    expected: `<button onClick={increment}>+</button>`,
  },
  {
    id: "step4a",
    type: "question",
    phase: "Step 5 of 6",
    paal: "Define the decrement function. It should decrease count by 1.",
    hint: "Mirror of increment — same shape, just subtract instead of add.",
    example_code: `const removePoint = () => setScore(prev => prev - 1)`,
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      const hasFunc = a.includes("constdecrement") || a.includes("decrement=()=>");
      const hasFunctionalUpdate = a.includes("setcount(prev=>prev-1)") || a.includes("setcount((prev)=>prev-1)") || a.includes("setcount(prev=>prev-");
      if (hasFunc && hasFunctionalUpdate) return "correct";
      if (a.includes("decrement") && a.includes("setcount")) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Same pattern as increment — just flipped. You'll use this shape constantly.",
    feedback_partial: "Almost — make sure: const decrement = () => setCount(prev => prev - 1)",
    feedback_wrong: "const decrement = () => setCount(prev => prev - 1)\n\nMirror of increment. prev - 1 instead of prev + 1.",
    seed_code: `import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  const increment = () => setCount(prev => prev + 1)
  // Step 4a: define the decrement function here
  

  return (
    <div>
      <h1>{count}</h1>
      <button onClick={increment}>+</button>
      <button>-</button>
      <button>Reset</button>
    </div>
  )
}
`,
    expected: `const decrement = () => setCount(prev => prev - 1)`,
  },
  {
    id: "step4b",
    type: "question",
    phase: "Step 6 of 6",
    paal: "Define the reset function. In the JSX, wire all three buttons with onClick (increment on +, decrement on -, reset on Reset).",
    hint: "reset always goes to 0 — no prev needed. setCount(0) is enough.",
    example_code: `const clearBasket = () => setItems(0)
<button onClick={clearBasket}>Clear</button>`,
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      const hasReset = a.includes("constreset") || a.includes("reset=()=>");
      const hasSetZero = a.includes("setcount(0)");
      const hasDecrementWired = a.includes("onclick={decrement}");
      const hasResetWired = a.includes("onclick={reset}");
      if (hasReset && hasSetZero && hasDecrementWired && hasResetWired) return "correct";
      if (hasReset && hasSetZero) return "partial";
      if (a.includes("reset") && a.includes("setcount")) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ reset uses setCount(0) directly — no prev needed since it always resets to zero regardless of current value.",
    feedback_partial: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      if (!a.includes("onclick={decrement}")) return "reset is defined but - button isn't wired. Add onClick={decrement} to the - button.";
      if (!a.includes("onclick={reset}")) return "decrement is wired but Reset button isn't. Add onClick={reset} to the Reset button.";
      return "Almost — define reset as: const reset = () => setCount(0), then wire both remaining buttons.";
    },
    feedback_wrong: `const reset = () => setCount(0)

Then wire:
<button onClick={decrement}>-</button>
<button onClick={reset}>Reset</button>`,
    seed_code: `import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  const increment = () => setCount(prev => prev + 1)
  const decrement = () => setCount(prev => prev - 1)
  // Step 4b: define reset and wire all three buttons

  return (
    <div>
      <h1>{count}</h1>
      <button onClick={increment}>+</button>
      <button>-</button>
      <button>Reset</button>
    </div>
  )
}
`,
    expected: `const reset = () => setCount(0)

<button onClick={decrement}>-</button>
<button onClick={reset}>Reset</button>`,
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — State", id: "step1" },
  { label: "Step 2 — JSX", id: "step2" },
  { label: "Step 3 — Define fn", id: "step3a" },
  { label: "Step 4 — Wire onClick", id: "step3b" },
  { label: "Step 5 — Decrement", id: "step4a" },
  { label: "Step 6 — Reset + Wire", id: "step4b" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: 1, title: "Counter App", shortName: "COUNTER APP" });
