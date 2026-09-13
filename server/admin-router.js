/**
 * Platform-cleanup admin actions — core-team only. Currently just one capability: permanently
 * delete a OneDev project that isn't one of the 4 live products, for clearing out earlier
 * candidate products from the pipeline that never got promoted to live (user request, 2026-09-13:
 * "we shud not have other products in our database or anywhere else.. our focus is just these
 * four"). Deliberately its own small router rather than folded into recruit-router.js — this isn't
 * a recruiting/matching action, it's product lifecycle cleanup, and giving it its own file keeps
 * recruit-router.js's own documented scope honest.
 */
import express from "express";
import { listProjects, deleteProject } from "./onedev-client.js";
import { requireRole } from "./auth-session.js";
import { LIVE_PRODUCT_IDS, RESERVED_PROJECT_IDS } from "../src/cohort-matching/matching.js";
import { notifyTeamServer } from "./notify-server.js";

const router = express.Router();

/** GET /non-live-projects — every real OneDev project that is neither one of the 4 live products
 * nor a reserved platform project (Cohort/TeamOps/ModuleLibrary/ProductProposals) — exactly the
 * "shouldn't be here" list this cleanup is about. Read-only; lists live data fresh on every call
 * rather than trusting a client-guessed list of names. */
router.get("/non-live-projects", requireRole("PD", "PMGT", "ID", "CD"), async (req, res) => {
  try {
    const projects = await listProjects({ offset: 0, count: 200 });
    const extra = projects.filter((p) => !LIVE_PRODUCT_IDS.has(p.id) && !RESERVED_PROJECT_IDS.has(p.id));
    res.json({ projects: extra.map((p) => ({ id: p.id, name: p.name })) });
  } catch (err) {
    console.error("[admin] /non-live-projects failed:", err.message);
    res.status(500).json({ error: "Couldn't load projects — please try again." });
  }
});

/**
 * POST /delete-project — permanently deletes one OneDev project and everything in it. No undo, so
 * this requires the client to send the project's exact current name as `confirmName` (not just its
 * id) — a typed-confirmation gate, same "make it hard to do by accident" instinct as any other
 * irreversible action, on top of the real safety net below: refusing outright if the id is a live
 * or reserved project, so a bad id can never take down something that matters regardless of what
 * name was typed.
 */
router.post("/delete-project", requireRole("PD", "PMGT", "ID", "CD"), async (req, res) => {
  try {
    const projectId = Number(req.body?.projectId);
    const confirmName = String(req.body?.confirmName || "").trim();
    if (!Number.isFinite(projectId) || projectId <= 0) {
      return res.status(400).json({ error: "projectId is required." });
    }
    if (LIVE_PRODUCT_IDS.has(projectId) || RESERVED_PROJECT_IDS.has(projectId)) {
      return res.status(400).json({ error: "Refusing to delete a live or reserved platform project." });
    }

    const projects = await listProjects({ offset: 0, count: 200 });
    const project = projects.find((p) => p.id === projectId);
    if (!project) return res.status(404).json({ error: "Project not found." });
    if (!confirmName || confirmName !== project.name) {
      return res.status(400).json({ error: `Type the project's exact name ("${project.name}") to confirm.` });
    }

    await deleteProject(projectId);
    await notifyTeamServer(`🗑️ Deleted non-live product "${project.name}" via core cleanup (${req.session?.email || "ops"})`);
    res.json({ ok: true, deleted: project.name });
  } catch (err) {
    console.error("[admin] /delete-project failed:", err.message);
    res.status(500).json({ error: "Couldn't delete project — please try again." });
  }
});

export default router;
