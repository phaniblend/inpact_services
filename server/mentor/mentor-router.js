/**
 * Mentor API router: GET /lessons, POST /start, POST /next.
 * Expects req.session (set by session middleware) for progress.
 */

import express from "express";
import {
  loadLessons,
  findLessonById,
  findStepById,
  getNextStep,
} from "./lesson-engine.js";

const router = express.Router();

router.get("/lessons", async (_req, res) => {
  try {
    const lessons = await loadLessons();
    const lessonList = lessons.map((l) => ({
      id: l.id,
      title: l.title,
      technology: l.technology,
      difficulty: l.difficulty,
      language: l.language,
      status: l.status,
      pattern: l.pattern,
      metadata: l.metadata,
    }));
    res.json({ lessons: lessonList });
  } catch (err) {
    console.error("[mentor] GET /lessons:", err);
    res.status(500).json({ error: "Failed to load lessons" });
  }
});

/** GET full lesson JSON by id (for engine-driven algo lessons). */
router.get("/lesson/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Lesson id required" });
    const lessons = await loadLessons();
    const lesson = findLessonById(lessons, id);
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });
    res.json(lesson);
  } catch (err) {
    console.error("[mentor] GET /lesson/:id:", err);
    res.status(500).json({ error: "Failed to load lesson" });
  }
});

router.post("/start", async (req, res) => {
  try {
    const { lessonId } = req.body || {};
    if (!lessonId) {
      return res.status(400).json({ error: "lessonId is required" });
    }
    const lessons = await loadLessons();
    const lesson = findLessonById(lessons, lessonId);
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }
    const firstStep = lesson.flow[0];
    if (!firstStep) {
      return res.status(500).json({ error: "Lesson has no steps" });
    }
    if (req.session) {
      req.session.lessonId = lessonId;
      req.session.currentStepId = firstStep.stepId;
    }
    res.json({ lessonId: lesson.id, step: firstStep });
  } catch (err) {
    console.error("[mentor] POST /start:", err);
    res.status(500).json({ error: "Failed to start lesson" });
  }
});

router.post("/next", async (req, res) => {
  try {
    const { lessonId, currentStepId, choiceLabel } = req.body || {};
    if (!lessonId || !currentStepId) {
      return res.status(400).json({ error: "Missing lessonId or currentStepId" });
    }
    const lessons = await loadLessons();
    const lesson = findLessonById(lessons, lessonId);
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }
    const currentStep = findStepById(lesson, currentStepId);
    if (!currentStep) {
      return res.status(404).json({ error: "Step not found" });
    }
    const nextStep = getNextStep(lesson, currentStep, choiceLabel);
    if (!nextStep) {
      if (req.session) {
        req.session.lessonId = null;
        req.session.currentStepId = null;
      }
      return res.json({ done: true });
    }
    if (req.session) {
      req.session.currentStepId = nextStep.stepId;
    }
    res.json({ lessonId: lesson.id, step: nextStep });
  } catch (err) {
    console.error("[mentor] POST /next:", err);
    res.status(500).json({ error: "Failed to advance lesson" });
  }
});

export default router;
