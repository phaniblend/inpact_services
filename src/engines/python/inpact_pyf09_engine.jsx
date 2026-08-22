import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "PYTHON #9", title: "Testing with pytest", body: `Fixtures, parametrize, monkeypatch, pytest-asyncio, coverage, factory_boy.`, usecase: "Reliable tests and coverage." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Fixtures and parametrize", "monkeypatch", "pytest-asyncio", "Coverage"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Write a fixture that yields a DB session and rolls back after test. Use @pytest.mark.parametrize for two input/expected pairs. Run an async test with pytest-asyncio.", answer_keywords: ["fixture", "yield", "parametrize", "pytest-asyncio", "async"], seed_code: `@pytest.fixture\ndef db(): session = ...; yield session; session.rollback()
@pytest.mark.parametrize("a,b,expected", [(1,2,3), (0,0,0)])
@pytest.mark.asyncio\nasync def test_async(): ...`, feedback_correct: "✅ fixture with yield; parametrize; @pytest.mark.asyncio for async.", feedback_wrong: "Fixtures with yield; parametrize; pytest-asyncio for async tests.", expected: "pytest" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "PY-F09", title: "Testing with pytest", shortName: "PY — PYTEST" });
