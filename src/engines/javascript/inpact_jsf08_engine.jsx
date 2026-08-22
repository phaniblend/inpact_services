import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "JS FUNDAMENTALS #8",
      title: "Map, Set, WeakMap & Symbols",
      body: `JavaScript's built-in data structures beyond arrays and objects:

Map    — key-value store where keys can be ANY type (not just strings)
Set    — collection of unique values (deduplication, membership test)
WeakMap / WeakSet — same but keys are weakly held (garbage-collected)
Symbol — guaranteed unique primitive, used for metaprogramming

These are the right tools for specific lessons:
• Map when keys aren't strings
• Set for deduplication and fast has() checks
• WeakMap for private data / caching without memory leaks
• Symbol for well-known hooks (Symbol.iterator, Symbol.toPrimitive)`,
      usecase: `Caching function results without memory leaks (WeakMap), deduplicating tags or IDs (Set), using DOM nodes or objects as keys (Map), and extending built-in protocols (Symbol.iterator) — all real-world needs.`,
    },
  },
  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Use Map for any-type keys and ordered iteration",
      "Understand when Map beats a plain object",
      "Use Set for unique collections and fast has() tests",
      "Use WeakMap for private data and memory-safe caches",
      "Create Symbols and use them as unique property keys",
      "Use well-known Symbols (Symbol.iterator, Symbol.toPrimitive)",
    ],
  },
  {
    id: "step1", type: "question", phase: "Step 1 of 5",
    paal: "Create a Map, use object and function keys, iterate it, and convert to/from a plain object.",
    answer_keywords: ["map", "set", "get", "has", "object key"],
    seed_code: `// Step 1: Map — any-type keys, ordered, iterable

const userCache = new Map()

// Keys can be ANY type — objects, functions, numbers, etc:
const userObj = { id: 1 }
userCache.set(userObj, { name: 'Alice', role: 'admin' })
userCache.set('anonymous', { name: 'Guest' })
userCache.set(42, { name: 'Numeric key user' })

userCache.get(userObj)       // { name: 'Alice', ... }
userCache.has('anonymous')   // true
userCache.size               // 3
userCache.delete(42)

// Ordered iteration:
for (const [key, value] of userCache) {
  console.log(key, '→', value.name)
}

// Convert Map → plain object (only works for string/symbol keys):
const obj = Object.fromEntries(userCache)  // loses the object key ⚠️

// Convert plain object → Map:
const config = { theme: 'dark', lang: 'en' }
const configMap = new Map(Object.entries(config))

// When to use Map over plain object:
// • Keys are non-strings (DOM nodes, objects, primitives)
// • You need insertion-order iteration
// • You need .size without Object.keys()
// • You frequently add/delete keys (Map is optimized for this)

export { userCache, configMap }`,
    feedback_correct: "✅ Map supports any key type, preserves insertion order, and has O(1) get/set/has/delete.",
    feedback_partial: "new Map(), .set(key, val), .get(key), .has(key), .delete(key), .size, for...of iteration.",
    feedback_wrong: "const m = new Map()  |  m.set(key, val)  |  m.get(key)  |  for (const [k, v] of m)",
    expected: "Map with any-type keys and iteration",
  },
  {
    id: "step2", type: "question", phase: "Step 2 of 5",
    paal: "Use Set to deduplicate an array, test membership, and compute set operations (union, intersection, difference).",
    answer_keywords: ["set", "has", "unique", "deduplicate", "union"],
    seed_code: `// Step 2: Set — unique values, fast membership testing

// Deduplicate an array:
const tags = ['js', 'css', 'js', 'html', 'css', 'js']
const uniqueTags = [...new Set(tags)]   // ['js', 'css', 'html']

// Membership testing (O(1) vs array's O(n)):
const adminIds = new Set([1, 3, 5, 7, 9])
adminIds.has(3)   // true  — O(1) ✅
adminIds.has(4)   // false
// [1,3,5,7,9].includes(3)  // O(n) — slower for large collections

// Set operations:
const a = new Set([1, 2, 3, 4, 5])
const b = new Set([3, 4, 5, 6, 7])

// Union:
const union = new Set([...a, ...b])           // {1,2,3,4,5,6,7}

// Intersection:
const intersection = new Set([...a].filter(x => b.has(x)))   // {3,4,5}

// Difference (in a but not b):
const difference = new Set([...a].filter(x => !b.has(x)))    // {1,2}

// Convert back to array:
const arr = Array.from(intersection)   // [3, 4, 5]

export { uniqueTags, adminIds, union, intersection, difference }`,
    feedback_correct: "✅ Set is the deduplication and membership-testing tool. Spread + filter for set algebra.",
    feedback_partial: "new Set(arr) deduplicates. .has() for O(1) lookup. Spread to convert back to array.",
    feedback_wrong: "const unique = [...new Set(arr)]  |  set.has(val)  |  new Set([...a].filter(x => b.has(x)))",
    expected: "Set for deduplication and set operations",
  },
  {
    id: "step3", type: "question", phase: "Step 3 of 5",
    paal: "Use WeakMap for memory-safe private data storage — cache metadata on DOM nodes without preventing garbage collection.",
    answer_keywords: ["weakmap", "weak", "garbage", "private", "dom"],
    seed_code: `// Step 3: WeakMap — keys are weakly held → garbage collected when key dies

// Use case 1: private class data (pre-#private-fields pattern)
const _private = new WeakMap()

class Circle {
  constructor(radius) {
    _private.set(this, { radius })   // data tied to 'this'
  }
  get area() {
    const { radius } = _private.get(this)
    return Math.PI * radius ** 2
  }
}

// Use case 2: cache metadata on DOM nodes
const nodeMetadata = new WeakMap()

function annotate(node, data) {
  nodeMetadata.set(node, data)   // node is the key
}

// When the DOM node is removed and garbage collected,
// the WeakMap entry is automatically cleaned up → no memory leak ✅
// A plain Map would hold the node alive forever

// Use case 3: memoize by object reference
const cache = new WeakMap()

function expensiveCompute(obj) {
  if (cache.has(obj)) return cache.get(obj)
  const result = JSON.stringify(obj).length  // placeholder for heavy work
  cache.set(obj, result)
  return result
}

// WeakMap limitations:
// • Keys must be objects (not primitives)
// • Not iterable — no .size, no for...of
// • Can't enumerate keys (by design — GC may have collected some)

export { Circle, annotate, expensiveCompute }`,
    feedback_correct: "✅ WeakMap keys are held weakly — when the key object is GC'd, the entry disappears. No memory leaks.",
    feedback_partial: "WeakMap keys are objects only. Not iterable. Entries auto-removed when key is GC'd.",
    feedback_wrong: "const wm = new WeakMap()  |  wm.set(objKey, value)  |  wm.get(objKey)",
    expected: "WeakMap for memory-safe caching",
  },
  {
    id: "step4", type: "question", phase: "Step 4 of 5",
    paal: "Create Symbols for unique keys, use them as non-enumerable property keys, and use Symbol.for for global registry.",
    answer_keywords: ["symbol", "symbol.for", "unique", "non-enumerable", "description"],
    seed_code: `// Step 4: Symbol — guaranteed unique primitive

// Every Symbol() call returns a unique value:
const id1 = Symbol('id')
const id2 = Symbol('id')
id1 === id2   // false — always unique, even with same description

// Use as object property key — won't conflict with string keys:
const USER_ID = Symbol('userId')

const user = {
  name: 'Alice',
  [USER_ID]: 42,          // symbol key
}

user.name        // 'Alice'
user[USER_ID]    // 42

// Symbol keys are NOT in for...in, Object.keys(), or JSON.stringify():
Object.keys(user)   // ['name'] — USER_ID hidden ✅
JSON.stringify(user) // '{"name":"Alice"}' — symbol omitted

// Symbol.for — global registry (same key = same Symbol):
const s1 = Symbol.for('app.token')
const s2 = Symbol.for('app.token')
s1 === s2   // true — retrieved from global registry

// Symbol.keyFor — look up the key:
Symbol.keyFor(s1)   // 'app.token'

// Well-known Symbols — used to hook into JS built-in behaviour:
class Euros {
  constructor(amount) { this.amount = amount }
  [Symbol.toPrimitive](hint) {
    if (hint === 'string') return \`€\${this.amount}\`
    return this.amount
  }
}

const price = new Euros(42)
\`Price: \${price}\`   // 'Price: €42' — toPrimitive called with hint='string'
price + 10           // 52 — toPrimitive called with hint='number'

export { USER_ID, user, Euros }`,
    feedback_correct: "✅ Symbols are unique keys that won't clash. Well-known Symbols hook into JS engine behaviour.",
    feedback_partial: "Symbol() = unique. Symbol.for() = global registry. [sym] = non-enumerable property key.",
    feedback_wrong: "const sym = Symbol('desc')  |  obj[sym] = val  |  [Symbol.toPrimitive](hint) {}",
    expected: "Symbols as unique keys and metaprogramming",
  },
  {
    id: "step5", type: "question", phase: "Step 5 of 5",
    paal: "Build a typed EventEmitter using Map<string, Set<Function>> — a real-world combination of Map and Set.",
    answer_keywords: ["map", "set", "eventemitter", "on", "emit"],
    seed_code: `// Step 5: EventEmitter — Map + Set working together

class EventEmitter {
  #listeners = new Map()   // Map<eventName, Set<handler>>

  on(event, handler) {
    if (!this.#listeners.has(event)) {
      this.#listeners.set(event, new Set())
    }
    this.#listeners.get(event).add(handler)
    return () => this.off(event, handler)  // return unsubscribe fn
  }

  once(event, handler) {
    const wrapper = (...args) => {
      handler(...args)
      this.off(event, wrapper)
    }
    return this.on(event, wrapper)
  }

  off(event, handler) {
    this.#listeners.get(event)?.delete(handler)
  }

  emit(event, ...args) {
    this.#listeners.get(event)?.forEach(handler => handler(...args))
  }

  listenerCount(event) {
    return this.#listeners.get(event)?.size ?? 0
  }
}

const bus = new EventEmitter()

const unsub = bus.on('data', (payload) => console.log('Got:', payload))
bus.once('connect', () => console.log('Connected!'))

bus.emit('data', { id: 1 })   // 'Got: { id: 1 }'
bus.emit('connect')            // 'Connected!'
bus.emit('connect')            // nothing — once() auto-removed

unsub()   // clean unsubscribe via returned function
bus.listenerCount('data')   // 0

export { EventEmitter }`,
    feedback_correct: "✅ Map<event, Set<handler>> is the canonical EventEmitter structure — O(1) lookup, no duplicate handlers.",
    feedback_partial: "Map stores events. Set prevents duplicate handlers. on() returns an unsubscribe function.",
    feedback_wrong: "new Map() for events → new Set() for handlers. emit calls forEach on the Set.",
    expected: "EventEmitter with Map and Set",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Map", id: "step1" },
  { label: "Step 2 — Set", id: "step2" },
  { label: "Step 3 — WeakMap", id: "step3" },
  { label: "Step 4 — Symbol", id: "step4" },
  { label: "Step 5 — EventEmitter", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: "JS-F08", title: "Map, Set, WeakMap & Symbols", shortName: "JS — DATA STRUCTURES" });
