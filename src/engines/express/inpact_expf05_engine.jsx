import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "EXPRESS.JS #5",
      title: "Validation & sanitisation",
      body: `express-validator, Zod middleware, DTO pattern. Rejecting bad input early.`,
      usecase: "Security and data integrity at the edge.",
    },
  },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Validate with express-validator or Zod", "Return 400 with errors", "Sanitise input"] },
  {
    id: "step1", type: "question", phase: "Step 1 of 3",
    paal: "Validate POST body: email (isEmail), password (min length). Return 400 with validation errors. Use express-validator or Zod.",
    answer_keywords: ["validation", "body", "email", "400", "express-validator", "zod"],
    seed_code: `import { body, validationResult } from 'express-validator'
app.post('/signup', body('email').isEmail(), body('password').isLength({ min: 8 }), (req, res) => {
  const errs = validationResult(req)
  if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() })
  // ...
})`,
    feedback_correct: "✅ body(...).isEmail(), validationResult(req), 400 with errors.",
    feedback_wrong: "Validate body; validationResult or Zod; return 400 with error list.",
    expected: "Validation middleware",
  },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "EXP-F05", title: "Validation & sanitisation", shortName: "EXP — VALIDATION" });
