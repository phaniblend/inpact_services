import createINPACTEngine from "../inpact_engine_shared";

function normalizeCode(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

function evalL43Step1(answer) {
  const raw = String(answer || "");
  const hasIntervalRef = /const\s+intervalRef\s*=\s*useRef\s*<\s*(?:number|ReturnType\s*<\s*typeof\s+setInterval\s*>)\s*\|\s*null\s*>\s*\(\s*null\s*\)/m.test(raw);
  const hasDataState = /const\s+\[\s*data\s*,\s*setData\s*\]\s*=\s*useState\s*</m.test(raw);
  const hasErrorState = /const\s+\[\s*error\s*,\s*setError\s*\]\s*=\s*useState/m.test(raw);
  return hasIntervalRef && hasDataState ? "correct" : hasIntervalRef || hasDataState ? "partial" : "wrong";
}

function evalL43Step2(answer) {
  const raw = String(answer || "");
  const hasFetch = /const\s+poll\s*=\s*(?:async\s*)?\(\s*\)\s*=>\s*\{[\s\S]*?fetch\s*\(/m.test(raw) ||
    /async\s+function\s+poll[\s\S]*?fetch\s*\(/m.test(raw);
  const hasSetData = /setData\s*\(/m.test(raw);
  const hasSetError = /setError\s*\(/m.test(raw);
  return hasFetch && hasSetData && hasSetError ? "correct" : hasFetch && hasSetData ? "partial" : "wrong";
}

function evalL43Step3(answer) {
  const raw = String(answer || "");
  const hasEffect = /useEffect\s*\(/m.test(raw);
  const hasPollCall = /poll\s*\(\s*\)/m.test(raw);
  const hasSetInterval = /intervalRef\.current\s*=\s*(?:window\.)?setInterval\s*\(\s*poll\s*,\s*interval\s*\)/m.test(raw);
  return hasEffect && hasPollCall && hasSetInterval ? "correct"
    : hasEffect && hasSetInterval ? "partial" : "wrong";
}

function evalL43Step4(answer) {
  const raw = String(answer || "");
  const hasCleanup = /return\s*\(\s*\)\s*=>\s*\{[\s\S]*?clearInterval\s*\(/m.test(raw) ||
    /clearInterval\s*\(\s*intervalRef\.current\s*\)/m.test(raw);
  const hasDeps = /\[\s*url\s*,\s*interval\s*\]/m.test(raw) || /\[\s*interval\s*,\s*url\s*\]/m.test(raw) ||
    /\[\s*poll\s*,\s*interval\s*\]/m.test(raw);
  return hasCleanup && hasDeps ? "correct" : hasCleanup || hasDeps ? "partial" : "wrong";
}

function evalL43Step5(answer) {
  const raw = String(answer || "");
  const hasEnabled = /enabled/m.test(raw);
  const hasGuard = /if\s*\(\s*!enabled\s*\)/m.test(raw) || /enabled\s*&&/m.test(raw);
  const hasReturn = /return\s*\{\s*data\s*,\s*error\s*(?:,\s*isLoading)?\s*\}/m.test(raw) ||
    /return\s*\{[\s\S]*?data[\s\S]*?\}/m.test(raw);
  return hasEnabled && hasGuard && hasReturn ? "correct"
    : hasEnabled && hasReturn ? "partial" : "wrong";
}

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "LESSON #43 (CUSTOM HOOKS)",
      title: "Custom Hook — usePolling",
      body: "Build a usePolling hook that fetches a URL on an interval, accumulates results into state, handles errors without crashing, and supports an enabled flag to pause polling — all with a clean interval cleanup on url, interval, or enabled changes.",
      usecase:
        "Not every enterprise system supports WebSockets. Shipment ETA feeds, warehouse inventory snapshots, and legacy REST APIs often require polling. A robust usePolling hook provides the same ergonomic API as useFetch but repeats automatically — and stops cleanly when told to.",
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
        reason: "The hook is consumed inside a JSX component. The status-conditional rendering pattern from Lesson 1 Step 6 maps directly to the enabled flag guard introduced in Step 5.",
      },
      {
        lesson: 10,
        label: "useState — Primitives",
        reason: "Step 1 uses useState<WarehouseSnapshot | null>(null) for data and useState<string | null>(null) for error — both are primitive-style state initialisations that follow the Lesson 10 pattern.",
      },
      {
        lesson: 24,
        label: "useEffect — Mount",
        reason: "Step 3 places the setInterval call inside useEffect so polling starts after mount, not during render.",
      },
      {
        lesson: 25,
        label: "useEffect — Dependencies",
        reason: "Step 4's dependency array [url, interval] makes the effect re-run (and the interval restart) whenever the polling target or frequency changes — the core mechanism studied in Lesson 25.",
      },
      {
        lesson: 28,
        label: "fetch + Loading + Error State",
        reason: "Step 2's poll function uses the fetch → response.json() → setData / setError pattern built in Lesson 28. The error handling strategy (catch → setError) is identical.",
      },
      {
        lesson: 33,
        label: "Custom Hook — Extract Logic",
        reason: "The hook structure — state declarations, an async helper, a useEffect, and a returned object — follows the extract-logic pattern established in Lesson 33.",
      },
    ],
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Store an interval ID in a ref so it can be cleared without causing re-renders",
      "Write an async poll function that fetches data and updates state or error",
      "Start polling inside useEffect — call once immediately, then set the interval",
      "Clear the interval in the effect cleanup so url and interval changes don't leak timers",
      "Accept an enabled flag and skip polling entirely when it is false",
      "Return { data, error, isLoading } from the hook",
    ],
  },

  // ── STEP 1 ────────────────────────────────────────────────────────────────
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 5",
    paal: "Declare the usePolling hook. It accepts url: string and interval: number. Inside, create intervalRef typed as number | null (initialised to null), data state typed as WarehouseSnapshot | null (initialised to null), and error state typed as string | null (initialised to null).",
    hint: "The interval ID returned by setInterval is a number in browser environments. Store it in a ref — not state — so clearing it doesn't trigger a re-render.",
    example_code: `function useBatchJob(endpoint: string, delay: number) {
  const timerRef = useRef<number | null>(null);
  const [result, setResult] = useState<BatchResult | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
}`,
    think_prompt:
      "setInterval returns an ID you later pass to clearInterval. That ID needs to survive across renders and be writable without causing re-renders. Which React primitive fits?",
    mc_options: [
      "useState<number | null>(null) — so the component re-renders when the interval ID is stored",
      "useRef<number | null>(null) — the ID is mutable infrastructure, not UI state",
      "a local variable inside useEffect — since the ID is only needed for cleanup inside the same effect",
    ],
    mc_correct_option:
      "useRef<number | null>(null) — the ID is mutable infrastructure, not UI state",
    mc_anchor:
      "The interval ID is never rendered — it's internal plumbing. Storing it in state would trigger a re-render every time the interval starts or clears. A local variable inside useEffect would work for simple cases, but a ref gives you access to the ID from outside the effect — useful if you later want a manual stop function. Refs are the right home for any mutable value that doesn't drive the UI.",
    why_this_matters:
      "In a logistics control room, polling hooks run continuously for hours. A ref-based interval ID means clearing the timer is a side effect, not a state update — no spurious re-renders during an already busy polling cycle.",
    answer_keywords: ["intervalRef", "useRef", "number | null", "null", "data", "useState", "WarehouseSnapshot | null", "error", "string | null"],
    evaluate: evalL43Step1,
    seed_code: "",
    starter_code: `import { useRef, useState, useEffect, useCallback } from 'react';

interface WarehouseSnapshot {
  warehouseId: string;
  totalUnits: number;
  lastUpdated: string;
}

function usePolling(url: string, interval: number) {
  // 1. intervalRef typed as number | null
  // 2. data state typed as WarehouseSnapshot | null
  // 3. error state typed as string | null
}`,
    feedback_correct:
      "Exactly — ref for the timer ID (mutable infrastructure), state for data and error (UI-reactive). The types make both the successful and failed polling paths explicit.",
    feedback_partial:
      "Some declarations are right. Check: is intervalRef a useRef typed number | null? Is data state WarehouseSnapshot | null? Is error state string | null?",
    feedback_wrong:
      "Pattern: `const intervalRef = useRef<number | null>(null)` — then `const [data, setData] = useState<WarehouseSnapshot | null>(null)` and `const [error, setError] = useState<string | null>(null)`.",
    expected: `import { useRef, useState, useEffect, useCallback } from 'react';

interface WarehouseSnapshot {
  warehouseId: string;
  totalUnits: number;
  lastUpdated: string;
}

function usePolling(url: string, interval: number) {
  const intervalRef = useRef<number | null>(null);
  const [data, setData] = useState<WarehouseSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
}`,
    analog_example: `function useHeartbeat(endpoint: string, tickMs: number) {
  const beatRef = useRef<number | null>(null);
  const [lastPing, setLastPing] = useState<PingResult | null>(null);
  const [pingError, setPingError] = useState<string | null>(null);
}`,
    deepDiveLabel:
      "setInterval returns a number in the browser — but Node.js returns an object. Does that break anything?",
    deepDive: {
      hook: "Your hook works perfectly in the browser. You add a unit test in Jest (which runs in Node.js). The test fails with a TypeScript error: `Type 'NodeJS.Timeout' is not assignable to type 'number | null'`. Your `useRef<number | null>` was correct for the browser — but Node's setInterval returns an opaque Timeout object, not a number.",
      pain: "⚠️ **Lesson:** `setInterval` has different return types in browser (number) and Node.js (NodeJS.Timeout). How do you write a type annotation that works in both environments without casting?",
      mentalModel:
        "**Mental model: The Universal Remote.**\nYou don't need to know if the TV is a Sony or Samsung to turn it off — you just point and press Off. `ReturnType<typeof setInterval>` is the universal remote: it asks TypeScript 'whatever type setInterval returns in this environment, that's the type'. Browser? Number. Node? Timeout. Same type annotation works in both.",
      discover: `// ✅ Universal — works in browser and Node (test environments)
const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

// ✅ Browser-only — correct but breaks in Jest/Node test environments
const intervalRef = useRef<number | null>(null);

// ✅ Explicit cast — pragmatic but hides the environment difference
intervalRef.current = setInterval(poll, interval) as unknown as number;

// ❌ No type annotation — TypeScript infers the wrong thing or complains
const intervalRef = useRef(null); // TypeScript infers Ref<null>, can't assign setInterval result`,
      quickRules:
        "✅ Use `ReturnType<typeof setInterval>` for environment-agnostic timer ID typing\n✅ `number | null` is correct for browser-only code (React apps served to browsers)\n✅ clearInterval accepts both number and NodeJS.Timeout — clearing always works\n❌ Don't type the ref as `any` — you lose the signal that .current is a timer ID\n✅ For testing React hooks in Jest: use `ReturnType<typeof setInterval>` or `jest.useFakeTimers()`",
      watchOut:
        "👀 **Watch out:** `useRef<number | null>(null)` is technically correct for browser React apps, but will cause TypeScript errors in Jest (Node environment) tests. If your team tests hooks with React Testing Library + Jest, use `ReturnType<typeof setInterval> | null` from day one — it costs nothing and saves a confusing test-environment type error.",
      dryRun:
        "🔁 **Think:** You use `ReturnType<typeof setInterval>` as the ref type. At runtime in a browser, what JavaScript value is actually stored in intervalRef.current? Is it an integer? An object? What does clearInterval do with it — and does it matter whether the underlying value is a number or an object?",
      build:
        "**Learning focus:** Store the interval ID in a useRef typed as number | null (or ReturnType<typeof setInterval> | null for environment safety), understanding that timer IDs are mutable infrastructure — not UI state — and must survive across renders to be clearable.",
    },
  },

  // ── STEP 2 ────────────────────────────────────────────────────────────────
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 5",
    paal: "Define an async poll function inside the hook that fetches url, parses the response as WarehouseSnapshot, calls setData with the result, and calls setError(null) on success. On any error, calls setError with the error message and setData(null).",
    hint: "Wrap the fetch call in try/catch. On success, clear any previous error with setError(null) before setting data — in case the previous poll had failed.",
    example_code: `const fetchMetrics = async () => {
  try {
    const res = await fetch(metricsEndpoint);
    const json = await res.json() as ServerMetrics;
    setMetrics(json);
    setFetchError(null);
  } catch (err) {
    setFetchError(err instanceof Error ? err.message : 'Failed');
    setMetrics(null);
  }
};`,
    think_prompt:
      "The poll function fetches and calls setData or setError. If this function is defined inside a useEffect, what happens to the function reference on every effect re-run — and why might that complicate things?",
    mc_options: [
      "Defining poll inside useEffect means it's recreated on every re-run — setInterval gets a new reference each time but that's fine because the interval is cleared and reset",
      "Defining poll inside useEffect is a problem — it can't be passed to setInterval in the same effect scope",
      "Defining poll inside useEffect with useCallback makes it stable across re-renders",
    ],
    mc_correct_option:
      "Defining poll inside useEffect means it's recreated on every re-run — setInterval gets a new reference each time but that's fine because the interval is cleared and reset",
    mc_anchor:
      "When poll is defined inside useEffect, it's recreated on every effect run — but that's safe because the effect also clears the old interval before setting a new one. The new interval always uses the latest poll. Defining poll outside the effect (in the hook body) is also correct and makes it easier to call immediately before setting the interval — which is what Step 3 does. Either location works; the important thing is that the interval always references the current version of poll.",
    why_this_matters:
      "The try/catch pattern with dual state updates (setData on success, setError on failure, clearing the other in each branch) is the standard error/data mutual exclusion pattern for any polling or fetch hook. Without it, stale error messages persist after a recovery, confusing operators who see 'Network error' alongside fresh data.",
    answer_keywords: ["poll", "async", "fetch", "url", "setData", "setError", "null", "try", "catch"],
    evaluate: evalL43Step2,
    seed_code: `import { useRef, useState, useEffect, useCallback } from 'react';

interface WarehouseSnapshot {
  warehouseId: string;
  totalUnits: number;
  lastUpdated: string;
}

function usePolling(url: string, interval: number) {
  const intervalRef = useRef<number | null>(null);
  const [data, setData] = useState<WarehouseSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
}`,
    starter_code: `import { useRef, useState, useEffect, useCallback } from 'react';

interface WarehouseSnapshot {
  warehouseId: string;
  totalUnits: number;
  lastUpdated: string;
}

function usePolling(url: string, interval: number) {
  const intervalRef = useRef<number | null>(null);
  const [data, setData] = useState<WarehouseSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  // define async poll function here
  // fetch url, setData on success (and clear error), setError on failure (and clear data)
}`,
    feedback_correct:
      "Exactly — try/catch with mutual exclusion: data cleared on error, error cleared on data. This keeps the hook's output always coherent — never stale error + fresh data simultaneously.",
    feedback_partial:
      "Almost — check: does setError(null) run on success? Does setData(null) run on error? Is the fetch awaited and the JSON parsed as WarehouseSnapshot?",
    feedback_wrong:
      "Pattern: `const poll = async () => { try { const res = await fetch(url); const json = await res.json() as WarehouseSnapshot; setData(json); setError(null); } catch (err) { setError(err instanceof Error ? err.message : 'Error'); setData(null); } };`",
    expected: `import { useRef, useState, useEffect, useCallback } from 'react';

interface WarehouseSnapshot {
  warehouseId: string;
  totalUnits: number;
  lastUpdated: string;
}

function usePolling(url: string, interval: number) {
  const intervalRef = useRef<number | null>(null);
  const [data, setData] = useState<WarehouseSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  const poll = async () => {
    try {
      const res = await fetch(url);
      const json = await res.json() as WarehouseSnapshot;
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Polling error');
      setData(null);
    }
  };
}`,
    analog_example: `const checkInventory = async () => {
  try {
    const res = await fetch(binEndpoint);
    const json = await res.json() as BinCount;
    setBinCount(json);
    setBinError(null);
  } catch (err) {
    setBinError(err instanceof Error ? err.message : 'Failed');
    setBinCount(null);
  }
};`,
    deepDiveLabel:
      "fetch doesn't throw on 4xx or 5xx — so your try/catch won't catch a 404. What does that mean for polling?",
    deepDive: {
      hook: "Your warehouse inventory endpoint starts returning 503 during a maintenance window. Your poll function's try/catch never triggers — fetch resolves successfully with a 503 response. `response.json()` tries to parse the HTML error page as JSON, throws a SyntaxError, and now your error state shows 'Unexpected token < in JSON' — not 'Service unavailable'. The operator sees a cryptic parse error instead of a meaningful service status.",
      pain: "⚠️ **Lesson:** fetch only rejects on network failure. HTTP error status codes (4xx, 5xx) resolve successfully. How do you make your poll function catch HTTP errors as cleanly as network errors?",
      mentalModel:
        "**Mental model: The Package That Arrived Damaged.**\nfetch is the delivery driver. Network failure = the truck never shows up (Promise rejects). A 503 = the truck arrives, but the box is marked 'Return to Sender'. fetch considers both as 'delivered'. You have to check the label (`response.ok`) yourself before opening the box.",
      discover: `// ✅ Catch both network errors AND HTTP error statuses
const poll = async () => {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(\`HTTP \${res.status}: \${res.statusText}\`);
    }
    const json = await res.json() as WarehouseSnapshot;
    setData(json);
    setError(null);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Polling error');
    setData(null);
  }
};

// ❌ Only catches network errors — HTTP 4xx/5xx resolve, causing JSON parse errors
const poll = async () => {
  try {
    const res = await fetch(url);
    const json = await res.json() as WarehouseSnapshot; // throws SyntaxError on HTML error page
    setData(json);
  } catch (err) {
    setError('Polling error'); // shows wrong error on 503
  }
};`,
      quickRules:
        "✅ Always check `if (!res.ok) throw new Error(...)` after fetch resolves\n✅ Include the status code in the error message for debuggability\n✅ Clear the opposite state in each branch (setError(null) on success, setData(null) on error)\n❌ Never assume fetch rejection = all errors — HTTP errors always resolve\n✅ For polling, log the error but don't crash — the next poll may succeed",
      watchOut:
        "👀 **Watch out:** `response.json()` throws a SyntaxError when the server returns HTML (like a 503 error page or a login redirect). Your catch block fires with 'SyntaxError: Unexpected token < in JSON at position 0'. This is extremely common in production — load balancers often return HTML health-check pages on certain error codes. Check `res.ok` before parsing.",
      dryRun:
        "🔁 **Think:** Your warehouse endpoint returns a 401 (Unauthorized) because the session expired. fetch resolves (not rejects). `res.ok` is false (401 is not in 200-299). You throw `new Error('HTTP 401: Unauthorized')`. The catch block runs and calls `setError('HTTP 401: Unauthorized')`. On the next poll interval, what happens? Does the hook keep polling? Should it — or should a 401 stop polling entirely?",
      build:
        "**Learning focus:** Write an async poll function that fetches, checks res.ok before parsing, and maintains the data/error mutual exclusion pattern — preventing stale state combinations.",
    },
  },

  // ── STEP 3 ────────────────────────────────────────────────────────────────
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 5",
    paal: "Add a useEffect that calls poll() immediately (for a fast first load), then sets up the interval: intervalRef.current = setInterval(poll, interval).",
    hint: "Call poll() once synchronously at the start of the effect, before setInterval. This ensures data appears immediately rather than waiting one full interval cycle.",
    example_code: `useEffect(() => {
  checkInventory();
  beatRef.current = setInterval(checkInventory, tickMs);
}, []);`,
    think_prompt:
      "Without the immediate poll() call, how long does the user wait to see data when the hook first mounts with an interval of 30,000ms?",
    mc_options: [
      "The data appears immediately — setInterval fires right away on mount",
      "The user waits 30 seconds to see the first data — setInterval only fires after the first interval elapses",
      "React fetches data on mount automatically — setInterval is only needed for subsequent polls",
    ],
    mc_correct_option:
      "The user waits 30 seconds to see the first data — setInterval only fires after the first interval elapses",
    mc_anchor:
      "setInterval fires *after* the first delay. A 30-second polling interval means 30 seconds of empty UI before the first data arrives. Calling poll() at the top of the effect gives users data immediately on mount, then the interval keeps it fresh. This 'immediate + interval' pattern is the standard for any polling hook.",
    why_this_matters:
      "A warehouse dashboard that takes 30 seconds to show inventory on load fails its users. Control room operators need data instantly. The immediate poll call is a UX requirement, not an optimisation — it's the difference between a dashboard that feels live and one that feels broken.",
    answer_keywords: ["useEffect", "poll()", "setInterval", "poll", "interval", "intervalRef.current"],
    evaluate: evalL43Step3,
    seed_code: `import { useRef, useState, useEffect, useCallback } from 'react';

interface WarehouseSnapshot {
  warehouseId: string;
  totalUnits: number;
  lastUpdated: string;
}

function usePolling(url: string, interval: number) {
  const intervalRef = useRef<number | null>(null);
  const [data, setData] = useState<WarehouseSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  const poll = async () => {
    try {
      const res = await fetch(url);
      const json = await res.json() as WarehouseSnapshot;
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Polling error');
      setData(null);
    }
  };
}`,
    starter_code: `import { useRef, useState, useEffect, useCallback } from 'react';

interface WarehouseSnapshot {
  warehouseId: string;
  totalUnits: number;
  lastUpdated: string;
}

function usePolling(url: string, interval: number) {
  const intervalRef = useRef<number | null>(null);
  const [data, setData] = useState<WarehouseSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  const poll = async () => {
    try {
      const res = await fetch(url);
      const json = await res.json() as WarehouseSnapshot;
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Polling error');
      setData(null);
    }
  };

  useEffect(() => {
    // call poll immediately for fast first load
    // then store setInterval(poll, interval) in intervalRef.current
  });
}`,
    feedback_correct:
      "Exactly — immediate poll for instant first data, then the interval for continuous updates. The dependency array is still missing — that's Step 4.",
    feedback_partial:
      "Close — check: is poll() called immediately before setInterval? Is the interval ID stored in intervalRef.current?",
    feedback_wrong:
      "Pattern: inside useEffect, call `poll()` first, then `intervalRef.current = setInterval(poll, interval)`.",
    expected: `import { useRef, useState, useEffect, useCallback } from 'react';

interface WarehouseSnapshot {
  warehouseId: string;
  totalUnits: number;
  lastUpdated: string;
}

function usePolling(url: string, interval: number) {
  const intervalRef = useRef<number | null>(null);
  const [data, setData] = useState<WarehouseSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  const poll = async () => {
    try {
      const res = await fetch(url);
      const json = await res.json() as WarehouseSnapshot;
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Polling error');
      setData(null);
    }
  };

  useEffect(() => {
    poll();
    intervalRef.current = setInterval(poll, interval);
  });
}`,
    analog_example: `useEffect(() => {
  pingServer();
  beatRef.current = setInterval(pingServer, heartbeatMs);
}, [heartbeatMs]);`,
    deepDiveLabel:
      "poll() is async but useEffect doesn't await it — is that a problem?",
    deepDive: {
      hook: "You're reviewing a PR. A junior developer has written `useEffect(async () => { await poll(); ... }, [url])`. ESLint flags it with 'Effect callbacks are synchronous to prevent race conditions.' The developer argues it's necessary to ensure the interval starts after the first fetch completes. Who's right, and why does React ban async effect callbacks?",
      pain: "⚠️ **Lesson:** React's useEffect callback must return either nothing or a cleanup function. An async function always returns a Promise. React tries to call the returned value as a cleanup — calling a Promise throws. Why can't you just await inside useEffect?",
      mentalModel:
        "**Mental model: The Fire-and-Forget Kitchen.**\nThe useEffect callback is the expediter — it fires off tasks and immediately looks for a cleanup ticket. An async function hands the expediter a Promise (a ticket that might arrive later). The expediter tries to read it as a cleanup function, gets confused, and React warns.\n- Solution: the effect callback stays synchronous. If you need async, define an inner async function and call it without await — the Promise floats freely, the effect returns synchronously.",
      discover: `// ✅ Correct — inner async function, called without await
useEffect(() => {
  const run = async () => {
    await poll(); // awaited inside — safe
  };
  run(); // called without await — effect stays synchronous
  intervalRef.current = setInterval(poll, interval);
  return () => clearInterval(intervalRef.current!);
}, [url, interval]);

// ✅ Also correct — poll() is async but you don't need to await it here
useEffect(() => {
  poll(); // floating Promise is fine — poll handles its own errors internally
  intervalRef.current = setInterval(poll, interval);
  return () => clearInterval(intervalRef.current!);
}, [url, interval]);

// ❌ Wrong — async effect callback returns a Promise, not a cleanup
useEffect(async () => { // React warns: effect callbacks must be synchronous
  await poll();
  intervalRef.current = setInterval(poll, interval);
}, [url, interval]);`,
      quickRules:
        "✅ Keep the useEffect callback synchronous — no async keyword on it directly\n✅ Define an inner async function inside the effect and call it without await\n✅ An unhandled floating Promise from poll() is fine IF poll() catches its own errors internally\n❌ Never write `useEffect(async () => { ... })` — React warns and cleanup fails silently\n✅ Always add a .catch() or try/catch inside the called async function to prevent unhandled rejections",
      watchOut:
        "👀 **Watch out:** `poll()` called without await returns a floating Promise. If poll throws before its internal try/catch (e.g., a synchronous bug), you get an unhandled Promise rejection. This is why the try/catch inside poll must be exhaustive — it's the last line of defence because the caller doesn't await it.",
      dryRun:
        "🔁 **Think:** The effect calls `poll()` immediately (no await) and then `setInterval(poll, interval)`. The first poll is an async fetch that takes 800ms. The interval fires after 5000ms. At the 800ms mark, the first fetch resolves and setData is called. At 5000ms, setInterval fires poll again. Is there any overlap between the first poll response arriving (800ms) and the interval firing (5000ms)? What would happen if interval were set to 500ms instead?",
      build:
        "**Learning focus:** Start polling with an immediate poll() call (for instant first load) then setInterval — keeping the useEffect callback synchronous by not adding async to it directly.",
    },
  },

  // ── STEP 4 ────────────────────────────────────────────────────────────────
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 5",
    paal: "Add the cleanup: return a function from useEffect that calls clearInterval(intervalRef.current). Add the dependency array [url, interval] so the effect re-runs when either changes.",
    hint: "clearInterval accepts null safely — but use the optional chaining pattern or a null check if you're using strict TypeScript. The dependency array must include both url and interval.",
    example_code: `useEffect(() => {
  run();
  beatRef.current = setInterval(run, tickMs);
  return () => clearInterval(beatRef.current ?? undefined);
}, [endpoint, tickMs]);`,
    think_prompt:
      "The dependency array is [url, interval]. The operator changes the polling interval from 5s to 30s in a settings panel. What exactly happens — step by step — to the existing interval?",
    mc_options: [
      "The old interval keeps running at 5s; a new 30s interval is added on top",
      "React runs the cleanup (clears the 5s interval) before re-running the effect with the new 30s interval",
      "React automatically merges the two intervals and uses the new value going forward",
    ],
    mc_correct_option:
      "React runs the cleanup (clears the 5s interval) before re-running the effect with the new 30s interval",
    mc_anchor:
      "When a dependency changes, React calls the cleanup function from the previous effect run before executing the new effect. The cleanup calls clearInterval on the 5s interval — stopping it. The new effect then calls poll() immediately and starts a fresh 30s interval. Without this cleanup, both intervals would run simultaneously, flooding the server with requests.",
    why_this_matters:
      "Interval leakage is a class of bug that's invisible until production. A polling hook without cleanup stacks intervals on every url or interval change — two consumers with url changes every 10s create hundreds of concurrent fetch loops over a shift. Server logs show the problem, UI shows nothing.",
    answer_keywords: ["clearInterval", "intervalRef.current", "return", "[url, interval]"],
    evaluate: evalL43Step4,
    seed_code: `import { useRef, useState, useEffect, useCallback } from 'react';

interface WarehouseSnapshot {
  warehouseId: string;
  totalUnits: number;
  lastUpdated: string;
}

function usePolling(url: string, interval: number) {
  const intervalRef = useRef<number | null>(null);
  const [data, setData] = useState<WarehouseSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  const poll = async () => {
    try {
      const res = await fetch(url);
      const json = await res.json() as WarehouseSnapshot;
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Polling error');
      setData(null);
    }
  };

  useEffect(() => {
    poll();
    intervalRef.current = setInterval(poll, interval);
  });
}`,
    starter_code: `import { useRef, useState, useEffect, useCallback } from 'react';

interface WarehouseSnapshot {
  warehouseId: string;
  totalUnits: number;
  lastUpdated: string;
}

function usePolling(url: string, interval: number) {
  const intervalRef = useRef<number | null>(null);
  const [data, setData] = useState<WarehouseSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  const poll = async () => {
    try {
      const res = await fetch(url);
      const json = await res.json() as WarehouseSnapshot;
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Polling error');
      setData(null);
    }
  };

  useEffect(() => {
    poll();
    intervalRef.current = setInterval(poll, interval);
    // return cleanup here
  } /* add dependency array */);
}`,
    feedback_correct:
      "Complete — cleanup clears the interval on every re-run and unmount, and the dependency array makes the hook reactive to url and interval changes.",
    feedback_partial:
      "Almost — check: does the cleanup call clearInterval(intervalRef.current)? Is the dependency array [url, interval] (both values)?",
    feedback_wrong:
      "Inside useEffect: `return () => { clearInterval(intervalRef.current ?? undefined); };` and the dependency array: `[url, interval]`.",
    expected: `import { useRef, useState, useEffect, useCallback } from 'react';

interface WarehouseSnapshot {
  warehouseId: string;
  totalUnits: number;
  lastUpdated: string;
}

function usePolling(url: string, interval: number) {
  const intervalRef = useRef<number | null>(null);
  const [data, setData] = useState<WarehouseSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  const poll = async () => {
    try {
      const res = await fetch(url);
      const json = await res.json() as WarehouseSnapshot;
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Polling error');
      setData(null);
    }
  };

  useEffect(() => {
    poll();
    intervalRef.current = setInterval(poll, interval);
    return () => {
      clearInterval(intervalRef.current ?? undefined);
    };
  }, [url, interval]);
}`,
    analog_example: `useEffect(() => {
  pingServer();
  beatRef.current = setInterval(pingServer, heartbeatMs);
  return () => clearInterval(beatRef.current ?? undefined);
}, [serverEndpoint, heartbeatMs]);`,
    deepDiveLabel:
      "poll is defined in the hook body — why isn't it in the dependency array?",
    deepDive: {
      hook: "ESLint's exhaustive-deps rule flags your effect: `React Hook useEffect has a missing dependency: 'poll'. Either include it or remove the dependency array.` You add poll to the dependencies. Now the effect re-runs on every render — poll is recreated on every render, the dependency sees a new function reference each time, the interval clears and restarts constantly. Data flickers. You revert the change.",
      pain: "⚠️ **Lesson:** poll is created fresh on every render. Adding it to the dependency array causes an infinite re-render loop. But ESLint is right — poll closes over url. How do you fix this properly?",
      mentalModel:
        "**Mental model: The Stable Reference Problem.**\nEvery render creates a new `poll` function — a new object, a new reference. The effect's dependency comparison uses Object.is() — same reference? No. Re-run the effect. Clears the interval. New effect. New poll. New interval. Repeat.\nFix: stabilize the reference with useCallback([url]). Now poll's reference only changes when url changes — which is exactly when you want the effect to re-run anyway. The dependency array then correctly contains `[poll, interval]` and ESLint is satisfied.",
      discover: `// ✅ Stable poll reference with useCallback
const poll = useCallback(async () => {
  try {
    const res = await fetch(url); // url captured in useCallback deps
    const json = await res.json() as WarehouseSnapshot;
    setData(json); setError(null);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Error');
    setData(null);
  }
}, [url]); // poll updates when url changes

useEffect(() => {
  poll();
  intervalRef.current = setInterval(poll, interval);
  return () => clearInterval(intervalRef.current ?? undefined);
}, [poll, interval]); // now ESLint is satisfied — poll is stable

// ❌ poll without useCallback — re-creates on every render
const poll = async () => { ... }; // new reference every render
useEffect(() => { ... }, [poll, interval]); // re-runs every render → infinite loop`,
      quickRules:
        "✅ Wrap poll in useCallback with [url] as its dependency to stabilize the reference\n✅ Then use [poll, interval] as the effect dependency — ESLint-compliant and correct\n❌ Never include a function that's recreated every render in a dependency array without useCallback\n✅ [url, interval] works as a shortcut when you choose to put url directly in the effect (and ESLint-disable the poll warning)\n✅ The two approaches (useCallback + [poll, interval]) and ([url, interval]) produce the same behaviour — pick one and be consistent",
      watchOut:
        "👀 **Watch out:** If poll is wrapped in useCallback but you forget to add url to useCallback's own dependency array, poll closes over a stale url — the hook will always fetch the first url it received, even after url changes. useCallback doesn't make you immune to stale closures — it just makes the staleness intentional and controlled.",
      dryRun:
        "🔁 **Think:** You wrap poll in useCallback([url]) and update the effect to [poll, interval]. The component's parent re-renders for an unrelated reason (say, a counter increments). Does poll get a new reference? Does the effect re-run? Does the interval restart? Trace through: what does useCallback([url]) guarantee about the function reference when url hasn't changed?",
      build:
        "**Learning focus:** Return a cleanup that clears the interval and add [url, interval] to the dependency array — understanding that React's cleanup + dependency system is what prevents interval leakage when polling targets change.",
    },
  },

  // ── STEP 5 ────────────────────────────────────────────────────────────────
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 5",
    paal: "Add an enabled: boolean = true parameter to the hook. At the top of the useEffect, return early if !enabled — skipping poll and setInterval. Return { data, error, isLoading } from the hook, where isLoading is true when data is null and error is null.",
    hint: "An early return inside useEffect is valid — but you must still return a cleanup function. A no-op cleanup `() => {}` or skipping with a conditional is both fine. `isLoading` can be derived: `!data && !error`.",
    example_code: `function usePriceFeed(ticker: string, refreshMs: number, active: boolean = true) {
  // ...
  useEffect(() => {
    if (!active) return;
    fetchPrice();
    timerRef.current = setInterval(fetchPrice, refreshMs);
    return () => clearInterval(timerRef.current ?? undefined);
  }, [ticker, refreshMs, active]);

  return { price, priceError, isLoading: !price && !priceError };
}`,
    think_prompt:
      "isLoading should be true only while no data and no error exists — i.e., the very first fetch is in flight. What boolean expression derives this from data and error without an extra state variable?",
    mc_options: [
      "isLoading = data === null",
      "isLoading = !data && !error",
      "isLoading = error === null",
    ],
    mc_correct_option: "isLoading = !data && !error",
    mc_anchor:
      "When data is null AND error is null, the hook is still loading — no response has arrived yet. Once either data or error is set, loading is complete. `!data && !error` derives isLoading from existing state without adding a separate loading variable — one fewer state to keep synchronized.",
    why_this_matters:
      "The enabled flag is essential for conditional polling — pausing the feed when the tab is hidden (using visibilitychange), when the user is offline, or when the component is in a collapsed panel. Without it, every usePolling consumer needs to handle pause logic themselves. With it, one prop handles all pause scenarios.",
    answer_keywords: ["enabled", "!enabled", "return", "isLoading", "!data && !error", "data", "error"],
    evaluate: evalL43Step5,
    seed_code: `import { useRef, useState, useEffect, useCallback } from 'react';

interface WarehouseSnapshot {
  warehouseId: string;
  totalUnits: number;
  lastUpdated: string;
}

function usePolling(url: string, interval: number) {
  const intervalRef = useRef<number | null>(null);
  const [data, setData] = useState<WarehouseSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  const poll = async () => {
    try {
      const res = await fetch(url);
      const json = await res.json() as WarehouseSnapshot;
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Polling error');
      setData(null);
    }
  };

  useEffect(() => {
    poll();
    intervalRef.current = setInterval(poll, interval);
    return () => {
      clearInterval(intervalRef.current ?? undefined);
    };
  }, [url, interval]);
}`,
    starter_code: `import { useRef, useState, useEffect, useCallback } from 'react';

interface WarehouseSnapshot {
  warehouseId: string;
  totalUnits: number;
  lastUpdated: string;
}

function usePolling(url: string, interval: number, enabled: boolean = true) {
  const intervalRef = useRef<number | null>(null);
  const [data, setData] = useState<WarehouseSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  const poll = async () => {
    try {
      const res = await fetch(url);
      const json = await res.json() as WarehouseSnapshot;
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Polling error');
      setData(null);
    }
  };

  useEffect(() => {
    // return early if !enabled
    poll();
    intervalRef.current = setInterval(poll, interval);
    return () => {
      clearInterval(intervalRef.current ?? undefined);
    };
  }, [url, interval, enabled]);

  // return { data, error, isLoading } — derive isLoading without extra state
}`,
    feedback_correct:
      "Complete — enabled flag pauses polling cleanly, isLoading derived without extra state. This hook is production-ready: immediate first load, interval refresh, cleanup, pause support, and a clean API.",
    feedback_partial:
      "Almost — check: is the early return at the top of the effect (before poll() and setInterval)? Is isLoading derived as `!data && !error`? Is enabled in the dependency array?",
    feedback_wrong:
      "Inside useEffect, first line: `if (!enabled) return;`. At the bottom of the hook: `return { data, error, isLoading: !data && !error };`. Add enabled to the dependency array: `[url, interval, enabled]`.",
    expected: `import { useRef, useState, useEffect, useCallback } from 'react';

interface WarehouseSnapshot {
  warehouseId: string;
  totalUnits: number;
  lastUpdated: string;
}

function usePolling(url: string, interval: number, enabled: boolean = true) {
  const intervalRef = useRef<number | null>(null);
  const [data, setData] = useState<WarehouseSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  const poll = async () => {
    try {
      const res = await fetch(url);
      const json = await res.json() as WarehouseSnapshot;
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Polling error');
      setData(null);
    }
  };

  useEffect(() => {
    if (!enabled) return;
    poll();
    intervalRef.current = setInterval(poll, interval);
    return () => {
      clearInterval(intervalRef.current ?? undefined);
    };
  }, [url, interval, enabled]);

  return { data, error, isLoading: !data && !error };
}`,
    analog_example: `function usePriceFeed(ticker: string, refreshMs: number, active: boolean = true) {
  useEffect(() => {
    if (!active) return;
    fetchQuote();
    timerRef.current = setInterval(fetchQuote, refreshMs);
    return () => clearInterval(timerRef.current ?? undefined);
  }, [ticker, refreshMs, active]);

  return { quote, quoteError, isLoading: !quote && !quoteError };
}`,
    deepDiveLabel:
      "enabled goes false — the early return fires. But what happens to an in-flight poll that's already running?",
    deepDive: {
      hook: "The user switches to an offline mode. `enabled` goes false. Your effect re-runs, the early return fires, and the interval is not restarted. But a poll() call was already in flight — a fetch that started 200ms ago. That fetch resolves 800ms later and calls setData — even though polling is supposed to be paused. The UI flickers with data during 'paused' mode.",
      pain: "⚠️ **Lesson:** The enabled flag stops future polls but can't cancel the in-flight one. What's the right mechanism to also abort the in-flight fetch when enabled goes false?",
      mentalModel:
        "**Mental model: The Pause Button and the Express Lane.**\nThe enabled flag is a pause button — it stops new trains from leaving the station. But a train already in the express lane (an in-flight fetch) can't be recalled. AbortController is the recall signal — you can send it to the train and the train will stop mid-journey.",
      discover: `// ✅ AbortController cancels in-flight fetches when enabled goes false
useEffect(() => {
  if (!enabled) return;
  const controller = new AbortController();

  const poll = async () => {
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
      const json = await res.json() as WarehouseSnapshot;
      setData(json); setError(null);
    } catch (err) {
      if ((err as Error).name === 'AbortError') return; // cancelled — ignore
      setError(err instanceof Error ? err.message : 'Error');
      setData(null);
    }
  };

  poll();
  intervalRef.current = setInterval(poll, interval);
  return () => {
    controller.abort(); // cancels any in-flight fetch
    clearInterval(intervalRef.current ?? undefined);
  };
}, [url, interval, enabled]);

// ❌ No abort — in-flight fetch still resolves and writes stale data after pause
useEffect(() => {
  if (!enabled) return;
  poll(); // this fetch can still land after enabled goes false
  intervalRef.current = setInterval(poll, interval);
  return () => clearInterval(intervalRef.current ?? undefined);
}, [url, interval, enabled]);`,
      quickRules:
        "✅ Use AbortController to cancel in-flight fetches in the cleanup\n✅ Check for AbortError before calling setError — abort is intentional, not an error\n✅ Early return on !enabled prevents new polls but doesn't cancel in-flight ones\n❌ Don't show error state for aborted fetches — AbortError is a controlled cancellation\n✅ For production hooks, always pair setInterval cleanup with fetch abort",
      watchOut:
        "👀 **Watch out:** If you check `error.name === 'AbortError'` but the error is not an Error object (some environments throw plain strings), the check fails and you set error state for an intentional abort. Use `(err as DOMException).name === 'AbortError'` and wrap in a safe check: `if (err instanceof Error && err.name === 'AbortError') return;`",
      dryRun:
        "🔁 **Think:** Your hook uses AbortController. The user pauses polling (enabled → false). A poll fetch is 400ms into a 1000ms round trip. The cleanup runs: controller.abort() is called. The fetch is cancelled mid-flight. The catch block fires with an AbortError. Your `if (err.name === 'AbortError') return` guard runs. What is the final state of data and error? Does the UI change? Should it?",
      build:
        "**Learning focus:** Add an enabled flag with an early return inside useEffect, and derive isLoading without extra state — completing a production-grade polling hook that supports pause, shows loading state, and cleans up on every change.",
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
  lessonNum: 43,
  title: "Custom Hook — usePolling",
  shortName: "HOOK — usePolling",
});
