
import createINPACTEngine from "../inpact_engine_shared";

function normalizeCode(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

function evalLesson38Step1(answer) {
  const raw = String(answer || "");
  const hasRef = /useRef\s*<\s*(?:HTMLDivElement|HTMLElement|T|Element)[\s\S]*?>/.test(raw) ||
    /useRef\s*<[A-Z][a-zA-Z]*>/.test(raw);
  const hasNull = /useRef[\s\S]*null/.test(raw);
  return hasRef && hasNull ? "correct" : "wrong";
}

function evalLesson38Step2(answer) {
  const raw = String(answer || "");
  const hasHandler = /const\s+handleClick\s*=|function\s+handleClick/.test(raw);
  const hasContains = /\.contains\s*\(/.test(raw);
  const hasCurrent = /\.current/.test(raw);
  const hasCallback = /callback\s*\(\s*\)|handler\s*\(\s*\)/.test(raw);
  return hasHandler && hasContains && hasCurrent && hasCallback ? "correct" : "wrong";
}

function evalLesson38Step3(answer) {
  const raw = String(answer || "");
  const hasEffect = /useEffect\s*\(/.test(raw);
  const hasMousedown = /addEventListener\s*\(\s*['"]mousedown['"]/.test(raw);
  const hasCleanup = /removeEventListener\s*\(\s*['"]mousedown['"]/.test(raw);
  const hasReturn = /return\s*\(\s*\)\s*=>/.test(raw) || /return\s*function/.test(raw);
  return hasEffect && hasMousedown && hasCleanup && hasReturn ? "correct" : "wrong";
}

function evalLesson38Step4(answer) {
  const raw = String(answer || "");
  const hasReturnRef = /return\s+ref/.test(raw);
  return hasReturnRef ? "correct" : "wrong";
}

function evalLesson38Step5(answer) {
  const raw = String(answer || "");
  const hasUseClickOutside = /useClickOutside\s*\(/.test(raw);
  const hasRef = /ref\s*=\s*\{/.test(raw);
  const hasComponent = /const\s+DriverContextMenu\s*=|function\s+DriverContextMenu/.test(raw);
  const hasClose = /setOpen|setVisible|isOpen|visible/.test(raw);
  return hasUseClickOutside && hasRef && hasComponent && hasClose ? "correct" : "wrong";
}

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "LESSON #38 (CUSTOM HOOK)",
      title: "Custom Hook — useClickOutside",
      body: "Build a hook that fires a callback whenever the user clicks outside a target element. The hook uses a ref to identify the element, attaches a mousedown listener to the document, and cleans it up on unmount. The component never touches addEventListener.",
      usecase:
        "In a logistics dashboard, right-clicking a driver row opens a DriverContextMenu. Clicking anywhere else should close it. useClickOutside encapsulates the document listener and ref check so DriverContextMenu stays focused on rendering — not on global click detection.",
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
          "Step 5 renders DriverContextMenu using JSX, including the `ref={menuRef}` prop that connects the DOM node to the hook. The ref prop syntax is JSX and requires the baseline from Lesson 1.",
      },
      {
        lesson: 10,
        label: "useState — Primitives",
        reason:
          "Step 5's DriverContextMenu uses `useState` to track whether the menu is open. The callback passed to useClickOutside calls the setter to close it. Understanding the [value, setter] pattern is required to wire the hook's callback.",
      },
      {
        lesson: 24,
        label: "useEffect — Mount",
        reason:
          "Step 3 registers the document mousedown listener inside useEffect with an empty dependency array. The 'run once on mount' pattern from Lesson 24 is the direct model.",
      },
      {
        lesson: 25,
        label: "useEffect — Dependencies",
        reason:
          "Step 3's useEffect dependency array includes the callback. Understanding how deps control whether an effect re-runs — from Lesson 25 — is required to reason about why `callback` belongs in the deps array here.",
      },
      {
        lesson: 30,
        label: "useRef — DOM Access",
        reason:
          "Step 1 creates a ref with `useRef<HTMLDivElement>(null)` and attaches it to a DOM element via the `ref` prop. Step 2 uses `ref.current.contains(event.target)` to check containment. Both patterns come directly from Lesson 30.",
      },
      {
        lesson: 33,
        label: "Custom Hook — Extract Logic",
        reason:
          "The hook's structure — a function starting with `use`, accepting parameters, encapsulating useRef and useEffect, and returning the ref — follows the custom hook contract established in Lesson 33.",
      },
    ],
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Create a typed ref with useRef<HTMLDivElement>(null) to identify the target element",
      "Write a click handler that uses ref.current.contains() to detect outside clicks",
      "Register the handler on the document with addEventListener('mousedown') in useEffect",
      "Return the cleanup function that removes the listener on unmount",
      "Return the ref from the hook so the component can attach it to a DOM node",
      "Consume the hook in DriverContextMenu to close it on outside clicks",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 5",
    paal: "Define the useClickOutside hook signature — it accepts a callback function that returns void — and create a typed ref with useRef<HTMLDivElement>(null) inside it.",
    hint: "The callback is the action to perform when an outside click is detected. The ref will be attached to the DOM element that defines the 'inside' boundary.",
    example_code: `function useEscapeKey(handler: () => void) {
  const containerRef = useRef<HTMLSectionElement>(null);
  // hook body
}`,
    think_prompt:
      "The hook needs to know two things: what element counts as 'inside', and what to do when the user clicks outside. Which of these is a ref and which is a callback parameter?",
    mc_options: [
      "function useClickOutside(ref: RefObject<HTMLDivElement>)",
      "function useClickOutside(callback: () => void) — and create the ref inside the hook",
      "function useClickOutside(element: HTMLDivElement, callback: () => void)",
    ],
    mc_correct_option:
      "function useClickOutside(callback: () => void) — and create the ref inside the hook",
    mc_anchor:
      "The hook owns the ref — it creates and returns it. The caller owns the callback — it defines what happens on outside click. Accepting a raw `HTMLDivElement` forces the caller to manage the DOM node reference themselves, defeating the point of the hook. Accepting a RefObject as a parameter is also valid but less ergonomic — the caller has to create and manage the ref.",
    why_this_matters:
      "This is the hook's API design decision. A hook that creates and returns the ref gives the caller a clean interface: call the hook, get a ref, attach it, done. A hook that accepts a ref requires the caller to create the ref first — adding a step and spreading the responsibility.",
    answer_keywords: ["useClickOutside", "callback", "() => void", "useRef", "HTMLDivElement", "null"],
    evaluate: evalLesson38Step1,
    seed_code: "",
    starter_code: `// Define useClickOutside here
// - It accepts a callback: () => void
// - It creates a ref typed as HTMLDivElement inside the hook body
// - It returns nothing yet`,
    feedback_correct:
      "Exactly — the hook owns the ref (create it inside), the caller owns the callback (pass it in). Clean separation of responsibilities.",
    feedback_partial:
      "Almost — check that the ref is created inside the hook with useRef<HTMLDivElement>(null), and the callback is the parameter (not the ref).",
    feedback_wrong:
      "Pattern: `function useClickOutside(callback: () => void) { const ref = useRef<HTMLDivElement>(null); }` — callback in, ref created inside.",
    expected: `function useClickOutside(callback: () => void) {
  const ref = useRef<HTMLDivElement>(null);
}`,
    analog_example: `function useEscapeKey(handler: () => void) {
  const containerRef = useRef<HTMLSectionElement>(null);
  // hook body
}`,
    deepDiveLabel:
      "The hook could accept a ref as a parameter instead — why does creating the ref inside feel cleaner?",
    deepDive: {
      hook: "You design the hook to accept the ref as a parameter: `useClickOutside(ref, callback)`. The component must now write `const menuRef = useRef<HTMLDivElement>(null); useClickOutside(menuRef, () => setOpen(false));`. Two lines, two responsibilities. The teammate implementing DriverContextMenu has to know that useClickOutside needs a pre-created ref — they have to read the hook's implementation to understand the contract.",
      pain: "⚠️ **Lesson:** API design for hooks is about minimizing what the caller has to know and manage. When the hook creates and returns the ref, the caller's mental model is: 'I give the hook a callback, I get a ref, I attach it.' When the hook accepts the ref, the caller's mental model is: 'I need a ref, I create it, I pass it to the hook, and I pass the callback too.' Each step the caller has to manage is a place they can make a mistake.",
      mentalModel:
        "**Mental model:** Think of hook API design as a **vending machine contract**.\n- You press one button (pass the callback), you get one thing back (the ref).\n- Compare to: you bring your own cup (create the ref), fill it at the tap (pass it in), and also press a button (pass the callback). More steps, more chances to forget one.\n- Custom hooks are most ergonomic when they minimize what the caller has to supply and maximize what they get back ready-to-use.",
      discover:
        "**Pattern — hook API shapes:**\n```tsx\n// ✅ hook creates ref — minimal caller responsibility\nfunction useClickOutside(callback: () => void) {\n  const ref = useRef<HTMLDivElement>(null);\n  // ...\n  return ref;\n}\n// Call site: const menuRef = useClickOutside(() => setOpen(false));\n// One call, one return, attach and done.\n\n// ⚠️ hook accepts ref — more flexible but more caller work\nfunction useClickOutside(ref: RefObject<HTMLDivElement>, callback: () => void) {\n  // ...\n}\n// Call site:\n// const menuRef = useRef<HTMLDivElement>(null);\n// useClickOutside(menuRef, () => setOpen(false));\n// Two lines, caller must know to create the ref first\n\n// ✅ hook accepts ref — preferred when the ref is already needed for other things\n// (e.g., the component uses the ref for scrollTo as well)\n```",
      quickRules:
        "✅ Create the ref inside the hook when the hook is the only consumer of that ref\n✅ Accept the ref as a parameter when the caller already has a ref for other purposes\n✅ Return a single, ready-to-use thing from the hook when possible\n❌ Don't make callers manage setup state that the hook could own\n❌ Don't over-engineer — pick the API that makes the common case simplest",
      watchOut:
        "👀 **Watch out:** If you create the ref inside the hook and return it, the ref's type is `RefObject<HTMLDivElement>` — it can only be attached to HTMLDivElement elements in the JSX. If the caller wants to attach it to a `<nav>` or `<aside>`, they'd get a TypeScript error. Making the type generic (`useRef<T extends HTMLElement>(null)`) at the hook level is the production solution — but that adds complexity not needed for this lesson.",
      dryRun:
        "🔁 **Think:** The hook creates `useRef<HTMLDivElement>(null)` and returns it. The caller attaches it with `ref={menuRef}`. Before the first render, what is `ref.current`? After the component mounts and the DOM node is created, what does `ref.current` point to? And when the component unmounts and the DOM node is removed, what happens to `ref.current`?",
      build:
        "**Learning focus:** Define a hook that creates and will return a typed ref — understanding that the hook owns the ref, the caller owns the callback, and this separation minimizes what the caller has to know and manage.",
    },
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 5",
    paal: "Write the handleClick function inside the hook — it should check if the click target is outside the ref element using ref.current.contains(), and call the callback if it is.",
    hint: "ref.current can be null before the element mounts — guard against it. `ref.current.contains(event.target as Node)` returns true if the clicked element is inside the ref element.",
    example_code: `const handleOutside = (event: MouseEvent) => {
  if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
    handler();
  }
};`,
    think_prompt:
      "You're listening to every click on the document. Most clicks are inside the menu and should do nothing. A click outside should fire the callback. How does ref.current.contains() tell you which case you're in?",
    mc_options: [
      "const handleClick = (e: MouseEvent) => { if (e.target !== ref.current) { callback(); } }",
      "const handleClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) { callback(); } }",
      "const handleClick = (e: MouseEvent) => { if (!ref.current) { callback(); } }",
    ],
    mc_correct_option:
      "const handleClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) { callback(); } }",
    mc_anchor:
      "contains() returns true for the element itself and all its descendants — so 'not contains' means the click was genuinely outside. The null guard `ref.current &&` is required because ref.current is null before the component mounts. Comparing `e.target !== ref.current` only checks the root element — a click on a child closes the menu incorrectly.",
    why_this_matters:
      "In a DriverContextMenu with nested buttons and icons, a click on any child element must be treated as 'inside'. The contains() check handles the entire subtree. Without it, clicking a button label inside the menu would close the menu — a broken UX that's easy to write and hard to notice in testing.",
    answer_keywords: ["handleClick", "ref.current", "contains", "callback", "MouseEvent"],
    evaluate: evalLesson38Step2,
    seed_code: `function useClickOutside(callback: () => void) {
  const ref = useRef<HTMLDivElement>(null);
}`,
    starter_code: `function useClickOutside(callback: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  // Write handleClick here
  // - It receives a MouseEvent
  // - Guard against ref.current being null
  // - Use contains() to check if the click was outside
  // - Call callback() only if outside
}`,
    feedback_correct:
      "Exactly — the null guard protects against pre-mount calls, contains() covers the entire subtree, and callback fires only on outside clicks.",
    feedback_partial:
      "Almost — check three things: null guard on ref.current, using .contains() (not ===), and calling callback() only in the 'outside' branch.",
    feedback_wrong:
      "Pattern: `const handleClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) { callback(); } }`",
    expected: `function useClickOutside(callback: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      callback();
    }
  };
}`,
    analog_example: `const handleOutside = (event: MouseEvent) => {
  if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
    handler();
  }
};`,
    deepDiveLabel:
      "e.target !== ref.current looks equivalent — so why does contains() handle something that strict equality misses?",
    deepDive: {
      hook: "Your DriverContextMenu renders a list of actions: 'Assign Route', 'View History', 'Send Message'. Each action is a `<button>` nested inside the menu's `<div>`. You use `e.target !== ref.current` as your outside-click check. An operator clicks 'Assign Route'. The click target is the `<button>` — not the `<div>` that ref.current points to. `e.target !== ref.current` evaluates to true. The menu closes. The operator never reaches the action.",
      pain: "⚠️ **Lesson:** `e.target` is the **deepest** element that received the click — the exact node the cursor was over. For a menu with nested children, the target is almost never the root element. Strict equality against the root only checks one node. contains() checks the entire DOM subtree — the root and all its descendants.",
      mentalModel:
        "**Mental model:** Think of contains() as **membership in a family tree**.\n- `e.target === ref.current` — is the clicked element the exact root? Almost never true for nested UIs.\n- `ref.current.contains(e.target)` — is the clicked element the root OR any of its descendants? True for any click inside the menu at any depth.\n- 'Outside' means the clicked element is not in the family tree — `!contains()` captures this correctly.",
      discover:
        "**Pattern — inside/outside check:**\n```tsx\n// ❌ strict equality — only matches the root element, misses all children\nconst handleClick = (e: MouseEvent) => {\n  if (e.target !== ref.current) {\n    callback(); // fires when clicking ANY child inside the menu\n  }\n};\n\n// ✅ contains — matches root and entire subtree\nconst handleClick = (e: MouseEvent) => {\n  if (ref.current && !ref.current.contains(e.target as Node)) {\n    callback(); // fires only when clicking outside the element and all its children\n  }\n};\n\n// ✅ closest — alternative that traverses up the DOM from target\nconst handleClick = (e: MouseEvent) => {\n  if (!(e.target as Element).closest('[data-menu]')) {\n    callback();\n  }\n};\n// Note: closest() requires a selector attribute on the element — less generic\n```",
      quickRules:
        "✅ Always use contains() for inside/outside detection — it covers the full subtree\n✅ Always guard ref.current with a null check — it's null before mount\n✅ Cast event.target as Node when using contains() — TypeScript requires it\n❌ Don't use === to compare the click target to the root element\n❌ Don't skip the null guard — event listeners can fire before the ref is attached",
      watchOut:
        "👀 **Watch out:** `event.target as Node` is a TypeScript cast, not a runtime guarantee. `event.target` is typed as `EventTarget | null` in the DOM typings — a wider type than `Node`. The cast tells TypeScript to trust you that it's a Node (which it always is in practice for mouse events on DOM elements). But if the cast fails at runtime (in unusual circumstances like synthetic events), contains() would throw. In defensive code, you can add a `instanceof Node` check before casting.",
      dryRun:
        "🔁 **Think:** The DriverContextMenu is open. Its DOM structure is: `<div ref={menuRef}> <button>Assign Route</button> <button>View History</button> </div>`. An operator clicks on the text 'Assign Route'. What is `e.target`? Is `ref.current.contains(e.target)` true or false? Does the callback fire? Now the operator clicks on the backdrop outside the menu — what is `e.target` then, and does the callback fire?",
      build:
        "**Learning focus:** Write a mouse event handler that uses ref.current.contains() to distinguish inside from outside clicks — understanding that e.target is the deepest clicked element, that contains() covers the full subtree, and that the null guard is required for pre-mount safety.",
    },
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 5",
    paal: "Register handleClick as a mousedown listener on the document inside useEffect — and return the cleanup function that removes it. Add callback to the dependency array.",
    hint: "Use document.addEventListener (not window) — mousedown fires before click, which prevents the menu from reopening immediately. The dependency array should include callback.",
    example_code: `useEffect(() => {
  document.addEventListener('mousedown', handleOutside);
  return () => {
    document.removeEventListener('mousedown', handleOutside);
  };
}, [handleOutside]);`,
    think_prompt:
      "The event listener needs to be on the document — not the element — because outside clicks don't reach the element. Why should callback be in the dependency array, and why does mousedown work better than click for this use case?",
    mc_options: [
      "useEffect(() => { document.addEventListener('click', handleClick); }, [])",
      "useEffect(() => { document.addEventListener('mousedown', handleClick); return () => { document.removeEventListener('mousedown', handleClick); }; }, [callback])",
      "useEffect(() => { ref.current?.addEventListener('mousedown', handleClick); return () => { ref.current?.removeEventListener('mousedown', handleClick); }; }, [])",
    ],
    mc_correct_option:
      "useEffect(() => { document.addEventListener('mousedown', handleClick); return () => { document.removeEventListener('mousedown', handleClick); }; }, [callback])",
    mc_anchor:
      "document receives every click regardless of where it lands. mousedown fires before click — so the outside click closes the menu before any click handler on a newly-rendered opener button can fire, preventing instant reopen. callback in deps means the effect re-registers when the callback reference changes, keeping the closure fresh.",
    why_this_matters:
      "Using 'click' instead of 'mousedown' causes a timing issue common in enterprise menus: a button opens the menu, the user releases the mouse — the 'click' event fires, the menu closes, the button's click handler fires again, the menu reopens. mousedown fires on press, before the button's click event, breaking the cycle.",
    answer_keywords: ["useEffect", "document", "addEventListener", "mousedown", "handleClick", "removeEventListener", "callback"],
    evaluate: evalLesson38Step3,
    seed_code: `function useClickOutside(callback: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      callback();
    }
  };
}`,
    starter_code: `function useClickOutside(callback: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      callback();
    }
  };

  // Register and clean up the mousedown listener here
  // Use document, not window
  // Add callback to the dependency array
}`,
    feedback_correct:
      "Exactly — document catches all clicks, mousedown fires before click (preventing reopen race), cleanup removes the listener, and callback in deps keeps the handler current.",
    feedback_partial:
      "Almost — check: is it document (not window or ref.current), mousedown (not click), does the effect return a cleanup, and is callback in the dependency array?",
    feedback_wrong:
      "Pattern: `useEffect(() => { document.addEventListener('mousedown', handleClick); return () => { document.removeEventListener('mousedown', handleClick); }; }, [callback]);`",
    expected: `function useClickOutside(callback: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      callback();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [callback]);
}`,
    analog_example: `useEffect(() => {
  document.addEventListener('mousedown', handleOutside);
  return () => {
    document.removeEventListener('mousedown', handleOutside);
  };
}, [handler]);`,
    deepDiveLabel:
      "document and window both receive the event — why does the choice between them matter?",
    deepDive: {
      hook: "You switch the listener to `window.addEventListener('mousedown', handleClick)`. Everything seems equivalent — window receives all DOM events that bubble up. Then an operator opens the DriverContextMenu and clicks on a `<select>` dropdown for a filter panel rendered in an iframe. The click doesn't bubble through window in the parent frame. The menu stays open. The operator has to press Escape manually. The bug is invisible in unit tests but reproducible in the production environment where the filter panel is an iframe embed.",
      pain: "⚠️ **Lesson:** `document` and `window` both receive bubbled DOM events in a flat page, but they differ in subtleties: event propagation order, iframe interaction, and which events reach which target. For outside-click detection, `document` is the conventional target — it's where click events from the document tree terminate before reaching window.",
      mentalModel:
        "**Mental model:** Think of the event bubbling order as a **chain of rooms**.\n- A click starts at the target element.\n- It bubbles up through parent elements → document → window.\n- Listening on `document` catches all events that bubbled through the page.\n- Listening on `window` also works for same-page events, but window additionally receives events from browser chrome and is affected differently by cross-frame interactions.\n- Convention: use `document` for DOM-level event detection, `window` for browser-level events (resize, storage, beforeunload).",
      discover:
        "**Pattern — event target choice:**\n```tsx\n// ✅ document — standard for outside-click detection\ndocument.addEventListener('mousedown', handleClick);\n\n// ⚠️ window — works in same-page scenarios, differs in edge cases\nwindow.addEventListener('mousedown', handleClick);\n\n// ❌ ref.current — only receives events on the element itself (not outside clicks)\nref.current.addEventListener('mousedown', handleClick);\n// An outside click never reaches the element — the listener never fires\n\n// ❌ document.body — some global events don't reach body (though rare)\ndocument.body.addEventListener('mousedown', handleClick);\n```",
      quickRules:
        "✅ Use document for outside-click detection — it's the convention and works in iframes\n✅ Use mousedown instead of click to prevent the open/close race condition\n✅ Include callback in the dependency array to keep the closure current\n✅ Return the cleanup function — missing cleanup accumulates listeners across mounts\n❌ Don't attach the listener to ref.current — outside clicks never reach the target element",
      watchOut:
        "👀 **Watch out:** `callback` in the dependency array looks like it should cause the effect to re-run constantly — a new callback reference on every render means a new addEventListener on every render. This is why in production, `useClickOutside` callers should wrap their callback in `useCallback` to stabilize the reference. Without `useCallback`, the effect re-runs on every render, constantly registering and removing the listener. In this lesson, the basic implementation is correct — the performance fix is a composition concern for the caller.",
      dryRun:
        "🔁 **Think:** A 'Open Menu' button and the DriverContextMenu are on the same page. The operator clicks 'Open Menu'. The mousedown event fires on the button. At that moment, is the DriverContextMenu already open? Has the document listener been registered yet? Walk through the event sequence: button mousedown → useState setter called → React re-renders → DriverContextMenu mounts → useEffect runs → listener registered. When does the listener become active relative to the click that opened the menu?",
      build:
        "**Learning focus:** Register a document mousedown listener in useEffect with a cleanup return and a callback dependency — understanding why document is the correct target, why mousedown prevents the reopen race, and why callback must be in the dependency array.",
    },
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 5",
    paal: "Return the ref from the hook so the caller can attach it to a DOM element.",
    hint: "Return the ref directly — the caller will use it as `ref={menuRef}` on a JSX element.",
    example_code: `function useEscapeKey(handler: () => void) {
  const containerRef = useRef<HTMLSectionElement>(null);
  // ... effect setup ...
  return containerRef;
}`,
    think_prompt:
      "The hook has everything wired up internally. The caller needs one thing from the hook — the ref to attach to the menu element. What does the return statement look like?",
    mc_options: [
      "return { ref, handleClick };",
      "return ref;",
      "return ref.current;",
    ],
    mc_correct_option: "return ref;",
    mc_anchor:
      "Return the ref object itself — not ref.current. The caller needs to pass the ref object to the JSX `ref` prop, which React uses to populate ref.current after mount. Returning ref.current would return null at the time the hook runs — before mount.",
    why_this_matters:
      "This is a common mistake. ref.current is the DOM node — it changes over time and is null before mount. The ref object is stable — it's the same object across renders, and React uses it as the container for the DOM node. JSX expects the ref object, not the value it holds.",
    answer_keywords: ["return", "ref"],
    evaluate: evalLesson38Step4,
    seed_code: `function useClickOutside(callback: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      callback();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [callback]);
}`,
    starter_code: `function useClickOutside(callback: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      callback();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [callback]);

  // Return the ref so the caller can attach it to a DOM element
}`,
    feedback_correct:
      "Exactly — return the ref object, not ref.current. React needs the container to write the DOM node into after mount.",
    feedback_partial:
      "Almost — make sure you're returning `ref` (the RefObject), not `ref.current` (the current value, which is null at hook execution time).",
    feedback_wrong:
      "Pattern: `return ref;` — the ref object itself. ref.current is populated by React after the element mounts.",
    expected: `function useClickOutside(callback: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      callback();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [callback]);

  return ref;
}`,
    analog_example: `function useEscapeKey(handler: () => void) {
  const containerRef = useRef<HTMLSectionElement>(null);
  // ... effect setup ...
  return containerRef;
}`,
    deepDiveLabel:
      "ref and ref.current look equivalent from the outside — what's the actual difference between returning one vs the other?",
    deepDive: {
      hook: "You return `ref.current` instead of `ref`. The caller writes `const menuRef = useClickOutside(...)` and then `<div ref={menuRef}>`. TypeScript immediately flags it: `menuRef` is typed as `HTMLDivElement | null`, but the `ref` prop expects a `RefObject<HTMLDivElement>`. You cast it to silence the error. The component renders — the cast means React receives a DOM node where it expected a ref container. React doesn't know what to do with it and writes nothing. ref.current inside the hook stays null. The outside-click detection never works.",
      pain: "⚠️ **Lesson:** `ref` and `ref.current` are fundamentally different things. `ref` is the stable container — an object with a `current` property that React updates. `ref.current` is the value inside the container at a specific moment in time. Returning ref.current returns a snapshot; returning ref returns the live container.",
      mentalModel:
        "**Mental model:** Think of useRef as a **safe deposit box**.\n- `ref` is the box itself — stable, always the same object, exists across renders.\n- `ref.current` is whatever's in the box right now — null before mount, the DOM node after.\n- React needs the **box** (ref) so it can put the DOM node inside after mounting.\n- If you hand React the **contents** (ref.current = null), it has nothing to work with.",
      discover:
        "**Pattern — ref vs ref.current:**\n```tsx\n// ✅ return the ref object — React can populate it after mount\nfunction useClickOutside(callback: () => void) {\n  const ref = useRef<HTMLDivElement>(null);\n  // ...\n  return ref; // type: RefObject<HTMLDivElement>\n}\n// Caller: const menuRef = useClickOutside(...);\n//         <div ref={menuRef}>  ← React writes the DOM node into menuRef.current\n\n// ❌ return ref.current — snapshot, null at hook execution time\nfunction useClickOutside(callback: () => void) {\n  const ref = useRef<HTMLDivElement>(null);\n  // ...\n  return ref.current; // type: HTMLDivElement | null — null right now\n}\n// Caller: const menuRef = useClickOutside(...);\n// menuRef is null — <div ref={null}> — React attaches nothing\n```",
      quickRules:
        "✅ Return `ref` (the RefObject) when the caller needs to attach it to a DOM node\n✅ Access `ref.current` only inside event handlers and effects — after mount\n✅ Expect ref.current to be null before the component mounts\n❌ Don't return ref.current from a hook — it's a null snapshot, not a live container\n❌ Don't pass ref.current to the JSX ref prop — it's the wrong type",
      watchOut:
        "👀 **Watch out:** `useRef<HTMLDivElement>(null)` types ref.current as `HTMLDivElement | null`. When you access `ref.current` in handleClick, TypeScript doesn't know if it's null. That's why the null guard `ref.current &&` is essential — TypeScript enforces it because ref.current is typed as nullable. Returning `ref` from the hook gives the caller a `RefObject<HTMLDivElement>` — the type that JSX's ref prop expects.",
      dryRun:
        "🔁 **Think:** The hook returns `ref`. The caller writes `const menuRef = useClickOutside(() => setOpen(false))` and renders `<div ref={menuRef}>`. Walk through the timeline: (1) hook runs during render, (2) ref is created with current=null, (3) ref is returned, (4) component renders, (5) React commits the DOM, (6) React calls the ref callback and sets menuRef.current to the div node. At what point in this sequence does `menuRef.current` stop being null?",
      build:
        "**Learning focus:** Return the ref object (not ref.current) from a hook — understanding that ref is the stable container React populates after mount, and that ref.current is a null snapshot at hook execution time that becomes the DOM node only after React commits.",
    },
  },
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 5",
    paal: "Build DriverContextMenu — a component that uses useClickOutside to close itself when the user clicks outside, and renders a list of driver actions inside a div attached to the returned ref.",
    hint: "Call useClickOutside with a callback that sets open state to false. Attach the returned ref to the menu's root div. Only render the menu when open is true.",
    example_code: `const RouteActionsPanel = () => {
  const [visible, setVisible] = useState(true);
  const panelRef = useEscapeKey(() => setVisible(false));
  return visible ? (
    <div ref={panelRef}>
      <button>Edit Route</button>
    </div>
  ) : null;
};`,
    think_prompt:
      "The hook returns a ref. The component needs to track open state separately. When the user clicks outside, the callback fires and sets open to false. How do you wire these three pieces — useState, useClickOutside, and the JSX — together?",
    mc_options: [
      "const DriverContextMenu = () => { useClickOutside(() => {}); return <div>Menu</div>; }",
      "const DriverContextMenu = () => { const [isOpen, setIsOpen] = useState(true); const menuRef = useClickOutside(() => setIsOpen(false)); return isOpen ? <div ref={menuRef}><button>Assign Route</button></div> : null; }",
      "const DriverContextMenu = () => { const menuRef = useRef(null); useClickOutside(() => setIsOpen(false)); return <div ref={menuRef}>Menu</div>; }",
    ],
    mc_correct_option:
      "const DriverContextMenu = () => { const [isOpen, setIsOpen] = useState(true); const menuRef = useClickOutside(() => setIsOpen(false)); return isOpen ? <div ref={menuRef}><button>Assign Route</button></div> : null; }",
    mc_anchor:
      "Three pieces wired correctly: useState tracks open state, useClickOutside callback sets it false, the returned ref goes on the menu div, and the conditional render hides the menu when isOpen is false. The third option creates its own ref and ignores the one from the hook — the hook's ref is never attached, so contains() always compares against null.",
    why_this_matters:
      "This is the complete pattern for any dismissible UI in an enterprise app — dropdowns, tooltips, context menus, popovers. The component owns the visibility state; the hook owns the detection logic. Neither knows about the other's internals — that's the separation that makes both reusable.",
    answer_keywords: ["useClickOutside", "menuRef", "ref={menuRef}", "isOpen", "setIsOpen", "Assign Route"],
    evaluate: evalLesson38Step5,
    seed_code: `function useClickOutside(callback: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      callback();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [callback]);

  return ref;
}`,
    starter_code: `function useClickOutside(callback: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      callback();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [callback]);

  return ref;
}

// Build DriverContextMenu below
// - track open state with useState (start open = true)
// - call useClickOutside with a callback that closes the menu
// - attach the returned ref to the root div
// - conditionally render the menu content when open
const DriverContextMenu = () => {
  // your component here
};`,
    feedback_correct:
      "Exactly — useState for visibility, useClickOutside for detection, ref attached to the menu div, conditional render. The hook handles the global listener; the component handles the state.",
    feedback_partial:
      "Almost — check that the ref from useClickOutside (not a new useRef) is attached to the menu's root div, and that the conditional render uses the isOpen state.",
    feedback_wrong:
      "Pattern: `const [isOpen, setIsOpen] = useState(true); const menuRef = useClickOutside(() => setIsOpen(false)); return isOpen ? <div ref={menuRef}>...</div> : null;`",
    expected: `function useClickOutside(callback: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      callback();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [callback]);

  return ref;
}

const DriverContextMenu = () => {
  const [isOpen, setIsOpen] = useState(true);
  const menuRef = useClickOutside(() => setIsOpen(false));

  return isOpen ? (
    <div ref={menuRef}>
      <button>Assign Route</button>
      <button>View History</button>
      <button>Send Message</button>
    </div>
  ) : null;
};`,
    analog_example: `const RouteActionsPanel = () => {
  const [visible, setVisible] = useState(true);
  const panelRef = useEscapeKey(() => setVisible(false));
  return visible ? (
    <div ref={panelRef}>
      <button>Edit Route</button>
      <button>Cancel Route</button>
    </div>
  ) : null;
};`,
    deepDiveLabel:
      "The menu closes when open — but what happens if the callback fires while the component is unmounting?",
    deepDive: {
      hook: "The operator clicks outside the DriverContextMenu. The mousedown handler fires. `callback()` is called. `setIsOpen(false)` is scheduled. React unmounts the menu. The useEffect cleanup runs — `removeEventListener` is called. But in React 18 strict mode in development, React mounts → unmounts → remounts every component. The cleanup fires after the first unmount, then the component remounts and re-registers the listener. In production this cycle doesn't repeat — but strict mode reveals timing issues that become real bugs at scale.",
      pain: "⚠️ **Lesson:** React 18 Strict Mode deliberately double-invokes mount/unmount cycles in development to expose effects that don't clean up correctly. If your useEffect registers a listener but the cleanup doesn't correctly remove it, Strict Mode shows you by accumulating duplicate listeners during the dev double-mount.",
      mentalModel:
        "**Mental model:** Think of useEffect cleanup as an **undo button for your effect**.\n- The effect registers something: a listener, a timer, a subscription.\n- The cleanup undoes it: removes the listener, clears the timer, unsubscribes.\n- React calls the cleanup before re-running the effect (when deps change) and on unmount.\n- If cleanup doesn't fully undo what the effect did, the next mount starts with leaked state.",
      discover:
        "**Pattern — cleanup completeness:**\n```tsx\n// ✅ complete cleanup — addEventListener and removeEventListener are symmetric\nuseEffect(() => {\n  document.addEventListener('mousedown', handleClick);\n  return () => {\n    document.removeEventListener('mousedown', handleClick);\n  };\n}, [callback]);\n\n// ❌ no cleanup — listeners accumulate on each mount/unmount cycle\nuseEffect(() => {\n  document.addEventListener('mousedown', handleClick);\n  // no return — listener never removed\n}, [callback]);\n\n// ❌ incomplete cleanup — handleClick is recreated on each render\n// addEventListener and removeEventListener receive different references\nconst handleClick = () => { /* ... */ }; // new reference each render\nuseEffect(() => {\n  document.addEventListener('mousedown', handleClick);\n  return () => {\n    document.removeEventListener('mousedown', handleClick); // different reference — does nothing\n  };\n}, []);\n```",
      quickRules:
        "✅ Every addEventListener must have a matching removeEventListener in the cleanup\n✅ Pass the same handler reference to both add and remove\n✅ Test your hook in React 18 Strict Mode — it reveals cleanup failures\n❌ Don't call callback() after the component unmounts — set a mounted flag if needed\n❌ Don't assume Strict Mode behavior is a bug — it's showing you real cleanup issues",
      watchOut:
        "👀 **Watch out:** In the current implementation, if `callback` changes reference between renders (because the caller passes an inline arrow function), the useEffect re-runs — it removes the old listener and adds a new one. This is correct behavior, but it means the listener is re-registered on every render where callback changes. The production fix is for callers to wrap their callback in `useCallback` to stabilize the reference. This is a composition concern — the hook's behavior is correct; the caller's responsibility is to provide a stable callback.",
      dryRun:
        "🔁 **Think:** DriverContextMenu mounts. useEffect runs. The document listener is registered. The operator clicks outside — the menu closes (setIsOpen(false)). React unmounts the DriverContextMenu (because isOpen is false and it returns null). Does the useEffect cleanup run on unmount? At what point is the document listener removed? And if the operator somehow triggers another mousedown immediately after the unmount — before cleanup — what happens?",
      build:
        "**Learning focus:** Consume useClickOutside in a component by attaching the returned ref and wiring the callback to close state — understanding that the hook owns the detection, the component owns the visibility, and the cleanup prevents listener accumulation across mount cycles.",
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
  lessonNum: 38,
  title: "Custom Hook — useClickOutside",
  shortName: "useClickOutside — DRIVER MENU",
});
