import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "TS FUNDAMENTALS #8",
      title: "Type Assertions, Non-null & satisfies",
      body: `Sometimes you know more than the compiler does.
TypeScript gives you escape hatches — but each has costs.

value as SomeType     — assertion: "trust me, it's this type"
value!                — non-null assertion: "trust me, it's not null"
as const              — narrow to literal type / readonly tuple
satisfies             — validate shape WITHOUT widening the type (TS 4.9+)

These are power tools. Overuse breaks type safety.
Knowing exactly when each is appropriate is a senior-level skill.`,
      usecase: `DOM manipulation, JSON parsing, third-party library results, and narrow-but-correct type assertions appear in virtually every production codebase. Doing them wrong silently erases safety.`,
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Use as to assert a type from a wider one",
      "Use the non-null assertion operator ! correctly",
      "Know when NOT to use assertions (and use a type guard instead)",
      "Use as const to freeze a value to its literal type",
      "Use satisfies to validate shape while keeping the inferred type",
      "Avoid double assertions (value as unknown as T) — the smell test",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 5",
    paal: "Use `as` to assert the type of a JSON.parse result. Show both correct and dangerous usage.",
    answer_keywords: ["as", "json.parse", "assertion"],
    seed_code: `// Step 1: type assertion with as

interface User { id: number; name: string }

// JSON.parse returns: any
// Asserting gives you a typed value — but NO runtime validation
const raw = JSON.parse('{"id":1,"name":"Alice"}') as User

console.log(raw.name)   // 'Alice' — works fine if JSON matches User
// console.log(raw.age) // TS error — age isn't on User ✅ (catches typos)

// DANGER: assertion without validation
const bad = JSON.parse('"just a string"') as User
console.log(bad.name)   // undefined at runtime — TS didn't catch this ❌

// SAFE ALTERNATIVE: use a validation library (zod, valibot, arktype)
// import { z } from 'zod'
// const UserSchema = z.object({ id: z.number(), name: z.string() })
// const safe = UserSchema.parse(raw)   // throws if shape is wrong

export { raw }`,
    feedback_correct: "✅ as is a compile-time assertion only — zero runtime validation. Prefer zod/valibot for external data.",
    feedback_partial: "value as Type tells TS the type but doesn't validate at runtime.",
    feedback_wrong: "const user = JSON.parse(json) as User — correct pattern, dangerous without validation.",
    expected: "Type assertion with as",
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 5",
    paal: "Use the non-null assertion operator ! on DOM queries. Explain when it's safe vs when to use optional chaining instead.",
    answer_keywords: ["!", "nonnull", "getelementbyid", "null"],
    seed_code: `// Step 2: non-null assertion operator — !

// DOM query returns HTMLElement | null
const form = document.getElementById('login-form')!
// The ! says: "I know this isn't null — trust me"
// If form IS null at runtime → crash. TS won't catch it.

// SAFE usage — you know the element is always there (server-renders it)
const btn = document.getElementById('submit-btn')! as HTMLButtonElement
btn.disabled = true   // ✅ safe — you control the HTML

// RISKY usage — dynamic content that might not exist
// const modal = document.getElementById('modal')!   // might be null if not yet rendered

// SAFER ALTERNATIVE: optional chaining + early return
const title = document.getElementById('page-title')
if (!title) return   // explicit null check — compiler knows title is non-null below
title.textContent = 'Loaded'

// Or: optional chaining (no crash, silently no-ops if null)
document.getElementById('banner')?.classList.add('visible')

export {}`,
    feedback_correct: "✅ ! is correct when you have external certainty. Optional chaining is safer when existence is conditional.",
    feedback_partial: "element! removes null from the type. Safe if you're certain — risky otherwise.",
    feedback_wrong: "document.getElementById('id')! — ! asserts non-null, crashes if actually null.",
    expected: "Non-null assertion vs optional chaining",
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 5",
    paal: "Use as const to freeze a config object — all string values become literal types and all arrays become readonly tuples.",
    answer_keywords: ["as const", "literal", "readonly", "const"],
    seed_code: `// Step 3: as const — freeze everything to its literal type

// Without as const — widened types:
const config1 = {
  env: 'production',     // type: string (wide)
  port: 3000,            // type: number (wide)
  flags: ['auth', 'cache'],  // type: string[] (wide, mutable)
}

// With as const — literal types throughout:
const config2 = {
  env: 'production',     // type: 'production' (literal!)
  port: 3000,            // type: 3000 (literal!)
  flags: ['auth', 'cache'],  // type: readonly ['auth', 'cache'] (tuple!)
} as const

// Now config2.env is the literal 'production', not just string
// This means you can use it in a discriminated union or as a type:
type Env = typeof config2.env   // 'production'

// config2.flags.push('debug')  // ❌ readonly — cannot mutate
// config2.port = 4000          // ❌ readonly — cannot mutate

export { config1, config2 }
export type { Env }`,
    feedback_correct: "✅ as const turns strings into literals and arrays into readonly tuples — perfect for config and lookup tables.",
    feedback_partial: "} as const at the end of an object/array literal freezes all values to their literal types.",
    feedback_wrong: "const x = { key: 'value' } as const — key becomes 'value' (literal), not string (wide).",
    expected: "as const for literal type freezing",
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 5",
    paal: "Use `satisfies` (TS 4.9+) to validate a config shape without losing the inferred literal types.",
    answer_keywords: ["satisfies", "4.9", "validate", "infer"],
    seed_code: `// Step 4: satisfies — validate shape, keep inference

type ColorMap = Record<string, [number, number, number] | string>

// PROBLEM with 'as' or explicit annotation:
const colors1: ColorMap = {
  red:   [255, 0, 0],
  blue:  '#0000ff',
}
// colors1.red is inferred as [number, number, number] | string — too wide!
// colors1.red.toUpperCase() // ❌ TS doesn't know it's a string here

// satisfies: validates against ColorMap, but KEEPS the per-key literal types
const colors2 = {
  red:   [255, 0, 0],
  blue:  '#0000ff',
} satisfies ColorMap

// Now:
colors2.red[0]          // ✅ TS knows red is a tuple — not the wide union
colors2.blue.toUpperCase()  // ✅ TS knows blue is a string — not the wide union

// AND: if you add an invalid color, TS catches it:
// const colors3 = { purple: true } satisfies ColorMap   // ❌ boolean not in union

export { colors2 }`,
    feedback_correct: "✅ satisfies validates without widening — you get both shape safety AND precise inferred types.",
    feedback_partial: "value satisfies Type — validates the type constraint, preserves the specific inferred type.",
    feedback_wrong: "} satisfies ColorMap — validates that the object matches ColorMap but keeps per-key types.",
    expected: "satisfies operator",
  },
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 5",
    paal: "Double assertion (value as unknown as T) is the smell — show when it's the only option, and what it means.",
    answer_keywords: ["unknown", "as", "double", "cast"],
    seed_code: `// Step 5: double assertion — the smell test

// Normal assertion only works if types overlap:
// const x = 'hello' as number   // ❌ TS refuses — string and number don't overlap

// Double assertion forces it via unknown (which overlaps everything):
const x = 'hello' as unknown as number   // ✅ TS allows — but this is a lie

// WHEN IT'S LEGITIMATE:
// 1. Mocking in tests — you don't care about the full shape
function mockUser(partial: Partial<User>): User {
  return partial as unknown as User   // acceptable in test code
}

// 2. Library internals where you've verified shape externally
// (always add a comment explaining WHY)

// WHEN IT'S A RED FLAG:
// • Production business logic
// • "I don't understand why TS is complaining"
// • Used to silence a legitimate type error

// BETTER APPROACH: write a proper type guard or runtime validator
function isUser(value: unknown): value is User {
  return typeof value === 'object' && value !== null && 'id' in value && 'name' in value
}

interface User { id: number; name: string }
export { mockUser, isUser }`,
    feedback_correct: "✅ Double assertion is a code smell. A type guard (value is T) is the correct production alternative.",
    feedback_partial: "value as unknown as T bypasses type checking entirely. It's occasionally necessary in tests, never in logic.",
    feedback_wrong: "value as unknown as T — both steps needed because you can only assert to overlapping types.",
    expected: "Double assertion and type guard alternative",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — as assertion", id: "step1" },
  { label: "Step 2 — Non-null !", id: "step2" },
  { label: "Step 3 — as const", id: "step3" },
  { label: "Step 4 — satisfies", id: "step4" },
  { label: "Step 5 — Double cast", id: "step5" },
];

export default createINPACTEngine({
  NODES,
  sideItems,
  lessonNum: "F08",
  title: "Type Assertions & satisfies",
  shortName: "TS — ASSERTIONS",
});
