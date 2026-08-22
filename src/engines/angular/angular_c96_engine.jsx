import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Design DataTable API (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #96 (Angular)", title: TITLE, body: "Design a DataTable component API in Angular: @Input() data: T[]; @Input() columns: { key: keyof T; header: string }[]; support sorting (sortBy, sortDir signals), optional pagination (page, pageSize), and use *ngFor with trackBy for rows.", usecase: "Angular DataTable uses @Input() for data and columns, signals for sort/page state, and *ngFor for rendering." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["DataTableComponent<T>: @Input() data: T[] = []; @Input() columns: { key: keyof T; header: string }[]", "sortBy = signal<keyof T | null>(null); sortDir = signal<'asc'|'desc'>('asc'); (click) on header toggles sort", "sortedData = computed(() => sort the data by sortBy() and sortDir())", "Optional: page = signal(1); pageSize = signal(10); slice in computed"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create DataTableComponent with @Input() data: unknown[] = [] and @Input() columns: { key: string; header: string }[] = []. Template: <table><thead><tr><th *ngFor=\"let col of columns\">{{ col.header }}</th></tr></thead><tbody><tr *ngFor=\"let row of data\"><td *ngFor=\"let col of columns\">{{ row[col.key] }}</td></tr></tbody></table>.", answer_keywords: ["Input", "columns", "ngFor"], seed_code: `import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <table>
      <thead><tr><th *ngFor="let col of columns">{{ col.header }}</th></tr></thead>
      <tbody><tr *ngFor="let row of data"><td *ngFor="let col of columns">{{ row[col.key] }}</td></tr></tbody>
    </table>
  \`,
})
export class DataTableComponent {
  @Input() data: unknown[] = [];
  @Input() columns: { key: string; header: string }[] = [];
}`, feedback_correct: "✅ DataTable with data and columns.", feedback_partial: "columns.", feedback_wrong: "row[col.key]", expected: "@Input data and columns and *ngFor" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add sortBy = signal<string | null>(null) and sortDir = signal<'asc'|'desc'>('asc'). sortedData = computed(() => { const d = [...this.data]; const key = this.sortBy(); if (!key) return d; return d.sort((a,b) => (a[key] < b[key] ? -1 : 1) * (this.sortDir() === 'asc' ? 1 : -1)); }). Use sortedData() in template.", answer_keywords: ["computed", "sortedData", "sortBy"], seed_code: `import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <table>
      <thead><tr><th *ngFor="let col of columns" (click)="toggleSort(col.key)">{{ col.header }}</th></tr></thead>
      <tbody><tr *ngFor="let row of sortedData()"><td *ngFor="let col of columns">{{ row[col.key] }}</td></tr></tbody>
    </table>
  \`,
})
export class DataTableComponent {
  @Input() data: unknown[] = [];
  @Input() columns: { key: string; header: string }[] = [];
  sortBy = signal<string | null>(null);
  sortDir = signal<'asc'|'desc'>('asc');
  sortedData = computed(() => {
    const d = [...this.data];
    const key = this.sortBy();
    if (!key) return d;
    return d.sort((a: any, b: any) => (a[key] < b[key] ? -1 : 1) * (this.sortDir() === 'asc' ? 1 : -1));
  });
  toggleSort(key: string) {
    this.sortBy.set(key);
    this.sortDir.update(d => d === 'asc' ? 'desc' : 'asc');
  }
}`, feedback_correct: "✅ sortedData and toggleSort.", feedback_partial: "toggleSort.", feedback_wrong: "sortedData", expected: "computed sortedData and (click) toggleSort" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Add pagination: page = signal(1), pageSize = signal(10). pageData = computed(() => sortedData().slice((page()-1)*pageSize(), page()*pageSize())). Use pageData() in template and add Prev/Next. Export DataTableComponent.", answer_keywords: ["page", "pageSize", "pageData", "export"], seed_code: `import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <table>
      <thead><tr><th *ngFor="let col of columns" (click)="toggleSort(col.key)">{{ col.header }}</th></tr></thead>
      <tbody><tr *ngFor="let row of pageData()"><td *ngFor="let col of columns">{{ row[col.key] }}</td></tr></tbody>
    </table>
    <button (click)="page.update(p=>Math.max(1,p-1))">Prev</button>
    <button (click)="page.update(p=>p+1)">Next</button>
  \`,
})
export class DataTableComponent {
  @Input() data: unknown[] = [];
  @Input() columns: { key: string; header: string }[] = [];
  sortBy = signal<string | null>(null);
  sortDir = signal<'asc'|'desc'>('asc');
  page = signal(1);
  pageSize = signal(10);
  sortedData = computed(() => [...this.data]);
  pageData = computed(() => this.sortedData().slice((this.page()-1)*this.pageSize(), this.page()*this.pageSize()));
  toggleSort(key: string) { this.sortBy.set(key); this.sortDir.update(d => d === 'asc' ? 'desc' : 'asc'); }
}`, feedback_correct: "✅ Design DataTable API (Angular) complete.", feedback_partial: "pageData.", feedback_wrong: "Export", expected: "page, pageSize, pageData and export" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 96, title: TITLE, shortName: "A — DATA TABLE API" });
