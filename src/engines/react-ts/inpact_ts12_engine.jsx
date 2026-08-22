import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
{
  id: "intro",
  type: "reveal",
  phase: "Lesson",
  content: {
    tag: "LESSON #12 (React Hooks)",
    title: "useState — Arrays",
    body: "Every component you've built so far has been stateless — it renders the same output for the same props every time. useState changes that. It gives a component memory — a value that persists across re-renders and triggers a UI update every time it changes. In this lesson you'll add a selection state to ShipmentCard, type it precisely with TypeScript, and understand what re-render means and why it happens.",
    usecase:
      "A shipment list in a dashboard needs to track which card is selected so it can highlight it and load a detail panel. That selected state lives in the parent component — not in the data, not in the URL. useState is what holds it, and understanding how it works is what makes interactive UIs possible.",
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
    {
      lesson: 11,
      label: "useState — Objects + Spread",
      reason: "Complete Lesson 11 (useState — Objects + Spread) first — it is a prerequisite on the React-TS track for this lesson.",
    },
  ],
},
{
  id: "objectives",
  type: "objectives",
  phase: "Objectives",
  items: [
    "Declare a state variable and its setter using the useState hook",
    "Type state explicitly when TypeScript cannot infer it from the initial value",
    "Update state by calling the setter with a new value",
    "Understand why state updates trigger re-renders and why direct mutation does not",
    "Derive JSX output from state — className, conditional rendering, and displayed values",
  ],
},
{
  id: "step1",
  type: "question",
  phase: "Step 1 of 5",
  paal: "Add a boolean state variable called isSelected to ShipmentCard, initialised to false.",
  hint: "useState returns a tuple — the current value and a setter function. Destructure them with array syntax: const [value, setValue] = useState(initialValue).",
  example_code: `const [isOpen, setIsOpen] = useState(false);`,
  think_prompt:
    "ShipmentCard needs to track whether it's been clicked and selected. This state belongs to the card itself — it changes independently per card and persists across re-renders. What hook gives a component that kind of memory?",
  mc_options: [
    "let isSelected = false;",
    "const [isSelected, setIsSelected] = useState(false);",
    "const isSelected = useState(false);",
  ],
  mc_correct_option: "const [isSelected, setIsSelected] = useState(false);",
  mc_anchor:
    "useState returns a tuple — the current value and a setter. Array destructuring gives you both as named variables. `let isSelected = false` is a plain variable — changing it doesn't trigger a re-render and the UI never updates. `const isSelected = useState(false)` gives you the tuple itself, not the destructured values — you'd need to write `isSelected[0]` and `isSelected[1]` everywhere.",
  why_this_matters:
    "State is what makes components interactive. Without useState, a variable change is invisible to React — the UI stays frozen no matter what the code does. useState is the contract with React: 'when this value changes, re-render this component'. That contract is what keeps the UI in sync with the data.",
  answer_keywords: [
    "useState", "isSelected", "setIsSelected", "false", "const", "[", "]",
  ],
  seed_code: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
}

const ShipmentCard = ({ shipmentId, destination, status }: ShipmentCardProps): JSX.Element => {
  return (
    <div className={\`card--\${status}\`}>
      <p>{shipmentId}</p>
      <p>{destination}</p>
      <p>{status}</p>
    </div>
  );
};`,
  starter_code: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
}

const ShipmentCard = ({ shipmentId, destination, status }: ShipmentCardProps): JSX.Element => {
  // declare isSelected state here, initialised to false
  return (
    <div className={\`card--\${status}\`}>
      <p>{shipmentId}</p>
      <p>{destination}</p>
      <p>{status}</p>
    </div>
  );
};`,
  feedback_correct:
    "Exactly — useState(false) initialises isSelected as false, TypeScript infers the type as boolean, and setIsSelected is the function you call to update it and trigger a re-render.",
  feedback_partial:
    "Close — check the destructuring. useState returns [currentValue, setter] — you need both. `const [isSelected, setIsSelected] = useState(false)` gives you each as a named variable.",
  feedback_wrong:
    "The pattern: `const [isSelected, setIsSelected] = useState(false)` — array destructuring to get the current value and the setter function from useState.",
  expected: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
}

const ShipmentCard = ({ shipmentId, destination, status }: ShipmentCardProps): JSX.Element => {
  const [isSelected, setIsSelected] = useState(false);
  return (
    <div className={\`card--\${status}\`}>
      <p>{shipmentId}</p>
      <p>{destination}</p>
      <p>{status}</p>
    </div>
  );
};`,
  analog_example: `const [isExpanded, setIsExpanded] = useState(false);`,
  deepDiveLabel:
    "TypeScript inferred boolean from false — when do you ever need to type useState explicitly?",
  deepDive: {
    hook: "useState(false) works perfectly. TypeScript infers boolean from the initial value. You wonder when you'd ever need to write `useState<boolean>(false)` explicitly — it seems redundant.\n\nThen you hit a case where inference breaks: `useState(null)`. TypeScript infers `null` — not `string | null`, not `ShipmentRecord | null`. Just `null`. When you later call `setSelectedShipment(record)`, TypeScript errors because `ShipmentRecord` is not assignable to `null`.\n\nThis is the exact moment you need an explicit type argument.",
    pain: "⚠️ **Lesson:** You write `const [selectedId, setSelectedId] = useState(null)`. Later you call `setSelectedId('NX-1042')`. TypeScript errors: 'Argument of type string is not assignable to parameter of type null'. How does an explicit type argument fix this — and why did inference fail?",
    mentalModel:
      "**Mental model:** TypeScript infers the state type from the initial value — and nothing else.\n- `useState(false)` → TypeScript sees `false`, infers `boolean`. Later calls to the setter must pass a boolean.\n- `useState('')` → TypeScript sees `''`, infers `string`. Later calls must pass a string.\n- `useState(null)` → TypeScript sees `null`, infers `null`. Later calls must pass `null` — nothing else.\n- When the initial value is null but the state will eventually hold a real value, inference gives you the wrong type. The fix: `useState<string | null>(null)` — tell TypeScript the full range of values this state can hold.",
    discover:
      "**Pattern — explicit vs inferred state types:**\n```tsx\n// ✅ inferred — initial value matches the full range of values\nconst [isSelected, setIsSelected] = useState(false); // boolean\nconst [count, setCount] = useState(0);               // number\nconst [label, setLabel] = useState('');              // string\n\n// ✅ explicit — initial value is null but state will hold a real value\nconst [selectedId, setSelectedId] = useState<string | null>(null);\nsetSelectedId('NX-1042'); // ✅ string is now valid\nsetSelectedId(null);       // ✅ null is valid (deselect)\n\n// ❌ inferred from null — too narrow\nconst [selectedId, setSelectedId] = useState(null);\nsetSelectedId('NX-1042'); // ❌ TypeScript: string not assignable to null\n```\n- inference works when the initial value is a valid example of the full type\n- use explicit type argument when the initial value is null/undefined but the state will hold a richer type later\n- the type argument goes between useState and the parentheses: `useState<Type>(initialValue)`",
    quickRules:
      "**Quick rules:**\n- ✅ `useState(false)` — inference works, initial value is a valid boolean\n- ✅ `useState<string | null>(null)` — explicit when initial is null but state will hold a string\n- ✅ `useState<ShipmentRecord | null>(null)` — explicit when initial is null but state will hold an object\n- ❌ `useState(null)` without type argument when you plan to set a non-null value later\n- ❌ `useState<any>(null)` — defeats the purpose of typing state at all",
    watchOut:
      "👀 **Watch out:** TypeScript infers from the initial value at the point of declaration — it does NOT look ahead at what values you later pass to the setter. The inference is a one-shot decision based only on what useState receives at that moment. If that initial value doesn't represent the full range of valid states, you must provide the type explicitly.",
    dryRun:
      "🔁 **Think:** You write `const [shipment, setShipment] = useState(null)`. TypeScript infers the type as `null`. Later you call `setShipment({ id: 'NX-1', status: 'active' })`. TypeScript errors. What is the minimum type argument that would fix this while still allowing null to represent 'nothing selected'?",
    build:
      "**Learning focus:** Declare state with useState — understanding that TypeScript infers the type from the initial value, and that explicit type arguments are needed when the initial value (often null) doesn't represent the full range of values the state will hold.",
  },
},
{
  id: "step2",
  type: "question",
  phase: "Step 2 of 5",
  paal: "Add an onClick handler to the card div that calls setIsSelected(true) when the card is clicked.",
  hint: "JSX event handlers use camelCase: onClick. Pass a function — not a function call. `onClick={setIsSelected(true)}` calls the function immediately; `onClick={() => setIsSelected(true)}` calls it on click.",
  example_code: `<div onClick={() => setIsOpen(true)}>
  content
</div>`,
  think_prompt:
    "You want setIsSelected(true) to run when the user clicks the card — not when the component renders. How do you attach it to the div so it only fires on the click event?",
  mc_options: [
    "onClick={setIsSelected(true)}",
    "onClick={() => setIsSelected(true)}",
    "onclick={() => setIsSelected(true)}",
  ],
  mc_correct_option: "onClick={() => setIsSelected(true)}",
  mc_anchor:
    "onClick expects a function — a callback React will call when the event fires. `() => setIsSelected(true)` is an arrow function that calls the setter when invoked. `setIsSelected(true)` without the arrow function calls the setter immediately during render — before any click happens — and passes its return value (undefined) as the onClick handler. `onclick` lowercase is not a React event handler — it's the HTML attribute which React doesn't use.",
  why_this_matters:
    "The arrow function wrapper is one of the most important patterns in React event handling. Without it, you accidentally call your state setter during render, trigger an infinite re-render loop, and break the component. The pattern `onClick={() => doSomething()}` is how you ensure the function only runs when the event fires.",
  answer_keywords: ["onClick", "() =>", "setIsSelected", "true"],
  seed_code: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
}

const ShipmentCard = ({ shipmentId, destination, status }: ShipmentCardProps): JSX.Element => {
  const [isSelected, setIsSelected] = useState(false);
  return (
    <div className={\`card--\${status}\`}>
      <p>{shipmentId}</p>
      <p>{destination}</p>
      <p>{status}</p>
    </div>
  );
};`,
  starter_code: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
}

const ShipmentCard = ({ shipmentId, destination, status }: ShipmentCardProps): JSX.Element => {
  const [isSelected, setIsSelected] = useState(false);
  return (
    // add onClick to the div — call setIsSelected(true) when clicked
    <div className={\`card--\${status}\`}>
      <p>{shipmentId}</p>
      <p>{destination}</p>
      <p>{status}</p>
    </div>
  );
};`,
  feedback_correct:
    "Exactly — `() => setIsSelected(true)` is a function that React will call when the user clicks. The arrow wrapper ensures it runs on click, not on render.",
  feedback_partial:
    "Close — check two things: is onClick camelCase (not onclick), and is the setter wrapped in an arrow function `() => setIsSelected(true)` rather than called directly `setIsSelected(true)`?",
  feedback_wrong:
    "The pattern: `onClick={() => setIsSelected(true)}` — an arrow function that calls the setter when the event fires. Without the arrow wrapper, the setter runs immediately during render.",
  expected: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
}

const ShipmentCard = ({ shipmentId, destination, status }: ShipmentCardProps): JSX.Element => {
  const [isSelected, setIsSelected] = useState(false);
  return (
    <div className={\`card--\${status}\`} onClick={() => setIsSelected(true)}>
      <p>{shipmentId}</p>
      <p>{destination}</p>
      <p>{status}</p>
    </div>
  );
};`,
  analog_example: `<button onClick={() => setIsExpanded(true)}>Expand</button>`,
  deepDiveLabel:
    "onClick={setIsSelected(true)} causes an infinite loop — how exactly does that happen?",
  deepDive: {
    hook: "You write `onClick={setIsSelected(true)}` — without the arrow wrapper. The component renders. Then something unexpected happens: the page keeps refreshing rapidly, your browser tab consumes 100% CPU, and React logs 'Too many re-renders'. You didn't click anything. The card never even appeared on screen.\n\nThis is one of the most jarring bugs for React beginners, and it always comes from the same mistake — calling a state setter directly in JSX instead of wrapping it.",
    pain: "⚠️ **Lesson:** You write `onClick={setIsSelected(true)}`. The component enters an infinite re-render loop before the user clicks anything. Walk through exactly what happens on the first render — and why it loops.",
    mentalModel:
      "**Mental model:** JSX evaluates all attribute values during render.\n- When React renders `<div onClick={setIsSelected(true)}>`, it evaluates every attribute as part of building the output.\n- `setIsSelected(true)` is not a reference to a function — it's a function call. React evaluates it immediately.\n- Calling `setIsSelected(true)` updates state. State update triggers a re-render. The component renders again.\n- During the next render, `setIsSelected(true)` is called again. Another state update. Another re-render. Infinite loop.\n- `() => setIsSelected(true)` is a reference to an arrow function — its body is NOT executed during render. React stores the reference and calls it only when the click event fires.",
    discover:
      "**Pattern — event handler as function reference:**\n```tsx\n// ✅ arrow function — reference stored, body runs on click\n<div onClick={() => setIsSelected(true)}>\n\n// ✅ named handler — reference stored, body runs on click\nconst handleClick = () => setIsSelected(true);\n<div onClick={handleClick}>\n\n// ❌ direct call — evaluates immediately during render, causes infinite loop\n<div onClick={setIsSelected(true)}>\n\n// ❌ direct call with parens on a named handler\n<div onClick={handleClick()}> // same problem — calls handleClick during render\n```\n- onClick expects a function reference — something React can call later\n- never put () after a function name in a JSX event handler unless it's inside an arrow\n- `onClick={fn}` ✅ — reference to fn\n- `onClick={fn()}` ❌ — calls fn immediately, passes its return value",
    quickRules:
      "**Quick rules:**\n- ✅ `onClick={() => doSomething()}` — arrow wrapper, runs on event\n- ✅ `onClick={handleClick}` — named function reference, no parens\n- ❌ `onClick={doSomething()}` — immediate call, infinite loop\n- ❌ `onClick={handleClick()}` — immediate call, same problem\n- the rule: if you see `()` in an event handler that's not inside an arrow function, it's a bug",
    watchOut:
      "👀 **Watch out:** `onClick={handleClick}` vs `onClick={() => handleClick()}` both work — but they behave differently when handleClick needs arguments. `onClick={handleClick}` passes the event object as the first argument. `onClick={() => handleClick(shipmentId)}` passes a custom argument. Choose based on what your handler needs.",
    dryRun:
      "🔁 **Think:** You write `onClick={setIsSelected(true)}`. Walk through the first render: React evaluates the onClick attribute — what happens? State updates — what does React do? The component re-renders — what happens to the onClick attribute again? How many times does this repeat before React throws an error?",
    build:
      "**Learning focus:** Attach a state setter to a JSX event handler by wrapping it in an arrow function — understanding that JSX evaluates attribute values during render, so a direct function call causes an immediate state update and infinite re-render loop.",
  },
},
{
  id: "step3",
  type: "question",
  phase: "Step 3 of 5",
  paal: "Use isSelected to add a 'card--selected' class to the div when the card is selected. The div should have both the status class and the selected class when isSelected is true.",
  hint: "Template literals can combine multiple class names. Or use a ternary to add the selected class conditionally. Both are valid — pick the cleaner one for two classes.",
  example_code: `<div className={\`panel\${isOpen ? ' panel--open' : ''}\`}>`,
  think_prompt:
    "The div already has a dynamic className from status. Now you need to add a second class when isSelected is true. How do you combine a static status class with an optional selected class in one className expression?",
  mc_options: [
    "className={`card--${status} ${isSelected ? 'card--selected' : ''}`}",
    "className={isSelected ? 'card--selected' : `card--${status}`}",
    "className={`card--${status}`} selected={isSelected}",
  ],
  mc_correct_option:
    "className={`card--${status} ${isSelected ? 'card--selected' : ''}`}",
  mc_anchor:
    "A template literal can combine both classes — the status class always present, the selected class appended conditionally. The second option removes the status class entirely when selected — you'd lose `card--active` and replace it with `card--selected`. The third option uses a `selected` attribute which doesn't exist on HTML elements and has no CSS effect.",
  why_this_matters:
    "Multi-class derivation from state and props is the pattern behind every interactive UI element in enterprise apps — selected rows, active tabs, open accordions, highlighted items. Template literals make the combination readable. Later lessons cover clsx which handles more complex combinations — but template literals are the foundation.",
  answer_keywords: [
    "className", "card--", "status", "isSelected", "card--selected",
  ],
  seed_code: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
}

const ShipmentCard = ({ shipmentId, destination, status }: ShipmentCardProps): JSX.Element => {
  const [isSelected, setIsSelected] = useState(false);
  return (
    <div className={\`card--\${status}\`} onClick={() => setIsSelected(true)}>
      <p>{shipmentId}</p>
      <p>{destination}</p>
      <p>{status}</p>
    </div>
  );
};`,
  starter_code: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
}

const ShipmentCard = ({ shipmentId, destination, status }: ShipmentCardProps): JSX.Element => {
  const [isSelected, setIsSelected] = useState(false);
  return (
    // update className to include card--selected when isSelected is true
    <div className={\`card--\${status}\`} onClick={() => setIsSelected(true)}>
      <p>{shipmentId}</p>
      <p>{destination}</p>
      <p>{status}</p>
    </div>
  );
};`,
  feedback_correct:
    "Exactly — the template literal always includes the status class and conditionally appends the selected class. When isSelected becomes true after a click, React re-renders and the new className is applied to the DOM.",
  feedback_partial:
    "Close — make sure both classes are present when selected: the status class should always be there, and the selected class should appear alongside it when isSelected is true.",
  feedback_wrong:
    "Use a template literal: `className={\\`card--${status}${isSelected ? ' card--selected' : ''}\\`}` — the status class always present, the selected class conditionally appended with a leading space.",
  expected: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
}

const ShipmentCard = ({ shipmentId, destination, status }: ShipmentCardProps): JSX.Element => {
  const [isSelected, setIsSelected] = useState(false);
  return (
    <div
      className={\`card--\${status}\${isSelected ? ' card--selected' : ''}\`}
      onClick={() => setIsSelected(true)}
    >
      <p>{shipmentId}</p>
      <p>{destination}</p>
      <p>{status}</p>
    </div>
  );
};`,
  analog_example: `<li className={\`tab\${isActive ? ' tab--active' : ''}\`}>
  {label}
</li>`,
  deepDiveLabel:
    "Template literals work for two classes — but what happens when you have five conditional classes?",
  deepDive: {
    hook: "Your ShipmentCard has two dynamic classes. Then requirements grow: `card--loading` during data refresh, `card--error` when fetch fails, `card--dragging` during drag, `card--pinned` when starred. Your template literal is now:\n\n```tsx\nclassName={`card--${status}${isSelected ? ' card--selected' : ''}${isLoading ? ' card--loading' : ''}${isError ? ' card--error' : ''}${isDragging ? ' card--dragging' : ''}`}\n```\n\nIt's one line. It works. It's also unreadable, hard to maintain, and one missing space away from broken class names. This is the exact problem `clsx` was built to solve — but that's Lesson 125. Right now, the template literal is the foundation you need to understand before clsx makes sense.",
    pain: "⚠️ **Lesson:** Your template literal grows to five conditional classes. You miss a space between two of them — the classes merge into a single unrecognised class name and the styles break silently. What's the systematic problem with concatenating class names in a template literal — and what does clsx solve?",
    mentalModel:
      "**Mental model:** A template literal is a **string builder** — it concatenates characters in sequence and has no concept of 'class names' as a domain.\n- It doesn't know that class names need spaces between them.\n- It doesn't know that an empty string conditional adds a trailing space.\n- It doesn't know that a null class name should be skipped.\n- These are all domain rules that the developer must encode manually — and manually-encoded rules are where bugs live.\n- clsx is a tiny library that understands class names as a domain: it handles spacing, skips falsy values, and accepts objects and arrays. It turns a string concatenation problem into a structured data problem.",
    discover:
      "**Pattern — template literal vs clsx:**\n```tsx\n// ✅ template literal — fine for 1-2 dynamic classes\nclassName={`card--${status}${isSelected ? ' card--selected' : ''}`}\n\n// ⚠️ template literal — fragile for 3+ dynamic classes\nclassName={`card--${status}${isSelected ? ' card--selected' : ''}${isLoading ? ' card--loading' : ''}`}\n\n// ✅ clsx — clean for any number of dynamic classes (Lesson 125)\nclassName={clsx(\n  `card--${status}`,\n  { 'card--selected': isSelected },\n  { 'card--loading': isLoading },\n  { 'card--error': isError },\n)}\n```\n- template literal: readable up to ~2 dynamic classes\n- clsx: the standard for 3+ or for complex conditional logic\n- both produce a className string — the difference is readability and safety",
    quickRules:
      "**Quick rules:**\n- ✅ template literal for 1-2 dynamic classes — readable and sufficient\n- ✅ clsx for 3+ dynamic classes — handles spacing, falsy skipping, arrays, objects\n- ❌ manual space management in long template literals — easy to miss, hard to review\n- ❌ string concatenation with `+` — harder to read than template literals\n- clsx is covered in Lesson 125 — for now, template literals are the foundation",
    watchOut:
      "👀 **Watch out:** `card--${status}${isSelected ? ' card--selected' : ''}` — note the leading space inside the ternary string: `' card--selected'`, not `'card--selected'`. The space is what separates the two class names. Forgetting it merges them into `card--activecard--selected` — a class name that matches no CSS rule.",
    dryRun:
      "🔁 **Think:** isSelected is false. The className expression is `\\`card--${status}${isSelected ? ' card--selected' : ''}\\``. status is 'active'. What is the final className string? Now the user clicks — isSelected becomes true. React re-renders. What is the className string now — and what does the browser receive?",
    build:
      "**Learning focus:** Derive className from state using a template literal — understanding that state changes trigger re-renders which re-evaluate the JSX expression, producing a new className string that React applies to the DOM.",
  },
},
{
  id: "step4",
  type: "question",
  phase: "Step 4 of 5",
  paal: "Update the onClick handler to toggle isSelected — clicking a selected card should deselect it, and clicking a deselected card should select it.",
  hint: "The setter can receive a function instead of a value. That function receives the current state and returns the next state. This is the functional update form — and it's the correct way to toggle.",
  example_code: `onClick={() => setIsOpen(prev => !prev)}`,
  think_prompt:
    "setIsSelected(true) always sets to true. But you need the opposite of whatever the current value is. How do you express 'flip the boolean' when the new value depends on the current one?",
  mc_options: [
    "onClick={() => setIsSelected(!isSelected)}",
    "onClick={() => setIsSelected(prev => !prev)}",
    "onClick={() => isSelected = !isSelected}",
  ],
  mc_correct_option: "onClick={() => setIsSelected(prev => !prev)}",
  mc_anchor:
    "The functional update form `setIsSelected(prev => !prev)` is correct because it always works regardless of batching or timing — React guarantees the `prev` argument is the most current state value. `setIsSelected(!isSelected)` reads from the closure — it captures `isSelected` at the time the handler was created, which can be stale in concurrent features or batched updates. Mutating `isSelected` directly with `=` is never valid — React won't detect the change and the UI won't update.",
  why_this_matters:
    "The functional update form is the safe way to update state that depends on the current value — toggles, counters, appending to arrays, removing from arrays. In simple components the closure form `!isSelected` usually works, but the functional form is the correct habit because it's always safe.",
  answer_keywords: ["setIsSelected", "prev", "=>", "!prev"],
  seed_code: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
}

const ShipmentCard = ({ shipmentId, destination, status }: ShipmentCardProps): JSX.Element => {
  const [isSelected, setIsSelected] = useState(false);
  return (
    <div
      className={\`card--\${status}\${isSelected ? ' card--selected' : ''}\`}
      onClick={() => setIsSelected(true)}
    >
      <p>{shipmentId}</p>
      <p>{destination}</p>
      <p>{status}</p>
    </div>
  );
};`,
  starter_code: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
}

const ShipmentCard = ({ shipmentId, destination, status }: ShipmentCardProps): JSX.Element => {
  const [isSelected, setIsSelected] = useState(false);
  return (
    <div
      className={\`card--\${status}\${isSelected ? ' card--selected' : ''}\`}
      // update onClick to toggle isSelected using the functional update form
      onClick={() => setIsSelected(true)}
    >
      <p>{shipmentId}</p>
      <p>{destination}</p>
      <p>{status}</p>
    </div>
  );
};`,
  feedback_correct:
    "Exactly — `prev => !prev` flips the boolean safely. React guarantees prev is the most current value, making this form correct even in concurrent or batched update scenarios.",
  feedback_partial:
    "Close — `setIsSelected(!isSelected)` works in simple components but reads from the closure which can be stale. The functional form `prev => !prev` is the correct habit for state that depends on its current value.",
  feedback_wrong:
    "The pattern: `onClick={() => setIsSelected(prev => !prev)}` — the functional update form passes a function to the setter. React calls that function with the current state and uses the return value as the next state.",
  expected: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
}

const ShipmentCard = ({ shipmentId, destination, status }: ShipmentCardProps): JSX.Element => {
  const [isSelected, setIsSelected] = useState(false);
  return (
    <div
      className={\`card--\${status}\${isSelected ? ' card--selected' : ''}\`}
      onClick={() => setIsSelected(prev => !prev)}
    >
      <p>{shipmentId}</p>
      <p>{destination}</p>
      <p>{status}</p>
    </div>
  );
};`,
  analog_example: `onClick={() => setIsExpanded(prev => !prev)}`,
  deepDiveLabel:
    "prev => !prev is safe — but why can the closure form !isSelected ever be stale?",
  deepDive: {
    hook: "You use `setIsSelected(!isSelected)` everywhere. It works perfectly in simple components. A colleague insists on `prev => !prev`. You think they're being pedantic.\n\nThen you build a component that calls setIsSelected twice in rapid succession — once in an event handler and once in a callback from an async operation that resolved. Both reads capture `isSelected = false`. Both compute `!false = true`. Both set true. The double-click that should have selected then deselected the card ends up selected.\n\nThe functional form would have given the second call `prev = true` — the value from the first update — and computed `!true = false`. The correct result.",
    pain: "⚠️ **Lesson:** You call `setIsSelected(!isSelected)` twice rapidly. Both reads capture `isSelected = false`. Both set `true`. The expected toggle behaviour (false → true → false) doesn't happen. Why does the closure form fail here — and why does `prev => !prev` work?",
    mentalModel:
      "**Mental model:** React batches state updates — and the closure captures a snapshot.\n- `isSelected` in the closure is the value from the last render. It doesn't update between two calls to the setter within the same event cycle.\n- The first `setIsSelected(!isSelected)` queues: set to `!false = true`.\n- The second `setIsSelected(!isSelected)` also reads `isSelected = false` (same snapshot) and queues: set to `!false = true` again.\n- Result: both updates set `true`. The second one overwrites the first with the same value.\n- `prev => !prev` avoids this: the first call queues `prev=false → true`. The second call gets `prev=true` (from the first update) and queues `true → false`. Both updates compose correctly.",
    discover:
      "**Pattern — closure vs functional update:**\n```tsx\n// ⚠️ closure form — works for single updates, can be stale in batching\nonClick={() => setCount(!isSelected)}\n\n// ✅ functional form — always safe, works correctly with batching\nonClick={() => setIsSelected(prev => !prev)}\n\n// Demonstrating the batching problem:\n// Both lines see isSelected = false and compute !false = true\nsetIsSelected(!isSelected); // queue: set to true\nsetIsSelected(!isSelected); // queue: set to true (same closure value!)\n// Result: true — not the expected toggle back to false\n\n// Functional form composes:\nsetIsSelected(prev => !prev); // queue: false → true\nsetIsSelected(prev => !prev); // queue: true → false (prev is the result of first update)\n// Result: false — correct\n```\n- closure form: reads from the last render's snapshot\n- functional form: receives the result of previous queued updates\n- for simple cases both work — functional form is the safe habit",
    quickRules:
      "**Quick rules:**\n- ✅ `setIsSelected(prev => !prev)` — functional form, always safe\n- ✅ `setCount(prev => prev + 1)` — functional form for counters\n- ⚠️ `setIsSelected(!isSelected)` — works in simple cases, can be stale in batching\n- ❌ `isSelected = !isSelected` — direct mutation, React never sees it\n- use functional form whenever the new state depends on the current state",
    watchOut:
      "👀 **Watch out:** The stale closure problem is most visible in async callbacks, event handlers that fire rapidly, or React's concurrent mode where renders can be interrupted and retried. In simple synchronous single-update scenarios, the closure form appears to work correctly — which is why the bug is subtle and easy to miss.",
    dryRun:
      "🔁 **Think:** isSelected is false. The handler is `onClick={() => setIsSelected(prev => !prev)}`. The user clicks once — walk through: what is prev, what does the function return, what is the next state? React re-renders. isSelected is now true. The user clicks again — walk through the same. What is the final state?",
    build:
      "**Learning focus:** Use the functional update form to toggle state — understanding that it receives the most current state value as its argument, making it safe even when multiple updates are batched or when the closure might be stale.",
  },
},
{
  id: "step5",
  type: "question",
  phase: "Step 5 of 5",
  paal: "Add a second state variable — selectedLabel — typed as string, initialised to 'None selected'. Update it to the shipmentId when the card is clicked.",
  hint: "Two separate useState calls for two independent pieces of state. TypeScript infers string from the initial value, so no explicit type argument needed.",
  example_code: `const [activeTab, setActiveTab] = useState('overview');`,
  think_prompt:
    "The component needs to track both a boolean selection state and a string label. These are two independent pieces of state — they change at different times and for different reasons. How do you add a second, completely independent state variable?",
  mc_options: [
    "const [isSelected, selectedLabel, setIsSelected, setSelectedLabel] = useState(false, 'None selected')",
    "const [isSelected, setIsSelected] = useState(false); const [selectedLabel, setSelectedLabel] = useState('None selected');",
    "const [state, setState] = useState({ isSelected: false, selectedLabel: 'None selected' })",
  ],
  mc_correct_option:
    "const [isSelected, setIsSelected] = useState(false); const [selectedLabel, setSelectedLabel] = useState('None selected');",
  mc_anchor:
    "Two separate useState calls is the correct pattern for two independent pieces of state. useState only accepts one initial value — you can't pass multiple values to one call. The object option (grouping into one useState) is a different pattern covered in Lesson 9 — it's appropriate when the values change together, not when they're independent.",
  why_this_matters:
    "Independent state variables are a core React principle — each useState manages one logical piece of state that changes independently. Mixing unrelated state into one object means every update re-creates the whole object, and changing one piece requires spreading the other. Separate calls keep them clean and independent.",
  answer_keywords: [
    "useState", "selectedLabel", "setSelectedLabel", "'None selected'", "string",
  ],
  seed_code: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
}

const ShipmentCard = ({ shipmentId, destination, status }: ShipmentCardProps): JSX.Element => {
  const [isSelected, setIsSelected] = useState(false);
  return (
    <div
      className={\`card--\${status}\${isSelected ? ' card--selected' : ''}\`}
      onClick={() => setIsSelected(prev => !prev)}
    >
      <p>{shipmentId}</p>
      <p>{destination}</p>
      <p>{status}</p>
    </div>
  );
};`,
  starter_code: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
}

const ShipmentCard = ({ shipmentId, destination, status }: ShipmentCardProps): JSX.Element => {
  const [isSelected, setIsSelected] = useState(false);
  // add selectedLabel state here, initialised to 'None selected'
  return (
    <div
      className={\`card--\${status}\${isSelected ? ' card--selected' : ''}\`}
      // update onClick to also set selectedLabel to shipmentId when clicked
      onClick={() => setIsSelected(prev => !prev)}
    >
      <p>{shipmentId}</p>
      <p>{destination}</p>
      <p>{status}</p>
      {/* render selectedLabel here */}
    </div>
  );
};`,
  feedback_correct:
    "Exactly — two separate useState calls for two independent state variables. TypeScript infers string from 'None selected'. Both setters are called in the onClick handler so both update on every click.",
  feedback_partial:
    "Close — check that selectedLabel is its own useState call (not grouped with isSelected) and that setSelectedLabel is called inside onClick alongside setIsSelected.",
  feedback_wrong:
    "Add `const [selectedLabel, setSelectedLabel] = useState('None selected')` as a second useState call. In onClick, call both setters: `setIsSelected(prev => !prev)` and `setSelectedLabel(shipmentId)`. Render `{selectedLabel}` in the JSX.",
  expected: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
}

const ShipmentCard = ({ shipmentId, destination, status }: ShipmentCardProps): JSX.Element => {
  const [isSelected, setIsSelected] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('None selected');
  return (
    <div
      className={\`card--\${status}\${isSelected ? ' card--selected' : ''}\`}
      onClick={() => {
        setIsSelected(prev => !prev);
        setSelectedLabel(shipmentId);
      }}
    >
      <p>{shipmentId}</p>
      <p>{destination}</p>
      <p>{status}</p>
      <p>{selectedLabel}</p>
    </div>
  );
};`,
  analog_example: `const [isOpen, setIsOpen] = useState(false);
const [activeRoute, setActiveRoute] = useState('');`,
  deepDiveLabel:
    "Two separate setters called in one handler — does React re-render twice?",
  deepDive: {
    hook: "You call `setIsSelected` and `setSelectedLabel` in the same onClick handler. You add a console.log at the top of the component to count renders. You click the card. One log. Not two.\n\nYou expected two re-renders — one per setState call. React gave you one. This is automatic batching — and understanding it changes how you think about state updates and performance.",
    pain: "⚠️ **Lesson:** You call two setters in the same event handler. You expect two re-renders — one per setState. React logs one render. Why does React batch these into a single render — and does that mean state is updated immediately when you call the setter?",
    mentalModel:
      "**Mental model:** React's event handlers run in a batch — all state updates inside one handler are collected and applied together in a single re-render.\n- Calling `setIsSelected` doesn't immediately re-render. React queues the update.\n- Calling `setSelectedLabel` queues another update.\n- After the handler finishes, React applies all queued updates, computes the new state, and re-renders once with both values updated.\n- This batching is automatic in React 18 for all updates — including those inside async functions, setTimeout, and Promise callbacks.\n- The practical consequence: state is NOT immediately updated after you call the setter. If you call `setIsSelected(true)` and then read `isSelected` on the very next line, you'll see the old value. The update takes effect on the next render.",
    discover:
      "**Pattern — batched updates:**\n```tsx\n// ✅ both setters called in same handler — one re-render\nonClick={() => {\n  setIsSelected(prev => !prev); // queued\n  setSelectedLabel(shipmentId); // queued\n  // React re-renders once with both updates applied\n}}\n\n// ✅ reading state after setter — stale until next render\nconst handleClick = () => {\n  setIsSelected(true);\n  console.log(isSelected); // still false! update hasn't applied yet\n  // React re-renders after handleClick returns — then isSelected is true\n};\n\n// ❌ expecting immediate state update\nsetIsSelected(true);\nif (isSelected) { ... } // isSelected is still false here\n```\n- React batches all updates within one event handler into a single re-render\n- state reads after a setter call return the old value until the next render\n- use the functional form `prev => !prev` when new state depends on current state\n- React 18 batches async updates too — this changed from React 17",
    quickRules:
      "**Quick rules:**\n- ✅ call multiple setters in one handler — React batches them, one re-render\n- ✅ functional update form when new state depends on current value\n- ❌ reading state immediately after calling setter — you get the old value\n- ❌ expecting synchronous state updates — they're asynchronous by design\n- React 18 batches all updates — event handlers, async, setTimeout — automatically",
    watchOut:
      "👀 **Watch out:** The batching behaviour is what makes the functional update form essential in some cases. If you call `setCount(!isSelected)` twice in the same handler, both reads capture the same snapshot. With `prev => !prev`, each update receives the result of the previous queued update.",
    dryRun:
      "🔁 **Think:** isSelected is false, selectedLabel is 'None selected'. The user clicks — both setters fire. React batches. After the re-render, what are the values of isSelected and selectedLabel? The user clicks again. isSelected goes through `prev => !prev`. What is it now? selectedLabel calls `setSelectedLabel(shipmentId)` again with the same shipmentId. What is it now?",
    build:
      "**Learning focus:** Declare multiple independent state variables with separate useState calls — understanding that React batches all updates within an event handler into a single re-render, and that state reads after a setter call return the value from the current render, not the queued update.",
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
  lessonNum: 12,
  title: "useState — Arrays",
  shortName: "HOOKS — ARRAY STATE",
});
