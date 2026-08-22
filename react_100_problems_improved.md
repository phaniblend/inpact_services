## P01 — Counter App
**lesson title:** Counter App
**description:** Build a very simple React page that displays a number starting at 0 and lets the user change it using buttons: [ + ] increases the number by 1 [ - ] decreases the number by 1 [ Reset ] brings the number back to 0 Example: Start → 0 Click + → 1 Click + → 2 Click - → 1 Click Reset → 0
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Use the useState hook to store and manage a changing value inside a React component
02. Destructure the return value of useState into a state variable and a setter function
03. Explain why calling the setter triggers a re-render but reassigning a variable does not
04. Define named callback functions (increment, decrement, reset) inside a React component
05. Assign a callback function to a button's onClick event handler
06. Use the functional update form setCount(prev => prev + 1) when new state depends on old state
07. Distinguish between setCount(0) and setCount(prev => prev + 1) — and know when to use each
08. Structure a complete React component: import → state → handlers → return JSX
09. Export a React component using the export default function syntax

---

## P02 — Toggle Visibility
**lesson title:** Toggle Visibility
**description:** A page with a button and a paragraph of text. Clicking the button HIDES the paragraph if it's visible. Clicking it again SHOWS it. The button label changes too. Example: Start → [ Hide ] Hello, I am visible! Click button → [ Show ] Click button → [ Hide ] Hello, I am visible!
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Use useState with a boolean value — not just a number
02. Initialise state to true or false depending on the starting UI
03. Toggle a boolean using the functional update form: setVisible(prev => !prev)
04. Conditionally render JSX using the && operator
05. Dynamically set a button's label based on a state variable
06. Explain why !prev is safer than !isVisible for toggling
07. Structure a complete React component with boolean state

---

## P03 — Controlled Input
**lesson title:** Controlled Input
**description:** A text input and a paragraph below it. As you type into the input, the paragraph updates in real time — letter by letter. Example: Start → [ ] You typed: Type "Hi" → [ Hi ] You typed: Hi Type "Hi!" → [ Hi! ] You typed: Hi!
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Use useState with an empty string — the input starts blank
02. Understand why the initial value is "" not true or 0
03. Write an onChange handler that reads e.target.value
04. Wire value={text} to make React control the input
05. Wire onChange={handleChange} to update state on each keystroke
06. Render live text in a paragraph using {text}
07. Explain the difference between controlled and uncontrolled inputs

---

## P04 — Multiple State Variables
**lesson title:** Multiple State Variables
**description:** A profile card form with two independent inputs — name and age. Each input has its own state. Changing one doesn't affect the other. Example: name: [ Alice ] age: [ 30 ] → Hello, Alice! You are 30 years old.
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Call useState multiple times in one component — each call is independent
02. Understand that updating one state variable never affects another
03. Write separate onChange handlers for each input
04. Render both values in a live output paragraph
05. Understand why we don't put both values in one useState object

---

## P05 — Conditional Rendering with Ternary
**lesson title:** Conditional Rendering with Ternary
**description:** A status card that shows different content based on a boolean. isLoggedIn = true → "Welcome back!" + Logout button isLoggedIn = false → "Please sign in" + Login button One state variable. Two completely different UIs.
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Use a ternary operator inside JSX: condition ? A : B
02. Understand when to use ternary vs && for conditional rendering
03. Render different text based on a boolean state
04. Render different button labels based on the same boolean
05. Wire a toggle function to flip the boolean on click
06. Explain why if/else doesn't work directly inside JSX return

---

## P06 — List Rendering with map()
**lesson title:** List Rendering with map()
**description:** A shopping list component. An array of items lives in state. Each item renders as a <li> element. items = ['Apples', 'Bread', 'Milk'] → • Apples • Bread • Milk Add an item → list grows. Remove one → list shrinks.
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Use useState with an array as initial value
02. Use .map() to transform an array into JSX elements
03. Understand why every mapped element needs a unique key prop
04. Add items to state using the spread operator: [...prev, newItem]
05. Remove items from state using .filter()
06. Understand why you never mutate state directly with .push()

---

## P07 — useEffect & Side Effects
**lesson title:** useEffect & Side Effects
**description:** A document title updater. Every time the count changes, the browser tab title updates automatically. count = 0 → tab shows "Count: 0" count = 1 → tab shows "Count: 1" count = 5 → tab shows "Count: 5" No button click triggers this — it just happens whenever count changes.
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Understand what a "side effect" is and why it lives outside render
02. Write a useEffect with a callback function
03. Use the dependency array to control when the effect runs
04. Understand the three dependency array modes: [], [value], no array
05. Update document.title from inside useEffect
06. Explain why setting state directly in render causes infinite loops

---

## P08 — Forms & Validation
**lesson title:** Forms & Validation
**description:** A login form with live validation. email: "" → "Email is required" email: "notvalid" → "Enter a valid email" email: "a@b.com" → ✓ valid password: "" → "Password is required" password: "abc" → "Min 6 characters" password: "abc123" → ✓ valid Submit button disabled until both fields are valid. On submit → show "Welcome!" message.
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Manage multiple form fields with separate useState variables
02. Write validation functions that return error strings or empty string
03. Use boolean derived state to enable/disable a submit button
04. Show inline error messages with conditional rendering
05. Handle form submission with onSubmit + e.preventDefault()
06. Show a success state after valid submission

---

## P09 — Color Picker
**lesson title:** Color Picker
**description:** Change the background color of a div based on a dropdown selection. Build a <select> with options (e.g. Red, Green, Blue) and a div. When the user picks a color from the dropdown, the div's background updates to that color.
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Use useState with a string to hold the selected color value
02. Render a <select> with <option> elements
03. Wire value and onChange to make the select controlled
04. Apply dynamic inline style (e.g. backgroundColor) to a div based on state

---

## P10 — Multiple State Vars
**lesson title:** Multiple State Vars
**description:** Build a registration form tracking: name, email, password, and confirmPassword as separate state variables. Each field is controlled by its own useState. Display the current values (or a summary) so you can see all four updating as the user types.
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Declare four separate useState variables: name, email, password, confirmPassword
02. Render four controlled inputs, each with value and onChange
03. Optionally show live feedback (e.g. passwords match / don't match)

---

## P11 — Reusable Button
**lesson title:** Reusable Button
**description:** Build a Button component that accepts: label, onClick, variant (primary / secondary / danger), and disabled. Render a <button> whose styles change based on variant and disabled.
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Accept label, onClick, variant, disabled as props
02. Apply different styles or classes per variant
03. Disable the button when disabled is true

---

## P12 — Card Component
**lesson title:** Card Component
**description:** Build a Card component with: title, description, image, and footer slot via props. Render a styled card that displays each.
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Accept title, description, image (URL), footer as props
02. Render image with <img src={image} alt={title} />
03. Use children or a footer prop for the bottom section

---

## P13 — Props Drilling
**lesson title:** Props Drilling
**description:** Pass data 3 levels deep without Context. Build a small tree: App → Layer1 → Layer2 → Layer3, and pass a value (e.g. theme or user) from App down so Layer3 can display it. You'll see why passing through every layer gets tedious — Context fixes that later.
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Create Layer1, Layer2, Layer3 components
02. Pass a prop from parent to child through all three
03. Render the prop in Layer3
04. Export the App that wires the three layers

---

## P14 — Default Props
**lesson title:** Default Props
**description:** Build an Avatar component with default props for size (e.g. 40) and placeholder image URL. When the consumer doesn't pass image, show the placeholder.
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Define default values for size and image (placeholder URL)
02. Use Avatar.defaultProps or default parameters
03. Render an img with size as width/height

---

## P15 — Children Prop
**lesson title:** Children Prop
**description:** Build a Container component that wraps any children with a styled div (e.g. maxWidth, padding, border). Usage: <Container><h1>Hi</h1><p>Content</p></Container>.
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Accept children as a prop
02. Return a div that wraps {children}
03. Apply inline styles (maxWidth, padding, etc.)

---

## P16 — Conditional Rendering
**lesson title:** Conditional Rendering
**description:** Show different UI based on: loading, error, empty, and data states. Build a component that has a state (e.g. status: 'loading' | 'error' | 'empty' | 'data') and renders a different message or content for each.
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Use state to hold status (loading / error / empty / data)
02. Render different JSX for each status with if/else or ternary
03. Optionally show mock data when status is 'data'

---

## P17 — List Rendering
**lesson title:** List Rendering
**description:** Render a list of products with proper key props. Use an array of objects (e.g. id, name, price) and map over it to render a div or li for each. Keys help React track list items across updates.
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Define an array of items (e.g. products with id, name, price)
02. Use .map() to render one element per item
03. Add key={item.id} (or stable unique key) to the mapped element

---

## P18 — PropTypes / TypeScript Interface
**lesson title:** PropTypes / TypeScript Interface
**description:** Add TypeScript interfaces to a UserCard component. Define an interface for the props (e.g. name: string, age: number, avatar?: string) and use it to type the component. If using JS, use PropTypes instead.
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Define an interface or PropTypes for UserCard props
02. Apply the type to the component function
03. Render name, age, and optional avatar

---

## P19 — Component Composition
**lesson title:** Component Composition
**description:** Build a PageLayout with Header, Sidebar, Main, and Footer as named slots. Accept props like header, sidebar, main, footer (or children with names) and render a grid/flex layout.
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Accept header, sidebar, main, footer as props (each can be React nodes)
02. Render a layout grid/flex with four regions
03. Place each prop in the correct region

---

## P20 — Event Handling
**lesson title:** Event Handling
**description:** Build a form where pressing Enter submits and Escape clears, without using a submit button. Use onKeyDown on the form or inputs and check e.key.
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Add onKeyDown to form or inputs
02. If e.key === 'Enter', call submit handler (e.preventDefault first)
03. If e.key === 'Escape', clear the form state

---

## P21 — Conditional Classes
**lesson title:** Conditional Classes
**description:** Apply different CSS classes based on component state. Build a button or div that toggles an 'active' class (or multiple classes) when state is true/false.
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Use state (e.g. isActive) to drive class names
02. Build className as a string: active ? 'btn active' : 'btn' or template literal
03. Apply the result to className={...}

---

## P22 — Inline Styles
**lesson title:** Inline Styles
**description:** Build a progress bar with dynamic width via inline styles. Use state (e.g. progress 0–100) and set the bar's width to progress + '%'.
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Use useState for progress (number 0–100)
02. Render a container div and an inner bar div
03. Set the bar's width with style={{ width: `${progress}%` }}

---

## P23 — CSS Modules
**lesson title:** CSS Modules
**description:** Convert a component from global CSS to CSS Modules. Create a .module.css file, import it as styles, and use className={styles.box} instead of class="box". Explain why modules scope class names.
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Create a .module.css file with a class (e.g. .container)
02. Import it: import styles from './Component.module.css'
03. Use className={styles.container} in the component

---

## P24 — Styled Component Pattern
**lesson title:** Styled Component Pattern
**description:** Build a themed button using CSS variables. Define --primary, --secondary on a wrapper or :root, and use them in inline styles or a style tag so the button reads var(--primary).
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Define CSS variables (e.g. --primary, --secondary) on a parent or :root
02. Use var(--primary) in the button's style
03. Render a button that uses the variables

---

## P25 — Lifting State Up
**lesson title:** Lifting State Up
**description:** Build two sibling components that share state via a parent. The parent holds the state (e.g. count); one child displays it, the other has a button to increment it.
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Parent holds state (useState)
02. Pass value and setter (or handler) to both children
03. One child displays, one child updates

---

## P26 — Controlled vs Uncontrolled
**lesson title:** Controlled vs Uncontrolled
**description:** Explain the difference with a working example of each. Build (1) a controlled input: value and onChange from state. (2) An uncontrolled input: useRef to read the value when needed (e.g. on button click).
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Controlled: value={state}, onChange updates state
02. Uncontrolled: ref on input, read inputRef.current.value on submit
03. Show both in one component or two

---

## P27 — Simple Todo List
**lesson title:** Simple Todo List
**description:** Add, complete, delete todos — full CRUD with useState. State is an array of objects { id, text, done }. Add new todo, toggle done, delete by id.
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. State: array of { id, text, done }
02. Add: setTodos([...todos, { id: Date.now(), text, done: false }])
03. Toggle: map and flip done for matching id
04. Delete: filter out by id

---

## P28 — Star Rating Component
**lesson title:** Star Rating Component
**description:** Build a clickable 5-star rating component. State holds the current rating (1–5). Clicking a star sets the rating to that star's index. Show filled vs empty stars.
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Use useState for rating (number 0–5 or 1–5)
02. Render 5 clickable elements (stars or buttons)
03. Filled for index <= rating, empty otherwise
04. onClick sets rating to that star's value

---

## P29 — Accordion
**lesson title:** Accordion
**description:** Build a single-open accordion with multiple panels. Only one panel is expanded at a time. Clicking a panel header opens it and closes the others. State: which index (or id) is open.
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. State: openIndex (number or null) for which panel is open
02. Click header: set openIndex to that index (or toggle to null if same)
03. Render panels: show content only when openIndex === index

---

## P30 — Image Gallery
**lesson title:** Image Gallery
**description:** Build a grid of images with a click-to-enlarge modal. Clicking an image opens a modal (or overlay) showing the full-size image; clicking outside or a close button closes it.
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. State: selectedImage (URL or null) for which image is enlarged
02. Render a grid of thumbnails (e.g. 3–6 images)
03. Click thumbnail: set selectedImage to that image URL
04. Modal: when selectedImage is set, show overlay with large image and close button or click-outside to close

---

## P31 — useFetch
**lesson title:** useFetch
**description:** Custom hook for data fetching with loading/error/data + AbortController cleanup
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P32 — useDebounce
**lesson title:** useDebounce
**description:** Debounce any value by a configurable delay
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P33 — useLocalStorage
**lesson title:** useLocalStorage
**description:** Sync state with localStorage — read on mount, write on change
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P34 — useToggle
**lesson title:** useToggle
**description:** Generic boolean toggle hook with optional initial value
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P35 — useWindowSize
**lesson title:** useWindowSize
**description:** Track window width/height with resize listener and cleanup
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P36 — usePrevious
**lesson title:** usePrevious
**description:** Return the previous value of any state using useRef
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P37 — useClickOutside
**lesson title:** useClickOutside
**description:** Detect clicks outside a referenced element — dropdowns/modals
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P38 — useKeyPress
**lesson title:** useKeyPress
**description:** Detect when a specific keyboard key is pressed
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P39 — useOnlineStatus
**lesson title:** useOnlineStatus
**description:** Track whether the user is online or offline
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P40 — useMediaQuery
**lesson title:** useMediaQuery
**description:** Return true/false based on a CSS media query string
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P41 — Theme Context
**lesson title:** Theme Context
**description:** Dark/light mode toggle using Context + useReducer
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P42 — Auth Context
**lesson title:** Auth Context
**description:** Mock auth: login, logout, protected route, user in context
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P43 — Cart Context
**lesson title:** Cart Context
**description:** Shopping cart: add, remove, update quantity, total price
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P44 — Notification Context
**lesson title:** Notification Context
**description:** Toast system: push, auto-dismiss, stack limit
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P45 — Context Performance
**lesson title:** Context Performance
**description:** Fix Context that re-renders entire tree — split or memo
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P46 — useReducer vs useState
**lesson title:** useReducer vs useState
**description:** Refactor multi-field form from useState to useReducer
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P47 — Compound Component (Tabs)
**lesson title:** Compound Component (Tabs)
**description:** Tabs component with Context so Tab children know active state
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P48 — Unnecessary Re-renders
**lesson title:** Unnecessary Re-renders
**description:** Fix performance bug with React.memo, useMemo, useCallback
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P49 — useMemo for Expensive Computation
**lesson title:** useMemo for Expensive Computation
**description:** Filter + sort large list — memoize the result
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P50 — useCallback for Stable References
**lesson title:** useCallback for Stable References
**description:** Stabilise callback so child does not re-render
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P51 — React.memo
**lesson title:** React.memo
**description:** Wrap pure child; demonstrate it stops re-rendering
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P52 — List Virtualization
**lesson title:** List Virtualization
**description:** Windowing for 10,000 items (e.g. react-window)
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P53 — Lazy Loading Routes
**lesson title:** Lazy Loading Routes
**description:** Code splitting with React.lazy + Suspense on routes
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P54 — Image Lazy Loading
**lesson title:** Image Lazy Loading
**description:** Image loads when in viewport (IntersectionObserver)
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P55 — HOC withAuth
**lesson title:** HOC withAuth
**description:** withAuth HOC that redirects unauthenticated users
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P56 — Render Props (MouseTracker)
**lesson title:** Render Props (MouseTracker)
**description:** MouseTracker using render props pattern
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P57 — Controlled DatePicker
**lesson title:** Controlled DatePicker
**description:** Fully controlled DatePicker component
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P58 — Portal
**lesson title:** Portal
**description:** Render modal outside root with ReactDOM.createPortal
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P59 — Error Boundary
**lesson title:** Error Boundary
**description:** Class-based Error Boundary with fallback UI
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P60 — Recursive TreeView
**lesson title:** Recursive TreeView
**description:** Recursive TreeView for nested folders
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P61 — Pagination
**lesson title:** Pagination
**description:** Client-side pagination for 100 items
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P62 — Infinite Scroll
**lesson title:** Infinite Scroll
**description:** Load more on scroll (IntersectionObserver)
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P63 — Debounced Search
**lesson title:** Debounced Search
**description:** useDebounce + useFetch for real-time search
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P64 — Multi-Step Form
**lesson title:** Multi-Step Form
**description:** 3-step form with validation, back/next, persisted state
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P65 — Generic List<T>
**lesson title:** Generic List<T>
**description:** Generic List component with custom render function
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P66 — Discriminated Union Props
**lesson title:** Discriminated Union Props
**description:** Button: variant=link requires href, variant=action requires onClick
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P67 — useRef Typing
**lesson title:** useRef Typing
**description:** Type useRef for DOM element vs mutable value
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P68 — Event Typing
**lesson title:** Event Typing
**description:** Type onChange, onClick, onSubmit in TypeScript
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P69 — Generic useFetch<T>
**lesson title:** Generic useFetch<T>
**description:** Add generics to useFetch for typed responses
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P70 — Utility Types
**lesson title:** Utility Types
**description:** Use Partial, Pick, Omit for prop interfaces
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P71 — useImperativeHandle
**lesson title:** useImperativeHandle
**description:** Expose focus()/clear() from child via forwardRef + useImperativeHandle
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P72 — useSyncExternalStore
**lesson title:** useSyncExternalStore
**description:** Subscribe to external store safely in concurrent mode
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P73 — useTransition
**lesson title:** useTransition
**description:** Mark slow update non-urgent — heavy filtered list demo
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P74 — useDeferredValue
**lesson title:** useDeferredValue
**description:** Defer expensive re-render, keep input responsive
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P75 — useLayoutEffect vs useEffect
**lesson title:** useLayoutEffect vs useEffect
**description:** Explain difference with DOM measurement example
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P76 — Mini Redux
**lesson title:** Mini Redux
**description:** Global state with useReducer + Context + useSelector-style hook
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P77 — Optimistic UI
**lesson title:** Optimistic UI
**description:** Todo: add item instantly, sync server, rollback on failure
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P78 — Request Deduplication
**lesson title:** Request Deduplication
**description:** Fetch layer that prevents duplicate in-flight same URL
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P79 — Polling Hook
**lesson title:** Polling Hook
**description:** usePolling: refetch on interval, stop on unmount
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P80 — WebSocket Hook
**lesson title:** WebSocket Hook
**description:** useWebSocket: connect, reconnect, send + last message
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P81 — Feature Flag Hook
**lesson title:** Feature Flag Hook
**description:** useFeatureFlag(flagName) from context
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P82 — Undo/Redo
**lesson title:** Undo/Redo
**description:** Undo/redo for text editor with useReducer + history stack
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P83 — Form Library from Scratch
**lesson title:** Form Library from Scratch
**description:** Mini useForm: register, values/errors/touched, submit
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P84 — Component Library Theming
**lesson title:** Component Library Theming
**description:** Token-based theming with CSS variables + Context
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P85 — Micro-frontend Shell
**lesson title:** Micro-frontend Shell
**description:** Sketch React as micro-frontend with Module Federation
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P86 — Race Condition Fix
**lesson title:** Race Condition Fix
**description:** Fix stale API overwriting fresh — AbortController
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P87 — Memoization Strategy
**lesson title:** Memoization Strategy
**description:** Dashboard with 20 widgets — memoization strategy
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P88 — Bundle Analysis
**lesson title:** Bundle Analysis
**description:** Webpack Bundle Analyzer + code splitting for slow load
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P89 — Concurrent Mode Gotchas
**lesson title:** Concurrent Mode Gotchas
**description:** Explain tearing and useSyncExternalStore
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P90 — Memory Leak Hunt
**lesson title:** Memory Leak Hunt
**description:** Find and fix: listener, interval, subscription not cleaned
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P91 — Test useFetch
**lesson title:** Test useFetch
**description:** Test useFetch with renderHook, mock fetch, loading/error/data
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P92 — Test Async Component
**lesson title:** Test Async Component
**description:** Test fetch component with msw, assert loading → data
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P93 — Test User Interactions
**lesson title:** Test User Interactions
**description:** Test multi-step form: fill, Next, submit, success
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P94 — Test Context
**lesson title:** Test Context
**description:** Test component consuming Auth Context with mock provider
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P95 — Test Error Boundary
**lesson title:** Test Error Boundary
**description:** Test that throws in child, assert fallback UI
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P96 — Design DataTable API
**lesson title:** Design DataTable API
**description:** Design props for sortable, filterable, paginated table
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P97 — Design Auth Flow
**lesson title:** Design Auth Flow
**description:** Login, token storage, refresh, protected routes, logout
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P98 — Design Notification System
**lesson title:** Design Notification System
**description:** Toasts: types, auto-dismiss, max 3, queue
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P99 — Design Permission System
**lesson title:** Design Permission System
**description:** Can action resource component, roles data model
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---

## P100 — Design Real-Time Dashboard
**lesson title:** Design Real-Time Dashboard
**description:** Poll 5 endpoints, intervals, stale indicators, errors
**Learning objectives:**
After completing this Lesson, you'll be able to:
01. Explain the purpose of this hook/pattern and when it should be used in real React applications
02. Implement the solution step‑by‑step inside a React component or custom hook
03. Integrate the solution into a working UI example to verify behaviour
04. Handle common edge cases (cleanup, dependency management, or state consistency)
05. Export and reuse the solution in other components or projects

---
