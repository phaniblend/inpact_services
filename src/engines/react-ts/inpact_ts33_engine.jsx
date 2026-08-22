import createINPACTEngine from "../inpact_engine_shared";

function normalizeCode(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

function evalL33Step1(answer) {
  const raw = String(answer || "");
  const hasUsePrefix = /function\s+useShipmentStatus\s*\(|const\s+useShipmentStatus\s*=/m.test(raw);
  const hasUseState = /useState/m.test(raw);
  const hasReturn = /return\s+[\[{]/m.test(raw);
  return hasUsePrefix && hasUseState && hasReturn ? "correct" : hasUsePrefix ? "partial" : "wrong";
}

function evalL33Step2(answer) {
  const raw = String(answer || "");
  const hasUseEffect = /useEffect\s*\(/m.test(raw);
  const hasDeps = /\[\s*shipmentId\s*\]/m.test(raw);
  const hasSetLoading = /setIsLoading\s*\(\s*true\s*\)/m.test(raw);
  return hasUseEffect && hasDeps && hasSetLoading ? "correct" : hasUseEffect && hasDeps ? "partial" : "wrong";
}

function evalL33Step3(answer) {
  const raw = String(answer || "");
  const hasTryCatch = /try\s*\{[\s\S]*?\}\s*catch/m.test(raw);
  const hasSetStatus = /setStatus\s*\(/m.test(raw);
  const hasFinally = /finally\s*\{[\s\S]*?setIsLoading\s*\(\s*false\s*\)/m.test(raw);
  return hasTryCatch && hasSetStatus && hasFinally ? "correct" : hasTryCatch && hasSetStatus ? "partial" : "wrong";
}

function evalL33Step4(answer) {
  const raw = String(answer || "");
  const hasHookCall = /useShipmentStatus\s*\(/m.test(raw);
  const hasDestructure = /const\s*\{[^}]*status[^}]*\}\s*=\s*useShipmentStatus/m.test(raw) ||
    /const\s*\[[^\]]*\]\s*=\s*useShipmentStatus/m.test(raw);
  const hasConditional = /isLoading|error/m.test(raw);
  return hasHookCall && hasDestructure && hasConditional ? "correct" : hasHookCall && hasDestructure ? "partial" : "wrong";
}

function evalL33Step5(answer) {
  const raw = String(answer || "");
  const hasReturn = /return\s*\{/m.test(raw);
  const hasStatus = /status/m.test(raw);
  const hasIsLoading = /isLoading/m.test(raw);
  const hasError = /error/m.test(raw);
  return hasReturn && hasStatus && hasIsLoading && hasError ? "correct" : hasReturn && hasStatus ? "partial" : "wrong";
}

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "LESSON #33 (CUSTOM HOOKS)",
      title: "Custom Hook — Extract Logic",
      body: "Learn how to pull stateful logic out of a component and into a reusable custom hook. You'll extract fetch + loading + error state management from a ShipmentStatus component into a `useShipmentStatus` hook — keeping the component clean and the logic portable.",
      usecase:
        "Every real application has components that mix display concerns with data-fetching logic. When two components need the same fetch pattern, you copy-paste — and both copies drift apart. A custom hook is the extraction point: move the logic once, reuse it everywhere, test it independently.",
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
        reason: "The component shell in Step 4 uses arrow function syntax and JSX return. Without knowing how to define a component and embed expressions, the consumer component that calls the hook can't be written.",
      },
      {
        lesson: 10,
        label: "useState — Primitives",
        reason: "Step 1 initialises `status`, `isLoading`, and `error` with `useState`. Understanding that each call creates an independent state slot — and that the setter triggers a re-render — is required before you can reason about why the hook works at all.",
      },
      {
        lesson: 24,
        label: "useEffect — Mount",
        reason: "Step 2 wraps the fetch call in `useEffect`. The mount mental model from Lesson 24 — effect runs after render, not during — explains why `isLoading` can be set to `true` inside the effect and the component still sees the initial `false` on first render.",
      },
      {
        lesson: 25,
        label: "useEffect — Dependencies",
        reason: "Step 2's dependency array `[shipmentId]` causes the effect to re-run whenever the shipment ID changes. Without Lesson 25's model of how React compares dependency values, the re-run behaviour looks accidental rather than intentional.",
      },
    ],
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Define a custom hook with a `use` prefix and initialise its state with useState",
      "Move a useEffect fetch call with a dependency array into the hook body",
      "Handle loading and error state inside a try/catch/finally block within the effect",
      "Return a plain object from the hook so the consumer can destructure what it needs",
      "Call the hook from a component and use its returned values in conditional JSX",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 5",
    paal: "Define a custom hook called `useShipmentStatus` that accepts `shipmentId: string` and initialises three state variables: `status` (string, initial `''`), `isLoading` (boolean, initial `false`), and `error` (string | null, initial `null`). Return all three from the hook.",
    hint: "A custom hook is just a function whose name starts with `use`. You can call `useState` inside it exactly as you would inside a component.",
    example_code: `function useDriverLocation(driverId: string) {
  const [location, setLocation] = useState<string>('');
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  return { location, isFetching, fetchError };
}`,
    think_prompt:
      "What is the single rule that makes a function a 'custom hook' in React's eyes — and what breaks if you ignore it?",
    mc_options: [
      "It must extend React.Component and override a render method",
      "Its name must start with `use` so React's linter and rules of hooks apply to it",
      "It must be exported from a file named hooks.ts",
    ],
    mc_correct_option:
      "Its name must start with `use` so React's linter and rules of hooks apply to it",
    mc_anchor:
      "The `use` prefix is the contract. React's linter enforces the rules of hooks (don't call hooks conditionally, don't call them in loops) only for functions named `use*`. Without the prefix, you could accidentally call useState inside an `if` block and React would never warn you.",
    why_this_matters:
      "In a shipment tracking platform with 40+ list views, every view that shows shipment status would otherwise contain identical useState + useEffect boilerplate. Extracting to `useShipmentStatus` means a bug fix or a new loading state variant propagates to all 40 views from one file.",
    answer_keywords: ["useShipmentStatus", "useState", "status", "isLoading", "error", "return"],
    seed_code: "",
    starter_code: `// define useShipmentStatus(shipmentId: string) here
// initialise: status (''), isLoading (false), error (string | null)
// return all three`,
    feedback_correct:
      "Correct — three useState calls, all typed, returned as an object. The `use` prefix is the contract that unlocks React's hook rules for this function.",
    feedback_partial:
      "Almost — check that all three state variables are initialised with the right types and that the return statement includes all three. A missing field means the consumer can't destructure it.",
    feedback_wrong:
      "Pattern: `function useShipmentStatus(shipmentId: string) { const [status, setStatus] = useState<string>(''); const [isLoading, setIsLoading] = useState<boolean>(false); const [error, setError] = useState<string | null>(null); return { status, isLoading, error }; }` — three useState calls, typed, returned as an object.",
    expected: `function useShipmentStatus(shipmentId: string) {
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  return { status, isLoading, error };
}`,
    analog_example: `function useRouteHealth(routeId: string) {
  const [health, setHealth] = useState<string>('');
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  return { health, isChecking, checkError };
}`,
    deepDiveLabel:
      "The hook works without the `use` prefix — so what does capitalisation actually enforce?",
    deepDive: {
      hook: "You extract your status logic into a function called `getShipmentStatus`. It works — useState and useEffect run fine. You ship it. Three sprints later, someone calls `getShipmentStatus` inside a click handler. React throws an obscure error about hooks being called conditionally. The linter never caught it. Your review never caught it. The `use` prefix would have caught it the moment it was written.",
      pain: "⚠️ **Lesson:** The hook works without `use` at the moment of writing. But the prefix is what activates the linter rule that prevents hooks from being called in the wrong place. Why does a naming convention carry that much weight?",
      mentalModel:
        "**Mental model: The `use` prefix is a lint contract, not a runtime feature.**\nReact has no way to inspect your function at runtime to decide if it's 'a hook'. The rules of hooks — don't call inside loops, conditions, or event handlers — are enforced by ESLint's `react-hooks/rules-of-hooks` plugin.\nThat plugin only checks functions named `use*`.\nWithout the prefix: your function can use hooks internally, but callers get no protection. The linter won't flag `if (condition) { getShipmentStatus(id); }` — it's not watching non-`use*` functions.\nWith the prefix: the linter treats every call site as a hook call site. Conditional calls, loop calls, nested calls — all flagged immediately at write time.",
      discover: `**Pattern — naming matters:**
\`\`\`tsx
// ✅ custom hook — linter enforces rules of hooks on every call site
function useShipmentStatus(shipmentId: string) {
  const [status, setStatus] = useState<string>('');
  return { status };
}

// ❌ plain function — linter silent even when called conditionally
function getShipmentStatus(shipmentId: string) {
  const [status, setStatus] = useState<string>(''); // no warning here
  return { status };
}

// ❌ call site goes unprotected
function ShipmentCard({ id, show }: { id: string; show: boolean }) {
  if (show) {
    const { status } = getShipmentStatus(id); // linter says nothing
  }
  // React crashes at runtime — hooks must be called unconditionally
}
\`\`\``,
      quickRules:
        "**Quick rules:**\n- ✅ always prefix custom hooks with `use` — `useShipmentStatus`, `useFetch`, `useDebounce`\n- ✅ custom hooks are just functions — no special API, no class, no decorator\n- ✅ they can call any hook (useState, useEffect, useRef, other custom hooks)\n- ❌ don't name them `get*`, `fetch*`, `load*` — those names opt out of linter protection\n- ❌ don't call hooks inside conditions or loops — even inside a correctly named hook",
      watchOut:
        "👀 **Watch out:** Returning state setters directly from a hook is tempting but breaks encapsulation. If you return `setStatus`, any consumer can call `setStatus('invalid')` bypassing any validation inside the hook. Return only the values consumers need to read, and expose specific action functions if the consumer needs to trigger changes.",
      dryRun:
        "🔁 **Think:** You have `useShipmentStatus` returning `{ status, isLoading, error }`. A new screen needs to display a shipment's status AND trigger a manual refresh. How would you extend the hook's return value to expose a `refresh` function — without exposing `setStatus` directly? What would that function do internally, and what would it return to the component?",
      build:
        "**Learning focus:** Extract stateful logic into a custom hook with a `use` prefix, understanding that the prefix is a lint contract — not just a naming convention — that protects every call site from hook rule violations.",
    },
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 5",
    paal: "Add a `useEffect` inside the hook that runs whenever `shipmentId` changes. At the start of the effect, set `isLoading` to `true`. The dependency array must contain exactly `[shipmentId]`.",
    hint: "The dependency array is how React knows when to re-run the effect. If `shipmentId` changes, the status fetch must restart — so it belongs in the array.",
    example_code: `useEffect(() => {
  setIsFetching(true);
  // fetch logic will go here
}, [routeId]);`,
    think_prompt:
      "If you put `[]` as the dependency array instead of `[shipmentId]`, what happens when the parent renders a different shipmentId?",
    mc_options: [
      "The effect re-runs and fetches the new shipment's status",
      "The effect never re-runs — the hook keeps showing the first shipmentId's status forever",
      "React throws an error because the dependency array is wrong",
    ],
    mc_correct_option:
      "The effect never re-runs — the hook keeps showing the first shipmentId's status forever",
    mc_anchor:
      "An empty array `[]` means 'run once on mount, never again'. The effect has no way to know that `shipmentId` changed. Including `shipmentId` in the array tells React: 'this effect depends on this value — re-run whenever it changes.'",
    why_this_matters:
      "A shipment dashboard cycles through dozens of IDs as an operator clicks through entries. If the dependency array is wrong, every click after the first shows stale data — silently. The operator makes decisions on data that hasn't refreshed. In a warehouse context that's a missed pickup or a routing error.",
    answer_keywords: ["useEffect", "setIsLoading", "true", "shipmentId"],
    seed_code: `function useShipmentStatus(shipmentId: string) {
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  return { status, isLoading, error };
}`,
    starter_code: `function useShipmentStatus(shipmentId: string) {
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // add useEffect here — set isLoading to true at the start
  // dependency: [shipmentId]

  return { status, isLoading, error };
}`,
    feedback_correct:
      "Correct — `setIsLoading(true)` at the top of the effect, `[shipmentId]` in the dependency array. The effect will re-fire every time the shipment ID changes.",
    feedback_partial:
      "Almost — check two things: does `setIsLoading(true)` appear at the start of the effect body, and does `[shipmentId]` appear as the second argument to `useEffect`?",
    feedback_wrong:
      "Pattern: `useEffect(() => { setIsLoading(true); }, [shipmentId]);` — the effect fires when shipmentId changes, and the first thing it does is signal that a load is in progress.",
    expected: `function useShipmentStatus(shipmentId: string) {
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
  }, [shipmentId]);

  return { status, isLoading, error };
}`,
    analog_example: `useEffect(() => {
  setIsChecking(true);
  // health check logic here
}, [routeId]);`,
    deepDiveLabel:
      "The linter says `shipmentId` must be in the dependency array — but what actually breaks if you leave it out?",
    deepDive: {
      hook: "Your hook works in testing. Every shipmentId you pass renders the right status. In production, an operator opens the detail drawer, clicks through three shipments — and the status never changes after the first one. The fetch is running (you can see it in DevTools), but the state never updates. The dependency array has `[]`. The effect ran once, captured the first `shipmentId` in a closure, and has been fetching that same ID on every re-run ever since.",
      pain: "⚠️ **Lesson:** The fetch fires — but always for the wrong ID. Why does a closed-over `shipmentId` keep returning the first value even when the prop changes?",
      mentalModel:
        "**Mental model: Closures capture values at the moment the function is created.**\nWhen React creates the effect callback, it takes a snapshot of every variable in scope — including `shipmentId`. With `[]`, React creates the callback once and never re-creates it. That callback has the original `shipmentId` baked in.\nWith `[shipmentId]`, React discards the old callback and creates a new one every time `shipmentId` changes. The new callback captures the new value.\nThe dependency array isn't about 'triggering' the effect — it's about telling React when to create a fresh closure.",
      discover: `**Pattern — dependency arrays:**
\`\`\`tsx
// ✅ correct — effect re-runs with fresh shipmentId on every change
useEffect(() => {
  setIsLoading(true);
  fetchStatus(shipmentId); // always the current ID
}, [shipmentId]);

// ❌ empty array — runs once, closes over the INITIAL shipmentId
useEffect(() => {
  setIsLoading(true);
  fetchStatus(shipmentId); // always the first ID — stale data
}, []);

// ❌ no array — runs after every render, causes infinite loop if fetch sets state
useEffect(() => {
  fetchStatus(shipmentId); // triggers re-render → triggers effect → repeat
});
\`\`\``,
      quickRules:
        "**Quick rules:**\n- ✅ include every variable used inside the effect that comes from props, state, or the outer scope\n- ✅ the linter (`exhaustive-deps`) will flag missing deps — treat its warnings as bugs, not suggestions\n- ❌ `[]` means mount-only — only correct if the effect truly never needs to re-run\n- ❌ no array at all means every render — almost always unintentional and causes infinite loops when state is set inside",
      watchOut:
        "👀 **Watch out:** Functions defined outside the effect are one of the most common missing dependencies. If `fetchStatus` is defined inside the component (not a stable reference), it must go in the dependency array too — or be moved inside the effect. The linter will flag it. Don't suppress the warning by adding `// eslint-disable-next-line` without understanding why.",
      dryRun:
        "🔁 **Think:** You add a `retry` boolean to the dependency array: `[shipmentId, retry]`. The user clicks a Retry button that toggles `retry` from `false` to `true`. Then the effect runs, the fetch succeeds, and you want to reset `retry` back to `false` inside the effect. What happens to the effect when `retry` flips back to `false`?",
      build:
        "**Learning focus:** Use `useEffect` with a dependency array that contains every external value the effect closes over — understanding that the array controls when React re-creates the closure, not just when it fires.",
    },
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 5",
    paal: "Inside the `useEffect`, add a `try/catch/finally` block. In `try`: simulate a fetch by calling `await Promise.resolve('in-transit')` and set the result as `status`. In `catch`: set `error` to the caught error's message. In `finally`: set `isLoading` to `false`. Make the effect callback `async`.",
    hint: "You can't pass an `async` function directly to `useEffect` — wrap it: define an `async` inner function and call it immediately inside the effect.",
    example_code: `useEffect(() => {
  const load = async () => {
    try {
      const result = await Promise.resolve('on-time');
      setHealth(result);
    } catch (err) {
      setCheckError((err as Error).message);
    } finally {
      setIsChecking(false);
    }
  };
  load();
}, [routeId]);`,
    think_prompt:
      "Why can't you write `useEffect(async () => { ... }, [shipmentId])` directly — what does React do with the return value of an async function?",
    mc_options: [
      "async functions return a Promise, but useEffect expects either nothing or a cleanup function — a Promise would be treated as cleanup and cause a React warning",
      "useEffect doesn't support await syntax at all — it's synchronous by design",
      "async useEffect callbacks work but React ignores the returned Promise silently",
    ],
    mc_correct_option:
      "async functions return a Promise, but useEffect expects either nothing or a cleanup function — a Promise would be treated as cleanup and cause a React warning",
    mc_anchor:
      "React expects the callback to return `undefined` or a cleanup function. An `async` function always returns a Promise. React sees the Promise as the cleanup return, which produces a warning and the cleanup never runs correctly. The fix is an inner async IIFE or named function.",
    why_this_matters:
      "try/catch/finally is the pattern that makes loading states honest. `finally` guarantees `isLoading` drops to `false` whether the fetch succeeded or failed. Without it, a single failed fetch can leave the UI in a permanent loading spinner — a silent outage that looks like a slow network.",
    answer_keywords: ["try", "catch", "finally", "setIsLoading", "false", "setStatus", "setError", "async", "await"],
    seed_code: `function useShipmentStatus(shipmentId: string) {
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
  }, [shipmentId]);

  return { status, isLoading, error };
}`,
    starter_code: `function useShipmentStatus(shipmentId: string) {
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    // define an async inner function and call it
    // try: await Promise.resolve('in-transit'), setStatus with result
    // catch: setError with err.message
    // finally: setIsLoading(false)
  }, [shipmentId]);

  return { status, isLoading, error };
}`,
    feedback_correct:
      "Correct — inner async function, try/catch/finally, and `finally` handles the loading reset. This pattern makes loading state bulletproof regardless of fetch outcome.",
    feedback_partial:
      "Almost — check that `setIsLoading(false)` is inside `finally` (not `try`), that you have an inner async function called immediately, and that the `catch` block sets `error`.",
    feedback_wrong:
      "Pattern: define `const fetch = async () => { try { const result = await Promise.resolve('in-transit'); setStatus(result); } catch (err) { setError((err as Error).message); } finally { setIsLoading(false); } }; fetch();` — all inside the useEffect callback.",
    expected: `function useShipmentStatus(shipmentId: string) {
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const fetchStatus = async () => {
      try {
        const result = await Promise.resolve('in-transit');
        setStatus(result);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatus();
  }, [shipmentId]);

  return { status, isLoading, error };
}`,
    analog_example: `useEffect(() => {
  setIsChecking(true);
  const checkRoute = async () => {
    try {
      const result = await Promise.resolve('clear');
      setHealth(result);
    } catch (err) {
      setCheckError((err as Error).message);
    } finally {
      setIsChecking(false);
    }
  };
  checkRoute();
}, [routeId]);`,
    deepDiveLabel:
      "finally runs in both success and failure — so what subtle thing breaks if you put setIsLoading(false) in try instead?",
    deepDive: {
      hook: "Your component has a loading spinner. The fetch succeeds 99% of the time. You put `setIsLoading(false)` at the bottom of the `try` block. In staging, everything looks great. In production, a network blip causes the fetch to throw. The spinner appears — and never goes away. The user refreshes. The team checks the logs. The fetch failed, the `catch` ran, but `setIsLoading` was never called because it was after the line that threw.",
      pain: "⚠️ **Lesson:** One failed fetch leaves the UI permanently in a loading state. No error message, no retry option — just an infinite spinner. Why does placement of a single line relative to `try` vs `finally` determine whether your UI recovers from errors?",
      mentalModel:
        "**Mental model: `try` is optimistic, `finally` is unconditional.**\n- Code inside `try` stops executing the moment an exception is thrown. If `setIsLoading(false)` is on line 5 of the try block and the throw happens on line 3, line 5 never runs.\n- `finally` runs regardless — whether the try succeeded, the catch ran, or an unhandled re-throw happened.\n- For any state that must always return to a baseline (loading off, overlay hidden, button re-enabled), `finally` is the only safe place.",
      discover: `**Pattern — try/catch/finally placement:**
\`\`\`tsx
// ✅ finally guarantees loading resets even on error
const fetchStatus = async () => {
  try {
    const result = await Promise.resolve('in-transit');
    setStatus(result);
  } catch (err) {
    setError((err as Error).message);
  } finally {
    setIsLoading(false); // runs in both success and failure
  }
};

// ❌ setIsLoading in try — skipped on throw
const fetchStatusBroken = async () => {
  try {
    const result = await Promise.resolve('in-transit');
    setStatus(result);
    setIsLoading(false); // never reached if Promise rejects
  } catch (err) {
    setError((err as Error).message);
    // isLoading stays true forever
  }
};
\`\`\``,
      quickRules:
        "**Quick rules:**\n- ✅ put `setIsLoading(false)` in `finally` — never in `try`\n- ✅ `catch` should set a user-facing error state — don't swallow errors silently\n- ✅ `finally` runs even if `catch` rethrows — it's unconditional\n- ❌ don't `return` inside `try` thinking it will skip `finally` — it won't\n- ❌ don't put UI-resetting state in `try` alone — one network blip and your UI gets stuck",
      watchOut:
        "👀 **Watch out:** Setting both `setStatus` and `setError` without clearing the other can leave stale values visible. On a successful retry after an error, `error` is still set from the previous failure unless you explicitly call `setError(null)` at the top of the `try` block. Clear the opposite state at the start of each path.",
      dryRun:
        "🔁 **Think:** You add `setError(null)` as the first line inside `try`. The fetch succeeds. Then `shipmentId` changes, the effect re-runs, and this time the fetch fails. Walk through the state values at each stage — `isLoading`, `status`, `error` — after the second effect run completes. Is there any residual stale data visible to the consumer?",
      build:
        "**Learning focus:** Use try/catch/finally inside a useEffect async inner function — understanding that `finally` is the only safe place to reset loading state because it runs unconditionally regardless of fetch outcome.",
    },
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 5",
    paal: "Write a `ShipmentStatusBadge` component that calls `useShipmentStatus(shipmentId)`, destructures `status`, `isLoading`, and `error` from it, and renders: 'Loading…' if loading, the error message if there is an error, or a `<span>` with the status if successful. Props: `{ shipmentId: string }`.",
    hint: "Call the hook at the top of the component — never inside a condition. Then use the returned values in your JSX.",
    example_code: `const RouteHealthBadge = ({ routeId }: { routeId: string }) => {
  const { health, isChecking, checkError } = useRouteHealth(routeId);
  if (isChecking) return <p>Checking…</p>;
  if (checkError) return <p>{checkError}</p>;
  return <span>{health}</span>;
};`,
    think_prompt:
      "You need to show a loading state, an error state, and a success state — and they're mutually exclusive. What is the cleanest way to express that in JSX without deeply nested ternaries?",
    mc_options: [
      "Use a single ternary: `isLoading ? 'Loading' : error ? error : status`",
      "Use early returns: `if (isLoading) return …; if (error) return …; return …`",
      "Render all three and use CSS display:none to hide inactive states",
    ],
    mc_correct_option:
      "Use early returns: `if (isLoading) return …; if (error) return …; return …`",
    mc_anchor:
      "Early returns make each state explicit and readable. Nested ternaries express the same logic but force the reader to parse the nesting. CSS visibility tricks are the worst option — all three states render and React reconciles all of them on every update.",
    why_this_matters:
      "Loading/error/success is the most common UI state machine in data-driven applications. Early returns establish a clear priority — loading beats error, error beats success — and make each state independently maintainable. A designer can change the error UI without touching the loading or success branches.",
    answer_keywords: ["useShipmentStatus", "isLoading", "error", "status", "return"],
    seed_code: `function useShipmentStatus(shipmentId: string) {
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const fetchStatus = async () => {
      try {
        const result = await Promise.resolve('in-transit');
        setStatus(result);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatus();
  }, [shipmentId]);

  return { status, isLoading, error };
}`,
    starter_code: `function useShipmentStatus(shipmentId: string) {
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const fetchStatus = async () => {
      try {
        const result = await Promise.resolve('in-transit');
        setStatus(result);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatus();
  }, [shipmentId]);

  return { status, isLoading, error };
}

// write ShipmentStatusBadge here
// props: { shipmentId: string }
// call useShipmentStatus, destructure status/isLoading/error
// render loading, error, or status span`,
    feedback_correct:
      "Correct — hook called unconditionally at the top, early returns for each state, happy path returns the span. The hook and the component are now completely decoupled.",
    feedback_partial:
      "Almost — check that the hook is called outside any condition, that you handle all three states, and that the success case renders a `<span>` with `{status}`.",
    feedback_wrong:
      "Pattern: `const ShipmentStatusBadge = ({ shipmentId }: { shipmentId: string }) => { const { status, isLoading, error } = useShipmentStatus(shipmentId); if (isLoading) return <p>Loading…</p>; if (error) return <p>{error}</p>; return <span>{status}</span>; };`",
    expected: `function useShipmentStatus(shipmentId: string) {
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const fetchStatus = async () => {
      try {
        const result = await Promise.resolve('in-transit');
        setStatus(result);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatus();
  }, [shipmentId]);

  return { status, isLoading, error };
}

const ShipmentStatusBadge = ({ shipmentId }: { shipmentId: string }) => {
  const { status, isLoading, error } = useShipmentStatus(shipmentId);
  if (isLoading) return <p>Loading…</p>;
  if (error) return <p>{error}</p>;
  return <span>{status}</span>;
};`,
    analog_example: `const RouteHealthBadge = ({ routeId }: { routeId: string }) => {
  const { health, isChecking, checkError } = useRouteHealth(routeId);
  if (isChecking) return <p>Checking…</p>;
  if (checkError) return <p>{checkError}</p>;
  return <span>{health}</span>;
};`,
    deepDiveLabel:
      "The component works — but what happens if two components call the same hook at the same time?",
    deepDive: {
      hook: "You extract `useShipmentStatus` and use it in three places: a detail drawer, a list row badge, and a header summary. All three call the hook with different IDs. You expect them to share state — if the detail drawer fetches, the badge should update too. They don't. Each component has its own independent state. You spend an hour trying to figure out why your 'shared' hook isn't sharing.",
      pain: "⚠️ **Lesson:** Custom hooks do not share state between components. Every component that calls the hook gets its own isolated copy of the state. Why — and when is that the right behaviour vs a problem?",
      mentalModel:
        "**Mental model: Hooks share logic, not state.**\nThink of a custom hook like a blueprint for a vault. Every component that calls the hook gets its own vault — same design, completely separate contents.\nThis is usually exactly what you want: ShipmentStatusBadge in row 1 and ShipmentStatusBadge in row 2 need different state (different IDs, different loading states, different status values).\nWhen you need truly shared state — the same data in multiple places — that's a different tool: Context, Zustand, or a query cache like TanStack Query. Custom hooks are for sharing the *pattern*, not the *data*.",
      discover: `**Pattern — hook instances are independent:**
\`\`\`tsx
// ✅ Two components, two independent state instances — correct for row data
const Row1 = () => {
  const { status } = useShipmentStatus('NX-1042'); // own useState instance
};
const Row2 = () => {
  const { status } = useShipmentStatus('NX-9871'); // own useState instance
};

// ✅ When state must be shared — lift it to context
const StatusContext = createContext<StatusContextValue | null>(null);
const StatusProvider = ({ children }) => {
  const hookValue = useShipmentStatus('NX-1042');
  return <StatusContext.Provider value={hookValue}>{children}</StatusContext.Provider>;
};
// Now all children read from the same useState instance inside the Provider
\`\`\``,
      quickRules:
        "**Quick rules:**\n- ✅ custom hooks share logic — the pattern, the side effects, the derived values\n- ✅ each component calling a hook gets its own isolated state\n- ✅ this is the right model for list rows, reusable form fields, independent widgets\n- ❌ custom hooks do NOT share state between two different component call sites\n- ❌ if you need shared state, use Context, a global store, or a query cache",
      watchOut:
        "👀 **Watch out:** Stale closure bugs are more subtle in custom hooks than in components, because the hook's `useEffect` closes over the hook's parameter — not a component prop. If you memoize a component that uses a hook, and the prop that feeds the hook's parameter doesn't change reference, the hook may never re-run. Always check that the dependency array tracks the right identity.",
      dryRun:
        "🔁 **Think:** `ShipmentStatusBadge` is used in 40 list rows. Each calls `useShipmentStatus` with a different ID. How many `useState` instances exist in the React tree at the same time? If you update the hook's fetch logic — say, adding retry on 5xx errors — which instances are affected and when?",
      build:
        "**Learning focus:** Custom hooks share logic and the pattern of state management — each component call site gets its own independent state instance. When shared state is the requirement, that calls for Context or a global store, not a custom hook alone.",
    },
  },
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 5",
    paal: "The hook currently returns `{ status, isLoading, error }`. Add a `refetch` function to the hook that resets `error` to `null` and `status` to `''`, then re-triggers the effect by updating a `refreshKey` state variable (number, initial `0`). Add `refreshKey` to the effect's dependency array. Return `refetch` from the hook.",
    hint: "The effect re-runs whenever a dependency changes. Adding a `refreshKey` counter that increments on each refetch call is the standard pattern for manually triggering a re-run.",
    example_code: `const [retryCount, setRetryCount] = useState<number>(0);

useEffect(() => {
  setIsChecking(true);
  // fetch logic
}, [routeId, retryCount]);

const retry = () => {
  setCheckError(null);
  setHealth('');
  setRetryCount(c => c + 1);
};

return { health, isChecking, checkError, retry };`,
    think_prompt:
      "The effect already runs when `shipmentId` changes. What mechanism lets you trigger a re-run without changing `shipmentId`?",
    mc_options: [
      "Call useEffect manually from outside the hook",
      "Add a counter state variable to the dependency array and increment it to force a re-run",
      "Set isLoading to true — that triggers a re-render which re-runs the effect",
    ],
    mc_correct_option:
      "Add a counter state variable to the dependency array and increment it to force a re-run",
    mc_anchor:
      "React re-runs an effect whenever any value in the dependency array changes. A counter that increments is a reliable, intentional change — adding it to the array means incrementing it will always trigger the effect, independently of `shipmentId`.",
    why_this_matters:
      "Retry and manual refresh are required in every production data UI. A shipment status can stall in-transit for hours. Operators need a 'Refresh' button that re-polls without navigating away. The `refreshKey` pattern is the cleanest way to expose that capability from a hook.",
    answer_keywords: ["refreshKey", "setRefreshKey", "refetch", "return", "useState"],
    seed_code: `function useShipmentStatus(shipmentId: string) {
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const fetchStatus = async () => {
      try {
        const result = await Promise.resolve('in-transit');
        setStatus(result);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatus();
  }, [shipmentId]);

  return { status, isLoading, error };
}

const ShipmentStatusBadge = ({ shipmentId }: { shipmentId: string }) => {
  const { status, isLoading, error } = useShipmentStatus(shipmentId);
  if (isLoading) return <p>Loading…</p>;
  if (error) return <p>{error}</p>;
  return <span>{status}</span>;
};`,
    starter_code: `function useShipmentStatus(shipmentId: string) {
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // add refreshKey state here (number, initial 0)

  useEffect(() => {
    setIsLoading(true);
    const fetchStatus = async () => {
      try {
        const result = await Promise.resolve('in-transit');
        setStatus(result);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatus();
  }, [shipmentId]); // add refreshKey to the dependency array

  // define refetch: reset error and status, increment refreshKey
  // return { status, isLoading, error, refetch }
}

const ShipmentStatusBadge = ({ shipmentId }: { shipmentId: string }) => {
  const { status, isLoading, error, refetch } = useShipmentStatus(shipmentId);
  if (isLoading) return <p>Loading…</p>;
  if (error) return <p>{error}<button onClick={refetch}>Retry</button></p>;
  return <span>{status}</span>;
};`,
    feedback_correct:
      "Correct — `refreshKey` in state, added to the dependency array, incremented in `refetch`, returned alongside the other values. The hook is now a complete, self-contained data-fetching unit.",
    feedback_partial:
      "Almost — check three things: is `refreshKey` in the dependency array, does `refetch` increment it with a functional update (`c => c + 1`), and is `refetch` included in the return object?",
    feedback_wrong:
      "Pattern: add `const [refreshKey, setRefreshKey] = useState<number>(0);`, add `refreshKey` to `[shipmentId, refreshKey]`, define `const refetch = () => { setError(null); setStatus(''); setRefreshKey(k => k + 1); };`, and return `{ status, isLoading, error, refetch }`.",
    expected: `function useShipmentStatus(shipmentId: string) {
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  useEffect(() => {
    setIsLoading(true);
    const fetchStatus = async () => {
      try {
        const result = await Promise.resolve('in-transit');
        setStatus(result);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatus();
  }, [shipmentId, refreshKey]);

  const refetch = () => {
    setError(null);
    setStatus('');
    setRefreshKey(k => k + 1);
  };

  return { status, isLoading, error, refetch };
}

const ShipmentStatusBadge = ({ shipmentId }: { shipmentId: string }) => {
  const { status, isLoading, error, refetch } = useShipmentStatus(shipmentId);
  if (isLoading) return <p>Loading…</p>;
  if (error) return <p>{error}<button onClick={refetch}>Retry</button></p>;
  return <span>{status}</span>;
};`,
    analog_example: `const [retryCount, setRetryCount] = useState<number>(0);

useEffect(() => {
  // fetch logic
}, [routeId, retryCount]);

const retry = () => {
  setCheckError(null);
  setHealth('');
  setRetryCount(c => c + 1);
};

return { health, isChecking, checkError, retry };`,
    deepDiveLabel:
      "incrementing a counter forces a re-fetch — but what stops it from firing twice on the same render?",
    deepDive: {
      hook: "You call `refetch`. React schedules a re-render because `refreshKey` changed. Then you notice the fetch fires twice. You add a console.log — both fetch calls log 'started'. In StrictMode, React intentionally double-invokes effects to surface cleanup issues. Outside StrictMode, the double fire means your dependency array has a value that's also changing as a side effect of the fetch itself.",
      pain: "⚠️ **Lesson:** The effect fires more times than expected after a `refetch`. How do you distinguish 'StrictMode double-invoke' from a genuine loop, and what causes a genuine loop?",
      mentalModel:
        "**Mental model: state changes inside an effect always trigger the effect's dependencies.**\nIf you set state inside an effect, and that state is in the dependency array, you have a loop.\n`refreshKey` is safe because it's only ever changed by `refetch` (called by the user) — never by the effect itself.\n`isLoading` is NOT safe to add to the dependency array — the effect sets it, which would change it, which would re-trigger the effect.\nRule: only add external inputs (props, user-controlled state) to the dependency array. Never add values the effect itself writes.",
      discover: `**Pattern — safe vs looping dependencies:**
\`\`\`tsx
// ✅ safe — refreshKey only changes on explicit user action
useEffect(() => {
  setIsLoading(true); // writes isLoading
  // ...
}, [shipmentId, refreshKey]); // reads only external inputs

// ❌ loop — effect writes isLoading, isLoading is in deps
useEffect(() => {
  setIsLoading(true);
  // ...
}, [shipmentId, isLoading]); // isLoading changes → effect re-runs → isLoading changes → ...
\`\`\``,
      quickRules:
        "**Quick rules:**\n- ✅ dependency array should contain only external inputs — props and user-controlled state\n- ✅ state the effect writes should never appear in its own dependency array\n- ✅ use functional state updates (`k => k + 1`) to avoid needing the current value in deps\n- ❌ never add `isLoading`, `status`, or `error` to the effect's dependency array — the effect owns those\n- ❌ StrictMode double-invoke in dev is not a bug — add a cleanup function to handle it",
      watchOut:
        "👀 **Watch out:** `setRefreshKey(refreshKey + 1)` reads the current `refreshKey` value directly. If two `refetch` calls happen before the state update flushes, both read the same `refreshKey` value and both set it to the same next value — effectively losing one increment. Use `setRefreshKey(k => k + 1)` to always increment relative to the latest value.",
      dryRun:
        "🔁 **Think:** A user clicks Retry three times in rapid succession before the first fetch completes. With `setRefreshKey(k => k + 1)`, what is the final value of `refreshKey` after all three clicks? How many times does the effect run? And what happens to the first two in-flight fetches when the effect re-runs before they resolve?",
      build:
        "**Learning focus:** Expose a `refetch` function from a custom hook by adding a counter state variable to the effect's dependency array — understanding that only external inputs belong in the dependency array and that functional state updates prevent stale-closure increment bugs.",
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
  lessonNum: 33,
  title: "Custom Hook — Extract Logic",
  shortName: "CUSTOM HOOK — useShipmentStatus",
});
