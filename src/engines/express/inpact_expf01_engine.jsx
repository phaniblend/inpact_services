import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "EXPRESS.JS #1",
      title: "App setup & middleware chain",
      body: `app.use(), middleware order, next(). Error middleware signature (err, req, res, next).`,
      usecase: "Every Express app: ordering and error handling.",
    },
  },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Use app.use() and order correctly", "Call next() and next(err)", "Define error middleware (err, req, res, next)"] },
  {
    id: "step1", type: "question", phase: "Step 1 of 3",
    paal: "Add a logging middleware that runs for all routes and calls next(). Add an error-handling middleware with (err, req, res, next) that returns 500 JSON.",
    answer_keywords: ["app.use", "next", "err", "res.status", "500", "middleware"],
    seed_code: `app.use((req, res, next) => { console.log(req.method, req.url); next() })
app.use((err, req, res, next) => { res.status(500).json({ error: err.message }) })`,
    feedback_correct: "✅ app.use order; next(); error middleware has 4 args (err first).",
    feedback_wrong: "app.use(middleware); next(); error handler (err, req, res, next) must be last.",
    expected: "Middleware and error handler",
  },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "EXP-F01", title: "App setup & middleware", shortName: "EXP — MIDDLEWARE" });
