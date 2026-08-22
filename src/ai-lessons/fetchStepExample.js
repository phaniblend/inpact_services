import { lessonApiUrl } from "./lessonApiUrl.js";

/**
 * POST /api/lessons/step-example — server checks disk cache, then DeepSeek if needed.
 */

export async function fetchStepExample(body) {
  const res = await fetch(lessonApiUrl("/api/lessons/step-example"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || res.statusText || "Step example unavailable");
  }
  if (!data?.success || typeof data.code !== "string" || !data.code.trim()) {
    throw new Error(data?.error || "Empty example from server");
  }
  return data;
}
