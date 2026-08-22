import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "EXPRESS.JS #4",
      title: "Authentication middleware",
      body: `JWT verification, session middleware, Passport.js strategies.`,
      usecase: "Protecting routes and identifying users.",
    },
  },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Verify JWT in middleware", "Use session middleware", "Apply auth to routes"] },
  {
    id: "step1", type: "question", phase: "Step 1 of 3",
    paal: "Write middleware that reads Authorization: Bearer <token>, verifies JWT, and attaches req.user. Return 401 if missing or invalid.",
    answer_keywords: ["Authorization", "Bearer", "jwt", "verify", "req.user", "401"],
    seed_code: `const token = req.headers.authorization?.replace('Bearer ', '')
if (!token) return res.status(401).json({ error: 'Unauthorized' })
try {
  req.user = jwt.verify(token, process.env.JWT_SECRET)
  next()
} catch { res.status(401).json({ error: 'Invalid token' }) }`,
    feedback_correct: "✅ Read Authorization header; jwt.verify; attach req.user; 401 on fail.",
    feedback_wrong: "Parse Bearer token from header; verify with jwt.verify; 401 if missing/invalid.",
    expected: "JWT auth middleware",
  },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "EXP-F04", title: "Authentication middleware", shortName: "EXP — AUTH" });
