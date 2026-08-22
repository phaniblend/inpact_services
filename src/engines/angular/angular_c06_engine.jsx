import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #6 (Angular)", title: "List Rendering with map()", body: "Display a list of items (e.g. ['Apple', 'Banana', 'Cherry']) in the template. In Angular we use *ngFor to loop over a signal or array and render one element per item.", usecase: "Angular's *ngFor is the equivalent of React's map() for list rendering." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Use signal([]) or a plain array for the list", "Template: *ngFor=\"let item of items()\" on a repeating element", "Display each item with {{ item }} or {{ item.name }}", "CommonModule for NgFor"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with items = signal(['Apple', 'Banana', 'Cherry']). Import CommonModule for *ngFor.", answer_keywords: ["signal", "items", "array"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule],
  template: \`<!-- Step 1: add *ngFor in step 2 -->\`,
})
export class ListRenderingComponent {
  items = signal(['Apple', 'Banana', 'Cherry']);
}`, feedback_correct: "✅ items signal with array.", feedback_partial: "signal and array.", feedback_wrong: "items = signal([...])", expected: "items = signal(['Apple', 'Banana', 'Cherry'])" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "In the template add <ul><li *ngFor=\"let item of items()\">{{ item }}</li></ul>.", answer_keywords: ["ngFor", "items()", "item"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <ul>
      <li *ngFor="let item of items()">{{ item }}</li>
    </ul>
  \`,
})
export class ListRenderingComponent {
  items = signal(['Apple', 'Banana', 'Cherry']);
}`, feedback_correct: "✅ *ngFor wired.", feedback_partial: "*ngFor and items().", feedback_wrong: "*ngFor=\"let item of items()\"", expected: "<li *ngFor=\"let item of items()\">{{ item }}</li>" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Ensure the list re-renders when items change (signals are reactive). Export the component.", answer_keywords: ["export", "component", "ngFor"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <ul>
      <li *ngFor="let item of items()">{{ item }}</li>
    </ul>
  \`,
})
export class ListRenderingComponent {
  items = signal(['Apple', 'Banana', 'Cherry']);
}`, feedback_correct: "✅ List Rendering (Angular) complete.", feedback_partial: "Reactive list.", feedback_wrong: "items() in *ngFor for reactivity", expected: "Use items() in *ngFor so the list updates when the signal changes." },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 6, title: "List Rendering with map() (Angular)", shortName: "A — LIST" });
