import createINPACTEngine from "../inpact_engine_shared";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "JS — BLOCK D #1", title: "Pure Functions & Immutability", body: `A pure function has two properties:\n1. Same input always produces same output (deterministic)\n2. No side effects (doesn't modify anything outside itself)\n\nImmutability completes the picture: instead of mutating\ndata, return new values. This is why React requires\nimmutable state updates and why Redux reducers must be pure.\n\nThese aren't academic concepts — they're the reason\nyour tests are predictable and your UI doesn't have\nmysterious stale state bugs.`, usecase: "React state, Redux reducers, memoization, concurrent rendering (React 18), unit testing — all require or benefit from pure functions and immutable data." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Identify pure vs impure functions", "Understand referential transparency", "Write immutable array and object update patterns", "Understand why mutation breaks memoization", "Use Immer's produce for ergonomic deep updates", "Detect hidden side effects (Date.now, Math.random, I/O)"] },
  { id: "step1", type: "question", phase: "Step 1 of 5", paal: "Identify pure vs impure. Show the five sources of impurity.", answer_keywords: ["pure", "side effect", "deterministic", "mutation", "impure"], seed_code: `// Step 1: pure vs impure

// PURE — same input, same output, no side effects:
const add = (a, b) => a + b              // ✅ pure
const double = arr => arr.map(x => x*2) // ✅ pure (returns new array)
const getFirst = arr => arr[0]           // ✅ pure

// IMPURE — sources of impurity:

// 1. External state read:
let tax = 0.1
const priceWithTax = amount => amount * (1 + tax)  // ❌ depends on mutable tax

// 2. Mutation of input:
const pushItem = (arr, item) => { arr.push(item); return arr } // ❌ mutates arr

// 3. I/O (logging, network, disk):
const saveUser = user => { console.log(user); return user }    // ❌ console.log is I/O

// 4. Non-deterministic:
const randomId = () => Math.random().toString(36)  // ❌ different each call
const now = () => Date.now()                        // ❌ time is external state

// 5. Exception throwing:
const divide = (a, b) => { if (!b) throw new Error('div/0'); return a/b } // ❌ partial

// How to fix impurity:
// - Pass external state as arguments: priceWithTax(amount, taxRate)
// - Return new values instead of mutating
// - Pass random/time as parameters for testability: createUser(id=Math.random())

const purePriceWithTax = (amount, taxRate) => amount * (1 + taxRate)  // ✅

export { add, double, purePriceWithTax }`,
    feedback_correct: "✅ Five impurity sources: external state, mutation, I/O, non-determinism, exceptions. Pass everything as args.",
    feedback_partial: "Pure = same input, same output, no side effects. Pass external state as arguments to purify.",
    feedback_wrong: "Pure functions take all inputs as params, return new values, never mutate or use external state.",
    expected: "Pure vs impure functions" },
  { id: "step2", type: "question", phase: "Step 2 of 5", paal: "Show immutable array patterns: add, remove, update, sort — all returning new arrays.", answer_keywords: ["immutable", "spread", "filter", "map", "new array"], seed_code: `// Step 2: immutable array operations

const todos = [
  { id: 1, text: 'Buy groceries', done: false },
  { id: 2, text: 'Read book',     done: true  },
  { id: 3, text: 'Exercise',      done: false },
]

// ADD — spread to create new array:
const addTodo = (todos, todo) => [...todos, todo]

// REMOVE — filter creates new array:
const removeTodo = (todos, id) => todos.filter(t => t.id !== id)

// UPDATE — map creates new array, spread to update matching item:
const updateTodo = (todos, id, changes) =>
  todos.map(t => t.id === id ? { ...t, ...changes } : t)

// TOGGLE:
const toggleTodo = (todos, id) =>
  todos.map(t => t.id === id ? { ...t, done: !t.done } : t)

// SORT immutably — spread first, then sort:
const sortByText = todos => [...todos].sort((a, b) => a.text.localeCompare(b.text))

// REORDER (move item from index i to j):
const reorder = (arr, from, to) => {
  const next = [...arr]
  const [item] = next.splice(from, 1)  // only mutation is on the copy
  next.splice(to, 0, item)
  return next
}

// All operations above: original todos is NEVER modified ✅
const added   = addTodo(todos, { id: 4, text: 'Code', done: false })
const removed = removeTodo(todos, 2)
const updated = updateTodo(todos, 1, { done: true })

export { addTodo, removeTodo, updateTodo, toggleTodo }`,
    feedback_correct: "✅ Immutable: add=[...arr,item], remove=filter, update=map+spread, sort=[...arr].sort().",
    feedback_partial: "Spread for add/clone. filter for remove. map+spread for update. [...arr].sort() for immutable sort.",
    feedback_wrong: "[...todos, newItem] for add. todos.filter(t=>t.id!==id) for remove. todos.map(t=>t.id===id?{...t,...changes}:t) for update.",
    expected: "Immutable array operations" },
  { id: "step3", type: "question", phase: "Step 3 of 5", paal: "Show immutable object patterns and how mutation silently breaks memoization.", answer_keywords: ["immutable object", "spread", "memoization", "reference", "cache"], seed_code: `// Step 3: immutable objects and memoization

// Immutable object updates:
const user = { id: 1, name: 'Alice', address: { city: 'Boston', zip: '02101' } }

// Shallow update:
const renamed = { ...user, name: 'Bob' }   // new object, user unchanged

// Nested update — must spread at EVERY level:
const moved = {
  ...user,
  address: { ...user.address, city: 'NYC' }  // new address object too
}

// WHY memoization breaks with mutation:
const memoize = fn => {
  const cache = new WeakMap()
  return arg => {
    if (cache.has(arg)) return cache.get(arg)   // cache HIT based on REFERENCE
    const result = fn(arg)
    cache.set(arg, result)
    return result
  }
}

const compute = memoize(obj => obj.value * 2)

const obj = { value: 5 }
compute(obj)   // 10 — computed, cached

// MUTATION — same reference, cache thinks nothing changed:
obj.value = 20
compute(obj)   // 10 ← WRONG! Cache still holds old result ❌

// IMMUTABLE — new reference, cache correctly recomputes:
const newObj = { ...obj, value: 20 }
compute(newObj)   // 40 ✅ — new reference = cache miss = recompute

export { renamed, moved, compute }`,
    feedback_correct: "✅ Mutation keeps the same reference — memoization caches by reference and returns stale results.",
    feedback_partial: "Mutation: same ref, memoize returns stale. Immutable update: new ref, memoize correctly recomputes.",
    feedback_wrong: "{ ...obj, key: newVal } creates new reference. Memoization (WeakMap/Map) keys on reference.", expected: "Immutable objects and memoization" },
  { id: "step4", type: "question", phase: "Step 4 of 5", paal: "Use Immer's produce for ergonomic deep immutable updates — write mutation-style code that produces immutable results.", answer_keywords: ["immer", "produce", "draft", "immutable", "deep"], seed_code: `// Step 4: Immer — write mutable, get immutable

// Without Immer — deeply nested updates are painful:
const state = {
  users: [
    { id: 1, name: 'Alice', settings: { theme: 'light', notifications: { email: true } } }
  ]
}

const ugly = {
  ...state,
  users: state.users.map(u => u.id === 1 ? {
    ...u,
    settings: { ...u.settings,
      notifications: { ...u.settings.notifications, email: false }
    }
  } : u)
}

// With Immer — write as if mutating, get a new immutable object:
import produce from 'immer'

const clean = produce(state, draft => {
  const user = draft.users.find(u => u.id === 1)
  user.settings.notifications.email = false   // looks like mutation...
})
// ...but state is UNCHANGED, clean is a new object ✅

// Immer uses Proxy to track changes and applies them to a new object
// Only changed paths get new references — structural sharing!

// useImmer hook (react hook):
// const [state, updateState] = useImmer(initialState)
// updateState(draft => { draft.users[0].name = 'Bob' })

export { clean }`,
    feedback_correct: "✅ Immer produce(state, draft=>) lets you write mutation-style code and returns new immutable state.",
    feedback_partial: "produce(state, draft => { /* mutate draft */ }) — Immer proxies draft and applies changes to new object.",
    feedback_wrong: "import produce from 'immer'; const next = produce(state, draft => { draft.value = 42 })", expected: "Immer produce for deep updates" },
  { id: "step5", type: "question", phase: "Step 5 of 5", paal: "Show referential transparency and how pure functions enable safe parallel execution and easy testing.", answer_keywords: ["referential transparency", "pure", "test", "parallel", "substitute"], seed_code: `// Step 5: referential transparency — the superpower of pure functions

// REFERENTIAL TRANSPARENCY: a pure function call can be replaced
// by its return value anywhere without changing program behavior

const square = x => x * x

// These are all equivalent programs:
const a = square(5) + square(5)   // 50
const b = 25 + square(5)           // 50 — replaced first call with result
const c = 25 + 25                  // 50 — replaced both

// This is exactly what JS engines do for optimization!

// TESTING pure functions is trivial — no setup, no mocks:
const formatName = ({ first, last }) => \`\${last}, \${first}\`

// Test:
console.assert(formatName({ first: 'Alice', last: 'Smith' }) === 'Smith, Alice')
// No database mock, no API mock, no DOM setup needed ✅

// PARALLEL SAFETY — pure functions have no shared state to conflict:
// In a Worker pool, all workers can call the same pure fn safely
const processItem = item => ({ ...item, processed: true, at: item.createdAt })
// Multiple workers calling processItem concurrently: ✅ no race conditions

// MEMOIZATION is safe ONLY for pure functions:
// If fn(5) always returns 25, caching { 5: 25 } is always correct
// If fn(5) sometimes returns different values (impure), caching is wrong

export { square, formatName, processItem }`,
    feedback_correct: "✅ Referential transparency = result can replace the call. Enables testing without mocks, safe parallelism, safe memoization.",
    feedback_partial: "Pure functions can be replaced by their return values. This makes them trivially testable and safely cacheable.",
    feedback_wrong: "RT: square(5) === 25 always → can use 25 wherever square(5) appears. Makes testing and memoization trivial.", expected: "Referential transparency" },
];
const sideItems = [
  { label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Pure vs impure", id: "step1" }, { label: "Step 2 — Immutable arrays", id: "step2" },
  { label: "Step 3 — Immutable objects", id: "step3" }, { label: "Step 4 — Immer", id: "step4" },
  { label: "Step 5 — Referential transparency", id: "step5" },
];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "JS-D01", title: "Pure Functions & Immutability", shortName: "JS — PURE FP" });
