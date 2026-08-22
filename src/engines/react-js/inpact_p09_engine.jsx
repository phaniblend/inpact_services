import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "LESSON #9",
      title: "Color Picker",
      body: `Change the background color of a div based on a dropdown selection.

Build a <select> with options (e.g. Red, Green, Blue) and a div. When the user picks a color from the dropdown, the div's background updates to that color.`,
      usecase: "Theme switchers, chart color selectors, and any UI that lets users choose from a fixed set of options use this pattern.",
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Use useState with a string to hold the selected color value",
      "Render a <select> with <option> elements",
      "Wire value and onChange to make the select controlled",
      "Apply dynamic inline style (e.g. backgroundColor) to a div based on state",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 4",
    paal: "Declare state for the selected color. Use a string (e.g. \"red\" or \"#ff0000\"). Pick an initial value that matches one of the options you'll add later.",
    hint: "useState with a string. Example: useState(\"red\")",
    answer_keywords: ["usestate", "color", "setcolor", "red"],
    seed_code: `import { useState } from 'react'

export default function ColorPicker() {
  // Step 1: state for selected color (string)
  
}`,
    example_code: "const [theme, setTheme] = useState(\"dark\")",
    feedback_correct: "✅ Color state declared. You'll use this value for both the select and the div background.",
    feedback_partial: "Almost — use useState with a string initial value, e.g. \"red\".",
    feedback_wrong: "const [color, setColor] = useState(\"red\")",
    expected: `const [color, setColor] = useState("red")`,
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 4",
    paal: "In the JSX (inside the return), add a <select> with at least three <option> values (e.g. red, green, blue). Wire value={color} and onChange so the handler calls setColor(e.target.value) to update state.",
    hint: "Controlled select: value={color}, onChange={(e) => setColor(e.target.value)}",
    answer_keywords: ["select", "option", "value", "onchange", "setcolor", "target.value"],
    seed_code: `import { useState } from 'react'

export default function ColorPicker() {
  const [color, setColor] = useState("red")

  // Step 2: controlled <select> with options
  
}`,
    example_code: "// Controlled input: value + onChange\n<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder=\"Search\" />",
    feedback_correct: "✅ Controlled select. When the user picks an option, state updates and the UI stays in sync.",
    feedback_partial: "Make sure you have value={color} and onChange that calls setColor(e.target.value).",
    feedback_wrong: "<select value={color} onChange={(e) => setColor(e.target.value)}>\n  <option value=\"red\">Red</option>\n  <option value=\"green\">Green</option>\n  <option value=\"blue\">Blue</option>\n</select>",
    expected: `<select value={color} onChange={(e) => setColor(e.target.value)}>
  <option value="red">Red</option>
  <option value="green">Green</option>
  <option value="blue">Blue</option>
</select>`,
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 4",
    paal: "In the JSX, add a div whose background color follows state. Use inline style: style={{ backgroundColor: color }}. You can add a mapping from color names to hex if you like.",
    hint: "Inline style object: style={{ backgroundColor: color }}. For named colors, CSS accepts \"red\", \"green\", etc.",
    answer_keywords: ["div", "style", "backgroundcolor", "color"],
    seed_code: `import { useState } from 'react'

export default function ColorPicker() {
  const [color, setColor] = useState("red")

  return (
    <div>
      <select value={color} onChange={(e) => setColor(e.target.value)}>
        <option value="red">Red</option>
        <option value="green">Green</option>
        <option value="blue">Blue</option>
      </select>
      {/* Step 3: div with dynamic backgroundColor */}
    </div>
  )
}`,
    example_code: "// Dynamic style: <div style={{ color: theme, width: \"200px\" }}>Sample text</div>",
    feedback_correct: "✅ Dynamic style. The div background now reflects the selected color.",
    feedback_partial: "Add a div with style={{ backgroundColor: color }}.",
    feedback_wrong: "<div style={{ backgroundColor: color }}>Preview</div>",
    expected: `<div style={{ backgroundColor: color, minHeight: "100px" }}>Preview</div>`,
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 4",
    paal: "You've built state, the controlled select, and the div with dynamic background. Check that everything is in place (and that you have export default), then submit.",
    hint: "Combine step 1–3 in one component.",
    answer_keywords: ["import", "usestate", "export", "default", "color", "select", "backgroundcolor"],
    seed_code: `import { useState } from 'react'

export default function ColorPicker() {
  // Step 4: full component
  
}`,
    feedback_correct: "✅ Color Picker complete. Dropdown drives div background — classic controlled UI.",
    feedback_partial: "Ensure you have: useState for color, controlled select, and div with style={{ backgroundColor: color }}.",
    feedback_wrong: "Combine state, select with value/onChange, and div with backgroundColor.",
    expected: `import { useState } from 'react'

export default function ColorPicker() {
  const [color, setColor] = useState("red")
  return (
    <div>
      <select value={color} onChange={(e) => setColor(e.target.value)}>
        <option value="red">Red</option>
        <option value="green">Green</option>
        <option value="blue">Blue</option>
      </select>
      <div style={{ backgroundColor: color, minHeight: "100px" }} />
    </div>
  )
}`,
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — State", id: "step1" },
  { label: "Step 2 — Select", id: "step2" },
  { label: "Step 3 — Div style", id: "step3" },
  { label: "Step 4 — Full", id: "step4" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: 9, title: "Color Picker", shortName: "COLOR PICKER" });
