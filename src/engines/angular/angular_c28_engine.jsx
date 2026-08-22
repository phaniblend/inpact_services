import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Star Rating Component (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #28 (Angular)", title: TITLE, body: "Build a star rating component with @Input() max and @Input() value (or model), *ngFor for stars, and (click) to set rating; use @Output() or model() to emit changes.", usecase: "Angular components use @Input/@Output or model() for reusable UI like star ratings." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["@Input() max = 5; value as @Input() + @Output() valueChange or model()", "*ngFor with range 1..max; show filled/empty based on value", "(click) on star sets value and emits valueChange.emit(rating)", "Parent binds [(value)] or [value] and (valueChange)"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create StarRatingComponent with @Input() max = 5 and @Input() value = 0. Template: *ngFor over 1..max (use array from 1 to max) and show a span or icon per star.", answer_keywords: ["Input", "max", "ngFor"], seed_code: `import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <span *ngFor="let i of getStars()" [class.filled]="i <= value">★</span>
  \`,
})
export class StarRatingComponent {
  @Input() max = 5;
  @Input() value = 0;
  getStars() { return Array.from({ length: this.max }, (_, i) => i + 1); }
}`, feedback_correct: "✅ Stars with *ngFor.", feedback_partial: "getStars and value.", feedback_wrong: "*ngFor stars", expected: "*ngFor and @Input value/max" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add @Output() valueChange = new EventEmitter<number>(). On star click call valueChange.emit(i). Make stars clickable.", answer_keywords: ["Output", "valueChange", "emit"], seed_code: `import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <span *ngFor="let i of getStars()" (click)="valueChange.emit(i)" [class.filled]="i <= value">★</span>
  \`,
})
export class StarRatingComponent {
  @Input() max = 5;
  @Input() value = 0;
  @Output() valueChange = new EventEmitter<number>();
  getStars() { return Array.from({ length: this.max }, (_, i) => i + 1); }
}`, feedback_correct: "✅ valueChange.emit.", feedback_partial: "EventEmitter.", feedback_wrong: "valueChange.emit(i)", expected: "@Output() valueChange and (click)=\"valueChange.emit(i)\"" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Parent: rating = signal(0); <app-star-rating [value]=\"rating()\" (valueChange)=\"rating.set($event)\"></app-star-rating>. Export StarRatingComponent.", answer_keywords: ["app-star-rating", "rating", "export"], seed_code: `import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <span *ngFor="let i of getStars()" (click)="valueChange.emit(i)" [class.filled]="i <= value">★</span>
  \`,
})
export class StarRatingComponent {
  @Input() max = 5;
  @Input() value = 0;
  @Output() valueChange = new EventEmitter<number>();
  getStars() { return Array.from({ length: this.max }, (_, i) => i + 1); }
}`, feedback_correct: "✅ Star Rating Component (Angular) complete.", feedback_partial: "Export.", feedback_wrong: "Export", expected: "Export and parent [value] (valueChange)" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 28, title: TITLE, shortName: "A — STAR RATING" });
