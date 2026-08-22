import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
{
  id: "intro",
  type: "reveal",
  phase: "Lesson",
  content: {
    tag: "LESSON #32 (React Hooks)",
    title: "useReducer",
    body: "useRef is not only for DOM elements. Its defining property is that it returns a mutable object that persists across renders without triggering re-renders when changed. That makes it the right tool for any value you need to persist between renders that should NOT cause a re-render when it updates — timer IDs, previous values, mounted flags, debounce timeouts, and accumulated counts. In this lesson you'll use refs as mutable instance variables for non-rendering concerns.",
    usecase:
      "A shipment search fires an API call as the user types. You want to debounce it — wait 300ms after the last keystroke before fetching. The timeout ID must persist across renders so you can clear the previous timeout on each new keystroke. Storing it in state would trigger a re-render on every keystroke (defeating the point). useRef is the correct tool.",
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
    {
      lesson: 11,
      label: "useState — Objects + Spread",
      reason: "Complete Lesson 11 (useState — Objects + Spread) first — it is a prerequisite on the React-TS track for this lesson.",
    },
  ],
},
{
  id: "objectives",
  type: "objectives",
  phase: "Objectives",
  items: [
    "Store a mutable value in a ref that persists across renders without triggering re-renders",
    "Use a ref to hold a timer ID for debouncing — clearing and resetting it on each update",
    "Track the previous value of a prop or state using a ref updated in useEffect",
    "Use a mounted ref to prevent state updates after unmount",
    "Know the decision rule: state for values that affect rendering, ref for values that don't",
  ],
},
{
  id: "step1",
  type: "question",
  phase: "Step 1 of 5",
  paal: "Store a render count in a ref and log it on every render. The count should increment on each render but NOT cause additional re-renders when it updates.",
  hint: "useRef<number>(0) creates a ref holding a number. Mutate it directly: `renderCount.current += 1`. Unlike state, this mutation does not trigger a re-render.",
  example_code: `const renderCount = useRef(0);
renderCount.current += 1;
console.log('Render #', renderCount.current);`,
  think_prompt:
    "If you stored the render count in useState, incrementing it would cause another render, which would increment it again — infinite loop. useRef lets you mutate a value without triggering a render. How does this property make it suitable for tracking render counts?",
  mc_options: [
    "const [renderCount, setRenderCount] = useState(0); setRenderCount(prev => prev + 1);",
    "const renderCount = useRef(0); renderCount.current += 1;",
    "let renderCount = 0; renderCount += 1; // plain variable",
  ],
  mc_correct_option:
    "const renderCount = useRef(0); renderCount.current += 1;",
  mc_anchor:
    "useState increments cause re-renders — storing render count in state would create an infinite loop. A plain variable resets to 0 on every render — it doesn't persist across renders because the component function runs fresh each time. useRef persists across renders (same object, same .current) and mutations don't trigger re-renders — exactly what a render counter needs.",
  why_this_matters:
    "Understanding that refs persist without triggering re-renders is the core insight that unlocks the full power of useRef. Any value that needs to survive re-renders but doesn't itself drive rendering belongs in a ref.",
  answer_keywords: ["useRef", "renderCount", "current", "+= 1"],
  seed_code: `import { useRef } from 'react';`,
  starter_code: `import { useRef } from 'react';

const ShipmentCard = (): JSX.Element => {
  // create a render count ref here
  // increment it on every render
  // log it

  return <div><p>Shipment Card</p></div>;
};`,
  feedback_correct:
    "Exactly — `renderCount.current += 1` mutates the ref directly. React doesn't know about this mutation, so no re-render is triggered. The value persists in the same ref object across every render.",
  feedback_partial:
    "Close — mutate the ref directly: `renderCount.current += 1`, not via a setter. Refs have no setter — you mutate current directly.",
  feedback_wrong:
    "Add `const renderCount = useRef(0)` and `renderCount.current += 1` directly in the component body (before the return). Then `console.log('Render #', renderCount.current)`.",
  expected: `import { useRef } from 'react';

const ShipmentCard = (): JSX.Element => {
  const renderCount = useRef(0);
  renderCount.current += 1;
  console.log('Render #', renderCount.current);

  return <div><p>Shipment Card (rendered {renderCount.current} times)</p></div>;
};`,
  analog_example: `const eventCount = useRef(0);
eventCount.current += 1; // no re-render`,
  deepDiveLabel:
    "Ref mutation in the component body — is that safe, given React can render multiple times?",
  deepDive: {
    hook: "You increment `renderCount.current` directly in the component body. In React 18 StrictMode, the component renders twice on mount. renderCount shows 2 after what should be the first render. The count is wrong because StrictMode's double-render both increment the ref.",
    pain: "⚠️ **Lesson:** Incrementing a ref in the component body runs every time the component function runs — including StrictMode's extra renders and React's internal renders that don't commit. Is render counting in a ref actually reliable?",
    mentalModel:
      "React may call your component function more times than it commits to the DOM — in StrictMode, in concurrent mode, in React's internal work. Each call increments the ref.\n\n**Reliable alternative**: increment inside useEffect — effects only run after committed renders:\n```tsx\nconst renderCount = useRef(0);\n\nuseEffect(() => {\n  renderCount.current += 1;\n  console.log('Committed render #', renderCount.current);\n});\n```\n\nThis counts committed renders — renders where React actually updated the DOM. StrictMode's extra renders don't cause the effect to run twice (the second mount is a real mount, the initial render's effect fires once per mount).\n\nFor debugging purposes, both approaches are informative — just know what each is counting.",
    discover:
      "```tsx\n// Counts every function call (includes StrictMode extras)\nconst renderCount = useRef(0);\nrenderCount.current += 1; // body — runs on every call\n\n// Counts committed renders only\nuseEffect(() => {\n  renderCount.current += 1; // effect — runs after DOM commit\n});\n```",
    quickRules:
      "- ✅ ref in body: fast, counts every function call including StrictMode extras\n- ✅ ref in effect: counts committed renders only — more accurate for debugging\n- ❌ state for render counting: causes infinite re-render loop\n- ❌ plain variable: resets on every render, doesn't persist\n- for serious render profiling: React DevTools Profiler is more accurate",
    watchOut:
      "👀 **Watch out:** React's concurrent features may call your component function multiple times and discard some renders ('throw away' renders in React 18 concurrent mode). Refs in the body count all calls. Refs in effects only count committed ones. Know which you need.",
    dryRun:
      "🔁 **Think:** Component mounts in StrictMode. React calls the function twice (StrictMode double-render). If `renderCount.current += 1` is in the body: what is renderCount.current after mount? If it's in a useEffect: what is it after mount?",
    build:
      "**Learning focus:** Store a mutable value in a ref that persists across renders without causing re-renders — understanding that ref body mutations count every function call while effect mutations count committed renders.",
  },
},
{
  id: "step2",
  type: "question",
  phase: "Step 2 of 5",
  paal: "Implement a debounced search — store the setTimeout ID in a ref. Each time the query changes, clear the previous timeout and start a new one. Fire the search 300ms after the last change.",
  hint: "Use `useRef<ReturnType<typeof setTimeout> | null>(null)` for the timer ID. In the onChange handler: clear the previous timeout, then set a new one. The ref persists across renders so the ID is always current.",
  example_code: `const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setQuery(e.target.value);
  if (timerRef.current) clearTimeout(timerRef.current);
  timerRef.current = setTimeout(() => {
    onSearch(e.target.value);
  }, 300);
};`,
  think_prompt:
    "The timeout ID from setTimeout must persist across renders so you can clear it. Storing it in state would trigger a re-render on every keystroke. A plain variable would reset to null on every render. What makes useRef the right storage for the timeout ID?",
  mc_options: [
    "const [timerId, setTimerId] = useState<ReturnType<typeof setTimeout> | null>(null)",
    "const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)",
    "let timerId: ReturnType<typeof setTimeout> | null = null // module-level variable",
  ],
  mc_correct_option:
    "const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)",
  mc_anchor:
    "State triggers re-renders — storing a timer ID in state causes a render on every keystroke (setting the timer) and another on every timer fire (when we'd clear it). A module-level variable is shared across all instances of the component — two ShipmentSearch components would share the same timerId, clearing each other's timers. useRef is component-instance-scoped and persists without triggering renders.",
  why_this_matters:
    "Debouncing is a critical performance pattern in enterprise apps — search-as-you-type, filter-as-you-type, autosave. The timer ID must persist across renders to be cleared correctly. This is the archetypal use case for a non-DOM ref: a value that lives between renders but doesn't affect what renders.",
  answer_keywords: [
    "timerRef", "useRef", "ReturnType", "setTimeout", "null",
    "clearTimeout", "timerRef.current",
  ],
  seed_code: `import { useRef, useState } from 'react';

interface ShipmentSearchProps {
  onSearch: (query: string) => void;
}`,
  starter_code: `import { useRef, useState } from 'react';

interface ShipmentSearchProps {
  onSearch: (query: string) => void;
}

const ShipmentSearch = ({ onSearch }: ShipmentSearchProps): JSX.Element => {
  const [query, setQuery] = useState('');
  // add timerRef here — typed for setTimeout return value

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    // clear previous timeout
    // set new 300ms timeout that calls onSearch
  };

  return (
    <input
      value={query}
      onChange={handleChange}
      placeholder="Search shipments..."
    />
  );
};`,
  feedback_correct:
    "Exactly — the timer ID is stored in a ref, persists across renders, and can be cleared before the next timeout is set. Each keystroke cancels the pending search and starts a fresh 300ms countdown.",
  feedback_partial:
    "Close — check three things: the ref is typed as `ReturnType<typeof setTimeout> | null`, `clearTimeout(timerRef.current)` is called before setting the new timeout, and the new timeout ID is assigned back to `timerRef.current`.",
  feedback_wrong:
    "Add `const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)`. In handleChange: `if (timerRef.current) clearTimeout(timerRef.current); timerRef.current = setTimeout(() => onSearch(e.target.value), 300);`",
  expected: `import { useRef, useState } from 'react';

interface ShipmentSearchProps {
  onSearch: (query: string) => void;
}

const ShipmentSearch = ({ onSearch }: ShipmentSearchProps): JSX.Element => {
  const [query, setQuery] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSearch(e.target.value);
    }, 300);
  };

  return (
    <input
      value={query}
      onChange={handleChange}
      placeholder="Search shipments..."
    />
  );
};`,
  analog_example: `const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

const handleInput = (value: string) => {
  if (debounceRef.current) clearTimeout(debounceRef.current);
  debounceRef.current = setTimeout(() => saveData(value), 500);
};`,
  deepDiveLabel:
    "Debounce in the handler — but should you clear the timeout when the component unmounts?",
  deepDive: {
    hook: "The component unmounts while a 300ms timer is pending. The timer fires. onSearch is called. If onSearch updates state in the parent, React updates fine — the parent is still mounted. But if it was calling setQuery inside the search component that just unmounted, you'd get a stale update.",
    pain: "⚠️ **Lesson:** A pending timer fires after unmount. What can go wrong — and how do you add cleanup to clear the timer on unmount?",
    mentalModel:
      "The cleanup pattern for timers in refs:\n```tsx\nuseEffect(() => {\n  // No setup — cleanup only\n  return () => {\n    if (timerRef.current) clearTimeout(timerRef.current);\n  };\n}, []); // runs once — cleanup fires on unmount\n```\n\nOr, if the timer is set inside useEffect:\n```tsx\nuseEffect(() => {\n  const id = setTimeout(() => onSearch(query), 300);\n  return () => clearTimeout(id); // cleanup = clear the timer\n}, [query]);\n```\n\nFor debounce in an event handler, the cleanup-only useEffect (`return () => clearTimeout`) is the right pattern — it clears any pending timer when the component unmounts.",
    discover:
      "```tsx\n// ✅ cleanup on unmount — prevents stale timer fires\nuseEffect(() => {\n  return () => {\n    if (timerRef.current) clearTimeout(timerRef.current);\n  };\n}, []);\n\n// ✅ alternative — debounce entirely in useEffect\nuseEffect(() => {\n  const id = setTimeout(() => onSearch(query), 300);\n  return () => clearTimeout(id);\n}, [query, onSearch]);\n```",
    quickRules:
      "- ✅ cleanup-only effect: clear pending timers on unmount\n- ✅ effect-based debounce: timer in effect, cleanup in return — deps are [query]\n- ❌ pending timer after unmount: fires, may call stale callbacks or update unmounted state\n- choose handler-based or effect-based debounce consistently per component",
    watchOut:
      "👀 **Watch out:** Effect-based debounce (timer in useEffect with [query] dep) is often cleaner than handler-based — the cleanup is automatically paired with the setup, and you can't forget to clear the previous timer (it's done in the return). The handler-based approach requires the separate cleanup-only effect.",
    dryRun:
      "🔁 **Think:** Component unmounts while a 300ms timer is pending. Without cleanup: what happens when the timer fires? With `return () => clearTimeout(timerRef.current)` in a `[]` effect: what happens on unmount?",
    build:
      "**Learning focus:** Store a timer ID in a ref for debouncing — and add unmount cleanup to prevent stale timer fires after the component is gone.",
  },
},
{
  id: "step3",
  type: "question",
  phase: "Step 3 of 5",
  paal: "Track the previous value of shipmentId prop using a ref. After each render, update the ref to hold the current shipmentId so it's available as the previous value on the next render.",
  hint: "Set the ref in a useEffect — `prevShipmentIdRef.current = shipmentId` — after each render. During the render itself, the ref still holds the previous value (from the last effect run).",
  example_code: `const prevIdRef = useRef<string | null>(null);

useEffect(() => {
  prevIdRef.current = orderId; // update AFTER render
});

// During render: prevIdRef.current is the previous orderId`,
  think_prompt:
    "The previous value is what shipmentId was on the LAST render. The ref update happens in useEffect — after the current render. So during the current render, the ref still holds the previous render's value. What dep array on the useEffect preserves this timing?",
  mc_options: [
    "No dependency array — useEffect runs after every render, updating the ref after each",
    "Dependency array [shipmentId] — only update when shipmentId changes",
    "No useEffect needed — set prevShipmentIdRef.current = shipmentId in the component body",
  ],
  mc_correct_option:
    "No dependency array — useEffect runs after every render, updating the ref after each",
  mc_anchor:
    "No dependency array ensures the ref is updated after every render — so prevIdRef.current is always the value from the previous render. With [shipmentId], the ref only updates when shipmentId changes — it would miss updates from other state changes and could have an outdated 'previous' value. Updating in the component body would set the ref during the current render — both prev and current would be the same value.",
  why_this_matters:
    "Tracking previous values is required for: detecting which direction a value changed (for animations), comparing current vs previous to decide whether to show a 'changed' indicator, and any logic that depends on both the new and old value simultaneously. This ref pattern is the foundation for custom usePrevious hooks seen throughout enterprise React codebases.",
  answer_keywords: [
    "prevShipmentIdRef", "useRef", "useEffect",
    "prevShipmentIdRef.current = shipmentId",
  ],
  seed_code: `import { useRef, useEffect } from 'react';

interface ShipmentDetailProps {
  shipmentId: string;
}`,
  starter_code: `import { useRef, useEffect } from 'react';

interface ShipmentDetailProps {
  shipmentId: string;
}

const ShipmentDetail = ({ shipmentId }: ShipmentDetailProps): JSX.Element => {
  // add prevShipmentIdRef here — typed as string | null, initial null

  // add useEffect (no dep array) to update ref after each render

  const prevShipmentId = prevShipmentIdRef.current;

  return (
    <div>
      <p>Current: {shipmentId}</p>
      <p>Previous: {prevShipmentId ?? 'None'}</p>
    </div>
  );
};`,
  feedback_correct:
    "Exactly — the no-dep-array effect runs after every render. During the current render, the ref still holds last render's value. After the render commits, the effect updates the ref. Next render: the ref has this render's value as the 'previous'.",
  feedback_partial:
    "Close — make sure the useEffect has NO dependency array (not empty array, not [shipmentId]). No array means it runs after every render, which is the timing needed to track every previous value.",
  feedback_wrong:
    "Add `const prevShipmentIdRef = useRef<string | null>(null)`. Add `useEffect(() => { prevShipmentIdRef.current = shipmentId; })` — no dependency array.",
  expected: `import { useRef, useEffect } from 'react';

interface ShipmentDetailProps {
  shipmentId: string;
}

const ShipmentDetail = ({ shipmentId }: ShipmentDetailProps): JSX.Element => {
  const prevShipmentIdRef = useRef<string | null>(null);

  useEffect(() => {
    prevShipmentIdRef.current = shipmentId;
  });

  const prevShipmentId = prevShipmentIdRef.current;

  return (
    <div>
      <p>Current: {shipmentId}</p>
      <p>Previous: {prevShipmentId ?? 'None'}</p>
      {prevShipmentId && prevShipmentId !== shipmentId && (
        <p className="changed">Changed from {prevShipmentId}</p>
      )}
    </div>
  );
};`,
  analog_example: `// usePrevious custom hook
const usePrevious = <T>(value: T): T | null => {
  const ref = useRef<T | null>(null);
  useEffect(() => { ref.current = value; });
  return ref.current;
};`,
  deepDiveLabel:
    "usePrevious pattern — but could you track previous value with useState instead?",
  deepDive: {
    hook: "You implement previous value tracking with `const [prev, setPrev] = useState<string | null>(null)`. In useEffect: `setPrev(shipmentId)`. It works — but the component re-renders twice on every shipmentId change: once for the shipmentId change, once for the prev state update.",
    pain: "⚠️ **Lesson:** useState for previous value tracking causes a double render on every change. useRef avoids this. But are there situations where the double render is acceptable — or even necessary?",
    mentalModel:
      "**useRef for previous** (no re-render):\n- prev ref updates silently after each render\n- the previous value is available in JSX during the current render (it's a ref read, not state)\n- no extra render triggered\n- correct when: displaying previous value as info, animation direction, logging\n\n**useState for previous** (causes re-render):\n- prev state update triggers a new render\n- the second render has both the new current AND the new previous\n- correct when: the previous value changing should trigger a visual update that requires its own render cycle (rare)\n\nFor virtually all 'track previous value' use cases, useRef is correct — the extra render from useState is waste.",
    discover:
      "```tsx\n// ✅ useRef — no extra render\nconst prevRef = useRef<string | null>(null);\nuseEffect(() => { prevRef.current = shipmentId; }); // silent update\nconst prev = prevRef.current; // read in current render — shows last render's value\n\n// ⚠️ useState — double render\nconst [prev, setPrev] = useState<string | null>(null);\nuseEffect(() => { setPrev(shipmentId); }); // triggers another render\n```",
    quickRules:
      "- ✅ useRef for previous value: no extra render, correct for most uses\n- ⚠️ useState for previous value: double render — almost always wrong for this purpose\n- ✅ custom usePrevious hook: extract the pattern, reuse across components\n- the ref pattern is the standard — you'll see usePrevious in popular hook libraries",
    watchOut:
      "👀 **Watch out:** During the very first render, prevRef.current is null (the initial value). Guard against this in any logic that compares prev and current: `if (prev !== null && prev !== current) { ... }`",
    dryRun:
      "🔁 **Think:** Component renders with shipmentId='NX-001'. prevRef.current is null. After render, effect sets prevRef.current = 'NX-001'. Next render: shipmentId='NX-002'. During render: what is prevRef.current? After render: what does the effect set prevRef.current to?",
    build:
      "**Learning focus:** Track the previous value of a prop using a ref updated in a no-dep-array effect — understanding that the effect timing (after render) is what makes the 'previous' value available during the current render.",
  },
},
{
  id: "step4",
  type: "question",
  phase: "Step 4 of 5",
  paal: "Use a mounted ref to prevent state updates after the component unmounts — set isMountedRef to true on mount and false on unmount, then check it before calling setState in an async callback.",
  hint: "useRef<boolean>(false) — set current to true inside the effect setup, false in the cleanup. In async callbacks: `if (!isMountedRef.current) return;` before setState.",
  example_code: `const isMountedRef = useRef(false);

useEffect(() => {
  isMountedRef.current = true;
  return () => { isMountedRef.current = false; };
}, []);

// In async callback:
const result = await fetchData();
if (!isMountedRef.current) return; // component unmounted during fetch
setState(result);`,
  think_prompt:
    "An async operation starts. The component unmounts before it completes. The async callback tries to call setState on an unmounted component. The mounted ref is the guard. How does checking isMountedRef.current before setState prevent the stale update?",
  mc_options: [
    "Check isMountedRef.current before every setState call in async callbacks — return early if false",
    "Subscribe the async callback to a React lifecycle event that fires on unmount",
    "Wrap setState in a try/catch — React will throw if the component is unmounted",
  ],
  mc_correct_option:
    "Check isMountedRef.current before every setState call in async callbacks — return early if false",
  mc_anchor:
    "The mounted ref check is the correct pattern. React does NOT throw when setState is called on an unmounted component in React 18 (the old warning was removed). The try/catch approach would catch nothing. React has no lifecycle subscription API for this purpose. The ref check is explicit, controlled, and works correctly.",
  why_this_matters:
    "Stale async updates after unmount cause subtle bugs — a loading spinner that never goes away, an error message from a previous request that shows briefly before the component mounts fresh, or data from one user showing briefly when another user's data is loading. The mounted ref is the standard defence.",
  answer_keywords: [
    "isMountedRef", "useRef", "false", "true",
    "useEffect", "isMountedRef.current", "return",
  ],
  seed_code: `import { useRef, useState, useEffect } from 'react';

interface ShipmentDetailProps {
  shipmentId: string;
}`,
  starter_code: `import { useRef, useState, useEffect } from 'react';

interface ShipmentDetailProps {
  shipmentId: string;
}

const ShipmentDetail = ({ shipmentId }: ShipmentDetailProps): JSX.Element => {
  const [data, setData] = useState<string | null>(null);
  // add isMountedRef here

  useEffect(() => {
    // set isMountedRef.current = true on setup
    // set isMountedRef.current = false in cleanup

    const fetchAsync = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // simulate fetch
      // check isMountedRef.current before setting state
      setData(\`Data for \${shipmentId}\`);
    };

    fetchAsync();
  }, [shipmentId]);

  return <div>{data ?? 'Loading...'}</div>;
};`,
  feedback_correct:
    "Exactly — isMountedRef is set true on setup and false on cleanup. The guard before setData prevents a stale update if the component unmounts during the simulated fetch.",
  feedback_partial:
    "Close — make sure isMountedRef.current is set to `true` in the effect setup (not just in the declaration) and `false` in the return cleanup. Both are needed.",
  feedback_wrong:
    "Add `const isMountedRef = useRef(false)`. In the effect: `isMountedRef.current = true; return () => { isMountedRef.current = false; }`. Before setData: `if (!isMountedRef.current) return;`.",
  expected: `import { useRef, useState, useEffect } from 'react';

interface ShipmentDetailProps {
  shipmentId: string;
}

const ShipmentDetail = ({ shipmentId }: ShipmentDetailProps): JSX.Element => {
  const [data, setData] = useState<string | null>(null);
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;

    const fetchAsync = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (!isMountedRef.current) return;
      setData(\`Data for \${shipmentId}\`);
    };

    fetchAsync();

    return () => {
      isMountedRef.current = false;
    };
  }, [shipmentId]);

  return <div>{data ?? 'Loading...'}</div>;
};`,
  analog_example: `const isMountedRef = useRef(false);
useEffect(() => {
  isMountedRef.current = true;
  return () => { isMountedRef.current = false; };
}, []);`,
  deepDiveLabel:
    "Mounted ref guards setState — but React 18 removed the unmounted component warning. Does the guard still matter?",
  deepDive: {
    hook: "React 18 silently removed the 'Cannot update an unmounted component' warning. Your colleague says: 'so we don't need the mounted ref check anymore — React handles it.' You're not sure they're right.",
    pain: "⚠️ **Lesson:** React 18 removed the warning, not the problem. What actually happens when you call setState on an unmounted component — and why does the mounted ref still matter?",
    mentalModel:
      "React 18's change: calling setState on an unmounted component is now a no-op — React ignores it. The warning was removed because it fired too many false positives (strict mode, concurrent features).\n\n**What still happens without the guard**:\n1. The async callback runs after unmount\n2. setState is called — React ignores it (no warning, no update)\n3. BUT: the callback may have already done work before setState — logging, side effects, calls to other functions\n4. The code after setState still runs — additional side effects after a failed setState\n\n**What the guard prevents**:\n- Unnecessary work in the callback after the component is gone\n- Secondary effects (analytics calls, additional fetches) that shouldn't fire after unmount\n- Confusion in code that runs after setState\n\nThe guard is still good practice — React's silence doesn't mean the logic is intentional.",
    discover:
      "```tsx\n// Without guard — React ignores setState, but callback still runs fully\nif (!isMounted) return; // not checked\nconst result = await processData(); // runs unnecessarily\nsetData(result);         // ignored by React\nlogAnalytics(result);    // STILL FIRES — should not after unmount\n\n// With guard — early return stops all post-unmount work\nif (!isMountedRef.current) return; // stops here\nconst result = await processData(); // doesn't run\n```",
    quickRules:
      "- ✅ React 18: setState after unmount is a silent no-op — no crash\n- ✅ mounted ref: still prevents unnecessary work and secondary side effects\n- ✅ AbortController: better for fetch — cancels the request, not just the setState\n- ❌ relying on React's silence — doesn't prevent secondary effects or wasted computation\n- for fetch specifically, AbortController is cleaner than a mounted ref",
    watchOut:
      "👀 **Watch out:** The mounted ref approach and AbortController solve different problems. AbortController cancels the network request — nothing runs. Mounted ref lets the request complete but guards the setState. For fetch operations, prefer AbortController. For non-cancellable async work (like IndexedDB writes), the mounted ref is the right guard.",
    dryRun:
      "🔁 **Think:** Component unmounts while a 1-second timeout is pending. No mounted ref, no guard. The timeout fires. `setData('result')` is called — React 18 silently ignores it. `logAnalytics('result')` is the next line — does it fire? With the mounted ref guard before logAnalytics — does it fire?",
    build:
      "**Learning focus:** Use a mounted ref to guard setState calls in async callbacks — understanding that React 18's silence on unmounted updates doesn't prevent secondary side effects from running unnecessarily.",
  },
},
{
  id: "step5",
  type: "question",
  phase: "Step 5 of 5",
  paal: "Apply the decision rule: for each of these values, decide whether it should be state or a ref — and explain why. Values: (1) the current filter value shown in a select, (2) the ID of a setInterval timer, (3) a count of API calls made (for debugging), (4) the user's typed search query displayed in an input.",
  hint: "The rule: if the value changing should cause a re-render — use state. If it shouldn't cause a re-render — use ref.",
  example_code: `// State: drives rendering
const [filterValue, setFilterValue] = useState('all'); // changes show new UI

// Ref: does not drive rendering
const timerIdRef = useRef<number | null>(null); // changing this is internal bookkeeping`,
  think_prompt:
    "For each value: does the user need to see the UI update when this value changes? If yes — state. If no — ref.",
  mc_options: [
    "All four should be state — every important value should trigger re-renders",
    "(1) state, (2) ref, (3) ref, (4) state",
    "(1) state, (2) state, (3) state, (4) state",
  ],
  mc_correct_option:
    "(1) state, (2) ref, (3) ref, (4) state",
  mc_anchor:
    "Filter value (1): displayed in a select, drives which items render — must be state. Timer ID (2): internal bookkeeping, changing it should not update the UI — ref. API call count (3): debugging tool only, not displayed in the component (if displayed, it would be state) — ref. Search query (4): displayed in an input, the input updates as the user types — state.",
  why_this_matters:
    "The state vs ref decision is one of the most important architectural choices in React. Every piece of unnecessary state causes unnecessary re-renders. Every value that should be in state but is in a ref causes invisible bugs (UI doesn't update). Getting this decision right is what separates efficient, correct React from slow, buggy React.",
  answer_keywords: [
    "filter value", "state", "timer ID", "ref",
    "API call count", "ref", "search query", "state",
  ],
  seed_code: `// Categorise each value as state or ref and explain why:
// (1) Current filter value shown in a select dropdown
// (2) ID of a setInterval timer running in the background
// (3) Count of API calls made (shown only in DevTools, not in UI)
// (4) User's typed search query displayed in a controlled input`,
  starter_code: `// For each value below, decide: state or ref?
// Then implement it correctly.

// (1) filterValue — select dropdown, currently shown to user
// const [filterValue, setFilterValue] = useState(...) OR useRef(...)

// (2) timerId — setInterval ID, used only to clearInterval
// const [...] = useState(...) OR useRef(...)

// (3) apiCallCount — debugging only, not rendered in UI
// const [...] = useState(...) OR useRef(...)

// (4) searchQuery — displayed in an <input value={...} /> controlled input
// const [...] = useState(...) OR useRef(...)`,
  feedback_correct:
    "Exactly — (1) state: drives the select display and list filtering. (2) ref: internal timer bookkeeping. (3) ref: not rendered, would cause unnecessary re-renders if state. (4) state: drives the controlled input display.",
  feedback_partial:
    "Close — re-check the timer ID. Storing a timer ID in state causes a re-render when it's set. That re-render serves no UI purpose. It belongs in a ref.",
  feedback_wrong:
    "(1) state — drives rendering of select and filtered list. (2) ref — timer ID is internal, never rendered. (3) ref — not displayed in UI, state would cause unnecessary renders. (4) state — must be state to display in the controlled input.",
  expected: `import { useState, useRef } from 'react';

// (1) filterValue — MUST be state: drives select display and list filtering
const [filterValue, setFilterValue] = useState('all');

// (2) timerId — MUST be ref: internal bookkeeping, changing it should NOT re-render
const timerIdRef = useRef<ReturnType<typeof setInterval> | null>(null);

// (3) apiCallCount — SHOULD be ref: debugging only, not rendered in UI
// If you want to display it, THEN use state
const apiCallCountRef = useRef(0);

// (4) searchQuery — MUST be state: drives controlled input display
const [searchQuery, setSearchQuery] = useState('');

/*
Decision rule:
- Does changing this value require the UI to update? → STATE
- Is this value internal bookkeeping that should NOT trigger re-renders? → REF
*/`,
  analog_example: `// State examples: query, selectedId, isOpen, currentPage
// Ref examples: timerId, prevValue, isMounted, requestCount`,
  deepDiveLabel:
    "State vs ref — but what about a value that's both displayed AND used as internal bookkeeping?",
  deepDive: {
    hook: "You have a fetch counter displayed in the UI ('3 requests made') AND used to cancel requests above a limit. It's displayed (needs state) AND needs to be read synchronously before each request (often reads from ref). When a value serves both purposes, which wins?",
    pain: "⚠️ **Lesson:** State and refs are complementary — can you use both for the same conceptual value? When a value must both render AND be read synchronously in async callbacks, what's the right pattern?",
    mentalModel:
      "**Use state for the display, ref for the synchronous read:**\n```tsx\nconst [fetchCount, setFetchCount] = useState(0); // for display\nconst fetchCountRef = useRef(0); // for sync reads in callbacks\n\nconst handleFetch = async () => {\n  fetchCountRef.current += 1;\n  setFetchCount(fetchCountRef.current); // keep state in sync\n\n  if (fetchCountRef.current > 5) return; // sync read — no stale closure\n  await fetchData();\n};\n```\n\nThis is the 'sync ref alongside state' pattern — the ref is always current for synchronous reads, state drives rendering. Both are updated together.\n\nAlternative: functional update form avoids the sync read need: `setFetchCount(prev => prev + 1)` inside the async callback always uses the latest state.",
    discover:
      "```tsx\n// Pattern 1: ref for sync + state for display\nfetchCountRef.current += 1;\nsetFetchCount(fetchCountRef.current);\n\n// Pattern 2: functional update (no ref needed)\nsetFetchCount(prev => {\n  const next = prev + 1;\n  if (next > 5) cancelFetch();\n  return next;\n});\n// Functional update receives latest state, avoids stale closure\n```",
    quickRules:
      "- ✅ display + no sync reads: state only\n- ✅ no display + sync reads needed: ref only\n- ✅ display + sync reads: ref alongside state, or functional update form\n- ✅ functional update form: receives current state in callback, often avoids the ref\n- when in doubt: functional update first, add ref only if the functional form isn't sufficient",
    watchOut:
      "👀 **Watch out:** The 'ref alongside state' pattern requires keeping them in sync manually — every setState must also update the ref. A helper function that updates both in one call reduces the chance of drift.",
    dryRun:
      "🔁 **Think:** fetchCount is 4. The async handler starts. fetchCountRef.current becomes 5. setFetchCount(5) is called — React batches it. The next line checks `if (fetchCountRef.current > 5)` — what is fetchCountRef.current at this moment? What is the value of the `fetchCount` state variable at this moment (before the batched update commits)?",
    build:
      "**Learning focus:** Apply the state vs ref decision rule — state for values that drive rendering, ref for values that don't — and understand the 'ref alongside state' pattern for values that serve both purposes.",
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
  lessonNum: 32,
  title: "useReducer",
  shortName: "HOOKS — USE REF MUTABLE",
});
