import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Utility Types (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #70 (Angular)", title: TITLE, body: "Use TypeScript utility types with Angular: Partial<Config> for optional inputs, Required<Config>, Pick<User, 'id'|'name'>, Omit<User, 'password'>, and Record<string, FormControl> for form groups to type component APIs and forms.", usecase: "Angular component @Input() and FormGroup benefit from Partial, Pick, Record for type safety." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["@Input() options: Partial<Config> so all keys optional", "type FormValues = Record<string, FormControl> or { name: FormControl; age: FormControl }", "Pick<User, 'id'|'name'> for list row type; Omit<User, 'id'> for create payload", "Use in service return types and template context types"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Define interface Config { theme: string; size: number }. Create a component with @Input() options: Partial<Config> = {}. So theme and size are optional. Use options.theme and options.size in template with optional chaining.", answer_keywords: ["Partial", "Config", "Input"], seed_code: `import { Component, Input } from '@angular/core';

interface Config {
  theme: string;
  size: number;
}

@Component({
  selector: 'app-utility',
  standalone: true,
  template: \`<p>{{ options.theme }} {{ options.size }}</p>\`,
})
export class UtilityTypesComponent {
  @Input() options: Partial<Config> = {};
}`, feedback_correct: "✅ Partial<Config> input.", feedback_partial: "Partial.", feedback_wrong: "Config", expected: "@Input() options: Partial<Config>" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Define User { id: number; name: string; password: string }. Create type SafeUser = Omit<User, 'password'>. Use SafeUser for a list item type so password is never exposed.", answer_keywords: ["Omit", "SafeUser", "User"], seed_code: `import { Component } from '@angular/core';

interface User {
  id: number;
  name: string;
  password: string;
}
type SafeUser = Omit<User, 'password'>;

@Component({
  selector: 'app-utility',
  standalone: true,
  template: \`<p>Safe</p>\`,
})
export class UtilityTypesComponent {
  items: SafeUser[] = [{ id: 1, name: 'A' }];
}`, feedback_correct: "✅ Omit and SafeUser.", feedback_partial: "Omit.", feedback_wrong: "SafeUser", expected: "Omit<User, 'password'>" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Use Record<string, FormControl> for a dynamic form: form = new FormGroup<Record<string, FormControl>>({ name: new FormControl('') }). Or type FormGroup with { name: FormControl }. Export the component.", answer_keywords: ["Record", "FormGroup", "export"], seed_code: `import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-utility',
  standalone: true,
  template: \`<p>Form</p>\`,
})
export class UtilityTypesComponent {
  form = new FormGroup<Record<string, FormControl<string>>>({
    name: new FormControl('')
  });
}`, feedback_correct: "✅ Utility Types (Angular) complete.", feedback_partial: "Record FormGroup.", feedback_wrong: "Export", expected: "FormGroup<Record<string, FormControl>>" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 70, title: TITLE, shortName: "A — UTILITY TYPES" });
