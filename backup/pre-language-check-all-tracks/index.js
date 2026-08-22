/**
 * Tiny AI proxy server — runs the lesson pipeline with server-side API key (no CORS, key never in browser).
 * Caches AI responses to disk (and memory) so responses persist across restarts and can be bundled with deploy.
 * Run: npm run server from project root. Loads .env from project root.
 */

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
import { validateLessonConfig } from "../src/ai-lessons/schema.js";
import { completeWithAI } from "../src/ai-lessons/providers/aiProvider.js";
import { buildMentorSystemPrompt, OFF_TOPIC_PREFIX, OFF_TOPIC_FALLBACK } from "../src/ai-lessons/prompt-templates/mentorChat.js";
import mentorRouter from "./mentor/mentor-router.js";

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

function getCached(namespace, key) {
  const mem = { intro: introCache, objectives: objectivesCache, steps: stepsCache, lesson: lessonCache, validation: validationCache, mentor: mentorCache }[namespace];
  if (mem?.has(key)) return mem.get(key);
  const fromFile = cacheGet(namespace, key);
  if (fromFile != null && mem) mem.set(key, fromFile);
  return fromFile ?? null;
}

function setCached(namespace, key, value) {
  const mem = { intro: introCache, objectives: objectivesCache, steps: stepsCache, lesson: lessonCache, validation: validationCache, mentor: mentorCache }[namespace];
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

app.use("/api/mentor", mentorSessionMiddleware, mentorRouter);

/** Resolve AI API key from env. DeepSeek only. */
function getAIOptions() {
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY;
  return { apiKey, provider: "deepseek" };
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
  const VALIDATION_CACHE_VERSION = 7;
  const cacheKey = hashKey(
    JSON.stringify({
      v: VALIDATION_CACHE_VERSION,
      track: track || "",
      i: step.instruction || step.paal,
      s: step.seedCode || step.seed_code,
      c: String(userCode),
      l: lang,
    })
  );
  const cached = getCached("validation", cacheKey);
  if (cached) {
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

const server = app.listen(PORT, () => {
  const { apiKey, provider } = getAIOptions();
  const keyName = "DEEPSEEK_API_KEY";
  console.log(`AI lesson server at http://localhost:${PORT} (POST /api/lessons/intro, /objectives, /generate, /preview, /validate)`);
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
