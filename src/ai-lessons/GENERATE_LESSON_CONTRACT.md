# AI Lesson Generation — Input Contract & Conventions

## 1. Where `track` and `lessonTitle` come from

**User flow (enforced):**

1. User lands on **LandingPage**.
2. User selects a **track** (e.g. "React · JS", "Angular", "CSS") via the track buttons.  
   → Stored in App state as internal id: `react-js`, `angular`, `css`, etc.
3. User clicks a **lesson card** (e.g. "Counter App", "Todo App", "Flexbox Layout").  
   → Card passes `(index, item)` to `onSelectLesson`; `item` has at least `title` (e.g. "Counter App").
4. App sets `lessonIndex` and `selectedLessonItem = item`.
5. **lessonTitle** = `selectedLessonItem?.title ?? getLessonList(track)?.[lessonIndex]?.title ?? "Lesson N"`.  
   So the lesson title is always from the clicked card or the lesson list for that track—**never hardcoded**.
6. **track** = current App `track` state (e.g. `react-js`, `angular`).
7. Both are passed to **DynamicLessonPage** and into **generateLesson** / **generateLessonPreview**.

**Relevant files:**

- `src/LandingPage.jsx` — `onSelectLesson(i, item)` with `item.title`.
- `src/App.jsx` — `handleSelectProblem(i, item)`, `lessonTitle = selectedLessonItem?.title ?? ...`, `<DynamicLessonPage track={track} lessonTitle={lessonTitle} lessonIndex={lessonIndex} />`.

---

## 2. generateLesson() / generateLessonPreview() input contract

**Required (must be passed from UI):**

| Argument       | Type   | Source                          |
|----------------|--------|----------------------------------|
| `track`        | string | Current track id from App state |
| `lessonTitle`  | string | Clicked card's `item.title`      |
| `lessonIndex`  | number | Index of clicked card (0-based)  |

**Optional (override derived defaults):**

| Argument           | Type   | Default / derivation |
|--------------------|--------|----------------------|
| `learnerLevel`     | string | `"beginner"`         |
| `lessonGoal`       | string | `"Teach the learner the concepts and implementation for: {lessonTitle}"` |
| `realWorldUseCase` | string | Generic placeholder text |

**Example runtime input:**

```js
generateLesson({
  track: "react-js",           // from user's track selection
  lessonTitle: "Counter App",  // from clicked lesson card
  lessonIndex: 0,
  // optional:
  learnerLevel: "beginner",
  lessonGoal: "...",
  realWorldUseCase: "..."
});
```

**Server:** `POST /api/lessons/generate` and `POST /api/lessons/preview` accept the same fields in the JSON body. Optional fields may be omitted.

---

## 3. Variable injection into prompts

All prompt templates use **placeholders** filled at runtime. No lesson names or track-specific logic are hardcoded in the template text.

**Injected variables:**

| Placeholder               | Source / derivation |
|---------------------------|----------------------|
| `{{TRACK}}`               | `getTrackDisplayName(track)` (e.g. "React - Javascript", "Angular") |
| `{{LESSON_TITLE}}`        | `lessonTitle` from params |
| `{{LEARNER_LEVEL}}`       | `learnerLevel` from params or default |
| `{{LESSON_GOAL}}`         | `lessonGoal` from params or derived from `lessonTitle` |
| `{{REAL_WORLD_USECASE}}`  | `realWorldUseCase` from params or default |
| `{{COMPLETED_STEPS_JSON}}`| Built per step in pipeline |
| `{{CODE_SO_FAR}}`         | Built per step in pipeline |
| `{{CURRENT_STEP_BLUEPRINT_JSON}}` | Current step from blueprint |

**Track display names:** `src/ai-lessons/trackDisplayNames.js` maps internal ids to prompt-friendly names (e.g. `react-js` → "React - Javascript") so the same template works for every track.

---

## 4. Prompt templates are constant and reusable

- **Location:** `src/ai-lessons/prompt-templates/`
- **Templates:** `systemInstruction`, `intro`, `objectives`, `stepBlueprint`, `stepDetail`, `codeValidation` (system + user builder).
- **Rule:** Template **text** is the same for all tracks and all lessons. Only the **injected variables** (above) change. Lesson content is generated purely from those arguments.
- **No lesson-specific logic:** No "Counter App", "useState", or React-only wording in the template text; instructions refer to `{{TRACK}}` and `{{LESSON_TITLE}}` so the model adapts (React, Angular, CSS, etc.).

---

## 5. Fallbacks

- **Mock:** If real AI is disabled or fails, `generateLesson` / `generateLessonPreview` use the mock service (same params: track, lessonTitle, lessonIndex).
- **Local engine:** If AI path fails and user clicks "Use local lesson instead", App switches to the existing non-AI engine for the same track/index.

---

## 6. Validation checklist

- [x] Prompt templates are shared and constant under `prompt-templates/`.
- [x] `track` and `lessonTitle` come from user click (track selection + lesson card).
- [x] Prompts do not vary per lesson; only injected arguments vary.
- [x] Lesson content is generated entirely from injected arguments (track, lesson title, optional overrides).
- [x] No lesson-specific prompt logic (no hardcoded "Counter App", "useState", etc.).
- [x] Mock and local fallback still work with the same input contract.
