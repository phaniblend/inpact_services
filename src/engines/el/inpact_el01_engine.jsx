import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "ENGINEERING LEADERSHIP #1",
      title: "ADRs, Technical Debt & Estimation",
      body: `Senior engineers don't just write code.
They make decisions that other engineers live with for years.
They communicate technical complexity to non-technical people.
They know when to build vs buy, when to pay debt vs accrue it,
and how to estimate honestly without over-promising.

The tools:
  ADRs           — Architecture Decision Records: document WHY
  Technical debt — quantify, triage, and communicate it
  Estimation     — the cone of uncertainty, T-shirt sizing, PERT
  RFCs           — Request for Comments: build alignment before building
  Technical risk — surface it early, price it honestly

The difference between a senior and staff engineer is often
not technical ability — it's the ability to communicate
technical reality clearly and make good decisions under uncertainty.`,
      usecase: `Every architecture review, every sprint planning, every "how long will this take?" conversation, every "should we refactor or rewrite?" debate — these skills determine project outcomes.`,
    },
  },
  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Write an Architecture Decision Record (ADR) that future engineers will thank you for",
      "Quantify and communicate technical debt to non-engineers",
      "Estimate with the PERT formula and communicate uncertainty honestly",
      "Triage technical debt: what to fix now vs later vs never",
      "Write an RFC to build team alignment before implementation",
      "Recognise and avoid the sunk cost fallacy in engineering decisions",
    ],
  },
  {
    id: "step1", type: "question", phase: "Step 1 of 5",
    paal: "Write an Architecture Decision Record for choosing PostgreSQL over MongoDB. Include context, decision, consequences, and alternatives considered.",
    answer_keywords: ["adr", "context", "decision", "consequences", "alternatives", "status"],
    seed_code: `// Step 1: Architecture Decision Records (ADRs)

/*
WHY ADRs?
  Six months from now, a new engineer asks: "Why are we using PostgreSQL?
  Why not MongoDB? This seems like it could be a document store."
  
  Without an ADR: nobody knows. The original decision-makers left.
  The team debates it again. Maybe makes a worse decision.
  
  With an ADR: context, reasoning, and trade-offs are preserved.
  New engineers understand without a 2-hour meeting.

ADR FORMAT (Lightweight Michael Nygard style):
  Title, Date, Status, Context, Decision, Consequences, Alternatives

─── EXAMPLE ADR ──────────────────────────────────────────────────
*/

const exampleADR = \`
# ADR-003: Use PostgreSQL as Primary Database

**Date:** 2024-03-15
**Status:** Accepted
**Deciders:** Alice (Tech Lead), Bob (Backend), Carol (Architect)

## Context

We need to choose a primary database for the new learning platform.
Our data model includes: users, courses, enrollments, progress tracking,
assessments, and certificates. Data has clear relational structure with
frequent JOINs (e.g., user + enrollment + course + progress in one query).

We considered this choice carefully because changing databases later
is expensive. We need ACID guarantees for payment and enrollment records.
Current scale: 100K users, projected 2M in 2 years.

## Decision

We will use **PostgreSQL 16** as our primary database.

## Rationale

- Our data is inherently relational — normalised schema reduces 
  redundancy and simplifies consistency guarantees
- ACID transactions are required for enrollment + payment atomicity
- JSONB columns give us document flexibility where needed (metadata)
- Our team has deep PostgreSQL expertise — lower operational risk
- Managed options (RDS, Supabase) reduce ops burden
- PostgreSQL handles our projected 2M user scale without sharding

## Consequences

**Positive:**
- Strong consistency guarantees for critical data
- Rich query capabilities (window functions, CTEs, full-text search)
- Team productivity — familiar tooling
- Ecosystem: Prisma, TypeORM, Knex all have excellent PG support

**Negative:**
- Horizontal write scaling requires sharding (not needed at current scale)
- Schema migrations require more discipline than schemaless
- Less flexible for truly unstructured data (acceptable — our data is structured)

## Alternatives Considered

**MongoDB:**
  Rejected because: our data is relational, not document-oriented.
  JOINs across collections in MongoDB are awkward and less performant.
  Schema flexibility would reduce, not improve, our data quality.
  Team lacks operational experience.

**MySQL:**
  Viable. Rejected because: PostgreSQL has better JSON support,
  window functions, and EXPLAIN output. Team preference for PG.

## Review Date

Revisit if: user scale exceeds 5M (consider read replicas) or
if a genuinely document-oriented use case emerges.
\`

// Store ADRs in: /docs/decisions/ADR-003-postgresql.md
// Number them sequentially — never delete, only supersede

export { exampleADR }`,
    feedback_correct: "✅ ADR: Context (why we faced this), Decision (what we chose), Rationale (why), Consequences (good and bad), Alternatives (what we rejected and why).",
    feedback_partial: "ADR sections: Context, Decision, Rationale, Consequences (positive and negative), Alternatives Considered. Numbered, never deleted.",
    feedback_wrong: "ADR template: Context → Decision → Rationale → Consequences → Alternatives Considered. Stored in /docs/decisions/. Never deleted.",
    expected: "Architecture Decision Record writing",
  },
  {
    id: "step2", type: "question", phase: "Step 2 of 5",
    paal: "Quantify technical debt in terms non-engineers understand. Show how to express debt as risk, velocity cost, and opportunity cost.",
    answer_keywords: ["technical debt", "velocity", "risk", "opportunity cost", "interest", "principal"],
    seed_code: `// Step 2: quantifying and communicating technical debt

/*
THE WARD CUNNINGHAM METAPHOR:
  Technical debt = a financial loan.
  Principal = the work that wasn't done properly.
  Interest  = the extra time every future change costs because of it.

  Eventually, interest payments exceed useful work.
  That's when engineering feels impossible.

THE COMMUNICATION PROBLEM:
  Engineers: "Our authentication module has high cyclomatic complexity,
              no test coverage, and relies on deprecated crypto APIs."
  PM/Exec:   "So... is it a big deal?"

TRANSLATE TO BUSINESS TERMS:
*/

function calculateDebtImpact(debt) {
  return {
    // Velocity cost — how much slower does this make the team?
    velocityCost: [
      'Every change to the auth module takes 3× longer than it should.',
      'We ship ' + debt.affectedFeatures + ' features/month that touch auth.',
      'Estimated extra hours per month: ' + (debt.extraHoursPerChange * debt.affectedFeatures) + 'h',
      'At $150/hr fully-loaded: $' + (debt.extraHoursPerChange * debt.affectedFeatures * 150) + '/month in lost productivity',
    ].join('\n'),

    // Risk cost — what's the probability and impact of failure?
    riskCost: [
      'The deprecated crypto API (MD5 password hashing) creates a',
      'breach risk. If exploited:',
      '  - Regulatory fines (GDPR): up to €20M or 4% of annual turnover',
      '  - Customer notification cost: ~$50K',
      '  - Reputation damage: estimated 15% churn (' + (debt.mrr * 0.15) + '/month)',
      '  - Engineering remediation: ~200 hours ($30K)',
      'Expected value of risk: probability × impact',
    ].join('\n'),

    // Opportunity cost — what can't we build because of this?
    opportunityCost: [
      'Q2 roadmap: SSO integration (enterprise customers requesting it).',
      'Estimated with clean auth: 3 weeks.',
      'Estimated with current auth: 8 weeks (refactor required first).',
      '5-week delay = 1 quarter behind on enterprise go-to-market.',
    ].join('\n'),

    // What it would cost to fix now vs later:
    remediation: [
      'Fix now:   6 weeks engineering time (~$45K)',
      'Fix in Q3: 10 weeks (more entangled by then, ~$75K)',
      'Fix in Q4: 16 weeks (further entanglement, ~$120K)',
      'Debt is compounding — the interest rate is rising.',
    ].join('\n'),
  }
}

/*
THE TECHNICAL DEBT REGISTRY:
  Maintain a prioritised list with:
  - What the debt is (technical description)
  - Business impact (velocity, risk, opportunity)
  - Estimated fix cost
  - Recommended timing (now / next quarter / backlog)
  - Owner (who knows this area best)

  Review quarterly. Present to leadership as a risk register.
*/

export { calculateDebtImpact }`,
    feedback_correct: "✅ Translate debt to: velocity cost ($/month), risk cost (breach exposure), opportunity cost (what we can't build). Debt compounds — fix early is cheaper.",
    feedback_partial: "Express debt as: monthly velocity loss in hours/dollars, breach risk exposure, delayed roadmap items. Principal + interest metaphor.",
    feedback_wrong: "Velocity cost: extra hours × rate. Risk cost: probability × impact. Opportunity cost: delayed features. All in business terms, not technical.",
    expected: "Technical debt quantification in business terms",
  },
  {
    id: "step3", type: "question", phase: "Step 3 of 5",
    paal: "Estimate honestly using PERT and the cone of uncertainty. Show how to communicate confidence intervals, not point estimates.",
    answer_keywords: ["pert", "estimation", "optimistic", "pessimistic", "most likely", "confidence", "uncertainty"],
    seed_code: `// Step 3: PERT estimation and communicating uncertainty

/*
THE PROBLEM WITH POINT ESTIMATES:
  "How long will this take?" → "3 weeks"
  → Stakeholder hears: guaranteed delivery in 3 weeks
  → Reality: P50 estimate (50% chance of being right)
  → When it takes 5 weeks: trust is broken

THE CONE OF UNCERTAINTY:
  The further out you estimate, the wider the uncertainty.
  At project start: estimate could be 0.25× to 4× actual
  At detailed design: 0.5× to 2×
  At coding start: 0.8× to 1.25×
  Never give a single number for work > 2 weeks out.

─── PERT (Program Evaluation and Review Technique) ───────────────
  Optimistic (O): best case — everything goes right
  Most Likely (M): what usually happens
  Pessimistic (P): worst case — Murphy's Law
  
  PERT estimate = (O + 4M + P) / 6
  Standard deviation = (P - O) / 6
  
  This gives you a RANGE with statistical backing.
*/

function pertEstimate(optimistic, mostLikely, pessimistic) {
  const expected = (optimistic + 4 * mostLikely + pessimistic) / 6
  const stdDev   = (pessimistic - optimistic) / 6
  
  return {
    expected:     Math.round(expected * 10) / 10,
    stdDev:       Math.round(stdDev * 10) / 10,
    // 68% confidence interval (±1 standard deviation):
    range68:      [expected - stdDev, expected + stdDev].map(n => Math.round(n * 10) / 10),
    // 95% confidence interval (±2 standard deviations):
    range95:      [expected - 2*stdDev, expected + 2*stdDev].map(n => Math.round(n * 10) / 10),
  }
}

// Example: OAuth2 integration
const oauth = pertEstimate(3, 5, 12)  // days
// expected: 5.8 days, 95% range: 2.3 – 9.3 days

/*
HOW TO COMMUNICATE THIS:
  ❌ "It'll take about a week."  (false precision)
  
  ✅ "My PERT estimate is 5.8 days most likely.
      I'm 68% confident it falls between 4.7 and 6.9 days.
      The pessimistic scenario (bad API docs, blocked by DevOps) 
      is 12 days. If you need a firm commitment, plan for 8 days."

T-SHIRT SIZING (for early-stage estimation):
  XS: < 1 day
  S:  1-3 days
  M:  3-7 days
  L:  1-3 weeks
  XL: 3-8 weeks
  XXL: > 8 weeks → break it down before estimating

  Never estimate XXL as a unit. Always decompose first.
*/

// Decompose + sum for better accuracy:
const tasks = [
  pertEstimate(0.5, 1, 2),    // Read OAuth2 docs, understand provider
  pertEstimate(1, 2, 4),      // Implement PKCE flow
  pertEstimate(0.5, 1, 3),    // Handle token refresh
  pertEstimate(1, 2, 3),      // Integration tests
  pertEstimate(0.5, 1, 2),    // Security review
]
const totalExpected = tasks.reduce((sum, t) => sum + t.expected, 0)
// Summing PERT estimates gives a more accurate total than one big estimate

export { pertEstimate, totalExpected }`,
    feedback_correct: "✅ PERT = (O + 4M + P) / 6. Always give ranges, not point estimates. Decompose large work before estimating. Communicate confidence level explicitly.",
    feedback_partial: "PERT: (optimistic + 4×mostLikely + pessimistic) / 6. Give 68% and 95% ranges. T-shirt size XXL means break it down first.",
    feedback_wrong: "PERT estimate = (O + 4M + P) / 6. Std dev = (P-O)/6. Never single number for >2 week work. Always give a range with confidence.",
    expected: "PERT estimation and confidence intervals",
  },
  {
    id: "step4", type: "question", phase: "Step 4 of 5",
    paal: "Triage technical debt: apply a framework to decide what to fix now, next quarter, or never. Show how to present this to leadership.",
    answer_keywords: ["triage", "priority", "risk", "impact", "fix", "defer", "accept"],
    seed_code: `// Step 4: technical debt triage framework

/*
NOT ALL DEBT IS EQUAL.
Some debt is "strategic" — we knew we were cutting corners
to hit a deadline. Planned. Documented.

Some debt is "accidental" — nobody knew it was wrong at the time.
No documentation. Discovered when trying to change it.

The triage question: what's the cost of carrying this debt
versus the cost of fixing it now?
*/

function triageDebt(debt) {
  const riskScore   = debt.breachRisk * debt.breachImpact          // probability × impact
  const velocityCost = debt.extraHoursPerMonth * 150               // $/month
  const fixCost     = debt.fixWeeks * 40 * 150                    // hours × rate

  const monthsToBreakEven = fixCost / velocityCost

  // DECISION MATRIX:
  if (debt.breachRisk > 0.3 || debt.complianceRisk) {
    return {
      decision: 'FIX NOW — this sprint',
      reason:   'Unacceptable security or compliance risk',
      escalate: true,
    }
  }

  if (monthsToBreakEven < 3) {
    return {
      decision: 'FIX SOON — next quarter',
      reason:   'Breaks even in ' + monthsToBreakEven.toFixed(1) + ' months. High ROI.',
      escalate: false,
    }
  }

  if (monthsToBreakEven < 12 && debt.blocksFutureWork) {
    return {
      decision: 'SCHEDULE — within 6 months',
      reason:   'Blocks roadmap items. Fixes itself as we build adjacent features.',
      escalate: false,
    }
  }

  if (monthsToBreakEven > 24 && !debt.blocksFutureWork) {
    return {
      decision: 'ACCEPT — add to registry, do not fix proactively',
      reason:   'Cost to fix exceeds benefit. Monitor; fix if it becomes a blocker.',
      escalate: false,
    }
  }

  return { decision: 'DEFER — revisit next quarter', reason: 'Medium priority' }
}

/*
PRESENTING DEBT TO LEADERSHIP:

"We've identified 8 areas of technical debt in Q1.
Prioritised by risk and ROI:

CRITICAL (fix this sprint):
  - Auth module MD5 hashing → GDPR breach risk, fix cost $15K
    If breached: $500K+ exposure. ROI is obvious.

HIGH (next quarter):
  - Order service: no retry logic → 2% silent failures = $8K/month loss
    Fix cost: $12K. Pays back in 6 weeks.

MEDIUM (schedule):
  - Legacy API layer: blocks SSO (Q3 roadmap). Fix before Q3 or delay SSO.

LOW (accept):
  - Admin dashboard: outdated chart library. No user impact. Defer indefinitely.

Total debt reduction investment: $120K over 2 quarters.
Expected return: $45K/month in recovered velocity + risk elimination."
*/

export { triageDebt }`,
    feedback_correct: "✅ Triage by: security risk (fix now), ROI/break-even (fix soon if <3 months), blocks roadmap (schedule), no impact (accept). Always in business terms.",
    feedback_partial: "Fix Now: security/compliance risk. Fix Soon: breaks even <3 months. Schedule: blocks roadmap. Accept: low ROI, no impact.",
    feedback_wrong: "Triage matrix: breach risk → fix now. Break-even < 3 months → fix soon. Blocks future work → schedule. Else → accept and monitor.",
    expected: "Technical debt triage framework",
  },
  {
    id: "step5", type: "question", phase: "Step 5 of 5",
    paal: "Write an RFC (Request for Comments) to propose migrating from REST to GraphQL. Show how RFCs build alignment and surface objections early.",
    answer_keywords: ["rfc", "proposal", "alignment", "objections", "feedback", "decision"],
    seed_code: `// Step 5: RFC — Request for Comments

/*
WHY RFCS?
  Starting to build is the most expensive time to discover
  that the team disagrees on the approach.
  
  An RFC costs a few hours to write.
  Undoing a month of wrong-direction implementation costs weeks.
  
  RFCs also prevent the "I wasn't consulted" resentment that
  kills team cohesion.

FORMAT: Lesson → Proposal → Alternatives → Open Questions → Decision
*/

const rfc = \`
# RFC-012: GraphQL API Layer for Client-Facing Endpoints

**Author:** Venkat (Senior UI Architect)
**Date:** 2024-03-15
**Status:** Under Review (feedback requested by 2024-03-29)
**Stakeholders:** Frontend team, Backend team, Mobile team, Platform

## Lesson

Our current REST API requires 4-7 round trips for the dashboard page:
  GET /users/me
  GET /enrollments?userId=X
  GET /courses?ids=A,B,C
  GET /progress?enrollmentId=Y
  ...

This causes:
  - Dashboard load time: 3.2s on mobile (P99)
  - Over-fetching: user object returns 40 fields, frontend uses 6
  - Under-fetching: course object doesn't include instructor, requires extra call
  - Schema coordination: frontend and backend coordinate 15+ endpoints quarterly

## Proposal

Introduce a GraphQL layer for all client-facing queries.
REST remains for server-to-server and webhooks.

Frontend switches from REST to GraphQL for all UI data fetching.
Single endpoint: POST /graphql

Expected outcomes:
  - Dashboard: 1 GraphQL query replaces 5 REST calls
  - Load time: 3.2s → estimated 1.1s (P99 mobile)
  - Frontend autonomy: teams add fields without backend schema changes

## Implementation Plan

Phase 1 (4 weeks): GraphQL gateway, schema design, 3 core queries
Phase 2 (4 weeks): Migrate dashboard and course pages
Phase 3 (4 weeks): Migrate remaining pages, deprecate REST endpoints

## Alternatives Considered

**BFF (Backend For Frontend) REST API:**
  Pro: simpler tech, team familiarity
  Con: one BFF per client type (web, mobile, admin) → 3× maintenance

**Stay with REST + field projection:**
  Pro: no new technology
  Con: doesn't solve N+1 calls or over-fetching structurally

## Risks and Mitigations

- **N+1 query risk:** GraphQL resolvers without DataLoader create N+1 DB queries
  Mitigation: DataLoader required pattern before launch (Alice owns this)
  
- **Query complexity attacks:** clients can request deeply nested queries
  Mitigation: query depth + complexity limits via graphql-depth-limit

- **Team learning curve:** 2 engineers unfamiliar with GraphQL
  Mitigation: 1-week spike, pair programming during Phase 1

## Open Questions (please respond)

1. Mobile team: would you adopt GraphQL or keep REST for mobile?
2. Platform: any concerns about adding Apollo Server to the stack?
3. Backend: concerns about resolver performance or caching strategy?

## Decision

Pending feedback. Decision deadline: 2024-03-29.
\`

export { rfc }`,
    feedback_correct: "✅ RFC: Lesson → Proposal → Alternatives → Risks → Open Questions. Builds alignment before building. Surfaces objections early when cheap to address.",
    feedback_partial: "RFC sections: lesson (measurable), proposal (concrete), alternatives (honest), risks (with mitigations), open questions (specific, actionable).",
    feedback_wrong: "RFC: state the lesson with data, propose solution, show alternatives considered, list risks with mitigations, ask specific questions. Time-box feedback.",
    expected: "RFC writing for technical alignment",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — ADRs", id: "step1" },
  { label: "Step 2 — Tech debt comms", id: "step2" },
  { label: "Step 3 — PERT estimation", id: "step3" },
  { label: "Step 4 — Debt triage", id: "step4" },
  { label: "Step 5 — RFC writing", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: "EL-01", title: "ADRs, Technical Debt & Estimation", shortName: "EL — DECISIONS" });
