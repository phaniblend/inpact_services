import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "JS FUNDAMENTALS #14",
      title: "Type Coercion, Equality & Truthy/Falsy",
      body: `Type coercion is JavaScript's most notorious feature.
It's why [] == false and {} + [] = 0 and "5" + 3 = "53"
but "5" - 3 = 2.

Understanding it fully means you NEVER write bugs from it
and you can reason about any expression without running it.

The rules:
  == (loose)  → coerces before comparing (avoid)
  === (strict) → no coercion (always prefer)
  Truthy/Falsy → 6 falsy values, everything else is truthy
  + operator  → string if either side is a string (concatenation wins)
  - * / %     → always numeric coercion`,
      usecase: `Conditional checks, form input handling, API response parsing, debugging production bugs — coercion rules are the root cause of hundreds of real bugs in the wild.`,
    },
  },
  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Memorise the 6 falsy values — and everything else is truthy",
      "Explain == coercion rules: ToPrimitive, ToNumber, ToString",
      "Know the === rules: no coercion, same type and value",
      "Understand + as both addition and concatenation",
      "Use Boolean(), !! and ?? and || correctly",
      "Spot coercion bugs in real code and fix them",
    ],
  },
  {
    id: "step1", type: "question", phase: "Step 1 of 5",
    paal: "List the 6 falsy values. Show that everything else — including [], {}, '0' — is truthy.",
    answer_keywords: ["falsy", "truthy", "false", "0", "null", "undefined", "nan", "''"],
    seed_code: `// Step 1: falsy values — memorise these exactly 6

// THE ONLY FALSY VALUES:
// false, 0, -0, 0n (BigInt zero), '' (empty string), null, undefined, NaN
// (some list 7 — counting -0 and 0n separately)

const falsy = [false, 0, -0, 0n, '', null, undefined, NaN]
falsy.every(v => !v)   // true — all falsy ✅

// EVERYTHING ELSE is truthy — including these common surprises:
Boolean([])         // true  ← empty array is truthy!
Boolean({})         // true  ← empty object is truthy!
Boolean('0')        // true  ← non-empty string is truthy!
Boolean('false')    // true  ← the string "false" is truthy!
Boolean(-1)         // true  ← any non-zero number is truthy
Boolean(Infinity)   // true

// Common bugs from not knowing this:
const arr = []
if (arr) console.log('truthy')    // ✅ runs — empty array is truthy
if (arr.length) console.log('has items')   // ✅ correct guard for empty array
// if (arr == false) — TRUE! because [] coerces to '' coerces to 0 == false ❌

// Safe emptiness checks:
const val = ''
if (!val) { /* empty string, null, undefined, 0 */ }
if (val == null) { /* null OR undefined only */ }       // the one useful == case
if (val === null) { /* ONLY null */ }
if (val === undefined) { /* ONLY undefined */ }

export {}`,
    feedback_correct: "✅ 6 falsy values: false, 0, '', null, undefined, NaN. Everything else truthy — including [] and {}.",
    feedback_partial: "false, 0, '', null, undefined, NaN are falsy. [] {} '0' 'false' -1 are all truthy.",
    feedback_wrong: "The 6 falsy values: false / 0 / '' / null / undefined / NaN — nothing else is falsy",
    expected: "6 falsy values and truthy surprises",
  },
  {
    id: "step2", type: "question", phase: "Step 2 of 5",
    paal: "Explain == coercion: show the famous [] == false, null == undefined, and '0' == false cases with reasoning.",
    answer_keywords: ["==", "loose", "coercion", "toprimitive", "tonumber"],
    seed_code: `// Step 2: == (loose equality) coercion rules

// Rule summary for == :
// 1. If same type → same as ===
// 2. null == undefined → true (only case!)
// 3. If one is number, convert other to number
// 4. If one is string, convert other to number
// 5. Boolean → convert to number first
// 6. Object → call .valueOf() or .toString() (ToPrimitive)

// null == undefined — the one useful loose comparison:
null == undefined    // true  ✅ (catches both without ===)
null == 0            // false (null only equals undefined loosely)
null == false        // false
null == ''           // false

// The infamous cases:
'' == false           // true  (false→0, ''→0)
'0' == false          // true  (false→0, '0'→0)
[] == false           // true  (false→0, []→''→0)
[] == ![]             // true  (![]=false, then above applies)
[] == 0               // true  ([]→''→0)
[1] == 1              // true  ([1]→'1'→1)
null == false         // FALSE (null only equals undefined)

// === never coerces:
'' === false           // false ✅ — different types
'0' === 0             // false ✅

// RULE OF THUMB: always use ===
// ONE exception: val == null (checks both null and undefined):
function process(val) {
  if (val == null) return 'nothing'   // catches null AND undefined
  return String(val)
}

export { process }`,
    feedback_correct: "✅ == converts operands to numbers before comparing (mostly). null==undefined is the only safe loose comparison.",
    feedback_partial: "== coerces: booleans→0/1, strings→numbers, objects→primitive. === never coerces.",
    feedback_wrong: "null == undefined (true) | [] == false (true, via ToPrimitive) | always === except val == null",
    expected: "== coercion rules and gotchas",
  },
  {
    id: "step3", type: "question", phase: "Step 3 of 5",
    paal: "Explain + as both concatenation and addition. Show - * / always coerce to numbers. Show the unary + trick.",
    answer_keywords: ["+", "concatenation", "addition", "coerce", "string", "number"],
    seed_code: `// Step 3: + is special — concatenation wins over addition

// + with ANY string → string concatenation:
'5' + 3       // '53'  ← string wins!
3 + '5'       // '35'
1 + 2 + '3'   // '33' (left-to-right: 1+2=3, then 3+'3'='33')
'1' + 2 + 3   // '123' ('1'+2='12', then '12'+3='123')

// -, *, /, % always coerce to numbers:
'5' - 3       // 2   ← numeric coercion
'5' * '2'     // 10
'5' - '3'     // 2
'abc' - 1     // NaN (can't coerce 'abc' to number)

// Unary + — coerce to number:
+'42'          // 42
+true          // 1
+false         // 0
+null          // 0
+undefined     // NaN
+''            // 0
+[]            // 0  ([].toString()='' → 0)
+{}            // NaN  ({}.toString()='[object Object]')

// The bug this causes:
function add(a, b) { return a + b }
add(1, 2)        // 3  ✅
add('1', 2)      // '12' ❌ — input from form is always a string!

// Fix: always coerce inputs explicitly:
function addSafe(a, b) { return Number(a) + Number(b) }
addSafe('1', '2')   // 3 ✅

export { addSafe }`,
    feedback_correct: "✅ + concatenates if either operand is a string. - * / always go numeric. Form inputs are strings — always coerce!",
    feedback_partial: "String + anything = string. Anything - number = number. Unary + coerces to number.",
    feedback_wrong: "'5' + 3 = '53' | '5' - 3 = 2 | Number(val) to safely coerce",
    expected: "+ concatenation vs arithmetic coercion",
  },
  {
    id: "step4", type: "question", phase: "Step 4 of 5",
    paal: "Show the correct use of ??, ||, && and !! for conditional logic and coercion. Explain where each fails.",
    answer_keywords: ["??", "||", "&&", "!!", "nullish", "coalescing"],
    seed_code: `// Step 4: logical operators and boolean coercion

// !! — double negation, coerce to boolean:
!!0          // false
!!''         // false
!!null       // false
!![]         // true  (empty array is truthy)
!!42         // true
!!''         // false

// || (OR) — returns first TRUTHY value (not necessarily boolean):
const port = process.env.PORT || 3000
// BUG: if PORT='0', this gives 3000 — because 0 is falsy!

// ?? (nullish coalescing) — returns first NON-NULL/UNDEFINED:
const port2 = process.env.PORT ?? 3000
// Correct: PORT='0' → 0 (uses 0, not the default)
// Only falls back if left side is null or undefined

// && (AND) — returns first FALSY or last value:
const user = { name: 'Alice', role: 'admin' }
const name = user && user.name     // 'Alice'
const x    = null && null.name     // null (short-circuits, no crash)

// Optional chaining (?.) — modern alternative:
const name2 = user?.name           // 'Alice'
const deep  = user?.address?.city  // undefined (no crash)

// Precedence gotcha:
const a = null ?? false || 'default'
// ?? has lower precedence than || — parsed as: null ?? (false || 'default')
// = null ?? 'default' = 'default'  ← might not be what you wanted
// Fix: parenthesise: (null ?? false) || 'default' = false || 'default' = 'default'

export {}`,
    feedback_correct: "✅ ?? is null/undefined only. || is falsy-based. ?? is almost always the right default for optional config.",
    feedback_partial: "?? falls back only for null/undefined. || falls back for any falsy (including 0 and ''). ?? is safer.",
    feedback_wrong: "val ?? default (nullish) | val || default (falsy) | !! coerces to boolean | ?. for safe access",
    expected: "?? vs || and !! coercion",
  },
  {
    id: "step5", type: "question", phase: "Step 5 of 5",
    paal: "Apply all coercion knowledge: spot and fix 5 real-world coercion bugs in a code review scenario.",
    answer_keywords: ["fix", "===", "number(", "??", "parseint", "isnan"],
    seed_code: `// Step 5: coercion bug review — spot and fix

// BUG 1: using == instead of ===
function isAdmin(role) {
  return role == 'admin'   // ❌ BAD
}
// FIX:
function isAdminSafe(role) {
  return role === 'admin'  // ✅
}

// BUG 2: checking array emptiness with truthiness
function hasItems(arr) {
  return !!arr   // ❌ empty array is truthy!
}
// FIX:
function hasItemsSafe(arr) {
  return Array.isArray(arr) && arr.length > 0  // ✅
}

// BUG 3: using || for defaults with valid falsy values
function createServer(port) {
  const p = port || 3000   // ❌ port=0 gives 3000
  return p
}
// FIX:
function createServerSafe(port) {
  const p = port ?? 3000   // ✅ only falls back if port is null/undefined
  return p
}

// BUG 4: adding form inputs without coercion
function calcTotal(priceStr, qtyStr) {
  return priceStr + qtyStr   // ❌ '10' + '3' = '103'
}
// FIX:
function calcTotalSafe(priceStr, qtyStr) {
  return Number(priceStr) * Number(qtyStr)  // ✅
}

// BUG 5: using global isNaN
function isValidNumber(val) {
  return !isNaN(val)          // ❌ isNaN('') = false, isNaN(' ') = false
}
// FIX:
function isValidNumberSafe(val) {
  return typeof val === 'number' && Number.isFinite(val)  // ✅
}

export { isAdminSafe, hasItemsSafe, createServerSafe, calcTotalSafe, isValidNumberSafe }`,
    feedback_correct: "✅ === not ==, .length not !!arr, ?? not || for defaults, Number() for form input, Number.isFinite not isNaN.",
    feedback_partial: "5 patterns: ===, arr.length>0, ??, Number(formInput), Number.isFinite.",
    feedback_wrong: "role === 'admin' | arr.length > 0 | port ?? 3000 | Number(str) | Number.isFinite(val)",
    expected: "5 coercion bug fixes",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Falsy values", id: "step1" },
  { label: "Step 2 — == coercion", id: "step2" },
  { label: "Step 3 — + operator", id: "step3" },
  { label: "Step 4 — ?? vs ||", id: "step4" },
  { label: "Step 5 — Bug review", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: "JS-F14", title: "Type Coercion, Equality & Truthy/Falsy", shortName: "JS — COERCION" });
