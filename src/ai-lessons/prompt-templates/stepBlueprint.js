/**
 * Stage 5: Step blueprint generator (ordered step list before details).
 * Enforces strict dependency ordering so no step references a concept introduced later.
 */

export const STEP_BLUEPRINT_PROMPT = `You are generating ONLY the step blueprint for an INPACT coding lesson.

Lesson context:
- Track: {{TRACK}} (Framework: {{FRAMEWORK}}, Language: {{LANGUAGE}}, file mode: {{FILE_MODE}})
- Lesson title: {{LESSON_TITLE}}
- Learner level: {{LEARNER_LEVEL}}
- Final desired app behavior / lesson goal: {{LESSON_GOAL}}

Language and code rules (CRITICAL — all generated step titles and expected actions must match this track):
{{SYNTAX_RULES}}
- All seed code, examples, and instructions in step details must use {{LANGUAGE}} and {{FILE_MODE}} only. For React TypeScript: use .tsx and TypeScript types; for React JavaScript: use .jsx and no type annotations.

CRITICAL RULE — Dependency Ordering (no use-before-define)

Steps MUST appear only after all concepts they depend on have already been introduced.
Do not allow a step to use a concept that has not yet been introduced.

NEVER reference a variable, state, or handler before the step that introduces it. For example:
- Do NOT have a step "Define handleToggle that toggles isActive" unless a prior step has already introduced isActive (e.g. "Initialize isActive state with useState").
- Do NOT ask to "wire the button to setCount" before a step that initializes count state.
- Order: introduce state first → then handlers that use that state → then markup/UI that uses handlers. Every identifier used in a step must exist in the code built by earlier steps.

Follow this conceptual dependency order when applicable (React/TS, React JS, Vue, Angular with components):
1. Imports — ONE PACKAGE (or one logical group) PER STEP. Seed may include imports for short lessons.
2. State, types, interfaces, typed stubs — all data the UI will need before JSX that depends on it.
3. Return JSX structure — layout, **buttons**, **inputs**, and copy; **omit** onClick/onChange (or template (click)) until a dedicated wiring step unless the lesson is intentionally one-step minimal.
4. Handler functions — update state or run logic; **do not** combine with wiring if phases 3–5 are split (see below).
5. Wire handlers to JSX — add onClick/onChange (or template events), conditional display, export/finish.

Use concrete words in titles and actions: **button**, **input**, **link**, **form field** — avoid vague "control" when you mean a clickable button or a specific element.

CRITICAL — One package per import step:
• When the lesson uses multiple packages (e.g. 'react', '@reduxjs/toolkit/query/react', '@reduxjs/toolkit'), create ONE STEP PER PACKAGE. Step 1: "Import from 'react' (React and any hooks from this lesson)". Step 2: "Import createApi and fetchBaseQuery from '@reduxjs/toolkit/query/react'". Step 3: "Import configureStore from '@reduxjs/toolkit'". Do NOT combine all imports into one step.
• For a single-package lesson (e.g. only 'react' with useState): one imports step is fine — "Import React and useState from 'react'".
• Each import step title must name the package and the symbols (e.g. "Import React and useState from 'react'", "Import createApi and fetchBaseQuery from '@reduxjs/toolkit/query/react'").
• No step may use a symbol before the step that imports it. Order import steps by dependency if one package depends on another.

CRITICAL — One simple micro-step per step (no compound instructions):
• Each step must be ONE small, concrete action. Split any compound instruction into separate steps.
• BAD: "Create a new API service using createApi and define it with baseQuery and empty endpoints" → GOOD: Step A "Create a new API service using createApi", Step B "Define it with a baseQuery using fetchBaseQuery and an empty endpoints object".
• BAD: "Import Vue, createApi, fetchBaseQuery, and configureStore" (multiple packages in one step) → GOOD: one step per package.
• Other examples: "Create the store" and "Add the API reducer and middleware to the store" are two steps. "Create the component" and "Return a wrapper div" can be two steps if the lesson is granular.

When the track uses components (e.g. React, Angular, Vue), prefer the **five-phase UI pattern** when the lesson teaches an interactive screen (not tiny one-liners):
(1) Imports → (2) State/types → (3) JSX return with **button(s)/input(s)/layout only** (no event wiring yet) → (4) Handler function(s) → (5) Wire **button** onClick (or input onChange) and conditional render / export.
When the track is CSS, use structure appropriate to layout/styling. Adapt step titles and concepts to {{TRACK}} and {{LESSON_TITLE}}.

Examples of correct dependency order (adapt to the lesson):
- Import useState from 'react' (or hooks needed)
- Create component shell / export default
- Initialize boolean (or other) state
- Return JSX: div + **button** + paragraph (no onClick yet)
- Define toggle (or submit) handler with functional update if applicable
- Add onClick on the **button**, conditional **<p>**, ensure export

Incorrect (forbidden): any step that uses a concept before the step that introduces it. Forbidden: an import step that omits a hook the next step uses.

Button + handler wiring (UPDATED):
• For pedagogical lessons that split structure from behavior, **use three steps**: (A) JSX including **button** without onClick, (B) define handler only, (C) wire onClick and conditional display. Do **not** merge A+B+C into one step when the lesson goal is incremental learning.
• For very short “single-shot” drills only, you may combine “add **button** and wire onClick” in one step — prefer the split pattern for standard track lessons.
• For everything else: one micro-step per step. Do not combine "create X" and "define X with Y" — use two steps.

Step blueprint generation rules:
• Steps must be strictly ordered by dependency.
• No step may reference a concept that appears later in the list.
• If a concept requires another concept, that prerequisite must appear first.
• Prefer small incremental steps, but do not repeat the same logical action (e.g. button + onClick in one step, not two).

Before returning the result: ensure that no step references a concept introduced in a later step.

Return JSON only. Output field: "steps". Keep total steps between 8 and 18. Each step: id, title, phase, learningFocus, expectedAction.
- phase: "Step 1 of N", "Step 2 of N", etc.
- title: short, ONE action only. For import steps: one package per step (e.g. "Import from 'react'", "Import from '@reduxjs/toolkit/query/react'"). For other steps: one micro-step (e.g. "Create an API service using createApi", then "Define baseQuery and empty endpoints").
- learningFocus / expectedAction: for each import step, state the single package and symbols (e.g. "React and useState from 'react'"); for API/store steps, state the single action (e.g. "Create api with createApi" then "Add baseQuery and endpoints").

Return shape:
{
  "steps": [
    {
      "id": "step1",
      "title": "...",
      "phase": "Step 1 of N",
      "learningFocus": "...",
      "expectedAction": "..."
    }
  ]
}
`;
