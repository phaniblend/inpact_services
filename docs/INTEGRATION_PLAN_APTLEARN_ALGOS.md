# APT Learn (Algorithms) Integration Plan

## Goal
Integrate **algorithm lessons only** from [APT Learn](https://github.com/phaniblend/aptlearn) into PALL-INPACT. Keep existing React · JS, React · TS, Angular, Vue, and other tracks unchanged. Add a mentor-led step-through experience for algorithm lessons using the same lesson JSON format (flow with mentorSays, choices, example, next).

## Source
- **Repo:** https://github.com/phaniblend/aptlearn
- **Guide:** `ARCHITECTURE_AND_MERGE_GUIDE.md` in that repo
- **Scope:** Algorithms only — use `mentor/lessons/*.json` (exclude `mentor/lessonGen` for React/Angular/Vue).

---

## 1. Where to mount APIs

| API | Mount in PALL-INPACT | Purpose |
|-----|----------------------|--------|
| **Mentor** | `GET/POST /api/mentor/*` | List lessons, start lesson, advance step (required). |
| **IDE** (`/api/files`, `/api/execute`) | Deferred | Optional; can add later if we want in-lesson code run. |

Session: mentor routes expect `req.session` (e.g. `lessonId`, `currentStepId`). We add a **minimal in-memory session** for `/api/mentor` only (cookie `inpact_mentor_sid`), so no change to existing auth/domain.

---

## 2. File and directory changes

### 2.1 Server (option a: copy into our repo — recommended)

| Action | Path |
|--------|------|
| Add | `server/mentor/lesson-engine.js` | Load lessons from `mentor/lessons/*.json` only (algorithms). Same API: loadLessons(), findLessonById, findStepById, getNextStep. |
| Add | `server/mentor/mentor-router.js` | Express router: GET `/lessons`, POST `/start`, POST `/next`. Uses lesson-engine; reads/writes `req.session`. |
| Add | `mentor/lessons/` | Directory of algorithm JSON files (e.g. two-sum.json). Copy from aptlearn `mentor/lessons/`; keep format unchanged. |
| Modify | `server/index.js` | 1) In-memory session store + middleware for `/api/mentor` (cookie `inpact_mentor_sid`). 2) Mount mentor router: `app.use('/api/mentor', mentorSessionMiddleware, mentorRouter)`. |

### 2.2 Frontend

| Action | Path |
|--------|------|
| Add | Track **Algorithms** | New track in `LandingPage.jsx`; when selected, list comes from `GET /api/mentor/lessons` (not LESSON_LIST). |
| Add | `src/learn-algo/LearnAlgoPage.jsx` | Step-through UI: POST start → show step (mentorSays, choices, example); on Continue/choice → POST next; repeat until `done: true`. |
| Modify | `App.jsx` | When track is `algorithms` and a lesson is selected, render `LearnAlgoPage` with `lessonId` (and optional `onBackToLessons`). Use same `lessonList` / `selectedLessonItem` pattern; for algorithms `lessonList` is from mentor API. |

### 2.3 Lesson JSON format (unchanged)
Keep the APT Learn format so existing algorithm JSON works as-is:
- `id`, `title`, `pattern`, `difficulty`, `language`, `technology`, `status`, `metadata`
- `flow[]`: `stepId`, `mentorSays`, `action`, `next`, `choices[]`, `example`

---

## 3. Implementation steps (minimal: list + one lesson E2E)

1. **Backend**
   - Create `server/mentor/lesson-engine.js` (algorithms only: read `mentor/lessons/*.json` under project root).
   - Create `server/mentor/mentor-router.js` (GET /lessons, POST /start, POST /next).
   - In `server/index.js`: add mentor session middleware (cookie + Map), mount router at `/api/mentor`.
   - Create `mentor/lessons/` and add at least one lesson (e.g. `two-sum.json`) from aptlearn.

2. **Frontend**
   - Add “Algorithms” track; when selected, fetch `GET /api/mentor/lessons` and show cards (id, title, difficulty, etc.).
   - On card click, set `selectedLessonItem` to `{ id, title, ... }` and a flag (e.g. `lessonIndex` sentinel or `viewMode: 'learnAlgo'`) so App renders `LearnAlgoPage`.
   - `LearnAlgoPage`: call `POST /api/mentor/start` with `{ lessonId }`, then render current step (mentorSays, example, choices); “Continue” or choice → `POST /api/mentor/next` with `{ lessonId, currentStepId, choiceLabel? }`; when response is `{ done: true }`, show “Lesson complete” and a button back to list.

3. **No change**
   - Existing React/Angular/Vue lesson engines and lesson content.
   - Auth, domain, deployment remain in PALL-INPACT.

---

## 4. Optional later
- IDE APIs: mount `/api/files` and `/api/execute` if we want in-lesson code execution for algorithms.
- More algorithm lessons: bulk copy from aptlearn `mentor/lessons/*.json` into our `mentor/lessons/`.
- Persist mentor progress (e.g. store in our auth/user layer instead of in-memory session).
