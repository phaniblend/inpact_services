import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "SYSTEM DESIGN #1",
      title: "Scale, Load & Bottlenecks",
      body: `Every system starts simple and gets complicated by reality.
The first skill of a senior engineer is diagnosing WHERE
a system will break under load — before it actually does.

Vertical scaling   — bigger machine (CPU, RAM, disk)
Horizontal scaling — more machines (stateless services)
Bottlenecks        — DB, network I/O, CPU, memory, locks
Load patterns      — read-heavy vs write-heavy vs bursty
Back-of-envelope   — estimating scale before you build

The question isn't "does it work?" — it's
"does it still work with 100x the users?"`,
      usecase: `Every system design interview, every architecture review, every "why is production slow?" investigation starts with these fundamentals. Senior engineers reason about scale before writing a single line of code.`,
    },
  },
  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Estimate system scale with back-of-envelope calculations",
      "Identify vertical vs horizontal scaling trade-offs",
      "Recognise the four bottleneck categories: CPU, memory, I/O, network",
      "Distinguish read-heavy vs write-heavy workloads and their solutions",
      "Explain the C10K lesson and why async/event-loop matters",
      "Apply the 80/20 rule: most performance wins come from a few changes",
    ],
  },
  {
    id: "step1", type: "question", phase: "Step 1 of 5",
    paal: "Back-of-envelope: estimate storage, bandwidth, and RPS for a Twitter-like service with 10M daily active users.",
    answer_keywords: ["rps", "estimate", "requests per second", "storage", "bandwidth", "dau"],
    seed_code: `// Step 1: Back-of-envelope estimation — the senior engineer's superpower

/*
SYSTEM: Twitter-like service
GIVEN:  10M Daily Active Users (DAU)

─── REQUESTS PER SECOND ──────────────────────────────────────────
DAU:            10,000,000
Sessions/day:   Each user makes ~20 requests/day
Total requests: 10M × 20 = 200,000,000/day
RPS (average):  200M / 86,400s ≈ 2,300 RPS
RPS (peak):     10× average    ≈ 23,000 RPS  ← design for this

─── STORAGE ─────────────────────────────────────────────────────
Tweets/day:     10M users × 5% post rate = 500,000 tweets/day
Tweet size:     280 chars UTF-8 ≈ 300 bytes + metadata ≈ 1KB
Text storage:   500K × 1KB = 500MB/day = ~180GB/year
Media:          20% of tweets have images, avg 1MB compressed
Media storage:  100K × 1MB = 100GB/day = ~36TB/year
Total year 1:   ~36TB (media dominates — always does)

─── BANDWIDTH ────────────────────────────────────────────────────
Read:write ratio for social: ~100:1 (read-heavy)
Read RPS:       23,000 × 0.99 ≈ 22,770
Write RPS:      23,000 × 0.01 ≈   230
Outbound BW:    22,770 RPS × 1KB avg response = ~22MB/s ≈ 180Gbps peak

─── WHAT THIS TELLS YOU ─────────────────────────────────────────
→ Read-heavy: invest in caching (Redis, CDN)
→ Storage: object store (S3) for media, not DB
→ 23K RPS: a single Node server handles ~5K — need horizontal scaling
→ Media bandwidth: CDN is mandatory, not optional
*/

export const estimate = {
  dauM: 10,
  avgRPS: 2300,
  peakRPS: 23000,
  storagePerYearTB: 36,
  readWriteRatio: '100:1',
}`,
    feedback_correct: "✅ DAU → RPS → storage → bandwidth. Always estimate peak (10x average) and identify the dominant cost (usually media/storage).",
    feedback_partial: "RPS = (DAU × requests_per_user) / 86400. Peak = 10× avg. Storage = events/day × size × 365.",
    feedback_wrong: "DAU × requests/user / 86400 = avg RPS. Peak = 10×. Storage dominated by media, not text.",
    expected: "Back-of-envelope estimation",
  },
  {
    id: "step2", type: "question", phase: "Step 2 of 5",
    paal: "Explain vertical vs horizontal scaling with concrete trade-offs. Show when each hits its ceiling.",
    answer_keywords: ["vertical", "horizontal", "stateless", "scale", "ceiling", "cost"],
    seed_code: `// Step 2: vertical vs horizontal scaling

/*
VERTICAL SCALING (Scale Up)
─────────────────────────────────────────────────────────────────
Definition: Bigger machine — more CPU, RAM, faster disk

PROS:
  ✅ Zero code changes — app doesn't need to know
  ✅ No distributed system complexity
  ✅ Low latency (no network between components)
  ✅ Simple ops — one machine to manage

CONS:
  ❌ Hard ceiling — largest AWS instance: 448 vCPUs, 24TB RAM
  ❌ Expensive at the top — doubling power often 4-10× the price
  ❌ Single point of failure — if it dies, everything dies
  ❌ Downtime to upgrade — can't hot-swap hardware

HORIZONTAL SCALING (Scale Out)
─────────────────────────────────────────────────────────────────
Definition: More machines — add servers behind a load balancer

PROS:
  ✅ Theoretically infinite — add more boxes
  ✅ Fault tolerant — one box dies, others handle traffic
  ✅ Cost-efficient — commodity hardware
  ✅ Zero-downtime deploys — rolling updates

CONS:
  ❌ Requires STATELESS services — no local session state!
  ❌ Distributed system complexity — consistency, network partitions
  ❌ Data synchronisation challenges (shared DB becomes bottleneck)
  ❌ Higher latency (network hops between services)

─── THE HYBRID APPROACH (what real systems do) ──────────────────
1. Vertically scale until pain
2. Horizontally scale stateless app servers (easy)
3. Vertically scale the DB as long as possible (hard to shard)
4. Add read replicas for read-heavy DB load
5. Shard only when absolutely necessary
*/

export const scalingDecision = (rps) => {
  if (rps < 1_000)   return 'single server — vertical scaling fine'
  if (rps < 10_000)  return 'small cluster — 2-5 app servers + managed DB'
  if (rps < 100_000) return 'horizontal app servers + read replicas + cache'
  return 'full distributed — sharding, CDN, message queues required'
}`,
    feedback_correct: "✅ Vertical = simpler but has a ceiling and SPOF. Horizontal = scalable but requires stateless design. Real systems do both.",
    feedback_partial: "Vertical: bigger machine, simpler, single point of failure. Horizontal: more machines, stateless required, fault tolerant.",
    feedback_wrong: "Vertical scaling = bigger machine (ceiling exists). Horizontal = more machines (requires stateless services).",
    expected: "Vertical vs horizontal scaling trade-offs",
  },
  {
    id: "step3", type: "question", phase: "Step 3 of 5",
    paal: "Identify the four bottleneck categories and their symptoms. Show how to diagnose each with concrete metrics.",
    answer_keywords: ["cpu", "memory", "io", "network", "bottleneck", "latency", "throughput"],
    seed_code: `// Step 3: the four bottleneck categories

/*
─── 1. CPU BOUND ────────────────────────────────────────────────
Symptom:   CPU consistently >80%. Latency grows linearly with load.
Causes:    Heavy computation — JSON parsing, crypto, image processing,
           regex on large strings, tight loops, memory copies
Diagnosis: top/htop CPU%, flame graph shows where time is spent
Solutions:
  → Move work off main thread (Worker threads, separate service)
  → Cache computed results
  → Use more efficient algorithms (O(n) not O(n²))
  → Horizontal scale — more CPU cores across machines

─── 2. MEMORY BOUND ─────────────────────────────────────────────
Symptom:   High GC pauses, swap usage, OOMKilled pods, slow response
           times that improve after GC runs
Causes:    Large in-memory datasets, memory leaks, unbounded caches
Diagnosis: process.memoryUsage(), heap snapshots, GC logs
Solutions:
  → Stream instead of loading entire dataset into memory
  → Pagination — never load unbounded result sets
  → Fix leaks — detached DOM nodes, forgotten event listeners
  → External cache (Redis) instead of in-process maps

─── 3. I/O BOUND ────────────────────────────────────────────────
Symptom:   Low CPU, high latency, threads/event loop waiting
Causes:    Slow DB queries, N+1 queries, disk reads, no connection pooling
Diagnosis: Slow query logs, EXPLAIN ANALYZE, DB wait times
Solutions:
  → Indexes on queried columns
  → Eliminate N+1 with JOIN or batched queries (DataLoader pattern)
  → Connection pooling (PgBouncer, pool config in ORM)
  → Read replicas for read-heavy load
  → Cache hot data (Redis)

─── 4. NETWORK BOUND ────────────────────────────────────────────
Symptom:   High latency between services, bandwidth saturation
Causes:    Chatty microservices, large payloads, no compression, wrong region
Diagnosis: Network throughput metrics, service call traces
Solutions:
  → Batch requests (one call not ten)
  → Compress responses (gzip/brotli)
  → CDN for static assets
  → Co-locate services in the same region/AZ
  → Use binary protocols (protobuf) for internal services
*/

// In Node.js — detect the bottleneck type:
const diagnosisHints = {
  cpu:     'CPU >80% sustained | flame graph | slow even with no I/O',
  memory:  'RSS growing | GC pauses | OOMKilled | swap in use',
  io:      'CPU low but latency high | DB wait time | slow queries',
  network: 'inter-service latency | bandwidth saturation | many small calls',
}

export { diagnosisHints }`,
    feedback_correct: "✅ CPU, Memory, I/O, Network — diagnose each differently, fix each differently. I/O is the most common in web services.",
    feedback_partial: "CPU: computation. Memory: data size + leaks. I/O: DB queries. Network: inter-service calls. Each has different tools.",
    feedback_wrong: "4 categories: CPU (flame graph), Memory (heap snapshot), I/O (slow query log), Network (trace spans).",
    expected: "Four bottleneck categories and diagnosis",
  },
  {
    id: "step4", type: "question", phase: "Step 4 of 5",
    paal: "Design the read path and write path separately for a read-heavy social feed. Show how 100:1 read:write ratio drives architecture.",
    answer_keywords: ["read", "write", "cache", "replica", "fanout", "cqrs"],
    seed_code: `// Step 4: read-heavy vs write-heavy architecture

/*
SOCIAL FEED — 100:1 read:write ratio
(100 timeline reads for every 1 post written)

─── NAIVE APPROACH (doesn't scale) ─────────────────────────────
Read feed: SELECT * FROM posts WHERE user_id IN (following_ids)
           ORDER BY created_at DESC LIMIT 20

Lessons:
  ❌ Complex query joins at read time
  ❌ Slow for users following thousands of people
  ❌ Hits DB on every feed request
  ❌ Can't cache easily (different for every user)

─── OPTIMISED READ PATH ─────────────────────────────────────────
Strategy: Pre-compute feeds on write, cache aggressively

WRITE PATH (rare — only when user posts):
  1. Save post to Posts table (source of truth)
  2. Fanout: for each of user's N followers, push post ID to their feed cache
     - Small follower count (<10K): sync fanout
     - Large follower count (celebrities): async fanout via queue
  3. Publish event to feed-update topic (for real-time)

READ PATH (frequent — every timeline load):
  1. Check Redis: GET feed:{userId} → list of post IDs
  2. Cache HIT: return IDs, fetch post details (also cached)
  3. Cache MISS: build feed from DB, populate cache, return
  4. CDN caches rendered HTML/JSON for public profiles

─── CQRS PATTERN (Command Query Responsibility Segregation) ─────
Write side: normalised DB (MySQL/Postgres) — handles writes
Read side:  denormalised read model (Redis, Elasticsearch, read replica)
            pre-computed, query-optimised for the specific read pattern

The KEY insight:
  The write data model and read data model can be DIFFERENT.
  Optimise each independently.
*/

export const feedArchitecture = {
  writeLatency: 'p99 < 500ms (async fanout via queue for celebrities)',
  readLatency:  'p99 < 50ms (served from Redis cache)',
  cacheHitRate: '>95% for active users',
  storageTrade: 'Store feed per user in Redis = more storage, way faster reads',
}`,
    feedback_correct: "✅ Pre-compute on write, serve from cache on read. CQRS separates write and read models. Fanout handles the N-follower lesson.",
    feedback_partial: "Read-heavy = cache the read result. Write fanout = push to all follower caches on post. CQRS = different models for reads vs writes.",
    feedback_wrong: "Cache feeds in Redis (pre-computed). Fanout on write. Read from cache. CQRS = separate read/write data models.",
    expected: "Read vs write path architecture",
  },
  {
    id: "step5", type: "question", phase: "Step 5 of 5",
    paal: "Apply the 80/20 rule to performance: show that adding a cache, an index, and connection pooling beats re-architecting everything.",
    answer_keywords: ["80/20", "cache", "index", "connection pool", "pareto", "quick wins"],
    seed_code: `// Step 5: 80/20 performance — the quick wins that matter most

/*
PARETO PRINCIPLE IN SYSTEM PERFORMANCE:
80% of your performance gains come from 20% of the changes.

Ranked by impact-to-effort ratio:

─── TIER 1: DO THESE FIRST (hours of work, massive impact) ──────

1. ADD MISSING INDEXES
   Before: SELECT * FROM orders WHERE user_id = 123  → full table scan, 2s
   After:  CREATE INDEX idx_orders_user_id ON orders(user_id)  → 2ms
   Impact: 1000× speedup. Most overlooked optimisation.

2. ADD A CACHE LAYER
   Before: Every request hits DB — 50ms per query
   After:  Redis cache with 1hr TTL — 0.1ms for cache hits, 95% hit rate
   Impact: 95% of DB load eliminated for read-heavy endpoints

3. FIX N+1 QUERIES
   Before: Load 100 posts, then SELECT user WHERE id=X for each → 101 queries
   After:  SELECT posts JOIN users → 1 query
   Impact: 100× fewer DB round trips

4. ENABLE CONNECTION POOLING
   Before: New DB connection per request — 50ms connection setup
   After:  PgBouncer pool — connections reused, 0ms setup
   Impact: Eliminates connection overhead entirely

─── TIER 2: MEDIUM EFFORT, HIGH IMPACT ──────────────────────────

5. PAGINATION — Never return unbounded result sets
6. COMPRESSION — gzip responses (70-80% bandwidth reduction)
7. CDN — serve static assets from edge (50-300ms → <10ms)

─── TIER 3: ONLY IF TIER 1+2 AREN'T ENOUGH ─────────────────────

8. Database sharding (months of work, use as last resort)
9. Microservices decomposition (years, introduces complexity)
10. Custom data structures / storage engines

→ DO 1-4 BEFORE TOUCHING YOUR ARCHITECTURE.
  Most "we need to rewrite" situations are actually "we need an index".
*/

export const quickWins = [
  { action: 'Add index on hot query columns', effort: 'minutes', impact: '10-1000×' },
  { action: 'Add Redis cache to read endpoints', effort: 'hours', impact: '10-100×' },
  { action: 'Fix N+1 queries', effort: 'hours', impact: '10-100×' },
  { action: 'Enable connection pooling', effort: 'minutes', impact: '2-10×' },
  { action: 'Paginate all list endpoints', effort: 'hours', impact: 'prevents OOM' },
]`,
    feedback_correct: "✅ Index → Cache → Fix N+1 → Pool connections. In that order. This solves 80% of real-world performance lessons.",
    feedback_partial: "Missing index, N+1 queries, no connection pool, no cache — these four cause most production slowdowns.",
    feedback_wrong: "Tier 1: add index, add cache, fix N+1, enable pooling. Do ALL of these before re-architecting anything.",
    expected: "80/20 performance quick wins",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Back-of-envelope", id: "step1" },
  { label: "Step 2 — Vertical vs Horizontal", id: "step2" },
  { label: "Step 3 — Bottlenecks", id: "step3" },
  { label: "Step 4 — Read vs Write path", id: "step4" },
  { label: "Step 5 — 80/20 quick wins", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: "SD-01", title: "Scale, Load & Bottlenecks", shortName: "SD — SCALE" });
