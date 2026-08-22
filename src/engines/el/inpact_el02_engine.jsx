import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "ENGINEERING LEADERSHIP #2",
      title: "Code Review, Mentoring & Engineering Culture",
      body: `The highest-leverage thing a senior engineer does
is NOT writing code.

It's raising the capabilities of everyone around them.

A senior who writes great code and hoards their knowledge
has a linear impact. A senior who mentors, writes thoughtful
code reviews, establishes patterns, and builds team culture
has an exponential impact.

Code reviews are teaching moments.
Pair programming is knowledge transfer.
Documentation is asynchronous mentoring.
Good culture is the environment where all of this compounds.

The skills:
  Code review    — not just bug hunting, but knowledge transfer
  Mentoring      — specific, actionable feedback vs generic praise
  Onboarding     — get new engineers productive in 30 days
  Culture        — psychological safety, blameless learning`,
      usecase: `Every code review you write, every 1:1 you run, every new team member you onboard, every decision about process and standards — these compound into the engineering culture your team lives in.`,
    },
  },
  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Write code reviews that teach, not just critique",
      "Give the SBI feedback model: Situation, Behavior, Impact",
      "Structure a 30-60-90 day onboarding plan for new engineers",
      "Run effective 1:1s that surface lessons before they fester",
      "Build psychological safety so engineers flag lessons early",
      "Know when to approve despite disagreement (disagree-and-commit)",
    ],
  },
  {
    id: "step1", type: "question", phase: "Step 1 of 5",
    paal: "Write code review comments that teach rather than just criticise. Show the difference between blocking and non-blocking feedback.",
    answer_keywords: ["code review", "teach", "blocking", "non-blocking", "nitpick", "explain why"],
    seed_code: `// Step 1: writing effective code review comments

/*
THE PURPOSE OF CODE REVIEW:
  1. Catch bugs and security issues (important)
  2. Transfer knowledge (more important long-term)
  3. Maintain consistency and standards (important)
  4. NOT: demonstrate your superiority or gatekeep

COMMENT TYPES — be explicit about severity:
  🚨 [BLOCKING] Must fix before merge — bug, security, correctness
  ⚠️  [BLOCKING] Architecture concern — wrong approach, rethink needed
  💡 [SUGGESTION] Better way exists, but current code is fine
  📝 [NIT] Minor style/naming — totally optional, don't block on these
  ❓ [QUESTION] I don't understand this — not necessarily wrong

FORMULA FOR GOOD COMMENTS:
  1. What (the issue)
  2. Why (the reason it matters)
  3. How (a concrete alternative)
  4. Resource (docs, pattern, example) — optional but powerful
*/

// ── BEFORE AND AFTER EXAMPLES ─────────────────────────────────

// ❌ BAD REVIEW COMMENT:
// "This is wrong."
// (What's wrong? Why? How to fix? Zero learning value.)

// ❌ ALSO BAD:
// "You should use bcrypt here."
// (Imperative, no explanation. Author doesn't know WHY.)

// ✅ GOOD — BLOCKING SECURITY:
/*
🚨 [BLOCKING] Security: MD5 is cryptographically broken for passwords.

MD5 is a fast hashing algorithm — that's the lesson. A modern GPU can
compute 10 billion MD5 hashes/second, making brute force trivial if our
DB is ever breached.

Suggested fix:
  const hash = await bcrypt.hash(password, 12)
  // bcrypt is deliberately slow — ~250ms at work factor 12

See: OWASP Password Storage Cheat Sheet → https://cheatsheetseries.owasp.org/...
*/

// ✅ GOOD — SUGGESTION (non-blocking):
/*
💡 [SUGGESTION] Consider using Array.fromEntries(Object.entries(obj).map(...))
instead of the manual for-loop. Same result, more idiomatic:

  const doubled = Object.fromEntries(
    Object.entries(prices).map(([k, v]) => [k, v * 2])
  )

Totally fine as-is though — this is just a style note.
*/

// ✅ GOOD — TEACHING MOMENT:
/*
💡 [SUGGESTION] This works, but watch out for the N+1 pattern here.

For each order, you're making a separate DB call to get the user.
With 100 orders → 101 DB queries instead of 1.

Consider: load all users in one query and map by ID:
  const userMap = new Map(users.map(u => [u.id, u]))
  const ordersWithUsers = orders.map(o => ({ ...o, user: userMap.get(o.userId) }))

Here's a great article on N+1 in ORMs: [link]
*/

export {}`,
    feedback_correct: "✅ Tag severity (BLOCKING/SUGGESTION/NIT). Explain WHAT, WHY, and HOW. Include alternatives. Non-blocking comments should never delay merges.",
    feedback_partial: "Label comments: BLOCKING (must fix), SUGGESTION (optional), NIT (ignore if busy). Always explain why, not just what.",
    feedback_wrong: "Label severity. Explain: what's wrong + why it matters + how to fix. Add resource links. Never just 'this is wrong'.",
    expected: "Effective code review commenting",
  },
  {
    id: "step2", type: "question", phase: "Step 2 of 5",
    paal: "Give feedback using the SBI model: Situation, Behavior, Impact. Show how to handle a recurring issue with a junior engineer.",
    answer_keywords: ["sbi", "situation", "behavior", "impact", "feedback", "specific", "actionable"],
    seed_code: `// Step 2: SBI feedback model — Situation, Behavior, Impact

/*
WHY GENERIC FEEDBACK FAILS:
  "Your code quality needs to improve."
  → What does that mean? What should they do differently tomorrow?
  → This is useless. The person leaves feeling bad but unchanged.

  "You need to communicate better."
  → In what situations? What specifically? Compared to what standard?
  → Still useless.

SBI MODEL: makes feedback specific, actionable, and non-personal.
  Situation: when / where did this occur? (specific context)
  Behavior:  what exactly did I observe? (factual, not interpretive)
  Impact:    what was the effect? (on team, project, user, trust)

Then: ask, don't tell. "What was going on for you?"
*/

// ── SCENARIO: Junior engineer merged without review twice ──────

// ❌ BAD FEEDBACK:
// "You need to stop pushing directly to main. This is unprofessional."
// → Shaming, no specifics, no path forward

// ✅ SBI FEEDBACK:
const sbiFeedback = \`
Situation:
  "In the last two sprints — the payment feature PR on March 3rd
  and the auth hotfix on March 10th..."

Behavior:
  "...you merged both directly to main without requesting a review,
  and in the March 10th case, without the CI pipeline passing."

Impact:
  "The March 10th merge introduced a regression that took Alice
  3 hours to debug. It also means I can't trust that our main
  branch is always stable, which changes how I have to manage
  the team's deployments."

Then listen:
  "I want to understand what was happening in those moments.
  Was there time pressure? Was something unclear about the process?"

Close with agreement:
  "Going forward, what would help you remember to follow the
  review process even under pressure? Is there something about
  the process we should change?"
\`

// ── DELIVERING RECURRING FEEDBACK ─────────────────────────────
// First time: assume misunderstanding. Clarify the standard.
// Second time: use SBI. Make the impact explicit. Ask why.
// Third time: this is a performance conversation. Document it.
//             "This is the third time. I need to be direct:
//              if this continues, it will affect my assessment
//              of your readiness for more responsibility."

// ── POSITIVE FEEDBACK WITH SBI ────────────────────────────────
// SBI works for positive reinforcement too:
const positivesFeedback = \`
Situation: "In yesterday's production incident..."
Behavior:  "...you immediately wrote up a clear timeline and
            communicated it to stakeholders every 15 minutes
            without being asked."
Impact:    "That transparency meant leadership stayed calm and
            let the team focus on the fix. That's exactly the
            level of ownership I want to see at your level."
\`
// Specific positive feedback is 5× more memorable than generic praise.

export { sbiFeedback, positivesFeedback }`,
    feedback_correct: "✅ SBI: Situation (specific context) + Behavior (observable, factual) + Impact (on team/project). Always listen after. Positive SBI is equally powerful.",
    feedback_partial: "Situation: when/where. Behavior: what you observed (fact, not judgment). Impact: the effect. Then ask why before prescribing.",
    feedback_wrong: "Situation: 'On March 3rd...' Behavior: 'you merged without review' Impact: '3-hour regression'. Ask why before concluding. Third time = performance conversation.",
    expected: "SBI feedback model",
  },
  {
    id: "step3", type: "question", phase: "Step 3 of 5",
    paal: "Design a 30-60-90 day onboarding plan for a new senior engineer. Show how to get them productive without throwing them in the deep end.",
    answer_keywords: ["onboarding", "30", "60", "90", "plan", "ramp", "goals", "buddy"],
    seed_code: `// Step 3: 30-60-90 day onboarding plan

/*
THE COST OF BAD ONBOARDING:
  Average time for a new engineer to be fully productive: 6-12 months.
  With a good onboarding plan: 3-4 months.
  Without one: 9-12 months, and some never get there.

  Good onboarding = structured ramp + genuine welcome + early wins.
  
STRUCTURE: escalating autonomy + decreasing guidance
*/

const onboardingPlan = {
  preboarding: {
    // Before day 1:
    tasks: [
      'Laptop and accounts provisioned (never make someone wait for this)',
      'Welcome email from team lead with first-week overview',
      'Buddy assigned (experienced team member, not their manager)',
      'Reading list: key ADRs, architecture overview, team norms doc',
    ],
  },

  days1to30: {
    theme: 'Learn — observe more than you build',
    goals: [
      'Understand the product: use it as a customer for a full week',
      'Read 10 most important ADRs and ask questions about each',
      'Shadow 3 different engineers in code review, debugging, deployment',
      'Complete first PR (small, well-defined, low-risk)',
      'Set up local dev environment end-to-end without help (document gaps)',
      'Meet every team member 1:1 (30 min, casual)',
    ],
    check: '30-day review: what did you learn? What surprised you? What\'s unclear?',
    metric: 'First PR merged. Understands how to deploy.',
  },

  days31to60: {
    theme: 'Contribute — start owning small pieces',
    goals: [
      'Own a S or M sized feature end-to-end (from spec to production)',
      'Lead one code review and provide substantive feedback',
      'Fix one bug found by themselves (demonstrates independent debugging)',
      'Write one document (runbook, ADR, component README)',
      'Identify one improvement: process, tooling, or code quality',
    ],
    check: '60-day review: what have you built? Where are you stuck? What do you want to own?',
    metric: 'Shipped 2-3 features. Can debug independently.',
  },

  days61to90: {
    theme: 'Contribute proactively — start pulling, not just pushing',
    goals: [
      'Own an L-sized feature with some ambiguity',
      'Lead a technical decision (write the ADR or RFC)',
      'Mentor something: pair program with a junior, write a guide',
      'Propose one improvement and follow it through to completion',
      'Handle an on-call shift (with buddy support)',
    ],
    check: '90-day review: are you where we hoped? What does the next 90 look like?',
    metric: 'Working independently. Proactively spotting lessons.',
  },
}

/*
BUDDY VS MANAGER:
  Buddy:   day-to-day questions, culture, "who do I ask about X?"
           Should be a trusted peer, not the new person's manager
  Manager: goals, career, performance, workload

COMMON MISTAKES:
  ❌ Giving a new engineer a hard lesson on day 3 (sink or swim)
  ❌ No assigned buddy — left to figure it out alone
  ❌ 30-day plan with no check-in until day 30
  ❌ New engineer feels like a burden for asking questions
*/

export { onboardingPlan }`,
    feedback_correct: "✅ 30: learn/observe. 60: own small pieces. 90: proactive contribution. Assign a buddy. Early wins build confidence. Check in weekly, not just at milestones.",
    feedback_partial: "Days 1-30: learn the product and codebase. 31-60: own features end-to-end. 61-90: lead decisions, mentor others. Buddy ≠ manager.",
    feedback_wrong: "30 days: observe and small PR. 60 days: own features. 90 days: lead decisions. Buddy for daily questions. Weekly check-ins.",
    expected: "30-60-90 day onboarding plan",
  },
  {
    id: "step4", type: "question", phase: "Step 4 of 5",
    paal: "Run effective 1:1s. Show the agenda structure, how to surface hidden lessons, and what questions unlock honest conversation.",
    answer_keywords: ["1:1", "one on one", "agenda", "psychological safety", "trust", "questions"],
    seed_code: `// Step 4: effective 1:1 meetings

/*
WHAT 1:1s ARE NOT:
  ❌ Status updates (you have standup for that)
  ❌ Project reviews (you have sprint reviews for that)
  ❌ A meeting you cancel when you're busy

WHAT 1:1s ARE:
  ✅ The primary trust-building mechanism between manager and report
  ✅ The place where lessons surface before they become crises
  ✅ Where career conversations happen
  ✅ Where you catch frustration before someone silently quits

CADENCE: Weekly for 30 min. Never skip two in a row.
Format: their agenda first, then yours.
*/

const oneOnOneStructure = {
  theirTime: {
    duration: '20 minutes',
    opening: 'What\'s on your mind?',  // simple, open, powerful
    // Let them drive. Resist filling silences. Silence means thinking.
  },

  // QUESTIONS THAT UNLOCK REAL CONVERSATION:
  unlockingQuestions: [
    // Surface hidden lessons:
    'What\'s the most frustrating thing you\'ve dealt with this week?',
    'Is there anything slowing you down that I could help remove?',
    'Is there anything you\'re worried about that we haven\'t talked about?',
    'What\'s one thing the team could do differently that would make your job better?',

    // Career and growth:
    'What did you work on this week that you found most interesting?',
    'What do you wish you had more time to work on?',
    'Is there a skill you want to develop that you\'re not getting exposure to?',
    'Where do you see yourself in 18 months? What would make that possible?',

    // Team health:
    'How are things with the rest of the team? Any friction I should know about?',
    'Do you feel like your work is valued? What would make that clearer?',
    'Is there anything I could do differently as your manager?',
  ],

  yourTime: {
    duration: '10 minutes',
    uses: [
      'Share context they need that isn\'t visible from their position',
      'Give specific feedback (SBI — see previous lesson)',
      'Discuss upcoming changes that affect them',
      'Align on priorities if anything has shifted',
    ],
  },
}

/*
PSYCHOLOGICAL SAFETY SIGNALS:
  You have it when:
  - People tell you about mistakes before you find them yourself
  - People disagree with you in meetings (not just privately)
  - People bring you half-formed ideas without fear of ridicule

  You've lost it when:
  - Engineers only share good news
  - "Everything's fine" every week (almost certainly not true)
  - People stop suggesting improvements
  - You're surprised by resignations

BUILD IT BY:
  - Admitting your own mistakes and uncertainty publicly
  - Rewarding the person who flagged a lesson early
  - Never punishing "I don't know" — only "I didn't try to find out"
  - Saying "what would you do?" before sharing your own opinion
*/

export { oneOnOneStructure }`,
    feedback_correct: "✅ 1:1 = trust building, not status. Their agenda first. 'What's on your mind?' is the most powerful opener. Psychological safety = lessons surface early.",
    feedback_partial: "1:1 format: their time (20 min, open questions), your time (10 min, context + feedback). Cadence: weekly. Never cancel twice in a row.",
    feedback_wrong: "'What's on your mind?' opens 1:1s. Their agenda first. Surface hidden lessons with specific questions. Safety = engineers share bad news early.",
    expected: "Effective 1:1 structure and psychological safety",
  },
  {
    id: "step5", type: "question", phase: "Step 5 of 5",
    paal: "Apply disagree-and-commit. Show how to raise objections clearly, accept a decision you disagree with, and still execute fully.",
    answer_keywords: ["disagree", "commit", "objection", "decision", "alignment", "execute"],
    seed_code: `// Step 5: disagree-and-commit — the senior engineer's most important skill

/*
THE TRAP:
  Engineer disagrees with a decision.
  Doesn't fully voice their objection (conflict-avoidant).
  Grudgingly "agrees" in the meeting.
  Executes half-heartedly. Maybe sabotages subtly.
  Says "I told you so" when it fails.

  This is not disagree-and-commit. This is silent resistance.
  It damages trust, projects, and careers.

DISAGREE-AND-COMMIT IN THREE STEPS:

1. VOICE — articulate your objection clearly and once
2. LISTEN — genuinely understand the counter-argument
3. COMMIT — fully execute the decision as if it were your own idea
*/

// ── STEP 1: VOICING THE OBJECTION (do this right) ────────────
const goodObjection = \`
"I want to flag a concern before we commit to this.

I believe GraphQL introduces more complexity than we're accounting for:
  - N+1 query risk requires DataLoader everywhere (2 weeks extra)
  - Our current team has 0 GraphQL experience (1 week ramp minimum)
  - Query complexity attacks require rate limiting we don't have yet

I estimate this adds 5 weeks to the project, which pushes us past the
Q2 deadline. If that's acceptable, I understand. If the deadline is
firm, I'd advocate for BFF REST instead.

I've written this up if it's helpful: [link to RFC comment]

That's my full concern. Happy to be overruled if the team disagrees."
\`

// ── STEP 2: WHAT TO ACTUALLY HEAR IN RETURN ────────────────────
// "We've factored in the learning curve."
// "The Q2 deadline is flexible — we just didn't say so publicly."
// "We have a consultant with GraphQL experience joining."
// → These are real information. Update your model.

// "Trust us." / "It'll be fine." → Not a counter-argument.
//   It's OK to say: "I hear you, and I'll commit fully.
//   I just want to note that if we hit the N+1 lesson, we should
//   revisit this architecture decision — can we agree on a review date?"

// ── STEP 3: GENUINE COMMITMENT ─────────────────────────────────
/*
After a decision is made:
  ✅ "I raised my concern. The team decided X. I'm fully in."
  ✅ Execute X as well as you possibly can
  ✅ If your prediction comes true: "Here's what's happening.
     Here's how we can fix it. I can lead the fix."
     (Not: "I told you so." Ever.)
  
  ❌ Slow-walking the work
  ❌ Relitigating the decision in other meetings
  ❌ Saying "I never agreed with this" to other engineers
  ❌ Withholding your expertise because "they made the decision"

WHY THIS MATTERS:
  Senior engineers who can disagree and commit are trusted
  with more decisions over time.
  
  Those who relitigate or resist are excluded from decisions
  — which creates the very powerlessness they were trying to avoid.
*/

export { goodObjection }`,
    feedback_correct: "✅ Voice objection once, clearly, with specifics. Genuinely listen. Then fully commit. 'I told you so' is a career-limiting move. Trust is built by executing well.",
    feedback_partial: "Three steps: Voice (clearly, once), Listen (genuinely), Commit (fully, as if your idea). Never slow-walk or relitigate after the decision.",
    feedback_wrong: "Raise objection clearly with data. Listen to counter-argument. Then execute fully — no silent resistance, no 'I told you so', no relitigating.",
    expected: "Disagree-and-commit execution",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Code reviews", id: "step1" },
  { label: "Step 2 — SBI feedback", id: "step2" },
  { label: "Step 3 — Onboarding", id: "step3" },
  { label: "Step 4 — 1:1s", id: "step4" },
  { label: "Step 5 — Disagree & commit", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: "EL-02", title: "Code Review, Mentoring & Culture", shortName: "EL — MENTORING" });
