/**
 * Lesson generation orchestration layer.
 * Sequential flow: intro (call 1) → objectives (call 2) → full lesson (call 3). Server caches each; first learner triggers AI, rest get cache.
 */

import { AI_LESSONS_CONFIG } from "../config.js";
import { generateLessonViaServer, generateIntroViaServer, generateObjectivesViaServer, generatePreviewViaServer } from "./serverLessonClient.js";
import { generateLessonReal, generateLessonIntro as generateIntroReal, generateLessonObjectives as generateObjectivesReal, generateLessonPreview as generatePreviewReal } from "./realLessonService.js";
import { generateLessonMock, generateLessonPreviewMock } from "./mockLessonService.js";
import { validateLessonConfig } from "../schema.js";
import { logStage } from "../utils/parseJson.js";
const serverOpts = () => ({ baseUrl: AI_LESSONS_CONFIG.serverBaseUrl });

/**
 * Sequential call 1: intro only (description + why it matters). User reads while LOs/steps load later.
 */
export async function generateLessonIntro(params) {
  const useServer = AI_LESSONS_CONFIG.useServer;
  const useReal = AI_LESSONS_CONFIG.useRealAI;
  const useMockOnly = AI_LESSONS_CONFIG.useMockOnly;
  if (useReal && useServer) {
    const result = await generateIntroViaServer(params, serverOpts());
    if (result.success) return result;
  }
  if (useReal && !useMockOnly) {
    try {
      const r = await generateIntroReal(params);
      return { success: true, intro: r.intro, track: r.track, lessonTitle: r.lessonTitle, lessonIndex: r.lessonIndex };
    } catch (_) {}
  }
  const mock = await generateLessonPreviewMock(params);
  return { success: true, intro: mock.intro, objectives: mock.objectives, track: params.track, lessonTitle: params.lessonTitle, lessonIndex: params.lessonIndex };
}

/**
 * Sequential call 2: learning objectives only. Fetched after user continues from intro; cached on server.
 */
export async function generateLessonObjectives(params) {
  const useServer = AI_LESSONS_CONFIG.useServer;
  const useReal = AI_LESSONS_CONFIG.useRealAI;
  const useMockOnly = AI_LESSONS_CONFIG.useMockOnly;
  if (useReal && useServer) {
    const result = await generateObjectivesViaServer(params, serverOpts());
    if (result.success) return result;
  }
  if (useReal && !useMockOnly) {
    try {
      const r = await generateObjectivesReal(params);
      return {
        success: true,
        leadIn: r.leadIn ?? "After completing this lesson, you will be able to:",
        objectives: r.objectives,
        track: r.track,
        lessonTitle: r.lessonTitle,
        lessonIndex: r.lessonIndex,
      };
    } catch (_) {}
  }
  const mock = await generateLessonPreviewMock(params);
  return {
    success: true,
    leadIn: "After completing this lesson, you will be able to:",
    objectives: mock.objectives,
    track: params.track,
    lessonTitle: params.lessonTitle,
    lessonIndex: params.lessonIndex,
  };
}

/**
 * Legacy: intro + objectives in one (for backward compat). Prefer sequential generateLessonIntro then generateLessonObjectives.
 */
export async function generateLessonPreview(params) {
  const useServer = AI_LESSONS_CONFIG.useServer;
  const useReal = AI_LESSONS_CONFIG.useRealAI;
  const useMockOnly = AI_LESSONS_CONFIG.useMockOnly;
  if (useReal && useServer) {
    const result = await generatePreviewViaServer(params, serverOpts());
    if (result.success) return result;
  }
  if (useReal && !useMockOnly) {
    try {
      const preview = await generatePreviewReal(params);
      return {
        success: true,
        intro: preview.intro,
        leadIn: preview.leadIn ?? "After completing this lesson, you will be able to:",
        objectives: preview.objectives,
        track: preview.track,
        lessonTitle: preview.lessonTitle,
        lessonIndex: preview.lessonIndex,
      };
    } catch (err) {}
  }
  try {
    const preview = await generateLessonPreviewMock(params);
    return { success: true, ...preview };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

/**
 * @param {{ track: string, lessonTitle: string, lessonIndex: number }} params
 * @returns {Promise<{ success: true, config: object, source: 'real' | 'mock', fallbackReason?: string } | { success: false, error: string }>}
 */
export async function generateLesson(params) {
  const useReal = AI_LESSONS_CONFIG.useRealAI;
  const useMockOnly = AI_LESSONS_CONFIG.useMockOnly;
  const useServer = AI_LESSONS_CONFIG.useServer;
  let fallbackReason = "";

  // 1) Prefer server when enabled (no API key in browser)
  if (useReal && useServer) {
    const result = await generateLessonViaServer(params, { baseUrl: AI_LESSONS_CONFIG.serverBaseUrl });
    if (result.success) return result;
    fallbackReason = result.error ?? "Server request failed";
    logStage("orchestrator", { success: false, error: fallbackReason });
    // Fall through to mock
  }
  // 2) Try client-side real AI when enabled and key is present
  else if (useReal && !useMockOnly) {
    try {
      const config = await generateLessonReal(params);
      const validated = validateLessonConfig(config);
      if (!validated.success) {
        fallbackReason = "Validation failed";
        logStage("orchestrator", { success: false, error: fallbackReason });
        throw new Error(validated.error.message);
      }
      return { success: true, config: validated.data, source: "real" };
    } catch (err) {
      fallbackReason = err instanceof Error ? err.message : String(err);
      logStage("orchestrator", { success: false, error: fallbackReason });
      // Fall through to mock
    }
  }

  // 3) Mock service (when real disabled, or real failed)
  try {
    const config = await generateLessonMock(params);
    const validated = validateLessonConfig(config);
    if (!validated.success) {
      return { success: false, error: "Mock lesson validation failed: " + validated.error.message };
    }
    return { success: true, config: validated.data, source: "mock", fallbackReason: fallbackReason || undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
