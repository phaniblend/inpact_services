import createINPACTEngine from "../inpact_engine_shared";

function normalizeCode(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

function evalLesson49Step1(answer) {
  const raw = String(answer || "");
  const hasLazy = /const\s+RouteMap\s*=\s*React\.lazy\s*\(|const\s+RouteMap\s*=\s*lazy\s*\(/m.test(raw);
  const hasDynamicImport = /import\s*\(\s*['"].*RouteMap.*['"]\s*\)/m.test(raw);
  return hasLazy && hasDynamicImport ? "correct" : "wrong";
}

function evalLesson49Step2(answer) {
  const raw = String(answer || "");
  const hasSuspense = /<Suspense/m.test(raw);
  const hasFallback = /fallback\s*=\s*\{/m.test(raw);
  const wrapsLazy = /RouteMap/m.test(raw);
  return hasSuspense && hasFallback && wrapsLazy ? "correct" : "wrong";
}

function evalLesson49Step3(answer) {
  const raw = String(answer || "");
  const hasLazyDriver = /const\s+DriverSummary\s*=\s*(?:React\.)?lazy\s*\(/m.test(raw);
  const hasLazyWarehouse = /const\s+WarehouseList\s*=\s*(?:React\.)?lazy\s*\(/m.test(raw);
  return hasLazyDriver && hasLazyWarehouse ? "correct" : "wrong";
}

function evalLesson49Step4(answer) {
  const raw = String(answer || "");
  const hasNamedExport = /export\s+default/m.test(raw);
  const hasLazyUsage = /(?:React\.)?lazy\s*\(\s*\(\s*\)\s*=>\s*import\s*\(/m.test(raw);
  return hasNamedExport && hasLazyUsage ? "correct" : "wrong";
}

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "LESSON #49 (PERFORMANCE)",
      title: "Code Splitting + React.lazy",
      body: "Every byte of JavaScript that ships in your initial bundle is a byte the browser must download, parse, and execute before your app becomes interactive. Code splitting with React.lazy defers heavy components until the moment they're actually needed — cutting initial load time without changing any business logic.",
      usecase:
        "A logistics platform's dashboard has a RouteMap component built on top of a mapping library (Leaflet, Mapbox) that weighs 200kb. 90% of users never navigate to the map view. Without code splitting, every user pays the 200kb cost on every page load. With React.lazy, that cost is only paid when a user actually opens the map — and zero cost for everyone else.",
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
        reason: "Step 2 wraps the lazy component in `<Suspense fallback={<p>Loading...</p>}>` — JSX attribute syntax (fallback as a JSX expression in curly braces) is required to write the fallback prop correctly.",
      },
      {
        lesson: 10,
        label: "useState — Primitives",
        reason: "Step 3 uses `useState<string>('map')` to track which lazy panel is active. Without understanding useState's typed initialization, the state-driven conditional rendering won't make sense.",
      },
      {
        lesson: 24,
        label: "useEffect — Mount",
        reason: "Step 4 combines lazy loading with a useEffect-triggered data fetch — the lazy component fetches its own data on mount. Without Lesson 24, the interaction between lazy initialization and effect timing is opaque.",
      },
    ],
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Use React.lazy with a dynamic import() to defer a heavy component's bundle",
      "Wrap a lazy component in Suspense with a fallback UI",
      "Split multiple components into separate lazy declarations",
      "Understand the default export requirement for React.lazy",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 4",
    paal: "Declare RouteMap as a lazy component using React.lazy and a dynamic import() pointing to './RouteMap'.",
    hint: "React.lazy takes a function that returns a Promise — the dynamic import() is that function. Arrow function, no arguments.",
    example_code: `const DriverSummary = lazy(() => import('./DriverSummary'));`,
    think_prompt:
      "React.lazy wraps a dynamic import. The import() call returns a Promise — but lazy doesn't just accept a Promise. What must the Promise resolve to for lazy to work?",
    mc_options: [
      "const RouteMap = lazy('./RouteMap')",
      "const RouteMap = lazy(() => import('./RouteMap'))",
      "const RouteMap = React.import(() => './RouteMap')",
    ],
    mc_correct_option: "const RouteMap = lazy(() => import('./RouteMap'))",
    mc_anchor:
      "lazy takes a function (thunk) that returns a Promise — not a path string directly. The dynamic `import()` is that Promise. The thunk is called on the first render that needs RouteMap — not at module load time. This is the deferral mechanism.",
    why_this_matters:
      "The thunk pattern is what makes lazy loading truly lazy. If you passed `import('./RouteMap')` directly (without wrapping in a function), the import would fire immediately when the module loads — before the user navigates to the map view. The function wrapper ensures the import only fires on first render demand.",
    answer_keywords: ["lazy", "import", "RouteMap", "=>"],
    evaluate: evalLesson49Step1,
    seed_code: "",
    starter_code: `import { lazy } from 'react';

// declare RouteMap as a lazy component
// it imports from './RouteMap'`,
    feedback_correct:
      "Exactly — lazy wraps a thunk that returns the dynamic import. The import fires only when RouteMap is first rendered, not when this module loads.",
    feedback_partial:
      "Check the pattern: `lazy(() => import('./RouteMap'))` — the import must be wrapped in an arrow function so it's deferred, not executed immediately.",
    feedback_wrong:
      "Pattern: `const RouteMap = lazy(() => import('./RouteMap'));` — lazy takes a function that returns a dynamic import Promise.",
    expected: `import { lazy } from 'react';

const RouteMap = lazy(() => import('./RouteMap'));`,
    analog_example: `const WarehouseList = lazy(() => import('./WarehouseList'));`,
    deepDiveLabel:
      "The dynamic import points to './RouteMap' — but what does the module at that path need to export for React.lazy to work?",
    deepDive: {
      hook: "You set up React.lazy for RouteMap, add Suspense with a fallback, and navigate to the map view. The fallback flashes briefly — then a runtime error fills the screen: 'Element type is invalid'. The component file exists. The import path is correct. The bundle split worked — you can see a separate chunk in the network panel. But React can't render it. The problem is one line at the bottom of RouteMap.tsx.",
      pain: "⚠️ **Lesson:** React.lazy requires the Promise to resolve to a module with a `default` export. What exactly happens at runtime if the module uses only named exports and has no default?",
      mentalModel:
        "**Mental model:** React.lazy is a **named-slot reader**. When the Promise resolves, lazy looks at the module object and reads `module.default`. If `module.default` is a React component, it renders it. If `module.default` is `undefined` (because the file only has named exports), lazy receives `undefined` and React throws 'Element type is invalid' — it can't render undefined. Think of it as a vending machine that only accepts items in slot A. Put your item in slot B (a named export), and the machine says invalid.",
      discover:
        "**Pattern — default export requirement:**\n```tsx\n// ✅ RouteMap.tsx — valid for React.lazy\nconst RouteMap = () => <div>Map view</div>;\nexport default RouteMap;\n\n// ❌ RouteMap.tsx — named export only, lazy will get undefined\nexport const RouteMap = () => <div>Map view</div>;\n// No default export → lazy fails at runtime\n\n// ✅ workaround if you can't change the source file\nconst RouteMap = lazy(() =>\n  import('./RouteMap').then((mod) => ({ default: mod.RouteMap }))\n);\n// Manually reshape the module to have a default property\n```",
      quickRules:
        "**Quick rules:**\n- ✅ The lazily loaded component file MUST have `export default`\n- ✅ Use the `.then()` reshape pattern if you're lazy-loading a named export you can't modify\n- ✅ Dynamic `import()` always returns a Promise — lazy just wraps the timing\n- ❌ Named exports alone will cause 'Element type is invalid' at runtime — no compile-time error\n- ❌ Don't call lazy inside a component body — it must be at module scope",
      watchOut:
        "👀 **Watch out:** Calling `lazy()` inside a component function body is a common mistake when first learning the pattern. Every render creates a new lazy reference, which React treats as a new component type — triggering an unmount/remount cycle on every render. This causes the Suspense fallback to flash on every re-render, not just the first load. Always declare lazy components at module scope.",
      dryRun:
        "🔁 **Think:** You have `const RouteMap = lazy(() => import('./RouteMap'))` at module scope. The user opens the app and stays on the Dashboard page for 5 minutes. During those 5 minutes, has the `import('./RouteMap')` fired? When does it fire — and what triggers it?",
      build:
        "**Learning focus:** Declare a lazy component using React.lazy with a dynamic import thunk — understanding that the thunk is the deferral mechanism and that the target module must have a default export.",
    },
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 4",
    paal: "Wrap the RouteMap usage in a Suspense boundary with a fallback of <p>Loading map...</p>.",
    hint: "Suspense must wrap any component that might suspend — lazy components always suspend on first render while loading.",
    example_code: `<Suspense fallback={<div>Loading dashboard...</div>}>
  <DriverSummary />
</Suspense>`,
    think_prompt:
      "What would happen if you rendered a lazy component WITHOUT wrapping it in Suspense?",
    mc_options: [
      "React renders nothing silently until the chunk loads",
      "React throws an error: 'A React component suspended while rendering, but no Suspense boundary was found'",
      "The lazy component renders synchronously — lazy has no effect without Suspense",
    ],
    mc_correct_option:
      "React throws an error: 'A React component suspended while rendering, but no Suspense boundary was found'",
    mc_anchor:
      "React.lazy components throw a Promise when they haven't loaded yet — that's the suspension mechanism. Suspense catches that thrown Promise and renders the fallback. Without a Suspense boundary to catch it, React propagates the thrown Promise to the error boundary or the root — and throws a visible error.",
    why_this_matters:
      "The Suspense boundary is a UI contract: 'while anything inside me is loading, show this fallback.' In a logistics app you might nest multiple boundaries — one at the route level showing a full-page skeleton, one at the component level showing a spinner just for the map panel. The granularity of the fallback UI is controlled by where you place the boundary.",
    answer_keywords: ["Suspense", "fallback", "RouteMap"],
    evaluate: evalLesson49Step2,
    seed_code: `import { lazy, Suspense } from 'react';

const RouteMap = lazy(() => import('./RouteMap'));`,
    starter_code: `import { lazy, Suspense } from 'react';

const RouteMap = lazy(() => import('./RouteMap'));

const Dashboard = () => {
  return (
    <div>
      {/* wrap RouteMap in Suspense with fallback={<p>Loading map...</p>} */}
      <RouteMap />
    </div>
  );
};`,
    feedback_correct:
      "Exactly — Suspense with a fallback catches the suspension and renders the fallback while the chunk downloads. Without Suspense, lazy throws an uncaught Promise.",
    feedback_partial:
      "Check that Suspense directly wraps RouteMap and that the fallback prop is a JSX element (not a string).",
    feedback_wrong:
      "Pattern: `<Suspense fallback={<p>Loading map...</p>}><RouteMap /></Suspense>`",
    expected: `import { lazy, Suspense } from 'react';

const RouteMap = lazy(() => import('./RouteMap'));

const Dashboard = () => {
  return (
    <div>
      <Suspense fallback={<p>Loading map...</p>}>
        <RouteMap />
      </Suspense>
    </div>
  );
};`,
    analog_example: `<Suspense fallback={<div>Loading driver data...</div>}>
  <DriverSummary />
</Suspense>`,
    deepDiveLabel:
      "Suspense shows a fallback while loading — but where exactly should you place the boundary for the best user experience?",
    deepDive: {
      hook: "Your RouteMap loads in 1.2 seconds on a fast connection. You wrap the entire Dashboard in a single top-level Suspense. During those 1.2 seconds, the user sees nothing but the loading spinner — the header, the sidebar, the shipment count cards — all gone. One Suspense boundary blanks the whole dashboard while a single panel loads. This is the wrong granularity, and it's a common first implementation.",
      pain: "⚠️ **Lesson:** Suspense boundaries have a scope — everything inside them disappears while any child suspends. How do you design boundaries so only the loading panel disappears, not the entire page?",
      mentalModel:
        "**Mental model:** Think of Suspense boundaries as **circuit breakers in a building's electrical system**. A single circuit breaker for the whole building means one failing appliance cuts all power. Individual circuit breakers per room mean only that room's lights go out. Place Suspense boundaries as close to the suspending component as possible — wrapping only the components that actually suspend.",
      discover:
        "**Pattern — boundary granularity:**\n```tsx\n// ❌ one boundary at root — entire dashboard disappears during load\n<Suspense fallback={<FullPageSpinner />}>\n  <Header />    {/* this also disappears — unnecessary */}\n  <Sidebar />   {/* this also disappears — unnecessary */}\n  <RouteMap />  {/* only this one actually suspends */}\n</Suspense>\n\n// ✅ boundary scoped to the lazy panel only\n<Header />\n<Sidebar />\n<Suspense fallback={<MapPanelSkeleton />}>\n  <RouteMap />  {/* only this disappears during load */}\n</Suspense>\n\n// ✅ multiple independent boundaries — each panel loads independently\n<Suspense fallback={<MapSkeleton />}><RouteMap /></Suspense>\n<Suspense fallback={<ListSkeleton />}><WarehouseList /></Suspense>\n```",
      quickRules:
        "**Quick rules:**\n- ✅ Place boundaries as close to the suspending component as possible\n- ✅ Use skeleton components as fallbacks — they hold layout and reduce perceived wait time\n- ✅ Multiple independent boundaries = independent loading states\n- ❌ Don't wrap large stable UI in a boundary alongside one lazy component\n- ❌ Don't use a string as the fallback — fallback must be a React element",
      watchOut:
        "👀 **Watch out:** Suspense boundaries are silent about errors. If a lazy chunk fails to load (network error, 404), Suspense keeps showing the fallback forever — it doesn't switch to an error state. You need an Error Boundary wrapping the Suspense to catch chunk load failures and show a retry prompt. Lesson 85 covers Error Boundaries.",
      dryRun:
        "🔁 **Think:** You have two lazy components inside one Suspense boundary: `<RouteMap />` takes 1.2 seconds to load and `<DriverSummary />` takes 0.3 seconds. When does the fallback disappear — after 0.3 seconds (when DriverSummary is ready) or after 1.2 seconds (when RouteMap is ready)? What's the implication for your UX if the two components have very different load times?",
      build:
        "**Learning focus:** Wrap a lazy component in Suspense with a fallback — understanding that Suspense scope determines how much UI disappears during loading and that boundary placement is a deliberate UX decision.",
    },
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 4",
    paal: "Add two more lazy declarations: DriverSummary (from './DriverSummary') and WarehouseList (from './WarehouseList').",
    hint: "Each lazy declaration is a separate const. Same pattern as Step 1 — three lazy declarations total in the file.",
    example_code: `const FleetOverview = lazy(() => import('./FleetOverview'));
const DepotMap = lazy(() => import('./DepotMap'));`,
    think_prompt:
      "You have three lazy components but one Suspense boundary. If you put all three inside the same boundary, what does the user see while any one of them is still loading?",
    mc_options: [
      "Each component shows its own fallback independently as it loads",
      "All three components are hidden — the single fallback shows until all three are loaded",
      "The two faster components render immediately; only the slowest one shows a fallback",
    ],
    mc_correct_option:
      "All three components are hidden — the single fallback shows until all three are loaded",
    mc_anchor:
      "One Suspense boundary means one fallback for everything inside it. All three components suspend until all three are loaded — the slowest one determines when the fallback disappears. Independent boundaries per component would let each reveal as it loads.",
    why_this_matters:
      "The number of lazy declarations is independent of the number of Suspense boundaries. You can have 10 lazy components and 10 independent boundaries, or 10 components in one boundary — the choice is UX, not technical. In a logistics dashboard, RouteMap (heavy mapping library) and DriverSummary (lightweight) should not share a boundary — the map's load time would hold back the driver panel.",
    answer_keywords: ["lazy", "DriverSummary", "WarehouseList", "import"],
    evaluate: evalLesson49Step3,
    seed_code: `import { lazy, Suspense } from 'react';

const RouteMap = lazy(() => import('./RouteMap'));

const Dashboard = () => {
  return (
    <div>
      <Suspense fallback={<p>Loading map...</p>}>
        <RouteMap />
      </Suspense>
    </div>
  );
};`,
    starter_code: `import { lazy, Suspense } from 'react';

const RouteMap = lazy(() => import('./RouteMap'));
// add DriverSummary lazy import from './DriverSummary'
// add WarehouseList lazy import from './WarehouseList'

const Dashboard = () => {
  return (
    <div>
      <Suspense fallback={<p>Loading map...</p>}>
        <RouteMap />
      </Suspense>
    </div>
  );
};`,
    feedback_correct:
      "Exactly — three independent lazy declarations. Each triggers its own network chunk fetch when first rendered.",
    feedback_partial:
      "Check that both new lazy declarations follow the same pattern: `const X = lazy(() => import('./X'));`",
    feedback_wrong:
      "Add two more lines: `const DriverSummary = lazy(() => import('./DriverSummary'));` and `const WarehouseList = lazy(() => import('./WarehouseList'));`",
    expected: `import { lazy, Suspense } from 'react';

const RouteMap = lazy(() => import('./RouteMap'));
const DriverSummary = lazy(() => import('./DriverSummary'));
const WarehouseList = lazy(() => import('./WarehouseList'));

const Dashboard = () => {
  return (
    <div>
      <Suspense fallback={<p>Loading map...</p>}>
        <RouteMap />
      </Suspense>
    </div>
  );
};`,
    analog_example: `const FleetTracker = lazy(() => import('./FleetTracker'));
const IncidentLog = lazy(() => import('./IncidentLog'));`,
    deepDiveLabel:
      "Three lazy declarations mean three separate network chunks — but does the browser fetch all three immediately, or only the ones that render?",
    deepDive: {
      hook: "You add DriverSummary and WarehouseList as lazy components but conditionally render them behind a tab. The network panel on first load shows only one chunk downloaded — the RouteMap chunk. The user clicks 'Drivers' — DriverSummary chunk downloads. Clicks 'Warehouse' — WarehouseList chunk downloads. You've accidentally built a perfect on-demand loading system just by combining lazy with conditional rendering.",
      pain: "⚠️ **Lesson:** Lazy declarations define the potential for deferred loading — but the actual network fetch only fires when the component is first rendered. What combination of factors triggers the first fetch?",
      mentalModel:
        "**Mental model:** A lazy declaration is a **sealed envelope with instructions**. The instructions say 'fetch this chunk'. But the envelope only opens when someone needs to read it — i.e., when React tries to render the component. Until that first render, the chunk sits on the CDN unfetched. Conditional rendering (`{activeTab === 'map' && <RouteMap />}`) determines whether the envelope ever gets opened in a given session.",
      discover:
        "**Pattern — lazy + conditional rendering:**\n```tsx\nconst RouteMap = lazy(() => import('./RouteMap'));\nconst DriverSummary = lazy(() => import('./DriverSummary'));\nconst WarehouseList = lazy(() => import('./WarehouseList'));\n\n// ✅ only loads the active tab's chunk\n{activeTab === 'map' && (\n  <Suspense fallback={<MapSkeleton />}><RouteMap /></Suspense>\n)}\n{activeTab === 'drivers' && (\n  <Suspense fallback={<ListSkeleton />}><DriverSummary /></Suspense>\n)}\n\n// ✅ preload on hover — fetch before the user clicks\n<button onMouseEnter={() => import('./RouteMap')}>\n  Open Map\n</button>\n```",
      quickRules:
        "**Quick rules:**\n- ✅ Lazy declarations at module scope — not inside components\n- ✅ Chunk fetches only on first render — conditional rendering controls which chunks load\n- ✅ Preload chunks on hover with raw `import()` to hide latency before click\n- ❌ Don't assume all lazy chunks download on app load — they don't\n- ❌ Don't lazy-load components that render immediately on the critical path",
      watchOut:
        "👀 **Watch out:** Lazy-loading components that are on the critical first-paint path makes performance worse, not better. If your `<Header />` or `<AppShell />` is lazy, the user sees a fallback instead of the app on first load — adding perceived latency, not removing it. Lazy loading is for components that are conditionally visible or below the fold. Always lazy-load routes and heavy panels, never layout-critical shells.",
      dryRun:
        "🔁 **Think:** A user navigates to the Dashboard, clicks 'Map', waits 1.2 seconds for RouteMap to load, then clicks away to another page, then comes back and clicks 'Map' again. Does the RouteMap chunk download a second time? Does Suspense show its fallback again? Why or why not?",
      build:
        "**Learning focus:** Declare multiple lazy components independently and understand that each lazy declaration creates a separate potential chunk — and that the chunk only fetches when the component is first rendered, making conditional rendering the natural gating mechanism.",
    },
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 4",
    paal: "Give each lazy panel its own Suspense boundary with a tailored fallback, and verify that RouteMap's source file uses a default export.",
    hint: "Three panels, three Suspense boundaries. Each fallback can be specific to the panel — not the same generic message.",
    example_code: `<Suspense fallback={<p>Loading fleet data...</p>}>
  <FleetOverview />
</Suspense>
<Suspense fallback={<p>Loading depot list...</p>}>
  <DepotMap />
</Suspense>`,
    think_prompt:
      "Each component has its own Suspense boundary now. If DriverSummary loads in 0.2s and RouteMap loads in 1.2s — can DriverSummary show its content before RouteMap finishes?",
    mc_options: [
      "Yes — independent boundaries load and reveal independently",
      "No — all Suspense boundaries in the same parent wait for each other",
      "Yes — but only if they share the same fallback component",
    ],
    mc_correct_option: "Yes — independent boundaries load and reveal independently",
    mc_anchor:
      "Suspense boundaries are completely independent when they're siblings or in separate subtrees. DriverSummary's boundary resolves as soon as its chunk loads — RouteMap's boundary is a completely separate loading state. They don't coordinate.",
    why_this_matters:
      "Independent boundaries are the foundation of progressive disclosure in a logistics dashboard. The driver panel can load and become interactive while the map is still loading. The warehouse list can appear while both others are still pending. Users see content progressively rather than waiting for the slowest panel before seeing anything.",
    answer_keywords: ["Suspense", "fallback", "RouteMap", "DriverSummary", "WarehouseList", "export default"],
    evaluate: evalLesson49Step4,
    seed_code: `import { lazy, Suspense } from 'react';

const RouteMap = lazy(() => import('./RouteMap'));
const DriverSummary = lazy(() => import('./DriverSummary'));
const WarehouseList = lazy(() => import('./WarehouseList'));

const Dashboard = () => {
  return (
    <div>
      <Suspense fallback={<p>Loading map...</p>}>
        <RouteMap />
      </Suspense>
    </div>
  );
};`,
    starter_code: `import { lazy, Suspense } from 'react';

const RouteMap = lazy(() => import('./RouteMap'));
const DriverSummary = lazy(() => import('./DriverSummary'));
const WarehouseList = lazy(() => import('./WarehouseList'));

const Dashboard = () => {
  return (
    <div>
      {/* give each lazy component its own Suspense boundary */}
      {/* use a specific fallback for each panel */}
      <RouteMap />
      <DriverSummary />
      <WarehouseList />
    </div>
  );
};

// ensure RouteMap has a default export below
// (simulated — in a real project this would be in ./RouteMap.tsx)
export default function RouteMap() {
  return <div>Route Map Panel</div>;
}`,
    feedback_correct:
      "Exactly — three independent Suspense boundaries, each with a specific fallback. Each panel reveals as soon as its own chunk loads, independent of the others.",
    feedback_partial:
      "Check that each of the three components has its own wrapping Suspense — not one shared boundary — and that each fallback is specific to its panel.",
    feedback_wrong:
      "Each component needs its own `<Suspense fallback={<p>Loading [panel name]...</p>}>` wrapper. And the component files need `export default` — React.lazy won't work without it.",
    expected: `import { lazy, Suspense } from 'react';

const RouteMap = lazy(() => import('./RouteMap'));
const DriverSummary = lazy(() => import('./DriverSummary'));
const WarehouseList = lazy(() => import('./WarehouseList'));

const Dashboard = () => {
  return (
    <div>
      <Suspense fallback={<p>Loading map...</p>}>
        <RouteMap />
      </Suspense>
      <Suspense fallback={<p>Loading driver summary...</p>}>
        <DriverSummary />
      </Suspense>
      <Suspense fallback={<p>Loading warehouse list...</p>}>
        <WarehouseList />
      </Suspense>
    </div>
  );
};

export default function RouteMapComponent() {
  return <div>Route Map Panel</div>;
}`,
    analog_example: `<Suspense fallback={<p>Loading fleet tracker...</p>}>
  <FleetTracker />
</Suspense>
<Suspense fallback={<p>Loading incident log...</p>}>
  <IncidentLog />
</Suspense>`,
    deepDiveLabel:
      "Independent Suspense boundaries reveal progressively — but what if the user's connection drops mid-download of a lazy chunk?",
    deepDive: {
      hook: "A driver in a rural area opens the logistics dashboard on a spotty cellular connection. DriverSummary loads fine — it's small. RouteMap starts downloading — 200kb chunk, 3G connection. Halfway through the download, the connection drops. The Suspense fallback stays visible. The user waits. And waits. There's no retry button. There's no error message. The fallback just sits there forever because Suspense has no built-in error state — it only knows 'loading' and 'done'.",
      pain: "⚠️ **Lesson:** Suspense has two states: loading (shows fallback) and loaded (shows the component). What handles the third state — when the chunk fails to load?",
      mentalModel:
        "**Mental model:** Suspense is optimistic — it assumes the chunk will eventually arrive. An Error Boundary is the pessimist — it catches thrown errors. When a lazy chunk fails to load, React.lazy throws an error (not a Promise), which Suspense cannot catch. Only an Error Boundary can catch that. **The full pattern: `ErrorBoundary > Suspense > LazyComponent`.** The Error Boundary catches load failures; Suspense catches loading states.",
      discover:
        "**Pattern — full error-resilient lazy loading:**\n```tsx\n// ✅ full pattern with error handling\n<ErrorBoundary fallback={<button onClick={retry}>Retry loading map</button>}>\n  <Suspense fallback={<MapSkeleton />}>\n    <RouteMap />\n  </Suspense>\n</ErrorBoundary>\n\n// ❌ Suspense alone — chunk failure shows fallback forever\n<Suspense fallback={<MapSkeleton />}>\n  <RouteMap />  {/* if this fails to load, fallback shows forever */}\n</Suspense>\n```",
      quickRules:
        "**Quick rules:**\n- ✅ Always wrap Suspense in an ErrorBoundary for production lazy loading\n- ✅ ErrorBoundary catches chunk load failures; Suspense catches loading states\n- ✅ Provide a retry mechanism in the ErrorBoundary fallback\n- ❌ Don't rely on Suspense alone to handle network failures\n- ❌ Don't show generic 'Something went wrong' — tell the user which panel failed",
      watchOut:
        "👀 **Watch out:** The Error Boundary must wrap the Suspense — not the other way around. If you nest `<Suspense><ErrorBoundary><RouteMap /></ErrorBoundary></Suspense>`, the ErrorBoundary catches the runtime render error but Suspense still intercepts the loading Promise — you end up with the fallback showing even after an error is caught. The order is: ErrorBoundary outside, Suspense inside.",
      dryRun:
        "🔁 **Think:** You have `ErrorBoundary > Suspense > RouteMap`. The RouteMap chunk is 200kb. At 80% downloaded, the CDN returns a 503 error. React.lazy's Promise rejects. Walk through which component catches that rejection, what UI the user sees, and what the user needs to be able to do to recover.",
      build:
        "**Learning focus:** Give each lazy component its own Suspense boundary for independent progressive loading — and recognize that Suspense handles loading states while Error Boundaries handle load failures, making both necessary for production-grade lazy loading.",
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
];

export default createINPACTEngine({
  NODES,
  sideItems,
  lessonNum: 49,
  title: "Code Splitting + React.lazy",
  shortName: "LAZY — ROUTE MAP",
});
