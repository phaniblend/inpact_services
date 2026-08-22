import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "PYTHON #4", title: "Async Python", body: `asyncio event loop, async/await, asyncio.gather/create_task, aiohttp, async context managers.`, usecase: "I/O-bound concurrency." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["async/await", "asyncio.gather, create_task", "Async context managers"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Write an async function that fetches two URLs concurrently with asyncio.gather. Use create_task for fire-and-forget. What is the difference between gather and create_task?", answer_keywords: ["async", "await", "gather", "create_task", "aiohttp"], seed_code: `async def fetch_all():
  return await asyncio.gather(fetch(url1), fetch(url2))
# create_task: schedule, don't wait; gather: wait all`, feedback_correct: "✅ asyncio.gather for concurrent await; create_task to schedule without awaiting.", feedback_wrong: "asyncio.gather for parallel; create_task for background tasks.", expected: "Async Python" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "PY-F04", title: "Async Python", shortName: "PY — ASYNC" });
