/**
 * SentinelPOS SP-02: Idempotent Redis Buffer Ingestion Stream — the worker half of the spec
 * (product-catalog/SentinelPOS.html §4, STEP SP-02.1), adapted from its own reference code to this
 * app's shared Prisma client and SpXxx-prefixed model names (see prisma/schema.prisma's header for
 * why every model here carries that prefix).
 *
 * Idempotency: `idempotencyHash` is derived the same way the spec's own code derives it
 * (tenantId:storeLocationId:registerId:terminalEventId, SHA-256'd) and upserted on, so a retried or
 * duplicated network batch never double-counts the same physical register event twice — the same
 * invariant SP-01's schema section names as the reason for that column's unique constraint.
 *
 * After each batch, triggers SP-03's Z-score evaluator for the affected store — this app has no
 * separate cron/scheduler service, so "run the sliding-window shift evaluation periodically" (the
 * spec's own framing) becomes "run it right after new events land for that store," which is the
 * real-time-enough equivalent for a single-process deployment and means an anomalous shift surfaces
 * as an Incident within moments of the events that triggered it, not on some arbitrary clock tick.
 */
import { Worker } from "bullmq";
import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { redisConnection } from "../lib/redis.js";
import { prisma } from "../lib/prisma.js";
import { evaluateCashierShiftAnomalies } from "../services/sentinelpos-zscore.service.js";

export const sentinelPosIngestWorker = new Worker(
  "sentinelpos-pos-events-stream",
  async (job) => {
    const { tenantId, storeLocationId, events } = job.data;

    for (const ev of events) {
      const cashier = await prisma.spCashier.findFirst({
        where: { storeLocationId, employeeNumber: ev.employeeNumber },
      });
      if (!cashier) continue;

      const rawHash = `${tenantId}:${storeLocationId}:${ev.registerId}:${ev.terminalEventId}`;
      const idempotencyHash = crypto.createHash("sha256").update(rawHash).digest("hex");

      await prisma.spPosEvent.upsert({
        where: { idempotencyHash },
        update: {},
        create: {
          tenantId,
          storeLocationId,
          cashierId: cashier.id,
          registerId: ev.registerId,
          terminalEventId: ev.terminalEventId,
          idempotencyHash,
          eventType: ev.eventType,
          ticketNumber: ev.ticketNumber,
          amount: new Prisma.Decimal(ev.amount ?? 0),
          rawPayload: ev.rawPayload ?? ev,
          occurredAt: new Date(ev.occurredAt),
        },
      });
    }

    await evaluateCashierShiftAnomalies(storeLocationId);
  },
  { connection: redisConnection }
);

sentinelPosIngestWorker.on("failed", (job, err) => {
  console.error(`[sentinelpos-worker] job ${job?.id} failed:`, err.message);
});
