import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
{
  id: "intro",
  type: "reveal",
  phase: "Lesson",
  content: {
    tag: "LESSON #15 (React Hooks)",
    title: "Conditional Rendering",
    body: "When state is a single value — a boolean, a string, a number — useState is straightforward. But real applications manage state that is an object: a form with multiple fields, a filter panel with several settings, a user profile with a dozen properties. In this lesson you'll hold a shipment filter object in state, update individual fields without losing the rest, and understand why you must spread when updating object state.",
    usecase:
      "A shipment search panel tracks status, destination, carrier, and date range simultaneously. When the user changes only the status filter, the other three fields must stay intact. Object state with spread updates is how that works — and getting it wrong silently erases data.",
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
      reason: "Complete Lesson 1 (JSX — The Full Language) first — it is a prerequisite on the React-TS track for this lesson.",
    },
    {
      lesson: 10,
      label: "useState — Primitives",
      reason: "Complete Lesson 10 (useState — Primitives) first — it is a prerequisite on the React-TS track for this lesson.",
    },
  ],
},
{
  id: "objectives",
  type: "objectives",
  phase: "Objectives",
  items: [
    "Declare state typed as an object interface using useState",
    "Update a single field on object state using the spread operator without losing other fields",
    "Understand why direct mutation of state objects does not trigger re-renders",
    "Type object state explicitly when the initial value is incomplete or uses partial data",
    "Reset object state to its initial value with a single setter call",
  ],
},
{
  id: "step1",
  type: "question",
  phase: "Step 1 of 5",
  paal: "Define a ShipmentFilter interface with three fields: status as an optional ShipmentStatus union, destination as an optional string, and carrier as an optional string. Then declare a filter state variable typed as ShipmentFilter, initialised with all fields set to undefined.",
  hint: "The initial value `{}` is not assignable to ShipmentFilter if the fields are required. Use optional fields (?) so the empty object satisfies the type — or pass an explicit type argument to useState.",
  example_code: `interface SearchParams {
  query?: string;
  page?: number;
}

const [params, setParams] = useState<SearchParams>({});`,
  think_prompt:
    "The filter starts empty — no status, no destination, no carrier selected. All fields are optional so the user can filter on any combination. How do you type this initial empty state so TypeScript accepts it?",
  mc_options: [
    "const [filter, setFilter] = useState({ status: undefined, destination: undefined, carrier: undefined })",
    "const [filter, setFilter] = useState<ShipmentFilter>({})",
    "const [filter, setFilter] = useState(null)",
  ],
  mc_correct_option:
    "const [filter, setFilter] = useState<ShipmentFilter>({})",
  mc_anchor:
    "An explicit type argument `useState<ShipmentFilter>({})` tells TypeScript the full type while using an empty object as the initial value — TypeScript accepts it because all ShipmentFilter fields are optional. The first option works but is verbose — listing every field as undefined manually. The third option types the state as `null` which would require null checks everywhere and prevent accessing fields at all.",
  why_this_matters:
    "Filter state in enterprise apps always starts empty — no filters applied means all results shown. Typing it as the full interface from the start means TypeScript knows which fields exist and what types they hold, even when the initial object is empty.",
  answer_keywords: [
    "interface", "ShipmentFilter", "status?", "destination?", "carrier?",
    "useState", "ShipmentFilter", "{}",
  ],
  seed_code: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';`,
  starter_code: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

// define ShipmentFilter interface here with three optional fields

const ShipmentFilterForm = (): JSX.Element => {
  // declare filter state typed as ShipmentFilter, initialised to {}
  return <div />;
};`,
  feedback_correct:
    "Exactly — the explicit type argument tells TypeScript the full shape while `{}` satisfies it because all fields are optional. TypeScript now knows filter has status, destination, and carrier even when they're all undefined.",
  feedback_partial:
    "Close — check two things: are all three interface fields optional with ?, and does useState have the explicit type argument `<ShipmentFilter>` before the parentheses?",
  feedback_wrong:
    "Define `interface ShipmentFilter { status?: ShipmentStatus; destination?: string; carrier?: string; }` with optional fields. Then `const [filter, setFilter] = useState<ShipmentFilter>({})` — the type argument tells TypeScript what the empty object represents.",
  expected: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentFilter {
  status?: ShipmentStatus;
  destination?: string;
  carrier?: string;
}

const ShipmentFilterForm = (): JSX.Element => {
  const [filter, setFilter] = useState<ShipmentFilter>({});
  return <div />;
};`,
  analog_example: `interface SearchParams {
  query?: string;
  category?: string;
  page?: number;
}

const [params, setParams] = useState<SearchParams>({});`,
  deepDiveLabel:
    "useState<ShipmentFilter>({}) vs useState({}) — does TypeScript need the type argument here?",
  deepDive: {
    hook: "You try `useState({})` without the type argument. TypeScript infers the type as `{}` — an empty object type. Then you try to call `setFilter({ status: 'active' })`. TypeScript errors: 'status does not exist on type {}'. You add the type argument and it works.\n\nBut then a colleague shows you an alternative: `useState({ status: undefined, destination: undefined, carrier: undefined })`. TypeScript infers `{ status: undefined; destination: undefined; carrier: undefined }`. And now `setFilter({ status: 'active' })` also errors — because `string` is not assignable to `undefined`.\n\nBoth approaches without the type argument fail — just in different ways.",
    pain: "⚠️ **Lesson:** `useState({})` infers the state type as `{}`. Every field access errors. `useState({ status: undefined })` infers the state type as `{ status: undefined }` — locking it to undefined forever. Why does the explicit type argument fix both problems?",
    mentalModel:
      "**Mental model:** TypeScript infers the narrowest type that fits the initial value.\n- `{}` → inferred as `{}` — an object with no known fields. Accessing any field errors.\n- `{ status: undefined }` → inferred as `{ status: undefined }` — the field exists but can only ever be undefined. Setting it to a string errors.\n- `useState<ShipmentFilter>({})` → you tell TypeScript the full type. The empty object is accepted because all ShipmentFilter fields are optional. Future setter calls are checked against ShipmentFilter, not against `{}`.\n- The explicit type argument widens the inference to match the full intended type — which the initial empty object alone can never express.",
    discover:
      "**Pattern — explicit type argument for object state:**\n```tsx\n// ❌ inferred from {} — state type is {}, all field access errors\nconst [filter, setFilter] = useState({});\nsetFilter({ status: 'active' }); // ❌ status does not exist on {}\n\n// ❌ inferred from { status: undefined } — state type locks status to undefined\nconst [filter, setFilter] = useState({ status: undefined });\nsetFilter({ status: 'active' }); // ❌ string not assignable to undefined\n\n// ✅ explicit type argument — full interface, empty initial value accepted\nconst [filter, setFilter] = useState<ShipmentFilter>({});\nsetFilter({ status: 'active' }); // ✅ ShipmentFilter accepts this\nsetFilter({ destination: 'Hamburg' }); // ✅ valid partial update\n```\n- explicit type argument: widest type, correct behaviour\n- inferred from {}: too narrow, no fields known\n- inferred from { field: undefined }: locks type to undefined, setter fails\n- rule: when initial value is {} or null, always provide the explicit type argument",
    quickRules:
      "**Quick rules:**\n- ✅ `useState<MyInterface>({})` — explicit type when initial value is empty\n- ✅ `useState<MyInterface | null>(null)` — explicit type when initial is null\n- ❌ `useState({})` — TypeScript infers {}, all field access errors\n- ❌ `useState({ field: undefined })` — locks field type to undefined\n- when the initial value represents the full type: inference works. When it doesn't: use the type argument.",
    watchOut:
      "👀 **Watch out:** `useState<Partial<ShipmentRecord>>({})` is a valid pattern — Partial makes all fields optional, so the empty object satisfies it. This is useful when your filter type is derived from a data type rather than defined separately. Partial + useState is a common pattern for form state in enterprise apps.",
    dryRun:
      "🔁 **Think:** You write `const [filter, setFilter] = useState({})`. TypeScript infers the type as `{}`. You call `setFilter({ status: 'active' })`. TypeScript errors. Now you change to `useState<ShipmentFilter>({})`. You call the same setter. TypeScript accepts it. What changed — and why does the type argument fix it even though the initial object is still `{}`?",
    build:
      "**Learning focus:** Declare object state with an explicit type argument when the initial value is incomplete — understanding that TypeScript infers from the initial value alone and that an empty object or null cannot express the full range of values the state will hold.",
  },
},
{
  id: "step2",
  type: "question",
  phase: "Step 2 of 5",
  paal: "Write a handler that updates only the status field of the filter — leaving destination and carrier unchanged.",
  hint: "Spread the existing filter into a new object, then override only the status field. `{ ...filter, status: newStatus }` creates a new object with all existing fields plus the updated one.",
  example_code: `const handleQueryChange = (query: string) => {
  setParams(prev => ({ ...prev, query }));
};`,
  think_prompt:
    "setFilter replaces the entire filter object with whatever you pass. If you call `setFilter({ status: 'active' })`, what happens to destination and carrier?",
  mc_options: [
    "setFilter({ status: newStatus })",
    "setFilter(prev => ({ ...prev, status: newStatus }))",
    "filter.status = newStatus; setFilter(filter)",
  ],
  mc_correct_option:
    "setFilter(prev => ({ ...prev, status: newStatus }))",
  mc_anchor:
    "The spread form `{ ...prev, status: newStatus }` creates a brand new object that copies all fields from prev and overrides status. Without the spread, `{ status: newStatus }` replaces the entire object — destination and carrier are lost. Mutating `filter.status` directly and then passing the same object reference to setFilter doesn't trigger a re-render — React sees the same object reference and skips the update.",
  why_this_matters:
    "Object state updates always require spread. This is one of the most common sources of silent bugs in React applications — developers update one field on an object state and wonder why other fields disappear. The spread operator is the fix: create a new object that carries everything forward and changes only what you need.",
  answer_keywords: ["setFilter", "prev", "...", "prev", "status"],
  seed_code: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentFilter {
  status?: ShipmentStatus;
  destination?: string;
  carrier?: string;
}

const ShipmentFilterForm = (): JSX.Element => {
  const [filter, setFilter] = useState<ShipmentFilter>({});
  return <div />;
};`,
  starter_code: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentFilter {
  status?: ShipmentStatus;
  destination?: string;
  carrier?: string;
}

const ShipmentFilterForm = (): JSX.Element => {
  const [filter, setFilter] = useState<ShipmentFilter>({});

  // write handleStatusChange here
  // it receives a ShipmentStatus value
  // updates only the status field, leaves others unchanged

  return <div />;
};`,
  feedback_correct:
    "Exactly — `{ ...prev, status: newStatus }` copies all existing filter fields then overrides status. If destination or carrier were set, they survive the update untouched.",
  feedback_partial:
    "Close — check that you're spreading prev inside the new object. Without `...prev`, you create an object with only status and lose the other fields.",
  feedback_wrong:
    "The pattern: `setFilter(prev => ({ ...prev, status: newStatus }))` — the functional form receives the current filter as prev, spreads it into a new object, then overrides only status.",
  expected: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentFilter {
  status?: ShipmentStatus;
  destination?: string;
  carrier?: string;
}

const ShipmentFilterForm = (): JSX.Element => {
  const [filter, setFilter] = useState<ShipmentFilter>({});

  const handleStatusChange = (newStatus: ShipmentStatus) => {
    setFilter(prev => ({ ...prev, status: newStatus }));
  };

  return <div />;
};`,
  analog_example: `const handlePageChange = (page: number) => {
  setParams(prev => ({ ...prev, page }));
};`,
  deepDiveLabel:
    "Why doesn't mutating filter.status directly and calling setFilter(filter) trigger a re-render?",
  deepDive: {
    hook: "You try the shortcut: `filter.status = 'active'; setFilter(filter)`. TypeScript allows it — filter isn't typed as readonly. You render the component. Nothing updates. The console.log you added still shows the old filter. React completely ignored your update.\n\nThis confuses every React beginner who comes from a background where mutating an object and then 'saving' it should cause an update. In React, the rule is opposite: you must replace, never mutate.",
    pain: "⚠️ **Lesson:** You mutate `filter.status = 'active'` and call `setFilter(filter)`. React doesn't re-render. The UI is stuck. Why does React ignore this update — and what specifically does React check to decide whether to re-render?",
    mentalModel:
      "**Mental model:** React uses **reference equality** to detect state changes.\n- When you call setFilter, React compares the new value to the current value using `===`.\n- `filter === filter` is always true — it's the same object reference. You mutated the object but passed the same reference to setFilter.\n- React sees: 'old state === new state — nothing changed — skip re-render'.\n- `{ ...prev, status: 'active' }` creates a brand new object. The new object reference is not === to prev. React sees: 'different reference — state changed — re-render'.\n- This is why immutability is not a stylistic preference in React — it's mechanically required for re-renders to work.",
    discover:
      "**Pattern — mutation vs spread:**\n```tsx\n// ❌ direct mutation — same reference, React skips re-render\nfilter.status = 'active';\nsetFilter(filter); // filter === filter → no re-render\n\n// ❌ spreading but not using functional form\nsetFilter({ ...filter, status: 'active' }); // works but can be stale in batching\n\n// ✅ functional form with spread — correct and safe\nsetFilter(prev => ({ ...prev, status: 'active' })); // new reference → re-render\n\n// ✅ full object replacement — new reference → re-render\nsetFilter({ status: 'active', destination: 'Hamburg', carrier: 'Maersk' });\n```\n- mutation = same reference = no re-render\n- spread = new reference = re-render\n- functional form = safe against stale closures\n- React's equality check is `===` — shallow reference comparison, not deep equality",
    quickRules:
      "**Quick rules:**\n- ✅ `{ ...prev, field: newValue }` — creates new object, triggers re-render\n- ✅ functional form `prev => ({ ...prev, field: value })` — safe against staleness\n- ❌ `obj.field = value; setObj(obj)` — same reference, React skips re-render\n- ❌ `Object.assign(obj, { field: value }); setObj(obj)` — still same reference\n- React uses `===` to compare state — mutation preserves the reference, spread creates a new one",
    watchOut:
      "👀 **Watch out:** Spread is shallow — `{ ...filter }` creates a new object for the top level, but nested objects inside filter still share references with the original. If filter had a nested object field, mutating a field on that nested object would still not trigger a re-render. For nested state objects, each level that changes needs a new spread.",
    dryRun:
      "🔁 **Think:** filter is `{ status: 'active', destination: 'Hamburg', carrier: undefined }`. You call `setFilter(prev => ({ ...prev, destination: 'Rotterdam' }))`. Walk through: what is prev, what does `{ ...prev, destination: 'Rotterdam' }` evaluate to, and what is the new filter state after the re-render?",
    build:
      "**Learning focus:** Update a single field on object state using spread — understanding that React detects changes by reference equality, so mutation preserves the reference and skips the re-render, while spread creates a new object reference that triggers one.",
  },
},
{
  id: "step3",
  type: "question",
  phase: "Step 3 of 5",
  paal: "Add handlers for destination and carrier updates — each following the same spread pattern as handleStatusChange. Then render all three current filter values in the JSX.",
  hint: "Each handler follows the same pattern: receive a new value, spread prev, override the specific field. Render filter.status, filter.destination, and filter.carrier — using ?? to show a fallback when undefined.",
  example_code: `const handleCategoryChange = (category: string) => {
  setParams(prev => ({ ...prev, category }));
};`,
  think_prompt:
    "destination and carrier are both strings. Their handlers follow the same spread pattern as status. How do you render optional object fields safely — knowing any of them could be undefined?",
  mc_options: [
    "Render {filter.status} {filter.destination} {filter.carrier} directly",
    "Render {filter.status ?? 'Any'} {filter.destination ?? 'Any'} {filter.carrier ?? 'Any'}",
    "Render {filter?.status} {filter?.destination} {filter?.carrier}",
  ],
  mc_correct_option:
    "Render {filter.status ?? 'Any'} {filter.destination ?? 'Any'} {filter.carrier ?? 'Any'}",
  mc_anchor:
    "filter is always an object — it's never null or undefined — so optional chaining `filter?.status` is unnecessary. But the fields themselves are optional, so they can be undefined. `??` provides a fallback for null and undefined while treating empty strings as valid values. Rendering directly without ?? renders nothing when a field is undefined — technically correct but uninformative to the user.",
  why_this_matters:
    "Rendering state values with fallbacks is the pattern behind every filter panel, settings page, and profile form in enterprise apps — showing 'All statuses' instead of a blank when no filter is selected keeps the UI informative and prevents the jarring blank-space experience.",
  answer_keywords: [
    "handleDestinationChange", "handleCarrierChange",
    "filter.status", "filter.destination", "filter.carrier", "??",
  ],
  seed_code: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentFilter {
  status?: ShipmentStatus;
  destination?: string;
  carrier?: string;
}

const ShipmentFilterForm = (): JSX.Element => {
  const [filter, setFilter] = useState<ShipmentFilter>({});

  const handleStatusChange = (newStatus: ShipmentStatus) => {
    setFilter(prev => ({ ...prev, status: newStatus }));
  };

  return <div />;
};`,
  starter_code: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentFilter {
  status?: ShipmentStatus;
  destination?: string;
  carrier?: string;
}

const ShipmentFilterForm = (): JSX.Element => {
  const [filter, setFilter] = useState<ShipmentFilter>({});

  const handleStatusChange = (newStatus: ShipmentStatus) => {
    setFilter(prev => ({ ...prev, status: newStatus }));
  };

  // add handleDestinationChange and handleCarrierChange here

  return (
    <div>
      {/* render all three filter values with ?? fallbacks */}
    </div>
  );
};`,
  feedback_correct:
    "Exactly — three handlers following the same spread pattern, three rendered values with ?? fallbacks. The filter object state holds all three fields and each handler updates only its own field.",
  feedback_partial:
    "Close — check that each handler spreads prev and overrides only its own field. Also check the render — are all three fields showing with fallbacks when undefined?",
  feedback_wrong:
    "Add `handleDestinationChange = (dest: string) => setFilter(prev => ({ ...prev, destination: dest }))` and `handleCarrierChange = (carrier: string) => setFilter(prev => ({ ...prev, carrier }))`. Render each with `filter.status ?? 'Any'` etc.",
  expected: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentFilter {
  status?: ShipmentStatus;
  destination?: string;
  carrier?: string;
}

const ShipmentFilterForm = (): JSX.Element => {
  const [filter, setFilter] = useState<ShipmentFilter>({});

  const handleStatusChange = (newStatus: ShipmentStatus) => {
    setFilter(prev => ({ ...prev, status: newStatus }));
  };

  const handleDestinationChange = (destination: string) => {
    setFilter(prev => ({ ...prev, destination }));
  };

  const handleCarrierChange = (carrier: string) => {
    setFilter(prev => ({ ...prev, carrier }));
  };

  return (
    <div>
      <p>Status: {filter.status ?? 'Any'}</p>
      <p>Destination: {filter.destination ?? 'Any'}</p>
      <p>Carrier: {filter.carrier ?? 'Any'}</p>
    </div>
  );
};`,
  analog_example: `const handleCategoryChange = (category: string) => {
  setParams(prev => ({ ...prev, category }));
};`,
  deepDiveLabel:
    "Three separate handlers for three fields — is there a pattern to reduce that repetition?",
  deepDive: {
    hook: "You have three handlers that are structurally identical except for the field name. Five more filter fields get added. Eight handlers. All the same pattern. A colleague shows you a generic handler that takes the field name as a parameter.\n\nYou try it. TypeScript struggles with the types. You reach for keyof. It works — but only if you get the generic constraint right. This is a real TypeScript challenge that comes up in every form-heavy enterprise application.",
    pain: "⚠️ **Lesson:** You want one generic handler that updates any field on the filter object. You write `const handleChange = (field, value) => setFilter(prev => ({ ...prev, [field]: value }))`. TypeScript errors because field and value are untyped. How do you type a handler that accepts any valid field name and its corresponding value type?",
    mentalModel:
      "**Mental model:** keyof and indexed access types let you express 'any key of this interface and its corresponding value'.\n- `keyof ShipmentFilter` is the union `'status' | 'destination' | 'carrier'` — the set of valid field names.\n- `ShipmentFilter[K]` where K extends `keyof ShipmentFilter` is the type of the value for that specific key — TypeScript resolves it per key.\n- Together: `<K extends keyof ShipmentFilter>(field: K, value: ShipmentFilter[K])` is a generic function that accepts any field name and enforces the correct value type for that specific field.",
    discover:
      "**Pattern — generic field handler:**\n```tsx\n// ✅ generic handler — one function for all fields\nconst handleChange = <K extends keyof ShipmentFilter>(\n  field: K,\n  value: ShipmentFilter[K]\n) => {\n  setFilter(prev => ({ ...prev, [field]: value }));\n};\n\n// Usage:\nhandleChange('status', 'active');      // ✅ ShipmentStatus\nhandleChange('destination', 'Hamburg'); // ✅ string\nhandleChange('status', 'Hamburg');     // ❌ string not assignable to ShipmentStatus\nhandleChange('unknown', 'value');      // ❌ 'unknown' not in keyof ShipmentFilter\n\n// ⚠️ untyped version — compiles but no safety\nconst handleChange = (field: string, value: any) => {\n  setFilter(prev => ({ ...prev, [field]: value }));\n};\nhandleChange('status', 'typo');  // ❌ TypeScript says nothing\n```\n- keyof T: union of all key names on T\n- T[K]: the value type for key K on T\n- generic function: one handler, full type safety per field",
    quickRules:
      "**Quick rules:**\n- ✅ separate handlers when fields have different types or different side effects\n- ✅ generic handler with keyof when multiple fields share the same update pattern\n- ❌ `field: string, value: any` — untyped, no safety\n- ❌ `field: string, value: unknown` — safer but requires type narrowing before use\n- start with separate handlers — refactor to generic only when the repetition is clear and the TypeScript complexity is worth it",
    watchOut:
      "👀 **Watch out:** Computed property names `[field]: value` with dynamic field names can confuse TypeScript's type narrowing. In some cases TypeScript loses track of which field is being set and widens the type. If you see unexpected type errors with dynamic keys, falling back to explicit handlers is always the safe choice.",
    dryRun:
      "🔁 **Think:** filter is `{ status: 'active', destination: 'Hamburg', carrier: undefined }`. You call `handleDestinationChange('Rotterdam')`. Walk through the handler: what is prev, what does `{ ...prev, destination: 'Rotterdam' }` evaluate to, and what is the rendered output after the re-render?",
    build:
      "**Learning focus:** Write field-specific update handlers using the spread pattern — understanding that each handler creates a new object that preserves all existing fields and overrides only the one being updated.",
  },
},
{
  id: "step4",
  type: "question",
  phase: "Step 4 of 5",
  paal: "Add a resetFilter function that sets the filter back to its initial empty state in a single setter call.",
  hint: "Resetting to the initial value is just setFilter with the initial object. No need to spread — you're replacing the entire state with a known value.",
  example_code: `const resetSearch = () => {
  setParams({});
};`,
  think_prompt:
    "The reset button should clear all three filter fields simultaneously. What is the simplest way to reset the entire filter object to its empty state?",
  mc_options: [
    "setFilter(prev => ({ ...prev, status: undefined, destination: undefined, carrier: undefined }))",
    "setFilter({})",
    "setFilter(prev => {})",
  ],
  mc_correct_option: "setFilter({})",
  mc_anchor:
    "setFilter({}) replaces the entire state with a fresh empty object — all fields reset to undefined in one call. The spread form works but is unnecessarily verbose — you don't need prev when you're replacing the entire object with a known value, not updating based on the current one. `setFilter(prev => {})` is a bug — it passes a function that returns undefined (an implicit return from a block body), not an empty object.",
  why_this_matters:
    "Reset functionality is a first-class feature in every filter panel, form, and settings page. The ability to set the entire object state to a known value in one call is what makes reset clean — no need to individually clear each field, no risk of missing one.",
  answer_keywords: ["setFilter", "{}"],
  seed_code: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentFilter {
  status?: ShipmentStatus;
  destination?: string;
  carrier?: string;
}

const ShipmentFilterForm = (): JSX.Element => {
  const [filter, setFilter] = useState<ShipmentFilter>({});

  const handleStatusChange = (newStatus: ShipmentStatus) => {
    setFilter(prev => ({ ...prev, status: newStatus }));
  };

  const handleDestinationChange = (destination: string) => {
    setFilter(prev => ({ ...prev, destination }));
  };

  const handleCarrierChange = (carrier: string) => {
    setFilter(prev => ({ ...prev, carrier }));
  };

  return (
    <div>
      <p>Status: {filter.status ?? 'Any'}</p>
      <p>Destination: {filter.destination ?? 'Any'}</p>
      <p>Carrier: {filter.carrier ?? 'Any'}</p>
    </div>
  );
};`,
  starter_code: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentFilter {
  status?: ShipmentStatus;
  destination?: string;
  carrier?: string;
}

const ShipmentFilterForm = (): JSX.Element => {
  const [filter, setFilter] = useState<ShipmentFilter>({});

  const handleStatusChange = (newStatus: ShipmentStatus) => {
    setFilter(prev => ({ ...prev, status: newStatus }));
  };

  const handleDestinationChange = (destination: string) => {
    setFilter(prev => ({ ...prev, destination }));
  };

  const handleCarrierChange = (carrier: string) => {
    setFilter(prev => ({ ...prev, carrier }));
  };

  // add resetFilter here

  return (
    <div>
      <p>Status: {filter.status ?? 'Any'}</p>
      <p>Destination: {filter.destination ?? 'Any'}</p>
      <p>Carrier: {filter.carrier ?? 'Any'}</p>
      {/* add a reset button that calls resetFilter */}
    </div>
  );
};`,
  feedback_correct:
    "Exactly — `setFilter({})` replaces the entire state with an empty object. All fields reset to undefined. One call, full reset.",
  feedback_partial:
    "Close — the reset function only needs `setFilter({})`. You don't need to spread or reference prev — you're not updating based on the current state, you're replacing it entirely.",
  feedback_wrong:
    "Add `const resetFilter = () => setFilter({})`. The empty object satisfies ShipmentFilter because all fields are optional. Attach it to a button: `<button onClick={resetFilter}>Reset</button>`.",
  expected: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentFilter {
  status?: ShipmentStatus;
  destination?: string;
  carrier?: string;
}

const ShipmentFilterForm = (): JSX.Element => {
  const [filter, setFilter] = useState<ShipmentFilter>({});

  const handleStatusChange = (newStatus: ShipmentStatus) => {
    setFilter(prev => ({ ...prev, status: newStatus }));
  };

  const handleDestinationChange = (destination: string) => {
    setFilter(prev => ({ ...prev, destination }));
  };

  const handleCarrierChange = (carrier: string) => {
    setFilter(prev => ({ ...prev, carrier }));
  };

  const resetFilter = () => {
    setFilter({});
  };

  return (
    <div>
      <p>Status: {filter.status ?? 'Any'}</p>
      <p>Destination: {filter.destination ?? 'Any'}</p>
      <p>Carrier: {filter.carrier ?? 'Any'}</p>
      <button onClick={resetFilter}>Reset filters</button>
    </div>
  );
};`,
  analog_example: `const resetSearch = () => {
  setParams({});
};`,
  deepDiveLabel:
    "setFilter({}) resets correctly — but what if the initial state wasn't an empty object?",
  deepDive: {
    hook: "Your filter form has three fields. The product team adds a requirement: the default status should be 'active' — not empty. The initial state is now `{ status: 'active' }` instead of `{}`.\n\nYour reset button calls `setFilter({})`. It resets to empty — not to the default. Bug reported.\n\nThe fix is obvious in hindsight: extract the initial state into a constant and use that constant in both useState and resetFilter. But many developers never make that extraction and end up with reset logic that resets to the wrong state.",
    pain: "⚠️ **Lesson:** Your initial filter has a default status of 'active'. `setFilter({})` resets to empty, not to the default. How do you structure your code so reset always returns to the correct initial state — even if that state changes?",
    mentalModel:
      "**Mental model:** Extract initial state to a constant — then reference the constant in both useState and reset.\n- The initial state is data. useState uses it. Reset uses it. They should reference the same source.\n- If the initial state is inline `useState({ status: 'active' })`, reset has to know to call `setFilter({ status: 'active' })`. These are two places to update when the default changes.\n- If the initial state is a constant `const INITIAL_FILTER = { status: 'active' as ShipmentStatus }`, both useState and reset reference INITIAL_FILTER. Change the constant in one place and both update automatically.",
    discover:
      "**Pattern — extracted initial state:**\n```tsx\n// ✅ extracted constant — one source of truth for initial state\nconst INITIAL_FILTER: ShipmentFilter = { status: 'active' };\n\nconst ShipmentFilterForm = (): JSX.Element => {\n  const [filter, setFilter] = useState<ShipmentFilter>(INITIAL_FILTER);\n\n  const resetFilter = () => {\n    setFilter(INITIAL_FILTER); // always resets to the correct default\n  };\n};\n\n// ❌ inline initial state — reset and initial can drift apart\nconst [filter, setFilter] = useState<ShipmentFilter>({ status: 'active' });\nconst resetFilter = () => setFilter({}); // resets to wrong state!\n```\n- extract initial state to a typed constant above the component\n- reference the constant in useState and in reset\n- change happens in one place, both behaviours update",
    quickRules:
      "**Quick rules:**\n- ✅ extract initial state to a constant when it's non-trivial or referenced in multiple places\n- ✅ `setFilter(INITIAL_FILTER)` in reset — always returns to the correct default\n- ❌ `setFilter({})` when the initial state wasn't `{}` — resets to wrong state\n- ❌ duplicating the initial value in useState and reset — they drift apart\n- the constant pattern is also useful for testing — tests can import and inspect INITIAL_FILTER",
    watchOut:
      "👀 **Watch out:** If INITIAL_FILTER is an object, `setFilter(INITIAL_FILTER)` passes the same object reference every time reset is called. This is fine — React compares the new filter reference to the current filter reference. If the current filter differs from INITIAL_FILTER (it usually does), React re-renders. If you're worried about reference sharing causing issues, you can spread: `setFilter({ ...INITIAL_FILTER })`.",
    dryRun:
      "🔁 **Think:** INITIAL_FILTER is `{ status: 'active' }`. The user changes destination to 'Hamburg'. filter is now `{ status: 'active', destination: 'Hamburg' }`. They click reset. resetFilter calls `setFilter(INITIAL_FILTER)`. What is the new filter state — and what does the rendered output show for each field?",
    build:
      "**Learning focus:** Reset object state by passing a known value to the setter — and extract the initial state to a constant so reset and initialisation always reference the same source of truth.",
  },
},
{
  id: "step5",
  type: "question",
  phase: "Step 5 of 5",
  paal: "Add a computed value — activeFilterCount — that counts how many filter fields are currently set (not undefined). Display it alongside the Reset button.",
  hint: "Derive the count from the current filter object at render time. Object.values(filter) gives you an array of the field values. Filter out undefined and count what's left.",
  example_code: `const activeCount = Object.values(params).filter(v => v !== undefined).length;`,
  think_prompt:
    "activeFilterCount is not stored in state — it's computed from filter every time the component renders. How do you derive a value from state without creating another useState for it?",
  mc_options: [
    "const [activeFilterCount, setActiveFilterCount] = useState(0)",
    "const activeFilterCount = Object.values(filter).filter(v => v !== undefined).length",
    "const activeFilterCount = filter.status ? 1 : 0 + filter.destination ? 1 : 0 + filter.carrier ? 1 : 0",
  ],
  mc_correct_option:
    "const activeFilterCount = Object.values(filter).filter(v => v !== undefined).length",
  mc_anchor:
    "Derived values should not be stored in state — they should be computed from existing state at render time. Storing activeFilterCount in its own useState means you have to remember to update it every time filter changes — a synchronisation problem waiting to happen. `Object.values(filter).filter(v => v !== undefined).length` derives the count directly from the current filter on every render — it's always correct, always in sync, requires no extra setter calls.",
  why_this_matters:
    "Derived state is one of the most important concepts in React architecture. Every value that can be computed from existing state should be computed — not stored. Storing derived state creates two sources of truth that can drift apart. Computing it keeps the data model lean and the logic correct by definition.",
  answer_keywords: [
    "activeFilterCount", "Object.values", "filter", "undefined", "length",
  ],
  seed_code: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentFilter {
  status?: ShipmentStatus;
  destination?: string;
  carrier?: string;
}

const ShipmentFilterForm = (): JSX.Element => {
  const [filter, setFilter] = useState<ShipmentFilter>({});

  const handleStatusChange = (newStatus: ShipmentStatus) => {
    setFilter(prev => ({ ...prev, status: newStatus }));
  };

  const handleDestinationChange = (destination: string) => {
    setFilter(prev => ({ ...prev, destination }));
  };

  const handleCarrierChange = (carrier: string) => {
    setFilter(prev => ({ ...prev, carrier }));
  };

  const resetFilter = () => {
    setFilter({});
  };

  return (
    <div>
      <p>Status: {filter.status ?? 'Any'}</p>
      <p>Destination: {filter.destination ?? 'Any'}</p>
      <p>Carrier: {filter.carrier ?? 'Any'}</p>
      <button onClick={resetFilter}>Reset filters</button>
    </div>
  );
};`,
  starter_code: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentFilter {
  status?: ShipmentStatus;
  destination?: string;
  carrier?: string;
}

const ShipmentFilterForm = (): JSX.Element => {
  const [filter, setFilter] = useState<ShipmentFilter>({});

  const handleStatusChange = (newStatus: ShipmentStatus) => {
    setFilter(prev => ({ ...prev, status: newStatus }));
  };

  const handleDestinationChange = (destination: string) => {
    setFilter(prev => ({ ...prev, destination }));
  };

  const handleCarrierChange = (carrier: string) => {
    setFilter(prev => ({ ...prev, carrier }));
  };

  const resetFilter = () => {
    setFilter({});
  };

  // compute activeFilterCount here — derive from filter, don't store in state

  return (
    <div>
      <p>Status: {filter.status ?? 'Any'}</p>
      <p>Destination: {filter.destination ?? 'Any'}</p>
      <p>Carrier: {filter.carrier ?? 'Any'}</p>
      {/* render activeFilterCount and reset button */}
    </div>
  );
};`,
  feedback_correct:
    "Exactly — activeFilterCount is derived from filter on every render. It's always correct because it's computed from the single source of truth, never stored separately.",
  feedback_partial:
    "Close — make sure activeFilterCount is a plain const (not useState) and computed from Object.values(filter). Any value that can be derived from state should be derived, not stored.",
  feedback_wrong:
    "Add `const activeFilterCount = Object.values(filter).filter(v => v !== undefined).length` as a plain const inside the component. Render it as `{activeFilterCount} filters active` alongside the reset button.",
  expected: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentFilter {
  status?: ShipmentStatus;
  destination?: string;
  carrier?: string;
}

const ShipmentFilterForm = (): JSX.Element => {
  const [filter, setFilter] = useState<ShipmentFilter>({});

  const handleStatusChange = (newStatus: ShipmentStatus) => {
    setFilter(prev => ({ ...prev, status: newStatus }));
  };

  const handleDestinationChange = (destination: string) => {
    setFilter(prev => ({ ...prev, destination }));
  };

  const handleCarrierChange = (carrier: string) => {
    setFilter(prev => ({ ...prev, carrier }));
  };

  const resetFilter = () => {
    setFilter({});
  };

  const activeFilterCount = Object.values(filter).filter(v => v !== undefined).length;

  return (
    <div>
      <p>Status: {filter.status ?? 'Any'}</p>
      <p>Destination: {filter.destination ?? 'Any'}</p>
      <p>Carrier: {filter.carrier ?? 'Any'}</p>
      <p>{activeFilterCount} filters active</p>
      <button onClick={resetFilter}>Reset filters</button>
    </div>
  );
};`,
  analog_example: `const hasActiveFilters = Object.values(params).some(v => v !== undefined);`,
  deepDiveLabel:
    "Derived values computed on every render — does that cause a performance problem?",
  deepDive: {
    hook: "You compute activeFilterCount on every render. The filter has three fields — Object.values runs over three items. A colleague asks: 'isn't that wasteful? You could store it in state and only update it when the filter changes.' You think about it. Their suggestion sounds reasonable. You implement it. The component now has four useState calls instead of three — and a risk that the count falls out of sync whenever filter changes without the count setter being called.\n\nYour tech lead reviews it and reverts the change. 'Derive it. The computation is trivial. The risk of drift isn't.'",
    pain: "⚠️ **Lesson:** Computing activeFilterCount on every render vs storing it in state — which is more correct? Which is more performant? When would the computation cost actually matter?",
    mentalModel:
      "**Mental model:** Derived state is a correctness problem first, a performance problem second.\n- Storing derived state creates two sources of truth. They must be kept in sync. Every state update that changes filter must also update activeFilterCount. Miss one and the UI lies.\n- Computing it on every render guarantees correctness — it's always derived from the current filter, by definition.\n- Performance: computing a length from a 3-item array is nanoseconds. Re-renders are expensive. Storing derived state adds re-render risk (the count update triggers another render) and no meaningful performance gain.\n- useMemo is the tool for expensive derived computations — it memoizes the result and only recomputes when dependencies change. But for trivial computations like a count or a boolean flag, useMemo adds overhead without benefit.\n- The principle: derive unless the computation is measurably expensive. Then memoize.",
    discover:
      "**Pattern — derived values:**\n```tsx\n// ✅ trivial derivation — compute directly, no memoization needed\nconst activeFilterCount = Object.values(filter).filter(v => v !== undefined).length;\nconst hasActiveFilters = activeFilterCount > 0;\nconst filterSummary = filter.status ?? 'Any';\n\n// ✅ expensive derivation — memoize with useMemo (later lesson)\nconst filteredShipments = useMemo(\n  () => shipments.filter(s => matchesFilter(s, filter)), // O(n) over large array\n  [shipments, filter]\n);\n\n// ❌ stored derived state — correctness risk, no performance benefit\nconst [activeFilterCount, setActiveFilterCount] = useState(0);\n// Must remember to call setActiveFilterCount whenever filter changes\n```\n- trivial computations: derive directly at render time\n- expensive computations: useMemo (covered in Lesson 43)\n- stored derived state: avoid — correctness risk, maintenance burden",
    quickRules:
      "**Quick rules:**\n- ✅ derive trivial values at render time — counts, flags, formatted strings\n- ✅ use useMemo for expensive computations — filtering large arrays, complex transforms\n- ❌ store derived state in useState — synchronisation risk, maintenance overhead\n- ❌ premature optimisation — compute first, profile, then memoize if needed\n- the golden rule: if a value can be computed from other state or props, compute it. Don't store it.",
    watchOut:
      "👀 **Watch out:** Object.values(filter) returns values in insertion order — which depends on how the object was constructed. For counting purposes this is fine. For display or comparison purposes, property order in JavaScript objects is defined but not always intuitive. If order matters, use an explicit array instead.",
    dryRun:
      "🔁 **Think:** filter is `{ status: 'active', destination: undefined, carrier: 'Maersk' }`. Walk through `Object.values(filter).filter(v => v !== undefined).length`. What does Object.values return? What does filter return? What is the length? Now the user resets — filter becomes `{}`. What does the same expression return now?",
    build:
      "**Learning focus:** Derive values from state at render time instead of storing them — understanding that derived state creates synchronisation risk and that trivial computations at render time are correct by definition and have negligible performance cost.",
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
  lessonNum: 15,
  title: "Conditional Rendering",
  shortName: "JSX — CONDITIONAL",
});
