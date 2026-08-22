import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Test Async Component (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #92 (Angular)", title: TITLE, body: "Test components with async behavior in Angular: use fakeAsync and tick() to advance time, or waitForAsync (async/await) and fixture.whenStable(); for Observables use done or return Promise; trigger change detection after async updates.", usecase: "Angular fakeAsync, tick, and fixture.whenStable() test async components reliably." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["fakeAsync(() => { ... tick(1000); fixture.detectChanges(); expect(...).toContain('Done'); })", "Or async/await: fixture.whenStable() after triggering async action", "For Observables: flush or trigger subscribe in test; then fixture.detectChanges()", "Test loading state: assert before flush; assert result after flush"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Write a test with fakeAsync. Inside it create the component, call a method that uses setTimeout(..., 100), then tick(100), fixture.detectChanges(), and assert the result.", answer_keywords: ["fakeAsync", "tick", "detectChanges"], seed_code: `import { TestBed } from '@angular/core/testing';
import { fakeAsync, tick } from '@angular/core/testing';

it('should update after delay', fakeAsync(() => {
  const fixture = TestBed.createComponent(AsyncComponent);
  fixture.detectChanges();
  fixture.componentInstance.load();
  tick(100);
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('Loaded');
}));`, feedback_correct: "✅ fakeAsync and tick.", feedback_partial: "tick(100).", feedback_wrong: "fakeAsync", expected: "fakeAsync, tick(100), detectChanges" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Use fixture.whenStable() with async/await: await fixture.whenStable(); then assert. So Promises and microtasks are flushed.", answer_keywords: ["whenStable", "async", "await"], seed_code: `it('should show when stable', async () => {
  const fixture = TestBed.createComponent(AsyncComponent);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('Done');
});`, feedback_correct: "✅ whenStable.", feedback_partial: "await whenStable.", feedback_wrong: "whenStable", expected: "await fixture.whenStable()" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Test loading then loaded: before resolving the Observable assert 'Loading' is shown; after req.flush and detectChanges assert content is shown. Export the spec.", answer_keywords: ["Loading", "flush", "export"], seed_code: `it('should show loading then data', fakeAsync(() => {
  const fixture = TestBed.createComponent(AsyncComponent);
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('Loading');
  const req = http.expectOne('/api/data');
  req.flush({ data: 'OK' });
  tick();
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('OK');
}));`, feedback_correct: "✅ Test Async Component (Angular) complete.", feedback_partial: "Loading then OK.", feedback_wrong: "Export", expected: "Assert loading state then data after flush" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 92, title: TITLE, shortName: "A — TEST ASYNC" });
