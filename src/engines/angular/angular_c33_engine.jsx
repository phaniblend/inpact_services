import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "useLocalStorage (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #33 (Angular)", title: TITLE, body: "Persist and read state from localStorage in Angular: use a signal that reads from localStorage on init and writes on change; optionally wrap in a reusable service or injection token.", usecase: "Angular components or services sync signals with localStorage for persistence." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Read on init: signal(JSON.parse(localStorage.getItem(key) ?? 'null'))", "effect(() => { localStorage.setItem(key, JSON.stringify(signal())); }) to persist on change", "Or create a LocalStorageService with get/set and inject it", "Handle SSR: check typeof localStorage !== 'undefined'"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with key = 'myKey' and value = signal(localStorage.getItem(key) ?? ''). Display {{ value() }} and an input that updates value with (input)=\"value.set($any($event.target).value)\".", answer_keywords: ["localStorage", "getItem", "signal"], seed_code: `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-local-storage',
  standalone: true,
  template: \`
    <input [value]="value()" (input)="value.set($any($event.target).value)" />
    <p>{{ value() }}</p>
  \`,
})
export class LocalStorageComponent {
  key = 'myKey';
  value = signal(localStorage.getItem(this.key) ?? '');
}`, feedback_correct: "✅ Read from localStorage.", feedback_partial: "localStorage.getItem.", feedback_wrong: "localStorage", expected: "signal(localStorage.getItem(key) ?? '')" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add an effect that writes to localStorage when value changes: effect(() => { localStorage.setItem(this.key, this.value()); }). Use inject(Injector) and runInInjectionContext if effect is created in constructor.", answer_keywords: ["effect", "setItem", "localStorage"], seed_code: `import { Component, signal, effect } from '@angular/core';

@Component({
  selector: 'app-local-storage',
  standalone: true,
  template: \`
    <input [value]="value()" (input)="value.set($any($event.target).value)" />
    <p>{{ value() }}</p>
  \`,
})
export class LocalStorageComponent {
  key = 'myKey';
  value = signal(localStorage.getItem('myKey') ?? '');
  constructor() {
    effect(() => {
      localStorage.setItem(this.key, this.value());
    });
  }
}`, feedback_correct: "✅ effect persists to localStorage.", feedback_partial: "effect and setItem.", feedback_wrong: "effect", expected: "effect(() => localStorage.setItem(key, value()))" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Support objects: use JSON.parse and JSON.stringify for get/set. Export the component.", answer_keywords: ["JSON.parse", "JSON.stringify"], seed_code: `import { Component, signal, effect } from '@angular/core';

@Component({
  selector: 'app-local-storage',
  standalone: true,
  template: \`
    <input [value]="value()" (input)="value.set($any($event.target).value)" />
  \`,
})
export class LocalStorageComponent {
  key = 'myKey';
  value = signal(JSON.parse(localStorage.getItem('myKey') ?? '""'));
  constructor() {
    effect(() => localStorage.setItem(this.key, JSON.stringify(this.value())));
  }
}`, feedback_correct: "✅ useLocalStorage (Angular) complete.", feedback_partial: "JSON.", feedback_wrong: "Export", expected: "JSON.parse/stringify and export" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 33, title: TITLE, shortName: "A — LOCAL STORAGE" });
