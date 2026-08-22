import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "SYSTEM DESIGN #3",
      title: "Database Design — Indexes, Normalization & Sharding",
      body: `The database is almost always the bottleneck.
Schema design decisions made at the start of a project
haunt you for years. These are the ones that matter most:

Indexes     — the single highest ROI optimisation in any DB
Normalization — 1NF, 2NF, 3NF vs denormalization trade-offs
Sharding    — how to split a DB across machines (and why to avoid it)
Replication — primary + replicas for read scaling and failover
Transactions — ACID, isolation levels, and what they actually mean

A senior engineer knows: "Can I add an index to fix this?"
is the first question. Sharding is the last resort.`,
      usecase: `Every production database has missing indexes causing slow queries, suboptimal schemas causing either update anomalies or join hell, and replication lag causing consistency bugs. This is the foundation.`,
    },
  },
  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Choose indexes correctly: B-tree, composite, partial, covering",
      "Know when an index hurts instead of helps",
      "Normalise to 3NF and know when to deliberately denormalise",
      "Explain ACID and the four transaction isolation levels",
      "Design a sharding strategy: by range, hash, or directory",
      "Set up read replicas and understand replication lag implications",
    ],
  },
  {
    id: "step1", type: "question", phase: "Step 1 of 5",
    paal: "Design indexes for a query: choose between single-column, composite, partial, and covering indexes. Show EXPLAIN ANALYZE output before and after.",
    answer_keywords: ["index", "composite", "covering", "explain", "seq scan", "btree"],
    seed_code: `-- Step 1: indexing strategy

-- THE TABLE:
CREATE TABLE orders (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL,
  status      VARCHAR(20) NOT NULL,  -- 'pending', 'shipped', 'delivered', 'cancelled'
  total       NUMERIC(10,2),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── COMMON QUERIES WE NEED TO OPTIMISE ────────────────────────

-- Q1: Get all orders for a user (most frequent):
-- SELECT * FROM orders WHERE user_id = 123 ORDER BY created_at DESC;
-- WITHOUT INDEX: Seq Scan — reads every row → O(n) slow

-- SINGLE COLUMN INDEX:
CREATE INDEX idx_orders_user_id ON orders(user_id);
-- BETTER: Index Scan → fast, but still fetches all columns from heap

-- COMPOSITE INDEX (covers ORDER BY too):
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at DESC);
-- BEST for Q1: Index-only range scan, no sort needed

-- Q2: Find pending orders (filtering on low-cardinality column):
-- SELECT * FROM orders WHERE status = 'pending';
-- Bad idea to index 'status' alone — only 4 values, table scan faster for >5%

-- PARTIAL INDEX (index only the interesting subset):
CREATE INDEX idx_orders_pending ON orders(created_at)
  WHERE status = 'pending';
-- Tiny index (only pending rows) → very fast for this specific query

-- Q3: Dashboard — count by status for a user (covering index):
-- SELECT status, COUNT(*) FROM orders WHERE user_id=123 GROUP BY status;
CREATE INDEX idx_orders_covering ON orders(user_id) INCLUDE (status);
-- COVERING: query answered entirely from index — zero heap access

-- EXPLAIN ANALYZE to verify:
-- EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM orders WHERE user_id = 123;
-- Look for: "Index Scan" not "Seq Scan", low "Buffers: shared hit"`,
    feedback_correct: "✅ Composite indexes for multi-column queries. Partial indexes for filtered subsets. Covering indexes eliminate heap access.",
    feedback_partial: "Single-col for simple lookups. Composite(a,b) for WHERE a AND ORDER BY b. Partial WHERE condition. INCLUDE for covering.",
    feedback_wrong: "CREATE INDEX ON orders(user_id, created_at DESC) — composite covers WHERE + ORDER BY. INCLUDE(col) makes it covering.",
    expected: "Index types and selection strategy",
  },
  {
    id: "step2", type: "question", phase: "Step 2 of 5",
    paal: "Normalise a flat user-order-product table to 3NF. Then show a deliberate denormalisation decision for read performance.",
    answer_keywords: ["normalization", "3nf", "1nf", "2nf", "denormalize", "anomaly"],
    seed_code: `-- Step 2: Normalization to 3NF and deliberate denormalization

-- ── UNNORMALISED (everything in one table) ────────────────────
-- orders(order_id, user_id, user_name, user_email,
--        product_id, product_name, product_price,
--        qty, order_total, order_date)
--
-- Lessons:
-- Update anomaly: user_name in 1000 rows — change name → update 1000 rows
-- Insert anomaly: can't add a user without an order
-- Delete anomaly: delete last order → lose user data

-- ── 1NF: atomic values, no repeating groups ────────────────────
-- Already atomic — but still has transitive dependencies

-- ── 2NF: no partial dependencies on composite key ─────────────
-- (not applicable here — single column PK)

-- ── 3NF: no transitive dependencies ─────────────────────────────
CREATE TABLE users (
  id    BIGSERIAL PRIMARY KEY,
  name  VARCHAR(200) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL
);

CREATE TABLE products (
  id    BIGSERIAL PRIMARY KEY,
  name  VARCHAR(200) NOT NULL,
  price NUMERIC(10,2) NOT NULL
);

CREATE TABLE orders (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id         BIGSERIAL PRIMARY KEY,
  order_id   BIGINT REFERENCES orders(id),
  product_id BIGINT REFERENCES products(id),
  qty        INT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL  -- snapshot price at purchase time
);
-- unit_price is intentionally denormalised here:
-- product price can change after purchase — we need the price AT THAT MOMENT

-- ── DELIBERATE DENORMALIZATION ────────────────────────────────
-- Lesson: ORDER HISTORY page needs user_name + items + product_names
-- 3NF requires 4 table JOINs for every page load → slow

-- Solution: materialised view or summary table:
CREATE TABLE order_summaries (
  order_id    BIGINT PRIMARY KEY,
  user_name   VARCHAR(200),   -- denormalised copy
  item_count  INT,
  total       NUMERIC(10,2),
  created_at  TIMESTAMPTZ
);
-- Updated by trigger or background job on order completion
-- Read path: single table scan, no JOINs ← fast
-- Trade-off: storage cost + sync complexity ← acceptable for read-heavy pages`,
    feedback_correct: "✅ 3NF eliminates update/insert/delete anomalies. Deliberate denormalisation for read-heavy paths is a valid, conscious trade-off.",
    feedback_partial: "3NF: each column depends on the key, the whole key, nothing but the key. Denormalise consciously for read performance.",
    feedback_wrong: "Separate tables for users, products, orders, order_items. Denormalise only when 3NF join cost is measurably too high.",
    expected: "Normalization to 3NF and denormalization",
  },
  {
    id: "step3", type: "question", phase: "Step 3 of 5",
    paal: "Explain the four ACID properties and the four transaction isolation levels. Show which bugs each isolation level allows.",
    answer_keywords: ["acid", "isolation", "dirty read", "phantom", "serializable", "repeatable read"],
    seed_code: `-- Step 3: ACID and transaction isolation levels

/*
─── ACID PROPERTIES ──────────────────────────────────────────────
A — Atomicity:   All or nothing. Partial writes don't exist.
C — Consistency: Transaction takes DB from one valid state to another.
I — Isolation:   Concurrent transactions don't interfere.
D — Durability:  Committed data survives crashes (written to disk/WAL).

─── THE FOUR ISOLATION LEVELS (weakest → strongest) ──────────────
Each higher level prevents more bugs but costs more performance.

LEVEL 1: READ UNCOMMITTED
  Allows: Dirty reads (reading uncommitted data from another transaction)
  Bug:    T1 reads a value that T2 later rolls back → T1 used ghost data
  Use:    Almost never. Dirty reads are almost always wrong.

LEVEL 2: READ COMMITTED (PostgreSQL default)
  Prevents: Dirty reads
  Allows:   Non-repeatable reads (same row, different value on re-read)
  Bug:      T1 reads balance=$100. T2 updates to $50 and commits.
            T1 re-reads: $50 now. T1 made decisions based on $100. ← bug
  Use:      Fine for most web requests (short transactions)

LEVEL 3: REPEATABLE READ
  Prevents: Dirty reads, non-repeatable reads
  Allows:   Phantom reads (new rows appear in a repeated range query)
  Bug:      T1: SELECT COUNT(*) FROM orders WHERE status='pending' → 5
            T2: INSERT a new pending order and commits.
            T1: SELECT COUNT(*) again → 6. Phantom appeared.
  Use:      Financial calculations, inventory checks

LEVEL 4: SERIALIZABLE (strongest)
  Prevents: All of the above
  Guarantees: Transactions behave as if run one at a time
  Cost:       Highest — may cause serialization failures (retry required)
  Use:        Bank transfers, anything where "I checked then acted" must be atomic
*/

-- Set isolation level for a transaction:
-- BEGIN;
-- SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
-- ... your queries ...
-- COMMIT;

-- PostgreSQL default is READ COMMITTED — good for most web apps
-- Use SERIALIZABLE for: balance transfers, inventory deductions, seat booking

SELECT current_setting('transaction_isolation');  -- check current level`,
    feedback_correct: "✅ READ COMMITTED prevents dirty reads (default). REPEATABLE READ also prevents re-read changes. SERIALIZABLE prevents phantoms too.",
    feedback_partial: "4 levels: Read Uncommitted → Read Committed → Repeatable Read → Serializable. Each prevents one more type of anomaly.",
    feedback_wrong: "Read Committed (default): no dirty reads. Repeatable Read: same reads in same tx. Serializable: full isolation, slowest.",
    expected: "ACID and transaction isolation levels",
  },
  {
    id: "step4", type: "question", phase: "Step 4 of 5",
    paal: "Design a sharding strategy. Compare hash sharding vs range sharding vs directory-based. Show the hot-spot lesson.",
    answer_keywords: ["sharding", "hash", "range", "hot spot", "shard key", "consistent hashing"],
    seed_code: `// Step 4: database sharding strategies

/*
SHARDING = splitting data across multiple DB instances (horizontal partition)
DO THIS LAST — it's the most complex operation in distributed systems.
Most systems never need it. Add read replicas and caching first.

─── SHARD KEY SELECTION ──────────────────────────────────────────
The most important decision. A bad shard key causes:
  • Hot spots (one shard gets all the traffic)
  • Inefficient cross-shard queries (requires scatter-gather)
  • Uneven data distribution

─── RANGE SHARDING ───────────────────────────────────────────────
Shard 1: user_id 1 – 1,000,000
Shard 2: user_id 1,000,001 – 2,000,000
Shard 3: user_id 2,000,001+

PROS: Range queries are fast (one shard)
CONS: HOT SPOT — new users always go to the last shard. Uneven load.
USE:  Time-series data (shard by date) with clear access patterns

─── HASH SHARDING ────────────────────────────────────────────────
shard = hash(user_id) % num_shards

PROS: Even distribution — no hot spots
CONS: Range queries are impossible (data is scattered)
     Adding shards = resharding all data (unless consistent hashing)
USE:  User data, session data — accessed by exact ID

─── CONSISTENT HASHING (solves resharding lesson) ───────────────
Nodes placed on a virtual ring. Each node owns a range of the ring.
Adding a node: only redistribute that node's neighbour's data (not all)
Used by: DynamoDB, Cassandra, Redis Cluster
*/

function hashShard(id, numShards) {
  // Simple hash (production: use MD5/xxHash for better distribution)
  const hash = id.toString().split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return hash % numShards
}

// ─── DIRECTORY-BASED SHARDING ─────────────────────────────────
// A separate lookup service maps entity → shard
// PROS: Maximum flexibility, easy resharding
// CONS: Lookup service is now critical path + potential bottleneck
const shardDirectory = new Map([
  ['tenant-a', 'shard-1'],
  ['tenant-b', 'shard-2'],
  ['tenant-c', 'shard-1'],  // multiple tenants can share a shard
])

function getShard(tenantId) {
  return shardDirectory.get(tenantId) ?? 'shard-1'
}

export { hashShard, getShard }`,
    feedback_correct: "✅ Hash = even distribution, no range queries. Range = good range queries, hot spots. Directory = flexible, adds complexity.",
    feedback_partial: "Hash sharding: shard = hash(key) % n — even but no ranges. Range: ordered but hot spots. Consistent hashing solves resharding.",
    feedback_wrong: "Hash sharding: shard = hash(id) % numShards. Range: shard by value range. Directory: lookup table maps key to shard.",
    expected: "Sharding strategies and trade-offs",
  },
  {
    id: "step5", type: "question", phase: "Step 5 of 5",
    paal: "Set up primary-replica replication. Show replication lag implications and how to route reads vs writes correctly.",
    answer_keywords: ["replication", "primary", "replica", "lag", "read", "write", "eventual consistency"],
    seed_code: `// Step 5: read replicas and replication lag

/*
─── REPLICATION ARCHITECTURE ─────────────────────────────────────
Primary (leader):  handles ALL writes + strong-consistency reads
Replica(s):        handle read-only queries + serve as failover

Data flow: Primary → WAL (Write-Ahead Log) → Replica(s)
Lag:       Replicas are BEHIND the primary by milliseconds to seconds

─── WHAT REPLICATION LAG MEANS ──────────────────────────────────
User updates their profile (write → primary).
User immediately requests their profile (read → replica).
Replica hasn't received the update yet → user sees OLD data.
This is "read-your-writes" consistency lesson.

─── ROUTING STRATEGY ─────────────────────────────────────────────
*/

class DatabaseRouter {
  constructor(primary, replicas) {
    this.primary  = primary   // one write connection
    this.replicas = replicas  // pool of read connections
    this.rrIndex  = 0         // round-robin counter
  }

  // WRITE — always primary:
  write(query, params) {
    return this.primary.query(query, params)
  }

  // READ — round-robin across replicas:
  read(query, params) {
    const replica = this.replicas[this.rrIndex % this.replicas.length]
    this.rrIndex++
    return replica.query(query, params)
  }

  // READ-YOUR-WRITES — user must see their own changes immediately:
  readOwn(query, params) {
    return this.primary.query(query, params)  // go to primary for consistency
  }

  // READ WITH STALENESS TOLERANCE:
  readStale(query, params, maxLagMs = 5000) {
    // Filter replicas by acceptable lag:
    const fresh = this.replicas.filter(r => r.lagMs < maxLagMs)
    const pool  = fresh.length ? fresh : [this.primary]  // fallback to primary
    return pool[0].query(query, params)
  }
}

/*
─── ROUTING RULES ────────────────────────────────────────────────
Always primary:    POST/PUT/DELETE handlers (writes)
                   Immediately after a write (read-your-writes)
                   Financial/inventory queries (strong consistency needed)
                   Admin dashboards

Replicas OK:       Public content (articles, products, user profiles)
                   Search results
                   Analytics queries
                   Any endpoint where slight staleness is acceptable
*/

export { DatabaseRouter }`,
    feedback_correct: "✅ Write to primary, read from replicas. Route to primary for read-your-writes consistency. Measure and monitor replication lag.",
    feedback_partial: "Primary for writes + strong reads. Replicas for read scale. Lag = replicas may be stale. Route read-your-writes to primary.",
    feedback_wrong: "All writes → primary. Reads → replicas (but route to primary for read-your-writes). Monitor replica lag.",
    expected: "Read replicas and replication lag routing",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Indexing strategy", id: "step1" },
  { label: "Step 2 — Normalization", id: "step2" },
  { label: "Step 3 — ACID & Isolation", id: "step3" },
  { label: "Step 4 — Sharding", id: "step4" },
  { label: "Step 5 — Replication", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: "SD-03", title: "Database Design", shortName: "SD — DATABASE" });
