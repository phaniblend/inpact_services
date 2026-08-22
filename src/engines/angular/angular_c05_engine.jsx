import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #5 (Angular)", title: "Conditional Rendering with Ternary", body: "Show one message when a boolean is true and another when false, using a ternary in the template. Use a signal<boolean> and render either 'Welcome back' or 'Please sign in' in the template.", usecase: "Angular templates use ternary (condition ? a : b) or *ngIf/else for conditional UI." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Use signal(true) or signal(false) for the condition", "Template: {{ isLoggedIn() ? 'Welcome back' : 'Please sign in' }}", "Optional: toggle button that flips the signal", "Standalone component with CommonModule"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with isLoggedIn = signal(false). Add a minimal template that shows the value for now.", answer_keywords: ["signal", "isLoggedIn", "template"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-conditional',
  standalone: true,
  imports: [CommonModule],
  template: \`<p>{{ isLoggedIn() ? 'Welcome back' : 'Please sign in' }}</p>\`,
})
export class ConditionalTernaryComponent {
  isLoggedIn = signal(false);
}`, feedback_correct: "✅ signal declared.", feedback_partial: "signal and component.", feedback_wrong: "isLoggedIn = signal(false)", expected: "isLoggedIn = signal(false)" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "In the template use a ternary: {{ isLoggedIn() ? 'Welcome back' : 'Please sign in' }} inside a <p>.", answer_keywords: ["isLoggedIn()", "?", "Welcome", "sign in"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-conditional',
  standalone: true,
  imports: [CommonModule],
  template: \`<p>{{ isLoggedIn() ? 'Welcome back' : 'Please sign in' }}</p>\`,
})
export class ConditionalTernaryComponent {
  isLoggedIn = signal(false);
}`, feedback_correct: "✅ Ternary in template.", feedback_partial: "Ternary expression.", feedback_wrong: "{{ isLoggedIn() ? 'Welcome back' : 'Please sign in' }}", expected: "Template: {{ isLoggedIn() ? 'Welcome back' : 'Please sign in' }}" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Add a button (click)=\"isLoggedIn.set(!isLoggedIn())\" to toggle the message. Export the component.", answer_keywords: ["click", "set", "button"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-conditional',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <p>{{ isLoggedIn() ? 'Welcome back' : 'Please sign in' }}</p>
    <button (click)="isLoggedIn.set(!isLoggedIn())">Toggle</button>
  \`,
})
export class ConditionalTernaryComponent {
  isLoggedIn = signal(false);
}`, feedback_correct: "✅ Conditional Ternary (Angular) complete.", feedback_partial: "Toggle button.", feedback_wrong: "(click) and isLoggedIn.set()", expected: "button (click)=\"isLoggedIn.set(!isLoggedIn())\"" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 5, title: "Conditional Rendering with Ternary (Angular)", shortName: "A — TERNARY" });
