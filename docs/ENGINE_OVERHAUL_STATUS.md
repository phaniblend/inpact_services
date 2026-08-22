# Engine Overhaul Status

This doc tracks which tracks/lessons follow the **canonical engine pattern** (see `.cursor/rules/engines-overhaul.mdc`) and what remains to be aligned. Use it to compound context across sessions: when implementing the final pattern in remaining lessons, follow the rule and update this status.

---

## Canonical pattern (short)

- **Engine file**: `src/engines/<track>/inpact_<track><flavor><num>_engine.jsx` → single import from `../inpact_engine_shared`, `NODES`, `sideItems`, `export default createINPACTEngine({ NODES, sideItems, lessonNum, title, shortName })`.
- **Index file**: `inpact_<track>_index.js` (or `inpact_<track>f_index.js`) → `export const CURRICULUM = [ { id, shortName, title, why } ]` in same order as engines in App.jsx.
- **Node types**: `reveal` (intro), `objectives`, `question` (with paal, answer_keywords, seed_code, feedback_*, expected).

**Content rules for reveal (intro)** — apply to all engines:
- **body**: Only what the learner has to build and what the user will see in the UI. No implementation details, language names, or technical concepts (e.g. no "use TypeScript", "useState", "type-safe").
- **usecase** ("💡 WHY THIS MATTERS"): Real-world, practical usage in apps (e.g. "counter in shopping cart for quantity"). Not educational rationale (e.g. not "typing useState is the foundation for type-safe React").

**Learning objectives** — apply to all engines:
- **Measurable**: Each objective describes what the learner is taking home and can do or explain after the lesson. Use action verbs (Use, Define, Explain, Assign, Distinguish, Structure, Export). Concrete, demonstrable skills — not vague. **Benchmark**: React JS `inpact_p01_engine.jsx` objectives (locked; use as reference only).

Reference engines: `el/inpact_el01_engine.jsx`, `typescript/inpact_tsf01_engine.jsx`. **Locked (do not edit)**: React JS p01, p02 — done in all respects (content, LOs, layout, code persistence, feedback, editor height, min-width). **First 5 finalized with content rules**: React JS p01–p02 (locked), p03–p05; React TS `inpact_ts01_engine.jsx` (Counter) updated to match.

---

## Tracks and status

| Track        | Folder(s)     | Index file              | Status / notes |
|-------------|---------------|--------------------------|----------------|
| TypeScript  | typescript/   | inpact_tsf_index.js      | ✅ Pattern set (tsf01–tsf10). Reference. |
| JavaScript  | javascript/, JS/ | inpact_jsf_index, inpact_js_index | ✅ Fundamentals + deep dive. |
| Node        | node/         | inpact_nodef_index.js    | ✅ nodef01–nodef15. |
| Express     | express/      | inpact_expf_index.js     | ✅ expf01–expf12. |
| Python      | python/       | inpact_pyf_index.js      | ✅ pyf01–pyf12. |
| EL          | el/           | inpact_el_index.js       | ✅ el01–el10. Reference (content-rich). |
| FE          | fe/           | inpact_fe_index.js       | ✅ fe01–fe10. |
| SD          | sd/           | inpact_sd_index.js       | ✅ sd01–sd15. |
| PE          | pe/           | inpact_pe_index.js       | ✅ pe01–pe12. |
| SEC         | sec/          | inpact_sec_index.js      | ✅ sec01–sec06. |
| React (JS)  | react-js/     | (LandingPage LESSON_LIST) | 🔒 **p01, p02 locked** (do not edit). p03–p05 finalized (body + usecase). Rest: apply same rules. |
| React (TS)  | react-ts/     | (LandingPage LESSON_LIST) | 🔒 **ts01–ts07 locked** — production `content/generated/react-ts/` ships **001–007**; see `docs/BRANCHING.md`. |
| Angular     | angular/      | angular_curriculum_index, inpact_angf_index | 🔄 Mix of angular_* and inpact_angf*; align to one naming + pattern. |
| Vue         | vue/          | inpact_vue_index, inpact_vuef_index | 🔄 Align all to NODES/sideItems/createINPACTEngine. |
| CSS         | css/          | inpact_css_index.js      | ✅ Uses language/answerShape/getOutputPreview where needed. |

**Legend**: ✅ = follows canonical pattern; 🔄 = to be aligned (same structure, naming, or both).

---

## How to use this for “remaining lessons”

1. **Pick a track** from the table above (prefer 🔄 or a new track).
2. **Open** `.cursor/rules/engines-overhaul.mdc` (Cursor will apply it when working under `src/engines/`).
3. **Copy structure** from a reference engine (`el/inpact_el01_engine.jsx` or `typescript/inpact_tsf01_engine.jsx`).
4. **Implement** one lesson at a time: same NODES shape (reveal → objectives → question steps), same createINPACTEngine config, curriculum entry in same order.
5. **Wire** new engines in App.jsx (import + add to the right `ENGINES_*` array).
6. **Update this table** when a track or lesson is done (e.g. change 🔄 to ✅ and add a short note).

---

## Implementing the final pattern in bulk

When applying the pattern to many lessons in a track:

- Keep **one engine file per lesson**; name it `inpact_<track><flavor><num>_engine.jsx`.
- In each file: same three blocks — `NODES`, `sideItems`, `export default createINPACTEngine(...)`.
- Preserve lesson content (paal, seed_code, feedback, objectives) while fitting it into the canonical node types.
- Add optional config only when needed: `language`, `answerShape: "css-tabs"`, `getOutputPreview`, `defaultHtml`.

After each batch, run the app and click through the track to confirm order and rendering, then update the status table above.
