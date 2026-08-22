import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "usePrevious (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #36 (Angular)", title: TITLE, body: "Track the previous value of a signal or input in Angular using effect() to copy the current value into a 'previous' signal before the next update.", usecase: "Angular effects and signals replicate React's usePrevious pattern for comparing current vs last value." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["previous = signal<T | undefined>(undefined); in effect read current(), then previous.set(prevCurrent) after storing current", "Or use a wrapper: run effect, store signal() in prev, set previousSignal(prev), then prev = signal()", "Use previous() in template or in another effect for comparison", "Handle first run (no previous) with undefined"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with count = signal(0) and previous = signal<number | undefined>(undefined). In an effect: const cur = count(); previous.set(prevValue); then store cur in a variable for next run (use a let prevValue = undefined and set prevValue = cur at end of effect).", answer_keywords: ["effect", "previous", "signal"], seed_code: `import { Component, signal, effect } from '@angular/core';

@Component({
  selector: 'app-previous',
  standalone: true,
  template: \`<p>Current: {{ count() }} Previous: {{ previous() }}</p>\`,
})
export class PreviousComponent {
  count = signal(0);
  previous = signal<number | undefined>(undefined);
  private prevValue: number | undefined;
  constructor() {
    effect(() => {
      const cur = this.count();
      this.previous.set(this.prevValue);
      this.prevValue = cur;
    });
  }
}`, feedback_correct: "✅ effect and previous signal.", feedback_partial: "effect and set.", feedback_wrong: "previous.set", expected: "effect that sets previous from stored prev value" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add a button (click)=\"count.update(c => c + 1)\". Verify previous() shows the prior count after each click.", answer_keywords: ["click", "update", "count"], seed_code: `import { Component, signal, effect } from '@angular/core';

@Component({
  selector: 'app-previous',
  standalone: true,
  template: \`
    <p>Current: {{ count() }} Previous: {{ previous() }}</p>
    <button (click)="count.update(c => c + 1)">+1</button>
  \`,
})
export class PreviousComponent {
  count = signal(0);
  previous = signal<number | undefined>(undefined);
  private prevValue: number | undefined;
  constructor() {
    effect(() => {
      const cur = this.count();
      this.previous.set(this.prevValue);
      this.prevValue = cur;
    });
  }
}`, feedback_correct: "✅ Button updates count.", feedback_partial: "count.update.", feedback_wrong: "update", expected: "(click)=\"count.update(c => c + 1)\"" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Display 'Increased' or 'Decreased' by comparing count() and previous() in the template with a getter or computed. Export the component.", answer_keywords: ["comparison", "Increased", "export"], seed_code: `import { Component, signal, effect } from '@angular/core';

@Component({
  selector: 'app-previous',
  standalone: true,
  template: \`
    <p>Current: {{ count() }} Previous: {{ previous() }}</p>
    <p *ngIf="previous() !== undefined">{{ count() > previous()! ? 'Increased' : 'Decreased' }}</p>
    <button (click)="count.update(c => c + 1)">+1</button>
  \`,
})
export class PreviousComponent {
  count = signal(0);
  previous = signal<number | undefined>(undefined);
  private prevValue: number | undefined;
  constructor() {
    effect(() => {
      const cur = this.count();
      this.previous.set(this.prevValue);
      this.prevValue = cur;
    });
  }
}`, feedback_correct: "✅ usePrevious (Angular) complete.", feedback_partial: "comparison.", feedback_wrong: "Export", expected: "Compare count() and previous() and export" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 36, title: TITLE, shortName: "A — PREVIOUS" });
