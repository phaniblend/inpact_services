import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "JS FUNDAMENTALS #12",
      title: "Regular Expressions — Real-World Depth",
      body: `Regex turns a 40-line parsing loop into one line.
It is unavoidable in validation, URL routing, log scraping,
find-and-replace, and code generation.

/pattern/flags   — literal syntax, parsed at load time
new RegExp(str)  — dynamic pattern built at runtime

Key methods:
  test()     — boolean: does it match?
  match()    — extract first match or all with /g
  matchAll() — iterate ALL matches with capture groups
  replace()  — transform with backreferences
  split()    — split on a pattern

Named capture groups, lookaheads, and non-greedy
quantifiers are the line between beginner and senior regex.`,
      usecase: `Email/URL/phone validation, slug extraction, log parsing, search highlighting, CSV/markdown parsing, code transformation — regex is in every layer of a real app.`,
    },
  },
  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Write patterns with character classes, quantifiers, and anchors",
      "Use capture groups () and named groups (?<name>)",
      "Use flags: g, i, m, s, u",
      "Use lookahead (?=) and lookbehind (?<=) for context-aware patterns",
      "Use matchAll() for iterating all matches with groups",
      "Avoid the stateful lastIndex trap with /g on RegExp instances",
      "Build dynamic patterns with new RegExp()",
    ],
  },
  {
    id: "step1", type: "question", phase: "Step 1 of 5",
    paal: "Write patterns using character classes, quantifiers, anchors. Validate an email and a phone number.",
    answer_keywords: ["regex", "test", "\\d", "\\w", "^", "$"],
    seed_code: `// Step 1: character classes, quantifiers, anchors

// Character classes:
// \\d  digit [0-9]    \\D  non-digit
// \\w  word [a-zA-Z0-9_]   \\W  non-word
// \\s  whitespace     \\S  non-whitespace
// .   any char except newline

// Quantifiers:
// *  0+   +  1+   ?  0 or 1
// {n}  exactly n   {n,m}  between n and m
// Add ? after to make NON-GREEDY: *? +? {n,m}?

// Anchors:
// ^ start of string   $ end of string
// \\b word boundary

// Email (simplified — use a library for production):
const emailRE = /^[\\w.+-]+@[\\w-]+\\.[a-z]{2,}$/i
emailRE.test('alice@example.com')    // true
emailRE.test('not-an-email')         // false

// Phone: accepts (123) 456-7890 or 123-456-7890 or 1234567890
const phoneRE = /^\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}$/
phoneRE.test('(123) 456-7890')  // true
phoneRE.test('123-456-7890')    // true
phoneRE.test('12345')           // false

// URL slug validation:
const slugRE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
slugRE.test('hello-world')   // true
slugRE.test('Hello World')   // false

export { emailRE, phoneRE, slugRE }`,
    feedback_correct: "✅ Character classes + quantifiers + anchors — the three foundations of every regex pattern.",
    feedback_partial: "\\d for digit, \\w for word char, + for one-or-more, ^ and $ for start/end anchors.",
    feedback_wrong: "/^[\\w.+-]+@[\\w-]+\\.[a-z]{2,}$/i for email  |  ^ and $ anchor the full string",
    expected: "Character classes, quantifiers, anchors",
  },
  {
    id: "step2", type: "question", phase: "Step 2 of 5",
    paal: "Use capture groups and named groups to extract parts of a date string and a URL.",
    answer_keywords: ["capture", "group", "(", "?<", "match", "groups"],
    seed_code: `// Step 2: capture groups and named groups

// Numbered capture groups:
const dateRE = /(\\d{4})-(\\d{2})-(\\d{2})/
const m = '2024-03-15'.match(dateRE)
// m[0] = '2024-03-15' (full match)
// m[1] = '2024'  m[2] = '03'  m[3] = '15'

// Named capture groups — (?<name>pattern):
const dateREnamed = /(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})/
const { groups } = '2024-03-15'.match(dateREnamed)
const { year, month, day } = groups   // clean, readable ✅

// URL parser with named groups:
const urlRE = /^(?<protocol>https?):\\/\\/(?<host>[^\\/]+)(?<path>\\/[^?#]*)?(?:\\?(?<query>[^#]*))?/
const url = 'https://api.example.com/users?page=2&limit=10'
const { protocol, host, path, query } = url.match(urlRE).groups
// protocol='https', host='api.example.com', path='/users', query='page=2&limit=10'

// Non-capturing group (?:) — group without capturing:
const versionRE = /(?:v|version\\s)(?<num>\\d+\\.\\d+\\.\\d+)/i
'version 2.1.4'.match(versionRE).groups.num   // '2.1.4'

export { groups, protocol, host, path, query }`,
    feedback_correct: "✅ Named groups (?<name>...) make match results self-documenting. Access via match.groups.",
    feedback_partial: "() = numbered capture. (?<name>) = named capture. (?:) = group without capture.",
    feedback_wrong: "/(?<year>\\d{4})-(?<month>\\d{2})/  then  match.groups.year",
    expected: "Capture groups and named groups",
  },
  {
    id: "step3", type: "question", phase: "Step 3 of 5",
    paal: "Use lookahead (?=) and lookbehind (?<=) to match patterns that depend on surrounding context.",
    answer_keywords: ["lookahead", "lookbehind", "(?=", "(?<=", "(?!", "(?<!"],
    seed_code: `// Step 3: lookahead and lookbehind assertions

// POSITIVE LOOKAHEAD (?=...) — match X only if followed by Y:
// Passwords: digits that are followed by a letter
const hasDigitBeforeLetter = /\\d(?=[a-z])/i
'a3b'.match(hasDigitBeforeLetter)   // ['3'] — 3 is followed by b ✅

// NEGATIVE LOOKAHEAD (?!...) — match X only if NOT followed by Y:
// Find 'file' not followed by '.js':
const notJsFile = /file(?!\\.js)/g
'file.ts file.js file.css'.match(notJsFile)   // ['file', 'file'] (skips .js)

// POSITIVE LOOKBEHIND (?<=...) — match X only if preceded by Y:
// Extract numbers after a $ sign:
const priceRE = /(?<=\\$)[\\d.]+/g
'$19.99 and $5.00'.match(priceRE)   // ['19.99', '5.00'] — no $ in result

// NEGATIVE LOOKBEHIND (?<!...):
// Match 'px' not preceded by a digit:
const standalonePx = /(?<!\\d)px/g

// Real-world: password strength validator using lookaheads:
function validatePassword(pw) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\w]).{8,}$/.test(pw)
  // Must have: lowercase, uppercase, digit, special char, min 8 chars
}
validatePassword('Abc123!@')   // true
validatePassword('abc123')     // false (no uppercase, no special)

export { validatePassword }`,
    feedback_correct: "✅ Lookahead/lookbehind match based on context without consuming — the key to non-destructive pattern matching.",
    feedback_partial: "(?=Y) = must be followed by Y. (?<=Y) = must be preceded by Y. (?!Y) / (?<!Y) = negative versions.",
    feedback_wrong: "/(?<=\\$)[\\d.]+/ extracts price without the $ | /(?=.*[A-Z])/ asserts uppercase exists",
    expected: "Lookahead and lookbehind",
  },
  {
    id: "step4", type: "question", phase: "Step 4 of 5",
    paal: "Use matchAll() to iterate every match. Warn about the /g lastIndex trap on reused RegExp instances.",
    answer_keywords: ["matchall", "lastindex", "for...of", "/g", "stateful"],
    seed_code: `// Step 4: matchAll and the lastIndex trap

const text = 'Error at line 12, warning at line 34, error at line 56'

// matchAll — returns iterator of ALL matches with groups (requires /g):
const lineRE = /(?<type>error|warning) at line (?<line>\\d+)/gi
const matches = [...text.matchAll(lineRE)]
// Each match is an array with .groups:
matches.forEach(m => {
  console.log(\`\${m.groups.type} on line \${m.groups.line}\`)
})
// error on line 12 | warning on line 34 | error on line 56

// ⚠️  THE lastIndex TRAP — RegExp instances with /g are STATEFUL:
const re = /\\d+/g
re.test('abc 42')   // true  — lastIndex moves to 6
re.test('abc 42')   // true  — but now starts searching from index 6 in the new string!
re.test('abc 42')   // false — oops, wrapped around

// Fix 1: always use regex literals inline (new instance each time):
/\\d+/g.test('abc 42')   // always fresh

// Fix 2: reset lastIndex manually:
re.lastIndex = 0
re.test('abc 42')   // true ✅

// Fix 3: use string methods (match, matchAll) instead — they reset lastIndex:
'abc 42 99'.match(/\\d+/g)   // ['42', '99'] — safe, no statefulness

export { matches }`,
    feedback_correct: "✅ matchAll needs /g and returns an iterator with full group info. Regex instances with /g are stateful — a classic bug source.",
    feedback_partial: "str.matchAll(/pattern/g) gives all matches. RegExp /g instances track lastIndex — reset it or use literals.",
    feedback_wrong: "[...str.matchAll(/pattern/g)]  |  re.lastIndex = 0 to reset  |  use string methods to avoid statefulness",
    expected: "matchAll and lastIndex trap",
  },
  {
    id: "step5", type: "question", phase: "Step 5 of 5",
    paal: "Build a dynamic regex with new RegExp(). Use replace with a function and backreferences for real transformations.",
    answer_keywords: ["new regexp", "replace", "backreference", "$1", "dynamic"],
    seed_code: `// Step 5: dynamic patterns and replace with function

// new RegExp — when the pattern is dynamic (from user input):
function highlight(text, term) {
  if (!term) return text
  // Escape special regex chars in user input first:
  const escaped = term.replace(/[-/\\^$*+?.()|[\\]{}]/g, '\\\\$&')
  const re = new RegExp('(' + escaped + ')', 'gi')   // build dynamic pattern
  return text.replace(re, '<mark>$1</mark>')       // $1 = capture group 1
}

highlight('JavaScript is great', 'script')
// 'Java<mark>Script</mark> is great'

// replace with a function — dynamic replacement logic:
// camelCase → kebab-case:
function camelToKebab(str) {
  return str.replace(/([A-Z])/g, (_, letter) => '-' + letter.toLowerCase())
}
camelToKebab('backgroundColor')   // 'background-color'
camelToKebab('maxWidth')           // 'max-width'

// Template variable substitution:
function interpolate(template, vars) {
  return template.replace(/\\{\\{(\\w+)\\}\\}/g, (_, key) => vars[key] ?? ('{{' + key + '}}'))
}
interpolate('Hello, {{name}}! You have {{count}} messages.', {
  name: 'Alice', count: 3
})
// 'Hello, Alice! You have 3 messages.'

export { highlight, camelToKebab, interpolate }`,
    feedback_correct: "✅ new RegExp for dynamic patterns. replace(re, fn) for computed replacements. $1 for backreference.",
    feedback_partial: "new RegExp(escapedStr, flags) | replace(/pat/g, (match, group) => transform(group))",
    feedback_wrong: "new RegExp(`(${escaped})`, 'gi')  |  str.replace(/([A-Z])/g, (_, c) => '-' + c.toLowerCase())",
    expected: "Dynamic RegExp and replace with function",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Classes & quantifiers", id: "step1" },
  { label: "Step 2 — Capture groups", id: "step2" },
  { label: "Step 3 — Lookahead/behind", id: "step3" },
  { label: "Step 4 — matchAll & lastIndex", id: "step4" },
  { label: "Step 5 — Dynamic & replace", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: "JS-F12", title: "Regular Expressions", shortName: "JS — REGEX" });
