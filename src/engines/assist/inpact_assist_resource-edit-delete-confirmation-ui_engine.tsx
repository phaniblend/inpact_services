import createINPACTEngine from "../inpact_engine_shared";

interface Item {
  id: string;
  name: string;
  description: string;
}

interface ItemFormValues {
  name: string;
  description: string;
}

export const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "resource-edit-delete-confirmation-ui",
      title: "Building Edit Forms and Delete Confirmation Flows",
      body: `
When building applications, users often need to modify existing data or remove it entirely. Simply displaying data isn't enough; a robust application provides intuitive ways to interact with that data. This pattern addresses the fundamental challenge of enabling users to update specific details of a record through a dedicated form, and to safely remove a record, typically involving a confirmation step to prevent accidental data loss. Without these mechanisms, applications become read-only, forcing users to interact with the underlying database directly or to re-create records from scratch for minor changes, leading to frustration and inefficiency.

This pattern is ubiquitous across almost all interactive software. You'll encounter it in settings panels where you update user preferences, in content management systems where articles or posts are edited, in task managers where tasks are marked complete or deleted, and in administrative dashboards where user accounts or system configurations are managed. Any time a user needs to change or remove a discrete piece of information, the principles of pre-populating an edit form and requiring confirmation for deletion come into play, ensuring data integrity and a smooth user experience.
      `,
      usecase: "A settings panel where a user can update their profile information (name, email) or delete their account.",
      designMock: {
        "kind": "list-and-form",
        "screenTitle": "Resource Manager",
        "caption": "Interact with items: edit details or remove them.",
        "listCaption": "Current Items",
        "emptyCaption": "No Items Yet",
        "emptyMessage": "Add items to manage them.",
        "rows": [
          {"title": "Widget A", "subtitle": "A versatile tool.", "meta": "ID: 1"},
          {"title": "Gadget B", "subtitle": "A handy device.", "meta": "ID: 2"}
        ],
        "fields": [
          {"label": "Name", "sample": "New Item Name"},
          {"label": "Description", "sample": "Detailed description"}
        ],
        "submitLabel": "Save"
      }
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Implement a mechanism to fetch and display a list of resources.",
      "Create an edit form that pre-populates with existing resource data.",
      "Handle form submission to update a resource via an API call.",
      "Implement a confirmation dialog for resource deletion.",
      "Handle resource deletion via an API call and update the UI.",
      "Manage UI state for displaying/hiding forms and dialogs.",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 7",
    paal: "To begin, define the necessary imports for a basic functional component. Focus on the core building blocks without including any state hooks yet.",
    hint: "Think about what's globally available for JSX and what's needed for a basic component structure.",
    example_code: `
// No imports needed for JSX.Element in .tsx files
// import React from 'react'; // Not needed for basic JSX
// import { useState } from 'react'; // Not yet
    `,
    think_prompt: "What is the minimal import statement required for a TypeScript file that will contain a functional component returning JSX, given that \`JSX.Element\` is globally available?",
    mc_options: [
      "import React from 'react';",
      "import { useState } from 'react';",
      "// No specific imports are needed for basic JSX in .tsx files",
    ],
    mc_correct_option: "// No specific imports are needed for basic JSX in .tsx files",
    mc_anchor: "// No specific imports are needed for basic JSX in .tsx files",
    why_this_matters: "Understanding minimal imports prevents unnecessary code and clarifies that \`JSX.Element\` is a global type in TypeScript React projects, reducing boilerplate.",
    answer_keywords: ["no imports", "tsx", "jsx.element"],
    seed_code: `
interface Item {
  id: string;
  name: string;
  description: string;
}

interface ItemFormValues {
  name: string;
  description: string;
}
    `,
    starter_code: `
interface Item {
  id: string;
  name: string;
  description: string;
}

interface ItemFormValues {
  name: string;
  description: string;
}

// Add any necessary imports here
    `,
    feedback_correct: "Correct! In a .tsx file, \`JSX.Element\` is globally recognized, so no explicit \`import React\` is needed just to use JSX syntax.",
    feedback_partial: "While \`React\` is often imported, for basic JSX in a .tsx file, it's not strictly necessary. Consider what \`JSX.Element\` provides.",
    feedback_wrong: "Importing \`useState\` is for managing component state, which we'll do later. For just defining a component that returns JSX, less is needed.",
    expected: `
interface Item {
  id: string;
  name: string;
  description: string;
}

interface ItemFormValues {
  name: string;
  description: string;
}
    `,
    analog_example: `
// In a simple TypeScript file for a utility function:
// No imports needed if it's just a pure function.
function calculateArea(width: number, height: number): number {
  return width * height;
}
    `,
    deepDiveLabel: "Why are no imports needed for JSX?",
    deepDive: {
      hook: `
Imagine you're setting up a new project, and you've just created your first component file. You start writing your JSX, expecting to see a red squiggle under \`React\` or \`JSX.Element\`. But... nothing. It just works. This can be confusing if you're used to other environments or older React setups where \`import React from 'react';\` was mandatory at the top of every file containing JSX. Why does it seem to magically understand what JSX is without an explicit import? This "magic" can feel like a hidden rule, making you wonder if you're missing something crucial or if your tooling is just being overly helpful. Understanding this behavior is key to writing cleaner, more efficient code and avoiding unnecessary imports.
      `,
      pain: `
⚠️ **Lesson:** Unnecessary imports can clutter your code, increase bundle size (even if tree-shaken, the mental overhead is there), and obscure the actual dependencies of a file. Symptom: You might see \`React is defined but never used\` warnings, or simply have a longer list of imports than truly required, making it harder to discern essential dependencies at a glance.
      `,
      mentalModel: `
**Mental model:** The "Global JSX Interpreter." Think of your TypeScript compiler (specifically, when configured for React) as having a built-in, always-on interpreter for JSX syntax. This interpreter doesn't need a specific \`React\` object imported into *every* file to understand the *syntax* of \`<div />\` or \`<MyComponent />\`. Instead, it knows how to transform that syntax into function calls (e.g., \`React.createElement(...)\` or a modern JSX runtime equivalent) because it's configured to do so globally. The actual \`React\` runtime is still needed for your application to run, but the *compiler* doesn't need to see an \`import React\` statement in every file to process the JSX *syntax*.
      `,
      discover: `
**Pattern - JSX Runtime:**
\`\`\`tsx
// No import needed for JSX syntax itself
function MyComponent() {
  return <div>Hello, World!</div>;
}

// If you need React hooks or other named exports, then you import them:
// import { useState } from 'react';
// function MyComponentWithState() {
//   const [count, setCount] = useState(0);
//   return <button onClick={() => setCount(count + 1)}>{count}</button>;
// }
\`\`\`
-   **Global Availability:** In modern React projects with a JSX runtime (like the automatic JSX runtime introduced in React 17), the compiler transforms JSX into calls that don't directly reference \`React\` in your source file.
-   **Type Definitions:** The \`JSX.Element\` type is typically provided by \`@types/react\` and is globally available in \`.tsx\` files, meaning you don't need to import it just for type annotations.
-   **When Imports ARE Needed:** You still need to import \`React\` or specific named exports (like \`useState\`, \`useEffect\`, \`useContext\`) if you are actually *using* those specific APIs within your component.
-   **Clean Code:** Omitting unnecessary imports leads to cleaner, more readable code and can slightly improve build performance.
      `,
      quickRules: `
**Quick rules:**
-   ✅  Omit \`import React from 'react';\` if you are only using JSX syntax and no other React APIs (like hooks).
-   ✅  Trust your linter to tell you when an import is truly missing for a specific API.
-   ✅  Understand that the TypeScript compiler handles JSX syntax transformation globally.
-   ✅  Keep your import statements minimal and focused on actual dependencies.
-   ❌  Don't include \`import React from 'react';\` out of habit if it's not strictly needed.
-   ❌  Don't import \`JSX.Element\` explicitly; it's a global type.
-   ❌  Don't confuse the JSX syntax processing with the need for React runtime APIs.
      `,
      watchOut: `
👀 **Watch out:** This rule primarily applies to modern React setups (React 17+) using the automatic JSX runtime. If you're working in an older project or one configured with a classic JSX runtime, \`import React from 'react';\` might still be required. Always check your project's configuration and tooling. Also, if you use named exports from 'react' (like \`useState\`), you *must* import them. The rule only applies to the top-level \`React\` import for JSX itself.
      `,
      dryRun: `
🔁 **Think:** A new \`.tsx\` file is created. The developer writes \`<div />\`.
1.  **Initial state:** The file is empty of imports.
2.  **Compiler action:** The TypeScript compiler, configured for React's automatic JSX runtime, sees the \`<div />\` syntax.
3.  **Transformation:** It transforms \`<div />\` into something like \`_jsx("div", { children: "..." })\` (or similar, depending on the exact runtime). This transformation does not require an explicit \`React\` variable to be in scope within the \`.tsx\` file itself.
4.  **Result:** The code compiles successfully without any \`React\` import.
(Hint: The compiler handles the syntax, the runtime provides the implementation.)
      `,
      build: "**Learning focus:** Understand the minimal import requirements for a React component in a .tsx file."
    },
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 7",
    paal: "Now, create the basic functional component shell for our `ItemList` component. It should accept no props and return a simple `div` containing a heading.",
    hint: "Define a function that returns JSX. Remember to export it.",
    example_code: `
function MyComponent() {
  return (
    <div>
      <h1>My Component</h1>
    </div>
  );
}
export default MyComponent;
    `,
    think_prompt: "What is the correct structure for a functional component named `ItemList` that returns a `div` with an `h1`?",
    mc_options: [
      "const ItemList = () => { return <div><h1>Items</h1></div>; }; export default ItemList;",
      "function ItemList(): JSX.Element { return <div><h1>Items</h1></div>; } export default ItemList;",
      "export default function ItemList() { return <div><h1>Items</h1></div>; }",
    ],
    mc_correct_option: "export default function ItemList() { return <div><h1>Items</h1></div>; }",
    mc_anchor: "export default function ItemList() { return <div><h1>Items</h1></div>; }",
    why_this_matters: "Establishing the component shell is the first step in building any UI, providing a container for all subsequent logic and rendering.",
    answer_keywords: ["functional component", "export default", "jsx"],
    seed_code: `
interface Item {
  id: string;
  name: string;
  description: string;
}

interface ItemFormValues {
  name: string;
  description: string;
}
    `,
    starter_code: `
interface Item {
  id: string;
  name: string;
  description: string;
}

interface ItemFormValues {
  name: string;
  description: string;
}

// Create the ItemList component here
    `,
    feedback_correct: "Excellent! This sets up a clean, standard functional component. The explicit return type \`JSX.Element\` is optional but good practice.",
    feedback_partial: "You've got the core component, but ensure it's exported as the default. Also, consider the most concise way to define and export.",
    feedback_wrong: "While \`const ItemList = () => { ... }\` is valid, \`function ItemList() { ... }\` is often preferred for default exports as it allows for hoisting and clearer debugging stack traces.",
    expected: `
interface Item {
  id: string;
  name: string;
  description: string;
}

interface ItemFormValues {
  name: string;
  description: string;
}

export default function ItemList() {
  return (
    <div>
      <h1>Resource Manager</h1>
    </div>
  );
}
    `,
    analog_example: `
// A simple utility function for formatting names
export function formatName(firstName: string, lastName: string): string {
  return \`\${firstName} \${lastName}\`;
}
    `,
    deepDiveLabel: "Function vs. Arrow Function Components",
    deepDive: {
      hook: `
You've likely seen React components defined in two primary ways: as a traditional \`function\` declaration or as an \`arrow function\` assigned to a constant. Both work, and often produce identical results in terms of rendering. However, this choice isn't purely stylistic; there are subtle differences that can impact how your code behaves, particularly with hoisting, \`this\` binding, and how they appear in stack traces during debugging. For beginners, picking one pattern and sticking to it is often recommended, but understanding *why* both exist and their implications is crucial for reading diverse codebases and making informed decisions.
      `,
      pain: `
⚠️ **Lesson:** Inconsistent component definition styles can make a codebase harder to read and maintain. More critically, misunderstanding the differences can lead to unexpected behavior, especially regarding \`this\` context in class components (though less relevant for modern functional components) or debugging challenges. Symptom: Debugging a complex application and seeing anonymous functions in stack traces, making it harder to pinpoint the exact component causing an issue.
      `,
      mentalModel: `
**Mental model:** "Component Blueprint vs. Component Recipe." A \`function ItemList() { ... }\` is like a traditional architectural blueprint: it's a named, well-defined structure that exists from the moment the program starts. An \`const ItemList = () => { ... }\` is more like a recipe: it's a set of instructions assigned to a variable, and that variable needs to be defined before it can be used. Both create a component, but their underlying JavaScript mechanics differ slightly in how they are "prepared" by the engine.
      `,
      discover: `
**Pattern - Component Definition Styles:**
\`\`\`tsx
// Function Declaration (often preferred for default exports)
export default function MyFunctionComponent() {
  return <div>Hello from Function!</div>;
}

// Arrow Function Expression (common for named exports or inline definitions)
export const MyArrowComponent = () => {
  return <div>Hello from Arrow!</div>;
};
\`\`\`
-   **Hoisting:** Function declarations are "hoisted," meaning they can be called before they are defined in the code. Arrow functions (as variable assignments) are not hoisted and must be defined before use.
-   **\`this\` Binding:** In traditional functions, \`this\` is dynamically bound based on how the function is called. Arrow functions lexically bind \`this\`, meaning \`this\` refers to the \`this\` of the enclosing scope, which is generally simpler and safer in React functional components (though \`this\` is rarely used directly in modern functional components).
-   **Debugging:** Function declarations provide clearer names in stack traces, which can be helpful during debugging. Arrow functions assigned to variables might sometimes appear as "anonymous" in older debuggers, though modern tools are better at inferring names.
-   **Readability:** For default exports, \`export default function ComponentName() { ... }\` is often considered more readable as the component name is immediately visible.
      `,
      quickRules: `
**Quick rules:**
-   ✅  Use \`export default function ComponentName() { ... }\` for your primary component export for clarity and better debuggability.
-   ✅  Use \`const ComponentName = () => { ... }\` for named exports or smaller, inline components if you prefer the concise syntax.
-   ✅  Be consistent within your project or team's conventions.
-   ✅  Understand that for functional components, the \`this\` binding difference is less critical than for class components.
-   ❌  Avoid mixing styles indiscriminately within the same file or project.
-   ❌  Don't rely on hoisting for arrow function components.
-   ❌  Don't use \`React.FC\` as a type annotation; it's discouraged due to issues with default props and generics.
      `,
      watchOut: `
👀 **Watch out:** While \`React.FC\` (or \`React.FunctionComponent\`) was once common for typing functional components, it's now generally discouraged. It implicitly adds \`children\` to props and has issues with generics and default props. It's better to explicitly define your props interface and type your component as a plain function or arrow function returning \`JSX.Element\` (which is often inferred).
      `,
      dryRun: `
🔁 **Think:** A component \`MyComponent\` is defined.
1.  **Scenario A (Function Declaration):** \`function MyComponent() { return <div />; }\` is written. The JavaScript engine processes this definition, and \`MyComponent\` is available throughout its scope due to hoisting.
2.  **Scenario B (Arrow Function):** \`const MyComponent = () => { return <div />; };\` is written. The JavaScript engine processes this as a variable assignment. \`MyComponent\` is only available after this line of code has been executed.
3.  **Result:** Both result in a callable function that returns JSX, but their availability in the execution timeline differs.
(Hint: Think about when the name \`MyComponent\` becomes known to the JavaScript runtime.)
      `,
      build: "**Learning focus:** Define a basic functional component using a function declaration and export it."
    },
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 7",
    paal: "Now, introduce state variables to manage the list of items, the item being edited, and the visibility of the edit form and delete confirmation dialog. Remember to import the `useState` hook.",
    hint: "You'll need `useState` for `items`, `editingItem`, `deletingItem`, `showEditForm`, and `showDeleteConfirm`.",
    example_code: `
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
    `,
    think_prompt: "What `useState` declarations are needed to manage a list of `Item`s, a single `Item` for editing, another for deleting, and two booleans for UI visibility?",
    mc_options: [
      "const [items, setItems] = useState<Item[]>([]); const [editingItem, setEditingItem] = useState<Item | null>(null); const [deletingItem, setDeletingItem] = useState<Item | null>(null); const [showEditForm, setShowEditForm] = useState(false); const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);",
      "const [items, setItems] = useState([]); const [editingItem, setEditingItem] = useState(null); const [deletingItem, setDeletingItem] = useState(null); const [showEditForm, setShowEditForm] = useState(false); const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);",
      "const [items, setItems] = useState<Item[]>([]); const [editingItem, setEditingItem] = useState<Item>(); const [deletingItem, setDeletingItem] = useState<Item>(); const [showEditForm, setShowEditForm] = useState<boolean>(false); const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);",
    ],
    mc_correct_option: "const [items, setItems] = useState<Item[]>([]); const [editingItem, setEditingItem] = useState<Item | null>(null); const [deletingItem, setDeletingItem] = useState<Item | null>(null); const [showEditForm, setShowEditForm] = useState(false); const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);",
    mc_anchor: "const [items, setItems] = useState<Item[]>([]); const [editingItem, setEditingItem] = useState<Item | null>(null); const [deletingItem, setDeletingItem] = useState<Item | null>(null); const [showEditForm, setShowEditForm] = useState(false); const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);",
    why_this_matters: "State management is fundamental to dynamic UIs. Correctly defining state for data and UI visibility allows the component to react to user interactions and API responses.",
    answer_keywords: ["usestate", "state management", "item", "null", "boolean"],
    seed_code: `
interface Item {
  id: string;
  name: string;
  description: string;
}

interface ItemFormValues {
  name: string;
  description: string;
}

export default function ItemList() {
  return (
    <div>
      <h1>Resource Manager</h1>
    </div>
  );
}
    `,
    starter_code: `
import { useState } from 'react'; // Don't forget this import!

interface Item {
  id: string;
  name: string;
  description: string;
}

interface ItemFormValues {
  name: string;
  description: string;
}

export default function ItemList() {
  // Add state variables here

  return (
    <div>
      <h1>Resource Manager</h1>
    </div>
  );
}
    `,
    feedback_correct: "Spot on! Using \`null\` for optional objects and explicit types for arrays ensures type safety and clarity. The booleans correctly default to \`false\`.",
    feedback_partial: "You've got the \`useState\` calls, but ensure you're explicitly typing the array and correctly handling the possibility of \`editingItem\` and \`deletingItem\` being initially empty (e.g., \`null\`).",
    feedback_wrong: "Omitting type arguments for \`useState\` can lead to \`any\` types, reducing type safety. Also, \`undefined\` is less common than \`null\` for 'no value' in React state for objects.",
    expected: `
import { useState } from 'react';

interface Item {
  id: string;
  name: string;
  description: string;
}

interface ItemFormValues {
  name: string;
  description: string;
}

export default function ItemList() {
  const [items, setItems] = useState<Item[]>([]);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div>
      <h1>Resource Manager</h1>
    </div>
  );
}
    `,
    analog_example: `
import { useState } from 'react';

function TaskManager() {
  interface Task { id: string; title: string; completed: boolean; }
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // ... component logic
  return (
    <div>
      {/* ... */}
    </div>
  );
}
    `,
    deepDiveLabel: "Understanding `useState` and Initial State Types",
    deepDive: {
      hook: `
When you first encounter \`useState\`, it seems straightforward: provide an initial value, and you get back the current state and a function to update it. However, things can get tricky when your state might be one of several types, or when it starts as "nothing" (like an empty array or a null object). For instance, if you're tracking a selected item, it might initially be \`null\`, but then become a full \`Item\` object. How do you tell TypeScript about this possibility? Incorrectly typing your initial state can lead to frustrating type errors later on, or worse, runtime bugs that TypeScript *should* have caught.
      `,
      pain: `
⚠️ **Lesson:** Incorrectly typed \`useState\` initial values can lead to \`any\` types, compile-time errors, or runtime errors when the state's actual value doesn't match its assumed type. Symptom: TypeScript complains that \`'null' is not assignable to type 'Item'\` when you try to set \`editingItem\` to \`null\`, or conversely, that you're trying to access properties on a potentially \`null\` object without checking.
      `,
      mentalModel: `
**Mental model:** "The State's Life Cycle Blueprint." Imagine your state variable isn't just a single value, but a blueprint that describes all possible values it can hold throughout its existence. For an array, it starts empty but will eventually hold many items. For a selected object, it starts as "no selection" (\`null\`) and then becomes a specific object. The \`useState\` hook, especially with TypeScript, requires you to provide a blueprint that covers *all* these phases, not just the initial one.
      `,
      discover: `
**Pattern - Typed \`useState\` with Union Types:**
\`\`\`tsx
import { useState } from 'react';

interface User {
  id: string;
  name: string;
}

function UserProfile() {
  // State for a list of users, starts empty
  const [users, setUsers] = useState<User[]>([]);

  // State for a currently selected user, starts as null (no user selected)
  // The type is a union: User OR null
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // State for a boolean flag, inferred as boolean
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div>
      {/* ... */}
    </div>
  );
}
\`\`\`
-   **Explicit Array Types:** For arrays, always specify the element type, e.g., \`useState<Item[]>([])\`. This tells TypeScript that the array will contain \`Item\` objects.
-   **Union Types for Optional Objects:** When an object state might be \`null\` or \`undefined\` initially, but later hold a full object, use a union type like \`Item | null\` or \`Item | undefined\`. This explicitly tells TypeScript about the possible states.
-   **Boolean Inference:** For simple booleans or numbers, TypeScript can often infer the type from the initial value, e.g., \`useState(false)\` infers \`boolean\`.
-   **\`null\` vs. \`undefined\`:** In React state, \`null\` is generally preferred over \`undefined\` to signify "no value" or "no object selected" because \`null\` is a primitive value representing the intentional absence of any object value, whereas \`undefined\` often means a variable has been declared but not yet assigned a value.
      `,
      quickRules: `
**Quick rules:**
-   ✅  Always explicitly type arrays in \`useState\` (e.g., \`useState<MyType[]>([])\`).
-   ✅  Use union types (e.g., \`MyObject | null\`) when an object state can be initially empty or later cleared.
-   ✅  Initialize boolean flags with \`false\` or \`true\` directly for type inference.
-   ✅  Prefer \`null\` over \`undefined\` for "no value" when dealing with objects in state.
-   ❌  Avoid letting TypeScript infer \`any\` for complex state types by not providing initial values or types.
-   ❌  Don't forget to import \`useState\` from 'react'.
-   ❌  Don't assume an object state will *always* be an object; account for its initial empty state.
      `,
      watchOut: `
👀 **Watch out:** If you initialize an object state with \`useState({})\`, TypeScript might infer its type as \`{}\` (an empty object), which can then cause issues when you try to assign a more specific object type to it later. It's better to explicitly type it as \`useState<MyObject | null>(null)\` or \`useState<Partial<MyObject>>({})\` if you intend for it to be a partial object.
      `,
      dryRun: `
🔁 **Think:** The component renders for the first time.
1.  **\`items\` state:** \`useState<Item[]>([])\` is called. \`items\` is initialized as \`[]\` (an empty array). \`setItems\` is available to update it.
2.  **\`editingItem\` state:** \`useState<Item | null>(null)\` is called. \`editingItem\` is initialized as \`null\`. \`setEditingItem\` is available.
3.  **\`showEditForm\` state:** \`useState(false)\` is called. \`showEditForm\` is initialized as \`false\`. \`setShowEditForm\` is available.
4.  **Result:** All state variables are correctly initialized with their specified types and initial values, ready for interaction.
(Hint: The initial value sets both the starting content and helps TypeScript infer the type.)
      `,
      build: "**Learning focus:** Declare and correctly type state variables using the `useState` hook for managing data and UI visibility."
    },
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 7",
    paal: "Now, build the basic JSX structure for displaying the item list, the edit form, and the delete confirmation dialog. Use conditional rendering based on the state variables you just created. Do not wire any event handlers yet.",
    hint: "Use `&&` or ternary operators for conditional rendering. Include placeholders for the form fields and dialog content.",
    example_code: `
{showModal && (
  <div className="modal">
    <p>Modal content</p>
  </div>
)}
    `,
    think_prompt: "How would you structure the JSX to show a list, an edit form only when `showEditForm` is true, and a delete dialog only when `showDeleteConfirm` is true?",
    mc_options: [
      `<div><h1>Resource Manager</h1><ul>{items.map(item => <li key={item.id}>{item.name}</li>)}</ul>{showEditForm && <form>...</form>}{showDeleteConfirm && <div>...</div>}</div>`,
      `<div><h1>Resource Manager</h1>{items.length > 0 ? <ul>{items.map(item => <li key={item.id}>{item.name}</li>)}</ul> : <p>No items.</p>}{showEditForm ? <form>...</form> : null}{showDeleteConfirm ? <div>...</div> : null}</div>`,
      `<div><h1>Resource Manager</h1><ul>{items.map(item => <li key={item.id}>{item.name}</li>)}</ul>{showEditForm && (<div><h2>Edit Item</h2><input type="text" /><textarea></textarea><button>Save</button><button>Cancel</button></div>)}{showDeleteConfirm && (<div><h2>Confirm Delete</h2><p>Are you sure?</p><button>Delete</button><button>Cancel</button></div>)}</div>`,
    ],
    mc_correct_option: `<div><h1>Resource Manager</h1><ul>{items.map(item => <li key={item.id}>{item.name}</li>)}</ul>{showEditForm && (<div><h2>Edit Item</h2><input type="text" /><textarea></textarea><button>Save</button><button>Cancel</button></div>)}{showDeleteConfirm && (<div><h2>Confirm Delete</h2><p>Are you sure?</p><button>Delete</button><button>Cancel</button></div>)}</div>`,
    mc_anchor: `<div><h1>Resource Manager</h1><ul>{items.map(item => <li key={item.id}>{item.name}</li>)}</ul>{showEditForm && (<div><h2>Edit Item</h2><input type="text" /><textarea></textarea><button>Save</button><button>Cancel</button></div>)}{showDeleteConfirm && (<div><h2>Confirm Delete</h2><p>Are you sure?</p><button>Delete</button><button>Cancel</button></div>)}</div>`,
    why_this_matters: "Conditional rendering is essential for creating dynamic user interfaces that respond to application state, showing only relevant information at the right time.",
    answer_keywords: ["conditional rendering", "jsx", "map", "form", "dialog"],
    seed_code: `
import { useState } from 'react';

interface Item {
  id: string;
  name: string;
  description: string;
}

interface ItemFormValues {
  name: string;
  description: string;
}

export default function ItemList() {
  const [items, setItems] = useState<Item[]>([]);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div>
      <h1>Resource Manager</h1>
    </div>
  );
}
    `,
    starter_code: `
import { useState } from 'react';

interface Item {
  id: string;
  name: string;
  description: string;
}

interface ItemFormValues {
  name: string;
  description: string;
}

export default function ItemList() {
  const [items, setItems] = useState<Item[]>([]);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div>
      <h1>Resource Manager</h1>
      {/* Add the item list, edit form, and delete confirmation dialog structure here */}
    </div>
  );
}
    `,
    feedback_correct: "Excellent! This structure correctly uses conditional rendering and provides the necessary placeholders for the form and dialog elements.",
    feedback_partial: "You've got the conditional rendering, but make sure to include basic input elements within the form and clear messages within the dialog for a complete structure.",
    feedback_wrong: "While ternary operators work, the \`&&\` operator is often more concise for rendering elements conditionally. Also, ensure you map over the \`items\` array to display them.",
    expected: `
import { useState } from 'react';

interface Item {
  id: string;
  name: string;
  description: string;
}

interface ItemFormValues {
  name: string;
  description: string;
}

export default function ItemList() {
  const [items, setItems] = useState<Item[]>([]);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div>
      <h1>Resource Manager</h1>

      <h2>Items</h2>
      {items.length === 0 ? (
        <p>No items to display. Add some!</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              {item.name} - {item.description}
              <button>Edit</button>
              <button>Delete</button>
            </li>
          ))}
        </ul>
      )}

      {showEditForm && editingItem && (
        <div className="modal">
          <h2>Edit Item: {editingItem.name}</h2>
          <form>
            <label>
              Name:
              <input type="text" value={editingItem.name} />
            </label>
            <label>
              Description:
              <textarea value={editingItem.description}></textarea>
            </label>
            <button type="submit">Save Changes</button>
            <button type="button">Cancel</button>
          </form>
        </div>
      )}

      {showDeleteConfirm && deletingItem && (
        <div className="modal">
          <h2>Confirm Deletion</h2>
          <p>Are you sure you want to delete "{deletingItem.name}"?</p>
          <button>Delete Permanently</button>
          <button>Cancel</button>
        </div>
      )}
    </div>
  );
}
    `,
    analog_example: `
function NotificationPanel() {
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div>
      <h1>Notifications</h1>
      {notifications.length === 0 ? (
        <p>No new notifications.</p>
      ) : (
        <ul>
          {notifications.map((notif, index) => (
            <li key={index}>{notif}</li>
          ))}
        </ul>
      )}

      <button onClick={() => setShowSettings(!showSettings)}>Toggle Settings</button>

      {showSettings && (
        <div className="settings-panel">
          <h3>Notification Settings</h3>
          <label>
            <input type="checkbox" /> Enable sound
          </label>
          <button>Save Settings</button>
        </div>
      )}
    </div>
  );
}
    `,
    deepDiveLabel: "Conditional Rendering Patterns in JSX",
    deepDive: {
      hook: `
Imagine building a complex user interface where different parts of the screen need to appear or disappear based on user actions, data availability, or application state. For example, an "Edit" button only appears when a user has permission, or a loading spinner shows only while data is being fetched. If you simply render everything all the time, your UI becomes cluttered and confusing. The challenge is to elegantly control what's visible without resorting to complex imperative logic or deeply nested if/else statements that make your JSX unreadable. How do you tell React, "only show this section *if* this condition is true"?
      `,
      pain: `
⚠️ **Lesson:** Poorly managed conditional rendering can lead to cluttered UIs, performance issues (rendering hidden elements), and complex, hard-to-read code. Symptom: Your JSX contains many nested ternary operators or \`if\` statements outside the \`return\` block, making it difficult to visualize the UI structure, or elements appear briefly before being hidden.
      `,
      mentalModel: `
**Mental model:** "The UI Gatekeeper." Think of conditional rendering as a gatekeeper for your UI elements. Each gatekeeper (a conditional expression) decides whether a specific section of the UI is allowed to pass through and be rendered to the screen. If the condition is met, the gate opens, and the element is displayed. If not, the gate remains closed, and the element is completely omitted from the rendered output. This is more efficient than rendering an element and then hiding it with CSS.
      `,
      discover: `
**Pattern - Conditional Rendering with Logical && and Ternary Operator:**
\`\`\`tsx
function MyComponent({ isLoggedIn, userMessage }: { isLoggedIn: boolean; userMessage: string | null }) {
  return (
    <div>
      {/* Logical && for simple "show if true" */}
      {isLoggedIn && <button>Logout</button>}

      {/* Ternary operator for "show A if true, else show B" */}
      {userMessage ? (
        <p>Welcome, {userMessage}!</p>
      ) : (
        <p>Please log in.</p>
      )}

      {/* Showing a list only if it has items */}
      {isLoggedIn && userMessage && (
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      )}
    </div>
  );
}
\`\`\`
-   **Logical \`&&\` Operator:** This is the most common and concise way to conditionally render an element when you only want to show it if a condition is true, and show nothing otherwise. If the left-hand side is \`false\`, \`null\`, \`undefined\`, or \`0\`, React renders nothing.
-   **Ternary Operator (\`condition ? true_expression : false_expression\`):** Use this when you need to render one thing if a condition is true, and a *different* thing if it's false. It's ideal for "if-else" scenarios.
-   **\`map()\` for Lists:** When rendering lists, the \`map()\` method is used to transform an array of data into an array of JSX elements. Combine this with a conditional check for \`array.length\` to show a "no items" message.
-   **Fragments (\`</>\`):** If you need to return multiple elements from a conditional block without adding an extra DOM node, wrap them in a React Fragment.
      `,
      quickRules: `
**Quick rules:**
-   ✅  Use \`condition && <Element />\` for "render this if true, else render nothing."
-   ✅  Use \`condition ? <ElementA /> : <ElementB />\` for "render A if true, else render B."
-   ✅  Always include a \`key\` prop when mapping over lists of elements to help React efficiently update the DOM.
-   ✅  Consider showing a "no data" message when an array is empty, rather than just an empty space.
-   ❌  Avoid deeply nested ternary operators; they can quickly become unreadable.
-   ❌  Don't render elements and then hide them with CSS if you can conditionally render them instead (for performance).
-   ❌  Never use \`index\` as a \`key\` if the list items can be reordered, added, or removed, as this can lead to subtle bugs.
      `,
      watchOut: `
👀 **Watch out:** When using the logical \`&&\` operator, be careful with values that are "falsy" but might unintentionally render. For example, \`0 && <Element />\` will render \`0\` to the DOM, not nothing. If your condition might evaluate to \`0\`, \`null\`, or \`undefined\`, ensure it's explicitly a boolean or use a ternary operator if you need to handle specific falsy values.
      `,
      dryRun: `
🔁 **Think:** The component renders with \`items = []\`, \`showEditForm = false\`, \`showDeleteConfirm = false\`.
1.  **Item List:** \`items.length === 0\` is \`true\`. The \`<p>No items to display...</p>\` element is rendered.
2.  **Edit Form:** \`showEditForm && editingItem\` evaluates to \`false && null\`, which is \`false\`. The edit form \`div\` is NOT rendered.
3.  **Delete Dialog:** \`showDeleteConfirm && deletingItem\` evaluates to \`false && null\`, which is \`false\`. The delete dialog \`div\` is NOT rendered.
4.  **Result:** Only the heading and the "no items" message are visible.
(Hint: \`&&\` short-circuits, meaning if the first part is false, the second part is never evaluated or rendered.)
      `,
      build: "**Learning focus:** Structure the UI using conditional rendering to display the item list, edit form, and delete confirmation dialog based on state."
    },
  },
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 7",
    paal: "Implement the logic for fetching items when the component mounts and for handling the opening and closing of the edit form. You'll need the `useEffect` hook for fetching.",
    hint: "Use `useEffect` with an empty dependency array for initial data fetch. Create functions to set `editingItem` and `showEditForm`.",
    example_code: `
import { useEffect, useState } from 'react';

function DataFetcher() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('/api/data').then(res => res.json()).then(setData);
  }, []); // Empty dependency array means run once on mount
  return <div>{data ? JSON.stringify(data) : 'Loading...'}</div>;
}
    `,
    think_prompt: "How would you use `useEffect` to fetch items once, and define functions to set `editingItem` and `showEditForm` when an item is clicked, and reset them when cancelled?",
    mc_options: [
      `import { useEffect } from 'react'; // ... useEffect(() => { /* fetch logic */ }, []); const handleEditClick = (item: Item) => { setEditingItem(item); setShowEditForm(true); }; const handleCancelEdit = () => { setEditingItem(null); setShowEditForm(false); };`,
      `import { useEffect } from 'react'; // ... useEffect(() => { /* fetch logic */ }); const handleEditClick = (item: Item) => { setEditingItem(item); setShowEditForm(true); }; const handleCancelEdit = () => { setEditingItem(null); setShowEditForm(false); };`,
      `import { useEffect } from 'react'; // ... const fetchItems = async () => { /* fetch logic */ }; useEffect(() => { fetchItems(); }, []); const handleEditClick = (item: Item) => { setEditingItem(item); setShowEditForm(true); }; const handleCancelEdit = () => { setEditingItem(null); setShowEditForm(false); };`,
    ],
    mc_correct_option: `import { useEffect } from 'react'; // ... const fetchItems = async () => { /* fetch logic */ }; useEffect(() => { fetchItems(); }, []); const handleEditClick = (item: Item) => { setEditingItem(item); setShowEditForm(true); }; const handleCancelEdit = () => { setEditingItem(null); setShowEditForm(false); };`,
    mc_anchor: `import { useEffect } from 'react'; // ... const fetchItems = async () => { /* fetch logic */ }; useEffect(() => { fetchItems(); }, []); const handleEditClick = (item: Item) => { setEditingItem(item); setShowEditForm(true); }; const handleCancelEdit = () => { setEditingItem(null); setShowEditForm(false); };`,
    why_this_matters: "Data fetching is a common side effect, and `useEffect` is the standard hook for managing it. Event handlers are crucial for user interaction, enabling the UI to respond to clicks and form submissions.",
    answer_keywords: ["useeffect", "data fetching", "side effect", "event handler", "setstate"],
    seed_code: `
import { useState } from 'react';

interface Item {
  id: string;
  name: string;
  description: string;
}

interface ItemFormValues {
  name: string;
  description: string;
}

export default function ItemList() {
  const [items, setItems] = useState<Item[]>([]);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div>
      <h1>Resource Manager</h1>

      <h2>Items</h2>
      {items.length === 0 ? (
        <p>No items to display. Add some!</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              {item.name} - {item.description}
              <button>Edit</button>
              <button>Delete</button>
            </li>
          ))}
        </ul>
      )}

      {showEditForm && editingItem && (
        <div className="modal">
          <h2>Edit Item: {editingItem.name}</h2>
          <form>
            <label>
              Name:
              <input type="text" value={editingItem.name} />
            </label>
            <label>
              Description:
              <textarea value={editingItem.description}></textarea>
            </label>
            <button type="submit">Save Changes</button>
            <button type="button">Cancel</button>
          </form>
        </div>
      )}

      {showDeleteConfirm && deletingItem && (
        <div className="modal">
          <h2>Confirm Deletion</h2>
          <p>Are you sure you want to delete "{deletingItem.name}"?</p>
          <button>Delete Permanently</button>
          <button>Cancel</button>
        </div>
      )}
    </div>
  );
}
    `,
    starter_code: `
import { useState, useEffect } from 'react'; // Don't forget useEffect!

interface Item {
  id: string;
  name: string;
  description: string;
}

interface ItemFormValues {
  name: string;
  description: string;
}

export default function ItemList() {
  const [items, setItems] = useState<Item[]>([]);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Add data fetching logic here using useEffect
  // Add handlers for opening/closing edit form here

  return (
    <div>
      <h1>Resource Manager</h1>

      <h2>Items</h2>
      {items.length === 0 ? (
        <p>No items to display. Add some!</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              {item.name} - {item.description}
              <button>Edit</button>
              <button>Delete</button>
            </li>
          ))}
        </ul>
      )}

      {showEditForm && editingItem && (
        <div className="modal">
          <h2>Edit Item: {editingItem.name}</h2>
          <form>
            <label>
              Name:
              <input type="text" value={editingItem.name} />
            </label>
            <label>
              Description:
              <textarea value={editingItem.description}></textarea>
            </label>
            <button type="submit">Save Changes</button>
            <button type="button">Cancel</button>
          </form>
        </div>
      )}

      {showDeleteConfirm && deletingItem && (
        <div className="modal">
          <h2>Confirm Deletion</h2>
          <p>Are you sure you want to delete "{deletingItem.name}"?</p>
          <button>Delete Permanently</button>
          <button>Cancel</button>
        </div>
      )}
    </div>
  );
}
    `,
    feedback_correct: "Perfect! You've correctly implemented the \`useEffect\` for a one-time fetch and robust handlers for managing the edit form's visibility and data.",
    feedback_partial: "You've got the \`useEffect\` and handlers, but ensure the \`useEffect\` has an empty dependency array to run only once. Also, confirm the types for \`handleEditClick\`'s \`item\` parameter.",
    feedback_wrong: "For initial data fetching, \`useEffect\` needs an empty dependency array \`[]\`. Without it, the effect will run on every render, potentially causing infinite loops. Also, ensure your handlers correctly update the state variables.",
    expected: `
import { useState, useEffect } from 'react';

interface Item {
  id: string;
  name: string;
  description: string;
}

interface ItemFormValues {
  name: string;
  description: string;
}

export default function ItemList() {
  const [items, setItems] = useState<Item[]>([]);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Simulate API calls
  const fetchItems = async () => {
    console.log("Fetching items...");
    // In a real app, this would be an actual API call
    const data: Item[] = await new Promise((resolve) =>
      setTimeout(() => {
        resolve([
          { id: "1", name: "Widget A", description: "A versatile tool." },
          { id: "2", name: "Gadget B", description: "A handy device." },
          { id: "3", name: "Doodad C", description: "A curious contraption." },
        ]);
      }, 500)
    );
    setItems(data);
  };

  useEffect(() => {
    fetchItems();
  }, []); // Empty dependency array means run once on mount

  const handleEditClick = (item: Item) => {
    setEditingItem(item);
    setShowEditForm(true);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setShowEditForm(false);
  };

  return (
    <div>
      <h1>Resource Manager</h1>

      <h2>Items</h2>
      {items.length === 0 ? (
        <p>No items to display. Add some!</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              {item.name} - {item.description}
              <button>Edit</button>
              <button>Delete</button>
            </li>
          ))}
        </ul>
      )}

      {showEditForm && editingItem && (
        <div className="modal">
          <h2>Edit Item: {editingItem.name}</h2>
          <form>
            <label>
              Name:
              <input type="text" value={editingItem.name} />
            </label>
            <label>
              Description:
              <textarea value={editingItem.description}></textarea>
            </label>
            <button type="submit">Save Changes</button>
            <button type="button">Cancel</button>
          </form>
        </div>
      )}

      {showDeleteConfirm && deletingItem && (
        <div className="modal">
          <h2>Confirm Deletion</h2>
          <p>Are you sure you want to delete "{deletingItem.name}"?</p>
          <button>Delete Permanently</button>
          <button>Cancel</button>
        </div>
      )}
    </div>
  );
}
    `,
    analog_example: `
import { useState, useEffect } from 'react';

function LogViewer() {
  interface LogEntry { id: string; message: string; timestamp: string; }
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [showLogDetails, setShowLogDetails] = useState(false);

  const fetchLogs = async () => {
    const data: LogEntry[] = await new Promise((resolve) =>
      setTimeout(() => {
        resolve([
          { id: "a1", message: "User login successful.", timestamp: "2023-01-01T10:00:00Z" },
          { id: "b2", message: "Database query failed.", timestamp: "2023-01-01T10:05:15Z" },
        ]);
      }, 300)
    );
    setLogs(data);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleViewDetails = (log: LogEntry) => {
    setSelectedLog(log);
    setShowLogDetails(true);
  };

  const handleCloseDetails = () => {
    setSelectedLog(null);
    setShowLogDetails(false);
  };

  return (
    <div>
      {/* ... JSX structure ... */}
    </div>
  );
}
    `,
    deepDiveLabel: "Managing Side Effects with `useEffect`",
    deepDive: {
      hook: `
In a React component, you often need to perform actions that don't directly involve rendering JSX, such as fetching data from an API, setting up subscriptions, or manually manipulating the DOM. These are known as "side effects." If you just put these operations directly inside your component's body, they'd run on every render, potentially causing performance issues, infinite loops, or incorrect behavior. How do you tell React to perform these actions only at specific times, like when the component first appears, or when certain data changes? This is where the \`useEffect\` hook comes in, but understanding its dependency array is crucial to avoid common pitfalls.
      `,
      pain: `
⚠️ **Lesson:** Incorrectly using \`useEffect\` can lead to performance problems (unnecessary re-runs), bugs (stale closures, infinite loops), and memory leaks (uncleaned subscriptions). Symptom: Your component fetches data repeatedly, or a timer continues to run even after the component has unmounted, causing errors.
      `,
      mentalModel: `
**Mental model:** "The Component's Lifecycle Manager." Think of \`useEffect\` as a specialized manager that oversees operations tied to your component's lifecycle. It has a 'to-do list' (the effect function) and a 'watch list' (the dependency array). The manager only performs tasks on its to-do list when something on its watch list changes. If the watch list is empty, it performs the task once when it first starts (mounts) and then never again (unless it's cleaning up).
      `,
      discover: `
**Pattern - \`useEffect\` for Data Fetching and Cleanup:**
\`\`\`tsx
import { useEffect, useState } from 'react';

function DataDisplay() {
  const [data, setData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component
    const fetchData = async () => {
      try {
        const response = await fetch('/api/some-data');
        if (!response.ok) {
          throw new Error(\`HTTP error! status: \${response.status}\`);
        }
        const result = await response.json();
        if (isMounted) { // Only update if component is still mounted
          setData(result.message);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function: runs when component unmounts or before effect re-runs
    return () => {
      isMounted = false; // Set flag to false
      console.log("Cleanup for DataDisplay effect.");
    };
  }, []); // Empty dependency array: runs once on mount, cleans up on unmount

  if (isLoading) return <p>Loading data...</p>;
  if (error) return <p>Error: {error}</p>;
  return <p>Data: {data}</p>;
}
\`\`\`
-   **Effect Function:** The first argument to \`useEffect\` is a function that contains the side effect logic. This function can optionally return a cleanup function.
-   **Dependency Array:** The second argument is an array of values that the effect depends on. The effect will re-run only if any of these values change between renders.
-   **Empty Array (\`[]\`):** If the dependency array is empty, the effect runs once after the initial render and its cleanup function runs once when the component unmounts. This is ideal for initial data fetching.
-   **No Array (omitted):** If the dependency array is omitted, the effect runs after *every* render, which is rarely what you want for side effects like data fetching.
-   **Cleanup Function:** The function returned by the effect runs before the component unmounts, or before the effect re-runs (if dependencies change). This is crucial for preventing memory leaks (e.g., clearing timers, unsubscribing from events).
      `,
      quickRules: `
**Quick rules:**
-   ✅  Use \`useEffect\` for any operation that is a "side effect" (e.g., data fetching, subscriptions, manual DOM manipulation).
-   ✅  Always specify a dependency array for \`useEffect\` to control when it re-runs.
-   ✅  Use an empty dependency array (\`[]\`) for effects that should run only once on mount and clean up on unmount.
-   ✅  Return a cleanup function from \`useEffect\` for any effect that allocates resources (e.g., timers, event listeners, subscriptions).
-   ❌  Never omit the dependency array unless you explicitly want the effect to run after *every* render.
-   ❌  Don't put state updates directly in the effect without careful dependency management, as it can lead to infinite loops.
-   ❌  Avoid complex logic directly inside the effect; extract functions for clarity and testability.
      `,
      watchOut: `
👀 **Watch out:** If you include an object or function in your dependency array that is re-created on every render (e.g., an inline object literal or a function not wrapped in \`useCallback\`), your \`useEffect\` will run unnecessarily often. For functions, wrap them in \`useCallback\` if they are dependencies and you want to prevent unnecessary re-runs. For objects, ensure they are stable or use a deep comparison if necessary (though this is less common).
      `,
      dryRun: `
🔁 **Think:** The \`ItemList\` component is mounted.
1.  **Initial Render:** The component renders its initial JSX.
2.  **\`useEffect\` runs:** Because the dependency array is \`[]\`, the effect function runs once after the initial render.
3.  **\`fetchItems\` called:** Inside the effect, \`fetchItems()\` is invoked. It simulates an API call, eventually resolving with \`[Item1, Item2, Item3]\`.
4.  **\`setItems\` called:** \`setItems\` updates the \`items\` state with the fetched data.
5.  **Re-render:** The component re-renders because \`items\` state has changed. Now, \`items.length\` is \`3\`, so the \`<ul>\` with the items is displayed instead of the "No items" message.
(Hint: The empty dependency array ensures the fetch happens only once, not on subsequent re-renders.)
      `,
      build: "**Learning focus:** Implement initial data fetching using `useEffect` and create handlers for opening and closing the edit form."
    },
  },
  {
    id: "step6",
    type: "question",
    phase: "Step 6 of 7",
    paal: "Now, implement the logic for updating an item via the edit form and for handling the opening and confirmation of the delete dialog. This includes simulating API calls for update and delete.",
    hint: "For the update, you'll need to prevent default form submission, make a simulated API call, and update the `items` state. For delete, set `deletingItem` and `showDeleteConfirm`, then make a simulated API call and filter the `items` state.",
    example_code: `
const handleSubmit = async (event: React.FormEvent) => {
  event.preventDefault();
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 300));
  console.log("Form submitted!");
};

const handleDelete = (id: string) => {
  // Simulate API call
  console.log(\`Deleting item \${id}\`);
};
    `,
    think_prompt: "What functions are needed to handle form submission for updating an item (including updating local state) and to manage the delete confirmation flow (setting `deletingItem`, showing dialog, then confirming deletion and updating local state)?",
    mc_options: [
      `const handleUpdateItem = async (event: React.FormEvent) => { event.preventDefault(); /* update logic */ }; const handleDeleteClick = (item: Item) => { setDeletingItem(item); setShowDeleteConfirm(true); }; const handleConfirmDelete = async () => { /* delete logic */ }; const handleCancelDelete = () => { setDeletingItem(null); setShowDeleteConfirm(false); };`,
      `const handleUpdateItem = (event: React.FormEvent) => { /* update logic */ }; const handleDeleteClick = (item: Item) => { setDeletingItem(item); setShowDeleteConfirm(true); }; const handleConfirmDelete = () => { /* delete logic */ }; const handleCancelDelete = () => { setDeletingItem(null); setShowDeleteConfirm(false); };`,
      `const handleUpdateItem = async (event: React.FormEvent) => { event.preventDefault(); /* update logic */ }; const handleDeleteClick = (item: Item) => { setDeletingItem(item); setShowDeleteConfirm(true); }; const handleConfirmDelete = async () => { /* delete logic */ };`,
    ],
    mc_correct_option: `const handleUpdateItem = async (event: React.FormEvent) => { event.preventDefault(); /* update logic */ }; const handleDeleteClick = (item: Item) => { setDeletingItem(item); setShowDeleteConfirm(true); }; const handleConfirmDelete = async () => { /* delete logic */ }; const handleCancelDelete = () => { setDeletingItem(null); setShowDeleteConfirm(false); };`,
    mc_anchor: `const handleUpdateItem = async (event: React.FormEvent) => { event.preventDefault(); /* update logic */ }; const handleDeleteClick = (item: Item) => { setDeletingItem(item); setShowDeleteConfirm(true); }; const handleConfirmDelete = async () => { /* delete logic */ }; const handleCancelDelete = () => { setDeletingItem(null); setShowDeleteConfirm(false); };`,
    why_this_matters: "Implementing update and delete operations, including confirmation steps, is critical for data integrity and providing a safe, predictable user experience.",
    answer_keywords: ["form submission", "api call", "update state", "delete confirmation", "event.preventdefault"],
    seed_code: `
import { useState, useEffect } from 'react';

interface Item {
  id: string;
  name: string;
  description: string;
}

interface ItemFormValues {
  name: string;
  description: string;
}

export default function ItemList() {
  const [items, setItems] = useState<Item[]>([]);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Simulate API calls
  const fetchItems = async () => {
    console.log("Fetching items...");
    // In a real app, this would be an actual API call
    const data: Item[] = await new Promise((resolve) =>
      setTimeout(() => {
        resolve([
          { id: "1", name: "Widget A", description: "A versatile tool." },
          { id: "2", name: "Gadget B", description: "A handy device." },
          { id: "3", name: "Doodad C", description: "A curious contraption." },
        ]);
      }, 500)
    );
    setItems(data);
  };

  useEffect(() => {
    fetchItems();
  }, []); // Empty dependency array means run once on mount

  const handleEditClick = (item: Item) => {
    setEditingItem(item);
    setShowEditForm(true);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setShowEditForm(false);
  };

  return (
    <div>
      <h1>Resource Manager</h1>

      <h2>Items</h2>
      {items.length === 0 ? (
        <p>No items to display. Add some!</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              {item.name} - {item.description}
              <button>Edit</button>
              <button>Delete</button>
            </li>
          ))}
        </ul>
      )}

      {showEditForm && editingItem && (
        <div className="modal">
          <h2>Edit Item: {editingItem.name}</h2>
          <form>
            <label>
              Name:
              <input type="text" value={editingItem.name} />
            </label>
            <label>
              Description:
              <textarea value={editingItem.description}></textarea>
            </label>
            <button type="submit">Save Changes</button>
            <button type="button">Cancel</button>
          </form>
        </div>
      )}

      {showDeleteConfirm && deletingItem && (
        <div className="modal">
          <h2>Confirm Deletion</h2>
          <p>Are you sure you want to delete "{deletingItem.name}"?</p>
          <button>Delete Permanently</button>
          <button>Cancel</button>
        </div>
      )}
    </div>
  );
}
    `,
    starter_code: `
import { useState, useEffect } from 'react';

interface Item {
  id: string;
  name: string;
  description: string;
}

interface ItemFormValues {
  name: string;
  description: string;
}

export default function ItemList() {
  const [items, setItems] = useState<Item[]>([]);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Simulate API calls
  const fetchItems = async () => {
    console.log("Fetching items...");
    // In a real app, this would be an actual API call
    const data: Item[] = await new Promise((resolve) =>
      setTimeout(() => {
        resolve([
          { id: "1", name: "Widget A", description: "A versatile tool." },
          { id: "2", name: "Gadget B", description: "A handy device." },
          { id: "3", name: "Doodad C", description: "A curious contraption." },
        ]);
      }, 500)
    );
    setItems(data);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleEditClick = (item: Item) => {
    setEditingItem(item);
    setShowEditForm(true);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setShowEditForm(false);
  };

  // Add handlers for updating an item and managing delete confirmation here

  return (
    <div>
      <h1>Resource Manager</h1>

      <h2>Items</h2>
      {items.length === 0 ? (
        <p>No items to display. Add some!</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              {item.name} - {item.description}
              <button>Edit</button>
              <button>Delete</button>
            </li>
          ))}
        </ul>
      )}

      {showEditForm && editingItem && (
        <div className="modal">
          <h2>Edit Item: {editingItem.name}</h2>
          <form>
            <label>
              Name:
              <input type="text" value={editingItem.name} />
            </label>
            <label>
              Description:
              <textarea value={editingItem.description}></textarea>
            </label>
            <button type="submit">Save Changes</button>
            <button type="button">Cancel</button>
          </form>
        </div>
      )}

      {showDeleteConfirm && deletingItem && (
        <div className="modal">
          <h2>Confirm Deletion</h2>
          <p>Are you sure you want to delete "{deletingItem.name}"?</p>
          <button>Delete Permanently</button>
          <button>Cancel</button>
        </div>
      )}
    </div>
  );
}
    `,
    feedback_correct: "Fantastic! You've implemented the core logic for both updating and deleting items, including the crucial confirmation step for deletion.",
    feedback_partial: "You've got the handlers, but ensure the \`handleUpdateItem\` prevents default form submission and correctly updates the \`items\` array in state. For deletion, make sure \`handleConfirmDelete\` filters the \`items\` array.",
    feedback_wrong: "Remember to use \`event.preventDefault()\` for form submissions to prevent a full page reload. Also, ensure your update and delete logic correctly modifies the \`items\` state to reflect changes.",
    expected: `
import { useState, useEffect } from 'react';

interface Item {
  id: string;
  name: string;
  description: string;
}

interface ItemFormValues {
  name: string;
  description: string;
}

export default function ItemList() {
  const [items, setItems] = useState<Item[]>([]);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Simulate API calls
  const fetchItems = async () => {
    console.log("Fetching items...");
    // In a real app, this would be an actual API call
    const data: Item[] = await new Promise((resolve) =>
      setTimeout(() => {
        resolve([
          { id: "1", name: "Widget A", description: "A versatile tool." },
          { id: "2", name: "Gadget B", description: "A handy device." },
          { id: "3", name: "Doodad C", description: "A curious contraption." },
        ]);
      }, 500)
    );
    setItems(data);
  };

  const updateItemApi = async (updatedItem: Item) => {
    console.log(\`Updating item \${updatedItem.id}...\`, updatedItem);
    await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API latency
    return updatedItem; // Simulate successful update
  };

  const deleteItemApi = async (itemId: string) => {
    console.log(\`Deleting item \${itemId}...\`);
    await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API latency
    return { success: true }; // Simulate successful deletion
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleEditClick = (item: Item) => {
    setEditingItem(item);
    setShowEditForm(true);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setShowEditForm(false);
  };

  const handleUpdateItem = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingItem) return;

    // In a real app, form values would be extracted from event.target
    // For this example, we'll just simulate a change to the description
    const updatedItem: Item = {
      ...editingItem,
      description: \`\${editingItem.description} (updated)\`, // Simulate a change
    };

    try {
      const result = await updateItemApi(updatedItem);
      setItems((prevItems) =>
        prevItems.map((item) => (item.id === result.id ? result : item))
      );
      handleCancelEdit(); // Close form on success
    } catch (error) {
      console.error("Failed to update item:", error);
      // Handle error, e.g., show a toast notification
    }
  };

  const handleDeleteClick = (item: Item) => {
    setDeletingItem(item);
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setDeletingItem(null);
    setShowDeleteConfirm(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    try {
      await deleteItemApi(deletingItem.id);
      setItems((prevItems) =>
        prevItems.filter((item) => item.id !== deletingItem.id)
      );
      handleCancelDelete(); // Close dialog on success
    } catch (error) {
      console.error("Failed to delete item:", error);
      // Handle error
    }
  };

  return (
    <div>
      <h1>Resource Manager</h1>

      <h2>Items</h2>
      {items.length === 0 ? (
        <p>No items to display. Add some!</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              {item.name} - {item.description}
              <button>Edit</button>
              <button>Delete</button>
            </li>
          ))}
        </ul>
      )}

      {showEditForm && editingItem && (
        <div className="modal">
          <h2>Edit Item: {editingItem.name}</h2>
          <form>
            <label>
              Name:
              <input type="text" value={editingItem.name} />
            </label>
            <label>
              Description:
              <textarea value={editingItem.description}></textarea>
            </label>
            <button type="submit">Save Changes</button>
            <button type="button">Cancel</button>
          </form>
        </div>
      )}

      {showDeleteConfirm && deletingItem && (
        <div className="modal">
          <h2>Confirm Deletion</h2>
          <p>Are you sure you want to delete "{deletingItem.name}"?</p>
          <button>Delete Permanently</button>
          <button>Cancel</button>
        </div>
      )}
    </div>
  );
}
    `,
    analog_example: `
import { useState } from 'react';

function CommentModerator() {
  interface Comment { id: string; text: string; author: string; }
  const [comments, setComments] = useState<Comment[]>([
    { id: "c1", text: "Great post!", author: "Alice" },
    { id: "c2", text: "I disagree.", author: "Bob" },
  ]);
  const [commentToApprove, setCommentToApprove] = useState<Comment | null>(null);
  const [showApprovalConfirm, setShowApprovalConfirm] = useState(false);

  const approveCommentApi = async (commentId: string) => {
    console.log(\`Approving comment \${commentId}...\`);
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { success: true };
  };

  const handleApproveClick = (comment: Comment) => {
    setCommentToApprove(comment);
    setShowApprovalConfirm(true);
  };

  const handleCancelApproval = () => {
    setCommentToApprove(null);
    setShowApprovalConfirm(false);
  };

  const handleConfirmApproval = async () => {
    if (!commentToApprove) return;
    try {
      await approveCommentApi(commentToApprove.id);
      setComments((prevComments) =>
        prevComments.filter((c) => c.id !== commentToApprove.id)
      ); // Remove from 'pending' list
      handleCancelApproval();
    } catch (error) {
      console.error("Approval failed:", error);
    }
  };

  return (
    <div>
      <h1>Pending Comments</h1>
      <ul>
        {comments.map((comment) => (
          <li key={comment.id}>
            "{comment.text}" by {comment.author}
            <button onClick={() => handleApproveClick(comment)}>Approve</button>
          </li>
        ))}
      </ul>

      {showApprovalConfirm && commentToApprove && (
        <div className="modal">
          <p>Approve comment by {commentToApprove.author}: "{commentToApprove.text}"?</p>
          <button onClick={handleConfirmApproval}>Confirm Approval</button>
          <button onClick={handleCancelApproval}>Cancel</button>
        </div>
      )}
    </div>
  );
}
    `,
    deepDiveLabel: "Handling Form Submissions and State Updates",
    deepDive: {
      hook: `
When a user interacts with a form, whether it's to update their profile, add a new item, or filter a list, that interaction needs to be captured, processed, and often sent to a backend API. The challenge isn't just sending the data, but also managing the UI state during this process: showing loading indicators, handling errors, and updating the displayed data once the operation is complete. Without a clear pattern, form submissions can lead to full page reloads (bad UX), inconsistent data, or confusing error messages. How do you gracefully manage this entire flow from user input to UI update?
      `,
      pain: `
⚠️ **Lesson:** Improper form handling can lead to poor user experience (page reloads, no feedback), data inconsistencies (UI not reflecting backend changes), and difficult-to-debug issues. Symptom: Users lose their form input on submission, the UI doesn't update after a successful API call, or error messages are not displayed when an API call fails.
      `,
      mentalModel: `
**Mental model:** "The Data Synchronizer." Think of your component as a data synchronizer. When a form is submitted, it takes the user's input, packages it up, and sends it to the "master data source" (your API). Once the master data source confirms the change, the synchronizer then updates its local copy (component state) to reflect the new reality. For deletions, it's a similar process: confirm with the user, tell the master data source to remove, then remove from the local copy.
      `,
      discover: `
**Pattern - Asynchronous Form Submission and State Update:**
\`\`\`tsx
import { useState } from 'react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

function ProfileEditor({ user }: { user: UserProfile }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value);
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default browser form submission
    setIsSaving(true);
    setError(null);

    const updatedProfile = { ...user, name, email };

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log("Profile updated:", updatedProfile);
      // In a real app, you'd update global state or re-fetch data
      alert("Profile saved successfully!");
    } catch (err: any) {
      setError("Failed to save profile: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name:
        <input type="text" value={name} onChange={handleNameChange} />
      </label>
      <label>
        Email:
        <input type="email" value={email} onChange={handleEmailChange} />
      </label>
      <button type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save Profile"}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
\`\`\`
-   **\`event.preventDefault()\`:** Always call this inside your form's \`onSubmit\` handler to stop the browser from performing its default form submission behavior (which typically causes a full page reload).
-   **Controlled Components:** For form inputs, use \`value\` and \`onChange\` props to bind the input's value to state, making it a "controlled component." This gives React full control over the input's state.
-   **Asynchronous Operations:** Form submissions and deletions often involve API calls, which are asynchronous. Use \`async/await\` to manage these operations cleanly.
-   **Optimistic vs. Pessimistic Updates:** For updates, you can either update the UI immediately (optimistic) and revert on error, or wait for the API response (pessimistic) before updating. The example uses a pessimistic approach. For deletions, it's often pessimistic with a confirmation step.
      `,
      quickRules: `
**Quick rules:**
-   ✅  Always call \`event.preventDefault()\` in \`onSubmit\` handlers.
-   ✅  Use \`async/await\` for API calls within handlers to manage asynchronous flow.
-   ✅  Update component state (e.g., \`items\` array) after a successful API response to reflect changes in the UI.
-   ✅  Implement confirmation dialogs for destructive actions like deletion.
-   ❌  Never rely on the browser's default form submission behavior for dynamic React apps.
-   ❌  Don't forget to handle loading states and errors for a robust user experience.
-   ❌  Avoid directly mutating state arrays; instead, use array methods like \`map\` (for update) or \`filter\` (for delete) to create new arrays.
      `,
      watchOut: `
👀 **Watch out:** When updating an array in state, always create a *new* array rather than mutating the existing one. For example, use \`setItems(prevItems => prevItems.map(...))\` or \`setItems(prevItems => prevItems.filter(...))\` instead of directly modifying \`items\` and then calling \`setItems(items)\`. React relies on shallow comparison of state objects/arrays to detect changes, and mutating the original array won't trigger a re-render.
      `,
      dryRun: `
🔁 **Think:** A user clicks "Delete" on "Widget A" (id: "1").
1.  **\`handleDeleteClick\` called:** \`deletingItem\` is set to \`Widget A\`, \`showDeleteConfirm\` is set to \`true\`.
2.  **UI re-renders:** The delete confirmation modal becomes visible, displaying "Are you sure you want to delete 'Widget A'?"
3.  **User clicks "Delete Permanently":** \`handleConfirmDelete\` is called.
4.  **API call:** \`deleteItemApi("1")\` is called, simulating a successful deletion.
5.  **\`setItems\` called:** \`setItems\` receives a function \`(prevItems) => prevItems.filter((item) => item.id !== "1")\`. The \`items\` array is updated from \`[Widget A, Gadget B, Doodad C]\` to \`[Gadget B, Doodad C]\`.
6.  **\`handleCancelDelete\` called:** \`deletingItem\` is set to \`null\`, \`showDeleteConfirm\` is set to \`false\`.
7.  **UI re-renders:** The delete confirmation modal disappears, and "Widget A" is no longer in the list.
(Hint: State updates are batched, leading to a single re-render after the deletion is confirmed and the dialog is closed.)
      `,
      build: "**Learning focus:** Implement handlers for updating an item via a form and for managing the delete confirmation flow, including state updates and simulated API calls."
    },
  },
  {
    id: "step7",
    type: "question",
    phase: "Step 7 of 7",
    paal: "Finally, wire up all the event handlers to their respective JSX elements. This includes `onClick` for edit/delete buttons, `onSubmit` for the edit form, and `onChange` for form inputs (though for this example, we'll keep inputs read-only for simplicity).",
    hint: "Connect `handleEditClick` to edit buttons, `handleDeleteClick` to delete buttons, `handleUpdateItem` to the form's `onSubmit`, and `handleCancelEdit`/`handleCancelDelete`/`handleConfirmDelete` to their respective buttons.",
    example_code: `
<button onClick={() => handleClick(id)}>Click Me</button>
<form onSubmit={handleSubmit}>...</form>
    `,
    think_prompt: "How do you connect the `handleEditClick`, `handleDeleteClick`, `handleUpdateItem`, `handleCancelEdit`, `handleCancelDelete`, and `handleConfirmDelete` functions to the correct JSX elements?",
    mc_options: [
      `// ... <button onClick={() => handleEditClick(item)}>Edit</button> // ... <form onSubmit={handleUpdateItem}> // ... <button onClick={handleCancelEdit}>Cancel</button> // ... <button onClick={() => handleDeleteClick(item)}>Delete</button> // ... <button onClick={handleConfirmDelete}>Delete Permanently</button> // ... <button onClick={handleCancelDelete}>Cancel</button>`,
      `// ... <button onClick={handleEditClick(item)}>Edit</button> // ... <form onSubmit={handleUpdateItem()}> // ... <button onClick={handleCancelEdit()}>Cancel</button> // ... <button onClick={handleDeleteClick(item)}>Delete</button> // ... <button onClick={handleConfirmDelete()}>Delete Permanently</button> // ... <button onClick={handleCancelDelete()}>Cancel</button>`,
      `// ... <button onClick={handleEditClick}>Edit</button> // ... <form onSubmit={handleUpdateItem}> // ... <button onClick={handleCancelEdit}>Cancel</button> // ... <button onClick={handleDeleteClick}>Delete</button> // ... <button onClick={handleConfirmDelete}>Delete Permanently</button> // ... <button onClick={handleCancelDelete}>Cancel</button>`,
    ],
    mc_correct_option: `// ... <button onClick={() => handleEditClick(item)}>Edit</button> // ... <form onSubmit={handleUpdateItem}> // ... <button onClick={handleCancelEdit}>Cancel</button> // ... <button onClick={() => handleDeleteClick(item)}>Delete</button> // ... <button onClick={handleConfirmDelete}>Delete Permanently</button> // ... <button onClick={handleCancelDelete}>Cancel</button>`,
    mc_anchor: `// ... <button onClick={() => handleEditClick(item)}>Edit</button> // ... <form onSubmit={handleUpdateItem}> // ... <button onClick={handleCancelEdit}>Cancel</button> // ... <button onClick={() => handleDeleteClick(item)}>Delete</button> // ... <button onClick={handleConfirmDelete}>Delete Permanently</button> // ... <button onClick={handleCancelDelete}>Cancel</button>`,
    why_this_matters: "Wiring event handlers correctly is the final step to making a UI interactive, allowing user actions to trigger state changes and application logic.",
    answer_keywords: ["onclick", "onsubmit", "event handler", "jsx props", "arrow function"],
    seed_code: `
import { useState, useEffect } from 'react';

interface Item {
  id: string;
  name: string;
  description: string;
}

interface ItemFormValues {
  name: string;
  description: string;
}

export default function ItemList() {
  const [items, setItems] = useState<Item[]>([]);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Simulate API calls
  const fetchItems = async () => {
    console.log("Fetching items...");
    // In a real app, this would be an actual API call
    const data: Item[] = await new Promise((resolve) =>
      setTimeout(() => {
        resolve([
          { id: "1", name: "Widget A", description: "A versatile tool." },
          { id: "2", name: "Gadget B", description: "A handy device." },
          { id: "3", name: "Doodad C", description: "A curious contraption." },
        ]);
      }, 500)
    );
    setItems(data);
  };

  const updateItemApi = async (updatedItem: Item) => {
    console.log(\`Updating item \${updatedItem.id}...\`, updatedItem);
    await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API latency
    return updatedItem; // Simulate successful update
  };

  const deleteItemApi = async (itemId: string) => {
    console.log(\`Deleting item \${itemId}...\`);
    await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API latency
    return { success: true }; // Simulate successful deletion
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleEditClick = (item: Item) => {
    setEditingItem(item);
    setShowEditForm(true);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setShowEditForm(false);
  };

  const handleUpdateItem = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingItem) return;

    // In a real app, form values would be extracted from event.target
    // For this example, we'll just simulate a change to the description
    const updatedItem: Item = {
      ...editingItem,
      description: \`\${editingItem.description} (updated)\`, // Simulate a change
    };

    try {
      const result = await updateItemApi(updatedItem);
      setItems((prevItems) =>
        prevItems.map((item) => (item.id === result.id ? result : item))
      );
      handleCancelEdit(); // Close form on success
    } catch (error) {
      console.error("Failed to update item:", error);
      // Handle error, e.g., show a toast notification
    }
  };

  const handleDeleteClick = (item: Item) => {
    setDeletingItem(item);
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setDeletingItem(null);
    setShowDeleteConfirm(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    try {
      await deleteItemApi(deletingItem.id);
      setItems((prevItems) =>
        prevItems.filter((item) => item.id !== deletingItem.id)
      );
      handleCancelDelete(); // Close dialog on success
    } catch (error) {
      console.error("Failed to delete item:", error);
      // Handle error
    }
  };

  return (
    <div>
      <h1>Resource Manager</h1>

      <h2>Items</h2>
      {items.length === 0 ? (
        <p>No items to display. Add some!</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              {item.name} - {item.description}
              <button>Edit</button>
              <button>Delete</button>
            </li>
          ))}
        </ul>
      )}

      {showEditForm && editingItem && (
        <div className="modal">
          <h2>Edit Item: {editingItem.name}</h2>
          <form>
            <label>
              Name:
              <input type="text" value={editingItem.name} />
            </label>
            <label>
              Description:
              <textarea value={editingItem.description}></textarea>
            </label>
            <button type="submit">Save Changes</button>
            <button type="button">Cancel</button>
          </form>
        </div>
      )}

      {showDeleteConfirm && deletingItem && (
        <div className="modal">
          <h2>Confirm Deletion</h2>
          <p>Are you sure you want to delete "{deletingItem.name}"?</p>
          <button>Delete Permanently</button>
          <button>Cancel</button>
        </div>
      )}
    </div>
  );
}
    `,
    starter_code: `
import { useState, useEffect } from 'react';

interface Item {
  id: string;
  name: string;
  description: string;
}

interface ItemFormValues {
  name: string;
  description: string;
}

export default function ItemList() {
  const [items, setItems] = useState<Item[]>([]);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Simulate API calls
  const fetchItems = async () => {
    console.log("Fetching items...");
    // In a real app, this would be an actual API call
    const data: Item[] = await new Promise((resolve) =>
      setTimeout(() => {
        resolve([
          { id: "1", name: "Widget A", description: "A versatile tool." },
          { id: "2", name: "Gadget B", description: "A handy device." },
          { id: "3", name: "Doodad C", description: "A curious contraption." },
        ]);
      }, 500)
    );
    setItems(data);
  };

  const updateItemApi = async (updatedItem: Item) => {
    console.log(\`Updating item \${updatedItem.id}...\`, updatedItem);
    await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API latency
    return updatedItem; // Simulate successful update
  };

  const deleteItemApi = async (itemId: string) => {
    console.log(\`Deleting item \${itemId}...\`);
    await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API latency
    return { success: true }; // Simulate successful deletion
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleEditClick = (item: Item) => {
    setEditingItem(item);
    setShowEditForm(true);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setShowEditForm(false);
  };

  const handleUpdateItem = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingItem) return;

    // In a real app, form values would be extracted from event.target
    // For this example, we'll just simulate a change to the description
    const updatedItem: Item = {
      ...editingItem,
      description: \`\${editingItem.description} (updated)\`, // Simulate a change
    };

    try {
      const result = await updateItemApi(updatedItem);
      setItems((prevItems) =>
        prevItems.map((item) => (item.id === result.id ? result : item))
      );
      handleCancelEdit(); // Close form on success
    } catch (error) {
      console.error("Failed to update item:", error);
      // Handle error, e.g., show a toast notification
    }
  };

  const handleDeleteClick = (item: Item) => {
    setDeletingItem(item);
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setDeletingItem(null);
    setShowDeleteConfirm(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    try {
      await deleteItemApi(deletingItem.id);
      setItems((prevItems) =>
        prevItems.filter((item) => item.id !== deletingItem.id)
      );
      handleCancelDelete(); // Close dialog on success
    } catch (error) {
      console.error("Failed to delete item:", error);
      // Handle error
    }
  };

  return (
    <div>
      <h1>Resource Manager</h1>

      <h2>Items</h2>
      {items.length === 0 ? (
        <p>No items to display. Add some!</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              {item.name} - {item.description}
              {/* Wire up Edit button */}
              <button>Edit</button>
              {/* Wire up Delete button */}
              <button>Delete</button>
            </li>
          ))}
        </ul>
      )}

      {showEditForm && editingItem && (
        <div className="modal">
          <h2>Edit Item: {editingItem.name}</h2>
          {/* Wire up form submission */}
          <form>
            <label>
              Name:
              {/* For simplicity, inputs are read-only in this example */}
              <input type="text" value={editingItem.name} readOnly />
            </label>
            <label>
              Description:
              <textarea value={editingItem.description} readOnly></textarea>
            </label>
            <button type="submit">Save Changes</button>
            {/* Wire up Cancel button */}
            <button type="button">Cancel</button>
          </form>
        </div>
      )}

      {showDeleteConfirm && deletingItem && (
        <div className="modal">
          <h2>Confirm Deletion</h2>
          <p>Are you sure you want to delete "{deletingItem.name}"?</p>
          {/* Wire up Delete Permanently button */}
          <button>Delete Permanently</button>
          {/* Wire up Cancel button */}
          <button>Cancel</button>
        </div>
      )}
    </div>
  );
}
    `,
    feedback_correct: "All handlers are correctly wired! Your component is now fully interactive, allowing users to edit and delete resources with proper confirmation.",
    feedback_partial: "You've wired most handlers, but double-check that functions requiring an \`item\` argument are passed using an arrow function (e.g., \`onClick={() => handler(item)}\`) to prevent immediate invocation.",
    feedback_wrong: "Ensure that functions passed to \`onClick\` or \`onSubmit\` are either directly referenced (e.g., \`onClick={handler}\`) or wrapped in an arrow function if they need to receive arguments (e.g., \`onClick={() => handler(arg)}\`). Calling them directly (e.g., \`onClick={handler()}\`) will execute them immediately on render.",
    expected: `
import { useState, useEffect } from 'react';

interface Item {
  id: string;
  name: string;
  description: string;
}

interface ItemFormValues {
  name: string;
  description: string;
}

export default function ItemList() {
  const [items, setItems] = useState<Item[]>([]);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Simulate API calls
  const fetchItems = async () => {
    console.log("Fetching items...");
    // In a real app, this would be an actual API call
    const data: Item[] = await new Promise((resolve) =>
      setTimeout(() => {
        resolve([
          { id: "1", name: "Widget A", description: "A versatile tool." },
          { id: "2", name: "Gadget B", description: "A handy device." },
          { id: "3", name: "Doodad C", description: "A curious contraption." },
        ]);
      }, 500)
    );
    setItems(data);
  };

  const updateItemApi = async (updatedItem: Item) => {
    console.log(\`Updating item \${updatedItem.id}...\`, updatedItem);
    await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API latency
    return updatedItem; // Simulate successful update
  };

  const deleteItemApi = async (itemId: string) => {
    console.log(\`Deleting item \${itemId}...\`);
    await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API latency
    return { success: true }; // Simulate successful deletion
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleEditClick = (item: Item) => {
    setEditingItem(item);
    setShowEditForm(true);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setShowEditForm(false);
  };

  const handleUpdateItem = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingItem) return;

    // In a real app, form values would be extracted from event.target
    // For this example, we'll just simulate a change to the description
    const updatedItem: Item = {
      ...editingItem,
      description: \`\${editingItem.description} (updated)\`, // Simulate a change
    };

    try {
      const result = await updateItemApi(updatedItem);
      setItems((prevItems) =>
        prevItems.map((item) => (item.id === result.id ? result : item))
      );
      handleCancelEdit(); // Close form on success
    } catch (error) {
      console.error("Failed to update item:", error);
      // Handle error, e.g., show a toast notification
    }
  };

  const handleDeleteClick = (item: Item) => {
    setDeletingItem(item);
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setDeletingItem(null);
    setShowDeleteConfirm(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    try {
      await deleteItemApi(deletingItem.id);
      setItems((prevItems) =>
        prevItems.filter((item) => item.id !== deletingItem.id)
      );
      handleCancelDelete(); // Close dialog on success
    } catch (error) {
      console.error("Failed to delete item:", error);
      // Handle error
    }
  };

  return (
    <div>
      <h1>Resource Manager</h1>

      <h2>Items</h2>
      {items.length === 0 ? (
        <p>No items to display. Add some!</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              {item.name} - {item.description}
              <button onClick={() => handleEditClick(item)}>Edit</button>
              <button onClick={() => handleDeleteClick(item)}>Delete</button>
            </li>
          ))}
        </ul>
      )}

      {showEditForm && editingItem && (
        <div className="modal">
          <h2>Edit Item: {editingItem.name}</h2>
          <form onSubmit={handleUpdateItem}>
            <label>
              Name:
              <input type="text" value={editingItem.name} readOnly />
            </label>
            <label>
              Description:
              <textarea value={editingItem.description} readOnly></textarea>
            </label>
            <button type="submit">Save Changes</button>
            <button type="button" onClick={handleCancelEdit}>Cancel</button>
          </form>
        </div>
      )}

      {showDeleteConfirm && deletingItem && (
        <div className="modal">
          <h2>Confirm Deletion</h2>
          <p>Are you sure you want to delete "{deletingItem.name}"?</p>
          <button onClick={handleConfirmDelete}>Delete Permanently</button>
          <button type="button" onClick={handleCancelDelete}>Cancel</button>
        </div>
      )}
    </div>
  );
}
    `,
    analog_example: `
import { useState } from 'react';

function TodoList() {
  interface Todo { id: string; text: string; completed: boolean; }
  const [todos, setTodos] = useState<Todo[]>([
    { id: "t1", text: "Learn React hooks", completed: false },
    { id: "t2", text: "Build a project", completed: true },
  ]);

  const handleToggleComplete = (id: string) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleRemoveTodo = (id: string) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  };

  return (
    <div>
      <h1>My Todos</h1>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <span
              style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
              onClick={() => handleToggleComplete(todo.id)}
            >
              {todo.text}
            </span>
            <button onClick={() => handleRemoveTodo(todo.id)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
    `,
    deepDiveLabel: "Connecting UI to Logic with Event Handlers",
    deepDive: {
      hook: `
You've built the visual structure of your component and defined the functions that handle its logic and state changes. But how do you bridge the gap between a user's click on a button or submission of a form, and the execution of those functions? This is where event handlers come in. It's not just about writing \`onClick\`; it's about understanding *how* to pass the right function, with the right arguments, to ensure your UI responds exactly as intended without causing errors or unexpected behavior, especially when dealing with functions that require specific data from the item being interacted with.
      `,
      pain: `
⚠️ **Lesson:** Incorrectly wiring event handlers can lead to functions executing immediately on render, functions not receiving necessary arguments, or unexpected behavior due to incorrect \`this\` context (less common in functional components but still a concept). Symptom: Your delete confirmation dialog pops up as soon as the page loads, or your edit function tries to edit \`undefined\` because it didn't receive the \`item\` object.
      `,
      mentalModel: `
**Mental model:** "The UI's Remote Control." Imagine each interactive UI element (button, form, input) has a remote control slot. You need to program that slot with the correct command (your event handler function). Sometimes, the command is simple and needs no extra information (e.g., "close modal"). Other times, the command needs specific details (e.g., "delete *this specific item*"). The way you "program" the slot (pass the function) depends on whether it needs those extra details.
      `,
      discover: `
**Pattern - Passing Event Handlers to JSX:**
\`\`\`tsx
function InteractiveComponent({ itemId }: { itemId: string }) {
  const handleClick = () => {
    console.log("Button clicked!");
  };

  const handleItemSpecificClick = (id: string) => {
    console.log(\`Item \${id} clicked!\`);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Form submitted!");
  };

  return (
    <div>
      {/* 1. No arguments needed: pass function reference directly */}
      <button onClick={handleClick}>Simple Click</button>

      {/* 2. Arguments needed: wrap in an arrow function */}
      <button onClick={() => handleItemSpecificClick(itemId)}>Click Item {itemId}</button>

      {/* 3. Form submission: pass function reference to onSubmit */}
      <form onSubmit={handleSubmit}>
        <button type="submit">Submit Form</button>
      </form>
    </div>
  );
}
\`\`\`
-   **Direct Function Reference:** If your event handler doesn't need any arguments from the event itself (or only needs the synthetic event object, which is passed by default), you can pass the function reference directly: \`onClick={handleClick}\`.
-   **Arrow Function Wrapper:** If your event handler needs specific arguments (like an \`item.id\` from a mapped list), you must wrap the function call in an arrow function: \`onClick={() => handleItemSpecificClick(item.id)}\`. This ensures the function is called *only* when the event occurs, not immediately during rendering.
-   **\`onSubmit\` for Forms:** For forms, the \`onSubmit\` prop is used, and it typically receives the synthetic \`FormEvent\`. You'll usually pass a direct function reference to this.
-   **\`onChange\` for Inputs:** For controlled inputs, \`onChange\` is used, and it receives a \`ChangeEvent\`.
      `,
      quickRules: `
**Quick rules:**
-   ✅  Pass a function reference directly (\`onClick={myHandler}\`) if no custom arguments are needed.
-   ✅  Wrap in an arrow function (\`onClick={() => myHandler(arg)}\`) if you need to pass specific arguments to your handler.
-   ✅  Use \`event.preventDefault()\` inside \`onSubmit\` handlers to stop browser default behavior.
-   ✅  Ensure \`type="button"\` for buttons inside a form that should *not* submit the form.
-   ❌  Never call the function directly (\`onClick={myHandler()}\`) when assigning an event handler, as it will execute immediately on render.
-   ❌  Don't forget \`key\` props when mapping lists to avoid rendering issues.
-   ❌  Avoid inline arrow functions for complex logic or if they are frequently re-created and passed as props to child components (consider \`useCallback\` for optimization in such cases).
      `,
      watchOut: `
👀 **Watch out:** A common mistake is writing \`onClick={handleDelete(item.id)}\` instead of \`onClick={() => handleDelete(item.id)}\`. The first one calls \`handleDelete\` immediately when the component renders, causing the deletion logic to run prematurely. The second one creates a new function that, when called by the click event, then calls \`handleDelete\` with the correct \`item.id\`.
      `,
      dryRun: `
🔁 **Think:** The component has rendered, and a user clicks the "Edit" button for "Gadget B" (id: "2").
1.  **Click Event:** The \`onClick\` handler for the "Edit" button, which is \`() => handleEditClick(item)\`, is triggered.
2.  **\`handleEditClick\` invoked:** The \`handleEditClick\` function is called with \`item\` being "Gadget B".
3.  **State updates:** \`setEditingItem("Gadget B")\` and \`setShowEditForm(true)\` are called.
4.  **UI re-renders:** The component re-renders. Because \`showEditForm\` is now \`true\` and \`editingItem\` is "Gadget B", the edit form modal becomes visible, pre-populated with "Gadget B"'s details.
(Hint: The arrow function delays the execution of \`handleEditClick\` until the click actually happens.)
      `,
      build: "**Learning focus:** Connect all defined event handlers to their corresponding JSX elements to enable user interaction."
    },
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Imports", id: "step1" },
  { label: "Component Shell", id: "step2" },
  { label: "State Variables", id: "step3" },
  { label: "Structure Skeleton", id: "step4" },
  { label: "Fetch & Edit Open/Close", id: "step5" },
  { label: "Update & Delete Logic", id: "step6" },
  { label: "Wire Handlers", id: "step7" },
];

export default createINPACTEngine({
  NODES,
  sideItems,
  lessonNum: 0,
  title: "Resource Edit & Delete with Confirmation",
  shortName: "Edit/Delete Flow",
});
