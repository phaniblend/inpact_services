import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #4 (Angular)", title: "Multiple State Variables", body: "A profile form with two inputs — name and age. Each has its own signal. Changing one does not affect the other. Display: Hello, {{ name() }}! You are {{ age() }} years old.", usecase: "Angular components often use multiple signals for form fields — each independent." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Use two signals: name = signal(''), age = signal('')", "Two inputs with [value] and (input) handlers", "Two handler methods that call name.set() and age.set()", "Live paragraph with both {{ name() }} and {{ age() }}"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Declare name = signal('') and age = signal(''). Both inputs start empty.", answer_keywords: ["name", "age", "signal", "empty"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-card',
  standalone: true,
  imports: [CommonModule],
  template: \`<!-- Step 1: add template -->\`,
})
export class ProfileCardComponent {
  // Step 1: name = signal(''), age = signal('')
  name = signal('');
  age = signal('');
}`, feedback_correct: "✅ Two signals declared.", feedback_partial: "Two signal calls.", feedback_wrong: "name = signal(''); age = signal('')", expected: "name = signal(''); age = signal('')" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add two handler methods: onNameInput(e) { this.name.set((e.target as HTMLInputElement).value); } and onAgeInput(e) { this.age.set((e.target as HTMLInputElement).value); }. Add two inputs in template with [value] and (input) wired to each.", answer_keywords: ["onNameInput", "onAgeInput", "set", "input"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-card',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <input [value]="name()" (input)="onNameInput($event)" placeholder="Your name" />
    <input [value]="age()" (input)="onAgeInput($event)" placeholder="Your age" />
    <p>Hello, {{ name() }}! You are {{ age() }} years old.</p>
  \`,
})
export class ProfileCardComponent {
  name = signal('');
  age = signal('');
  onNameInput(e: Event) { this.name.set((e.target as HTMLInputElement).value); }
  onAgeInput(e: Event) { this.age.set((e.target as HTMLInputElement).value); }
}`, feedback_correct: "✅ Two controlled inputs.", feedback_partial: "Handlers and inputs.", feedback_wrong: "Two (input) handlers and two [value]", expected: "Two inputs with [value] and (input) and two methods calling .set()." },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Add paragraph: Hello, {{ name() }}! You are {{ age() }} years old. Export the component.", answer_keywords: ["name()", "age()", "paragraph"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-card',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <input [value]="name()" (input)="onNameInput($event)" placeholder="Your name" />
    <input [value]="age()" (input)="onAgeInput($event)" placeholder="Your age" />
    <p>Hello, {{ name() }}! You are {{ age() }} years old.</p>
  \`,
})
export class ProfileCardComponent {
  name = signal('');
  age = signal('');
  onNameInput(e: Event) { this.name.set((e.target as HTMLInputElement).value); }
  onAgeInput(e: Event) { this.age.set((e.target as HTMLInputElement).value); }
}`, feedback_correct: "✅ Multiple State (Angular) complete.", feedback_partial: "Paragraph and export.", feedback_wrong: "{{ name() }} and {{ age() }}", expected: "<p>Hello, {{ name() }}! You are {{ age() }} years old.</p>" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 4, title: "Multiple State Variables (Angular)", shortName: "A — MULTIPLE STATE" });
