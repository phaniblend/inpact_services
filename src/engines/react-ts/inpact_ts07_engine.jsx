import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
{
  id: "intro",
  type: "reveal",
  phase: "Lesson",
  content: {
    tag: "LESSON #7 (TypeScript)",
    title: "Props + Interface",
    body: "Every component you have built so far has stood alone — it renders its own hardcoded data. Real components are different. They receive data from a parent and render it faithfully, every time, for any data that fits the contract. That contract is a TypeScript interface on the props. In this lesson you define that interface, receive props inside the component, render required values, provide defaults for optional ones, and wire an optional click handler — giving you a reusable building block you can drop anywhere in an enterprise web app and trust it will behave.",
    usecase:
      "Picture a status badge that appears on every row of a data table — showing whether a shipment is Active, Delayed, or Delivered. The badge is the same component every time, but each row passes different data into it. Some rows need a screen reader label, some need the badge to be clickable, some need neither. Props are what make one component serve all those cases — and a TypeScript interface is what guarantees each case gets exactly what it needs, nothing more, nothing less.",
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
      lesson: 2,
      label: "Inventory row — readonly fields, unions, nested types",
      reason: "Complete Lesson 2 (Inventory row — readonly fields, unions, nested types) first — it is a prerequisite on the React-TS track for this lesson.",
    },
  ],
},
{
  id: "objectives",
  type: "objectives",
  phase: "Objectives",
  items: [
    "Define a TypeScript interface that describes a component's props with required and optional fields",
    "Apply that interface as the type annotation on the component's destructured parameter",
    "Render a required prop value directly inside JSX",
    "Conditionally render an optional prop using the && operator",
    "Wire an optional onClick handler prop to a JSX element",
    "Provide a default value for an optional prop using the destructuring default syntax",
  ],
},
{
  id: "step1",
  type: "question",
  phase: "Step 1 of 6",
  paal: "Define a TypeScript interface called ShipmentStatusBadgeProps with three fields: status as a required string, label as an optional string, and onClick as an optional function that takes no arguments and returns nothing.",
  hint: "Optional fields use ?. A function that takes no arguments and returns nothing has a specific TypeScript signature — not just the word Function.",
  example_code: `interface TooltipProps {
  text: string;
  maxWidth?: number;
  onDismiss?: () => void;
}`,
  think_prompt:
    "The badge always needs a status to display — but not every parent needs a label or a click handler. How do you tell TypeScript which fields are mandatory and which are truly optional?",
  mc_options: [
    "interface ShipmentStatusBadgeProps { status: string; label?: string; onClick?: () => void; }",
    "interface ShipmentStatusBadgeProps { status: string; label: string | undefined; onClick: Function; }",
    "interface ShipmentStatusBadgeProps { status?: string; label?: string; onClick?: () => void; }",
  ],
  mc_correct_option:
    "interface ShipmentStatusBadgeProps { status: string; label?: string; onClick?: () => void; }",
  mc_anchor:
    "status has no ? so TypeScript forces every parent to supply it — the badge cannot render without a status. label and onClick use ? which marks them as optional. onClick uses () => void rather than the loose Function type — it tells TypeScript exactly that this function takes no arguments and that whatever it returns will be ignored by the component.",
  why_this_matters:
    "The props interface is the contract between this component and every parent that uses it. Required fields guarantee the component always has what it needs to render. Optional fields give parents flexibility without breaking the contract. Precise function types like () => void catch mismatches at compile time instead of at runtime.",
  answer_keywords: [
    "interface", "ShipmentStatusBadgeProps",
    "status: string", "label?: string", "onClick?: () => void",
  ],
  seed_code: ``,
  starter_code: `// define ShipmentStatusBadgeProps interface here`,
  feedback_correct:
    "Exactly — status is required so every parent is forced to supply it, label and onClick are optional so parents that do not need them stay clean, and () => void is precise enough that TypeScript can catch a mismatched handler at the call site.",
  feedback_partial:
    "Close — check your optional markers carefully. Is status definitely required? Are label and onClick definitely optional? Also check the onClick type — () => void is more precise than Function.",
  feedback_wrong:
    "The pattern: `interface ShipmentStatusBadgeProps { status: string; label?: string; onClick?: () => void; }` — required fields have no ?, optional fields use ?, and function types spell out their signature precisely.",
  expected: `interface ShipmentStatusBadgeProps {
  status: string;
  label?: string;
  onClick?: () => void;
}`,
  analog_example: `interface AvatarProps {
  src: string;
  alt: string;
  size?: number;
  onError?: () => void;
}`,
  deepDiveLabel:
    "Why is () => void safer than Function — and what does void actually promise the caller?",
  deepDive: {
    hook: "You are three months into a project. A teammate builds a notification bell component and types its onDismiss prop as Function. Six weeks later another teammate passes an async handler that returns a Promise. TypeScript says nothing — Function accepts anything callable. The component calls onDismiss, gets a Promise back, and tries to use the return value expecting undefined. The bug surfaces in production as a silent failure on every notification dismiss. Nobody connects it back to the prop type. The fix takes one character — changing Function to () => void — but finding it takes two days.\n\nThis is not a hypothetical. It is the exact class of bug that loose function types produce in real enterprise apps, and it is entirely preventable at the interface definition.",
    pain: "⚠️ **Lesson:** You type onClick as Function. A parent passes a function that takes two arguments and returns a string. TypeScript raises no error. The component calls onClick() with no arguments and ignores the return value. What did TypeScript miss — and what would () => void have caught?",
    mentalModel:
      "**Mental model: The job description**\n\nThink of a function type as a job description for whoever fills the role.\n- `Function` says 'must be callable'. That is technically true of every function ever written. It tells the caller nothing about what arguments to pass or what the component will do with the return value.\n- `() => void` says three things precisely: call this with no arguments, the component will not look at what you return, and anything you pass must match that shape.\n- void does not mean the function must return undefined. It means the component promises to ignore the return value. A parent can pass a function that returns a boolean, a string, a Promise — and the contract still holds, because the badge never reads the result.\n- This makes () => void flexible for parents while being safe for the component. It is the most common and most correct type for event handler props in React.",
    discover:
      "**Pattern — precise function types in props:**\n```tsx\n// ✅ no arguments, return value ignored\ninterface BadgeProps {\n  onClick?: () => void;\n}\n\n// ✅ receives a value, return value ignored\ninterface InputProps {\n  onChange?: (value: string) => void;\n}\n\n// ✅ receives an event, return value ignored\ninterface FormProps {\n  onSubmit?: (event: React.FormEvent) => void;\n}\n\n// ❌ accepts anything callable — no type safety\ninterface LooseProps {\n  onClick?: Function;\n  onChange?: Function;\n}\n```\n- always spell out the argument list and count in callback props\n- void as a return type means the caller ignores the return value — not that the function must return undefined\n- the more precise the function type, the earlier TypeScript catches a mismatch",
    quickRules:
      "**Quick rules:**\n- ✅ `() => void` for handlers called with no arguments\n- ✅ `(value: string) => void` when the handler receives a specific argument\n- ✅ mark fields optional with ? when the component can render without them\n- ✅ keep required fields required — do not default everything to optional out of convenience\n- ❌ never use Function as a prop type — it provides no type safety\n- ❌ never make a field optional if the component cannot meaningfully render without it",
    watchOut:
      "👀 **Watch out:** It is tempting to make every prop optional to be flexible. Resist this. Optional props shift the enforcement burden from the interface — where TypeScript catches it at compile time — to the component body — where you have to write defensive checks at runtime. Every field that is truly required should be required in the interface. Let TypeScript do the work.",
    dryRun:
      "🔁 **Think:** A parent renders `<ShipmentStatusBadge />` with no props at all. Walk through what TypeScript does — is status provided? What error appears and where? Is label provided? Does TypeScript complain? Is onClick provided? Does TypeScript complain? Now the same parent passes `onClick={() => true}` — a function that returns a boolean. Does TypeScript error with Function as the type? Does it error with () => void?",
    build:
      "**Learning focus:** Define a props interface where required fields are enforced by TypeScript and optional fields and function types are precise enough that mismatches are caught at the call site, not at runtime.",
  },
},
{
  id: "step2",
  type: "question",
  phase: "Step 2 of 6",
  paal: "Define the ShipmentStatusBadge component shell — an arrow function that accepts no props yet and returns an empty fragment.",
  hint: "Arrow function, capital first letter, explicit JSX.Element return type, empty fragment as placeholder.",
  example_code: `const Dashboard = (): JSX.Element => {
  return <></>;
};`,
  think_prompt:
    "You have the interface — but the component doesn't exist yet. What is the minimum valid component definition TypeScript will accept before you wire any props?",
  mc_options: [
    "const shipmentStatusBadge = (): JSX.Element => { return <></>; }",
    "const ShipmentStatusBadge = (): JSX.Element => { return <></>; }",
    "const ShipmentStatusBadge = (): void => { return <></>; }",
  ],
  mc_correct_option:
    "const ShipmentStatusBadge = (): JSX.Element => { return <></>; }",
  mc_anchor:
    "Capital first letter tells React this is a component — lowercase makes React treat it as an unknown HTML tag and render nothing silently. JSX.Element is the return type contract — void would tell TypeScript this function returns nothing, which contradicts returning JSX. The empty fragment is the correct placeholder — it satisfies the JSX.Element contract without adding a real DOM node.",
  why_this_matters:
    "The component shell is the foundation every step builds on. Getting the name casing, return type, and placeholder right before adding any logic means TypeScript is checking your work from the very first line — not after you have written fifty lines and introduced a subtle error.",
  answer_keywords: [
    "const", "ShipmentStatusBadge", "JSX.Element", "=>", "return", "<>", "</>",
  ],
  seed_code: `interface ShipmentStatusBadgeProps {
  status: string;
  label?: string;
  onClick?: () => void;
}`,
  starter_code: `interface ShipmentStatusBadgeProps {
  status: string;
  label?: string;
  onClick?: () => void;
}

// define the component shell here`,
  feedback_correct:
    "Exactly — capital name, arrow function, JSX.Element return type, empty fragment. This shell is the foundation every real component in an enterprise app starts from.",
  feedback_partial:
    "Close — check three things: capital first letter on the name, explicit : JSX.Element return type, and an empty fragment <></> as the placeholder return.",
  feedback_wrong:
    "The pattern: `const ShipmentStatusBadge = (): JSX.Element => { return <></>; }` — capital name, arrow function, JSX.Element return type, empty fragment placeholder.",
  expected: `interface ShipmentStatusBadgeProps {
  status: string;
  label?: string;
  onClick?: () => void;
}

const ShipmentStatusBadge = (): JSX.Element => {
  return <></>;
};`,
  analog_example: `interface AvatarProps {
  src: string;
  alt: string;
  size?: number;
  onError?: () => void;
}

const Avatar = (): JSX.Element => {
  return <></>;
};`,
  deepDiveLabel:
    "The component works with a lowercase name — so why does capitalisation actually matter?",
  deepDive: {
    hook: "You define `const shipmentStatusBadge = (): JSX.Element => { return <span>Active</span>; }` and drop `<shipmentStatusBadge />` into your data table. Nothing renders. No error. No red screen. No console warning. You add a console.log inside the component — it never fires. The component exists, the code is valid JavaScript, and React is completely ignoring it.\n\nYou spend twenty minutes checking props, checking imports, checking the file path. Everything looks correct. Then a senior engineer glances over and points at the first letter. One character. The entire component was invisible to React because of a single lowercase letter — and React said nothing about it.",
    pain: "⚠️ **Lesson:** You write `const shipmentStatusBadge` with a lowercase s. React renders nothing and throws no error. Why does a single lowercase letter cause React to silently skip your entire component?",
    mentalModel:
      "**Mental model: React's first-letter signal**\n\nReact uses the first letter of a JSX tag as a signal to decide what it is looking at.\n- Lowercase first letter → React assumes it is a plain HTML element: div, span, p. It tries to create a DOM node with that name. shipmentStatusBadge is not a valid HTML element — React creates an unknown node, renders nothing meaningful, and moves on silently.\n- Uppercase first letter → React knows it is a component. It calls your function, takes the JSX it returns, and puts that in the DOM.\n- This is not a style guide suggestion. It is how React's JSX parser works at a mechanical level. Lowercase means HTML. Uppercase means component. No exceptions.",
    discover:
      "**Pattern — component shell:**\n```tsx\n// ✅ correct — uppercase, arrow function, explicit return type\nconst ShipmentStatusBadge = (): JSX.Element => {\n  return <></>;\n};\n\n// ❌ lowercase — React treats it as an HTML tag, renders nothing silently\nconst shipmentStatusBadge = (): JSX.Element => {\n  return <></>;\n};\n\n// ❌ void return type — contradicts returning JSX\nconst ShipmentStatusBadge = (): void => {\n  return <></>;\n};\n\n// ❌ React.FC — retired pattern, never use it\nconst ShipmentStatusBadge: React.FC = () => {\n  return <></>;\n};\n```\n- capital letter = component signal to React's JSX parser\n- JSX.Element = the TypeScript contract that this function returns valid JSX\n- empty fragment = valid placeholder that adds no DOM node",
    quickRules:
      "**Quick rules:**\n- ✅ `const ShipmentStatusBadge = (): JSX.Element =>` — correct, modern standard\n- ❌ `const shipmentStatusBadge` — lowercase, React silently treats as HTML tag\n- ❌ `(): void` — wrong return type, contradicts returning JSX\n- ❌ `React.FC` — retired pattern\n- empty fragment `<></>` is the correct shell placeholder",
    watchOut:
      "👀 **Watch out:** Lowercase component bugs are silent — React won't throw, TypeScript won't error, the linter may not catch it. The only symptom is a blank space in the UI. If a component ever renders nothing and you can't figure out why, check the capitalisation first.",
    dryRun:
      "🔁 **Think:** You have `const ShipmentStatusBadge = (): JSX.Element => { return <span>Active</span>; }` used as `<ShipmentStatusBadge />`. A teammate renames the definition to `const shipmentstatusbadge` but leaves the usage as `<ShipmentStatusBadge />`. What happens — error, blank render, or does it still work?",
    build:
      "**Learning focus:** Define the component shell with the correct capitalisation, return type, and placeholder — so TypeScript is enforcing the contract from the very first line.",
  },
},
{
  id: "step3",
  type: "question",
  phase: "Step 3 of 6",
  paal: "Update ShipmentStatusBadge to accept and destructure ShipmentStatusBadgeProps, then render status inside a span.",
  hint: "Replace the empty parameter list with a destructured props object typed as ShipmentStatusBadgeProps. Replace the empty fragment with a span containing {status}.",
  example_code: `const Avatar = ({ src, alt }: AvatarProps): JSX.Element => {
  return <img src={src} alt={alt} />;
};`,
  think_prompt:
    "The interface is defined and the shell exists — but they're not connected yet. How do you wire ShipmentStatusBadgeProps into the component so TypeScript enforces the contract on every caller?",
  mc_options: [
    "const ShipmentStatusBadge = (ShipmentStatusBadgeProps): JSX.Element => { return <span></span>; }",
    "const ShipmentStatusBadge = ({ status, label, onClick }: ShipmentStatusBadgeProps): JSX.Element => { return <span>{status}</span>; }",
    "const ShipmentStatusBadge = (props): JSX.Element => { return <span>{props.status}</span>; }",
  ],
  mc_correct_option:
    "const ShipmentStatusBadge = ({ status, label, onClick }: ShipmentStatusBadgeProps): JSX.Element => { return <span>{status}</span>; }",
  mc_anchor:
    "Destructuring in the parameter gives you status, label, and onClick as direct variables — no props.x needed. The interface annotation after the destructure is TypeScript's enforcement point. Passing the interface name as the parameter without curly braces passes the interface itself as a value, not a type — it would error. The untyped props option loses all type safety.",
  why_this_matters:
    "Wiring the interface to the component is the step that activates TypeScript's enforcement. From this point, every parent that renders ShipmentStatusBadge must supply status — TypeScript errors immediately if they don't. This is the contract in action.",
  answer_keywords: [
    "ShipmentStatusBadgeProps", "{", "status", "label", "onClick", "}",
    "<span>", "{status}",
  ],
  seed_code: `interface ShipmentStatusBadgeProps {
  status: string;
  label?: string;
  onClick?: () => void;
}

const ShipmentStatusBadge = (): JSX.Element => {
  return <></>;
};`,
  starter_code: `interface ShipmentStatusBadgeProps {
  status: string;
  label?: string;
  onClick?: () => void;
}

// update the component to accept and destructure ShipmentStatusBadgeProps
// render status inside a span
const ShipmentStatusBadge = (): JSX.Element => {
  return <></>;
};`,
  feedback_correct:
    "Exactly — the interface is now wired to the component. TypeScript will enforce that every parent supplies status, and label and onClick are available but not required.",
  feedback_partial:
    "Close — make sure you're destructuring `{ status, label, onClick }` inside the parameter parens and annotating with `: ShipmentStatusBadgeProps`. And make sure status is rendered with `{status}` inside the span, not as plain text.",
  feedback_wrong:
    "The pattern: `const ShipmentStatusBadge = ({ status, label, onClick }: ShipmentStatusBadgeProps): JSX.Element => { return <span>{status}</span>; }` — destructure inside the parens, annotate with the interface.",
  expected: `interface ShipmentStatusBadgeProps {
  status: string;
  label?: string;
  onClick?: () => void;
}

const ShipmentStatusBadge = ({ status, label, onClick }: ShipmentStatusBadgeProps): JSX.Element => {
  return <span>{status}</span>;
};`,
  analog_example: `const Avatar = ({ src, alt, size, onError }: AvatarProps): JSX.Element => {
  return <img src={src} alt={alt} />;
};`,
  deepDiveLabel:
    "status is typed as string — but ShipmentCard used a union type. Why isn't this badge using 'active' | 'delayed' | 'delivered'?",
  deepDive: {
    hook: "In Lesson 1 you typed status as `'active' | 'delayed' | 'delivered'` — a locked union that catches typos at compile time. Now this badge types status as plain `string`. A teammate notices and asks if that's a mistake.\n\nIt's not — but it's a deliberate design decision that's worth understanding. The badge doesn't care what the status value is. It renders whatever string it receives. The validation of which statuses are valid belongs at the data layer — in the ShipmentRecord interface — not in every UI component that renders the value. The badge is a display component, not a domain component.",
    pain: "⚠️ **Lesson:** You consider typing status as `'active' | 'delayed' | 'delivered'` on ShipmentStatusBadgeProps. But then a new status value 'pending' is added to the domain. You'd have to update the badge's interface too — even though the badge doesn't care about the distinction. Why is `string` the right type here?",
    mentalModel:
      "**Mental model: Domain types vs display types**\n\nThink of your types as living at different layers of the app.\n- Domain layer (ShipmentRecord, ShipmentStatus): knows all valid values, enforces business rules. This is where `'active' | 'delayed' | 'delivered'` lives.\n- Display layer (ShipmentStatusBadge): renders whatever value arrives. It doesn't need to know which values are valid — it just renders them faithfully.\n- If you put the union on the badge, you couple a UI component to domain logic. Every time the domain adds a status, you update the badge interface. That's the wrong direction.\n- The badge accepts string — the parent passes a ShipmentStatus. TypeScript is still safe at the callsite because ShipmentStatus satisfies string. The badge stays decoupled.",
    discover:
      "**Pattern — domain vs display types:**\n```tsx\n// ✅ domain layer — locked union, catches invalid values\ntype ShipmentStatus = 'active' | 'delayed' | 'delivered';\n\ninterface ShipmentRecord {\n  status: ShipmentStatus; // enforced here, at the data layer\n}\n\n// ✅ display layer — accepts any string, stays decoupled\ninterface ShipmentStatusBadgeProps {\n  status: string; // renders whatever arrives\n}\n\n// ✅ TypeScript is still safe at the callsite\nconst record: ShipmentRecord = { ..., status: 'active' };\n<ShipmentStatusBadge status={record.status} /> // status is ShipmentStatus, satisfies string\n\n// ✅ narrow at the display layer only when the component needs to branch on value\ninterface ShipmentStatusBadgeProps {\n  status: 'active' | 'delayed' | 'delivered'; // only if badge changes behaviour per value\n}\n```\n- domain layer: narrow union types, enforce business rules\n- display layer: wide types (string), stay flexible and decoupled\n- narrow in display components only when the component branches on the specific value",
    quickRules:
      "**Quick rules:**\n- ✅ use union types at the domain layer — ShipmentRecord, API types\n- ✅ use `string` at the display layer when the component just renders the value\n- ✅ narrow to a union in a display component only if it branches on specific values (e.g. different className per status)\n- ❌ coupling display components to domain unions — they drift together unnecessarily\n- the callsite is still type-safe: ShipmentStatus satisfies string, so passing a ShipmentStatus to a string prop is always valid",
    watchOut:
      "👀 **Watch out:** This lesson types status as string deliberately — but in Lesson 1's ShipmentCard you used a union because that component applied different className per status value. If ShipmentStatusBadge ever needs different styles per status, narrow the type then. Type decisions should follow the component's actual behaviour, not a blanket rule.",
    dryRun:
      "🔁 **Think:** ShipmentStatusBadge accepts `status: string`. A parent has `shipment.status` typed as `ShipmentStatus = 'active' | 'delayed' | 'delivered'`. The parent passes `<ShipmentStatusBadge status={shipment.status} />`. Does TypeScript error — and why not, even though the prop type is just string?",
    build:
      "**Learning focus:** Wire a props interface to a component by destructuring in the signature — understanding that the interface annotation is TypeScript's enforcement point and that type decisions should match the component's actual responsibilities.",
  },
},
{
  id: "step4",
  type: "question",
  phase: "Step 4 of 6",
  paal: "Wire onClick to the span — if the parent passes a click handler, the span should call it when clicked. If no handler is passed, nothing should happen.",
  hint: "onClick on a JSX element takes a function. The prop is optional — you can pass it directly and JSX handles undefined gracefully.",
  example_code: `<button onClick={onPress}>{label}</button>`,
  think_prompt:
    "onClick on ShipmentStatusBadgeProps is `(() => void) | undefined`. If you pass it directly to the span's onClick attribute, what happens when it's undefined — does JSX crash, ignore it, or handle it?",
  mc_options: [
    "onClick={onClick ? onClick : () => {}}",
    "onClick={onClick}",
    "onClick={() => onClick && onClick()}",
  ],
  mc_correct_option: "onClick={onClick}",
  mc_anchor:
    "JSX handles undefined event handlers gracefully — if onClick is undefined, the attribute is simply not applied. No crash, no wrapper needed. Passing `onClick={onClick}` directly is the correct pattern. The defensive wrapper `onClick={() => onClick && onClick()}` is unnecessary noise. The fallback to an empty function `onClick ? onClick : () => {}` wastes memory by creating a new function on every render.",
  why_this_matters:
    "Optional event handlers are everywhere in enterprise apps — expandable rows, dismissible banners, selectable badges. The pattern is always the same: pass the prop directly to the JSX event attribute and let undefined be undefined. React handles it.",
  answer_keywords: ["onClick={onClick}", "span"],
  seed_code: `interface ShipmentStatusBadgeProps {
  status: string;
  label?: string;
  onClick?: () => void;
}

const ShipmentStatusBadge = ({ status, label, onClick }: ShipmentStatusBadgeProps): JSX.Element => {
  return <span>{status}</span>;
};`,
  starter_code: `interface ShipmentStatusBadgeProps {
  status: string;
  label?: string;
  onClick?: () => void;
}

// add onClick={onClick} to the span
const ShipmentStatusBadge = ({ status, label, onClick }: ShipmentStatusBadgeProps): JSX.Element => {
  return <span>{status}</span>;
};`,
  feedback_correct:
    "Exactly — pass onClick directly to the span. When the parent supplies a handler, clicks fire it. When the parent omits it, undefined is passed and React silently ignores it.",
  feedback_partial:
    "Close — simplify the onClick wiring. You don't need a wrapper function or a ternary — just `onClick={onClick}` directly on the span.",
  feedback_wrong:
    "The pattern: `<span onClick={onClick}>{status}</span>` — pass the prop directly. JSX handles undefined event handlers gracefully.",
  expected: `interface ShipmentStatusBadgeProps {
  status: string;
  label?: string;
  onClick?: () => void;
}

const ShipmentStatusBadge = ({ status, label, onClick }: ShipmentStatusBadgeProps): JSX.Element => {
  return <span onClick={onClick}>{status}</span>;
};`,
  analog_example: `<button onClick={onDismiss}>{count}</button>`,
  deepDiveLabel:
    "onClick={undefined} is handled gracefully — but what about passing an async function as the handler?",
  deepDive: {
    hook: "You type onClick as `() => void`. A parent passes an async handler: `onClick={async () => { await saveShipment(); }}`. TypeScript says nothing. The component calls onClick(), gets a Promise back, and does nothing with it — which is exactly what void promises.\n\nThis feels right. But a teammate asks: if the async function throws inside, does the component catch it? You realize you don't know. The component called onClick(), didn't await it, and moved on. The error is swallowed somewhere in the event loop with no trace in the UI.",
    pain: "⚠️ **Lesson:** A parent passes an async function as onClick. The handler throws an error. The component never sees it — it already moved on. onClick returned a Promise, but void said 'ignore the return value'. Where does the error go — and what's the right way to handle async event handlers?",
    mentalModel:
      "**Mental model: void is a promise, not a guarantee**\n\nvoid tells the component 'I will not look at what you return'. It does NOT tell the caller 'your function must be synchronous' or 'your function must not throw'.\n- A synchronous handler that returns undefined satisfies `() => void`.\n- An async handler that returns a Promise satisfies `() => void` — because the component ignores the Promise.\n- If the async handler throws, the Promise rejects — but nobody is awaiting it, so the rejection is unhandled.\n- The fix: if a component cares about async errors, type onClick as `() => Promise<void>` and wrap the call in try/catch or handle the Promise explicitly. If the component truly doesn't care — pass it through and let the parent handle errors.",
    discover:
      "**Pattern — async event handlers:**\n```tsx\n// ✅ synchronous handler — always safe with () => void\nonClick?: () => void;\n\n// ✅ async handler that satisfies () => void\n<ShipmentStatusBadge onClick={async () => { await saveShipment(); }} />\n// Works — component ignores the returned Promise\n// But: errors inside are unhandled unless the async function catches them\n\n// ✅ if the component needs to handle async errors\nonClick?: () => Promise<void>;\n// Then the component can: const result = onClick?.(); result?.catch(handleError);\n\n// ❌ async handler with unhandled rejection — silent failure\n<ShipmentStatusBadge onClick={async () => { \n  await saveShipment(); // throws — Promise rejects — nobody catches it\n}} />\n```\n- `() => void` is correct for fire-and-forget click handlers\n- `() => Promise<void>` is correct when the component needs to handle async errors\n- always handle errors inside the async function when using `() => void`",
    quickRules:
      "**Quick rules:**\n- ✅ `onClick?: () => void` for standard fire-and-forget handlers\n- ✅ `onClick?: () => Promise<void>` when the component chains on the result\n- ✅ handle errors inside the async function when using `() => void`\n- ❌ unhandled Promise rejections from async event handlers — they fail silently\n- ❌ `onClick: Function` — no safety on arguments or return type",
    watchOut:
      "👀 **Watch out:** Unhandled Promise rejections from async event handlers are invisible in many environments — no console error, no UI crash, just silent failure. Always wrap async handlers in try/catch when the operation can fail. `onClick={async () => { try { await save(); } catch (e) { handleError(e); } }}` is the safe pattern.",
    dryRun:
      "🔁 **Think:** onClick is typed as `() => void`. A parent passes `onClick={async () => { await fetch('/api/shipments'); }}`. TypeScript says nothing. The component calls `onClick()`. What does onClick() return — undefined or a Promise? What does the component do with the return value — and what happens if the fetch throws?",
    build:
      "**Learning focus:** Wire an optional click handler prop to a JSX element by passing it directly — understanding that undefined is handled gracefully by JSX and that () => void allows async functions while making clear the component will not await or handle their return value.",
  },
},
{
  id: "step5",
  type: "question",
  phase: "Step 5 of 6",
  paal: "Render label conditionally — show it as a paragraph below the span only when the parent passes a value. If label is undefined, nothing should render in that position.",
  hint: "Use && to conditionally render the paragraph. When label is undefined, && short-circuits and React renders nothing.",
  example_code: `{helperText && <p>{helperText}</p>}`,
  think_prompt:
    "label is `string | undefined` inside the component. If you render `<p>{label}</p>` unconditionally, what shows when label is undefined — and is that the right behaviour?",
  mc_options: [
    "{label !== undefined && <p>{label}</p>}",
    "{label && <p>{label}</p>}",
    "{label ? <p>{label}</p> : <p></p>}",
  ],
  mc_correct_option: "{label && <p>{label}</p>}",
  mc_anchor:
    "The && pattern is the standard for optional string rendering — when label is undefined, && returns undefined and React renders nothing. The explicit `!== undefined` check also works but is verbose — undefined is already falsy. The ternary option renders an empty paragraph when label is absent, which adds a DOM node where there should be none.",
  why_this_matters:
    "Conditional rendering of optional data is one of the most common patterns in enterprise apps. Detail panels, summary cards, notification banners — everywhere a field may or may not be present, && keeps the JSX clean without branching.",
  answer_keywords: ["label", "&&", "<p>", "{label}"],
  seed_code: `interface ShipmentStatusBadgeProps {
  status: string;
  label?: string;
  onClick?: () => void;
}

const ShipmentStatusBadge = ({ status, label, onClick }: ShipmentStatusBadgeProps): JSX.Element => {
  return <span onClick={onClick}>{status}</span>;
};`,
  starter_code: `interface ShipmentStatusBadgeProps {
  status: string;
  label?: string;
  onClick?: () => void;
}

// add conditional rendering of label below the span
const ShipmentStatusBadge = ({ status, label, onClick }: ShipmentStatusBadgeProps): JSX.Element => {
  return <span onClick={onClick}>{status}</span>;
};`,
  feedback_correct:
    "Exactly — && renders the paragraph only when label has a value. Parents that omit label see no paragraph in the DOM at all.",
  feedback_partial:
    "Close — check what happens when label is undefined. Does your approach render an empty p tag, render null, or render nothing at all? The && pattern renders nothing when the left side is falsy.",
  feedback_wrong:
    "The pattern: `{label && <p>{label}</p>}` — when label is undefined the expression short-circuits and React renders nothing. When label is a string React renders the p tag with its value. Wrap the span and conditional in a Fragment to return two siblings.",
  expected: `interface ShipmentStatusBadgeProps {
  status: string;
  label?: string;
  onClick?: () => void;
}

const ShipmentStatusBadge = ({ status, label, onClick }: ShipmentStatusBadgeProps): JSX.Element => {
  return (
    <>
      <span onClick={onClick}>{status}</span>
      {label && <p>{label}</p>}
    </>
  );
};`,
  analog_example: `const NotificationBell = ({ count, helperText, onDismiss }: NotificationBellProps): JSX.Element => {
  return (
    <>
      <button onClick={onDismiss}>{count}</button>
      {helperText && <p>{helperText}</p>}
    </>
  );
};`,
  deepDiveLabel:
    "&& works for strings — but why can it silently render a 0 for numbers?",
  deepDive: {
    hook: "You use the && pattern everywhere. It's clean. It's readable. Then a new component needs to conditionally render based on an itemCount prop typed as `number | undefined`. You write `{itemCount && <span>{itemCount}</span>}` — the same pattern. It works perfectly for counts of 1, 5, 100.\n\nThen a user empties their cart. itemCount becomes 0. You expect nothing to render — 0 is falsy, so the && should short-circuit. Instead, the number 0 appears on screen, floating alone with no span around it. You've shipped a bug that only appears at the exact moment the cart is empty.",
    pain: "⚠️ **Lesson:** `{itemCount && <span>{itemCount}</span>}` renders the number 0 on screen when itemCount is 0. `{label && <p>{label}</p>}` renders nothing when label is undefined. Why does && behave differently for numbers and strings — and what's the fix?",
    mentalModel:
      "**Mental model: && returns the last evaluated value — not true or false**\n\nJavaScript's && operator does not return a boolean. It returns one of the two operands.\n- If the left side is falsy, && returns the left side value — and React renders it.\n- For undefined: falsy, && returns undefined, React renders nothing. ✅\n- For '' (empty string): falsy, && returns '', React renders nothing. ✅\n- For 0 (zero): falsy, && returns 0, React renders the number 0 as text. ❌\n- The fix: `{itemCount > 0 && <span>{itemCount}</span>}` — force the left side to be a real boolean.",
    discover:
      "**Pattern — safe conditional rendering:**\n```tsx\n// ✅ string prop — && is safe\n{label && <p>{label}</p>}\n\n// ✅ boolean prop — && is safe\n{isActive && <span>Active</span>}\n\n// ❌ number prop with bare && — renders 0 when count is 0\n{itemCount && <span>{itemCount}</span>}\n\n// ✅ number prop — explicit comparison\n{itemCount > 0 && <span>{itemCount}</span>}\n\n// ✅ ternary — explicit about both cases, always safe\n{itemCount > 0 ? <span>{itemCount}</span> : null}\n```\n- && is safe for string and boolean optional props\n- && needs an explicit comparison for number props\n- ternary with null is always the safest fallback",
    quickRules:
      "**Quick rules:**\n- ✅ `{label && <p>{label}</p>}` — safe for string props\n- ✅ `{isActive && <span>Active</span>}` — safe for boolean props\n- ✅ `{count > 0 && <span>{count}</span>}` — safe for number props\n- ❌ `{count && <span>{count}</span>}` — renders 0 when count is 0\n- ternary with null is always the safest fallback regardless of type",
    watchOut:
      "👀 **Watch out:** The 0 rendering bug is invisible in TypeScript — it's not a type error, it's a JavaScript evaluation quirk. The only way to prevent it is to know the rule: always use an explicit comparison when the left side of && could be the number 0.",
    dryRun:
      "🔁 **Think:** label is `string | undefined`. A parent passes `label=''` — an empty string. Walk through `{label && <p>{label}</p>}` — what does && evaluate to, what does React render? Now a parent passes `label='Active Shipment'`. Walk through — what renders? Now change the prop to `count: number | undefined` and the parent passes `count={0}`. Walk through `{count && <span>{count}</span>}` — what renders and why?",
    build:
      "**Learning focus:** Use the && operator to conditionally render optional string props — understanding that && is safe for strings and booleans but requires an explicit comparison for numbers to prevent the 0 rendering bug.",
  },
},
{
  id: "step6",
  type: "question",
  phase: "Step 6 of 6",
  paal: "Add a default value for label in the destructure — if the parent does not pass label, it should default to 'Status'. Then remove the && guard since label now always has a value.",
  hint: "Default values in destructuring use = after the field name. Once label has a default, it is never undefined — the && guard becomes dead code and should be removed.",
  example_code: `const Avatar = ({ src, alt, size = 40 }: AvatarProps): JSX.Element => {
  return <img src={src} alt={alt} width={size} />;
};`,
  think_prompt:
    "Once label has a default value, what is its type inside the component body — `string | undefined` or always `string`? And what does that mean for the && guard?",
  mc_options: [
    "Keep the && guard — the default only applies when label is undefined, it could still be falsy",
    "Remove the && guard and render label directly — a default value guarantees label is always a string inside the component",
    "Change label to required in the interface since it now always has a value",
  ],
  mc_correct_option:
    "Remove the && guard and render label directly — a default value guarantees label is always a string inside the component",
  mc_anchor:
    "A destructuring default means label is always a string inside the component body — either the value the parent passed or the fallback 'Status'. TypeScript narrows the type from `string | undefined` to `string` the moment you add the default. The && guard was there to handle undefined — once undefined is impossible, the guard is dead code and should be removed. The interface stays as `label?: string` because the parent contract has not changed — the parent can still choose not to pass it.",
  why_this_matters:
    "Default props keep the interface flexible for parents while keeping the component body clean and free of defensive checks. The parent decides whether to customise — the component guarantees a sensible fallback. This pattern appears in every component library and design system in real enterprise apps.",
  answer_keywords: ["label", "=", "'Status'", "<p>{label}</p>"],
  seed_code: `interface ShipmentStatusBadgeProps {
  status: string;
  label?: string;
  onClick?: () => void;
}

const ShipmentStatusBadge = ({ status, label, onClick }: ShipmentStatusBadgeProps): JSX.Element => {
  return (
    <>
      <span onClick={onClick}>{status}</span>
      {label && <p>{label}</p>}
    </>
  );
};`,
  starter_code: `interface ShipmentStatusBadgeProps {
  status: string;
  label?: string;
  onClick?: () => void;
}

const ShipmentStatusBadge = ({ status, label, onClick }: ShipmentStatusBadgeProps): JSX.Element => {
  return (
    <>
      <span onClick={onClick}>{status}</span>
      {/* add default for label in the destructure and update this line */}
      {label && <p>{label}</p>}
    </>
  );
};`,
  feedback_correct:
    "Exactly — default in the destructure, && guard removed, label renders directly. The interface stays optional so parents can still choose not to pass it, but the component body is now free of any defensive check.",
  feedback_partial:
    "Close — check two things: is the default value added in the destructure parameter (not as a separate variable inside the body), and is the && guard removed since label can no longer be undefined?",
  feedback_wrong:
    "The pattern: `{ status, label = 'Status', onClick }` in the destructure — the = sets the fallback. Then render `<p>{label}</p>` directly since the default guarantees label is always a string inside the component.",
  expected: `interface ShipmentStatusBadgeProps {
  status: string;
  label?: string;
  onClick?: () => void;
}

const ShipmentStatusBadge = ({ status, label = 'Status', onClick }: ShipmentStatusBadgeProps): JSX.Element => {
  return (
    <>
      <span onClick={onClick}>{status}</span>
      <p>{label}</p>
    </>
  );
};`,
  analog_example: `const Avatar = ({ src, alt, size = 40, onError }: AvatarProps): JSX.Element => {
  return <img src={src} alt={alt} width={size} onClick={onError} />;
};`,
  deepDiveLabel:
    "The default lives in the destructure — but could you set it in the interface instead?",
  deepDive: {
    hook: "You add `label = 'Status'` to the destructure and everything works. A teammate asks why the default is not in the interface instead — after all, the interface describes the component's props, so shouldn't defaults live there too? You try adding a default to the interface. TypeScript does not support default values in interfaces at all — the syntax does not exist. Interfaces describe types, not runtime values. You try adding it to the component's defaultProps instead — the React pattern from class components. It works, but every modern codebase uses the destructure default instead. Your teammate asks why.",
    pain: "⚠️ **Lesson:** You want label to default to 'Status' when the parent does not pass it. You try adding the default to the interface definition. TypeScript throws a syntax error. Why can't interface fields have default values — and where does the default actually belong?",
    mentalModel:
      "**Mental model: Types describe shape, destructuring sets runtime values**\n\nA TypeScript interface is a compile-time contract. It describes what fields exist and what types they hold. It has no concept of runtime values — it is erased entirely before the JavaScript runs. There is nothing left at runtime to apply a default.\n\nThe destructure parameter is runtime JavaScript. When the component is called, JavaScript unpacks the props object and assigns each field to a local variable. The = in `{ label = 'Status' }` is JavaScript's destructuring default syntax — it runs at call time and sets the variable to 'Status' if the incoming value is undefined.\n\nThis is why the default belongs in the destructure: it is a runtime operation, not a type operation. The interface stays as `label?: string` because the parent contract has not changed — parents can still omit it.",
    discover:
      "**Pattern — default values:**\n```tsx\n// ✅ default in destructure — correct, modern standard\nconst ShipmentStatusBadge = ({ status, label = 'Status', onClick }: ShipmentStatusBadgeProps): JSX.Element => {\n  return <><span>{status}</span><p>{label}</p></>;\n};\n\n// ❌ defaultProps — class component pattern, retired in modern React\nShipmentStatusBadge.defaultProps = { label: 'Status' };\n\n// ❌ default in interface — TypeScript syntax error\ninterface ShipmentStatusBadgeProps {\n  label?: string = 'Status'; // invalid\n}\n\n// ✅ ?? in the body — works but adds a variable; destructure default is cleaner\nconst resolvedLabel = label ?? 'Status';\n```\n- destructure default is the modern standard\n- defaultProps is retired — do not use in functional components\n- interfaces are compile-time only — no runtime defaults possible",
    quickRules:
      "**Quick rules:**\n- ✅ `{ label = 'Status' }` in the destructure — correct, modern, clean\n- ✅ interface stays as `label?: string` — parent contract unchanged\n- ✅ remove the && guard once a default is in place — undefined is no longer possible\n- ❌ defaultProps — retired, not used in modern functional components\n- ❌ default values in interface definitions — TypeScript syntax error\n- ❌ keeping the && guard after adding a default — dead code that misleads the reader",
    watchOut:
      "👀 **Watch out:** Adding a default in the destructure does not change the interface. The parent still sees `label?: string` — they can still omit it. The default is invisible to the parent. Never change `label?: string` to `label: string` in the interface just because you added a default — that would force every parent to supply a value they don't need to think about.",
    dryRun:
      "🔁 **Think:** The destructure is `{ status, label = 'Status', onClick }`. A parent renders `<ShipmentStatusBadge status='Active' />` — no label passed. What value does label have inside the component, what renders in the p tag? Now the parent passes `label='Delayed'`. What value does label have, what renders? Now the parent passes `label=''` — an empty string. Does the default apply — and what renders?",
    build:
      "**Learning focus:** Add a destructuring default for an optional prop so the component always has a usable value — removing the need for a conditional guard in JSX and keeping the parent interface unchanged.",
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
  { label: "Step 6", id: "step6" },
];

export default createINPACTEngine({
  NODES,
  sideItems,
  lessonNum: 7,
  title: "Props + Interface",
  shortName: "TS — PROPS INTERFACE",
});