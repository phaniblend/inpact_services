import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Reusable Button (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #11 (Angular)", title: TITLE, body: "A reusable button component that accepts a label via @Input() and emits a click via @Output() EventEmitter. Parent can (clicked)=\"handler()\".", usecase: "Angular components communicate up via Output() and EventEmitter." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["@Input() label: string", "@Output() clicked = new EventEmitter<void>()", "Template: <button (click)=\"clicked.emit()\">{{ label }}</button>", "Parent uses <app-btn [label]=\"'Save'\" (clicked)=\"onSave()\">"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a standalone component with @Input() label = 'Click' and a button in the template that shows {{ label }}.", answer_keywords: ["Input", "label", "button"], seed_code: `import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-btn',
  standalone: true,
  template: \`<button>{{ label }}</button>\`,
})
export class ReusableButtonComponent {
  @Input() label = 'Click';
}`, feedback_correct: "✅ @Input() label.", feedback_partial: "Input and template.", feedback_wrong: "@Input() label", expected: "@Input() label = 'Click'" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add @Output() clicked = new EventEmitter<void>(). Import EventEmitter and Output. On button (click) call clicked.emit().", answer_keywords: ["Output", "EventEmitter", "emit"], seed_code: `import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-btn',
  standalone: true,
  template: \`<button (click)="clicked.emit()">{{ label }}</button>\`,
})
export class ReusableButtonComponent {
  @Input() label = 'Click';
  @Output() clicked = new EventEmitter<void>();
}`, feedback_correct: "✅ @Output and emit.", feedback_partial: "EventEmitter.", feedback_wrong: "clicked.emit()", expected: "@Output() clicked = new EventEmitter<void>(); (click)=\"clicked.emit()\"" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Parent can use <app-btn [label]=\"'Save'\" (clicked)=\"onSave()\"></app-btn>. Export the component.", answer_keywords: ["export", "component"], seed_code: `import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-btn',
  standalone: true,
  template: \`<button (click)="clicked.emit()">{{ label }}</button>\`,
})
export class ReusableButtonComponent {
  @Input() label = 'Click';
  @Output() clicked = new EventEmitter<void>();
}`, feedback_correct: "✅ Reusable Button (Angular) complete.", feedback_partial: "Export.", feedback_wrong: "Export component", expected: "Export ReusableButtonComponent." },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 11, title: TITLE, shortName: "A — BUTTON" });
