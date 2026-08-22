import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Unnecessary Re-renders (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #48 (Angular)", title: TITLE, body: "Reduce unnecessary re-renders in Angular: use ChangeDetectionStrategy.OnPush, avoid creating new objects/arrays in template expressions, and use computed() for derived values so only dependents update.", usecase: "Angular OnPush, signals, and computed limit when components and templates re-run." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Set changeDetection: ChangeDetectionStrategy.OnPush on components", "Don't use getters that return new {} or [] in template; use computed() or signals", "Bind to primitive or signal so change detection sees same reference or signal read", "Use trackBy in *ngFor to avoid list thrashing"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with ChangeDetectionStrategy.OnPush. Use count = signal(0) and display {{ count() }}. Add a child that receives count as @Input() and only re-renders when count reference changes.", answer_keywords: ["OnPush", "signal", "Input"], seed_code: `import { Component, signal, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-parent',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`<p>{{ count() }}</p>\`,
})
export class ParentComponent {
  count = signal(0);
}`, feedback_correct: "✅ OnPush and signal.", feedback_partial: "OnPush.", feedback_wrong: "ChangeDetectionStrategy", expected: "ChangeDetectionStrategy.OnPush and signal" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Replace a getter that returns a new array in template with a computed: items = computed(() => [...]). Use items() in *ngFor so the list reference is stable from computed.", answer_keywords: ["computed", "items", "ngFor"], seed_code: `import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-parent',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`<div *ngFor="let x of items()">{{ x }}</div>\`,
})
export class ParentComponent {
  count = signal(0);
  items = computed(() => [this.count(), this.count() + 1]);
}`, feedback_correct: "✅ computed for list.", feedback_partial: "computed.", feedback_wrong: "items", expected: "computed(() => [...]) for template list" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Add *ngFor trackBy: trackById (trackById(i: number, item: T) { return item.id; }) when listing items with ids. Export the component.", answer_keywords: ["trackBy", "trackById", "export"], seed_code: `import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-parent',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`<div *ngFor="let x of items(); trackBy: trackById">{{ x }}</div>\`,
})
export class ParentComponent {
  count = signal(0);
  items = computed(() => [this.count(), this.count() + 1]);
  trackById = (i: number, x: number) => i;
}`, feedback_correct: "✅ Unnecessary Re-renders (Angular) complete.", feedback_partial: "trackBy.", feedback_wrong: "Export", expected: "trackBy in *ngFor and export" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 48, title: TITLE, shortName: "A — RE-RENDERS" });
