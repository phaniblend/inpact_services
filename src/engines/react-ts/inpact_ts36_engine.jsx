
import createINPACTEngine from "../inpact_engine_shared";

function normalizeCode(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

function evalLesson36Step1(answer) {
  const raw = String(answer || "");
  const hasHookName = /function\s+useLocalStorage|const\s+useLocalStorage\s*=/.test(raw);
  const hasGeneric = /useLocalStorage\s*<\s*T\s*>/.test(raw);
  const hasKeyParam = /key\s*:\s*string/.test(raw);
  const hasInitialParam = /initialValue\s*:\s*T/.test(raw);
  return hasHookName && hasGeneric && hasKeyParam && hasInitialParam ? "correct" : "wrong";
}

function evalLesson36Step2(answer) {
  const raw = String(answer || "");
  const hasUseState = /useState/.test(raw);
  const hasGetItem = /localStorage\.getItem\s*\(\s*key\s*\)/.test(raw);
  const hasParse = /JSON\.parse/.test(raw);
  const hasTryCatch = /try\s*\{[\s\S]*catch/.test(raw);
  return hasUseState && hasGetItem && hasParse && hasTryCatch ? "correct" : "wrong";
}

function evalLesson36Step3(answer) {
  const raw = String(answer || "");
  const hasSetValue = /const\s+setValue\s*=/.test(raw);
  const hasSetItem = /localStorage\.setItem\s*\(\s*key\s*,/.test(raw);
  const hasStringify = /JSON\.stringify/.test(raw);
  const hasSetState = /setStoredValue/.test(raw);
  return hasSetValue && hasSetItem && hasStringify && hasSetState ? "correct" : "wrong";
}

function evalLesson36Step4(answer) {
  const raw = String(answer || "");
  const hasReturnTuple = /return\s*\[\s*storedValue\s*,\s*setValue\s*\]/.test(raw);
  const hasTypedReturn = /\[T,\s*(?:React\.)?Dispatch|:\s*\[T,/.test(raw) ||
    /as\s+\[T/.test(raw) ||
    /\]\s*as\s+const/.test(raw) ||
    /return\s*\[storedValue,\s*setValue\]/.test(raw);
  return hasReturnTuple ? "correct" : "wrong";
}

function evalLesson36Step5(answer) {
  const raw = String(answer || "");
  const hasUseLocalStorage = /useLocalStorage\s*</.test(raw);
  const hasShipmentKey = /['"]shipment/.test(raw);
  const hasDestructure = /const\s*\[/.test(raw);
  const hasJsx = /return\s*\(?\s*</.test(raw);
  return hasUseLocalStorage && hasShipmentKey && hasDestructure && hasJsx ? "correct" : "wrong";
}

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "LESSON #36 (CUSTOM HOOK)",
      title: "Custom Hook — useLocalStorage",
      body: "Build a generic, type-safe hook that syncs React state to localStorage automatically. The hook reads on mount, writes on update, and handles JSON serialization and parse errors without leaking those concerns into the component.",
      usecase:
        "In a logistics dashboard, operators set filters — depot, carrier, date range — that should survive a page refresh. useLocalStorage lets the component treat persisted state exactly like useState, with zero boilerplate at the call site.",
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
          "Step 5 renders the demo ShipmentFilterBar component using JSX expressions and className. The component structure and curly-brace expression syntax from Lesson 1 are used throughout.",
      },
      {
        lesson: 10,
        label: "useState — Primitives",
        reason:
          "Step 2 initializes state with useState<T> inside the hook body. Understanding how useState returns a [value, setter] tuple — and that the initializer runs once — is required to understand why localStorage.getItem is called inside the useState initializer.",
      },
      {
        lesson: 24,
        label: "useEffect — Mount",
        reason:
          "The mental model for 'run once on mount' established in Lesson 24 explains why the localStorage read belongs in the useState initializer rather than a useEffect. You need that baseline to understand the deliberate design choice here.",
      },
      {
        lesson: 33,
        label: "Custom Hook — Extract Logic",
        reason:
          "Step 1 defines the hook signature following the same custom hook contract from Lesson 33: a function whose name starts with `use`, returns values, and encapsulates React primitives. The pattern and naming rules come directly from that lesson.",
      },
    ],
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Define a generic custom hook with a type parameter T",
      "Initialize useState from localStorage using a lazy initializer function",
      "Wrap JSON.parse in try/catch to handle corrupt or missing storage values",
      "Write a setValue function that updates both React state and localStorage atomically",
      "Return a typed [value, setter] tuple from the hook",
      "Consume the hook in a component with the same ergonomics as useState",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 5",
    paal: "Declare the useLocalStorage hook signature — a generic function that accepts a string key and a typed initialValue, and returns nothing yet.",
    hint: "Custom hooks are just functions whose names start with `use`. The generic parameter T lets callers specify what type they're storing.",
    example_code: `function useSessionCache<T>(namespace: string, fallback: T) {
  // hook body here
}`,
    think_prompt:
      "A hook needs to work for a string filter, a number page index, and a full ShipmentRecord object without being rewritten each time. What TypeScript feature makes one hook work for all three types?",
    mc_options: [
      "function useLocalStorage(key: string, initialValue: any)",
      "function useLocalStorage<T>(key: string, initialValue: T)",
      "function useLocalStorage<T extends string>(key: string, initialValue: T)",
    ],
    mc_correct_option: "function useLocalStorage<T>(key: string, initialValue: T)",
    mc_anchor:
      "The unconstrained generic parameter `<T>` lets the caller decide the type — string, number, object — without any restriction. `any` throws away type safety. `T extends string` would incorrectly block object values.",
    why_this_matters:
      "A generic hook is written once and works across every call site. Without generics, you'd write useLocalStorageString, useLocalStorageNumber, useLocalStorageShipment — one per type. In enterprise apps with dozens of persisted states, that's the difference between one tested utility and a fragile collection of near-duplicates.",
    answer_keywords: ["useLocalStorage", "<T>", "key", "string", "initialValue", "T"],
    evaluate: evalLesson36Step1,
    seed_code: "",
    starter_code: "// Define the useLocalStorage hook signature here\n// It should be generic, accept a key and initialValue, and return nothing yet",
    feedback_correct:
      "Exactly — unconstrained `<T>` makes the hook work for any type the caller needs. The key is always a string; the value type is the caller's choice.",
    feedback_partial:
      "Almost — check that the generic parameter is `<T>` with no constraint, key is typed as string, and initialValue is typed as T.",
    feedback_wrong:
      "Pattern: `function useLocalStorage<T>(key: string, initialValue: T) { }` — the `<T>` makes it generic, no constraint needed.",
    expected: `function useLocalStorage<T>(key: string, initialValue: T) {
  // hook body
}`,
    analog_example: `function useSessionCache<V>(namespace: string, fallback: V) {
  // hook body
}`,
    deepDiveLabel:
      "The hook works with `any` and is simpler — so what does the generic parameter actually buy you?",
    deepDive: {
      hook: "You write `useLocalStorage(key: string, initialValue: any)` — it's shorter, it runs fine, TypeScript doesn't complain. Then three months later a teammate calls `const [depot, setDepot] = useLocalStorage('depot', 'NW-01')` and later writes `setDepot(42)` by mistake. The number goes into localStorage as `42`, survives a page refresh, and the next time the filter runs it passes a number where a string was expected. The API call breaks silently — no TypeScript error, no runtime throw, just wrong results in the dashboard.",
      pain: "⚠️ **Lesson:** When the hook uses `any`, TypeScript can't connect the type of `initialValue` to the type of the returned setter. The setter accepts anything, and the next engineer to use the hook gets no safety net. The generic parameter is the mechanism that threads type information from the call site to the return value.",
      mentalModel:
        "**Mental model:** Think of `<T>` as a **type variable that flows through the hook**.\n- When a caller writes `useLocalStorage<string>('depot', 'NW-01')`, T becomes string.\n- The returned setter becomes `(value: string) => void` — TypeScript won't accept a number.\n- When another caller writes `useLocalStorage<ShipmentRecord>('draft', defaultRecord)`, T becomes ShipmentRecord and the setter only accepts ShipmentRecord values.\n- The hook is one piece of code that adapts its contract to whoever calls it. That's the point of generics — not code reuse, but **type-accurate reuse**.",
      discover:
        "**Pattern — hook generics:**\n```tsx\n// ✅ unconstrained generic — works for string, number, object, array\nfunction useLocalStorage<T>(key: string, initialValue: T) { ... }\n\n// ✅ caller provides explicit type\nconst [depot, setDepot] = useLocalStorage<string>('depot', 'NW-01');\n// setDepot now only accepts string — TypeScript enforces it\n\n// ✅ TypeScript infers T from initialValue\nconst [page, setPage] = useLocalStorage('page', 1);\n// T inferred as number — setPage only accepts number\n\n// ❌ any — kills type safety at the call site\nfunction useLocalStorage(key: string, initialValue: any) { ... }\n// setDepot(42) — no error, wrong type silently stored\n\n// ❌ over-constrained — blocks legitimate object values\nfunction useLocalStorage<T extends string>(key: string, initialValue: T) { ... }\n// useLocalStorage('record', { id: 'NX-42' }) — TypeScript error\n```",
      quickRules:
        "✅ Use `<T>` with no constraint unless you have a specific reason to restrict\n✅ Let TypeScript infer T from initialValue when the type is obvious\n✅ Provide explicit `<Type>` at the call site when the inference would be too broad\n❌ Don't use `any` — it breaks the type contract between initializer and setter\n❌ Don't constrain with `extends` unless the hook's internal logic genuinely requires it",
      watchOut:
        "👀 **Watch out:** Omitting the generic and using `any` or `unknown` feels harmless until the setter is used. The problem is that `any` makes the setter accept values of the wrong type with no error — the type mismatch goes to localStorage, survives a refresh, and breaks the feature silently. The generic parameter is what connects `initialValue`'s type to the setter's parameter type. Without it, that connection doesn't exist.",
      dryRun:
        "🔁 **Think:** A colleague calls `useLocalStorage('filters', { depot: 'NW-01', carrier: 'FastFreight' })` without an explicit type argument. TypeScript infers T as `{ depot: string; carrier: string }`. Now they write `setFilters({ depot: 'SW-02' })` — missing the carrier field. What does TypeScript do? Does it error, warn, or stay silent? (Hint: consider whether the inferred object type is exact or structural.)",
      build:
        "**Learning focus:** Declare a custom hook with an unconstrained generic parameter — understanding that `<T>` threads the caller's type through the hook so the returned value and setter are both correctly typed without using `any`.",
    },
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 5",
    paal: "Inside the hook, initialize useState by reading from localStorage — use a lazy initializer function that calls JSON.parse inside a try/catch and falls back to initialValue if the key is missing or the value is corrupt.",
    hint: "Pass a function to useState (not a value) — React calls it once on mount. Inside it, call localStorage.getItem(key) and JSON.parse the result, returning initialValue on any error.",
    example_code: `const [token, setToken] = useState<string>(() => {
  try {
    const raw = localStorage.getItem(namespace);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
});`,
    think_prompt:
      "localStorage.getItem returns a string or null, but your state might be an object. You also can't know whether the stored string is valid JSON. What two things must the initializer handle before it can safely return a value?",
    mc_options: [
      "useState<T>(JSON.parse(localStorage.getItem(key)!))",
      "useState<T>(() => { try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : initialValue; } catch { return initialValue; } })",
      "useEffect(() => { setStoredValue(JSON.parse(localStorage.getItem(key) ?? 'null')); }, [])",
    ],
    mc_correct_option:
      "useState<T>(() => { try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : initialValue; } catch { return initialValue; } })",
    mc_anchor:
      "The lazy initializer runs once on mount. The null check handles a missing key. The try/catch handles a corrupt stored value. useEffect would cause a visible flash — the component would render with initialValue, then immediately re-render with the stored value.",
    why_this_matters:
      "In logistics dashboards, operators set complex filter states that are persisted to localStorage. A bad deploy, a manual edit, or a schema change can corrupt that stored JSON. Without the try/catch, one corrupt entry crashes the hook on mount — every user who saved filters sees a blank screen until they clear storage manually.",
    answer_keywords: ["useState", "localStorage.getItem", "JSON.parse", "try", "catch", "initialValue"],
    evaluate: evalLesson36Step2,
    seed_code: `function useLocalStorage<T>(key: string, initialValue: T) {
  // hook body
}`,
    starter_code: `function useLocalStorage<T>(key: string, initialValue: T) {
  // Initialize state from localStorage using a lazy initializer
  // Handle: key not found (null) and corrupt JSON (try/catch)
  const [storedValue, setStoredValue] = useState<T>(() => {
    // your initializer here
  });
}`,
    feedback_correct:
      "Exactly — the lazy function form prevents unnecessary re-renders. The null check handles missing keys. The try/catch means a corrupt stored string never crashes the hook.",
    feedback_partial:
      "Almost — check three things: is the argument a function (lazy form), does it handle the null case from getItem, and does it catch JSON.parse errors?",
    feedback_wrong:
      "Pattern: `useState<T>(() => { try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : initialValue; } catch { return initialValue; } })`",
    expected: `function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });
}`,
    analog_example: `const [authToken, setAuthToken] = useState<string>(() => {
  try {
    const raw = localStorage.getItem(namespace);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
});`,
    deepDiveLabel:
      "useState(JSON.parse(...)) is shorter and looks fine — why does the function form matter?",
    deepDive: {
      hook: "You write `useState<T>(JSON.parse(localStorage.getItem(key)!))` — it's shorter, it seems equivalent. In development everything works. In production, a user on a slow device loads the dashboard on mobile. Your hook is used in three nested components. localStorage.getItem is called three times synchronously before the first render. Now multiply that by every hook instance across the app. The lazy initializer isn't a micro-optimisation — for components that mount hundreds of times in a table, it's the difference between one read and three hundred.",
      pain: "⚠️ **Lesson:** When you pass a value directly to useState instead of a function, React evaluates that expression on every render — not just the first. The lazy initializer form `useState(() => expensiveRead())` tells React to call the function only once on mount. For localStorage reads this matters both for performance and for correctness when the key changes.",
      mentalModel:
        "**Mental model:** Think of it as **React's one-time initialization contract**.\n- `useState(value)` — React receives the value and uses it for the first render. But JavaScript already evaluated the expression to produce that value, on every render call, before React even gets involved.\n- `useState(() => value)` — React receives a function. It calls it **once, only on the first render**. Every subsequent render, React ignores the initializer entirely.\n- For `localStorage.getItem`, the difference is: read storage once vs read storage on every render. For an object held in state, that's often invisible. For a synchronous I/O call, it adds up.",
      discover:
        "**Pattern — lazy initializer:**\n```tsx\n// ✅ lazy form — runs once on mount\nconst [filters, setFilters] = useState<Filters>(() => {\n  try {\n    const raw = localStorage.getItem('filters');\n    return raw ? JSON.parse(raw) : defaultFilters;\n  } catch {\n    return defaultFilters;\n  }\n});\n\n// ❌ eager form — localStorage.getItem runs on every render\nconst [filters, setFilters] = useState<Filters>(\n  JSON.parse(localStorage.getItem('filters') ?? 'null') ?? defaultFilters\n);\n\n// ❌ useEffect form — causes a visible flash (render with default, then re-render with stored)\nuseEffect(() => {\n  const raw = localStorage.getItem('filters');\n  if (raw) setFilters(JSON.parse(raw));\n}, []);\n```",
      quickRules:
        "✅ Always use the function form `() => ...` for localStorage reads in useState\n✅ Check for null before JSON.parse — getItem returns null for missing keys\n✅ Wrap JSON.parse in try/catch — stored values can be corrupt\n❌ Don't call JSON.parse(getItem(key)!) — the ! asserts non-null but getItem can return null\n❌ Don't use useEffect to initialize from storage — it causes a render flash",
      watchOut:
        "👀 **Watch out:** `JSON.parse(localStorage.getItem(key)!)` uses a non-null assertion to silence TypeScript, but localStorage.getItem genuinely returns null when the key doesn't exist. The non-null assertion tells TypeScript to trust you, not the runtime. When the key is absent, JSON.parse(null) returns null — which may not be the right type for T. The null check `item ? JSON.parse(item) : initialValue` handles this correctly.",
      dryRun:
        "🔁 **Think:** A user installs a new version of the logistics app. The stored filters in localStorage are `'{\"depot\":\"NW-01\"}'` — valid JSON from the old version. The new version's Filters type has an additional required field `carrier`. When the hook runs, JSON.parse succeeds and returns `{ depot: 'NW-01' }` — a value that's missing the carrier field. TypeScript typed it as T (Filters), but the actual runtime value doesn't match. What happens when the component tries to render using `filters.carrier`? Does the try/catch help here?",
      build:
        "**Learning focus:** Initialize useState with a lazy function that reads from localStorage — understanding why the function form matters, why JSON.parse needs a null check, and why try/catch is required for production-safe storage access.",
    },
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 5",
    paal: "Write the setValue function — it should update both React state and localStorage at the same time, serializing the new value with JSON.stringify.",
    hint: "The function takes the new value of type T, calls setStoredValue with it, then calls localStorage.setItem with JSON.stringify. Wrap the setItem call in try/catch — storage quota can be exceeded.",
    example_code: `const updateCache = (newValue: V) => {
  try {
    setToken(newValue);
    localStorage.setItem(namespace, JSON.stringify(newValue));
  } catch (error) {
    console.error('Cache write failed:', error);
  }
};`,
    think_prompt:
      "React state and localStorage are two separate stores. When the user sets a new value, both need to be updated. What happens if you update state but forget localStorage — or update localStorage but not state?",
    mc_options: [
      "const setValue = (value: T) => { localStorage.setItem(key, JSON.stringify(value)); }",
      "const setValue = (value: T) => { try { setStoredValue(value); localStorage.setItem(key, JSON.stringify(value)); } catch (error) { console.error(error); } }",
      "useEffect(() => { localStorage.setItem(key, JSON.stringify(storedValue)); }, [storedValue]);",
    ],
    mc_correct_option:
      "const setValue = (value: T) => { try { setStoredValue(value); localStorage.setItem(key, JSON.stringify(value)); } catch (error) { console.error(error); } }",
    mc_anchor:
      "Both updates happen in one function call — state and storage stay in sync atomically. The useEffect approach works but adds async lag: state updates on one tick, storage on the next. The first option forgets to update React state, so the component never re-renders.",
    why_this_matters:
      "In enterprise dashboards, filter state drives API calls. If React state updates but localStorage doesn't, a refresh loses the user's filters. If localStorage updates but React state doesn't, the component doesn't re-render — the UI stays stale. Both must update together, synchronously, in one function.",
    answer_keywords: ["setValue", "setStoredValue", "localStorage.setItem", "JSON.stringify", "try", "catch"],
    evaluate: evalLesson36Step3,
    seed_code: `function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });
}`,
    starter_code: `function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Write setValue here — update both React state and localStorage
  // Wrap localStorage.setItem in try/catch (quota errors are real)
}`,
    feedback_correct:
      "Exactly — setStoredValue triggers a re-render, localStorage.setItem persists the value, and the try/catch handles quota errors. Both stores stay in sync in one synchronous call.",
    feedback_partial:
      "Almost — check that you're calling both setStoredValue AND localStorage.setItem, and that the setItem call is inside a try/catch.",
    feedback_wrong:
      "Pattern: `const setValue = (value: T) => { try { setStoredValue(value); localStorage.setItem(key, JSON.stringify(value)); } catch (error) { console.error(error); } }`",
    expected: `function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('useLocalStorage write error:', error);
    }
  };
}`,
    analog_example: `const updatePreference = (newPref: V) => {
  try {
    setPreference(newPref);
    localStorage.setItem(prefKey, JSON.stringify(newPref));
  } catch (err) {
    console.error('Preference write failed:', err);
  }
};`,
    deepDiveLabel:
      "A useEffect that syncs state to storage looks cleaner — why is the explicit setValue function better?",
    deepDive: {
      hook: "You refactor to `useEffect(() => { localStorage.setItem(key, JSON.stringify(storedValue)); }, [storedValue])`. It looks elegant — one place that handles the sync, no duplication. Then a colleague reports that when the filter panel first renders, the depot filter briefly shows the wrong value before snapping to the correct one. The effect runs after the browser paints. There's a tick between state update and storage write where the two stores are out of sync — and if something reads storage in that tick, it gets stale data.",
      pain: "⚠️ **Lesson:** useEffect runs asynchronously after the render is committed to the DOM. Between the state update and the effect execution, there is a window where React state and localStorage hold different values. For most UI state this is invisible. For state that's read synchronously by other code — initializers, event handlers, server-sync logic — that window causes real bugs.",
      mentalModel:
        "**Mental model:** Think of the two approaches as **optimistic sync vs guaranteed sync**.\n- useEffect — state updates now, storage updates later (after paint). Optimistic: usually fine, occasionally wrong.\n- setValue function — state and storage update in the same call stack, before any render. Guaranteed: the two stores are never out of sync from the caller's perspective.\n- For persisted state that drives API calls or is read by other hooks, guaranteed sync is what you want. The explicit function makes the contract obvious at the call site.",
      discover:
        "**Pattern — sync vs async write:**\n```tsx\n// ✅ explicit setValue — sync, state and storage always agree\nconst setValue = (value: T) => {\n  setStoredValue(value);\n  localStorage.setItem(key, JSON.stringify(value));\n};\n\n// ⚠️ useEffect sync — works for most cases but has an async window\nuseEffect(() => {\n  localStorage.setItem(key, JSON.stringify(storedValue));\n}, [storedValue]);\n// Problem: runs after paint — storage lags state by one tick\n\n// ❌ only setState — UI updates but refresh loses the value\nconst setValue = (value: T) => {\n  setStoredValue(value);\n  // forgot localStorage.setItem\n};\n\n// ❌ only setItem — storage updates but UI doesn't re-render\nconst setValue = (value: T) => {\n  localStorage.setItem(key, JSON.stringify(value));\n  // forgot setStoredValue\n};\n```",
      quickRules:
        "✅ Update both setStoredValue and localStorage.setItem in the same setValue function\n✅ Wrap localStorage.setItem in try/catch — storage can be full or blocked by browser policy\n✅ Call setStoredValue before setItem so state is always at least as fresh as storage\n❌ Don't use useEffect to sync to storage unless you're OK with an async window\n❌ Don't update only one store — they must stay in sync",
      watchOut:
        "👀 **Watch out:** localStorage.setItem can throw a QuotaExceededError when storage is full — this is not rare in apps that persist large objects or run in environments with restricted storage quotas (private browsing on some browsers caps localStorage at a few MB). Without a try/catch, a full storage quota crashes the hook and takes down every component that uses it. The catch is not defensive boilerplate — it's a real production failure mode.",
      dryRun:
        "🔁 **Think:** The setValue function calls `setStoredValue(value)` then `localStorage.setItem(key, JSON.stringify(value))`. setStoredValue schedules a re-render. localStorage.setItem runs synchronously in the same call. Question: at the moment localStorage.setItem executes, has the component re-rendered yet with the new value? (Hint: React batches state updates — when does the re-render actually happen?)",
      build:
        "**Learning focus:** Write a setValue function that updates React state and localStorage atomically — understanding why explicit synchronous writes are more reliable than useEffect for storage sync, and why the try/catch handles a real production failure mode.",
    },
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 5",
    paal: "Return the [storedValue, setValue] tuple from the hook so callers can destructure it exactly like useState.",
    hint: "Return an array literal — TypeScript infers the return type as a tuple. You can add `as const` or an explicit return type annotation to lock the tuple type if needed.",
    example_code: `function useSessionCache<V>(namespace: string, fallback: V) {
  const [token, setToken] = useState<V>(() => { /* ... */ });
  const updateCache = (v: V) => { /* ... */ };
  return [token, updateCache] as const;
}`,
    think_prompt:
      "useState returns [value, setter]. Your hook should feel identical to useState at the call site. What must the return statement look like to enable `const [filters, setFilters] = useLocalStorage(...)`?",
    mc_options: [
      "return { storedValue, setValue };",
      "return [storedValue, setValue] as const;",
      "return (storedValue, setValue);",
    ],
    mc_correct_option: "return [storedValue, setValue] as const;",
    mc_anchor:
      "An array return enables tuple destructuring — the same ergonomics as useState. `as const` narrows the inferred type to a readonly tuple so TypeScript knows position 0 is T and position 1 is the setter. An object return forces callers to use `{ storedValue, setValue }` syntax — different from useState and more verbose.",
    why_this_matters:
      "Custom hooks that mirror the useState API are immediately familiar to every React developer on the team. When useLocalStorage returns a tuple, every call site looks identical to a regular useState call — same destructuring, same mental model, zero learning cost.",
    answer_keywords: ["return", "storedValue", "setValue"],
    evaluate: evalLesson36Step4,
    seed_code: `function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('useLocalStorage write error:', error);
    }
  };
}`,
    starter_code: `function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('useLocalStorage write error:', error);
    }
  };

  // Return the tuple so callers can destructure like useState
}`,
    feedback_correct:
      "Exactly — array return enables useState-style destructuring. `as const` tells TypeScript this is a fixed-position tuple, not a variable-length array.",
    feedback_partial:
      "Almost — make sure you're returning an array (not an object), and that storedValue comes first and setValue comes second.",
    feedback_wrong:
      "Pattern: `return [storedValue, setValue] as const;` — array literal, same order as useState's [value, setter].",
    expected: `function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('useLocalStorage write error:', error);
    }
  };

  return [storedValue, setValue] as const;
}`,
    analog_example: `function useSessionCache<V>(namespace: string, fallback: V) {
  const [token, setToken] = useState<V>(() => { /* ... */ });
  const updateCache = (v: V) => { /* ... */ };
  return [token, updateCache] as const;
}`,
    deepDiveLabel:
      "An object return `{ storedValue, setValue }` is more explicit — so why does the array tuple feel more natural here?",
    deepDive: {
      hook: "You switch the return to `return { storedValue, setValue }`. It compiles. Call sites now look like `const { storedValue: depot, setValue: setDepot } = useLocalStorage(...)`. That works, but you've broken the pattern. Every developer on the team who's used useState reaches for destructuring as `const [x, setX]`. With an object return, they have to remember it's this hook's special interface — one more thing to look up.",
      pain: "⚠️ **Lesson:** The tuple return isn't just about convenience — it's about API consistency. When a custom hook mirrors useState's return shape, the mental model is zero-cost. When it differs, every caller has to maintain a separate mental model for this hook specifically.",
      mentalModel:
        "**Mental model:** Think of it as the **useState contract**.\n- useState returns `[value, setter]` — position 0 is current value, position 1 is the function to update it.\n- Any custom hook that wraps or extends useState should return the same shape when it can.\n- This is a convention, not a requirement — but conventions in shared codebases are load-bearing. They let engineers use hooks they haven't written without reading the implementation first.",
      discover:
        "**Pattern — return shapes:**\n```tsx\n// ✅ tuple — useState-identical ergonomics\nreturn [storedValue, setValue] as const;\n// Call site: const [depot, setDepot] = useLocalStorage('depot', '');\n\n// ✅ explicit tuple type annotation (alternative to as const)\nreturn [storedValue, setValue] as [T, (value: T) => void];\n\n// ⚠️ object — more explicit but breaks useState ergonomics\nreturn { storedValue, setValue };\n// Call site: const { storedValue: depot, setValue: setDepot } = useLocalStorage('depot', '');\n\n// ❌ bare array without as const — TypeScript widens to (T | ((v: T) => void))[]\n// Destructured types are wrong — TypeScript doesn't know position 0 is T\nreturn [storedValue, setValue];\n```",
      quickRules:
        "✅ Return `[value, setter] as const` to match useState's ergonomics\n✅ Use object returns when the hook returns 3+ things and naming adds clarity\n✅ Use tuple returns when there are exactly 2 things: a value and an updater\n❌ Don't return a bare array — TypeScript widens the type and position information is lost\n❌ Don't mix conventions — pick tuple or object and be consistent",
      watchOut:
        "👀 **Watch out:** `return [storedValue, setValue]` without `as const` causes TypeScript to infer the return type as `(T | ((value: T) => void))[]` — a variable-length array of the union type. When callers destructure, both `depot` and `setDepot` are typed as `string | ((value: string) => void)`. TypeScript can no longer help with the setter because it doesn't know which position is which. `as const` is what tells TypeScript this is a fixed-position tuple.",
      dryRun:
        "🔁 **Think:** You return `[storedValue, setValue] as const`. A caller writes `const [depot, setDepot] = useLocalStorage<string>('depot', 'NW-01')`. What type does TypeScript assign to `depot`? What type does it assign to `setDepot`? Now imagine you forgot `as const` — what type does TypeScript assign to `depot` instead? (Hint: TypeScript doesn't know arrays have fixed positions unless you tell it.)",
      build:
        "**Learning focus:** Return a typed tuple from a custom hook — understanding why `as const` is needed to preserve position-specific types, and why the [value, setter] tuple shape mirrors useState's contract.",
    },
  },
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 5",
    paal: "Build the ShipmentFilterBar component — use useLocalStorage to persist a depot filter string with the key 'shipment:depot', and render an input that reads from and writes to that persisted value.",
    hint: "Call useLocalStorage with a string type, the key 'shipment:depot', and an empty string as the initial value. Wire the input's value and onChange to the returned tuple.",
    example_code: `const RouteConfigPanel = () => {
  const [carrier, setCarrier] = useSessionCache<string>('route:carrier', '');
  return (
    <div>
      <input value={carrier} onChange={e => setCarrier(e.target.value)} />
    </div>
  );
};`,
    think_prompt:
      "The hook returns [storedValue, setValue] — the same shape as useState. How do you wire an input's value and onChange handler to a hook that returns a tuple?",
    mc_options: [
      "const filters = useLocalStorage('shipment:depot', ''); return <input value={filters} />;",
      "const [depot, setDepot] = useLocalStorage<string>('shipment:depot', ''); return <input value={depot} onChange={e => setDepot(e.target.value)} />;",
      "const [depot, setDepot] = useLocalStorage('shipment:depot'); return <input value={depot} onChange={setDepot} />;",
    ],
    mc_correct_option:
      "const [depot, setDepot] = useLocalStorage<string>('shipment:depot', ''); return <input value={depot} onChange={e => setDepot(e.target.value)} />;",
    mc_anchor:
      "Tuple destructuring gives you depot (the persisted string) and setDepot (the write function). The onChange handler extracts e.target.value before passing it to setDepot — the hook's setValue expects T, not a SyntheticEvent. initialValue is required by the hook signature.",
    why_this_matters:
      "This is the payoff: the component has no localStorage calls, no JSON.stringify, no try/catch. It just calls a hook and wires an input — identical to how it would use useState. The persistence layer is completely hidden behind the hook interface.",
    answer_keywords: ["useLocalStorage", "shipment:depot", "depot", "setDepot", "onChange", "e.target.value"],
    evaluate: evalLesson36Step5,
    seed_code: `function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('useLocalStorage write error:', error);
    }
  };

  return [storedValue, setValue] as const;
}`,
    starter_code: `function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('useLocalStorage write error:', error);
    }
  };

  return [storedValue, setValue] as const;
}

// Build ShipmentFilterBar below
// - use useLocalStorage<string> with key 'shipment:depot' and '' as initialValue
// - render an input that reads depot and calls setDepot on change
const ShipmentFilterBar = () => {
  // your component here
};`,
    feedback_correct:
      "Exactly — the component treats useLocalStorage exactly like useState. The key 'shipment:depot' namespaces the value in storage so it doesn't collide with other stored state.",
    feedback_partial:
      "Almost — check that you're destructuring a tuple `[depot, setDepot]`, the key is 'shipment:depot', and the onChange handler passes `e.target.value` (not the event itself) to setDepot.",
    feedback_wrong:
      "Pattern: `const [depot, setDepot] = useLocalStorage<string>('shipment:depot', '');` then wire value={depot} and onChange={e => setDepot(e.target.value)} on the input.",
    expected: `function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('useLocalStorage write error:', error);
    }
  };

  return [storedValue, setValue] as const;
}

const ShipmentFilterBar = () => {
  const [depot, setDepot] = useLocalStorage<string>('shipment:depot', '');

  return (
    <div>
      <label htmlFor="depot-filter">Depot</label>
      <input
        id="depot-filter"
        value={depot}
        onChange={e => setDepot(e.target.value)}
        placeholder="Filter by depot"
      />
    </div>
  );
};`,
    analog_example: `const RouteConfigPanel = () => {
  const [carrier, setCarrier] = useSessionCache<string>('route:carrier', '');
  return (
    <div>
      <label htmlFor="carrier-input">Carrier</label>
      <input
        id="carrier-input"
        value={carrier}
        onChange={e => setCarrier(e.target.value)}
      />
    </div>
  );
};`,
    deepDiveLabel:
      "The hook works — but what breaks silently when two components use the same key at the same time?",
    deepDive: {
      hook: "Your logistics app has two panels open: ShipmentFilterBar and a ShipmentSummaryWidget. Both call `useLocalStorage<string>('shipment:depot', '')`. An operator types 'NW-01' in ShipmentFilterBar. localStorage updates. But ShipmentSummaryWidget still shows an empty string — it hasn't re-rendered. Both components are reading the same key, but only one of them knows the value changed.",
      pain: "⚠️ **Lesson:** localStorage is a global store that React doesn't watch. When one component writes to a key via the hook, other components using the same key don't know about the change — they only re-render when their own state updates. This is the core limitation of a simple useLocalStorage implementation.",
      mentalModel:
        "**Mental model:** Think of localStorage as a **shared whiteboard that React can't see**.\n- When Component A writes to the whiteboard, React re-renders A because A called setState.\n- Component B is still looking at its own local copy of the value from the last time it read the whiteboard on mount.\n- The browser does fire a `storage` event when localStorage changes — but only in **other tabs**, not in the same tab.\n- To sync same-tab components, you need to subscribe to a custom event or lift the state to Context.",
      discover:
        "**Pattern — cross-component sync:**\n```tsx\n// Current implementation — each instance reads independently on mount\nfunction useLocalStorage<T>(key: string, initialValue: T) {\n  const [storedValue, setStoredValue] = useState<T>(() => { /* reads once */ });\n  // Problem: two instances with the same key don't stay in sync\n}\n\n// Production fix — dispatch a custom event so all instances re-read\nconst setValue = (value: T) => {\n  setStoredValue(value);\n  localStorage.setItem(key, JSON.stringify(value));\n  window.dispatchEvent(new StorageEvent('storage', { key, newValue: JSON.stringify(value) }));\n};\n\n// And subscribe to updates from other instances\nuseEffect(() => {\n  const handler = (e: StorageEvent) => {\n    if (e.key === key && e.newValue) {\n      setStoredValue(JSON.parse(e.newValue));\n    }\n  };\n  window.addEventListener('storage', handler);\n  return () => window.removeEventListener('storage', handler);\n}, [key]);\n```",
      quickRules:
        "✅ For single-component use cases, the basic implementation is sufficient\n✅ For shared keys across components, dispatch a custom storage event in setValue\n✅ Subscribe to the storage event in useEffect to receive cross-instance updates\n❌ Don't assume two components using the same key will stay in sync automatically\n❌ Don't use Context to wrap useLocalStorage unless you need reactive cross-component sync",
      watchOut:
        "👀 **Watch out:** The browser's native `storage` event fires for changes from **other tabs only** — not the same tab. If you listen to `window.addEventListener('storage', ...)` expecting to catch your own writes, nothing will fire. Same-tab synchronization requires either a custom event dispatch (as shown above), a shared Context provider, or a state management library that abstracts localStorage.",
      dryRun:
        "🔁 **Think:** Two ShipmentFilterBar instances mount with the key `'shipment:depot'`. Both read `''` from localStorage on mount. Component A calls `setDepot('NW-01')`. localStorage now holds `'NW-01'`. Component B still shows `''` in its input. A user switches to Component B's panel and sees stale data. What is the minimum change to the setValue function that would cause Component B to re-render with the new value?",
      build:
        "**Learning focus:** Consume useLocalStorage in a component with useState ergonomics — understanding the key-namespacing convention, the onChange wiring pattern, and the core limitation of independent instances sharing the same storage key.",
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
  lessonNum: 36,
  title: "Custom Hook — useLocalStorage",
  shortName: "useLocalStorage — FILTER BAR",
});
