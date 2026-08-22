import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "PropTypes / TypeScript Interface (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #18 (Angular)", title: TITLE, body: "Type your @Input() and @Output() with TypeScript interfaces. Define an interface for the component's props and use it on @Input() propName!: IProps.", usecase: "Angular + TypeScript: interfaces for inputs and events improve safety and docs." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Define interface User { id: number; name: string }", "@Input() user!: User or @Input() user: User | null = null", "Use user in template with {{ user.name }} (optional chaining if nullable)", "Type @Output() with EventEmitter<User> when emitting objects"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Define an interface, e.g. export interface User { id: number; name: string }. Create a component with @Input() user!: User.", answer_keywords: ["interface", "User", "Input"], seed_code: `import { Component, Input } from '@angular/core';

export interface User {
  id: number;
  name: string;
}

@Component({
  selector: 'app-user',
  standalone: true,
  template: \`<p>{{ user.name }}</p>\`,
})
export class UserComponent {
  @Input() user!: User;
}`, feedback_correct: "✅ Interface and typed Input.", feedback_partial: "interface and @Input.", feedback_wrong: "interface User and @Input() user!: User", expected: "interface User { id, name }; @Input() user!: User" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "In template use {{ user.name }}. If user can be null use @Input() user: User | null = null and {{ user?.name }}.", answer_keywords: ["user.name", "user?", "template"], seed_code: `import { Component, Input } from '@angular/core';

export interface User {
  id: number;
  name: string;
}

@Component({
  selector: 'app-user',
  standalone: true,
  template: \`<p>{{ user?.name ?? 'No user' }}</p>\`,
})
export class UserComponent {
  @Input() user: User | null = null;
}`, feedback_correct: "✅ Nullable typing and template.", feedback_partial: "user? or null check.", feedback_wrong: "user?.name", expected: "user: User | null and user?.name in template" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Parent passes [user]=\"currentUser\" where currentUser is typed User. Export the component and interface.", answer_keywords: ["export", "User", "currentUser"], seed_code: `import { Component, Input } from '@angular/core';

export interface User {
  id: number;
  name: string;
}

@Component({
  selector: 'app-user',
  standalone: true,
  template: \`<p>{{ user?.name ?? 'No user' }}</p>\`,
})
export class UserComponent {
  @Input() user: User | null = null;
}`, feedback_correct: "✅ TypeScript Interface (Angular) complete.", feedback_partial: "Export.", feedback_wrong: "Export component and interface", expected: "Export UserComponent and User interface." },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 18, title: TITLE, shortName: "A — INTERFACE" });
