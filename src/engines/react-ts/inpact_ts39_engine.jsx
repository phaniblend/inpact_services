
import createINPACTEngine from "../inpact_engine_shared";

function normalizeCode(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

function evalLesson39Step1(answer) {
  const raw = String(answer || "");
  const hasName = /function\s+useKeyPress|const\s+useKeyPress\s*=/.test(raw);
  const hasParam = /targetKey\s*:\s*string/.test(raw);
  const hasState = /useState\s*<\s*boolean\s*>/.test(raw);
  const hasReturn = /return\s+\w+/.test(raw);
  return hasName && hasParam && hasState && hasReturn ? "correct" : hasName && hasParam ? "partial" : "wrong";
}

function evalLesson39Step2(answer) {
  const raw = String(answer || "");
  const hasKeydown = /keydown/.test(raw);
  const hasKeyup = /keyup/.test(raw);
  const hasAddEvent = /addEventListener/.test(raw);
  const hasKey = /e\.key\s*===\s*targetKey|event\.key\s*===\s*targetKey/.test(raw);
  return hasKeydown && hasKeyup && hasAddEvent && hasKey ? "correct" : hasAddEvent && hasKey ? "partial" : "wrong";
}

function evalLesson39Step3(answer) {
  const raw = String(answer || "");
  const hasRemove = /removeEventListener/.test(raw);
  const hasReturn = /return\s*\(\s*\)\s*=>|return\s*function/.test(raw);
  const hasCleanup = hasRemove && hasReturn;
  return hasCleanup ? "correct" : hasRemove ? "partial" : "wrong";
}

function evalLesson39Step4(answer) {
  const raw = String(answer || "");
  const hasDep = /\[\s*targetKey\s*\]/.test(raw);
  return hasDep ? "correct" : "wrong";
}

function evalLesson39Step5(answer) {
  const raw = String(answer || "");
  const hasUseKeyPress = /useKeyPress\s*\(/.test(raw);
  const hasConditional = /isPressed|keyPressed/.test(raw);
  const hasHighlight = /highlighted|isHighlighted|active/.test(raw) || /isPressed|keyPressed/.test(raw);
  return hasUseKeyPress && hasConditional ? "correct" : hasUseKeyPress ? "partial" : "wrong";
}

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "LESSON #39 (CUSTOM HOOK)",
      title: "Custom Hook — useKeyPress",
      body: "Build a reusable hook that tracks whether a specific keyboard key is currently pressed. You'll wire up keydown and keyup listeners, manage boolean state, clean up on unmount, and keep the dependency array honest — then use the hook to drive a UI behaviour in a shipment component.",
      usecase:
        "Keyboard shortcuts are standard in logistics dashboards — pressing 'f' to flag a shipment, 'Escape' to close a panel, 'Enter' to confirm a route. useKeyPress captures that logic once and lets every component subscribe to any key without duplicating event wiring.",
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
        reason: "Step 5 renders a ShipmentRow that applies a conditional className — the JSX expression syntax and className pattern come directly from Lesson 1 Step 6.",
      },
      {
        lesson: 10,
        label: "useState — Primitives",
        reason: "Step 1 initialises `const [isPressed, setIsPressed] = useState<boolean>(false)` inside the hook body — the exact primitive-boolean useState pattern from Lesson 10.",
      },
      {
        lesson: 19,
        label: "Event Handling — Keyboard + Focus",
        reason: "Steps 2 and 3 attach keydown and keyup listeners and read `e.key`. The keyboard event model and the `e.key` property are taught in Lesson 19.",
      },
      {
        lesson: 24,
        label: "useEffect — Mount",
        reason: "Steps 2 and 3 wrap all event listener registration inside a useEffect call. The mount-only useEffect pattern is introduced in Lesson 24.",
      },
      {
        lesson: 25,
        label: "useEffect — Dependencies",
        reason: "Step 4 adds `[targetKey]` to the dependency array so the effect re-registers listeners when the target key changes. This dependency-driven re-run pattern is Lesson 25.",
      },
      {
        lesson: 33,
        label: "Custom Hook — Extract Logic",
        reason: "The entire lesson builds a custom hook following the naming convention, single-responsibility principle, and return-value contract established in Lesson 33.",
      },
    ],
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Initialise a boolean state variable inside a custom hook to track key-press status",
      "Attach keydown and keyup event listeners to window inside a useEffect",
      "Compare e.key against the targetKey parameter to update state",
      "Return a cleanup function that removes both listeners to prevent memory leaks",
      "Declare the correct dependency array so the effect re-runs only when targetKey changes",
      "Consume useKeyPress in a ShipmentRow component to drive a conditional UI behaviour",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 5",
    paal: "Define the useKeyPress hook — it accepts a targetKey string and returns a boolean indicating whether that key is currently pressed.",
    hint: "useState<boolean>(false) is the initial state. Return the state variable — not the setter.",
    example_code: `function useScrolled(threshold: number): boolean {
  const [scrolled, setScrolled] = useState<boolean>(false);
  // effect wiring comes later
  return scrolled;
}`,
    think_prompt:
      "The hook needs to track one thing: is this key down right now? What type does that state need to be, and what should it start as?",
    mc_options: [
      "useState<string>('') — store the key name that is pressed",
      "useState<boolean>(false) — store whether the key is down right now",
      "useState<KeyboardEvent | null>(null) — store the last event so callers can read all properties",
    ],
    mc_correct_option: "useState<boolean>(false) — store whether the key is down right now",
    mc_anchor:
      "The hook's job is to answer one yes/no question: is this key pressed? Boolean is the right type. Storing the key name adds nothing — the caller already knows the key. Storing the event object leaks internal detail the caller doesn't need and makes the API harder to use.",
    why_this_matters:
      "Hook APIs should expose the minimum data the caller needs. Returning a boolean keeps consumption to `const isPressed = useKeyPress('f')` — a single truthy check. Returning an event object forces callers to reach into hook internals, creating tight coupling across every component that uses the hook.",
    answer_keywords: ["useKeyPress", "targetKey", "string", "useState", "boolean", "false", "return"],
    seed_code: "",
    starter_code: `import { useState } from 'react';

// Define useKeyPress:
// - accepts targetKey: string
// - returns boolean (is the key currently pressed?)
`,
    feedback_correct:
      "Exactly — boolean state initialised to false, returning the state variable. The setter stays private inside the hook.",
    feedback_partial:
      "Check two things: the state type should be boolean (not string or event), and the return value should be the state variable — not the setter tuple.",
    feedback_wrong:
      "Pattern: `function useKeyPress(targetKey: string): boolean { const [isPressed, setIsPressed] = useState<boolean>(false); return isPressed; }`",
    expected: `import { useState } from 'react';

function useKeyPress(targetKey: string): boolean {
  const [isPressed, setIsPressed] = useState<boolean>(false);
  return isPressed;
}`,
    analog_example: `function useHover(elementId: string): boolean {
  const [hovered, setHovered] = useState<boolean>(false);
  // event wiring comes later
  return hovered;
}`,
    deepDiveLabel:
      "The hook returns a boolean — but couldn't returning the full KeyboardEvent give callers more power?",
    deepDive: {
      hook: "A teammate sees your useKeyPress hook and suggests an upgrade: return the full KeyboardEvent instead of a boolean. That way callers can also read `e.shiftKey`, `e.ctrlKey`, `e.repeat`, and anything else they might need. Sounds strictly better — a superset of what you currently return. You merge the change. Three months later, a new engineer uses the hook and writes `if (keyEvent) { … }` — not `if (keyEvent && !keyEvent.repeat)`. The shipment row now highlights on held-down keys, firing 30 times a second. The dashboard stutters.",
      pain: "⚠️ **Lesson:** Returning the raw event object instead of a derived boolean leaks implementation detail and forces every caller to replicate the same defensive checks. Why does exposing more data from a hook often make it harder — not easier — to use correctly?",
      mentalModel:
        "**Mental model — The ATM principle.** An ATM doesn't hand you the bank's entire ledger so you can calculate your own balance. It hands you one number: your current balance. The hook is the ATM. The event object is the ledger. Your callers need the answer — `true` or `false` — not the raw data required to compute it. Hooks that return the minimum derived value are reusable. Hooks that return raw internals become training wheels that every caller must outgrow.",
      discover:
        "```tsx\n// ✅ returns the answer — callers do nothing extra\nfunction useKeyPress(targetKey: string): boolean {\n  const [isPressed, setIsPressed] = useState<boolean>(false);\n  // ...listeners set isPressed true/false\n  return isPressed;\n}\n\n// consumer — one truthy check\nconst isHighlighted = useKeyPress('f');\n<ShipmentRow highlighted={isHighlighted} />\n\n// ❌ returns the raw event — every caller repeats the same guard\nfunction useKeyPress(targetKey: string): KeyboardEvent | null {\n  const [event, setEvent] = useState<KeyboardEvent | null>(null);\n  return event;\n}\n\n// consumer — must know about .repeat, null-check, .type comparison\nconst evt = useKeyPress('f');\nconst isHighlighted = evt !== null && evt.type === 'keydown' && !evt.repeat;\n```\nThe second version compiles. It also moves domain logic into every callsite — the opposite of what a hook is for.",
      quickRules:
        "✅ Return the minimum answer the caller needs (boolean, string, number)\n✅ Keep event objects, refs, and setters private inside the hook\n✅ If two callers would write the same derived expression, move it into the hook\n❌ Don't return raw events or refs unless the caller genuinely needs the full object\n❌ Don't expose setters from a hook — callers should never drive hook-internal state directly",
      watchOut:
        "👀 **Watch out:** Returning the setter from useState — `return [isPressed, setIsPressed]` — is the most common hook encapsulation mistake. Once a caller can call `setIsPressed(true)` directly, the hook's state is no longer the single source of truth. Any component can put the hook into an inconsistent state (key shown as pressed when no keydown event has fired). Keep setters private.",
      dryRun:
        "🔁 **Think:** Your hook returns `boolean`. A new feature requires tracking whether the key is being held (repeat === true) versus freshly pressed (repeat === false). Should you change the hook's return type to `'held' | 'fresh' | 'up'`, or should you create a second hook — useKeyHeld — that returns boolean? What's the decision rule?",
      build:
        "**Learning focus:** A hook's return type should be the minimum derived value callers need — not the raw internal data the hook uses to compute it.",
    },
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 5",
    paal: "Inside a useEffect, attach keydown and keyup listeners to window. Set isPressed to true on keydown when e.key matches targetKey, and back to false on keyup.",
    hint: "Two handlers, two addEventListener calls — one for 'keydown' (set true) and one for 'keyup' (set false). Check e.key === targetKey before setting state.",
    example_code: `useEffect(() => {
  const onMove = (e: MouseEvent) => {
    if (e.clientX > threshold) setOver(true);
  };
  const onLeave = () => setOver(false);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseleave', onLeave);
}, []);`,
    think_prompt:
      "You need to detect when a key goes down AND when it comes back up. How many event listeners do you need, and what does each one do to the boolean state?",
    mc_options: [
      "One 'keydown' listener — set isPressed to true. Check isPressed in the component to reset it.",
      "One 'keypress' listener — it fires on both down and up, so one listener handles both.",
      "Two listeners — 'keydown' sets isPressed to true, 'keyup' sets it back to false.",
    ],
    mc_correct_option:
      "Two listeners — 'keydown' sets isPressed to true, 'keyup' sets it back to false.",
    mc_anchor:
      "`keydown` fires when the key goes down. `keyup` fires when it comes back up. You need both to track the full press-and-release cycle. `keypress` is deprecated and unreliable for non-character keys. Resetting state from the component breaks hook encapsulation — the hook should own its own state transitions.",
    why_this_matters:
      "Keyboard shortcuts in production dashboards must track both transitions — down to activate a mode, up to deactivate it. A flag-shipment shortcut that stays on after the key releases creates phantom selections. Both listeners together form a self-contained state machine inside the hook.",
    answer_keywords: [
      "useEffect",
      "addEventListener",
      "keydown",
      "keyup",
      "e.key",
      "targetKey",
      "setIsPressed",
    ],
    seed_code: `import { useState, useEffect } from 'react';

function useKeyPress(targetKey: string): boolean {
  const [isPressed, setIsPressed] = useState<boolean>(false);
  return isPressed;
}`,
    starter_code: `import { useState, useEffect } from 'react';

function useKeyPress(targetKey: string): boolean {
  const [isPressed, setIsPressed] = useState<boolean>(false);

  useEffect(() => {
    // attach keydown handler — set isPressed true when e.key === targetKey
    // attach keyup handler — set isPressed false when e.key === targetKey
  }, []);

  return isPressed;
}`,
    feedback_correct:
      "Exactly — two handlers, two addEventListener calls, both checking e.key === targetKey before touching state.",
    feedback_partial:
      "Check the key comparison — make sure both handlers verify `e.key === targetKey` before calling setIsPressed. Setting state unconditionally would flip the boolean on any keypress, not just the target.",
    feedback_wrong:
      "Pattern: `const onDown = (e: KeyboardEvent) => { if (e.key === targetKey) setIsPressed(true); }; const onUp = (e: KeyboardEvent) => { if (e.key === targetKey) setIsPressed(false); }; window.addEventListener('keydown', onDown); window.addEventListener('keyup', onUp);`",
    expected: `import { useState, useEffect } from 'react';

function useKeyPress(targetKey: string): boolean {
  const [isPressed, setIsPressed] = useState<boolean>(false);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.key === targetKey) setIsPressed(true);
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === targetKey) setIsPressed(false);
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
  }, []);

  return isPressed;
}`,
    analog_example: `useEffect(() => {
  const onEnter = (e: MouseEvent) => {
    if (e.target === zoneRef.current) setActive(true);
  };
  const onExit = () => setActive(false);
  window.addEventListener('mouseenter', onEnter);
  window.addEventListener('mouseleave', onExit);
}, []);`,
    deepDiveLabel:
      "e.key === targetKey looks right — but what happens when the user holds the key down for two seconds?",
    deepDive: {
      hook: "Your useKeyPress('f') hook is wired into the shipment dashboard. A warehouse manager presses and holds 'f' to flag a row. The keydown event fires once — isPressed flips to true — and the row highlights. So far so good. But the browser also fires keydown repeatedly while the key is held, at ~30 events per second. Your handler checks `e.key === targetKey` and calls `setIsPressed(true)` on every repeat. React re-renders the component 30 times a second for as long as the key is held. The dashboard stutters.",
      pain: "⚠️ **Lesson:** The browser fires repeated keydown events while a key is held. Your handler calls setIsPressed(true) on every repeat — even though the state is already true. Why does calling setState with the same value still cause re-renders, and how do you prevent the stutter?",
      mentalModel:
        "**Mental model — The light switch.** Flipping a light switch from ON to ON doesn't change the light — but in React, calling `setIsPressed(true)` when `isPressed` is already `true` still schedules a re-render in some React versions. The fix is to guard the setter: only call it when the value actually changes. `if (!isPressed) setIsPressed(true)` or using the functional updater form `setIsPressed(prev => prev ? prev : true)` eliminates the repeat-fire problem entirely.",
      discover:
        "```tsx\n// ❌ fires setIsPressed on every keydown repeat (~30/s while held)\nconst onDown = (e: KeyboardEvent) => {\n  if (e.key === targetKey) setIsPressed(true); // called repeatedly\n};\n\n// ✅ guard with e.repeat — keydown repeat events have e.repeat === true\nconst onDown = (e: KeyboardEvent) => {\n  if (e.key === targetKey && !e.repeat) setIsPressed(true);\n};\n\n// ✅ alternative — functional updater short-circuits when already true\nconst onDown = (e: KeyboardEvent) => {\n  if (e.key === targetKey) setIsPressed(prev => prev ? prev : true);\n};\n```\n`e.repeat` is the cleanest guard — it's false on the first press, true on all subsequent repeat events.",
      quickRules:
        "✅ Check `e.key === targetKey` before touching state\n✅ Guard against repeat fires with `!e.repeat` on the keydown handler\n✅ Use `keyup` to reset — it never repeats\n❌ Don't call setState on every keydown repeat — it causes unnecessary re-renders\n❌ Don't use the deprecated `keypress` event — unreliable on special keys",
      watchOut:
        "👀 **Watch out:** `e.key` is case-sensitive. `useKeyPress('F')` and `useKeyPress('f')` are different hooks. When the user has Caps Lock on, pressing the 'f' key sends `e.key === 'F'`. If your hook needs to be case-insensitive, normalise both sides: `e.key.toLowerCase() === targetKey.toLowerCase()`.",
      dryRun:
        "🔁 **Think:** The warehouse manager presses 'f', then without releasing it, switches to a different browser tab. The keyup event never fires in your tab because the key was released in another tab. What is isPressed's value now, and will it ever reset? How would you fix it?",
      build:
        "**Learning focus:** Attach paired keydown/keyup listeners inside useEffect, checking e.key against targetKey before updating state — and understand why e.repeat matters for held keys.",
    },
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 5",
    paal: "Return a cleanup function from the useEffect that removes both event listeners when the component unmounts.",
    hint: "The cleanup function is the return value of the useEffect callback. Use the exact same handler references you passed to addEventListener.",
    example_code: `useEffect(() => {
  const onMove = (e: MouseEvent) => { setPos({ x: e.clientX, y: e.clientY }); };
  window.addEventListener('mousemove', onMove);
  return () => {
    window.removeEventListener('mousemove', onMove);
  };
}, []);`,
    think_prompt:
      "If the component using this hook unmounts while a key is held, what happens to the listener — and why does that matter?",
    mc_options: [
      "Listeners attached to window are global — they clean themselves up when the component unmounts.",
      "Return a function from the useEffect that calls removeEventListener with the same handler references.",
      "Set isPressed to false in a componentWillUnmount method to signal that the key is no longer tracked.",
    ],
    mc_correct_option:
      "Return a function from the useEffect that calls removeEventListener with the same handler references.",
    mc_anchor:
      "Listeners on `window` are global — they live on the page, not the component. React does not remove them when the component unmounts. Without cleanup, the handlers keep firing and calling setIsPressed on a component that no longer exists, producing memory leaks and React warnings. The cleanup function is the exact mechanism useEffect provides for this.",
    why_this_matters:
      "In a logistics dashboard with dozens of panels opening and closing, each useKeyPress call without cleanup accumulates orphaned listeners across every mount. After an hour of use, hundreds of handlers are firing on every keystroke — a memory leak that degrades performance over the session.",
    answer_keywords: ["return", "removeEventListener", "keydown", "keyup", "onDown", "onUp"],
    seed_code: `import { useState, useEffect } from 'react';

function useKeyPress(targetKey: string): boolean {
  const [isPressed, setIsPressed] = useState<boolean>(false);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.key === targetKey) setIsPressed(true);
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === targetKey) setIsPressed(false);
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
  }, []);

  return isPressed;
}`,
    starter_code: `import { useState, useEffect } from 'react';

function useKeyPress(targetKey: string): boolean {
  const [isPressed, setIsPressed] = useState<boolean>(false);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.key === targetKey) setIsPressed(true);
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === targetKey) setIsPressed(false);
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    // return a cleanup function that removes both listeners
  }, []);

  return isPressed;
}`,
    feedback_correct:
      "Exactly — the cleanup function removes both listeners using the same onDown and onUp references that were passed to addEventListener.",
    feedback_partial:
      "Almost — make sure you're passing the exact same function references to removeEventListener that you passed to addEventListener. Inline arrow functions create new references and will fail to remove the original listener.",
    feedback_wrong:
      "Pattern: `return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); };` — return a function from the useEffect body that removes both listeners.",
    expected: `import { useState, useEffect } from 'react';

function useKeyPress(targetKey: string): boolean {
  const [isPressed, setIsPressed] = useState<boolean>(false);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.key === targetKey) setIsPressed(true);
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === targetKey) setIsPressed(false);
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  return isPressed;
}`,
    analog_example: `useEffect(() => {
  const onResize = () => setWidth(window.innerWidth);
  window.addEventListener('resize', onResize);
  return () => {
    window.removeEventListener('resize', onResize);
  };
}, []);`,
    deepDiveLabel:
      "removeEventListener with a new arrow function doesn't remove the original — why does the reference have to match exactly?",
    deepDive: {
      hook: "You write the cleanup inline: `return () => { window.removeEventListener('keydown', (e) => { if (e.key === targetKey) setIsPressed(true); }); };`. It looks right — same logic, same event name. But in DevTools you can see the listener count climbing: 2, 4, 8. Every remount adds new listeners and the cleanup removes nothing. The dashboard is now responding to every keystroke eight times.",
      pain: "⚠️ **Lesson:** `addEventListener` and `removeEventListener` identify listeners by function reference — not by code equivalence. An arrow function defined inline in the cleanup is a brand new function object, not the one that was registered. Why does JavaScript compare functions by identity rather than behaviour?",
      mentalModel:
        "**Mental model — The guest list.** The event system is a guest list at the door. When you add a listener, you hand the bouncer a specific person (function reference). When you remove it, you have to hand the bouncer the exact same person — not someone who looks the same, acts the same, or has the same name. Inline arrow functions are clones: identical behaviour, different identity. The bouncer has never seen them before. The original listener stays on the list forever.",
      discover:
        "```tsx\n// ✅ named reference — addEventListener and removeEventListener get the same object\nconst onDown = (e: KeyboardEvent) => { … };\nwindow.addEventListener('keydown', onDown);\nreturn () => window.removeEventListener('keydown', onDown); // ✅ removes it\n\n// ❌ inline in cleanup — different function object every time\nwindow.addEventListener('keydown', (e) => { … });\nreturn () => window.removeEventListener('keydown', (e) => { … }); // ❌ no-op\n\n// ❌ inline in add — can never be removed (no reference to pass to removeEventListener)\nwindow.addEventListener('keydown', (e) => { if (e.key === targetKey) setIsPressed(true); });\n// stored nowhere — cleanup is impossible\n```",
      quickRules:
        "✅ Always store event handler functions in named variables before passing to addEventListener\n✅ Pass the exact same named variable to removeEventListener\n✅ Define handlers inside the useEffect so they close over the current deps\n❌ Never define the handler inline in addEventListener if you need to remove it\n❌ Never recreate the function inline in the cleanup — it's a new object, not the original",
      watchOut:
        "👀 **Watch out:** Defining the handler outside the useEffect to 'share' it between add and remove looks clean but breaks the dependency array. If targetKey changes, the handler closes over the old value and never updates — the hook stops responding to the new key. Define handlers inside the useEffect so they close over fresh deps on each re-run.",
      dryRun:
        "🔁 **Think:** A React component mounts, triggering the useEffect which adds two listeners. Then the component re-renders (not unmounts — just re-renders). Does the cleanup run? If yes, when exactly, and what does React do immediately after it?",
      build:
        "**Learning focus:** Return a cleanup function from useEffect that passes the exact same handler references to removeEventListener — because the event system removes listeners by reference identity, not code equivalence.",
    },
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 5",
    paal: "Fix the dependency array — replace [] with [targetKey] so the effect re-registers listeners when the targetKey prop changes.",
    hint: "The effect uses targetKey inside both handlers. Any value used inside a useEffect that comes from props or state belongs in the dependency array.",
    example_code: `useEffect(() => {
  const onScroll = () => {
    if (window.scrollY > limit) setOver(true);
  };
  window.addEventListener('scroll', onScroll);
  return () => window.removeEventListener('scroll', onScroll);
}, [limit]); // limit is used inside — it belongs in deps`,
    think_prompt:
      "Right now the dependency array is []. The handlers close over targetKey. What happens if the parent changes the targetKey prop after the first render?",
    mc_options: [
      "[] is correct — the effect should only run once, on mount. The handlers already read the latest targetKey at call time.",
      "[targetKey] — the effect closes over targetKey, so when it changes the old handlers still check the old key. The effect must re-run to register handlers that close over the new value.",
      "[setIsPressed] — the setter is the only thing called inside the effect, so it's the only dependency.",
    ],
    mc_correct_option:
      "[targetKey] — the effect closes over targetKey, so when it changes the old handlers still check the old key. The effect must re-run to register handlers that close over the new value.",
    mc_anchor:
      "JavaScript closures capture the value of a variable at the time the function is created. Handlers created in the first render close over the initial targetKey. If targetKey changes, those old handlers still check the old value — they'll never match the new key. Listing targetKey in the dependency array tells React to clean up the old effect and re-run it, creating new handlers that close over the updated value.",
    why_this_matters:
      "A route-details panel might reassign its keyboard shortcut based on context — 'f' to flag when viewing a shipment, 'r' to reroute when editing a driver. If the dependency array ignores targetKey, the hook stops responding to the new shortcut the moment it changes. The old handler keeps listening for the old key silently.",
    answer_keywords: ["targetKey"],
    seed_code: `import { useState, useEffect } from 'react';

function useKeyPress(targetKey: string): boolean {
  const [isPressed, setIsPressed] = useState<boolean>(false);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.key === targetKey) setIsPressed(true);
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === targetKey) setIsPressed(false);
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  return isPressed;
}`,
    starter_code: `import { useState, useEffect } from 'react';

function useKeyPress(targetKey: string): boolean {
  const [isPressed, setIsPressed] = useState<boolean>(false);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.key === targetKey) setIsPressed(true);
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === targetKey) setIsPressed(false);
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []); // fix this dependency array

  return isPressed;
}`,
    feedback_correct:
      "Exactly — targetKey is captured in the handlers' closure, so it belongs in the dependency array. When it changes, React runs cleanup then re-runs the effect with new handlers.",
    feedback_partial:
      "Close — the dependency array needs the value that the handlers close over: targetKey. setIsPressed is stable (same reference across renders) and doesn't need to be listed.",
    feedback_wrong:
      "Change `[]` to `[targetKey]`. The handlers close over targetKey — if it changes and the array stays empty, the old handlers keep listening for the old key forever.",
    expected: `import { useState, useEffect } from 'react';

function useKeyPress(targetKey: string): boolean {
  const [isPressed, setIsPressed] = useState<boolean>(false);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.key === targetKey) setIsPressed(true);
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === targetKey) setIsPressed(false);
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [targetKey]);

  return isPressed;
}`,
    analog_example: `useEffect(() => {
  const handler = (e: StorageEvent) => {
    if (e.key === storageKey) setValue(e.newValue);
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}, [storageKey]); // storageKey is closed over — it belongs here`,
    deepDiveLabel:
      "ESLint says add targetKey to deps — but why doesn't the empty array just work if the key never actually changes?",
    deepDive: {
      hook: "Your hook works perfectly in testing — targetKey never changes in your app, so the empty array causes no visible problems. You ship it. Six months later a new feature lets users remap keyboard shortcuts from a settings panel. The moment a user changes their shortcut key, the hook goes silent. No error. The UI just stops responding. A junior engineer spends a day debugging before finding the stale closure.",
      pain: "⚠️ **Lesson:** The empty dependency array made a bet: 'this value will never change.' When the product proved that bet wrong, the bug was invisible and six months away from the code that caused it. Why does a stale closure produce no error — not even a React warning — even when it's clearly wrong?",
      mentalModel:
        "**Mental model — The photograph problem.** A closure is a photograph of the variables it captures at the moment the function was created. The photograph never updates — even if the people in it change. Your handlers are photographs of targetKey taken at mount time. If targetKey changes, the handlers still see the old face. The dependency array tells React when to take a new photograph. An empty array says 'take one photograph and never update it.'",
      discover:
        "```tsx\n// ❌ stale closure — handler forever checks the initial targetKey value\nuseEffect(() => {\n  const onDown = (e: KeyboardEvent) => {\n    if (e.key === targetKey) setIsPressed(true); // targetKey is stale if it changed\n  };\n  window.addEventListener('keydown', onDown);\n  return () => window.removeEventListener('keydown', onDown);\n}, []); // empty dep array = never re-run = stale handlers\n\n// ✅ fresh closure on every targetKey change\nuseEffect(() => {\n  const onDown = (e: KeyboardEvent) => {\n    if (e.key === targetKey) setIsPressed(true); // targetKey is always fresh\n  };\n  window.addEventListener('keydown', onDown);\n  return () => window.removeEventListener('keydown', onDown);\n}, [targetKey]); // re-run cleanup + effect when key changes\n```",
      quickRules:
        "✅ Every external value used inside a useEffect belongs in the dependency array\n✅ If ESLint's exhaustive-deps warns, listen — it has seen this bug before\n✅ setIsPressed (from useState) is stable — safe to omit\n❌ Don't leave deps empty just because the value 'probably won't change'\n❌ Don't suppress the ESLint warning with a comment — fix the dependency",
      watchOut:
        "👀 **Watch out:** Object and array dependencies trigger re-runs on every render even when their content hasn't changed, because React compares by reference. If targetKey were an object `{ key: 'f', modifier: 'ctrl' }`, listing it in deps would cause the effect to re-run constantly. For objects, either extract the primitive value (`targetKey.key`) or stabilise with useMemo.",
      dryRun:
        "🔁 **Think:** The hook runs with `targetKey = 'f'`. React renders. Effect runs, registers handlers that close over 'f'. Parent re-renders and passes `targetKey = 'Escape'`. Walk through what React does step by step — does it run cleanup, re-run the effect, or both? In what order?",
      build:
        "**Learning focus:** Values closed over inside useEffect must appear in the dependency array — not because the linter says so, but because closures capture values at creation time and go stale when those values change.",
    },
  },
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 5",
    paal: "Build a ShipmentRow component that uses useKeyPress('f') to highlight the row when the 'f' key is held — applying className 'row--flagged' when isPressed is true.",
    hint: "Call useKeyPress at the top of the component. Use the returned boolean to conditionally build the className.",
    example_code: `const InventoryItem = ({ sku, quantity }: InventoryItemProps) => {
  const isScanning = useKeyPress('s');
  return (
    <div className={\`item\${isScanning ? ' item--scanning' : ''}\`}>
      <span>{sku}</span>
      <span>{quantity}</span>
    </div>
  );
};`,
    think_prompt:
      "The hook returns a boolean. The component needs to apply a class when that boolean is true. Where do you call the hook, and how do you wire its return value into className?",
    mc_options: [
      "Call useKeyPress inside the className expression — `className={useKeyPress('f') ? 'row--flagged' : ''}`",
      "Call useKeyPress at the top of the component body, store the result, then use it in the JSX.",
      "Pass useKeyPress as a prop to ShipmentRow so the parent controls the key binding.",
    ],
    mc_correct_option:
      "Call useKeyPress at the top of the component body, store the result, then use it in the JSX.",
    mc_anchor:
      "Hooks must be called at the top level of a component — never inside JSX expressions, conditions, or callbacks. Calling it inline in className violates the Rules of Hooks and will throw a React error. Calling it at the top level gives you a stable boolean variable to use anywhere in the component.",
    why_this_matters:
      "The Rules of Hooks exist because React tracks hook calls by order, not by name. Calling a hook conditionally or inside an expression breaks the call-order contract and causes React to associate the wrong state with the wrong hook across renders. The pattern — call at top level, use the result — is non-negotiable.",
    answer_keywords: [
      "useKeyPress",
      "ShipmentRow",
      "isPressed",
      "row--flagged",
      "className",
    ],
    seed_code: `import { useState, useEffect } from 'react';

function useKeyPress(targetKey: string): boolean {
  const [isPressed, setIsPressed] = useState<boolean>(false);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.key === targetKey) setIsPressed(true);
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === targetKey) setIsPressed(false);
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [targetKey]);

  return isPressed;
}`,
    starter_code: `import { useState, useEffect } from 'react';

function useKeyPress(targetKey: string): boolean {
  const [isPressed, setIsPressed] = useState<boolean>(false);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.key === targetKey) setIsPressed(true);
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === targetKey) setIsPressed(false);
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [targetKey]);

  return isPressed;
}

interface ShipmentRowProps {
  shipmentId: string;
  destination: string;
}

// build ShipmentRow here
// - call useKeyPress('f') at the top level
// - apply className 'row--flagged' when the key is pressed
`,
    feedback_correct:
      "Exactly — useKeyPress called at the top of the component, result stored in a variable, then used to build the conditional className.",
    feedback_partial:
      "Check where you called useKeyPress. It must be at the top level of the component — not inside the JSX return, inside a condition, or inside another function.",
    feedback_wrong:
      "Pattern: `const ShipmentRow = ({ shipmentId, destination }: ShipmentRowProps) => { const isPressed = useKeyPress('f'); return <div className={isPressed ? 'row--flagged' : ''}><span>{shipmentId}</span><span>{destination}</span></div>; };`",
    expected: `import { useState, useEffect } from 'react';

function useKeyPress(targetKey: string): boolean {
  const [isPressed, setIsPressed] = useState<boolean>(false);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.key === targetKey) setIsPressed(true);
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === targetKey) setIsPressed(false);
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [targetKey]);

  return isPressed;
}

interface ShipmentRowProps {
  shipmentId: string;
  destination: string;
}

const ShipmentRow = ({ shipmentId, destination }: ShipmentRowProps): JSX.Element => {
  const isPressed = useKeyPress('f');
  return (
    <div className={isPressed ? 'row--flagged' : ''}>
      <span>{shipmentId}</span>
      <span>{destination}</span>
    </div>
  );
};`,
    analog_example: `const PackageItem = ({ trackingCode, weight }: PackageItemProps) => {
  const isSorting = useKeyPress('s');
  return (
    <li className={isSorting ? 'item--sorting' : ''}>
      <span>{trackingCode}</span>
      <span>{weight}kg</span>
    </li>
  );
};`,
    deepDiveLabel:
      "Every ShipmentRow that uses useKeyPress('f') adds its own window listeners — is that a performance problem?",
    deepDive: {
      hook: "Your dashboard renders 50 ShipmentRow components. Each one calls `useKeyPress('f')`, which attaches its own `keydown` and `keyup` listeners to `window`. You now have 100 active event listeners on the page, all firing on every single keystroke. A user types something into a search input — 100 handlers wake up, check `e.key === 'f'`, and call setIsPressed on 50 components. It works. It's also 100× more work than necessary.",
      pain: "⚠️ **Lesson:** Each useKeyPress call registers its own listeners independently. With 50 rows on screen, 100 listeners fire on every keystroke. What architectural change would reduce this to one listener regardless of how many rows are shown?",
      mentalModel:
        "**Mental model — The broadcast tower.** Right now, every ShipmentRow is its own radio tower tuned to the same frequency. One listener per tower, 50 towers. The alternative: one central tower that broadcasts, and 50 receivers that listen to the broadcast. In React terms, that's lifting the useKeyPress call to the parent and passing `isPressed` as a prop — or using a Context so all rows subscribe to a single state.",
      discover:
        "```tsx\n// ❌ N rows = N listener pairs\nconst ShipmentRow = ({ id }: Props) => {\n  const isPressed = useKeyPress('f'); // each adds 2 window listeners\n  …\n};\n\n// ✅ one listener pair, shared via prop\nconst ShipmentList = ({ shipments }: ListProps) => {\n  const isPressed = useKeyPress('f'); // 2 listeners total, regardless of row count\n  return shipments.map(s => (\n    <ShipmentRow key={s.id} {...s} flagging={isPressed} />\n  ));\n};\n\n// ✅ or shared via Context — rows read from context, hook lives in provider\n```",
      quickRules:
        "✅ For page-level keys (Escape, Enter, f), call useKeyPress once at the highest component that needs it\n✅ Pass the result down as a prop to child components that need to react\n✅ For truly global shortcuts, wrap useKeyPress in a Context provider\n❌ Don't call useKeyPress in every list item independently — it multiplies listeners",
      watchOut:
        "👀 **Watch out:** This lesson calls useKeyPress inside ShipmentRow intentionally — to show the full hook in context. In production with a list, you'd lift it. The lesson pattern is pedagogically correct; the production pattern is to lift it to the list level and pass isPressed as a prop.",
      dryRun:
        "🔁 **Think:** You lift useKeyPress('f') to ShipmentList and pass `flagging={isPressed}` to each row. Now 100 listeners become 2. But a new requirement arrives: each row should respond to a *different* key — row 1 responds to 'f', row 2 to 'g', etc. Does lifting still work, or do you need a different approach?",
      build:
        "**Learning focus:** Consume a custom hook at the top level of a component — never inline in JSX — and understand that each hook call creates independent state and side effects, which has implications for list components.",
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
  lessonNum: 39,
  title: "Custom Hook — useKeyPress",
  shortName: "HOOK — USE KEY PRESS",
});
