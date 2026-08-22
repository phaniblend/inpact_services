import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "PYTHON #8", title: "SQLAlchemy & Alembic", body: `ORM vs Core, session management, relationships, lazy vs eager loading, migrations.`, usecase: "Relational DB in Python." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["ORM models and session", "Relationships", "Lazy vs eager", "Alembic migrations"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Define a User model with a relationship to Post. Use selectinload to avoid N+1 when loading users with posts. Create an Alembic revision.", answer_keywords: ["SQLAlchemy", "relationship", "selectinload", "session", "Alembic"], seed_code: `class User(Base): posts = relationship("Post", back_populates="user")
stmt = select(User).options(selectinload(User.posts))
# alembic revision --autogenerate -m "add users"`, feedback_correct: "✅ relationship; selectinload for eager; Alembic revision.", feedback_wrong: "Relationships; selectinload to fix N+1; Alembic for migrations.", expected: "SQLAlchemy" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "PY-F08", title: "SQLAlchemy & Alembic", shortName: "PY — SQLALCHEMY" });
