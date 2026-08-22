import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Multi-Step Form (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #64 (Angular)", title: TITLE, body: "Build a wizard with multiple steps: currentStep signal, form state (ReactiveFormsModule or signals), and Next/Back buttons that validate and move between steps; show step content with *ngIf or *ngSwitch.", usecase: "Angular signals and ReactiveFormsModule (or FormGroup) implement multi-step forms with validation." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["currentStep = signal(1); totalSteps = 3", "Step content: *ngIf=\"currentStep() === 1\" etc. or <ng-container [ngSwitch]=\"currentStep()\">", "FormGroup or signals for each step's fields; next() validates and currentStep.update(s => s + 1)", "Submit on last step"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with currentStep = signal(1). Template: <div *ngIf=\"currentStep() === 1\">Step 1</div><div *ngIf=\"currentStep() === 2\">Step 2</div><div *ngIf=\"currentStep() === 3\">Step 3</div>. Add Next button (click)=\"currentStep.update(s => Math.min(3, s + 1))\" and Back (click)=\"currentStep.update(s => Math.max(1, s - 1))\".", answer_keywords: ["currentStep", "ngIf", "Next"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-multi-step',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div *ngIf="currentStep() === 1">Step 1</div>
    <div *ngIf="currentStep() === 2">Step 2</div>
    <div *ngIf="currentStep() === 3">Step 3</div>
    <button (click)="currentStep.update(s => Math.max(1, s - 1))">Back</button>
    <button (click)="currentStep.update(s => Math.min(3, s + 1))">Next</button>
  \`,
})
export class MultiStepFormComponent {
  currentStep = signal(1);
}`, feedback_correct: "✅ Steps and Next/Back.", feedback_partial: "currentStep.", feedback_wrong: "currentStep() === 1", expected: "currentStep signal and *ngIf per step" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add a FormGroup for step 1: name = new FormControl(''). Use ReactiveFormsModule and [formGroup] (or a single control). On Next from step 1, check name.valid and then advance.", answer_keywords: ["FormGroup", "FormControl", "ReactiveFormsModule"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-multi-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: \`
    <div *ngIf="currentStep() === 1">
      <input [formControl]="name" placeholder="Name" />
    </div>
    <div *ngIf="currentStep() === 2">Step 2</div>
    <div *ngIf="currentStep() === 3">Step 3</div>
    <button (click)="back()">Back</button>
    <button (click)="next()">Next</button>
  \`,
})
export class MultiStepFormComponent {
  currentStep = signal(1);
  name = new FormControl('');
  back() { this.currentStep.update(s => Math.max(1, s - 1)); }
  next() { this.currentStep.update(s => Math.min(3, s + 1)); }
}`, feedback_correct: "✅ FormControl and next/back.", feedback_partial: "formControl.", feedback_wrong: "FormControl", expected: "FormControl and next()/back()" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "On last step show Submit button instead of Next. Submit logs form value or emits. Export the component.", answer_keywords: ["Submit", "submit", "export"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-multi-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: \`
    <div *ngIf="currentStep() === 1"><input [formControl]="name" placeholder="Name" /></div>
    <div *ngIf="currentStep() === 2">Step 2</div>
    <div *ngIf="currentStep() === 3">Step 3</div>
    <button (click)="back()">Back</button>
    <button *ngIf="currentStep() < 3" (click)="next()">Next</button>
    <button *ngIf="currentStep() === 3" (click)="submit()">Submit</button>
  \`,
})
export class MultiStepFormComponent {
  currentStep = signal(1);
  name = new FormControl('');
  back() { this.currentStep.update(s => Math.max(1, s - 1)); }
  next() { this.currentStep.update(s => Math.min(3, s + 1)); }
  submit() { console.log({ name: this.name.value }); }
}`, feedback_correct: "✅ Multi-Step Form (Angular) complete.", feedback_partial: "Submit.", feedback_wrong: "Export", expected: "Submit button on last step and export" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 64, title: TITLE, shortName: "A — MULTI-STEP FORM" });
