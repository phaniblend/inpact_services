import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "JS FUNDAMENTALS #6",
      title: "Modules — ESM & CommonJS",
      body: `JavaScript has two module systems in active use:

ESM (ES Modules)  — import/export, the standard for browsers + modern Node
CommonJS (CJS)    — require/module.exports, the legacy Node standard

You need both because most npm packages still ship CJS.
Knowing how they interop — and where they DON'T —
prevents hours of confusing "cannot use import statement"
and "require is not defined" errors.

ESM is static (tree-shakeable, analyzed at parse time).
CJS is dynamic (evaluated at runtime, synchronous).`,
      usecase: `Every file you write is a module. Barrel files, code splitting with dynamic import(), and the ESM/CJS interop rules in Node are daily realities in any production project.`,
    },
  },
  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Use named exports and named imports (with aliases)",
      "Use default export and default import",
      "Build a barrel index.js with re-exports",
      "Use dynamic import() for lazy code splitting",
      "Understand CommonJS require/module.exports",
      "Know the ESM ↔ CJS interop rules in Node.js",
    ],
  },
  {
    id: "step1", type: "question", phase: "Step 1 of 5",
    paal: "Write named exports, a default export, and consume both in one import statement.",
    answer_keywords: ["export", "import", "default", "named", "from"],
    seed_code: `// Step 1: named vs default exports

// ── math.js ──────────────────────────────────────────────────
export const PI = 3.14159
export function add(a, b) { return a + b }
export function multiply(a, b) { return a * b }

// ── user.js ──────────────────────────────────────────────────
export default class User {            // one default per file
  constructor(name) { this.name = name }
  greet() { return \`Hi, I'm \${this.name}\` }
}
export const MAX_NAME_LENGTH = 50      // named alongside default

// ── main.js ──────────────────────────────────────────────────
// import { add, multiply, PI } from './math.js'
// import User, { MAX_NAME_LENGTH } from './user.js'
//        ^^^^  ^^^^^^^^^^^^^^^^^ default and named in one line

// Rename a named import to avoid collisions:
// import { add as mathAdd } from './math.js'

// Import everything as a namespace object:
// import * as Math from './math.js'
// Math.add(1, 2)   Math.PI

export { PI, add, multiply }`,
    feedback_correct: "✅ Named imports are explicit — you pick what you need. Default import can be named anything.",
    feedback_partial: "export const x / export function f = named. export default = one per file.",
    feedback_wrong: "import { named } from '...'  |  import Default from '...'  |  import Default, { named } from '...'",
    expected: "Named and default exports/imports",
  },
  {
    id: "step2", type: "question", phase: "Step 2 of 5",
    paal: "Build a barrel file (index.js) that re-exports from multiple modules so consumers import from one path.",
    answer_keywords: ["barrel", "re-export", "index", "export {", "from"],
    seed_code: `// Step 2: barrel files — the re-export pattern

// Without a barrel — consumers must know exact file paths:
// import { add } from './utils/math.js'
// import { formatDate } from './utils/date.js'
// import { truncate } from './utils/string.js'

// ── utils/index.js (barrel) ──────────────────────────────────
export { add, multiply, PI } from './math.js'
export { formatDate, parseDate } from './date.js'
export { truncate, slugify } from './string.js'

// Re-export a default as a named export:
export { default as User } from './user.js'

// Now consumers only need one import:
// import { add, formatDate, truncate, User } from './utils'

// ─── TRADE-OFFS ──────────────────────────────────────────────
// ✅ Clean import paths for consumers
// ✅ Centralised public API for a module
// ⚠️  Barrel files can hurt tree-shaking in some bundlers
//     (Vite/Rollup handle them fine; older webpack configs may not)
// ⚠️  Circular dependency risk if barrels import each other

export {}  // makes this a valid module even with no local exports`,
    feedback_correct: "✅ Barrel = index.js that re-exports everything. One path for consumers, clean internals.",
    feedback_partial: "export { thing } from './file' re-exports without first importing locally.",
    feedback_wrong: "export { fn } from './module'  |  export { default as Name } from './module'",
    expected: "Barrel file with re-exports",
  },
  {
    id: "step3", type: "question", phase: "Step 3 of 5",
    paal: "Use dynamic import() to lazy-load a module on demand — the code-splitting primitive used by every bundler.",
    answer_keywords: ["import(", "dynamic", "lazy", "then", "await"],
    seed_code: `// Step 3: dynamic import() — lazy loading and code splitting

// Static import — loaded immediately at parse time:
// import { heavyChart } from './chart.js'  ← always in the bundle

// Dynamic import — returns a Promise, loads on demand:
async function loadChartWhenNeeded() {
  const { renderChart } = await import('./chart.js')
  renderChart(document.getElementById('canvas'))
}

// Conditional loading — only load in browser, not SSR:
if (typeof window !== 'undefined') {
  import('./browser-only-module.js').then(mod => mod.init())
}

// Route-based code splitting (framework-agnostic pattern):
const routes = {
  '/dashboard': () => import('./pages/Dashboard.js'),
  '/settings':  () => import('./pages/Settings.js'),
  '/profile':   () => import('./pages/Profile.js'),
}

async function navigate(path) {
  const loader = routes[path]
  if (!loader) return
  const module = await loader()           // load only when navigated to
  const Page = module.default             // get the default export
  Page.render(document.getElementById('app'))
}

// Result: initial bundle is tiny; pages load on demand ✅

export { loadChartWhenNeeded, navigate }`,
    feedback_correct: "✅ dynamic import() is the code-splitting primitive — Angular lazy routes, Vue async components all use it.",
    feedback_partial: "import('./path') returns a Promise<module>. Await it or .then() it.",
    feedback_wrong: "const mod = await import('./module.js')  |  import('./module').then(m => m.default)",
    expected: "Dynamic import for code splitting",
  },
  {
    id: "step4", type: "question", phase: "Step 4 of 5",
    paal: "Write CommonJS require/module.exports. Show named exports, default-style export, and destructured require.",
    answer_keywords: ["require", "module.exports", "exports", "commonjs"],
    seed_code: `// Step 4: CommonJS — still the default in Node.js without "type":"module"

// ── math.cjs ─────────────────────────────────────────────────
function add(a, b) { return a + b }
function multiply(a, b) { return a * b }
const PI = 3.14159

// Named exports — attach to module.exports object:
module.exports = { add, multiply, PI }

// ── user.cjs ─────────────────────────────────────────────────
class User {
  constructor(name) { this.name = name }
}
module.exports = User            // "default-style" — export a single thing
module.exports.MAX_LENGTH = 50   // attach statics to the function/class

// ── main.cjs ─────────────────────────────────────────────────
const { add, PI } = require('./math.cjs')      // destructure named exports
const User = require('./user.cjs')              // get the "default"
const math = require('./math.cjs')              // get the whole object

// CJS is synchronous and dynamic:
const flag = true
if (flag) {
  const extra = require('./extra.cjs')  // conditional — fine in CJS, illegal in ESM
}

// require() caches modules — same object returned every time:
const a = require('./math.cjs')
const b = require('./math.cjs')
// a === b  → true (same cached reference)`,
    feedback_correct: "✅ module.exports = {} for named, module.exports = X for single thing. require() is synchronous and cached.",
    feedback_partial: "module.exports = { fn1, fn2 } for named exports. const { fn } = require('./path') to consume.",
    feedback_wrong: "module.exports = { add, multiply }  |  const { add } = require('./module')",
    expected: "CommonJS module.exports and require",
  },
  {
    id: "step5", type: "question", phase: "Step 5 of 5",
    paal: "Show the ESM ↔ CJS interop rules: importing CJS from ESM, and why you can't require() an ESM module.",
    answer_keywords: ["interop", "createRequire", "esm", "cjs", "default"],
    seed_code: `// Step 5: ESM ↔ CJS interop in Node.js

// ── In an ESM file (.mjs or package.json "type":"module") ────

// ✅ You CAN import CJS from ESM:
import lodash from 'lodash'           // CJS default export becomes ESM default
import { merge } from 'lodash'        // named CJS exports also work (Node 12+)

// ✅ require() inside ESM using createRequire:
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const data = require('./legacy.cjs')

// ── In a CJS file (.cjs or no "type":"module") ───────────────

// ❌ You CANNOT require() an ESM file:
// const mod = require('./modern.mjs')   // Error: require() of ES Module

// ✅ You CAN dynamically import ESM from CJS:
async function loadESM() {
  const { default: myModule } = await import('./modern.mjs')
  return myModule
}

// ── Key interop rule ─────────────────────────────────────────
// ESM → CJS: ✅ import works, CJS .default is the whole module.exports
// CJS → ESM: ❌ require() fails; must use dynamic import()
// Best practice: ship packages as ESM with CJS fallback ("dual package")

export { loadESM }`,
    feedback_correct: "✅ ESM can import CJS. CJS cannot require() ESM — must use dynamic import(). This trips everyone up.",
    feedback_partial: "import CJSpkg works. require('./esm') throws. Use import() for async ESM loading from CJS.",
    feedback_wrong: "CJS→ESM: const { default: x } = await import('./mod.mjs')  |  ESM→CJS: import x from 'cjspkg'",
    expected: "ESM/CJS interop rules",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Named vs default", id: "step1" },
  { label: "Step 2 — Barrel files", id: "step2" },
  { label: "Step 3 — Dynamic import", id: "step3" },
  { label: "Step 4 — CommonJS", id: "step4" },
  { label: "Step 5 — ESM/CJS interop", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: "JS-F06", title: "Modules — ESM & CJS", shortName: "JS — MODULES" });
