import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Pagination (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #61 (Angular)", title: TITLE, body: "Display a paginated list in Angular: keep currentPage and pageSize as signals, slice the data array for the current page, and render prev/next or page number buttons that update currentPage.", usecase: "Angular signals and computed slice for pagination; Router can also drive page via query params." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["items = signal([...]); currentPage = signal(1); pageSize = signal(10)", "pageItems = computed(() => { const i = items(); const p = currentPage(); return i.slice((p-1)*pageSize(), p*pageSize()); })", "totalPages = computed(() => Math.ceil(items().length / pageSize()))", "Buttons: (click)=\"currentPage.update(p => p - 1)\" and similar for next; disable when page <= 1 or >= totalPages"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with items = signal(Array.from({ length: 50 }, (_, i) => ({ id: i }))), currentPage = signal(1), pageSize = signal(10). Add computed pageItems = computed(() => this.items().slice((this.currentPage() - 1) * this.pageSize(), this.currentPage() * this.pageSize())).", answer_keywords: ["computed", "slice", "currentPage"], seed_code: `import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: \`<div *ngFor="let item of pageItems()">{{ item.id }}</div>\`,
})
export class PaginationComponent {
  items = signal(Array.from({ length: 50 }, (_, i) => ({ id: i })));
  currentPage = signal(1);
  pageSize = signal(10);
  pageItems = computed(() => {
    const i = this.items();
    const p = this.currentPage();
    const size = this.pageSize();
    return i.slice((p - 1) * size, p * size);
  });
}`, feedback_correct: "✅ pageItems computed.", feedback_partial: "slice.", feedback_wrong: "pageItems", expected: "computed slice by currentPage and pageSize" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add totalPages = computed(() => Math.ceil(this.items().length / this.pageSize())). Template: *ngFor over pageItems(); add Prev button (click)=\"currentPage.update(p => Math.max(1, p - 1))\" and Next (click)=\"currentPage.update(p => Math.min(totalPages(), p + 1))\".", answer_keywords: ["totalPages", "Prev", "Next"], seed_code: `import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div *ngFor="let item of pageItems()">{{ item.id }}</div>
    <button (click)="currentPage.update(p => Math.max(1, p - 1))">Prev</button>
    <button (click)="currentPage.update(p => Math.min(totalPages(), p + 1))">Next</button>
  \`,
})
export class PaginationComponent {
  items = signal(Array.from({ length: 50 }, (_, i) => ({ id: i })));
  currentPage = signal(1);
  pageSize = signal(10);
  pageItems = computed(() => this.items().slice((this.currentPage() - 1) * this.pageSize(), this.currentPage() * this.pageSize()));
  totalPages = computed(() => Math.ceil(this.items().length / this.pageSize()));
}`, feedback_correct: "✅ Prev/Next buttons.", feedback_partial: "currentPage.update.", feedback_wrong: "totalPages", expected: "Prev/Next with currentPage.update" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Disable Prev when currentPage() === 1 and Next when currentPage() >= totalPages(). Show 'Page {{ currentPage() }} of {{ totalPages() }}'. Export the component.", answer_keywords: ["disabled", "Page of", "export"], seed_code: `import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div *ngFor="let item of pageItems()">{{ item.id }}</div>
    <button [disabled]="currentPage() === 1" (click)="currentPage.update(p => p - 1)">Prev</button>
    <span>Page {{ currentPage() }} of {{ totalPages() }}</span>
    <button [disabled]="currentPage() >= totalPages()" (click)="currentPage.update(p => p + 1)">Next</button>
  \`,
})
export class PaginationComponent {
  items = signal(Array.from({ length: 50 }, (_, i) => ({ id: i })));
  currentPage = signal(1);
  pageSize = signal(10);
  pageItems = computed(() => this.items().slice((this.currentPage() - 1) * this.pageSize(), this.currentPage() * this.pageSize()));
  totalPages = computed(() => Math.ceil(this.items().length / this.pageSize()));
}`, feedback_correct: "✅ Pagination (Angular) complete.", feedback_partial: "disabled.", feedback_wrong: "Export", expected: "[disabled] and Page of totalPages" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 61, title: TITLE, shortName: "A — PAGINATION" });
