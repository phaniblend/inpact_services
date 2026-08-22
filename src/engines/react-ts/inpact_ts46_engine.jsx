
import createINPACTEngine from "../inpact_engine_shared";

function normalizeCode(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

function evalLesson46Step1(answer) {
  const raw = String(answer || "");
  const hasImport = /import\s+.*useCallback.*from\s+['"]react['"]/m.test(raw);
  const hasComponent = /const\s+DriverActionBar\s*=\s*\(/m.test(raw);
  const hasOnAssign = /onAssign\s*:/m.test(raw);
  const hasDriverId = /driverId\s*:\s*string/m.test(raw);
  return hasImport && hasComponent && hasOnAssign && hasDriverId ? "correct" : "wrong";
}

function evalLesson46Step2(answer) {
  const raw = String(answer || "");
  const hasCallback = /useCallback\s*\(/m.test(raw);
  const hasArrow = /\(\s*\)\s*=>/m.test(raw) || /\(.*\)\s*=>/m.test(raw);
  const hasDep = /\[\s*driverId\s*[,\]]/m.test(raw) || /\[\s*driverId\s*\]/m.test(raw);
  const hasOnAssign = /onAssign\s*\(|onAssign\s*&&/m.test(raw);
  return hasCallback && hasArrow && hasDep && hasOnAssign ? "correct" : "wrong";
}

function evalLesson46Step3(answer) {
  const raw = String(answer || "");
  const hasSecondCallback = (raw.match(/useCallback\s*\(/gm) || []).length >= 2;
  const hasOnSuspend = /onSuspend/m.test(raw);
  const hasDep = /\[\s*driverId\s*[,\]]/m.test(raw) || /\[\s*driverId\s*\]/m.test(raw);
  return hasSecondCallback && hasOnSuspend && hasDep
    ? "correct"
    : hasOnSuspend && !hasSecondCallback
    ? "partial"
    : "wrong";
}

function evalLesson46Step4(answer) {
  const raw = String(answer || "");
  const hasReturn = /return\s*\(/m.test(raw);
  const hasHandleAssign = /handleAssign\b/m.test(raw);
  const hasHandleSuspend = /handleSuspend\b/m.test(raw);
  const hasOnClick = /onClick\s*=\s*\{/m.test(raw);
  return hasReturn && hasHandleAssign && hasHandleSuspend && hasOnClick ? "correct" : "wrong";
}

function evalLesson46Step5(answer) {
  const raw = String(answer || "");
  const hasExport = /export\s+default\s+DriverActionBar/m.test(raw);
  const hasCallback = /useCallback/m.test(raw);
  return hasExport && hasCallback ? "correct" : "wrong";
}

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "LESSON #46 (useCallback)",
      title: "useCallback — Stable Function References",
      body: "useCallback memoizes a function so it keeps the same reference between renders — unless its dependencies change. You'll build a DriverActionBar that passes stable handler functions to action buttons, preventing unnecessary re-renders in memoized children.",
      usecase:
        "In a fleet management dashboard, action bars sit inside large lists. Each row has buttons — assign, suspend, contact. Without useCallback, every parent re-render creates new function references for those handlers, invalidating React.memo on the buttons and cascading re-renders down the list. useCallback is the fix.",
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
          "The DriverActionBar component uses JSX arrow function syntax, onClick handlers, and curly-brace expressions throughout all five steps.",
      },
      {
        lesson: 10,
        label: "useState — Primitives",
        reason:
          "Steps 2–3 require understanding that a state change in the parent triggers a re-render, which is the precise scenario where useCallback's stable reference matters.",
      },
      {
        lesson: 24,
        label: "useEffect — Mount",
        reason:
          "useCallback's dependency array follows the same rules as useEffect's. You need to understand what 'dependency changing between renders' means before you can reason about when useCallback recreates its function.",
      },
      {
        lesson: 44,
        label: "React.memo",
        reason:
          "Step 2's deepDive explains why useCallback only benefits components wrapped in React.memo. Without knowing what React.memo does and when it skips renders, the motivation for useCallback is invisible.",
      },
      {
        lesson: 45,
        label: "useMemo",
        reason:
          "useMemo memoizes a value; useCallback memoizes a function. The deepDive in Step 3 contrasts the two directly. You need the useMemo mental model from Lesson 45 to understand why useCallback exists as a separate hook.",
      },
    ],
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Explain the difference between useMemo and useCallback",
      "Wrap an event handler in useCallback with a correct dependency array",
      "Chain two independent useCallback calls with shared dependencies",
      "Pass memoized handlers to JSX onClick attributes correctly",
      "Identify when useCallback actually prevents re-renders versus when it adds overhead without benefit",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 5",
    paal: "Import useCallback from React and define the DriverActionBar component that accepts driverId (string), onAssign (() => void), and onSuspend (() => void) props.",
    hint: "Named import — useCallback lives in the same 'react' package as useState. The props interface needs three fields: one string and two callback types.",
    example_code: `import { useCallback } from 'react';

interface RouteControlProps {
  routeId: string;
  onStart: () => void;
  onCancel: () => void;
}

const RouteControl = ({ routeId, onStart, onCancel }: RouteControlProps) => {
  return <div />;
};`,
    think_prompt:
      "The props include two function props typed as `() => void`. What does `() => void` mean as a TypeScript type — and what would happen if you typed them as `Function` instead?",
    mc_options: [
      "`() => void` means the function returns undefined — `Function` is a safer broader type",
      "`() => void` means a function that takes no arguments and returns nothing — it's more precise than `Function`",
      "`() => void` and `Function` are identical — TypeScript treats them the same way",
    ],
    mc_correct_option:
      "`() => void` means a function that takes no arguments and returns nothing — it's more precise than `Function`",
    mc_anchor:
      "`() => void` is a precise signature — TypeScript will enforce that callers pass a zero-argument function. `Function` is a loose catch-all that accepts any function, bypassing argument-count checking and making the prop contract ambiguous.",
    why_this_matters:
      "In a fleet dashboard codebase with dozens of action bars, typed prop signatures are the first line of defense. A `() => void` prop type means TypeScript will catch it at compile time if someone accidentally passes a function that expects arguments — before the bug ever reaches a driver's dispatch queue.",
    answer_keywords: [
      "import",
      "useCallback",
      "react",
      "DriverActionBar",
      "driverId",
      "onAssign",
      "onSuspend",
    ],
    evaluate: evalLesson46Step1,
    seed_code: "",
    starter_code: `// 1. import useCallback from the correct package
// 2. define DriverActionBarProps: driverId (string), onAssign (() => void), onSuspend (() => void)
// 3. define DriverActionBar component — return <div /> for now`,
    feedback_correct:
      "Clean — named import, three typed props, component shell ready. useCallback can now be called inside the body.",
    feedback_partial:
      "Check the import (curly braces, 'react') and confirm both onAssign and onSuspend are typed as `() => void` not `Function` or `any`.",
    feedback_wrong:
      "Pattern: `import { useCallback } from 'react'` then `interface DriverActionBarProps { driverId: string; onAssign: () => void; onSuspend: () => void; }` then the component.",
    expected: `import { useCallback } from 'react';

interface DriverActionBarProps {
  driverId: string;
  onAssign: () => void;
  onSuspend: () => void;
}

const DriverActionBar = ({ driverId, onAssign, onSuspend }: DriverActionBarProps) => {
  return <div />;
};`,
    analog_example: `import { useCallback } from 'react';

interface PackageControlProps {
  packageId: string;
  onDeliver: () => void;
  onReturn: () => void;
}

const PackageControl = ({ packageId, onDeliver, onReturn }: PackageControlProps) => {
  return <div />;
};`,
    deepDiveLabel:
      "The prop is typed as `() => void` — so why does TypeScript allow you to pass a function that returns a string without complaining?",
    deepDive: {
      hook: "You define `onAssign: () => void` in your props interface. A parent passes `() => 'NX-1042'` — a function that returns a string. TypeScript compiles without error. At runtime the assignment works. You expected a type error. You didn't get one.\n\nThis looks like a TypeScript bug. It isn't. It's a deliberate design decision — and understanding it changes how you read callback prop types.",
      pain: "⚠️ **Lesson:** `() => void` in TypeScript does NOT mean 'this function must return undefined.' It means 'I, the caller, will ignore whatever this function returns.' Why does TypeScript make that distinction?",
      mentalModel:
        "**Mental model — the Polite Ignorer.**\n\n`() => void` is a promise from the component that receives the callback: 'I will call this function but I won't use its return value.' It says nothing about what the function is allowed to return. The caller can return anything — the callee has promised to throw it away.\n\nThis is intentional. It lets you pass event handlers that happen to return something (like `() => setState(...)` which returns void, or `() => console.log(...)` which returns void) without TypeScript demanding you type each one as `() => undefined` explicitly.\n\nThe gotcha: if you want to enforce that the return value is used, `() => void` is the wrong type. You'd need `() => string` or `() => SomeResult`.",
      discover: `**Pattern — void vs never vs specific return:**
\`\`\`tsx
// ✅ () => void — I'll call it and ignore the return
interface DriverActionBarProps {
  onAssign: () => void;  // parent can pass () => 'ok' — TypeScript allows it
}

// ✅ () => string — I need the return value
interface SearchBarProps {
  formatQuery: () => string;  // parent must pass a function that returns string
}

// ✅ () => Promise<void> — async handler, parent must pass an async function
interface FormProps {
  onSubmit: () => Promise<void>;
}

// ❌ Function — broad, no argument checking, loses all type safety
interface BadProps {
  onAssign: Function;  // accepts (a: string, b: number) => Date — TypeScript won't warn
}
\`\`\``,
      quickRules: `**Quick rules:**
- ✅ use \`() => void\` for callbacks where the return value doesn't matter to the component
- ✅ use \`() => T\` when the component uses the return value
- ✅ use \`(arg: T) => void\` when the callback receives arguments from the component
- ❌ never use \`Function\` as a prop type — it bypasses all argument and return checking
- ❌ don't use \`() => undefined\` unless you explicitly need to forbid non-undefined returns`,
      watchOut:
        "👀 **Watch out:** The most common mistake with `() => void` is assuming it prevents the callback from doing side effects or returning values. It doesn't. It only says the component using the callback won't act on the return value. If you need to guarantee what the callback returns, type it explicitly.",
      dryRun:
        "🔁 **Think:** You have `onAssign: () => void` in your props. A parent passes `async () => { await assignDriver(driverId); }`. Does TypeScript accept this? An async function always returns a Promise — but the prop is typed as `() => void`. Does `() => void` block async functions from being passed? What would you need to change in the prop type if you actually want to await the result inside DriverActionBar?",
      build:
        "**Learning focus:** `() => void` is a consumer-side promise to ignore the return value, not a constraint on what the function returns — understanding this distinction prevents unexpected type errors and makes callback prop types legible.",
    },
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 5",
    paal: "Inside DriverActionBar, create a handleAssign function using useCallback that calls onAssign. The function depends on driverId and onAssign.",
    hint: "useCallback wraps a function definition. The dependency array must list every value the wrapped function closes over.",
    example_code: `const handleDeliver = useCallback(() => {
  onDeliver();
}, [packageId, onDeliver]);`,
    think_prompt:
      "The wrapped function calls onAssign. onAssign is a prop — it could change between renders if the parent recreates it. Should onAssign be in the dependency array?",
    mc_options: [
      "Only driverId in the dep array — onAssign is a prop and props don't change",
      "Both driverId and onAssign in the dep array — the function closes over both",
      "Empty dep array — the function should only be created once at mount",
    ],
    mc_correct_option:
      "Both driverId and onAssign in the dep array — the function closes over both",
    mc_anchor:
      "The wrapped function reads both driverId (to identify which driver) and onAssign (to call the parent handler). Both must be in the dependency array. Props can change if the parent re-renders with new values — assuming they can't is a stale closure bug.",
    why_this_matters:
      "In a fleet dashboard, the parent often passes a freshly bound handler: `onAssign={() => dispatch(assignDriver(driverId))}`. If handleAssign captures a stale reference to onAssign, it dispatches the wrong action. The eslint-plugin-react-hooks exhaustive-deps rule will flag this in CI.",
    answer_keywords: [
      "useCallback",
      "handleAssign",
      "onAssign",
      "[driverId",
      "onAssign]",
    ],
    evaluate: evalLesson46Step2,
    seed_code: `import { useCallback } from 'react';

interface DriverActionBarProps {
  driverId: string;
  onAssign: () => void;
  onSuspend: () => void;
}

const DriverActionBar = ({ driverId, onAssign, onSuspend }: DriverActionBarProps) => {
  return <div />;
};`,
    starter_code: `import { useCallback } from 'react';

interface DriverActionBarProps {
  driverId: string;
  onAssign: () => void;
  onSuspend: () => void;
}

const DriverActionBar = ({ driverId, onAssign, onSuspend }: DriverActionBarProps) => {
  // create handleAssign with useCallback — it should call onAssign()
  // dependency array: [driverId, onAssign]
  const handleAssign = /* your useCallback call here */;

  return <div />;
};`,
    feedback_correct:
      "Correct — both driverId and onAssign in the dependency array, function calls onAssign. handleAssign is now stable across renders where neither dep changes.",
    feedback_partial:
      "Check the dependency array — does it include both driverId and onAssign? A missing dep means handleAssign can call a stale version of onAssign.",
    feedback_wrong:
      "Pattern: `const handleAssign = useCallback(() => { onAssign(); }, [driverId, onAssign]);`",
    expected: `import { useCallback } from 'react';

interface DriverActionBarProps {
  driverId: string;
  onAssign: () => void;
  onSuspend: () => void;
}

const DriverActionBar = ({ driverId, onAssign, onSuspend }: DriverActionBarProps) => {
  const handleAssign = useCallback(() => {
    onAssign();
  }, [driverId, onAssign]);

  return <div />;
};`,
    analog_example: `const handleDeliver = useCallback(() => {
  onDeliver();
}, [packageId, onDeliver]);`,
    deepDiveLabel:
      "useCallback returns a stable function — so why doesn't React just make every function in a component stable automatically?",
    deepDive: {
      hook: "You've used useCallback correctly. handleAssign is stable. You pass it to a memoized button: `<AssignButton onClick={handleAssign} />`. You remove useCallback to see what happens. The profiler shows AssignButton re-renders on every parent render. You add useCallback back. AssignButton stops re-rendering unnecessarily.\n\nBut here's the question that nags: if stable references prevent re-renders, why doesn't React just make all function definitions inside a component stable by default? It could — it's just JavaScript. Why does it make you opt in?",
      pain: "⚠️ **Lesson:** Every function defined inside a component body is recreated on every render by default. That's not a bug — it's how JavaScript closures work. Why doesn't React automatically memoize them, and why is making you opt in the better choice?",
      mentalModel:
        "**Mental model — the Fresh Snapshot.**\n\nEvery render is a fresh snapshot of your component's state and props. Functions defined inside the component close over that snapshot — they see the values that existed when they were created. If React automatically reused function references across renders, those functions would close over stale snapshots. You'd get the old driverId, the old onAssign — silent correctness bugs with no error.\n\nuseCallback is a deliberate opt-in: 'I understand the dependency rules; I want this function to be stable within those rules.' Auto-memoization would silently break correctness. Manual opt-in keeps correctness the default.",
      discover: `**Pattern — useCallback vs plain function:**
\`\`\`tsx
// ✅ useCallback — stable reference, passed to React.memo child
const handleAssign = useCallback(() => {
  onAssign();
}, [driverId, onAssign]);

// ✅ plain function — fine when NOT passed to a React.memo child
const handleAssign = () => {
  onAssign();
};

// ❌ useCallback with wrong deps — stale closure, handleAssign calls old onAssign
const handleAssign = useCallback(() => {
  onAssign(); // captures the onAssign from the render when this was first created
}, []); // ← onAssign missing — eslint exhaustive-deps will flag this

// ❌ useCallback on every inline function — overhead without benefit
<button onClick={useCallback(() => setOpen(true), [])} />
\`\`\`
- useCallback is only useful when the function is passed to a React.memo child or used as a useEffect dep
- plain functions are correct and simpler for everything else`,
      quickRules: `**Quick rules:**
- ✅ use useCallback when passing a handler to a React.memo-wrapped component
- ✅ use useCallback when the function is a dependency of another useCallback or useEffect
- ✅ always list every closed-over value in the dependency array
- ❌ don't use useCallback for functions that are never passed as props
- ❌ don't use useCallback for inline JSX handlers — they're not stable regardless
- ❌ don't use useCallback as a workaround for missing React.memo — both are needed`,
      watchOut:
        "👀 **Watch out:** The stale closure bug from an empty dependency array is the most dangerous useCallback mistake. The function compiles, works on the first render, and silently calls the wrong version of onAssign or reads the wrong driverId on every subsequent render. The bug is invisible in development if state doesn't change much. It surfaces in production when users rapidly interact with the UI.",
      dryRun:
        "🔁 **Think:** You have `const handleAssign = useCallback(() => { onAssign(); }, [onAssign])`. driverId is NOT in the dep array. The parent re-renders with a new driverId — the driver being displayed has changed. Does handleAssign update? If your callback body was `() => { console.log(driverId); onAssign(); }` and driverId wasn't in deps, what would it log after the parent re-renders with a new driverId? What does that tell you about the dep array rule?",
      build:
        "**Learning focus:** useCallback keeps a function reference stable across renders by capturing its dependencies — understanding that every closed-over value must be in the dependency array to prevent stale closure bugs.",
    },
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 5",
    paal: "Add a second useCallback for handleSuspend that calls onSuspend. Use the same dependency pattern as handleAssign.",
    hint: "Two independent useCallback calls, each with their own dependency array. handleSuspend closes over driverId and onSuspend.",
    example_code: `const handleReturn = useCallback(() => {
  onReturn();
}, [packageId, onReturn]);`,
    think_prompt:
      "handleAssign and handleSuspend close over different prop callbacks. Should they share one useCallback or be separate?",
    mc_options: [
      "Combine them: `const handlers = useCallback({ assign: onAssign, suspend: onSuspend }, [...])`",
      "Two separate useCallback calls — each function has its own callback dependency",
      "One useCallback that conditionally calls onAssign or onSuspend based on an argument",
    ],
    mc_correct_option:
      "Two separate useCallback calls — each function has its own callback dependency",
    mc_anchor:
      "Each handler closes over a different callback prop. Separate useCallback calls keep their dependency arrays independent — if onAssign changes but onSuspend doesn't, only handleAssign needs to be recreated.",
    why_this_matters:
      "In a large action bar, different buttons may be connected to different Redux actions, different API calls, and different error handlers. Keeping handlers independent means a change to one never invalidates the reference of another — and memoized buttons that haven't changed don't re-render.",
    answer_keywords: [
      "useCallback",
      "handleSuspend",
      "onSuspend",
      "[driverId",
      "onSuspend]",
    ],
    evaluate: evalLesson46Step3,
    seed_code: `import { useCallback } from 'react';

interface DriverActionBarProps {
  driverId: string;
  onAssign: () => void;
  onSuspend: () => void;
}

const DriverActionBar = ({ driverId, onAssign, onSuspend }: DriverActionBarProps) => {
  const handleAssign = useCallback(() => {
    onAssign();
  }, [driverId, onAssign]);

  return <div />;
};`,
    starter_code: `import { useCallback } from 'react';

interface DriverActionBarProps {
  driverId: string;
  onAssign: () => void;
  onSuspend: () => void;
}

const DriverActionBar = ({ driverId, onAssign, onSuspend }: DriverActionBarProps) => {
  const handleAssign = useCallback(() => {
    onAssign();
  }, [driverId, onAssign]);

  // add handleSuspend with useCallback — same dependency pattern
  const handleSuspend = /* your useCallback call here */;

  return <div />;
};`,
    feedback_correct:
      "Exactly — two independent callbacks, each with their own dependency set. If onSuspend changes, handleSuspend updates; handleAssign stays stable.",
    feedback_partial:
      "You have handleSuspend but check whether it's wrapped in useCallback with [driverId, onSuspend] in the dependency array.",
    feedback_wrong:
      "Pattern: `const handleSuspend = useCallback(() => { onSuspend(); }, [driverId, onSuspend]);`",
    expected: `import { useCallback } from 'react';

interface DriverActionBarProps {
  driverId: string;
  onAssign: () => void;
  onSuspend: () => void;
}

const DriverActionBar = ({ driverId, onAssign, onSuspend }: DriverActionBarProps) => {
  const handleAssign = useCallback(() => {
    onAssign();
  }, [driverId, onAssign]);

  const handleSuspend = useCallback(() => {
    onSuspend();
  }, [driverId, onSuspend]);

  return <div />;
};`,
    analog_example: `const handleReturn = useCallback(() => {
  onReturn();
}, [packageId, onReturn]);

const handleFlag = useCallback(() => {
  onFlag();
}, [packageId, onFlag]);`,
    deepDiveLabel:
      "useMemo memoizes values, useCallback memoizes functions — but useCallback(fn, deps) is literally just useMemo(() => fn, deps). So why does React give it a separate name?",
    deepDive: {
      hook: "You're reviewing a PR. A colleague has replaced every `useCallback(fn, deps)` in the codebase with `useMemo(() => fn, deps)`. They point out that the React source code says useCallback is implemented as useMemo. The tests pass. The behaviour is identical. They ask: 'Should we just standardise on useMemo?' You need to give them an answer that holds up under scrutiny.",
      pain: "⚠️ **Lesson:** useCallback(fn, deps) and useMemo(() => fn, deps) are mechanically equivalent in React. Why does useCallback exist as a separate API if useMemo can do the same thing?",
      mentalModel:
        "**Mental model — the Vocabulary Distinction.**\n\nIn a codebase, names are communication. `useMemo` says: 'I am caching a computed value.' `useCallback` says: 'I am stabilising a function reference.' When you read `useMemo(() => handleAssign, deps)`, your brain has to parse it and realise it's returning a function — not a computed value. When you read `useCallback(() => handleAssign, deps)`, it's immediately clear: this is a handler, and it's being stabilised.\n\nuseCallback is a useMemo specialised for functions. The mechanical equivalence doesn't mean the conceptual equivalence. Code is read more often than it's written. useCallback makes the intent clear to the next reader without them having to figure out what the useMemo is returning.",
      discover: `**Pattern — useMemo vs useCallback:**
\`\`\`tsx
// ✅ useMemo — returning a computed value (object, array, primitive)
const stats = useMemo(() => ({
  count: shipments.length,
  totalWeight: shipments.reduce((sum, s) => sum + s.weight, 0),
}), [shipments]);

// ✅ useCallback — returning a stable function reference
const handleAssign = useCallback(() => {
  onAssign();
}, [driverId, onAssign]);

// ⚠️ technically correct but semantically confusing
const handleAssign = useMemo(() => () => {
  onAssign();
}, [driverId, onAssign]);
// — this works but forces the reader to parse a function-returning-a-function

// ❌ useCallback for a non-function — won't be what you want
const stats = useCallback({ count: 5 }, []);  // TypeError: not a function
\`\`\``,
      quickRules: `**Quick rules:**
- ✅ use useMemo when the memoized result is a value (object, array, string, number)
- ✅ use useCallback when the memoized result is a function (event handler, callback)
- ✅ both take a callback and a dependency array — the distinction is semantic, not mechanical
- ❌ don't use useMemo to memoize functions — it works but signals the wrong intent
- ❌ don't use useCallback to memoize values — it won't work (callbacks must be functions)`,
      watchOut:
        "👀 **Watch out:** The double-arrow pattern `useMemo(() => () => fn(), deps)` appears in older codebases written before React gave useCallback its own name. It's mechanically correct but a readability red flag. If you're reading code and see `useMemo(() => () => ...`, that's a useCallback waiting to be renamed — it's a function being returned from a memoized callback.",
      dryRun:
        "🔁 **Think:** You have a component with `const handleAssign = useCallback(() => onAssign(), [driverId, onAssign])`. You also have `const stats = useMemo(() => ({ count: shipments.length }), [shipments])`. A colleague rewrites both as `useMemo(() => () => onAssign(), [...])` and `useMemo(() => ({ count: shipments.length }), [...])`. Both work identically. What information does the reader lose when useCallback is replaced by useMemo — even though the runtime behaviour is identical?",
      build:
        "**Learning focus:** useCallback is useMemo specialised for functions — the distinction is semantic, not mechanical, and using the right hook makes the intent of the code immediately clear to the next reader.",
    },
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 5",
    paal: "Replace the placeholder return with JSX that renders two buttons — one calling handleAssign, one calling handleSuspend — as onClick handlers.",
    hint: "Assign the memoized handler directly to onClick. onClick={handleAssign} — not onClick={() => handleAssign()}.",
    example_code: `return (
  <div>
    <button onClick={handleDeliver}>Deliver</button>
    <button onClick={handleReturn}>Return</button>
  </div>
);`,
    think_prompt:
      "You have handleAssign as a stable function reference. The onClick attribute takes a function. Should you write onClick={handleAssign} or onClick={() => handleAssign()}? What's the difference?",
    mc_options: [
      "onClick={() => handleAssign()}  — wrap it to be safe",
      "onClick={handleAssign}  — pass the reference directly",
      "onClick={handleAssign()}  — call it immediately to register the handler",
    ],
    mc_correct_option: "onClick={handleAssign}  — pass the reference directly",
    mc_anchor:
      "Pass the function reference directly. `onClick={handleAssign}` tells React 'call this function when clicked.' `onClick={() => handleAssign()}` creates a new arrow function on every render — destroying the stability useCallback just provided. `onClick={handleAssign()}` calls the function immediately during render, which is a bug.",
    why_this_matters:
      "Wrapping a memoized handler in an arrow function is the most common way to accidentally defeat useCallback. The inline wrapper is a new function reference every render — React.memo on the button sees a changed prop and re-renders regardless. The entire memoization chain is silently broken.",
    answer_keywords: [
      "onClick",
      "handleAssign",
      "handleSuspend",
      "button",
      "return",
    ],
    evaluate: evalLesson46Step4,
    seed_code: `import { useCallback } from 'react';

interface DriverActionBarProps {
  driverId: string;
  onAssign: () => void;
  onSuspend: () => void;
}

const DriverActionBar = ({ driverId, onAssign, onSuspend }: DriverActionBarProps) => {
  const handleAssign = useCallback(() => {
    onAssign();
  }, [driverId, onAssign]);

  const handleSuspend = useCallback(() => {
    onSuspend();
  }, [driverId, onSuspend]);

  return <div />;
};`,
    starter_code: `import { useCallback } from 'react';

interface DriverActionBarProps {
  driverId: string;
  onAssign: () => void;
  onSuspend: () => void;
}

const DriverActionBar = ({ driverId, onAssign, onSuspend }: DriverActionBarProps) => {
  const handleAssign = useCallback(() => {
    onAssign();
  }, [driverId, onAssign]);

  const handleSuspend = useCallback(() => {
    onSuspend();
  }, [driverId, onSuspend]);

  return (
    <div>
      {/* two buttons — one for handleAssign, one for handleSuspend */}
      {/* pass the function reference directly to onClick */}
    </div>
  );
};`,
    feedback_correct:
      "Exactly — function references passed directly, not wrapped in arrows. The stable references from useCallback are preserved all the way to the DOM.",
    feedback_partial:
      "Check the onClick syntax — are you passing the reference directly (`onClick={handleAssign}`) or accidentally wrapping it in an arrow (`onClick={() => handleAssign()}`)?",
    feedback_wrong:
      "Pattern: `<button onClick={handleAssign}>Assign</button>` and `<button onClick={handleSuspend}>Suspend</button>` — no parentheses on the function name, no wrapping arrow.",
    expected: `import { useCallback } from 'react';

interface DriverActionBarProps {
  driverId: string;
  onAssign: () => void;
  onSuspend: () => void;
}

const DriverActionBar = ({ driverId, onAssign, onSuspend }: DriverActionBarProps) => {
  const handleAssign = useCallback(() => {
    onAssign();
  }, [driverId, onAssign]);

  const handleSuspend = useCallback(() => {
    onSuspend();
  }, [driverId, onSuspend]);

  return (
    <div>
      <button onClick={handleAssign}>Assign</button>
      <button onClick={handleSuspend}>Suspend</button>
    </div>
  );
};`,
    analog_example: `return (
  <div>
    <button onClick={handleDeliver}>Deliver</button>
    <button onClick={handleReturn}>Return</button>
  </div>
);`,
    deepDiveLabel:
      "onClick={handleAssign} and onClick={() => handleAssign()} both work — so when would you actually choose the wrapper?",
    deepDive: {
      hook: "The rule 'always pass the reference directly' seems absolute. Then a new requirement: the Suspend button needs to pass the driverId to onSuspend. onSuspend's signature changes to `(id: string) => void`. Now you can't write `onClick={handleSuspend}` because React passes a MouseEvent, not a string. You need the wrapper.\n\nThe rule wasn't wrong — you just hit the case it was designed to handle explicitly.",
      pain: "⚠️ **Lesson:** `onClick={handleFn}` passes the function reference. React calls it with a MouseEvent as the argument. If your handler needs a specific argument that isn't a MouseEvent, you need a wrapper — but that wrapper creates a new reference every render. How do you solve this without defeating useCallback?",
      mentalModel:
        "**Mental model — the Adapter.**\n\nThe wrapper arrow function is an adapter between React's calling convention (MouseEvent) and your handler's calling convention (driverId). When you need an adapter, the question is: should the adapter live inside useCallback, or outside it?\n\nIf it lives inside: `useCallback(() => onSuspend(driverId), [driverId, onSuspend])` — the adapter is stable, recreated only when driverId changes. The onClick gets a stable reference.\n\nIf it lives outside: `onClick={() => handleSuspend()}` — the adapter is a new function every render, the stability from useCallback is lost.",
      discover: `**Pattern — argument passing with useCallback:**
\`\`\`tsx
// ✅ driverId is already in the closure — pass reference directly
const handleSuspend = useCallback(() => {
  onSuspend(driverId);  // driverId captured from scope
}, [driverId, onSuspend]);

<button onClick={handleSuspend}>Suspend</button>

// ✅ when you genuinely need the event — accept it in the wrapper
const handleKeyDown = useCallback((e: KeyboardEvent) => {
  if (e.key === 'Enter') onAssign();
}, [onAssign]);

<input onKeyDown={handleKeyDown} />

// ❌ adapter outside useCallback — defeats the stable reference
const handleSuspend = useCallback(() => onSuspend(driverId), [driverId, onSuspend]);
<button onClick={() => handleSuspend()}>Suspend</button>
//                 ↑ new function every render — useCallback's work is wasted
\`\`\``,
      quickRules: `**Quick rules:**
- ✅ pass the function reference directly when no argument transformation is needed
- ✅ capture needed values inside the useCallback body — they're in the closure
- ✅ when you need the DOM event, accept it as an argument inside useCallback
- ❌ never wrap a memoized handler in an inline arrow for the onClick prop — it creates a new reference every render
- ❌ don't use useCallback if you'll always wrap it inline — the optimization is wasted`,
      watchOut:
        "👀 **Watch out:** `onClick={() => handleAssign()}` is the single most common useCallback anti-pattern. It looks innocuous — 'I'm just being explicit.' But it creates a new function on every render. React.memo on the button sees a changed onClick prop and re-renders. You've added useCallback overhead without getting the stability benefit. If you catch yourself writing this pattern, move the logic inside the useCallback body instead.",
      dryRun:
        "🔁 **Think:** You have `const handleSuspend = useCallback(() => onSuspend(driverId), [driverId, onSuspend])`. driverId is 'DRV-042'. The parent re-renders with a new driverId 'DRV-099'. Does useCallback recreate handleSuspend? If you changed the dep array to `[onSuspend]` and removed driverId, what would handleSuspend call onSuspend with after the driverId changes? What is that called?",
      build:
        "**Learning focus:** Pass memoized handlers directly to onClick — wrapping them in an inline arrow defeats the stable reference useCallback provides, and needed arguments should be captured inside the useCallback closure instead.",
    },
  },
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 5",
    paal: "Export DriverActionBar as the default export.",
    hint: "One line at the bottom — export default followed by the component name.",
    example_code: `export default PackageControl;`,
    think_prompt:
      "The component is complete. What is the single line that makes DriverActionBar importable as a default export?",
    mc_options: [
      "module.exports = DriverActionBar  — CommonJS syntax",
      "export { DriverActionBar }  — named export syntax",
      "export default DriverActionBar  — default export syntax",
    ],
    mc_correct_option: "export default DriverActionBar  — default export syntax",
    mc_anchor:
      "Default export makes the component importable with any name the consumer chooses. Named export requires the exact identifier. React component files follow the convention of one primary default export.",
    why_this_matters:
      "Tree-shaking, lazy loading, and code-splitting all rely on the module system working correctly. A component exported correctly is a component that can be split into its own chunk without manual configuration.",
    answer_keywords: ["export", "default", "DriverActionBar"],
    evaluate: evalLesson46Step5,
    seed_code: `import { useCallback } from 'react';

interface DriverActionBarProps {
  driverId: string;
  onAssign: () => void;
  onSuspend: () => void;
}

const DriverActionBar = ({ driverId, onAssign, onSuspend }: DriverActionBarProps) => {
  const handleAssign = useCallback(() => {
    onAssign();
  }, [driverId, onAssign]);

  const handleSuspend = useCallback(() => {
    onSuspend();
  }, [driverId, onSuspend]);

  return (
    <div>
      <button onClick={handleAssign}>Assign</button>
      <button onClick={handleSuspend}>Suspend</button>
    </div>
  );
};`,
    starter_code: `import { useCallback } from 'react';

interface DriverActionBarProps {
  driverId: string;
  onAssign: () => void;
  onSuspend: () => void;
}

const DriverActionBar = ({ driverId, onAssign, onSuspend }: DriverActionBarProps) => {
  const handleAssign = useCallback(() => {
    onAssign();
  }, [driverId, onAssign]);

  const handleSuspend = useCallback(() => {
    onSuspend();
  }, [driverId, onSuspend]);

  return (
    <div>
      <button onClick={handleAssign}>Assign</button>
      <button onClick={handleSuspend}>Suspend</button>
    </div>
  );
};

// export DriverActionBar as the default export`,
    feedback_correct:
      "Complete — DriverActionBar is exported. Two stable handlers, two buttons, zero unnecessary re-renders for memoized consumers.",
    feedback_partial:
      "Almost — make sure it's `export default DriverActionBar` not a named export.",
    feedback_wrong:
      "Add `export default DriverActionBar;` as the last line of the file.",
    expected: `import { useCallback } from 'react';

interface DriverActionBarProps {
  driverId: string;
  onAssign: () => void;
  onSuspend: () => void;
}

const DriverActionBar = ({ driverId, onAssign, onSuspend }: DriverActionBarProps) => {
  const handleAssign = useCallback(() => {
    onAssign();
  }, [driverId, onAssign]);

  const handleSuspend = useCallback(() => {
    onSuspend();
  }, [driverId, onSuspend]);

  return (
    <div>
      <button onClick={handleAssign}>Assign</button>
      <button onClick={handleSuspend}>Suspend</button>
    </div>
  );
};

export default DriverActionBar;`,
    analog_example: `export default PackageControl;`,
    deepDiveLabel:
      "useCallback stabilises function references — so why can't you just move the handler outside the component to avoid the problem entirely?",
    deepDive: {
      hook: "You decide to sidestep useCallback entirely by defining the handlers outside the component. No closure, no dependency array, completely stable reference. You write:\n\n```tsx\nconst handleAssign = () => { onAssign(); };\n\nconst DriverActionBar = ({ driverId, onAssign, onSuspend }) => { ... };\n```\n\nTypeScript immediately shows an error: `onAssign` is not defined. You realise you've just moved the function outside where the prop is accessible. You're stuck.",
      pain: "⚠️ **Lesson:** Moving a handler outside the component makes it stable — but breaks access to props and state. Why can't you have both stability and access to props without useCallback?",
      mentalModel:
        "**Mental model — the Scope Boundary.**\n\nA component is a scope boundary. Props and state only exist inside that scope — they're passed in as arguments on each render. A function defined outside the component is in a different scope — it has no access to props or state.\n\nuseCallback is the bridge: it lets you define a function inside the component scope (so it has access to everything) but keep its reference stable across renders (so it doesn't invalidate children). It's not a workaround — it's the engineered solution to the tension between closure access and referential stability.",
      discover: `**Pattern — scope and stability:**
\`\`\`tsx
// ❌ outside the component — stable reference but no access to props
const handleAssign = () => {
  onAssign(); // ReferenceError: onAssign is not defined
};

const DriverActionBar = ({ onAssign }) => { ... };

// ❌ inside, no memo — unstable reference, new function every render
const DriverActionBar = ({ onAssign }) => {
  const handleAssign = () => onAssign(); // new reference on every render
  return <button onClick={handleAssign} />;
};

// ✅ inside with useCallback — stable reference AND access to props
const DriverActionBar = ({ onAssign, driverId }) => {
  const handleAssign = useCallback(() => onAssign(), [driverId, onAssign]);
  return <button onClick={handleAssign} />;
};

// ✅ pure utility functions — DO belong outside the component
const formatDriverId = (id: string) => \`DRV-\${id.toUpperCase()}\`;
// no props/state needed — stable by definition, no useCallback required
\`\`\``,
      quickRules: `**Quick rules:**
- ✅ define pure utility functions (no props/state) outside the component — stable by definition
- ✅ define event handlers that close over props/state inside the component with useCallback
- ❌ don't move prop-dependent handlers outside the component — they lose prop access
- ❌ don't put logic that doesn't depend on props/state inside useCallback — just move it outside`,
      watchOut:
        "👀 **Watch out:** The most common misapplication of 'move it outside' is moving a function that looks independent but actually reads a config constant or a helper that will eventually need to read a prop. The function gets defined outside, works fine, then a new requirement adds a prop dependency — and now it needs to move back inside and get wrapped in useCallback. Define outside only when you're certain the function has no prop or state dependency — now or in the foreseeable future.",
      dryRun:
        "🔁 **Think:** You have a DriverActionBar where the handleAssign callback needs to log the driverId alongside calling onAssign. You consider three options: (A) define handleAssign outside the component and pass driverId as an argument; (B) define it inside with `useCallback(() => { console.log(driverId); onAssign(); }, [driverId, onAssign])`; (C) define it inside without useCallback. Which options give you access to driverId? Of those, which preserves referential stability? What's the trade-off in option (C)?",
      build:
        "**Learning focus:** useCallback is the solution to the tension between closure access (needing props/state inside the function) and referential stability (needing the function reference not to change) — moving handlers outside the component solves stability but breaks access.",
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
  lessonNum: 46,
  title: "useCallback — Stable Function References",
  shortName: "useCallback — DRIVER ACTION BAR",
});
