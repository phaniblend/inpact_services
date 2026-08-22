
import createINPACTEngine from "../inpact_engine_shared";

function normalizeCode(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

function evalLesson37Step1(answer) {
  const raw = String(answer || "");
  const hasInterface =
    /interface\s+WindowSize\s*\{[\s\S]*width\s*:\s*number[\s\S]*height\s*:\s*number[\s\S]*\}/.test(raw) ||
    /interface\s+WindowSize\s*\{[\s\S]*height\s*:\s*number[\s\S]*width\s*:\s*number[\s\S]*\}/.test(raw);
  return hasInterface ? "correct" : "wrong";
}

function evalLesson37Step2(answer) {
  const raw = String(answer || "");
  const hasHook = /function\s+useWindowSize|const\s+useWindowSize\s*=/.test(raw);
  const hasState = /useState\s*<\s*WindowSize\s*>/.test(raw);
  const hasInnerWidth = /window\.innerWidth/.test(raw);
  const hasInnerHeight = /window\.innerHeight/.test(raw);
  return hasHook && hasState && hasInnerWidth && hasInnerHeight ? "correct" : "wrong";
}

function evalLesson37Step3(answer) {
  const raw = String(answer || "");
  const hasHandler = /const\s+handleResize\s*=|function\s+handleResize/.test(raw);
  const setsWidth = /setSize[\s\S]{0,100}innerWidth/.test(raw);
  const setsHeight = /setSize[\s\S]{0,100}innerHeight/.test(raw);
  return hasHandler && setsWidth && setsHeight ? "correct" : "wrong";
}

function evalLesson37Step4(answer) {
  const raw = String(answer || "");
  const hasEffect = /useEffect\s*\(/.test(raw);
  const hasAddListener = /addEventListener\s*\(\s*['"]resize['"]/.test(raw);
  const hasRemoveListener = /removeEventListener\s*\(\s*['"]resize['"]/.test(raw);
  const hasReturn = /return\s*\(\s*\)\s*=>/.test(raw) || /return\s*function/.test(raw);
  return hasEffect && hasAddListener && hasRemoveListener && hasReturn ? "correct" : "wrong";
}

function evalLesson37Step5(answer) {
  const raw = String(answer || "");
  const hasUseWindowSize = /useWindowSize\s*\(/.test(raw);
  const hasWidth = /width/.test(raw);
  const hasHeight = /height/.test(raw);
  const hasJsx = /return\s*\(?\s*</.test(raw);
  const hasComponent = /const\s+WarehousePanel\s*=|function\s+WarehousePanel/.test(raw);
  return hasUseWindowSize && hasWidth && hasHeight && hasJsx && hasComponent ? "correct" : "wrong";
}

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "LESSON #37 (CUSTOM HOOK)",
      title: "Custom Hook — useWindowSize",
      body: "Build a hook that tracks the browser window's width and height in real time. The hook subscribes to the resize event on mount, updates state when the window changes, and cleans up the listener on unmount — three responsibilities that belong in one place.",
      usecase:
        "A logistics warehouse panel needs to collapse its route map sidebar when the viewport is narrow. Instead of scattering window.innerWidth checks across components, useWindowSize makes the current dimensions available to any component that needs them — with automatic cleanup so listeners never accumulate.",
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
          "Step 5 renders the WarehousePanel component using JSX expressions to display width and height. The curly-brace expression syntax and component return structure from Lesson 1 are used throughout.",
      },
      {
        lesson: 10,
        label: "useState — Primitives",
        reason:
          "Step 2 initializes the WindowSize state with `useState<WindowSize>`. Understanding how useState holds the current value and triggers re-renders when setSize is called is the core mechanism this hook is built on.",
      },
      {
        lesson: 24,
        label: "useEffect — Mount",
        reason:
          "Step 4 uses useEffect with an empty dependency array to register the resize listener once on mount. The 'run once on mount' pattern from Lesson 24 is the exact shape this step requires.",
      },
      {
        lesson: 25,
        label: "useEffect — Dependencies",
        reason:
          "Step 4's useEffect has no dependencies (empty array) — a deliberate choice. Understanding why dependency arrays control when effects re-run, from Lesson 25, is needed to reason about why [] is correct here and not [size].",
      },
      {
        lesson: 26,
        label: "useEffect — Cleanup",
        reason:
          "Step 4 returns a cleanup function from useEffect that calls removeEventListener. The cleanup return pattern from Lesson 26 is directly applied here — without it the resize listener accumulates on every mount.",
      },
      {
        lesson: 33,
        label: "Custom Hook — Extract Logic",
        reason:
          "The hook structure — a function starting with `use`, encapsulating useState and useEffect, and returning a value — follows the custom hook contract from Lesson 33. The naming rule and extraction rationale are prerequisites.",
      },
    ],
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Define a WindowSize interface with width and height fields",
      "Initialize useState with the current window dimensions on mount",
      "Write a handleResize function that reads window.innerWidth and window.innerHeight into state",
      "Register the resize listener in useEffect and clean it up in the return function",
      "Return the WindowSize object from the hook",
      "Consume the hook in a component to drive layout decisions",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 5",
    paal: "Define the WindowSize interface — it should describe an object with numeric width and height fields.",
    hint: "An interface with two number fields is all you need. This type will be the state type for the hook.",
    example_code: `interface ViewportDimensions {
  cols: number;
  rows: number;
}`,
    think_prompt:
      "The hook needs to hold two related numbers together — width and height — and update them as a unit when the window resizes. What TypeScript construct gives a name and type contract to that pair?",
    mc_options: [
      "type WindowSize = [number, number];",
      "interface WindowSize { width: number; height: number; }",
      "interface WindowSize { width: string; height: string; }",
    ],
    mc_correct_option: "interface WindowSize { width: number; height: number; }",
    mc_anchor:
      "An interface names the shape and gives each field a semantic label. window.innerWidth and window.innerHeight are numbers — not strings. A tuple works but loses the named-field clarity that makes the hook's return value self-documenting.",
    why_this_matters:
      "Naming the shape matters when multiple engineers work with the same hook. `{ width: 1280, height: 720 }` is immediately readable in a destructured component. A tuple `[1280, 720]` requires knowing which position is which. In large logistics dashboards with many layout-aware components, the interface is documentation.",
    answer_keywords: ["interface", "WindowSize", "width", "number", "height", "number"],
    evaluate: evalLesson37Step1,
    seed_code: "",
    starter_code: "// Define the WindowSize interface here",
    feedback_correct:
      "Exactly — two number fields, named width and height. This interface will become the generic type parameter for the hook's useState call.",
    feedback_partial:
      "Almost — check that both fields are typed as number (not string), and that the interface is named WindowSize.",
    feedback_wrong:
      "Pattern: `interface WindowSize { width: number; height: number; }` — two number fields matching window.innerWidth and window.innerHeight.",
    expected: `interface WindowSize {
  width: number;
  height: number;
}`,
    analog_example: `interface GridDimensions {
  cols: number;
  rows: number;
}`,
    deepDiveLabel:
      "window.innerWidth is a number — why does TypeScript need an interface at all? Can't it just infer the type?",
    deepDive: {
      hook: "You skip the interface and write `useState({ width: window.innerWidth, height: window.innerHeight })`. TypeScript infers the state type as `{ width: number; height: number }`. The hook works. Three months later a teammate refactors handleResize and accidentally writes `setSize({ width: window.innerWidth, height: window.outerHeight })`. outerHeight includes the browser chrome — it's larger than the viewport. TypeScript accepts it because the shape matches. The bug ships to production and your responsive layout breaks on certain screen sizes.",
      pain: "⚠️ **Lesson:** TypeScript's structural inference is accurate but anonymous. Without a named interface, the intent is invisible — there's no declaration that says 'this object represents the browser viewport dimensions'. Named types make intent auditable and help reviewers catch mismatches.",
      mentalModel:
        "**Mental model:** Think of interfaces as **named contracts**.\n- Without a name: TypeScript checks the shape but no one can tell at a glance what the shape *means*.\n- With a name: `WindowSize` tells every reader that width and height refer specifically to the browser viewport — not the screen, not an element, not a container.\n- In code review, `setSize({ width: w, height: outerH })` with a WindowSize type comment triggers a question: should outerH be there? Without the named type, it just looks like a shape match.",
      discover:
        "**Pattern — interface vs inference:**\n```tsx\n// ✅ named interface — intent is explicit and auditable\ninterface WindowSize {\n  width: number;\n  height: number;\n}\nconst [size, setSize] = useState<WindowSize>({ width: window.innerWidth, height: window.innerHeight });\n\n// ⚠️ inferred — works but loses semantic meaning\nconst [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });\n// TypeScript infers { width: number; height: number } but no name carries intent\n\n// ❌ wrong field types — TypeScript would catch this with the interface\nconst [size, setSize] = useState<WindowSize>({ width: '1280px', height: '720px' });\n// Error: Type 'string' is not assignable to type 'number'\n```",
      quickRules:
        "✅ Name shapes that have semantic meaning — WindowSize means something specific\n✅ Use the interface as the generic type argument: useState<WindowSize>\n✅ Prefer innerWidth/innerHeight for viewport — not outerWidth/outerHeight (includes browser chrome)\n❌ Don't infer anonymous shapes for types you'll reuse — the name is documentation\n❌ Don't use string fields for pixel dimensions — they're always numbers in the DOM API",
      watchOut:
        "👀 **Watch out:** `window.innerWidth` gives you the viewport width (content area). `window.outerWidth` gives you the full browser window width including toolbars and borders. `screen.width` gives you the physical screen width. All three are numbers. Without a named interface documenting which one you're tracking, a future refactor might silently swap them — and responsive breakpoints will break in ways that are hard to reproduce.",
      dryRun:
        "🔁 **Think:** Your hook initializes with `{ width: window.innerWidth, height: window.innerHeight }`. On a desktop with a 1440×900 viewport, width is 1440. The user snaps the browser to half the screen — the viewport is now 720 wide. The resize event fires. handleResize calls `setSize({ width: window.innerWidth, height: window.innerHeight })`. What value does `window.innerWidth` return inside handleResize — the old 1440, or the new 720? (Hint: when does the DOM update relative to the resize event?)",
      build:
        "**Learning focus:** Define a named interface for window dimensions — understanding that named types carry semantic intent that anonymous inferred shapes don't, and that the interface becomes the state's type contract for the whole hook.",
    },
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 5",
    paal: "Define the useWindowSize hook and initialize its state — use useState<WindowSize> with the current window.innerWidth and window.innerHeight as the initial value.",
    hint: "The initial value is an object literal `{ width: window.innerWidth, height: window.innerHeight }` — this reads the current dimensions once, synchronously, before the first render.",
    example_code: `function useGridDimensions() {
  const [dims, setDims] = useState<GridDimensions>({
    cols: window.innerWidth,
    rows: window.innerHeight,
  });
}`,
    think_prompt:
      "useState needs an initial value. The window dimensions are available immediately via window.innerWidth. Should you read them in a lazy initializer function, or pass them as a direct object literal?",
    mc_options: [
      "const [size, setSize] = useState<WindowSize>({ width: 0, height: 0 });",
      "const [size, setSize] = useState<WindowSize>({ width: window.innerWidth, height: window.innerHeight });",
      "const [size, setSize] = useState<WindowSize>(() => fetch('/api/viewport').then(r => r.json()));",
    ],
    mc_correct_option:
      "const [size, setSize] = useState<WindowSize>({ width: window.innerWidth, height: window.innerHeight });",
    mc_anchor:
      "window.innerWidth is a synchronous, instant read — no async call, no I/O. Initializing with the real values prevents a layout flash. Using zeros forces a render with wrong dimensions before the effect can correct them. A fetch call would be wrong both technically and semantically.",
    why_this_matters:
      "In enterprise logistics apps, layout decisions happen on the first render — whether to show a sidebar, how many columns to display in a table. Initializing with actual viewport dimensions means the layout is correct on frame one with no flash.",
    answer_keywords: ["useState", "WindowSize", "window.innerWidth", "window.innerHeight"],
    evaluate: evalLesson37Step2,
    seed_code: `interface WindowSize {
  width: number;
  height: number;
}`,
    starter_code: `interface WindowSize {
  width: number;
  height: number;
}

function useWindowSize() {
  // Initialize state with the current window dimensions
  // Use window.innerWidth and window.innerHeight
}`,
    feedback_correct:
      "Exactly — reading window.innerWidth synchronously in the initializer gives the correct dimensions on the first render, no flash.",
    feedback_partial:
      "Almost — check that you're reading window.innerWidth and window.innerHeight (not 0), and that the state type is explicitly annotated as WindowSize.",
    feedback_wrong:
      "Pattern: `const [size, setSize] = useState<WindowSize>({ width: window.innerWidth, height: window.innerHeight });`",
    expected: `interface WindowSize {
  width: number;
  height: number;
}

function useWindowSize() {
  const [size, setSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });
}`,
    analog_example: `function useGridDimensions() {
  const [dims, setDims] = useState<GridDimensions>({
    cols: window.innerWidth,
    rows: window.innerHeight,
  });
}`,
    deepDiveLabel:
      "Initializing with zeros and correcting in useEffect looks safer — so why does it cause a visible flash?",
    deepDive: {
      hook: "You initialize with `{ width: 0, height: 0 }` and add a useEffect that reads the real dimensions on mount. The component renders for the first time with width=0. Your layout logic shows the mobile sidebar. useEffect fires after paint — the real width is 1440. React re-renders. The sidebar collapses. The user sees it appear then immediately disappear. On a fast machine it's a flicker. On a slow device it lasts half a second.",
      pain: "⚠️ **Lesson:** Layout-driven state should be initialized with the correct value on the first render. If the correct value is available synchronously (as window.innerWidth is), initializing with a placeholder forces an unnecessary re-render and causes the UI to briefly show the wrong layout.",
      mentalModel:
        "**Mental model:** Think of the first render as **the only render that matters for layout**.\n- If the initial state is wrong, the first paint shows the wrong layout.\n- A useEffect correction fires after paint — the wrong layout has already been shown.\n- For synchronous reads (like window.innerWidth), there's no reason to use a placeholder. The real value is available before the component runs.\n- The zero-then-correct pattern is only necessary when the initial value requires async I/O.",
      discover:
        "**Pattern — initialization strategies:**\n```tsx\n// ✅ correct — real value on first render, no flash\nconst [size, setSize] = useState<WindowSize>({\n  width: window.innerWidth,\n  height: window.innerHeight,\n});\n\n// ❌ placeholder then correct — causes a layout flash\nconst [size, setSize] = useState<WindowSize>({ width: 0, height: 0 });\nuseEffect(() => {\n  setSize({ width: window.innerWidth, height: window.innerHeight });\n}, []); // fires after paint — too late\n\n// ✅ lazy initializer — same result as direct object, useful if the read were expensive\nconst [size, setSize] = useState<WindowSize>(() => ({\n  width: window.innerWidth,\n  height: window.innerHeight,\n}));\n```",
      quickRules:
        "✅ Initialize with real values when they're available synchronously on mount\n✅ Use the lazy initializer form when the initial value computation is expensive\n✅ Use a placeholder + useEffect only when the initial value requires async I/O\n❌ Don't initialize layout state with zero when the real value is a synchronous read\n❌ Don't use useEffect to correct an initializable state — it always fires after paint",
      watchOut:
        "👀 **Watch out:** `window.innerWidth` is safe to read synchronously in a browser environment. However, in SSR (Next.js, Remix), `window` doesn't exist on the server and accessing it throws. For SSR-safe hooks, you'd initialize with `{ width: 0, height: 0 }` and read the real value in useEffect. This is one case where the placeholder approach is correct — not for correctness in the browser, but for survival on the server.",
      dryRun:
        "🔁 **Think:** A component using useWindowSize renders for the first time. At the exact moment useState runs its initializer, is the component painted to the screen yet? Does the browser have the final layout computed? And given that, is it safe for the initializer to read window.innerWidth at that moment?",
      build:
        "**Learning focus:** Initialize useState with synchronously available window dimensions — understanding why real initial values prevent layout flashes, and when placeholder-then-correct is the right trade-off.",
    },
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 5",
    paal: "Write the handleResize function inside the hook — it should read window.innerWidth and window.innerHeight and call setSize to update state.",
    hint: "handleResize takes no arguments — it reads directly from the window object. Call setSize with an object literal containing the new dimensions.",
    example_code: `const handleReorder = () => {
  setDims({
    cols: window.innerWidth,
    rows: window.innerHeight,
  });
};`,
    think_prompt:
      "The resize event fires when the window changes size. Your handler needs to read the new dimensions and push them into React state. What does that function look like?",
    mc_options: [
      "const handleResize = (e: Event) => { setSize({ width: e.width, height: e.height }); }",
      "const handleResize = () => { setSize({ width: window.innerWidth, height: window.innerHeight }); }",
      "const handleResize = () => { size.width = window.innerWidth; size.height = window.innerHeight; }",
    ],
    mc_correct_option:
      "const handleResize = () => { setSize({ width: window.innerWidth, height: window.innerHeight }); }",
    mc_anchor:
      "The resize Event object doesn't carry the new dimensions — you read them directly from window.innerWidth and window.innerHeight. Mutating the state object directly (`size.width = ...`) bypasses React's state update mechanism — the component never re-renders.",
    why_this_matters:
      "Event-driven state updates are the pattern behind every interactive feature in a logistics UI — shipment selection, filter changes, drag-to-resize panels. The handler reads from the source of truth (the DOM or the event), then pushes the new value into React state via the setter. That's the complete pattern.",
    answer_keywords: ["handleResize", "setSize", "window.innerWidth", "window.innerHeight"],
    evaluate: evalLesson37Step3,
    seed_code: `interface WindowSize {
  width: number;
  height: number;
}

function useWindowSize() {
  const [size, setSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });
}`,
    starter_code: `interface WindowSize {
  width: number;
  height: number;
}

function useWindowSize() {
  const [size, setSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Write handleResize here
  // It reads window.innerWidth and window.innerHeight and calls setSize
}`,
    feedback_correct:
      "Exactly — no arguments needed, read from window directly, new object into setSize. React sees the new reference and re-renders with the updated dimensions.",
    feedback_partial:
      "Almost — check that you're reading from window.innerWidth (not from the event object), and that you're calling setSize with a new object (not mutating size directly).",
    feedback_wrong:
      "Pattern: `const handleResize = () => { setSize({ width: window.innerWidth, height: window.innerHeight }); }`",
    expected: `interface WindowSize {
  width: number;
  height: number;
}

function useWindowSize() {
  const [size, setSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const handleResize = () => {
    setSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };
}`,
    analog_example: `const handleReorder = () => {
  setDims({
    cols: window.innerWidth,
    rows: window.innerHeight,
  });
};`,
    deepDiveLabel:
      "The resize event fires many times per second during a drag — why doesn't this cause a performance problem?",
    deepDive: {
      hook: "A user grabs the browser window edge and drags it slowly. The resize event fires 30–60 times per second. Your handleResize calls setSize 30–60 times per second. React re-renders 30–60 times per second. Your WarehousePanel recalculates its layout 30–60 times per second. On a dashboard with 50 shipment cards, each re-render takes 8ms. You're asking for 240–480ms of work per second from the main thread — and layout jank is visible.",
      pain: "⚠️ **Lesson:** The resize event fires on every frame during a drag. For hooks that trigger expensive renders or complex layout recalculations, throttling or debouncing the handler is a production necessity — not a micro-optimisation. The basic implementation in this lesson is correct and sufficient for most cases; the performance issue appears when renders are expensive.",
      mentalModel:
        "**Mental model:** Think of throttle/debounce as a **rate limiter for event handlers**.\n- **Debounce** — wait until the event stops firing for N ms, then run once. Good for 'user stopped resizing'.\n- **Throttle** — run at most once per N ms regardless of how many events fire. Good for 'update smoothly during resize'.\n- For useWindowSize, throttle (every 100ms) is usually the right choice — it keeps the layout responsive during drag without running on every pixel.",
      discover:
        "**Pattern — throttled resize:**\n```tsx\n// Basic — fires on every resize event\nconst handleResize = () => {\n  setSize({ width: window.innerWidth, height: window.innerHeight });\n};\n\n// Throttled — fires at most once per 100ms\nimport { throttle } from 'lodash';\nconst handleResize = useMemo(\n  () => throttle(() => {\n    setSize({ width: window.innerWidth, height: window.innerHeight });\n  }, 100),\n  [] // create once, stable reference\n);\n\n// Cleanup the throttled function too\nuseEffect(() => {\n  window.addEventListener('resize', handleResize);\n  return () => {\n    handleResize.cancel(); // flush pending calls\n    window.removeEventListener('resize', handleResize);\n  };\n}, [handleResize]);\n```",
      quickRules:
        "✅ Basic handler is correct and sufficient for simple layout decisions\n✅ Throttle at 100–150ms for hooks driving expensive renders\n✅ Debounce when you only need the final value after resize ends\n✅ Cancel throttled/debounced functions in the useEffect cleanup\n❌ Don't mutate state objects directly — always pass a new object to setSize\n❌ Don't read from the Event object — resize events don't carry dimension data",
      watchOut:
        "👀 **Watch out:** If you throttle handleResize with lodash or a custom implementation, you must also cancel the throttle in the useEffect cleanup. A throttled function holds a pending timer internally. If the component unmounts while a throttle timer is pending, the timer fires after unmount and calls setSize on an unmounted component — React warns about this in development mode.",
      dryRun:
        "🔁 **Think:** handleResize reads `window.innerWidth` and calls `setSize`. setSize schedules a re-render. The re-render runs handleResize again — wait, does it? handleResize is called by the event listener, not by the render. Walk through: (1) user drags window, (2) resize event fires, (3) handleResize runs, (4) setSize called, (5) React re-renders the component. Does step 5 cause handleResize to run again? If not, why not?",
      build:
        "**Learning focus:** Write an event handler that reads from the DOM and pushes into React state — understanding that resize events don't carry dimension data, that state mutation bypasses React, and that high-frequency events warrant throttling when renders are expensive.",
    },
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 5",
    paal: "Register handleResize as a resize listener in useEffect — add the listener on mount, return a cleanup function that removes it, and use an empty dependency array.",
    hint: "addEventListener('resize', handleResize) registers it. The cleanup function must call removeEventListener('resize', handleResize) with the exact same reference. Empty array [] means run once on mount.",
    example_code: `useEffect(() => {
  window.addEventListener('reorder', handleReorder);
  return () => {
    window.removeEventListener('reorder', handleReorder);
  };
}, []);`,
    think_prompt:
      "Event listeners attached to the window object live until explicitly removed. If the component unmounts without removing the listener, what happens every time the window is resized after that?",
    mc_options: [
      "useEffect(() => { window.addEventListener('resize', handleResize); }, [size]);",
      "useEffect(() => { window.addEventListener('resize', handleResize); return () => { window.removeEventListener('resize', handleResize); }; }, []);",
      "useEffect(() => { window.addEventListener('resize', handleResize); return () => { handleResize(); }; }, []);",
    ],
    mc_correct_option:
      "useEffect(() => { window.addEventListener('resize', handleResize); return () => { window.removeEventListener('resize', handleResize); }; }, []);",
    mc_anchor:
      "Empty array — runs once on mount, cleans up once on unmount. The cleanup removes the exact same listener reference. `[size]` would re-add the listener on every resize — accumulating listeners with every state change. Returning `handleResize()` calls the handler during cleanup instead of removing the listener.",
    why_this_matters:
      "In enterprise apps, components mount and unmount frequently — route changes, tab switches, modal opens. A missing removeEventListener in useWindowSize means every unmount leaves an orphaned resize listener on window. After enough navigations, every resize fires dozens of stale handlers. The page slows, then crashes.",
    answer_keywords: ["useEffect", "addEventListener", "resize", "handleResize", "removeEventListener", "return"],
    evaluate: evalLesson37Step4,
    seed_code: `interface WindowSize {
  width: number;
  height: number;
}

function useWindowSize() {
  const [size, setSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const handleResize = () => {
    setSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };
}`,
    starter_code: `interface WindowSize {
  width: number;
  height: number;
}

function useWindowSize() {
  const [size, setSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const handleResize = () => {
    setSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  // Register and clean up the resize listener here
  // Empty dependency array — mount once, clean up on unmount
}`,
    feedback_correct:
      "Exactly — addEventListener on mount, removeEventListener in the cleanup return, empty array so this runs once. The same handler reference is passed to both calls — that's what makes removeEventListener work.",
    feedback_partial:
      "Almost — check three things: empty dependency array [], a return function (not just a call), and removeEventListener using the same handleResize reference as addEventListener.",
    feedback_wrong:
      "Pattern: `useEffect(() => { window.addEventListener('resize', handleResize); return () => { window.removeEventListener('resize', handleResize); }; }, []);`",
    expected: `interface WindowSize {
  width: number;
  height: number;
}

function useWindowSize() {
  const [size, setSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const handleResize = () => {
    setSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
}`,
    analog_example: `useEffect(() => {
  window.addEventListener('reorder', handleReorder);
  return () => {
    window.removeEventListener('reorder', handleReorder);
  };
}, []);`,
    deepDiveLabel:
      "removeEventListener looks like it should work — but sometimes the listener doesn't get removed. What makes it fail silently?",
    deepDive: {
      hook: "You define handleResize inside the useEffect and pass an inline arrow function to both addEventListener and removeEventListener. The component unmounts. The listener is still there. On the next resize, the handler fires on an unmounted component — React warns in the console. What went wrong? You passed a different function reference to removeEventListener than to addEventListener.",
      pain: "⚠️ **Lesson:** removeEventListener only removes a listener if the function reference passed to it is **identical** (===) to the one passed to addEventListener. Arrow functions defined inline create new references on every call. `addEventListener('resize', () => setSize(...))` and `removeEventListener('resize', () => setSize(...))` are two different functions — the second one was never registered.",
      mentalModel:
        "**Mental model:** Think of addEventListener/removeEventListener as a **guest list with exact ID matching**.\n- addEventListener adds a function to the list by reference.\n- removeEventListener looks for that exact reference to remove it.\n- If you pass a different function (even one that does the same thing), it's not found — the original stays on the list.\n- This is why handleResize is defined once outside useEffect and the same variable is passed to both calls.",
      discover:
        "**Pattern — reference stability:**\n```tsx\n// ✅ stable reference — same variable passed to both calls\nconst handleResize = () => { setSize({ width: window.innerWidth, height: window.innerHeight }); };\nuseEffect(() => {\n  window.addEventListener('resize', handleResize);\n  return () => window.removeEventListener('resize', handleResize);\n}, []);\n\n// ❌ inline arrow functions — different references, removeEventListener does nothing\nuseEffect(() => {\n  window.addEventListener('resize', () => setSize({ ... }));\n  return () => window.removeEventListener('resize', () => setSize({ ... }));\n  // These are two different functions — the listener is never removed\n}, []);\n\n// ✅ define inside effect — same reference captured in closure\nuseEffect(() => {\n  const handler = () => setSize({ width: window.innerWidth, height: window.innerHeight });\n  window.addEventListener('resize', handler);\n  return () => window.removeEventListener('resize', handler);\n}, []);\n```",
      quickRules:
        "✅ Define the handler function once and pass the same variable to addEventListener and removeEventListener\n✅ Or define the handler inside the effect — the closure captures the reference for cleanup\n✅ Use [] as the dependency array to register the listener once on mount\n❌ Never pass inline arrow functions to both add and remove — they create different references\n❌ Don't add size or other state to the dependency array — it re-registers the listener on every change",
      watchOut:
        "👀 **Watch out:** Adding `handleResize` to the dependency array `[handleResize]` looks like good practice but causes a problem here. handleResize is defined as a `const` inside the hook body — it gets a new reference on every render. Adding it to deps means useEffect re-runs on every render, re-registering the listener each time. The cleanup runs between renders too, so you're constantly adding and removing a listener. For event listener hooks, defining the handler inside the effect or using useCallback is the correct approach to avoid this.",
      dryRun:
        "🔁 **Think:** The hook mounts. useEffect runs. addEventListener registers handleResize. The user resizes the window — handleResize fires, setSize is called, the component re-renders. handleResize is a const defined in the hook body. Does the re-render create a new handleResize function? If yes, is the listener still pointing to the original one? And does that matter — is the listener still correctly registered?",
      build:
        "**Learning focus:** Register a window event listener in useEffect with a cleanup function — understanding why the cleanup must pass the exact same function reference, why an empty dependency array is correct here, and how accumulating unremoved listeners degrade performance.",
    },
  },
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 5",
    paal: "Return the size object from the hook, then build WarehousePanel — a component that uses useWindowSize and renders the current width and height, with a note that collapses the sidebar when width is below 768.",
    hint: "The hook returns the size object — destructure width and height from it. The sidebar note can be a simple conditional: width < 768 ? 'Sidebar hidden' : 'Sidebar visible'.",
    example_code: `const RouteMapPanel = () => {
  const { cols, rows } = useGridDimensions();
  return (
    <div>
      <p>Grid: {cols} × {rows}</p>
      {cols < 900 ? <p>Compact mode</p> : <p>Full mode</p>}
    </div>
  );
};`,
    think_prompt:
      "The hook has everything it needs. What is the return statement, and how does the component use the returned object to make a layout decision?",
    mc_options: [
      "return size; — then const size = useWindowSize(); <p>{size.width}</p>",
      "return size; — then const { width, height } = useWindowSize(); and conditional rendering based on width",
      "return [size.width, size.height]; — then const [w, h] = useWindowSize();",
    ],
    mc_correct_option:
      "return size; — then const { width, height } = useWindowSize(); and conditional rendering based on width",
    mc_anchor:
      "Returning the object and destructuring at the call site is the clearest API. Both options work — the difference is that destructuring gives you named variables. The tuple form loses the named fields. The key pattern is using width directly in a conditional to drive the layout decision.",
    why_this_matters:
      "useWindowSize is the pattern behind every responsive dashboard in enterprise React. Sidebar collapse, table column reduction, mobile navigation — all of these are width-conditional renders. The hook extracts the browser API complexity; the component just reads a number and decides.",
    answer_keywords: ["return", "size", "useWindowSize", "width", "height", "768"],
    evaluate: evalLesson37Step5,
    seed_code: `interface WindowSize {
  width: number;
  height: number;
}

function useWindowSize() {
  const [size, setSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const handleResize = () => {
    setSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
}`,
    starter_code: `interface WindowSize {
  width: number;
  height: number;
}

function useWindowSize() {
  const [size, setSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const handleResize = () => {
    setSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // return size here
}

// Build WarehousePanel below
// - call useWindowSize and destructure width and height
// - render the dimensions
// - conditionally show sidebar status based on width < 768
const WarehousePanel = () => {
  // your component here
};`,
    feedback_correct:
      "Exactly — the hook handles the browser API entirely. The component just reads numbers and makes decisions. That's the separation of concerns that makes custom hooks worth writing.",
    feedback_partial:
      "Almost — check that the hook returns size, WarehousePanel calls useWindowSize, and the component uses width in a conditional (threshold 768).",
    feedback_wrong:
      "Return `size` from the hook. In WarehousePanel: `const { width, height } = useWindowSize();` then render width, height, and `width < 768 ? 'Sidebar hidden' : 'Sidebar visible'`.",
    expected: `interface WindowSize {
  width: number;
  height: number;
}

function useWindowSize() {
  const [size, setSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const handleResize = () => {
    setSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return size;
}

const WarehousePanel = () => {
  const { width, height } = useWindowSize();

  return (
    <div>
      <p>Viewport: {width} × {height}</p>
      <p>{width < 768 ? 'Sidebar hidden' : 'Sidebar visible'}</p>
    </div>
  );
};`,
    analog_example: `const RouteMapPanel = () => {
  const { cols, rows } = useGridDimensions();
  return (
    <div>
      <p>Grid: {cols} × {rows}</p>
      {cols < 900 ? <p>Compact mode</p> : <p>Full mode</p>}
    </div>
  );
};`,
    deepDiveLabel:
      "The hook works perfectly — so why does it break in a Next.js or SSR app on the first render?",
    deepDive: {
      hook: "Your logistics dashboard goes through a performance upgrade — the team adds Next.js for server-side rendering. The first deploy fails with `ReferenceError: window is not defined`. The error points to the useState initializer inside useWindowSize. The server renders the component, runs the useState initializer, hits `window.innerWidth` — and crashes because `window` doesn't exist in the Node.js runtime.",
      pain: "⚠️ **Lesson:** `window` is a browser global. Node.js (where SSR runs) has no window. Any hook that reads `window` synchronously during initialization breaks in SSR environments. The fix requires checking for browser environment before reading window, or moving the read to a useEffect.",
      mentalModel:
        "**Mental model:** Think of SSR as **running your component in two different environments**.\n- Server render — Node.js, no window, no document, no browser APIs. The first render happens here.\n- Client render (hydration) — browser, window exists, useEffect fires.\n- Hooks that read window in their initializer run on the server and crash.\n- Safe pattern: initialize with a safe default, read window in useEffect.",
      discover:
        "**Pattern — SSR-safe window access:**\n```tsx\n// ❌ SSR-unsafe — crashes on server\nconst [size, setSize] = useState<WindowSize>({\n  width: window.innerWidth,   // ReferenceError on server\n  height: window.innerHeight,\n});\n\n// ✅ SSR-safe — initialize with defaults, read in useEffect\nconst [size, setSize] = useState<WindowSize>({ width: 0, height: 0 });\nuseEffect(() => {\n  setSize({ width: window.innerWidth, height: window.innerHeight });\n  window.addEventListener('resize', handleResize);\n  return () => window.removeEventListener('resize', handleResize);\n}, []);\n\n// ✅ SSR-safe with typeof guard\nconst getSize = () =>\n  typeof window === 'undefined'\n    ? { width: 0, height: 0 }\n    : { width: window.innerWidth, height: window.innerHeight };\nconst [size, setSize] = useState<WindowSize>(getSize);\n```",
      quickRules:
        "✅ For browser-only apps: initialize directly with window.innerWidth (no flash, correct first render)\n✅ For SSR apps: initialize with { width: 0, height: 0 }, read window in useEffect\n✅ Use `typeof window === 'undefined'` to detect SSR environment\n❌ Don't access window in useState initializers if your app might SSR\n❌ Don't use `window` in the module top-level — it runs on import in SSR",
      watchOut:
        "👀 **Watch out:** The `typeof window === 'undefined'` guard must be checked inside a function — not at the module level. Module-level code runs once when the module is imported, which can happen on the server. If you write `const isBrowser = typeof window !== 'undefined'` at the top of your file and then use it in an initializer, it may have been captured as `false` on the server and never updated. Always evaluate the guard at call time, inside the function.",
      dryRun:
        "🔁 **Think:** You add the SSR-safe version: initialize with `{ width: 0, height: 0 }`, then in useEffect read the real dimensions and call setSize. The component renders on the server with width=0. WarehousePanel evaluates `0 < 768` — shows 'Sidebar hidden'. The client hydrates, useEffect fires, width becomes 1440, re-render shows 'Sidebar visible'. Is there a flash? And does this flash matter for a logistics dashboard used in a browser tab (not a public web page)?",
      build:
        "**Learning focus:** Return the size object from the hook and consume it in a component — understanding that the hook completely abstracts the browser API, and that SSR environments require a defensive initialization strategy because window doesn't exist on the server.",
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
  lessonNum: 37,
  title: "Custom Hook — useWindowSize",
  shortName: "useWindowSize — WAREHOUSE PANEL",
});
