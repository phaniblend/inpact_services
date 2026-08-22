import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "PRODUCTION ENGINEERING #3",
      title: "Deployment Strategies — Zero-Downtime Releases",
      body: `The most dangerous moment for any system is deployment.
You're changing running code that real users depend on.
Do it wrong and you cause an outage. Do it right and
users never notice.

The strategies:
  Rolling      — replace instances one by one
  Blue/Green   — two identical envs, instant cutover
  Canary       — route a small % to the new version first
  Feature Flags — deploy code without activating features
  Shadow       — run new version in parallel, compare outputs

Each strategy answers a different risk question:
  "Can I roll back in 30 seconds?" → Blue/Green
  "Can I test on 1% of real users?" → Canary
  "Can I deploy on Friday safely?" → Feature Flags`,
      usecase: `Zero-downtime releases, safe database migrations, A/B testing infrastructure, kill switches for bad features, progressive rollouts to new markets — all require these patterns.`,
    },
  },
  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Implement blue/green deployment with instant rollback",
      "Design a canary release with automatic rollback on error spike",
      "Use feature flags as deployment decouplers and kill switches",
      "Safely run database migrations with zero downtime",
      "Design a shadow deployment for risk-free new version testing",
      "Know which strategy to use for which risk profile",
    ],
  },
  {
    id: "step1", type: "question", phase: "Step 1 of 5",
    paal: "Explain blue/green deployment. Show the DNS/load balancer cutover and how to roll back in under 60 seconds.",
    answer_keywords: ["blue", "green", "cutover", "rollback", "load balancer", "dns"],
    seed_code: `// Step 1: Blue/Green deployment

/*
ARCHITECTURE:
  Blue  environment: currently serving 100% of production traffic
  Green environment: new version, deployed and tested but not live

CUTOVER:
  Test green thoroughly (smoke tests, synthetic monitors)
  Switch load balancer: Blue 100% → Green 100%
  Keep Blue running for rollback window (30-60 min)

ROLLBACK:
  Something wrong? Switch load balancer back: Green → Blue
  Total rollback time: <60 seconds (just a config change)

─── IMPLEMENTATION WITH AWS ──────────────────────────────────────
*/

// Infrastructure as code (Terraform-style pseudocode):
const blueGreenSetup = {
  // Two target groups in AWS ALB:
  targetGroups: {
    blue:  { name: 'api-blue',  port: 3000, instances: ['i-111', 'i-222'] },
    green: { name: 'api-green', port: 3000, instances: ['i-333', 'i-444'] },
  },

  // ALB listener rule — swap this to do blue/green:
  listenerRule: {
    current: 'api-blue',   // change to 'api-green' to cutover
    weights: { blue: 100, green: 0 },
  },
}

// Cutover script:
async function cutoverToGreen(alb) {
  console.log('Running pre-cutover smoke tests on green...')
  await runSmokeTests('https://green.internal.example.com')

  console.log('Switching traffic: Blue → Green')
  await alb.modifyListenerRule({
    weights: { blue: 0, green: 100 }
  })

  console.log('Monitoring error rates for 10 minutes...')
  const healthy = await monitorErrorRates(10 * 60 * 1000)

  if (!healthy) {
    console.error('Error spike detected! Rolling back to Blue...')
    await alb.modifyListenerRule({ weights: { blue: 100, green: 0 } })
    throw new Error('Rollback executed — investigate Green before retrying')
  }

  console.log('Cutover successful. Terminating Blue instances...')
  // Wait 30+ min before killing Blue (your rollback window)
}

/*
PROS: ✅ Instant rollback  ✅ Clean environment  ✅ Easy to test before live
CONS: ❌ 2× infrastructure cost  ❌ DB migrations are still tricky
      ❌ Stateful services (WebSocket sessions) need sticky routing
*/

export { cutoverToGreen }`,
    feedback_correct: "✅ Blue/Green: two environments, switch load balancer for instant cutover. Keep Blue alive for rollback window. Test Green before switching.",
    feedback_partial: "Blue=live, Green=new version. Switch LB weights: 0/100 → 100/0. Rollback: flip back. Keep both running during rollback window.",
    feedback_wrong: "Switch ALB weights from Blue(100)/Green(0) to Blue(0)/Green(100). Rollback: flip back instantly. Keep Blue until stable.",
    expected: "Blue/Green deployment and rollback",
  },
  {
    id: "step2", type: "question", phase: "Step 2 of 5",
    paal: "Design a canary release: route 1% of traffic to the new version, monitor error rates, and auto-rollback if metrics degrade.",
    answer_keywords: ["canary", "1%", "traffic split", "auto-rollback", "error rate", "progressive"],
    seed_code: `// Step 2: Canary deployment with auto-rollback

/*
CANARY STRATEGY:
  1% → 5% → 25% → 50% → 100%
  Monitor at each stage before promoting.
  Automated rollback if error rate or latency degrades.
*/

class CanaryDeployment {
  constructor({ newVersion, rollbackFn, metricsClient }) {
    this.stages    = [1, 5, 25, 50, 100]  // traffic % at each stage
    this.current   = 0
    this.newVersion = newVersion
    this.rollback  = rollbackFn
    this.metrics   = metricsClient
    this.baseline  = null
  }

  async captureBaseline() {
    // Measure current error rate and p99 latency for comparison:
    this.baseline = await this.metrics.getStats({
      window: '10m',
      percentiles: [50, 95, 99],
    })
    console.log('Baseline captured:', this.baseline)
  }

  async promote() {
    const stage = this.stages[this.current]
    console.log('Promoting canary to ' + stage + '% traffic...')

    // Update load balancer weights:
    await updateTrafficWeights({
      stable: 100 - stage,
      canary: stage,
    })

    // Observe for 5 minutes at each stage:
    await this.observe(stage)
    this.current++
  }

  async observe(trafficPct) {
    const OBSERVE_WINDOW = 5 * 60 * 1000  // 5 minutes
    const start = Date.now()

    while (Date.now() - start < OBSERVE_WINDOW) {
      const canaryStats = await this.metrics.getStats({
        version: 'canary',
        window: '1m',
      })

      // Auto-rollback if canary is significantly worse:
      const errorRateDelta = canaryStats.errorRate - this.baseline.errorRate
      const latencyDelta   = canaryStats.p99 - this.baseline.p99

      if (errorRateDelta > 0.02) {  // error rate up by 2%
        await this.executeRollback('error rate spike', { errorRateDelta })
        return
      }
      if (latencyDelta > 500) {  // p99 up by 500ms
        await this.executeRollback('latency degradation', { latencyDelta })
        return
      }

      await sleep(30_000)  // check every 30 seconds
    }
    console.log('Stage ' + trafficPct + '% healthy. Ready to promote further.')
  }

  async executeRollback(reason, data) {
    console.error('Canary FAILED: ' + reason, data)
    await updateTrafficWeights({ stable: 100, canary: 0 })
    await this.rollback()
    throw new Error('Canary rollback: ' + reason)
  }
}

async function updateTrafficWeights(weights) { /* update ALB/Nginx */ }
async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

export { CanaryDeployment }`,
    feedback_correct: "✅ Canary: progressive % increase with monitoring gates. Auto-rollback when error rate or latency exceeds baseline by threshold.",
    feedback_partial: "1%→5%→25%→50%→100%. Monitor at each stage. Compare to baseline. Auto-rollback on error spike or latency degradation.",
    feedback_wrong: "Canary stages with traffic weights. Monitor error rate delta vs baseline. Roll back to 0% automatically on degradation.",
    expected: "Canary deployment with auto-rollback",
  },
  {
    id: "step3", type: "question", phase: "Step 3 of 5",
    paal: "Use feature flags to decouple deployment from feature release. Show kill switch, percentage rollout, and user segment targeting.",
    answer_keywords: ["feature flag", "kill switch", "percentage", "rollout", "launchdarkly", "targeting"],
    seed_code: `// Step 3: feature flags — deploy without releasing

/*
THE PRINCIPLE:
  Deployment = pushing code to production
  Release    = making a feature available to users

With feature flags, these are SEPARATE events.
Deploy every day. Release when ready. Rollback in seconds.

USE CASES:
  Kill switch     — disable a broken feature instantly without deploy
  Percentage rollout — test with 5% of users, expand gradually
  User segment    — beta testers, internal users, specific accounts
  A/B testing     — route 50% to variant A, 50% to B
  Ops flags       — enable maintenance mode, circuit breakers
*/

import LaunchDarkly from '@launchdarkly/node-server-sdk'
const ldClient = LaunchDarkly.init(process.env.LD_SDK_KEY)

// ── KILL SWITCH ───────────────────────────────────────────────
async function processPayment(user, amount) {
  const newCheckoutEnabled = await ldClient.variation(
    'new-checkout-flow',    // flag key
    { key: user.id, email: user.email },  // user context
    false                   // default if flag unavailable
  )

  if (newCheckoutEnabled) {
    return newCheckoutFlow(user, amount)   // new code path
  }
  return legacyCheckoutFlow(user, amount) // safe fallback
}

// ── PERCENTAGE ROLLOUT ────────────────────────────────────────
// In LaunchDarkly/Unleash dashboard:
// Flag: 'ai-search'
// Rules: serve true to 10% of users, false to 90%
// LaunchDarkly uses consistent hashing on user.key
// → same user ALWAYS gets same value (sticky)

// ── USER SEGMENT TARGETING ────────────────────────────────────
// Flag: 'dark-mode'
// Rules:
//   IF user.plan == 'enterprise'  → true
//   IF user.betaTester == true   → true
//   IF email ENDS WITH '@company.com' → true (internal users)
//   DEFAULT → false

// ── OPS FLAG — MAINTENANCE MODE ──────────────────────────────
async function apiMiddleware(req, res, next) {
  const maintenanceMode = await ldClient.variation(
    'maintenance-mode',
    { key: 'global', anonymous: true },
    false
  )

  if (maintenanceMode) {
    return res.status(503).json({
      error: 'Service temporarily unavailable',
      retryAfter: 3600,
    })
  }
  next()
}

// ── SELF-HOSTED ALTERNATIVE (Unleash) ────────────────────────
// import { initialize } from 'unleash-client'
// const unleash = initialize({ url: '...', appName: 'my-app', customHeaders: {...} })

export { processPayment, apiMiddleware }`,
    feedback_correct: "✅ Feature flags decouple deploy from release. Kill switch = change flag, not code. Percentage rollout = sticky consistent hashing.",
    feedback_partial: "ldClient.variation(flagKey, userContext, default) → bool. Kill switch: toggle in dashboard. Percentage: configure in dashboard rules.",
    feedback_wrong: "ldClient.variation('flag-name', { key: userId }, false) — true/false controls code path. Toggle in dashboard, no deploy needed.",
    expected: "Feature flags for kill switches and rollouts",
  },
  {
    id: "step4", type: "question", phase: "Step 4 of 5",
    paal: "Run zero-downtime database migrations: expand/contract pattern, backward-compatible schema changes, never lock production tables.",
    answer_keywords: ["expand contract", "migration", "zero downtime", "backward compatible", "lock", "column"],
    seed_code: `// Step 4: zero-downtime database migrations

/*
THE PROBLEM:
  ALTER TABLE users ADD COLUMN phone VARCHAR(20) NOT NULL;
  → Locks the table for the duration of the migration
  → On a table with 10M rows: minutes of downtime ❌

THE SOLUTION: Expand/Contract pattern (3-phase migration)

─── PHASE 1: EXPAND (backward-compatible add) ────────────────────
  Add the new state without removing the old.
  Old code works unchanged.
  New code starts writing to new column.
*/

// Migration 001 — EXPAND:
// ALTER TABLE users ADD COLUMN phone_new VARCHAR(20);  -- nullable, no lock!
// CREATE INDEX CONCURRENTLY idx_users_phone ON users(phone_new);  -- concurrent!

// Deploy new version that writes to BOTH old and new columns:
async function updateUser(userId, data) {
  await db.query([
    'UPDATE users',
    'SET email = $2,',
    '    phone = $3,          -- old column (still written)',
    '    phone_new = $3       -- new column (start populating)',
    'WHERE id = $1',
  ].join('\n'), [userId, data.email, data.phone])
}

/*
─── PHASE 2: MIGRATE (backfill old data) ─────────────────────────
  Backfill existing rows in batches — never lock the whole table.
  Run as a background job, not in a single transaction.
*/

async function backfillPhoneNew() {
  const batchSize = 1000
  let lastId = 0

  while (true) {
    const result = await db.query([
      'UPDATE users',
      'SET phone_new = phone',
      'WHERE id > $1 AND phone_new IS NULL',
      'ORDER BY id',
      'LIMIT $2',
      'RETURNING id',
    ].join('\n'), [lastId, batchSize])

    if (result.length === 0) break
    lastId = result.at(-1).id
    await sleep(100)  // throttle — don't hammer the DB
  }
}

/*
─── PHASE 3: CONTRACT (remove old column) ─────────────────────────
  ONLY after:
    ✅ New column fully backfilled
    ✅ All code reads/writes only the new column
    ✅ Old column no longer referenced anywhere

  Deploy code that reads from phone_new only.
  Then remove the old column.
*/

// Migration 003 — CONTRACT (safe now, no code references phone):
// ALTER TABLE users DROP COLUMN phone;
// ALTER TABLE users RENAME COLUMN phone_new TO phone;

/*
RULES:
  ✅ Always use nullable for new columns (no NOT NULL on ADD)
  ✅ CREATE INDEX CONCURRENTLY (doesn't lock)
  ✅ Backfill in batches with sleep between
  ✅ Never do a big migration in a single transaction on prod
  ❌ Never ALTER TABLE ... NOT NULL on large tables (full lock)
  ❌ Never DROP COLUMN while old code still references it
*/

export { backfillPhoneNew }`,
    feedback_correct: "✅ Expand: add nullable column. Migrate: backfill in batches. Contract: drop old only after code migrated. Never lock prod tables.",
    feedback_partial: "3 phases: Expand (add nullable), Migrate (backfill batches), Contract (drop old). CREATE INDEX CONCURRENTLY avoids locks.",
    feedback_wrong: "Phase 1: ADD COLUMN nullable. Phase 2: backfill in batches. Phase 3: DROP old column only after code no longer references it.",
    expected: "Expand/contract zero-downtime migrations",
  },
  {
    id: "step5", type: "question", phase: "Step 5 of 5",
    paal: "Design a shadow deployment: run the new version in parallel, compare outputs to the stable version, without affecting users.",
    answer_keywords: ["shadow", "dark launch", "parallel", "compare", "traffic mirroring", "validate"],
    seed_code: `// Step 5: shadow deployment — risk-free validation

/*
SHADOW DEPLOYMENT (dark launch / traffic mirroring):
  Real requests are DUPLICATED to the new version.
  Users only see responses from the STABLE version.
  New version runs in real conditions — real data, real load.
  Outputs are compared. Differences logged for investigation.

USE FOR:
  - Validating a rewritten service before cutover
  - Testing a new algorithm against real data
  - Verifying a new DB query returns the same results
  - Load testing a new service with real traffic patterns
*/

async function shadowMiddleware(req, res, next) {
  // Serve the real response from stable version immediately:
  const stableResponse = await stableService.handle(req)
  res.json(stableResponse)  // user gets this — no waiting for shadow

  // Fire-and-forget shadow request (doesn't affect user):
  setImmediate(async () => {
    try {
      const shadowStart    = Date.now()
      const shadowResponse = await shadowService.handle(cloneRequest(req))
      const shadowDuration = Date.now() - shadowStart

      // Compare outputs:
      const matches = deepEqual(stableResponse, shadowResponse)

      // Log divergences for investigation:
      await analyticsLogger.log({
        event: 'shadow_comparison',
        path:  req.path,
        matches,
        shadowDuration,
        diff: matches ? null : computeDiff(stableResponse, shadowResponse),
        requestId: req.id,
      })

      if (!matches) {
        // Alert team but DON'T affect the user:
        await alerting.warn('shadow_divergence', {
          path: req.path,
          stable: stableResponse,
          shadow: shadowResponse,
        })
      }
    } catch (err) {
      // Shadow failures NEVER affect users:
      console.error('Shadow request failed:', err.message)
    }
  })

  next()
}

/*
CUTOVER CRITERIA:
  ✅ <0.1% response divergence over 24 hours
  ✅ Shadow p99 latency within 20% of stable
  ✅ Zero shadow crashes or errors
  ✅ Load test confirms shadow can handle peak traffic

Only then: switch traffic from stable → shadow (now becomes the new stable)
*/

function cloneRequest(req) { return { ...req, body: { ...req.body } } }
function deepEqual(a, b) { return JSON.stringify(a) === JSON.stringify(b) }
function computeDiff(a, b) { return { before: a, after: b } }

export { shadowMiddleware }`,
    feedback_correct: "✅ Shadow: duplicate request, serve stable response to user, compare shadow output async. Zero user impact. Validates in real conditions.",
    feedback_partial: "Mirror request to new version. User sees stable response. Compare outputs async. Log divergences. Switch only when divergence < threshold.",
    feedback_wrong: "User gets stable response. Shadow runs in parallel (setImmediate). Compare outputs. Never let shadow errors affect users.",
    expected: "Shadow deployment for risk-free validation",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Blue/Green", id: "step1" },
  { label: "Step 2 — Canary", id: "step2" },
  { label: "Step 3 — Feature flags", id: "step3" },
  { label: "Step 4 — DB migrations", id: "step4" },
  { label: "Step 5 — Shadow deploy", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: "PE-03", title: "Deployment Strategies", shortName: "PE — DEPLOYMENTS" });
