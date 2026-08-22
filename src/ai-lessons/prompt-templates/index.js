/**
 * Prompt template registry — all 12 stages traceable to src/ai-prompt.txt.
 * Use injectVariables(template, { TRACK, LESSON_TITLE, LESSON_GOAL, ... }) to fill placeholders.
 */

export { injectVariables } from "./injectVariables.js";
export { SYSTEM_INSTRUCTION } from "./systemInstruction.js";
export { LEARNING_OBJECTIVES_PROMPT } from "./learningObjectives.js";
export { LESSON_DESCRIPTION_PROMPT } from "./lessonDescription.js";
export { REAL_WORLD_APPLICATION_PROMPT } from "./realWorldApplication.js";
export { OBJECTIVES_PROMPT } from "./objectives.js";
export { INTRO_PROMPT } from "./intro.js";
export { STEP_BLUEPRINT_PROMPT } from "./stepBlueprint.js";
export { STEP_DETAIL_PROMPT } from "./stepDetail.js";
export { STEP_DETAIL_ALGO_PROMPT } from "./algoStepDetail.js";
export { ALGO_STRUCTURE_PROMPT } from "./algoStructure.js";
export { ALGO_MASTER_BEGINNER_PROMPT } from "./algoMasterBeginner.js";

// Stages 1–2 are architecture/schema (no runtime template).
// Stages 7–12: add runtime next-step, hint-only, analogous-example, evaluation-metadata,
// full assembler, backend orchestrator as needed.
// Placeholders used across pipeline: TRACK, LESSON_TITLE, LESSON_INDEX, CODE_SO_FAR,
// COMPLETED_STEPS_JSON, CURRENT_STEP_BLUEPRINT_JSON, LESSON_BLUEPRINT_JSON, CURRENT_STEP_INDEX.
