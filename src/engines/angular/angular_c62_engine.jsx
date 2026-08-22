import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Infinite Scroll (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #62 (Angular)", title: TITLE, body: "Load more items when the user scrolls near the bottom: use HostListener or a directive that listens to scroll on a container, detect when scrollTop + clientHeight >= scrollHeight - threshold, then append to a signal list.", usecase: "Angular scroll listener and signal updates implement infinite scroll; CDK also has ScrollDispatcher." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["items = signal([]); loadMore() appends next page to items", "On scroll: get scrollTop, scrollHeight, clientHeight; if near bottom call loadMore()", "Use @HostListener('scroll', ['$event']) on the scroll container or use a directive with ElementRef", "Debounce or throttle loadMore to avoid duplicate requests"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with items = signal(Array.from({ length: 20 }, (_, i) => ({ id: i }))) and page = signal(1). Add loadMore() that does items.update(i => [...i, ...Array.from({ length: 20 }, (_, j) => ({ id: i.length + j }))]); page.update(p => p + 1).", answer_keywords: ["loadMore", "items.update", "page"], seed_code: `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-infinite',
  standalone: true,
  template: \`<div *ngFor="let item of items()">{{ item.id }}</div>\`,
})
export class InfiniteScrollComponent {
  items = signal(Array.from({ length: 20 }, (_, i) => ({ id: i })));
  page = signal(1);
  loadMore() {
    this.items.update(i => [...i, ...Array.from({ length: 20 }, (_, j) => ({ id: i.length + j }))]);
    this.page.update(p => p + 1);
  }
}`, feedback_correct: "✅ loadMore and items.", feedback_partial: "items.update.", feedback_wrong: "loadMore", expected: "loadMore and items.update with new items" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add a scrollable div with #scrollRef and (scroll)=\"onScroll($event)\". In onScroll: const el = $event.target as HTMLElement; if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) this.loadMore().", answer_keywords: ["scroll", "scrollTop", "scrollHeight"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-infinite',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div style="height: 300px; overflow-y: auto" (scroll)="onScroll($event)">
      <div *ngFor="let item of items()">{{ item.id }}</div>
    </div>
  \`,
})
export class InfiniteScrollComponent {
  items = signal(Array.from({ length: 20 }, (_, i) => ({ id: i })));
  page = signal(1);
  loadMore() {
    this.items.update(i => [...i, ...Array.from({ length: 20 }, (_, j) => ({ id: i.length + j }))]);
    this.page.update(p => p + 1);
  }
  onScroll(e: Event) {
    const el = e.target as HTMLElement;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) this.loadMore();
  }
}`, feedback_correct: "✅ onScroll and loadMore.", feedback_partial: "scroll.", feedback_wrong: "scrollHeight", expected: "(scroll) and scrollTop + clientHeight >= scrollHeight" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Add a loading = signal(false) and set it true before loadMore and false after (simulate async). Prevent double load by checking !loading() in onScroll. Export the component.", answer_keywords: ["loading", "async", "export"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-infinite',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div style="height: 300px; overflow-y: auto" (scroll)="onScroll($event)">
      <div *ngFor="let item of items()">{{ item.id }}</div>
      <p *ngIf="loading()">Loading...</p>
    </div>
  \`,
})
export class InfiniteScrollComponent {
  items = signal(Array.from({ length: 20 }, (_, i) => ({ id: i })));
  page = signal(1);
  loading = signal(false);
  loadMore() {
    if (this.loading()) return;
    this.loading.set(true);
    this.items.update(i => [...i, ...Array.from({ length: 20 }, (_, j) => ({ id: i.length + j }))]);
    this.page.update(p => p + 1);
    this.loading.set(false);
  }
  onScroll(e: Event) {
    const el = e.target as HTMLElement;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) this.loadMore();
  }
}`, feedback_correct: "✅ Infinite Scroll (Angular) complete.", feedback_partial: "loading.", feedback_wrong: "Export", expected: "loading signal and guard in loadMore" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 62, title: TITLE, shortName: "A — INFINITE SCROLL" });
