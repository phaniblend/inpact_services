import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "useDeferredValue (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #74 (Angular)", title: TITLE, body: "Defer updating a heavy part of the template in Angular: keep a 'deferred' signal that lags behind the source (e.g. updated in requestAnimationFrame or after a short delay) so the rest of the UI stays responsive.", usecase: "Angular can implement deferred values with a secondary signal updated asynchronously from the primary." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["query = signal(''); deferredQuery = signal('')", "effect(() => { const q = query(); requestAnimationFrame(() => this.deferredQuery.set(q)); }) or setTimeout", "Render heavy list based on deferredQuery() so typing updates query immediately but list updates deferred", "Optional: use Angular's @defer block for lazy rendering"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with query = signal('') and deferredQuery = signal(''). In an effect, read query() and use setTimeout(() => this.deferredQuery.set(this.query()), 0) so deferredQuery lags behind.", answer_keywords: ["deferredQuery", "effect", "setTimeout"], seed_code: `import { Component, signal, effect } from '@angular/core';

@Component({
  selector: 'app-deferred',
  standalone: true,
  template: \`<p>Deferred: {{ deferredQuery() }}</p>\`,
})
export class DeferredValueComponent {
  query = signal('');
  deferredQuery = signal('');
  constructor() {
    effect(() => {
      const q = this.query();
      setTimeout(() => this.deferredQuery.set(q), 0);
    });
  }
}`, feedback_correct: "✅ deferred signal in effect.", feedback_partial: "effect.", feedback_wrong: "deferredQuery.set", expected: "effect and setTimeout to set deferredQuery" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add input (input)=\"query.set($any($event.target).value)\". Display query() in one place (immediate) and deferredQuery() in another (deferred). So user sees immediate echo and deferred copy.", answer_keywords: ["input", "query", "immediate"], seed_code: `import { Component, signal, effect } from '@angular/core';

@Component({
  selector: 'app-deferred',
  standalone: true,
  template: \`
    <input (input)="query.set($any($event.target).value)" />
    <p>Immediate: {{ query() }}</p>
    <p>Deferred: {{ deferredQuery() }}</p>
  \`,
})
export class DeferredValueComponent {
  query = signal('');
  deferredQuery = signal('');
  constructor() {
    effect(() => {
      const q = this.query();
      setTimeout(() => this.deferredQuery.set(q), 0);
    });
  }
}`, feedback_correct: "✅ Immediate vs deferred display.", feedback_partial: "query().", feedback_wrong: "input", expected: "query() and deferredQuery() in template" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Use deferredQuery() to drive a heavy *ngFor (e.g. filter a large list). So typing stays smooth and list updates after a tick. Export the component.", answer_keywords: ["ngFor", "filter", "export"], seed_code: `import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

const ITEMS = Array.from({ length: 5000 }, (_, i) => 'Item ' + i);
@Component({
  selector: 'app-deferred',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <input (input)="query.set($any($event.target).value)" />
    <div *ngFor="let item of filtered()">{{ item }}</div>
  \`,
})
export class DeferredValueComponent {
  query = signal('');
  deferredQuery = signal('');
  filtered = () => ITEMS.filter(x => x.includes(this.deferredQuery()));
  constructor() {
    effect(() => {
      const q = this.query();
      setTimeout(() => this.deferredQuery.set(q), 0);
    });
  }
}`, feedback_correct: "✅ useDeferredValue (Angular) complete.", feedback_partial: "filtered.", feedback_wrong: "Export", expected: "Heavy list from deferredQuery and export" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 74, title: TITLE, shortName: "A — DEFERRED VALUE" });
