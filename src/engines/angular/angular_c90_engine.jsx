import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Memory Leak Hunt (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #90 (Angular)", title: TITLE, body: "Prevent and find memory leaks in Angular: unsubscribe from Observables (use takeUntilDestroyed(this.destroyRef)), remove event listeners in ngOnDestroy, avoid holding references to DOM or components after destroy; use weak references or cleanup in DestroyRef.", usecase: "Angular takeUntilDestroyed, DestroyRef.onDestroy, and ngOnDestroy prevent subscription and listener leaks." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Observables: .pipe(takeUntilDestroyed(this.destroyRef)) so subscription ends on destroy", "addEventListener: store handler and in ngOnDestroy removeEventListener", "DestroyRef.onDestroy(() => { cleanup }) for injectable cleanup", "Avoid closing over component in long-lived callbacks"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component that subscribes to an Observable (e.g. interval(1000)). Use pipe(takeUntilDestroyed(inject(DestroyRef))) so the subscription is cleaned up when the component is destroyed.", answer_keywords: ["takeUntilDestroyed", "DestroyRef", "subscribe"], seed_code: `import { Component, inject, DestroyRef } from '@angular/core';
import { interval } from 'rxjs';
import { takeUntilDestroyed } from 'rxjs/operators';

@Component({
  selector: 'app-leak-hunt',
  standalone: true,
  template: \`<p>Running</p>\`,
})
export class MemoryLeakHuntComponent {
  private destroyRef = inject(DestroyRef);
  constructor() {
    interval(1000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }
}`, feedback_correct: "✅ takeUntilDestroyed.", feedback_partial: "DestroyRef.", feedback_wrong: "takeUntilDestroyed", expected: "pipe(takeUntilDestroyed(destroyRef))" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add window.addEventListener('resize', this.handler) in ngOnInit and window.removeEventListener('resize', this.handler) in ngOnDestroy. Store the handler as a class property so the same reference is removed.", answer_keywords: ["addEventListener", "removeEventListener", "ngOnDestroy"], seed_code: `import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-leak-hunt',
  standalone: true,
  template: \`<p>Resize listener</p>\`,
})
export class MemoryLeakHuntComponent implements OnInit, OnDestroy {
  private handler = () => {};
  ngOnInit() { window.addEventListener('resize', this.handler); }
  ngOnDestroy() { window.removeEventListener('resize', this.handler); }
}`, feedback_correct: "✅ Listener cleanup.", feedback_partial: "removeEventListener.", feedback_wrong: "ngOnDestroy", expected: "addEventListener in ngOnInit and removeEventListener in ngOnDestroy" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Use DestroyRef.onDestroy(() => { window.removeEventListener('resize', this.handler); }) instead of ngOnDestroy so cleanup is registered injectably. Export the component.", answer_keywords: ["onDestroy", "DestroyRef", "export"], seed_code: `import { Component, inject, DestroyRef } from '@angular/core';

@Component({
  selector: 'app-leak-hunt',
  standalone: true,
  template: \`<p>Resize</p>\`,
})
export class MemoryLeakHuntComponent {
  private destroyRef = inject(DestroyRef);
  private handler = () => {};
  constructor() {
    window.addEventListener('resize', this.handler);
    this.destroyRef.onDestroy(() => window.removeEventListener('resize', this.handler));
  }
}`, feedback_correct: "✅ Memory Leak Hunt (Angular) complete.", feedback_partial: "onDestroy.", feedback_wrong: "Export", expected: "DestroyRef.onDestroy for cleanup" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 90, title: TITLE, shortName: "A — MEMORY LEAK" });
