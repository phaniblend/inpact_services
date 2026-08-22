import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "SYSTEM DESIGN #2",
      title: "Caching — Strategy, Invalidation & Pitfalls",
      body: `"There are only two hard lessons in computer science:
cache invalidation and naming things." — Phil Karlton

Caching is the single highest-leverage performance tool.
Done right: 100× latency improvement, 95% DB load eliminated.
Done wrong: stale data, thundering herds, cache stampedes, bugs
that only appear under load.

Cache-aside     — app checks cache, falls back to DB
Write-through   — write to cache AND DB simultaneously
Write-behind    — write to cache, async flush to DB
Read-through    — cache fetches from DB on miss automatically
Refresh-ahead   — prefetch before TTL expires

Each strategy has a failure mode you need to know.`,
      usecase: `Redis caching for API responses, CDN for static assets, browser cache headers, database query caches, DNS TTLs — caching decisions appear in every layer of every system you build.`,
    },
  },
  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Implement cache-aside (lazy loading) correctly with TTL",
      "Choose between cache-aside, write-through, and write-behind",
      "Handle cache invalidation — the hardest part",
      "Prevent the thundering herd / cache stampede lesson",
      "Design a cache key strategy that avoids collisions",
      "Know what NOT to cache — and why cache size matters",
    ],
  },
  {
    id: "step1", type: "question", phase: "Step 1 of 5",
    paal: "Implement cache-aside pattern with Redis: check cache, miss → fetch from DB → populate cache → return.",
    answer_keywords: ["cache-aside", "get", "set", "ttl", "miss", "hit"],
    seed_code: `// Step 1: Cache-aside (lazy loading) — the most common pattern

import { createClient } from 'redis'
const redis = createClient({ url: process.env.REDIS_URL })

async function getUser(userId) {
  const cacheKey = \`user:\${userId}\`

  // 1. Check cache first:
  const cached = await redis.get(cacheKey)
  if (cached) {
    return JSON.parse(cached)   // ✅ cache HIT — return immediately
  }

  // 2. Cache MISS — fetch from DB:
  const user = await db.query('SELECT * FROM users WHERE id = $1', [userId])
  if (!user) return null

  // 3. Populate cache with TTL (expire after 1 hour):
  await redis.setEx(cacheKey, 3600, JSON.stringify(user))

  // 4. Return the fresh value:
  return user
}

// Delete from cache when data changes:
async function updateUser(userId, data) {
  await db.query('UPDATE users SET ... WHERE id = $1', [userId])
  await redis.del(\`user:\${userId}\`)   // invalidate — next read will repopulate
}

/*
CACHE-ASIDE TRADE-OFFS:
  ✅ Cache only what's actually requested (no wasted memory)
  ✅ App stays functional if Redis goes down (falls back to DB)
  ❌ First request after miss/expiry hits DB (cold start latency)
  ❌ Potential for stale data in the window before TTL expires
  ❌ Cache stampede risk under high concurrency (fixed in step 4)
*/

export { getUser, updateUser }`,
    feedback_correct: "✅ Check cache → miss → DB → set with TTL → return. Invalidate on write. Cache-aside keeps the app functional if Redis dies.",
    feedback_partial: "redis.get → miss → db.query → redis.setEx(key, ttl, value) → return. Del on update.",
    feedback_wrong: "get from cache, on miss get from DB and setEx(key, seconds, value), del on update",
    expected: "Cache-aside implementation",
  },
  {
    id: "step2", type: "question", phase: "Step 2 of 5",
    paal: "Compare write-through and write-behind. Show write-through ensures cache/DB consistency. Show write-behind risks data loss.",
    answer_keywords: ["write-through", "write-behind", "consistency", "async", "data loss"],
    seed_code: `// Step 2: write-through vs write-behind

/*
─── WRITE-THROUGH ────────────────────────────────────────────────
Write to cache AND DB synchronously. Cache is always consistent.

PROS: ✅ Cache always up to date  ✅ No stale reads
CONS: ❌ Higher write latency (two writes)  ❌ Cache fills with unread data
*/
async function writeThrough(userId, data) {
  // Write to DB first (source of truth):
  const saved = await db.query('UPDATE users SET data=$2 WHERE id=$1', [userId, data])
  // Then update cache — both succeed or we handle the error:
  await redis.setEx(\`user:\${userId}\`, 3600, JSON.stringify(saved))
  return saved
}

/*
─── WRITE-BEHIND (Write-back) ────────────────────────────────────
Write to cache immediately, flush to DB asynchronously.

PROS: ✅ Very fast writes (just cache)  ✅ DB write-batching possible
CONS: ❌ Data loss if cache crashes before flush
      ❌ Complex — need reliable flush queue
      ❌ Dirty reads possible if multiple instances
*/
const dirtyKeys = new Set()

async function writeBehind(userId, data) {
  // Write to cache immediately:
  await redis.setEx(\`user:\${userId}\`, 3600, JSON.stringify(data))
  dirtyKeys.add(\`user:\${userId}\`)
  // Queue a background flush (in production: use a proper queue):
  scheduledFlush(userId, data)
}

async function scheduledFlush(userId, data) {
  await new Promise(r => setTimeout(r, 5000))  // batch 5 seconds of writes
  await db.query('UPDATE users SET data=$2 WHERE id=$1', [userId, data])
  dirtyKeys.delete(\`user:\${userId}\`)
}

/*
─── WHEN TO USE WHICH ────────────────────────────────────────────
Write-through: user profiles, configs — data where consistency matters
Write-behind:  view counts, analytics, likes — data where loss is tolerable
Cache-aside:   read-heavy data — fetch on demand, don't pre-populate
*/

export { writeThrough, writeBehind }`,
    feedback_correct: "✅ Write-through = consistent but slower writes. Write-behind = fast writes but risk data loss. Choose based on durability needs.",
    feedback_partial: "Write-through: DB + cache together. Write-behind: cache first, DB later (async). Write-behind risks data loss.",
    feedback_wrong: "Write-through: synchronous cache+DB write. Write-behind: cache immediately, async DB flush. Loss risk on crash.",
    expected: "Write-through vs write-behind",
  },
  {
    id: "step3", type: "question", phase: "Step 3 of 5",
    paal: "Design a cache key strategy: namespacing, versioning, and avoiding collisions across services and environments.",
    answer_keywords: ["cache key", "namespace", "version", "prefix", "collision", "env"],
    seed_code: `// Step 3: cache key design — collisions kill correctness

/*
─── CACHE KEY ANATOMY ────────────────────────────────────────────
Format: {env}:{service}:{version}:{entity}:{id}:{variant}

Examples:
  prod:api:v1:user:123                — user by ID
  prod:api:v1:user:123:profile        — user profile view
  prod:api:v1:feed:user:123:page:1    — paginated feed
  prod:api:v1:search:q:typescript     — search results
  staging:api:v1:user:123             — staging env isolation ✅
*/

// Key builder — typed, consistent, collision-safe:
function cacheKey(entity, id, ...parts) {
  const env     = process.env.NODE_ENV || 'dev'
  const version = 'v1'  // bump this to invalidate ALL caches for this entity
  const base    = [env, 'api', version, entity, id].filter(Boolean)
  return [...base, ...parts].join(':')
}

cacheKey('user', 123)                 // 'prod:api:v1:user:123'
cacheKey('user', 123, 'profile')      // 'prod:api:v1:user:123:profile'
cacheKey('feed', 'user', 123, 'p', 1) // 'prod:api:v1:feed:user:123:p:1'

/*
─── VERSIONED CACHE BUSTING ─────────────────────────────────────
When the cached data shape changes, bump the version.
All old v1 keys become orphaned — they expire naturally via TTL.
New v2 requests get cache misses initially (cold start).

Alternative: include a schema hash in the key:
  user:123:\${hash(UserSchema)}   — auto-busts when schema changes

─── MULTI-TENANT ISOLATION ───────────────────────────────────────
Always namespace by tenantId to prevent data leakage:
  tenant:{tenantId}:user:{userId}
  Not: user:{userId}  ← will collide across tenants!

─── KEY LENGTH ───────────────────────────────────────────────────
Redis keys can be up to 512MB but should be:
  • Short enough to be memory-efficient (keys live in RAM)
  • Long enough to be unambiguous
  • Consistent — always the same structure for the same data
*/

export { cacheKey }`,
    feedback_correct: "✅ env:service:version:entity:id:variant — namespaced, versioned, collision-safe. Always isolate by env and tenant.",
    feedback_partial: "Key format: env:service:version:entity:id. Bump version to bust cache. Namespace by tenant.",
    feedback_wrong: "cacheKey = `${env}:${service}:v${version}:${entity}:${id}` — consistent, versioned, namespaced",
    expected: "Cache key strategy",
  },
  {
    id: "step4", type: "question", phase: "Step 4 of 5",
    paal: "Solve the thundering herd / cache stampede: when a popular cache key expires, 10,000 requests all miss simultaneously and hammer the DB.",
    answer_keywords: ["thundering herd", "stampede", "mutex", "lock", "probabilistic", "early expiry"],
    seed_code: `// Step 4: preventing cache stampede (thundering herd)

/*
THE PROBLEM:
  Popular key expires at t=0.
  10,000 concurrent requests all get cache miss simultaneously.
  All 10,000 go to DB at once → DB overwhelmed → cascade failure.
*/

// SOLUTION 1: Mutex lock (only one request rebuilds the cache)
import { createClient } from 'redis'
const redis = createClient()

async function getWithMutex(key, fetchFn, ttl = 3600) {
  const cached = await redis.get(key)
  if (cached) return JSON.parse(cached)

  // Try to acquire lock (NX = only set if not exists, PX = ms expiry):
  const lockKey = \`lock:\${key}\`
  const acquired = await redis.set(lockKey, '1', { NX: true, PX: 5000 })

  if (acquired) {
    // WON the lock — rebuild cache:
    try {
      const data = await fetchFn()
      await redis.setEx(key, ttl, JSON.stringify(data))
      return data
    } finally {
      await redis.del(lockKey)   // always release
    }
  } else {
    // LOST the lock — wait and retry (another request is rebuilding):
    await new Promise(r => setTimeout(r, 100))
    return getWithMutex(key, fetchFn, ttl)  // retry
  }
}

// SOLUTION 2: Probabilistic early expiration (simpler, no locks)
// Refresh cache slightly BEFORE it expires, with randomised probability
async function getWithEarlyExpiry(key, fetchFn, ttl = 3600, beta = 1) {
  const result = await redis.get(key)
  if (result) {
    const { value, expires } = JSON.parse(result)
    const ttlLeft = expires - Date.now() / 1000
    // Randomly decide to refresh before expiry (XFetch algorithm):
    if (ttlLeft > 0 && ttlLeft > beta * Math.random() * Math.log(ttlLeft)) {
      return value   // still valid
    }
  }
  // Refresh:
  const data = await fetchFn()
  const payload = { value: data, expires: Date.now() / 1000 + ttl }
  await redis.setEx(key, ttl + 60, JSON.stringify(payload))  // +60s grace period
  return data
}

export { getWithMutex, getWithEarlyExpiry }`,
    feedback_correct: "✅ Mutex (distributed lock) prevents stampede by serialising rebuilds. Early expiry prevents it by refreshing before TTL ends.",
    feedback_partial: "Lock solution: SET key NX PX wins the rebuild race. Early expiry: probabilistically refresh before expiration.",
    feedback_wrong: "redis.set(lockKey, '1', {NX:true, PX:5000}) — only winner rebuilds cache, losers wait and retry.",
    expected: "Cache stampede prevention",
  },
  {
    id: "step5", type: "question", phase: "Step 5 of 5",
    paal: "Know what NOT to cache. Show the cases where caching makes things worse: highly dynamic data, user-specific sensitive data, tiny datasets.",
    answer_keywords: ["invalidation", "don't cache", "sensitive", "dynamic", "consistency", "cost"],
    seed_code: `// Step 5: cache invalidation and what NOT to cache

/*
─── THINGS YOU SHOULD NOT CACHE ──────────────────────────────────

1. HIGHLY DYNAMIC DATA (changes every request)
   Examples: real-time stock prices, live sports scores, availability counts
   Why not: Cache is stale immediately. Invalidation cost > benefit.
   Solution: Skip cache. Use WebSockets or SSE for live data.

2. SENSITIVE PERSONAL DATA
   Examples: passwords (obviously), SSNs, health records, payment details
   Why not: Cache is another attack surface. GDPR right-to-delete is hard.
   Solution: Never cache. Fetch directly from encrypted DB on every request.

3. DATA WITH COMPLEX INVALIDATION DEPENDENCIES
   Examples: "user X's feed" depends on posts from 500 people they follow
   If any of those 500 people post → every follower's feed cache is stale.
   Why not: Invalidation graph becomes unmanageable.
   Solution: Short TTL + background refresh, or don't cache at all.

4. TINY DATASETS (fits in a single DB query)
   Examples: app configuration, feature flags, enum tables (10-100 rows)
   Why not: The DB round-trip is fast enough; caching adds complexity for no gain.
   Solution: Load into application memory at startup (in-process cache).

5. RESULTS OF WRITE OPERATIONS
   Never cache the result of a POST/PUT/DELETE response.
   The write response is only relevant to that one caller.

─── THE CACHE INVALIDATION DECISION TREE ────────────────────────
Ask these questions:
  Q1: Does this data change more than once per minute? → Skip cache
  Q2: Is this data user-specific and private? → Cache with user-scoped key + short TTL
  Q3: Can you tolerate stale data for N seconds? → TTL = N
  Q4: Does a write to X require invalidating Y, Z, W? → Reconsider caching X

─── CACHE HIT RATE MATTERS ──────────────────────────────────────
A cache with <50% hit rate is probably hurting you more than helping.
Measure: hits / (hits + misses) — target >90% for meaningful gain.
*/

const cachePolicy = (dataType) => ({
  'user-profile':     { cache: true,  ttl: 3600,  reason: 'changes rarely' },
  'stock-price':      { cache: false, ttl: 0,     reason: 'changes every second' },
  'user-password':    { cache: false, ttl: 0,     reason: 'never cache credentials' },
  'feature-flags':    { cache: true,  ttl: 60,    reason: 'in-process cache better' },
  'search-results':   { cache: true,  ttl: 300,   reason: 'same query = same results' },
  'payment-details':  { cache: false, ttl: 0,     reason: 'sensitive + compliance' },
}[dataType])

export { cachePolicy }`,
    feedback_correct: "✅ Don't cache: real-time data, sensitive PII, complex invalidation graphs, tiny datasets. Measure hit rate — <50% means reconsider.",
    feedback_partial: "Skip cache for: real-time data, passwords/PII, complex dependency graphs. Cache hit rate should be >90%.",
    feedback_wrong: "Never cache passwords, real-time data, or data with complex invalidation. Always measure cache hit rate.",
    expected: "What not to cache and invalidation strategy",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Cache-aside", id: "step1" },
  { label: "Step 2 — Write strategies", id: "step2" },
  { label: "Step 3 — Key design", id: "step3" },
  { label: "Step 4 — Stampede fix", id: "step4" },
  { label: "Step 5 — What not to cache", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: "SD-02", title: "Caching Strategies", shortName: "SD — CACHING" });
