import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
{
  id: "intro",
  type: "reveal",
  phase: "Lesson",
  content: {
    tag: "LESSON #21 (React Styling)",
    title: "Conditional CSS Classes",
    body: "State and props drive what a component renders — they also drive how it looks. A selected card gets a highlight class. An urgent badge gets a red class. A disabled button gets an opacity class. Applying CSS classes conditionally based on component state is one of the most frequent operations in React UI code. In this lesson you'll master the patterns — from template literals to object notation — and know when to reach for the clsx utility.",
    usecase:
      "A shipment card in a dashboard changes appearance based on three independent states: whether it's selected (blue border), whether it's urgent (red badge), and whether it's loading (reduced opacity). All three apply independently and can combine. Getting the className expression right for all combinations is what this lesson is about.",
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
      lesson: 15,
      label: "Conditional Rendering",
      reason: "Complete Lesson 15 (Conditional Rendering) first — it is a prerequisite on the React-TS track for this lesson.",
    },
  ],
},
{
  id: "objectives",
  type: "objectives",
  phase: "Objectives",
  items: [
    "Apply a base class plus a conditional class using a template literal",
    "Combine multiple independent conditional classes in a readable expression",
    "Use the filter + join pattern for conditionally including classes from an array",
    "Understand when template literals become unwieldy and clsx is the right tool",
    "Apply conditional classes driven by both props and state simultaneously",
  ],
},
{
  id: "step1",
  type: "question",
  phase: "Step 1 of 5",
  paal: "Apply a base class 'card' to ShipmentCard's wrapper div, plus a conditional 'card--selected' class when isSelected is true.",
  hint: "Template literal with ternary: `className={\\`card${isSelected ? ' card--selected' : ''}\\`}`. Note the leading space inside the truthy string.",
  example_code: `<div className={\`panel\${isOpen ? ' panel--open' : ''}\`}>`,
  think_prompt:
    "The div always needs the 'card' base class. It conditionally needs 'card--selected'. How do you combine a static base class with a conditional modifier in one className expression?",
  mc_options: [
    "className={isSelected ? 'card card--selected' : 'card'}",
    "className={`card${isSelected ? ' card--selected' : ''}`}",
    "className='card' selected={isSelected}",
  ],
  mc_correct_option: "className={`card${isSelected ? ' card--selected' : ''}`}",
  mc_anchor:
    "The template literal approach keeps the base class non-duplicated — it appears once, and the modifier is appended conditionally. The first option also works but duplicates 'card' in both ternary branches — if the base class changes you must update two places. The `selected` attribute doesn't exist on HTML elements — className is the only styling mechanism in React.",
  why_this_matters:
    "The base + conditional modifier pattern is the foundation of BEM (Block Element Modifier) styling in React — the most widely used CSS architecture in enterprise apps. Understanding the template literal approach is the prerequisite for understanding clsx.",
  answer_keywords: ["className", "card", "isSelected", "card--selected", "template literal"],
  seed_code: `interface ShipmentCardProps {
  shipmentId: string;
  isSelected: boolean;
}`,
  starter_code: `interface ShipmentCardProps {
  shipmentId: string;
  isSelected: boolean;
}

const ShipmentCard = ({ shipmentId, isSelected }: ShipmentCardProps): JSX.Element => {
  return (
    // apply 'card' always, 'card--selected' when isSelected
    <div>
      <p>{shipmentId}</p>
    </div>
  );
};`,
  feedback_correct:
    "Exactly — the base class is always present, the modifier appends conditionally. When isSelected is false, className is 'card'. When true, it's 'card card--selected'.",
  feedback_partial:
    "Close — check for the leading space inside the truthy string: `' card--selected'`, not `'card--selected'`. Without the space, classes merge into 'cardcard--selected'.",
  feedback_wrong:
    "Use: `className={\\`card${isSelected ? ' card--selected' : ''}\\`}` — note the leading space in the truthy branch to separate the classes.",
  expected: `interface ShipmentCardProps {
  shipmentId: string;
  isSelected: boolean;
}

const ShipmentCard = ({ shipmentId, isSelected }: ShipmentCardProps): JSX.Element => {
  return (
    <div className={\`card\${isSelected ? ' card--selected' : ''}\`}>
      <p>{shipmentId}</p>
    </div>
  );
};`,
  analog_example: `<li className={\`tab\${isActive ? ' tab--active' : ''}\`}>{label}</li>`,
  deepDiveLabel:
    "Template literal works for one modifier — what happens when you need three?",
  deepDive: {
    hook: "One conditional class is clean. Then: `card${isSelected ? ' card--selected' : ''}${isUrgent ? ' card--urgent' : ''}${isLoading ? ' card--loading' : ''}`. Three modifiers. The expression wraps. A space gets forgotten. 'card--selectedcard--urgent' appears in the DOM.",
    pain: "⚠️ **Lesson:** Template literals for conditional classes scale poorly past 2-3 modifiers. What's the systematic alternative — and what library does the React ecosystem use for this?",
    mentalModel:
      "**clsx** (or its predecessor classnames) is the standard solution:\n```tsx\nimport clsx from 'clsx';\n\nclassName={clsx(\n  'card',                              // always\n  isSelected && 'card--selected',      // conditional\n  isUrgent && 'card--urgent',          // conditional\n  isLoading && 'card--loading',        // conditional\n  `card--${status}`,                   // dynamic\n)}\n```\nclsx handles: spacing between classes, falsy value skipping, arrays, objects. You never manually manage spaces again.",
    discover:
      "```tsx\n// ✅ template literal — 1-2 conditions\nclassName={`card${isSelected ? ' card--selected' : ''}`}\n\n// ✅ filter+join — 3+ conditions without a library\nconst classes = ['card', isSelected && 'card--selected', isUrgent && 'card--urgent']\n  .filter(Boolean).join(' ');\n\n// ✅ clsx — 3+ conditions, industry standard\nimport clsx from 'clsx';\nclassName={clsx('card', isSelected && 'card--selected', isUrgent && 'card--urgent')}\n```",
    quickRules:
      "- ✅ template literal: 1-2 conditions, clear intent\n- ✅ filter+join: 3+ conditions without adding a dependency\n- ✅ clsx: 3+ conditions, the industry standard\n- ❌ long template literals with 4+ ternaries — error-prone\n- clsx is ~500 bytes, zero dependencies, worth adding for any project with conditional styling",
    watchOut:
      "👀 **Watch out:** clsx accepts `false`, `null`, `undefined`, and `0` as values to skip — they produce no class name. `clsx('card', false, null, 'card--selected')` produces `'card card--selected'`. This is what makes `condition && 'class-name'` safe — when condition is false, clsx skips it.",
    dryRun:
      "🔁 **Think:** `clsx('card', isSelected && 'card--selected', isUrgent && 'card--urgent')` where isSelected is true and isUrgent is false. Walk through each argument: what does clsx receive for each? What is the final className string?",
    build:
      "**Learning focus:** Apply a base class plus a conditional modifier — knowing the template literal pattern and when to reach for clsx.",
  },
},
{
  id: "step2",
  type: "question",
  phase: "Step 2 of 5",
  paal: "Add two more conditional classes: 'card--urgent' when isUrgent is true, and 'card--loading' when isLoading is true. Keep all three conditions in one className expression.",
  hint: "Extend the template literal with two more ternaries — or switch to the filter+join pattern for cleaner multi-condition handling.",
  example_code: `const classes = [
  'card',
  isSelected && 'card--selected',
  isUrgent && 'card--urgent',
  isLoading && 'card--loading',
].filter(Boolean).join(' ');`,
  think_prompt:
    "Three independent conditions, each adding its own class. Template literal with three ternaries works but gets long. What's the filter+join alternative — and why is it more readable for multiple conditions?",
  mc_options: [
    "className={`card${isSelected ? ' card--selected' : ''}${isUrgent ? ' card--urgent' : ''}${isLoading ? ' card--loading' : ''}`}",
    "const classes = ['card', isSelected && 'card--selected', isUrgent && 'card--urgent', isLoading && 'card--loading'].filter(Boolean).join(' '); // then className={classes}",
    "className={`card ${isSelected} ${isUrgent} ${isLoading}`}",
  ],
  mc_correct_option:
    "const classes = ['card', isSelected && 'card--selected', isUrgent && 'card--urgent', isLoading && 'card--loading'].filter(Boolean).join(' '); // then className={classes}",
  mc_anchor:
    "The filter+join pattern is more readable for 3+ conditions — each entry is on its own line, the array structure makes it clear which classes are conditional, and filter(Boolean) removes falsy values cleanly. The template literal option also works but is harder to read and space-manage. The third option renders 'card true false true' — booleans don't become class names.",
  why_this_matters:
    "Multi-condition className derivation is extremely common in enterprise React — interactive tables, card states, form field validation states. The filter+join pattern is the pre-clsx standard and still useful when adding a library isn't an option.",
  answer_keywords: [
    "card", "isSelected", "card--selected", "isUrgent", "card--urgent",
    "isLoading", "card--loading", "filter", "Boolean", "join",
  ],
  seed_code: `interface ShipmentCardProps {
  shipmentId: string;
  isSelected: boolean;
  isUrgent: boolean;
  isLoading: boolean;
}

const ShipmentCard = ({ shipmentId, isSelected, isUrgent, isLoading }: ShipmentCardProps): JSX.Element => {
  return (
    <div className={\`card\${isSelected ? ' card--selected' : ''}\`}>
      <p>{shipmentId}</p>
    </div>
  );
};`,
  starter_code: `interface ShipmentCardProps {
  shipmentId: string;
  isSelected: boolean;
  isUrgent: boolean;
  isLoading: boolean;
}

const ShipmentCard = ({ shipmentId, isSelected, isUrgent, isLoading }: ShipmentCardProps): JSX.Element => {
  // compute classes using filter+join pattern
  // include: 'card' always, 'card--selected' when isSelected,
  //          'card--urgent' when isUrgent, 'card--loading' when isLoading

  return (
    <div className={/* use classes variable */}>
      <p>{shipmentId}</p>
    </div>
  );
};`,
  feedback_correct:
    "Exactly — the filter+join pattern keeps each condition on its own line. filter(Boolean) removes false values. join(' ') produces a space-separated class string. All three modifiers combine correctly.",
  feedback_partial:
    "Close — make sure you're using `.filter(Boolean)` (not `.filter(c => c)`) and `.join(' ')` with a space. Also ensure the base class 'card' is always included as the first array element.",
  feedback_wrong:
    "Build the array: `['card', isSelected && 'card--selected', isUrgent && 'card--urgent', isLoading && 'card--loading']`. Chain `.filter(Boolean).join(' ')`. Assign to `const classes` before the return.",
  expected: `interface ShipmentCardProps {
  shipmentId: string;
  isSelected: boolean;
  isUrgent: boolean;
  isLoading: boolean;
}

const ShipmentCard = ({ shipmentId, isSelected, isUrgent, isLoading }: ShipmentCardProps): JSX.Element => {
  const classes = [
    'card',
    isSelected && 'card--selected',
    isUrgent && 'card--urgent',
    isLoading && 'card--loading',
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <p>{shipmentId}</p>
    </div>
  );
};`,
  analog_example: `const rowClasses = [
  'table-row',
  isSelected && 'table-row--selected',
  hasError && 'table-row--error',
].filter(Boolean).join(' ');`,
  deepDiveLabel:
    "filter(Boolean) removes falsy values — but what exactly does it remove?",
  deepDive: {
    hook: "The array contains `false`, `undefined`, and strings. `filter(Boolean)` removes some of them. You're confident it's correct — but a colleague asks exactly which values get filtered out. You say 'falsy values' and they ask for the precise list.",
    pain: "⚠️ **Lesson:** `filter(Boolean)` removes falsy values from the array. What are all the falsy values in JavaScript — and are any of them values you might accidentally include as a class name?",
    mentalModel:
      "JavaScript's falsy values: `false`, `0`, `''` (empty string), `null`, `undefined`, `NaN`.\n\nFor className arrays:\n- `false` — from `condition && 'class'` when condition is false ✅ safe to filter\n- `undefined` — from optional chaining or unset variables ✅ safe to filter\n- `null` — from nullable variables ✅ safe to filter\n- `''` — empty string ✅ safe to filter (empty class is meaningless)\n- `0` — the 0 rendering bug! In className arrays, `0` would be stringified to '0' — not a valid class name. Using `Boolean` as the filter predicate removes 0 safely.\n- `NaN` — from invalid computations ✅ safe to filter\n\nAll falsy values are safe to filter from className arrays. `filter(Boolean)` is correct.",
    discover:
      "```tsx\n// Safe: all falsy values are correctly removed\n['card', false, undefined, null, '', 0, 'card--selected']\n  .filter(Boolean)\n  .join(' ')\n// Result: 'card card--selected'\n\n// Note: filter(Boolean) is typed as filter((x): x is string => Boolean(x))\n// TypeScript may need explicit type assertion in strict mode:\n.filter((c): c is string => Boolean(c))\n```",
    quickRules:
      "- ✅ `filter(Boolean)` — removes all falsy values, correct for className arrays\n- ✅ `filter((c): c is string => Boolean(c))` — TypeScript-safe version\n- ✅ all falsy values (false, null, undefined, 0, '') are safe to filter from className arrays\n- ❌ filtering with `filter(c => c !== false)` — misses null and undefined",
    watchOut:
      "👀 **Watch out:** TypeScript in strict mode may type the array as `(string | false | undefined)[]` and infer the filtered type incorrectly. Use the type predicate form `(c): c is string => Boolean(c)` to tell TypeScript the array only contains strings after filtering.",
    dryRun:
      "🔁 **Think:** isSelected is false, isUrgent is true, isLoading is false. The array is `['card', false, 'card--urgent', false]`. Walk through filter(Boolean): which elements pass? What does join(' ') produce?",
    build:
      "**Learning focus:** Use the filter+join pattern for multiple conditional classes — understanding exactly what filter(Boolean) removes and why it's safe for className arrays.",
  },
},
{
  id: "step3",
  type: "question",
  phase: "Step 3 of 5",
  paal: "Add a dynamic status class derived from the status prop — 'card--active', 'card--delayed', or 'card--delivered' — alongside the existing conditional classes.",
  hint: "Dynamic classes from a union value use a template literal: `\\`card--${status}\\``. Add it to the existing classes array alongside the conditional entries.",
  example_code: `const classes = [
  'card',
  \`card--\${status}\`,      // always present, varies with status
  isSelected && 'card--selected',
].filter(Boolean).join(' ');`,
  think_prompt:
    "The status class is always present — it's not conditional, it just changes value. How does it fit into the filter+join pattern alongside the truly conditional classes?",
  mc_options: [
    "Add `status === 'active' ? 'card--active' : status === 'delayed' ? 'card--delayed' : 'card--delivered'` to the array",
    "Add `` `card--${status}` `` to the array — it's always truthy since status is always a string",
    "Filter by status separately: if (status) classes.push(`card--${status}`)",
  ],
  mc_correct_option:
    "Add `` `card--${status}` `` to the array — it's always truthy since status is always a string",
  mc_anchor:
    "A template literal like `card--${status}` produces a non-empty string for any ShipmentStatus value — it's always truthy, so filter(Boolean) never removes it. The ternary chain also works but is verbose. The imperative push approach works but abandons the declarative filter+join pattern.",
  why_this_matters:
    "Mixing dynamic (always present, value changes) and conditional (may or may not be present) classes in one expression is extremely common — a card has a dynamic status class AND conditional selected/loading classes. The filter+join pattern handles both cleanly in one array.",
  answer_keywords: [
    "card--", "status", "template literal", "filter", "join",
    "isSelected", "card--selected",
  ],
  seed_code: `type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  status: ShipmentStatus;
  isSelected: boolean;
  isLoading: boolean;
}

const ShipmentCard = ({ shipmentId, status, isSelected, isLoading }: ShipmentCardProps): JSX.Element => {
  const classes = [
    'card',
    isSelected && 'card--selected',
    isLoading && 'card--loading',
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <p>{shipmentId}</p>
    </div>
  );
};`,
  starter_code: `type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  status: ShipmentStatus;
  isSelected: boolean;
  isLoading: boolean;
}

const ShipmentCard = ({ shipmentId, status, isSelected, isLoading }: ShipmentCardProps): JSX.Element => {
  const classes = [
    'card',
    // add the dynamic status class here
    isSelected && 'card--selected',
    isLoading && 'card--loading',
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <p>{shipmentId}</p>
    </div>
  );
};`,
  feedback_correct:
    "Exactly — the template literal produces a non-empty string for any status value, so it's always included. Dynamic and conditional classes coexist cleanly in the same array.",
  feedback_partial:
    "Close — the status class should be a template literal `` `card--${status}` ``, always present in the array. It's not conditional — it always has a value.",
  feedback_wrong:
    "Add `` `card--${status}` `` to the classes array between 'card' and the conditional entries. Since status is always a ShipmentStatus string, the template literal always produces a truthy value.",
  expected: `type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  status: ShipmentStatus;
  isSelected: boolean;
  isLoading: boolean;
}

const ShipmentCard = ({ shipmentId, status, isSelected, isLoading }: ShipmentCardProps): JSX.Element => {
  const classes = [
    'card',
    \`card--\${status}\`,
    isSelected && 'card--selected',
    isLoading && 'card--loading',
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <p>{shipmentId}</p>
    </div>
  );
};`,
  analog_example: `const rowClasses = [
  'row',
  \`row--\${variant}\`,
  isHighlighted && 'row--highlighted',
].filter(Boolean).join(' ');`,
  deepDiveLabel:
    "Dynamic + conditional classes in one array — how does clsx express the same thing?",
  deepDive: {
    hook: "Your filter+join array works. A new project uses clsx. The reviewer asks you to convert. You want to verify you understand the clsx API before rewriting.",
    pain: "⚠️ **Lesson:** What is the clsx equivalent of the filter+join pattern — and how does clsx handle both dynamic (always present) and conditional (maybe present) classes?",
    mentalModel:
      "clsx accepts strings, template literals, boolean&&string, objects, and arrays — all in one call:\n```tsx\nimport clsx from 'clsx';\n\nclassName={clsx(\n  'card',                         // always\n  `card--${status}`,              // always, dynamic value\n  isSelected && 'card--selected', // conditional\n  isLoading && 'card--loading',   // conditional\n)}\n\n// Object syntax (alternative for conditionals):\nclassName={clsx(\n  'card',\n  `card--${status}`,\n  { 'card--selected': isSelected, 'card--loading': isLoading }\n)}\n```",
    discover:
      "```tsx\n// ✅ filter+join — no dependency\nconst classes = ['card', `card--${status}`, isSelected && 'card--selected']\n  .filter(Boolean).join(' ');\n\n// ✅ clsx — cleaner, more features\nimport clsx from 'clsx';\nconst classes = clsx('card', `card--${status}`, isSelected && 'card--selected');\n\n// Both produce the same output\n```",
    quickRules:
      "- ✅ filter+join: no extra dependency, works anywhere\n- ✅ clsx: cleaner syntax, supports objects and arrays, ~500 bytes\n- ✅ clsx object syntax: `{ 'class': condition }` — good for many conditions\n- ❌ clsx string parsing: don't put multiple classes in one string argument\n- choose one pattern per project and be consistent",
    watchOut:
      "👀 **Watch out:** clsx does NOT parse space-separated class strings — `clsx('card card--selected')` produces `'card card--selected'` as a single argument, not two classes. Always pass one class per argument (or use the object/array syntax).",
    dryRun:
      "🔁 **Think:** `clsx('card', \\`card--${status}\\`, isSelected && 'card--selected', false, null, 'card--loading')` where status is 'delayed', isSelected is true. What is the output string?",
    build:
      "**Learning focus:** Combine dynamic and conditional classes in one array — and understand how clsx expresses the same pattern more cleanly.",
  },
},
{
  id: "step4",
  type: "question",
  phase: "Step 4 of 5",
  paal: "Extract the className computation into a pure function getCardClasses that accepts the props and returns the className string. Call it inside the component.",
  hint: "A pure function that takes the relevant booleans/values and returns a string. Define it outside the component — it's a utility with no side effects.",
  example_code: `const getRowClasses = (isSelected: boolean, variant: string): string => [
  'row',
  \`row--\${variant}\`,
  isSelected && 'row--selected',
].filter(Boolean).join(' ');`,
  think_prompt:
    "Extracting className logic to a pure function makes it independently testable — you can write a unit test for getCardClasses without mounting the component. Where should the function be defined — inside or outside the component?",
  mc_options: [
    "Inside the component as a const — it needs access to the props",
    "Outside the component as a pure function — it receives what it needs as parameters",
    "As a class method — className logic belongs on a class",
  ],
  mc_correct_option:
    "Outside the component as a pure function — it receives what it needs as parameters",
  mc_anchor:
    "A pure function outside the component: defined once, stable reference, independently testable. It doesn't need closure access to props — it receives them as parameters. Inside the component would work but creates a new function reference on every render. A class method is the wrong paradigm for functional React.",
  why_this_matters:
    "Extracting className computation to a pure function is the bridge between 'className logic in the component' and 'className logic in a test file'. A function that takes (isSelected, isUrgent, isLoading, status) and returns a string can be unit tested without React — and this pattern scales to complex styling logic in design system components.",
  answer_keywords: [
    "getCardClasses", "isSelected", "isLoading", "status", "string",
    "filter", "Boolean", "join",
  ],
  seed_code: `type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  status: ShipmentStatus;
  isSelected: boolean;
  isLoading: boolean;
}

const ShipmentCard = ({ shipmentId, status, isSelected, isLoading }: ShipmentCardProps): JSX.Element => {
  const classes = [
    'card',
    \`card--\${status}\`,
    isSelected && 'card--selected',
    isLoading && 'card--loading',
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <p>{shipmentId}</p>
    </div>
  );
};`,
  starter_code: `type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  status: ShipmentStatus;
  isSelected: boolean;
  isLoading: boolean;
}

// extract getCardClasses pure function here — outside the component
// parameters: status, isSelected, isLoading
// returns: string

const ShipmentCard = ({ shipmentId, status, isSelected, isLoading }: ShipmentCardProps): JSX.Element => {
  // call getCardClasses here

  return (
    <div className={/* className from getCardClasses */}>
      <p>{shipmentId}</p>
    </div>
  );
};`,
  feedback_correct:
    "Exactly — getCardClasses is a pure function outside the component, accepting only what it needs as parameters. It can be tested independently: `expect(getCardClasses('active', true, false)).toBe('card card--active card--selected')`.",
  feedback_partial:
    "Close — make sure getCardClasses is defined outside the component (not inside as a const) and accepts its inputs as explicit parameters rather than reading from closure.",
  feedback_wrong:
    "Define `const getCardClasses = (status: ShipmentStatus, isSelected: boolean, isLoading: boolean): string => ['card', \\`card--${status}\\`, isSelected && 'card--selected', isLoading && 'card--loading'].filter(Boolean).join(' ')` outside the component. Call it with `getCardClasses(status, isSelected, isLoading)`.",
  expected: `type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  status: ShipmentStatus;
  isSelected: boolean;
  isLoading: boolean;
}

const getCardClasses = (
  status: ShipmentStatus,
  isSelected: boolean,
  isLoading: boolean,
): string => [
  'card',
  \`card--\${status}\`,
  isSelected && 'card--selected',
  isLoading && 'card--loading',
].filter(Boolean).join(' ');

const ShipmentCard = ({ shipmentId, status, isSelected, isLoading }: ShipmentCardProps): JSX.Element => {
  const className = getCardClasses(status, isSelected, isLoading);

  return (
    <div className={className}>
      <p>{shipmentId}</p>
    </div>
  );
};`,
  analog_example: `const getButtonClasses = (variant: ButtonVariant, isDisabled: boolean): string => [
  'btn',
  \`btn--\${variant}\`,
  isDisabled && 'btn--disabled',
].filter(Boolean).join(' ');`,
  deepDiveLabel:
    "Pure function for className — but is this worth it for simple cases?",
  deepDive: {
    hook: "getCardClasses is three lines of logic. Extracting it is eight lines total (function declaration + call). A colleague says 'this is over-engineered for three conditional classes'. When is extraction worth it?",
    pain: "⚠️ **Lesson:** At what complexity does extracting className logic to a pure function pay off — and what test would you write for getCardClasses?",
    mentalModel:
      "**Extract when**:\n- The logic has multiple conditions that interact in non-obvious ways\n- You want to unit test the class logic without mounting the component\n- The same className logic appears in multiple components\n- The function is more than 2-3 array entries\n\n**Keep inline when**:\n- One or two conditions, obviously correct\n- No reuse, no test value\n\n**Unit test for getCardClasses**:\n```tsx\n// Pure function test — no React, no rendering\nexpect(getCardClasses('active', false, false)).toBe('card card--active');\nexpect(getCardClasses('delayed', true, false)).toBe('card card--delayed card--selected');\nexpect(getCardClasses('delivered', true, true)).toBe('card card--delivered card--selected card--loading');\n```",
    discover:
      "```tsx\n// Worth extracting:\nconst getCardClasses = (status, isSelected, isLoading) => [\n  'card', `card--${status}`, isSelected && 'card--selected', isLoading && 'card--loading'\n].filter(Boolean).join(' ');\n\n// Too simple to extract:\nconst isActive = isOpen ? 'menu--open' : '';\n```",
    quickRules:
      "- ✅ extract: 3+ conditions, reused logic, test value\n- ✅ keep inline: 1-2 conditions, single use, obviously correct\n- ✅ pure function test: no React, fast, focused\n- ❌ extracting for the sake of extraction — adds indirection without value",
    watchOut:
      "👀 **Watch out:** TypeScript may infer the return type as `(string | false)[]` before filter. Add `: string` as the explicit return type annotation to ensure the function signature is clear.",
    dryRun:
      "🔁 **Think:** Write the three unit test cases for getCardClasses: (1) active, not selected, not loading; (2) delayed, selected, not loading; (3) delivered, selected, loading. What strings do you expect?",
    build:
      "**Learning focus:** Extract className computation to a pure function — understanding when extraction adds value and how pure functions enable unit testing of styling logic.",
  },
},
{
  id: "step5",
  type: "question",
  phase: "Step 5 of 5",
  paal: "Apply conditional classes driven simultaneously by both state and props. Add isSelected state to ShipmentCard. The className should reflect both the isUrgent prop and the isSelected state.",
  hint: "State and props are both accessible inside the component body. Use both in the getCardClasses call — or directly in the filter+join array.",
  example_code: `const [isSelected, setIsSelected] = useState(false);

const classes = [
  'card',
  isUrgent && 'card--urgent',      // from props
  isSelected && 'card--selected',   // from state
].filter(Boolean).join(' ');`,
  think_prompt:
    "isUrgent comes from props, isSelected comes from state. Both affect className. How do you combine them — and does the source (prop vs state) matter to the className logic?",
  mc_options: [
    "Apply prop-derived classes in JSX and state-derived classes in a useEffect",
    "Combine both in one getCardClasses call — source doesn't matter, both are just booleans",
    "Store isUrgent in state so both are in state before computing classes",
  ],
  mc_correct_option:
    "Combine both in one getCardClasses call — source doesn't matter, both are just booleans",
  mc_anchor:
    "From the className function's perspective, isUrgent and isSelected are both booleans — where they come from (prop or state) is irrelevant. They're just values the function receives. Using useEffect to sync a prop to state is the anti-pattern from Lesson 8 — it causes an extra render and creates two sources of truth.",
  why_this_matters:
    "The className function treats props and state uniformly — both are just values. This is how well-designed React components work: state and props flow into pure functions that compute outputs (JSX, classNames, derived values). The function doesn't care which bucket a value comes from.",
  answer_keywords: [
    "isUrgent", "isSelected", "useState", "getCardClasses",
    "card--urgent", "card--selected",
  ],
  seed_code: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  status: ShipmentStatus;
  isUrgent: boolean;
}

const getCardClasses = (
  status: ShipmentStatus,
  isUrgent: boolean,
  isSelected: boolean,
): string => [
  'card',
  \`card--\${status}\`,
  isUrgent && 'card--urgent',
  isSelected && 'card--selected',
].filter(Boolean).join(' ');`,
  starter_code: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  status: ShipmentStatus;
  isUrgent: boolean;
}

const getCardClasses = (
  status: ShipmentStatus,
  isUrgent: boolean,
  isSelected: boolean,
): string => [
  'card',
  \`card--\${status}\`,
  isUrgent && 'card--urgent',
  isSelected && 'card--selected',
].filter(Boolean).join(' ');

const ShipmentCard = ({ shipmentId, status, isUrgent }: ShipmentCardProps): JSX.Element => {
  // add isSelected state here

  // call getCardClasses with status, isUrgent (prop), and isSelected (state)

  return (
    <div className={/* result of getCardClasses */} onClick={() => {/* toggle isSelected */}}>
      <p>{shipmentId}</p>
    </div>
  );
};`,
  feedback_correct:
    "Exactly — getCardClasses receives both the prop (isUrgent) and the state (isSelected) as plain booleans. Clicking toggles isSelected, the className recomputes, the component re-renders with the new class combination.",
  feedback_partial:
    "Close — make sure you're passing both `isUrgent` (from props) and `isSelected` (from state) to getCardClasses. Also wire the onClick to toggle isSelected.",
  feedback_wrong:
    "Add `const [isSelected, setIsSelected] = useState(false)`. Call `const className = getCardClasses(status, isUrgent, isSelected)`. Wire `onClick={() => setIsSelected(prev => !prev)}` on the div.",
  expected: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  status: ShipmentStatus;
  isUrgent: boolean;
}

const getCardClasses = (
  status: ShipmentStatus,
  isUrgent: boolean,
  isSelected: boolean,
): string => [
  'card',
  \`card--\${status}\`,
  isUrgent && 'card--urgent',
  isSelected && 'card--selected',
].filter(Boolean).join(' ');

const ShipmentCard = ({ shipmentId, status, isUrgent }: ShipmentCardProps): JSX.Element => {
  const [isSelected, setIsSelected] = useState(false);
  const className = getCardClasses(status, isUrgent, isSelected);

  return (
    <div className={className} onClick={() => setIsSelected(prev => !prev)}>
      <p>{shipmentId}</p>
    </div>
  );
};`,
  analog_example: `const btnClass = getBtnClasses(variant, isDisabled, isActive);
// variant: prop, isDisabled: prop, isActive: state`,
  deepDiveLabel:
    "State + props both feed className — what about className driven by context or a theme?",
  deepDive: {
    hook: "isUrgent is a prop, isSelected is state. Then the app adds a dark mode toggle — a theme value from React context. The card should apply 'card--dark' when dark mode is active. Now className depends on props, state, AND context. Does the pattern break?",
    pain: "⚠️ **Lesson:** className can be driven by props, state, and context. How does the pure function pattern extend to include a third source — and does adding context as a source require any architectural change?",
    mentalModel:
      "The pure function doesn't care where the value comes from — it only cares about the values it receives. Reading from context inside the component is just another way to get a value:\n```tsx\nconst { theme } = useTheme(); // from context\nconst [isSelected, setIsSelected] = useState(false); // state\n// isUrgent from props\n\nconst className = getCardClasses(status, isUrgent, isSelected, theme);\n```\n\ngetCardClasses receives a theme parameter. It applies 'card--dark' when theme is 'dark'. The function signature grows, but the pattern is identical.",
    discover:
      "```tsx\n// ✅ extended to include context value\nconst getCardClasses = (\n  status: ShipmentStatus,\n  isUrgent: boolean,\n  isSelected: boolean,\n  theme: 'light' | 'dark',\n): string => [\n  'card',\n  `card--${status}`,\n  `card--theme-${theme}`,\n  isUrgent && 'card--urgent',\n  isSelected && 'card--selected',\n].filter(Boolean).join(' ');\n```",
    quickRules:
      "- ✅ pure function accepts values from any source — props, state, context, derived\n- ✅ the function doesn't know or care about the source\n- ✅ context value is read in the component, passed to the function as a parameter\n- ❌ reading context inside the pure function — couples styling to React, breaks testability",
    watchOut:
      "👀 **Watch out:** If you read context inside getCardClasses (using useTheme() inside the function), you've made it a hook — hooks can't be called from plain functions. Keep pure functions pure: read context in the component, pass values as parameters.",
    dryRun:
      "🔁 **Think:** getCardClasses now takes theme as a fourth parameter. The component reads theme from context: `const { theme } = useTheme()`. What does the getCardClasses call look like — and what is the className when status is 'active', isUrgent is true, isSelected is false, theme is 'dark'?",
    build:
      "**Learning focus:** Combine prop-driven and state-driven conditional classes in one pure function — understanding that the function treats all values uniformly regardless of whether they come from props, state, or context.",
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
  lessonNum: 21,
  title: "Conditional CSS Classes",
  shortName: "STYLING — CONDITIONAL CSS",
});
