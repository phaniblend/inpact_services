import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
{
  id: "intro",
  type: "reveal",
  phase: "Lesson",
  content: {
    tag: "LESSON #14 (React Patterns)",
    title: "Controlled Select + Union Types",
    body: "A controlled input for free text is one thing — a controlled select is tighter. The select's value must always be one of a known set of options, which maps naturally to a TypeScript union type. In this lesson you'll build a fully controlled select element, type its value with a union, handle the change event correctly, and understand why select differs from input in how you set its initial value.",
    usecase:
      "A shipment filter panel lets the user narrow results by status: Active, Delayed, or Delivered. The status select is controlled — its value lives in state typed as a union, and every change updates state which flows back to the select. This keeps the selected value in sync with the filter logic at all times.",
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
      lesson: 2,
      label: "Inventory row — readonly fields, unions, nested types",
      reason: "Complete Lesson 2 (Inventory row — readonly fields, unions, nested types) first — it is a prerequisite on the React-TS track for this lesson.",
    },
    {
      lesson: 10,
      label: "useState — Primitives",
      reason: "Complete Lesson 10 (useState — Primitives) first — it is a prerequisite on the React-TS track for this lesson.",
    },
    {
      lesson: 13,
      label: "Controlled Inputs",
      reason: "Complete Lesson 13 (Controlled Inputs) first — it is a prerequisite on the React-TS track for this lesson.",
    },
  ],
},
{
  id: "objectives",
  type: "objectives",
  phase: "Objectives",
  items: [
    "Build a controlled select element with value from state and onChange updating state",
    "Type the selected value using a union type for compile-time exhaustiveness",
    "Render option elements by mapping over a typed options array",
    "Handle React.ChangeEvent<HTMLSelectElement> correctly",
    "Include an 'all' option that represents no active filter",
    "Build a reusable StatusSelect component with semantic onChange prop",
  ],
},
{
  id: "step1",
  type: "question",
  phase: "Step 1 of 5",
  paal: "Declare a ShipmentStatus union type and a StatusFilter type that is ShipmentStatus | 'all'. Initialise statusFilter state typed as StatusFilter with value 'all'.",
  hint: "The filter starts showing all shipments — 'all' is the initial value. StatusFilter must include 'all' so TypeScript accepts it as the initial state.",
  example_code: `type Priority = 'low' | 'medium' | 'high';
type PriorityFilter = Priority | 'all';
const [filter, setFilter] = useState<PriorityFilter>('all');`,
  think_prompt: "The filter can be 'all' or one of the three statuses. How do you extend ShipmentStatus to include 'all' as a valid filter value?",
  mc_options: [
    "type StatusFilter = ShipmentStatus; const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')",
    "type StatusFilter = ShipmentStatus | 'all'; const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')",
    "type StatusFilter = string; const [statusFilter, setStatusFilter] = useState('all')",
  ],
  mc_correct_option: "type StatusFilter = ShipmentStatus | 'all'; const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')",
  mc_anchor: "StatusFilter extends ShipmentStatus with 'all' — the union of all valid filter values. Without 'all', the initial value 'all' would not be assignable to ShipmentStatus. Using plain string loses all type safety — any string becomes valid, including typos.",
  why_this_matters: "Union types for select values give you compile-time exhaustiveness — TypeScript errors if you try to set an invalid value and can remind you in switch statements if you forget a case. This is the pattern behind every dropdown filter, tab selector, and status picker in enterprise apps.",
  answer_keywords: ["ShipmentStatus", "'active'", "'delayed'", "'delivered'", "StatusFilter", "| 'all'", "useState", "'all'"],
  seed_code: `import { useState } from 'react';`,
  starter_code: `import { useState } from 'react';

// define ShipmentStatus union type
// define StatusFilter = ShipmentStatus | 'all'

const ShipmentFilter = (): JSX.Element => {
  // declare statusFilter state — typed as StatusFilter, initialised to 'all'
  return <div />;
};`,
  feedback_correct: "Exactly — StatusFilter is the union of all valid filter values including 'all'. TypeScript enforces that statusFilter is always one of four known strings.",
  feedback_partial: "Close — make sure StatusFilter includes 'all' as a union member, and that useState has the explicit type argument `<StatusFilter>`.",
  feedback_wrong: "Define `type ShipmentStatus = 'active' | 'delayed' | 'delivered'` and `type StatusFilter = ShipmentStatus | 'all'`. Then `const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')`.",
  expected: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';
type StatusFilter = ShipmentStatus | 'all';

const ShipmentFilter = (): JSX.Element => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  return <div />;
};`,
  analog_example: `type SortOrder = 'asc' | 'desc' | 'none';
const [sortOrder, setSortOrder] = useState<SortOrder>('none');`,
  deepDiveLabel: "Union type for select values — but what happens in a switch when you add a new status?",
  deepDive: {
    hook: "You have a switch on StatusFilter with four cases. The product team adds 'pending' to ShipmentStatus. You update the union. Your switch no longer covers 'pending' — but TypeScript says nothing. You shipped a bug.",
    pain: "⚠️ **Lesson:** TypeScript can warn you when a switch doesn't cover all union members — but only if you set it up correctly. What is an exhaustive switch check?",
    mentalModel: "TypeScript's `never` type is the key. If all union members are covered, the default branch is unreachable — its type is `never`. If a new member is added and not covered, the default branch receives that value and TypeScript errors.\n\n```tsx\nconst assertNever = (value: never): never => {\n  throw new Error(`Unhandled case: ${value}`);\n};\n\nswitch (statusFilter) {\n  case 'active': return ...\n  case 'delayed': return ...\n  case 'delivered': return ...\n  case 'all': return shipments;\n  default: return assertNever(statusFilter); // TypeScript errors if a case is missing\n}\n```",
    discover: "```tsx\n// ✅ exhaustive — TypeScript errors if StatusFilter grows without updating the switch\nswitch (statusFilter) {\n  case 'active': ...\n  case 'delayed': ...\n  case 'delivered': ...\n  case 'all': ...\n  default: assertNever(statusFilter);\n}\n```",
    quickRules: "- ✅ union type for select values — compile-time safety\n- ✅ assertNever in switch default — exhaustiveness check\n- ❌ string type — any value valid, no exhaustiveness\n- ❌ switch without assertNever — new members silently fall through",
    watchOut: "👀 **Watch out:** assertNever only works at compile time. For runtime safety against API values, use a Zod schema or explicit runtime validation before the value enters your typed state.",
    dryRun: "🔁 **Think:** ShipmentStatus gains 'pending'. Your switch has cases for the original four plus 'all' but no 'pending'. With assertNever in default — TypeScript error where and saying what?",
    build: "**Learning focus:** Type filter state with a union that includes 'all' — understanding that union types enable exhaustive switch checking with assertNever.",
  },
},
{
  id: "step2",
  type: "question",
  phase: "Step 2 of 5",
  paal: "Build a controlled select with value={statusFilter} and onChange that casts e.target.value to StatusFilter before updating state.",
  hint: "Select onChange uses React.ChangeEvent<HTMLSelectElement>. e.target.value is always a string — cast it to StatusFilter with `as StatusFilter` since you control the option values.",
  example_code: `<select
  value={priorityFilter}
  onChange={e => setPriorityFilter(e.target.value as PriorityFilter)}
>`,
  think_prompt: "e.target.value on a select is typed as string but you know it's always a valid StatusFilter because you control the options. How do you tell TypeScript that?",
  mc_options: [
    "onChange={e => setStatusFilter(e.target.value)}",
    "onChange={e => setStatusFilter(e.target.value as StatusFilter)}",
    "onChange={e => setStatusFilter(e.target.value as unknown as StatusFilter)}",
  ],
  mc_correct_option: "onChange={e => setStatusFilter(e.target.value as StatusFilter)}",
  mc_anchor: "e.target.value is typed as string by ChangeEvent<HTMLSelectElement>. You know it's always a valid StatusFilter because you control the option elements — so `as StatusFilter` is a safe assertion. Passing the raw string errors because string is not assignable to StatusFilter. `as unknown as StatusFilter` is an overly defensive double-cast not needed here.",
  why_this_matters: "The type assertion `as StatusFilter` is the standard pattern for controlled select values. React types event.target.value as string, but you know it's a union member because you control the options. This is one of the few places where a type assertion is genuinely correct and not a hack.",
  answer_keywords: ["select", "value={statusFilter}", "onChange", "e.target.value", "as StatusFilter", "setStatusFilter"],
  seed_code: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';
type StatusFilter = ShipmentStatus | 'all';

const ShipmentFilter = (): JSX.Element => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  return <div />;
};`,
  starter_code: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';
type StatusFilter = ShipmentStatus | 'all';

const ShipmentFilter = (): JSX.Element => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  return (
    <div>
      {/* build controlled select here — value, onChange with type assertion */}
      <p>Filter: {statusFilter}</p>
    </div>
  );
};`,
  feedback_correct: "Exactly — value={statusFilter} drives the display, onChange reads e.target.value and casts to StatusFilter. State always holds a known union member.",
  feedback_partial: "Close — make sure you have both `value={statusFilter}` on the select AND `onChange={e => setStatusFilter(e.target.value as StatusFilter)}`.",
  feedback_wrong: "`<select value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)}>` — the type assertion tells TypeScript the value is always a StatusFilter member.",
  expected: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';
type StatusFilter = ShipmentStatus | 'all';

const ShipmentFilter = (): JSX.Element => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  return (
    <div>
      <select
        value={statusFilter}
        onChange={e => setStatusFilter(e.target.value as StatusFilter)}
      >
      </select>
      <p>Filter: {statusFilter}</p>
    </div>
  );
};`,
  analog_example: `<select
  value={sortOrder}
  onChange={e => setSortOrder(e.target.value as SortOrder)}
>`,
  deepDiveLabel: "The type assertion is safe here — but when is `as` a code smell?",
  deepDive: {
    hook: "You use `as StatusFilter` and it feels slightly uncomfortable. TypeScript is supposed to catch errors — and here you're telling it to trust you. Your tech lead says assertions are sometimes necessary, sometimes a red flag. How do you tell the difference?",
    pain: "⚠️ **Lesson:** `as StatusFilter` on a controlled select value is safe. But `as` can also silence real bugs. What distinguishes a legitimate assertion from a dangerous one?",
    mentalModel: "**Safe assertions** — you know something TypeScript can't:\n- Select value cast: you control the options\n- DOM queries: `document.getElementById('x') as HTMLInputElement`\n- After runtime validation\n\n**Dangerous assertions** — silencing a real error:\n- `(user as Admin).permissions` — user might not be Admin\n- `(response.data as ShipmentRecord[])` — data might not match\n- `(obj as any).hidden` — bypassing type safety\n\nThe test: **do you know something TypeScript doesn't, or are you guessing?** If guessing, use a type guard.",
    discover: "```tsx\n// ✅ safe — you control the options\nsetStatusFilter(e.target.value as StatusFilter);\n\n// ✅ type guard — runtime check, TypeScript narrows safely\nconst isStatusFilter = (v: string): v is StatusFilter =>\n  ['all', 'active', 'delayed', 'delivered'].includes(v);\n\nif (isStatusFilter(e.target.value)) setStatusFilter(e.target.value);\n```",
    quickRules: "- ✅ assert when you know more than TypeScript (controlled options)\n- ✅ type guard for runtime-uncertain values (API data, URL params)\n- ❌ assert to silence an error you don't understand\n- ❌ `as any` — always a red flag",
    watchOut: "👀 **Watch out:** The type guard pattern is safer for values from outside your control — URL params, localStorage, API responses. For option elements you render yourself, the assertion is fine.",
    dryRun: "🔁 **Think:** e.target.value is 'active'. TypeScript types it as string. You assert `as StatusFilter`. Is 'active' actually a valid StatusFilter? What if e.target.value was 'pending' (not in the union) — would TypeScript catch it at runtime?",
    build: "**Learning focus:** Use `as StatusFilter` to cast the select's string value — understanding when type assertions are legitimate vs when a type guard is safer.",
  },
},
{
  id: "step3",
  type: "question",
  phase: "Step 3 of 5",
  paal: "Define a typed STATUS_OPTIONS array outside the component and render option elements by mapping over it.",
  hint: "Type the array as `{ value: StatusFilter; label: string }[]`. Place it outside the component — it's a static constant and should not be recreated on every render.",
  example_code: `const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'none', label: 'Default' },
  { value: 'asc', label: 'A → Z' },
];

{SORT_OPTIONS.map(opt => (
  <option key={opt.value} value={opt.value}>{opt.label}</option>
))}`,
  think_prompt: "Hardcoding option elements works but is brittle. An options array centralises the data. How do you type it so every value is validated against StatusFilter?",
  mc_options: [
    "const STATUS_OPTIONS = [{ value: 'all', label: 'All Statuses' }, ...]",
    "const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [{ value: 'all', label: 'All Statuses' }, ...]",
    "const STATUS_OPTIONS: string[] = ['all', 'active', 'delayed', 'delivered']",
  ],
  mc_correct_option: "const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [{ value: 'all', label: 'All Statuses' }, ...]",
  mc_anchor: "Typing as `{ value: StatusFilter; label: string }[]` validates every value entry against the union — a typo like 'actve' errors immediately. The untyped array infers from values but loses the union constraint. A string array loses both label and type safety.",
  why_this_matters: "A typed options array is the standard pattern for any select-based filter in enterprise apps. It makes adding or removing options a single-place change, and TypeScript ensures every option value is a valid union member.",
  answer_keywords: ["STATUS_OPTIONS", "StatusFilter", "label", "string", "map", "option", "key", "value"],
  seed_code: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';
type StatusFilter = ShipmentStatus | 'all';

const ShipmentFilter = (): JSX.Element => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  return (
    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)}>
    </select>
  );
};`,
  starter_code: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';
type StatusFilter = ShipmentStatus | 'all';

// define STATUS_OPTIONS typed array here — outside the component

const ShipmentFilter = (): JSX.Element => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  return (
    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)}>
      {/* map over STATUS_OPTIONS to render option elements */}
    </select>
  );
};`,
  feedback_correct: "Exactly — the typed options array centralises all select data outside the component. TypeScript validates every value against StatusFilter, and the map renders each as an option element with a stable key.",
  feedback_partial: "Close — make sure the array is typed as `{ value: StatusFilter; label: string }[]` and that each option has `key={opt.value}` and `value={opt.value}`.",
  feedback_wrong: "Define `const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [{ value: 'all', label: 'All Statuses' }, ...]`. Map: `{STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}`.",
  expected: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';
type StatusFilter = ShipmentStatus | 'all';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'delayed', label: 'Delayed' },
  { value: 'delivered', label: 'Delivered' },
];

const ShipmentFilter = (): JSX.Element => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  return (
    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)}>
      {STATUS_OPTIONS.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};`,
  analog_example: `const PRIORITY_OPTIONS: { value: PriorityFilter; label: string }[] = [
  { value: 'all', label: 'All Priorities' },
  { value: 'high', label: 'High' },
];`,
  deepDiveLabel: "Options array outside the component — why not inside?",
  deepDive: {
    hook: "You move STATUS_OPTIONS inside the component. It still works. But a new array reference is created on every render. A colleague says 'move it out'. You ask why — it's a constant, it never changes.",
    pain: "⚠️ **Lesson:** Defining constant arrays inside a component creates a new reference on every render. Why does that matter?",
    mentalModel: "**Outside**: created once at module load. Same reference across all renders. Safe as useEffect dependency — never re-runs unnecessarily.\n\n**Inside**: recreated on every render. If used as a useEffect dependency or passed to a memoized child, it causes unnecessary re-runs or re-renders.\n\nFor static constants, outside is always correct.",
    discover: "```tsx\n// ✅ outside — stable reference\nconst STATUS_OPTIONS = [...];\n\n// ⚠️ inside — new reference every render\nconst Component = () => {\n  const STATUS_OPTIONS = [...]; // recreated each render\n  useEffect(() => {}, [STATUS_OPTIONS]); // re-runs every render!\n};\n```",
    quickRules: "- ✅ static constants: outside the component\n- ✅ dynamic data from props/state: inside (compute or useMemo)\n- ❌ static data inside — unstable reference, potential effect/memo bugs",
    watchOut: "👀 **Watch out:** This applies to objects too — `const STYLE = { color: 'red' }` inside a component creates a new object each render. Hoist constants outside.",
    dryRun: "🔁 **Think:** STATUS_OPTIONS is inside the component and in a useEffect dependency array. The component re-renders for unrelated state. What happens to the STATUS_OPTIONS reference — does the effect run again?",
    build: "**Learning focus:** Define the options array outside the component with a typed value field — for reference stability and type validation.",
  },
},
{
  id: "step4",
  type: "question",
  phase: "Step 4 of 5",
  paal: "Build a reusable StatusSelect component with value (StatusFilter), onChange ((value: StatusFilter) => void), and optional label props.",
  hint: "The onChange prop should accept a typed StatusFilter value directly — not the raw ChangeEvent. The component handles the event internally and calls the prop with the typed value.",
  example_code: `interface StatusSelectProps {
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
  label?: string;
}`,
  think_prompt: "The parent should receive a StatusFilter from onChange — not a raw browser event. Where does the event-to-value conversion happen?",
  mc_options: [
    "onChange prop: (e: React.ChangeEvent<HTMLSelectElement>) => void",
    "onChange prop: (value: StatusFilter) => void — conversion happens inside the component",
    "No onChange prop — component manages its own state internally",
  ],
  mc_correct_option: "onChange prop: (value: StatusFilter) => void — conversion happens inside the component",
  mc_anchor: "Abstracting the event into a typed value makes the component easier to use — the parent receives a clean StatusFilter, not a raw event. The component handles the conversion internally. Passing the raw ChangeEvent leaks implementation details. Managing state internally makes the component uncontrolled and unflexible.",
  why_this_matters: "Semantic callback props — `(value: StatusFilter) => void` instead of `(e: ChangeEvent) => void` — are the standard for reusable form components in enterprise design systems. The component owns event handling; the parent owns the value.",
  answer_keywords: ["StatusSelectProps", "value", "StatusFilter", "onChange", "(value: StatusFilter) => void", "label?"],
  seed_code: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';
type StatusFilter = ShipmentStatus | 'all';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'delayed', label: 'Delayed' },
  { value: 'delivered', label: 'Delivered' },
];`,
  starter_code: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';
type StatusFilter = ShipmentStatus | 'all';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'delayed', label: 'Delayed' },
  { value: 'delivered', label: 'Delivered' },
];

// define StatusSelectProps interface
// build StatusSelect component
// internally convert ChangeEvent to StatusFilter before calling onChange prop`,
  feedback_correct: "Exactly — the component converts ChangeEvent to StatusFilter internally and calls the parent's onChange with the clean typed value. The parent never sees a ChangeEvent.",
  feedback_partial: "Close — check the onChange prop type. It should be `(value: StatusFilter) => void`. The component handles the event; the prop delivers the value.",
  feedback_wrong: "Define `interface StatusSelectProps { value: StatusFilter; onChange: (value: StatusFilter) => void; label?: string; }`. In the component: `onChange={e => onChange(e.target.value as StatusFilter)}`.",
  expected: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';
type StatusFilter = ShipmentStatus | 'all';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'delayed', label: 'Delayed' },
  { value: 'delivered', label: 'Delivered' },
];

interface StatusSelectProps {
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
  label?: string;
}

const StatusSelect = ({ value, onChange, label }: StatusSelectProps): JSX.Element => {
  return (
    <div>
      {label && <label>{label}</label>}
      <select
        value={value}
        onChange={e => onChange(e.target.value as StatusFilter)}
      >
        {STATUS_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};`,
  analog_example: `interface SortSelectProps {
  value: SortOrder;
  onChange: (value: SortOrder) => void;
}`,
  deepDiveLabel: "Semantic onChange prop — how does this compose with the parent?",
  deepDive: {
    hook: "You have StatusSelect with `onChange: (value: StatusFilter) => void`. The parent has `const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')`. How do you wire them — does onChange need a wrapper?",
    pain: "⚠️ **Lesson:** The setter signature is `(value: StatusFilter) => void`. The prop is `(value: StatusFilter) => void`. Do you pass the setter directly or wrap it?",
    mentalModel: "You can pass setStatusFilter directly — its dispatch type is compatible with `(value: StatusFilter) => void` because React's SetStateAction accepts a direct value.\n\n```tsx\n<StatusSelect\n  value={statusFilter}\n  onChange={setStatusFilter} // direct pass — signatures match\n/>\n```\n\nUse an arrow wrapper only when you need additional logic:\n```tsx\nonChange={value => {\n  setStatusFilter(value);\n  logFilterChange(value); // extra side effect\n}}\n```",
    discover: "```tsx\n// ✅ setter passed directly — signatures match\n<StatusSelect value={statusFilter} onChange={setStatusFilter} />\n\n// ✅ wrapper for additional logic\n<StatusSelect value={statusFilter} onChange={v => { setStatusFilter(v); track(v); }} />\n```",
    quickRules: "- ✅ semantic onChange: `(value: T) => void` — parent gets typed value\n- ✅ setter as onChange: pass directly when signatures match\n- ✅ arrow wrapper: when extra logic needed alongside setter\n- ❌ raw ChangeEvent as onChange: leaks implementation",
    watchOut: "👀 **Watch out:** Passing setStatusFilter directly works for direct values. The functional update form `prev => newValue` is also valid but rarely needed for a select — you're always setting a specific new value, not deriving from the previous one.",
    dryRun: "🔁 **Think:** User selects 'delayed'. StatusSelect's internal handler: `e => onChange(e.target.value as StatusFilter)`. onChange is setStatusFilter. What value does setStatusFilter receive — and what is statusFilter after re-render?",
    build: "**Learning focus:** Build a reusable StatusSelect with semantic onChange — understanding how semantic props simplify parent usage and enable direct setter passing.",
  },
},
{
  id: "step5",
  type: "question",
  phase: "Step 5 of 5",
  paal: "Compose ShipmentFilterPage — StatusSelect for the filter, a shipments array, and a derived visible list filtered by statusFilter. Render the filtered count.",
  hint: "Filter before the return: `const visible = statusFilter === 'all' ? shipments : shipments.filter(s => s.status === statusFilter)`. Derive the count from visible.length.",
  example_code: `const visible = categoryFilter === 'all'
  ? products
  : products.filter(p => p.category === categoryFilter);

<p>{visible.length} results</p>`,
  think_prompt: "visible is derived from both shipments and statusFilter. It updates when either changes. Where does this derivation live — in state or as a computed const before the return?",
  mc_options: [
    "const [visible, setVisible] = useState(shipments); // update in onChange",
    "const visible = statusFilter === 'all' ? shipments : shipments.filter(s => s.status === statusFilter)",
    "Filter inside JSX: {shipments.filter(s => s.status === statusFilter).map(...)}",
  ],
  mc_correct_option: "const visible = statusFilter === 'all' ? shipments : shipments.filter(s => s.status === statusFilter)",
  mc_anchor: "Derived list computed before the return is always correct — recalculates whenever statusFilter or shipments changes, no manual synchronisation. Storing in useState requires updating it every time either dependency changes. Filtering inside JSX works but mixes data and presentation.",
  why_this_matters: "Filter + map is the foundational pattern of every data-driven list view. The filter computes the visible subset from state; the map renders it. Both are derived — neither needs its own state variable.",
  answer_keywords: ["visible", "statusFilter", "'all'", "shipments.filter", "s.status", "visible.length"],
  seed_code: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';
type StatusFilter = ShipmentStatus | 'all';

interface ShipmentRecord {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
}

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'delayed', label: 'Delayed' },
  { value: 'delivered', label: 'Delivered' },
];

interface StatusSelectProps {
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
  label?: string;
}

const StatusSelect = ({ value, onChange, label }: StatusSelectProps): JSX.Element => (
  <div>
    {label && <label>{label}</label>}
    <select value={value} onChange={e => onChange(e.target.value as StatusFilter)}>
      {STATUS_OPTIONS.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);`,
  starter_code: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';
type StatusFilter = ShipmentStatus | 'all';

interface ShipmentRecord {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
}

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All Statuses' }, { value: 'active', label: 'Active' },
  { value: 'delayed', label: 'Delayed' }, { value: 'delivered', label: 'Delivered' },
];

interface StatusSelectProps { value: StatusFilter; onChange: (value: StatusFilter) => void; label?: string; }

const StatusSelect = ({ value, onChange, label }: StatusSelectProps): JSX.Element => (
  <div>
    {label && <label>{label}</label>}
    <select value={value} onChange={e => onChange(e.target.value as StatusFilter)}>
      {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

const ShipmentFilterPage = (): JSX.Element => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [shipments] = useState<ShipmentRecord[]>([
    { shipmentId: 'NX-001', destination: 'Hamburg', status: 'active' },
    { shipmentId: 'NX-002', destination: 'Rotterdam', status: 'delayed' },
    { shipmentId: 'NX-003', destination: 'Antwerp', status: 'delivered' },
    { shipmentId: 'NX-004', destination: 'Bremen', status: 'active' },
  ]);

  // derive visible list here
  return (
    <div>
      <StatusSelect label="Filter by status" value={statusFilter} onChange={setStatusFilter} />
      {/* render count and list */}
    </div>
  );
};`,
  feedback_correct: "Exactly — visible is derived before the return, always correct, zero synchronisation risk. One source of truth, one derived result.",
  feedback_partial: "Close — make sure visible is a plain const (not useState) and that you render both the count and the mapped list of visible items.",
  feedback_wrong: "Add `const visible = statusFilter === 'all' ? shipments : shipments.filter(s => s.status === statusFilter)`. Render `<p>{visible.length} shipments shown</p>` and map over visible.",
  expected: `const ShipmentFilterPage = (): JSX.Element => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [shipments] = useState<ShipmentRecord[]>([
    { shipmentId: 'NX-001', destination: 'Hamburg', status: 'active' },
    { shipmentId: 'NX-002', destination: 'Rotterdam', status: 'delayed' },
    { shipmentId: 'NX-003', destination: 'Antwerp', status: 'delivered' },
    { shipmentId: 'NX-004', destination: 'Bremen', status: 'active' },
  ]);

  const visible = statusFilter === 'all'
    ? shipments
    : shipments.filter(s => s.status === statusFilter);

  return (
    <div>
      <StatusSelect label="Filter by status" value={statusFilter} onChange={setStatusFilter} />
      <p>{visible.length} shipment{visible.length !== 1 ? 's' : ''} shown</p>
      {visible.map(s => (
        <div key={s.shipmentId}>
          <p>{s.shipmentId} — {s.destination} — {s.status}</p>
        </div>
      ))}
    </div>
  );
};`,
  analog_example: `const visible = priorityFilter === 'all'
  ? orders
  : orders.filter(o => o.priority === priorityFilter);`,
  deepDiveLabel: "Derived filter list — when does it get expensive enough to memoize?",
  deepDive: {
    hook: "4 shipments filter instantly. 4,000 shipments with a complex multi-field filter might be noticeable. A colleague adds useMemo. Was that necessary?",
    pain: "⚠️ **Lesson:** `shipments.filter(...)` runs on every render. At what scale is useMemo worth it?",
    mentalModel: "**Rule of thumb**: measure before memoizing. `Array.filter` over 1,000 items takes ~1ms — imperceptible. Memoization has its own overhead.\n\n**When useMemo is worth it**: filter over 10,000+ items, complex multi-field filter with regex or date parsing, component re-renders frequently for unrelated reasons.\n\n```tsx\nconst visible = useMemo(\n  () => statusFilter === 'all' ? shipments : shipments.filter(s => s.status === statusFilter),\n  [shipments, statusFilter]\n);\n```",
    discover: "```tsx\n// ✅ direct — fine for small/medium lists\nconst visible = statusFilter === 'all' ? shipments : shipments.filter(...);\n\n// ✅ memoized — for large lists or frequent unrelated re-renders\nconst visible = useMemo(() => ..., [shipments, statusFilter]);\n```",
    quickRules: "- ✅ direct derivation: < ~5,000 items, simple filter\n- ✅ useMemo: 10,000+ items, complex filter, frequent unrelated re-renders\n- ❌ premature useMemo — complexity without measurable benefit\n- ❌ stored filtered list in useState — synchronisation risk",
    watchOut: "👀 **Watch out:** useMemo dependencies must include everything the computation reads. Forgetting `shipments` or `statusFilter` causes stale results. React's exhaustive-deps ESLint rule will warn you.",
    dryRun: "🔁 **Think:** useMemo with `[shipments, statusFilter]`. User changes filter — does useMemo recompute? Unrelated state changes — does it recompute? A new shipment is added — does it recompute?",
    build: "**Learning focus:** Derive the filtered list from state before the return — knowing when direct derivation is sufficient and when useMemo is warranted.",
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
  lessonNum: 14,
  title: "Controlled Select + Union Types",
  shortName: "PATTERNS — CONTROLLED SELECT",
});
