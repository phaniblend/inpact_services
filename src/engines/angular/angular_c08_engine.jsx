import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #8 (Angular)", title: "Forms & Validation", body: "Build a simple form with validation. Use Angular Reactive Forms: FormBuilder, FormGroup, Validators. Show validation errors when a field is touched and invalid.", usecase: "Reactive forms and Validators are the standard way to handle forms and validation in Angular." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Use ReactiveFormsModule and FormBuilder", "Create a FormGroup with FormControl and Validators.required", "Bind form with [formGroup] and formControlName", "Display errors when control invalid and touched"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Import ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators. In constructor inject FormBuilder and create a form with one control (e.g. name) with Validators.required.", answer_keywords: ["FormBuilder", "FormGroup", "Validators"], seed_code: `import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: \`<!-- Step 2: bind form -->\`,
})
export class FormsValidationComponent {
  private fb = inject(FormBuilder);
  form = this.fb.group({ name: ['', Validators.required] });
}`, feedback_correct: "✅ FormGroup with Validators.", feedback_partial: "FormBuilder and group.", feedback_wrong: "fb.group({ name: ['', Validators.required] })", expected: "FormBuilder and form = fb.group({ name: ['', Validators.required] })" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "In the template add a form with [formGroup]=\"form\" and an input with formControlName=\"name\".", answer_keywords: ["formGroup", "formControlName", "input"], seed_code: `import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: \`
    <form [formGroup]="form">
      <input formControlName="name" placeholder="Name" />
      <span *ngIf="form.get('name')?.invalid && form.get('name')?.touched">Required</span>
    </form>
  \`,
})
export class FormsValidationComponent {
  private fb = inject(FormBuilder);
  form = this.fb.group({ name: ['', Validators.required] });
}`, feedback_correct: "✅ Form bound.", feedback_partial: "[formGroup] and formControlName.", feedback_wrong: "[formGroup] and formControlName", expected: "form [formGroup]=\"form\", input formControlName=\"name\"" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Show a validation message when form.get('name') is invalid and touched. Use *ngIf and CommonModule. Export the component.", answer_keywords: ["invalid", "touched", "ngIf"], seed_code: `import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: \`
    <form [formGroup]="form">
      <input formControlName="name" placeholder="Name" />
      <span *ngIf="form.get('name')?.invalid && form.get('name')?.touched">Required</span>
    </form>
  \`,
})
export class FormsValidationComponent {
  private fb = inject(FormBuilder);
  form = this.fb.group({ name: ['', Validators.required] });
}`, feedback_correct: "✅ Forms & Validation (Angular) complete.", feedback_partial: "Error message.", feedback_wrong: "invalid && touched", expected: "*ngIf=\"form.get('name')?.invalid && form.get('name')?.touched\"" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 8, title: "Forms & Validation (Angular)", shortName: "A — FORMS" });
