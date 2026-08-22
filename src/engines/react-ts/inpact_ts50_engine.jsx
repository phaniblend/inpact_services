import createINPACTEngine from "../inpact_engine_shared";

function normalizeCode(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

function evalLesson50Step1(answer) {
  const raw = String(answer || "");
  const hasSkeletonInterface = /interface\s+SkeletonProps\s*\{[\s\S]*?\}/m.test(raw);
  const hasWidthOrHeight = /width\s*\??\s*:\s*(?:string|number)\s*;?/m.test(raw) ||
    /height\s*\??\s*:\s*(?:string|number)\s*;?/m.test(raw);
  const hasSkeletonComponent = /const\s+Skeleton\s*=/m.test(raw);
  return hasSkeletonInterface && hasWidthOrHeight && hasSkeletonComponent ? "correct" : "wrong";
}

function evalLesson50Step2(answer) {
  const raw = String(answer || "");
  const hasShipmentSkeleton = /const\s+ShipmentCardSkeleton\s*=/m.test(raw);
  const usesSkeletonComponent = /<Skeleton/m.test(raw);
  return hasShipmentSkeleton && usesSkeletonComponent ? "correct" : "wrong";
}

function evalLesson50Step3(answer) {
  const raw = String(answer || "");
  const hasSuspense = /<Suspense/m.test(raw);
  const hasFallback = /fallback\s*=\s*\{/m.test(raw);
  const hasSkeletonFallback = /ShipmentCardSkeleton/m.test(raw);
  return hasSuspense && hasFallback && hasSkeletonFallback ? "correct" : "wrong";
}

function evalLesson50Step4(answer) {
  const raw = String(answer || "");
  const hasMultipleSuspense = (raw.match(/<Suspense/g) || []).length >= 2;
  const hasMultipleFallbacks = (raw.match(/fallback\s*=/g) || []).length >= 2;
  return hasMultipleSuspense && hasMultipleFallbacks ? "correct" : "wrong";
}

function evalLesson50Step5(answer) {
  const raw = String(answer || "");
  const hasErrorBoundary = /class\s+\w+\s+extends\s+(?:React\.)?Component[\s\S]*?componentDidCatch|ErrorBoundary/m.test(raw) ||
    /ErrorBoundary/m.test(raw);
  const wrapsOrUses = /<ErrorBoundary/m.test(raw) || /ErrorBoundary/m.test(raw);
  return hasErrorBoundary && wrapsOrUses ? "correct" : "wrong";
}

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "LESSON #50 (PERFORMANCE)",
      title: "Suspense + Fallback",
      body: "Suspense is React's built-in mechanism for coordinating loading states. The fallback prop is your canvas — anything from a spinner to a full skeleton UI. This lesson goes deeper than the lazy-loading basics from Lesson 49: you'll build a ShipmentCard skeleton, compose multiple Suspense boundaries for independent progressive loading, and understand why Suspense needs an Error Boundary partner.",
      usecase:
        "A logistics dashboard that loads shipment cards from an API should never show a blank panel during fetch. A skeleton UI — placeholder shapes that match the real card's layout — prevents layout shift, signals progress, and dramatically improves perceived performance. This is the standard in every mature React application from Google to Stripe.",
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
        reason: "Step 1 uses inline style props and JSX expressions to build the Skeleton component's shimmer effect — `style={{ width, height }}` requires JSX attribute syntax with curly braces for dynamic values.",
      },
      {
        lesson: 10,
        label: "useState — Primitives",
        reason: "Step 4's Dashboard uses `useState<boolean>` to toggle between panels, which gates which lazy Suspense boundary is active — the conditional rendering pattern is the core of on-demand loading.",
      },
      {
        lesson: 49,
        label: "Code Splitting + React.lazy",
        reason: "This lesson builds directly on Lesson 49: Step 3 wraps a lazy ShipmentCard component (declared with React.lazy) in Suspense with the ShipmentCardSkeleton as its fallback. Without understanding lazy loading, the Suspense boundary here has no content to suspend.",
      },
    ],
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Build a reusable Skeleton component with configurable width and height",
      "Compose a ShipmentCardSkeleton from multiple Skeleton pieces",
      "Use ShipmentCardSkeleton as the fallback for a Suspense boundary around a lazy component",
      "Stack multiple Suspense boundaries for independent progressive loading",
      "Understand why an ErrorBoundary must wrap Suspense in production",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 5",
    paal: "Build a reusable Skeleton component with props: width (string, default '100%'), height (string, default '1rem'), and a pulsing CSS animation to indicate loading.",
    hint: "Use inline styles for width and height. The pulse animation can be a simple opacity or background color keyframe applied via a className.",
    example_code: `interface PlaceholderProps {
  width?: string;
  height?: string;
}

const Placeholder = ({ width = '80%', height = '0.875rem' }: PlaceholderProps) => (
  <div className="skeleton-pulse" style={{ width, height }} />
);`,
    think_prompt:
      "A Skeleton component has no semantic meaning — it's purely visual. What props does it need to be reusable across a card title, a status badge, and a full-width description line?",
    mc_options: [
      "One prop: shape ('rect' | 'circle' | 'text') to cover all use cases",
      "Two props: width and height — callers control size; animation is always the same",
      "No props — each skeleton variant is a separate hardcoded component",
    ],
    mc_correct_option:
      "Two props: width and height — callers control size; animation is always the same",
    mc_anchor:
      "Width and height with defaults is the composable skeleton pattern. The animation is universal — it's not a prop, it's always on. Shape variants (circle, rect) can be added as an optional prop later, but width/height covers 90% of use cases with the least API surface.",
    why_this_matters:
      "A reusable Skeleton is a design system primitive. In a logistics app, it composes into ShipmentCardSkeleton, DriverSummarySkeleton, and RouteMapSkeleton — each built from the same base Skeleton with different dimensions. One animation style, one component, infinite layout combinations.",
    answer_keywords: ["Skeleton", "width", "height", "style", "className"],
    evaluate: evalLesson50Step1,
    seed_code: "",
    starter_code: `// build a Skeleton component
// props: width (string, default '100%'), height (string, default '1rem')
// apply a CSS class for the pulse animation (e.g. className="skeleton-pulse")
// use inline style for width and height`,
    feedback_correct:
      "Exactly — configurable width and height with sensible defaults. The animation lives in CSS, the dimensions come from props. Perfectly composable.",
    feedback_partial:
      "Check that width and height have default values and are applied as inline styles. The animation should be a className, not a hardcoded style.",
    feedback_wrong:
      "Pattern: `interface SkeletonProps { width?: string; height?: string; } const Skeleton = ({ width = '100%', height = '1rem' }: SkeletonProps) => <div className='skeleton-pulse' style={{ width, height }} />;`",
    expected: `interface SkeletonProps {
  width?: string;
  height?: string;
}

const Skeleton = ({ width = '100%', height = '1rem' }: SkeletonProps) => (
  <div className="skeleton-pulse" style={{ width, height }} />
);`,
    analog_example: `interface GhostLineProps {
  width?: string;
  height?: string;
}

const GhostLine = ({ width = '75%', height = '0.75rem' }: GhostLineProps) => (
  <div className="ghost-shimmer" style={{ width, height }} />
);`,
    deepDiveLabel:
      "The skeleton matches the card's layout — but what happens to layout shift when the real card replaces it?",
    deepDive: {
      hook: "Your ShipmentCardSkeleton looks perfect. It holds the exact layout space of the real card. Then the data loads — the real ShipmentCard renders — and the page jumps. The title line in the skeleton was `width: '60%'` but the real title is longer. The status badge in the skeleton was 80px but the real badge is 120px. Layout shift. The user's eye tracks the movement. Google's Core Web Vitals flags your CLS (Cumulative Layout Shift) score as poor.",
      pain: "⚠️ **Lesson:** Skeleton components prevent blank space but only prevent layout shift if their dimensions match the real content. How do you design skeletons to minimize CLS when real content has variable lengths?",
      mentalModel:
        "**Mental model:** A skeleton is a **mold, not a mirror**. A mold must be slightly larger than what fills it — if it's too small, the real content overflows and causes shift. Design skeletons to match the maximum expected content size for text-length-sensitive fields, or use fixed-size containers that clip overflow. The real card should fit inside the skeleton's reserved space, not push past it.",
      discover:
        "**Pattern — CLS-safe skeleton design:**\n```tsx\n// ❌ text-driven skeleton — shifts when real text is different length\n<Skeleton width='60%' height='1rem' />  // title — but real title might be 90% wide\n<Skeleton width='40%' height='0.875rem' />  // origin — could be longer\n\n// ✅ fixed-container skeleton — real content is clipped to same box\n<div style={{ height: '72px', overflow: 'hidden' }}>\n  {isLoading\n    ? <ShipmentCardSkeleton />\n    : <ShipmentCard {...data} />  // always 72px tall — no shift\n  }\n</div>\n\n// ✅ use maxWidth on skeleton lines to prevent shift on short real content\n<Skeleton width='70%' height='1rem' />  // 70% = slightly more than typical title\n```",
      quickRules:
        "**Quick rules:**\n- ✅ Wrap skeleton + real content in a fixed-height container to eliminate vertical shift\n- ✅ Size skeleton text lines slightly wider than the average real content\n- ✅ Match exact heights — card height should equal skeleton height\n- ❌ Don't use skeleton widths based on guessing — measure the real content\n- ❌ Don't animate position (left/top) — animate only opacity or background-position",
      watchOut:
        "👀 **Watch out:** Using `transition` CSS on the container that switches from skeleton to real content can cause a flash — the browser briefly renders both layers. Use React's conditional rendering (`isLoading ? <Skeleton /> : <Card />`) rather than CSS opacity transitions between the two, unless you've verified the transition doesn't cause double-render flicker.",
      dryRun:
        "🔁 **Think:** Your ShipmentCardSkeleton has `height: 72px`. The real ShipmentCard renders with a status badge that occasionally wraps to a second line, making the card 96px tall. The user sees the card snap taller after load. What change to the skeleton or the real card container would eliminate that shift?",
      build:
        "**Learning focus:** Build a reusable Skeleton component with width/height props and a pulse animation — establishing the base primitive that all domain-specific skeleton variants will compose from.",
    },
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 5",
    paal: "Compose a ShipmentCardSkeleton from multiple Skeleton instances to match the layout of a real ShipmentCard: one wide line for the shipment ID, one medium line for origin → destination, and one narrow line for status.",
    hint: "Three Skeleton elements, different widths. Wrap them in a div with a fixed height that matches the real card.",
    example_code: `const DriverSummarySkeleton = () => (
  <div style={{ height: '64px', padding: '8px' }}>
    <Placeholder width="50%" height="1rem" />
    <Placeholder width="70%" height="0.875rem" />
    <Placeholder width="30%" height="0.75rem" />
  </div>
);`,
    think_prompt:
      "The skeleton needs to match the real card's visual weight without knowing what the real data is. What determines the right width for each skeleton line?",
    mc_options: [
      "Use 100% for every line — full width ensures no layout shift",
      "Match each line's width to the approximate proportion of content it represents",
      "Random widths — visual variety makes the skeleton feel more realistic",
    ],
    mc_correct_option:
      "Match each line's width to the approximate proportion of content it represents",
    mc_anchor:
      "Proportional widths create visual hierarchy that matches the real card's hierarchy. A full-width ID line would look wrong if the real ID is typically short. Matched proportions signal to the user what kind of content is coming — IDs are short, destination strings are medium, status badges are narrow.",
    why_this_matters:
      "A skeleton that bears visual resemblance to the real content reduces cognitive dissonance when the real content loads. Users perceive the load as faster because the visual transition is smaller — there's less contrast between skeleton and loaded state. This is why Stripe and Airbnb's skeletons look almost identical to the real UI.",
    answer_keywords: ["ShipmentCardSkeleton", "Skeleton", "width", "height"],
    evaluate: evalLesson50Step2,
    seed_code: `interface SkeletonProps {
  width?: string;
  height?: string;
}

const Skeleton = ({ width = '100%', height = '1rem' }: SkeletonProps) => (
  <div className="skeleton-pulse" style={{ width, height }} />
);`,
    starter_code: `interface SkeletonProps {
  width?: string;
  height?: string;
}

const Skeleton = ({ width = '100%', height = '1rem' }: SkeletonProps) => (
  <div className="skeleton-pulse" style={{ width, height }} />
);

// compose ShipmentCardSkeleton below
// three Skeleton lines: wide (ID), medium (origin→destination), narrow (status)
// wrap in a div with height matching the real card (e.g., 72px)`,
    feedback_correct:
      "Exactly — three proportionally sized skeleton lines composed from the base Skeleton. The fixed-height wrapper ensures no layout shift when the real card loads.",
    feedback_partial:
      "Check that you're using the Skeleton component (not raw divs) and that the three lines have meaningfully different widths to suggest the visual hierarchy of the real card.",
    feedback_wrong:
      "Pattern: `const ShipmentCardSkeleton = () => (<div style={{ height: '72px' }}><Skeleton width='45%' height='1rem' /><Skeleton width='70%' height='0.875rem' /><Skeleton width='25%' height='0.75rem' /></div>);`",
    expected: `interface SkeletonProps {
  width?: string;
  height?: string;
}

const Skeleton = ({ width = '100%', height = '1rem' }: SkeletonProps) => (
  <div className="skeleton-pulse" style={{ width, height }} />
);

const ShipmentCardSkeleton = () => (
  <div style={{ height: '72px', padding: '8px' }}>
    <Skeleton width="45%" height="1rem" />
    <Skeleton width="70%" height="0.875rem" />
    <Skeleton width="25%" height="0.75rem" />
  </div>
);`,
    analog_example: `const DepotCardSkeleton = () => (
  <div style={{ height: '64px', padding: '8px' }}>
    <GhostLine width="40%" height="1rem" />
    <GhostLine width="60%" height="0.875rem" />
    <GhostLine width="20%" height="0.75rem" />
  </div>
);`,
    deepDiveLabel:
      "Three Skeleton components render simultaneously — does each run its pulse animation independently, or are they synchronized?",
    deepDive: {
      hook: "You add three Skeleton elements to ShipmentCardSkeleton and open the browser. The pulse animations are out of sync — each element fades at a slightly different time because their CSS animation start times depend on when each element mounted. The effect is a chaotic shimmer instead of a unified wave. A designer in a code review flags it immediately.",
      pain: "⚠️ **Lesson:** CSS `animation` timing starts from when the element mounts. Multiple elements mounting at microscopically different times desync their animations. What CSS property synchronizes animations across independently mounted elements?",
      mentalModel:
        "**Mental model:** CSS animation timing is like **runners starting from different positions on a track**. Each element's animation starts when it mounts — `animation-delay: 0s`. But `animation-delay` accepts negative values, which effectively move the element's start position backward in time. Use `animation-delay: -N` based on the element's index to place each element at a specific point in a shared animation cycle — creating a synchronized wave.",
      discover:
        "**Pattern — synchronized skeleton animation:**\n```css\n/* ✅ keyframe that cycles opacity */\n@keyframes skeleton-pulse {\n  0%, 100% { opacity: 1; }\n  50% { opacity: 0.4; }\n}\n\n.skeleton-pulse {\n  animation: skeleton-pulse 1.5s ease-in-out infinite;\n  background: #e0e0e0;\n}\n\n/* ✅ stagger with negative delay for wave effect */\n.skeleton-pulse:nth-child(1) { animation-delay: 0s; }\n.skeleton-pulse:nth-child(2) { animation-delay: -0.3s; }  /* already 0.3s into cycle */\n.skeleton-pulse:nth-child(3) { animation-delay: -0.6s; }\n```\n\n```tsx\n// ✅ or use animation-delay inline per Skeleton instance\nconst Skeleton = ({ width = '100%', height = '1rem', delay = '0s' }: SkeletonProps) => (\n  <div className='skeleton-pulse' style={{ width, height, animationDelay: delay }} />\n);\n```",
      quickRules:
        "**Quick rules:**\n- ✅ Use `animation-delay` with negative values to synchronize multiple skeleton elements\n- ✅ Add `delay` as an optional Skeleton prop for fine-grained control\n- ✅ Prefer `opacity` or `background-position` for the animation property — never `width/height`\n- ❌ Don't use `transition` between skeleton and real content — causes double-render flash\n- ❌ Don't animate `top`/`left`/`margin` — those trigger layout, which is expensive",
      watchOut:
        "👀 **Watch out:** Animating `background-color` between two color values (the classic skeleton shimmer) is more expensive than animating `opacity`. Background color changes trigger composite layer updates per-element. Opacity changes are GPU-composited — the browser can handle them without layout or paint. For high-card-count lists with 20+ skeleton cards visible, this difference in animation strategy shows up in DevTools as frame drops.",
      dryRun:
        "🔁 **Think:** Your ShipmentCardSkeleton renders inside a FixedSizeList from Lesson 48. At any given scroll position, 12 skeleton cards are visible. Each card has 3 Skeleton elements. That's 36 animated elements simultaneously. At 60fps, how many animation frames per second is the GPU compositing — and what's the risk of this number increasing when the virtualized list scrolls?",
      build:
        "**Learning focus:** Compose a domain-specific skeleton from the base Skeleton primitive — establishing the composable pattern where every skeleton variant is assembled from the same building block with different dimensions.",
    },
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 5",
    paal: "Wrap a lazy ShipmentCard component in a Suspense boundary using ShipmentCardSkeleton as the fallback.",
    hint: "React.lazy for the import, Suspense for the boundary, ShipmentCardSkeleton for the fallback — three separate pieces working together.",
    example_code: `const LazyDepotCard = lazy(() => import('./DepotCard'));

<Suspense fallback={<DepotCardSkeleton />}>
  <LazyDepotCard />
</Suspense>`,
    think_prompt:
      "Suspense's fallback prop accepts any React element. What's the difference between passing `<ShipmentCardSkeleton />` and passing `ShipmentCardSkeleton` (without JSX)?",
    mc_options: [
      "No difference — React treats both the same way",
      "<ShipmentCardSkeleton /> is a React element (the result of calling the component); ShipmentCardSkeleton is the component function — fallback needs an element",
      "ShipmentCardSkeleton (without JSX) is more performant — no re-render on each suspension",
    ],
    mc_correct_option:
      "<ShipmentCardSkeleton /> is a React element (the result of calling the component); ShipmentCardSkeleton is the component function — fallback needs an element",
    mc_anchor:
      "The `fallback` prop type is `ReactNode` — it expects a React element (the output of JSX), not a function or component reference. `<ShipmentCardSkeleton />` creates the element. Passing the function reference `ShipmentCardSkeleton` would render nothing — React would see a function in the tree, not an element.",
    why_this_matters:
      "This distinction — element vs. component — comes up constantly in React APIs: Suspense fallback, ErrorBoundary fallback, Portal, and more. Understanding that JSX `<X />` is a function call that produces an element, while `X` is just a function reference, prevents a class of bugs where the API seems to accept your value silently but renders nothing.",
    answer_keywords: ["lazy", "Suspense", "fallback", "ShipmentCardSkeleton", "ShipmentCard"],
    evaluate: evalLesson50Step3,
    seed_code: `import { lazy, Suspense } from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
}

const Skeleton = ({ width = '100%', height = '1rem' }: SkeletonProps) => (
  <div className="skeleton-pulse" style={{ width, height }} />
);

const ShipmentCardSkeleton = () => (
  <div style={{ height: '72px', padding: '8px' }}>
    <Skeleton width="45%" height="1rem" />
    <Skeleton width="70%" height="0.875rem" />
    <Skeleton width="25%" height="0.75rem" />
  </div>
);`,
    starter_code: `import { lazy, Suspense } from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
}

const Skeleton = ({ width = '100%', height = '1rem' }: SkeletonProps) => (
  <div className="skeleton-pulse" style={{ width, height }} />
);

const ShipmentCardSkeleton = () => (
  <div style={{ height: '72px', padding: '8px' }}>
    <Skeleton width="45%" height="1rem" />
    <Skeleton width="70%" height="0.875rem" />
    <Skeleton width="25%" height="0.75rem" />
  </div>
);

// declare LazyShipmentCard using React.lazy
// wrap it in a Suspense boundary using ShipmentCardSkeleton as the fallback`,
    feedback_correct:
      "Exactly — lazy + Suspense + skeleton fallback. The skeleton holds the card's visual space while the chunk downloads and the data fetches.",
    feedback_partial:
      "Check that the fallback is `<ShipmentCardSkeleton />` (a JSX element), not `ShipmentCardSkeleton` (a function reference).",
    feedback_wrong:
      "Pattern: `const LazyShipmentCard = lazy(() => import('./ShipmentCard')); <Suspense fallback={<ShipmentCardSkeleton />}><LazyShipmentCard /></Suspense>`",
    expected: `import { lazy, Suspense } from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
}

const Skeleton = ({ width = '100%', height = '1rem' }: SkeletonProps) => (
  <div className="skeleton-pulse" style={{ width, height }} />
);

const ShipmentCardSkeleton = () => (
  <div style={{ height: '72px', padding: '8px' }}>
    <Skeleton width="45%" height="1rem" />
    <Skeleton width="70%" height="0.875rem" />
    <Skeleton width="25%" height="0.75rem" />
  </div>
);

const LazyShipmentCard = lazy(() => import('./ShipmentCard'));

const ShipmentPanel = () => (
  <Suspense fallback={<ShipmentCardSkeleton />}>
    <LazyShipmentCard />
  </Suspense>
);`,
    analog_example: `const LazyRouteDetails = lazy(() => import('./RouteDetails'));

const RoutePanel = () => (
  <Suspense fallback={<RouteDetailsSkeleton />}>
    <LazyRouteDetails />
  </Suspense>
);`,
    deepDiveLabel:
      "The fallback shows while the chunk downloads — but what if the component also fetches data after it mounts? Does Suspense show the fallback again?",
    deepDive: {
      hook: "ShipmentCard loads its chunk in 0.4 seconds — the skeleton shows, the card renders. But ShipmentCard also calls `useEffect(() => { fetch('/api/shipment') ... }, [])` on mount. During that fetch, there's no fallback — just an empty card with loading state managed internally by ShipmentCard itself. You now have two different loading UIs for two different loading phases of the same component: the skeleton (chunk loading) and an internal spinner (data loading). Users see two different loading patterns. A PM asks why there are two spinners.",
      pain: "⚠️ **Lesson:** Suspense catches chunk-load suspension and data-load suspension (via Suspense-enabled data libraries). But `useEffect`-based fetches don't integrate with Suspense. Why not — and what's the alternative?",
      mentalModel:
        "**Mental model:** Suspense is a **Promise interceptor**. React's internals detect when a component throws a Promise during render (not in an effect). lazy throws a Promise during render — Suspense catches it. `useEffect` runs after render — by the time the fetch Promise exists, Suspense has already committed to rendering the component. The future is Suspense-enabled data libraries (TanStack Query, SWR, RTK Query) which throw Promises during render so Suspense can catch them.",
      discover:
        "**Pattern — Suspense-compatible vs effect-based fetching:**\n```tsx\n// ❌ useEffect fetch — Suspense won't show fallback during this fetch\nconst ShipmentCard = () => {\n  const [data, setData] = useState(null);\n  useEffect(() => { fetch('/api/shipment').then(r => r.json()).then(setData); }, []);\n  if (!data) return <span>Loading...</span>;  // internal loading state\n  return <div>{data.shipmentId}</div>;\n};\n\n// ✅ TanStack Query — integrates with Suspense via suspense: true option\nconst ShipmentCard = () => {\n  const { data } = useQuery({ queryKey: ['shipment'], queryFn: fetchShipment, suspense: true });\n  return <div>{data.shipmentId}</div>;  // no conditional — Suspense handles loading\n};\n// One Suspense boundary handles BOTH chunk load AND data load\n```",
      quickRules:
        "**Quick rules:**\n- ✅ React.lazy integrates with Suspense natively — chunk load = Suspense fallback\n- ✅ TanStack Query, SWR, and RTK Query can integrate with Suspense for data fetching\n- ✅ Use `suspense: true` in TanStack Query to make Suspense handle data loading too\n- ❌ `useEffect` fetches do NOT trigger Suspense — they run after render\n- ❌ Don't mix Suspense-integrated and effect-based fetching in the same component — you'll get two loading UIs",
      watchOut:
        "👀 **Watch out:** React 18's `use()` hook is the future of Suspense-integrated data fetching — it throws a Promise during render just like lazy does. If you start seeing `use(fetch(...))` in codebases, that's the mechanism. It's still evolving as of React 18.x, but it's the direction React is moving for Suspense-first data loading.",
      dryRun:
        "🔁 **Think:** Your ShipmentCard is lazy-loaded AND uses TanStack Query with `suspense: true`. The user navigates to the panel for the first time. Walk through the loading sequence: what does Suspense show first, when does it show, and what triggers the transition from fallback to real content — one phase or two?",
      build:
        "**Learning focus:** Connect the lazy + Suspense + skeleton pattern into a complete component — and understand that Suspense fallback covers chunk loading, while data-loading integration requires Suspense-compatible data libraries, not useEffect.",
    },
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 5",
    paal: "Add a second lazy panel — LazyDriverSummary — with its own Suspense boundary and a DriverSummarySkeleton fallback, so both panels load independently.",
    hint: "Two lazy declarations, two Suspense boundaries, two skeleton fallbacks. The panels should be siblings in the JSX tree — not nested.",
    example_code: `<Suspense fallback={<FleetSkeleton />}>
  <LazyFleetTracker />
</Suspense>
<Suspense fallback={<DepotSkeleton />}>
  <LazyDepotList />
</Suspense>`,
    think_prompt:
      "If both panels are loading simultaneously and ShipmentCard finishes first — does ShipmentCard show its real content while DriverSummary still shows its skeleton?",
    mc_options: [
      "Yes — independent boundaries resolve independently",
      "No — all Suspense boundaries in the same parent wait for the slowest sibling",
      "Yes — but only if they're in separate React render trees (portals)",
    ],
    mc_correct_option: "Yes — independent boundaries resolve independently",
    mc_anchor:
      "Suspense boundaries are independent by default. When a boundary's suspended component resolves, it reveals immediately regardless of other boundaries' state. Sibling boundaries do not coordinate unless you use React 18's `startTransition` or `useDeferredValue` to deliberately sequence them.",
    why_this_matters:
      "Progressive disclosure is the UX goal — users see content as it becomes available. In a logistics dashboard, the driver summary panel (small dataset) might resolve in 200ms while the route map (large GeoJSON) takes 1.2s. Independent boundaries mean drivers are interactive immediately while the map skeleton continues pulsing. Users can act on available information while the rest loads.",
    answer_keywords: ["LazyDriverSummary", "Suspense", "DriverSummarySkeleton"],
    evaluate: evalLesson50Step4,
    seed_code: `import { lazy, Suspense } from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
}

const Skeleton = ({ width = '100%', height = '1rem' }: SkeletonProps) => (
  <div className="skeleton-pulse" style={{ width, height }} />
);

const ShipmentCardSkeleton = () => (
  <div style={{ height: '72px', padding: '8px' }}>
    <Skeleton width="45%" height="1rem" />
    <Skeleton width="70%" height="0.875rem" />
    <Skeleton width="25%" height="0.75rem" />
  </div>
);

const LazyShipmentCard = lazy(() => import('./ShipmentCard'));

const ShipmentPanel = () => (
  <Suspense fallback={<ShipmentCardSkeleton />}>
    <LazyShipmentCard />
  </Suspense>
);`,
    starter_code: `import { lazy, Suspense } from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
}

const Skeleton = ({ width = '100%', height = '1rem' }: SkeletonProps) => (
  <div className="skeleton-pulse" style={{ width, height }} />
);

const ShipmentCardSkeleton = () => (
  <div style={{ height: '72px', padding: '8px' }}>
    <Skeleton width="45%" height="1rem" />
    <Skeleton width="70%" height="0.875rem" />
    <Skeleton width="25%" height="0.75rem" />
  </div>
);

// add DriverSummarySkeleton (3 Skeleton lines, height 64px)

const LazyShipmentCard = lazy(() => import('./ShipmentCard'));
// add LazyDriverSummary lazy declaration

const Dashboard = () => (
  <div>
    <Suspense fallback={<ShipmentCardSkeleton />}>
      <LazyShipmentCard />
    </Suspense>
    {/* add second Suspense boundary for LazyDriverSummary */}
  </div>
);`,
    feedback_correct:
      "Exactly — two independent Suspense boundaries. Each reveals the moment its content resolves, with no coordination between them.",
    feedback_partial:
      "Check that you have both a DriverSummarySkeleton component AND a separate Suspense boundary wrapping LazyDriverSummary — they're two different pieces.",
    feedback_wrong:
      "Add `const LazyDriverSummary = lazy(() => import('./DriverSummary'));`, build `DriverSummarySkeleton` from Skeleton instances, then add `<Suspense fallback={<DriverSummarySkeleton />}><LazyDriverSummary /></Suspense>` as a sibling to the first Suspense.",
    expected: `import { lazy, Suspense } from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
}

const Skeleton = ({ width = '100%', height = '1rem' }: SkeletonProps) => (
  <div className="skeleton-pulse" style={{ width, height }} />
);

const ShipmentCardSkeleton = () => (
  <div style={{ height: '72px', padding: '8px' }}>
    <Skeleton width="45%" height="1rem" />
    <Skeleton width="70%" height="0.875rem" />
    <Skeleton width="25%" height="0.75rem" />
  </div>
);

const DriverSummarySkeleton = () => (
  <div style={{ height: '64px', padding: '8px' }}>
    <Skeleton width="40%" height="1rem" />
    <Skeleton width="60%" height="0.875rem" />
    <Skeleton width="20%" height="0.75rem" />
  </div>
);

const LazyShipmentCard = lazy(() => import('./ShipmentCard'));
const LazyDriverSummary = lazy(() => import('./DriverSummary'));

const Dashboard = () => (
  <div>
    <Suspense fallback={<ShipmentCardSkeleton />}>
      <LazyShipmentCard />
    </Suspense>
    <Suspense fallback={<DriverSummarySkeleton />}>
      <LazyDriverSummary />
    </Suspense>
  </div>
);`,
    analog_example: `<Suspense fallback={<RoutesSkeleton />}>
  <LazyRoutesList />
</Suspense>
<Suspense fallback={<AlertsSkeleton />}>
  <LazyAlertsFeed />
</Suspense>`,
    deepDiveLabel:
      "Two panels load independently — but what if you want them to load together, appearing simultaneously as a coordinated reveal?",
    deepDive: {
      hook: "The design team wants the ShipmentCard and DriverSummary panels to appear at the same time — even if one loads faster than the other. The current setup reveals the faster panel immediately, which causes a jarring layout shift as the slower panel then loads. 'Make them snap in together,' the designer says. Your Suspense boundaries are already in place. What's the mechanism for coordinating them?",
      pain: "⚠️ **Lesson:** Independent Suspense boundaries reveal greedily. What React feature deliberately delays revealing a faster boundary until a sibling boundary also resolves?",
      mentalModel:
        "**Mental model:** React 18's `startTransition` combined with a shared parent Suspense boundary is the coordination mechanism. But there's a simpler approach: put both lazy components inside a **single** Suspense boundary. The fallback shows until BOTH are ready — then both appear simultaneously. It's the difference between two lifts with independent doors versus one lift with one door that only opens when all passengers are aboard.",
      discover:
        "**Pattern — independent vs. coordinated reveal:**\n```tsx\n// ✅ independent — each panel reveals as it resolves\n<Suspense fallback={<ShipmentSkeleton />}><LazyShipmentCard /></Suspense>\n<Suspense fallback={<DriverSkeleton />}><LazyDriverSummary /></Suspense>\n\n// ✅ coordinated — both panels show simultaneously when both are ready\n<Suspense fallback={<DashboardSkeleton />}>\n  <LazyShipmentCard />\n  <LazyDriverSummary />\n</Suspense>\n\n// ✅ React 18 startTransition — navigate without showing fallback for fast transitions\nconst [isPending, startTransition] = useTransition();\nstartTransition(() => setActivePanel('map'));\n// isPending is true during transition — use it for inline loading indicators\n```",
      quickRules:
        "**Quick rules:**\n- ✅ Independent boundaries → greedy reveal (fastest first)\n- ✅ Single shared boundary → coordinated reveal (all or nothing)\n- ✅ `startTransition` → defer a navigation to avoid showing a fallback if it resolves fast\n- ❌ Don't use a shared boundary when panels have very different load times — users wait for the slowest\n- ❌ Don't use `startTransition` as a replacement for Suspense — they solve different problems",
      watchOut:
        "👀 **Watch out:** Nesting Suspense boundaries inside `startTransition` doesn't change their resolution order — it changes when React commits to showing the next UI state. If a transition takes longer than `React.unstable_ConcurrentMode`'s timeout (usually 3 seconds), React will abandon the transition and show the fallback anyway. `startTransition` is for fast transitions — not for heavy data loads.",
      dryRun:
        "🔁 **Think:** You have independent boundaries: ShipmentCard resolves in 200ms, DriverSummary in 800ms. The user sees ShipmentCard appear at 200ms and DriverSummary at 800ms — a 600ms gap. If you switch to a shared boundary, when does the user first see any content? Is the tradeoff worth it for this specific timing difference?",
      build:
        "**Learning focus:** Build two independent Suspense boundaries with separate skeleton fallbacks — demonstrating progressive disclosure where each panel reveals as its content resolves, independent of sibling boundaries.",
    },
  },
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 5",
    paal: "Add an ErrorBoundary class component that wraps both Suspense boundaries, displaying a 'Failed to load panel. Retry?' message with a retry button when a chunk load fails.",
    hint: "ErrorBoundary is a class component with getDerivedStateFromError. It must wrap Suspense — not be inside it.",
    example_code: `class PanelErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <button>Retry</button>;
    return this.props.children;
  }
}`,
    think_prompt:
      "ErrorBoundary wraps Suspense — but which failure mode does ErrorBoundary handle that Suspense cannot?",
    mc_options: [
      "Loading state — ErrorBoundary shows the fallback while Suspense is waiting",
      "Chunk load failure (network error, 404) — Suspense never shows an error state, only loading and success",
      "TypeScript type errors — ErrorBoundary catches compile-time failures at runtime",
    ],
    mc_correct_option:
      "Chunk load failure (network error, 404) — Suspense never shows an error state, only loading and success",
    mc_anchor:
      "Suspense has two states: loading (shows fallback) and resolved (shows content). It has no error state. When a chunk fails to load, React.lazy throws an Error — not a Promise. Suspense only catches Promises. Only a class-based ErrorBoundary with `getDerivedStateFromError` or `componentDidCatch` can catch thrown Errors during render.",
    why_this_matters:
      "In production, chunk load failures are real: CDN outages, user going offline mid-load, cache misses on deploy. Without an ErrorBoundary, the Suspense fallback shows forever — the user sees a skeleton that never becomes a card. With ErrorBoundary, you can detect the failure, show a retry button, and let the user recover without a full page reload.",
    answer_keywords: ["ErrorBoundary", "getDerivedStateFromError", "hasError", "retry", "Suspense"],
    evaluate: evalLesson50Step5,
    seed_code: `import { lazy, Suspense } from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
}

const Skeleton = ({ width = '100%', height = '1rem' }: SkeletonProps) => (
  <div className="skeleton-pulse" style={{ width, height }} />
);

const ShipmentCardSkeleton = () => (
  <div style={{ height: '72px', padding: '8px' }}>
    <Skeleton width="45%" height="1rem" />
    <Skeleton width="70%" height="0.875rem" />
    <Skeleton width="25%" height="0.75rem" />
  </div>
);

const DriverSummarySkeleton = () => (
  <div style={{ height: '64px', padding: '8px' }}>
    <Skeleton width="40%" height="1rem" />
    <Skeleton width="60%" height="0.875rem" />
    <Skeleton width="20%" height="0.75rem" />
  </div>
);

const LazyShipmentCard = lazy(() => import('./ShipmentCard'));
const LazyDriverSummary = lazy(() => import('./DriverSummary'));

const Dashboard = () => (
  <div>
    <Suspense fallback={<ShipmentCardSkeleton />}>
      <LazyShipmentCard />
    </Suspense>
    <Suspense fallback={<DriverSummarySkeleton />}>
      <LazyDriverSummary />
    </Suspense>
  </div>
);`,
    starter_code: `import React, { lazy, Suspense } from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
}

const Skeleton = ({ width = '100%', height = '1rem' }: SkeletonProps) => (
  <div className="skeleton-pulse" style={{ width, height }} />
);

const ShipmentCardSkeleton = () => (
  <div style={{ height: '72px', padding: '8px' }}>
    <Skeleton width="45%" height="1rem" />
    <Skeleton width="70%" height="0.875rem" />
    <Skeleton width="25%" height="0.75rem" />
  </div>
);

const DriverSummarySkeleton = () => (
  <div style={{ height: '64px', padding: '8px' }}>
    <Skeleton width="40%" height="1rem" />
    <Skeleton width="60%" height="0.875rem" />
    <Skeleton width="20%" height="0.75rem" />
  </div>
);

const LazyShipmentCard = lazy(() => import('./ShipmentCard'));
const LazyDriverSummary = lazy(() => import('./DriverSummary'));

// add ErrorBoundary class component above Dashboard
// it should catch errors, show 'Failed to load panel.' and a retry button
// wrap Dashboard's Suspense boundaries inside ErrorBoundary

const Dashboard = () => (
  <div>
    <Suspense fallback={<ShipmentCardSkeleton />}>
      <LazyShipmentCard />
    </Suspense>
    <Suspense fallback={<DriverSummarySkeleton />}>
      <LazyDriverSummary />
    </Suspense>
  </div>
);`,
    feedback_correct:
      "Exactly — ErrorBoundary wraps Suspense. Suspense handles loading; ErrorBoundary handles failures. The retry button gives users a recovery path without a full page reload.",
    feedback_partial:
      "Check the order: ErrorBoundary must be the outer wrapper, Suspense inside it. And `getDerivedStateFromError` must return `{ hasError: true }` — not just set state directly.",
    feedback_wrong:
      "Pattern: class ErrorBoundary with `state = { hasError: false }`, `static getDerivedStateFromError() { return { hasError: true }; }`, and a render that returns the retry UI when hasError is true. Wrap the Suspense boundaries inside `<ErrorBoundary>`.",
    expected: `import React, { lazy, Suspense } from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
}

const Skeleton = ({ width = '100%', height = '1rem' }: SkeletonProps) => (
  <div className="skeleton-pulse" style={{ width, height }} />
);

const ShipmentCardSkeleton = () => (
  <div style={{ height: '72px', padding: '8px' }}>
    <Skeleton width="45%" height="1rem" />
    <Skeleton width="70%" height="0.875rem" />
    <Skeleton width="25%" height="0.75rem" />
  </div>
);

const DriverSummarySkeleton = () => (
  <div style={{ height: '64px', padding: '8px' }}>
    <Skeleton width="40%" height="1rem" />
    <Skeleton width="60%" height="0.875rem" />
    <Skeleton width="20%" height="0.75rem" />
  </div>
);

const LazyShipmentCard = lazy(() => import('./ShipmentCard'));
const LazyDriverSummary = lazy(() => import('./DriverSummary'));

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div>
          <p>Failed to load panel.</p>
          <button onClick={() => this.setState({ hasError: false })}>Retry</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const Dashboard = () => (
  <ErrorBoundary>
    <div>
      <Suspense fallback={<ShipmentCardSkeleton />}>
        <LazyShipmentCard />
      </Suspense>
      <Suspense fallback={<DriverSummarySkeleton />}>
        <LazyDriverSummary />
      </Suspense>
    </div>
  </ErrorBoundary>
);`,
    analog_example: `class PanelErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError)
      return <button onClick={() => this.setState({ hasError: false })}>Reload panel</button>;
    return this.props.children;
  }
}`,
    deepDiveLabel:
      "The retry button resets ErrorBoundary's state — but does resetting state actually retry the failed chunk download?",
    deepDive: {
      hook: "You build the retry button: `onClick={() => this.setState({ hasError: false })}`. It resets `hasError` to false, which re-renders the children. The Suspense boundary reappears. The skeleton flashes. Then immediately the ErrorBoundary catches another error and the failure UI returns. The retry didn't work — it just triggered the same failure again. The chunk is cached as failed by the browser, and React.lazy's internal Promise is still rejected.",
      pain: "⚠️ **Lesson:** Resetting ErrorBoundary state re-renders children, which re-attempts the lazy load — but the browser's module cache may have already marked the failed import as rejected. What's the correct mechanism for truly retrying a failed dynamic import?",
      mentalModel:
        "**Mental model:** Dynamic `import()` calls are **cached by module URL**. Once a URL resolves (successfully or with a failure), the browser caches that result. Retrying the same `import('./RouteMap')` returns the cached failure — it doesn't re-fetch. The workaround is to append a cache-busting query string to the import URL: `import('./RouteMap?retry=1')`. The browser treats it as a new URL and fetches fresh.",
      discover:
        "**Pattern — true retry for failed lazy loads:**\n```tsx\nconst [retryKey, setRetryKey] = useState(0);\n\n// force React.lazy to re-evaluate by changing the import URL\nconst LazyShipmentCard = useMemo(\n  () => lazy(() => import(`./ShipmentCard?v=${retryKey}`)),\n  [retryKey]\n);\n\n// ErrorBoundary passes a retry callback instead of resetting state directly\n<ErrorBoundary onRetry={() => setRetryKey(k => k + 1)}>\n  <Suspense fallback={<ShipmentCardSkeleton />}>\n    <LazyShipmentCard />\n  </Suspense>\n</ErrorBoundary>\n```",
      quickRules:
        "**Quick rules:**\n- ✅ Reset ErrorBoundary state to re-render children\n- ✅ Use a cache-busting query string on the import URL to bypass the browser's module cache on retry\n- ✅ Pass `onRetry` as a prop to ErrorBoundary so the parent controls retry logic\n- ❌ Don't call `lazy()` inside a component body — but `useMemo` with a dependency is the safe exception for retry\n- ❌ Don't expect retry to work automatically without cache-busting — the same URL = the same cached failure",
      watchOut:
        "👀 **Watch out:** If the retry mechanism re-creates the lazy component reference on every retry, React unmounts the old component tree and mounts a fresh one — this is intentional for a retry but means any local state inside the lazy component is lost. Design the retry flow so users understand they're getting a fresh panel, not the same one resuming.",
      dryRun:
        "🔁 **Think:** A user gets a chunk load failure for DriverSummary. The retry button resets ErrorBoundary state. React re-renders children — Suspense shows the DriverSummarySkeleton again. The same `import('./DriverSummary')` fires. The network is now back online. Does the browser re-fetch the chunk, or serve the cached failure? What determines whether the retry succeeds?",
      build:
        "**Learning focus:** Add an ErrorBoundary as the outer wrapper around Suspense boundaries — establishing the complete production pattern: ErrorBoundary catches chunk failures, Suspense catches loading states, and the retry mechanism must account for the browser's module cache to truly re-fetch a failed chunk.",
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
  lessonNum: 50,
  title: "Suspense + Fallback",
  shortName: "SUSPENSE — SHIPMENT SKELETON",
});
