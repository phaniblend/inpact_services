import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "EXPRESS.JS #9",
      title: "Compression & caching",
      body: `compression middleware, ETag, Cache-Control headers, conditional requests.`,
      usecase: "Faster responses and lower bandwidth.",
    },
  },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Use compression middleware", "Set ETag and Cache-Control", "Support If-None-Match"] },
  {
    id: "step1", type: "question", phase: "Step 1 of 3",
    paal: "Enable gzip with compression(). For GET /api/data, set ETag and Cache-Control: public, max-age=60. Return 304 if If-None-Match matches.",
    answer_keywords: ["compression", "etag", "Cache-Control", "304", "If-None-Match"],
    seed_code: `app.use(require('compression')())
const etag = crypto.createHash('md5').update(JSON.stringify(data)).digest('hex')
res.set({ 'ETag': etag, 'Cache-Control': 'public, max-age=60' })
if (req.headers['if-none-match'] === etag) return res.status(304).end()`,
    feedback_correct: "✅ compression(); ETag + Cache-Control; 304 when If-None-Match matches.",
    feedback_wrong: "compression middleware; set ETag and Cache-Control; 304 for matching If-None-Match.",
    expected: "Compression and caching",
  },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "EXP-F09", title: "Compression & caching", shortName: "EXP — CACHE" });
