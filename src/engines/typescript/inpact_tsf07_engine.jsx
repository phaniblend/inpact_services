import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "TS FUNDAMENTALS #7",
      title: "Enums & Tuples — Structured Constants",
      body: `Enums give named constants that exist at runtime.
Tuples give fixed-length arrays where each position has a specific type.

enum Direction { North, South, East, West }
Direction.North     // 0 at runtime

type RGB = [number, number, number]
const red: RGB = [255, 0, 0]   // position 0 is red, 1 green, 2 blue

Enums vs const enums vs string literal unions —
each has precise trade-offs you need to know.`,
      usecase: `HTTP status code enums, state machine enums, useState return tuple typing, coordinate pairs, min/max pairs — both structures appear constantly in typed codebases.`,
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Define a numeric enum and understand its runtime value",
      "Define a string enum — and why they're preferred",
      "Use const enum for zero-runtime-cost constants",
      "Know when string literal unions beat enums",
      "Define a typed tuple with fixed positions",
      "Use labeled tuples for documentation",
      "See how React's useState returns a tuple",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 5",
    paal: "Define a numeric enum Status and a string enum HttpMethod. Assign string values to HttpMethod.",
    answer_keywords: ["enum", "string", "httpmethod", "status"],
    seed_code: `// Step 1: numeric vs string enums

// Numeric enum — values are 0, 1, 2, 3 by default
enum Status {
  Idle,      // 0
  Loading,   // 1
  Success,   // 2
  Error,     // 3
}

// String enum — values are explicit strings → safer for debugging/serialization
enum HttpMethod {
  GET    = 'GET',
  POST   = 'POST',
  PUT    = 'PUT',
  PATCH  = 'PATCH',
  DELETE = 'DELETE',
}

function request(url: string, method: HttpMethod): void {
  console.log(\`\${method} \${url}\`)
}

request('/api/users', HttpMethod.GET)   // logs 'GET /api/users'
// request('/api/users', 'GET')         // ❌ string not assignable to HttpMethod

export { Status, HttpMethod }`,
    feedback_correct: "✅ String enums show the value in logs/debuggers — always prefer them over numeric enums for clarity.",
    feedback_partial: "Numeric enum: just names. String enum: Name = 'value' for each member.",
    feedback_wrong: "enum HttpMethod { GET = 'GET', POST = 'POST', ... }",
    example_code: `// Numeric enum — members auto-increment from 0
enum Status { Idle, Loading, Success, Error }
// Status.Idle = 0, Status.Loading = 1, ...

// String enum — each value is an explicit string
enum HttpMethod {
  GET    = 'GET',
  POST   = 'POST',
  DELETE = 'DELETE',
}
// HttpMethod.GET = 'GET' — readable in logs/serialization`,
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 5",
    paal: "Use const enum for zero-runtime-cost constants. Explain why they disappear at compile time.",
    answer_keywords: ["const enum", "inline", "compile"],
    seed_code: `// Step 2: const enum — no runtime object, values inlined at compile time

const enum Direction {
  North = 'NORTH',
  South = 'SOUTH',
  East  = 'EAST',
  West  = 'WEST',
}

function move(dir: Direction): void {
  console.log(dir)
}

move(Direction.North)   // compiles to: move('NORTH') — no Direction object in output

// TRADE-OFF: const enum only works in same compilation unit.
// Avoid in library code or when using isolatedModules (e.g. Vite, esbuild).
// In those cases, use a string literal union instead:

type Dir = 'NORTH' | 'SOUTH' | 'EAST' | 'WEST'   // zero runtime cost AND works everywhere

export { Direction }
export type { Dir }`,
    feedback_correct: "✅ const enum is inlined — no runtime object. But string literal unions are safer across toolchains.",
    feedback_partial: "const enum values are replaced at compile time. They emit nothing to the JS bundle.",
    feedback_wrong: "const enum Direction { North = 'NORTH', ... } — values inlined, no runtime object.",
    example_code: `// const enum — compiler replaces every usage with its value
const enum Direction { North = 'NORTH', South = 'SOUTH' }
move(Direction.North)  // compiles to: move('NORTH')
// No Direction object in the JS output — zero bundle cost

// Alternative with same zero-cost benefit that works everywhere:
type Dir = 'NORTH' | 'SOUTH' | 'EAST' | 'WEST'`,
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 5",
    paal: "Define a tuple type RGB = [number, number, number] and a labeled tuple Point = [x: number, y: number, z: number].",
    answer_keywords: ["tuple", "[", "rgb", "number"],
    seed_code: `// Step 3: tuple types — fixed-length, fixed-position arrays

type RGB = [number, number, number]

const red: RGB   = [255, 0, 0]
const green: RGB = [0, 255, 0]

// Position matters — can't swap R and G:
function blend(a: RGB, b: RGB): RGB {
  return [
    Math.round((a[0] + b[0]) / 2),
    Math.round((a[1] + b[1]) / 2),
    Math.round((a[2] + b[2]) / 2),
  ]
}

// Labeled tuples (TS 4.0+) — same runtime, better docs
type Point3D = [x: number, y: number, z: number]

const origin: Point3D = [0, 0, 0]
// Hover in IDE: shows labels → "x: number, y: number, z: number"

export type { RGB, Point3D }
export { red, green, blend, origin }`,
    feedback_correct: "✅ Tuples enforce both length and per-position type — labeled tuples also document meaning.",
    feedback_partial: "type RGB = [number, number, number] — brackets, not braces.",
    feedback_wrong: "type RGB = [number, number, number]  |  type Point = [x: number, y: number]",
    example_code: `// Tuple — fixed length, each position has a specific type
type RGB = [number, number, number]
const red: RGB = [255, 0, 0]   // ✅
// const bad: RGB = [255, 0]   // ❌ too short

// Labeled tuple (TS 4.0+) — same runtime, labels improve IDE hints
type Point3D = [x: number, y: number, z: number]
const origin: Point3D = [0, 0, 0]`,
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 5",
    paal: "Show how useState returns a typed tuple [T, Dispatch<SetStateAction<T>>] and how `as const` narrows a return tuple from a custom hook.",
    answer_keywords: ["as const", "tuple", "usestate", "readonly"],
    seed_code: `// Step 4: as const for tuple returns in custom hooks

import { useState } from 'react'

// Without as const — TS infers the return as array, not tuple:
// (boolean | (() => void))[]   ← loses positional info

// With as const — TS infers a readonly tuple:
function useToggle(initial: boolean = false) {
  const [state, setState] = useState(initial)
  const toggle = () => setState(s => !s)
  return [state, toggle] as const
  //                     ^^^^^^^^^
  // inferred as: readonly [boolean, () => void]
  // callers can destructure with correct types:
  // const [isOpen, toggleOpen] = useToggle()
}

// Explicit approach — declare the return type:
function useCounter(start: number = 0): [number, () => void, () => void] {
  const [count, setCount] = useState(start)
  return [count, () => setCount(n => n + 1), () => setCount(start)]
}

export { useToggle, useCounter }`,
    feedback_correct: "✅ as const on a returned array promotes it to a readonly tuple — essential for custom hook return types.",
    feedback_partial: "return [a, b] as const — without this, TS widens to a union array and loses positional types.",
    feedback_wrong: "return [state, toggle] as const — infers readonly [boolean, () => void]",
    example_code: `// Without as const — TS infers (boolean | (() => void))[]
// Caller loses positional type info

// With as const — infers readonly [boolean, () => void]
function useToggle(initial = false) {
  const [state, setState] = useState(initial)
  return [state, () => setState(s => !s)] as const
}
const [isOpen, toggle] = useToggle()  // isOpen: boolean, toggle: () => void`,
  },
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 5",
    paal: "Know the enum trade-off rule: use string enums for runtime-needed constants; use string literal unions for pure type-level constraints.",
    answer_keywords: ["enum", "union", "literal", "runtime"],
    seed_code: `// Step 5: the definitive enum vs union decision guide

// USE ENUM WHEN:
// • You need to iterate over all values at runtime
// • You use the enum value as a runtime object key
// • You're building a state machine with many transitions

enum Permission {
  Read   = 'READ',
  Write  = 'WRITE',
  Delete = 'DELETE',
}

const allPermissions = Object.values(Permission)   // ['READ', 'WRITE', 'DELETE']
// → only possible with a real enum, not a literal union

// USE STRING LITERAL UNION WHEN:
// • No runtime iteration needed
// • Smaller bundle size matters (no generated object)
// • Using Vite, esbuild, or isolatedModules build config
// • Accepting values from outside the system (API, localStorage)

type Role = 'admin' | 'editor' | 'viewer'

function hasPermission(role: Role, perm: Permission): boolean {
  if (role === 'viewer') return perm === Permission.Read
  return true
}

export { Permission, hasPermission }
export type { Role }`,
    feedback_correct: "✅ The rule: iterate at runtime → enum. Pure type constraint → string literal union.",
    feedback_partial: "Enums generate runtime objects. String literal unions are erased at compile time.",
    feedback_wrong: "Object.values(Permission) only works with enum — string literals have no runtime representation.",
    example_code: `// Use ENUM when you need runtime iteration:
enum Permission { Read = 'READ', Write = 'WRITE', Delete = 'DELETE' }
const all = Object.values(Permission)  // ['READ', 'WRITE', 'DELETE'] ✅

// Use UNION when it's a pure type constraint (no runtime value needed):
type Role = 'admin' | 'editor' | 'viewer'
// → zero JS output, works with all build tools`,
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Numeric/String enum", id: "step1" },
  { label: "Step 2 — const enum", id: "step2" },
  { label: "Step 3 — Tuples", id: "step3" },
  { label: "Step 4 — as const", id: "step4" },
  { label: "Step 5 — Enum vs union", id: "step5" },
];

export default createINPACTEngine({
  NODES,
  sideItems,
  lessonNum: "F07",
  title: "Enums & Tuples",
  shortName: "TS — ENUMS & TUPLES",
});
