# JavaScript

Lessons and learning objectives.

**{JS FUNDAMENTALS #1 :: Variables, Destructuring & Spread}**

LOs:

01
Understand var vs let vs const — scoping and hoisting differences

02
Destructure arrays with position aliases and defaults

03
Destructure objects with rename syntax and nested paths

04
Use rest in destructuring to collect remaining values

05
Use spread to clone, merge, and override objects and arrays

06
Apply these patterns in function parameters directly

---

**{JS FUNDAMENTALS #2 :: Functions — Arrow, Closures & Higher-Order}**

LOs:

01
Write arrow functions in all three syntactic forms

02
Explain why arrow functions don't have their own this

03
Explain what a closure is and how it captures scope

04
Write higher-order functions that return functions

05
Use IIFE to create a private scope

06
Understand currying and partial application

---

**{JS FUNDAMENTALS #3 :: Promises & Async/Await}**

LOs:

01
Create and consume a Promise manually

02
Chain .then() / .catch() / .finally()

03
Convert callback-based code to Promises

04
Write async functions and await Promises

05
Handle errors with try/catch in async functions

06
Run Promises in parallel with Promise.all — and know when to use Promise.allSettled

07
Use Promise.race and Promise.any for competitive resolution

---

**{JS FUNDAMENTALS #4 :: Arrays & Iterators — The Data Pipeline Toolkit}**

LOs:

01
Use map to transform every element

02
Use filter to select elements by predicate

03
Use reduce to fold an array into any shape

04
Know all mutating vs non-mutating methods

05
Use flat and flatMap for nested arrays

06
Create iterables with Symbol.iterator and for...of

---

**{JS FUNDAMENTALS #5 :: Objects, Prototypes & Classes}**

LOs:

01
Understand prototype chains — how property lookup works

02
Write ES6 classes with constructor, methods, static, getters/setters

03
Use private fields (#) for encapsulation

04
Extend classes with extends and call super()

05
Use Object.keys/values/entries/assign/freeze/fromEntries

06
Understand this binding gotchas in class methods

---

**{JS FUNDAMENTALS #6 :: Modules — ESM & CommonJS}**

LOs:

01
Use named exports and named imports (with aliases)

02
Use default export and default import

03
Build a barrel index.js with re-exports

04
Use dynamic import() for lazy code splitting

05
Understand CommonJS require/module.exports

06
Know the ESM ↔ CJS interop rules in Node.js

---

**{JS FUNDAMENTALS #7 :: Error Handling & Debugging}**

LOs:

01
Use try/catch/finally for sync and async code

02
Create custom Error subclasses with type and context

03
Catch errors at the right boundary — not too early, not too late

04
Handle unhandled Promise rejections globally

05
Use console.error / console.table / console.time effectively

06
Understand error propagation in async call stacks

---

**{JS FUNDAMENTALS #8 :: Map, Set, WeakMap & Symbols}**

LOs:

01
Use Map for any-type keys and ordered iteration

02
Understand when Map beats a plain object

03
Use Set for unique collections and fast has() tests

04
Use WeakMap for private data and memory-safe caches

05
Create Symbols and use them as unique property keys

06
Use well-known Symbols (Symbol.iterator, Symbol.toPrimitive)

---

**{JS FUNDAMENTALS #9 :: Generators, Iterators & Proxy}**

LOs:

01
Write generator functions with function* and yield

02
Use next(), return(), and throw() on iterators

03
Build infinite sequences and lazy pipelines with generators

04
Write async generators for paginated API consumption

05
Create a Proxy with get, set, and has traps

06
Use Reflect to forward operations in Proxy handlers

---

**{JS FUNDAMENTALS #10 :: Performance, Memory & the Event Loop}**

LOs:

01
Explain the event loop: call stack, task queue, microtask queue

02
Know why Promises resolve before setTimeout callbacks

03
Implement debounce and throttle from scratch

04
Identify and fix the three most common memory leaks

05
Use requestAnimationFrame for smooth animation

06
Offload heavy work to a Web Worker

---

**{JS FUNDAMENTALS #12 :: Regular Expressions — Real-World Depth}**

LOs:

01
Write patterns with character classes, quantifiers, and anchors

02
Use capture groups () and named groups (?<name>)

03
Use flags: g, i, m, s, u

04
Use lookahead (?=) and lookbehind (?<=) for context-aware patterns

05
Use matchAll() for iterating all matches with groups

06
Avoid the stateful lastIndex trap with /g on RegExp instances

07
Build dynamic patterns with new RegExp()

---

**{JS FUNDAMENTALS #13 :: Numbers, Math, Date & Intl}**

LOs:

01
Understand Number precision, NaN, Infinity, and Number.EPSILON

02
Use Number static methods: isNaN, isFinite, isInteger, parseFloat

03
Use Math for rounding, clamping, random ranges, and statistical ops

04
Create and compare Date objects — and know why to use a library

05
Use Intl.NumberFormat for currency, percent, and compact notation

06
Use Intl.DateTimeFormat and Intl.RelativeTimeFormat

---

**{JS FUNDAMENTALS #14 :: Type Coercion, Equality & Truthy/Falsy}**

LOs:

01
Memorise the 6 falsy values — and everything else is truthy

02
Explain == coercion rules: ToPrimitive, ToNumber, ToString

03
Know the === rules: no coercion, same type and value

04
Understand + as both addition and concatenation

05
Use Boolean(), !! and ?? and || correctly

06
Spot coercion bugs in real code and fix them

---

**{JS FUNDAMENTALS #15 :: Scope, Hoisting & the Temporal Dead Zone}**

LOs:

01
Understand global, function, block, and module scope

02
Explain var hoisting — declaration hoisted, initialisation not

03
Explain function declaration hoisting — fully hoisted

04
Explain TDZ — let/const exist but throw until initialisation

05
Diagnose the closure-in-loop bug and fix it three ways

06
Understand lexical scope vs dynamic scope

---
