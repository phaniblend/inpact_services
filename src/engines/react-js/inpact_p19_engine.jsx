import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #19", title: "Component Composition", body: `Build a PageLayout with Header, Sidebar, Main, and Footer as named slots. Accept props like header, sidebar, main, footer (or children with names) and render a grid/flex layout.`, usecase: "Composition with slots is how layout components are built in design systems." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Accept header, sidebar, main, footer as props (each can be React nodes)", "Render a layout grid/flex with four regions", "Place each prop in the correct region"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create PageLayout that accepts header, sidebar, main, footer. Return a div with four sections: one for header at top, then a row with sidebar and main, then footer.", hint: "1) Accept the four props: function PageLayout({ header, sidebar, main, footer }). 2) Return: a wrapper div, then <header>{header}</header>, then a row div containing <aside>{sidebar}</aside> and <main>{main}</main>, then <footer>{footer}</footer>. Use semantic tags so the structure matches the task.", answer_keywords: ["header", "sidebar", "main", "footer", "div", "layout"], seed_code: `export default function PageLayout({ header, sidebar, main, footer }) {
  // Step 1: four regions
}`, feedback_correct: "✅ Layout structure.", feedback_partial: "Four areas for header, sidebar, main, footer.", feedback_wrong: "Accept { header, sidebar, main, footer } and return the four sections in order: header, then row (sidebar + main), then footer.", expected: `function PageLayout({ header, sidebar, main, footer }) {
  return (
    <div>
      <header>{header}</header>
      <div style={{ display: 'flex' }}>
        <aside>{sidebar}</aside>
        <main>{main}</main>
      </div>
      <footer>{footer}</footer>
    </div>
  );
}` },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Style the layout: header full width, then flex row with sidebar (e.g. 200px) and main (flex 1), footer full width. Use inline styles or a simple object.", hint: "Outer div: style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}. Middle row div: style={{ display: 'flex', flex: 1 }}. Aside: style={{ width: 200, padding: 16 }}. Main: style={{ flex: 1, padding: 16 }}. Header/footer: style={{ padding: 16 }}.", answer_keywords: ["style", "flex", "display", "width"], seed_code: `export default function PageLayout({ header, sidebar, main, footer }) {
  return (
    <div>
      <div>{header}</div>
      <div>{sidebar}</div>
      <div>{main}</div>
      <div>{footer}</div>
    </div>
  )
}`, feedback_correct: "✅ Styled layout.", feedback_partial: "Use flex so sidebar and main sit side by side.", feedback_wrong: "Outer: flexDirection 'column'. Row: display 'flex', flex 1. Sidebar: width (e.g. 200). Main: flex 1.", expected: `return (
  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <header style={{ padding: 16 }}>{header}</header>
    <div style={{ display: 'flex', flex: 1 }}>
      <aside style={{ width: 200, padding: 16 }}>{sidebar}</aside>
      <main style={{ flex: 1, padding: 16 }}>{main}</main>
    </div>
    <footer style={{ padding: 16 }}>{footer}</footer>
  </div>
);` },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Export PageLayout. Usage: <PageLayout header={<h1>App</h1>} sidebar={<nav>Links</nav>} main={<p>Content</p>} footer={<small>Footer</small>} />.", hint: "Keep export default function PageLayout(...). The caller passes JSX for each slot; your component just renders them in the four regions.", answer_keywords: ["export", "default"], seed_code: `export default function PageLayout({ header, sidebar, main, footer }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header style={{ padding: 16 }}>{header}</header>
      <div style={{ display: 'flex', flex: 1 }}>
        <aside style={{ width: 200, padding: 16 }}>{sidebar}</aside>
        <main style={{ flex: 1, padding: 16 }}>{main}</main>
      </div>
      <footer style={{ padding: 16 }}>{footer}</footer>
    </div>
  )
}`, feedback_correct: "✅ PageLayout with named slots complete.", feedback_partial: "Export and four regions.", feedback_wrong: "export default function PageLayout ... with all four props rendered.", expected: `export default function PageLayout({ header, sidebar, main, footer }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header style={{ padding: 16 }}>{header}</header>
      <div style={{ display: 'flex', flex: 1 }}>
        <aside style={{ width: 200, padding: 16 }}>{sidebar}</aside>
        <main style={{ flex: 1, padding: 16 }}>{main}</main>
      </div>
      <footer style={{ padding: 16 }}>{footer}</footer>
    </div>
  );
}` },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];

export default createINPACTEngine({ NODES, sideItems, lessonNum: 19, title: "Component Composition", shortName: "COMPONENT COMPOSITION" });
