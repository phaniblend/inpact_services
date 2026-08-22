import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #13", title: "Props Drilling", body: `Pass data 3 levels deep. Build a small tree: App → Layer1 → Layer2 → Layer3, and pass a value (e.g. theme or user) from App down so Layer3 can display it. You'll see why passing through every layer gets tedious.`, usecase: "Understanding how data flows through props at each level." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Create Layer1, Layer2, Layer3 components", "Pass a prop from parent to child through all three", "Render the prop in Layer3", "Export the App that wires the three layers"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create Layer1 that accepts a prop (e.g. value) and passes it to Layer2. Create Layer2 that accepts value and passes it to Layer3. Create Layer3 that accepts value and renders it.", hint: "Layer1: return <Layer2 value={value} />; Layer2: return <Layer3 value={value} />; Layer3: return <span>{value}</span>", answer_keywords: ["layer1", "layer2", "layer3", "value", "props"], seed_code: `// Step 1: Layer1 → Layer2 → Layer3, pass value down
function Layer3({ value }) { return <span>{value}</span> }
function Layer2({ value }) { return <Layer3 value={value} /> }
function Layer1({ value }) { return <Layer2 value={value} /> }
export default function App() { return <Layer1 value="hello" /> }`, feedback_correct: "✅ Props passed 3 levels deep.", feedback_partial: "Each layer must receive value and pass it to the next.", feedback_wrong: "Layer1 passes value to Layer2, Layer2 to Layer3, Layer3 displays it.", expected: "Three components, value passed via props to each, rendered in Layer3.", example_code: `// Similar: pass theme down 3 levels (different names, same pattern)
function ThemeLabel({ theme }) { return <span>Theme: {theme}</span> }
function ThemeRow({ theme }) { return <ThemeLabel theme={theme} /> }
function ThemeScreen({ theme }) { return <ThemeRow theme={theme} /> }
// App: <ThemeScreen theme="dark" />` },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add a second prop (e.g. label) that only Layer3 needs. You'll have to add it to Layer1 and Layer2 even though they don't use it. That's drilling.", hint: "label passes through Layer1 and Layer2 to Layer3.", answer_keywords: ["label", "layer1", "layer2", "layer3"], seed_code: `function Layer3({ value, label }) { return <span>{label}: {value}</span> }
function Layer2({ value, label }) { return <Layer3 value={value} label={label} /> }
function Layer1({ value, label }) { return <Layer2 value={value} label={label} /> }
export default function App() { return <Layer1 value="hello" label="Message" /> }`, feedback_correct: "✅ You see how every intermediate layer must declare and forward props.", feedback_partial: "Pass label through Layer1 and Layer2 to Layer3.", feedback_wrong: "Add label prop and pass it through each layer.", expected: "label in all three, only Layer3 uses it.", example_code: `// Similar: extra prop "caption" only Bottom needs — still passed through Middle
function Bottom({ data, caption }) { return <span>{caption}: {data}</span> }
function Middle({ data, caption }) { return <Bottom data={data} caption={caption} /> }
function Top({ data, caption }) { return <Middle data={data} caption={caption} /> }` },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Export the App component. Ensure Layer1 → Layer2 → Layer3 are all in place with value (and label) passed through. You're done when the tree is wired and exported.", hint: "export default function App() { return <Layer1 value=\"...\" label=\"...\" /> }", answer_keywords: ["export", "default", "app", "layer1"], seed_code: `function Layer3({ value, label }) { return <span>{label}: {value}</span> }
function Layer2({ value, label }) { return <Layer3 value={value} label={label} /> }
function Layer1({ value, label }) { return <Layer2 value={value} label={label} /> }
export default function App() { return <Layer1 value="hello" label="Message" /> }`, feedback_correct: "✅ Props drilling complete. You passed data three levels deep. (Later you'll learn Context to avoid passing through every layer.)", feedback_partial: "Ensure you have export default and App rendering Layer1 with value and label.", feedback_wrong: "Export the App that renders <Layer1 value=\"...\" label=\"...\" />.", expected: "export default function App() { return <Layer1 value=\"...\" label=\"...\" /> }", example_code: `// Similar: export the top-level component
export default function App() { return <ThemeScreen theme="dark" /> }` },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];

export default createINPACTEngine({ NODES, sideItems, lessonNum: 13, title: "Props Drilling", shortName: "PROPS DRILLING" });
