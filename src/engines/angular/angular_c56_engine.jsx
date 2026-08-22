import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Render Props (MouseTracker) (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #56 (Angular)", title: TITLE, body: "Expose component state (e.g. mouse x, y) to the template via a template slot: use ng-template with a template reference and pass data as context (e.g. $implicit or named) so the parent can render with that data.", usecase: "Angular content projection with ng-template and NgTemplateOutlet or custom template input replicates render props." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Component has @ContentChild(TemplateRef) or @Input() templateRef", "Or @Input() template: TemplateRef<{ $implicit: { x: number; y: number } }>", "Track mouse: HostListener('mousemove', ['$event']) and set position = signal({ x: e.clientX, y: e.clientY })", "Template: <ng-container *ngTemplateOutlet=\"template; context: { $implicit: position() }\"></ng-container>"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create MouseTrackerComponent with position = signal({ x: 0, y: 0 }). Add @HostListener('document:mousemove', ['$event']) onMove(e: MouseEvent) { this.position.set({ x: e.clientX, y: e.clientY }); }.", answer_keywords: ["HostListener", "mousemove", "position"], seed_code: `import { Component, signal, HostListener } from '@angular/core';

@Component({
  selector: 'app-mouse-tracker',
  standalone: true,
  template: \`<p>{{ position().x }}, {{ position().y }}</p>\`,
})
export class MouseTrackerComponent {
  position = signal({ x: 0, y: 0 });
  @HostListener('document:mousemove', ['$event'])
  onMove(e: MouseEvent) {
    this.position.set({ x: e.clientX, y: e.clientY });
  }
}`, feedback_correct: "✅ Mouse position signal.", feedback_partial: "mousemove.", feedback_wrong: "position.set", expected: "HostListener mousemove and position.set" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add @Input() contentTemplate!: TemplateRef<{ $implicit: { x: number; y: number } }>. In template use <ng-container *ngTemplateOutlet=\"contentTemplate; context: { $implicit: position() }\"></ng-container>. Import CommonModule.", answer_keywords: ["TemplateRef", "ngTemplateOutlet", "context"], seed_code: `import { Component, signal, HostListener, Input, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mouse-tracker',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <ng-container *ngIf="contentTemplate" *ngTemplateOutlet="contentTemplate; context: { $implicit: position() }"></ng-container>
  \`,
})
export class MouseTrackerComponent {
  @Input() contentTemplate!: TemplateRef<{ $implicit: { x: number; y: number } }>;
  position = signal({ x: 0, y: 0 });
  @HostListener('document:mousemove', ['$event'])
  onMove(e: MouseEvent) { this.position.set({ x: e.clientX, y: e.clientY }); }
}`, feedback_correct: "✅ TemplateRef and outlet.", feedback_partial: "ngTemplateOutlet.", feedback_wrong: "contentTemplate", expected: "*ngTemplateOutlet and context: { $implicit: position() }" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Usage: <app-mouse-tracker [contentTemplate]=\"t\"></app-mouse-tracker> and <ng-template #t let-pos>{{ pos.x }}, {{ pos.y }}</ng-template>. Export MouseTrackerComponent.", answer_keywords: ["ng-template", "let-pos", "export"], seed_code: `import { Component, signal, HostListener, Input, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mouse-tracker',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <ng-container *ngIf="contentTemplate" *ngTemplateOutlet="contentTemplate; context: { $implicit: position() }"></ng-container>
  \`,
})
export class MouseTrackerComponent {
  @Input() contentTemplate!: TemplateRef<{ $implicit: { x: number; y: number } }>;
  position = signal({ x: 0, y: 0 });
  @HostListener('document:mousemove', ['$event'])
  onMove(e: MouseEvent) { this.position.set({ x: e.clientX, y: e.clientY }); }
}`, feedback_correct: "✅ Render Props (MouseTracker) (Angular) complete.", feedback_partial: "let-pos.", feedback_wrong: "Export", expected: "Template with let-pos and export" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 56, title: TITLE, shortName: "A — MOUSE TRACKER" });
