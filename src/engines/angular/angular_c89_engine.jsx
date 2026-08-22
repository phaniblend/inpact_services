import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Concurrent Mode Gotchas (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #89 (Angular)", title: TITLE, body: "Avoid pitfalls when using deferred or async updates in Angular: effects run asynchronously; avoid reading DOM in effect without afterNextRender; use runOutsideAngular for non-Angular tasks; and be aware of change detection timing with signals.", usecase: "Angular effects and change detection have timing rules; understand when views update and when to use afterNextRender or runOutsideAngular." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["effect() runs after change detection; don't assume DOM is updated inside effect", "For DOM read after paint use afterNextRender()", "Heavy or non-Angular work: inject NgZone and runOutsideAngular(() => { ... })", "Signals trigger CD when read in template; avoid writing to signals in effect that other effects read (circular)"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with count = signal(0) and an effect that does count(). If you update count inside the effect based on something else, avoid infinite loops: don't update the same signal you read without a guard.", answer_keywords: ["effect", "signal", "guard"], seed_code: `import { Component, signal, effect } from '@angular/core';

@Component({
  selector: 'app-concurrent-gotchas',
  standalone: true,
  template: \`<p>{{ count() }}</p>\`,
})
export class ConcurrentGotchasComponent {
  count = signal(0);
  constructor() {
    effect((onCleanup) => {
      const c = this.count();
      if (c < 10) return; // guard to avoid infinite loop if we wrote count here
    });
  }
}`, feedback_correct: "✅ effect and guard.", feedback_partial: "effect.", feedback_wrong: "count()", expected: "effect that reads signal with guard" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Use afterNextRender to read offsetHeight of an element: afterNextRender(() => { const h = this.elRef.nativeElement.offsetHeight; this.height.set(h); }). So DOM is committed before read.", answer_keywords: ["afterNextRender", "offsetHeight", "nativeElement"], seed_code: `import { Component, signal, ViewChild, ElementRef, afterNextRender } from '@angular/core';

@Component({
  selector: 'app-concurrent-gotchas',
  standalone: true,
  template: \`<div #box>Content</div><p>Height: {{ height() }}</p>\`,
})
export class ConcurrentGotchasComponent {
  @ViewChild('box') elRef!: ElementRef<HTMLDivElement>;
  height = signal(0);
  constructor() {
    afterNextRender(() => {
      if (this.elRef?.nativeElement) this.height.set(this.elRef.nativeElement.offsetHeight);
    });
  }
}`, feedback_correct: "✅ afterNextRender for DOM.", feedback_partial: "afterNextRender.", feedback_wrong: "offsetHeight", expected: "afterNextRender and DOM read" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Use NgZone.runOutsideAngular for a setInterval that doesn't trigger change detection every tick: inject NgZone and runOutsideAngular(() => setInterval(...)). When you need to update a signal, use ngZone.run(() => this.count.set(...)). Export the component.", answer_keywords: ["runOutsideAngular", "NgZone", "export"], seed_code: `import { Component, signal, inject, NgZone } from '@angular/core';

@Component({
  selector: 'app-concurrent-gotchas',
  standalone: true,
  template: \`<p>{{ count() }}</p>\`,
})
export class ConcurrentGotchasComponent {
  private ngZone = inject(NgZone);
  count = signal(0);
  constructor() {
    this.ngZone.runOutsideAngular(() => {
      setInterval(() => this.ngZone.run(() => this.count.update(c => c + 1)), 1000);
    });
  }
}`, feedback_correct: "✅ Concurrent Mode Gotchas (Angular) complete.", feedback_partial: "runOutsideAngular.", feedback_wrong: "Export", expected: "runOutsideAngular and ngZone.run for updates" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 89, title: TITLE, shortName: "A — CONCURRENT GOTCHAS" });
