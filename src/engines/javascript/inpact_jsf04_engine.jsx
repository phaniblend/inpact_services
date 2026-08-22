import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "JS FUNDAMENTALS #4",
      title: "Arrays & Iterators — The Data Pipeline Toolkit",
      body: `Arrays are the primary data structure in JS frontends.
map, filter, reduce transform them without mutation.

Beyond those three, you need the full toolkit:
find / findIndex / some / every / flat / flatMap
Array.from, Array.of, for...of with iterators
and the critical difference between mutating
and non-mutating methods — because React state
requires non-mutating updates.`,
      usecase: `Rendering lists, filtering search results, computing totals, normalizing API responses, flattening nested data — all pure array transformations. Knowing which method to reach for and whether it mutates is a daily skill.`,
    },
  },
  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Use map to transform every element",
      "Use filter to select elements by predicate",
      "Use reduce to fold an array into any shape",
      "Know all mutating vs non-mutating methods",
      "Use flat and flatMap for nested arrays",
      "Create iterables with Symbol.iterator and for...of",
    ],
  },
  {
    id: "step1", type: "question", phase: "Step 1 of 5",
    paal: "Chain map, filter, and reduce to: filter active users, extract their names, and count name lengths total.",
    answer_keywords: ["map", "filter", "reduce", "chain"],
    seed_code: `// Step 1: map → filter → reduce pipeline

const users = [
  { id: 1, name: 'Alice',   active: true,  score: 92 },
  { id: 2, name: 'Bob',     active: false, score: 78 },
  { id: 3, name: 'Carol',   active: true,  score: 88 },
  { id: 4, name: 'Dave',    active: true,  score: 95 },
]

const totalNameLength = users
  .filter(u => u.active)            // keep active: Alice, Carol, Dave
  .map(u => u.name)                 // extract names: ['Alice', 'Carol', 'Dave']
  .reduce((sum, name) => sum + name.length, 0)  // total: 5 + 5 + 4 = 14

// Average score of active users:
const activeUsers = users.filter(u => u.active)
const avgScore = activeUsers.reduce((sum, u) => sum + u.score, 0) / activeUsers.length
// 91.67

// map always returns same-length array — filter may shorten
// reduce collapses to anything: number, string, object, array

export { totalNameLength, avgScore }`,
    feedback_correct: "✅ filter → map → reduce is the canonical data pipeline — each stage has a single clear job.",
    feedback_partial: "filter keeps elements, map transforms them, reduce folds them into one value.",
    feedback_wrong: "array.filter(...).map(...).reduce((acc, val) => ..., initialValue)",
    expected: "map/filter/reduce pipeline",
  },
  {
    id: "step2", type: "question", phase: "Step 2 of 5",
    paal: "Use find, findIndex, some, every, includes, and indexOf — show exactly when each is appropriate.",
    answer_keywords: ["find", "some", "every", "findindex", "includes"],
    seed_code: `// Step 2: searching and testing arrays

const products = [
  { id: 1, name: 'Laptop',  inStock: true,  price: 999 },
  { id: 2, name: 'Mouse',   inStock: false, price: 29  },
  { id: 3, name: 'Monitor', inStock: true,  price: 399 },
]

// find — returns first MATCHING ELEMENT (or undefined):
const laptop = products.find(p => p.name === 'Laptop')   // { id:1, ... }

// findIndex — returns INDEX of first match (or -1):
const idx = products.findIndex(p => p.id === 3)   // 2

// some — true if ANY element matches:
const hasOutOfStock = products.some(p => !p.inStock)   // true

// every — true if ALL elements match:
const allInStock = products.every(p => p.inStock)   // false

// includes — tests primitive presence (uses ===):
const nums = [1, 2, 3, 4]
nums.includes(3)   // true

// indexOf — returns index or -1 (use findIndex for objects):
nums.indexOf(3)   // 2

// Rule of thumb:
// Objects → find / findIndex / some / every (use a callback)
// Primitives → includes / indexOf (direct comparison)

export { laptop, idx, hasOutOfStock, allInStock }`,
    feedback_correct: "✅ find returns the element, findIndex returns the position, some/every test conditions — each has its place.",
    feedback_partial: "find → first match | some → any match | every → all match | findIndex → position",
    feedback_wrong: "arr.find(x => condition)  |  arr.some(x => condition)  |  arr.every(x => condition)",
    expected: "find/some/every/findIndex",
  },
  {
    id: "step3", type: "question", phase: "Step 3 of 5",
    paal: "Use reduce to build an object from an array — the 'normalize' pattern used for Redux state.",
    answer_keywords: ["reduce", "object", "normalize", "accumulator", "{}"],
    seed_code: `// Step 3: reduce as a general-purpose fold

const users = [
  { id: 'u1', name: 'Alice', role: 'admin'  },
  { id: 'u2', name: 'Bob',   role: 'editor' },
  { id: 'u3', name: 'Carol', role: 'viewer' },
]

// Normalize: array → object keyed by id (Redux/Zustand pattern)
const usersById = users.reduce((acc, user) => {
  acc[user.id] = user
  return acc
}, {})
// { u1: { id:'u1', name:'Alice', ... }, u2: { ... }, u3: { ... } }

// Group by a field:
const byRole = users.reduce((acc, user) => {
  const key = user.role
  if (!acc[key]) acc[key] = []
  acc[key].push(user)
  return acc
}, {})
// { admin: [...], editor: [...], viewer: [...] }

// Count occurrences:
const words = ['apple', 'banana', 'apple', 'cherry', 'banana', 'apple']
const freq = words.reduce((acc, w) => {
  acc[w] = (acc[w] ?? 0) + 1
  return acc
}, {})
// { apple: 3, banana: 2, cherry: 1 }

export { usersById, byRole, freq }`,
    feedback_correct: "✅ reduce → object is the normalize pattern — O(1) lookups instead of O(n) find calls.",
    feedback_partial: "reduce((acc, item) => { acc[item.id] = item; return acc }, {}) — start with {} accumulator.",
    feedback_wrong: "array.reduce((acc, item) => ({ ...acc, [item.id]: item }), {})",
    expected: "reduce to object (normalize pattern)",
  },
  {
    id: "step4", type: "question", phase: "Step 4 of 5",
    paal: "Show every mutating vs non-mutating method. This is critical for React state — never mutate state directly.",
    answer_keywords: ["mutating", "non-mutating", "spread", "immutable", "push"],
    seed_code: `// Step 4: mutating vs non-mutating — critical for React

// ❌ MUTATING (modify the original array):
// push, pop, shift, unshift, splice, sort, reverse, fill

// ✅ NON-MUTATING (return a new array):
// map, filter, reduce, slice, concat, flat, flatMap, toSorted, toReversed (ES2023)

const arr = [3, 1, 4, 1, 5]

// Mutating sort — modifies arr:
// arr.sort()  ← BAD for React state

// Non-mutating sort — arr untouched:
const sorted = [...arr].sort((a, b) => a - b)   // spread first, then sort

// Add to array immutably (React pattern):
const withNew = [...arr, 6]                // append
const withPrepend = [0, ...arr]            // prepend

// Remove by index immutably:
const without2 = arr.filter((_, i) => i !== 2)

// Update by index immutably:
const updated = arr.map((v, i) => i === 0 ? 99 : v)

// Remove by value immutably:
const without4 = arr.filter(v => v !== 4)

// ALL React state updates should use these non-mutating patterns ✅
export { sorted, withNew, without4, updated }`,
    feedback_correct: "✅ Mutating methods break React's change detection — always return new arrays for state.",
    feedback_partial: "sort, push, splice mutate. map, filter, [...arr] do not. React requires non-mutating.",
    feedback_wrong: "[...arr].sort()  |  arr.filter(...)  |  arr.map(...)  — all return new arrays",
    expected: "Mutating vs non-mutating array methods",
  },
  {
    id: "step5", type: "question", phase: "Step 5 of 5",
    paal: "Use flat and flatMap for nested arrays. Then create a custom iterable with Symbol.iterator.",
    answer_keywords: ["flat", "flatmap", "symbol.iterator", "iterator", "for...of"],
    seed_code: `// Step 5: flat, flatMap, and custom iterables

// flat — flatten one level (or specify depth):
const nested = [[1, 2], [3, [4, 5]]]
nested.flat()    // [1, 2, 3, [4, 5]] — one level
nested.flat(2)   // [1, 2, 3, 4, 5]  — two levels
nested.flat(Infinity)  // fully flatten any depth

// flatMap — map then flatten one level (more efficient than .map().flat()):
const sentences = ['Hello world', 'Foo bar baz']
const words = sentences.flatMap(s => s.split(' '))
// ['Hello', 'world', 'Foo', 'bar', 'baz']

// Custom iterable — anything with Symbol.iterator is usable in for...of:
function range(start, end, step = 1) {
  return {
    [Symbol.iterator]() {
      let current = start
      return {
        next() {
          if (current <= end) {
            const value = current
            current += step
            return { value, done: false }
          }
          return { value: undefined, done: true }
        }
      }
    }
  }
}

for (const n of range(0, 10, 2)) {
  console.log(n)   // 0 2 4 6 8 10
}

const arr = [...range(1, 5)]   // [1, 2, 3, 4, 5] — spread works too!

export { words, range }`,
    feedback_correct: "✅ flatMap = map + one-level flatten. Symbol.iterator makes anything work with for...of and spread.",
    feedback_partial: "flatMap(fn) maps then flattens one level. Symbol.iterator is the protocol for iterables.",
    feedback_wrong: "arr.flatMap(x => [...x])  |  { [Symbol.iterator]() { return { next() { ... } } } }",
    expected: "flat, flatMap, and custom iterables",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — map/filter/reduce", id: "step1" },
  { label: "Step 2 — find/some/every", id: "step2" },
  { label: "Step 3 — reduce→object", id: "step3" },
  { label: "Step 4 — Mutating vs not", id: "step4" },
  { label: "Step 5 — flat/flatMap/iter", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: "JS-F04", title: "Arrays & Iterators", shortName: "JS — ARRAYS" });
