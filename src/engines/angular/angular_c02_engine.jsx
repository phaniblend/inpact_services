import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #2 (Angular)", title: "Toggle Visibility", body: "A page with a button and a paragraph. Clicking the button hides the paragraph if visible, shows it if hidden. The button label switches between 'Hide' and 'Show'. Use a signal<boolean> for visibility.", usecase: "Same pattern as React — with Angular signals and *ngIf or @if in the template." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Use signal(true) or signal(false) for visible state", "Template: *ngIf or @if (Angular 17+) for conditional paragraph", "Button (click) handler that toggles the signal", "Dynamic button label with ternary in template"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a standalone component with visible = signal(true). Import Component, signal, and CommonModule (for *ngIf).", answer_keywords: ["signal", "visible", "true", "component"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toggle',
  standalone: true,
  imports: [CommonModule],
  template: \`<!-- Step 1: add template next -->\`,
})
export class ToggleVisibilityComponent {
  // Step 1: visible = signal(true)
}`, feedback_correct: "✅ signal(true) declared.", feedback_partial: "signal and Component.", feedback_wrong: "visible = signal(true)", expected: "visible = signal(true) in the class." },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add a toggle() method that flips visible: this.visible.update(v => !v). In the template add a button with (click)=\"toggle()\" and label that shows 'Hide' when visible() is true, 'Show' when false.", answer_keywords: ["toggle", "update", "ngIf", "click"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toggle',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <button (click)="toggle()">{{ visible() ? 'Hide' : 'Show' }}</button>
    <p *ngIf="visible()">Hello, I am visible!</p>
  \`,
})
export class ToggleVisibilityComponent {
  visible = signal(true);
  toggle() { this.visible.update(v => !v); }
}`, feedback_correct: "✅ Toggle and template wired.", feedback_partial: "toggle() and *ngIf.", feedback_wrong: "visible.update(v => !v) and *ngIf", expected: "toggle() { this.visible.update(v => !v); } and template with (click) and *ngIf." },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Ensure the paragraph is only in the DOM when visible() is true using *ngIf=\"visible()\". Export the component.", answer_keywords: ["ngIf", "visible()", "export"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toggle',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <button (click)="toggle()">{{ visible() ? 'Hide' : 'Show' }}</button>
    <p *ngIf="visible()">Hello, I am visible!</p>
  \`,
})
export class ToggleVisibilityComponent {
  visible = signal(true);
  toggle() { this.visible.update(v => !v); }
}`, feedback_correct: "✅ Toggle Visibility (Angular) complete.", feedback_partial: "*ngIf and export.", feedback_wrong: "*ngIf=\"visible()\"", expected: "Template: button (click)=toggle(), label {{ visible() ? 'Hide' : 'Show' }}, p *ngIf=\"visible()\"." },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 2, title: "Toggle Visibility (Angular)", shortName: "A — TOGGLE" });
