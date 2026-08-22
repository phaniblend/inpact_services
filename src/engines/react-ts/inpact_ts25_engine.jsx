import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
{
  id: "intro",
  type: "reveal",
  phase: "Lesson",
  content: {
    tag: "LESSON #25 (React Hooks)",
    title: "useEffect — Dependencies",
    body: "After you can run an effect on mount, the next skill is telling React exactly which props and state values should trigger a re-run. The dependency array is that contract: omit it only when you mean 'after every render', pass `[]` for mount-only, and list every reactive value read inside the effect otherwise. This lesson stresses correct dependency lists, stale closures, and eslint-plugin-react-hooks as the guardrail — the fetch-heavy UI you build here is a vehicle for practicing dependency discipline, not the end goal of the track.",
    usecase:
      "A shipment ID prop changes while the detail panel stays mounted. Any effect that reads `shipmentId` must list it in the dependency array — otherwise the UI shows stale data from the previous shipment. The same rule applies to filters, pagination cursors, and feature flags: whenever an effect reads it, it belongs in the array.",
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
      lesson: 24,
      label: "useEffect — Mount",
      reason: "Complete Lesson 24 (useEffect — Mount) first — it is a prerequisite on the React-TS track for this lesson.",
    },
  ],
},
{
  id: "objectives",
  type: "objectives",
  phase: "Objectives",
  items: [
    "List every prop and state value an effect reads in its dependency array so React re-runs when inputs change",
    "Drive a data-fetching effect from a prop like shipmentId and watch the effect re-run when that dependency changes",
    "Recognise stale UI when a dependency is missing even though the fetch pattern is otherwise correct",
    "Abort in-flight requests when dependencies change so a slower response cannot overwrite fresher data",
    "Keep the effect callback synchronous while starting async work inside it",
  ],
},
{
  id: "step1",
  type: "question",
  phase: "Step 1 of 5",
  paal: "Set up three state variables for a data fetch: isLoading (boolean, true initially), error (string | null, null initially), and shipmentData (ShipmentDetail | null, null initially). Define a ShipmentDetail interface with shipmentId, destination, status, and carrier fields.",
  hint: "isLoading starts true because the fetch begins immediately on mount. error and shipmentData start null because neither has happened yet. The type argument for shipmentData is `ShipmentDetail | null`.",
  example_code: `interface OrderDetail {
  orderId: string;
  customer: string;
  total: number;
}

const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [orderData, setOrderData] = useState<OrderDetail | null>(null);`,
  think_prompt:
    "A fetch has three possible outcomes: still loading, succeeded with data, or failed with an error. How do you represent all three simultaneously with the minimum number of state variables?",
  mc_options: [
    "const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading')",
    "const [isLoading, setIsLoading] = useState(true); const [error, setError] = useState<string | null>(null); const [shipmentData, setShipmentData] = useState<ShipmentDetail | null>(null);",
    "const [fetchResult, setFetchResult] = useState<{ loading: boolean; error: string | null; data: ShipmentDetail | null }>({ loading: true, error: null, data: null });",
  ],
  mc_correct_option:
    "const [isLoading, setIsLoading] = useState(true); const [error, setError] = useState<string | null>(null); const [shipmentData, setShipmentData] = useState<ShipmentDetail | null>(null);",
  mc_anchor:
    "Three separate state variables is the foundational pattern for data fetching — it's explicit, straightforward, and each variable has a clear single purpose. The status union type also works and is increasingly popular (it's impossible to be in loading and success simultaneously). The object approach works but requires spread updates. All three are valid — this lesson teaches the three-variable foundation before considering alternatives.",
  why_this_matters:
    "Every data-fetching component in enterprise apps manages some form of loading/error/data state. Understanding the foundational three-variable pattern is the prerequisite for understanding more advanced patterns like React Query and SWR — which abstract exactly this state management.",
  answer_keywords: [
    "ShipmentDetail", "shipmentId", "destination", "status", "carrier",
    "isLoading", "true", "error", "string | null", "null",
    "shipmentData", "ShipmentDetail | null",
  ],
  seed_code: `import { useState } from 'react';`,
  starter_code: `import { useState } from 'react';

// define ShipmentDetail interface here

interface ShipmentDetailProps {
  shipmentId: string;
}

const ShipmentDetailPanel = ({ shipmentId }: ShipmentDetailProps): JSX.Element => {
  // declare three state variables: isLoading, error, shipmentData

  return <div />;
};`,
  feedback_correct:
    "Exactly — three state variables cover all fetch states. isLoading starts true because the fetch begins immediately. error and data start null because neither outcome has happened yet.",
  feedback_partial:
    "Close — check initial values: isLoading should start `true` (not false), error should start `null` with type `string | null`, and shipmentData should start `null` with type `ShipmentDetail | null`.",
  feedback_wrong:
    "Define `interface ShipmentDetail { shipmentId: string; destination: string; status: string; carrier: string; }`. Then three useState calls: `useState(true)`, `useState<string | null>(null)`, `useState<ShipmentDetail | null>(null)`.",
  expected: `import { useState } from 'react';

interface ShipmentDetail {
  shipmentId: string;
  destination: string;
  status: string;
  carrier: string;
}

interface ShipmentDetailProps {
  shipmentId: string;
}

const ShipmentDetailPanel = ({ shipmentId }: ShipmentDetailProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shipmentData, setShipmentData] = useState<ShipmentDetail | null>(null);

  return <div />;
};`,
  analog_example: `const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [userData, setUserData] = useState<UserProfile | null>(null);`,
  deepDiveLabel:
    "Three variables vs a status union — when does each approach shine?",
  deepDive: {
    hook: "Three separate variables work. But they have a subtle problem: it's possible to be in an impossible state — `isLoading: true, error: 'Failed', data: {...}` all simultaneously. The union approach makes impossible states unrepresentable.",
    pain: "⚠️ **Lesson:** Three separate state variables can represent impossible combinations. How does a status union prevent impossible states — and what tradeoff does it introduce?",
    mentalModel:
      "**Three variables** — possible states include invalid combinations:\n- `{ isLoading: true, error: null, data: null }` ✅ valid: fetching\n- `{ isLoading: false, error: null, data: {...} }` ✅ valid: success\n- `{ isLoading: false, error: 'Failed', data: null }` ✅ valid: error\n- `{ isLoading: true, error: 'Failed', data: {...} }` ❌ impossible but representable\n\n**Status union** — impossible states are unrepresentable:\n```tsx\ntype FetchStatus = 'loading' | 'error' | 'success';\nconst [status, setStatus] = useState<FetchStatus>('loading');\nconst [data, setData] = useState<ShipmentDetail | null>(null);\nconst [error, setError] = useState<string | null>(null);\n```\nOr fully discriminated:\n```tsx\ntype FetchState =\n  | { status: 'loading' }\n  | { status: 'error'; message: string }\n  | { status: 'success'; data: ShipmentDetail };\nconst [state, setState] = useState<FetchState>({ status: 'loading' });\n```",
    discover:
      "```tsx\n// ✅ three variables — simple, learnable, slightly leaky\nconst [isLoading, setIsLoading] = useState(true);\nconst [error, setError] = useState<string | null>(null);\nconst [data, setData] = useState<ShipmentDetail | null>(null);\n\n// ✅ discriminated union — no impossible states\ntype FetchState =\n  | { status: 'loading' }\n  | { status: 'error'; message: string }\n  | { status: 'success'; data: ShipmentDetail };\nconst [state, setState] = useState<FetchState>({ status: 'loading' });\n```",
    quickRules:
      "- ✅ three variables: simpler, good for learning, fine for most apps\n- ✅ discriminated union: no impossible states, TypeScript narrowing in switch\n- ✅ React Query / SWR: handles all of this + caching, background refetch, deduplication\n- choose based on team comfort and app complexity",
    watchOut:
      "👀 **Watch out:** With three variables, always update all three atomically in the handlers — success sets `data`, clears `error`, and sets `isLoading: false`. Never leave them in a partial update. React 18 batches these anyway, but the intent matters.",
    dryRun:
      "🔁 **Think:** Three variables. A fetch succeeds. You call `setShipmentData(data)` but forget to call `setIsLoading(false)`. What state are you in — and what does the user see?",
    build:
      "**Learning focus:** Set up the three-variable data fetch state — understanding that isLoading starts true, and that three independent variables can represent impossible combinations (which a discriminated union solves).",
  },
},
{
  id: "step2",
  type: "question",
  phase: "Step 2 of 5",
  paal: "Add a useEffect that fetches from '/api/shipments/{shipmentId}' when shipmentId changes. On success set shipmentData and clear loading. On failure set error and clear loading.",
  hint: "useEffect callbacks cannot be async. Define an async function inside the effect and call it. Handle both success and catch paths.",
  example_code: `useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await fetch(\`/api/orders/\${orderId}\`);
      if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
      const data = await res.json();
      setOrderData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fetch failed');
    } finally {
      setIsLoading(false);
    }
  };
  fetchData();
}, [orderId]);`,
  think_prompt:
    "useEffect's callback cannot be async because async functions return Promises but useEffect expects either nothing or a cleanup function. How do you use async/await inside an effect?",
  mc_options: [
    "useEffect(async () => { const data = await fetch(...); }, [shipmentId])",
    "useEffect(() => { const fetchData = async () => { ... }; fetchData(); }, [shipmentId])",
    "useEffect(() => { fetch(...).then(r => r.json()).then(setShipmentData); }, [shipmentId])",
  ],
  mc_correct_option:
    "useEffect(() => { const fetchData = async () => { ... }; fetchData(); }, [shipmentId])",
  mc_anchor:
    "Defining an async function inside the effect and immediately calling it is the standard pattern. An async effect callback (`async () =>`) returns a Promise — React interprets any returned value from an effect as a cleanup function, receives a Promise, and ignores it silently (but with a warning in some setups). The `.then()` chain also works but is harder to read with multiple await points and error handling.",
  why_this_matters:
    "This inner-async-function pattern appears in virtually every data-fetching effect in production React codebases. Understanding why useEffect can't be async directly — and the idiomatic workaround — is essential knowledge for any React developer.",
  answer_keywords: [
    "fetchData", "async", "await", "fetch", "shipmentId",
    "setShipmentData", "setError", "setIsLoading", "false",
    "try", "catch", "finally",
  ],
  seed_code: `import { useState, useEffect } from 'react';

interface ShipmentDetail {
  shipmentId: string;
  destination: string;
  status: string;
  carrier: string;
}

interface ShipmentDetailProps {
  shipmentId: string;
}

const ShipmentDetailPanel = ({ shipmentId }: ShipmentDetailProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shipmentData, setShipmentData] = useState<ShipmentDetail | null>(null);

  return <div />;
};`,
  starter_code: `import { useState, useEffect } from 'react';

interface ShipmentDetail {
  shipmentId: string;
  destination: string;
  status: string;
  carrier: string;
}

interface ShipmentDetailProps {
  shipmentId: string;
}

const ShipmentDetailPanel = ({ shipmentId }: ShipmentDetailProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shipmentData, setShipmentData] = useState<ShipmentDetail | null>(null);

  // add useEffect here — fetch /api/shipments/{shipmentId}
  // inner async function, try/catch/finally
  // dep: [shipmentId]

  return <div />;
};`,
  feedback_correct:
    "Exactly — the inner async function pattern is the idiomatic way to use await inside an effect. try/catch/finally ensures all three state transitions happen correctly regardless of success or failure.",
  feedback_partial:
    "Close — check two things: the effect callback itself must NOT be async (no async keyword directly on the arrow function), and setIsLoading(false) should be in the `finally` block so it runs regardless of success or failure.",
  feedback_wrong:
    "Inside useEffect: define `const fetchData = async () => { try { const res = await fetch(...); const data = await res.json(); setShipmentData(data); setError(null); } catch(err) { setError(...); } finally { setIsLoading(false); } }; fetchData();`",
  expected: `import { useState, useEffect } from 'react';

interface ShipmentDetail {
  shipmentId: string;
  destination: string;
  status: string;
  carrier: string;
}

interface ShipmentDetailProps {
  shipmentId: string;
}

const ShipmentDetailPanel = ({ shipmentId }: ShipmentDetailProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shipmentData, setShipmentData] = useState<ShipmentDetail | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(\`/api/shipments/\${shipmentId}\`);
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
        const data: ShipmentDetail = await res.json();
        setShipmentData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load shipment');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [shipmentId]);

  return <div />;
};`,
  analog_example: `useEffect(() => {
  const load = async () => {
    try {
      const res = await fetch(\`/api/users/\${userId}\`);
      const data = await res.json();
      setUser(data);
    } catch (err) {
      setError('Failed to load user');
    } finally {
      setIsLoading(false);
    }
  };
  load();
}, [userId]);`,
  deepDiveLabel:
    "Why can't the useEffect callback be async — and what goes wrong if you try?",
  deepDive: {
    hook: "You write `useEffect(async () => { ... }, [shipmentId])`. React doesn't throw. The fetch works. But in the browser console: 'Warning: An update to ShipmentDetailPanel inside a test was not wrapped in act(...)'. And sometimes: 'Warning: Cannot update a component while rendering a different component.' The async effect is technically functional but causing subtle issues.",
    pain: "⚠️ **Lesson:** `useEffect(async () => ...)` is not explicitly prohibited by React — so why does the ecosystem strongly recommend against it, and what does an async callback actually return?",
    mentalModel:
      "An async function always returns a Promise. useEffect inspects its callback's return value and treats it as a cleanup function if it's a function. When you pass an async callback:\n- React calls it → gets back a Promise\n- React tries to call the Promise as a cleanup function\n- A Promise is not callable — React ignores it silently\n\nThis means: there's no way to return a real cleanup function from an async effect callback. Any cleanup you need (like aborting a fetch) can't be returned from the async function.\n\nThe inner async function pattern:\n```tsx\nuseEffect(() => {\n  const fetchData = async () => { /* ... */ };\n  fetchData();\n  return () => { /* cleanup works here */ };\n}, [dep]);\n```\nThe outer callback is synchronous — it can return a real cleanup function.",
    discover:
      "```tsx\n// ❌ async effect — no cleanup possible, misleading\nuseEffect(async () => {\n  const data = await fetch(...);\n  setData(data);\n  // return () => cleanup(); // This is inside an async function — returns Promise<void>, not a cleanup\n}, [dep]);\n\n// ✅ inner async function — cleanup works correctly\nuseEffect(() => {\n  const controller = new AbortController();\n  const fetchData = async () => { /* ... */ };\n  fetchData();\n  return () => controller.abort(); // real cleanup function\n}, [dep]);\n```",
    quickRules:
      "- ❌ `useEffect(async () => ...)` — no cleanup possible, Promise returned silently ignored\n- ✅ inner async function: `const fn = async () => {}; fn();` — cleanup works\n- ✅ `.then()` chain — also allows cleanup, less readable for complex flows\n- always use the inner function pattern for async effects",
    watchOut:
      "👀 **Watch out:** Some ESLint configurations will actually error on async effect callbacks. The rule `react-hooks/exhaustive-deps` doesn't cover this — look for a separate `no-async-effect` rule in some codebases.",
    dryRun:
      "🔁 **Think:** `useEffect(async () => { await fetchData(); return () => cleanup(); }, [dep])`. The async function's return value is a Promise. React receives that Promise — does it call `cleanup()`? What happens to the cleanup function inside the async function?",
    build:
      "**Learning focus:** Write async data fetching inside useEffect using the inner async function pattern — understanding why the callback itself can't be async (no cleanup possible) and how the inner function pattern solves it.",
  },
},
{
  id: "step3",
  type: "question",
  phase: "Step 3 of 5",
  paal: "Add conditional rendering for all three states — loading spinner, error message, and success data display.",
  hint: "Use early returns for loading and error. The main return handles the success state. When shipmentData is null after loading, error already returned — so in the success path shipmentData is always non-null.",
  example_code: `if (isLoading) return <div>Loading...</div>;
if (error) return <div className="error">{error}</div>;
if (!orderData) return null;

return (
  <div>
    <h2>{orderData.orderId}</h2>
  </div>
);`,
  think_prompt:
    "After the loading and error guards return early, what is TypeScript's understanding of shipmentData's type in the success path — is it still `ShipmentDetail | null` or has TypeScript narrowed it?",
  mc_options: [
    "TypeScript still considers shipmentData as ShipmentDetail | null — a null check is still needed",
    "TypeScript narrows shipmentData to ShipmentDetail after the isLoading and error guards — no null check needed",
    "TypeScript cannot narrow based on different state variables — a null check is always required",
  ],
  mc_correct_option:
    "TypeScript still considers shipmentData as ShipmentDetail | null — a null check is still needed",
  mc_anchor:
    "TypeScript cannot infer that 'if isLoading is false and error is null, then shipmentData must be non-null' — these are separate state variables with no declared relationship. A third guard `if (!shipmentData) return null` is needed before TypeScript narrows the type. This is one reason the discriminated union pattern (Lesson 23 deep dive) is more type-safe — TypeScript can narrow the full state in a switch.",
  why_this_matters:
    "TypeScript's type narrowing only works on the specific value being checked — not on inferred relationships between separate variables. This limitation shapes how enterprise codebases structure their fetch state, often motivating the move to discriminated unions or data-fetching libraries.",
  answer_keywords: [
    "isLoading", "return", "error", "shipmentData",
    "shipmentId", "destination", "status", "carrier",
  ],
  seed_code: `import { useState, useEffect } from 'react';

interface ShipmentDetail {
  shipmentId: string;
  destination: string;
  status: string;
  carrier: string;
}

interface ShipmentDetailProps {
  shipmentId: string;
}

const ShipmentDetailPanel = ({ shipmentId }: ShipmentDetailProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shipmentData, setShipmentData] = useState<ShipmentDetail | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(\`/api/shipments/\${shipmentId}\`);
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
        const data: ShipmentDetail = await res.json();
        setShipmentData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load shipment');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [shipmentId]);

  return <div />;
};`,
  starter_code: `import { useState, useEffect } from 'react';

interface ShipmentDetail {
  shipmentId: string;
  destination: string;
  status: string;
  carrier: string;
}

interface ShipmentDetailProps {
  shipmentId: string;
}

const ShipmentDetailPanel = ({ shipmentId }: ShipmentDetailProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shipmentData, setShipmentData] = useState<ShipmentDetail | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(\`/api/shipments/\${shipmentId}\`);
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
        const data: ShipmentDetail = await res.json();
        setShipmentData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load shipment');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [shipmentId]);

  // add conditional rendering for all three states
  // use early returns for loading and error
  // third guard for null shipmentData
  // success: render shipmentData fields

  return <div />;
};`,
  feedback_correct:
    "Exactly — three early returns handle the non-success states. TypeScript narrows shipmentData to ShipmentDetail in the success path after the null guard. The success JSX is clean and type-safe.",
  feedback_partial:
    "Close — make sure you have all three guards: `if (isLoading)`, `if (error)`, AND `if (!shipmentData)`. Without the third, TypeScript still types shipmentData as `ShipmentDetail | null` in the success path.",
  feedback_wrong:
    "Add three guards before the success return: `if (isLoading) return <div>Loading...</div>; if (error) return <p className='error'>{error}</p>; if (!shipmentData) return null;` Then the success JSX renders `shipmentData.shipmentId`, `.destination`, etc.",
  expected: `import { useState, useEffect } from 'react';

interface ShipmentDetail {
  shipmentId: string;
  destination: string;
  status: string;
  carrier: string;
}

interface ShipmentDetailProps {
  shipmentId: string;
}

const ShipmentDetailPanel = ({ shipmentId }: ShipmentDetailProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shipmentData, setShipmentData] = useState<ShipmentDetail | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(\`/api/shipments/\${shipmentId}\`);
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
        const data: ShipmentDetail = await res.json();
        setShipmentData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load shipment');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [shipmentId]);

  if (isLoading) return <div className="loading">Loading shipment...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!shipmentData) return null;

  return (
    <div className="shipment-detail">
      <h2>{shipmentData.shipmentId}</h2>
      <p>Destination: {shipmentData.destination}</p>
      <p>Status: {shipmentData.status}</p>
      <p>Carrier: {shipmentData.carrier}</p>
    </div>
  );
};`,
  analog_example: `if (isLoading) return <Spinner />;
if (error) return <ErrorState message={error} />;
if (!userData) return null;
return <ProfileCard user={userData} />;`,
  deepDiveLabel:
    "Three early returns keep the success JSX clean — but what about showing stale data during a refetch?",
  deepDive: {
    hook: "The user selects shipment NX-001. Data loads, renders. They select NX-002. isLoading becomes true. The loading spinner replaces the NX-001 data — the screen flashes blank then spinner then NX-002 data. A smoother UX would show NX-001's data while NX-002 loads, then swap. But isLoading: true hides everything.",
    pain: "⚠️ **Lesson:** The three-state pattern hides data during refetch, causing a layout flash. How do you preserve the previous data visible while new data loads?",
    mentalModel:
      "Two approaches:\n\n1. **Keep previous data during refetch**: Don't reset shipmentData to null when a new fetch starts. Only update it when the new data arrives. Show a loading indicator as an overlay, not a replacement.\n\n2. **React Query / SWR**: These libraries maintain a cache — previous data is served from cache instantly while a background refetch runs. This is called 'stale-while-revalidate'. It's one of the primary reasons teams adopt these libraries.\n\n```tsx\n// Keep previous data during refetch:\nuseEffect(() => {\n  setIsLoading(true); // show overlay spinner\n  setError(null);     // clear old error\n  // DON'T setShipmentData(null) — keep previous data visible\n  const fetchData = async () => { ... };\n  fetchData();\n}, [shipmentId]);\n```",
    discover:
      "```tsx\n// ✅ preserve previous data during refetch\nuseEffect(() => {\n  setIsLoading(true);\n  setError(null);\n  // shipmentData stays as previous value during fetch\n  const fetchData = async () => {\n    try {\n      const data = await fetchShipment(shipmentId);\n      setShipmentData(data);\n    } catch (err) {\n      setError(...);\n    } finally {\n      setIsLoading(false);\n    }\n  };\n  fetchData();\n}, [shipmentId]);\n\n// In JSX: show overlay spinner instead of replacing content\n{isLoading && <div className='overlay-spinner' />}\n{!isLoading && error && <ErrorState message={error} />}\n{shipmentData && <DataView data={shipmentData} />}\n```",
    quickRules:
      "- ✅ reset isLoading to true, clear error, but keep previous data during refetch\n- ✅ overlay spinner over previous data instead of replacing it\n- ✅ React Query / SWR: stale-while-revalidate built in\n- ❌ resetting data to null on every fetch — causes layout flash",
    watchOut:
      "👀 **Watch out:** Preserving previous data during refetch can show stale data if the refetch fails. Decide: is showing possibly stale data better than showing a spinner? For most UIs, yes — but for financial or safety-critical data, show the spinner and never show stale data.",
    dryRun:
      "🔁 **Think:** User selects NX-002 while NX-001 data is displayed. Without resetting data: what does the user see during the NX-002 fetch? With resetting data to null: what does the user see? Which is the better UX for a logistics dashboard?",
    build:
      "**Learning focus:** Build the three-state data fetching UI with conditional rendering — and understand how to preserve previous data during refetch to avoid layout flashes.",
  },
},
{
  id: "step4",
  type: "question",
  phase: "Step 4 of 5",
  paal: "Add an AbortController to cancel the in-flight fetch when the effect re-runs (shipmentId changes) or the component unmounts. Return the abort call as the effect cleanup.",
  hint: "Create `const controller = new AbortController()` inside the effect. Pass `{ signal: controller.signal }` to fetch. Return `() => controller.abort()` as the cleanup.",
  example_code: `useEffect(() => {
  const controller = new AbortController();

  const fetchData = async () => {
    try {
      const res = await fetch(url, { signal: controller.signal });
      const data = await res.json();
      setData(data);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setIsLoading(false);
    }
  };

  fetchData();
  return () => controller.abort();
}, [id]);`,
  think_prompt:
    "When shipmentId changes to NX-002 before NX-001's fetch completes, the NX-001 response arrives and calls setShipmentData — overwriting NX-002's data with stale NX-001 data. The abort signal prevents this. But when an aborted fetch throws, what does the error look like — and should you show it as an error state?",
  mc_options: [
    "Catch all errors including AbortError and show them as error states",
    "Check err.name === 'AbortError' in the catch block and return early — don't set error state for intentional cancellations",
    "Abort errors don't throw — the fetch just resolves to null",
  ],
  mc_correct_option:
    "Check err.name === 'AbortError' in the catch block and return early — don't set error state for intentional cancellations",
  mc_anchor:
    "When a fetch is aborted, it throws a DOMException with name 'AbortError'. This is an intentional cancellation — not a real failure. Setting the error state would show an error message to the user for something that wasn't an error. The early return in the catch for AbortError ensures the component silently ignores the cancelled request.",
  why_this_matters:
    "Race conditions in data fetching are a real, common bug in enterprise apps — especially in search-as-you-type, filter changes, and navigation between list items. AbortController is the native solution. Understanding it at the useEffect level is the foundation for understanding how React Query's automatic cancellation works.",
  answer_keywords: [
    "AbortController", "controller", "signal", "controller.signal",
    "controller.abort", "AbortError", "err.name", "return",
  ],
  seed_code: `import { useState, useEffect } from 'react';

interface ShipmentDetail {
  shipmentId: string;
  destination: string;
  status: string;
  carrier: string;
}

interface ShipmentDetailProps {
  shipmentId: string;
}

const ShipmentDetailPanel = ({ shipmentId }: ShipmentDetailProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shipmentData, setShipmentData] = useState<ShipmentDetail | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(\`/api/shipments/\${shipmentId}\`);
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
        const data: ShipmentDetail = await res.json();
        setShipmentData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load shipment');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [shipmentId]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!shipmentData) return null;

  return <div><h2>{shipmentData.shipmentId}</h2></div>;
};`,
  starter_code: `import { useState, useEffect } from 'react';

interface ShipmentDetail {
  shipmentId: string;
  destination: string;
  status: string;
  carrier: string;
}

interface ShipmentDetailProps {
  shipmentId: string;
}

const ShipmentDetailPanel = ({ shipmentId }: ShipmentDetailProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shipmentData, setShipmentData] = useState<ShipmentDetail | null>(null);

  useEffect(() => {
    // add AbortController here
    // pass signal to fetch
    // check for AbortError in catch
    // return cleanup that calls controller.abort()

    const fetchData = async () => {
      try {
        const res = await fetch(\`/api/shipments/\${shipmentId}\`);
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
        const data: ShipmentDetail = await res.json();
        setShipmentData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load shipment');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [shipmentId]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!shipmentData) return null;
  return <div><h2>{shipmentData.shipmentId}</h2></div>;
};`,
  feedback_correct:
    "Exactly — AbortController created, signal passed to fetch, AbortError silently ignored in catch, and `controller.abort()` returned as cleanup. No race conditions, no stale updates.",
  feedback_partial:
    "Close — check three things: `{ signal: controller.signal }` passed as the fetch second argument, `if (err.name === 'AbortError') return;` at the top of catch, and `return () => controller.abort()` at the end of the effect (not inside fetchData).",
  feedback_wrong:
    "Add `const controller = new AbortController();` before fetchData. In fetch: `fetch(url, { signal: controller.signal })`. In catch: `if (err instanceof Error && err.name === 'AbortError') return;` before setError. After `fetchData();` return: `return () => controller.abort();`",
  expected: `import { useState, useEffect } from 'react';

interface ShipmentDetail {
  shipmentId: string;
  destination: string;
  status: string;
  carrier: string;
}

interface ShipmentDetailProps {
  shipmentId: string;
}

const ShipmentDetailPanel = ({ shipmentId }: ShipmentDetailProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shipmentData, setShipmentData] = useState<ShipmentDetail | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const res = await fetch(\`/api/shipments/\${shipmentId}\`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
        const data: ShipmentDetail = await res.json();
        setShipmentData(data);
        setError(null);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Failed to load shipment');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [shipmentId]);

  if (isLoading) return <div className="loading">Loading shipment...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!shipmentData) return null;

  return (
    <div className="shipment-detail">
      <h2>{shipmentData.shipmentId}</h2>
      <p>Destination: {shipmentData.destination}</p>
      <p>Status: {shipmentData.status}</p>
      <p>Carrier: {shipmentData.carrier}</p>
    </div>
  );
};`,
  analog_example: `useEffect(() => {
  const controller = new AbortController();
  fetchUser(userId, controller.signal).then(setUser).catch(handleError);
  return () => controller.abort();
}, [userId]);`,
  deepDiveLabel:
    "AbortController cancels the request — but the finally block still runs after abort. Does that cause issues?",
  deepDive: {
    hook: "The abort triggers. The fetch throws an AbortError. You return early in catch — setError is not called. But `finally { setIsLoading(false) }` still runs. The component may have already unmounted. React logs: 'Cannot update a React component while rendering a different component'.",
    pain: "⚠️ **Lesson:** `finally` always runs — even after an abort and even if the component has unmounted. How do you prevent state updates from running on an unmounted component?",
    mentalModel:
      "Two approaches:\n\n1. **Ignore AbortError in finally** (move the loading reset inside try/catch):\n```tsx\ntry {\n  const data = await fetch(url, { signal });\n  setShipmentData(data);\n  setError(null);\n  setIsLoading(false); // only on success\n} catch (err) {\n  if (err.name === 'AbortError') return; // no setIsLoading either\n  setError(...);\n  setIsLoading(false); // only on real error\n}\n```\n\n2. **Mounted ref** (check if still mounted before any setState):\n```tsx\nconst isMounted = useRef(true);\nuseEffect(() => {\n  isMounted.current = true;\n  return () => { isMounted.current = false; };\n});\n// Inside async: if (!isMounted.current) return;\n```\n\nApproach 1 is simpler. Approach 2 is more robust for complex cases.",
    discover:
      "```tsx\n// ✅ approach 1 — early return skips finally\ntry { ... setIsLoading(false); }\ncatch (err) {\n  if (err.name === 'AbortError') return; // skips everything below\n  setError(...); setIsLoading(false);\n}\n\n// ✅ approach 2 — mounted ref prevents stale updates\nconst isMounted = useRef(true);\nreturn () => { isMounted.current = false; };\n// Before each setState: if (!isMounted.current) return;\n```",
    quickRules:
      "- ✅ return early in catch for AbortError before any setState (including finally if restructured)\n- ✅ mounted ref for complex effects with many async operations\n- ❌ `finally { setState(...) }` when the component may have unmounted\n- React 18 suppresses the stale update warning in most cases — but the logic is still wrong",
    watchOut:
      "👀 **Watch out:** React 18 largely removed the 'cannot update an unmounted component' warning — but the underlying problem (stale updates) still exists. Just because React doesn't warn doesn't mean the code is correct.",
    dryRun:
      "🔁 **Think:** ShipmentDetailPanel unmounts while NX-001's fetch is in flight. AbortController aborts the request. The fetch throws AbortError. The catch returns early. Does `finally { setIsLoading(false) }` still run? What happens when setIsLoading is called after unmount?",
    build:
      "**Learning focus:** Add AbortController cleanup to cancel in-flight fetches — understanding that AbortError is intentional (not an error state) and that finally may still run on unmounted components.",
  },
},
{
  id: "step5",
  type: "question",
  phase: "Step 5 of 5",
  paal: "Reset isLoading to true and clear the previous data when shipmentId changes, so the user sees a fresh loading state for each new shipment rather than stale data during the transition.",
  hint: "Add setIsLoading(true), setError(null), and setShipmentData(null) at the top of the useEffect, before calling fetchData. These run synchronously before the async fetch begins.",
  example_code: `useEffect(() => {
  setIsLoading(true);
  setError(null);
  setData(null); // clear stale data

  const controller = new AbortController();
  // ... rest of fetch
}, [id]);`,
  think_prompt:
    "When shipmentId changes, the previous data is still in state. Should you clear it immediately (show loading state) or keep it visible until new data arrives (smoother but shows stale data)?",
  mc_options: [
    "Clear data on every shipmentId change — always show a fresh loading state",
    "Keep previous data visible during fetch — update only when new data arrives",
    "Both are valid UX choices — the decision depends on whether showing stale data is acceptable",
  ],
  mc_correct_option:
    "Both are valid UX choices — the decision depends on whether showing stale data is acceptable",
  mc_anchor:
    "This is genuinely a UX decision, not a technical one. Clearing state immediately gives a clean transition but causes a loading flash. Preserving state feels smoother but shows stale data during transition. For a logistics dashboard where shipments can have different statuses, showing NX-001's 'Active' status while NX-002 (which is 'Delayed') loads could be misleading. Clear is safer for data accuracy. The answer depends on the specific domain.",
  why_this_matters:
    "Understanding that this is a deliberate design choice — not a technical requirement — is what separates junior developers from senior ones. The technical implementation is identical; the right choice requires understanding the business context and user expectations.",
  answer_keywords: [
    "setIsLoading", "true", "setError", "null",
    "setShipmentData", "null", "useEffect",
  ],
  seed_code: `import { useState, useEffect } from 'react';

interface ShipmentDetail {
  shipmentId: string;
  destination: string;
  status: string;
  carrier: string;
}

interface ShipmentDetailProps {
  shipmentId: string;
}

const ShipmentDetailPanel = ({ shipmentId }: ShipmentDetailProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shipmentData, setShipmentData] = useState<ShipmentDetail | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        const res = await fetch(\`/api/shipments/\${shipmentId}\`, { signal: controller.signal });
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
        const data: ShipmentDetail = await res.json();
        setShipmentData(data);
        setError(null);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Failed to load shipment');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    return () => controller.abort();
  }, [shipmentId]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!shipmentData) return null;
  return <div><h2>{shipmentData.shipmentId}</h2></div>;
};`,
  starter_code: `import { useState, useEffect } from 'react';

interface ShipmentDetail {
  shipmentId: string;
  destination: string;
  status: string;
  carrier: string;
}

interface ShipmentDetailProps {
  shipmentId: string;
}

const ShipmentDetailPanel = ({ shipmentId }: ShipmentDetailProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shipmentData, setShipmentData] = useState<ShipmentDetail | null>(null);

  useEffect(() => {
    // add state resets here — setIsLoading(true), setError(null), setShipmentData(null)

    const controller = new AbortController();
    const fetchData = async () => {
      try {
        const res = await fetch(\`/api/shipments/\${shipmentId}\`, { signal: controller.signal });
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
        const data: ShipmentDetail = await res.json();
        setShipmentData(data);
        setError(null);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Failed to load shipment');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    return () => controller.abort();
  }, [shipmentId]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!shipmentData) return null;
  return <div><h2>{shipmentData.shipmentId}</h2></div>;
};`,
  feedback_correct:
    "Exactly — the three resets at the top of the effect run synchronously before the async fetch begins. Each shipmentId change gives the user a clean loading state for the incoming data.",
  feedback_partial:
    "Close — all three resets are needed: `setIsLoading(true)`, `setError(null)`, and `setShipmentData(null)`. Omitting any one leaves a stale value from the previous fetch.",
  feedback_wrong:
    "Add three lines at the top of the useEffect, before the AbortController: `setIsLoading(true); setError(null); setShipmentData(null);` — these run synchronously on each shipmentId change.",
  expected: `import { useState, useEffect } from 'react';

interface ShipmentDetail {
  shipmentId: string;
  destination: string;
  status: string;
  carrier: string;
}

interface ShipmentDetailProps {
  shipmentId: string;
}

const ShipmentDetailPanel = ({ shipmentId }: ShipmentDetailProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shipmentData, setShipmentData] = useState<ShipmentDetail | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setShipmentData(null);

    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const res = await fetch(\`/api/shipments/\${shipmentId}\`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
        const data: ShipmentDetail = await res.json();
        setShipmentData(data);
        setError(null);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Failed to load shipment');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [shipmentId]);

  if (isLoading) return <div className="loading">Loading shipment...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!shipmentData) return null;

  return (
    <div className="shipment-detail">
      <h2>{shipmentData.shipmentId}</h2>
      <p>Destination: {shipmentData.destination}</p>
      <p>Status: {shipmentData.status}</p>
      <p>Carrier: {shipmentData.carrier}</p>
    </div>
  );
};`,
  analog_example: `useEffect(() => {
  setIsLoading(true);
  setError(null);
  setUser(null);
  // ... fetch
}, [userId]);`,
  deepDiveLabel:
    "Manual data fetching in useEffect — when do you reach for React Query or SWR instead?",
  deepDive: {
    hook: "Your manual fetch works. It handles loading, error, success, cancellation, and state resets. 80 lines for a data-fetching component. Your teammate's equivalent with React Query is 15 lines — and also handles caching, background refetch, pagination, and deduplication of simultaneous requests.",
    pain: "⚠️ **Lesson:** Manual useEffect fetching is the foundation. At what point does React Query or SWR pay for the added dependency?",
    mentalModel:
      "**Manual useEffect fetching** gives you:\n- Full control, no abstractions\n- Good for learning, one-off fetches\n- Requires writing loading/error/abort/reset every time\n\n**React Query / SWR** adds:\n- Automatic caching — same data isn't refetched if recently loaded\n- Background refetch — silently refreshes stale data\n- Deduplication — two components requesting the same endpoint share one request\n- Automatic retry on network error\n- Pagination and infinite scroll utilities\n- DevTools for cache inspection\n\n**Signal to adopt**: when you have 3+ components fetching data, find yourself copy-pasting the loading/error/abort pattern, or need caching across components.",
    discover:
      "```tsx\n// Manual — 80 lines, no caching\nconst [isLoading, setIsLoading] = useState(true);\nconst [error, setError] = useState<string | null>(null);\nconst [data, setData] = useState<ShipmentDetail | null>(null);\nuseEffect(() => { /* abort, fetch, set states */ }, [id]);\n\n// React Query — 5 lines, caching + background refetch\nconst { data, isLoading, error } = useQuery({\n  queryKey: ['shipment', shipmentId],\n  queryFn: () => fetchShipment(shipmentId),\n});\n```",
    quickRules:
      "- ✅ manual useEffect: learning, simple apps, one-off fetches\n- ✅ React Query / SWR: 3+ data-fetching components, caching needed, team velocity matters\n- ✅ understand manual first — React Query abstracts the same patterns you just built\n- ❌ reaching for React Query before understanding what it replaces",
    watchOut:
      "👀 **Watch out:** React Query's `queryFn` should be a clean function that just fetches and returns data — AbortController is handled automatically by React Query via its own signal mechanism. Don't recreate the abort logic inside a React Query queryFn.",
    dryRun:
      "🔁 **Think:** Two components — ShipmentDetailPanel and ShipmentSidebar — both request `/api/shipments/NX-001` at the same time with manual useEffect. How many HTTP requests fire? With React Query and the same queryKey: how many HTTP requests fire?",
    build:
      "**Learning focus:** Complete the data fetching pattern with state resets on dependency change — and understand when the manual useEffect approach should give way to a dedicated data-fetching library.",
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
  lessonNum: 25,
  title: "useEffect — Dependencies",
  shortName: "HOOKS — EFFECT DEPS",
});
