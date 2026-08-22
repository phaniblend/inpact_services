import createINPACTEngine from "../inpact_engine_shared";

function normalizeCode(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

function evalL34Step1(answer) {
  const raw = String(answer || "");
  const hasGeneric = /function\s+useFetch\s*<\s*T\s*>|const\s+useFetch\s*=\s*<\s*T\s*>/m.test(raw);
  const hasUrl = /url\s*:\s*string/m.test(raw);
  const hasData = /useState\s*<\s*T\s*\|\s*null\s*>/m.test(raw) || /useState<T \| null>/m.test(raw);
  return hasGeneric && hasUrl && hasData ? "correct" : hasGeneric ? "partial" : "wrong";
}

function evalL34Step2(answer) {
  const raw = String(answer || "");
  const hasFetch = /fetch\s*\(\s*url\s*\)/m.test(raw);
  const hasJson = /\.json\s*\(\s*\)/m.test(raw);
  const hasSetData = /setData\s*\(/m.test(raw);
  return hasFetch && hasJson && hasSetData ? "correct" : hasFetch && hasJson ? "partial" : "wrong";
}

function evalL34Step3(answer) {
  const raw = String(answer || "");
  const hasAbortController = /AbortController/m.test(raw);
  const hasSignal = /signal/m.test(raw);
  const hasReturn = /return\s*\(\s*\)\s*=>/m.test(raw) || /return\s*function/m.test(raw);
  const hasAbort = /controller\.abort\s*\(\s*\)/m.test(raw);
  return hasAbortController && hasSignal && hasAbort && hasReturn ? "correct" :
    hasAbortController && hasSignal ? "partial" : "wrong";
}

function evalL34Step4(answer) {
  const raw = String(answer || "");
  const hasIgnore = /ignore/m.test(raw);
  const hasSetDataNull = /setData\s*\(\s*null\s*\)/m.test(raw);
  const hasReset = /setIsLoading|setError/m.test(raw);
  return hasIgnore && hasSetDataNull ? "correct" : hasIgnore ? "partial" : "wrong";
}

function evalL34Step5(answer) {
  const raw = String(answer || "");
  const hasUseFetch = /useFetch\s*</m.test(raw);
  const hasInterface = /interface\s+ShipmentRecord|type\s+ShipmentRecord/m.test(raw);
  const hasConditional = /isLoading|error/m.test(raw);
  return hasUseFetch && hasInterface && hasConditional ? "correct" : hasUseFetch && hasInterface ? "partial" : "wrong";
}

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "LESSON #34 (CUSTOM HOOKS)",
      title: "Custom Hook — useFetch",
      body: "Build a fully generic `useFetch<T>` hook that handles fetch, loading, error, and race condition cancellation using AbortController. You'll then use it to load a `ShipmentRecord` with full TypeScript type inference.",
      usecase:
        "Every page that loads remote data repeats the same pattern: fetch, set loading, handle errors, clean up on unmount. `useFetch` extracts that pattern into one reusable hook that works with any endpoint and any type — and cancels stale requests automatically.",
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
        reason: "The consumer component in Step 5 uses JSX conditional rendering. The component shell, fragment syntax, and expression embedding are all required to write the display layer that consumes the hook.",
      },
      {
        lesson: 10,
        label: "useState — Primitives",
        reason: "Step 1 initialises `data`, `isLoading`, and `error` with `useState`. The generic type parameter `useState<T | null>` extends the primitive pattern from Lesson 10 — you must be comfortable with typed useState before adding a type variable.",
      },
      {
        lesson: 24,
        label: "useEffect — Mount",
        reason: "The entire fetch sequence lives inside `useEffect`. Step 2's fetch call and Step 3's AbortController both sit inside the effect body — the mount/cleanup model from Lesson 24 is the structural foundation.",
      },
      {
        lesson: 25,
        label: "useEffect — Dependencies",
        reason: "Step 2 adds `[url]` as the dependency array. The rule that 'every external value read inside the effect belongs in the array' from Lesson 25 explains why the URL — not just a mount flag — drives re-fetching.",
      },
      {
        lesson: 28,
        label: "fetch + Loading + Error State",
        reason: "Step 2's fetch-then-json pattern and Step 3's error handling come directly from Lesson 28. The response.ok check, the try/catch structure, and the finally loading reset are all established there.",
      },
      {
        lesson: 33,
        label: "Custom Hook — Extract Logic",
        reason: "The shape of `useFetch` — state initialisation, useEffect, try/catch/finally, returned object — follows the pattern established in Lesson 33's `useShipmentStatus`. Step 1's generic extension builds directly on that structure.",
      },
    ],
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Define a generic custom hook `useFetch<T>` with a typed `data` state variable",
      "Fetch from a URL inside useEffect with [url] as the dependency array, parsing the response as JSON",
      "Cancel in-flight requests using AbortController and pass the signal to fetch",
      "Return a cleanup function from the effect that calls controller.abort()",
      "Guard against setting state on an unmounted component using an `ignore` flag",
      "Consume `useFetch<ShipmentRecord>` in a component with full type inference on the returned data",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 5",
    paal: "Define a generic hook `useFetch<T>` that accepts `url: string` and initialises three state variables: `data` typed as `T | null` (initial `null`), `isLoading` as boolean (initial `false`), and `error` as `string | null` (initial `null`). Return all three.",
    hint: "A generic hook uses a type parameter `<T>` on the function itself — the same way a generic function does. The type flows through to the `useState<T | null>` call.",
    example_code: `function useResource<R>(endpoint: string) {
  const [resource, setResource] = useState<R | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  return { resource, isFetching, fetchError };
}`,
    think_prompt:
      "What is the difference between `useState<T | null>(null)` and `useState(null)` in a generic hook — and why does it matter for the consumer?",
    mc_options: [
      "No difference — TypeScript infers the type from the initial value either way",
      "`useState<T | null>(null)` preserves the generic type parameter so the consumer gets typed data; `useState(null)` infers `null` and the consumer sees `data` typed as `null` forever",
      "`useState<T | null>(null)` is invalid — you can't use a type parameter inside a hook",
    ],
    mc_correct_option:
      "`useState<T | null>(null)` preserves the generic type parameter so the consumer gets typed data; `useState(null)` infers `null` and the consumer sees `data` typed as `null` forever",
    mc_anchor:
      "TypeScript infers `useState(null)` as `null` — not the `T` you intended. The explicit `useState<T | null>(null)` tells TypeScript: 'this starts as null but will become a value of type T'. The consumer then gets `data: ShipmentRecord | null` instead of `data: null`.",
    why_this_matters:
      "A `useFetch` hook that loses the generic type is useless for TypeScript codebases — every consumer has to cast the result. The generic parameter is what makes the hook a zero-overhead abstraction: you write the logic once and every call site gets full IntelliSense on the returned data.",
    answer_keywords: ["useFetch", "<T>", "useState<T | null>", "null", "isLoading", "error", "return"],
    seed_code: "",
    starter_code: `// define useFetch<T>(url: string) here
// state: data (T | null, null), isLoading (boolean, false), error (string | null, null)
// return all three`,
    feedback_correct:
      "Correct — generic type parameter on the function, `useState<T | null>(null)` preserving the type, all three returned. The caller's type annotation flows through.",
    feedback_partial:
      "Almost — check that the type parameter is on the function itself (`function useFetch<T>`) and that `data`'s state is typed `useState<T | null>`, not `useState(null)` which loses the generic.",
    feedback_wrong:
      "Pattern: `function useFetch<T>(url: string) { const [data, setData] = useState<T | null>(null); const [isLoading, setIsLoading] = useState<boolean>(false); const [error, setError] = useState<string | null>(null); return { data, isLoading, error }; }`",
    expected: `function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  return { data, isLoading, error };
}`,
    analog_example: `function useResource<R>(endpoint: string) {
  const [resource, setResource] = useState<R | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  return { resource, isFetching, fetchError };
}`,
    deepDiveLabel:
      "TypeScript can infer return types — so why do generic hooks sometimes need an explicit return type annotation?",
    deepDive: {
      hook: "You write `useFetch<ShipmentRecord>('/api/shipments/NX-1042')` in your component. IntelliSense shows `data: ShipmentRecord | null`. Perfect. A colleague refactors the hook and accidentally changes `useState<T | null>(null)` to `useState(null)`. Now `data` is typed `null` everywhere — but TypeScript doesn't error at the hook definition. It only surfaces as a type error at each call site, sometimes pages of cascade errors away from the change.",
      pain: "⚠️ **Lesson:** A single change inside the hook breaks every consumer's types, but the hook itself compiles cleanly. How do explicit return type annotations on the hook prevent this cascade?",
      mentalModel:
        "**Mental model: Inference is a reader, annotation is a contract.**\nWhen TypeScript infers the return type of a hook, it reads the current implementation and derives the type. If the implementation changes, the inferred return type changes — silently, for every consumer.\nAn explicit return type annotation is a contract: `useFetch<T>` always returns `{ data: T | null; isLoading: boolean; error: string | null }`. If the implementation diverges from that contract, TypeScript errors at the hook definition — not at the 40 call sites.",
      discover: `**Pattern — inferred vs annotated return:**
\`\`\`tsx
// ✅ annotated return type — implementation must honour the contract
interface FetchResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

function useFetch<T>(url: string): FetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  // if we accidentally wrote useState(null) here, TS errors HERE, not at call sites
  return { data, isLoading, error };
}

// ✅ inferred — simpler but no contract enforcement
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null); // must be right or callers break silently
  return { data, isLoading, error };
}
\`\`\``,
      quickRules:
        "**Quick rules:**\n- ✅ generic hooks used across many files benefit from explicit return type annotations\n- ✅ define a named interface for the return shape — it documents the API\n- ✅ inferred return types are fine for hooks used in 1–2 places\n- ❌ `useState(null)` in a generic hook loses the type parameter — always use `useState<T | null>(null)`\n- ❌ don't cast `data as T` inside the hook — that defeats type safety",
      watchOut:
        "👀 **Watch out:** `useState<T | null>(null)` and `useState<T>(null as T)` look similar but mean different things. The first says 'this can be null'. The second lies to TypeScript — it claims the value is type T when it's actually null. Using `null as T` to satisfy a stricter type is a type-safety escape hatch that you'll regret when a consumer tries to access a property on the 'guaranteed non-null' data.",
      dryRun:
        "🔁 **Think:** You call `useFetch<ShipmentRecord[]>('/api/shipments')` and also `useFetch<DriverSummary>('/api/drivers/D-01')`. TypeScript infers `data` differently for each call site. How does the single generic function definition produce two different return types — and what would happen if you tried to call `.map()` on the data returned by the second call?",
      build:
        "**Learning focus:** Define a generic custom hook using a type parameter `<T>` on the function itself, and explicitly type the `useState` call as `useState<T | null>` to preserve the generic through to every consumer.",
    },
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 5",
    paal: "Add a `useEffect` inside the hook with `[url]` as the dependency array. Inside: set `isLoading` to `true`, then use an async inner function to `fetch(url)`, call `.json()` on the response, and set the result as `data`. Handle errors in `catch` by setting `error` to the caught message, and always set `isLoading` to `false` in `finally`.",
    hint: "The fetch response's `.json()` method returns `Promise<any>`. TypeScript will accept the cast implicitly when you call `setData(result)` because `setData` already expects `T | null`.",
    example_code: `useEffect(() => {
  setIsFetching(true);
  const load = async () => {
    try {
      const res = await fetch(endpoint);
      const result = await res.json();
      setResource(result);
    } catch (err) {
      setFetchError((err as Error).message);
    } finally {
      setIsFetching(false);
    }
  };
  load();
}, [endpoint]);`,
    think_prompt:
      "The fetch API returns a resolved Promise even when the server responds with a 404 or 500. How do you detect that kind of failure inside your try block?",
    mc_options: [
      "The `catch` block will catch 4xx and 5xx responses automatically",
      "Check `response.ok` after the fetch — it's `false` for 4xx/5xx — and throw manually if needed",
      "4xx and 5xx responses return null from `.json()` which the catch block handles",
    ],
    mc_correct_option:
      "Check `response.ok` after the fetch — it's `false` for 4xx/5xx — and throw manually if needed",
    mc_anchor:
      "The fetch API only rejects on network failure (no connection, DNS error). A 404 or 500 is a successful HTTP transaction — the promise resolves. You must inspect `response.ok` or `response.status` and throw manually to route those failures through the catch block.",
    why_this_matters:
      "A logistics API that returns 404 for an unknown shipment ID won't cause your catch block to fire. Without the `response.ok` check, `setData` receives the error JSON body as if it were valid data — and the component renders garbage. This is one of the most common silent data bugs in production React applications.",
    answer_keywords: ["useEffect", "fetch", "url", "json", "setData", "setError", "setIsLoading", "finally", "url"],
    seed_code: `function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  return { data, isLoading, error };
}`,
    starter_code: `function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // add useEffect with [url] dependency
  // inner async fn: fetch(url) → .json() → setData
  // catch: setError
  // finally: setIsLoading(false)

  return { data, isLoading, error };
}`,
    feedback_correct:
      "Correct — inner async function, try/catch/finally, `[url]` in the dependency array. The hook now fetches and handles errors for any URL.",
    feedback_partial:
      "Almost — check that the dependency array contains `[url]`, that `setIsLoading(false)` is in `finally`, and that the `catch` block sets `error` to a string (use `(err as Error).message`).",
    feedback_wrong:
      "Pattern: `useEffect(() => { setIsLoading(true); const load = async () => { try { const res = await fetch(url); const result = await res.json(); setData(result); } catch (err) { setError((err as Error).message); } finally { setIsLoading(false); } }; load(); }, [url]);`",
    expected: `function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const load = async () => {
      try {
        const res = await fetch(url);
        const result = await res.json();
        setData(result);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [url]);

  return { data, isLoading, error };
}`,
    analog_example: `useEffect(() => {
  setIsFetching(true);
  const load = async () => {
    try {
      const res = await fetch(endpoint);
      const result = await res.json();
      setResource(result);
    } catch (err) {
      setFetchError((err as Error).message);
    } finally {
      setIsFetching(false);
    }
  };
  load();
}, [endpoint]);`,
    deepDiveLabel:
      "fetch resolves on 404 — so what does your catch block actually catch?",
    deepDive: {
      hook: "Your shipment detail page shows 'NX-UNKNOWN'. The URL returns a 404. The loading spinner appears and disappears. The page renders an empty card — no error message, no fallback. DevTools shows a 404 in the Network tab, but your catch block never ran. The data displayed is the error body JSON that the API returned.",
      pain: "⚠️ **Lesson:** A 404 response resolves the fetch Promise. Your catch block gets nothing. Why does the fetch API behave this way — and what's the one-line fix?",
      mentalModel:
        "**Mental model: fetch cares about the network, not the server's opinion.**\nThe fetch API's job is to make an HTTP request and receive a response. If the network delivers a response — any response — the promise resolves. The server saying 'not found' or 'error' is a valid response from the network's perspective.\nThe Promise only rejects when the network itself fails: no connection, DNS lookup failure, request timeout, CORS block.\n`response.ok` is the bridge between 'network succeeded' and 'server succeeded'. It's `true` for 2xx status codes, `false` for everything else.",
      discover: `**Pattern — response.ok guard:**
\`\`\`tsx
// ✅ explicit ok check — catches 4xx and 5xx as errors
const res = await fetch(url);
if (!res.ok) {
  throw new Error(\`HTTP \${res.status}: \${res.statusText}\`);
}
const result = await res.json();
setData(result);

// ❌ no check — 404 body is parsed as data
const res = await fetch(url);
const result = await res.json(); // result is the error body JSON
setData(result); // garbage data, no error shown
\`\`\``,
      quickRules:
        "**Quick rules:**\n- ✅ always check `response.ok` after `await fetch()` before calling `.json()`\n- ✅ throw a descriptive error with the status code — `HTTP 404: Not Found`\n- ✅ the thrown error flows into the catch block and sets the user-facing error state\n- ❌ don't assume `catch` handles server errors — it handles network errors only\n- ❌ don't call `.json()` without checking `response.ok` — error bodies are valid JSON too",
      watchOut:
        "👀 **Watch out:** Calling `.json()` on a response with no body (204 No Content, some 404s) throws a SyntaxError — 'Unexpected end of JSON input'. That error does hit your catch block, but the message is confusing. Check `response.ok` first, and for endpoints that return no body on success, skip the `.json()` call entirely.",
      dryRun:
        "🔁 **Think:** Your API returns `{ error: 'Shipment not found' }` with a 404 status. Without the `response.ok` check, what value does `data` hold after the fetch? What does the component render? Now add the `response.ok` check — what value does `error` hold instead, and what does the component render?",
      build:
        "**Learning focus:** The fetch Promise resolves on any HTTP response — check `response.ok` and throw manually for 4xx/5xx to route server errors through the catch block and into the user-facing error state.",
    },
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 5",
    paal: "Add an `AbortController` inside the `useEffect`. Pass `controller.signal` as the second argument to `fetch`. Return a cleanup function from the effect that calls `controller.abort()`.",
    hint: "The cleanup function is returned from the `useEffect` callback — not from the inner async function. It runs when the component unmounts or before the effect re-runs.",
    example_code: `useEffect(() => {
  const controller = new AbortController();
  setIsFetching(true);
  const load = async () => {
    try {
      const res = await fetch(endpoint, { signal: controller.signal });
      const result = await res.json();
      setResource(result);
    } catch (err) {
      setFetchError((err as Error).message);
    } finally {
      setIsFetching(false);
    }
  };
  load();
  return () => controller.abort();
}, [endpoint]);`,
    think_prompt:
      "When does the cleanup function returned from `useEffect` actually run — and why is that the right moment to call `controller.abort()`?",
    mc_options: [
      "It runs after every render, before the next effect fires",
      "It runs when the component unmounts OR just before the effect re-runs due to a dependency change",
      "It only runs when the component unmounts — it does not run between re-runs",
    ],
    mc_correct_option:
      "It runs when the component unmounts OR just before the effect re-runs due to a dependency change",
    mc_anchor:
      "React calls the cleanup before every re-run of the effect (not just on unmount). So when `url` changes, React aborts the previous request before starting the new one. This is exactly what prevents a slower old request from overwriting the results of a faster new one.",
    why_this_matters:
      "A user types a route ID into a search field. Every keystroke fires a new fetch. Without AbortController, all 10 requests race to set state — the last one to arrive wins, not the most recent one sent. AbortController cancels every superseded request, so only the current request's result ever reaches state.",
    answer_keywords: ["AbortController", "controller", "signal", "abort", "return", "() =>"],
    seed_code: `function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const load = async () => {
      try {
        const res = await fetch(url);
        const result = await res.json();
        setData(result);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [url]);

  return { data, isLoading, error };
}`,
    starter_code: `function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // create AbortController here
    setIsLoading(true);
    const load = async () => {
      try {
        const res = await fetch(url /* pass signal here */);
        const result = await res.json();
        setData(result);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
    // return cleanup that calls controller.abort()
  }, [url]);

  return { data, isLoading, error };
}`,
    feedback_correct:
      "Correct — AbortController created at the top of the effect, signal passed to fetch, cleanup returns `controller.abort()`. Stale requests are now cancelled automatically.",
    feedback_partial:
      "Almost — check three things: is `controller.signal` passed as `{ signal: controller.signal }` to fetch, is the cleanup a `return () => controller.abort()` at the end of the effect (not inside the async function), and does the controller exist before the async call?",
    feedback_wrong:
      "Pattern: `const controller = new AbortController();` at the top of the effect, `fetch(url, { signal: controller.signal })` inside the async function, and `return () => controller.abort();` at the end of the useEffect callback.",
    expected: `function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    const load = async () => {
      try {
        const res = await fetch(url, { signal: controller.signal });
        const result = await res.json();
        setData(result);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [url]);

  return { data, isLoading, error };
}`,
    analog_example: `useEffect(() => {
  const controller = new AbortController();
  setIsFetching(true);
  const load = async () => {
    try {
      const res = await fetch(endpoint, { signal: controller.signal });
      const result = await res.json();
      setResource(result);
    } catch (err) {
      setFetchError((err as Error).message);
    } finally {
      setIsFetching(false);
    }
  };
  load();
  return () => controller.abort();
}, [endpoint]);`,
    deepDiveLabel:
      "abort() cancels the request — but why does the catch block still fire when it's aborted?",
    deepDive: {
      hook: "You add AbortController. You check the Network tab — requests are cancelled as expected. But your error state shows 'The user aborted a request.' after every navigation. Users see a flashing error message. The abort works, but it's being treated as a real error.",
      pain: "⚠️ **Lesson:** An aborted fetch throws a `DOMException` with name `AbortError`. Your catch block doesn't know the difference between 'real error' and 'intentional abort'. How do you handle them differently?",
      mentalModel:
        "**Mental model: abort is not failure — it's cancellation.**\nWhen `controller.abort()` fires, the fetch Promise rejects with a `DOMException` whose `.name` property is `'AbortError'`.\nYour catch block needs to distinguish:\n- `AbortError` → intentional cleanup, ignore it silently\n- Everything else → real error, set error state\nThe check is one line: `if (err instanceof DOMException && err.name === 'AbortError') return;`",
      discover: `**Pattern — AbortError filtering:**
\`\`\`tsx
// ✅ ignore aborts, surface real errors
} catch (err) {
  if (err instanceof DOMException && err.name === 'AbortError') return;
  setError((err as Error).message);
}

// ❌ treats abort as error — shows flash error on every navigation
} catch (err) {
  setError((err as Error).message); // 'The user aborted a request.'
}
\`\`\``,
      quickRules:
        "**Quick rules:**\n- ✅ always filter `AbortError` in the catch block of any fetch with a signal\n- ✅ `err instanceof DOMException && err.name === 'AbortError'` is the standard check\n- ✅ early `return` from the catch block after the abort check — don't set error state\n- ❌ don't use `err.message.includes('abort')` — message text is not standardised across browsers\n- ❌ `finally` still runs after an abort — `setIsLoading(false)` fires even for cancelled requests",
      watchOut:
        "👀 **Watch out:** `finally` runs even when the request is aborted. If you check `if (!ignore) setIsLoading(false)` inside `finally`, you need the `ignore` flag (Step 4) too. AbortController and the `ignore` flag solve slightly different problems — abort cancels the network request, `ignore` prevents state mutation on a component that's already unmounted.",
      dryRun:
        "🔁 **Think:** The user navigates to a shipment detail page, triggering a fetch. Before the response arrives, they navigate away. React unmounts the component, the cleanup runs, `controller.abort()` fires. The fetch rejects with `AbortError`. Walk through the catch and finally blocks — which lines execute, which state setters fire, and does the component see any of those state updates?",
      build:
        "**Learning focus:** AbortController cancels in-flight requests when the effect re-runs or the component unmounts — filter `AbortError` in the catch block so intentional cancellation is never presented to the user as an error.",
    },
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 5",
    paal: "Add an `ignore` flag (boolean, `false`) at the top of the effect. After `load()` resolves, only call `setData` and `setError` when `ignore` is still `false`. In the cleanup function, set `ignore = true` before calling `controller.abort()`.",
    hint: "The `ignore` flag guards against setting state on an unmounted component. It's a simple boolean local to the effect's closure — no `useRef` needed.",
    example_code: `useEffect(() => {
  const controller = new AbortController();
  let ignore = false;
  setIsFetching(true);
  const load = async () => {
    try {
      const res = await fetch(endpoint, { signal: controller.signal });
      const result = await res.json();
      if (!ignore) setResource(result);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      if (!ignore) setFetchError((err as Error).message);
    } finally {
      if (!ignore) setIsFetching(false);
    }
  };
  load();
  return () => { ignore = true; controller.abort(); };
}, [endpoint]);`,
    think_prompt:
      "AbortController already cancels the in-flight request. Why do you still need an `ignore` flag — what scenario does AbortController NOT cover?",
    mc_options: [
      "AbortController always fires before the response arrives — the ignore flag is redundant",
      "There is a small window between when a response arrives and when abort() is called where state could still be set — ignore closes that gap",
      "The ignore flag is only needed in StrictMode — abort handles it in production",
    ],
    mc_correct_option:
      "There is a small window between when a response arrives and when abort() is called where state could still be set — ignore closes that gap",
    mc_anchor:
      "AbortController and the `ignore` flag handle overlapping but different cases. AbortController cancels the network request. But if the response arrives at the exact same tick as the cleanup runs, the fetch resolves before the abort signal propagates. The `ignore` flag catches that window — once it's `true`, no state setter fires regardless of timing.",
    why_this_matters:
      "In production, slow API endpoints and React StrictMode's double-invoke behaviour combine to produce 'Warning: Can't perform a React state update on an unmounted component' in logs. The `ignore` flag is the defence-in-depth pattern that closes every race window AbortController misses.",
    answer_keywords: ["ignore", "let ignore = false", "!ignore", "ignore = true", "abort"],
    seed_code: `function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    const load = async () => {
      try {
        const res = await fetch(url, { signal: controller.signal });
        const result = await res.json();
        setData(result);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [url]);

  return { data, isLoading, error };
}`,
    starter_code: `function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let ignore = false; // ← flag starts false
    setIsLoading(true);
    const load = async () => {
      try {
        const res = await fetch(url, { signal: controller.signal });
        const result = await res.json();
        if (!ignore) setData(result); // ← guard setData
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        // guard setError with !ignore too
      } finally {
        // guard setIsLoading(false) with !ignore too
      }
    };
    load();
    return () => {
      // set ignore = true, then abort
    };
  }, [url]);

  return { data, isLoading, error };
}`,
    feedback_correct:
      "Correct — `ignore` guards all three setters and is flipped to `true` before the abort. This is the complete, race-condition-safe fetch pattern.",
    feedback_partial:
      "Almost — check that ALL three state setters are guarded (`setData`, `setError`, `setIsLoading`), and that `ignore = true` is set in the cleanup function before `controller.abort()` is called.",
    feedback_wrong:
      "Pattern: `let ignore = false;` at the top of the effect. Wrap every setter: `if (!ignore) setData(result)`, `if (!ignore) setError(...)`, `if (!ignore) setIsLoading(false)`. Cleanup: `return () => { ignore = true; controller.abort(); };`",
    expected: `function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let ignore = false;
    setIsLoading(true);
    const load = async () => {
      try {
        const res = await fetch(url, { signal: controller.signal });
        const result = await res.json();
        if (!ignore) setData(result);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (!ignore) setError((err as Error).message);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };
    load();
    return () => { ignore = true; controller.abort(); };
  }, [url]);

  return { data, isLoading, error };
}`,
    analog_example: `useEffect(() => {
  const controller = new AbortController();
  let ignore = false;
  setIsFetching(true);
  const load = async () => {
    try {
      const res = await fetch(endpoint, { signal: controller.signal });
      const result = await res.json();
      if (!ignore) setResource(result);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      if (!ignore) setFetchError((err as Error).message);
    } finally {
      if (!ignore) setIsFetching(false);
    }
  };
  load();
  return () => { ignore = true; controller.abort(); };
}, [endpoint]);`,
    deepDiveLabel:
      "ignore is a plain boolean — so why doesn't it need to be a useRef?",
    deepDive: {
      hook: "A colleague suggests turning the `ignore` flag into a `useRef` — 'so it persists across renders'. You try it. It works. But then you realise: between every effect re-run, the ref keeps its value from the last run. The `ignore` flag is supposed to start `false` on every effect run. With a ref, the second run inherits `true` from the first cleanup — and every fetch after the first is immediately ignored.",
      pain: "⚠️ **Lesson:** A `useRef` for `ignore` causes every fetch after the first to be silently dropped. Why does a plain `let` variable work correctly when a ref doesn't?",
      mentalModel:
        "**Mental model: The effect closure is a fresh scope on every run.**\nEvery time React re-runs the effect, it calls the effect callback from scratch. A new `let ignore = false` is declared inside that call — fresh, independent of every previous run.\nThe cleanup function from the previous run closes over the previous run's `ignore` variable. Setting `ignore = true` in that cleanup only affects the old run's closure — the new run already has its own fresh `false`.\n`useRef` persists a single mutable object across all renders and effect runs. It's the right tool when you need to read a value from the current render inside a stale closure. It's the wrong tool when you need a value that must be fresh and isolated per effect invocation.",
      discover: `**Pattern — let vs useRef for ignore flag:**
\`\`\`tsx
// ✅ let — fresh false on every effect run, cleanup closes over its own copy
useEffect(() => {
  let ignore = false; // new variable per run
  const load = async () => {
    if (!ignore) setData(result); // reads this run's ignore
  };
  return () => { ignore = true; }; // sets this run's ignore
}, [url]);

// ❌ useRef — single mutable object, persists across runs
const ignoreRef = useRef(false);
useEffect(() => {
  ignoreRef.current = false; // must manually reset — easy to forget
  const load = async () => {
    if (!ignoreRef.current) setData(result);
  };
  return () => { ignoreRef.current = true; }; // affects the shared object
}, [url]); // if you forget the reset, every fetch after the first is ignored
\`\`\``,
      quickRules:
        "**Quick rules:**\n- ✅ use `let ignore = false` inside the effect — fresh scope per run, no reset needed\n- ✅ `useRef` is for persisting values across renders, not for per-effect isolation\n- ✅ the cleanup always closes over its own run's `ignore` — no cross-run contamination\n- ❌ don't use `useRef` for the ignore flag — the shared mutable object requires manual reset\n- ❌ don't declare `ignore` outside the effect — same problem as useRef: shared state",
      watchOut:
        "👀 **Watch out:** StrictMode double-invokes effects in development. Your effect runs, runs its cleanup (setting `ignore = true` for run 1), then runs again with a fresh `ignore = false` for run 2. This looks like a double fetch in DevTools but is expected — it's React testing that your cleanup is correct. The second run's data is what the component sees.",
      dryRun:
        "🔁 **Think:** The URL changes three times in rapid succession. Three effect runs start. Each has its own `ignore` variable initialised to `false`. The cleanups for run 1 and run 2 fire (setting their closures' `ignore` to `true`). Run 3's cleanup has not fired. The response from run 1 arrives. Walk through: which `ignore` variable does run 1's async callback read, and does `setData` fire?",
      build:
        "**Learning focus:** Use a plain `let ignore = false` inside the effect — not `useRef` — because the effect callback creates a fresh closure on every run and the `ignore` flag must be isolated per run to correctly prevent stale state updates.",
    },
  },
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 5",
    paal: "Define a `ShipmentRecord` interface with fields: `id: string`, `destination: string`, `status: string`, and `eta: string`. Write a `ShipmentDetail` component with prop `shipmentId: string` that calls `useFetch<ShipmentRecord>` with the URL `'/api/shipments/' + shipmentId`. Render a loading paragraph, an error paragraph, or a `<div>` with the shipment's `id`, `destination`, `status`, and `eta` fields.",
    hint: "Once `data` is confirmed non-null (past the loading and error guards), TypeScript knows it's a `ShipmentRecord` — you can access `.id`, `.destination`, etc. with full IntelliSense.",
    example_code: `interface WarehouseRecord {
  warehouseId: string;
  location: string;
  capacity: number;
}

const WarehouseDetail = ({ warehouseId }: { warehouseId: string }) => {
  const { data, isLoading, error } = useFetch<WarehouseRecord>('/api/warehouses/' + warehouseId);
  if (isLoading) return <p>Loading…</p>;
  if (error) return <p>{error}</p>;
  if (!data) return null;
  return (
    <div>
      <p>{data.warehouseId}</p>
      <p>{data.location}</p>
    </div>
  );
};`,
    think_prompt:
      "After your loading and error early returns, TypeScript still types `data` as `ShipmentRecord | null`. What guard narrows it to `ShipmentRecord` before you access `.id`?",
    mc_options: [
      "TypeScript automatically narrows `data` to `ShipmentRecord` after the `if (error)` guard",
      "You need `if (!data) return null;` to narrow `data` from `T | null` to `T` before accessing its fields",
      "Cast it with `data as ShipmentRecord` — the type parameter doesn't narrow automatically",
    ],
    mc_correct_option:
      "You need `if (!data) return null;` to narrow `data` from `T | null` to `T` before accessing its fields",
    mc_anchor:
      "TypeScript tracks nullability through control flow. After `if (!data) return null`, it knows `data` is not null in the next lines — so `.id`, `.destination` etc. are safe to access without the `!` non-null assertion. The error guard alone doesn't remove `null` from the type because the initial `data` state is `null` independent of whether there's an error.",
    why_this_matters:
      "The `null` guard is the bridge between runtime safety and compile-time safety. Without it, every field access on `data` requires a `?.` optional chain or TypeScript will error. With it, the component's happy path is clean — `data.id`, not `data?.id` — and TypeScript proves it's safe.",
    answer_keywords: ["ShipmentRecord", "interface", "useFetch<ShipmentRecord>", "isLoading", "error", "data", "!data"],
    seed_code: `function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let ignore = false;
    setIsLoading(true);
    const load = async () => {
      try {
        const res = await fetch(url, { signal: controller.signal });
        const result = await res.json();
        if (!ignore) setData(result);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (!ignore) setError((err as Error).message);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };
    load();
    return () => { ignore = true; controller.abort(); };
  }, [url]);

  return { data, isLoading, error };
}`,
    starter_code: `function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let ignore = false;
    setIsLoading(true);
    const load = async () => {
      try {
        const res = await fetch(url, { signal: controller.signal });
        const result = await res.json();
        if (!ignore) setData(result);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (!ignore) setError((err as Error).message);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };
    load();
    return () => { ignore = true; controller.abort(); };
  }, [url]);

  return { data, isLoading, error };
}

// define ShipmentRecord interface: id, destination, status, eta (all strings)

// define ShipmentDetail({ shipmentId }: { shipmentId: string })
// call useFetch<ShipmentRecord> with '/api/shipments/' + shipmentId
// render: loading → error → !data guard → div with all four fields`,
    feedback_correct:
      "Correct — interface defined, hook called with the type parameter, all four early returns / guards in place, and the happy-path div renders all four fields. TypeScript narrows `data` to `ShipmentRecord` after the `!data` guard.",
    feedback_partial:
      "Almost — check that you have all four guards (isLoading, error, !data, then data fields), that the interface has all four fields, and that the URL is constructed with `+ shipmentId`.",
    feedback_wrong:
      "Pattern: interface with id/destination/status/eta strings, `const { data, isLoading, error } = useFetch<ShipmentRecord>('/api/shipments/' + shipmentId)`, four early returns/guards, then `<div><p>{data.id}</p>…</div>`.",
    expected: `function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let ignore = false;
    setIsLoading(true);
    const load = async () => {
      try {
        const res = await fetch(url, { signal: controller.signal });
        const result = await res.json();
        if (!ignore) setData(result);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (!ignore) setError((err as Error).message);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };
    load();
    return () => { ignore = true; controller.abort(); };
  }, [url]);

  return { data, isLoading, error };
}

interface ShipmentRecord {
  id: string;
  destination: string;
  status: string;
  eta: string;
}

const ShipmentDetail = ({ shipmentId }: { shipmentId: string }) => {
  const { data, isLoading, error } = useFetch<ShipmentRecord>('/api/shipments/' + shipmentId);
  if (isLoading) return <p>Loading…</p>;
  if (error) return <p>{error}</p>;
  if (!data) return null;
  return (
    <div>
      <p>{data.id}</p>
      <p>{data.destination}</p>
      <p>{data.status}</p>
      <p>{data.eta}</p>
    </div>
  );
};`,
    analog_example: `interface WarehouseRecord {
  warehouseId: string;
  location: string;
  capacity: number;
}

const WarehouseDetail = ({ warehouseId }: { warehouseId: string }) => {
  const { data, isLoading, error } = useFetch<WarehouseRecord>('/api/warehouses/' + warehouseId);
  if (isLoading) return <p>Loading…</p>;
  if (error) return <p>{error}</p>;
  if (!data) return null;
  return (
    <div>
      <p>{data.warehouseId}</p>
      <p>{data.location}</p>
    </div>
  );
};`,
    deepDiveLabel:
      "the hook is generic — so what stops a caller from passing the wrong interface and getting no compile error?",
    deepDive: {
      hook: "You call `useFetch<ShipmentRecord>('/api/drivers/D-01')`. The URL returns a `DriverSummary` object. TypeScript is silent — the generic parameter you passed (`ShipmentRecord`) has nothing to do with what the API actually returns. You get `data.destination` — which is undefined at runtime because the actual object has `data.name` and `data.vehicleId`. The component renders empty fields. No type error. No runtime crash.",
      pain: "⚠️ **Lesson:** The generic parameter is a promise to TypeScript, not a verification against the API. Why can't TypeScript validate the shape of JSON responses — and what's the practical solution?",
      mentalModel:
        "**Mental model: TypeScript ends at the API boundary.**\nTypeScript checks code — it doesn't introspect HTTP responses at runtime. When you write `useFetch<ShipmentRecord>`, you're telling TypeScript: 'I promise the JSON from this URL will be a ShipmentRecord.' TypeScript trusts you.\nThe JSON that arrives is `any` until you assert otherwise. The cast from `any` to `T` (implicit in `setData(result)`) is TypeScript accepting your promise — not verifying it.\nThe practical solutions: runtime validation (Zod schemas that parse and throw if the shape doesn't match), contract testing (API tests that verify the schema), or code generation (OpenAPI → TypeScript types so the types are guaranteed to match the real API).",
      discover: `**Pattern — typed vs validated fetch:**
\`\`\`tsx
// ✅ typed only — compile-time safety, no runtime verification
const { data } = useFetch<ShipmentRecord>('/api/shipments/NX-1042');
// data is ShipmentRecord | null in TypeScript, any shape at runtime

// ✅ typed + validated — Zod parses and throws if shape doesn't match
const ShipmentRecordSchema = z.object({
  id: z.string(),
  destination: z.string(),
  status: z.string(),
  eta: z.string(),
});
// In useFetch: const parsed = ShipmentRecordSchema.parse(result); setData(parsed);
// Now runtime shape IS verified — wrong API response throws, caught by error state
\`\`\``,
      quickRules:
        "**Quick rules:**\n- ✅ the generic type parameter gives IntelliSense and compile-time safety\n- ✅ for critical data paths, add Zod (or equivalent) runtime validation inside the hook or at call time\n- ✅ use OpenAPI-generated types when available — they're derived from the actual API contract\n- ❌ don't assume `useFetch<T>` verifies the API shape — it's a type assertion, not a check\n- ❌ don't cast with `as T` inside the hook explicitly — it suppresses the one place TypeScript might warn",
      watchOut:
        "👀 **Watch out:** Passing a more specific interface than the API returns is a silent risk, but passing a less specific interface is often worse. `useFetch<Record<string, unknown>>` compiles everywhere but gives you no IntelliSense on `data` — you lose the entire benefit of the generic. Always be as specific as you can reasonably assert.",
      dryRun:
        "🔁 **Think:** You add a Zod schema that parses the fetch response inside `useFetch`. The API returns a `ShipmentRecord` with an extra field `legacyCode: number` that isn't in your Zod schema. Does the parse succeed or throw? Now add `.passthrough()` to the schema — what changes about the parsed value, and what does TypeScript now know about `data`?",
      build:
        "**Learning focus:** The generic type parameter `<T>` in `useFetch<T>` is a compile-time assertion, not a runtime guarantee — TypeScript trusts the caller's type annotation. For production data paths, pair the generic type with runtime schema validation.",
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
  lessonNum: 34,
  title: "Custom Hook — useFetch",
  shortName: "CUSTOM HOOK — useFetch",
});
