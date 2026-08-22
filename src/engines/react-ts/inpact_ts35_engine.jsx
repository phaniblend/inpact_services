import createINPACTEngine from "../inpact_engine_shared";

function normalizeCode(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

function evalL35Step1(answer) {
  const raw = String(answer || "");
  const hasGeneric = /function\s+useDebounce\s*<\s*T\s*>|const\s+useDebounce\s*=\s*<\s*T\s*>/m.test(raw);
  const hasValue = /value\s*:\s*T/m.test(raw);
  const hasDelay = /delay\s*:\s*number/m.test(raw);
  const hasState = /useState\s*<\s*T\s*>/m.test(raw);
  return hasGeneric && hasValue && hasDelay && hasState ? "correct" : hasGeneric ? "partial" : "wrong";
}

function evalL35Step2(answer) {
  const raw = String(answer || "");
  const hasUseEffect = /useEffect\s*\(/m.test(raw);
  const hasSetTimeout = /setTimeout\s*\(/m.test(raw);
  const hasSetDebounced = /setDebouncedValue\s*\(/m.test(raw);
  const hasDeps = /\[\s*value\s*,\s*delay\s*\]|\[\s*delay\s*,\s*value\s*\]/m.test(raw);
  return hasUseEffect && hasSetTimeout && hasSetDebounced && hasDeps ? "correct" :
    hasUseEffect && hasSetTimeout ? "partial" : "wrong";
}

function evalL35Step3(answer) {
  const raw = String(answer || "");
  const hasClearTimeout = /clearTimeout\s*\(/m.test(raw);
  const hasTimer = /const\s+timer\s*=|const\s+id\s*=|const\s+timeout\s*=/m.test(raw);
  const hasReturn = /return\s*\(\s*\)\s*=>\s*clearTimeout/m.test(raw);
  return hasClearTimeout && hasTimer && hasReturn ? "correct" : hasClearTimeout ? "partial" : "wrong";
}

function evalL35Step4(answer) {
  const raw = String(answer || "");
  const hasUseDebounce = /useDebounce\s*</m.test(raw) || /useDebounce\s*\(/m.test(raw);
  const hasQuery = /query|search/im.test(raw);
  const hasUseState = /useState/m.test(raw);
  const hasOnChange = /onChange/m.test(raw);
  return hasUseDebounce && hasQuery && hasOnChange ? "correct" : hasUseDebounce && hasQuery ? "partial" : "wrong";
}

function evalL35Step5(answer) {
  const raw = String(answer || "");
  const hasDebouncedQuery = /debouncedQuery/m.test(raw);
  const hasUseEffect = /useEffect/m.test(raw);
  const hasDebouncedDep = /\[\s*debouncedQuery\s*\]/m.test(raw);
  return hasDebouncedQuery && hasUseEffect && hasDebouncedDep ? "correct" :
    hasDebouncedQuery && hasUseEffect ? "partial" : "wrong";
}

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "LESSON #35 (CUSTOM HOOKS)",
      title: "Custom Hook — useDebounce",
      body: "Build a generic `useDebounce<T>` hook using setTimeout and useEffect cleanup. You'll use it to debounce a shipment search input so the API is only called after the user stops typing — not on every keystroke.",
      usecase:
        "A shipment search field that fetches on every keystroke fires dozens of API calls per second and makes the UI feel laggy. Debouncing delays the fetch until the user pauses. `useDebounce` extracts that delay logic into a hook that works with any value type — strings, numbers, objects.",
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
        reason: "Step 4's `ShipmentSearch` component uses an input element with an `onChange` handler and renders the debounced result. The controlled input JSX pattern and expression embedding are required to write the consumer.",
      },
      {
        lesson: 10,
        label: "useState — Primitives",
        reason: "Step 1 initialises `debouncedValue` with `useState<T>(value)`. The pattern of using a prop value as the initial state — and understanding that the initial value is only used once, on mount — is established in Lesson 10.",
      },
      {
        lesson: 24,
        label: "useEffect — Mount",
        reason: "The entire debounce mechanism lives inside `useEffect`. Step 2 schedules the setTimeout inside the effect body — the mental model that effects run after render (not during) is required to understand why the delay fires correctly.",
      },
      {
        lesson: 25,
        label: "useEffect — Dependencies",
        reason: "Step 2's dependency array `[value, delay]` is what causes the effect to restart whenever the input changes — cancelling the previous timer and starting a fresh one. The 'every external value belongs in the array' rule from Lesson 25 is what makes debouncing work.",
      },
      {
        lesson: 33,
        label: "Custom Hook — Extract Logic",
        reason: "The hook structure — `use` prefix, useState inside, useEffect inside, return value — follows the pattern from Lesson 33. Step 1's generic extension and Step 3's cleanup return build directly on that foundation.",
      },
    ],
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Define a generic hook `useDebounce<T>` that accepts a value and a delay and returns a debounced copy of the value",
      "Schedule the debounced state update using setTimeout inside useEffect with [value, delay] as dependencies",
      "Return a cleanup function from useEffect that calls clearTimeout to cancel the pending timer",
      "Understand why the cleanup cancels the previous timer before the new one starts",
      "Use `useDebounce<string>` in a component to debounce a search input",
      "Trigger a fetch only when the debounced value changes, not on every keystroke",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 5",
    paal: "Define a generic hook `useDebounce<T>` that accepts `value: T` and `delay: number`. Initialise a state variable `debouncedValue` with type `T` and initial value `value`. Return `debouncedValue`.",
    hint: "The state initialises from the `value` argument — so on the first render, `debouncedValue` equals `value` immediately, before any timer fires.",
    example_code: `function useThrottle<R>(input: R, interval: number) {
  const [throttledInput, setThrottledInput] = useState<R>(input);
  return throttledInput;
}`,
    think_prompt:
      "Why does `useState<T>(value)` initialise `debouncedValue` to the input `value` — and what does this mean for what the consumer sees on the very first render?",
    mc_options: [
      "The initial state is `undefined` — useState ignores its argument until the effect fires",
      "The initial state equals the `value` argument — on first render the consumer sees the live value, not a stale empty string",
      "The initial state is always `null` for generic hooks — you must add a null guard in the consumer",
    ],
    mc_correct_option:
      "The initial state equals the `value` argument — on first render the consumer sees the live value, not a stale empty string",
    mc_anchor:
      "React uses the `useState` argument only as the initial value — it's set once on mount and ignored on subsequent renders. Initialising from `value` means the debounced copy starts in sync with the live value, then falls behind as the user types and catches up after the delay.",
    why_this_matters:
      "If the hook initialised to `''` instead of `value`, a pre-populated search field would have a stale debounced value until the user types. For an operator loading a shipment filter with a saved query, the debounced value would be empty — no results — until they type a character. Initialising from `value` keeps the system in sync at mount.",
    answer_keywords: ["useDebounce", "<T>", "value", "delay", "useState<T>", "debouncedValue", "return debouncedValue"],
    seed_code: "",
    starter_code: `// define useDebounce<T>(value: T, delay: number) here
// state: debouncedValue (type T, initial: value)
// return debouncedValue`,
    feedback_correct:
      "Correct — generic type parameter, value and delay accepted, `useState<T>(value)` initialising from the live value, and `debouncedValue` returned. The hook shell is ready for the timer logic.",
    feedback_partial:
      "Almost — check that the type parameter is on the function (`function useDebounce<T>`), that `useState` is typed `useState<T>` (not `useState(value)` which infers too narrowly), and that only `debouncedValue` is returned.",
    feedback_wrong:
      "Pattern: `function useDebounce<T>(value: T, delay: number) { const [debouncedValue, setDebouncedValue] = useState<T>(value); return debouncedValue; }`",
    expected: `function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  return debouncedValue;
}`,
    analog_example: `function useThrottle<R>(input: R, interval: number): R {
  const [throttledInput, setThrottledInput] = useState<R>(input);
  return throttledInput;
}`,
    deepDiveLabel:
      "useState initialises from value once — so why doesn't debouncedValue update when value changes after mount?",
    deepDive: {
      hook: "You build the hook, test it with a static string — works. You test with a changing input — the debounced value never updates. The `useState(value)` call fires once (on mount) and then ignores every subsequent change to `value`. Without the `useEffect` from Step 2, your hook is a one-shot snapshot, not a live debounce.",
      pain: "⚠️ **Lesson:** `useState(value)` uses `value` as the seed — but React ignores the argument on every render after the first. How do you make state track a changing external value?",
      mentalModel:
        "**Mental model: useState is a one-time initialiser, not a synchroniser.**\nThink of `useState(value)` as planting a seed. The seed value determines what sprouts on mount. After that, the plant grows on its own — future changes to the seed have no effect on the plant.\nTo synchronise state with an external changing value, you need a `useEffect` that explicitly calls the setter when the value changes. That's the purpose of Step 2's timer: wait `delay` milliseconds after `value` changes, then call `setDebouncedValue(value)`.",
      discover: `**Pattern — useState vs useEffect for synchronisation:**
\`\`\`tsx
// ✅ with useEffect — tracks changes after mount
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

// ❌ without useEffect — frozen at initial value
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  // debouncedValue never updates — useState only ran once
  return debouncedValue;
}
\`\`\``,
      quickRules:
        "**Quick rules:**\n- ✅ `useState(value)` seeds the initial state from a prop or argument\n- ✅ to track a changing external value, use `useEffect` with a setter call inside\n- ✅ initialising from the incoming value gives a correct first render before the timer fires\n- ❌ don't assume `useState(value)` keeps state in sync as `value` changes — it doesn't\n- ❌ don't use `useMemo` for debouncing — memos are synchronous, setTimeout is asynchronous",
      watchOut:
        "👀 **Watch out:** Returning `value` directly instead of `debouncedValue` makes the hook useless — it's always the current live value. The whole point of the hook is to return a delayed copy. If you accidentally return `value` instead of `debouncedValue`, the hook compiles, the consumer uses it, and debouncing silently never happens.",
      dryRun:
        "🔁 **Think:** The hook initialises with `value = 'NX'`. The user types fast: 'NX-', 'NX-1', 'NX-10', 'NX-104', 'NX-1042' — five updates in 200ms. At what point does `debouncedValue` update, and what value does it settle on? (Assume `delay = 300` and no timer fires between keystrokes.)",
      build:
        "**Learning focus:** `useState<T>(value)` seeds the initial debounced state from the incoming value — giving a correct first render — but state only updates through explicit setter calls, which is why the timer in Step 2 is required.",
    },
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 5",
    paal: "Add a `useEffect` inside the hook with `[value, delay]` as the dependency array. Inside the effect, use `setTimeout` to call `setDebouncedValue(value)` after `delay` milliseconds. Store the timer ID in a `const timer` variable.",
    hint: "You don't need an async inner function here — `setTimeout` is synchronous to schedule, asynchronous to fire. The effect body just calls `setTimeout` and stores the ID.",
    example_code: `useEffect(() => {
  const timer = setTimeout(() => {
    setThrottledInput(input);
  }, interval);
  // cleanup will go here in the next step
}, [input, interval]);`,
    think_prompt:
      "Why must `delay` be in the dependency array alongside `value` — what happens if you include only `[value]`?",
    mc_options: [
      "Nothing — `delay` is a number and React ignores numeric dependencies",
      "If `delay` changes but `value` doesn't, the effect won't re-run — the old timeout fires with the old delay",
      "TypeScript will error if `delay` is missing from the dependency array",
    ],
    mc_correct_option:
      "If `delay` changes but `value` doesn't, the effect won't re-run — the old timeout fires with the old delay",
    mc_anchor:
      "The dependency array controls when the effect re-runs. If `delay` is omitted, the effect closes over the initial `delay` value. A later change to `delay` (say, a user toggling between fast and slow debounce) would have no effect — the timer would still fire with the original delay. `delay` is read inside the effect, so it belongs in the array.",
    why_this_matters:
      "Shipping dashboards sometimes let operators configure search sensitivity — quick mode (100ms delay) vs careful mode (500ms). If `delay` isn't in the dependency array, toggling modes has no effect. The linter (`exhaustive-deps`) will flag `delay` as a missing dependency — this is a real bug, not a style suggestion.",
    answer_keywords: ["useEffect", "setTimeout", "setDebouncedValue", "value", "delay", "[value, delay]", "timer"],
    seed_code: `function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  return debouncedValue;
}`,
    starter_code: `function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  // add useEffect with [value, delay] dependency
  // const timer = setTimeout(() => setDebouncedValue(value), delay)

  return debouncedValue;
}`,
    feedback_correct:
      "Correct — `setTimeout` scheduled, timer ID stored in `const timer`, dependency array contains both `[value, delay]`. The timer will fire `delay` milliseconds after the last render.",
    feedback_partial:
      "Almost — check that the dependency array is `[value, delay]` (not just `[value]`), and that the timer ID is stored in a variable (you'll need it for `clearTimeout` in the next step).",
    feedback_wrong:
      "Pattern: `useEffect(() => { const timer = setTimeout(() => { setDebouncedValue(value); }, delay); }, [value, delay]);` — timer stored, both deps in array.",
    expected: `function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
  }, [value, delay]);

  return debouncedValue;
}`,
    analog_example: `useEffect(() => {
  const timer = setTimeout(() => {
    setThrottledInput(input);
  }, interval);
}, [input, interval]);`,
    deepDiveLabel:
      "setTimeout fires once — so what stops multiple timers piling up as the user types?",
    deepDive: {
      hook: "You implement Step 2 without the cleanup. The user types 'NX-1042' — 7 characters, 7 effects run, 7 timers scheduled. 300ms after the last keystroke, all 7 timers fire. `setDebouncedValue` is called 7 times in quick succession with 7 different values. The component re-renders 7 times, the API is called 7 times with 7 different query strings. The last one wins — but it may not be the most recent.",
      pain: "⚠️ **Lesson:** Without cleanup, every render schedules a new timer and never cancels the old ones. Why does the effect re-run on every value change — and what's the one-liner that fixes the timer pile-up?",
      mentalModel:
        "**Mental model: Every effect re-run starts a new timer — the cleanup is what clears the old one.**\nWhen `value` changes, React re-runs the effect. Without a cleanup, the previous timer is still pending. Now there are two timers. Type 10 characters fast — 10 timers, all firing 300ms after they were set.\nThe cleanup function (Step 3) runs before every effect re-run. By calling `clearTimeout(timer)` in cleanup, you cancel the previous timer before scheduling a new one. At any given moment, at most one timer is pending — the most recent one.",
      discover: `**Pattern — timer leak vs controlled timer:**
\`\`\`tsx
// ❌ timer leak — every keystroke adds a timer, none are cancelled
useEffect(() => {
  const timer = setTimeout(() => setDebouncedValue(value), delay);
  // no return — cleanup never runs
}, [value, delay]);

// ✅ controlled — cleanup cancels previous timer before new one starts
useEffect(() => {
  const timer = setTimeout(() => setDebouncedValue(value), delay);
  return () => clearTimeout(timer);
}, [value, delay]);
\`\`\`
With 7 keystrokes in 200ms and a 300ms delay:
- ❌ 7 timers pending → 7 fires → 7 API calls → stale renders
- ✅ 6 timers cancelled → 1 timer fires → 1 API call → correct behaviour`,
      quickRules:
        "**Quick rules:**\n- ✅ always return `() => clearTimeout(timer)` from a debounce effect\n- ✅ the cleanup runs before every re-run, ensuring only one timer is ever pending\n- ✅ store the timer ID in a `const` at the effect scope — it's captured by the cleanup closure\n- ❌ don't use `useRef` to store the timer ID unless you need to cancel it from outside the effect\n- ❌ don't use `useCallback` on the setTimeout callback — debouncing is a time concern, not a reference concern",
      watchOut:
        "👀 **Watch out:** `setTimeout` returns a `number` in browsers but `NodeJS.Timeout` in Node environments. If your TypeScript environment is ambiguous, the `clearTimeout` call may complain about the type. Use `window.setTimeout` explicitly in browser code, or declare `const timer: ReturnType<typeof setTimeout> = setTimeout(...)` to get a portable type.",
      dryRun:
        "🔁 **Think:** The user types 'N', 'X', '-', '1' in 50ms each. The delay is 300ms. Walk through each render: how many timers are scheduled, how many are cancelled by cleanup, and when does `debouncedValue` actually update? What would happen if the delay were 10ms instead — would you see any debouncing at all?",
      build:
        "**Learning focus:** `setTimeout` inside `useEffect` schedules the debounced update — but without a cleanup that calls `clearTimeout`, every render adds a new timer without cancelling previous ones, causing multiple rapid-fire state updates that defeat the purpose of debouncing.",
    },
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 5",
    paal: "Return a cleanup function from the `useEffect` that calls `clearTimeout(timer)`. This cancels the pending timer whenever `value` or `delay` changes before the timer fires.",
    hint: "The cleanup function is the return value of the `useEffect` callback — not a separate call. It closes over `timer` from the same effect scope.",
    example_code: `useEffect(() => {
  const timer = setTimeout(() => {
    setThrottledInput(input);
  }, interval);
  return () => clearTimeout(timer);
}, [input, interval]);`,
    think_prompt:
      "The cleanup closes over `timer` from the current effect run. When React re-runs the effect due to a value change, what is the sequence of operations?",
    mc_options: [
      "New effect runs first, then old cleanup fires",
      "Old cleanup fires first (cancelling old timer), then new effect runs (scheduling new timer)",
      "Old cleanup and new effect run simultaneously on different threads",
    ],
    mc_correct_option:
      "Old cleanup fires first (cancelling old timer), then new effect runs (scheduling new timer)",
    mc_anchor:
      "React's guarantee: cleanup always runs before the next effect fires. So when `value` changes: (1) old cleanup runs → `clearTimeout(oldTimer)` cancels the pending timer, (2) new effect runs → `setTimeout(...)` schedules a fresh timer with the new value. At any point, only one timer is active.",
    why_this_matters:
      "The cleanup sequence is what makes debouncing work at all. Without it, 'cleaning up before the next run' is just a React implementation detail. With it, it's the mechanism that collapses 50 keystrokes into one API call. This pattern — schedule in effect, cancel in cleanup — applies to intervals, WebSocket listeners, and animation frames too.",
    answer_keywords: ["clearTimeout", "timer", "return", "() =>"],
    seed_code: `function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
  }, [value, delay]);

  return debouncedValue;
}`,
    starter_code: `function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    // return cleanup that calls clearTimeout(timer)
  }, [value, delay]);

  return debouncedValue;
}`,
    feedback_correct:
      "Correct — `return () => clearTimeout(timer)` inside the effect. The hook is now complete: one pending timer at a time, cancelled before each new one starts.",
    feedback_partial:
      "Almost — make sure the cleanup is a return statement inside the useEffect callback (`return () => clearTimeout(timer)`), not a separate call after the effect.",
    feedback_wrong:
      "Pattern: add `return () => clearTimeout(timer);` as the last line of the useEffect callback, before the closing `}` — the cleanup function closes over `timer` from the same effect run.",
    expected: `function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}`,
    analog_example: `useEffect(() => {
  const timer = setTimeout(() => {
    setThrottledInput(input);
  }, interval);
  return () => clearTimeout(timer);
}, [input, interval]);`,
    deepDiveLabel:
      "clearTimeout cancels the timer — but what happens if the timer fires at the exact same tick as the cleanup?",
    deepDive: {
      hook: "In production, under heavy CPU load, the timer callback and the cleanup run in the same task queue flush. You see `debouncedValue` flicker — it updates and immediately rolls back. This is extremely rare, but understanding why it's theoretically possible shapes how you think about timing guarantees.",
      pain: "⚠️ **Lesson:** `clearTimeout` is not atomic with the timer callback. Is there a race between the cleanup and the timer in JavaScript's single-threaded event loop — and what does that mean for correctness?",
      mentalModel:
        "**Mental model: JavaScript is single-threaded — callbacks queue, they don't race.**\nJavaScript's event loop processes one task at a time. `clearTimeout` marks a timer as cancelled in the browser's internal timer registry. If the timer's callback has already been placed in the task queue when `clearTimeout` fires, the browser dequeues it — the callback never runs.\nIf the callback fires in the same synchronous execution as the cleanup, the cleanup runs first (React's synchronous update), then the task queue is checked. There is no true race in a single-threaded environment.\nThe flicker in production is more likely a React StrictMode double-invoke or a state update from an unguarded effect (Lesson 34's `ignore` flag) than a genuine timer race.",
      discover: `**Pattern — cleanup sequence (conceptual):**
\`\`\`
User types 'X' → render → useEffect schedules timer (ID: 42)
User types 'X-' → render → cleanup fires: clearTimeout(42) [timer 42 dequeued]
                         → useEffect schedules timer (ID: 43)
300ms pass with no new input → timer 43 fires → setDebouncedValue('X-')
\`\`\`
clearTimeout is synchronous — it removes the pending callback from the timer registry before any queued microtasks run. In practice, there is no window for the cancelled callback to fire.`,
      quickRules:
        "**Quick rules:**\n- ✅ `clearTimeout` reliably cancels a pending timer — the callback never fires after cancel\n- ✅ React's cleanup runs synchronously before the next effect — the sequence is deterministic\n- ✅ JavaScript's single-threaded event loop prevents timer/cleanup races\n- ❌ don't reach for `useRef` or complex state to 'safely' cancel — `clearTimeout` is already safe\n- ❌ don't add an `ignore` flag inside `useDebounce` — the timer itself IS the guard (if cancelled, callback never fires)",
      watchOut:
        "👀 **Watch out:** `setInterval` in a `useEffect` requires the same cleanup pattern but has an important difference: if you forget the cleanup, the interval keeps firing after the component unmounts, indefinitely. `setTimeout` fires once and self-clears. `setInterval` is eternal until explicitly cleared — a missed `clearInterval` in cleanup is a memory leak and a source of state-after-unmount errors.",
      dryRun:
        "🔁 **Think:** The component unmounts while a debounce timer is pending (the user navigates away mid-typing). React runs the cleanup function. `clearTimeout(timer)` fires. The timer callback is in the task queue. Walk through what happens next — does `setDebouncedValue` ever get called? Does the component see a state update?",
      build:
        "**Learning focus:** Return `() => clearTimeout(timer)` from the effect — this cleanup runs before every effect re-run, ensuring the previous timer is always cancelled before a new one is scheduled, which is the mechanism that collapses rapid value changes into a single debounced update.",
    },
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 5",
    paal: "Write a `ShipmentSearch` component with no props. It should have a `query` state (string, initial `''`). Render a text `<input>` whose `value` is `query` and whose `onChange` sets `query` to `e.target.value`. Call `useDebounce<string>(query, 300)` and store the result as `debouncedQuery`. Display `debouncedQuery` in a `<p>` below the input.",
    hint: "The input is a controlled input — `value` and `onChange` together. `useDebounce` gets the live `query` value and returns the delayed copy.",
    example_code: `const RouteSearch = () => {
  const [routeId, setRouteId] = useState<string>('');
  const debouncedRouteId = useDebounce<string>(routeId, 400);
  return (
    <>
      <input value={routeId} onChange={e => setRouteId(e.target.value)} />
      <p>{debouncedRouteId}</p>
    </>
  );
};`,
    think_prompt:
      "The user types 'NX-1042'. `query` updates on every keystroke. `debouncedQuery` only updates 300ms after they stop. At the moment of the third keystroke, what value does each variable hold?",
    mc_options: [
      "Both `query` and `debouncedQuery` hold 'NX-' — they stay in sync",
      "`query` holds 'NX-' and `debouncedQuery` still holds '' — it hasn't fired yet",
      "`query` holds 'NX-1' and `debouncedQuery` holds 'NX-' — it's one keystroke behind",
    ],
    mc_correct_option:
      "`query` holds 'NX-' and `debouncedQuery` still holds '' — it hasn't fired yet",
    mc_anchor:
      "The timer resets on every keystroke. If keystrokes are faster than the delay (300ms), the timer never fires and `debouncedQuery` stays at `''` — its initial value. It only updates after 300ms of silence. This is exactly the behaviour that prevents API calls during rapid typing.",
    why_this_matters:
      "Showing the live `query` value in the input and the debounced `debouncedQuery` value in the result area makes the debounce lag visible — an important UX signal that the search hasn't fired yet. In production, you'd use `debouncedQuery` to fetch and show a loading state while the live `query` shows what the user typed.",
    answer_keywords: ["ShipmentSearch", "useState", "query", "useDebounce", "debouncedQuery", "input", "onChange"],
    seed_code: `function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}`,
    starter_code: `function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// write ShipmentSearch here
// state: query (string, '')
// call useDebounce<string>(query, 300) → debouncedQuery
// render: controlled input + <p>{debouncedQuery}</p>`,
    feedback_correct:
      "Correct — controlled input, `useDebounce<string>` called with the live query and 300ms delay, debounced value displayed below. The live value and debounced value are now separate.",
    feedback_partial:
      "Almost — check that the input has both `value={query}` and `onChange={e => setQuery(e.target.value)}`, that `useDebounce` is called with `(query, 300)`, and that `debouncedQuery` is displayed in a `<p>`.",
    feedback_wrong:
      "Pattern: `const [query, setQuery] = useState<string>(''); const debouncedQuery = useDebounce<string>(query, 300); return <><input value={query} onChange={e => setQuery(e.target.value)} /><p>{debouncedQuery}</p></>;`",
    expected: `function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

const ShipmentSearch = () => {
  const [query, setQuery] = useState<string>('');
  const debouncedQuery = useDebounce<string>(query, 300);
  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <p>{debouncedQuery}</p>
    </>
  );
};`,
    analog_example: `const RouteSearch = () => {
  const [routeId, setRouteId] = useState<string>('');
  const debouncedRouteId = useDebounce<string>(routeId, 400);
  return (
    <>
      <input value={routeId} onChange={e => setRouteId(e.target.value)} />
      <p>{debouncedRouteId}</p>
    </>
  );
};`,
    deepDiveLabel:
      "the debounced value lags behind — should the search input show the live value or the debounced value?",
    deepDive: {
      hook: "You accidentally bind the input's `value` to `debouncedQuery` instead of `query`. Now the input itself lags — the user types 'N', waits 300ms, the 'N' appears. The input is unusable. The fix is obvious once you see it, but the root cause is important: the live value and the debounced value serve different masters.",
      pain: "⚠️ **Lesson:** Two values, two jobs. Which goes to the input, which goes to the API call — and why do they have to be different?",
      mentalModel:
        "**Mental model: The input is a mirror, the API call is a decision.**\nThe input's `value` prop must reflect what the user typed — immediately, with zero delay. Any lag makes the input feel broken.\nThe API call is a consequential action: it costs a network round trip, it updates visible results, it might show a loading spinner. It should only fire when the user has expressed intent — which debouncing approximates as 'stopped typing'.\nTwo values, two jobs:\n- `query` → input value (immediate)\n- `debouncedQuery` → fetch trigger (delayed)\nKeep them separate. Never bind the input to the debounced value.",
      discover: `**Pattern — live vs debounced wiring:**
\`\`\`tsx
const ShipmentSearch = () => {
  const [query, setQuery] = useState<string>('');
  const debouncedQuery = useDebounce<string>(query, 300);

  // ✅ input binds to live query — instant feedback
  <input value={query} onChange={e => setQuery(e.target.value)} />

  // ✅ fetch triggers on debounced value — delayed, intentional
  useEffect(() => {
    if (debouncedQuery) fetchShipments(debouncedQuery);
  }, [debouncedQuery]);

  // ❌ don't do this — input lags 300ms, feels broken
  <input value={debouncedQuery} onChange={e => setQuery(e.target.value)} />
};
\`\`\``,
      quickRules:
        "**Quick rules:**\n- ✅ `value={query}` on the input — always the live, immediate value\n- ✅ `debouncedQuery` triggers fetches, filters, or heavy computations\n- ✅ showing `debouncedQuery` in results or a status line is fine — it's just display\n- ❌ never bind the input's `value` to the debounced variable\n- ❌ don't debounce `onChange` itself — debounce the state value, not the event handler",
      watchOut:
        "👀 **Watch out:** Debouncing `onChange` directly (wrapping the handler in debounce instead of debouncing the value) is a common mistake. It causes the state to update late, making the input lag AND causing controlled input behaviour to break — React expects the value to update on every change event for a controlled input.",
      dryRun:
        "🔁 **Think:** The user types 'NX-1042' quickly, then waits 300ms. `query` becomes 'NX-1042'. Then `debouncedQuery` becomes 'NX-1042'. A `useEffect([debouncedQuery])` fires and calls `fetchShipments('NX-1042')`. Now the user clears the input entirely. What is the sequence of events — how many times does the fetch fire, and with what values?",
      build:
        "**Learning focus:** Keep two separate values: `query` for the controlled input (immediate), and `debouncedQuery` for API calls and heavy operations (delayed) — never bind the input's `value` to the debounced variable or the input will visibly lag.",
    },
  },
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 5",
    paal: "Add a `useEffect` to `ShipmentSearch` that fires whenever `debouncedQuery` changes. Inside, if `debouncedQuery` is non-empty, log `'Fetching shipments for: ' + debouncedQuery` to the console. The dependency array must be `[debouncedQuery]`.",
    hint: "This effect simulates the API call. The real fetch would replace the `console.log`. The key insight: the effect's dependency is `debouncedQuery`, not `query` — so the effect only fires when the debounced value settles.",
    example_code: `useEffect(() => {
  if (debouncedRouteId) {
    console.log('Fetching route: ' + debouncedRouteId);
  }
}, [debouncedRouteId]);`,
    think_prompt:
      "Why does this fetch effect depend on `debouncedQuery` and not `query` — and what would happen to the number of API calls if you swapped the dependency?",
    mc_options: [
      "Both would work the same — the debounce hook already limits how often the value updates",
      "Using `[query]` would fire the effect on every keystroke — defeating the entire debounce",
      "Using `[query]` would cause a TypeScript error — the types are incompatible",
    ],
    mc_correct_option:
      "Using `[query]` would fire the effect on every keystroke — defeating the entire debounce",
    mc_anchor:
      "The debounce hook limits how often `debouncedQuery` changes — not how often `query` changes. If the fetch effect depends on `query`, it fires on every render regardless of the debounce. The debounce is only effective when the fetch is wired to `debouncedQuery`.",
    why_this_matters:
      "A shipment search on a busy tracking dashboard might see 200 keystrokes per session. Without debouncing the fetch trigger, that's 200 API calls. With debouncing correctly wired to the dependency array, it's closer to 20 — one per natural pause in typing. The difference shows up in infrastructure costs, response latency, and perceived performance.",
    answer_keywords: ["useEffect", "debouncedQuery", "[debouncedQuery]", "console.log", "Fetching"],
    seed_code: `function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

const ShipmentSearch = () => {
  const [query, setQuery] = useState<string>('');
  const debouncedQuery = useDebounce<string>(query, 300);
  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <p>{debouncedQuery}</p>
    </>
  );
};`,
    starter_code: `function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

const ShipmentSearch = () => {
  const [query, setQuery] = useState<string>('');
  const debouncedQuery = useDebounce<string>(query, 300);

  // add useEffect here
  // if debouncedQuery is non-empty, console.log 'Fetching shipments for: ' + debouncedQuery
  // dependency: [debouncedQuery]

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <p>{debouncedQuery}</p>
    </>
  );
};`,
    feedback_correct:
      "Correct — `useEffect` with `[debouncedQuery]` as the dependency, non-empty guard before the log. The fetch effect is now correctly wired to the debounced value, not the live input.",
    feedback_partial:
      "Almost — check that the dependency array is `[debouncedQuery]` (not `[query]`), and that there's a non-empty check (`if (debouncedQuery)`) before the log.",
    feedback_wrong:
      "Pattern: `useEffect(() => { if (debouncedQuery) { console.log('Fetching shipments for: ' + debouncedQuery); } }, [debouncedQuery]);` — dependency is the debounced value, not the live query.",
    expected: `function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

const ShipmentSearch = () => {
  const [query, setQuery] = useState<string>('');
  const debouncedQuery = useDebounce<string>(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      console.log('Fetching shipments for: ' + debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <p>{debouncedQuery}</p>
    </>
  );
};`,
    analog_example: `useEffect(() => {
  if (debouncedRouteId) {
    console.log('Fetching route: ' + debouncedRouteId);
  }
}, [debouncedRouteId]);`,
    deepDiveLabel:
      "debounce collapses keystrokes — but what if the user pastes a long ID all at once?",
    deepDive: {
      hook: "Your debounce delay is 300ms. A user pastes 'NX-1042-URGENT-REROUTE-2024' into the search field. It's a single paste event — one onChange fires, `query` updates once, one timer starts. 300ms later, `debouncedQuery` updates. One fetch fires. Perfect. Now the user types the same string character by character — 28 onChange events, 28 timers, 27 cancelled. One fetch fires. Also perfect. Debounce handles both cases correctly.",
      pain: "⚠️ **Lesson:** Debounce treats rapid character-by-character typing and single-paste as the same pattern — collapse to one update after a quiet period. But what if the user expects instant results on paste (they're done typing)? How would you modify the hook to support that?",
      mentalModel:
        "**Mental model: Debounce measures silence, not intent.**\nDebounce doesn't know if the user is typing or pasting. It only knows: 'Has the value been stable for `delay` milliseconds?' A paste is one onChange event — silence follows immediately — so the debounced value updates quickly. Typing is many onChange events in quick succession — the timer resets on each — so the debounced value waits.\nIf you want paste to be instant (zero delay), you'd need to detect whether the input event was a paste (`e.nativeEvent.inputType === 'insertFromPaste'`) and apply a different delay. Most applications don't bother — the 300ms wait after a paste is imperceptible.",
      discover: `**Pattern — varying delay by intent:**
\`\`\`tsx
// standard: same delay for all input
const debouncedQuery = useDebounce<string>(query, 300);

// advanced: zero delay on paste, 300ms on keystroke
const [delay, setDelay] = useState(300);
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const isPaste = e.nativeEvent.type === 'paste';
  setDelay(isPaste ? 0 : 300);
  setQuery(e.target.value);
};
const debouncedQuery = useDebounce<string>(query, delay);
// delay is now in the hook's dependency array — changing it re-runs the effect
\`\`\``,
      quickRules:
        "**Quick rules:**\n- ✅ 200–500ms is the standard debounce range for search inputs — experiment for your use case\n- ✅ shorter delays feel more responsive; longer delays save more API calls\n- ✅ expose `delay` as a prop/argument to make the hook configurable\n- ❌ don't use 0ms delay — that's no debounce at all (use no hook)\n- ❌ don't hardcode the delay inside the hook — keep it a parameter for reusability",
      watchOut:
        "👀 **Watch out:** Combining `useDebounce` with `useFetch` creates a subtle dependency ordering issue. `useFetch` re-fetches when `url` changes. If the URL is built from `debouncedQuery`, then `debouncedQuery` → URL change → fetch re-run is one render cycle. But if you put `query` in the URL (not `debouncedQuery`), the fetch re-runs on every keystroke — the debounce has no effect. Always trace which value builds the URL.",
      dryRun:
        "🔁 **Think:** You replace `console.log` with a real `useFetch<ShipmentRecord[]>` call, where the URL is `'/api/shipments?q=' + debouncedQuery`. The user types 'NX' (300ms wait → fetch fires) then adds '-1042' (300ms wait → new fetch fires). How many times does `useFetch`'s `useEffect` run? And what does the first fetch's cleanup do when the second fetch starts?",
      build:
        "**Learning focus:** Wire the fetch effect to `debouncedQuery` (not `query`) in the dependency array — the debounce hook limits how often `debouncedQuery` changes, so the fetch only fires after the user pauses, collapsing rapid keystrokes into a single intentional API call.",
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
  lessonNum: 35,
  title: "Custom Hook — useDebounce",
  shortName: "CUSTOM HOOK — useDebounce",
});
