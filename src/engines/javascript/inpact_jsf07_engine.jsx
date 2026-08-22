import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "JS FUNDAMENTALS #7",
      title: "Error Handling & Debugging",
      body: `Errors in production are inevitable. How you handle them
determines whether your app crashes silently or recovers gracefully.

try/catch/finally  — synchronous and async error trapping
Custom error classes — typed errors with context
Error boundaries    — preventing uncaught rejections
Global handlers     — process.on('unhandledRejection') in Node
Debugging tools     — console patterns, debugger, source maps

The most dangerous error in JS isn't the one that throws —
it's the silent failure where a Promise rejects and
nobody catches it.`,
      usecase: `Every production app needs a layered error strategy: throw descriptive custom errors, catch at the right level, log with context, and always handle Promise rejections. This is the difference between a 3am page and a graceful degradation.`,
    },
  },
  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Use try/catch/finally for sync and async code",
      "Create custom Error subclasses with type and context",
      "Catch errors at the right boundary — not too early, not too late",
      "Handle unhandled Promise rejections globally",
      "Use console.error / console.table / console.time effectively",
      "Understand error propagation in async call stacks",
    ],
  },
  {
    id: "step1", type: "question", phase: "Step 1 of 5",
    paal: "Write try/catch/finally for both sync and async code. Show how errors propagate up the call stack.",
    answer_keywords: ["try", "catch", "finally", "throw", "async"],
    seed_code: `// Step 1: try/catch/finally — sync and async

// Synchronous:
function parseJSON(str) {
  try {
    return JSON.parse(str)
  } catch (err) {
    console.error('Parse failed:', err.message)
    return null   // recover with a safe default
  } finally {
    console.log('parseJSON called')  // always runs — cleanup goes here
  }
}

// Async — await means rejections become catchable exceptions:
async function fetchUser(id) {
  try {
    const res = await fetch(\`/api/users/\${id}\`)
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
    return await res.json()
  } catch (err) {
    // Catches both network errors AND the manual throw above
    console.error('fetchUser failed:', err.message)
    throw err   // re-throw to let callers decide how to handle
  } finally {
    // Good for: hide loading spinner, release locks, close connections
    console.log('fetch complete (success or failure)')
  }
}

// Re-throwing is important — don't swallow errors silently:
// catch (err) { return null }  ← hides bugs from callers

export { parseJSON, fetchUser }`,
    feedback_correct: "✅ finally always runs — perfect for cleanup. Re-throw if the caller needs to know.",
    feedback_partial: "try → happy path. catch(err) → handle/rethrow. finally → always cleanup.",
    feedback_wrong: "try { await fn() } catch (e) { /* handle */ } finally { /* cleanup */ }",
    expected: "try/catch/finally sync and async",
  },
  {
    id: "step2", type: "question", phase: "Step 2 of 5",
    paal: "Create custom Error subclasses: ValidationError, NotFoundError, UnauthorizedError — each with extra context fields.",
    answer_keywords: ["class", "extends error", "super", "custom", "instanceof"],
    seed_code: `// Step 2: custom Error classes — typed, contextual errors

class AppError extends Error {
  constructor(message, options = {}) {
    super(message)
    this.name = this.constructor.name   // 'ValidationError', not 'Error'
    this.statusCode = options.statusCode ?? 500
    this.context = options.context ?? {}
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)  // cleaner stack in Node
    }
  }
}

class ValidationError extends AppError {
  constructor(field, message) {
    super(message, { statusCode: 400, context: { field } })
    this.field = field
  }
}

class NotFoundError extends AppError {
  constructor(resource, id) {
    super(\`\${resource} with id \${id} not found\`, { statusCode: 404 })
    this.resource = resource
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, { statusCode: 401 })
  }
}

// Usage in an Express handler:
function getUser(id) {
  if (!id) throw new ValidationError('id', 'ID is required')
  const user = null  // pretend DB miss
  if (!user) throw new NotFoundError('User', id)
  return user
}

// Catch and differentiate:
try {
  getUser(null)
} catch (err) {
  if (err instanceof ValidationError) console.log('Bad input:', err.field)
  else if (err instanceof NotFoundError) console.log('Missing:', err.resource)
  else throw err   // re-throw unknown errors
}

export { AppError, ValidationError, NotFoundError, UnauthorizedError }`,
    feedback_correct: "✅ Custom errors make instanceof checks possible — catch the right type, rethrow the rest.",
    feedback_partial: "class MyError extends Error { constructor(...) { super(msg); this.name = ... } }",
    feedback_wrong: "class ValidationError extends Error — sets name, statusCode, context for rich error handling.",
    expected: "Custom Error subclasses",
  },
  {
    id: "step3", type: "question", phase: "Step 3 of 5",
    paal: "Handle unhandled Promise rejections globally in both browser and Node.js. Explain why unhandled rejections crash Node 15+ apps.",
    answer_keywords: ["unhandledrejection", "process.on", "window", "uncaughtexception"],
    seed_code: `// Step 3: global error and rejection handlers

// ── Browser ──────────────────────────────────────────────────
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise rejection:', event.reason)
  // event.promise — the Promise that rejected
  // event.reason  — the rejection value (usually an Error)
  event.preventDefault()  // stops browser console warning
  // Send to error tracking (Sentry, Datadog, etc.)
})

window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error)
  // Catches synchronous uncaught throws
})

// ── Node.js ──────────────────────────────────────────────────
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  // In Node 15+, this crashes the process by default (correct behavior!)
  // Always add this handler and call process.exit(1) after logging:
  process.exit(1)
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
  process.exit(1)   // MUST exit — process state is unpredictable after this
})

// ── Why Node 15+ crashes on unhandled rejections ─────────────
// Before 15: silently ignored — bugs hidden in production ❌
// After  15: crashes the process — forces you to handle every rejection ✅
// The correct fix: always .catch() or await in try/catch

export {}`,
    feedback_correct: "✅ Global handlers are your last safety net. Node 15+ crashing on unhandled rejections is a feature, not a bug.",
    feedback_partial: "Browser: unhandledrejection event. Node: process.on('unhandledRejection'). Both: log then exit/report.",
    feedback_wrong: "process.on('unhandledRejection', handler)  |  window.addEventListener('unhandledrejection', handler)",
    expected: "Global unhandled rejection handlers",
  },
  {
    id: "step4", type: "question", phase: "Step 4 of 5",
    paal: "Use console.group, console.table, console.time, and console.trace for structured debugging.",
    answer_keywords: ["console.table", "console.time", "console.group", "console.trace"],
    seed_code: `// Step 4: beyond console.log — structured debugging

const users = [
  { id: 1, name: 'Alice', role: 'admin',  score: 92 },
  { id: 2, name: 'Bob',   role: 'editor', score: 78 },
  { id: 3, name: 'Carol', role: 'viewer', score: 88 },
]

// console.table — renders arrays/objects as a table:
console.table(users)             // beautiful table in DevTools
console.table(users, ['name', 'score'])  // only those columns

// console.group — collapsible nested groups:
console.group('User Processing')
  users.forEach(u => {
    console.groupCollapsed(\`User \${u.id}: \${u.name}\`)
      console.log('Role:', u.role)
      console.log('Score:', u.score)
    console.groupEnd()
  })
console.groupEnd()

// console.time / timeEnd — measure execution:
console.time('sort-users')
const sorted = [...users].sort((a, b) => b.score - a.score)
console.timeEnd('sort-users')  // "sort-users: 0.123ms"

// console.trace — prints full call stack at that point:
function deepFunction() {
  console.trace('How did we get here?')
}

// console.assert — only logs if condition is false:
console.assert(users.length > 0, 'Expected at least one user')

export { sorted }`,
    feedback_correct: "✅ console.table, .group, .time, .trace are massively underused — they cut debugging time in half.",
    feedback_partial: "table for arrays, group for nesting, time/timeEnd for perf, trace for stack inspection.",
    feedback_wrong: "console.table(arr)  |  console.time('label') ... console.timeEnd('label')",
    expected: "Structured console debugging",
  },
  {
    id: "step5", type: "question", phase: "Step 5 of 5",
    paal: "Implement an error boundary pattern for async operations: a wrapper that catches, classifies, logs, and returns a structured result.",
    answer_keywords: ["wrapper", "catch", "classify", "result", "boundary"],
    seed_code: `// Step 5: error boundary wrapper — the production pattern

import { ValidationError, NotFoundError, AppError } from './errors.js'

// Wrap any async operation — returns [error, result] tuple (Go-style):
async function tryCatch(fn) {
  try {
    const result = await fn()
    return [null, result]
  } catch (err) {
    return [err, null]
  }
}

// Central error handler — classifies and logs:
function handleError(err, context = {}) {
  const isKnown = err instanceof AppError

  const log = {
    name: err.name,
    message: err.message,
    statusCode: err.statusCode ?? 500,
    context: { ...err.context, ...context },
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  }

  if (isKnown) console.warn('[AppError]', log)
  else console.error('[UnexpectedError]', log)

  // Report unknown errors to Sentry / Datadog:
  if (!isKnown) reportToMonitoring(log)

  return log
}

// Usage:
async function loadProfile(userId) {
  const [err, user] = await tryCatch(() => fetchUser(userId))
  if (err) {
    const handled = handleError(err, { userId })
    return { error: handled }
  }
  return { data: user }
}

function reportToMonitoring(log) { /* Sentry.captureException(...) */ }
async function fetchUser(id) { return { id, name: 'Alice' } }

export { tryCatch, handleError, loadProfile }`,
    feedback_correct: "✅ tryCatch wrapper + central handler = the production error architecture. Classify, log, report.",
    feedback_partial: "async function tryCatch(fn) { try { return [null, await fn()] } catch(e) { return [e, null] } }",
    feedback_wrong: "return [null, result] on success; return [error, null] on failure — Go-style tuple.",
    expected: "Production error boundary wrapper",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — try/catch/finally", id: "step1" },
  { label: "Step 2 — Custom errors", id: "step2" },
  { label: "Step 3 — Global handlers", id: "step3" },
  { label: "Step 4 — Console tools", id: "step4" },
  { label: "Step 5 — Error boundary", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: "JS-F07", title: "Error Handling & Debugging", shortName: "JS — ERRORS" });
