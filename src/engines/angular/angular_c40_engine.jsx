import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "useMediaQuery (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #40 (Angular)", title: TITLE, body: "React to media query matches in Angular using matchMedia(query).matches and a MediaQueryListListener to update a signal when the match state changes.", usecase: "Angular uses window.matchMedia and addEventListener('change') to expose media queries as signals for responsive UI." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["const mq = window.matchMedia('(min-width: 768px)'); isMatch = signal(mq.matches)", "mq.addEventListener('change', (e) => isMatch.set(e.matches)); remove in ngOnDestroy", "Or inject BreakpointObserver (Angular CDK) and use isMatched() with toSignal", "Use isMatch() in template for *ngIf or [class.mobile]"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with query = '(min-width: 768px)' and mq = window.matchMedia(query). isMatch = signal(mq.matches). Display {{ isMatch() ? 'Desktop' : 'Mobile' }}.", answer_keywords: ["matchMedia", "matches", "signal"], seed_code: `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-media-query',
  standalone: true,
  template: \`<p>{{ isMatch() ? 'Desktop' : 'Mobile' }}</p>\`,
})
export class MediaQueryComponent {
  private mq = typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)') : null;
  isMatch = signal(this.mq?.matches ?? false);
}`, feedback_correct: "✅ matchMedia and signal.", feedback_partial: "matchMedia.", feedback_wrong: "matchMedia", expected: "matchMedia(query) and signal(mq.matches)" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "In ngOnInit add mq.addEventListener('change', (e: MediaQueryListEvent) => this.isMatch.set(e.matches)). In ngOnDestroy remove the listener.", answer_keywords: ["addEventListener", "change", "e.matches"], seed_code: `import { Component, signal, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-media-query',
  standalone: true,
  template: \`<p>{{ isMatch() ? 'Desktop' : 'Mobile' }}</p>\`,
})
export class MediaQueryComponent implements OnInit, OnDestroy {
  private mq = window.matchMedia('(min-width: 768px)');
  isMatch = signal(this.mq.matches);
  private listener = (e: MediaQueryListEvent) => this.isMatch.set(e.matches);
  ngOnInit() { this.mq.addEventListener('change', this.listener); }
  ngOnDestroy() { this.mq.removeEventListener('change', this.listener); }
}`, feedback_correct: "✅ change listener.", feedback_partial: "change event.", feedback_wrong: "addEventListener change", expected: "addEventListener('change') and isMatch.set(e.matches)" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Use *ngIf=\"isMatch()\" to show desktop-only content and *ngIf=\"!isMatch()\" for mobile. Export the component.", answer_keywords: ["ngIf", "desktop", "export"], seed_code: `import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-media-query',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div *ngIf="isMatch()">Desktop layout</div>
    <div *ngIf="!isMatch()">Mobile layout</div>
  \`,
})
export class MediaQueryComponent implements OnInit, OnDestroy {
  private mq = window.matchMedia('(min-width: 768px)');
  isMatch = signal(this.mq.matches);
  private listener = (e: MediaQueryListEvent) => this.isMatch.set(e.matches);
  ngOnInit() { this.mq.addEventListener('change', this.listener); }
  ngOnDestroy() { this.mq.removeEventListener('change', this.listener); }
}`, feedback_correct: "✅ useMediaQuery (Angular) complete.", feedback_partial: "*ngIf layouts.", feedback_wrong: "Export", expected: "*ngIf for desktop/mobile and export" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 40, title: TITLE, shortName: "A — MEDIA QUERY" });
