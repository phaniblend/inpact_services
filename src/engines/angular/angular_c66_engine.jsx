import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Discriminated Union Props (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #66 (Angular)", title: TITLE, body: "Type component inputs as a discriminated union so the template and logic can narrow by a common 'type' or 'kind' field: e.g. type Config = { type: 'a'; value: string } | { type: 'b'; count: number }; @Input() config!: Config.", usecase: "Angular + TypeScript discriminated unions give type-safe narrowing in templates and methods." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Define type VariantA = { type: 'a'; label: string }; VariantB = { type: 'b'; count: number }; type Props = VariantA | VariantB", "@Input() props!: Props; in template use *ngIf=\"props.type === 'a'\" then props.label", "Switch in class: if (this.props.type === 'a') return this.props.label; else return this.props.count", "Use @switch in control flow (Angular 17) for exhaustive check"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Define type VariantA = { type: 'a'; label: string }, VariantB = { type: 'b'; count: number }, and type Props = VariantA | VariantB. Create a component with @Input() props!: Props.", answer_keywords: ["type", "VariantA", "VariantB"], seed_code: `import { Component, Input } from '@angular/core';

type VariantA = { type: 'a'; label: string };
type VariantB = { type: 'b'; count: number };
export type Props = VariantA | VariantB;

@Component({
  selector: 'app-discriminated',
  standalone: true,
  template: \`<p>{{ props.type }}</p>\`,
})
export class DiscriminatedComponent {
  @Input() props!: Props;
}`, feedback_correct: "✅ Discriminated union type.", feedback_partial: "Props.", feedback_wrong: "type 'a'", expected: "VariantA | VariantB with type discriminator" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "In template use *ngIf=\"props.type === 'a'\"> {{ props.label }} and *ngIf=\"props.type === 'b'\"> {{ props.count }}. TypeScript will narrow props in each block.", answer_keywords: ["ngIf", "props.type", "props.label"], seed_code: `import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type VariantA = { type: 'a'; label: string };
type VariantB = { type: 'b'; count: number };
export type Props = VariantA | VariantB;

@Component({
  selector: 'app-discriminated',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <p *ngIf="props.type === 'a'">{{ props.label }}</p>
    <p *ngIf="props.type === 'b'">{{ props.count }}</p>
  \`,
})
export class DiscriminatedComponent {
  @Input() props!: Props;
}`, feedback_correct: "✅ Narrowing in template.", feedback_partial: "props.type === 'a'.", feedback_wrong: "props.label", expected: "*ngIf props.type and use props.label / props.count" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Add a method getDisplay(): string { if (this.props.type === 'a') return this.props.label; return String(this.props.count); } and use it in template. Export the component and Props.", answer_keywords: ["getDisplay", "narrow", "export"], seed_code: `import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type VariantA = { type: 'a'; label: string };
type VariantB = { type: 'b'; count: number };
export type Props = VariantA | VariantB;

@Component({
  selector: 'app-discriminated',
  standalone: true,
  imports: [CommonModule],
  template: \`<p>{{ getDisplay() }}</p>\`,
})
export class DiscriminatedComponent {
  @Input() props!: Props;
  getDisplay(): string {
    if (this.props.type === 'a') return this.props.label;
    return String(this.props.count);
  }
}`, feedback_correct: "✅ Discriminated Union Props (Angular) complete.", feedback_partial: "getDisplay.", feedback_wrong: "Export", expected: "getDisplay with narrowing and export" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 66, title: TITLE, shortName: "A — DISCRIMINATED UNION" });
