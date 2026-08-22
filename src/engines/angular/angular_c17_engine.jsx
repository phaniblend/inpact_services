import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "List Rendering (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #17 (Angular)", title: TITLE, body: "Render a list of items with *ngFor. Use trackBy when the list can be reordered or items have stable ids to improve performance.", usecase: " *ngFor and trackBy are the standard way to render lists in Angular." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["*ngFor=\"let item of items()\" on the repeated element", "Optional: trackBy function for stable identity", "Display {{ item }} or {{ item.name }} per row", "Use signal or array for the list source"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with items = signal([{ id: 1, name: 'A' }, { id: 2, name: 'B' }]). Template: *ngFor=\"let item of items()\" on a div, show {{ item.name }}.", answer_keywords: ["ngFor", "items()", "item"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div *ngFor="let item of items()">{{ item.name }}</div>
  \`,
})
export class ListRenderingComponent {
  items = signal([{ id: 1, name: 'A' }, { id: 2, name: 'B' }]);
}`, feedback_correct: "✅ *ngFor with items().", feedback_partial: "ngFor and signal.", feedback_wrong: "*ngFor=\"let item of items()\"", expected: "*ngFor=\"let item of items()\"" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add trackBy: *ngFor=\"let item of items(); trackBy: trackById\" and method trackById(index, item) { return item.id; }.", answer_keywords: ["trackBy", "trackById", "id"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div *ngFor="let item of items(); trackBy: trackById">{{ item.name }}</div>
  \`,
})
export class ListRenderingComponent {
  items = signal([{ id: 1, name: 'A' }, { id: 2, name: 'B' }]);
  trackById(index: number, item: { id: number }) { return item.id; }
}`, feedback_correct: "✅ trackBy added.", feedback_partial: "trackBy function.", feedback_wrong: "trackBy: trackById", expected: "*ngFor=\"... trackBy: trackById\" and trackById method" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Export the component. List should re-render when items() signal changes.", answer_keywords: ["export", "signal"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div *ngFor="let item of items(); trackBy: trackById">{{ item.name }}</div>
  \`,
})
export class ListRenderingComponent {
  items = signal([{ id: 1, name: 'A' }, { id: 2, name: 'B' }]);
  trackById(index: number, item: { id: number }) { return item.id; }
}`, feedback_correct: "✅ List Rendering (Angular) complete.", feedback_partial: "Export.", feedback_wrong: "Export component", expected: "Export ListRenderingComponent." },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 17, title: TITLE, shortName: "A — LIST RENDER" });
