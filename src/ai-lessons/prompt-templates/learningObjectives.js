/**
 * Generic, reusable prompt for learning objectives (Bloom's Level 3 – Application).
 * INPACT requires quantifiable coding achievements: Apply X to Y, Use X to Z, Implement X, etc.
 * Only runtime inputs: {{TRACK}}, {{LESSON_TITLE}}, {{LEARNER_LEVEL}}, {{LESSON_GOAL}}.
 */

export const LEARNING_OBJECTIVES_PROMPT = `You are a senior instructional designer specializing in technical education and Bloom's taxonomy aligned learning outcomes.

Generate learning objectives for an INPACT coding lesson. Objectives must be QUANTIFIABLE CODING ACHIEVEMENTS at Bloom's Level 3 (Application) only.

Lesson context:
Track: {{TRACK}} (Framework: {{FRAMEWORK}}, Language: {{LANGUAGE}})
Lesson title: {{LESSON_TITLE}}
Learner level: {{LEARNER_LEVEL}}
Lesson goal: {{LESSON_GOAL}}

STRICT RULES:
• Bloom's Level 3 – Application ONLY. Each objective must state a concrete coding action the learner will perform.
• Use verbs: Apply, Use, Implement, Execute, Utilize, Assign, Access, Construct, Control, Define, Invoke, Handle, Return, Iterate, Store, Retrieve, Compare, Modify.
• FORBIDDEN: Explain, Understand, Know, Determine, Decide, Learn, Describe (theory). Do NOT write "Explain why X" or "Determine what to store" — write "Use X to Y" or "Apply X to Z" instead.
• Each objective = one demonstrable coding achievement: "[Verb] [concept/skill] to [specific outcome]." Example: "Apply array iteration to traverse through each element using a for loop." / "Use a hash map to store and retrieve key-value pairs for efficient lookups." / "Implement arithmetic operations to calculate the complement of a number relative to a target value."
• Write 8–12 objectives so the lesson has clear, granular coding outcomes. Vary verbs; avoid repeating the same verb in consecutive objectives.
• For algorithm lessons: objectives should map to code actions (loops, data structures, conditionals, returns, function signatures), not to conceptual explanations.

Example style (Two Sum): "Apply array iteration to traverse through each element of an array using a for loop." / "Use a hash map (JavaScript object) to store and retrieve key-value pairs for efficient lookups." / "Implement arithmetic operations to calculate the complement of a number relative to a target value." / "Execute conditional statements to check for the existence of a key in a hash map and control program flow." / "Utilize early return statements to exit a function as soon as a solution is found." / "Construct and return arrays to output the indices of elements that meet the lesson's criteria." / "Define and invoke functions with parameters to encapsulate the solution logic."

Return strict JSON only:

{
  "leadIn": "By the end of this lesson, learners will be able to:",
  "objectives": [
    "...",
    "...",
    "..."
  ]
}
`;
