import createINPACTEngine from "../inpact_engine_shared";
import { useState } from 'react';

export const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "resource-filtered-list-view",
      title: "Building Dynamic Filtered and History Views",
      body: `When applications manage collections of data, users often need to see specific subsets rather than the entire collection at once. This pattern addresses the fundamental challenge of presenting large lists of items in a manageable way, allowing users to quickly find relevant information. Without filtering capabilities, navigating extensive lists becomes cumbersome, leading to poor user experience and reduced productivity. It's about transforming a static, overwhelming display into an interactive, user-centric tool.

This pattern is ubiquitous across almost any application that deals with lists of entities. You'll find it in email clients filtering by 'unread' or 'starred' messages, in project management tools showing 'open' or 'completed' tasks, or in e-commerce sites allowing users to filter products by category or price range. The core idea extends to creating specialized views, like a 'history' log that only displays items that have reached a particular final state, providing a focused perspective on past events or completed actions.`,
      usecase: "A dashboard displaying various system alerts, where users need to filter by alert severity (e.g., 'Critical', 'Warning', 'Info') or view a dedicated 'Resolved Alerts' history.",
      designMock: {"kind":"list-and-form","screenTitle":"Resource Dashboard","caption":"Interact with the filter controls to see how the list of resources changes and how a dedicated history view isolates specific states.","listCaption":"Available Resources","emptyCaption":"No Resources Found","emptyMessage":"Adjust your filters; no resources match the current criteria.","rows":[{"title":"Task Alpha","subtitle":"Status: Pending","meta":"Due: Tomorrow"},{"title":"Task Beta","subtitle":"Status: Completed","meta":"Due: Yesterday"}],"fields":[{"label":"Filter Status","sample":"All"}],"submitLabel":"Apply Filter"}
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Define a structured type for individual resources.",
      "Render a dynamic list of resources based on an initial dataset.",
      "Implement a filtering mechanism to display subsets of resources based on user-selected criteria.",
      "Create a distinct 'history' view that automatically filters resources to show only those in a specific, completed state.",
      "Connect user interface elements to update the displayed resource list dynamically.",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 8",
    paal: "To manage dynamic data within our functional component, we'll need to use React's `useState` Hook. This requires importing it from the 'react' library.",
    hint: "Remember that `useState` is a named export from 'react'.",
    example_code: `import { useState } from 'react';`,
    think_prompt: "How do we correctly import the `useState` Hook?",
    mc_options: [
      `import React, { useState } from 'react';`,
      `import { useState } from 'react';`,
      `const useState = require('react').useState;`,
    ],
    mc_correct_option: `import { useState } from 'react';`,
    mc_anchor: "import { useState }",
    why_this_matters: "Explicitly importing `useState` makes it available for use in our component, allowing us to manage state and trigger re-renders when data changes. This is a fundamental building block for interactive React applications.",
    answer_keywords: ["import", "useState", "react hook"],
    seed_code: "",
    starter_code: `// Import necessary React Hooks here`,
    feedback_correct: "Exactly! This import makes `useState` available for managing our component's state.",
    feedback_partial: "You're close, but `React` itself isn't needed as a default import if you're only using named exports like `useState`.",
    feedback_wrong: "This is a CommonJS require syntax, not the ES Module import syntax used in modern React projects.",
    expected: `import { useState } from 'react';`,
    analog_example: `import { useEffect } from 'react';

function DataFetcher() {
  useEffect(() => {
    console.log("Component mounted or updated!");
  }, []); // Empty dependency array means run once on mount
  return <div>Fetching data...</div>;
}`,
    deepDiveLabel: "Why are specific named imports like `useState` preferred?",
    deepDive: {
      hook: `Imagine you're building a large software project with many different utility functions. If every file started with \`import * as Utils from './utils';\` and then accessed \`Utils.someFunction()\`, your code would become verbose. More importantly, when your build tool bundles your application, it might include *all* functions from \`utils.js\`, even if you only used one. This leads to larger bundle sizes, slower load times for users, and a less efficient application. The problem escalates in larger projects where many modules might be imported this way, bloating the final application unnecessarily. There's a strong need for a way to only bring in exactly what's needed.`,
      pain: "⚠️ **Lesson:** Importing entire modules or default exports when only specific named exports are needed can lead to larger application bundle sizes and slower performance. Symptom: Applications taking longer to load due to unnecessary code being included in the final build.",
      mentalModel: `**Mental model:** The Surgical Tool Kit. Think of a module like 'react' as a large toolbox containing many specialized tools (like \`useState\`, \`useEffect\`, \`useContext\`). Instead of grabbing the entire toolbox and rummaging through it every time you need a wrench (\`React.useState\`), named imports allow you to surgically pick out *only* the specific tools you need (\`import { useState } from 'react';\`). This keeps your workbench (your component file) tidy, makes it immediately clear which tools you're using, and, crucially, allows the build process to only include those specific tools in your final application, making it lighter and faster.`,
      discover: `**Pattern - Named Imports:**
\`\`\`tsx
import { createContext, useContext } from 'react';

const ThemeContext = createContext('light');

function ThemedComponent() {
  const theme = useContext(ThemeContext);
  return <p>Current theme: {theme}</p>;
}
\`\`\`
- \`createContext\` and \`useContext\` are specific functions exported by the 'react' module.
- The \`import { ... } from '...'\` syntax explicitly lists which exports to bring into scope.
- This enables 'tree-shaking', where build tools can eliminate unused exports from the final bundle.
- Improves code readability by showing exactly what dependencies a file has.`,
      quickRules: `**Quick rules:**
- ✅ Always use named imports (\`import { name } from 'module';\`) when a module exports multiple items.
- ✅ Prefer named imports for better tree-shaking and smaller bundle sizes.
- ✅ Use default imports (\`import Name from 'module';\`) only when a module has a single primary export.
- ✅ Keep your import statements concise and at the top of the file.
- ❌ Avoid \`import * as Name from 'module';\` unless you genuinely need all exports and want to namespace them.
- ❌ Don't import components or hooks that you don't actually use in the file.
- ❌ Never place import statements conditionally or inside functions.`,
      watchOut: `👀 **Watch out:** While named imports are generally preferred, some libraries might have a primary default export that you *should* import as such (e.g., \`import moment from 'moment';\`). Always check the library's documentation for its recommended import style. Mixing up default and named imports can lead to \`undefined\` values or runtime errors.`,
      dryRun: `🔁 **Think:** If we have \`// myComponent.tsx\` and it contains \`import { useState } from 'react';\` and \`import { useEffect } from 'react';\`, the bundler will identify that \`useState\` and \`useEffect\` are used. If \`useEffect\` is later removed from the component, the bundler will automatically remove \`useEffect\` from the final JavaScript bundle during optimization, reducing its size. If we had used \`import * as React from 'react';\`, the entire React library would likely be included, even if only \`useState\` was used. (Hint: Tree-shaking relies on static analysis of named imports.)`,
      build: "This step ensures that the `useState` Hook is correctly imported, making it available for managing our component's dynamic data.",
    },
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 8",
    paal: "Before we build our component, let's define the structure for a single resource. A clear type definition helps ensure consistency and makes our code easier to understand and maintain.",
    hint: "Think about the essential properties a resource might have, like an ID, a name, and a status.",
    example_code: `interface Resource { id: string; name: string; status: 'active' | 'pending' | 'completed' | 'archived'; }`,
    think_prompt: "Which of the following best defines a reusable type for our resources?",
    mc_options: [
      `type Resource = { id: number, title: string, state: string }`,
      `interface Resource { id: string; name: string; status: 'active' | 'pending' | 'completed' | 'archived'; }`,
      `const Resource = { id: 'string', name: 'string', status: 'string' }`,
    ],
    mc_correct_option: `interface Resource { id: string; name: string; status: 'active' | 'pending' | 'completed' | 'archived'; }`,
    mc_anchor: "interface Resource",
    why_this_matters: "Defining types upfront provides strong type-checking, catching potential errors early and improving code readability. It acts as a contract for how data should be structured, which is crucial when dealing with lists and filtering.",
    answer_keywords: ["interface", "type definition", "resource structure"],
    seed_code: `import { useState } from 'react';`,
    starter_code: `import { useState } from 'react';\n\n// Define the Resource interface here`,
    feedback_correct: "Excellent! An interface clearly defines the shape of our resource objects, including specific literal types for the 'status' property, which will be vital for filtering.",
    feedback_partial: "You're on the right track with defining properties, but an interface is generally preferred for object shapes, and using literal types for 'status' would make filtering more robust.",
    feedback_wrong: "While you've listed properties, this isn't a type definition. An interface or type alias is used to define the shape of objects for type-checking purposes.",
    expected: `import { useState } from 'react';\n\ninterface Resource { id: string; name: string; status: 'active' | 'pending' | 'completed' | 'archived'; }`,
    analog_example: `interface UserProfile {
  userId: string;
  username: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  isActive: boolean;
}

const displayUser = (user: UserProfile) => {
  console.log(\`User: \${user.username} (\${user.role}) - Active: \${user.isActive}\`);
};`,
    deepDiveLabel: "Why use an `interface` over `type` for this?",
    deepDive: {
      hook: `Imagine you're building a complex application, perhaps a system for managing thousands of customer orders. Each order has a status: 'pending', 'shipped', 'delivered', 'cancelled'. Without a clear, enforced structure for these order objects, different parts of your team might represent them inconsistently. One developer might use \`orderStatus: 'pending'\`, another \`status: 'PND'\`, and a third \`state: 0\`. When it comes time to filter orders by status, or display them in a table, the inconsistencies lead to bugs, wasted time debugging, and a fragile codebase. The pain of maintaining such a system grows exponentially with its complexity, making simple tasks like adding a new filter a nightmare. You need a way to declare a contract for your data that everyone can rely on, ensuring that every 'order' object conforms to a predictable shape.`,
      pain: "⚠️ **Lesson:** Without explicit type definitions for data structures, consistency across a codebase degrades, leading to runtime errors, difficult debugging, and increased development time for features like filtering or display. Symptom: Functions expecting a `status` property might receive `state` or `orderStatus`, causing unexpected behavior or crashes.",
      mentalModel: `**Mental model:** The Data Blueprint. Think of an \`interface\` (or a \`type\` alias) as a blueprint for your data objects. Just as an architect's blueprint specifies the exact dimensions, materials, and layout for a building, a TypeScript interface specifies the exact properties, their names, and their types for an object. When you create an object that 'implements' this interface, TypeScript ensures it adheres to the blueprint. This means every part of your application that interacts with a 'Resource' object knows exactly what properties to expect and what type of data those properties will hold, making it impossible to accidentally refer to \`resource.title\` when the blueprint specifies \`resource.name\`.`,
      discover: `**Pattern - Type Definition:**
\`\`\`tsx
interface Item { 
  id: string;
  name: string;
  category: 'food' | 'drink' | 'other';
  price: number;
}

const inventory: Item[] = [
  { id: 'i1', name: 'Apple', category: 'food', price: 1.00 },
  { id: 'i2', name: 'Water', category: 'drink', price: 1.50 },
];
\`\`\`
- Defines the expected shape of an \`Item\` object.
- Uses literal types (\`'food' | 'drink' | 'other'\`) for \`category\` to restrict possible values, which is excellent for filtering.
- Ensures all objects in the \`inventory\` array conform to the \`Item\` blueprint.
- Provides compile-time checks, preventing common data-related bugs.`,
      quickRules: `**Quick rules:**
- ✅ Use \`interface\` for defining the shape of objects, especially when you might want to extend it later.
- ✅ Use \`type\` aliases for unions, intersections, or primitive types, or when you need to define a specific type for a function signature.
- ✅ Always define types for complex data structures that will be passed around your application.
- ✅ Use literal types (e.g., \`'active' | 'pending'\`) for properties with a fixed, small set of possible string or number values.
- ❌ Avoid \`any\` type when you know the structure of your data.
- ❌ Don't rely on implicit type inference for complex object shapes that are central to your application logic.
- ❌ Never define types inline repeatedly; always create a reusable \`interface\` or \`type\` alias.`,
      watchOut: `👀 **Watch out:** While \`interface\` and \`type\` aliases are very similar for object types, \`interface\` can be 're-opened' to add new properties (declaration merging), which \`type\` aliases cannot. This is a subtle difference but can be important in advanced scenarios, especially when working with third-party libraries that augment existing types. For simple object definitions, either is usually fine, but \`interface\` is often the conventional choice for object shapes.`,
      dryRun: `🔁 **Think:** Imagine we have a \`Resource\` type defined as \`interface Resource { id: string; name: string; status: 'active' | 'pending'; }\`. If we then try to create \`const myResource: Resource = { id: 'r1', name: 'Task', status: 'completed' };\`, what happens? The TypeScript compiler will immediately flag an error because \`'completed'\` is not one of the allowed literal types for \`status\`. This prevents a potential runtime bug where a filter expecting 'active' or 'pending' might fail to process 'completed' correctly. (Hint: The type definition acts as a strict validator for object creation.)`,
      build: "This step establishes the foundational data structure for our resources, ensuring type safety and clarity for subsequent filtering logic.",
    },
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 8",
    paal: "Now that we have our `Resource` type, let's create the basic functional component that will display our list. We'll start with a simple shell, ready to hold our state and rendering logic.",
    hint: "A functional component is a JavaScript function that returns JSX. Remember to include the `Resource` type in your file.",
    example_code: `function ResourceList() { return ( <div> <h1>Resource Dashboard</h1> </div> ); }`,
    think_prompt: "Which is the correct way to define a functional component named `ResourceList`?",
    mc_options: [
      `const ResourceList = () => { return <div>Resource List</div>; }`,
      `function ResourceList() { return ( <div> <h1>Resource Dashboard</h1> </div> ); }`,
      `class ResourceList extends React.Component { render() { return <div>Resource List</div>; } }`,
    ],
    mc_correct_option: `function ResourceList() { return ( <div> <h1>Resource Dashboard</h1> </div> ); }`,
    mc_anchor: "function ResourceList()",
    why_this_matters: "Defining a functional component is the standard way to build UI elements in modern React. It provides a clear entry point for our component's logic and rendering, making it easy to integrate into a larger application.",
    answer_keywords: ["functional component", "JSX", "return"],
    seed_code: `import { useState } from 'react';\n\ninterface Resource { id: string; name: string; status: 'active' | 'pending' | 'completed' | 'archived'; }`,
    starter_code: `import { useState } from 'react';\n\ninterface Resource { id: string; name: string; status: 'active' | 'pending' | 'completed' | 'archived'; }\n\n// Define the ResourceList component here`,
    feedback_correct: "Spot on! This sets up our functional component correctly, ready for state and dynamic content.",
    feedback_partial: "You're close, but the prompt asked for a `function` declaration. Both are valid, but consistency is key.",
    feedback_wrong: "This is a class component, which is an older pattern. We're focusing on modern functional components.",
    expected: `import { useState } from 'react';\n\ninterface Resource { id: string; name: string; status: 'active' | 'pending' | 'completed' | 'archived'; }\n\nfunction ResourceList() { return ( <div> <h1>Resource Dashboard</h1> </div> ); }`,
    analog_example: `function GreetingDisplay() {
  const userName = "Learner";
  return (
    <div>
      <h2>Hello, {userName}!</h2>
      <p>Welcome to the module.</p>
    </div>
  );
}`,
    deepDiveLabel: "Why are functional components preferred over class components now?",
    deepDive: {
      hook: `Imagine you're trying to teach a new developer how to build interactive web interfaces. In the past, they'd encounter \`class MyComponent extends React.Component { ... }\`, needing to understand \`this\` context, lifecycle methods like \`componentDidMount\`, and \`setState\` as a method. This often felt like learning object-oriented programming just to render a button. Then, to add state or side effects, they'd have to juggle multiple lifecycle methods, leading to scattered logic and complex mental models. The cognitive load was significant, especially for beginners. The desire was for a simpler, more direct way to build components that felt more like pure functions, but still had access to state and lifecycle features.`,
      pain: "⚠️ **Lesson:** Class components introduced complexity with `this` binding, lifecycle methods, and scattered logic, making them harder to understand, test, and refactor, especially for beginners. Symptom: Developers struggling with `this` context issues or placing unrelated logic in the same lifecycle method.",
      mentalModel: `**Mental model:** The Functional Recipe. Think of a functional component as a recipe for a dish. You provide the ingredients (props), and the recipe (function) tells you exactly how to combine them to produce the final dish (JSX). There's no complex 'chef' object (\`this\`) to manage; you just follow the steps. When you need to add a new ingredient (state) or perform an action during cooking (side effect), you use specialized tools (hooks like \`useState\` or \`useEffect\`) that are explicitly designed for that purpose, keeping the recipe clear and focused. This makes the process more predictable and easier to follow, especially when the recipe gets more complex.`,
      discover: `**Pattern - Functional Component:**
\`\`\`tsx
function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => setCount(count + 1);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}
\`\`\`
- Defined as a standard JavaScript function.
- Uses \`useState\` hook for managing component-specific state.
- Logic for updating state (\`increment\`) is defined directly within the component.
- Returns JSX directly, describing the UI based on current props and state.`,
      quickRules: `**Quick rules:**
- ✅ Use functional components for all new components.
- ✅ Leverage React Hooks (\`useState\`, \`useEffect\`, \`useContext\`, etc.) for state and lifecycle features.
- ✅ Keep components focused on rendering UI based on props and state.
- ✅ Prefer composition (combining smaller components) over large, monolithic components.
- ❌ Avoid class components unless you are maintaining legacy code.
- ❌ Don't put complex business logic directly inside the render return; extract it into functions or custom hooks.
- ❌ Never call Hooks conditionally or inside loops; they must be called at the top level of your functional component.`,
      watchOut: `👀 **Watch out:** While functional components are simpler, understanding the 'rules of Hooks' is crucial. Misusing Hooks (e.g., calling \`useState\` inside an \`if\` statement) can lead to subtle bugs that are hard to diagnose. Always ensure Hooks are called at the top level of your function component or custom Hook.`,
      dryRun: `🔁 **Think:** When \`Counter\` first renders, \`useState(0)\` initializes \`count\` to \`0\`. The JSX displays 'Count: 0'. When the 'Increment' button is clicked, \`increment\` calls \`setCount(0 + 1)\`, updating \`count\` to \`1\`. This triggers a re-render of \`Counter\`, and the JSX now displays 'Count: 1'. (Hint: \`useState\` returns a pair: the current state value and a function to update it.)`,
      build: "This step establishes the basic functional component, providing the container for our resource list and filtering logic.",
    },
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 8",
    paal: "Our `ResourceList` component needs to manage the actual list of resources and the currently selected filter. We'll use `useState` to declare these pieces of state.",
    hint: "You'll need two `useState` calls: one for an array of `Resource` objects and another for the current filter status, which should default to 'all'.",
    example_code: `const [resources, setResources] = useState<Resource[]>([ { id: 'r1', name: 'Task A', status: 'active' }, { id: 'r2', name: 'Task B', status: 'pending' }, { id: 'r3', name: 'Task C', status: 'completed' }, { id: 'r4', name: 'Task D', status: 'archived' }, ]); const [filterStatus, setFilterStatus] = useState<'all' | Resource['status']>('all');`,
    think_prompt: "How should we declare state for our list of resources and the active filter?",
    mc_options: [
      `let resources = []; let filterStatus = 'all';`,
      `const [resources, setResources] = useState<Resource[]>([]); const [filterStatus, setFilterStatus] = useState('all');`,
      `const [resources, setResources] = useState<Resource[]>([ /* initial data */ ]); const [filterStatus, setFilterStatus] = useState<'all' | Resource['status']>('all');`,
    ],
    mc_correct_option: `const [resources, setResources] = useState<Resource[]>([ /* initial data */ ]); const [filterStatus, setFilterStatus] = useState<'all' | Resource['status']>('all');`,
    mc_anchor: "useState<Resource[]>",
    why_this_matters: "Using `useState` is fundamental for managing dynamic data within a functional component. It ensures that when the data changes, the component re-renders to reflect those changes, which is essential for interactive filtering.",
    answer_keywords: ["useState", "state management", "initial state", "type annotation"],
    seed_code: `import { useState } from 'react';\n\ninterface Resource { id: string; name: string; status: 'active' | 'pending' | 'completed' | 'archived'; }\n\nfunction ResourceList() { return ( <div> <h1>Resource Dashboard</h1> </div> ); }`,
    starter_code: `import { useState } from 'react';\n\ninterface Resource { id: string; name: string; status: 'active' | 'pending' | 'completed' | 'archived'; }\n\nfunction ResourceList() {\n  // Declare state for resources and filterStatus here\n\n  return (\n    <div>\n      <h1>Resource Dashboard</h1>\n    </div>\n  );\n}`,
    feedback_correct: "Perfect! You've correctly initialized state for both the resources array and the filter status, including the union type for 'filterStatus' to allow 'all' or any `Resource['status']`.",
    feedback_partial: "You've got the `useState` calls, but remember to provide initial data for the resources and consider a more specific type for 'filterStatus' that includes 'all'.",
    feedback_wrong: "Using `let` directly won't trigger re-renders when the values change. `useState` is necessary for React to track and update component state.",
    expected: `import { useState } from 'react';\n\ninterface Resource { id: string; name: string; status: 'active' | 'pending' | 'completed' | 'archived'; }\n\nfunction ResourceList() {\n  const [resources, setResources] = useState<Resource[]>([\n    { id: 'r1', name: 'Task A', status: 'active' },\n    { id: 'r2', name: 'Task B', status: 'pending' },\n    { id: 'r3', name: 'Task C', status: 'completed' },\n    { id: 'r4', name: 'Task D', status: 'archived' },\n  ]);\n\n  const [filterStatus, setFilterStatus] = useState<'all' | Resource['status']>('all');\n\n  return (\n    <div>\n      <h1>Resource Dashboard</h1>\n    </div>\n  );\n}`,
    analog_example: `import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  const [isCounting, setIsCounting] = useState(false);

  return (
    <div>
      <p>Count: {count}</p>
      <p>Counting: {isCounting ? 'Yes' : 'No'}</p>
    </div>
  );
}`,
    deepDiveLabel: "How does `useState` actually trigger a re-render?",
    deepDive: {
      hook: `Imagine you have a complex dashboard displaying real-time data. A user clicks a button, and a specific chart needs to update with new data. If you simply changed a variable in JavaScript, nothing on the screen would change. The browser wouldn't know to re-draw that part of the UI. In traditional web development, you'd have to manually select the DOM element, update its text content, or re-render a whole section of HTML. This manual DOM manipulation is tedious, error-prone, and inefficient, especially when dealing with many interdependent UI elements. The challenge is how to declaratively describe your UI and have the framework efficiently update it when the underlying data changes, without you having to micromanage every pixel.`,
      pain: "⚠️ **Lesson:** Directly modifying variables in a component does not trigger UI updates; manual DOM manipulation is inefficient and error-prone. Symptom: Data changes in the component logic, but the displayed UI remains static, leading to a desynchronized user experience.",
      mentalModel: `**Mental model:** The State-Driven Painter. Think of your React component as a painter who has a canvas (the UI) and a set of instructions (your JSX). When you call a \`set\` function from \`useState\` (e.g., \`setCount(newCount)\`), it's like telling the painter, 'Hey, this specific detail on the canvas needs to change to \`newCount\`.' The painter doesn't immediately grab a brush. Instead, React (the art director) notes down all the changes requested. Then, at an optimized time, React tells the painter to re-evaluate the entire 'recipe' (re-run your component function) with the *new* state values. It then compares the 'new painting' (the JSX returned) with the 'old painting' (the previous DOM) and only paints the differences, ensuring the UI is always a faithful representation of your component's current state, without you needing to manually manage the brushstrokes.`,
      discover: `**Pattern - State Update and Re-render:**
\`\`\`tsx
function Toggle() {
  const [isOn, setIsOn] = useState(false);

  const handleClick = () => {
    setIsOn(!isOn); // 1. Update state
  };

  return (
    <button onClick={handleClick}>
      {isOn ? 'ON' : 'OFF'} {/* 2. UI reflects state */}
    </button>
  );
}
\`\`\`
- \`useState\` initializes \`isOn\` to \`false\` on first render.
- \`handleClick\` calls \`setIsOn(!isOn)\`, which schedules a state update.
- React detects the state change and re-runs the \`Toggle\` component function.
- The new \`isOn\` value (\`true\`) is used, causing the button text to change to 'ON'.
- React efficiently updates only the necessary part of the DOM.`,
      quickRules: `**Quick rules:**
- ✅ Always use the \`set\` function returned by \`useState\` to update state.
- ✅ State updates are asynchronous; don't expect the state to be immediately updated after calling the setter.
- ✅ When the new state depends on the previous state, use the functional update form (e.g., \`setCount(prevCount => prevCount + 1)\`).
- ✅ Updating state triggers a re-render of the component and its children (unless optimized).
- ❌ Never directly mutate state variables (e.g., \`count = 5;\` or \`resources.push(newResource);\`).
- ❌ Don't call state setters inside the render return without a condition or event handler, as it will cause an infinite loop.
- ❌ Avoid complex calculations directly in \`useState\`'s initial value if they are expensive and only needed once; use a function for lazy initialization.`,
      watchOut: `👀 **Watch out:** State updates are not immediate. If you call \`setCount(count + 1)\` and then immediately try to \`console.log(count)\`, you'll likely see the *old* value of \`count\`. React batches state updates for performance. If you need to perform an action *after* state has definitely updated, consider using the \`useEffect\` Hook or passing a callback to \`setState\` (though less common in functional components).`,
      dryRun: `🔁 **Think:** When \`Toggle\` first renders, \`isOn\` is \`false\`. The button displays 'OFF'. User clicks the button. \`handleClick\` is called. \`setIsOn(!isOn)\` is executed, setting \`isOn\` to \`true\`. React schedules a re-render. On the next render cycle, \`Toggle\` runs again, \`isOn\` is now \`true\`, and the button displays 'ON'. (Hint: The \`set\` function tells React to re-evaluate the component with the new state.)`,
      build: "This step initializes the component's internal data, making the list of resources and the active filter status dynamic and responsive to user interaction.",
    },
  },
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 8",
    paal: "With our state defined, let's build the basic JSX structure for our `ResourceList`. This will include a title, a section for filter buttons, and a placeholder for our resource list.",
    hint: "Use `div` elements for layout, `h2` for section titles, and `button` elements for the filter controls. Don't worry about wiring them up yet.",
    example_code: `<div> <h1>Resource Dashboard</h1> <section> <h2>Filter Resources</h2> <button>All</button> <button>Active</button> <button>Pending</button> <button>Completed</button> </section> <section> <h2>Current Resources</h2> <ul> {/* Resource items will go here */} </ul> </section> </div>`,
    think_prompt: "Which JSX structure correctly sets up the main sections for our dashboard?",
    mc_options: [
      `<div> <h1>Dashboard</h1> <div class="filters"></div> <div class="list"></div> </div>`,
      `<div> <h1>Resource Dashboard</h1> <section> <h2>Filter Resources</h2> <button>All</button> <button>Active</button> </section> <section> <h2>Current Resources</h2> <ul></ul> </section> </div>`,
      `<main> <h2>Resource Dashboard</h2> <aside> <button>Filter</button> </aside> <article> <p>Resources</p> </article> </main>`,
    ],
    mc_correct_option: `<div> <h1>Resource Dashboard</h1> <section> <h2>Filter Resources</h2> <button>All</button> <button>Active</button> </section> <section> <h2>Current Resources</h2> <ul></ul> </section> </div>`,
    mc_anchor: "section",
    why_this_matters: "A well-structured JSX layout provides the visual foundation for our component. It separates concerns into logical sections, making the UI easier to understand and style, and prepares the areas where dynamic content will be rendered.",
    answer_keywords: ["JSX structure", "semantic HTML", "layout"],
    seed_code: `import { useState } from 'react';\n\ninterface Resource { id: string; name: string; status: 'active' | 'pending' | 'completed' | 'archived'; }\n\nfunction ResourceList() {\n  const [resources, setResources] = useState<Resource[]>([\n    { id: 'r1', name: 'Task A', status: 'active' },\n    { id: 'r2', name: 'Task B', status: 'pending' },\n    { id: 'r3', name: 'Task C', status: 'completed' },\n    { id: 'r4', name: 'Task D', status: 'archived' },\n  ]);\n\n  const [filterStatus, setFilterStatus] = useState<'all' | Resource['status']>('all');\n\n  return ( <div> <h1>Resource Dashboard</h1> </div> ); }`,
    starter_code: `import { useState } from 'react';\n\ninterface Resource { id: string; name: string; status: 'active' | 'pending' | 'completed' | 'archived'; }\n\nfunction ResourceList() {\n  const [resources, setResources] = useState<Resource[]>([\n    { id: 'r1', name: 'Task A', status: 'active' },\n    { id: 'r2', name: 'Task B', status: 'pending' },\n    { id: 'r3', name: 'Task C', status: 'completed' },\n    { id: 'r4', name: 'Task D', status: 'archived' },\n  ]);\n\n  const [filterStatus, setFilterStatus] = useState<'all' | Resource['status']>('all');\n\n  return (\n    // Add the main JSX structure here\n    <div>\n      <h1>Resource Dashboard</h1>\n    </div>\n  );\n}`,
    feedback_correct: "Excellent! This structure clearly defines the filter controls and the main resource list areas, ready for dynamic content.",
    feedback_partial: "You've got the main idea, but consider using semantic HTML tags like `section` for better organization and accessibility.",
    feedback_wrong: "This structure is too generic and doesn't provide clear sections for filters and the resource list as requested.",
    expected: `import { useState } from 'react';\n\ninterface Resource { id: string; name: string; status: 'active' | 'pending' | 'completed' | 'archived'; }\n\nfunction ResourceList() {\n  const [resources, setResources] = useState<Resource[]>([\n    { id: 'r1', name: 'Task A', status: 'active' },\n    { id: 'r2', name: 'Task B', status: 'pending' },\n    { id: 'r3', name: 'Task C', status: 'completed' },\n    { id: 'r4', name: 'Task D', status: 'archived' },\n  ]);\n\n  const [filterStatus, setFilterStatus] = useState<'all' | Resource['status']>('all');\n\n  return (\n    <div>\n      <h1>Resource Dashboard</h1>\n      <section>\n        <h2>Filter Resources</h2>\n        <button>All</button>\n        <button>Active</button>\n        <button>Pending</button>\n        <button>Completed</button>\n      </section>\n      <section>\n        <h2>Current Resources</h2>\n        <ul>\n          {/* Resource items will go here */}\n        </ul>\n      </section>\n    </div>\n  );\n}`,
    analog_example: `function ProductPage() {
  return (
    <main>
      <header>
        <h1>Product Catalog</h1>
      </header>
      <aside>
        <h3>Categories</h3>
        <nav>
          <a href="#">Electronics</a>
          <a href="#">Books</a>
        </nav>
      </aside>
      <section>
        <h2>Featured Products</h2>
        <div>{/* Product cards go here */}</div>
      </section>
    </main>
  );
}`,
    deepDiveLabel: "How does semantic HTML improve accessibility and SEO?",
    deepDive: {
      hook: `Imagine a visually impaired user trying to navigate a website using a screen reader. If the site is built entirely with generic \`div\` elements, the screen reader has no meaningful cues about the page's structure. It might just read out 'div, div, div' without conveying that one \`div\` is a navigation menu, another is the main content, and a third is a footer. This makes the experience confusing and frustrating, effectively locking out users who rely on assistive technologies. Similarly, search engines crawl websites to understand their content and structure. A page full of generic \`div\`s provides little context, making it harder for search engines to accurately index and rank the content. The problem is how to convey meaning and structure to both humans and machines beyond just visual presentation.`,
      pain: "⚠️ **Lesson:** Over-reliance on non-semantic `div` and `span` elements hinders accessibility for users with assistive technologies and reduces search engine optimization (SEO) by obscuring page structure. Symptom: Screen readers providing unhelpful navigation cues, or search engines struggling to understand the hierarchy and relevance of content.",
      mentalModel: `**Mental model:** The Labeled Filing Cabinet. Think of your webpage as a filing cabinet. If all the drawers are identical and unlabeled (\`div\`s), it's hard for anyone (human or machine) to quickly find what they're looking for. Semantic HTML elements are like clearly labeled drawers: \`header\` for the top section, \`nav\` for navigation, \`main\` for the primary content, \`article\` for a self-contained piece of content, \`aside\` for supplementary information, and \`footer\` for the bottom section. These labels immediately tell anyone interacting with the cabinet (including screen readers and search engine bots) what kind of content to expect in each section, making it much easier to organize, find, and understand information.`,
      discover: `**Pattern - Semantic HTML Structure:**
\`\`\`tsx
<header>
  <h1>Website Title</h1>
  <nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
  </nav>
</header>
<main>
  <article>
    <h2>Article Title</h2>
    <p>Article content...</p>
  </article>
  <aside>
    <h3>Related Links</h3>
    <ul><li>...</li></ul>
  </aside>
</main>
<footer>
  <p>&copy; 2023</p>
</footer>
\`\`\`
- \`header\` clearly identifies the introductory content of a section or page.
- \`nav\` indicates a section containing navigation links.
- \`main\` denotes the dominant content of the \`body\`.
- \`article\` represents self-contained content, like a blog post or news story.
- \`aside\` contains content related to the surrounding content but considered separate.
- \`footer\` contains concluding content for its nearest sectioning root or the entire page.`,
      quickRules: `**Quick rules:**
- ✅ Use \`header\`, \`nav\`, \`main\`, \`article\`, \`section\`, \`aside\`, \`footer\` for major page regions.
- ✅ Use \`h1\` through \`h6\` for headings, ensuring a logical hierarchy.
- ✅ Use \`ul\`, \`ol\`, \`dl\` for lists, and \`p\` for paragraphs.
- ✅ Employ \`button\` for interactive actions and \`a\` for navigation.
- ❌ Avoid using \`div\` or \`span\` when a more semantic element exists.
- ❌ Don't skip heading levels (e.g., \`h1\` directly to \`h3\`) as this confuses screen readers.
- ❌ Never use heading tags (\`h1\`-\`h6\`) purely for styling; use CSS instead.`,
      watchOut: `👀 **Watch out:** While semantic HTML is powerful, it's not a silver bullet. Proper ARIA attributes and keyboard navigation are also crucial for full accessibility. Semantic elements provide a strong foundation, but sometimes additional attributes are needed to convey complex interactions or states to assistive technologies.`,
      dryRun: `🔁 **Think:** A screen reader encounters \`<nav><a href="/">Home</a></nav>\`. It announces 'Navigation landmark, Home link'. If it instead encountered \`<div><a>Home</a></div>\`, it might just announce 'link, Home', missing the context that this is a navigation section. This difference helps users quickly jump to navigation areas. Similarly, a search engine seeing an \`<article>\` tag understands that the content within is a primary, self-contained piece of information, which can influence its ranking. (Hint: Semantic tags provide inherent meaning that generic \`div\`s lack.)`,
      build: "This step lays out the visual structure of our dashboard, creating distinct areas for filters and the resource list.",
    },
  },
  {
    id: "step6",
    type: "question",
    phase: "Step 6 of 8",
    paal: "Now, let's implement the core logic for filtering our resources. We'll create a function to filter the `resources` array based on the `filterStatus` state, and a handler to update `filterStatus` when a filter button is clicked.",
    hint: "The filtering logic will involve the `Array.prototype.filter()` method. The handler will simply call `setFilterStatus`.",
    example_code: `const handleFilterChange = (status: 'all' | Resource['status']) => { setFilterStatus(status); }; const filteredResources = resources.filter(resource => filterStatus === 'all' || resource.status === filterStatus );`,
    think_prompt: "How should we implement the filtering logic and the filter change handler?",
    mc_options: [
      `function filterResources() { /* ... */ } const changeFilter = (s) => { /* ... */ };`,
      `const handleFilterChange = (status) => { setFilterStatus(status); }; const filteredResources = resources.filter(resource => filterStatus === 'all' || resource.status === filterStatus );`,
      `const handleFilterChange = (status: 'all' | Resource['status']) => setFilterStatus(status); const filteredResources = resources.filter(resource => filterStatus === 'all' || resource.status === filterStatus );`,
    ],
    mc_correct_option: `const handleFilterChange = (status: 'all' | Resource['status']) => setFilterStatus(status); const filteredResources = resources.filter(resource => filterStatus === 'all' || resource.status === filterStatus );`,
    mc_anchor: "resources.filter",
    why_this_matters: "This step is the heart of our filtering functionality. By separating the filtering logic and the state update handler, we create a clean, testable, and reusable pattern for dynamic list manipulation.",
    answer_keywords: ["filter array", "event handler", "state update", "conditional logic"],
    seed_code: `import { useState } from 'react';\n\ninterface Resource { id: string; name: string; status: 'active' | 'pending' | 'completed' | 'archived'; }\n\nfunction ResourceList() {\n  const [resources, setResources] = useState<Resource[]>([\n    { id: 'r1', name: 'Task A', status: 'active' },\n    { id: 'r2', name: 'Task B', status: 'pending' },\n    { id: 'r3', name: 'Task C', status: 'completed' },\n    { id: 'r4', name: 'Task D', status: 'archived' },\n  ]);\n\n  const [filterStatus, setFilterStatus] = useState<'all' | Resource['status']>('all');\n\n  return (\n    <div>\n      <h1>Resource Dashboard</h1>\n      <section>\n        <h2>Filter Resources</h2>\n        <button>All</button>\n        <button>Active</button>\n        <button>Pending</button>\n        <button>Completed</button>\n      </section>\n      <section>\n        <h2>Current Resources</h2>\n        <ul>\n          {/* Resource items will go here */}\n        </ul>\n      </section>\n    </div>\n  );\n}`,
    starter_code: `import { useState } from 'react';\n\ninterface Resource { id: string; name: string; status: 'active' | 'pending' | 'completed' | 'archived'; }\n\nfunction ResourceList() {\n  const [resources, setResources] = useState<Resource[]>([\n    { id: 'r1', name: 'Task A', status: 'active' },\n    { id: 'r2', name: 'Task B', status: 'pending' },\n    { id: 'r3', name: 'Task C', status: 'completed' },\n    { id: 'r4', name: 'Task D', status: 'archived' },\n  ]);\n\n  const [filterStatus, setFilterStatus] = useState<'all' | Resource['status']>('all');\n\n  // Implement filter change handler and filtered resources logic here\n\n  return (\n    <div>\n      <h1>Resource Dashboard</h1>\n      <section>\n        <h2>Filter Resources</h2>\n        <button>All</button>\n        <button>Active</button>\n        <button>Pending</button>\n        <button>Completed</button>\n      </section>\n      <section>\n        <h2>Current Resources</h2>\n        <ul>\n          {/* Resource items will go here */}\n        </ul>\n      </section>\n    </div>\n  );\n}`,
    feedback_correct: "Excellent! You've correctly implemented both the `handleFilterChange` function and the `filteredResources` computation, ready to be wired into the UI.",
    feedback_partial: "You've got the `filter` method, but ensure your `handleFilterChange` correctly updates the `filterStatus` state and that the type annotation is precise.",
    feedback_wrong: "Your filtering logic or handler is incomplete. Remember to use `Array.prototype.filter()` for the list and `setFilterStatus` for the state update.",
    expected: `import { useState } from 'react';\n\ninterface Resource { id: string; name: string; status: 'active' | 'pending' | 'completed' | 'archived'; }\n\nfunction ResourceList() {\n  const [resources, setResources] = useState<Resource[]>([\n    { id: 'r1', name: 'Task A', status: 'active' },\n    { id: 'r2', name: 'Task B', status: 'pending' },\n    { id: 'r3', name: 'Task C', status: 'completed' },\n    { id: 'r4', name: 'Task D', status: 'archived' },\n  ]);\n\n  const [filterStatus, setFilterStatus] = useState<'all' | Resource['status']>('all');\n\n  const handleFilterChange = (status: 'all' | Resource['status']) => {\n    setFilterStatus(status);\n  };\n\n  const filteredResources = resources.filter(resource =>\n    filterStatus === 'all' || resource.status === filterStatus\n  );\n\n  return (\n    <div>\n      <h1>Resource Dashboard</h1>\n      <section>\n        <h2>Filter Resources</h2>\n        <button>All</button>\n        <button>Active</button>\n        <button>Pending</button>\n        <button>Completed</button>\n      </section>\n      <section>\n        <h2>Current Resources</h2>\n        <ul>\n          {/* Resource items will go here */}\n        </ul>\n      </section>\n    </div>\n  );\n}`,
    analog_example: `const items = [
  { name: 'Apple', type: 'fruit' },
  { name: 'Carrot', type: 'vegetable' },
  { name: 'Banana', type: 'fruit' },
];

function ItemFilter() {
  const [selectedType, setSelectedType] = useState<'all' | 'fruit' | 'vegetable'>('all');

  const handleTypeChange = (type: 'all' | 'fruit' | 'vegetable') => {
    setSelectedType(type);
  };

  const filteredItems = items.filter(item =>
    selectedType === 'all' || item.type === selectedType
  );

  return (
    <div>
      <button onClick={() => handleTypeChange('all')}>Show All</button>
      <button onClick={() => handleTypeChange('fruit')}>Show Fruits</button>
      <ul>
        {filteredItems.map(item => <li key={item.name}>{item.name}</li>)}
      </ul>
    </div>
  );
}`,
    deepDiveLabel: "What are the performance implications of `Array.prototype.filter`?",
    deepDive: {
      hook: `Imagine you have a list of ten thousand customer records, and you need to display only the 'active' ones. If your filtering logic is inefficient, every time a user types a character into a search box or clicks a filter button, the application might freeze for a noticeable moment. This lag, even if brief, accumulates and degrades the user experience, especially on less powerful devices. For very large datasets, a naive filtering approach can quickly become a performance bottleneck, leading to frustrated users and a perception of a slow, unresponsive application. The challenge is to filter large arrays without causing UI jank or excessive resource consumption.`,
      pain: "⚠️ **Lesson:** Inefficient filtering of large arrays can lead to performance bottlenecks, causing UI lag and a poor user experience. Symptom: The application becomes unresponsive or noticeably slow when filter criteria change, especially with large datasets.",
      mentalModel: `**Mental model:** The Data Sieve. Think of \`Array.prototype.filter()\` as a specialized sieve for your data. You pour your entire collection of resources into the sieve, and for each resource, you apply a specific test (your filtering condition). Only the resources that pass the test fall through the sieve and into a new, filtered collection. Crucially, this process *always* creates a *new* array; it doesn't modify the original. This 'immutability' is a core principle in React, as it allows React to efficiently detect changes and re-render only what's necessary, without worrying about side effects on the original data. While it iterates over the entire array, its simplicity and immutability often make it a highly performant and readable choice for most filtering tasks.`,
      discover: `**Pattern - Array Filtering:**
\`\`\`tsx
const numbers = [1, 2, 3, 4, 5, 6];
const evenNumbers = numbers.filter(num => num % 2 === 0);
// evenNumbers is [2, 4, 6]

const products = [
  { id: 1, name: 'Laptop', price: 1200 },
  { id: 2, name: 'Mouse', price: 25 },
  { id: 3, name: 'Keyboard', price: 75 },
];
const affordableProducts = products.filter(p => p.price < 100);
// affordableProducts is [{ id: 2, name: 'Mouse', price: 25 }, { id: 3, name: 'Keyboard', price: 75 }]
\`\`\`
- \`filter()\` creates a new array containing only elements for which the provided callback function returns \`true\`.
- The original array remains unchanged (immutability).
- It iterates over each element, applying the condition.
- Ideal for creating subsets of data based on specific criteria.`,
      quickRules: `**Quick rules:**
- ✅ Use \`filter()\` when you need a new array containing a subset of the original elements.
- ✅ Ensure your filter callback function is pure (no side effects).
- ✅ Combine multiple conditions with \`&&\` (AND) or \`||\` (OR) for complex filtering.
- ✅ For very large datasets or frequent filtering, consider memoization (\`useMemo\`) or debouncing/throttling user input.
- ❌ Don't use \`filter()\` if you intend to modify the original array; use \`map()\` or \`forEach()\` for side effects.
- ❌ Avoid complex, expensive operations inside the filter callback if performance is critical for large arrays.
- ❌ Never use \`filter()\` if you only need to find a single element; \`find()\` is more efficient for that.`,
      watchOut: `👀 **Watch out:** While \`filter()\` is generally efficient, repeatedly filtering a *very* large array (thousands or tens of thousands of items) on every single re-render can still cause performance issues. In such cases, consider optimizing by memoizing the \`filteredResources\` array using \`useMemo\` or by debouncing the user input that triggers the filter change, so the filtering operation isn't run too frequently.`,
      dryRun: `🔁 **Think:** Initial \`resources\` are \`[{status: 'active'}, {status: 'pending'}, {status: 'completed'}]\`. \`filterStatus\` is 'all'. \`filteredResources\` will iterate: \`active\` matches 'all' (true), \`pending\` matches 'all' (true), \`completed\` matches 'all' (true). Result: \`[{status: 'active'}, {status: 'pending'}, {status: 'completed'}]\`. Now, \`handleFilterChange('active')\` is called, \`setFilterStatus('active')\`. On re-render, \`filterStatus\` is 'active'. \`filteredResources\` iterates: \`active\` matches 'active' (true), \`pending\` does not match 'active' (false), \`completed\` does not match 'active' (false). Result: \`[{status: 'active'}]\`. (Hint: The \`filter\` method evaluates the condition for each item in the array.)`,
      build: "This step implements the core logic for filtering resources and handling filter changes, making our list dynamic.",
    },
  },
  {
    id: "step7",
    type: "question",
    phase: "Step 7 of 8",
    paal: "Now we'll connect our `handleFilterChange` function to the filter buttons and render the `filteredResources` in our list. We'll also add a visual indicator for the active filter.",
    hint: "Use the `onClick` prop for buttons and `map()` to render `filteredResources` as `<li>` elements. Add a class or style to the active filter button.",
    example_code: `<div> <h1>Resource Dashboard</h1> <section> <h2>Filter Resources</h2> <button onClick={() => handleFilterChange('all')} className={filterStatus === 'all' ? 'active-filter' : ''}>All</button> <button onClick={() => handleFilterChange('active')} className={filterStatus === 'active' ? 'active-filter' : ''}>Active</button> <button onClick={() => handleFilterChange('pending')} className={filterStatus === 'pending' ? 'active-filter' : ''}>Pending</button> <button onClick={() => handleFilterChange('completed')} className={filterStatus === 'completed' ? 'active-filter' : ''}>Completed</button> </section> <section> <h2>Current Resources</h2> <ul> {filteredResources.length > 0 ? ( filteredResources.map(resource => ( <li key={resource.id}> {resource.name} - Status: {resource.status} </li> )) ) : ( <li>No resources match the current filter.</li> )} </ul> </section> </div>`,
    think_prompt: "How do we connect the filter buttons to `handleFilterChange` and display the `filteredResources`?",
    mc_options: [
      `buttons.forEach(btn => btn.addEventListener('click', handleFilterChange)); ul.innerHTML = filteredResources.map(...);`,
      `<button onClick={handleFilterChange('all')}>All</button> <ul>{filteredResources.map(r => <li>{r.name}</li>)}</ul>`,
      `<button onClick={() => handleFilterChange('all')} className={filterStatus === 'all' ? 'active-filter' : ''}>All</button> <ul>{filteredResources.map(resource => <li key={resource.id}>{resource.name}</li>)}</ul>`,
    ],
    mc_correct_option: `<button onClick={() => handleFilterChange('all')} className={filterStatus === 'all' ? 'active-filter' : ''}>All</button> <ul>{filteredResources.map(resource => <li key={resource.id}>{resource.name}</li>)}</ul>`,
    mc_anchor: "onClick={() => handleFilterChange",
    why_this_matters: "Wiring up the UI to our state and logic is what makes our application interactive. Users can now actively filter the list, and the UI provides immediate feedback, enhancing usability and demonstrating the power of state-driven rendering.",
    answer_keywords: ["onClick", "map", "key prop", "conditional rendering", "active class"],
    seed_code: `import { useState } from 'react';\n\ninterface Resource { id: string; name: string; status: 'active' | 'pending' | 'completed' | 'archived'; }\n\nfunction ResourceList() {\n  const [resources, setResources] = useState<Resource[]>([\n    { id: 'r1', name: 'Task A', status: 'active' },\n    { id: 'r2', name: 'Task B', status: 'pending' },\n    { id: 'r3', name: 'Task C', status: 'completed' },\n    { id: 'r4', name: 'Task D', status: 'archived' },\n  ]);\n\n  const [filterStatus, setFilterStatus] = useState<'all' | Resource['status']>('all');\n\n  const handleFilterChange = (status: 'all' | Resource['status']) => {\n    setFilterStatus(status);\n  };\n\n  const filteredResources = resources.filter(resource =>\n    filterStatus === 'all' || resource.status === filterStatus\n  );\n\n  return (\n    <div>\n      <h1>Resource Dashboard</h1>\n      <section>\n        <h2>Filter Resources</h2>\n        <button>All</button>\n        <button>Active</button>\n        <button>Pending</button>\n        <button>Completed</button>\n      </section>\n      <section>\n        <h2>Current Resources</h2>\n        <ul>\n          {/* Resource items will go here */}\n        </ul>\n      </section>\n    </div>\n  );\n}`,
    starter_code: `import { useState } => 'react';\n\ninterface Resource { id: string; name: string; status: 'active' | 'pending' | 'completed' | 'archived'; }\n\nfunction ResourceList() {\n  const [resources, setResources] = useState<Resource[]>([\n    { id: 'r1', name: 'Task A', status: 'active' },\n    { id: 'r2', name: 'Task B', status: 'pending' },\n    { id: 'r3', name: 'Task C', status: 'completed' },\n    { id: 'r4', name: 'Task D', status: 'archived' },\n  ]);\n\n  const [filterStatus, setFilterStatus] = useState<'all' | Resource['status']>('all');\n\n  const handleFilterChange = (status: 'all' | Resource['status']) => {\n    setFilterStatus(status);\n  };\n\n  const filteredResources = resources.filter(resource =>\n    filterStatus === 'all' || resource.status === filterStatus\n  );\n\n  return (\n    <div>\n      <h1>Resource Dashboard</h1>\n      <section>\n        <h2>Filter Resources</h2>\n        {/* Wire up filter buttons here */}\n        <button>All</button>\n        <button>Active</button>\n        <button>Pending</button>\n        <button>Completed</button>\n      </section>\n      <section>\n        <h2>Current Resources</h2>\n        <ul>\n          {/* Render filtered resources here */}\n        </ul>\n      </section>\n    </div>\n  );\n}`,
    feedback_correct: "Fantastic! The filter buttons now correctly update the `filterStatus`, and the list dynamically renders only the `filteredResources`, providing a clear and interactive user experience.",
    feedback_partial: "You've correctly mapped the resources, but don't forget to wire up the `onClick` handlers for all filter buttons and add the `key` prop to your list items.",
    feedback_wrong: "Directly manipulating the DOM or calling the handler without an arrow function in `onClick` will lead to errors or unexpected behavior. Remember React's declarative approach.",
    expected: `import { useState } from 'react';\n\ninterface Resource { id: string; name: string; status: 'active' | 'pending' | 'completed' | 'archived'; }\n\nfunction ResourceList() {\n  const [resources, setResources] = useState<Resource[]>([\n    { id: 'r1', name: 'Task A', status: 'active' },\n    { id: 'r2', name: 'Task B', status: 'pending' },\n    { id: 'r3', name: 'Task C', status: 'completed' },\n    { id: 'r4', name: 'Task D', status: 'archived' },\n  ]);\n\n  const [filterStatus, setFilterStatus] = useState<'all' | Resource['status']>('all');\n\n  const handleFilterChange = (status: 'all' | Resource['status']) => {\n    setFilterStatus(status);\n  };\n\n  const filteredResources = resources.filter(resource =>\n    filterStatus === 'all' || resource.status === filterStatus\n  );\n\n  return (\n    <div>\n      <h1>Resource Dashboard</h1>\n      <section>\n        <h2>Filter Resources</h2>\n        <button onClick={() => handleFilterChange('all')} className={filterStatus === 'all' ? 'active-filter' : ''}>All</button>\n        <button onClick={() => handleFilterChange('active')} className={filterStatus === 'active' ? 'active-filter' : ''}>Active</button>\n        <button onClick={() => handleFilterChange('pending')} className={filterStatus === 'pending' ? 'active-filter' : ''}>Pending</button>\n        <button onClick={() => handleFilterChange('completed')} className={filterStatus === 'completed' ? 'active-filter' : ''}>Completed</button>\n      </section>\n      <section>\n        <h2>Current Resources</h2>\n        <ul>\n          {filteredResources.length > 0 ? (\n            filteredResources.map(resource => (\n              <li key={resource.id}>\n                {resource.name} - Status: {resource.status}\n              </li>\n            ))\n          ) : (\n            <li>No resources match the current filter.</li>\n          )}\n        </ul>\n      </section>\n    </div>\n  );\n}`,
    analog_example: `function ThemeSwitcher() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div style={{ background: theme === 'light' ? '#fff' : '#333', color: theme === 'light' ? '#000' : '#fff' }}>
      <p>Current Theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}`,
    deepDiveLabel: "Why is the `key` prop so important when rendering lists?",
    deepDive: {
      hook: `Imagine you have a dynamic list of items, like a shopping cart, where items can be added, removed, or reordered. If React doesn't have a stable way to identify each individual item in the list, it struggles to efficiently update the DOM. When an item is removed, React might incorrectly update an existing item's content instead of removing the correct one. If items are reordered, React might re-render every single item, even if only their positions changed, leading to performance issues and potential state bugs (e.g., an input field's value jumping to the wrong item). The problem is how to give React a unique identifier for each element in a list so it can perform minimal, correct updates.`,
      pain: "⚠️ **Lesson:** Omitting or misusing the `key` prop when rendering lists can lead to inefficient UI updates, incorrect component state, and subtle bugs, especially when list items are added, removed, or reordered. Symptom: List items displaying incorrect data after updates, or performance degradation during list manipulations.",
      mentalModel: `**Mental model:** The Unique ID Badge. Think of each item in your dynamic list as an employee in a company. When you render a list, React needs to keep track of each 'employee'. The \`key\` prop is like a unique ID badge for each employee. If an employee changes their desk (reorders), React can quickly identify them by their ID badge and move only that employee. If a new employee joins (item added), React can efficiently insert them. If an employee leaves (item removed), React knows exactly which one to dismiss. Without these ID badges, React would have to guess, potentially confusing one employee for another or re-interviewing everyone just to figure out who moved, leading to unnecessary work and errors.`,
      discover: `**Pattern - List Rendering with \`key\`:**
\`\`\`tsx
const users = [
  { id: 'u1', name: 'Alice' },
  { id: 'u2', name: 'Bob' },
  { id: 'u3', name: 'Charlie' },
];

function UserList() {
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}> {/* Unique 'id' is used as key */}
          {user.name}
        </li>
      ))}
    </ul>
  );
}
\`\`\`
- The \`key\` prop is a special string attribute that must be included when creating lists of elements.
- It helps React identify which items have changed, are added, or are removed.
- Keys should be unique among siblings in the list.
- Using stable IDs from your data (like \`user.id\`) is the best practice.`,
      quickRules: `**Quick rules:**
- ✅ Always provide a \`key\` prop when rendering a list of elements.
- ✅ The \`key\` must be a stable, unique identifier for each item within its sibling list.
- ✅ Use a unique ID from your data (e.g., database ID) if available.
- ✅ If no stable ID is available, a unique string generated on the client-side can be used (e.g., \`uuid\`).
- ❌ Never use array \`index\` as a \`key\` if the list items can be reordered, added, or removed.
- ❌ Don't use non-unique or unstable values as keys (e.g., \`Math.random()\`).
- ❌ Avoid changing the \`key\` of a component during its lifetime, as this will force it to re-mount.`,
      watchOut: `👀 **Watch out:** Using the array \`index\` as a \`key\` is a common anti-pattern. While it might seem to work initially, it breaks down when the list changes. If you remove an item from the middle of an array, the indices of all subsequent items shift, causing React to incorrectly reuse or re-render components, leading to bugs where input fields lose focus or display incorrect data. Always prioritize a stable, unique ID from your data source.`,
      dryRun: `🔁 **Think:** List \`A: [{id: 'a', name: 'Apple'}, {id: 'b', name: 'Banana'}]\`. Rendered as \`<li>Apple</li>\` (key 'a'), \`<li>Banana</li>\` (key 'b'). Now, item 'a' is removed. List \`B: [{id: 'b', name: 'Banana'}]\`. React compares. It sees no item with key 'a', so it removes the 'Apple' \`<li>\`. It sees item with key 'b' is still present, so it keeps the 'Banana' \`<li>\`. If indices were used as keys, \`Apple\` would be key \`0\`, \`Banana\` key \`1\`. After removal, \`Banana\` would become key \`0\`. React would see key \`0\` changed from \`Apple\` to \`Banana\` and update the content, rather than removing \`Apple\` and keeping \`Banana\`. (Hint: Keys help React perform a diffing algorithm efficiently.)`,
      build: "This step connects the filter controls to our state and renders the dynamically filtered list, making the application interactive.",
    },
  },
  {
    id: "step8",
    type: "question",
    phase: "Step 8 of 8",
    paal: "Finally, let's add a separate 'History' view that specifically displays resources that are in a 'completed' or 'archived' state. This demonstrates creating a distinct, pre-filtered subset of our data.",
    hint: "Create a new `section` for the history view and apply a fixed filter to the `resources` array for this section.",
    example_code: `<section> <h2>Resource History</h2> <ul> {resources.filter(r => r.status === 'completed' || r.status === 'archived').length > 0 ? ( resources.filter(r => r.status === 'completed' || r.status === 'archived').map(resource => ( <li key={resource.id}> {resource.name} - Status: {resource.status} </li> )) ) : ( <li>No completed or archived resources in history.</li> )} </ul> </section>`,
    think_prompt: "How should we add a dedicated 'Resource History' section that shows only completed or archived resources?",
    mc_options: [
      `const historyItems = resources.filter(r => r.status === 'completed'); <section><h2>History</h2><ul>{historyItems.map(...)}</ul></section>`,
      `<section> <h2>Resource History</h2> <ul> {resources.filter(r => r.status === 'completed' || r.status === 'archived').map(resource => <li key={resource.id}>{resource.name}</li>)} </ul> </section>`,
      `const historyFilter = (r) => r.status === 'completed' || r.status === 'archived'; <section><h2>History</h2><ul>{resources.filter(historyFilter).map(...)}</ul></section>`,
    ],
    mc_correct_option: `<section> <h2>Resource History</h2> <ul> {resources.filter(r => r.status === 'completed' || r.status === 'archived').map(resource => <li key={resource.id}>{resource.name}</li>)} </ul> </section>`,
    mc_anchor: "resources.filter(r => r.status === 'completed'",
    why_this_matters: "Creating specialized views like a 'History' log is a common requirement in applications. It demonstrates how to leverage the same underlying data with different filtering logic to serve distinct user needs, without duplicating data or complex state management.",
    answer_keywords: ["fixed filter", "history view", "conditional rendering", "data subset"],
    seed_code: `import { useState } from 'react';\n\ninterface Resource { id: string; name: string; status: 'active' | 'pending' | 'completed' | 'archived'; }\n\nfunction ResourceList() {\n  const [resources, setResources] = useState<Resource[]>([\n    { id: 'r1', name: 'Task A', status: 'active' },\n    { id: 'r2', name: 'Task B', status: 'pending' },\n    { id: 'r3', name: 'Task C', status: 'completed' },\n    { id: 'r4', name: 'Task D', status: 'archived' },\n  ]);\n\n  const [filterStatus, setFilterStatus] = useState<'all' | Resource['status']>('all');\n\n  const handleFilterChange = (status: 'all' | Resource['status']) => {\n    setFilterStatus(status);\n  };\n\n  const filteredResources = resources.filter(resource =>\n    filterStatus === 'all' || resource.status === filterStatus\n  );\n\n  return (\n    <div>\n      <h1>Resource Dashboard</h1>\n      <section>\n        <h2>Filter Resources</h2>\n        <button onClick={() => handleFilterChange('all')} className={filterStatus === 'all' ? 'active-filter' : ''}>All</button>\n        <button onClick={() => handleFilterChange('active')} className={filterStatus === 'active' ? 'active-filter' : ''}>Active</button>\n        <button onClick={() => handleFilterChange('pending')} className={filterStatus === 'pending' ? 'active-filter' : ''}>Pending</button>\n        <button onClick={() => handleFilterChange('completed')} className={filterStatus === 'completed' ? 'active-filter' : ''}>Completed</button>\n      </section>\n      <section>\n        <h2>Current Resources</h2>\n        <ul>\n          {filteredResources.length > 0 ? (\n            filteredResources.map(resource => (\n              <li key={resource.id}>\n                {resource.name} - Status: {resource.status}\n              </li>\n            ))\n          ) : (\n            <li>No resources match the current filter.</li>\n          )}\n        </ul>\n      </section>\n    </div>\n  );\n}`,
    starter_code: `import { useState } from 'react';\n\ninterface Resource { id: string; name: string; status: 'active' | 'pending' | 'completed' | 'archived'; }\n\nfunction ResourceList() {\n  const [resources, setResources] = useState<Resource[]>([\n    { id: 'r1', name: 'Task A', status: 'active' },\n    { id: 'r2', name: 'Task B', status: 'pending' },\n    { id: 'r3', name: 'Task C', status: 'completed' },\n    { id: 'r4', name: 'Task D', status: 'archived' },\n  ]);\n\n  const [filterStatus, setFilterStatus] = useState<'all' | Resource['status']>('all');\n\n  const handleFilterChange = (status: 'all' | Resource['status']) => {\n    setFilterStatus(status);\n  };\n\n  const filteredResources = resources.filter(resource =>\n    filterStatus === 'all' || resource.status === filterStatus\n  );\n\n  return (\n    <div>\n      <h1>Resource Dashboard</h1>\n      <section>\n        <h2>Filter Resources</h2>\n        <button onClick={() => handleFilterChange('all')} className={filterStatus === 'all' ? 'active-filter' : ''}>All</button>\n        <button onClick={() => handleFilterChange('active')} className={filterStatus === 'active' ? 'active-filter' : ''}>Active</button>\n        <button onClick={() => handleFilterChange('pending')} className={filterStatus === 'pending' ? 'active-filter' : ''}>Pending</button>\n        <button onClick={() => handleFilterChange('completed')} className={filterStatus === 'completed' ? 'active-filter' : ''}>Completed</button>\n      </section>\n      <section>\n        <h2>Current Resources</h2>\n        <ul>\n          {filteredResources.length > 0 ? (\n            filteredResources.map(resource => (\n              <li key={resource.id}>\n                {resource.name} - Status: {resource.status}\n              </li>\n            ))\n          ) : (\n            <li>No resources match the current filter.</li>\n          )}\n        </ul>\n      </section>\n      {/* Add Resource History section here */}\n    </div>\n  );\n}`,
    feedback_correct: "Excellent! You've successfully added a dedicated 'Resource History' section that correctly filters and displays only completed or archived resources, demonstrating the flexibility of data views.",
    feedback_partial: "You're on the right track, but ensure your history view filters for *both* 'completed' and 'archived' statuses, and includes a message for when no history items are present.",
    feedback_wrong: "Your history view is either missing the filtering logic or not correctly rendering the filtered items. Remember to use `filter()` and `map()` for this section.",
    expected: `import { useState } from 'react';\n\ninterface Resource { id: string; name: string; status: 'active' | 'pending' | 'completed' | 'archived'; }\n\nfunction ResourceList() {\n  const [resources, setResources] = useState<Resource[]>([\n    { id: 'r1', name: 'Task A', status: 'active' },\n    { id: 'r2', name: 'Task B', status: 'pending' },\n    { id: 'r3', name: 'Task C', status: 'completed' },\n    { id: 'r4', name: 'Task D', status: 'archived' },\n  ]);\n\n  const [filterStatus, setFilterStatus] = useState<'all' | Resource['status']>('all');\n\n  const handleFilterChange = (status: 'all' | Resource['status']) => {\n    setFilterStatus(status);\n  };\n\n  const filteredResources = resources.filter(resource =>\n    filterStatus === 'all' || resource.status === filterStatus\n  );\n\n  return (\n    <div>\n      <h1>Resource Dashboard</h1>\n      <section>\n        <h2>Filter Resources</h2>\n        <button onClick={() => handleFilterChange('all')} className={filterStatus === 'all' ? 'active-filter' : ''}>All</button>\n        <button onClick={() => handleFilterChange('active')} className={filterStatus === 'active' ? 'active-filter' : ''}>Active</button>\n        <button onClick={() => handleFilterChange('pending')} className={filterStatus === 'pending' ? 'active-filter' : ''}>Pending</button>\n        <button onClick={() => handleFilterChange('completed')} className={filterStatus === 'completed' ? 'active-filter' : ''}>Completed</button>\n      </section>\n      <section>\n        <h2>Current Resources</h2>\n        <ul>\n          {filteredResources.length > 0 ? (\n            filteredResources.map(resource => (\n              <li key={resource.id}>\n                {resource.name} - Status: {resource.status}\n              </li>\n            ))\n          ) : (\n            <li>No resources match the current filter.</li>\n          )}\n        </ul>\n      </section>\n      <section>\n        <h2>Resource History</h2>\n        <ul>\n          {resources.filter(r => r.status === 'completed' || r.status === 'archived').length > 0 ? (\n            resources.filter(r => r.status === 'completed' || r.status === 'archived').map(resource => (\n              <li key={resource.id}>\n                {resource.name} - Status: {resource.status}\n              </li>\n            ))\n          ) : (\n            <li>No completed or archived resources in history.</li>\n          )}\n        </ul>\n      </section>\n    </div>\n  );\n}`,
    analog_example: `const logEntries = [
  { id: 'l1', message: 'User logged in', type: 'info' },
  { id: 'l2', message: 'Error: API failed', type: 'error' },
  { id: 'l3', message: 'User logged out', type: 'info' },
  { id: 'l4', message: 'Warning: Low disk space', type: 'warning' },
];

function ErrorLogViewer() {
  const errorLogs = logEntries.filter(entry => entry.type === 'error' || entry.type === 'warning');

  return (
    <div>
      <h3>Critical Logs</h3>
      <ul>
        {errorLogs.length > 0 ? (
          errorLogs.map(log => (
            <li key={log.id}>
              [\${log.type.toUpperCase()}] \${log.message}
            </li>
          ))
        ) : (
          <li>No critical logs found.</li>
        )}
      </ul>
    </div>
  );
}`,
    deepDiveLabel: "When should I create a separate component for a filtered view?",
    deepDive: {
      hook: `Imagine your \`ResourceList\` component grows very large. It handles displaying all resources, filtering them, managing the filter state, and now also a history view. The file becomes hundreds of lines long, difficult to read, and even harder to maintain. Any change to the filtering logic might accidentally break the history view, or vice-versa. Testing becomes a nightmare because one component is responsible for too many things. The component is doing too much, violating the Single Responsibility Principle, and making collaboration and debugging inefficient. You need a way to break down this complexity into manageable, independent pieces.`,
      pain: "⚠️ **Lesson:** A single component handling too many responsibilities (e.g., displaying, filtering, and managing multiple distinct views) leads to bloated, hard-to-maintain code and increased risk of bugs. Symptom: Components growing excessively large, with intertwined logic for different features, making them difficult to understand, test, or reuse.",
      mentalModel: `**Mental model:** The Specialized Workstation. Think of your \`ResourceList\` as a general-purpose factory floor. Initially, it handles everything. But as the factory grows, you realize it's more efficient to set up specialized workstations. The 'Resource History' view is a perfect candidate for its own workstation (a separate component). This workstation would receive the raw resources as props, and its *sole responsibility* would be to filter them for 'completed' or 'archived' status and display them. This makes each workstation smaller, easier to understand, test independently, and even reuse in other parts of the factory. The main factory floor (the parent component) then just coordinates these specialized workstations, passing them the necessary raw materials.`,
      discover: `**Pattern - Component Composition for Views:**
\`\`\`tsx
// ResourceHistory.tsx
interface ResourceHistoryProps { 
  allResources: Resource[];
}

function ResourceHistory({ allResources }: ResourceHistoryProps) {
  const historyItems = allResources.filter(r => r.status === 'completed' || r.status === 'archived');
  return (
    <section>
      <h2>Resource History</h2>
      <ul>
        {historyItems.length > 0 ? (
          historyItems.map(resource => <li key={resource.id}>{resource.name}</li>)
        ) : (
          <li>No history items.</li>
        )}
      </ul>
    </section>
  );
}

// In parent component (e.g., ResourceList)
// <ResourceHistory allResources={resources} />
\`\`\`
- Creates a new, dedicated component (\`ResourceHistory\`) for the specific view.
- The new component receives the full data (\`allResources\`) as a prop.
- It encapsulates its own filtering logic and rendering for that specific view.
- Improves modularity, readability, and reusability of the history view.
- Decouples the history view's logic from the main list's filtering logic.`,
      quickRules: `**Quick rules:**
- ✅ Create a new component when a section of your UI has distinct responsibilities or complex logic.
- ✅ Pass data down to child components via props.
- ✅ Aim for components that are small, focused, and do one thing well (Single Responsibility Principle).
- ✅ Extract reusable UI patterns or complex logic into their own components or custom hooks.
- ❌ Avoid creating a new component if it's just a simple \`div\` wrapper with no unique logic or state.
- ❌ Don't pass down *too many* props; consider \`useContext\` or prop drilling alternatives for deep hierarchies.
- ❌ Never duplicate complex filtering or display logic across multiple components; centralize it or pass it as a prop.`,
      watchOut: `👀 **Watch out:** While component composition is powerful, avoid 'prop drilling' – passing props through many layers of components that don't actually use them. For deeply nested components needing the same data, consider using React's Context API or a state management library to make the data more directly accessible.`,
      dryRun: `🔁 **Think:** If \`ResourceList\` passes \`allResources: [{status: 'active'}, {status: 'completed'}, {status: 'archived'}]\` to \`ResourceHistory\`. Inside \`ResourceHistory\`, \`historyItems\` is calculated: \`active\` is false, \`completed\` is true, \`archived\` is true. So \`historyItems\` becomes \`[{status: 'completed'}, {status: 'archived'}]\`. The \`ResourceHistory\` component then renders only these two items. If \`allResources\` later changes to \`[{status: 'active'}, {status: 'pending'}]\`, \`historyItems\` will become an empty array, and the history view will display 'No history items.' (Hint: The child component's filtering logic is independent of the parent's \`filterStatus\` state.)`,
      build: "This step completes the module by adding a dedicated history view, demonstrating how to create distinct, pre-filtered data displays within a single application.",
    },
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "1. Imports", id: "step1" },
  { label: "2. Define Types", id: "step2" },
  { label: "3. Component Shell", id: "step3" },
  { label: "4. State Variables", id: "step4" },
  { label: "5. Structure UI", id: "step5" },
  { label: "6. Filter Logic", id: "step6" },
  { label: "7. Wire UI", id: "step7" },
  { label: "8. History View", id: "step8" },
];

export default createINPACTEngine({
  NODES,
  sideItems,
  lessonNum: 0,
  title: "Building Dynamic Filtered and History Views",
  shortName: "Filtered & History Views",
});
