/**
 * SpecForge — Zod schemas for the staged pipeline's JSON contracts.
 * Stage 1 captures release scope (in / out). Stage 2 turns in-scope features into
 * screens + APIs. Stage 3 emits one FE task per screen and one BE task per API.
 */
import { z } from "zod";

export const ProductConceptInputSchema = z.object({
  product_name: z.string().min(1),
  description: z.string().min(1),
  target_users: z.array(z.string()).default([]),
  business_goal: z.string().min(1),
  constraints: z.array(z.string()).default([]),
});

export const Stage1OutputSchema = z.object({
  product_name: z.string(),
  problem_statement: z.string(),
  target_users: z.array(z.string()),
  business_outcomes: z.array(z.string()),
  /** Named product features for THIS first release — Stage 2 must only plan these. */
  release_features: z
    .array(z.string())
    .min(1)
    .max(8)
    .describe(
      'Short feature names for the initial release only, e.g. "Ingredient Manager", "Dish sales log". Max 8.',
    ),
  /** Explicitly deferred — never planned or tasked in this SpecForge run. */
  out_of_scope: z
    .array(z.string())
    .default([])
    .describe('Deferred for later releases, e.g. "POS integration", "multi-location".'),
  known_integrations: z.array(z.string()).default([]),
  constraints: z.array(z.string()).default([]),
  assumptions: z.array(z.string()).default([]),
  questions: z
    .array(z.string())
    .max(5)
    .describe("The 3-5 most important missing questions, not an exhaustive list"),
});

/** One in-scope product feature delivered as a user-facing screen/flow. */
export const SurfaceSchema = z.object({
  name: z.string().describe('Must match (or closely mirror) a Stage 1 release_features entry'),
  kind: z.enum(["screen", "flow", "dashboard"]).default("screen"),
  pages: z
    .array(z.string())
    .min(1)
    .describe('UI pieces inside this one feature, e.g. ["status list", "add/edit form", "detail"]'),
  user_jobs: z
    .array(z.string())
    .min(1)
    .describe("What the user achieves here"),
  description: z.string(),
  data_notes: z
    .string()
    .default("")
    .describe("Brief data shown/edited — prose, not a DB schema dump"),
});

export const ApiCapabilitySchema = z.object({
  name: z.string().describe('e.g. "Ingredients API"'),
  description: z.string(),
  operations: z.array(z.string()).min(1),
  backs_surfaces: z
    .array(z.string())
    .min(1)
    .describe("Exact Stage 2 surface names this API powers"),
});

export const Stage2OutputSchema = z.object({
  surfaces: z
    .array(SurfaceSchema)
    .min(1)
    .describe("One surface per Stage 1 release_features entry (not per database entity)"),
  apis: z
    .array(ApiCapabilitySchema)
    .min(1)
    .describe("Usually ~one API per surface that needs server state"),
  scope_notes: z
    .array(z.string())
    .default([])
    .describe("Constraints to fold into tasks — never new features"),
});

export const Stage3TaskSchema = z.object({
  epic: z.string().min(1),
  story: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  trade: z.string().min(1),
  acceptance_criteria: z.array(z.string()).default([]),
  no_tutorial_needed: z.boolean().default(false),
  tech_level: z
    .enum(["html-css", "js", "ts", "advanced", "http-api", "crud"])
    .nullable()
    .default(null),
  coding_focus: z.enum(["frontend", "backend", "both"]).nullable().default(null),
});

export const Stage3OutputSchema = z.object({
  tasks: z.array(Stage3TaskSchema).min(1),
});

export const TutorialDraftGroupSchema = z.object({
  moduleTag: z.string(),
  concept: z.string(),
  build: z.string(),
  keyTeaching: z.string(),
  taskIndexes: z.array(z.number().int()).min(1),
  suggestedFundas: z
    .array(z.string())
    .default([])
    .describe(
      "Prerequisite fundamental lesson titles (generic, e.g. 'Model local UI state', 'HTTP request/response') the apprentice should know before this assistance module. Empty if none.",
    ),
});

export const TutorialDraftOutputSchema = z.object({
  groups: z.array(TutorialDraftGroupSchema),
});
