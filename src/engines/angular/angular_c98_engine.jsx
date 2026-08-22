import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Design Notification System (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #98 (Angular)", title: TITLE, body: "Design a notification system in Angular: a NotificationService with notifications signal and add(msg, type?), remove(id); a toast container component that injects the service and renders *ngFor with auto-dismiss or manual close; optional queue and max visible.", usecase: "Angular NotificationService and a global toast container component define the API for app-wide notifications." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["NotificationService: notifications = signal<Notification[]>([]); add(text, type?: 'info'|'error'); remove(id)", "Notification: { id: number; text: string; type?: string }", "ToastContainerComponent: *ngFor=\"n of notif.notifications()\"; (click) remove or setTimeout remove", "Optional: maxVisible; queue when full"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Define interface Notification { id: number; text: string; type?: 'info'|'error' }. NotificationService: notifications = signal<Notification[]>([]); add(text: string, type?: 'info'|'error') { this.notifications.update(n => [...n, { id: Date.now(), text, type }]); }; remove(id: number) { this.notifications.update(n => n.filter(x => x.id !== id)); }.", answer_keywords: ["Notification", "notifications", "add", "remove"], seed_code: `import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: number;
  text: string;
  type?: 'info' | 'error';
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  notifications = signal<Notification[]>([]);
  add(text: string, type?: 'info' | 'error') {
    this.notifications.update(n => [...n, { id: Date.now(), text, type }]);
  }
  remove(id: number) {
    this.notifications.update(n => n.filter(x => x.id !== id));
  }
}`, feedback_correct: "✅ NotificationService API.", feedback_partial: "add remove.", feedback_wrong: "notifications.update", expected: "notifications signal, add, remove" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Create ToastContainerComponent that injects NotificationService. Template: *ngFor=\"let n of notif.notifications()\" with {{ n.text }} and [class.error]=\"n.type === 'error'\". Add a close button (click)=\"notif.remove(n.id)\".", answer_keywords: ["ngFor", "notif.notifications", "remove"], seed_code: `import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from './notification.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div *ngFor="let n of notif.notifications()" [class.error]="n.type === 'error'">
      {{ n.text }} <button (click)="notif.remove(n.id)">Close</button>
    </div>
  \`,
})
export class ToastContainerComponent {
  notif = inject(NotificationService);
}`, feedback_correct: "✅ Toast container.", feedback_partial: "notif.remove.", feedback_wrong: "ToastContainerComponent", expected: "*ngFor and notif.remove(n.id)" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Add auto-dismiss: in add() use setTimeout(() => this.remove(id), 3000) and store the id. Optional: maxVisible = 3 and slice the list in template or in add. Export NotificationService and ToastContainerComponent.", answer_keywords: ["setTimeout", "auto-dismiss", "export"], seed_code: `@Injectable({ providedIn: 'root' })
export class NotificationService {
  notifications = signal<Notification[]>([]);
  add(text: string, type?: 'info' | 'error') {
    const id = Date.now();
    this.notifications.update(n => [...n, { id, text, type }]);
    setTimeout(() => this.remove(id), 3000);
  }
  remove(id: number) {
    this.notifications.update(n => n.filter(x => x.id !== id));
  }
}`, feedback_correct: "✅ Design Notification System (Angular) complete.", feedback_partial: "setTimeout.", feedback_wrong: "Export", expected: "Auto-dismiss and export" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 98, title: TITLE, shortName: "A — NOTIFICATION SYSTEM" });
