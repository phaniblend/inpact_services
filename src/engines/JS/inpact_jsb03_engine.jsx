import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "JS — BLOCK B #3",
      title: "Scope, Hoisting & the Temporal Dead Zone",
      body: `JavaScript has four scope types. Understanding each one
explains where any variable is accessible and why.

Global scope  — accessible everywhere
Function scope — created by every function call (var lives here)
Block scope   — created by {} (let/const live here)
Module scope  — created by ES modules (top-level is NOT global)

Hoisting is the engine moving declarations to the top of
their scope before execution. But var, let, const, and
function hoisting all behave differently — and the
Temporal Dead Zone is the gap where let/const exist
but cannot be accessed yet.`,
      usecase: `Scope bugs — accessing a variable before it's declared, closures capturing the wrong value, var leaking out of for-loops — all explained by understanding these mechanics precisely.`,
    },
  },
  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Explain the four scope types and lexical scoping",
      "Predict var hoisting: declaration hoisted, assignment stays",
      "Explain function declaration hoisting (fully hoisted)",
      "Understand the Temporal Dead Zone for let and const",
      "Fix the classic var-in-for-loop closure bug with let",
      "Understand module scope vs global scope",
    ],
  },
  {
    id: "step1", type: "question", phase: "Step 1 of 5",
    paal: "Show var hoisting: the declaration is moved to the top of the function, but the assignment stays. This is why var before its line returns undefined (not an error).",
    answer_keywords: ["hoisting", "var", "undefined", "declaration", "assignment"],
    seed_code: `// Step 1: var hoisting — declaration up, assignment stays

// What you write:
function example() {
  console.log(x)   // undefined — NOT ReferenceError
  var x = 5
  console.log(x)   // 5
}

// What the engine sees (hoisting applied):
function exampleHoisted() {
  var x           // declaration moved to top, value = undefined
  console.log(x)  // undefined
  x = 5           // assignment stays in place
  console.log(x)  // 5
}

// var is function-scoped — ignores block boundaries:
function blockTest() {
  if (true) {
    var inside = 'I leak!'   // var ignores the {} block
  }
  console.log(inside)   // 'I leak!' — accessible outside the if block ❌
}

// let/const are block-scoped — they DON'T hoist to function top:
function blockTestLet() {
  if (true) {
    let inside = 'contained'
  }
  // console.log(inside)  // ReferenceError — correctly scoped ✅
}

// Function-level var in loops — the classic leak:
for (var i = 0; i < 3; i++) {}
console.log(i)   // 3 — i leaks out of the for loop ❌

for (let j = 0; j < 3; j++) {}
// console.log(j)  // ReferenceError — j is block-scoped ✅

export { example, blockTest }`,
    feedback_correct: "✅ var declarations hoist to function top (value=undefined). let/const don't hoist past their block.",
    feedback_partial: "var: declaration hoisted, assignment not. Accessing var before assignment gives undefined, not error.",
    feedback_wrong: "var x before its line = undefined (hoisted declaration). let x before its line = ReferenceError (TDZ).",
    expected: "var hoisting mechanics",
  },
  {
    id: "step2", type: "question", phase: "Step 2 of 5",
    paal: "Show that function DECLARATIONS are fully hoisted (callable before their line), but function EXPRESSIONS are not.",
    answer_keywords: ["function declaration", "function expression", "hoisting", "callable"],
    seed_code: `// Step 2: function hoisting — declarations vs expressions

// Function DECLARATION — fully hoisted (name AND body):
greet('Alice')   // ✅ works! Called before the definition

function greet(name) {
  return \`Hello, \${name}\`
}

// Function EXPRESSION — only the var is hoisted (if var), body is not:
// sayHi('Bob')   // ❌ TypeError: sayHi is not a function

var sayHi = function(name) {   // var hoisted as undefined, then assigned
  return \`Hi, \${name}\`
}

sayHi('Bob')     // ✅ now works — after the assignment

// Arrow function expressions — same as function expressions:
// greetArrow('Carol')  // ❌ ReferenceError (let is in TDZ)

const greetArrow = (name) => \`Hey, \${name}\`

// Why this matters in real code:
// 1. Mutual recursion — declarations can reference each other freely
// 2. Code organisation — declare at bottom, use at top (some styles)
// 3. IIFE patterns — expression, not declaration

// Best practice: use const with arrow functions or function expressions
// for most code — predictable, no hoisting surprises

export { greet, sayHi, greetArrow }`,
    feedback_correct: "✅ Function declarations: fully hoisted. Function expressions: only the var binding hoists (as undefined).",
    feedback_partial: "function f() {} is fully hoisted. const f = () => {} is NOT hoisted past its declaration line.",
    feedback_wrong: "function declarations can be called before their line. function expressions cannot.",
    expected: "Function declaration vs expression hoisting",
  },
  {
    id: "step3", type: "question", phase: "Step 3 of 5",
    paal: "Explain the Temporal Dead Zone — let/const exist in the scope from the start but are inaccessible until the declaration line executes.",
    answer_keywords: ["temporal dead zone", "TDZ", "let", "const", "ReferenceError"],
    seed_code: `// Step 3: Temporal Dead Zone (TDZ)

// let and const ARE hoisted — but they're in TDZ until their line executes:
{
  // TDZ starts here for 'name' — it's known to exist but NOT accessible
  // console.log(name)  // ReferenceError: Cannot access 'name' before initialization

  let name = 'Alice'   // TDZ ends here — now accessible
  console.log(name)    // 'Alice' ✅
}

// TDZ applies to const too:
{
  // console.log(PI)  // ReferenceError: Cannot access 'PI' before initialization
  const PI = 3.14159
  console.log(PI)   // 3.14159 ✅
}

// var has no TDZ — just returns undefined if accessed before assignment:
{
  console.log(x)   // undefined (hoisted, not TDZ)
  var x = 10
}

// TDZ in function default parameters — a subtle gotcha:
function init(x = 1, y = x) {   // y=x is fine — x already initialized
  return [x, y]
}
// function broken(x = y, y = 1) {}  // y is in TDZ when x default runs ❌

// typeof with TDZ — even typeof throws!
// typeof undeclaredVar   // 'undefined' — no error for truly undeclared
// typeof tdzVar          // ReferenceError — TDZ throws even for typeof

let tdzDemo = 'exists'
typeof tdzDemo   // 'string' — fine after declaration

export { init }`,
    feedback_correct: "✅ TDZ = let/const are hoisted but inaccessible until declaration executes. Even typeof throws in TDZ.",
    feedback_partial: "TDZ starts at scope entry, ends at the declaration line. ReferenceError if accessed in TDZ.",
    feedback_wrong: "let x before its line throws ReferenceError (TDZ). var x before its line returns undefined.",
    expected: "Temporal Dead Zone mechanics",
  },
  {
    id: "step4", type: "question", phase: "Step 4 of 5",
    paal: "Fix the classic var-in-for-loop closure bug — where all callbacks capture the same variable — using let or IIFE.",
    answer_keywords: ["closure", "var", "loop", "let", "IIFE", "capture"],
    seed_code: `// Step 4: the var closure loop bug — and three fixes

// THE BUG: var i is shared across all iterations
const buggyFns = []
for (var i = 0; i < 3; i++) {
  buggyFns.push(() => console.log(i))   // each closure captures the SAME i
}
buggyFns[0]()   // 3 ← not 0!
buggyFns[1]()   // 3 ← not 1!
buggyFns[2]()   // 3 ← not 2!
// i is 3 after the loop — all three closures see the final value ❌

// FIX 1: let — creates a new binding per iteration ✅
const fixedWithLet = []
for (let j = 0; j < 3; j++) {
  fixedWithLet.push(() => console.log(j))  // each j is a NEW binding
}
fixedWithLet[0]()  // 0 ✓
fixedWithLet[1]()  // 1 ✓
fixedWithLet[2]()  // 2 ✓

// FIX 2: IIFE to capture the value at iteration time (pre-ES6 pattern)
const fixedWithIIFE = []
for (var k = 0; k < 3; k++) {
  fixedWithIIFE.push((function(k) {
    return () => console.log(k)  // k is the IIFE's param — a new variable
  })(k))
}
fixedWithIIFE[0]()  // 0 ✓

// FIX 3: pass as argument instead of closing over
const ids = [10, 20, 30]
const handlers = ids.map(id => () => console.log(id))  // each id is a new param
handlers[0]()  // 10 ✓

export { buggyFns, fixedWithLet, fixedWithIIFE, handlers }`,
    feedback_correct: "✅ let creates a new binding per loop iteration — the idiomatic fix. IIFE is the pre-ES6 workaround.",
    feedback_partial: "var: one shared variable for all iterations. let: fresh binding per iteration.",
    feedback_wrong: "for (let i ...) — each iteration gets its own i. All closures capture different variables.",
    expected: "var closure loop bug and fix with let",
  },
  {
    id: "step5", type: "question", phase: "Step 5 of 5",
    paal: "Demonstrate module scope — top-level variables in an ES module are NOT on window. Show the lexical scope chain lookup.",
    answer_keywords: ["module scope", "lexical scope", "scope chain", "closure", "window"],
    seed_code: `// Step 5: scope chain and module scope

// LEXICAL SCOPE CHAIN: inner scopes access outer scope variables
const globalVar = 'global'   // module-level (NOT window.globalVar in ESM)

function outer() {
  const outerVar = 'outer'

  function middle() {
    const middleVar = 'middle'

    function inner() {
      const innerVar = 'inner'

      // Can access all outer scopes (lexical chain):
      console.log(innerVar)   // 'inner'  — own scope
      console.log(middleVar)  // 'middle' — parent scope
      console.log(outerVar)   // 'outer'  — grandparent scope
      console.log(globalVar)  // 'global' — module scope
    }
    inner()
    // console.log(innerVar)  // ReferenceError — can't go DOWN the chain
  }
  middle()
}

// MODULE SCOPE vs GLOBAL SCOPE:
// In a browser script (non-module):
// var x = 1   → window.x = 1 (global)

// In an ES module:
var moduleVar = 'not on window'   // module-scoped, NOT window.moduleVar
// window.moduleVar   // undefined

// In Node.js:
// var x = 1   → NOT on global object (unlike browser scripts)
// global.x    // undefined

// The scope chain is determined at WRITE TIME (lexical),
// not at CALL TIME — this is what makes closures work

outer()
export {}`,
    feedback_correct: "✅ Module scope is not global. Lexical scope chain is fixed at write time — each function sees its definition context.",
    feedback_partial: "Scope chain: inner → outer → module → (global). Fixed at definition, not at call time.",
    feedback_wrong: "var in ESM is module-scoped (not window). Scope chain lookup goes outward, never inward.",
    expected: "Module scope and lexical scope chain",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — var hoisting", id: "step1" },
  { label: "Step 2 — fn hoisting", id: "step2" },
  { label: "Step 3 — TDZ", id: "step3" },
  { label: "Step 4 — Loop closure bug", id: "step4" },
  { label: "Step 5 — Scope chain", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: "JS-B03", title: "Scope, Hoisting & TDZ", shortName: "JS — SCOPE" });
