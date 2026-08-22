import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "JS — BLOCK B #1",
      title: "Type Coercion & Equality",
      body: `JavaScript's type coercion is the source of most "WTF" moments.
The == operator applies coercion rules before comparing.
The === operator never coerces — same type AND same value.

[] == ![]   // true  ← the most infamous example
0 == '0'    // true  ← coercion converts string to number
0 == false  // true  ← coercion converts boolean to number
null == undefined  // true  ← special case in the spec

Understanding these rules isn't trivia — it's what lets you
read unfamiliar code confidently and avoid subtle bugs.`,
      usecase: `Coercion rules fire in conditionals, sorting comparators, string concatenation vs addition, and any comparison with user input. Senior devs understand them precisely — not to use them, but to spot them.`,
    },
  },
  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Know the Abstract Equality Comparison algorithm (==) rules",
      "Know exactly when to use === and when == is actually correct",
      "Understand how valueOf() and toString() drive coercion",
      "Predict coercion in + operator (string vs number context)",
      "Understand the NaN paradox — why NaN !== NaN",
      "Use Object.is() for true equality including NaN and -0",
    ],
  },
  {
    id: "step1", type: "question", phase: "Step 1 of 5",
    paal: "Explain the six falsy values and predict what == does when comparing different types.",
    answer_keywords: ["falsy", "==", "coercion", "null", "undefined", "NaN"],
    seed_code: `// Step 1: falsy values and == coercion algorithm

// THE SIX FALSY VALUES — everything else is truthy:
// false, 0, '', null, undefined, NaN

// == coercion rules (simplified):
// 1. If both same type: compare directly (like ===)
// 2. null == undefined is true (and nothing else)
// 3. number == string: convert string to number, re-compare
// 4. boolean == anything: convert boolean to number (true→1, false→0)
// 5. object == primitive: call valueOf/toString on the object

// Predictions:
console.log(0 == false)      // true — false→0, then 0==0
console.log('' == false)     // true — false→0, ''→0, then 0==0
console.log(null == 0)       // FALSE — null only == undefined
console.log(null == false)   // FALSE — null only == undefined
console.log(null == undefined) // TRUE — spec special case
console.log(undefined == false) // FALSE — undefined only == null

// The infamous one:
console.log([] == ![])
// Step 1: ![] = false ([] is truthy, negated = false)
// Step 2: [] == false → boolean side: false→0 → [] == 0
// Step 3: [] is object: [].valueOf()=[], [].toString()='' → '' == 0
// Step 4: '' is string: ''→0 → 0 == 0 → TRUE ✅

export {}`,
    feedback_correct: "✅ The == algorithm has 5 specific rules — memorise them and no coercion ever surprises you again.",
    feedback_partial: "falsy: false/0/''/null/undefined/NaN. == coerces: boolean→number first, string→number next.",
    feedback_wrong: "0==false→true (bool→0). null==undefined→true (special). null==false→FALSE (null only matches undefined).",
    expected: "== coercion rules and falsy values",
  },
  {
    id: "step2", type: "question", phase: "Step 2 of 5",
    paal: "Show how the + operator switches between concatenation and addition based on operand types.",
    answer_keywords: ["+", "concatenation", "number", "string", "coercion"],
    seed_code: `// Step 2: the + operator — addition vs concatenation

// Rule: if EITHER operand is a string, it's concatenation
// Otherwise it's numeric addition

'5' + 3        // '53'  — string + number = concatenation
5 + '3'        // '53'  — same, order doesn't matter
5 + 3 + '1'   // '81'  — left-to-right: 5+3=8, then '8'+'1'='81'
'5' + 3 + 1   // '531' — '5'+3='53', then '53'+1='531'

// Other arithmetic operators ALWAYS coerce to number:
'5' - 3        // 2   — '-' has no string meaning → coerce to number
'5' * '3'      // 15
'5' ** 2       // 25
true + true    // 2   — true→1
false + 1      // 1   — false→0
null + 1       // 1   — null→0
undefined + 1  // NaN — undefined→NaN

// Object coercion with +:
[] + []        // '' — [].toString() = ''
[] + {}        // '[object Object]'
{} + []        // 0  — {} parsed as empty block, then +[] = +'' = 0
                //     (run in console to see — context-dependent!)

// Defensive patterns — always be explicit:
const total = Number(input) + 10   // don't rely on coercion ✅

export {}`,
    feedback_correct: "✅ + is the only operator that string-coerces. All others (-, *, /) always go numeric.",
    feedback_partial: "string + anything = concatenation. number - string = numeric (coerces string to number).",
    feedback_wrong: "'5' + 3 = '53' (concat). '5' - 3 = 2 (numeric). Always be explicit with Number() or parseInt().",
    expected: "+ operator coercion rules",
  },
  {
    id: "step3", type: "question", phase: "Step 3 of 5",
    paal: "Demonstrate how valueOf() and toString() control how objects coerce in comparisons and arithmetic.",
    answer_keywords: ["valueof", "tostring", "symbol.toprimitive", "hint", "coerce"],
    seed_code: `// Step 3: valueOf and toString — how objects coerce to primitives

class Money {
  constructor(amount, currency) {
    this.amount = amount
    this.currency = currency
  }

  // Called in numeric context (-, *, /, comparisons):
  valueOf() {
    return this.amount
  }

  // Called in string context (template literals, string concatenation):
  toString() {
    return \`\${this.amount} \${this.currency}\`
  }

  // Symbol.toPrimitive gives full control — preferred in modern JS:
  [Symbol.toPrimitive](hint) {
    if (hint === 'string') return this.toString()
    if (hint === 'number') return this.valueOf()
    return this.valueOf()   // 'default' hint (used by ==, +)
  }
}

const price = new Money(42, 'USD')

price + 10       // 52 — valueOf() called
price - 5        // 37 — valueOf() called
\`Price: \${price}\` // 'Price: 42 USD' — toString() called
price > 40       // true — valueOf() called

// Without overrides, all objects coerce to '[object Object]' in string
// context and NaN in numeric context — useless defaults

export { Money }`,
    feedback_correct: "✅ valueOf for numeric, toString for string, Symbol.toPrimitive for full control with hint.",
    feedback_partial: "valueOf() = numeric coercion. toString() = string coercion. Symbol.toPrimitive(hint) overrides both.",
    feedback_wrong: "[Symbol.toPrimitive](hint) { if(hint==='string') return str; return num }",
    expected: "valueOf/toString/Symbol.toPrimitive coercion",
  },
  {
    id: "step4", type: "question", phase: "Step 4 of 5",
    paal: "Explain the NaN paradox (NaN !== NaN) and demonstrate Object.is() for edge-case equality including NaN and -0.",
    answer_keywords: ["NaN", "isNaN", "Number.isNaN", "Object.is", "-0"],
    seed_code: `// Step 4: NaN and -0 — the equality edge cases

// NaN is NOT equal to itself — it's the only value with this property:
NaN === NaN        // false — specified in IEEE 754
NaN == NaN         // false — same

// The wrong way to check for NaN:
isNaN('hello')     // true — isNaN coerces first: isNaN(Number('hello'))=isNaN(NaN)
isNaN(undefined)   // true — isNaN(Number(undefined))=isNaN(NaN)

// The right way:
Number.isNaN('hello')    // FALSE — no coercion, strict type check
Number.isNaN(NaN)        // TRUE  ← what you actually want
Number.isNaN(undefined)  // FALSE

// Checking if something is NaN in arithmetic results:
const result = 0 / 0     // NaN
Number.isNaN(result)     // true ✅

// -0 is the other equality gotcha:
0 === -0          // true  ← === treats them as equal
0 == -0           // true
1 / 0             // Infinity
1 / -0            // -Infinity — these ARE different!

// Object.is — same-value equality, handles both edge cases:
Object.is(NaN, NaN)   // TRUE  ← correctly identifies NaN
Object.is(0, -0)      // FALSE ← correctly distinguishes -0
Object.is(1, 1)       // TRUE  — same as === for normal values

// Use Object.is when you need mathematically precise equality
// Use === for everyday comparisons (faster, good enough)

export {}`,
    feedback_correct: "✅ Number.isNaN (not isNaN), Object.is for edge cases. NaN !== NaN is the only self-unequal value.",
    feedback_partial: "isNaN coerces. Number.isNaN doesn't. Object.is handles NaN and -0 correctly.",
    feedback_wrong: "Number.isNaN(x) instead of isNaN(x)  |  Object.is(NaN, NaN) = true  |  Object.is(0, -0) = false",
    expected: "NaN and -0 equality edge cases",
  },
  {
    id: "step5", type: "question", phase: "Step 5 of 5",
    paal: "Give the definitive guide: when is == actually correct, and what are the only safe == comparisons in production code?",
    answer_keywords: ["null", "undefined", "==", "===", "safe"],
    seed_code: `// Step 5: when == is actually the right choice

// THE ONLY SAFE == COMPARISON IN PRODUCTION CODE:
// Checking for null OR undefined in one expression

function processValue(val) {
  // This checks: val is null OR val is undefined
  if (val == null) {
    return 'nothing provided'
  }
  // Equivalent verbose version:
  // if (val === null || val === undefined)
  return val.toString()
}

processValue(null)      // 'nothing provided' ✅
processValue(undefined) // 'nothing provided' ✅
processValue(0)         // '0' ← 0 is not null/undefined ✅
processValue('')        // '' ← '' is not null/undefined ✅
processValue(false)     // 'false' ← false is not null/undefined ✅

// Every other == usage is a code smell — use === instead:
// ❌ if (x == 1)    → use ===
// ❌ if (x == '')   → use === or truthiness
// ❌ if (x == false) → use !x or === false

// The modern alternative for optional access:
const name = user?.name ?? 'Anonymous'  // optional chain + nullish coalescing
// These operators already handle null/undefined correctly
// so even val == null is less common in modern code

// ESLint rule: eqeqeq — enforces === everywhere EXCEPT null checks
// Many teams allow: "eqeqeq": ["error", "always", { "null": "ignore" }]

export { processValue }`,
    feedback_correct: "✅ val == null is the one legitimate == in production. It's idiomatic and concise. Everything else: ===.",
    feedback_partial: "val == null catches both null and undefined. All other == uses should be ===.",
    feedback_wrong: "if (val == null) handles both null and undefined — the only production-safe == pattern.",
    expected: "When == is correct: null check pattern",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Falsy & == rules", id: "step1" },
  { label: "Step 2 — + operator", id: "step2" },
  { label: "Step 3 — valueOf/toString", id: "step3" },
  { label: "Step 4 — NaN & -0", id: "step4" },
  { label: "Step 5 — Safe == usage", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: "JS-B01", title: "Type Coercion & Equality", shortName: "JS — COERCION" });
