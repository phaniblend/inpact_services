# Convert Algo JSON to INPACT Content Format

Use this guide to turn an **algo-style lesson JSON** (lessonTitle, description, steps with instruction/analogy/hint/starterCode, etc.) into the **INPACT content format** so the lesson renders in the same way as other track/lessons (intro → objectives → code steps with editor, validation, and “Ask your mentor”).

---

## 1. Target: INPACT content file

- **Location:** `content/<track>/NNN_Title_lesson.json`
  - `<track>` = e.g. `js`, `react-js`, `ts`, or a dedicated track like `algorithms` if you add it.
  - `NNN` = 3-digit lesson index (e.g. `001`, `002`).
  - Filename must end with `_lesson.json`.
- **Root shape:** `{ "success": true, "config": { ... }, "source": "content" }`
- The server uses **config** when that track + lesson index is requested (`GET`/`POST` content or generate). The app then runs the same INPACT renderer (intro → objectives → steps) via `aiLessonToEngineConfig` and `createINPACTEngine`.

---

## 2. Config shape (what goes inside `config`)

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `lessonId` | string | no | e.g. `"ai-js-two-sum"`. |
| `track` | string | no | e.g. `"js"`, `"algorithms"`. |
| `lessonNum` | number | no | 1-based lesson number. |
| `title` | string | yes | Lesson title (e.g. from `lessonTitle`). |
| `shortName` | string | no | Short label (e.g. `"P01"`, `"Two Sum"`). |
| `intro` | object | yes | See **Intro** below. |
| `objectives` | string[] | yes | List of learning objectives. |
| `steps` | object[] | yes | List of step objects; see **Step** below. |
| `sideItems` | object[] | no | Sidebar progress; can be derived from intro + objectives + steps. |

### Intro object

```json
{
  "tag": "LESSON #1",
  "title": "Solving Two Sum Efficiently with Hash Maps in JavaScript",
  "body": "<paragraph(s) describing the lesson>",
  "usecase": "<why it matters in the real world>"
}
```

- **tag:** Short label (e.g. `"LESSON #1"`).
- **title:** Same as lesson title.
- **body:** From your `description`.
- **usecase:** From your `realWorldApplication`.

### Step object (code steps only; type `"question"`)

Each item in `config.steps` must look like this so the INPACT engine can show the editor, run validation, and show feedback:

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `id` | string | yes | Unique step id, e.g. `"step1"`, `"step2"`. |
| `type` | string | yes | Use `"question"` for code steps. |
| `phase` | string | yes | e.g. `"Step 1 of 11"`. |
| `title` | string | yes | Step title. |
| `instruction` | string | yes | What the learner should do (shown as main text). |
| `hint` | string | no | Short hint. |
| `analogousExample` | string | no | Code example (can include analogy as comment). |
| `seedCode` | string | yes | Starting code for the editor (cumulative is fine). |
| `expectedOutcome` | string | no | What “success” looks like. |
| `successCriteria` | string[] | no | List of criteria. |
| `feedbackCorrect` | string | no | Shown when code is correct. |
| `feedbackPartial` | string | no | Shown when partially correct. |
| `feedbackWrong` | string | no | Shown when wrong. |
| `evaluation` | object | no | See **Evaluation** below. |

### Evaluation object (optional)

Used for keyword-based validation when not using AI validation:

```json
{
  "mode": "keyword_match",
  "required": ["keyword1", "keyword2"],
  "partialThreshold": 0.5,
  "correctThreshold": 0.8
}
```

- **required:** Array of strings the code should contain (or patterns).
- **partialThreshold / correctThreshold:** Numbers in 0–1 for partial vs full credit.

### sideItems (optional)

If omitted, the adapter builds them from intro + objectives + steps. If provided:

```json
[
  { "id": "intro", "label": "Intro" },
  { "id": "objectives", "label": "Objectives" },
  { "id": "step1", "label": "Understand the Two Sum Lesson" },
  { "id": "step2", "label": "Brainstorm a Brute Force Solution" }
  // ... one per step
]
```

- **id** must match the step `id` (or `"intro"`, `"objectives"`).
- **label** is the text in the sidebar.

---

## 3. Mapping: your algo JSON → INPACT config

Use this mapping from your current algo JSON into the INPACT content format.

### Top-level

| Your field | INPACT config |
|------------|----------------|
| `lessonTitle` | `config.title` (and `intro.title`) |
| `description` | `intro.body` |
| `realWorldApplication` | `intro.usecase` |
| `objectives` | `config.objectives` (array, use as-is) |

Set `intro.tag` to something like `"LESSON #1"` and `config.shortName` if you want.

### Steps

Your steps look like:

- `id`, `title`, `instruction`, `analogy`, `hint`, `starterCode`
- `validation` (e.g. `concepts`, `patterns`, `antiPatterns`)
- `prerequisiteTeach` (optional)

For **each** of your steps, build one INPACT step:

| Your field | INPACT step field |
|------------|--------------------|
| `id` | Use as step id; normalize to `"step1"`, `"step2"`, … if you use numeric ids like `"1"`, `"2"`. |
| `title` | `title` |
| `instruction` | `instruction` (you can append `"\n\n**Analogy:** " + analogy` and/or `"\n\n**Hint:** " + hint` if you want them in the same block). |
| `hint` | `hint` |
| `analogy` | Optional: put in `instruction` or as a comment in `analogousExample`. |
| `starterCode` | `seedCode` (see **Cumulative seedCode** below). |
| `validation.concepts` | Merge into `evaluation.required` (and/or `successCriteria`) as keyword strings. |
| `validation.patterns` | Add to `evaluation.required` (as strings) if you use pattern-based checks. |
| `prerequisiteTeach` | Optional: prepend to `instruction` or add a short “Concept” line. |

Add these to every step:

- `"type": "question"`
- `"phase": "Step N of M"` (N = step index, M = total steps)
- `expectedOutcome`, `successCriteria`, `feedbackCorrect`, `feedbackPartial`, `feedbackWrong` — derive from your step or use short generic text if you don’t have it.
- `evaluation`: e.g. `{ "mode": "keyword_match", "required": [ ... from validation.concepts/patterns ], "partialThreshold": 0.5, "correctThreshold": 0.8 }`.

### Cumulative seedCode

INPACT steps often use **cumulative** `seedCode`: step 1 has a small snippet; step 2 includes step 1’s code plus the next bit; etc. You can do either:

- **Option A:** Use your `starterCode` as-is for each step (no accumulation).
- **Option B:** Build cumulative code: step 1 = `starterCode` of step 1; step 2 = step 1’s full code + the new part from step 2’s `starterCode`; and so on. Your `finalCode` can be the last step’s full code.

Use whichever matches how you want the learner to progress (fresh snippet per step vs building one solution).

### learningFlow / algorithmFlow

Your `learningFlow` and `algorithmFlow` are not required by the INPACT content format. You can:

- Ignore them, or
- Use them to order or title steps, or
- Turn them into optional “reveal” steps later if you add a flowchart/reveal node type.

For a first pass, only the **steps** array (as `"question"` steps) is needed.

### finalCode / commonMistakes

- **finalCode:** Use for the last step’s `seedCode` (or as reference for cumulative build).
- **commonMistakes:** Optional: add a final “summary” step with type `"reveal"` and body listing common mistakes, or fold one short line into the last step’s `instruction` or feedback. The standard content format is focused on `"question"` steps; reveal/summary can be added if your adapter supports it.

---

## 4. Minimal example (one step)

**Your algo step:**

```json
{
  "id": "1",
  "title": "Understand the Two Sum Lesson",
  "instruction": "Read the lesson statement carefully: Given an array of integers ...",
  "analogy": "Imagine you are a cashier...",
  "hint": "Focus on what you need to return: the indices of the two numbers.",
  "starterCode": "",
  "validation": { "concepts": ["array indices", "target sum"], "patterns": [], "antiPatterns": [] }
}
```

**INPACT step:**

```json
{
  "id": "step1",
  "type": "question",
  "phase": "Step 1 of 11",
  "title": "Understand the Two Sum Lesson",
  "instruction": "Read the lesson statement carefully: Given an array of integers ...\n\n**Analogy:** Imagine you are a cashier...\n\n**Hint:** Focus on what you need to return: the indices of the two numbers.",
  "hint": "Focus on what you need to return: the indices of the two numbers.",
  "seedCode": "// Understand the lesson: two numbers in array that add to target; return their indices.\n",
  "expectedOutcome": "You understand the lesson and what to return (indices).",
  "successCriteria": ["Understand array indices and target sum."],
  "feedbackCorrect": "Great, you've got the lesson clear.",
  "feedbackPartial": "Review: we return indices of the two numbers, not the values.",
  "feedbackWrong": "Return the indices of the two numbers that add up to target.",
  "evaluation": {
    "mode": "keyword_match",
    "required": ["array", "indices", "target"],
    "partialThreshold": 0.5,
    "correctThreshold": 0.8
  }
}
```

(For a step with no code, you can still use `"type": "question"` with minimal `seedCode` and broad or empty `evaluation.required` so the user can click through, or add a dedicated “reveal” step type if your pipeline supports it.)

---

## 5. Full file shape (paste-ready template)

```json
{
  "success": true,
  "config": {
    "lessonId": "ai-js-two-sum",
    "track": "js",
    "lessonNum": 1,
    "title": "Solving Two Sum Efficiently with Hash Maps in JavaScript",
    "shortName": "Two Sum",
    "intro": {
      "tag": "LESSON #1",
      "title": "Solving Two Sum Efficiently with Hash Maps in JavaScript",
      "body": "<your description>",
      "usecase": "<your realWorldApplication>"
    },
    "objectives": [
      "Analyze the time complexity of a brute force solution for Two Sum",
      "Explain the role of a hash map in reducing time complexity from O(n²) to O(n)",
      "..."
    ],
    "steps": [
      { "id": "step1", "type": "question", "phase": "Step 1 of 11", "title": "...", "instruction": "...", "seedCode": "...", "evaluation": { "mode": "keyword_match", "required": [], "partialThreshold": 0.5, "correctThreshold": 0.8 }, ... },
      { "id": "step2", ... }
    ],
    "sideItems": [
      { "id": "intro", "label": "Intro" },
      { "id": "objectives", "label": "Objectives" },
      { "id": "step1", "label": "Step 1 title" }
    ]
  },
  "source": "content"
}
```

---

## 6. After conversion: add the lesson to the app

1. **Save the file** as `content/<track>/NNN_Title_lesson.json` (e.g. `content/js/001_Two_Sum_lesson.json`).
2. **Ensure the track has this lesson index:**  
   The server’s `getContentLesson(track, lessonIndex)` uses 0-based index: file `001_...` = index 0, `002_...` = index 1. So the track’s lesson list (or curriculum) must include this lesson at the same index if you want “Lesson 1” to open this content.
3. **Restart or rely on hot reload** so the server picks up the new file. Opening that track and that lesson index should return your JSON and the INPACT renderer will show intro → objectives → your steps with editor, validation, and “Ask your mentor”.

If you add a new track (e.g. `algorithms`) that should use content + INPACT (not the mentor AlgoEngine), add that track in the app and point its lesson list to the same `content/algorithms/` indices.

---

## 7. Reference: where format is used

- **Content load:** `server/contentLoader.js` → `getContentLesson(track, lessonIndex)`.
- **Generate API:** `server/index.js` → `POST /api/lessons/generate` checks content first, then cache/API.
- **Engine adapter:** `src/ai-lessons/adapters/normalizeToEngineConfig.js` → `aiLessonToEngineConfig(config)` builds NODES + sideItems from `config.intro`, `config.objectives`, `config.steps`, `config.sideItems`.
- **Rendering:** Same as other track/lessons via `createINPACTEngine` in `src/engines/inpact_engine_shared.jsx`.

Following this conversion, your algo JSON becomes a normal INPACT lesson that runs in the same renderer as the rest of the tracks.
