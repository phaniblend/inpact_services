# React · JS

Lessons and learning objectives.

**{LESSON #1 :: Counter App}**

LOs:

01
Use the useState hook to store and manage a changing value inside a React component

02
Destructure the return value of useState into a state variable and a setter function

03
Update state by calling the setter (e.g. setCount) instead of reassigning a variable

04
Define named callback functions (increment, decrement, reset) inside a React component

05
Assign a callback function to a button's onClick event handler

06
Use the functional update form setCount(prev => prev + 1) when new state depends on old state

07
Use setCount(0) for reset and setCount(prev => prev ± 1) when the new value depends on the previous state

08
Structure a complete React component: import → state → handlers → return JSX

09
Export a React component using the export default function syntax

---

**{LESSON #2 :: Toggle Visibility}**

LOs:

01
Use useState with a boolean value — differentiate from numeric or string state management

02
Initialise boolean state to true or false based on initial UI requirements (e.g. visibility, active/inactive)

03
Use the functional update form (e.g. setVisible(prev => !prev)) to safely toggle boolean state and avoid stale state

04
Implement conditional rendering using the && operator to show or hide JSX based on boolean state

05
Bind a button's label (or other UI text) to boolean state so it updates reactively when state changes

06
Explain why !prev in functional updates is safer than referencing current state directly (e.g. in async contexts)

07
Build a complete React component that integrates boolean state: initialisation, toggling, and conditional rendering (e.g. collapsible panel, toggle switch, modal)

---

**{LESSON #3 :: Controlled Input}**

LOs:

01
Use useState with an empty string for text state

02
Write an onChange handler that reads e.target.value

03
Wire value={text} to make React control the input

04
Wire onChange={handleChange} to update state on each keystroke

05
Render live text in a paragraph using {text}

06
Distinguish between controlled and uncontrolled inputs

---

**{LESSON #4 :: Multiple State Variables}**

LOs:

01
Call useState multiple times in one component — each call is independent

02
Understand that updating one state variable never affects another

03
Write separate onChange handlers for each input

04
Render both values in a live output paragraph

05
Understand why we don't put both values in one useState object

---

**{LESSON #5 :: Conditional Rendering with Ternary}**

LOs:

01
Use a ternary operator inside JSX: condition ? A : B

02
Understand when to use ternary vs && for conditional rendering

03
Render different text based on a boolean state

04
Render different button labels based on the same boolean

05
Wire a toggle function to flip the boolean on click

06
Explain why if/else doesn't work directly inside JSX return

---

**{LESSON #6 :: List Rendering with map()}**

LOs:

01
Use useState with an array as initial value

02
Use .map() to transform an array into JSX elements

03
Understand why every mapped element needs a unique key prop

04
Add items to state using the spread operator: [...prev, newItem]

05
Remove items from state using .filter()

06
Understand why you never mutate state directly with .push()

---

**{LESSON #7 :: useEffect & Side Effects}**

LOs:

01
Understand what a "side effect" is and why it lives outside render

02
Write a useEffect with a callback function

03
Use the dependency array to control when the effect runs

04
Understand the three dependency array modes: [], [value], no array

05
Update document.title from inside useEffect

06
Explain why setting state directly in render causes infinite loops

---

**{LESSON #8 :: Forms & Validation}**

LOs:

01
Manage multiple form fields with separate useState variables

02
Write validation functions that return error strings or empty string

03
Use boolean derived state to enable/disable a submit button

04
Show inline error messages with conditional rendering

05
Handle form submission with onSubmit + e.preventDefault()

06
Show a success state after valid submission

---

**{LESSON #9 :: Color Picker}**

LOs:

01
Use useState with a string to hold the selected color value

02
Render a <select> with <option> elements

03
Wire value and onChange to make the select controlled

04
Apply dynamic inline style (e.g. backgroundColor) to a div based on state

---

**{LESSON #10 :: Multiple State Vars}**

LOs:

01
Declare four separate useState variables: name, email, password, confirmPassword

02
Render four controlled inputs, each with value and onChange

03
Optionally show live feedback (e.g. passwords match / don't match)

---

**{LESSON #11 :: Reusable Button}**

LOs:

01
Accept label, onClick, variant, disabled as props

02
Apply different styles or classes per variant

03
Disable the button when disabled is true

---

**{LESSON #12 :: Card Component}**

LOs:

01
Accept title, description, image (URL), footer as props

02
Render image with <img src={image} alt={title} />

03
Use children or a footer prop for the bottom section

---

**{LESSON #13 :: Props Drilling}**

LOs:

01
Create Layer1, Layer2, Layer3 components

02
Pass a prop from parent to child through all three

03
Render the prop in Layer3

04
Export the App that wires the three layers

---

**{LESSON #14 :: Default Props}**

LOs:

01
Define default values for size and image (placeholder URL)

02
Use Avatar.defaultProps or default parameters

03
Render an img with size as width/height

---

**{LESSON #15 :: Children Prop}**

LOs:

01
Accept children as a prop

02
Return a div that wraps {children}

03
Apply inline styles (maxWidth, padding, etc.)

---

**{LESSON #16 :: Conditional Rendering}**

LOs:

01
Use state to hold status (loading / error / empty / data)

02
Render different JSX for each status with if/else or ternary

03
Optionally show mock data when status is 'data'

---

**{LESSON #17 :: List Rendering}**

LOs:

01
Define an array of items (e.g. products with id, name, price)

02
Use .map() to render one element per item

03
Add key={item.id} (or stable unique key) to the mapped element

---

**{LESSON #18 :: PropTypes (JavaScript)}**

LOs:

01
Import PropTypes and set UserCard.propTypes for name and age

02
Add optional avatar: PropTypes.string and conditionally render img

03
Export UserCard with full PropTypes

---

**{LESSON #19 :: Component Composition}**

LOs:

01
Accept header, sidebar, main, footer as props (each can be React nodes)

02
Render a layout grid/flex with four regions

03
Place each prop in the correct region

---

**{LESSON #20 :: Event Handling}**

LOs:

01
Add onKeyDown to form or inputs

02
If e.key === 'Enter', call submit handler (e.preventDefault first)

03
If e.key === 'Escape', clear the form state

---

**{LESSON #21 :: Conditional Classes}**

LOs:

01
Use state (e.g. isActive) to drive class names

02
Build className as a string: active ? 'btn active' : 'btn' or template literal

03
Apply the result to className={...}

---

**{LESSON #22 :: Inline Styles}**

LOs:

01
Use useState for progress (number 0–100)

02
Render a container div and an inner bar div

03
Set the bar's width with style={{ width: `${progress}%` }}

---

**{LESSON #23 :: CSS Modules}**

LOs:

01
Create a .module.css file with a class (e.g. .container)

02
Import it: import styles from './Component.module.css'

03
Use className={styles.container} in the component

---

**{LESSON #24 :: Styled Component Pattern}**

LOs:

01
Define CSS variables (e.g. --primary, --secondary) on a parent or :root

02
Use var(--primary) in the button's style

03
Render a button that uses the variables

---

**{LESSON #25 :: Lifting State Up}**

LOs:

01
Parent holds state (useState)

02
Pass value and setter (or handler) to both children

03
One child displays, one child updates

---

**{LESSON #26 :: Controlled vs Uncontrolled}**

LOs:

01
Controlled: value={state}, onChange updates state

02
Uncontrolled: ref on input, read inputRef.current.value on submit

03
Show both in one component or two

---

**{LESSON #27 :: Simple Todo List}**

LOs:

01
State: array of { id, text, done }

02
Add: setTodos([...todos, { id: Date.now(), text, done: false }])

03
Toggle: map and flip done for matching id

04
Delete: filter out by id

---

**{LESSON #28 :: Star Rating Component}**

LOs:

01
Use useState for rating (number 0–5 or 1–5)

02
Render 5 clickable elements (stars or buttons)

03
Filled for index <= rating, empty otherwise

04
onClick sets rating to that star's value

---

**{LESSON #29 :: Accordion}**

LOs:

01
State: openIndex (number or null) for which panel is open

02
Click header: set openIndex to that index (or toggle to null if same)

03
Render panels: show content only when openIndex === index

---

**{LESSON #30 :: Image Gallery}**

LOs:

01
State: selectedImage (URL or null) for which image is enlarged

02
Render a grid of thumbnails (e.g. 3–6 images)

03
Click thumbnail: set selectedImage to that image URL

04
Modal: when selectedImage is set, show overlay with large image and close button or click-outside to close

---

**{LESSON #31 :: useFetch}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #32 :: useDebounce}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #33 :: useLocalStorage}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #34 :: useToggle}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #35 :: useWindowSize}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #36 :: usePrevious}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #37 :: useClickOutside}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #38 :: useKeyPress}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #39 :: useOnlineStatus}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #40 :: useMediaQuery}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #41 :: Theme Context}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #42 :: Auth Context}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #43 :: Cart Context}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #44 :: Notification Context}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #45 :: Context Performance}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #46 :: useReducer vs useState}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #47 :: Compound Component (Tabs)}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #48 :: Unnecessary Re-renders}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #49 :: useMemo for Expensive Computation}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #50 :: useCallback for Stable References}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #51 :: React.memo}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #52 :: List Virtualization}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #53 :: Lazy Loading Routes}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #54 :: Image Lazy Loading}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #55 :: HOC withAuth}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #56 :: Render Props (MouseTracker)}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #57 :: Controlled DatePicker}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #58 :: Portal}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #59 :: Error Boundary}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #60 :: Recursive TreeView}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #61 :: Pagination}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #62 :: Infinite Scroll}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #63 :: Debounced Search}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #64 :: Multi-Step Form}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #65 :: Generic List<T>}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #66 :: Discriminated Union Props}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #67 :: useRef Typing}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #68 :: Event Typing}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #69 :: Generic useFetch<T>}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #70 :: Utility Types}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #71 :: useImperativeHandle}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #72 :: useSyncExternalStore}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #73 :: useTransition}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #74 :: useDeferredValue}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #75 :: useLayoutEffect vs useEffect}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #76 :: Mini Redux}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #77 :: Optimistic UI}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #78 :: Request Deduplication}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #79 :: Polling Hook}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #80 :: WebSocket Hook}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #81 :: Feature Flag Hook}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #82 :: Undo/Redo}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #83 :: Form Library from Scratch}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #84 :: Component Library Theming}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #85 :: Micro-frontend Shell}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #86 :: Race Condition Fix}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #87 :: Memoization Strategy}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #88 :: Bundle Analysis}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #89 :: Concurrent Mode Gotchas}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #90 :: Memory Leak Hunt}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #91 :: Test useFetch}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #92 :: Test Async Component}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #93 :: Test User Interactions}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #94 :: Test Context}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #95 :: Test Error Boundary}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #96 :: Design DataTable API}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #97 :: Design Auth Flow}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #98 :: Design Notification System}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #99 :: Design Permission System}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #100 :: Design Real-Time Dashboard}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---
