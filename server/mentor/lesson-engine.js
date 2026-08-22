/**
 * Lesson engine — algorithms only (from mentor/lessons/*.json).
 * Same API as APT Learn: loadLessons, findLessonById, findStepById, getNextStep.
 * Lesson JSON format unchanged (flow with mentorSays, choices, example, next).
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../..");
const LESSONS_DIR = path.join(rootDir, "mentor", "lessons");

/**
 * Load algorithm lessons from mentor/lessons/*.json only (no React/Angular/Vue from lessonGen).
 */
export async function loadLessons() {
  const allLessons = [];
  if (!fs.existsSync(LESSONS_DIR)) return allLessons;

  const files = fs
    .readdirSync(LESSONS_DIR)
    .filter((f) => f.endsWith(".json") && f !== "algorithm-list.json");

  for (const file of files) {
    try {
      const filePath = path.join(LESSONS_DIR, file);
      const raw = fs.readFileSync(filePath, "utf-8");
      const lesson = JSON.parse(raw);
      allLessons.push(lesson);
    } catch (err) {
      console.warn(`[mentor] Failed to load lesson from ${file}:`, err.message);
    }
  }

  return allLessons;
}

export function findLessonById(lessons, lessonId) {
  return lessons.find((l) => l.id === lessonId);
}

export function findStepById(lesson, stepId) {
  if (!lesson?.flow) return null;
  return lesson.flow.find((s) => s.stepId === stepId);
}

/**
 * Get next step: choice-based, then explicit next, then linear.
 */
export function getNextStep(lesson, currentStep, choiceLabel) {
  if (currentStep.choices && choiceLabel) {
    const choice = currentStep.choices.find((c) => c.label === choiceLabel);
    if (!choice) return null;
    return findStepById(lesson, choice.next);
  }
  if (currentStep.next) {
    return findStepById(lesson, currentStep.next);
  }
  const index = lesson.flow.findIndex((s) => s.stepId === currentStep.stepId);
  if (index === -1) return null;
  return lesson.flow[index + 1] || null;
}
