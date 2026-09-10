/**
 * KioskGuard backend — the one FE task that exists (IncidentTriage.tsx, `idt-kioskguard-triage`)
 * calls exactly two real endpoints below, adapted to this project's real Express + in-memory stack
 * rather than the spec's literal Prisma+PostgreSQL+Redis+S3 (same trade-off minierp-router.js and
 * smb-desk-router.js already make — no real database, no real Redis buffer).
 *
 * The spec's other 4 backend tasks (tenant-isolated API-key middleware, the Redis-buffered POS
 * stream ingestion pipeline, the sliding-window Z-score anomaly engine that actually produces an
 * Incident from raw PosEvents, and the WORM evidence vault) are NOT built here — there is no FE
 * task that calls any of them, and building a real Z-score engine has nothing to score without a
 * real POS event stream feeding it. What's real here: a believable set of already-scored open
 * incidents (the backend's own scoring, done "offline," the same framing the FE lesson already
 * uses — "the real backend already scores...and already opens a real Incident record"), and the one
 * real state transition the FE task actually exercises: resolving one.
 */
import express from "express";

const router = express.Router();

let incidents = [
  {
    id: "inc-1",
    incidentCode: "INC-Z-482910",
    cashier: { name: "Maria Chen", employeeNumber: "4821" },
    severity: "CRITICAL",
    zScore: 2.8,
    flaggedAmount: 340.0,
    status: "OPEN",
    events: [
      { type: "POST_VOID", amount: 89.99, at: "2026-09-08T14:12:03Z" },
      { type: "POST_VOID", amount: 120.0, at: "2026-09-08T14:14:41Z" },
      { type: "DRAWER_KICK_NO_SALE", amount: 0, at: "2026-09-08T14:15:10Z" },
      { type: "POST_VOID", amount: 130.01, at: "2026-09-08T15:02:55Z" },
    ],
  },
  {
    id: "inc-2",
    incidentCode: "INC-Z-482844",
    cashier: { name: "Devon Ruiz", employeeNumber: "3390" },
    severity: "HIGH",
    zScore: 2.1,
    flaggedAmount: 95.5,
    status: "OPEN",
    events: [
      { type: "MANUAL_DISCOUNT", amount: 45.5, at: "2026-09-08T11:20:00Z" },
      { type: "MANUAL_DISCOUNT", amount: 50.0, at: "2026-09-08T11:41:12Z" },
    ],
  },
  {
    id: "inc-3",
    incidentCode: "INC-Z-482701",
    cashier: { name: "Priya Nair", employeeNumber: "2207" },
    severity: "MEDIUM",
    zScore: 1.7,
    flaggedAmount: 22.0,
    status: "OPEN",
    events: [{ type: "LINE_VOID", amount: 22.0, at: "2026-09-08T09:05:30Z" }],
  },
];

// GET only ever returns what a real analyst still has to triage — a resolved incident (either
// outcome) actually drops off the table, matching the FE task's own acceptance criteria.
router.get("/v1/incidents", (_req, res) => {
  res.status(200).json(incidents.filter((i) => i.status === "OPEN"));
});

router.post("/v1/incidents/:id/resolve", (req, res) => {
  const incident = incidents.find((i) => i.id === req.params.id);
  if (!incident) return res.status(404).json({ error: "Incident not found" });
  if (incident.status !== "OPEN") {
    return res.status(409).json({ error: `ALREADY_RESOLVED: incident is ${incident.status}` });
  }
  const { status, resolutionNotes } = req.body || {};
  if (status !== "RESOLVED_CONFIRMED_LOSS" && status !== "RESOLVED_DISMISSED") {
    return res.status(400).json({ error: "status must be RESOLVED_CONFIRMED_LOSS or RESOLVED_DISMISSED" });
  }
  incident.status = status;
  incident.resolutionNotes = resolutionNotes || "";
  incident.resolvedAt = new Date().toISOString();
  res.status(200).json(incident);
});

export default router;
