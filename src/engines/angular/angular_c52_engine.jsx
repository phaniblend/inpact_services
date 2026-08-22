import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "List Virtualization (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #52 (Angular)", title: TITLE, body: "Render only visible list items using Angular CDK ScrollingModule: cdk-virtual-scroll-viewport with *cdkVirtualFor so large lists don't render all DOM nodes.", usecase: "Angular CDK virtual scroll viewport and cdkVirtualFor provide list virtualization for performance." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Import ScrollingModule; use <cdk-virtual-scroll-viewport itemSize=\"50\">", "Inside viewport: *cdkVirtualFor=\"let item of items()\"", "items() should be the data array; viewport height in px so scroll works", "Optional: use trackBy with cdkVirtualFor for stability"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with items = signal(Array.from({ length: 100 }, (_, i) => ({ id: i, name: 'Item ' + i }))). Import ScrollingModule from @angular/cdk/scrolling.", answer_keywords: ["ScrollingModule", "signal", "items"], seed_code: `import { Component, signal } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-virtual-list',
  standalone: true,
  imports: [ScrollingModule],
  template: \`<cdk-virtual-scroll-viewport itemSize="50" style="height: 200px">
    <div *cdkVirtualFor="let item of items()">{{ item.name }}</div>
  </cdk-virtual-scroll-viewport>\`,
})
export class VirtualListComponent {
  items = signal(Array.from({ length: 100 }, (_, i) => ({ id: i, name: 'Item ' + i })));
}`, feedback_correct: "✅ CDK virtual scroll.", feedback_partial: "cdkVirtualFor.", feedback_wrong: "ScrollingModule", expected: "ScrollingModule and cdk-virtual-scroll-viewport" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Set itemSize=\"50\" and give the viewport a height (e.g. style=\"height: 300px\"). Ensure *cdkVirtualFor=\"let item of items()\" so only visible rows render.", answer_keywords: ["itemSize", "height", "cdkVirtualFor"], seed_code: `import { Component, signal } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-virtual-list',
  standalone: true,
  imports: [ScrollingModule],
  template: \`
    <cdk-virtual-scroll-viewport itemSize="50" style="height: 300px">
      <div *cdkVirtualFor="let item of items()">{{ item.name }}</div>
    </cdk-virtual-scroll-viewport>
  \`,
})
export class VirtualListComponent {
  items = signal(Array.from({ length: 100 }, (_, i) => ({ id: i, name: 'Item ' + i })));
}`, feedback_correct: "✅ itemSize and height.", feedback_partial: "viewport.", feedback_wrong: "itemSize", expected: "itemSize and viewport height" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Add trackBy: trackById to *cdkVirtualFor. Export the component.", answer_keywords: ["trackBy", "export"], seed_code: `import { Component, signal } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-virtual-list',
  standalone: true,
  imports: [ScrollingModule],
  template: \`
    <cdk-virtual-scroll-viewport itemSize="50" style="height: 300px">
      <div *cdkVirtualFor="let item of items(); trackBy: trackById">{{ item.name }}</div>
    </cdk-virtual-scroll-viewport>
  \`,
})
export class VirtualListComponent {
  items = signal(Array.from({ length: 100 }, (_, i) => ({ id: i, name: 'Item ' + i })));
  trackById = (_: number, item: { id: number }) => item.id;
}`, feedback_correct: "✅ List Virtualization (Angular) complete.", feedback_partial: "trackBy.", feedback_wrong: "Export", expected: "trackBy and export" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 52, title: TITLE, shortName: "A — VIRTUAL LIST" });
