/**
 * Product Forge — "Propose New Products" (see docs/SMB_PRODUCT_SELECTION_JOURNAL.md's sourcing
 * strategy: free/open alternatives to a paid product's paywalled slice, not from-scratch research).
 *
 *  POST /propose            Generates a new batch and immediately files each as a
 *                           Status: proposed issue — the proposal exists in history the moment
 *                           it's generated, not only once PD decides on it.
 *  GET  /proposals          Full history — every proposal ever generated, any status.
 *  POST /proposals/:id/decide   PD marks one proposed → added or deferred (with an optional note).
 *
 * Same "Generate -> Review -> Publish" discipline as SpecForge/ID Studio: /propose only writes the
 * proposal record itself (Status: proposed), never a delivery project or tasks. Turning an "added"
 * proposal into real tasks is a deliberate, separate PD Studio action (Stage 1 -> ... -> /publish),
 * pre-filled from the proposal's own name/description — reuses that existing flow rather than
 * duplicating it.
 */
import express from "express";
import { runProductProposals } from "../src/specforge/pipeline.js";
import { listIssues, createIssue, updateIssueDescription, parseKV } from "./onedev-client.js";
import { notifyTeamServer } from "./notify-server.js";
import { requireRole } from "./auth-session.js";
import { PRODUCT_PROPOSALS_PROJECT_ID } from "../src/cohort-matching/matching.js";

const router = express.Router();

function getDeepSeekKey() {
  return process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY;
}

function issueToProposal(issue) {
  const f = parseKV(issue.description);
  return {
    id: issue.id,
    name: issue.title.replace(/^Proposal:\s*/, "").trim(),
    tagline: f.Tagline || "",
    description: f.Description || "",
    inspiredBy: (f.InspiredBy || "").split("|").map((s) => s.trim()).filter(Boolean),
    painPoint: f.PainPoint || "",
    costBarrier: f.CostBarrier || "",
    narrowSlice: f.NarrowSlice || "",
    status: f.Status || "proposed",
    decisionNote: f.DecisionNote || "",
    decidedAt: f.DecidedAt || "",
    submitDate: issue.submitDate,
  };
}

async function loadAllProposals() {
  const issues = await listIssues({ count: 200 });
  return issues
    .filter((i) => i.projectId === PRODUCT_PROPOSALS_PROJECT_ID && i.title.startsWith("Proposal:"))
    .map(issueToProposal)
    .sort((a, b) => b.id - a.id);
}

/** GET /proposals — full history, every status, newest first. */
router.get("/proposals", async (_req, res) => {
  try {
    res.json({ proposals: await loadAllProposals() });
  } catch (err) {
    console.error("[product-forge] /proposals:", err);
    res.status(500).json({ error: err?.message ?? "Could not load proposals" });
  }
});

/** POST /propose — generates a new batch, immediately files each proposal as Status: proposed. */
router.post("/propose", requireRole("PD"), async (req, res) => {
  const apiKey = getDeepSeekKey();
  if (!apiKey) {
    return res.status(503).json({ error: "DEEPSEEK_API_KEY is not set in D:\\IPAAL\\.env — Product Forge needs it to run." });
  }
  try {
    const count = Number(req.body?.count) || 6;
    const existing = await loadAllProposals();
    const proposals = await runProductProposals(existing, apiKey, count);

    const created = [];
    for (const p of proposals) {
      const issueId = await createIssue({
        projectId: PRODUCT_PROPOSALS_PROJECT_ID,
        title: `Proposal: ${p.name}`,
        description: [
          `Tagline: ${p.tagline}`,
          `Description: ${p.description}`,
          `InspiredBy: ${(p.inspiredBy || []).join(" | ")}`,
          `PainPoint: ${p.painPoint}`,
          `CostBarrier: ${p.costBarrier}`,
          `NarrowSlice: ${p.narrowSlice}`,
          `Status: proposed`,
          `ProposedAt: ${new Date().toISOString()}`,
        ].join("\n"),
      });
      created.push({ id: issueId, ...p, status: "proposed" });
    }

    await notifyTeamServer(
      `💡 Product Forge proposed ${created.length} new candidate product${created.length === 1 ? "" : "s"}: ${created.map((c) => c.name).join(", ")} — awaiting PD review.`,
    );
    res.json({ proposals: created });
  } catch (err) {
    console.error("[product-forge] /propose:", err);
    const status = err?.name === "ZodError" ? 400 : 500;
    res.status(status).json({ error: err?.message ?? "Proposal generation failed" });
  }
});

/** POST /proposals/:id/decide — { decision: "added" | "deferred", note? } */
router.post("/proposals/:id/decide", requireRole("PD"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const decision = String(req.body?.decision || "").toLowerCase();
    if (!["added", "deferred"].includes(decision)) {
      return res.status(400).json({ error: 'decision must be "added" or "deferred"' });
    }
    const issues = await listIssues({ count: 200 });
    const issue = issues.find((i) => i.id === id && i.projectId === PRODUCT_PROPOSALS_PROJECT_ID);
    if (!issue) return res.status(404).json({ error: `Proposal #${id} not found` });

    const fields = parseKV(issue.description);
    const note = String(req.body?.note || "").trim();
    const nextDescription = [
      `Tagline: ${fields.Tagline || ""}`,
      `Description: ${fields.Description || ""}`,
      `InspiredBy: ${fields.InspiredBy || ""}`,
      `PainPoint: ${fields.PainPoint || ""}`,
      `CostBarrier: ${fields.CostBarrier || ""}`,
      `NarrowSlice: ${fields.NarrowSlice || ""}`,
      `Status: ${decision}`,
      `ProposedAt: ${fields.ProposedAt || ""}`,
      `DecidedAt: ${new Date().toISOString()}`,
      note ? `DecisionNote: ${note}` : null,
    ]
      .filter((l) => l !== null)
      .join("\n");
    await updateIssueDescription(id, nextDescription);

    const name = issue.title.replace(/^Proposal:\s*/, "").trim();
    await notifyTeamServer(
      `${decision === "added" ? "✅" : "🗄️"} Product Forge proposal **${name}** marked **${decision}**${note ? ` — ${note}` : ""}.`,
    );
    res.json({ ok: true, id, status: decision });
  } catch (err) {
    console.error("[product-forge] /decide:", err);
    res.status(500).json({ error: err?.message ?? "Decision failed" });
  }
});

export default router;
