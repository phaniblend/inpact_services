/**
 * SentinelPOS backend — real implementation per product-catalog/SentinelPOS.html (user directive,
 * 2026-09-13: match the spec's literal enterprise architecture — real Postgres via Prisma, real
 * Redis-buffered ingestion via BullMQ, real WORM evidence uploads to R2). Previously this was
 * in-memory mock data; the one FE task that exists (IncidentTriage.tsx) calls the exact same two
 * endpoints below — GET /v1/incidents and POST /v1/incidents/:id/resolve — so its own contract is
 * untouched even though everything behind it is now real.
 *
 * POST /v1/pos/events/batch is SP-02's real ingestion entrypoint: buffers to Redis via BullMQ and
 * returns immediately (sub-20ms, per the spec's own acceptance criteria) — the actual DB writes and
 * SP-03's Z-score evaluation happen in sentinelpos-ingest.worker.js, off the request path.
 */
import express from "express";
import { prisma } from "./lib/prisma.js";
import { sentinelPosIngestQueue } from "./queues/sentinelpos-queue.js";
import { uploadEvidence } from "./lib/evidence-vault.js";

const router = express.Router();

function toIncidentJson(incident) {
  return {
    id: incident.id,
    incidentCode: incident.incidentCode,
    cashier: { name: incident.cashier.name, employeeNumber: incident.cashier.employeeNumber },
    severity: incident.severity,
    zScore: incident.zScore,
    flaggedAmount: Number(incident.flaggedAmount),
    status: incident.status,
    events: incident.events.map((e) => ({ type: e.eventType, amount: Number(e.amount), at: e.occurredAt.toISOString() })),
  };
}

// POST /v1/pos/events/batch — SP-02. Body: { tenantId, storeLocationId, events: [...] }.
router.post("/v1/pos/events/batch", async (req, res) => {
  const { tenantId, storeLocationId, events } = req.body || {};
  if (!tenantId || !storeLocationId || !Array.isArray(events) || events.length === 0) {
    return res.status(400).json({ error: "tenantId, storeLocationId, and a non-empty events array are required." });
  }
  await sentinelPosIngestQueue.add("ingest-batch", { tenantId, storeLocationId, events });
  res.status(202).json({ accepted: events.length });
});

// GET only ever returns what a real analyst still has to triage — a resolved incident (either
// outcome) actually drops off the table, matching the FE task's own acceptance criteria.
router.get("/v1/incidents", async (_req, res) => {
  try {
    const incidents = await prisma.spIncident.findMany({
      where: { status: "OPEN" },
      include: { cashier: true, events: true },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(incidents.map(toIncidentJson));
  } catch (err) {
    console.error("[sentinelpos] GET /v1/incidents failed:", err.message);
    res.status(500).json({ error: "Could not load incidents — please try again." });
  }
});

router.post("/v1/incidents/:id/resolve", async (req, res) => {
  const { status, resolutionNotes } = req.body || {};
  if (status !== "RESOLVED_CONFIRMED_LOSS" && status !== "RESOLVED_DISMISSED") {
    return res.status(400).json({ error: "status must be RESOLVED_CONFIRMED_LOSS or RESOLVED_DISMISSED" });
  }
  try {
    const incident = await prisma.spIncident.findUnique({ where: { id: req.params.id }, include: { cashier: true, events: true } });
    if (!incident) return res.status(404).json({ error: "Incident not found" });
    if (incident.status !== "OPEN") {
      return res.status(409).json({ error: `ALREADY_RESOLVED: incident is ${incident.status}` });
    }

    // SP-01's WORM invariant: raw evidence linked to a confirmed loss gets hashed and archived —
    // a dismissed incident (false alarm) has nothing worth permanently vaulting.
    let evidenceVaultUri = incident.evidenceVaultUri;
    if (status === "RESOLVED_CONFIRMED_LOSS") {
      const { uri } = await uploadEvidence(`sentinelpos/${incident.tenantId}`, {
        incidentCode: incident.incidentCode,
        cashier: { name: incident.cashier.name, employeeNumber: incident.cashier.employeeNumber },
        zScore: incident.zScore,
        flaggedAmount: Number(incident.flaggedAmount),
        events: incident.events.map((e) => ({ type: e.eventType, amount: Number(e.amount), at: e.occurredAt.toISOString(), registerId: e.registerId, terminalEventId: e.terminalEventId })),
        resolutionNotes: resolutionNotes || "",
        resolvedAt: new Date().toISOString(),
      });
      evidenceVaultUri = uri;
    }

    const updated = await prisma.spIncident.update({
      where: { id: incident.id },
      data: { status, resolutionNotes: resolutionNotes || "", resolvedAt: new Date(), evidenceVaultUri },
      include: { cashier: true, events: true },
    });
    res.status(200).json(toIncidentJson(updated));
  } catch (err) {
    console.error("[sentinelpos] POST /v1/incidents/:id/resolve failed:", err.message);
    res.status(500).json({ error: "Could not resolve incident — please try again." });
  }
});

export default router;
