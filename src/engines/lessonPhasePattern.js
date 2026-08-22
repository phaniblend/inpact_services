/**
 * Standard 5-phase pattern for incremental React/TS (and similar) build steps.
 * Use clear nouns (button, input, form field) — avoid vague "control" unless you mean form controls in spec jargon.
 *
 * 1 — Imports: required libraries/components (seed may include imports for learners).
 * 2 — State & types: useState, interfaces, typed stubs, refs as the step requires.
 * 3 — JSX: return the UI structure (layout, buttons, inputs, text) without wiring events yet when the next steps teach handlers separately.
 * 4 — Handlers: functions that update state / side effects; not yet bound in JSX if wiring is phase 5.
 * 5 — Wire: connect onClick/onChange/etc. and finish behavior (e.g. conditional render); export if required.
 */
export const LESSON_CODE_PHASES = [
  { phase: 1, key: "imports", label: "Imports", hint: "Import only what this file needs." },
  { phase: 2, key: "state", label: "State & types", hint: "State, interfaces, and typed values live here." },
  { phase: 3, key: "jsx", label: "JSX", hint: "Return structure: layout, buttons, inputs, copy — clarity over jargon." },
  { phase: 4, key: "handlers", label: "Handlers", hint: "Named functions or arrows that call setState / logic." },
  { phase: 5, key: "wire", label: "Wire & finish", hint: "Bind handlers to JSX and complete visibility/validation/export as asked." },
];

export function phaseStepLabel(stepIndex, totalSteps, phaseSummary) {
  return `Step ${stepIndex} of ${totalSteps} — ${phaseSummary}`;
}
