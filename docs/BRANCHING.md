# Git branches: `main` vs `production`

## `main` (default development)

- **Use this branch** for day-to-day work: features, lesson drafts, experiments, and full generated lesson assets.
- **`content/generated/react-ts/`** may include every validated lesson JSON (001, 002, 003, …) as they are tested and merged.
- Push and open PRs against **`main`** unless you are doing a controlled production release step.

## `production` (stable / learner-facing snapshot)

- Contains the same application code as **`main`**, but **`content/generated/react-ts/` is intentionally minimal**: only the **first seven** React · TS lessons that are fully tested and **locked**:
  - `001_counter-app_lesson.json`
  - `002_toggle-visibility_lesson.json`
  - `003_controlled-input_lesson.json`
  - `004_multiple-state-variables_lesson.json`
  - `005_conditional-rendering-with-ternary_lesson.json`
  - `006_list-rendering-with-map_lesson.json`
  - `007_useeffect-side-effects_lesson.json`
- Do **not** add lesson **008+** generated JSON files on `production`.
- **Do not develop directly on `production`.** When promoting work: merge `main` into `production`, then **remove** any `content/generated/react-ts/008_*` and higher so only `001_*`–`007_*` remain (same as running `git rm` on those files and committing). Future merges from `main` will reintroduce 008+ until you delete them again on `production`.

## Locked React · TS lessons (001–007)

Engines (source of truth for the app UI):

- `src/engines/react-ts/inpact_ts01_engine.jsx` — Counter  
- `src/engines/react-ts/inpact_ts02_engine.jsx` — Toggle visibility  
- `src/engines/react-ts/inpact_ts03_engine.jsx` — Controlled input  
- `src/engines/react-ts/inpact_ts04_engine.jsx` — Multiple state variables  
- `src/engines/react-ts/inpact_ts05_engine.jsx` — Conditional rendering with ternary  
- `src/engines/react-ts/inpact_ts06_engine.jsx` — List rendering with map  
- `src/engines/react-ts/inpact_ts07_engine.jsx` — useEffect and side effects  

Treat edits to these as **content/product** changes; coordinate before changing steps or evaluation.

See also `docs/ENGINE_OVERHAUL_STATUS.md`.
