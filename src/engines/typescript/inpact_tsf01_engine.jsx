import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "TS FUNDAMENTALS #1",
      title: "Primitive Types & Variable Annotations",
      body: `TypeScript lets you annotate every variable with its type.
The compiler then enforces it — catching mistakes before runtime.

let age: number = 30        ✅
let age: number = "thirty"  ❌ Type 'string' is not assignable to type 'number'

You'll also meet: string, boolean, null, undefined, any, unknown, never.
Each has a precise purpose. Using them correctly is the foundation of everything else.`,
      usecase: `In real codebases, typed variables act as self-documenting contracts. A teammate reading your code immediately knows what a variable holds — and the compiler yells if anyone violates that contract.`,
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Annotate variables with number, string, boolean",
      "Understand null vs undefined — and when to use each",
      "Know when any erases type safety (and why to avoid it)",
      "Use unknown as the safe alternative to any",
      "Understand never — the type of values that never exist",
      "Use const vs let and how type inference reduces annotation noise",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 5",
    paal: "Declare three variables: userName as string, userAge as number, isActive as boolean. Give each a value.",
    answer_keywords: ["string", "number", "boolean", "username", "userage", "isactive"],
    seed_code: `// Step 1: annotate each variable with its primitive type

let userName: string = 'Alice'
let userAge: number = 28
let isActive: boolean = true

export { userName, userAge, isActive }`,
    feedback_correct: "✅ The big three primitives — all annotated correctly.",
    feedback_partial: "Annotate each: let x: string, let y: number, let z: boolean",
    feedback_wrong: "let userName: string = 'Alice'  |  let userAge: number = 28  |  let isActive: boolean = true",
    expected: "Three typed variables",
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 5",
    paal: "Declare a variable typed as unknown. Then narrow it with typeof before using it as a string. This is the safe pattern when input type is truly uncertain.",
    answer_keywords: ["unknown", "typeof", "string"],
    seed_code: `// Step 2: unknown forces you to narrow before you use

function processInput(input: unknown): string {
  if (typeof input === 'string') {
    return input.toUpperCase()  // safe — TS now knows it's a string
  }
  return String(input)           // fallback for everything else
}

export { processInput }`,
    feedback_correct: "✅ unknown + typeof narrowing — the correct pattern for uncertain input.",
    feedback_partial: "Declare as unknown, then typeof check before using string methods.",
    feedback_wrong: "unknown requires a typeof/instanceof check before treating as a specific type.",
    expected: "unknown with typeof narrowing",
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 5",
    paal: "Declare a nullable string: let nickname: string | null = null. Then write a function that accepts string | null and returns a safe display value.",
    answer_keywords: ["null", "string", "|"],
    seed_code: `// Step 3: nullable types — string | null is the real-world pattern

let nickname: string | null = null

function displayName(name: string | null): string {
  return name ?? 'Anonymous'   // nullish coalescing — returns right side if null/undefined
}

export { nickname, displayName }`,
    feedback_correct: "✅ string | null is the canonical nullable type — much better than just null.",
    feedback_partial: "Use string | null to allow both a string value and null.",
    feedback_wrong: "let nickname: string | null = null",
    expected: "Nullable string with union type",
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 5",
    paal: "Use const for inference — TypeScript infers 'hello' as the literal type. Show const vs let inference difference.",
    answer_keywords: ["const", "let", "string"],
    seed_code: `// Step 4: const vs let — inference behaves differently

const greeting = 'hello'      // inferred as literal type: 'hello' (not string)
let message = 'hello'         // inferred as: string (widened)

// Why it matters:
type Direction = 'north' | 'south' | 'east' | 'west'

const dir = 'north'           // type: 'north' — assignable to Direction ✅
let dir2 = 'north'            // type: string — NOT assignable to Direction ❌

export { greeting, message }`,
    feedback_correct: "✅ const narrows to literal type — critical for discriminated unions and constants.",
    feedback_partial: "const infers a literal type; let infers a wider type like string.",
    feedback_wrong: "const x = 'hello' infers 'hello' (literal); let x = 'hello' infers string (widened)",
    expected: "const literal vs let widening",
  },
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 5",
    paal: "Demonstrate never — a function that always throws never returns, so its return type is never.",
    answer_keywords: ["never", "throw", "function"],
    seed_code: `// Step 5: never — the type of values that can never occur

function fail(message: string): never {
  throw new Error(message)    // function never returns normally → return type is never
}

// never is also the result of exhaustive checks:
type Shape = 'circle' | 'square'

function area(shape: Shape): number {
  if (shape === 'circle') return Math.PI
  if (shape === 'square') return 1
  return fail(\`Unhandled shape: \${shape}\`)  // narrows to never — exhaustiveness guard
}

export { fail, area }`,
    feedback_correct: "✅ never is both a return type for throwing functions AND an exhaustiveness sentinel.",
    feedback_partial: "A function that always throws has return type never.",
    feedback_wrong: "function fail(message: string): never { throw new Error(message) }",
    expected: "never return type",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Primitives", id: "step1" },
  { label: "Step 2 — unknown", id: "step2" },
  { label: "Step 3 — null", id: "step3" },
  { label: "Step 4 — const vs let", id: "step4" },
  { label: "Step 5 — never", id: "step5" },
];

export default createINPACTEngine({
  NODES,
  sideItems,
  lessonNum: "F01",
  title: "Primitive Types",
  shortName: "TS — PRIMITIVES",
});
