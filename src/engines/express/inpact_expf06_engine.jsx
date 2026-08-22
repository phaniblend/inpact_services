import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "EXPRESS.JS #6",
      title: "Error handling",
      body: `Centralised error handler, async wrapper (asyncHandler), HTTP error classes, 4xx vs 5xx.`,
      usecase: "Consistent error responses and no unhandled rejections.",
    },
  },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Centralise error handler", "Use asyncHandler for async routes", "Distinguish 4xx vs 5xx"] },
  {
    id: "step1", type: "question", phase: "Step 1 of 3",
    paal: "Write asyncHandler(fn) that catches rejections and calls next(err). Create a central (err, req, res, next) that maps known errors to 4xx and unknown to 500.",
    answer_keywords: ["asyncHandler", "next(err)", "catch", "4xx", "5xx", "error handler"],
    seed_code: `const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
app.use((err, req, res, next) => {
  if (err.statusCode) return res.status(err.statusCode).json({ error: err.message })
  res.status(500).json({ error: 'Internal error' })
})`,
    feedback_correct: "✅ asyncHandler catches and next(err); central handler; 4xx for known, 500 for unknown.",
    feedback_wrong: "Wrap async in catch(next); single error middleware; use statusCode for client errors.",
    expected: "Centralised error handling",
  },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "EXP-F06", title: "Error handling", shortName: "EXP — ERRORS" });
