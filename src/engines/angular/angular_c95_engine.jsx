import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Test Error Boundary (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #95 (Angular)", title: TITLE, body: "Test error handling and error boundary behavior in Angular: trigger an error (e.g. throw in child or mock a failing request), then assert the boundary shows fallback UI or that ErrorHandler was called; use flush with error or throw in a child component.", usecase: "Angular tests can trigger errors and assert fallback UI or ErrorHandler." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Mock child to throw: override component with a stub that throws in ngOnInit", "Or provide a failing HTTP: req.flush('error', { status: 500 }) and assert error message", "Assert boundary template: expect(fixture.nativeElement.textContent).toContain('Something went wrong')", "Spy on ErrorHandler and expect handleError to have been called"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Write a test for a component that shows an error message when a child throws. Use a stub child that throws in ngOnInit; render the parent with the stub; expect the parent to show fallback content.", answer_keywords: ["throw", "stub", "fallback"], seed_code: `import { TestBed } from '@angular/core/testing';

it('should show fallback when child errors', () => {
  TestBed.overrideComponent(ChildComponent, { set: { template: '' } });
  // Or use a component that throws in ngOnInit
  const fixture = TestBed.createComponent(ErrorBoundaryComponent);
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('Something went wrong');
});`, feedback_correct: "✅ Test error fallback.", feedback_partial: "overrideComponent.", feedback_wrong: "fallback", expected: "Trigger error and assert fallback" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Test HTTP error: in a component that fetches, use req.flush('error', { status: 500, statusText: 'Server Error' }). detectChanges and assert error message is displayed.", answer_keywords: ["flush", "status", "500"], seed_code: `it('should show error on HTTP fail', () => {
  const fixture = TestBed.createComponent(FetchComponent);
  fixture.detectChanges();
  const req = http.expectOne('/api/data');
  req.flush('Error', { status: 500, statusText: 'Server Error' });
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('Error');
});`, feedback_correct: "✅ HTTP error test.", feedback_partial: "req.flush error.", feedback_wrong: "500", expected: "flush with status 500 and assert" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Spy on ErrorHandler: const errorHandler = jasmine.createSpyObj('ErrorHandler', ['handleError']); provide it; trigger an error; expect(errorHandler.handleError).toHaveBeenCalled(). Export the spec.", answer_keywords: ["ErrorHandler", "handleError", "export"], seed_code: `const errorHandler = jasmine.createSpyObj('ErrorHandler', ['handleError']);
TestBed.configureTestingModule({
  providers: [{ provide: ErrorHandler, useValue: errorHandler }]
});
// After triggering error:
expect(errorHandler.handleError).toHaveBeenCalled();`, feedback_correct: "✅ Test Error Boundary (Angular) complete.", feedback_partial: "ErrorHandler spy.", feedback_wrong: "Export", expected: "Spy on ErrorHandler.handleError" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 95, title: TITLE, shortName: "A — TEST ERROR BOUNDARY" });
