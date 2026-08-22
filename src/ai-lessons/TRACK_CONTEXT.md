# Track context — language- and framework-aware generation and validation

The AI lesson pipeline is **track-aware**: the **user’s click** on a lesson card (which selects a track and lesson) drives the **language and framework context** used for both **generation** and **validation**. This avoids React TypeScript lessons getting JavaScript-style steps or validation, and vice versa.

## How track context is derived from user click

1. **Landing / track selection**  
   The user picks a track (e.g. "React - TypeScript", "React - Javascript"). The app uses an internal **track id** (e.g. `react-ts`, `react-js`).

2. **Lesson card click**  
   When the user clicks a lesson inside that track, the app sends the **track id** together with `lessonTitle` and `lessonIndex` to:
   - **Generation:** `POST /api/lessons/intro`, `/objectives`, `/generate` (and preview). The server passes `params.track` into the lesson service; `defaultVars(params)` calls `getTrackContext(params.track)` and injects `FRAMEWORK`, `LANGUAGE`, `FILE_MODE`, `SYNTAX_RULES`, `VALIDATION_RULES` into every prompt.
   - **Validation:** `POST /api/lessons/validate` with `step`, `userCode`, and optionally `track`. The frontend sends `track` from the current lesson page. The server passes `track` into `validateCodeWithAI`; the validation service uses `getTrackContext(track)` to get language and validation rules and injects them into the validation prompt.

So **one shared prompt system** is used for all tracks; **runtime context** (track → framework, language, fileMode, syntaxRules, validationRules) is **injected** so the model generates and validates in the correct language/framework.

## Central mapping: `getTrackContext(track)`

**File:** `src/ai-lessons/trackContext.js`

- **`getTrackContext(track)`** returns:
  - `framework` — e.g. "React", "Angular"
  - `language` — e.g. "TypeScript", "JavaScript"
  - `fileMode` — e.g. "TSX", "JSX", "TS"
  - `syntaxRules` — instructions for **generation** (what code/style to produce)
  - `validationRules` — instructions for **validation** (how to judge correctness for that track)

- **Example mappings:**
  - `react-js` → React, JavaScript, JSX — no TypeScript; validate as JS/JSX only.
  - `react-ts` → React, TypeScript, TSX — require type-safe TS/TSX; validate as TypeScript, accept inferred or explicit types, do not accept plain JS when the lesson is TS.
  - `angular` → Angular, TypeScript, TS — Angular + TS conventions.

- **`getLanguageForValidation(track)`** returns a string like `"typescript"` or `"javascript"` for the validation API/labels.

## How TypeScript lessons differ from JavaScript lessons at generation time

- **Prompts** (step blueprint, step detail, lesson description, objectives, real-world application) receive injected variables:
  - `{{FRAMEWORK}}`, `{{LANGUAGE}}`, `{{FILE_MODE}}`, `{{SYNTAX_RULES}}`
- **SYNTAX_RULES** for TypeScript tracks explicitly require:
  - Valid TypeScript/TSX only; type annotations or correct inference; no plain JavaScript without types unless the step allows it.
- **SYNTAX_RULES** for JavaScript tracks explicitly require:
  - JavaScript/JSX only; no TypeScript types or interfaces.

So **step blueprint** and **step detail** produce:
- **React TypeScript:** TSX seed code, TypeScript analogues, instructions that reference types/interfaces where appropriate.
- **React JavaScript:** JSX seed code, no type annotations, instructions that do not require TypeScript.

All of this uses the **same shared templates**; only the injected **track context** changes.

## How validation adapts by track

- **Code validation** (`codeValidationService.js`, prompt in `prompt-templates/codeValidation.js`) receives:
  - **Track** (when the frontend sends it): the server passes `track` into `validateCodeWithAI(step, userCode, { ..., track })`.
  - The service calls `getTrackContext(track)` and passes `{ language, framework, validationRules }` into `buildCodeValidationUserPrompt`.
- **Validation prompt** then includes:
  - **Framework** and **track-specific validation rules** in the user message so the model judges correctness according to the selected track.

**For TypeScript tracks:**
- Expect TS/TSX-valid code.
- Accept idiomatic TypeScript (inferred or explicit types).
- Do not wrongly reject correct inferred typing.
- Do not accept plain JavaScript that ignores types when the lesson is TypeScript.

**For JavaScript tracks:**
- Do not require TypeScript syntax or type annotations unless the lesson explicitly teaches them.
- Validate as JavaScript/JSX only.

Validation **cache key** includes `track` (and validation cache version) so react-ts and react-js do not share validation results.

### Deterministic execution guards (post-AI)

After the model returns `correct` or `partial`, `codeValidationService.js` runs **`applyExecutionCorrectnessGuards`** (`src/ai-lessons/utils/postValidationGuards.js`):

- **Angular / mobile-angular:** template event bindings vs class/callable arity (`angularTemplateCallArity.js`).
- **react-js / react-ts:** JSX `onX={...}` handlers vs local function arity (`reactJsxEventArity.js`).
- **vue:** `<template>` directive/bindings vs `<script>` arity (`vueTemplateCallArity.js`).
- **Legacy / mis-tagged:** merged code with `template:\`...\`` and `export class` still runs the Angular guard.

Shared parsing lives in `callArityCore.js` and `collectCallableArities.js`. Other tracks rely on stricter **global** validation prompt text plus `EXECUTION_CORRECTNESS_COMMON` in `trackContext.js` (and extra React/Python rules where mapped).

## Clearing and re-warming cache after prompt changes

After changing track context or prompts:

1. **Clear react-ts cache only:**
   ```bash
   node scripts/clear-react-ts-cache.js
   ```
2. **Re-warm react-ts** (e.g. first 10 lessons):
   ```bash
   # PowerShell
   $env:TRACK="react-ts"; $env:LIMIT="10"; npm run warm-cache-standalone
   ```
   Or full react-ts: `$env:TRACK="react-ts"; npm run warm-cache-standalone`

## Algorithm lessons (algo name + language)

You can generate **algorithm** lessons (e.g. Binary Search, Two Pointers) in a chosen language using the same INPACT engine and AI pipeline:

- **Tracks:** `algo-js`, `algo-ts`, `algo-python`, `algo-java` (see `trackContext.js`). Each has framework "Algorithms" and the corresponding language/fileMode/syntax/validation rules.
- **UI:** Use the "Algo · JS", "Algo · TS", "Algo · Python", "Algo · Java" track buttons. The list of lesson titles comes from `ALGO_AI_NAMES` (e.g. "Binary Search", "Sliding Window"). Clicking a card sends `track`, `lessonTitle` (= algo name), and `lessonIndex` to the same generation and validation pipeline.
- **Flow:** User selects language (track) → clicks algo name → `DynamicLessonPage` calls the server with `track=algo-python`, `lessonTitle=Binary Search` → prompts get Python syntax rules and generate a step-by-step algorithm lesson in Python; validation judges code in Python. No separate prompt system—same shared templates with injected track context.

To add more algorithm names, edit `src/ai-lessons/algoAiNames.js`.

## Files involved

| Area              | Files |
|-------------------|--------|
| Track mapping     | `src/ai-lessons/trackContext.js` |
| Generation vars   | `src/ai-lessons/services/realLessonService.js` (`defaultVars` → `getTrackContext`) |
| Prompts           | `src/ai-lessons/prompt-templates/*.js` (placeholders `FRAMEWORK`, `LANGUAGE`, `FILE_MODE`, `SYNTAX_RULES`) |
| Validation        | `src/ai-lessons/services/codeValidationService.js`, `prompt-templates/codeValidation.js` |
| Server            | `server/index.js` (passes `track` to validate; generation already receives track via `params`) |
| Frontend          | `src/ai-lessons/DynamicLessonPage.jsx` (sends `track` in validate request) |
| Cache clear       | `scripts/clear-react-ts-cache.js` |
