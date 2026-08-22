import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "useTransition (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #73 (Angular)", title: TITLE, body: "Defer non-urgent UI updates in Angular: use a signal for 'pending' state and update it inside requestAnimationFrame or setTimeout(0), or use Angular's experimental support so heavy updates don't block the main thread; show isPending in the template.", usecase: "Angular uses signals and deferred updates (setTimeout, queueMicrotask) to keep UI responsive like React useTransition." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["isPending = signal(false); startTransition(fn) { this.isPending.set(true); queueMicrotask(() => { fn(); this.isPending.set(false); }); }", "Or use setTimeout(0) to defer state update so input stays responsive", "Template: *ngIf=\"!isPending()\" show result; show spinner when isPending()", "Heavy computation: run in worker or chunk with requestAnimationFrame"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with isPending = signal(false) and list = signal<number[]>([]). Add startTransition() { this.isPending.set(true); setTimeout(() => { this.list.set(Array.from({ length: 1000 }, (_, i) => i)); this.isPending.set(false); }, 0); }.", answer_keywords: ["isPending", "startTransition", "setTimeout"], seed_code: `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-transition',
  standalone: true,
  template: \`<p>Pending: {{ isPending() }}</p>\`,
})
export class TransitionComponent {
  isPending = signal(false);
  list = signal<number[]>([]);
  startTransition() {
    this.isPending.set(true);
    setTimeout(() => {
      this.list.set(Array.from({ length: 1000 }, (_, i) => i));
      this.isPending.set(false);
    }, 0);
  }
}`, feedback_correct: "✅ isPending and deferred update.", feedback_partial: "setTimeout.", feedback_wrong: "startTransition", expected: "isPending and setTimeout to defer list update" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add a button (click)=\"startTransition()\". In template show spinner or 'Loading...' when isPending() and list when !isPending(). Use *ngIf.", answer_keywords: ["ngIf", "isPending", "Loading"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transition',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <p *ngIf="isPending()">Loading...</p>
    <div *ngIf="!isPending()">{{ list().length }} items</div>
    <button (click)="startTransition()">Load</button>
  \`,
})
export class TransitionComponent {
  isPending = signal(false);
  list = signal<number[]>([]);
  startTransition() {
    this.isPending.set(true);
    setTimeout(() => {
      this.list.set(Array.from({ length: 1000 }, (_, i) => i));
      this.isPending.set(false);
    }, 0);
  }
}`, feedback_correct: "✅ Pending UI.", feedback_partial: "*ngIf isPending.", feedback_wrong: "Loading", expected: "*ngIf isPending() and list" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Keep an input responsive: while isPending() the user can still type; use a separate signal for input value so it's not blocked. Export the component.", answer_keywords: ["input", "signal", "export"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transition',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <input [value]="query()" (input)="query.set($any($event.target).value)" />
    <p *ngIf="isPending()">Loading...</p>
    <div *ngIf="!isPending()">{{ list().length }} items</div>
    <button (click)="startTransition()">Load</button>
  \`,
})
export class TransitionComponent {
  query = signal('');
  isPending = signal(false);
  list = signal<number[]>([]);
  startTransition() {
    this.isPending.set(true);
    setTimeout(() => { this.list.set([]); this.isPending.set(false); }, 0);
  }
}`, feedback_correct: "✅ useTransition (Angular) complete.", feedback_partial: "query signal.", feedback_wrong: "Export", expected: "Separate query signal and export" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 73, title: TITLE, shortName: "A — TRANSITION" });
