import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "PYTHON #5", title: "Type hints & mypy", body: `TypeVar, Generic, Protocol, Literal, TypedDict, ParamSpec, overload, runtime checking.`, usecase: "Static and runtime type safety." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["TypeVar and Generic", "Protocol", "TypedDict and Literal"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Write a generic function def first[T](items: list[T]) -> T. Use Protocol for structural typing. Define a TypedDict for a config dict.", answer_keywords: ["TypeVar", "Generic", "Protocol", "TypedDict", "mypy"], seed_code: `def first[T](items: list[T]) -> T: return items[0]
class Drawable(Protocol): def draw(self) -> None: ...
class Config(TypedDict): host: str; port: int`, feedback_correct: "✅ Generic [T]; Protocol for structural; TypedDict for dict shape.", feedback_wrong: "TypeVar/Generic; Protocol; TypedDict for typed dicts.", expected: "Type hints" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "PY-F05", title: "Type hints & mypy", shortName: "PY — TYPING" });
