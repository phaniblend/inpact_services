import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Accordion (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #29 (Angular)", title: TITLE, body: "Build an accordion with one or multiple panels; each panel has a header (click) to toggle *ngIf for the content; use signals to track which panel(s) are open.", usecase: "Angular *ngIf and signals drive expand/collapse state for accordion panels." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Panels array or list; each has title and content; open state as signal or index", "Header (click) toggles open state; *ngIf=\"open()\" or *ngIf=\"expanded === index\" for content", "Optional: single open (only one expanded at a time) by storing expandedIndex", "Use *ngFor for multiple panels"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with panels = signal([{ title: 'A', content: 'Content A' }, { title: 'B', content: 'Content B' }]) and expandedIndex = signal(0). Template: *ngFor with index; show panel title and *ngIf=\"expandedIndex() === i\" for content.", answer_keywords: ["ngFor", "ngIf", "expandedIndex"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accordion',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div *ngFor="let panel of panels(); let i = index">
      <button (click)="expandedIndex.set(i)">{{ panel.title }}</button>
      <div *ngIf="expandedIndex() === i">{{ panel.content }}</div>
    </div>
  \`,
})
export class AccordionComponent {
  panels = signal([{ title: 'A', content: 'Content A' }, { title: 'B', content: 'Content B' }]);
  expandedIndex = signal(0);
}`, feedback_correct: "✅ Accordion panels.", feedback_partial: "expandedIndex and *ngIf.", feedback_wrong: "expandedIndex() === i", expected: "*ngIf=\"expandedIndex() === i\"" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Toggle: when clicking the same header again, close the panel. Use (click)=\"expandedIndex.set(expandedIndex() === i ? -1 : i)\" so -1 means none open.", answer_keywords: ["set", "toggle", "-1"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accordion',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div *ngFor="let panel of panels(); let i = index">
      <button (click)="expandedIndex.set(expandedIndex() === i ? -1 : i)">{{ panel.title }}</button>
      <div *ngIf="expandedIndex() === i">{{ panel.content }}</div>
    </div>
  \`,
})
export class AccordionComponent {
  panels = signal([{ title: 'A', content: 'Content A' }, { title: 'B', content: 'Content B' }]);
  expandedIndex = signal(-1);
}`, feedback_correct: "✅ Toggle open/close.", feedback_partial: "expandedIndex.set.", feedback_wrong: "toggle logic", expected: "expandedIndex.set(expandedIndex() === i ? -1 : i)" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Add [class.expanded]=\"expandedIndex() === i\" on the header button for styling. Export the component.", answer_keywords: ["class.expanded", "export"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accordion',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div *ngFor="let panel of panels(); let i = index">
      <button (click)="expandedIndex.set(expandedIndex() === i ? -1 : i)" [class.expanded]="expandedIndex() === i">{{ panel.title }}</button>
      <div *ngIf="expandedIndex() === i">{{ panel.content }}</div>
    </div>
  \`,
})
export class AccordionComponent {
  panels = signal([{ title: 'A', content: 'Content A' }, { title: 'B', content: 'Content B' }]);
  expandedIndex = signal(-1);
}`, feedback_correct: "✅ Accordion (Angular) complete.", feedback_partial: "class.expanded.", feedback_wrong: "Export", expected: "[class.expanded] and export" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 29, title: TITLE, shortName: "A — ACCORDION" });
