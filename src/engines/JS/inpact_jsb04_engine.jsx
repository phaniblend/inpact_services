import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "JS — BLOCK B #4",
      title: "`this` — All 5 Binding Rules",
      body: `'this' is determined at CALL TIME, not at write time.
This single fact explains every 'this' bug you've ever seen.

There are exactly 5 rules. They have a strict precedence order.
Knowing them means you can look at any function call and
immediately know what 'this' will be — no guessing.

Rule 1: Default binding   — standalone call → globalThis (or undefined in strict)
Rule 2: Implicit binding  — obj.method() → obj
Rule 3: Explicit binding  — .call()/.apply()/.bind() → specified object
Rule 4: new binding       — new Fn() → the newly created object
Rule 5: Arrow functions   — no own this, inherits from lexical scope

Precedence: new > explicit > implicit > default (arrow ignores all)`,
      usecase: `Class methods passed as callbacks, event handlers that lose context, setTimeout with class methods, React class component methods — all this binding issues. Know the rules and you fix them in seconds.`,
    },
  },
  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Predict this under default binding (strict vs sloppy mode)",
      "Predict this under implicit binding and the implicit loss lesson",
      "Use call/apply/bind for explicit binding",
      "Understand new binding and how it creates this",
      "Know that arrow functions have NO own this",
      "Apply the precedence order to resolve ambiguous cases",
    ],
  },
  {
    id: "step1", type: "question", phase: "Step 1 of 5",
    paal: "Show default and implicit binding. Then demonstrate implicit loss — the most common this bug.",
    answer_keywords: ["implicit", "default", "this", "obj.method", "loss"],
    seed_code: `// Step 1: default binding + implicit binding + implicit LOSS

// DEFAULT BINDING — standalone call, no object context:
function showThis() {
  console.log(this)
}
showThis()    // globalThis (window in browser) — sloppy mode
// In strict mode ('use strict'): this = undefined

// IMPLICIT BINDING — called as a method on an object:
const user = {
  name: 'Alice',
  greet() { console.log(this.name) }
}
user.greet()   // 'Alice' — this = user (the object left of the dot)

// IMPLICIT LOSS — extracting the method breaks the binding:
const greetFn = user.greet   // just a function reference now
greetFn()    // undefined (strict) or '' (sloppy) — this is NOT user anymore!

// Why? greetFn() is a standalone call → default binding applies

// IMPLICIT LOSS IN CALLBACKS — the most common bug:
setTimeout(user.greet, 100)     // ❌ this is lost when passed as callback

const arr = [1, 2, 3]
arr.forEach(user.greet)         // ❌ this is lost inside forEach callback

// FIXES:
setTimeout(() => user.greet(), 100)  // ✅ arrow wrapper preserves the call site
arr.forEach(() => user.greet())       // ✅ same

export { user }`,
    feedback_correct: "✅ Implicit binding: obj.method() → this=obj. Implicit loss: const fn=obj.method; fn() → default binding.",
    feedback_partial: "obj.fn() → this=obj. const f=obj.fn; f() → this=global/undefined. The dot is what matters.",
    feedback_wrong: "this is set at call time. obj.fn() gives this=obj. fn() alone gives this=globalThis or undefined.",
    expected: "Implicit binding and implicit loss",
  },
  {
    id: "step2", type: "question", phase: "Step 2 of 5",
    paal: "Use call, apply, and bind for explicit binding. Show the difference between each and when each is appropriate.",
    answer_keywords: ["call", "apply", "bind", "explicit", "this"],
    seed_code: `// Step 2: explicit binding — call, apply, bind

function introduce(greeting, punctuation) {
  return \`\${greeting}, I'm \${this.name}\${punctuation}\`
}

const alice = { name: 'Alice' }
const bob   = { name: 'Bob'   }

// .call(thisArg, arg1, arg2, ...) — invoke immediately, args listed:
introduce.call(alice, 'Hi', '!')   // "Hi, I'm Alice!"
introduce.call(bob,   'Hey', '.')  // "Hey, I'm Bob."

// .apply(thisArg, [arg1, arg2]) — invoke immediately, args as array:
introduce.apply(alice, ['Hello', '?'])   // "Hello, I'm Alice?"
// Use apply when args are already in an array:
const args = ['Greetings', '...']
introduce.apply(bob, args)   // "Greetings, I'm Bob..."

// .bind(thisArg, arg1, ...) — returns a NEW function, doesn't invoke:
const greetAlice = introduce.bind(alice, 'Hi')  // partially applies greeting
greetAlice('!')   // "Hi, I'm Alice!" — punctuation provided later
greetAlice('?')   // "Hi, I'm Alice?"

// bind is permanent — a bound function's this cannot be changed:
const greetBob = introduce.bind(bob)
greetBob.call(alice, 'Hi', '!')  // "Hi, I'm Bob!" — call can't override bind

// Real-world use of bind:
class Timer {
  constructor() { this.seconds = 0 }
  tick() { this.seconds++ }
  start() {
    setInterval(this.tick.bind(this), 1000)  // ✅ this fixed to instance
  }
}

export { introduce, greetAlice }`,
    feedback_correct: "✅ call: immediate + listed args. apply: immediate + array args. bind: returns new fn with fixed this.",
    feedback_partial: "call(ctx, a, b): invokes now. apply(ctx, [a,b]): invokes now. bind(ctx): returns bound fn.",
    feedback_wrong: "fn.call(obj, arg1, arg2)  |  fn.apply(obj, [args])  |  const bound = fn.bind(obj)",
    expected: "call/apply/bind explicit binding",
  },
  {
    id: "step3", type: "question", phase: "Step 3 of 5",
    paal: "Show new binding — how 'new' creates a fresh object, sets this to it, sets the prototype, and returns it.",
    answer_keywords: ["new", "binding", "constructor", "prototype", "return"],
    seed_code: `// Step 3: new binding — what 'new' actually does

function Person(name, age) {
  // When called with 'new', these four steps happen automatically:
  // 1. A new empty object is created: {}
  // 2. this is set to that new object
  // 3. The new object's [[Prototype]] is set to Person.prototype
  // 4. The constructor runs; if it returns a non-object, 'this' is returned

  this.name = name
  this.age  = age
  // implicit: return this
}

const alice = new Person('Alice', 30)
// alice = { name: 'Alice', age: 30 }
// alice.__proto__ === Person.prototype

// If the constructor explicitly returns an object, THAT is returned instead:
function Weird() {
  this.x = 1
  return { y: 2 }   // non-default return of an object
}
const w = new Weird()
// w = { y: 2 } — the returned object wins
// { x: 1 } is discarded

// new binding precedence — new beats explicit bind:
function Foo() { this.val = 'from new' }
const BoundFoo = Foo.bind({ val: 'from bind' })
const instance = new BoundFoo()
// instance.val = 'from new' — new wins over bind ✅

// ES6 class: same new binding rules, nicer syntax:
class Animal {
  constructor(species) {
    this.species = species  // this = new object
  }
}
const dog = new Animal('Canis lupus')

export { Person, Animal }`,
    feedback_correct: "✅ new: creates object, sets this, links prototype, returns this. Explicit constructor return of object overrides.",
    feedback_partial: "new Fn(): 1) create {}, 2) this={}, 3) set prototype, 4) run body, 5) return this.",
    feedback_wrong: "new creates a fresh object and sets this to it. If constructor returns an object, that wins.",
    expected: "new binding mechanics",
  },
  {
    id: "step4", type: "question", phase: "Step 4 of 5",
    paal: "Show that arrow functions have NO own 'this' — they inherit from the enclosing lexical scope at definition time.",
    answer_keywords: ["lexical", "no own this", "enclosing", "inherit"],
    seed_code: `// Step 4: arrow functions — no own 'this', inherit lexically

const counter = {
  count: 0,

  // Regular method — this depends on how it's called:
  incrementRegular: function() {
    this.count++
    // BUG: 'this' is lost inside a regular function callback:
    setTimeout(function() {
      this.count++   // ❌ this is undefined/global, NOT counter
    }, 100)
  },

  // Arrow method — this inherited from counter object's context:
  incrementArrow() {
    this.count++
    // FIXED: arrow inherits 'this' from incrementArrow's context (counter):
    setTimeout(() => {
      this.count++   // ✅ this is counter — inherited from outer scope
    }, 100)
  },

  // Arrow as a method — PROBLEM: inherits this from MODULE scope, not object:
  // badArrowMethod: () => { this.count++ }  // ❌ this is module/global

  // Arrow functions can't be constructors:
  // new (() => {})()  // ❌ TypeError: not a constructor

  // Arrow functions ignore call/apply/bind for 'this':
  // arrowFn.call({ count: 99 })  // 'this' is still the lexical this, not {count:99}
}

// Summary of what arrows CAN'T do:
// ❌ Used as constructors (new)
// ❌ Have their own this (it's always lexical)
// ❌ Have arguments object
// ❌ Be used as generator functions

export { counter }`,
    feedback_correct: "✅ Arrow this is set at DEFINITION time from the enclosing scope — call/apply/bind can't change it.",
    feedback_partial: "Arrow functions inherit this from where they are DEFINED (lexical), not where they are CALLED.",
    feedback_wrong: "Arrow: no own this, inherits from enclosing scope. Regular: this set at call time by binding rules.",
    expected: "Arrow function lexical this",
  },
  {
    id: "step5", type: "question", phase: "Step 5 of 5",
    paal: "Apply the 5 rules with precedence order to resolve the most complex this binding scenarios.",
    answer_keywords: ["precedence", "new", "bind", "call", "implicit", "default"],
    seed_code: `// Step 5: binding precedence — resolving complex cases

// PRECEDENCE ORDER (highest to lowest):
// 1. Arrow function (lexical — ignores all other rules)
// 2. new binding
// 3. Explicit binding (call/apply/bind)
// 4. Implicit binding (obj.method())
// 5. Default binding (standalone call)

// Test 1: new vs explicit — new wins:
function Greet() { this.name = 'from new' }
const BoundGreet = Greet.bind({ name: 'from bind' })
const g = new BoundGreet()
console.log(g.name)   // 'from new' — new (rule 2) beats bind (rule 3)

// Test 2: explicit vs implicit — explicit wins:
const obj1 = { val: 'obj1', fn() { return this.val } }
const obj2 = { val: 'obj2' }
obj1.fn.call(obj2)   // 'obj2' — call (rule 3) beats obj1 (rule 4)

// Test 3: implicit vs default — implicit wins:
const standalone = obj1.fn   // extract method
standalone()                  // undefined/global — default (rule 5)
obj1.fn()                     // 'obj1' — implicit (rule 4) wins

// Test 4: arrow ignores everything:
const arrowFn = () => this   // captures module/global this at definition
arrowFn.call({ x: 1 })    // still the original lexical this
new arrowFn()              // TypeError — not a constructor

// DECISION ALGORITHM for any this question:
// Q1: Is it an arrow function? → lexical this, done.
// Q2: Called with new? → new object, done.
// Q3: Called with call/apply/bind? → that object, done.
// Q4: Called as obj.method()? → obj, done.
// Q5: Otherwise → global (sloppy) or undefined (strict).

export {}`,
    feedback_correct: "✅ The 5-question algorithm resolves any this: arrow→new→explicit→implicit→default.",
    feedback_partial: "Precedence: new > call/apply/bind > obj.method() > standalone call. Arrow ignores all.",
    feedback_wrong: "Arrow first (lexical). New second. Explicit (bind/call) third. Implicit (obj.fn()) fourth. Default last.",
    expected: "this binding precedence resolution",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Implicit binding", id: "step1" },
  { label: "Step 2 — call/apply/bind", id: "step2" },
  { label: "Step 3 — new binding", id: "step3" },
  { label: "Step 4 — Arrow this", id: "step4" },
  { label: "Step 5 — Precedence", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: "JS-B04", title: "`this` — All 5 Binding Rules", shortName: "JS — THIS" });
