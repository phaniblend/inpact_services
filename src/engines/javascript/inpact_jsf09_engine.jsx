import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "JS FUNDAMENTALS #9",
      title: "Generators, Iterators & Proxy",
      body: `Three advanced JS features that unlock powerful patterns:

Generator functions  — pauseable functions that produce values lazily
Async generators     — async iterables for streaming data
Proxy / Reflect      — intercept any operation on an object

Generators are the foundation of async/await (it was built on them)
and are how libraries like Redux-Saga work. Async generators
are how you consume SSE streams and paginated APIs cleanly.
Proxy enables reactive state systems (Vue 3's reactivity is built on it).`,
      usecase: `Infinite scroll with async generators, validation proxies, observable state, pagination pipelines, and SSE/streaming API consumption — all solved elegantly with these tools.`,
    },
  },
  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Write generator functions with function* and yield",
      "Use next(), return(), and throw() on iterators",
      "Build infinite sequences and lazy pipelines with generators",
      "Write async generators for paginated API consumption",
      "Create a Proxy with get, set, and has traps",
      "Use Reflect to forward operations in Proxy handlers",
    ],
  },
  {
    id: "step1", type: "question", phase: "Step 1 of 5",
    paal: "Write a generator function that yields an infinite sequence of IDs. Show next() and for...of consumption.",
    answer_keywords: ["function*", "yield", "next", "generator", "infinite"],
    seed_code: `// Step 1: generator functions — pauseable, resumeable

function* idGenerator(start = 1) {
  let id = start
  while (true) {           // infinite — fine because it's lazy
    yield id++             // pause here, return id, wait for next()
  }
}

const gen = idGenerator()
gen.next()   // { value: 1, done: false }
gen.next()   // { value: 2, done: false }
gen.next()   // { value: 3, done: false }

// Finite generator — done:true at the end:
function* range(start, end, step = 1) {
  for (let i = start; i <= end; i += step) {
    yield i
  }
}

// for...of consumes a generator automatically:
for (const n of range(0, 10, 2)) {
  console.log(n)  // 0 2 4 6 8 10
}

// Spread and destructure work too:
const [first, second, third] = idGenerator(100)
// 100, 101, 102

const arr = [...range(1, 5)]   // [1, 2, 3, 4, 5]

export { idGenerator, range }`,
    feedback_correct: "✅ function* pauses at yield. next() resumes. Lazy — values only computed when requested.",
    feedback_partial: "function* name() { yield value } — yield is the pause point. next() returns { value, done }.",
    feedback_wrong: "function* gen() { yield 1; yield 2 }  |  gen.next().value",
    expected: "Generator function and yield",
  },
  {
    id: "step2", type: "question", phase: "Step 2 of 5",
    paal: "Build a lazy pipeline with generator composition: take(n) and map() over an infinite generator.",
    answer_keywords: ["function*", "yield*", "pipeline", "take", "lazy"],
    seed_code: `// Step 2: generator pipeline — lazy transformation

function* naturals(start = 1) {
  let n = start
  while (true) yield n++
}

// Generic take — consume only n values from any iterable:
function* take(n, iterable) {
  let count = 0
  for (const val of iterable) {
    if (count++ >= n) return
    yield val
  }
}

// Generic map over any iterable:
function* mapIter(fn, iterable) {
  for (const val of iterable) {
    yield fn(val)
  }
}

// Generic filter over any iterable:
function* filterIter(pred, iterable) {
  for (const val of iterable) {
    if (pred(val)) yield val
  }
}

// Pipeline — all lazy, nothing computed until consumed:
const first10Evens = take(10,
  filterIter(n => n % 2 === 0,
    naturals(1)
  )
)

console.log([...first10Evens])   // [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]

// yield* delegates to another iterable:
function* concat(...iterables) {
  for (const it of iterables) yield* it
}

export { naturals, take, mapIter, filterIter, concat }`,
    feedback_correct: "✅ Generator pipelines are lazy — no memory for infinite lists, nothing computed until pulled.",
    feedback_partial: "yield* delegates to another iterable. Compose take/map/filter generators for lazy pipelines.",
    feedback_wrong: "function* take(n, iter) { for (const v of iter) { if (count++ >= n) return; yield v } }",
    expected: "Generator pipeline with take/map/filter",
  },
  {
    id: "step3", type: "question", phase: "Step 3 of 5",
    paal: "Write an async generator to consume a paginated API — yielding each item across all pages.",
    answer_keywords: ["async function*", "async generator", "for await", "paginate"],
    seed_code: `// Step 3: async generators — async iterables for streaming/pagination

async function* fetchAllUsers(pageSize = 20) {
  let page = 1
  let hasMore = true

  while (hasMore) {
    const res = await fetch(\`/api/users?page=\${page}&size=\${pageSize}\`)
    const { users, total, page: current } = await res.json()

    for (const user of users) {
      yield user          // yield each user one at a time
    }

    hasMore = current * pageSize < total
    page++
  }
}

// Consume with for await...of:
async function processAllUsers() {
  for await (const user of fetchAllUsers(50)) {
    await processUser(user)   // handle each user as it arrives
    // Memory: only one page in memory at a time ✅
  }
}

// Async generator for Server-Sent Events / streaming responses:
async function* readStream(response) {
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  while (true) {
    const { done, value } = await reader.read()
    if (done) return
    yield decoder.decode(value)   // yield each chunk as it arrives
  }
}

async function processUser(user) { console.log(user) }

export { fetchAllUsers, readStream }`,
    feedback_correct: "✅ async function* + for await...of = the cleanest pattern for paginated APIs and SSE streams.",
    feedback_partial: "async function* yields Promises. for await...of awaits each yielded value.",
    feedback_wrong: "async function* gen() { yield await fetch(...) }  |  for await (const x of gen()) { ... }",
    expected: "Async generator for pagination",
  },
  {
    id: "step4", type: "question", phase: "Step 4 of 5",
    paal: "Create a Proxy with get, set, and has traps to build a validated, observable object.",
    answer_keywords: ["proxy", "new proxy", "get", "set", "handler", "trap"],
    seed_code: `// Step 4: Proxy — intercept any object operation

function createValidatedUser(data) {
  const REQUIRED = ['name', 'email']
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  return new Proxy(data, {
    get(target, prop, receiver) {
      console.log(\`Getting: \${String(prop)}\`)
      return Reflect.get(target, prop, receiver)  // forward normally
    },

    set(target, prop, value, receiver) {
      // Validate on write:
      if (prop === 'email' && !EMAIL_RE.test(value)) {
        throw new TypeError(\`Invalid email: \${value}\`)
      }
      if (prop === 'age' && (typeof value !== 'number' || value < 0)) {
        throw new TypeError('Age must be a non-negative number')
      }
      console.log(\`Setting: \${String(prop)} = \${value}\`)
      return Reflect.set(target, prop, value, receiver)
    },

    has(target, prop) {
      // Make private fields appear absent:
      if (String(prop).startsWith('_')) return false
      return Reflect.has(target, prop)
    },
  })
}

const user = createValidatedUser({ name: 'Alice', _secret: 'hidden' })
user.email = 'alice@example.com'   // ✅
// user.email = 'not-an-email'     // ❌ TypeError
'_secret' in user                  // false — hidden by has trap ✅

export { createValidatedUser }`,
    feedback_correct: "✅ Proxy traps intercept get/set/has/delete/apply — Vue 3 reactivity is built on this exact pattern.",
    feedback_partial: "new Proxy(target, handler) — handler defines traps. Always use Reflect to forward the default.",
    feedback_wrong: "new Proxy(obj, { get(t,p) { ... }, set(t,p,v) { ... } })",
    expected: "Proxy with get/set/has traps",
  },
  {
    id: "step5", type: "question", phase: "Step 5 of 5",
    paal: "Build a reactive observable using Proxy — when any property changes, notify subscribers (Vue 3's core concept).",
    answer_keywords: ["proxy", "reactive", "observer", "subscribe", "notify"],
    seed_code: `// Step 5: reactive state with Proxy — how Vue 3 works under the hood

function reactive(data, onChange) {
  return new Proxy(data, {
    set(target, prop, value, receiver) {
      const oldValue = target[prop]
      const result = Reflect.set(target, prop, value, receiver)
      if (oldValue !== value) {
        onChange(prop, value, oldValue)   // notify subscriber
      }
      return result
    },
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver)
      // If value is an object, wrap it in a reactive proxy too (deep reactivity):
      if (typeof value === 'object' && value !== null) {
        return reactive(value, onChange)
      }
      return value
    },
  })
}

// Usage:
const state = reactive(
  { count: 0, user: { name: 'Alice' } },
  (prop, newVal, oldVal) => {
    console.log(\`[\${prop}] \${oldVal} → \${newVal}\`)
    // Here you'd trigger a re-render, run effects, etc.
  }
)

state.count++                // [count] 0 → 1
state.count++                // [count] 1 → 2
state.user.name = 'Bob'      // [name] Alice → Bob (deep reactivity)

export { reactive }`,
    feedback_correct: "✅ Proxy set trap + recursive wrapping = deep reactivity. This is the core of Vue 3's composition API.",
    feedback_partial: "Proxy set notifies on change. Wrap nested objects recursively for deep reactivity.",
    feedback_wrong: "new Proxy(data, { set(t,p,v) { Reflect.set(...); onChange(p,v); return true } })",
    expected: "Reactive observable with Proxy",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Generators", id: "step1" },
  { label: "Step 2 — Lazy pipeline", id: "step2" },
  { label: "Step 3 — Async generator", id: "step3" },
  { label: "Step 4 — Proxy", id: "step4" },
  { label: "Step 5 — Reactive state", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: "JS-F09", title: "Generators, Iterators & Proxy", shortName: "JS — GENERATORS" });
