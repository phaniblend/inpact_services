import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "useCallback for Stable References (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #50 (Angular)", title: TITLE, body: "In Angular, callback references are stable when defined as class methods; for passing to child components use the same method reference. For signals, use computed or methods that read signals so children don't re-render unnecessarily.", usecase: "Angular class methods are stable; use OnPush and signal inputs to avoid unnecessary child updates." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Define handler as a class method: onClick = () => { ... } or onClick() { ... } so reference is stable", "Child with @Input() callback: use it in (click)=\"callback()\"; parent passes [callback]=\"parentHandler\"", "If handler needs latest signal value, read inside the method; avoid creating new function in template", "OnPush on child so it only updates when @Input() or events change"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a parent with count = signal(0) and a stable method increment() { this.count.update(c => c + 1); }. Template: <button (click)=\"increment()\">+1</button> {{ count() }}.", answer_keywords: ["increment", "method", "count"], seed_code: `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-parent',
  standalone: true,
  template: \`<button (click)="increment()">+1</button> {{ count() }}\`,
})
export class ParentComponent {
  count = signal(0);
  increment() { this.count.update(c => c + 1); }
}`, feedback_correct: "✅ Stable method.", feedback_partial: "increment().", feedback_wrong: "increment", expected: "increment() method and (click)=\"increment()\"" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Create a child component with @Input() onAction!: () => void. Template: <button (click)=\"onAction()\">Do it</button>. Parent: <app-child [onAction]=\"increment\"></app-child> (pass method reference).", answer_keywords: ["Input", "onAction", "increment"], seed_code: `import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-child',
  standalone: true,
  template: \`<button (click)="onAction()">Do it</button>\`,
})
export class ChildComponent {
  @Input() onAction!: () => void;
}`, feedback_correct: "✅ Child with callback Input.", feedback_partial: "onAction.", feedback_wrong: "@Input onAction", expected: "@Input() onAction and (click)=\"onAction()\"" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Add ChangeDetectionStrategy.OnPush to child so it doesn't re-run when parent's other signals change. Export both components.", answer_keywords: ["OnPush", "export"], seed_code: `import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-child',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`<button (click)="onAction()">Do it</button>\`,
})
export class ChildComponent {
  @Input() onAction!: () => void;
}`, feedback_correct: "✅ useCallback for Stable References (Angular) complete.", feedback_partial: "OnPush.", feedback_wrong: "Export", expected: "OnPush on child and export" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 50, title: TITLE, shortName: "A — STABLE REFS" });
