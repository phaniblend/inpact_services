/**
 * Mock lesson generation service — returns a valid lesson config without calling any AI API.
 * Use for testing the pipeline and UI. Replace with real API in lessonOrchestrator when ready.
 */

import { lessonConfigSchema } from "../schema.js";

/**
 * Mock preview (intro + objectives only). Returns quickly for progressive disclosure.
 * @param {{ track: string, lessonTitle: string, lessonIndex: number }} params
 * @returns {Promise<{ intro: object, leadIn: string, objectives: string[], track: string, lessonTitle: string, lessonIndex: number }>}
 */
export async function generateLessonPreviewMock({ track, lessonTitle, lessonIndex }) {
  await new Promise((r) => setTimeout(r, 300));
  const lessonNum = lessonIndex + 1;
  return {
    intro: {
      tag: `LESSON #${lessonNum}`,
      title: lessonTitle,
      body: `This is a mock lesson for "${lessonTitle}" on track ${track}. You'll build it step by step.`,
      usecase: "Mock lesson for testing the pipeline.",
    },
    leadIn: "After completing this lesson, you will be able to:",
    objectives: [
      "Complete the steps in order",
      "Use the seed code as a starting point",
      "Check your code to see feedback",
    ],
    track,
    lessonTitle,
    lessonIndex,
  };
}

/**
 * @param {{ track: string, lessonTitle: string, lessonIndex: number }} params
 * @returns {Promise<import("../schema.js").z.infer<typeof lessonConfigSchema>>}
 */
export async function generateLessonMock({ track, lessonTitle, lessonIndex }) {
  await new Promise((r) => setTimeout(r, 800));

  const lessonNum = lessonIndex + 1;
  const pad = String(lessonNum).padStart(2, "0");

  const config = {
    lessonId: `ai-${track}-${pad}`,
    track,
    lessonNum,
    title: lessonTitle,
    shortName: `P${pad}`,
    intro: {
      tag: `LESSON #${lessonNum}`,
      title: lessonTitle,
      body: `This is a mock AI-generated lesson for "${lessonTitle}" on track ${track}. Build the steps as described.`,
      usecase: "Mock lesson for testing the AI pipeline and shared renderer.",
    },
    objectives: [
      "Complete the steps in order",
      "Use the seed code as a starting point",
      "Check your code to see feedback",
    ],
    steps: [
      {
        id: "step1",
        type: "question",
        phase: "Step 1 of 2",
        title: "Setup",
        instruction: "Set up the initial state or structure for this lesson.",
        hint: "Use the seed code below as your starting point.",
        analogousExample: "// Example: const [value, setValue] = useState(0)",
        seedCode: `import { useState } from 'react'\n\nexport default function App() {\n  // Step 1: your code here\n}`,
        expectedOutcome: "Initial structure in place.",
        successCriteria: ["Has valid React component", "Uses seed code as base"],
        feedbackCorrect: "✅ Step 1 complete.",
        feedbackPartial: "Almost — check the seed code.",
        feedbackWrong: "Start from the seed code and add the required structure.",
        evaluation: { mode: "keyword_match", required: ["usestate", "export", "default"], partialThreshold: 0.5, correctThreshold: 0.8 },
        answer_keywords: ["usestate", "export", "default"],
      },
      {
        id: "step2",
        type: "question",
        phase: "Step 2 of 2",
        title: "Complete",
        instruction: "Complete the lesson goal and export the component.",
        hint: "Ensure your component matches the lesson goal.",
        seedCode: `import { useState } from 'react'\n\nexport default function App() {\n  // Your code here\n}`,
        feedbackCorrect: "✅ Lesson complete.",
        feedbackPartial: "Almost there.",
        feedbackWrong: "Review the lesson goal and try again.",
        evaluation: { mode: "keyword_match", required: ["return", "export"], partialThreshold: 0.5, correctThreshold: 0.8 },
        answer_keywords: ["return", "export"],
      },
    ],
    sideItems: [
      { id: "intro", label: "Intro" },
      { id: "objectives", label: "Objectives" },
      { id: "step1", label: "Step 1" },
      { id: "step2", label: "Step 2" },
    ],
  };

  const parsed = lessonConfigSchema.safeParse(config);
  if (!parsed.success) throw new Error("Mock lesson failed validation: " + parsed.error.message);
  return parsed.data;
}
