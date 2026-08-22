import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "PRODUCTION ENGINEERING #2",
      title: "Incident Response & Reliability Engineering",
      body: `Production will break. The question is how fast you recover
and whether it breaks the same way twice.

Senior engineers treat incidents as a lifecycle:
  Detect   → alert fires before users notice
  Respond  → on-call gets paged, incident declared
  Mitigate → reduce blast radius, restore service
  Resolve  → root cause fixed
  Review   → blameless post-mortem, action items

Reliability patterns that prevent incidents:
  Circuit breakers — stop cascading failures
  Retries with backoff — handle transient errors
  Bulkheads — isolate failures to one component
  Health checks — catch issues before load balancer routes traffic in
  Feature flags — kill switch for bad deployments`,
      usecase: `Every senior engineer is on-call eventually. Knowing how to run an incident, write a post-mortem, and build resilient systems is what separates a senior from a staff engineer.`,
    },
  },
  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Run an incident: detect, declare, communicate, mitigate, resolve",
      "Write a blameless post-mortem with 5 Whys root cause analysis",
      "Implement a circuit breaker to stop cascading failures",
      "Implement retry with exponential backoff and jitter",
      "Design health check endpoints (liveness vs readiness)",
      "Use feature flags as kill switches for dangerous deployments",
    ],
  },
  {
    id: "step1", type: "question", phase: "Step 1 of 5",
    paal: "Walk through an incident lifecycle: alert → triage → communication → mitigation → resolution. Show the runbook pattern.",
    answer_keywords: ["incident", "triage", "mitigate", "runbook", "communication", "severity"],
    seed_code: `// Step 1: incident response lifecycle

/*
─── SEVERITY LEVELS ──────────────────────────────────────────────
SEV-1: Complete outage. All users affected. Page everyone.
       Target: mitigate in 15 min, resolve in 60 min
SEV-2: Significant degradation. Many users affected. Page on-call.
       Target: mitigate in 30 min, resolve in 4 hours
SEV-3: Minor impact. Small % of users. Fix next business day.
SEV-4: Cosmetic/informational. Ticket in backlog.

─── THE INCIDENT TIMELINE ────────────────────────────────────────
T+0:00  Alert fires: "Error rate on /api/payments > 5% for 5 minutes"
T+0:02  On-call acknowledges, begins triage
T+0:05  Incident declared SEV-2. Incident commander assigned.
T+0:07  Status page updated: "We are investigating payment issues"
T+0:10  Root cause identified: upstream payment provider timeout
T+0:12  Mitigation: enable fallback payment processor via feature flag
T+0:15  Error rate drops to <0.1% — service restored
T+0:20  Status page updated: "Issue resolved"
T+0:30  Team notified. Post-mortem scheduled for next day.

─── COMMUNICATION TEMPLATE ──────────────────────────────────────
Every 15-30 minutes during an incident:

"[TIME] UPDATE: We are experiencing [brief description].
Impact: [who is affected and how].
Current status: [what we're doing right now].
Next update in: [X minutes]."

─── RUNBOOK STRUCTURE ───────────────────────────────────────────
*/

const runbook = {
  alert: 'payment_error_rate_high',
  description: 'Payment endpoint error rate > 2% for 5 minutes',
  severity: 'SEV-2',
  steps: [
    '1. Check Datadog: payment service error rate and latency graphs',
    '2. Check upstream: GET https://status.stripe.com — is Stripe degraded?',
    '3. Check recent deploys: was anything deployed in the last hour?',
    '4. If Stripe down: enable FALLBACK_PROCESSOR feature flag in LaunchDarkly',
    '5. If recent deploy caused it: roll back via: kubectl rollout undo deploy/payments',
    '6. If unknown: escalate to payments team lead',
  ],
  rollback: 'kubectl rollout undo deployment/payments-service',
  contacts: ['@payments-team', '@on-call-engineer'],
  escalation: 'If not mitigated in 15 min → page engineering manager',
}

export { runbook }`,
    feedback_correct: "✅ Severity levels, 15-min communication cadence, runbook with concrete steps. Incidents need a commander, not everyone talking at once.",
    feedback_partial: "Declare severity. Assign incident commander. Update status page. Runbook = ordered checklist. Communicate every 15-30 min.",
    feedback_wrong: "SEV-1/2/3/4 levels. Status page update immediately. Runbook: check dashboards → check upstream → mitigation → escalation.",
    expected: "Incident lifecycle and runbook",
  },
  {
    id: "step2", type: "question", phase: "Step 2 of 5",
    paal: "Write a blameless post-mortem. Use 5 Whys to find root cause. Show action items that prevent recurrence — not blame.",
    answer_keywords: ["post-mortem", "blameless", "5 whys", "root cause", "action items", "contributing factors"],
    seed_code: `// Step 2: blameless post-mortem structure

/*
─── BLAMELESS CULTURE ────────────────────────────────────────────
Engineers make mistakes. Systems should be designed so that
single mistakes don't cause outages. The goal is to fix the
SYSTEM, not punish the PERSON.

"A well-designed system is resilient to individual human errors.
 If a person's mistake causes an outage, the system failed — not the person."

─── POST-MORTEM TEMPLATE ─────────────────────────────────────────

INCIDENT: Payment service outage
DATE: 2024-03-15
DURATION: 23 minutes (14:32 – 14:55 UTC)
SEVERITY: SEV-2
AUTHOR: [name]

IMPACT:
  - 4,200 payment requests failed (12% of requests during window)
  - Estimated revenue impact: ~$42,000
  - 340 users received error messages

TIMELINE:
  14:29 - Deploy of payments-service v2.3.1 began
  14:32 - Error rate climbed above 2% threshold
  14:34 - Alert fired. On-call acknowledged.
  14:38 - Identified new DB query introduced in v2.3.1 missing index
  14:42 - Rollback initiated
  14:55 - Error rate returned to baseline

ROOT CAUSE (5 WHYS):
  Why did payments fail?
    → DB query timing out (p99 > 30s)
  Why was the query slow?
    → Missing index on payments.user_id
  Why was the index missing?
    → Migration ran but index creation was missing from migration file
  Why was the missing index not caught?
    → No staging load test — only functional tests run
  Why no load test?
    → Staging environment has 100x less data than production
  ROOT CAUSE: Staging data volume too small to reveal query performance issues

CONTRIBUTING FACTORS:
  - No query performance review in code review process
  - No automated slow query detection in CI pipeline
  - Rollback procedure took 3 min longer than expected (manual step needed)

ACTION ITEMS: (each has an owner and due date)
  1. Add EXPLAIN ANALYZE check in CI for new migrations [owner: @alice, due: 2024-03-22]
  2. Seed staging with production-scale data (anonymised) [owner: @bob, due: 2024-04-01]
  3. Automate rollback — remove manual step [owner: @carol, due: 2024-03-29]
  4. Add DB query duration alert (p99 > 1s) [owner: @dave, due: 2024-03-22]
*/

export const postMortemTemplate = {
  sections: ['impact', 'timeline', '5whys', 'contributing_factors', 'action_items'],
  rulesOfBlamelessness: [
    'No individual blame — find system failures',
    'Action items fix systems, not punish people',
    'Share widely — learning > secrecy',
    'Every action item has owner + due date',
  ],
}`,
    feedback_correct: "✅ 5 Whys finds the real root cause (staging data size), not the proximate cause (missing index). Action items fix systems.",
    feedback_partial: "5 Whys: keep asking why until you hit a systemic root cause. Action items must be concrete, owned, and dated.",
    feedback_wrong: "5 Whys → root cause is usually a process/system gap. Action items: CI check, staging data, automate rollback.",
    expected: "Blameless post-mortem with 5 Whys",
  },
  {
    id: "step3", type: "question", phase: "Step 3 of 5",
    paal: "Implement a circuit breaker to stop cascading failures when a downstream service is slow or down.",
    answer_keywords: ["circuit breaker", "open", "closed", "half-open", "failure threshold", "timeout"],
    seed_code: `// Step 3: circuit breaker — stops cascading failures

/*
THE PROBLEM WITHOUT CIRCUIT BREAKER:
  Payment service is slow (10s timeout).
  API gateway waits 10s for each request.
  Threads pile up waiting.
  Memory exhausted.
  API gateway dies too. ← cascade failure

CIRCUIT BREAKER STATES:
  CLOSED  → normal operation, requests pass through
  OPEN    → too many failures, requests fail immediately (no waiting)
  HALF-OPEN → after timeout, try one request — if success: CLOSED, if fail: OPEN
*/

class CircuitBreaker {
  constructor(fn, {
    failureThreshold = 5,    // failures before opening
    successThreshold = 2,    // successes in half-open to close
    timeout = 60_000,        // ms to stay open before trying half-open
    callTimeout = 3_000,     // ms to wait for the wrapped function
  } = {}) {
    this.fn = fn
    this.failureThreshold = failureThreshold
    this.successThreshold = successThreshold
    this.timeout = timeout
    this.callTimeout = callTimeout

    this.state = 'CLOSED'
    this.failures = 0
    this.successes = 0
    this.lastFailureTime = null
  }

  async call(...args) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF-OPEN'  // try again
      } else {
        throw new Error('Circuit breaker OPEN — service unavailable')
      }
    }

    try {
      const result = await Promise.race([
        this.fn(...args),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Call timeout')), this.callTimeout)
        ),
      ])
      this.onSuccess()
      return result
    } catch (err) {
      this.onFailure()
      throw err
    }
  }

  onSuccess() {
    this.failures = 0
    if (this.state === 'HALF-OPEN') {
      this.successes++
      if (this.successes >= this.successThreshold) {
        this.state = 'CLOSED'
        this.successes = 0
      }
    }
  }

  onFailure() {
    this.failures++
    this.lastFailureTime = Date.now()
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN'
    }
  }
}

// Usage:
const paymentCircuit = new CircuitBreaker(callPaymentService, {
  failureThreshold: 5,
  timeout: 30_000,
  callTimeout: 3_000,
})

async function processPayment(data) {
  try {
    return await paymentCircuit.call(data)
  } catch (err) {
    if (err.message.includes('Circuit breaker OPEN')) {
      return { status: 'queued', message: 'Payment queued for retry' }
    }
    throw err
  }
}

export { CircuitBreaker }`,
    feedback_correct: "✅ CLOSED→OPEN on N failures. OPEN rejects immediately (no waiting). HALF-OPEN after timeout probes recovery. Stops cascade failures.",
    feedback_partial: "3 states: CLOSED (normal), OPEN (fail fast), HALF-OPEN (test recovery). Fail fast beats waiting 10s for a dead service.",
    feedback_wrong: "OPEN state: throw immediately instead of waiting. After timeout: HALF-OPEN. On success: CLOSED. On failure: back to OPEN.",
    expected: "Circuit breaker implementation",
  },
  {
    id: "step4", type: "question", phase: "Step 4 of 5",
    paal: "Implement retry with exponential backoff and jitter. Explain why jitter prevents the thundering herd on retry storms.",
    answer_keywords: ["retry", "exponential", "backoff", "jitter", "max attempts", "transient"],
    seed_code: `// Step 4: retry with exponential backoff and jitter

async function retryWithBackoff(fn, {
  maxAttempts = 3,
  baseDelayMs = 1000,    // start at 1 second
  maxDelayMs  = 30_000,  // cap at 30 seconds
  jitter      = true,    // randomise to prevent thundering herd
  retryOn     = (err) => true,  // which errors are retryable
} = {}) {
  let lastError

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err

      // Don't retry non-transient errors (e.g. 400 Bad Request):
      if (!retryOn(err) || attempt === maxAttempts) throw err

      // Exponential backoff: 1s, 2s, 4s, 8s... capped at maxDelay:
      const exponential = Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs)

      // Full jitter: random between 0 and exponential delay
      // Prevents all retrying clients from hitting at the same moment:
      const delay = jitter
        ? Math.random() * exponential
        : exponential

      console.log(\`Attempt \${attempt} failed. Retrying in \${Math.round(delay)}ms...\`)
      await new Promise(r => setTimeout(r, delay))
    }
  }

  throw lastError
}

// Usage — only retry transient errors, not client errors:
async function fetchUserSafe(userId) {
  return retryWithBackoff(
    () => fetch(\`/api/users/\${userId}\`).then(r => r.json()),
    {
      maxAttempts: 3,
      baseDelayMs: 500,
      retryOn: (err) => {
        // Retry on network errors and 5xx, NOT on 4xx:
        if (err.status >= 400 && err.status < 500) return false  // client error — don't retry
        return true  // network error or 5xx — retry
      }
    }
  )
}

/*
─── WHY JITTER MATTERS ───────────────────────────────────────────
WITHOUT jitter: 1000 clients all fail at T+0. All retry at T+1000ms.
  → 1000 simultaneous retries slam the recovering service. It dies again.
  → Retry storm / thundering herd

WITH jitter: retries spread across 0-1000ms window.
  → Load smoothed out. Recovering service handles it.
  → System stabilises instead of oscillating.

Rule: ALWAYS add jitter to retry backoff in distributed systems.
*/

export { retryWithBackoff, fetchUserSafe }`,
    feedback_correct: "✅ Exponential backoff limits retry rate. Jitter spreads retries across time. Without jitter → retry storms crash recovering services.",
    feedback_partial: "delay = random(0, baseDelay * 2^attempt). Jitter randomises so clients don't all retry simultaneously. Don't retry 4xx.",
    feedback_wrong: "Exponential: baseDelay * 2^(attempt-1). Full jitter: Math.random() * exponential. Don't retry client errors (4xx).",
    expected: "Retry with exponential backoff and jitter",
  },
  {
    id: "step5", type: "question", phase: "Step 5 of 5",
    paal: "Design liveness vs readiness health check endpoints. Show how Kubernetes uses them differently and what each should check.",
    answer_keywords: ["health check", "liveness", "readiness", "kubernetes", "probe", "dependency"],
    seed_code: `// Step 5: health check endpoints — liveness vs readiness

import express from 'express'
const app = express()

/*
─── THE DIFFERENCE ───────────────────────────────────────────────
LIVENESS probe:  "Is this process alive and not deadlocked?"
  If FAILS → Kubernetes KILLS and RESTARTS the pod
  Should check: process can still do work (not deadlocked, not OOM)
  Should NOT check: external dependencies (DB, Redis) — restarts won't fix those

READINESS probe: "Is this pod ready to receive traffic?"
  If FAILS → Kubernetes REMOVES pod from load balancer (no restarts)
  Should check: all critical dependencies are reachable
  Should include: DB connection, Redis connection, downstream services
*/

// LIVENESS — only checks internal process health:
app.get('/health/live', (req, res) => {
  // Just respond — if we can respond, we're alive:
  res.json({ status: 'alive', timestamp: new Date().toISOString() })
  // Could also check: event loop lag, heap usage, internal state machines
})

// READINESS — checks all dependencies:
app.get('/health/ready', async (req, res) => {
  const checks = await Promise.allSettled([
    checkDatabase(),
    checkRedis(),
    checkCriticalService(),
  ])

  const results = {
    database: checks[0].status === 'fulfilled' ? 'ok' : checks[0].reason?.message,
    redis:    checks[1].status === 'fulfilled' ? 'ok' : checks[1].reason?.message,
    payments: checks[2].status === 'fulfilled' ? 'ok' : checks[2].reason?.message,
  }

  const allHealthy = checks.every(c => c.status === 'fulfilled')

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'ready' : 'not-ready',
    checks: results,
    timestamp: new Date().toISOString(),
  })
})

async function checkDatabase() {
  await db.query('SELECT 1')  // fast, cheap, confirms connectivity
}
async function checkRedis() {
  await redis.ping()
}
async function checkCriticalService() {
  const res = await fetch('https://internal-service/health/live', { signal: AbortSignal.timeout(2000) })
  if (!res.ok) throw new Error('Service unhealthy')
}

/*
KUBERNETES CONFIG:
  livenessProbe:
    httpGet: { path: /health/live, port: 3000 }
    initialDelaySeconds: 10
    periodSeconds: 30
    failureThreshold: 3      # restart after 3 consecutive failures

  readinessProbe:
    httpGet: { path: /health/ready, port: 3000 }
    initialDelaySeconds: 5
    periodSeconds: 10
    failureThreshold: 2      # remove from LB after 2 failures
*/

export { app }`,
    feedback_correct: "✅ Liveness: is the process alive? Readiness: are all dependencies reachable? Failure modes are completely different.",
    feedback_partial: "Liveness failure → restart. Readiness failure → remove from load balancer. Don't check external deps in liveness.",
    feedback_wrong: "/health/live → just respond (process alive). /health/ready → check DB, Redis, services → 503 if any fail.",
    expected: "Liveness vs readiness health checks",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Incident lifecycle", id: "step1" },
  { label: "Step 2 — Post-mortem", id: "step2" },
  { label: "Step 3 — Circuit breaker", id: "step3" },
  { label: "Step 4 — Retry + backoff", id: "step4" },
  { label: "Step 5 — Health checks", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: "PE-02", title: "Incident Response & Reliability", shortName: "PE — INCIDENTS" });
