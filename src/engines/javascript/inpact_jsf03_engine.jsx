import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "JS FUNDAMENTALS #3",
      title: "Promises & Async/Await",
      body: `Asynchronous JavaScript is unavoidable — every network call,
file read, and timer is async. You need to master all three layers:

Callbacks    → the old way (callback hell)
Promises     → chainable, composable async values
async/await  → syntactic sugar over Promises

The key insight: async/await doesn't replace Promises.
It IS Promises — just with synchronous-looking syntax.
Understanding the underlying model is what lets you handle
parallel execution, race conditions, and error propagation correctly.`,
      usecase: `Every API call in your frontend, every database query in your backend, every file operation in Node.js — all async. Getting this wrong means race conditions, unhandled rejections, and silent failures.`,
    },
  },
  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Create and consume a Promise manually",
      "Chain .then() / .catch() / .finally()",
      "Convert callback-based code to Promises",
      "Write async functions and await Promises",
      "Handle errors with try/catch in async functions",
      "Run Promises in parallel with Promise.all — and know when to use Promise.allSettled",
      "Use Promise.race and Promise.any for competitive resolution",
    ],
  },
  {
    id: "step1", type: "question", phase: "Step 1 of 5",
    paal: "Create a Promise manually with resolve and reject. Chain .then(), .catch(), .finally().",
    answer_keywords: ["promise", "resolve", "reject", "then", "catch"],
    seed_code: `// Step 1: creating and consuming Promises

function fetchUser(id) {
  return new Promise((resolve, reject) => {
    if (id <= 0) {
      reject(new Error('ID must be positive'))   // rejection
      return
    }
    // Simulate async work:
    setTimeout(() => {
      resolve({ id, name: 'Alice' })             // resolution
    }, 100)
  })
}

fetchUser(1)
  .then(user => {
    console.log(user.name)   // 'Alice'
    return user.id           // pass value to next .then()
  })
  .then(id => console.log('ID:', id))
  .catch(err => console.error('Error:', err.message))
  .finally(() => console.log('Done'))   // always runs

fetchUser(-1)   // triggers .catch

export { fetchUser }`,
    feedback_correct: "✅ Promise constructor, chaining, and all three handlers — the full mental model.",
    feedback_partial: "new Promise((resolve, reject) => { ... }).then(...).catch(...).finally(...)",
    feedback_wrong: "return new Promise((resolve, reject) => { /* async work */ resolve(value) })",
    expected: "Manual Promise creation and chaining",
  },
  {
    id: "step2", type: "question", phase: "Step 2 of 5",
    paal: "Write the same fetch logic with async/await. Show proper error handling with try/catch/finally.",
    answer_keywords: ["async", "await", "try", "catch", "finally"],
    seed_code: `// Step 2: async/await — same Promise, better syntax

async function fetchUser(id) {
  if (id <= 0) throw new Error('ID must be positive')

  // Simulate async API call:
  const user = await new Promise(resolve =>
    setTimeout(() => resolve({ id, name: 'Alice' }), 100)
  )
  return user
}

async function main() {
  try {
    const user = await fetchUser(1)
    console.log(user.name)   // 'Alice'
  } catch (err) {
    console.error('Error:', err.message)
  } finally {
    console.log('Done')   // always runs
  }
}

// Async functions ALWAYS return a Promise — even if you return a plain value:
async function getNumber() { return 42 }
getNumber().then(n => console.log(n))   // 42 — wrapped in Promise

main()
export { fetchUser, main }`,
    feedback_correct: "✅ async/await is syntactic sugar — under the hood it's the same Promise chain.",
    feedback_partial: "async keyword on the function, await on each Promise. try/catch replaces .catch().",
    feedback_wrong: "async function fn() { try { const x = await promise } catch(e) { ... } }",
    expected: "async/await with try/catch",
  },
  {
    id: "step3", type: "question", phase: "Step 3 of 5",
    paal: "Promisify a callback-based function. Convert setTimeout and a Node-style callback into Promises.",
    answer_keywords: ["promisify", "callback", "new promise", "resolve", "reject"],
    seed_code: `// Step 3: promisifying callbacks

// Generic promisify for Node-style (err, result) callbacks:
function promisify(fn) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (err, result) => {
        if (err) reject(err)
        else resolve(result)
      })
    })
  }
}

// delay — wrap setTimeout:
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Node fs.readFile (callback style) → Promise:
// const readFile = promisify(require('fs').readFile)
// const content = await readFile('file.txt', 'utf8')

// Usage:
async function main() {
  console.log('start')
  await delay(500)
  console.log('500ms later')
}

// Note: Node.js ships with util.promisify() and fs.promises for this:
// const { promisify } = require('util')
// const readFile = promisify(fs.readFile)

export { promisify, delay }`,
    feedback_correct: "✅ Promisifying is the bridge from legacy callback APIs to modern async/await code.",
    feedback_partial: "Wrap the callback-based fn in new Promise, resolve on success, reject on error.",
    feedback_wrong: "function promisify(fn) { return (...args) => new Promise((res, rej) => fn(...args, (e, r) => e ? rej(e) : res(r))) }",
    expected: "Promisify callback-based functions",
  },
  {
    id: "step4", type: "question", phase: "Step 4 of 5",
    paal: "Use Promise.all for parallel execution. Then show Promise.allSettled for when some can fail. Explain the difference.",
    answer_keywords: ["promise.all", "allsettled", "parallel", "concurrent"],
    seed_code: `// Step 4: parallel Promise execution

const delay = ms => new Promise(r => setTimeout(r, ms))
const fetchUser   = async (id) => { await delay(100); return { id, name: 'User' + id } }
const fetchOrders = async (id) => { await delay(150); return [{ orderId: 1 }, { orderId: 2 }] }
const fetchPrefs  = async (id) => { await delay(80);  return { theme: 'dark' } }

// Promise.all — all must succeed, runs in parallel:
async function loadDashboard(userId) {
  const [user, orders, prefs] = await Promise.all([
    fetchUser(userId),
    fetchOrders(userId),
    fetchPrefs(userId),
  ])
  // Total time ≈ 150ms (longest), not 330ms (sequential) ✅
  return { user, orders, prefs }
}

// Promise.all FAILS FAST — if one rejects, the whole thing rejects

// Promise.allSettled — waits for ALL, captures success AND failure:
async function loadDashboardSafe(userId) {
  const results = await Promise.allSettled([
    fetchUser(userId),
    fetchOrders(userId),
    Promise.reject(new Error('Prefs unavailable')),  // this one fails
  ])

  results.forEach(r => {
    if (r.status === 'fulfilled') console.log(r.value)
    else console.error(r.reason.message)
  })
}

export { loadDashboard, loadDashboardSafe }`,
    feedback_correct: "✅ Promise.all for 'all must succeed'; Promise.allSettled for 'show partial results even on failure'.",
    feedback_partial: "Promise.all([p1, p2, p3]) runs in parallel. Fails fast on any rejection.",
    feedback_wrong: "await Promise.all([p1, p2])  vs  await Promise.allSettled([p1, p2])",
    expected: "Promise.all vs Promise.allSettled",
  },
  {
    id: "step5", type: "question", phase: "Step 5 of 5",
    paal: "Show Promise.race (first to settle wins) and Promise.any (first to succeed wins). Use race to implement a fetch timeout.",
    answer_keywords: ["promise.race", "promise.any", "timeout", "race"],
    seed_code: `// Step 5: Promise.race and Promise.any

const delay = ms => new Promise(r => setTimeout(r, ms))

// Promise.race — first to settle (resolve OR reject) wins:
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(\`Timeout after \${ms}ms\`)), ms)
  )
  return Promise.race([promise, timeout])
}

async function main() {
  try {
    const data = await withTimeout(
      fetch('/api/slow-endpoint').then(r => r.json()),
      3000   // give up after 3 seconds
    )
    console.log(data)
  } catch (err) {
    console.error(err.message)   // 'Timeout after 3000ms'
  }
}

// Promise.any — first to RESOLVE wins (ignores rejections):
async function fetchFromFastestMirror(urls) {
  return Promise.any(urls.map(url => fetch(url).then(r => r.json())))
  // If ALL reject → AggregateError
}

// Summary:
// .race  → first to settle (resolve or reject)
// .any   → first to resolve (skip rejections until all fail)
// .all   → all must resolve (fail fast)
// .allSettled → wait for all, show every outcome

export { withTimeout, fetchFromFastestMirror }`,
    feedback_correct: "✅ Promise.race for timeout patterns; Promise.any for redundant-source patterns.",
    feedback_partial: "race = first to settle; any = first to succeed.",
    feedback_wrong: "Promise.race([fetchPromise, timeoutPromise])  |  Promise.any([mirror1, mirror2])",
    expected: "Promise.race and Promise.any",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Promise basics", id: "step1" },
  { label: "Step 2 — async/await", id: "step2" },
  { label: "Step 3 — Promisify", id: "step3" },
  { label: "Step 4 — Parallel (all)", id: "step4" },
  { label: "Step 5 — race / any", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: "JS-F03", title: "Promises & Async/Await", shortName: "JS — ASYNC" });
