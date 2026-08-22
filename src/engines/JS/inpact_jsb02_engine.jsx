import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "JS — BLOCK B #2",
      title: "Truthy, Falsy & Short-Circuit Evaluation",
      body: `Six values are falsy in JavaScript. Everything else — including
'0', 'false', [], {} — is truthy. This asymmetry causes bugs
daily in production code.

&&, ||, and ?? don't return true or false.
They return one of their OPERANDS. This distinction is critical.

user && user.name   // returns user.name or the first falsy
user || 'Guest'     // returns user or 'Guest'
user ?? 'Guest'     // returns user UNLESS null/undefined only

Mastering short-circuit evaluation is the key to writing
concise, idiomatic modern JavaScript.`,
      usecase: `Default values, conditional rendering, guard clauses, optional chaining — all of these rely on truthy/falsy mechanics. Getting this wrong causes silent bugs where 0, '', and false are incorrectly treated as "no value".`,
    },
  },
  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Name all six falsy values and explain why each is falsy",
      "Predict what && and || return (not just true/false)",
      "Know the critical difference between || and ?? for defaults",
      "Use &&= ||= ??= logical assignment operators",
      "Apply optional chaining (?.) correctly with short-circuit",
      "Identify the common bug: using || for defaults with valid falsy values",
    ],
  },
  {
    id: "step1", type: "question", phase: "Step 1 of 5",
    paal: "List all six falsy values. Prove that '0', 'false', [], and {} are truthy — this surprises many devs.",
    answer_keywords: ["falsy", "truthy", "[]", "{}", "'0'", "false string"],
    seed_code: `// Step 1: the complete falsy list — and the truthy traps

// THE SIX FALSY VALUES:
// false, 0, -0, 0n (BigInt zero), '', null, undefined, NaN
// (8 if you count -0 and 0n separately)

// Verify in boolean context:
Boolean(false)     // false ✓
Boolean(0)         // false ✓
Boolean(-0)        // false ✓
Boolean(0n)        // false ✓  BigInt zero
Boolean('')        // false ✓  empty string only
Boolean(null)      // false ✓
Boolean(undefined) // false ✓
Boolean(NaN)       // false ✓

// TRUTHY TRAPS — values that LOOK falsy but aren't:
Boolean('0')       // TRUE  — non-empty string, even if it says "0"
Boolean('false')   // TRUE  — non-empty string
Boolean([])        // TRUE  — empty array
Boolean({})        // TRUE  — empty object
Boolean(function(){}) // TRUE — functions are always truthy
Boolean(new Date())  // TRUE — object instances are always truthy
Boolean(-1)        // TRUE  — any non-zero number

// Real bug this causes:
const count = 0   // valid value meaning "zero"
if (count) {
  showCount(count)  // ❌ never shows when count is 0!
}
// Fix: be explicit
if (count !== null && count !== undefined) showCount(count)
// Or: if (count != null) showCount(count)

function showCount(n) { console.log(n) }
export {}`,
    feedback_correct: "✅ '0', [], {} are all truthy. Only the 8 specific falsy values are falsy — nothing else.",
    feedback_partial: "falsy: false/0/-0/0n/''/null/undefined/NaN. Everything else, including [] and {}, is truthy.",
    feedback_wrong: "Boolean([]) = TRUE. Boolean({}) = TRUE. Boolean('0') = TRUE. Only the 8 are falsy.",
    expected: "Six falsy values and truthy traps",
  },
  {
    id: "step2", type: "question", phase: "Step 2 of 5",
    paal: "Show that && and || return OPERANDS, not booleans. Demonstrate short-circuit — the left side stops evaluation of the right.",
    answer_keywords: ["&&", "||", "operand", "short-circuit", "return"],
    seed_code: `// Step 2: && and || return operands, not booleans

// && returns the FIRST falsy operand, or the LAST value if all truthy:
1 && 2              // 2    — 1 is truthy → evaluate and return 2
0 && 2              // 0    — 0 is falsy  → stop, return 0
'hi' && 'there'     // 'there' — 'hi' truthy → return 'there'
null && anything    // null  — null is falsy → stop, return null

// || returns the FIRST truthy operand, or the LAST value if all falsy:
1 || 2              // 1    — 1 is truthy → stop, return 1
0 || 2              // 2    — 0 is falsy  → evaluate and return 2
0 || null || ''     // ''   — all falsy → return last value
0 || null || 'hi'   // 'hi' — first truthy found

// Short-circuit = right side is NOT evaluated if left decides the result:
let x = 0
true && (x = 1)    // x becomes 1 — right side evaluated
false && (x = 2)   // x stays 1  — right side NOT evaluated
true || (x = 3)    // x stays 1  — right side NOT evaluated
false || (x = 4)   // x becomes 4 — right side evaluated

// Real-world pattern — guard before calling:
const user = { name: 'Alice', getProfile: null }
user.getProfile && user.getProfile()  // safe — won't call if null
// Modern equivalent: user.getProfile?.()

export {}`,
    feedback_correct: "✅ && returns first falsy or last value. || returns first truthy or last value. Neither returns a boolean.",
    feedback_partial: "&& stops at first falsy. || stops at first truthy. The returned value is an operand, not true/false.",
    feedback_wrong: "false && anything = false (the left operand). 0 || 'hi' = 'hi' (first truthy operand).",
    expected: "&& and || return operands not booleans",
  },
  {
    id: "step3", type: "question", phase: "Step 3 of 5",
    paal: "Show the critical difference between || and ?? for default values — and the exact bug || causes with valid falsy values.",
    answer_keywords: ["??", "nullish", "||", "0", "empty string", "default"],
    seed_code: `// Step 3: || vs ?? — the default value bug

// THE BUG with ||:
// || treats ALL falsy values as "missing" — including valid ones

function showCount(count) {
  const display = count || 'N/A'   // BUG: 0 shows as 'N/A' ❌
  console.log(display)
}
showCount(5)     // '5' ✓
showCount(0)     // 'N/A' ❌ — 0 is a valid count!
showCount(null)  // 'N/A' ✓

// THE FIX with ?? (nullish coalescing):
// ?? only treats null and undefined as "missing"

function showCountFixed(count) {
  const display = count ?? 'N/A'   // ✅ only null/undefined trigger default
  console.log(display)
}
showCountFixed(5)          // 5    ✓
showCountFixed(0)          // 0    ✓ — preserves the valid zero!
showCountFixed('')         // ''   ✓ — preserves valid empty string
showCountFixed(false)      // false ✓ — preserves valid boolean
showCountFixed(null)       // 'N/A' ✓
showCountFixed(undefined)  // 'N/A' ✓

// RULE OF THUMB:
// Use ?? when 0, '', false are valid values (almost always)
// Use || only when ALL falsy values mean "no value" (rare)

// Real-world examples where ?? matters:
const timeout = config.timeout ?? 5000     // 0ms is a valid timeout!
const label = props.label ?? 'Default'    // '' is a valid label!
const checked = input.checked ?? false    // false is a valid checkbox state!

export { showCount, showCountFixed }`,
    feedback_correct: "✅ ?? is the correct default operator for most cases — || silently ignores valid 0, '', and false.",
    feedback_partial: "|| treats 0/''/false as missing. ?? only treats null/undefined as missing. Use ?? by default.",
    feedback_wrong: "count ?? 'N/A' — only null/undefined trigger the default. count || 'N/A' — all falsy trigger it.",
    expected: "?? vs || for default values",
  },
  {
    id: "step4", type: "question", phase: "Step 4 of 5",
    paal: "Use logical assignment operators &&=, ||=, ??= — they combine assignment with short-circuit logic.",
    answer_keywords: ["&&=", "||=", "??=", "logical assignment"],
    seed_code: `// Step 4: logical assignment operators (ES2021)

// &&= — assign only if left side is TRUTHY:
let user = { name: 'Alice', score: 0 }
user.name &&= user.name.toUpperCase()   // 'Alice' is truthy → assigns 'ALICE'
user.score &&= user.score * 2           // 0 is falsy → does NOT assign

// Equivalent verbose form:
// user.name = user.name && user.name.toUpperCase()

// ||= — assign only if left side is FALSY:
let config = { theme: '', timeout: 0 }
config.theme ||= 'light'     // '' is falsy → assigns 'light'
config.timeout ||= 5000      // 0 is falsy → assigns 5000 (BUG if 0 is valid!)

// ??= — assign only if left side is NULL or UNDEFINED:
let settings = { debug: false, retries: 0, name: null }
settings.debug ??= true    // false is not null/undefined → does NOT assign
settings.retries ??= 3     // 0 is not null/undefined → does NOT assign
settings.name ??= 'app'    // null IS null → assigns 'app' ✅

// The safe default-initialization pattern:
function initConfig(config) {
  config.timeout ??= 5000    // safe: 0 is preserved
  config.retries ??= 3       // safe: 0 retries is valid
  config.debug ??= false     // safe: false is preserved
  return config
}

export { initConfig }`,
    feedback_correct: "✅ ??= is the safe default initializer. &&= for conditional transform. ||= for falsy-default (use rarely).",
    feedback_partial: "x &&= val: assign if x truthy. x ||= val: assign if x falsy. x ??= val: assign if x null/undefined.",
    feedback_wrong: "config.timeout ??= 5000 — only assigns if timeout is null or undefined, preserving valid 0.",
    expected: "Logical assignment operators &&= ||= ??=",
  },
  {
    id: "step5", type: "question", phase: "Step 5 of 5",
    paal: "Combine optional chaining (?.) with nullish coalescing (??) for safe deep property access with defaults.",
    answer_keywords: ["?.", "??", "optional chaining", "deep", "safe access"],
    seed_code: `// Step 5: optional chaining + nullish coalescing — the power combo

const response = {
  data: {
    user: {
      profile: {
        // avatar is missing
        name: 'Alice',
        score: 0,
      }
    }
  }
}

// Without optional chaining — verbose and fragile:
const avatar1 = response &&
  response.data &&
  response.data.user &&
  response.data.user.profile &&
  response.data.user.profile.avatar

// With ?. — short-circuits to undefined if any step is null/undefined:
const avatar2 = response?.data?.user?.profile?.avatar   // undefined

// With ?? — provide a default only for null/undefined:
const avatar3 = response?.data?.user?.profile?.avatar ?? '/default.png'

// score is 0 — preserved correctly:
const score = response?.data?.user?.profile?.score ?? -1  // 0 (not -1) ✅

// Optional method calls:
response?.data?.user?.getPermissions?.()   // calls if exists, undefined if not

// Optional bracket notation (dynamic keys):
const key = 'name'
const val = response?.data?.user?.profile?.[key]  // 'Alice'

// Optional chaining with nullish in function params:
function greet(user) {
  const name = user?.profile?.name ?? 'Guest'
  const city = user?.address?.city ?? 'Unknown'
  return \`Hi \${name} from \${city}\`
}

greet(null)           // 'Hi Guest from Unknown'
greet({ profile: { name: 'Bob' }, address: null })  // 'Hi Bob from Unknown'

export { greet }`,
    feedback_correct: "✅ ?. short-circuits to undefined. ?? catches that undefined and provides a default. Perfect pairing.",
    feedback_partial: "a?.b?.c returns undefined (not throw) if any step is null/undefined. Add ?? for a default value.",
    feedback_wrong: "obj?.prop?.method?.() ?? 'default' — optional chain then nullish default.",
    expected: "Optional chaining with nullish coalescing",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Falsy values", id: "step1" },
  { label: "Step 2 — && and || return", id: "step2" },
  { label: "Step 3 — || vs ??", id: "step3" },
  { label: "Step 4 — &&= ||= ??=", id: "step4" },
  { label: "Step 5 — ?. and ??", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: "JS-B02", title: "Truthy, Falsy & Short-Circuit", shortName: "JS — TRUTHY/FALSY" });
