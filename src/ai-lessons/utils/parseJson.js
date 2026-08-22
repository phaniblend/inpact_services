/**
 * Robust JSON parsing for AI stage outputs.
 * Strips markdown code fences, retries on failure, no secrets in logs.
 */

// Accept fenced payloads like ```json, ```JSON, ```ts, or bare ``` blocks.
const JSON_BLOCK_REGEX = /```(?:[a-zA-Z0-9_-]+)?\s*([\s\S]*?)```/;
const MAX_PARSE_ATTEMPTS = 2;

/**
 * Extract JSON string from raw AI text (strip ```json ... ``` if present).
 * @param {string} raw
 * @returns {string}
 */
export function extractJsonString(raw) {
  if (!raw || typeof raw !== "string") return "";
  const trimmed = raw.trim();
  const match = trimmed.match(JSON_BLOCK_REGEX);
  if (match) return match[1].trim();
  // Fallback for unusual fence formatting like "``` json" or extra preface text.
  if (trimmed.includes("```")) {
    const first = trimmed.indexOf("```");
    const second = trimmed.indexOf("```", first + 3);
    if (first !== -1 && second !== -1) {
      const between = trimmed.slice(first + 3, second).trim();
      // Drop optional language token on first line (json / JSON / ts / etc.)
      const nl = between.indexOf("\n");
      if (nl > -1) {
        const firstLine = between.slice(0, nl).trim();
        if (/^[a-zA-Z0-9_-]+$/.test(firstLine)) return between.slice(nl + 1).trim();
      }
      return between;
    }
    // Opening fence only (no closing fence): remove first fence line and parse the rest.
    if (first === 0 && second === -1) {
      const afterFenceLine = trimmed.replace(/^```[^\n]*\n?/, "");
      return afterFenceLine.trim();
    }
  }
  return trimmed;
}

/**
 * Parse JSON with optional markdown stripping. Throws on invalid JSON.
 * @param {string} raw
 * @returns {unknown}
 */
/** First complete `{...}` or `[...]` in `text`, respecting JSON strings so `}` in code does not end the object early. */
export function sliceFirstJsonValue(text) {
  const s = String(text || "");
  const startObj = s.indexOf("{");
  const startArr = s.indexOf("[");
  let start = -1;
  if (startObj < 0) start = startArr;
  else if (startArr < 0) start = startObj;
  else start = Math.min(startObj, startArr);
  if (start < 0) return "";
  const opener = s[start];
  const closer = opener === "{" ? "}" : "]";
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (inString) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === "\\") {
        escape = true;
        continue;
      }
      if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === opener) depth += 1;
    else if (ch === closer) {
      depth -= 1;
      if (depth === 0) return s.slice(start, i + 1);
    }
  }
  return "";
}

export function parseStrictJson(raw) {
  const str = extractJsonString(raw);
  if (!str) throw new Error("No JSON content to parse");
  try {
    return JSON.parse(str);
  } catch (firstErr) {
    const sliced = sliceFirstJsonValue(str) || sliceFirstJsonValue(raw);
    if (sliced && sliced !== str) {
      try {
        return JSON.parse(sliced);
      } catch {
        /* fall through */
      }
    }
    const msg = firstErr instanceof SyntaxError ? firstErr.message : String(firstErr);
    throw new Error("JSON parse failed: " + msg);
  }
}

/**
 * Parse JSON from raw text and validate with Zod schema.
 * @param {string} raw - Raw AI response text
 * @param {import("zod").ZodType} schema - Zod schema (e.g. schema.safeParse(parsed))
 * @returns {{ success: true, data: unknown } | { success: false, error: string }}
 */
export function parseAndValidate(raw, schema) {
  try {
    const parsed = parseStrictJson(raw);
    const result = schema.safeParse(parsed);
    if (result.success) return { success: true, data: result.data };
    return { success: false, error: result.error?.message ?? "Validation failed" };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * Log debug info for pipeline stages (no secrets).
 * @param {string} stage
 * @param {{ success: boolean, error?: string, keys?: string[] }} info
 */
export function logStage(stage, info) {
  if (typeof import.meta !== "undefined" && import.meta.env?.PROD) return;
  if (typeof console?.info !== "function") return;
  const msg = info.success
    ? `[AI pipeline] ${stage} ok`
    : `[AI pipeline] ${stage} failed: ${info.error ?? "unknown"}`;
  console.info(msg);
  if (info.keys?.length) console.info(`[AI pipeline] ${stage} keys: ${info.keys.join(", ")}`);
}
