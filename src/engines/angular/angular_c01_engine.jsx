import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #1 (Angular)", title: "Counter App", body: "Build a simple Angular component that displays a number starting at 0 and lets the user change it using buttons: [ + ] increases by 1, [ - ] decreases by 1, [ Reset ] brings it back to 0. Use signal() for state.", usecase: "Same pattern as React — with Angular signals and template syntax." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Use signal(0) for the counter value", "Use computed or direct signal() for reactive state", "Template: {{ count() }} and (click) handlers", "Export a standalone component"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a standalone component with count = signal(0). Import Component and signal from @angular/core.", answer_keywords: ["signal", "component", "import", "0"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-counter',
  standalone: true,
  imports: [CommonModule],
  template: \`<!-- Step 1: add template in next step -->\`,
})
export class CounterComponent {
  // Step 1: count = signal(0)
}`, feedback_correct: "✅ signal(0) declared.", feedback_partial: "signal and Component.", feedback_wrong: "count = signal(0)", expected: "count = signal(0) in the component class." },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add template: display count with {{ count() }}, and three buttons: +, -, Reset. Use (click) for handlers (wire in Step 3).", answer_keywords: ["count()", "button", "template", "click"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-counter',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <h1>{{ count() }}</h1>
    <button (click)="increment()">+</button>
    <button (click)="decrement()">-</button>
    <button (click)="reset()">Reset</button>
  \`,
})
export class CounterComponent {
  count = signal(0);
  increment() { this.count.update(c => c + 1); }
  decrement() { this.count.update(c => c - 1); }
  reset() { this.count.set(0); }
}`, feedback_correct: "✅ Template and buttons.", feedback_partial: "{{ count() }} and buttons.", feedback_wrong: "template with count() and (click)", expected: "Template with {{ count() }} and three buttons with (click)." },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Implement increment (count.update(c => c + 1)), decrement (count.update(c => c - 1)), reset (count.set(0)). Export the component.", answer_keywords: ["update", "set", "export"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-counter',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <h1>{{ count() }}</h1>
    <button (click)="increment()">+</button>
    <button (click)="decrement()">-</button>
    <button (click)="reset()">Reset</button>
  \`,
})
export class CounterComponent {
  count = signal(0);
  increment() { this.count.update(c => c + 1); }
  decrement() { this.count.update(c => c - 1); }
  reset() { this.count.set(0); }
}`, feedback_correct: "✅ Counter App (Angular) complete.", feedback_partial: "Handlers and export.", feedback_wrong: "increment/decrement/reset", expected: "increment: count.update(c => c + 1); decrement: count.update(c => c - 1); reset: count.set(0). Export the component." },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 1, title: "Counter App (Angular)", shortName: "A — COUNTER" });
