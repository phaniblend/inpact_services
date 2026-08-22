import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Test useFetch (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #91 (Angular)", title: TITLE, body: "Test components that use HttpClient in Angular: use TestBed and provide HttpClientTestingModule (or provideHttpClientTesting); flush or expectOne to control when the request resolves and assert on the rendered state.", usecase: "Angular HttpClientTestingModule and fakeAsync/flush let you test fetch-based components synchronously." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["TestBed.configureTestingModule({ imports: [HttpClientTestingModule], ... })", "const http = TestBed.inject(HttpTestingController); fixture.detectChanges(); const req = http.expectOne('/api/data'); req.flush({ name: 'Test' }); fixture.detectChanges();", "Assert fixture.nativeElement.textContent to include expected data", "http.verify() to ensure no outstanding requests"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Write a test that configures TestBed with HttpClientTestingModule and the component under test. Inject HttpTestingController. After fixture.detectChanges(), call http.expectOne('/api/data') to get the request.", answer_keywords: ["HttpClientTestingModule", "HttpTestingController", "expectOne"], seed_code: `import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FetchComponent } from './fetch.component';

describe('FetchComponent', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FetchComponent]
    });
    http = TestBed.inject(HttpTestingController);
  });
  it('should fetch data', () => {
    const fixture = TestBed.createComponent(FetchComponent);
    fixture.detectChanges();
    const req = http.expectOne('/api/data');
    expect(req.request.method).toBe('GET');
  });
});`, feedback_correct: "✅ HttpTestingController and expectOne.", feedback_partial: "HttpClientTestingModule.", feedback_wrong: "expectOne", expected: "HttpTestingController and expectOne('/api/data')" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Call req.flush({ title: 'Hello' }) so the observable emits. Then fixture.detectChanges() and expect(fixture.nativeElement.textContent).toContain('Hello').", answer_keywords: ["flush", "detectChanges", "toContain"], seed_code: `it('should show fetched data', () => {
  const fixture = TestBed.createComponent(FetchComponent);
  fixture.detectChanges();
  const req = http.expectOne('/api/data');
  req.flush({ title: 'Hello' });
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('Hello');
});`, feedback_correct: "✅ flush and assert.", feedback_partial: "req.flush.", feedback_wrong: "textContent", expected: "req.flush and expect textContent" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "After each test call http.verify() (in afterEach) to ensure no pending requests. Test error path: req.flush('Error', { status: 404, statusText: 'Not Found' }) and assert error message is shown. Export the test file.", answer_keywords: ["verify", "error", "export"], seed_code: `afterEach(() => http.verify());

it('should show error on fail', () => {
  const fixture = TestBed.createComponent(FetchComponent);
  fixture.detectChanges();
  const req = http.expectOne('/api/data');
  req.flush('Error', { status: 404, statusText: 'Not Found' });
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('Error');
});`, feedback_correct: "✅ Test useFetch (Angular) complete.", feedback_partial: "http.verify.", feedback_wrong: "Export", expected: "http.verify() and error test" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 91, title: TITLE, shortName: "A — TEST FETCH" });
