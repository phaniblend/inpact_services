import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "EXPRESS.JS #12",
      title: "Express performance",
      body: `Connection pooling, keep-alive, response streaming, avoiding blocking operations.`,
      usecase: "High throughput and low latency at scale.",
    },
  },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Use connection pooling for DB", "Enable keep-alive", "Stream responses where possible", "Avoid blocking the event loop"] },
  {
    id: "step1", type: "question", phase: "Step 1 of 3",
    paal: "List three ways to improve Express performance: DB connection pooling, HTTP keep-alive, and streaming large responses. Why avoid CPU-heavy work in request handlers?",
    answer_keywords: ["pool", "keep-alive", "stream", "blocking", "event loop", "async"],
    seed_code: `// 1. DB: use connection pool (pg.Pool, mongoose connection pool)
// 2. keep-alive: default in Node http; reuse TCP connections
// 3. res.write() chunked or stream.pipe(res) for large payloads
// Blocking: blocks event loop, stalls all requests → use worker_threads or queue`,
    feedback_correct: "✅ Pool connections; keep-alive; stream/pipe. Blocking stalls event loop.",
    feedback_wrong: "Connection pool, keep-alive, streaming; avoid sync/CPU work in handlers.",
    expected: "Express performance",
  },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "EXP-F12", title: "Express performance", shortName: "EXP — PERF" });
