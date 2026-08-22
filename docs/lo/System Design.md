# System Design

Lessons and learning objectives.

**{SYSTEM DESIGN #1 :: Scale, Load & Bottlenecks}**

LOs:

01
Estimate system scale with back-of-envelope calculations

02
Identify vertical vs horizontal scaling trade-offs

03
Recognise the four bottleneck categories: CPU, memory, I/O, network

04
Distinguish read-heavy vs write-heavy workloads and their solutions

05
Explain the C10K lesson and why async/event-loop matters

06
Apply the 80/20 rule: most performance wins come from a few changes

---

**{SYSTEM DESIGN #2 :: Caching — Strategy, Invalidation & Pitfalls}**

LOs:

01
Implement cache-aside (lazy loading) correctly with TTL

02
Choose between cache-aside, write-through, and write-behind

03
Handle cache invalidation — the hardest part

04
Prevent the thundering herd / cache stampede lesson

05
Design a cache key strategy that avoids collisions

06
Know what NOT to cache — and why cache size matters

---

**{SYSTEM DESIGN #3 :: Database Design — Indexes, Normalization & Sharding}**

LOs:

01
Choose indexes correctly: B-tree, composite, partial, covering

02
Know when an index hurts instead of helps

03
Normalise to 3NF and know when to deliberately denormalise

04
Explain ACID and the four transaction isolation levels

05
Design a sharding strategy: by range, hash, or directory

06
Set up read replicas and understand replication lag implications

---

**{SYSTEM DESIGN #4 :: API Design — REST, Rate Limiting & Versioning}**

LOs:

01
Design RESTful resources with correct HTTP verbs and status codes

02
Make write operations idempotent — safe to retry

03
Version APIs without breaking existing clients

04
Implement token bucket rate limiting with Redis

05
Design pagination: cursor-based vs offset-based

06
Apply the principle of least surprise in API contracts

---

**{SYSTEM DESIGN #5 :: Message Queues & Event-Driven Architecture}**

LOs:

01
Decide when to use async vs sync for a given operation

02
Implement a job queue with BullMQ — producer, worker, retry

03
Handle at-least-once delivery — making consumers idempotent

04
Design dead letter queues for failed message handling

05
Compare Kafka vs RabbitMQ vs SQS trade-offs

06
Apply event-driven patterns: event sourcing, saga, outbox

---

**{SYSTEM DESIGN #6 :: CAP Theorem & Distributed Systems}**

LOs:

01
Apply the CAP theorem to classify real databases

02
Explain eventual consistency and the BASE model

03
Understand PACELC — the extension that adds latency

04
Explain how Raft consensus enables distributed agreement

05
Design a multi-region active-active vs active-passive strategy

06
Know the consistency models: strong, causal, read-your-writes, eventual

---

**{SYSTEM DESIGN #7 :: Designing for failure}**

LOs:

01
Timeouts and fallbacks

02
Bulkheads and isolation

03
Graceful degradation

---

**{SYSTEM DESIGN #8 :: Load balancing}**

LOs:

01
L4 vs L7 load balancing

02
Algorithms: round-robin, least-conn

03
Health checks and sticky sessions

---

**{SYSTEM DESIGN #9 :: CDN & edge computing}**

LOs:

01
CDN cache hierarchy

02
Cache invalidation strategies

03
Edge workers and geo-routing

---

**{SYSTEM DESIGN #10 :: Microservices patterns}**

LOs:

01
Service mesh and sidecar

02
API gateway vs BFF

03
Sagas and eventual consistency

---

**{SYSTEM DESIGN #11 :: Search systems}**

LOs:

01
Inverted index

02
Elasticsearch basics

03
Relevance and faceted search

---

**{SYSTEM DESIGN #12 :: Real-time systems}**

LOs:

01
WebSocket, SSE, long-polling

02
Pub/sub at scale

03
Presence and CRDTs

---

**{SYSTEM DESIGN #13 :: File storage systems}**

LOs:

01
Object vs block vs file storage

02
Chunked uploads

03
Deduplication and CDN

---

**{SYSTEM DESIGN #14 :: Rate limiting at scale}**

LOs:

01
Token bucket and leaky bucket

02
Fixed vs sliding window

03
Distributed rate limiting

---

**{SYSTEM DESIGN #15 :: Designing data-intensive apps}**

LOs:

01
Batch vs stream

02
Lambda vs Kappa

03
Flink/Spark concepts

---
