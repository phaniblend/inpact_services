import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "NODE.JS #4",
      title: "Child processes — spawn vs exec vs fork",
      body: `spawn — stream-based, no shell by default. exec — buffer output, shell. fork — Node subprocess with IPC.
worker_threads — CPU-bound work offloading, shared memory.`,
      usecase: "CLI wrappers, CPU-heavy tasks, multi-process scaling.",
    },
  },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Choose spawn/exec/fork correctly", "Use IPC for fork", "Offload CPU-bound work with worker_threads"] },
  {
    id: "step1", type: "question", phase: "Step 1 of 3",
    paal: "Spawn a child process (e.g. run a shell command) and capture stdout/stderr. When would you use fork instead of spawn?",
    answer_keywords: ["spawn", "exec", "fork", "child_process", "stdout", "stderr", "IPC"],
    seed_code: `const { spawn } = require('child_process')
// spawn('cmd', ['args']).stdout.on('data', ...)
// fork = spawn + IPC for Node scripts`,
    feedback_correct: "✅ spawn for streaming, fork for Node + IPC. worker_threads for CPU-bound.",
    feedback_wrong: "child_process.spawn or .fork; fork when you need IPC.",
    expected: "spawn vs fork",
  },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "NODE-F04", title: "Child processes", shortName: "NODE — CHILD" });
