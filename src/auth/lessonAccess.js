/**
 * Free tier & gates (unique lessons per browser, localStorage until backend APIs exist).
 *
 * Business rules (summary):
 * - 1st new anonymous lesson: soft register prompt (dismissible).
 * - 2nd new anonymous lesson: soft prompt + optional “I’ll sign up before my next lesson”.
 * - 3rd new anonymous lesson: must register (hard gate).
 * - After register: up to TOTAL_FREE_LESSONS free uniques total in-browser, then per-lesson pricing (balance).
 * - Standard lesson price: $1. Student rate $0.25 only when the signed-in account email uses a U.S.-style .edu host (includes Google sign-in with .edu). Supabase users can also prove .edu via magic link.
 * - Logged-out but has registered before (ever_registered): banner; same anonymous cap; then login wall.
 */

const STORAGE_KEY_ACCESSED = "inpact_lessons_accessed";
const STORAGE_KEY_REGISTERED = "inpact_user_registered";
const STORAGE_KEY_EVER_REGISTERED = "inpact_ever_registered";
const STORAGE_KEY_BALANCE = "inpact_balance_cents";
const STORAGE_KEY_USER = "inpact_user";
const STORAGE_KEY_DISMISS_COUNT = "inpact_register_dismiss_count";

/** @deprecated Use gate copy only; anonymous prompts start at lesson 1. */
export const FREE_LESSONS_SILENT = 0;
/** Max unique lessons without an account before the hard gate (3rd new lesson requires account). */
export const MAX_FREE_UNREGISTERED = 2;
/** Total free unique lessons in this browser before pay-per-lesson (includes guest previews). */
export const TOTAL_FREE_LESSONS = 3;
/** Extra free lessons after registering once guest slots are used (product copy). */
export const FREE_LESSONS_AFTER_REGISTER = TOTAL_FREE_LESSONS - MAX_FREE_UNREGISTERED;

export const PRICE_PER_LESSON_CENTS = 100; // $1 standard
export const STUDENT_PRICE_PER_LESSON_CENTS = 25; // $0.25 when account email qualifies (.edu)
/** Fund buckets: $5–$25 in steps of $5 (payment integration later). */
export const FUND_BUCKETS_CENTS = [500, 1000, 1500, 2000, 2500];

function getAccessedKeys() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACCESSED);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function setAccessedKeys(keys) {
  try {
    localStorage.setItem(STORAGE_KEY_ACCESSED, JSON.stringify(keys));
  } catch (_) {}
}

function lessonKey(track, index) {
  return `${track}:${index}`;
}

/** Call when user actually enters a lesson (counts toward limits). */
export function recordLessonAccess(track, index) {
  const keys = getAccessedKeys();
  const key = lessonKey(track, index);
  if (keys.includes(key)) return;
  keys.push(key);
  setAccessedKeys(keys);
}

export function getAccessedCount() {
  return getAccessedKeys().length;
}

export function isRegistered() {
  try {
    return localStorage.getItem(STORAGE_KEY_REGISTERED) === "true";
  } catch {
    return false;
  }
}

/** True if this browser has completed registration at least once (persists after logout). */
export function hasEverRegistered() {
  try {
    return localStorage.getItem(STORAGE_KEY_EVER_REGISTERED) === "true";
  } catch {
    return false;
  }
}

export function setRegistered(user = null) {
  try {
    localStorage.setItem(STORAGE_KEY_REGISTERED, "true");
    localStorage.setItem(STORAGE_KEY_EVER_REGISTERED, "true");
    if (user) localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  } catch (_) {}
}

export function logout() {
  try {
    if (localStorage.getItem(STORAGE_KEY_REGISTERED) === "true") {
      localStorage.setItem(STORAGE_KEY_EVER_REGISTERED, "true");
    }
    localStorage.removeItem(STORAGE_KEY_REGISTERED);
    localStorage.removeItem(STORAGE_KEY_USER);
  } catch (_) {}
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getBalanceCents() {
  try {
    const v = localStorage.getItem(STORAGE_KEY_BALANCE);
    return v != null ? parseInt(v, 10) : 0;
  } catch {
    return 0;
  }
}

export function setBalanceCents(cents) {
  try {
    localStorage.setItem(STORAGE_KEY_BALANCE, String(Math.max(0, cents)));
  } catch (_) {}
}

export function addFundsCents(cents) {
  setBalanceCents(getBalanceCents() + cents);
}

/**
 * U.S.-style academic host: the email domain must end with `.edu` (e.g. name@umich.edu, name@mail.tsu.edu).
 * Not for .ac.uk etc. — add separate rules later if you expand regions.
 */
export function isEduEmail(email) {
  if (typeof email !== "string") return false;
  const t = email.trim().toLowerCase();
  const at = t.lastIndexOf("@");
  if (at <= 0 || at === t.length - 1) return false;
  const host = t.slice(at + 1);
  return host.endsWith(".edu");
}

/** Student lesson rate applies when the profile email we store for this session is .edu (Supabase, or Google .edu). */
export function qualifiesForStudentPricing(user) {
  const em = user?.emailOrPhone;
  return Boolean(em && isEduEmail(em));
}

export function getLessonPriceCents() {
  return qualifiesForStudentPricing(getStoredUser()) ? STUDENT_PRICE_PER_LESSON_CENTS : PRICE_PER_LESSON_CENTS;
}

/**
 * @typedef {{ loggedIn?: boolean }} LessonGateOpts
 */

/**
 * Which soft prompt applies for the next new anonymous lesson (never-registered, not logged in).
 * @returns {"first" | "second" | null}
 */
export function getSoftGateKind(track, index, opts = {}) {
  // App is fully free: disable all signup prompts.
  return null;
}

/** Soft gate: 1st and 2nd new anonymous lessons (dismissible). */
export function mustSoftRegisterToAccess(track, index, opts = {}) {
  return false;
}

/**
 * Hard register gate: never-registered anonymous user on the 3rd new unique lesson.
 */
export function mustHardRegisterToAccess(track, index, opts = {}) {
  return false;
}

/**
 * Returning user: registered before, logged out — must log in to open lesson 9+ (new unique past 8).
 */
export function mustLoginToUnlockPastAnonymousLimit(track, index, opts = {}) {
  return false;
}

/** Registered user past free tier opening a new lesson — needs balance (mock until payment). */
export function mustPayToAccess(track, index, opts = {}) {
  return false;
}

export function canAccessLesson(track, index, opts = {}) {
  return true;
}

export function deductLessonPayment() {
  const balance = getBalanceCents();
  const price = getLessonPriceCents();
  if (balance >= price) {
    setBalanceCents(balance - price);
  }
}

export function getRegisterDismissCount() {
  try {
    return parseInt(localStorage.getItem(STORAGE_KEY_DISMISS_COUNT) || "0", 10);
  } catch {
    return 0;
  }
}

export function incrementRegisterDismissCount() {
  try {
    const c = getRegisterDismissCount() + 1;
    localStorage.setItem(STORAGE_KEY_DISMISS_COUNT, String(c));
    return c;
  } catch {
    return 0;
  }
}

/** Remaining free lesson slots before pay-per-lesson (logged-in / registered session, UI). */
export function getFreeLessonsRemaining(opts = {}) {
  if (!opts.loggedIn && !isRegistered()) return null;
  const used = getAccessedCount();
  return Math.max(0, TOTAL_FREE_LESSONS - used);
}

/** Line for anonymous users: guest preview slots remaining before hard register. */
export function getAnonymousFreeSlotsRemaining() {
  const used = getAccessedCount();
  return Math.max(0, MAX_FREE_UNREGISTERED - used);
}

const STORAGE_KEY_PENDING_LESSON = "inpact_pending_lesson";
/** Drop stale pending resume payloads (e.g. abandoned sign-in) so we do not hijack a later visit. */
const PENDING_LESSON_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour

/** Persist the lesson the user was trying to open when the auth gate triggered (survives full-page reloads). */
export function savePendingLesson(track, index, item) {
  try {
    const payload = JSON.stringify({ track, index, item, savedAt: Date.now() });
    localStorage.setItem(STORAGE_KEY_PENDING_LESSON, payload);
    sessionStorage.setItem(STORAGE_KEY_PENDING_LESSON, payload);
  } catch (_) {}
}

/** Read pending lesson without removing (used after sign-in before navigation commits). */
export function peekPendingLesson() {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY_PENDING_LESSON) ?? sessionStorage.getItem(STORAGE_KEY_PENDING_LESSON);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (p?.savedAt != null && Date.now() - p.savedAt > PENDING_LESSON_MAX_AGE_MS) {
      clearPendingLesson();
      return null;
    }
    return p;
  } catch {
    return null;
  }
}

/** Read and clear the stored pending lesson (returns null if none). */
export function consumePendingLesson() {
  const p = peekPendingLesson();
  clearPendingLesson();
  return p;
}

export function clearPendingLesson() {
  try {
    localStorage.removeItem(STORAGE_KEY_PENDING_LESSON);
    sessionStorage.removeItem(STORAGE_KEY_PENDING_LESSON);
  } catch (_) {}
}

export function getFingerprintHint() {
  if (typeof navigator === "undefined") return "";
  const ua = navigator.userAgent || "";
  const lang = (navigator.languages && navigator.languages[0]) || navigator.language || "";
  const screen = typeof screen !== "undefined" ? `${screen.width}x${screen.height}` : "";
  const tz = typeof Intl !== "undefined" && Intl.DateTimeFormat ? Intl.DateTimeFormat().resolvedOptions().timeZone : "";
  return [ua, lang, screen, tz].join("|");
}
