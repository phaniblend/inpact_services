import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "TS FUNDAMENTALS #5",
      title: "Generics — Types as Parameters",
      body: `Generics let you write one function or interface that works
with many types — without sacrificing type safety.

function identity<T>(value: T): T { return value }

identity('hello')   // T = string, returns string
identity(42)        // T = number, returns number

Without generics you'd write one function per type, or
fall back to any (which erases all safety). Generics thread
the needle: reusable AND typed.`,
      usecase: `useState<T>, Promise<T>, Array<T>, fetch responses, generic repository patterns — generics are everywhere. Understanding them unlocks the entire standard library.`,
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Write a generic function with <T>",
      "Add generic constraints with extends",
      "Use multiple type parameters <T, U>",
      "Create a generic interface",
      "Understand when TypeScript infers T vs when you must provide it",
      "Build a real-world generic: ApiResponse<T>",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 5",
    paal: "Write a generic identity<T>(value: T): T and a generic firstItem<T>(arr: T[]): T | undefined.",
    answer_keywords: ["<t>", "identity", "t[]"],
    seed_code: `// Step 1: your first generic function

function identity<T>(value: T): T {
  return value
}

function firstItem<T>(arr: T[]): T | undefined {
  return arr[0]
}

// TypeScript infers T from the argument:
identity('hello')         // T inferred as string
identity(42)              // T inferred as number
firstItem([1, 2, 3])      // T inferred as number → returns number | undefined
firstItem(['a', 'b'])     // T inferred as string

// Or provide T explicitly:
identity<boolean>(true)

export { identity, firstItem }`,
    feedback_correct: "✅ T is a type parameter — it takes on the type of whatever you pass in.",
    feedback_partial: "function name<T>(param: T): T — T is the placeholder that gets filled at call time.",
    feedback_wrong: "function identity<T>(value: T): T { return value }",
    expected: "Generic function with T",
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 5",
    paal: "Add a constraint: function getProperty<T, K extends keyof T>(obj: T, key: K): T[K]. This ensures K is always a valid key of T.",
    answer_keywords: ["keyof", "extends", "t[k]", "constraint"],
    seed_code: `// Step 2: generic constraints — T extends SomeType

// Constrain T to have a name property:
function greet<T extends { name: string }>(entity: T): string {
  return \`Hello, \${entity.name}\`
}

greet({ name: 'Alice', age: 30 })   // ✅ has name
// greet({ age: 30 })               // ❌ missing name

// keyof constraint — K must be a key of T
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]    // T[K] is the value type at key K — indexed access type
}

const user = { id: 1, name: 'Alice', role: 'admin' }
getProperty(user, 'name')   // returns string
getProperty(user, 'id')     // returns number
// getProperty(user, 'age') // ❌ 'age' is not a key of user

export { greet, getProperty }`,
    feedback_correct: "✅ extends on a type parameter adds a constraint — T must satisfy that shape.",
    feedback_partial: "<T extends { name: string }> means T must have at least a name: string field.",
    feedback_wrong: "function getProperty<T, K extends keyof T>(obj: T, key: K): T[K]",
    expected: "Generic constraint with extends and keyof",
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 5",
    paal: "Create a generic interface ApiResponse<T> with fields data: T, status: number, error?: string.",
    answer_keywords: ["interface", "apiresponse", "<t>", "data"],
    seed_code: `// Step 3: generic interfaces — reusable response wrapper

interface ApiResponse<T> {
  data: T
  status: number
  error?: string
}

// Use it with different concrete types:
type UserResponse  = ApiResponse<User>
type UsersResponse = ApiResponse<User[]>
type EmptyResponse = ApiResponse<null>

interface User { id: number; name: string }

async function fetchUser(id: number): Promise<ApiResponse<User>> {
  const res = await fetch(\`/api/users/\${id}\`)
  const json = await res.json()
  return { data: json, status: res.status }
}

// The generic makes data typed correctly — no cast needed downstream
const response = await fetchUser(1)
console.log(response.data.name)   // ✅ TypeScript knows .name exists

export type { ApiResponse }`,
    feedback_correct: "✅ Generic interfaces are the standard pattern for API response wrappers, repository results, etc.",
    feedback_partial: "interface Name<T> { data: T; ... } — T becomes the type of data.",
    feedback_wrong: "interface ApiResponse<T> { data: T; status: number; error?: string }",
    expected: "Generic interface",
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 5",
    paal: "Use multiple type parameters: function mapObject<T, U>(obj: T, transform: (val: T[keyof T]) => U): Record<keyof T, U>",
    answer_keywords: ["<t, u>", "multiple", "record", "keyof"],
    seed_code: `// Step 4: multiple type parameters — two placeholders, two roles

function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second]
}

pair('hello', 42)          // [string, number]
pair(true, { id: 1 })     // [boolean, { id: number }]

// Real-world: transform the values of an object
function mapValues<T extends object, U>(
  obj: T,
  transform: (value: T[keyof T], key: keyof T) => U
): Record<keyof T, U> {
  const result = {} as Record<keyof T, U>
  for (const key in obj) {
    result[key] = transform(obj[key], key)
  }
  return result
}

const scores = { alice: 85, bob: 92, carol: 78 }
const grades = mapValues(scores, (score) => score >= 90 ? 'A' : 'B')
// { alice: 'B', bob: 'A', carol: 'B' }

export { pair, mapValues }`,
    feedback_correct: "✅ Multiple type params let you track the relationship between input and output types.",
    feedback_partial: "<T, U> — T for the input type, U for the output type.",
    feedback_wrong: "function pair<T, U>(first: T, second: U): [T, U]",
    expected: "Multiple generic type parameters",
  },
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 5",
    paal: "Build a typed useLocalStorage<T> hook that infers T from an initialValue parameter — T is never written explicitly by the caller.",
    answer_keywords: ["<t>", "t", "infer", "initialvalue", "usestate"],
    seed_code: `// Step 5: inference in action — T is resolved by the compiler, not the caller

import { useState } from 'react'

function useLocalStorage<T>(key: string, initialValue: T) {
  // T is inferred from initialValue — caller never writes <T> explicitly
  const [stored, setStored] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value: T) => {
    setStored(value)
    window.localStorage.setItem(key, JSON.stringify(value))
  }

  return [stored, setValue] as const
  // as const narrows the tuple to [T, (value: T) => void]
  // without it, TS widens to (T | ((value: T) => void))[]
}

// Usage — T inferred as string:
const [theme, setTheme] = useLocalStorage('theme', 'light')
// Usage — T inferred as number:
const [count, setCount] = useLocalStorage('count', 0)

export { useLocalStorage }`,
    feedback_correct: "✅ Inference means callers get full type safety without writing <T> — best-in-class DX.",
    feedback_partial: "When T is inferred from a parameter, callers get typed return values automatically.",
    feedback_wrong: "function useLocalStorage<T>(key: string, initialValue: T) — T is inferred from initialValue.",
    expected: "Generic with inference from parameter",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — identity<T>", id: "step1" },
  { label: "Step 2 — Constraints", id: "step2" },
  { label: "Step 3 — Generic interface", id: "step3" },
  { label: "Step 4 — Multiple params", id: "step4" },
  { label: "Step 5 — Inference", id: "step5" },
];

export default createINPACTEngine({
  NODES,
  sideItems,
  lessonNum: "F05",
  title: "Generics",
  shortName: "TS — GENERICS",
});
