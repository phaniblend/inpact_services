import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Conditional Classes (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #21 (Angular)", title: TITLE, body: "Apply CSS classes conditionally using Angular's ngClass directive with an object, array, or string expression based on component state.", usecase: "ngClass is the Angular way to toggle classes from component signals or properties." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Use [ngClass]=\"{ 'active': isActive(), 'disabled': disabled() }\" for object syntax", "Or [ngClass]=\"['base', isActive() ? 'on' : 'off']\" for array", "CommonModule provides NgClass; or use class binding [class.active]=\"isActive()\"", "Combine with signals for reactive class toggling"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with isActive = signal(false). Add a div with [ngClass]=\"{ 'active': isActive() }\". Import CommonModule.", answer_keywords: ["ngClass", "isActive", "signal"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-conditional-classes',
  standalone: true,
  imports: [CommonModule],
  template: \`<div [ngClass]="{ 'active': isActive() }">Content</div>\`,
})
export class ConditionalClassesComponent {
  isActive = signal(false);
}`, feedback_correct: "✅ ngClass with signal.", feedback_partial: "ngClass object.", feedback_wrong: "[ngClass] with condition", expected: "[ngClass]=\"{ 'active': isActive() }\"" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add a button (click)=\"isActive.set(!isActive())\" to toggle. Add [class.disabled]=\"!isActive()\" on the same or another element.", answer_keywords: ["click", "set", "class.disabled"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-conditional-classes',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div [ngClass]="{ 'active': isActive() }" [class.disabled]="!isActive()">Content</div>
    <button (click)="isActive.set(!isActive())">Toggle</button>
  \`,
})
export class ConditionalClassesComponent {
  isActive = signal(false);
}`, feedback_correct: "✅ Toggle and class binding.", feedback_partial: "class.disabled.", feedback_wrong: "[class.disabled]", expected: "(click)=\"isActive.set(!isActive())\" and [class.disabled]" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Use array syntax: [ngClass]=\"['card', isActive() ? 'highlight' : '']\". Export the component.", answer_keywords: ["ngClass", "array", "highlight"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-conditional-classes',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div [ngClass]="['card', isActive() ? 'highlight' : '']">Content</div>
    <button (click)="isActive.set(!isActive())">Toggle</button>
  \`,
})
export class ConditionalClassesComponent {
  isActive = signal(false);
}`, feedback_correct: "✅ Conditional Classes (Angular) complete.", feedback_partial: "Array ngClass.", feedback_wrong: "ngClass array", expected: "[ngClass]=\"['card', isActive() ? 'highlight' : '']\"" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 21, title: TITLE, shortName: "A — NG CLASS" });
