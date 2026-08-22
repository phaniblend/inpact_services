import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "SYSTEM DESIGN #6",
      title: "CAP Theorem & Distributed Systems",
      body: `The CAP theorem states that a distributed system can only
guarantee TWO of these three properties simultaneously:

  Consistency   — every read returns the most recent write
  Availability  — every request gets a response (not an error)
  Partition Tolerance — system works despite network splits

Since network partitions are a reality (not optional),
you actually choose between CP and AP.

But CAP is just the start. Real systems need:
  PACELC — extends CAP to include latency trade-offs
  Eventual consistency — how AP systems stay correct
  Vector clocks — how distributed nodes track causality
  Consensus algorithms — Raft, Paxos (how Kafka, etcd work)

Understanding these lets you reason about DynamoDB vs
PostgreSQL vs Cassandra trade-offs with precision.`,
      usecase: `Choosing between databases, explaining why your distributed cache sometimes returns stale data, designing multi-region systems, passing staff engineer system design interviews.`,
    },
  },
  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Apply the CAP theorem to classify real databases",
      "Explain eventual consistency and the BASE model",
      "Understand PACELC — the extension that adds latency",
      "Explain how Raft consensus enables distributed agreement",
      "Design a multi-region active-active vs active-passive strategy",
      "Know the consistency models: strong, causal, read-your-writes, eventual",
    ],
  },
  {
    id: "step1", type: "question", phase: "Step 1 of 5",
    paal: "Classify real databases using CAP. Explain what happens to each during a network partition.",
    answer_keywords: ["cap", "consistency", "availability", "partition", "cp", "ap"],
    seed_code: `// Step 1: CAP theorem — classifying real databases

/*
THE SETUP:
  You have nodes A and B. Network between them is cut (partition).
  A write arrives at node A. Node B can't sync with A.
  Now a read arrives at node B. What does the system do?

  CP (Consistency + Partition Tolerance):
    Node B REFUSES the read (returns error).
    Guarantees: you never read stale data.
    Cost: unavailability during partition.

  AP (Availability + Partition Tolerance):
    Node B serves STALE data (the old value).
    Guarantees: you always get a response.
    Cost: data may be outdated.

─── REAL DATABASE CLASSIFICATIONS ───────────────────────────────

CP SYSTEMS (choose consistency over availability):
  PostgreSQL    — single primary writes, read replicas, strong consistency
  MySQL         — same model
  Redis         — single-node is CP; Redis Cluster is CP by default
  MongoDB       — default is CP (primary-only writes)
  HBase         — CP, built on HDFS
  etcd          — strongly CP (Raft consensus, used for Kubernetes config)
  Zookeeper     — strongly CP

  Behaviour during partition: returns error or times out.
  Use when: financial data, inventory, any "must be accurate" data.

AP SYSTEMS (choose availability over consistency):
  DynamoDB      — AP by default (eventually consistent reads)
  Cassandra     — AP by design ("always writable")
  CouchDB       — AP with conflict resolution
  DNS           — classic AP (cached records may be stale)

  Behaviour during partition: serves stale data.
  Use when: user profiles, shopping carts, social feeds, counters.
  Requires: conflict resolution strategy (last-write-wins, CRDTs)

CA SYSTEMS (no partition tolerance — only in theory):
  Single-node databases, single-region SQL
  "CA" is theoretically possible but partition tolerance is non-negotiable
  in any distributed system — so CA = "runs on one machine".
*/

export const capClassification = {
  postgresql:  'CP — consistent, unavailable during partition',
  dynamodb:    'AP — available, eventually consistent by default',
  cassandra:   'AP — always writable, tunable consistency',
  redis:       'CP — consistent, single primary',
  etcd:        'CP — Raft consensus, strongly consistent',
  dns:         'AP — cached, eventually consistent',
}`,
    feedback_correct: "✅ CP = error during partition (consistent). AP = stale data during partition (available). CA = single machine only.",
    feedback_partial: "CP systems: PostgreSQL, etcd, Redis. AP systems: DynamoDB, Cassandra, DNS. Partition tolerance is always required in distributed systems.",
    feedback_wrong: "CP: error during partition but consistent. AP: stale data during partition but available. Choose based on data correctness needs.",
    expected: "CAP theorem database classification",
  },
  {
    id: "step2", type: "question", phase: "Step 2 of 5",
    paal: "Explain eventual consistency and the BASE model. Show read-your-writes and causal consistency as practical middle grounds.",
    answer_keywords: ["eventual consistency", "base", "acid", "read-your-writes", "causal", "stale"],
    seed_code: `// Step 2: consistency models — a spectrum

/*
ACID (traditional relational DBs):
  Atomicity, Consistency, Isolation, Durability
  Strong consistency — every read sees the latest write
  Cost: high latency, lower availability in distributed settings

BASE (AP distributed systems):
  Basically Available — system works, even if some nodes fail
  Soft state        — state may change without input (sync in progress)
  Eventually consistent — data WILL be consistent, but maybe not right now

─── THE CONSISTENCY SPECTRUM (strong → weak) ─────────────────────

1. STRONG CONSISTENCY (linearisability)
   Every read sees the most recent write, guaranteed.
   Cost: highest latency (must coordinate all nodes before responding)
   Example: etcd, PostgreSQL primary read, DynamoDB with strong reads

2. CAUSAL CONSISTENCY
   If A causes B, everyone sees A before B.
   Writes from the same client appear in order.
   Cost: medium — only coordinate causally related operations
   Example: MongoDB causally consistent sessions

3. READ-YOUR-WRITES (session consistency)
   You always see your own writes (but not necessarily others').
   Cost: low — just route the same user to the same replica
   Example: DynamoDB with conditional writes, primary routing

4. MONOTONIC READ CONSISTENCY
   If you read value V, you never read an older value afterwards.
   Prevents: seeing new data then old data (time travelling backwards)

5. EVENTUAL CONSISTENCY (weakest)
   Given no new writes, all replicas WILL converge to the same value.
   Doesn't say WHEN. Could be milliseconds or seconds.
   Cost: lowest latency, highest availability
   Example: DNS, DynamoDB default, S3 metadata
*/

// Practical: DynamoDB consistency options
async function getUser(userId, requireFresh = false) {
  return dynamodb.getItem({
    TableName: 'users',
    Key: { id: { S: userId } },
    // Strong read: always hits primary (2× cost, guaranteed fresh)
    // Eventually consistent: may hit replica (1× cost, may be stale)
    ConsistentRead: requireFresh,
  })
}

// Use strong reads for: checkout, payments, anything after a write
// Use eventual reads for: browse pages, listings, analytics

export { getUser }`,
    feedback_correct: "✅ Strong→Causal→Read-your-writes→Monotonic→Eventual. Each trades consistency for latency/availability. Match to use case.",
    feedback_partial: "BASE = Basically Available, Soft state, Eventually consistent. Eventual = will converge, not when. Choose per-operation.",
    feedback_wrong: "Strong: always fresh, highest cost. Eventual: may be stale, lowest cost. Read-your-writes: see your own changes immediately.",
    expected: "Consistency models spectrum and BASE",
  },
  {
    id: "step3", type: "question", phase: "Step 3 of 5",
    paal: "Explain PACELC — the model that extends CAP to include normal-operation latency trade-offs.",
    answer_keywords: ["pacelc", "latency", "consistency", "else", "partition", "normal operation"],
    seed_code: `// Step 3: PACELC — the better model

/*
CAP LIMITATION:
  CAP only describes behaviour DURING a network partition.
  But partitions are rare. What about NORMAL operation?
  Normal operation also has a latency vs consistency trade-off.

PACELC = Partition → Availability vs Consistency
         Else (normal) → Latency vs Consistency

Full form:
  IF Partition: choose Availability OR Consistency
  ELSE (no partition): choose Latency OR Consistency

─── READING THE CLASSIFICATION ──────────────────────────────────

System         | Partition | Normal Op   | PACELC Class
──────────────────────────────────────────────────────────────────
DynamoDB       | A         | L (low lat) | PA/EL
               → favours availability AND low latency

Cassandra      | A         | L           | PA/EL
               → always writable, low latency, eventual consistency

PostgreSQL     | C         | C           | PC/EC
               → consistent during partition AND in normal operation

MongoDB        | C (def.)  | C (def.)    | PC/EC
               → primary-only writes, consistent by default

BigTable/HBase | C         | L           | PC/EL
               → consistent during partition, optimises latency normally

Megastore      | C         | L           | PC/EL

─── WHAT THIS MEANS PRACTICALLY ─────────────────────────────────

PA/EL (DynamoDB, Cassandra):
  "We optimise for speed and uptime. Data might be slightly stale."
  Perfect for: shopping carts, user activity, counters, feeds

PC/EC (PostgreSQL):
  "We optimise for correctness. Reads may be slower but always accurate."
  Perfect for: financial transactions, inventory, user auth

PC/EL (Spanner, Megastore):
  "We optimise for correctness during failures AND speed normally."
  Achieved via: GPS-synchronised atomic clocks (Google Spanner)
  Cost: expensive to build and operate

─── TUNABLE CONSISTENCY (Cassandra) ─────────────────────────────
Cassandra lets you choose per-operation:
  ONE    → fastest, least consistent (1 node must respond)
  QUORUM → balanced (majority of nodes must agree)
  ALL    → slowest, most consistent (all nodes must respond)
*/

export const pacelcMatrix = {
  DynamoDB:   { partition: 'A', normal: 'L', class: 'PA/EL' },
  Cassandra:  { partition: 'A', normal: 'L', class: 'PA/EL' },
  PostgreSQL: { partition: 'C', normal: 'C', class: 'PC/EC' },
  Spanner:    { partition: 'C', normal: 'L', class: 'PC/EL' },
}`,
    feedback_correct: "✅ PACELC extends CAP to cover normal operation. PA/EL = fast + available. PC/EC = consistent. PC/EL = best of both but expensive.",
    feedback_partial: "PACELC: during Partition choose A or C. Else (normal) choose L or C. DynamoDB=PA/EL. PostgreSQL=PC/EC.",
    feedback_wrong: "PACELC adds normal-operation trade-off. DynamoDB/Cassandra = PA/EL (fast, eventual). PostgreSQL = PC/EC (consistent, higher latency).",
    expected: "PACELC model",
  },
  {
    id: "step4", type: "question", phase: "Step 4 of 5",
    paal: "Explain how Raft consensus works. Show how it ensures a distributed cluster agrees on a single leader and log order.",
    answer_keywords: ["raft", "leader", "follower", "election", "log", "quorum", "commit"],
    seed_code: `// Step 4: Raft consensus — how distributed systems agree

/*
THE PROBLEM:
  5 nodes must agree on the order of writes.
  Any node might crash. Network might partition.
  How do they AGREE on what happened and in what order?

RAFT SOLVES THIS via:
  1. Leader election
  2. Log replication
  3. Safety guarantees

─── RAFT ROLES ───────────────────────────────────────────────────
LEADER    — receives all writes, replicates to followers
FOLLOWER  — accepts log entries from leader
CANDIDATE — running for leader (during election)

─── HOW RAFT WORKS ──────────────────────────────────────────────

STEP 1: LEADER ELECTION
  All nodes start as followers.
  If a follower doesn't hear from a leader (election timeout: 150-300ms):
    → converts to CANDIDATE
    → increments its "term" (epoch counter)
    → votes for itself, requests votes from others
  First candidate to get MAJORITY votes becomes LEADER.
  Majority = (n/2 + 1) nodes, e.g. 3 of 5.

STEP 2: LOG REPLICATION
  All writes go to the LEADER.
  Leader appends to its log → sends AppendEntries to all followers.
  Once MAJORITY acknowledge → entry is COMMITTED.
  Leader notifies followers of commit → they apply to state machine.
  A write can succeed even if 1-2 followers are slow/dead.

STEP 3: SAFETY
  A candidate can only win election if its log is AT LEAST AS UP-TO-DATE
  as the majority. This prevents stale nodes becoming leader.
  Committed entries are NEVER lost — guaranteed by the quorum requirement.

─── WHAT USES RAFT ───────────────────────────────────────────────
  etcd       — Kubernetes config store (built on Raft)
  CockroachDB — distributed SQL
  TiKV       — distributed key-value
  Kafka KRaft — replacing Zookeeper in new Kafka versions
  Consul     — service discovery

─── WHAT USES PAXOS (similar, older, harder to understand) ───────
  Google Chubby, Google Spanner, Cassandra (lightweight transactions)

─── QUORUM AND FAULT TOLERANCE ──────────────────────────────────
  3 nodes: tolerates 1 failure (needs 2 to agree)
  5 nodes: tolerates 2 failures (needs 3 to agree)
  7 nodes: tolerates 3 failures (needs 4 to agree)
  Rule: can tolerate at most (n-1)/2 failures
*/

export const raftFacts = {
  electionTimeout: '150-300ms random (randomness prevents split votes)',
  commitQuorum: 'majority (n/2 + 1)',
  faultTolerance: 'n nodes tolerates floor((n-1)/2) failures',
  guarantees: ['no split brain', 'committed entries never lost', 'linearisable reads from leader'],
}`,
    feedback_correct: "✅ Raft: elect a leader (majority vote), replicate through leader, commit when majority acknowledge. Used by etcd, Kafka KRaft, CockroachDB.",
    feedback_partial: "Raft: Leader election via majority vote. Log replication: leader → followers, commit on majority ack. Tolerates (n-1)/2 failures.",
    feedback_wrong: "Leader elected by majority. All writes go to leader. Committed after majority ack. 5 nodes tolerates 2 failures.",
    expected: "Raft consensus algorithm",
  },
  {
    id: "step5", type: "question", phase: "Step 5 of 5",
    paal: "Design a multi-region strategy: active-passive vs active-active. Show the trade-offs in latency, consistency, and complexity.",
    answer_keywords: ["multi-region", "active-passive", "active-active", "failover", "latency", "conflict"],
    seed_code: `// Step 5: multi-region architecture patterns

/*
─── ACTIVE-PASSIVE (simpler, more consistent) ────────────────────

Architecture:
  Primary region (us-east-1): handles ALL reads and writes
  Standby region (eu-west-1): receives replication, serves no traffic

Failover:
  Primary fails → DNS cutover to standby (5-30 minute RTO)
  RPO (data loss window): seconds to minutes of replication lag

PROS:
  ✅ No write conflicts — single writer
  ✅ Strong consistency across regions
  ✅ Simpler to reason about and operate

CONS:
  ❌ Users in EU have high latency (writes go to US)
  ❌ Standby is "wasted" capacity during normal operation
  ❌ Failover is not instant (DNS TTL, health check delay)
  ❌ Single point of failure (the primary region)

Use for: internal tools, B2B apps, anything where global latency doesn't matter

─── ACTIVE-ACTIVE (faster, more complex) ────────────────────────

Architecture:
  Both regions (us-east-1, eu-west-1): handle reads AND writes
  Writes replicated bidirectionally
  Users routed to nearest region (GeoDNS or anycast)

WRITE CONFLICTS:
  User A in US and User B in EU modify the same record simultaneously.
  Who wins?
  → Last Write Wins (LWW): higher timestamp wins (may lose data)
  → CRDTs: conflict-free replicated data types (counters, sets)
  → Application-level resolution: business logic decides
  → Optimistic locking with vector clocks: detect and surface conflicts

PROS:
  ✅ Lowest latency — writes go to nearest region
  ✅ Full fault tolerance — either region can serve all traffic
  ✅ No wasted capacity

CONS:
  ❌ Write conflicts are a reality — must handle them
  ❌ Much harder to operate and reason about
  ❌ Eventual consistency between regions (replication lag)
  ❌ More expensive

Use for: global consumer apps, any app where latency is product-critical

─── THE DECISION ─────────────────────────────────────────────────
Start with active-passive. Move to active-active only when:
  1. You have users on multiple continents with latency complaints
  2. You need >99.99% availability
  3. You have the engineering capacity to handle conflicts
*/

export const multiRegionDecision = {
  'startup/small-team':  'active-passive — simpler, focus on product',
  'global-consumer-app': 'active-active — latency is a product differentiator',
  'b2b-enterprise':      'active-passive with DR — SLA-driven, not latency-driven',
  'financial-system':    'active-passive CP — consistency over availability',
}`,
    feedback_correct: "✅ Active-passive: simple, consistent, primary region bottleneck. Active-active: fast, fault tolerant, write conflicts require resolution strategy.",
    feedback_partial: "Active-passive: single writer, simple failover. Active-active: both regions write, need conflict resolution (LWW, CRDTs, app logic).",
    feedback_wrong: "Active-passive: primary + standby (DR). Active-active: both regions active, handle write conflicts. Start passive, go active when justified.",
    expected: "Multi-region active-passive vs active-active",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — CAP classification", id: "step1" },
  { label: "Step 2 — Consistency models", id: "step2" },
  { label: "Step 3 — PACELC", id: "step3" },
  { label: "Step 4 — Raft consensus", id: "step4" },
  { label: "Step 5 — Multi-region", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: "SD-06", title: "CAP Theorem & Distributed Systems", shortName: "SD — CAP & DISTRIBUTED" });
