import createINPACTEngine from "../inpact_engine_shared";

function normalizeCode(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

function evalLesson48Step1(answer) {
  const raw = String(answer || "");
  const hasImport = /import\s+.*FixedSizeList.*from\s+['"]react-window['"]/m.test(raw);
  return hasImport ? "correct" : "wrong";
}

function evalLesson48Step2(answer) {
  const raw = String(answer || "");
  const hasInterface = /interface\s+ShipmentRow\s*\{[\s\S]*?\}/m.test(raw);
  const hasId = /id\s*:\s*string\s*;?/m.test(raw);
  const hasOrigin = /origin\s*:\s*string\s*;?/m.test(raw);
  const hasDest = /destination\s*:\s*string\s*;?/m.test(raw);
  const hasStatus = /status\s*:\s*['"]active['"]\s*\|\s*['"]delayed['"]\s*\|\s*['"]delivered['"]\s*;?/m.test(raw);
  return hasInterface && hasId && hasOrigin && hasDest && hasStatus ? "correct" : "wrong";
}

function evalLesson48Step3(answer) {
  const raw = String(answer || "");
  const hasRowRenderer = /const\s+RowRenderer\s*=\s*\(\s*\{[\s\S]*?index[\s\S]*?style[\s\S]*?\}/m.test(raw);
  const hasStyleSpread = /style=\{style\}/m.test(raw);
  const hasIndexAccess = /shipments\[index\]/m.test(raw);
  return hasRowRenderer && hasStyleSpread && hasIndexAccess ? "correct" : "wrong";
}

function evalLesson48Step4(answer) {
  const raw = String(answer || "");
  const hasFixedSizeList = /<FixedSizeList/m.test(raw);
  const hasItemCount = /itemCount\s*=\s*\{shipments\.length\}/m.test(raw);
  const hasItemSize = /itemSize\s*=\s*\{\d+\}/m.test(raw);
  const hasHeight = /height\s*=\s*\{\d+\}/m.test(raw);
  const hasRowRenderer = /\{RowRenderer\}/m.test(raw);
  return hasFixedSizeList && hasItemCount && hasItemSize && hasHeight && hasRowRenderer ? "correct" : "wrong";
}

function evalLesson48Step5(answer) {
  const raw = String(answer || "");
  const hasMemo = /React\.memo\s*\(|memo\s*\(/m.test(raw);
  const wrapsRowRenderer = /memo\s*\(\s*RowRenderer\s*\)|memo\s*\(\s*\(/m.test(raw) ||
    /const\s+RowRenderer\s*=\s*React\.memo\s*\(/m.test(raw) ||
    /const\s+RowRenderer\s*=\s*memo\s*\(/m.test(raw);
  return hasMemo && wrapsRowRenderer ? "correct" : "wrong";
}

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "LESSON #48 (PERFORMANCE)",
      title: "List Virtualization — react-window",
      body: "Rendering 10,000 DOM nodes at once is a guaranteed jank machine. react-window fixes that by rendering only the rows visible in the viewport — a technique called windowing or virtualization. You'll build a virtualized shipment list that handles massive datasets without breaking the browser.",
      usecase:
        "Logistics dashboards routinely display warehouse inventories of thousands of shipments. Without virtualization, even a 500-row table can lag noticeably on scroll. react-window is the industry standard for this — used in production at Facebook, Airbnb, and across every data-heavy enterprise React application.",
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
        reason: "The RowRenderer in Step 3 uses JSX expressions and the style spread pattern `style={style}` — JSX attribute syntax from Lesson 1 is what makes that spread work without React rejecting it.",
      },
      {
        lesson: 10,
        label: "useState — Primitives",
        reason: "The shipments array is held in state in Step 4 via `useState<ShipmentRow[]>([])`. Without understanding useState's type annotation syntax, the generic `useState<ShipmentRow[]>` initializer looks arbitrary.",
      },
      {
        lesson: 12,
        label: "useState — Arrays",
        reason: "The shipments dataset is an array of objects. Step 4 maps over it and Step 3 accesses it by index — `shipments[index]`. The indexed access pattern and why arrays in state must not be mutated is covered in Lesson 12.",
      },
      {
        lesson: 16,
        label: "List Rendering + key",
        reason: "react-window's RowRenderer receives an `index` prop instead of using `.map()` with a key — this lesson explains why the key prop exists and what problem windowing sidesteps by using positional index access instead.",
      },
      {
        lesson: 44,
        label: "React.memo",
        reason: "Step 5 wraps RowRenderer in `React.memo` to prevent re-renders when only unrelated state changes. Without Lesson 44, the purpose of memo and the shallow-comparison bailout mechanism it provides won't be clear.",
      },
    ],
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Import FixedSizeList from react-window and understand why windowing exists",
      "Define a typed ShipmentRow interface matching the domain data shape",
      "Write a RowRenderer that receives index + style and accesses the data array by index",
      "Mount FixedSizeList with correct itemCount, itemSize, and height props",
      "Wrap RowRenderer in React.memo to eliminate unnecessary re-renders on scroll",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 5",
    paal: "Import FixedSizeList from the react-window package.",
    hint: "Named import — the package name is exactly 'react-window' (hyphenated, all lowercase).",
    example_code: `import { VariableSizeList } from 'react-window';`,
    think_prompt:
      "react-window exports multiple list types. FixedSizeList is for rows of equal height. Why does equal height matter for virtualization performance?",
    mc_options: [
      "import FixedSizeList from 'react-window'",
      "import { FixedSizeList } from 'react-window'",
      "import { FixedSizeList } from 'react-virtual'",
    ],
    mc_correct_option: "import { FixedSizeList } from 'react-window'",
    mc_anchor:
      "FixedSizeList is a named export — curly braces required. The package is react-window, not react-virtual. Fixed size means the library can calculate exactly which rows are visible using simple arithmetic — no layout measurement needed.",
    why_this_matters:
      "Knowing the difference between FixedSizeList and VariableSizeList is a production decision. Variable-height rows require the library to measure or estimate each row's height — that's expensive. When your data rows are uniform (a shipment card, a table row), always reach for FixedSizeList first.",
    answer_keywords: ["import", "FixedSizeList", "react-window"],
    evaluate: evalLesson48Step1,
    seed_code: "",
    starter_code: `// import FixedSizeList from react-window`,
    feedback_correct:
      "Correct — named import with curly braces. The package name is react-window, not react-virtual or react-virtualized.",
    feedback_partial:
      "Check two things: is it a named import (curly braces), and is the package name exactly 'react-window'?",
    feedback_wrong:
      "Pattern: `import { FixedSizeList } from 'react-window';` — named import, exact package name.",
    expected: `import { FixedSizeList } from 'react-window';`,
    analog_example: `import { VariableSizeGrid } from 'react-window';`,
    deepDiveLabel:
      "The list renders fine without virtualization for 50 rows — so what exactly breaks at 5,000?",
    deepDive: {
      hook: "Your WarehouseList component works perfectly in development. The QA environment seeds 5,000 shipments. The page loads, the browser pauses for 3 seconds, and then the user tries to scroll — every scroll gesture produces a visible stutter. Your PM opens the browser's performance panel and shows you a flame graph where a single render call took 2.1 seconds. This is the moment you learn that 'it works' and 'it scales' are two different things.",
      pain: "⚠️ **Lesson:** Rendering 5,000 `<div>` elements into the DOM simultaneously causes the browser's layout engine to calculate position and size for every single node on every scroll event. Why does node count hurt scroll performance even for nodes the user can't see?",
      mentalModel:
        "**Mental model:** Think of the DOM as a **spreadsheet where every cell is always calculating**. Even if a row is off-screen, the browser's layout engine still knows it exists, tracks its dimensions, and includes it in composite layer calculations. Virtualization turns this into a **sliding window** — only ~10–15 rows ever exist in the DOM at once. Scroll moves the window, swapping row content in place. The DOM node count stays constant regardless of dataset size. react-window handles the math; you provide the data and a row renderer.",
      discover:
        "**Pattern — naive vs. virtualized:**\n```tsx\n// ❌ naive — creates 5,000 DOM nodes\n{shipments.map((s) => (\n  <ShipmentRow key={s.id} shipment={s} />\n))}\n\n// ✅ virtualized — maximum ~15 DOM nodes regardless of dataset size\n<FixedSizeList\n  height={600}        // visible viewport height in px\n  itemCount={shipments.length}  // total rows in dataset\n  itemSize={72}       // each row's fixed height in px\n>\n  {({ index, style }) => (\n    // style MUST be spread — it positions the row absolutely\n    <div style={style}>\n      <ShipmentRow shipment={shipments[index]} />\n    </div>\n  )}\n</FixedSizeList>\n\n// ⚠️ missing style spread — rows render but stack on top of each other\n<div>  {/* no style */}\n  <ShipmentRow shipment={shipments[index]} />\n</div>\n```",
      quickRules:
        "**Quick rules:**\n- ✅ Use `FixedSizeList` when all rows have equal height\n- ✅ Always spread the `style` prop onto the outermost row element\n- ✅ Access data by `index` — not `.map()`, not `.forEach()`\n- ❌ Don't use `key` prop on the row element — react-window manages identity internally\n- ❌ Don't forget `height` on the list — without it the list has zero height and renders nothing",
      watchOut:
        "👀 **Watch out:** Forgetting to spread `style` onto the row element is the most common react-window bug. The list renders — you can see the items — but they all stack at the top of the list container, overlapping each other. The `style` prop that FixedSizeList injects is an absolute-positioning object (`{ position: 'absolute', top: N, height: 72 }`). Without it, every row renders at the document's normal flow position, and the scroll illusion completely breaks.",
      dryRun:
        "🔁 **Think:** Your FixedSizeList has `height={400}` and `itemSize={72}`. The viewport can show approximately 5 full rows and one partial row at any time. You have 10,000 shipments in state. When the user scrolls down to item #4,500 — how many DOM nodes does the list container hold? Does that number change between item #100 and item #4,500?",
      build:
        "**Learning focus:** Understand why DOM node count is the core scroll performance problem and how react-window's windowing strategy keeps node count constant regardless of dataset size.",
    },
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 5",
    paal: "Define the ShipmentRow interface with fields: id (string), origin (string), destination (string), and status ('active' | 'delayed' | 'delivered').",
    hint: "Union type for status — not a string. Interface keyword, not type alias.",
    example_code: `interface DriverRecord {
  driverId: string;
  depot: string;
  route: string;
  availability: 'on-duty' | 'off-duty' | 'transit';
}`,
    think_prompt:
      "Why use a union type for status instead of just `string`? What does the union type guarantee that `string` cannot?",
    mc_options: [
      "status: string",
      "status: 'active' | 'delayed' | 'delivered'",
      "status: ShipmentStatus",
    ],
    mc_correct_option: "status: 'active' | 'delayed' | 'delivered'",
    mc_anchor:
      "The union type is the answer for this step — it defines the type inline without requiring a separate ShipmentStatus alias. `string` would accept any value including typos. A separate `ShipmentStatus` alias would work but requires an extra declaration not asked for here.",
    why_this_matters:
      "When RowRenderer accesses `shipments[index].status` to apply a CSS class or render a badge, TypeScript knows the exact three values it can receive. No runtime guard needed. The type contract enforced at the interface level propagates all the way to the JSX that renders the status badge.",
    answer_keywords: ["interface", "ShipmentRow", "id", "origin", "destination", "status", "active", "delayed", "delivered"],
    evaluate: evalLesson48Step2,
    seed_code: `import { FixedSizeList } from 'react-window';`,
    starter_code: `import { FixedSizeList } from 'react-window';

// define ShipmentRow interface here
// fields: id (string), origin (string), destination (string), status (union)`,
    feedback_correct:
      "Exactly — union type for status, not string. TypeScript will now catch any typo in status values across the entire component.",
    feedback_partial:
      "Check the status field type — it should be a union of three string literals, not a plain string or a separate type reference.",
    feedback_wrong:
      "Pattern: `interface ShipmentRow { id: string; origin: string; destination: string; status: 'active' | 'delayed' | 'delivered'; }`",
    expected: `import { FixedSizeList } from 'react-window';

interface ShipmentRow {
  id: string;
  origin: string;
  destination: string;
  status: 'active' | 'delayed' | 'delivered';
}`,
    analog_example: `interface WarehouseSlot {
  slotId: string;
  zone: string;
  bay: string;
  occupancy: 'empty' | 'reserved' | 'occupied';
}`,
    deepDiveLabel:
      "The interface has four fields — but react-window only gives the row renderer an index. Where does the actual data come from?",
    deepDive: {
      hook: "You write the ShipmentRow interface, feed 10,000 rows to FixedSizeList, and open the RowRenderer function to start displaying data. The function signature gives you `index` and `style`. You look for `shipment` or `data` in the props — they're not there. react-window has the data. Your renderer has the index. There's a gap. This is the moment developers reach for React context, module-level variables, or start questioning if they've wired the library wrong.",
      pain: "⚠️ **Lesson:** FixedSizeList receives your data via `itemData` prop, and the renderer receives it via a third `data` argument — but this step only defines the interface. Why does the data contract need to exist before the renderer is written?",
      mentalModel:
        "**Mental model:** The interface is a **blueprint before construction**. The renderer function will access `data[index]` — it needs TypeScript to know what shape `data[index]` has before the function is written. Defining the interface first means the renderer gets autocomplete, type errors, and union narrowing for free. Without the interface, `data[index]` is `any` and TypeScript can no longer catch status typos.",
      discover:
        "**Pattern — typed itemData flow:**\n```tsx\ninterface ShipmentRow {\n  id: string;\n  origin: string;\n  destination: string;\n  status: 'active' | 'delayed' | 'delivered';\n}\n\n// ✅ pass data through itemData prop — typed\n<FixedSizeList\n  itemData={shipments}   // ShipmentRow[]\n  itemCount={shipments.length}\n  itemSize={72}\n  height={500}\n>\n  {({ index, style, data }) => {\n    const row: ShipmentRow = data[index]; // fully typed\n    return <div style={style}>{row.origin} → {row.destination}</div>;\n  }}\n</FixedSizeList>\n\n// ❌ closure access — works but can silently capture stale data\n{({ index, style }) => {\n  const row = shipments[index]; // captures shipments from closure\n```",
      quickRules:
        "**Quick rules:**\n- ✅ Define the row interface before writing the renderer\n- ✅ Pass array data via `itemData` prop for type-safe access in renderer\n- ✅ Destructure `data` from renderer args: `({ index, style, data })`\n- ❌ Don't access outer-scope arrays inside the renderer if `itemData` is available — stale closure risk\n- ❌ Don't make the interface overly broad — narrow types surface bugs earlier",
      watchOut:
        "👀 **Watch out:** Accessing the outer-scope `shipments` array inside the renderer via closure is a subtle stale data trap. If `shipments` is reassigned to a new array reference (as state updates do), the renderer already rendered with the old reference. Passing the array through `itemData` ensures the renderer always receives the current value at render time.",
      dryRun:
        "🔁 **Think:** Your interface says `status: 'active' | 'delayed' | 'delivered'`. The API returns a fourth value: `'cancelled'`. TypeScript marks it as a type error at the fetch boundary. But what happens at the renderer if you bypass TypeScript and cast the API response as `ShipmentRow[]`? Does the CSS class break silently, throw an error, or render an unexpected class name?",
      build:
        "**Learning focus:** Define the ShipmentRow interface as a typed contract that flows from data source to renderer — establishing the shape that TypeScript will enforce across every place the row data is accessed.",
    },
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 5",
    paal: "Write a RowRenderer component that receives { index, style } and renders a div with style spread, showing the shipment's origin → destination and status from the shipments array.",
    hint: "The style prop MUST be spread onto the outermost element. Access data as shipments[index]. The shipments array comes from the closure.",
    example_code: `const RouteRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
  const route = routes[index];
  return (
    <div style={style}>
      <span>{route.from} → {route.to}</span>
    </div>
  );
};`,
    think_prompt:
      "react-window injects a style object into each row. What happens to the list layout if you forget to spread that style onto your outermost element?",
    mc_options: [
      "Rows render but all stack at position 0 — the scroll illusion breaks",
      "react-window throws a runtime error about missing style",
      "Rows render correctly but with a slight visual offset",
    ],
    mc_correct_option: "Rows render but all stack at position 0 — the scroll illusion breaks",
    mc_anchor:
      "The style object contains `position: absolute` and a `top` value that tells each row where to sit in the scroll container. Without it, every row uses normal document flow and they all stack at the top. No error thrown — it just looks completely broken.",
    why_this_matters:
      "The style spread is the contract between react-window's scroll math and your DOM. react-window tracks which items are visible and calculates a `top` offset for each. Your renderer is responsible for applying it. This split of responsibilities — library owns scroll math, you own rendering — is why the API is composable enough to handle any row design.",
    answer_keywords: ["RowRenderer", "index", "style", "style={style}", "shipments[index]"],
    evaluate: evalLesson48Step3,
    seed_code: `import { FixedSizeList } from 'react-window';

interface ShipmentRow {
  id: string;
  origin: string;
  destination: string;
  status: 'active' | 'delayed' | 'delivered';
}`,
    starter_code: `import { FixedSizeList } from 'react-window';

interface ShipmentRow {
  id: string;
  origin: string;
  destination: string;
  status: 'active' | 'delayed' | 'delivered';
}

// declare shipments array here so RowRenderer can close over it
const shipments: ShipmentRow[] = [];

// write RowRenderer below — it receives { index, style }
// spread style onto the outermost element
// access shipments[index] to get the row data`,
    feedback_correct:
      "Exactly — style spread on the outermost div, index-based array access, data displayed. This is the canonical react-window row renderer pattern.",
    feedback_partial:
      "Check two things: is `style={style}` on the outermost element (not a child), and are you accessing the data as `shipments[index]`?",
    feedback_wrong:
      "Pattern: `const RowRenderer = ({ index, style }) => { const row = shipments[index]; return <div style={style}>{row.origin} → {row.destination} | {row.status}</div>; };`",
    expected: `import { FixedSizeList } from 'react-window';

interface ShipmentRow {
  id: string;
  origin: string;
  destination: string;
  status: 'active' | 'delayed' | 'delivered';
}

const shipments: ShipmentRow[] = [];

const RowRenderer = ({ index, style }: { index: number; style: React.CSSProperties }) => {
  const row = shipments[index];
  return (
    <div style={style}>
      <span>{row.origin} → {row.destination}</span>
      <span>{row.status}</span>
    </div>
  );
};`,
    analog_example: `const FlightRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
  const flight = departures[index];
  return (
    <div style={style}>
      <span>{flight.from} → {flight.to}</span>
    </div>
  );
};`,
    deepDiveLabel:
      "RowRenderer receives index and style — but react-window also supports passing the whole dataset through. Which approach is safer and why?",
    deepDive: {
      hook: "You ship the closure-based RowRenderer to production. It works for 6 months. Then the team adds a filter feature: users can narrow the shipment list by status. The filtered array updates, the parent re-renders — but the list still shows old rows for half a second before catching up. The closure captured the initial `shipments` reference. The filtered reference arrived after the renderer was memoized. You've hit the stale closure problem, and it's subtle enough that it only shows up under specific timing conditions.",
      pain: "⚠️ **Lesson:** The closure captures the array reference at the time the renderer is defined. If the array reference changes (as state updates do), when does the renderer see the new data — and is there a safer pattern?",
      mentalModel:
        "**Mental model:** Closures are **snapshots, not subscriptions**. When RowRenderer closes over `shipments`, it captures that specific array reference. State updates create a new reference — the old renderer still points to the old one until React re-renders the parent and creates a new renderer function. The `itemData` prop sidesteps this entirely: react-window passes `data` as an explicit argument to the renderer on each render cycle, guaranteeing the renderer always sees the current array.",
      discover:
        "**Pattern — closure vs. itemData:**\n```tsx\n// ✅ itemData — renderer always gets current data as explicit arg\n<FixedSizeList itemData={shipments} itemCount={shipments.length} ...>\n  {({ index, style, data }) => {\n    const row = data[index]; // data is the current shipments array\n    return <div style={style}>{row.origin}</div>;\n  }}\n</FixedSizeList>\n\n// ⚠️ closure — works but stale reference risk on fast updates\nconst RowRenderer = ({ index, style }) => {\n  const row = shipments[index]; // closure — may be stale\n  return <div style={style}>{row.origin}</div>;\n};\n```",
      quickRules:
        "**Quick rules:**\n- ✅ Spread `style` onto the outermost element — always\n- ✅ Prefer `itemData` prop for dynamic datasets that update frequently\n- ✅ Type the renderer props as `{ index: number; style: React.CSSProperties }`\n- ❌ Don't nest the style spread on an inner element\n- ❌ Don't skip the style prop — no error is thrown but the layout breaks visually",
      watchOut:
        "👀 **Watch out:** The `style` prop that react-window passes is an object like `{ position: 'absolute', top: 144, height: 72, width: '100%' }`. If you try to merge it with your own inline styles using `style={{ ...style, background: 'white' }}` — that works fine. But if you apply your own `position` or `top` in that merge, you override react-window's positioning math and the row snaps to the wrong location.",
      dryRun:
        "🔁 **Think:** Your RowRenderer renders `row.status` as text. The status is `'delayed'` and you want to show a red background. You add `style={{ ...style, background: row.status === 'delayed' ? 'red' : 'white' }}`. Does this conflict with react-window's style object — and what specific keys in react-window's style object could be accidentally overridden?",
      build:
        "**Learning focus:** Write a RowRenderer that correctly applies the injected style prop and accesses row data by index — understanding that the style spread is the mechanism that makes react-window's scroll positioning work.",
    },
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 5",
    paal: "Mount the FixedSizeList with height={500}, itemCount={shipments.length}, itemSize={72}, and pass RowRenderer as the children.",
    hint: "FixedSizeList expects children as a render function. Pass RowRenderer directly — not as JSX.",
    example_code: `<FixedSizeList
  height={400}
  itemCount={orders.length}
  itemSize={60}
>
  {OrderRow}
</FixedSizeList>`,
    think_prompt:
      "FixedSizeList accepts children — but it's not the same as a normal React children prop. What is the children prop's type for FixedSizeList, and how does that differ from `React.ReactNode`?",
    mc_options: [
      "<FixedSizeList height={500} itemCount={shipments.length} itemSize={72}><RowRenderer /></FixedSizeList>",
      "<FixedSizeList height={500} itemCount={shipments.length} itemSize={72}>{RowRenderer}</FixedSizeList>",
      "<FixedSizeList height={500} count={shipments.length} rowHeight={72}>{RowRenderer}</FixedSizeList>",
    ],
    mc_correct_option:
      "<FixedSizeList height={500} itemCount={shipments.length} itemSize={72}>{RowRenderer}</FixedSizeList>",
    mc_anchor:
      "Children must be the renderer function itself — not a JSX element. `<RowRenderer />` creates an element; `{RowRenderer}` passes the function reference. The prop names are `itemCount` and `itemSize` — not `count` or `rowHeight`.",
    why_this_matters:
      "Passing a JSX element `<RowRenderer />` as children immediately invokes the component and returns a React element — react-window can't call it with `index` and `style`. Passing the function reference `{RowRenderer}` lets react-window call it with the right args for each visible row. This pattern — library calls your function with controlled args — is how all windowing libraries work.",
    answer_keywords: ["FixedSizeList", "height", "itemCount", "shipments.length", "itemSize", "RowRenderer"],
    evaluate: evalLesson48Step4,
    seed_code: `import { FixedSizeList } from 'react-window';

interface ShipmentRow {
  id: string;
  origin: string;
  destination: string;
  status: 'active' | 'delayed' | 'delivered';
}

const shipments: ShipmentRow[] = [];

const RowRenderer = ({ index, style }: { index: number; style: React.CSSProperties }) => {
  const row = shipments[index];
  return (
    <div style={style}>
      <span>{row.origin} → {row.destination}</span>
      <span>{row.status}</span>
    </div>
  );
};`,
    starter_code: `import { FixedSizeList } from 'react-window';

interface ShipmentRow {
  id: string;
  origin: string;
  destination: string;
  status: 'active' | 'delayed' | 'delivered';
}

const shipments: ShipmentRow[] = [];

const RowRenderer = ({ index, style }: { index: number; style: React.CSSProperties }) => {
  const row = shipments[index];
  return (
    <div style={style}>
      <span>{row.origin} → {row.destination}</span>
      <span>{row.status}</span>
    </div>
  );
};

const ShipmentVirtualList = () => {
  return (
    // mount FixedSizeList here
    // height={500}, itemCount={shipments.length}, itemSize={72}
    // pass RowRenderer as children (function reference, not JSX element)
    <></>
  );
};`,
    feedback_correct:
      "Exactly — function reference as children, correct prop names. react-window will now call RowRenderer with `{ index, style }` for each visible row.",
    feedback_partial:
      "Check two things: are you passing `{RowRenderer}` (function reference) not `<RowRenderer />` (JSX element), and are the prop names `itemCount` and `itemSize` (not `count` or `rowHeight`)?",
    feedback_wrong:
      "Pattern: `<FixedSizeList height={500} itemCount={shipments.length} itemSize={72}>{RowRenderer}</FixedSizeList>`",
    expected: `import { FixedSizeList } from 'react-window';

interface ShipmentRow {
  id: string;
  origin: string;
  destination: string;
  status: 'active' | 'delayed' | 'delivered';
}

const shipments: ShipmentRow[] = [];

const RowRenderer = ({ index, style }: { index: number; style: React.CSSProperties }) => {
  const row = shipments[index];
  return (
    <div style={style}>
      <span>{row.origin} → {row.destination}</span>
      <span>{row.status}</span>
    </div>
  );
};

const ShipmentVirtualList = () => {
  return (
    <FixedSizeList
      height={500}
      itemCount={shipments.length}
      itemSize={72}
    >
      {RowRenderer}
    </FixedSizeList>
  );
};`,
    analog_example: `<FixedSizeList
  height={300}
  itemCount={drivers.length}
  itemSize={56}
>
  {DriverRow}
</FixedSizeList>`,
    deepDiveLabel:
      "itemCount tells react-window how many rows exist — but what happens when new shipments arrive and itemCount changes mid-scroll?",
    deepDive: {
      hook: "Your ShipmentVirtualList is live. A WebSocket connection pushes new shipments every 30 seconds. State updates. itemCount increases. You scroll to the bottom of the list — and then 10 new rows append. The list scrolls correctly to accommodate them. But then you notice: the user was at row 4,800 of 5,000. After the update, they're still at row 4,800 — but there are now 5,010 rows. No scroll jump. That's exactly correct behavior. But your PM asks: can we auto-scroll to the latest row? Now you need the list's imperative API — and that's a useRef.",
      pain: "⚠️ **Lesson:** `itemCount` drives how many virtual positions the scroll container creates. When it increases, the container height grows. When it decreases (after filtering), rows that were visible may disappear. Why does decreasing itemCount not cause an out-of-bounds index error in the renderer?",
      mentalModel:
        "**Mental model:** react-window treats `itemCount` as a **fence**. It only ever requests rows with `0 <= index < itemCount`. When itemCount decreases, the library recalculates which indices are visible and only calls RowRenderer for valid indices. It's similar to how `Array.slice()` never throws on a too-large end index — it just stops at the array boundary.",
      discover:
        "**Pattern — dynamic itemCount:**\n```tsx\nconst [shipments, setShipments] = useState<ShipmentRow[]>([]);\nconst listRef = useRef<FixedSizeList>(null);\n\n// ✅ itemCount updates automatically as state updates\n<FixedSizeList\n  ref={listRef}\n  height={500}\n  itemCount={shipments.length}  // reactive\n  itemSize={72}\n>\n  {RowRenderer}\n</FixedSizeList>\n\n// ✅ scroll to newest row imperatively\nuseEffect(() => {\n  listRef.current?.scrollToItem(shipments.length - 1, 'end');\n}, [shipments.length]);\n```",
      quickRules:
        "**Quick rules:**\n- ✅ `itemCount={shipments.length}` — always derive from array length, not hardcoded\n- ✅ Use `ref` on FixedSizeList to access `.scrollToItem()` imperatively\n- ✅ When filtering, always recompute `itemCount` from the filtered array\n- ❌ Don't hardcode `itemCount` — it will desync from the data array\n- ❌ Don't assume the renderer runs for all indices — only visible ones are called",
      watchOut:
        "👀 **Watch out:** If you filter the `shipments` array but forget to update `itemCount` (e.g., you hardcoded it), react-window will request indices beyond the filtered array's length. `shipments[index]` returns `undefined`, and your renderer crashes trying to access `undefined.origin`. Always derive `itemCount` from `shipments.length` — never hardcode it.",
      dryRun:
        "🔁 **Think:** You have 1,000 shipments and the user has scrolled to index 990. A status filter fires, reducing the visible dataset to 50 items. `itemCount` drops to 50. The user's scroll position is at index 990 — but the list only has 50 rows. Does react-window clamp the scroll position, leave it at 990 (showing nothing), or throw an error?",
      build:
        "**Learning focus:** Mount FixedSizeList with the three required props — height, itemCount, itemSize — and understand that children must be a function reference (not JSX) so react-window can call it with controlled arguments per visible row.",
    },
  },
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 5",
    paal: "Wrap RowRenderer in React.memo to prevent it from re-rendering when parent state changes that don't affect the visible rows.",
    hint: "memo wraps the component definition. The result replaces RowRenderer — same name, memoized version.",
    example_code: `const FlightRow = memo(({ index, style }: { index: number; style: React.CSSProperties }) => {
  const flight = departures[index];
  return <div style={style}>{flight.from} → {flight.to}</div>;
});`,
    think_prompt:
      "react-window already limits which rows render. So why does React.memo still matter for the rows that ARE rendered?",
    mc_options: [
      "React.memo prevents re-renders when the parent re-renders but the row's index and style haven't changed",
      "React.memo prevents react-window from calling the renderer for off-screen rows",
      "React.memo caches the DOM nodes so the browser doesn't repaint on scroll",
    ],
    mc_correct_option:
      "React.memo prevents re-renders when the parent re-renders but the row's index and style haven't changed",
    mc_anchor:
      "react-window controls which rows exist in the DOM. React.memo controls whether those existing rows re-render when their props haven't changed. They solve different problems. If the parent state updates (say, a search query field changes), every visible row gets new props passed — memo bails out if index and style are the same.",
    why_this_matters:
      "In a live logistics dashboard, parent state can change frequently — WebSocket updates, filter inputs, pagination controls. Without memo, every state change in the parent re-renders all visible rows even if none of their data changed. With 15 visible rows and updates every second, that's 15 wasted renders per second — perceptible jank at scale.",
    answer_keywords: ["memo", "React.memo", "RowRenderer"],
    evaluate: evalLesson48Step5,
    seed_code: `import { FixedSizeList } from 'react-window';

interface ShipmentRow {
  id: string;
  origin: string;
  destination: string;
  status: 'active' | 'delayed' | 'delivered';
}

const shipments: ShipmentRow[] = [];

const RowRenderer = ({ index, style }: { index: number; style: React.CSSProperties }) => {
  const row = shipments[index];
  return (
    <div style={style}>
      <span>{row.origin} → {row.destination}</span>
      <span>{row.status}</span>
    </div>
  );
};

const ShipmentVirtualList = () => {
  return (
    <FixedSizeList
      height={500}
      itemCount={shipments.length}
      itemSize={72}
    >
      {RowRenderer}
    </FixedSizeList>
  );
};`,
    starter_code: `import { memo } from 'react';
import { FixedSizeList } from 'react-window';

interface ShipmentRow {
  id: string;
  origin: string;
  destination: string;
  status: 'active' | 'delayed' | 'delivered';
}

const shipments: ShipmentRow[] = [];

// wrap RowRenderer in memo below
const RowRenderer = ({ index, style }: { index: number; style: React.CSSProperties }) => {
  const row = shipments[index];
  return (
    <div style={style}>
      <span>{row.origin} → {row.destination}</span>
      <span>{row.status}</span>
    </div>
  );
};

const ShipmentVirtualList = () => {
  return (
    <FixedSizeList
      height={500}
      itemCount={shipments.length}
      itemSize={72}
    >
      {RowRenderer}
    </FixedSizeList>
  );
};`,
    feedback_correct:
      "Exactly — RowRenderer is now memoized. react-window handles which rows exist; memo handles whether those rows re-render. Two separate optimizations, both needed.",
    feedback_partial:
      "Check that memo wraps RowRenderer's full definition — not just a part of it. The result should be assigned back to RowRenderer (or a new const with the same name).",
    feedback_wrong:
      "Pattern: `const RowRenderer = memo(({ index, style }) => { const row = shipments[index]; return <div style={style}>...</div>; });`",
    expected: `import { memo } from 'react';
import { FixedSizeList } from 'react-window';

interface ShipmentRow {
  id: string;
  origin: string;
  destination: string;
  status: 'active' | 'delayed' | 'delivered';
}

const shipments: ShipmentRow[] = [];

const RowRenderer = memo(({ index, style }: { index: number; style: React.CSSProperties }) => {
  const row = shipments[index];
  return (
    <div style={style}>
      <span>{row.origin} → {row.destination}</span>
      <span>{row.status}</span>
    </div>
  );
});

const ShipmentVirtualList = () => {
  return (
    <FixedSizeList
      height={500}
      itemCount={shipments.length}
      itemSize={72}
    >
      {RowRenderer}
    </FixedSizeList>
  );
};`,
    analog_example: `const DepotRow = memo(({ index, style }: { index: number; style: React.CSSProperties }) => {
  const depot = depots[index];
  return <div style={style}>{depot.name} — {depot.capacity}</div>;
});`,
    deepDiveLabel:
      "memo does a shallow comparison of props — but index and style change on every scroll. Doesn't that make memo useless here?",
    deepDive: {
      hook: "You wrap RowRenderer in memo and open React DevTools Profiler. You expect to see fewer renders. Instead, every scroll event lights up all visible rows as re-rendered. memo appears to do nothing. You open the profiler's 'why did this render' panel and it says: 'Props changed — style'. The style object is a new reference on every scroll tick. You question whether memo is worth adding at all.",
      pain: "⚠️ **Lesson:** react-window injects a new `style` object reference on every scroll event. memo does a shallow comparison — a new object reference always fails the equality check. So when does memo actually prevent re-renders for a virtualized list?",
      mentalModel:
        "**Mental model:** Think of memo as a **tollbooth** and props as **license plates**. Shallow comparison checks the plate number (reference), not the car's interior. A new object `{ top: 144 }` and another `{ top: 144 }` are two different plates even if they carry the same values. react-window actually does reuse style objects for rows that haven't moved — only the newly visible rows on a scroll get fresh style objects. So memo **does** prevent re-renders for stable rows that happen to be in the viewport but whose position hasn't changed (e.g., during a parent state update unrelated to scrolling).",
      discover:
        "**Pattern — when memo helps vs. doesn't:**\n```tsx\n// ✅ memo prevents re-render: parent search state changes,\n//    visible rows' index + style are the same object references → memo bails out\nconst [query, setQuery] = useState('');\n// RowRenderer wrapped in memo → stable rows don't re-render on query change ✓\n\n// ⚠️ memo can't prevent: scroll fires, react-window passes new style objects\n//    for rows that moved → memo comparison fails, rows re-render\n//    (this is correct behavior — those rows DID move)\n\n// ✅ for maximum memoization benefit, pass stable data via itemData\n<FixedSizeList itemData={shipments} ...>  // stable reference if shipments unchanged\n  {RowRenderer}  // memo + stable itemData = no re-renders for non-scroll updates\n</FixedSizeList>\n```",
      quickRules:
        "**Quick rules:**\n- ✅ memo prevents re-renders caused by parent state changes unrelated to the list\n- ✅ Combine memo + itemData for maximum referential stability\n- ✅ memo is most valuable when parent re-renders frequently (search input, filters)\n- ❌ Don't expect memo to prevent scroll-triggered re-renders — those are intentional\n- ❌ Don't add a custom comparator to memo unless you've profiled and confirmed a benefit",
      watchOut:
        "👀 **Watch out:** If you add a custom equality function to memo (`memo(RowRenderer, (prev, next) => prev.index === next.index)`) thinking you're preventing scroll re-renders, you're also preventing re-renders when `style.top` changes — meaning the row doesn't reposition on scroll. The row renders once and stays frozen at its initial position while other rows scroll past it. Custom comparators on row renderers almost always cause this visual bug.",
      dryRun:
        "🔁 **Think:** Your ShipmentVirtualList parent has a `filterQuery` state that updates on every keystroke. Without memo, how many RowRenderer re-renders happen per keystroke if 12 rows are visible? With memo (and stable style references for those 12 rows), how many re-renders happen? What's the difference in total component function calls per keystroke?",
      build:
        "**Learning focus:** Apply React.memo to RowRenderer as the second layer of virtualization optimization — controlling whether visible rows re-render on parent state changes, distinct from react-window's control over which rows exist in the DOM.",
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
  lessonNum: 48,
  title: "List Virtualization — react-window",
  shortName: "VIRTUALIZATION — SHIPMENT LIST",
});
