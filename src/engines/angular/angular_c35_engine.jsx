import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "useWindowSize (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #35 (Angular)", title: TITLE, body: "Track window innerWidth and innerHeight in Angular using a signal updated from a resize event listener on window; use NgZone or fromEvent and toSignal for a reactive approach.", usecase: "Angular uses fromEvent(window, 'resize') and toSignal or manual listener to expose window size as signals." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["width = signal(window.innerWidth); height = signal(window.innerHeight)", "Listen: window.addEventListener('resize', () => { width.set(window.innerWidth); height.set(window.innerHeight); })", "Clean up in ngOnDestroy or use fromEvent(window, 'resize').pipe(map(() => ({ w: window.innerWidth, h: window.innerHeight })), toSignal())", "Inject PLATFORM_ID and check isPlatformBrowser before using window"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with width = signal(window.innerWidth) and height = signal(window.innerHeight). Template: {{ width() }} x {{ height() }}.", answer_keywords: ["signal", "innerWidth", "innerHeight"], seed_code: `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-window-size',
  standalone: true,
  template: \`<p>{{ width() }} x {{ height() }}</p>\`,
})
export class WindowSizeComponent {
  width = signal(typeof window !== 'undefined' ? window.innerWidth : 0);
  height = signal(typeof window !== 'undefined' ? window.innerHeight : 0);
}`, feedback_correct: "✅ width/height signals.", feedback_partial: "innerWidth innerHeight.", feedback_wrong: "window.innerWidth", expected: "signal(window.innerWidth) and signal(window.innerHeight)" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "In ngOnInit add window.addEventListener('resize', this.onResize). onResize() { this.width.set(window.innerWidth); this.height.set(window.innerHeight); }. In ngOnDestroy remove the listener.", answer_keywords: ["addEventListener", "resize", "set"], seed_code: `import { Component, signal, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-window-size',
  standalone: true,
  template: \`<p>{{ width() }} x {{ height() }}</p>\`,
})
export class WindowSizeComponent implements OnInit, OnDestroy {
  width = signal(window.innerWidth);
  height = signal(window.innerHeight);
  private onResize = () => {
    this.width.set(window.innerWidth);
    this.height.set(window.innerHeight);
  };
  ngOnInit() { window.addEventListener('resize', this.onResize); }
  ngOnDestroy() { window.removeEventListener('resize', this.onResize); }
}`, feedback_correct: "✅ resize listener and cleanup.", feedback_partial: "addEventListener resize.", feedback_wrong: "onResize", expected: "addEventListener/removeEventListener and set width/height" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Use fromEvent(window, 'resize') and map to { w: window.innerWidth, h: window.innerHeight }, then toSignal. Derive width = size()?.w ?? 0 and height = size()?.h ?? 0 with a computed or second signal. Export the component.", answer_keywords: ["fromEvent", "toSignal", "map"], seed_code: `import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-window-size',
  standalone: true,
  template: \`<p>{{ width() }} x {{ height() }}</p>\`,
})
export class WindowSizeComponent {
  private size = toSignal(
    fromEvent(window, 'resize').pipe(map(() => ({ w: window.innerWidth, h: window.innerHeight })),
    { initialValue: { w: window.innerWidth, h: window.innerHeight } }
  );
  width = () => this.size()?.w ?? 0;
  height = () => this.size()?.h ?? 0;
}`, feedback_correct: "✅ useWindowSize (Angular) complete.", feedback_partial: "fromEvent.", feedback_wrong: "toSignal", expected: "fromEvent and toSignal or resize listener" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 35, title: TITLE, shortName: "A — WINDOW SIZE" });
