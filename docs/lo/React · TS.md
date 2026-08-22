# React · TS

Lessons and learning objectives.

**{LESSON #1 (TypeScript) :: Counter App — Typed}**

LOs:

01
Start from a ready-made file (imports and Counter component shell are provided)

02
Add a state variable for the count (numeric type, initial 0)

03
Add handlers that update state, then wire all three buttons in the UI

04
Export the typed function component

---

**{LESSON #2 (TypeScript) :: Toggle Visibility — Typed}**

LOs:

01
Use useState<boolean>(true) or (false)

02
Type the toggle handler

03
Conditionally render the paragraph

---

**{LESSON #3 (TypeScript) :: Controlled Input — Typed}**

LOs:

01
Use useState<string>('') for the input value

02
Type onChange as (e: React.ChangeEvent<HTMLInputElement>) => void

03
Display value.length for character count

---

**{LESSON #4 (TypeScript) :: Multiple State Variables — Typed}**

LOs:

01
Use useState<string> for email and password

02
Type both setters

03
Wire controlled inputs

---

**{LESSON #5 (TypeScript) :: Conditional Rendering with Ternary — Typed}**

LOs:

01
Use useState<boolean> for isLoggedIn or similar

02
Type the setter

03
Render different JSX with ternary

---

**{LESSON #6 (TypeScript) :: List Rendering with map() — Typed}**

LOs:

01
Define interface for list item (id, name or similar)

02
Type the array: const items: Item[] = [...]

03
Use .map with typed callback parameter

---

**{LESSON #7 (TypeScript) :: useEffect & Side Effects — Typed}**

LOs:

01
Use useState<number> or similar and useEffect

02
Type the dependency array

03
Optionally type the cleanup return

---

**{LESSON #8 (TypeScript) :: Forms & Validation — Typed}**

LOs:

01
Use useState<string> for fields and useState for errors

02
Type e in onSubmit as React.FormEvent

03
Optional: type errors as { email?: string; password?: string }

---

**{LESSON #9 (TypeScript) :: Color Picker — Typed}**

LOs:

01
Use useState<string> for color (or union type)

02
Optionally: type as 'red' | 'green' | 'blue'

03
Type the select onChange event

---

**{LESSON #10 (TypeScript) :: Multiple State Vars — Typed}**

LOs:

01
Four useState<string> for the four fields

02
Type all change handlers

03
Optional: type match message as boolean or string

---

**{LESSON #11 (TypeScript) :: Reusable Button — Typed}**

LOs:

01
Interface ButtonProps { label: string; onClick: () => void; variant?: string; disabled?: boolean }

02
Use it in the function signature

03
Apply styles from variant

---

**{LESSON #12 (TypeScript) :: Card Component — Typed}**

LOs:

01
Interface CardProps { title: string; description: string; image: string; footer?: React.ReactNode }

02
Use CardProps in the component

03
Render all props

---

**{LESSON #13 (TypeScript) :: Props Drilling — Typed}**

LOs:

01
Type Layer1/2/3 props: { value: string }

02
Pass value down and render in Layer3

03
Optional: type label as string

---

**{LESSON #14 (TypeScript) :: Default Props — Typed}**

LOs:

01
Interface AvatarProps { image?: string; size?: number }

02
Use default parameters in destructuring or in the type

03
Render img with typed dimensions

---

**{LESSON #15 (TypeScript) :: Children Prop — Typed}**

LOs:

01
Interface ContainerProps { children: React.ReactNode }

02
Use it in the component

03
Apply styles to wrapper div

---

**{LESSON #16 (TypeScript) :: Conditional Rendering — Typed}**

LOs:

01
type Status = 'loading' | 'error' | 'empty' | 'data'

02
useState<Status>('loading')

03
Render different JSX per status

---

**{LESSON #17 (TypeScript) :: List Rendering — Typed}**

LOs:

01
Interface Product { id: number; name: string; price: number }

02
const products: Product[] = [...]

03
map with (item: Product) => ...

---

**{LESSON #18 (TypeScript) :: PropTypes / TypeScript Interface}**

LOs:

01
Interface UserCardProps { name: string; age: number; avatar?: string }

02
Use it in the component

03
Conditionally render avatar

---

**{LESSON #19 (TypeScript) :: Component Composition — Typed}**

LOs:

01
Interface PageLayoutProps { header: React.ReactNode; sidebar: React.ReactNode; main: React.ReactNode; footer: React.ReactNode }

02
Use it and render four regions

03
Style with flex/grid

---

**{LESSON #20 (TypeScript) :: Event Handling — Typed}**

LOs:

01
useState<string> for value

02
onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void or similar

03
Check e.key === 'Enter' and e.key === 'Escape'

---

**{LESSON #21 (TypeScript) :: Conditional Classes — Typed}**

LOs:

01
useState<boolean>(false) for isActive

02
className as string: isActive ? 'btn active' : 'btn'

03
Apply to button

---

**{LESSON #22 (TypeScript) :: Inline Styles — Typed}**

LOs:

01
useState<number>(0) for progress

02
Bar style: React.CSSProperties with width: progress + '%'

03
Clamp 0–100 with Math.min/Math.max

---

**{LESSON #23 (TypeScript) :: CSS Modules — Typed}**

LOs:

01
const styles: Record<string, string> = { card: 'card_xyz' }

02
className={styles.card}

03
Comment: modules scope class names

---

**{LESSON #24 (TypeScript) :: Styled Component Pattern — Typed}**

LOs:

01
Wrapper style with --primary, --secondary (typed as React.CSSProperties or custom)

02
Button style: backgroundColor: 'var(--primary)'

03
Render Primary and Secondary buttons

---

**{LESSON #25 (TypeScript) :: Lifting State Up — Typed}**

LOs:

01
Parent: useState<number>(0)

02
Display({ count }: { count: number })

03
Controls({ onIncrement, onDecrement }: { onIncrement: () => void; onDecrement: () => void })

---

**{LESSON #26 (TypeScript) :: Controlled vs Uncontrolled — Typed}**

LOs:

01
Controlled: useState<string>(''), value and onChange

02
Uncontrolled: useRef<HTMLInputElement | null>(null), ref and defaultValue

03
Show both in one component

---

**{LESSON #27 (TypeScript) :: Simple Todo List — Typed}**

LOs:

01
interface Todo { id: number; text: string; done: boolean }

02
useState<Todo[]>([]) and useState<string> for input

03
Add, toggle (map), delete (filter) with typed setters

---

**{LESSON #28 (TypeScript) :: Star Rating Component — Typed}**

LOs:

01
useState<number>(0) for rating

02
Render 5 clickable elements, filled for i <= rating

03
onClick sets rating; optional: rating === i ? 0 : i to clear

---

**{LESSON #29 (TypeScript) :: Accordion — Typed}**

LOs:

01
useState<number | null>(null) for openIndex

02
interface Panel { title: string; content: string }; panels: Panel[]

03
Show content when openIndex === i; click toggles

---

**{LESSON #30 (TypeScript) :: Image Gallery — Typed}**

LOs:

01
useState<string | null>(null) for selectedImage

02
images: string[] (URLs)

03
Grid of thumbnails; modal when selectedImage is set; close sets null

---

**{LESSON #31 (TypeScript) :: useFetch — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #32 (TypeScript) :: useDebounce — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #33 (TypeScript) :: useLocalStorage — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #34 (TypeScript) :: useToggle — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #35 (TypeScript) :: useWindowSize — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #36 (TypeScript) :: usePrevious — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #37 (TypeScript) :: useClickOutside — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #38 (TypeScript) :: useKeyPress — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #39 (TypeScript) :: useOnlineStatus — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #40 (TypeScript) :: useMediaQuery — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #41 (TypeScript) :: Theme Context — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #42 (TypeScript) :: Auth Context — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #43 (TypeScript) :: Cart Context — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #44 (TypeScript) :: Notification Context — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #45 (TypeScript) :: Context Performance — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #46 (TypeScript) :: useReducer vs useState — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #47 (TypeScript) :: Compound Component (Tabs) — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #48 (TypeScript) :: Unnecessary Re-renders — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #49 (TypeScript) :: useMemo for Expensive Computation — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #50 (TypeScript) :: useCallback for Stable References — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #51 (TypeScript) :: React.memo — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #52 (TypeScript) :: List Virtualization — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #53 (TypeScript) :: Lazy Loading Routes — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #54 (TypeScript) :: Image Lazy Loading — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #55 (TypeScript) :: HOC withAuth — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #56 (TypeScript) :: Render Props (MouseTracker) — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #57 (TypeScript) :: Controlled DatePicker — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #58 (TypeScript) :: Portal — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #59 (TypeScript) :: Error Boundary — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #60 (TypeScript) :: Recursive TreeView — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #61 (TypeScript) :: Pagination — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #62 (TypeScript) :: Infinite Scroll — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #63 (TypeScript) :: Debounced Search — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #64 (TypeScript) :: Multi-Step Form — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #65 (TypeScript) :: Generic List<T> — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #66 (TypeScript) :: Discriminated Union Props — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #67 (TypeScript) :: useRef Typing — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #68 (TypeScript) :: Event Typing — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #69 (TypeScript) :: Generic useFetch<T> — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #70 (TypeScript) :: Utility Types — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #71 (TypeScript) :: useImperativeHandle — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #72 (TypeScript) :: useSyncExternalStore — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #73 (TypeScript) :: useTransition — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #74 (TypeScript) :: useDeferredValue — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #75 (TypeScript) :: useLayoutEffect vs useEffect — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #76 (TypeScript) :: Mini Redux — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #77 (TypeScript) :: Optimistic UI — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #78 (TypeScript) :: Request Deduplication — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #79 (TypeScript) :: Polling Hook — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #80 (TypeScript) :: WebSocket Hook — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #81 (TypeScript) :: Feature Flag Hook — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #82 (TypeScript) :: Undo/Redo — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #83 (TypeScript) :: Form Library from Scratch — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #84 (TypeScript) :: Component Library Theming — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #85 (TypeScript) :: Micro-frontend Shell — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #86 (TypeScript) :: Race Condition Fix — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #87 (TypeScript) :: Memoization Strategy — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #88 (TypeScript) :: Bundle Analysis — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #89 (TypeScript) :: Concurrent Mode Gotchas — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #90 (TypeScript) :: Memory Leak Hunt — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #91 (TypeScript) :: Test useFetch — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #92 (TypeScript) :: Test Async Component — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #93 (TypeScript) :: Test User Interactions — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #94 (TypeScript) :: Test Context — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #95 (TypeScript) :: Test Error Boundary — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #96 (TypeScript) :: Design DataTable API — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #97 (TypeScript) :: Design Auth Flow — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #98 (TypeScript) :: Design Notification System — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #99 (TypeScript) :: Design Permission System — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---

**{LESSON #100 (TypeScript) :: Design Real-Time Dashboard — Typed}**

LOs:

01
Type state and props

02
Implement step by step

03
Export typed component

---
