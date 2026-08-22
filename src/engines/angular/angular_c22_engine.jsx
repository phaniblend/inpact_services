import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Inline Styles (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #22 (Angular)", title: TITLE, body: "Apply inline styles dynamically using Angular's ngStyle directive or [style.property] bindings driven by component state or signals.", usecase: "ngStyle and [style.x] are the Angular equivalents of React's style object." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Use [ngStyle]=\"{ color: color(), fontSize: size() + 'px' }\" for object syntax", "Or [style.color]=\"color()\" and [style.font-size.px]=\"size()\" for single properties", "CommonModule provides NgStyle; use camelCase in object", "Units: [style.width.px], [style.opacity] for numbers"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with color = signal('red') and size = signal(16). Add a paragraph with [ngStyle]=\"{ color: color(), fontSize: size() + 'px' }\".", answer_keywords: ["ngStyle", "color", "fontSize"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inline-styles',
  standalone: true,
  imports: [CommonModule],
  template: \`<p [ngStyle]="{ color: color(), fontSize: size() + 'px' }">Styled text</p>\`,
})
export class InlineStylesComponent {
  color = signal('red');
  size = signal(16);
}`, feedback_correct: "✅ ngStyle with signals.", feedback_partial: "ngStyle object.", feedback_wrong: "[ngStyle]", expected: "[ngStyle]=\"{ color: color(), fontSize: size() + 'px' }\"" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Use single-property bindings: [style.color]=\"color()\" and [style.font-size.px]=\"size()\" on the same element.", answer_keywords: ["style.color", "style.font-size"], seed_code: `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-inline-styles',
  standalone: true,
  template: \`<p [style.color]="color()" [style.font-size.px]="size()">Styled text</p>\`,
})
export class InlineStylesComponent {
  color = signal('red');
  size = signal(16);
}`, feedback_correct: "✅ style bindings.", feedback_partial: "style.property.", feedback_wrong: "[style.color]", expected: "[style.color] and [style.font-size.px]" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Add buttons to update color and size with .set(). Export the component.", answer_keywords: ["set", "button", "click"], seed_code: `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-inline-styles',
  standalone: true,
  template: \`
    <p [style.color]="color()" [style.font-size.px]="size()">Styled text</p>
    <button (click)="color.set('blue')">Blue</button>
    <button (click)="size.set(24)">Larger</button>
  \`,
})
export class InlineStylesComponent {
  color = signal('red');
  size = signal(16);
}`, feedback_correct: "✅ Inline Styles (Angular) complete.", feedback_partial: "Buttons to set.", feedback_wrong: "color.set size.set", expected: "Buttons (click) with color.set / size.set" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 22, title: TITLE, shortName: "A — NG STYLE" });
