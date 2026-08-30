import createINPACTEngine from "../inpact_engine_shared";
import { useState } from 'react';

// Module-scope types
interface Item {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'completed' | 'overdue';
  dueDate?: string;
  completedDate?: string;
}

type FilterStatus = 'all' | 'active' | 'pending' | 'completed' | 'overdue';

export const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "filtered-list-view",
      title: "Client-Side Filtering and Dedicated Views",
      body: `
When applications display lists of data, users often need to narrow down what they see to find relevant information quickly. Imagine a dashboard with hundreds or thousands of items. Without a way to filter, navigating such a list becomes cumbersome and inefficient. This pattern addresses the challenge of presenting large datasets in a manageable way by allowing users to dynamically adjust the displayed content based on specific criteria, improving usability and data accessibility. It's about giving the user control over their view of the data without requiring a full page reload or complex server-side requests for every small change.

This fundamental pattern appears everywhere from simple settings panels to complex data analytics dashboards. You'll encounter it in email clients where you filter by "unread" or "starred," in e-commerce sites filtering products by "in stock" or "on sale," or in project management tools filtering tasks by "assigned to me" or "due today." Mastering client-side filtering and the ability to present dedicated, pre-filtered views from a common data source is crucial for building responsive and user-friendly interfaces that adapt to diverse user needs.
      `,
      usecase: "A project management dashboard where users filter tasks by status (e.g., 'pending', 'completed', 'overdue') and can navigate to a separate 'Completed Tasks History' screen.",
      designMock: {"kind":"list-and-form","screenTitle":"Item Dashboard","caption":"Filter items by their status or view a dedicated history list.","listCaption":"Active Items","emptyCaption":"No Items","emptyMessage":"No items match the current filter.","rows":[{"title":"Item Alpha","subtitle":"Status: Active","meta":"Category: A"},{"title":"Item Beta","subtitle":"Status: Pending","meta":"Category: B"}],"fields":[{"label":"Item Name","sample":"New Item"},{"label":"Status","sample":"Active"}],"submitLabel":"Add Item"}
    }
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Implement state to manage the currently active filter.",
      "Create UI controls (buttons) to change the filter state.",
      "Dynamically filter a list of items based on the active filter state.",
      "Implement a 'clear filter' mechanism to reset the view.",
      "Create a separate, dedicated view that displays a pre-filtered subset of the data.",
      "Navigate between the main filtered list and the dedicated view using state."
    ]
  },
  // Step 1: Imports
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 7",
    paal: "To manage dynamic UI states like the active filter or which view is currently displayed, you need to import the `useState` hook from React. This hook allows a functional component to maintain its own state.",
    hint: "The `useState` hook is a named export from the 'react' library.",
    example_code: `import { useState } from 'react';`,
    think_prompt: "Which line correctly imports the `useState` hook for use in a functional component?",
    mc_options: [
      "import React, { useState } from 'react';",
      "import { useState } from 'react';",
      "import useState from 'react';"
    ],
    mc_correct_option: "import { useState } from 'react';",
    mc_anchor: "import { useState } from 'react';",
    why_this_matters: "Correctly importing hooks is the first step to enabling stateful logic in functional components. Without `useState`, your components cannot manage internal data that changes over time, which is essential for interactive features like filtering or toggling views.",
    answer_keywords: ["useState", "import", "react", "hook"],
    seed_code: ``,
    starter_code: `// Add the necessary import for state management here.`,
    feedback_correct: "Excellent! `useState` is a named export, so curly braces are required. This import makes the hook available for use.",
    feedback_partial: "You're close, but `useState` is a named export. Remember to use curly braces for named exports.",
    feedback_wrong: "That's not quite right. `useState` is a named export from 'react', not a default export. Review how named exports are imported.",
    expected: `import { useState } from 'react';`,
    analog_example: `// In a different context, like managing a shopping cart's open/closed state:
import { useState } from 'react';

function ShoppingCartIcon(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  // ... rest of component logic
  return (
    <button onClick={() => setIsOpen(!isOpen)}>
      Cart (\${isOpen ? 'Open' : 'Closed'})
    </button>
  );
}`,
    deepDiveLabel: "Why do we need to import `useState` specifically?",
    deepDive: {
      hook: `Imagine you're building a simple counter. Every time a user clicks a button, the number on the screen should increase. If you just declare a regular JavaScript variable inside your component, say \`let count = 0;\`, and try to increment it, you'll quickly notice a problem: the screen doesn't update. Even if the variable changes, React doesn't know about it, and therefore doesn't re-render your component to show the new value. This leads to a frustrating user experience where interactions seem to have no effect, and developers are left scratching their heads trying to figure out why their UI isn't reflecting their data changes. This gap between data changes and UI updates is a common source of bugs and a major hurdle for building dynamic applications.`,
      pain: `⚠️ **Lesson:** Functional components, by default, don't "remember" values between renders, and changes to regular variables don't trigger re-renders.
**Symptom:** UI elements fail to update visually when their underlying data changes, leading to a static or unresponsive user interface.`,
      mentalModel: `**Mental model:** The "Component Memory Hook." Think of \`useState\` as providing a special, persistent memory slot for your component. When you declare state with \`useState\`, React allocates a dedicated piece of memory for that variable that persists across re-renders. Crucially, when you use the "setter" function provided by \`useState\` (e.g., \`setCount\`), React not only updates the value in that memory slot but also automatically knows that the component needs to be re-rendered with the new value. This is the core mechanism that makes your functional components dynamic and interactive, allowing them to respond to user input and display changing data.`,
      discover: `**Pattern - name:** Importing \`useState\`
\`\`\`tsx
import { useState } from 'react';

function MyComponent(): JSX.Element {
  const [value, setValue] = useState(initialValue);
  // ... component logic
}
\`\`\`
- \`useState\` is a named export from the 'react' library, hence the curly braces.
- It must be imported at the top of the file where it's used.
- It allows functional components to manage local, reactive state.
- The \`useState\` hook returns an array containing the current state value and a function to update it.`,
      quickRules: `**Quick rules:**
- ✅ Always import \`useState\` using named import syntax: \`import { useState } from 'react';\`.
- ✅ Use \`useState\` at the top level of your functional component.
- ✅ Use the setter function (e.g., \`setCount\`) to update state and trigger re-renders.
- ✅ Initialize state with a default value, even if it's \`null\` or \`undefined\`.
- ❌ Never import \`useState\` as a default import: \`import useState from 'react';\`.
- ❌ Never call \`useState\` inside loops, conditions, or nested functions.
- ❌ Never directly modify the state variable (e.g., \`count++\`); always use the setter.`,
      watchOut: `👀 **Watch out:** Forgetting to use the setter function returned by \`useState\` is a common pitfall. If you directly modify the state variable (e.g., \`myArray.push(newItem)\` instead of \`setMyArray([...myArray, newItem])\`), React won't detect the change and your component won't re-render. Always use the setter to ensure React's reactivity system is engaged.`,
      dryRun: `🔁 **Think:** If a component has \`const [count, setCount] = useState(0);\` and a button calls \`setCount(count + 1);\`.
1. Initial render: \`count\` is 0.
2. User clicks button: \`setCount(0 + 1)\` is called. React updates \`count\` to 1 and schedules a re-render.
3. Re-render: The component function runs again, \`count\` is now 1. The UI displays 1.
(Hint: The setter function is crucial for triggering re-renders.)`,
      build: "Learning focus: Understand how to import `useState` to enable state management in functional components."
    }
  },
  // Step 2: Module-scope types
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 7",
    paal: "Before creating the component, define the data structure for your items and the possible filter states. This improves code readability and helps catch type-related errors early.",
    hint: "Use an `interface` for the item structure and a `type` alias for the filter states.",
    example_code: `
interface Item {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'completed' | 'overdue';
  dueDate?: string;
  completedDate?: string;
}

type FilterStatus = 'all' | 'active' | 'pending' | 'completed' | 'overdue';
`,
    think_prompt: "Which code block correctly defines an `Item` interface with `id`, `name`, `status`, and optional `dueDate`/`completedDate` fields, and a `FilterStatus` type alias?",
    mc_options: [
      `interface Item { id: string; name: string; status: string; } type FilterStatus = string;`,
      `interface Item { id: string; name: string; status: 'active' | 'pending' | 'completed' | 'overdue'; dueDate?: string; completedDate?: string; } type FilterStatus = 'all' | 'active' | 'pending' | 'completed' | 'overdue';`,
      `type Item = { id: string, name: string, status: string }; interface FilterStatus { all: boolean; active: boolean; }`
    ],
    mc_correct_option: `interface Item { id: string; name: string; status: 'active' | 'pending' | 'completed' | 'overdue'; dueDate?: string; completedDate?: string; } type FilterStatus = 'all' | 'active' | 'pending' | 'completed' | 'overdue';`,
    mc_anchor: `interface Item { id: string; name: string; status: 'active' | 'pending' | 'completed' | 'overdue'; dueDate?: string; completedDate?: string; } type FilterStatus = 'all' | 'active' | 'pending' | 'completed' | 'overdue';`,
    why_this_matters: "Defining types upfront provides clarity on the data you're working with. It enables TypeScript to perform static analysis, catching potential errors related to incorrect data shapes or invalid filter values before your code even runs, leading to more robust and maintainable applications.",
    answer_keywords: ["interface", "type", "data structure", "TypeScript", "enum"],
    seed_code: `import { useState } from 'react';`,
    starter_code: `import { useState } from 'react';

// Define your Item interface and FilterStatus type here.`,
    feedback_correct: "Spot on! These type definitions clearly outline the structure of your data and the valid states for your filter, making your code safer and easier to understand.",
    feedback_partial: "You've defined the types, but ensure the `status` field in `Item` and the `FilterStatus` type use literal string unions for better type safety, rather than just `string`.",
    feedback_wrong: "Not quite. The `Item` interface needs specific fields and the `FilterStatus` should be a union of literal strings, not an object or a generic string. Review how to define interfaces and type aliases for specific values.",
    expected: `import { useState } from 'react';

interface Item {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'completed' | 'overdue';
  dueDate?: string;
  completedDate?: string;
}

type FilterStatus = 'all' | 'active' | 'pending' | 'completed' | 'overdue';`,
    analog_example: `// In an e-commerce application, defining product and category types:
interface Product {
  id: string;
  name: string;
  price: number;
  category: 'electronics' | 'books' | 'clothing';
  inStock: boolean;
}

type ProductCategory = 'all' | 'electronics' | 'books' | 'clothing';

// This helps ensure products always have valid categories and filters only use known categories.`,
    deepDiveLabel: "Why use literal string unions instead of just `string` for status?",
    deepDive: {
      hook: `Imagine you're building a system where items can have specific statuses like 'active', 'pending', or 'completed'. If you simply define the \`status\` property as a generic \`string\`, TypeScript won't prevent you from accidentally assigning a typo like 'activ' or 'pendinng', or even a completely irrelevant string like 'banana'. Your code might compile without errors, but at runtime, these invalid status values could lead to unexpected behavior, broken filters, or UI glitches. Debugging such issues can be incredibly time-consuming, as the error isn't caught until the application is actually running and encountering the bad data. This lack of compile-time safety makes your application fragile.`,
      pain: `⚠️ **Lesson:** Using generic types like \`string\` for properties that should have a limited set of values can lead to runtime errors due to typos or invalid assignments.
**Symptom:** Data inconsistencies, unexpected application behavior, and difficult-to-diagnose bugs that only appear at runtime.`,
      mentalModel: `**Mental model:** The "Type-Safe Enumeration." Instead of relying on runtime checks or hoping developers remember the exact string values, literal string unions act like a compile-time enumeration. You're telling TypeScript, "This variable can *only* be one of these specific string values." It's like having a strict checklist for every assignment. If you try to assign anything not on the list, TypeScript immediately flags it as an error. This shifts potential bugs from runtime to compile-time, making development much safer and faster, as you get instant feedback on invalid data.`,
      discover: `**Pattern - name:** Literal String Union Types
\`\`\`tsx
type Status = 'draft' | 'published' | 'archived';

interface Article {
  id: string;
  title: string;
  status: Status; // Enforces 'draft', 'published', or 'archived'
}

const myArticle: Article = { id: '1', title: 'Hello', status: 'published' }; // OK
// const anotherArticle: Article = { id: '2', title: 'World', status: 'pending' }; // Type error!
\`\`\`
- Defines a type that can only hold one of a specified set of string literal values.
- Provides compile-time safety, preventing typos and invalid assignments.
- Improves code readability by clearly documenting expected values.
- Can be used directly in interfaces or as standalone type aliases.`,
      quickRules: `**Quick rules:**
- ✅ Use literal string unions when a property or variable should be restricted to a known, finite set of string values.
- ✅ Define these unions using the \`type\` keyword (e.g., \`type Color = 'red' | 'green' | 'blue';\`).
- ✅ Leverage them in interfaces or function signatures for strong type checking.
- ✅ They are excellent for representing states, categories, or fixed options.
- ❌ Avoid using \`string\` when a more specific literal union is appropriate.
- ❌ Don't use them for values that are truly free-form text (e.g., user input for a name).
- ❌ Do not try to dynamically generate the union members at runtime; they are compile-time constructs.`,
      watchOut: `👀 **Watch out:** While powerful, literal string unions can become verbose if you have many possible values. For very large or frequently changing sets of values, consider using an actual \`enum\` (if the values are truly fixed and numeric-like) or a runtime object with \`keyof typeof\` for string values, though the latter adds a bit more complexity. For the typical small set of statuses or categories, literal unions are ideal.`,
      dryRun: `🔁 **Think:**
1. You have \`type Status = 'open' | 'closed';\`
2. You declare \`let currentStatus: Status = 'open';\` // This is valid.
3. You try to assign \`currentStatus = 'pending';\` // TypeScript immediately flags an error because 'pending' is not in the 'open' | 'closed' union.
(Hint: The type system catches errors before execution.)`,
      build: "Learning focus: Define `Item` interface and `FilterStatus` type for structured and type-safe data handling."
    }
  },
  // Step 3: Component/function shell
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 7",
    paal: "Now, create the main functional component that will house your filtering logic and display the items. This component will serve as the root for your dashboard.",
    hint: "Define a functional component named `ItemDashboard` that returns `JSX.Element`.",
    example_code: `
const ItemDashboard = (): JSX.Element => {
  return (
    <div className="item-dashboard">
      <h1>Item Dashboard</h1>
      {/* Content will go here */}
    </div>
  );
};
`,
    think_prompt: "Which code block correctly defines a functional component named `ItemDashboard`?",
    mc_options: [
      `function ItemDashboard(): JSX.Element { return <div></div>; }`,
      `const ItemDashboard = (): JSX.Element => { return <div></div>; };`,
      `const ItemDashboard = () => <div></div>;`
    ],
    mc_correct_option: `const ItemDashboard = (): JSX.Element => { return <div></div>; };`,
    mc_anchor: `const ItemDashboard = (): JSX.Element => { return <div></div>; };`,
    why_this_matters: "Establishing the component shell is the foundational step for any React application. It provides the container where all your UI elements, state, and logic will reside, ensuring your application has a clear, modular structure.",
    answer_keywords: ["functional component", "JSX.Element", "arrow function", "component shell"],
    seed_code: `import { useState } from 'react';

interface Item {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'completed' | 'overdue';
  dueDate?: string;
  completedDate?: string;
}

type FilterStatus = 'all' | 'active' | 'pending' | 'completed' | 'overdue';`,
    starter_code: `import { useState } from 'react';

interface Item {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'completed' | 'overdue';
  dueDate?: string;
  completedDate?: string;
}

type FilterStatus = 'all' | 'active' | 'pending' | 'completed' | 'overdue';

// Create your ItemDashboard functional component here.`,
    feedback_correct: "Perfect! This sets up your main component with a clear return type, ready to be populated with state and UI.",
    feedback_partial: "You've defined a functional component, but it's good practice to explicitly type its return value as `JSX.Element` for clarity and type safety.",
    feedback_wrong: "That's not quite the standard functional component definition. Ensure you're using an arrow function or a function declaration, and explicitly type the return as `JSX.Element`.",
    expected: `import { useState } from 'react';

interface Item {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'completed' | 'overdue';
  dueDate?: string;
  completedDate?: string;
}

type FilterStatus = 'all' | 'active' | 'pending' | 'completed' | 'overdue';

const ItemDashboard = (): JSX.Element => {
  return (
    <div className="item-dashboard">
      <h1>Item Dashboard</h1>
      {/* Content will go here */}
    </div>
  );
};`,
    analog_example: `// A simple counter component shell:
import { useState } from 'react';

const Counter = (): JSX.Element => {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
};`,
    deepDiveLabel: "Why is it good practice to explicitly type a component's return as `JSX.Element`?",
    deepDive: {
      hook: `Imagine you're working on a large team project. One developer writes a component, and another needs to use it. If the component's return type isn't explicitly defined, it's not immediately clear what kind of output to expect. What if, due to a refactoring error, the component accidentally returns a string, a number, or even \`undefined\` instead of valid JSX? Without an explicit return type, TypeScript might not catch this mistake, leading to cryptic runtime errors in the parent component that tries to render invalid output. This ambiguity can slow down development, increase debugging time, and make code harder to maintain and understand for others (or your future self).`,
      pain: `⚠️ **Lesson:** Omitting explicit return types for functional components can lead to ambiguity, missed type errors, and runtime failures when invalid output is accidentally returned.
**Symptom:** Unclear component contracts, unexpected rendering issues, and type-related bugs that are only discovered during execution.`,
      mentalModel: `**Mental model:** The "Component Contract." Explicitly typing a component's return as \`JSX.Element\` is like signing a contract. You're declaring, "This component promises to always return valid JSX that React can render." This contract provides clarity for anyone using or maintaining the component. If you accidentally write code that returns something else, TypeScript immediately flags it, enforcing the contract at compile-time. This ensures that components consistently produce renderable output, making your application more predictable and robust. It's a small addition that yields significant benefits in terms of code quality and maintainability.`,
      discover: `**Pattern - name:** Explicit \`JSX.Element\` Return Type
\`\`\`tsx
// Good practice: explicit return type
const MyComponent = (): JSX.Element => {
  // ... logic
  return (
    <div>Hello</div>
  );
};

// Less explicit, but often inferred by TypeScript
// const MyComponent = () => {
//   // ... logic
//   return (
//     <div>Hello</div>
//   );
// };
\`\`\`
- \`JSX.Element\` is a global type available in TypeScript React projects.
- It explicitly states that the component will return a valid React element.
- Improves type safety by catching cases where a component might accidentally return non-JSX.
- Enhances code readability and serves as clear documentation for the component's output.`,
      quickRules: `**Quick rules:**
- ✅ Explicitly type functional component returns as \`JSX.Element\` for clarity.
- ✅ Use \`JSX.Element\` when your component always returns a single React element or \`null\`.
- ✅ This helps TypeScript enforce that your component produces renderable output.
- ✅ It's particularly useful in larger codebases or when components are complex.
- ❌ Avoid typing as \`any\` or omitting the type entirely for component returns.
- ❌ Do not import \`JSX\` from 'react'; it's globally available in .tsx files.
- ❌ Don't use \`React.FC\` (or \`FunctionComponent\`) as a type for components, as it's discouraged.`,
      watchOut: `👀 **Watch out:** While \`JSX.Element\` is generally preferred, if a component *might* return \`string\`, \`number\`, \`boolean\`, \`null\`, or \`undefined\` (e.g., a helper component that renders text directly or nothing at all), you might need a broader return type like \`React.ReactNode\`. However, for typical UI components, \`JSX.Element\` is usually sufficient and more precise.`,
      dryRun: `🔁 **Think:**
1. Component defined as \`const MyComponent = (): JSX.Element => { return 'Hello'; };\` // TypeScript error: Type 'string' is not assignable to type 'JSX.Element'.
2. Component defined as \`const MyComponent = (): JSX.Element => { return <div>Hello</div>; };\` // Valid.
3. Component defined as \`const MyComponent = () => { return 'Hello'; };\` // No TypeScript error, but will fail at runtime if a parent expects JSX.
(Hint: Explicit typing catches errors early.)`,
      build: "Learning focus: Create the `ItemDashboard` component shell, ensuring it returns `JSX.Element`."
    }
  },
  // Step 4: State + local variables
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 7",
    paal: "Inside your `ItemDashboard` component, initialize the necessary state variables. You'll need state for the list of items, the currently active filter, and a boolean to toggle the dedicated history view.",
    hint: "Use `useState` for `items`, `currentFilter`, and `showCompletedHistory`.",
    example_code: `
const ItemDashboard = (): JSX.Element => {
  const [items, setItems] = useState<Item[]>([
    { id: '1', name: 'Review Q4 Report', status: 'pending', dueDate: '2023-12-15' },
    { id: '2', name: 'Schedule Team Sync', status: 'active', dueDate: '2023-12-01' },
    { id: '3', name: 'Complete Onboarding Docs', status: 'completed', completedDate: '2023-11-20' },
    { id: '4', name: 'Follow up with Client X', status: 'overdue', dueDate: '2023-11-10' },
    { id: '5', name: 'Plan Holiday Event', status: 'active', dueDate: '2023-12-20' },
    { id: '6', name: 'Archive Old Projects', status: 'completed', completedDate: '2023-11-25' },
  ]);
  const [currentFilter, setCurrentFilter] = useState<FilterStatus>('all');
  const [showCompletedHistory, setShowCompletedHistory] = useState<boolean>(false);

  return (
    <div className="item-dashboard">
      <h1>Item Dashboard</h1>
      {/* Content will go here */}
    </div>
  );
};
`,
    think_prompt: "Which code block correctly initializes state for `items` (with sample data), `currentFilter` (defaulting to 'all'), and `showCompletedHistory` (defaulting to `false`)?",
    mc_options: [
      `const [items, setItems] = useState([]); const [currentFilter, setCurrentFilter] = useState('all'); const [showCompletedHistory, setShowCompletedHistory] = useState(false);`,
      `const [items, setItems] = useState<Item[]>([{ id: '1', name: 'Test', status: 'active' }]); const [currentFilter, setCurrentFilter] = useState<FilterStatus>('all'); const [showCompletedHistory, setShowCompletedHistory] = useState<boolean>(false);`,
      `let items = []; let currentFilter = 'all'; let showCompletedHistory = false;`
    ],
    mc_correct_option: `const [items, setItems] = useState<Item[]>([{ id: '1', name: 'Test', status: 'active' }]); const [currentFilter, setCurrentFilter] = useState<FilterStatus>('all'); const [showCompletedHistory, setShowCompletedHistory] = useState<boolean>(false);`,
    mc_anchor: `const [items, setItems] = useState<Item[]>([{ id: '1', name: 'Test', status: 'active' }]); const [currentFilter, setCurrentFilter] = useState<FilterStatus>('all'); const [showCompletedHistory, setShowCompletedHistory] = useState<boolean>(false);`,
    why_this_matters: "State management is the heart of dynamic React applications. By initializing these state variables, you establish the core data that your component will display and interact with. Changes to these states will automatically trigger re-renders, making your UI responsive to user actions like filtering or switching views.",
    answer_keywords: ["useState", "state initialization", "items", "filter", "boolean state"],
    seed_code: `import { useState } from 'react';

interface Item {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'completed' | 'overdue';
  dueDate?: string;
  completedDate?: string;
}

type FilterStatus = 'all' | 'active' | 'pending' | 'completed' | 'overdue';

const ItemDashboard = (): JSX.Element => {
  return (
    <div className="item-dashboard">
      <h1>Item Dashboard</h1>
      {/* Content will go here */}
    </div>
  );
};`,
    starter_code: `import { useState } from 'react';

interface Item {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'completed' | 'overdue';
  dueDate?: string;
  completedDate?: string;
}

type FilterStatus = 'all' | 'active' | 'pending' | 'completed' | 'overdue';

const ItemDashboard = (): JSX.Element => {
  // Initialize state variables here: items, currentFilter, showCompletedHistory

  return (
    <div className="item-dashboard">
      <h1>Item Dashboard</h1>
      {/* Content will go here */}
    </div>
  );
};`,
    feedback_correct: "Excellent! You've set up all the necessary state variables with appropriate initial values and types. Your component is now ready to manage its data.",
    feedback_partial: "You've initialized the state variables, but ensure you're using explicit type annotations with `useState` (e.g., `useState<Item[]>`) for better type safety and clarity.",
    feedback_wrong: "You've declared variables, but not as React state. Remember to use the `useState` hook to ensure your variables are reactive and trigger re-renders when they change. Also, ensure correct types.",
    expected: `import { useState } from 'react';

interface Item {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'completed' | 'overdue';
  dueDate?: string;
  completedDate?: string;
}

type FilterStatus = 'all' | 'active' | 'pending' | 'completed' | 'overdue';

const ItemDashboard = (): JSX.Element => {
  const [items, setItems] = useState<Item[]>([
    { id: '1', name: 'Review Q4 Report', status: 'pending', dueDate: '2023-12-15' },
    { id: '2', name: 'Schedule Team Sync', status: 'active', dueDate: '2023-12-01' },
    { id: '3', name: 'Complete Onboarding Docs', status: 'completed', completedDate: '2023-11-20' },
    { id: '4', name: 'Follow up with Client X', status: 'overdue', dueDate: '2023-11-10' },
    { id: '5', name: 'Plan Holiday Event', status: 'active', dueDate: '2023-12-20' },
    { id: '6', name: 'Archive Old Projects', status: 'completed', completedDate: '2023-11-25' },
  ]);
  const [currentFilter, setCurrentFilter] = useState<FilterStatus>('all');
  const [showCompletedHistory, setShowCompletedHistory] = useState<boolean>(false);

  return (
    <div className="item-dashboard">
      <h1>Item Dashboard</h1>
      {/* Content will go here */}
    </div>
  );
};`,
    analog_example: `// In a product listing component, managing product data, search term, and category filter:
import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  category: 'electronics' | 'books' | 'clothing';
  price: number;
}

type ProductCategory = 'all' | 'electronics' | 'books' | 'clothing';

const ProductList = (): JSX.Element => {
  const [products, setProducts] = useState<Product[]>([
    { id: 'p1', name: 'Laptop', category: 'electronics', price: 1200 },
    { id: 'p2', name: 'Novel', category: 'books', price: 25 },
    { id: 'p3', name: 'T-Shirt', category: 'clothing', price: 30 },
  ]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory>('all');

  return (
    <div>
      {/* ... UI elements ... */}
    </div>
  );
};`,
    deepDiveLabel: "Why is it important to use `useState` for `items` even if the data is initially static?",
    deepDive: {
      hook: `Imagine you're building a feature where users can add new items to a list, or perhaps delete existing ones. If your \`items\` data is just a regular JavaScript array declared with \`const initialItems = [...];\` inside your component, and you try to modify it directly (e.g., \`initialItems.push(newItem)\`), two problems arise. First, directly modifying a \`const\` array is generally bad practice and can lead to unexpected behavior or errors. Second, and more critically for React, even if you could modify it, React would have no way of knowing that the \`items\` array has changed. Consequently, your component would not re-render, and the user would never see the added or deleted items. The UI would remain static, completely unresponsive to data changes, creating a broken and frustrating experience.`,
      pain: `⚠️ **Lesson:** Data that needs to be displayed and potentially modified by user interaction must be managed as React state to ensure reactivity and UI updates.
**Symptom:** UI elements fail to update when their underlying data changes, leading to a static or unresponsive application.`,
      mentalModel: `**Mental model:** The "Reactive Data Store." Think of \`useState\` as creating a special, observable data store for your component. When you put your \`items\` array into \`useState\`, you're telling React, "This array is important; if it changes, please re-render my component." The \`setItems\` function isn't just for changing the array; it's the *signal* to React that a change has occurred and a re-render is necessary. Even if your data starts static, wrapping it in \`useState\` prepares it for future dynamic interactions (adding, deleting, editing), ensuring that any modifications will correctly trigger UI updates. It transforms static data into dynamic, reactive data.`,
      discover: `**Pattern - name:** Initializing Dynamic Data with \`useState\`
\`\`\`tsx
interface DataItem { id: string; value: string; }

const MyList = (): JSX.Element => {
  const [data, setData] = useState<DataItem[]>([
    { id: 'a', value: 'Initial A' },
    { id: 'b', value: 'Initial B' },
  ]);

  const addItem = (newValue: string) => {
    setData(prevData => [...prevData, { id: String(Date.now()), value: newValue }]);
  };

  return (
    <div>
      {data.map(item => <p key={item.id}>{item.value}</p>)}
      <button onClick={() => addItem('New Item')}>Add Item</button>
    </div>
  );
};
\`\`\`
- Even initially static data should be in state if it might change later.
- \`useState\` provides a setter function (\`setData\`) to update the array.
- Using the setter function triggers a re-render of the component.
- This pattern ensures that any modifications to the list are reflected in the UI.`,
      quickRules: `**Quick rules:**
- ✅ Use \`useState\` for any data that the user can interact with or that changes over time.
- ✅ Initialize array state with an empty array \`[]\` or an array of initial objects.
- ✅ Always use the setter function (e.g., \`setItems\`) to update the array state.
- ✅ When updating arrays or objects, create a *new* array/object (e.g., using spread syntax \`[...old, new]\`).
- ❌ Never directly modify an array or object held in state (e.g., \`items.push()\`).
- ❌ Do not use regular \`let\` or \`const\` variables for data that needs to trigger UI updates.
- ❌ Avoid complex logic inside the \`useState\` initializer if it's expensive; use \`useMemo\` or a function initializer.`,
      watchOut: `👀 **Watch out:** When updating array or object state, you *must* provide a *new* array or object reference to the setter function. If you mutate the existing array/object and then pass the same reference, React won't detect a change and won't re-render. This is a common source of bugs where state appears to update in the console but not on the screen. Always create a shallow copy (e.g., \`[...oldArray, newItem]\`) or a deep copy if necessary.`,
      dryRun: `🔁 **Think:**
1. Initial render: \`items\` is \`[{ id: '1', name: 'Review Q4 Report', status: 'pending' }]\`.
2. User clicks "Add Item" button, calling \`setItems(prev => [...prev, newItem])\`.
3. \`setItems\` updates the state with a *new* array reference: \`[{...}, newItem]\`. React detects the change.
4. Re-render: The component function runs again, \`items\` now includes the \`newItem\`. The UI displays the updated list.
(Hint: A new array reference is key for React to detect changes.)`,
      build: "Learning focus: Initialize `items`, `currentFilter`, and `showCompletedHistory` using `useState`."
    }
  },
  // Step 5: Structure skeleton - no handlers wired yet
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 7",
    paal: "Build the basic UI structure for your dashboard. This includes filter buttons, a 'Clear Filter' button, a toggle for the history view, and containers for both the main item list and the dedicated history list.",
    hint: "Use `div` elements for layout, `button` elements for controls, and conditionally render the history view.",
    example_code: `
const ItemDashboard = (): JSX.Element => {
  const [items, setItems] = useState<Item[]>([
    { id: '1', name: 'Review Q4 Report', status: 'pending', dueDate: '2023-12-15' },
    { id: '2', name: 'Schedule Team Sync', status: 'active', dueDate: '2023-12-01' },
    { id: '3', name: 'Complete Onboarding Docs', status: 'completed', completedDate: '2023-11-20' },
    { id: '4', name: 'Follow up with Client X', status: 'overdue', dueDate: '2023-11-10' },
    { id: '5', name: 'Plan Holiday Event', status: 'active', dueDate: '2023-12-20' },
    { id: '6', name: 'Archive Old Projects', status: 'completed', completedDate: '2023-11-25' },
  ]);
  const [currentFilter, setCurrentFilter] = useState<FilterStatus>('all');
  const [showCompletedHistory, setShowCompletedHistory] = useState<boolean>(false);

  return (
    <div className="item-dashboard">
      <h1>Item Dashboard</h1>

      <div className="controls">
        <button>All</button>
        <button>Active</button>
        <button>Pending</button>
        <button>Completed</button>
        <button>Overdue</button>
        <button>Clear Filter</button>
        <button>
          {showCompletedHistory ? 'Back to Main List' : 'View Completed History'}
        </button>
      </div>

      {showCompletedHistory ? (
        <div className="completed-history">
          <h2>Completed Items History</h2>
          {/* Completed items list will go here */}
        </div>
      ) : (
        <div className="main-list">
          <h2>Current Items</h2>
          {/* Main filtered items list will go here */}
        </div>
      )}
    </div>
  );
};
`,
    think_prompt: "Which code block correctly adds filter buttons, a clear filter button, a toggle button for history, and conditional rendering for the main list vs. history list?",
    mc_options: [
      `<div><button>Filter</button></div>`,
      `<div><button>All</button><button>Active</button><button>Clear</button><button>Toggle History</button><div>Main List</div><div>History List</div></div>`,
      `<div><button>All</button><button>Active</button><button>Pending</button><button>Completed</button><button>Overdue</button><button>Clear Filter</button><button>{showCompletedHistory ? 'Back to Main List' : 'View Completed History'}</button>{showCompletedHistory ? (<div><h2>Completed Items History</h2></div>) : (<div><h2>Current Items</h2></div>)}</div>`
    ],
    mc_correct_option: `<div><button>All</button><button>Active</button><button>Pending</button><button>Completed</button><button>Overdue</button><button>Clear Filter</button><button>{showCompletedHistory ? 'Back to Main List' : 'View Completed History'}</button>{showCompletedHistory ? (<div><h2>Completed Items History</h2></div>) : (<div><h2>Current Items</h2></div>)}</div>`,
    mc_anchor: `<div><button>All</button><button>Active</button><button>Pending</button><button>Completed</button><button>Overdue</button><button>Clear Filter</button><button>{showCompletedHistory ? 'Back to Main List' : 'View Completed History'}</button>{showCompletedHistory ? (<div><h2>Completed Items History</h2></div>) : (<div><h2>Current Items</h2></div>)}</div>`,
    why_this_matters: "Building the UI skeleton first provides a visual framework for your application. It allows you to lay out the user interface elements and establish the conditional rendering logic before implementing the interactive behavior, ensuring a clear separation of concerns between structure and functionality.",
    answer_keywords: ["UI structure", "buttons", "conditional rendering", "JSX", "layout"],
    seed_code: `import { useState } from 'react';

interface Item {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'completed' | 'overdue';
  dueDate?: string;
  completedDate?: string;
}

type FilterStatus = 'all' | 'active' | 'pending' | 'completed' | 'overdue';

const ItemDashboard = (): JSX.Element => {
  const [items, setItems] = useState<Item[]>([
    { id: '1', name: 'Review Q4 Report', status: 'pending', dueDate: '2023-12-15' },
    { id: '2', name: 'Schedule Team Sync', status: 'active', dueDate: '2023-12-01' },
    { id: '3', name: 'Complete Onboarding Docs', status: 'completed', completedDate: '2023-11-20' },
    { id: '4', name: 'Follow up with Client X', status: 'overdue', dueDate: '2023-11-10' },
    { id: '5', name: 'Plan Holiday Event', status: 'active', dueDate: '2023-12-20' },
    { id: '6', name: 'Archive Old Projects', status: 'completed', completedDate: '2023-11-25' },
  ]);
  const [currentFilter, setCurrentFilter] = useState<FilterStatus>('all');
  const [showCompletedHistory, setShowCompletedHistory] = useState<boolean>(false);

  return (
    <div className="item-dashboard">
      <h1>Item Dashboard</h1>
      {/* Content will go here */}
    </div>
  );
};`,
    starter_code: `import { useState } from 'react';

interface Item {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'completed' | 'overdue';
  dueDate?: string;
  completedDate?: string;
}

type FilterStatus = 'all' | 'active' | 'pending' | 'completed' | 'overdue';

const ItemDashboard = (): JSX.Element => {
  const [items, setItems] = useState<Item[]>([
    { id: '1', name: 'Review Q4 Report', status: 'pending', dueDate: '2023-12-15' },
    { id: '2', name: 'Schedule Team Sync', status: 'active', dueDate: '2023-12-01' },
    { id: '3', name: 'Complete Onboarding Docs', status: 'completed', completedDate: '2023-11-20' },
    { id: '4', name: 'Follow up with Client X', status: 'overdue', dueDate: '2023-11-10' },
    { id: '5', name: 'Plan Holiday Event', status: 'active', dueDate: '2023-12-20' },
    { id: '6', name: 'Archive Old Projects', status: 'completed', completedDate: '2023-11-25' },
  ]);
  const [currentFilter, setCurrentFilter] = useState<FilterStatus>('all');
  const [showCompletedHistory, setShowCompletedHistory] = useState<boolean>(false);

  return (
    <div className="item-dashboard">
      <h1>Item Dashboard</h1>
      {/* Add filter buttons, clear filter, history toggle, and conditional list containers here */}
    </div>
  );
};`,
    feedback_correct: "Fantastic! Your UI now has the necessary controls and conditional rendering logic in place. The structure is ready for interaction.",
    feedback_partial: "You've added the buttons and conditional rendering, but ensure the button labels for toggling history dynamically reflect the current view (e.g., 'View History' vs. 'Back to Main').",
    feedback_wrong: "The UI structure is incomplete or incorrect. Make sure you have all the filter buttons, a clear filter button, a button to toggle the history view, and conditional rendering for the two main list sections.",
    expected: `import { useState } from 'react';

interface Item {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'completed' | 'overdue';
  dueDate?: string;
  completedDate?: string;
}

type FilterStatus = 'all' | 'active' | 'pending' | 'completed' | 'overdue';

const ItemDashboard = (): JSX.Element => {
  const [items, setItems] = useState<Item[]>([
    { id: '1', name: 'Review Q4 Report', status: 'pending', dueDate: '2023-12-15' },
    { id: '2', name: 'Schedule Team Sync', status: 'active', dueDate: '2023-12-01' },
    { id: '3', name: 'Complete Onboarding Docs', status: 'completed', completedDate: '2023-11-20' },
    { id: '4', name: 'Follow up with Client X', status: 'overdue', dueDate: '2023-11-10' },
    { id: '5', name: 'Plan Holiday Event', status: 'active', dueDate: '2023-12-20' },
    { id: '6', name: 'Archive Old Projects', status: 'completed', completedDate: '2023-11-25' },
  ]);
  const [currentFilter, setCurrentFilter] = useState<FilterStatus>('all');
  const [showCompletedHistory, setShowCompletedHistory] = useState<boolean>(false);

  return (
    <div className="item-dashboard">
      <h1>Item Dashboard</h1>

      <div className="controls">
        <button>All</button>
        <button>Active</button>
        <button>Pending</button>
        <button>Completed</button>
        <button>Overdue</button>
        <button>Clear Filter</button>
        <button>
          {showCompletedHistory ? 'Back to Main List' : 'View Completed History'}
        </button>
      </div>

      {showCompletedHistory ? (
        <div className="completed-history">
          <h2>Completed Items History</h2>
          {/* Completed items list will go here */}
        </div>
      ) : (
        <div className="main-list">
          <h2>Current Items</h2>
          {/* Main filtered items list will go here */}
        </div>
      )}
    </div>
  );
};`,
    analog_example: `// A basic layout for a photo gallery with category filters and a "favorites" toggle:
import { useState } from 'react';

const PhotoGallery = (): JSX.Element => {
  const [photos, setPhotos] = useState<string[]>(['photo1.jpg', 'photo2.jpg']);
  const [category, setCategory] = useState<'all' | 'nature' | 'urban'>('all');
  const [showFavorites, setShowFavorites] = useState<boolean>(false);

  return (
    <div className="gallery">
      <div className="filter-buttons">
        <button>All</button>
        <button>Nature</button>
        <button>Urban</button>
        <button>{showFavorites ? 'Show All' : 'Show Favorites'}</button>
      </div>
      {showFavorites ? (
        <div className="favorites-view">
          <h3>My Favorite Photos</h3>
          {/* Favorite photos will be displayed here */}
        </div>
      ) : (
        <div className="all-photos-view">
          <h3>All Photos</h3>
          {/* All photos will be displayed here */}
        </div>
      )}
    </div>
  );
};`,
    deepDiveLabel: "How does conditional rendering with the ternary operator work in JSX?",
    deepDive: {
      hook: `Imagine you have a part of your UI that should only appear under certain conditions, like a loading spinner that shows only when data is being fetched, or an error message that appears only when something goes wrong. If you simply try to use a regular \`if/else\` statement directly inside your JSX, you'll quickly find that it doesn't work. JSX is a syntax extension for JavaScript, but it's not a full programming language on its own. It's designed for declarative UI descriptions, not imperative control flow. Trying to embed complex logic directly can lead to syntax errors or force you into awkward workarounds, making your component code messy and hard to read.`,
      pain: `⚠️ **Lesson:** Direct \`if/else\` statements cannot be used inside JSX for conditional rendering, leading to syntax errors or forcing developers into less readable workarounds.
**Symptom:** JSX parsing errors when attempting to use standard JavaScript control flow statements directly within the return block of a component.`,
      mentalModel: `**Mental model:** The "Inline Branching Expression." Think of the ternary operator (\`condition ? expressionIfTrue : expressionIfFalse\`) as a compact, inline way to choose between two different JSX outputs based on a boolean condition. Unlike an \`if/else\` statement, which is a *statement* that performs an action, the ternary operator is an *expression* that evaluates to a value (in this case, a JSX element). Because JSX allows embedding JavaScript *expressions* within curly braces, the ternary operator fits perfectly. It allows you to declaratively say, "If this condition is true, render *this* JSX; otherwise, render *that* JSX," all within the flow of your component's return statement.`,
      discover: `**Pattern - name:** Ternary Operator for Conditional Rendering
\`\`\`tsx
const MyComponent = ({ isLoggedIn }: { isLoggedIn: boolean }): JSX.Element => {
  return (
    <div>
      {isLoggedIn ? (
        <p>Welcome back!</p>
      ) : (
        <button>Log In</button>
      )}
    </div>
  );
};
\`\`\`
- The ternary operator \`condition ? expressionIfTrue : expressionIfFalse\` is a JavaScript expression.
- It allows you to conditionally render one of two JSX elements or components.
- It's ideal for simple toggles or when you need to render *something* in both cases.
- For rendering nothing, you can use \`condition && <Element />\` (logical AND operator).`,
      quickRules: `**Quick rules:**
- ✅ Use the ternary operator (\`?\` \`:\`) for choosing between two distinct JSX outputs.
- ✅ Embed the ternary operator directly within JSX using curly braces \`{}\`.
- ✅ For rendering *nothing* when a condition is false, use the logical AND operator: \`condition && <Element />\`.
- ✅ Keep the expressions within the ternary operator concise for readability.
- ❌ Avoid complex, deeply nested ternary operators; refactor into helper components or functions.
- ❌ Do not use standard \`if/else\` statements directly inside JSX.
- ❌ Don't forget the colon \`:\` for the false case when using the ternary operator.`,
      watchOut: `👀 **Watch out:** While convenient, overusing deeply nested ternary operators can make your JSX hard to read and debug. If your conditional logic becomes complex, consider extracting the conditional rendering into a separate helper function or a dedicated sub-component. This improves readability and maintainability by keeping your main component's render method clean.`,
      dryRun: `🔁 **Think:**
1. \`showCompletedHistory\` is \`false\`.
2. The expression \`showCompletedHistory ? (...) : (...)\` evaluates.
3. Since \`showCompletedHistory\` is \`false\`, the part after the colon \`:\` is rendered: \`<div><h2>Current Items</h2></div>\`.
4. User clicks button, \`showCompletedHistory\` becomes \`true\`.
5. Re-render: The expression evaluates again.
6. Since \`showCompletedHistory\` is \`true\`, the part after the question mark \`?\` is rendered: \`<div><h2>Completed Items History</h2></div>\`.
(Hint: The condition dictates which branch of JSX is returned.)`,
      build: "Learning focus: Construct the UI layout with filter buttons, a history toggle, and conditional rendering for different views."
    }
  },
  // Step 6: Handlers / logic
  {
    id: "step6",
    type: "question",
    phase: "Step 6 of 7",
    paal: "Implement the logic for filtering items and toggling the history view. This involves creating functions to update the `currentFilter` and `showCompletedHistory` states, and deriving filtered lists from the main `items` state.",
    hint: "Define `handleFilterChange`, `handleClearFilter`, `handleToggleHistory`, `filteredItems`, and `completedItems`.",
    example_code: `
const ItemDashboard = (): JSX.Element => {
  const [items, setItems] = useState<Item[]>([
    { id: '1', name: 'Review Q4 Report', status: 'pending', dueDate: '2023-12-15' },
    { id: '2', name: 'Schedule Team Sync', status: 'active', dueDate: '2023-12-01' },
    { id: '3', name: 'Complete Onboarding Docs', status: 'completed', completedDate: '2023-11-20' },
    { id: '4', name: 'Follow up with Client X', status: 'overdue', dueDate: '2023-11-10' },
    { id: '5', name: 'Plan Holiday Event', status: 'active', dueDate: '2023-12-20' },
    { id: '6', name: 'Archive Old Projects', status: 'completed', completedDate: '2023-11-25' },
  ]);
  const [currentFilter, setCurrentFilter] = useState<FilterStatus>('all');
  const [showCompletedHistory, setShowCompletedHistory] = useState<boolean>(false);

  // Handlers
  const handleFilterChange = (status: FilterStatus) => {
    setCurrentFilter(status);
    setShowCompletedHistory(false); // Always go back to main list when filtering
  };

  const handleClearFilter = () => {
    setCurrentFilter('all');
    setShowCompletedHistory(false);
  };

  const handleToggleHistory = () => {
    setShowCompletedHistory(prev => !prev);
    setCurrentFilter('all'); // Reset filter when toggling history
  };

  // Derived state for filtering
  const filteredItems = items.filter(item => {
    if (currentFilter === 'all') {
      return item.status !== 'completed'; // Main list excludes completed items by default
    }
    return item.status === currentFilter;
  });

  const completedItems = items.filter(item => item.status === 'completed');

  return (
    <div className="item-dashboard">
      <h1>Item Dashboard</h1>

      <div className="controls">
        <button>All</button>
        <button>Active</button>
        <button>Pending</button>
        <button>Completed</button>
        <button>Overdue</button>
        <button>Clear Filter</button>
        <button>
          {showCompletedHistory ? 'Back to Main List' : 'View Completed History'}
        </button>
      </div>

      {showCompletedHistory ? (
        <div className="completed-history">
          <h2>Completed Items History</h2>
          {/* Completed items list will go here */}
        </div>
      ) : (
        <div className="main-list">
          <h2>Current Items</h2>
          {/* Main filtered items list will go here */}
        </div>
      )}
    </div>
  );
};
`,
    think_prompt: "Which code block correctly implements `handleFilterChange`, `handleClearFilter`, `handleToggleHistory`, `filteredItems` (excluding completed from 'all'), and `completedItems`?",
    mc_options: [
      `const handleFilterChange = (status) => {}; const filteredItems = items;`,
      `const handleFilterChange = (status: FilterStatus) => { setCurrentFilter(status); }; const handleClearFilter = () => { setCurrentFilter('all'); }; const handleToggleHistory = () => { setShowCompletedHistory(prev => !prev); }; const filteredItems = items.filter(item => currentFilter === 'all' || item.status === currentFilter); const completedItems = items.filter(item => item.status === 'completed');`,
      `const handleFilterChange = (status: FilterStatus) => { setCurrentFilter(status); setShowCompletedHistory(false); }; const handleClearFilter = () => { setCurrentFilter('all'); setShowCompletedHistory(false); }; const handleToggleHistory = () => { setShowCompletedHistory(prev => !prev); setCurrentFilter('all'); }; const filteredItems = items.filter(item => { if (currentFilter === 'all') { return item.status !== 'completed'; } return item.status === currentFilter; }); const completedItems = items.filter(item => item.status === 'completed');`
    ],
    mc_correct_option: `const handleFilterChange = (status: FilterStatus) => { setCurrentFilter(status); setShowCompletedHistory(false); }; const handleClearFilter = () => { setCurrentFilter('all'); setShowCompletedHistory(false); }; const handleToggleHistory = () => { setShowCompletedHistory(prev => !prev); setCurrentFilter('all'); }; const filteredItems = items.filter(item => { if (currentFilter === 'all') { return item.status !== 'completed'; } return item.status === currentFilter; }); const completedItems = items.filter(item => item.status === 'completed');`,
    mc_anchor: `const handleFilterChange = (status: FilterStatus) => { setCurrentFilter(status); setShowCompletedHistory(false); }; const handleClearFilter = () => { setCurrentFilter('all'); setShowCompletedHistory(false); }; const handleToggleHistory = () => { setShowCompletedHistory(prev => !prev); setCurrentFilter('all'); }; const filteredItems = items.filter(item => { if (currentFilter === 'all') { return item.status !== 'completed'; } return item.status === currentFilter; }); const completedItems = items.filter(item => item.status === 'completed');`,
    why_this_matters: "Implementing these handlers and derived states is where the core functionality of filtering and view switching comes to life. These functions directly manipulate the component's state, and the derived lists ensure that the UI always displays the correct subset of data based on the current user selections, making the application interactive and dynamic.",
    answer_keywords: ["event handlers", "filtering logic", "derived state", "array.filter", "state update"],
    seed_code: `import { useState } from 'react';

interface Item {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'completed' | 'overdue';
  dueDate?: string;
  completedDate?: string;
}

type FilterStatus = 'all' | 'active' | 'pending' | 'completed' | 'overdue';

const ItemDashboard = (): JSX.Element => {
  const [items, setItems] = useState<Item[]>([
    { id: '1', name: 'Review Q4 Report', status: 'pending', dueDate: '2023-12-15' },
    { id: '2', name: 'Schedule Team Sync', status: 'active', dueDate: '2023-12-01' },
    { id: '3', name: 'Complete Onboarding Docs', status: 'completed', completedDate: '2023-11-20' },
    { id: '4', name: 'Follow up with Client X', status: 'overdue', dueDate: '2023-11-10' },
    { id: '5', name: 'Plan Holiday Event', status: 'active', dueDate: '2023-12-20' },
    { id: '6', name: 'Archive Old Projects', status: 'completed', completedDate: '2023-11-25' },
  ]);
  const [currentFilter, setCurrentFilter] = useState<FilterStatus>('all');
  const [showCompletedHistory, setShowCompletedHistory] = useState<boolean>(false);

  return (
    <div className="item-dashboard">
      <h1>Item Dashboard</h1>

      <div className="controls">
        <button>All</button>
        <button>Active</button>
        <button>Pending</button>
        <button>Completed</button>
        <button>Overdue</button>
        <button>Clear Filter</button>
        <button>
          {showCompletedHistory ? 'Back to Main List' : 'View Completed History'}
        </button>
      </div>

      {showCompletedHistory ? (
        <div className="completed-history">
          <h2>Completed Items History</h2>
          {/* Completed items list will go here */}
        </div>
      ) : (
        <div className="main-list">
          <h2>Current Items</h2>
          {/* Main filtered items list will go here */}
        </div>
      )}
    </div>
  );
};`,
    starter_code: `import { useState } from 'react';

interface Item {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'completed' | 'overdue';
  dueDate?: string;
  completedDate?: string;
}

type FilterStatus = 'all' | 'active' | 'pending' | 'completed' | 'overdue';

const ItemDashboard = (): JSX.Element => {
  const [items, setItems] = useState<Item[]>([
    { id: '1', name: 'Review Q4 Report', status: 'pending', dueDate: '2023-12-15' },
    { id: '2', name: 'Schedule Team Sync', status: 'active', dueDate: '2023-12-01' },
    { id: '3', name: 'Complete Onboarding Docs', status: 'completed', completedDate: '2023-11-20' },
    { id: '4', name: 'Follow up with Client X', status: 'overdue', dueDate: '2023-11-10' },
    { id: '5', name: 'Plan Holiday Event', status: 'active', dueDate: '2023-12-20' },
    { id: '6', name: 'Archive Old Projects', status: 'completed', completedDate: '2023-11-25' },
  ]);
  const [currentFilter, setCurrentFilter] = useState<FilterStatus>('all');
  const [showCompletedHistory, setShowCompletedHistory] = useState<boolean>(false);

  // Implement handlers and derived state here

  return (
    <div className="item-dashboard">
      <h1>Item Dashboard</h1>

      <div className="controls">
        <button>All</button>
        <button>Active</button>
        <button>Pending</button>
        <button>Completed</button>
        <button>Overdue</button>
        <button>Clear Filter</button>
        <button>
          {showCompletedHistory ? 'Back to Main List' : 'View Completed History'}
        </button>
      </div>

      {showCompletedHistory ? (
        <div className="completed-history">
          <h2>Completed Items History</h2>
          {/* Completed items list will go here */}
        </div>
      ) : (
        <div className="main-list">
          <h2>Current Items</h2>
          {/* Main filtered items list will go here */}
        </div>
      )}
    </div>
  );
};`,
    feedback_correct: "Excellent! Your component now has the brains to respond to user input, filter data, and manage view changes. The logic is sound.",
    feedback_partial: "You've implemented the handlers and derived states, but double-check the `filteredItems` logic for the 'all' filter to ensure it correctly excludes completed items from the main list.",
    feedback_wrong: "The filtering and view toggle logic is incomplete or incorrect. Ensure all handlers correctly update state and that `filteredItems` and `completedItems` are derived correctly from the `items` state.",
    expected: `import { useState } from 'react';

interface Item {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'completed' | 'overdue';
  dueDate?: string;
  completedDate?: string;
}

type FilterStatus = 'all' | 'active' | 'pending' | 'completed' | 'overdue';

const ItemDashboard = (): JSX.Element => {
  const [items, setItems] = useState<Item[]>([
    { id: '1', name: 'Review Q4 Report', status: 'pending', dueDate: '2023-12-15' },
    { id: '2', name: 'Schedule Team Sync', status: 'active', dueDate: '2023-12-01' },
    { id: '3', name: 'Complete Onboarding Docs', status: 'completed', completedDate: '2023-11-20' },
    { id: '4', name: 'Follow up with Client X', status: 'overdue', dueDate: '2023-11-10' },
    { id: '5', name: 'Plan Holiday Event', status: 'active', dueDate: '2023-12-20' },
    { id: '6', name: 'Archive Old Projects', status: 'completed', completedDate: '2023-11-25' },
  ]);
  const [currentFilter, setCurrentFilter] = useState<FilterStatus>('all');
  const [showCompletedHistory, setShowCompletedHistory] = useState<boolean>(false);

  // Handlers
  const handleFilterChange = (status: FilterStatus) => {
    setCurrentFilter(status);
    setShowCompletedHistory(false); // Always go back to main list when filtering
  };

  const handleClearFilter = () => {
    setCurrentFilter('all');
    setShowCompletedHistory(false);
  };

  const handleToggleHistory = () => {
    setShowCompletedHistory(prev => !prev);
    setCurrentFilter('all'); // Reset filter when toggling history
  };

  // Derived state for filtering
  const filteredItems = items.filter(item => {
    if (currentFilter === 'all') {
      return item.status !== 'completed';
    }
    return item.status === currentFilter;
  });

  const completedItems = items.filter(item => item.status === 'completed');

  return (
    <div className="item-dashboard">
      <h1>Item Dashboard</h1>

      <div className="controls">
        <button>All</button>
        <button>Active</button>
        <button>Pending</button>
        <button>Completed</button>
        <button>Overdue</button>
        <button>Clear Filter</button>
        <button>
          {showCompletedHistory ? 'Back to Main List' : 'View Completed History'}
        </button>
      </div>

      {showCompletedHistory ? (
        <div className="completed-history">
          <h2>Completed Items History</h2>
          {/* Completed items list will go here */}
        </div>
      ) : (
        <div className="main-list">
          <h2>Current Items</h2>
          {/* Main filtered items list will go here */}
        </div>
      )}
    </div>
  );
};`,
    analog_example: `// In a product catalog, implementing search and category filtering logic:
import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  category: 'electronics' | 'books' | 'clothing';
  available: boolean;
}

type ProductCategory = 'all' | 'electronics' | 'books' | 'clothing';

const ProductCatalog = (): JSX.Element => {
  const [products, setProducts] = useState<Product[]>([
    { id: 'p1', name: 'Laptop', category: 'electronics', available: true },
    { id: 'p2', name: 'Novel', category: 'books', available: false },
    { id: 'p3', name: 'T-Shirt', category: 'clothing', available: true },
  ]);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('all');
  const [showUnavailable, setShowUnavailable] = useState<boolean>(false);

  const handleCategoryChange = (category: ProductCategory) => {
    setSelectedCategory(category);
    setShowUnavailable(false);
  };

  const handleToggleUnavailable = () => {
    setShowUnavailable(prev => !prev);
    setSelectedCategory('all');
  };

  const displayedProducts = products.filter(product => {
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    const availabilityMatch = showUnavailable ? !product.available : product.available;
    return categoryMatch && availabilityMatch;
  });

  const unavailableProducts = products.filter(product => !product.available);

  return (
    <div>
      {/* ... UI elements would use these handlers and derived states ... */}
    </div>
  );
};`,
    deepDiveLabel: "Why is it good practice to reset other related states when a filter or view changes?",
    deepDive: {
      hook: `Imagine a user is viewing a list of items, filtered by 'active' status. Then, they decide to click a button to view 'completed history'. If the 'active' filter remains internally applied while the 'completed history' view is shown, what happens when they click 'back to main list'? They might expect to see *all* items again, or at least the default view, but instead, they're still stuck on the 'active' filter from before. This creates a confusing and inconsistent user experience. The application doesn't behave as expected, leading to frustration and a feeling that the UI is "broken" or unresponsive, forcing the user to manually clear filters every time they switch views.`,
      pain: `⚠️ **Lesson:** Failing to reset related state variables when a primary view or filter changes can lead to inconsistent UI states and a confusing user experience.
**Symptom:** Users encounter unexpected filters or views persisting after navigation, requiring manual resets and causing frustration.`,
      mentalModel: `**Mental model:** The "Contextual Reset." Think of each major view or filtering mode as having its own expected "context." When you switch contexts (e.g., from a filtered main list to a dedicated history list), it's best practice to reset any state variables that are specific to the *previous* context or that would create an illogical combination in the *new* context. For instance, when entering the "Completed History" view, the general filter for 'active' or 'pending' items becomes irrelevant, so resetting it to 'all' or a default makes sense. This ensures that each view or mode starts from a clean, predictable state, aligning the application's behavior with user expectations and preventing confusing overlaps in state.`,
      discover: `**Pattern - name:** Contextual State Reset
\`\`\`tsx
const MyDashboard = (): JSX.Element => {
  const [currentTab, setCurrentTab] = useState<'main' | 'settings'>('main');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleTabChange = (tab: 'main' | 'settings') => {
    setCurrentTab(tab);
    // When switching tabs, clear the search query as it's specific to the main tab
    setSearchQuery('');
  };

  return (
    <div>
      <button onClick={() => handleTabChange('main')}>Main</button>
      <button onClick={() => handleTabChange('settings')}>Settings</button>

      {currentTab === 'main' && (
        <div>
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search..." />
          {/* ... main content filtered by searchQuery ... */}
        </div>
      )}
      {currentTab === 'settings' && (
        <div>
          {/* ... settings content ... */}
        </div>
      )}
    </div>
  );
};
\`\`\`
- When a major state (like \`currentTab\` or \`showCompletedHistory\`) changes, evaluate if other related states become irrelevant or contradictory.
- Reset those related states to a sensible default (e.g., \`currentFilter\` to 'all', \`searchQuery\` to empty).
- This prevents unexpected behavior and ensures a clean slate for the new context.
- Improves user experience by making the UI's behavior predictable.`,
      quickRules: `**Quick rules:**
- ✅ Reset filters when switching to a dedicated view that implies its own filtering.
- ✅ Clear search terms when navigating to a different section where search is not applicable.
- ✅ Reset pagination or sorting when applying a new, broad filter.
- ✅ Consider the user's mental model for each view and reset states that would cause confusion.
- ❌ Avoid resetting states that are truly global or intended to persist across views.
- ❌ Don't over-reset; only clear states that are directly impacted or become irrelevant.
- ❌ Do not rely on users to manually clear conflicting states; automate it.`,
      watchOut: `👀 **Watch out:** While resetting states is good, be careful not to overdo it. Some states, like user preferences or global notifications, might be intended to persist across different views. Always consider the user's expected flow and the logical dependencies between different pieces of state before implementing a reset. An overly aggressive reset can be just as frustrating as no reset at all.`,
      dryRun: `🔁 **Think:**
1. \`currentFilter\` is 'active', \`showCompletedHistory\` is \`false\`.
2. User clicks "View Completed History" button, calling \`handleToggleHistory()\`.
3. \`handleToggleHistory\` sets \`showCompletedHistory\` to \`true\` and \`setCurrentFilter('all')\`.
4. Re-render: \`showCompletedHistory\` is \`true\`, so the history view renders. \`currentFilter\` is now 'all', ensuring that if the user returns to the main list, it won't still be stuck on 'active'.
(Hint: Resetting \`currentFilter\` prevents stale filter application on return.)`,
      build: "Learning focus: Implement event handlers and derived state for filtering and view toggling."
    }
  },
  // Step 7: Wire handlers to structure
  {
    id: "step7",
    type: "question",
    phase: "Step 7 of 7",
    paal: "Finally, connect your handlers and derived lists to the UI elements. Attach `onClick` events to buttons and map over your `filteredItems` and `completedItems` to render them in their respective lists.",
    hint: "Use `onClick` for buttons and `map` for rendering lists. Add styling to highlight the active filter.",
    example_code: `
const ItemDashboard = (): JSX.Element => {
  const [items, setItems] = useState<Item[]>([
    { id: '1', name: 'Review Q4 Report', status: 'pending', dueDate: '2023-12-15' },
    { id: '2', name: 'Schedule Team Sync', status: 'active', dueDate: '2023-12-01' },
    { id: '3', name: 'Complete Onboarding Docs', status: 'completed', completedDate: '2023-11-20' },
    { id: '4', name: 'Follow up with Client X', status: 'overdue', dueDate: '2023-11-10' },
    { id: '5', name: 'Plan Holiday Event', status: 'active', dueDate: '2023-12-20' },
    { id: '6', name: 'Archive Old Projects', status: 'completed', completedDate: '2023-11-25' },
  ]);
  const [currentFilter, setCurrentFilter] = useState<FilterStatus>('all');
  const [showCompletedHistory, setShowCompletedHistory] = useState<boolean>(false);

  // Handlers
  const handleFilterChange = (status: FilterStatus) => {
    setCurrentFilter(status);
    setShowCompletedHistory(false);
  };

  const handleClearFilter = () => {
    setCurrentFilter('all');
    setShowCompletedHistory(false);
  };

  const handleToggleHistory = () => {
    setShowCompletedHistory(prev => !prev);
    setCurrentFilter('all');
  };

  // Derived state for filtering
  const filteredItems = items.filter(item => {
    if (currentFilter === 'all') {
      return item.status !== 'completed';
    }
    return item.status === currentFilter;
  });

  const completedItems = items.filter(item => item.status === 'completed');

  return (
    <div className="item-dashboard">
      <h1>Item Dashboard</h1>

      <div className="controls">
        {(['all', 'active', 'pending', 'completed', 'overdue'] as FilterStatus[]).map(status => (
          <button
            key={status}
            onClick={() => handleFilterChange(status)}
            className={currentFilter === status && !showCompletedHistory ? 'active-filter' : ''}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
        <button onClick={handleClearFilter}>Clear Filter</button>
        <button onClick={handleToggleHistory}>
          {showCompletedHistory ? 'Back to Main List' : 'View Completed History'}
        </button>
      </div>

      {showCompletedHistory ? (
        <div className="completed-history">
          <h2>Completed Items History</h2>
          {completedItems.length === 0 ? (
            <p>No completed items yet.</p>
          ) : (
            <ul>
              {completedItems.map(item => (
                <li key={item.id}>
                  <strong>{item.name}</strong> - Completed: {item.completedDate || 'N/A'}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="main-list">
          <h2>Current Items ({currentFilter === 'all' ? 'All (excluding completed)' : currentFilter})</h2>
          {filteredItems.length === 0 ? (
            <p>No items match the current filter.</p>
          ) : (
            <ul>
              {filteredItems.map(item => (
                <li key={item.id}>
                  <strong>{item.name}</strong> - Status: {item.status} {item.dueDate ? \`(Due: \\\${item.dueDate})\` : ''}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
`,
    think_prompt: "Which code block correctly wires `onClick` events to all buttons, maps `filteredItems` to the main list, and `completedItems` to the history list, including active filter styling?",
    mc_options: [
      `<div><button onClick={handleFilterChange('all')}>All</button></div>`,
      `<div><button onClick={() => handleFilterChange('all')}>All</button><button onClick={handleToggleHistory}>Toggle</button><ul>{filteredItems.map(item => <li key={item.id}>{item.name}</li>)}</ul></div>`,
      `<div>{(['all', 'active', 'pending', 'completed', 'overdue'] as FilterStatus[]).map(status => (<button key={status} onClick={() => handleFilterChange(status)} className={currentFilter === status && !showCompletedHistory ? 'active-filter' : ''}>{status.charAt(0).toUpperCase() + status.slice(1)}</button>))}<button onClick={handleClearFilter}>Clear Filter</button><button onClick={handleToggleHistory}>{showCompletedHistory ? 'Back to Main List' : 'View Completed History'}</button>{showCompletedHistory ? (<div><h2>Completed Items History</h2><ul>{completedItems.map(item => (<li key={item.id}><strong>{item.name}</strong> - Completed: {item.completedDate || 'N/A'}</li>))}</ul></div>) : (<div><h2>Current Items ({currentFilter === 'all' ? 'All (excluding completed)' : currentFilter})</h2><ul>{filteredItems.map(item => (<li key={item.id}><strong>{item.name}</strong> - Status: {item.status} {item.dueDate ? \`(Due: \\\${item.dueDate})\` : ''}</li>))}</ul></div>)}</div>`
    ],
    mc_correct_option: `<div>{(['all', 'active', 'pending', 'completed', 'overdue'] as FilterStatus[]).map(status => (<button key={status} onClick={() => handleFilterChange(status)} className={currentFilter === status && !showCompletedHistory ? 'active-filter' : ''}>{status.charAt(0).toUpperCase() + status.slice(1)}</button>))}<button onClick={handleClearFilter}>Clear Filter</button><button onClick={handleToggleHistory}>{showCompletedHistory ? 'Back to Main List' : 'View Completed History'}</button>{showCompletedHistory ? (<div><h2>Completed Items History</h2><ul>{completedItems.map(item => (<li key={item.id}><strong>{item.name}</strong> - Completed: {item.completedDate || 'N/A'}</li>))}</ul></div>) : (<div><h2>Current Items ({currentFilter === 'all' ? 'All (excluding completed)' : currentFilter})</h2><ul>{filteredItems.map(item => (<li key={item.id}><strong>{item.name}</strong> - Status: {item.status} {item.dueDate ? \`(Due: \\\${item.dueDate})\` : ''}</li>))}</ul></div>)}</div>`,
    mc_anchor: `<div>{(['all', 'active', 'pending', 'completed', 'overdue'] as FilterStatus[]).map(status => (<button key={status} onClick={() => handleFilterChange(status)} className={currentFilter === status && !showCompletedHistory ? 'active-filter' : ''}>{status.charAt(0).toUpperCase() + status.slice(1)}</button>))}<button onClick={handleClearFilter}>Clear Filter</button><button onClick={handleToggleHistory}>{showCompletedHistory ? 'Back to Main List' : 'View Completed History'}</button>{showCompletedHistory ? (<div><h2>Completed Items History</h2><ul>{completedItems.map(item => (<li key={item.id}><strong>{item.name}</strong> - Completed: {item.completedDate || 'N/A'}</li>))}</ul></div>) : (<div><h2>Current Items ({currentFilter === 'all' ? 'All (excluding completed)' : currentFilter})</h2><ul>{filteredItems.map(item => (<li key={item.id}><strong>{item.name}</strong> - Status: {item.status} {item.dueDate ? \`(Due: \\\${item.dueDate})\` : ''}</li>))}</ul></div>)}</div>`,
    why_this_matters: "Wiring up the UI to your state and logic is the final step in making your application interactive. It connects user actions (button clicks) to state changes and ensures that the displayed data dynamically updates, providing a complete and responsive user experience.",
    answer_keywords: ["onClick", "event handling", "array.map", "rendering lists", "dynamic classNames"],
    seed_code: `import { useState } from 'react';

interface Item {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'completed' | 'overdue';
  dueDate?: string;
  completedDate?: string;
}

type FilterStatus = 'all' | 'active' | 'pending' | 'completed' | 'overdue';

const ItemDashboard = (): JSX.Element => {
  const [items, setItems] = useState<Item[]>([
    { id: '1', name: 'Review Q4 Report', status: 'pending', dueDate: '2023-12-15' },
    { id: '2', name: 'Schedule Team Sync', status: 'active', dueDate: '2023-12-01' },
    { id: '3', name: 'Complete Onboarding Docs', status: 'completed', completedDate: '2023-11-20' },
    { id: '4', name: 'Follow up with Client X', status: 'overdue', dueDate: '2023-11-10' },
    { id: '5', name: 'Plan Holiday Event', status: 'active', dueDate: '2023-12-20' },
    { id: '6', name: 'Archive Old Projects', status: 'completed', completedDate: '2023-11-25' },
  ]);
  const [currentFilter, setCurrentFilter] = useState<FilterStatus>('all');
  const [showCompletedHistory, setShowCompletedHistory] = useState<boolean>(false);

  // Handlers
  const handleFilterChange = (status: FilterStatus) => {
    setCurrentFilter(status);
    setShowCompletedHistory(false);
  };

  const handleClearFilter = () => {
    setCurrentFilter('all');
    setShowCompletedHistory(false);
  };

  const handleToggleHistory = () => {
    setShowCompletedHistory(prev => !prev);
    setCurrentFilter('all');
  };

  // Derived state for filtering
  const filteredItems = items.filter(item => {
    if (currentFilter === 'all') {
      return item.status !== 'completed';
    }
    return item.status === currentFilter;
  });

  const completedItems = items.filter(item => item.status === 'completed');

  return (
    <div className="item-dashboard">
      <h1>Item Dashboard</h1>

      <div className="controls">
        <button>All</button>
        <button>Active</button>
        <button>Pending</button>
        <button>Completed</button>
        <button>Overdue</button>
        <button>Clear Filter</button>
        <button>
          {showCompletedHistory ? 'Back to Main List' : 'View Completed History'}
        </button>
      </div>

      {showCompletedHistory ? (
        <div className="completed-history">
          <h2>Completed Items History</h2>
          {/* Completed items list will go here */}
        </div>
      ) : (
        <div className="main-list">
          <h2>Current Items</h2>
          {/* Main filtered items list will go here */}
        </div>
      )}
    </div>
  );
};`,
    starter_code: `import { useState } from 'react';

interface Item {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'completed' | 'overdue';
  dueDate?: string;
  completedDate?: string;
}

type FilterStatus = 'all' | 'active' | 'pending' | 'completed' | 'overdue';

const ItemDashboard = (): JSX.Element => {
  const [items, setItems] = useState<Item[]>([
    { id: '1', name: 'Review Q4 Report', status: 'pending', dueDate: '2023-12-15' },
    { id: '2', name: 'Schedule Team Sync', status: 'active', dueDate: '2023-12-01' },
    { id: '3', name: 'Complete Onboarding Docs', status: 'completed', completedDate: '2023-11-20' },
    { id: '4', name: 'Follow up with Client X', status: 'overdue', dueDate: '2023-11-10' },
    { id: '5', name: 'Plan Holiday Event', status: 'active', dueDate: '2023-12-20' },
    { id: '6', name: 'Archive Old Projects', status: 'completed', completedDate: '2023-11-25' },
  ]);
  const [currentFilter, setCurrentFilter] = useState<FilterStatus>('all');
  const [showCompletedHistory, setShowCompletedHistory] = useState<boolean>(false);

  // Handlers
  const handleFilterChange = (status: FilterStatus) => {
    setCurrentFilter(status);
    setShowCompletedHistory(false);
  };

  const handleClearFilter = () => {
    setCurrentFilter('all');
    setShowCompletedHistory(false);
  };

  const handleToggleHistory = () => {
    setShowCompletedHistory(prev => !prev);
    setCurrentFilter('all');
  };

  // Derived state for filtering
  const filteredItems = items.filter(item => {
    if (currentFilter === 'all') {
      return item.status !== 'completed';
    }
    return item.status === currentFilter;
  });

  const completedItems = items.filter(item => item.status === 'completed');

  return (
    <div className="item-dashboard">
      <h1>Item Dashboard</h1>

      <div className="controls">
        {/* Wire filter buttons */}
        <button>All</button>
        <button>Active</button>
        <button>Pending</button>
        <button>Completed</button>
        <button>Overdue</button>
        {/* Wire clear filter button */}
        <button>Clear Filter</button>
        {/* Wire history toggle button */}
        <button>
          {showCompletedHistory ? 'Back to Main List' : 'View Completed History'}
        </button>
      </div>

      {showCompletedHistory ? (
        <div className="completed-history">
          <h2>Completed Items History</h2>
          {/* Render completed items here */}
        </div>
      ) : (
        <div className="main-list">
          <h2>Current Items</h2>
          {/* Render filtered items here */}
        </div>
      )}
    </div>
  );
};`,
    feedback_correct: "Fantastic! Your dashboard is now fully interactive. Users can filter items, clear filters, and switch between the main list and the completed history view seamlessly.",
    feedback_partial: "You've wired most elements, but ensure all filter buttons correctly apply the `active-filter` class based on `currentFilter` and `showCompletedHistory` state, and that all lists handle empty states gracefully.",
    feedback_wrong: "The UI is not fully wired. Ensure all buttons have `onClick` handlers, and that `filteredItems` and `completedItems` are correctly mapped and rendered in their respective list sections.",
    expected: `import { useState } from 'react';

interface Item {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'completed' | 'overdue';
  dueDate?: string;
  completedDate?: string;
}

type FilterStatus = 'all' | 'active' | 'pending' | 'completed' | 'overdue';

const ItemDashboard = (): JSX.Element => {
  const [items, setItems] = useState<Item[]>([
    { id: '1', name: 'Review Q4 Report', status: 'pending', dueDate: '2023-12-15' },
    { id: '2', name: 'Schedule Team Sync', status: 'active', dueDate: '2023-12-01' },
    { id: '3', name: 'Complete Onboarding Docs', status: 'completed', completedDate: '2023-11-20' },
    { id: '4', name: 'Follow up with Client X', status: 'overdue', dueDate: '2023-11-10' },
    { id: '5', name: 'Plan Holiday Event', status: 'active', dueDate: '2023-12-20' },
    { id: '6', name: 'Archive Old Projects', status: 'completed', completedDate: '2023-11-25' },
  ]);
  const [currentFilter, setCurrentFilter] = useState<FilterStatus>('all');
  const [showCompletedHistory, setShowCompletedHistory] = useState<boolean>(false);

  // Handlers
  const handleFilterChange = (status: FilterStatus) => {
    setCurrentFilter(status);
    setShowCompletedHistory(false);
  };

  const handleClearFilter = () => {
    setCurrentFilter('all');
    setShowCompletedHistory(false);
  };

  const handleToggleHistory = () => {
    setShowCompletedHistory(prev => !prev);
    setCurrentFilter('all');
  };

  // Derived state for filtering
  const filteredItems = items.filter(item => {
    if (currentFilter === 'all') {
      return item.status !== 'completed';
    }
    return item.status === currentFilter;
  });

  const completedItems = items.filter(item => item.status === 'completed');

  return (
    <div className="item-dashboard">
      <h1>Item Dashboard</h1>

      <div className="controls">
        {(['all', 'active', 'pending', 'completed', 'overdue'] as FilterStatus[]).map(status => (
          <button
            key={status}
            onClick={() => handleFilterChange(status)}
            className={currentFilter === status && !showCompletedHistory ? 'active-filter' : ''}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
        <button onClick={handleClearFilter}>Clear Filter</button>
        <button onClick={handleToggleHistory}>
          {showCompletedHistory ? 'Back to Main List' : 'View Completed History'}
        </button>
      </div>

      {showCompletedHistory ? (
        <div className="completed-history">
          <h2>Completed Items History</h2>
          {completedItems.length === 0 ? (
            <p>No completed items yet.</p>
          ) : (
            <ul>
              {completedItems.map(item => (
                <li key={item.id}>
                  <strong>{item.name}</strong> - Completed: {item.completedDate || 'N/A'}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="main-list">
          <h2>Current Items ({currentFilter === 'all' ? 'All (excluding completed)' : currentFilter})</h2>
          {filteredItems.length === 0 ? (
            <p>No items match the current filter.</p>
          ) : (
            <ul>
              {filteredItems.map(item => (
                <li key={item.id}>
                  <strong>{item.name}</strong> - Status: {item.status} {item.dueDate ? \`(Due: \\\${item.dueDate})\` : ''}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};`,
    analog_example: `// Wiring up filters and a search bar in a user directory:
import { useState } from 'react';

interface User {
  id: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  active: boolean;
}

type UserRoleFilter = 'all' | 'admin' | 'editor' | 'viewer';

const UserDirectory = (): JSX.Element => {
  const [users, setUsers] = useState<User[]>([
    { id: 'u1', name: 'Alice', role: 'admin', active: true },
    { id: 'u2', name: 'Bob', role: 'editor', active: true },
    { id: 'u3', name: 'Charlie', role: 'viewer', active: false },
  ]);
  const [roleFilter, setRoleFilter] = useState<UserRoleFilter>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleRoleChange = (role: UserRoleFilter) => setRoleFilter(role);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);

  const filteredUsers = users.filter(user => {
    const roleMatch = roleFilter === 'all' || user.role === roleFilter;
    const searchMatch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
    return roleMatch && searchMatch;
  });

  return (
    <div>
      <input type="text" placeholder="Search users..." value={searchTerm} onChange={handleSearchChange} />
      <button onClick={() => handleRoleChange('all')}>All Roles</button>
      <button onClick={() => handleRoleChange('admin')}>Admins</button>
      <ul>
        {filteredUsers.map(user => (
          <li key={user.id}>{user.name} ({user.role})</li>
        ))}
      </ul>
    </div>
  );
};`,
    deepDiveLabel: "What is the importance of the `key` prop when rendering lists in React?",
    deepDive: {
      hook: `Imagine you have a list of items displayed on the screen, and you perform an action like deleting an item from the middle, or reordering the list. If React doesn't have a stable way to identify each individual item in the list, it struggles to efficiently update the DOM. Instead of just removing or moving the specific element, React might re-render the *entire* list, or worse, update the wrong elements, leading to performance issues, unexpected UI glitches (like input fields losing focus), or even displaying incorrect data. This can make dynamic lists feel sluggish and buggy, especially with frequent updates.`,
      pain: `⚠️ **Lesson:** Omitting the \`key\` prop or using an unstable key when rendering lists can lead to performance problems, incorrect UI updates, and unexpected behavior in dynamic lists.
**Symptom:** Slow list rendering, UI elements losing focus, incorrect data displayed after updates, or console warnings about missing keys.`,
      mentalModel: `**Mental model:** The "Element Identity Tag." Think of the \`key\` prop as a unique, persistent ID badge for each item in a list. When React renders a list, it uses these keys to track which specific item corresponds to which DOM element. If an item's position changes, React can efficiently move the existing DOM element rather than re-creating it. If an item is added or removed, React knows exactly which element to add or remove without affecting its siblings. This "identity tag" allows React to perform highly optimized updates, ensuring that only the necessary changes are made to the DOM, leading to smoother performance and more predictable UI behavior.`,
      discover: `**Pattern - name:** Unique \`key\` Prop for List Items
\`\`\`tsx
interface Todo { id: string; text: string; }

const TodoList = ({ todos }: { todos: Todo[] }): JSX.Element => {
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}> {/* todo.id is a stable, unique identifier */}
          {todo.text}
        </li>
      ))}
    </ul>
  );
};
\`\`\`
- The \`key\` prop must be a stable, unique identifier for each item within its list.
- React uses \`key\`s to efficiently reconcile changes in lists.
- It helps React identify which items have changed, been added, or been removed.
- Using \`index\` as a key is generally discouraged if the list order can change, as it's not stable.`,
      quickRules: `**Quick rules:**
- ✅ Provide a unique and stable \`key\` prop for every item rendered in a list.
- ✅ The \`key\` should be a string or number that uniquely identifies the item among its siblings.
- ✅ Use a stable ID from your data (e.g., \`item.id\`, \`product.sku\`).
- ✅ Ensure keys are unique *within the same list* (not necessarily globally unique).
- ❌ Never use array \`index\` as a \`key\` if the list items can be reordered, added, or removed.
- ❌ Do not use \`Math.random()\` or other non-stable values for keys.
- ❌ Avoid omitting the \`key\` prop; React will issue a warning and performance will suffer.`,
      watchOut: `👀 **Watch out:** While using the array index as a key (\`key={index}\`) might seem convenient, it's a common anti-pattern if your list items can change order, be added, or removed. If an item's index changes, React will treat it as a *different* item, leading to inefficient re-renders and potential state bugs (e.g., an input field's value jumping to the wrong item). Always prioritize a stable, unique ID from your data source for the \`key\` prop.`,
      dryRun: `🔁 **Think:**
1. Initial list: \`[{id: 'a', name: 'Task A'}, {id: 'b', name: 'Task B'}]\` rendered with \`key="a"\` and \`key="b"\`.
2. User deletes 'Task A'. The new list is \`[{id: 'b', name: 'Task B'}]\`.
3. React compares the old list's keys ('a', 'b') with the new list's keys ('b').
4. React sees that 'a' is gone, so it removes the DOM element with \`key="a"\`.
5. React sees that 'b' is still there, so it keeps the DOM element with \`key="b"\` and potentially just updates its content if needed, without re-creating it.
(Hint: Stable keys enable efficient DOM reconciliation.)`,
      build: "Learning focus: Connect event handlers to UI elements and render dynamic lists using `map` and `key` props."
    }
  }
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1: Imports", id: "step1" },
  { label: "Step 2: Module-scope types", id: "step2" },
  { label: "Step 3: Component shell", id: "step3" },
  { label: "Step 4: State + local variables", id: "step4" },
  { label: "Step 5: Structure skeleton", id: "step5" },
  { label: "Step 6: Handlers / logic", id: "step6" },
  { label: "Step 7: Wire handlers", id: "step7" },
];

export default createINPACTEngine({
  NODES,
  sideItems,
  lessonNum: 0,
  title: "Client-Side Filtering and Dedicated Views",
  shortName: "Filtered List View",
});
