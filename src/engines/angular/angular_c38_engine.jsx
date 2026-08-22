import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "useKeyPress (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #38 (Angular)", title: TITLE, body: "React to specific key presses using HostListener('document:keydown', ['$event']) or (keydown) on an element; read event.key and update a signal or call a method.", usecase: "Angular HostListener or template (keydown) with event.key provides keypress handling for shortcuts and accessibility." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["HostListener('document:keydown', ['$event']) and check e.key === 'Escape' or e.key === 'Enter'", "Or (keydown)=\"onKey($event)\" on input and handle in component", "lastKey = signal<string | null>(null); set lastKey.set(e.key)", "Use keydown.key.enter or keydown.key.escape in template (Angular 17+)"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with lastKey = signal<string>(''). Add HostListener('document:keydown', ['$event']) method that sets lastKey.set(e.key). Display {{ lastKey() }}.", answer_keywords: ["HostListener", "keydown", "key"], seed_code: `import { Component, signal, HostListener } from '@angular/core';

@Component({
  selector: 'app-key-press',
  standalone: true,
  template: \`<p>Last key: {{ lastKey() }}</p>\`,
})
export class KeyPressComponent {
  lastKey = signal('');
  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    this.lastKey.set(e.key);
  }
}`, feedback_correct: "✅ HostListener keydown.", feedback_partial: "e.key.", feedback_wrong: "HostListener", expected: "@HostListener('document:keydown') and lastKey.set(e.key)" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "In onKey, if (e.key === 'Escape') call a method handleEscape() that sets a signal escaped = signal(0) and escaped.update(c => c + 1). Show {{ escaped() }} in template.", answer_keywords: ["Escape", "escaped", "update"], seed_code: `import { Component, signal, HostListener } from '@angular/core';

@Component({
  selector: 'app-key-press',
  standalone: true,
  template: \`<p>Last key: {{ lastKey() }} Escapes: {{ escaped() }}</p>\`,
})
export class KeyPressComponent {
  lastKey = signal('');
  escaped = signal(0);
  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    this.lastKey.set(e.key);
    if (e.key === 'Escape') this.escaped.update(c => c + 1);
  }
}`, feedback_correct: "✅ Escape handling.", feedback_partial: "e.key === 'Escape'.", feedback_wrong: "Escape", expected: "if (e.key === 'Escape') escaped.update(c => c + 1)" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Add an input with (keydown.enter)=\"onEnter()\" and onEnter() that pushes to a list signal or logs. Export the component.", answer_keywords: ["keydown.enter", "onEnter"], seed_code: `import { Component, signal, HostListener } from '@angular/core';

@Component({
  selector: 'app-key-press',
  standalone: true,
  template: \`
    <p>Last key: {{ lastKey() }} Escapes: {{ escaped() }}</p>
    <input (keydown.enter)="onEnter()" placeholder="Press Enter" />
  \`,
})
export class KeyPressComponent {
  lastKey = signal('');
  escaped = signal(0);
  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    this.lastKey.set(e.key);
    if (e.key === 'Escape') this.escaped.update(c => c + 1);
  }
  onEnter() { console.log('Enter pressed'); }
}`, feedback_correct: "✅ useKeyPress (Angular) complete.", feedback_partial: "keydown.enter.", feedback_wrong: "Export", expected: "(keydown.enter)=\"onEnter()\" and export" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 38, title: TITLE, shortName: "A — KEY PRESS" });
