/**
 * Post–sign-in resume + in-app routes (HashRouter): /lessons/<track>/<listIndex>
 *
 * listIndex is the zero-based lesson index for that track (same as App lessonIndex) — the exact
 * lesson the user opened when registration was forced, not “9th free slot” or “lesson 9” as a label.
 */

export const REDIRECT_PATH_STORAGE_KEY = "redirectPath";

const LESSONS_PATH_RE = /^\/lessons\/([^/]+)\/(\d+)$/;
/** Shorthand: /lessons/42 → React · TS, listIndex 42 */
const LESSONS_SHORT_RE = /^\/lessons\/(\d+)$/;

export function buildLessonPath(track, zeroBasedListIndex) {
  const idx = Math.max(0, Math.floor(Number(zeroBasedListIndex)) || 0);
  return `/lessons/${encodeURIComponent(track)}/${idx}`;
}

export function parseLessonPath(pathname) {
  const short = pathname.match(LESSONS_SHORT_RE);
  if (short) {
    const idx = parseInt(short[1], 10);
    if (!Number.isFinite(idx) || idx < 0) return null;
    return { track: "react-ts", index: idx };
  }
  const m = pathname.match(LESSONS_PATH_RE);
  if (!m) return null;
  const track = decodeURIComponent(m[1]);
  const idx = parseInt(m[2], 10);
  if (!Number.isFinite(idx) || idx < 0) return null;
  return { track, index: idx };
}

/** Path inside the hash (for initial showCinematic etc. when using HashRouter). */
export function getHashRoutePathname() {
  if (typeof window === "undefined") return "/";
  let p = window.location.hash.replace(/^#/, "").split("?")[0] || "/";
  if (!p.startsWith("/")) p = `/${p}`;
  return p;
}

export function setStoredRedirectPath(path) {
  if (!path || typeof path !== "string" || !path.startsWith("/")) return;
  try {
    localStorage.setItem(REDIRECT_PATH_STORAGE_KEY, path);
  } catch (_) {}
}

export function getStoredRedirectPath() {
  try {
    const v = localStorage.getItem(REDIRECT_PATH_STORAGE_KEY);
    return v && v.startsWith("/") ? v : "";
  } catch {
    return "";
  }
}

export function clearStoredRedirectPath() {
  try {
    localStorage.removeItem(REDIRECT_PATH_STORAGE_KEY);
  } catch (_) {}
}
