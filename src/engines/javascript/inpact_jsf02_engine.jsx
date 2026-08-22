import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "JS FUNDAMENTALS #2",
      title: "Functions — Arrow, Closures & Higher-Order",
      body: `Functions in modern JS are first-class values.
You pass them around, return them, and store them.

Arrow functions     — concise syntax, lexical this
Closures            — functions that remember their outer scope
Higher-order funcs  — functions that take or return functions
IIFE                — immediately invoked function expressions
Currying            — transforming multi-arg functions into chains

These patterns underpin React hooks, event handlers,
middleware chains, and every callback in the ecosystem.`,
      usecase: `Every onClick, every useEffect callback, every array method callback, every middleware — all of these are functions passed as values. Understanding closures is the key to understanding useState, useCallback, and event listener cleanup.`,
    },
  },
  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Write arrow functions in all three syntactic forms",
      "Explain why arrow functions don't have their own this",
      "Explain what a closure is and how it captures scope",
      "Write higher-order functions that return functions",
      "Use IIFE to create a private scope",
      "Understand currying and partial application",
    ],
  },
  {
    id: "step1", type: "question", phase: "Step 1 of 5",
    paal: "Write arrow functions: block body, expression body (implicit return), single param (no parens), no params.",
    answer_keywords: ["=>", "implicit", "return"],
    seed_code: `// Step 1: arrow function syntax variants

// Block body — explicit return required:
const double = (n) => { return n * 2 }

// Expression body — implicit return (no braces, no return):
const triple = n => n * 3

// Multiple params — parens required:
const add = (a, b) => a + b

// No params — empty parens required:
const greet = () => 'Hello!'

// Returning an object literal — wrap in parens to avoid { ambiguity:
const makeUser = (name, age) => ({ name, age })
//                               ^ parens tell JS: this { is an object, not a block

// Arrow functions vs regular functions — this binding:
const obj = {
  name: 'Timer',
  start() {
    // Arrow function inherits this from start():
    setTimeout(() => console.log(this.name), 100)   // 'Timer' ✅
    // Regular function would have its own this (undefined in strict mode):
    // setTimeout(function() { console.log(this.name) }, 100)  // undefined ❌
  }
}

export { double, triple, add, greet, makeUser }`,
    feedback_correct: "✅ Four syntactic forms + the critical this difference — the whole picture.",
    feedback_partial: "n => n * 2 is implicit return. (a, b) => a + b for multiple params. () => for no params.",
    feedback_wrong: "const fn = (params) => expression  |  const fn = (params) => ({ obj })",
    expected: "Arrow function all forms",
  },
  {
    id: "step2", type: "question", phase: "Step 2 of 5",
    paal: "Demonstrate a closure: a function that creates a private counter with increment, decrement, and getValue — inaccessible from outside.",
    answer_keywords: ["closure", "function", "private", "counter", "return"],
    seed_code: `// Step 2: closures — functions that remember their outer scope

function createCounter(initialValue = 0) {
  let count = initialValue   // private — not accessible from outside

  return {
    increment() { count++ },
    decrement() { count-- },
    reset()     { count = initialValue },
    getValue()  { return count },
  }
}

const counter = createCounter(10)
counter.increment()
counter.increment()
counter.decrement()
console.log(counter.getValue())  // 11

// count is inaccessible directly:
// console.log(counter.count)    // undefined — private via closure ✅

// Another classic closure — factory function:
function multiplier(factor) {
  return (number) => number * factor   // factor is closed over
}

const double = multiplier(2)
const triple = multiplier(3)
double(5)   // 10
triple(5)   // 15

export { createCounter, multiplier }`,
    feedback_correct: "✅ Closure = function + its surrounding scope. Private state without classes.",
    feedback_partial: "The inner function closes over the outer variable — it remembers it even after the outer function returns.",
    feedback_wrong: "function outer() { let x = 0; return function inner() { return x } } — inner closes over x.",
    expected: "Closure for private state",
  },
  {
    id: "step3", type: "question", phase: "Step 3 of 5",
    paal: "Write a higher-order function: compose(f, g) that returns a new function applying g then f.",
    answer_keywords: ["higher", "return", "function", "compose", "=>"],
    seed_code: `// Step 3: higher-order functions — take or return functions

// compose: apply right-to-left (standard math composition)
const compose = (...fns) => (x) => fns.reduceRight((v, f) => f(v), x)

// pipe: apply left-to-right (more readable for data pipelines)
const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x)

const trim      = s => s.trim()
const toLower   = s => s.toLowerCase()
const removeSpaces = s => s.replace(/\s+/g, '-')

const slugify = pipe(trim, toLower, removeSpaces)
slugify('  Hello World  ')   // 'hello-world'

// Memoize — a higher-order function that caches results:
function memoize(fn) {
  const cache = new Map()
  return function(...args) {
    const key = JSON.stringify(args)
    if (cache.has(key)) return cache.get(key)
    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}

const expensiveCalc = memoize((n) => n * n)
expensiveCalc(10)   // computed
expensiveCalc(10)   // from cache

export { compose, pipe, slugify, memoize }`,
    feedback_correct: "✅ Higher-order functions are the backbone of FP patterns — compose, pipe, memoize all follow this shape.",
    feedback_partial: "A higher-order function takes a function as input or returns one as output.",
    feedback_wrong: "const compose = (f, g) => (x) => f(g(x))",
    expected: "Higher-order compose and pipe",
  },
  {
    id: "step4", type: "question", phase: "Step 4 of 5",
    paal: "Use an IIFE to create a private module scope. Show the module pattern — the predecessor of ES modules.",
    answer_keywords: ["iife", "(function", "immediately", "invoked", "()"],
    seed_code: `// Step 4: IIFE — Immediately Invoked Function Expression

// Classic IIFE — creates a private scope, runs immediately:
const analytics = (function() {
  let eventCount = 0   // private — not polluting global scope

  function track(event) {
    eventCount++
    console.log(\`Event: \${event} (total: \${eventCount})\`)
  }

  return { track, getCount: () => eventCount }
})()   // <── the () at the end invokes it immediately

analytics.track('page_view')   // Event: page_view (total: 1)
analytics.track('click')       // Event: click (total: 2)
analytics.getCount()           // 2

// Arrow IIFE:
const result = (() => {
  const data = [1, 2, 3]
  return data.reduce((a, b) => a + b, 0)
})()
console.log(result)   // 6

// Today you'd use ES modules instead of IIFEs for module scope,
// but IIFEs are still useful for initializing async work or
// isolating a block of setup code.

export { analytics, result }`,
    feedback_correct: "✅ IIFE = define + call in one expression. Private scope without polluting globals.",
    feedback_partial: "(function() { ... })() or (() => { ... })() — wrapping + trailing () invokes it.",
    feedback_wrong: "(function() { /* private code */ })() — the wrapping parens make it an expression.",
    expected: "IIFE for private scope",
  },
  {
    id: "step5", type: "question", phase: "Step 5 of 5",
    paal: "Implement currying: transform a function of N arguments into a chain of N single-argument functions.",
    answer_keywords: ["curry", "partial", "chain", "=>", "application"],
    seed_code: `// Step 5: currying and partial application

// Manual curry — two args:
const add = (a) => (b) => a + b

const add5 = add(5)    // partial application — a = 5 is fixed
add5(3)                // 8
add5(10)               // 15

// Automatic curry for any arity:
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn(...args)   // enough args — call the original
    }
    return (...more) => curried(...args, ...more)   // wait for more
  }
}

const multiply = curry((a, b, c) => a * b * c)

multiply(2)(3)(4)    // 24 — fully curried
multiply(2, 3)(4)    // 24 — partially applied
multiply(2, 3, 4)    // 24 — called all at once

// Real-world: curried event handler factory
const handleChange = (field) => (event) => {
  console.log(\`\${field}: \${event.target.value}\`)
}
// <input onChange={handleChange('email')} />

export { add, curry, multiply, handleChange }`,
    feedback_correct: "✅ Currying enables partial application — fix some args now, apply the rest later.",
    feedback_partial: "const fn = (a) => (b) => a + b — each call returns a new function expecting the next arg.",
    feedback_wrong: "const add = a => b => a + b  |  const handler = field => event => ...",
    expected: "Currying and partial application",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Arrow functions", id: "step1" },
  { label: "Step 2 — Closures", id: "step2" },
  { label: "Step 3 — Higher-order", id: "step3" },
  { label: "Step 4 — IIFE", id: "step4" },
  { label: "Step 5 — Currying", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: "JS-F02", title: "Functions Deep Dive", shortName: "JS — FUNCTIONS" });
