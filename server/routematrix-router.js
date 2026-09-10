/**
 * RouteMatrix backend — the one FE task that exists (RouteStopBoard.tsx, `idt-routematrix-stopboard`)
 * calls exactly two real endpoints below, adapted to this project's real Express + in-memory stack
 * rather than the spec's literal Prisma+PostgreSQL stack (same trade-off minierp-router.js and
 * smb-desk-router.js already make — no real database).
 *
 * The spec's own capacitated Haversine route-optimizer (TASK 1) has no FE task calling it — nothing
 * in RouteStopBoard ever creates a route, it only ever shows the driver's already-assigned one and
 * completes stops on it — so it isn't built here; a route is seeded pre-optimized instead, the same
 * framing the FE lesson already uses ("the real backend already solves each driver's route"). What
 * IS real here, faithfully adapted from the spec's own pod.service.ts (TASK 2): recording a real
 * stop completion, and the atomic route auto-closeout when the last stop finishes.
 */
import express from "express";

const router = express.Router();

let routes = [
  {
    id: "route-1",
    routeCode: "RT-100482",
    status: "ASSIGNED",
    stops: [
      { id: "stop-1", sequence: 1, status: "PENDING", customerName: "Maria Chen", customerAddress: "480 Elm St" },
      { id: "stop-2", sequence: 2, status: "PENDING", customerName: "Devon Ruiz", customerAddress: "12 Birch Ave" },
      { id: "stop-3", sequence: 3, status: "PENDING", customerName: "Priya Nair", customerAddress: "9 Cedar Ln" },
    ],
  },
];

// "Active" means a driver still has work on it — ASSIGNED or ACTIVE, not DRAFT (never dispatched)
// or COMPLETED (nothing left to do). Once the seeded route above closes out, this legitimately
// returns null until a real route gets assigned next — matching the FE task's own empty state.
router.get("/v1/routes/active", (_req, res) => {
  const active = routes.find((r) => r.status === "ASSIGNED" || r.status === "ACTIVE");
  res.status(200).json(active || null);
});

/** Faithfully adapted from the spec's pod.service.ts completeRouteStop: record the real signature
 * and completion time, then — same transaction, in the sense that nothing else can interleave with
 * this single-threaded handler — check whether any stop on the route is still not COMPLETED; if
 * none are, the route itself transitions to COMPLETED atomically alongside the stop. */
router.post("/v1/routes/stops/:stopId/complete", (req, res) => {
  let targetRoute = null;
  let targetStop = null;
  for (const route of routes) {
    const stop = route.stops.find((s) => s.id === req.params.stopId);
    if (stop) {
      targetRoute = route;
      targetStop = stop;
      break;
    }
  }
  if (!targetStop) return res.status(404).json({ error: "Stop not found" });
  if (targetStop.status === "COMPLETED") {
    return res.status(409).json({ error: "ALREADY_COMPLETED" });
  }
  const { signatureData } = req.body || {};
  if (typeof signatureData !== "string" || !signatureData.trim()) {
    return res.status(400).json({ error: "signatureData is required" });
  }

  targetStop.status = "COMPLETED";
  targetStop.signatureData = signatureData;
  targetStop.completedAt = new Date().toISOString();

  const anyPending = targetRoute.stops.some((s) => s.status !== "COMPLETED");
  if (!anyPending) {
    targetRoute.status = "COMPLETED";
  } else if (targetRoute.status === "ASSIGNED") {
    // First stop of the route just moved — the route itself is now genuinely underway.
    targetRoute.status = "ACTIVE";
  }

  res.status(200).json(targetStop);
});

export default router;
