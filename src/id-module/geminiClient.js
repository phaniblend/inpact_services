/**
 * ID Module's Gemini client — same call shape as server/gemini-react-ts-lessons-server.js
 * (the existing, working lesson-generation pipeline), factored out so both can share it.
 */
const MODEL = (process.env.GEMINI_MODEL || "gemini-2.5-flash").trim();

export function getGeminiApiKey() {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    ""
  ).trim();
}

// No timeout meant a stalled connection to Google's API could hang this call — and everything
// waiting on it (a whole SpecForge publish, holding the HTTP request open) — forever, with no
// error to catch and nothing to retry. Discovered live: a publish sat "pending" 4+ minutes with
// no error logged anywhere. AbortController turns a stall into a clean, catchable failure.
//
// 100s was too tight: a full lesson generation (maxOutputTokens: 65535, ~60 pedagogy rules to
// satisfy) legitimately takes longer than that on a non-streaming call — the client waits for the
// whole response, not just first-byte. Raised once to 240s after watching two genuine in-progress
// generations both get cut off at the old limit. Raised again here: running the real pipeline
// end-to-end for the first product built after the designMock requirement was added (more required
// output per module, on top of the existing ~60 rules), two more real generations in a row hit
// this exact 240s wall. Tune again if real generations still time out at this one.
const REQUEST_TIMEOUT_MS = 360_000;

export async function callGemini(prompt) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("Draft generation isn't configured on this server.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    MODEL
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, topP: 0.9, maxOutputTokens: 65535 },
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err?.name === "AbortError") {
      throw new Error(`Draft generation timed out after ${REQUEST_TIMEOUT_MS / 1000}s — try again.`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message || `Draft generation failed (${res.status})`);
  }

  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p?.text || "").join("") || "";
  if (!text.trim()) {
    throw new Error("Draft generation returned empty output.");
  }
  return text;
}

export function extractSingleTypescriptBlock(text) {
  const ts = /```(?:typescript|tsx|ts)\s*([\s\S]*?)```/i.exec(text);
  if (ts?.[1]) return `${String(ts[1]).trim()}\n`;
  return "";
}
