import createINPACTEngine from "../inpact_engine_shared";

export const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "resource-list-and-form-ui",
      title: "Building a List and Create Form for API Resources",
      body: `Many applications need to display collections of data and allow users to add new items to those collections. This fundamental pattern involves fetching a list of resources from a backend API, rendering them in a user-friendly way, and providing an interface—typically a form—for creating new resources. Without a structured approach, managing the display, user input, API communication, and state updates can quickly become complex and error-prone, leading to inconsistent data displays or frustrating user experiences when data isn't saved correctly. This pattern solves the core challenge of presenting dynamic data and enabling user-driven data creation in a robust and predictable manner.

This pattern is ubiquitous across almost all interactive software. You'll encounter it when building a settings panel that lists configurable options and allows adding new ones, a task manager displaying a list of tasks and a form to create new ones, or a contact list where you can view existing contacts and add new entries. Any feature that involves displaying a collection of items and offering a way to contribute new items to that collection will leverage the principles taught here, making it a foundational skill for building dynamic, data-driven user interfaces.`,
      usecase: "A user interface for managing a collection of `Guest` entries, where each `Guest` has a `name`, `status`, and `notes`. Users can view a list of all `Guests` and add new `Guests` via a form.",
      designMock: {"kind":"list-and-form","screenTitle":"Guests","caption":"Match the list of guests with their statuses and the form to add new guests.","listCaption":"GUEST LIST — sample rows","emptyCaption":"NO GUESTS — when the list is empty","emptyMessage":"No guests have been added yet.","rows":[{"title":"Alice Smith","subtitle":"VIP","meta":"Confirmed"},{"title":"Bob Johnson","subtitle":"Standard","meta":"Pending"}],"fields":[{"label":"Name","sample":"Charlie Brown"},{"label":"Notes","sample":"Dietary restrictions"}],"submitLabel":"Add Guest"}
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Fetch and display a list of resources from an API.",
      "Conditionally render different UI views (list vs. form).",
      "Implement a form to collect user input for new resources.",
      "Send new resource data to an API using a POST request.",
      "Update the UI state after a successful API operation.",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 7",
    paal: "Begin by importing the necessary React hooks and a mock API client. This client will simulate fetching and adding guest data, allowing you to focus on the UI logic.",
    hint: "Remember to import `useState` and `useEffect` from 'react'. The mock API client can be a simple object with async functions.",
    example_code: `import React, { useState } from 'react';
const myApi = {
  fetchItems: async () => new Promise(res => res([])),
};`,
    think_prompt: "Which imports are essential for a React functional component that manages state and performs side effects, and how would you structure a basic mock API client?",
    mc_options: [
      "import { Component } from 'react'; and a class-based API client.",
      "import React, { useState, useEffect } from 'react'; and an object with async functions for API calls.",
      "import { render } from 'react-dom'; and a global fetch function.",
    ],
    mc_correct_option: "import React, { useState, useEffect } from 'react'; and an object with async functions for API calls.",
    mc_anchor: "The core of modern React functional components relies on hooks like `useState` for state management and `useEffect` for side effects. A mock API client, often an object containing async functions, is a common way to simulate backend interactions during development.",
    why_this_matters: "Properly importing dependencies is the first step in any React project. Without `useState` and `useEffect`, you cannot manage component state or perform side effects like data fetching. A mock API client is crucial for developing and testing your UI independently of a live backend, speeding up development and enabling robust testing.",
    answer_keywords: ["useState", "useEffect", "mock API client", "imports"],
    seed_code: ``,
    starter_code: `// Add necessary React imports and a mock API client here.`,
    feedback_correct: "Excellent! Importing `useState` and `useEffect` is fundamental for functional components, and a mock API client helps simulate backend interactions.",
    feedback_partial: "You've got some of the imports right, but ensure you include both `useState` and `useEffect` for state and side effect management. Also, structure your API client as a simple object with async methods.",
    feedback_wrong: "This approach won't work for modern React functional components. `Component` is for class components, and `render` is for mounting the app. Focus on hooks and a simple object for the API client.",
    expected: `import React, { useState, useEffect } from 'react';

// A simple mock API client for demonstration purposes.
// In a real application, this would be a more sophisticated client
// interacting with a backend server.
const mockApiClient = {
  guests: [
    { id: 'g1', name: 'Alice Smith', status: 'confirmed', notes: 'VIP' },
    { id: 'g2', name: 'Bob Johnson', status: 'pending', notes: 'Standard' },
  ],
  fetchGuests: async () => {
    return new Promise(resolve => setTimeout(() => resolve(mockApiClient.guests), 500));
  },
  addGuest: async (newGuest: Omit<Guest, 'id' | 'status'>) => {
    return new Promise(resolve => setTimeout(() => {
      const guestWithId = { ...newGuest, id: \`g\${mockApiClient.guests.length + 1}\`, status: 'pending' };
      mockApiClient.guests.push(guestWithId);
      resolve(guestWithId);
    }, 500));
  },
};`,
    analog_example: `import { useState, useEffect } from 'react';

// Imagine a simple data store for tasks
const taskStore = {
  tasks: [
    { id: 't1', description: 'Buy groceries', completed: false },
    { id: 't2', description: 'Walk the dog', completed: true },
  ],
  fetchTasks: async () => {
    return new Promise(resolve => setTimeout(() => resolve(taskStore.tasks), 300));
  },
  addTask: async (newTask: { description: string }) => {
    return new Promise(resolve => setTimeout(() => {
      const taskWithId = { ...newTask, id: \`t\${taskStore.tasks.length + 1}\`, completed: false };
      taskStore.tasks.push(taskWithId);
      resolve(taskWithId);
    }, 300));
  },
};

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true);
      const fetchedTasks = await taskStore.fetchTasks();
      setTasks(fetchedTasks);
      setLoading(false);
    };
    loadTasks();
  }, []);

  if (loading) return <div>Loading tasks...</div>;

  return (
    <div>
      <h2>My Tasks</h2>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            {task.description} {task.completed ? '(Done)' : ''}
          </li>
        ))}
      </ul>
    </div>
  );
}`,
    deepDiveLabel: "Why are TypeScript interfaces important for API data?",
    deepDive: {
      hook: `Imagine you're designing a blueprint for a house. Before you start building, you need to define what each room will contain: a kitchen needs a sink, a stove, and a refrigerator; a bedroom needs a bed and a closet. In software, when we deal with data, we need similar blueprints. If you're fetching a list of "guests" from an API, how do you know what properties each guest object will have? Will it have a \`name\`, an \`age\`, a \`status\`? What *type* should each of these properties be? Without a clear definition, your code becomes fragile. You might accidentally try to access \`guest.age\` when the API only provides \`guest.name\`, leading to runtime errors. TypeScript interfaces provide this crucial blueprint, ensuring that your data structures are consistent and that your code interacts with them predictably, catching potential errors *before* your application even runs.`,
      pain: `⚠️ **Lesson:** Undefined or inconsistent data structures lead to runtime errors and make code harder to reason about. Symptom: "Property 'X' does not exist on type 'Y'," or unexpected \`undefined\` values when accessing object properties. This indicates that the code is trying to use a property that TypeScript doesn't know exists on a given type, or that the actual data structure doesn't match the assumed one.`,
      mentalModel: `**Mental model:** The "Contract." Think of an interface as a formal contract between different parts of your application (or between your application and an API). When you define an \`interface Guest\`, you're essentially saying, "Any object that claims to be a \`Guest\` *must* have an \`id\` (which is a \`string\`), a \`name\` (a \`string\`), a \`status\` (one of 'pending', 'confirmed', 'cancelled'), and \`notes\` (a \`string\')." If an object doesn't fulfill this contract, TypeScript will flag it as an error. This contract ensures that when you pass a \`Guest\` object around, every piece of code expecting a \`Guest\` knows exactly what properties it can rely on, preventing miscommunications and unexpected behavior.`,
      discover: `\`\`\`tsx
interface User {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
}

type UserRole = 'admin' | 'editor' | 'viewer'; // A union type for specific string values

interface AdminUser extends User { // Extending an existing interface
  role: UserRole;
  permissions: string[];
}
\`\`\`
- \`interface Guest { ... }\` defines the shape of an object, specifying property names and their types.
- \`status: 'pending' | 'confirmed' | 'cancelled';\` demonstrates a union type, restricting the \`status\` property to specific string literal values.
- \`interface NewGuestFormData { ... }\` defines the shape of data specifically for the form, which might be a subset of the full \`Guest\` interface.
- Using \`Omit<Guest, 'id' | 'status'>\` in the \`mockApiClient.addGuest\` signature is a utility type that creates a new type by taking all properties from \`Guest\` *except* \`id\` and \`status\`, which are typically generated by the backend.`,
      quickRules: `**Quick rules:**
- ✅ Define interfaces for all data structures fetched from or sent to an API.
- ✅ Use specific string literal types (\`'pending' | 'confirmed'\`) for properties with a fixed set of values.
- ✅ Create separate interfaces for form data if it differs from the full resource structure (e.g., no \`id\` or default \`status\`).
- ✅ Leverage utility types like \`Omit\` or \`Pick\` to derive new types from existing ones, promoting reusability.
- ❌ Avoid using \`any\` as a type; it defeats the purpose of TypeScript.
- ❌ Don't guess at API response shapes; consult API documentation or use tools to infer types.
- ❌ Never define interfaces inside a component function; they belong at the module scope.`,
      watchOut: `👀 **Watch out:** While \`type\` aliases and \`interface\` declarations are similar, \`interface\` is generally preferred for defining object shapes because it can be extended and merged. \`type\` is more versatile for union types, primitive aliases, or complex mapped types. Also, ensure your interfaces accurately reflect the *actual* data structure from your API; discrepancies will lead to type errors or runtime bugs.`,
      dryRun: `🔁 **Think:**
1.  **Before \`interface Guest\` is defined:** If I try to declare \`const myGuest: Guest = { ... };\`, TypeScript will report "Cannot find name 'Guest'".
2.  **After \`interface Guest { id: string; name: string; status: 'pending' | 'confirmed'; notes: string; }\` is defined:**
    *   \`const myGuest: Guest = { id: '1', name: 'Test', status: 'pending', notes: '' };\` is valid.
    *   \`const badGuest: Guest = { id: '2', name: 'Bad', status: 'invalid', notes: '' };\` will cause a TypeScript error because \`'invalid'\` is not one of the allowed \`status\` values.
    *   \`const incompleteGuest: Guest = { id: '3', name: 'Incomplete' };\` will cause a TypeScript error because \`status\` and \`notes\` are missing.
(Hint: Interfaces act as a contract, enforcing the shape and types of objects.)`,
      build: "Defining TypeScript interfaces at the module scope provides clear blueprints for the `Guest` resource and the data expected from the form, ensuring type safety and consistency throughout the application.",
    },
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 7",
    paal: "Now, define TypeScript interfaces for the `Guest` resource and the `NewGuestFormData`. These interfaces will ensure type safety when working with guest data and form inputs.",
    hint: "Think about the properties each `Guest` object should have (id, name, status, notes) and what properties the form will collect (name, notes).",
    example_code: `interface Item {
  id: string;
  label: string;
}
interface NewItemData {
  label: string;
}`,
    think_prompt: "What are the essential properties for a `Guest` object, including its possible statuses, and what fields will a form need to create a *new* guest?",
    mc_options: [
      "interface Guest { name: string; } and interface NewGuestFormData { name: string; }",
      "interface Guest { id: string; name: string; status: 'pending' | 'confirmed'; notes: string; } and interface NewGuestFormData { name: string; notes: string; }",
      "type Guest = any; and type NewGuestFormData = any;",
    ],
    mc_correct_option: "interface Guest { id: string; name: string; status: 'pending' | 'confirmed'; notes: string; } and interface NewGuestFormData { name: string; notes: string; }",
    mc_anchor: "Defining explicit interfaces for both the full resource and the form data provides strong type checking and clarity. The `Guest` interface should include all properties, while `NewGuestFormData` should only include what the user inputs.",
    why_this_matters: "Type safety is paramount in large applications. By defining interfaces, you prevent common errors like typos in property names or incorrect data types, which TypeScript catches at compile time rather than runtime. This makes your code more robust and easier to maintain.",
    answer_keywords: ["interface", "TypeScript", "type safety", "Guest", "NewGuestFormData"],
    seed_code: `import React, { useState, useEffect } from 'react';

const mockApiClient = {
  guests: [
    { id: 'g1', name: 'Alice Smith', status: 'confirmed', notes: 'VIP' },
    { id: 'g2', name: 'Bob Johnson', status: 'pending', notes: 'Standard' },
  ],
  fetchGuests: async () => {
    return new Promise(resolve => setTimeout(() => resolve(mockApiClient.guests), 500));
  },
  addGuest: async (newGuest: Omit<Guest, 'id' | 'status'>) => {
    return new Promise(resolve => setTimeout(() => {
      const guestWithId = { ...newGuest, id: \`g\${mockApiClient.guests.length + 1}\`, status: 'pending' };
      mockApiClient.guests.push(guestWithId);
      resolve(guestWithId);
    }, 500));
  },
};`,
    starter_code: `import React, { useState, useEffect } from 'react';

const mockApiClient = {
  guests: [
    { id: 'g1', name: 'Alice Smith', status: 'confirmed', notes: 'VIP' },
    { id: 'g2', name: 'Bob Johnson', status: 'pending', notes: 'Standard' },
  ],
  fetchGuests: async () => {
    return new Promise(resolve => setTimeout(() => resolve(mockApiClient.guests), 500));
  },
  addGuest: async (newGuest: Omit<Guest, 'id' | 'status'>) => {
    return new Promise(resolve => setTimeout(() => {
      const guestWithId = { ...newGuest, id: \`g\${mockApiClient.guests.length + 1}\`, status: 'pending' };
      mockApiClient.guests.push(guestWithId);
      resolve(guestWithId);
    }, 500));
  },
};

// Define TypeScript interfaces for the Guest resource and the form input data here.`,
    feedback_correct: "Correct! Defining specific interfaces for `Guest` and `NewGuestFormData` ensures type safety and clarity, especially with union types for `status`.",
    feedback_partial: "You're on the right track with interfaces, but ensure the `Guest` interface includes all properties like `id` and `status` with its specific string literal types. The `NewGuestFormData` should only contain what the user provides.",
    feedback_wrong: "Using `any` defeats the purpose of TypeScript. It's crucial to define precise interfaces for your data structures to leverage type checking benefits.",
    expected: `import React, { useState, useEffect } from 'react';

const mockApiClient = {
  guests: [
    { id: 'g1', name: 'Alice Smith', status: 'confirmed', notes: 'VIP' },
    { id: 'g2', name: 'Bob Johnson', status: 'pending', notes: 'Standard' },
  ],
  fetchGuests: async () => {
    return new Promise(resolve => setTimeout(() => resolve(mockApiClient.guests), 500));
  },
  addGuest: async (newGuest: Omit<Guest, 'id' | 'status'>) => {
    return new Promise(resolve => setTimeout(() => {
      const guestWithId = { ...newGuest, id: \`g\${mockApiClient.guests.length + 1}\`, status: 'pending' };
      mockApiClient.guests.push(guestWithId);
      resolve(guestWithId);
    }, 500));
  },
};

interface Guest {
  id: string;
  name: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string;
}

interface NewGuestFormData {
  name: string;
  notes: string;
}`,
    analog_example: `interface Product {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
}

interface NewProductInput {
  name: string;
  price: number;
}

function displayProduct(product: Product) {
  console.log(\`Product: \${product.name} - \$\${product.price} (\${product.inStock ? 'In Stock' : 'Out of Stock'})\`);
}

const newProduct: NewProductInput = {
  name: 'Widget X',
  price: 29.99,
};

// This would typically be sent to an API
// const createdProduct: Product = { ...newProduct, id: 'p3', inStock: true };`,
    deepDiveLabel: "Why are TypeScript interfaces important for API data?",
    deepDive: {
      hook: `Imagine you're designing a blueprint for a house. Before you start building, you need to define what each room will contain: a kitchen needs a sink, a stove, and a refrigerator; a bedroom needs a bed and a closet. In software, when we deal with data, we need similar blueprints. If you're fetching a list of "guests" from an API, how do you know what properties each guest object will have? Will it have a \`name\`, an \`age\`, a \`status\`? What *type* should each of these properties be? Without a clear definition, your code becomes fragile. You might accidentally try to access \`guest.age\` when the API only provides \`guest.name\`, leading to runtime errors. TypeScript interfaces provide this crucial blueprint, ensuring that your data structures are consistent and that your code interacts with them predictably, catching potential errors *before* your application even runs.`,
      pain: `⚠️ **Lesson:** Undefined or inconsistent data structures lead to runtime errors and make code harder to reason about. Symptom: "Property 'X' does not exist on type 'Y'," or unexpected \`undefined\` values when accessing object properties. This indicates that the code is trying to use a property that TypeScript doesn't know exists on a given type, or that the actual data structure doesn't match the assumed one.`,
      mentalModel: `**Mental model:** The "Contract." Think of an interface as a formal contract between different parts of your application (or between your application and an API). When you define an \`interface Guest\`, you're essentially saying, "Any object that claims to be a \`Guest\` *must* have an \`id\` (which is a \`string\`), a \`name\` (a \`string\`), a \`status\` (one of 'pending', 'confirmed', 'cancelled'), and \`notes\` (a \`string\')." If an object doesn't fulfill this contract, TypeScript will flag it as an error. This contract ensures that when you pass a \`Guest\` object around, every piece of code expecting a \`Guest\` knows exactly what properties it can rely on, preventing miscommunications and unexpected behavior.`,
      discover: `\`\`\`tsx
interface User {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
}

type UserRole = 'admin' | 'editor' | 'viewer'; // A union type for specific string values

interface AdminUser extends User { // Extending an existing interface
  role: UserRole;
  permissions: string[];
}
\`\`\`
- \`interface Guest { ... }\` defines the shape of an object, specifying property names and their types.
- \`status: 'pending' | 'confirmed' | 'cancelled';\` demonstrates a union type, restricting the \`status\` property to specific string literal values.
- \`interface NewGuestFormData { ... }\` defines the shape of data specifically for the form, which might be a subset of the full \`Guest\` interface.
- Using \`Omit<Guest, 'id' | 'status'>\` in the \`mockApiClient.addGuest\` signature is a utility type that creates a new type by taking all properties from \`Guest\` *except* \`id\` and \`status\`, which are typically generated by the backend.`,
      quickRules: `**Quick rules:**
- ✅ Define interfaces for all data structures fetched from or sent to an API.
- ✅ Use specific string literal types (\`'pending' | 'confirmed'\`) for properties with a fixed set of values.
- ✅ Create separate interfaces for form data if it differs from the full resource structure (e.g., no \`id\` or default \`status\`).
- ✅ Leverage utility types like \`Omit\` or \`Pick\` to derive new types from existing ones, promoting reusability.
- ❌ Avoid using \`any\` as a type; it defeats the purpose of TypeScript.
- ❌ Don't guess at API response shapes; consult API documentation or use tools to infer types.
- ❌ Never define interfaces inside a component function; they belong at the module scope.`,
      watchOut: `👀 **Watch out:** While \`type\` aliases and \`interface\` declarations are similar, \`interface\` is generally preferred for defining object shapes because it can be extended and merged. \`type\` is more versatile for union types, primitive aliases, or complex mapped types. Also, ensure your interfaces accurately reflect the *actual* data structure from your API; discrepancies will lead to type errors or runtime bugs.`,
      dryRun: `🔁 **Think:**
1.  **Before \`interface Guest\` is defined:** If I try to declare \`const myGuest: Guest = { ... };\`, TypeScript will report "Cannot find name 'Guest'".
2.  **After \`interface Guest { id: string; name: string; status: 'pending' | 'confirmed'; notes: string; }\` is defined:**
    *   \`const myGuest: Guest = { id: '1', name: 'Test', status: 'pending', notes: '' };\` is valid.
    *   \`const badGuest: Guest = { id: '2', name: 'Bad', status: 'invalid', notes: '' };\` will cause a TypeScript error because \`'invalid'\` is not one of the allowed \`status\` values.
    *   \`const incompleteGuest: Guest = { id: '3', name: 'Incomplete' };\` will cause a TypeScript error because \`status\` and \`notes\` are missing.
(Hint: Interfaces act as a contract, enforcing the shape and types of objects.)`,
      build: "Defining TypeScript interfaces at the module scope provides clear blueprints for the `Guest` resource and the data expected from the form, ensuring type safety and consistency throughout the application.",
    },
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 7",
    paal: "Now, create the basic functional component shell for `GuestManager`. This will be the main container for your list and form UI.",
    hint: "A functional component is a JavaScript function that returns JSX. Remember to give it an uppercase name.",
    example_code: `function MyComponent() {
  return (
    <div>
      <p>Hello World</p>
    </div>
  );
}`,
    think_prompt: "How do you define a basic functional component in React, and what should it minimally return to be a valid component?",
    mc_options: [
      "const GuestManager = () => { return 'Guest Manager'; };",
      "function GuestManager() { return <div className=\"guest-manager\"><h1>Guest Management</h1></div>; }",
      "class GuestManager extends React.Component { render() { return <div></div>; } }",
    ],
    mc_correct_option: "function GuestManager() { return <div className=\"guest-manager\"><h1>Guest Management</h1></div>; }",
    mc_anchor: "A functional component is a JavaScript function that returns JSX. It should have an uppercase name and typically return a single root JSX element.",
    why_this_matters: "The component shell is the entry point for your UI logic and rendering. It provides a clear, modular structure for encapsulating related functionality and presentation, making your application easier to develop, debug, and scale.",
    answer_keywords: ["functional component", "JSX", "return", "component shell"],
    seed_code: `import React, { useState, useEffect } from 'react';

const mockApiClient = {
  guests: [
    { id: 'g1', name: 'Alice Smith', status: 'confirmed', notes: 'VIP' },
    { id: 'g2', name: 'Bob Johnson', status: 'pending', notes: 'Standard' },
  ],
  fetchGuests: async () => {
    return new Promise(resolve => setTimeout(() => resolve(mockApiClient.guests), 500));
  },
  addGuest: async (newGuest: Omit<Guest, 'id' | 'status'>) => {
    return new Promise(resolve => setTimeout(() => {
      const guestWithId = { ...newGuest, id: \`g\${mockApiClient.guests.length + 1}\`, status: 'pending' };
      mockApiClient.guests.push(guestWithId);
      resolve(guestWithId);
    }, 500));
  },
};

interface Guest {
  id: string;
  name: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string;
}

interface NewGuestFormData {
  name: string;
  notes: string;
}`,
    starter_code: `import React, { useState, useEffect } from 'react';

const mockApiClient = {
  guests: [
    { id: 'g1', name: 'Alice Smith', status: 'confirmed', notes: 'VIP' },
    { id: 'g2', name: 'Bob Johnson', status: 'pending', notes: 'Standard' },
  ],
  fetchGuests: async () => {
    return new Promise(resolve => setTimeout(() => resolve(mockApiClient.guests), 500));
  },
  addGuest: async (newGuest: Omit<Guest, 'id' | 'status'>) => {
    return new Promise(resolve => setTimeout(() => {
      const guestWithId = { ...newGuest, id: \`g\${mockApiClient.guests.length + 1}\`, status: 'pending' };
      mockApiClient.guests.push(guestWithId);
      resolve(guestWithId);
    }, 500));
  },
};

interface Guest {
  id: string;
  name: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string;
}

interface NewGuestFormData {
  name: string;
  notes: string;
}

// Create the functional component shell for the GuestManager here.`,
    feedback_correct: "Spot on! A functional component returning a root JSX element is the correct way to start building your UI.",
    feedback_partial: "You're close, but ensure your component returns valid JSX, typically wrapped in a single root element like a `div`, not just a string.",
    feedback_wrong: "Class components are an older pattern in React. Focus on functional components and hooks for modern React development.",
    expected: `import React, { useState, useEffect } from 'react';

const mockApiClient = {
  guests: [
    { id: 'g1', name: 'Alice Smith', status: 'confirmed', notes: 'VIP' },
    { id: 'g2', name: 'Bob Johnson', status: 'pending', notes: 'Standard' },
  ],
  fetchGuests: async () => {
    return new Promise(resolve => setTimeout(() => resolve(mockApiClient.guests), 500));
  },
  addGuest: async (newGuest: Omit<Guest, 'id' | 'status'>) => {
    return new Promise(resolve => setTimeout(() => {
      const guestWithId = { ...newGuest, id: \`g\${mockApiClient.guests.length + 1}\`, status: 'pending' };
      mockApiClient.guests.push(guestWithId);
      resolve(guestWithId);
    }, 500));
  },
};

interface Guest {
  id: string;
  name: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string;
}

interface NewGuestFormData {
  name: string;
  notes: string;
}

function GuestManager() {
  return (
    <div className="guest-manager">
      <h1>Guest Management</h1>
      {/* Content will go here */}
    </div>
  );
}`,
    analog_example: `function ItemDisplay() {
  // State and logic would go here later
  return (
    <div className="item-container">
      <h2>Item Details</h2>
      {/* Item specific content */}
    </div>
  );
}

function App() {
  return (
    <div>
      <header>Welcome</header>
      <ItemDisplay />
      <footer>&copy; 2023</footer>
    </div>
  );
}`,
    deepDiveLabel: "What is the purpose of a React component shell?",
    deepDive: {
      hook: `Every interactive piece of a user interface needs a home, a container where its logic and presentation reside. In React, this home is typically a component. Starting with a basic component shell is like laying the foundation for a building: you define its boundaries and give it a name before you start adding rooms, furniture, or decorations. Without this fundamental structure, your application has no entry point, no place to render anything, and no way to organize its functionality. It's the essential first step that allows you to encapsulate UI elements and their behavior, making your application modular and maintainable. A well-named component also clearly communicates its purpose, which is vital for team collaboration and long-term project understanding.`,
      pain: `⚠️ **Lesson:** Without a component shell, there's no functional unit to render or manage state. Symptom: "Nothing was returned from render," "X is not a function," or a blank screen. This means the application doesn't have a valid React component to execute and display, or the component is not returning valid JSX.`,
      mentalModel: `**Mental model:** The "Modular Building Block." Think of a React component as a self-contained, reusable building block for your UI. Just like LEGO bricks, each component has a specific purpose and can be combined with others to create larger structures. The component shell is the basic shape of that brick – its outer walls and a designated space for its internal workings. It defines the component's name (e.g., \`GuestManager\`) and provides the \`return\` statement where its visual output (JSX) will eventually go. This modular approach allows you to break down complex UIs into smaller, manageable pieces, making development easier, testing more focused, and maintenance more straightforward.`,
      discover: `\`\`\`tsx
function MyComponent() {
  // Component logic (state, effects, handlers) goes here
  return (
    <div className="my-component-root">
      {/* JSX for the component's UI */}
      <p>Hello from MyComponent!</p>
    </div>
  );
}

// Or using an arrow function:
const AnotherComponent = () => {
  return (
    <div>
      {/* More JSX */}
    </div>
  );
};
\`\`\`
- A functional component is a JavaScript function that returns JSX.
- Component names should always start with an uppercase letter (e.g., \`GuestManager\`).
- The \`return\` statement contains the JSX that defines the component's UI.
- The outermost JSX element in the \`return\` statement is typically a single root element (like a \`div\` or a \`Fragment\`).`,
      quickRules: `**Quick rules:**
- ✅ Use a \`function\` declaration or an arrow function for functional components.
- ✅ Name components using PascalCase (e.g., \`GuestManager\`).
- ✅ Ensure the component function returns valid JSX.
- ✅ Wrap multiple top-level JSX elements in a single parent element or a \`Fragment\` (\`<></>\`).
- ❌ Do not use \`React.FC\` or \`React.FunctionalComponent\` for component types.
- ❌ Avoid naming components with lowercase letters; React will treat them as regular HTML elements.
- ❌ Never define a component inside another component's render method; it leads to performance issues and bugs.`,
      watchOut: `👀 **Watch out:** Forgetting to \`return\` JSX from your component will result in nothing being rendered. Also, ensure your component's name starts with an uppercase letter. If you name it \`guestManager\`, React will interpret it as a standard HTML tag, not a custom component, leading to rendering issues.`,
      dryRun: `🔁 **Think:**
1.  **Initial state:** No \`GuestManager\` function exists. If I try to use \`<GuestManager />\` in \`App.tsx\`, I'll get an error "Cannot find name 'GuestManager'".
2.  **After adding \`function GuestManager() { return <div>Hello</div>; }\`:** Now, when \`<GuestManager />\` is used, React calls this function. The function returns \`<div>Hello</div>\`, which React then renders to the DOM.
3.  **If I change the return to \`return "Hello";\`:** React will render the string "Hello" directly.
4.  **If I change the return to \`return;\`:** React will render nothing for this component, as \`undefined\` is returned.
(Hint: The component's return value dictates what React renders.)`,
      build: "Establishing the basic functional component shell provides the necessary structure and entry point for building the `GuestManager` UI.",
    },
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 7",
    paal: "Inside `GuestManager`, initialize state variables using `useState` for the list of guests, loading status, potential errors, form input data, and the current view mode ('list' or 'create').",
    hint: "You'll need `useState` for `guests` (an array), `loading` (boolean), `error` (string or null), `newGuestData` (an object matching `NewGuestFormData`), and `viewMode` (a string literal type).",
    example_code: `const [items, setItems] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [formData, setFormData] = useState({ name: '' });`,
    think_prompt: "What initial values and types should you use for state variables that hold a list of items, a boolean loading flag, an error message, form data, and a view selection?",
    mc_options: [
      "const [guests, setGuests] = useState(); const [loading, setLoading] = useState();",
      "const [guests, setGuests] = useState<Guest[]>([]); const [loading, setLoading] = useState<boolean>(true); const [error, setError] = useState<string | null>(null); const [newGuestData, setNewGuestData] = useState<NewGuestFormData>({ name: '', notes: '' }); const [viewMode, setViewMode] = useState<'list' | 'create'>('list');",
      "let guests = []; let loading = true; // No useState",
    ],
    mc_correct_option: "const [guests, setGuests] = useState<Guest[]>([]); const [loading, setLoading] = useState<boolean>(true); const [error, setError] = useState<string | null>(null); const [newGuestData, setNewGuestData] = useState<NewGuestFormData>({ name: '', notes: '' }); const [viewMode, setViewMode] = useState<'list' | 'create'>('list');",
    mc_anchor: "Using `useState` with explicit TypeScript types and appropriate initial values is crucial for managing dynamic data and UI states. This includes arrays for lists, booleans for flags, nullable types for errors, and objects for form data.",
    why_this_matters: "State management is the heart of interactive React applications. Correctly initializing state ensures your component starts in a predictable condition, can track changes, and will re-render efficiently when data updates, providing a responsive user experience.",
    answer_keywords: ["useState", "state management", "initial state", "TypeScript types", "viewMode"],
    seed_code: `import React, { useState, useEffect } from 'react';

const mockApiClient = {
  guests: [
    { id: 'g1', name: 'Alice Smith', status: 'confirmed', notes: 'VIP' },
    { id: 'g2', name: 'Bob Johnson', status: 'pending', notes: 'Standard' },
  ],
  fetchGuests: async () => {
    return new Promise(resolve => setTimeout(() => resolve(mockApiClient.guests), 500));
  },
  addGuest: async (newGuest: Omit<Guest, 'id' | 'status'>) => {
    return new Promise(resolve => setTimeout(() => {
      const guestWithId = { ...newGuest, id: \`g\${mockApiClient.guests.length + 1}\`, status: 'pending' };
      mockApiClient.guests.push(guestWithId);
      resolve(guestWithId);
    }, 500));
  },
};

interface Guest {
  id: string;
  name: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string;
}

interface NewGuestFormData {
  name: string;
  notes: string;
}

function GuestManager() {
  return (
    <div className="guest-manager">
      <h1>Guest Management</h1>
      {/* Content will go here */}
    </div>
  );
}`,
    starter_code: `import React, { useState, useEffect } from 'react';

const mockApiClient = {
  guests: [
    { id: 'g1', name: 'Alice Smith', status: 'confirmed', notes: 'VIP' },
    { id: 'g2', name: 'Bob Johnson', status: 'pending', notes: 'Standard' },
  ],
  fetchGuests: async () => {
    return new Promise(resolve => setTimeout(() => resolve(mockApiClient.guests), 500));
  },
  addGuest: async (newGuest: Omit<Guest, 'id' | 'status'>) => {
    return new Promise(resolve => setTimeout(() => {
      const guestWithId = { ...newGuest, id: \`g\${mockApiClient.guests.length + 1}\`, status: 'pending' };
      mockApiClient.guests.push(guestWithId);
      resolve(guestWithId);
    }, 500));
  },
};

interface Guest {
  id: string;
  name: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string;
}

interface NewGuestFormData {
  name: string;
  notes: string;
}

function GuestManager() {
  // Initialize state variables for guests, loading, error, form data, and current view.
  return (
    <div className="guest-manager">
      <h1>Guest Management</h1>
      {/* Content will go here */}
    </div>
  );
}`,
    feedback_correct: "Perfect! You've correctly set up all the necessary state variables with their appropriate types and initial values.",
    feedback_partial: "You've initialized some state variables, but ensure you're using `useState` for all dynamic data, including `error` and `viewMode`, with their correct TypeScript types.",
    feedback_wrong: "Using `let` variables directly won't trigger re-renders in React. You must use `useState` for any data that needs to be reactive and update the UI.",
    expected: `import React, { useState, useEffect } from 'react';

const mockApiClient = {
  guests: [
    { id: 'g1', name: 'Alice Smith', status: 'confirmed', notes: 'VIP' },
    { id: 'g2', name: 'Bob Johnson', status: 'pending', notes: 'Standard' },
  ],
  fetchGuests: async () => {
    return new Promise(resolve => setTimeout(() => resolve(mockApiClient.guests), 500));
  },
  addGuest: async (newGuest: Omit<Guest, 'id' | 'status'>) => {
    return new Promise(resolve => setTimeout(() => {
      const guestWithId = { ...newGuest, id: \`g\${mockApiClient.guests.length + 1}\`, status: 'pending' };
      mockApiClient.guests.push(guestWithId);
      resolve(guestWithId);
    }, 500));
  },
};

interface Guest {
  id: string;
  name: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string;
}

interface NewGuestFormData {
  name: string;
  notes: string;
}

type ViewMode = 'list' | 'create';

function GuestManager() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newGuestData, setNewGuestData] = useState<NewGuestFormData>({ name: '', notes: '' });
  const [viewMode, setViewMode] = useState<ViewMode>('list'); // 'list' or 'create'

  return (
    <div className="guest-manager">
      <h1>Guest Management</h1>
      {/* Content will go here */}
    </div>
  );
}`,
    analog_example: `import { useState } from 'react';

interface CounterState {
  count: number;
  step: number;
}

function Counter() {
  const [counter, setCounter] = useState<CounterState>({ count: 0, step: 1 });
  const [message, setMessage] = useState<string>('Ready');
  const [isCountingUp, setIsCountingUp] = useState<boolean>(true);

  const increment = () => {
    setCounter(prev => ({ ...prev, count: prev.count + prev.step }));
    setMessage('Counting...');
  };

  const decrement = () => {
    setCounter(prev => ({ ...prev, count: prev.count - prev.step }));
    setMessage('Counting...');
  };

  return (
    <div>
      <p>Count: {counter.count}</p>
      <p>Message: {message}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}`,
    deepDiveLabel: "How does `useState` enable dynamic UIs?",
    deepDive: {
      hook: `In any dynamic application, the user interface needs to react to changes: data arriving from an API, user input into a form, or a button click. This responsiveness is managed through "state." Without state, your UI would be static, unable to display new information, track user interactions, or switch between different views. Imagine a light switch that's always stuck in the "off" position, or a form that forgets everything you type as soon as you move to the next field. \`useState\` is the fundamental mechanism in React for giving your components memory and making them interactive. It allows a component to "remember" values and, crucially, to re-render itself whenever those values change, reflecting the latest information to the user.`,
      pain: `⚠️ **Lesson:** Without state management, components cannot store or react to dynamic data. Symptom: UI doesn't update, user input is lost, or data fetched from an API isn't displayed. This means the component lacks the internal memory to track changes and trigger re-renders.`,
      mentalModel: `**Mental model:** The "Component's Memory Bank." Each time a component renders, it's like a fresh execution of its function. To persist information across these renders, the component needs a memory bank. \`useState\` provides this memory bank. When you call \`useState(initialValue)\`, React sets up a special "slot" in the component's memory to hold that value. It returns two things: the current value in that slot, and a function to update it. When you use the update function (e.g., \`setGuests\`), React not only updates the value in the memory slot but also knows that the component needs to re-render with the new value, making your UI dynamic.`,
      discover: `\`\`\`tsx
const [count, setCount] = useState<number>(0); // Basic number state
const [user, setUser] = useState<{ name: string; age: number } | null>(null); // Object state, can be null
const [items, setItems] = useState<string[]>([]); // Array state
const [isLoading, setIsLoading] = useState<boolean>(false); // Boolean flag
\`\`\`
- \`const [guests, setGuests] = useState<Guest[]>([]);\` declares a state variable \`guests\` initialized as an empty array of \`Guest\` objects, and a function \`setGuests\` to update it.
- \`const [loading, setLoading] = useState<boolean>(true);\` manages a boolean flag indicating if data is currently being fetched.
- \`const [error, setError] = useState<string | null>(null);\` stores any error messages, initialized to \`null\`.
- \`const [newGuestData, setNewGuestData] = useState<NewGuestFormData>({ name: '', notes: '' });\` holds the current input values for the form.
- \`const [viewMode, setViewMode] = useState<ViewMode>('list');\` controls which part of the UI (list or form) is currently visible.`,
      quickRules: `**Quick rules:**
- ✅ Use \`useState\` for any data that changes over time and should trigger a re-render of the component.
- ✅ Always use the setter function (\`setGuests\`, \`setLoading\`) to update state; never modify state variables directly.
- ✅ When updating object or array state, always create a *new* object or array (e.g., using spread syntax \`...\`) to ensure React detects the change.
- ✅ Provide an initial value to \`useState\` that matches the expected type.
- ❌ Do not call \`useState\` inside loops, conditional statements, or nested functions; it must be called at the top level of your functional component.
- ❌ Avoid putting derived state (values that can be computed from existing state or props) directly into \`useState\`; compute them during render.
- ❌ Never mutate state directly (e.g., \`guests.push(newGuest)\`); this will not trigger a re-render.`,
      watchOut: `👀 **Watch out:** When updating state that is an object or array, you *must* provide a new object/array reference for React to detect the change and re-render. Simply mutating the existing object/array (e.g., \`newGuestData.name = '...'\`) will not work. Always use the spread operator (\`{ ...prev, key: value }\`) or array methods that return new arrays (\`.map\`, \`.filter\`, \`.concat\`).`,
      dryRun: `🔁 **Think:**
1.  **Initial render:** \`guests\` is \`[]\`, \`loading\` is \`true\`, \`viewMode\` is \`'list'\`.
2.  **User clicks "Add Guest" button:** \`setViewMode('create')\` is called.
    *   \`viewMode\` changes from \`'list'\` to \`'create'\`.
    *   React detects this state change and schedules a re-render of \`GuestManager\`.
3.  **Re-render:** \`GuestManager\` executes again. This time, \`viewMode\` is \`'create'\`, so the component will render the form UI instead of the list UI.
4.  **User types in "Name" field:** \`setNewGuestData\` is called with \`{ name: 'John', notes: '' }\`.
    *   \`newGuestData\` changes from \`{ name: '', notes: '' }\` to \`{ name: 'John', notes: '' }\`.
    *   React detects this state change and re-renders \`GuestManager\`. The input field now displays "John".
(Hint: State updates trigger re-renders, allowing the UI to reflect new data.)`,
      build: "Initializing state variables with `useState` provides the component with internal memory to manage the list of guests, loading status, potential errors, form input, and the current view mode, making the UI dynamic.",
    },
  },
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 7",
    paal: "Inside the `GuestManager` component's `return` statement, add the JSX structure for both the guest list view and the guest creation form. Use conditional rendering based on `viewMode` to show only one at a time. Include basic loading, error, and empty states for the list.",
    hint: "Use the logical AND operator (`&&`) for conditional rendering. Structure the list with `ul` and `li` elements, and the form with `form`, `label`, `input`, and `textarea` elements.",
    example_code: `function MyComponent() {
  const [showForm, setShowForm] = useState(false);
  return (
    <div>
      {!showForm && <button onClick={() => setShowForm(true)}>Show Form</button>}
      {showForm && (
        <form>
          <input type="text" />
          <button type="submit">Submit</button>
        </form>
      )}
    </div>
  );
}`,
    think_prompt: "How can you conditionally display a list or a form based on a `viewMode` state, and what elements are needed for each view, including loading and error indicators?",
    mc_options: [
      "Use an `if/else` statement directly inside the JSX to render different components.",
      "Use the `&&` operator with the `viewMode` state to show either the list `div` or the form `div`, along with conditional messages for loading, error, and empty states.",
      "Render both the list and the form, and use CSS `display: none;` to hide the inactive one.",
    ],
    mc_correct_option: "Use the `&&` operator with the `viewMode` state to show either the list `div` or the form `div`, along with conditional messages for loading, error, and empty states.",
    mc_anchor: "Conditional rendering with the `&&` operator is the standard React pattern for displaying different UI sections based on state. This allows for clean separation of concerns and efficient rendering.",
    why_this_matters: "A well-structured UI that adapts to application state is crucial for user experience. Conditional rendering ensures users only see relevant information, reducing cognitive load and making the application intuitive to navigate. It also prevents rendering unnecessary DOM elements, improving performance.",
    answer_keywords: ["conditional rendering", "JSX structure", "viewMode", "loading state", "form elements"],
    seed_code: `import React, { useState, useEffect } from 'react';

const mockApiClient = {
  guests: [
    { id: 'g1', name: 'Alice Smith', status: 'confirmed', notes: 'VIP' },
    { id: 'g2', name: 'Bob Johnson', status: 'pending', notes: 'Standard' },
  ],
  fetchGuests: async () => {
    return new Promise(resolve => setTimeout(() => resolve(mockApiClient.guests), 500));
  },
  addGuest: async (newGuest: Omit<Guest, 'id' | 'status'>) => {
    return new Promise(resolve => setTimeout(() => {
      const guestWithId = { ...newGuest, id: \`g\${mockApiClient.guests.length + 1}\`, status: 'pending' };
      mockApiClient.guests.push(guestWithId);
      resolve(guestWithId);
    }, 500));
  },
};

interface Guest {
  id: string;
  name: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string;
}

interface NewGuestFormData {
  name: string;
  notes: string;
}

type ViewMode = 'list' | 'create';

function GuestManager() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newGuestData, setNewGuestData] = useState<NewGuestFormData>({ name: '', notes: '' });
  const [viewMode, setViewMode] = useState<ViewMode>('list'); // 'list' or 'create'

  return (
    <div className="guest-manager">
      <h1>Guest Management</h1>
      {/* Content will go here */}
    </div>
  );
}`,
    starter_code: `import React, { useState, useEffect } from 'react';

const mockApiClient = {
  guests: [
    { id: 'g1', name: 'Alice Smith', status: 'confirmed', notes: 'VIP' },
    { id: 'g2', name: 'Bob Johnson', status: 'pending', notes: 'Standard' },
  ],
  fetchGuests: async () => {
    return new Promise(resolve => setTimeout(() => resolve(mockApiClient.guests), 500));
  },
  addGuest: async (newGuest: Omit<Guest, 'id' | 'status'>) => {
    return new Promise(resolve => setTimeout(() => {
      const guestWithId = { ...newGuest, id: \`g\${mockApiClient.guests.length + 1}\`, status: 'pending' };
      mockApiClient.guests.push(guestWithId);
      resolve(guestWithId);
    }, 500));
  },
};

interface Guest {
  id: string;
  name: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string;
}

interface NewGuestFormData {
  name: string;
  notes: string;
}

type ViewMode = 'list' | 'create';

function GuestManager() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newGuestData, setNewGuestData] = useState<NewGuestFormData>({ name: '', notes: '' });
  const [viewMode, setViewMode] = useState<ViewMode>('list'); // 'list' or 'create'

  return (
    <div className="guest-manager">
      <h1>Guest Management</h1>
      {/* Add conditional rendering for list view and create form view here. */}
      {/* Include basic structure for loading, error, and empty states. */}
    </div>
  );
}`,
    feedback_correct: "Excellent! You've correctly structured the UI with conditional rendering for the list and form, including loading, error, and empty states.",
    feedback_partial: "You've started the structure, but ensure you're using conditional rendering (`&&`) to switch between the list and form views. Also, don't forget to include placeholders for loading, error, and empty states.",
    feedback_wrong: "Using `if/else` directly inside JSX is not valid React syntax. React uses JavaScript expressions like the `&&` operator or ternary operator (`? :`) for conditional rendering within JSX.",
    expected: `import React, { useState, useEffect } from 'react';

const mockApiClient = {
  guests: [
    { id: 'g1', name: 'Alice Smith', status: 'confirmed', notes: 'VIP' },
    { id: 'g2', name: 'Bob Johnson', status: 'pending', notes: 'Standard' },
  ],
  fetchGuests: async () => {
    return new Promise(resolve => setTimeout(() => resolve(mockApiClient.guests), 500));
  },
  addGuest: async (newGuest: Omit<Guest, 'id' | 'status'>) => {
    return new Promise(resolve => setTimeout(() => {
      const guestWithId = { ...newGuest, id: \`g\${mockApiClient.guests.length + 1}\`, status: 'pending' };
      mockApiClient.guests.push(guestWithId);
      resolve(guestWithId);
    }, 500));
  },
};

interface Guest {
  id: string;
  name: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string;
}

interface NewGuestFormData {
  name: string;
  notes: string;
}

type ViewMode = 'list' | 'create';

function GuestManager() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newGuestData, setNewGuestData] = useState<NewGuestFormData>({ name: '', notes: '' });
  const [viewMode, setViewMode] = useState<ViewMode>('list'); // 'list' or 'create'

  return (
    <div className="guest-manager">
      <h1>Guest Management</h1>

      {viewMode === 'list' && (
        <div className="guest-list-view">
          <button className="add-guest-button">Add New Guest</button>
          {loading && <p>Loading guests...</p>}
          {error && <p className="error-message">Error: {error}</p>}
          {!loading && !error && guests.length === 0 && (
            <p>No guests found. Click "Add New Guest" to create one.</p>
          )}
          {!loading && !error && guests.length > 0 && (
            <ul className="guest-list">
              {guests.map(guest => (
                <li key={guest.id} className="guest-item">
                  <span className="guest-name">{guest.name}</span>
                  <span className={\`guest-status status-\\\${guest.status}\`}>{guest.status}</span>
                  <span className="guest-notes">{guest.notes}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {viewMode === 'create' && (
        <div className="guest-create-form">
          <h2>Create New Guest</h2>
          <form>
            <div className="form-field">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={newGuestData.name}
              />
            </div>
            <div className="form-field">
              <label htmlFor="notes">Notes:</label>
              <textarea
                id="notes"
                name="notes"
                value={newGuestData.notes}
              ></textarea>
            </div>
            <button type="submit" className="submit-button">Add Guest</button>
            <button type="button" className="cancel-button">Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
}`,
    analog_example: `import { useState } from 'react';

type DisplayMode = 'summary' | 'detail';

function ProductViewer() {
  const [mode, setMode] = useState<DisplayMode>('summary');
  const [productData, setProductData] = useState({ name: 'Gizmo', price: 19.99, description: 'A useful gadget.' });
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="product-viewer">
      {isLoading && <p>Loading product details...</p>}
      {!isLoading && (
        <>
          <button onClick={() => setMode('summary')}>Summary</button>
          <button onClick={() => setMode('detail')}>Details</button>

          {mode === 'summary' && (
            <div className="product-summary">
              <h3>{productData.name}</h3>
              <p>Price: \${productData.price}</p>
            </div>
          )}

          {mode === 'detail' && (
            <div className="product-detail">
              <h3>{productData.name}</h3>
              <p>Price: \${productData.price}</p>
              <p>Description: {productData.description}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}`,
    deepDiveLabel: "How does conditional rendering improve UI?",
    deepDive: {
      hook: `A user interface is rarely a single, static screen. It needs to adapt, showing different content based on application state, user actions, or data availability. Imagine a website where the "login" form is always visible even after you've logged in, or a shopping cart that shows "Your cart is empty" even when it contains items. This is where conditional rendering becomes crucial. Without it, your UI would be cluttered, confusing, and unable to provide a tailored experience. Conditional rendering allows you to dynamically decide *what* to show and *when*, ensuring that users only see relevant information and interactive elements, leading to a much cleaner and more intuitive application flow.`,
      pain: `⚠️ **Lesson:** Without conditional rendering, the UI displays irrelevant or incorrect information. Symptom: Multiple views are visible simultaneously, or placeholder messages persist even when data is available. This indicates that the component is not dynamically adjusting its output based on the current state.`,
      mentalModel: `**Mental model:** The "Stage Manager." Think of your component's \`return\` statement as a stage where different scenes can be displayed. Conditional rendering is like a stage manager who decides which props and backdrops are visible at any given moment. If the \`viewMode\` is 'list', the stage manager brings out the 'list' backdrop and props. If \`viewMode\` is 'create', they swap it for the 'create form' scene. This manager also handles smaller details, like showing a "Loading..." sign only when the data isn't ready, or an "Error!" banner if something goes wrong. The stage manager ensures that only one coherent scene is presented to the audience (the user) at a time, creating a smooth and logical narrative.`,
      discover: `\`\`\`tsx
{isLoading && <p>Loading...</p>} {/* Renders if isLoading is true */}

{error ? ( // Ternary operator for if/else
  <p className="error">{error}</p>
) : (
  <p>Data loaded successfully.</p>
)}

{viewMode === 'list' && ( // Conditional rendering for specific view
  <ListView />
)}

{viewMode === 'create' && (
  <CreateForm />
)}
\`\`\`
- \`{viewMode === 'list' && (...) }\` uses the logical AND (\`&&\`) operator to conditionally render the list view only when \`viewMode\` is \`'list'\`.
- \`{loading && <p>Loading guests...</p>}\` displays a loading message only when \`loading\` is \`true\`.
- \`{!loading && !error && guests.length === 0 && (...) }\` combines multiple conditions to show an "empty state" message.
- The \`form\` element contains \`label\`, \`input\`, and \`textarea\` elements, with \`value\` attributes for controlled components (though not yet wired to state).`,
      quickRules: `**Quick rules:**
- ✅ Use the logical \`&&\` operator for simple "if this, then render that" conditions.
- ✅ Use the ternary operator (\`condition ? trueRender : falseRender\`) for "if/else" scenarios.
- ✅ Employ multiple \`&&\` conditions to handle complex states like loading, error, and empty data.
- ✅ Structure your JSX clearly with semantic HTML elements (\`ul\`, \`li\`, \`form\`, \`label\`, \`input\`).
- ❌ Avoid deeply nested conditional rendering; consider breaking out complex logic into smaller components or helper functions.
- ❌ Do not put side effects (like API calls) directly inside JSX conditionals; use \`useEffect\` for that.
- ❌ Never use \`if/else\` *inside* the JSX return block; use JavaScript expressions like \`&&\` or \`? :\`.`,
      watchOut: `👀 **Watch out:** When using the \`&&\` operator, if the left-hand side evaluates to \`0\`, React will render \`0\` to the DOM, which can be unexpected. For example, \`guests.length && <p>You have {guests.length} guests</p>\` will render \`0\` if \`guests.length\` is \`0\`. To avoid this, explicitly check \`guests.length > 0\` or cast to a boolean: \`!!guests.length && ...\`.`,
      dryRun: `🔁 **Think:**
1.  **Initial render:** \`loading\` is \`true\`, \`error\` is \`null\`, \`guests\` is \`[]\`, \`viewMode\` is \`'list'\`.
    *   \`viewMode === 'list'\` is \`true\`, so the list view \`div\` is considered.
    *   Inside list view: \`loading && <p>Loading...</p>\` evaluates to \`true && <p>Loading...</p>\`, so "Loading guests..." is rendered.
    *   Other conditions (\`error\`, \`guests.length === 0\`) are \`false\` or short-circuited by \`loading\`.
2.  **After data fetches:** \`loading\` becomes \`false\`, \`guests\` becomes \`[{...}, {...}]\`. \`error\` remains \`null\`. \`viewMode\` is still \`'list'\`.
    *   \`viewMode === 'list'\` is \`true\`.
    *   Inside list view: \`loading && <p>Loading...</p>\` is \`false && ...\`, so nothing is rendered.
    *   \`error && ...\` is \`false && ...\`, so nothing is rendered.
    *   \`!loading && !error && guests.length === 0\` is \`true && true && false\`, so nothing is rendered.
    *   \`!loading && !error && guests.length > 0\` is \`true && true && true\`, so the \`ul\` with guest items is rendered.
(Hint: Conditional rendering dynamically selects which JSX elements to display based on state.)`,
      build: "Building the structural skeleton with conditional rendering allows the `GuestManager` to display the appropriate UI (loading, error, empty state, guest list, or create form) based on the current application state.",
    },
  },
  {
    id: "step6",
    type: "question",
    phase: "Step 6 of 7",
    paal: "Now, implement the core logic: a `useEffect` hook to fetch guests on component mount, `handleInputChange` for form fields, `handleSubmit` for form submission, and `handleViewChange` to switch between list and create views.",
    hint: "Use an empty dependency array for `useEffect` to run once. `handleInputChange` should update `newGuestData` dynamically. `handleSubmit` needs to prevent default behavior, call the API, and update state. `handleViewChange` updates `viewMode` and resets form data.",
    example_code: `useEffect(() => {
  // fetch data
}, []);

const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

const onSubmit = (e) => {
  e.preventDefault();
  // submit data
};`,
    think_prompt: "How do you fetch data once when a component loads, manage input changes in a form, handle form submission to an API, and switch between different UI views?",
    mc_options: [
      "Put `fetchGuests()` directly in the component body; use separate `useState` for each input; use `window.location.reload()` after submit.",
      "Use `useEffect` with an empty dependency array for `fetchGuests`; create `handleInputChange` to update `newGuestData` using `e.target.name`; implement `handleSubmit` to call `e.preventDefault()`, `mockApiClient.addGuest()`, and then `fetchGuests()` again; create `handleViewChange` to update `viewMode`.",
      "Use a class component's `componentDidMount` for fetching; use `document.getElementById()` to get input values; use a simple `button` click for submission without preventing default.",
    ],
    mc_correct_option: "Use `useEffect` with an empty dependency array for `fetchGuests`; create `handleInputChange` to update `newGuestData` using `e.target.name`; implement `handleSubmit` to call `e.preventDefault()`, `mockApiClient.addGuest()`, and then `fetchGuests()` again; create `handleViewChange` to update `viewMode`.",
    mc_anchor: "This option correctly outlines the modern React patterns for data fetching (`useEffect`), controlled form inputs (`handleInputChange`), API interaction (`handleSubmit` with `e.preventDefault()`), and UI navigation (`handleViewChange`).",
    why_this_matters: "These handlers and effects are the backbone of interactive applications. They enable your component to respond to the environment (API data), user input, and internal state changes, making the application dynamic, functional, and user-friendly. Without them, your UI would be static and unresponsive.",
    answer_keywords: ["useEffect", "handleInputChange", "handleSubmit", "handleViewChange", "API call", "form submission"],
    seed_code: `import React, { useState, useEffect } from 'react';

const mockApiClient = {
  guests: [
    { id: 'g1', name: 'Alice Smith', status: 'confirmed', notes: 'VIP' },
    { id: 'g2', name: 'Bob Johnson', status: 'pending', notes: 'Standard' },
  ],
  fetchGuests: async () => {
    return new Promise(resolve => setTimeout(() => resolve(mockApiClient.guests), 500));
  },
  addGuest: async (newGuest: Omit<Guest, 'id' | 'status'>) => {
    return new Promise(resolve => setTimeout(() => {
      const guestWithId = { ...newGuest, id: \`g\${mockApiClient.guests.length + 1}\`, status: 'pending' };
      mockApiClient.guests.push(guestWithId);
      resolve(guestWithId);
    }, 500));
  },
};

interface Guest {
  id: string;
  name: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string;
}

interface NewGuestFormData {
  name: string;
  notes: string;
}

type ViewMode = 'list' | 'create';

function GuestManager() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newGuestData, setNewGuestData] = useState<NewGuestFormData>({ name: '', notes: '' });
  const [viewMode, setViewMode] = useState<ViewMode>('list'); // 'list' or 'create'

  return (
    <div className="guest-manager">
      <h1>Guest Management</h1>

      {viewMode === 'list' && (
        <div className="guest-list-view">
          <button className="add-guest-button">Add New Guest</button>
          {loading && <p>Loading guests...</p>}
          {error && <p className="error-message">Error: {error}</p>}
          {!loading && !error && guests.length === 0 && (
            <p>No guests found. Click "Add New Guest" to create one.</p>
          )}
          {!loading && !error && guests.length > 0 && (
            <ul className="guest-list">
              {guests.map(guest => (
                <li key={guest.id} className="guest-item">
                  <span className="guest-name">{guest.name}</span>
                  <span className={\`guest-status status-\\\${guest.status}\`}>{guest.status}</span>
                  <span className="guest-notes">{guest.notes}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {viewMode === 'create' && (
        <div className="guest-create-form">
          <h2>Create New Guest</h2>
          <form>
            <div className="form-field">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={newGuestData.name}
              />
            </div>
            <div className="form-field">
              <label htmlFor="notes">Notes:</label>
              <textarea
                id="notes"
                name="notes"
                value={newGuestData.notes}
              ></textarea>
            </div>
            <button type="submit" className="submit-button">Add Guest</button>
            <button type="button" className="cancel-button">Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
}`,
    starter_code: `import React, { useState, useEffect } from 'react';

const mockApiClient = {
  guests: [
    { id: 'g1', name: 'Alice Smith', status: 'confirmed', notes: 'VIP' },
    { id: 'g2', name: 'Bob Johnson', status: 'pending', notes: 'Standard' },
  ],
  fetchGuests: async () => {
    return new Promise(resolve => setTimeout(() => resolve(mockApiClient.guests), 500));
  },
  addGuest: async (newGuest: Omit<Guest, 'id' | 'status'>) => {
    return new Promise(resolve => setTimeout(() => {
      const guestWithId = { ...newGuest, id: \`g\${mockApiClient.guests.length + 1}\`, status: 'pending' };
      mockApiClient.guests.push(guestWithId);
      resolve(guestWithId);
    }, 500));
  },
};

interface Guest {
  id: string;
  name: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string;
}

interface NewGuestFormData {
  name: string;
  notes: string;
}

type ViewMode = 'list' | 'create';

function GuestManager() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newGuestData, setNewGuestData] = useState<NewGuestFormData>({ name: '', notes: '' });
  const [viewMode, setViewMode] = useState<ViewMode>('list'); // 'list' or 'create'

  // Add useEffect for fetching guests and handler functions for form input, submission, and view changes here.

  return (
    <div className="guest-manager">
      <h1>Guest Management</h1>

      {viewMode === 'list' && (
        <div className="guest-list-view">
          <button className="add-guest-button">Add New Guest</button>
          {loading && <p>Loading guests...</p>}
          {error && <p className="error-message">Error: {error}</p>}
          {!loading && !error && guests.length === 0 && (
            <p>No guests found. Click "Add New Guest" to create one.</p>
          )}
          {!loading && !error && guests.length > 0 && (
            <ul className="guest-list">
              {guests.map(guest => (
                <li key={guest.id} className="guest-item">
                  <span className="guest-name">{guest.name}</span>
                  <span className={\`guest-status status-\\\${guest.status}\`}>{guest.status}</span>
                  <span className="guest-notes">{guest.notes}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {viewMode === 'create' && (
        <div className="guest-create-form">
          <h2>Create New Guest</h2>
          <form>
            <div className="form-field">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={newGuestData.name}
              />
            </div>
            <div className="form-field">
              <label htmlFor="notes">Notes:</label>
              <textarea
                id="notes"
                name="notes"
                value={newGuestData.notes}
              ></textarea>
            </div>
            <button type="submit" className="submit-button">Add Guest</button>
            <button type="button" className="cancel-button">Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
}`,
    feedback_correct: "Fantastic! You've implemented all the necessary logic for data fetching, form input, submission, and view switching. This is the core functionality.",
    feedback_partial: "You've made good progress on the logic. Double-check that your `useEffect` has an empty dependency array, `handleInputChange` updates the correct state, and `handleSubmit` prevents default behavior and re-fetches data.",
    feedback_wrong: "Relying on direct DOM manipulation or ignoring `e.preventDefault()` for forms will lead to an unresponsive and buggy application. Focus on using React's `useState` and `useEffect` for managing state and side effects.",
    expected: `import React, { useState, useEffect } from 'react';

const mockApiClient = {
  guests: [
    { id: 'g1', name: 'Alice Smith', status: 'confirmed', notes: 'VIP' },
    { id: 'g2', name: 'Bob Johnson', status: 'pending', notes: 'Standard' },
  ],
  fetchGuests: async () => {
    return new Promise(resolve => setTimeout(() => resolve(mockApiClient.guests), 500));
  },
  addGuest: async (newGuest: Omit<Guest, 'id' | 'status'>) => {
    return new Promise(resolve => setTimeout(() => {
      const guestWithId = { ...newGuest, id: \`g\${mockApiClient.guests.length + 1}\`, status: 'pending' };
      mockApiClient.guests.push(guestWithId);
      resolve(guestWithId);
    }, 500));
  },
};

interface Guest {
  id: string;
  name: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string;
}

interface NewGuestFormData {
  name: string;
  notes: string;
}

type ViewMode = 'list' | 'create';

function GuestManager() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newGuestData, setNewGuestData] = useState<NewGuestFormData>({ name: '', notes: '' });
  const [viewMode, setViewMode] = useState<ViewMode>('list'); // 'list' or 'create'

  const fetchGuests = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedGuests = await mockApiClient.fetchGuests();
      setGuests(fetchedGuests);
    } catch (err) {
      setError('Failed to fetch guests.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []); // Empty dependency array means this runs once on mount

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewGuestData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior

    if (!newGuestData.name.trim()) {
      alert('Guest name cannot be empty.');
      return;
    }

    setLoading(true); // Indicate that we are submitting
    setError(null);
    try {
      await mockApiClient.addGuest(newGuestData);
      setNewGuestData({ name: '', notes: '' }); // Clear form
      setViewMode('list'); // Go back to list view
      await fetchGuests(); // Re-fetch guests to show the new one
    } catch (err) {
      setError('Failed to add guest.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    if (mode === 'create') {
      setNewGuestData({ name: '', notes: '' }); // Reset form when switching to create view
    }
  };

  return (
    <div className="guest-manager">
      <h1>Guest Management</h1>

      {viewMode === 'list' && (
        <div className="guest-list-view">
          <button className="add-guest-button">Add New Guest</button>
          {loading && <p>Loading guests...</p>}
          {error && <p className="error-message">Error: {error}</p>}
          {!loading && !error && guests.length === 0 && (
            <p>No guests found. Click "Add New Guest" to create one.</p>
          )}
          {!loading && !error && guests.length > 0 && (
            <ul className="guest-list">
              {guests.map(guest => (
                <li key={guest.id} className="guest-item">
                  <span className="guest-name">{guest.name}</span>
                  <span className={\`guest-status status-\\\${guest.status}\`}>{guest.status}</span>
                  <span className="guest-notes">{guest.notes}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {viewMode === 'create' && (
        <div className="guest-create-form">
          <h2>Create New Guest</h2>
          <form>
            <div className="form-field">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={newGuestData.name}
              />
            </div>
            <div className="form-field">
              <label htmlFor="notes">Notes:</label>
              <textarea
                id="notes"
                name="notes"
                value={newGuestData.notes}
              ></textarea>
            </div>
            <button type="submit" className="submit-button">Add Guest</button>
            <button type="button" className="cancel-button">Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
}`,
    analog_example: `import { useState, useEffect } from 'react';

interface Todo {
  id: string;
  text: string;
  isComplete: boolean;
}

const todoApi = {
  todos: [{ id: 't1', text: 'Learn React', isComplete: false }],
  fetchTodos: async () => new Promise<Todo[]>(res => setTimeout(() => res(todoApi.todos), 300)),
  addTodo: async (text: string) => new Promise<Todo>(res => setTimeout(() => {
    const newTodo = { id: \`t\${todoApi.todos.length + 1}\`, text, isComplete: false };
    todoApi.todos.push(newTodo);
    res(newTodo);
  }, 300)),
};

function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadTodos = async () => {
    setIsLoading(true);
    const fetchedTodos = await todoApi.fetchTodos();
    setTodos(fetchedTodos);
    setIsLoading(false);
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTodoText(e.target.value);
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    setIsLoading(true);
    await todoApi.addTodo(newTodoText);
    setNewTodoText('');
    await loadTodos(); // Refresh the list
  };

  return (
    <div>
      <h2>My Todos</h2>
      {isLoading && <p>Loading todos...</p>}
      <form onSubmit={handleAddTodo}>
        <input type="text" value={newTodoText} onChange={handleTextChange} placeholder="New todo" />
        <button type="submit">Add</button>
      </form>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>{todo.text} {todo.isComplete ? '(Done)' : ''}</li>
        ))}
      </ul>
    </div>
  );
}`,
    deepDiveLabel: "How do `useEffect` and event handlers manage component behavior?",
    deepDive: {
      hook: `A static UI is rarely useful. Applications need to perform actions: fetch data from a server, respond to user input, or submit forms. These actions are handled by "logic" – functions that encapsulate specific behaviors. Without this logic, your application would be a beautiful but inert picture. \`useEffect\` allows you to perform "side effects" like data fetching when a component mounts or updates. Event handlers like \`handleInputChange\` and \`handleSubmit\` are the bridges between user interaction and your application's state and API. Neglecting to implement these handlers means your application cannot communicate with its backend, process user input, or update its display dynamically, leaving users with a frustrating and unresponsive experience.`,
      pain: `⚠️ **Lesson:** Lack of event handlers and side effect management leads to unresponsive UIs and failure to interact with external systems. Symptom: Buttons do nothing, form inputs don't update, or data never appears from the API. This indicates that the necessary functions to respond to events or manage side effects are missing or incorrectly implemented.`,
      mentalModel: `**Mental model:** The "Component's Control Panel." Imagine your component has a control panel with various buttons and levers. \`useEffect\` is like a set of automated routines that run when the component is first powered on (mounts) or when certain conditions change (dependencies update). For example, "when the component starts, fetch the guest list." Event handlers like \`handleSubmit\` or \`handleInputChange\` are the actual buttons and levers that a user can press. When a user types in a field, \`handleInputChange\` is triggered, updating the component's internal state. When they click "Add Guest," \`handleSubmit\` is activated, sending data to the API. This control panel allows the component to manage its internal state, react to external stimuli, and interact with the outside world (like an API).`,
      discover: `\`\`\`tsx
useEffect(() => {
  // This runs once on mount (empty dependency array)
  const fetchData = async () => { /* ... */ };
  fetchData();
}, []);

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  // Update state based on input change
  setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault(); // Crucial for forms
  // Perform API call, update state, etc.
};
\`\`\`
- \`useEffect(() => { fetchGuests(); }, []);\` calls \`fetchGuests\` once when the component mounts, thanks to the empty dependency array.
- \`fetchGuests\` is an \`async\` function that handles API calls, setting \`loading\` and \`error\` states appropriately.
- \`handleInputChange\` updates the \`newGuestData\` state as the user types, using the \`name\` attribute of the input to dynamically update the correct field.
- \`handleSubmit\` prevents the default form submission, performs validation, calls the API, clears the form, switches the view, and re-fetches the guest list.
- \`handleViewChange\` updates the \`viewMode\` state and resets \`newGuestData\` when switching to the 'create' view.`,
      quickRules: `**Quick rules:**
- ✅ Use \`useEffect\` for side effects like data fetching, subscriptions, or manually changing the DOM.
- ✅ Always include a dependency array in \`useEffect\` to control when the effect re-runs. An empty array \`[]\` means "run once on mount."
- ✅ For form inputs, use a single \`handleInputChange\` function that updates state based on \`e.target.name\` and \`e.target.value\`.
- ✅ Always call \`e.preventDefault()\` inside form submission handlers to stop the browser's default refresh behavior.
- ❌ Never perform API calls directly in the component's render body; use \`useEffect\`.
- ❌ Avoid creating infinite loops in \`useEffect\` by carefully managing dependencies (e.g., don't put \`setGuests\` in a dependency array if \`setGuests\` is called inside the effect).
- ❌ Do not forget \`e.preventDefault()\` for form submissions; it's a very common bug source.`,
      watchOut: `👀 **Watch out:** Forgetting the dependency array in \`useEffect\` will cause the effect to run on *every* render, potentially leading to infinite loops (e.g., fetching data, updating state, re-rendering, fetching data again). An empty array \`[]\` means "run once and clean up on unmount." Also, when updating state based on previous state (like \`setNewGuestData(prevData => ({ ...prevData, ... }))\`), always use the functional update form to avoid stale closures.`,
      dryRun: `🔁 **Think:**
1.  **Component mounts:** \`useEffect\` runs. \`fetchGuests()\` is called.
    *   \`setLoading(true)\`: \`loading\` becomes \`true\`. UI shows "Loading guests...".
    *   \`mockApiClient.fetchGuests()\` resolves.
    *   \`setGuests([...])\`: \`guests\` state is updated with fetched data.
    *   \`setLoading(false)\`: \`loading\` becomes \`false\`. UI hides "Loading guests..." and shows the guest list.
2.  **User clicks "Add New Guest" button:** \`handleViewChange('create')\` is called.
    *   \`setViewMode('create')\`: \`viewMode\` changes to \`'create'\`. UI switches to the create form.
    *   \`setNewGuestData({ name: '', notes: '' })\`: Form fields are cleared.
3.  **User types "John Doe" into Name field:** \`handleInputChange\` is called.
    *   \`setNewGuestData(prev => ({ ...prev, name: 'John Doe' }))\`: \`newGuestData.name\` becomes \`'John Doe'\`. The input field displays "John Doe".
4.  **User clicks "Add Guest" (submit) button:** \`handleSubmit\` is called.
    *   \`e.preventDefault()\` prevents page refresh.
    *   \`setLoading(true)\`: UI might show a submission indicator.
    *   \`mockApiClient.addGuest(newGuestData)\` is called.
    *   API resolves.
    *   \`setNewGuestData({ name: '', notes: '' })\`: Form fields are cleared.
    *   \`setViewMode('list')\`: UI switches back to the list view.
    *   \`fetchGuests()\` is called again to get the updated list.
    *   \`setLoading(false)\`: Submission indicator is hidden.
(Hint: Handlers orchestrate state changes and API interactions in response to events.)`,
      build: "Implementing `useEffect` for initial data fetching and creating handler functions for form input, submission, and view changes provides the core logic that makes the `GuestManager` interactive and capable of communicating with the API.",
    },
  },
  {
    id: "step7",
    type: "question",
    phase: "Step 7 of 7",
    paal: "Finally, wire the event handlers to the corresponding JSX elements. Connect the 'Add New Guest' button to `handleViewChange`, the form's `onSubmit` to `handleSubmit`, and the input/textarea `onChange` to `handleInputChange`. Also, disable buttons during loading states.",
    hint: "Use `onClick` for buttons, `onSubmit` for the form, and `onChange` for inputs. Remember to pass arguments to `handleViewChange` using an arrow function.",
    example_code: `<button onClick={() => handleClick('arg')}>Click</button>
<form onSubmit={handleSubmit}>
  <input value={stateValue} onChange={handleInputChange} />
</form>
<button disabled={isSubmitting}>Submit</button>`,
    think_prompt: "How do you connect user interactions (clicks, typing, form submission) to the JavaScript functions you've created, and how can you provide visual feedback during asynchronous operations?",
    mc_options: [
      "Use `id` attributes to call functions directly from HTML.",
      "Assign `onClick={handleViewChange('create')}` to the button, `onSubmit={handleSubmit()}` to the form, and `onChange={handleInputChange()}` to inputs.",
      "Assign `onClick={() => handleViewChange('create')}` to the 'Add New Guest' button, `onSubmit={handleSubmit}` to the form, `onChange={handleInputChange}` to inputs/textareas, and use `disabled={loading}` on relevant buttons.",
    ],
    mc_correct_option: "Assign `onClick={() => handleViewChange('create')}` to the 'Add New Guest' button, `onSubmit={handleSubmit}` to the form, `onChange={handleInputChange}` to inputs/textareas, and use `disabled={loading}` on relevant buttons.",
    mc_anchor: "This option correctly demonstrates how to wire event handlers in React, including passing arguments to functions and disabling UI elements during loading states for better user experience.",
    why_this_matters: "Wiring the UI to its logic is what makes an application interactive. Without these connections, your carefully crafted components and logic remain inert. Properly wiring ensures that user actions trigger the correct responses, providing a seamless and functional experience.",
    answer_keywords: ["event handlers", "onClick", "onSubmit", "onChange", "disabled", "wiring UI"],
    seed_code: `import React, { useState, useEffect } from 'react';

const mockApiClient = {
  guests: [
    { id: 'g1', name: 'Alice Smith', status: 'confirmed', notes: 'VIP' },
    { id: 'g2', name: 'Bob Johnson', status: 'pending', notes: 'Standard' },
  ],
  fetchGuests: async () => {
    return new Promise(resolve => setTimeout(() => resolve(mockApiClient.guests), 500));
  },
  addGuest: async (newGuest: Omit<Guest, 'id' | 'status'>) => {
    return new Promise(resolve => setTimeout(() => {
      const guestWithId = { ...newGuest, id: \`g\${mockApiClient.guests.length + 1}\`, status: 'pending' };
      mockApiClient.guests.push(guestWithId);
      resolve(guestWithId);
    }, 500));
  },
};

interface Guest {
  id: string;
  name: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string;
}

interface NewGuestFormData {
  name: string;
  notes: string;
}

type ViewMode = 'list' | 'create';

function GuestManager() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newGuestData, setNewGuestData] = useState<NewGuestFormData>({ name: '', notes: '' });
  const [viewMode, setViewMode] = useState<ViewMode>('list'); // 'list' or 'create'

  const fetchGuests = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedGuests = await mockApiClient.fetchGuests();
      setGuests(fetchedGuests);
    } catch (err) {
      setError('Failed to fetch guests.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []); // Empty dependency array means this runs once on mount

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewGuestData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior

    if (!newGuestData.name.trim()) {
      alert('Guest name cannot be empty.');
      return;
    }

    setLoading(true); // Indicate that we are submitting
    setError(null);
    try {
      await mockApiClient.addGuest(newGuestData);
      setNewGuestData({ name: '', notes: '' }); // Clear form
      setViewMode('list'); // Go back to list view
      await fetchGuests(); // Re-fetch guests to show the new one
    } catch (err) {
      setError('Failed to add guest.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    if (mode === 'create') {
      setNewGuestData({ name: '', notes: '' }); // Reset form when switching to create view
    }
  };

  return (
    <div className="guest-manager">
      <h1>Guest Management</h1>

      {viewMode === 'list' && (
        <div className="guest-list-view">
          <button className="add-guest-button">Add New Guest</button>
          {loading && <p>Loading guests...</p>}
          {error && <p className="error-message">Error: {error}</p>}
          {!loading && !error && guests.length === 0 && (
            <p>No guests found. Click "Add New Guest" to create one.</p>
          )}
          {!loading && !error && guests.length > 0 && (
            <ul className="guest-list">
              {guests.map(guest => (
                <li key={guest.id} className="guest-item">
                  <span className="guest-name">{guest.name}</span>
                  <span className={\`guest-status status-\\\${guest.status}\`}>{guest.status}</span>
                  <span className="guest-notes">{guest.notes}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {viewMode === 'create' && (
        <div className="guest-create-form">
          <h2>Create New Guest</h2>
          <form>
            <div className="form-field">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={newGuestData.name}
              />
            </div>
            <div className="form-field">
              <label htmlFor="notes">Notes:</label>
              <textarea
                id="notes"
                name="notes"
                value={newGuestData.notes}
              ></textarea>
            </div>
            <button type="submit" className="submit-button">Add Guest</button>
            <button type="button" className="cancel-button">Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
}`,
    starter_code: `import React, { useState, useEffect } from 'react';

const mockApiClient = {
  guests: [
    { id: 'g1', name: 'Alice Smith', status: 'confirmed', notes: 'VIP' },
    { id: 'g2', name: 'Bob Johnson', status: 'pending', notes: 'Standard' },
  ],
  fetchGuests: async () => {
    return new Promise(resolve => setTimeout(() => resolve(mockApiClient.guests), 500));
  },
  addGuest: async (newGuest: Omit<Guest, 'id' | 'status'>) => {
    return new Promise(resolve => setTimeout(() => {
      const guestWithId = { ...newGuest, id: \`g\${mockApiClient.guests.length + 1}\`, status: 'pending' };
      mockApiClient.guests.push(guestWithId);
      resolve(guestWithId);
    }, 500));
  },
};

interface Guest {
  id: string;
  name: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string;
}

interface NewGuestFormData {
  name: string;
  notes: string;
}

type ViewMode = 'list' | 'create';

function GuestManager() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newGuestData, setNewGuestData] = useState<NewGuestFormData>({ name: '', notes: '' });
  const [viewMode, setViewMode] = useState<ViewMode>('list'); // 'list' or 'create'

  const fetchGuests = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedGuests = await mockApiClient.fetchGuests();
      setGuests(fetchedGuests);
    } catch (err) {
      setError('Failed to fetch guests.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []); // Empty dependency array means this runs once on mount

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewGuestData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior

    if (!newGuestData.name.trim()) {
      alert('Guest name cannot be empty.');
      return;
    }

    setLoading(true); // Indicate that we are submitting
    setError(null);
    try {
      await mockApiClient.addGuest(newGuestData);
      setNewGuestData({ name: '', notes: '' }); // Clear form
      setViewMode('list'); // Go back to list view
      await fetchGuests(); // Re-fetch guests to show the new one
    } catch (err) {
      setError('Failed to add guest.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    if (mode === 'create') {
      setNewGuestData({ name: '', notes: '' }); // Reset form when switching to create view
    }
  };

  return (
    <div className="guest-manager">
      <h1>Guest Management</h1>

      {viewMode === 'list' && (
        <div className="guest-list-view">
          {/* Wire the "Add New Guest" button to change the view mode */}
          <button className="add-guest-button">Add New Guest</button>
          {loading && <p>Loading guests...</p>}
          {error && <p className="error-message">Error: {error}</p>}
          {!loading && !error && guests.length === 0 && (
            <p>No guests found. Click "Add New Guest" to create one.</p>
          )}
          {!loading && !error && guests.length > 0 && (
            <ul className="guest-list">
              {guests.map(guest => (
                <li key={guest.id} className="guest-item">
                  <span className="guest-name">{guest.name}</span>
                  <span className={\`guest-status status-\\\${guest.status}\`}>{guest.status}</span>
                  <span className="guest-notes">{guest.notes}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {viewMode === 'create' && (
        <div className="guest-create-form">
          <h2>Create New Guest</h2>
          {/* Wire the form's onSubmit, input's onChange, and cancel button's onClick */}
          <form>
            <div className="form-field">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={newGuestData.name}
              />
            </div>
            <div className="form-field">
              <label htmlFor="notes">Notes:</label>
              <textarea
                id="notes"
                name="notes"
                value={newGuestData.notes}
              ></textarea>
            </div>
            <button type="submit" className="submit-button">Add Guest</button>
            <button type="button" className="cancel-button">Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
}`,
    feedback_correct: "Fantastic! All your event handlers are now correctly wired to the UI elements, and buttons are disabled during loading, making the application fully interactive and user-friendly.",
    feedback_partial: "You've wired some elements, but double-check that all inputs have `onChange`, the form has `onSubmit`, and the 'Add New Guest' and 'Cancel' buttons correctly call `handleViewChange`. Also, remember to disable buttons during loading.",
    feedback_wrong: "Calling functions directly in JSX (e.g., `handleSubmit()`) will execute them immediately on render, not on event. You need to pass a function reference or an arrow function that calls your handler.",
    expected: `import React, { useState, useEffect } from 'react';

const mockApiClient = {
  guests: [
    { id: 'g1', name: 'Alice Smith', status: 'confirmed', notes: 'VIP' },
    { id: 'g2', name: 'Bob Johnson', status: 'pending', notes: 'Standard' },
  ],
  fetchGuests: async () => {
    return new Promise(resolve => setTimeout(() => resolve(mockApiClient.guests), 500));
  },
  addGuest: async (newGuest: Omit<Guest, 'id' | 'status'>) => {
    return new Promise(resolve => setTimeout(() => {
      const guestWithId = { ...newGuest, id: \`g\${mockApiClient.guests.length + 1}\`, status: 'pending' };
      mockApiClient.guests.push(guestWithId);
      resolve(guestWithId);
    }, 500));
  },
};

interface Guest {
  id: string;
  name: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string;
}

interface NewGuestFormData {
  name: string;
  notes: string;
}

type ViewMode = 'list' | 'create';

function GuestManager() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newGuestData, setNewGuestData] = useState<NewGuestFormData>({ name: '', notes: '' });
  const [viewMode, setViewMode] = useState<ViewMode>('list'); // 'list' or 'create'

  const fetchGuests = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedGuests = await mockApiClient.fetchGuests();
      setGuests(fetchedGuests);
    } catch (err) {
      setError('Failed to fetch guests.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []); // Empty dependency array means this runs once on mount

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewGuestData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior

    if (!newGuestData.name.trim()) {
      alert('Guest name cannot be empty.');
      return;
    }

    setLoading(true); // Indicate that we are submitting
    setError(null);
    try {
      await mockApiClient.addGuest(newGuestData);
      setNewGuestData({ name: '', notes: '' }); // Clear form
      setViewMode('list'); // Go back to list view
      await fetchGuests(); // Re-fetch guests to show the new one
    } catch (err) {
      setError('Failed to add guest.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = (mode: ViewMode) => {
  setViewMode(mode);
    if (mode === 'create') {
      setNewGuestData({ name: '', notes: '' }); // Reset form when switching to create view
    }
  };

  return (
    <div className="guest-manager">
      <h1>Guest Management</h1>

      {viewMode === 'list' && (
        <div className="guest-list-view">
          <button className="add-guest-button" onClick={() => handleViewChange('create')}>Add New Guest</button>
          {loading && <p>Loading guests...</p>}
          {error && <p className="error-message">Error: {error}</p>}
          {!loading && !error && guests.length === 0 && (
            <p>No guests found. Click "Add New Guest" to create one.</p>
          )}
          {!loading && !error && guests.length > 0 && (
            <ul className="guest-list">
              {guests.map(guest => (
                <li key={guest.id} className="guest-item">
                  <span className="guest-name">{guest.name}</span>
                  <span className={\`guest-status status-\\\${guest.status}\`}>{guest.status}</span>
                  <span className="guest-notes">{guest.notes}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {viewMode === 'create' && (
        <div className="guest-create-form">
          <h2>Create New Guest</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={newGuestData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="notes">Notes:</label>
              <textarea
                id="notes"
                name="notes"
                value={newGuestData.notes}
                onChange={handleInputChange}
              ></textarea>
            </div>
            <button type="submit" className="submit-button" disabled={loading}>Add Guest</button>
            <button type="button" className="cancel-button" onClick={() => handleViewChange('list')} disabled={loading}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
}`,
    analog_example: `import { useState } from 'react';

function LightSwitch() {
  const [isOn, setIsOn] = useState(false);
  const [brightness, setBrightness] = useState(50);

  const toggleLight = () => {
    setIsOn(prev => !prev);
  };

  const handleBrightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBrightness(Number(e.target.value));
  };

  return (
    <div style={{ padding: '20px', background: isOn ? 'yellow' : 'gray' }}>
      <p>Light is {isOn ? 'ON' : 'OFF'}</p>
      <button onClick={toggleLight}>Toggle Light</button>

      {isOn && (
        <div>
          <p>Brightness: {brightness}%</p>
          <input
            type="range"
            min="0"
            max="100"
            value={brightness}
            onChange={handleBrightnessChange}
          />
        </div>
      )}
    </div>
  );
}`,
    deepDiveLabel: "Why is it important to wire UI elements to handlers?",
    deepDive: {
      hook: `You've defined the structure of your UI and the logic that makes it dynamic. Now, the final, crucial step is to connect them. Imagine having a beautifully designed car (your JSX structure) and a powerful engine (your event handlers and \`useEffect\` logic). If the steering wheel isn't connected to the tires, the accelerator to the engine, or the brakes to the wheels, the car is useless. Similarly, if your buttons don't trigger their corresponding \`onClick\` handlers, or your form inputs aren't linked to their \`onChange\` functions, your UI will be unresponsive and frustrating. Wiring these connections is what brings your application to life, allowing user interactions to flow through your logic and update the display, creating a truly interactive experience.`,
      pain: `⚠️ **Lesson:** Unwired event handlers result in a static, unresponsive UI. Symptom: Clicking buttons or typing in fields does nothing, or the UI doesn't update as expected. This means the JSX elements are not correctly linked to the JavaScript functions designed to handle their events.`,
      mentalModel: `**Mental model:** The "Electrical Wiring." Think of your JSX elements (buttons, inputs, forms) as electrical outlets and your event handler functions (\`handleSubmit\`, \`handleInputChange\`) as appliances. To make an appliance work, you need to plug it into an outlet. In React, attributes like \`onClick\`, \`onChange\`, and \`onSubmit\` are these "outlets." You "plug in" your handler functions by assigning them to these attributes. For example, \`onClick={handleViewChange}\` connects the \`handleViewChange\` function to the button's click event. This wiring ensures that when a user interacts with a UI element, the correct piece of logic is executed, leading to a dynamic and functional application.`,
      discover: `\`\`\`tsx
<button onClick={() => console.log('Button clicked!')}>Click Me</button>

<form onSubmit={mySubmitHandler}>
  <input type="text" value={myState} onChange={myChangeHandler} />
</form>

<button disabled={isLoading}>Submit</button> {/* Disabling based on state */}
\`\`\`
- \`onClick={() => handleViewChange('create')}\` directly calls the \`handleViewChange\` function with the argument \`'create'\` when the "Add New Guest" button is clicked.
- \`onSubmit={handleSubmit}\` connects the form's submission event to the \`handleSubmit\` function.
- \`onChange={handleInputChange}\` on both \`input\` and \`textarea\` elements ensures that \`handleInputChange\` is called every time their value changes, keeping \`newGuestData\` in sync.
- \`disabled={loading}\` on the submit and cancel buttons prevents interaction while an API call is in progress, improving user experience.`,
      quickRules: `**Quick rules:**
- ✅ Pass event handler functions directly to JSX event attributes (e.g., \`onClick={myFunction}\`).
- ✅ For handlers that need arguments, use an arrow function wrapper: \`onClick={() => myFunction(arg)}\`.
- ✅ Ensure \`value\` attributes on form inputs are always tied to state variables (controlled components).
- ✅ Use \`name\` attributes on inputs to allow a single \`handleInputChange\` to update multiple form fields.
- ❌ Never call the function directly in the JSX (e.g., \`onClick={myFunction()}\`); this will execute it immediately on render.
- ❌ Avoid inline arrow functions for complex logic or if they are passed as props to many child components, as they can cause unnecessary re-renders.
- ❌ Do not forget to add \`onChange\` to controlled input components; otherwise, the input will be read-only.`,
      watchOut: `👀 **Watch out:** A common mistake is to write \`onClick={myFunction()}\` instead of \`onClick={myFunction}\` or \`onClick={() => myFunction()}\`. The first one calls the function immediately during render, assigning its *return value* to \`onClick\`, which is usually \`undefined\`. The correct approach is to pass the function reference itself or a new function that calls it when the event occurs. Also, remember to add \`disabled={loading}\` to buttons during API calls to prevent duplicate submissions and provide visual feedback.`,
      dryRun: `🔁 **Think:**
1.  **User clicks "Add New Guest" button:**
    *   The \`onClick\` handler \`() => handleViewChange('create')\` is executed.
    *   \`handleViewChange('create')\` is called.
    *   \`setViewMode('create')\` is called, changing \`viewMode\` from \`'list'\` to \`'create'\`.
    *   \`setNewGuestData({ name: '', notes: '' })\` is called, clearing the form.
    *   React re-renders, and the \`viewMode === 'create'\` block becomes active, displaying the form.
2.  **User types "Jane" into the Name input:**
    *   The \`onChange\` handler \`handleInputChange\` is executed.
    *   \`e.target.name\` is \`'name'\`, \`e.target.value\` is \`'Jane'\`.
    *   \`setNewGuestData(prev => ({ ...prev, name: 'Jane' }))\` is called.
    *   \`newGuestData.name\` becomes \`'Jane'\`.
    *   React re-renders, and the input's \`value\` (which is \`newGuestData.name\`) now displays "Jane".
(Hint: Wiring connects user actions to the component's logic, driving state changes and UI updates.)`,
      build: "Wiring the event handlers to the corresponding JSX elements completes the interactive functionality of the `GuestManager`, enabling users to switch views, input data, and submit new guest entries to the API.",
    },
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1: Imports", id: "step1" },
  { label: "Step 2: Module-scope types", id: "step2" },
  { label: "Step 3: Component/function shell", id: "step3" },
  { label: "Step 4: State + local variables", id: "step4" },
  { label: "Step 5: Structure skeleton", id: "step5" },
  { label: "Step 6: Handlers / logic", id: "step6" },
  { label: "Step 7: Wire handlers to structure", id: "step7" },
];

export default createINPACTEngine({
  NODES,
  sideItems,
  lessonNum: 0,
  title: "Building a List and Create Form for API Resources",
  shortName: "List & Form UI",
});
