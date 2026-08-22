import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "EXPRESS.JS #3",
      title: "Request & Response",
      body: `req.body/params/query/headers. res.json/send/status/cookie/redirect.`,
      usecase: "Reading input and sending responses correctly.",
    },
  },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Read req.body, params, query, headers", "Use res.json, status, cookie, redirect"] },
  {
    id: "step1", type: "question", phase: "Step 1 of 3",
    paal: "Parse req.body (need express.json()). Return 201 with Location header for POST. Set a cookie and redirect with res.redirect.",
    answer_keywords: ["express.json", "req.body", "res.status", "res.set", "res.cookie", "res.redirect"],
    seed_code: `app.use(express.json())
app.post('/items', (req, res) => {
  const id = create(req.body)
  res.status(201).set('Location', \`/items/\${id}\`).json({ id })
})
res.cookie('name', value, { httpOnly: true })
res.redirect(302, '/')`,
    feedback_correct: "✅ express.json() for body; res.status(201).set('Location', ...); res.cookie; res.redirect.",
    feedback_wrong: "app.use(express.json()); res.status(201) and Location header; res.cookie and res.redirect.",
    expected: "Request/Response API",
  },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "EXP-F03", title: "Request & Response", shortName: "EXP — REQ RES" });
