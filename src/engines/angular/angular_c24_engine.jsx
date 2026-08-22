import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Styled Component Pattern (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #24 (Angular)", title: TITLE, body: "Encapsulate presentational components with co-located styles using Angular component styles, :host, and optional host bindings for dynamic styling.", usecase: "Angular uses component-scoped styles and host bindings instead of CSS-in-JS; same idea as styled components." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Create a presentational component with its own styles and template", "Use host: { '[class]': \"'btn btn-primary'\" } or host bindings for dynamic classes", "Or [ngClass] / [ngStyle] in template from @Input() props", "Keep styles in the component; reuse via selector in parent"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a StyledButtonComponent with template `<button class=\"btn\"><ng-content></ng-content></button>` and styles: ['.btn { padding: 8px 16px; }'].", answer_keywords: ["ng-content", "btn", "styles"], seed_code: `import { Component } from '@angular/core';

@Component({
  selector: 'app-styled-button',
  standalone: true,
  styles: [\`.btn { padding: 8px 16px; border-radius: 4px; }\`],
  template: \`<button class="btn"><ng-content></ng-content></button>\`,
})
export class StyledButtonComponent {}`, feedback_correct: "✅ Styled button with ng-content.", feedback_partial: "ng-content.", feedback_wrong: "class btn", expected: "button class=\"btn\" and ng-content" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add @Input() variant = 'primary'. Use [ngClass] on the button: [ngClass]=\"'btn-' + variant\" so class becomes btn-primary or btn-secondary.", answer_keywords: ["Input", "variant", "ngClass"], seed_code: `import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-styled-button',
  standalone: true,
  imports: [CommonModule],
  styles: [\`.btn { padding: 8px 16px; } .btn-primary { background: blue; } .btn-secondary { background: gray; }\`],
  template: \`<button class="btn" [ngClass]="'btn-' + variant"><ng-content></ng-content></button>\`,
})
export class StyledButtonComponent {
  @Input() variant = 'primary';
}`, feedback_correct: "✅ Variant input and ngClass.", feedback_partial: "variant and ngClass.", feedback_wrong: "btn-primary", expected: "@Input() variant and [ngClass]=\"'btn-' + variant\"" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Parent uses <app-styled-button variant=\"secondary\">Label</app-styled-button>. Export StyledButtonComponent.", answer_keywords: ["app-styled-button", "variant", "export"], seed_code: `import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-styled-button',
  standalone: true,
  imports: [CommonModule],
  styles: [\`.btn { padding: 8px 16px; } .btn-primary { background: blue; } .btn-secondary { background: gray; }\`],
  template: \`<button class="btn" [ngClass]="'btn-' + variant"><ng-content></ng-content></button>\`,
})
export class StyledButtonComponent {
  @Input() variant = 'primary';
}`, feedback_correct: "✅ Styled Component Pattern (Angular) complete.", feedback_partial: "Export.", feedback_wrong: "Export component", expected: "Export StyledButtonComponent; parent uses variant=\"secondary\"" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 24, title: TITLE, shortName: "A — STYLED BTN" });
