# IPF Handoff — Inpact PlatForm

**Engineering handoff — 2026-08-09.** A current-state snapshot for whoever picks this up next. For the
full chronological build log (every decision, every bug found and fixed, every live-verification), read
[`docs/IPF_DEVGUIDE.md`](./IPF_DEVGUIDE.md) — this document indexes into it, not replaces it.

> **`IPF_DEVGUIDE.md`'s own top-level §0/§5/§5a headers are stale** — they still say "nothing in this repo
> is access-controlled" and list DeepSeek/Gemini keys as blocked. Both are wrong as of today: auth is fully
> built (§7 below), and the API keys have been funded and working since 2026-08-04. Trust the dated
> `§5a-N` entries and this document over that file's top summary until someone refreshes it.

A rendered, navigable version of this same content (sidebar TOC, status chips) is published at:
https://claude.ai/code/artifact/0bddc353-09b7-4bbe-b91d-a8cf026a73fd

---

## 1. Orientation

IPF is **not** the lesson content itself — that's the same app's older, separate half (React/TS/Vue/Angular
curriculum, the cinematic landing at `inpact.live`). IPF is the **ops layer bolted onto it**: a pipeline
that takes a product idea, breaks it into real assignable tasks, matches job-seekers (JS) to those tasks by
trade and skill, gets them a tutorial if they need one, and routes their work through review — gated so a
task is never assignable until it's wired to a tutorial or explicitly exempt.

```
PD Studio + SpecForge  →  Workbench  →  Recruit (auto-match)  →  ID Studio + tutorials  →  JS does the work  →  CD Review
```

---

## 2. Where it lives

| | |
|---|---|
| Local path | `D:\IPAAL` |
| Git remote (origin) | `github.com/phaniblend/IPAAL` |
| Branch | `main` (also on origin: `live-react-ts-locked`, `production`) |
| Related repo (separate!) | `D:\inpact-assistance-mods\IPAAL-main\IPAAL-main` — the core-lesson engine IPF's "Try a core lesson" flow launches into, own dev server on port 5174 |

> ⚠️ **Everything described in this document is currently uncommitted on `main`.** `git status` shows it
> all as modified/untracked — nothing has been pushed or reviewed. Run `git status` / `git diff --stat`
> before assuming anything here is "live" on the remote. This includes all of Auth, Recruit auto-matching,
> the Workbench JS-scoped view, the enterprise-readiness gate, and every bugfix in §9.

> ⚠️ **`oauthcreds.json` at the repo root is untracked but *not* gitignored.** It's a 2-line plaintext file
> holding the real Google OAuth Client ID and Secret pasted in during setup. `.env` is correctly gitignored
> — this file was missed. Add it to `.gitignore` (or delete it once the values are safely in `.env`) before
> anyone runs `git add -A`, or rotate the credential in Google Cloud Console if it's already leaked.

---

## 3. Architecture

### The pipeline, stage by stage

| Stage | Screen / route | Does what |
|---|---|---|
| PD | `/pd-studio` | Product idea in → SpecForge (DeepSeek) breaks it into a normalized domain model → task breakdown → publish, writing real OneDev issues. |
| Workbench | `/workbench` | The task board itself. Core roles see everything; JS accounts see only their own matched task(s) (built today, §7). |
| Recruit | `/apply`, `/matching-queue` | JS applies (Google-authenticated) → auto-matched to an open task by trade + skill level the instant they apply. Matching Queue is the human fallback for anyone not auto-matched. |
| ID | `/id-studio` | Auto-drafts (Gemini) or manually authors the tutorial a task needs before it's assignable; Module Library is the reuse cache. |
| JS | `/assist-me` | Does the actual work — 3-column in-app workspace or local-instructions mode, wired to either an auto-drafted module or a real core lesson. |
| CD | `/cd-review` | Thin queue over OneDev's real Pull Requests; a human still reviews every PR by hand. |

### System of record

There is no app database. **OneDev issues are the database.** Every module's state is a convention over an
issue's title + a `Key: value`-per-line description, parsed with `parseKV` (`server/onedev-client.js`).
E.g. an application is an issue titled `Application: Jane Doe — QA` in the `cohort-applications` project;
a match is `Matched: Jane Doe → #30 Create manual test plan`; a task waiting on a tutorial carries
`NeedsTutorial: true` in its description. Grep for the marker name across `src/` and `server/` to find
every place that reads or writes it.

### No background jobs, anywhere

There is no cron, queue, or webhook receiver in this app. Every side effect (a Mattermost ping, an
auto-match, a low-supply alert) fires as the **direct synchronous result of a human action** — someone
applying, someone loading a screen. If you're tempted to add a "check every N minutes" feature, that's a
real architectural addition, not a config flag.

---

## 4. External services

No `docker-compose.yml` exists — these containers were created once by hand outside this repo and just get
stopped/started with the host machine. Run `docker ps -a` at the start of any session; don't
`docker run` fresh ones without checking first (a fresh OneDev won't have the pre-existing projects this
whole build assumes).

| Container | Image | Port(s) | Purpose |
|---|---|---|---|
| `onedev-inpact` | OneDev | 6610–6611 | The system of record — every issue/project this app reads and writes. |
| `ipf-mattermost` | Mattermost | 8065 | Team Messaging — every notification anywhere posts to its Town Square via one incoming webhook. |
| `ipf-postgres` | Postgres | 5432 (internal) | Mattermost's own datastore. Not touched directly by IPF code. |
| `ipf-ldap` | osixia/openldap:1.5.0 | 389, 636 | Dev directory for `-core` employee sign-in. |

### LDAP seed data (`ou=core,dc=inpact,dc=live`)

| Name | uid | coreRole | Notes |
|---|---|---|---|
| Priya Sharma | `priya_sharma` | PD-core | Original seed |
| Arjun Mehta | `arjun_mehta` | PMGT-core | Original seed |
| Kavya Nair | `kavya_nair` | ID-core | Original seed |
| PD Core | `PD_Core` | PD-core | Dev test — password `inpact` |
| ID Core | `ID_core` | ID-core | Dev test — password `inpact` |
| PM Core | `PM_Core` | PMGT-core | Dev test — password `inpact` |

Original seed passwords are in your own setup notes. Re-seed the three `*_Core` test users with
`scripts/seed-ldap-core-test-users.ldif` (`ldapadd` as admin). Anonymous LDAP reads are disabled (a real
admin bind is required even for the uid→DN lookup step).

### Paid / external APIs

- **DeepSeek** — SpecForge (PD Studio's Stage 1/2/3) and the mentor chat. Funded and working since 2026-08-04.
- **Gemini** — ID Module's tutorial auto-drafting. Funded and working since 2026-08-04.
- **Google OAuth** — JS applicant sign-in. Registered app, client ID/secret in `.env`. Currently in Google's
  "Testing" publish status — only test users added under Audience → Test users can sign in until published.

---

## 5. Running it locally

**1 — start the containers** (Docker Desktop must be running)
```bash
docker ps -a
docker start ipf-ldap ipf-mattermost ipf-postgres onedev-inpact   # whichever show "Exited"
```

**2 — install + start the AI/API server (port 3000)**
```bash
npm install
node server/index.js
```
No nodemon — restart this manually after *every* server-side change. Get in the habit of
`netstat -ano | grep :3000` → `taskkill //PID <pid> //F` → relaunch.

**3 — start the Vite dev server (port 5173)**
```bash
npm run dev
```
`vite.config.js` now sets `host: true` (fixed today — it was binding to `[::1]` only, so
`127.0.0.1:5173` was dead while `localhost:5173` worked). A `vite.config.js` change needs a full
server restart, not just HMR.

**4 — open it**: `http://localhost:5173` (or `http://127.0.0.1:5173` — both work now)

**Full-stack sanity check:**
```bash
curl -s -o /dev/null -w "AI server: %{http_code}\n" http://127.0.0.1:3000/api/auth/me
curl -s -o /dev/null -w "OneDev proxy: %{http_code}\n" http://localhost:5173/onedev-api/issues?count=1
curl -s -o /dev/null -w "Vite: %{http_code}\n" http://localhost:5173/
```

---

## 6. Directory map

IPF's slice of the repo — the lesson-engine half (`src/engines`, `src/ai-lessons`, etc.) is the older,
separate system and out of scope here.

```
server/
  index.js                    — mounts every router, serves the SPA in prod
  onedev-client.js            — the ONE OneDev client (listIssues/createIssue/parseKV/…)
  auth-router.js, auth-session.js, ldap-auth.js, google-oauth.js, role-grants.js
  recruit-router.js           — auto-matching + low-supply alerts
  specforge-router.js, id-router.js, assistance-sessions.js, assist-me-router.js
  notify-server.js            — server-side Mattermost (no Vite proxy to lean on)

src/
  auth/                        — useAuth.js, RequireRole.jsx, CoreLogin.jsx
  pd-studio/, specforge/        — Stage 1/2/3 generation UI + schemas
  workbench/                    — the task board (core view + JS-scoped view)
  cohort-matching/               — Apply.jsx, MatchingQueue.jsx, matching.js (shared predicate)
  instructional-design/          — ID Studio, Module Library, Draft Review
  id-module/                     — core-lesson matching, module generation
  assist-me/, engines/assist/     — the JS workspace + generated tutorial modules
  cd-review/, core-studio/, huddle-calendar/, contribution-monitor/,
    human-capital-reports/, cohorts/, team-messaging/
  EnterpriseReadinessGate.jsx    — the "before you apply" interstitial off the cinematic landing

docs/
  IPF_DEVGUIDE.md               — the full build log, read this next
```

---

## 7. Auth system

Two identity paths, one session shape. Built this session — fully live-verified.

| Path | Who | How |
|---|---|---|
| `POST /api/auth/core-login` | `-core` employees | LDAP bind (username/password against `ipf-ldap`) — never compares hashes, binds *as* the user. |
| `GET /api/auth/google/start` | JS applicants | Real Google OAuth. CSRF `state` is a server-memory one-time token (not a cookie — see below). |

Session: a signed JWT (`AUTH_SESSION_SECRET`) in an httpOnly, `sameSite:"lax"` cookie, 12h TTL:
```js
{ sub, name, email, accountType: "core" | "js", coreRole?: string, roles: string[] }
```

`requireSession` / `requireRole(...roles)` middleware in `server/auth-session.js` guard API routes;
`<RequireRole roles={[...]}>` in `src/main.jsx` guards frontend routes the same way. A `-core` account's
`coreRole` (e.g. `"PD-core"`) also satisfies the bare role name (`"PD"`) — a core employee already *is*
their role; a JS has to be explicitly granted one via `role-grants.js`.

> **Real bug found and fixed today, via an actual Google sign-in attempt (not curl):** `/google/start` is
> reached through the Vite-proxied browser origin (`localhost:5173`), so a cookie set there scopes to host
> `localhost` — but Google's redirect lands directly on `127.0.0.1:3000`, a different host as far as the
> browser's cookie jar is concerned. The state cookie never arrived at the callback, failing every real
> sign-in. Fixed by moving CSRF state out of a cookie entirely into a server-memory one-time token that
> round-trips through Google as a URL param instead (`pendingOAuthStates` in `auth-router.js`).

### Route guard map (`src/main.jsx`)

| Route | Requires |
|---|---|
| `/pd-studio` | PD |
| `/id-studio` | ID |
| `/cd-review` | CD |
| `/workbench`, `/assist-me` | any signed-in session (core or JS) |
| `/matching-queue`, `/core-studio`, `/cohorts`, etc. | any core role |
| `/apply` | unguarded — frictionless applicant funnel, by design |

---

## 8. Built & verified

Condensed from `IPF_DEVGUIDE.md §5a-1` through `§5a-7`. Every item below was confirmed with a real
click-through or a real API call, not just read as code.

- ✅ PD Studio: full spec → Stage 3 → publish flow, real OneDev writes.
- ✅ Skill-matched recruiting: two-tier trade/level gate, JS-tier default → TS/advanced unlock.
- ✅ Recruit auto-matching: applying *is* the match trigger now, not a manual Matching Queue click.
  Matching Queue is the fallback for anything that didn't auto-match.
- ✅ Google OAuth end-to-end (real account, not a test session) — sign-in, application, auto-match,
  "You're matched" screen.
- ✅ LDAP `-core` login, both the grant and deny paths, through the real rendered UI.
- ✅ Apply page: no free-text email field — Google sign-in *is* the last step of submitting, draft
  survives the OAuth round-trip via `sessionStorage`, auto-submits on return.
- ✅ Workbench JS-scoped view — a JS sees only their own matched task(s), not the full admin board.
- ✅ Low-supply alerts — PD-core gets pinged on Mattermost when a trade drops to ≤3 assignable tasks,
  once per 24h.
- ✅ Enterprise-readiness gate on the cinematic landing (`inpact.live`'s "Start doing" CTA) — forks to
  Apply vs. plain lessons.
- ✅ Core-lesson session/completion loop (ID Studio ↔ the separate IAAL-main lesson app) — full
  token/session round trip.
- ✅ CD Review: thin queue over real OneDev Pull Requests, one-time Mattermost announce per PR.

---

## 9. Open gaps

Real, known, not hedging. Ordered roughly by how likely they are to bite first.

1. ~~**A task can be matched to more than one applicant.**~~ **Fixed 2026-08-09** — `matchedTaskIds` /
   `tasksForApplicant` exclude already-matched tasks (auto-match + Matching Queue).
2. **No backend tutorial runtime exists.** Every lesson (including anything Gemini auto-drafts) is a React
   component rendered live in-browser — there's no sandboxed way to run/grade real backend code. Founder
   call: stay UI-only for now. Deferred.
3. ~~**Passive ownership disclaimer.**~~ **Fixed 2026-08-09** — affirmative checkbox at apply; stored as
   `OwnershipAck` + timestamp on the Application issue.
4. ~~**Workbench login-wall dead-end.**~~ **Fixed 2026-08-09** — OAuth `returnTo` + loginCode exchange on
   gated routes.
5. ~~**No re-match sweep.**~~ **Fixed 2026-08-09** — `tryRematchQueuedApplicants()` runs after ID publish
   unblocks tasks and after SpecForge publishes assignable tasks (human-action trigger, still no cron).
6. ~~`/publish` soft trust of `deliveryProjectId`.~~ **Hardened 2026-08-09** — id must exist in OneDev, not
   reserved; SpecForge `/publish` requires PD; ID `/publish` requires ID.
7. ~~`IPF_DEVGUIDE.md` stale §0/§5/§5a/§6.~~ **Refreshed 2026-08-09.**

**Still needs a human (ops):**
- Publish Google OAuth out of Testing in Cloud Console (or add applicants as test users).
- Restart AI server after pull (session secret was rotated) — everyone must re-sign-in.
- Prefer `docker start` of existing containers; `docker-compose.yml` is for new machines only.

---

## 10. Environment variables

`.env` is gitignored and not reproduced here — names and purpose only.

| Variable | Purpose |
|---|---|
| `ONEDEV_API_USER` / `_PASS` | OneDev basic auth — the whole system of record. |
| `DEEPSEEK_API_KEY` | SpecForge generation + mentor chat. |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | ID Module tutorial auto-drafting. |
| `AUTH_SESSION_SECRET` | Signs the session JWT — rotated 2026-08-09; never commit this value. |
| `LDAP_URL`, `LDAP_BASE_DN`, `LDAP_CORE_OU`, `LDAP_ADMIN_DN`, `LDAP_ADMIN_PASSWORD` | Points at `ipf-ldap` for `-core` login. |
| `GOOGLE_OAUTH_CLIENT_ID` / `_SECRET` / `_REDIRECT_URI` | Google Cloud Console → APIs & Services → Credentials, project `INPACTPF`. |
| `IPF_FRONTEND_URL` | Where the OAuth callback sends the browser back to. Must be `http://localhost:5173` in this environment (see §7's bug writeup). |
| `LESSONS_BASE_URL` | The separate IAAL-main lesson app, port 5174. |
| `VITE_MATTERMOST_WEBHOOK_ID` | The one incoming webhook every notification posts to. |
| `VITE_SUPABASE_*`, `VITE_FIREBASE_*` | Pre-existing lesson-app auth — not part of IPF, empty is fine unless touching that half. |

---

## 11. Conventions worth keeping

The discipline that found most of the real bugs listed above.

- **Verify with a real call, not a code read.** Every OneDev/LDAP/Google API assumption in this codebase
  was confirmed against real source or a real live call before being built on — guessed API shapes were
  wrong more than once (see `createIssue`'s bare-number return in §9's history, or the JAX-RS bare-String
  body on `POST /issues/{id}/description`).
- **A same-origin hash navigation isn't a real remount.** Testing tools that just flip `location.hash` on
  an already-loaded SPA don't force React to remount the way a genuine fresh page load does — call
  `location.reload()` to trust a test.
- **`npx eslint <file>` after every change**, and check pre-existing failures with `git stash` before
  treating a lint error as your own regression — `server/*.js` has a known, pre-existing gap where
  `process`/`Buffer` aren't declared as globals in the eslint config.
- **Restart the AI server after every server-side change** — no nodemon. `vite.config.js` changes need a
  full Vite restart too, not just HMR.
- **One normalization point beats N copies of a defensive guess.** `onedev-client.js`'s `createIssue`/
  `createProject` now normalize OneDev's inconsistent response shape once, at the source — three call
  sites had each independently discovered and guarded against it, a fourth hadn't and silently corrupted
  real data until found live.

---

## 12. Going deeper

1. `docs/IPF_DEVGUIDE.md` — the full chronological build log. Read §5a-1 through §5a-7 for everything
   summarized in §8/§9 above, in complete detail with the actual reasoning and the verification steps taken.
2. `src/cohort-matching/matching.js` — the one shared trade/skill predicate every matching decision in the
   app runs through. Start here before touching Recruit or Matching Queue.
3. `src/main.jsx` — the complete route guard map, the fastest way to see what's protected by what.
4. Fix the double-match gap (§9, item 1) before this goes anywhere near real applicant volume.
