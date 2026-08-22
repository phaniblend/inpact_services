import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
{
  id: "intro",
  type: "reveal",
  phase: "Lesson",
  content: {
    tag: "LESSON #24 (React Hooks)",
    title: "useEffect — Mount",
    body: "This lesson focuses on the first slice of the effect lifecycle: running code when a component mounts, and choosing an empty dependency array so the effect does not re-run on every render. useEffect runs after paint — after React commits your JSX to the DOM — which is the safe window for browser APIs, logging, and one-time subscriptions that should not fire again unless dependencies truly change.",
    usecase:
      "When a shipment detail view opens, you want to set document.title once, register a short-lived analytics beacon, or attach a non-React listener to a DOM node. Those are mount-time side effects: they should not repeat on unrelated re-renders, so you start with the empty dependency array pattern and build intuition before layering dependency-driven updates in the next lesson.",
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
  ],
},
{
  id: "objectives",
  type: "objectives",
  phase: "Objectives",
  items: [
    "Explain why useEffect callbacks run after paint rather than during render",
    "Write a mount-only effect using `useEffect(() => { ... }, [])`",
    "Contrast omitting the dependency array, passing an empty array, and listing dependencies",
    "Return a cleanup function from an effect and recognise when it runs on unmount",
    "Prepare for the next lesson by identifying every value inside an effect that should become a dependency",
  ],
},
{
  id: "step1",
  type: "question",
  phase: "Step 1 of 5",
  paal: "Write a useEffect that updates document.title to 'Shipment: {shipmentId}' after every render. No dependency array.",
  hint: "useEffect takes a function. Without a dependency array, it runs after every render — on mount and on every update. This is the most basic form.",
  example_code: `useEffect(() => {
  document.title = \`Order: \${orderId}\`;
});`,
  think_prompt:
    "document.title is a browser API — not part of React's component tree. Where in the component lifecycle should you update it — and what is the basic useEffect signature?",
  mc_options: [
    "document.title = `Shipment: ${shipmentId}`; // directly in the component body",
    "useEffect(() => { document.title = `Shipment: ${shipmentId}`; });",
    "useEffect(document.title = `Shipment: ${shipmentId}`);",
  ],
  mc_correct_option:
    "useEffect(() => { document.title = `Shipment: ${shipmentId}`; });",
  mc_anchor:
    "useEffect takes a callback function — not an expression. Putting the assignment directly in the component body runs it during render which can cause issues with React's concurrent rendering mode. The third option passes the result of the assignment (undefined) as the callback — useEffect receives undefined, not a function, and errors.",
  why_this_matters:
    "Side effects (anything that reaches outside React's rendering — DOM APIs, browser APIs, network requests) belong in useEffect, not in the component body. The component body should be a pure function that maps props and state to JSX. useEffect is the escape hatch for everything else.",
  answer_keywords: ["useEffect", "document.title", "shipmentId", "() =>"],
  seed_code: `import { useEffect } from 'react';

interface ShipmentDetailProps {
  shipmentId: string;
}`,
  starter_code: `import { useEffect } from 'react';

interface ShipmentDetailProps {
  shipmentId: string;
}

const ShipmentDetail = ({ shipmentId }: ShipmentDetailProps): JSX.Element => {
  // add useEffect to update document.title after every render

  return (
    <div>
      <h2>Shipment {shipmentId}</h2>
    </div>
  );
};`,
  feedback_correct:
    "Exactly — useEffect with a callback and no dependency array runs after every render. document.title updates whenever shipmentId changes (or any other state/prop causes a re-render).",
  feedback_partial:
    "Close — make sure you're passing a function to useEffect: `useEffect(() => { ... })`, not the expression result directly.",
  feedback_wrong:
    "Add `useEffect(() => { document.title = \\`Shipment: ${shipmentId}\\`; })` inside the component, after any state declarations but before the return.",
  expected: `import { useEffect } from 'react';

interface ShipmentDetailProps {
  shipmentId: string;
}

const ShipmentDetail = ({ shipmentId }: ShipmentDetailProps): JSX.Element => {
  useEffect(() => {
    document.title = \`Shipment: \${shipmentId}\`;
  });

  return (
    <div>
      <h2>Shipment {shipmentId}</h2>
    </div>
  );
};`,
  analog_example: `useEffect(() => {
  document.title = \`Order #\${orderId} — Dashboard\`;
});`,
  deepDiveLabel:
    "No dependency array — but when does this run, exactly? And what's the problem with running on every render?",
  deepDive: {
    hook: "No dependency array means the effect runs after every render. You add a console.log inside: 'effect ran'. The component re-renders because an unrelated button was clicked. The log appears. The document.title was already correct — but the effect ran again anyway.",
    pain: "⚠️ **Lesson:** useEffect with no dependency array runs after every single render — even renders caused by unrelated state changes. When is that actually what you want — and when does it cause problems?",
    mentalModel:
      "**Three dependency array modes:**\n\n1. **No array** `useEffect(() => { ... })`: runs after every render.\n   - When to use: genuinely need to sync with every render (rare). Usually not what you want — effects run more than needed.\n\n2. **Empty array** `useEffect(() => { ... }, [])`: runs once on mount.\n   - When to use: one-time setup (event listeners, fetch initial data, subscriptions).\n\n3. **Specific deps** `useEffect(() => { ... }, [dep1, dep2])`: runs when deps change.\n   - When to use: sync a browser API or external state with a specific React value.\n   - This is what document.title should use: `[shipmentId]`.",
    discover:
      "```tsx\n// ❌ no array — runs on every render, including unrelated ones\nuseEffect(() => { document.title = `Shipment: ${shipmentId}`; });\n\n// ✅ dep array — runs only when shipmentId changes\nuseEffect(() => { document.title = `Shipment: ${shipmentId}`; }, [shipmentId]);\n\n// ✅ empty array — runs once on mount\nuseEffect(() => { initAnalytics(); }, []);\n```",
    quickRules:
      "- ✅ `[dep]`: sync with a specific value — most common\n- ✅ `[]`: one-time mount setup\n- ⚠️ no array: runs every render — rarely what you want\n- ❌ missing deps from array — stale closure bugs",
    watchOut:
      "👀 **Watch out:** No dependency array is NOT the same as empty array. No array = every render. Empty array = mount only. This is the most common useEffect confusion in React codebases.",
    dryRun:
      "🔁 **Think:** The component has a counter state and the document.title effect with no array. The user clicks a button that increments the counter. The component re-renders. Does the document.title effect run? Is it necessary for it to run?",
    build:
      "**Learning focus:** Write a basic useEffect for browser API side effects — understanding the three dependency array modes and why no array (runs every render) is usually not what you want.",
  },
},
{
  id: "step2",
  type: "question",
  phase: "Step 2 of 5",
  paal: "Update the useEffect to include shipmentId in the dependency array. The effect should only re-run when shipmentId changes.",
  hint: "Add `[shipmentId]` as the second argument to useEffect. React compares each dependency with its previous value — if any changed, the effect re-runs.",
  example_code: `useEffect(() => {
  document.title = \`Order: \${orderId}\`;
}, [orderId]);`,
  think_prompt:
    "The effect only needs to run when shipmentId changes — not when unrelated state changes. What do you add to useEffect to tell React exactly which values it depends on?",
  mc_options: [
    "useEffect(() => { document.title = `...`; }); // no array",
    "useEffect(() => { document.title = `...`; }, []); // empty array",
    "useEffect(() => { document.title = `...`; }, [shipmentId]); // dep array",
  ],
  mc_correct_option:
    "useEffect(() => { document.title = `...`; }, [shipmentId]); // dep array",
  mc_anchor:
    "The dependency array `[shipmentId]` tells React: re-run this effect whenever shipmentId changes. Empty array means run once on mount — if shipmentId changes later, the title never updates. No array means run on every render — unnecessary re-runs when other state changes.",
  why_this_matters:
    "The dependency array is the core of useEffect's performance and correctness model. Including the right dependencies ensures the effect runs exactly when needed — not more, not less. Missing a dependency causes stale data bugs. Including irrelevant values causes unnecessary re-runs.",
  answer_keywords: ["useEffect", "shipmentId", "[shipmentId]", "dependency"],
  seed_code: `import { useEffect } from 'react';

interface ShipmentDetailProps {
  shipmentId: string;
}

const ShipmentDetail = ({ shipmentId }: ShipmentDetailProps): JSX.Element => {
  useEffect(() => {
    document.title = \`Shipment: \${shipmentId}\`;
  });

  return (
    <div>
      <h2>Shipment {shipmentId}</h2>
    </div>
  );
};`,
  starter_code: `import { useEffect } from 'react';

interface ShipmentDetailProps {
  shipmentId: string;
}

const ShipmentDetail = ({ shipmentId }: ShipmentDetailProps): JSX.Element => {
  // update the dependency array to [shipmentId]
  useEffect(() => {
    document.title = \`Shipment: \${shipmentId}\`;
  });

  return (
    <div>
      <h2>Shipment {shipmentId}</h2>
    </div>
  );
};`,
  feedback_correct:
    "Exactly — `[shipmentId]` tells React to re-run the effect only when shipmentId changes. Unrelated state changes no longer trigger unnecessary title updates.",
  feedback_partial:
    "Close — add the dependency array as the second argument to useEffect: `}, [shipmentId]);` after the closing brace of the callback.",
  feedback_wrong:
    "Add `[shipmentId]` as the second argument: `useEffect(() => { document.title = \\`Shipment: ${shipmentId}\\`; }, [shipmentId]);`",
  expected: `import { useEffect } from 'react';

interface ShipmentDetailProps {
  shipmentId: string;
}

const ShipmentDetail = ({ shipmentId }: ShipmentDetailProps): JSX.Element => {
  useEffect(() => {
    document.title = \`Shipment: \${shipmentId}\`;
  }, [shipmentId]);

  return (
    <div>
      <h2>Shipment {shipmentId}</h2>
    </div>
  );
};`,
  analog_example: `useEffect(() => {
  document.title = \`Order #\${orderId} | Dashboard\`;
}, [orderId]);`,
  deepDiveLabel:
    "Dependency array controls when effects run — what happens when you lie to React about dependencies?",
  deepDive: {
    hook: "The ESLint rule `react-hooks/exhaustive-deps` flags a warning: 'React Hook useEffect has a missing dependency: userId'. You suppress the warning with a comment. The effect uses userId but it's not in the array — so it reads the initial render's userId forever, even after userId changes. Users see another user's shipments. Bug filed.",
    pain: "⚠️ **Lesson:** The exhaustive-deps rule demands every value used inside useEffect appears in the dependency array. Omitting a dependency causes a stale closure bug. What exactly is a stale closure and why does it happen?",
    mentalModel:
      "Every time the component renders, the useEffect callback is a new function — a closure that captures the current values of variables in scope. The dependency array tells React which closure to keep.\n\n- With `[shipmentId]`: React uses a new closure whenever shipmentId changes. The closure always has the current shipmentId.\n- With `[]`: React uses the closure from the first render forever. That closure captured shipmentId at mount time. If shipmentId changes later, the closure still has the old value — a stale closure.\n\n```tsx\n// ❌ stale closure — userId from first render, never updates\nuseEffect(() => {\n  fetchShipments(userId); // always uses initial userId\n}, []); // userId missing from deps\n\n// ✅ fresh closure — userId always current\nuseEffect(() => {\n  fetchShipments(userId);\n}, [userId]);\n```",
    discover:
      "```tsx\n// The exhaustive-deps rule catches this:\nuseEffect(() => {\n  console.log(shipmentId); // uses shipmentId\n}, []); // ❌ ESLint: missing dependency 'shipmentId'\n\n// Fix: add to deps\nuseEffect(() => {\n  console.log(shipmentId);\n}, [shipmentId]); // ✅\n```",
    quickRules:
      "- ✅ always include every value used inside the effect in the dependency array\n- ✅ use the exhaustive-deps ESLint rule — it catches missing deps automatically\n- ❌ suppressing exhaustive-deps warnings — almost always a bug waiting to happen\n- ❌ listing deps you don't use — causes unnecessary re-runs\n- if a dep changes too frequently: useRef, useCallback, or restructure the effect",
    watchOut:
      "👀 **Watch out:** Objects and functions are new references on every render — adding them to the dependency array causes the effect to re-run on every render (defeating the purpose of the array). Use useCallback for functions and useMemo for objects that you want stable references for.",
    dryRun:
      "🔁 **Think:** userId is 'user-001' on mount. Effect runs with `[userId]`: fetchShipments('user-001'). User logs out, userId becomes 'user-002'. React compares 'user-001' !== 'user-002' — does the effect re-run? Now userId is `[]` (empty array). User changes — does the effect re-run? What value does userId have inside the effect?",
    build:
      "**Learning focus:** Add the dependency array to run the effect only when specific values change — understanding that missing deps cause stale closure bugs.",
  },
},
{
  id: "step3",
  type: "question",
  phase: "Step 3 of 5",
  paal: "Add a second useEffect with an empty dependency array that logs 'ShipmentDetail mounted' to the console. This should run only once when the component first appears.",
  hint: "Empty dependency array `[]` means the effect runs once — on mount. It never re-runs because there are no dependencies that can change.",
  example_code: `useEffect(() => {
  console.log('Component mounted');
  initAnalytics();
}, []); // empty array — runs once on mount`,
  think_prompt:
    "This log should fire exactly once — when the component first appears in the DOM. It should not fire again when props change or state updates. What dependency array produces that behaviour?",
  mc_options: [
    "useEffect(() => { console.log('mounted'); }); // no array",
    "useEffect(() => { console.log('mounted'); }, []); // empty array",
    "useEffect(() => { console.log('mounted'); }, [null]); // null dep",
  ],
  mc_correct_option:
    "useEffect(() => { console.log('mounted'); }, []); // empty array",
  mc_anchor:
    "Empty array `[]` means 'no dependencies' — React has nothing to compare, so the effect only runs on the first render (mount). No array runs on every render. `[null]` is an actual dependency (the value null) — React compares null to null on every render, but it's not the correct semantic intention and can confuse the exhaustive-deps linter.",
  why_this_matters:
    "Mount-only effects are the standard pattern for: initialising analytics, setting up event listeners, fetching initial data, connecting to WebSockets, registering service workers. The empty array is how you say 'this happens once when the component appears'.",
  answer_keywords: ["useEffect", "[]", "mounted", "once"],
  seed_code: `import { useEffect } from 'react';

interface ShipmentDetailProps {
  shipmentId: string;
}

const ShipmentDetail = ({ shipmentId }: ShipmentDetailProps): JSX.Element => {
  useEffect(() => {
    document.title = \`Shipment: \${shipmentId}\`;
  }, [shipmentId]);

  return (
    <div>
      <h2>Shipment {shipmentId}</h2>
    </div>
  );
};`,
  starter_code: `import { useEffect } from 'react';

interface ShipmentDetailProps {
  shipmentId: string;
}

const ShipmentDetail = ({ shipmentId }: ShipmentDetailProps): JSX.Element => {
  useEffect(() => {
    document.title = \`Shipment: \${shipmentId}\`;
  }, [shipmentId]);

  // add a second useEffect that logs 'ShipmentDetail mounted' once on mount

  return (
    <div>
      <h2>Shipment {shipmentId}</h2>
    </div>
  );
};`,
  feedback_correct:
    "Exactly — the empty array means no dependencies to watch, so the effect runs once when the component mounts and never again.",
  feedback_partial:
    "Close — make sure the dependency array is `[]` (empty), not missing (no array) and not `[null]`. Only `[]` produces the 'run once on mount' behaviour.",
  feedback_wrong:
    "Add `useEffect(() => { console.log('ShipmentDetail mounted'); }, []);` — the empty array is the second argument.",
  expected: `import { useEffect } from 'react';

interface ShipmentDetailProps {
  shipmentId: string;
}

const ShipmentDetail = ({ shipmentId }: ShipmentDetailProps): JSX.Element => {
  useEffect(() => {
    document.title = \`Shipment: \${shipmentId}\`;
  }, [shipmentId]);

  useEffect(() => {
    console.log('ShipmentDetail mounted');
  }, []);

  return (
    <div>
      <h2>Shipment {shipmentId}</h2>
    </div>
  );
};`,
  analog_example: `useEffect(() => {
  analytics.track('page_view', { page: 'orders' });
}, []);`,
  deepDiveLabel:
    "Empty array runs once on mount — but React 18 StrictMode runs effects twice. Why?",
  deepDive: {
    hook: "You add `console.log('mounted')` inside a `[]` effect. In development, it logs twice. You expected once. You check whether you accidentally have two useEffect calls — you don't. The component is definitely only in the DOM once.",
    pain: "⚠️ **Lesson:** React 18 StrictMode intentionally mounts, unmounts, and remounts components in development. Why — and does this happen in production?",
    mentalModel:
      "React 18 StrictMode double-invokes effects in development to help you find bugs in cleanup logic:\n1. Mount → run setup (effect fires)\n2. Unmount → run cleanup (cleanup fires)\n3. Remount → run setup again (effect fires again)\n\nThis simulates React's future ability to remount components while preserving state — a feature called 'offscreen rendering'. If your mount-only effect causes a bug on the second mount (like registering the same event listener twice), StrictMode exposes it in development so you fix it before production.\n\nIn production: StrictMode's double-invoke does NOT happen. Effects run once on mount.",
    discover:
      "```tsx\n// ✅ cleanup prevents double-registration bug\nuseEffect(() => {\n  const handler = () => console.log('resized');\n  window.addEventListener('resize', handler);\n  return () => window.removeEventListener('resize', handler); // cleanup\n}, []);\n\n// ❌ no cleanup — double-registers in StrictMode (and real remounts)\nuseEffect(() => {\n  window.addEventListener('resize', handler); // registered twice in dev!\n}, []);\n```",
    quickRules:
      "- ✅ StrictMode double-invoke: development only, finds cleanup bugs\n- ✅ production: effects run once on mount with `[]`\n- ✅ always add cleanup for: event listeners, intervals, subscriptions, WebSockets\n- ❌ ignoring StrictMode double-invoke — it's exposing a real bug",
    watchOut:
      "👀 **Watch out:** If your mount effect makes an API call, StrictMode causes two requests in development. This is intentional — React wants your code to handle the case where a request fires, the component unmounts, and then remounts. The cleanup function should cancel in-flight requests (AbortController).",
    dryRun:
      "🔁 **Think:** A `[]` effect registers a window.resize listener. StrictMode mounts the component. Setup runs — listener registered. Unmount — cleanup runs (if written). Remount — setup runs again. Without cleanup: how many resize listeners are registered after the StrictMode cycle? With cleanup: how many?",
    build:
      "**Learning focus:** Use empty array for mount-only effects — understanding that StrictMode's double-invoke in development is intentional and reveals cleanup bugs.",
  },
},
{
  id: "step4",
  type: "question",
  phase: "Step 4 of 5",
  paal: "Add a cleanup function to the shipmentId-dependent effect. When the component unmounts or before the effect re-runs, restore document.title to the default 'Shipment Dashboard'.",
  hint: "Return a function from the useEffect callback. React calls this function before the next effect run and when the component unmounts.",
  example_code: `useEffect(() => {
  document.title = \`Order: \${orderId}\`;
  return () => {
    document.title = 'Dashboard'; // restore on unmount
  };
}, [orderId]);`,
  think_prompt:
    "When the user navigates away from the shipment detail, the browser tab should show the default title. Where in the useEffect do you put the restore logic — and when does React call it?",
  mc_options: [
    "useEffect(() => { document.title = ...; document.title = 'Shipment Dashboard'; }, [shipmentId]);",
    "useEffect(() => { document.title = ...; return () => { document.title = 'Shipment Dashboard'; }; }, [shipmentId]);",
    "useEffect(() => { document.title = ...; }, [shipmentId]); useEffect(() => { return () => { document.title = 'Shipment Dashboard'; }; }, []);",
  ],
  mc_correct_option:
    "useEffect(() => { document.title = ...; return () => { document.title = 'Shipment Dashboard'; }; }, [shipmentId]);",
  mc_anchor:
    "Returning a cleanup function from the effect callback is the useEffect cleanup pattern. React calls the returned function before running the effect again (when shipmentId changes) and when the component unmounts. Setting document.title at the end of the setup function (option 1) runs immediately after the first assignment, overwriting it. Splitting across two effects (option 3) works but is unnecessarily complex — the cleanup belongs with the effect it's cleaning up.",
  why_this_matters:
    "Cleanup functions prevent resource leaks and side effect artifacts — event listeners that fire after unmount, intervals that keep running, subscriptions that deliver data to unmounted components. Restoring document.title is a simple but representative example of this pattern.",
  answer_keywords: ["return", "() =>", "document.title", "Shipment Dashboard", "cleanup"],
  seed_code: `import { useEffect } from 'react';

interface ShipmentDetailProps {
  shipmentId: string;
}

const ShipmentDetail = ({ shipmentId }: ShipmentDetailProps): JSX.Element => {
  useEffect(() => {
    document.title = \`Shipment: \${shipmentId}\`;
  }, [shipmentId]);

  useEffect(() => {
    console.log('ShipmentDetail mounted');
  }, []);

  return (
    <div>
      <h2>Shipment {shipmentId}</h2>
    </div>
  );
};`,
  starter_code: `import { useEffect } from 'react';

interface ShipmentDetailProps {
  shipmentId: string;
}

const ShipmentDetail = ({ shipmentId }: ShipmentDetailProps): JSX.Element => {
  useEffect(() => {
    document.title = \`Shipment: \${shipmentId}\`;
    // return a cleanup function that restores document.title to 'Shipment Dashboard'
  }, [shipmentId]);

  useEffect(() => {
    console.log('ShipmentDetail mounted');
  }, []);

  return (
    <div>
      <h2>Shipment {shipmentId}</h2>
    </div>
  );
};`,
  feedback_correct:
    "Exactly — the returned function is the cleanup. React calls it before the next effect run (if shipmentId changes) and when the component unmounts. The browser tab title is restored when the user navigates away.",
  feedback_partial:
    "Close — the cleanup function must be returned from the effect callback: `return () => { document.title = 'Shipment Dashboard'; }`. It should be inside the useEffect, not after it.",
  feedback_wrong:
    "Add `return () => { document.title = 'Shipment Dashboard'; };` as the last line inside the useEffect callback, before the closing brace.",
  expected: `import { useEffect } from 'react';

interface ShipmentDetailProps {
  shipmentId: string;
}

const ShipmentDetail = ({ shipmentId }: ShipmentDetailProps): JSX.Element => {
  useEffect(() => {
    document.title = \`Shipment: \${shipmentId}\`;
    return () => {
      document.title = 'Shipment Dashboard';
    };
  }, [shipmentId]);

  useEffect(() => {
    console.log('ShipmentDetail mounted');
  }, []);

  return (
    <div>
      <h2>Shipment {shipmentId}</h2>
    </div>
  );
};`,
  analog_example: `useEffect(() => {
  const handler = () => checkOnlineStatus();
  window.addEventListener('online', handler);
  return () => window.removeEventListener('online', handler);
}, []);`,
  deepDiveLabel:
    "Cleanup runs before the next effect AND on unmount — what order does this create?",
  deepDive: {
    hook: "shipmentId changes from NX-001 to NX-002. You expect: cleanup from NX-001 runs, then setup for NX-002 runs. Is that the correct order — and when exactly does each run relative to the render?",
    pain: "⚠️ **Lesson:** Walk through the exact sequence of render, effect, cleanup when a dependency changes. Understanding the order is critical for writing correct effects.",
    mentalModel:
      "The exact sequence when shipmentId changes from 'NX-001' to 'NX-002':\n\n1. React re-renders with shipmentId = 'NX-002' (new JSX)\n2. React commits the new DOM (component is visually updated)\n3. React runs cleanup from the PREVIOUS effect (shipmentId = 'NX-001')\n   → `document.title = 'Shipment Dashboard'`\n4. React runs the NEW effect (shipmentId = 'NX-002')\n   → `document.title = 'Shipment: NX-002'`\n\nKey insight: cleanup runs AFTER the new render commits but BEFORE the new effect. The DOM shows NX-002's content, but for a brief moment the title was 'Shipment Dashboard' between cleanup and setup.",
    discover:
      "```\nTimeline:\n1. Render (NX-001 → NX-002)\n2. DOM commit\n3. Cleanup from NX-001 effect\n4. Setup for NX-002 effect\n\nFor unmount:\n1. Parent stops rendering ShipmentDetail\n2. DOM cleanup (React unmounts)\n3. Cleanup from last effect runs\n```",
    quickRules:
      "- ✅ setup runs after every render where deps changed\n- ✅ cleanup runs before the next setup AND on unmount\n- ✅ cleanup from the previous render's effect always runs before the new effect\n- ❌ expecting cleanup to run before the new render — it runs after commit\n- the pattern: setup establishes a resource, cleanup tears it down",
    watchOut:
      "👀 **Watch out:** If cleanup modifies state (calls a setter), that triggers another render. Avoid state updates in cleanup functions — they can cause infinite loops or unexpected re-renders after unmount.",
    dryRun:
      "🔁 **Think:** shipmentId changes from 'NX-001' to 'NX-002'. List the exact sequence of events in order: which render happens first, does cleanup or new setup run first, what is document.title at each step?",
    build:
      "**Learning focus:** Return a cleanup function from useEffect — understanding the setup → cleanup → setup sequence when dependencies change and the cleanup → unmount sequence at the end of a component's life.",
  },
},
{
  id: "step5",
  type: "question",
  phase: "Step 5 of 5",
  paal: "Add a useEffect with a setInterval that increments a secondsViewed counter every second. Return a cleanup that clears the interval when the component unmounts or when shipmentId changes.",
  hint: "Store the interval ID from setInterval. Return `() => clearInterval(intervalId)` as the cleanup. Include seconds setter in the effect body.",
  example_code: `const [seconds, setSeconds] = useState(0);

useEffect(() => {
  const id = setInterval(() => {
    setSeconds(prev => prev + 1);
  }, 1000);
  return () => clearInterval(id);
}, []);`,
  think_prompt:
    "setInterval fires every second and calls a setter. When the component unmounts or shipmentId changes (the user navigated to a new shipment), the interval must be cleared — otherwise it keeps firing and tries to update state on an unmounted component. What do you store, and what does the cleanup call?",
  mc_options: [
    "setInterval(() => setSecondsViewed(prev => prev + 1), 1000); // no cleanup",
    "const id = setInterval(() => setSecondsViewed(prev => prev + 1), 1000); return () => clearInterval(id);",
    "useTimeout(() => setSecondsViewed(prev => prev + 1), 1000); // useTimeout hook",
  ],
  mc_correct_option:
    "const id = setInterval(() => setSecondsViewed(prev => prev + 1), 1000); return () => clearInterval(id);",
  mc_anchor:
    "Storing the interval ID and calling clearInterval in cleanup is the standard pattern. Without cleanup, the interval continues running after unmount — React will log 'Can't perform a React state update on an unmounted component' and the counter updates silently in the background. There is no useTimeout hook in React — setInterval/setTimeout are browser APIs used inside useEffect.",
  why_this_matters:
    "Timers are the canonical use case for cleanup functions — every setInterval or setTimeout inside useEffect must have a clearInterval/clearTimeout in the cleanup. This is the pattern behind all real-time features: live clocks, countdown timers, auto-refresh, polling. Getting the cleanup right prevents memory leaks and stale update warnings.",
  answer_keywords: [
    "setInterval", "clearInterval", "id", "return", "() =>",
    "setSecondsViewed", "prev + 1",
  ],
  seed_code: `import { useState, useEffect } from 'react';

interface ShipmentDetailProps {
  shipmentId: string;
}

const ShipmentDetail = ({ shipmentId }: ShipmentDetailProps): JSX.Element => {
  const [secondsViewed, setSecondsViewed] = useState(0);

  useEffect(() => {
    document.title = \`Shipment: \${shipmentId}\`;
    return () => { document.title = 'Shipment Dashboard'; };
  }, [shipmentId]);

  return (
    <div>
      <h2>Shipment {shipmentId}</h2>
      <p>Viewed for {secondsViewed}s</p>
    </div>
  );
};`,
  starter_code: `import { useState, useEffect } from 'react';

interface ShipmentDetailProps {
  shipmentId: string;
}

const ShipmentDetail = ({ shipmentId }: ShipmentDetailProps): JSX.Element => {
  const [secondsViewed, setSecondsViewed] = useState(0);

  useEffect(() => {
    document.title = \`Shipment: \${shipmentId}\`;
    return () => { document.title = 'Shipment Dashboard'; };
  }, [shipmentId]);

  // add setInterval effect here
  // increments secondsViewed every 1000ms
  // clears the interval on cleanup
  // dependency: [shipmentId] — reset timer when shipment changes

  return (
    <div>
      <h2>Shipment {shipmentId}</h2>
      <p>Viewed for {secondsViewed}s</p>
    </div>
  );
};`,
  feedback_correct:
    "Exactly — the interval ID is captured, the cleanup clears it. When the user navigates to a different shipment (shipmentId changes), the cleanup fires: old interval cleared, secondsViewed resets (because the state is local), new interval starts for the new shipment.",
  feedback_partial:
    "Close — make sure you're storing the ID from setInterval (`const id = setInterval(...)`) and returning `() => clearInterval(id)` as the cleanup. Without storing the ID, you can't clear the specific interval.",
  feedback_wrong:
    "Add `useEffect(() => { const id = setInterval(() => setSecondsViewed(prev => prev + 1), 1000); return () => clearInterval(id); }, [shipmentId])`. The functional update form `prev => prev + 1` is safe from stale closure.",
  expected: `import { useState, useEffect } from 'react';

interface ShipmentDetailProps {
  shipmentId: string;
}

const ShipmentDetail = ({ shipmentId }: ShipmentDetailProps): JSX.Element => {
  const [secondsViewed, setSecondsViewed] = useState(0);

  useEffect(() => {
    document.title = \`Shipment: \${shipmentId}\`;
    return () => {
      document.title = 'Shipment Dashboard';
    };
  }, [shipmentId]);

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsViewed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [shipmentId]);

  return (
    <div>
      <h2>Shipment {shipmentId}</h2>
      <p>Viewed for {secondsViewed}s</p>
    </div>
  );
};`,
  analog_example: `useEffect(() => {
  const id = setInterval(fetchLatestStatus, 30_000);
  return () => clearInterval(id);
}, [shipmentId]);`,
  deepDiveLabel:
    "setInterval in useEffect — but why does secondsViewed need the functional update form?",
  deepDive: {
    hook: "You write `setSecondsViewed(secondsViewed + 1)` instead of `setSecondsViewed(prev => prev + 1)`. The counter increments from 0 to 1 — then stops. The interval keeps firing but the displayed count never goes past 1. This is a stale closure bug inside an interval.",
    pain: "⚠️ **Lesson:** The setInterval callback captures secondsViewed from the closure at the time the interval was created. Why does secondsViewed stay 0 inside the interval — and why does `prev => prev + 1` fix it?",
    mentalModel:
      "When the interval is created on mount, the callback closes over `secondsViewed = 0`. Every second, it calls `setSecondsViewed(0 + 1)` — always 1. React updates state to 1. The component re-renders. But the interval's closure still has `secondsViewed = 0` from when it was created — it never sees the updated value.\n\n`prev => prev + 1` doesn't read from the closure — it receives the current state value as an argument from React's setter. React guarantees `prev` is always the most recent state value, regardless of when the callback was created.\n\nThis is the same functional update principle from Lesson 8 — critical inside intervals and async callbacks.",
    discover:
      "```tsx\n// ❌ stale closure — secondsViewed frozen at initial value\nconst id = setInterval(() => {\n  setSecondsViewed(secondsViewed + 1); // always 0 + 1 = 1\n}, 1000);\n\n// ✅ functional update — prev is always current\nconst id = setInterval(() => {\n  setSecondsViewed(prev => prev + 1); // correctly increments\n}, 1000);\n```",
    quickRules:
      "- ✅ `prev => prev + 1` inside intervals — always correct\n- ❌ `secondsViewed + 1` inside intervals — stale closure bug\n- ✅ functional update form for any state update inside async callbacks, intervals, and timeouts\n- same reason: functional form receives current state, closure form reads captured snapshot",
    watchOut:
      "👀 **Watch out:** This stale closure bug is one of the hardest to diagnose — the interval fires, the setter is called, but the state appears frozen. Always use the functional update form inside setInterval callbacks.",
    dryRun:
      "🔁 **Think:** secondsViewed is 0 at mount. Interval created with `setSecondsViewed(secondsViewed + 1)`. After 1 second: what value does secondsViewed inside the closure have? What does setSecondsViewed receive? What is the new state? After 2 seconds: same question. Why does the counter stop at 1?",
    build:
      "**Learning focus:** Use setInterval inside useEffect with a cleanup that clears the interval — applying the functional update form to avoid the stale closure bug that is especially common inside timer callbacks.",
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
  lessonNum: 24,
  title: "useEffect — Mount",
  shortName: "HOOKS — EFFECT MOUNT",
});
