/**
 * Approximate "time on app" for the signed-in user (per-device, localStorage).
 * Counts time while this tab is in the foreground; increments on an interval.
 */

const keyFor = (userId) => `inpact_app_usage_seconds_${userId}`;

export function getAppUsageSeconds(userId) {
  if (!userId) return 0;
  try {
    const v = parseInt(localStorage.getItem(keyFor(userId)) || "0", 10);
    return Number.isFinite(v) && v >= 0 ? v : 0;
  } catch {
    return 0;
  }
}

export function addAppUsageSeconds(userId, deltaSeconds) {
  if (!userId || deltaSeconds <= 0) return;
  const add = Math.min(Math.floor(deltaSeconds), 300);
  const next = getAppUsageSeconds(userId) + add;
  try {
    localStorage.setItem(keyFor(userId), String(next));
  } catch (_) {}
}
