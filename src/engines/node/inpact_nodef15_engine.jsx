import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "NODE.JS #15",
      title: "Production Node.js",
      body: `Graceful shutdown. Health checks. Signal handling (SIGTERM/SIGINT). PM2, process managers.`,
      usecase: "Zero-downtime deploys and clean shutdowns.",
    },
  },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Implement graceful shutdown", "Handle SIGTERM/SIGINT", "Add health check endpoint", "Use PM2 or similar"] },
  {
    id: "step1", type: "question", phase: "Step 1 of 3",
    paal: "Implement graceful shutdown: on SIGTERM, stop accepting new connections, finish in-flight requests, then process.exit(0).",
    answer_keywords: ["SIGTERM", "graceful", "server.close", "shutdown", "process.on"],
    seed_code: `let server = http.createServer(...).listen(PORT)
function shutdown() {
  server.close(() => process.exit(0))
}
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)`,
    feedback_correct: "✅ server.close() stops new connections; wait for in-flight; then exit. SIGTERM/SIGINT.",
    feedback_wrong: "Listen for SIGTERM/SIGINT; server.close() then process.exit(0) after drain.",
    expected: "Graceful shutdown",
  },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "NODE-F15", title: "Production Node.js", shortName: "NODE — PROD" });
