import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "useImperativeHandle (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #71 (Angular)", title: TITLE, body: "Expose a child component's methods or state to the parent via a template ref: use @ViewChild to get the child instance and call its public methods, or use a custom export (exportAs) so the parent can get a reference and call focus() or other APIs.", usecase: "Angular ViewChild and child's public API replicate React useImperativeHandle for parent-callable child methods." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Child defines public focus() or submit() method", "Parent: @ViewChild(ChildComp) child!: ChildComp; then this.child.focus()", "Or use exportAs: 'inputRef' and #ref=\"inputRef\"; parent gets ref and calls ref.focus()", "Signal query: child = viewChild.required(ChildComp); child()?.focus()"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create InputComponent with a template <input #input> and public focus() { this.inputRef.nativeElement.focus(); }. Use @ViewChild('input') inputRef!: ElementRef<HTMLInputElement>.", answer_keywords: ["focus", "ViewChild", "ElementRef"], seed_code: `import { Component, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-input',
  standalone: true,
  template: \`<input #input placeholder="Focus me" />\`,
})
export class InputComponent {
  @ViewChild('input') inputRef!: ElementRef<HTMLInputElement>;
  focus() {
    this.inputRef?.nativeElement.focus();
  }
}`, feedback_correct: "✅ Child with focus().", feedback_partial: "focus().", feedback_wrong: "inputRef", expected: "public focus() and ViewChild input" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Parent component: template <app-input #inputComp></app-input> and <button (click)=\"inputComp.focus()\">Focus input</button>. Use @ViewChild('inputComp') inputComp!: InputComponent.", answer_keywords: ["ViewChild", "inputComp", "focus"], seed_code: `import { Component, ViewChild } from '@angular/core';
import { InputComponent } from './input.component';

@Component({
  selector: 'app-parent',
  standalone: true,
  imports: [InputComponent],
  template: \`
    <app-input #inputComp></app-input>
    <button (click)="inputComp.focus()">Focus input</button>
  \`,
})
export class ParentComponent {
  @ViewChild('inputComp') inputComp!: InputComponent;
}`, feedback_correct: "✅ Parent calls child.focus().", feedback_partial: "inputComp.focus().", feedback_wrong: "ViewChild inputComp", expected: "@ViewChild and (click)=\"inputComp.focus()\"" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Add exportAs: 'inputRef' to InputComponent. Parent can then use <app-input #ref=\"inputRef\"> and ref.focus(). Export both components.", answer_keywords: ["exportAs", "inputRef", "export"], seed_code: `import { Component, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-input',
  standalone: true,
  exportAs: 'inputRef',
  template: \`<input #input placeholder="Focus me" />\`,
})
export class InputComponent {
  @ViewChild('input') inputRef!: ElementRef<HTMLInputElement>;
  focus() {
    this.inputRef?.nativeElement.focus();
  }
}`, feedback_correct: "✅ useImperativeHandle (Angular) complete.", feedback_partial: "exportAs.", feedback_wrong: "Export", expected: "exportAs: 'inputRef' and export" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 71, title: TITLE, shortName: "A — IMPERATIVE HANDLE" });
