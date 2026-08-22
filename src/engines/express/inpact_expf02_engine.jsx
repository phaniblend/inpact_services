import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "EXPRESS.JS #2",
      title: "Routing — Router(), route grouping, param middleware",
      body: `Router(), route grouping, param middleware (router.param), route-level vs app-level middleware.`,
      usecase: "Structuring large APIs and reusing param logic.",
    },
  },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Use express.Router()", "Group routes and mount", "Use param middleware"] },
  {
    id: "step1", type: "question", phase: "Step 1 of 3",
    paal: "Create a Router for /api/users, add GET / and GET /:id. Use router.param('id', ...) to load a user and attach to req.",
    answer_keywords: ["Router", "router.get", "param", "req.user", "router.param"],
    seed_code: `const router = express.Router()
router.param('id', (req, res, next, id) => { /* load user */ req.user = user; next() })
router.get('/:id', (req, res) => res.json(req.user))
app.use('/api/users', router)`,
    feedback_correct: "✅ express.Router(); router.param('id', ...); mount with app.use('/api/users', router).",
    feedback_wrong: "Router(); router.param to attach resource to req; app.use(path, router).",
    expected: "Router and param",
  },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "EXP-F02", title: "Routing", shortName: "EXP — ROUTING" });
