/**
 * SentinelPOS's ingestion buffer queue (SP-02: "Idempotent Redis Buffer Ingestion Stream") — the
 * router's POST /v1/pos/events/batch enqueues here in sub-20ms and returns immediately; the actual
 * DB writes happen in the worker (sentinelpos-ingest.worker.js), off the request path.
 */
import { Queue } from "bullmq";
import { redisConnection } from "../lib/redis.js";

export const sentinelPosIngestQueue = new Queue("sentinelpos-pos-events-stream", {
  connection: redisConnection,
});
