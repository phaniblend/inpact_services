import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "FRONTEND ENGINEERING #1",
      title: "Frontend Performance & Core Web Vitals",
      body: `Performance IS the user experience.
A 1-second delay in page response reduces conversions by 7%.
53% of mobile users abandon sites that take > 3 seconds to load.
Google uses Core Web Vitals as a search ranking signal.

Core Web Vitals:
  LCP  — Largest Contentful Paint (< 2.5s is "good")
  CLS  — Cumulative Layout Shift (< 0.1 is "good")
  INP  — Interaction to Next Paint (< 200ms is "good")

Performance budget:
  Total JS: < 200KB compressed on initial load
  Time to Interactive: < 3.8s on 4G mobile
  First Contentful Paint: < 1.8s

Senior frontend engineers understand the browser's
rendering pipeline well enough to know exactly WHY
something is slow — not just that it is.`,
      usecase: `Every user-facing feature you build affects LCP, CLS, and INP. Bundle size directly impacts time-to-interactive. Image optimization is the fastest performance win on most sites.`,
    },
  },
  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Measure and interpret Core Web Vitals: LCP, CLS, INP",
      "Reduce bundle size with code splitting, tree-shaking, and dynamic imports",
      "Optimise images: modern formats, lazy loading, responsive sizing",
      "Eliminate layout shift (CLS) with reserved space and font strategies",
      "Improve INP by moving work off the main thread",
      "Use the browser's rendering pipeline to explain performance lessons",
    ],
  },
  {
    id: "step1", type: "question", phase: "Step 1 of 5",
    paal: "Measure Core Web Vitals in both lab and field data. Show how to use the web-vitals library and Chrome DevTools.",
    answer_keywords: ["lcp", "cls", "inp", "web-vitals", "measure", "field data", "lab"],
    seed_code: `// Step 1: measuring Core Web Vitals

import { onLCP, onCLS, onINP } from 'web-vitals'

/*
LAB DATA vs FIELD DATA:
  Lab:   Lighthouse, PageSpeed Insights — controlled, repeatable
         Doesn't reflect real user network/device conditions
  Field: Real User Monitoring (RUM) — actual users, actual devices
         More accurate, higher variance
  
  Both matter. Fix lab data first, validate with field data.

CORE WEB VITALS:
  LCP (Largest Contentful Paint):
    What: when the largest image or text block renders
    Good: < 2.5s | Needs Work: 2.5-4s | Poor: > 4s
    Usually: hero image, above-fold heading
    
  CLS (Cumulative Layout Shift):
    What: how much content unexpectedly moves during load
    Good: < 0.1 | Needs Work: 0.1-0.25 | Poor: > 0.25
    Causes: images without dimensions, async font loading, late-injected ads
    
  INP (Interaction to Next Paint) — replaced FID in 2024:
    What: responsiveness from any user interaction
    Good: < 200ms | Needs Work: 200-500ms | Poor: > 500ms
    Causes: long JS tasks blocking main thread
*/

// Report vitals to your analytics:
function reportVitals() {
  const report = ({ name, value, rating, id }) => {
    // Send to your analytics endpoint:
    fetch('/analytics/vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric: name,
        value: Math.round(name === 'CLS' ? value * 1000 : value),  // CLS × 1000 for readability
        rating,   // 'good' | 'needs-improvement' | 'poor'
        id,       // unique per page load
        page: location.pathname,
        timestamp: Date.now(),
      }),
      keepalive: true,  // survives page unload
    })
  }

  onLCP(report)
  onCLS(report)
  onINP(report)
}

// Chrome DevTools — Performance panel:
// 1. Record a page load
// 2. Look for: Long Tasks (red bar) > 50ms
// 3. Look for: Layout Shifts (purple bar)
// 4. Look for: LCP marker (green line)

// Lighthouse CI — automated in CI pipeline:
// npx lighthouse https://myapp.com --only-categories=performance --output=json
// Fail the build if performance score drops below threshold

reportVitals()`,
    feedback_correct: "✅ web-vitals library for field data. LCP < 2.5s, CLS < 0.1, INP < 200ms. Report to analytics with rating. DevTools Performance panel for debugging.",
    feedback_partial: "onLCP, onCLS, onINP from web-vitals. Report { name, value, rating, page }. Lab = Lighthouse. Field = RUM. Both matter.",
    feedback_wrong: "import { onLCP, onCLS, onINP } from 'web-vitals'. Report to analytics with keepalive:true. Good thresholds: LCP<2.5s, CLS<0.1, INP<200ms.",
    expected: "Core Web Vitals measurement setup",
  },
  {
    id: "step2", type: "question", phase: "Step 2 of 5",
    paal: "Reduce JavaScript bundle size: code splitting by route, dynamic imports, tree shaking, and bundle analysis.",
    answer_keywords: ["code splitting", "dynamic import", "tree shaking", "bundle", "lazy", "chunk"],
    seed_code: `// Step 2: bundle size optimisation

/*
PERFORMANCE BUDGET:
  Total initial JS: < 200KB compressed (gzipped)
  Per route chunk: < 50KB compressed
  Third-party: < 100KB compressed

WHY JS SIZE MATTERS:
  1. Download time (bandwidth)
  2. Parse time (CPU — especially on low-end mobile)
  3. Execution time (CPU)
  Mobile mid-range: 1MB JS → 6-8 seconds to interactive
*/

// ── ROUTE-BASED CODE SPLITTING (React) ───────────────────────
import { lazy, Suspense } from 'react'

// ❌ BEFORE — everything in one bundle:
// import AdminDashboard from './AdminDashboard'   // 120KB, most users never see it
// import CheckoutFlow from './CheckoutFlow'       // 80KB, only used during checkout

// ✅ AFTER — split by route, load on demand:
const AdminDashboard = lazy(() => import('./AdminDashboard'))
const CheckoutFlow   = lazy(() => import('./CheckoutFlow'))

function App() {
  return (
    <Suspense fallback={<Skeleton />}>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/checkout" element={<CheckoutFlow />} />
      </Routes>
    </Suspense>
  )
}

// ── DYNAMIC IMPORTS FOR HEAVY LIBRARIES ───────────────────────
// ❌ BAD — load chart library even if user never views the chart:
// import * as Recharts from 'recharts'  // 250KB

// ✅ GOOD — load only when the chart is visible:
async function loadChart(containerId, data) {
  const { LineChart, Line, XAxis } = await import('recharts')  // loads now
  // render chart
}

// Or with Intersection Observer (load when scrolled into view):
const observer = new IntersectionObserver(async ([entry]) => {
  if (entry.isIntersecting) {
    const { initHeavyComponent } = await import('./HeavyChart')
    initHeavyComponent(entry.target)
    observer.disconnect()
  }
})
observer.observe(document.querySelector('#chart-container'))

// ── TREE SHAKING — only import what you use ───────────────────
// ❌ BAD — imports entire lodash (~70KB):
// import _ from 'lodash'
// _.debounce(fn, 300)

// ✅ GOOD — import specific function (< 1KB):
import debounce from 'lodash/debounce'

// ✅ BETTER — use native alternatives where possible:
const debounced = (fn, delay) => {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), delay) }
}

// ── BUNDLE ANALYSIS ───────────────────────────────────────────
// npx webpack-bundle-analyzer stats.json
// Or for Vite: npx vite-bundle-visualizer
// Look for: duplicate packages, unexpectedly large deps, entire libs imported

export { App }`,
    feedback_correct: "✅ lazy() + dynamic import for route splitting. import('lib') on demand for heavy deps. Named imports for tree-shaking. Analyse bundle to find offenders.",
    feedback_partial: "lazy(() => import('./Component')) for route splitting. Dynamic import() for heavy libs. Named imports not * for tree-shaking.",
    feedback_wrong: "React.lazy(() => import('./Page')) per route. await import('heavy-lib') on demand. import { fn } not import * for tree-shaking.",
    expected: "Bundle size reduction techniques",
  },
  {
    id: "step3", type: "question", phase: "Step 3 of 5",
    paal: "Optimise images to improve LCP: WebP/AVIF formats, srcset for responsive sizes, lazy loading below fold, and priority for LCP element.",
    answer_keywords: ["webp", "avif", "srcset", "lazy", "priority", "lcp", "responsive"],
    seed_code: `// Step 3: image optimisation — often the biggest LCP win

/*
IMAGES ARE TYPICALLY:
  - The LCP element (hero image, product photo)
  - 50-80% of total page weight on image-heavy sites
  - The fastest win available on most pages

FORMAT HIERARCHY (smallest → largest):
  AVIF  → 50% smaller than JPEG, great quality (Chrome/Firefox/Safari)
  WebP  → 25-35% smaller than JPEG (universal browser support)
  JPEG  → baseline, always supported
  PNG   → for transparency; consider WebP instead
*/

// ── LCP HERO IMAGE — maximum priority ────────────────────────
// This is the most important image on the page.
// Preload it. Never lazy-load it.

// In <head>:
// <link rel="preload" as="image" href="/hero.webp"
//   imagesrcset="/hero-800.webp 800w, /hero-1600.webp 1600w"
//   imagesizes="100vw" fetchpriority="high">

// The image element itself:
function HeroImage() {
  return (
    <picture>
      {/* AVIF first — most modern, smallest */}
      <source
        type="image/avif"
        srcSet="/hero-800.avif 800w, /hero-1600.avif 1600w"
        sizes="(max-width: 800px) 100vw, 1600px"
      />
      {/* WebP fallback */}
      <source
        type="image/webp"
        srcSet="/hero-800.webp 800w, /hero-1600.webp 1600w"
        sizes="(max-width: 800px) 100vw, 1600px"
      />
      {/* JPEG fallback for very old browsers */}
      <img
        src="/hero-1600.jpg"
        alt="Course platform hero"
        width={1600}
        height={800}       // ALWAYS set width and height → prevents CLS!
        fetchPriority="high"  // tells browser this is critical
        decoding="sync"    // decode synchronously for LCP element
      />
    </picture>
  )
}

// ── BELOW-THE-FOLD IMAGES — lazy load ────────────────────────
function ProductCard({ image, alt }) {
  return (
    <img
      src={image}
      alt={alt}
      width={400}
      height={300}
      loading="lazy"         // browser skips until near viewport
      decoding="async"       // decode off main thread
    />
  )
}

// ── NEXT.JS Image COMPONENT (handles all of this automatically) ──
// import Image from 'next/image'
// <Image src="/hero.jpg" width={1600} height={800} priority alt="..." />
// → Automatic WebP/AVIF conversion, srcset, lazy loading, CLS prevention

// ── WHAT TO CONVERT ON THE SERVER ────────────────────────────
// sharp (Node.js) — the fastest image processing library:
// sharp('input.jpg').webp({ quality: 80 }).toFile('output.webp')
// sharp('input.jpg').avif({ quality: 60 }).toFile('output.avif')

export { HeroImage, ProductCard }`,
    feedback_correct: "✅ AVIF→WebP→JPEG with <picture>. width+height always (prevents CLS). fetchPriority=high for LCP. loading=lazy below fold. Preload LCP image in <head>.",
    feedback_partial: "<picture> with AVIF+WebP sources. Always set width and height. fetchPriority='high' on LCP image. loading='lazy' for below-fold images.",
    feedback_wrong: "<picture> AVIF→WebP→JPEG. width+height on every img (CLS prevention). fetchPriority='high' for LCP. loading='lazy' below fold. Preload in <head>.",
    expected: "Image optimisation for LCP and CLS",
  },
  {
    id: "step4", type: "question", phase: "Step 4 of 5",
    paal: "Fix CLS: eliminate layout shifts from images, fonts, and dynamic content by reserving space before content loads.",
    answer_keywords: ["cls", "layout shift", "aspect ratio", "font", "font-display", "skeleton", "reserved"],
    seed_code: `// Step 4: eliminating layout shift (CLS)

/*
WHAT CAUSES CLS:
  1. Images without width/height — browser doesn't know the space to reserve
  2. Fonts loading after text rendered (FOUT — Flash of Unstyled Text)
  3. Dynamic content injected above existing content (ads, banners, cookies)
  4. Animations that change layout properties (top/left/width/height)

─── FIX 1: IMAGES — always specify dimensions ────────────────────
*/
// ❌ BAD — browser doesn't know height → content shifts when image loads:
// <img src="product.jpg" alt="product" />

// ✅ GOOD — browser reserves the right space immediately:
// <img src="product.jpg" alt="product" width="400" height="300" />

// CSS aspect-ratio box (for responsive images without fixed dimensions):
const aspectRatioBox = [
  '.image-container {',
  '  aspect-ratio: 16/9;  /* reserves correct ratio before image loads */',
  '  width: 100%;',
  '  overflow: hidden;',
  '}',
  '.image-container img {',
  '  width: 100%;',
  '  height: 100%;',
  '  object-fit: cover;',
  '}',
].join('\n')

// ── FIX 2: FONTS — prevent shift when font loads ──────────────
const fontFace = [
  "@font-face {",
  "  font-family: 'MyFont';",
  "  src: url('/fonts/myfont.woff2') format('woff2');",
  "  font-display: optional;",
  "}",
].join('\n')
// font-display: optional = best for CLS (no swap = no shift)
// font-display: swap = ok if fonts look similar to fallback
// font-size-adjust: matches fallback font metrics to reduce shift

// ── FIX 3: SKELETON SCREENS — reserve space for async content ─
function UserCard({ userId }) {
  const { data: user, loading } = useUser(userId)

  if (loading) {
    return (
      // Skeleton has SAME dimensions as real content — no shift when it loads:
      <div style={{ width: 300, height: 120, background: '#eee', borderRadius: 8 }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#ddd', margin: 16 }} />
        <div style={{ width: 200, height: 16, background: '#ddd', margin: '0 16px' }} />
      </div>
    )
  }

  return (
    <div style={{ width: 300, height: 120 }}>  {/* same dimensions as skeleton */}
      <img src={user.avatar} width={60} height={60} />
      <span>{user.name}</span>
    </div>
  )
}

// ── FIX 4: ANIMATIONS — never animate layout properties ───────
// ❌ Causes layout recalculation (expensive + can cause CLS):
// element.style.width = '200px'
// element.style.top = '100px'

// ✅ Animate transform and opacity only (GPU composited — free):
// element.style.transform = 'translateX(200px)'  ← same visual effect, no layout
// element.style.opacity = '0'

export { UserCard }`,
    feedback_correct: "✅ Always set width+height on images. aspect-ratio for responsive. font-display:optional for zero font shift. Skeletons with same dimensions as content.",
    feedback_partial: "CLS fixes: img width+height, aspect-ratio CSS, font-display:optional, skeleton screens with matching dimensions, transform not top/left for animation.",
    feedback_wrong: "width+height on every img. font-display:optional. Skeleton same size as real content. Animate transform not width/height/top/left.",
    expected: "CLS elimination strategies",
  },
  {
    id: "step5", type: "question", phase: "Step 5 of 5",
    paal: "Improve INP by moving long tasks off the main thread: web workers, scheduler API, and the 50ms task budget rule.",
    answer_keywords: ["inp", "main thread", "long task", "web worker", "scheduler", "50ms", "yield"],
    seed_code: `// Step 5: improving INP — keeping the main thread free

/*
INP = Interaction to Next Paint
The browser can't paint a response to a user action while
the main thread is busy with other work.

RULE: No single task should block the main thread for > 50ms.
(This is the "50ms budget" from RAIL model.)

Long tasks (> 50ms) cause:
  - Clicks that feel laggy
  - Scroll jitter
  - Animations that drop frames
  - Input that appears to ignore you
*/

// ── TECHNIQUE 1: YIELD TO THE MAIN THREAD ─────────────────────
// Break up long synchronous work into smaller chunks:

// ❌ BAD — blocks for 500ms:
function processLargeDataset(items) {
  return items.map(expensiveTransform)  // 500ms of blocking
}

// ✅ GOOD — yields every 50ms so browser can handle interactions:
async function processInChunks(items, chunkSize = 100) {
  const results = []
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize)
    results.push(...chunk.map(expensiveTransform))
    // Yield to browser — allow paint, input, etc:
    await scheduler.yield()  // native scheduler API (Chrome 115+)
    // Fallback: await new Promise(r => setTimeout(r, 0))
  }
  return results
}

// ── TECHNIQUE 2: WEB WORKERS — true parallelism ───────────────
// Move CPU-heavy work entirely off the main thread:

// main.js:
const worker = new Worker(new URL('./heavy-worker.js', import.meta.url), { type: 'module' })

worker.postMessage({ type: 'process', data: largeDataset })

worker.onmessage = ({ data }) => {
  if (data.type === 'result') {
    displayResults(data.result)  // back on main thread, just for display
  }
}

// heavy-worker.js (runs in background thread — no DOM access):
self.onmessage = ({ data }) => {
  if (data.type === 'process') {
    const result = data.data.map(expensiveTransform)  // won't block main thread
    self.postMessage({ type: 'result', result })
  }
}

// ── TECHNIQUE 3: SCHEDULER API ────────────────────────────────
// Prioritise tasks — let urgent work preempt background work:

// Schedule non-urgent work at lower priority:
scheduler.postTask(() => {
  updateAnalyticsDashboard()  // not user-critical
}, { priority: 'background' })

// User-initiated work gets high priority:
button.addEventListener('click', () => {
  scheduler.postTask(() => {
    processUserInput()
  }, { priority: 'user-blocking' })  // runs as soon as possible
})

/*
INP DEBUGGING CHECKLIST:
  1. Chrome DevTools → Performance → record interaction
  2. Look for Long Tasks (red triangles) > 50ms
  3. Find the heaviest function in the long task
  4. Can it be: moved to a worker? split into chunks? deferred?
  5. After fix: verify INP in web-vitals field data
*/

function expensiveTransform(item) { return item }  // placeholder

export { processInChunks }`,
    feedback_correct: "✅ 50ms main thread budget. scheduler.yield() to break up long tasks. Web Workers for true parallelism. Scheduler API for priority-based task scheduling.",
    feedback_partial: "Long tasks > 50ms cause poor INP. scheduler.yield() yields to browser. Web Worker moves work off main thread. scheduler.postTask for priority.",
    feedback_wrong: "Split work into chunks, await scheduler.yield() between chunks. Web Worker for CPU-heavy work. Never block main thread > 50ms.",
    expected: "INP improvement with workers and scheduling",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Measuring CWV", id: "step1" },
  { label: "Step 2 — Bundle size", id: "step2" },
  { label: "Step 3 — Image optimisation", id: "step3" },
  { label: "Step 4 — CLS elimination", id: "step4" },
  { label: "Step 5 — INP & main thread", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: "FE-01", title: "Frontend Performance & Core Web Vitals", shortName: "FE — PERFORMANCE" });
