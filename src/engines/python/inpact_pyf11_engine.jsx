import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "PYTHON #11", title: "Packaging & environments", body: `pyproject.toml, poetry/uv, virtual environments, package publishing.`, usecase: "Reproducible builds and publishing." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["pyproject.toml", "poetry or uv", "Virtual env", "Publish to PyPI"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Define a package in pyproject.toml with [project] name, version, dependencies. Use uv or poetry to create a venv and install. How do you publish to PyPI?", answer_keywords: ["pyproject.toml", "poetry", "uv", "venv", "twine", "PyPI"], seed_code: `[project]\nname = "mypkg"\nversion = "0.1.0"\ndependencies = ["requests>=2.28"]
# uv venv && uv pip install -e .
# twine upload dist/*`, feedback_correct: "✅ pyproject.toml [project]; uv/poetry for env; twine for PyPI.", feedback_wrong: "pyproject.toml; uv or poetry; twine upload for PyPI.", expected: "Packaging" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "PY-F11", title: "Packaging & environments", shortName: "PY — PACKAGING" });
