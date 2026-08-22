# ICON master prompt — INPACT + collaborative app-dev track

Use this document as the **system / product brief** when designing, implementing, or reviewing work for **ICON** (working name: **I**npact **CON**struction, or **ICON** = INPACT + app-dev-focused delivery). Paste relevant sections into agent chats or PR descriptions so scope stays aligned.

---

## 0. Non-negotiable boundary: leave original INPACT alone

- **Repository `PALL-INPACT` (canonical INPACT)** is the existing product: engines, curriculum, auth, lesson shell, rules under `.cursor/rules/`, etc.
- **Do not** refactor, rename, or repurpose core INPACT lesson engines or shared factories **for ICON’s sake** inside that repo unless there is an explicit, separate product decision.
- **ICON** is a **separate codebase** (new repo, e.g. `ICON` or `pall-icon`), optionally consuming INPACT as a **dependency**, **git submodule**, **published package**, or **documented API** — pick one integration strategy per phase and stick to it.
- Any shared code that truly must live in both worlds should be **extracted to a tiny shared package** with a clear boundary, not by entangling ICON into `src/engines/react-ts/` of PALL-INPACT.

---

## 1. What ICON is

**ICON** = pedagogy and tooling inspired by **INPACT** (incremental steps, validation, feedback loops, measurable objectives) **plus** a **real software delivery** metaphor:

- Learners build a **single long-running product** (e.g. restaurant inventory / wastage / yield vs supply) **bottom-up**: decompose into features → components → UI, teach one building block per lesson/task.
- Artifacts live in a **real Git repository** with a **stable folder layout** (feature folders, components, types, app shell), not only in ephemeral browser state.
- **Multiple learners** participate in **one shared codebase**, like a real team: tasks/lessons are **assigned or claimed**, work is **reviewed** (optional phase), **merged**, and everyone sees **updated main (or integration branch)**.

ICON optimizes for: **collaboration**, **commit history**, **merge conflicts as teachable moments** (later), and **portfolio evidence** (real repo URL).

---

## 2. Pedagogical spine (restaurant app — example product)

**North star:** A hypothetical **restaurant operations** app that reduces waste and clarifies ROI: inventory, expiration awareness, yield mapping (e.g. inputs → multiple recipe outputs), orders, staff, etc. Numbers and domains are **pedagogical**, not accounting truth.

**Teaching style:**

- **Project-first, bottom-up:** each lesson delivers one **visible, testable** unit (e.g. `GroceryItemCard` → list with `map` → selection/detail → badges for “expires soon”, etc.).
- **Decomposition is explicit** in every intro: app → feature area → screen → component → this lesson’s slice.
- **INPACT-style lesson quality** inside ICON tasks: intro + objectives + small steps + hints + feedback; where the stack is React+TS, honor the **7-phase UI flow** for generated/authoring guidance (imports → module scope types → component shell → state → JSX → handlers → wire) so lessons stay uniform and auditable.

**Avoid:** front-loading “all of TypeScript syntax” before the app needs it. **Spiral:** introduce types, testing, a11y, data modeling when the **current feature** demands it.

---

## 3. Multi-user distribution (core differentiator)

**Problem ICON solves:** In classic INPACT, one learner completes the whole curriculum sequentially. In ICON, **the restaurant app is larger than one person’s sprint** — mirror industry.

**Model:**

- **One canonical team repo** (or one org repo per cohort) with **protected main** and **feature branches / PRs** (complexity ramps over time).
- **Tasks** map to lessons or micro-lessons: e.g. “Implement `GroceryItemCard`”, “Add `GroceryInventoryList` with empty state”, each with **acceptance criteria** and **file paths** touched.
- **Assignment:** admin/mentor assigns tasks **or** learners **claim** from a queue (with limits: one in-progress task per user, WIP caps, etc.).
- **Completion:** passing ICON’s checks (tests/lint/instruction keywords as you define) triggers **commit** (or opens PR) attributed to that user.
- **Visibility:** all learners can **pull / sync** the latest codebase in the learning UI (read-only tree + optional “try main in preview” vs “my branch”).

**Scalability to “Jira-like”:** task IDs, states (todo / in progress / review / done), priorities, labels (feature:inventory, skill:hooks), linking to commits and file paths. Start with a **minimal task table** + Git host issues optional later.

---

## 4. Git / VC integration (high level)

- **Host:** prefer API-first, self-hostable options (**Gitea** or **GitLab CE**) for repos, commits, and optionally issues; OAuth links learners to identities.
- **Contract:** repo created at **cohort kickoff** or **first task claimed**; **one commit (or one PR)** per completed task; **commit messages** machine-friendly, e.g. `icon(task-07): add GroceryInventoryList`.
- **Learner UI:** file tree of repo at selected ref (main vs branch); diff view later; “sync latest” button.
- **Security:** secrets never in learner code; host tokens server-side; row-level auth so learners only see cohorts they belong to.

Do not block ICON v0 on full PR flow: **main-only commits per user in separate folders** is a possible degraded v0 if you must ship faster (still teach collaboration via **task ownership** and **read-only full tree**).

---

## 5. Repo layout (ICON codebase itself vs learner product repo)

**ICON repo (the product you build):**

- Backend: auth, cohorts, task queue, Git proxy/webhooks, validation runner.
- Frontend: task board, editor/preview integration, repo browser, lesson shell **or** embedded INPACT widget if integrated.
- Docs: this prompt, ADRs, API contracts.

**Learner team repo (artifact):**

- Example: `src/features/inventory/components/...`, `src/app/...`, shared `types` as the curriculum introduces them.
- Single **canonical tree** document used by **task definitions** so file paths never drift.

---

## 6. Phased delivery (recommended)

| Phase | Outcome |
|------:|---------|
| **1** | ICON monorepo skeleton; auth; single-user **mock** Git (zip export or local dev writes) to validate “commit on pass” UX. |
| **2** | Real remote repo per cohort; commit on pass; file tree from API. |
| **3** | Multi-user task queue + assign/claim; attribution on commits. |
| **4** | Branches + PRs + optional CI; conflict / merge teaching path. |
| **5** | Issue sync / full “Jira-lite” in DB + notifications. |

---

## 7. Agent instructions (when working in ICON repo)

1. **Never** modify `PALL-INPACT` unless the user explicitly opens a task that says “change upstream INPACT” — default is **ICON only**.
2. Prefer **small PRs**: task API, one UI surface, one Git operation path.
3. **Document contracts**: OpenAPI or typed routes for task + repo + commit events.
4. **Test** assignment race conditions (two users claim same task) and idempotent commits.
5. **Privacy:** cohort isolation; no cross-tenant repo access.
6. When authoring **curriculum content** for ICON, keep the **restaurant narrative** and **file path** in every task description so the AI/human author stays consistent.

---

## 8. One-line elevator pitch (for READMEs)

> **ICON** is collaborative, Git-backed app construction for learners: many people, one product, real commits — INPACT-grade pedagogy without replacing the original INPACT codebase.

---

## 9. Optional: paste block for Cursor / agents

```
You are working on ICON — a separate product from PALL-INPACT (canonical INPACT). Do not modify PALL-INPACT unless explicitly asked.

ICON goals:
- Multi-learner shared Git repo for one long-running app (e.g. restaurant inventory / wastage / yield).
- Tasks/lessons distributed across users (assign/claim); codebase always visible and updatable like a real team.
- Commit (or PR) on task completion; stable src/ feature-folder layout.
- Pedagogy: INPACT-style steps and React-TS 7-phase authoring rules for lesson content; project-first, bottom-up decomposition.

Implement only what the user’s current message asks; prefer small, testable changes; document API contracts.
```

---

*End of ICON master prompt. Update this file as ADRs land (integration choice, Git host, task schema).*
