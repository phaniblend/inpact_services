import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Event Handling (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #20 (Angular)", title: TITLE, body: "Handle user events in the template with (click), (keyup), (input), etc. Call component methods or inline expressions. For custom events use @Output() and EventEmitter.", usecase: "Angular event binding (event)=\"handler()\" and EventEmitter for child-to-parent." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["(click)=\"onClick()\" or (click)=\"count.set(count() + 1)\"", "(keyup.enter)=\"submit()\" for Enter key", "@Output() submit = new EventEmitter() and submit.emit() in child", "Pass event: (click)=\"onClick($event)\" when you need the DOM event"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with count = signal(0). Add a button with (click)=\"count.set(count() + 1)\" and display {{ count() }}.", answer_keywords: ["click", "count", "set"], seed_code: `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-events',
  standalone: true,
  template: \`
    <p>Count: {{ count() }}</p>
    <button (click)="count.set(count() + 1)">Increment</button>
  \`,
})
export class EventHandlingComponent {
  count = signal(0);
}`, feedback_correct: "✅ (click) and signal update.", feedback_partial: "(click) binding.", feedback_wrong: "(click)=\"count.set(count() + 1)\"", expected: "button (click)=\"count.set(count() + 1)\"" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add a method onClick(e: MouseEvent) and use (click)=\"onClick($event)\". Log e or read e.target. Show that $event passes the DOM event.", answer_keywords: ["$event", "onClick", "MouseEvent"], seed_code: `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-events',
  standalone: true,
  template: \`
    <p>Count: {{ count() }}</p>
    <button (click)="onClick($event)">Increment</button>
  \`,
})
export class EventHandlingComponent {
  count = signal(0);
  onClick(e: MouseEvent) { this.count.update(c => c + 1); }
}`, feedback_correct: "✅ $event and method.", feedback_partial: "onClick($event).", feedback_wrong: "onClick($event)", expected: "(click)=\"onClick($event)\" and onClick(e: MouseEvent)" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Add (keyup.enter)=\"submit()\" on an input and a submit() method. Export the component.", answer_keywords: ["keyup.enter", "submit"], seed_code: `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-events',
  standalone: true,
  template: \`
    <p>Count: {{ count() }}</p>
    <button (click)="onClick($event)">Increment</button>
    <input (keyup.enter)="submit()" placeholder="Press Enter" />
  \`,
})
export class EventHandlingComponent {
  count = signal(0);
  onClick(e: MouseEvent) { this.count.update(c => c + 1); }
  submit() { console.log('Submit'); }
}`, feedback_correct: "✅ Event Handling (Angular) complete.", feedback_partial: "keyup.enter.", feedback_wrong: "(keyup.enter)=\"submit()\"", expected: "(keyup.enter)=\"submit()\"" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 20, title: TITLE, shortName: "A — EVENTS" });
