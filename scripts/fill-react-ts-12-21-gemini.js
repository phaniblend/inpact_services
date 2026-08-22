import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(rootDir, ".env") });

const PROMPT_PATH = path.join(
  rootDir,
  "scripts",
  "prompts",
  "react-ts-lessons-12-21-gemini-prompt.txt"
);
const TARGET_DIR = path.join(rootDir, "src", "engines", "react-ts");
const MODEL = (process.env.GEMINI_MODEL || "gemini-2.5-flash").trim();

/** Minimum chars so we do not accept empty fences or API error pages. */
const MIN_LESSON_CHARS = Number(process.env.MIN_LESSON_CHARS || 2000);

function getApiKey() {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    ""
  ).trim();
}

function buildPrompt(masterPrompt, lessonNum) {
  return `${masterPrompt}

---

Now generate exactly one lesson file:
- lesson number: ${lessonNum}
- file name: inpact_ts${String(lessonNum).padStart(2, "0")}_engine.jsx

Output requirements:
1) Output exactly one fenced TypeScript code block only.
2) Do not include extra prose before or after the code block.
3) Ensure createINPACTEngine uses lessonNum: ${lessonNum}.
`;
}

function extractCode(raw, lessonNum) {
  const labeled = new RegExp(
    String.raw`//\s*LESSON\s*\[${lessonNum}\]\s*:[^\n]*\n\`\`\`(?:typescript|tsx|ts)\s*([\s\S]*?)\`\`\``,
    "i"
  ).exec(raw);
  if (labeled?.[1]) return `${String(labeled[1]).trim()}\n`;

  const generic = /```(?:typescript|tsx|ts)\s*([\s\S]*?)```/i.exec(raw);
  if (generic?.[1]) return `${String(generic[1]).trim()}\n`;
  return "";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Single HTTP call to Gemini (no retry inside — outer loop handles retries).
 */
async function geminiRequestOnce(apiKey, prompt, requestTimeoutMs = 300000) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    MODEL
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          topP: 0.9,
          maxOutputTokens: 32768,
        },
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error?.message || `HTTP ${res.status}`);
    }
    const text =
      data?.candidates?.[0]?.content?.parts?.map((part) => part?.text || "").join("") || "";
    if (!text.trim()) {
      throw new Error("Gemini returned empty content");
    }
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * One lesson at a time. Retries forever until a valid file is written.
 */
async function generateLessonUntilSuccess(apiKey, masterPrompt, lessonNum) {
  const fileName = `inpact_ts${String(lessonNum).padStart(2, "0")}_engine.jsx`;
  const outPath = path.join(TARGET_DIR, fileName);
  let attempt = 0;

  for (;;) {
    attempt += 1;
    try {
      console.log(`[L${lessonNum}] attempt ${attempt} -> ${fileName}`);
      const prompt = buildPrompt(masterPrompt, lessonNum);
      const raw = await geminiRequestOnce(apiKey, prompt);
      const code = extractCode(raw, lessonNum);
      if (!code || code.length < MIN_LESSON_CHARS) {
        throw new Error(
          code
            ? `Parsed block too short (${code.length} chars, need >= ${MIN_LESSON_CHARS})`
            : "Could not parse a TypeScript code block"
        );
      }
      fs.writeFileSync(outPath, code, "utf8");
      console.log(`[L${lessonNum}] OK wrote ${fileName} (${code.length} chars)`);
      return;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const base = Math.min(180000, 4000 * 2 ** Math.min(attempt - 1, 6));
      const jitter = Math.floor(Math.random() * 8000);
      const waitMs = base + jitter;
      console.log(`[L${lessonNum}] failed: ${msg}`);
      console.log(`[L${lessonNum}] retrying in ${Math.round(waitMs / 1000)}s (never stop)...`);
      await sleep(waitMs);
    }
  }
}

async function main() {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY or VITE_GEMINI_API_KEY in .env");
  }
  if (!fs.existsSync(PROMPT_PATH)) {
    throw new Error(`Prompt file not found: ${PROMPT_PATH}`);
  }
  const masterPrompt = fs.readFileSync(PROMPT_PATH, "utf8");

  const start = Number(process.env.LESSON_START || 12);
  const end = Number(process.env.LESSON_END || 21);

  for (let lessonNum = start; lessonNum <= end; lessonNum += 1) {
    await generateLessonUntilSuccess(apiKey, masterPrompt, lessonNum);
  }

  console.log(`Completed filling lessons ${start} through ${end}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
