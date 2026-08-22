import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
{
  id: "intro",
  type: "reveal",
  phase: "Lesson",
  content: {
    tag: "LESSON #19 (React Patterns)",
    title: "Event Handling — Keyboard + Focus",
    body: "Not every part of a UI is always visible. An error banner shows only when something goes wrong. A loading spinner shows only during data fetch. A detail panel shows only when an item is selected. Conditional rendering is how React components decide what to display based on state, props, or computed values — and getting the patterns right keeps your JSX clean and your UI correct.",
    usecase:
      "A shipment card on a logistics dashboard might show an urgent warning badge, a loading overlay, or a 'selected' highlight — each in a different state. All three conditions are possible simultaneously, independently, or not at all. Conditional rendering is what makes a single component serve all those cases without duplicating markup.",
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
      lesson: 13,
      label: "Controlled Inputs",
      reason: "Complete Lesson 13 (Controlled Inputs) first — it is a prerequisite on the React-TS track for this lesson.",
    },
    {
      lesson: 18,
      label: "Event Handling — Input + Form",
      reason: "Complete Lesson 18 (Event Handling — Input + Form) first — it is a prerequisite on the React-TS track for this lesson.",
    },
  ],
},
{
  id: "objectives",
  type: "objectives",
  phase: "Objectives",
  items: [
    "Conditionally render JSX using the && short-circuit operator",
    "Conditionally render one of two elements using the ternary operator",
    "Return null from a component to render nothing at all",
    "Understand which values React renders as nothing (null, undefined, false)",
    "Avoid the 0 rendering bug when using && with numeric values",
  ],
},
{
  id: "step1",
  type: "question",
  phase: "Step 1 of 5",
  paal: "Render an urgent warning badge inside ShipmentCard — but only when the isUrgent prop is true.",
  hint: "Use the && operator. When isUrgent is true, && evaluates and returns the right side. When false, it short-circuits and returns false — which React renders as nothing.",
  example_code: `{hasAlert && <span className="badge--alert">Alert</span>}`,
  think_prompt:
    "isUrgent is a boolean prop. The badge should appear when true and disappear when false. What JSX pattern conditionally renders an element based on a boolean?",
  mc_options: [
    "{isUrgent ? <span className='badge--urgent'>Urgent</span> : null}",
    "{isUrgent && <span className='badge--urgent'>Urgent</span>}",
    "{isUrgent == true && <span className='badge--urgent'>Urgent</span>}",
  ],
  mc_correct_option: "{isUrgent && <span className='badge--urgent'>Urgent</span>}",
  mc_anchor:
    "The && pattern is the standard for 'show this element only when this condition is true'. When isUrgent is false, && returns false and React renders nothing. The ternary version also works but the explicit null is unnecessary — && is the cleaner idiom for 'show or nothing'. The `== true` comparison is redundant — isUrgent is already a boolean.",
  why_this_matters:
    "The && pattern for conditional rendering appears in virtually every React component that has state-dependent UI. Warning badges, empty states, loading indicators, expanded panels — all use this pattern. Recognising it as the standard for 'show or hide' is foundational.",
  answer_keywords: ["isUrgent", "&&", "badge--urgent", "Urgent"],
  seed_code: `type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  status: ShipmentStatus;
  isUrgent: boolean;
}`,
  starter_code: `type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  status: ShipmentStatus;
  isUrgent: boolean;
}

const ShipmentCard = ({ shipmentId, status, isUrgent }: ShipmentCardProps): JSX.Element => {
  return (
    <div className={\`card--\${status}\`}>
      <p>{shipmentId}</p>
      {/* render urgent badge here when isUrgent is true */}
    </div>
  );
};`,
  feedback_correct:
    "Exactly — when isUrgent is true, the span renders. When false, && short-circuits and React renders nothing in that position.",
  feedback_partial:
    "Close — the && pattern is `{isUrgent && <span>...</span>}`. The ternary works too, but the null branch is unnecessary when there's nothing to show in the false case.",
  feedback_wrong:
    "The pattern: `{isUrgent && <span className='badge--urgent'>Urgent</span>}` — && returns the right operand when left is truthy, and the left operand (false) when it's falsy. React renders false as nothing.",
  expected: `type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  status: ShipmentStatus;
  isUrgent: boolean;
}

const ShipmentCard = ({ shipmentId, status, isUrgent }: ShipmentCardProps): JSX.Element => {
  return (
    <div className={\`card--\${status}\`}>
      <p>{shipmentId}</p>
      {isUrgent && <span className="badge--urgent">Urgent</span>}
    </div>
  );
};`,
  analog_example: `{hasDiscount && <span className="badge--sale">Sale</span>}`,
  deepDiveLabel: "false renders nothing — but why does 0 render as text?",
  deepDive: {
    hook: "You use && everywhere for conditional rendering. It works perfectly for booleans. Then a component receives an itemCount prop typed as number. You write `{itemCount && <span>{itemCount} items</span>}`. With count 5, the span renders. With count 0, you expect nothing. Instead, a lone '0' appears on screen.",
    pain: "⚠️ **Lesson:** `{itemCount && <span>{itemCount} items</span>}` renders the digit 0 when itemCount is 0. `{isUrgent && <span>Urgent</span>}` renders nothing when isUrgent is false. Why does && behave differently for these two cases?",
    mentalModel:
      "**Mental model:** && returns the left operand when it is falsy — not `false` specifically, but whatever falsy value it evaluated.\n- `false && <span/>` → returns `false` → React renders nothing (false is intentionally excluded from React output)\n- `undefined && <span/>` → returns `undefined` → React renders nothing\n- `0 && <span/>` → returns `0` → React renders the text '0' (numbers are rendered as text)\n- React intentionally skips `false`, `null`, and `undefined` in JSX output, but renders `0` because 0 is a valid renderable number\n- Fix for numbers: coerce to boolean — `{!!itemCount && <span>}` or `{itemCount > 0 && <span>}`",
    discover:
      "**React renders these as nothing:** `false`, `null`, `undefined`\n**React renders these as content:** `0`, `''` (empty string renders as a text node)\n\n```tsx\n// ✅ boolean — && is safe\n{isUrgent && <span>Urgent</span>}\n\n// ✅ string — && is safe (empty string renders nothing as text node)\n{label && <p>{label}</p>}\n\n// ❌ number — renders 0 when count is 0\n{itemCount && <span>{itemCount}</span>}\n\n// ✅ number fix — coerce to boolean\n{itemCount > 0 && <span>{itemCount}</span>}\n{!!itemCount && <span>{itemCount}</span>}\n```",
    quickRules:
      "- ✅ `{booleanProp && <Element />}` — safe\n- ✅ `{stringProp && <Element />}` — safe\n- ✅ `{count > 0 && <Element />}` — safe for numbers\n- ❌ `{numberProp && <Element />}` — renders 0 when count is 0\n- ternary with null is always safe regardless of type",
    watchOut:
      "👀 **Watch out:** TypeScript won't warn you about the 0 bug — it's valid JavaScript. The only defence is knowing the rule and always using an explicit comparison for numeric left operands.",
    dryRun:
      "🔁 **Think:** `isUrgent` is `false`. Walk through `{isUrgent && <span>Urgent</span>}` — what does && return? What does React render? Now `itemCount` is `0`. Walk through `{itemCount && <span>{itemCount}</span>}` — what does && return? What does React render?",
    build: "**Learning focus:** Use && for boolean conditional rendering — understanding why it's safe for booleans and strings but requires an explicit comparison for numbers.",
  },
},
{
  id: "step2",
  type: "question",
  phase: "Step 2 of 5",
  paal: "Render a status label that shows 'On time' when status is 'active', 'Late' when 'delayed', and 'Done' when 'delivered' — using a ternary chain.",
  hint: "A ternary can be nested: `condition ? a : anotherCondition ? b : c`. Keep it readable with line breaks.",
  example_code: `{priority === 'urgent' ? 'Rush' : priority === 'express' ? 'Fast' : 'Standard'}`,
  think_prompt:
    "Three possible status values, three possible labels. A single ternary handles two branches. How do you handle three branches with a ternary — and when does a different approach become cleaner?",
  mc_options: [
    "{status === 'active' ? 'On time' : status === 'delayed' ? 'Late' : 'Done'}",
    "{status && status === 'active' ? 'On time' : 'Other'}",
    "{if (status === 'active') return 'On time'}",
  ],
  mc_correct_option:
    "{status === 'active' ? 'On time' : status === 'delayed' ? 'Late' : 'Done'}",
  mc_anchor:
    "A nested ternary handles three branches — each false branch becomes the next condition. The final else branch 'Done' covers 'delivered' without an explicit check since it's the only remaining option. `if` statements cannot appear directly inside JSX — they belong in the component body before the return. The `&&` approach only handles two outcomes.",
  why_this_matters:
    "Inline label derivation for enum-like values is common in data tables, cards, and badges — translating a status code into a user-facing string. Ternary chains are the JSX-inline solution; a lookup object outside JSX is the solution when the chain grows beyond 3 options.",
  answer_keywords: ["status", "?", "active", "On time", "delayed", "Late", "Done"],
  seed_code: `type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  status: ShipmentStatus;
  isUrgent: boolean;
}

const ShipmentCard = ({ shipmentId, status, isUrgent }: ShipmentCardProps): JSX.Element => {
  return (
    <div className={\`card--\${status}\`}>
      <p>{shipmentId}</p>
      {isUrgent && <span className="badge--urgent">Urgent</span>}
    </div>
  );
};`,
  starter_code: `type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  status: ShipmentStatus;
  isUrgent: boolean;
}

const ShipmentCard = ({ shipmentId, status, isUrgent }: ShipmentCardProps): JSX.Element => {
  return (
    <div className={\`card--\${status}\`}>
      <p>{shipmentId}</p>
      {isUrgent && <span className="badge--urgent">Urgent</span>}
      {/* render status label here using a ternary chain */}
    </div>
  );
};`,
  feedback_correct:
    "Exactly — the nested ternary covers all three status values. 'Done' is the final else branch because 'delivered' is the only remaining option once 'active' and 'delayed' are checked.",
  feedback_partial:
    "Close — check that all three status values produce distinct labels and that the final else branch covers 'delivered'.",
  feedback_wrong:
    "The pattern: `{status === 'active' ? 'On time' : status === 'delayed' ? 'Late' : 'Done'}` — a nested ternary, each false branch becoming the next check.",
  expected: `type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  status: ShipmentStatus;
  isUrgent: boolean;
}

const ShipmentCard = ({ shipmentId, status, isUrgent }: ShipmentCardProps): JSX.Element => {
  return (
    <div className={\`card--\${status}\`}>
      <p>{shipmentId}</p>
      {isUrgent && <span className="badge--urgent">Urgent</span>}
      <p>
        {status === 'active' ? 'On time' : status === 'delayed' ? 'Late' : 'Done'}
      </p>
    </div>
  );
};`,
  analog_example: `{priority === 'urgent' ? 'Rush' : priority === 'express' ? 'Fast' : 'Standard'}`,
  deepDiveLabel: "Ternary chains grow messy — when should you use a lookup object instead?",
  deepDive: {
    hook: "Your ternary has three branches. The product team adds 'pending', 'in-transit', 'on-hold', 'customs-hold'. The ternary now has seven nested branches. It wraps, it's hard to review, and adding branch eight means re-reading the whole chain to find the right nesting level.",
    pain: "⚠️ **Lesson:** At what point does a ternary chain become unreadable — and what's the cleaner alternative when you have more than 3 or 4 branches?",
    mentalModel:
      "**Mental model:** A lookup object separates data from logic.\n```tsx\n// ✅ lookup object — clean, extensible, reviewable\nconst STATUS_LABELS: Record<ShipmentStatus, string> = {\n  active: 'On time',\n  delayed: 'Late',\n  delivered: 'Done',\n};\n// In JSX:\n{STATUS_LABELS[status]}\n\n// ⚠️ ternary chain — readable at 3, unreadable at 7\n{status === 'active' ? 'On time' : status === 'delayed' ? 'Late' : 'Done'}\n```\n- ternary: fine for 2-3 branches\n- lookup object: correct for 4+ branches or whenever the mapping is data, not logic\n- `Record<ShipmentStatus, string>` ensures TypeScript errors if you miss a status",
    quickRules:
      "- ✅ ternary for 2-3 branches\n- ✅ lookup object for 4+ branches or enum-like values\n- ✅ `Record<UnionType, OutputType>` to ensure exhaustiveness\n- ❌ nested ternary beyond 3 levels — unreadable, hard to maintain",
    watchOut: "👀 **Watch out:** A lookup object with `Record<ShipmentStatus, string>` will give you a TypeScript error if you add a new status to the union but forget to add it to the object. This is the exhaustiveness check that ternary chains can't provide.",
    dryRun: "🔁 **Think:** STATUS_LABELS is `{ active: 'On time', delayed: 'Late', delivered: 'Done' }`. A new status 'pending' is added to the ShipmentStatus union. TypeScript: error or no error on the Record — and what would the error message say?",
    build: "**Learning focus:** Use ternary chains for 2-3 branch conditional rendering — and know when to move to a lookup object as branches grow.",
  },
},
{
  id: "step3",
  type: "question",
  phase: "Step 3 of 5",
  paal: "Add isLoading state to ShipmentCard. When isLoading is true, render a loading div instead of the card content. Use an early return before the main return.",
  hint: "An early return inside the component function can return a completely different JSX tree. If isLoading, return the loading state immediately — the rest of the component never runs.",
  example_code: `if (isFetching) {
  return <div className="loading">Loading...</div>;
}`,
  think_prompt:
    "When isLoading is true, you want to show a spinner and nothing else. How do you render a completely different element tree based on a condition — without nesting everything in a ternary?",
  mc_options: [
    "{isLoading ? <div className='loading'>Loading...</div> : <div className={`card--${status}`}>...</div>}",
    "if (isLoading) { return <div className='loading'>Loading...</div>; } // before the main return",
    "{isLoading && <div className='loading'>Loading...</div>}{!isLoading && <div>...</div>}",
  ],
  mc_correct_option:
    "if (isLoading) { return <div className='loading'>Loading...</div>; } // before the main return",
  mc_anchor:
    "An early return before the main JSX is the cleanest pattern when a component renders a completely different tree based on a condition — the full card markup stays clean and unindented. The ternary option works but duplicates the entire card JSX tree in one expression. The dual-&& option works but reads awkwardly and duplicates the complement condition.",
  why_this_matters:
    "Early returns for loading, error, and empty states are a core React pattern — called 'guard clauses'. They handle edge cases at the top of the component and let the main render focus on the happy path, keeping the JSX readable.",
  answer_keywords: ["isLoading", "if", "return", "loading"],
  seed_code: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  status: ShipmentStatus;
  isUrgent: boolean;
}`,
  starter_code: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  status: ShipmentStatus;
  isUrgent: boolean;
}

const ShipmentCard = ({ shipmentId, status, isUrgent }: ShipmentCardProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);

  // add early return here — if isLoading, return the loading div

  return (
    <div className={\`card--\${status}\`}>
      <p>{shipmentId}</p>
      {isUrgent && <span className="badge--urgent">Urgent</span>}
      <p>{status === 'active' ? 'On time' : status === 'delayed' ? 'Late' : 'Done'}</p>
    </div>
  );
};`,
  feedback_correct:
    "Exactly — the early return short-circuits the component. When isLoading is true, the loading div is returned and the main card JSX never runs.",
  feedback_partial:
    "Close — make sure the early return is BEFORE the main return statement, not inside the JSX. `if (isLoading) { return <div>Loading...</div>; }` is a JavaScript statement, not a JSX expression.",
  feedback_wrong:
    "Add `if (isLoading) { return <div className='loading'>Loading...</div>; }` before the main return. This is an early return — the component exits here and the main JSX never runs.",
  expected: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  status: ShipmentStatus;
  isUrgent: boolean;
}

const ShipmentCard = ({ shipmentId, status, isUrgent }: ShipmentCardProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className={\`card--\${status}\`}>
      <p>{shipmentId}</p>
      {isUrgent && <span className="badge--urgent">Urgent</span>}
      <p>{status === 'active' ? 'On time' : status === 'delayed' ? 'Late' : 'Done'}</p>
    </div>
  );
};`,
  analog_example: `if (isError) {
  return <div className="error">Failed to load</div>;
}`,
  deepDiveLabel: "Early return for loading — what about early return for null?",
  deepDive: {
    hook: "Your component handles loading. A teammate adds an early return for an error state. Then another for an empty state. The component now has three guard clauses before the main return. A new colleague asks: 'can a component return null?' You say yes — but it feels odd. Why would you render nothing at all?",
    pain: "⚠️ **Lesson:** When would you return null from a component instead of a loading state or an error state? What does React do with null — and is there a difference between a component returning null and a parent not rendering it at all?",
    mentalModel:
      "**Mental model:** `return null` tells React 'render nothing here' — the component instance stays mounted.\n- A component returning null is still mounted. Its state, effects, and event listeners persist. Only its visual output is absent.\n- A parent using `{condition && <Component />}` controls whether the component mounts at all. When the condition becomes false, React unmounts the component — state is lost, cleanup effects run.\n- Returning null: component stays alive, UI is blank. Parent controls: component is destroyed and recreated.\n- Use null return when you want to temporarily hide a component while preserving its state. Use parent control when the component should be fully reset when hidden.",
    discover:
      "```tsx\n// ✅ null return — component stays mounted, state preserved\nif (!shouldShow) return null;\n\n// ✅ parent control — component unmounts and remounts\n{shouldShow && <ComponentWithState />}\n// When shouldShow becomes false: component unmounts, state resets\n// When shouldShow becomes true again: fresh mount, state starts over\n```",
    quickRules:
      "- ✅ `return null` to hide output while preserving state (timers, form data, scroll position)\n- ✅ `{condition && <Comp />}` to fully reset a component when hidden\n- ❌ returning null when you actually want to unmount and reset\n- null return and unmounting look identical in the UI — the difference is internal state",
    watchOut: "👀 **Watch out:** TypeScript's JSX.Element return type does not include null. If you return null from a component typed as `: JSX.Element`, TypeScript will error. Change the return type to `: JSX.Element | null` when early null returns are needed.",
    dryRun: "🔁 **Think:** ShipmentCard has a 10-second countdown in a useEffect. A parent uses `{isSelected && <ShipmentCard />}`. The user deselects — isSelected becomes false. What happens to the countdown? Now ShipmentCard returns null instead, and the parent always renders `<ShipmentCard />`. The user 'deselects' — what state triggers the null return? What happens to the countdown?",
    build: "**Learning focus:** Use early returns for guard clause states (loading, error, empty) — understanding the difference between returning null (component stays mounted) and a parent not rendering the component (component unmounts).",
  },
},
{
  id: "step4",
  type: "question",
  phase: "Step 4 of 5",
  paal: "Add an errorMessage prop (optional string) to ShipmentCard. When an error message is present, render it in a red error div instead of the card content — using a ternary on the whole return.",
  hint: "A ternary can sit at the top level of the return — `return errorMessage ? <errorJSX> : <normalJSX>`. This is cleaner than an early return when both branches are short.",
  example_code: `return error
  ? <div className="error">{error}</div>
  : <div className="card">{children}</div>;`,
  think_prompt:
    "errorMessage and isLoading are both guards, but they apply at different levels. When is a top-level ternary cleaner than an early return?",
  mc_options: [
    "if (errorMessage) { return <div className='error'>{errorMessage}</div>; }",
    "return errorMessage ? <div className='error'>{errorMessage}</div> : <div className={`card--${status}`}>...</div>;",
    "{errorMessage && <div className='error'>{errorMessage}</div>}",
  ],
  mc_correct_option:
    "return errorMessage ? <div className='error'>{errorMessage}</div> : <div className={`card--${status}`}>...</div>;",
  mc_anchor:
    "The top-level ternary in return makes both branches visible simultaneously — a reader can see the error state and the success state in one expression. For simple, short branches this is often cleaner than early returns. The early return is equally valid — preference depends on branch length. The && approach only renders the error and doesn't suppress the card content.",
  why_this_matters:
    "Top-level return ternaries are common in components that have exactly two meaningful states — authenticated vs guest, error vs content, empty vs populated. Seeing both in one expression communicates the duality clearly.",
  answer_keywords: ["errorMessage", "?", "error", "div"],
  seed_code: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  status: ShipmentStatus;
  isUrgent: boolean;
  errorMessage?: string;
}

const ShipmentCard = ({ shipmentId, status, isUrgent, errorMessage }: ShipmentCardProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className={\`card--\${status}\`}>
      <p>{shipmentId}</p>
      {isUrgent && <span className="badge--urgent">Urgent</span>}
      <p>{status === 'active' ? 'On time' : status === 'delayed' ? 'Late' : 'Done'}</p>
    </div>
  );
};`,
  starter_code: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  status: ShipmentStatus;
  isUrgent: boolean;
  errorMessage?: string;
}

const ShipmentCard = ({ shipmentId, status, isUrgent, errorMessage }: ShipmentCardProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  // update the return to use a top-level ternary on errorMessage
  return (
    <div className={\`card--\${status}\`}>
      <p>{shipmentId}</p>
      {isUrgent && <span className="badge--urgent">Urgent</span>}
      <p>{status === 'active' ? 'On time' : status === 'delayed' ? 'Late' : 'Done'}</p>
    </div>
  );
};`,
  feedback_correct:
    "Exactly — the top-level ternary in return shows both branches simultaneously. When errorMessage is present the error div renders; when absent the card renders.",
  feedback_partial:
    "Close — the ternary should be at the top level of the return statement, not nested inside the existing JSX. `return errorMessage ? <errorJSX> : <cardJSX>` is the structure.",
  feedback_wrong:
    "Change the return to: `return errorMessage ? <div className='error'>{errorMessage}</div> : <div className={\\`card--${status}\\`}>...</div>` — the ternary at the return level.",
  expected: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  status: ShipmentStatus;
  isUrgent: boolean;
  errorMessage?: string;
}

const ShipmentCard = ({ shipmentId, status, isUrgent, errorMessage }: ShipmentCardProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return errorMessage
    ? <div className="card--error">{errorMessage}</div>
    : (
      <div className={\`card--\${status}\`}>
        <p>{shipmentId}</p>
        {isUrgent && <span className="badge--urgent">Urgent</span>}
        <p>{status === 'active' ? 'On time' : status === 'delayed' ? 'Late' : 'Done'}</p>
      </div>
    );
};`,
  analog_example: `return fetchError
  ? <div className="error">{fetchError}</div>
  : <div className="dashboard">{children}</div>;`,
  deepDiveLabel: "isLoading uses early return, errorMessage uses ternary — when do you choose which?",
  deepDive: {
    hook: "You have two guard clauses that look similar — isLoading and errorMessage — but you handled them differently. One uses an early return. One uses a ternary in the return. A teammate asks why you didn't just use early returns for both, or ternaries for both.",
    pain: "⚠️ **Lesson:** What's the practical difference between an early return and a top-level return ternary — and what signals should guide you toward one over the other?",
    mentalModel:
      "**Mental model:** Choose based on how long the branches are and how many alternatives exist.\n- **Early return** (guard clause): 'this condition terminates the component early — the main path doesn't run'. Best for loading states, auth guards, data-required checks. Multiple early returns stack cleanly.\n- **Top-level ternary**: 'this component has exactly two meaningful states'. Best for binary content — error vs success, empty vs populated, authenticated vs guest. Both branches are readable in one expression.\n- When you have 3+ alternatives: consider switching to a lookup, extracted components, or multiple early returns.\n- When the alternative branch is complex (many lines): early return keeps each branch independent and easy to read.",
    discover:
      "```tsx\n// ✅ guard clause — 'exit early if condition not met'\nif (isLoading) return <Spinner />;\nif (isError) return <ErrorState error={error} />;\nif (!data) return null;\n// Main render: data is guaranteed here\nreturn <RichDataCard data={data} />;\n\n// ✅ top-level ternary — 'component has exactly two states'\nreturn isAuthenticated\n  ? <Dashboard user={user} />\n  : <LoginPrompt />;\n```",
    quickRules:
      "- ✅ early return for guard clauses (loading, error, auth, data-required)\n- ✅ ternary for binary component states (two meaningful outcomes)\n- ❌ ternary for 3+ alternatives — use early returns or extracted components\n- ❌ deeply nested ternaries — move complex branches to extracted components",
    watchOut: "👀 **Watch out:** Multiple early returns run in declaration order — the first truthy condition wins. If isLoading and errorMessage can both be true simultaneously, the isLoading guard fires first and the error is never shown. Consider whether that priority is correct for your UX.",
    dryRun: "🔁 **Think:** isLoading is true AND errorMessage is 'Fetch failed'. Which guard clause fires first in the current component? What does the user see — the loading div or the error div?",
    build: "**Learning focus:** Choose between early return guard clauses and top-level return ternaries based on how many alternatives exist and how long each branch is.",
  },
},
{
  id: "step5",
  type: "question",
  phase: "Step 5 of 5",
  paal: "Add a selectedCount number to the component (via a prop). When selectedCount is greater than 0, render it in a badge. When 0, render nothing. Avoid the 0 bug.",
  hint: "selectedCount is a number. The safe pattern for numbers with && is an explicit comparison: `selectedCount > 0 && ...`",
  example_code: `{unreadCount > 0 && <span className="badge">{unreadCount}</span>}`,
  think_prompt:
    "selectedCount is a number prop. The badge should appear only when at least one item is selected. What's the safe pattern for conditionally rendering based on a number?",
  mc_options: [
    "{selectedCount && <span className='badge'>{selectedCount}</span>}",
    "{selectedCount > 0 && <span className='badge'>{selectedCount}</span>}",
    "{!!selectedCount && <span className='badge'>{selectedCount}</span>}",
  ],
  mc_correct_option:
    "{selectedCount > 0 && <span className='badge'>{selectedCount}</span>}",
  mc_anchor:
    "The explicit `> 0` comparison is the clearest and most readable form — it communicates the intent precisely. `!!selectedCount` also coerces to boolean and avoids the 0 bug, but the intent is less obvious to a reader. The bare `{selectedCount && ...}` renders '0' when selectedCount is 0 — the 0 bug.",
  why_this_matters:
    "Numeric conditional rendering appears everywhere — unread counts, selection counts, item quantities, notification badges. The > 0 pattern is the industry standard for 'only show when there's at least one'. Knowing the 0 bug and its fix is what separates a careful React developer from a careless one.",
  answer_keywords: ["selectedCount", "> 0", "&&", "badge"],
  seed_code: `type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  status: ShipmentStatus;
  isUrgent: boolean;
  selectedCount: number;
}`,
  starter_code: `type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  status: ShipmentStatus;
  isUrgent: boolean;
  selectedCount: number;
}

const ShipmentCard = ({ shipmentId, status, isUrgent, selectedCount }: ShipmentCardProps): JSX.Element => {
  return (
    <div className={\`card--\${status}\`}>
      <p>{shipmentId}</p>
      {isUrgent && <span className="badge--urgent">Urgent</span>}
      {/* render selectedCount badge here — safely, avoiding the 0 bug */}
    </div>
  );
};`,
  feedback_correct:
    "Exactly — `selectedCount > 0 &&` coerces the condition to boolean before && evaluates it. When count is 0, the condition is false and nothing renders. When count is 5, the badge shows '5'.",
  feedback_partial:
    "Close — check your left operand. `{selectedCount && ...}` will render '0' when count is 0. Use `{selectedCount > 0 && ...}` for the explicit, readable fix.",
  feedback_wrong:
    "The pattern: `{selectedCount > 0 && <span className='badge'>{selectedCount}</span>}` — the explicit comparison ensures the left side is always a boolean, never 0.",
  expected: `type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  status: ShipmentStatus;
  isUrgent: boolean;
  selectedCount: number;
}

const ShipmentCard = ({ shipmentId, status, isUrgent, selectedCount }: ShipmentCardProps): JSX.Element => {
  return (
    <div className={\`card--\${status}\`}>
      <p>{shipmentId}</p>
      {isUrgent && <span className="badge--urgent">Urgent</span>}
      {selectedCount > 0 && <span className="badge">{selectedCount} selected</span>}
    </div>
  );
};`,
  analog_example: `{cartItems > 0 && <span className="cart-count">{cartItems}</span>}`,
  deepDiveLabel: "Conditional rendering is pure JSX — but when should you extract to a component instead?",
  deepDive: {
    hook: "Your ShipmentCard has five conditional expressions: isLoading, errorMessage, isUrgent, status label, selectedCount. Each is small today. Six months later each has grown — the error state has a retry button and a support link, the urgent badge has an expand handler, the loading state has a skeleton layout.\n\nThe return is 80 lines. Reading it requires mentally tracking which ternary branch you're in. A colleague suggests extracting each state into its own component.",
    pain: "⚠️ **Lesson:** At what point does inline conditional rendering become a maintenance problem — and what signals tell you it's time to extract a conditional branch into its own component?",
    mentalModel:
      "**Mental model:** Extract when a branch has its own complexity, state, or reuse potential.\n- A conditional that renders `<span>Urgent</span>` stays inline — it's one element.\n- A conditional that renders a 20-line error state with retry logic, telemetry, and a support link becomes `<ShipmentErrorState error={error} onRetry={retry} />`.\n- The signal: if you find yourself naming the branch in a comment ('// error state'), it probably deserves to be a named component.\n- Extraction also enables reuse — the same error state might appear in multiple card types.",
    discover:
      "```tsx\n// ✅ inline — simple, one element\n{isUrgent && <span className='badge--urgent'>Urgent</span>}\n\n// ✅ extracted — complex branch with its own logic\n{isError && <ShipmentErrorState error={error} onRetry={retry} />}\n\n// ✅ extracted early return — each guard is clean and named\nif (isLoading) return <ShipmentCardSkeleton />;\nif (isError) return <ShipmentErrorState error={error} />;\nif (!data) return <ShipmentEmptyState />;\n```",
    quickRules:
      "- ✅ inline for simple single-element conditionals\n- ✅ extract when a branch is > 10 lines or has its own state/logic\n- ✅ extract when the same conditional pattern appears in multiple components\n- ❌ extracting every condition — premature abstraction adds indirection without value",
    watchOut: "👀 **Watch out:** Extracted components for early return states are often the best candidates for a shared component library — `<LoadingState />`, `<ErrorState />`, `<EmptyState />` appear in dozens of places in enterprise apps and should be designed and owned centrally.",
    dryRun: "🔁 **Think:** ShipmentCard has 5 conditional expressions inline. Each averages 3 lines today. The product team adds retry logic (15 lines) to the error state and a skeleton loader (12 lines) to the loading state. After those changes, which conditions would you extract — and what would you name the extracted components?",
    build: "**Learning focus:** Apply && for show/hide conditions and ternary for two-state rendering — knowing when inline conditions become complex enough to warrant extraction into named components.",
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
  lessonNum: 19,
  title: "Event Handling — Keyboard + Focus",
  shortName: "EVENTS — KEYBOARD FOCUS",
});
