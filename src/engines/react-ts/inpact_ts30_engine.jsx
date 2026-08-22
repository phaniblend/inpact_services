import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
{
  id: "intro",
  type: "reveal",
  phase: "Lesson",
  content: {
    tag: "LESSON #30 (React Hooks)",
    title: "useReducer — Complex State",
    body: "Lesson 29 introduced a simple selection reducer. Real enterprise reducers manage richer state — a shipment form with many fields, validation errors, and submission status all tied together. In this lesson you'll build a multi-field form reducer where every field change, validation, and submission is an action, and the reducer enforces state transitions that are impossible to violate. You'll also add async side effects triggered by dispatch using the useEffect + state pattern.",
    usecase:
      "A new shipment form collects five fields, validates them on blur, shows field-level errors, and has a submitting state that disables inputs during API calls. With useState, coordinating all of this requires careful manual synchronisation across many setters. With useReducer, every transition is an explicit action and the state machine is impossible to put in an invalid state.",
  },
},
{
  id: "prereqs",
  type: "prereqs",
  phase: "Prerequisites",
  items: [
    {
      lesson: 1,
      label: "JSX — The Full Language",
      reason: "The form renders JSX driven by reducer state — field values, error messages, and disabled states. You need JSX foundations before building a reducer-driven form.",
    },
    {
      lesson: 2,
      label: "Inventory row — readonly fields, unions, nested types",
      reason: "The form state and error state are typed interfaces. You need to know how to define TypeScript interfaces before modelling complex reducer state shapes.",
    },
    {
      lesson: 5,
      label: "Props — Typing What a Component Receives",
      reason: "The form accepts an onSubmit callback prop. You need to know how to type function props before wiring them to a reducer-driven submission handler.",
    },
    {
      lesson: 8,
      label: "useState — Primitives",
      reason: "This lesson compares useReducer to useState for the same problem. You need to understand useState's limitations with complex coordinated state before fully appreciating the reducer approach.",
    },
    {
      lesson: 29,
      label: "useReducer — Basics",
      reason: "This lesson extends the reducer pattern to complex form state. You need the state/action/reducer/dispatch foundations from Lesson 29 before applying them to multi-field forms with async transitions.",
    },
  ],
},
{
  id: "objectives",
  type: "objectives",
  phase: "Objectives",
  items: [
    "Model a multi-field form with field values, errors, and submission status in a single reducer",
    "Handle field changes, blur validation, and submission as distinct action types",
    "Trigger async side effects based on reducer state using useEffect",
    "Use the reducer pattern to enforce valid state transitions (no submission while invalid)",
    "Extract a custom useShipmentForm hook that encapsulates the reducer and returns a clean API",
  ],
},
{
  id: "step1",
  type: "question",
  phase: "Step 1 of 5",
  paal: "Define the ShipmentFormState interface — fields object (shipmentId, destination, carrier as strings), errors object (same keys, string | null), and a status union ('idle' | 'submitting' | 'success' | 'error').",
  hint: "Separate the field values from the error messages. Both have the same keys but different value types. status is a union of four string literals.",
  example_code: `interface LoginFormState {
  fields: { email: string; password: string };
  errors: { email: string | null; password: string | null };
  status: 'idle' | 'submitting' | 'success' | 'error';
}`,
  think_prompt:
    "Keeping fields and errors as separate sub-objects (rather than flat on the state) makes the structure easier to update with spread — you update `fields.shipmentId` without touching `errors`, and vice versa. What does the TypeScript interface for this look like?",
  mc_options: [
    "interface ShipmentFormState { shipmentId: string; destination: string; carrier: string; shipmentIdError: string | null; ... }",
    "interface ShipmentFormState { fields: { shipmentId: string; destination: string; carrier: string }; errors: { shipmentId: string | null; destination: string | null; carrier: string | null }; status: 'idle' | 'submitting' | 'success' | 'error'; }",
    "interface ShipmentFormState { fields: Record<string, string>; errors: Record<string, string | null>; status: string; }",
  ],
  mc_correct_option:
    "interface ShipmentFormState { fields: { shipmentId: string; destination: string; carrier: string }; errors: { shipmentId: string | null; destination: string | null; carrier: string | null }; status: 'idle' | 'submitting' | 'success' | 'error'; }",
  mc_anchor:
    "The grouped sub-object approach (fields + errors) is the cleanest — updates to one group don't affect the other, and the structure mirrors how the form template works (each field has a value and an error). Flat state (`shipmentIdError`) works but becomes unwieldy with many fields. `Record<string, string>` loses field-level type safety — TypeScript won't catch typos in field names.",
  why_this_matters:
    "Well-structured form state makes reducers easy to write and the form template easy to reason about. The fields/errors grouping is used in React Hook Form's internal state model and every mature form management library. Seeing it in a useReducer context makes the library's design choices understandable.",
  answer_keywords: [
    "ShipmentFormState", "fields", "shipmentId", "destination", "carrier",
    "errors", "string | null", "status",
    "'idle'", "'submitting'", "'success'", "'error'",
  ],
  seed_code: ``,
  starter_code: `// define ShipmentFormState interface
// fields: { shipmentId, destination, carrier } — all strings
// errors: { shipmentId, destination, carrier } — all string | null
// status: 'idle' | 'submitting' | 'success' | 'error'`,
  feedback_correct:
    "Exactly — fields and errors as separate sub-objects keep the state clear. status as a union of literals makes impossible status values a TypeScript error.",
  feedback_partial:
    "Close — make sure errors uses `string | null` (not just string) so null means no error, and that status is a string literal union (not just string).",
  feedback_wrong:
    "Interface: `interface ShipmentFormState { fields: { shipmentId: string; destination: string; carrier: string; }; errors: { shipmentId: string | null; destination: string | null; carrier: string | null; }; status: 'idle' | 'submitting' | 'success' | 'error'; }`",
  expected: `interface ShipmentFormState {
  fields: {
    shipmentId: string;
    destination: string;
    carrier: string;
  };
  errors: {
    shipmentId: string | null;
    destination: string | null;
    carrier: string | null;
  };
  status: 'idle' | 'submitting' | 'success' | 'error';
}`,
  analog_example: `interface RegistrationFormState {
  fields: { username: string; email: string; password: string };
  errors: { username: string | null; email: string | null; password: string | null };
  status: 'idle' | 'submitting' | 'success' | 'error';
}`,
  deepDiveLabel:
    "fields and errors share the same keys — can TypeScript enforce this relationship?",
  deepDive: {
    hook: "fields has shipmentId, destination, carrier. errors has the same three keys. You add a fourth field: notes. You add it to fields. Forget to add it to errors. TypeScript says nothing — the two are independent interfaces.",
    pain: "⚠️ **Lesson:** fields and errors always have the same keys — they should grow together. How do you use TypeScript's mapped types to derive the errors type from the fields type automatically?",
    mentalModel:
      "TypeScript's mapped types let you transform one type into another:\n\n```tsx\ninterface ShipmentFields {\n  shipmentId: string;\n  destination: string;\n  carrier: string;\n}\n\n// Derived errors type — same keys, values are string | null\ntype ShipmentErrors = {\n  [K in keyof ShipmentFields]: string | null;\n};\n\n// Or using Record with keyof:\ntype ShipmentErrors = Record<keyof ShipmentFields, string | null>;\n\ninterface ShipmentFormState {\n  fields: ShipmentFields;\n  errors: ShipmentErrors; // automatically has the same keys as fields\n  status: 'idle' | 'submitting' | 'success' | 'error';\n}\n```\n\nNow when you add `notes` to ShipmentFields, TypeScript immediately errors on ShipmentErrors if `notes: string | null` is missing.",
    discover:
      "```tsx\n// ✅ derived errors — always in sync with fields\ntype FormFields = { shipmentId: string; destination: string; carrier: string };\ntype FormErrors = Record<keyof FormFields, string | null>;\n// Add 'notes' to FormFields → TypeScript errors on FormErrors\n\n// ✅ generic form state\ninterface FormState<T extends Record<string, string>> {\n  fields: T;\n  errors: Record<keyof T, string | null>;\n  status: 'idle' | 'submitting' | 'success' | 'error';\n}\n// Usage:\ntype ShipmentFormState = FormState<ShipmentFields>;\n```",
    quickRules:
      "- ✅ `Record<keyof Fields, string | null>` for errors type derived from fields type\n- ✅ generic `FormState<T>` for reusable form state pattern\n- ❌ independent interfaces — fields and errors can diverge silently\n- TypeScript mapped types enforce structural relationships at compile time",
    watchOut:
      "👀 **Watch out:** The generic `FormState<T extends Record<string, string>>` approach is elegant but adds complexity. Use the simple separate interfaces first; refactor to generics when you have 3+ forms with the same pattern.",
    dryRun:
      "🔁 **Think:** `type FormErrors = Record<keyof ShipmentFields, string | null>`. You add `eta: string` to ShipmentFields. What does TypeScript report on FormErrors — error, warning, or nothing? What would you need to add to fix it?",
    build:
      "**Learning focus:** Define complex form state with a fields/errors/status structure — and understand how TypeScript mapped types can enforce that errors always mirror the fields type.",
  },
},
{
  id: "step2",
  type: "question",
  phase: "Step 2 of 5",
  paal: "Define the ShipmentFormAction union with four action types: SET_FIELD (field name + value), VALIDATE_FIELD (field name), SUBMIT (no payload), and RESET (no payload).",
  hint: "SET_FIELD and VALIDATE_FIELD need a field key payload — type it as `keyof ShipmentFormState['fields']` for type safety. SUBMIT and RESET take no payload.",
  example_code: `type FormAction =
  | { type: 'SET_FIELD'; field: keyof FormState['fields']; value: string }
  | { type: 'VALIDATE_FIELD'; field: keyof FormState['fields'] }
  | { type: 'SUBMIT' }
  | { type: 'RESET' };`,
  think_prompt:
    "SET_FIELD needs to know WHICH field to update and the new value. VALIDATE_FIELD needs to know WHICH field to validate. Typing the field key as `keyof ShipmentFormState['fields']` restricts it to 'shipmentId' | 'destination' | 'carrier' — a typo like 'shipmentid' is a TypeScript error.",
  mc_options: [
    "{ type: 'SET_FIELD'; field: string; value: string } — field as any string",
    "{ type: 'SET_FIELD'; field: keyof ShipmentFormState['fields']; value: string }",
    "{ type: 'SET_FIELD'; shipmentId?: string; destination?: string; carrier?: string }",
  ],
  mc_correct_option:
    "{ type: 'SET_FIELD'; field: keyof ShipmentFormState['fields']; value: string }",
  mc_anchor:
    "`keyof ShipmentFormState['fields']` is the union `'shipmentId' | 'destination' | 'carrier'`. Dispatching `{ type: 'SET_FIELD', field: 'shipmentid' }` would be a TypeScript error — catching a typo that would silently update nothing. The string field loses all that safety. The one-field-per-action approach would require separate action types per field — an explosion of boilerplate.",
  why_this_matters:
    "Using `keyof` to type dynamic field names is a pattern that appears throughout TypeScript React codebases — form handlers, API query params, settings objects. It gives you both the flexibility of dynamic field access and the safety of compile-time exhaustiveness.",
  answer_keywords: [
    "ShipmentFormAction", "SET_FIELD", "field",
    "keyof", "ShipmentFormState", "'fields'", "value", "string",
    "VALIDATE_FIELD", "SUBMIT", "RESET",
  ],
  seed_code: `interface ShipmentFormState {
  fields: { shipmentId: string; destination: string; carrier: string; };
  errors: { shipmentId: string | null; destination: string | null; carrier: string | null; };
  status: 'idle' | 'submitting' | 'success' | 'error';
}`,
  starter_code: `interface ShipmentFormState {
  fields: { shipmentId: string; destination: string; carrier: string; };
  errors: { shipmentId: string | null; destination: string | null; carrier: string | null; };
  status: 'idle' | 'submitting' | 'success' | 'error';
}

// define ShipmentFormAction union
// SET_FIELD: field (keyof fields), value (string)
// VALIDATE_FIELD: field (keyof fields)
// SUBMIT: no payload
// RESET: no payload`,
  feedback_correct:
    "Exactly — `keyof ShipmentFormState['fields']` constrains field to the three valid field names. TypeScript errors on typos in dispatched actions.",
  feedback_partial:
    "Close — make sure the field parameter is typed as `keyof ShipmentFormState['fields']` (not just string), and that SUBMIT and RESET have no payload fields.",
  feedback_wrong:
    "Union: `type ShipmentFormAction = | { type: 'SET_FIELD'; field: keyof ShipmentFormState['fields']; value: string } | { type: 'VALIDATE_FIELD'; field: keyof ShipmentFormState['fields'] } | { type: 'SUBMIT' } | { type: 'RESET' };`",
  expected: `type ShipmentFormAction =
  | { type: 'SET_FIELD'; field: keyof ShipmentFormState['fields']; value: string }
  | { type: 'VALIDATE_FIELD'; field: keyof ShipmentFormState['fields'] }
  | { type: 'SUBMIT' }
  | { type: 'RESET' };`,
  analog_example: `type SettingsAction =
  | { type: 'UPDATE_SETTING'; key: keyof UserSettings; value: string | boolean }
  | { type: 'RESET_SETTINGS' };`,
  deepDiveLabel:
    "`keyof` types the field name — but what about value types that differ per field?",
  deepDive: {
    hook: "SET_FIELD types value as `string` for all fields. But if you add a `quantity: number` field to the form, passing a string value for it would be wrong — but TypeScript would accept it. How do you type `value` to match the actual type of the specific `field`?",
    pain: "⚠️ **Lesson:** `field: keyof Fields; value: string` loses the relationship between field name and value type. If fields have different types, how do you express 'value must match the type of field'?",
    mentalModel:
      "TypeScript's indexed access type with a generic constraint:\n\n```tsx\ntype FormAction<T extends Record<string, unknown>> =\n  | { type: 'SET_FIELD'; field: keyof T; value: T[keyof T] } // too broad\n  | <K extends keyof T>{ type: 'SET_FIELD'; field: K; value: T[K] }; // precise but can't use in union directly\n\n// Cleaner: generic action for the specific dispatch call\ntype SetFieldAction<T, K extends keyof T> = { type: 'SET_FIELD'; field: K; value: T[K] };\n```\n\nFor forms where all values are strings (most form inputs), `value: string` is perfectly correct — inputs always produce strings. Only add generic complexity when field types genuinely differ.",
    discover:
      "```tsx\n// ✅ value: string — correct for forms (inputs always produce strings)\n{ type: 'SET_FIELD'; field: keyof Fields; value: string }\n\n// ✅ linked value type for mixed-type fields (advanced)\ntype SetField<T, K extends keyof T = keyof T> = { type: 'SET_FIELD'; field: K; value: T[K] };\n// value type is automatically T[K] for any given field K\n```",
    quickRules:
      "- ✅ `value: string` for standard text form fields — inputs always produce strings\n- ✅ `value: T[K]` with generics for mixed-type settings objects\n- ✅ `keyof` for field name — prevents typos in dispatched actions\n- ❌ generic complexity for forms where all values are strings — YAGNI",
    watchOut:
      "👀 **Watch out:** Even numeric form inputs (`type='number'`) produce string values via `e.target.value`. Parse them in the reducer: `parseInt(state.fields.quantity, 10)` when reading for calculation. Store as string in the form, convert when needed.",
    dryRun:
      "🔁 **Think:** You dispatch `{ type: 'SET_FIELD', field: 'shipmentId', value: 'NX-001' }`. TypeScript checks: is 'shipmentId' a keyof ShipmentFormState['fields']? Is 'NX-001' a string? Both valid. Now dispatch with `field: 'shipmentid'` (typo). TypeScript: error or silent?",
    build:
      "**Learning focus:** Type action payloads with `keyof` for dynamic field names — understanding that this prevents typos at dispatch time and how to extend to value-type linking for mixed-type state objects.",
  },
},
{
  id: "step3",
  type: "question",
  phase: "Step 3 of 5",
  paal: "Write the shipmentFormReducer. SET_FIELD updates the field value and clears its error. VALIDATE_FIELD validates the field and sets an error if empty. SUBMIT sets status to 'submitting'. RESET returns the initial state.",
  hint: "Nested state updates use nested spreads: `{ ...state, fields: { ...state.fields, [action.field]: action.value } }`. The computed property key `[action.field]` is valid because field is typed as a union of string literal keys.",
  example_code: `case 'SET_FIELD':
  return {
    ...state,
    fields: { ...state.fields, [action.field]: action.value },
    errors: { ...state.errors, [action.field]: null },
  };`,
  think_prompt:
    "SUBMIT should only be allowed when status is 'idle' — if already submitting, the action should be ignored. How do you guard against invalid state transitions in a reducer?",
  mc_options: [
    "SUBMIT always sets status to 'submitting' regardless of current status",
    "SUBMIT checks if status is 'idle' and only transitions if so — otherwise returns state",
    "SUBMIT is handled outside the reducer in the event handler",
  ],
  mc_correct_option:
    "SUBMIT checks if status is 'idle' and only transitions if so — otherwise returns state",
  mc_anchor:
    "The reducer is the state machine — it enforces valid transitions. A guard in SUBMIT (`if (state.status !== 'idle') return state;`) prevents double-submission: a user clicking Submit twice only triggers one submission. This is one of the key advantages of the reducer pattern — impossible state transitions are enforced in one place, not scattered across event handlers.",
  why_this_matters:
    "State machine thinking is what makes reducers powerful. Not just 'what state change does this action produce' but 'is this action even valid in the current state?' Preventing double submissions, preventing field changes while submitting, and enforcing valid status transitions are all achievable in the reducer without any logic in the UI.",
  answer_keywords: [
    "shipmentFormReducer", "SET_FIELD", "fields", "errors",
    "VALIDATE_FIELD", "SUBMIT", "'submitting'", "RESET",
    "status", "'idle'", "guard",
  ],
  seed_code: `interface ShipmentFormState {
  fields: { shipmentId: string; destination: string; carrier: string; };
  errors: { shipmentId: string | null; destination: string | null; carrier: string | null; };
  status: 'idle' | 'submitting' | 'success' | 'error';
}

type ShipmentFormAction =
  | { type: 'SET_FIELD'; field: keyof ShipmentFormState['fields']; value: string }
  | { type: 'VALIDATE_FIELD'; field: keyof ShipmentFormState['fields'] }
  | { type: 'SUBMIT' }
  | { type: 'RESET' };

const INITIAL_FORM_STATE: ShipmentFormState = {
  fields: { shipmentId: '', destination: '', carrier: '' },
  errors: { shipmentId: null, destination: null, carrier: null },
  status: 'idle',
};`,
  starter_code: `// (types and INITIAL_FORM_STATE defined above)

// write shipmentFormReducer here
// SET_FIELD: update field value, clear field error
// VALIDATE_FIELD: if field is empty string, set error; else clear error
// SUBMIT: guard — only transition if status === 'idle'
// RESET: return INITIAL_FORM_STATE
// default: return state`,
  feedback_correct:
    "Exactly — SET_FIELD uses nested spread with computed property key. VALIDATE_FIELD checks the field value and sets or clears the error. SUBMIT guards against double-submission. RESET returns the extracted initial state constant.",
  feedback_partial:
    "Close — check the SUBMIT guard (`if (state.status !== 'idle') return state;`) and make sure SET_FIELD clears the field's error at the same time it updates the value.",
  feedback_wrong:
    "Switch on action.type: SET_FIELD → `{ ...state, fields: { ...state.fields, [action.field]: action.value }, errors: { ...state.errors, [action.field]: null } }`. VALIDATE_FIELD → check if `state.fields[action.field]` is empty, set or clear error. SUBMIT → guard `if (state.status !== 'idle') return state`, else `{ ...state, status: 'submitting' }`. RESET → `INITIAL_FORM_STATE`.",
  expected: `const shipmentFormReducer = (
  state: ShipmentFormState,
  action: ShipmentFormAction
): ShipmentFormState => {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        fields: { ...state.fields, [action.field]: action.value },
        errors: { ...state.errors, [action.field]: null },
      };

    case 'VALIDATE_FIELD': {
      const value = state.fields[action.field];
      const error = value.trim() === '' ? \`\${action.field} is required\` : null;
      return {
        ...state,
        errors: { ...state.errors, [action.field]: error },
      };
    }

    case 'SUBMIT':
      if (state.status !== 'idle') return state;
      return { ...state, status: 'submitting' };

    case 'RESET':
      return INITIAL_FORM_STATE;

    default:
      return state;
  }
};`,
  analog_example: `case 'UPDATE_QUANTITY':
  return {
    ...state,
    items: { ...state.items, [action.itemId]: action.quantity },
  };`,
  deepDiveLabel:
    "SUBMIT sets status to 'submitting' — but how does the actual API call happen?",
  deepDive: {
    hook: "The reducer sets status to 'submitting'. But reducers are pure functions — no side effects, no API calls. How does the actual HTTP request fire after dispatch({ type: 'SUBMIT' })?",
    pain: "⚠️ **Lesson:** Reducers can't make API calls — they're pure. How do you trigger async side effects in response to a state transition caused by dispatch?",
    mentalModel:
      "The pattern: **reducer changes state → useEffect watches state → effect triggers the side effect**.\n\n```tsx\nuseEffect(() => {\n  if (state.status !== 'submitting') return;\n\n  const submit = async () => {\n    try {\n      await api.createShipment(state.fields);\n      dispatch({ type: 'SET_STATUS'; payload: 'success' }); // or add SUCCESS action\n    } catch (err) {\n      dispatch({ type: 'SET_STATUS'; payload: 'error' });\n    }\n  };\n\n  submit();\n}, [state.status]); // fires when status becomes 'submitting'\n```\n\nThis is called the **reducer + effect** pattern. The reducer stays pure. The effect watches for specific state transitions and triggers side effects. React's component model enforces the separation.",
    discover:
      "```tsx\n// ✅ reducer + effect pattern\nuseEffect(() => {\n  if (state.status !== 'submitting') return;\n  doAsyncWork().then(\n    () => dispatch({ type: 'SUCCESS' }),\n    (err) => dispatch({ type: 'ERROR', payload: err.message })\n  );\n}, [state.status]);\n\n// ✅ alternative: handle in event handler (simpler for small cases)\nconst handleSubmit = async () => {\n  dispatch({ type: 'SUBMIT' });\n  try {\n    await apiCall();\n    dispatch({ type: 'SUCCESS' });\n  } catch { dispatch({ type: 'ERROR' }); }\n};\n```",
    quickRules:
      "- ✅ reducer + effect: state machine drives side effects declaratively\n- ✅ event handler async: simpler for straightforward cases\n- ❌ side effects in reducer: breaks purity, breaks testability\n- ✅ add SUCCESS and ERROR actions to complete the state machine",
    watchOut:
      "👀 **Watch out:** The `[state.status]` dependency causes the effect to re-run any time status changes — including when it changes from 'submitting' to 'success'. Add the `if (state.status !== 'submitting') return;` guard at the top to only run the side effect in the submitting state.",
    dryRun:
      "🔁 **Think:** User clicks Submit. `dispatch({ type: 'SUBMIT' })` runs. Reducer transitions status to 'submitting'. React re-renders. useEffect fires with [state.status] dependency — status changed. What does the effect do? API call succeeds. What action is dispatched next?",
    build:
      "**Learning focus:** Write a reducer that guards invalid transitions — and understand the reducer + effect pattern for triggering async side effects in response to pure state transitions.",
  },
},
{
  id: "step4",
  type: "question",
  phase: "Step 4 of 5",
  paal: "Build the ShipmentForm component — wire all fields to SET_FIELD, all blur handlers to VALIDATE_FIELD, and the submit handler to SUBMIT. Disable all inputs when status is 'submitting'.",
  hint: "Each input: value from state.fields.X, onChange dispatches SET_FIELD, onBlur dispatches VALIDATE_FIELD. The submit button and inputs are disabled when status === 'submitting'. Show error messages from state.errors.X.",
  example_code: `<input
  value={state.fields.shipmentId}
  onChange={e => dispatch({ type: 'SET_FIELD', field: 'shipmentId', value: e.target.value })}
  onBlur={() => dispatch({ type: 'VALIDATE_FIELD', field: 'shipmentId' })}
  disabled={state.status === 'submitting'}
/>
{state.errors.shipmentId && <p className="error">{state.errors.shipmentId}</p>}`,
  think_prompt:
    "Every field follows the same three-part pattern: controlled value from reducer state, onChange dispatching SET_FIELD, onBlur dispatching VALIDATE_FIELD. How does having the reducer centralise all this logic compare to the manual useState approach with per-field setters and validation functions?",
  mc_options: [
    "Each field needs its own onChange and onBlur handler functions defined separately",
    "All three fields follow the same inline pattern — SET_FIELD with the field name and VALIDATE_FIELD with the field name",
    "Only the submit button needs to be wired — fields are uncontrolled",
  ],
  mc_correct_option:
    "All three fields follow the same inline pattern — SET_FIELD with the field name and VALIDATE_FIELD with the field name",
  mc_anchor:
    "The reducer pattern enables a uniform template — every field has the same three attributes, only the field name changes. Extracting separate handler functions per field would add boilerplate without benefit. The fields are controlled (value from state) — uncontrolled would bypass the reducer entirely.",
  why_this_matters:
    "The uniform field template is what makes reducer-driven forms scale — adding a fourth field means adding one input element following the established pattern, with no changes to state management logic. Compare to the useState approach where adding a field requires a new useState, a new handler, a new validation function, and updates to the submit handler.",
  answer_keywords: [
    "state.fields.shipmentId", "SET_FIELD", "VALIDATE_FIELD",
    "state.errors.shipmentId", "disabled", "submitting",
    "SUBMIT", "onSubmit", "preventDefault",
  ],
  seed_code: `import { useReducer } from 'react';

// (ShipmentFormState, ShipmentFormAction, INITIAL_FORM_STATE, shipmentFormReducer all defined)`,
  starter_code: `import { useReducer } from 'react';

// (all types, INITIAL_FORM_STATE, and shipmentFormReducer defined above)

const ShipmentForm = (): JSX.Element => {
  const [state, dispatch] = useReducer(shipmentFormReducer, INITIAL_FORM_STATE);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SUBMIT' });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* shipmentId input — SET_FIELD, VALIDATE_FIELD, disabled when submitting, show error */}
      {/* destination input — same pattern */}
      {/* carrier input — same pattern */}
      <button type="submit" disabled={state.status === 'submitting'}>
        {state.status === 'submitting' ? 'Submitting...' : 'Submit'}
      </button>
      {state.status === 'success' && <p>Shipment created!</p>}
      {state.status === 'error' && <p>Submission failed. Try again.</p>}
    </form>
  );
};`,
  feedback_correct:
    "Exactly — each field follows the uniform pattern. The disabled attribute locks all inputs during submission. The submit button reflects the current status. Error messages come from state.errors.",
  feedback_partial:
    "Close — make sure each input has all three: `value={state.fields.X}`, `onChange` dispatching SET_FIELD, and `onBlur` dispatching VALIDATE_FIELD. Also check that inputs are disabled with `disabled={state.status === 'submitting'}`.",
  feedback_wrong:
    "Each input needs: `value={state.fields.shipmentId}`, `onChange={e => dispatch({ type: 'SET_FIELD', field: 'shipmentId', value: e.target.value })}`, `onBlur={() => dispatch({ type: 'VALIDATE_FIELD', field: 'shipmentId' })}`, `disabled={state.status === 'submitting'}`. And below each: `{state.errors.shipmentId && <p>{state.errors.shipmentId}</p>}`.",
  expected: `const ShipmentForm = (): JSX.Element => {
  const [state, dispatch] = useReducer(shipmentFormReducer, INITIAL_FORM_STATE);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SUBMIT' });
  };

  const isSubmitting = state.status === 'submitting';

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Shipment ID</label>
        <input
          value={state.fields.shipmentId}
          onChange={e => dispatch({ type: 'SET_FIELD', field: 'shipmentId', value: e.target.value })}
          onBlur={() => dispatch({ type: 'VALIDATE_FIELD', field: 'shipmentId' })}
          disabled={isSubmitting}
        />
        {state.errors.shipmentId && <p className="error">{state.errors.shipmentId}</p>}
      </div>

      <div>
        <label>Destination</label>
        <input
          value={state.fields.destination}
          onChange={e => dispatch({ type: 'SET_FIELD', field: 'destination', value: e.target.value })}
          onBlur={() => dispatch({ type: 'VALIDATE_FIELD', field: 'destination' })}
          disabled={isSubmitting}
        />
        {state.errors.destination && <p className="error">{state.errors.destination}</p>}
      </div>

      <div>
        <label>Carrier</label>
        <input
          value={state.fields.carrier}
          onChange={e => dispatch({ type: 'SET_FIELD', field: 'carrier', value: e.target.value })}
          onBlur={() => dispatch({ type: 'VALIDATE_FIELD', field: 'carrier' })}
          disabled={isSubmitting}
        />
        {state.errors.carrier && <p className="error">{state.errors.carrier}</p>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
      {state.status === 'success' && <p className="success">Shipment created!</p>}
      {state.status === 'error' && <p className="error">Submission failed. Try again.</p>}
    </form>
  );
};`,
  analog_example: `<input
  value={state.fields.email}
  onChange={e => dispatch({ type: 'SET_FIELD', field: 'email', value: e.target.value })}
  onBlur={() => dispatch({ type: 'VALIDATE_FIELD', field: 'email' })}
  disabled={state.status === 'submitting'}
/>`,
  deepDiveLabel:
    "Uniform field template — would a field component abstract the pattern?",
  deepDive: {
    hook: "Three fields, same three attributes, different field names. A colleague suggests extracting a FormField component that accepts the field name and dispatch function and renders the input + error. You like the idea but aren't sure how to type it.",
    pain: "⚠️ **Lesson:** A FormField component that accepts `field: keyof ShipmentFormState['fields']` and `dispatch` would eliminate the repetition. What would its props interface look like — and what would it render?",
    mentalModel:
      "```tsx\ninterface FormFieldProps {\n  field: keyof ShipmentFormState['fields'];\n  label: string;\n  state: ShipmentFormState;\n  dispatch: React.Dispatch<ShipmentFormAction>;\n}\n\nconst FormField = ({ field, label, state, dispatch }: FormFieldProps): JSX.Element => (\n  <div>\n    <label>{label}</label>\n    <input\n      value={state.fields[field]}\n      onChange={e => dispatch({ type: 'SET_FIELD', field, value: e.target.value })}\n      onBlur={() => dispatch({ type: 'VALIDATE_FIELD', field })}\n      disabled={state.status === 'submitting'}\n    />\n    {state.errors[field] && <p className='error'>{state.errors[field]}</p>}\n  </div>\n);\n\n// Usage:\n<FormField field='shipmentId' label='Shipment ID' state={state} dispatch={dispatch} />\n```\n\nThis is the 'field component' pattern used in React Hook Form's `<Controller>` and many design system form libraries.",
    discover:
      "```tsx\n// ✅ extracted FormField — eliminates repetition\n<FormField field='shipmentId' label='Shipment ID' state={state} dispatch={dispatch} />\n<FormField field='destination' label='Destination' state={state} dispatch={dispatch} />\n<FormField field='carrier' label='Carrier' state={state} dispatch={dispatch} />\n```",
    quickRules:
      "- ✅ extract FormField when: 3+ fields with identical template, form grows to 5+ fields\n- ✅ `keyof ShipmentFormState['fields']` types the field prop safely\n- ✅ `React.Dispatch<ShipmentFormAction>` types the dispatch prop\n- ❌ extract for 2 fields — premature abstraction\n- field component is how React Hook Form's Controller works internally",
    watchOut:
      "👀 **Watch out:** Passing both `state` and `dispatch` to FormField creates tight coupling to the form's specific state shape. For truly reusable field components, consider a render-prop or context-based pattern that doesn't require the specific state type.",
    dryRun:
      "🔁 **Think:** FormField receives `field='shipmentId'`. It renders `<input value={state.fields['shipmentId']} ...>`. state.fields['shipmentId'] is 'NX-001'. The user types '-002'. onChange fires — what does it dispatch? After the dispatch, what is state.fields.shipmentId?",
    build:
      "**Learning focus:** Build the uniform field template using reducer dispatch — and understand how extracting a FormField component eliminates repetition while maintaining type safety via keyof.",
  },
},
{
  id: "step5",
  type: "question",
  phase: "Step 5 of 5",
  paal: "Extract the entire form state machine into a custom useShipmentForm hook that returns { state, dispatch, handleSubmit } and validate-on-blur as a convenience function.",
  hint: "Move useReducer, the handleSubmit function, and any derived helpers into the hook. Return { state, dispatch, handleChange, handleBlur, handleSubmit } for a clean component API.",
  example_code: `const useShipmentForm = () => {
  const [state, dispatch] = useReducer(shipmentFormReducer, INITIAL_FORM_STATE);

  const handleChange = (field: keyof ShipmentFormState['fields']) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      dispatch({ type: 'SET_FIELD', field, value: e.target.value });

  const handleBlur = (field: keyof ShipmentFormState['fields']) => () =>
    dispatch({ type: 'VALIDATE_FIELD', field });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SUBMIT' });
  };

  return { state, handleChange, handleBlur, handleSubmit };
};`,
  think_prompt:
    "What does the component look like after extracting the logic into the hook? How much simpler is the component compared to having the reducer and handlers inline?",
  mc_options: [
    "The component still needs to call useReducer directly after using the hook",
    "The component calls useShipmentForm(), destructures the returned values, and focuses purely on rendering",
    "The hook manages rendering internally — the component doesn't need to render anything",
  ],
  mc_correct_option:
    "The component calls useShipmentForm(), destructures the returned values, and focuses purely on rendering",
  mc_anchor:
    "The hook encapsulates all state logic. The component destructures what it needs and focuses on rendering. This is the 'container vs presenter' split implemented with a custom hook — the hook is the container, the component is the presenter. The component doesn't need to know that useReducer exists.",
  why_this_matters:
    "Extracting form state into a custom hook is the same pattern React Hook Form uses internally — the library provides useForm() which returns { register, handleSubmit, formState } and the component just renders. Understanding how to build this pattern manually makes working with form libraries intuitive.",
  answer_keywords: [
    "useShipmentForm", "useReducer", "handleChange",
    "handleBlur", "handleSubmit", "dispatch", "state",
    "return", "{ state, handleChange, handleBlur, handleSubmit }",
  ],
  seed_code: `import { useReducer } from 'react';
// (all form types and reducer defined)`,
  starter_code: `import { useReducer } from 'react';
// (all form types and reducer defined)

// define useShipmentForm hook here
// moves useReducer, handleChange, handleBlur, handleSubmit inside
// returns { state, handleChange, handleBlur, handleSubmit }

// use the hook in ShipmentForm — component should be ~20 lines of pure JSX`,
  feedback_correct:
    "Exactly — the hook encapsulates all state machine logic. The component is now a pure presenter: call the hook, destructure, render. Adding a new field requires adding one input to the JSX — no state management changes.",
  feedback_partial:
    "Close — make sure the hook returns convenience handler factories (handleChange returns a function that takes the event, handleBlur returns a function) so the component template stays clean.",
  feedback_wrong:
    "Define `const useShipmentForm = () => { const [state, dispatch] = useReducer(...); const handleChange = (field) => (e) => dispatch({ type: 'SET_FIELD', field, value: e.target.value }); const handleBlur = (field) => () => dispatch({ type: 'VALIDATE_FIELD', field }); const handleSubmit = (e) => { e.preventDefault(); dispatch({ type: 'SUBMIT' }); }; return { state, handleChange, handleBlur, handleSubmit }; };`",
  expected: `const useShipmentForm = () => {
  const [state, dispatch] = useReducer(shipmentFormReducer, INITIAL_FORM_STATE);

  const handleChange =
    (field: keyof ShipmentFormState['fields']) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      dispatch({ type: 'SET_FIELD', field, value: e.target.value });

  const handleBlur =
    (field: keyof ShipmentFormState['fields']) =>
    () =>
      dispatch({ type: 'VALIDATE_FIELD', field });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SUBMIT' });
  };

  return { state, handleChange, handleBlur, handleSubmit };
};

const ShipmentForm = (): JSX.Element => {
  const { state, handleChange, handleBlur, handleSubmit } = useShipmentForm();
  const isSubmitting = state.status === 'submitting';

  return (
    <form onSubmit={handleSubmit}>
      {(['shipmentId', 'destination', 'carrier'] as const).map(field => (
        <div key={field}>
          <input
            value={state.fields[field]}
            onChange={handleChange(field)}
            onBlur={handleBlur(field)}
            disabled={isSubmitting}
            placeholder={field}
          />
          {state.errors[field] && <p className="error">{state.errors[field]}</p>}
        </div>
      ))}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};`,
  analog_example: `// React Hook Form's pattern:
const { register, handleSubmit, formState } = useForm<ShipmentFields>();`,
  deepDiveLabel:
    "useShipmentForm hook encapsulates state — how does this compare to React Hook Form's useForm?",
  deepDive: {
    hook: "Your useShipmentForm hook is functionally similar to React Hook Form's `useForm`. Both return handler factories. Both encapsulate state. A colleague asks why anyone would use React Hook Form if you can build this yourself.",
    pain: "⚠️ **Lesson:** Manual useShipmentForm vs React Hook Form — what does RHF add that your hook doesn't have?",
    mentalModel:
      "**useShipmentForm (manual)**:\n- Full control, no dependency\n- Validates on blur (manual)\n- Re-renders on every keystroke (controlled inputs)\n- Schema validation requires manual implementation\n- No watch, no dirty/touched tracking\n\n**React Hook Form's useForm**:\n- Uncontrolled by default — no re-render per keystroke\n- Schema validation via Zod/Yup integration\n- Built-in watch, dirty, touched, isValid states\n- Field arrays (useFieldArray for dynamic forms)\n- DevTools support\n- Handles edge cases: nested objects, arrays, conditional fields\n\n**Signal to use RHF**: 5+ fields, complex validation rules, performance matters, form library in company standard.",
    discover:
      "```tsx\n// React Hook Form:\nconst { register, handleSubmit, formState: { errors } } = useForm<ShipmentFields>({\n  resolver: zodResolver(ShipmentSchema), // Zod schema validation\n});\n\n<input {...register('shipmentId', { required: true })} />\n{errors.shipmentId && <p>{errors.shipmentId.message}</p>}\n```",
    quickRules:
      "- ✅ manual useReducer form: learning, simple forms, full control desired\n- ✅ React Hook Form: production forms, 5+ fields, validation schemas, performance\n- ✅ understand manual first — RHF solves the same problems more comprehensively\n- ❌ manual for 10-field forms with async validation — RHF handles this cleanly",
    watchOut:
      "👀 **Watch out:** React Hook Form's uncontrolled mode (default) means inputs aren't driven by React state — they're driven by DOM refs. This is a performance win but means you can't easily transform values (like auto-uppercase) in onChange. Use the Controller component or mode: 'onChange' for controlled fields.",
    dryRun:
      "🔁 **Think:** Your useShipmentForm re-renders on every keystroke (controlled inputs). A 5-field form with 5 characters typed = 5 re-renders per field = 25 re-renders. React Hook Form with uncontrolled inputs: type 5 characters in a field = ? re-renders?",
    build:
      "**Learning focus:** Extract a form state machine into a reusable custom hook — understanding the parallels to React Hook Form's design and when to graduate from manual to library-driven forms.",
  },
},
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1", id: "step1" },
  { label: "Step 2", id: "step2" },
  { label: "Step 3", id: "step3" },
  { label: "Step 4", id: "step4" },
  { label: "Step 5", id: "step5" },
];

export default createINPACTEngine({
  NODES,
  sideItems,
  lessonNum: 30,
  title: "useReducer — Complex State",
  shortName: "HOOKS — REDUCER COMPLEX",
});
