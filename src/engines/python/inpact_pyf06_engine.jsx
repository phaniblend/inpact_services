import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "PYTHON #6", title: "Dataclasses & Pydantic", body: `@dataclass, field(), frozen, Pydantic BaseModel, validators, model serialisation.`, usecase: "Structured data and validation." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["@dataclass and field()", "Pydantic BaseModel", "Validators and serialisation"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Define a @dataclass with frozen=True. Define a Pydantic model with a validator. Serialise to JSON with model_dump.", answer_keywords: ["dataclass", "frozen", "BaseModel", "validator", "model_dump"], seed_code: `@dataclass(frozen=True)\nclass Point: x: int; y: int
class User(BaseModel): email: EmailStr; @validator('email') ...\nuser.model_dump()`, feedback_correct: "✅ @dataclass(frozen=True); BaseModel with validators; model_dump/model_dump_json.", feedback_wrong: "dataclass frozen; Pydantic BaseModel and validators; model_dump.", expected: "Dataclasses and Pydantic" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "PY-F06", title: "Dataclasses & Pydantic", shortName: "PY — DATACLASS" });
