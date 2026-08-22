import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "TS FUNDAMENTALS #2",
      title: "Typing Functions",
      body: `Functions are where TypeScript earns its keep.
You type every parameter and the return value — the compiler then
validates every call site automatically.

function greet(name: string): string { return 'Hi ' + name }

greet('Alice')    ✅
greet(42)         ❌ Argument of type 'number' is not assignable to parameter of type 'string'

You'll also handle: optional params, default params, rest params,
overloads, and the all-important void vs undefined difference.`,
      usecase: `Every API handler, utility function, and event callback in a real app needs typed params. Getting this right eliminates an entire class of "passed wrong argument" bugs.`,
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Annotate function parameters and return type",
      "Use void for functions that return nothing",
      "Use optional params (name?: string) and default values",
      "Use rest params (...args: string[])",
      "Type arrow functions inline and as a named type",
      "Write a function overload for different input signatures",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 5",
    paal: "Write a function add(a: number, b: number): number. Then a logMessage(msg: string): void that just console.logs.",
    answer_keywords: ["number", "string", "void", "function"],
    seed_code: `// Step 1: parameter types + return type annotation

function add(a: number, b: number): number {
  return a + b
}

function logMessage(msg: string): void {
  console.log(msg)       // void = function returns nothing meaningful
}

export { add, logMessage }`,
    feedback_correct: "✅ Return type annotation on both — void is explicit about 'no return value'.",
    feedback_partial: "Annotate each param, then add ): number or ): void after the parens.",
    feedback_wrong: "function add(a: number, b: number): number { return a + b }",
    expected: "Typed params and return types",
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 5",
    paal: "Add an optional param (title?: string) and a default param (retries: number = 3). Optional means caller can skip it; default means it has a fallback value.",
    answer_keywords: ["?:", "=3", "string", "number"],
    seed_code: `// Step 2: optional and default parameters

function greetUser(name: string, title?: string): string {
  // title may be undefined — must guard before using it
  return title ? \`\${title} \${name}\` : name
}

function fetchWithRetry(url: string, retries: number = 3): Promise<Response> {
  // retries defaults to 3 if caller doesn't provide it
  return fetch(url)
}

greetUser('Alice')             // ✅ title is undefined
greetUser('Alice', 'Dr.')      // ✅ title = 'Dr.'
fetchWithRetry('/api/data')    // ✅ retries = 3

export { greetUser, fetchWithRetry }`,
    feedback_correct: "✅ Optional (?) vs default (= value) — two very different things, often confused.",
    feedback_partial: "Optional: param?: type  |  Default: param: type = value",
    feedback_wrong: "title?: string for optional  |  retries: number = 3 for default",
    expected: "Optional and default params",
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 5",
    paal: "Type an arrow function two ways: inline as a variable, and as a named type alias. Show both.",
    answer_keywords: ["=>", "type", "const"],
    seed_code: `// Step 3: typing arrow functions

// Inline — type annotation on the variable
const double = (n: number): number => n * 2

// As a named type alias — reusable across params and callbacks
type Transformer = (value: string) => string

const toUpper: Transformer = (v) => v.toUpperCase()
const toLower: Transformer = (v) => v.toLowerCase()

// Passing typed callbacks
function applyTransform(values: string[], fn: Transformer): string[] {
  return values.map(fn)
}

export { double, toUpper, toLower, applyTransform }`,
    feedback_correct: "✅ Named function types (type aliases) make callback signatures reusable and readable.",
    feedback_partial: "Either: const fn = (x: number): number => x  OR  type Fn = (x: number) => number",
    feedback_wrong: "const double = (n: number): number => n * 2",
    expected: "Arrow function typed inline and via type alias",
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 5",
    paal: "Use rest params: function joinStrings(...parts: string[]): string. Rest params are always typed as an array.",
    answer_keywords: ["...", "string[]"],
    seed_code: `// Step 4: rest parameters — always an array type

function joinStrings(...parts: string[]): string {
  return parts.join(' ')
}

function sum(...numbers: number[]): number {
  return numbers.reduce((acc, n) => acc + n, 0)
}

joinStrings('Hello', 'world', '!')   // 'Hello world !'
sum(1, 2, 3, 4, 5)                   // 15

export { joinStrings, sum }`,
    feedback_correct: "✅ ...args: Type[] — rest params are always typed as arrays, never as T.",
    feedback_partial: "...parts: string[] — the rest param type is the element type in an array.",
    feedback_wrong: "function joinStrings(...parts: string[]): string { return parts.join(' ') }",
    expected: "Rest params with array type",
  },
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 5",
    paal: "Write a function overload: format(value: string): string and format(value: number): string — one implementation handles both cases.",
    answer_keywords: ["functionformat", "|", "string", "number"],
    seed_code: `// Step 5: function overloads — multiple signatures, one implementation

function format(value: string): string
function format(value: number): string
function format(value: string | number): string {
  // The implementation signature must accept the union of all overload params
  if (typeof value === 'string') return value.trim()
  return value.toFixed(2)
}

format('  hello  ')    // 'hello'
format(3.14159)        // '3.14'

export { format }`,
    feedback_correct: "✅ Overloads let callers see specific signatures while the implementation handles the union.",
    feedback_partial: "Declare overload signatures above the implementation. Implementation uses a union type.",
    feedback_wrong: "Two declaration lines (overloads), then one implementation with string | number.",
    expected: "Function overload signatures",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Return types", id: "step1" },
  { label: "Step 2 — Optional/Default", id: "step2" },
  { label: "Step 3 — Arrow functions", id: "step3" },
  { label: "Step 4 — Rest params", id: "step4" },
  { label: "Step 5 — Overloads", id: "step5" },
];

export default createINPACTEngine({
  NODES,
  sideItems,
  lessonNum: "F02",
  title: "Typing Functions",
  shortName: "TS — FUNCTIONS",
});
