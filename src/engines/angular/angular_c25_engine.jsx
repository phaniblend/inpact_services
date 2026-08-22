import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Lifting State Up (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #25 (Angular)", title: TITLE, body: "Keep shared state in a parent component and pass it down via @Input() and receive changes from children via @Output() EventEmitter so siblings stay in sync.", usecase: "Angular lifts state by owning signals in the parent and binding [value] and (valueChange) or custom events." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Parent holds signal or property; pass to child with [value]=\"state()\"", "Child @Input() value; @Output() valueChange = new EventEmitter()", "On child change call valueChange.emit(newValue); parent updates state", "Two-way binding option: [(value)]=\"state\" with model() or EventEmitter pattern"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a parent with count = signal(0). Create a child with @Input() count = 0 and @Output() countChange = new EventEmitter<number>(). Parent template: <app-child [count]=\"count()\" (countChange)=\"count.set($event)\"></app-child>.", answer_keywords: ["count", "countChange", "EventEmitter"], seed_code: `import { Component, signal } from '@angular/core';
import { ChildCounterComponent } from './child-counter.component';

@Component({
  selector: 'app-parent',
  standalone: true,
  imports: [ChildCounterComponent],
  template: \`<app-child-counter [count]="count()" (countChange)="count.set($event)"></app-child-counter>\`,
})
export class ParentComponent {
  count = signal(0);
}`, feedback_correct: "✅ Parent owns count and binds.", feedback_partial: "count and countChange.", feedback_wrong: "count.set($event)", expected: "[count] and (countChange)=\"count.set($event)\"" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "In child, add a button that calls countChange.emit(count + 1). Display {{ count }} in child template.", answer_keywords: ["emit", "count", "button"], seed_code: `import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-child-counter',
  standalone: true,
  template: \`<span>{{ count }}</span> <button (click)="countChange.emit(count + 1)">+1</button>\`,
})
export class ChildCounterComponent {
  @Input() count = 0;
  @Output() countChange = new EventEmitter<number>();
}`, feedback_correct: "✅ Child emits countChange.", feedback_partial: "emit.", feedback_wrong: "countChange.emit", expected: "countChange.emit(count + 1)" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Use two-way binding in parent: [(count)] with a writable signal. Angular 17+ model(): child can use model = model(0) and bind [(model)]. Export both components.", answer_keywords: ["model", "two-way", "export"], seed_code: `import { Component, model } from '@angular/core';

@Component({
  selector: 'app-child-counter',
  standalone: true,
  template: \`<span>{{ count() }}</span> <button (click)="count.update(c => c + 1)">+1</button>\`,
})
export class ChildCounterComponent {
  count = model(0);
}`, feedback_correct: "✅ Lifting State Up (Angular) complete.", feedback_partial: "model().", feedback_wrong: "model two-way", expected: "model(0) for two-way binding" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 25, title: TITLE, shortName: "A — LIFT STATE" });
