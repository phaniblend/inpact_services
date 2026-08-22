# Algorithm Families — INPACT Pedagogy

Family-aware algorithm lessons use a **universal beginner flow** with **family-specific concept-bridge and reveal** so the same teaching structure works across array/hashmap, sliding window, linked list, tree, graph, recursion, DP, stack/queue, binary search, two pointers, greedy, and backtracking.

## Family teaching profiles

Defined in `src/ai-lessons/algorithmFamilyProfiles.js`. Use `getAlgorithmFamilyTeachingProfile(family)` and `getAlgorithmFamilyFromTitle(lessonTitle)`.

| Family | Mental model | Concept bridge focus |
|--------|--------------|----------------------|
| **array-hashmap** | Remember what we have already seen | Lookup structure to avoid re-scanning |
| **sliding-window** | Move a stretch/window across the array | When to expand vs shrink |
| **linked-list** | Walk node by node; no direct indexing | Pointer mental model first |
| **tree** | Explore branches from a root | Branch/root, visit order, base case |
| **graph** | Explore a network while avoiding revisits | Introduce "visited" before use |
| **recursion** | Solve a smaller version of the same lesson | Base case + smaller-lesson thinking |
| **dynamic-programming** | Reuse answers to smaller subproblems | Remember solved subproblems; reuse |
| **stack-queue** | LIFO / FIFO | Real-life metaphor (plates, line) then code |
| **binary-search** | Cut the search space in half | Sorted prerequisite, midpoint |
| **two-pointers** | Two positions moving through the data | Move left/right to avoid nested scans |
| **greedy** | Best local choice at each step | When local best = global best |
| **backtracking** | Try → explore → undo | Try, recurse, undo |

## Universal lesson flow

1. **intro** — Hook and what we'll learn  
2. **objectives** — 3–5 learning objectives  
3. **discovery** — Tiny concrete case; learner tries something natural (family-specific)  
4. **reflection** — Guided reflection on what they did  
5. **scale-problem** — What breaks at larger scale  
6. **concept-bridge** — Introduce the family mental model (adapt wording by family)  
7. **reveal-idea** — Reveal the better idea using that mental model  
8. **flow-explainer** (optional) — Numbered steps or flowchart-style logic  
9. **code-step(s)** — One or more implementation steps (cumulative seedCode)  
10. **complete** — Summary and what to remember  

## Example progressions

### Two Sum (array-hashmap)

- **Discovery:** Small array, e.g. [2, 7, 11, 15], target 9 — “Which two numbers add to 9?” Learner may check pairs by eye.  
- **Reflection:** “You checked pairs; for a bigger array that gets slow.”  
- **Scale-lesson:** “With 10,000 numbers, checking every pair is too many.”  
- **Concept-bridge:** “Remember what we’ve already seen — use a structure to look up ‘do we have a number that pairs with this one?’”  
- **Reveal-idea:** One pass: for each number, check if (target - number) is in our “seen” structure; then add this number to it.  
- **Code-step(s):** Initialize map → loop → complement check → store current.  

### Longest Substring Without Repeating Characters (sliding-window)

- **Discovery:** Short string, e.g. "abcabcbb" — “What’s the longest stretch with no repeated letter?” Focus on a **contiguous group**.  
- **Reflection:** “You moved a ‘window’ of characters; when you see a repeat, the window has to change.”  
- **Scale-lesson:** “Trying every possible start and end is too slow.”  
- **Concept-bridge:** “Think of a **moving segment**: when to **expand** the window, when to **shrink** it.”  
- **Reveal-idea:** Maintain a window [left, right]; expand by moving right; when we see a duplicate, shrink from the left until the duplicate is gone.  
- **Code-step(s):** Two pointers (left, right), set/map for characters in window, expand/shrink logic.  

### Reverse Linked List (linked-list)

- **Discovery:** Draw 3 nodes A → B → C. “How would you reverse the arrows?” Emphasize **node-by-node**; no jumping by index.  
- **Reflection:** “We can only move along next (and maybe prev); we can’t jump to node 2 by index.”  
- **Scale-lesson:** “We need to do it in one pass without copying the whole list.”  
- **Concept-bridge:** “**Pointer mental model**: we walk node by node; we need a place to remember the ‘already reversed’ part.”  
- **Reveal-idea:** As we walk, we flip the next pointer to point backward and keep a reference to the new head.  
- **Code-step(s):** prev/curr pointers, reverse one link at a time, update head.  

### Maximum Depth of Binary Tree (tree)

- **Discovery:** Small tree (root + left + right). “How ‘deep’ is this tree?” Use **branch/root** language.  
- **Reflection:** “We’re exploring from the root down branches; at each node we can go left or right.”  
- **Scale-lesson:** “We need a rule that works for any size tree.”  
- **Concept-bridge:** “**Explore branches from the root**; the depth at a node is 1 + the max of the depths of its branches.”  
- **Reveal-idea:** Recursively: if no node, depth 0; else 1 + max(left depth, right depth).  
- **Code-step(s):** Base case (null), recursive case (1 + max(left, right)).  

### Number of Islands (graph)

- **Discovery:** Small 2D grid with a few 1s and 0s. "How many connected groups of 1s?" Focus on **neighbors** and **visiting**.
- **Reflection:** "We explore from one cell to its neighbors; we must avoid counting the same island twice."
- **Scale-lesson:** "We need a way to mark what we've already visited."
- **Concept-bridge:** "**Explore a network while avoiding revisits** — introduce a 'visited' set or mark cells; once we've explored an island, we don't count it again."
- **Reveal-idea:** BFS or DFS from each unvisited 1; mark visited; count connected components.
- **Code-step(s):** Visit grid, BFS/DFS helper, visited tracking, count islands.

### Fibonacci / Factorial (recursion)

- **Discovery:** "What is 3! or fib(4)?" Use very small inputs; learner may do by hand.
- **Reflection:** "You broke it into smaller steps — 3! = 3 × 2!, etc."
- **Scale-lesson:** "We need a rule that works for any n without writing all the steps."
- **Concept-bridge:** "**Solve a smaller version of the same lesson** — base case (0! = 1, fib(0)=0, fib(1)=1) and recursive case (n! = n × (n-1)!, fib(n) = fib(n-1) + fib(n-2))."
- **Reveal-idea:** Define function that calls itself with smaller input; show base case first.
- **Code-step(s):** Base case, recursive call, return.

### Climbing Stairs / Coin Change (dynamic programming)

- **Discovery:** "How many ways to climb 3 steps if you can take 1 or 2 at a time?" Small n; learner may list.
- **Reflection:** "You're reusing the same small answers — ways(3) uses ways(2) and ways(1)."
- **Scale-lesson:** "We need to avoid recomputing; remember answers to smaller subproblems."
- **Concept-bridge:** "**Reuse answers to smaller subproblems** — store results in a table or array; fill in order so we have smaller answers when we need them."
- **Reveal-idea:** Define recurrence; fill table bottom-up (or memoize); return final cell.
- **Code-step(s):** Table/memo init, recurrence, return.

## Schema / content

Optional fields on lesson config (algorithm lessons only):

- `algorithmFamily` — e.g. `"sliding-window"`
- `familyTeachingProfile` — `{ mentalModel?, conceptBridge?, visualMetaphor?, commonConfusions? }`

Optional on step content (concept-bridge / reveal-idea):

- `visualMetaphor` — Short text for the “VISUAL” callout in the renderer  
- `mentalModel` / `conceptBridge` — For display or future use  
- `commonConfusions` — Array of strings; rendered as "COMMON QUESTIONS" list when present  

Step types supported by the renderer:

- `discovery`, `reflection`, `scale-problem`, `concept-bridge`, `reveal-idea`, `flow-explainer`, `complete` — rendered as algo reveal (body + optional visualMetaphor + optional commonConfusions + Continue)  
- `lesson`, `example`, `reasoning`, `dryRun` — unchanged  
- `flowchart` — unchanged  
- `question` — code step with editor  

## Generation

- **Prompt:** `ALGO_MASTER_BEGINNER_PROMPT` in `src/ai-lessons/prompt-templates/algoMasterBeginner.js`  
- **Variables:** Injected via `defaultVars(params)` and `getAlgorithmFamilyPromptVars(params)` (ALGORITHM_FAMILY, MENTAL_MODEL, CONCEPT_BRIDGE, VISUAL_METAPHOR, COMMON_CONFUSIONS).  
- **Pipeline:** `generateAlgoLessonStepsOnly` uses the master prompt first; if the response is valid JSON with a `steps` array, those steps are used; otherwise fallback to Socratic markdown parsing.  
- **Title → family:** `getAlgorithmFamilyFromTitle(lessonTitle)` in `algorithmFamilyProfiles.js` (keyword-based; extend as needed).  

## Files touched

| File | Change |
|------|--------|
| `src/ai-lessons/algorithmFamilyProfiles.js` | **New.** Family profiles + getAlgorithmFamilyTeachingProfile, getAlgorithmFamilyFromTitle, getAlgorithmFamilyPromptVars. |
| `src/ai-lessons/prompt-templates/algoMasterBeginner.js` | **New.** Master family-aware algorithm prompt (outputs steps JSON). |
| `src/ai-lessons/prompt-templates/index.js` | Export ALGO_MASTER_BEGINNER_PROMPT. |
| `src/ai-lessons/schema.js` | algoBeginnerContentSchema, algoBeginnerRevealStepSchema, familyTeachingProfileSchema; lessonConfigSchema.algorithmFamily, .familyTeachingProfile. |
| `src/ai-lessons/adapters/normalizeToEngineConfig.js` | Map discovery, reflection, scale-problem, concept-bridge, reveal-idea, flow-explainer, complete to algo reveal nodes. |
| `src/engines/inpact_engine_shared.jsx` | Render new step types in renderAlgoReveal; show visualMetaphor for concept-bridge/reveal-idea. |
| `src/ai-lessons/services/realLessonService.js` | generateAlgoLessonStepsOnly: use ALGO_MASTER_BEGINNER_PROMPT + family vars; parseMasterAlgoStepsJson; fallback to Socratic. |
| `docs/ALGORITHM_FAMILIES.md` | **New.** This doc. |

Existing non-algorithm lessons and the rest of the INPACT engine are unchanged.
