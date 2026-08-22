import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "NODE.JS #11",
      title: "Error handling patterns",
      body: `Domain-specific errors (custom classes). Async error propagation. uncaughtException vs unhandledRejection.`,
      usecase: "Stable production behaviour when things go wrong.",
    },
  },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Create custom Error classes", "Propagate errors in async", "Handle uncaughtException and unhandledRejection"] },
  {
    id: "step1", type: "question", phase: "Step 1 of 3",
    paal: "Define a custom ValidationError extending Error. In an async route, catch and pass to next(err). What is the difference between uncaughtException and unhandledRejection?",
    answer_keywords: ["class", "extends Error", "next(err)", "uncaughtException", "unhandledRejection", "async"],
    seed_code: `class ValidationError extends Error {
  constructor(msg) { super(msg); this.name = 'ValidationError' }
}
// uncaughtException: sync throw; unhandledRejection: promise reject not caught`,
    feedback_correct: "✅ Custom Error class; next(err); uncaughtException = sync, unhandledRejection = promise.",
    feedback_wrong: "Extend Error for custom errors; use next(err) in Express; handle both process handlers.",
    expected: "Error handling",
  },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "NODE-F11", title: "Error handling", shortName: "NODE — ERRORS" });
