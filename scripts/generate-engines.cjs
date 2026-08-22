/**
 * Generates inpact_p31-p100 (JS) and inpact_ts31-ts100 (TS) engine files.
 * Run from project root: node scripts/generate-engines.js
 */
const fs = require('fs');
const path = require('path');

const PROBLEMS = [
  [31, 'useFetch', 'Custom hook for data fetching with loading/error/data + AbortController cleanup', 'Reusable fetch with cleanup avoids leaks.'],
  [32, 'useDebounce', 'Debounce any value by a configurable delay', 'Reduces API calls when user types.'],
  [33, 'useLocalStorage', 'Sync state with localStorage — read on mount, write on change', 'Persist preferences across reloads.'],
  [34, 'useToggle', 'Generic boolean toggle hook with optional initial value', 'Modals, accordions, on/off state.'],
  [35, 'useWindowSize', 'Track window width/height with resize listener and cleanup', 'Responsive layouts.'],
  [36, 'usePrevious', 'Return the previous value of any state using useRef', 'Compare prev vs current.'],
  [37, 'useClickOutside', 'Detect clicks outside a referenced element — dropdowns/modals', 'Close on outside click.'],
  [38, 'useKeyPress', 'Detect when a specific keyboard key is pressed', 'Shortcuts, escape to close.'],
  [39, 'useOnlineStatus', 'Track whether the user is online or offline', 'Show banner when offline.'],
  [40, 'useMediaQuery', 'Return true/false based on a CSS media query string', 'Responsive without CSS-in-JS.'],
  [41, 'Theme Context', 'Dark/light mode toggle using Context + useReducer', 'Global theme state.'],
  [42, 'Auth Context', 'Mock auth: login, logout, protected route, user in context', 'Auth state and guards.'],
  [43, 'Cart Context', 'Shopping cart: add, remove, update quantity, total price', 'Global cart state.'],
  [44, 'Notification Context', 'Toast system: push, auto-dismiss, stack limit', 'Global toasts.'],
  [45, 'Context Performance', 'Fix Context that re-renders entire tree — split or memo', 'Avoid over-renders.'],
  [46, 'useReducer vs useState', 'Refactor multi-field form from useState to useReducer', 'Complex form state.'],
  [47, 'Compound Component (Tabs)', 'Tabs component with Context so Tab children know active state', 'Tabs + Context.'],
  [48, 'Unnecessary Re-renders', 'Fix performance bug with React.memo, useMemo, useCallback', 'Stop re-renders.'],
  [49, 'useMemo for Expensive Computation', 'Filter + sort large list — memoize the result', 'Expensive compute.'],
  [50, 'useCallback for Stable References', 'Stabilise callback so child does not re-render', 'Stable refs.'],
  [51, 'React.memo', 'Wrap pure child; demonstrate it stops re-rendering', 'Memo demo.'],
  [52, 'List Virtualization', 'Windowing for 10,000 items (e.g. react-window)', 'Virtual list.'],
  [53, 'Lazy Loading Routes', 'Code splitting with React.lazy + Suspense on routes', 'Lazy routes.'],
  [54, 'Image Lazy Loading', 'Image loads when in viewport (IntersectionObserver)', 'Lazy images.'],
  [55, 'HOC withAuth', 'withAuth HOC that redirects unauthenticated users', 'Auth HOC.'],
  [56, 'Render Props (MouseTracker)', 'MouseTracker using render props pattern', 'Render props.'],
  [57, 'Controlled DatePicker', 'Fully controlled DatePicker component', 'Controlled pattern.'],
  [58, 'Portal', 'Render modal outside root with ReactDOM.createPortal', 'Portals.'],
  [59, 'Error Boundary', 'Class-based Error Boundary with fallback UI', 'Error boundaries.'],
  [60, 'Recursive TreeView', 'Recursive TreeView for nested folders', 'Recursive components.'],
  [61, 'Pagination', 'Client-side pagination for 100 items', 'Pagination.'],
  [62, 'Infinite Scroll', 'Load more on scroll (IntersectionObserver)', 'Infinite scroll.'],
  [63, 'Debounced Search', 'useDebounce + useFetch for real-time search', 'Search UX.'],
  [64, 'Multi-Step Form', '3-step form with validation, back/next, persisted state', 'Wizard form.'],
  [65, 'Generic List<T>', 'Generic List component with custom render function', 'Generics.'],
  [66, 'Discriminated Union Props', 'Button: variant=link requires href, variant=action requires onClick', 'Discriminated unions.'],
  [67, 'useRef Typing', 'Type useRef for DOM element vs mutable value', 'Ref typing.'],
  [68, 'Event Typing', 'Type onChange, onClick, onSubmit in TypeScript', 'Event types.'],
  [69, 'Generic useFetch<T>', 'Add generics to useFetch for typed responses', 'Generic hooks.'],
  [70, 'Utility Types', 'Use Partial, Pick, Omit for prop interfaces', 'Utility types.'],
  [71, 'useImperativeHandle', 'Expose focus()/clear() from child via forwardRef + useImperativeHandle', 'Imperative handle.'],
  [72, 'useSyncExternalStore', 'Subscribe to external store safely in concurrent mode', 'External store.'],
  [73, 'useTransition', 'Mark slow update non-urgent — heavy filtered list demo', 'Transitions.'],
  [74, 'useDeferredValue', 'Defer expensive re-render, keep input responsive', 'Deferred value.'],
  [75, 'useLayoutEffect vs useEffect', 'Explain difference with DOM measurement example', 'Layout effect.'],
  [76, 'Mini Redux', 'Global state with useReducer + Context + useSelector-style hook', 'Mini Redux.'],
  [77, 'Optimistic UI', 'Todo: add item instantly, sync server, rollback on failure', 'Optimistic updates.'],
  [78, 'Request Deduplication', 'Fetch layer that prevents duplicate in-flight same URL', 'Dedup fetch.'],
  [79, 'Polling Hook', 'usePolling: refetch on interval, stop on unmount', 'Polling.'],
  [80, 'WebSocket Hook', 'useWebSocket: connect, reconnect, send + last message', 'WebSocket.'],
  [81, 'Feature Flag Hook', 'useFeatureFlag(flagName) from context', 'Feature flags.'],
  [82, 'Undo/Redo', 'Undo/redo for text editor with useReducer + history stack', 'Undo redo.'],
  [83, 'Form Library from Scratch', 'Mini useForm: register, values/errors/touched, submit', 'useForm.'],
  [84, 'Component Library Theming', 'Token-based theming with CSS variables + Context', 'Theming.'],
  [85, 'Micro-frontend Shell', 'Sketch React as micro-frontend with Module Federation', 'Micro-frontends.'],
  [86, 'Race Condition Fix', 'Fix stale API overwriting fresh — AbortController', 'Race conditions.'],
  [87, 'Memoization Strategy', 'Dashboard with 20 widgets — memoization strategy', 'Memo strategy.'],
  [88, 'Bundle Analysis', 'Webpack Bundle Analyzer + code splitting for slow load', 'Bundle size.'],
  [89, 'Concurrent Mode Gotchas', 'Explain tearing and useSyncExternalStore', 'Tearing.'],
  [90, 'Memory Leak Hunt', 'Find and fix: listener, interval, subscription not cleaned', 'Memory leaks.'],
  [91, 'Test useFetch', 'Test useFetch with renderHook, mock fetch, loading/error/data', 'Test hooks.'],
  [92, 'Test Async Component', 'Test fetch component with msw, assert loading → data', 'Test async.'],
  [93, 'Test User Interactions', 'Test multi-step form: fill, Next, submit, success', 'Test interactions.'],
  [94, 'Test Context', 'Test component consuming Auth Context with mock provider', 'Test context.'],
  [95, 'Test Error Boundary', 'Test that throws in child, assert fallback UI', 'Test error boundary.'],
  [96, 'Design DataTable API', 'Design props for sortable, filterable, paginated table', 'API design.'],
  [97, 'Design Auth Flow', 'Login, token storage, refresh, protected routes, logout', 'Auth design.'],
  [98, 'Design Notification System', 'Toasts: types, auto-dismiss, max 3, queue', 'Notification design.'],
  [99, 'Design Permission System', 'Can action resource component, roles data model', 'Permissions.'],
  [100, 'Design Real-Time Dashboard', 'Poll 5 endpoints, intervals, stale indicators, errors', 'Dashboard design.'],
];

function shortName(title) {
  return title.replace(/\s+/g, ' ').replace(/[^a-zA-Z0-9 ]/g, '').toUpperCase().slice(0, 24);
}

function seedForStep(n, step, isTS) {
  const pre = isTS ? "import { useState } from 'react'\n\n" : "import { useState } from 'react'\n\n";
  return pre + "export default function App() {\n  // Step " + step + "\n}";
}

function makeJS(n, title, body, usecase) {
  const sn = shortName(title);
  return `import createINPACTEngine from "./inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "PROBLEM #${n}", title: "${title}", body: "${body.replace(/"/g, '\\"')}", usecase: "${usecase.replace(/"/g, '\\"')}" } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Understand the goal", "Implement step by step", "Export and verify"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Set up the initial structure and state needed for this lesson.", answer_keywords: ["import", "state", "function"], seed_code: "${seedForStep(n, 1, false).replace(/\n/g, '\\n').replace(/"/g, '\\"')}", feedback_correct: "✅ Step 1 done.", feedback_partial: "Add required setup.", feedback_wrong: "Set up structure", expected: "Initial setup" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Implement the core logic or UI for this lesson.", answer_keywords: ["return", "render", "logic"], seed_code: "${seedForStep(n, 2, false).replace(/\n/g, '\\n').replace(/"/g, '\\"')}", feedback_correct: "✅ Step 2 done.", feedback_partial: "Core logic in place.", feedback_wrong: "Implement core", expected: "Core implementation" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Wire everything together, handle edge cases, and export the component.", answer_keywords: ["export", "default"], seed_code: "${seedForStep(n, 3, false).replace(/\n/g, '\\n').replace(/"/g, '\\"')}", feedback_correct: "✅ Lesson #${n} complete.", feedback_partial: "Export and finish.", feedback_wrong: "Export component", expected: "Complete" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: ${n}, title: "${title}", shortName: "${sn}" });
`;
}

function makeTS(n, title, body, usecase) {
  const sn = 'TS — ' + shortName(title).slice(0, 18);
  return `import createINPACTEngine from "./inpact_engine_shared";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "PROBLEM #${n} (TypeScript)", title: "${title} — Typed", body: "${(body + ' Use TypeScript where appropriate.').replace(/"/g, '\\"')}", usecase: "${usecase.replace(/"/g, '\\"')}" } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Type state and props", "Implement step by step", "Export typed component"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Set up the initial structure and typed state for this lesson.", answer_keywords: ["import", "usestate", "interface"], seed_code: "${seedForStep(n, 1, true).replace(/\n/g, '\\n').replace(/"/g, '\\"')}", feedback_correct: "✅ Step 1 done.", feedback_partial: "Add typed setup.", feedback_wrong: "Set up structure", expected: "Initial setup" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Implement the core logic or UI with proper types.", answer_keywords: ["return", "type"], seed_code: "${seedForStep(n, 2, true).replace(/\n/g, '\\n').replace(/"/g, '\\"')}", feedback_correct: "✅ Step 2 done.", feedback_partial: "Core logic in place.", feedback_wrong: "Implement core", expected: "Core implementation" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Wire everything together and export the typed component.", answer_keywords: ["export", "default"], seed_code: "${seedForStep(n, 3, true).replace(/\n/g, '\\n').replace(/"/g, '\\"')}", feedback_correct: "✅ Lesson #${n} (TS) complete.", feedback_partial: "Export and finish.", feedback_wrong: "Export component", expected: "Complete" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: ${n}, title: "${title} (TS)", shortName: "${sn}" });
`;
}

const enginesDir = path.join(__dirname, '..', 'src', 'engines');
if (!fs.existsSync(enginesDir)) fs.mkdirSync(enginesDir, { recursive: true });

for (const [num, title, body, usecase] of PROBLEMS) {
  const pad = String(num).padStart(2, '0');
  fs.writeFileSync(path.join(enginesDir, `inpact_p${pad}_engine.jsx`), makeJS(num, title, body, usecase));
  fs.writeFileSync(path.join(enginesDir, `inpact_ts${pad}_engine.jsx`), makeTS(num, title, body, usecase));
}

console.log('Generated p31-p100 and ts31-ts100 engine files.');
