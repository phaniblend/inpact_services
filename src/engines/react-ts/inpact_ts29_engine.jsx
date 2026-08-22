import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
{
  id: "intro",
  type: "reveal",
  phase: "Lesson",
  content: {
    tag: "LESSON #29 (React Hooks)",
    title: "useReducer — Basics",
    body: "useState is perfect for independent pieces of state. But when multiple state values change together in response to the same event — or when the next state depends on the current state in complex ways — useReducer brings clarity. It replaces scattered setters with a single dispatch function and consolidates all state logic into one pure reducer function. In this lesson you'll build a shipment selection system with useReducer, understanding when and why to choose it over useState.",
    usecase:
      "A shipment list has selection state — which shipments are selected, whether all are selected, and a running count. Selecting a shipment affects all three. Selecting all affects all three. Clearing affects all three. With useState, three setters must be coordinated on every action. With useReducer, one dispatch encodes the intent and the reducer computes the new state atomically.",
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
      reason: "useReducer drives JSX rendering. You need to know how JSX expressions render state values before building a reducer-driven component.",
    },
    {
      lesson: 5,
      label: "Props — Typing What a Component Receives",
      reason: "The component in this lesson receives shipment data as props. You need to know how to type props before combining them with reducer state.",
    },
    {
      lesson: 8,
      label: "useState — Primitives",
      reason: "useReducer is an alternative to useState for complex state. You need to understand useState — its limitations with coordinated state updates — before appreciating useReducer's advantages.",
    },
    {
      lesson: 11,
      label: "Conditional Rendering",
      reason: "This lesson renders conditionally based on reducer state (selection count, isAllSelected). You need to know conditional rendering patterns before applying them to reducer-driven state.",
    },
  ],
},
{
  id: "objectives",
  type: "objectives",
  phase: "Objectives",
  items: [
    "Define a typed action union and a state interface for useReducer",
    "Write a pure reducer function that handles each action type",
    "Call useReducer and dispatch actions from event handlers",
    "Understand why useReducer is preferable when multiple state values change together",
    "Derive values from reducer state without adding them to the state object",
  ],
},
{
  id: "step1",
  type: "question",
  phase: "Step 1 of 5",
  paal: "Define a SelectionState interface and a SelectionAction discriminated union for a shipment selection system. State: selectedIds (string[]) and allShipmentIds (string[]). Actions: SELECT_ALL, CLEAR_ALL, TOGGLE_ID (with payload).",
  hint: "Actions are a discriminated union on 'type'. TOGGLE_ID needs a payload (the id to toggle). SELECT_ALL and CLEAR_ALL need no payload. State is a plain interface.",
  example_code: `interface CounterState {
  count: number;
  step: number;
}

type CounterAction =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'SET_STEP'; payload: number };`,
  think_prompt:
    "Each action type encodes a user intent — selecting all, clearing all, or toggling one item. Only TOGGLE_ID carries additional data (which ID). How do you express these three intents as a typed discriminated union?",
  mc_options: [
    "type SelectionAction = { type: string; payload?: string }",
    "type SelectionAction = | { type: 'SELECT_ALL' } | { type: 'CLEAR_ALL' } | { type: 'TOGGLE_ID'; payload: string }",
    "type SelectionAction = 'SELECT_ALL' | 'CLEAR_ALL' | { type: 'TOGGLE_ID'; id: string }",
  ],
  mc_correct_option:
    "type SelectionAction = | { type: 'SELECT_ALL' } | { type: 'CLEAR_ALL' } | { type: 'TOGGLE_ID'; payload: string }",
  mc_anchor:
    "A discriminated union on 'type' gives TypeScript the ability to narrow each action in the reducer switch statement — in the TOGGLE_ID case, TypeScript knows `action.payload` exists as a string. The generic `{ type: string; payload?: string }` loses type safety — any type string is valid and payload is always optional. The mixed union (option 3) is inconsistent and makes the reducer harder to write.",
  why_this_matters:
    "Typed action unions are the foundation of predictable state management. They're the same pattern used in Redux and every mature state management library. When you dispatch TOGGLE_ID, TypeScript ensures you provide the required payload — and in the reducer, TypeScript ensures you handle every action type.",
  answer_keywords: [
    "SelectionState", "selectedIds", "string[]", "allShipmentIds",
    "SelectionAction", "SELECT_ALL", "CLEAR_ALL", "TOGGLE_ID", "payload", "string",
  ],
  seed_code: ``,
  starter_code: `// define SelectionState interface
// selectedIds: string[]
// allShipmentIds: string[]

// define SelectionAction discriminated union
// SELECT_ALL: no payload
// CLEAR_ALL: no payload
// TOGGLE_ID: payload is string (the id to toggle)`,
  feedback_correct:
    "Exactly — the discriminated union on 'type' gives the reducer switch statement full TypeScript narrowing. In the TOGGLE_ID case, action.payload is typed as string. TypeScript errors if you forget to handle a case.",
  feedback_partial:
    "Close — make sure TOGGLE_ID has a `payload: string` field (not optional), and SELECT_ALL and CLEAR_ALL have no payload field at all.",
  feedback_wrong:
    "Interface: `interface SelectionState { selectedIds: string[]; allShipmentIds: string[]; }`. Union: `type SelectionAction = | { type: 'SELECT_ALL' } | { type: 'CLEAR_ALL' } | { type: 'TOGGLE_ID'; payload: string };`",
  expected: `interface SelectionState {
  selectedIds: string[];
  allShipmentIds: string[];
}

type SelectionAction =
  | { type: 'SELECT_ALL' }
  | { type: 'CLEAR_ALL' }
  | { type: 'TOGGLE_ID'; payload: string };`,
  analog_example: `type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' };`,
  deepDiveLabel:
    "Discriminated union on 'type' — why 'type' specifically, and could you use a different discriminant field?",
  deepDive: {
    hook: "Every action in your union uses 'type' as the discriminant. Redux, every action library, and the React docs all use 'type'. A colleague asks: is 'type' required, or is it a convention?",
    pain: "⚠️ **Lesson:** The discriminant field could be named anything — 'kind', 'action', 'tag'. Why has 'type' become the universal convention — and does it matter what you name it?",
    mentalModel:
      "'type' is a convention, not a requirement. TypeScript's discriminated union narrowing works on any shared literal field:\n\n```tsx\n// All of these work identically:\ntype A = | { type: 'ADD' } | { type: 'REMOVE' };      // Redux convention\ntype B = | { kind: 'ADD' } | { kind: 'REMOVE' };      // Alternative\ntype C = | { action: 'ADD' } | { action: 'REMOVE' };   // Another alternative\n```\n\nWhy 'type' won:\n1. Redux established it as the standard in 2015\n2. Redux DevTools expect a 'type' field for time-travel debugging\n3. Ecosystem tooling (Redux Toolkit, Immer) is built around 'type'\n4. Consistency across codebases means every developer recognises it\n\nFor non-Redux useReducer code, 'type' is still correct — it's the signal that says 'this is an action discriminant'. Changing it to 'kind' adds cognitive overhead without benefit.",
    discover:
      "```tsx\n// ✅ standard — use 'type'\ntype Action = | { type: 'ADD' } | { type: 'REMOVE'; id: string };\n\n// ⚠️ non-standard — works but confuses readers\ntype Action = | { kind: 'ADD' } | { kind: 'REMOVE'; id: string };\n\n// TypeScript narrows on any consistent literal field:\nswitch (action.type) { ... }  // or action.kind, either works\n```",
    quickRules:
      "- ✅ always use 'type' as the discriminant — universal convention\n- ✅ TypeScript narrows on any consistent literal field\n- ❌ changing to 'kind' or 'action' — works but breaks conventions\n- ✅ Redux DevTools expect 'type' — keep it for debugging support",
    watchOut:
      "👀 **Watch out:** 'type' is a TypeScript keyword — but as an object property name it's perfectly valid. `{ type: 'ADD' }` is fine. Only `type MyType = ...` at the top level uses 'type' as a keyword.",
    dryRun:
      "🔁 **Think:** `type Action = | { kind: 'ADD' } | { kind: 'REMOVE'; id: string }`. In a switch: `switch(action.kind) { case 'REMOVE': action.id ... }`. Does TypeScript narrow correctly? Does action.id exist in the REMOVE case?",
    build:
      "**Learning focus:** Define typed state and action types — understanding that 'type' is the conventional discriminant that enables switch-based narrowing in the reducer.",
  },
},
{
  id: "step2",
  type: "question",
  phase: "Step 2 of 5",
  paal: "Write the selectionReducer pure function that takes (state: SelectionState, action: SelectionAction) and returns the new state for each action type.",
  hint: "A reducer is a pure function — no side effects, no mutation. Return a new state object for each case. Use spread for SELECT_ALL and array methods for TOGGLE_ID.",
  example_code: `const counterReducer = (state: CounterState, action: CounterAction): CounterState => {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + state.step };
    case 'DECREMENT':
      return { ...state, count: state.count - state.step };
    case 'SET_STEP':
      return { ...state, step: action.payload };
    default:
      return state;
  }
};`,
  think_prompt:
    "SELECT_ALL sets selectedIds to all allShipmentIds. CLEAR_ALL sets selectedIds to []. TOGGLE_ID adds the id if absent or removes it if present. Each case must return a new state object, not mutate the existing one.",
  mc_options: [
    "The reducer mutates state directly: state.selectedIds.push(action.payload); return state;",
    "Each case returns a new object: { ...state, selectedIds: newArray }",
    "The reducer calls setState — it works like an event handler",
  ],
  mc_correct_option:
    "Each case returns a new object: { ...state, selectedIds: newArray }",
  mc_anchor:
    "Reducers must be pure — they take the current state and return a new state without mutating the original. Direct mutation (push) returns the same reference, causing React to skip re-renders. Reducers don't call setState — they compute the next state and return it; React handles the state update.",
  why_this_matters:
    "Pure reducer functions are testable in complete isolation — no React, no hooks, no mounting. You can write `expect(selectionReducer(state, { type: 'SELECT_ALL' })).toEqual({ selectedIds: allIds })` with no test infrastructure. This is one of the primary benefits of useReducer over useState for complex logic.",
  answer_keywords: [
    "selectionReducer", "SelectionState", "SelectionAction",
    "SELECT_ALL", "allShipmentIds", "CLEAR_ALL", "[]",
    "TOGGLE_ID", "includes", "filter", "spread",
  ],
  seed_code: `interface SelectionState {
  selectedIds: string[];
  allShipmentIds: string[];
}

type SelectionAction =
  | { type: 'SELECT_ALL' }
  | { type: 'CLEAR_ALL' }
  | { type: 'TOGGLE_ID'; payload: string };`,
  starter_code: `interface SelectionState {
  selectedIds: string[];
  allShipmentIds: string[];
}

type SelectionAction =
  | { type: 'SELECT_ALL' }
  | { type: 'CLEAR_ALL' }
  | { type: 'TOGGLE_ID'; payload: string };

// write selectionReducer here
// pure function — no mutation, return new state objects
// SELECT_ALL: selectedIds = allShipmentIds
// CLEAR_ALL: selectedIds = []
// TOGGLE_ID: add if absent, remove if present`,
  feedback_correct:
    "Exactly — each case returns a new object spread from state with the updated selectedIds. The reducer is pure: same inputs always produce the same output, no side effects.",
  feedback_partial:
    "Close — check that you're returning `{ ...state, selectedIds: newValue }` (not mutating state.selectedIds directly) and that TOGGLE_ID uses includes+filter or spread+filter for the toggle logic.",
  feedback_wrong:
    "Write a switch on action.type. SELECT_ALL: `return { ...state, selectedIds: [...state.allShipmentIds] }`. CLEAR_ALL: `return { ...state, selectedIds: [] }`. TOGGLE_ID: `const id = action.payload; return { ...state, selectedIds: state.selectedIds.includes(id) ? state.selectedIds.filter(i => i !== id) : [...state.selectedIds, id] }`. Default: `return state`.",
  expected: `const selectionReducer = (
  state: SelectionState,
  action: SelectionAction
): SelectionState => {
  switch (action.type) {
    case 'SELECT_ALL':
      return { ...state, selectedIds: [...state.allShipmentIds] };

    case 'CLEAR_ALL':
      return { ...state, selectedIds: [] };

    case 'TOGGLE_ID': {
      const { payload: id } = action;
      return {
        ...state,
        selectedIds: state.selectedIds.includes(id)
          ? state.selectedIds.filter(i => i !== id)
          : [...state.selectedIds, id],
      };
    }

    default:
      return state;
  }
};`,
  analog_example: `case 'ADD_ITEM':
  return { ...state, items: [...state.items, action.payload] };
case 'REMOVE_ITEM':
  return { ...state, items: state.items.filter(i => i.id !== action.payload) };`,
  deepDiveLabel:
    "Pure reducer with no mutation — but what if the state is deeply nested?",
  deepDive: {
    hook: "Your state is flat — selectedIds and allShipmentIds at the top level. Spread handles it easily. But some reducers have nested state: `{ shipments: { byId: { 'NX-001': {...} } }, ui: { isLoading: bool } }`. Updating a nested field requires nested spreads — verbose and error-prone.",
    pain: "⚠️ **Lesson:** Nested state updates require spreading at every level: `{ ...state, shipments: { ...state.shipments, byId: { ...state.shipments.byId, [id]: updatedShipment } } }`. What tools make deeply nested immutable updates cleaner?",
    mentalModel:
      "**Options for nested immutable updates**:\n\n1. **Manual spread**: verbose but no dependencies\n```tsx\nreturn { ...state, ui: { ...state.ui, isLoading: false } };\n```\n\n2. **Immer** (used by Redux Toolkit): write mutation syntax, Immer makes it immutable\n```tsx\nreturn produce(state, draft => {\n  draft.ui.isLoading = false; // looks like mutation, actually creates new state\n});\n```\n\n3. **Flat state shape**: avoid nesting by normalising data (Lesson 50+)\n```tsx\n// Instead of nested byId\nconst shipmentsById: Record<string, Shipment> = {};\n```\n\nFor useReducer in React without Redux: manual spread or Immer. For Redux: Redux Toolkit's `createSlice` uses Immer automatically.",
    discover:
      "```tsx\n// ✅ flat state — spread is easy\nreturn { ...state, selectedIds: newIds };\n\n// ⚠️ nested state — manual spread is verbose\nreturn {\n  ...state,\n  ui: {\n    ...state.ui,\n    selection: {\n      ...state.ui.selection,\n      selectedIds: newIds,\n    },\n  },\n};\n\n// ✅ Immer — write mutation syntax\nreturn produce(state, draft => {\n  draft.ui.selection.selectedIds = newIds; // clean!\n});\n```",
    quickRules:
      "- ✅ flat state: prefer it — spread updates are simple\n- ✅ manual spread: 1-2 levels deep, no extra dependencies\n- ✅ Immer: 3+ levels deep, or when mutation syntax is clearer\n- ❌ direct mutation without Immer — breaks React's reference-equality change detection",
    watchOut:
      "👀 **Watch out:** Immer's `produce` returns the same object reference if no changes were made — a performance optimization that also means `===` comparisons work correctly for memoization.",
    dryRun:
      "🔁 **Think:** The reducer receives `state = { selectedIds: ['NX-001'], allShipmentIds: ['NX-001', 'NX-002', 'NX-003'] }` and `action = { type: 'TOGGLE_ID', payload: 'NX-002' }`. Walk through the TOGGLE_ID case: is 'NX-002' in selectedIds? What does the filter return? What does the spread return? What is the new selectedIds?",
    build:
      "**Learning focus:** Write a pure reducer with a switch statement — each case returns a new state object without mutating the original, enabling isolated unit testing and React's reference-equality change detection.",
  },
},
{
  id: "step3",
  type: "question",
  phase: "Step 3 of 5",
  paal: "Wire useReducer into the ShipmentMultiSelect component. Dispatch SELECT_ALL, CLEAR_ALL, and TOGGLE_ID from the appropriate event handlers.",
  hint: "useReducer(selectionReducer, initialState) returns [state, dispatch]. Call dispatch({ type: 'ACTION_TYPE', payload: value }) from event handlers.",
  example_code: `const [state, dispatch] = useReducer(counterReducer, { count: 0, step: 1 });

<button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
<button onClick={() => dispatch({ type: 'SET_STEP', payload: 5 })}>Step 5</button>`,
  think_prompt:
    "dispatch replaces all the individual setters from useState. When the user clicks 'Select All', one dispatch call encodes the full intent and the reducer computes the new state. How does dispatching TOGGLE_ID differ from dispatching SELECT_ALL?",
  mc_options: [
    "dispatch('TOGGLE_ID', shipmentId) — two arguments",
    "dispatch({ type: 'TOGGLE_ID', payload: shipmentId }) — action object with type and payload",
    "dispatch('TOGGLE_ID') then setSelectedId(shipmentId) — dispatch plus state setter",
  ],
  mc_correct_option:
    "dispatch({ type: 'TOGGLE_ID', payload: shipmentId }) — action object with type and payload",
  mc_anchor:
    "dispatch always takes exactly one argument — an action object. The action's shape must match one of the SelectionAction union members. TypeScript validates this — dispatching `{ type: 'TOGGLE_ID' }` without payload would be a compile-time error. Dispatch with two arguments is not the API. Combining dispatch with setState defeats the purpose of useReducer.",
  why_this_matters:
    "The dispatch pattern — one function, one intent-encoding object — is the interface to the entire state machine. Any component with access to dispatch can trigger any transition. TypeScript ensures every dispatch is valid. This is the same pattern used in Redux, XState, and every mature state management system.",
  answer_keywords: [
    "useReducer", "selectionReducer", "dispatch",
    "SELECT_ALL", "CLEAR_ALL", "TOGGLE_ID", "payload",
  ],
  seed_code: `import { useReducer } from 'react';

interface SelectionState { selectedIds: string[]; allShipmentIds: string[]; }
type SelectionAction = | { type: 'SELECT_ALL' } | { type: 'CLEAR_ALL' } | { type: 'TOGGLE_ID'; payload: string };

const selectionReducer = (state: SelectionState, action: SelectionAction): SelectionState => {
  switch (action.type) {
    case 'SELECT_ALL': return { ...state, selectedIds: [...state.allShipmentIds] };
    case 'CLEAR_ALL': return { ...state, selectedIds: [] };
    case 'TOGGLE_ID': {
      const id = action.payload;
      return { ...state, selectedIds: state.selectedIds.includes(id) ? state.selectedIds.filter(i => i !== id) : [...state.selectedIds, id] };
    }
    default: return state;
  }
};

const SHIPMENT_IDS = ['NX-001', 'NX-002', 'NX-003', 'NX-004'];`,
  starter_code: `import { useReducer } from 'react';

// (types and reducer defined above)
const SHIPMENT_IDS = ['NX-001', 'NX-002', 'NX-003', 'NX-004'];

const ShipmentMultiSelect = (): JSX.Element => {
  // call useReducer here with selectionReducer and initial state

  return (
    <div>
      {/* Select All button — dispatch SELECT_ALL */}
      {/* Clear All button — dispatch CLEAR_ALL */}
      {SHIPMENT_IDS.map(id => (
        <div key={id}>
          {/* Checkbox or div — dispatch TOGGLE_ID with payload: id */}
          <span>{id}</span>
        </div>
      ))}
    </div>
  );
};`,
  feedback_correct:
    "Exactly — useReducer returns [state, dispatch]. Each button dispatches an action object. TypeScript validates that TOGGLE_ID has a string payload and SELECT_ALL has none.",
  feedback_partial:
    "Close — make sure dispatch receives a single object argument: `dispatch({ type: 'TOGGLE_ID', payload: id })` not two separate arguments.",
  feedback_wrong:
    "Add `const [state, dispatch] = useReducer(selectionReducer, { selectedIds: [], allShipmentIds: SHIPMENT_IDS })`. Buttons: `onClick={() => dispatch({ type: 'SELECT_ALL' })}`, `onClick={() => dispatch({ type: 'CLEAR_ALL' })}`. Per-item: `onClick={() => dispatch({ type: 'TOGGLE_ID', payload: id })}`.",
  expected: `import { useReducer } from 'react';

const SHIPMENT_IDS = ['NX-001', 'NX-002', 'NX-003', 'NX-004'];

const ShipmentMultiSelect = (): JSX.Element => {
  const [state, dispatch] = useReducer(selectionReducer, {
    selectedIds: [],
    allShipmentIds: SHIPMENT_IDS,
  });

  return (
    <div>
      <button onClick={() => dispatch({ type: 'SELECT_ALL' })}>
        Select All
      </button>
      <button onClick={() => dispatch({ type: 'CLEAR_ALL' })}>
        Clear All
      </button>
      {SHIPMENT_IDS.map(id => (
        <div
          key={id}
          onClick={() => dispatch({ type: 'TOGGLE_ID', payload: id })}
          style={{ cursor: 'pointer', fontWeight: state.selectedIds.includes(id) ? 'bold' : 'normal' }}
        >
          {state.selectedIds.includes(id) ? '☑' : '☐'} {id}
        </div>
      ))}
    </div>
  );
};`,
  analog_example: `dispatch({ type: 'ADD_ITEM', payload: newItem });
dispatch({ type: 'CLEAR_CART' });`,
  deepDiveLabel:
    "dispatch is always the same reference — but what about the state it returns?",
  deepDive: {
    hook: "You add `console.log('rendered')` to ShipmentMultiSelect. Every dispatch triggers a render. But you notice that dispatching TOGGLE_ID for an id that's already selected (and should remain selected after the toggle) still causes a render — even though the visual output is identical to before.",
    pain: "⚠️ **Lesson:** React re-renders when dispatch is called, even if the reducer returns the exact same state. How can you prevent unnecessary re-renders when the state doesn't actually change?",
    mentalModel:
      "React's rule: if dispatch is called, re-render happens — unless the reducer returns the exact same state reference.\n\nWhen the reducer's `default: return state` runs (or any case that returns the same reference), React bails out of re-rendering. This is React's useReducer bailout — it uses `Object.is` to compare the returned state to the current state.\n\n```tsx\n// Reducer returns same reference — no re-render\ncase 'TOGGLE_ID': {\n  const id = action.payload;\n  if (!state.selectedIds.includes(id)) return state; // bail out — already selected\n  // ...\n}\n```\n\nFor your toggle: if you dispatch TOGGLE_ID for an id that's already selected, the filter removes it (state changes — re-render needed). But you could add an early return in the reducer for no-op cases.",
    discover:
      "```tsx\n// ✅ reducer bail out — same reference, no re-render\ncase 'SOME_ACTION':\n  if (/* nothing would change */) return state; // same ref → no re-render\n  return { ...state, updated: newValue }; // new ref → re-render\n\n// ✅ default also bails out\ndefault:\n  return state; // same ref — no re-render for unknown actions\n```",
    quickRules:
      "- ✅ return `state` (same reference) for no-op cases — React skips re-render\n- ✅ `default: return state` always correct for unhandled actions\n- ✅ React uses Object.is to compare old and new state\n- ❌ return `{ ...state }` for no-op — new reference triggers re-render even if identical\n- dispatch is stable — same reference across renders (no need for useCallback on handlers that only dispatch)",
    watchOut:
      "👀 **Watch out:** dispatch is guaranteed to be stable across renders (same reference). You can safely include it in useEffect dependency arrays without causing infinite loops — it never changes.",
    dryRun:
      "🔁 **Think:** State is `{ selectedIds: ['NX-001'] }`. User clicks NX-001 again (already selected). TOGGLE_ID fires. The reducer: is 'NX-001' in selectedIds? Yes → filter removes it. Returns `{ ...state, selectedIds: [] }`. Is this a new reference? Does React re-render?",
    build:
      "**Learning focus:** Call useReducer and dispatch typed actions from event handlers — understanding that dispatch is stable across renders and that returning the same state reference prevents unnecessary re-renders.",
  },
},
{
  id: "step4",
  type: "question",
  phase: "Step 4 of 5",
  paal: "Add two derived values from reducer state — selectionCount (number of selected IDs) and isAllSelected (boolean). Render them without adding them to the reducer state.",
  hint: "Derived values from state are plain consts computed at render time. The reducer state object only holds what's needed to compute everything else — not the derived results themselves.",
  example_code: `const selectionCount = state.selectedIds.length;
const isAllSelected = state.selectedIds.length === state.allShipmentIds.length;`,
  think_prompt:
    "selectionCount and isAllSelected are computable from selectedIds and allShipmentIds. Should they be stored in the reducer state — or derived at render time? What's the principle?",
  mc_options: [
    "Add selectionCount and isAllSelected to SelectionState and update them in every reducer case",
    "Derive them as plain consts from state — no reducer state additions needed",
    "Add a COMPUTE action that the component dispatches after every other action",
  ],
  mc_correct_option:
    "Derive them as plain consts from state — no reducer state additions needed",
  mc_anchor:
    "Derived values stored in state create synchronisation risk — every action that changes selectedIds must also update selectionCount and isAllSelected correctly. Missing one causes a stale count. Computed consts are always correct by definition — they're computed from the current state on every render. The COMPUTE action pattern is an anti-pattern that defeats the purpose of a pure reducer.",
  why_this_matters:
    "Keeping reducers lean — storing only the minimum state needed — is a core principle of state management. Redux's documentation calls this 'normalised state'. Every value derivable from the stored state should be computed at render time (or memoized for performance). This applies equally to useReducer and useState.",
  answer_keywords: [
    "selectionCount", "state.selectedIds.length",
    "isAllSelected", "state.allShipmentIds.length",
  ],
  seed_code: `import { useReducer } from 'react';

const SHIPMENT_IDS = ['NX-001', 'NX-002', 'NX-003', 'NX-004'];

const ShipmentMultiSelect = (): JSX.Element => {
  const [state, dispatch] = useReducer(selectionReducer, {
    selectedIds: [],
    allShipmentIds: SHIPMENT_IDS,
  });

  return (
    <div>
      <button onClick={() => dispatch({ type: 'SELECT_ALL' })}>Select All</button>
      <button onClick={() => dispatch({ type: 'CLEAR_ALL' })}>Clear All</button>
      {SHIPMENT_IDS.map(id => (
        <div key={id} onClick={() => dispatch({ type: 'TOGGLE_ID', payload: id })}>
          {state.selectedIds.includes(id) ? '☑' : '☐'} {id}
        </div>
      ))}
    </div>
  );
};`,
  starter_code: `import { useReducer } from 'react';

const SHIPMENT_IDS = ['NX-001', 'NX-002', 'NX-003', 'NX-004'];

const ShipmentMultiSelect = (): JSX.Element => {
  const [state, dispatch] = useReducer(selectionReducer, {
    selectedIds: [],
    allShipmentIds: SHIPMENT_IDS,
  });

  // derive selectionCount and isAllSelected here — plain consts, no reducer state

  return (
    <div>
      {/* render selectionCount and isAllSelected */}
      <button onClick={() => dispatch({ type: 'SELECT_ALL' })}>Select All</button>
      <button onClick={() => dispatch({ type: 'CLEAR_ALL' })}>Clear All</button>
      {SHIPMENT_IDS.map(id => (
        <div key={id} onClick={() => dispatch({ type: 'TOGGLE_ID', payload: id })}>
          {state.selectedIds.includes(id) ? '☑' : '☐'} {id}
        </div>
      ))}
    </div>
  );
};`,
  feedback_correct:
    "Exactly — selectionCount and isAllSelected are derived from reducer state at render time. No reducer changes needed. They're always accurate because they're computed from the current state.",
  feedback_partial:
    "Close — make sure selectionCount and isAllSelected are plain consts (not reducer state or useState), and that they're computed from `state.selectedIds.length` and `state.allShipmentIds.length`.",
  feedback_wrong:
    "Add `const selectionCount = state.selectedIds.length` and `const isAllSelected = state.selectedIds.length === state.allShipmentIds.length` as plain consts inside the component before the return.",
  expected: `import { useReducer } from 'react';

const SHIPMENT_IDS = ['NX-001', 'NX-002', 'NX-003', 'NX-004'];

const ShipmentMultiSelect = (): JSX.Element => {
  const [state, dispatch] = useReducer(selectionReducer, {
    selectedIds: [],
    allShipmentIds: SHIPMENT_IDS,
  });

  const selectionCount = state.selectedIds.length;
  const isAllSelected = state.selectedIds.length === state.allShipmentIds.length;

  return (
    <div>
      <p>{selectionCount} of {state.allShipmentIds.length} selected</p>
      {isAllSelected && <p className="badge">All selected</p>}
      <button onClick={() => dispatch({ type: 'SELECT_ALL' })}>Select All</button>
      <button onClick={() => dispatch({ type: 'CLEAR_ALL' })}>Clear All</button>
      {SHIPMENT_IDS.map(id => (
        <div key={id} onClick={() => dispatch({ type: 'TOGGLE_ID', payload: id })}>
          {state.selectedIds.includes(id) ? '☑' : '☐'} {id}
        </div>
      ))}
    </div>
  );
};`,
  analog_example: `const cartTotal = state.items.reduce((sum, item) => sum + item.price, 0);
const itemCount = state.items.length;`,
  deepDiveLabel:
    "Derived values at render time — when should you add a value to the reducer state instead?",
  deepDive: {
    hook: "You derive selectionCount every render. It's fast — array length is O(1). But what if a derived value was expensive — filtering 10,000 items on every render? Should you store that in the reducer state to avoid recomputing?",
    pain: "⚠️ **Lesson:** There are three options for expensive derived values: store in reducer state, recompute every render, or use useMemo. What's the decision framework?",
    mentalModel:
      "**Store in reducer state** when:\n- The value requires information available only at action time (e.g., a timestamp of when something changed)\n- The value is not derivable from other state (genuinely independent data)\n\n**Recompute every render** when:\n- The computation is cheap (O(1) or O(log n) for small collections)\n- This is the default choice — no overhead, always correct\n\n**useMemo** when:\n- The computation is measurably expensive (filter/sort over large arrays)\n- The result needs to be stable for memoized children\n\n```tsx\n// ✅ cheap — recompute every render\nconst count = state.selectedIds.length;\n\n// ✅ expensive — memoize\nconst sorted = useMemo(\n  () => [...state.selectedIds].sort(),\n  [state.selectedIds]\n);\n```",
    discover:
      "```tsx\n// ✅ recompute — O(1), always correct\nconst selectionCount = state.selectedIds.length;\n\n// ✅ useMemo — O(n log n) sort, stable for memoized children\nconst sortedIds = useMemo(\n  () => [...state.selectedIds].sort(),\n  [state.selectedIds]\n);\n\n// ❌ store in reducer — synchronisation risk\n// Every action that changes selectedIds must also update sortedIds\n```",
    quickRules:
      "- ✅ recompute: cheap derivations (counts, booleans, simple transforms)\n- ✅ useMemo: expensive derivations (sort, filter, complex transforms over large data)\n- ❌ store in reducer: only for truly independent data or action-time-only information\n- the principle: lean reducer state, derived everything else",
    watchOut:
      "👀 **Watch out:** Storing derived values in the reducer creates what Redux docs call 'denormalised state' — it duplicates information. This is acceptable for performance-critical reads (e.g., materialised views in a database analogy) but should be a deliberate choice, not the default.",
    dryRun:
      "🔁 **Think:** selectionCount is derived as `state.selectedIds.length`. The user dispatches SELECT_ALL. The reducer returns new state with all IDs in selectedIds. On the next render: what is selectionCount? Is it guaranteed correct — or could it be stale?",
    build:
      "**Learning focus:** Derive values from reducer state at render time — understanding that lean reducer state (only what can't be derived) is the correct default, with useMemo for expensive derivations.",
  },
},
{
  id: "step5",
  type: "question",
  phase: "Step 5 of 5",
  paal: "When should you use useReducer instead of useState? Identify the three signals that indicate useReducer is the better choice for the ShipmentMultiSelect scenario.",
  hint: "Think about: how many state variables would useState need, whether those variables update together, and whether the logic is easier to test as separate setters or as a single reducer function.",
  example_code: `// useState version — three coordinated variables, easy to get wrong:
const [selectedIds, setSelectedIds] = useState<string[]>([]);
// Select all requires: setSelectedIds(allIds)
// Clear all requires: setSelectedIds([])
// Toggle requires: setSelectedIds(prev => prev.includes(id) ? ... : ...)

// useReducer version — one dispatch, logic in one place:
dispatch({ type: 'SELECT_ALL' });
dispatch({ type: 'CLEAR_ALL' });
dispatch({ type: 'TOGGLE_ID', payload: id });`,
  think_prompt:
    "The useState version only needs one state variable (selectedIds). But useReducer is still arguably better here. What makes a good case for useReducer even when the state is simple?",
  mc_options: [
    "Always use useReducer — it's more advanced and therefore better",
    "Use useReducer when: multiple related state values update together, action intent is clearer than setter calls, or logic complexity benefits from isolation in a pure function",
    "Use useReducer only when you have 5+ state variables",
  ],
  mc_correct_option:
    "Use useReducer when: multiple related state values update together, action intent is clearer than setter calls, or logic complexity benefits from isolation in a pure function",
  mc_anchor:
    "The three signals: (1) State transitions are complex enough that a pure function is clearer than setter calls; (2) Multiple state variables change together in response to the same event; (3) The state logic benefits from being testable in isolation as a pure function. UseReducer is not always better — for simple independent state, useState is more concise.",
  why_this_matters:
    "Knowing when to apply a tool is as important as knowing how to use it. useReducer adds ceremony (action types, switch statements) that isn't always worth it. The decision framework prevents both under-use (living with messy coordinated setters) and over-use (useReducer for a simple boolean toggle).",
  answer_keywords: [
    "complex state transitions", "multiple values together",
    "intent over setters", "pure function", "testable",
  ],
  seed_code: `// Document your analysis:
// When to use useReducer vs useState:`,
  starter_code: `// Evaluate the ShipmentMultiSelect scenario:
// 1. How many useState variables would the equivalent useState version need?
// 2. Do those variables ever change together in response to one action?
// 3. Is the logic easier to understand as dispatched intents or as setter calls?
// 4. Can the reducer be unit-tested without React?
// 5. Verdict: is useReducer the right choice here — and why?`,
  feedback_correct:
    "Exactly — useReducer wins when state transitions encode intent (SELECT_ALL vs setSelectedIds(allIds)), when multiple values change atomically, and when the logic is complex enough to benefit from pure function isolation and independent testing.",
  feedback_partial:
    "Close — mention all three signals: coordinated state updates, intent-encoding dispatch, and testable pure function. The variable count alone isn't the deciding factor.",
  feedback_wrong:
    "Three signals for useReducer: (1) Multiple state values change together on the same event; (2) Intent-encoding dispatch ('SELECT_ALL') is clearer than coordinated setters; (3) The reducer is a pure function testable without mounting the component. useState wins when state is truly independent and simple.",
  expected: `// useReducer signals in ShipmentMultiSelect:

// 1. State variables: Only selectedIds is in the reducer state.
//    allShipmentIds could be a prop, but bundling it into state centralises the logic.

// 2. Coordinated updates:
//    SELECT_ALL atomically sets selectedIds = allShipmentIds — one dispatch, one state update.
//    With useState: setSelectedIds(allIds) is the same one call, so coordination isn't the win here.

// 3. Intent over setters:
//    dispatch({ type: 'SELECT_ALL' }) communicates intent.
//    setSelectedIds(allIds) communicates implementation.
//    Intent is more readable in complex systems.

// 4. Testable pure function:
//    expect(selectionReducer(state, { type: 'SELECT_ALL' }))
//      .toEqual({ selectedIds: allIds, allShipmentIds: allIds });
//    No React, no render, no mounting required.

// 5. Verdict: useReducer is a good choice here.
//    The primary wins are testability and intent clarity.
//    For a truly simple toggle, useState would be fine.
//    The more actions a system has, the clearer useReducer's advantage becomes.`,
  analog_example: `// useState fine:
const [isOpen, setIsOpen] = useState(false);

// useReducer better:
// When 6 actions all touch the same 3 related state values`,
  deepDiveLabel:
    "useReducer vs useState decision — where does Redux fit in this hierarchy?",
  deepDive: {
    hook: "You use useState for simple state, useReducer for complex component state. A colleague asks: 'when do you add Redux?' You realise you don't have a clear answer.",
    pain: "⚠️ **Lesson:** useState → useReducer → Redux/Zustand. What pushes you up that ladder — and what does each level add that the previous doesn't have?",
    mentalModel:
      "**useState**: component-local, independent values. No sharing across tree, no complex logic.\n\n**useReducer**: component-local (or passed via Context), complex transitions, testable logic, multiple related values.\n\n**Context + useReducer**: shared state across the tree without a library. Good for small-medium apps. Limited: no time-travel, no DevTools, no middleware.\n\n**Redux Toolkit / Zustand**: cross-component state with:\n- Fine-grained subscriptions (components only re-render for their specific slice)\n- DevTools with time-travel debugging\n- Middleware (logging, analytics, side effects)\n- Async action handling (Redux Thunk, RTK Query)\n\n**React Query**: server state specifically — caching, background refetch, pagination.",
    discover:
      "```\nDecision ladder:\n1. Local UI state (toggle, form field) → useState\n2. Complex component state (multi-step form, selection system) → useReducer\n3. Shared stable global state (theme, auth) → Context + useReducer\n4. Complex shared client state (cart, drafts) → Zustand or Redux Toolkit\n5. Server state (API data) → React Query or SWR\n```",
    quickRules:
      "- ✅ useState: simple, local, independent\n- ✅ useReducer: complex, local, related state with intent\n- ✅ Context + useReducer: shared, infrequent updates\n- ✅ Zustand: shared, frequent updates, fine-grained subscriptions\n- ✅ React Query: server data, caching\n- ❌ Redux for everything: overkill for local UI state",
    watchOut:
      "👀 **Watch out:** The right level is the simplest one that solves the problem. Choosing Redux for a form field's error state is overkill. Choosing useState for state shared across 20 components is inadequate. Match the tool to the problem scope.",
    dryRun:
      "🔁 **Think:** You have a shipment list with: selected IDs (local), current user (global, changes on login), shipments data (from API). Which tool — useState, useReducer, Context, Zustand, React Query — is the best fit for each? Justify each.",
    build:
      "**Learning focus:** Know when to choose useReducer — intent-encoding dispatch, coordinated state, pure function testability — and understand the full decision ladder from useState to dedicated state management libraries.",
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
  lessonNum: 29,
  title: "useReducer — Basics",
  shortName: "HOOKS — USE REDUCER",
});
