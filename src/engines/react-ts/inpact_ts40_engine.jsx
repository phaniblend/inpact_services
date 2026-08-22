
import createINPACTEngine from "../inpact_engine_shared";

function normalizeCode(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

function evalLesson40Step1(answer) {
  const raw = String(answer || "");
  const hasName = /function\s+useOnlineStatus|const\s+useOnlineStatus\s*=/.test(raw);
  const hasNavigator = /navigator\.onLine/.test(raw);
  const hasState = /useState\s*<\s*boolean\s*>/.test(raw);
  return hasName && hasNavigator && hasState ? "correct" : hasName && hasState ? "partial" : "wrong";
}

function evalLesson40Step2(answer) {
  const raw = String(answer || "");
  const hasOnline = /online/.test(raw);
  const hasOffline = /offline/.test(raw);
  const hasAdd = /addEventListener/.test(raw);
  const hasSetTrue = /setIsOnline\s*\(\s*true\s*\)/.test(raw);
  const hasSetFalse = /setIsOnline\s*\(\s*false\s*\)/.test(raw);
  return hasOnline && hasOffline && hasAdd && hasSetTrue && hasSetFalse ? "correct"
    : hasOnline && hasOffline && hasAdd ? "partial" : "wrong";
}

function evalLesson40Step3(answer) {
  const raw = String(answer || "");
  const hasRemove = /removeEventListener/.test(raw);
  const hasReturn = /return\s*\(\s*\)\s*=>|return\s*function/.test(raw);
  return hasRemove && hasReturn ? "correct" : hasRemove ? "partial" : "wrong";
}

function evalLesson40Step4(answer) {
  const raw = String(answer || "");
  const hasUseOnlineStatus = /useOnlineStatus\s*\(/.test(raw);
  const hasBanner = /OfflineBanner|offline-banner|isOnline/.test(raw);
  const hasConditional = /isOnline|!isOnline/.test(raw);
  return hasUseOnlineStatus && hasConditional ? "correct" : hasUseOnlineStatus ? "partial" : "wrong";
}

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "LESSON #40 (CUSTOM HOOK)",
      title: "Custom Hook — useOnlineStatus",
      body: "Build a hook that tracks whether the browser currently has network access. You'll seed the initial state from navigator.onLine, attach online and offline event listeners, clean up on unmount, and consume the hook to conditionally render a network-status banner on a shipment dashboard.",
      usecase:
        "Logistics applications are used in warehouses, trucks, and remote depots where connectivity is intermittent. A hook that knows the current network state lets any component instantly adapt — disabling form submissions, queuing mutations, or showing an 'offline mode' banner without touching the component's own logic.",
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
        reason: "Step 4 conditionally renders an OfflineBanner using a JSX expression inside the return. The conditional rendering pattern and JSX expression syntax come from Lesson 1.",
      },
      {
        lesson: 10,
        label: "useState — Primitives",
        reason: "Step 1 initialises `const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine)` — seeding initial state from a non-constant runtime value, which extends the primitive useState pattern from Lesson 10.",
      },
      {
        lesson: 24,
        label: "useEffect — Mount",
        reason: "Steps 2 and 3 wrap event listener registration inside useEffect. The mount pattern — run once on mount, attach side effect — is introduced in Lesson 24.",
      },
      {
        lesson: 25,
        label: "useEffect — Dependencies",
        reason: "Step 3 uses an empty dependency array `[]` intentionally — the online/offline listeners need no deps because window event names are stable. Understanding why [] is correct here (vs stale closure) requires Lesson 25's mental model.",
      },
      {
        lesson: 33,
        label: "Custom Hook — Extract Logic",
        reason: "The hook structure, naming convention, and return-a-single-value API contract follow the custom hook pattern established in Lesson 33.",
      },
    ],
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Seed useState initial value from navigator.onLine for an accurate starting state",
      "Attach 'online' and 'offline' window event listeners inside useEffect",
      "Set isOnline to true on 'online' and false on 'offline'",
      "Return a cleanup function that removes both listeners on unmount",
      "Explain why the dependency array is [] for this hook",
      "Consume the hook to conditionally render an offline status banner in a shipment dashboard",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 4",
    paal: "Define the useOnlineStatus hook — no parameters. Initialise boolean state using navigator.onLine as the initial value, and return that state variable.",
    hint: "navigator.onLine is a boolean that is true when the browser has network access. Pass it directly as the initial value to useState.",
    example_code: `function usePageVisible(): boolean {
  const [visible, setVisible] = useState<boolean>(document.visibilityState === 'visible');
  return visible;
}`,
    think_prompt:
      "useState usually starts with a literal like false. Here you have a live runtime value — navigator.onLine — that already tells you the current network state. Should you use it as the initial value, or start with false and let the effect correct it?",
    mc_options: [
      "useState<boolean>(false) — always start offline and let the first effect run set the correct value.",
      "useState<boolean>(navigator.onLine) — seed from the actual current state so the component is correct on first render.",
      "useState<boolean>(true) — assume online and show an error only when the 'offline' event fires.",
    ],
    mc_correct_option:
      "useState<boolean>(navigator.onLine) — seed from the actual current state so the component is correct on first render.",
    mc_anchor:
      "useState(false) means the component renders 'offline' on the first paint — even when the user is online — then flickers to 'online' after the effect runs. useState(navigator.onLine) gives the correct state immediately, on the first render, before any effect. Effects run after paint, not before. Never let an effect fix incorrect initial state when you already have the correct value at render time.",
    why_this_matters:
      "A shipment dashboard that flashes an 'offline' banner on every page load — even when the network is fine — erodes trust instantly. Seeding from navigator.onLine prevents that first-paint flash. This pattern generalises to any browser API that has a synchronous getter: document.visibilityState, window.innerWidth, matchMedia().matches.",
    answer_keywords: ["useOnlineStatus", "useState", "boolean", "navigator.onLine", "return"],
    seed_code: "",
    starter_code: `import { useState } from 'react';

// define useOnlineStatus here
// - no parameters
// - initial state from navigator.onLine
// - return the boolean state variable
`,
    feedback_correct:
      "Exactly — navigator.onLine is the synchronous source of truth. Seeding from it means the first render is correct, no flicker.",
    feedback_partial:
      "Check the initial value. Starting from false or true means the first render is wrong. Pass navigator.onLine directly to useState so the initial state matches reality.",
    feedback_wrong:
      "Pattern: `function useOnlineStatus(): boolean { const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine); return isOnline; }`",
    expected: `import { useState } from 'react';

function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  return isOnline;
}`,
    analog_example: `function useTabVisible(): boolean {
  const [visible, setVisible] = useState<boolean>(document.visibilityState === 'visible');
  // event wiring comes next
  return visible;
}`,
    deepDiveLabel:
      "navigator.onLine says true — but the network call still fails. What does navigator.onLine actually measure?",
    deepDive: {
      hook: "You've built the hook. navigator.onLine returns true. Your dashboard shows the green 'connected' indicator. A warehouse manager tries to submit a shipment update — the fetch fails with a network error. You check navigator.onLine again: still true. The browser says you're online. The server says you're not. Who is lying?",
      pain: "⚠️ **Lesson:** navigator.onLine returns true if the device has any network interface active — even a connected interface with no route to the internet. It cannot detect whether actual HTTP requests will succeed. What does this mean for how you should use the online/offline events in production?",
      mentalModel:
        "**Mental model — The gas gauge.** navigator.onLine is a gas gauge, not a trip computer. It tells you whether there's gas in the tank (a network interface is up). It says nothing about whether you can reach your destination (whether the API server is reachable). A gauge showing 'not empty' doesn't mean you can complete the journey — a closed road, a wrong turn, or a server outage can all block you even when the tank is full.",
      discover:
        "```tsx\n// navigator.onLine tells you:\n// ✅ true  — device has an active network interface (WiFi connected, Ethernet plugged in)\n// ✅ false — device has NO active network interface (airplane mode, Ethernet unplugged)\n\n// navigator.onLine does NOT tell you:\n// ❌ whether you can reach the internet\n// ❌ whether your API server is up\n// ❌ whether the DNS resolves correctly\n// ❌ whether you have bandwidth for the request\n\n// Production pattern: use online/offline for optimistic UI hints only\n// Use fetch error handling + retry logic for actual connectivity decisions\nconst submitShipment = async (data: ShipmentRecord) => {\n  if (!navigator.onLine) {\n    queueForSync(data); // immediate: we know we're offline\n    return;\n  }\n  try {\n    await api.post('/shipments', data);\n  } catch (err) {\n    queueForSync(data); // even if navigator said online\n  }\n};\n```",
      quickRules:
        "✅ Use online/offline events + navigator.onLine for 'definitely offline' detection\n✅ Always catch fetch errors even when navigator.onLine is true\n✅ Queue mutations for retry — don't just block the user\n❌ Don't assume navigator.onLine === true means API calls will succeed\n❌ Don't skip error handling in fetch because 'the hook says we're online'",
      watchOut:
        "👀 **Watch out:** On mobile, navigator.onLine can flicker between true and false rapidly as the device moves between cell towers or WiFi access points. Debounce state updates if you're using the value for anything more than a UI hint — a shipment that gets 'queued for offline sync' because of a 200ms signal dropout is a frustrating false positive.",
      dryRun:
        "🔁 **Think:** A warehouse manager goes into a cellular dead zone. The 'offline' event fires, isOnline flips to false, and your UI queues their next shipment update. They walk back into coverage. The 'online' event fires. isOnline flips to true. But the queued update has already been stored locally — should the hook automatically trigger the sync, or should that be a separate concern? Why?",
      build:
        "**Learning focus:** Seed useState from navigator.onLine for accurate first-paint state, and understand what navigator.onLine actually measures — and what it doesn't.",
    },
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 4",
    paal: "Inside a useEffect, attach 'online' and 'offline' event listeners to window. The 'online' handler sets isOnline to true; the 'offline' handler sets it to false.",
    hint: "These events take no arguments — the handler is just () => setIsOnline(true) or false. No need to read event properties.",
    example_code: `useEffect(() => {
  const onVisible = () => setVisible(true);
  const onHidden = () => setVisible(false);
  document.addEventListener('visibilitychange', () => {
    document.hidden ? onHidden() : onVisible();
  });
}, []);`,
    think_prompt:
      "The 'online' and 'offline' events carry no payload — the event name itself is the information. What do the handlers need to do?",
    mc_options: [
      "One listener on 'online' — check navigator.onLine inside it to determine the new value.",
      "Two listeners — one sets isOnline to true, one sets it to false. No need to read event properties.",
      "One 'networkchange' listener — it fires for both online and offline transitions.",
    ],
    mc_correct_option:
      "Two listeners — one sets isOnline to true, one sets it to false. No need to read event properties.",
    mc_anchor:
      "The browser guarantees that 'online' fires when connectivity is restored and 'offline' fires when it's lost. No need to call navigator.onLine inside the handler — the event name is the answer. There is no 'networkchange' event in the browser. One listener checking navigator.onLine would also work but adds a redundant read.",
    why_this_matters:
      "The simplest correct handler is the most reliable. Checking navigator.onLine inside the 'online' handler adds a read that could theoretically return false if the event fires slightly before the property updates — a race window. Trusting the event semantics and setting the value directly is both simpler and more accurate.",
    answer_keywords: [
      "useEffect",
      "addEventListener",
      "online",
      "offline",
      "setIsOnline",
      "true",
      "false",
    ],
    seed_code: `import { useState } from 'react';

function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  return isOnline;
}`,
    starter_code: `import { useState, useEffect } from 'react';

function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    // attach 'online' listener — set isOnline to true
    // attach 'offline' listener — set isOnline to false
  }, []);

  return isOnline;
}`,
    feedback_correct:
      "Exactly — two handlers, two addEventListener calls. The event names carry the full information; no need to read event properties.",
    feedback_partial:
      "Close — make sure you have both 'online' and 'offline' listeners, and that each one unconditionally sets the correct boolean without reading event properties.",
    feedback_wrong:
      "Pattern: `const goOnline = () => setIsOnline(true); const goOffline = () => setIsOnline(false); window.addEventListener('online', goOnline); window.addEventListener('offline', goOffline);`",
    expected: `import { useState, useEffect } from 'react';

function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
  }, []);

  return isOnline;
}`,
    analog_example: `useEffect(() => {
  const onFocus = () => setFocused(true);
  const onBlur = () => setFocused(false);
  window.addEventListener('focus', onFocus);
  window.addEventListener('blur', onBlur);
}, []);`,
    deepDiveLabel:
      "The 'online' event fires — but what if the component already unmounted before the handler runs?",
    deepDive: {
      hook: "A user quickly navigates away from the shipment dashboard. React unmounts the component. Half a second later, the 'online' event fires — the device just reconnected. Your goOnline handler runs and calls `setIsOnline(true)`. React logs a warning: 'Can't perform a React state update on an unmounted component.' In React 18, this warning is gone — but the behaviour underneath is still worth understanding.",
      pain: "⚠️ **Lesson:** State updates on unmounted components were a React warning for years. React 18 removed the warning because it's now a no-op — but it used to cause memory leaks in class components. Why is cleanup still necessary in React 18, even if the warning is gone?",
      mentalModel:
        "**Mental model — The subscription that outlives the magazine.** When your component unmounts, React stops caring about its state. But your listener is still on window — still subscribed — still calling a function that refers to a setter React has already discarded. It's a magazine that keeps getting delivered to a house whose residents have moved out. The delivery doesn't crash anything — but it's waste. Other resources (closures over large objects, timers, WebSocket connections) attached to that same effect aren't so benign.",
      discover:
        "```tsx\n// ❌ no cleanup — listener outlives the component\nuseEffect(() => {\n  const goOnline = () => setIsOnline(true);\n  window.addEventListener('online', goOnline);\n  // no return — listener lives forever on window\n}, []);\n\n// ✅ cleanup removes the listener when the component unmounts\nuseEffect(() => {\n  const goOnline = () => setIsOnline(true);\n  const goOffline = () => setIsOnline(false);\n  window.addEventListener('online', goOnline);\n  window.addEventListener('offline', goOffline);\n  return () => {\n    window.removeEventListener('online', goOnline);\n    window.removeEventListener('offline', goOffline);\n  };\n}, []);\n```",
      quickRules:
        "✅ Always clean up window event listeners — React 18 or not\n✅ Cleanup protects against listener accumulation across mount/unmount cycles (Strict Mode mounts twice in dev)\n✅ In React dev Strict Mode, effects run twice — cleanup catches the first run's listeners\n❌ Don't rely on React's warning system to tell you when cleanup is needed — the warning is gone in React 18",
      watchOut:
        "👀 **Watch out:** React Strict Mode in development intentionally mounts, unmounts, and re-mounts every component to expose missing cleanups. Without the return cleanup, you'll accumulate two sets of listeners in dev mode — one from the first mount that was never cleaned up. The dashboard will appear to update twice on every network transition.",
      dryRun:
        "🔁 **Think:** React Strict Mode mounts your component, runs the effect (adding two listeners), then unmounts and remounts it. If there's no cleanup, how many 'online' event handlers are now on window? If the user loses connectivity, how many state updates will setIsOnline(false) trigger, and what does React do with the duplicates?",
      build:
        "**Learning focus:** Attach 'online' and 'offline' event listeners inside useEffect, using the event name itself as the signal — no need to read event properties. Always return cleanup.",
    },
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 4",
    paal: "Add the cleanup function — return a function from the useEffect that removes both the 'online' and 'offline' listeners.",
    hint: "Same pattern as useKeyPress — return () => { removeEventListener(…); removeEventListener(…); }",
    example_code: `useEffect(() => {
  const onFocus = () => setFocused(true);
  const onBlur = () => setFocused(false);
  window.addEventListener('focus', onFocus);
  window.addEventListener('blur', onBlur);
  return () => {
    window.removeEventListener('focus', onFocus);
    window.removeEventListener('blur', onBlur);
  };
}, []);`,
    think_prompt:
      "The dependency array is []. Why is an empty array correct here, where it was wrong in useKeyPress?",
    mc_options: [
      "[] is correct — the handlers don't close over any values that can change. 'online' and 'offline' are constants; goOnline and goOffline always do the same thing.",
      "[] is wrong — it's always wrong to use an empty array. You must list setIsOnline.",
      "[] is wrong — you should list window as a dependency since that's what you're attaching to.",
    ],
    mc_correct_option:
      "[] is correct — the handlers don't close over any values that can change. 'online' and 'offline' are constants; goOnline and goOffline always do the same thing.",
    mc_anchor:
      "The dependency array must include values that can change between renders and that the effect closes over. goOnline and goOffline are pure: they call a stable setter with a literal boolean. They don't close over any prop or state that could change. setIsOnline is stable across renders. 'online' and 'offline' are string literals. There is nothing to put in the array. This is the exact case where [] is correct.",
    why_this_matters:
      "Understanding when [] is right — not just 'empty array runs once' — prevents two categories of bugs: stale closures (wrong dependency missing) and infinite loops (unstable dependency incorrectly listed). The rule is not 'use [] for mount-only effects'. The rule is 'list every external value the effect closes over that can change'.",
    answer_keywords: [
      "return",
      "removeEventListener",
      "online",
      "offline",
      "goOnline",
      "goOffline",
    ],
    seed_code: `import { useState, useEffect } from 'react';

function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
  }, []);

  return isOnline;
}`,
    starter_code: `import { useState, useEffect } from 'react';

function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    // return cleanup here
  }, []);

  return isOnline;
}`,
    feedback_correct:
      "Exactly — cleanup removes both listeners using the same references, and [] is correct because neither handler closes over any changing value.",
    feedback_partial:
      "Check that you're returning the cleanup function (not calling removeEventListener directly outside the return), and that you're using goOnline/goOffline by name — not creating new arrow functions.",
    feedback_wrong:
      "Pattern: `return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); };`",
    expected: `import { useState, useEffect } from 'react';

function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return isOnline;
}`,
    analog_example: `useEffect(() => {
  const onEnter = () => setHovering(true);
  const onLeave = () => setHovering(false);
  window.addEventListener('focus', onEnter);
  window.addEventListener('blur', onLeave);
  return () => {
    window.removeEventListener('focus', onEnter);
    window.removeEventListener('blur', onLeave);
  };
}, []);`,
    deepDiveLabel:
      "[] is correct here but was wrong in useKeyPress — what's the exact rule for when [] is right?",
    deepDive: {
      hook: "Two custom hooks. Both use useEffect. Both end with `}, [])`. One of them — useKeyPress — has a silent bug because of it. The other — useOnlineStatus — is correct. From the outside they look identical. A teammate sees your useOnlineStatus hook, notes the empty array, and says 'that's lazy — you should always list your deps'. They add `[setIsOnline]`. It still works. Was their change an improvement?",
      pain: "⚠️ **Lesson:** The rule 'always list your deps' is a proxy for a deeper rule. What is the deeper rule, and how does it explain why [] is genuinely correct for useOnlineStatus but genuinely wrong for useKeyPress?",
      mentalModel:
        "**Mental model — The photograph rule, precisely stated.** A useEffect takes a photograph of every external value it closes over. If that photograph can become stale — because the value can change between renders — you need a new photograph on every change. That value goes in the dep array. If the photograph can never be stale — because the value is a constant, a stable setter, or a primitive literal — no new photograph is ever needed. The dep array stays empty. [] doesn't mean 'run once'. It means 'this effect closes over nothing that can change'.",
      discover:
        "```tsx\n// useKeyPress — targetKey can change (it's a prop)\n// [] is WRONG — the handlers close over a changing prop\nuseEffect(() => {\n  const onDown = (e: KeyboardEvent) => {\n    if (e.key === targetKey) setIsPressed(true); // ← targetKey from prop\n  };\n  …\n}, []); // stale closure if targetKey changes\n\n// useOnlineStatus — nothing can change\n// [] is CORRECT — goOnline and goOffline close over nothing external\nuseEffect(() => {\n  const goOnline = () => setIsOnline(true);  // ← no external value\n  const goOffline = () => setIsOnline(false); // ← no external value\n  window.addEventListener('online', goOnline);\n  window.addEventListener('offline', goOffline);\n  return () => { … };\n}, []); // correct — nothing to re-run for\n```",
      quickRules:
        "✅ List every value closed over by the effect that can change between renders\n✅ [] is correct when every closed-over value is a constant, stable setter, or string literal\n✅ setIsOnline from useState is stable — React guarantees the same reference across renders\n❌ Don't add values to deps 'just in case' — unnecessary deps cause unnecessary re-runs\n❌ Don't treat [] as 'run once' — treat it as 'I have no changeable dependencies'",
      watchOut:
        "👀 **Watch out:** `setIsOnline` from useState is stable across renders — React guarantees this. But if you ever replace it with a function passed as a prop, that prop is not stable unless the parent wraps it in useCallback. The same dep-array analysis applies: if it can change, list it.",
      dryRun:
        "🔁 **Think:** A new version of the hook accepts an optional `fallback: boolean = true` prop that controls what isOnline returns if navigator.onLine is unavailable. The handler becomes `const goOnline = () => setIsOnline(true); const goOffline = () => setIsOnline(fallback ? false : true);`. Does [] remain correct? Why or why not?",
      build:
        "**Learning focus:** The dependency array lists values that the effect closes over that *can change* — not all values the effect uses. [] is correct when all closed-over values are stable constants or stable setters.",
    },
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 4",
    paal: "Build a ShipmentDashboard component that consumes useOnlineStatus and conditionally renders an OfflineBanner div when the user is offline.",
    hint: "Call the hook at the top level. Use the boolean to conditionally include the banner in the JSX — either with a ternary or the && operator.",
    example_code: `const WarehousePanel = ({ warehouseId }: WarehousePanelProps) => {
  const isConnected = useOnlineStatus();
  return (
    <div>
      {!isConnected && <div className="sync-warning">Syncing paused</div>}
      <p>{warehouseId}</p>
    </div>
  );
};`,
    think_prompt:
      "The banner should only appear when offline. isOnline is true when connected, false when not. What JSX expression renders the banner only when isOnline is false?",
    mc_options: [
      "{isOnline && <div className='offline-banner'>You are offline</div>}",
      "{!isOnline && <div className='offline-banner'>You are offline</div>}",
      "{isOnline ? null : <div className='offline-banner'>You are offline</div>} — but && is simpler and means the same thing.",
    ],
    mc_correct_option:
      "{!isOnline && <div className='offline-banner'>You are offline</div>}",
    mc_anchor:
      "isOnline is true when connected. The banner should appear when offline — when isOnline is false. `!isOnline && <banner>` renders the banner when the condition is false (offline). `isOnline && <banner>` would show the banner only when connected — the opposite of what you want. The ternary with null is also correct but more verbose for a one-sided conditional.",
    why_this_matters:
      "Offline indicators are a standard accessibility and UX pattern in progressive web apps. The `&&` short-circuit is idiomatic React for one-sided conditionals — show something or show nothing. Knowing when to use `&&` versus a ternary makes JSX readable at a glance: `&&` means 'this might not be here', ternary means 'this is always one of two things'.",
    answer_keywords: [
      "useOnlineStatus",
      "ShipmentDashboard",
      "isOnline",
      "offline-banner",
      "!isOnline",
    ],
    seed_code: `import { useState, useEffect } from 'react';

function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return isOnline;
}`,
    starter_code: `import { useState, useEffect } from 'react';

function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return isOnline;
}

interface ShipmentDashboardProps {
  fleetName: string;
}

// build ShipmentDashboard here
// - call useOnlineStatus at the top level
// - render an offline-banner div only when offline
`,
    feedback_correct:
      "Exactly — hook called at the top level, !isOnline drives the conditional, && renders the banner or nothing.",
    feedback_partial:
      "Check the condition direction — the banner should appear when isOnline is false (offline), so you need !isOnline, not isOnline.",
    feedback_wrong:
      "Pattern: `const ShipmentDashboard = ({ fleetName }: ShipmentDashboardProps) => { const isOnline = useOnlineStatus(); return (<div>{!isOnline && <div className='offline-banner'>You are offline</div>}<h1>{fleetName}</h1></div>); };`",
    expected: `import { useState, useEffect } from 'react';

function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return isOnline;
}

interface ShipmentDashboardProps {
  fleetName: string;
}

const ShipmentDashboard = ({ fleetName }: ShipmentDashboardProps): JSX.Element => {
  const isOnline = useOnlineStatus();
  return (
    <div>
      {!isOnline && <div className="offline-banner">You are offline</div>}
      <h1>{fleetName}</h1>
    </div>
  );
};`,
    analog_example: `const RouteMap = ({ routeId }: RouteMapProps) => {
  const isConnected = useOnlineStatus();
  return (
    <section>
      {!isConnected && <div className="sync-paused">Map updates paused</div>}
      <p>Route: {routeId}</p>
    </section>
  );
};`,
    deepDiveLabel:
      "The hook works — but what happens when the user is on a slow 2G connection that technically has signal?",
    deepDive: {
      hook: "Your offline banner disappears when the 'online' event fires. The driver's phone shows one bar of 3G — technically online. navigator.onLine is true. Your dashboard shows no banner. The driver submits a route update. The fetch times out after 30 seconds. From the UI's perspective, everything looked fine. From the driver's perspective, they wasted half a minute.",
      pain: "⚠️ **Lesson:** The online/offline events and navigator.onLine detect connectivity at the network interface level — not at the 'fast enough to be useful' level. How would you extend the hook to also surface a 'slow connection' state?",
      mentalModel:
        "**Mental model — Three connectivity states.** The real world has three states your UI needs to handle: (1) definitely offline — navigator.onLine is false, (2) definitely online — navigator.onLine is true AND recent requests succeeded, (3) technically online but functionally offline — navigator.onLine is true but requests are timing out or failing. The Network Information API (navigator.connection) surfaces `effectiveType` ('4g', '3g', '2g', 'slow-2g') — but its browser support is limited. The practical solution in production is fetch-based health checks.",
      discover:
        "```tsx\n// extends useOnlineStatus with connection quality awareness\nfunction useConnectionStatus(): 'online' | 'slow' | 'offline' {\n  const isOnline = useOnlineStatus(); // reuse your hook\n  const [isSlow, setIsSlow] = useState(false);\n\n  useEffect(() => {\n    if (!isOnline) { setIsSlow(false); return; }\n    const checkSpeed = async () => {\n      const start = performance.now();\n      try {\n        await fetch('/api/ping', { cache: 'no-store' });\n        const ms = performance.now() - start;\n        setIsSlow(ms > 2000); // >2s round trip = slow\n      } catch {\n        setIsSlow(true);\n      }\n    };\n    const interval = setInterval(checkSpeed, 30_000);\n    checkSpeed();\n    return () => clearInterval(interval);\n  }, [isOnline]);\n\n  if (!isOnline) return 'offline';\n  if (isSlow) return 'slow';\n  return 'online';\n}\n```",
      quickRules:
        "✅ Use online/offline events for binary connectivity detection\n✅ Add fetch-based health checks for 'functionally online' detection\n✅ Show specific UI for 'slow' vs 'offline' — they have different user actions\n❌ Don't treat navigator.onLine === true as 'requests will succeed'\n❌ Don't poll the server more than once per 30s — it adds load during outages",
      watchOut:
        "👀 **Watch out:** The Network Information API (`navigator.connection.effectiveType`) is not available in Safari. If you use it without a feature check, the hook crashes on all iOS devices. Always guard with `'connection' in navigator` before accessing the property.",
      dryRun:
        "🔁 **Think:** Your extended hook polls `/api/ping` every 30 seconds. The server goes down. The 'offline' event never fires (the device still has WiFi). The ping fails. The hook sets status to 'slow'. Is 'slow' the right state to show when the server is completely down? What would 'correct' look like, and how would you distinguish a slow server from an unreachable one?",
      build:
        "**Learning focus:** Consume useOnlineStatus to conditionally render UI elements — and understand that 'online' means 'network interface active', not 'requests will succeed'.",
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
];

export default createINPACTEngine({
  NODES,
  sideItems,
  lessonNum: 40,
  title: "Custom Hook — useOnlineStatus",
  shortName: "HOOK — USE ONLINE STATUS",
});
