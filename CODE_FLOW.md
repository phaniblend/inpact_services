# INPACT App — Code Flow

High-level flow from landing to lesson complete and Next Lesson, in the format: **user action → file/component that is rendered**.

---

## 1. User lands on the landing page

**→ `LandingPage.jsx`** is rendered (via `App.jsx`: when `lessonIndex === null`, App returns `<LandingPage ... />`).

- `App.jsx` holds `track` (e.g. `'react-js'`) and `lessonIndex` (`null` = landing).
- `LandingPage.jsx` shows the track buttons and the grid of lesson cards (titles from `lessonList` or `LESSON_LIST`).

---

## 2. User chooses a tech category (e.g. React · JS)

**→ `LandingPage.jsx`** stays rendered.

- `onTrackChange("react-js")` is called → `App.jsx` updates `track` to `'react-js'`.
- `getLessonList(track)` returns the list for that track; `LandingPage` re-renders with the same file, showing the correct lesson list for that track.

---

## 3. User clicks a lesson — e.g. P01 (Counter App)

**→ The engine for that lesson is mounted by `App.jsx`.**

- `onSelectLesson(0)` → `App.jsx` sets `lessonIndex = 0`.
- `App.jsx` no longer renders `LandingPage`; it renders `Engine = engines[lessonIndex]` (e.g. `INPACTEngineP01`).
- **Engine** = component returned by `createINPACTEngine(config)` in **`inpact_engine_shared.jsx`**, with `NODES` (and config) from **`inpact_p01_engine.jsx`** (for P01).
- The engine’s first node is `type: "reveal"` (intro). So **`inpact_engine_shared.jsx`** runs **`renderNode()` → `renderReveal()`** and shows the intro screen (lesson title, body, “CONTINUE →”).

---

## 4. User clicks “CONTINUE →”

**→ Same engine component** (`inpact_engine_shared.jsx`).

- `next()` runs → `nodeIndex` becomes 1.
- Current node is `type: "objectives"`. **`renderNode()` → `renderObjectives()`** in **`inpact_engine_shared.jsx`** is rendered (objectives list + “LET'S BUILD →”).

---

## 5. User clicks “LET'S BUILD →”

**→ Same engine** (`inpact_engine_shared.jsx`).

- `next()` → `nodeIndex` becomes 2.
- Current node is `type: "question"` (first step, e.g. “Step 1 of 5”). **`renderNode()` → `renderEditorContent()`** in **`inpact_engine_shared.jsx`** is rendered.
- For question nodes, the engine wraps that content in **`LessonEditorOutputTabs.jsx`** (Lesson | Editor | Output tabs). The **Editor** tab shows:
  - Task block (from **`LessonEditorOutputTabs.jsx`**),
  - Code editor (**`CodeEditor.jsx`**),
  - Feedback section,
  - “CHECK MY CODE{ctrl+shift+enter}” / “NEXT STEP →” (**`inpact_engine_shared.jsx`** via `renderEditorBlockButtons`).

So at this step: **`inpact_engine_shared.jsx`** (renderEditorContent) + **`LessonEditorOutputTabs.jsx`** (Editor tab) + **`CodeEditor.jsx`** are what the user sees.

---

## 6. User clicks “CHECK MY CODE{ctrl+shift+enter}”

**→ Same view** (no new component mounted).

- **`inpact_engine_shared.jsx`**: `submit()` runs → `evaluate(node, answer)` → `setResult('correct' | 'partial' | 'wrong')`.
- Still **`renderEditorContent()`**; the feedback block (and hint/expected if shown) is rendered by **`renderEditorBlockScrollableExtras(fbMsg)`** in **`inpact_engine_shared.jsx`**. Same **`LessonEditorOutputTabs.jsx`** + **`CodeEditor.jsx`**.

---

## 7. User clicks “NEXT STEP →” (after correct)

**→ Same engine**, next step in the same lesson.

- **`inpact_engine_shared.jsx`**: `next()` → `nodeIndex` becomes 3 (next `type: "question"` node).
- Again **`renderEditorContent()`** is run (new step’s task, seed code, and buttons). Still **`LessonEditorOutputTabs.jsx`** + **`CodeEditor.jsx`**.
- This repeats for each step (e.g. Step 2 of 5, Step 3 of 5, …) until all steps for that lesson are done.

---

## 8. All steps complete → lesson complete screen

**→ Same engine** (`inpact_engine_shared.jsx`).

- `next()` eventually makes `nodeIndex >= NODES.length`.
- **`renderNode()`** returns **`renderComplete()`** from **`inpact_engine_shared.jsx`** (e.g. “Lesson #1 Complete”, “NEXT LESSON →”).

---

## 9. User clicks “NEXT LESSON →” (or “Next Lesson”)

**→ `App.jsx`** switches to the next lesson.

- The engine calls **`onNextLesson()`** (passed from `App.jsx`).
- **`App.jsx`**: `setLessonIndex((i) => i + 1)` → e.g. `lessonIndex = 1`.
- **`App.jsx`** re-renders and mounts the next engine: **`Engine = engines[1]`** (e.g. **`INPACTEngineP02`**), again from **`createINPACTEngine`** in **`inpact_engine_shared.jsx`** with **`inpact_p02_engine.jsx`** config.
- Flow repeats from step 3: first node is “reveal” → **`renderReveal()`** for P02’s intro.

---

## Summary diagram (React · JS, lesson P01)

```
User lands
  → App.jsx (lessonIndex === null)
  → LandingPage.jsx

User selects track "React · JS"
  → LandingPage.jsx (same; track state in App.jsx)

User clicks "Counter App" (P01)
  → App.jsx (lessonIndex = 0, Engine = INPACTEngineP01)
  → inpact_engine_shared.jsx (NODES from inpact_p01_engine.jsx)
     → renderReveal()  [intro]

User clicks "CONTINUE →"
  → inpact_engine_shared.jsx
     → renderObjectives()

User clicks "LET'S BUILD →"
  → inpact_engine_shared.jsx
     → renderEditorContent()
     → LessonEditorOutputTabs.jsx (Editor tab) + CodeEditor.jsx

User clicks "CHECK MY CODE{ctrl+shift+enter}"
  → inpact_engine_shared.jsx submit() → same renderEditorContent(); feedback appears

User clicks "NEXT STEP →" (repeated for each step)
  → inpact_engine_shared.jsx next() → renderEditorContent() for next question node

All steps done
  → inpact_engine_shared.jsx
     → renderComplete()

User clicks "NEXT LESSON →"
  → App.jsx onNextLesson() → lessonIndex = 1
  → INPACTEngineP02 (inpact_engine_shared.jsx + inpact_p02_engine.jsx)
     → renderReveal()  [P02 intro]
  … and so on.
```

---

## Key files

| Role | File |
|------|------|
| Root, track & lesson index | `App.jsx` |
| Landing + lesson list | `LandingPage.jsx` |
| All lesson UIs (reveal, objectives, editor, complete) | `inpact_engine_shared.jsx` |
| Lesson data for P01 (Counter App) | `inpact_p01_engine.jsx` (or `src/engines/react-js/inpact_p01_engine.jsx`) |
| Tabs (Lesson / Editor / Output) + task block in Editor | `LessonEditorOutputTabs.jsx` |
| Code editor in Editor tab | `CodeEditor.jsx` |

The same **engine component** (from `createINPACTEngine`) handles intro → objectives → each question step → complete; only **which lesson** (which engine instance / which NODES) is chosen by **`App.jsx`** via `engines[lessonIndex]`.
