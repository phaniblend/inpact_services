import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "useOnlineStatus (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #39 (Angular)", title: TITLE, body: "Track navigator.onLine in Angular with a signal updated from window 'online' and 'offline' events; use addEventListener in ngOnInit and cleanup in ngOnDestroy.", usecase: "Angular listens to window online/offline events to expose connectivity as a signal." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["isOnline = signal(navigator.onLine)", "window.addEventListener('online', () => isOnline.set(true)); addEventListener('offline', () => isOnline.set(false))", "Remove listeners in ngOnDestroy", "Optional: use fromEvent(window, 'online').pipe(map(() => true)) and merge with offline for toSignal"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with isOnline = signal(typeof navigator !== 'undefined' ? navigator.onLine : true). Template: {{ isOnline() ? 'Online' : 'Offline' }}.", answer_keywords: ["navigator.onLine", "signal"], seed_code: `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-online-status',
  standalone: true,
  template: \`<p>{{ isOnline() ? 'Online' : 'Offline' }}</p>\`,
})
export class OnlineStatusComponent {
  isOnline = signal(typeof navigator !== 'undefined' ? navigator.onLine : true);
}`, feedback_correct: "✅ isOnline signal.", feedback_partial: "navigator.onLine.", feedback_wrong: "navigator.onLine", expected: "signal(navigator.onLine)" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "In ngOnInit add window.addEventListener('online', () => this.isOnline.set(true)) and window.addEventListener('offline', () => this.isOnline.set(false)). In ngOnDestroy remove both listeners.", answer_keywords: ["online", "offline", "addEventListener"], seed_code: `import { Component, signal, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-online-status',
  standalone: true,
  template: \`<p>{{ isOnline() ? 'Online' : 'Offline' }}</p>\`,
})
export class OnlineStatusComponent implements OnInit, OnDestroy {
  isOnline = signal(navigator.onLine);
  private onOnline = () => this.isOnline.set(true);
  private onOffline = () => this.isOnline.set(false);
  ngOnInit() {
    window.addEventListener('online', this.onOnline);
    window.addEventListener('offline', this.onOffline);
  }
  ngOnDestroy() {
    window.removeEventListener('online', this.onOnline);
    window.removeEventListener('offline', this.onOffline);
  }
}`, feedback_correct: "✅ online/offline listeners.", feedback_partial: "addEventListener.", feedback_wrong: "online offline", expected: "addEventListener online/offline and set isOnline" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Use *ngIf=\"!isOnline()\" to show an offline banner. Export the component.", answer_keywords: ["ngIf", "offline", "export"], seed_code: `import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-online-status',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div *ngIf="!isOnline()" class="banner">You are offline</div>
    <p>{{ isOnline() ? 'Online' : 'Offline' }}</p>
  \`,
})
export class OnlineStatusComponent implements OnInit, OnDestroy {
  isOnline = signal(navigator.onLine);
  private onOnline = () => this.isOnline.set(true);
  private onOffline = () => this.isOnline.set(false);
  ngOnInit() {
    window.addEventListener('online', this.onOnline);
    window.addEventListener('offline', this.onOffline);
  }
  ngOnDestroy() {
    window.removeEventListener('online', this.onOnline);
    window.removeEventListener('offline', this.onOffline);
  }
}`, feedback_correct: "✅ useOnlineStatus (Angular) complete.", feedback_partial: "*ngIf.", feedback_wrong: "Export", expected: "*ngIf=\"!isOnline()\" and export" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 39, title: TITLE, shortName: "A — ONLINE STATUS" });
