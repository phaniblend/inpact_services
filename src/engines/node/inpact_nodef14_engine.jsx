import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "NODE.JS #14",
      title: "Performance & profiling",
      body: `--inspect flag, clinic.js. Memory profiling, CPU profiling, flame graphs.`,
      usecase: "Finding bottlenecks before optimising.",
    },
  },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Use --inspect and DevTools", "Profile memory and CPU", "Read flame graphs"] },
  {
    id: "step1", type: "question", phase: "Step 1 of 3",
    paal: "Run Node with --inspect. What does clinic.js provide? How do you capture a CPU flame graph?",
    answer_keywords: ["inspect", "clinic", "flame", "profiling", "cpu", "memory"],
    seed_code: `node --inspect server.js   // Chrome devtools -> node icon
// clinic doctor / flame / bubbleprof
// node --prof + --prof-process for CPU`,
    feedback_correct: "✅ --inspect for DevTools; clinic.js for doctor/flame/bubbleprof; --prof for CPU.",
    feedback_wrong: "node --inspect; clinic.js for diagnostics; flame graph from --prof or clinic flame.",
    expected: "Profiling tools",
  },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "NODE-F14", title: "Performance & profiling", shortName: "NODE — PROFILING" });
