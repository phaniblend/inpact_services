import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "React.memo (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #51 (Angular)", title: TITLE, body: "Prevent a child component from re-rendering when parent updates but the child's inputs haven't changed: use ChangeDetectionStrategy.OnPush and signal or immutable @Input() so Angular skips the child when inputs are unchanged.", usecase: "Angular OnPush plus signal/input comparison gives React.memo-like behavior; components only update when inputs change." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Set changeDetection: ChangeDetectionStrategy.OnPush on the child", "Pass primitive or signal inputs; for objects ensure parent doesn't create new reference every render", "Use signals for inputs: child reads inputSignal() so change detection is signal-based", "Or use @Input() and ensure parent passes same reference when value unchanged"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a child component with ChangeDetectionStrategy.OnPush and @Input() value = 0. Template: {{ value }}. Parent has count = signal(0) and passes [value]=\"count()\".", answer_keywords: ["OnPush", "Input", "value"], seed_code: `import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-memo-child',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`<span>{{ value }}</span>\`,
})
export class MemoChildComponent {
  @Input() value = 0;
}`, feedback_correct: "✅ OnPush child.", feedback_partial: "OnPush.", feedback_wrong: "value", expected: "ChangeDetectionStrategy.OnPush and @Input() value" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Parent: only update count when a button is clicked. Add another signal unrelated = signal(0) and a button that updates unrelated. Verify child does not re-render when only unrelated changes (with OnPush).", answer_keywords: ["unrelated", "count", "button"], seed_code: `import { Component, signal } from '@angular/core';
import { MemoChildComponent } from './memo-child.component';

@Component({
  selector: 'app-parent',
  standalone: true,
  imports: [MemoChildComponent],
  template: \`
    <app-memo-child [value]="count()"></app-memo-child>
    <button (click)="count.update(c => c + 1)">Count</button>
    <button (click)="unrelated.update(u => u + 1)">Unrelated</button>
  \`,
})
export class ParentComponent {
  count = signal(0);
  unrelated = signal(0);
}`, feedback_correct: "✅ Parent with two signals.", feedback_partial: "count and unrelated.", feedback_wrong: "unrelated", expected: "count and unrelated; child gets [value]=\"count()\"" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Use input signal in child: value = input(0) instead of @Input() so Angular tracks the input as a signal. Template: {{ value() }}. Export both components.", answer_keywords: ["input()", "signal", "export"], seed_code: `import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-memo-child',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`<span>{{ value() }}</span>\`,
})
export class MemoChildComponent {
  value = input(0);
}`, feedback_correct: "✅ React.memo (Angular) complete.", feedback_partial: "input().", feedback_wrong: "Export", expected: "input(0) and value() in template" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 51, title: TITLE, shortName: "A — MEMO" });
