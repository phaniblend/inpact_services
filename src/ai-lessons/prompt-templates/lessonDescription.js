/**
 * Generic, reusable prompt for lesson description.
 * Only runtime inputs: {{TRACK}}, {{LESSON_TITLE}}, {{LEARNER_LEVEL}}, {{LESSON_GOAL}}.
 */

export const LESSON_DESCRIPTION_PROMPT = `You are a senior instructional designer creating course material for software engineering students.

Generate a lesson description for a coding lesson.

Lesson context:
Track: {{TRACK}} (Framework: {{FRAMEWORK}}, Language: {{LANGUAGE}}, file mode: {{FILE_MODE}})
Lesson title: {{LESSON_TITLE}}
Learner level: {{LEARNER_LEVEL}}
Lesson goal: {{LESSON_GOAL}}

Requirements:
• Explain what the learner will build.
• Explain the core programming concept used.
• Mention the main technologies or constructs involved.
• Keep the language beginner friendly but technically accurate.
• Length: 4–6 sentences.

Return strict JSON only:

{
  "lessonDescription": "..."
}
`;
