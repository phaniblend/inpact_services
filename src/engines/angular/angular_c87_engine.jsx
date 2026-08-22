import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Memoization Strategy (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #87 (Angular)", title: TITLE, body: "Choose when to memoize in Angular: use computed() for derived state from signals (auto-memoized); avoid putting expensive work in template getters—move to computed(); use trackBy in *ngFor; and consider pure pipes for formatting.", usecase: "Angular computed(), trackBy, and pure pipes are the main memoization strategies." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Derived from signals => computed() so it only recomputes when dependencies change", "Expensive filter/sort in template => move to computed() or method called from computed", " *ngFor with trackBy: trackById to avoid re-creating DOM when list identity changes", "Pure pipe for date/currency so result is cached per input"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with items = signal([...]) and filter = signal(''). Add filteredItems = computed(() => this.items().filter(x => x.includes(this.filter()))). Use filteredItems() in *ngFor, not a getter.", answer_keywords: ["computed", "filteredItems", "filter"], seed_code: `import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-memo-strategy',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <input (input)="filter.set($any($event.target).value)" />
    <div *ngFor="let item of filteredItems()">{{ item }}</div>
  \`,
})
export class MemoStrategyComponent {
  items = signal(['Apple', 'Banana', 'Apricot']);
  filter = signal('');
  filteredItems = computed(() => this.items().filter(x => x.toLowerCase().includes(this.filter().toLowerCase())));
}`, feedback_correct: "✅ computed for filtered list.", feedback_partial: "computed.", feedback_wrong: "filteredItems", expected: "computed(() => items().filter(...))" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add trackBy: trackByItem to *ngFor so each item is tracked by identity. trackByItem = (i: number, item: string) => item;", answer_keywords: ["trackBy", "trackByItem"], seed_code: `import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-memo-strategy',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <input (input)="filter.set($any($event.target).value)" />
    <div *ngFor="let item of filteredItems(); trackBy: trackByItem">{{ item }}</div>
  \`,
})
export class MemoStrategyComponent {
  items = signal(['Apple', 'Banana', 'Apricot']);
  filter = signal('');
  filteredItems = computed(() => this.items().filter(x => x.toLowerCase().includes(this.filter().toLowerCase())));
  trackByItem = (_: number, item: string) => item;
}`, feedback_correct: "✅ trackBy.", feedback_partial: "trackByItem.", feedback_wrong: "trackBy", expected: "trackBy: trackByItem" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Use a pure pipe for display: create SortPipe that sorts the array (or use built-in). Document: prefer computed for component-derived data and pure pipes for view-only transforms. Export the component.", answer_keywords: ["pure pipe", "export"], seed_code: `import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'sort', standalone: true, pure: true })
export class SortPipe implements PipeTransform {
  transform(arr: string[]): string[] {
    return [...arr].sort();
  }
}`, feedback_correct: "✅ Memoization Strategy (Angular) complete.", feedback_partial: "SortPipe.", feedback_wrong: "Export", expected: "computed + trackBy and pure pipe" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 87, title: TITLE, shortName: "A — MEMO STRATEGY" });
