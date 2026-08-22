import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Default Props (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #14 (Angular)", title: TITLE, body: "Give @Input() properties default values so the component works without the parent passing them. Example: @Input() title = 'Untitled'.", usecase: "Angular @Input() defaults are the equivalent of React defaultProps." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["@Input() prop = defaultValue for each optional prop", "Use sensible defaults (e.g. title = 'Untitled', count = 0)", "Parent can override with [title]=\"'My Title'\" or omit to use default", "Type the @Input() when needed: @Input() count = 0"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with @Input() title = 'Untitled' and @Input() count = 0. Display both in the template.", answer_keywords: ["Input", "title", "count", "default"], seed_code: `import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-defaults',
  standalone: true,
  template: \`<h1>{{ title }}</h1><p>Count: {{ count }}</p>\`,
})
export class DefaultPropsComponent {
  @Input() title = 'Untitled';
  @Input() count = 0;
}`, feedback_correct: "✅ Default values set.", feedback_partial: "@Input with defaults.", feedback_wrong: "@Input() title = 'Untitled'", expected: "@Input() title = 'Untitled'; @Input() count = 0" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Parent can use <app-defaults></app-defaults> (uses defaults) or <app-defaults [title]=\"'Custom'\" [count]=\"5\"></app-defaults>.", answer_keywords: ["app-defaults", "title", "count"], seed_code: `import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-defaults',
  standalone: true,
  template: \`<h1>{{ title }}</h1><p>Count: {{ count }}</p>\`,
})
export class DefaultPropsComponent {
  @Input() title = 'Untitled';
  @Input() count = 0;
}`, feedback_correct: "✅ Parent can override or omit.", feedback_partial: "Binding optional.", feedback_wrong: "[title] and [count] optional", expected: "Parent uses [title] and [count] only when overriding." },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Export the component. Ensure template shows {{ title }} and {{ count }} so defaults or parent values display.", answer_keywords: ["export", "template"], seed_code: `import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-defaults',
  standalone: true,
  template: \`<h1>{{ title }}</h1><p>Count: {{ count }}</p>\`,
})
export class DefaultPropsComponent {
  @Input() title = 'Untitled';
  @Input() count = 0;
}`, feedback_correct: "✅ Default Props (Angular) complete.", feedback_partial: "Export.", feedback_wrong: "Export component", expected: "Export DefaultPropsComponent." },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 14, title: TITLE, shortName: "A — DEFAULT PROPS" });
