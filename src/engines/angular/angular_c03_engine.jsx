import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #3 (Angular)", title: "Controlled Input", body: "A text input and a paragraph below. As the user types, the paragraph updates in real time. Use a signal for the text value and two-way binding or [value] + (input) to keep it controlled.", usecase: "Every search box and live preview in Angular uses signals or NgModel with reactive updates." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Use signal('') for text state", "Template: [value]=\"text()\" and (input) handler", "Handler: text.set($event.target.value)", "Paragraph showing {{ text() }}"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a standalone component with text = signal(''). Import Component, signal, CommonModule.", answer_keywords: ["signal", "text", "empty", "component"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-controlled-input',
  standalone: true,
  imports: [CommonModule],
  template: \`<!-- Step 1: add template -->\`,
})
export class ControlledInputComponent {
  // Step 1: text = signal('')
}`, feedback_correct: "✅ text = signal('') declared.", feedback_partial: "signal and Component.", feedback_wrong: "text = signal('')", expected: "text = signal('') in the class." },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add template: an input with [value]=\"text()\" and (input)=\"onInput($event)\". In the class add onInput(e: Event) { this.text.set((e.target as HTMLInputElement).value); }", answer_keywords: ["value", "input", "text()", "set"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-controlled-input',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <input [value]="text()" (input)="onInput($event)" />
    <p>You typed: {{ text() }}</p>
  \`,
})
export class ControlledInputComponent {
  text = signal('');
  onInput(e: Event) { this.text.set((e.target as HTMLInputElement).value); }
}`, feedback_correct: "✅ Controlled input wired.", feedback_partial: "[value] and (input).", feedback_wrong: "[value] and (input) with text.set()", expected: "input [value]=\"text()\" (input)=\"onInput($event)\" and onInput that calls text.set()." },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Add a paragraph below the input: You typed: {{ text() }}. Export the component.", answer_keywords: ["text()", "paragraph", "template"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-controlled-input',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <input [value]="text()" (input)="onInput($event)" />
    <p>You typed: {{ text() }}</p>
  \`,
})
export class ControlledInputComponent {
  text = signal('');
  onInput(e: Event) { this.text.set((e.target as HTMLInputElement).value); }
}`, feedback_correct: "✅ Controlled Input (Angular) complete.", feedback_partial: "Paragraph and export.", feedback_wrong: "{{ text() }}", expected: "<p>You typed: {{ text() }}</p>" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 3, title: "Controlled Input (Angular)", shortName: "A — CONTROLLED INPUT" });
