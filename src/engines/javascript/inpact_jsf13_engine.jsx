import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "JS FUNDAMENTALS #13",
      title: "Numbers, Math, Date & Intl",
      body: `Numbers in JS have more gotchas than any other primitive.
0.1 + 0.2 !== 0.3 is the famous one, but there are dozens more.

Number        — IEEE 754 double precision, NaN, Infinity, BigInt
Math          — random, floor, ceil, round, abs, min, max, pow
Date          — creation, comparison, formatting (use a library!)
Intl          — the built-in i18n toolkit (NumberFormat, DateTimeFormat,
                RelativeTimeFormat, Collator)

Intl is massively underused. It handles currency, locale-aware
dates, relative times ("2 hours ago"), and string sorting in
different languages — all without a single npm install.`,
      usecase: `Price formatting, date display, input validation, statistical calculations, internationalisation — number and date work is in every feature that touches money, time, or a non-English user.`,
    },
  },
  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Understand Number precision, NaN, Infinity, and Number.EPSILON",
      "Use Number static methods: isNaN, isFinite, isInteger, parseFloat",
      "Use Math for rounding, clamping, random ranges, and statistical ops",
      "Create and compare Date objects — and know why to use a library",
      "Use Intl.NumberFormat for currency, percent, and compact notation",
      "Use Intl.DateTimeFormat and Intl.RelativeTimeFormat",
    ],
  },
  {
    id: "step1", type: "question", phase: "Step 1 of 5",
    paal: "Show the floating point trap, NaN behaviour, and the correct ways to check for NaN, Infinity, and integers.",
    answer_keywords: ["nan", "isnan", "number.isnan", "epsilon", "infinity", "isfinite"],
    seed_code: `// Step 1: Number gotchas and safe checks

// The famous floating point trap:
0.1 + 0.2                    // 0.30000000000000004 ❌
0.1 + 0.2 === 0.3            // false ❌

// Fix: compare with epsilon tolerance
Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON   // true ✅
// Or: work in integers (cents) for money
const price = 10 + 20   // 30 cents — then divide for display

// NaN — "Not a Number" but typeof NaN === 'number' (infamous quirk)
typeof NaN          // 'number' 😱
NaN === NaN         // false — NaN is not equal to itself!

// NEVER use global isNaN — it coerces strings first:
isNaN('hello')          // true  ← coerces 'hello' to NaN first (wrong)
Number.isNaN('hello')   // false ✅ — strict: only true for actual NaN
Number.isNaN(NaN)       // true  ✅

// Infinity:
1 / 0                   // Infinity
-1 / 0                  // -Infinity
Number.isFinite(Infinity)  // false
Number.isFinite(42)        // true

// Integer check:
Number.isInteger(4.0)   // true  (4.0 is stored as 4)
Number.isInteger(4.5)   // false

// Safe string → number:
Number.parseFloat('3.14abc')   // 3.14  (stops at non-numeric)
Number.parseInt('42px', 10)    // 42    (always pass radix 10)
+'42'                          // 42    (unary + coercion — concise but less readable)
Number('42px')                 // NaN   (strict — whole string must be numeric)

export {}`,
    feedback_correct: "✅ Number.isNaN (not global isNaN), Number.EPSILON for float comparison, parseInt always with radix 10.",
    feedback_partial: "Number.isNaN vs isNaN. 0.1+0.2 needs epsilon comparison. parseInt radix is mandatory.",
    feedback_wrong: "Number.isNaN(val) | Math.abs(a - b) < Number.EPSILON | Number.parseInt(str, 10)",
    expected: "Number precision, NaN, Infinity",
  },
  {
    id: "step2", type: "question", phase: "Step 2 of 5",
    paal: "Use Math to round correctly, clamp a value, generate a random integer in a range, and compute statistics.",
    answer_keywords: ["math.floor", "math.round", "math.random", "math.min", "math.max", "clamp"],
    seed_code: `// Step 2: Math — practical patterns

// Rounding:
Math.floor(4.9)    // 4   — always down
Math.ceil(4.1)     // 5   — always up
Math.round(4.5)    // 5   — nearest (rounds .5 up)
Math.trunc(4.9)    // 4   — remove decimals (negative-safe)
Math.trunc(-4.9)   // -4  (Math.floor(-4.9) = -5 — different!)

// Round to N decimal places:
const round = (n, places) => Math.round(n * 10**places) / 10**places
round(3.14159, 2)   // 3.14

// Clamp a value within [min, max]:
const clamp = (val, min, max) => Math.min(Math.max(val, min), max)
clamp(150, 0, 100)   // 100
clamp(-10, 0, 100)   // 0
clamp(50,  0, 100)   // 50

// Random integer in range [min, max] inclusive:
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
randInt(1, 6)   // dice roll

// Shuffle an array (Fisher-Yates):
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Stats:
const nums = [4, 8, 15, 16, 23, 42]
const sum  = nums.reduce((a, b) => a + b, 0)      // 108
const mean = sum / nums.length                      // 18
const max  = Math.max(...nums)                      // 42
const min  = Math.min(...nums)                      // 4

export { round, clamp, randInt, shuffle }`,
    feedback_correct: "✅ clamp with min/max, randInt with floor+random, Fisher-Yates shuffle — the practical Math toolkit.",
    feedback_partial: "clamp = Math.min(Math.max(val,min),max) | randInt = Math.floor(Math.random()*(max-min+1))+min",
    feedback_wrong: "const clamp=(v,lo,hi)=>Math.min(Math.max(v,lo),hi) | const randInt=(a,b)=>Math.floor(Math.random()*(b-a+1))+a",
    expected: "Math rounding, clamping, random",
  },
  {
    id: "step3", type: "question", phase: "Step 3 of 5",
    paal: "Create Date objects, compute differences, and compare dates. Show why Temporal or date-fns are preferred in production.",
    answer_keywords: ["new date", "gettime", "date.now", "difference", "timestamp"],
    seed_code: `// Step 3: Date — creation and arithmetic

// Create dates:
const now    = new Date()                    // current moment
const d1     = new Date('2024-03-15')        // from ISO string
const d2     = new Date(2024, 2, 15)         // year, month (0-indexed!), day
const d3     = new Date(Date.now())          // from timestamp ms

// Month is 0-indexed — January = 0, December = 11 ← notorious gotcha

// Timestamps:
Date.now()           // ms since Unix epoch — cheapest way to get current time
new Date().getTime() // same thing

// Comparison — compare timestamps:
const a = new Date('2024-01-01')
const b = new Date('2024-06-01')
a < b    // true  (dates coerce to timestamps in comparisons)
a.getTime() < b.getTime()   // explicit — always prefer this

// Difference in days:
const diffMs   = b.getTime() - a.getTime()
const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))   // 152 days

// Format — built-in toString() output is locale/browser dependent ⚠️
// AVOID: new Date().toLocaleString()  — inconsistent across environments
// USE: Intl.DateTimeFormat (next step) or date-fns / dayjs / Temporal

// Add days:
function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

// Start of day:
function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export { diffDays, addDays, startOfDay }`,
    feedback_correct: "✅ Date.now() for timestamps. getTime() for explicit comparison. Month is 0-indexed. Use Intl for display.",
    feedback_partial: "new Date(isoString) | .getTime() for ms comparison | month param is 0-indexed | addDays via setDate",
    feedback_wrong: "Date.now() | a.getTime() < b.getTime() | new Date(2024, 0, 1) = Jan 1 (month=0)",
    expected: "Date creation, comparison, arithmetic",
  },
  {
    id: "step4", type: "question", phase: "Step 4 of 5",
    paal: "Use Intl.NumberFormat for currency, percent, and compact notation. Show how locale affects output.",
    answer_keywords: ["intl", "numberformat", "currency", "locale", "format"],
    seed_code: `// Step 4: Intl.NumberFormat — locale-aware number formatting

// Currency:
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
usd.format(1234567.89)   // '$1,234,567.89'

const eur = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })
eur.format(1234567.89)   // '1.234.567,89 €'  — German format

// Percent:
const pct = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 })
pct.format(0.1234)   // '12.3%'

// Compact notation (social media counts):
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
compact.format(1234567)   // '1.2M'
compact.format(9500)      // '9.5K'

// Custom decimal/grouping separators:
const precise = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
precise.format(42)     // '42.00'
precise.format(3.1)    // '3.10'

// One-shot format (no reuse):
Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(99.9)
// '£99.90'

// formatToParts — for custom rendering:
const parts = usd.formatToParts(1234.56)
// [{ type:'currency', value:'$' }, { type:'integer', value:'1,234' }, ...]

export { usd, eur, compact }`,
    feedback_correct: "✅ Intl.NumberFormat handles currency, percent, compact — locale-correct without any npm package.",
    feedback_partial: "new Intl.NumberFormat(locale, { style, currency, notation }) .format(number)",
    feedback_wrong: "new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)",
    expected: "Intl.NumberFormat for currency and compact",
  },
  {
    id: "step5", type: "question", phase: "Step 5 of 5",
    paal: "Use Intl.DateTimeFormat and Intl.RelativeTimeFormat for locale-aware date display and '3 hours ago' strings.",
    answer_keywords: ["intl.datetimeformat", "relativetimeformat", "locale", "format", "ago"],
    seed_code: `// Step 5: Intl.DateTimeFormat and RelativeTimeFormat

const date = new Date('2024-03-15T14:30:00Z')

// DateTimeFormat — locale-aware:
const shortUS  = new Intl.DateTimeFormat('en-US', { dateStyle: 'short' })
shortUS.format(date)   // '3/15/24'

const longFR   = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' })
longFR.format(date)    // '15 mars 2024 à 14:30'

const custom   = new Intl.DateTimeFormat('en-US', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
})
custom.format(date)    // 'Friday, March 15, 2024'

// RelativeTimeFormat — "2 hours ago", "in 3 days":
const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
rtf.format(-1, 'day')    // 'yesterday'
rtf.format(-3, 'hour')   // '3 hours ago'
rtf.format(2, 'day')     // 'in 2 days'
rtf.format(1, 'month')   // 'next month'

// Helper — compute relative time automatically:
function timeAgo(date) {
  const seconds = (date - Date.now()) / 1000
  const units = [
    ['year', 31536000], ['month', 2592000], ['week', 604800],
    ['day', 86400], ['hour', 3600], ['minute', 60], ['second', 1],
  ]
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  for (const [unit, secs] of units) {
    if (Math.abs(seconds) >= secs) {
      return rtf.format(Math.round(seconds / secs), unit)
    }
  }
  return 'just now'
}

timeAgo(new Date(Date.now() - 3_600_000))   // '1 hour ago'
timeAgo(new Date(Date.now() + 86_400_000))  // 'tomorrow'

export { timeAgo }`,
    feedback_correct: "✅ Intl.DateTimeFormat + RelativeTimeFormat = zero-dependency i18n. No moment.js needed for basic display.",
    feedback_partial: "Intl.DateTimeFormat(locale, { dateStyle, timeStyle }) | Intl.RelativeTimeFormat(locale).format(value, unit)",
    feedback_wrong: "new Intl.RelativeTimeFormat('en').format(-3, 'hour') = '3 hours ago'",
    expected: "Intl.DateTimeFormat and RelativeTimeFormat",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Number gotchas", id: "step1" },
  { label: "Step 2 — Math utilities", id: "step2" },
  { label: "Step 3 — Date ops", id: "step3" },
  { label: "Step 4 — Intl.NumberFormat", id: "step4" },
  { label: "Step 5 — Intl.DateTimeFormat", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: "JS-F13", title: "Numbers, Math, Date & Intl", shortName: "JS — NUMBERS & DATES" });
