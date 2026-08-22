/**
 * Lesson schema for AI-generated and normalized lesson config.
 * Declarative only — no executable evaluation logic.
 * See src/ai-prompt.txt for spec.
 */

import { z } from "zod";

/** Normalize evaluation.required: AI sometimes returns objects (e.g. { keyword: "x" }); we need strings. */
function normalizeRequiredArray(val) {
  if (!Array.isArray(val)) return val;
  return val.map((v) => {
    if (typeof v === "string") return v;
    if (v != null && typeof v === "object") return v.keyword ?? v.pattern ?? v.value ?? String(v);
    return String(v);
  });
}

/** Normalize array fields: AI sometimes returns a string instead of string[]. */
function normalizeStringArray(val) {
  if (Array.isArray(val)) return val.map((v) => (typeof v === "string" ? v : String(v)));
  if (typeof val === "string") return val.trim() ? [val.trim()] : [];
  return val;
}

const EVALUATION_MODES = ["keyword_match", "pattern_match", "structural_checks", "rubric_for_backend_llm"];
function normalizeEvaluationMode(val) {
  if (val == null) return "keyword_match";
  const s = String(val).toLowerCase().replace(/\s+/g, "_");
  return EVALUATION_MODES.includes(s) ? s : "keyword_match";
}

/** Declarative evaluation metadata (no executable JS). No .strict() so AI-added keys are stripped. */
export const evaluationMetadataSchema = z.object({
  mode: z.preprocess(normalizeEvaluationMode, z.enum(EVALUATION_MODES)),
  required: z.preprocess(normalizeRequiredArray, z.array(z.string()).optional()),
  partialThreshold: z.number().min(0).max(1).optional(),
  correctThreshold: z.number().min(0).max(1).optional(),
  patterns: z.preprocess(
    (val) => (Array.isArray(val) ? val.map((v) => (typeof v === "string" ? v : String(v))) : val),
    z.array(z.string()).optional()
  ),
  allowEquivalentWhitespace: z.boolean().optional(),
  rubric: z.array(z.string()).optional(),
});

/** Single step in the lesson (code/implementation step). */
export const lessonStepSchema = z.object({
  id: z.string(),
  type: z.literal("question"),
  phase: z.string(),
  title: z.string().optional(),
  instruction: z.string(),
  hint: z.string().optional(),
  analogousExample: z.string().optional(),
  // Supports single-file seed (string) and multi-file seed maps ({ "App.tsx": "...", ... }).
  seedCode: z.union([z.string(), z.record(z.string(), z.string())]),
  expectedOutcome: z.string().optional(),
  successCriteria: z.preprocess(normalizeStringArray, z.array(z.string()).optional()),
  feedbackCorrect: z.string().optional(),
  feedbackPartial: z.string().optional(),
  feedbackWrong: z.string().optional(),
  evaluation: evaluationMetadataSchema.optional(),
  answer_keywords: z.array(z.string()).optional(),
  /** Concept ids with glossary deep-dive copy; merged with track glossary `introductions` for this step. */
  introducesConcepts: z.array(z.string()).optional(),
});

// --- Algorithm lesson: flowchart + structured steps (lesson → example → flowchart → reasoning → dryRun → code) ---

/** Flowchart node: start, process, decision, end. */
export const flowchartNodeSchema = z.object({
  id: z.string(),
  type: z.enum(["start", "process", "decision", "end"]),
  text: z.string(),
});

/** Flowchart edge. */
export const flowchartEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
});

/** Flowchart structure returned by AI for algorithm lessons. */
export const flowchartSchema = z.object({
  nodes: z.array(flowchartNodeSchema),
  edges: z.array(flowchartEdgeSchema),
});

/** Content for algo reveal-style steps (lesson, example, reasoning, dryRun). */
const algoContentSchema = z.object({
  body: z.string(),
  title: z.string().optional(),
});

/** Extended content for family-aware algo steps (concept-bridge, reveal-idea, etc.). */
const algoBeginnerContentSchema = algoContentSchema.extend({
  visualMetaphor: z.string().optional(),
  mentalModel: z.string().optional(),
  conceptBridge: z.string().optional(),
  // Interactive discovery: ask with small array → learner answers → appreciate
  prompt: z.string().optional(),
  exampleArray: z.array(z.number()).optional(),
  target: z.number().optional(),
  successMessage: z.string().optional(),
  // Show-me reveal: "Can't figure it out? [Show me]" → reveal illustrated example
  showMeFirst: z.boolean().optional(),
  illustratedExample: z.string().optional(),
  // Family-aware: optional common confusions to address (concept-bridge / reveal-idea)
  commonConfusions: z.array(z.string()).optional(),
});

/** Algorithm step: lesson statement. */
export const algoProblemStepSchema = z.object({
  type: z.literal("problem"),
  id: z.string(),
  phase: z.string(),
  title: z.string().optional(),
  content: algoContentSchema,
});

/** Algorithm step: example walkthrough. */
export const algoExampleStepSchema = z.object({
  type: z.literal("example"),
  id: z.string(),
  phase: z.string(),
  title: z.string().optional(),
  content: algoContentSchema,
});

/** Algorithm step: flowchart reasoning (diagram + explanation; progressive reveal in UI). */
export const algoFlowchartStepSchema = z.object({
  type: z.literal("flowchart"),
  id: z.string(),
  phase: z.string(),
  title: z.string().optional(),
  content: algoContentSchema,
  flowchart: flowchartSchema,
});

/** Algorithm step: step-by-step reasoning. */
export const algoReasoningStepSchema = z.object({
  type: z.literal("reasoning"),
  id: z.string(),
  phase: z.string(),
  title: z.string().optional(),
  content: algoContentSchema,
});

/** Algorithm step: dry run simulation. */
export const algoDryRunStepSchema = z.object({
  type: z.literal("dryRun"),
  id: z.string(),
  phase: z.string(),
  title: z.string().optional(),
  content: algoContentSchema,
});

/** Family-aware beginner algo steps: discovery, reflection, scale-problem, concept-bridge, reveal-idea, flow-explainer, complete. */
export const algoBeginnerRevealStepSchema = z.object({
  type: z.enum(["discovery", "reflection", "scale-problem", "concept-bridge", "reveal-idea", "flow-explainer", "complete"]),
  id: z.string(),
  phase: z.string(),
  title: z.string().optional(),
  content: algoBeginnerContentSchema,
});

/** Any algorithm non-code step. */
export const algoRevealStepSchema = z.union([
  algoProblemStepSchema,
  algoExampleStepSchema,
  algoFlowchartStepSchema,
  algoReasoningStepSchema,
  algoDryRunStepSchema,
  algoBeginnerRevealStepSchema,
]);

/** Single step: either code (question) or algo reveal (lesson, example, flowchart, reasoning, dryRun, or beginner discovery/concept-bridge/reveal-idea/etc.). */
export const lessonStepUnionSchema = z.union([lessonStepSchema, algoRevealStepSchema]);

/** Intro content. */
export const lessonIntroSchema = z.object({
  tag: z.string().optional(),
  title: z.string(),
  body: z.string(),
  usecase: z.string().optional(),
});

/** Side nav item. */
export const sideItemSchema = z.object({
  label: z.string(),
  id: z.string(),
});

/** Optional algorithm-family metadata (for family-aware pedagogy; used by algo lessons only). */
export const familyTeachingProfileSchema = z.object({
  mentalModel: z.string().optional(),
  conceptBridge: z.string().optional(),
  visualMetaphor: z.string().optional(),
  commonConfusions: z.array(z.string()).optional(),
}).optional();

/** Full lesson config (API / normalized). UI lessons have steps all type "question"; algorithm lessons have lesson, example, flowchart, reasoning, dryRun, or discovery/concept-bridge/reveal-idea, then question steps. */
export const lessonConfigSchema = z.object({
  lessonId: z.string().optional(),
  track: z.string(),
  lessonNum: z.union([z.number(), z.string()]).optional(),
  title: z.string(),
  shortName: z.string().optional(),
  intro: lessonIntroSchema,
  objectives: z.array(z.string()),
  steps: z.array(lessonStepUnionSchema),
  sideItems: z.array(sideItemSchema).optional(),
  /** When `"multi-file"`, step seedCode may be a map of filenames → source (e.g. App.tsx + App.module.css). */
  answerShape: z.string().optional(),
  algorithmFamily: z.string().optional(),
  familyTeachingProfile: familyTeachingProfileSchema,
});

export function validateLessonConfig(data) {
  return lessonConfigSchema.safeParse(data);
}

export function parseLessonConfig(data) {
  return lessonConfigSchema.parse(data);
}

// --- Intermediate stage schemas (for pipeline validation) ---

/** Stage: learning objectives (leadIn + objectives). Bloom's Level 3 format. */
export const learningObjectivesOutputSchema = z.object({
  leadIn: z.string(),
  objectives: z.array(z.string()),
});

/** Stage 3 output: objectives only (array). */
export const objectivesOutputSchema = z.object({
  objectives: z.array(z.string()),
});

/** Stage: lesson description only. */
export const lessonDescriptionOutputSchema = z.object({
  lessonDescription: z.string(),
});

/** Stage: real-world application only. */
export const realWorldApplicationOutputSchema = z.object({
  realWorldApplication: z.string(),
});

/** Single step in blueprint (stage 5). */
export const stepBlueprintItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  phase: z.string(),
  learningFocus: z.string().optional(),
  expectedAction: z.string().optional(),
});

/** Stage 5 output: step list only. */
export const stepBlueprintOutputSchema = z.object({
  steps: z.array(stepBlueprintItemSchema),
});

/** Intro output (stage 4) matches lessonIntroSchema. */
export const introOutputSchema = lessonIntroSchema;

/** Stage 6 step detail output (AI may omit type). */
export const stepDetailOutputSchema = lessonStepSchema.extend({
  type: z.literal("question").optional(),
});

/** Algorithm lesson: full structure from AI (lesson, example, flowchart, reasoning, dryRun, code step blueprints). */
export const algoStructureOutputSchema = z.object({
  problem: z.object({ body: z.string(), title: z.string().optional() }),
  example: z.object({ body: z.string(), title: z.string().optional() }),
  flowchart: flowchartSchema,
  flowchartExplanation: z.string().optional(),
  reasoning: z.object({ body: z.string(), title: z.string().optional() }),
  dryRun: z.object({ body: z.string(), title: z.string().optional() }),
  codeSteps: z.array(stepBlueprintItemSchema),
});
