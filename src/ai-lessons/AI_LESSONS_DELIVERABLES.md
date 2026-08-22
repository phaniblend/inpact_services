# AI-Driven Lesson Pipeline — Deliverables

## 1. Current lesson-card click flow (summary)

- **Landing:** `App` renders `LandingPage` when `lessonIndex === null`, with `track`, `onTrackChange`, `onSelectLesson`, `lessonList={getLessonList(track)}`.
- **Grid:** `LandingPage` builds `list` from `lessonList ?? LESSON_LIST.map(title => ({ title }))` (or Angular-specific list), then renders a grid of cards. Each card calls `onSelectLesson(i, item)` on click (with `item` = `{ title, shortName?, why? }`).
- **After click:** `App` sets `lessonIndex` to the clicked index and (with this implementation) `selectedLessonItem` to the clicked item.
- **Engine choice:** `App` gets `engines = getEngines(track)` and `Engine = engines[lessonIndex]`, then renders `<Engine onNextLesson={...} onBackToLessons={onBackToLessons} />` inside a fixed “← All Lessons” bar.
- **Shared engine:** Each `Engine` is created by `createINPACTEngine(config)` with `config`: `NODES`, `sideItems`, `lessonNum`, `title`, `shortName`, and optional `language`, `getOutputPreview`, `answerShape`, `defaultSeedCode`. The shared shell in `inpact_engine_shared.jsx` renders intro → objectives → question steps (editor, hints, feedback).

## 2. Branch name

- **`feature/ai-dynamic-lessons`** (created from `main`).

## 3. Proposed file tree for the AI lesson system

```
src/
  ai-lessons/
    config.js                    # useAILessons, useRealAI, useMockOnly, apiKey from env
    schema.js                    # Zod: lessonConfig, steps, intro, evaluation + stage outputs
    DynamicLessonPage.jsx        # Entry: loading / error / fallback / render engine
    AI_LESSONS_DELIVERABLES.md   # This file
    AI_LESSONS_ENV.md            # Env vars required
    prompt-templates/
      injectVariables.js         # {{TRACK}}, {{LESSON_TITLE}}, etc.
      systemInstruction.js      # SYSTEM_INSTRUCTION for all prompts
      objectives.js              # Stage 3
      intro.js                   # Stage 4
      stepBlueprint.js           # Stage 5
      stepDetail.js              # Stage 6
      index.js                   # Re-exports
    providers/
      deepseekClient.js          # completeWithDeepSeek(); key from config (DeepSeek only)
    utils/
      parseJson.js               # extractJsonString, parseStrictJson, parseAndValidate, logStage
    services/
      mockLessonService.js       # Valid lesson config (no API)
      realLessonService.js       # Full pipeline: intro → objectives → blueprint → steps → assembly
      lessonOrchestrator.js      # Real AI first, then mock; returns config or error
    adapters/
      normalizeToEngineConfig.js # AI config → createINPACTEngine config
  ai-prompt.txt                 # Source spec for 12 stages (unchanged)
  App.jsx                        # handleSelectLesson, useAILessons, DynamicLessonPage
  LandingPage.jsx                # onSelectLesson(i, item)
```

## 4. Exact integration points changed

- **`src/LandingPage.jsx`:** Card click now calls `onSelectLesson(i, item)` instead of `onSelectLesson(i)` so the app has access to `title` / `shortName` without relying on `getLessonList(track)` in App.
- **`src/App.jsx`:**
  - Imports `AI_LESSONS_CONFIG` and `DynamicLessonPage`.
  - New state: `selectedLessonItem`, `useAILessonFailed`.
  - `onSelectLesson` replaced with `handleSelectLesson(i, item)` which sets `lessonIndex`, `selectedLessonItem`, and resets `useAILessonFailed`.
  - `onBackToLessons` clears `selectedLessonItem` and `useAILessonFailed`.
  - When `lessonIndex !== null`: if `AI_LESSONS_CONFIG.useAILessons && !useAILessonFailed`, render `DynamicLessonPage` with `track`, `lessonTitle` (from `selectedLessonItem?.title ?? getLessonList(track)?.[lessonIndex]?.title ?? 'Lesson N'`), `lessonIndex={lessonIndex}`, `onBackToLessons`, `onNextLesson`, `onFallbackToLocal`. Otherwise render the existing `Engine` as before.

## 5. Schema / types added

- **`src/ai-lessons/schema.js`:** Zod schemas (no TypeScript files; project is JS/JSX):
  - `evaluationMetadataSchema`: `mode`, `required`, `partialThreshold`, `correctThreshold`, `patterns`, `rubric`, etc. (declarative only).
  - `lessonStepSchema`: `id`, `type`, `phase`, `title`, `instruction`, `hint`, `analogousExample`, `seedCode`, `expectedOutcome`, `successCriteria`, `feedbackCorrect` / `feedbackPartial` / `feedbackWrong`, `evaluation`, `answer_keywords`.
  - `lessonIntroSchema`: `tag`, `title`, `body`, `usecase`.
  - `sideItemSchema`: `label`, `id`.
  - `lessonConfigSchema`: `lessonId`, `track`, `lessonNum`, `title`, `shortName`, `intro`, `objectives`, `steps`, `sideItems`.
  - Helpers: `validateLessonConfig`, `parseLessonConfig`.

## 6. Prompt-template structure from ai-prompt.txt

- **Location:** `src/ai-lessons/prompt-templates/`.
- **Utility:** `injectVariables(template, variables)` — replaces `{{TRACK}}`, `{{LESSON_TITLE}}`, `{{CODE_SO_FAR}}`, `{{COMPLETED_STEPS_JSON}}`, `{{CURRENT_STEP_BLUEPRINT_JSON}}`, etc.
- **Templates added (traceable to ai-prompt.txt):**
  - Stage 3: `objectives.js` — `OBJECTIVES_PROMPT`
  - Stage 4: `intro.js` — `INTRO_PROMPT`
  - Stage 5: `stepBlueprint.js` — `STEP_BLUEPRINT_PROMPT`
  - Stage 6: `stepDetail.js` — `STEP_DETAIL_PROMPT`
- **System instruction:** `systemInstruction.js` — SYSTEM_INSTRUCTION prepended to every AI call (strict JSON, no executable code, beginner-safe).
- Stages 1–2 are reference-only. Stages 7–10 (runtime next-step, hint-only, analogous-example, evaluation-metadata) are optional per-step refinements; stage 11 (assembly) is done in code; stage 12 is this orchestrator.

## 7. Orchestration modules added

- **`services/mockLessonService.js`:** `generateLessonMock({ track, lessonTitle, lessonIndex })` — returns a promise of a validated lesson config (intro, objectives, 2 steps, sideItems) after a short delay. Used so the flow is testable without an AI provider.
- **`services/lessonOrchestrator.js`:** `generateLesson(...)` — tries real AI first when `useRealAI` is true; on failure falls back to mock; validates with `validateLessonConfig`; returns `{ success: true, config, source: 'real'|'mock' }` or `{ success: false, error }`.
- **`services/realLessonService.js`:** Full 12-stage pipeline: intro → objectives → step blueprint → per-step details (with code-so-far) → assembly; all stages use DeepSeek + prompt templates and Zod validation.

## 8. Frontend components added/updated

- **Added:** `src/ai-lessons/DynamicLessonPage.jsx`
  - Props: `track`, `lessonTitle`, `lessonIndex`, `onBackToLessons`, `onNextLesson`, `onFallbackToLocal`.
  - State: `loading` → calls `generateLesson(...)`; on success adapts config with `aiLessonToEngineConfig` and renders `createINPACTEngine(engineConfig)`; on error shows message and “Use local lesson instead” (if `onFallbackToLocal`), plus “← All Lessons”.
- **Updated:** `App.jsx` (see §4). `LandingPage.jsx`: card click passes `(i, item)`.

## 9. Fallback behavior

- **Feature flag off:** `VITE_USE_AI_LESSONS` is not `"true"` → `AI_LESSONS_CONFIG.useAILessons` is false → after lesson card click, App always renders the existing `Engine` (unchanged behavior).
- **Feature flag on:** App renders `DynamicLessonPage`. If generation fails or validation fails, `DynamicLessonPage` shows the error and a “Use local lesson instead” button; clicking it sets `useAILessonFailed` so App re-renders the same lesson using the existing local `Engine`. `AI_LESSONS_CONFIG.fallbackToLocalOnError` controls whether `onFallbackToLocal` is passed.

## 10. Migration notes

- **Existing lessons:** Not removed. All current engine files and `getEngines`/`getLessonList` are unchanged. The AI path is additive.
- **Env:** See `AI_LESSONS_ENV.md`. Use `VITE_USE_AI_LESSONS=true` and `VITE_DEEPSEEK_API_KEY` (or server with `DEEPSEEK_API_KEY`) in project root `.env`. No hardcoded secrets.
- **Track context:** Generation and validation are language- and framework-aware (React TS vs React JS, etc.). See `TRACK_CONTEXT.md` for how track drives prompts and validation.
- **Real AI:** Implemented in `realLessonService.js`; orchestrator tries real AI first, then mock, then returns error for “Use local lesson instead”.

## 11. Next steps

- Set `VITE_USE_AI_LESSONS=true` and `DEEPSEEK_API_KEY` (or `VITE_DEEPSEEK_API_KEY` for client path) in project root `.env`; restart dev server; click a lesson card to run the real pipeline.
- Optional: add a small “AI” / “Mock” badge when the lesson is from the pipeline.
- Optional: add stages 7–10 as separate calls (runtime next-step, hint-only, analogous-example, evaluation-metadata) for richer runtime behavior.

---

## 12. Real AI wiring (this round)

### 12.1 Exact files changed

| File | Change |
|------|--------|
| `src/ai-lessons/config.js` | Env-only config: `useRealAI`, `useMockOnly`, `apiKey` from `VITE_*`; no hardcoded secrets. |
| `src/ai-lessons/AI_LESSONS_ENV.md` | **New.** Documents `VITE_USE_AI_LESSONS`, `VITE_DEEPSEEK_API_KEY`, `VITE_AI_USE_MOCK_ONLY`. |
| `src/ai-lessons/providers/deepseekClient.js` | **New.** `completeWithDeepSeek()`; key from config (env). DeepSeek only. |
| `src/ai-lessons/utils/parseJson.js` | **New.** `extractJsonString`, `parseStrictJson`, `parseAndValidate`, `logStage` (no secrets). |
| `src/ai-lessons/schema.js` | Added `objectivesOutputSchema`, `stepBlueprintItemSchema`, `stepBlueprintOutputSchema`, `introOutputSchema`, `stepDetailOutputSchema`. |
| `src/ai-lessons/prompt-templates/systemInstruction.js` | **New.** `SYSTEM_INSTRUCTION` for all prompts. |
| `src/ai-lessons/prompt-templates/intro.js` | Placeholders: `LEARNER_LEVEL`, `LESSON_GOAL`, `REAL_WORLD_USECASE`. |
| `src/ai-lessons/prompt-templates/objectives.js` | Placeholders: `LEARNER_LEVEL`, `LESSON_GOAL`. |
| `src/ai-lessons/prompt-templates/stepBlueprint.js` | Placeholders: `LEARNER_LEVEL`, `LESSON_GOAL`. |
| `src/ai-lessons/prompt-templates/stepDetail.js` | Placeholder: `LEARNER_LEVEL`, `LESSON_GOAL`. |
| `src/ai-lessons/prompt-templates/index.js` | Export `SYSTEM_INSTRUCTION`. |
| `src/ai-lessons/services/realLessonService.js` | **New.** Full pipeline: intro → objectives → blueprint → per-step details → assembly; Zod at each stage. |
| `src/ai-lessons/services/lessonOrchestrator.js` | Real AI first, then mock; returns `source: 'real'|'mock'`; no `USE_REAL_AI` flag in code (uses config). |
| `package.json` | DeepSeek API (no Anthropic SDK required for pipeline). |

### 12.2 Exact env vars required

| Variable | Required when | Description |
|----------|----------------|-------------|
| `VITE_USE_AI_LESSONS` | To use AI path | `"true"` = lesson card click goes to AI pipeline. |
| `VITE_DEEPSEEK_API_KEY` | For real AI (client path) | DeepSeek API key; or use server with `DEEPSEEK_API_KEY`. |
| `VITE_AI_USE_MOCK_ONLY` | Optional | `"true"` = skip real API, use mock only. |

All read from build env (e.g. project root `.env`). Restart dev server after changes.

### 12.3 Runtime flow now

1. User clicks lesson card with `VITE_USE_AI_LESSONS=true`.
2. App renders `DynamicLessonPage` with `track`, `lessonTitle`, `lessonIndex`.
3. `DynamicLessonPage` calls `generateLesson({ track, lessonTitle, lessonIndex })`.
4. **Orchestrator:**  
   - If `useRealAI` (key set, not mock-only): call `generateLessonReal()` (DeepSeek pipeline).  
   - If that throws or returns invalid: call `generateLessonMock()`.  
   - If mock also fails: return `{ success: false, error }`.
5. On success: validate with `lessonConfigSchema`, return `{ success: true, config, source: 'real'|'mock' }`.
6. `DynamicLessonPage`: adapts config with `aiLessonToEngineConfig`, renders shared engine. On error: show message + “Use local lesson instead” (if `onFallbackToLocal`); user can switch to local engine.

### 12.4 Is real AI actually being called?

**Yes**, when:

- `VITE_USE_AI_LESSONS=true`
- `DEEPSEEK_API_KEY` or `VITE_DEEPSEEK_API_KEY` is set in env (project root `.env`)
- `VITE_AI_USE_MOCK_ONLY` is not `"true"`

Then the orchestrator calls `generateLessonReal()`, which uses `completeWithAI()` (DeepSeek) for intro, objectives, step blueprint, and each step detail. Real API is invoked for each of those stages.

### 12.5 How fallback works

1. **Real AI fails** (network, parse, validation): orchestrator catches, logs (no secrets), then calls **mock**; if mock succeeds, user gets a lesson and may not notice.
2. **Both real and mock fail**: orchestrator returns `{ success: false, error }`; `DynamicLessonPage` shows error and “Use local lesson instead”; on click, App sets `useAILessonFailed` and re-renders the **local** engine for the same lesson.
3. **AI path disabled** (`VITE_USE_AI_LESSONS` not `"true"`): App never renders `DynamicLessonPage`; local engine is used directly.

### 12.6 Remaining gaps

- **CORS:** If the app runs in the browser and the AI provider does not allow browser origins, API calls may fail; then mock or local fallback is used. For production, use the Node server (`VITE_AI_USE_SERVER=true`) so the key stays on the server and the frontend calls your backend.
- **Stages 7–10:** Not wired as separate calls (runtime next-step, hint-only, analogous-example, evaluation-metadata). Step detail (stage 6) already produces hint, analogousExample, and evaluation; optional future work is to refine these with dedicated prompts.
- **Retry on parse failure:** Currently one parse per stage; optional improvement is to retry the AI call once if parsing fails (e.g. truncated output).
