# IPF Devguide — read this first if context was lost

This file exists because conversation history has been lost before. If you're a fresh Claude session
(or the human) picking this up cold, read this whole file before touching code. It tells you what IPF
is, what's built, what's verified, and exactly what's left.

> **Stale-header warning (resolved 2026-08-09):** older top-of-file summaries used to say API keys were
> empty and that “nothing in this repo is access-controlled.” Both are wrong now — see §0 and §5a
> below. Prefer dated `§5a-N` entries and [`docs/HANDOFF.md`](./HANDOFF.md) over any leftover
> historical wording deeper in this file.

**TL;DR as of 2026-08-09: IPF’s six-stage pipeline + auth are built and live-verified locally.
Remaining go-live gates are mostly ops (Google OAuth publish status, first remote commit) — not missing
core product code. See §6.**

---

## 0a. Update — live-tested since this doc was written (2026-08-04, later same day)

Both blockers in the original §0 are now resolved and **verified with real calls, not just presence checks**:
- `DEEPSEEK_API_KEY` and `GEMINI_API_KEY` are funded and working. Stage 1, Stage 2, Stage 3, and ID Module
  generation have each produced real, correctly-shaped output against the live APIs.
- OneDev and Mattermost were confirmed running via Docker Desktop (containers `onedev-inpact`,
  `ipf-mattermost`, `ipf-postgres`) — OneDev returned its real, pre-existing project list (ids 1–4 all
  present and correctly named) and Mattermost accepted a real webhook post. **Note: these are three
  separate Docker containers, not part of this repo — they need Docker Desktop running and get stopped
  whenever the machine/session resets. Check `docker ps -a` at the start of any new session before
  assuming they're up.** A `docker-compose.yml` now exists at the repo root for **new** machines; prefer
  `docker start` of the existing named containers on this handoff machine so you keep seeded OneDev data.

**A real bug was found and fixed in the process**: `generateStructured()` in
[`src/specforge/llmProvider.js`](../src/specforge/llmProvider.js) only ever told the model "respond with
JSON" — it never included the actual field names/shape, so the model had to guess the schema from context.
DeepSeek guessed wrong on Stage 1's first-ever live run (dropped `product_name` and `target_users`). Fixed
by compiling the Zod schema to JSON Schema (`z.toJSONSchema(schema)`, available in the installed Zod 4.3.6)
and putting it directly in the prompt. Re-verified working after the fix — this was the pipeline's first
live test ever, so treat any other SpecForge/ID-module output that looks structurally "creative" with the
same suspicion until it's been run for real, not just read as code.

**A second, more serious bug was found and fixed right after**: a live Gemini test generation produced
JSX with an unescaped raw newline inside a regular string. Because Assist Me's `import.meta.glob("../engines/assist/*.jsx", { eager: true })`
loads *every* file in that directory eagerly at build time, that one malformed file broke Vite's
compilation for the **entire app**, not just that tutorial — every route went blank. This is a real blast-radius
risk any time ID Studio or SpecForge's auto-drafting writes a new file there. Fixed in
[`src/id-module/generateModule.js`](../src/id-module/generateModule.js): generated code is now validated
with `esbuild.transformSync(code, { loader: "tsx" })` **before** it's written to disk, with one retry
(error fed back to Gemini, same pattern SpecForge's `generateStructured` already used) — a generation that
still fails to parse after retry is now a clean thrown error, never a corrupted file on disk. `esbuild` was
promoted from a transitive (Vite) dependency to an explicit one in `package.json` since server code now
depends on it directly. **If the whole app ever goes blank with no console error pointing at your own
change, check for a syntactically broken file under `src/engines/assist/` before anything else** — Vite's
error will show a "Pre-transform error" with the exact file/line in its own logs, not the browser console.

**UI click-through status (updated 2026-08-09):** PD Studio publish, Recruit auto-match, Google OAuth,
LDAP core login, Workbench JS-scoped view, enterprise-readiness gate, core-lesson session loop, and CD
Review were live-verified. See [`docs/HANDOFF.md`](./HANDOFF.md) §8.

---

## 0. External setup status (updated 2026-08-09)

| Item | Status |
|---|---|
| `DEEPSEEK_API_KEY` / `GEMINI_API_KEY` | Funded and working since 2026-08-04 |
| OneDev / Mattermost / LDAP Docker containers | Hand-started on this machine; see root `docker-compose.yml` for new envs |
| Auth (LDAP core + Google JS + JWT session) | Built and live-verified — see §5a |
| Google OAuth Cloud Console audience | Still in **Testing** — only allowlisted test users can sign in until published |
| `AUTH_SESSION_SECRET` | Rotated 2026-08-09; keep it only in `.env` |
| `oauthcreds.json` | Must stay gitignored — secrets belong in `.env` only |

Historical note: earlier drafts of this section described empty API keys and downed containers as the
only blockers. Those code-time blockers are resolved; remaining cutover items are listed in §6.

---

## 1. The problem IPF solves (in the founder's own words)

> We're bridging the gap between fresh grads and industry needs — a chicken-egg problem: you get a job
> if you have experience, you get experience if you get a job. So we built a virtual enterprise (IPF)
> where we recruit **JS** (jobseekers — students, unemployed, or career-switchers) who apply for a role
> stating their interest (PM, coding, UI design, testing — any/all trades of enterprise app dev). IPF
> finds them a project based on that interest. We don't mock these projects — our core product team
> researches real products that would help small/medium businesses (SMBs) who can't afford custom
> software. PD submits the idea to SpecForge, which breaks it into specs/tasks. Workbench turns those
> into stories/tasks, creates cohorts (sprint teams), and makes them ready for a JS to be assigned.
> Once assigned, if the JS needs help on a task they click **Assist me**, which launches Inpact with the
> matching assistance module. Those modules come from a pool of lessons — one per generic UI/engineering
> building block (see the full catalog in `src/id-module/moduleCatalog.js`) — following the exact
> pedagogy of the main Inpact lesson engine. **A task is never assignable to a JS until it's wired to an
> assist module.** If SpecForge can't find a match, it drafts a new lesson automatically and notifies the
> ID team, who verify learning effectiveness before publishing — only then does the task unblock.

Every sentence in that brief now has working code behind it (§3).

---

## 2. What existed before this build (baseline)

Ten screens, hash-routed outside `App.jsx` (the main Inpact lesson product is untouched):

`/pd-studio` `/apply` `/matching-queue` `/core-studio` `/workbench` `/id-studio` `/assist-me`
`/huddle-calendar` `/contribution-monitor` `/human-capital-reports`

Backed by three local services (not part of this repo, must already be running — see §0):
- **OneDev** `localhost:6610` — issue tracker used as the system of record for almost everything.
  Project id `2` = cohort-applications, `3` = team-ops (huddles/warnings/votes/cohorts), `4` = module-library.
  Anything else is a delivery project.
- **Mattermost** `localhost:8065` — team chat, posted to via an incoming webhook (`server/notify-server.js`,
  `src/team-messaging/notify.js`).
- The existing AI server (`npm run server`, port 3000) — DeepSeek (SpecForge, mentor chat) + Gemini
  (ID Module code generation).

Every OneDev-backed screen reads/writes issue **descriptions as `Key: value` lines** (one key per line,
first `": "` splits key from value) — see `parseKV` in `server/onedev-client.js`. This convention is load-
bearing: every parser in the codebase depends on it. Don't switch to JSON-in-description or multi-line
values without updating every reader.

At baseline, PD Studio stopped at Stage 2 (no Approve/Publish), Workbench's "Assist me" was a free-standing
manual picker unconnected to any task, and nothing stopped an unwired task from being assigned. That gap is
what §3 closes.

---

## 3. What was built: the full wiring loop, cohorts, trade exemption, and republish

**New/rewritten files:**

| File | What it does |
|---|---|
| `src/id-module/matchModules.js` | **New.** Shared `scoreOverlap`/`rankModuleMatches`/`bestModuleMatch` — used by both id-router's manual "Check Module Library" and SpecForge's automatic classifier, so they agree on what counts as a match. |
| `server/onedev-client.js` | **New.** Shared OneDev fetch client + `parseKV`. Documents the 4 endpoints this build depends on (confirmed against OneDev's actual Java source, see §4). |
| `src/specforge/schemas.js` | `Stage3TaskSchema` (epic/story/title/description/trade/acceptance_criteria/**`no_tutorial_needed`**), `Stage3OutputSchema`, `TutorialDraftGroupSchema`/`TutorialDraftOutputSchema` (batched generic-module drafting). |
| `src/specforge/pipeline.js` | `runTaskBreakdown()` (Stage 3, DeepSeek) and `runTutorialDrafting()` (batches unmatched tasks into generic module specs, DeepSeek). Stage 3's prompt tells the model to set `no_tutorial_needed: true` for non-coding trades. |
| `server/specforge-router.js` | `POST /breakdown` (Stage 3, review-only), `POST /classify` (score tasks against Module Library, read-only, no LLM), `POST /publish` (the only writer — full flow below, now with cohort-reuse and trade-exemption branches). |
| `server/id-router.js` | `GET /pending-requests` (auto-drafted tutorials awaiting human review), `GET /draft?filePath=` (serves generated code for review), `POST /publish` **resolves** the matching pending request: patches every blocked task's OneDev issue from `NeedsTutorial`→`AssistModule` and renames the request `(resolved)`. |
| `src/pd-studio/PDStudio.jsx` (+css) | Stage 3 UI: "Break down into tasks" → live ✓/⚠/— match chip per task (matched / needs tutorial / exempt) → per-task "No tutorial needed for this trade" override checkbox → **Cohort** picker (add to an existing cohort, or name a new one + pick/create a delivery project) → "Publish to Workbench". |
| `src/instructional-design/IDStudio.jsx` (+css) | **Pending requests** tab (default view) listing SpecForge's auto-drafted tutorials; opening one loads the already-generated code straight into the existing review/publish panel. |
| `src/cohort-matching/MatchingQueue.jsx` (+css) | Placement dropdown excludes any task with `NeedsTutorial: true`; shows a count of how many are hidden. |
| `src/workbench/Workbench.jsx` (+css) | `AssistMeButton` reads the task's own description: `AssistModule:` → launches straight into that tutorial; `NeedsTutorial: true` → disabled "⏳ pending review" state; `NoTutorialNeeded: true` → "No tutorial needed for this trade" tag; neither marker (hand-made task) → old manual picker fallback. |
| `src/core-studio/CoreStudioConsole.jsx` (+css) | Per-project **Cohort** column (linked to `/cohorts`) and a **Tasks blocked on a tutorial** tile/callout. |
| `src/cohorts/Cohorts.jsx` + `.css` | **New screen**, route `/cohorts`. One card per `Cohort:` issue: product, delivery project, open/closed/blocked task counts (live, not just the stored count), and roster (joined from `Matched:` issues the same way Huddle Calendar already does — by `"in <project name>"` substring, since Matched issues never got a numeric project-id field). Linked from the landing page nav and Core Studio Console. |

### The publish flow, end to end (`server/specforge-router.js` `POST /publish`)

1. Classify every task against the Module Library (published `Module:` issues + `MODULE_CATALOG`) —
   **skipped** for any task with `no_tutorial_needed: true` (PM/QA/content/etc. — the Module Library only
   teaches coding patterns).
2. Batch every unmatched *coding* task through `runTutorialDrafting` — one DeepSeek call groups similar
   tasks under shared generic module specs (never product-specific).
3. For each group, call Gemini (`generateAssistModule`) to write the tutorial's `.jsx` file to
   `src/engines/assist/` — same code path ID Studio's manual "Generate" button uses.
4. Resolve the cohort + delivery project, one of two ways:
   - **New** (`cohortName` + `deliveryProjectId` or `deliveryProjectName` given): creates the OneDev
     project if needed, logs a fresh `Cohort: <name>` issue in team-ops (project 3).
   - **Reuse** (`cohortIssueId` given — a spec revision): reads the existing cohort's own
     `DeliveryProject: <name> (#<id>)` line for the project, bumps its `TaskCount`, adds `UpdatedAt`. No
     new project or cohort issue created — tasks just get added to what's already there.
5. Create one OneDev issue per task: `AssistModule: <tag>` (matched), `NoTutorialNeeded: true` (exempt
   trade), or `NeedsTutorial: true` + `DraftModule: <tag>` (drafted, pending ID review — bare
   `NeedsTutorial: true` if Gemini generation itself failed).
6. File a `Tutorial needed: <tag>` request per drafted group in the Module Library project, with
   `RequestedForTasks: <issue ids>` — this is what ID Studio's Pending requests tab reads.
7. Post one summary to Mattermost (task counts by matched/exempt/blocked, drafted tags).

A JS is never assignable to a task that isn't matched, exempt, or already generated-and-pending-review —
enforced independently at Matching Queue and Workbench, so a hand-created task is equally gated if someone
adds `NeedsTutorial: true` to it by hand.

---

## 4. Facts worth not re-deriving (cost real research time)

- **OneDev's actual REST endpoints** (no public docs page has this — it's shipped per-install at
  `/~help/api`, and the doc site refuses to answer without a running instance). Confirmed by pulling
  OneDev's Java source directly via `gh api repos/theonedev/onedev/contents/server-core/src/main/java/io/onedev/server/rest/resource/IssueResource.java` and `ProjectResource.java`:
  - `POST /issues` body `{projectId, title, description, ...}` → returns numeric issue id.
  - `POST /issues/{id}/description` body = **a raw JSON string** (`JSON.stringify("new text")`, not an
    object) → replaces the description. Same shape for `POST /issues/{id}/title`.
  - `POST /projects` body `{name, description}` (Jackson-deserialized `ProjectData`) → returns numeric
    project id.
  - **Still never fired against a live OneDev instance** (see §0) — grounded in source, not guessed, but
    watch the first real publish closely in case `ProjectData` needs more required fields than just
    `name`/`description`.
- **The `Key: value` per-line description convention** is the only structured-data mechanism in the whole
  OneDev layer. Every marker (`AssistModule:`, `NeedsTutorial:`, `NoTutorialNeeded:`, `DraftModule:`,
  `Cohort:`, `Epic:`, `Story:`, `Trade:`, `AcceptanceCriteria:`, `RequestedForTasks:`, `UpdatedAt:`, etc.)
  is a line matched by regex. Adding a new marker means grepping for `parseKV` and the `/^Foo:/m` regexes
  across every reader before assuming nothing else needs updating.
- **`eslint.config.js` has no Node globals** (`globals.browser` only) — every file under `server/` fails
  `no-undef` on `process`/`Buffer`. **Pre-existing across the whole directory**, not introduced by this
  work. Don't "fix" it as a side effect of an unrelated change.
- **`vite.config.js`'s `/api` proxy used to read `process.env.PORT` as a fallback for the AI server's
  port** — ambiguous, because whatever launches the Vite dev server may also set `PORT` for its *own*
  bookkeeping (Claude Code's Browser-pane dev-server launcher does exactly this, setting `PORT=5173`).
  When that happens the `/api` proxy silently targets itself instead of the AI server on `:3000`, and every
  request fails with confusing, unrelated-looking errors (`ECONNREFUSED`/`ENOBUFS`/`EADDRINUSE` on
  `127.0.0.1:5173`, or the browser's fetch throwing "Unexpected end of JSON input" from an empty proxied
  response) — nothing about the error points at the real cause. **Fixed**: the fallback chain is now
  `VITE_AI_SERVER_PORT || 3000` only — `PORT` is never read. Also pinned all three proxy targets to
  `127.0.0.1` instead of `localhost`, since Node's dual-stack resolution of `localhost` (racing `::1`
  against `127.0.0.1`) adds its own occasional flakiness on top. If proxy calls ever look intermittently
  broken again with no code explanation, check for exactly this class of self-referential-port bug before
  assuming it's OneDev/Mattermost/the network.
- **Neither AI client had a request timeout** — `src/id-module/geminiClient.js` and
  `src/ai-lessons/providers/deepseekClient.js` both called `fetch()` with no `AbortSignal`. A stalled
  connection to either provider hung the call **forever**, with nothing to catch and nothing to retry —
  discovered live when a SpecForge publish sat "pending" 7+ minutes with zero error output anywhere,
  until the server process was killed by hand. Fixed: both now wrap their fetch in an `AbortController`
  with a 100s timeout, turning a stall into a clean, catchable, retriable error instead of an infinite hang.
- **`createProject` in `server/onedev-client.js` 400'd on the first real call**: `codeAnalysisSetting: must
  not be null, gitPackConfig: must not be null`. OneDev's `ProjectData` requires those two fields present
  as objects (even with every inner field null) — omitting them entirely, not just leaving them empty, is
  what fails. Fixed by sending the same empty-shell shape `GET /projects` returns for existing projects.
  This is exactly the caveat flagged in §4 the first time this doc was written ("watch the first real
  publish closely") — it was right to flag, and it did in fact need fixing.
- **`.env` "looks configured" is not the same as "is configured."** `DEEPSEEK_API_KEY=` and `GEMINI_API_KEY=`
  are present as lines but empty — check with `awk -F= '{print $1, (length($0)>length($1)+1?"SET":"EMPTY")}' .env`,
  not just `grep -c`, before trusting either is usable.
- **`updateIssueDescription`/`updateIssueTitle` were double-JSON-encoding every write, silently, all session
  — found live 2026-08-08 while testing Matching Queue.** Both send `body: JSON.stringify(text)` to OneDev's
  `POST /issues/{id}/description` / `.../title`. Those endpoints are JAX-RS methods taking a bare `String`
  parameter (`setDescription(Long issueId, String description)`, confirmed from OneDev's real Java source,
  same rigor as every other endpoint fact in this doc) — despite `@Consumes(APPLICATION_JSON)` at the class
  level, OneDev reads the raw request body bytes directly into that `String`, it does **not** run it through
  Jackson's JSON deserialization. So `JSON.stringify(text)` — which wraps the text in literal quote
  characters and escapes real newlines as the two-character sequence `\n` — gets stored *as that literal
  text*, quotes and all, not unwrapped into the real string. Confirmed by direct round-trip: wrote a
  multi-line description, read it back, got a string that literally started and ended with `"` and had zero
  real newline characters, all escaped as text. **Real, live impact**: this is exactly what
  `resolvePendingRequest` (server/id-router.js) uses to unblock a task after ID Studio approves a tutorial —
  the patched description silently broke every regex expecting a real line break, including Workbench's own
  `/^AssistModule:\s*(.+)$/m` wired-tutorial check. A task ID Studio had just "unblocked" still showed the
  old manual-picker fallback in Workbench instead of launching straight into the wired tutorial — found by
  actually completing the loop live (publish in ID Studio → check Workbench), not by reading code. Fixed:
  both functions now send the raw text directly (`body: text`, no `JSON.stringify`), verified by the same
  round-trip test with real newlines intact and the regex matching correctly afterward. One real casualty
  from this session was found and repaired in place (`JSON.parse()`'d the corrupted value, wrote it back
  through the fixed function); scanned the whole instance afterward for any other description starting and
  ending with a literal `"` — none found, this was the only one. **If a future symptom looks like "a
  Key: value marker exists in an issue's raw description but no regex expecting a line-anchored match can
  find it," check for this exact corruption pattern before assuming the marker was never written.**

---

## 5. Current repo state (updated 2026-08-09)

The IPF ops slice (auth, recruit auto-match, workbench JS view, readiness gate, go-live hardening)
was built uncommitted on `main` through 2026-08-09. Run `git status` / `git diff --stat` before
assuming remote matches local. `oauthcreds.json` is gitignored — secrets live in `.env` only.

Verified:
- `npx eslint <every touched file>` — clean on all `src/` files, every time, after every change. `server/`
  files only ever show the pre-existing `process`/`Buffer` no-undef pattern from §4.
- Auth routes live-verified with real Google + LDAP sign-in (see HANDOFF §7–§8).
- DeepSeek / Gemini keys funded and used in SpecForge + ID Module live calls since 2026-08-04.

---

## 5a. Auth/identity — BUILT & LIVE-VERIFIED 2026-08-09

> Older drafts of this heading said “not built yet — nothing in this repo is access-controlled.” That
> is obsolete. Implementation lives in `server/auth-*.js`, `server/ldap-auth.js`, `server/google-oauth.js`,
> `src/auth/*`, and route guards in `src/main.jsx`.

Design preserved in the implementation:
- **`-core` roles** (PD-core, PMGT-core, ID-core, ...) are IPF's own salaried employees — internal LDAP,
  `FN_SN@inpact.live` domain identities (`POST /api/auth/core-login`).
- **PD, PMGT, ID** (no `-core` suffix) are *roles*, not fixed identities — they can also be assigned to a
  JS as they grow into them (`server/role-grants.js`). A `-core` account’s `coreRole` also satisfies the
  bare role name in `requireRole` / `<RequireRole>`.
- **JS applicants authenticate via Google OAuth** — no separate registration/password system.
  CSRF state is a server-memory one-time token (not a cookie) because localhost vs 127.0.0.1 host
  mismatch broke cookie-based state; see `server/auth-router.js`.
- Session: signed JWT (`AUTH_SESSION_SECRET`) in an httpOnly `sameSite:"lax"` cookie, 12h TTL.
- Gated API writes: SpecForge `/publish` requires PD; ID Module `/publish` requires ID.

---

## 5a-1. Skill-matched recruiting — built 2026-08-05

The gap: Apply was a blank free-text trade box, and Matching Queue showed every open task to every
applicant regardless of trade or actual skill. Fixed with a two-tier gate, not a full rank ladder — this
matches the founder's stated rule exactly, not a more elaborate scheme:

- **`src/cohort-matching/skillLevels.js`** — the one shared taxonomy: `none < html-css < js < ts ≈
  advanced/framework`. `isUnlocked(taskTechLevel, applicantCeiling)` is the single gate function every
  screen uses.
- **Apply** (`Apply.jsx`) — role cards with real counseling copy (what each trade does, what tech it uses)
  replace the old free-text box; picking "Coding" reveals a skill-level picker (same cards, real blurbs)
  and an optional "aiming to grow into" level. Written to the Application issue as `SkillLevel:` /
  `Aspiration:` lines, alongside the existing `Stated trade:`. "Something else" still exists — no hard
  trade list, same open-ended philosophy as before.
- **SpecForge Stage 3** (`schemas.js`, `pipeline.js`) — every Coding task (i.e. `no_tutorial_needed: false`)
  now also gets `tech_level` (html-css/js/ts/advanced), judged from what the task actually needs, not from
  "the codebase happens to be TypeScript." Written to the task issue as `TechLevel:`. Editable in PD
  Studio's task cards, next to the exemption checkbox.
- **Matching Queue** — the two-tier rule, exactly as stated: everyone starts on JS-tier work (covers stated
  `none`/`html-css`/`js`); TS/advanced unlocks when the applicant's stated level or aspiration is already
  `ts`+, **or** they've closed out one task tagged `TechLevel: js` (checked by name across `Matched:`
  issues — no login system exists to key off instead). The task dropdown is filtered per-applicant: wrong
  trade or above-ceiling tasks are hidden with a transparent count ("N tasks not shown — wrong trade or
  above their level"), never silently omitted.
- **Aspiration check-in, no login required**: since there's no JS-facing account system, a JS can't
  self-report an updated aspiration. Instead, Matching Queue gives Core Studio (who already runs Huddle
  Calendar daily, so this is a real touchpoint) a one-click "Update aspiration" control on each placed
  applicant — logs an `Aspiration: <name>` issue in team-ops (project 3), most-recent wins, read fresh on
  every future placement. Human-mediated by design, consistent with how placement itself already works
  ("every placement here is a logged decision, not an algorithm's guess").

**Live-tested end-to-end 2026-08-08 — both unlock paths confirmed, both bugs found this way fixed (see the
`updateIssueDescription` double-encoding entry in §4 and the reserved-project task-picker leak):**
- Applied as a real Coding/JS applicant (stated level `js`), placed, then Core Studio updated their
  aspiration to `ts` via the check-in control — `TS/ADVANCED UNLOCKED` badge appeared correctly, `Aspiration:`
  issue confirmed written with the right fields.
- Separately: a second applicant placed on a real `TechLevel: js` task, that task closed via OneDev's
  `POST /issues/{id}/state-transitions`, reloaded with **no** aspiration update — `TS/ADVANCED UNLOCKED`
  still appeared, confirming `hasCompletedJsTask()` correctly detects completion independent of the
  aspiration path. Both branches of the unlock logic verified with real data, not just read as code.

---

## 5a-2. CD (Core Dev) — interim manual PR-review gate, built 2026-08-05

Fifth IPF-core role, alongside PD/ID/PM/Recruit: **CD** (dev + devops), reviewing every JS's PR by hand
until the JS community is strong enough to review and manage devops itself.

- **`src/cd-review/CDReview.jsx`**, route `/cd-review` — a thin queue over OneDev's own Pull Requests
  (`GET /pulls`), same "don't rebuild what OneDev already does" philosophy as Workbench over issues. It
  does **not** reimplement diff viewing or code review — every PR links out to OneDev's real `~pulls` page
  for that. What it adds: one cross-project queue grouped by cohort, and a logged review decision
  (Approved / Changes requested / Blocked + note) written as a `CD Review:` issue in team-ops.
- **"Inform CD about new PRs"**: there's no background job runner or webhook receiver in this app — every
  Mattermost notification anywhere fires as the direct result of a human action, never a push. Matched that
  pattern: the first time *anyone* loads `/cd-review` and sees an open PR with no `CD Notified: <id>` marker
  issue yet, it auto-announces to Mattermost once and writes the marker so it never re-pings. This is "next
  time someone opens the queue," not real instant push — said plainly in case a truer real-time notifier
  (an actual OneDev outgoing webhook into a new server endpoint) is wanted later.
- **OneDev's PR API confirmed from source** (`PullRequestResource.java`, `PullRequest.java`), same rigor as
  the earlier issue/project endpoints: `GET /pulls?query=&offset=&count=` (global, not project-scoped, same
  shape as `/issues`), `status` enum is `OPEN`/`MERGED`/`DISCARDED`, PR URL pattern is
  `<project-path>/~pulls/<number>`. **Not yet verified against a real submitted PR** (none exist yet — no
  JS has opened one) — the nested `submitter`/`targetProject` field shapes are handled with fallback chains
  in `prMeta()` rather than a single assumed key, specifically because that couldn't be confirmed live.
  Check the actual JSON on the first real PR before trusting those fields blindly.

---

## 5a-3. PD Studio live-tested end-to-end + three real bugs found and fixed — 2026-08-07

First real click-through of PD Studio's full publish flow (§6 item 1), live, with the user driving.
Found and fixed real problems along the way — none of them hypothetical, all confirmed against actual
OneDev data and a real running dev server.

**Entity-level delete, PD Studio Stage 2** (`src/pd-studio/PDStudio.jsx`, `.css`) — Stage 2 only had
field/relationship-level removes, no way to delete a whole entity. Added `removeEntity(entityIdx)` +
a `.pdstudio-entity-remove` button in a new `.pdstudio-entity-head` row. User used it live to trim a
6-entity domain model down to one ("ShiftSwap") for a focused test run.

**Stage 3 truncation, twice** — even a single-entity domain model (with a long validation-rules list)
produced a task breakdown too large for the 8000-token budget, failing with "Unterminated string in
JSON" on both the first attempt and its automatic retry. Fixed two ways: (1) `STAGE3_SYSTEM` in
`src/specforge/pipeline.js` now explicitly caps task count relative to domain size (~4-6 tasks/entity,
warns against exceeding ~30 for a small domain); (2) live-probed DeepSeek's real API and confirmed it
accepts `max_tokens: 16000` (got a real 200), then raised `runTaskBreakdown`'s budget to 14000. Retried
live after the fix — 200, 37.64s, no truncation.

**Tutorial-group fanout** — publishing that single trimmed entity still produced **15** distinct
`Tutorial needed:` groups (confirmed via OneDev: project `swap board`, 33 task issues, 15 tutorial
requests), each one a full sequential Gemini generation call — the publish ran close to an hour. Fixed
in `src/specforge/pipeline.js`: `TUTORIAL_DRAFT_SYSTEM` now argues explicitly for consolidating by
*underlying pattern* rather than by feature/entity (a rate-limit check and a role check are both "gate
a request against a rule," one group), and `runTutorialDrafting` now hard-caps at `MAX_TUTORIAL_GROUPS
= 10` — regardless of prompt compliance, since Stage 3's token-budget saga already proved prompt-only
limits aren't enough on their own. Groups dropped by the cap aren't lost: `specforge-router.js` already
falls back any task with no covering group to a bare `NeedsTutorial: true` (same path as a generation
failure) — still gated, just needs a manual draft from ID Studio instead of an auto-generated one. No
router change was needed for this, only the cap itself.

**Real runtime bug in a generated tutorial, and a real gap in how we validate generated code** — after
the publish "succeeded," the browser console filled with `ReferenceError: unreadCount is not defined`
at `inpact_assist_in-app-notifications_engine.tsx`, repeatedly failing to HMR-reload
`AssistMeWorkspace.jsx`/`PreviewLesson.jsx` (the same eager-glob blast-radius pattern as the earlier
raw-newline and wrong-extension bugs, a third distinct variant). Root cause, found by actually reading
the file line by line rather than guessing from the stack trace: it is **not** a structural problem
(no duplicate component names — the whole file is a big `NODES` array of lesson-step strings, all inert
data). The real bug: several of those strings are template literals containing *example JSX shown to
the learner*, and inside that example text Gemini wrote `${unreadCount}` (real template-literal
interpolation syntax) where it meant plain JSX `{unreadCount}` (no `$`) — the outer backtick string
happily interpolates it for real the moment the `NODES` array literal is constructed at module load, and
since `unreadCount` was never a real variable in that scope, it throws immediately. `esbuild.transformSync`
never catches this because `${identifier}` is syntactically valid — the problem is semantic, not
structural. Fixed the live file directly (escaped all 40 occurrences: `${` → `\${` throughout, verified
with esbuild + `vite build` + a live re-render of the module in Preview Lesson). More importantly, hardened
`src/id-module/generateModule.js`'s `assertValidModule()` so this doesn't require a human to catch it
again: after the existing syntax check, it now also transpiles the module to CJS and actually **executes**
its top-level body in a `vm` sandbox with `react`/`inpact_engine_shared` stubbed out (mocks need
`__esModule: true` or esbuild's default-import interop double-wraps them — cost some trial and error to
get right). Nothing legitimate in a generated module does real work outside a component's render, so a
throw here is a real bug, not a false positive. Verified against both a synthetic reproduction of the
original bug (correctly caught: `unreadCount is not defined`) and the now-fixed real file (passes clean).
This slots into the same retry-with-error-fed-back-to-Gemini loop the syntax check already used — a
generation that fails this check on the first attempt gets one automatic retry before generation fails
loudly instead of writing a broken file to disk.

Confirmed via direct OneDev query (not just trusting the UI): project `swap board` (id 6) has 33 task
issues, one `Cohort: initial` issue, and 15 `Tutorial needed:` issues — the publish genuinely completed,
it was just slow for the reason above, now capped.

---

## 5a-4. Assist-module integration — SESSION/TOKEN/COMPLETION LOOP BUILT & LIVE-VERIFIED 2026-08-08/09

Originally parked 2026-08-07 ("park it for now.. we need everything else in place first"), then explicitly
un-parked 2026-08-08 ("i think its the right time to integrate the inpact lesson(core+fundas) into IPF").
What's below is split into what's **built and confirmed working live** vs. what's still just design (the
original parked contract, kept below for when that gets picked up).

### Full session/token/completion loop — built and live-verified 2026-08-09

The thin slice (routing/matching only) from 2026-08-08 is now a real, secure, closed loop — not just a
match-and-link. Built and verified with a genuine end-to-end run, not unit-level checks:

- **`server/assistance-sessions.js`** (new) — sessions are OneDev issues in team-ops (`AssistSession: <lessonKey>
  for task #<taskId>`), same system-of-record everything else in this app uses. `createAssistanceSession`
  generates a cryptographically random token (`crypto.randomBytes(32)`), stores only its SHA-256 hash, and
  returns the raw token exactly once. `completeAssistanceSession` validates hash + expiry (2h TTL),
  marks completion idempotently (a second call with an already-consumed token returns the same result rather
  than erroring — a learner's browser retrying the redirect is expected, not an attack), and rejects anything
  that doesn't match. `markSessionLaunched` is a best-effort, non-regressing status marker.
- **`POST /api/id/assistance-session`** (`server/id-router.js`) — takes `{taskId, taskTitle, lessonKey}`.
  The lessonKey is a real, human-made choice (the learner picked it from what `/core-lesson-match` already
  returned) but the server re-derives the canonical URL from the manifest via `lessonByKey()` rather than
  trusting any client-supplied URL — never guesses, 400s on an unknown key.
- **`GET /api/id/assistance-complete`** — the callback IAAL-main navigates to (real browser navigation, not a
  fetch) the moment its lesson genuinely completes. Validates, marks complete, redirects to
  `IPF_FRONTEND_URL/#/workbench?tutorialCompleted=<taskId>` — this app has no per-task editor route to
  redirect to (unlike what the original contract assumed), so Workbench with a completion marker is the real,
  honest destination, not an invented route.
- **IAAL-main's `App.jsx`**: the `onLessonComplete={user?.id ? ... : undefined}` Supabase-only gating bug
  (flagged as a known landmine on 2026-08-07, before this was built) is fixed —
  `onLessonComplete={user?.id || assistContext ? handleLessonComplete : undefined}`, and
  `handleLessonComplete` now does the Supabase recording (if applicable) and the IPF completion callback
  (if applicable) independently, neither blocking the other.
- **Real bug found and fixed while live-testing this specific piece**: `assistContext` was originally a
  `useMemo` keyed on `location.search`. This app's own lesson-mount flow calls
  `navigate(buildLessonPath(t, idx), { replace: true })` (confirmed in source, `src/App.jsx` — the exact
  lines are listed if this needs re-deriving), which rewrites the URL to the bare `/lessons/<track>/<idx>`
  path with **no query string**, as part of its normal operation — completely unrelated to IPF, just how this
  app already worked. A `useMemo` recomputing from `location.search` would see that stripped URL and silently
  lose the assist context before the learner ever finished the lesson, so completion would fire with
  `onLessonComplete` already back to `undefined`. Fixed by capturing `assistContext` **once**, via a lazy
  `useState(() => ...)` initializer that reads the URL only at mount — before that canonicalizing navigation
  runs — so it survives the lesson's whole lifetime regardless of later in-app navigation.
- **Testing-methodology trap worth remembering**: repeatedly navigating between test session URLs *within
  the same already-loaded tab* on IAAL-main's own origin did NOT reproduce a real user's flow — HashRouter
  treats a same-origin hash-only change as a soft in-app transition (no component remount), so
  `useState`'s lazy initializer never re-ran and kept showing stale/empty `location.search`, which looked
  like a real bug until a genuine hard reload (`location.reload()`) proved otherwise. The **real** production
  flow doesn't have this problem — Workbench's `window.location.assign(url)` navigates *cross-origin*
  (IPF's 5173 to IAAL-main's 5174), which always forces a true fresh page load. Don't mistake same-origin
  soft-navigation test artifacts for a real defect in this specific class of bug again.
- **Live end-to-end run, the real thing, not a simulation**: real task in Workbench → clicked "Try a core
  lesson" → real session created (`POST /assistance-session`) → same-tab cross-origin navigation to IAAL-main
  → `LaunchedAt` marker fired automatically → worked through a real 4-step coding lesson (`Build a Reusable
  Card with Props`, real Monaco editor, real grading) to genuine completion → `onLessonComplete` fired →
  `completeIpfAssistance` navigated to IPF's completion endpoint → token validated → session marked
  `Status: completed` with a real `CompletedAt` timestamp → redirected to
  `.../#/workbench?tutorialCompleted=70` → **"✓ Tutorial completed" banner rendered correctly on Workbench**.
  Confirmed via the actual OneDev record afterward, not just the UI.
- **Still not done** (real gaps, not hedging): no rate limiting on session creation, no automated test suite
  (this was all verified by hand), the manifest/matcher's keyword-overlap precision ceiling (documented below)
  is unchanged, and Workbench's UI is still a bolted-on card rather than the "Start Task / I Need Assistance"
  primary task-detail actions the original contract envisioned.

### Thin slice (routing/matching only) — built and live-verified 2026-08-08

**A real, working prereq-gate already existed in IPAAL-main — nothing needed building for it.** Found while
scoping this: `createMasteryLessonEngine.jsx`'s `fundamentalLinksFor(spec)` computes lesson-specific
fundamentals (explicit per-lesson overrides, content-derived regex rules against the lesson's id/title/
concept, module-level fallback) and every lesson auto-includes a "Before you begin" node (lists them as real
links) and a "Knowledge check" node (wrong answer → targeted refresher links; right answer → skip through).
Confirmed via real click-through: opening a matched lesson and continuing to "Before you begin" showed 5
specific, correct fundamentals links for that exact lesson — not a generic chain. So IPF's job is *only*
routing to the right one of these lessons; the gate itself lives entirely in IPAAL-main already.

**What IPF-side got built (thin slice — matching/routing only, no session/token/completion-tracking yet):**
- **Real lesson count verified, not assumed**: `WEB_APP_BUILDING_BLOCKS_CURRICULUM` has 109 entries; all 109
  have real working lesson specs behind them (29 hand-authored in `webAppMasterySpecs.js`, 80 generated from
  `BLUEPRINTS` in `webAppRemainingSpecs.js`) — confirmed via live `import()`, not grep-counted (grep undercounts
  because the 80 are built programmatically, not as 80 literal `createLessonSpec(...)` calls in source text).
- **Port conflict fixed**: IPAAL-main's `vite.config.js` had no explicit port (defaults to 5173, same as IPF's
  own dev server) — set to a fixed `5174`. Also fixed the identical `process.env.PORT` self-targeting proxy
  bug already fixed in IPF's own `vite.config.js` months earlier, found again here.
- **`scripts/generateCoreLessonManifest.mjs`** — build-time manifest generator (per the original spec: "Do not
  scan 922 source files in the browser at runtime"), reads `WEB_APP_MASTERY_SPECS` directly from IPAAL-main via
  a live import, writes `src/id-module/coreLessonManifest.json` (109 entries: lessonKey, track, listIndex,
  route, title, moduleId, matchText). Array order is the real route index — confirmed via
  `src/auth/redirectPath.js`'s generic `/lessons/<track>/<index>` pattern, not guessed.
- **`src/id-module/matchCoreLesson.js`** — reuses `matchModules.js`'s existing `scoreOverlap` (same scorer IPF
  already uses for its own Module Library, same notion of "close enough" everywhere). Tiered result — `auto`
  (≥0.45, same threshold as `bestModuleMatch`), `curated` (≥0.2, top 3, surfaced as suggestions rather than
  silently dropped), or `none`. **Known real limitation, not yet fixed**: pure keyword overlap has a precision
  ceiling — a task's domain-specific words ("Ingredient") don't appear in IAAL-main's deliberately generic
  lesson titles, so semantically-good matches can still score low or land in `curated` instead of `auto`.
  Confirmed live against real Restaurant Inventory Manager task titles: 2/5 auto-matched well, 3/5 needed the
  curated tier. The full spec's richer concept-based scoring (concept 40%/pattern 25%/framework 20%/
  difficulty 10%/prereq 5%) is the real fix — not built yet.
- **`GET /api/id/core-lesson-match?query=...`** (`server/id-router.js`) — server computes the match, returns
  full URLs (`LESSONS_BASE_URL` env var + route); client never sees scoring internals. Not the full spec's
  secure session/token contract — no session record, no completion tracking, just a stateless match-and-link.
- **Workbench**: new `TryCoreLesson` component, additive next to the existing `AssistMeButton` (never replaces
  it) — "📘 Try a core lesson" button, opens the matched lesson in a new tab (`target="_blank"`), shows curated
  suggestions when nothing auto-matches, honest "no close match" when nothing does.
- **Live end-to-end verification, not just unit-level**: real task title → `/api/id/core-lesson-match` →
  real URL → navigated to it → correct lesson loaded with correct content → clicked through to "Before you
  begin" → confirmed 5 real, lesson-specific fundamentals links rendered correctly.

**Explicitly NOT built** (still the original parked contract, unchanged from before, see below): assistance
sessions, one-time completion tokens, the `onLessonComplete`/Supabase-gating fix in IPAAL-main's `App.jsx`,
the secure completion/redirect endpoint, Start Task vs. I Need Assistance as the primary task-detail UI (this
thin slice bolted onto the existing task card instead), and all the security requirements (idempotent
completion, no raw client-supplied redirect, hashed/expiring tokens) the original contract calls for. Do not
treat the thin slice as "safe to expose beyond internal testing" — it has none of that hardening.

### Original parked contract (below, kept for the full build later)

**Why this exists**: the discussion started from noticing IPF's own tutorial catalog (43 entries,
`src/id-module/moduleCatalog.js`) is tiny next to `D:\inpact-assistance-mods\IPAAL-main\IPAAL-main`'s real
curriculum — 922 lesson-engine files across 20 tracks, plus two structured/ID'd/prerequisite-graphed
catalogs (`webAppBuildingBlocksCurriculum.js`, `codingFundamentalsCurriculum.js`). That repo is the same
`pall-inpact` app lineage as this one (same `createINPACTEngine`/`inpact_engine_shared.jsx` architecture)
but has grown into the actual product curriculum, separately from this repo's IPF ops layer. The founder's
own framing — "send him to [the tutorial]... so he'll learn there and code here" — settled the shape: two
separate running apps with an explicit launch/completion contract, not an embed and not a merge.

**Verified against real IPAAL-main source before filing this (not taken on faith):**
- `onLessonComplete` prop + `lessonCompleteFiredRef` once-only guard — real, exactly as described,
  `src/engines/inpact_engine_shared.jsx` lines ~1127-1220 (fires when `nodeIndex >= NODES.length`).
- **A real live bug, confirmed present right now**: `onLessonComplete={user?.id ? handleLessonComplete : undefined}`
  at `src/App.jsx` lines ~2048 and ~2208 — if an IPF-sent learner has no Supabase session in the lesson
  app, the completion callback is `undefined` and the engine's own `if (!onLessonComplete || ...) return;`
  guard means completion silently never fires. Any implementation of this contract must fix this first
  (see the `handleLessonComplete` refactor below) or the whole return-to-task flow is dead on arrival.
- `#/lessons/coding-fundamentals/50`-shaped HashRouter routes — real, already used as live hrefs in
  `src/engines/webapp-blocks/inpact_wb01_engine.jsx` and `src/engines/mastery/createMasteryLessonEngine.jsx`.
- `recordLessonComplete(userId, track, lessonIndex, timeSpentSeconds)` from `src/auth/supabase.js` — real,
  imported and called from `App.jsx`'s `handleLessonComplete`.

**Confirmed decisions (not open questions if/when this gets built):**
- Two actions on an opened IPF task: **Start Task** (opens IPF's own task editor immediately, no matcher
  call, assistance never blocks this path) and **I Need Assistance** (matches + navigates to a lesson,
  same-tab, and only returns the learner to the editor after the lesson reports real completion).
- No deployed IPAAL-main URL exists yet. Treat it as a second local Vite app for now: `npm run dev` in
  `D:\inpact-assistance-mods\IPAAL-main\IPAAL-main`, base `http://127.0.0.1:5173`. Both apps get their
  counterpart's URL via env var, never hardcoded: IPF needs `VITE_LESSONS_BASE_URL`; the lesson app needs
  `VITE_IPF_BASE_URL` / `VITE_IPF_API_BASE_URL` (actual existing IPF ports). Swapping to a real deployment
  later is a one-line env change on each side, nothing else.
- **Server-owned assistance sessions, not a raw client-supplied return URL.** `POST /api/tasks/:taskId/assistance`
  on IPF: authenticates the user, verifies task access, builds a task-learning profile, picks the best
  published lesson, creates a session, returns `{ sessionId, lessonUrl }`. The lesson app parses
  `source=ipf&assistSessionId=...&completionToken=...` off the **HashRouter route** (after the `#`, not
  `window.location.search` — that reads the pre-hash portion and is empty here; use `useSearchParams()`).
  On real `onLessonComplete`, the lesson app navigates same-tab to an IPF completion endpoint
  (`GET /assistance/:sessionId/complete?token=...`), which validates the one-time hashed/expiring token,
  confirms session ownership, marks completion idempotently, and redirects to IPF's *existing* task-editor
  route (`/tasks/:taskId/editor?tutorialCompleted=true`) — never a second, invented editor route.
- Security requirements called out explicitly: no trusting a raw `returnTo`, no `window.opener`, no
  arbitrary redirect origins, completion tokens cryptographically random/hashed-at-rest/short-lived/
  one-time, session ownership re-checked server-side, completion idempotent, no sensitive task content in
  the lesson URL, and — important — completion fires **only** on the engine's real success callback, never
  on mount/close/route-change/Accept/Next/elapsed-time heuristics.
- `handleLessonComplete` in the lesson app's `App.jsx` needs refactoring so IPF-assisted completion doesn't
  depend on a Supabase session existing:
  ```js
  const handleLessonComplete = useCallback(async () => {
    if (user?.id) await recordLessonComplete(user.id, activeLessonTrack, lessonIndex, elapsedSeconds);
    if (assistContext) await completeIpfAssistance(assistContext);
  }, [user?.id, activeLessonTrack, lessonIndex, elapsedSeconds, assistContext]);
  // pass it whenever EITHER path is active:
  onLessonComplete={user?.id || assistContext ? handleLessonComplete : undefined}
  ```
  Keep the engine's existing once-only guard as-is — don't add a second completion detector.
- **Lesson manifest, not a runtime scan.** Don't glob 922 files in the browser — generate a versioned
  manifest at build time from the two curriculum files + the engine registry (`lessonKey` as the stable
  identity, `listIndex`/`route`/`concepts`/`taskPatterns`/`difficulty`/`enginePath`/`published`). The
  matcher consumes this manifest, never raw lesson UI files.
- **Matcher**: concept overlap 40%, task-pattern/deliverable analogy 25%, framework+language compatibility
  20%, difficulty suitability 10%, prerequisite readiness 5%. Hard-filter incompatible lessons first, then
  score. Confidence bands: ≥0.75 auto-recommend, 0.55–0.74 low-confidence (log/curated choice), <0.55 no
  match. The existing 43-entry `MODULE_CATALOG` may stay as a compatibility taxonomy but stops being the
  primary library. Gemini auto-drafting becomes the last-resort fallback only, and any generated lesson
  gets reviewed back into IPAAL-main's central catalog — not a second growing fork inside this repo's
  `src/engines/assist/`.
- **Failure behavior**: matching/launch failure keeps the learner on the IPF task with a recoverable
  message, Start Task always stays available, assistance never blocks the task. Abandoning a lesson never
  marks it complete; the learner can return to IPF manually at any time.
- Full unit/integration/E2E test list and the suggested 11-step implementation order (env var → manifest →
  matcher → session API → task UI actions → HashRouter context parsing → `onLessonComplete` refactor →
  completion/redirect endpoint → tests → E2E → deploy) are in the founder's original message in conversation
  history — re-derive from there if this section needs expanding, rather than re-designing from scratch.

**Added 2026-08-08 — prereq-gate sub-flow, and a real data gap found while checking it:** the intended
flow is task → assisted core UI lesson → a prereq-check page listing the language fundamentals (types,
interfaces, loop/conditional constructs, etc.) that lesson actually uses, self-reported known-or-not, routing
to the relevant fundamentals lesson first if not. Checked IPAAL-main directly rather than assuming the data
exists:
- `src/codingFundamentalsCurriculum.js` — **92** fundamentals lessons (real count, not ~99), across 7 modules
  (Programming Basics, HTML/CSS/JS/TS Foundations, React Foundations, Browser/Dev Foundations). Its `prereqs`
  field is purely linear — each lesson only requires the one immediately before it. No per-topic tagging.
- `src/webAppBuildingBlocksCurriculum.js` — **109** entries (real count, not ~102). The `requiredKnowledge` +
  `recommendedLessons` shape (a list of plain-language prerequisites + linked `{track, lessonId, title}`
  fundamentals lessons) that this prereq-gate flow needs **exists on exactly one entry**, the first one
  (`foundation-component`) — a worked example of the intended shape, not a filled-in mapping. The other 108
  entries don't have it.
- **Implication**: this sub-flow isn't just a UI to build — the actual per-lesson prerequisite mapping (which
  of the 92 fundamentals lessons each of the 109 core lessons needs) has to be authored or generated first;
  it's not sitting there ready to wire up. Worth scoping as its own generation pass (plausibly LLM-assisted,
  same pattern as everything else in this pipeline) before the gate UI itself is worth building.
- **Founder clarification on how that mapping pass must work**: `requiredKnowledge` for a core lesson is
  *derived from that lesson's own content* (what it actually builds/uses), never inherited from
  `codingFundamentalsCurriculum.js`'s linear order. A core lesson that's just "create a `Buyer` object" needs
  only types + interfaces flagged, not the whole fundamentals chain up to that point. So the generation pass
  has to read each of the 109 core lessons' real content (NODES, example code, what it teaches) and pick the
  *specific* fundamentals concepts that lesson exercises — the one filled-in example (`foundation-component`)
  is the right shape to replicate, not a shortcut to skip past.

---

## 5a-5. Recruit auto-matching — pivot from manual to automatic, built 2026-08-09

**§5a-1 documented "Manual by design" as a deliberate MVP scope call.** Founder correction 2026-08-09:
matching should not be a manual step — Recruit should match an applicant's stated interest against
available tasks the moment they apply, same as a real recruiting/placement engine would. Matching
Queue's human-in-the-loop placement isn't removed; it's now the fallback for whoever doesn't get an
automatic match (usually because nothing in their trade is assignable yet).

- **`src/cohort-matching/matching.js`** (new) — the trade/skill-level matching predicate
  (`taskMeta`, `isAssignable`, `effectiveCeiling`, `tasksForApplicant`, `bestTaskMatch`, and the
  reserved-project-id set) extracted out of `MatchingQueue.jsx`, which used to own this logic alone.
  Pure data-in/data-out, zero React or browser APIs — this is what makes it safe to import directly
  from server code, not just other components. `MatchingQueue.jsx` now imports from here too (thin
  wrappers supplying its already-loaded state), so there is exactly one copy of "who's eligible for
  what" instead of two that could silently drift apart — same discipline `onedev-client.js`'s own
  top comment calls out for the OneDev auth header/base URL.
- **`server/recruit-router.js`** (new), mounted at `/api/recruit` — `POST /apply` creates the
  Application issue, then immediately runs `bestTaskMatch` against the live task list (via
  `onedev-client.js`'s `listIssues`/`listProjects`, since server code has no Vite dev-proxy to lean
  on). A match creates the `Matched:` issue and pings Mattermost (`notify-server.js`'s
  `notifyTeamServer`) — the exact same side effects `MatchingQueue.jsx`'s `handlePlace` produces,
  just server-triggered instead of a human clicking "Place". No match found → responds
  `{ matched: false }`, application still created, applicant stays queued in Matching Queue.
- **`src/cohort-matching/Apply.jsx`** — submit now posts to `/api/recruit/apply` instead of writing
  the Application issue directly via `/onedev-api/issues`. The "Application received" screen reflects
  the real result: "You're matched — `<task>` in `<project>`" vs. "queued, matched automatically once
  something opens up."
- **Available-trades bug found alongside this**: `Apply.jsx`'s trade picker (§ landing-page section
  below) was filtering out any trade whose only open tasks were still `NeedsTutorial: true` — so a
  founder-created batch of 7 Coding (BE/FE) tasks in `product-backlog`/`shift-swap` never showed
  "Coding" as an available trade, since ID Studio hadn't wired tutorials for them yet. Fixed by
  dropping the `NeedsTutorial` filter from the trades list specifically (it stays in
  `matching.js`'s `isAssignable` for the actual placement gate) — "available" now means "real demand
  exists," not "guaranteed instant placement," which matches how automatic matching itself works
  (queues you rather than requiring instant readiness).
- **Live-verified end-to-end 2026-08-09**: `POST /api/recruit/apply` via curl for a Coding/`js`-level
  applicant → matched instantly to a real open task, `Matched:` issue confirmed created, Mattermost
  notified. Then the identical path again through the actual rendered Apply form (trade card click →
  skill-level card click → submit) → "You're matched — `<real task title>` in `<real project>`"
  rendered correctly. Both runs left real test data behind (`Test Coder`, `Live UI Test` applications
  + their `Matched:` issues in `cohort-applications`) — flagged to the founder rather than deleted
  unilaterally.
- **Rematch sweep (added 2026-08-09):** when ID Studio publishes a tutorial that unblocks tasks, or
  SpecForge publishes already-assignable (wired/exempt) tasks, `tryRematchQueuedApplicants()` walks
  pending Application issues and places anyone who now fits — same human-action / no-cron pattern as CD
  Review. Matching Queue remains the manual safety net for anyone who still doesn't fit.

---

## 5a-6. Enterprise-readiness gate on the cinematic landing — built 2026-08-09

`inpact.live` is this same app (`CinematicLanding.jsx` + `App.jsx`'s `showCinematic` state) — its
"Start doing — it's free →" CTA used to drop straight into the React/TS lesson track
(`LEARNER_FOCUS_TRACK`). Founder ask: most visitors are here for plain React lessons, but IPF's real
differentiator — matched, reviewed, real-reference-worthy work — needs a moment to actually say that
before someone defaults into the self-paced catalog.

- **`src/EnterpriseReadinessGate.jsx`** (new) — a static interstitial (LandingPage.jsx's `LP` visual
  language: light background, DM Sans, cyan accents — deliberately not the cinematic canvas, since
  this is a real fork, not a hook) shown once, right after the cinematic intro's CTA. Two buttons:
  "Yes, I'll apply" → `window.location.hash = '#/apply'`; "No, I just want React lessons" → runs the
  exact same transition the CTA used to run directly (clears the patterns-bridge localStorage flag,
  sets `track`, drops `showCinematic`).
- **`App.jsx`** — new `showEnterpriseGate` state; `CinematicLanding`'s `onEnterLessons` now just sets
  that true instead of committing to the lesson track immediately; the gate renders above the
  `showCinematic` check so it takes over once triggered.
- **Known gap, left as-is on purpose**: this only intercepts the cinematic landing's own CTA — a
  saved/deep-linked redirect path that skips `showCinematic` entirely bypasses the gate. Consistent
  with how the cinematic intro itself already only shows once per fresh load; flagged to the founder
  rather than silently expanding scope to cover every lesson-track entry point.
- **Live-verified 2026-08-09** via the real rendered flow, not just code review: clicked the real
  cinematic CTA → gate rendered with the intended copy → "Yes, I'll apply" landed on the real Apply
  page; separately, fresh load → CTA → "No, I just want React lessons" → landed on the same first
  lesson-track screen (`ReactTsPatternsBridge`) the old direct path used to land on, confirming the
  fallback path is byte-for-byte unchanged behavior.

---

## 5a-7. Product design → core-only, matched-task deep link, and the backend-tutorial gap — 2026-08-09

Three follow-ups from live-testing §5a-5/§5a-6, same session:

- **Product design is core-only work, not JS-assignable — yet.** Founder call: PD-core does this
  directly; it's not offered on Apply even though PD Studio/SpecForge can still tag a task's trade
  `Product design`. `matching.js` gained `CORE_ONLY_TRADES` (currently just `{"product design"}`) and
  `isCoreOnlyTrade()` — `Apply.jsx`'s trade picker excludes it from the fetched list, and
  `recruit-router.js` rejects (400) any direct POST stating it, as a defensive backstop since the UI
  already can't produce that value. Live-verified end-to-end from the real cinematic landing → gate →
  Apply: picker showed only QA/Testing + Coding, Product design correctly absent.
- **Matched confirmation now shows the real task and links to it.** `recruit-router.js`'s response
  gained `task.projectId` (was missing — needed so the frontend can pick the right OneDev project,
  not just display its name). `Apply.jsx`'s "You're matched" screen now reads `#<number> <title> in
  <project>` and links `#/workbench?highlightTaskId=&highlightProjectId=`. `Workbench.jsx` reads both
  params: auto-selects that project on mount (previously always defaulted to the first project
  alphabetically) and highlights the matching card (`workbench-card-highlight` CSS class + a one-shot
  scroll-into-view effect gated on `loading` flipping false, not an inline ref callback — the first
  version used a ref callback that re-fires every render and fights itself mid-scroll, found live: the
  card was correctly highlighted but nowhere near the viewport after settling).
  **Known gap, not yet solved**: this link currently 404s into the LDAP/Google sign-in gate for an
  applicant who just applied anonymously — Workbench requires *some* session (`roles={[]}` in
  `main.jsx`), and applying itself doesn't create one. Whether matched applicants should be prompted
  to sign in with Google right on the confirmation screen is an open question, not yet decided.
- **Backend tutorial coverage — closed 2026-08-09.** Companion lessons app now ships
  `backend-fundamentals` (37) + `backend-blocks` (34) with FE-style analogy tagging (`analogOf`, e.g.
  vote→`be-counter-api`). IPF regenerates `coreLessonManifest.json` (180 entries) via
  `scripts/generateCoreLessonManifest.mjs`; Workbench “Try a core lesson” matches through
  `matchCoreLesson` (side-aware + analog boost). BE submit grades through sandboxed Node `vm`
  (`POST /api/grade-backend` on the lessons AI server; mirror `POST /api/id/grade-backend` on IPF) —
  mocks only (http/pg/queue/cache), not a Docker Postgres runner. Gemini Module Library auto-draft for
  BE product-specific tutorials remains a separate, optional incremental; core BE analogs cover Assist
  Me routing for typical API/CRUD tasks now.

---

## 5b. UX feedback queue — logged, NOT implemented until told to

Rule: items land here the moment they're raised, live testing continues on the *current* UI, and nothing
in this list gets touched until explicitly told to implement.

- [ ] ID Studio: rename the "Generate with Gemini" button label to **"Generate lesson"** — provider name
      shouldn't be in JS/ID-facing copy. (`src/instructional-design/IDStudio.jsx` — two occurrences, the
      no-match path and the "generate anyway" path both say "with Gemini".)

---

## 6. What's still open (updated 2026-08-09)

1. **Google OAuth audience** — Cloud Console app is still in Testing; publish (or add every applicant as
   a test user) before a real public funnel works.
2. **First remote commit / review** of the IPF ops slice (exclude `.env` and any credential paste files).
3. **Optional live smoke** after containers are up: apply → auto-match → Workbench → Assist Me (FE + BE
   core lesson), plus ID publish → confirm rematch of a queued applicant. Restart both AI servers if
   port 3000 is contested (IPF default; lessons app can use `PORT=3001` + `VITE_AI_SERVER_PORT=3001`).
4. **Delivery-project reuse validation** — hardened 2026-08-09 (`deliveryProjectId` must exist in OneDev
   and must not be reserved; `/publish` requires a PD session). Keep watching if PD Studio is ever exposed
   more broadly.

---

## 7. Resume prompt

If this conversation's history is gone, paste this to a fresh Claude session in this repo:

> Read `D:\IPAAL\docs\HANDOFF.md` and `D:\IPAAL\docs\IPF_DEVGUIDE.md` (especially §0 and §6) before doing
> anything else. Confirm you've read them, tell me what §6 says is still open, then run `git status` and
> `git diff --stat` to confirm the current state before touching anything. Do not re-research the OneDev
> REST API details — they're already confirmed from source. Do not assume `.env` keys are populated just
> because the lines exist — check values without printing secrets.
