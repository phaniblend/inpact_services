import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
{
  id: "intro",
  type: "reveal",
  phase: "Lesson",
  content: {
    tag: "LESSON #11 (TypeScript)",
    title: "useState — Objects + Spread",
    body: "Every prop you have defined so far has had an explicit name — shipmentId, status, carrier. The children prop is different. It's the implicit prop that holds whatever JSX a parent places between a component's opening and closing tags. In this lesson you'll type children correctly with ReactNode, build a layout wrapper that accepts any content, and understand why ReactNode is the right type while JSX.Element is not.",
    usecase:
      "Layout components are the backbone of enterprise UIs — cards, panels, modals, page shells. They provide structure, spacing, and chrome, but their content changes with every use. The children prop is what makes one Card component work for a shipment summary, an invoice detail, and a driver profile without being rewritten each time.",
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
      reason: "Complete Lesson 1 (JSX — The Full Language) first — it is a prerequisite on the React-TS track for this lesson.",
    },
    {
      lesson: 10,
      label: "useState — Primitives",
      reason: "Complete Lesson 10 (useState — Primitives) first — it is a prerequisite on the React-TS track for this lesson.",
    },
  ],
},
{
  id: "objectives",
  type: "objectives",
  phase: "Objectives",
  items: [
    "Understand what the children prop holds and when it is populated",
    "Type children correctly using React.ReactNode in a props interface",
    "Build a layout wrapper component that accepts and renders children",
    "Distinguish between ReactNode and JSX.Element and know when each is appropriate",
    "Make children optional so the wrapper renders correctly even with no content",
  ],
},
{
  id: "step1",
  type: "question",
  phase: "Step 1 of 5",
  paal: "Define a ShipmentCardShellProps interface with two fields: title as a required string, and children typed as React.ReactNode.",
  hint: "React.ReactNode is the type that covers everything React can render — strings, numbers, JSX elements, arrays, null, and undefined.",
  example_code: `interface PanelProps {
  heading: string;
  children: React.ReactNode;
}`,
  think_prompt:
    "The card shell needs to render a title at the top and whatever content the parent places inside it. The content could be a single element, multiple elements, plain text, or nothing. What TypeScript type covers all of those possibilities?",
  mc_options: [
    "interface ShipmentCardShellProps { title: string; children: JSX.Element }",
    "interface ShipmentCardShellProps { title: string; children: React.ReactNode }",
    "interface ShipmentCardShellProps { title: string; children: string }",
  ],
  mc_correct_option:
    "interface ShipmentCardShellProps { title: string; children: React.ReactNode }",
  mc_anchor:
    "React.ReactNode is the widest renderable type — it accepts JSX elements, strings, numbers, arrays of any of these, null, undefined, and boolean. JSX.Element is narrower — it only accepts a single JSX element, rejecting strings, numbers, null, and arrays. string only accepts string content, rejecting all JSX. ReactNode is the correct type for children because parents can put anything inside a component.",
  why_this_matters:
    "In a real enterprise app, card shells render shipment summaries, invoice tables, driver profiles, and error states — all different shapes of content. Typing children as ReactNode means the shell accepts all of them. Typing it as JSX.Element means you break callers the moment someone passes a string or null.",
  answer_keywords: [
    "interface", "ShipmentCardShellProps", "title", "string", "children", "React.ReactNode",
  ],
  seed_code: ``,
  starter_code: `// define ShipmentCardShellProps interface here
// title: required string
// children: React.ReactNode`,
  feedback_correct:
    "Exactly — React.ReactNode covers everything React can render, making the shell accept any content a parent might pass.",
  feedback_partial:
    "Close — check the children type. JSX.Element is too narrow — it rejects strings, null, and arrays. React.ReactNode is the correct type for children.",
  feedback_wrong:
    "The pattern: `interface ShipmentCardShellProps { title: string; children: React.ReactNode }` — ReactNode is the widest renderable type and the correct choice for children.",
  expected: `interface ShipmentCardShellProps {
  title: string;
  children: React.ReactNode;
}`,
  analog_example: `interface ModalProps {
  heading: string;
  children: React.ReactNode;
}`,
  deepDiveLabel:
    "ReactNode is wide — but what exactly does it include that JSX.Element doesn't?",
  deepDive: {
    hook: "You type children as JSX.Element. A parent passes a string between the tags: `<ShipmentCardShell title='NX-1042'>Loading...</ShipmentCardShell>`. TypeScript errors. You're confused — 'Loading...' is valid JSX content, you've seen it render in the browser. The problem is JSX.Element — it only accepts a single compiled JSX element, and a plain string isn't one.\n\nYou switch to ReactNode. The error disappears. You try `null`, `undefined`, `[<p>one</p>, <p>two</p>]`, `42` — all accepted. ReactNode is genuinely wide.",
    pain: "⚠️ **Lesson:** You type children as JSX.Element. A parent wraps a string inside the shell. TypeScript errors. But strings render fine in React — why does JSX.Element reject them?",
    mentalModel:
      "**Mental model:** Think of React's renderable types as **concentric circles**.\n- Innermost: `JSX.Element` — a single compiled React element. `<div>`, `<ShipmentCard />`. One element, no others.\n- Middle: `React.ReactElement` — similar to JSX.Element, covers elements produced by React.createElement.\n- Outer: `React.ReactNode` — everything React can render: JSX elements, strings, numbers, boolean (renders nothing), null (renders nothing), undefined (renders nothing), arrays and fragments of any of the above.\n- `children` should always be ReactNode — because parents can pass any of these things and React handles all of them.\n- Use JSX.Element only when you need to guarantee the value is a single JSX element — like a renderItem callback in a generic list component.",
    discover:
      "**Pattern — ReactNode vs JSX.Element:**\n```tsx\n// ✅ ReactNode — for children, accepts everything React can render\ninterface ShipmentCardShellProps {\n  children: React.ReactNode;\n}\n<ShipmentCardShell title='NX-1'>Loading...</ShipmentCardShell>         // ✅ string\n<ShipmentCardShell title='NX-1'><p>content</p></ShipmentCardShell>    // ✅ JSX element\n<ShipmentCardShell title='NX-1'>{null}</ShipmentCardShell>             // ✅ null\n<ShipmentCardShell title='NX-1'>{[<p/>, <p/>]}</ShipmentCardShell>    // ✅ array\n\n// ❌ JSX.Element — too narrow for children\ninterface ShipmentCardShellProps {\n  children: JSX.Element;\n}\n<ShipmentCardShell title='NX-1'>Loading...</ShipmentCardShell>         // ❌ string rejected\n<ShipmentCardShell title='NX-1'>{null}</ShipmentCardShell>             // ❌ null rejected\n```\n- children: ReactNode — the correct type for general content\n- renderItem callbacks: JSX.Element — when you need exactly one element returned\n- never use string, number, or Element[] directly for children — ReactNode covers all",
    quickRules:
      "**Quick rules:**\n- ✅ `children: React.ReactNode` — correct for all children props\n- ✅ `renderItem: (item: T) => JSX.Element` — correct for render callbacks that must return a single element\n- ❌ `children: JSX.Element` — too narrow, rejects strings, null, arrays\n- ❌ `children: string` — only accepts strings, rejects all JSX\n- ❌ `children: any` — defeats type safety entirely",
    watchOut:
      "👀 **Watch out:** ReactNode includes `boolean` — and React renders `true` and `false` as nothing. This means `{condition && <span>text</span>}` produces either a span or `false` — and ReactNode accepts both. That's intentional: JSX conditional expressions rely on this behaviour. If you typed children as JSX.Element, the && pattern would break everywhere.",
    dryRun:
      "🔁 **Think:** children is typed as React.ReactNode. A parent passes `<ShipmentCardShell>{42}</ShipmentCardShell>`. Does TypeScript error? What does React render — the number 42, an error, or nothing? Now a parent passes `<ShipmentCardShell>{false}</ShipmentCardShell>`. Does TypeScript error? What renders?",
    build:
      "**Learning focus:** Type children as React.ReactNode — understanding that it covers every value React can render, making it the correct and complete type for component children.",
  },
},
{
  id: "step2",
  type: "question",
  phase: "Step 2 of 5",
  paal: "Build the ShipmentCardShell component shell — accept ShipmentCardShellProps, destructure title and children, and return a div with a heading for title and a section for children.",
  hint: "children renders just like any other prop — put it inside curly braces in the JSX. The wrapper div provides the card structure; the section tag is where any content goes.",
  example_code: `const Panel = ({ heading, children }: PanelProps): JSX.Element => {
  return (
    <div className="panel">
      <h2>{heading}</h2>
      <section>{children}</section>
    </div>
  );
};`,
  think_prompt:
    "children is a prop like any other — but where does it come from and how does it get into the component? If a parent writes `<ShipmentCardShell title='NX-1042'><p>content</p></ShipmentCardShell>`, what holds the `<p>content</p>`?",
  mc_options: [
    "children is passed as an explicit prop: <ShipmentCardShell title='NX-1' children={<p>content</p>} />",
    "children is automatically populated with whatever JSX is placed between the opening and closing tags",
    "children must be rendered using React.Children.map to work correctly",
  ],
  mc_correct_option:
    "children is automatically populated with whatever JSX is placed between the opening and closing tags",
  mc_anchor:
    "React automatically captures everything between a component's opening and closing tags and passes it as the children prop. You don't explicitly pass it — it just arrives. Passing children as an explicit prop attribute also works but is unconventional. React.Children.map is a utility for more complex children manipulation — it's not needed for basic rendering.",
  why_this_matters:
    "The children prop is what makes composable layouts possible. A card shell, a modal, a page template — all of them accept whatever content the parent provides between their tags. Understanding that children arrives implicitly is what unlocks the full power of component composition.",
  answer_keywords: [
    "ShipmentCardShellProps", "title", "children",
    "<div>", "<h2>", "<section>", "{children}",
  ],
  seed_code: `interface ShipmentCardShellProps {
  title: string;
  children: React.ReactNode;
}`,
  starter_code: `interface ShipmentCardShellProps {
  title: string;
  children: React.ReactNode;
}

// define ShipmentCardShell here
// destructure title and children
// return a div > h2 for title, section for children`,
  feedback_correct:
    "Exactly — {children} in JSX renders whatever the parent placed between the tags. The shell provides the structure; the parent provides the content.",
  feedback_partial:
    "Close — make sure children appears in both the destructure and the JSX. If it's in the destructure but not rendered with {children}, the content never appears.",
  feedback_wrong:
    "The pattern: `const ShipmentCardShell = ({ title, children }: ShipmentCardShellProps): JSX.Element => { return (<div><h2>{title}</h2><section>{children}</section></div>); }` — destructure both, render both.",
  expected: `interface ShipmentCardShellProps {
  title: string;
  children: React.ReactNode;
}

const ShipmentCardShell = ({ title, children }: ShipmentCardShellProps): JSX.Element => {
  return (
    <div className="card-shell">
      <h2>{title}</h2>
      <section>{children}</section>
    </div>
  );
};`,
  analog_example: `const Modal = ({ heading, children }: ModalProps): JSX.Element => {
  return (
    <div className="modal">
      <h2>{heading}</h2>
      <div className="modal-body">{children}</div>
    </div>
  );
};`,
  deepDiveLabel:
    "children renders with {children} — but what if you need to render it in two different places in the shell?",
  deepDive: {
    hook: "Your ShipmentCardShell renders children once — in the section. A designer asks for a new layout: a split card where the top half is the content and the bottom half is a footer with action buttons. Both halves need different content from the parent.\n\nYou try to use children twice: `{children}` in the top, `{children}` in the bottom. But children is one value — whatever is between the tags. You can't split it without knowing its internal structure.\n\nThis is where named slot patterns emerge — explicit props for specific content areas instead of a single children prop.",
    pain: "⚠️ **Lesson:** You render {children} in two places in the shell hoping to show it twice. It shows the same content twice — not split between the two areas. Why can't you split children — and what's the pattern when you need two distinct content areas?",
    mentalModel:
      "**Mental model:** children is a **single value** — not a collection you can split.\n- Everything between the opening and closing tags arrives as one ReactNode value.\n- If the parent passes one element, children is that element.\n- If the parent passes multiple elements, children is an array — but still one value, not individually addressable slots.\n- When you need two distinct content areas, use named props instead of children: `header: React.ReactNode` and `footer: React.ReactNode` alongside `children`. Each is a separate prop that the parent fills explicitly.\n- This is called the 'named slots' pattern — common in design system components like modals, dialogs, and split panels.",
    discover:
      "**Pattern — children vs named slots:**\n```tsx\n// ✅ single content area — children is perfect\ninterface CardShellProps {\n  title: string;\n  children: React.ReactNode;\n}\n\n// ✅ multiple content areas — named slots\ninterface SplitCardProps {\n  title: string;\n  children: React.ReactNode;  // main content area\n  footer: React.ReactNode;    // footer area\n}\n\n// Usage:\n<SplitCard title='NX-1042' footer={<button>Assign Driver</button>}>\n  <p>Hamburg → Rotterdam</p>\n  <p>Active</p>\n</SplitCard>\n\n// ❌ trying to render children in two places — shows same content twice\n<div>{children}</div>\n<footer>{children}</footer>\n```\n- children = single implicit slot, perfect for simple wrappers\n- named props = explicit slots for components with distinct content areas\n- React.ReactNode works for both — it's always the correct type for JSX content props",
    quickRules:
      "**Quick rules:**\n- ✅ `children` for a single content area — the implicit slot pattern\n- ✅ named props (`header`, `footer`, `sidebar`) for multiple distinct areas\n- ❌ rendering `{children}` twice hoping to split it — it renders the same content twice\n- ❌ `React.Children.map` for basic rendering — only needed for advanced children manipulation\n- all named JSX content props should be typed as `React.ReactNode`",
    watchOut:
      "👀 **Watch out:** `React.Children.count(children)` and `React.Children.map` exist for cases where you need to inspect or manipulate the children collection. These APIs are advanced and rarely needed — most design system components avoid them in favour of named slots. If you find yourself reaching for React.Children, first ask whether named props would be cleaner.",
    dryRun:
      "🔁 **Think:** A parent renders `<ShipmentCardShell title='NX-1'><p>Hamburg</p><p>Rotterdam</p></ShipmentCardShell>`. Inside the shell, `{children}` renders. What does children hold — two separate elements or one array? How many DOM nodes appear inside the section tag?",
    build:
      "**Learning focus:** Build a layout wrapper that accepts and renders children — understanding that children is a single ReactNode value holding everything between the tags, and that named props are the solution when multiple distinct content areas are needed.",
  },
},
{
  id: "step3",
  type: "question",
  phase: "Step 3 of 5",
  paal: "Make children optional on ShipmentCardShellProps so the shell renders correctly even with no content passed between its tags.",
  hint: "Add ? to children in the interface. Optional children means the shell can render just its title with an empty section — a valid empty state.",
  example_code: `interface PanelProps {
  heading: string;
  children?: React.ReactNode;
}`,
  think_prompt:
    "A shell that requires children forces every parent to put something between the tags. Is there a valid reason a shell would have no content? If so, children should be optional.",
  mc_options: [
    "Keep children required — a shell with no content is not useful",
    "Make children optional with ? — the shell renders correctly with an empty section",
    "Default children to null — null renders nothing and satisfies the type",
  ],
  mc_correct_option:
    "Make children optional with ? — the shell renders correctly with an empty section",
  mc_anchor:
    "An empty shell is a valid state — it can render a loading indicator, a skeleton, or simply the title while content loads asynchronously. Making children optional with ? means the parent can pass nothing and React renders nothing inside the section, which is correct behaviour. Defaulting to null also works but is unnecessary — ReactNode already includes null and undefined.",
  why_this_matters:
    "Layout shells in enterprise apps frequently render before their content arrives — an async data fetch, a permission check, a lazy-loaded component. Optional children means the shell can render immediately with its structure intact, ready to receive content once it arrives.",
  answer_keywords: ["children?", "React.ReactNode"],
  seed_code: `interface ShipmentCardShellProps {
  title: string;
  children: React.ReactNode;
}

const ShipmentCardShell = ({ title, children }: ShipmentCardShellProps): JSX.Element => {
  return (
    <div className="card-shell">
      <h2>{title}</h2>
      <section>{children}</section>
    </div>
  );
};`,
  starter_code: `// make children optional in the interface
interface ShipmentCardShellProps {
  title: string;
  children: React.ReactNode;
}

const ShipmentCardShell = ({ title, children }: ShipmentCardShellProps): JSX.Element => {
  return (
    <div className="card-shell">
      <h2>{title}</h2>
      <section>{children}</section>
    </div>
  );
};`,
  feedback_correct:
    "Exactly — children? means the parent can render <ShipmentCardShell title='NX-1042' /> with no closing tag content and the shell renders correctly with an empty section.",
  feedback_partial:
    "Close — add ? after children in the interface definition. The component body doesn't need to change — {children} renders undefined as nothing, which is the correct empty state.",
  feedback_wrong:
    "Change `children: React.ReactNode` to `children?: React.ReactNode` in the interface. The component renders {children} — when children is undefined, React renders nothing in the section.",
  expected: `interface ShipmentCardShellProps {
  title: string;
  children?: React.ReactNode;
}

const ShipmentCardShell = ({ title, children }: ShipmentCardShellProps): JSX.Element => {
  return (
    <div className="card-shell">
      <h2>{title}</h2>
      <section>{children}</section>
    </div>
  );
};`,
  analog_example: `interface ModalProps {
  heading: string;
  children?: React.ReactNode;
}`,
  deepDiveLabel:
    "children is ReactNode and ReactNode includes undefined — so is children? different from children: ReactNode?",
  deepDive: {
    hook: "ReactNode includes undefined — so `children: React.ReactNode` technically already allows children to be undefined as a value. But TypeScript still errors when you omit children from the props entirely. How can the value be allowed but the key be required?\n\nThis is the same ? vs `T | undefined` distinction from Lesson 6 — but it shows up in a more confusing way when the type already includes undefined.",
    pain: "⚠️ **Lesson:** You type `children: React.ReactNode` — and ReactNode includes undefined. But a parent renders `<ShipmentCardShell title='NX-1' />` without a closing tag and TypeScript errors about missing children. If ReactNode includes undefined, why is the key still required?",
    mentalModel:
      "**Mental model:** The type of a field and the presence of the key are independent concerns.\n- `children: React.ReactNode` — the key `children` must be present on the props object. The value can be any ReactNode, including undefined. But the key itself must exist.\n- `children?: React.ReactNode` — the key `children` may be absent entirely from the props object. When the parent writes `<Shell title='NX-1' />` with no closing tag, React doesn't pass a children key at all — not even undefined.\n- The ? is what allows the key to be absent. The type (ReactNode) controls what value is allowed. They're separate.\n- This is why even though ReactNode includes undefined, you still need ? to make children optional in the practical sense of 'the parent doesn't have to provide it'.",
    discover:
      "**Pattern — children? vs children: ReactNode:**\n```tsx\n// children required — key must be present (even if undefined)\ninterface ShellProps { children: React.ReactNode; }\n<ShipmentCardShell title='NX-1' />                    // ❌ missing children key\n<ShipmentCardShell title='NX-1' children={undefined} /> // ✅ key present, value undefined\n\n// children optional — key may be absent entirely\ninterface ShellProps { children?: React.ReactNode; }\n<ShipmentCardShell title='NX-1' />                    // ✅ no children key — fine\n<ShipmentCardShell title='NX-1'><p>hi</p></ShipmentCardShell> // ✅ children present\n```\n- `?` = key may be absent — use for optional children\n- even though ReactNode includes undefined, you still need ? for the key to be optional\n- this is the same distinction as `carrier?: string` vs `carrier: string | undefined` from Lesson 6",
    quickRules:
      "**Quick rules:**\n- ✅ `children?: React.ReactNode` — correct for optional children\n- ✅ `children: React.ReactNode` — correct when children is always required\n- ❌ relying on ReactNode including undefined to make children 'optional' — the key is still required without ?\n- when in doubt: if a parent can render the component without putting anything between the tags, use ?\n- inside the component, both produce the same rendering behaviour for undefined",
    watchOut:
      "👀 **Watch out:** Some older React TypeScript patterns typed children as `React.ReactNode | undefined` instead of using ?. You may see this in legacy codebases. It has the same value type but the key is still required — the parent must explicitly pass `children={undefined}`. Prefer ? for modern code.",
    dryRun:
      "🔁 **Think:** children is `children?: React.ReactNode`. A parent renders `<ShipmentCardShell title='NX-1' />` — no closing tag. What value does children have inside the component — undefined or nothing at all? React renders `{children}` in the section — what appears in the DOM?",
    build:
      "**Learning focus:** Make children optional with ? — understanding that even though ReactNode includes undefined as a value, the ? is still needed to allow the key itself to be absent from the props object.",
  },
},
{
  id: "step4",
  type: "question",
  phase: "Step 4 of 5",
  paal: "Use ShipmentCardShell to wrap the ShipmentCard content from Lesson 1 — pass the shipment ID as the title and put the status div as the children.",
  hint: "Whatever you put between <ShipmentCardShell> and </ShipmentCardShell> becomes the children prop. The shell provides the h2 heading; you provide the content.",
  example_code: `<Panel heading="Invoice INV-001">
  <p>Amount: $1,240</p>
  <p>Status: Paid</p>
</Panel>`,
  think_prompt:
    "ShipmentCardShell renders its title in an h2 and whatever is between its tags in a section. How do you compose the two components so the shell provides the wrapper and the inner div provides the content?",
  mc_options: [
    "<ShipmentCardShell title={shipmentId} children={<div>content</div>} />",
    "<ShipmentCardShell title={shipmentId}><div className={`card--${status}`}><p>{destination}</p><p>{status}</p></div></ShipmentCardShell>",
    "<ShipmentCardShell><div className={`card--${status}`}><p>{destination}</p></div></ShipmentCardShell>",
  ],
  mc_correct_option:
    "<ShipmentCardShell title={shipmentId}><div className={`card--${status}`}><p>{destination}</p><p>{status}</p></div></ShipmentCardShell>",
  mc_anchor:
    "JSX placed between the opening and closing tags becomes children automatically — no explicit children prop needed. The first option passes children as an attribute which works but is unconventional. The third option omits title entirely which would error because title is required.",
  why_this_matters:
    "This is component composition in action — two components combined to produce a result neither could produce alone. The shell handles structure, the inner content handles data. This is the pattern behind every design system in enterprise development.",
  answer_keywords: [
    "ShipmentCardShell", "title={shipmentId}", "card--", "destination", "status",
  ],
  seed_code: `interface ShipmentCardShellProps {
  title: string;
  children?: React.ReactNode;
}

const ShipmentCardShell = ({ title, children }: ShipmentCardShellProps): JSX.Element => {
  return (
    <div className="card-shell">
      <h2>{title}</h2>
      <section>{children}</section>
    </div>
  );
};

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
}`,
  starter_code: `interface ShipmentCardShellProps {
  title: string;
  children?: React.ReactNode;
}

const ShipmentCardShell = ({ title, children }: ShipmentCardShellProps): JSX.Element => {
  return (
    <div className="card-shell">
      <h2>{title}</h2>
      <section>{children}</section>
    </div>
  );
};

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
}

const ShipmentCard = ({ shipmentId, destination, status }: ShipmentCardProps): JSX.Element => {
  // wrap the content in ShipmentCardShell
  // pass shipmentId as title
  // put the status div as children
  return (
    <div className={\`card--\${status}\`}>
      <p>{destination}</p>
      <p>{status}</p>
    </div>
  );
};`,
  feedback_correct:
    "Exactly — ShipmentCardShell wraps the status div, title comes from shipmentId, and the inner div becomes children automatically through the tag nesting. Two components, one composed result.",
  feedback_partial:
    "Close — check that title is set to {shipmentId} on the shell, and that the status div is between the shell's opening and closing tags, not passed as an attribute.",
  feedback_wrong:
    "Wrap the return in ShipmentCardShell: `<ShipmentCardShell title={shipmentId}><div className={\\`card--${status}\\`}>...</div></ShipmentCardShell>` — whatever is between the tags becomes children.",
  expected: `interface ShipmentCardShellProps {
  title: string;
  children?: React.ReactNode;
}

const ShipmentCardShell = ({ title, children }: ShipmentCardShellProps): JSX.Element => {
  return (
    <div className="card-shell">
      <h2>{title}</h2>
      <section>{children}</section>
    </div>
  );
};

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
}

const ShipmentCard = ({ shipmentId, destination, status }: ShipmentCardProps): JSX.Element => {
  return (
    <ShipmentCardShell title={shipmentId}>
      <div className={\`card--\${status}\`}>
        <p>{destination}</p>
        <p>{status}</p>
      </div>
    </ShipmentCardShell>
  );
};`,
  analog_example: `const InvoiceCard = ({ invoiceId, amount, currency }: InvoiceCardProps): JSX.Element => {
  return (
    <Panel heading={invoiceId}>
      <p>{amount} {currency}</p>
    </Panel>
  );
};`,
  deepDiveLabel:
    "Composition with children is clean — but what's the difference between this and just building everything into one component?",
  deepDive: {
    hook: "Your tech lead reviews the code and asks: 'why two components? You could just put the h2 and the status div in ShipmentCard directly.' They're right that it would work. But ShipmentCardShell is now being reused — InvoiceCard uses it, DriverCard uses it, WarehouseCard uses it. All four cards have the same heading style, the same card-shell CSS, the same structure. Change the shell once and all four update.\n\nIf you'd built everything into ShipmentCard, that heading style lives in four places. Change it in one, the others drift.",
    pain: "⚠️ **Lesson:** You could build the h2 heading directly into ShipmentCard instead of extracting a shell. Both produce the same DOM. What does the shell component give you that a monolithic component doesn't?",
    mentalModel:
      "**Mental model:** Think of layout components as **moulds and fills**.\n- The mould (ShipmentCardShell) gives every card its shape — the outer div, the heading style, the section padding. It never changes.\n- The fill (children) is what each card puts inside the mould — shipment data, invoice data, driver data. It's different every time.\n- By separating them, you define the mould once and reuse it for every fill. Change the mould and all fills update automatically. Change a fill and the mould is untouched.\n- A monolithic component combines mould and fill — reuse requires copying both, and changes to the mould require finding every copy.",
    discover:
      "**Pattern — layout vs content separation:**\n```tsx\n// ✅ layout component — defines structure, accepts any content\nconst ShipmentCardShell = ({ title, children }: ShipmentCardShellProps): JSX.Element => (\n  <div className=\"card-shell\"><h2>{title}</h2><section>{children}</section></div>\n);\n\n// ✅ content components — provide data, delegate structure to the shell\nconst ShipmentCard = ({ shipmentId, status }: ShipmentCardProps): JSX.Element => (\n  <ShipmentCardShell title={shipmentId}><p>{status}</p></ShipmentCardShell>\n);\n\nconst InvoiceCard = ({ invoiceId, amount }: InvoiceCardProps): JSX.Element => (\n  <ShipmentCardShell title={invoiceId}><p>{amount}</p></ShipmentCardShell>\n);\n\n// ❌ monolithic — structure duplicated in every card type\nconst ShipmentCard = (): JSX.Element => (\n  <div className=\"card-shell\"><h2>{shipmentId}</h2><section><p>{status}</p></section></div>\n);\nconst InvoiceCard = (): JSX.Element => (\n  <div className=\"card-shell\"><h2>{invoiceId}</h2><section><p>{amount}</p></section></div>\n);\n```\n- layout component: structure once, reused everywhere via children\n- content component: data-focused, delegates structure to layout\n- change the layout once, all content components update",
    quickRules:
      "**Quick rules:**\n- ✅ extract layout into a shell component when the same structure wraps different content\n- ✅ use children for the content that varies, props for the structure that's consistent\n- ❌ duplicating layout markup across multiple components — creates maintenance drift\n- ❌ too many shell components — one per distinct layout pattern, not one per card type\n- the signal to extract a shell: you find yourself writing the same wrapper HTML in three or more components",
    watchOut:
      "👀 **Watch out:** Over-extracting shells creates a component tree that's hard to read. If ShipmentCardShell is only used in one place, it's just indirection — not composition. Extract shells when reuse is real, not anticipated.",
    dryRun:
      "🔁 **Think:** ShipmentCard renders inside ShipmentCardShell. The DOM output has: `<div class='card-shell'><h2>NX-1042</h2><section><div class='card--active'>...</div></section></div>`. Which part came from ShipmentCardShell — and which part came from ShipmentCard? If the designer changes the card-shell CSS class name to card-container, how many files need to change?",
    build:
      "**Learning focus:** Use a layout shell component by placing content between its tags as children — understanding that component composition separates structure from content, making the structure reusable and the content replaceable.",
  },
},
{
  id: "step5",
  type: "question",
  phase: "Step 5 of 5",
  paal: "Add a footer prop to ShipmentCardShellProps — typed as React.ReactNode, optional — and render it below the section when present.",
  hint: "footer is a named slot — the same type as children but a separate prop. Use && to render it only when the parent passes it.",
  example_code: `interface PanelProps {
  heading: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

const Panel = ({ heading, children, footer }: PanelProps): JSX.Element => {
  return (
    <div>
      <h2>{heading}</h2>
      <section>{children}</section>
      {footer && <footer>{footer}</footer>}
    </div>
  );
};`,
  think_prompt:
    "footer is a distinct content area from children — some parents will pass action buttons there, others won't need it. How do you add it to the interface and render it only when provided?",
  mc_options: [
    "Add footer as a required React.ReactNode field and always render a footer tag",
    "Add footer as an optional React.ReactNode field and render it with && only when present",
    "Render footer inside children by having the parent include it",
  ],
  mc_correct_option:
    "Add footer as an optional React.ReactNode field and render it with && only when present",
  mc_anchor:
    "footer is a named slot — optional because not every card needs action buttons. && renders the footer tag only when the parent provides content. Making it required forces every parent to pass something even when there's nothing useful to put there. Embedding footer inside children loses the layout separation — the shell no longer controls where footer content appears.",
  why_this_matters:
    "Named slots — footer, header, sidebar — are how complex layout components define multiple distinct content areas while keeping each independently optional. This pattern powers every modal, dialog, and split-panel component in enterprise design systems.",
  answer_keywords: ["footer?", "React.ReactNode", "footer &&", "<footer>"],
  seed_code: `interface ShipmentCardShellProps {
  title: string;
  children?: React.ReactNode;
}

const ShipmentCardShell = ({ title, children }: ShipmentCardShellProps): JSX.Element => {
  return (
    <div className="card-shell">
      <h2>{title}</h2>
      <section>{children}</section>
    </div>
  );
};`,
  starter_code: `// add footer?: React.ReactNode to the interface
// render it conditionally below the section
interface ShipmentCardShellProps {
  title: string;
  children?: React.ReactNode;
}

const ShipmentCardShell = ({ title, children }: ShipmentCardShellProps): JSX.Element => {
  return (
    <div className="card-shell">
      <h2>{title}</h2>
      <section>{children}</section>
    </div>
  );
};`,
  feedback_correct:
    "Exactly — footer is a named optional slot typed as ReactNode and rendered conditionally. Parents that need action buttons pass footer; parents that don't omit it and the footer tag never appears in the DOM.",
  feedback_partial:
    "Close — check two things: is footer optional with ? in the interface, and are you using && to render the footer tag only when footer has a value?",
  feedback_wrong:
    "Add `footer?: React.ReactNode` to the interface. Destructure footer alongside title and children. Then add `{footer && <footer>{footer}</footer>}` below the section in the JSX.",
  expected: `interface ShipmentCardShellProps {
  title: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

const ShipmentCardShell = ({ title, children, footer }: ShipmentCardShellProps): JSX.Element => {
  return (
    <div className="card-shell">
      <h2>{title}</h2>
      <section>{children}</section>
      {footer && <footer>{footer}</footer>}
    </div>
  );
};`,
  analog_example: `interface ModalProps {
  heading: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

const Modal = ({ heading, children, footer }: ModalProps): JSX.Element => {
  return (
    <div className="modal">
      <h2>{heading}</h2>
      <div className="modal-body">{children}</div>
      {footer && <div className="modal-footer">{footer}</div>}
    </div>
  );
};`,
  deepDiveLabel:
    "footer is ReactNode typed as a prop — how is that different from passing a render function instead?",
  deepDive: {
    hook: "You build the footer named slot. A teammate shows you an alternative they've seen in some component libraries: instead of `footer?: React.ReactNode`, they type it as `renderFooter?: () => React.ReactNode`. The parent passes a function: `renderFooter={() => <button>Assign</button>}`. The shell calls `{renderFooter?.()}` to render it.\n\nBoth produce the same DOM output. But one passes JSX directly; the other passes a function that returns JSX. Your teammate asks when you'd choose the function version over the ReactNode version.",
    pain: "⚠️ **Lesson:** `footer?: React.ReactNode` and `renderFooter?: () => React.ReactNode` both render a footer. When would you choose the function version — and what does it give you that passing JSX directly doesn't?",
    mentalModel:
      "**Mental model:** ReactNode is **evaluated content** — it's already JSX, already resolved.\n- When the parent writes `footer={<button>Assign</button>}`, React evaluates `<button>Assign</button>` immediately — before the shell even renders.\n- `() => React.ReactNode` is **deferred content** — a function the shell calls when it's ready. The shell controls when evaluation happens.\n- Deferred evaluation is useful when: the shell needs to pass data into the content (render props), or when the content is expensive and should only render conditionally.\n- For simple slots like footer: ReactNode is simpler and more readable. Use render functions when the shell needs to inject data into the slot — that's the render props pattern, covered in a later lesson.",
    discover:
      "**Pattern — ReactNode slot vs render function:**\n```tsx\n// ✅ ReactNode slot — parent provides ready-to-render JSX\ninterface ShellProps {\n  footer?: React.ReactNode;\n}\n<ShipmentCardShell footer={<button>Assign Driver</button>}>\n\n// ✅ render function — shell controls when/how content renders, can pass data\ninterface ShellProps {\n  renderFooter?: (shipmentId: string) => React.ReactNode;\n}\n<ShipmentCardShell renderFooter={(id) => <button onClick={() => assign(id)}>Assign</button>}>\n\n// choose ReactNode when: content is self-contained, shell has no data to pass\n// choose render function when: shell needs to inject data into the content\n```\n- ReactNode slot = simple, readable, correct for most cases\n- render function = deferred evaluation, used when the shell provides data to the content\n- the render props pattern (a later lesson) is built on this distinction",
    quickRules:
      "**Quick rules:**\n- ✅ `footer?: React.ReactNode` for static named slots — the parent provides the content\n- ✅ `renderFooter?: (data: T) => React.ReactNode` when the shell needs to pass data into the slot\n- ❌ render functions for simple slots with no data injection — ReactNode is simpler\n- both produce the same DOM — the difference is who controls evaluation and data flow\n- this distinction is the foundation of the render props pattern in Lesson 74",
    watchOut:
      "👀 **Watch out:** Render functions called conditionally can violate React's rules of hooks if the function itself contains hooks. Named slot props (ReactNode) are safe — they're just values. Render functions are functions — they follow the same rules as any function called inside a component.",
    dryRun:
      "🔁 **Think:** footer is `footer?: React.ReactNode`. A parent passes `footer={isManager && <button>Reassign</button>}`. When isManager is true, what does footer hold? When isManager is false, what does footer hold — and what does `{footer && <footer>{footer}</footer>}` render?",
    build:
      "**Learning focus:** Add a named optional slot to a layout component using React.ReactNode — understanding that named slots are just props typed as ReactNode, and that they give the parent control over distinct content areas while keeping each independently optional.",
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
  lessonNum: 11,
  title: "useState — Objects + Spread",
  shortName: "HOOKS — OBJECT STATE",
});
