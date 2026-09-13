/**
 * SentinelPOS SP-03: Sliding-Window Gaussian Z-Score Evaluator (product-catalog/SentinelPOS.html
 * §4, STEP SP-03.1) — adapted from the spec's own reference code to this app's shared Prisma client
 * and SpXxx-prefixed model/table names. The spec's raw SQL used illustrative snake_case column
 * names (`store_location_id`, `event_type`, ...); Prisma preserves this schema's actual camelCase
 * field names as the real Postgres column names, so the raw query below references those exactly
 * (unqualified — the connection's own `?schema=inpact_products` already sets search_path, the same
 * way Prisma Client's own generated queries resolve tables) rather than the spec's illustrative names.
 *
 * Invariant (§2.1): Z = (X_cashier - mu_store_30d) / sigma_store_30d; an incident is created only
 * when Z >= 2.0 and the sample size (this shift's own void count) is >= 30 — exactly the spec's own
 * mathematical invariant, not a rounded-off approximation of it.
 */
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

const VOID_EVENT_TYPES = ["POST_VOID", "LINE_VOID"];
const Z_SCORE_THRESHOLD = 2.0;
const MIN_SAMPLE_SIZE = 30;
const SHIFT_WINDOW_MS = 8 * 60 * 60 * 1000;
const BASELINE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export async function evaluateCashierShiftAnomalies(storeLocationId) {
  const thirtyDaysAgo = new Date(Date.now() - BASELINE_WINDOW_MS);

  const baseline = await prisma.$queryRaw`
    SELECT
      AVG(sub.void_count)::float AS mean_voids,
      COALESCE(STDDEV(sub.void_count)::float, 1.0) AS std_voids
    FROM (
      SELECT "cashierId", COUNT(*) AS void_count
      FROM "SpPosEvent"
      WHERE "storeLocationId" = ${storeLocationId}
        AND "eventType" IN ('POST_VOID', 'LINE_VOID')
        AND "occurredAt" >= ${thirtyDaysAgo}
      GROUP BY "cashierId", date_trunc('day', "occurredAt")
    ) sub;
  `;

  const mean = baseline[0]?.mean_voids || 0;
  const std = baseline[0]?.std_voids || 1.0;
  const shiftStart = new Date(Date.now() - SHIFT_WINDOW_MS);

  const activeCashiers = await prisma.spCashier.findMany({
    where: { storeLocationId },
    include: {
      events: {
        where: { occurredAt: { gte: shiftStart }, incidentId: null },
      },
    },
  });

  for (const cashier of activeCashiers) {
    if (cashier.events.length < MIN_SAMPLE_SIZE) continue;

    const voidEvents = cashier.events.filter((e) => VOID_EVENT_TYPES.includes(e.eventType));
    if (voidEvents.length === 0) continue;
    const zScore = (voidEvents.length - mean) / std;

    if (zScore >= Z_SCORE_THRESHOLD) {
      const flaggedAmount = voidEvents.reduce((acc, e) => acc.add(e.amount), new Prisma.Decimal(0));

      await prisma.spIncident.create({
        data: {
          tenantId: cashier.tenantId,
          incidentCode: `INC-Z-${Date.now().toString().slice(-6)}`,
          storeLocationId,
          cashierId: cashier.id,
          severity: zScore >= 3.0 ? "CRITICAL" : "HIGH",
          title: "Excessive Void Pattern (Statistical Outlier)",
          description: `Cashier registered ${voidEvents.length} voids (Baseline: ${mean.toFixed(1)}, Z-Score: ${zScore.toFixed(2)})`,
          flaggedAmount,
          zScore: Number(zScore.toFixed(2)),
          events: { connect: voidEvents.map((e) => ({ id: e.id })) },
        },
      });
    }
  }
}
