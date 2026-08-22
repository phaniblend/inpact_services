import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "JS FUNDAMENTALS #1",
      title: "Variables, Destructuring & Spread",
      body: `Modern JavaScript begins with three ideas that changed everything:
const/let (block scoping), destructuring (unpack arrays and objects
in one line), and spread/rest (expand or collect values anywhere).

const [first, ...rest] = [1, 2, 3, 4]
const { name, ...others } = user
const merged = { ...defaults, ...overrides }

These patterns appear in every React component, every API handler,
every utility function in a modern codebase.`,
      usecase: `Destructuring is how you unpack props, hook return values, and API responses. Spread is how you merge config objects and update state immutably. You'll write these dozens of times per day.`,
    },
  },
  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Understand var vs let vs const — scoping and hoisting differences",
      "Destructure arrays with position aliases and defaults",
      "Destructure objects with rename syntax and nested paths",
      "Use rest in destructuring to collect remaining values",
      "Use spread to clone, merge, and override objects and arrays",
      "Apply these patterns in function parameters directly",
    ],
  },
  {
    id: "step1", type: "question", phase: "Step 1 of 5",
    paal: "Declare a const that can't be reassigned, a let that can, and show why var is avoided (function-scoped, hoisted).",
    answer_keywords: ["const", "let", "var", "block", "scope"],
    seed_code: `// Step 1: var vs let vs const

const API_URL = 'https://api.example.com'   // block-scoped, immutable binding
let retryCount = 0                           // block-scoped, mutable

// var is function-scoped — leaks out of blocks:
for (var i = 0; i < 3; i++) {}
console.log(i)   // 3 — leaks! var is hoisted to the function

for (let j = 0; j < 3; j++) {}
// console.log(j)  // ReferenceError — let is block-scoped ✅

// const doesn't mean immutable — the binding can't change, but the value can:
const user = { name: 'Alice' }
user.name = 'Bob'       // ✅ — mutating the object is fine
// user = {}            // ❌ — rebinding the variable is not

export { API_URL, retryCount, user }`,
    feedback_correct: "✅ const/let are block-scoped. var leaks and hoists — avoid it in modern JS.",
    feedback_partial: "const = immutable binding. let = mutable binding. Both block-scoped. var = avoid.",
    feedback_wrong: "const for values that don't rebind; let for values that do; never var in modern JS.",
    expected: "const/let/var distinction",
  },
  {
    id: "step2", type: "question", phase: "Step 2 of 5",
    paal: "Destructure an array: get first, second, skip third, alias fourth as 'last', collect the rest into a 'tail' array.",
    answer_keywords: ["destructure", "[", "...", "rest", "alias"],
    seed_code: `// Step 2: array destructuring

const scores = [95, 87, 70, 64, 55, 42]

// Position-based — name them whatever you want:
const [first, second, , fourth, ...tail] = scores
//               ^^^ skip index 2 with an empty slot

console.log(first)   // 95
console.log(second)  // 87
console.log(fourth)  // 64
console.log(tail)    // [55, 42]

// Default values — used when the slot is undefined:
const [a = 0, b = 0, c = 0] = [1, 2]
console.log(c)   // 0 — default applied

// Swap two variables without a temp:
let x = 1, y = 2;
[x, y] = [y, x]
console.log(x, y)   // 2 1

export { first, second, fourth, tail }`,
    feedback_correct: "✅ Empty slots skip positions; rest collects remaining; defaults guard undefined slots.",
    feedback_partial: "const [a, , c, ...rest] = arr — skip with empty comma, collect with ...",
    feedback_wrong: "const [first, second, , fourth, ...tail] = array",
    expected: "Array destructuring with skip, rest, defaults",
  },
  {
    id: "step3", type: "question", phase: "Step 3 of 5",
    paal: "Destructure an object: rename a field, provide a default, destructure a nested object in one line.",
    answer_keywords: [":", "rename", "default", "nested", "destructure"],
    seed_code: `// Step 3: object destructuring

const response = {
  status: 200,
  data: {
    user: { id: 1, name: 'Alice', role: 'admin' }
  },
  headers: { 'content-type': 'application/json' }
}

// Rename with colon: fieldName: localName
const { status: httpStatus } = response
console.log(httpStatus)   // 200

// Default value:
const { timeout = 5000, status: code = 0 } = response
console.log(timeout)  // 5000 — default (field doesn't exist)
console.log(code)     // 200 — rename + existing value wins

// Nested destructuring in one line:
const { data: { user: { name, role } } } = response
console.log(name, role)   // 'Alice' 'admin'

// In function params — very common in React:
function greet({ name, role = 'user' }) {
  return \`Hello \${name} (\${role})\`
}

export { httpStatus, name, role }`,
    feedback_correct: "✅ Rename with :, default with =, nest as deep as needed — all composable.",
    feedback_partial: "{ field: alias = default } combines rename and default in one token.",
    feedback_wrong: "const { status: httpStatus, data: { user: { name } } } = response",
    expected: "Object destructuring with rename, default, nested",
  },
  {
    id: "step4", type: "question", phase: "Step 4 of 5",
    paal: "Use spread to clone an array, merge two arrays, and clone-and-override an object — all immutably.",
    answer_keywords: ["...", "spread", "clone", "merge", "override"],
    seed_code: `// Step 4: spread — immutable clone, merge, override

// Array spread:
const original = [1, 2, 3]
const cloned   = [...original]              // shallow clone
const appended = [...original, 4, 5]        // clone + add
const merged   = [...original, ...cloned]   // merge two

// Object spread:
const defaults = { theme: 'light', lang: 'en', debug: false }
const overrides = { lang: 'fr', debug: true }
const config = { ...defaults, ...overrides }
// { theme: 'light', lang: 'fr', debug: true }
// Later keys win — overrides always come AFTER defaults

// Immutable state update (React pattern):
const state = { count: 0, user: 'Alice', loading: false }
const nextState = { ...state, count: state.count + 1 }
// Original state is untouched ✅

// Spread in function calls:
const nums = [3, 1, 4, 1, 5]
const max = Math.max(...nums)   // 5

export { config, nextState, max }`,
    feedback_correct: "✅ Spread clones, merges, and overrides without mutating. The foundation of immutable updates.",
    feedback_partial: "{ ...base, ...override } — spread both, later keys win.",
    feedback_wrong: "const merged = { ...obj1, ...obj2 }  |  const copy = [...arr]",
    expected: "Spread for clone, merge, override",
  },
  {
    id: "step5", type: "question", phase: "Step 5 of 5",
    paal: "Combine destructuring + rest + spread in a real pattern: a function that merges component props with defaults and separates known props from passthrough props.",
    answer_keywords: ["rest", "spread", "destructure", "props", "...rest"],
    seed_code: `// Step 5: real-world composition — props separation pattern

const defaultButtonProps = {
  type: 'button',
  disabled: false,
  size: 'md',
}

// Destructure known props, collect the rest for passthrough:
function Button({ label, size = 'md', disabled = false, onClick, ...htmlProps }) {
  const finalProps = {
    ...defaultButtonProps,    // base defaults
    size,                     // override with prop
    disabled,
    onClick,
    ...htmlProps,             // passthrough: className, style, data-*, aria-*, etc.
  }
  return finalProps  // in real React: <button {...finalProps}>{label}</button>
}

// Caller can pass any native HTML button attribute — it goes through automatically:
Button({
  label: 'Submit',
  size: 'lg',
  className: 'btn-primary',   // ends up in htmlProps → passed through
  'aria-label': 'Submit form' // same
})

export { Button }`,
    feedback_correct: "✅ ...rest in destructuring + spread to forward — the canonical React prop passthrough pattern.",
    feedback_partial: "{ known, ...rest } destructures known props; then spread rest onto the element.",
    feedback_wrong: "function Comp({ knownProp, ...rest }) { return <el {...rest} /> }",
    expected: "Rest + spread for prop passthrough",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — var/let/const", id: "step1" },
  { label: "Step 2 — Array destruct", id: "step2" },
  { label: "Step 3 — Object destruct", id: "step3" },
  { label: "Step 4 — Spread", id: "step4" },
  { label: "Step 5 — Compose", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: "JS-F01", title: "Variables & Destructuring", shortName: "JS — DESTRUCTURING" });
