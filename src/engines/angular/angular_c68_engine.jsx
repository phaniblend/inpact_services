import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Event Typing (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #68 (Angular)", title: TITLE, body: "Type DOM and custom events in Angular: use (click)=\"onClick($event)\" with $event typed as MouseEvent, (input)=\"onInput($event)\" with Event or InputEvent, and EventEmitter<Payload> for @Output() with a specific payload type.", usecase: "Angular templates pass $event; type handler params as MouseEvent, KeyboardEvent, etc., and EventEmitter<T> for outputs." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["(click)=\"onClick($event)\" and onClick(e: MouseEvent) { }", "(keydown)=\"onKey($event)\" and onKey(e: KeyboardEvent) { e.key }", "(input)=\"onInput($event)\" and onInput(e: Event) { (e.target as HTMLInputElement).value }", "@Output() submit = new EventEmitter<{ id: number }>(); submit.emit({ id: 1 })"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with (click)=\"onClick($event)\" and method onClick(e: MouseEvent) { console.log(e.clientX, e.clientY); }. Type the parameter as MouseEvent.", answer_keywords: ["MouseEvent", "onClick", "click"], seed_code: `import { Component } from '@angular/core';

@Component({
  selector: 'app-event-typing',
  standalone: true,
  template: \`<button (click)="onClick($event)">Click</button>\`,
})
export class EventTypingComponent {
  onClick(e: MouseEvent) {
    console.log(e.clientX, e.clientY);
  }
}`, feedback_correct: "✅ MouseEvent handler.", feedback_partial: "onClick.", feedback_wrong: "MouseEvent", expected: "onClick(e: MouseEvent)" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add (keydown)=\"onKey($event)\" and onKey(e: KeyboardEvent) { console.log(e.key); }. Add (input)=\"onInput($event)\" and onInput(e: Event) { const v = (e.target as HTMLInputElement).value; }.", answer_keywords: ["KeyboardEvent", "InputEvent", "target"], seed_code: `import { Component } from '@angular/core';

@Component({
  selector: 'app-event-typing',
  standalone: true,
  template: \`
    <button (click)="onClick($event)">Click</button>
    <input (keydown)="onKey($event)" (input)="onInput($event)" />
  \`,
})
export class EventTypingComponent {
  onClick(e: MouseEvent) { console.log(e.clientX); }
  onKey(e: KeyboardEvent) { console.log(e.key); }
  onInput(e: Event) { console.log((e.target as HTMLInputElement).value); }
}`, feedback_correct: "✅ Keyboard and input typing.", feedback_partial: "e.target as.", feedback_wrong: "HTMLInputElement", expected: "KeyboardEvent and (e.target as HTMLInputElement)" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Add @Output() submit = new EventEmitter<{ value: string }>(). In a method call this.submit.emit({ value: this.inputValue }). Parent type: (submit)=\"onSubmit($event)\" with onSubmit(payload: { value: string }). Export the component.", answer_keywords: ["EventEmitter", "emit", "export"], seed_code: `import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-event-typing',
  standalone: true,
  template: \`
    <button (click)="onClick($event)">Click</button>
    <input (input)="onInput($event)" />
    <button (click)="submit.emit({ value: 'done' })">Submit</button>
  \`,
})
export class EventTypingComponent {
  onClick(e: MouseEvent) {}
  onInput(e: Event) { (e.target as HTMLInputElement).value; }
  @Output() submit = new EventEmitter<{ value: string }>();
}`, feedback_correct: "✅ Event Typing (Angular) complete.", feedback_partial: "EventEmitter.", feedback_wrong: "Export", expected: "EventEmitter<{ value: string }> and emit" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 68, title: TITLE, shortName: "A — EVENT TYPING" });
