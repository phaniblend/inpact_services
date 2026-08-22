import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import express from "express";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(rootDir, ".env") });

const app = express();
app.use(express.json({ limit: "2mb" }));

// Railway (and most PaaS hosts) inject PORT and expect the app to bind to exactly that — prefer
// it over the local-dev-only GEMINI_LESSON_SERVER_PORT convention so this needs zero extra
// per-host port configuration.
const PORT = Number(process.env.PORT || process.env.GEMINI_LESSON_SERVER_PORT || 3099);
const MODEL = (process.env.GEMINI_MODEL || "gemini-2.5-flash").trim();
const PROMPT_PATH = path.join(
  rootDir,
  "scripts",
  "prompts",
  "react-ts-lessons-12-21-gemini-prompt.txt"
);
const TARGET_DIR = path.join(rootDir, "src", "engines", "react-ts");

function getGeminiApiKey() {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    ""
  ).trim();
}

function extractCodeBlocks(responseText) {
  const blocks = [];
  const regex = /\/\/\s*LESSON\s*\[(\d+)\]\s*:[^\n]*\n```(?:typescript|tsx|ts)\s*([\s\S]*?)```/gi;
  let match;
  while ((match = regex.exec(responseText)) !== null) {
    const lessonNum = Number(match[1]);
    const code = String(match[2] || "").trim();
    if (Number.isFinite(lessonNum) && code) {
      blocks.push({ lessonNum, code: `${code}\n` });
    }
  }
  return blocks;
}

function extractSingleTypescriptBlock(text) {
  const ts = /```(?:typescript|tsx|ts)\s*([\s\S]*?)```/i.exec(text);
  if (ts?.[1]) return `${String(ts[1]).trim()}\n`;
  return "";
}

async function callGemini(prompt) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY or VITE_GEMINI_API_KEY in .env");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    MODEL
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        topP: 0.9,
        maxOutputTokens: 65535,
      },
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message || `Gemini request failed with HTTP ${res.status}`);
  }

  const text =
    data?.candidates?.[0]?.content?.parts?.map((part) => part?.text || "").join("") || "";
  if (!text.trim()) {
    throw new Error("Gemini returned empty output.");
  }
  return text;
}

function buildSingleLessonPrompt(masterPrompt, lessonNum) {
  return `${masterPrompt}

---

Now generate exactly one lesson file:
- lesson number: ${lessonNum}
- file name: inpact_ts${String(lessonNum).padStart(2, "0")}_engine.jsx

Output requirements for this request only:
1) Output exactly one fenced TypeScript block.
2) Do not include any extra prose before or after the code block.
3) Ensure lessonNum in createINPACTEngine is ${lessonNum}.
`;
}

async function generateOneLesson(masterPrompt, lessonNum) {
  const prompt = buildSingleLessonPrompt(masterPrompt, lessonNum);
  const raw = await callGemini(prompt);
  const blockFromLabel = extractCodeBlocks(raw).find((b) => b.lessonNum === lessonNum);
  const code = blockFromLabel?.code || extractSingleTypescriptBlock(raw);
  if (!code.trim()) {
    throw new Error(`No parseable TypeScript block returned for lesson ${lessonNum}.`);
  }
  const fileName = `inpact_ts${String(lessonNum).padStart(2, "0")}_engine.jsx`;
  const outPath = path.join(TARGET_DIR, fileName);
  fs.writeFileSync(outPath, code, "utf8");
  return fileName;
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, model: MODEL, promptPath: PROMPT_PATH });
});

app.post("/api/react-ts/fill-lessons-12-21", async (_req, res) => {
  try {
    if (!fs.existsSync(PROMPT_PATH)) {
      throw new Error(`Prompt not found at ${PROMPT_PATH}`);
    }
    const masterPrompt = fs.readFileSync(PROMPT_PATH, "utf8");
    const written = [];

    for (let lessonNum = 12; lessonNum <= 21; lessonNum += 1) {
      const fileName = await generateOneLesson(masterPrompt, lessonNum);
      written.push(fileName);
    }

    res.json({ ok: true, writtenCount: written.length, written });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ ok: false, error: message });
  }
});

app.listen(PORT, () => {
  const key = getGeminiApiKey();
  console.log(
    `Gemini lesson server running on http://localhost:${PORT} (key: ${key ? "set" : "missing"})`
  );
});
