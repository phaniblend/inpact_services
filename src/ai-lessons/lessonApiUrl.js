/**
 * Optional absolute origin for POST /api/lessons/*.
 *
 * Static hosts (e.g. Caddy serving only `dist`) often return **405 Method Not Allowed** for POST
 * to `/api/...` because nothing proxies to Node. Set at **build** time:
 *
 *   VITE_LESSON_API_BASE=https://your-api-service.example.com
 *
 * No trailing slash. Falls back to `VITE_AI_SERVER_URL` if set (same split-frontend/server setups).
 * When unset, requests use same-origin relative paths (works with Vite dev proxy or a unified server).
 */

export function getLessonApiBase() {
  if (typeof import.meta === "undefined" || !import.meta.env) return "";
  const raw = import.meta.env.VITE_LESSON_API_BASE || import.meta.env.VITE_AI_SERVER_URL || "";
  return String(raw).replace(/\/+$/, "").trim();
}

/** @param {string} path - Must start with `/`, e.g. `/api/lessons/validate` */
export function lessonApiUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  const base = getLessonApiBase();
  if (!base) return p;
  return `${base}${p}`;
}
