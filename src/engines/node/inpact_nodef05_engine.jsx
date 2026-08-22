import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "NODE.JS #5",
      title: "Cluster module — multi-core scaling",
      body: `Master/worker — one process per CPU. Shared ports — all workers listen same port.
Graceful restart — zero-downtime reload.`,
      usecase: "Maximising CPU use on a single machine before going horizontal.",
    },
  },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Use cluster.fork() for workers", "Share a single port across workers", "Handle graceful restart"] },
  {
    id: "step1", type: "question", phase: "Step 1 of 3",
    paal: "Write the basic cluster pattern: master forks workers (CPU count), workers create HTTP server on same port.",
    answer_keywords: ["cluster", "fork", "isMaster", "workers", "listen", "port"],
    seed_code: `const cluster = require('cluster')
const numCPUs = require('os').cpus().length
// if (cluster.isPrimary) { for (let i = 0; i < numCPUs; i++) cluster.fork() }
// else { http.createServer(...).listen(PORT) }`,
    feedback_correct: "✅ cluster.isPrimary + cluster.fork(); in worker, createServer().listen(port).",
    feedback_wrong: "cluster.fork() in primary; workers call listen() on same port.",
    expected: "Cluster master/worker",
  },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "NODE-F05", title: "Cluster module", shortName: "NODE — CLUSTER" });
