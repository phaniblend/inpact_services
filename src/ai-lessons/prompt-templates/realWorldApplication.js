/**
 * Generic, reusable prompt for real-world application ("Why it matters").
 * Only runtime inputs: {{TRACK}}, {{LESSON_TITLE}}, {{LESSON_GOAL}}, {{REAL_WORLD_USECASE}}.
 */

export const REAL_WORLD_APPLICATION_PROMPT = `You are a senior instructional designer writing the real-world relevance section for a coding lesson.

Lesson context:
Track: {{TRACK}} (Framework: {{FRAMEWORK}}, Language: {{LANGUAGE}})
Lesson title: {{LESSON_TITLE}}
Lesson goal: {{LESSON_GOAL}}
Real-world use case hint: {{REAL_WORLD_USECASE}}

Requirements:
• Explain where this programming pattern appears in real software products.
• Provide concrete UI or product examples such as dashboards, forms, menus, filters, panels, modals, etc.
• Focus on practical developer scenarios.
• Length: 3–5 sentences.

Return strict JSON only:

{
  "realWorldApplication": "..."
}
`;
