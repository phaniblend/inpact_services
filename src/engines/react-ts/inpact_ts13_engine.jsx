import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
{
  id: "intro",
  type: "reveal",
  phase: "Lesson",
  content: {
    tag: "LESSON #13 (React Patterns)",
    title: "Controlled Inputs",
    body: "Almost every real application renders a list — shipment cards, notification rows, table entries, search results. In React, lists are rendered by calling .map() on an array and returning JSX for each element. The key prop is what makes this efficient: it lets React track individual list items across re-renders so it can update only what changed, not rebuild the whole list from scratch.",
    usecase:
      "A shipment dashboard renders 50 shipment cards from an API response. The user assigns a driver to one — only that card should update. Without key, React rebuilds all 50. With a stable unique key, React finds the changed card by identity and updates just that one. At 50 items the difference is subtle; at 5,000 it's the difference between responsive and broken.",
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
    "Render a list of JSX elements by calling .map() on an array inside JSX",
    "Supply a unique, stable key prop to each list element",
    "Understand why key must be unique, stable, and never an array index for dynamic lists",
    "Filter an array before mapping to render a conditional subset",
    "Handle the empty list case with conditional rendering",
  ],
},
{
  id: "step1",
  type: "question",
  phase: "Step 1 of 5",
  paal: "Define a ShipmentRecord interface with shipmentId (string), destination (string), and status (ShipmentStatus). Then declare a shipments state variable typed as ShipmentRecord[], initialised with three hardcoded shipment objects.",
  hint: "The array holds objects — use the explicit type argument: useState<ShipmentRecord[]>([...]).",
  example_code: `const [orders, setOrders] = useState<OrderRecord[]>([
  { orderId: 'ORD-001', customer: 'Alice', status: 'pending' },
]);`,
  think_prompt:
    "The list needs typed data to render. What interface describes each shipment — and how do you initialise state with a typed array of three concrete shipments?",
  mc_options: [
    "const [shipments, setShipments] = useState([])",
    "const [shipments, setShipments] = useState<ShipmentRecord[]>([{ shipmentId: 'NX-001', destination: 'Hamburg', status: 'active' }, ...])",
    "const shipments: ShipmentRecord[] = [{ shipmentId: 'NX-001', destination: 'Hamburg', status: 'active' }, ...]",
  ],
  mc_correct_option:
    "const [shipments, setShipments] = useState<ShipmentRecord[]>([{ shipmentId: 'NX-001', destination: 'Hamburg', status: 'active' }, ...])",
  mc_anchor:
    "useState with a typed array lets the list re-render reactively when shipments change (remove, add, reorder). A plain const is static — it can't trigger re-renders. The untyped useState([]) infers never[], making all field access errors.",
  why_this_matters:
    "Shipment lists in enterprise apps come from API calls and update in real time — additions, removals, status changes. Using state means the UI updates automatically when the data changes. The typed array state means TypeScript enforces the shape of every item.",
  answer_keywords: ["ShipmentRecord", "shipmentId", "destination", "status", "useState", "ShipmentRecord[]"],
  seed_code: `import { useState } from 'react';
type ShipmentStatus = 'active' | 'delayed' | 'delivered';`,
  starter_code: `import { useState } from 'react';
type ShipmentStatus = 'active' | 'delayed' | 'delivered';

// define ShipmentRecord interface here

const ShipmentList = (): JSX.Element => {
  // declare shipments as ShipmentRecord[], initialised with 3 hardcoded objects

  return <div />;
};`,
  feedback_correct:
    "Exactly — the typed array state gives TypeScript the element shape and gives React the reactive trigger. All three fields are validated against ShipmentRecord on every item.",
  feedback_partial:
    "Close — make sure the interface has all three fields, the useState has the explicit type argument `<ShipmentRecord[]>`, and the initial array has three complete objects.",
  feedback_wrong:
    "Define `interface ShipmentRecord { shipmentId: string; destination: string; status: ShipmentStatus; }`. Then `const [shipments, setShipments] = useState<ShipmentRecord[]>([...three objects...])`. ",
  expected: `import { useState } from 'react';
type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentRecord {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
}

const ShipmentList = (): JSX.Element => {
  const [shipments, setShipments] = useState<ShipmentRecord[]>([
    { shipmentId: 'NX-001', destination: 'Hamburg', status: 'active' },
    { shipmentId: 'NX-002', destination: 'Rotterdam', status: 'delayed' },
    { shipmentId: 'NX-003', destination: 'Antwerp', status: 'delivered' },
  ]);
  return <div />;
};`,
  analog_example: `const [routes, setRoutes] = useState<RouteRecord[]>([
  { routeId: 'RT-001', origin: 'Berlin', destination: 'Prague' },
]);`,
  deepDiveLabel: "useState for list data vs a plain const — when does list data need to be state?",
  deepDive: {
    hook: "Your list renders from a plain const array — no state. It works. Then the user can add a shipment. You call setShipments... but there is no setShipments. You convert to useState. The UI updates. But a colleague asks: 'what if the list comes from an API and never changes after load? Is useState always required?'",
    pain: "⚠️ **Lesson:** When should list data be state — and when is a plain const or a prop sufficient?",
    mentalModel:
      "**Mental model:** Ask — can the list change during the component's lifetime?\n- Plain const: the list is static and defined in the component. Can't change — no re-render needed.\n- Prop: the list comes from a parent. Parent controls updates, child just renders.\n- useState: the list can change inside this component (add, remove, reorder, filter).\n- useSWR / React Query (later lessons): the list comes from an API and can be refreshed, paginated, or mutated.\n- Most production lists come from APIs via data-fetching hooks — not useState directly. useState is appropriate for list state that's local to the component (tag selections, local drafts, filter results).",
    discover:
      "```tsx\n// ✅ plain const — static list, no mutations\nconst STATUS_OPTIONS = ['active', 'delayed', 'delivered'];\n\n// ✅ prop — list from parent, parent controls updates\nconst ShipmentList = ({ shipments }: { shipments: ShipmentRecord[] }) => { ... };\n\n// ✅ useState — locally managed, can be mutated\nconst [drafts, setDrafts] = useState<ShipmentRecord[]>([]);\n\n// ✅ data fetching hook — API-driven (Lesson 90+)\nconst { data: shipments } = useSWR('/api/shipments', fetcher);\n```",
    quickRules:
      "- ✅ static list → plain const\n- ✅ parent-managed list → prop\n- ✅ locally mutable list → useState\n- ✅ API-driven list → data fetching hook\n- ❌ useState for data that comes from props — creates sync issues",
    watchOut: "👀 **Watch out:** Initialising useState from a prop (`useState(props.shipments)`) creates a local copy that diverges from the prop when the parent updates. If the list comes from a parent, use the prop directly — don't copy it into local state.",
    dryRun: "🔁 **Think:** A parent component fetches shipments from an API and passes them as a prop. The child calls `const [shipments, setShipments] = useState(props.shipments)`. The parent re-fetches and the prop updates. Does the child's state update? What does the user see?",
    build: "**Learning focus:** Declare typed array state for list data that can change — understanding when state, props, and constants are each the right choice for list data.",
  },
},
{
  id: "step2",
  type: "question",
  phase: "Step 2 of 5",
  paal: "Render the shipments list by calling .map() inside the JSX return. Each shipment should render as a div containing its shipmentId, destination, and status. Include a key prop on each div.",
  hint: "Call .map() directly inside JSX curly braces. Return JSX for each item. The key prop goes on the outermost element — not inside it.",
  example_code: `{orders.map(order => (
  <div key={order.orderId}>
    <p>{order.customer}</p>
    <p>{order.status}</p>
  </div>
))}`,
  think_prompt:
    "You have an array of shipment objects and you need a div for each one. How do you transform the array into JSX elements — and where exactly does the key prop go?",
  mc_options: [
    "{shipments.map(s => <div><p key={s.shipmentId}>{s.shipmentId}</p></div>)}",
    "{shipments.map(s => <div key={s.shipmentId}><p>{s.shipmentId}</p><p>{s.destination}</p><p>{s.status}</p></div>)}",
    "{shipments.forEach(s => <div key={s.shipmentId}>{s.shipmentId}</div>)}",
  ],
  mc_correct_option:
    "{shipments.map(s => <div key={s.shipmentId}><p>{s.shipmentId}</p><p>{s.destination}</p><p>{s.status}</p></div>)}",
  mc_anchor:
    "key goes on the outermost element returned from the map callback — the div that wraps each item, not on an inner element. forEach returns undefined — it doesn't produce an array of JSX elements and nothing renders. The first option puts key on a child element, not the root — React will warn and the reconciliation won't work correctly.",
  why_this_matters:
    "The .map() pattern inside JSX is how React renders every dynamic list in every enterprise application. Key on the outermost returned element is the invariant that makes React's list reconciliation work. Getting this wrong produces console warnings that are easy to miss and performance problems that are hard to debug.",
  answer_keywords: ["shipments.map", "key={s.shipmentId}", "div", "shipmentId", "destination", "status"],
  seed_code: `import { useState } from 'react';
type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentRecord {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
}

const ShipmentList = (): JSX.Element => {
  const [shipments, setShipments] = useState<ShipmentRecord[]>([
    { shipmentId: 'NX-001', destination: 'Hamburg', status: 'active' },
    { shipmentId: 'NX-002', destination: 'Rotterdam', status: 'delayed' },
    { shipmentId: 'NX-003', destination: 'Antwerp', status: 'delivered' },
  ]);
  return <div />;
};`,
  starter_code: `import { useState } from 'react';
type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentRecord {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
}

const ShipmentList = (): JSX.Element => {
  const [shipments, setShipments] = useState<ShipmentRecord[]>([
    { shipmentId: 'NX-001', destination: 'Hamburg', status: 'active' },
    { shipmentId: 'NX-002', destination: 'Rotterdam', status: 'delayed' },
    { shipmentId: 'NX-003', destination: 'Antwerp', status: 'delivered' },
  ]);
  return (
    <div>
      {/* map over shipments here — key on the outermost div */}
    </div>
  );
};`,
  feedback_correct:
    "Exactly — .map() transforms each ShipmentRecord into a div, key goes on the outermost returned element, and all three fields render inside it.",
  feedback_partial:
    "Close — check where key is placed. It must be on the outermost element the map callback returns, not on an inner child.",
  feedback_wrong:
    "Call `.map()` inside the JSX: `{shipments.map(s => (<div key={s.shipmentId}><p>{s.shipmentId}</p><p>{s.destination}</p><p>{s.status}</p></div>))}` — key on the wrapper div, all fields inside.",
  expected: `import { useState } from 'react';
type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentRecord {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
}

const ShipmentList = (): JSX.Element => {
  const [shipments, setShipments] = useState<ShipmentRecord[]>([
    { shipmentId: 'NX-001', destination: 'Hamburg', status: 'active' },
    { shipmentId: 'NX-002', destination: 'Rotterdam', status: 'delayed' },
    { shipmentId: 'NX-003', destination: 'Antwerp', status: 'delivered' },
  ]);
  return (
    <div>
      {shipments.map(s => (
        <div key={s.shipmentId}>
          <p>{s.shipmentId}</p>
          <p>{s.destination}</p>
          <p>{s.status}</p>
        </div>
      ))}
    </div>
  );
};`,
  analog_example: `{routes.map(route => (
  <div key={route.routeId}>
    <p>{route.origin} → {route.destination}</p>
  </div>
))}`,
  deepDiveLabel: "key on the outermost element — but what if the outermost is a Fragment?",
  deepDive: {
    hook: "Your map callback returns a Fragment `<>` instead of a div — to avoid a wrapper element per item. You try `<key={s.shipmentId}>` and TypeScript errors. React Fragments with key need the longhand syntax.",
    pain: "⚠️ **Lesson:** You want each list item to render two sibling elements without a wrapper div. You use a Fragment. But shorthand `<>` doesn't accept props — so how do you put key on a Fragment?",
    mentalModel:
      "**Mental model:** Fragment shorthand `<>` is syntactic sugar that doesn't support props. When you need key on a Fragment, use the longhand `<React.Fragment key={...}>`.\n```tsx\n// ✅ longhand Fragment with key\nshipments.map(s => (\n  <React.Fragment key={s.shipmentId}>\n    <dt>{s.shipmentId}</dt>\n    <dd>{s.destination}</dd>\n  </React.Fragment>\n))\n\n// ❌ shorthand Fragment — no key support\nshipments.map(s => (\n  <> // no key here\n    <dt>{s.shipmentId}</dt>\n    <dd>{s.destination}</dd>\n  </>\n))\n```",
    quickRules:
      "- ✅ `<div key={...}>` — key on a wrapper element\n- ✅ `<React.Fragment key={...}>` — key on a fragment (longhand required)\n- ❌ `<>` without key in a map — React will warn\n- ❌ key on a child inside the map callback — React ignores it for reconciliation",
    watchOut: "👀 **Watch out:** Missing key doesn't break rendering — React falls back to index-based reconciliation. But it degrades performance on list updates and can cause subtle state bugs when list items have local state.",
    dryRun: "🔁 **Think:** You render a list with `<> ... </>` shorthand Fragments — no key. You add a shipment to the start of the list. React re-renders. With keys, React would know 'NX-001 moved, add NX-000 at top'. Without keys, what does React compare — and what might it update incorrectly?",
    build: "**Learning focus:** Place key on the outermost element returned from a map callback — using longhand Fragment when a wrapper element is undesirable.",
  },
},
{
  id: "step3",
  type: "question",
  phase: "Step 3 of 5",
  paal: "Why is the array index a bad key for dynamic lists? Demonstrate by explaining what happens to React's reconciliation when a shipment is removed from the middle of the list if keys are indices.",
  hint: "This step is conceptual — write the index-based key version and explain the bug it causes when the list is reordered or an item is removed.",
  example_code: `{shipments.map((s, index) => (
  <div key={index}> {/* ❌ index as key */}
    <p>{s.shipmentId}</p>
  </div>
))}`,
  think_prompt:
    "If you remove NX-002 from position 1, what was at key=2 before the removal — and what's at key=2 after the removal? Does React know the item changed, or does it think it's the same item?",
  mc_options: [
    "Index keys are fine — React re-renders the whole list anyway",
    "Index keys break reconciliation when items are removed or reordered — React maps the new item at position N to the old DOM node at position N, potentially preserving stale state or animating incorrectly",
    "Index keys only cause problems when the list is sorted",
  ],
  mc_correct_option:
    "Index keys break reconciliation when items are removed or reordered — React maps the new item at position N to the old DOM node at position N, potentially preserving stale state or animating incorrectly",
  mc_anchor:
    "React uses key to match DOM nodes from the previous render to items in the current render. With index keys: before removal, NX-003 has key=2. After removing NX-002, NX-003 moves to index 1 and has key=1. React sees key=1 existed before (NX-002) and reuses its DOM node for NX-003. This is wrong — the node's state, focus, animation, and attributes belonged to NX-002. With shipmentId keys, React sees key='NX-003' moved from position 2 to 1 and correctly updates it.",
  why_this_matters:
    "Index keys produce invisible correctness bugs that only manifest when the list changes — when an item is added to the front, removed from the middle, or reordered. In a static list they appear harmless. In a dynamic list they corrupt state, break animations, and confuse screen readers. The rule is simple: always use a stable unique identifier.",
  answer_keywords: ["index", "key", "reconciliation", "removed", "stale", "position"],
  seed_code: `// This step is conceptual — demonstrate the index key pattern and explain the bug.`,
  starter_code: `// Write the .map() with index as key below, then explain what goes wrong
// when NX-002 is removed from the middle of the list.

// With index keys:
// Before removal: key=0 → NX-001, key=1 → NX-002, key=2 → NX-003
// After removing NX-002: ???

// With shipmentId keys:
// Before: key='NX-001', key='NX-002', key='NX-003'
// After removing NX-002: ???`,
  feedback_correct:
    "Exactly — with index keys, removing NX-002 shifts NX-003 to key=1, which React incorrectly maps to NX-002's DOM node. With stable ID keys, React correctly identifies NX-003 as the same element and only removes NX-002's node.",
  feedback_partial:
    "Close — make sure you explain what key=1 maps to before and after the removal. The core of the bug is React mapping the new item at a position to the old DOM node at that same position.",
  feedback_wrong:
    "With index keys: before removal, key=1 is NX-002's DOM node. After removal, NX-003 becomes index 1 — React reuses NX-002's DOM node for NX-003. With ID keys: React identifies NX-003 by its stable ID, knows it didn't change, and only removes NX-002's node.",
  expected: `// Index key problem demonstration:
// Before: key=0 → NX-001, key=1 → NX-002, key=2 → NX-003
// Remove NX-002 (index 1)
// After:  key=0 → NX-001, key=1 → NX-003
// React sees: key=1 still exists → reuses NX-002's DOM node for NX-003
// Bug: any input state, animation, or local state in NX-002's node now
//      incorrectly shows on NX-003.

// ID key solution:
// Before: key='NX-001', key='NX-002', key='NX-003'
// Remove NX-002
// After:  key='NX-001', key='NX-003'
// React sees: key='NX-002' gone → removes its DOM node
//             key='NX-003' moved from index 2 to 1 → updates its position only`,
  analog_example: `// Analogy: imagine lockers numbered 1-3.
// Locker 1: Alice, Locker 2: Bob, Locker 3: Carol
// Bob leaves. With index keys, Carol moves to locker 2 but inherits Bob's contents.
// With name keys, Carol's locker is identified by name — she takes locker 2 but keeps her own contents.`,
  deepDiveLabel: "When is index as key actually acceptable?",
  deepDive: {
    hook: "Your tech lead reviews your code and says 'index keys are fine here'. You're surprised — you just learned they're wrong. They point at the specific list: static, no additions, no removals, no reordering, items have no local state. The rule has a precise exception.",
    pain: "⚠️ **Lesson:** 'Never use index as key' is the common teaching. But experienced engineers sometimes do. What are the precise conditions under which index key is safe — and why does each condition matter?",
    mentalModel:
      "**Mental model:** Index key is safe when the list is effectively static:\n1. **Items are never reordered** — indices stay stable so keys stay stable\n2. **Items are never added to or removed from the middle** — only appending to the end is safe\n3. **Items have no local state** — no inputs, checkboxes, or stateful children that could persist to the wrong item\n4. **Items have no animations tied to identity** — enter/exit animations key on identity\n\nIf all four conditions hold, index key is safe. If any is false, use a stable unique identifier.",
    discover:
      "```tsx\n// ✅ index key acceptable — static display list, no local state\nconst statusOptions = ['active', 'delayed', 'delivered'];\nstatusOptions.map((opt, i) => <option key={i}>{opt}</option>)\n\n// ❌ index key wrong — dynamic list with local state\nshipments.map((s, i) => (\n  <div key={i}>\n    <input defaultValue={s.shipmentId} /> {/* local input state */}\n  </div>\n))\n// Removing a middle item shifts indices — the input state stays on the old DOM node\n```",
    quickRules:
      "- ✅ index key safe: static list, no reorder, no middle add/remove, no local state\n- ❌ index key wrong: any dynamic list, any list with local input state\n- ✅ stable unique ID: always correct, never wrong\n- if in doubt: use the ID. Index key requires all four conditions — most production lists fail at least one.",
    watchOut: "👀 **Watch out:** The index key bug is invisible in static lists — it only manifests when the list changes. This makes it easy to miss in development (where lists often don't change) and only discover in production (where they do). The safe habit: always use a stable ID.",
    dryRun: "🔁 **Think:** You have a list of three `<input>` fields, each pre-filled with a shipment ID, using index keys. The user types into the second input — changing 'NX-002' to 'NX-999'. You then remove the first shipment. The list re-renders with two items. What value does the first input show now — 'NX-001' (the original), 'NX-999' (the typed value from what was the second input), or 'NX-002' (the original second value)?",
    build: "**Learning focus:** Understand exactly why index keys break reconciliation for dynamic lists — and the precise conditions under which index key is safe.",
  },
},
{
  id: "step4",
  type: "question",
  phase: "Step 4 of 5",
  paal: "Add a statusFilter state variable (ShipmentStatus | 'all', initialised to 'all'). Filter the shipments array based on this filter before mapping — if 'all', show everything; otherwise show only matching status.",
  hint: "Filter before map: `const visible = statusFilter === 'all' ? shipments : shipments.filter(s => s.status === statusFilter)`. Then .map() over visible.",
  example_code: `const visible = filter === 'all'
  ? items
  : items.filter(item => item.category === filter);`,
  think_prompt:
    "The filter value is either 'all' (show all) or a specific status. How do you produce the filtered list to map over — and should the filtering happen inside the JSX or before the return?",
  mc_options: [
    "Map directly and use && inside: {shipments.map(s => statusFilter === 'all' || s.status === statusFilter ? <div key={s.shipmentId}>{s.shipmentId}</div> : null)}",
    "const visible = statusFilter === 'all' ? shipments : shipments.filter(s => s.status === statusFilter); then {visible.map(...)}",
    "Filter inside JSX with .filter().map() chained: {shipments.filter(s => s.status === statusFilter).map(s => <div key={s.shipmentId}>...</div>)}",
  ],
  mc_correct_option:
    "const visible = statusFilter === 'all' ? shipments : shipments.filter(s => s.status === statusFilter); then {visible.map(...)}",
  mc_anchor:
    "Computing the visible list before the return keeps the JSX clean and the filtering logic readable. The inline && approach returns null for filtered items — React renders nothing for them, which works but pollutes the map result with nulls and is harder to read. The chained .filter().map() also works but doesn't handle the 'all' case as clearly.",
  why_this_matters:
    "Pre-compute → map is the pattern used in every list view in enterprise apps — search results, filtered data tables, category views. The separation between data preparation (filter) and presentation (map) is a core readability and maintainability principle.",
  answer_keywords: ["statusFilter", "visible", "filter", "map"],
  seed_code: `import { useState } from 'react';
type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentRecord {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
}

const ShipmentList = (): JSX.Element => {
  const [shipments] = useState<ShipmentRecord[]>([
    { shipmentId: 'NX-001', destination: 'Hamburg', status: 'active' },
    { shipmentId: 'NX-002', destination: 'Rotterdam', status: 'delayed' },
    { shipmentId: 'NX-003', destination: 'Antwerp', status: 'delivered' },
  ]);
  return (
    <div>
      {shipments.map(s => (
        <div key={s.shipmentId}>
          <p>{s.shipmentId}</p>
          <p>{s.destination}</p>
          <p>{s.status}</p>
        </div>
      ))}
    </div>
  );
};`,
  starter_code: `import { useState } from 'react';
type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentRecord {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
}

const ShipmentList = (): JSX.Element => {
  const [shipments] = useState<ShipmentRecord[]>([
    { shipmentId: 'NX-001', destination: 'Hamburg', status: 'active' },
    { shipmentId: 'NX-002', destination: 'Rotterdam', status: 'delayed' },
    { shipmentId: 'NX-003', destination: 'Antwerp', status: 'delivered' },
  ]);

  // add statusFilter state here — 'all' | ShipmentStatus, initialised to 'all'
  // compute visible list before the return

  return (
    <div>
      {shipments.map(s => (
        <div key={s.shipmentId}>
          <p>{s.shipmentId}</p>
          <p>{s.destination}</p>
          <p>{s.status}</p>
        </div>
      ))}
    </div>
  );
};`,
  feedback_correct:
    "Exactly — the visible list is computed before the return, keeping the JSX clean. The map operates on the filtered subset — only matching items render.",
  feedback_partial:
    "Close — make sure the filter logic is computed before the return as `const visible = ...`, and that you're mapping over `visible` rather than the original `shipments`.",
  feedback_wrong:
    "Add `const [statusFilter, setStatusFilter] = useState<'all' | ShipmentStatus>('all')` and `const visible = statusFilter === 'all' ? shipments : shipments.filter(s => s.status === statusFilter)`. Then map over `visible` in the JSX.",
  expected: `import { useState } from 'react';
type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentRecord {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
}

const ShipmentList = (): JSX.Element => {
  const [shipments] = useState<ShipmentRecord[]>([
    { shipmentId: 'NX-001', destination: 'Hamburg', status: 'active' },
    { shipmentId: 'NX-002', destination: 'Rotterdam', status: 'delayed' },
    { shipmentId: 'NX-003', destination: 'Antwerp', status: 'delivered' },
  ]);

  const [statusFilter, setStatusFilter] = useState<'all' | ShipmentStatus>('all');
  const visible = statusFilter === 'all'
    ? shipments
    : shipments.filter(s => s.status === statusFilter);

  return (
    <div>
      {visible.map(s => (
        <div key={s.shipmentId}>
          <p>{s.shipmentId}</p>
          <p>{s.destination}</p>
          <p>{s.status}</p>
        </div>
      ))}
    </div>
  );
};`,
  analog_example: `const visible = categoryFilter === 'all'
  ? products
  : products.filter(p => p.category === categoryFilter);`,
  deepDiveLabel: "Filtering before map is clear — but what about sorting before map?",
  deepDive: {
    hook: "Your filter works. The product team asks for the list to be sortable by destination alphabetically. You add a sortOrder state. Now you need to filter AND sort before mapping. You chain them: `shipments.filter(...).sort(...)`. It works. Then a colleague warns you: `.sort()` mutates the array.",
    pain: "⚠️ **Lesson:** `shipments.filter(...).sort(...)` — filter is pure (returns new array), but sort mutates. Does chaining sort after filter cause the mutation bug?",
    mentalModel:
      "**Mental model:** filter returns a new array — sort then mutates that new array, not the original.\n- `shipments.filter(...)` → new array (shipments is untouched)\n- `.sort(...)` → mutates the new array from filter (not shipments)\n- Result: shipments state is still immutable. The sorted array is ephemeral — computed on each render.\n- This chain is safe because filter creates the new array that sort is allowed to mutate.\n- Be careful with `shipments.sort(...)` directly — that mutates state.",
    discover:
      "```tsx\n// ✅ filter then sort — safe, filter creates new array\nconst visible = shipments\n  .filter(s => s.status === statusFilter)\n  .sort((a, b) => a.destination.localeCompare(b.destination));\n\n// ❌ sort state directly — mutates state array\nshipments.sort((a, b) => a.destination.localeCompare(b.destination));\nsetShipments(shipments); // same reference, no re-render\n\n// ✅ sort state safely\nsetShipments(prev => [...prev].sort((a, b) => a.destination.localeCompare(b.destination)));\n```",
    quickRules:
      "- ✅ filter + sort chain: safe — filter creates new array, sort mutates that copy\n- ✅ `[...arr].sort()` — spread to copy, then sort\n- ❌ `arr.sort()` on state directly — mutates state, breaks re-renders\n- sort is the common gotcha — it returns the array it sorted (same reference if called on state)",
    watchOut: "👀 **Watch out:** `.sort()` is unstable in some JavaScript engines for large arrays — items that compare as equal may appear in different orders across renders. For production sort stability, use a comparison that provides a total order (e.g., sort by ID as a tiebreaker).",
    dryRun: "🔁 **Think:** `const visible = shipments.filter(s => s.status === 'active').sort((a,b) => a.destination.localeCompare(b.destination))`. After this line, what is `shipments[0]` — has it changed? What is `visible[0]`?",
    build: "**Learning focus:** Filter and sort before mapping — understanding that filter returns a new array (safe to chain sort), while sorting state directly mutates the original (always wrong).",
  },
},
{
  id: "step5",
  type: "question",
  phase: "Step 5 of 5",
  paal: "Handle the empty state — when visible is empty (all shipments filtered out), render a message saying 'No shipments match the filter' instead of the list.",
  hint: "Check visible.length before the map. Use conditional rendering — either the empty message or the mapped list.",
  example_code: `{visible.length === 0
  ? <p>No results found</p>
  : visible.map(item => <div key={item.id}>{item.name}</div>)
}`,
  think_prompt:
    "When visible is empty, .map() returns an empty array and React renders nothing — no items and no message. How do you detect the empty case and show a meaningful message instead?",
  mc_options: [
    "{!visible && <p>No shipments match the filter</p>}",
    "{visible.length === 0 ? <p>No shipments match the filter</p> : visible.map(s => <div key={s.shipmentId}>...</div>)}",
    "{visible.map(s => <div key={s.shipmentId}>...</div>) || <p>No shipments</p>}",
  ],
  mc_correct_option:
    "{visible.length === 0 ? <p>No shipments match the filter</p> : visible.map(s => <div key={s.shipmentId}>...</div>)}",
  mc_anchor:
    "Checking `visible.length === 0` before the map is the standard empty-state pattern. The `!visible` approach won't work — visible is always an array (never falsy). The `|| <p>` approach relies on an empty array being truthy — `[]` is truthy in JavaScript, so the fallback never renders.",
  why_this_matters:
    "Empty states are a first-class UX feature in enterprise apps — 'No shipments match your filter', 'No notifications', 'No results found'. Rendering nothing (empty array) is confusing — the user doesn't know if the filter worked or if there's a bug. An explicit empty message completes the experience.",
  answer_keywords: ["visible.length", "===", "0", "No shipments", "map"],
  seed_code: `import { useState } from 'react';
type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentRecord {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
}

const ShipmentList = (): JSX.Element => {
  const [shipments] = useState<ShipmentRecord[]>([
    { shipmentId: 'NX-001', destination: 'Hamburg', status: 'active' },
    { shipmentId: 'NX-002', destination: 'Rotterdam', status: 'delayed' },
    { shipmentId: 'NX-003', destination: 'Antwerp', status: 'delivered' },
  ]);

  const [statusFilter, setStatusFilter] = useState<'all' | ShipmentStatus>('all');
  const visible = statusFilter === 'all'
    ? shipments
    : shipments.filter(s => s.status === statusFilter);

  return (
    <div>
      {visible.map(s => (
        <div key={s.shipmentId}>
          <p>{s.shipmentId}</p>
          <p>{s.destination}</p>
          <p>{s.status}</p>
        </div>
      ))}
    </div>
  );
};`,
  starter_code: `import { useState } from 'react';
type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentRecord {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
}

const ShipmentList = (): JSX.Element => {
  const [shipments] = useState<ShipmentRecord[]>([
    { shipmentId: 'NX-001', destination: 'Hamburg', status: 'active' },
    { shipmentId: 'NX-002', destination: 'Rotterdam', status: 'delayed' },
    { shipmentId: 'NX-003', destination: 'Antwerp', status: 'delivered' },
  ]);

  const [statusFilter, setStatusFilter] = useState<'all' | ShipmentStatus>('all');
  const visible = statusFilter === 'all'
    ? shipments
    : shipments.filter(s => s.status === statusFilter);

  return (
    <div>
      {/* render empty message when visible is empty, otherwise map */}
    </div>
  );
};`,
  feedback_correct:
    "Exactly — `visible.length === 0` detects the empty case and renders a message. When items exist, the map runs. The user always sees something meaningful.",
  feedback_partial:
    "Close — check your empty detection. `!visible` won't work (arrays are always truthy). `visible.length === 0` is the correct check.",
  feedback_wrong:
    "Use: `{visible.length === 0 ? <p>No shipments match the filter</p> : visible.map(s => (<div key={s.shipmentId}>...</div>))}` — the length check determines whether to show the message or the list.",
  expected: `import { useState } from 'react';
type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentRecord {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
}

const ShipmentList = (): JSX.Element => {
  const [shipments] = useState<ShipmentRecord[]>([
    { shipmentId: 'NX-001', destination: 'Hamburg', status: 'active' },
    { shipmentId: 'NX-002', destination: 'Rotterdam', status: 'delayed' },
    { shipmentId: 'NX-003', destination: 'Antwerp', status: 'delivered' },
  ]);

  const [statusFilter, setStatusFilter] = useState<'all' | ShipmentStatus>('all');
  const visible = statusFilter === 'all'
    ? shipments
    : shipments.filter(s => s.status === statusFilter);

  return (
    <div>
      {visible.length === 0
        ? <p className="empty-state">No shipments match the filter</p>
        : visible.map(s => (
          <div key={s.shipmentId}>
            <p>{s.shipmentId}</p>
            <p>{s.destination}</p>
            <p>{s.status}</p>
          </div>
        ))
      }
    </div>
  );
};`,
  analog_example: `{results.length === 0
  ? <p>No results found for "{query}"</p>
  : results.map(r => <div key={r.id}>{r.title}</div>)
}`,
  deepDiveLabel: "Empty state is UI — but should the empty check be inside the component or outside?",
  deepDive: {
    hook: "Your ShipmentList handles its own empty state. A colleague builds a DataTable component that also handles its own empty state. So does the NotificationList. And the RouteList. Each has its own 'nothing here' message and its own logic. Then the design team says 'all empty states should look the same'. Now you're updating four components instead of one.",
    pain: "⚠️ **Lesson:** Each component handling its own empty state is self-contained but leads to duplication. What's the alternative architecture — and when is centralising the empty state worth the abstraction?",
    mentalModel:
      "**Mental model:** Empty state is a concern that can live at different layers.\n- **Inside the list component**: self-contained, good for quick-shipping. Duplicate styles across components.\n- **Shared EmptyState component**: `<EmptyState message='No shipments' />` — consistent design, single source of truth.\n- **Parent-controlled**: parent checks `data.length === 0` before rendering the list at all — the list component has no empty state logic, the parent decides whether to render the list or an empty state component.\n- The right level depends on whether the empty state is the same every time (shared component) or varies by context (inline handling).",
    discover:
      "```tsx\n// ✅ inline handling — good for self-contained components\n{visible.length === 0\n  ? <p>No shipments match the filter</p>\n  : visible.map(...)}\n\n// ✅ shared component — consistent design system\n{visible.length === 0\n  ? <EmptyState message='No shipments' icon={<ShipmentIcon />} />\n  : visible.map(...)}\n\n// ✅ parent-controlled — list component stays pure\n{shipments.length === 0\n  ? <EmptyState message='No shipments' />\n  : <ShipmentList shipments={shipments} />}\n```",
    quickRules:
      "- ✅ inline for context-specific messages\n- ✅ shared EmptyState component for design system consistency\n- ✅ parent-controlled when the list component should stay pure\n- ❌ duplicating empty state styles in every list component",
    watchOut: "👀 **Watch out:** Empty state and loading state look identical to the user if both render nothing. Always render something — a message, a skeleton, a spinner — for any state where the list might appear blank. Blank space is the worst user experience.",
    dryRun: "🔁 **Think:** statusFilter is set to 'urgent' — a value that no shipment in the list has. What is visible after the filter? What does `visible.length === 0` evaluate to? What does the user see?",
    build: "**Learning focus:** Handle the empty list case explicitly with a length check and a user-facing message — understanding that an empty array renders nothing and that empty states are a first-class UX concern.",
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
  lessonNum: 13,
  title: "Controlled Inputs",
  shortName: "PATTERNS — CONTROLLED INPUT",
});
