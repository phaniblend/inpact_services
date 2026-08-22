/**
 * ID Module router — the Instructional Design module from the PD-flow diagram.
 * While SpecForge breaks a spec into assignable tasks, this module runs per task:
 * check the Module Library for an existing generic assistance module first (reuse),
 * and only generate a new one with Gemini if nothing matches. Never product-specific.
 *
 * Two ways a module gets here:
 *  - Manual: someone in ID Studio fills the form themselves (Check Module Library -> Generate -> Publish).
 *  - Auto-drafted: SpecForge's Stage 3 classifier (specforge-router.js) couldn't find a match for a task
 *    it just created, so it already ran Gemini and filed an "Assistance lesson needed: <tag>" issue here
 *    for human review. /pending-requests surfaces those; publishing one patches the blocked task(s).
 *  - Funda follow-on: when a draft lists funda prereqs missing from the catalog, IDs decide which to
 *    skip as trivial vs generate; /funda-decision creates more Assistance-lesson-needed queue items.
 */
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generateAssistModule, assertValidModule } from "../src/id-module/generateModule.js";
import { spliceNodesArray } from "../src/id-module/spliceNodesArray.js";
import { fundaGenerationSpec, fundaModuleTag } from "../src/id-module/fundaPrereqs.js";
import { notifyTeamServer } from "./notify-server.js";
import { MODULE_CATALOG } from "../src/id-module/moduleCatalog.js";
import { rankModuleMatches } from "../src/id-module/matchModules.js";
import { matchCoreLesson, lessonByKey, inferLessonSide, coreLessonManifestMeta } from "../src/id-module/matchCoreLesson.js";
import { gradeBackendLesson, runBackendSandbox } from "./be-lesson-sandbox.js";
import { createAssistanceSession, markSessionLaunched, completeAssistanceSession } from "./assistance-sessions.js";
import {
  listIssues,
  createIssue,
  updateIssueDescription,
  updateIssueTitle,
  parseKV,
} from "./onedev-client.js";
import { tryRematchQueuedApplicants } from "./recruit-router.js";
import { requireRole } from "./auth-session.js";
import { RESERVED_PROJECT_IDS } from "../src/cohort-matching/matching.js";

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSIST_DIR = path.resolve(__dirname, "..", "src", "engines", "assist");

const MODULE_LIBRARY_PROJECT_ID = 4;

/** Workbench owns listening: scan NeedsTutorial tasks and wire AssistModule when Module Library
 * has published that DraftModule (or any published tag matching DraftModule). Returns wired task ids. */
async function syncWiringFromPublishedModules() {
  const issues = await listIssues({ count: 200 });
  const publishedTags = new Set(
    issues
      .filter((i) => i.projectId === MODULE_LIBRARY_PROJECT_ID && i.title.startsWith("Module:"))
      .map((i) => i.title.replace(/^Module:\s*/, "").trim().toLowerCase())
  );
  if (publishedTags.size === 0) return { wired: [], publishedCount: 0 };

  const wired = [];
  for (const task of issues) {
    if (RESERVED_PROJECT_IDS.has(task.projectId) || task.projectId === 1) continue;
    if (task.state !== "Open") continue;
    const desc = task.description || "";
    if (!/^NeedsTutorial:\s*true/m.test(desc)) continue;
    const draft = /^DraftModule:\s*(.+)$/m.exec(desc)?.[1]?.trim();
    if (!draft || !publishedTags.has(draft.toLowerCase())) continue;

    const newDescription = desc
      .split("\n")
      .map((line) => {
        if (/^NeedsTutorial:/.test(line)) return `AssistModule: ${draft}`;
        if (/^DraftModule:/.test(line)) return null;
        return line;
      })
      .filter((line) => line !== null)
      .join("\n");
    try {
      await updateIssueDescription(task.id, newDescription);
      wired.push({ taskId: task.id, moduleTag: draft });
    } catch (err) {
      console.error(`[id-module] sync-wiring failed for task #${task.id}:`, err.message);
    }
  }
  return { wired, publishedCount: publishedTags.size };
}

/** Replace or append Key: value lines in an issue description. */
function upsertKV(description, updates) {
  const lines = (description || "").split("\n").filter((l) => l.length > 0);
  const keys = new Set(Object.keys(updates));
  const kept = lines.filter((line) => !keys.has(line.split(": ")[0]));
  for (const [k, v] of Object.entries(updates)) {
    if (v == null || v === "") continue;
    kept.push(`${k}: ${v}`);
  }
  return kept.join("\n");
}

function isPendingLessonTitle(title) {
  const t = title || "";
  if (t.includes("(resolved)")) return false;
  return t.startsWith("Assistance lesson needed:") || t.startsWith("Tutorial needed:");
}

function stripLessonTitlePrefix(title) {
  return (title || "")
    .replace(/^Assistance lesson needed:\s*/i, "")
    .replace(/^Tutorial needed:\s*/i, "")
    .trim();
}

/** POST /match — { moduleTag, concept } -> ranked matches from both published modules and the planned catalog. */
router.post("/match", async (req, res) => {
  try {
    const { moduleTag, concept } = req.body;
    const query = `${moduleTag} ${concept}`;
    const issues = await listIssues({ count: 200 });
    const published = issues.filter((i) => i.projectId === MODULE_LIBRARY_PROJECT_ID && i.title.startsWith("Module:"));
    res.json({ matches: rankModuleMatches(query, published, MODULE_CATALOG) });
  } catch (err) {
    res.status(500).json({ error: err?.message ?? "Match check failed" });
  }
});

/** GET /core-lesson-match?query=...&side=frontend|backend (optional)
 * Matches FE webapp-blocks + BE backend-blocks/fundamentals (manifest ~180). Side can be forced
 * via query, else inferred from API/SQL/etc. keywords. LESSONS_BASE_URL → IAAL-main on :5174. */
router.get("/core-lesson-match", (req, res) => {
  try {
    const query = String(req.query.query || "");
    if (!query.trim()) return res.status(400).json({ error: "query is required" });
    const sideArg = String(req.query.side || "").toLowerCase();
    const side =
      sideArg === "frontend" || sideArg === "backend" ? sideArg : inferLessonSide(query) || undefined;
    // Prefer LESSONS_BASE_URL (must be reachable as 127.0.0.1 if lessons Vite uses host: "127.0.0.1").
    const base = process.env.LESSONS_BASE_URL || "http://127.0.0.1:5174";
    const withUrl = (m) => ({ ...m, url: `${base}/#${m.route}` });
    const result = matchCoreLesson(query, side ? { side } : undefined);
    const meta = { side: side || "all", ...coreLessonManifestMeta() };
    if (result.auto) return res.json({ auto: withUrl(result.auto), meta });
    if (result.curated) return res.json({ curated: result.curated.map(withUrl), meta });
    res.json({ none: true, meta });
  } catch (err) {
    res.status(500).json({ error: err?.message ?? "Core lesson match failed" });
  }
});

/** POST /grade-backend — { code, mustInclude?, invoke? } → sandboxed Node vm grade (no network/DB).
 * Used by IPF and by the lessons app (proxied) so BE mastery submit is not browser-only keyword match. */
router.post("/grade-backend", (req, res) => {
  try {
    const { code, mustInclude, invoke, runOnly } = req.body || {};
    if (typeof code !== "string" || !code.trim()) {
      return res.status(400).json({ error: "code is required" });
    }
    if (runOnly) {
      return res.json(runBackendSandbox(code, { invoke }));
    }
    const verdict = gradeBackendLesson({
      code,
      mustInclude: Array.isArray(mustInclude) ? mustInclude : [],
      invoke: typeof invoke === "string" ? invoke : undefined,
    });
    res.json(verdict);
  } catch (err) {
    res.status(500).json({ error: err?.message ?? "BE grade failed" });
  }
});

/** POST /assistance-session — { taskId, taskTitle, lessonKey } -> { sessionId, url }. The client
 * only ever picks from lessonKeys this server already returned via /core-lesson-match — a real,
 * logged human choice, same "logged decision, not an algorithm's guess" philosophy as every other
 * placement in this app — but the server re-derives the canonical URL from the manifest itself
 * rather than trusting a client-supplied one, and rejects any lessonKey that isn't a real manifest
 * entry. Session + one-time completion token are created here; the token is returned exactly once
 * and is never itself stored (only its hash is). */
router.post("/assistance-session", async (req, res) => {
  try {
    const { taskId, taskTitle, lessonKey } = req.body;
    if (!taskId || !lessonKey) return res.status(400).json({ error: "taskId and lessonKey are required" });
    const lesson = lessonByKey(lessonKey);
    if (!lesson) return res.status(400).json({ error: `Unknown lessonKey: ${lessonKey}` });

    const base = process.env.LESSONS_BASE_URL || "http://127.0.0.1:5174";
    const lessonUrl = `${base}/#${lesson.route}`;
    const { sessionId, completionToken } = await createAssistanceSession({
      taskId,
      taskTitle: taskTitle || "",
      lessonKey,
      lessonUrl,
    });

    // Query params MUST land after the hash — this app and IAAL-main both use HashRouter, so
    // everything before the `#` is just the static file being served; window.location.search is
    // empty there. See docs/IPF_DEVGUIDE.md §5a-4.
    const launchUrl = `${base}/#${lesson.route}?source=ipf&assistSessionId=${sessionId}&completionToken=${completionToken}`;
    res.json({ sessionId, url: launchUrl });
  } catch (err) {
    console.error("[id-module] /assistance-session:", err);
    res.status(500).json({ error: err?.message ?? "Could not create assistance session" });
  }
});

/** GET /assistance-complete?sessionId=&token= — the completion callback IAAL-main's lesson app
 * navigates to (same-tab, real browser navigation, not a fetch) the moment its real
 * onLessonComplete fires. Validates the session + one-time token, marks completion idempotently,
 * then redirects back to Workbench — this app has no per-task editor route to redirect to (unlike
 * the route this endpoint's shape was originally speced against), so Workbench with a
 * "just completed" marker is the real, honest destination. Never trusts a client-supplied return
 * URL — the only place execution can land is this hardcoded Workbench redirect. */
router.get("/assistance-complete", async (req, res) => {
  try {
    const { sessionId, token } = req.query;
    if (!sessionId || !token) return res.status(400).send("sessionId and token are required");
    const { taskId } = await completeAssistanceSession(String(sessionId), String(token));
    const frontend = process.env.IPF_FRONTEND_URL || "http://127.0.0.1:5173";
    res.redirect(
      302,
      `${frontend}/#/workbench?tutorialCompleted=${encodeURIComponent(taskId)}&openTask=${encodeURIComponent(taskId)}`
    );
  } catch (err) {
    console.error("[id-module] /assistance-complete:", err);
    res.status(400).send(`Could not complete assistance session: ${err?.message ?? "unknown error"}`);
  }
});

/** POST /assistance-session/:id/launched — best-effort marker, fired once the lesson app's page
 * actually mounts with a real assistance context (see the HashRouter context parser added to
 * IAAL-main). Never blocks anything if it fails. */
router.post("/assistance-session/:id/launched", (req, res) => {
  markSessionLaunched(req.params.id).catch(() => {});
  res.status(202).end();
});

/** GET /catalog — the full planned catalog, for browsing in ID Studio. */
router.get("/catalog", (_req, res) => {
  res.json({ catalog: MODULE_CATALOG });
});

/** POST /generate — { moduleTag, concept, build, keyTeaching, newConcepts } -> generated code, not yet published. */
router.post("/generate", async (req, res) => {
  try {
    const result = await generateAssistModule(req.body);
    await notifyTeamServer(
      `🧩 ID Module generated a new assistance module: **${req.body.moduleTag}** (${req.body.concept}). Needs review before it's published — check ID Studio.`
    );
    res.json(result);
  } catch (err) {
    console.error("[id-module] /generate:", err);
    res.status(err?.message?.includes("isn't configured") ? 503 : 500).json({
      error: err?.message ?? "Generation failed",
    });
  }
});

/** GET /pending-requests — Gemini assistance-lesson drafts awaiting ID review. */
router.get("/pending-requests", async (_req, res) => {
  try {
    const issues = await listIssues({ count: 200 });
    const requests = issues
      .filter((i) => i.projectId === MODULE_LIBRARY_PROJECT_ID && isPendingLessonTitle(i.title))
      .map((i) => {
        const fields = parseKV(i.description);
        const taskIds = (fields.RequestedForTasks || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const splitPipe = (v) =>
          (v || "")
            .split("|")
            .map((s) => s.trim())
            .filter(Boolean);
        const kind = (fields.Kind || "").toLowerCase() === "funda" ? "funda" : "core";
        return {
          issueId: i.id,
          tag: stripLessonTitlePrefix(i.title),
          kind,
          concept: fields.Concept || "",
          build: fields.Build || "",
          keyTeaching: fields.KeyTeaching || "",
          filePath: fields.FilePath || "",
          product: fields.RequestedForProduct || "",
          parentLesson: fields.ParentLesson || "",
          taskCount: taskIds.length,
          suggestedFundas: splitPipe(fields.SuggestedFundas),
          missingFundas: splitPipe(fields.MissingFundas),
          presentFundas: splitPipe(fields.PresentFundas),
          fundaDecision: fields.FundaDecision || "",
          skipFundas: splitPipe(fields.SkipFundas),
          generateFundas: splitPipe(fields.GenerateFundas),
          submitDate: i.submitDate,
        };
      })
      .sort((a, b) => new Date(b.submitDate) - new Date(a.submitDate));
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: err?.message ?? "Could not load pending requests" });
  }
});

/**
 * POST /funda-decision — ID chooses which missing funda prereqs to generate vs mark trivial.
 * Body: { issueId, generate: string[], skip: string[] }
 * Saves the decision on the parent Assistance-lesson-needed issue, Gemini-drafts each selected
 * funda, and files new queue items (Kind: funda) for the same review/publish path.
 */
router.post("/funda-decision", requireRole("ID"), async (req, res) => {
  try {
    const issueId = Number(req.body?.issueId);
    const generateLabels = Array.isArray(req.body?.generate)
      ? req.body.generate.map((s) => String(s).trim()).filter(Boolean)
      : [];
    const skipLabels = Array.isArray(req.body?.skip)
      ? req.body.skip.map((s) => String(s).trim()).filter(Boolean)
      : [];

    if (!issueId) return res.status(400).json({ error: "issueId is required" });
    if (generateLabels.length === 0 && skipLabels.length === 0) {
      return res.status(400).json({ error: "Provide at least one funda in generate[] or skip[]" });
    }

    const issues = await listIssues({ count: 200 });
    const parent = issues.find((i) => i.id === issueId && i.projectId === MODULE_LIBRARY_PROJECT_ID);
    if (!parent || !isPendingLessonTitle(parent.title)) {
      return res.status(404).json({ error: "Pending assistance-lesson request not found" });
    }

    const parentFields = parseKV(parent.description);
    if ((parentFields.Kind || "").toLowerCase() === "funda") {
      return res.status(400).json({ error: "Funda drafts do not themselves carry funda prereq decisions" });
    }

    const parentTag = stripLessonTitlePrefix(parent.title);
    const missingListed = (parentFields.MissingFundas || "")
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);
    const allowed = new Set(missingListed.length ? missingListed : [...generateLabels, ...skipLabels]);
    for (const label of [...generateLabels, ...skipLabels]) {
      if (!allowed.has(label)) {
        return res.status(400).json({ error: `"${label}" is not listed on MissingFundas for this request` });
      }
    }
    const overlap = generateLabels.filter((g) => skipLabels.includes(g));
    if (overlap.length) {
      return res.status(400).json({ error: `Cannot both generate and skip: ${overlap.join(", ")}` });
    }

    const decisionLine = `generate=[${generateLabels.join(" | ")}] | trivial=[${skipLabels.join(" | ")}] | decidedAt=${new Date().toISOString()}`;
    let nextDesc = upsertKV(parent.description, {
      FundaDecision: decisionLine,
      GenerateFundas: generateLabels.join(" | "),
      SkipFundas: skipLabels.join(" | "),
    });

    // Remaining missing after this decision = undeclared leftovers still pending
    const decided = new Set([...generateLabels, ...skipLabels]);
    const stillMissing = missingListed.filter((m) => !decided.has(m));
    nextDesc = upsertKV(nextDesc, {
      MissingFundas: stillMissing.join(" | ") || null,
    });
    // Clear MissingFundas line entirely when empty
    if (stillMissing.length === 0) {
      nextDesc = nextDesc
        .split("\n")
        .filter((line) => !line.startsWith("MissingFundas:"))
        .join("\n");
    }

    await updateIssueDescription(issueId, nextDesc);

    const existingOpenTags = new Set(
      issues
        .filter((i) => i.projectId === MODULE_LIBRARY_PROJECT_ID && isPendingLessonTitle(i.title))
        .map((i) => stripLessonTitlePrefix(i.title))
    );
    const publishedTags = new Set(
      issues
        .filter((i) => i.projectId === MODULE_LIBRARY_PROJECT_ID && i.title.startsWith("Module:"))
        .map((i) => i.title.replace(/^Module:\s*/, "").trim())
    );

    const created = [];
    const skippedExisting = [];
    const failures = [];

    for (const label of generateLabels) {
      const spec = fundaGenerationSpec(label, { parentTag });
      if (existingOpenTags.has(spec.moduleTag) || publishedTags.has(spec.moduleTag)) {
        skippedExisting.push({ label, tag: spec.moduleTag, reason: "already pending or published" });
        continue;
      }
      try {
        const result = await generateAssistModule(spec);
        await createIssue({
          projectId: MODULE_LIBRARY_PROJECT_ID,
          title: `Assistance lesson needed: ${spec.moduleTag}`,
          description: [
            `Kind: funda`,
            `ParentLesson: ${parentTag}`,
            `ParentRequestIssueId: ${issueId}`,
            `FundaLabel: ${label}`,
            `Concept: ${spec.concept}`,
            `Build: ${spec.build}`,
            `KeyTeaching: ${spec.keyTeaching}`,
            `FilePath: ${result.filePath}`,
            `RequestedForProduct: ${parentFields.RequestedForProduct || ""}`,
            `RequestedForTasks:`,
          ].join("\n"),
        });
        existingOpenTags.add(spec.moduleTag);
        created.push({ label, tag: spec.moduleTag, filePath: result.filePath });
      } catch (err) {
        console.error(`[id-module] funda generate failed for ${label}:`, err);
        failures.push({ label, tag: fundaModuleTag(label), error: err?.message ?? String(err) });
        try {
          await createIssue({
            projectId: MODULE_LIBRARY_PROJECT_ID,
            title: `Assistance lesson needed: ${fundaModuleTag(label)}`,
            description: [
              `Kind: funda`,
              `ParentLesson: ${parentTag}`,
              `ParentRequestIssueId: ${issueId}`,
              `FundaLabel: ${label}`,
              `Concept: Fundamental prerequisite: ${label}`,
              `GenerationFailed: ${err?.message ?? "unknown error"}`,
              `RequestedForProduct: ${parentFields.RequestedForProduct || ""}`,
            ].join("\n"),
          });
        } catch {
          /* best-effort queue stub */
        }
      }
    }

    await notifyTeamServer(
      `📚 ID decided fundas for **${parentTag}**: generate ${generateLabels.length}, mark trivial ${skipLabels.length}.` +
        (created.length
          ? ` Drafted ${created.length} funda lesson${created.length === 1 ? "" : "s"} into the ID review queue (${created.map((c) => c.tag).join(", ")}).`
          : "") +
        (failures.length ? ` ${failures.length} generation failure(s).` : "")
    );

    res.json({
      ok: true,
      parentTag,
      decision: decisionLine,
      generate: generateLabels,
      skip: skipLabels,
      created,
      skippedExisting,
      failures,
    });
  } catch (err) {
    console.error("[id-module] /funda-decision:", err);
    res.status(err?.message?.includes("isn't configured") ? 503 : 500).json({
      error: err?.message ?? "Funda decision failed",
    });
  }
});

/** GET /draft?filePath=... — serves an already-generated module's source for review.
 * Path is constrained to src/engines/assist/ — nothing else on disk is reachable through this route. */
router.get("/draft", (req, res) => {
  try {
    const filePath = String(req.query.filePath || "");
    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(ASSIST_DIR + path.sep)) {
      return res.status(400).json({ error: "filePath must be inside src/engines/assist/" });
    }
    if (!fs.existsSync(resolved)) return res.status(404).json({ error: "File not found — it may have been moved." });
    res.json({ code: fs.readFileSync(resolved, "utf8"), filePath: resolved });
  } catch (err) {
    res.status(500).json({ error: err?.message ?? "Could not read draft" });
  }
});

/** PUT /draft — { filePath, nodes } -> re-splices the file's NODES array with ID's edits from the
 * review overlay, validates the result with the same esbuild+vm check generateModule.js runs
 * before a fresh generation is ever written, and only overwrites the file if it passes. A reviewer
 * editing wording in the overlay never risks writing a broken file — same discipline as generation,
 * applied to edits too. */
router.put("/draft", (req, res) => {
  try {
    const { filePath, nodes } = req.body;
    if (!Array.isArray(nodes)) return res.status(400).json({ error: "nodes[] is required" });
    const resolved = path.resolve(String(filePath || ""));
    if (!resolved.startsWith(ASSIST_DIR + path.sep)) {
      return res.status(400).json({ error: "filePath must be inside src/engines/assist/" });
    }
    if (!fs.existsSync(resolved)) return res.status(404).json({ error: "File not found — it may have been moved." });

    const original = fs.readFileSync(resolved, "utf8");
    const spliced = spliceNodesArray(original, nodes);
    assertValidModule(spliced); // throws with a clear message if the edit broke syntax or a runtime reference
    fs.writeFileSync(resolved, spliced, "utf8");
    res.json({ ok: true, filePath: resolved, code: spliced });
  } catch (err) {
    console.error("[id-module] /draft PUT:", err);
    res.status(400).json({ error: err?.message ?? "Could not save edits" });
  }
});

/** POST /publish — { moduleTag, concept, filePath } -> registers it in the Module Library.
 * If a matching "Assistance lesson needed: <moduleTag>" (or legacy Tutorial needed) request exists,
 * this also unblocks every task it was raised for and closes the request out.
 * Then runs the queued-applicant rematch sweep — human-action trigger, no cron (handoff §9). */
router.post("/publish", requireRole("ID"), async (req, res) => {
  try {
    const { moduleTag, concept, filePath } = req.body;

    await createIssue({
      projectId: MODULE_LIBRARY_PROJECT_ID,
      title: `Module: ${moduleTag}`,
      description: [`Concept: ${concept}`, `FilePath: ${filePath}`, `PublishedAt: ${new Date().toISOString()}`].join("\n"),
    });

    const unblocked = await resolvePendingRequest(moduleTag);
    // Broader listen: any NeedsTutorial + DraftModule matching a published Module gets wired,
    // even if RequestedForTasks / duplicate queue titles drifted.
    const sync = await syncWiringFromPublishedModules();
    const wiredIds = new Set([...unblocked, ...sync.wired.map((w) => w.taskId)]);

    let rematch = { rematched: [] };
    if (wiredIds.size > 0) {
      try {
        rematch = await tryRematchQueuedApplicants();
      } catch (err) {
        console.error("[id-module] rematch sweep after publish failed:", err.message);
      }
    }

    await notifyTeamServer(
      `✅ **${moduleTag}** approved and published to the Module Library — available for reuse now.` +
        (wiredIds.size > 0
          ? ` Workbench wired ${wiredIds.size} task${wiredIds.size === 1 ? "" : "s"} that were waiting on published lessons.`
          : "") +
        (rematch.rematched.length > 0
          ? ` Rematched ${rematch.rematched.length} queued applicant${rematch.rematched.length === 1 ? "" : "s"}.`
          : "")
    );
    res.json({
      ok: true,
      unblockedTaskCount: wiredIds.size,
      rematchedCount: rematch.rematched.length,
    });
  } catch (err) {
    res.status(500).json({ error: err?.message ?? "Publish failed" });
  }
});

/** GET /sync-wiring — Workbench polls this: wire any NeedsTutorial tasks whose DraftModule is now published. */
router.get("/sync-wiring", async (_req, res) => {
  try {
    const { wired, publishedCount } = await syncWiringFromPublishedModules();
    let rematch = { rematched: [] };
    if (wired.length > 0) {
      try {
        rematch = await tryRematchQueuedApplicants();
      } catch (err) {
        console.error("[id-module] rematch after sync-wiring failed:", err.message);
      }
    }
    res.json({
      ok: true,
      publishedCount,
      wiredCount: wired.length,
      wired,
      rematchedCount: rematch.rematched.length,
    });
  } catch (err) {
    res.status(500).json({ error: err?.message ?? "sync-wiring failed" });
  }
});

/** Finds the open Assistance-lesson / Tutorial-needed request (if any), patches every task it
 * listed from NeedsTutorial+DraftModule to AssistModule, and marks the request resolved.
 * Funda publishes also stamp the parent request's PresentFundas. */
async function resolvePendingRequest(moduleTag) {
  const issues = await listIssues({ count: 200 });
  const requests = issues.filter(
    (i) =>
      i.projectId === MODULE_LIBRARY_PROJECT_ID &&
      (i.title === `Assistance lesson needed: ${moduleTag}` || i.title === `Tutorial needed: ${moduleTag}`)
  );

  const taskIdSet = new Set();
  for (const request of requests) {
    const fields = parseKV(request.description);
    for (const s of (fields.RequestedForTasks || "").split(",")) {
      const id = Number(s.trim());
      if (id) taskIdSet.add(id);
    }
  }
  // Also catch tasks tagged DraftModule even if RequestedForTasks drifted / stubs differed.
  for (const task of issues) {
    if (RESERVED_PROJECT_IDS.has(task.projectId) || task.projectId === 1) continue;
    const draft = /^DraftModule:\s*(.+)$/m.exec(task.description || "")?.[1]?.trim();
    if (draft && draft.toLowerCase() === String(moduleTag).toLowerCase()) {
      taskIdSet.add(task.id);
    }
  }

  const unblocked = [];
  for (const taskId of taskIdSet) {
    try {
      const task = issues.find((i) => i.id === taskId);
      if (!task) continue;
      if (!/^NeedsTutorial:\s*true/m.test(task.description || "")) continue;
      const newDescription = (task.description || "")
        .split("\n")
        .map((line) => {
          if (/^NeedsTutorial:/.test(line)) return `AssistModule: ${moduleTag}`;
          if (/^DraftModule:/.test(line)) return null;
          return line;
        })
        .filter((line) => line !== null)
        .join("\n");
      await updateIssueDescription(taskId, newDescription);
      unblocked.push(taskId);
    } catch (err) {
      console.error(`[id-module] failed to unblock task ${taskId}:`, err.message);
    }
  }

  const request = requests[0];
  if (request) {
    const fields = parseKV(request.description);
    if ((fields.Kind || "").toLowerCase() === "funda") {
      const parentId = Number(fields.ParentRequestIssueId);
      const label = fields.FundaLabel || moduleTag;
      if (parentId) {
        const parent = issues.find((i) => i.id === parentId);
        if (parent) {
          const pf = parseKV(parent.description);
          const present = (pf.PresentFundas || "")
            .split("|")
            .map((s) => s.trim())
            .filter(Boolean);
          if (!present.includes(label)) present.push(label);
          const missing = (pf.MissingFundas || "")
            .split("|")
            .map((s) => s.trim())
            .filter(Boolean)
            .filter((m) => m !== label);
          let desc = upsertKV(parent.description, {
            PresentFundas: present.join(" | "),
            MissingFundas: missing.join(" | ") || null,
          });
          if (missing.length === 0) {
            desc = desc
              .split("\n")
              .filter((line) => !line.startsWith("MissingFundas:"))
              .join("\n");
          }
          try {
            await updateIssueDescription(parentId, desc);
          } catch (err) {
            console.error(`[id-module] failed to update parent fundas on #${parentId}:`, err.message);
          }
        }
      }
    }

    for (const req of requests) {
      const resolvedTitle = req.title.includes("Assistance lesson needed:")
        ? `Assistance lesson needed: ${moduleTag} (resolved)`
        : `Tutorial needed: ${moduleTag} (resolved)`;
      try {
        await updateIssueTitle(req.id, resolvedTitle);
      } catch (err) {
        console.error(`[id-module] failed to resolve request #${req.id}:`, err.message);
      }
    }
  }
  return unblocked;
}

export default router;
