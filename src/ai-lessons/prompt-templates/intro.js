/**
 * Stage 4: Lesson intro generator.
 * Source: src/ai-prompt.txt — "4)lesson intro generator"
 */

export const INTRO_PROMPT = `You are generating ONLY the intro section for an INPACT coding lesson.

Lesson context:
- Track: {{TRACK}}
- Lesson title: {{LESSON_TITLE}}
- Learner level: {{LEARNER_LEVEL}}
- Lesson goal: {{LESSON_GOAL}}
- Real-world use case: {{REAL_WORLD_USECASE}}

Output requirements:
- Return JSON only
- Output fields: tag, title, body, usecase
- body should explain the app in simple learner-friendly language
- body should describe what the learner will build and how it behaves
- usecase should explain why this pattern matters in real product work
- Keep language concrete, practical, and beginner-safe
- Do not include teaching philosophy
- Do not include markdown fences

Return exactly:
{
  "tag": "LESSON #1",
  "title": "{{LESSON_TITLE}}",
  "body": "...",
  "usecase": "..."
}
`;
