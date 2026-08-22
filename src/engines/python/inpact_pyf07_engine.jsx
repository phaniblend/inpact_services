import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "PYTHON #7", title: "FastAPI", body: `Path/query/body params, dependency injection, background tasks, middleware, WebSockets, OpenAPI.`, usecase: "Modern async API framework." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Path, query, body params", "Depends() injection", "Background tasks and WebSockets"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Define a GET with path param and query param. Use Depends() for a shared DB session. Add a background task to send an email after response.", answer_keywords: ["FastAPI", "Path", "Query", "Depends", "BackgroundTasks"], seed_code: `@app.get("/items/{id}")\ndef get(id: int, q: str = Query(None), db: Session = Depends(get_db)): ...
def post(bt: BackgroundTasks): bt.add_task(send_email, ...)`, feedback_correct: "✅ Path/Query; Depends(get_db); BackgroundTasks.add_task.", feedback_wrong: "Path and Query; Depends for DI; BackgroundTasks for fire-and-forget.", expected: "FastAPI" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "PY-F07", title: "FastAPI", shortName: "PY — FASTAPI" });
