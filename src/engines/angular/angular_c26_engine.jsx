import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Controlled vs Uncontrolled (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #26 (Angular)", title: TITLE, body: "Controlled: bind input value with [value] and (input) or ngModel so the component owns the value. Uncontrolled: use a template reference #ref and read ref.value in the component.", usecase: "Angular supports both FormsModule/ngModel (controlled) and template refs (uncontrolled) for inputs." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Controlled: signal or property + [value]=\"value()\" and (input)=\"value.set($any($event.target).value)\"", "Or use ngModel with FormsModule: [(ngModel)]=\"value\"", "Uncontrolled: <input #in> and in template or (click)=\"read(in.value)\"", "Choose controlled for validation and single source of truth"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a controlled input: text = signal(''). Template: <input [value]=\"text()\" (input)=\"text.set($any($event.target).value)\"> and display {{ text() }}.", answer_keywords: ["value", "input", "text.set"], seed_code: `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-controlled',
  standalone: true,
  template: \`
    <input [value]="text()" (input)="text.set($any($event.target).value)" />
    <p>{{ text() }}</p>
  \`,
})
export class ControlledComponent {
  text = signal('');
}`, feedback_correct: "✅ Controlled input.", feedback_partial: "[value] and (input).", feedback_wrong: "text.set", expected: "[value]=\"text()\" and (input)=\"text.set(...)\"" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add uncontrolled: <input #uncontrolledRef> and a button (click)=\"log(uncontrolledRef.value)\" with log(val: string) { console.log(val); }.", answer_keywords: ["#uncontrolledRef", "value", "click"], seed_code: `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-controlled',
  standalone: true,
  template: \`
    <input [value]="text()" (input)="text.set($any($event.target).value)" />
    <p>{{ text() }}</p>
    <input #uncontrolledRef />
    <button (click)="log(uncontrolledRef.value)">Log</button>
  \`,
})
export class ControlledComponent {
  text = signal('');
  log(val: string) { console.log(val); }
}`, feedback_correct: "✅ Uncontrolled ref.", feedback_partial: "#ref and .value.", feedback_wrong: "uncontrolledRef.value", expected: "#uncontrolledRef and (click)=\"log(uncontrolledRef.value)\"" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Use FormsModule: import FormsModule and [(ngModel)]=\"text\" on the first input (use a writable signal with two-way). Export the component.", answer_keywords: ["ngModel", "FormsModule"], seed_code: `import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-controlled',
  standalone: true,
  imports: [FormsModule],
  template: \`
    <input [(ngModel)]="text" />
    <p>{{ text }}</p>
  \`,
})
export class ControlledComponent {
  text = '';
}`, feedback_correct: "✅ Controlled vs Uncontrolled (Angular) complete.", feedback_partial: "ngModel.", feedback_wrong: "ngModel", expected: "FormsModule and [(ngModel)]" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 26, title: TITLE, shortName: "A — CONTROLLED" });
