import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "LESSON #3",
      title: "Controlled Input",
      body: `A text input and a paragraph below it.

As you type into the input, the paragraph updates in real time — letter by letter.

Example:
  Start        →  [          ]  You typed: 
  Type "Hi"    →  [ Hi       ]  You typed: Hi
  Type "Hi!"   →  [ Hi!      ]  You typed: Hi!`,
      usecase: `Every search box, live character count, username field, and form preview on the web uses this exact pattern — what the user types is shown live somewhere else on the page.`,
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Use useState with an empty string for text state",
      "Write an onChange handler that reads e.target.value",
      "Wire value={text} to make React control the input",
      "Wire onChange={handleChange} to update state on each keystroke",
      "Render live text in a paragraph using {text}",
      "Distinguish between controlled and uncontrolled inputs",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 5",
    paal: "Create a state variable called text to store what the user types in the input. The input starts empty.",
    hint: "This isn't a boolean or a number. The input starts blank. An empty string in JS is written as two quote marks with nothing between them: \"\"",
    example_code: `const [query, setQuery] = useState("")`,
    evaluate: (ans) => {
      const a = ans.replace(/\s/g, "").toLowerCase();
      const hasUseState = a.includes("usestate");
      const hasEmpty = a.includes('("")') || a.includes("('')");
      const hasCorrectName = /const\[text,/.test(ans.replace(/\s/g, ""));
      const hasSomeName = /const\[\w+,/.test(ans.replace(/\s/g, ""));
      if (hasUseState && hasEmpty && hasCorrectName) return "correct";
      if (hasUseState && hasEmpty && hasSomeName) return "naming";
      if (hasUseState && hasEmpty) return "naming";
      if (hasUseState) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ const [text, setText] = useState(\"\") — string state, starts empty. Every keystroke will update this.",
    feedback_naming: (ans) => {
      const nameMatch = ans.match(/const\s*\[(\w+)/);
      const usedName = nameMatch ? nameMatch[1] : "your variable";
      return `✅ Good — useState("") is right, empty string is the correct initial value.\n\nJust one thing: you used "${usedName}" but in this tutorial we'll use text / setText throughout so all steps stay in sync.\n\nTry: const [text, setText] = useState("")`;
    },
    feedback_partial: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      if (!a.includes('("")') && !a.includes("('')")) return "Close — but what's the initial value? The input starts empty, so use \"\" (empty string), not true or 0.";
      return "Almost — destructure it: const [text, setText] = useState(\"\")";
    },
    feedback_wrong: `Declare it like:\nconst [text, setText] = useState("")\n\n"" = empty string. The input starts blank.`,
    expected: `const [text, setText] = useState("")`,
    seed_code: `import { useState } from 'react'

export default function ControlledInput() {
  // Step 1: declare string state — input starts empty
  
}`,
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 5",
    paal: "Update the stored text when the user types so it always matches what is in the input.",
    hint: "Every input event carries a target — the input element itself. The typed value lives at e.target.value. Use that to call setText.",
    example_code: `const handleSearch = (e) => setQuery(e.target.value)`,
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      const hasFn = a.includes("const") && a.includes("=>");
      const hasEvent = a.includes("e.target.value") || a.includes("event.target.value");
      const hasSetText = a.includes("settext") || a.includes("set");
      const hasNamedParam = /const\s+\w+\s*=\s*\w\s*=>/.test(ans) && !/const\s+\w+\s*=\s*\(/.test(ans);
      if (hasNamedParam && !a.includes("(e)") && !a.includes("(event)") && !a.includes("e=>") && !a.includes("event=>")) return "named_param";
      if (hasFn && hasEvent && hasSetText) return "correct";
      if (hasEvent) return "partial";
      if (hasFn && hasSetText) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ e.target.value is how you read what's in the input. Every keypress fires onChange, which calls handleChange, which updates text state.",
    feedback_named_param: "Almost — but the param name matters here. Use (e) so you can access e.target.value:\nconst handleChange = (e) => setText(e.target.value)",
    feedback_partial: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      if (!a.includes("e.target.value") && !a.includes("event.target.value")) return "The key piece is e.target.value — that's where the typed text lives. Try: const handleChange = (e) => setText(e.target.value)";
      return "Almost — make sure you're calling setText with e.target.value inside a named function.";
    },
    feedback_wrong: `const handleChange = (e) => setText(e.target.value)\n\ne.target.value = whatever is currently typed in the input.`,
    expected: `const handleChange = (e) => setText(e.target.value)`,
    seed_code: `import { useState } from 'react'

export default function ControlledInput() {
  const [text, setText] = useState("")

  // Step 2: write handleChange — reads e.target.value and updates text
  
}`,
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 5",
    paal: "In the JSX (inside the return), add an input that displays the stored text and updates when the user types. Don't add the paragraph yet.",
    hint: "A controlled input needs two things: value={text} makes React own the displayed value, onChange={handleChange} updates state on every keystroke. Without value=, it's uncontrolled.",
    example_code: `return (
  <div>
    <input value={query} onChange={handleSearch} />
  </div>
)`,
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      const hasBadReturn = /return\s*\(\s*\{/.test(ans);
      if (hasBadReturn) return "syntax";
      const hasValidReturn = /return\s*\(/.test(ans);
      const hasInput = a.includes("<input");
      const hasValue = a.includes("value={") || a.includes("value={text}");
      const hasOnChange = a.includes("onchange={");
      if (hasValidReturn && hasInput && hasValue && hasOnChange) return "correct";
      if (hasInput && hasValue && !hasOnChange) return "partial_onchange";
      if (hasInput && hasOnChange && !hasValue) return "partial_value";
      if (hasInput) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ value={text} makes this a controlled input — React owns what's displayed. onChange={handleChange} keeps state in sync on every keystroke.",
    feedback_syntax: "Syntax error: return(){\n  is not valid. Use return (\n  to wrap JSX.",
    feedback_partial_onchange: "Good — value={text} is there. Now add onChange={handleChange} so React updates state on every keystroke.",
    feedback_partial_value: "Good — onChange={handleChange} is there. Now add value={text} to make it a controlled input. Without it, React doesn't own the displayed value.",
    feedback_partial: "You have the input — now wire it: add both value={text} and onChange={handleChange}.",
    feedback_wrong: `return (
  <div>
    <input value={text} onChange={handleChange} />
  </div>
)`,
    expected: `return (
  <div>
    <input value={text} onChange={handleChange} />
  </div>
)`,
    seed_code: `import { useState } from 'react'

export default function ControlledInput() {
  const [text, setText] = useState("")

  const handleChange = (e) => setText(e.target.value)

  // Step 3: write JSX — wired input (no paragraph yet)
  
}`,
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 5",
    paal: "In the JSX, add a paragraph below the input that shows whatever the user has typed (the same as the stored text).",
    hint: "Render the paragraph inside the same div, below the input. Use a template: <p>You typed: {text}</p> — the {text} part is JSX interpolation.",
    example_code: `<p>{query.length} characters</p>`,
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      const hasParagraph = a.includes("<p>");
      const hasTextVar = a.includes("{text}") || a.includes("{show}") || a.includes("{value}");
      const hasInput = a.includes("<input");
      const hasOnChange = a.includes("onchange={");
      if (hasParagraph && hasTextVar && hasInput && hasOnChange) return "correct";
      if (hasParagraph && !hasTextVar) return "partial_interp";
      if (!hasParagraph && hasInput) return "partial_p";
      return "wrong";
    },
    feedback_correct: "✅ {text} inside JSX renders the live state value. Every keystroke → onChange → setText → re-render → paragraph updates. That's the full controlled input loop.",
    feedback_partial_interp: "Paragraph is there — but make it dynamic. Use {text} inside it so it reflects state: <p>You typed: {text}</p>",
    feedback_partial_p: "Input is wired — now add the paragraph below it: <p>You typed: {text}</p>",
    feedback_wrong: `Add below the input:\n<p>You typed: {text}</p>\n\n{text} renders whatever is currently in state.`,
    expected: `<p>You typed: {text}</p>`,
    seed_code: `import { useState } from 'react'

export default function ControlledInput() {
  const [text, setText] = useState("")

  const handleChange = (e) => setText(e.target.value)

  // Step 4: add a paragraph showing "You typed: {text}"
  return (
    <div>
      <input value={text} onChange={handleChange} />
    </div>
  )
}`,
  },
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 5",
    paal: "In the JSX, add the missing paragraph below the input so it shows what the user typed, then submit the full component.",
    hint: "Order: useState → handleChange → return with input (value + onChange) → paragraph showing text.",
    example_code: `import { useState } from 'react'

export default function Search() {
  const [query, setQuery] = useState("")

  const handleChange = (e) => setQuery(e.target.value)

  return (
    <div>
      <input value={query} onChange={handleChange} />
      <p>Searching for: {query}</p>
    </div>
  )
}`,
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      const checks = [
        a.includes("import") && a.includes("usestate"),
        a.includes("exportdefaultfunction") || a.includes("exportdefault"),
        a.includes('usestate("")') || a.includes("usestate('')"),
        a.includes("e.target.value"),
        a.includes("value={"),
        a.includes("onchange={"),
        a.includes("<p>") && (a.includes("{text}") || a.includes("{show}") || a.includes("{value}")),
      ];
      const passed = checks.filter(Boolean).length;
      if (passed >= 6) return "correct";
      if (passed >= 4) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Complete. useState(\"\") → handleChange with e.target.value → controlled input with value + onChange → live paragraph. That's the full controlled input pattern.",
    feedback_partial: "Almost — check: useState(\"\") for initial value, e.target.value in handleChange, value={text} and onChange={handleChange} on the input, {text} in the paragraph.",
    feedback_wrong: "Start: import → export default function → useState(\"\") → handleChange → return with wired input and live paragraph.",
    expected: `import { useState } from 'react'

export default function ControlledInput() {
  const [text, setText] = useState("")

  const handleChange = (e) => setText(e.target.value)

  return (
    <div>
      <input value={text} onChange={handleChange} />
      <p>You typed: {text}</p>
    </div>
  )
}`,
    seed_code: `import { useState } from 'react'

export default function ControlledInput() {
  const [text, setText] = useState("")

  const handleChange = (e) => setText(e.target.value)

  return (
    <div>
      <input value={text} onChange={handleChange} />
      {/* Step 5: add the paragraph showing live text */}
    </div>
  )
}`,
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — String state", id: "step1" },
  { label: "Step 2 — handleChange", id: "step2" },
  { label: "Step 3 — Controlled input", id: "step3" },
  { label: "Step 4 — Live paragraph", id: "step4" },
  { label: "Step 5 — Full", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: 3, title: "Controlled Input", shortName: "CONTROLLED INPUT" });
