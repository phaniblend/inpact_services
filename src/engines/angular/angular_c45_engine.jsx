import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Context Performance (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #45 (Angular)", title: TITLE, body: "Avoid unnecessary re-renders when using shared services: use computed() for derived state, runOutsideAngular for heavy work, and OnPush change detection where appropriate.", usecase: "Angular performance with injectable context: computed, OnPush, and signals reduce re-renders." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Use computed() so derived values don't trigger extra updates", "ChangeDetectionStrategy.OnPush so component checks only when @Input or signals change", "inject(ChangeDetectorRef) and markForCheck() only when needed", "Avoid returning new object/array from getters in templates; use signals/computed"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with changeDetection: ChangeDetectionStrategy.OnPush. Use a signal count = signal(0) and a computed double = computed(() => this.count() * 2). Template: {{ count() }} {{ double() }}.", answer_keywords: ["OnPush", "computed", "double"], seed_code: `import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-perf',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`<p>{{ count() }} {{ double() }}</p>\`,
})
export class PerfComponent {
  count = signal(0);
  double = computed(() => this.count() * 2);
}`, feedback_correct: "✅ OnPush and computed.", feedback_partial: "computed.", feedback_wrong: "OnPush", expected: "ChangeDetectionStrategy.OnPush and computed" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Inject ChangeDetectorRef. When updating from a setTimeout or subscription, call this.cdr.markForCheck() after setting the signal so OnPush detects the change (or rely on signal if template reads signal).", answer_keywords: ["ChangeDetectorRef", "markForCheck"], seed_code: `import { Component, signal, computed, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-perf',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`<p>{{ count() }} {{ double() }}</p>\`,
})
export class PerfComponent {
  private cdr = inject(ChangeDetectorRef);
  count = signal(0);
  double = computed(() => this.count() * 2);
}`, feedback_correct: "✅ ChangeDetectorRef injected.", feedback_partial: "cdr.", feedback_wrong: "markForCheck", expected: "inject(ChangeDetectorRef)" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Ensure template only reads signals and computed so Angular tracks dependencies. Add a button that updates count. Export the component.", answer_keywords: ["signal", "template", "export"], seed_code: `import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-perf',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`<p>{{ count() }} {{ double() }}</p><button (click)="count.update(c => c + 1)">+1</button>\`,
})
export class PerfComponent {
  count = signal(0);
  double = computed(() => this.count() * 2);
}`, feedback_correct: "✅ Context Performance (Angular) complete.", feedback_partial: "count.update.", feedback_wrong: "Export", expected: "Template reads signals; button updates count" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 45, title: TITLE, shortName: "A — CONTEXT PERF" });
