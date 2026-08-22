import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Undo/Redo (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #82 (Angular)", title: TITLE, body: "Implement undo/redo in Angular: keep a history array of states (signals or snapshots), current index, and methods undo() (decrement index, set state from history) and redo() (increment index).", usecase: "Angular signals and a history array with index provide undo/redo for form or list state." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["history = signal<State[]>([]); index = signal(0); state = computed(() => history()[index()] ?? initial)", "On change: push new state to history (slice(0, index()+1) then push), index.set(history().length - 1)", "undo(): if index() > 0 index.update(i => i - 1); redo(): if index() < history().length - 1 index.update(i => i + 1)", "Can use signal for current state and sync from history[index()]"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with history = signal<string[]>(['']); index = signal(0). current = computed(() => this.history()[this.index()] ?? ''). Add undo() { if (this.index() > 0) this.index.update(i => i - 1); } and redo() { if (this.index() < this.history().length - 1) this.index.update(i => i + 1); }.", answer_keywords: ["history", "index", "undo", "redo"], seed_code: `import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-undo-redo',
  standalone: true,
  template: \`<p>{{ current() }}</p>\`,
})
export class UndoRedoComponent {
  history = signal<string[]>(['']);
  index = signal(0);
  current = computed(() => this.history()[this.index()] ?? '');
  undo() { if (this.index() > 0) this.index.update(i => i - 1); }
  redo() { if (this.index() < this.history().length - 1) this.index.update(i => i + 1); }
}`, feedback_correct: "✅ history, index, undo, redo.", feedback_partial: "computed current.", feedback_wrong: "undo", expected: "history, index, current computed, undo/redo" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add push(value: string): trim history to index+1, push value, set index to new length - 1. history.update(h => [...h.slice(0, this.index() + 1), value]); index.set(this.history().length - 1);", answer_keywords: ["push", "slice", "history.update"], seed_code: `import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-undo-redo',
  standalone: true,
  template: \`<p>{{ current() }}</p>\`,
})
export class UndoRedoComponent {
  history = signal<string[]>(['']);
  index = signal(0);
  current = computed(() => this.history()[this.index()] ?? '');
  push(value: string) {
    this.history.update(h => [...h.slice(0, this.index() + 1), value]);
    this.index.set(this.history().length - 1);
  }
  undo() { if (this.index() > 0) this.index.update(i => i - 1); }
  redo() { if (this.index() < this.history().length - 1) this.index.update(i => i + 1); }
}`, feedback_correct: "✅ push to history.", feedback_partial: "push.", feedback_wrong: "history.update", expected: "push that slices and appends" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Add input (input)=\"push($any($event.target).value)\" and buttons Undo and Redo. Disable Undo when index() === 0 and Redo when index() === history().length - 1. Export the component.", answer_keywords: ["disabled", "Undo", "Redo", "export"], seed_code: `import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-undo-redo',
  standalone: true,
  template: \`
    <input [value]="current()" (input)="push($any($event.target).value)" />
    <button [disabled]="index() === 0" (click)="undo()">Undo</button>
    <button [disabled]="index() >= history().length - 1" (click)="redo()">Redo</button>
  \`,
})
export class UndoRedoComponent {
  history = signal<string[]>(['']);
  index = signal(0);
  current = computed(() => this.history()[this.index()] ?? '');
  push(value: string) {
    this.history.update(h => [...h.slice(0, this.index() + 1), value]);
    this.index.set(this.history().length - 1);
  }
  undo() { if (this.index() > 0) this.index.update(i => i - 1); }
  redo() { if (this.index() < this.history().length - 1) this.index.update(i => i + 1); }
}`, feedback_correct: "✅ Undo/Redo (Angular) complete.", feedback_partial: "disabled.", feedback_wrong: "Export", expected: "input, Undo/Redo buttons and disabled" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 82, title: TITLE, shortName: "A — UNDO REDO" });
