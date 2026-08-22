import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "TS FUNDAMENTALS #10",
      title: "Advanced Patterns — The Senior-Level Toolkit",
      body: `You've learned the fundamentals. These are the patterns
that appear in library code, large codebases, and senior interviews.

Mapped types      — transform every key of a type programmatically
Template literal types — type-level string manipulation
infer keyword     — extract a type from within another type
Declaration files — .d.ts, ambient declarations, module augmentation

Each of these solves a class of lesson that nothing else can.
You don't need them daily — but when you do, nothing else works.`,
      usecase: `Writing your own utility types, typing event emitters, extending third-party library types, and generating getter/setter types from a model all require this toolkit.`,
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Write a mapped type to transform all keys of an object type",
      "Use template literal types for string-level type manipulation",
      "Use infer to extract a nested type from a generic",
      "Write a .d.ts ambient declaration for an untyped JS module",
      "Use declare module to augment an existing type",
      "Combine mapped + conditional types for a real utility",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 5",
    paal: "Write a mapped type Getters<T> that converts each field of T into a getter function: { name: string } → { getName: () => string }",
    answer_keywords: ["mapped", "keyof", "[k in", "getter", "=>"],
    seed_code: `// Step 1: mapped types — iterate over every key of a type

// Mapped type syntax: { [K in keyof T]: TransformedType }

// Make every field optional (Partial recreated):
type MyPartial<T> = {
  [K in keyof T]?: T[K]
}

// Make every field a getter function:
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K]
}

interface User {
  id: number
  name: string
  email: string
}

type UserGetters = Getters<User>
// {
//   getId:    () => number
//   getName:  () => string
//   getEmail: () => string
// }

// as \`get\${Capitalize<...>}\` remaps the key name — key remapping (TS 4.1+)

export type { MyPartial, Getters, UserGetters }`,
    feedback_correct: "✅ Mapped types iterate keyof T — combined with as and template literals, they transform key names too.",
    feedback_partial: "{ [K in keyof T]: ... } is the mapped type syntax. Add as \`prefix\${Capitalize<string & K>}\` to rename keys.",
    feedback_wrong: "type Getters<T> = { [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K] }",
    expected: "Mapped type with key remapping",
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 5",
    paal: "Use template literal types to build typed event names: type EventName = `on${Capitalize<string>}` and a typed event map.",
    answer_keywords: ["template literal", "capitalize", "event", "`on"],
    seed_code: `// Step 2: template literal types — type-level string construction

type EventName = \`on\${Capitalize<string>}\`
// matches: 'onClick', 'onSubmit', 'onMouseOver' — but not 'click' or 'submit'

// Build typed event maps from a union:
type UserEvents = 'login' | 'logout' | 'update'

type UserEventHandlers = {
  [K in UserEvents as \`on\${Capitalize<K>}\`]: (payload: unknown) => void
}
// {
//   onLogin:  (payload: unknown) => void
//   onLogout: (payload: unknown) => void
//   onUpdate: (payload: unknown) => void
// }

// Extract event name from handler key (reverse direction):
type EventFromHandler<T extends string> =
  T extends \`on\${infer Event}\` ? Uncapitalize<Event> : never

type E = EventFromHandler<'onClick'>    // 'click'
type F = EventFromHandler<'onSubmit'>   // 'submit'

export type { EventName, UserEventHandlers, EventFromHandler }`,
    feedback_correct: "✅ Template literal types let you enforce string structure at the type level — a game-changer for event systems.",
    feedback_partial: "type Name = \`prefix\${OtherType}\` — backticks in type position build string literal unions.",
    feedback_wrong: "type EventName = `on${Capitalize<string>}`  |  type Handlers = { [K in Events as `on${Capitalize<K>}`]: fn }",
    expected: "Template literal types for event names",
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 5",
    paal: "Use infer to extract the resolved value type from a Promise, and the element type from an array.",
    answer_keywords: ["infer", "extends", "promise", "awaited"],
    seed_code: `// Step 3: infer — extract a type from within another type

// Extract the resolved type from a Promise:
type Awaited2<T> = T extends Promise<infer R> ? R : T
// If T is Promise<X>, then R = X and we return X
// Otherwise return T as-is

type A = Awaited2<Promise<string>>   // string
type B = Awaited2<Promise<User>>     // User
type C = Awaited2<number>            // number (not a Promise, passthrough)

// Extract the element type from an array:
type ElementOf<T> = T extends (infer E)[] ? E : never

type D = ElementOf<string[]>    // string
type E2 = ElementOf<User[]>     // User
type F = ElementOf<string>      // never — not an array

// Extract the first argument type from a function:
type FirstArg<T> = T extends (first: infer A, ...rest: any[]) => any ? A : never

type G = FirstArg<(id: number, name: string) => void>   // number

interface User { id: number; name: string }
export type { Awaited2, ElementOf, FirstArg }`,
    feedback_correct: "✅ infer inside extends lets you 'destructure' a generic type — extract parts you couldn't access otherwise.",
    feedback_partial: "T extends SomeGeneric<infer R> ? R : fallback — infer captures the type at that position.",
    feedback_wrong: "type Unpacked<T> = T extends Promise<infer R> ? R : T",
    expected: "infer keyword for type extraction",
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 5",
    paal: "Write an ambient declaration (.d.ts) for an untyped JavaScript module, and augment an existing module's types.",
    answer_keywords: ["declare", "module", "d.ts", "ambient"],
    seed_code: `// Step 4: declaration files — typing the untyped

// ambient.d.ts — tells TS about a module that has no types

declare module 'some-untyped-package' {
  export function parse(input: string): Record<string, unknown>
  export function stringify(data: object): string
  export const version: string
}

// Now you can import it with full type safety:
// import { parse, version } from 'some-untyped-package'

// ─────────────────────────────────────────────
// Module augmentation — add to an existing type definition

import 'express'   // import to activate augmentation

declare module 'express-serve-static-core' {
  interface Request {
    user?: { id: string; role: string }   // add .user to every Express Request
    requestId: string
  }
}

// Now in your Express handlers:
// app.get('/me', (req, res) => {
//   req.user?.id    // ✅ typed
//   req.requestId   // ✅ typed
// })

// ─────────────────────────────────────────────
// Ambient variable declarations (globals):
declare const __DEV__: boolean
declare const __VERSION__: string

export {}   // makes this a module file`,
    feedback_correct: "✅ declare module is how you type untyped packages and how you extend library types in real projects.",
    feedback_partial: "declare module 'pkg' { export ... } — ambient declaration for untyped modules.",
    feedback_wrong: "declare module 'name' { export function ... }  |  declare module 'existing' { interface X { newField } }",
    expected: "Ambient declarations and module augmentation",
  },
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 5",
    paal: "Compose everything: a DeepReadonly<T> utility type that recursively makes every nested property readonly.",
    answer_keywords: ["deepreadonly", "recursive", "readonly", "object"],
    seed_code: `// Step 5: combining mapped + conditional types — DeepReadonly<T>

// Shallow Readonly (built-in):
// type Readonly<T> = { readonly [K in keyof T]: T[K] }

// Deep Readonly — recurse into nested objects:
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends Function
      ? T[K]                   // leave functions untouched
      : DeepReadonly<T[K]>     // recurse into nested objects
    : T[K]                     // leave primitives as-is
}

interface Config {
  server: {
    host: string
    port: number
    tls: { cert: string; key: string }
  }
  database: {
    url: string
    maxConnections: number
  }
}

type ImmutableConfig = DeepReadonly<Config>

const cfg: ImmutableConfig = {
  server:   { host: 'localhost', port: 3000, tls: { cert: '...', key: '...' } },
  database: { url: 'postgres://...', maxConnections: 10 },
}

// cfg.server.host = 'other'        // ❌ readonly
// cfg.server.tls.cert = 'new'      // ❌ readonly even nested

export type { DeepReadonly, ImmutableConfig }`,
    feedback_correct: "✅ DeepReadonly is the textbook example of recursive mapped + conditional types — you can now write your own utility types.",
    feedback_partial: "Mapped type + conditional: if T[K] extends object, recurse with DeepReadonly<T[K]>; else T[K].",
    feedback_wrong: "type DeepReadonly<T> = { readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K] }",
    expected: "Recursive mapped type",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Mapped types", id: "step1" },
  { label: "Step 2 — Template literals", id: "step2" },
  { label: "Step 3 — infer", id: "step3" },
  { label: "Step 4 — Declarations", id: "step4" },
  { label: "Step 5 — DeepReadonly", id: "step5" },
];

export default createINPACTEngine({
  NODES,
  sideItems,
  lessonNum: "F10",
  title: "Advanced Patterns",
  shortName: "TS — ADVANCED",
});
