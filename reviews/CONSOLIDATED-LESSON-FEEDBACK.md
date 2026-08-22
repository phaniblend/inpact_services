# Consolidated React-TS lesson feedback

Single place to capture **lesson-by-lesson** review notes from local exports (`reviews/review.txt`), screenshots under `reviews/images/`, and implementation follow-ups.

**Before authoring or rewriting a React-TS lesson** (`src/engines/react-ts/inpact_tsNN_engine.jsx`):

1. Read the **Global rules** section below.
2. Open the **lesson section** for the lesson you are editing (or add a new `## Lesson N` block).
3. Re-read the latest lines in `reviews/review.txt` after each export and merge anything new into this file.

---

## How to maintain (append as you progress)

1. Export from the local review tool → updates `reviews/review.txt` (and optional images in `reviews/images/`).
2. Copy each new `## react-ts — Lesson …` block from `reviews/review.txt` into the matching lesson subsection here under **Latest local export**, preserving the date line if present.
3. When the engine is updated to match, add **Resolved in engine** bullets (file path + short description; date optional).
4. If feedback applies to **every** lesson (tone, MC design), add or tighten a row under **Global rules**.

---

## Global rules (React-TS authoring)

| Topic | Rule |
| --- | --- |
| Feedback tone | Prefer **patterns** (“declare a props interface named … with N string fields”) over **copy-pasteable full solutions** in `feedback_wrong`, `feedback_partial`, and often in `hint`. Teach *what* belongs where, not only a verbatim answer. |
| Think + MC | The **think prompt** must test the **same idea** the **MC options** discriminate. Avoid trivia (e.g. long casing lectures) unless the MC actually measures it. |
| MCQ design | **Exactly one** clearly correct option. Do not offer two answers that are both valid in TypeScript or product practice (e.g. `interface` vs `type = { … }` for the same object props) unless the lesson explicitly teaches choosing between them. Use **obviously wrong** distractors when needed. |
| Intro gate MCQ | Same as MCQ design: one unambiguous correct answer; distractors must not read as equally reasonable first steps. |
| Return types | Do **not** treat `: JSX.Element` on components as mandatory “modern React.” Evaluators may accept it as optional; **seed / starter / expected / example_code** should default to **omitting** it unless the lesson is *about* return types. |
| JSX vs literals | Align think + MC with **dynamic values** (`{prop}`) vs string literals — that is what learners should be tested on. |
| Annotated AI feedback | Inline `// Feedback:` / focus lines in annotated code should read as **guidance** (bold green styling via `renderAnnotatedFeedbackCodeLines` in `inpact_engine_shared.jsx`). |
| Source of truth | Lesson runtime copy lives in `inpact_tsNN_engine.jsx`, not duplicate generated JSON under `content/generated/`. |

---

## Lesson 1 — First inventory screen (`inpact_ts01_engine.jsx`)

**Curriculum title:** First inventory screen — title + grocery card  

### Latest local export (`reviews/review.txt`)

- **2026-05-04 (export):** Intro / gate MCQ: “also both options are correct here pls dont give multiple correct options” — screenshot `reviews/images/react-ts_lesson1_1.png`.

### Historical review themes (same lesson; consolidated from earlier exports and passes)

| Theme | Intent |
| --- | --- |
| Props / feedback | Describe interfaces as a **named props type with N fields of type …** rather than dumping a full `interface … { }` block in wrong/partial learner messages. |
| Step 2 | Think + MC target **typed destructuring + props interface**, not React casing trivia. |
| Return type | `: JSX.Element` optional; grader must not require it. |
| Step 3 | Think + MC aligned to **when to use `{ }` in JSX** for live prop values vs literals. |
| Step 4 | Wrong/partial feedback: describe **compose + default export** as a pattern, not a full pasted solution. |
| Single correct MC | No pair of options both “correct” for experts or for real workflows; rewrite distractors or wording. |

### Resolved in engine (Lesson 1)

- **`intro_gate_mcq`:** Distractors rewritten so only **“Build one card that shows a single item”** is a sensible first step; removed “full page” / “search first” style options that could both sound reasonable.
- **Step 1 think MC:** Options rewritten to **short prose** so only one describes the **`interface` checklist at module scope**; avoids a second technically-valid `type` object shape sitting next to `interface` as a second “correct” answer. `mc_anchor` notes that `type` + object shape exists in TS but this lesson standardises on `interface`.
- **Steps 2–4** `seed_code` / `starter_code` / `expected` / `example_code`: **removed `: JSX.Element`** from component signatures so snippets match the “return type optional” stance globally.
- **`evalLesson1Step2`:** Allows optional `: JSX.Element` in the regex (still accepts omitted return type).
- **2026-05-04 (`reviews/review.txt`):** **Positive task copy** — Step 1 / 3 / 4 `paal` + feedback no longer repeat “do not add **App**” style negatives; steps point at what *this* step includes and where composition lands next.
- **2026-05-04 (`reviews/review.txt`):** **Correct code marked partial** — shared **`lesson1CardBodyFromPropsOk`** relaxes JSX matchers (whitespace in `src`/`alt`/`{}`, multiline **`h2`**, optional **`React.ReactElement`** / **`React.JSX.Element`** return annotations) for Steps 3–4; Step 2 accepts empty **`React.Fragment`** as well as `<></>`.
- **Step 1 think_prompt:** “typescript” → “TypeScript” typo fix.

### Screenshot index (Lesson 1)

| File | Typical topic |
| --- | --- |
| `reviews/images/react-ts_lesson1_1.png` | Intro gate MCQ — single correct answer |
| `reviews/images/react-ts_lesson1_2.png` | Think vs MC alignment (historical) |
| `reviews/images/react-ts_lesson1_3.png` | Return type + annotated feedback (historical) |
| `reviews/images/react-ts_lesson1_4.png` | JSX / dynamic values (historical) |
| `reviews/images/react-ts_lesson1_5.png` | Avoid syntax dumps in feedback (historical) |

---

## Lesson 2 — Inventory row types (`inpact_ts02_engine.jsx`)

**Curriculum title:** Inventory row — readonly fields, unions, nested types  

### Latest local export

- (None yet in `reviews/review.txt` for lesson 2 — add rows when the export includes them.)

### Design notes (continuity with Lesson 1)

- Restaurant / inventory framing; module-scope types only before scaling UI.

---

## Lesson 3+

Add a `## Lesson N — …` heading and subsections (**Latest local export**, **Resolved in engine**, optional screenshot table) when the first review export for that lesson appears.
