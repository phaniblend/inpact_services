import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "PRODUCTION ENGINEERING #1",
      title: "Observability — Logs, Metrics & Traces",
      body: `"Observability is the ability to understand what a system
is doing from the outside, without modifying it."

The Three Pillars:
  Logs    — what happened (events, errors, context)
  Metrics — how the system is performing (numbers over time)
  Traces  — how a request moved through your system

Without observability you are flying blind in production.
With it, you can answer:
  "Why was p99 latency 8s at 3am last Tuesday?"
  "Which service caused the error cascade?"
  "What was the exact state when this user's request failed?"

Senior engineers instrument their code as they write it.
They don't wait for something to break.`,
      usecase: `Every production incident. Every performance investigation. Every "a user is reporting errors but I can't reproduce it" ticket. Observability is what turns 6-hour outages into 15-minute fixes.`,
    },
  },
  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Write structured logs (JSON) with correct log levels and context",
      "Avoid the top 5 logging mistakes: sensitive data, missing context, wrong level",
      "Instrument code with RED metrics: Rate, Errors, Duration",
      "Add distributed tracing with OpenTelemetry",
      "Define SLIs, SLOs, and error budgets",
      "Build a structured logging middleware for Express",
    ],
  },
  {
    id: "step1", type: "question", phase: "Step 1 of 5",
    paal: "Write structured JSON logs with correct levels, correlation IDs, and context. Show what NOT to log.",
    answer_keywords: ["structured", "json", "log level", "correlation", "context", "pino"],
    seed_code: `// Step 1: structured logging with Pino

import pino from 'pino'

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  // In production: output JSON (machine-readable)
  // In development: use pino-pretty for human-readable
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty' }
    : undefined,
})

// ── LOG LEVELS ────────────────────────────────────────────────
// trace  — very detailed (loops, per-item)  [dev only]
// debug  — diagnostic info                  [dev/staging]
// info   — normal events (request handled)  [production]
// warn   — unexpected but recoverable       [production]
// error  — errors that need attention       [production]
// fatal  — system cannot continue           [production]

// ── STRUCTURED (GOOD) vs UNSTRUCTURED (BAD) ──────────────────
// ❌ BAD — unstructured string:
logger.info(\`User 123 logged in from 192.168.1.1 at 2024-03-15\`)
// Hard to query, parse, or alert on. Just a blob of text.

// ✅ GOOD — structured JSON:
logger.info({
  event:     'user.login',
  userId:    123,
  ip:        '192.168.1.1',
  userAgent: req.headers['user-agent'],
  requestId: req.id,     // correlation ID — traces this request everywhere
  duration:  45,         // ms
}, 'User logged in')

// ── WHAT NOT TO LOG ───────────────────────────────────────────
// ❌ Passwords, tokens, API keys, credit card numbers
// ❌ PII without masking (emails, SSNs, health data)
// ❌ Full request/response bodies (may contain secrets)
// ❌ Encryption keys or secrets
// ❌ High-cardinality data in log messages (unique IDs are fine as fields,
//    not as part of message string — breaks log aggregation)

// ── CONTEXT PROPAGATION ───────────────────────────────────────
function createRequestLogger(req) {
  return logger.child({
    requestId:  req.id,
    userId:     req.user?.id,
    method:     req.method,
    path:       req.path,
    // Every log from this child has these fields automatically
  })
}

export { logger, createRequestLogger }`,
    feedback_correct: "✅ Structured JSON logs with consistent fields. Child loggers propagate context. Never log PII, tokens, or secrets.",
    feedback_partial: "Log JSON objects not strings. Include requestId for correlation. Use child loggers for request context.",
    feedback_wrong: "logger.info({ event, userId, requestId, duration }, 'message') — structured fields, not interpolated strings",
    expected: "Structured logging with Pino",
  },
  {
    id: "step2", type: "question", phase: "Step 2 of 5",
    paal: "Instrument an Express API with RED metrics: Request Rate, Error rate, Duration (latency histogram).",
    answer_keywords: ["red", "rate", "errors", "duration", "histogram", "counter", "prometheus"],
    seed_code: `// Step 2: RED metrics with prom-client (Prometheus)

import { Counter, Histogram, register } from 'prom-client'

// ── RED METRICS ───────────────────────────────────────────────
// Rate     = requests per second
// Errors   = error rate (% of requests that fail)
// Duration = latency distribution (p50, p95, p99)

// REQUEST COUNTER — rate and error rate:
const httpRequestsTotal = new Counter({
  name:    'http_requests_total',
  help:    'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
})

// LATENCY HISTOGRAM — duration distribution:
const httpRequestDuration = new Histogram({
  name:    'http_request_duration_seconds',
  help:    'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  // Buckets represent latency thresholds — tune for your SLOs
})

// ── EXPRESS MIDDLEWARE ─────────────────────────────────────────
function metricsMiddleware(req, res, next) {
  const start = process.hrtime.bigint()

  res.on('finish', () => {
    const duration = Number(process.hrtime.bigint() - start) / 1e9  // to seconds
    const route    = req.route?.path ?? req.path  // use Express route pattern not raw URL
    const labels   = {
      method:      req.method,
      route,                            // '/users/:id' not '/users/123' (cardinality!)
      status_code: res.statusCode,
    }

    httpRequestsTotal.inc(labels)
    httpRequestDuration.observe(labels, duration)
  })

  next()
}

// Expose metrics endpoint for Prometheus to scrape:
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType)
  res.end(await register.metrics())
})

app.use(metricsMiddleware)

/*
KEY INSIGHT — use route patterns not raw URLs:
  ❌ route: '/users/123'  → high cardinality (millions of unique values)
  ✅ route: '/users/:id'  → low cardinality (bounded set of route patterns)
  High cardinality labels kill Prometheus performance.
*/

export { metricsMiddleware }`,
    feedback_correct: "✅ Counter for rate+errors, Histogram for latency. Use route patterns not raw URLs — cardinality is the Prometheus killer.",
    feedback_partial: "RED: Counter (requests_total with status_code label), Histogram (duration_seconds). Labels must be low-cardinality.",
    feedback_wrong: "Counter for request rate/errors. Histogram for latency buckets. Labels: method, route_pattern, status_code.",
    expected: "RED metrics with Prometheus",
  },
  {
    id: "step3", type: "question", phase: "Step 3 of 5",
    paal: "Add distributed tracing with OpenTelemetry. Show how a trace spans across HTTP → service → DB and reveals exactly where time is spent.",
    answer_keywords: ["opentelemetry", "trace", "span", "context propagation", "trace-id"],
    seed_code: `// Step 3: distributed tracing with OpenTelemetry

import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { trace, context, SpanStatusCode } from '@opentelemetry/api'

// Initialise once at app startup (auto-instruments HTTP, DB, Redis):
const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({ url: process.env.OTEL_EXPORTER_URL }),
  instrumentations: [getNodeAutoInstrumentations()],
})
sdk.start()

// ── MANUAL SPAN — wrap any operation you want to measure ──────
const tracer = trace.getTracer('my-service', '1.0.0')

async function getUserWithOrders(userId) {
  // Create a parent span for this logical operation:
  return tracer.startActiveSpan('getUserWithOrders', async (span) => {
    try {
      span.setAttributes({ 'user.id': userId })

      // DB call — auto-instrumented (creates child span automatically):
      const user = await db.query('SELECT * FROM users WHERE id=$1', [userId])

      span.addEvent('user-fetched')  // breadcrumb inside the span

      // Nested manual span for complex business logic:
      const orders = await tracer.startActiveSpan('fetchOrderHistory', async (childSpan) => {
        childSpan.setAttributes({ 'orders.userId': userId })
        const result = await db.query('SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC LIMIT 10', [userId])
        childSpan.setAttributes({ 'orders.count': result.length })
        childSpan.end()
        return result
      })

      span.setStatus({ code: SpanStatusCode.OK })
      return { user, orders }
    } catch (err) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: err.message })
      span.recordException(err)
      throw err
    } finally {
      span.end()   // ALWAYS end spans
    }
  })
}

/*
THE TRACE REVEALS:
  getUserWithOrders [250ms total]
    ├── pg.query: SELECT users   [12ms]
    ├── fetchOrderHistory [230ms]  ← slow! investigate here
    │    └── pg.query: SELECT orders [228ms]  ← N+1 or missing index?
    └── [8ms overhead]

  Without tracing: "the endpoint is slow"
  With tracing:    "the orders query is slow — add index on user_id"
*/

export { getUserWithOrders }`,
    feedback_correct: "✅ OpenTelemetry spans reveal exactly where time is spent across services. Auto-instrumentation handles HTTP/DB. Manual spans for business logic.",
    feedback_partial: "tracer.startActiveSpan('name', async (span) => { ... span.end() }). Set attributes, add events, record exceptions.",
    feedback_wrong: "tracer.startActiveSpan wraps operations. span.setAttributes for metadata. span.end() always. Auto-instruments DB/HTTP.",
    expected: "Distributed tracing with OpenTelemetry",
  },
  {
    id: "step4", type: "question", phase: "Step 4 of 5",
    paal: "Define SLIs, SLOs, and error budgets. Write the SLO policy for a user-facing API and calculate when the error budget is exhausted.",
    answer_keywords: ["sli", "slo", "sla", "error budget", "availability", "p99"],
    seed_code: `// Step 4: SLIs, SLOs, and error budgets

/*
─── DEFINITIONS ──────────────────────────────────────────────────
SLI (Service Level Indicator): A METRIC that measures service quality
  Examples: availability, latency, error rate, throughput

SLO (Service Level Objective): A TARGET value for an SLI
  Examples: 99.9% availability, p99 latency < 500ms, error rate < 0.1%

SLA (Service Level Agreement): A CONTRACT with a customer
  (SLA includes consequences — SLO is the internal target, usually higher)

Error Budget: 100% - SLO target = allowed failure budget
  99.9% SLO → 0.1% error budget = 43.8 minutes/month of downtime allowed

─── EXAMPLE SLO POLICY ───────────────────────────────────────────

Service: User-facing API
Measurement window: 30-day rolling

SLO 1 — AVAILABILITY
  SLI: % of requests returning 2xx or 4xx (excludes 5xx)
  SLO: 99.9%
  Error budget: 0.1% = 43.8 min/month
  Breach: if 5xx rate > 0.1% sustained over 5 min → page on-call

SLO 2 — LATENCY (p99)
  SLI: 99th percentile response time for /api/* endpoints
  SLO: p99 < 500ms
  Error budget: 1% of requests may exceed 500ms
  Breach: if p99 > 500ms for 10+ minutes → page on-call

SLO 3 — ERROR RATE
  SLI: % of non-4xx requests that return 5xx
  SLO: < 0.5%
  Error budget: 5 per 1000 requests may fail
*/

// Calculate error budget burn rate:
function calculateBurnRate({ currentErrorRate, sloTarget, windowDays = 30 }) {
  const errorBudget  = 1 - sloTarget          // e.g. 0.001 for 99.9% SLO
  const burnRate     = currentErrorRate / errorBudget
  const budgetUsed   = currentErrorRate / errorBudget  // ratio
  const hoursLeft    = (windowDays * 24) * (1 - budgetUsed)

  return {
    burnRate: burnRate.toFixed(2),      // 1.0 = burning at exactly SLO rate
    budgetUsedPct: (budgetUsed * 100).toFixed(1),
    hoursRemainingInWindow: Math.max(0, hoursLeft).toFixed(1),
    alert: burnRate > 14.4,             // 14.4x burn = 100% budget in 2 hours (Google rule)
  }
}

calculateBurnRate({ currentErrorRate: 0.005, sloTarget: 0.999 })
// burnRate: 5.0 — burning 5× faster than allowed
// budgetUsedPct: 500% — already blown the month's budget!
// alert: true

export { calculateBurnRate }`,
    feedback_correct: "✅ SLI=metric, SLO=target, Error Budget=100%-SLO. Burn rate >14.4x = 2-hour alert. This is how Google SRE thinks about reliability.",
    feedback_partial: "SLI: what you measure. SLO: your target. Error budget: 100%-SLO. Burn rate: current rate / budget rate.",
    feedback_wrong: "Error budget = 1 - SLO. Burn rate = currentErrorRate / errorBudget. Alert at 14.4x burn (exhausts budget in 2 hours).",
    expected: "SLI, SLO, error budgets",
  },
  {
    id: "step5", type: "question", phase: "Step 5 of 5",
    paal: "Build a structured logging Express middleware that adds request ID, duration, user context, and logs at the right level based on status code.",
    answer_keywords: ["middleware", "request id", "duration", "correlation", "log level", "express"],
    seed_code: `// Step 5: production logging middleware

import pino from 'pino'
import { randomUUID } from 'crypto'

const logger = pino({ level: process.env.LOG_LEVEL || 'info' })

function requestLoggingMiddleware(req, res, next) {
  // Assign a correlation ID — propagate from upstream if present:
  req.id = req.headers['x-request-id'] || randomUUID()
  res.setHeader('X-Request-Id', req.id)

  // Create a child logger with request context baked in:
  req.log = logger.child({
    requestId: req.id,
    method:    req.method,
    path:      req.path,
    userId:    req.user?.id,
    ip:        req.ip,
  })

  const start = process.hrtime.bigint()

  // Log incoming request:
  req.log.debug({ event: 'request.received' }, 'Incoming request')

  // Intercept response finish:
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6

    const logData = {
      event:      'request.completed',
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs),
      bytes:      res.get('Content-Length'),
    }

    // Choose log level based on outcome:
    if (res.statusCode >= 500) {
      req.log.error(logData, 'Request failed (server error)')
    } else if (res.statusCode >= 400) {
      req.log.warn(logData, 'Request failed (client error)')
    } else if (durationMs > 2000) {
      req.log.warn({ ...logData, slow: true }, 'Slow request')
    } else {
      req.log.info(logData, 'Request completed')
    }
  })

  next()
}

// Usage:
// app.use(requestLoggingMiddleware)
// Then in any handler: req.log.info({ orderId }, 'Order created')
// Every log from that handler automatically has requestId, userId, etc.

export { requestLoggingMiddleware }`,
    feedback_correct: "✅ Request ID propagated and returned. Child logger carries context. Level chosen by status: 5xx=error, 4xx=warn, slow=warn, OK=info.",
    feedback_partial: "req.id = x-request-id or UUID. req.log = logger.child({requestId, userId}). res.on('finish') logs with duration and status.",
    feedback_wrong: "logger.child({ requestId, userId, method, path }) | res.on('finish') | 5xx→error, 4xx→warn, slow→warn, OK→info",
    expected: "Express logging middleware",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Structured logs", id: "step1" },
  { label: "Step 2 — RED metrics", id: "step2" },
  { label: "Step 3 — Distributed traces", id: "step3" },
  { label: "Step 4 — SLI / SLO", id: "step4" },
  { label: "Step 5 — Log middleware", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: "PE-01", title: "Observability — Logs, Metrics & Traces", shortName: "PE — OBSERVABILITY" });
