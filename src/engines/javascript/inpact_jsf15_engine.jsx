import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "JS FUNDAMENTALS #15",
      title: "Scope, Hoisting & the Temporal Dead Zone",
      body: `Scope determines where a variable is visible.
Hoisting determines when it's accessible.
The Temporal Dead Zone (TDZ) determines when it throws.

These rules explain:
• Why var declarations at the top are a myth (hoisting does it)
• Why let/const throw instead of returning undefined
• Why function declarations can be called before they're written
• Why closures sometimes capture the wrong value in loops

Understanding scope deeply means you write
predictable code and debug mysterious "variable is
undefined" errors in seconds instead of hours.`,
      usecase: `Every module, every function, every loop involves scope. Closure-over-loop bugs, TDZ errors in class bodies, and hoisting surprises in legacy code are daily debugging scenarios.`,
    },
  },
  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Understand global, function, block, and module scope",
      "Explain var hoisting — declaration hoisted, initialisation not",
      "Explain function declaration hoisting — fully hoisted",
      "Explain TDZ — let/const exist but throw until initialisation",
      "Diagnose the closure-in-loop bug and fix it three ways",
      "Understand lexical scope vs dynamic scope",
    ],
  },
  {
    id: "step1", type: "question", phase: "Step 1 of 5",
    paal: "Demonstrate global, function, and block scope with var vs let. Show that var leaks out of blocks but not functions.",
    answer_keywords: ["scope", "block", "function", "var", "let", "const"],
    seed_code: `// Step 1: scope levels

// GLOBAL scope — accessible everywhere:
var globalVar = 'global var'    // on window object in browsers
let globalLet = 'global let'    // NOT on window — block-scoped globally

// FUNCTION scope — var is bounded to the enclosing function:
function fnScope() {
  var localVar = 'inside function'
  let localLet = 'also inside'
  if (true) {
    var blockVar = 'var in block'  // leaks to function scope!
    let blockLet = 'let in block'  // stays in block
  }
  console.log(blockVar)  // 'var in block' — leaked ❌
  // console.log(blockLet)  // ReferenceError — blocked ✅
}

// BLOCK scope — let/const respect {}:
{
  let x = 10
  const y = 20
  var z = 30   // leaks out of the block!
}
// x and y are gone here — ReferenceError
// z is accessible — it leaked

// MODULE scope — every ES module has its own scope:
// Variables declared at top-level of a module are
// NOT global — they're module-scoped. Other modules
// can only access them via explicit exports.

// Scope chain — inner scopes can access outer, not vice versa:
const outer = 'outer'
function inner() {
  console.log(outer)   // ✅ inner can see outer
}
// outer can't see anything declared inside inner

export {}`,
    feedback_correct: "✅ var = function-scoped (leaks out of blocks). let/const = block-scoped. Module scope isolates top-level vars.",
    feedback_partial: "var leaks from if/for/while blocks. let/const stay inside {}. Functions create scope for both.",
    feedback_wrong: "var is function-scoped | let/const are block-scoped | modules have their own scope",
    expected: "Scope levels and var vs let",
  },
  {
    id: "step2", type: "question", phase: "Step 2 of 5",
    paal: "Show var hoisting: declaration moves to top of function, initialisation stays. Function declarations are fully hoisted.",
    answer_keywords: ["hoisting", "undefined", "var", "function declaration", "hoisted"],
    seed_code: `// Step 2: hoisting

// VAR HOISTING — declaration is hoisted, value is not:
console.log(x)   // undefined — NOT ReferenceError (declaration was hoisted)
var x = 5
console.log(x)   // 5

// What JS actually sees (after hoisting):
// var x           ← hoisted to top (declaration)
// console.log(x)  ← undefined (not yet assigned)
// x = 5
// console.log(x)  ← 5

// FUNCTION DECLARATION hoisting — FULLY hoisted (name AND body):
greet('Alice')   // ✅ works! called before the declaration

function greet(name) {
  return 'Hello, ' + name
}

// FUNCTION EXPRESSION — NOT hoisted (it's a var assignment):
// sayBye('Bob')   // ❌ TypeError: sayBye is not a function
var sayBye = function(name) {
  return 'Bye, ' + name
}

// ARROW FUNCTION — also not hoisted:
// sayHi('Carol')  // ❌ ReferenceError (let TDZ) or TypeError (var hoisting)
const sayHi = name => 'Hi, ' + name

// Practical rule:
// Declare vars at the top of their scope → mirrors what JS does anyway
// Use const/let → no hoisting surprises
// Prefer function declarations for top-level utils → benefit from hoisting

export { greet }`,
    feedback_correct: "✅ var declaration hoisted (→ undefined), value stays. Function declarations fully hoisted. Expressions are not.",
    feedback_partial: "var is hoisted as undefined. function declarations are fully hoisted. const/let are not (TDZ).",
    feedback_wrong: "var x → hoisted as undefined. function fn(){} → fully hoisted. const fn = () => {} → not hoisted",
    expected: "var hoisting and function declaration hoisting",
  },
  {
    id: "step3", type: "question", phase: "Step 3 of 5",
    paal: "Explain the Temporal Dead Zone: let/const exist in scope from the start of the block but throw if accessed before the declaration line.",
    answer_keywords: ["temporal dead zone", "tdz", "referenceerror", "let", "const", "before"],
    seed_code: `// Step 3: Temporal Dead Zone (TDZ)

// TDZ = the zone from the start of the block to the declaration line
// let/const are registered in scope immediately (like var)
// BUT they throw ReferenceError if accessed before the declaration

{
  // TDZ for 'name' starts here ↓
  // console.log(name)  // ❌ ReferenceError: Cannot access 'name' before init
  let name = 'Alice'    // TDZ ends here
  console.log(name)     // ✅ 'Alice'
}

// Compare with var (no TDZ):
{
  console.log(age)    // undefined — no error (var is hoisted)
  var age = 30
}

// TDZ in class bodies — a common real-world TDZ bug:
class Config {
  // maxRetries = this.timeout * 2   // ❌ TDZ! timeout not yet initialised
  timeout = 5000
  maxRetries = this.timeout / 1000   // ✅ timeout is declared before this
}

// TDZ in default parameter — another subtle case:
// function f(a = b, b = 1) {}   // ❌ b is in TDZ when a is evaluated
function f(a = 1, b = a * 2) {}  // ✅ a is already initialised

// typeof is NOT safe in TDZ (unlike with undeclared vars):
// typeof x where x is let in TDZ → ReferenceError ← surprising!
// typeof y where y is undeclared → 'undefined' (safe)

export { Config }`,
    feedback_correct: "✅ TDZ: let/const are hoisted but not initialised — accessing them before the declaration line throws ReferenceError.",
    feedback_partial: "TDZ = gap between start of scope and declaration line. let/const exist but throw in this gap.",
    feedback_wrong: "let/const are in TDZ from block start to declaration. Access in TDZ = ReferenceError (not undefined).",
    expected: "Temporal Dead Zone explanation",
  },
  {
    id: "step4", type: "question", phase: "Step 4 of 5",
    paal: "Diagnose the classic closure-in-loop bug (all callbacks log the same value) and fix it three ways: let, IIFE, bind.",
    answer_keywords: ["closure", "loop", "var", "let", "iife", "fix"],
    seed_code: `// Step 4: closure-in-loop bug

// THE BUG — all three callbacks log 3:
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
// Output: 3, 3, 3  ❌
// Why: var i is one variable shared by all closures.
// By the time timeouts fire, the loop is done and i === 3.

// FIX 1: use let — each iteration gets its own block-scoped i:
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 100)
}
// Output: 0, 1, 2  ✅ — let creates a new binding per iteration

// FIX 2: IIFE — capture current value in a new scope:
for (var k = 0; k < 3; k++) {
  (function(k) {
    setTimeout(() => console.log(k), 100)
  })(k)
}
// Output: 0, 1, 2  ✅

// FIX 3: bind — pre-bind the value:
for (var m = 0; m < 3; m++) {
  setTimeout(console.log.bind(null, m), 100)
}
// Output: 0, 1, 2  ✅

// MODERN SOLUTION: use forEach with const:
[0, 1, 2].forEach(n => {
  setTimeout(() => console.log(n), 100)
})
// Output: 0, 1, 2  ✅ — n is a new parameter binding per iteration

export {}`,
    feedback_correct: "✅ var shares one binding — all closures see final value. let creates a new binding per iteration. Best fix: just use let.",
    feedback_partial: "var = one shared variable. let = new binding each iteration. IIFE or bind work too but let is simplest.",
    feedback_wrong: "Replace var with let in the for loop. Or use IIFE: (function(i){ setTimeout(...)  })(i)",
    expected: "Closure-in-loop bug and three fixes",
  },
  {
    id: "step5", type: "question", phase: "Step 5 of 5",
    paal: "Show lexical scope in practice: inner functions access outer variables at definition time, not call time.",
    answer_keywords: ["lexical", "scope", "definition", "closure", "outer"],
    seed_code: `// Step 5: lexical scope — scope is determined at WRITE TIME, not CALL TIME

// The scope of a function is where it was DEFINED, not where it's CALLED:
const x = 'outer'

function outer() {
  const x = 'outer function'
  function inner() {
    console.log(x)   // 'outer function' — sees x from DEFINITION context
  }
  return inner
}

const fn = outer()
fn()   // 'outer function' — NOT the global x, even though called globally

// This is lexical scope (static) — JS uses this.
// Dynamic scope would use x from the CALL site — JS does NOT do this.

// Practical: makeAdder factory — captures x lexically:
function makeAdder(x) {
  return function(y) {
    return x + y   // x from the OUTER function's scope — fixed at creation
  }
}

const add5  = makeAdder(5)
const add10 = makeAdder(10)

add5(3)    // 8   — x is permanently 5 for this closure
add10(3)   // 13  — x is permanently 10 for this closure

// Each call to makeAdder creates a new scope with its own x.
// The returned function closes over that specific x.

// Module pattern using lexical scope:
const counter = (() => {
  let n = 0                          // lexically scoped to this IIFE
  return {
    inc: () => ++n,
    dec: () => --n,
    val: () => n,
  }
})()

counter.inc(); counter.inc(); counter.inc()
counter.val()   // 3 — n is private, only accessible via the returned methods

export { makeAdder, counter }`,
    feedback_correct: "✅ Lexical scope: functions see the scope where they were WRITTEN. Closures lock in that scope at creation time.",
    feedback_partial: "Scope is determined at write time (lexical), not call time (dynamic). Closures capture the defining scope.",
    feedback_wrong: "inner() sees x from where it was DEFINED (outer()), not where it was called (global scope).",
    expected: "Lexical scope and closure factories",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Scope levels", id: "step1" },
  { label: "Step 2 — Hoisting", id: "step2" },
  { label: "Step 3 — TDZ", id: "step3" },
  { label: "Step 4 — Loop closure bug", id: "step4" },
  { label: "Step 5 — Lexical scope", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: "JS-F15", title: "Scope, Hoisting & the TDZ", shortName: "JS — SCOPE" });
