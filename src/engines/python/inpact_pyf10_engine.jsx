import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "PYTHON #10", title: "Performance & profiling", body: `cProfile, line_profiler, memory_profiler, multiprocessing vs threading vs asyncio.`, usecase: "Finding and fixing bottlenecks." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["cProfile and line_profiler", "memory_profiler", "When to use multiprocessing vs threading"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Profile a script with cProfile. When would you use multiprocessing instead of threading? What is the GIL?", answer_keywords: ["cProfile", "multiprocessing", "threading", "GIL", "CPU-bound"], seed_code: `python -m cProfile -o out.prof script.py
# multiprocessing: CPU-bound (bypass GIL); threading: I/O-bound
# GIL: one thread runs Python bytecode at a time`, feedback_correct: "✅ cProfile; multiprocessing for CPU-bound (GIL); threading for I/O.", feedback_wrong: "cProfile for profiling; multiprocessing for CPU; GIL limits threading.", expected: "Performance" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "PY-F10", title: "Performance & profiling", shortName: "PY — PERF" });
