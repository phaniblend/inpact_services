import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "PYTHON #2", title: "Generators & itertools", body: `yield, yield from, generator expressions, itertools (chain, groupby, islice, product).`, usecase: "Lazy iteration and memory efficiency." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["yield and yield from", "Generator expressions", "itertools"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Write a generator that yields squares. Use yield from to delegate to another generator. Use itertools.chain to combine two iterables.", answer_keywords: ["yield", "yield from", "itertools", "chain", "generator"], seed_code: `def squares(n): yield from (i*i for i in range(n))
from itertools import chain; list(chain([1,2], [3,4]))  # [1,2,3,4]`, feedback_correct: "✅ yield; yield from; itertools.chain, groupby, islice.", feedback_wrong: "Generators with yield; yield from; itertools for lazy combinators.", expected: "Generators" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "PY-F02", title: "Generators & itertools", shortName: "PY — GENERATORS" });
