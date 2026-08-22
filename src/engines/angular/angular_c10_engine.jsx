import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #10 (Angular)", title: "Multiple State Vars", body: "Manage several independent signals in one component (e.g. firstName, lastName, email). Each has its own input and updates independently. Display a summary line combining them.", usecase: "Forms and dashboards often use multiple signals — same pattern as Lesson 4 with more fields." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Declare 3+ signals (e.g. firstName, lastName, email)", "One input per signal with [value] and (input)", "One handler per field or a generic handler with a key", "Summary paragraph with {{ firstName() }} {{ lastName() }}"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with firstName = signal(''), lastName = signal(''), email = signal('').", answer_keywords: ["signal", "firstName", "lastName", "email"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-multi-state',
  standalone: true,
  imports: [CommonModule],
  template: \`<!-- Step 2 -->\`,
})
export class MultipleStateVarsComponent {
  firstName = signal('');
  lastName = signal('');
  email = signal('');
}`, feedback_correct: "✅ Three signals.", feedback_partial: "Multiple signals.", feedback_wrong: "firstName, lastName, email signals", expected: "firstName = signal(''); lastName = signal(''); email = signal('')" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add three inputs bound to each signal with [value] and (input). Use separate methods or one: update(field, value) that sets the right signal.", answer_keywords: ["value", "input", "set"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-multi-state',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <input [value]="firstName()" (input)="firstName.set($any($event.target).value)" placeholder="First" />
    <input [value]="lastName()" (input)="lastName.set($any($event.target).value)" placeholder="Last" />
    <input [value]="email()" (input)="email.set($any($event.target).value)" placeholder="Email" />
    <p>{{ firstName() }} {{ lastName() }} — {{ email() }}</p>
  \`,
})
export class MultipleStateVarsComponent {
  firstName = signal('');
  lastName = signal('');
  email = signal('');
}`, feedback_correct: "✅ Inputs wired.", feedback_partial: "[value] and (input).", feedback_wrong: "Three [value] and (input)", expected: "Three inputs with [value] and (input) calling .set()" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Add a summary line: {{ firstName() }} {{ lastName() }} — {{ email() }}. Export the component.", answer_keywords: ["firstName()", "lastName()", "email()"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-multi-state',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <input [value]="firstName()" (input)="firstName.set($any($event.target).value)" placeholder="First" />
    <input [value]="lastName()" (input)="lastName.set($any($event.target).value)" placeholder="Last" />
    <input [value]="email()" (input)="email.set($any($event.target).value)" placeholder="Email" />
    <p>{{ firstName() }} {{ lastName() }} — {{ email() }}</p>
  \`,
})
export class MultipleStateVarsComponent {
  firstName = signal('');
  lastName = signal('');
  email = signal('');
}`, feedback_correct: "✅ Multiple State Vars (Angular) complete.", feedback_partial: "Summary paragraph.", feedback_wrong: "{{ firstName() }} {{ lastName() }}", expected: "p with {{ firstName() }} {{ lastName() }} — {{ email() }}" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 10, title: "Multiple State Vars (Angular)", shortName: "A — MULTI STATE" });
