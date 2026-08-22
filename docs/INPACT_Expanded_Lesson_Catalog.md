# INPACT Expanded Lesson Catalog

All lessons below follow the INPACT philosophy: buildable artifacts, simulators, or mini-apps—no theoretical topic dumps. Concepts are assigned to the correct track per the track assignment rule.

---

# JavaScript Track Lessons

| Lesson ID | Title | Concept | Artifact / Simulator Idea |
|-----------|--------|---------|---------------------------|
| JS-EL01 | Async Task Queue Visualizer | event loop | Build a small UI that enqueues sync, setTimeout, setInterval, Promise.then, queueMicrotask and displays execution order in a timeline. |
| JS-EL02 | Microtasks vs Macrotasks Arena | microtasks vs macrotasks | Simulator: click to schedule different task types; watch a single-threaded “runner” execute them in correct order with clear labels. |
| JS-EL03 | Secret Vault Counter | closures | Build a closure-based “vault” that holds a private count; only increment/decrement via returned methods; display current count. |
| JS-EL04 | This Binding Playground | this binding | Mini-app with buttons that call the same function via call/apply/bind and display what `this` is in each case. |
| JS-EL05 | TDZ and Hoisting Explorer | TDZ and hoisting | Step-through simulator: declare var/let/const at different lines, “run” and see which line throws (TDZ) vs which returns undefined. |
| JS-EL06 | Promise Combinator Dashboard | promise combinators | Build a panel that runs Promise.all, allSettled, race, any on a set of mock APIs and shows results and timing. |
| JS-EL07 | Unreliable Space Probe API | retry with exponential backoff | Mock API that fails N times then succeeds; build a client with exponential backoff and display attempt log and final result. |
| JS-EL08 | Cancel Fetch with AbortController | cancel fetch | Mini-app: start a long fetch, show a “Cancel” button that aborts the request and updates UI to “Cancelled.” |
| JS-EL09 | Deep Clone with Circular Refs | deep clone with circular refs | Build a deep clone that handles circular references; test with an object that points to itself and display cloned structure. |
| JS-EL10 | Floating Point Precision Lab | floating point precision | Small calculator that shows 0.1 + 0.2 and other classic cases; display raw bits or decimal representation to illustrate precision. |
| JS-EL11 | Async Debugging Trace Viewer | async debugging | Log async operations (fetch, setTimeout, Promise) with timestamps and display a simple trace view to reason about order. |

---

# React-JS Track Lessons

| Lesson ID | Title | Concept | Artifact / Simulator Idea |
|-----------|--------|---------|---------------------------|
| P-RJS01 | Cart Slice Builder | Redux slice (RTK) | Build a small cart slice (add/remove/clear) with createSlice and wire it to a minimal React UI. |
| P-RJS02 | Kanban Store Designer | normalized state | Design a normalized store for boards/columns/cards and render a simple Kanban board from it. |
| P-RJS03 | Filtered Products Dashboard | selector memoization | Product list + filters; build selectors (including memoized) and show filtered list and selector call count. |
| P-RJS04 | Products Cache Explorer | RTK Query | Fetch products with RTK Query; display cache status, refetch, and invalidate tags in a small dashboard. |
| P-RJS05 | Action Flow Visualizer | action flow visualization | Log Redux actions to a sidebar and display action type, payload, and timestamp in a mini “Redux DevTools” style panel. |
| P-RJS06 | Server vs Client State Split | server state vs client state | One panel for “server” data (fetch/cache) and one for “client” (UI toggles, form draft); sync and display both. |
| P-RJS07 | Cache Invalidation Lab | cache invalidation | RTK Query or SWR-style UI: mutate one list, show how invalidation refetches related queries. |
| P-RJS08 | Form vs Remote vs Derived | form / remote / derived state | Single screen: form state (inputs), remote state (loaded user), derived state (computed full name); show all three. |
| P-RJS09 | Finite State Machine UI | finite state machine UI | Build a small flow (e.g. submit → loading → success/error) with explicit states and transitions; buttons only valid per state. |
| P-RJS10 | Reducer Composition Tree | reducer composition | Combine multiple slice reducers into one root; display a simple “state tree” view that updates as actions dispatch. |

*Note: Do not duplicate P01–P112. These are additive; assign new IDs in your catalog (e.g. extend beyond P112 or use a separate namespace).*

---

# React-TS Track Lessons

| Lesson ID | Title | Concept | Artifact / Simulator Idea |
|-----------|--------|---------|---------------------------|
| P-RTS01 | Typed Cart Slice | Redux slice + TypeScript | Same Cart Slice idea with fully typed state, actions, and selectors; show type errors when misusing payload. |
| P-RTS02 | Discriminated Union Form | discriminated unions | Form that submits different payloads (e.g. login vs register) with a single type and type-safe handlers. |
| P-RTS03 | State Machine Typing | state machine typing | Model a small FSM (idle/loading/success/error) with a discriminated union and exhaustive switch. |
| P-RTS04 | Typed Event Emitter | event emitter typing | Small event bus with typed events (e.g. `{ type: 'click'; x: number } \| { type: 'key'; key: string }`) and type-safe subscribe/emit. |
| P-RTS05 | Utility Types Playground | utility types | Mini-app that applies Partial, Required, Pick, Omit to a sample type and displays the resulting shape. |
| P-RTS06 | Interface vs Type Lab | interface vs type | Side-by-side: same shape defined as interface and as type; show declaration merging only with interface. |
| P-RTS07 | Mapped Types Builder | mapped types | Build a “ReadonlyKeys” or “OptionalKeys” style mapped type and render a simple type “preview” (e.g. keys list). |
| P-RTS08 | Recursive Tree Renderer | recursive data structures | Type a tree (node with children: TreeNode[]) and build a small recursive React component that renders it. |
| P-RTS09 | Conditional Types Demo | conditional types | Use conditional types (e.g. “unwrap Promise”) and display inferred types for a few inputs in the UI. |
| P-RTS10 | Any vs Unknown Guard | any vs unknown | Form that returns unknown; build type guards to narrow to a known shape and display validated data or errors. |
| P-RTS11 | Declaration Merging Module | declaration merging | Extend a module’s interface (e.g. add to Window or a namespace) and use the merged type in a tiny React component. |
| P-RTS12 | RTK Query Typed Endpoints | RTK Query + TypeScript | Typed hooks and responses for a small API; show autocomplete and type errors when using wrong response shape. |

---

# Node / Express Track Lessons

## Node.js

| Lesson ID | Title | Concept | Artifact / Simulator Idea |
|-----------|--------|---------|---------------------------|
| NODE-S01 | Stream Pipeline Logger | streams | Read a file with a readable stream, transform (e.g. to uppercase), write to another file; log chunk sizes. |
| NODE-S02 | Worker Threads Number Crunch | worker threads | Offload a CPU-heavy task (e.g. prime count) to a worker; main thread stays responsive; show result and timing. |
| NODE-S03 | CPU Blocking Detector | CPU blocking | Small server: one route blocks the event loop (e.g. long loop); another returns quickly; measure response times. |
| NODE-S04 | Child Process Runner | child processes | Spawn a child script (e.g. list dir) and capture stdout/stderr; display in a simple CLI or log output. |
| NODE-S05 | Require vs Import Tester | require vs import | Two small files: one CJS, one ESM; run both and show how they interact (or fail); document interop. |
| NODE-S06 | Memory Leak Sniffer | memory leaks | Script that grows a global array in a loop; use simple memory snapshot or heap diff to show growth. |
| NODE-S07 | Buffer vs TypedArray Lab | Buffer vs TypedArray | Create a Buffer and a Uint8Array from the same data; display hex dump and demonstrate shared vs copied behavior. |
| NODE-S08 | Unhandled Rejection Handler | unhandled promise rejection | Trigger an unhandled rejection and add process handlers; log and optionally “recover” in a small script. |
| NODE-S09 | nextTick Starvation Demo | process.nextTick starvation | Schedule many nextTicks and one setTimeout; show that nextTicks run first and can delay the timer. |

## Express

| Lesson ID | Title | Concept | Artifact / Simulator Idea |
|-----------|--------|---------|---------------------------|
| EXP-S01 | Middleware Pipeline Visualizer | middleware pipeline | Chain 3–4 middlewares (log, auth, body parse); display request flow and which middleware ran. |
| EXP-S02 | Login Fortress | rate limiting | Add rate limiting to a login route; script or UI that sends many requests and shows 429 after limit. |
| EXP-S03 | Secure File Upload Endpoint | secure file upload | Upload with size/type checks and safe storage path; return file URL or error. |
| EXP-S04 | CORS Policy Tester | CORS | Server with configurable CORS; small frontend on different origin that fetches and shows success or CORS error. |
| EXP-S05 | CSRF Token Roundtrip | CSRF | Form that gets a CSRF token and submits with it; demonstrate same-origin success and cross-origin failure. |
| EXP-S06 | res.end vs res.send Lab | res.end vs res.send | Two routes: one uses res.end, one res.send with object; compare headers and behavior (e.g. Content-Type). |
| EXP-S07 | Large App Router Layout | large app architecture | Sketch a mini Express app with routers (e.g. /api/users, /api/products) and a single entry point. |

---

# CSS Track Lessons

| Lesson ID | Title | Concept | Artifact / Simulator Idea |
|-----------|--------|---------|---------------------------|
| CSS-S01 | Flexbox vs Grid Switcher | flexbox vs grid | Same set of cards laid out with Flexbox and with Grid; toggle and compare use cases (alignment, gaps). |
| CSS-S02 | Stacking Context Explorer | stacking context | Overlapping boxes with different z-index/transform/opacity; show which creates stacking context and order. |
| CSS-S03 | Margin Collapse Simulator | margin collapse | Two sections with margins; adjust display, overflow, padding to show when margins collapse vs not. |
| CSS-S04 | Responsive Layout Systems | responsive layout systems | Breakpoint-based layout (e.g. 1/2/3 columns); resize and show how system adapts. |
| CSS-S05 | Animation Performance Panel | animation performance | Animate with transform vs left/top; use DevTools or frame counter to show smooth vs janky. |
| CSS-S06 | RTL Layout Support Lab | RTL layout support | Same layout in LTR and RTL (dir + logical properties); mirror or flip and show correct reading order. |

---

# System Design Lessons

| Lesson ID | Title | Concept | Artifact / Simulator Idea |
|-----------|--------|---------|---------------------------|
| SD-S01 | Realtime Dashboard | realtime dashboard | Small dashboard that subscribes to “live” data (polling or mock WebSocket) and updates charts/list. |
| SD-S02 | Debounced Search Explorer | debounced search | Search input that triggers API only after debounce; display request count and results. |
| SD-S03 | SSR vs CSR Comparison | SSR vs CSR | Two minimal pages: one “SSR” (pre-rendered list), one “CSR” (fetch then render); compare first paint and interactivity. |
| SD-S04 | Offline-First Todo | offline-first apps | Todo list that works offline (IndexedDB or localStorage), syncs when online; show sync status. |
| SD-S05 | WebSocket vs SSE Tester | websocket vs SSE | Two panels: one WebSocket (bidirectional), one SSE (server push); show message flow and reconnect behavior. |
| SD-S06 | Frontend Caching Strategies | frontend caching strategies | Cache API or in-memory cache with TTL; display cache hits/misses and stale-while-revalidate behavior. |
| SD-S07 | Slow Render Debugging | slow render debugging | Intentionally heavy component; use React DevTools or timings to find bottleneck and “fix” with memoization. |

---

# Production Engineering Lessons

| Lesson ID | Title | Concept | Artifact / Simulator Idea |
|-----------|--------|---------|---------------------------|
| PE-S01 | Zero Downtime Deployment Sim | zero downtime deployment | Mock two versions (v1, v2); “deploy” by switching traffic gradually; show no dropped requests. |
| PE-S02 | Blue-Green vs Canary | blue-green vs canary | Visual: two environments; simulate blue-green (full switch) vs canary (10% → 50% → 100%). |
| PE-S03 | Rollback Strategies | rollback strategies | Simulate failed deploy and rollback (revert commit, redeploy previous image); show steps and outcome. |
| PE-S04 | White Screen Debugging | white screen debugging | Intentionally broken build (e.g. runtime error); use source maps and console to locate and fix. |
| PE-S05 | Source Maps Trace | source maps | Minified bundle + source map; trigger error and show original file/line in stack trace. |
| PE-S06 | Environment Variables in Frontend | environment variables in frontend | Build step that injects env (e.g. API URL); display in UI only in dev or via safe public env. |

---

# Security Lessons

| Lesson ID | Title | Concept | Artifact / Simulator Idea |
|-----------|--------|---------|---------------------------|
| SEC-S01 | Comment Box Attack Lab | XSS | Input that gets rendered unsanitized; inject script and show alert; then fix with sanitization/textContent. |
| SEC-S02 | CSRF Form Attack Demo | CSRF | Malicious page that submits a form to “your” app; show same-origin vs cross-origin and token check. |
| SEC-S03 | Sanitization Playground | sanitization | Input → sanitize (whitelist tags/attrs) → safe HTML output; try payloads and see what’s stripped. |
| SEC-S04 | innerHTML vs textContent | innerHTML vs textContent | Two outputs: one innerHTML, one textContent; same input; show when script runs vs not. |
| SEC-S05 | Cookies vs localStorage | cookies vs localStorage | Store a token in both; show visibility (DevTools), persistence, and send-with-request (cookies only). |
| SEC-S06 | JWT Auth Mini Flow | JWT auth | Login → receive JWT → send in Authorization header to protected route; show decode and expiry. |
| SEC-S07 | OAuth SPA Flow Simulator | OAuth SPA flow | Mock OAuth: redirect to “provider,” callback with code, exchange for token; display steps. |
| SEC-S08 | Secure Cookies Lab | secure cookies | Set cookie with Secure, HttpOnly, SameSite; demonstrate when it’s sent and when not. |
| SEC-S09 | Eval Risks Demo | eval risks | Small “calculator” that uses eval vs safe parse; show code injection and mitigation. |

---

# Leadership Lessons

| Lesson ID | Title | Concept | Artifact / Simulator Idea |
|-----------|--------|---------|---------------------------|
| EL-S01 | Mentoring Simulator | mentoring | Simple scenario: learner is stuck; choose from multiple mentoring responses and see outcome/feedback. |
| EL-S02 | Code Review Simulator | code review | Sample PR with a few issues; mark comments (style, bug, design); get “score” and suggested improvements. |
| EL-S03 | Technical Debt Decisions | technical debt decisions | Scenario: ship fast with debt vs refactor now; choose and see short-term and long-term consequences. |
| EL-S04 | Rewrite vs Incremental Refactor | rewrite vs incremental refactor | Same “legacy” module: path A full rewrite, path B incremental steps; compare risk, time, and outcome. |

---

# State Management Expansion Pack

Focused Redux Toolkit and state architecture lessons (can be assigned to React-JS / React-TS as appropriate).

| Lesson ID | Title | Concept | Artifact / Simulator Idea |
|-----------|--------|---------|---------------------------|
| SM-01 | Redux Fundamentals Counter | Redux fundamentals | Plain Redux: store, reducer, actions, subscribe; build a counter and a “state snapshot” display. |
| SM-02 | Redux Toolkit Slice Counter | Redux Toolkit / slices | Same counter with createSlice; show generated actions and reducer. |
| SM-03 | createAsyncThunk Loader | createAsyncThunk | Load user list with createAsyncThunk; handle pending/success/error in UI and in slice. |
| SM-04 | RTK Query Cache Explorer | RTK Query | Fetch and cache posts; display cache entries, refetch, invalidateByTag. |
| SM-05 | Normalized State Kanban | normalized state | Normalized store (boards, columns, cards); add/remove/move and render from entities. |
| SM-06 | Selectors Without Memo | selectors | Select filtered list without memoization; add many items and show re-render or selector call count. |
| SM-07 | Memoized Selectors Dashboard | memoized selectors | Same list with createSelector; compare performance or call count before/after. |
| SM-08 | Entity Adapters CRUD | entity adapters | Use createEntityAdapter for a list; add, update, remove, reorder; display ids and entities. |
| SM-09 | Optimistic Updates Todo | optimistic updates | Add todo with optimistic update; rollback on server error and show UI revert. |
| SM-10 | Custom Middleware Logger | middleware | Write a small Redux middleware that logs actions and timestamps; wire into store. |
| SM-11 | Store Architecture Split | store architecture | Split store into feature slices (auth, cart, products); single root reducer and state shape. |
| SM-12 | Reducer Composition Tree | reducer composition | Combine reducers (combineReducers or manual); display state tree and which slice changed. |
| SM-13 | Action Flow Visualizer | action flow visualization | (Same as P-RJS05) Log actions and show flow in a mini DevTools-style panel. |
| SM-14 | Server vs Client State | server state vs client state | (Same as P-RJS06) Clear split: server cache vs client UI state in one screen. |
| SM-15 | Cache Invalidation Lab | cache invalidation | (Same as P-RJS07) Invalidate and refetch related data after a mutation. |
| SM-16 | Form vs Remote vs Derived | form / remote / derived state | (Same as P-RJS08) Three kinds of state in one artifact. |
| SM-17 | Finite State Machine UI | finite state machine UI | (Same as P-RJS09) Explicit FSM for a submit flow. |

---

# Summary

- **JavaScript:** 11 lessons (event loop, closures, promises, TDZ, retry, AbortController, deep clone, float, async debug).
- **React-JS:** 10 lessons (Redux/RTK, normalized state, selectors, RTK Query, action flow, server/client state, cache, FSM).
- **React-TS:** 12 lessons (typed slices, discriminated unions, state machine typing, event emitter, utility types, interfaces, mapped/conditional types, recursive types, any vs unknown, declaration merging, RTK Query typed).
- **Node:** 9 lessons (streams, workers, CPU blocking, child processes, require vs import, memory leaks, Buffer vs TypedArray, unhandled rejection, nextTick).
- **Express:** 7 lessons (middleware, rate limiting, file upload, CORS, CSRF, res.end vs res.send, large app layout).
- **CSS:** 6 lessons (flex vs grid, stacking context, margin collapse, responsive systems, animation performance, RTL).
- **System Design:** 7 lessons (realtime dashboard, debounced search, SSR vs CSR, offline-first, WebSocket vs SSE, caching, slow render).
- **Production Engineering:** 6 lessons (zero downtime, blue-green/canary, rollback, white screen, source maps, env in frontend).
- **Security:** 9 lessons (XSS, CSRF, sanitization, innerHTML vs textContent, cookies vs localStorage, JWT, OAuth, secure cookies, eval).
- **Leadership:** 4 lessons (mentoring, code review, tech debt, rewrite vs refactor).
- **State Management Pack:** 17 lessons (overlap with React-JS where applicable; Redux fundamentals through FSM).

All entries are expressed as buildable artifacts, simulators, or mini-apps in line with the INPACT philosophy.
