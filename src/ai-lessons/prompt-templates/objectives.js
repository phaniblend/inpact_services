/**
 * Stage 3: Lesson-level objectives generator.
 * Source: src/ai-prompt.txt — "3)lesson-level objective generator"
 */

export const OBJECTIVES_PROMPT = `You are generating ONLY the lesson objectives for an INPACT coding lesson.

Lesson context:
- Track: {{TRACK}}
- Lesson title: {{LESSON_TITLE}}
- Learner level: {{LEARNER_LEVEL}}
- Lesson goal: {{LESSON_GOAL}}

Output requirements:
- Return JSON only
- Output field: "objectives"
- objectives must be an array of strings
- Write 5 to 9 objectives
- Each objective must use a clear, observable, actionable verb
- Use measurable learning language
- Prefer Bloom's taxonomy around Apply / Implement / Use / Construct / Connect
- Avoid vague verbs like: understand, know, learn, become familiar with
- Each objective should describe something the learner can demonstrably do by the end
- Objectives must align with actual lesson tasks
- Keep objectives specific to this lesson
- Avoid redundancy

Return exactly this shape:
{
  "objectives": [
    "...",
    "..."
  ]
}
`;
