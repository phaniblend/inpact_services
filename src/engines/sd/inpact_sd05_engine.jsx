import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "SYSTEM DESIGN #5",
      title: "Message Queues & Event-Driven Architecture",
      body: `Synchronous request-response breaks under scale.
When the caller must wait for every downstream system —
email service, analytics, notifications, billing —
one slow dependency makes everything slow.

Message queues decouple producers from consumers:
  Producer → Queue → Consumer
  Producer doesn't wait. Consumer processes at its own pace.

Kafka   — high throughput, replay, partitioned event log
RabbitMQ — flexible routing, traditional queuing
Bull/BullMQ — Redis-backed job queues (perfect for Node.js)
SQS     — managed, serverless, AWS native

Event-driven architecture is how you build systems
where each service does one thing and doesn't need to know
who cares about its events.`,
      usecase: `Order confirmation emails, payment webhook processing, image resizing after upload, search index updates, audit logging, notification fanout — any operation that doesn't need to block the HTTP response should be async.`,
    },
  },
  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Decide when to use async vs sync for a given operation",
      "Implement a job queue with BullMQ — producer, worker, retry",
      "Handle at-least-once delivery — making consumers idempotent",
      "Design dead letter queues for failed message handling",
      "Compare Kafka vs RabbitMQ vs SQS trade-offs",
      "Apply event-driven patterns: event sourcing, saga, outbox",
    ],
  },
  {
    id: "step1", type: "question", phase: "Step 1 of 5",
    paal: "Decide which operations to make async. Show the sync-vs-async decision framework with concrete examples.",
    answer_keywords: ["async", "sync", "queue", "decouple", "block", "response"],
    seed_code: `// Step 1: sync vs async — the decision framework

/*
─── THE QUESTION ─────────────────────────────────────────────────
Does the user/caller NEED the result of this operation
to complete their current request?

YES → Sync (inline, await it)
NO  → Async (queue it, return immediately)

─── SYNC (inline, blocks response) ──────────────────────────────
Use when the RESULT is part of the response:
  ✅ Look up user data to include in API response
  ✅ Validate payment before creating an order
  ✅ Check inventory before confirming a cart
  ✅ Authenticate the request

─── ASYNC (queue, fire-and-forget) ──────────────────────────────
Use when the result is NOT needed right now:
  ✅ Send order confirmation email          → user doesn't need to wait for SendGrid
  ✅ Update search index after product edit → user sees save succeeded, search catches up
  ✅ Generate thumbnail after image upload  → upload succeeds, thumb appears shortly after
  ✅ Send Slack notification                → nobody waits for Slack
  ✅ Write to analytics pipeline            → analytics can be seconds behind
  ✅ Charge recurring subscription          → happens on a schedule, not per-request
  ✅ Fanout to 10,000 followers             → can't block on N network calls

─── THE PATTERN ─────────────────────────────────────────────────
*/

async function createOrder(req, res) {
  // SYNC — must succeed before we respond:
  const user    = await getUser(req.user.id)         // need for response
  const valid   = await validateInventory(req.body)  // must check before confirming
  const payment = await chargeCard(req.body.token)   // must succeed before order exists

  const order = await db.createOrder({ ...req.body, userId: user.id })

  // ASYNC — don't block the response:
  await queue.add('send-confirmation-email', { orderId: order.id })
  await queue.add('update-inventory-cache',  { productIds: req.body.items })
  await queue.add('notify-warehouse',         { orderId: order.id })
  await queue.add('track-analytics-event',    { event: 'order_created', orderId: order.id })

  // Return immediately — async jobs run in background:
  return res.status(201).json({ orderId: order.id, status: 'confirmed' })
}

export { createOrder }`,
    feedback_correct: "✅ Sync only what's needed for the response. Queue everything else. Order creation responds in <200ms; emails arrive seconds later.",
    feedback_partial: "If caller needs the result now → sync. If it can happen later → async queue. Fire-and-forget for notifications, analytics, fan-out.",
    feedback_wrong: "Sync: DB writes, payment, validation. Async: email, notifications, analytics, search index, thumbnails.",
    expected: "Sync vs async decision framework",
  },
  {
    id: "step2", type: "question", phase: "Step 2 of 5",
    paal: "Implement a BullMQ job queue: producer adds jobs, worker processes them with retry, exponential backoff, and job progress.",
    answer_keywords: ["bullmq", "queue", "worker", "retry", "backoff", "job"],
    seed_code: `// Step 2: BullMQ — production job queue for Node.js

import { Queue, Worker, QueueEvents } from 'bullmq'
import { createClient } from 'redis'

const connection = { host: 'localhost', port: 6379 }

// ── PRODUCER ─────────────────────────────────────────────────────
const emailQueue = new Queue('email', { connection })

async function sendOrderConfirmation(orderId, userEmail) {
  const job = await emailQueue.add(
    'order-confirmation',              // job name
    { orderId, userEmail },            // job data
    {
      attempts: 5,                     // retry up to 5 times
      backoff: {
        type: 'exponential',           // wait: 1s, 2s, 4s, 8s, 16s
        delay: 1000,
      },
      removeOnComplete: { age: 86400 }, // keep completed jobs 24h
      removeOnFail:     { age: 604800 }, // keep failed jobs 7d
    }
  )
  console.log('Job ' + job.id + ' added')
  return job.id
}

// ── WORKER ───────────────────────────────────────────────────────
const emailWorker = new Worker(
  'email',
  async (job) => {
    const { orderId, userEmail } = job.data

    job.updateProgress(10)  // update progress (visible in dashboards)

    const order = await db.getOrder(orderId)
    job.updateProgress(50)

    await sendgrid.send({
      to: userEmail,
      subject: 'Order #' + orderId + ' confirmed',
      html: renderOrderEmail(order),
    })

    job.updateProgress(100)
    return { sent: true, timestamp: new Date().toISOString() }
  },
  {
    connection,
    concurrency: 10,       // process 10 jobs simultaneously
    limiter: {
      max: 100,            // max 100 jobs per duration
      duration: 60000,     // per minute (rate limit the worker)
    },
  }
)

emailWorker.on('completed', (job, result) => {
  console.log('Job ' + job.id + ' completed:', result)
})

emailWorker.on('failed', (job, err) => {
  console.error('Job ' + (job?.id) + ' failed after ' + (job?.attemptsMade) + ' attempts:', err.message)
  // After max attempts → moves to failed queue (dead letter)
})

export { emailQueue, sendOrderConfirmation }`,
    feedback_correct: "✅ BullMQ: Queue adds jobs, Worker processes them, exponential backoff on retry, progress tracking, failed queue for dead letters.",
    feedback_partial: "new Queue + queue.add(name, data, {attempts, backoff}). new Worker(name, processor, {concurrency}). Handles retries automatically.",
    feedback_wrong: "Queue.add(jobName, data, { attempts: 5, backoff: { type:'exponential', delay:1000 } })",
    expected: "BullMQ producer and worker with retry",
  },
  {
    id: "step3", type: "question", phase: "Step 3 of 5",
    paal: "Handle at-least-once delivery: every message queue delivers at least once but maybe more. Make your consumers idempotent.",
    answer_keywords: ["idempotent", "at-least-once", "deduplication", "processed", "duplicate"],
    seed_code: `// Step 3: idempotent consumers — handling duplicate messages

/*
AT-LEAST-ONCE DELIVERY (the default in most queues)
─────────────────────────────────────────────────────────────────
Queues guarantee every message is delivered AT LEAST once.
Network failures, consumer crashes, and visibility timeouts
can cause the same message to be delivered MULTIPLE TIMES.

If your consumer is not idempotent → duplicate side effects:
  ❌ User charged twice
  ❌ Email sent twice
  ❌ Inventory decremented twice
  ❌ Analytics event counted twice

MAKE EVERY CONSUMER IDEMPOTENT:
  Processing the same message N times = same result as 1 time.
*/

async function processOrderConfirmation(job) {
  const { orderId, messageId } = job.data

  // IDEMPOTENCY CHECK — have we processed this exact message before?
  const processedKey = \`processed:email:order:\${orderId}:msg:\${messageId}\`
  const alreadyDone  = await redis.get(processedKey)

  if (alreadyDone) {
    console.log(\`Job \${job.id} already processed — skipping (idempotent)\`)
    return { skipped: true, reason: 'already-processed' }
  }

  // Process the job (this is the work that must not duplicate):
  const order = await db.getOrder(orderId)

  // Check DB-level: was email already marked as sent?
  if (order.confirmationSentAt) {
    return { skipped: true, reason: 'email-already-sent' }
  }

  await sendgrid.send({ to: order.userEmail, subject: '...' })

  // Mark as done in both DB and Redis (belt + suspenders):
  await db.query('UPDATE orders SET confirmation_sent_at = NOW() WHERE id = $1', [orderId])
  await redis.setEx(processedKey, 86400, '1')  // 24h dedup window

  return { sent: true }
}

/*
IDEMPOTENCY STRATEGIES:
  1. Redis deduplication key (fast, simple)
  2. DB unique constraint (durable, survives Redis restarts)
  3. Natural idempotency (e.g. UPDATE is naturally idempotent — SET x=5 twice = fine)
  4. Database upsert (INSERT ... ON CONFLICT DO NOTHING)

USE MULTIPLE: Redis for speed, DB for durability.
*/

export { processOrderConfirmation }`,
    feedback_correct: "✅ Check a deduplication key before processing. Mark done in both Redis (speed) and DB (durability). Natural idempotency where possible.",
    feedback_partial: "At-least-once = duplicates happen. Check redis/DB if already processed. Mark done after processing. Upsert > insert.",
    feedback_wrong: "redis.get(processedKey) → if exists, skip. After processing: redis.setEx + db UPDATE. Double-check with DB state.",
    expected: "Idempotent consumer for at-least-once delivery",
  },
  {
    id: "step4", type: "question", phase: "Step 4 of 5",
    paal: "Implement the outbox pattern: guarantee events are published even if the app crashes after DB write but before queue publish.",
    answer_keywords: ["outbox", "transactional", "atomicity", "publish", "poll", "relay"],
    seed_code: `// Step 4: Transactional Outbox Pattern

/*
THE PROBLEM (dual write failure):
  1. Write to DB ✅
  2. App crashes 💥
  3. Message never published to queue ❌
  → DB and queue are out of sync forever

OR:
  1. Publish to queue ✅
  2. DB write fails ❌
  → Queue has an event for data that doesn't exist

THE SOLUTION: Transactional Outbox
  Write to DB AND outbox table IN THE SAME TRANSACTION.
  A separate relay process polls the outbox and publishes.
  Delete from outbox only after successful publish.
*/

// Step 1: Write to DB + outbox atomically:
async function createOrderWithOutbox(orderData) {
  return db.transaction(async (trx) => {
    // Business write:
    const order = await trx('orders').insert(orderData).returning('*')

    // Outbox write (same transaction — atomic):
    await trx('outbox_events').insert({
      aggregate_type: 'order',
      aggregate_id:   order[0].id,
      event_type:     'order.created',
      payload:        JSON.stringify({ orderId: order[0].id, ...orderData }),
      created_at:     new Date(),
    })

    return order[0]
    // If EITHER insert fails → BOTH roll back → consistent state ✅
  })
}

// Step 2: Relay process (runs independently, polls outbox):
async function outboxRelay() {
  while (true) {
    const events = await db('outbox_events')
      .where('published_at', null)
      .orderBy('created_at')
      .limit(100)
      .forUpdate()   // lock rows — prevents parallel relays publishing same event

    for (const event of events) {
      try {
        await queue.add(event.event_type, JSON.parse(event.payload))
        await db('outbox_events').where('id', event.id).update({ published_at: new Date() })
      } catch (err) {
        console.error('Relay failed for event', event.id, err)
        // Leave in outbox — retry on next poll
      }
    }

    await sleep(1000)  // poll every second
  }
}

export { createOrderWithOutbox, outboxRelay }`,
    feedback_correct: "✅ Outbox: write event to DB table in same transaction. Relay polls and publishes. Crash-safe — no dual-write inconsistency.",
    feedback_partial: "Outbox = write event to DB table atomically with business data. Relay = poll outbox, publish, mark done. Atomic DB + queue.",
    feedback_wrong: "INSERT into outbox_events in same DB transaction. Relay: poll unpublished, queue.add, mark published_at.",
    expected: "Transactional outbox pattern",
  },
  {
    id: "step5", type: "question", phase: "Step 5 of 5",
    paal: "Compare Kafka, RabbitMQ, BullMQ/Redis, and SQS. For each, state the primary use case and one critical limitation.",
    answer_keywords: ["kafka", "rabbitmq", "sqs", "bullmq", "throughput", "replay", "ordering"],
    seed_code: `// Step 5: choosing your message system

/*
─── KAFKA ────────────────────────────────────────────────────────
Type:       Distributed event log (not a traditional queue)
Throughput: Millions of events/second
Key feature: REPLAY — consumers can rewind and re-read past events
Ordering:   Guaranteed within a partition
Retention:  Events stored for days/weeks/forever
Use for:    Event sourcing, audit logs, real-time pipelines,
            microservice event backbone, data streaming
Limitation: High operational complexity. Overkill for simple job queues.
            Kafka Connect, Schema Registry — big learning curve.

─── RABBITMQ ─────────────────────────────────────────────────────
Type:       Traditional message broker (push-based)
Throughput: ~50-100K messages/second
Key feature: Flexible routing — exchanges, fanout, topic patterns
Ordering:   Per-queue (not global)
Retention:  Messages gone once consumed (unless dead-lettered)
Use for:    Task queues, microservice RPC, flexible routing patterns
Limitation: No replay. Not a good fit for event sourcing.
            Stateful — harder to scale than Kafka.

─── BULLMQ (Redis-backed) ────────────────────────────────────────
Type:       Job queue for Node.js
Throughput: ~10-50K jobs/second
Key feature: Simple API, priority queues, rate limiting, job progress
Ordering:   FIFO per queue + priority support
Retention:  Configurable (keep completed/failed jobs N days)
Use for:    Background jobs in Node.js apps — email, image resize,
            webhooks, scheduled tasks (crons)
Limitation: Redis is single-threaded — not for event streaming at scale.
            Not for cross-language or cross-service event buses.

─── AWS SQS ──────────────────────────────────────────────────────
Type:       Managed queue service
Throughput: Nearly unlimited (auto-scales)
Key feature: Zero ops — no infra to manage. FIFO queues available.
Ordering:   Best-effort (Standard) or guaranteed FIFO (FIFO queues)
Retention:  Up to 14 days
Use for:    AWS-native apps, serverless architectures, Lambda triggers
Limitation: No replay. Max message size 256KB. Latency vs Kafka.

─── DECISION MATRIX ──────────────────────────────────────────────
Need replay/event sourcing?         → Kafka
Simple Node.js background jobs?     → BullMQ
Flexible routing patterns?          → RabbitMQ
Serverless / zero ops on AWS?       → SQS
Cross-language microservice events? → Kafka or RabbitMQ
*/

export const queueSelector = (requirements) => {
  if (requirements.replay)       return 'Kafka'
  if (requirements.nodeJsJobs)   return 'BullMQ'
  if (requirements.flexRouting)  return 'RabbitMQ'
  if (requirements.serverless)   return 'SQS'
  if (requirements.highThroughput) return 'Kafka'
  return 'BullMQ'  // default for most web apps
}`,
    feedback_correct: "✅ Kafka=replay+streaming. RabbitMQ=flexible routing. BullMQ=Node.js jobs. SQS=serverless AWS. Match tool to need, not hype.",
    feedback_partial: "Kafka for event log + replay. BullMQ for Node.js background jobs. RabbitMQ for routing. SQS for managed/serverless.",
    feedback_wrong: "Kafka: replay, high throughput. BullMQ: Node.js job queues. RabbitMQ: flexible routing. SQS: managed, zero ops.",
    expected: "Kafka vs RabbitMQ vs BullMQ vs SQS",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Sync vs Async", id: "step1" },
  { label: "Step 2 — BullMQ queue", id: "step2" },
  { label: "Step 3 — Idempotent consumer", id: "step3" },
  { label: "Step 4 — Outbox pattern", id: "step4" },
  { label: "Step 5 — Queue comparison", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: "SD-05", title: "Message Queues & Event-Driven Architecture", shortName: "SD — QUEUES" });
