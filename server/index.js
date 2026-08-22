/**
 * Tiny AI proxy server — runs the lesson pipeline with server-side API key (no CORS, key never in browser).
 * Caches AI responses to disk (and memory) so responses persist across restarts and can be bundled with deploy.
 * Run: npm run server from project root. Loads .env from project root.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import dotenv from "dotenv";
import express from "express";
import { cacheGet, cacheSet, getCacheDir } from "./cache.js";
import { getContentLesson, getContentDir } from "./contentLoader.js";
import {
  generateLessonReal,
  generateLessonIntro,
  generateLessonObjectives,
  generateLessonStepsOnly,
  assembleLessonConfig,
} from "../src/ai-lessons/services/realLessonService.js";
import { validateCodeWithAI } from "../src/ai-lessons/services/codeValidationService.js";
import { annotateFeedbackOnCode } from "../src/ai-lessons/services/feedbackAnnotateService.js";
import { validateLessonConfig } from "../src/ai-lessons/schema.js";
import { completeWithAI } from "../src/ai-lessons/providers/aiProvider.js";
import { buildMentorSystemPrompt, OFF_TOPIC_PREFIX, OFF_TOPIC_FALLBACK } from "../src/ai-lessons/prompt-templates/mentorChat.js";
import cookieParser from "cookie-parser";
import mentorRouter from "./mentor/mentor-router.js";
import specforgeRouter from "./specforge-router.js";
import idRouter from "./id-router.js";
import assistMeRouter from "./assist-me-router.js";
import authRouter from "./auth-router.js";
import recruitRouter from "./recruit-router.js";
import { requireSession } from "./auth-session.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(rootDir, ".env") });

const app = express();
const PORT = Number(process.env.PORT) || 3000;

/** In-memory layer (fast); file cache is source of truth for persistence and bundling. */
const introCache = new Map();
const objectivesCache = new Map();
const stepsCache = new Map();
const lessonCache = new Map();
const validationCache = new Map();
const mentorCache = new Map();
const stepExampleCache = new Map();

function getCached(namespace, key) {
  const mem = {
    intro: introCache,
    objectives: objectivesCache,
    steps: stepsCache,
    lesson: lessonCache,
    validation: validationCache,
    mentor: mentorCache,
    "step-example": stepExampleCache,
  }[namespace];
  if (mem?.has(key)) return mem.get(key);
  const fromFile = cacheGet(namespace, key);
  if (fromFile != null && mem) mem.set(key, fromFile);
  return fromFile ?? null;
}

function setCached(namespace, key, value) {
  const mem = {
    intro: introCache,
    objectives: objectivesCache,
    steps: stepsCache,
    lesson: lessonCache,
    validation: validationCache,
    mentor: mentorCache,
    "step-example": stepExampleCache,
  }[namespace];
  if (mem) mem.set(key, value);
  cacheSet(namespace, key, value);
}

function hashKey(str) {
  return crypto.createHash("sha256").update(str, "utf8").digest("hex");
}

/** In-memory session store for mentor (algorithm) lessons only. sessionId -> { lessonId?, currentStepId? } */
const mentorSessions = new Map();
const MENTOR_COOKIE = "inpact_mentor_sid";
const MENTOR_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

function mentorSessionMiddleware(req, res, next) {
  let sessionId = null;
  const cookieHeader = req.headers.cookie || "";
  for (const part of cookieHeader.split(";")) {
    const [key, val] = part.trim().split("=");
    if (key === MENTOR_COOKIE && val) {
      sessionId = val;
      break;
    }
  }
  if (!sessionId || !mentorSessions.has(sessionId)) {
    sessionId = crypto.randomUUID();
    mentorSessions.set(sessionId, {});
    res.setHeader(
      "Set-Cookie",
      `${MENTOR_COOKIE}=${sessionId}; Path=/; Max-Age=${MENTOR_COOKIE_MAX_AGE}; HttpOnly; SameSite=Lax`
    );
  }
  req.session = mentorSessions.get(sessionId);
  next();
}

app.use(express.json());
app.use(cookieParser());

app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.options("/api/lessons/generate", (_req, res) => res.sendStatus(204));
app.options("/api/lessons/preview", (_req, res) => res.sendStatus(204));
app.options("/api/lessons/intro", (_req, res) => res.sendStatus(204));
app.options("/api/lessons/objectives", (_req, res) => res.sendStatus(204));
app.options("/api/lessons/validate", (_req, res) => res.sendStatus(204));
app.options("/api/lessons/mentor", (_req, res) => res.sendStatus(204));
app.options("/api/lessons/step-example", (_req, res) => res.sendStatus(204));
app.options("/api/lessons/feedback-annotate", (_req, res) => res.sendStatus(204));

app.use("/api/mentor", mentorSessionMiddleware, mentorRouter);
app.use("/api/specforge", specforgeRouter);
app.use("/api/id", idRouter);
app.use("/api/assist-me", assistMeRouter);
app.use("/api/auth", authRouter);
app.use("/api/recruit", recruitRouter);

/**
 * Authenticated pass-through to OneDev's REST API — replaces the old `/onedev-api` path, which
 * only ever existed as a Vite **dev-server** proxy (vite.config.js `server.proxy`) that forwarded
 * to OneDev with zero session check and injected the OneDev admin credentials on every request.
 * That's fine on localhost; it's a wide-open OneDev-admin hole the moment this is public. Any
 * signed-in user (any account type/role) may use this — OneDev's own per-project permissions are
 * the finer-grained boundary beyond "is this an internal, logged-in user at all." Credentials are
 * injected here, server-side, and never reach the browser.
 * Ops pages (PD Studio, Workbench, Cohorts, ModuleLibrary, ContributionMonitor, HuddleCalendar,
 * CD Review, HumanCapitalReports, MatchingQueue, Apply) call this the same generic way the old
 * `/onedev-api` path worked: `fetch(\`/api/onedev${onedevApiPath}\`, opts)`.
 */
app.use("/api/onedev", requireSession, async (req, res) => {
  try {
    const base = (process.env.ONEDEV_INTERNAL_URL || "http://localhost:6610").replace(/\/+$/, "");
    const target = `${base}/~api${req.url}`;
    const user = process.env.ONEDEV_API_USER || "";
    const pass = process.env.ONEDEV_API_PASS || "";
    const auth = "Basic " + Buffer.from(`${user}:${pass}`).toString("base64");
    const hasBody = !["GET", "HEAD"].includes(req.method);
    const upstream = await fetch(target, {
      method: req.method,
      headers: {
        Authorization: auth,
        Accept: "application/json",
        "Content-Type": req.headers["content-type"] || "application/json",
      },
      body: hasBody ? (typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {})) : undefined,
    });
    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/json");
    res.send(text);
  } catch (err) {
    console.error("[onedev-proxy] upstream error:", err.message);
    res.status(502).json({ error: "OneDev upstream error" });
  }
});

/**
 * Mattermost incoming-webhook pass-through — replaces the old `/mattermost-api` Vite-dev-only
 * proxy. No session gate: the webhook URL/id itself is the credential (write-only, narrowly
 * scoped to posting into one channel), same design note as src/team-messaging/notify.js.
 */
app.use("/api/mattermost", async (req, res) => {
  try {
    const base = (process.env.MATTERMOST_INTERNAL_URL || "http://localhost:8065").replace(/\/+$/, "");
    const target = `${base}${req.url}`;
    const hasBody = !["GET", "HEAD"].includes(req.method);
    const upstream = await fetch(target, {
      method: req.method,
      headers: { "Content-Type": req.headers["content-type"] || "application/json" },
      body: hasBody ? (typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {})) : undefined,
    });
    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/json");
    res.send(text);
  } catch (err) {
    console.error("[mattermost-proxy] upstream error:", err.message);
    res.status(502).json({ error: "Mattermost upstream error" });
  }
});

/** Resolve AI API key from env. DeepSeek only. */
function getAIOptions() {
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY;
  return { apiKey, provider: "deepseek" };
}

function summarizeDeepSeekError(err) {
  const message = err instanceof Error ? err.message : String(err || "");
  const status = typeof err?.status === "number" ? err.status : null;
  const lower = message.toLowerCase();
  const isAuth = status === 401 || status === 403 || /\b(invalid api key|unauthorized|forbidden)\b/i.test(message);
  const isQuota = /\b(insufficient|quota|credit|billing|balance)\b/i.test(message);
  const isRateLimit = status === 429 || /\b429|rate limit|too many requests\b/i.test(lower);
  const isServer = status != null && status >= 500;
  const category = isAuth
    ? "auth-invalid-or-revoked-key"
    : isQuota
      ? "quota-or-credits-exhausted"
      : isRateLimit
        ? "rate-limited"
        : isServer
          ? "deepseek-server-error"
          : "unknown";
  return { status, category, message };
}

function getLessonParams(req) {
  const { track, lessonTitle, lessonIndex, learnerLevel, lessonGoal, realWorldUseCase } = req.body || {};
  if (track == null || lessonTitle == null || lessonIndex == null) {
    return { error: "Missing track, lessonTitle, or lessonIndex" };
  }
  return {
    params: {
      track: String(track),
      lessonTitle: String(lessonTitle),
      lessonIndex: Number(lessonIndex),
      ...(learnerLevel != null && { learnerLevel: String(learnerLevel) }),
      ...(lessonGoal != null && { lessonGoal: String(lessonGoal) }),
      ...(realWorldUseCase != null && { realWorldUseCase: String(realWorldUseCase) }),
    },
    genKey: `${String(track)}:${String(lessonTitle)}:${Number(lessonIndex)}`,
  };
}

function stripCodeFences(text) {
  let s = String(text || "").trim();
  const m = /^```(?:tsx?|jsx?|typescript|javascript|ts)?\s*\r?\n([\s\S]*?)\r?\n```\s*$/im.exec(s);
  if (m) s = m[1].trim();
  return s;
}

function normalizeLessonText(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Avoid using content JSON when the same step id refers to a different task (engine vs alternate curriculum). */
function tasksLikelySameContentStep(contentStep, learnerTask) {
  const a = normalizeLessonText(learnerTask);
  const b = normalizeLessonText(contentStep?.instruction || contentStep?.paal || contentStep?.title || "");
  if (!a || !b) return true;
  const words = (t) => new Set(t.split(/\W+/).filter((w) => w.length > 3));
  const wa = words(a);
  const wb = words(b);
  let overlap = 0;
  for (const w of wa) if (wb.has(w)) overlap++;
  const min = Math.min(wa.size, wb.size);
  if (min === 0) return true;
  return overlap / min >= 0.28;
}

/** Prefer curated step text from content/<track>/*_lesson.json before cache/DeepSeek. */
function findStepExampleInContentLesson(track, lessonIndex, stepId, learnerTask) {
  if (track == null || lessonIndex == null || !stepId) return null;
  const contentLesson = getContentLesson(String(track), Number(lessonIndex));
  const steps = contentLesson?.config?.steps;
  if (!Array.isArray(steps)) return null;
  const step = steps.find((s) => s && (s.id === stepId || s.id === String(stepId)));
  if (!step) return null;
  if (learnerTask && !tasksLikelySameContentStep(step, learnerTask)) return null;
  const raw = step.ai_example_code || step.analogousExample;
  if (typeof raw !== "string" || !raw.trim()) return null;
  const meta = step.ai_example_meta && typeof step.ai_example_meta === "object" ? step.ai_example_meta : {};
  return {
    code: stripCodeFences(raw),
    source: "lesson-json",
    meta: {
      exampleOrigin: meta.exampleOrigin || "lesson-json",
      fetchedAfter: meta.fetchedAfter || null,
      policyNote:
        "Promote from DeepSeek cache into this step as ai_example_code + ai_example_meta { exampleOrigin: 'deepseek', fetchedAfter } (on or after 2026-03-28).",
    },
  };
}

/**
 * Show-me example: lesson JSON → disk cache → DeepSeek. Cached for all learners (key includes lessonKey + step + task).
 */
app.post("/api/lessons/step-example", async (req, res) => {
  const body = req.body || {};
  const {
    lessonKey,
    track,
    lessonIndex,
    lessonTitle,
    stepId,
    paal,
    instruction,
    hint,
    seedCode,
    language,
    lessonDisplayTitle,
  } = body;

  if (!stepId) {
    res.status(400).json({ error: "Missing stepId" });
    return;
  }
  const task = String(paal || instruction || "").trim();
  if (!task) {
    res.status(400).json({ error: "Missing paal or instruction" });
    return;
  }

  const fromContent = findStepExampleInContentLesson(track, lessonIndex, stepId, task);
  if (fromContent) {
    res.json({
      success: true,
      code: fromContent.code,
      source: fromContent.source,
      meta: fromContent.meta,
      cacheHit: false,
    });
    return;
  }

  const cacheKey = [
    lessonKey || "",
    track || "",
    String(lessonIndex ?? ""),
    String(stepId),
    task,
    String(hint || ""),
  ].join("\n");
  const cached = getCached("step-example", cacheKey);
  if (cached && typeof cached.code === "string" && cached.code.trim()) {
    res.json({
      success: true,
      code: cached.code.trim(),
      source: cached.source || "deepseek",
      meta: cached.meta || {},
      cacheHit: true,
    });
    return;
  }

  const { apiKey, provider } = getAIOptions();
  if (!apiKey) {
    res.status(500).json({ error: "DEEPSEEK_API_KEY not set on server" });
    return;
  }

  const system = `You are a React + TypeScript tutor. Output ONLY TypeScript/TSX source code. No markdown fences. Use brief // comments only if needed.`;

  const user = `Lesson: ${lessonDisplayTitle || lessonTitle || "React TS"}
Step: ${stepId}
Task:\n${task}
Hint: ${hint || "(none)"}
Editor starter (may be empty shell):\n${typeof seedCode === "string" ? seedCode : "(none)"}

Write ONE analogous example: teach the SAME pattern as the task using DIFFERENT identifiers (not copy-paste of their exact names). If the starter is an empty export default function, output a complete file (imports + component) with the new lines inside the component body.

Language: ${language || "typescript"}.`;

  try {
    const raw = await completeWithAI({ system, user, maxTokens: 1200, apiKey, provider });
    const code = stripCodeFences(raw);
    if (!code) {
      res.status(500).json({ error: "Model returned empty example" });
      return;
    }
    const payload = {
      success: true,
      code,
      source: "deepseek",
      cacheHit: false,
      meta: {
        exampleOrigin: "deepseek",
        cachedAt: new Date().toISOString(),
        fetchedAfter: "2026-03-28",
        policyNote:
          "Generated on or after 2026-03-28. Check in as lesson JSON: ai_example_code + ai_example_meta.",
      },
    };
    setCached("step-example", cacheKey, payload);
    res.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[AI server] step-example error:", message);
    res.status(500).json({ success: false, error: message });
  }
});

/** Sequential call 1: intro only (description + why it matters). Content first, then cache, then AI. */
app.post("/api/lessons/intro", async (req, res) => {
  const { params, genKey, error } = getLessonParams(req);
  if (error) return res.status(400).json({ error });
  const contentLesson = getContentLesson(params.track, params.lessonIndex);
  if (contentLesson?.config?.intro) {
    const intro = contentLesson.config.intro;
    return res.json({
      success: true,
      intro: typeof intro === "object" ? intro : { body: "", tag: "", title: "", usecase: "" },
      track: params.track,
      lessonTitle: params.lessonTitle,
      lessonIndex: params.lessonIndex,
    });
  }
  const { apiKey, provider } = getAIOptions();
  if (!apiKey) {
    res.status(500).json({ error: "DEEPSEEK_API_KEY not set on server" });
    return;
  }
  const cached = getCached("intro", genKey);
  if (cached) return res.json(cached);
  try {
    const result = await generateLessonIntro(params, { apiKey, provider });
    const payload = { success: true, ...result };
    setCached("intro", genKey, payload);
    res.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[AI server] intro error:", message);
    res.status(500).json({ success: false, error: message });
  }
});

/** Sequential call 2: learning objectives only. Content first, then cache, then AI. */
app.post("/api/lessons/objectives", async (req, res) => {
  const { params, genKey, error } = getLessonParams(req);
  if (error) return res.status(400).json({ error });
  const contentLesson = getContentLesson(params.track, params.lessonIndex);
  if (contentLesson?.config && Array.isArray(contentLesson.config.objectives)) {
    return res.json({
      success: true,
      leadIn: "After completing this lesson, you will be able to:",
      objectives: contentLesson.config.objectives,
      track: params.track,
      lessonTitle: params.lessonTitle,
      lessonIndex: params.lessonIndex,
    });
  }
  const { apiKey, provider } = getAIOptions();
  if (!apiKey) {
    res.status(500).json({ error: "DEEPSEEK_API_KEY not set on server" });
    return;
  }
  const cached = getCached("objectives", genKey);
  if (cached) return res.json(cached);
  try {
    const result = await generateLessonObjectives(params, { apiKey, provider });
    const payload = { success: true, ...result };
    setCached("objectives", genKey, payload);
    res.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[AI server] objectives error:", message);
    res.status(500).json({ success: false, error: message });
  }
});

/** Legacy: preview = intro + objectives in one (for clients that still call preview). Content first, then cached intro+objectives. */
app.post("/api/lessons/preview", async (req, res) => {
  const { apiKey, provider } = getAIOptions();
  if (!apiKey) {
    res.status(500).json({ error: "DEEPSEEK_API_KEY not set on server" });
    return;
  }
  const { params, genKey, error } = getLessonParams(req);
  if (error) return res.status(400).json({ error });
  const contentLesson = getContentLesson(params.track, params.lessonIndex);
  if (contentLesson?.config) {
    const intro = contentLesson.config.intro ?? {};
    const objectivesList = Array.isArray(contentLesson.config.objectives) ? contentLesson.config.objectives : [];
    return res.json({
      success: true,
      intro: typeof intro === "object" ? intro : { body: "", tag: "", title: "", usecase: "" },
      leadIn: "After completing this lesson, you will be able to:",
      objectives: objectivesList,
      track: params.track,
      lessonTitle: params.lessonTitle,
      lessonIndex: params.lessonIndex,
    });
  }
  const introCached = getCached("intro", genKey);
  const objCached = getCached("objectives", genKey);
  if (introCached && objCached) {
    return res.json({
      success: true,
      intro: introCached.intro,
      leadIn: objCached.leadIn ?? "After completing this lesson, you will be able to:",
      objectives: objCached.objectives,
      track: params.track,
      lessonTitle: params.lessonTitle,
      lessonIndex: params.lessonIndex,
    });
  }
  const opts = { apiKey, provider };
  try {
    let intro = introCached?.intro;
    let objectives = objCached?.objectives;
    let leadIn = objCached?.leadIn ?? "After completing this lesson, you will be able to:";
    if (!intro) {
      const r = await generateLessonIntro(params, opts);
      intro = r.intro;
      setCached("intro", genKey, { success: true, ...r });
    }
    if (!objectives) {
      const r = await generateLessonObjectives(params, opts);
      objectives = r.objectives;
      leadIn = r.leadIn ?? leadIn;
      setCached("objectives", genKey, { success: true, ...r });
    }
    res.json({ success: true, intro, leadIn, objectives, track: params.track, lessonTitle: params.lessonTitle, lessonIndex: params.lessonIndex });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[AI server] preview error:", message);
    res.status(500).json({ success: false, error: message });
  }
});

app.post("/api/lessons/validate", async (req, res) => {
  const { apiKey, provider } = getAIOptions();
  if (!apiKey) {
    res.status(500).json({ error: "DEEPSEEK_API_KEY not set on server" });
    return;
  }
  const { step, userCode, language, track } = req.body || {};
  if (!step || userCode == null) {
    res.status(400).json({ error: "Missing step or userCode" });
    return;
  }
  const lang = language || "javascript";
  // Bump v when validation prompt/rules change so old cache entries are bypassed (e.g. interface placement rules)
  const VALIDATION_CACHE_VERSION = 11;
  const sc = step.successCriteria;
  const criteriaKey = Array.isArray(sc) ? sc.join("|") : String(sc || "");
  const kw = step.answer_keywords;
  const keywordsKey = Array.isArray(kw) ? kw.join("|") : "";
  const cacheKey = hashKey(
    JSON.stringify({
      v: VALIDATION_CACHE_VERSION,
      track: track || "",
      id: step.id || "",
      i: step.instruction || step.paal,
      criteria: criteriaKey,
      k: keywordsKey,
      s: step.seedCode || step.seed_code,
      c: String(userCode),
      l: lang,
    })
  );
  const cached = getCached("validation", cacheKey);
  if (cached) {
    if (cached?.result === "correct") {
      return res.json({
        ...cached,
        feedback: "Nice job. This exact code is already validated for this step.",
      });
    }
    return res.json(cached);
  }
  try {
    const result = await validateCodeWithAI(step, String(userCode), { apiKey, language: lang, provider, track });
    // Only cache when DeepSeek (or provider) marked the code as correct — wrong/partial always re-validated
    if (result && result.result === "correct") {
      setCached("validation", cacheKey, result);
    }
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[AI server] validate error:", message);
    res.status(500).json({ error: message });
  }
});

/** Map validation feedback onto the learner's code (inline comments) via DeepSeek. */
app.post("/api/lessons/feedback-annotate", async (req, res) => {
  const { apiKey, provider } = getAIOptions();
  const { instruction, feedback, hint, userCode, language } = req.body || {};
  if (userCode == null) {
    res.status(400).json({ error: "Missing userCode" });
    return;
  }
  if (!apiKey) {
    console.warn(
      `[AI server] feedback-annotate fallback: missing API key. env(DEEPSEEK_API_KEY)=${
        process.env.DEEPSEEK_API_KEY ? "set" : "NOT SET"
      }, env(VITE_DEEPSEEK_API_KEY)=${process.env.VITE_DEEPSEEK_API_KEY ? "set" : "NOT SET"}`
    );
    const fb = String(feedback || "").trim();
    const h = String(hint || "").trim();
    const base = fb || h || "Review the step requirements and add the missing required pattern.";
    const safe = base.replace(/\r?\n+/g, " ").trim();
    const coach = `On this line you started the solution — but you still need: ${safe}`;
    return res.json({
      annotatedCode: `// ${coach}\n${String(userCode)}`,
      note: "fallback-without-ai-key",
    });
  }
  try {
    const result = await annotateFeedbackOnCode(
      {
        instruction: instruction != null ? String(instruction) : "",
        feedback: feedback != null ? String(feedback) : "",
        hint: hint != null ? String(hint) : "",
        userCode: String(userCode),
        language: language != null ? String(language) : "typescript",
      },
      { apiKey, provider }
    );
    res.json(result);
  } catch (err) {
    const summary = summarizeDeepSeekError(err);
    console.error(
      `[AI server] feedback-annotate error: category=${summary.category}, status=${
        summary.status ?? "n/a"
      }, message=${summary.message}`
    );
    const userSafeMessage =
      summary.category === "auth-invalid-or-revoked-key"
        ? "DeepSeek rejected the API key (401/403). Key may be invalid or revoked."
        : summary.category === "quota-or-credits-exhausted"
          ? "DeepSeek quota/credits appear exhausted. Check account balance/billing."
          : summary.category === "rate-limited"
            ? "DeepSeek rate limit hit (429). Please retry in a moment."
            : summary.message;
    res.status(500).json({ error: userSafeMessage });
  }
});

/** Ask your mentor — step-scoped live chat with DeepSeek. Transcripts cached by (lessonKey, stepId, normalizedMessage) to reduce cost. */
const MENTOR_CACHE_VERSION = 1;
function normalizeMentorMessage(msg) {
  if (typeof msg !== "string") return "";
  return msg.trim().toLowerCase().replace(/\s+/g, " ");
}
app.post("/api/lessons/mentor", async (req, res) => {
  const { apiKey, provider } = getAIOptions();
  if (!apiKey) {
    res.status(500).json({ error: "DEEPSEEK_API_KEY not set on server" });
    return;
  }
  const { step, userMessage, track, lessonKey } = req.body || {};
  if (!step || userMessage == null) {
    res.status(400).json({ error: "Missing step or userMessage" });
    return;
  }
  const instruction = step.instruction || step.paal || "";
  const stepId = step.id || "";
  const normalized = normalizeMentorMessage(userMessage);
  const categoryKey = [MENTOR_CACHE_VERSION, lessonKey || "", stepId, normalized].join("\n");
  const cacheKey = hashKey(categoryKey);
  const cached = getCached("mentor", cacheKey);
  if (cached && typeof cached.reply === "string") {
    return res.json({ reply: cached.reply });
  }
  function gentleOffTopicReply() {
    const topicHint = instruction.slice(0, 80).trim() || "this step";
    return `${OFF_TOPIC_PREFIX} Try asking something about ${topicHint}.`;
  }

  try {
    const system = buildMentorSystemPrompt(instruction, stepId);
    const reply = await completeWithAI({
      system,
      user: String(userMessage).trim(),
      maxTokens: 512,
      apiKey,
      provider,
    });
    let replyText = (reply && String(reply).trim()) || "";
    if (!replyText || /not\s+found|i\s+don'?t\s+know|i'?m\s+not\s+sure|cannot\s+find/i.test(replyText)) {
      replyText = gentleOffTopicReply();
    }
    setCached("mentor", cacheKey, { reply: replyText });
    res.json({ reply: replyText });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[AI server] mentor error:", message);
    res.status(200).json({ reply: OFF_TOPIC_FALLBACK });
  }
});

/** Full lesson: content file first, then cache, then AI. Content under content/<track>/ is used before any API call. */
app.post("/api/lessons/generate", async (req, res) => {
  const { params, genKey, error } = getLessonParams(req);
  if (error) return res.status(400).json({ error });

  const contentLesson = getContentLesson(params.track, params.lessonIndex);
  if (contentLesson) return res.json(contentLesson);

  const { apiKey, provider } = getAIOptions();
  if (!apiKey) {
    res.status(500).json({ error: "DEEPSEEK_API_KEY not set on server" });
    return;
  }
  const fullCached = getCached("lesson", genKey);
  if (fullCached) return res.json(fullCached);

  const opts = { apiKey, provider };
  try {
    let introPayload = getCached("intro", genKey);
    if (!introPayload) {
      const r = await generateLessonIntro(params, opts);
      introPayload = { success: true, ...r };
      setCached("intro", genKey, introPayload);
    }
    let objectivesPayload = getCached("objectives", genKey);
    if (!objectivesPayload) {
      const r = await generateLessonObjectives(params, opts);
      objectivesPayload = { success: true, ...r };
      setCached("objectives", genKey, objectivesPayload);
    }
    let stepsPayload = getCached("steps", genKey);
    if (!stepsPayload) {
      const r = await generateLessonStepsOnly(params, opts);
      stepsPayload = { success: true, ...r };
      setCached("steps", genKey, stepsPayload);
    }
    const config = assembleLessonConfig(
      introPayload.intro,
      objectivesPayload.objectives,
      stepsPayload,
      params
    );
    const validated = validateLessonConfig(config);
    if (!validated.success) {
      res.status(500).json({ error: "Validation failed: " + validated.error.message });
      return;
    }
    const payload = { success: true, config: validated.data, source: "real" };
    setCached("lesson", genKey, payload);
    res.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[AI server] generate error:", message);
    res.status(500).json({ success: false, error: message });
  }
});

/**
 * Production: serve Vite `dist/` from the same process as `/api` so POST /api/lessons/* works on one host.
 * (A static-only host like Caddy often returns 405 for POST to /api.)
 * When `dist/index.html` exists (e.g. after `npm run build`), static assets + SPA fallback are enabled.
 */
const distDir = path.join(rootDir, "dist");
const distIndexHtml = path.join(distDir, "index.html");
if (fs.existsSync(distIndexHtml)) {
  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    if (req.path.startsWith("/api")) return next();
    res.sendFile(distIndexHtml, (err) => {
      if (err) next(err);
    });
  });
}
const servingStatic = fs.existsSync(distIndexHtml);

const server = app.listen(PORT, () => {
  const { apiKey, provider } = getAIOptions();
  const keyName = "DEEPSEEK_API_KEY";
  console.log(
    `AI lesson server at http://localhost:${PORT} (POST /api/lessons/intro, /objectives, /generate, /preview, /validate, /step-example, /feedback-annotate)`
  );
  if (servingStatic) {
    console.log(`Also serving SPA from ${distDir} (same origin as /api — use one Node service in production).`);
  }
  console.log(`Content: ${getContentDir()} (checked before cache/API). Cache: ${getCacheDir()}. AI_PROVIDER=${provider}, ${keyName}: ${apiKey ? "set" : "NOT SET"}`);
});

server.on("error", (err) => {
  console.error("[AI server] Failed to start:", err.message);
  if (err.code === "EADDRINUSE") console.error(`Port ${PORT} is in use. Try PORT=3001 npm run server`);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("[AI server] Uncaught exception:", err);
});
process.on("unhandledRejection", (reason, p) => {
  console.error("[AI server] Unhandled rejection:", reason);
});
