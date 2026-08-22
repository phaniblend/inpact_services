import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Props Drilling (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #13 (Angular)", title: TITLE, body: "Pass data from a parent component down through a child to a grandchild using @Input() at each level. Parent has a signal; child and grandchild receive it via @Input().", usecase: "Angular passes data down with @Input(); drilling is the same pattern across multiple layers." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Parent: signal or property passed to child with [prop]=\"value\"", "Child: @Input() prop and pass to grandchild with [prop]=\"prop\"", "Grandchild: @Input() prop and display {{ prop }}", "Avoid drilling with services or signals in a shared context later"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a parent component with message = signal('Hello'). In template use <app-child [message]=\"message()\"></app-child>.", answer_keywords: ["signal", "message", "app-child"], seed_code: `import { Component, signal } from '@angular/core';
import { ChildComponent } from './child.component';

@Component({
  selector: 'app-parent',
  standalone: true,
  imports: [ChildComponent],
  template: \`<app-child [message]="message()"></app-child>\`,
})
export class ParentComponent {
  message = signal('Hello');
}`, feedback_correct: "✅ Parent passes message.", feedback_partial: "signal and binding.", feedback_wrong: "[message]=\"message()\"", expected: "message = signal('Hello'); <app-child [message]=\"message()\">" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Child component: @Input() message = '' and template <app-grandchild [message]=\"message\"></app-grandchild>.", answer_keywords: ["Input", "message", "app-grandchild"], seed_code: `import { Component, Input } from '@angular/core';
import { GrandchildComponent } from './grandchild.component';

@Component({
  selector: 'app-child',
  standalone: true,
  imports: [GrandchildComponent],
  template: \`<app-grandchild [message]="message"></app-grandchild>\`,
})
export class ChildComponent {
  @Input() message = '';
}`, feedback_correct: "✅ Child drills message.", feedback_partial: "@Input and pass through.", feedback_wrong: "@Input() message", expected: "@Input() message; [message]=\"message\" to grandchild" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Grandchild: @Input() message = '' and template {{ message }}. Export all three components.", answer_keywords: ["Input", "message", "template"], seed_code: `import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-grandchild',
  standalone: true,
  template: \`<p>{{ message }}</p>\`,
})
export class GrandchildComponent {
  @Input() message = '';
}`, feedback_correct: "✅ Props Drilling (Angular) complete.", feedback_partial: "Grandchild displays message.", feedback_wrong: "{{ message }}", expected: "@Input() message; template {{ message }}" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 13, title: TITLE, shortName: "A — PROPS DRILLING" });
