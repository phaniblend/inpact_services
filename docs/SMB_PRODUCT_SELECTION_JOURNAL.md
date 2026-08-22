# SMB product selection journal

**Owner:** IPF / Inpact delivery curriculum  
**Last updated:** 2026-08-21  
**Purpose:** Justify which products we seed for Junior Specialists — and force future picks through an evidence gate, not gut feel.

---

## Decision rule (use this for every new product)

A product enters the seed **only if all four are true**:

| # | Gate | Pass means |
|---|------|------------|
| 1 | **Pain is common** | Credible survey/report shows the job is a top SMB worry or a top tool category they already try to buy. |
| 2 | **They look / inquire** | Market behavior shows search, “all-in-one” preference, or high intent for that capability (billing, booking, leads, staffing). |
| 3 | **Purchase often fails on cost / complexity** | Enterprise or mid-market suites are priced or scoped out of reach for solo / micro SMBs (steep tier jumps, seats, onboarding fees, tool sprawl). |
| 4 | **Narrow desk is teachable** | We can ship a v1 as list+form + API with one domain rule — suitable for Assist Me lessons. |

If a candidate fails gate 3 (“nice idea but SMBs already buy cheap tools that fit”), **do not** add it. Prefer another desk where spend is real and still blocked.

---

## Evidence we treat as “proof”

| Finding | Why it matters | Source (public) |
|---------|----------------|-----------------|
| Cash flow is a top SMB worry (~47% in one 2025 owner survey); attracting customers ~40%; time management ~28%. | Products must attack money in / money late / time lost — not vanity features. | [inTandem / vcita — What do SMBs want in 2025?](https://intandem.vcita.com/blog/smb-insights/what-do-smbs-want-in-2025) |
| Tools they value most: collect payments (~41%), billing/invoicing automation (~32%), client info (~28%). Preferred automation: billing, payments, marketing. | Invoice + booking + lead follow-up map to stated demand. | Same |
| Ease of use often outranks price as *stated* top factor (~44% vs ~22%), but price still blocks *switches*: ~36% of lower-revenue SMBs say cost would stop them moving to an integrated payments system. | “Want it” ≠ “bought it.” Cost barrier shows up at the switch / upgrade moment. | inTandem 2025; [PYMNTS — integrated B2B payments](https://www.pymnts.com/study_posts/more-than-half-of-smbs-would-switch-to-an-integrated-b2b-payment-system/) |
| Many SMBs juggle multiple apps (often 2–8; some 5+); overlapping licenses and copy-paste between tools. | “Desk” products that replace a spreadsheet + two paid apps are credible. | [inTandem SMB Tech survey](https://intandem.vcita.com/blog/smb-insights/smb-tech-survey) |
| ~80% of employer firms report payments-related challenges; fees and slow settlement are common. | Cash-collection and invoice follow-up are not niche — they are operational hygiene. | [Federal Reserve SBCS — Report on Payments 2024](https://www.fedsmallbusiness.org/-/media/project/clevelandfedtenant/fsbsite/reports/2024/2024-report-on-payments_sbcs.pdf) |
| Scheduling still often phone/email for a large minority of small firms; reminders cut no-shows substantially (studies cite ~25–40% reductions). | Booking desks are not “solved” for every salon/clinic — especially when deposits + conflicts matter. | Industry scheduling roundups (e.g. Appointy / BMC health-services summaries cited in vendor analyses) |
| CRM / marketing suites jump hard: HubSpot Marketing Professional often ~$800/mo + ~$3k onboarding; seat-based sales/service hubs add ~$90+/user. | Lead follow-up and light CRM are **inquired about** then abandoned when the “real” tier is required. | HubSpot public pricing; [HubSpot SMB commentary](https://zeeg.me/en/blog/post/hubspot-for-small-business) |
| Consumers expect owners to answer reviews (~89% in vendor-cited surveys); many SMBs still respond to under half. Bundled reputation suites often land ~$75–$350+/mo (or sales-gated enterprise). | Review reply is high-intent local SEO / trust work that SMBs try to buy — then stick with phone screenshots when suites feel like overkill. | Industry review-management pricing roundups (e.g. NiceJob/Birdeye/Podium class); TinyReviews positioning vs $250–$500 enterprise |
| Estimates/quotes sit on the path from lead → cash (billing + attracting customers). Jobber/Housecall Pro–class field-service stacks are real purchases; solo operators still email PDFs. | Quote desks map to “looked / inquired” job software without requiring a full FSM suite. | Adjacent to invoicing demand (inTandem); field-service SaaS price walls for 1–2 person shops |
| Automated reminders cut no-shows substantially (~25–40% in health/scheduling literature); SMS/reminder features are often paid add-ons or locked behind higher booking tiers. | Reminder desks are inquired about with booking tools — micro shops keep texting manually when SMS packs / suites cost more than the missed slot. | Scheduling reminder studies; booking-platform pricing that meters SMS or upsells “Pro” for reminders |
| Prepaid packages / punch cards are everyday salon-cafe ops; loyalty and package features live inside Booksy/Vagaro/Square stacks that charge per staff, commissions, or add-ons. | Package desks replace notebook punch cards without buying a full POS+loyalty suite. | Service-business SaaS comparisons (per-seat / commission models vs flat desk) |

We do **not** claim we measured “X% of inquiries fail to convert” for our exact SKUs. We claim: **public demand + documented price cliffs + tool sprawl** → SMBs keep improvising (sheets, sticky notes, free tiers) instead of buying the suite that actually fits the job.

---

## Current seed (8 products) — why each survives the gates

### 1. BookingDepositDesk

| Gate | Verdict |
|------|---------|
| Pain | Time + cash: no-shows and double-books burn capacity; deposits protect the day. |
| Look / inquire | Scheduling and payment-at-booking are mainstream SMB purchases (Calendly/Acuity class). |
| Cost barrier | Full salon stacks (scheduling + payments + CRM) stack monthly fees; enterprise CRM scheduling is overkill for a 2-chair shop. |
| Teachable | Appointment list+form; API with slot conflict — already proven Assist pattern. |

**SMB help:** One desk for “who is booked / can they book / did they put money down” without paying for three products.

### 2. InvoiceFollowUpTracker

| Gate | Verdict |
|------|---------|
| Pain | Cash flow #1; unpaid invoices are the daily crisis. |
| Look / inquire | Billing/invoicing automation is explicitly a top desired capability. |
| Cost barrier | QuickBooks / full AR suites + chase sequences exceed what a solo tradesperson will pay for “nudge overdue clients.” |
| Teachable | Invoice list+form; API with derived overdue — Assist pattern reused. |

**SMB help:** See what is owed, create invoices, trust server-side overdue — without a finance department.

### 3. LeadFollowUpInbox

| Gate | Verdict |
|------|---------|
| Pain | Attracting customers is a top worry; leads die in SMS/email/voicemail. |
| Look / inquire | Client info + marketing automation appear in “all-in-one” wish lists. |
| Cost barrier | The free CRM is fine until automation/sequences force Professional-class pricing and onboarding fees. Micro SMBs bounce. |
| Teachable | Lead list+form; stale-lead status API; reply notes — same list/API pedagogy. |

**SMB help:** An inbox for “who asked / did we reply / is this lead cold” without HubSpot Pro.

### 4. ShiftCoverageBoard

| Gate | Verdict |
|------|---------|
| Pain | Time management; cafes/salons lose hours to “who works Tuesday?” and last-minute coverage. |
| Look / inquire | Workforce tools exist at scale; micro teams still use group chats and paper. |
| Cost barrier | Full workforce platforms (ADP-class / multi-location) are priced for employers, not a 6-person cafe. |
| Teachable | Shift list+form; overlap conflict API; open-shift coverage requests. |

**SMB help:** Publish shifts, block double-booking a person, post open coverage — without an HR suite.

### 5. QuoteEstimateDesk *(new)*

| Gate | Verdict |
|------|---------|
| Pain | Cash + acquisition: work dies between “here’s my price” and “you’re booked.” |
| Look / inquire | Estimates are table-stakes in field-service / trades software category. |
| Cost barrier | Full Jobber/Housecall-class stacks exceed what a solo tradesperson will pay for “send a quote + know if it expired.” |
| Teachable | Quote list+form; API with expired/accepted derived status; line items; accepted board filter. |

**SMB help:** Create quotes, see what’s expired vs accepted, without a field-service suite.

### 6. ReviewReplyInbox

| Gate | Verdict |
|------|---------|
| Pain | Attracting customers / local trust; unanswered reviews hurt conversion and search prominence. |
| Look / inquire | Owners search for Google review reply tools constantly; “all-in-one” wish lists include marketing. |
| Cost barrier | Reputation bundles often ~$75–$350+/mo or sales-gated; micro SMBs stay on phone screenshots. |
| Teachable | Review list+form; needs-reply derived status; reply notes; unanswered board — same Assist patterns. |

**SMB help:** See reviews, reply on the record, filter unanswered — without Birdeye/Podium-class spend.

### 7. ClientReminderHub *(new)*

| Gate | Verdict |
|------|---------|
| Pain | Time + cash: no-shows and forgotten follow-ups burn capacity and collections. |
| Look / inquire | Reminder automation is a top reason SMBs evaluate booking/billing tools. |
| Cost barrier | SMS packs and “Pro” reminder tiers stack on top of base tools; solo shops keep typing texts by hand. |
| Teachable | Reminder list+form; due/sent derived status; channel conflict API; due board filter. |

**SMB help:** Schedule what to say and when — without paying for a full messaging suite.

### 8. PackagePunchCard *(new)*

| Gate | Verdict |
|------|---------|
| Pain | Prepaid packages are cash-up-front revenue; notebook punch cards get lost and disputed. |
| Look / inquire | Loyalty/packages appear in salon-cafe software feature matrices SMBs compare. |
| Cost barrier | Booksy/Vagaro-class stacks add staff seats, commissions, or package add-ons; micro shops stay on paper. |
| Teachable | Package list+form; remaining-punches derived status; punch log + conflict; low-balance board. |

**SMB help:** Sell a 5-cut card, punch it honestly, see what’s almost empty — without a POS loyalty module.

---

## Products we considered and deferred

| Candidate | Why deferred |
|-----------|----------------|
| Full POS / inventory ERP | Demand is real, but v1 is too wide for Assist Me atomic lessons. |
| Generic AI chatbot | Weak gate 1 for *cash* outcomes; hard to accept-criteria in Coding tasks. |
| Website builder | Saturated free tiers; weak “want but can’t buy” story vs desks above. |
| Full reputation suite (SMS request + 50-site scrape) | Gate 4 fails for curriculum grain; we teach the reply desk only. |
| Standalone expense OCR / corporate cards | Many free or $0/user entry tiers — weak gate 3 vs desks we chose. |

---

## Curriculum mapping (this seed)

| Trade | Target volume | Role in pipeline |
|-------|---------------|------------------|
| Coding | ~40 tasks (5 × 8 products) | Each Coding task wires an Assist module (IDT order, transferable objectives, developer “why this matters,” live DESIGN MOCK on UI lessons). |
| QA | ~40 | Manual plans, edge cases, regression checklists. |
| Content | ~40 | Client-facing copy, reminders, tone. |
| PM | ~40 | Scope cuts, acceptance, delivery checklists. |
| Product design | ~40 | Flows, empty states, status language. |

Regenerate Assist engines: `node scripts/write-smb-assist-engines.mjs`  
Reseed OneDev: wipe → write engines → `node scripts/seed-smb-pipeline.mjs` → `node scripts/publish-idt-assist-modules.mjs`

---

## Journal log

| Date | Change | Rationale |
|------|--------|-----------|
| 2026-08 | Seed Booking + Invoice (2 products) | Cash + scheduling; first Assist wiring. |
| 2026-08-19 | Add LeadFollowUpInbox + ShiftCoverageBoard; expand to ~20 tasks/trade; ~20 Assist modules; write this journal | Align seed with demand evidence; lock future picks to the four gates; encode review feedback (objectives, why-this-matters, design mocks) into Assist generators. |
| 2026-08-20 | Add QuoteEstimateDesk + ReviewReplyInbox → **6 products**; ~30 tasks/trade; ~30 Assist modules | Quotes bridge lead→cash; review reply bridges trust→customers; both clear cost-barrier gates without widening past teachable desks. |
| 2026-08-21 | Add ClientReminderHub + PackagePunchCard → **8 products**; ~40 tasks/trade; ~40 Assist modules | Reminders attack no-shows without SMS-suite spend; punch cards attack prepaid ops without POS loyalty upsells. Deferred free-tier expense OCR (weak gate 3). |

---

## When evidence is thin

If we cannot cite a survey, pricing cliff, or tool-sprawl story within one page:

1. Mark the product **hypothesis** in this journal.  
2. Do **not** expand Assist count for it.  
3. Prefer a product that already clears all four gates.
