import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "EXPRESS.JS #8",
      title: "Rate limiting & security headers",
      body: `express-rate-limit, helmet, CORS configuration, body size limits.`,
      usecase: "Abuse prevention and secure defaults.",
    },
  },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Apply rate limiting", "Use helmet", "Configure CORS and body parser limits"] },
  {
    id: "step1", type: "question", phase: "Step 1 of 3",
    paal: "Add express-rate-limit: 100 req/15min per IP. Add helmet(). Configure CORS to allow only your frontend origin.",
    answer_keywords: ["rateLimit", "helmet", "cors", "origin", "express"],
    seed_code: `const rateLimit = require('express-rate-limit')
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))
app.use(helmet())
app.use(cors({ origin: 'https://myapp.com' }))`,
    feedback_correct: "✅ rateLimit windowMs/max; helmet(); cors({ origin }).",
    feedback_wrong: "express-rate-limit, helmet, cors with origin whitelist.",
    expected: "Rate limit and security",
  },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "EXP-F08", title: "Rate limiting & security", shortName: "EXP — RATE LIMIT" });
