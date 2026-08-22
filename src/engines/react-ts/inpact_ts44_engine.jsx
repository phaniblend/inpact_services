import createINPACTEngine from "../inpact_engine_shared";

function normalizeCode(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

function evalL44Step1(answer) {
  const raw = String(answer || "");
  const hasInterface = /interface\s+ShipmentRowProps\s*\{[\s\S]*?\}/m.test(raw);
  const hasShipmentId = /shipmentId\s*:\s*string/m.test(raw);
  const hasStatus = /status\s*:\s*/m.test(raw);
  const hasOnSelect = /onSelect\s*:\s*\(/m.test(raw);
  return hasInterface && hasShipmentId && hasStatus && hasOnSelect ? "correct"
    : hasInterface && hasShipmentId ? "partial" : "wrong";
}

function evalL44Step2(answer) {
  const raw = String(answer || "");
  const hasMemo = /React\.memo\s*\(/m.test(raw) || /memo\s*\(/m.test(raw);
  const hasComponent = /\(\s*\{\s*shipmentId\s*,\s*(?:status\s*,\s*)?(?:destination\s*,\s*)?onSelect/m.test(raw) ||
    /\(\s*\{\s*shipmentId/m.test(raw);
  return hasMemo && hasComponent ? "correct" : hasMemo || hasComponent ? "partial" : "wrong";
}

function evalL44Step3(answer) {
  const raw = String(answer || "");
  const hasConsoleLog = /console\.log/m.test(raw);
  const hasReturn = /return\s*\(/m.test(raw);
  const hasTr = /<tr/m.test(raw);
  const hasTd = /<td/m.test(raw);
  return hasReturn && hasTr && hasTd ? "correct" : hasReturn && hasTd ? "partial" : "wrong";
}

function evalL44Step4(answer) {
  const raw = String(answer || "");
  const hasComparator = /\(\s*prev\s*,\s*next\s*\)\s*=>/m.test(raw) ||
    /function\s+\w+\s*\(\s*prev\s*,\s*next\s*\)/m.test(raw);
  const hasComparison = /prev\.(?:shipmentId|status|destination)\s*===\s*next\.(?:shipmentId|status|destination)/m.test(raw);
  return hasComparator && hasComparison ? "correct" : hasComparator ? "partial" : "wrong";
}

function evalL44Step5(answer) {
  const raw = String(answer || "");
  const hasUseCallback = /useCallback\s*\(/m.test(raw);
  const hasDeps = /\[\s*\]/m.test(raw) || /\[\s*\w+\s*\]/m.test(raw);
  const hasUsage = /onSelect\s*=\s*\{?\s*handle/m.test(raw) || /onSelect\s*=\s*\{?\s*\w+Select/m.test(raw);
  return hasUseCallback && hasDeps ? "correct" : hasUseCallback ? "partial" : "wrong";
}

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "LESSON #44 (PERFORMANCE)",
      title: "React.memo",
      body: "Learn how React.memo prevents unnecessary re-renders by memoizing a component's output. You'll build a ShipmentRow that only re-renders when its own props change — and discover why the comparator and useCallback are required to make memo actually work.",
      usecase:
        "A shipment list with 500 rows. The operator selects one shipment. Without memo, all 500 rows re-render. With memo, only the selected row re-renders. That's the performance difference between a responsive dashboard and one that freezes on every interaction.",
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
        reason: "ShipmentRow renders a JSX table row. The dynamic className pattern from Lesson 1 Step 6 is used in Step 3 to apply a status class to the row.",
      },
      {
        lesson: 7,
        label: "Props + Interface",
        reason: "Step 1 defines ShipmentRowProps as a TypeScript interface with shipmentId, status, destination, and onSelect — the typed props pattern built in Lesson 7.",
      },
      {
        lesson: 8,
        label: "Optional Props + Defaults",
        reason: "The onSelect callback is typed as optional (onSelect?: ...) in Step 1, following the optional prop pattern from Lesson 8, and called with optional chaining in Step 3.",
      },
      {
        lesson: 10,
        label: "useState — Primitives",
        reason: "Step 5's parent component uses useState<string | null>(null) to track the selected shipment ID — the state that triggers re-renders memo is designed to prevent downstream.",
      },
      {
        lesson: 20,
        label: "Component Composition",
        reason: "Step 5 wires ShipmentRow inside a parent WarehouseList component. Understanding how parent state changes propagate to children — and why that causes all children to re-render — is the problem memo solves.",
      },
    ],
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Wrap a component in React.memo to skip re-renders when props are shallowly equal",
      "Understand why React.memo does not prevent re-renders caused by new function references",
      "Write a custom comparator to control exactly when memo allows a re-render",
      "Wrap callback props in useCallback so their reference is stable across parent re-renders",
      "Recognise when memo adds overhead instead of saving it",
    ],
  },

  // ── STEP 1 ────────────────────────────────────────────────────────────────
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 5",
    paal: "Define the ShipmentRowProps interface with: shipmentId: string, destination: string, status: 'active' | 'delayed' | 'delivered', and onSelect: (id: string) => void.",
    hint: "This is a standard props interface — the only new thing is the callback signature: a function that receives a string and returns void.",
    example_code: `interface LeaderboardRowProps {
  playerId: string;
  rank: number;
  score: number;
  onHighlight: (id: string) => void;
}`,
    think_prompt:
      "onSelect is typed as (id: string) => void. What does 'void' as a return type mean — and is it the same as returning undefined?",
    mc_options: [
      "void means the function must explicitly return undefined — returning nothing is a compile error",
      "void means the caller does not care about the return value — the function can return anything, but it will be ignored",
      "void means the function runs asynchronously — it fires and the caller moves on",
    ],
    mc_correct_option:
      "void means the caller does not care about the return value — the function can return anything, but it will be ignored",
    mc_anchor:
      "In TypeScript, `void` as a return type in a callback signature is a contract to the caller — 'I won't use whatever you return.' This is intentionally permissive: it lets you pass `() => console.log('selected')` (returns undefined), `() => someArray.push(id)` (returns number), or any other function. The type enforces that the caller ignores the return, not that the callee returns nothing.",
    why_this_matters:
      "Callback prop types like `(id: string) => void` are the standard contract for selection, click, and event handlers in enterprise component libraries. TypeScript's permissive void lets library consumers pass real functions (which often return values) without wrapping them.",
    answer_keywords: ["ShipmentRowProps", "shipmentId", "string", "destination", "status", "'active' | 'delayed' | 'delivered'", "onSelect", "(id: string) => void"],
    evaluate: evalL44Step1,
    seed_code: "",
    starter_code: `import React, { memo, useCallback, useState } from 'react';

// define ShipmentRowProps interface here`,
    feedback_correct:
      "Exactly — four typed fields, callback with the right signature. This interface is what memo will use to compare prev and next props.",
    feedback_partial:
      "Almost — check all four fields: shipmentId (string), destination (string), status (the union), onSelect (callback signature). All four must be present.",
    feedback_wrong:
      "Pattern: `interface ShipmentRowProps { shipmentId: string; destination: string; status: 'active' | 'delayed' | 'delivered'; onSelect: (id: string) => void; }`",
    expected: `import React, { memo, useCallback, useState } from 'react';

interface ShipmentRowProps {
  shipmentId: string;
  destination: string;
  status: 'active' | 'delayed' | 'delivered';
  onSelect: (id: string) => void;
}`,
    analog_example: `interface AuctionRowProps {
  itemId: string;
  description: string;
  currentBid: number;
  onBid: (id: string) => void;
}`,
    deepDiveLabel:
      "onSelect is (id: string) => void — but void isn't the same as undefined. Why does that distinction matter for memo?",
    deepDive: {
      hook: "You type onSelect as `(id: string) => boolean` in a props interface — meaning you expect the callback to confirm the selection was accepted. A consumer passes `() => someList.push(id)` — which returns a number (Array.push). TypeScript rejects it: number is not assignable to boolean. You change the type to void. Now the same function compiles — but now your ShipmentRow can't act on the return value. The type changed the contract, not the runtime behavior.",
      pain: "⚠️ **Lesson:** `void` in a callback type is more permissive than `undefined`. Why does this matter when typing event handler props — and how does it interact with memo's prop comparison?",
      mentalModel:
        "**Mental model: The Receipt Window.**\nWhen you hand something to a colleague and say 'no receipt needed' (void), they can give you one anyway — you just won't read it. TypeScript's void contract says 'I, the component, promise not to use whatever the callback returns'. The callback can return anything.\n- `undefined` = the window says 'bring me nothing back'\n- `void` = the window says 'bring me whatever, I'm not looking'\nFor memo: the callback's return type doesn't affect memoization — what matters is whether the callback's *reference* changes between renders, which depends on how the parent creates it.",
      discover: `// ✅ void — permissive, standard for event handlers
interface ShipmentRowProps {
  onSelect: (id: string) => void; // consumer can return undefined, number, bool — all fine
}

// ✅ A function returning a number satisfies (id: string) => void
const handleSelect = (id: string) => selectedIds.push(id); // returns number — void allows it

// ❌ undefined — too strict for most callbacks
interface ShipmentRowProps {
  onSelect: (id: string) => undefined; // consumer MUST return undefined — push() fails
}

// ✅ For memo: return type doesn't matter. Reference identity does.
// These are different references despite same logic — memo sees them as different props
const handler1 = (id: string) => console.log(id);
const handler2 = (id: string) => console.log(id);
Object.is(handler1, handler2); // false — different references, memo re-renders`,
      quickRules:
        "✅ Use `() => void` for event handler callback prop types — it's the standard\n✅ void allows consumers to pass any function, even ones that return values\n❌ Don't use `() => undefined` unless you genuinely need the consumer to return undefined\n✅ For memo: the callback's type doesn't affect memoization — its reference identity does\n✅ To stabilise callback references: wrap them in useCallback in the parent (Step 5 of this lesson)",
      watchOut:
        "👀 **Watch out:** A `() => void` prop type compiled correctly doesn't mean memo works. A new arrow function `(id) => handleSelect(id)` created on every parent render has a new reference each time — it satisfies `(id: string) => void` perfectly but causes memo to re-render on every parent render. Type correctness and memoization are orthogonal concerns.",
      dryRun:
        "🔁 **Think:** Your parent component renders `<ShipmentRow onSelect={(id) => setSelected(id)} />`. TypeScript: happy (void contract satisfied). React.memo: does ShipmentRow re-render when the parent re-renders for an unrelated reason? Is `(id) => setSelected(id)` the same reference across parent renders? What would you need to change to make memo actually skip the re-render?",
      build:
        "**Learning focus:** Define the ShipmentRowProps interface with the standard callback signature `(id: string) => void` — understanding that void is a permissive contract for the caller, not a constraint on the callee, and that reference identity (not type) is what memo uses to compare callback props.",
    },
  },

  // ── STEP 2 ────────────────────────────────────────────────────────────────
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 5",
    paal: "Wrap the ShipmentRow component definition in React.memo. The component receives ShipmentRowProps and currently returns null — the JSX comes in Step 3.",
    hint: "React.memo wraps the entire component function. You can write the component inline inside memo() or wrap a separately defined function.",
    example_code: `const AuctionRow = memo(({ itemId, currentBid, onBid }: AuctionRowProps) => {
  return null;
});`,
    think_prompt:
      "React.memo compares props shallowly. What does 'shallow comparison' mean for a prop that is an array or object?",
    mc_options: [
      "Shallow comparison checks every nested value inside objects and arrays recursively",
      "Shallow comparison checks reference identity — two different object instances are always 'not equal' even if they contain the same values",
      "Shallow comparison only works on primitive props — objects are always treated as changed",
    ],
    mc_correct_option:
      "Shallow comparison checks reference identity — two different object instances are always 'not equal' even if they contain the same values",
    mc_anchor:
      "Shallow comparison uses Object.is() on each prop value. For primitives (strings, numbers, booleans), this compares the value itself. For objects, arrays, and functions, it compares the reference — the memory address. Two separate `{ status: 'active' }` objects are not shallowly equal even if they contain identical data. This is why object and function props require special handling to benefit from memo.",
    why_this_matters:
      "Understanding shallow comparison is the mental model behind every memo optimization decision. Passing a new object literal `{ color: 'red' }` inline in JSX creates a new reference on every render — breaking memo silently. Every team that adopts memo must establish conventions around stable prop references.",
    answer_keywords: ["memo", "ShipmentRow", "ShipmentRowProps", "null"],
    evaluate: evalL44Step2,
    seed_code: `import React, { memo, useCallback, useState } from 'react';

interface ShipmentRowProps {
  shipmentId: string;
  destination: string;
  status: 'active' | 'delayed' | 'delivered';
  onSelect: (id: string) => void;
}`,
    starter_code: `import React, { memo, useCallback, useState } from 'react';

interface ShipmentRowProps {
  shipmentId: string;
  destination: string;
  status: 'active' | 'delayed' | 'delivered';
  onSelect: (id: string) => void;
}

// wrap the component in memo here — return null for now
const ShipmentRow = `,
    feedback_correct:
      "Exactly — memo wraps the component function. The shallow comparison is now active. Step 3 adds the actual JSX.",
    feedback_partial:
      "Close — is the component wrapped in memo() (not just defined as a regular component)? Does it receive ShipmentRowProps?",
    feedback_wrong:
      "Pattern: `const ShipmentRow = memo(({ shipmentId, destination, status, onSelect }: ShipmentRowProps) => { return null; });`",
    expected: `import React, { memo, useCallback, useState } from 'react';

interface ShipmentRowProps {
  shipmentId: string;
  destination: string;
  status: 'active' | 'delayed' | 'delivered';
  onSelect: (id: string) => void;
}

const ShipmentRow = memo(({ shipmentId, destination, status, onSelect }: ShipmentRowProps) => {
  return null;
});`,
    analog_example: `const AuctionRow = memo(({ itemId, currentBid, onBid }: AuctionRowProps) => {
  return null;
});`,
    deepDiveLabel:
      "memo uses shallow comparison by default — but what does Object.is() do with NaN, -0, and +0?",
    deepDive: {
      hook: "You have a ShipmentRow that receives a `delayHours: number` prop. In testing, you pass NaN to represent 'delay unknown'. You expect memo to skip the re-render because NaN === NaN is... wait. `NaN === NaN` is false in JavaScript. Does memo see NaN as always-changed and always re-render?",
      pain: "⚠️ **Lesson:** Object.is(NaN, NaN) is true — unlike ===. And Object.is(-0, +0) is false — unlike ===. Why does React use Object.is() instead of ===, and when does this difference matter for memo?",
      mentalModel:
        "**Mental model: The Identity Card vs The Values Test.**\n`===` asks 'are your values the same?' — but fails for NaN (a number that isn't equal to itself) and conflates -0 and +0.\n`Object.is()` asks 'are you literally the same thing?' — NaN is the same NaN (true), -0 and +0 are genuinely different values (false).\nReact chose Object.is() because it's the semantically correct definition of 'same value' — and a component whose only change is NaN → NaN should not re-render.",
      discover: `// Object.is() vs === — the cases that differ
NaN === NaN          // false (JS quirk)
Object.is(NaN, NaN)  // true — React treats NaN props as unchanged ✅

-0 === +0            // true (JS quirk)
Object.is(-0, +0)    // false — React treats -0 and +0 as different props

// Practical implications for memo
// This prop change does NOT trigger a re-render (NaN to NaN):
<ShipmentRow delayHours={NaN} /> // → <ShipmentRow delayHours={NaN} />

// This prop change DOES trigger a re-render (even though both are "zero"):
<ShipmentRow offset={-0} /> // → <ShipmentRow offset={+0} />

// For most shipping domain code: irrelevant.
// For financial/scientific dashboards with signed zeros: worth knowing.`,
      quickRules:
        "✅ React.memo uses Object.is() for prop comparison — semantically correct for value identity\n✅ Object.is(NaN, NaN) = true — NaN props do NOT trigger spurious re-renders\n✅ Object.is(-0, +0) = false — signed zero changes DO trigger re-renders\n❌ Don't assume === and memo's comparison are equivalent — they differ for NaN and signed zeros\n✅ For practical purposes: these edge cases rarely matter in UI code; the big memo issues are objects and functions",
      watchOut:
        "👀 **Watch out:** The NaN and signed zero edge cases are interesting but not the memo bugs you'll actually hit in production. The real culprits are: (1) inline object literals `style={{ color: 'red' }}` — new reference every render, (2) inline arrow functions `onClick={() => handler()}` — new reference every render, (3) new array instances `items={[...filteredItems]}` — new reference every render. These break memo for almost every team that doesn't know about them.",
      dryRun:
        "🔁 **Think:** You have a ShipmentRow with memo. The parent re-renders. The parent passes `status='active'` (same string, same value). Memo compares: Object.is('active', 'active') = true — no re-render. Now the parent passes `style={{ color: 'green' }}` (same visual, new object). Memo compares: Object.is({color:'green'}, {color:'green'}) — are these the same reference? Does ShipmentRow re-render?",
      build:
        "**Learning focus:** Wrap a component in React.memo to enable shallow prop comparison — understanding that shallow means reference identity for objects and functions, using Object.is() which differs from === for NaN and signed zeros.",
    },
  },

  // ── STEP 3 ────────────────────────────────────────────────────────────────
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 5",
    paal: "Add the JSX body to ShipmentRow: a <tr> with a className driven by status, three <td> elements showing shipmentId, destination, and status, and an onClick on the <tr> that calls onSelect(shipmentId). Add console.log('ShipmentRow rendered:', shipmentId) at the top of the component to make re-renders visible.",
    hint: "The console.log line is intentional — it's a render probe. In the exercise, watching the console tells you exactly when memo succeeds or fails to prevent a re-render.",
    example_code: `const AuctionRow = memo(({ itemId, currentBid, onBid }: AuctionRowProps) => {
  console.log('AuctionRow rendered:', itemId);
  return (
    <tr className={\`row--\${currentBid > 1000 ? 'hot' : 'normal'}\`} onClick={() => onBid(itemId)}>
      <td>{itemId}</td>
      <td>{currentBid}</td>
    </tr>
  );
});`,
    think_prompt:
      "The onClick is `() => onSelect(shipmentId)`. This is an arrow function created fresh inside the JSX return — every render creates a new reference. Does this affect memo?",
    mc_options: [
      "Yes — onClick is a new function reference every render, but it's internal to the component and doesn't affect memo's prop comparison",
      "No — memo compares incoming props, not what the component does internally with them. The onClick wrapping is inside the component.",
      "Yes — memo re-renders because it detects the internal onClick reference changed",
    ],
    mc_correct_option:
      "No — memo compares incoming props, not what the component does internally with them. The onClick wrapping is inside the component.",
    mc_anchor:
      "React.memo compares the *incoming* props — shipmentId, destination, status, onSelect — not what happens inside the component's render. The `() => onSelect(shipmentId)` wrapper is created inside ShipmentRow's render, but that doesn't trigger memo's comparison. The issue would be if *onSelect itself* (the prop passed in from the parent) is a new reference on every parent render — that's Step 5.",
    why_this_matters:
      "Understanding where memo's comparison boundary sits prevents the common mistake of optimising the wrong thing. Memo's job is at the prop boundary. Internal render logic — local variables, inline handlers, derived values — is always recreated on every render, memo or not.",
    answer_keywords: ["console.log", "ShipmentRow rendered", "tr", "className", "status", "td", "shipmentId", "destination", "onClick", "onSelect"],
    evaluate: evalL44Step3,
    seed_code: `import React, { memo, useCallback, useState } from 'react';

interface ShipmentRowProps {
  shipmentId: string;
  destination: string;
  status: 'active' | 'delayed' | 'delivered';
  onSelect: (id: string) => void;
}

const ShipmentRow = memo(({ shipmentId, destination, status, onSelect }: ShipmentRowProps) => {
  return null;
});`,
    starter_code: `import React, { memo, useCallback, useState } from 'react';

interface ShipmentRowProps {
  shipmentId: string;
  destination: string;
  status: 'active' | 'delayed' | 'delivered';
  onSelect: (id: string) => void;
}

const ShipmentRow = memo(({ shipmentId, destination, status, onSelect }: ShipmentRowProps) => {
  // add console.log render probe here
  return (
    // <tr> with status className, onClick calling onSelect(shipmentId)
    //   three <td> elements: shipmentId, destination, status
  );
});`,
    feedback_correct:
      "Exactly — render probe in place, JSX correct. Now you can watch the console and see which rows re-render when the parent's state changes.",
    feedback_partial:
      "Almost — check: is console.log present with 'ShipmentRow rendered' and the shipmentId? Does the tr have onClick calling onSelect(shipmentId)? Are all three tds present?",
    feedback_wrong:
      "Pattern: add `console.log('ShipmentRow rendered:', shipmentId);` then return a `<tr className={\\`row--${status}\\`} onClick={() => onSelect(shipmentId)}>` with three `<td>` children.",
    expected: `import React, { memo, useCallback, useState } from 'react';

interface ShipmentRowProps {
  shipmentId: string;
  destination: string;
  status: 'active' | 'delayed' | 'delivered';
  onSelect: (id: string) => void;
}

const ShipmentRow = memo(({ shipmentId, destination, status, onSelect }: ShipmentRowProps) => {
  console.log('ShipmentRow rendered:', shipmentId);
  return (
    <tr className={\`row--\${status}\`} onClick={() => onSelect(shipmentId)}>
      <td>{shipmentId}</td>
      <td>{destination}</td>
      <td>{status}</td>
    </tr>
  );
});`,
    analog_example: `const InventoryRow = memo(({ binId, quantity, onFlag }: InventoryRowProps) => {
  console.log('InventoryRow rendered:', binId);
  return (
    <tr className={\`bin--\${quantity < 10 ? 'low' : 'ok'}\`} onClick={() => onFlag(binId)}>
      <td>{binId}</td>
      <td>{quantity}</td>
    </tr>
  );
});`,
    deepDiveLabel:
      "console.log is a render probe — but React 18 runs effects twice in Strict Mode. Does it also double-render memoized components?",
    deepDive: {
      hook: "You open the app in development. Every ShipmentRow prints to the console twice on mount — 'ShipmentRow rendered: NX-1042' appears twice. You added memo, but memo isn't helping on mount. A colleague says React 18 Strict Mode double-invokes renders. You're now uncertain whether your memo is working at all — or whether the console is lying to you.",
      pain: "⚠️ **Lesson:** React 18 Strict Mode intentionally double-invokes render functions in development. Does this mean memo is broken — or is the double-render expected and harmless?",
      mentalModel:
        "**Mental model: The Rehearsal and the Performance.**\nStrict Mode is a rehearsal — React runs render twice to expose functions that have side effects they shouldn't (like writing to a database in render). The console.log fires in both runs.\nThe performance (production) only runs render once. Memo works correctly in both: it skips the second render on re-renders where props are equal. The double-mount is a development tool, not a memo failure.",
      discover: `// Development (Strict Mode): render probe fires twice on mount
// This is expected — React is stress-testing your component
console.log('ShipmentRow rendered:', shipmentId);
// → 'ShipmentRow rendered: NX-1042' (x2 on mount)

// But memo still works on subsequent re-renders:
// Parent state changes (unrelated to this row's props):
// → nothing logged — memo correctly skips the re-render ✅

// Production: no double-invoke, render probe fires once on mount
// Memo works identically

// How to verify memo is working in development:
// 1. Mount: see double log (expected, ignore)
// 2. Trigger a parent re-render (e.g. click another row)
// 3. If this row's props didn't change: NO log = memo working ✅
// 4. If this row's props did change: ONE log = correct re-render ✅`,
      quickRules:
        "✅ Strict Mode double-invokes renders in development — this is expected, not a bug\n✅ The double-render only happens in development and only on mount\n✅ To verify memo: trigger a *subsequent* re-render and check if the log fires\n❌ Don't remove Strict Mode to 'fix' the double-render — it's catching real bugs\n✅ Production mode: memo works without the Strict Mode rehearsal, single renders only",
      watchOut:
        "👀 **Watch out:** Never use console.log render probes to count renders in production — they create function closures that capture the prop values at render time, adding GC pressure in a list of 500+ rows. Remove render probes before shipping. Use React DevTools Profiler to measure re-renders in production builds.",
      dryRun:
        "🔁 **Think:** You have 100 ShipmentRow components rendered. An operator selects one row — the parent's selectedId state updates. Memo is active. How many console.log calls do you see in the console? Which rows print? Which rows are skipped by memo? Now imagine onSelect is defined inline in the parent without useCallback — how many rows print now?",
      build:
        "**Learning focus:** Add a console.log render probe and the JSX body — making re-renders visible so you can empirically verify whether memo is working before and after prop stabilisation.",
    },
  },

  // ── STEP 4 ────────────────────────────────────────────────────────────────
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 5",
    paal: "Add a custom comparator as the second argument to React.memo. The comparator should return true (skip re-render) when shipmentId, destination, AND status are all equal — and return false (allow re-render) otherwise. The onSelect reference is intentionally excluded from the comparison.",
    hint: "The comparator receives (prevProps, nextProps) and must return a boolean. Return true to skip the re-render, false to allow it.",
    example_code: `const AuctionRow = memo(
  ({ itemId, currentBid, onBid }: AuctionRowProps) => {
    return <tr>...</tr>;
  },
  (prev, next) =>
    prev.itemId === next.itemId && prev.currentBid === next.currentBid
);`,
    think_prompt:
      "The comparator intentionally excludes onSelect. This means memo will never re-render because of an onSelect change — even if onSelect is a completely new function. What assumption must hold for this to be safe?",
    mc_options: [
      "onSelect must always be the exact same function reference — if it ever changes logic, the comparator will skip the update and ShipmentRow will call the stale handler",
      "onSelect's logic must not depend on any state or props that change over time — or you need to ensure the comparator allows re-renders when onSelect changes",
      "Excluding onSelect is always unsafe — the comparator should never omit any prop",
    ],
    mc_correct_option:
      "onSelect's logic must not depend on any state or props that change over time — or you need to ensure the comparator allows re-renders when onSelect changes",
    mc_anchor:
      "Excluding onSelect from the comparator is a trade-off. It's safe when onSelect is a stable reference (created with useCallback with correct dependencies) that captures no stale values. It's unsafe when onSelect closes over state or props that change — the comparator skips the re-render and ShipmentRow calls a stale handler. This is exactly the stale closure problem, and Step 5 addresses it with useCallback.",
    why_this_matters:
      "Custom comparators are a sharp tool. They let you say 'this callback changing should never cause a row to re-render' — useful for performance when callbacks change frequently. But they require useCallback discipline in the parent to remain correct. Enterprise codebases that use custom comparators without useCallback conventions produce subtle, intermittent bugs.",
    answer_keywords: ["prev", "next", "shipmentId", "destination", "status", "===", "&&"],
    evaluate: evalL44Step4,
    seed_code: `import React, { memo, useCallback, useState } from 'react';

interface ShipmentRowProps {
  shipmentId: string;
  destination: string;
  status: 'active' | 'delayed' | 'delivered';
  onSelect: (id: string) => void;
}

const ShipmentRow = memo(({ shipmentId, destination, status, onSelect }: ShipmentRowProps) => {
  console.log('ShipmentRow rendered:', shipmentId);
  return (
    <tr className={\`row--\${status}\`} onClick={() => onSelect(shipmentId)}>
      <td>{shipmentId}</td>
      <td>{destination}</td>
      <td>{status}</td>
    </tr>
  );
});`,
    starter_code: `import React, { memo, useCallback, useState } from 'react';

interface ShipmentRowProps {
  shipmentId: string;
  destination: string;
  status: 'active' | 'delayed' | 'delivered';
  onSelect: (id: string) => void;
}

const ShipmentRow = memo(
  ({ shipmentId, destination, status, onSelect }: ShipmentRowProps) => {
    console.log('ShipmentRow rendered:', shipmentId);
    return (
      <tr className={\`row--\${status}\`} onClick={() => onSelect(shipmentId)}>
        <td>{shipmentId}</td>
        <td>{destination}</td>
        <td>{status}</td>
      </tr>
    );
  },
  // add comparator here: return true when shipmentId, destination, AND status are all equal
);`,
    feedback_correct:
      "Exactly — the comparator compares all three data props and deliberately excludes onSelect. Now even if onSelect gets a new reference on every parent render, ShipmentRow won't re-render for that reason alone.",
    feedback_partial:
      "Close — check: does the comparator compare all three data props (shipmentId, destination, AND status)? Does it return true when they're equal?",
    feedback_wrong:
      "Pattern: `(prev, next) => prev.shipmentId === next.shipmentId && prev.destination === next.destination && prev.status === next.status`",
    expected: `import React, { memo, useCallback, useState } from 'react';

interface ShipmentRowProps {
  shipmentId: string;
  destination: string;
  status: 'active' | 'delayed' | 'delivered';
  onSelect: (id: string) => void;
}

const ShipmentRow = memo(
  ({ shipmentId, destination, status, onSelect }: ShipmentRowProps) => {
    console.log('ShipmentRow rendered:', shipmentId);
    return (
      <tr className={\`row--\${status}\`} onClick={() => onSelect(shipmentId)}>
        <td>{shipmentId}</td>
        <td>{destination}</td>
        <td>{status}</td>
      </tr>
    );
  },
  (prev, next) =>
    prev.shipmentId === next.shipmentId &&
    prev.destination === next.destination &&
    prev.status === next.status
);`,
    analog_example: `const InventoryRow = memo(
  ({ binId, quantity, onFlag }: InventoryRowProps) => <tr>...</tr>,
  (prev, next) =>
    prev.binId === next.binId && prev.quantity === next.quantity
);`,
    deepDiveLabel:
      "The comparator returns true to SKIP re-renders — but that's the opposite of how shouldComponentUpdate worked. Why the inversion?",
    deepDive: {
      hook: "You come from a class component background. shouldComponentUpdate returned true to *allow* re-renders and false to *skip* them. You write a memo comparator that returns true when props changed — hoping to allow the re-render. The component stops re-rendering entirely. You've accidentally frozen it.",
      pain: "⚠️ **Lesson:** memo's comparator returns true to SKIP the re-render and false to ALLOW it — the opposite of shouldComponentUpdate. This is a production bug waiting to happen during any class-to-hooks migration.",
      mentalModel:
        "**Mental model: The Bouncer Logic.**\nshouldComponentUpdate: 'Should I update?' true = yes, come in.\nmemo comparator: 'Are these the same?' true = same, you don't need to come in — I'll use the cached version.\n- shouldComponentUpdate(prevProps, nextProps): return true = re-render, return false = skip\n- memo comparator(prevProps, nextProps): return true = skip (equal), return false = re-render (different)\nThe question being answered is different. ShouldComponentUpdate asks 'should I render?'. Memo's comparator asks 'are the props equal?'. Equal → skip. Not equal → render.",
      discover: `// memo comparator — return true = SKIP re-render (props are equal)
const ShipmentRow = memo(
  (props) => <tr>...</tr>,
  (prev, next) => prev.status === next.status // true = equal = skip ✅
);

// ❌ Common bug: inverted logic (thinking like shouldComponentUpdate)
const ShipmentRow = memo(
  (props) => <tr>...</tr>,
  (prev, next) => prev.status !== next.status // true = different = skip ❌ WRONG
  // This skips re-renders when status CHANGES — the component freezes on status changes
);

// shouldComponentUpdate equivalent (class components)
shouldComponentUpdate(prevProps, nextProps) {
  return prevProps.status !== nextProps.status; // true = ALLOW re-render when different
}`,
      quickRules:
        "✅ memo comparator: return true = skip (props are equal), return false = re-render (props differ)\n✅ shouldComponentUpdate: return true = allow re-render, return false = skip\n❌ Never invert memo comparator logic — it freezes the component on prop changes\n✅ Mnemonic: memo asks 'are they the same?' — true means same, skip the work\n✅ When in doubt, write it out: `prev.x === next.x && prev.y === next.y` — explicit is harder to invert accidentally",
      watchOut:
        "👀 **Watch out:** A comparator that always returns true (`() => true`) completely freezes the component — it never re-renders for any prop change. A comparator that always returns false (`() => false`) defeats memo entirely — it always re-renders. Both are valid TypeScript, both compile without error, and both are easy to write accidentally during refactoring.",
      dryRun:
        "🔁 **Think:** Your comparator is `(prev, next) => prev.status === next.status`. An operator updates the destination field of a shipment — shipmentId stays the same, status stays the same, destination changes. What does your comparator return? Does ShipmentRow re-render? Is this correct behaviour — should a destination change cause a row re-render?",
      build:
        "**Learning focus:** Write a memo comparator that returns true (skip) when the data props are equal and false (re-render) when they differ — understanding that the boolean logic is the inverse of shouldComponentUpdate.",
    },
  },

  // ── STEP 5 ────────────────────────────────────────────────────────────────
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 5",
    paal: "Write the parent WarehouseList component. It maintains selectedId state. It defines handleSelect with useCallback (dependencies: []). It renders a table of ShipmentRow components using sample shipments data, passing handleSelect as onSelect.",
    hint: "useCallback's dependency array is [] because handleSelect calls setSelectedId which never changes identity. The setSelectedId function from useState is always stable.",
    example_code: `const AuctionBoard = () => {
  const [winnerId, setWinnerId] = useState<string | null>(null);

  const handleBid = useCallback((id: string) => {
    setWinnerId(id);
  }, []);

  return (
    <table>
      {lots.map(lot => (
        <AuctionRow key={lot.itemId} {...lot} onBid={handleBid} />
      ))}
    </table>
  );
};`,
    think_prompt:
      "useCallback(fn, []) means the callback is only created once. But handleSelect calls setSelectedId — a state setter. Why is it safe to include setSelectedId in a [] dependency array without listing it?",
    mc_options: [
      "setSelectedId must be listed in the dependency array — omitting it causes ESLint warnings",
      "setSelectedId is stable across renders — React guarantees state setter references never change, so it doesn't need to be listed",
      "useCallback ignores function dependencies — only primitive values need to be listed",
    ],
    mc_correct_option:
      "setSelectedId is stable across renders — React guarantees state setter references never change, so it doesn't need to be listed",
    mc_anchor:
      "React guarantees that state setter functions (like setSelectedId) have a stable reference — they never change between renders. ESLint's exhaustive-deps rule knows this and does not flag state setters as missing dependencies. This is why `useCallback(() => { setSelectedId(id); }, [])` is correct and lint-compliant — the empty array genuinely captures all dependencies because setSelectedId is stable by contract.",
    why_this_matters:
      "useCallback with [] is the standard pattern for stabilising event handlers that only call state setters. In a list of 500 ShipmentRow components, this ensures that selecting one row does not cause all 499 other rows to re-render — the callback reference is stable, memo's comparator returns true, and the other rows are skipped.",
    answer_keywords: ["WarehouseList", "selectedId", "useState", "handleSelect", "useCallback", "[]", "ShipmentRow", "onSelect"],
    evaluate: evalL44Step5,
    seed_code: `import React, { memo, useCallback, useState } from 'react';

interface ShipmentRowProps {
  shipmentId: string;
  destination: string;
  status: 'active' | 'delayed' | 'delivered';
  onSelect: (id: string) => void;
}

const ShipmentRow = memo(
  ({ shipmentId, destination, status, onSelect }: ShipmentRowProps) => {
    console.log('ShipmentRow rendered:', shipmentId);
    return (
      <tr className={\`row--\${status}\`} onClick={() => onSelect(shipmentId)}>
        <td>{shipmentId}</td>
        <td>{destination}</td>
        <td>{status}</td>
      </tr>
    );
  },
  (prev, next) =>
    prev.shipmentId === next.shipmentId &&
    prev.destination === next.destination &&
    prev.status === next.status
);`,
    starter_code: `import React, { memo, useCallback, useState } from 'react';

interface ShipmentRowProps {
  shipmentId: string;
  destination: string;
  status: 'active' | 'delayed' | 'delivered';
  onSelect: (id: string) => void;
}

const ShipmentRow = memo(
  ({ shipmentId, destination, status, onSelect }: ShipmentRowProps) => {
    console.log('ShipmentRow rendered:', shipmentId);
    return (
      <tr className={\`row--\${status}\`} onClick={() => onSelect(shipmentId)}>
        <td>{shipmentId}</td>
        <td>{destination}</td>
        <td>{status}</td>
      </tr>
    );
  },
  (prev, next) =>
    prev.shipmentId === next.shipmentId &&
    prev.destination === next.destination &&
    prev.status === next.status
);

const shipments = [
  { shipmentId: 'NX-1042', destination: 'Chicago', status: 'active' as const },
  { shipmentId: 'NX-1043', destination: 'Denver', status: 'delayed' as const },
  { shipmentId: 'NX-1044', destination: 'Atlanta', status: 'delivered' as const },
];

const WarehouseList = () => {
  // selectedId state
  // handleSelect with useCallback([], [])
  // return table with ShipmentRow per shipment
};`,
    feedback_correct:
      "Complete — stable handleSelect via useCallback, memo comparator, and a clean parent. Selecting any row now re-renders only that row. The other 499 rows in a real list are skipped entirely.",
    feedback_partial:
      "Almost — check: is handleSelect wrapped in useCallback? Is the dependency array []? Is it passed as onSelect to ShipmentRow?",
    feedback_wrong:
      "Pattern: `const handleSelect = useCallback((id: string) => { setSelectedId(id); }, []);` then `<ShipmentRow key={s.shipmentId} {...s} onSelect={handleSelect} />`.",
    expected: `import React, { memo, useCallback, useState } from 'react';

interface ShipmentRowProps {
  shipmentId: string;
  destination: string;
  status: 'active' | 'delayed' | 'delivered';
  onSelect: (id: string) => void;
}

const ShipmentRow = memo(
  ({ shipmentId, destination, status, onSelect }: ShipmentRowProps) => {
    console.log('ShipmentRow rendered:', shipmentId);
    return (
      <tr className={\`row--\${status}\`} onClick={() => onSelect(shipmentId)}>
        <td>{shipmentId}</td>
        <td>{destination}</td>
        <td>{status}</td>
      </tr>
    );
  },
  (prev, next) =>
    prev.shipmentId === next.shipmentId &&
    prev.destination === next.destination &&
    prev.status === next.status
);

const shipments = [
  { shipmentId: 'NX-1042', destination: 'Chicago', status: 'active' as const },
  { shipmentId: 'NX-1043', destination: 'Denver', status: 'delayed' as const },
  { shipmentId: 'NX-1044', destination: 'Atlanta', status: 'delivered' as const },
];

const WarehouseList = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  return (
    <table>
      <tbody>
        {shipments.map(s => (
          <ShipmentRow
            key={s.shipmentId}
            shipmentId={s.shipmentId}
            destination={s.destination}
            status={s.status}
            onSelect={handleSelect}
          />
        ))}
      </tbody>
    </table>
  );
};`,
    analog_example: `const AuctionBoard = () => {
  const [winnerId, setWinnerId] = useState<string | null>(null);

  const handleBid = useCallback((id: string) => {
    setWinnerId(id);
  }, []);

  return (
    <table>
      <tbody>
        {lots.map(lot => (
          <AuctionRow key={lot.itemId} {...lot} onBid={handleBid} />
        ))}
      </tbody>
    </table>
  );
};`,
    deepDiveLabel:
      "memo + useCallback — when does this optimisation actually hurt performance instead of helping?",
    deepDive: {
      hook: "You wrap every component in the codebase in memo — including tiny stateless components that render a single `<span>`. Your team reports that performance got *worse* after the memo pass. The profiler shows that prop comparison overhead now exceeds the cost of re-rendering those simple components. memo added work without saving any.",
      pain: "⚠️ **Lesson:** memo and useCallback both have a cost — memo runs the comparator on every parent render, useCallback stores the function in a cache. When is that overhead actually worth paying?",
      mentalModel:
        "**Mental model: The Security Checkpoint.**\nEvery parent re-render now goes through a security checkpoint (the comparator). For a checkpoint that takes 5 seconds and protects a 2-second task, you've made things worse. For a checkpoint that takes 5ms and protects a 200ms re-render of 500 rows, you've saved enormous time.\n- memo is worth it: expensive render (has heavy computation, deep DOM updates), many instances (lists), and renders frequently due to unrelated parent state\n- memo is waste: cheap render (single span, static component), few instances, renders infrequently",
      discover: `// ✅ Good candidate for memo — expensive render, many instances
const ShipmentRow = memo(
  ({ shipmentId, status, onSelect }: ShipmentRowProps) => {
    const route = computeOptimalRoute(shipmentId); // expensive
    return <tr>...</tr>;
  }
);

// ❌ Bad candidate — so cheap that memo overhead exceeds savings
const StatusBadge = memo(({ status }: { status: string }) => (
  <span className={\`badge--\${status}\`}>{status}</span>
));
// The comparator runs on every parent render — comparing one string.
// But the render itself is just a span. Memo adds overhead without benefit.

// ✅ When memo makes a measurable difference:
// - Component renders >50 instances
// - Parent re-renders frequently (e.g., real-time data, form input)
// - Component render takes >1ms (computation, deep tree, many DOM nodes)`,
      quickRules:
        "✅ Apply memo to components that are expensive to render AND render frequently due to parent state\n✅ Apply memo to list items when the list has 10+ items and the parent re-renders often\n❌ Don't memo every component by default — measure first with React Profiler\n❌ Don't memo tiny stateless components (single DOM node, no computation)\n✅ Always pair memo with useCallback for function props — memo without stable callbacks is often useless",
      watchOut:
        "👀 **Watch out:** memo without useCallback for function props is almost always useless. If onSelect is defined inline in the parent without useCallback, it's a new reference on every render. The comparator — even if it checks every data prop correctly — either (a) returns false because it's doing a full comparison including the function, or (b) has been manually written to skip the function comparison, which risks stale callbacks. Memo requires useCallback discipline in the parent to deliver its benefit.",
      dryRun:
        "🔁 **Think:** You have a WarehouseList with 500 ShipmentRows, all wrapped in memo with a custom comparator. An operator selects one row — setSelectedId fires. The parent re-renders. React runs through all 500 rows. For each row, the comparator runs. The selected row's status hasn't changed (only selectedId in the parent changed). How many comparators return true (skip)? How many ShipmentRow bodies actually execute? What's the net computational difference vs no memo?",
      build:
        "**Learning focus:** Write the parent component with useCallback to stabilise the onSelect reference — completing the full memo pattern: memo on the child, useCallback on the parent, custom comparator for fine control.",
    },
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Prereqs", id: "prereqs" },
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
  lessonNum: 44,
  title: "React.memo",
  shortName: "PERF — React.memo",
});
