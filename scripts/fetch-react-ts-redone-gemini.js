/**
 * Fetch React-TS redone lessons from Gemini in parallel workers.
 *
 * Writes files to:
 *   src/engines/react-ts/redone/inpact_tsXX_engine.jsx
 *
 * Usage:
 *   node scripts/fetch-react-ts-redone-gemini.js
 *   WORKERS=4 node scripts/fetch-react-ts-redone-gemini.js
 *
 * Env:
 *   VITE_GEMINI_API_KEY or GEMINI_API_KEY (required)
 *   GEMINI_MODEL (optional, default: gemini-2.5-flash)
 */

import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(rootDir, ".env") });

const PROMPT_PATH = path.join(__dirname, "prompts", "react-ts-redone-master-prompt.txt");
const OUT_DIR = path.join(rootDir, "src", "engines", "react-ts", "redone");

const LESSONS = [
  { num: 8, title: "Forms & Validation", filename: "inpact_ts08_engine.jsx" },
  { num: 9, title: "Color Picker", filename: "inpact_ts09_engine.jsx" },
  { num: 10, title: "Reusable Button", filename: "inpact_ts10_engine.jsx" },
  { num: 11, title: "Card Component", filename: "inpact_ts11_engine.jsx" },
  { num: 12, title: "Props Drilling", filename: "inpact_ts12_engine.jsx" },
  { num: 13, title: "Default Props", filename: "inpact_ts13_engine.jsx" },
  { num: 14, title: "Children Prop", filename: "inpact_ts14_engine.jsx" },
  { num: 15, title: "PropTypes / TypeScript Interface", filename: "inpact_ts15_engine.jsx" },
  { num: 16, title: "Component Composition", filename: "inpact_ts16_engine.jsx" },
  { num: 17, title: "Event Handling", filename: "inpact_ts17_engine.jsx" },
];

function getApiKey() {
  return (
    process.env.VITE_GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    ""
  ).trim();
}

function getModel() {
  return (process.env.GEMINI_MODEL || "gemini-2.5-flash").trim();
}

function buildPrompt(masterPrompt, lesson) {
  return `${masterPrompt}

---

Now generate exactly one lesson file for:
- lessonNum: ${lesson.num}
- title: ${lesson.title}
- file: ${lesson.filename}

Output rules for this request:
1) Output exactly one fenced TypeScript code block.
2) The code block content must be the full lesson engine file.
3) Do not include commentary before or after the code block.
`;
}

function extractTypescriptBlock(text) {
  const tsFence = /```(?:typescript|tsx|ts)\s*([\s\S]*?)```/i.exec(text);
  if (tsFence?.[1]) return tsFence[1].trim() + "\n";
  const anyFence = /```[\w-]*\s*([\s\S]*?)```/.exec(text);
  if (anyFence?.[1]) return anyFence[1].trim() + "\n";
  return String(text || "").trim() + "\n";
}

async function callGemini({ apiKey, model, prompt, retries = 8 }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  let lastError = null;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            topP: 0.9,
            maxOutputTokens: 65535,
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.error?.message || `HTTP ${res.status}`;
        throw new Error(msg);
      }
      const text =
        data?.candidates?.[0]?.content?.parts
          ?.map((p) => p?.text || "")
          .join("") || "";
      if (!text.trim()) {
        throw new Error("Gemini returned empty content");
      }
      return text;
    } catch (err) {
      lastError = err;
      const isLast = attempt === retries;
      if (isLast) break;
      const waitMs = Math.min(30000, 1500 * 2 ** (attempt - 1)) + Math.floor(Math.random() * 700);
      await new Promise((r) => setTimeout(r, waitMs));
    }
  }
  throw lastError || new Error("Gemini request failed");
}

async function runWorker() {
  const { index, totalWorkers, lessons, promptPath, outDir, apiKey, model } = workerData;
  const masterPrompt = fs.readFileSync(promptPath, "utf8");
  const assigned = lessons.filter((_, i) => i % totalWorkers === index);

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const lesson of assigned) {
    const label = `L${String(lesson.num).padStart(2, "0")} ${lesson.title}`;
    try {
      parentPort?.postMessage({ type: "info", worker: index, message: `Generating ${label}` });
      const prompt = buildPrompt(masterPrompt, lesson);
      const raw = await callGemini({ apiKey, model, prompt });
      const code = extractTypescriptBlock(raw);
      const outPath = path.join(outDir, lesson.filename);
      fs.writeFileSync(outPath, code, "utf8");
      parentPort?.postMessage({ type: "ok", worker: index, lesson: label, file: outPath });
    } catch (err) {
      parentPort?.postMessage({
        type: "error",
        worker: index,
        lesson: label,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  parentPort?.postMessage({ type: "done", worker: index });
}

async function runMain() {
  const apiKey = getApiKey();
  const model = getModel();
  if (!apiKey) {
    console.error("Missing Gemini API key. Set VITE_GEMINI_API_KEY or GEMINI_API_KEY in .env.");
    process.exit(1);
  }
  if (!fs.existsSync(PROMPT_PATH)) {
    console.error(`Prompt file not found: ${PROMPT_PATH}`);
    process.exit(1);
  }

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const maxWorkers = LESSONS.length;
  const configured = parseInt(process.env.WORKERS || "2", 10);
  const totalWorkers = Math.min(maxWorkers, Math.max(1, Number.isFinite(configured) ? configured : 4));

  console.log(`Using model: ${model}`);
  console.log(`Output dir: ${OUT_DIR}`);
  console.log(`Spawning ${totalWorkers} workers for ${LESSONS.length} lessons...`);

  const workerPromises = [];
  let hardFailures = 0;

  for (let i = 0; i < totalWorkers; i++) {
    workerPromises.push(
      new Promise((resolve) => {
        const worker = new Worker(new URL(import.meta.url), {
          workerData: {
            index: i,
            totalWorkers,
            lessons: LESSONS,
            promptPath: PROMPT_PATH,
            outDir: OUT_DIR,
            apiKey,
            model,
          },
        });

        worker.on("message", (msg) => {
          if (msg?.type === "info") {
            console.log(`[w${msg.worker}] ${msg.message}`);
          } else if (msg?.type === "ok") {
            console.log(`[w${msg.worker}] OK ${msg.lesson} -> ${path.basename(msg.file)}`);
          } else if (msg?.type === "error") {
            hardFailures += 1;
            console.error(`[w${msg.worker}] FAIL ${msg.lesson}: ${msg.error}`);
          }
        });

        worker.on("error", (err) => {
          hardFailures += 1;
          console.error(`[w${i}] Worker crash: ${err.message}`);
        });

        worker.on("exit", (code) => {
          if (code !== 0) {
            hardFailures += 1;
            console.error(`[w${i}] exited with code ${code}`);
          }
          resolve();
        });
      })
    );
  }

  await Promise.all(workerPromises);

  if (hardFailures > 0) {
    console.error(`Completed with ${hardFailures} failure(s). Check logs above.`);
    process.exit(1);
  }

  console.log("All requested lessons generated successfully.");
}

if (isMainThread) {
  runMain();
} else {
  runWorker();
}
