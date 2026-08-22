import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #7 (Angular)", title: "useEffect & Side Effects", body: "Run a side effect when a signal or input changes. In Angular we use effect() from @angular/core to react to signal changes (similar to React useEffect).", usecase: "effect() runs when its read signals change — use for logging, syncing, or external APIs." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Import effect from @angular/core", "Create effect(() => { ... }) that reads one or more signals", "Understand effect runs when read signals change", "Optional: cleanup with effect's return or DestroyRef"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with count = signal(0). Import effect from @angular/core.", answer_keywords: ["effect", "signal", "count"], seed_code: `import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-effect',
  standalone: true,
  imports: [CommonModule],
  template: \`<p>Count: {{ count() }}</p>\`,
})
export class SideEffectComponent {
  count = signal(0);
  constructor() {
    effect(() => { console.log('Count is', this.count()); });
  }
}`, feedback_correct: "✅ effect imported and used.", feedback_partial: "effect and signal.", feedback_wrong: "effect(() => { ... })", expected: "Import effect; in constructor: effect(() => { console.log(this.count()); })" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "In the constructor add effect(() => { console.log('Count is', this.count()); }). Reading count() inside effect makes it run whenever count changes.", answer_keywords: ["effect", "count()", "constructor"], seed_code: `import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-effect',
  standalone: true,
  imports: [CommonModule],
  template: \`<p>Count: {{ count() }}</p>\`,
})
export class SideEffectComponent {
  count = signal(0);
  constructor() {
    effect(() => { console.log('Count is', this.count()); });
  }
}`, feedback_correct: "✅ effect runs on count change.", feedback_partial: "effect reads count().", feedback_wrong: "effect(() => { ... this.count() ... })", expected: "effect(() => { console.log(this.count()); })" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Add a button that increments count. Verify the effect runs when you click. Export the component.", answer_keywords: ["button", "click", "update", "increment"], seed_code: `import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-effect',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <p>Count: {{ count() }}</p>
    <button (click)="count.update(c => c + 1)">+1</button>
  \`,
})
export class SideEffectComponent {
  count = signal(0);
  constructor() {
    effect(() => { console.log('Count is', this.count()); });
  }
}`, feedback_correct: "✅ Side Effects (Angular) complete.", feedback_partial: "Button and effect.", feedback_wrong: "count.update and effect", expected: "button (click)=\"count.update(c => c + 1)\" and effect in constructor." },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 7, title: "useEffect & Side Effects (Angular)", shortName: "A — EFFECT" });
