
import createINPACTEngine from "../inpact_engine_shared";

function normalizeCode(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

function evalLesson47Step1(answer) {
  const raw = String(answer || "");
  const hasMemo = /React\.memo\s*\(|memo\s*\(/m.test(raw);
  const hasShipmentRow = /ShipmentRow/m.test(raw);
  const hasProps =
    /shipment\s*:\s*ShipmentRecord/m.test(raw) && /onSelect\s*:\s*\(\s*\)\s*=>\s*void/m.test(raw);
  return hasMemo && hasShipmentRow && hasProps ? "correct" : "wrong";
}

function evalLesson47Step2(answer) {
  const raw = String(answer || "");
  const hasUseCallback = /useCallback\s*\(/m.test(raw);
  const hasHandleSelect = /handleSelect/m.test(raw) || /onSelect/m.test(raw);
  const hasDep =
    /\[\s*shipment\.id\s*[,\]]/m.test(raw) ||
    /\[\s*shipment\s*[,\]]/m.test(raw) ||
    /\[\s*onSelect\s*[,\]]/m.test(raw);
  return hasUseCallback && hasHandleSelect && hasDep ? "correct" : "wrong";
}

function evalLesson47Step3(answer) {
  const raw = String(answer || "");
  const hasUseMemo = /useMemo\s*\(/m.test(raw);
  const hasSortedShipments = /sortedShipments|sorted/m.test(raw);
  const hasSort = /\.sort\s*\(/m.test(raw);
  const hasDep = /\[\s*shipments\s*\]/m.test(raw);
  return hasUseMemo && hasSortedShipments && hasSort && hasDep ? "correct" : "wrong";
}

function evalLesson47Step4(answer) {
  const raw = String(answer || "");
  const hasMap = /\.map\s*\(/m.test(raw);
  const hasKey = /key\s*=\s*\{/m.test(raw) || /key=/m.test(raw);
  const hasShipmentRow = /<ShipmentRow/m.test(raw);
  const hasOnSelect = /onSelect\s*=\s*\{/m.test(raw);
  return hasMap && hasKey && hasShipmentRow && hasOnSelect ? "correct" : "wrong";
}

function evalLesson47Step5(answer) {
  const raw = String(answer || "");
  const hasExport = /export\s+default\s+ShipmentList/m.test(raw);
  const hasMemo = /React\.memo|memo\s*\(/m.test(raw);
  const hasCallback = /useCallback/m.test(raw);
  const hasMemoValue = /useMemo/m.test(raw);
  return hasExport && hasMemo && hasCallback && hasMemoValue ? "correct" : "wrong";
}

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "LESSON #47 (Re-renders)",
      title: "Identifying Re-renders — The Full Picture",
      body: "React.memo, useMemo, and useCallback each solve a different slice of the re-render problem. This lesson brings them together: you'll build a ShipmentList that renders memoized ShipmentRow components, identifies exactly when and why each re-render happens, and applies the right tool to each cause.",
      usecase:
        "A shipment list in a fleet dashboard can have hundreds of rows. If every parent state change re-renders every row — even rows whose data hasn't changed — the UI becomes sluggish. The skill here is not just knowing the three tools, but diagnosing which tool fixes which cause.",
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
          "ShipmentList and ShipmentRow both use JSX arrow function syntax, list rendering with .map(), and curly-brace expressions throughout all five steps.",
      },
      {
        lesson: 10,
        label: "useState — Primitives",
        reason:
          "Step 2 and the deepDives require understanding that a state change in the parent triggers a re-render of children — that is the scenario the entire lesson diagnoses and fixes.",
      },
      {
        lesson: 44,
        label: "React.memo",
        reason:
          "Step 1 requires you to wrap ShipmentRow in React.memo. Without knowing how React.memo works and what it checks (prop reference equality), you cannot reason about why the row re-renders even after wrapping it.",
      },
      {
        lesson: 45,
        label: "useMemo",
        reason:
          "Step 3 requires you to memoize the sorted shipments array using useMemo. The deepDive in Step 3 contrasts the three tools — you need the useMemo mental model from Lesson 45.",
      },
      {
        lesson: 46,
        label: "useCallback",
        reason:
          "Step 2 requires you to stabilise the onSelect handler using useCallback. The core problem — an inline arrow function creating a new reference on every render — is the exact issue useCallback from Lesson 46 was designed to solve.",
      },
    ],
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Identify the three independent causes of an unexpected re-render in a React component",
      "Apply React.memo to a child component to enable prop-equality skipping",
      "Stabilise an event handler reference with useCallback to prevent React.memo from being bypassed",
      "Memoize a derived array with useMemo so list re-renders are triggered by data changes, not by re-computation",
      "Read a re-render scenario and select the correct tool — or identify that no tool is needed",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 5",
    paal: "Define a ShipmentRow component wrapped in React.memo. It accepts a shipment (ShipmentRecord) and onSelect (() => void) prop.",
    hint: "React.memo wraps the component definition. The component itself is an arrow function — React.memo receives that arrow function as its argument.",
    example_code: `const DriverCard = React.memo(({ driver, onHighlight }: DriverCardProps) => {
  return <div>{driver.name}</div>;
});`,
    think_prompt:
      "React.memo wraps a component. What does it check on each parent re-render, and what does it skip if that check passes?",
    mc_options: [
      "React.memo checks if the component's state has changed — if not, it skips re-render",
      "React.memo checks if the props references are shallowly equal — if they are, it skips re-render",
      "React.memo checks if the component's output JSX has changed — if not, it skips re-render",
    ],
    mc_correct_option:
      "React.memo checks if the props references are shallowly equal — if they are, it skips re-render",
    mc_anchor:
      "React.memo performs a shallow comparison of each prop value. If all prop references are the same as the previous render, React skips re-rendering the component. It does not check state (children have their own state), and it does not pre-compute the JSX output to compare it.",
    why_this_matters:
      "Understanding what React.memo checks tells you exactly what can defeat it: a new object reference for any prop — even one with the same contents — will cause a re-render. This is why onSelect as an inline arrow function defeats React.memo, and why useCallback exists.",
    answer_keywords: [
      "React.memo",
      "ShipmentRow",
      "shipment",
      "ShipmentRecord",
      "onSelect",
    ],
    evaluate: evalLesson47Step1,
    seed_code: "",
    starter_code: `import React, { useMemo, useCallback } from 'react';

interface ShipmentRecord {
  id: string;
  destination: string;
  status: string;
}

interface ShipmentRowProps {
  shipment: ShipmentRecord;
  onSelect: () => void;
}

// wrap ShipmentRow in React.memo — it renders one row
// the component body can return a <div> with shipment.id and shipment.destination`,
    feedback_correct:
      "Correct — ShipmentRow is memoized. React will now skip re-rendering it when props references haven't changed.",
    feedback_partial:
      "Almost — check that React.memo wraps the entire component definition, not just the function body.",
    feedback_wrong:
      "Pattern: `const ShipmentRow = React.memo(({ shipment, onSelect }: ShipmentRowProps) => { return <div>{shipment.id}</div>; });`",
    expected: `import React, { useMemo, useCallback } from 'react';

interface ShipmentRecord {
  id: string;
  destination: string;
  status: string;
}

interface ShipmentRowProps {
  shipment: ShipmentRecord;
  onSelect: () => void;
}

const ShipmentRow = React.memo(({ shipment, onSelect }: ShipmentRowProps) => {
  return (
    <div>
      <span>{shipment.id}</span>
      <span>{shipment.destination}</span>
      <button onClick={onSelect}>Select</button>
    </div>
  );
});`,
    analog_example: `const DriverCard = React.memo(({ driver, onHighlight }: DriverCardProps) => {
  return (
    <div>
      <span>{driver.name}</span>
      <button onClick={onHighlight}>Highlight</button>
    </div>
  );
});`,
    deepDiveLabel:
      "React.memo is on ShipmentRow — but it still re-renders on every parent render. What went wrong?",
    deepDive: {
      hook: "You wrap ShipmentRow in React.memo. You open React DevTools Profiler, click a filter input above the list, and watch every row highlight in the profiler — all re-rendered. React.memo is there. The shipment data hasn't changed. You haven't touched any row's state.\n\nYou read the docs again. React.memo checks props. Props are the same. It should skip. Why isn't it skipping?\n\nThen you look at the parent's render function: `<ShipmentRow onSelect={() => handleSelect(s.id)} />`. There it is.",
      pain: "⚠️ **Lesson:** React.memo is on the component. The data prop hasn't changed. But the component re-renders anyway. The cause is a prop that looks stable but isn't. Which prop, and why?",
      mentalModel:
        "**Mental model — the Gatekeeper and the Key.**\n\nReact.memo is a gatekeeper. Before letting the component re-render, it checks the keys: 'Are all props the same as last time?' It checks by reference — it holds up the old key and the new key and asks 'are these the same object?'\n\nAn inline arrow function `() => handleSelect(s.id)` is a new object every time the parent renders. The gatekeeper holds up the old arrow function and the new one — different objects, even though they do the same thing. The check fails. The gate opens. The row re-renders.\n\nuseCallback is how you give the gatekeeper the same key each time, so it can do its job.",
      discover: `**Pattern — what defeats React.memo:**
\`\`\`tsx
// ❌ inline arrow — new function reference every parent render
<ShipmentRow
  shipment={s}
  onSelect={() => handleSelect(s.id)}  // new arrow every render
/>

// ❌ inline object — new object reference every parent render
<ShipmentRow
  shipment={{ id: s.id, destination: s.destination }}  // new object every render
  onSelect={handleSelect}
/>

// ✅ stable prop references — React.memo can skip re-render
const handleSelect = useCallback(() => onSelect(s.id), [s.id, onSelect]);
<ShipmentRow shipment={s} onSelect={handleSelect} />
\`\`\`
- React.memo compares by reference, not by value
- any prop that is a new object or function each render defeats it
- primitives (string, number, boolean) are compared by value — they never cause this issue`,
      quickRules: `**Quick rules:**
- ✅ React.memo checks all props shallowly — one unstable prop defeats the whole memo
- ✅ primitive props (string, number, boolean) are stable by value — no action needed
- ✅ object and function props must be stabilised with useMemo or useCallback respectively
- ❌ don't assume React.memo is working — use the Profiler to confirm skipped renders
- ❌ don't wrap every component in React.memo — only components that are expensive and receive stable props`,
      watchOut:
        "👀 **Watch out:** Wrapping a child in React.memo without stabilising its function props is the most common React performance mistake. The component is wrapped, the developer assumes re-renders are fixed, and the profiler still shows every row re-rendering on every keystroke. React.memo is necessary but not sufficient — the props it checks must also be stable.",
      dryRun:
        "🔁 **Think:** You have `<ShipmentRow shipment={s} onSelect={handleSelect} />` where s is an item from a `.map()` over the shipments array. The parent adds an unrelated piece of state — a `sidebarOpen` boolean. sidebarOpen changes. The parent re-renders. shipments hasn't changed — the same array reference. Does `s` in the map have the same reference as before? Does `handleSelect` have the same reference if it's defined with useCallback in the parent? Which props to ShipmentRow are now stable, and which might not be?",
      build:
        "**Learning focus:** React.memo checks prop references shallowly — one new function or object reference in any prop defeats it entirely, which is why stabilising function props with useCallback is required for React.memo to actually skip renders.",
    },
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 5",
    paal: "Define the ShipmentList component. Inside it, create a stable handleSelect handler using useCallback that calls a passed-in onSelectShipment prop with the shipment id.",
    hint: "handleSelect needs to close over onSelectShipment. The dependency array includes onSelectShipment — it's a prop and could change.",
    example_code: `const handleHighlight = useCallback((id: string) => {
  onHighlight(id);
}, [onHighlight]);`,
    think_prompt:
      "handleSelect will be passed to every ShipmentRow as onSelect. What happens to every ShipmentRow's React.memo check if handleSelect is an inline arrow instead of a useCallback?",
    mc_options: [
      "Every ShipmentRow re-renders — inline arrows are new references each render, defeating React.memo",
      "Only ShipmentRows whose shipment data changed re-render — React.memo checks each prop independently",
      "No ShipmentRows re-render — React.memo's shallow check passes for the shipment object prop",
    ],
    mc_correct_option:
      "Every ShipmentRow re-renders — inline arrows are new references each render, defeating React.memo",
    mc_anchor:
      "React.memo checks ALL props. If any one prop has a new reference, the check fails and the component re-renders. An inline arrow function is always a new reference — so every row re-renders on every parent render, regardless of whether shipment data changed.",
    why_this_matters:
      "In a fleet dashboard with 200 shipment rows, a single state change in the parent — a search query update, a filter toggle — triggers 200 ShipmentRow re-renders if the handler isn't stabilised. useCallback is what turns 200 re-renders into 0 when the data hasn't changed.",
    answer_keywords: [
      "useCallback",
      "handleSelect",
      "onSelectShipment",
      "ShipmentList",
    ],
    evaluate: evalLesson47Step2,
    seed_code: `import React, { useMemo, useCallback } from 'react';

interface ShipmentRecord {
  id: string;
  destination: string;
  status: string;
}

interface ShipmentRowProps {
  shipment: ShipmentRecord;
  onSelect: () => void;
}

const ShipmentRow = React.memo(({ shipment, onSelect }: ShipmentRowProps) => {
  return (
    <div>
      <span>{shipment.id}</span>
      <span>{shipment.destination}</span>
      <button onClick={onSelect}>Select</button>
    </div>
  );
});`,
    starter_code: `import React, { useMemo, useCallback } from 'react';

interface ShipmentRecord {
  id: string;
  destination: string;
  status: string;
}

interface ShipmentRowProps {
  shipment: ShipmentRecord;
  onSelect: () => void;
}

const ShipmentRow = React.memo(({ shipment, onSelect }: ShipmentRowProps) => {
  return (
    <div>
      <span>{shipment.id}</span>
      <span>{shipment.destination}</span>
      <button onClick={onSelect}>Select</button>
    </div>
  );
});

interface ShipmentListProps {
  shipments: ShipmentRecord[];
  onSelectShipment: (id: string) => void;
}

const ShipmentList = ({ shipments, onSelectShipment }: ShipmentListProps) => {
  // create handleSelect with useCallback — calls onSelectShipment
  // it doesn't need a shipment id here: each row will receive its own bound handler
  const handleSelect = /* your useCallback here */;

  return <ul />;
};`,
    feedback_correct:
      "Correct — handleSelect is stable. Every ShipmentRow now receives the same function reference across renders where onSelectShipment hasn't changed.",
    feedback_partial:
      "Check the dependency array — does it include onSelectShipment? If that prop changes, handleSelect needs to update too.",
    feedback_wrong:
      "Pattern: `const handleSelect = useCallback(() => { onSelectShipment(/* id */); }, [onSelectShipment]);`",
    expected: `import React, { useMemo, useCallback } from 'react';

interface ShipmentRecord {
  id: string;
  destination: string;
  status: string;
}

interface ShipmentRowProps {
  shipment: ShipmentRecord;
  onSelect: () => void;
}

const ShipmentRow = React.memo(({ shipment, onSelect }: ShipmentRowProps) => {
  return (
    <div>
      <span>{shipment.id}</span>
      <span>{shipment.destination}</span>
      <button onClick={onSelect}>Select</button>
    </div>
  );
});

interface ShipmentListProps {
  shipments: ShipmentRecord[];
  onSelectShipment: (id: string) => void;
}

const ShipmentList = ({ shipments, onSelectShipment }: ShipmentListProps) => {
  const handleSelect = useCallback((id: string) => {
    onSelectShipment(id);
  }, [onSelectShipment]);

  return <ul />;
};`,
    analog_example: `const handleHighlight = useCallback((id: string) => {
  onHighlightDriver(id);
}, [onHighlightDriver]);`,
    deepDiveLabel:
      "handleSelect is stable — but each ShipmentRow needs a different id. How do you pass the id without creating a new arrow function per row?",
    deepDive: {
      hook: "handleSelect is `(id: string) => void`. Each ShipmentRow's onSelect is typed as `() => void` — no arguments. You need to bind the shipment id somehow. Your first instinct: `onSelect={() => handleSelect(s.id)}` — an inline wrapper per row. It works. But now you've created a new arrow function for every row on every render. React.memo is defeated again.",
      pain: "⚠️ **Lesson:** handleSelect accepts an id argument. ShipmentRow's onSelect prop expects no arguments. The obvious fix — an inline wrapper — defeats React.memo. What's the approach that keeps the row references stable while binding the id?",
      mentalModel:
        "**Mental model — Bind at the Right Level.**\n\nThe id binding problem has two locations: the list level and the row level. Binding at the list level with an inline arrow creates a new function per row per render. Binding at the row level — inside ShipmentRow itself — keeps the list's prop stable. The row's button can call `onSelect(shipment.id)` internally, and onSelect stays as a stable `() => void` from the parent.\n\nAlternatively: if each row truly needs a separately bound handler, you can use a Map of useCallback results — but that's a later pattern. For now, the cleanest solution is to move the id binding inside the row, closer to the data.",
      discover: `**Pattern — binding id without defeating React.memo:**
\`\`\`tsx
// ❌ inline wrapper per row — new function every parent render
{shipments.map(s => (
  <ShipmentRow
    key={s.id}
    shipment={s}
    onSelect={() => handleSelect(s.id)}  // new arrow every render
  />
))}

// ✅ pass handleSelect directly — ShipmentRow calls it with the id internally
{shipments.map(s => (
  <ShipmentRow
    key={s.id}
    shipment={s}
    onSelect={handleSelect}  // stable reference
  />
))}

// inside ShipmentRow:
// <button onClick={() => onSelect(shipment.id)}>Select</button>
// ← the inline arrow is inside the memoized component — it's only recreated when ShipmentRow re-renders

// ✅ alternative: change onSelect prop type to accept the id
// interface ShipmentRowProps { onSelect: (id: string) => void }
// then: <ShipmentRow onSelect={handleSelect} />  (types now align)
\`\`\``,
      quickRules: `**Quick rules:**
- ✅ pass stable function references to React.memo children — bind arguments inside the child or change the prop signature
- ✅ an inline arrow inside a memoized child is fine — it's only recreated when that child re-renders
- ❌ never bind arguments in an inline wrapper at the list level — it creates a new function per row per render
- ❌ don't over-engineer: if the list is small and re-renders are cheap, stability may not matter`,
      watchOut:
        "👀 **Watch out:** The id-binding problem is where most useMemo + useCallback setups fall apart. Everything is memoized correctly except for one inline `() => handleFn(s.id)` in the map. The profiler still shows every row re-rendering. The fix is always: move the binding inside the child, or change the prop type to accept the id so the handler can be passed directly.",
      dryRun:
        "🔁 **Think:** ShipmentRow's onSelect is `(id: string) => void`. You pass `onSelect={handleSelect}` — stable, no wrapper. Inside ShipmentRow, the button calls `onClick={() => onSelect(shipment.id)}`. The parent state changes — a filter input updates. ShipmentRow's React.memo check runs. onSelect is the same reference (stable via useCallback). shipment is the same reference (same array, same object). Does ShipmentRow re-render? Now: what if the inline arrow inside ShipmentRow is creating a new reference — does that matter, since ShipmentRow is already not re-rendering?",
      build:
        "**Learning focus:** Binding a row id to a stable handler must happen inside the memoized child or via a matching prop signature — an inline wrapper at the list level creates a new function reference per row per render and defeats React.memo.",
    },
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 5",
    paal: "Add a useMemo call inside ShipmentList that sorts the shipments array by destination alphabetically. Store the result in sortedShipments.",
    hint: "Sort on a copy — `.slice().sort(...)`. The dependency array has one entry: shipments.",
    example_code: `const sortedItems = useMemo(
  () => [...items].sort((a, b) => a.zone.localeCompare(b.zone)),
  [items]
);`,
    think_prompt:
      "Without useMemo, the sort runs on every ShipmentList render. What specific renders would that include that useMemo would eliminate?",
    mc_options: [
      "Renders caused by a state change that has nothing to do with shipments — sortedShipments would recompute unnecessarily",
      "Renders caused by new shipments arriving — sortedShipments always needs to recompute for those",
      "Renders caused by ShipmentRow clicking — child events never cause parent re-renders",
    ],
    mc_correct_option:
      "Renders caused by a state change that has nothing to do with shipments — sortedShipments would recompute unnecessarily",
    mc_anchor:
      "useMemo prevents the sort from running on parent re-renders that don't change shipments — a filter toggle, a sidebar open, a search query update. It still runs when shipments actually changes. That's the contract: recompute only when the source changes.",
    why_this_matters:
      "A sort on 500 shipments is O(n log n) — measurable. If the parent re-renders on every keystroke in a search box and the sort runs each time, you're doing expensive work on every character the user types. useMemo gates that work behind the only event that should trigger it: a change to the shipments data.",
    answer_keywords: [
      "useMemo",
      "sortedShipments",
      "sort",
      "destination",
      "[shipments]",
    ],
    evaluate: evalLesson47Step3,
    seed_code: `import React, { useMemo, useCallback } from 'react';

interface ShipmentRecord {
  id: string;
  destination: string;
  status: string;
}

interface ShipmentRowProps {
  shipment: ShipmentRecord;
  onSelect: () => void;
}

const ShipmentRow = React.memo(({ shipment, onSelect }: ShipmentRowProps) => {
  return (
    <div>
      <span>{shipment.id}</span>
      <span>{shipment.destination}</span>
      <button onClick={onSelect}>Select</button>
    </div>
  );
});

interface ShipmentListProps {
  shipments: ShipmentRecord[];
  onSelectShipment: (id: string) => void;
}

const ShipmentList = ({ shipments, onSelectShipment }: ShipmentListProps) => {
  const handleSelect = useCallback((id: string) => {
    onSelectShipment(id);
  }, [onSelectShipment]);

  return <ul />;
};`,
    starter_code: `import React, { useMemo, useCallback } from 'react';

interface ShipmentRecord {
  id: string;
  destination: string;
  status: string;
}

interface ShipmentRowProps {
  shipment: ShipmentRecord;
  onSelect: () => void;
}

const ShipmentRow = React.memo(({ shipment, onSelect }: ShipmentRowProps) => {
  return (
    <div>
      <span>{shipment.id}</span>
      <span>{shipment.destination}</span>
      <button onClick={onSelect}>Select</button>
    </div>
  );
});

interface ShipmentListProps {
  shipments: ShipmentRecord[];
  onSelectShipment: (id: string) => void;
}

const ShipmentList = ({ shipments, onSelectShipment }: ShipmentListProps) => {
  const handleSelect = useCallback((id: string) => {
    onSelectShipment(id);
  }, [onSelectShipment]);

  // sort shipments by destination alphabetically using useMemo
  // remember: sort mutates — use .slice() or spread first
  const sortedShipments = /* your useMemo here */;

  return <ul />;
};`,
    feedback_correct:
      "Correct — sort runs on a copy, memoized by shipments. The alphabetical order is stable across re-renders that don't change the data.",
    feedback_partial:
      "Check two things: are you sorting a copy (not mutating the original array), and is [shipments] in the dependency array?",
    feedback_wrong:
      "Pattern: `const sortedShipments = useMemo(() => shipments.slice().sort((a, b) => a.destination.localeCompare(b.destination)), [shipments]);`",
    expected: `import React, { useMemo, useCallback } from 'react';

interface ShipmentRecord {
  id: string;
  destination: string;
  status: string;
}

interface ShipmentRowProps {
  shipment: ShipmentRecord;
  onSelect: () => void;
}

const ShipmentRow = React.memo(({ shipment, onSelect }: ShipmentRowProps) => {
  return (
    <div>
      <span>{shipment.id}</span>
      <span>{shipment.destination}</span>
      <button onClick={onSelect}>Select</button>
    </div>
  );
});

interface ShipmentListProps {
  shipments: ShipmentRecord[];
  onSelectShipment: (id: string) => void;
}

const ShipmentList = ({ shipments, onSelectShipment }: ShipmentListProps) => {
  const handleSelect = useCallback((id: string) => {
    onSelectShipment(id);
  }, [onSelectShipment]);

  const sortedShipments = useMemo(
    () => shipments.slice().sort((a, b) => a.destination.localeCompare(b.destination)),
    [shipments]
  );

  return <ul />;
};`,
    analog_example: `const sortedZones = useMemo(
  () => zones.slice().sort((a, b) => a.name.localeCompare(b.name)),
  [zones]
);`,
    deepDiveLabel:
      "You have React.memo, useCallback, and useMemo all in one component — how do you decide which one to reach for first?",
    deepDive: {
      hook: "A new shipment list feature is slow. The PM files a performance ticket. You open the profiler. Every ShipmentRow highlights on every filter input keystroke. You have three tools. You reach for one and apply it. The rows still re-render. You apply a second. Better — some rows stop re-rendering. You apply the third. The rows finally go dark on filter keystrokes. You spent 40 minutes applying tools in the wrong order.\n\nThere's a diagnosis sequence that would have gotten you there in 10.",
      pain: "⚠️ **Lesson:** React.memo, useMemo, and useCallback each fix a different cause of unnecessary re-renders. Applying the wrong tool first wastes time and leaves the real cause unfixed. What is the correct diagnosis sequence?",
      mentalModel:
        "**Mental model — the Three Causes Framework.**\n\nEvery unnecessary re-render has exactly one root cause from this list:\n\n1. **The child isn't memoized** → React re-renders it on every parent render regardless of props. Fix: React.memo.\n\n2. **A function prop has a new reference** → React.memo is there but fails the prop check. Fix: useCallback on the handler in the parent.\n\n3. **A derived value passed as a prop has a new reference** → React.memo fails because a computed array or object is recreated on every render. Fix: useMemo on the derived value in the parent.\n\nThe sequence: (1) is the component memoized? If not, start there. (2) if it is memoized, which props are unstable? If a function — useCallback. If an object/array — useMemo. Never reach for useCallback before React.memo is confirmed. Never reach for useMemo before the failing prop is identified.",
      discover: `**Diagnosis sequence — applied:**
\`\`\`
ShipmentRow re-renders on every parent render despite data not changing.

Step 1: Is ShipmentRow wrapped in React.memo?
  No → wrap it. Re-run profiler.
  Yes → continue.

Step 2: Which prop has a new reference each render?
  Use React DevTools → Components → highlight renders → check prop values.

  onSelect is () => void — is it defined with useCallback?
    No → add useCallback in parent. Re-run profiler.
    Yes → check its dependency array for correctness.

  shipments (or a derived array) — is it defined with useMemo?
    No → add useMemo in parent. Re-run profiler.
    Yes → check its dependency array for correctness.

Step 3: Profile confirms ShipmentRow no longer highlights on filter keystrokes.
  Done.
\`\`\``,
      quickRules: `**Quick rules:**
- ✅ React.memo first — without it, prop stability doesn't matter
- ✅ then identify the unstable prop in the profiler — don't guess
- ✅ useCallback for function props, useMemo for object/array props
- ✅ profile after each change — confirm the fix before adding the next tool
- ❌ don't add all three at once — you won't know which one fixed it
- ❌ don't assume the problem is the expensive computation — it might be an unstable prop passing a cheap value`,
      watchOut:
        "👀 **Watch out:** The most common diagnostic mistake is reaching for useMemo first because 'the sort is expensive.' The sort being expensive doesn't mean it's the cause of the re-render. If ShipmentRow isn't wrapped in React.memo, a memoized sort still doesn't prevent the row from re-rendering — you've just added overhead. Profile first. The profiler tells you which component re-rendered and shows which props changed. Read it before writing code.",
      dryRun:
        "🔁 **Think:** A ShipmentList has React.memo on ShipmentRow, useCallback on handleSelect, and useMemo on sortedShipments. The parent adds a new state: `const [searchText, setSearchText] = useState('')`. Search text changes don't affect shipments or onSelectShipment. Walk through the three-cause checklist: (1) is ShipmentRow memoized? (2) does handleSelect have a new reference? (3) does sortedShipments have a new reference? Which, if any, rows re-render when searchText changes?",
      build:
        "**Learning focus:** Diagnosing unnecessary re-renders follows a fixed sequence — first confirm React.memo is present, then identify the unstable prop in the profiler, then apply useCallback or useMemo to the specific cause — never all three at once without profiling between each.",
    },
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 5",
    paal: "Replace the placeholder return in ShipmentList with JSX that maps sortedShipments to ShipmentRow components. Each row needs a key and an onSelect handler.",
    hint: "Use sortedShipments (the memoized array) in the .map(). Pass handleSelect directly to onSelect — no inline wrapper.",
    example_code: `return (
  <ul>
    {sortedItems.map(item => (
      <InventoryRow
        key={item.sku}
        item={item}
        onHighlight={handleHighlight}
      />
    ))}
  </ul>
);`,
    think_prompt:
      "You have sortedShipments and handleSelect. The map produces ShipmentRow components. What is the correct prop for the key, and should onSelect receive handleSelect or a wrapper?",
    mc_options: [
      "key={Math.random()}  — ensures uniqueness; onSelect={() => handleSelect(s.id)} to bind the id",
      "key={s.id}  — stable unique id; onSelect={handleSelect} to preserve the stable reference",
      "key={index}  — array index is always available; onSelect={handleSelect} to avoid new references",
    ],
    mc_correct_option:
      "key={s.id}  — stable unique id; onSelect={handleSelect} to preserve the stable reference",
    mc_anchor:
      "key={s.id} gives React a stable, unique identifier for each row. key={index} breaks when rows reorder. key={Math.random()} destroys and recreates every row on every render. For onSelect: passing handleSelect directly preserves the stable reference from useCallback. A wrapper defeats it.",
    why_this_matters:
      "key and onSelect are the two props where list rendering most often breaks silently. Wrong key causes React to unmount and remount rows instead of updating them. Inline wrapper on onSelect defeats React.memo on every row. Both are invisible in development on small lists and catastrophic in production on large ones.",
    answer_keywords: [
      "sortedShipments",
      "map",
      "key",
      "s.id",
      "ShipmentRow",
      "onSelect",
      "handleSelect",
    ],
    evaluate: evalLesson47Step4,
    seed_code: `import React, { useMemo, useCallback } from 'react';

interface ShipmentRecord {
  id: string;
  destination: string;
  status: string;
}

interface ShipmentRowProps {
  shipment: ShipmentRecord;
  onSelect: () => void;
}

const ShipmentRow = React.memo(({ shipment, onSelect }: ShipmentRowProps) => {
  return (
    <div>
      <span>{shipment.id}</span>
      <span>{shipment.destination}</span>
      <button onClick={onSelect}>Select</button>
    </div>
  );
});

interface ShipmentListProps {
  shipments: ShipmentRecord[];
  onSelectShipment: (id: string) => void;
}

const ShipmentList = ({ shipments, onSelectShipment }: ShipmentListProps) => {
  const handleSelect = useCallback((id: string) => {
    onSelectShipment(id);
  }, [onSelectShipment]);

  const sortedShipments = useMemo(
    () => shipments.slice().sort((a, b) => a.destination.localeCompare(b.destination)),
    [shipments]
  );

  return <ul />;
};`,
    starter_code: `import React, { useMemo, useCallback } from 'react';

interface ShipmentRecord {
  id: string;
  destination: string;
  status: string;
}

interface ShipmentRowProps {
  shipment: ShipmentRecord;
  onSelect: () => void;
}

const ShipmentRow = React.memo(({ shipment, onSelect }: ShipmentRowProps) => {
  return (
    <div>
      <span>{shipment.id}</span>
      <span>{shipment.destination}</span>
      <button onClick={onSelect}>Select</button>
    </div>
  );
});

interface ShipmentListProps {
  shipments: ShipmentRecord[];
  onSelectShipment: (id: string) => void;
}

const ShipmentList = ({ shipments, onSelectShipment }: ShipmentListProps) => {
  const handleSelect = useCallback((id: string) => {
    onSelectShipment(id);
  }, [onSelectShipment]);

  const sortedShipments = useMemo(
    () => shipments.slice().sort((a, b) => a.destination.localeCompare(b.destination)),
    [shipments]
  );

  return (
    <ul>
      {/* map sortedShipments to ShipmentRow — key on s.id, onSelect={handleSelect} directly */}
    </ul>
  );
};`,
    feedback_correct:
      "Clean — sortedShipments as the source, key on the stable id, handleSelect passed directly. The memoization chain is intact end to end.",
    feedback_partial:
      "Check two things: is the key using s.id (not index or Math.random()), and is onSelect receiving the reference directly (not wrapped in an arrow)?",
    feedback_wrong:
      "Pattern: `{sortedShipments.map(s => <ShipmentRow key={s.id} shipment={s} onSelect={handleSelect} />)}`",
    expected: `import React, { useMemo, useCallback } from 'react';

interface ShipmentRecord {
  id: string;
  destination: string;
  status: string;
}

interface ShipmentRowProps {
  shipment: ShipmentRecord;
  onSelect: () => void;
}

const ShipmentRow = React.memo(({ shipment, onSelect }: ShipmentRowProps) => {
  return (
    <div>
      <span>{shipment.id}</span>
      <span>{shipment.destination}</span>
      <button onClick={onSelect}>Select</button>
    </div>
  );
});

interface ShipmentListProps {
  shipments: ShipmentRecord[];
  onSelectShipment: (id: string) => void;
}

const ShipmentList = ({ shipments, onSelectShipment }: ShipmentListProps) => {
  const handleSelect = useCallback((id: string) => {
    onSelectShipment(id);
  }, [onSelectShipment]);

  const sortedShipments = useMemo(
    () => shipments.slice().sort((a, b) => a.destination.localeCompare(b.destination)),
    [shipments]
  );

  return (
    <ul>
      {sortedShipments.map(s => (
        <ShipmentRow
          key={s.id}
          shipment={s}
          onSelect={handleSelect}
        />
      ))}
    </ul>
  );
};`,
    analog_example: `return (
  <ul>
    {sortedZones.map(zone => (
      <ZoneCard
        key={zone.id}
        zone={zone}
        onHighlight={handleHighlight}
      />
    ))}
  </ul>
);`,
    deepDiveLabel:
      "key={index} works and has no TypeScript error — so when does it actually break, and why?",
    deepDive: {
      hook: "Your ShipmentList renders 10 rows with key={index}. Everything works. A new shipment arrives at the top of the sorted list — it now has index 0. React compares the previous index-0 row with the new index-0 row. They have different data. React updates the component in place — it doesn't unmount and remount because the key is the same (0). This sounds fine. But the row at index 0 had local state: an `isExpanded` boolean set to true. React kept the component — so it kept the `isExpanded: true`. The new shipment now shows as expanded, even though the user never expanded it.",
      pain: "⚠️ **Lesson:** key={index} causes React to match DOM nodes by position rather than identity. When rows reorder, React updates the existing component instances in place — carrying over their local state. Why is this a problem, and what key value fixes it?",
      mentalModel:
        "**Mental model — the Name Tag.**\n\nReact uses key as a name tag. When a list re-renders, React matches old name tags to new name tags. If the tags match, the component instance is reused — local state preserved. If no match, the component is unmounted and a fresh one is mounted.\n\nkey={index} gives every row a number name tag. When rows reorder, the number tags stay in position — React reuses the wrong instances. key={s.id} gives every row a data-identity name tag. When rows reorder, the identity tags travel with the data — React unmounts rows that disappeared and mounts rows that are new, preserving state exactly where it belongs.",
      discover: `**Pattern — key choices:**
\`\`\`tsx
// ❌ key={index} — breaks when rows reorder, insert, or delete
{shipments.map((s, index) => (
  <ShipmentRow key={index} shipment={s} />  // index 0 always goes to the first DOM node
))}

// ❌ key={Math.random()} — every row unmounts and remounts on every render
{shipments.map(s => (
  <ShipmentRow key={Math.random()} shipment={s} />  // no stable identity
))}

// ✅ key={s.id} — stable identity tied to the data
{shipments.map(s => (
  <ShipmentRow key={s.id} shipment={s} />  // s.id travels with s through reorders
))}
\`\`\`
- key must be stable across renders (not computed at render time)
- key must be unique within the list (not globally)
- key must identify the data item, not the position`,
      quickRules: `**Quick rules:**
- ✅ always key on a stable unique field from the data — id, uuid, slug
- ✅ key is local to the list — the same id can be used as a key in two different lists
- ❌ never key on index if the list can reorder, insert, or delete items
- ❌ never key on Math.random() or Date.now() — new value every render means remount every render
- ❌ don't use key as a prop inside the component — React does not pass key to the component`,
      watchOut:
        "👀 **Watch out:** key={index} is dangerous specifically for lists that can reorder — and sorted lists always reorder when new items arrive. If you sort by destination alphabetically and a new shipment to 'Auckland' arrives, the entire list shifts. Every index changes. Every component instance is reassigned to the wrong data. Local state (expanded state, input focus, animation progress) is now attached to the wrong rows.",
      dryRun:
        "🔁 **Think:** You have 3 shipments sorted alphabetically: [Boston, Chicago, Dallas]. Each row has local `isExpanded` state. Boston and Chicago are expanded. A new shipment to Atlanta arrives. The sorted list becomes [Atlanta, Boston, Chicago, Dallas]. With key={index}: which component instances does React reuse for Boston and Chicago? What are their isExpanded states after the reorder? With key={s.id}: what happens to the Boston and Chicago instances?",
      build:
        "**Learning focus:** key must identify the data item, not the position — key={index} causes React to reassign component instances (and their local state) to different data when the list reorders, which is silent, hard to debug, and avoidable with a stable id.",
    },
  },
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 5",
    paal: "Export ShipmentList as the default export.",
    hint: "One line — export default followed by the component name.",
    example_code: `export default ZoneList;`,
    think_prompt:
      "The full memoized list is complete. What is the single export statement that makes ShipmentList the default import from this file?",
    mc_options: [
      "exports.ShipmentList = ShipmentList  — CommonJS named export",
      "export { ShipmentList as default }  — named export with alias",
      "export default ShipmentList  — standard default export",
    ],
    mc_correct_option: "export default ShipmentList  — standard default export",
    mc_anchor:
      "All three syntaxes produce a default export, but `export default ComponentName` is the idiomatic React convention — readable, consistent, and what import auto-completers expect.",
    why_this_matters:
      "A component that can't be imported is a component that can't be tested, lazy-loaded, or used in another module. The export statement is the last link in the chain — and it needs to be the right kind for the rest of the toolchain to work correctly.",
    answer_keywords: ["export", "default", "ShipmentList"],
    evaluate: evalLesson47Step5,
    seed_code: `import React, { useMemo, useCallback } from 'react';

interface ShipmentRecord {
  id: string;
  destination: string;
  status: string;
}

interface ShipmentRowProps {
  shipment: ShipmentRecord;
  onSelect: () => void;
}

const ShipmentRow = React.memo(({ shipment, onSelect }: ShipmentRowProps) => {
  return (
    <div>
      <span>{shipment.id}</span>
      <span>{shipment.destination}</span>
      <button onClick={onSelect}>Select</button>
    </div>
  );
});

interface ShipmentListProps {
  shipments: ShipmentRecord[];
  onSelectShipment: (id: string) => void;
}

const ShipmentList = ({ shipments, onSelectShipment }: ShipmentListProps) => {
  const handleSelect = useCallback((id: string) => {
    onSelectShipment(id);
  }, [onSelectShipment]);

  const sortedShipments = useMemo(
    () => shipments.slice().sort((a, b) => a.destination.localeCompare(b.destination)),
    [shipments]
  );

  return (
    <ul>
      {sortedShipments.map(s => (
        <ShipmentRow
          key={s.id}
          shipment={s}
          onSelect={handleSelect}
        />
      ))}
    </ul>
  );
};`,
    starter_code: `import React, { useMemo, useCallback } from 'react';

interface ShipmentRecord {
  id: string;
  destination: string;
  status: string;
}

interface ShipmentRowProps {
  shipment: ShipmentRecord;
  onSelect: () => void;
}

const ShipmentRow = React.memo(({ shipment, onSelect }: ShipmentRowProps) => {
  return (
    <div>
      <span>{shipment.id}</span>
      <span>{shipment.destination}</span>
      <button onClick={onSelect}>Select</button>
    </div>
  );
});

interface ShipmentListProps {
  shipments: ShipmentRecord[];
  onSelectShipment: (id: string) => void;
}

const ShipmentList = ({ shipments, onSelectShipment }: ShipmentListProps) => {
  const handleSelect = useCallback((id: string) => {
    onSelectShipment(id);
  }, [onSelectShipment]);

  const sortedShipments = useMemo(
    () => shipments.slice().sort((a, b) => a.destination.localeCompare(b.destination)),
    [shipments]
  );

  return (
    <ul>
      {sortedShipments.map(s => (
        <ShipmentRow
          key={s.id}
          shipment={s}
          onSelect={handleSelect}
        />
      ))}
    </ul>
  );
};

// export ShipmentList as the default export`,
    feedback_correct:
      "Complete — ShipmentList exported. React.memo on the row, useCallback on the handler, useMemo on the sort. The full memoization chain is in place.",
    feedback_partial:
      "Almost — make sure it's `export default ShipmentList`, not a named export.",
    feedback_wrong:
      "Add `export default ShipmentList;` as the last line of the file.",
    expected: `import React, { useMemo, useCallback } from 'react';

interface ShipmentRecord {
  id: string;
  destination: string;
  status: string;
}

interface ShipmentRowProps {
  shipment: ShipmentRecord;
  onSelect: () => void;
}

const ShipmentRow = React.memo(({ shipment, onSelect }: ShipmentRowProps) => {
  return (
    <div>
      <span>{shipment.id}</span>
      <span>{shipment.destination}</span>
      <button onClick={onSelect}>Select</button>
    </div>
  );
});

interface ShipmentListProps {
  shipments: ShipmentRecord[];
  onSelectShipment: (id: string) => void;
}

const ShipmentList = ({ shipments, onSelectShipment }: ShipmentListProps) => {
  const handleSelect = useCallback((id: string) => {
    onSelectShipment(id);
  }, [onSelectShipment]);

  const sortedShipments = useMemo(
    () => shipments.slice().sort((a, b) => a.destination.localeCompare(b.destination)),
    [shipments]
  );

  return (
    <ul>
      {sortedShipments.map(s => (
        <ShipmentRow
          key={s.id}
          shipment={s}
          onSelect={handleSelect}
        />
      ))}
    </ul>
  );
};

export default ShipmentList;`,
    analog_example: `export default ZoneList;`,
    deepDiveLabel:
      "The three optimizations are all in place — how do you know in production whether they're actually helping?",
    deepDive: {
      hook: "You've applied React.memo, useCallback, and useMemo. In development everything feels fast. You ship. A week later a user on an older Android device reports the shipment list is sluggish when they search. You add the same optimizations to the search results list. No improvement. You check the profiler — it was never the list. It was a 1200ms network request re-triggering a state update that cascaded through an unrelated component tree. The optimization work you did was real — it just wasn't solving the actual bottleneck.",
      pain: "⚠️ **Lesson:** You've optimized correctly but you can't tell whether the optimization is the bottleneck fix or expensive overhead with no benefit. How do you measure the impact of memoization in production?",
      mentalModel:
        "**Mental model — Measure, Don't Guess.**\n\nPerformance optimization is a feedback loop, not a one-time action. The loop:\n\n1. Observe — use React DevTools Profiler in development to identify which components re-render on which interactions\n2. Hypothesize — identify the cause (unmemoized child, unstable prop, expensive derivation)\n3. Fix — apply the correct tool (React.memo, useCallback, useMemo)\n4. Verify — re-run the profiler to confirm the targeted re-renders are eliminated\n5. Measure in production — use Web Vitals (Interaction to Next Paint, Total Blocking Time) to confirm user-facing improvement\n\nSkipping step 4 means you don't know if your fix worked. Skipping step 5 means you optimized a development artifact that doesn't represent real user hardware.",
      discover: `**Tooling for re-render diagnosis:**
\`\`\`
React DevTools Profiler:
  - Record → interact → stop
  - Blue = component rendered, grey = skipped (React.memo worked)
  - Click a rendered component → "Why did this render?" shows which prop changed
  - Flame chart shows render duration per component

React DevTools Components:
  - Highlight updates when components render (Settings → General)
  - Shows real-time which components flash on each interaction

Web Vitals (production):
  - INP (Interaction to Next Paint) — captures click-to-response delay
  - TBT (Total Blocking Time) — captures JS thread blocking
  - Use Lighthouse or web-vitals npm package to collect in real sessions

console.log pattern (quick dev check):
  const ShipmentRow = React.memo(({ shipment }) => {
    console.log('ShipmentRow rendered:', shipment.id);
    return <div>...</div>;
  });
  // If this logs on a filter change that doesn't affect shipments, memo isn't working
\`\`\``,
      quickRules: `**Quick rules:**
- ✅ profile before optimizing — don't add React.memo to every component speculatively
- ✅ use "Why did this render?" in DevTools to identify the exact unstable prop
- ✅ verify in DevTools that the re-render is eliminated after each fix
- ✅ measure INP in production to confirm user-facing improvement
- ❌ don't rely on "feels fast" in development — development mode runs React in a slower instrumented mode
- ❌ don't add all three optimizations and declare victory — profile each one individually`,
      watchOut:
        "👀 **Watch out:** The most expensive optimization error is optimizing the wrong thing. React.memo on a component that renders in 0.3ms and is called once per user interaction has zero measurable impact. React.memo on a component that renders in 8ms and is called 200 times per keystroke saves 1.6 seconds per keystroke. Profile first. The number that matters is render count × render duration.",
      dryRun:
        "🔁 **Think:** You open the profiler, record a filter input change, and see ShipmentRow rendering 0 times — all rows are grey. You've confirmed React.memo is working. But the UI still feels sluggish. The profiler shows ShipmentList itself re-rendering in 180ms. useMemo's sort is listed as 170ms of that. shipments has 5,000 items. What should you investigate next — and is useMemo helping or hurting here?",
      build:
        "**Learning focus:** Applying the three memoization tools correctly requires profiling before and after each change — 'feels fast' in development is not evidence, and React DevTools Profiler's 'Why did this render?' is the only reliable way to confirm an optimization is working.",
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
  lessonNum: 47,
  title: "Identifying Re-renders — The Full Picture",
  shortName: "Re-renders — SHIPMENT LIST",
});
