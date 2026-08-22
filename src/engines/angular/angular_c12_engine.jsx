import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Card Component (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #12 (Angular)", title: TITLE, body: "A card component that takes a title via @Input() and projects body content via <ng-content>. Usage: <app-card title=\"Hello\">Body here</app-card>.", usecase: "Content projection with ng-content is Angular's way to slot children." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["@Input() title: string", "Template: wrapper div, title in header, <ng-content></ng-content> for body", "Style the card with a border or shadow", "Use in parent: <app-card [title]=\"myTitle\">content</app-card>"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with @Input() title = 'Card'. Template: a div with an h2 showing {{ title }}.", answer_keywords: ["Input", "title", "template"], seed_code: `import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: \`
    <div class="card">
      <h2>{{ title }}</h2>
    </div>
  \`,
  styles: [\`.card { border: 1px solid #ccc; padding: 1rem; }\`]
})
export class CardComponent {
  @Input() title = 'Card';
}`, feedback_correct: "✅ @Input() title.", feedback_partial: "Input and template.", feedback_wrong: "@Input() title", expected: "@Input() title = 'Card'" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add <ng-content></ng-content> inside the card div so the parent can pass content between the tags.", answer_keywords: ["ng-content", "content"], seed_code: `import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: \`
    <div class="card">
      <h2>{{ title }}</h2>
      <ng-content></ng-content>
    </div>
  \`,
  styles: [\`.card { border: 1px solid #ccc; padding: 1rem; }\`]
})
export class CardComponent {
  @Input() title = 'Card';
}`, feedback_correct: "✅ ng-content added.", feedback_partial: "ng-content.", feedback_wrong: "<ng-content></ng-content>", expected: "<ng-content></ng-content> in template" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Style the card (e.g. border, padding). Export the component. Parent usage: <app-card [title]=\"'My Card'\"><p>Body</p></app-card>.", answer_keywords: ["styles", "export"], seed_code: `import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: \`
    <div class="card">
      <h2>{{ title }}</h2>
      <ng-content></ng-content>
    </div>
  \`,
  styles: [\`.card { border: 1px solid #ccc; padding: 1rem; border-radius: 8px; }\`]
})
export class CardComponent {
  @Input() title = 'Card';
}`, feedback_correct: "✅ Card Component (Angular) complete.", feedback_partial: "Styles and export.", feedback_wrong: "styles: [`.card { ... }`]", expected: "styles array with .card class." },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 12, title: TITLE, shortName: "A — CARD" });
