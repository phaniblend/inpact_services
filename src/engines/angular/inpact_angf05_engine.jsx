import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "ANGULAR #5", title: "HTTP client", body: `HttpClient, interceptors, retry logic, error handling, typed responses.`, usecase: "API calls with interceptors." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Use HttpClient", "Add interceptors", "Retry and error handling", "Typed responses"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Inject HttpClient and get JSON with typed response. Add an interceptor that attaches an auth header.", answer_keywords: ["HttpClient", "get", "interceptor", "pipe", "tap", "catchError"], seed_code: `this.http.get<User[]>('/api/users').pipe(
  retry(2), catchError(err => of([]))
)
// HTTP_INTERCEPTORS multi-provider`, feedback_correct: "✅ http.get<T>(); interceptors via HTTP_INTERCEPTORS; retry/catchError.", feedback_wrong: "HttpClient.get; provide interceptors; pipe retry and catchError.", expected: "HttpClient" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "ANG-F05", title: "HTTP client", shortName: "ANG — HTTP" });
