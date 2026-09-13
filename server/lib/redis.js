/**
 * Shared Redis connection for the 4 live products' BullMQ ingestion queues (SentinelPOS's POS event
 * stream, and whichever of MiniERP/RouteMatrix/BatchCraft's BE tasks need one). One connection
 * reused across every queue/worker in this process — BullMQ explicitly recommends this over one
 * connection per queue (see https://docs.bullmq.io/guide/connections).
 *
 * `maxRetriesPerRequest: null` is required by BullMQ's blocking commands (BRPOPLPUSH etc.) — without
 * it, ioredis's own retry/timeout logic fights BullMQ's, and jobs intermittently fail with cryptic
 * "Connection is closed" errors under load. Documented in BullMQ's own connection guide, not guessed.
 */
import Redis from "ioredis";

export const redisConnection = new Redis(process.env.PRODUCTS_REDIS_URL, {
  maxRetriesPerRequest: null,
});

redisConnection.on("error", (err) => {
  console.error("[redis] connection error:", err.message);
});
