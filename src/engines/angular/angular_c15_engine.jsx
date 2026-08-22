import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Children Prop (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #15 (Angular)", title: TITLE, body: "Render content that the parent puts between your component's tags. In Angular use <ng-content> (single slot) or <ng-content select=\"...\"> for multiple slots.", usecase: "ng-content is Angular's content projection — the equivalent of React's children." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Add <ng-content></ng-content> where child content should appear", "Parent: <app-wrapper><p>Child content</p></app-wrapper>", "Optional: multiple slots with select (e.g. select=\"[header]\")", "Single slot projects all content into one ng-content"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with a template that has a wrapper div and <ng-content></ng-content> inside it.", answer_keywords: ["ng-content", "template"], seed_code: `import { Component } from '@angular/core';

@Component({
  selector: 'app-wrapper',
  standalone: true,
  template: \`
    <div class="wrapper">
      <ng-content></ng-content>
    </div>
  \`,
  styles: [\`.wrapper { padding: 1rem; border: 1px solid #ccc; }\`]
})
export class ChildrenPropComponent {}
`, feedback_correct: "✅ ng-content added.", feedback_partial: "ng-content.", feedback_wrong: "<ng-content></ng-content>", expected: "<ng-content></ng-content> inside template" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Parent uses <app-wrapper><p>Hello from parent</p></app-wrapper>. The paragraph appears where ng-content is.", answer_keywords: ["app-wrapper", "content"], seed_code: `import { Component } from '@angular/core';

@Component({
  selector: 'app-wrapper',
  standalone: true,
  template: \`
    <div class="wrapper">
      <ng-content></ng-content>
    </div>
  \`,
  styles: [\`.wrapper { padding: 1rem; border: 1px solid #ccc; }\`]
})
export class ChildrenPropComponent {}
`, feedback_correct: "✅ Content projection works.", feedback_partial: "Parent passes content.", feedback_wrong: "Content between tags", expected: "Parent puts content between <app-wrapper> and </app-wrapper>" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Export the component. Optional: add a header slot with <ng-content select=\"[slot=header]\"></ng-content> and use in parent with <p slot=\"header\">Title</p>.", answer_keywords: ["export", "select"], seed_code: `import { Component } from '@angular/core';

@Component({
  selector: 'app-wrapper',
  standalone: true,
  template: \`
    <div class="wrapper">
      <ng-content select="[slot=header]"></ng-content>
      <ng-content></ng-content>
    </div>
  \`,
  styles: [\`.wrapper { padding: 1rem; border: 1px solid #ccc; }\`]
})
export class ChildrenPropComponent {}
`, feedback_correct: "✅ Children Prop (Angular) complete.", feedback_partial: "Export and optional slots.", feedback_wrong: "ng-content select", expected: "ng-content or ng-content select for slots." },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 15, title: TITLE, shortName: "A — CHILDREN" });
