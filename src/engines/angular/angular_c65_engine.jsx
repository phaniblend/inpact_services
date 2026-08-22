import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Generic List<T> (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #65 (Angular)", title: TITLE, body: "Create a reusable list component that accepts a generic type T: @Input() items: T[] and @Input() trackBy or a template for rendering each item using ng-template with TemplateRef so the parent can define how each T is displayed.", usecase: "Angular generic components use TypeScript generics and TemplateRef for flexible list rendering." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Component: @Input() items: T[] = []; use *ngFor=\"let item of items\"", "For custom row: @Input() itemTemplate!: TemplateRef<{ $implicit: T }>; *ngTemplateOutlet=\"itemTemplate; context: { $implicit: item }\"", "Or accept a key function @Input() keyFn: (item: T) => string for trackBy", "Declare component as ListComponent<T> or use generic in @Input typings"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create GenericListComponent with @Input() items: unknown[] = []. Template: *ngFor=\"let item of items\" and display {{ item }} (or item | json).", answer_keywords: ["Input", "items", "ngFor"], seed_code: `import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-generic-list',
  standalone: true,
  imports: [CommonModule],
  template: \`<div *ngFor="let item of items">{{ item | json }}</div>\`,
})
export class GenericListComponent {
  @Input() items: unknown[] = [];
}`, feedback_correct: "✅ Generic list with items.", feedback_partial: "*ngFor.", feedback_wrong: "items", expected: "@Input() items and *ngFor" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add generic: GenericListComponent<T> and @Input() items: T[] = []. Use trackBy: trackByIndex (i: number) { return i; } in *ngFor.", answer_keywords: ["T", "trackBy"], seed_code: `import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-generic-list',
  standalone: true,
  imports: [CommonModule],
  template: \`<div *ngFor="let item of items; trackBy: trackByIndex">{{ item | json }}</div>\`,
})
export class GenericListComponent<T> {
  @Input() items: T[] = [];
  trackByIndex = (i: number) => i;
}`, feedback_correct: "✅ Generic T and trackBy.", feedback_partial: "GenericListComponent<T>.", feedback_wrong: "trackByIndex", expected: "Component<T> and trackBy" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Add @Input() itemTemplate?: TemplateRef<{ $implicit: T }>. When present use *ngTemplateOutlet=\"itemTemplate; context: { $implicit: item }\"; else default to {{ item | json }. Export the component.", answer_keywords: ["TemplateRef", "ngTemplateOutlet", "export"], seed_code: `import { Component, Input, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-generic-list',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <ng-container *ngFor="let item of items; trackBy: trackByIndex">
      <ng-container *ngIf="itemTemplate; else def" *ngTemplateOutlet="itemTemplate; context: { $implicit: item }"></ng-container>
      <ng-template #def>{{ item | json }}</ng-template>
    </ng-container>
  \`,
})
export class GenericListComponent<T> {
  @Input() items: T[] = [];
  @Input() itemTemplate?: TemplateRef<{ $implicit: T }>;
  trackByIndex = (i: number) => i;
}`, feedback_correct: "✅ Generic List<T> (Angular) complete.", feedback_partial: "itemTemplate.", feedback_wrong: "Export", expected: "TemplateRef and ngTemplateOutlet" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 65, title: TITLE, shortName: "A — GENERIC LIST" });
