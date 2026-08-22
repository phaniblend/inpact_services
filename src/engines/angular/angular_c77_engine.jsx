import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Optimistic UI (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #77 (Angular)", title: TITLE, body: "Update the UI immediately before the server responds: set a signal with the new state, call HttpClient, and on error revert the signal to the previous value; optionally show a toast on rollback.", usecase: "Angular signals and HttpClient allow optimistic updates with rollback on error." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["items = signal([...]); onAdd(item) { const prev = items(); items.set([...prev, item]); this.http.post(...).subscribe({ error: () => items.set(prev) }); }", "Or use a 'pending' item with id: 'temp' and replace with server id on success", "Show error state and revert; optionally retry"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with items = signal([{ id: 1, name: 'A' }]). Add addItem(name: string) { const prev = this.items(); this.items.set([...prev, { id: Date.now(), name }]); }. Then call this.http.post('/api/items', { name }).subscribe({ error: () => this.items.set(prev) }); (inject HttpClient).", answer_keywords: ["items.set", "prev", "error"], seed_code: `import { Component, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-optimistic',
  standalone: true,
  template: \`<div *ngFor="let i of items()">{{ i.name }}</div>\`,
})
export class OptimisticUIComponent {
  private http = inject(HttpClient);
  items = signal([{ id: 1, name: 'A' }]);
  addItem(name: string) {
    const prev = this.items();
    this.items.set([...prev, { id: Date.now(), name }]);
    this.http.post('/api/items', { name }).subscribe({
      error: () => this.items.set(prev)
    });
  }
}`, feedback_correct: "✅ Optimistic update and rollback.", feedback_partial: "items.set(prev).", feedback_wrong: "error", expected: "set new state then revert on error" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add an input and button to call addItem. Show errorMessage = signal<string | null>(null) and in error callback set errorMessage.set('Failed'); items.set(prev).", answer_keywords: ["errorMessage", "addItem", "Failed"], seed_code: `import { Component, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-optimistic',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: \`
    <input [(ngModel)]="newName" />
    <button (click)="addItem(newName)">Add</button>
    <p *ngIf="errorMessage()">{{ errorMessage() }}</p>
    <div *ngFor="let i of items()">{{ i.name }}</div>
  \`,
})
export class OptimisticUIComponent {
  private http = inject(HttpClient);
  newName = '';
  errorMessage = signal<string | null>(null);
  items = signal([{ id: 1, name: 'A' }]);
  addItem(name: string) {
    const prev = this.items();
    this.items.set([...prev, { id: Date.now(), name }]);
    this.errorMessage.set(null);
    this.http.post('/api/items', { name }).subscribe({
      error: () => { this.errorMessage.set('Failed'); this.items.set(prev); }
    });
  }
}`, feedback_correct: "✅ Error message and rollback.", feedback_partial: "errorMessage.set.", feedback_wrong: "Failed", expected: "errorMessage and revert items" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "On success clear errorMessage. Export the component.", answer_keywords: ["success", "clear", "export"], seed_code: `import { Component, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-optimistic',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: \`
    <input [(ngModel)]="newName" />
    <button (click)="addItem(newName)">Add</button>
    <p *ngIf="errorMessage()">{{ errorMessage() }}</p>
    <div *ngFor="let i of items()">{{ i.name }}</div>
  \`,
})
export class OptimisticUIComponent {
  private http = inject(HttpClient);
  newName = '';
  errorMessage = signal<string | null>(null);
  items = signal([{ id: 1, name: 'A' }]);
  addItem(name: string) {
    const prev = this.items();
    this.items.set([...prev, { id: Date.now(), name }]);
    this.errorMessage.set(null);
    this.http.post('/api/items', { name }).subscribe({
      next: () => this.errorMessage.set(null),
      error: () => { this.errorMessage.set('Failed'); this.items.set(prev); }
    });
  }
}`, feedback_correct: "✅ Optimistic UI (Angular) complete.", feedback_partial: "next clear.", feedback_wrong: "Export", expected: "next/error handling and export" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 77, title: TITLE, shortName: "A — OPTIMISTIC UI" });
