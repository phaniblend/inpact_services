/**
 * Feature flag and config for AI-driven lessons.
 * All secrets from env only; no hardcoded keys. DeepSeek only.
 *
 * Env vars (see AI_LESSONS_ENV.md):
 *   VITE_USE_AI_LESSONS     — "true" to use AI pipeline on lesson card click
 *   VITE_DEEPSEEK_API_KEY   — DeepSeek API key (client path; server uses DEEPSEEK_API_KEY)
 *   VITE_AI_USE_MOCK_ONLY   — "true" to skip real AI and use mock only (fallback)
 *   VITE_LESSON_API_BASE    — optional absolute origin for /api/lessons/* (avoids 405 when static host blocks POST)
 */

function getEnv(name) {
  if (typeof import.meta === "undefined" || !import.meta.env) return "";
  const v = import.meta.env[name];
  return typeof v === "string" ? v.trim() : "";
}

const useAILessons = getEnv("VITE_USE_AI_LESSONS").toLowerCase() === "true";
const apiKey = getEnv("VITE_DEEPSEEK_API_KEY");
const useMockOnly = getEnv("VITE_AI_USE_MOCK_ONLY").toLowerCase() === "true";
/** When true, frontend calls Node server for generate/preview (no API key in browser). */
const useServer = getEnv("VITE_AI_USE_SERVER").toLowerCase() === "true";
/** Base URL for API when useServer. Must match server port (server defaults to 3000). */
const serverBaseUrl = useServer
  ? (getEnv("VITE_AI_SERVER_URL") || `http://localhost:${getEnv("VITE_AI_SERVER_PORT") || "3000"}`)
  : "";

/** Use real AI when AI lessons are on and (server is used, or key is set and mock-only is off). */
const useRealAI = useAILessons && (useServer || (!!apiKey && !useMockOnly));

export const AI_LESSONS_CONFIG = {
  /** When true, lesson card click routes to AI pipeline; when false, to existing local engine. */
  useAILessons,
  /** When true, generate lessons via real DeepSeek API (server or client). */
  useRealAI,
  /** When true, frontend POSTs to Node server (serverBaseUrl). */
  useServer,
  /** When useServer: base URL for /api/lessons (e.g. http://localhost:3001). */
  serverBaseUrl,
  /** When true, skip real AI and use mock service only (for testing without API). */
  useMockOnly,
  /** DeepSeek API key from env (client-only path). Never log or expose in UI. */
  apiKey: apiKey || "",
  /** Fall back to local engine if AI generation fails. */
  fallbackToLocalOnError: true,
};

export default AI_LESSONS_CONFIG;
