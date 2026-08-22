import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
{
  id: "intro",
  type: "reveal",
  phase: "Lesson",
  content: {
    tag: "LESSON #16 (React Hooks)",
    title: "List Rendering + key",
    body: "Object state taught you that mutation doesn't trigger re-renders — you must create a new object with spread. Array state follows the same rule with its own set of patterns. Adding, removing, and updating items in an array all require returning a new array, never mutating the original. In this lesson you'll manage a list of selected shipment IDs in state, applying the correct immutable patterns for every operation.",
    usecase:
      "A shipment dashboard needs multi-select — the user can select multiple cards to bulk-assign a driver, bulk-export, or bulk-cancel. The selected shipment IDs live in array state. Every add, remove, and clear must produce a new array so React can detect the change and update the UI.",
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
    "Declare array state typed as a typed array using useState",
    "Add an item to array state immutably using spread",
    "Remove an item from array state using filter",
    "Toggle an item — adding it if absent, removing it if present",
    "Derive values from array state without storing them in separate useState",
  ],
},
{
  id: "step1",
  type: "question",
  phase: "Step 1 of 5",
  paal: "Declare a selectedIds state variable typed as string[], initialised to an empty array.",
  hint: "An empty array [] has no elements for TypeScript to infer the item type from. You need an explicit type argument: useState<string[]>([]).",
  example_code: `const [tags, setTags] = useState<string[]>([]);`,
  think_prompt:
    "The multi-select starts with nothing selected — an empty array. TypeScript can't infer the item type from []. How do you tell useState the array holds strings?",
  mc_options: [
    "const [selectedIds, setSelectedIds] = useState([])",
    "const [selectedIds, setSelectedIds] = useState<string[]>([])",
    "const [selectedIds, setSelectedIds] = useState([''])",
  ],
  mc_correct_option: "const [selectedIds, setSelectedIds] = useState<string[]>([])",
  mc_anchor:
    "An empty array [] infers as `never[]` — TypeScript can't determine the element type from an empty collection. The explicit type argument `<string[]>` tells TypeScript this array holds strings, so setter calls are validated against string. Initialising with `['']` forces inference to `string[]` but starts with a bogus empty-string element in state.",
  why_this_matters:
    "Array state is ubiquitous in enterprise apps — selected rows, loaded items, error messages, notification queues. The explicit type argument for empty-array initialisation is the pattern you'll use every time. Getting it right means TypeScript enforces the element type on every push, splice, and filter.",
  answer_keywords: ["useState", "string[]", "selectedIds", "setSelectedIds", "[]"],
  seed_code: `import { useState } from 'react';`,
  starter_code: `import { useState } from 'react';

const ShipmentMultiSelect = (): JSX.Element => {
  // declare selectedIds as string[], initialised to []
  return <div />;
};`,
  feedback_correct:
    "Exactly — `useState<string[]>([])` gives TypeScript the element type it can't infer from an empty array. Every call to setSelectedIds will now be validated against string[].",
  feedback_partial:
    "Close — the explicit type argument `<string[]>` before the parentheses is required. Without it, TypeScript infers `never[]` and every setter call errors.",
  feedback_wrong:
    "The pattern: `const [selectedIds, setSelectedIds] = useState<string[]>([])` — the type argument goes between useState and the opening parenthesis.",
  expected: `import { useState } from 'react';

const ShipmentMultiSelect = (): JSX.Element => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  return <div />;
};`,
  analog_example: `const [errorMessages, setErrorMessages] = useState<string[]>([]);`,
  deepDiveLabel:
    "useState<string[]>([]) vs useState(['']) — what does TypeScript infer from the second one and why is it wrong?",
  deepDive: {
    hook: "A colleague suggests initialising with `useState([''])` — 'TypeScript will infer string[] from the element', they say. You try it. TypeScript infers `string[]` correctly. It seems to work.\n\nThen you realise your selectedIds starts with one element: an empty string. Your component renders a selection count of 1 before the user has selected anything. The first item in the rendered list is a blank row. Your clear-all button doesn't actually clear because it resets to `['']`, not `[]`.\n\nThe bogus initial element is a silent data bug introduced by using inference as a shortcut.",
    pain: "⚠️ **Lesson:** You initialise array state with `['']` to get TypeScript to infer `string[]`. TypeScript is happy — but the state starts with one empty-string element. Why is this wrong — and what's the only safe way to initialise an empty typed array?",
    mentalModel:
      "**Mental model:** The initial value is state data — not a type hint.\n- `useState([''])` initialises the state with `['']`. That's one element — an empty string. It's real data that will render, be counted, and require clearing.\n- TypeScript uses the initial value to infer the type. The inference is correct: `string[]`. But the data is wrong.\n- `useState<string[]>([])` initialises the state with `[]` — genuinely empty. The type argument provides the type information that the empty array can't.\n- The type argument and the initial value serve different purposes. Never use the initial value as a type hint — use the type argument.",
    discover:
      "**Pattern — empty typed array state:**\n```tsx\n// ✅ explicit type argument, truly empty initial state\nconst [ids, setIds] = useState<string[]>([]);\n\n// ❌ bogus initial element — TypeScript happy, data wrong\nconst [ids, setIds] = useState(['']); // starts with one empty string\n\n// ❌ no type argument — TypeScript infers never[]\nconst [ids, setIds] = useState([]); // setter calls error: never is too narrow\n\n// ✅ alternative: type annotation on the variable\nconst [ids, setIds]: [string[], React.Dispatch<React.SetStateAction<string[]>>] = useState([]);\n// Correct but verbose — the type argument form is cleaner\n```\n- type argument: correct way to type an empty initial array\n- bogus element: wrong initial data, correct type — subtle bug\n- no type argument: TypeScript error on every setter call",
    quickRules:
      "**Quick rules:**\n- ✅ `useState<string[]>([])` — explicit type, empty initial state\n- ✅ `useState<ShipmentRecord[]>([])` — for object arrays\n- ❌ `useState([''])` — wrong initial data even though TypeScript infers correctly\n- ❌ `useState([])` without type — infers `never[]`, all setter calls error\n- type argument is the clean way — always use it for empty arrays",
    watchOut:
      "👀 **Watch out:** TypeScript's `never[]` error from untyped empty arrays can be confusing. The error appears at the setter call, not at the useState declaration — making it feel like the setter is wrong when actually the declaration is. If you see 'Argument of type X is not assignable to never', check for an untyped empty array useState.",
    dryRun:
      "🔁 **Think:** You write `const [ids, setIds] = useState([])`. TypeScript infers `never[]`. You call `setIds(['NX-1'])`. TypeScript errors: 'Argument of type string[] is not assignable to never[]'. What is the minimum change to the useState call that fixes this?",
    build:
      "**Learning focus:** Declare array state with an explicit type argument when the initial value is an empty array — understanding that TypeScript infers from the initial value and that an empty array provides no information about the element type.",
  },
},
{
  id: "step2",
  type: "question",
  phase: "Step 2 of 5",
  paal: "Write an addId function that adds a shipment ID to selectedIds — without mutating the existing array.",
  hint: "Spread the existing array into a new array and append the new ID at the end: [...prev, newId]. This creates a new array reference, which triggers the re-render.",
  example_code: `const addTag = (tag: string) => {
  setTags(prev => [...prev, tag]);
};`,
  think_prompt:
    "You need to add a new string to the selectedIds array. The same mutation rule applies as with object state — you cannot push() to the existing array. How do you produce a new array that contains all existing IDs plus the new one?",
  mc_options: [
    "selectedIds.push(newId); setSelectedIds(selectedIds)",
    "setSelectedIds(prev => [...prev, newId])",
    "setSelectedIds([...selectedIds, newId])",
  ],
  mc_correct_option: "setSelectedIds(prev => [...prev, newId])",
  mc_anchor:
    "The functional form `prev => [...prev, newId]` creates a new array and is safe against stale closures. The push option mutates the existing array — React sees the same reference, skips the re-render. The closure form `[...selectedIds, newId]` also creates a new array and works in simple cases, but can be stale in batched or concurrent updates — the functional form is the correct habit.",
  why_this_matters:
    "Immutable array addition with spread is the pattern behind every 'add to cart', 'add tag', 'add to queue', and 'load more' interaction in enterprise apps. The functional form with spread is the correct pattern — it composes safely regardless of React's batching behaviour.",
  answer_keywords: ["setSelectedIds", "prev", "...", "prev", "newId"],
  seed_code: `import { useState } from 'react';

const ShipmentMultiSelect = (): JSX.Element => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  return <div />;
};`,
  starter_code: `import { useState } from 'react';

const ShipmentMultiSelect = (): JSX.Element => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // write addId here — add a string to selectedIds without mutating

  return <div />;
};`,
  feedback_correct:
    "Exactly — `[...prev, newId]` creates a new array with all existing IDs plus the new one. React sees a new reference and re-renders.",
  feedback_partial:
    "Close — make sure you're using the functional form `prev => [...prev, newId]` not the closure form `[...selectedIds, newId]`. Both work today but the functional form is always safe.",
  feedback_wrong:
    "The pattern: `setSelectedIds(prev => [...prev, newId])` — functional form receives the current array as prev, spreads it into a new array, and appends newId at the end.",
  expected: `import { useState } from 'react';

const ShipmentMultiSelect = (): JSX.Element => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const addId = (newId: string) => {
    setSelectedIds(prev => [...prev, newId]);
  };

  return <div />;
};`,
  analog_example: `const addError = (message: string) => {
  setErrors(prev => [...prev, message]);
};`,
  deepDiveLabel:
    "push() mutates and breaks React — but what about other array methods that look safe?",
  deepDive: {
    hook: "You know push() is wrong. You use spread instead. A colleague uses `concat()` — it looks like push, returns a new array, and seems safe. Another colleague uses `sort()` on the array before passing it to the setter. A third uses `splice()` to remove an element, then passes the original array.\n\nThree approaches. Only one is correct. Do you know which?",
    pain: "⚠️ **Lesson:** Which of these produces a new array (safe for React state) and which mutates in place (wrong for React state): push(), pop(), concat(), sort(), filter(), splice(), slice(), map()?",
    mentalModel:
      "**Mental model:** Array methods fall into two categories — **mutators** and **pure methods**.\n- Mutators modify the original array in place and return something other than a new array: `push()`, `pop()`, `shift()`, `unshift()`, `splice()`, `sort()`, `reverse()`, `fill()`.\n- Pure methods return a new array without touching the original: `filter()`, `map()`, `concat()`, `slice()`, `flat()`, `flatMap()`, spread `[...arr]`.\n- The rule for React state: only pure methods are safe. Mutators break re-renders.\n- `sort()` is the sneaky one — it returns the array it sorted, which looks like a new value, but it sorted IN PLACE. `[...arr].sort()` is safe — spread first, sort the copy.",
    discover:
      "**Pattern — safe vs unsafe array operations:**\n```tsx\n// ✅ SAFE — produces new array (pure methods)\nsetIds(prev => [...prev, newId]);           // spread + append\nsetIds(prev => prev.filter(id => id !== removeId)); // filter\nsetIds(prev => prev.map(id => transform(id))); // map\nsetIds(prev => prev.concat([newId]));       // concat\nsetIds(prev => prev.slice(0, 5));           // slice\n\n// ❌ UNSAFE — mutates in place\nprev.push(newId); setIds(prev);             // push mutates\nprev.splice(index, 1); setIds(prev);        // splice mutates\nprev.sort(); setIds(prev);                  // sort mutates, returns same ref\n\n// ✅ SAFE sort — spread first, then sort the copy\nsetIds(prev => [...prev].sort());\n```\n- mutators: push, pop, shift, unshift, splice, sort, reverse, fill\n- pure: filter, map, concat, slice, flat, flatMap, spread\n- when in doubt: spread the array first `[...arr]`, then apply the method",
    quickRules:
      "**Quick rules:**\n- ✅ `[...prev, item]` — spread + append, new array\n- ✅ `prev.filter(...)` — new array, original untouched\n- ✅ `prev.map(...)` — new array, original untouched\n- ✅ `[...prev].sort()` — spread first, then sort the copy\n- ❌ `prev.push()`, `prev.splice()`, `prev.sort()`, `prev.reverse()` — all mutate in place\n- when in doubt: if the method returns the same array, it mutated",
    watchOut:
      "👀 **Watch out:** `sort()` returns the mutated array — not a new one. `[...prev].sort()` looks like it creates a new array AND sorts. It does — the spread creates a new array, then sort mutates that new copy. The original prev is untouched. This pattern is correct and common.",
    dryRun:
      "🔁 **Think:** selectedIds is `['NX-1', 'NX-2']`. You call `setSelectedIds(prev => [...prev, 'NX-3'])`. What is prev inside the function? What does `[...prev, 'NX-3']` evaluate to? Is the result a new array or the same reference? What does React do when it receives a new reference?",
    build:
      "**Learning focus:** Add items to array state immutably using spread — understanding which array methods produce new arrays (safe for React state) and which mutate in place (break re-renders).",
  },
},
{
  id: "step3",
  type: "question",
  phase: "Step 3 of 5",
  paal: "Write a removeId function that removes a shipment ID from selectedIds — using filter to produce a new array without the removed element.",
  hint: "filter returns a new array containing only the elements where the callback returns true. To remove one ID, keep all IDs that are NOT equal to the one being removed.",
  example_code: `const removeTag = (tag: string) => {
  setTags(prev => prev.filter(t => t !== tag));
};`,
  think_prompt:
    "You need to produce a new array that has all the current IDs except the one being removed. Which array method produces a new array containing only elements that pass a test?",
  mc_options: [
    "setSelectedIds(prev => { prev.splice(prev.indexOf(removeId), 1); return prev; })",
    "setSelectedIds(prev => prev.filter(id => id !== removeId))",
    "setSelectedIds(prev => prev.slice(prev.indexOf(removeId)))",
  ],
  mc_correct_option:
    "setSelectedIds(prev => prev.filter(id => id !== removeId))",
  mc_anchor:
    "filter returns a new array containing only elements where the callback is true. `id !== removeId` keeps every ID except the one being removed. The splice option mutates prev in place then returns the same reference — React skips the re-render. The slice option cuts the array at the removed element's position — it doesn't remove one element, it truncates everything after it.",
  why_this_matters:
    "Removing by filter is the universal pattern for removing items from array state in React — remove from cart, dismiss notification, deselect row, delete tag. It's the immutable equivalent of splice and it's safe, readable, and correct.",
  answer_keywords: ["setSelectedIds", "prev", "filter", "id", "!==", "removeId"],
  seed_code: `import { useState } from 'react';

const ShipmentMultiSelect = (): JSX.Element => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const addId = (newId: string) => {
    setSelectedIds(prev => [...prev, newId]);
  };

  return <div />;
};`,
  starter_code: `import { useState } from 'react';

const ShipmentMultiSelect = (): JSX.Element => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const addId = (newId: string) => {
    setSelectedIds(prev => [...prev, newId]);
  };

  // write removeId here — produce a new array without the removed element

  return <div />;
};`,
  feedback_correct:
    "Exactly — filter produces a new array with only the IDs that pass the test. The removed ID fails the test and is excluded from the result.",
  feedback_partial:
    "Close — make sure you're using filter and returning a new array. splice mutates the existing array; filter does not.",
  feedback_wrong:
    "The pattern: `setSelectedIds(prev => prev.filter(id => id !== removeId))` — filter returns a new array containing only elements where the callback returns true.",
  expected: `import { useState } from 'react';

const ShipmentMultiSelect = (): JSX.Element => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const addId = (newId: string) => {
    setSelectedIds(prev => [...prev, newId]);
  };

  const removeId = (removeId: string) => {
    setSelectedIds(prev => prev.filter(id => id !== removeId));
  };

  return <div />;
};`,
  analog_example: `const dismissNotification = (notifId: string) => {
  setNotifications(prev => prev.filter(n => n.id !== notifId));
};`,
  deepDiveLabel:
    "filter by value works for strings — but what about removing an object from an array by its ID?",
  deepDive: {
    hook: "You're removing strings by value — `id !== removeId` works perfectly because strings compare by value. Then your array holds ShipmentRecord objects instead of strings. You try `prev.filter(s => s !== removeShipment)`. It never removes anything.\n\nYou check the values — the shipment is definitely in the array. Same data. But `s !== removeShipment` is always true because two different object literals are never === to each other in JavaScript, even if their contents are identical.",
    pain: "⚠️ **Lesson:** You filter an array of objects with `item => item !== removeItem`. It never removes anything. Why doesn't === work for objects — and how do you filter an array of objects to remove one by identity?",
    mentalModel:
      "**Mental model:** JavaScript's === on objects checks **reference equality**, not value equality.\n- Two strings with the same content are ===: `'NX-1' === 'NX-1'` is true.\n- Two objects with the same content are NOT ===: `{ id: 'NX-1' } === { id: 'NX-1' }` is false — they're two different objects in memory.\n- `prev.filter(s => s !== removeShipment)` checks if each array item is a different reference from removeShipment. Unless you're passing the exact same object reference that's in the array, this comparison always returns true — nothing is filtered out.\n- The fix: filter by a unique identifier, not by object reference. `prev.filter(s => s.id !== removeId)` compares strings, not objects.",
    discover:
      "**Pattern — filtering objects from arrays:**\n```tsx\n// ✅ filter strings by value — === works for primitives\nsetIds(prev => prev.filter(id => id !== removeId));\n\n// ✅ filter objects by ID — compare the ID string, not the object\nsetShipments(prev => prev.filter(s => s.id !== removeId));\n\n// ❌ filter objects by reference — almost always wrong\nsetShipments(prev => prev.filter(s => s !== removeShipment));\n// Only works if removeShipment is the exact same reference stored in the array\n\n// ✅ filter objects by index — when no unique ID is available\nsetItems(prev => prev.filter((_, index) => index !== removeIndex));\n```\n- primitives (string, number): compare by value with ===\n- objects: compare by a unique identifier field\n- references: rarely useful for removal — use IDs instead\n- index-based removal: last resort, brittle for dynamic lists",
    quickRules:
      "**Quick rules:**\n- ✅ `prev.filter(id => id !== removeId)` — for string/number arrays\n- ✅ `prev.filter(item => item.id !== removeId)` — for object arrays\n- ❌ `prev.filter(item => item !== removeObject)` — reference comparison, rarely works\n- ❌ `prev.filter((_, i) => i !== removeIndex)` — brittle if items can reorder\n- always remove objects by a stable unique ID, not by reference or index",
    watchOut:
      "👀 **Watch out:** Index-based removal `filter((_, i) => i !== removeIndex)` breaks subtly when list items can be reordered or when items are added or removed concurrently. If index 3 is removed while another item was inserted at index 2, the indices shift and you remove the wrong item. Always prefer ID-based removal for dynamic lists.",
    dryRun:
      "🔁 **Think:** selectedIds is `['NX-1', 'NX-2', 'NX-3']`. You call `removeId('NX-2')`. Walk through: what is prev inside the functional update? What does `prev.filter(id => id !== 'NX-2')` return? What is the new selectedIds after the re-render?",
    build:
      "**Learning focus:** Remove items from array state using filter — understanding that filter returns a new array containing only elements that pass the test, and that object arrays should be filtered by a unique ID rather than by object reference.",
  },
},
{
  id: "step4",
  type: "question",
  phase: "Step 4 of 5",
  paal: "Write a toggleId function that adds the ID if it's not in selectedIds, and removes it if it is. Then render the list of selected IDs and a click handler that calls toggleId.",
  hint: "Check if the ID is already in the array with includes(). Then conditionally spread+append or filter based on the result.",
  example_code: `const toggleTag = (tag: string) => {
  setTags(prev =>
    prev.includes(tag)
      ? prev.filter(t => t !== tag)
      : [...prev, tag]
  );
};`,
  think_prompt:
    "toggleId must do one of two things depending on the current state: add if absent, remove if present. How do you check membership in an array — and how do you express the conditional update in the functional form?",
  mc_options: [
    "if (selectedIds.includes(id)) removeId(id); else addId(id);",
    "setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])",
    "setSelectedIds(prev => [...prev, id].filter((v, i, a) => a.indexOf(v) === i))",
  ],
  mc_correct_option:
    "setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])",
  mc_anchor:
    "The functional form with a ternary is clean and correct — it checks inclusion against prev (the current state), then either filters out or appends. The if/else approach calling separate addId and removeId functions works but creates two setter calls that React would batch — it's cleaner and more idiomatic to express toggle as a single functional update. The deduplication approach using indexOf is a creative workaround but unintuitive and hides the intent.",
  why_this_matters:
    "Toggle patterns appear everywhere in enterprise UIs — selecting rows, tagging items, enabling features, toggling filters. The functional form with includes + ternary is the clean, readable, correct implementation that senior engineers recognise immediately.",
  answer_keywords: [
    "setSelectedIds", "prev", "includes", "filter", "...", "prev",
  ],
  seed_code: `import { useState } from 'react';

const ShipmentMultiSelect = (): JSX.Element => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const addId = (newId: string) => {
    setSelectedIds(prev => [...prev, newId]);
  };

  const removeId = (removeId: string) => {
    setSelectedIds(prev => prev.filter(id => id !== removeId));
  };

  return <div />;
};`,
  starter_code: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  status: ShipmentStatus;
}

const ShipmentMultiSelect = (): JSX.Element => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const addId = (newId: string) => {
    setSelectedIds(prev => [...prev, newId]);
  };

  const removeId = (removeId: string) => {
    setSelectedIds(prev => prev.filter(id => id !== removeId));
  };

  // write toggleId here

  const shipments: ShipmentCardProps[] = [
    { shipmentId: 'NX-001', status: 'active' },
    { shipmentId: 'NX-002', status: 'delayed' },
    { shipmentId: 'NX-003', status: 'delivered' },
  ];

  return (
    <div>
      {/* render each shipment as a div with onClick calling toggleId */}
      {/* show which are selected */}
      <p>Selected: {selectedIds.join(', ') || 'none'}</p>
    </div>
  );
};`,
  feedback_correct:
    "Exactly — toggleId checks prev.includes(id) and either removes or appends in a single functional update. The shipment list renders with click handlers, and the selected IDs display updates on every toggle.",
  feedback_partial:
    "Close — check that toggleId is a single setSelectedIds call using the functional form. If you're calling addId and removeId separately inside toggleId, combine them into one functional update.",
  feedback_wrong:
    "Write `const toggleId = (id: string) => { setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]); }`. Call it with `onClick={() => toggleId(shipment.shipmentId)}` on each shipment div.",
  expected: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  status: ShipmentStatus;
}

const ShipmentMultiSelect = (): JSX.Element => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const addId = (newId: string) => {
    setSelectedIds(prev => [...prev, newId]);
  };

  const removeId = (removeId: string) => {
    setSelectedIds(prev => prev.filter(id => id !== removeId));
  };

  const toggleId = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const shipments: ShipmentCardProps[] = [
    { shipmentId: 'NX-001', status: 'active' },
    { shipmentId: 'NX-002', status: 'delayed' },
    { shipmentId: 'NX-003', status: 'delivered' },
  ];

  return (
    <div>
      {shipments.map(shipment => (
        <div
          key={shipment.shipmentId}
          onClick={() => toggleId(shipment.shipmentId)}
          className={selectedIds.includes(shipment.shipmentId) ? 'card--selected' : ''}
        >
          <p>{shipment.shipmentId}</p>
          <p>{shipment.status}</p>
        </div>
      ))}
      <p>Selected: {selectedIds.join(', ') || 'none'}</p>
    </div>
  );
};`,
  analog_example: `const toggleCategory = (cat: string) => {
  setCategories(prev =>
    prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
  );
};`,
  deepDiveLabel:
    "includes() checks membership — but what if the array holds objects instead of strings?",
  deepDive: {
    hook: "Your multi-select works perfectly with string IDs. Then a requirement changes: selectedIds should store full ShipmentRecord objects instead of just strings — so you can access their status and destination without a lookup.\n\nYou update the type to `useState<ShipmentRecord[]>([])` and change includes to `prev.includes(shipment)`. Toggle stops working. Selected items never highlight. The same reference problem from the filter lesson appears again — this time in includes.",
    pain: "⚠️ **Lesson:** You change selectedIds to hold ShipmentRecord objects. `prev.includes(shipment)` always returns false even for shipments you know are selected. Why — and what's the alternative to includes for object arrays?",
    mentalModel:
      "**Mental model:** includes() uses === to check membership.\n- For strings: `['NX-1', 'NX-2'].includes('NX-1')` → true. Strings compare by value.\n- For objects: `[shipment1, shipment2].includes(shipment1)` → true ONLY if `shipment1` is the exact same reference stored in the array. A new object `{ id: 'NX-1', status: 'active' }` with the same content is a different reference — includes returns false.\n- For object arrays: replace includes with `some()`: `prev.some(s => s.id === id)`. some() checks if any element satisfies a predicate — you provide the comparison logic, not ===.",
    discover:
      "**Pattern — membership check for object arrays:**\n```tsx\n// ✅ string array — includes works\nconst isSelected = selectedIds.includes('NX-1');\n\n// ✅ object array — use some() with ID comparison\nconst isSelected = selectedShipments.some(s => s.id === 'NX-1');\n\n// ❌ object array with includes — almost always false\nconst isSelected = selectedShipments.includes(shipment); // reference check\n\n// ✅ toggle with object array\nsetSelectedShipments(prev =>\n  prev.some(s => s.id === shipment.id)\n    ? prev.filter(s => s.id !== shipment.id)\n    : [...prev, shipment]\n);\n```\n- string/number arrays: includes() and filter by value\n- object arrays: some() for membership, filter by ID for removal\n- the pattern is consistent: always compare by a unique identifier for object arrays",
    quickRules:
      "**Quick rules:**\n- ✅ `arr.includes(value)` — membership check for string/number arrays\n- ✅ `arr.some(item => item.id === id)` — membership check for object arrays\n- ❌ `arr.includes(object)` — reference check, almost always false for new objects\n- ✅ `arr.filter(id => id !== removeId)` — removal for string/number arrays\n- ✅ `arr.filter(item => item.id !== removeId)` — removal for object arrays\n- for objects: always think in terms of IDs, not references",
    watchOut:
      "👀 **Watch out:** Storing full objects in selected state (vs just IDs) creates a synchronisation risk: if the object data changes (status updates, field additions), the selected array holds stale versions. For most selection patterns, storing just the ID and looking up the full object from the data source is the safer and more common pattern.",
    dryRun:
      "🔁 **Think:** selectedIds is `['NX-1', 'NX-3']`. A shipment with id 'NX-2' is rendered. The component checks `selectedIds.includes('NX-2')` for the className. What does it return? The user clicks the NX-2 shipment — toggleId('NX-2') fires. Walk through the functional update. What is selectedIds after the re-render?",
    build:
      "**Learning focus:** Write a toggle function using the functional update form — understanding that includes checks membership by === (safe for strings, unreliable for objects) and that some() with an ID comparison is the correct membership check for object arrays.",
  },
},
{
  id: "step5",
  type: "question",
  phase: "Step 5 of 5",
  paal: "Add two derived values — selectionCount (number of selected IDs) and isAllSelected (true when all three shipments are selected) — and a clearAll function that resets selectedIds to an empty array.",
  hint: "selectionCount and isAllSelected are derived from selectedIds — compute them at render time, don't store them in state. clearAll calls setSelectedIds with [].",
  example_code: `const selectedCount = selectedIds.length;
const isAllSelected = selectedIds.length === totalItems;
const clearAll = () => setSelectedIds([]);`,
  think_prompt:
    "selectionCount and isAllSelected can both be computed directly from selectedIds. Which is the right approach — store them in separate useState calls, or derive them at render time?",
  mc_options: [
    "const [selectionCount, setSelectionCount] = useState(0); const [isAllSelected, setIsAllSelected] = useState(false)",
    "const selectionCount = selectedIds.length; const isAllSelected = selectedIds.length === 3",
    "const selectionCount = useMemo(() => selectedIds.length, [selectedIds])",
  ],
  mc_correct_option:
    "const selectionCount = selectedIds.length; const isAllSelected = selectedIds.length === 3",
  mc_anchor:
    "Both values are trivially derived from selectedIds — compute them directly. Storing them in state creates synchronisation risk (you must update three things every time selectedIds changes). useMemo is correct in principle but overkill for a property access — .length is O(1) and useMemo itself has overhead. Derive directly for simple computations, memoize for expensive ones.",
  why_this_matters:
    "Keeping state lean — one piece of state, multiple derived values — is a core React architecture principle. The more you store in state, the more synchronisation you need to maintain. Every value that can be derived should be derived.",
  answer_keywords: [
    "selectionCount", "selectedIds.length",
    "isAllSelected", "selectedIds.length === 3",
    "clearAll", "setSelectedIds", "[]",
  ],
  seed_code: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  status: ShipmentStatus;
}

const ShipmentMultiSelect = (): JSX.Element => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleId = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const shipments: ShipmentCardProps[] = [
    { shipmentId: 'NX-001', status: 'active' },
    { shipmentId: 'NX-002', status: 'delayed' },
    { shipmentId: 'NX-003', status: 'delivered' },
  ];

  return (
    <div>
      {shipments.map(shipment => (
        <div
          key={shipment.shipmentId}
          onClick={() => toggleId(shipment.shipmentId)}
          className={selectedIds.includes(shipment.shipmentId) ? 'card--selected' : ''}
        >
          <p>{shipment.shipmentId}</p>
          <p>{shipment.status}</p>
        </div>
      ))}
      <p>Selected: {selectedIds.join(', ') || 'none'}</p>
    </div>
  );
};`,
  starter_code: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  status: ShipmentStatus;
}

const ShipmentMultiSelect = (): JSX.Element => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleId = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  // derive selectionCount and isAllSelected here (not useState)
  // add clearAll function here

  const shipments: ShipmentCardProps[] = [
    { shipmentId: 'NX-001', status: 'active' },
    { shipmentId: 'NX-002', status: 'delayed' },
    { shipmentId: 'NX-003', status: 'delivered' },
  ];

  return (
    <div>
      {shipments.map(shipment => (
        <div
          key={shipment.shipmentId}
          onClick={() => toggleId(shipment.shipmentId)}
          className={selectedIds.includes(shipment.shipmentId) ? 'card--selected' : ''}
        >
          <p>{shipment.shipmentId}</p>
          <p>{shipment.status}</p>
        </div>
      ))}
      {/* render selectionCount, isAllSelected, clearAll button */}
    </div>
  );
};`,
  feedback_correct:
    "Exactly — selectionCount and isAllSelected are derived at render time from selectedIds, keeping state lean. clearAll resets to [] in a single call. Everything stays in sync automatically because there's only one source of truth.",
  feedback_partial:
    "Close — check that selectionCount and isAllSelected are plain consts (not useState calls). If you stored them in state, you'd have three pieces of state to keep in sync instead of one.",
  feedback_wrong:
    "Add `const selectionCount = selectedIds.length` and `const isAllSelected = selectedIds.length === 3` as plain consts inside the component. Add `const clearAll = () => setSelectedIds([])`. Render them in the JSX.",
  expected: `import { useState } from 'react';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  status: ShipmentStatus;
}

const ShipmentMultiSelect = (): JSX.Element => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleId = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const clearAll = () => {
    setSelectedIds([]);
  };

  const selectionCount = selectedIds.length;
  const isAllSelected = selectedIds.length === 3;

  const shipments: ShipmentCardProps[] = [
    { shipmentId: 'NX-001', status: 'active' },
    { shipmentId: 'NX-002', status: 'delayed' },
    { shipmentId: 'NX-003', status: 'delivered' },
  ];

  return (
    <div>
      {shipments.map(shipment => (
        <div
          key={shipment.shipmentId}
          onClick={() => toggleId(shipment.shipmentId)}
          className={selectedIds.includes(shipment.shipmentId) ? 'card--selected' : ''}
        >
          <p>{shipment.shipmentId}</p>
          <p>{shipment.status}</p>
        </div>
      ))}
      <p>{selectionCount} selected {isAllSelected && '— all selected'}</p>
      <button onClick={clearAll}>Clear all</button>
    </div>
  );
};`,
  analog_example: `const selectedCount = selectedRows.length;
const hasSelection = selectedRows.length > 0;
const clearSelection = () => setSelectedRows([]);`,
  deepDiveLabel:
    "One useState for selectedIds drives three values — how does React know when to re-render?",
  deepDive: {
    hook: "selectedIds changes. React re-renders ShipmentMultiSelect. selectionCount and isAllSelected are re-computed from the new selectedIds. The UI updates. You add a console.log at the top of the component — it logs on every toggle. Every time selectedIds changes, the whole component function runs again.\n\nA colleague asks: 'doesn't that mean every derived computation runs on every render? Even the ones that didn't change?' Yes. And that's usually fine — until it isn't. This is where useMemo enters the picture.",
    pain: "⚠️ **Lesson:** Every render re-runs every line of the component function — including selectionCount and isAllSelected. For simple computations this is fine. At what point does a derived computation become expensive enough to warrant memoization — and what does useMemo actually do?",
    mentalModel:
      "**Mental model:** React's render model is: function called → all expressions evaluated → new JSX returned → DOM updated if needed.\n- Every render re-executes the component function from top to bottom.\n- `selectedIds.length` runs on every render. It's a property access — effectively free.\n- `shipments.filter(s => matchesFilter(s, filter))` over 10,000 items on every render is expensive — it runs even when filter hasn't changed.\n- useMemo wraps a computation and a dependency array. React re-runs the computation only when the dependencies change. Between changes, it returns the cached result.\n- The decision: measure first. Simple array operations are rarely the bottleneck. useMemo has its own overhead — adding it to a trivial computation makes things slower, not faster.",
    discover:
      "**Pattern — when to memoize:**\n```tsx\n// ✅ trivial — derive directly, no memoization needed\nconst selectionCount = selectedIds.length;\nconst hasSelection = selectedIds.length > 0;\n\n// ✅ expensive — memoize with useMemo\nconst filteredShipments = useMemo(\n  () => allShipments.filter(s => matchesFilter(s, filter)), // O(n) over large array\n  [allShipments, filter] // only recompute when these change\n);\n\n// ❌ over-memoized — adds overhead without benefit\nconst selectionCount = useMemo(() => selectedIds.length, [selectedIds]);\n// .length is O(1) — useMemo overhead costs more than the computation\n```\n- trivial computations: derive directly\n- O(n) or O(n²) computations over large datasets: useMemo\n- profile before memoizing — React DevTools shows render frequency and duration\n- useMemo is covered in Lesson 43",
    quickRules:
      "**Quick rules:**\n- ✅ derive trivial values directly — counts, flags, formatted strings\n- ✅ useMemo for O(n) computations over large arrays — filtering, sorting, transforming\n- ❌ useMemo for trivial computations — overhead outweighs benefit\n- ❌ stored derived state — synchronisation risk, maintenance overhead\n- measure before optimising — React DevTools Profiler shows what's actually expensive",
    watchOut:
      "👀 **Watch out:** 'Expensive' is relative. 1,000 items filtered in 2ms is not expensive. 100,000 items filtered in 200ms is. Don't add useMemo speculatively — add it when you have measured evidence that the computation is contributing to render latency.",
    dryRun:
      "🔁 **Think:** selectedIds is `['NX-001', 'NX-002']`. Walk through the render: what is selectionCount, what is isAllSelected? The user clicks NX-003 — toggleId fires, selectedIds becomes `['NX-001', 'NX-002', 'NX-003']`. React re-renders. Walk through again: what is selectionCount, what is isAllSelected, what does the `{isAllSelected && '— all selected'}` expression render?",
    build:
      "**Learning focus:** Derive selection metadata from array state at render time — reinforcing the principle that values computable from existing state should be computed, not stored, keeping state lean and eliminating synchronisation risk.",
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
  lessonNum: 16,
  title: "List Rendering + key",
  shortName: "JSX — LIST RENDERING",
});
