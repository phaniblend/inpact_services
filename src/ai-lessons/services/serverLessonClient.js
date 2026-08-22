/**
 * Client for the AI lesson server. Sequential: /intro → /objectives → /generate. All cached on server.
 * Used when VITE_AI_USE_SERVER=true so the browser never touches the API key.
 */

import { validateLessonConfig } from "../schema.js";

const DEFAULT_API_BASE = "";

function getBase(options) {
  return options.baseUrl ?? DEFAULT_API_BASE;
}

/** Sequential call 1: intro only (description + why it matters). Cached on server. */
export async function generateIntroViaServer(params, options = {}) {
  const base = getBase(options);
  const res = await fetch(`${base}/api/lessons/intro`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).catch((err) => {
    throw new Error("Server request failed: " + (err instanceof Error ? err.message : String(err)));
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { success: false, error: data?.error ?? `Server ${res.status}` };
  if (!data.success || !data.intro) return { success: false, error: data?.error ?? "Server did not return intro" };
  return { success: true, intro: data.intro, track: data.track, lessonTitle: data.lessonTitle, lessonIndex: data.lessonIndex };
}

/** Sequential call 2: learning objectives only. Cached on server. */
export async function generateObjectivesViaServer(params, options = {}) {
  const base = getBase(options);
  const res = await fetch(`${base}/api/lessons/objectives`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).catch((err) => {
    throw new Error("Server request failed: " + (err instanceof Error ? err.message : String(err)));
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { success: false, error: data?.error ?? `Server ${res.status}` };
  if (!data.success || !Array.isArray(data.objectives)) return { success: false, error: data?.error ?? "Server did not return objectives" };
  return {
    success: true,
    leadIn: data.leadIn ?? "After completing this lesson, you will be able to:",
    objectives: data.objectives,
    track: data.track,
    lessonTitle: data.lessonTitle,
    lessonIndex: data.lessonIndex,
  };
}

/** Legacy: one round-trip for intro + objectives. Prefer sequential intro then objectives. */
export async function generatePreviewViaServer(params, options = {}) {
  const base = getBase(options);
  const res = await fetch(`${base}/api/lessons/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).catch((err) => {
    throw new Error("Server request failed: " + (err instanceof Error ? err.message : String(err)));
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { success: false, error: data?.error ?? `Server ${res.status}` };
  if (!data.success || !data.intro || !Array.isArray(data.objectives)) return { success: false, error: data?.error ?? "Server did not return a preview" };
  return {
    success: true,
    intro: data.intro,
    leadIn: data.leadIn ?? "After completing this lesson, you will be able to:",
    objectives: data.objectives,
    track: data.track,
    lessonTitle: data.lessonTitle,
    lessonIndex: data.lessonIndex,
  };
}

/**
 * @param {{ track: string, lessonTitle: string, lessonIndex: number }} params
 * @param {{ baseUrl?: string }} options
 * @returns {Promise<{ success: true, config: object, source: 'real' } | { success: false, error: string }>}
 */
export async function generateLessonViaServer(params, options = {}) {
  const base = options.baseUrl ?? DEFAULT_API_BASE;
  const url = `${base}/api/lessons/generate`;

  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: "Server request failed: " + message };
  }

  let data;
  try {
    data = await res.json();
  } catch {
    return { success: false, error: "Invalid JSON from server" };
  }

  if (!res.ok) {
    return { success: false, error: data?.error ?? `Server ${res.status}` };
  }

  if (!data.success || !data.config) {
    return { success: false, error: data?.error ?? "Server did not return a lesson" };
  }

  const validated = validateLessonConfig(data.config);
  if (!validated.success) {
    return { success: false, error: "Validation failed: " + validated.error.message };
  }

  return { success: true, config: validated.data, source: "real" };
}
