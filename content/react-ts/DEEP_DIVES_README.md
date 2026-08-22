# React · TS deep dives

Single source of truth for per-lesson deep-dive modal copy (hooks, SVG diagrams in `hook`, etc.):

- **`000_deep_dives.json`** — keyed by lesson slug (`001_Counter_App`, … `122_…`). Each entry has `label` and `deepDive`:
  - `hook` — opening section; may include raw `<svg>…</svg>` plus prose (rendered by `RichLearnerText` in `DeepDiveModal`)
  - `pain`, `mentalModel`, `discover`, `dryRun`, `build` — markdown-style sections

Optional per entry:

- **`introductionStepId`** — e.g. `"step4"`. Defaults to **`step1`** if omitted (which step shows the deep-dive button).
- **`showDeepDiveInIntro: true`** — deep dive appears on the lesson intro / objectives screens only, not on editor steps.

## App wiring

`src/learn/conceptGlossary.js` imports this file and maps key prefix `001_` → lesson / lesson number **1**, etc.

## Editing

Edit `000_deep_dives.json` directly. Ensure valid JSON (commas, escaped quotes inside strings). After changes, run the app or `JSON.parse` locally to validate.
