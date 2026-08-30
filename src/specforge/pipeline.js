/**
 * SpecForge staged pipeline.
 * Stage 1 = release scope (features in / out).
 * Stage 2 = screens + APIs for in-scope features only.
 * Stage 3 = one FE task per screen, one BE task per API (hard-capped).
 */
import { generateStructured } from "./llmProvider.js";
import {
  ProductConceptInputSchema,
  Stage1OutputSchema,
  Stage2OutputSchema,
  Stage3OutputSchema,
  TutorialDraftOutputSchema,
  ProductProposalOutputSchema,
} from "./schemas.js";

const STAGE1_SYSTEM = `You are the Requirement Normalizer stage of SpecForge for a software apprenticeship platform.

Turn the founder's free-form product concept into structured requirements for an INITIAL RELEASE only.

Critical: also produce
- release_features: 1–8 named product features for THIS release (user-facing capabilities, e.g. "Ingredient Manager", "Sales log"). NOT database entity names alone.
- out_of_scope: things the full product vision might eventually need but are EXPLICITLY deferred (e.g. POS integration, multi-location, employee auth SSO) — invent reasonable deferrals when the description sounds like a big platform.

Do NOT put deferred ideas into release_features. Prefer a small first win over a complete restaurant ERP.

Surface only the 3–5 clarifying questions that would most change the first-release design.`;

const STAGE2_SYSTEM = `You are SpecForge Stage 2 — Product Feature Planner.

Input includes Stage 1 with release_features and out_of_scope. You MUST:
1) Create exactly one surface per release_features entry (same names when possible).
2) Create the API(s) each surface needs (often 1:1).
3) Ignore out_of_scope completely — no surfaces, APIs, or scope_notes that smuggle them back in.
4) NEVER invent features beyond release_features.

A surface is one product feature workspace (screens/forms inside it), e.g.:
  name: "Ingredient Manager"
  pages: ["status list", "add/edit form", "detail"]
  user_jobs: ["monitor stock status", "add ingredient", "edit", "remove"]

Anti-patterns:
- Entity/field catalogs as the primary output
- Splitting one feature into list-surface + form-surface + detail-surface
- Planning POS, waste, recipes, etc. when they're in out_of_scope or not in release_features`;

const STAGE3_SYSTEM = `You are SpecForge Stage 3 — Task Breakdown.

You receive Stage 1 (scope) and Stage 2 (surfaces + apis). Emit assignable apprentice tasks with this HARD RULE:

COUNT RULE (non-negotiable):
- Exactly 1 Coding frontend task per Stage 2 surface
- Exactly 1 Coding backend task per Stage 2 api
- Total coding tasks MUST equal surfaces.length + apis.length
- You may add at most ONE non-code task (Product design / PM) only if Stage 1 truly needs it — usually zero

Each FE task covers the whole surface (all pages + user_jobs + wiring to APIs).
Each BE task covers the whole API (persistence + operations + validation).

TRADE FIELD — set literally, do not substitute:
- Every task from the COUNT RULE above (both FE and BE) gets trade: "Coding" — exactly that string,
  capitalized, never "frontend" or "backend". Frontend vs backend is coding_focus, a SEPARATE field —
  it does not replace or get written into trade.
- Only the one optional non-code task (if you add it) gets a different trade, e.g. "PM" or "Product design".
- trade is what the matching system filters real applicants by (Trade: Coding on the task record) —
  a wrong value here means no applicant of any trade can ever see or be matched to this task.

FORBIDDEN:
- Separate schema / validation / audit / conversion / unit-test / component-test tasks
- Tasks for out_of_scope items
- Tasks for features not listed as surfaces/apis
- Expanding into the full product vision from Stage 1 problem_statement

If Stage 2 lists 3 surfaces and 3 APIs, return exactly 6 Coding tasks (plus at most 1 optional non-code).

Keep titles concrete. tech_level is an internal matching floor — not edited by PD.
For Coding frontend tasks use js (or ts/advanced when clearly harder). For Coding backend tasks use language-agnostic http-api (request/response) or crud (resources + persistence/validation/conflicts). Set coding_focus to frontend or backend when the task is clearly one side. no_tutorial_needed false for Coding.`;

export async function runNormalizer(rawInput, apiKey) {
  const input = ProductConceptInputSchema.parse(rawInput);
  const user = `Product concept:\n${JSON.stringify(input, null, 2)}\n\nProduce the normalized requirement JSON including release_features and out_of_scope.`;
  return generateStructured({ system: STAGE1_SYSTEM, user, schema: Stage1OutputSchema, apiKey });
}

export async function runDomainModel(stage1Output, apiKey) {
  const features = stage1Output.release_features || [];
  const deferred = stage1Output.out_of_scope || [];
  const user = `Normalized product definition:\n${JSON.stringify(stage1Output, null, 2)}\n\nPlan surfaces + APIs for ONLY these release_features (${features.length}): ${JSON.stringify(features)}.\nNever include out_of_scope: ${JSON.stringify(deferred)}.`;
  return generateStructured({ system: STAGE2_SYSTEM, user, schema: Stage2OutputSchema, apiKey, maxTokens: 6000 });
}

export async function runStages1And2(rawInput, apiKey) {
  const stage1 = await runNormalizer(rawInput, apiKey);
  const stage2 = await runDomainModel(stage1, apiKey);
  return { stage1, stage2 };
}

/** Re-run only Stage 2 from an edited Stage 1 (after PD trims release_features / out_of_scope). */
export async function runStage2Only(stage1, apiKey) {
  const parsed = Stage1OutputSchema.parse(stage1);
  return runDomainModel(parsed, apiKey);
}

function assertStage2Ready(stage2) {
  const parsed = Stage2OutputSchema.safeParse(stage2);
  if (!parsed.success) {
    throw new Error(
      "Stage 2 must list surfaces (features/screens) and APIs before breakdown. " +
        "Regenerate the spec or click “Rebuild screens & APIs” after editing release features. " +
        `(${parsed.error.issues?.[0]?.message || "invalid stage2"})`,
    );
  }
  return parsed.data;
}

export async function runTaskBreakdown(stage1, stage2, apiKey) {
  const ready = assertStage2Ready(stage2);
  const surfaceCount = ready.surfaces.length;
  const apiCount = ready.apis.length;
  const expectedCoding = surfaceCount + apiCount;
  const hardMax = expectedCoding + 1; // optional single non-code

  const user = `Stage 1 (scope):\n${JSON.stringify(stage1, null, 2)}\n\nStage 2 (MUST drive every task):\n${JSON.stringify(
    ready,
    null,
    2,
  )}\n\nReturn EXACTLY ${expectedCoding} Coding tasks (${surfaceCount} FE + ${apiCount} BE), optionally +1 non-code. No more.`;

  let tasks = (
    await generateStructured({
      system: STAGE3_SYSTEM,
      user,
      schema: Stage3OutputSchema,
      apiKey,
      maxTokens: 8000,
    })
  ).tasks;

  if (tasks.length > hardMax) {
    // One stern retry — still oversize → hard fail so PD never publishes a 48-task swamp.
    tasks = (
      await generateStructured({
        system: STAGE3_SYSTEM,
        user:
          user +
          `\n\nREJECTED: you previously returned ${tasks.length} tasks. Return at most ${hardMax}. One FE per surface, one BE per API.`,
        schema: Stage3OutputSchema,
        apiKey,
        maxTokens: 8000,
      })
    ).tasks;
  }

  if (tasks.length > hardMax) {
    throw new Error(
      `Task breakdown returned ${tasks.length} tasks but Stage 2 only has ${surfaceCount} feature screen(s) and ${apiCount} API(s) (max ${hardMax}). Trim Stage 1 release_features / rebuild Stage 2, then try again.`,
    );
  }

  return tasks;
}

const TUTORIAL_DRAFT_SYSTEM = `You are SpecForge Tutorial Drafting. Group unmatched engineering tasks into
generic, product-agnostic teaching modules (e.g. resource-list-and-form-ui, resource-crud-api).

SIZE LIMIT — non-negotiable, found live:
- At most 3 task indexes per group. More than 3 tasks sharing a pattern → split into multiple
  smaller groups, never one large one. "Fewest modules" is NOT the goal; a module that's too big to
  reliably generate is worse than two small ones that actually work.
- "build" must describe ONE focused capability the module teaches (e.g. "list + form + submit" OR
  "one CRUD endpoint with a derived-status rule"), never an exhaustive list of every operation a
  resource needs. A build field reading like a full spec ("full CRUD + validation + status +
  duplicate handling + persistence") is a sign the group itself is too broad — split it.
- Concretely: a real API resource needing list/create/update/delete/mark-status is 2-3 modules
  (e.g. one for read+create, one for update+status), not one "full CRUD API" module. A UI surface
  with a list, a form, and a filtered view is 2 modules (list+form, filtered view), not one.
Every extra module here costs one more Gemini generation call, which is cheap; a module so large it
fails validation after 3 retries costs the whole task staying blocked indefinitely.

For each group also list suggestedFundas: short titles of fundamental coding lessons an apprentice should
have before attempting this assistance module (e.g. "HTTP methods and status codes", "Controlled form inputs").
Only real prerequisites — usually 2–5, or [] if the pattern is trivial.`;

const MAX_TUTORIAL_GROUPS = 10;

export async function runTutorialDrafting(unmatchedTasks, productName, apiKey) {
  if (unmatchedTasks.length === 0) return [];
  const taskList = unmatchedTasks
    .map((t, i) => `[${i}] (${t.trade}) ${t.title} — ${t.description}`)
    .join("\n");
  const user = `Product: ${productName}\n\nUnmatched tasks:\n${taskList}\n\nGroup into generic tutorial modules.`;
  const result = await generateStructured({
    system: TUTORIAL_DRAFT_SYSTEM,
    user,
    schema: TutorialDraftOutputSchema,
    apiKey,
  });
  // Not auto-split — a good split needs real understanding of which tasks actually separate
  // cleanly, which this cheap check can't do. Just make a violation visible in logs instead of
  // silently reproducing the exact failure the SIZE LIMIT rule above exists to prevent (found
  // live: a 7-task group and a 10-step single-task group both failed generation after 3 retries).
  for (const g of result.groups) {
    if (g.taskIndexes.length > 3) {
      console.warn(
        `[specforge] Tutorial group "${g.moduleTag}" has ${g.taskIndexes.length} task indexes — over the 3-task guidance in TUTORIAL_DRAFT_SYSTEM. Large modules have failed Gemini generation repeatedly; consider re-running or manually splitting in ID Studio.`,
      );
    }
  }

  if (result.groups.length > MAX_TUTORIAL_GROUPS) {
    return [...result.groups].sort((a, b) => b.taskIndexes.length - a.taskIndexes.length).slice(0, MAX_TUTORIAL_GROUPS);
  }
  return result.groups;
}

const PRODUCT_PROPOSER_SYSTEM = `You are SpecForge's Product Proposer. Propose new candidate SMB products for a
platform that inducts job-seeking apprentices onto real product teams shipping live software for small/medium
businesses. Every product must be a narrow, teachable slice — not a full clone.

SOURCING STRATEGY (this is the whole method — follow it, don't invent a different one):
Every candidate must be a free/open alternative to ONE specific capability that a real, well-known paid or
freemium SaaS product locks behind a pricing wall (per-seat fees, usage caps, feature gates on top of a paid
plan). The paid product's own existing customer base IS the demand evidence — you do not need a survey citation,
you need to correctly identify a real, well-known product and its real pricing wall.

HARD RULES:
- inspiredBy must name REAL, well-known products (e.g. "DocuSign", "HubSpot", "Typeform") — never invented ones.
- Never propose copying a product's name, brand, logo, or literal UI. The candidate is an independent product
  in its own category, not a reskin — describe it the way "Cal.com" describes itself relative to Calendly:
  same job-to-be-done, entirely its own product.
- costBarrier must name a REAL, plausible pricing mechanism (per-seat, per-transaction, usage cap, feature
  gated to a higher tier) — not a vague "it's expensive."
- narrowSlice must be scoped to the same grain as this platform's existing seed products: a list + a form +
  one API with a derived-status or conflict rule, and (if a UI screen) a filtered view. Never propose building
  the whole paid product — one commonly-paywalled workflow slice of it.
- Never propose something already in ALREADY DECIDED below, or a close variant of it (same underlying capability
  under a different name counts as a duplicate).
- Vary the category across your batch — do not propose three variations on the same kind of tool.

For each proposal, name/tagline/description/inspiredBy/painPoint/costBarrier/narrowSlice are all required —
every field populated, no placeholders.`;

/**
 * PD Studio's "Propose New Products" button. `alreadyDecided` is every existing proposal's
 * {name, status} this session/instance already knows about (added or deferred) — passed in so the
 * model doesn't waste a batch re-proposing something PD already ruled on. Caller (product-forge-
 * router.js) is responsible for persisting the result; this function is pure generation, same
 * division of labor as every other stage in this file.
 */
export async function runProductProposals(alreadyDecided, apiKey, count = 6) {
  const decidedList =
    alreadyDecided && alreadyDecided.length
      ? alreadyDecided.map((p) => `- ${p.name} (${p.status}): ${p.tagline || ""}`).join("\n")
      : "(none yet)";
  const user = `ALREADY DECIDED (do not repropose these or close variants):\n${decidedList}\n\nPropose ${count} new candidate products.`;
  const result = await generateStructured({
    system: PRODUCT_PROPOSER_SYSTEM,
    user,
    schema: ProductProposalOutputSchema,
    apiKey,
    maxTokens: 6000,
  });
  return result.proposals;
}
