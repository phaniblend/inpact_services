import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "JS FUNDAMENTALS #11",
      title: "String Methods & Template Literals",
      body: `Strings are everywhere — URLs, user input, API responses,
log messages, HTML generation. JS gives you a rich toolkit:

Template literals   — interpolation, multiline, tagged templates
Searching           — includes, startsWith, endsWith, indexOf, match
Transforming        — replace, replaceAll, split, join, trim, padStart
Extracting          — slice, substring, at(-1)
Tagged templates    — the power behind styled-components, gql\`\`, html\`\`

A mid-senior dev knows exactly which method to reach for
and never reaches for regex when a string method works fine.`,
      usecase: `URL building, slug generation, template rendering, log formatting, CSV parsing, search highlighting — string manipulation is in every layer of a full-stack app.`,
    },
  },
  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Use template literals for interpolation and multiline strings",
      "Use tagged template literals to build safe HTML / SQL / GraphQL",
      "Master the search methods: includes, startsWith, endsWith, indexOf",
      "Transform strings: replace, replaceAll, trim, padStart, padEnd, repeat",
      "Extract substrings: slice, at(), split/join",
      "Know String.raw and common string gotchas (immutability, encoding)",
    ],
  },
  {
    id: "step1", type: "question", phase: "Step 1 of 5",
    paal: "Use template literals for interpolation, multiline, and nested expressions. Show String.raw for escape-free strings.",
    answer_keywords: ["template", "literal", "`", "${", "multiline", "raw"],
    seed_code: `// Step 1: template literals

const name = 'Alice'
const role = 'admin'

// Interpolation — any expression works inside \${}:
const greeting = \`Hello, \${name}! You are a \${role.toUpperCase()}.\`

// Multiline — no \\n needed:
const html = \`
  <div class="card">
    <h2>\${name}</h2>
    <p>Role: \${role}</p>
  </div>
\`.trim()

// Nested template literals:
const items = ['a', 'b', 'c']
const list = \`Items: \${items.map((x, i) => \`\${i + 1}. \${x}\`).join(', ')}\`
// 'Items: 1. a, 2. b, 3. c'

// Expressions, ternaries, function calls — anything:
const score = 87
const result = \`\${score >= 90 ? '🏆 A' : score >= 80 ? '✅ B' : '📚 C'} — \${score}pts\`

// String.raw — backslashes are NOT processed (useful for regex, Windows paths):
const path  = String.raw\`C:\\Users\\Alice\\Documents\`  // C:\\Users\\Alice\\Documents
const regex = String.raw\`\d+\.\d+\`                    // \\d+\\.\\d+ (no double-escaping)

export { greeting, html, list, result, path }`,
    feedback_correct: "✅ Template literals replace string concatenation everywhere — expressions, multiline, and String.raw for escaping.",
    feedback_partial: "Backtick strings. ${} for any expression. String.raw for unprocessed backslashes.",
    feedback_wrong: "`Hello ${name}` | multiline with backticks | String.raw`path\\to\\file`",
    expected: "Template literal full usage",
  },
  {
    id: "step2", type: "question", phase: "Step 2 of 5",
    paal: "Write a tagged template function: html`` that escapes user input to prevent XSS, and sql`` that parameterises queries.",
    answer_keywords: ["tagged", "tag", "strings", "values", "escape"],
    seed_code: `// Step 2: tagged template literals — the power feature

// Tag function receives: (strings[], ...interpolatedValues)
function html(strings, ...values) {
  return strings.reduce((result, str, i) => {
    const value = values[i - 1]
    // Escape HTML special chars in interpolated values:
    const safe = String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
    return result + safe + str
  })
}

const userInput = '<script>alert("xss")</script>'
const rendered = html\`<div class="name">\${userInput}</div>\`
// <div class="name">&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;</div>  ✅

// SQL parameterisation (prevents injection):
function sql(strings, ...values) {
  const params = []
  const query = strings.reduce((q, str, i) => {
    if (i > 0) {
      params.push(values[i - 1])   // collect param
      return q + \`$\${i}\`          // placeholder
    }
    return q + str
  })
  return { query, params }
}

const userId = 1
const { query, params } = sql\`SELECT * FROM users WHERE id = \${userId}\`
// { query: 'SELECT * FROM users WHERE id = $1', params: [1] }
// styled-components, graphql-tag, lit-html all use this same mechanism ✅

export { html, sql }`,
    feedback_correct: "✅ Tagged templates = the mechanism behind styled-components, gql``, html`` — safety through escaping at the interpolation boundary.",
    feedback_partial: "function tag(strings, ...values) — strings is the static parts array, values are the interpolations.",
    feedback_wrong: "function tag(strings, ...vals) { return strings.reduce((acc, s, i) => acc + escape(vals[i-1]) + s) }",
    expected: "Tagged template for HTML escaping",
  },
  {
    id: "step3", type: "question", phase: "Step 3 of 5",
    paal: "Use includes, startsWith, endsWith, indexOf, and search to query strings. Show the difference between each.",
    answer_keywords: ["includes", "startswith", "endswith", "indexof", "search"],
    seed_code: `// Step 3: string search methods

const url = 'https://api.example.com/users?page=2&limit=20'
const email = '  Alice@Example.COM  '

// includes — boolean, any position:
url.includes('users')       // true
url.includes('orders')      // false

// startsWith / endsWith — positional boolean:
url.startsWith('https')     // true
url.startsWith('http', 0)   // true  (second arg = start position)
url.endsWith('20')          // true
url.endsWith('.com', 30)    // true  (second arg = treat string as this length)

// indexOf — returns position or -1:
url.indexOf('?')            // 31  → slice from here for query string
url.indexOf('missing')      // -1
url.lastIndexOf('/')        // 30  → last slash

// search — like indexOf but accepts regex:
url.search(/\\?.*$/)         // 31 (position of query string start)

// Practical: extract query string
const queryString = url.slice(url.indexOf('?') + 1)   // 'page=2&limit=20'

// Case-insensitive includes:
const normalised = email.trim().toLowerCase()           // 'alice@example.com'
normalised.includes('@example.com')                     // true

export { queryString, normalised }`,
    feedback_correct: "✅ includes for boolean, indexOf for position, startsWith/endsWith for anchored checks, search for regex.",
    feedback_partial: "includes → boolean. indexOf → number (-1 if absent). startsWith/endsWith → anchored boolean.",
    feedback_wrong: "str.includes(sub) | str.startsWith(pre) | str.indexOf(sub) → position | str.search(/regex/)",
    expected: "String search methods",
  },
  {
    id: "step4", type: "question", phase: "Step 4 of 5",
    paal: "Transform strings: replace/replaceAll with string and regex, trim variants, padStart for formatting, and repeat.",
    answer_keywords: ["replace", "replaceall", "trim", "padstart", "padend"],
    seed_code: `// Step 4: string transformation methods

// replace — first match only:
'hello world world'.replace('world', 'JS')        // 'hello JS world'
'hello world world'.replace(/world/g, 'JS')       // 'hello JS JS'  (regex + g flag)

// replaceAll — all matches (ES2021):
'hello world world'.replaceAll('world', 'JS')     // 'hello JS JS'

// replace with a function — dynamic replacement:
const template = 'Hello, {name}! You have {count} messages.'
const filled = template.replace(/\{(\w+)\}/g, (_, key) => {
  return ({ name: 'Alice', count: 5 })[key] ?? key
})
// 'Hello, Alice! You have 5 messages.'

// trim variants:
'  hello  '.trim()        // 'hello'       — both sides
'  hello  '.trimStart()   // 'hello  '     — left only
'  hello  '.trimEnd()     // '  hello'     — right only

// padStart / padEnd — align output:
String(42).padStart(5, '0')    // '00042'  — zero-padded IDs
'Done'.padEnd(10, '.')         // 'Done......'
// Great for: invoice numbers, time formatting (9 → '09')
const formatTime = n => String(n).padStart(2, '0')
\`\${formatTime(9)}:\${formatTime(5)}\`   // '09:05'

// repeat:
'ha'.repeat(3)    // 'hahaha'
'-'.repeat(40)    // a divider line

export { filled, formatTime }`,
    feedback_correct: "✅ replaceAll for all occurrences. replace(regex, fn) for dynamic substitution. padStart for formatted output.",
    feedback_partial: "replace(str) = first only. replace(/g, ...) or replaceAll = all. padStart(len, char) for alignment.",
    feedback_wrong: "str.replaceAll('old','new') | str.replace(/pat/g, fn) | str.padStart(5,'0')",
    expected: "String transformation methods",
  },
  {
    id: "step5", type: "question", phase: "Step 5 of 5",
    paal: "Build a real-world slugify function and a highlight function using split, join, slice, at, and toLowerCase.",
    answer_keywords: ["split", "join", "slice", "at", "slugify", "tolowercase"],
    seed_code: `// Step 5: practical string pipeline

// slugify — blog post URLs from titles:
function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\\w\\s-]/g, '')     // remove non-word chars (keep - and space)
    .replace(/[\\s_]+/g, '-')       // spaces and underscores → hyphens
    .replace(/^-+|-+$/g, '')        // strip leading/trailing hyphens
}

slugify('  Hello, World! — A Story  ')   // 'hello-world-a-story'
slugify("What's New in ES2024?")         // 'whats-new-in-es2024'

// slice vs substring:
const str = 'Hello, World!'
str.slice(7, 12)        // 'World'
str.slice(-6, -1)       // 'World'  — negative indexes work in slice ✅
str.slice(7)            // 'World!'
// substring doesn't support negative indexes

// at() — modern index accessor (supports negative):
str.at(0)    // 'H'
str.at(-1)   // '!'  — last char — cleaner than str[str.length - 1]

// split / join — parse and rebuild:
const csv = 'Alice,28,admin,active'
const [name, age, role, status] = csv.split(',')

const words = 'the quick brown fox'.split(' ')
const titleCase = words.map(w => w[0].toUpperCase() + w.slice(1)).join(' ')
// 'The Quick Brown Fox'

// highlight matching text:
function highlight(text, query) {
  if (!query) return text
  return text.split(query).join(\`<mark>\${query}</mark>\`)
}

highlight('JavaScript is great', 'great')
// 'JavaScript is <mark>great</mark>'

export { slugify, titleCase, highlight }`,
    feedback_correct: "✅ split/join, slice with negatives, at(-1) — the practical string toolkit every fullstack dev uses daily.",
    feedback_partial: "slice(-n) counts from end. at(-1) is last char. split(delim).join(newDelim) transforms separators.",
    feedback_wrong: "str.split(' ').join('-') | str.slice(-1) | str.at(-1) | str.toLowerCase().trim()",
    expected: "slugify, highlight, split/join/slice",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Template literals", id: "step1" },
  { label: "Step 2 — Tagged templates", id: "step2" },
  { label: "Step 3 — Search methods", id: "step3" },
  { label: "Step 4 — Transform methods", id: "step4" },
  { label: "Step 5 — slugify & highlight", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: "JS-F11", title: "Strings & Template Literals", shortName: "JS — STRINGS" });
