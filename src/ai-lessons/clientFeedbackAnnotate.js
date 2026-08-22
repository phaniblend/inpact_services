/**
 * Browser client for POST /api/lessons/feedback-annotate (DeepSeek on server).
 */

import { lessonApiUrl } from "./lessonApiUrl.js";

function aiValidationDisabled() {
  if (typeof import.meta === "undefined" || !import.meta.env) return false;
  return String(import.meta.env.VITE_DISABLE_AI_VALIDATION || "").toLowerCase() === "true";
}

/**
 * Best-effort message from a failed fetch Response (JSON error, plain text, or status).
 * Avoids relying on res.statusText (often empty on HTTP/2).
 * @param {Response} res
 * @param {string} serviceLabel - short name for generic messages
 */
async function messageFromFailedResponse(res, serviceLabel) {
  const status = res.status;
  let text = "";
  try {
    text = await res.text();
  } catch {
    text = "";
  }
  if (text) {
    try {
      const j = JSON.parse(text);
      if (j && typeof j.error === "string" && j.error.trim()) return j.error.trim();
    } catch {
      const plain = text.replace(/\s+/g, " ").trim();
      if (plain && !plain.startsWith("<") && plain.length < 500) return plain;
    }
  }
  if (status === 404) {
    return `${serviceLabel} not available (404). Deploy or run the Node API so /api/lessons/feedback-annotate exists, or use Vite dev with npm run server.`;
  }
  if (status === 405) {
    return `${serviceLabel}: method not allowed (405). The page host often blocks POST to /api. Rebuild with VITE_LESSON_API_BASE set to your Node API origin (where Express runs), or proxy /api to that server.`;
  }
  if (status === 429) return "Rate limit exceeded. Please try again in a moment.";
  if (status === 401 || status === 403) {
    return `${serviceLabel} was rejected (${status}). Check API auth or deployment routing.`;
  }
  if (status === 502 || status === 503 || status === 504) {
    return `Cannot reach the AI (${status}). The API server may be down or /api may not be proxied to Node in production.`;
  }
  if (status === 500) {
    const t = text.replace(/\s+/g, " ").trim();
    const isHtml = /^</.test(t) || /<html/i.test(t);
    if (t && !isHtml && t.length < 600) return `Server error (500): ${t.slice(0, 320)}`;
    return "Server error (500) while annotating. Check API logs and DEEPSEEK_API_KEY on the server.";
  }
  const reason = res.statusText && res.statusText.trim();
  return reason || `${serviceLabel} request failed (${status})`;
}

/**
 * @param {{ instruction?: string, feedback: string, hint?: string, userCode: string, language?: string }} opts
 * @returns {Promise<{ annotatedCode: string }>}
 */
export async function fetchFeedbackAnnotate({ instruction, feedback, hint, userCode, language }) {
  if (aiValidationDisabled()) {
    throw new Error("AI validation disabled (VITE_DISABLE_AI_VALIDATION)");
  }
  const res = await fetch(lessonApiUrl("/api/lessons/feedback-annotate"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      instruction: instruction ?? "",
      feedback: feedback ?? "",
      hint: hint ?? "",
      userCode: userCode ?? "",
      language: language ?? "typescript",
    }),
  });
  if (!res.ok) {
    const msg = await messageFromFailedResponse(res, "Feedback annotate");
    throw new Error(msg);
  }
  return res.json();
}
