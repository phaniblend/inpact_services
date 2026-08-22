import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Error Boundary (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #59 (Angular)", title: TITLE, body: "Catch errors in child components and show a fallback UI using Angular's ErrorHandler or a wrapper that uses ViewContainerRef and catches errors in the child's lifecycle; for template errors use *ngIf and try/catch in effect.", usecase: "Angular provides ErrorHandler and custom strategies to catch errors and show fallback UI like React error boundaries." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Implement custom ErrorHandler: handleError(error) { log; show fallback state }", "Or create a wrapper component that uses *ngIf and catches by not letting child throw into parent", "Use runInInjectionContext and effect with try/catch to set hasError signal", "provide ErrorHandler in app config for global handler"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a custom ErrorHandler class that extends ErrorHandler and overrides handleError(error): log the error and optionally set a global error signal. Provide it: provide(ErrorHandler, { useClass: MyErrorHandler }).", answer_keywords: ["ErrorHandler", "handleError", "provide"], seed_code: `import { ErrorHandler, inject } from '@angular/core';

export class MyErrorHandler extends ErrorHandler {
  override handleError(error: unknown) {
    console.error('Caught:', error);
    super.handleError(error);
  }
}`, feedback_correct: "✅ Custom ErrorHandler.", feedback_partial: "handleError.", feedback_wrong: "ErrorHandler", expected: "extends ErrorHandler and handleError" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Create ErrorBoundaryComponent with hasError = signal(false). Use ng-content to project a child. In ngOnInit or afterViewInit wrap child render in try/catch or use a directive that listens to errors; on error set hasError.set(true).", answer_keywords: ["hasError", "signal", "ng-content"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-boundary',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <ng-container *ngIf="!hasError(); else err"> <ng-content></ng-content> </ng-container>
    <ng-template #err><p>Something went wrong.</p></ng-template>
  \`,
})
export class ErrorBoundaryComponent {
  hasError = signal(false);
  setError() { this.hasError.set(true); }
}`, feedback_correct: "✅ Fallback UI.", feedback_partial: "hasError.", feedback_wrong: "hasError", expected: "hasError signal and *ngIf fallback" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Provide the custom ErrorHandler in app config. In the handler inject a service that sets a global error signal so ErrorBoundaryComponent can show it. Export ErrorBoundaryComponent and MyErrorHandler.", answer_keywords: ["provide", "ErrorHandler", "export"], seed_code: `import { ErrorHandler, provideZoneChangeDetection } from '@angular/core';

export const appConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    { provide: ErrorHandler, useClass: MyErrorHandler }
  ]
};`, feedback_correct: "✅ Error Boundary (Angular) complete.", feedback_partial: "provide ErrorHandler.", feedback_wrong: "Export", expected: "provide ErrorHandler and export" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 59, title: TITLE, shortName: "A — ERROR BOUNDARY" });
