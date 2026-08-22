import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "EXPRESS.JS #10",
      title: "Testing Express apps",
      body: `supertest, mocking middleware, integration vs unit tests, test database setup.`,
      usecase: "Confident refactors and regression prevention.",
    },
  },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Use supertest for HTTP tests", "Mock middleware or DB", "Run integration tests"] },
  {
    id: "step1", type: "question", phase: "Step 1 of 3",
    paal: "Write a test with supertest: GET /api/health returns 200 and { status: 'ok' }. Use a test app or in-memory DB.",
    answer_keywords: ["supertest", "request", "get", "expect", "200", "app"],
    seed_code: `const request = require('supertest')
const app = require('../app')
describe('GET /api/health', () => {
  it('returns 200 and status ok', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })
})`,
    feedback_correct: "✅ request(app).get(...); expect status and body.",
    feedback_wrong: "supertest: request(app).get(path); assert res.status and res.body.",
    expected: "Supertest example",
  },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "EXP-F10", title: "Testing Express", shortName: "EXP — TESTING" });
