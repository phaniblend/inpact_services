/**
 * Real AI lesson generation — pipeline via DeepSeek.
 * Order: 1. Learning Objectives 2. Lesson Description 3. Real World Application 4. Step Blueprint 5. Step Details.
 * All prompts are generic; only {{TRACK}}, {{LESSON_TITLE}}, etc. are injected from runtime (user's track + lesson click).
 */

import { completeWithAI } from "../providers/aiProvider.js";
import {
  injectVariables,
  SYSTEM_INSTRUCTION,
  LEARNING_OBJECTIVES_PROMPT,
  LESSON_DESCRIPTION_PROMPT,
  REAL_WORLD_APPLICATION_PROMPT,
  STEP_BLUEPRINT_PROMPT,
  STEP_DETAIL_PROMPT,
  ALGO_STRUCTURE_PROMPT,
  ALGO_MASTER_BEGINNER_PROMPT,
} from "../prompt-templates/index.js";
import { getAlgorithmFamilyPromptVars, getAlgorithmFamilyFromTitle, getAlgorithmFamilyTeachingProfile } from "../algorithmFamilyProfiles.js";
import {
  learningObjectivesOutputSchema,
  lessonDescriptionOutputSchema,
  realWorldApplicationOutputSchema,
  stepBlueprintOutputSchema,
  stepDetailOutputSchema,
  lessonStepSchema,
  lessonConfigSchema,
} from "../schema.js";
import { parseAndValidate, logStage } from "../utils/parseJson.js";
import { parseSocraticMarkdownToSteps } from "../utils/parseSocraticMarkdown.js";
import { getTrackDisplayName } from "../trackDisplayNames.js";
import { getTrackContext } from "../trackContext.js";

const DEFAULT_LEARNER_LEVEL = "beginner";

/** Delay between API calls to stay under provider rate limits. */
const RATE_LIMIT_DELAY_MS = 8000;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Build variables for prompt injection. All values are dynamic from runtime (track, lessonTitle, optional overrides).
 * @param {{ track: string, lessonTitle: string, lessonIndex?: number, learnerLevel?: string, lessonGoal?: string, realWorldUseCase?: string }} params
 */
function defaultVars(params) {
  const { track, lessonTitle, learnerLevel, lessonGoal, realWorldUseCase } = params;
  const trackDisplay = getTrackDisplayName(track);
  const ctx = getTrackContext(track);
  return {
    TRACK: trackDisplay,
    LESSON_TITLE: lessonTitle,
    LEARNER_LEVEL: learnerLevel ?? DEFAULT_LEARNER_LEVEL,
    LESSON_GOAL: lessonGoal ?? `Teach the learner the concepts and implementation for: ${lessonTitle}`,
    REAL_WORLD_USECASE: realWorldUseCase ?? "Relevant real-world use case for this lesson (e.g. forms, dashboards, interactive UI).",
    FRAMEWORK: ctx.framework,
    LANGUAGE: ctx.language,
    FILE_MODE: ctx.fileMode,
    SYNTAX_RULES: ctx.syntaxRules,
    VALIDATION_RULES: ctx.validationRules,
  };
}

/**
 * Call AI with system + user prompt; parse and validate response with schema.
 * @param {string} stageName
 * @param {string} userPrompt
 * @param {import("zod").ZodType} schema
 * @param {string} [apiKey]
 * @param {{ maxTokens?: number, provider?: 'deepseek' }} [opts]
 */
async function callStage(stageName, userPrompt, schema, apiKey, opts = {}) {
  const raw = await completeWithAI({
    system: SYSTEM_INSTRUCTION,
    user: userPrompt,
    maxTokens: opts.maxTokens ?? 2048,
    apiKey,
    provider: opts.provider ?? "deepseek",
  });
  const result = parseAndValidate(raw, schema);
  logStage(stageName, result.success ? { success: true, keys: Object.keys(result.data || {}) } : { success: false, error: result.error });
  if (!result.success) throw new Error(`${stageName}: ${result.error}`);
  return result.data;
}

/**
 * Generate only the intro (lesson description + real-world application). Uses shared prompts 2 + 3.
 * Cached on server so first learner triggers the call; subsequent learners get it instantly.
 * @param {{ track: string, lessonTitle: string, lessonIndex: number, learnerLevel?: string, lessonGoal?: string, realWorldUseCase?: string }} params
 * @param {{ apiKey?: string }} options
 * @returns {Promise<{ intro: { tag?: string, title: string, body: string, usecase: string }, track: string, lessonTitle: string, lessonIndex: number }>}
 */
export async function generateLessonIntro(params, options = {}) {
  const { track, lessonTitle, lessonIndex } = params;
  const apiKey = options.apiKey;
  const provider = options.provider ?? "deepseek";
  const opts = { maxTokens: 1024, provider };
  const vars = defaultVars(params);

  const descRaw = injectVariables(LESSON_DESCRIPTION_PROMPT, { ...vars });
  const descData = await callStage("lessonDescription", descRaw, lessonDescriptionOutputSchema, apiKey, opts);
  await sleep(RATE_LIMIT_DELAY_MS);

  const rwaRaw = injectVariables(REAL_WORLD_APPLICATION_PROMPT, { ...vars });
  const rwaData = await callStage("realWorldApplication", rwaRaw, realWorldApplicationOutputSchema, apiKey, opts);

  const intro = {
    tag: `LESSON #${lessonIndex + 1}`,
    title: lessonTitle,
    body: descData.lessonDescription,
    usecase: rwaData.realWorldApplication,
  };
  return { intro, track, lessonTitle, lessonIndex };
}

/**
 * Generate only learning objectives (Bloom's Level 3, leadIn + objectives). Uses shared prompt 1.
 * Cached on server.
 * @param {{ track: string, lessonTitle: string, lessonIndex: number, learnerLevel?: string, lessonGoal?: string }} params
 * @param {{ apiKey?: string }} options
 * @returns {Promise<{ leadIn: string, objectives: string[], track: string, lessonTitle: string, lessonIndex: number }>}
 */
export async function generateLessonObjectives(params, options = {}) {
  const { track, lessonTitle, lessonIndex } = params;
  const apiKey = options.apiKey;
  const provider = options.provider ?? "deepseek";
  const vars = defaultVars(params);
  const objectivesRaw = injectVariables(LEARNING_OBJECTIVES_PROMPT, { ...vars });
  const data = await callStage("learningObjectives", objectivesRaw, learningObjectivesOutputSchema, apiKey, { maxTokens: 1024, provider });
  return {
    leadIn: data.leadIn,
    objectives: data.objectives,
    track,
    lessonTitle,
    lessonIndex,
  };
}

const ALGO_TRACKS = ["algo-js", "algo-ts", "algo-python", "algo-java"];

function isAlgoTrack(track) {
  return ALGO_TRACKS.includes(String(track));
}

const MASTER_ALGO_REVEAL_TYPES = ["discovery", "reflection", "scale-problem", "concept-bridge", "reveal-idea", "flow-explainer", "complete"];
const ALL_ALGO_REVEAL_TYPES = ["lesson", "example", "reasoning", "dryRun", ...MASTER_ALGO_REVEAL_TYPES];

/**
 * Normalize steps from master algo JSON so they pass lessonConfigSchema (content.body required; type must be allowed).
 * @param {object[]} steps
 * @returns {object[]}
 */
function normalizeMasterAlgoSteps(steps) {
  return steps.map((s, i) => {
    const type = typeof s.type === "string" ? s.type.toLowerCase().replace(/\s+/g, "-") : "reasoning";
    const id = s.id || `step-${i}`;
    const phase = s.phase || `Step ${i + 1}`;
    const title = s.title || phase;

    if (type === "question") {
      return {
        type: "question",
        id,
        phase,
        title,
        instruction: s.instruction ?? s.paal ?? "",
        hint: s.hint ?? "",
        analogousExample: s.analogousExample ?? s.example_code ?? "",
        seedCode: s.seedCode ?? "",
        expectedOutcome: s.expectedOutcome ?? s.expected ?? "",
        successCriteria: Array.isArray(s.successCriteria) ? s.successCriteria : [],
        feedbackCorrect: s.feedbackCorrect ?? s.feedback_correct ?? "",
        feedbackPartial: s.feedbackPartial ?? s.feedback_partial ?? "",
        feedbackWrong: s.feedbackWrong ?? s.feedback_wrong ?? "",
        evaluation: s.evaluation ?? { mode: "keyword_match", required: [], partialThreshold: 0.5, correctThreshold: 0.8 },
      };
    }

    const content = s.content ?? {};
    const body = typeof content.body === "string" ? content.body : (s.body ?? "");
    const normalizedContent = {
      body: body || "(No content)",
      title: content.title ?? title,
    };
    if (content.visualMetaphor != null) normalizedContent.visualMetaphor = String(content.visualMetaphor);
    if (content.mentalModel != null) normalizedContent.mentalModel = String(content.mentalModel);
    if (content.conceptBridge != null) normalizedContent.conceptBridge = String(content.conceptBridge);
    if (content.prompt != null) normalizedContent.prompt = String(content.prompt);
    if (Array.isArray(content.exampleArray)) normalizedContent.exampleArray = content.exampleArray;
    if (typeof content.target === "number") normalizedContent.target = content.target;
    if (content.successMessage != null) normalizedContent.successMessage = String(content.successMessage);
    if (content.showMeFirst === true) normalizedContent.showMeFirst = true;
    if (content.illustratedExample != null) normalizedContent.illustratedExample = String(content.illustratedExample);
    if (Array.isArray(content.commonConfusions)) normalizedContent.commonConfusions = content.commonConfusions;

    if (ALL_ALGO_REVEAL_TYPES.includes(type)) {
      return { type, id, phase, title, content: normalizedContent };
    }
    return { type: "reasoning", id, phase, title, content: normalizedContent };
  });
}

/**
 * Try to parse master algo JSON response (family-aware prompt). Returns steps array or null.
 * @param {string} raw
 * @returns {object[]|null}
 */
function parseMasterAlgoStepsJson(raw) {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  let obj = null;
  if (trimmed.startsWith("{")) {
    try {
      obj = JSON.parse(trimmed);
    } catch (_) {}
  }
  if (!obj && trimmed.includes("```")) {
    const m = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (m) {
      try {
        obj = JSON.parse(m[1].trim());
      } catch (_) {}
    }
  }
  if (!obj && trimmed.includes("{")) {
    try {
      obj = JSON.parse(trimmed.slice(trimmed.indexOf("{")));
    } catch (_) {}
  }
  const steps = obj?.steps;
  if (!Array.isArray(steps) || steps.length === 0) return null;
  return normalizeMasterAlgoSteps(steps);
}

/**
 * Generate steps for algorithm lessons. Uses family-aware master prompt first; falls back to Socratic markdown.
 * @param {{ track: string, lessonTitle: string, lessonIndex: number }} params
 * @param {{ apiKey?: string, provider?: string }} options
 * @returns {Promise<{ steps: object[], track: string, lessonTitle: string, lessonIndex: number, lessonNum: number, pad: string }>}
 */
async function generateAlgoLessonStepsOnly(params, options = {}) {
  const { track, lessonTitle, lessonIndex } = params;
  const apiKey = options.apiKey;
  const provider = options.provider ?? "deepseek";
  const lessonNum = lessonIndex + 1;
  const pad = String(lessonNum).padStart(2, "0");
  const vars = { ...defaultVars(params), ...getAlgorithmFamilyPromptVars(params), ALGO_NAME: params.lessonTitle, LESSON_NUMBER: String(lessonNum), LESSON_ID: `algo-${track}-${pad}` };

  const masterRaw = injectVariables(ALGO_MASTER_BEGINNER_PROMPT, vars);
  const raw = await completeWithAI({
    system: SYSTEM_INSTRUCTION,
    user: masterRaw,
    maxTokens: 4096,
    apiKey,
    provider,
  });
  logStage("algoStructure", { success: true, keys: ["family-aware"] });

  const stepsFromJson = parseMasterAlgoStepsJson(raw);
  if (stepsFromJson && stepsFromJson.length > 0) {
    return { steps: stepsFromJson, track, lessonTitle, lessonIndex, lessonNum, pad };
  }

  const steps = parseSocraticMarkdownToSteps(raw, {
    lessonTitle,
    language: vars.LANGUAGE,
  });
  return { steps, track, lessonTitle, lessonIndex, lessonNum, pad };
}

/**
 * Generate only the steps (blueprint + per-step details). No intro/objectives. Cached on server.
 * Server assembles full config from cached intro + cached objectives + this.
 * For algo tracks: uses lesson → example → flowchart → reasoning → dryRun → code steps.
 * @param {{ track: string, lessonTitle: string, lessonIndex: number }} params
 * @param {{ apiKey?: string }} options
 * @returns {Promise<{ steps: object[], track: string, lessonTitle: string, lessonIndex: number }>}
 */
export async function generateLessonStepsOnly(params, options = {}) {
  if (isAlgoTrack(params.track)) {
    return generateAlgoLessonStepsOnly(params, options);
  }

  const { track, lessonTitle, lessonIndex } = params;
  const apiKey = options.apiKey;
  const provider = options.provider ?? "deepseek";
  const lessonNum = lessonIndex + 1;
  const pad = String(lessonNum).padStart(2, "0");
  const vars = defaultVars(params);

  const blueprintRaw = injectVariables(STEP_BLUEPRINT_PROMPT, { ...vars });
  const blueprintData = await callStage("stepBlueprint", blueprintRaw, stepBlueprintOutputSchema, apiKey, { maxTokens: 1024, provider });
  const blueprintSteps = blueprintData.steps;
  await sleep(RATE_LIMIT_DELAY_MS);

  let codeSoFar = "";
  const steps = [];
  for (let i = 0; i < blueprintSteps.length; i++) {
    if (i > 0) await sleep(RATE_LIMIT_DELAY_MS);
    const blueprintItem = blueprintSteps[i];
    const completedSteps = steps.map((s) => ({ id: s.id, title: s.title, phase: s.phase }));
    const stepPrompt = injectVariables(STEP_DETAIL_PROMPT, {
      ...vars,
      COMPLETED_STEPS_JSON: completedSteps,
      CODE_SO_FAR: codeSoFar || "// No code yet — this is the first step.",
      CURRENT_STEP_BLUEPRINT_JSON: blueprintItem,
    });
    const stepData = await callStage(`stepDetail-${blueprintItem.id}`, stepPrompt, stepDetailOutputSchema, apiKey, { maxTokens: 2048, provider });
    const stepWithType = { ...stepData, type: "question" };
    const stepValidated = lessonStepSchema.safeParse(stepWithType);
    if (!stepValidated.success) throw new Error(`Step ${blueprintItem.id} validation: ${stepValidated.error.message}`);
    steps.push(stepValidated.data);
    codeSoFar = stepValidated.data.seedCode ?? codeSoFar;
  }
  return { steps, track, lessonTitle, lessonIndex, lessonNum, pad };
}

/**
 * Normalize steps at assembly time so cached/backup steps pass lessonStepUnionSchema.
 * Ensures "question" steps have instruction/seedCode strings; unknown types become "complete".
 * @param {object[]} steps
 * @param {string} [track]
 * @returns {object[]}
 */
function normalizeStepsForAssembly(steps, track) {
  if (!Array.isArray(steps) || steps.length === 0) return steps;
  const algoTypes = new Set(["lesson", "example", "flowchart", "reasoning", "dryRun", "discovery", "reflection", "scale-problem", "concept-bridge", "reveal-idea", "flow-explainer", "complete"]);

  return steps.map((s, i) => {
    const rawType = s.type != null ? String(s.type).toLowerCase().replace(/\s+/g, "-") : "";
    const id = s.id || `step-${i + 1}`;
    const phase = s.phase || `Step ${i + 1}`;
    const title = s.title ?? phase;

    if (rawType === "question") {
      return {
        ...s,
        id,
        phase,
        title,
        type: "question",
        instruction: s.instruction != null ? String(s.instruction) : "",
        seedCode: s.seedCode != null ? String(s.seedCode) : "",
      };
    }

    if (algoTypes.has(rawType)) {
      const content = s.content ?? {};
      const body = typeof content.body === "string" ? content.body : (s.body ?? "");
      const normalized = { ...s, id, phase, title, type: rawType, content: { ...content, body: body || "(No content)" } };
      if (rawType === "flowchart") {
        normalized.flowchart = s.flowchart && typeof s.flowchart === "object" ? s.flowchart : { nodes: [], edges: [] };
      }
      return normalized;
    }

    // Unknown type (e.g. "Setup", "Complete", or empty) — treat as "complete" so validation passes
    const body = s.content?.body ?? s.body ?? s.instruction ?? s.title ?? "Step.";
    return { id, phase, title, type: "complete", content: { body: String(body) } };
  });
}

/**
 * Assemble full lesson config from intro + objectives + steps (e.g. from server caches).
 */
export function assembleLessonConfig(intro, objectives, stepsPayload, params) {
  const { track, lessonTitle, lessonIndex } = params;
  const lessonNum = lessonIndex + 1;
  const pad = String(lessonNum).padStart(2, "0");
  const rawSteps = stepsPayload.steps || stepsPayload;
  const steps = normalizeStepsForAssembly(rawSteps, track);
  const sideItems = [
    { id: "intro", label: "Intro" },
    { id: "objectives", label: "Objectives" },
    ...steps.map((s) => ({ id: s.id, label: s.title || s.id })),
  ];
  const assembled = {
    lessonId: `ai-${track}-${pad}`,
    track,
    lessonNum,
    title: lessonTitle,
    shortName: `P${pad}`,
    intro,
    objectives,
    steps,
    sideItems,
  };
  if (isAlgoTrack(track)) {
    const algorithmFamily = getAlgorithmFamilyFromTitle(lessonTitle);
    assembled.algorithmFamily = algorithmFamily;
    assembled.familyTeachingProfile = getAlgorithmFamilyTeachingProfile(algorithmFamily);
  }
  const validated = lessonConfigSchema.safeParse(assembled);
  if (!validated.success) throw new Error("Assemble validation failed: " + validated.error.message);
  return validated.data;
}

/**
 * Generate only intro + objectives (legacy preview; prefer sequential intro then objectives).
 * @param {{ track: string, lessonTitle: string, lessonIndex: number }} params
 * @param {{ apiKey?: string }} options
 * @returns {Promise<{ intro: object, leadIn: string, objectives: string[], track: string, lessonTitle: string, lessonIndex: number }>}
 */
export async function generateLessonPreview(params, options = {}) {
  const introResult = await generateLessonIntro(params, options);
  await sleep(RATE_LIMIT_DELAY_MS);
  const objectivesResult = await generateLessonObjectives(params, options);
  return {
    intro: introResult.intro,
    leadIn: objectivesResult.leadIn ?? "After completing this lesson, you will be able to:",
    objectives: objectivesResult.objectives,
    track: params.track,
    lessonTitle: params.lessonTitle,
    lessonIndex: params.lessonIndex,
  };
}

/**
 * Generate full lesson via real AI pipeline. For algo tracks: intro + objectives + Socratic steps. Otherwise: objectives, description, rwa, blueprint, step details.
 * @param {{ track: string, lessonTitle: string, lessonIndex: number, learnerLevel?: string, lessonGoal?: string, realWorldUseCase?: string }} params
 * @param {{ apiKey?: string }} options - Optional; apiKey from server (process.env.DEEPSEEK_API_KEY).
 * @returns {Promise<import("../schema.js").z.infer<typeof lessonConfigSchema>>}
 */
export async function generateLessonReal(params, options = {}) {
  if (isAlgoTrack(params.track)) {
    const introResult = await generateLessonIntro(params, options);
    await sleep(RATE_LIMIT_DELAY_MS);
    const objectivesResult = await generateLessonObjectives(params, options);
    const stepsPayload = await generateLessonStepsOnly(params, options);
    return assembleLessonConfig(
      introResult.intro,
      objectivesResult.objectives,
      stepsPayload,
      params
    );
  }

  const { track, lessonTitle, lessonIndex } = params;
  const apiKey = options.apiKey;
  const provider = options.provider ?? "deepseek";
  const stageOpts = (maxTokens) => ({ maxTokens, provider });
  const lessonNum = lessonIndex + 1;
  const pad = String(lessonNum).padStart(2, "0");
  const vars = defaultVars(params);

  // 1. Learning Objectives (leadIn + objectives)
  const objectivesRaw = injectVariables(LEARNING_OBJECTIVES_PROMPT, { ...vars });
  const objectivesData = await callStage("learningObjectives", objectivesRaw, learningObjectivesOutputSchema, apiKey, stageOpts(1024));
  const objectives = objectivesData.objectives;
  await sleep(RATE_LIMIT_DELAY_MS);

  // 2. Lesson Description
  const descRaw = injectVariables(LESSON_DESCRIPTION_PROMPT, { ...vars });
  const descData = await callStage("lessonDescription", descRaw, lessonDescriptionOutputSchema, apiKey, stageOpts(1024));
  await sleep(RATE_LIMIT_DELAY_MS);

  // 3. Real World Application
  const rwaRaw = injectVariables(REAL_WORLD_APPLICATION_PROMPT, { ...vars });
  const rwaData = await callStage("realWorldApplication", rwaRaw, realWorldApplicationOutputSchema, apiKey, stageOpts(1024));
  await sleep(RATE_LIMIT_DELAY_MS);

  const intro = {
    tag: `LESSON #${lessonIndex + 1}`,
    title: lessonTitle,
    body: descData.lessonDescription,
    usecase: rwaData.realWorldApplication,
  };

  // 4. Step Blueprint
  const blueprintRaw = injectVariables(STEP_BLUEPRINT_PROMPT, { ...vars });
  const blueprintData = await callStage("stepBlueprint", blueprintRaw, stepBlueprintOutputSchema, apiKey, stageOpts(1024));
  const blueprintSteps = blueprintData.steps;
  await sleep(RATE_LIMIT_DELAY_MS);

  // 5. Step Details (sequential; code so far = previous step's seedCode)
  let codeSoFar = "";
  const steps = [];
  for (let i = 0; i < blueprintSteps.length; i++) {
    if (i > 0) await sleep(RATE_LIMIT_DELAY_MS);
    const blueprintItem = blueprintSteps[i];
    const completedSteps = steps.map((s) => ({ id: s.id, title: s.title, phase: s.phase }));
    const stepPrompt = injectVariables(STEP_DETAIL_PROMPT, {
      ...vars,
      COMPLETED_STEPS_JSON: completedSteps,
      CODE_SO_FAR: codeSoFar || "// No code yet — this is the first step.",
      CURRENT_STEP_BLUEPRINT_JSON: blueprintItem,
    });
    const stepData = await callStage(`stepDetail-${blueprintItem.id}`, stepPrompt, stepDetailOutputSchema, apiKey, stageOpts(2048));
    const stepWithType = { ...stepData, type: "question" };
    const stepValidated = lessonStepSchema.safeParse(stepWithType);
    if (!stepValidated.success) throw new Error(`Step ${blueprintItem.id} validation: ${stepValidated.error.message}`);
    steps.push(stepValidated.data);
    codeSoFar = stepValidated.data.seedCode ?? codeSoFar;
  }

  const sideItems = [
    { id: "intro", label: "Intro" },
    { id: "objectives", label: "Objectives" },
    ...steps.map((s) => ({ id: s.id, label: s.title || s.id })),
  ];

  const assembled = {
    lessonId: `ai-${track}-${pad}`,
    track,
    lessonNum,
    title: lessonTitle,
    shortName: `P${pad}`,
    intro,
    objectives,
    steps,
    sideItems,
  };

  const validated = lessonConfigSchema.safeParse(assembled);
  if (!validated.success) {
    logStage("assembly", { success: false, error: validated.error.message });
    throw new Error("Final lesson validation failed: " + validated.error.message);
  }
  logStage("assembly", { success: true });
  return validated.data;
}
