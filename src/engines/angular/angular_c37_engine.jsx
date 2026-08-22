import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "useClickOutside (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #37 (Angular)", title: TITLE, body: "Detect clicks outside a host element using ElementRef, HostListener for document click, and check if event.target is contained in the component's nativeElement.", usecase: "Angular uses HostListener('document:click') and ElementRef to implement click-outside behavior for dropdowns and modals." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Inject ElementRef; get nativeElement", "HostListener('document:click', ['$event']) onDocumentClick(e: MouseEvent)", "If (!this.el.nativeElement.contains(e.target)) { this.clickedOutside.emit(); } or set a signal", "Or use a directive with @HostListener and @Output() for reusability"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with a template ref on a div: <div #box class=\"box\">Content</div>. Inject ElementRef. Add isOpen = signal(true).", answer_keywords: ["ElementRef", "signal", "box"], seed_code: `import { Component, signal, inject, ElementRef } from '@angular/core';

@Component({
  selector: 'app-click-outside',
  standalone: true,
  template: \`<div #box class="box">Content</div>\`,
})
export class ClickOutsideComponent {
  private el = inject(ElementRef);
  isOpen = signal(true);
}`, feedback_correct: "✅ ElementRef and signal.", feedback_partial: "ElementRef.", feedback_wrong: "ElementRef", expected: "inject(ElementRef) and isOpen signal" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add @HostListener('document:click', ['$event']) onDocumentClick(e: MouseEvent). In the method, if (!this.el.nativeElement.contains(e.target)) isOpen.set(false).", answer_keywords: ["HostListener", "document:click", "contains"], seed_code: `import { Component, signal, inject, ElementRef, HostListener } from '@angular/core';

@Component({
  selector: 'app-click-outside',
  standalone: true,
  template: \`<div class="box">Content</div>\`,
})
export class ClickOutsideComponent {
  private el = inject(ElementRef);
  isOpen = signal(true);
  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent) {
    if (!this.el.nativeElement.contains(e.target as Node)) this.isOpen.set(false);
  }
}`, feedback_correct: "✅ HostListener and contains.", feedback_partial: "document:click.", feedback_wrong: "contains", expected: "@HostListener and nativeElement.contains(e.target)" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Add a button inside the div that sets isOpen.set(true). Show/hide content with *ngIf=\"isOpen()\". Export the component.", answer_keywords: ["ngIf", "isOpen", "export"], seed_code: `import { Component, signal, inject, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-click-outside',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div class="box" *ngIf="isOpen()">
      <button (click)="isOpen.set(true)">Open</button>
      Content
    </div>
  \`,
})
export class ClickOutsideComponent {
  private el = inject(ElementRef);
  isOpen = signal(true);
  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent) {
    if (!this.el.nativeElement.contains(e.target as Node)) this.isOpen.set(false);
  }
}`, feedback_correct: "✅ useClickOutside (Angular) complete.", feedback_partial: "*ngIf.", feedback_wrong: "Export", expected: "*ngIf=\"isOpen()\" and export" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 37, title: TITLE, shortName: "A — CLICK OUTSIDE" });
