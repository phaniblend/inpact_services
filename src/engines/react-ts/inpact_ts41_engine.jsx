
import createINPACTEngine from "../inpact_engine_shared";

function normalizeCode(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

function evalLesson41Step1(answer) {
  const raw = String(answer || "");
  const hasName = /function\s+useMediaQuery|const\s+useMediaQuery\s*=/.test(raw);
  const hasParam = /query\s*:\s*string/.test(raw);
  const hasMatchMedia = /window\.matchMedia\s*\(/.test(raw);
  const hasState = /useState\s*<\s*boolean\s*>/.test(raw);
  return hasName && hasParam && hasMatchMedia && hasState ? "correct"
    : hasName && hasParam && hasState ? "partial" : "wrong";
}

function evalLesson41Step2(answer) {
  const raw = String(answer || "");
  const hasMediaList = /MediaQueryList|mql|mediaList|mediaQuery/.test(raw);
  const hasAddListener = /addEventListener\s*\(\s*['"]change['"]|addListener/.test(raw);
  const hasHandler = /e\.matches|event\.matches/.test(raw);
  const hasSetMatches = /setMatches/.test(raw);
  return hasAddListener && hasHandler && hasSetMatches ? "correct"
    : hasAddListener && hasSetMatches ? "partial" : "wrong";
}

function evalLesson41Step3(answer) {
  const raw = String(answer || "");
  const hasCleanup = /removeEventListener\s*\(\s*['"]change['"]|removeListener/.test(raw);
  const hasReturn = /return\s*\(\s*\)\s*=>|return\s*function/.test(raw);
  const hasDep = /\[\s*query\s*\]/.test(raw);
  return hasCleanup && hasReturn && hasDep ? "correct"
    : hasCleanup && hasReturn ? "partial" : "wrong";
}

function evalLesson41Step4(answer) {
  const raw = String(answer || "");
  const hasUseMediaQuery = /useMediaQuery\s*\(/.test(raw);
  const hasBreakpoint = /min-width|max-width|768|1024/.test(raw);
  const hasConditional = /isMobile|isDesktop|isTablet|isNarrow|isWide|matches/.test(raw);
  return hasUseMediaQuery && hasConditional ? "correct" : hasUseMediaQuery ? "partial" : "wrong";
}

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "LESSON #41 (CUSTOM HOOK)",
      title: "Custom Hook — useMediaQuery",
      body: "Build a hook that evaluates a CSS media query string and tracks whether it currently matches. You'll use the MediaQueryList API to seed initial state, listen for 'change' events as the viewport shifts, clean up on unmount, and keep query in the dependency array — then use the hook to conditionally render different shipment list layouts.",
      usecase:
        "Logistics dashboards run on warehouse floor tablets, fleet manager desktops, and mobile phones. Instead of embedding breakpoint logic in CSS or duplicating it across components, useMediaQuery gives any component a reactive boolean that stays in sync with the viewport — without a resize listener, without manual maths.",
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
        reason: "Step 4 conditionally renders different ShipmentList layouts based on isMobile, using the JSX conditional expression pattern from Lesson 1.",
      },
      {
        lesson: 10,
        label: "useState — Primitives",
        reason: "Step 1 seeds boolean state from `window.matchMedia(query).matches` — same primitive boolean useState pattern as Lesson 10, with a runtime API as the initial value.",
      },
      {
        lesson: 24,
        label: "useEffect — Mount",
        reason: "Steps 2 and 3 wrap the MediaQueryList listener registration inside useEffect — the side-effect-on-mount pattern from Lesson 24.",
      },
      {
        lesson: 25,
        label: "useEffect — Dependencies",
        reason: "Step 3 adds `[query]` to the dependency array — the same closure-staleness analysis from Lesson 25 applies: if the query string changes, the effect must re-run with a fresh MediaQueryList.",
      },
      {
        lesson: 26,
        label: "useEffect — Cleanup",
        reason: "Step 3 returns a cleanup that removes the MediaQueryList 'change' listener — the cleanup pattern from Lesson 26 prevents stale listeners when the component unmounts or the query changes.",
      },
      {
        lesson: 33,
        label: "Custom Hook — Extract Logic",
        reason: "The hook naming convention, single-value return API, and encapsulation boundary all follow the custom hook pattern from Lesson 33.",
      },
    ],
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Create a MediaQueryList object using window.matchMedia and seed useState from its .matches property",
      "Attach a 'change' event listener to the MediaQueryList that updates state when the viewport crosses a breakpoint",
      "Return a cleanup function that removes the 'change' listener on unmount",
      "Add query to the dependency array so the effect re-creates the MediaQueryList when the query string changes",
      "Consume the hook to render different ShipmentList layouts based on viewport width",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 4",
    paal: "Define useMediaQuery — it accepts a query string like '(max-width: 768px)'. Create a MediaQueryList from window.matchMedia(query), seed useState<boolean> from its .matches property, and return the state variable.",
    hint: "window.matchMedia(query) returns a MediaQueryList object. Its .matches property is a boolean — true if the query currently matches.",
    example_code: `function usePrefersDark(): boolean {
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  const [isDark, setIsDark] = useState<boolean>(mql.matches);
  return isDark;
}`,
    think_prompt:
      "You have a query string. The browser has window.matchMedia — a function that evaluates media query strings and returns whether they match right now. How do you get that initial boolean into state?",
    mc_options: [
      "useState<boolean>(false) — start false and let the effect detect a match.",
      "useState<boolean>(window.matchMedia(query).matches) — seed from the MediaQueryList's current .matches value.",
      "useState<boolean>(window.innerWidth < 768) — compute the boolean manually from the viewport width.",
    ],
    mc_correct_option:
      "useState<boolean>(window.matchMedia(query).matches) — seed from the MediaQueryList's current .matches value.",
    mc_anchor:
      "window.matchMedia(query).matches gives you the correct boolean synchronously, before any effect runs. Starting from false means the first render is wrong — a component that should render a desktop layout flashes a mobile layout. Computing from window.innerWidth manually is fragile: it doesn't handle orientation changes, DPR-based queries, or any media feature beyond width.",
    why_this_matters:
      "A tablet-mounted warehouse scanner running the dashboard should see the tablet layout on first render — not a brief flash of the desktop layout while the effect corrects the state. Seeding from .matches gives the right layout immediately. This is the same first-paint correctness principle as seeding from navigator.onLine in useOnlineStatus.",
    answer_keywords: [
      "useMediaQuery",
      "query",
      "string",
      "matchMedia",
      "matches",
      "useState",
      "boolean",
      "return",
    ],
    seed_code: "",
    starter_code: `import { useState } from 'react';

// define useMediaQuery here
// - accepts query: string (e.g. '(max-width: 768px)')
// - create a MediaQueryList with window.matchMedia(query)
// - seed state from mql.matches
// - return the boolean state variable
`,
    feedback_correct:
      "Exactly — MediaQueryList created, .matches used as initial state. No first-paint flicker.",
    feedback_partial:
      "Check the initial value. Starting from false or computing from window.innerWidth misses non-width media features and causes first-paint flash. Seed directly from window.matchMedia(query).matches.",
    feedback_wrong:
      "Pattern: `function useMediaQuery(query: string): boolean { const mql = window.matchMedia(query); const [matches, setMatches] = useState<boolean>(mql.matches); return matches; }`",
    expected: `import { useState } from 'react';

function useMediaQuery(query: string): boolean {
  const mql = window.matchMedia(query);
  const [matches, setMatches] = useState<boolean>(mql.matches);
  return matches;
}`,
    analog_example: `function usePrefersReducedMotion(): boolean {
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  const [reduced, setReduced] = useState<boolean>(mql.matches);
  return reduced;
}`,
    deepDiveLabel:
      "window.matchMedia is called on every render — is that a problem, and how do you fix it?",
    deepDive: {
      hook: "Your hook calls `window.matchMedia(query)` at the top of the function body — outside useEffect, before useState. Every time React renders the component, window.matchMedia runs again. For a component that re-renders 60 times a second during an animation, that's 60 matchMedia calls per second. They're fast — but you're also creating 60 MediaQueryList objects that are immediately discarded.",
      pain: "⚠️ **Lesson:** Calling window.matchMedia outside useEffect creates a new MediaQueryList on every render. For this hook it's not catastrophic — matchMedia is cheap. But it illustrates a broader problem: expensive initialisation code at the top of a hook body runs every render. What's the React mechanism for running initialisation code exactly once?",
      mentalModel:
        "**Mental model — The lazy initialiser.** useState has a second form: `useState(() => expensiveComputation())`. The function is the 'lazy initialiser' — it runs only on the first render, never again. React calls it once to get the initial value, then uses the state from that point forward. For matchMedia specifically, the overhead is small enough not to matter. For a hook that parses a 10,000-row CSV or instantiates a WASM module, the lazy initialiser is the difference between 'works' and 'crawls'.",
      discover:
        "```tsx\n// ❌ creates a new MediaQueryList on every render\nfunction useMediaQuery(query: string): boolean {\n  const mql = window.matchMedia(query); // runs every render\n  const [matches, setMatches] = useState<boolean>(mql.matches);\n  return matches;\n}\n\n// ✅ lazy initialiser — window.matchMedia runs exactly once\nfunction useMediaQuery(query: string): boolean {\n  const [matches, setMatches] = useState<boolean>(\n    () => window.matchMedia(query).matches // called once, on first render\n  );\n  return matches;\n}\n\n// Note: for the listener to stay fresh when query changes,\n// the mql must still be created inside useEffect (next step)\n```",
      quickRules:
        "✅ Use the lazy initialiser `useState(() => computation())` for expensive initial-state calculation\n✅ Keep cheap synchronous reads (navigator.onLine, simple boolean) outside lazy initialiser — readability wins\n✅ The lazy initialiser runs once per component instance — not once globally\n❌ Don't put side effects (addEventListener, fetch) inside the useState initialiser — that belongs in useEffect\n❌ Don't confuse 'expensive' with 'slow to type' — optimise when you measure a problem",
      watchOut:
        "👀 **Watch out:** The lazy initialiser runs on the server during SSR (Next.js, Remix) — and `window` doesn't exist on the server. Always guard with `typeof window !== 'undefined'` before accessing browser APIs in hooks that may be used in SSR contexts.",
      dryRun:
        "🔁 **Think:** The hook uses a lazy initialiser: `useState(() => window.matchMedia(query).matches)`. The parent re-renders and passes a new query string. Does the lazy initialiser re-run with the new query? If not, how does the hook get the correct initial value for the new query?",
      build:
        "**Learning focus:** Seed useState from window.matchMedia(query).matches for accurate first-render state — and understand that initialisation code outside useEffect runs on every render.",
    },
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 4",
    paal: "Inside a useEffect, create a MediaQueryList from window.matchMedia(query), attach a 'change' listener that updates matches state when the query match status changes.",
    hint: "The 'change' event on a MediaQueryList gives you a MediaQueryListEvent with a .matches boolean. Use that to call setMatches.",
    example_code: `useEffect(() => {
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
  mql.addEventListener('change', handler);
}, []);`,
    think_prompt:
      "The viewport changes. A 'change' event fires on your MediaQueryList. What property on the event tells you the new match state?",
    mc_options: [
      "e.target.matches — the MediaQueryList that triggered the event has an updated .matches property.",
      "e.matches — the MediaQueryListEvent carries the new match state directly as a boolean property.",
      "window.matchMedia(query).matches — re-evaluate the query on every change event.",
    ],
    mc_correct_option:
      "e.matches — the MediaQueryListEvent carries the new match state directly as a boolean property.",
    mc_anchor:
      "The MediaQueryListEvent has a `.matches` boolean that reflects the new state. Reading `e.matches` is synchronous and correct. `e.target.matches` also works but reads through the target reference — less direct. Re-calling `window.matchMedia(query).matches` inside the handler creates a new MediaQueryList on every change event — wasteful and potentially creating a new listener each time.",
    why_this_matters:
      "The MediaQueryList API was designed to be reactive — the 'change' event is the recommended way to track viewport transitions in modern browsers, replacing the polling-based approach of listening to window resize events and manually comparing pixel values. This is more efficient and handles non-width media features (orientation, color scheme, reduced motion) correctly.",
    answer_keywords: [
      "useEffect",
      "matchMedia",
      "addEventListener",
      "change",
      "e.matches",
      "setMatches",
    ],
    seed_code: `import { useState } from 'react';

function useMediaQuery(query: string): boolean {
  const mql = window.matchMedia(query);
  const [matches, setMatches] = useState<boolean>(mql.matches);
  return matches;
}`,
    starter_code: `import { useState, useEffect } from 'react';

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(
    () => window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    // attach 'change' listener — use e.matches to update state
  }, []);

  return matches;
}`,
    feedback_correct:
      "Exactly — MediaQueryList created inside the effect, 'change' listener reads e.matches and calls setMatches.",
    feedback_partial:
      "Check what property you're reading from the event. Use `e.matches` directly from the MediaQueryListEvent — it's the most direct and correct source.",
    feedback_wrong:
      "Pattern: `const mql = window.matchMedia(query); const handler = (e: MediaQueryListEvent) => setMatches(e.matches); mql.addEventListener('change', handler);`",
    expected: `import { useState, useEffect } from 'react';

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(
    () => window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
  }, []);

  return matches;
}`,
    analog_example: `useEffect(() => {
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
  mql.addEventListener('change', handler);
}, []);`,
    deepDiveLabel:
      "addListener is simpler and still works — why does the lesson use addEventListener instead?",
    deepDive: {
      hook: "You look up the MediaQueryList API and find `mql.addListener(handler)` — shorter, no event name string, same result. You use it. It works. Three months later a code review flags it: 'addListener is deprecated'. You check MDN. It was deprecated in 2020. The browser still supports it, but it's on the path to removal and TypeScript may already warn about it.",
      pain: "⚠️ **Lesson:** addListener and removeListener were the original MediaQueryList API. They were replaced by addEventListener('change', …) and removeEventListener('change', …) in 2020. Why were they replaced, and what does 'deprecated but still works' mean for production code?",
      mentalModel:
        "**Mental model — The toll booth.** A deprecated API is like an old toll booth lane that's still open but has a 'Closing Soon' sign. Traffic flows through today. Next quarter, the lane closes. Using the old lane now means future rework when browsers finally drop support — plus TypeScript may already block you with a type error. The new lane (addEventListener) is the same distance away and the same speed. There's no benefit to using the old one.",
      discover:
        "```tsx\n// ❌ deprecated — addListener / removeListener\nconst mql = window.matchMedia(query);\nmql.addListener(handler);    // deprecated since 2020\nmql.removeListener(handler); // deprecated since 2020\n// TypeScript strict mode: Property 'addListener' does not exist on type 'MediaQueryList'\n\n// ✅ modern — addEventListener / removeEventListener\nconst mql = window.matchMedia(query);\nmql.addEventListener('change', handler);    // standard EventTarget API\nmql.removeEventListener('change', handler); // same reference required\n```\nThe modern API also aligns with how all other browser event targets work — window, document, DOM elements — so there's only one pattern to remember.",
      quickRules:
        "✅ Use mql.addEventListener('change', handler) for MediaQueryList\n✅ Use mql.removeEventListener('change', handler) in cleanup\n❌ Don't use mql.addListener — deprecated since 2020\n❌ Don't use mql.removeListener — deprecated since 2020\n✅ The event name is always 'change' for MediaQueryList",
      watchOut:
        "👀 **Watch out:** Firefox removed addListener support in Firefox 116 (August 2023). If your application targets Firefox and you use addListener, it silently breaks — no event fires, no error thrown. The deprecation is not academic.",
      dryRun:
        "🔁 **Think:** You have `mql.addEventListener('change', handler)` inside a useEffect with deps `[query]`. The parent passes a new query string. React runs the cleanup first, calling `mql.removeEventListener('change', handler)`. Then it re-runs the effect. But `mql` was a local variable inside the old effect run — the cleanup has a reference to the old mql and the old handler. Does removeEventListener correctly remove the right listener?",
      build:
        "**Learning focus:** Use the modern addEventListener('change', handler) API on MediaQueryList, reading e.matches from the MediaQueryListEvent to update state.",
    },
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 4",
    paal: "Complete the hook: return a cleanup function from the useEffect that removes the 'change' listener, and add query to the dependency array.",
    hint: "Same cleanup pattern as previous hooks. The dep array needs query because the MediaQueryList is created from it — a new query string requires a new mql and a new listener.",
    example_code: `useEffect(() => {
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
  mql.addEventListener('change', handler);
  return () => mql.removeEventListener('change', handler);
}, ['(prefers-reduced-motion: reduce)']); // static string — could also be []`,
    think_prompt:
      "The mql is created from query inside the effect. If query changes, what happens to the old mql and its listener without a cleanup?",
    mc_options: [
      "The old mql is garbage-collected automatically — no cleanup needed.",
      "The old mql stays active with the old query. Its listener never updates to the new query. Both old and new listeners fire. Add cleanup and [query].",
      "React automatically re-creates the effect when any variable in its body changes — no dep array needed.",
    ],
    mc_correct_option:
      "The old mql stays active with the old query. Its listener never updates to the new query. Both old and new listeners fire. Add cleanup and [query].",
    mc_anchor:
      "The MediaQueryList object is a live object attached to the browser's layout engine. It keeps firing events regardless of whether its parent component or effect is still around. Without cleanup + [query] in deps, every query change accumulates an additional active listener — all of them calling setMatches, all on different queries.",
    why_this_matters:
      "A dashboard that lets users toggle between 'tablet view' and 'desktop view' (changing the query at runtime) would accumulate listeners silently. After 10 toggles there are 10 listeners firing. The state updates become unpredictable — whichever listener fires last wins. Cleanup + correct deps are what makes the hook safe to use with dynamic query strings.",
    answer_keywords: [
      "return",
      "removeEventListener",
      "change",
      "handler",
      "query",
    ],
    seed_code: `import { useState, useEffect } from 'react';

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(
    () => window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
  }, []);

  return matches;
}`,
    starter_code: `import { useState, useEffect } from 'react';

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(
    () => window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    // return cleanup and fix the dependency array
  }, []);

  return matches;
}`,
    feedback_correct:
      "Exactly — cleanup removes the listener from the correct mql, and [query] ensures a fresh mql is created when the query string changes.",
    feedback_partial:
      "Check two things: make sure you're returning the cleanup (not calling removeEventListener inline), and make sure [query] is in the dependency array — not [].",
    feedback_wrong:
      "Pattern: `return () => mql.removeEventListener('change', handler);` inside the useEffect, and `[query]` as the dependency array.",
    expected: `import { useState, useEffect } from 'react';

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(
    () => window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}`,
    analog_example: `useEffect(() => {
  const mql = window.matchMedia(breakpoint);
  const handler = (e: MediaQueryListEvent) => setActive(e.matches);
  mql.addEventListener('change', handler);
  return () => mql.removeEventListener('change', handler);
}, [breakpoint]);`,
    deepDiveLabel:
      "cleanup runs when query changes — but the lazy initialiser doesn't re-run. Is the state stale for the new query?",
    deepDive: {
      hook: "The parent passes `query = '(max-width: 768px)'`. The lazy initialiser runs, reads .matches, sets state. The effect runs, creates an mql, adds a listener. Now the parent passes `query = '(min-width: 1024px)'`. React runs cleanup — removes the old listener. Then re-runs the effect with the new query — creates a new mql, adds a new listener. But the lazy initialiser already ran — it used the old query. Is the state value correct for the new query at this moment?",
      pain: "⚠️ **Lesson:** The lazy initialiser runs only once. When query changes, the effect re-runs and registers a new listener for the new query. But between cleanup and the first 'change' event for the new query, the state still holds the old value. Is this a real problem, and how do you fix it?",
      mentalModel:
        "**Mental model — The meter reader.** The lazy initialiser is the meter reader who checks the meter once when you move in. After that, bills come in the mail (the 'change' event). If you move to a new house (new query), the first bill won't arrive until the next billing cycle. There's a brief moment where your records show the old house's usage. The fix: read the meter again when you move — update state at the top of the effect when query changes.",
      discover:
        "```tsx\n// ❌ state is briefly stale after a query change\nuseEffect(() => {\n  const mql = window.matchMedia(query);\n  const handler = (e: MediaQueryListEvent) => setMatches(e.matches);\n  mql.addEventListener('change', handler);\n  return () => mql.removeEventListener('change', handler);\n}, [query]);\n// state still holds the old query's match value until the first 'change' event\n\n// ✅ re-sync state immediately when query changes\nuseEffect(() => {\n  const mql = window.matchMedia(query);\n  setMatches(mql.matches); // ← immediately correct for new query\n  const handler = (e: MediaQueryListEvent) => setMatches(e.matches);\n  mql.addEventListener('change', handler);\n  return () => mql.removeEventListener('change', handler);\n}, [query]);\n```\nAdding `setMatches(mql.matches)` at the top of the effect ensures state is correct the moment the query changes — before any 'change' event fires.",
      quickRules:
        "✅ Re-read mql.matches at the top of the effect to re-sync state when query changes\n✅ The listener handles ongoing viewport transitions after the initial sync\n✅ The lazy initialiser handles first-render accuracy\n❌ Don't assume the 'change' event will fire immediately after a query change — it only fires when the viewport actually crosses the threshold\n❌ Don't put setMatches in the dep array — it's stable",
      watchOut:
        "👀 **Watch out:** Calling `setMatches(mql.matches)` at the top of the useEffect means every time the effect re-runs (on query change), React schedules a state update. If the new query's .matches result is the same as the current state, React bails out of re-render — no flicker. But if it's different, there will be a render. This is correct behaviour.",
      dryRun:
        "🔁 **Think:** The hook is called with `'(max-width: 768px)'` on a 1200px viewport. Matches is false. The parent changes the query to `'(min-width: 1024px)'`. Without the extra `setMatches(mql.matches)` line, what does matches return between the cleanup running and the first 'change' event? With the line, what does it return?",
      build:
        "**Learning focus:** Add cleanup and [query] to the dependency array, and understand why re-reading mql.matches at the top of the effect prevents a stale-state window when the query changes.",
    },
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 4",
    paal: "Build a ShipmentList component that uses useMediaQuery to detect mobile viewport (max-width: 768px) and renders a compact card layout on mobile and a full table layout on wider screens.",
    hint: "Call the hook with '(max-width: 768px)'. Store the result in isMobile. Use it to conditionally render one of two layouts.",
    example_code: `const DriverList = ({ drivers }: DriverListProps) => {
  const isCompact = useMediaQuery('(max-width: 600px)');
  return (
    <div>
      {isCompact
        ? <ul>{drivers.map(d => <li key={d.id}>{d.name}</li>)}</ul>
        : <table><tbody>{drivers.map(d => <tr key={d.id}><td>{d.name}</td><td>{d.route}</td></tr>)}</tbody></table>
      }
    </div>
  );
};`,
    think_prompt:
      "isMobile is true on small screens, false on large. You want different JSX for each. Which JSX conditional pattern is cleanest when both branches have real content?",
    mc_options: [
      "{isMobile && <MobileLayout />} — render only the mobile layout, hide the desktop layout.",
      "{isMobile ? <MobileLayout /> : <DesktopLayout />} — render one or the other, never both.",
      "Two separate return statements — if (isMobile) return <MobileLayout />; else return <DesktopLayout />;",
    ],
    mc_correct_option:
      "{isMobile ? <MobileLayout /> : <DesktopLayout />} — render one or the other, never both.",
    mc_anchor:
      "When both branches have content, a ternary is the clearest JSX pattern — it makes explicit that exactly one branch renders. `&&` is for 'show this or nothing'. Two separate returns work but put layout logic above the JSX — the ternary keeps it inline and visible. Early returns are fine in components but harder to read when the branches are large JSX trees.",
    why_this_matters:
      "Adaptive layouts are a first-class concern in logistics UIs used across device types. Using a ternary inside JSX keeps both layout branches visible side-by-side — a reviewer can see both layouts in one glance. Separate early returns hide one branch above the fold and make it easy to miss the conditional entirely.",
    answer_keywords: [
      "useMediaQuery",
      "ShipmentList",
      "isMobile",
      "max-width",
      "768",
    ],
    seed_code: `import { useState, useEffect } from 'react';

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(
    () => window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}`,
    starter_code: `import { useState, useEffect } from 'react';

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(
    () => window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

interface ShipmentRecord {
  id: string;
  destination: string;
  status: string;
  carrier: string;
}

interface ShipmentListProps {
  shipments: ShipmentRecord[];
}

// Build ShipmentList here
// - call useMediaQuery('(max-width: 768px)')
// - on mobile: render a compact list of destinations
// - on desktop: render a table with id, destination, status, carrier columns
`,
    feedback_correct:
      "Exactly — hook at the top level, ternary picks the layout, both branches visible in one glance.",
    feedback_partial:
      "Check the query string — it should be '(max-width: 768px)'. Also confirm you're using a ternary (not &&) since both branches have real content.",
    feedback_wrong:
      "Pattern: `const isMobile = useMediaQuery('(max-width: 768px)'); return isMobile ? <ul>{shipments.map(…)}</ul> : <table>…</table>;`",
    expected: `import { useState, useEffect } from 'react';

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(
    () => window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

interface ShipmentRecord {
  id: string;
  destination: string;
  status: string;
  carrier: string;
}

interface ShipmentListProps {
  shipments: ShipmentRecord[];
}

const ShipmentList = ({ shipments }: ShipmentListProps): JSX.Element => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return (
    <div>
      {isMobile ? (
        <ul>
          {shipments.map(s => (
            <li key={s.id}>{s.destination} — {s.status}</li>
          ))}
        </ul>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Destination</th><th>Status</th><th>Carrier</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map(s => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.destination}</td>
                <td>{s.status}</td>
                <td>{s.carrier}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};`,
    analog_example: `const RoutePanel = ({ routes }: RoutePanelProps) => {
  const isNarrow = useMediaQuery('(max-width: 600px)');
  return (
    <section>
      {isNarrow
        ? <ol>{routes.map(r => <li key={r.id}>{r.name}</li>)}</ol>
        : <div className="route-grid">{routes.map(r => <RouteCard key={r.id} {...r} />)}</div>
      }
    </section>
  );
};`,
    deepDiveLabel:
      "useMediaQuery re-renders the whole list on breakpoint cross — is there a way to avoid re-rendering every row?",
    deepDive: {
      hook: "Your ShipmentList works. On a 2000-row list, the user drags the browser window across the 768px breakpoint. React unmounts the table, mounts the list — 2000 row components re-mount. The 'change' event fires exactly once, but the component tree rebuilds completely. On a mobile browser, this takes 400ms. The UI stutters.",
      pain: "⚠️ **Lesson:** Switching between table and list layouts on breakpoint cross destroys and recreates the entire component tree. What architectural choices reduce the cost of layout switching on large datasets?",
      mentalModel:
        "**Mental model — CSS vs JS layout switching.** The hook gives you a boolean to drive JS-level layout decisions. But CSS can also switch layouts — via media queries in stylesheets. CSS transitions don't cause React re-renders. For pure visual layout changes (columns → rows, show/hide columns), a CSS solution may be strictly better. The hook's power is when layout switching changes *which components mount* — different data fetching, different accessibility tree, different event handlers. For pure visual rearrangement, prefer CSS.",
      discover:
        "```tsx\n// ❌ full remount on every breakpoint cross — two completely different component trees\nreturn isMobile\n  ? <MobileList shipments={shipments} />   // mounts on narrow\n  : <DesktopTable shipments={shipments} />; // mounts on wide\n\n// ✅ CSS-only column hiding — no JS, no re-mount\nreturn (\n  <table className=\"shipment-table\">\n    <tbody>\n      {shipments.map(s => (\n        <tr key={s.id}>\n          <td>{s.id}</td>\n          <td>{s.destination}</td>\n          {/* hide carrier column on mobile via CSS */}\n          <td className=\"col-carrier\">{s.carrier}</td>\n        </tr>\n      ))}\n    </tbody>\n  </table>\n);\n// in CSS: @media (max-width: 768px) { .col-carrier { display: none; } }\n\n// ✅ useMediaQuery for structural changes that require different logic\n// (different APIs, different a11y trees, different events)\n```",
      quickRules:
        "✅ Use CSS media queries for visual-only layout changes (column widths, display modes, hiding elements)\n✅ Use useMediaQuery when layout change requires different component logic, data, or accessibility structure\n✅ React.memo on list rows reduces re-render cost when the parent re-renders\n❌ Don't reach for useMediaQuery for every responsive change — CSS is cheaper\n❌ Don't mount two full trees and hide one with CSS — both mount, both render, both cost memory",
      watchOut:
        "👀 **Watch out:** Server-side rendering with useMediaQuery is problematic — window doesn't exist on the server, and the server can't know the client's viewport. The hook must either return a default value on the server or be guarded with a `typeof window !== 'undefined'` check. Without this, Next.js and Remix apps throw on the server.",
      dryRun:
        "🔁 **Think:** You decide to use CSS to hide columns instead of useMediaQuery to switch layouts. The mobile design also requires a different sort order — cards sorted by urgency on mobile, by shipment ID on desktop. Can CSS handle this alone? At what point does the requirement force you back to useMediaQuery?",
      build:
        "**Learning focus:** Consume useMediaQuery to drive conditional layouts via a ternary, and understand when CSS media queries are preferable to JS-driven layout switching.",
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
  lessonNum: 41,
  title: "Custom Hook — useMediaQuery",
  shortName: "HOOK — USE MEDIA QUERY",
});
