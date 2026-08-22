import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Test User Interactions (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #93 (Angular)", title: TITLE, body: "Test user interactions in Angular: use fixture.debugElement.query(By.css('button')).nativeElement and dispatch click events, or use Angular Testing Library patterns; trigger input changes and assert updated DOM.", usecase: "Angular DebugElement, By.css, and nativeElement.dispatchEvent test clicks and input." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["const btn = fixture.debugElement.query(By.css('button')); btn.nativeElement.click(); fixture.detectChanges()", "Input: const input = fixture.debugElement.query(By.css('input')); input.nativeElement.value = 'x'; input.nativeElement.dispatchEvent(new Event('input'))", "Assert: expect(fixture.nativeElement.textContent).toContain('...') after interaction", "Use By.directive(MyDirective) to query by directive"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Write a test that gets a button with fixture.debugElement.query(By.css('button')), calls .nativeElement.click(), then fixture.detectChanges(), and asserts the DOM updated (e.g. count increased).", answer_keywords: ["debugElement", "query", "click"], seed_code: `import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

it('should increment on button click', () => {
  const fixture = TestBed.createComponent(CounterComponent);
  fixture.detectChanges();
  const btn = fixture.debugElement.query(By.css('button'));
  btn.nativeElement.click();
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('1');
});`, feedback_correct: "✅ query and click.", feedback_partial: "By.css.", feedback_wrong: "nativeElement.click", expected: "debugElement.query(By.css('button')).nativeElement.click()" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Test input: query the input, set nativeElement.value = 'test', dispatchEvent(new Event('input')), detectChanges(), and assert the component state or template reflects the value.", answer_keywords: ["input", "dispatchEvent", "value"], seed_code: `it('should update on input', () => {
  const fixture = TestBed.createComponent(SearchComponent);
  fixture.detectChanges();
  const input = fixture.debugElement.query(By.css('input'));
  input.nativeElement.value = 'test';
  input.nativeElement.dispatchEvent(new Event('input'));
  fixture.detectChanges();
  expect(fixture.componentInstance.query()).toBe('test');
});`, feedback_correct: "✅ Input dispatchEvent.", feedback_partial: "dispatchEvent.", feedback_wrong: "input", expected: "nativeElement.value and dispatchEvent('input')" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Test multiple clicks and verify final state. Use fixture.debugElement.queryAll(By.css('button')) if needed. Export the spec.", answer_keywords: ["queryAll", "multiple", "export"], seed_code: `it('should handle multiple clicks', () => {
  const fixture = TestBed.createComponent(CounterComponent);
  fixture.detectChanges();
  const btn = fixture.debugElement.query(By.css('button'));
  btn.nativeElement.click();
  btn.nativeElement.click();
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('2');
});`, feedback_correct: "✅ Test User Interactions (Angular) complete.", feedback_partial: "multiple clicks.", feedback_wrong: "Export", expected: "Multiple interactions and assert" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 93, title: TITLE, shortName: "A — TEST INTERACTIONS" });
