/**
 * SpecForge API router.
 *  POST /generate   Stage 1 (Normalizer) + Stage 2 (Domain Model). Review-only, no writes.
 *  POST /breakdown  Stage 3 (Task Breakdown): epics -> stories -> tasks. Review-only, no writes.
 *  POST /classify   Scores a task list against the Module Library (published + planned catalog).
 *                   Read-only — lets PD Studio show live match status before anything is created.
 *  POST /publish    The only endpoint that writes: creates/reuses the delivery project, creates a new
 *                   cohort or (if cohortIssueId is given — a spec revision) adds to an existing one's
 *                   TaskCount, creates one OneDev task issue per task (tagged AssistModule if a match
 *                   was found, NoTutorialNeeded for non-coding trades, or NeedsTutorial+DraftModule
 *                   while a new one is drafted), and files an "Assistance lesson needed" request in the Module
 *                   Library for anything undrafted or awaiting ID-team review. A task is never created
 *                   wired to nothing and silently assignable — it's matched, exempt, mid-draft, or
 *                   explicitly blocked.
 */
import express from "express";
import { runStages1And2, runStage2Only, runTaskBreakdown, runTutorialDrafting } from "../src/specforge/pipeline.js";
import { generateAssistModule } from "../src/id-module/generateModule.js";
import { bestModuleMatch, scoreOverlap } from "../src/id-module/matchModules.js";
import { MODULE_CATALOG } from "../src/id-module/moduleCatalog.js";
import { notifyTeamServer } from "./notify-server.js";
import { listIssues, listProjects, createProject, createIssue, updateIssueDescription, parseKV, ensureDeliveryProject } from "./onedev-client.js";
import { classifySuggestedFundas } from "../src/id-module/fundaPrereqs.js";
import { tryRematchQueuedApplicants } from "./recruit-router.js";
import { requireRole } from "./auth-session.js";

const router = express.Router();

const COHORT_PROJECT_ID = 2;
const TEAM_OPS_PROJECT_ID = 3;
const MODULE_LIBRARY_PROJECT_ID = 4;
const RESERVED_PROJECT_IDS = new Set([COHORT_PROJECT_ID, TEAM_OPS_PROJECT_ID, MODULE_LIBRARY_PROJECT_ID]);

function getDeepSeekKey() {
  return process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY;
}

router.post("/generate", async (req, res) => {
  const apiKey = getDeepSeekKey();
  if (!apiKey) {
    return res.status(503).json({ error: "DEEPSEEK_API_KEY is not set in D:\\IPAAL\\.env — SpecForge needs it to run." });
  }
  try {
    const result = await runStages1And2(req.body, apiKey);
    res.json(result);
  } catch (err) {
    console.error("[specforge] /generate:", err);
    const status = err?.name === "ZodError" ? 400 : 500;
    res.status(status).json({ error: err?.message ?? "SpecForge pipeline failed" });
  }
});

/** POST /stage2 — re-plan screens & APIs from an edited Stage 1 (release_features / out_of_scope). */
router.post("/stage2", async (req, res) => {
  const apiKey = getDeepSeekKey();
  if (!apiKey) {
    return res.status(503).json({ error: "DEEPSEEK_API_KEY is not set in D:\\IPAAL\\.env — SpecForge needs it to run." });
  }
  try {
    if (!req.body?.stage1) return res.status(400).json({ error: "stage1 is required" });
    const stage2 = await runStage2Only(req.body.stage1, apiKey);
    res.json({ stage2 });
  } catch (err) {
    console.error("[specforge] /stage2:", err);
    const status = err?.name === "ZodError" ? 400 : 500;
    res.status(status).json({ error: err?.message ?? "Stage 2 rebuild failed" });
  }
});

router.post("/breakdown", async (req, res) => {
  const apiKey = getDeepSeekKey();
  if (!apiKey) {
    return res.status(503).json({ error: "DEEPSEEK_API_KEY is not set in D:\\IPAAL\\.env — SpecForge needs it to run." });
  }
  try {
    const { stage1, stage2 } = req.body;
    if (!stage1 || !stage2) return res.status(400).json({ error: "stage1 and stage2 are required" });
    const tasks = await runTaskBreakdown(stage1, stage2, apiKey);
    res.json({ tasks });
  } catch (err) {
    console.error("[specforge] /breakdown:", err);
    const status = err?.name === "ZodError" ? 400 : 500;
    res.status(status).json({ error: err?.message ?? "Task breakdown failed" });
  }
});

async function loadPublishedModules() {
  const issues = await listIssues({ count: 200 });
  return issues.filter((i) => i.projectId === MODULE_LIBRARY_PROJECT_ID && i.title.startsWith("Module:"));
}

router.post("/classify", async (req, res) => {
  try {
    const { tasks } = req.body;
    if (!Array.isArray(tasks)) return res.status(400).json({ error: "tasks[] is required" });
    const published = await loadPublishedModules();
    const classified = tasks.map((t) => {
      if (t.no_tutorial_needed) return { ...t, matchStatus: "exempt" };
      const match = bestModuleMatch(`${t.title} ${t.description}`, published, MODULE_CATALOG);
      return match
        ? { ...t, matchStatus: "matched", moduleTag: match.tag, matchScore: match.score }
        : { ...t, matchStatus: "unmatched" };
    });
    res.json({ tasks: classified });
  } catch (err) {
    console.error("[specforge] /classify:", err);
    res.status(500).json({ error: err?.message ?? "Classification failed" });
  }
});

const SIMILAR_PRODUCT_THRESHOLD = 0.6;

function normKey(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Build one row per delivery project that has SpecForge/cohort linkage (or any non-reserved project with tasks). */
async function buildExistingProductCatalog() {
  const [projects, issues] = await Promise.all([
    listProjects({ offset: 0, count: 100 }),
    listIssues({ offset: 0, count: 300 }),
  ]);

  const byProjectId = new Map();

  for (const c of issues) {
    if (c.projectId !== TEAM_OPS_PROJECT_ID || !c.title.startsWith("Cohort:")) continue;
    const m = /DeliveryProject:\s*(.+?)\s*\(#(\d+)\)/.exec(c.description || "");
    if (!m) continue;
    const projectId = Number(m[2]);
    if (!Number.isFinite(projectId) || RESERVED_PROJECT_IDS.has(projectId)) continue;
    const productName =
      /^Product:\s*(.+)$/m.exec(c.description || "")?.[1]?.trim() || m[1].trim();
    const prev = byProjectId.get(projectId);
    // Prefer the newest cohort issue id when multiple cohorts point at one project.
    if (prev && prev.cohortIssueId > c.id) continue;
    byProjectId.set(projectId, {
      projectId,
      projectName: m[1].trim(),
      productName,
      cohortIssueId: c.id,
      cohortName: c.title.replace(/^Cohort:\s*/, "").trim(),
      features: [],
      storiesByFeature: {},
      taskTitles: [],
      openTasks: 0,
      closedTasks: 0,
    });
  }

  for (const p of projects || []) {
    if (!p?.id || RESERVED_PROJECT_IDS.has(p.id)) continue;
    if (byProjectId.has(p.id)) continue;
    // Delivery shells without a cohort yet — still useful for name collision.
    const name = String(p.name || "").trim();
    if (!name || /^product-backlog$/i.test(name)) continue;
    byProjectId.set(p.id, {
      projectId: p.id,
      projectName: name,
      productName: name,
      cohortIssueId: null,
      cohortName: null,
      features: [],
      storiesByFeature: {},
      taskTitles: [],
      openTasks: 0,
      closedTasks: 0,
    });
  }

  for (const issue of issues) {
    if (RESERVED_PROJECT_IDS.has(issue.projectId)) continue;
    const entry = byProjectId.get(issue.projectId);
    if (!entry) continue;
    if (issue.state === "Open") entry.openTasks += 1;
    else entry.closedTasks += 1;
    const title = String(issue.title || "").trim();
    if (title) entry.taskTitles.push(title);
    const epic = /^Epic:\s*(.+)$/m.exec(issue.description || "")?.[1]?.trim();
    const story = /^Story:\s*(.+)$/m.exec(issue.description || "")?.[1]?.trim();
    if (epic) {
      if (!entry.features.some((f) => normKey(f) === normKey(epic))) entry.features.push(epic);
      if (!entry.storiesByFeature[epic]) entry.storiesByFeature[epic] = [];
      if (story && !entry.storiesByFeature[epic].some((s) => normKey(s) === normKey(story))) {
        entry.storiesByFeature[epic].push(story);
      }
    }
  }

  return [...byProjectId.values()].filter((p) => p.features.length > 0 || p.taskTitles.length > 0 || p.cohortIssueId);
}

function scoreAgainstProduct(query, product) {
  const name = String(query.product_name || "").trim();
  const desc = String(query.description || "").trim();
  const features = Array.isArray(query.release_features)
    ? query.release_features.map((f) => String(f || "").trim()).filter(Boolean)
    : [];

  if (name && normKey(name) === normKey(product.productName)) return 1;
  if (name && normKey(name) === normKey(product.projectName)) return 1;

  const nameScore = Math.max(
    scoreOverlap(name, product.productName),
    scoreOverlap(name, product.projectName)
  );
  const boardBag = [
    product.productName,
    product.projectName,
    ...product.features,
    ...Object.values(product.storiesByFeature).flat(),
    ...product.taskTitles.slice(0, 40),
  ].join(" ");
  const queryBag = [name, desc, ...features].join(" ");
  const bagScore = scoreOverlap(queryBag, boardBag);
  const featureScore =
    features.length === 0
      ? 0
      : features.reduce((sum, f) => {
          const best = product.features.reduce(
            (m, ef) => Math.max(m, scoreOverlap(f, ef), scoreOverlap(f, `${ef} ${(product.storiesByFeature[ef] || []).join(" ")}`)),
            0
          );
          return sum + best;
        }, 0) / features.length;

  return Math.max(nameScore, bagScore, featureScore * 0.85 + nameScore * 0.15);
}

/**
 * POST /similar-products — after Stage 1 generate, detect near-duplicate delivery products (≥60%).
 * Reconstructs a feature inventory from board Epics/Stories (Stage 1 JSON is not persisted).
 */
router.post("/similar-products", requireRole("PD"), async (req, res) => {
  try {
    const product_name = String(req.body?.product_name || "").trim();
    if (!product_name) return res.status(400).json({ error: "product_name is required" });
    const catalog = await buildExistingProductCatalog();
    const ranked = catalog
      .map((p) => ({
        ...p,
        score: scoreAgainstProduct(req.body || {}, p),
      }))
      .filter((p) => p.score >= SIMILAR_PRODUCT_THRESHOLD)
      .sort((a, b) => b.score - a.score);

    const best = ranked[0] || null;
    const proposed = Array.isArray(req.body?.release_features)
      ? req.body.release_features.map((f) => String(f || "").trim()).filter(Boolean)
      : [];

    let proposedNewFeatures = proposed;
    if (best && proposed.length) {
      proposedNewFeatures = proposed.filter((f) => {
        const hit = best.features.some((ef) => scoreOverlap(f, ef) >= 0.5 || normKey(f) === normKey(ef));
        return !hit;
      });
    }

    res.json({
      threshold: SIMILAR_PRODUCT_THRESHOLD,
      match: best
        ? {
            projectId: best.projectId,
            projectName: best.projectName,
            productName: best.productName,
            cohortIssueId: best.cohortIssueId,
            cohortName: best.cohortName,
            score: best.score,
            openTasks: best.openTasks,
            closedTasks: best.closedTasks,
            features: best.features.map((name) => ({
              name,
              stories: best.storiesByFeature[name] || [],
              alreadyOnBoard: true,
            })),
          }
        : null,
      proposedNewFeatures,
      candidates: ranked.slice(0, 5).map((p) => ({
        projectId: p.projectId,
        productName: p.productName,
        score: p.score,
      })),
    });
  } catch (err) {
    console.error("[specforge] /similar-products:", err);
    res.status(500).json({ error: err?.message ?? "Similar-product check failed" });
  }
});

function buildTaskDescription(task, cohortName, assistLine) {
  const criteria = (task.acceptance_criteria || []).join("; ");
  return [
    `Epic: ${task.epic}`,
    `Story: ${task.story}`,
    `Trade: ${task.trade}`,
    // TechLevel only exists for tasks with a real skill ladder (Coding, mostly) — Matching Queue
    // reads this to gate placement against what an applicant actually said they're ready for.
    task.tech_level ? `TechLevel: ${task.tech_level}` : null,
    task.coding_focus ? `CodingFocus: ${task.coding_focus}` : null,
    `Cohort: ${cohortName}`,
    criteria ? `AcceptanceCriteria: ${criteria}` : null,
    ...assistLine,
  ]
    .filter((l) => l !== null && l !== undefined)
    .join("\n");
}

router.post("/publish", requireRole("PD"), async (req, res) => {
  try {
    const { productName, cohortName, deliveryProjectId, deliveryProjectName, cohortIssueId, tasks } = req.body;
    if (!productName || (!cohortName && !cohortIssueId) || !Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({
        error: "productName, a non-empty tasks[], and either cohortName (new cohort) or cohortIssueId (add to an existing one) are required",
      });
    }

    // --- Step 1: classify every task against the current Module Library (exempt trades skip this) ---
    console.log(`[specforge] /publish start — ${tasks.length} task(s) for "${productName}"`);
    const published = await loadPublishedModules();
    const matches = tasks.map((t) =>
      t.no_tutorial_needed ? null : bestModuleMatch(`${t.title} ${t.description}`, published, MODULE_CATALOG)
    );
    const unmatchedIndexes = tasks.map((_, i) => i).filter((i) => !tasks[i].no_tutorial_needed && !matches[i]);
    const unmatchedTasks = unmatchedIndexes.map((i) => tasks[i]);
    console.log(
      `[specforge] /publish match — matched=${matches.filter(Boolean).length}, unmatched=${unmatchedTasks.length}, exempt=${tasks.filter((t) => t.no_tutorial_needed).length}`
    );

    // --- Step 2+3: resolve delivery project + cohort FIRST so Workbench gets tasks even if
    // lesson drafting later stalls (Gemini can take minutes; used to run before any writes).
    let projectId, projectName, resolvedCohortName, cohortIssueIdResolved;
    let reusedDeliveryProject = false;

    if (cohortIssueId) {
      const opsIssues = await listIssues({ count: 200 });
      const existingCohort = opsIssues.find((i) => i.id === Number(cohortIssueId) && i.projectId === TEAM_OPS_PROJECT_ID);
      if (!existingCohort) return res.status(404).json({ error: `Cohort #${cohortIssueId} not found` });

      const fields = parseKV(existingCohort.description);
      const m = /DeliveryProject:\s*(.+?)\s*\(#(\d+)\)/.exec(existingCohort.description || "");
      if (!m) return res.status(400).json({ error: "That cohort's record is missing its delivery-project reference — can't add tasks to it." });
      projectName = m[1];
      projectId = Number(m[2]);
      resolvedCohortName = existingCohort.title.replace("Cohort:", "").trim();
      cohortIssueIdResolved = existingCohort.id;

      const newTaskCount = Number(fields.TaskCount || 0) + tasks.length;
      await updateIssueDescription(
        existingCohort.id,
        [
          `Product: ${fields.Product || productName}`,
          `DeliveryProject: ${projectName} (#${projectId})`,
          `TaskCount: ${newTaskCount}`,
          `CreatedAt: ${fields.CreatedAt || new Date().toISOString()}`,
          `UpdatedAt: ${new Date().toISOString()}`,
        ].join("\n")
      );
    } else {
      projectId = deliveryProjectId ? Number(deliveryProjectId) : null;
      projectName = deliveryProjectName || null;
      const projects = await listProjects({ count: 100 });

      if (!projectId) {
        if (!deliveryProjectName) return res.status(400).json({ error: "deliveryProjectId or deliveryProjectName is required" });
        const ensured = await ensureDeliveryProject({
          name: deliveryProjectName,
          description: `Delivery project for ${productName}, opened by PD Studio / SpecForge.`,
        });
        projectId = ensured.projectId;
        projectName = ensured.projectName;
        reusedDeliveryProject = ensured.reused;
      } else {
        // Harden client-supplied ids (handoff §9 / DEVGUIDE §6.3): must exist in OneDev, must not be
        // a reserved IPF bookkeeping project, and the name comes from OneDev not the client claim.
        if (!Number.isFinite(projectId) || projectId <= 0) {
          return res.status(400).json({ error: "deliveryProjectId must be a positive project id." });
        }
        if (RESERVED_PROJECT_IDS.has(projectId)) {
          return res.status(400).json({
            error:
              "That project id is reserved for IPF's own tracking (cohort-applications / team-ops / module-library) — pick a delivery project.",
          });
        }
        const found = projects.find((p) => p.id === projectId);
        if (!found) {
          return res.status(400).json({
            error: `Unknown deliveryProjectId ${projectId} — that delivery project does not exist.`,
          });
        }
        projectName = found.name;
      }
      if (RESERVED_PROJECT_IDS.has(projectId)) {
        return res.status(400).json({ error: "That project id is reserved for IPF's own tracking (cohort-applications / team-ops / module-library) — pick a delivery project." });
      }

      resolvedCohortName = cohortName;
      cohortIssueIdResolved = await createIssue({
        projectId: TEAM_OPS_PROJECT_ID,
        title: `Cohort: ${cohortName}`,
        description: [
          `Product: ${productName}`,
          `DeliveryProject: ${projectName} (#${projectId})`,
          `TaskCount: ${tasks.length}`,
          `CreatedAt: ${new Date().toISOString()}`,
        ].join("\n"),
      });
    }

    // --- Step 4: create one task issue per task (matched / exempt / blocked). DraftModule lines
    // are patched on after lesson drafts finish, so a Gemini stall can't block Workbench writes.
    const createdTaskIds = [];
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      let assistLine;
      if (task.no_tutorial_needed) {
        assistLine = ["NoTutorialNeeded: true"];
      } else if (matches[i]) {
        assistLine = [`AssistModule: ${matches[i].tag}`];
      } else {
        assistLine = ["NeedsTutorial: true"];
      }
      const description = buildTaskDescription(task, resolvedCohortName, assistLine);
      const issueId = await createIssue({ projectId, title: task.title, description });
      createdTaskIds.push(issueId);
    }
    console.log(`[specforge] /publish wrote ${createdTaskIds.length} task(s) into ${projectName} (#${projectId})`);

    const exemptCount = tasks.filter((t) => t.no_tutorial_needed).length;
    const matchedCount = matches.filter(Boolean).length;
    const blockedCount = tasks.length - matchedCount - exemptCount;

    // Newly published wired/exempt tasks are immediately assignable — catch up anyone already queued
    // for those trades (same human-action rematch pattern as ID Studio publish).
    let rematch = { rematched: [] };
    if (matchedCount + exemptCount > 0) {
      try {
        rematch = await tryRematchQueuedApplicants();
      } catch (err) {
        console.error("[specforge] rematch sweep after publish failed:", err.message);
      }
    }

    // File a placeholder ID request immediately so the queue isn't empty while drafts run in background.
    let draftedGroups = [];
    if (unmatchedTasks.length > 0) {
      const stubTag = `assist-${String(productName || "product")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40) || "product"}`;
      const requestedForTasks = unmatchedIndexes.map((i) => createdTaskIds[i]).filter(Boolean);
      await createIssue({
        projectId: MODULE_LIBRARY_PROJECT_ID,
        title: `Assistance lesson needed: ${stubTag}`,
        description: [
          `Concept: Assistance lesson for unmatched tasks in ${productName}`,
          `Build: Draft in progress — ID can wait for SpecForge fill-in or Generate in ID Studio`,
          `KeyTeaching: TBD`,
          `RequestedForProduct: ${productName}`,
          `RequestedForTasks: ${requestedForTasks.join(",")}`,
        ].join("\n"),
      });
      draftedGroups = [
        {
          tag: stubTag,
          taskCount: requestedForTasks.length,
          generationFailed: false,
          missingFundas: [],
          suggestedFundas: [],
          draftPending: true,
        },
      ];
    }

    await notifyTeamServer(
      `📦 SpecForge published **${tasks.length}** task${tasks.length === 1 ? "" : "s"} for **${productName}** into **${projectName}** (cohort **${resolvedCohortName}**${cohortIssueId ? ", added to existing" : ""}): ` +
        `${matchedCount} wired to existing assistance modules, ${exemptCount} exempt, ${blockedCount} blocked pending an assistance lesson` +
        (draftedGroups.length > 0
          ? ` — ${draftedGroups.length} assistance request${draftedGroups.length === 1 ? "" : "s"} queued for ID Studio (${draftedGroups.map((g) => g.tag).join(", ")}); drafts continue in the background.`
          : ".") +
        (rematch.rematched.length > 0
          ? ` Rematched ${rematch.rematched.length} queued applicant${rematch.rematched.length === 1 ? "" : "s"}.`
          : "")
    );

    console.log(`[specforge] /publish responding — background drafts=${unmatchedTasks.length > 0}`);
    res.json({
      deliveryProjectId: projectId,
      deliveryProjectName: projectName,
      cohortIssueId: cohortIssueIdResolved,
      cohortName: resolvedCohortName,
      reusedCohort: !!cohortIssueId,
      reusedDeliveryProject,
      totalTasks: tasks.length,
      matchedCount,
      exemptCount,
      blockedCount,
      draftedGroups,
      createdTaskIds,
      rematchedCount: rematch.rematched.length,
      draftsContinuingInBackground: unmatchedTasks.length > 0,
    });

    // Draft lessons after the client is unblocked — Gemini can take minutes.
    if (unmatchedTasks.length > 0) {
      const bg = {
        productName,
        unmatchedTasks,
        unmatchedIndexes,
        createdTaskIds,
        tasks,
        resolvedCohortName,
      };
      setImmediate(() => {
        finishPublishAssistanceDrafts(bg).catch((err) =>
          console.error("[specforge] background assistance drafts failed:", err?.message ?? err)
        );
      });
    }
  } catch (err) {
    console.error("[specforge] /publish:", err);
    if (!res.headersSent) res.status(500).json({ error: err?.message ?? "Publish failed" });
  }
});

/** After Workbench tasks exist: DeepSeek draft groups → Gemini generate → patch DraftModule + ID issues. */
async function finishPublishAssistanceDrafts({
  productName,
  unmatchedTasks,
  unmatchedIndexes,
  createdTaskIds,
  tasks,
  resolvedCohortName,
}) {
  let groups = [];
  const deepseekKey = getDeepSeekKey();
  if (deepseekKey) {
    try {
      console.log(`[specforge] bg drafting ${unmatchedTasks.length} unmatched task(s)…`);
      groups = await runTutorialDrafting(unmatchedTasks, productName, deepseekKey);
      console.log(`[specforge] bg draft groups=${groups.length}`);
    } catch (err) {
      console.error("[specforge] bg tutorial drafting failed:", err.message);
    }
  }
  for (const group of groups) {
    try {
      console.log(`[specforge] bg generating assist module ${group.moduleTag}…`);
      const generated = await generateAssistModule({
        moduleTag: group.moduleTag,
        concept: group.concept,
        build: group.build,
        keyTeaching: group.keyTeaching,
      });
      group.filePath = generated.filePath;
      group.generationFailed = false;
    } catch (err) {
      group.filePath = null;
      group.generationFailed = true;
      group.generationError = err?.message ?? String(err);
      console.error(`[specforge] bg generateAssistModule ${group.moduleTag}:`, group.generationError);
    }
  }

  const groupByAbsoluteIndex = new Map();
  for (const group of groups) {
    for (const relIdx of group.taskIndexes) {
      const absIdx = unmatchedIndexes[relIdx];
      if (absIdx !== undefined) groupByAbsoluteIndex.set(absIdx, group);
    }
  }

  for (const [absIdx, group] of groupByAbsoluteIndex) {
    const taskId = createdTaskIds[absIdx];
    if (!taskId || !group?.moduleTag) continue;
    try {
      const task = tasks[absIdx];
      const assistLine = ["NeedsTutorial: true", `DraftModule: ${group.moduleTag}`];
      await updateIssueDescription(taskId, buildTaskDescription(task, resolvedCohortName, assistLine));
    } catch (err) {
      console.error(`[specforge] bg DraftModule patch failed for task #${taskId}:`, err.message);
    }
  }

  const publishedModuleTags = (
    await listIssues({ count: 200 })
  )
    .filter((i) => i.projectId === MODULE_LIBRARY_PROJECT_ID && i.title.startsWith("Module:"))
    .map((i) => i.title.replace(/^Module:\s*/, "").trim());

  for (const group of groups) {
    const requestedForTasks = group.taskIndexes.map((relIdx) => createdTaskIds[unmatchedIndexes[relIdx]]).filter(Boolean);
    if (requestedForTasks.length === 0) continue;

    const fundaCheck = classifySuggestedFundas(group.suggestedFundas || [], { publishedModuleTags });
    await createIssue({
      projectId: MODULE_LIBRARY_PROJECT_ID,
      title: `Assistance lesson needed: ${group.moduleTag}`,
      description: [
        `Concept: ${group.concept}`,
        `Build: ${group.build}`,
        `KeyTeaching: ${group.keyTeaching}`,
        group.filePath ? `FilePath: ${group.filePath}` : null,
        group.generationFailed ? `GenerationFailed: ${group.generationError || "unknown error"}` : null,
        `RequestedForProduct: ${productName}`,
        `RequestedForTasks: ${requestedForTasks.join(",")}`,
        (group.suggestedFundas || []).length
          ? `SuggestedFundas: ${(group.suggestedFundas || []).join(" | ")}`
          : null,
        fundaCheck.missing.length ? `MissingFundas: ${fundaCheck.missing.join(" | ")}` : null,
        fundaCheck.present.length ? `PresentFundas: ${fundaCheck.present.join(" | ")}` : null,
        fundaCheck.missing.length
          ? `FundaDecision: pending — ID chooses which missing fundas to generate vs mark trivial`
          : null,
      ]
        .filter(Boolean)
        .join("\n"),
    });
  }

  if (groups.length > 0) {
    await notifyTeamServer(
      `📘 SpecForge finished assistance drafts for **${productName}**: ${groups.map((g) => g.moduleTag).join(", ")} — ready in ID Studio.`
    );
  }
  console.log(`[specforge] bg assistance drafts done for "${productName}" (groups=${groups.length})`);
}
export default router;
