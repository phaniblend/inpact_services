import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Test Context (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #94 (Angular)", title: TITLE, body: "Test components that inject a context service (e.g. ThemeService, AuthService) in Angular: override the provider in TestBed with a stub or mock so the component gets a controllable context; assert behavior for different context values.", usecase: "Angular TestBed overrideProvider or custom mock services test context-dependent components." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["TestBed.configureTestingModule({ providers: [{ provide: ThemeService, useValue: { theme: signal('dark') } }] })", "Or create a spy: const themeService = jasmine.createSpyObj('ThemeService', ['getTheme']); themeService.getTheme.and.returnValue('dark');", "Assert component shows dark UI when theme is dark", "Test both branches: provide light and dark and assert each"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a mock ThemeService: const mockTheme = { theme: signal('light'), setTheme: jasmine.createSpy() }. Provide it: TestBed.configureTestingModule({ providers: [{ provide: ThemeService, useValue: mockTheme }], imports: [ConsumerComponent] }).", answer_keywords: ["useValue", "mock", "ThemeService"], seed_code: `import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ThemeService } from './theme.service';
import { ConsumerComponent } from './consumer.component';

const mockTheme = {
  theme: signal('light'),
  setTheme: jasmine.createSpy('setTheme')
};

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [{ provide: ThemeService, useValue: mockTheme }],
    imports: [ConsumerComponent]
  });
});`, feedback_correct: "✅ Mock provider.", feedback_partial: "useValue.", feedback_wrong: "ThemeService", expected: "provide ThemeService, useValue: mockTheme" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "In the test create the component and detectChanges. Assert that when mockTheme.theme is 'light' the template contains expected text. Then change mock to theme: signal('dark'), detectChanges, and assert dark UI.", answer_keywords: ["detectChanges", "theme", "assert"], seed_code: `it('should show light theme', () => {
  const fixture = TestBed.createComponent(ConsumerComponent);
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('Light');
});

it('should show dark theme', () => {
  (TestBed.inject(ThemeService) as any).theme = signal('dark');
  const fixture = TestBed.createComponent(ConsumerComponent);
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('Dark');
});`, feedback_correct: "✅ Assert per theme.", feedback_partial: "theme.", feedback_wrong: "Light", expected: "Assert for light and dark context" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Verify that when user clicks a toggle the mock setTheme was called: get the service with TestBed.inject(ThemeService), trigger click, expect(mockTheme.setTheme).toHaveBeenCalledWith('dark'). Export the spec.", answer_keywords: ["toHaveBeenCalledWith", "inject", "export"], seed_code: `it('should call setTheme on toggle', () => {
  const fixture = TestBed.createComponent(ConsumerComponent);
  fixture.detectChanges();
  fixture.debugElement.query(By.css('button')).nativeElement.click();
  fixture.detectChanges();
  expect(mockTheme.setTheme).toHaveBeenCalled();
});`, feedback_correct: "✅ Test Context (Angular) complete.", feedback_partial: "toHaveBeenCalled.", feedback_wrong: "Export", expected: "Assert setTheme was called" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 94, title: TITLE, shortName: "A — TEST CONTEXT" });
