import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "CSS Modules (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #23 (Angular)", title: TITLE, body: "Scope component styles with Angular's component styleUrls and encapsulation (ViewEncapsulation.Emulated) so class names don't leak globally.", usecase: "Angular component styles are scoped by default; use :host and :host-context for component-level CSS." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Add styleUrls: ['./my.component.css'] or styles: [`...`] in @Component", "Use :host { } for the component host element", "Class names in the template get attribute selectors; no global clash", "ViewEncapsulation.Emulated (default) or .None for global styles"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with a styles array: styles: ['.card { padding: 1rem; }']. Add a div with class=\"card\" in the template.", answer_keywords: ["styles", "card", "Component"], seed_code: `import { Component } from '@angular/core';

@Component({
  selector: 'app-css-modules',
  standalone: true,
  styles: [\`.card { padding: 1rem; border: 1px solid #ccc; }\`],
  template: \`<div class="card">Scoped content</div>\`,
})
export class CssModulesComponent {}`, feedback_correct: "✅ Component styles.", feedback_partial: "styles array.", feedback_wrong: "styles: ['.card']", expected: "styles: ['.card { ... }'] and class=\"card\"" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add :host { display: block; margin: 1rem; } to the styles array to style the component host.", answer_keywords: [":host", "display", "block"], seed_code: `import { Component } from '@angular/core';

@Component({
  selector: 'app-css-modules',
  standalone: true,
  styles: [\`
    :host { display: block; margin: 1rem; }
    .card { padding: 1rem; border: 1px solid #ccc; }
  \`],
  template: \`<div class="card">Scoped content</div>\`,
})
export class CssModulesComponent {}`, feedback_correct: "✅ :host styles.", feedback_partial: ":host.", feedback_wrong: ":host {}", expected: ":host { display: block; margin: 1rem; }" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Move styles to a separate file styleUrls: ['./css-modules.component.css'] and keep the same classes. Export the component.", answer_keywords: ["styleUrls", "css"], seed_code: `import { Component } from '@angular/core';

@Component({
  selector: 'app-css-modules',
  standalone: true,
  styleUrls: ['./css-modules.component.css'],
  template: \`<div class="card">Scoped content</div>\`,
})
export class CssModulesComponent {}`, feedback_correct: "✅ CSS Modules (Angular) complete.", feedback_partial: "styleUrls.", feedback_wrong: "styleUrls external file", expected: "styleUrls: ['./css-modules.component.css']" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 23, title: TITLE, shortName: "A — SCOPED CSS" });
