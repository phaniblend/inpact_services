You are working in the Inpact / IPF Assist Me curriculum codebase. All 40 "Coding" Assist Me modules (8 SMB products x 5 modules each) are produced by a shared generator — the assist-preview list page states: "Same INPACT lesson UI (Lesson -> Objectives -> Step N)... Regenerate Assist engines: `node scripts/write-smb-assist-engines.mjs`". A review pass across multiple products confirmed several defects are baked into that shared generator (or the scripts/data it reads), meaning each fix below should be made ONCE at the generator/template level, then re-run across all 40 modules — not hand-edited per module.

Find the generator script(s) — likely `scripts/write-smb-assist-engines.mjs` and whatever per-product data/config it reads (possibly `docs/SMB_PRODUCT_SELECTION_JOURNAL.md`-adjacent seed data, or a per-product JSON/TS config) — and make the following fixes. After each fix, regenerate and verify on at least one module from 2 different products (to confirm the fix is template-level and not accidentally product-specific), then run the full reseed pipeline (`node scripts/seed-smb-pipeline.mjs` -> `node scripts/publish-idt-assist-modules.mjs`, per the journal).

## Fix 1 (highest priority): `nextId()` helper is not collision-safe
The "Show me an example" for every BE module's "in-memory store + id helper" step currently outputs, verbatim except for the array variable name:
```js
let guests = [];
function nextId() { return String(Date.now()); }
```
`Date.now()` collides when two records are created in the same millisecond. Replace with a collision-safe pattern, e.g.:
```js
let guests = [];
let nextIdCounter = 1;
function nextId() { return String(nextIdCounter++); }
```
(or `crypto.randomUUID()` if the runtime supports it). Find every place this exact template string is generated and fix it once at the source. Confirm the fix propagates to all BE modules across at least 2 different products.

## Fix 2: "Hint & Feedback" must branch on whether a code check has run
Currently, clicking "View hint & feedback" returns the same generic boilerplate ("Feedback: review the task requirements, verify behavior step-by-step, and ensure type correctness") regardless of whether the learner has attempted the step yet, with an "Annotate my code with this feedback" action that has nothing to annotate pre-attempt. Change this so:
- **Before any code check on this step:** show a lightweight, non-answer-revealing conceptual hint specific to the step's concept (e.g. "To re-render a React component, we need to update its state. In a functional component, state is updated using hooks..." — the pattern, not the literal solution).
- **After a code check that found issues:** show the current Think-style reveal/annotation, tied to the learner's actual submitted code (this is where "annotate my code" makes sense).
Find where the Hint & Feedback modal content is generated/selected and make it conditional on check-attempt state, which should already be tracked somewhere since "CHECK MY CODE" exists as a distinct action.

## Fix 3: Add a component-definition step to every FE module
Every FE module currently starts directly with "define the TypeScript type" (Step 1), then state, then render — never explicitly having the learner define the component function shell. Add a step (new Step 1, shifting others down, or fold into existing Step 1's task text) that has the learner define e.g. `function BookingsList() { ... }` before anything else, framed around the fact that this code merges into a real component in a real codebase. Subsequent steps' code should then explicitly live inside that shell rather than as floating statements.

## Fix 4: Carry a scoped mock snippet into every step's task panel and Think modal
Currently only the Lesson page shows the DESIGN MOCK; every subsequent step (task panel, and the pre-code "Think" modal) only references it in prose ("On the first Lesson screen DESIGN MOCK...") without showing it. Add a small, scoped snippet of the mock — only the piece relevant to the current step's task, not the whole screen — to:
- every step's task panel, and
- every "Think" modal.
Pair this with an explicit "implicit fields" callout wherever the underlying data type has fields that never render in the UI (e.g. `id`), so scoping the mock doesn't imply the type is only what's visually shown: "Every row also needs a unique `id` — not shown in the UI, but required to track/update/key each item."

## Fix 5: Fix Lesson-page bullets on filter/board module variants
On board/filter modules (e.g. `idt-booking-day-board-filter`), the Lesson page's "Topics & Concepts" bullets are currently the generic list+form template verbatim and never mention filtering, even though the Objectives tab for the same module correctly includes "Filter the list in the UI so only matching rows render." Find where Lesson-page bullets are generated and parameterize them per module archetype (plain list+form / list+form+filter / conflict-check) so they match what Objectives already correctly generates.

## Fix 6: Think prompts — inline context, lead with mechanism not "where/how"
Audit all generated Think-prompt strings. Two changes:
- Replace references to "the first Lesson screen DESIGN MOCK" with inline display of the relevant mock snippet (ties to Fix 4).
- Where a prompt currently opens with an ambiguous "where"/"how" (e.g. "Where should that growing list live so the screen redraws?"), rephrase to state the underlying mechanism first, then ask the choice — e.g. "Rows in this list are rendered from data stored in an array. What's the best way to store that array so it updates the screen the moment a new record is added?"

## Fix 7: Deep-dive modals should lead with the general concept, and use one consistent trigger pattern
Currently, at least one module's deep-dive modal opens by restating the task instruction verbatim ("Define a TypeScript type for one item in a list") instead of explaining the underlying principle (why a shared type matters: single source of truth, compiler catches list/form mismatches, refactor safety) before the applied example. Separately, the trigger pattern is inconsistent — some modules force this modal open on first encounter (blocking the editor), others show it as an optional self-triggered "Hungry for more?" panel. Standardize on the optional/self-triggered pattern everywhere, and rewrite deep-dive copy to lead with the general concept.

## Fix 8: Analogous examples must be complete, runnable code
Currently examples for JSX-returning steps show bare expressions with no `return`, e.g. `guests.map((g) => <li key={g.id}>{g.name}</li>)`. Since JSX only works inside a `return` (or assignment), and the target learner may not know that yet, wrap examples in the full returnable shape: `return <ul>{guests.map(g => <li key={g.id}>{g.name}</li>)}</ul>;`. Also update the corresponding task text to state the action explicitly, e.g. "Now that you have the data as an array you can iterate over, return the JSX that renders each item as a row."

## Fix 9: Make "why this matters" real-world grounding mandatory, not optional
Some generated "why this matters" copy already grounds well in real business stakes (good examples to copy the style of: "Overdue must be computed from due date and paid — never trusted from the client body"; "Operators scan one provider's day. Filtering a list without destroying the full dataset is a core frontend skill"). Others stay purely mechanical (e.g. explaining what `map()` and `key` do syntactically with no real-world tie-in). Find the "why this matters" generation logic and make the real-world/enterprise grounding a required element, not something that varies by step.

## Fix 10 (lower priority — audit only): Task text should not spoil Think-prompt answers
At least one instance found where a step's task text states the exact implementation choice (e.g. "...with useState...") that the immediately preceding Think-prompt MCQ was designed to make the learner reason toward. Audit all generated task-text strings for any hook/API name that duplicates what a preceding Think prompt already asks the learner to choose, and remove the redundant naming from the task text — let the task describe the *what/why*, not the specific API the learner just chose in the Think prompt.

## Fix 11 (lower priority): Duplicate-prevention module title/rule accuracy
`idt-lead-notes-api`'s title says "block empty duplicate spam" but the actual described rule is "same leadId + same body already stored -> conflict" (exact-duplicate content, not specifically empty content). Audit titles across all duplicate-prevention BE modules (Lead-notes, Quote-lines, Review-replies, Reminder-templates) to make sure each title accurately describes its actual conflict rule.

---

After completing fixes, regenerate all 40 modules and spot-check at least 2 modules per product (one FE, one BE) to confirm nothing broke and the fixes actually propagated — since these are template-level changes, a single regen should apply everywhere, but verify rather than assume.
