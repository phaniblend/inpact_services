import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "JS — BLOCK B #5",
      title: "Operators Deep Dive",
      body: `JavaScript's operator set has grown significantly with ES2020+.
Many operators have non-obvious behavior that trips up
even experienced developers.

typeof    — returns a string, but 'typeof null' === 'object' is a bug
instanceof — walks the prototype chain, not just direct class check
in         — checks own AND inherited properties
delete     — removes a property (not a variable!)
void       — evaluates and discards, always returns undefined
comma      — evaluates both, returns the right operand
**         — exponentiation (right-associative!)
>>>/>>/<< — bitwise operations used in real code for flags and perf`,
      usecase: `typeof guards, instanceof checks in catch blocks, in operator for feature detection, delete for property removal, bitwise flags for permissions — all real patterns in production codebases.`,
    },
  },
  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Know all typeof return values — including the null bug",
      "Use instanceof correctly and understand its prototype chain walk",
      "Know the 'in' operator checks own AND inherited properties",
      "Use delete, void, and comma operators correctly",
      "Use bitwise operators for flags, masks, and fast math",
      "Know exponentiation ** is right-associative (unlike +, *)",
    ],
  },
  {
    id: "step1", type: "question", phase: "Step 1 of 5",
    paal: "Show all typeof return values — including the historical 'typeof null === object' bug and typeof for functions.",
    answer_keywords: ["typeof", "null", "'object'", "function", "undefined"],
    seed_code: `// Step 1: typeof — complete return value map

// typeof always returns a STRING — one of seven values:
typeof undefined    // 'undefined'
typeof null         // 'object'  ← the famous bug — null is not an object!
typeof true         // 'boolean'
typeof 42           // 'number'
typeof 42n          // 'bigint'
typeof 'hello'      // 'string'
typeof Symbol()     // 'symbol'
typeof {}           // 'object'
typeof []           // 'object'  ← arrays are objects
typeof function(){} // 'function' ← special case — functions get their own type

// Checking for null correctly:
const val = null
typeof val === 'object' && val !== null  // false — correctly identifies null
// OR:
val === null   // cleanest null check

// Checking if something is an array (typeof won't help):
Array.isArray([])   // true ✅
typeof []            // 'object' — useless for array detection

// Safe property existence check:
typeof window !== 'undefined'   // true in browser, false in Node.js
// Common for SSR checks:
const isBrowser = typeof window !== 'undefined'

// typeof on undeclared variables — does NOT throw (unlike let in TDZ):
typeof undeclaredVariable   // 'undefined' — safe
// undeclaredVariable           // ReferenceError — not safe

export {}`,
    feedback_correct: "✅ Seven return values. null bug: typeof null='object'. Array.isArray() for arrays. typeof safe for undeclared vars.",
    feedback_partial: "typeof null='object' (bug). typeof []='object'. typeof function='function'. typeof undeclared='undefined' (safe).",
    feedback_wrong: "typeof null === 'object' is a JS bug. Use val === null for null check. Array.isArray() for arrays.",
    expected: "typeof complete return values",
  },
  {
    id: "step2", type: "question", phase: "Step 2 of 5",
    paal: "Show instanceof walking the prototype chain. Show the 'in' operator checking own AND inherited properties.",
    answer_keywords: ["instanceof", "in", "prototype", "inherited", "own"],
    seed_code: `// Step 2: instanceof and 'in' — prototype-aware checks

class Animal { breathe() {} }
class Dog extends Animal { bark() {} }

const rex = new Dog()

// instanceof walks the ENTIRE prototype chain:
rex instanceof Dog      // true  — direct class
rex instanceof Animal   // true  — parent class  ← important!
rex instanceof Object   // true  — everything is Object
rex instanceof Array    // false

// Gotcha: instanceof checks prototype chain, not the constructor name
// Fails across iframe boundaries (different prototype objects)

// 'in' operator — checks own AND inherited properties:
'bark' in rex     // true — own method on Dog.prototype
'breathe' in rex  // true — inherited from Animal.prototype
'toString' in rex // true — inherited from Object.prototype
'fly' in rex      // false — not in chain at all

// 'in' vs hasOwnProperty:
rex.hasOwnProperty('bark')    // false — bark is on Dog.prototype, not rex
rex.hasOwnProperty('breathe') // false — on Animal.prototype
// (no own enumerable properties on rex in this case)

// Safe hasOwnProperty (avoids prototype pollution):
Object.hasOwn(rex, 'bark')   // false — modern, safer than .hasOwnProperty()

// Practical use — feature detection:
'geolocation' in navigator   // true if browser supports it
'IntersectionObserver' in window  // true in modern browsers

export { Animal, Dog, rex }`,
    feedback_correct: "✅ instanceof walks the prototype chain. 'in' checks own AND inherited. Use Object.hasOwn for own-only.",
    feedback_partial: "instanceof: checks entire prototype chain. in: checks own + inherited. hasOwnProperty: own only.",
    feedback_wrong: "rex instanceof Animal = true (chain). 'breathe' in rex = true (inherited). Object.hasOwn for own props.",
    expected: "instanceof and in operator",
  },
  {
    id: "step3", type: "question", phase: "Step 3 of 5",
    paal: "Show delete (property removal), void (discard and return undefined), and the comma operator (evaluate both, return right).",
    answer_keywords: ["delete", "void", "comma", "undefined", "property"],
    seed_code: `// Step 3: delete, void, and comma operators

// DELETE — removes a property from an object:
const obj = { a: 1, b: 2, c: 3 }
delete obj.b        // removes b
console.log(obj)    // { a: 1, c: 3 }
delete obj.missing  // no error — just returns true (not found)

// delete does NOT work on variables:
let x = 5
delete x    // false — can't delete variables
// delete is for object properties only

// Configurable property descriptors affect delete:
const frozen = {}
Object.defineProperty(frozen, 'key', { value: 1, configurable: false })
delete frozen.key   // false — non-configurable can't be deleted

// VOID — evaluates an expression and always returns undefined:
void 0          // undefined — common idiom for undefined
void anyExpr    // undefined — the expression IS evaluated (side effects happen)

// Classic use: prevent link navigation:
// <a href="javascript:void(0)">Click me</a>
// Arrow function that should return undefined explicitly:
const sideEffect = () => void console.log('hi')  // returns undefined

// COMMA OPERATOR — evaluates left to right, returns RIGHTMOST:
const result = (1, 2, 3, 4, 5)   // 5
// Rarely used directly, but appears in:
for (let i = 0, j = 10; i < j; i++, j--)  {} // multiple update expressions
// The i++, j-- is a comma expression

export { obj, result }`,
    feedback_correct: "✅ delete removes properties (not variables). void 0 = undefined. Comma evaluates all, returns rightmost.",
    feedback_partial: "delete obj.prop removes it. void expr returns undefined. (a, b, c) returns c.",
    feedback_wrong: "delete obj.key removes the property. void 0 = undefined. (a, b) = b (comma returns rightmost).",
    expected: "delete, void, and comma operators",
  },
  {
    id: "step4", type: "question", phase: "Step 4 of 5",
    paal: "Use bitwise operators for permissions flags — a real pattern used in file systems, feature flags, and graphics.",
    answer_keywords: ["bitwise", "&", "|", "^", "<<", "flags", "permissions"],
    seed_code: `// Step 4: bitwise operators — flags and masks

// PERMISSIONS as bit flags (like Unix file permissions):
const READ    = 0b001   // 1
const WRITE   = 0b010   // 2
const EXECUTE = 0b100   // 4

// Combine permissions with | (OR):
const userPerms = READ | WRITE   // 0b011 = 3 — has both

// Check a permission with & (AND):
const canRead  = (userPerms & READ)    !== 0   // true
const canWrite = (userPerms & WRITE)   !== 0   // true
const canExec  = (userPerms & EXECUTE) !== 0   // false

// Add a permission:
const withExec = userPerms | EXECUTE   // 0b111 = 7

// Remove a permission with & and ~ (NOT/complement):
const withoutWrite = userPerms & ~WRITE   // 0b001 = 1 — only READ

// Toggle a permission with ^ (XOR):
const toggled = userPerms ^ WRITE   // removes WRITE if present, adds if not

// Fast integer operations:
const n = 7.9
Math.floor(n)   // 7 — normal way
n | 0           // 7 — bitwise OR with 0 truncates to integer (faster, less clear)
~~n             // 7 — double bitwise NOT also truncates

// Left/right shift for powers of 2:
1 << 0   // 1
1 << 1   // 2
1 << 2   // 4
1 << 10  // 1024

export { READ, WRITE, EXECUTE, canRead, canWrite, canExec }`,
    feedback_correct: "✅ | combines flags, & checks flags, ~& removes flags, ^ toggles flags. The Unix permission model.",
    feedback_partial: "| = OR (combine). & = AND (check). ~ = NOT. ^ = XOR (toggle). << = left shift (×2).",
    feedback_wrong: "permissions |= READ to add. permissions &= ~READ to remove. permissions & READ to check.",
    expected: "Bitwise operators for permission flags",
  },
  {
    id: "step5", type: "question", phase: "Step 5 of 5",
    paal: "Show exponentiation ** is right-associative. Show that unary +, -, and !! are the fastest type conversion idioms.",
    answer_keywords: ["**", "right-associative", "unary", "+", "!!", "conversion"],
    seed_code: `// Step 5: exponentiation and unary conversion idioms

// ** is RIGHT-ASSOCIATIVE (unlike + * which are left-associative):
2 ** 3 ** 2   // = 2 ** (3 ** 2) = 2 ** 9 = 512
               // NOT (2**3)**2 = 8**2 = 64

// Left-to-right with parens when needed:
(2 ** 3) ** 2   // 64 — explicit grouping

// Negative base requires parens (to avoid ambiguity with unary -):
(-2) ** 2   // 4 ✅
// -2 ** 2   // SyntaxError — ambiguous, JS refuses it

// UNARY CONVERSION IDIOMS — fast type conversions:

// Unary + → number:
+'42'       // 42
+true       // 1
+false      // 0
+null       // 0
+undefined  // NaN
+[]         // 0
+{}         // NaN

// Unary - → negate:
-'5'        // -5 (also converts to number)

// !! → boolean (double negation):
!!1         // true
!!0         // false
!!''        // false
!!'hello'   // true
!!null      // false
!![]        // true  ← truthy!

// These are intentional idioms, not bugs — but use Boolean(), Number()
// in production code for clarity:
const num = Number(input)     // explicit, readable
const bool = Boolean(value)   // explicit, readable

export {}`,
    feedback_correct: "✅ ** is right-associative: 2**3**2 = 512. Unary +/-/!! are valid conversion idioms but prefer explicit forms.",
    feedback_partial: "2**3**2 = 2**(3**2) = 512 (right-to-left). +str → number. !!val → boolean.",
    feedback_wrong: "** is right-associative. +'42'=42 (to number). !!'hello'=true (to boolean).",
    expected: "Exponentiation associativity and unary conversions",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — typeof", id: "step1" },
  { label: "Step 2 — instanceof / in", id: "step2" },
  { label: "Step 3 — delete/void/comma", id: "step3" },
  { label: "Step 4 — Bitwise flags", id: "step4" },
  { label: "Step 5 — ** and unary", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: "JS-B05", title: "Operators Deep Dive", shortName: "JS — OPERATORS" });
