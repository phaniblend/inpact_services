import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "PYTHON #3", title: "Decorators in depth", body: `functools.wraps, parameterised decorators, class decorators, stacking decorators.`, usecase: "Reusable cross-cutting behaviour." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["functools.wraps", "Parameterised decorators", "Stacking decorators"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Write a @retry(n) decorator that retries a function n times on exception. Use functools.wraps. Stack @retry(3) and @timer.", answer_keywords: ["decorator", "wraps", "functools", "retry", "parameterised"], seed_code: `from functools import wraps
def retry(n):
  def dec(f):
    @wraps(f)
    def inner(*a,**k): ...
    return inner
  return dec`, feedback_correct: "✅ @wraps preserves __name__; parameterised: decorator() returns dec; stacking order matters.", feedback_wrong: "functools.wraps; parameterised decorator returns inner decorator.", expected: "Decorators" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "PY-F03", title: "Decorators", shortName: "PY — DECORATORS" });
