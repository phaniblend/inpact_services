# Restaurant inventory (React · TS) — lesson structure spec

**Product promise:** Owners see **what was bought**, **what it should yield**, **what moved** (sold / used), and **where the gap hurts ROI** — starting with kitchen supply transparency, not full market intel.

**Pedagogy:** Bottom-up (UI → layout → feature → shared data → app shell). Each **lesson** = one INPACT engine / one curriculum row; **inside** a lesson: `reveal` → `objectives` → multiple `question` steps following **7-phase** source order (imports → module types → component shell → state → JSX → handlers → wire) across steps as needed.

**Prereqs (default):** Lesson *N* requires lesson *N−1* complete unless noted. Add global prereqs (e.g. “environment ready”) via existing `getLessonPrereqs` / curriculum metadata when wired.

**Suggested repo paths (learners’ artifact):**  
`src/features/inventory/...`, `src/app/...`, `src/shared/...` — adjust names when implementing.

---

## Global conventions

| Field | Convention |
|--------|------------|
| **Side rail** | Intro → Objectives → `step1` … `stepK` mirroring `NODES` |
| **Preview** | Every lesson ends with something **visible** on the lesson tab or preview |
| **Copy tone** | Owner + kitchen accountability; numbers are **pedagogical** |
| **Evaluation** | Mix of `keyword_match` / structure checks / multi-file integrity per step complexity |

---

## Enterprise patterns ↔ lessons (Phases 1–4)

The long “seven patterns” essay is mainly an **authoring lens**. Learners get a **short mental model** in the **track briefing** (below); this table shows how the **same ideas** show up in lesson order—including **RTK** and **RBAC** in later phases.

| Pattern (enterprise) | In plain language | Where you learn it (lessons) |
|----------------------|-------------------|------------------------------|
| **1. Display cards** | Quick highlights / summary numbers | **1**, **8**; RTK-powered loading/error **badges** can land in **20–21** refinements |
| **2. Lists** | Collections of rows | **4, 5, 6**; **20** (server-backed list via RTK Query) |
| **3. Detail view** | One item explained fully | **6**, **7**; **20** (`getGroceryById`-style query optional) |
| **4. Forms** | Create / edit data | **9**; **21** (mutations + optimistic UX) |
| **5. Dashboards** | Trends & cross-cutting insights | **8** (signals); **22** (derived selectors / normalized views); **full charts** → Phase 2 domain |
| **6. Actions** | Operations that change state | **2**, **9**, **11**; **18–22** (dispatch, mutations, listeners) |
| **7. Rules & permissions** | Who can see / do what | **17** (optional auth **UI shell**); **23–25** (**RBAC**: model, guards, audit readout) |

**Throughput line (one sentence for slides):**  
**List → pick → detail → act → update → reflect** — **1–3** one row; **4–6** list + pick + narrow; **7–9** screen + signals + form; **10–13** React-local shared data + persistence; **14–16** app shell + resilience; **17** optional auth shell; **18–22** **Redux Toolkit** (store, slice, **RTK Query**, mutations, advanced RTK); **23–25** **RBAC** + audit visibility.

**Domain line (restaurant ROI):**  
**Phase 1 (1–16):** groceries + transparency + leak signals. **Phase 2:** recipes, monthly plan, orders (same 5-layer pattern). **Phase 3 (18–22):** industry-style **state modules** (RTK). **Phase 4 (23–25):** **roles, route/action guards, audit**. **Phase 5+:** market benchmark, deep analytics.

---

## Track briefing — where, how, and what to call it

**Naming (pick one in UI):** **Track briefing** · **Start here** · **How this track works** — all signal *short, optional, skippable*. Avoid “preface” (sounds academic) and avoid “syllabus” (sounds long).

### Placement (HCI)

| Surface | Role | When |
|--------|------|------|
| **A — Before the lesson catalogue** | Primary **track briefing** | First time learner opens **this** curriculum (React · TS restaurant / inventory track), or after a **major curriculum version** bump |
| **B — Catalogue / track card** | **One-line promise** + link **“How we teach (~1 min)”** | Always; returners skip A but can replay |
| **C — Lesson 1 `reveal`** | **3–4 lines** echoing throughput + link **“Full briefing”** | Every visit; does not replace A for first-timers |

**Recommendation:** **A + B + C.** Persist **“briefing seen”** with `localStorage` key e.g. `inpact.restaurantTrack.briefing.v1`. **Never** block the primary CTA **Open lesson 1** — always offer **Skip — I’ll learn by doing**.

### Progressive disclosure (no boredom, no essay dump)

**Constraints:** each beat **≤ ~90s** read/tap; **4–5 beats** max before catalogue; **no mandatory quiz** for v1.

| Beat | Goal | Interaction | Copy direction |
|:----:|------|---------------|----------------|
| **0** | Hook + honesty | Headline + sub + 2 CTAs | **Headline:** *Most internal tools reuse a small set of UI patterns.* **Sub:** *You’ll learn them by building inventory transparency—then the same patterns scale to recipes, plans, and orders.* **Buttons:** **[Walk me through (~1 min)]** · **Skip to lessons]** |
| **1** | Name the **7 patterns** without walls of text | **Carousel** (swipe / Next) or **7 accordions** (titles only until opened); **≤12 words** per pattern + **one restaurant example** each | e.g. **Lists** → *“Every grocery row in one place.”* |
| **2** | “What you’re building” | **3 bullets** or simple diagram | *Groceries on hand → what should yield → what moved → where money leaks.* |
| **3** | Map to **lesson spine** | **Compact stepper** or mini-table: *1–3 → 4–6 → 7–9 → 10–13 → 14–16 → (17) → 18–22 RTK → 23–25 RBAC* | *Bottom-up UI first; then RTK like many teams ship; then who may change what.* |
| **4** | Mindset close | **One line** + enter catalogue | *Data’s journey: **see it → act → update → see it again**—that’s most enterprise software.* → **[View lessons]** |

**Tone:** Prefer **credible curiosity** over clickbait. If you use a “secret” hook, soften: *“There isn’t really a secret—there’s a short pattern list. Here it is.”*

### Buttons & a11y

- Primary: **Walk me through (~1 min)**  
- Secondary: **Skip to lessons**  
- Catalogue: **Replay track briefing** (link or ghost button)

**Accessibility:** Respect `prefers-reduced-motion` (static accordion stack vs carousel). **Escape** closes modal; focus returns to trigger. **Reduced cognitive load:** beat 1 defaults to **titles-only**; body copy opens on **user expand**.

---

## Lesson 1 — First inventory screen

| | |
|--|--|
| **Prereq** | None (first in track) |
| **Files / deliverables** | `App.tsx` or `src/app/App.tsx` minimal; `GroceryItemCard.tsx` with static props |
| **Story** | “First thing the owner sees: one line of trust — what’s on hand.” |
| **Objectives (example)** | Create a typed component; pass props; render image + text + expiry line; export for reuse. |
| **Nodes** | `reveal` (tagline + story) → `objectives` → `question` steps: **phase 1–3** imports + types for props + component shell → **phase 5** JSX for card layout → **phase 7** export + wire in parent stub |

---

## Lesson 2 — Interactive grocery card

| | |
|--|--|
| **Prereq** | Lesson 1 |
| **Files** | Extend `GroceryItemCard.tsx` |
| **Story** | Status + quantity changes = “what the kitchen touched vs what’s left.” |
| **Objectives** | Local state for quantity; pill for status; button handler; disabled rules when qty = 0. |
| **Nodes** | `reveal` → `objectives` → steps: **phase 4** `useState` → **phase 5** pill + stepper JSX → **phase 6** handlers → **phase 7** wire `onClick` / `onChange` |

---

## Lesson 3 — Production-ready card edges

| | |
|--|--|
| **Prereq** | Lesson 2 |
| **Files** | `GroceryItemCard.tsx`; optional tiny `formatMoney.ts` or inline |
| **Story** | Money and images are where trust breaks — polish = credibility. |
| **Objectives** | Currency display; optional empty row; `onError` / fallback for images. |
| **Nodes** | `reveal` → `objectives` → steps: **phase 2** helpers/types → **phase 5–7** fallback img + money line + conditional empty |

---

## Lesson 4 — From one card to many

| | |
|--|--|
| **Prereq** | Lesson 3 |
| **Files** | `GroceryInventoryList.tsx` (or section in `App` then extract) |
| **Story** | Inventory is a **set** of lines — owner scans the wall. |
| **Objectives** | `map` with stable `key`; flex row/grid; pass props into card. |
| **Nodes** | `reveal` → `objectives` → steps: **phase 1** import card → **phase 2** item type → **phase 3** list component shell → **phase 5** map JSX → **phase 7** keys + layout |

---

## Lesson 5 — List framing

| | |
|--|--|
| **Prereq** | Lesson 4 |
| **Files** | `GroceryInventoryList.tsx`, small `InventorySectionHeader.tsx` optional |
| **Story** | Count + empty state = “do I have a blind spot?” |
| **Objectives** | Header with count; empty state branch; scroll container styles. |
| **Nodes** | `reveal` → `objectives` → steps: conditional render; scroll region; accessible heading |

---

## Lesson 6 — Browse & narrow

| | |
|--|--|
| **Prereq** | Lesson 5 |
| **Files** | `GroceryInventoryList.tsx`, `GroceryDetailPanel.tsx`, `FilterChips.tsx` (can collapse files per engine limits) |
| **Story** | Owner drills into **one** line item + filters “soon to expire.” |
| **Objectives** | Selected id state; master–detail; chip filter; controlled search input. |
| **Nodes** | Multiple `question` steps: selection lift (still local to screen) → detail panel → chips → search (derive filtered list) |

---

## Lesson 7 — Inventory screen v1

| | |
|--|--|
| **Prereq** | Lesson 6 |
| **Files** | `InventoryScreen.tsx` composing list + detail + header |
| **Story** | One **feature screen** the owner lives in daily. |
| **Objectives** | Compose children; layout regions; props down for static demo data. |
| **Nodes** | `reveal` → `objectives` → composition steps only (thin code moves if prior lessons extracted components) |

---

## Lesson 8 — Signals on the page

| | |
|--|--|
| **Prereq** | Lesson 7 |
| **Files** | `LowStockBanner.tsx`, `YieldHintStrip.tsx` (or sections inside `InventoryScreen`) |
| **Story** | **Yield** = expected plates per purchased unit; **low stock** = money on the line. |
| **Objectives** | Derive banner from props/list; read-only yield copy from fixture data shape `{ yieldPerLb, dishesSold, purchasedLb }` simplified. |
| **Nodes** | `reveal` (ROI framing) → `objectives` → steps: pure props + derived booleans/strings (no global store yet) |

---

## Lesson 9 — Add grocery flow

| | |
|--|--|
| **Prereq** | Lesson 8 |
| **Files** | `AddGroceryModal.tsx`, actions in `InventoryScreen` |
| **Story** | New purchase line enters the same transparency model. |
| **Objectives** | Modal open/close; form fields; submit adds to **local** list (callback to parent); toast. |
| **Nodes** | `reveal` → `objectives` → steps: modal shell → controlled fields → submit handler → parent updates list (still prop drilling OK) |

---

## Lesson 10 — Shared inventory state

| | |
|--|--|
| **Prereq** | Lesson 9 |
| **Files** | `InventoryContext.tsx`, wrap `InventoryScreen` |
| **Story** | One source of truth = no “two clipboards” in kitchen vs office. |
| **Objectives** | `createContext`, provider, `useContext`, typed context value; lift list + selection. |
| **Nodes** | `reveal` → `objectives` → steps: **phase 2** context type → provider component → consumer refactors |

---

## Lesson 11 — Inventory reducer

| | |
|--|--|
| **Prereq** | Lesson 10 |
| **Files** | `inventoryReducer.ts`, `InventoryProvider.tsx` |
| **Story** | Every add/use/adjust is an **auditable** transition (prep for ROI math). |
| **Objectives** | `useReducer`; actions: ADD, UPDATE_QTY, CONSUME, REMOVE; memoized selectors for counts / “at risk” totals. |
| **Nodes** | `reveal` → `objectives` → steps: action unions → reducer → wire provider → memo |

---

## Lesson 12 — Async inventory load

| | |
|--|--|
| **Prereq** | Lesson 11 |
| **Files** | `public/fixtures/inventory.json` or `src/fixtures/...`, load in provider |
| **Story** | Data “comes from somewhere” like a real back office sync. |
| **Objectives** | `useEffect` fetch; loading UI; error + retry; dispatch `HYDRATE` to reducer. |
| **Nodes** | `reveal` → `objectives` → async steps; guard double-fetch in Strict Mode if you teach it |

---

## Lesson 13 — Survive refresh + hook

| | |
|--|--|
| **Prereq** | Lesson 12 |
| **Files** | `useInventory.ts`, persistence in provider or hook |
| **Story** | Owner closes laptop — numbers shouldn’t ghost. |
| **Objectives** | `localStorage` serialize/deserialize; custom hook exposing `{ items, dispatch, filters, ... }`; migration-safe JSON parse. |
| **Nodes** | `reveal` → `objectives` → persistence + refactor consumers to hook |

---

## Lesson 14 — App frame

| | |
|--|--|
| **Prereq** | Lesson 13 |
| **Files** | `AppLayout.tsx`, `TopNav.tsx` |
| **Story** | Inventory is one room; the **building** has more later. |
| **Objectives** | Slots for outlet; nav links (placeholders); semantic layout. |
| **Nodes** | Composition-heavy; minimal new logic |

---

## Lesson 15 — Routes & provider stack

| | |
|--|--|
| **Prereq** | Lesson 14 |
| **Files** | `main.tsx` / router entry, route modules |
| **Story** | Deep links = “show me inventory now.” |
| **Objectives** | `BrowserRouter` / `HashRouter` (match app); routes; provider order **outer → inner** correctly. |
| **Nodes** | `reveal` → `objectives` → router shell steps |

---

## Lesson 16 — Resilience

| | |
|--|--|
| **Prereq** | Lesson 15 |
| **Files** | `NotFound.tsx`, `RootErrorBoundary.tsx` |
| **Story** | Bad URL or thrown error shouldn’t look like “the business died.” |
| **Objectives** | 404 route; error boundary with reset; user-facing copy. |
| **Nodes** | `reveal` → `objectives` → boundary + fallback UI |

---

## Lesson 17 (optional) — Auth-aware shell

| | |
|--|--|
| **Prereq** | Lesson 16 |
| **Files** | `AuthLayout.tsx`, stub `useAuth()` |
| **Story** | Owner vs staff view later; now UI-only split. |
| **Objectives** | Conditional layout; placeholder login CTA. |
| **Nodes** | Thin; can merge into 16 if you want strictly 16 lessons |

---

## Phase 3 — State management modules (Redux Toolkit + more RTK)

*Prereq:* **lessons 10–16** (context + reducer + async + persistence + router) so learners understand **why** the store exists before migrating. **Pedagogy:** introduce **one RTK concept per lesson**; migrate **inventory** from context/hook into **slice + RTK Query** incrementally to avoid a Big Bang rewrite.

### Lesson 18 — Redux store foundation

| | |
|--|--|
| **Prereq** | Lesson 16 (or 17 if you ship auth shell first) |
| **Files** | `src/app/store.ts`, `hooks.ts` (`useAppDispatch`, `useAppSelector`), `main.tsx` `<Provider store={store}>` **outside** `BrowserRouter` per team convention |
| **Story** | “Real apps centralize truth so every screen agrees.” |
| **Objectives** | `configureStore`; typed root state & dispatch; single store provider; dev-only Redux DevTools note. |
| **Nodes** | Minimal UI change: one read from store (e.g. read-only count) to prove wiring |

### Lesson 19 — Inventory feature slice (`createSlice`)

| | |
|--|--|
| **Prereq** | Lesson 18 |
| **Files** | `src/features/inventory/inventorySlice.ts`, replace or wrap prior context |
| **Story** | Same reducer lessons as before—now **portable** and testable. |
| **Objectives** | `createSlice` + typed `PayloadAction`; selectors; connect one screen to slice. |

### Lesson 20 — RTK Query: read API (`createApi`)

| | |
|--|--|
| **Prereq** | Lesson 19 |
| **Files** | `src/features/inventory/inventoryApi.ts` (or `baseApi` + `injectEndpoints`) |
| **Story** | “Inventory rows come from a server-shaped source.” |
| **Objectives** | `createApi` + `fetchBaseQuery`; `useGetInventoryQuery`; **tags** (`providesTags`); loading / error from hook; keep fixture or MSW. |

### Lesson 21 — RTK Query: writes & cache

| | |
|--|--|
| **Prereq** | Lesson 20 |
| **Files** | extend `inventoryApi` |
| **Story** | Add grocery / adjust qty hits the “server”; list stays consistent. |
| **Objectives** | `useMutation`; `invalidatesTags` / optimistic updates (pick one depth per cohort); error handling on mutation. |

### Lesson 22 — Advanced RTK (pick a track)

| | |
|--|--|
| **Prereq** | Lesson 21 |
| **Files** | e.g. `listenerMiddleware.ts` **or** `entityAdapter` inside slice |
| **Story** | **Listeners:** audit log side-effects on `inventory/*` actions. **Entity adapter:** normalized ids for large lists + memo selectors. |
| **Objectives** | One path taught deeply; the other referenced as “next read.” |

---

## Phase 4 — RBAC (roles, guards, audit UX)

*Prereq:* **lesson 23** assumes **role** exists in auth stub or store (extend **17** or a tiny `authSlice`). Tie **lesson 22** listener audit to **lesson 25** readout when possible.

### Lesson 23 — Roles & permission model

| | |
|--|--|
| **Prereq** | Lesson 22 (or 17 + 19 if you reorder) |
| **Files** | `src/auth/roles.ts`, `permissions.ts` (map `action` → roles), TypeScript role union |
| **Story** | Owner sees all; chef adjusts usage; staff read-only—**explicit matrix**. |
| **Objectives** | Central permission map; pure `can(user, 'inventory:adjust')` helper; no UI yet beyond dev badge. |

### Lesson 24 — Guarded routes & gated actions

| | |
|--|--|
| **Prereq** | Lesson 23 |
| **Files** | `ProtectedRoute.tsx`, route-level `loader` or wrapper; hide/disable **Mark used**, **Add**, **Save** by permission |
| **Story** | Wrong role **cannot** trigger leaks in data they shouldn’t touch. |
| **Objectives** | 403 / redirect pattern; accessible “You don’t have access” copy; **same** gating in RTK thunks optional. |

### Lesson 25 — Audit trail (owner readout)

| | |
|--|--|
| **Prereq** | Lesson 24 |
| **Files** | `AuditLogPanel.tsx`, feed from listener-reducer or RTKQ `getAuditLog` mock |
| **Story** | Owner answers “**who** moved the numbers?” |
| **Objectives** | Read-only table; filter by user/date; link row to **commit** or action id if you teach that later. |

---

## Per-lesson INPACT skeleton (repeat every engine)

Each `inpact_*_engine.jsx` (or future naming):

1. **`reveal`** — `tag`, `title`, `body`, `usecase` tying to **ROI / leak / yield** narrative.  
2. **`objectives`** — 3–5 measurable bullets (verbs: implement, explain, debug, …).  
3. **`question` nodes** — one atomic concern per step; `paal` outcome-first; seed matches phase; feedback correct/partial/wrong.  
4. **`sideItems`** — align with node ids.  
5. **Last step** — learner sees **clear “done”** state in preview + copy that says what **owner** gained.

---

## Phase 2+ roadmap (domain — after Phase 1 core 1–16)

- **Recipes & yield graph:** many-to-many grocery ↔ dish; editable yields; variance vs plan.  
- **Monthly plan & orders:** plan → stock checks → possible orders; wastage reporting.  
- **Staff identities:** tie **RBAC** to real users (beyond stub roles).  
- **Market benchmark:** neighborhood comparison (advanced analytics).

**Phase 3–4** (lessons **18–25** above) are **orthogonal**: RTK + RBAC can begin once **16** (and ideally **17**) are stable, **before** or **in parallel** with Phase 2 domain lessons—sequence is a product choice (some teams teach RTK right after local state; others after one full vertical slice ships).

---

*Use this doc when authoring `NODES` and when setting `getLessonPrereqs` / curriculum rows. Update file paths if the monorepo layout differs.*
