import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "useRef Typing (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #67 (Angular)", title: TITLE, body: "Type template references and ElementRef in Angular: use #inputRef and ElementRef<HTMLInputElement>, or ViewChild query with read: ElementRef and type the result so you get correct nativeElement typings.", usecase: "Angular ElementRef<T> and ViewChild with read: ElementRef give typed refs like React useRef." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Template: <input #inputRef>; in class @ViewChild('inputRef') inputRef!: ElementRef<HTMLInputElement>", "Use this.inputRef.nativeElement.value or .focus() with full type safety", "For components: @ViewChild(MyComp) comp!: MyComp", "Signal query: inputRef = viewChild.required<ElementRef<HTMLInputElement>>('inputRef')"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with template <input #inputRef placeholder=\"Type\">. Use @ViewChild('inputRef') inputRef!: ElementRef<HTMLInputElement> and in a method call this.inputRef.nativeElement.focus().", answer_keywords: ["ViewChild", "ElementRef", "nativeElement"], seed_code: `import { Component, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-ref-typing',
  standalone: true,
  template: \`<input #inputRef placeholder="Type" />\`,
})
export class RefTypingComponent {
  @ViewChild('inputRef') inputRef!: ElementRef<HTMLInputElement>;
  focusInput() {
    this.inputRef?.nativeElement.focus();
  }
}`, feedback_correct: "✅ ViewChild ElementRef.", feedback_partial: "ElementRef.", feedback_wrong: "inputRef", expected: "@ViewChild and ElementRef<HTMLInputElement>" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add a button (click)=\"focusInput()\". Read value in focusInput: const v = this.inputRef.nativeElement.value; console.log(v). TypeScript should know nativeElement is HTMLInputElement.", answer_keywords: ["focusInput", "value", "HTMLInputElement"], seed_code: `import { Component, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-ref-typing',
  standalone: true,
  template: \`
    <input #inputRef placeholder="Type" />
    <button (click)="focusInput()">Focus and log</button>
  \`,
})
export class RefTypingComponent {
  @ViewChild('inputRef') inputRef!: ElementRef<HTMLInputElement>;
  focusInput() {
    if (this.inputRef) {
      this.inputRef.nativeElement.focus();
      console.log(this.inputRef.nativeElement.value);
    }
  }
}`, feedback_correct: "✅ Typed value access.", feedback_partial: "nativeElement.value.", feedback_wrong: "value", expected: "nativeElement.focus() and .value" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Use viewChild.required: inputRef = viewChild.required<ElementRef<HTMLInputElement>>('inputRef'). Call inputRef().nativeElement in effect or after next tick. Export the component.", answer_keywords: ["viewChild", "required", "export"], seed_code: `import { Component, viewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-ref-typing',
  standalone: true,
  template: \`
    <input #inputRef placeholder="Type" />
    <button (click)="focusInput()">Focus</button>
  \`,
})
export class RefTypingComponent {
  inputRef = viewChild.required<ElementRef<HTMLInputElement>>('inputRef');
  focusInput() {
    this.inputRef()?.nativeElement.focus();
  }
}`, feedback_correct: "✅ useRef Typing (Angular) complete.", feedback_partial: "viewChild.required.", feedback_wrong: "Export", expected: "viewChild.required<ElementRef<HTMLInputElement>>" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 67, title: TITLE, shortName: "A — REF TYPING" });
