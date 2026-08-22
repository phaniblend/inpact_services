import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "LESSON #6",
      title: "List Rendering with map()",
      body: `A shopping list component. An array of items lives in state.
Each item renders as a <li> element.

items = ['Apples', 'Bread', 'Milk']

→  • Apples
   • Bread
   • Milk

Add an item → list grows. Remove one → list shrinks.`,
      usecase: `Every feed, inbox, search result, product list, and comment thread on the web renders an array using map(). It's the single most used pattern in React after useState.`,
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Use useState with an array as initial value",
      "Use .map() to transform an array into JSX elements",
      "Understand why every mapped element needs a unique key prop",
      "Add items to state using the spread operator: [...prev, newItem]",
      "Remove items from state using .filter()",
      "Understand why you never mutate state directly with .push()",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 5",
    paal: "Declare a state variable called items (setter: setItems). It should hold an array with three starting items: 'Apples', 'Bread', and 'Milk'.",
    hint: "useState can hold any type — including arrays:\nconst [items, setItems] = useState(['Apples', 'Bread', 'Milk'])",
    example_code: `const [todos, setTodos] = useState(['Buy groceries', 'Walk the dog'])`,
    evaluate: (ans) => {
      const a = ans.replace(/\s/g, "").toLowerCase();
      const hasUseState = a.includes("usestate");
      const hasArray = a.includes("[") && a.includes("]") && a.includes("usestate([");
      const hasItems = a.includes("apples") && a.includes("bread") && a.includes("milk");
      const hasCorrectName = /const\[items,/i.test(ans.replace(/\s/g, ""));
      const hasSomeName = /const\[\w+,/.test(ans.replace(/\s/g, ""));
      if (hasUseState && hasArray && hasItems && hasCorrectName) return "correct";
      if (hasUseState && hasArray && hasItems && hasSomeName) return "naming";
      if (hasUseState && hasArray) return "partial";
      if (hasUseState) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ useState with an array — React treats it like any other state value. The whole array updates atomically on every change.",
    feedback_naming: (ans) => {
      const m = ans.match(/const\s*\[(\w+)/);
      const used = m ? m[1] : "your variable";
      return `✅ Good — array state with the right items.\n\nFor this tutorial use items / setItems so all steps stay in sync:\nconst [items, setItems] = useState(['Apples', 'Bread', 'Milk'])`;
    },
    feedback_partial: (ans) => {
      const a = ans.toLowerCase();
      if (!a.includes("apples") || !a.includes("bread") || !a.includes("milk")) return "Close — make sure the initial array has all three items: 'Apples', 'Bread', 'Milk'";
      return "Almost — useState needs the array as its argument:\nconst [items, setItems] = useState(['Apples', 'Bread', 'Milk'])";
    },
    feedback_wrong: `const [items, setItems] = useState(['Apples', 'Bread', 'Milk'])\n\nuseState can hold arrays. The list starts with these three items.`,
    expected: `const [items, setItems] = useState(['Apples', 'Bread', 'Milk'])`,
    seed_code: `import { useState } from 'react'

export default function ShoppingList() {
  // Step 1: declare array state — starts with Apples, Bread, Milk

}`,
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 5",
    paal: "In the JSX, render the list. Use .map() on items to return a <li> for each item. Each <li> needs a key prop. Wrap in a <ul>.",
    hint: "Map returns a new array of JSX:\n{items.map((item, index) => (\n  <li key={index}>{item}</li>\n))}",
    example_code: `<ul>
  {users.map((user, i) => (
    <li key={i}>{user.name}</li>
  ))}
</ul>`,
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      const hasBadReturn = /return\s*\(\s*\{/.test(ans);
      if (hasBadReturn) return "syntax";
      const hasMap = a.includes(".map(");
      const hasLi = a.includes("<li");
      const hasKey = a.includes("key=");
      const hasUl = a.includes("<ul");
      const hasReturn = /return\s*\(/.test(ans);
      if (hasReturn && hasMap && hasLi && hasKey && hasUl) return "correct";
      if (hasMap && hasLi && !hasKey) return "partial_key";
      if (hasMap && hasLi && hasKey && !hasUl) return "partial_ul";
      if (hasMap && !hasLi) return "partial_li";
      if (a.includes("items") && !hasMap) return "partial_map";
      return "wrong";
    },
    feedback_correct: "✅ .map() transforms each array item into a <li>. React renders all of them. key= lets React efficiently update only what changed.",
    feedback_syntax: "Syntax error: return(){\n  is not valid. Use return ( to wrap JSX.",
    feedback_partial_key: "Good map and <li> — but each <li> needs a key prop. Add key={index}:\n<li key={index}>{item}</li>",
    feedback_partial_ul: "Almost — wrap the mapped list in a <ul> so the browser knows it's a list:\n<ul>{items.map(...)}</ul>",
    feedback_partial_li: "map() is there — now return a <li> for each item:\nitems.map((item, index) => <li key={index}>{item}</li>)",
    feedback_partial_map: "You have the items array — now use .map() to turn it into JSX:\nitems.map((item, index) => <li key={index}>{item}</li>)",
    feedback_wrong: `return (
  <div>
    <ul>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  </div>
)`,
    expected: `{items.map((item, index) => (
  <li key={index}>{item}</li>
))}`,
    seed_code: `import { useState } from 'react'

export default function ShoppingList() {
  const [items, setItems] = useState(['Apples', 'Bread', 'Milk'])

  // Step 2: render the list using .map() — each item gets a <li key={index}>

}`,
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 5",
    paal: "In the JSX, add an input and an 'Add' button above the list. The input should be controlled — wire it to a separate state variable called newItem (setter: setNewItem), starting as an empty string.",
    hint: "Two pieces of state: items (the list) and newItem (what's being typed):\nconst [newItem, setNewItem] = useState(\"\")\n\nThen wire the input:\n<input value={newItem} onChange={(e) => setNewItem(e.target.value)} />",
    example_code: `const [query, setQuery] = useState("")
// ...
<input value={query} onChange={(e) => setQuery(e.target.value)} />
<button>Search</button>`,
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      const hasNewItem = /const\[newitem,/i.test(ans.replace(/\s/g, "")) || a.includes("newitem");
      const hasEmptyString = a.includes('usestate("")') || a.includes("usestate('')");
      const hasInput = a.includes("<input");
      const hasOnChange = a.includes("onchange={");
      const hasButton = a.includes("<button");
      const hasMap = a.includes(".map(");
      if (hasNewItem && hasEmptyString && hasInput && hasOnChange && hasButton && hasMap) return "correct";
      if (hasNewItem && hasInput && !hasOnChange) return "partial_wire";
      if (!hasNewItem && hasInput) return "partial_state";
      if (hasNewItem && !hasInput) return "partial_input";
      if (a.includes("input") || a.includes("button")) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Two state variables — items for the list, newItem for the typed text. Controlled input wired up. Ready to wire the Add button.",
    feedback_partial_wire: "newItem state is there — now wire the input:\n<input value={newItem} onChange={(e) => setNewItem(e.target.value)} />\n\nNote: the onChange handler is separate from addItem. addItem comes in Step 4 — it appends to the list. The onChange handler just updates the input text as you type.",
    feedback_partial_state: "Input is there — but you need a second state variable for what's being typed:\nconst [newItem, setNewItem] = useState(\"\")",
    feedback_partial_input: "newItem state is declared — now add the controlled input and button to the JSX.",
    feedback_partial: "You need: a newItem state variable, a controlled input wired to it, and an Add button.",
    feedback_wrong: `const [newItem, setNewItem] = useState("")\n// ...\n<input value={newItem} onChange={(e) => setNewItem(e.target.value)} />\n<button>Add</button>`,
    expected: `const [newItem, setNewItem] = useState("")`,
    seed_code: `import { useState } from 'react'

export default function ShoppingList() {
  const [items, setItems] = useState(['Apples', 'Bread', 'Milk'])

  // Step 3: add newItem state + controlled input + Add button (keep the map below)
  return (
    <div>
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  )
}`,
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 5",
    paal: "Wire the Add button. Write a function called addItem that appends newItem to the items array using the spread operator, then clears the input.",
    hint: "Never push() — always create a new array:\nconst addItem = () => {\n  setItems(prev => [...prev, newItem])\n  setNewItem('')\n}",
    example_code: `const addTodo = () => {
  setTodos(prev => [...prev, newTodo])
  setNewTodo('')
}`,
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      const hasSpread = a.includes("...prev") || a.includes("...items");
      const hasSetItems = a.includes("setitems");
      const hasClear = a.includes("setnewitem('')") || a.includes('setnewitem("")');
      const hasOnClick = a.includes("onclick={");
      const hasFn = a.includes("additem") || (a.includes("const") && a.includes("=>") && hasSetItems);
      if (hasFn && hasSpread && hasSetItems && hasClear && hasOnClick) return "correct";
      if (hasSpread && hasSetItems && !hasClear) return "partial_clear";
      if (hasSetItems && !hasSpread) return "partial_spread";
      if (hasFn && !hasOnClick) return "partial_onclick";
      if (hasSetItems) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ [...prev, newItem] creates a new array — React sees a new reference and re-renders. setNewItem('') clears the input after adding.",
    feedback_partial_clear: "Spread is right — but don't forget to clear the input after adding:\nsetNewItem('')",
    feedback_partial_spread: "setItems is there — but use spread to create a new array, not push or direct assignment:\nsetItems(prev => [...prev, newItem])\n\nIf your addItem function only calls setNewItem — that's the onChange handler. addItem should append to the list.",
    feedback_partial_onclick: "addItem function looks good — now wire it to the button:\n<button onClick={addItem}>Add</button>",
    feedback_partial: "Use spread to add without mutating:\nsetItems(prev => [...prev, newItem])\nsetNewItem('')",
    feedback_wrong: `const addItem = () => {
  setItems(prev => [...prev, newItem])
  setNewItem('')
}
// and on the button:
<button onClick={addItem}>Add</button>`,
    expected: `const addItem = () => {
  setItems(prev => [...prev, newItem])
  setNewItem('')
}`,
    seed_code: `import { useState } from 'react'

export default function ShoppingList() {
  const [items, setItems] = useState(['Apples', 'Bread', 'Milk'])
  const [newItem, setNewItem] = useState('')

  // Step 4: write addItem — spreads newItem into items, clears input
  return (
    <div>
      <input value={newItem} onChange={(e) => setNewItem(e.target.value)} />
      <button>Add</button>
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  )
}`,
  },
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 5",
    paal: "In the JSX, add a Remove button inside each <li>. Wire it to remove that item using .filter(). Each click removes exactly that item from the list.",
    hint: "filter() keeps items that don't match the index:\nsetItems(prev => prev.filter((_, i) => i !== index))\n\nAdd a button inside the <li> with onClick wired to this.",
    example_code: `{todos.map((todo, i) => (
  <li key={i}>
    {todo}
    <button onClick={() => setTodos(p => p.filter((_, j) => j !== i))}>✕</button>
  </li>
))}`,
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      const hasFilter = a.includes(".filter(");
      const hasSetItems = a.includes("setitems");
      const hasButton = a.includes("<button");
      const hasOnClick = a.includes("onclick={");
      const hasMap = a.includes(".map(");
      const hasIndex = a.includes("index") || a.includes("!==");
      if (hasFilter && hasSetItems && hasButton && hasOnClick && hasMap && hasIndex) return "correct";
      if (hasFilter && hasSetItems && !hasButton) return "partial_button";
      if (hasSetItems && !hasFilter) return "partial_filter";
      if (hasButton && !hasOnClick) return "partial_onclick";
      return "wrong";
    },
    feedback_correct: "✅ filter() creates a new array without the removed item. React sees the new reference and re-renders the shorter list.",
    feedback_partial_button: "Filter logic is right — now add the Remove button inside each <li> with onClick wired to it.",
    feedback_partial_filter: "Button is there — but use filter to remove, not splice or direct mutation:\nsetItems(prev => prev.filter((_, i) => i !== index))",
    feedback_partial_onclick: "Button is in the JSX — wire its onClick:\n<button onClick={() => setItems(prev => prev.filter((_, i) => i !== index))}>Remove</button>",
    feedback_wrong: `{items.map((item, index) => (
  <li key={index}>
    {item}
    <button onClick={() => setItems(prev => prev.filter((_, i) => i !== index))}>
      Remove
    </button>
  </li>
))}`,
    expected: `setItems(prev => prev.filter((_, i) => i !== index))`,
    seed_code: `import { useState } from 'react'

export default function ShoppingList() {
  const [items, setItems] = useState(['Apples', 'Bread', 'Milk'])
  const [newItem, setNewItem] = useState('')

  const addItem = () => {
    setItems(prev => [...prev, newItem])
    setNewItem('')
  }

  // Step 5: add Remove button inside each <li> using filter()
  return (
    <div>
      <input value={newItem} onChange={(e) => setNewItem(e.target.value)} />
      <button onClick={addItem}>Add</button>
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  )
}`,
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Array state", id: "step1" },
  { label: "Step 2 — Render list", id: "step2" },
  { label: "Step 3 — Add input", id: "step3" },
  { label: "Step 4 — Add item", id: "step4" },
  { label: "Step 5 — Remove item", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: 6, title: "List Rendering with map()", shortName: "LIST RENDERING" });
