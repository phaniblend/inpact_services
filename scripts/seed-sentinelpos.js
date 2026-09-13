/**
 * One-time seed for SentinelPOS's real Postgres data — without this, a freshly-migrated database
 * has zero PosEvents, so the FE lesson's incident table would load genuinely empty on day one
 * (the SP-03 Z-score evaluator has nothing to compare against with no baseline history). This
 * writes ~35 days of believable baseline void activity across 3 cashiers, then one cashier's
 * current shift with a real anomalous void spike, then runs the actual SP-03 evaluator against
 * that data — the resulting Incident rows are computed by the real Z-score math, not hardcoded.
 *
 * Idempotent: skips entirely if the seed tenant already exists, so re-running this (e.g. an
 * accidental second invocation) never double-seeds.
 *
 * Must run somewhere that can reach the real Postgres/Redis — i.e. inside Railway's network, not
 * from a local machine (same PRODUCTS_DATABASE_URL/PRODUCTS_REDIS_URL constraint as everywhere
 * else). Run once via `railway run --service inpact-api npm run seed:sentinelpos` (or Railway's
 * own one-off command UI) after the SentinelPOS migration has been applied.
 */
import { prisma } from "../server/lib/prisma.js";
import { evaluateCashierShiftAnomalies } from "../server/services/sentinelpos-zscore.service.js";

const SEED_SLUG = "sentinelpos-demo";

// Same cashier names/employee numbers the FE lesson's own "How" content already references
// (product-catalog/SentinelPOS.html §4's example incidents) — a learner who reads the lesson and
// then opens the real triage cockpit sees the same people, not an unrelated random cast.
const CASHIERS = [
  { name: "Maria Chen", employeeNumber: "4821", dailyVoidsRange: [1, 3], anomalousShiftVoids: 34 },
  { name: "Devon Ruiz", employeeNumber: "3390", dailyVoidsRange: [1, 4], anomalousShiftVoids: 22 },
  { name: "Priya Nair", employeeNumber: "2207", dailyVoidsRange: [0, 2], anomalousShiftVoids: 0 },
];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  const existing = await prisma.spTenant.findUnique({ where: { slug: SEED_SLUG } });
  if (existing) {
    console.log(`[seed-sentinelpos] Tenant "${SEED_SLUG}" already exists — skipping (already seeded).`);
    return;
  }

  const tenant = await prisma.spTenant.create({ data: { slug: SEED_SLUG, name: "SentinelPOS Demo Retail Co." } });
  const store = await prisma.spStoreLocation.create({ data: { tenantId: tenant.id, code: "STORE-01", name: "Flagship Store" } });

  const cashiers = [];
  for (const c of CASHIERS) {
    cashiers.push(
      await prisma.spCashier.create({
        data: { tenantId: tenant.id, storeLocationId: store.id, employeeNumber: c.employeeNumber, name: c.name },
      })
    );
  }

  // 35 days of baseline history — enough for SP-03's 30-day rolling window plus a few days' margin.
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const events = [];
  for (let dayOffset = 35; dayOffset >= 2; dayOffset--) {
    const dayStart = now - dayOffset * dayMs;
    for (let i = 0; i < CASHIERS.length; i++) {
      const cfg = CASHIERS[i];
      const cashier = cashiers[i];
      const voidCount = randInt(cfg.dailyVoidsRange[0], cfg.dailyVoidsRange[1]);
      for (let v = 0; v < voidCount; v++) {
        const occurredAt = new Date(dayStart + randInt(0, dayMs - 1));
        events.push({
          tenantId: tenant.id,
          storeLocationId: store.id,
          cashierId: cashier.id,
          registerId: `REG-0${(i % 2) + 1}`,
          terminalEventId: `seed-${dayOffset}-${i}-${v}-${randInt(1000, 9999)}`,
          idempotencyHash: `seed-${tenant.id}-${cashier.id}-${dayOffset}-${v}`,
          eventType: v % 3 === 0 ? "LINE_VOID" : "POST_VOID",
          amount: (randInt(500, 15000) / 100).toFixed(2),
          rawPayload: { seeded: true },
          occurredAt,
        });
      }
    }
  }
  // chunk inserts — createMany with a few thousand rows at once is fine, but keep it readable
  for (let i = 0; i < events.length; i += 500) {
    await prisma.spPosEvent.createMany({ data: events.slice(i, i + 500) });
  }
  console.log(`[seed-sentinelpos] Wrote ${events.length} baseline PosEvent rows across 34 days.`);

  // Today's shift — one cashier (Maria Chen) gets a real anomalous void spike; Devon Ruiz gets a
  // smaller, still-flaggable one; Priya Nair stays clean (no incident expected for her).
  const shiftEvents = [];
  for (let i = 0; i < CASHIERS.length; i++) {
    const cfg = CASHIERS[i];
    if (!cfg.anomalousShiftVoids) continue;
    const cashier = cashiers[i];
    for (let v = 0; v < cfg.anomalousShiftVoids; v++) {
      const occurredAt = new Date(now - randInt(0, 6 * 60 * 60 * 1000));
      shiftEvents.push({
        tenantId: tenant.id,
        storeLocationId: store.id,
        cashierId: cashier.id,
        registerId: `REG-0${(i % 2) + 1}`,
        terminalEventId: `shift-${i}-${v}-${randInt(1000, 9999)}`,
        idempotencyHash: `shift-${tenant.id}-${cashier.id}-${v}`,
        eventType: "POST_VOID",
        amount: (randInt(2000, 25000) / 100).toFixed(2),
        rawPayload: { seeded: true, shift: true },
        occurredAt,
      });
    }
  }
  if (shiftEvents.length > 0) {
    await prisma.spPosEvent.createMany({ data: shiftEvents });
  }
  console.log(`[seed-sentinelpos] Wrote ${shiftEvents.length} current-shift PosEvent rows.`);

  await evaluateCashierShiftAnomalies(store.id);
  const incidentCount = await prisma.spIncident.count({ where: { storeLocationId: store.id, status: "OPEN" } });
  console.log(`[seed-sentinelpos] Done — ${incidentCount} open incident(s) now on the board.`);
}

main()
  .catch((err) => {
    console.error("[seed-sentinelpos] Failed:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
