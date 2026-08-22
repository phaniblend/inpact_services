import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "TS FUNDAMENTALS #4",
      title: "Union Types, Intersections & Type Guards",
      body: `Union types let a value be one of several types:
  type ID = string | number

Intersection types combine multiple shapes into one:
  type AdminUser = User & Permissions

Type guards let TypeScript narrow from a wide union
down to the specific type you're actually working with.
Without narrowing, the compiler won't let you call
type-specific methods — even if you're sure.`,
      usecase: `Real APIs return heterogeneous data. Event handlers receive different event types. Redux actions are discriminated unions. Type guards are how you write safe, precise code against all of that.`,
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Create union types with |",
      "Create intersection types with &",
      "Use typeof for primitive narrowing",
      "Use instanceof for class narrowing",
      "Use in operator to narrow object shapes",
      "Build a discriminated union with a literal 'kind' field",
      "Write an exhaustiveness check using never",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 5",
    paal: "Create a union type StringOrNumber = string | number. Write a function that accepts it and narrows with typeof.",
    answer_keywords: ["string", "number", "|", "typeof"],
    seed_code: `// Step 1: union type + typeof narrowing

type StringOrNumber = string | number

function stringify(value: StringOrNumber): string {
  if (typeof value === 'string') {
    return value.toUpperCase()     // TS knows: value is string here
  }
  return value.toFixed(2)          // TS knows: value is number here
}

stringify('hello')   // 'HELLO'
stringify(3.14)      // '3.14'

export type { StringOrNumber }
export { stringify }`,
    feedback_correct: "✅ typeof is the go-to narrowing tool for primitive unions.",
    feedback_partial: "Use type X = string | number, then typeof checks inside the function.",
    feedback_wrong: "type StringOrNumber = string | number  |  if (typeof value === 'string') { ... }",
    expected: "Union type + typeof narrowing",
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 5",
    paal: "Create an intersection type: type AdminUser = User & { permissions: string[] }. Show that the combined object satisfies both shapes.",
    answer_keywords: ["&", "intersection", "permissions"],
    seed_code: `// Step 2: intersection types — combine multiple shapes into one

interface User {
  id: number
  name: string
}

interface WithPermissions {
  permissions: string[]
  grantedAt: Date
}

// Intersection: the value must satisfy BOTH interfaces
type AdminUser = User & WithPermissions

const admin: AdminUser = {
  id: 1,
  name: 'Alice',
  permissions: ['read', 'write'],
  grantedAt: new Date(),
}

export type { User, WithPermissions, AdminUser }`,
    feedback_correct: "✅ & combines shapes — the result must have ALL fields from ALL types.",
    feedback_partial: "type Combined = TypeA & TypeB — combined type requires all fields from both.",
    feedback_wrong: "type AdminUser = User & { permissions: string[] }",
    expected: "Intersection type",
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 5",
    paal: "Use the `in` operator to narrow between two object shapes that share no common field.",
    answer_keywords: ["in", "typeof", "object"],
    seed_code: `// Step 3: 'in' narrowing — check if a field exists to distinguish shapes

interface Cat {
  meow: () => void
}

interface Dog {
  bark: () => void
}

type Animal = Cat | Dog

function makeNoise(animal: Animal): void {
  if ('meow' in animal) {
    animal.meow()      // TS narrows to Cat
  } else {
    animal.bark()      // TS narrows to Dog
  }
}

// Works even with instanceof for class instances:
function processDate(value: string | Date): Date {
  if (value instanceof Date) {
    return value           // TS knows: Date instance
  }
  return new Date(value)   // TS knows: string here
}

export { makeNoise, processDate }`,
    feedback_correct: "✅ 'in' checks property existence — perfect for narrowing between shapes with different fields.",
    feedback_partial: "if ('fieldName' in obj) narrows the object to the type that has that field.",
    feedback_wrong: "if ('meow' in animal) { /* cat */ } else { /* dog */ }",
    expected: "in operator narrowing",
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 5",
    paal: "Build a discriminated union with a literal 'kind' field. Each variant has a unique tag that TypeScript uses to narrow automatically.",
    answer_keywords: ["kind", "discriminated", "literal", "union", "type"],
    seed_code: `// Step 4: discriminated unions — the most powerful TypeScript pattern for modeling state

type LoadingState = {
  kind: 'loading'
}

type SuccessState = {
  kind: 'success'
  data: string[]
}

type ErrorState = {
  kind: 'error'
  message: string
}

type FetchState = LoadingState | SuccessState | ErrorState

function renderState(state: FetchState): string {
  switch (state.kind) {
    case 'loading':
      return 'Loading...'
    case 'success':
      return \`Got \${state.data.length} items\`   // TS narrows: data is available
    case 'error':
      return \`Error: \${state.message}\`           // TS narrows: message is available
  }
}

export type { FetchState }
export { renderState }`,
    feedback_correct: "✅ Discriminated unions are how Redux actions, API states, and form states should be typed.",
    feedback_partial: "Add a kind: 'literal' field to each variant. Switch on kind to narrow.",
    feedback_wrong: "type Variant = { kind: 'name', ...fields }  — switch(state.kind) narrows to each variant.",
    expected: "Discriminated union",
  },
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 5",
    paal: "Add an exhaustiveness check: after handling all union members, assign to never in the default case to get a compile-time error if a new variant is added without handling.",
    answer_keywords: ["never", "exhaustive", "default", "switch"],
    seed_code: `// Step 5: exhaustiveness checking — catch unhandled union members at compile time

type FetchState =
  | { kind: 'loading' }
  | { kind: 'success'; data: string[] }
  | { kind: 'error'; message: string }

function assertNever(x: never): never {
  throw new Error(\`Unhandled variant: \${JSON.stringify(x)}\`)
}

function renderState(state: FetchState): string {
  switch (state.kind) {
    case 'loading': return 'Loading...'
    case 'success': return \`Got \${state.data.length} items\`
    case 'error':   return \`Error: \${state.message}\`
    default:
      // If you add a new variant to FetchState without adding a case above,
      // TypeScript will error RIGHT HERE — state is no longer never.
      return assertNever(state)
  }
}

export { renderState, assertNever }`,
    feedback_correct: "✅ assertNever(x: never) is the industry-standard exhaustiveness guard — add variants safely forever.",
    feedback_partial: "In the default case, call assertNever(state). TS errors if state isn't never there.",
    feedback_wrong: "default: return assertNever(state)  — the function parameter type is never, so TS catches missing cases.",
    expected: "Exhaustiveness check with never",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Union + typeof", id: "step1" },
  { label: "Step 2 — Intersection &", id: "step2" },
  { label: "Step 3 — in narrowing", id: "step3" },
  { label: "Step 4 — Discriminated union", id: "step4" },
  { label: "Step 5 — Exhaustiveness", id: "step5" },
];

export default createINPACTEngine({
  NODES,
  sideItems,
  lessonNum: "F04",
  title: "Unions & Type Guards",
  shortName: "TS — UNIONS",
});
