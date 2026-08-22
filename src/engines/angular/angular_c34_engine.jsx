import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "useToggle (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #34 (Angular)", title: TITLE, body: "Implement a boolean toggle with a signal and a method or inline (click) that flips the value using signal.update(b => !b); optionally accept an optional forced value.", usecase: "Angular signals with update(b => !b) replicate React's useToggle pattern." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["on = signal(false); toggle() { this.on.update(v => !v); }", "Optional: set(value?: boolean) { if (value !== undefined) this.on.set(value); else this.on.update(v => !v); }", "Template: (click)=\"toggle()\" or (click)=\"on.set(!on())\"", "Use in *ngIf or [class.open]=\"on()\""] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with on = signal(false). Add a button (click)=\"on.set(!on())\" and display {{ on() ? 'On' : 'Off' }}.", answer_keywords: ["signal", "on.set", "click"], seed_code: `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-toggle',
  standalone: true,
  template: \`
    <button (click)="on.set(!on())">Toggle</button>
    <span>{{ on() ? 'On' : 'Off' }}</span>
  \`,
})
export class ToggleComponent {
  on = signal(false);
}`, feedback_correct: "✅ Toggle with signal.", feedback_partial: "on.set(!on()).", feedback_wrong: "on.set", expected: "(click)=\"on.set(!on())\"" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add a toggle() method that uses on.update(v => !v). Call it from the button: (click)=\"toggle()\".", answer_keywords: ["toggle", "update"], seed_code: `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-toggle',
  standalone: true,
  template: \`
    <button (click)="toggle()">Toggle</button>
    <span>{{ on() ? 'On' : 'Off' }}</span>
  \`,
})
export class ToggleComponent {
  on = signal(false);
  toggle() { this.on.update(v => !v); }
}`, feedback_correct: "✅ toggle() and update.", feedback_partial: "update(v => !v).", feedback_wrong: "toggle method", expected: "toggle() { this.on.update(v => !v); }" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Use *ngIf=\"on()\" to show/hide a paragraph. Export the component.", answer_keywords: ["ngIf", "on()", "export"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toggle',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <button (click)="toggle()">Toggle</button>
    <p *ngIf="on()">Visible when on</p>
    <span>{{ on() ? 'On' : 'Off' }}</span>
  \`,
})
export class ToggleComponent {
  on = signal(false);
  toggle() { this.on.update(v => !v); }
}`, feedback_correct: "✅ useToggle (Angular) complete.", feedback_partial: "*ngIf.", feedback_wrong: "Export", expected: "*ngIf=\"on()\" and export" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 34, title: TITLE, shortName: "A — TOGGLE" });
