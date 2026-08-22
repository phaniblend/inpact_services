import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "NODE.JS #7",
      title: "HTTP from scratch",
      body: `http.createServer, req/res lifecycle. Chunked transfer, keep-alive. Raw HTTP without Express.`,
      usecase: "Understanding what Express wraps; lightweight servers, proxies.",
    },
  },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Use http.createServer", "Handle req/res lifecycle", "Chunked transfer and keep-alive"] },
  {
    id: "step1", type: "question", phase: "Step 1 of 3",
    paal: "Create an HTTP server with http.createServer that returns 200 JSON for GET /health and 404 for other routes.",
    answer_keywords: ["createServer", "req.url", "res.writeHead", "res.end", "JSON.stringify"],
    seed_code: `const http = require('http')
http.createServer((req, res) => {
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok: true }))
  } else {
    res.writeHead(404); res.end()
  }
}).listen(3000)`,
    feedback_correct: "✅ createServer, req.url/method, res.writeHead, res.end.",
    feedback_wrong: "http.createServer((req,res)=>...).listen(port). Check req.url and set headers.",
    expected: "Raw HTTP server",
  },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "NODE-F07", title: "HTTP from scratch", shortName: "NODE — HTTP" });
