import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Form Library from Scratch (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #83 (Angular)", title: TITLE, body: "Build a minimal form abstraction in Angular: a FormGroup or a custom class that holds signals for value, touched, errors and methods setValue, validate; wrap inputs with a directive that binds to the field.", usecase: "Angular ReactiveFormsModule or custom signal-based form state replicates a minimal form library." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["FormField: value = signal(''); touched = signal(false); errors = signal<string[]>([]); setValue(v); markTouched()", "Directive formField that injects the field and binds [value] and (blur) to markTouched", "Or use FormGroup/FormControl and custom wrapper component", "Submit: read form value and validate"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a simple FormField class or object: value = signal(''); touched = signal(false); setValue(v: string) { this.value.set(v); }; markTouched() { this.touched.set(true); }. Use it in a component.", answer_keywords: ["FormField", "value", "setValue", "markTouched"], seed_code: `import { signal } from '@angular/core';

export class FormField {
  value = signal('');
  touched = signal(false);
  setValue(v: string) { this.value.set(v); }
  markTouched() { this.touched.set(true); }
}

// In component:
// field = new FormField();
// template: <input [value]="field.value()" (input)="field.setValue($any($event.target).value)" (blur)="field.markTouched()" />`, feedback_correct: "✅ FormField with signals.", feedback_partial: "value signal.", feedback_wrong: "FormField", expected: "FormField with value, touched, setValue, markTouched" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add errors = signal<string[]>([]). validate() { const v = this.value(); const errs = []; if (v.length < 2) errs.push('Too short'); this.errors.set(errs); return errs.length === 0; }. Call validate on submit.", answer_keywords: ["errors", "validate", "submit"], seed_code: `import { Component, signal } from '@angular/core';

export class FormField {
  value = signal('');
  touched = signal(false);
  errors = signal<string[]>([]);
  setValue(v: string) { this.value.set(v); }
  markTouched() { this.touched.set(true); }
  validate(): boolean {
    const v = this.value();
    const errs = v.length < 2 ? ['Too short'] : [];
    this.errors.set(errs);
    return errs.length === 0;
  }
}

@Component({
  selector: 'app-form-demo',
  standalone: true,
  template: \`<input [value]="field.value()" (input)="field.setValue($any($event.target).value)" />\`,
})
export class FormDemoComponent {
  field = new FormField();
}`, feedback_correct: "✅ validate and errors.", feedback_partial: "errors.set.", feedback_wrong: "validate", expected: "validate() and errors signal" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Template: show field.errors() under the input and a Submit button that calls field.validate() and if true submits. Export the component and FormField.", answer_keywords: ["errors()", "Submit", "export"], seed_code: `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormField } from './form-field';

@Component({
  selector: 'app-form-demo',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <input [value]="field.value()" (input)="field.setValue($any($event.target).value)" (blur)="field.markTouched()" />
    <p *ngIf="field.errors().length">{{ field.errors() }}</p>
    <button (click)="onSubmit()">Submit</button>
  \`,
})
export class FormDemoComponent {
  field = new FormField();
  onSubmit() {
    if (this.field.validate()) console.log('Submit', this.field.value());
  }
}`, feedback_correct: "✅ Form Library from Scratch (Angular) complete.", feedback_partial: "onSubmit.", feedback_wrong: "Export", expected: "errors in template and onSubmit" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 83, title: TITLE, shortName: "A — FORM LIBRARY" });
