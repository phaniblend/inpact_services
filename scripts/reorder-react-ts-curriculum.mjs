/**
 * One-off: build reordered REACT_TS_CURRICULUM + engine old-index order from user blueprint.
 * Run: node scripts/reorder-react-ts-curriculum.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const NEW_TITLES_RAW = `
01 - JSX — The Full Language
02 - TypeScript — Interfaces + Types
03 - Props + Interface
04 - Optional Props + Defaults
05 - children Prop + ReactNode
06 - useState — Primitives
07 - useState — Objects + Spread
08 - useState — Arrays
09 - Controlled Inputs
10 - Controlled Select + Union Types
11 - Conditional Rendering
12 - List Rendering + key
13 - Event Handling — Click
14 - Event Handling — Input + Form
15 - Event Handling — Keyboard + Focus
16 - Component Composition
17 - Conditional CSS Classes
18 - Inline Styles + CSSProperties
19 - CSS Modules
20 - useEffect — Mount
21 - useEffect — Dependencies
22 - useEffect — Cleanup
23 - useLayoutEffect vs useEffect
24 - fetch + Loading + Error State
25 - AbortController
26 - useRef — DOM Access
27 - useRef — Mutable Values
28 - useReducer
29 - Custom Hook — Extract Logic
30 - Custom Hook — useFetch
31 - Custom Hook — useDebounce
32 - Custom Hook — useLocalStorage
33 - Custom Hook — useWindowSize
34 - Custom Hook — useClickOutside
35 - Custom Hook — useKeyPress
36 - Custom Hook — useOnlineStatus
37 - Custom Hook — useMediaQuery
38 - Custom Hook — useWebSocket
39 - Custom Hook — usePolling
40 - React.memo
41 - useMemo
42 - useCallback
43 - Identifying Re-renders
44 - List Virtualization — react-window
45 - Code Splitting + React.lazy
46 - Suspense + Fallback
47 - useTransition — React 18
48 - useDeferredValue — React 18
49 - Image Lazy Loading
50 - Skeleton Loading UI
51 - Dark Mode Toggle
52 - Context API — createContext + useContext
53 - Context — Theme Provider
54 - Context — Auth Provider
55 - Context Performance — Split + Memo
56 - Zustand — Store Basics
57 - Zustand — UI State
58 - Zustand — Persist Middleware
59 - Mini Redux from Scratch
60 - Redux Toolkit — createSlice
61 - Redux Toolkit — configureStore
62 - Redux Toolkit — useSelector + useDispatch
63 - RTK — createAsyncThunk
64 - RTK — Entity Adapter
65 - RTK Query — createApi
66 - RTK Query — useQuery
67 - RTK Query — useMutation
68 - RTK Query — WebSocket Listener
69 - TanStack Query — useQuery
70 - TanStack Query — useMutation
71 - TanStack Query — Infinite Scroll
72 - TanStack Query — Optimistic Updates
73 - WebSocket Real-time Updates
74 - Compound Components
75 - Render Props
76 - TypeScript — Generics in Components
77 - Generic Component — List<T>
78 - forwardRef
79 - useImperativeHandle
80 - Portal
81 - Error Boundary
82 - Recursive Component — TreeView
83 - HOC — withAuth
84 - HOC — withPermission
85 - Discriminated Union Props
86 - Slot Pattern
87 - Observer Pattern
88 - Polling vs WebSocket
89 - React Hook Form — Basics
90 - React Hook Form — Validation
91 - Zod — Schema Definition
92 - Dynamic Zod Schemas
93 - Zod + RHF — Integration
94 - Multi-Step Form — Wizard
95 - Conditional Form Fields
96 - Draft Autosave
97 - Form Array Fields
98 - File Upload Component
99 - Form State Persistence
100 - React Router — Setup + Basic Routes
101 - React Router — useNavigate + useParams
102 - React Router — Nested Routes + Outlet
103 - React Router — Lazy Routes
104 - Color Contrast in UI
105 - Protected Route — Auth Guard
106 - Protected Route — RBAC Guard
107 - JWT — Decode + Store
108 - Axios Interceptors — Token Attach
109 - Axios Interceptors — Token Refresh
110 - Session Timeout Hook
111 - Cookie-Based Auth Flow
112 - Multi-Tab Auth Sync
113 - OAuth2 PKCE Flow
114 - TypeScript — Enums
115 - RBAC — usePermission Hook
116 - Secure Token Rotation
117 - Optimistic UI
118 - Race Condition Fix
119 - Request Deduplication
120 - Pagination — Controlled
121 - Infinite Scroll — useIntersectionObserver
122 - CSV/Excel Export
123 - Clipboard API
124 - Date/Time Handling in UI
125 - Toast Notification System
126 - Modal — Portal + Focus Trap
127 - Accordion
128 - Tabs — Compound Component
129 - Drag and Drop — Reorder
130 - Debounced Search
131 - Star Rating Component
132 - Image Gallery + Lightbox
133 - Undo/Redo
134 - Conditional Classes — clsx
135 - Styled Component Pattern
136 - TypeScript — Type Guards
137 - TypeScript — Utility Types
138 - Controlled Select + Union Types (deep dive)
139 - Screen Reader Testing
140 - ARIA Roles + Labels
141 - Keyboard Navigation
142 - Focus Management
143 - useId — Stable IDs
144 - Testing — Render + Query
145 - Testing — User Interactions
146 - Testing — Async Components
147 - Testing — Context + Providers
148 - Testing — Custom Hooks
149 - Testing — Error Boundary
150 - Testing — Mocking Axios
151 - Testing — RTK Query
`;

function parseNewTitles(raw) {
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return lines.map((line) => {
    const m = line.match(/^\d+\s*-\s*(.+)$/);
    if (!m) throw new Error("Bad line: " + line);
    return m[1].replace(/\s*\[TS at pain point\]\s*$/i, "").trim();
  });
}

function loadOldCurriculum() {
  const path = join(root, "src", "reactTsCurriculum.js");
  const src = readFileSync(path, "utf8");
  const m = src.match(/export const REACT_TS_CURRICULUM = (\[[\s\S]*?\]);/);
  if (!m) throw new Error("Could not parse REACT_TS_CURRICULUM");
  return Function(`"use strict"; return ${m[1]}`)();
}

function main() {
  const NEW_TITLES = parseNewTitles(NEW_TITLES_RAW);
  if (NEW_TITLES.length !== 151) throw new Error("Expected 151 titles, got " + NEW_TITLES.length);

  const OLD = loadOldCurriculum();
  if (OLD.length !== 150) throw new Error("Expected 150 old lessons");

  const oldTitleToIndex = new Map();
  for (let i = 0; i < OLD.length; i++) {
    const t = OLD[i].title;
    if (!oldTitleToIndex.has(t)) oldTitleToIndex.set(t, i + 1);
  }

  const DEEP_DIVE = "Controlled Select + Union Types (deep dive)";
  const BASE_SELECT = "Controlled Select + Union Types";
  const oldIndexForEngine = (newTitle) => {
    if (newTitle === DEEP_DIVE) return 14; // same engine as intro Controlled Select
    const oi = oldTitleToIndex.get(newTitle);
    if (oi == null) throw new Error("No old lesson for title: " + newTitle);
    return oi;
  };

  /** old lesson number (1-based) -> new lesson number (1-based) */
  const oldToNew = new Map();
  for (let newI = 1; newI <= NEW_TITLES.length; newI++) {
    const t = NEW_TITLES[newI - 1];
    if (t === DEEP_DIVE) continue;
    const oldI = oldTitleToIndex.get(t);
    if (oldI == null) throw new Error("Unmapped new title: " + t);
    oldToNew.set(oldI, newI);
  }
  // deep dive slot: no old row

  function translatePrereqs(oldPrereqs) {
    const out = [];
    for (const p of oldPrereqs) {
      const n = oldToNew.get(p);
      if (n != null) out.push(n);
    }
    return [...new Set(out)].sort((a, b) => a - b);
  }

  const newCurriculum = NEW_TITLES.map((title, idx) => {
    const newI = idx + 1;
    if (title === DEEP_DIVE) {
      return { title, prereqs: [1, 2, 10, 136, 137] };
    }
    const oldI = oldTitleToIndex.get(title);
    const oldRow = OLD[oldI - 1];
    return { title, prereqs: translatePrereqs(oldRow.prereqs) };
  });

  const engineOldOrder = NEW_TITLES.map((t) => oldIndexForEngine(t));

  const reduxOld0Based = [72, 117, 118, 119, 120, 121];
  const reduxTitles = reduxOld0Based.map((i) => OLD[i].title);
  const reduxNewIndices = reduxTitles.map((t) => {
    const ni = NEW_TITLES.indexOf(t) + 1;
    if (ni <= 0) throw new Error("Redux title not in new list: " + t);
    return ni - 1;
  });

  const out = {
    newCurriculum,
    engineOldOrder,
    reduxNewIndices,
  };

  const outPath = join(root, "scripts", "reorder-react-ts-output.json");
  writeFileSync(outPath, JSON.stringify(out, null, 2), "utf8");
  console.log("Wrote", outPath);
  console.log("redux new 0-based:", reduxNewIndices);
}

main();
