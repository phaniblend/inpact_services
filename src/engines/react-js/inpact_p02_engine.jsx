import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "LESSON #2",
      title: "Toggle Visibility",
      body: `A page with a button and a paragraph of text.

  Clicking the button HIDES the paragraph if it's visible.
  Clicking it again SHOWS it.
  The button label changes too.

Example:
  Start        →  [ Hide ]  Hello, I am visible!
  Click button →  [ Show ]
  Click button →  [ Hide ]  Hello, I am visible!`,
      usecase: `Every "Read more / Show less" link, cookie banner dismiss, and FAQ accordion uses this exact pattern.`,
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Use useState with a boolean value — differentiate from numeric or string state management",
      "Initialise boolean state to true or false based on initial UI requirements (e.g. visibility, active/inactive)",
      "Use the functional update form (e.g. setVisible(prev => !prev)) to safely toggle boolean state and avoid stale state",
      "Implement conditional rendering using the && operator to show or hide JSX based on boolean state",
      "Bind a button's label (or other UI text) to boolean state so it updates reactively when state changes",
      "Explain why !prev in functional updates is safer than referencing current state directly (e.g. in async contexts)",
      "Build a complete React component that integrates boolean state: initialisation, toggling, and conditional rendering (e.g. collapsible panel, toggle switch, modal)",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 5",
    paal: "Declare a state variable called isVisible (setter: setIsVisible) to hold a boolean. The paragraph starts visible — what should the initial value be?",
    hint: "This isn't a number. The paragraph is either visible or it isn't. What primitive type represents that?",
    example_code: `const [isLoggedIn, setIsLoggedIn] = useState(false)`,
    evaluate: (ans) => {
      const a = ans.replace(/\s/g, "").toLowerCase();
      const hasUseState = a.includes("usestate");
      const hasTrue = a.includes("(true)");
      const hasBoolName = /const\[i?s?\w+,/.test(ans.replace(/\s/g, ""));
      if (hasUseState && hasTrue && hasBoolName) return "correct";
      if (hasUseState && hasTrue) return "partial";
      if (hasUseState) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Boolean state declared, starts visible — perfect. Your variable name is saved and will carry through every step from here.",
    feedback_partial: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      if (!a.includes("(true)")) return "Close — but check the initial value. The paragraph starts visible, so it should be true.";
      return "Almost — make sure you're destructuring: const [yourVarName, setYourVarName] = useState(true)";
    },
    feedback_wrong: "Declare it like: const [show, setShow] = useState(true)\n\nPick any name you like — true means it starts visible.",
    expected: `const [isVisible, setIsVisible] = useState(true)`,
    seed_code: `import { useState } from 'react'

export default function Toggle() {
  // Step 1: declare boolean state — paragraph starts visible
  
}`,
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 5",
    paal: "Write a function called toggle that flips isVisible. One click: true → false. Another click: false → true. Use the functional update form.",
    hint: "! flips a boolean. true becomes false, false becomes true. And remember — use the functional update form so you always get the latest value.",
    example_code: `const toggleMenu = () => setIsOpen(prev => !prev)`,
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      const hasFn = a.includes("const") && a.includes("=>");
      const hasFlip = a.includes("!prev");
      const hasFunctional = a.includes("(prev=>") || a.includes("(prev =>") || a.includes("(prev)=>") || a.includes("(prev) =>");
      const hasNamedParam = /const\s+\w+\s*=\s*\w\s*=>/.test(ans) && !/const\s+\w+\s*=\s*\(\s*\)\s*=>/.test(ans);
      if (hasNamedParam) return "named_param";
      if (hasFn && hasFlip && hasFunctional) return "correct";
      if (hasFlip) return "partial";
      if (a.includes("set") && a.includes("=>")) return "partial";
      return "wrong";
    },
    feedback_named_param: "Almost — but the toggle function takes no arguments, so use () => not t => or e =>.\n\nTry: const toggle = () => setShow(prev => !prev)",
    feedback_correct: "✅ The functional update form prev => !prev is the right pattern. React guarantees prev is always the latest value — no stale state bugs.",
    feedback_partial: "Almost — the flip logic is there. Wrap it in a named arrow function with empty parens:\nconst toggle = () => yourSetter(prev => !prev)",
    feedback_wrong: "const toggle = () => setIsVisible(prev => !prev)\n\nprev => !prev flips whatever the current value is. One function, both directions.",
    expected: `const toggle = () => setIsVisible(prev => !prev)`,
    seed_code: `import { useState } from 'react'

export default function Toggle() {
  const [isVisible, setIsVisible] = useState(true)

  // Step 2: write the toggle function
  
}`,
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 5",
    paal: "Write the JSX return. Include a button (label 'Toggle' for now) and a paragraph with the text \"Hello, I am visible!\" — but only render the paragraph when isVisible is true. Don't wire the button yet.",
    hint: "In JSX, {condition && <element />} renders the element only when condition is true. When false, nothing renders.",
    example_code: `return (
  <div>
    {hasError && <p>Something went wrong.</p>}
  </div>
)`,
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      const hasBadReturn = /return\s*\(\s*\{/.test(ans);
      const hasValidReturn = !hasBadReturn && /return\s*\(/.test(ans);
      const hasConditional = /\w+\s*&&\s*<p/.test(ans);
      const hasParagraph = a.includes("<p>");
      const hasButton = a.includes("<button");
      if (hasBadReturn) return "syntax";
      if (hasValidReturn && hasConditional && hasParagraph && hasButton) return "correct";
      if (hasConditional && hasParagraph) return "partial";
      if (hasButton) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Conditional render with &&. When the boolean is false, React renders nothing — the paragraph simply doesn't exist in the DOM.",
    feedback_syntax: "Almost — but check your return statement. It should be return ( not return(){ — the parentheses wrap the JSX, they don't call a function.",
    feedback_partial: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      if (!a.includes("<button")) return "Paragraph is conditionally rendered — now add the button too (don't wire it yet).";
      if (!a.includes("&&")) return "Good structure — but the paragraph needs to be conditional. Wrap it: {isVisible && <p>Hello, I am visible!</p>}";
      return "Almost — check you have both: a button AND the conditional paragraph using &&.";
    },
    feedback_wrong: `return (
  <div>
    <button>Toggle</button>
    {isVisible && <p>Hello, I am visible!</p>}
  </div>
)`,
    expected: `return (
  <div>
    <button>Toggle</button>
    {isVisible && <p>Hello, I am visible!</p>}
  </div>
)`,
    seed_code: `import { useState } from 'react'

export default function Toggle() {
  const [isVisible, setIsVisible] = useState(true)

  const toggle = () => setIsVisible(prev => !prev)

  // Step 3: write the JSX — conditional paragraph + button (no onClick yet)
  
}`,
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 5",
    paal: "In the JSX, wire the button: add onClick={toggle} and make its label dynamic — show 'Hide' when isVisible is true, 'Show' when false.",
    hint: "A ternary works here: isVisible ? 'Hide' : 'Show'. Same for onClick — wire it to toggle.",
    example_code: `<button onClick={togglePlay}>
  {isPlaying ? "Pause" : "Play"}
</button>`,
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      const hasOnClick = a.includes("onclick={toggle}");
      const hasTernary = (a.includes("hide") && a.includes("show")) ||
                         (a.includes("isvisible?") || a.includes("isvisible ?"));
      if (hasOnClick && hasTernary) return "correct";
      if (hasOnClick || hasTernary) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Dynamic label + wired onClick. The ternary isVisible ? 'Hide' : 'Show' reads state directly — every re-render picks up the latest value.",
    feedback_partial: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      if (!a.includes("onclick={toggle}")) return "Label is dynamic — now wire the button: onClick={toggle}";
      return "onClick is wired — now make the label dynamic: {isVisible ? 'Hide' : 'Show'}";
    },
    feedback_wrong: `<button onClick={toggle}>
  {isVisible ? "Hide" : "Show"}
</button>`,
    expected: `<button onClick={toggle}>
  {isVisible ? "Hide" : "Show"}
</button>`,
    seed_code: `import { useState } from 'react'

export default function Toggle() {
  const [isVisible, setIsVisible] = useState(true)

  const toggle = () => setIsVisible(prev => !prev)

  return (
    <div>
      <button>Toggle</button>
      {isVisible && <p>Hello, I am visible!</p>}
    </div>
  )
  // Step 4: wire onClick to toggle and make the button label dynamic
}`,
  },
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 5",
    paal: "In the JSX, add onClick={toggle} to the button and replace the static 'Toggle' label with {isVisible ? 'Hide' : 'Show'}, then submit the full component.",
    hint: "Order: import → export default function → useState → toggle fn → return JSX with wired button and conditional paragraph.",
    example_code: `import { useState } from 'react'

export default function Spoiler() {
  const [revealed, setRevealed] = useState(false)

  const toggle = () => setRevealed(prev => !prev)

  return (
    <div>
      <button onClick={toggle}>
        {revealed ? "Hide answer" : "Show answer"}
      </button>
      {revealed && <p>The answer is 42.</p>}
    </div>
  )
}`,
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      const checks = [
        a.includes("import") && a.includes("usestate"),
        a.includes("exportdefaultfunction") || a.includes("exportdefault"),
        a.includes("usestate(true)"),
        a.includes("prev=>!prev"),
        a.includes("onclick={toggle}"),
        a.includes("&&") && a.includes("<p>"),
        a.includes("?") && (a.includes("hide") || a.includes("show")),
      ];
      const passed = checks.filter(Boolean).length;
      if (passed >= 6) return "correct";
      if (passed >= 4) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Complete. useState(true) → toggle with !prev → conditional render with && → dynamic label with ternary. That's the full boolean toggle pattern.",
    feedback_partial: "Almost — check: useState(true) for initial value, prev => !prev for the toggle, {isVisible && <p>} for conditional render, {isVisible ? 'Hide' : 'Show'} for the label.",
    feedback_wrong: "Start: import → export default function → const [isVisible, setIsVisible] = useState(true) → toggle fn → return with wired button and conditional paragraph.",
    expected: `import { useState } from 'react'

export default function Toggle() {
  const [isVisible, setIsVisible] = useState(true)

  const toggle = () => setIsVisible(prev => !prev)

  return (
    <div>
      <button onClick={toggle}>
        {isVisible ? "Hide" : "Show"}
      </button>
      {isVisible && <p>Hello, I am visible!</p>}
    </div>
  )
}`,
    seed_code: `import { useState } from 'react'

export default function Toggle() {
  const [isVisible, setIsVisible] = useState(true)

  const toggle = () => setIsVisible(prev => !prev)

  // Step 5: add onClick={toggle} and make the label dynamic
  return (
    <div>
      <button>Toggle</button>
      {isVisible && <p>Hello, I am visible!</p>}
    </div>
  )
}`,
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Boolean state", id: "step1" },
  { label: "Step 2 — Toggle fn", id: "step2" },
  { label: "Step 3 — Conditional JSX", id: "step3" },
  { label: "Step 4 — Wire + label", id: "step4" },
  { label: "Step 5 — Full", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: 2, title: "Toggle Visibility", shortName: "TOGGLE VISIBILITY" });
