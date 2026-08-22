import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
{
  id: "intro",
  type: "reveal",
  phase: "Lesson",
  content: {
    tag: "LESSON #31 (React Hooks)",
    title: "useMemo + useCallback",
    body: "React re-renders components whenever state or props change. Most re-renders are fast and harmless. But sometimes a component does expensive work — sorting 10,000 rows, computing a complex filter — on every render, even when the input data hasn't changed. useMemo caches the result of a computation and only recomputes when its dependencies change. useCallback caches a function reference for the same reason. Both are performance tools — not correctness tools — and should be applied only when there's a measured need.",
    usecase:
      "A shipment list page filters and sorts potentially thousands of shipments on every render. The filter and sort are expensive. Without memoization, every state change — including unrelated ones like a tooltip opening — triggers a full recomputation. useMemo makes the computation run only when the data or filter criteria actually change.",
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
      reason: "useMemo and useCallback return values used in JSX rendering and as event handlers. You need to understand how JSX renders derived values before caching them with useMemo.",
    },
    {
      lesson: 5,
      label: "Props — Typing What a Component Receives",
      reason: "useCallback is most useful when passing stable function references to child components. You need to understand how function props work before stabilising them with useCallback.",
    },
    {
      lesson: 8,
      label: "useState — Primitives",
      reason: "useMemo and useCallback deps are typically state values. You need to understand how state changes trigger re-renders before understanding why memoization prevents unnecessary recomputation.",
    },
    {
      lesson: 12,
      label: "List Rendering + key",
      reason: "The expensive computation this lesson memoizes is filtering and sorting a list. You need to know how lists are rendered with .map() before memoizing the data preparation that feeds that map.",
    },
    {
      lesson: 22,
      label: "useEffect — Basics",
      reason: "useMemo and useCallback use the same dependency array mechanism as useEffect. You need to understand how deps arrays work — and what stale closures look like — before applying the same principles to useMemo and useCallback.",
    },
  ],
},
{
  id: "objectives",
  type: "objectives",
  phase: "Objectives",
  items: [
    "Memoize an expensive derived computation using useMemo with a dependency array",
    "Stabilise a function reference using useCallback to prevent child re-renders",
    "Understand when useMemo and useCallback provide genuine benefit vs add overhead",
    "Combine React.memo with useCallback to create memoized child components",
    "Know the three questions to ask before adding useMemo or useCallback",
  ],
},
{
  id: "step1",
  type: "question",
  phase: "Step 1 of 5",
  paal: "Add useMemo to memoize the filtered and sorted list of shipments. The computation should only re-run when shipments, statusFilter, or sortOrder changes.",
  hint: "useMemo takes a factory function and a dependency array. The factory function computes and returns the value. React caches it and only re-runs when a dependency changes.",
  example_code: `const sortedAndFiltered = useMemo(() => {
  return items
    .filter(item => filter === 'all' || item.status === filter)
    .sort((a, b) => a.name.localeCompare(b.name));
}, [items, filter]);`,
  think_prompt:
    "Without useMemo, the filter+sort runs on every render — including when unrelated state changes (like a tooltip opening). What are the dependencies for this specific computation?",
  mc_options: [
    "useMemo(() => computeList(), []); // empty array — compute once",
    "useMemo(() => shipments.filter(...).sort(...), [shipments, statusFilter, sortOrder]);",
    "useMemo(() => shipments.filter(...).sort(...)); // no array — recompute every render",
  ],
  mc_correct_option:
    "useMemo(() => shipments.filter(...).sort(...), [shipments, statusFilter, sortOrder]);",
  mc_anchor:
    "The dependency array must include every value that the computation reads — shipments (the data), statusFilter (affects which items pass the filter), and sortOrder (affects the sort direction). Empty array would compute once and never update when the filter or data changes. No array makes useMemo pointless — it recomputes every render anyway.",
  why_this_matters:
    "useMemo's dependency array works identically to useEffect's — include everything the computation uses. Missing a dependency causes stale cached results. Including too many causes unnecessary recomputation. The exhaustive-deps ESLint rule covers useMemo too.",
  answer_keywords: [
    "useMemo", "shipments", "statusFilter", "sortOrder",
    "filter", "sort", "dependency array",
  ],
  seed_code: `import { useState, useMemo } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';
type StatusFilter = ShipmentStatus | 'all';
type SortOrder = 'asc' | 'desc';

interface ShipmentRecord {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
}

const SHIPMENTS: ShipmentRecord[] = [
  { shipmentId: 'NX-001', destination: 'Hamburg', status: 'active' },
  { shipmentId: 'NX-002', destination: 'Rotterdam', status: 'delayed' },
  { shipmentId: 'NX-003', destination: 'Antwerp', status: 'delivered' },
  { shipmentId: 'NX-004', destination: 'Bremen', status: 'active' },
  { shipmentId: 'NX-005', destination: 'Amsterdam', status: 'delayed' },
];`,
  starter_code: `import { useState, useMemo } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';
type StatusFilter = ShipmentStatus | 'all';
type SortOrder = 'asc' | 'desc';

interface ShipmentRecord {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
}

const SHIPMENTS: ShipmentRecord[] = [
  { shipmentId: 'NX-001', destination: 'Hamburg', status: 'active' },
  { shipmentId: 'NX-002', destination: 'Rotterdam', status: 'delayed' },
  { shipmentId: 'NX-003', destination: 'Antwerp', status: 'delivered' },
  { shipmentId: 'NX-004', destination: 'Bremen', status: 'active' },
  { shipmentId: 'NX-005', destination: 'Amsterdam', status: 'delayed' },
];

const ShipmentList = (): JSX.Element => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [tooltipOpen, setTooltipOpen] = useState(false);

  // memoize the filtered and sorted list here
  // deps: [statusFilter, sortOrder] — SHIPMENTS is a constant, does it need to be a dep?

  const visibleShipments = SHIPMENTS
    .filter(s => statusFilter === 'all' || s.status === statusFilter)
    .sort((a, b) => sortOrder === 'asc'
      ? a.destination.localeCompare(b.destination)
      : b.destination.localeCompare(a.destination)
    );

  return (
    <div>
      <button onClick={() => setTooltipOpen(t => !t)}>Toggle tooltip</button>
      {visibleShipments.map(s => <div key={s.shipmentId}>{s.destination}</div>)}
    </div>
  );
};`,
  feedback_correct:
    "Exactly — useMemo caches the result. Toggling the tooltip (unrelated state) no longer triggers the filter+sort computation. It only runs when statusFilter or sortOrder changes.",
  feedback_partial:
    "Close — make sure the dependency array is `[statusFilter, sortOrder]`. SHIPMENTS is a module-level constant — it never changes, so it doesn't need to be in the deps (though including it is harmless).",
  feedback_wrong:
    "Wrap the filter+sort in useMemo: `const visibleShipments = useMemo(() => SHIPMENTS.filter(...).sort(...), [statusFilter, sortOrder]);`",
  expected: `const ShipmentList = (): JSX.Element => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const visibleShipments = useMemo(() =>
    SHIPMENTS
      .filter(s => statusFilter === 'all' || s.status === statusFilter)
      .sort((a, b) => sortOrder === 'asc'
        ? a.destination.localeCompare(b.destination)
        : b.destination.localeCompare(a.destination)
      ),
    [statusFilter, sortOrder]
  );

  return (
    <div>
      <button onClick={() => setTooltipOpen(t => !t)}>Toggle tooltip</button>
      {visibleShipments.map(s => <div key={s.shipmentId}>{s.destination}</div>)}
    </div>
  );
};`,
  analog_example: `const chartData = useMemo(() =>
  rawData.map(point => ({ x: point.ts, y: point.value * scale })),
  [rawData, scale]
);`,
  deepDiveLabel:
    "useMemo caches the computation — but is a 5-item array filter actually worth memoizing?",
  deepDive: {
    hook: "Your SHIPMENTS array has 5 items. Filtering 5 items takes ~0.01ms. useMemo's own overhead (dependency comparison, cache storage) is also ~0.01ms. You've added complexity for zero performance gain.",
    pain: "⚠️ **Lesson:** useMemo always has overhead. For small computations, the overhead exceeds the benefit. How do you decide when useMemo is actually worth adding?",
    mentalModel:
      "**Three questions before adding useMemo**:\n\n1. **Is this computation actually slow?** Filter/sort over 5 items: no. Filter/sort over 50,000 items with regex matching: yes. Measure with `console.time()` or React DevTools Profiler.\n\n2. **Does this computation run during renders that don't need it?** If the component only re-renders when relevant state changes, useMemo adds overhead with no benefit. If it re-renders frequently for unrelated reasons (parent re-renders, context updates), useMemo saves work.\n\n3. **Is the result used in a dependency array or passed to React.memo?** useMemo is most valuable when its stable reference prevents child re-renders or effect re-runs.\n\nIf the answer to all three is 'yes' — add useMemo. Otherwise — skip it.",
    discover:
      "```tsx\n// ❌ premature useMemo — 5 items, O(n) filter\nconst visible = useMemo(() => items.filter(...), [items, filter]);\n// overhead > benefit for small arrays\n\n// ✅ justified useMemo — 50,000 items, complex regex\nconst visible = useMemo(() =>\n  items.filter(item => complexRegex.test(item.name) && matchesDateRange(item.date)),\n  [items, filter, dateRange]\n);\n\n// ✅ justified for stable reference to pass to React.memo child\nconst stableConfig = useMemo(() => ({ pageSize, sortBy }), [pageSize, sortBy]);\n<MemoizedTable config={stableConfig} />\n```",
    quickRules:
      "- ✅ useMemo: expensive computation (O(n log n)+ over large data)\n- ✅ useMemo: stable reference needed for React.memo or effect deps\n- ❌ useMemo: cheap derivations (length, boolean, small array transform)\n- ❌ useMemo by default — profile first, add second\n- useMemo doesn't prevent re-renders of the component itself — only the computation",
    watchOut:
      "👀 **Watch out:** useMemo does NOT prevent the component from re-rendering. It only prevents the computation from re-running. If the component re-renders (because its parent re-rendered), useMemo still runs its dependency comparison. Only React.memo prevents the re-render itself.",
    dryRun:
      "🔁 **Think:** statusFilter changes from 'all' to 'active'. useMemo's dep array `[statusFilter, sortOrder]` — has a dep changed? Yes. Does useMemo recompute? The tooltip toggles (unrelated state). useMemo's deps — have they changed? No. Does useMemo recompute? What does the component return — cached or recomputed list?",
    build:
      "**Learning focus:** Apply useMemo to cache an expensive derived list — and ask the three questions to decide whether useMemo is actually justified before adding it.",
  },
},
{
  id: "step2",
  type: "question",
  phase: "Step 2 of 5",
  paal: "Wrap a ShipmentCard child component in React.memo, then use useCallback to stabilise the onSelect handler passed to it so React.memo actually prevents re-renders.",
  hint: "React.memo wraps the component. Without useCallback, the parent passes a new function reference on every render — React.memo sees a new prop and re-renders anyway. useCallback with the right deps stabilises the reference.",
  example_code: `const MemoizedCard = React.memo(ShipmentCard);

// Parent:
const handleSelect = useCallback((id: string) => {
  setSelectedId(id);
}, [setSelectedId]); // setSelectedId is stable from useState

<MemoizedCard onSelect={handleSelect} />`,
  think_prompt:
    "React.memo prevents re-renders when props haven't changed. But `onSelect={() => setSelectedId(id)}` creates a new function reference on every parent render — React.memo sees a new prop and re-renders anyway. What stabilises the function reference?",
  mc_options: [
    "React.memo alone — it deep-compares function props",
    "useCallback on the handler — returns the same reference if deps haven't changed",
    "Defining the handler outside the component — module-level function",
  ],
  mc_correct_option:
    "useCallback on the handler — returns the same reference if deps haven't changed",
  mc_anchor:
    "React.memo uses shallow comparison (===) on props — it doesn't deep-compare functions. A new function reference === a changed prop → React.memo re-renders. useCallback returns the same function reference if its dependencies haven't changed — React.memo sees the same reference → skips re-render. Module-level functions can't close over component state or props.",
  why_this_matters:
    "React.memo + useCallback is the canonical performance pattern for preventing child re-renders. Understanding that React.memo is useless without stable function props — and that useCallback provides that stability — is what makes the pattern actually work. Many developers add React.memo without useCallback and wonder why it doesn't help.",
  answer_keywords: [
    "React.memo", "useCallback", "handleSelect",
    "onSelect", "setSelectedId", "stable reference",
  ],
  seed_code: `import { useState, useCallback, memo } from 'react';

interface ShipmentCardProps {
  shipmentId: string;
  onSelect: (id: string) => void;
}

const ShipmentCard = ({ shipmentId, onSelect }: ShipmentCardProps): JSX.Element => {
  console.log('ShipmentCard rendered:', shipmentId);
  return (
    <div onClick={() => onSelect(shipmentId)}>
      {shipmentId}
    </div>
  );
};

const SHIPMENT_IDS = ['NX-001', 'NX-002', 'NX-003'];`,
  starter_code: `import { useState, useCallback, memo } from 'react';

interface ShipmentCardProps {
  shipmentId: string;
  onSelect: (id: string) => void;
}

const ShipmentCard = ({ shipmentId, onSelect }: ShipmentCardProps): JSX.Element => {
  console.log('ShipmentCard rendered:', shipmentId);
  return <div onClick={() => onSelect(shipmentId)}>{shipmentId}</div>;
};

// wrap ShipmentCard in React.memo here (or use memo() directly)
// const MemoizedCard = ...

const SHIPMENT_IDS = ['NX-001', 'NX-002', 'NX-003'];

const ShipmentList = (): JSX.Element => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [unrelated, setUnrelated] = useState(0);

  // stabilise onSelect with useCallback

  return (
    <div>
      <button onClick={() => setUnrelated(n => n + 1)}>Unrelated update</button>
      {SHIPMENT_IDS.map(id => (
        <ShipmentCard key={id} shipmentId={id} onSelect={/* handler */} />
      ))}
    </div>
  );
};`,
  feedback_correct:
    "Exactly — React.memo wraps the card, useCallback stabilises the handler. Clicking 'Unrelated update' no longer triggers ShipmentCard renders — the console.log proves it.",
  feedback_partial:
    "Close — make sure you're using the memoized component (MemoizedCard or the memo-wrapped version) in the map, not the original ShipmentCard. And check that useCallback's deps array is correct.",
  feedback_wrong:
    "Wrap: `const MemoizedCard = memo(ShipmentCard)` or `const MemoizedCard = React.memo(ShipmentCard)`. Stabilise: `const handleSelect = useCallback((id: string) => setSelectedId(id), []);`. Use MemoizedCard in the map.",
  expected: `import { useState, useCallback, memo } from 'react';

interface ShipmentCardProps {
  shipmentId: string;
  onSelect: (id: string) => void;
}

const ShipmentCard = ({ shipmentId, onSelect }: ShipmentCardProps): JSX.Element => {
  console.log('ShipmentCard rendered:', shipmentId);
  return <div onClick={() => onSelect(shipmentId)}>{shipmentId}</div>;
};

const MemoizedCard = memo(ShipmentCard);

const SHIPMENT_IDS = ['NX-001', 'NX-002', 'NX-003'];

const ShipmentList = (): JSX.Element => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [unrelated, setUnrelated] = useState(0);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []); // setSelectedId is stable from useState — empty deps is correct

  return (
    <div>
      <button onClick={() => setUnrelated(n => n + 1)}>Unrelated update</button>
      <p>Selected: {selectedId ?? 'none'}</p>
      {SHIPMENT_IDS.map(id => (
        <MemoizedCard key={id} shipmentId={id} onSelect={handleSelect} />
      ))}
    </div>
  );
};`,
  analog_example: `const handleRowClick = useCallback((rowId: string) => {
  onRowSelect(rowId);
}, [onRowSelect]);

<MemoizedRow onSelect={handleRowClick} />`,
  deepDiveLabel:
    "React.memo + useCallback — but what comparison function does React.memo use by default?",
  deepDive: {
    hook: "React.memo uses shallow prop comparison. A ShipmentCard receives `{ shipmentId: 'NX-001', config: { highlight: true, compact: false } }`. The parent re-renders. config is a new object reference (same values). Does React.memo re-render ShipmentCard?",
    pain: "⚠️ **Lesson:** React.memo's default shallow comparison means a new object reference — even with identical values — triggers a re-render. How do you handle object props with React.memo?",
    mentalModel:
      "**Default comparison** (shallow equality):\n- Primitive props (strings, numbers, booleans): compared by value — same value means no re-render\n- Function props: compared by reference — new function means re-render\n- Object props: compared by reference — new object means re-render\n\n**Solutions for object props**:\n1. **useMemo the object in the parent**: `const config = useMemo(() => ({ highlight, compact }), [highlight, compact])`\n2. **Pass primitives instead**: `<Card highlight={true} compact={false} />` (avoid object prop)\n3. **Custom comparison function**: `React.memo(ShipmentCard, (prevProps, nextProps) => /* deep equality check */)`\n\nOption 1 is the standard. Option 2 is often cleaner. Option 3 is an escape hatch.",
    discover:
      "```tsx\n// ❌ new object reference every render — React.memo doesn't help\n<MemoizedCard config={{ highlight: true }} />\n\n// ✅ stable reference — React.memo works\nconst config = useMemo(() => ({ highlight }), [highlight]);\n<MemoizedCard config={config} />\n\n// ✅ primitives instead of object — simplest\n<MemoizedCard highlight={true} compact={false} />\n\n// ✅ custom comparator — for deep equality\nconst MemoizedCard = React.memo(ShipmentCard, (prev, next) =>\n  prev.config.highlight === next.config.highlight &&\n  prev.config.compact === next.config.compact\n);\n```",
    quickRules:
      "- ✅ React.memo default: shallow comparison — works for primitives\n- ✅ useMemo object in parent: stabilise object props\n- ✅ prefer primitive props: simpler, no useMemo needed\n- ✅ custom comparator: deep equality for complex props (rare)\n- ❌ custom comparator by default — premature, maintenance overhead",
    watchOut:
      "👀 **Watch out:** Custom comparison functions in React.memo are opposite to what you might expect — return `true` to SKIP re-render (props are equal), return `false` to ALLOW re-render (props differ). This is the reverse of `shouldUpdate` — it's `areEqual`.",
    dryRun:
      "🔁 **Think:** MemoizedCard receives `onSelect={handleSelect}`. handleSelect is from useCallback with empty deps. Parent re-renders for an unrelated reason. handleSelect reference: same or new? React.memo compares onSelect props: same === same? Does ShipmentCard re-render?",
    build:
      "**Learning focus:** Combine React.memo with useCallback — understanding that React.memo's shallow comparison means function and object props need explicit stabilisation to make memoization effective.",
  },
},
{
  id: "step3",
  type: "question",
  phase: "Step 3 of 5",
  paal: "Demonstrate a stale closure bug with useCallback — create a counter state and a useCallback handler that reads the counter value. Show the bug and fix it with the correct dependency array.",
  hint: "A handler created with `useCallback(() => { console.log(count); }, [])` always prints the initial count value — it captured it at creation time. Fix: include `count` in the deps array.",
  example_code: `// BUG — stale closure
const logCount = useCallback(() => {
  console.log('Count:', count); // always logs 0 — captured at creation
}, []); // count missing from deps

// FIX — include count in deps
const logCount = useCallback(() => {
  console.log('Count:', count);
}, [count]); // new function when count changes`,
  think_prompt:
    "useCallback with empty deps creates the function once. That function closes over the values from the first render. count grows to 5, but the closure still has count = 0. How is this the same stale closure problem from Lesson 22's useEffect?",
  mc_options: [
    "useCallback with [] is always correct — function references should never change",
    "useCallback's deps array works like useEffect's — the function is recreated when deps change; missing deps cause stale closures",
    "useCallback always has a stale closure — use a ref instead",
  ],
  mc_correct_option:
    "useCallback's deps array works like useEffect's — the function is recreated when deps change; missing deps cause stale closures",
  mc_anchor:
    "useCallback's dep array is identical in semantics to useEffect's. Include everything the function reads from the component's scope. Missing count means the function closes over count=0 forever. The fix — `[count]` — recreates the function when count changes, ensuring it always closes over the current value.",
  why_this_matters:
    "The stale closure problem applies equally to useCallback, useEffect, useMemo, and any function defined inside a component. Understanding it once applies everywhere. The exhaustive-deps ESLint rule covers useCallback too — it will flag missing deps.",
  answer_keywords: [
    "useCallback", "count", "stale", "deps", "[]",
    "missing dependency", "[count]",
  ],
  seed_code: `import { useState, useCallback } from 'react';`,
  starter_code: `import { useState, useCallback } from 'react';

const CounterWithBug = (): JSX.Element => {
  const [count, setCount] = useState(0);

  // BUG: this handler always logs 0 even when count is 5
  const logCountBug = useCallback(() => {
    console.log('Count (buggy):', count);
  }, []); // ❌ count missing from deps

  // FIX: add the correct dependency
  const logCountFixed = useCallback(() => {
    console.log('Count (fixed):', count);
  }, [/* what goes here? */]);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
      <button onClick={logCountBug}>Log (buggy)</button>
      <button onClick={logCountFixed}>Log (fixed)</button>
    </div>
  );
};`,
  feedback_correct:
    "Exactly — `[count]` in the deps array means logCountFixed is recreated whenever count changes. The closure always captures the current count value. The buggy version with [] forever captures count=0.",
  feedback_partial:
    "Close — the fixed version needs `count` in the dependency array. Every value the callback reads from the component scope must be in the deps.",
  feedback_wrong:
    "Add `count` to the deps array of the fixed version: `useCallback(() => { console.log('Count (fixed):', count); }, [count])`. When count changes, useCallback creates a new function that closes over the new count value.",
  expected: `import { useState, useCallback } from 'react';

const CounterWithBug = (): JSX.Element => {
  const [count, setCount] = useState(0);

  // BUG: count captured at 0, never updates
  const logCountBug = useCallback(() => {
    console.log('Count (buggy):', count); // always 0
  }, []);

  // FIX: count in deps — new function when count changes
  const logCountFixed = useCallback(() => {
    console.log('Count (fixed):', count); // always current
  }, [count]);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
      <button onClick={logCountBug}>Log (buggy)</button>
      <button onClick={logCountFixed}>Log (fixed)</button>
    </div>
  );
};`,
  analog_example: `// Stale closure in a search handler
const handleSearch = useCallback(() => {
  fetchResults(query); // always uses initial query if [] deps
}, [query]); // fix: include query`,
  deepDiveLabel:
    "Adding count to useCallback deps means a new function on every count change — doesn't that defeat the purpose?",
  deepDive: {
    hook: "logCountFixed is recreated every time count changes. If count increments rapidly (10 times per second), logCountFixed is recreated 10 times per second. A child memoized with React.memo that receives logCountFixed as a prop re-renders 10 times per second — defeating the memoization.",
    pain: "⚠️ **Lesson:** When a useCallback dep changes frequently, the function reference becomes unstable — defeating React.memo. How do you get a stable function reference that still reads current state?",
    mentalModel:
      "The **ref + callback** pattern:\n```tsx\nconst countRef = useRef(count);\ncountRef.current = count; // always current, updated every render\n\nconst logCount = useCallback(() => {\n  console.log('Count:', countRef.current); // reads from ref, always current\n}, []); // stable — never recreated\n```\n\nThe ref is always current (updated on every render). The callback reads from the ref instead of closing over the state value. The callback never needs to be recreated — its reference is stable forever.\n\nThis is also the pattern for event handlers in useEffect that need to read current state without re-running the effect.",
    discover:
      "```tsx\n// ✅ stable callback that reads current state\nconst countRef = useRef(count);\ncountRef.current = count; // keep ref in sync\n\nconst stableHandler = useCallback(() => {\n  doSomething(countRef.current); // always current value\n}, []); // stable reference\n\n// ✅ React 18's useEffectEvent (experimental) solves this elegantly:\nconst onEvent = useEffectEvent(() => doSomething(count));\n```",
    quickRules:
      "- ✅ stable callback + ref: when deps change often but you need a stable function\n- ✅ include deps honestly: for functions passed to non-React.memo children\n- ✅ useEffectEvent (experimental React 18): the future solution\n- ❌ empty deps with stale closures: subtle bugs",
    watchOut:
      "👀 **Watch out:** `countRef.current = count` in the component body runs on every render, keeping the ref current. But accessing `countRef.current` inside the callback reads the value at call time — not at creation time. This is the key insight: refs are containers, not snapshots.",
    dryRun:
      "🔁 **Think:** countRef.current starts at 0. stableHandler is created with empty deps (stable). count increments to 5. countRef.current is updated to 5 (every render). User clicks the button calling stableHandler. What does `countRef.current` contain inside stableHandler? Is the function reference the same as when it was first created?",
    build:
      "**Learning focus:** Understand and fix useCallback stale closures — and know the ref pattern for stable callbacks that always read current values without recreating on dep changes.",
  },
},
{
  id: "step4",
  type: "question",
  phase: "Step 4 of 5",
  paal: "Use useMemo to compute an expensive aggregate — the count of active, delayed, and delivered shipments — and render it as a status summary. Show how this avoids recomputing on every unrelated render.",
  hint: "useMemo(() => shipments.reduce(...), [shipments]) — the reduce computes all three counts in one pass. The result is an object with three properties.",
  example_code: `const statusCounts = useMemo(() =>
  shipments.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {} as Record<ShipmentStatus, number>),
  [shipments]
);`,
  think_prompt:
    "The status counts only change when the shipments array changes. Any other state change — a filter value, a sort order, a tooltip — should NOT recompute the counts. What dependency array ensures exactly that?",
  mc_options: [
    "useMemo(() => countsByStatus, []); // empty — compute once",
    "useMemo(() => shipments.reduce(...), [shipments]); // only when shipments changes",
    "Computing inline without useMemo — simple enough to not need it",
  ],
  mc_correct_option:
    "useMemo(() => shipments.reduce(...), [shipments]); // only when shipments changes",
  mc_anchor:
    "The aggregate counts depend only on the shipments data — not on filter or sort state. `[shipments]` is the correct minimal dependency. Empty deps would compute once and become stale when shipments update. Inline computation (no useMemo) would work but recomputes on every state change — including filter, sort, and tooltip toggles.",
  why_this_matters:
    "The status summary bar in enterprise dashboards — Active: 42, Delayed: 8, Delivered: 127 — is exactly this pattern. It's an expensive aggregate that should only recompute when the underlying data changes, not on every UI interaction. useMemo with `[shipments]` as the sole dependency captures this intent precisely.",
  answer_keywords: [
    "useMemo", "statusCounts", "shipments", "reduce",
    "active", "delayed", "delivered", "[shipments]",
  ],
  seed_code: `import { useState, useMemo } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentRecord {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
}

const shipments: ShipmentRecord[] = [
  { shipmentId: 'NX-001', destination: 'Hamburg', status: 'active' },
  { shipmentId: 'NX-002', destination: 'Rotterdam', status: 'delayed' },
  { shipmentId: 'NX-003', destination: 'Antwerp', status: 'delivered' },
  { shipmentId: 'NX-004', destination: 'Bremen', status: 'active' },
  { shipmentId: 'NX-005', destination: 'Amsterdam', status: 'active' },
];`,
  starter_code: `import { useState, useMemo } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';
interface ShipmentRecord { shipmentId: string; destination: string; status: ShipmentStatus; }

const shipments: ShipmentRecord[] = [
  { shipmentId: 'NX-001', destination: 'Hamburg', status: 'active' },
  { shipmentId: 'NX-002', destination: 'Rotterdam', status: 'delayed' },
  { shipmentId: 'NX-003', destination: 'Antwerp', status: 'delivered' },
  { shipmentId: 'NX-004', destination: 'Bremen', status: 'active' },
  { shipmentId: 'NX-005', destination: 'Amsterdam', status: 'active' },
];

const StatusSummary = (): JSX.Element => {
  const [filter, setFilter] = useState('all');
  const [sortAsc, setSortAsc] = useState(true);

  // memoize status counts here — only recompute when shipments changes

  return (
    <div>
      <button onClick={() => setSortAsc(s => !s)}>Toggle sort</button>
      {/* render statusCounts.active, .delayed, .delivered */}
    </div>
  );
};`,
  feedback_correct:
    "Exactly — `[shipments]` is the only dependency. Toggling sort or filter does not recompute the counts. Only when shipments itself changes would the counts be recalculated.",
  feedback_partial:
    "Close — make sure the deps array is `[shipments]` only (not including filter or sortAsc — the counts don't depend on those). And type the reduce accumulator as `Record<ShipmentStatus, number>` or equivalent.",
  feedback_wrong:
    "Wrap in useMemo: `const statusCounts = useMemo(() => shipments.reduce((acc, s) => { acc[s.status] = (acc[s.status] || 0) + 1; return acc; }, {} as Record<ShipmentStatus, number>), [shipments]);`",
  expected: `const StatusSummary = (): JSX.Element => {
  const [filter, setFilter] = useState('all');
  const [sortAsc, setSortAsc] = useState(true);

  const statusCounts = useMemo(() =>
    shipments.reduce((acc, s) => {
      acc[s.status] = (acc[s.status] ?? 0) + 1;
      return acc;
    }, {} as Record<ShipmentStatus, number>),
    [shipments]
  );

  return (
    <div>
      <button onClick={() => setSortAsc(s => !s)}>Toggle sort</button>
      <div className="status-summary">
        <span>Active: {statusCounts.active ?? 0}</span>
        <span>Delayed: {statusCounts.delayed ?? 0}</span>
        <span>Delivered: {statusCounts.delivered ?? 0}</span>
      </div>
    </div>
  );
};`,
  analog_example: `const totals = useMemo(() =>
  orders.reduce((acc, o) => ({
    revenue: acc.revenue + o.amount,
    count: acc.count + 1,
  }), { revenue: 0, count: 0 }),
  [orders]
);`,
  deepDiveLabel:
    "useMemo returns a cached object — but does the object reference change when useMemo recomputes?",
  deepDive: {
    hook: "shipments changes (a new shipment is added). useMemo recomputes statusCounts. The new statusCounts is a new object reference. A child component that receives statusCounts re-renders — because React.memo sees a new reference even though the counts are the same.",
    pain: "⚠️ **Lesson:** useMemo recomputes when deps change — but can you prevent re-renders if the computed values are actually the same as before?",
    mentalModel:
      "useMemo always returns a new reference when it recomputes — even if the values are identical to the previous result. React has no built-in 'deep comparison before deciding to re-render' for memoized values.\n\nOptions:\n1. **Accept the re-render**: a child re-rendering because its data actually changed is correct — not a problem to optimise.\n2. **Custom comparison in React.memo**: `React.memo(Child, (prev, next) => JSON.stringify(prev.counts) === JSON.stringify(next.counts))` — deep compare the specific prop.\n3. **Stable reference when values don't change**: use a custom `useDeepMemo` hook that checks deep equality before returning a new reference.\n\nFor most cases, option 1 is correct — if shipments changed, the child should re-render with new count data.",
    discover:
      "```tsx\n// ✅ accept the re-render — data actually changed\nconst statusCounts = useMemo(() => computeCounts(shipments), [shipments]);\n<StatusBar counts={statusCounts} /> // re-renders when shipments changes — correct\n\n// ✅ custom comparison — prevent re-render when values are same despite new reference\nconst MemoStatusBar = React.memo(StatusBar,\n  (prev, next) => prev.counts.active === next.counts.active &&\n                  prev.counts.delayed === next.counts.delayed\n);\n```",
    quickRules:
      "- ✅ accept data-driven re-renders — if data changed, updating the child is correct\n- ✅ custom comparator: when the computed value often stays the same despite dep changes\n- ❌ JSON.stringify for deep comparison: slow for large objects, doesn't handle cycles\n- ✅ structural equality libraries (fast-deep-equal) for custom comparators",
    watchOut:
      "👀 **Watch out:** Over-optimising can make code harder to understand and introduce bugs. Re-renders caused by data changes are almost always correct. Optimise only when you've profiled and identified a specific performance problem.",
    dryRun:
      "🔁 **Think:** shipments gains a new shipment with status 'active'. useMemo recomputes: active was 3, now 4. statusCounts is a new object. MemoizedStatusBar receives the new statusCounts. React.memo compares old and new counts objects by reference: === or not? Does MemoizedStatusBar re-render?",
    build:
      "**Learning focus:** Use useMemo to cache an aggregate computation — understanding that useMemo always creates a new reference on recompute, and when child re-renders from new references are appropriate vs when custom comparators help.",
  },
},
{
  id: "step5",
  type: "question",
  phase: "Step 5 of 5",
  paal: "Apply the three-question framework to decide whether useMemo and useCallback are justified in three specific scenarios. Justify each decision.",
  hint: "Three questions: (1) Is the computation measurably slow? (2) Does it run on renders that don't need it? (3) Is the result used in a dep array or passed to React.memo? Justify with yes/no for each.",
  example_code: `// Scenario A: useMemo on items.length — is it justified?
// (1) O(1) — not slow. (2) Runs every render, but it's free. (3) Not used in deps.
// Verdict: NOT justified — useMemo overhead > benefit of caching .length

// Scenario B: useCallback on an event handler passed to React.memo child
// (1) Creating a function is cheap. (2) New function on every render.
// (3) YES — passed to React.memo child, new reference defeats memoization.
// Verdict: JUSTIFIED — useCallback prevents child re-renders`,
  think_prompt:
    "Apply the three questions to each scenario. There is not always a clear-cut answer — explain your reasoning.",
  mc_options: [
    "Always add useMemo and useCallback proactively — better safe than sorry",
    "Apply the three questions: measure cost, measure unnecessary execution, check stable reference need",
    "Never add useMemo or useCallback — React is fast enough without them",
  ],
  mc_correct_option:
    "Apply the three questions: measure cost, measure unnecessary execution, check stable reference need",
  mc_anchor:
    "The three-question framework is the industry-accepted approach — profile first, add memoization second. Proactive memoization adds complexity and overhead without measured benefit. Blanket avoidance ignores genuine cases where large-data computations or child re-render explosions cause visible performance problems.",
  why_this_matters:
    "Knowing when NOT to use a tool is as important as knowing how to use it. Most React performance problems are solved by fixing data structure or rendering architecture, not by sprinkling useMemo everywhere. The three-question framework gives you a principled basis for every memoization decision.",
  answer_keywords: [
    "measurably slow", "unnecessary renders",
    "stable reference", "React.memo", "deps array",
    "justified", "not justified",
  ],
  seed_code: `// Evaluate three scenarios:
// A: useMemo on items.length — array of 10 items
// B: useMemo on regex match across 50,000 items
// C: useCallback on a handler passed to a plain (non-memoized) child`,
  starter_code: `// Apply the three-question framework to each:

// Scenario A: useMemo(() => items.length, [items])
// Array has 10 items. Component re-renders frequently for unrelated state.
// (1) Is .length slow?
// (2) Does it run unnecessarily?
// (3) Is the result in a dep array or passed to React.memo?
// Verdict:

// Scenario B: useMemo(() => shipments.filter(s => regex.test(s.notes)), [shipments, regex])
// 50,000 shipments. Regex is complex. Component re-renders on every keystroke.
// (1) Is regex.test over 50k items slow?
// (2) Does it run unnecessarily (on every keystroke)?
// (3) Is the result used in a dep array?
// Verdict:

// Scenario C: useCallback(handler, [deps]) passed to a plain non-memoized child
// Child is NOT wrapped in React.memo.
// (1) Is creating a function slow?
// (2) Does the new reference cause unnecessary work?
// (3) Is the function used in a dep array or passed to React.memo?
// Verdict:`,
  feedback_correct:
    "Exactly — A is not justified (O(1), useMemo overhead is larger), B is justified (O(n) regex over huge array, runs on every keystroke), C is not justified (child re-renders on every parent render regardless of function reference — React.memo is missing).",
  feedback_partial:
    "Close — re-evaluate Scenario C. Without React.memo on the child, the child re-renders every time the parent re-renders — regardless of whether the function reference is stable. useCallback only helps if the child is memoized.",
  feedback_wrong:
    "A: NOT justified — array length is O(1), useMemo overhead exceeds the benefit of caching. B: JUSTIFIED — O(n) regex over 50,000 items on every keystroke is measurably slow. C: NOT justified — the child is not wrapped in React.memo, so a stable function reference doesn't prevent its re-renders. useCallback without React.memo adds overhead for zero benefit.",
  expected: `// Scenario A: useMemo(() => items.length, [items])
// (1) Is .length slow? NO — O(1) property access
// (2) Does it run unnecessarily? YES — but the computation is free
// (3) Result in dep array or React.memo? Probably not
// Verdict: NOT JUSTIFIED — useMemo overhead (dep comparison, cache storage) > benefit
// Fix: const count = items.length; // plain const, no useMemo

// Scenario B: useMemo(() => shipments.filter(s => regex.test(s.notes)), [shipments, regex])
// (1) Is regex.test over 50k items slow? YES — O(n) with complex regex
// (2) Does it run unnecessarily? YES — on every keystroke (state changes)
// (3) Result passed to a rendered list? YES
// Verdict: JUSTIFIED — measurably expensive, runs unnecessarily, prevents wasted renders

// Scenario C: useCallback(handler, [deps]) on plain non-memoized child
// (1) Is creating a function slow? NO — negligible
// (2) Does new reference cause unnecessary work? NO — child re-renders on parent render
//     regardless (not wrapped in React.memo)
// (3) Function in dep array or React.memo child? NO
// Verdict: NOT JUSTIFIED — useCallback adds overhead, child re-renders anyway
// Fix: wrap child in React.memo FIRST, then add useCallback if needed`,
  analog_example: `// Quick heuristic:
// useMemo/useCallback — ask yourself first:
// "If I remove this, will users notice slower UI?"
// If no: don't add it.
// If yes (or you've profiled and confirmed): add it.`,
  deepDiveLabel:
    "The three-question framework — how does React's automatic batching in React 18 change the memoization calculus?",
  deepDive: {
    hook: "React 18 automatic batching means multiple state updates in async callbacks now cause only one re-render instead of many. Your component had three useState calls that fired separately — three renders. After upgrading to React 18: one render. Do you still need useMemo and useCallback?",
    pain: "⚠️ **Lesson:** React 18's automatic batching reduces unnecessary re-renders. Does this change when useMemo and useCallback are worth adding?",
    mentalModel:
      "React 18 automatic batching reduces renders caused by multiple state updates in the same event loop tick. It does NOT help with:\n- Expensive computations that run on each render (even if there are fewer renders)\n- Child re-renders caused by new function/object references passed as props\n- Expensive list renders triggered by parent re-renders\n\nSo the memoization calculus changes slightly:\n- The component re-renders less often overall → expensive computations run less\n- But when it does render, the computation still runs unless memoized\n- useCallback still matters for React.memo children — batching doesn't help with reference instability\n\nConclusion: React 18 batching helps, but doesn't eliminate the need for memoization in genuinely expensive cases.",
    discover:
      "```tsx\n// React 18: these three setState calls cause ONE re-render\n// (previously caused 3 renders in async callbacks)\nfetch(url).then(data => {\n  setData(data);        // batched\n  setIsLoading(false);  // batched\n  setError(null);       // batched\n}); // one re-render total\n\n// But if each re-render triggers an expensive O(n log n) sort:\nconst sorted = useMemo(() => data.sort(...), [data]); // still worth it\n// React 18: fewer renders. useMemo: less often re-run. Both help.\n```",
    quickRules:
      "- ✅ React 18 batching: reduces total renders from async code\n- ✅ useMemo: still needed for expensive computations that run per render\n- ✅ useCallback + React.memo: still needed for stable child function props\n- ❌ assuming React 18 eliminates memoization needs — it reduces, not eliminates\n- profile with React DevTools after React 18 upgrade — some memos may be less necessary",
    watchOut:
      "👀 **Watch out:** React 18's automatic batching can break code that expected multiple renders. If you relied on `count` being updated between two setState calls, React 18 now batches them — `count` is updated only after both calls, not between them.",
    dryRun:
      "🔁 **Think:** A component re-renders 10 times/second due to a rapidly updating context (cursor position). Without useMemo: an expensive filter runs 10 times/second. React 18 batching doesn't help (these are separate context updates, not one batch). With useMemo and `[data]` deps (data doesn't change): does the filter run 10 times/second?",
    build:
      "**Learning focus:** Apply the three-question memoization framework to specific scenarios — understanding that React 18 reduces some renders but doesn't eliminate the need for memoization of expensive computations.",
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
  lessonNum: 31,
  title: "useMemo + useCallback",
  shortName: "HOOKS — MEMO CALLBACK",
});
