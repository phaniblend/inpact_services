import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "SYSTEM DESIGN #4",
      title: "API Design — REST, Rate Limiting & Versioning",
      body: `APIs are contracts. Break the contract and you break
every client that depends on it — sometimes millions of them.

Senior engineers design APIs that are:
  Intuitive    — resource-oriented, predictable naming
  Versioned    — changes don't break existing clients
  Rate limited — protected from abuse and accidental overload
  Idempotent   — safe to retry without duplicate side effects
  Documented   — OpenAPI/Swagger, not just tribal knowledge

The difference between a junior and senior API:
Junior: "It works."
Senior: "It's backward compatible, rate limited, idempotent,
         paginated, and has a deprecation strategy."`,
      usecase: `Every API you build will be consumed by someone — frontend teams, mobile teams, third-party integrators. Poor API design creates years of backward-compat pain, support tickets, and client bugs.`,
    },
  },
  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Design RESTful resources with correct HTTP verbs and status codes",
      "Make write operations idempotent — safe to retry",
      "Version APIs without breaking existing clients",
      "Implement token bucket rate limiting with Redis",
      "Design pagination: cursor-based vs offset-based",
      "Apply the principle of least surprise in API contracts",
    ],
  },
  {
    id: "step1", type: "question", phase: "Step 1 of 5",
    paal: "Design the URL structure and HTTP verbs for a User + Orders resource. Map every operation to the correct verb and status code.",
    answer_keywords: ["get", "post", "put", "patch", "delete", "201", "404", "idempotent"],
    seed_code: `// Step 1: RESTful resource design

/*
─── RESOURCE NAMING ──────────────────────────────────────────────
Use nouns, not verbs. Collections are plural.
The verb comes from the HTTP method, not the URL.

❌ BAD:
  POST /createUser
  GET  /getUserById?id=123
  POST /deleteUser/123

✅ GOOD:
  POST   /users              → create user
  GET    /users              → list users
  GET    /users/:id          → get user
  PUT    /users/:id          → replace user (idempotent)
  PATCH  /users/:id          → partial update
  DELETE /users/:id          → delete user

─── NESTED RESOURCES ─────────────────────────────────────────────
  GET    /users/:id/orders        → user's orders
  POST   /users/:id/orders        → create order for user
  GET    /users/:id/orders/:oid   → specific order

  Rule: max 2 levels of nesting. Deeper = use flat resource.
  ❌ /users/:id/orders/:oid/items/:iid/reviews  (too deep)
  ✅ /order-items/:iid/reviews                  (flatten)

─── HTTP STATUS CODES (the ones you must know cold) ─────────────
200 OK              — successful GET, PUT, PATCH
201 Created         — successful POST (include Location header)
204 No Content      — successful DELETE (no body)
400 Bad Request     — client sent invalid data (include error detail)
401 Unauthorized    — not authenticated (missing/invalid token)
403 Forbidden       — authenticated but not authorized
404 Not Found       — resource doesn't exist
409 Conflict        — duplicate resource, optimistic lock failure
422 Unprocessable   — valid JSON but fails business validation
429 Too Many Req.   — rate limited (include Retry-After header)
500 Internal Error  — server bug (never expose stack traces)

─── IDEMPOTENCY ──────────────────────────────────────────────────
GET, PUT, DELETE are idempotent — calling N times = same result as 1
POST is NOT idempotent — calling N times creates N resources

Make POST idempotent with Idempotency-Key header:
  Client sends: Idempotency-Key: uuid-client-generated
  Server: if key seen before → return cached response (no re-execution)
  Use for: payments, order creation — anything that must not duplicate
*/

export const httpContract = {
  'POST /users':          [201, 'Location: /users/123'],
  'GET /users/123':       [200, 'user object'],
  'PATCH /users/123':     [200, 'updated user object'],
  'DELETE /users/123':    [204, 'no body'],
  'GET /users/999':       [404, '{ error: "User not found" }'],
  'POST /users (dupe)':   [409, '{ error: "Email already exists" }'],
}`,
    feedback_correct: "✅ Nouns not verbs in URLs. HTTP method carries the action. Status codes must be precise — 401 vs 403, 400 vs 422 vs 409.",
    feedback_partial: "GET=read, POST=create(201), PUT=replace, PATCH=partial, DELETE=204. Nested max 2 levels. Idempotency-Key for POST safety.",
    feedback_wrong: "POST /users → 201 + Location. GET → 200. DELETE → 204. 401=unauthenticated, 403=unauthorized, 409=conflict.",
    expected: "RESTful resource design and status codes",
  },
  {
    id: "step2", type: "question", phase: "Step 2 of 5",
    paal: "Implement cursor-based pagination. Explain why it beats offset pagination for large datasets.",
    answer_keywords: ["cursor", "pagination", "offset", "next", "limit", "stable"],
    seed_code: `// Step 2: pagination strategies

/*
─── OFFSET PAGINATION (simple but broken at scale) ───────────────
  GET /posts?page=3&limit=20  →  OFFSET 40 LIMIT 20

  Lessons:
  ❌ OFFSET n scans and discards n rows — O(n) cost grows with depth
  ❌ Page drift: if items are inserted/deleted between pages,
     the same item appears on two pages OR is skipped
  ❌ Consistent snapshot not guaranteed under concurrent writes
  OK for: admin UIs with small datasets, no real-time updates

─── CURSOR PAGINATION (the production approach) ──────────────────
  Cursor = opaque pointer to a position in the result set
  (usually a base64-encoded ID or timestamp)

  GET /posts?limit=20                      → first page
  GET /posts?limit=20&cursor=eyJpZCI6MTAw  → next page
*/

// Server implementation:
async function getPosts({ limit = 20, cursor } = {}) {
  let query = [
    'SELECT id, title, created_at',
    'FROM posts',
    'WHERE ($1::bigint IS NULL OR id < $1)',
    'ORDER BY id DESC',
    'LIMIT $2',
  ].join('\n')
  const decodedId = cursor
    ? JSON.parse(Buffer.from(cursor, 'base64').toString()).id
    : null

  const rows = await db.query(query, [decodedId, limit + 1])  // fetch one extra

  const hasMore = rows.length > limit
  const items   = hasMore ? rows.slice(0, limit) : rows
  const nextCursor = hasMore
    ? Buffer.from(JSON.stringify({ id: items.at(-1).id })).toString('base64')
    : null

  return {
    items,
    pagination: {
      hasMore,
      nextCursor,   // null means no more pages
      limit,
    }
  }
}

/*
─── CURSOR PAGINATION BENEFITS ───────────────────────────────────
  ✅ O(1) per page — index seek, not scan
  ✅ Stable — insertions/deletions don't cause drift
  ✅ Works with real-time data feeds
  ✅ Infinite scroll friendly

  Tradeoff: can't jump to "page 47" — must traverse forward
  OK for: feeds, timelines, any list > 10K items
*/

export { getPosts }`,
    feedback_correct: "✅ Cursor pagination: O(1) per page, drift-free, real-time safe. Offset: O(n) cost, items skip/duplicate on writes.",
    feedback_partial: "Cursor = encoded position. Fetch limit+1 to detect hasMore. Decode cursor to get WHERE clause value.",
    feedback_wrong: "WHERE id < decodedCursor ORDER BY id DESC LIMIT n+1. If rows > limit → hasMore=true, encode last row as nextCursor.",
    expected: "Cursor-based pagination implementation",
  },
  {
    id: "step3", type: "question", phase: "Step 3 of 5",
    paal: "Implement token bucket rate limiting with Redis. Apply per-user and per-IP limits with correct 429 response headers.",
    answer_keywords: ["rate limit", "token bucket", "redis", "429", "retry-after", "sliding window"],
    seed_code: `// Step 3: rate limiting with token bucket algorithm

import { createClient } from 'redis'
const redis = createClient()

/*
TOKEN BUCKET:
  Each user has a bucket with capacity N tokens.
  Each request costs 1 token.
  Tokens refill at rate R per second.
  If bucket empty → 429 Too Many Requests.
*/

async function tokenBucketLimit({
  key,            // e.g. 'rate:user:123' or 'rate:ip:1.2.3.4'
  capacity = 100, // max tokens (burst allowance)
  refillRate = 10 // tokens added per second
}) {
  const now = Date.now()
  const pipeline = redis.multi()

  // Lua script — atomic check-and-update (no race conditions):
  const script = [
    'local key      = KEYS[1]',
    'local capacity = tonumber(ARGV[1])',
    'local refill   = tonumber(ARGV[2])',
    'local now      = tonumber(ARGV[3])',
    "local data = redis.call('HMGET', key, 'tokens', 'last_refill')",
    'local tokens     = tonumber(data[1]) or capacity',
    'local last_refill = tonumber(data[2]) or now',
    'local elapsed = (now - last_refill) / 1000',
    'tokens = math.min(capacity, tokens + elapsed * refill)',
    'if tokens >= 1 then',
    '  tokens = tokens - 1',
    "  redis.call('HMSET', key, 'tokens', tokens, 'last_refill', now)",
    "  redis.call('EXPIRE', key, 3600)",
    '  return {1, math.floor(tokens)}',
    'else',
    '  return {0, 0}',
    'end',
  ].join('\n')

  const [allowed, remaining] = await redis.eval(script, {
    keys: [key], arguments: [capacity, refillRate, now].map(String)
  })

  return { allowed: allowed === 1, remaining: Number(remaining) }
}

// Express middleware:
async function rateLimitMiddleware(req, res, next) {
  const key = \`rate:user:\${req.user?.id ?? 'anon'}:\${req.ip}\`
  const { allowed, remaining } = await tokenBucketLimit({ key })

  res.set({
    'X-RateLimit-Limit': 100,
    'X-RateLimit-Remaining': remaining,
    'X-RateLimit-Reset': Math.ceil(Date.now() / 1000) + 60,
  })

  if (!allowed) {
    return res.status(429).json({
      error: 'Too many requests',
      retryAfter: 60,   // seconds
    }).set('Retry-After', '60')
  }
  next()
}

export { tokenBucketLimit, rateLimitMiddleware }`,
    feedback_correct: "✅ Token bucket via Redis Lua script (atomic). Per-user keys. 429 with Retry-After and X-RateLimit-* headers.",
    feedback_partial: "Token bucket: fill over time, spend on request. Lua script = atomic. 429 response must include Retry-After header.",
    feedback_wrong: "Redis Lua for atomic token check. Rate limit key per user/IP. 429 + Retry-After + X-RateLimit headers.",
    expected: "Token bucket rate limiting with Redis",
  },
  {
    id: "step4", type: "question", phase: "Step 4 of 5",
    paal: "Version an API without breaking existing clients. Compare URL versioning, header versioning, and content negotiation.",
    answer_keywords: ["versioning", "v1", "v2", "backward", "header", "breaking change"],
    seed_code: `// Step 4: API versioning strategies

/*
─── WHAT IS A BREAKING CHANGE? ───────────────────────────────────
Breaking:      Removing a field, changing a field type,
               changing a URL, requiring a new required field,
               changing error response format
Non-breaking:  Adding new optional fields, adding new endpoints,
               adding new optional query params

─── STRATEGY 1: URL VERSIONING (most common) ─────────────────────
  /v1/users     /v2/users
  PROS: Obvious, easy to route, curl-friendly, cacheable
  CONS: Verbose URLs, clients must explicitly upgrade

─── STRATEGY 2: HEADER VERSIONING ────────────────────────────────
  GET /users
  API-Version: 2024-03-01
  PROS: Clean URLs
  CONS: Invisible in browser, harder to cache, easy to forget

─── STRATEGY 3: CONTENT NEGOTIATION ──────────────────────────────
  Accept: application/vnd.myapi.v2+json
  PROS: Follows HTTP spec properly
  CONS: Complex, rarely used outside large orgs (Stripe, GitHub)
*/

// Express URL versioning with shared business logic:
import express from 'express'
const app = express()

// Version router:
const v1 = express.Router()
const v2 = express.Router()

// V1 user response (legacy shape):
v1.get('/users/:id', async (req, res) => {
  const user = await getUser(req.params.id)
  res.json({
    id: user.id,
    name: user.name,          // flat name field
    email: user.email,
  })
})

// V2 user response (new shape — name split into first/last):
v2.get('/users/:id', async (req, res) => {
  const user = await getUser(req.params.id)
  res.json({
    id: user.id,
    firstName: user.firstName,  // breaking change: name → firstName+lastName
    lastName: user.lastName,
    email: user.email,
    createdAt: user.createdAt,  // new field — non-breaking
  })
})

app.use('/v1', v1)
app.use('/v2', v2)

// Deprecation strategy — warn clients before sunsetting:
v1.use((req, res, next) => {
  res.set('Deprecation', 'true')
  res.set('Sunset', 'Sat, 01 Jan 2026 00:00:00 GMT')
  res.set('Link', '</v2/users>; rel="successor-version"')
  next()
})

async function getUser(id) { return { id, name: 'Alice', firstName: 'Alice', lastName: 'Smith', email: 'a@b.com', createdAt: new Date() } }

export { app }`,
    feedback_correct: "✅ URL versioning is the pragmatic choice. Add Deprecation + Sunset headers to ease migration. Non-breaking changes can go in same version.",
    feedback_partial: "URL versioning: /v1/, /v2/. Header versioning: API-Version header. Breaking change = new version. Non-breaking = extend in place.",
    feedback_wrong: "app.use('/v1', v1Router) | res.set('Deprecation','true') + 'Sunset' date to warn clients",
    expected: "API versioning strategies",
  },
  {
    id: "step5", type: "question", phase: "Step 5 of 5",
    paal: "Design an idempotent payment API. Show how Idempotency-Key prevents duplicate charges on network retry.",
    answer_keywords: ["idempotency", "idempotency-key", "payment", "retry", "duplicate", "cache"],
    seed_code: `// Step 5: idempotent APIs — safe retries for payments

/*
THE PROBLEM:
  Client sends POST /payments → network timeout.
  Did the server process it? Client doesn't know.
  Client retries → DUPLICATE CHARGE. Customer billed twice. ❌

THE SOLUTION: Idempotency keys
  Client generates a unique key (UUID) for each logical operation.
  Server caches the response for that key.
  Retries with same key → get same cached response (no re-execution).
*/

async function processPayment(req, res) {
  const idempotencyKey = req.headers['idempotency-key']

  if (!idempotencyKey) {
    return res.status(400).json({ error: 'Idempotency-Key header required' })
  }

  const cacheKey = \`idempotent:\${req.user.id}:\${idempotencyKey}\`

  // Check if we've seen this key before:
  const cached = await redis.get(cacheKey)
  if (cached) {
    const result = JSON.parse(cached)
    return res.status(result.status).json(result.body)  // replay cached response
  }

  // First time seeing this key — process the payment:
  try {
    const payment = await stripe.charges.create({
      amount: req.body.amount,
      currency: req.body.currency,
      source: req.body.token,
    })

    const response = { status: 201, body: { paymentId: payment.id, status: 'succeeded' } }

    // Cache response for 24 hours — covers all reasonable retry windows:
    await redis.setEx(cacheKey, 86400, JSON.stringify(response))

    return res.status(201).json(response.body)
  } catch (err) {
    // Don't cache errors — allow client to retry with same key:
    // (Network errors, temporary failures should be retriable)
    if (err.type === 'StripeCardError') {
      // Permanent failure — cache it (card declined won't succeed on retry):
      const response = { status: 402, body: { error: err.message } }
      await redis.setEx(cacheKey, 86400, JSON.stringify(response))
      return res.status(402).json(response.body)
    }
    throw err  // transient error — don't cache, allow retry
  }
}

/*
CLIENT IMPLEMENTATION:
  const idempotencyKey = crypto.randomUUID()  // generated ONCE per payment intent
  // On retry — use the SAME key:
  await fetch('/payments', {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(payload),
  })
*/

export { processPayment }`,
    feedback_correct: "✅ Idempotency-Key + Redis cache = safe retries. Cache success AND permanent failures. Don't cache transient errors.",
    feedback_partial: "Client generates UUID per intent. Server caches response by key. Retry same key → same response, no re-execution.",
    feedback_wrong: "redis.get(idempotencyKey) → if cached return cached. If new: process + cache response. Retry-safe payments.",
    expected: "Idempotent payment API design",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Resource design", id: "step1" },
  { label: "Step 2 — Cursor pagination", id: "step2" },
  { label: "Step 3 — Rate limiting", id: "step3" },
  { label: "Step 4 — Versioning", id: "step4" },
  { label: "Step 5 — Idempotency", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: "SD-04", title: "API Design", shortName: "SD — API DESIGN" });
