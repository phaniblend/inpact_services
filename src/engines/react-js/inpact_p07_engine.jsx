import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "LESSON #7",
      title: "useEffect & Side Effects",
      body: `A document title updater. Every time the count changes,
the browser tab title updates automatically.

count = 0  →  tab shows "Count: 0"
count = 1  →  tab shows "Count: 1"
count = 5  →  tab shows "Count: 5"

No button click triggers this — it just happens
whenever count changes.`,
      usecase: `useEffect is how React talks to the outside world — the DOM, APIs, timers, localStorage. Any time you need something to happen as a consequence of state changing, useEffect is the tool.`,
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Understand what a \"side effect\" is and why it lives outside render",
      "Write a useEffect with a callback function",
      "Use the dependency array to control when the effect runs",
      "Understand the three dependency array modes: [], [value], no array",
      "Update document.title from inside useEffect",
      "Explain why setting state directly in render causes infinite loops",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 6",
    paal: "Import useEffect alongside useState from 'react'.",
    hint: "Both hooks live in the same package:\nimport { useState, useEffect } from 'react'",
    example_code: `import { useState, useEffect } from 'react'`,
    evaluate: (ans) => {
      const a = ans.replace(/\s/g, "").toLowerCase();
      const bothImported = a.includes("usestate") && a.includes("useeffect") && a.includes("from'react'");
      if (bothImported) return "correct";
      if (a.includes("usestate") && !a.includes("useeffect")) return "partial_effect";
      if (a.includes("useeffect") && !a.includes("usestate")) return "partial_state";
      return "wrong";
    },
    feedback_correct: "✅ Both hooks imported. Now declare the state variable.",
    feedback_partial_effect: "useState is there — add useEffect too:\nimport { useState, useEffect } from 'react'",
    feedback_partial_state: "useEffect is there — add useState too:\nimport { useState, useEffect } from 'react'",
    feedback_wrong: `import { useState, useEffect } from 'react'`,
    expected: `import { useState, useEffect } from 'react'`,
    seed_code: `// Step 1: import both useState and useEffect from 'react'

export default function Counter() {

}`,
  },
  {
    id: "step1b",
    type: "question",
    phase: "Step 2 of 6",
    paal: "Declare a state variable called count (setter: setCount) starting at 0.",
    hint: "const [count, setCount] = useState(0)",
    example_code: `const [score, setScore] = useState(0)`,
    evaluate: (ans) => {
      const a = ans.replace(/\s/g, "").toLowerCase();
      if (/const\[count,setcount\]=usestate\(0\)/.test(a)) return "correct";
      if (a.includes("usestate(0)") && /const\[\w+,\w+\]=usestate\(0\)/.test(a)) return "naming";
      if (a.includes("usestate(0)")) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ count state declared at 0. Ready for the useEffect.",
    feedback_naming: `Use count / setCount so all steps stay in sync:\nconst [count, setCount] = useState(0)`,
    feedback_partial: "useState(0) ✓ — destructure the result:\nconst [count, setCount] = useState(0)",
    feedback_wrong: `const [count, setCount] = useState(0)`,
    expected: `const [count, setCount] = useState(0)`,
    seed_code: `import { useState, useEffect } from 'react'

export default function Counter() {
  // Step 2: declare count state starting at 0

}`,
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 3 of 6",
    paal: "Write a useEffect that sets document.title to \"Count: \" + count. Add [count] as the dependency array so it runs every time count changes.",
    hint: "useEffect takes two arguments — a callback and a dependency array:\n  useEffect(() => {\n  document.title = 'Count: ' + count\n}, [count])",
    example_code: `useEffect(() => {
  console.log('Score changed:', score)
}, [score])`,
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      const hasUseEffect = a.includes("useeffect(");
      const hasDocTitle = a.includes("document.title");
      const hasDepArray = a.includes("[count]") || a.includes("[" + "count" + "]");
      const hasCallback = a.includes("()=>{") || a.includes("()=>");
      const hasNoArray = hasUseEffect && hasDocTitle && !a.includes("[");
      const hasEmptyArray = a.includes("[]");
      if (hasUseEffect && hasDocTitle && hasDepArray && hasCallback) return "correct";
      if (hasUseEffect && hasDocTitle && hasEmptyArray) return "partial_deps_empty";
      if (hasUseEffect && hasDocTitle && hasNoArray) return "partial_deps_missing";
      if (hasUseEffect && !hasDocTitle) return "partial_title";
      if (hasDocTitle && !hasUseEffect) return "partial_effect";
      return "wrong";
    },
    feedback_correct: "✅ useEffect with [count] dependency — runs after mount and after every count change. document.title syncs automatically.",
    feedback_partial_deps_empty: "document.title is set — but [] means 'run once on mount only'. Use [count] so it re-runs every time count changes.",
    feedback_partial_deps_missing: "document.title is set inside useEffect — now add the dependency array [count] as the second argument:\nuseEffect(() => { ... }, [count])",
    feedback_partial_title: "useEffect is there — but set document.title inside it:\nuseEffect(() => {\n  document.title = 'Count: ' + count\n}, [count])",
    feedback_partial_effect: "document.title is being set — but wrap it in useEffect so React controls when it runs:\nuseEffect(() => { document.title = 'Count: ' + count }, [count])",
    feedback_wrong: `useEffect(() => {
  document.title = 'Count: ' + count
}, [count])`,
    expected: `useEffect(() => {
  document.title = 'Count: ' + count
}, [count])`,
    seed_code: `import { useState, useEffect } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  // Step 2: useEffect that sets document.title — runs when count changes

}`,
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 4 of 6",
    paal: "Write the JSX. Show the current count in a paragraph. Add two buttons — one to increment count by 1, one to decrement by 1. Wire each button with onClick: the +1 button should call setCount(prev => prev + 1), the -1 button should call setCount(prev => prev - 1).",
    hint: "Paragraph: <p>Count: {count}</p>. Buttons: <button onClick={() => setCount(prev => prev + 1)}>+1</button> and <button onClick={() => setCount(prev => prev - 1)}>-1</button>. Both use the functional update form.",
    example_code: `<p>Score: {score}</p>
<button onClick={() => setScore(p => p + 1)}>+1</button>
<button onClick={() => setScore(p => p - 1)}>-1</button>`,
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      const hasBadReturn = /return\s*\(\s*\{/.test(ans);
      if (hasBadReturn) return "syntax";
      const hasReturn = /return\s*\(/.test(ans);
      const hasPara = a.includes("<p>") && a.includes("{count}");
      const hasIncrement = /\w+\s*=>\s*\(?\w+\s*\+\s*1/.test(ans) || a.includes("count+1") || a.includes("count + 1");
      const hasDecrement = /\w+\s*=>\s*\(?\w+\s*-\s*1/.test(ans) || a.includes("count-1") || a.includes("count - 1");
      const hasButtons = (a.match(/<button/g) || []).length >= 2;
      const hasOnClick = (a.match(/onclick=/g) || []).length >= 2;
      if (hasReturn && hasPara && hasIncrement && hasDecrement && hasButtons) return "correct";
      if (hasButtons && hasPara && (!hasIncrement || !hasDecrement)) return "partial_logic";
      if (hasButtons && !hasPara) return "partial_para";
      if (hasPara && !hasButtons) return "partial_buttons";
      if (hasReturn) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Count displayed, two buttons wired. Every click updates count → useEffect fires → document.title updates.",
    feedback_syntax: "Syntax error: return(){\n  is not valid. Use return ( to wrap JSX.",
    feedback_partial_logic: "Buttons are there — check the increment/decrement logic:\n+1 button: onClick={() => setCount(prev => prev + 1)}\n-1 button: onClick={() => setCount(prev => prev - 1)}",
    feedback_partial_para: "Buttons look good — add a paragraph showing the current count:\n<p>Count: {count}</p>",
    feedback_partial_buttons: "Paragraph is there — now add two buttons for increment and decrement.",
    feedback_partial: "Add: <p>Count: {count}</p> and two buttons with onClick handlers for +1 and -1.",
    feedback_wrong: `return (
  <div>
    <p>Count: {count}</p>
    <button onClick={() => setCount(prev => prev + 1)}>+1</button>
    <button onClick={() => setCount(prev => prev - 1)}>-1</button>
  </div>
)`,
    expected: `<p>Count: {count}</p>\n<button onClick={() => setCount(prev => prev + 1)}>+1</button>\n<button onClick={() => setCount(prev => prev - 1)}>-1</button>`,
    seed_code: `import { useState, useEffect } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    document.title = 'Count: ' + count
  }, [count])

  // Step 3: JSX — paragraph with {count}, two buttons with onClick for +1 and -1

}`,
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 5 of 6",
    paal: "Add a second useEffect that runs only once when the component mounts. It should log 'Counter mounted' to the console. Use an empty dependency array.",
    hint: "Empty array [] means 'run once on mount, never again':\nuseEffect(() => {\n  console.log('Counter mounted')\n}, [])",
    example_code: `useEffect(() => {
  fetchUserData()
}, [])`,
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      const useEffectCount = (a.match(/useeffect\(/g) || []).length;
      const hasEmptyDep = a.includes(",[])") || a.includes("},[])") || a.includes("}, [])") || a.includes("},[])");
      const hasConsoleLog = a.includes("console.log");
      if (hasConsoleLog && hasEmptyDep) return "correct";
      if (hasConsoleLog && !hasEmptyDep) return "partial_array";
      if (useEffectCount >= 1 && !hasConsoleLog) return "partial_log";
      return "wrong";
    },
    feedback_correct: "✅ Two useEffects — one tracks count changes, one runs once on mount. Each effect has its own purpose and its own dependency array.",
    feedback_partial_array: "console.log is there — but add the empty dependency array [] so it only runs once on mount:\nuseEffect(() => { console.log('Counter mounted') }, [])",
    feedback_partial_log: "Second useEffect is there — add console.log('Counter mounted') inside it.",
    feedback_partial_effect: "Good console.log — wrap it in a second useEffect with [] as the dependency array:\nuseEffect(() => {\n  console.log('Counter mounted')\n}, [])",
    feedback_wrong: `useEffect(() => {
  console.log('Counter mounted')
}, [])`,
    expected: `useEffect(() => {
  console.log('Counter mounted')
}, [])`,
    seed_code: `import { useState, useEffect } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    document.title = 'Count: ' + count
  }, [count])

  // Step 4: add a second useEffect that runs once on mount — logs 'Counter mounted'

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(prev => prev + 1)}>+1</button>
      <button onClick={() => setCount(prev => prev - 1)}>-1</button>
    </div>
  )
}`,
  },
  {
    id: "step5",
    type: "question",
    phase: "Step 6 of 6",
    paal: "Submit the complete Counter component. It should have: both hooks imported, count state, two useEffects (one tracking count, one mount-only), and the JSX with paragraph and two buttons.",
    hint: "Check all five pieces: import, useState(0), useEffect with [count], useEffect with [], return with paragraph and two wired buttons.",
    example_code: `import { useState, useEffect } from 'react'

export default function LiveTitle() {
  const [text, setText] = useState('')

  useEffect(() => {
    document.title = text || 'Untitled'
  }, [text])

  useEffect(() => {
    console.log('Component ready')
  }, [])

  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <p>Title: {text}</p>
    </div>
  )
}`,
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      const checks = [
        a.includes("import") && a.includes("usestate") && a.includes("useeffect"),
        a.includes("usestate(0)"),
        a.includes("document.title") && a.includes("[count]"),
        a.includes("console.log") && (a.includes(",[])") || a.includes("},[])") || a.includes("}, [])") || a.includes("},[])")),
        (a.match(/useeffect\(/g) || []).length >= 2,
        a.includes("<p>") && a.includes("{count}"),
        (a.match(/<button/g) || []).length >= 2,
      ];
      const passed = checks.filter(Boolean).length;
      if (passed >= 6) return "correct";
      if (passed >= 4) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Complete. Two useEffects, each with the right dependency array, a count state, and wired JSX. That's side effects in React.",
    feedback_partial: "Almost — check: both hooks imported, useState(0), useEffect with document.title and [count], useEffect with console.log and [], paragraph showing count, two buttons.",
    feedback_wrong: "Structure: import both → useState(0) → useEffect for title → useEffect for mount log → return with paragraph and two buttons.",
    expected: `import { useState, useEffect } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    document.title = 'Count: ' + count
  }, [count])

  useEffect(() => {
    console.log('Counter mounted')
  }, [])

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(prev => prev + 1)}>+1</button>
      <button onClick={() => setCount(prev => prev - 1)}>-1</button>
    </div>
  )
}`,
    seed_code: `import { useState, useEffect } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    document.title = 'Count: ' + count
  }, [count])

  useEffect(() => {
    console.log('Counter mounted')
  }, [])

  // Step 6: full component — remove this comment and submit when ready
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(prev => prev + 1)}>+1</button>
      <button onClick={() => setCount(prev => prev - 1)}>-1</button>
    </div>
  )
}`,
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Import hooks", id: "step1" },
  { label: "Step 2 — Count state", id: "step1b" },
  { label: "Step 3 — useEffect[count]", id: "step2" },
  { label: "Step 4 — JSX & buttons", id: "step3" },
  { label: "Step 5 — Mount effect", id: "step4" },
  { label: "Step 6 — Full", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: 7, title: "useEffect & Side Effects", shortName: "USE EFFECT" });
