import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "JS FUNDAMENTALS #10",
      title: "Performance, Memory & the Event Loop",
      body: `Understanding what JavaScript actually does at runtime
is what separates senior engineers from junior ones.

The Event Loop   — call stack, task queue, microtask queue
Memory model     — stack vs heap, garbage collection, memory leaks
Debounce/Throttle — rate-limiting expensive operations
requestAnimationFrame — smooth animations without jank
Web Workers      — true parallelism without blocking the main thread

These aren't academic concepts. They explain every "why is the
UI freezing?" and "why does my component render 200 times?"
bug you'll ever face.`,
      usecase: `Smooth scroll handlers, search-as-you-type inputs, heavy data processing without blocking the UI, memory-safe event listeners — all require this knowledge.`,
    },
  },
  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Explain the event loop: call stack, task queue, microtask queue",
      "Know why Promises resolve before setTimeout callbacks",
      "Implement debounce and throttle from scratch",
      "Identify and fix the three most common memory leaks",
      "Use requestAnimationFrame for smooth animation",
      "Offload heavy work to a Web Worker",
    ],
  },
  {
    id: "step1", type: "question", phase: "Step 1 of 5",
    paal: "Explain and demonstrate the event loop: call stack, task queue (macrotasks), and microtask queue order.",
    answer_keywords: ["event loop", "microtask", "macrotask", "settimeout", "promise"],
    seed_code: `// Step 1: event loop — execution order

console.log('1: sync start')

setTimeout(() => console.log('4: setTimeout (macrotask)'), 0)

Promise.resolve()
  .then(() => console.log('3: Promise .then (microtask)'))
  .then(() => console.log('3b: chained microtask'))

queueMicrotask(() => console.log('3c: queueMicrotask'))

console.log('2: sync end')

// Output order:
// 1: sync start
// 2: sync end
// 3: Promise .then (microtask)    ← ALL microtasks drain before next macrotask
// 3b: chained microtask
// 3c: queueMicrotask
// 4: setTimeout (macrotask)

// Why this matters:
// await in async functions resumes as a microtask →
// multiple awaits can complete before ANY setTimeout fires

// Rule: sync code → microtasks (Promises, queueMicrotask) → macrotasks (setTimeout, setInterval, I/O)

export {}`,
    feedback_correct: "✅ Microtasks drain completely before the next macrotask — Promises always run before setTimeout(0).",
    feedback_partial: "sync code first → then all microtasks (Promise.then) → then macrotasks (setTimeout).",
    feedback_wrong: "Promises (.then) are microtasks — they always fire before the next setTimeout, even setTimeout(0).",
    expected: "Event loop execution order",
  },
  {
    id: "step2", type: "question", phase: "Step 2 of 5",
    paal: "Implement debounce (delay until idle) and throttle (limit rate) from scratch. Explain when each applies.",
    answer_keywords: ["debounce", "throttle", "delay", "settimeout", "clearTimeout"],
    seed_code: `// Step 2: debounce and throttle

// DEBOUNCE — wait until N ms of silence, then fire once
// Use: search input, resize handler, form autosave
function debounce(fn, delay) {
  let timer = null
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

// THROTTLE — fire at most once per N ms, no matter how often called
// Use: scroll handler, mousemove, rapid click
function throttle(fn, limit) {
  let inThrottle = false
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args)
      inThrottle = true
      setTimeout(() => { inThrottle = false }, limit)
    }
  }
}

// Usage:
const onSearch = debounce((query) => {
  console.log('Searching:', query)
  // fetch('/api/search?q=' + query)
}, 300)

const onScroll = throttle(() => {
  console.log('Scroll at:', window.scrollY)
}, 100)

// document.querySelector('input').addEventListener('input', e => onSearch(e.target.value))
// window.addEventListener('scroll', onScroll)

// DEBOUNCE vs THROTTLE:
// debounce = "call me only after you stop typing for 300ms"
// throttle = "call me at most once every 100ms regardless"

export { debounce, throttle }`,
    feedback_correct: "✅ debounce delays until idle — throttle limits rate. Both use closures over a timer variable.",
    feedback_partial: "debounce: clearTimeout + setTimeout each call. throttle: flag blocks re-entry during the limit.",
    feedback_wrong: "debounce: clearTimeout(timer); timer = setTimeout(fn, delay)  |  throttle: if(!flag) { fn(); flag=true; setTimeout(reset) }",
    expected: "debounce and throttle implementations",
  },
  {
    id: "step3", type: "question", phase: "Step 3 of 5",
    paal: "Identify and fix the three most common JS memory leaks: forgotten event listeners, closures holding large data, and detached DOM nodes.",
    answer_keywords: ["memory leak", "removeEventListener", "abortcontroller", "cleanup", "weakref"],
    seed_code: `// Step 3: the three memory leak patterns

// LEAK 1: Forgotten event listeners
// Every addEventListener must have a matching removeEventListener

// BAD — adds a new listener every render, old ones accumulate:
function setupBad() {
  document.addEventListener('click', handleClick)
}
// GOOD — remove when done:
function setupGood() {
  const controller = new AbortController()
  document.addEventListener('click', handleClick, { signal: controller.signal })
  return () => controller.abort()   // removes ALL listeners added with this signal ✅
}
function handleClick(e) { console.log(e.target) }

// LEAK 2: Closures holding references to large data
function processLargeDataBad() {
  const bigArray = new Array(1_000_000).fill('data')
  return function() {
    return bigArray[0]   // closure holds entire bigArray forever ❌
  }
}
function processLargeDataGood() {
  const bigArray = new Array(1_000_000).fill('data')
  const first = bigArray[0]   // extract only what's needed
  // bigArray can now be GC'd ✅
  return function() { return first }
}

// LEAK 3: Detached DOM nodes
// A removed node held in JS keeps its entire subtree alive
class ComponentBad {
  constructor() {
    this.element = document.createElement('div')
    this.data = new Array(10_000).fill('state')
    document.body.appendChild(this.element)
  }
  destroy() {
    this.element.remove()
    // BUG: this.element still referenced → subtree stays in memory ❌
  }
}
class ComponentGood {
  constructor() {
    this.element = document.createElement('div')
    document.body.appendChild(this.element)
  }
  destroy() {
    this.element.remove()
    this.element = null    // release the reference → GC can collect ✅
  }
}

export { setupGood, processLargeDataGood, ComponentGood }`,
    feedback_correct: "✅ Three leaks: forgotten listeners (use AbortController), closure over large data (extract), detached nodes (null the ref).",
    feedback_partial: "Listeners: AbortController signal. Closures: extract primitives not whole objects. DOM: null refs on destroy.",
    feedback_wrong: "AbortController for listeners  |  extract only needed values from closures  |  null DOM refs on cleanup",
    expected: "Memory leak identification and fixes",
  },
  {
    id: "step4", type: "question", phase: "Step 4 of 5",
    paal: "Use requestAnimationFrame for smooth animation. Explain why setTimeout(fn, 16) is wrong for animations.",
    answer_keywords: ["requestanimationframe", "raf", "animation", "smooth", "cancel"],
    seed_code: `// Step 4: requestAnimationFrame — smooth 60fps animations

// BAD: setTimeout is not synced to the display refresh rate:
// setInterval(() => updateAnimation(), 16)  // 16ms ≈ 60fps, but not accurate
// Lessons: drifts over time, fires even when tab is hidden (wastes CPU)

// GOOD: requestAnimationFrame — browser calls you at the RIGHT moment:
function animateCounter(target, duration, el) {
  const start = performance.now()

  function step(timestamp) {
    const elapsed = timestamp - start
    const progress = Math.min(elapsed / duration, 1)   // 0 → 1

    // Easing function (ease-out):
    const eased = 1 - Math.pow(1 - progress, 3)
    el.textContent = Math.round(eased * target)

    if (progress < 1) {
      requestAnimationFrame(step)   // schedule next frame ← recursive
    }
  }

  const frameId = requestAnimationFrame(step)
  return () => cancelAnimationFrame(frameId)   // cancellation function
}

// Benefits of rAF:
// • Synced to monitor refresh (60, 90, 120fps — whatever the screen supports)
// • Paused automatically when tab is hidden → no wasted CPU
// • Batched with browser rendering pipeline → no layout thrashing

const cancel = animateCounter(1000, 2000, document.getElementById('count'))
// cancel()  ← call to stop

export { animateCounter }`,
    feedback_correct: "✅ rAF syncs to the display — smooth, efficient, auto-paused when hidden. setTimeout drifts and wastes CPU.",
    feedback_partial: "requestAnimationFrame(step) — browser calls step before each repaint. Cancel with cancelAnimationFrame(id).",
    feedback_wrong: "requestAnimationFrame(fn) — fn receives timestamp. Return the id to cancel later.",
    expected: "requestAnimationFrame for smooth animation",
  },
  {
    id: "step5", type: "question", phase: "Step 5 of 5",
    paal: "Offload CPU-heavy work to a Web Worker — true parallelism that keeps the main thread responsive.",
    answer_keywords: ["web worker", "worker", "postmessage", "onmessage", "offload"],
    seed_code: `// Step 5: Web Workers — true parallelism for heavy computation

// ── worker.js (separate file, runs in its own thread) ────────
self.onmessage = function(event) {
  const { data, type } = event.data

  if (type === 'SORT') {
    // Heavy computation — doesn't block the main thread:
    const sorted = [...data].sort((a, b) => a - b)
    self.postMessage({ type: 'SORTED', result: sorted })
  }
}

// ── main.js ───────────────────────────────────────────────────
const worker = new Worker(new URL('./worker.js', import.meta.url))

// Send data to the worker:
const bigArray = Array.from({ length: 1_000_000 }, () => Math.random())
worker.postMessage({ type: 'SORT', data: bigArray })

// Receive results (async — non-blocking):
worker.onmessage = (event) => {
  if (event.data.type === 'SORTED') {
    console.log('Sorted:', event.data.result.slice(0, 5))
    worker.terminate()   // always terminate when done
  }
}

worker.onerror = (err) => console.error('Worker error:', err)

// Transferable objects — zero-copy transfer for large buffers:
const buffer = new ArrayBuffer(1_000_000 * 4)
worker.postMessage({ type: 'PROCESS', buffer }, [buffer])
// buffer is MOVED to the worker — no copy, main thread loses access

// Use cases: sorting/filtering large datasets, image processing,
// cryptography, compression, markdown parsing — anything >16ms

export {}`,
    feedback_correct: "✅ Workers run in a separate thread — postMessage passes data, onmessage receives results. Always terminate() when done.",
    feedback_partial: "new Worker('./worker.js')  |  worker.postMessage(data)  |  worker.onmessage = fn  |  worker.terminate()",
    feedback_wrong: "Main thread: new Worker(url), postMessage, onmessage. Worker: self.onmessage, self.postMessage.",
    expected: "Web Worker for heavy computation",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Event loop", id: "step1" },
  { label: "Step 2 — Debounce/Throttle", id: "step2" },
  { label: "Step 3 — Memory leaks", id: "step3" },
  { label: "Step 4 — rAF animation", id: "step4" },
  { label: "Step 5 — Web Workers", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: "JS-F10", title: "Performance, Memory & Event Loop", shortName: "JS — PERFORMANCE" });
