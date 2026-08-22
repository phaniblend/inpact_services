import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "PYTHON #1", title: "Python data model", body: `Dunder methods, __repr__/__str__, __len__/__getitem__, context managers (__enter__/__exit__).`, usecase: "Making objects behave like built-ins." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["__repr__ and __str__", "__len__, __getitem__", "Context manager __enter__/__exit__"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Implement __repr__ and __str__ for a class. Implement __len__ and __getitem__ to make it sequence-like. Write a context manager with __enter__ and __exit__.", answer_keywords: ["__repr__", "__str__", "__len__", "__getitem__", "__enter__", "__exit__", "contextlib"], seed_code: `def __repr__(self): return f'Foo({self.x})'
def __enter__(self): ...; return self
def __exit__(self, *exc): ...; return False
# or @contextmanager`, feedback_correct: "✅ __repr__ for dev, __str__ for user; __len__/__getitem__; __enter__/__exit__ or contextlib.", feedback_wrong: "Dunder methods; context manager with __enter__/__exit__.", expected: "Data model" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "PY-F01", title: "Python data model", shortName: "PY — DATA MODEL" });
