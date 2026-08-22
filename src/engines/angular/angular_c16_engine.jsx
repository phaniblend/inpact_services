import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Conditional Rendering (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #16 (Angular)", title: TITLE, body: "Show or hide elements based on a condition. Use *ngIf=\"condition()\" for if, or *ngIf=\"cond(); else elseBlock\" with ng-template #elseBlock for else.", usecase: "Angular uses *ngIf (or @if in control flow) for conditional rendering." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["*ngIf=\"isVisible()\" to show/hide an element", "Optional: else with ng-template #elseBlock", "Use a signal or property for the condition", "CommonModule for NgIf"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with isVisible = signal(true). Add a paragraph with *ngIf=\"isVisible()\" showing 'Visible'.", answer_keywords: ["ngIf", "isVisible", "signal"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-conditional',
  standalone: true,
  imports: [CommonModule],
  template: \`<p *ngIf="isVisible()">Visible</p>\`,
})
export class ConditionalRenderingComponent {
  isVisible = signal(true);
}`, feedback_correct: "✅ *ngIf with signal.", feedback_partial: "ngIf and signal.", feedback_wrong: "*ngIf=\"isVisible()\"", expected: "*ngIf=\"isVisible()\"" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add an else block: *ngIf=\"isVisible(); else hidden\" and <ng-template #hidden><p>Hidden</p></ng-template>.", answer_keywords: ["else", "ng-template", "hidden"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-conditional',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <p *ngIf="isVisible(); else hidden">Visible</p>
    <ng-template #hidden><p>Hidden</p></ng-template>
  \`,
})
export class ConditionalRenderingComponent {
  isVisible = signal(true);
}`, feedback_correct: "✅ else block added.", feedback_partial: "ng-template.", feedback_wrong: "else hidden", expected: "*ngIf=\"isVisible(); else hidden\" and ng-template #hidden" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Add a button (click)=\"isVisible.set(!isVisible())\" to toggle. Export the component.", answer_keywords: ["click", "set", "button"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-conditional',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <p *ngIf="isVisible(); else hidden">Visible</p>
    <ng-template #hidden><p>Hidden</p></ng-template>
    <button (click)="isVisible.set(!isVisible())">Toggle</button>
  \`,
})
export class ConditionalRenderingComponent {
  isVisible = signal(true);
}`, feedback_correct: "✅ Conditional Rendering (Angular) complete.", feedback_partial: "Toggle button.", feedback_wrong: "isVisible.set(!isVisible())", expected: "button (click)=\"isVisible.set(!isVisible())\"" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 16, title: TITLE, shortName: "A — CONDITIONAL" });
