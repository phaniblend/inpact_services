
import createINPACTEngine from "../inpact_engine_shared";

function normalizeCode(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

function evalLesson45Step1(answer) {
  const raw = String(answer || "");
  const hasImport = /import\s+.*useMemo.*from\s+['"]react['"]/m.test(raw);
  const hasComponent = /const\s+RouteStatsPanel\s*=\s*\(/m.test(raw);
  const hasProps = /shipments\s*:\s*ShipmentRecord\[\]/m.test(raw);
  return hasImport && hasComponent && hasProps ? "correct" : "wrong";
}

function evalLesson45Step2(answer) {
  const raw = String(answer || "");
  const hasMemo = /useMemo\s*\(/m.test(raw);
  const hasCallback = /\(\s*\)\s*=>/m.test(raw);
  const hasDep = /\[\s*shipments\s*\]/m.test(raw);
  const hasTotal =
    /shipments\.reduce|shipments\.length|totalWeight|totalCount/m.test(raw);
  return hasMemo && hasCallback && hasDep && hasTotal ? "correct" : "wrong";
}

function evalLesson45Step3(answer) {
  const raw = String(answer || "");
  const hasSecondMemo = (raw.match(/useMemo\s*\(/gm) || []).length >= 2;
  const hasFilter = /\.filter\s*\(/m.test(raw);
  const hasDelayed = /status\s*===\s*['"]delayed['"]/m.test(raw) || /['"]delayed['"]/m.test(raw);
  const hasDep = /\[\s*shipments\s*\]/m.test(raw);
  return hasSecondMemo && hasFilter && hasDelayed && hasDep
    ? "correct"
    : hasFilter && hasDelayed
    ? "partial"
    : "wrong";
}

function evalLesson45Step4(answer) {
  const raw = String(answer || "");
  const hasStats = /stats\.\w+/m.test(raw);
  const hasDelayed = /delayedShipments/m.test(raw);
  const hasJsx = /return\s*\(/m.test(raw) && /<[A-Za-z]/m.test(raw);
  return hasStats && hasDelayed && hasJsx ? "correct" : "wrong";
}

function evalLesson45Step5(answer) {
  const raw = String(answer || "");
  const hasExport = /export\s+default\s+RouteStatsPanel/m.test(raw);
  const hasComplete =
    /useMemo/m.test(raw) && /return\s*\(/m.test(raw) && /ShipmentRecord/m.test(raw);
  return hasExport && hasComplete ? "correct" : "wrong";
}

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "LESSON #45 (useMemo)",
      title: "useMemo — Memoize Expensive Computations",
      body: "useMemo lets you cache the result of an expensive calculation so it only re-runs when its dependencies change — not on every render. You'll build a RouteStatsPanel that derives aggregate stats and a filtered list from a shipments array, memoizing each so the dashboard stays fast as data grows.",
      usecase:
        "Logistics dashboards routinely crunch large shipment arrays — summing weights, filtering by status, sorting by ETA — on every keystroke or state change. Without memoization those computations run hundreds of times per second. useMemo draws a boundary: recompute only when the source data changes.",
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
        reason:
          "The RouteStatsPanel component uses JSX arrow function syntax, fragment returns, and curly-brace expressions from Lesson 1 throughout Steps 1–5.",
      },
      {
        lesson: 10,
        label: "useState — Primitives",
        reason:
          "Steps 1–2 assume you understand that a state change triggers a re-render — that is the exact problem useMemo addresses. Without the render-cycle mental model from Lesson 10, the motivation for memoization is invisible.",
      },
      {
        lesson: 24,
        label: "useEffect — Mount",
        reason:
          "useMemo's dependency array follows the same rules as useEffect's. Step 2 requires you to know what 'a dependency changing between renders' means — a concept introduced by Lesson 24's dependency array.",
      },
      {
        lesson: 44,
        label: "React.memo",
        reason:
          "React.memo (Lesson 44) prevents child re-renders when props haven't changed. useMemo prevents a value from recomputing when irrelevant state changes. The deepDive in Step 2 contrasts the two — you need both concepts to see where each optimization belongs.",
      },
    ],
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Explain what useMemo does and when it is worth reaching for",
      "Wrap a derived value in useMemo with a correct dependency array",
      "Chain two independent useMemo calls that share the same source array",
      "Consume memoized values in JSX without triggering unnecessary recomputation",
      "Recognise the cost of memoizing everything and identify the cases that actually benefit",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 5",
    paal: "Import useMemo from React and define the RouteStatsPanel component that accepts a shipments prop typed as ShipmentRecord[].",
    hint: "Named import — useMemo lives alongside useState in the 'react' package. The props interface needs one field: shipments typed as ShipmentRecord[].",
    example_code: `import { useMemo } from 'react';

interface WarehouseItem {
  sku: string;
  qty: number;
}

interface WarehousePanelProps {
  items: WarehouseItem[];
}

const WarehousePanel = ({ items }: WarehousePanelProps) => {
  return <div />;
};`,
    think_prompt:
      "useMemo is a named export from React. What does the ShipmentRecord array prop tell TypeScript — and what guarantee does that type give you inside the component body?",
    mc_options: [
      "import useMemo from 'react'  — it's the default export",
      "import { useMemo } from 'react'  — it's a named export",
      "import { useMemo } from 'react-hooks'  — hooks live in a separate package",
    ],
    mc_correct_option:
      "import { useMemo } from 'react'  — it's a named export",
    mc_anchor:
      "All React hooks — useState, useEffect, useMemo, useCallback — are named exports from 'react'. There is no default hook export and no separate hooks package.",
    why_this_matters:
      "Every enterprise codebase has a lint rule that catches default imports of named exports. Getting the import pattern right from the start means no red CI builds on a hook that ships in the same package as JSX itself.",
    answer_keywords: [
      "import",
      "useMemo",
      "react",
      "RouteStatsPanel",
      "ShipmentRecord[]",
    ],
    evaluate: evalLesson45Step1,
    seed_code: "",
    starter_code: `// 1. import useMemo from the correct package
// 2. define ShipmentRecord (id: string, destination: string, weight: number, status: string)
// 3. define RouteStatsPanelProps with a shipments field typed as ShipmentRecord[]
// 4. define RouteStatsPanel component — return <div /> for now`,
    feedback_correct:
      "Clean — named import, typed array prop, component shell ready. useMemo can now be called inside the body.",
    feedback_partial:
      "Check the import: useMemo is a named export so it needs curly braces. Also confirm the prop is typed as ShipmentRecord[], not ShipmentRecord or any.",
    feedback_wrong:
      "Pattern: `import { useMemo } from 'react'` then `interface RouteStatsPanelProps { shipments: ShipmentRecord[] }` then `const RouteStatsPanel = ({ shipments }: RouteStatsPanelProps) => <div />;`",
    expected: `import { useMemo } from 'react';

interface ShipmentRecord {
  id: string;
  destination: string;
  weight: number;
  status: string;
}

interface RouteStatsPanelProps {
  shipments: ShipmentRecord[];
}

const RouteStatsPanel = ({ shipments }: RouteStatsPanelProps) => {
  return <div />;
};`,
    analog_example: `import { useMemo } from 'react';

interface InventoryItem {
  sku: string;
  zone: string;
  capacity: number;
}

interface InventoryPanelProps {
  items: InventoryItem[];
}

const InventoryPanel = ({ items }: InventoryPanelProps) => {
  return <div />;
};`,
    deepDiveLabel:
      "useMemo sounds like caching — so why doesn't React just cache every computed value automatically?",
    deepDive: {
      hook: "You've built a RouteStatsPanel that derives total weight, delayed count, and an ETA sort on every render. It's fast in development with 20 shipments. You ship to production. A logistics manager opens it on a route with 8,000 shipments and a filter input above the panel. Every keystroke triggers a re-render. Every re-render runs all three derivations. The tab hitches on every character typed.\n\nYou didn't write slow code. You wrote correct code that runs in the wrong place, at the wrong frequency.",
      pain: "⚠️ **Lesson:** React re-runs your entire component body on every render. Without useMemo, every derived value — `.reduce()`, `.filter()`, `.sort()` — recalculates even when the source data hasn't changed. Why doesn't React just skip that automatically?",
      mentalModel:
        "**Mental model — the Lazy Accountant.**\n\nImagine an accountant who recalculates the total from a stack of invoices every time you walk into the room — even if you've only changed which chair you're sitting in. useMemo is telling the accountant: 'Only redo the math when the invoices actually change. If I just moved a chair, hand me the number you already worked out.'\n\nReact doesn't auto-cache because it can't know which computations are expensive, which values are safe to reuse, and which ones depend on closure variables that aren't in the render argument. You have to tell it explicitly — that's what the dependency array is for.",
      discover: `**Pattern — useMemo:**
\`\`\`tsx
// ✅ memoize a derived value — recomputes only when shipments changes
const totalWeight = useMemo(
  () => shipments.reduce((sum, s) => sum + s.weight, 0),
  [shipments]
);

// ✅ memoize a filtered list — same source, separate memo
const delayed = useMemo(
  () => shipments.filter(s => s.status === 'delayed'),
  [shipments]
);

// ❌ no dependency array — runs on every render, useMemo does nothing useful
const total = useMemo(() => shipments.reduce(...), []);

// ❌ inline derivation without memo — fine for cheap operations, not for .sort() on 10k items
const sorted = shipments.slice().sort((a, b) => a.eta - b.eta);
\`\`\`
- The callback returns the value; the array declares what makes it stale
- Each memoized value is independent — chain as many as you need`,
      quickRules: `**Quick rules:**
- ✅ useMemo for computations that iterate a large array (reduce, filter, sort)
- ✅ dependency array must list every variable the callback reads from outside itself
- ✅ memoize the result not the function — useMemo returns a value, useCallback returns a function
- ❌ don't memoize cheap operations — string concatenation, arithmetic, single-field access
- ❌ empty dependency array means "compute once at mount" — only correct if the value truly never changes
- ❌ don't use useMemo to enforce referential stability of arrays passed to memoized children without also wrapping the child in React.memo`,
      watchOut:
        "👀 **Watch out:** The most common useMemo mistake is a stale dependency — you read a variable inside the callback but forget to list it in the array. TypeScript won't catch this. The eslint-plugin-react-hooks exhaustive-deps rule will. If your linter flags a missing dependency and you suppress the warning instead of fixing it, your memoized value can silently return stale data — wrong numbers with no error, no warning.",
      dryRun:
        "🔁 **Think:** You have `const stats = useMemo(() => compute(shipments), [shipments])`. A parent component re-renders because the user toggled a dark-mode switch. The shipments array reference hasn't changed. Does useMemo recompute stats? Now ask: what if the parent does `const list = [...shipments]` before passing it down — same items, new array reference. Does useMemo recompute now? What does that tell you about where the shipments state should live?",
      build:
        "**Learning focus:** useMemo caches a derived value and only recomputes it when a listed dependency changes — understanding that React uses referential equality to detect dependency changes, so the stability of the source data's reference matters as much as its content.",
    },
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 5",
    paal: "Add a useMemo call that derives stats — total shipment count and total weight — from the shipments array. Store the result in a stats variable.",
    hint: "One useMemo call, one reduce (or length + reduce). The dependency array has one entry: shipments.",
    example_code: `const summary = useMemo(() => {
  const total = items.reduce((sum, item) => sum + item.qty, 0);
  return { itemCount: items.length, totalQty: total };
}, [items]);`,
    think_prompt:
      "useMemo takes two arguments: a callback that returns the value, and a dependency array. What belongs in each argument for deriving stats from shipments?",
    mc_options: [
      "useMemo(shipments.reduce(...), [shipments])  — pass the result directly as first argument",
      "useMemo(() => ({ count: shipments.length, totalWeight: ... }), [shipments])  — callback wraps the derivation",
      "useMemo(() => ({ count: shipments.length, totalWeight: ... }), [])  — empty array since shipments is a prop",
    ],
    mc_correct_option:
      "useMemo(() => ({ count: shipments.length, totalWeight: ... }), [shipments])",
    mc_anchor:
      "The first argument must be a callback — useMemo calls it for you. The dependency array must list shipments because the callback reads it. An empty array would freeze stats at the initial value forever.",
    why_this_matters:
      "In a live logistics dashboard, shipments updates on WebSocket push. The stats derived from it must update too — but only then. Listing shipments in the dependency array is the contract: 'recompute exactly when the source changes, not before.'",
    answer_keywords: [
      "useMemo",
      "shipments",
      "count",
      "totalWeight",
      "reduce",
      "[shipments]",
    ],
    evaluate: evalLesson45Step2,
    seed_code: `import { useMemo } from 'react';

interface ShipmentRecord {
  id: string;
  destination: string;
  weight: number;
  status: string;
}

interface RouteStatsPanelProps {
  shipments: ShipmentRecord[];
}

const RouteStatsPanel = ({ shipments }: RouteStatsPanelProps) => {
  return <div />;
};`,
    starter_code: `import { useMemo } from 'react';

interface ShipmentRecord {
  id: string;
  destination: string;
  weight: number;
  status: string;
}

interface RouteStatsPanelProps {
  shipments: ShipmentRecord[];
}

const RouteStatsPanel = ({ shipments }: RouteStatsPanelProps) => {
  // derive { count, totalWeight } from shipments using useMemo
  const stats = /* your useMemo call here */;

  return <div />;
};`,
    feedback_correct:
      "Correct — callback wraps the derivation, shipments is the single dependency. stats will only recompute when the array reference changes.",
    feedback_partial:
      "Close — check two things: is the first argument a callback function (not the result itself), and does the dependency array list shipments?",
    feedback_wrong:
      "Pattern: `const stats = useMemo(() => ({ count: shipments.length, totalWeight: shipments.reduce((sum, s) => sum + s.weight, 0) }), [shipments]);`",
    expected: `import { useMemo } from 'react';

interface ShipmentRecord {
  id: string;
  destination: string;
  weight: number;
  status: string;
}

interface RouteStatsPanelProps {
  shipments: ShipmentRecord[];
}

const RouteStatsPanel = ({ shipments }: RouteStatsPanelProps) => {
  const stats = useMemo(() => ({
    count: shipments.length,
    totalWeight: shipments.reduce((sum, s) => sum + s.weight, 0),
  }), [shipments]);

  return <div />;
};`,
    analog_example: `const summary = useMemo(() => ({
  zoneCount: zones.length,
  totalCapacity: zones.reduce((sum, z) => sum + z.capacity, 0),
}), [zones]);`,
    deepDiveLabel:
      "The object returned by useMemo is new on every recompute — so does that break React.memo on child components?",
    deepDive: {
      hook: "You memoize stats correctly. You pass it to a memoized child: `<StatsBadge stats={stats} />`. You confirm React.memo wraps StatsBadge. But the profiler shows StatsBadge re-rendering every time the parent renders — even when shipments hasn't changed. You double-check the dependency array. It's correct. useMemo is working. So why is the child still re-rendering?\n\nThe answer: 'useMemo is working' and 'the child doesn't re-render' are two different things — and you've confused them.",
      pain: "⚠️ **Lesson:** useMemo returns the same object reference only when its dependencies don't change. When they do change, it returns a new object. If you pass that object to a React.memo child, the child sees a new prop reference and re-renders. Is useMemo broken?",
      mentalModel:
        "**Mental model — the Sealed Box.**\n\nuseMemo is a sealed box. When nothing changes, you get back the same box. When something changes, the box is resealed with new contents — it's a different box, even if the dimensions are identical.\n\nReact.memo checks whether the box is the same box (referential equality). If useMemo recomputed because shipments changed, you have a new box. The child re-renders — correctly, because the data changed. If shipments didn't change, useMemo returns the old box. React.memo sees the same reference and skips the render. This is the intended behaviour. The two optimizations compose correctly when you understand what each one checks.",
      discover: `**Pattern — useMemo + React.memo composition:**
\`\`\`tsx
// ✅ useMemo stabilises the reference when deps don't change
const stats = useMemo(() => ({ count: shipments.length, totalWeight: ... }), [shipments]);

// ✅ React.memo skips re-render when stats reference is unchanged
const StatsBadge = React.memo(({ stats }) => <div>{stats.count}</div>);

// ❌ inline object — new reference every render, React.memo never skips
<StatsBadge stats={{ count: shipments.length, totalWeight: 0 }} />

// ❌ useMemo with an object in the dep array — that object is new every render
const stats = useMemo(() => ({ count: shipments.length }), [{ id: 1 }]);
\`\`\``,
      quickRules: `**Quick rules:**
- ✅ useMemo returns the same reference when deps are unchanged — that's the guarantee
- ✅ when deps change, useMemo recomputes and returns a new reference — also correct
- ✅ pair useMemo + React.memo to prevent child re-renders from upstream state changes
- ❌ don't put inline objects or arrays directly in the dependency array — their references change every render
- ❌ don't assume useMemo prevents all child re-renders — it only stabilises the value when deps are stable`,
      watchOut:
        "👀 **Watch out:** Putting a derived object into a useMemo dependency array is a trap. If you write `useMemo(() => fn(), [stats])` and stats itself comes from another useMemo, the chain is fine — stats reference is stable when shipments is stable. But if stats is an inline object `{ count: 0 }`, it's a new reference every render, your dependency is always 'changed', and useMemo recomputes constantly — the opposite of its purpose.",
      dryRun:
        "🔁 **Think:** Your component has `const stats = useMemo(() => ({ count: shipments.length }), [shipments])`. The parent re-renders 10 times. Shipments is the same array reference all 10 times. How many times does the useMemo callback execute? Now: the parent creates a new array with the same items via `[...shipments]` before passing it each time. How many times does the callback execute now? What does the answer tell you about where shipments state should live?",
      build:
        "**Learning focus:** useMemo's recompute decision is based on referential equality of dependencies — returning an object from useMemo stabilises its reference across renders, making it safe to pass as a prop to React.memo-wrapped children.",
    },
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 5",
    paal: "Add a second useMemo call that filters shipments to only those with status 'delayed'. Store the result in delayedShipments.",
    hint: "Two separate useMemo calls, same dependency array. Each memoizes one derivation independently.",
    example_code: `const flaggedItems = useMemo(
  () => items.filter(item => item.status === 'flagged'),
  [items]
);`,
    think_prompt:
      "You already have one useMemo. Should you add the filter inside the same callback, or write a second useMemo call? What does independence of derivations buy you?",
    mc_options: [
      "Add the filter inside the existing stats useMemo — one callback, two derivations, one dep array",
      "Write a second useMemo with its own callback and [shipments] dependency — each derivation is independent",
      "Use a plain variable outside useMemo — the filter is cheap enough to run inline",
    ],
    mc_correct_option:
      "Write a second useMemo with its own callback and [shipments] dependency — each derivation is independent",
    mc_anchor:
      "Separate useMemo calls keep each derivation independent. If you later add a second dependency to one of them, you won't accidentally force the other to recompute. Single-responsibility applies to memoization too.",
    why_this_matters:
      "In production dashboards, delayed shipments often drive a separate UI section — a count badge, a priority list, an alert. Memoizing it independently means a change to stats logic (e.g. adding average weight) doesn't invalidate the delayed filter or cause the badge to flicker.",
    answer_keywords: [
      "useMemo",
      "filter",
      "delayed",
      "delayedShipments",
      "[shipments]",
    ],
    evaluate: evalLesson45Step3,
    seed_code: `import { useMemo } from 'react';

interface ShipmentRecord {
  id: string;
  destination: string;
  weight: number;
  status: string;
}

interface RouteStatsPanelProps {
  shipments: ShipmentRecord[];
}

const RouteStatsPanel = ({ shipments }: RouteStatsPanelProps) => {
  const stats = useMemo(() => ({
    count: shipments.length,
    totalWeight: shipments.reduce((sum, s) => sum + s.weight, 0),
  }), [shipments]);

  return <div />;
};`,
    starter_code: `import { useMemo } from 'react';

interface ShipmentRecord {
  id: string;
  destination: string;
  weight: number;
  status: string;
}

interface RouteStatsPanelProps {
  shipments: ShipmentRecord[];
}

const RouteStatsPanel = ({ shipments }: RouteStatsPanelProps) => {
  const stats = useMemo(() => ({
    count: shipments.length,
    totalWeight: shipments.reduce((sum, s) => sum + s.weight, 0),
  }), [shipments]);

  // add a second useMemo: filter for status === 'delayed'
  const delayedShipments = /* your useMemo call here */;

  return <div />;
};`,
    feedback_correct:
      "Exactly — two independent memos, same dependency, each with a single job. If the delayed filter gains a second dependency later, it won't pollute stats.",
    feedback_partial:
      "You have the filter but check whether it's wrapped in useMemo with [shipments] as the dependency. An unwrapped filter re-runs on every render.",
    feedback_wrong:
      "Pattern: `const delayedShipments = useMemo(() => shipments.filter(s => s.status === 'delayed'), [shipments]);`",
    expected: `import { useMemo } from 'react';

interface ShipmentRecord {
  id: string;
  destination: string;
  weight: number;
  status: string;
}

interface RouteStatsPanelProps {
  shipments: ShipmentRecord[];
}

const RouteStatsPanel = ({ shipments }: RouteStatsPanelProps) => {
  const stats = useMemo(() => ({
    count: shipments.length,
    totalWeight: shipments.reduce((sum, s) => sum + s.weight, 0),
  }), [shipments]);

  const delayedShipments = useMemo(
    () => shipments.filter(s => s.status === 'delayed'),
    [shipments]
  );

  return <div />;
};`,
    analog_example: `const outOfStockItems = useMemo(
  () => inventory.filter(item => item.qty === 0),
  [inventory]
);`,
    deepDiveLabel:
      "Both useMemos depend on shipments — so why not just compute everything inside a single useMemo and return one big object?",
    deepDive: {
      hook: "You merge everything into one useMemo: `const computed = useMemo(() => ({ stats, delayed, sorted }), [shipments])`. It works. Then a new requirement lands: the sorted list needs to re-sort when the user changes the sort column — a piece of local state. You add sortColumn to the dependency array. Now every time the user clicks a column header, the stats and delayed filter also recompute — even though neither one cares about sortColumn.",
      pain: "⚠️ **Lesson:** When you bundle multiple derivations into one useMemo, they share a dependency array. Any dependency added for one derivation forces all of them to recompute together. How do you prevent derivations with different inputs from being coupled to each other's dependencies?",
      mentalModel:
        "**Mental model — the Single-Purpose Workbench.**\n\nEach useMemo is a dedicated workbench. You tell each workbench exactly what raw materials it needs. If the stats bench only needs the shipments crate, a change to the sort-column drawer doesn't interrupt it. If you put all three jobs on one bench and one job needs a new material, every job on that bench pauses and restarts.\n\nSingle-purpose memoization keeps each derivation isolated. The cost is a few extra lines. The benefit is that future dependency additions stay surgical.",
      discover: `**Pattern — independent vs bundled memos:**
\`\`\`tsx
// ✅ independent — each derivation owns its own deps
const stats = useMemo(() => ({ count: ..., totalWeight: ... }), [shipments]);
const delayed = useMemo(() => shipments.filter(...), [shipments]);
const sorted = useMemo(() => [...shipments].sort(...), [shipments, sortColumn]);

// ❌ bundled — sortColumn now forces stats and delayed to recompute on every column click
const computed = useMemo(() => ({
  stats: { count: shipments.length, totalWeight: ... },
  delayed: shipments.filter(...),
  sorted: [...shipments].sort((a, b) => a[sortColumn] - b[sortColumn]),
}), [shipments, sortColumn]);
\`\`\`
- independent memos compose cleanly as requirements evolve
- bundled memos couple unrelated derivations to each other's dependencies`,
      quickRules: `**Quick rules:**
- ✅ one useMemo per logical derivation — keep dependencies surgical
- ✅ derivations that share deps can share a memo only if they will always share all future deps too
- ❌ don't bundle derivations with different dependency surfaces into one useMemo
- ❌ don't split a single derivation across two memos — that creates unnecessary intermediate values`,
      watchOut:
        "👀 **Watch out:** The bundled-memo pattern looks clean and DRY at first — one variable, one dependency array. It becomes a maintenance liability the moment one derivation grows its own dependencies. In a large codebase you'll find bundled memos with 8 dependencies where 5 are only relevant to one of the four derivations inside. Splitting them at that point is a refactor. Starting them separately costs two lines.",
      dryRun:
        "🔁 **Think:** You have three memos: stats (deps: [shipments]), delayed (deps: [shipments]), and sorted (deps: [shipments, sortColumn]). The user clicks a column header — sortColumn changes. Which memos recompute? Now a WebSocket push updates shipments. Which memos recompute? Now you merge all three into one memo with [shipments, sortColumn]. The user clicks a column — which derivations now recompute that didn't before?",
      build:
        "**Learning focus:** Keeping useMemo calls single-purpose — one derivation per memo — so that future dependency changes stay isolated and don't force unrelated computations to recompute.",
    },
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 5",
    paal: "Replace the placeholder return with JSX that renders the memoized stats and the count of delayed shipments.",
    hint: "Access fields directly from stats — stats.count, stats.totalWeight. Use delayedShipments.length for the delayed count.",
    example_code: `return (
  <section>
    <p>Zones: {summary.zoneCount}</p>
    <p>Total Capacity: {summary.totalCapacity}</p>
    <p>Out of Stock: {outOfStockItems.length}</p>
  </section>
);`,
    think_prompt:
      "stats is an object from useMemo. delayedShipments is an array from a second useMemo. Both are already computed. What JSX expression renders each value?",
    mc_options: [
      "{stats()} — call it like a function to get the current value",
      "{stats.count} — access the field directly, it's a plain object",
      "{useMemo(stats.count)} — read the memoized value through the hook",
    ],
    mc_correct_option: "{stats.count} — access the field directly, it's a plain object",
    mc_anchor:
      "useMemo returns the value your callback returns. stats is a plain object — access its fields with dot notation like any other variable. There's no special accessor.",
    why_this_matters:
      "Memoized values are transparent — you use them exactly the same way you'd use a plain variable. The optimization is invisible to the JSX layer. This is intentional: useMemo is an implementation detail, not an API contract.",
    answer_keywords: [
      "stats.count",
      "stats.totalWeight",
      "delayedShipments.length",
      "return",
    ],
    evaluate: evalLesson45Step4,
    seed_code: `import { useMemo } from 'react';

interface ShipmentRecord {
  id: string;
  destination: string;
  weight: number;
  status: string;
}

interface RouteStatsPanelProps {
  shipments: ShipmentRecord[];
}

const RouteStatsPanel = ({ shipments }: RouteStatsPanelProps) => {
  const stats = useMemo(() => ({
    count: shipments.length,
    totalWeight: shipments.reduce((sum, s) => sum + s.weight, 0),
  }), [shipments]);

  const delayedShipments = useMemo(
    () => shipments.filter(s => s.status === 'delayed'),
    [shipments]
  );

  return <div />;
};`,
    starter_code: `import { useMemo } from 'react';

interface ShipmentRecord {
  id: string;
  destination: string;
  weight: number;
  status: string;
}

interface RouteStatsPanelProps {
  shipments: ShipmentRecord[];
}

const RouteStatsPanel = ({ shipments }: RouteStatsPanelProps) => {
  const stats = useMemo(() => ({
    count: shipments.length,
    totalWeight: shipments.reduce((sum, s) => sum + s.weight, 0),
  }), [shipments]);

  const delayedShipments = useMemo(
    () => shipments.filter(s => s.status === 'delayed'),
    [shipments]
  );

  return (
    <div>
      {/* render stats.count, stats.totalWeight, and delayedShipments.length */}
    </div>
  );
};`,
    feedback_correct:
      "Clean — memoized values consumed as plain object fields in JSX. The optimization is invisible to the template, which is exactly the point.",
    feedback_partial:
      "Almost — make sure you're rendering all three values: stats.count, stats.totalWeight, and delayedShipments.length.",
    feedback_wrong:
      "Pattern: `<p>{stats.count}</p>` `<p>{stats.totalWeight}</p>` `<p>{delayedShipments.length}</p>` — access fields directly, no special syntax.",
    expected: `import { useMemo } from 'react';

interface ShipmentRecord {
  id: string;
  destination: string;
  weight: number;
  status: string;
}

interface RouteStatsPanelProps {
  shipments: ShipmentRecord[];
}

const RouteStatsPanel = ({ shipments }: RouteStatsPanelProps) => {
  const stats = useMemo(() => ({
    count: shipments.length,
    totalWeight: shipments.reduce((sum, s) => sum + s.weight, 0),
  }), [shipments]);

  const delayedShipments = useMemo(
    () => shipments.filter(s => s.status === 'delayed'),
    [shipments]
  );

  return (
    <div>
      <p>Total Shipments: {stats.count}</p>
      <p>Total Weight: {stats.totalWeight}kg</p>
      <p>Delayed: {delayedShipments.length}</p>
    </div>
  );
};`,
    analog_example: `return (
  <section>
    <p>Zones: {summary.zoneCount}</p>
    <p>Capacity: {summary.totalCapacity}m²</p>
    <p>Empty: {outOfStockItems.length}</p>
  </section>
);`,
    deepDiveLabel:
      "You can read stats.count in JSX without any special syntax — so why can't you call useMemo inside an if block or a loop?",
    deepDive: {
      hook: "You have a RouteStatsPanel with a feature flag: premium users see extended stats, free users see basic. You write `if (isPremium) { const extended = useMemo(...); }`. TypeScript shows no error. At runtime, React throws: 'React Hook useMemo is called conditionally.' The component crashes.\n\nYou weren't doing anything that looked obviously wrong. You were just trying to avoid running an expensive computation for users who won't see the result.",
      pain: "⚠️ **Lesson:** React hooks must be called at the top level of a component — not inside conditions, loops, or nested functions. Why does this rule exist, and what breaks when you violate it?",
      mentalModel:
        "**Mental model — the Numbered Hooks List.**\n\nReact tracks every hook call as a numbered slot in an internal list — slot 1, slot 2, slot 3. On every render it expects to fill exactly the same slots in exactly the same order. If a useMemo call is inside an `if`, it might fill slot 2 on one render and be absent on the next. Slot 2 now holds a different hook — and React has no idea which value belongs to which call. The hook list becomes incoherent.\n\nThe rule isn't arbitrary. It's the only way React can reliably associate a hook's stored value with its call site across renders.",
      discover: `**Pattern — hooks at the top level:**
\`\`\`tsx
// ✅ always called — the condition moves inside the callback
const extended = useMemo(() => {
  if (!isPremium) return null;
  return shipments.reduce(...expensiveCalc);
}, [isPremium, shipments]);

// ✅ always called — ternary inside the callback
const stats = useMemo(
  () => isPremium ? calcExtended(shipments) : calcBasic(shipments),
  [isPremium, shipments]
);

// ❌ conditional hook — crashes at runtime when isPremium flips
if (isPremium) {
  const extended = useMemo(() => calcExtended(shipments), [shipments]);
}

// ❌ hook in a loop — slot count changes if array length changes
shipments.forEach(s => {
  const weight = useMemo(() => s.weight * 1.1, [s]);
});
\`\`\``,
      quickRules: `**Quick rules:**
- ✅ call every hook unconditionally at the top level of the component
- ✅ move conditions inside the callback — return early or return null from within useMemo
- ✅ eslint rules-of-hooks catches this at lint time, not just runtime
- ❌ never call a hook inside an if, else, switch, loop, or nested function
- ❌ never call a hook inside a .map() or .forEach() callback`,
      watchOut:
        "👀 **Watch out:** The crash only happens when the condition flips. If `isPremium` is always `true` in your dev environment, the conditional hook works fine locally. It only crashes in production when a free-tier user triggers the code path where the condition is false. This is exactly the scenario that makes conditional hook calls dangerous — they pass local testing and fail silently in the wild.",
      dryRun:
        "🔁 **Think:** You have `const stats = useMemo(() => compute(shipments), [shipments])` at the top of your component — always called. Now you want to skip the computation for empty arrays. You consider two approaches: (A) return `<EmptyState />` early before the useMemo call; (B) `const stats = useMemo(() => shipments.length === 0 ? null : compute(shipments), [shipments])`. Which approach violates the rules of hooks? Which is safe? Why?",
      build:
        "**Learning focus:** React hooks must be called unconditionally at the top level of a component — conditions belong inside the callback, not around the hook call itself.",
    },
  },
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 5",
    paal: "Export RouteStatsPanel as the default export.",
    hint: "One line at the bottom — export default followed by the component name.",
    example_code: `export default InventoryPanel;`,
    think_prompt:
      "The component is complete. What is the correct export syntax so another module can import it as the default?",
    mc_options: [
      "module.exports = RouteStatsPanel  — CommonJS syntax",
      "export RouteStatsPanel  — named export",
      "export default RouteStatsPanel  — default export",
    ],
    mc_correct_option: "export default RouteStatsPanel  — default export",
    mc_anchor:
      "Default export lets a consuming module import the component with any name it chooses. Named export requires the exact identifier. React component files typically use default export for the primary component.",
    why_this_matters:
      "In a large codebase each component file exports one primary component as default and any supporting types as named exports. Bundlers, code generators, and import auto-completers all depend on this convention.",
    answer_keywords: ["export", "default", "RouteStatsPanel"],
    evaluate: evalLesson45Step5,
    seed_code: `import { useMemo } from 'react';

interface ShipmentRecord {
  id: string;
  destination: string;
  weight: number;
  status: string;
}

interface RouteStatsPanelProps {
  shipments: ShipmentRecord[];
}

const RouteStatsPanel = ({ shipments }: RouteStatsPanelProps) => {
  const stats = useMemo(() => ({
    count: shipments.length,
    totalWeight: shipments.reduce((sum, s) => sum + s.weight, 0),
  }), [shipments]);

  const delayedShipments = useMemo(
    () => shipments.filter(s => s.status === 'delayed'),
    [shipments]
  );

  return (
    <div>
      <p>Total Shipments: {stats.count}</p>
      <p>Total Weight: {stats.totalWeight}kg</p>
      <p>Delayed: {delayedShipments.length}</p>
    </div>
  );
};`,
    starter_code: `import { useMemo } from 'react';

interface ShipmentRecord {
  id: string;
  destination: string;
  weight: number;
  status: string;
}

interface RouteStatsPanelProps {
  shipments: ShipmentRecord[];
}

const RouteStatsPanel = ({ shipments }: RouteStatsPanelProps) => {
  const stats = useMemo(() => ({
    count: shipments.length,
    totalWeight: shipments.reduce((sum, s) => sum + s.weight, 0),
  }), [shipments]);

  const delayedShipments = useMemo(
    () => shipments.filter(s => s.status === 'delayed'),
    [shipments]
  );

  return (
    <div>
      <p>Total Shipments: {stats.count}</p>
      <p>Total Weight: {stats.totalWeight}kg</p>
      <p>Delayed: {delayedShipments.length}</p>
    </div>
  );
};

// export RouteStatsPanel as the default export`,
    feedback_correct:
      "Complete — RouteStatsPanel is exported and ready. Two independent memoized derivations, one component, zero unnecessary recomputation.",
    feedback_partial:
      "Almost — make sure it's `export default RouteStatsPanel` not a named export.",
    feedback_wrong:
      "Add `export default RouteStatsPanel;` as the last line of the file.",
    expected: `import { useMemo } from 'react';

interface ShipmentRecord {
  id: string;
  destination: string;
  weight: number;
  status: string;
}

interface RouteStatsPanelProps {
  shipments: ShipmentRecord[];
}

const RouteStatsPanel = ({ shipments }: RouteStatsPanelProps) => {
  const stats = useMemo(() => ({
    count: shipments.length,
    totalWeight: shipments.reduce((sum, s) => sum + s.weight, 0),
  }), [shipments]);

  const delayedShipments = useMemo(
    () => shipments.filter(s => s.status === 'delayed'),
    [shipments]
  );

  return (
    <div>
      <p>Total Shipments: {stats.count}</p>
      <p>Total Weight: {stats.totalWeight}kg</p>
      <p>Delayed: {delayedShipments.length}</p>
    </div>
  );
};

export default RouteStatsPanel;`,
    analog_example: `export default InventoryPanel;`,
    deepDiveLabel:
      "useMemo looks like a performance win everywhere — so why do React docs say to use it sparingly?",
    deepDive: {
      hook: "You've memoized everything. Every derived value, every format call, every string interpolation. The profiler shows the component is faster — but only marginally. Meanwhile your colleagues are having trouble following the logic because every computation is wrapped in a hook call with a dependency array. A reviewer asks: 'Is this useMemo actually doing anything?' You realize you genuinely don't know.",
      pain: "⚠️ **Lesson:** useMemo has a cost — the overhead of tracking dependencies and storing the previous value. For cheap operations, that overhead can exceed the savings. When is useMemo actually worth reaching for?",
      mentalModel:
        "**Mental model — the Break-Even Threshold.**\n\nEvery useMemo call buys you something (skipping a recomputation) at a price (storing the result, checking deps on every render). For expensive work — `.reduce()` over 10,000 items, a `.sort()` with a complex comparator — the savings dominate. For cheap work — `.toString()`, a ternary, a string template — the overhead dominates. The break-even point is roughly: if the computation takes less than a microsecond, the memo machinery costs more than it saves.\n\nThe other cost is readability. A useMemo wrapping a trivial expression adds three lines and a dependency array to something that was one line. That's a cognitive tax on every future reader.",
      discover: `**Pattern — when to use and skip useMemo:**
\`\`\`tsx
// ✅ worth it — iterates a large array
const stats = useMemo(() => shipments.reduce(...), [shipments]);

// ✅ worth it — sort is O(n log n), expensive on large lists
const sorted = useMemo(() => [...shipments].sort(...), [shipments, sortKey]);

// ✅ worth it — result is passed to a React.memo child (referential stability matters)
const config = useMemo(() => ({ threshold: 100, unit: 'kg' }), []);

// ❌ not worth it — trivial arithmetic
const total = useMemo(() => price * qty, [price, qty]);

// ❌ not worth it — single field access
const label = useMemo(() => shipment.destination.toUpperCase(), [shipment]);
\`\`\``,
      quickRules: `**Quick rules:**
- ✅ use useMemo for expensive array operations on large data sets (reduce, sort, filter)
- ✅ use useMemo when the result is passed as a prop to a React.memo component
- ✅ use useMemo when the result is a dependency of another hook
- ❌ skip useMemo for cheap computations — arithmetic, string ops, single field access
- ❌ skip useMemo when the component rarely re-renders anyway
- ❌ profile before you memoize — reach for it in response to evidence, not instinct`,
      watchOut:
        "👀 **Watch out:** The most expensive useMemo call in many codebases is the one that memoizes something that never needed memoizing — and has a dependency array so broad it recomputes on almost every render anyway. React DevTools Profiler shows you exactly which renders are slow and why. Memoize in response to evidence.",
      dryRun:
        "🔁 **Think:** You have a component that renders a list of 50 shipments. It has three pieces of local state: `sortColumn`, `filterText`, and `sidebarOpen`. Which of these should be in the dependency array of `useMemo(() => shipments.filter(...), [deps])`? Which state changes should NOT cause the filter to recompute? What does your dependency array need to include — and what should it deliberately leave out?",
      build:
        "**Learning focus:** useMemo is a surgical tool — understanding that it has a real cost and is worth reaching for only when the computation is genuinely expensive, the result needs referential stability, or profiling has confirmed a performance problem.",
    },
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Prerequisites", id: "prereqs" },
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
  lessonNum: 45,
  title: "useMemo — Memoize Expensive Computations",
  shortName: "useMemo — ROUTE STATS PANEL",
});
