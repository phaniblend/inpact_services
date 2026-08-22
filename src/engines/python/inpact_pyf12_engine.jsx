import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "PYTHON #12", title: "Python security", body: `SQL injection prevention, secrets module, environment management, dependency auditing.`, usecase: "Secure Python apps." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Parameterised queries", "secrets module", "Env for secrets", "pip audit"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Why never format SQL with f-strings? Use secrets.token_hex for a secure token. How do you audit dependencies for known vulnerabilities?", answer_keywords: ["parameterised", "injection", "secrets", "token_hex", "pip audit", "audit"], seed_code: `# NEVER: f"SELECT * FROM users WHERE id = {id}"
# ALWAYS: cursor.execute("SELECT ... WHERE id = %s", (id,))
secrets.token_hex(32)
pip audit  # or uv pip audit`, feedback_correct: "✅ Parameterised queries only; secrets for tokens; pip audit for CVEs.", feedback_wrong: "Use parameterised queries; secrets module; pip audit.", expected: "Python security" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "PY-F12", title: "Python security", shortName: "PY — SECURITY" });
